require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const compression = require('compression');
const morgan = require('morgan');
const path = require('path');
const fs = require('fs');
const { google } = require('googleapis');
const { GoogleAuth } = require('google-auth-library');
const { BetaAnalyticsDataClient } = require('@google-analytics/data');
const nodemailer = require('nodemailer');
const multer = require('multer');
const sharp = require('sharp');
const debugRoutes = require('./routes/debugDb');

// Services
const aiChatService = require('./services/aiChatService');
const contextualAIService = require('./services/contextualAIService');
const companyDataService = require('./services/companyDataService');
const databaseService = require('./services/databaseService');
const accompagnementService = require('./services/accompagnementService');
const authService = require('./services/authService');
const PlatformSettingsService = require('./services/platformSettingsService');
const platformSettingsService = new PlatformSettingsService();
const linkpointsPublicRoutes = require('./routes/linkpointsPublic');

// Routes
const authRoutes = require('./routes/auth');
const companyRoutes = require('./routes/companies');
const facebookRoutes = require('./routes/facebook');
const instagramRoutes = require('./routes/instagram');
const accompagnementRoutes = require('./routes/accompagnement');
const agentRoutes = require('./routes/agent');
const superAdminRoutes = require('./routes/superAdmin');
const adminRoutes = require('./routes/admin');
const prestataireRoutes = require('./routes/prestataire');
const platformSettingsBlocksRoutes = require('./routes/platformSettingsBlocks');
const clientRoutes = require('./routes/client');
const projectTemplatesRoutes = require('./routes/projectTemplates');
const optimizedProjectConfigRoutes = require('./routes/optimizedProjectConfig');
const clientWidgetConfigsRoutes = require('./routes/clientWidgetConfigs');
const widgetsRoutes = require('./routes/widgets');
const multiTenantWidgetsRoutes = require('./routes/multiTenantWidgets');
const filesRoutes = require('./routes/files');
const thumbnailsRoutes = require('./routes/thumbnails');
const projectDashboardRoutes = require('./routes/projectDashboard');
const projectFilesRoutes = require('./routes/projectFiles');
const projectTasksRoutes = require('./routes/projectTasks');
const projectWidgetsRoutes = require('./routes/projectWidgets');
const linkpointsRoutes = require('./routes/linkpoints');
const pushRoutes = require('./routes/push');
const geoService = require('./services/geoService');
const backupSvc = require('./services/linkpointBackup');
const fallbackStats = require('./services/fallbackStats');

const app = express();
app.set('etag', 'strong');
// Assurer que req.protocol reflète X-Forwarded-Proto en prod derrière proxy
app.set('trust proxy', true);
const PORT = process.env.PORT || 3000;

// Middleware de sécurité - CSP désactivée pour éviter les blocages
app.use(helmet({
  contentSecurityPolicy: false
}));

// Configuration CORS optimisée pour production et développement
// Liste d'origines autorisées depuis l'env, avec valeurs par défaut pour dev et prod
const defaultOrigins = 'https://beta.fusepoint.ch,https://fusepoint.ch,https://www.fusepoint.ch,http://localhost:5174,http://127.0.0.1:5174,http://localhost:5175,http://127.0.0.1:5175,http://localhost:5176,http://127.0.0.1:5176,http://localhost:5173,http://127.0.0.1:5173,http://localhost:3000,http://127.0.0.1:3000,http://localhost:3001,http://127.0.0.1:3001,http://localhost:3002,http://127.0.0.1:3002,http://localhost:3004,http://127.0.0.1:3004'
  .split(',')
  .map(s => s.trim())
  .filter(Boolean);

const envOrigins = (process.env.ALLOWED_ORIGINS || '')
  .split(',')
  .map(s => s.trim())
  .filter(Boolean);

const allowedOrigins = Array.from(new Set([...defaultOrigins, ...envOrigins]));

// DEBUG: afficher les origines autorisées et l'environnement
console.log('🔎 ALLOWED_ORIGINS (env):', process.env.ALLOWED_ORIGINS);
console.log('🔎 allowedOrigins (liste):', allowedOrigins);

const corsOptions = {
  origin(origin, callback) {
    if (!origin) return callback(null, true);
    if (allowedOrigins.includes(origin)) return callback(null, true);

    // Autoriser automatiquement les IP locales en développement (10.x, 192.168.x, 172.16-31.x)
    if (process.env.NODE_ENV !== 'production') {
      const lanOriginRegex = /^https?:\/\/(localhost|127\.0\.0\.1|10\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}|192\.168\.[0-9]{1,3}\.[0-9]{1,3}|172\.(1[6-9]|2[0-9]|3[0-1])\.[0-9]{1,3}\.[0-9]{1,3}):[0-9]{2,5}$/;
      if (lanOriginRegex.test(origin)) {
        return callback(null, true);
      }
    }

    console.log('❌ CORS blocked origin:', origin);
    return callback(new Error('Not allowed by CORS'));
  },
  credentials: true,
  methods: ['GET', 'HEAD', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept', 'Origin', 'Cache-Control', 'Pragma', 'Expires', 'If-Match', 'If-None-Match'],
  exposedHeaders: ['Cache-Control', 'ETag', 'Content-Type', 'X-Thumbnail-Available'],
  optionsSuccessStatus: 200
};

app.use(cors(corsOptions));
app.options('*', cors(corsOptions));
app.use(compression());
app.use(express.json());
app.use(morgan('combined'));

// Rate limiting avec configuration avancée
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: process.env.NODE_ENV === 'production' ? 100 : 1000, // 1000 requêtes en dev, 100 en prod
  message: {
    error: 'Trop de requêtes depuis cette IP',
    retryAfter: '15 minutes'
  },
  standardHeaders: true,
  legacyHeaders: false,
  skip: (req) => {
    // Exclure les routes de santé du rate limiting
    return req.path === '/health' || req.path === '/api/health';
  }
});

// Rate limiting spécifique pour l'authentification
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: process.env.NODE_ENV === 'production' ? 5 : 50, // 50 tentatives en dev, 5 en prod
  message: {
    error: 'Trop de tentatives de connexion',
    retryAfter: '15 minutes'
  }
});

// Rate limiting temporairement désactivé pour debug
// app.use('/api/', limiter);
// app.use('/api/auth/login', authLimiter);

// Configuration Google Analytics
const analytics = google.analyticsdata('v1beta');
const keyFilePath = process.env.GOOGLE_SERVICE_ACCOUNT_KEY_FILE || './config/service-account-key.json';
const auth = new google.auth.GoogleAuth({
  keyFile: keyFilePath,
  scopes: ['https://www.googleapis.com/auth/analytics.readonly']
});

// Configuration SMTP pour les emails
let emailTransporter = null;
if (process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS) {
  emailTransporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: process.env.SMTP_PORT || 587,
    secure: process.env.SMTP_SECURE === 'true',
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS
    },
    tls: {
      rejectUnauthorized: false
    }
  });
  console.log('✅ Configuration SMTP initialisée');
} else {
  console.log('⚠️ Aucune configuration SMTP trouvée');
}

// Configuration Multer pour l'upload de fichiers
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadPath = path.join(__dirname, '../uploads');
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath, { recursive: true });
    }
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif|pdf|doc|docx|xls|xlsx/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);
    
    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error('Type de fichier non autorisé'));
    }
  }
});

// Middleware d'authentification
const authMiddleware = require('./middleware/auth');

// Middleware de logging avancé
app.use((req, res, next) => {
  const start = Date.now();
  
  // Log spécifique pour assign-agent
  if (req.path.includes('assign-agent')) {
    console.log('🔍 MIDDLEWARE GLOBAL - Requête assign-agent détectée:');
    console.log('🔍 Method:', req.method);
    console.log('🔍 Path:', req.path);
    console.log('🔍 Body:', req.body);
    console.log('🔍 Headers:', req.headers);
  }
  
  res.on('finish', () => {
    const duration = Date.now() - start;
    if (duration > 1000) { // Log des requêtes lentes
      console.log(`🐌 Requête lente: ${req.method} ${req.path} - ${duration}ms`);
    }
  });
  next();
});

// Middleware de sécurité supplémentaire
app.use((req, res, next) => {
  // Headers de sécurité supplémentaires
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  next();
});

// Initialiser la base de données
async function initializeDatabase() {
  try {
    await databaseService.initialize();
    console.log('✅ Base de données initialisée');
    

  } catch (error) {
    console.error('❌ Erreur initialisation:', error);
    process.exit(1);
  }
}

// Configuration des routes
// Routes publiques (sans authentification)
app.use('/api/auth', authRoutes);
app.use('/api/linkpoints/public', linkpointsPublicRoutes);

// Middleware d'authentification global pour toutes les autres routes API (sauf /api/auth et GET /api/files/signed)
app.use('/api', (req, res, next) => {
  // Laisser passer les préflights CORS
  if (req.method === 'OPTIONS') {
    return next();
  }
  // Exclure les routes d'authentification (gère req.path et req.originalUrl)
  const urlPath = (req.path || req.originalUrl || '');
  if (urlPath.startsWith('/auth') || urlPath.startsWith('/api/auth')) {
    return next();
  }
  // Exclure UNIQUEMENT la consommation GET des URL signées
  if (req.method === 'GET' && req.path.startsWith('/files/signed')) {
    return next();
  }
  // Exclure la génération de QR publique pour LinkPoints
  if (req.method === 'GET' && /^\/linkpoints\/\d+\/qr$/.test(req.path)) {
    return next();
  }
  // Appliquer le middleware d'authentification pour toutes les autres routes
  return authMiddleware(req, res, next);
});

// Routes protégées (avec authentification)
app.use('/api/companies', companyRoutes);
app.use('/api/facebook', facebookRoutes);
app.use('/api/instagram', instagramRoutes);
app.use('/api/accompagnement', accompagnementRoutes);
app.use('/api/agent', agentRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/client', clientRoutes);
app.use('/api/prestataire', prestataireRoutes);
app.use('/api/super-admin', superAdminRoutes);
app.use('/api/super-admin', platformSettingsBlocksRoutes);
app.use('/api/project-templates', projectTemplatesRoutes);
app.use('/api/projects', optimizedProjectConfigRoutes);
app.use('/projects', optimizedProjectConfigRoutes);
app.use('/api/projects', projectDashboardRoutes);
app.use('/api/projects', projectFilesRoutes);
app.use('/api/projects', projectTasksRoutes);
app.use('/api/projects', projectWidgetsRoutes);
app.use('/api/client-widget-configs', clientWidgetConfigsRoutes);
app.use('/api/widgets', widgetsRoutes);
app.use('/api/agent/widgets', widgetsRoutes);
app.use('/api/clients', multiTenantWidgetsRoutes);
app.use('/api/files', filesRoutes);
app.use('/api/thumbnails', thumbnailsRoutes);
app.use('/api/linkpoints', linkpointsRoutes);
app.use('/api/push', pushRoutes);
app.use('/api/debug', debugRoutes);


// Route d'upload de fichiers
app.post('/api/upload', authMiddleware, upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'Aucun fichier fourni' });
    }

    // Optimiser les images si nécessaire
    if (req.file.mimetype.startsWith('image/')) {
      const optimizedPath = req.file.path.replace(path.extname(req.file.path), '_optimized' + path.extname(req.file.path));
      
      await sharp(req.file.path)
        .resize(1920, 1080, { fit: 'inside', withoutEnlargement: true })
        .jpeg({ quality: 85 })
        .toFile(optimizedPath);
      
      // Remplacer le fichier original par la version optimisée
      fs.unlinkSync(req.file.path);
      fs.renameSync(optimizedPath, req.file.path);
    }

    res.json({
      success: true,
      file: {
        filename: req.file.filename,
        originalname: req.file.originalname,
        mimetype: req.file.mimetype,
        size: req.file.size,
        path: `/uploads/${req.file.filename}`
      }
    });
  } catch (error) {
    console.error('❌ Erreur upload:', error);
    res.status(500).json({ error: 'Erreur lors de l\'upload du fichier' });
  }
});

// Route d'envoi d'email
app.post('/api/email/send', authMiddleware, async (req, res) => {
  try {
    if (!emailTransporter) {
      return res.status(503).json({ error: 'Service email non configuré' });
    }

    const { to, subject, text, html, attachments } = req.body;

    if (!to || !subject || (!text && !html)) {
      return res.status(400).json({ error: 'Paramètres email manquants' });
    }

    const mailOptions = {
      from: process.env.SMTP_FROM || process.env.SMTP_USER,
      to,
      subject,
      text,
      html,
      attachments
    };

    const info = await emailTransporter.sendMail(mailOptions);
    
    res.json({
      success: true,
      messageId: info.messageId,
      message: 'Email envoyé avec succès'
    });
  } catch (error) {
    console.error('❌ Erreur envoi email:', error);
    res.status(500).json({ error: 'Erreur lors de l\'envoi de l\'email' });
  }
});

// Route de test email
app.post('/api/email/test', authMiddleware, async (req, res) => {
  try {
    if (!emailTransporter) {
      return res.status(503).json({ error: 'Service email non configuré' });
    }

    await emailTransporter.verify();
    res.json({ success: true, message: 'Configuration email valide' });
  } catch (error) {
    console.error('❌ Erreur test email:', error);
    res.status(500).json({ error: 'Configuration email invalide', details: error.message });
  }
});



// Routes Analytics
app.post('/api/analytics/test-connection', authMiddleware, async (req, res) => {
  try {
    const { propertyId } = req.body;
    if (!propertyId) {
      return res.status(400).json({ error: 'ID de propriété requis' });
    }
    
    const authClient = await auth.getClient();
    const response = await analytics.properties.getMetadata({
      auth: authClient,
      name: `properties/${propertyId}/metadata`
    });
    
    res.json({ 
      success: true, 
      message: 'Connexion réussie',
      propertyName: response.data.name
    });
  } catch (error) {
    console.error('Erreur test connexion:', error);
    let errorMessage = 'Erreur de connexion';
    let statusCode = 500;
    
    if (error.code === 404) {
      errorMessage = 'Propriété GA4 introuvable';
      statusCode = 404;
    } else if (error.code === 403) {
      errorMessage = 'Accès refusé';
      statusCode = 403;
    }
    
    res.status(statusCode).json({ error: errorMessage });
  }
});

// Route statut IA
app.get('/api/ai/status', async (req, res) => {
  try {
    const dbStatus = await databaseService.checkConnection();
    
    res.json({
      status: 'active',
      services: {
        openai: aiChatService.isOpenAIConfigured,
        contextual: true,
        analytics: true,
        database: dbStatus,
        authentication: true
      },
      model: process.env.OPENAI_MODEL || 'gpt-3.5-turbo',
      isConfigured: aiChatService.isOpenAIConfigured,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('❌ Erreur statut:', error);
    res.status(500).json({
      status: 'error',
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

// Santé
app.get('/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    service: 'Fusepoint Platform API'
  });
});

// Route temporaire pour /login (en attendant le build du frontend)
app.get('/login', (req, res) => {
  res.send(`
    <!DOCTYPE html>
    <html>
    <head>
      <title>Fusepoint - Connexion</title>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1">
      <style>
        body { font-family: Arial, sans-serif; margin: 0; padding: 20px; background: #f5f5f5; }
        .container { max-width: 400px; margin: 50px auto; background: white; padding: 30px; border-radius: 8px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
        h1 { text-align: center; color: #333; margin-bottom: 30px; }
        .form-group { margin-bottom: 20px; }
        label { display: block; margin-bottom: 5px; color: #555; }
        input { width: 100%; padding: 10px; border: 1px solid #ddd; border-radius: 4px; box-sizing: border-box; }
        button { width: 100%; padding: 12px; background: #007bff; color: white; border: none; border-radius: 4px; cursor: pointer; font-size: 16px; }
        button:hover { background: #0056b3; }
        .info { text-align: center; margin-top: 20px; color: #666; font-size: 14px; }
      </style>
    </head>
    <body>
      <div class="container">
        <h1>🚀 Fusepoint</h1>
        <form action="/api/auth/login" method="post">
          <div class="form-group">
            <label for="email">Email:</label>
            <input type="email" id="email" name="email" required>
          </div>
          <div class="form-group">
            <label for="password">Mot de passe:</label>
            <input type="password" id="password" name="password" required>
          </div>
          <button type="submit">Se connecter</button>
        </form>
        <div class="info">
          <p>Interface temporaire - Le frontend sera disponible après compilation</p>
          <p><a href="/api">Documentation API</a> | <a href="/health">Statut du serveur</a></p>
        </div>
      </div>
    </body>
    </html>
  `);
});

// Route de servir les fichiers uploadés
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Redirection publique traquée (QR dynamique)
app.get('/r/:slug', async (req, res) => {
  const { slug } = req.params;
  try {
    const lp = await databaseService.get(
      'SELECT id, type, external_url, company_id FROM linkpoints WHERE slug=? AND archived=0',
      [slug]
    );
    if (!lp) return res.status(404).send('Introuvable');

    // Si external, redirection immédiate
    if (lp.type === 'external' && lp.external_url) {
      const normalized = normalizeUrl(lp.external_url);
      res.setHeader('Cache-Control', 'no-store');
      return res.redirect(302, normalized);
    }

    // Déterminer si l’entreprise est payante
    let isPaid = false;
    try {
      if (lp.company_id) {
        const setting = await platformSettingsService.getSetting(`company_paid_${lp.company_id}`);
        const val = setting?.value;
        isPaid = val === 'true' || val === '1' || val === 'yes' || val === 'on';
      }
    } catch (e) {
      // non bloquant
    }

    // Sinon, rediriger vers la page publique /l/:slug (frontend ou fallback serveur)
    let origin = `${req.protocol}://${req.get('host')}`;
    const devPublic = (process.env.DEV_PUBLIC_URL || process.env.FRONTEND_URL || '').trim();
    if (process.env.NODE_ENV !== 'production' && devPublic && /^https?:\/\//.test(devPublic)) {
      origin = devPublic.replace(/\/+$/, '');
    }
    // Conserver uniquement les paramètres de requête (ne pas exposer d’indicateurs internes)
    const qs = new URLSearchParams(req.query || {});
    const suffix = qs.toString() ? `?${qs.toString()}` : '';

    // Poser cookie fp_paid pour détection early côté frontend
    const cookieOpts = { path: '/', httpOnly: false, sameSite: 'lax', secure: process.env.NODE_ENV === 'production', maxAge: 24 * 60 * 60 * 1000 };
    if (isPaid) {
      try { res.cookie('fp_paid', '1', cookieOpts); } catch {}
    } else {
      try { res.clearCookie('fp_paid', { path: '/' }); } catch {}
    }

    res.setHeader('Cache-Control', 'no-store');
    return res.redirect(302, `${origin}/l/${slug}${suffix}`);
  } catch (e) {
    console.error('GET /r/:slug error', e);
    res.status(500).send('Erreur serveur');
  }
});

// ===== Nouveau: endpoint public /l/:slug avec fallback local =====
app.get('/l/:slug', async (req, res) => {
  const { slug } = req.params;
  const ip = (req.headers['x-forwarded-for'] || req.socket.remoteAddress || '').toString();
  const ua = req.headers['user-agent'] || '';
  const ref = req.headers['referer'] || '';
  const normalizeUrl = (u) => {
    if (!u) return u;
    const t = u.trim();
    if (/^https?:\/\//i.test(t)) return t;
    if (t.startsWith('//')) return 'https:' + t;
    return 'https://' + t;
  };

  let fromDb = null;
  let dbErr = null;
  try {
    const lp = await databaseService.get(
      'SELECT id, name, type, slug, logo_url, theme, external_url, updated_at FROM linkpoints WHERE slug=? AND archived=0',
      [slug]
    );
    if (lp) {
      const links = await databaseService.query(
        'SELECT label, url, sort_order FROM linkpoint_links WHERE linkpoint_id=? ORDER BY sort_order ASC, id ASC',
        [lp.id]
      );
      const updatedAt = new Date(lp.updated_at || Date.now()).toISOString();
      let type = 'generated_page';
      let destination = null;
      if (lp.type === 'external' && lp.external_url) {
        type = 'external_url';
        destination = { url: lp.external_url };
      } else if (Array.isArray(links) && links.length > 0) {
        type = 'links_hub';
        destination = links.map(l => ({ label: l.label, url: l.url }));
      } else {
        type = 'generated_page';
        destination = { title: lp.name || lp.slug };
      }
      const publicOptions = {
        logo_url: lp.logo_url || null,
        theme: lp.theme || null,
        title: lp.name || lp.slug,
        labels: { primary: 'Ouvrir', secondary: 'Voir plus' }
      };
      fromDb = { slug, type, destination, publicOptions, updatedAt };
    }
  } catch (e) {
    dbErr = e;
  }

  const fromBackup = backupSvc.read(slug);

  // Choisir la source la plus fraîche
  let chosen = null;
  let mode = 'fallback_local';
  if (fromDb && fromBackup) {
    const a = new Date(fromDb.updatedAt || 0).getTime();
    const b = new Date(fromBackup.updatedAt || 0).getTime();
    if (a >= b) { chosen = fromDb; mode = 'primary'; } else { chosen = fromBackup; mode = 'fallback_local'; }
  } else if (fromDb) { chosen = fromDb; mode = 'primary'; } else if (fromBackup) { chosen = fromBackup; mode = 'fallback_local'; }

  console.info(`[LP] /l/${slug} mode=${mode}${dbErr ? ' db_error' : ''}`);

  if (!chosen) {
    return res.status(404).send('LinkPoint introuvable');
  }

  // Tracking minimal en mode fallback
  if (mode === 'fallback_local') {
    fallbackStats.recordScan(slug, { ip, ua, ref });
  }

  if (chosen.type === 'external_url' && chosen.destination?.url) {
    const target = normalizeUrl(chosen.destination.url);
    if (mode === 'fallback_local') {
      // Enregistrer aussi click fallback pour redirection externe directe
      fallbackStats.recordClick(slug, { url: target, ip, ua, ref });
    }
    res.setHeader('Cache-Control', 'no-store');
    return res.redirect(302, target);
  }

  // Rendre une page minimale
  const themeBg = (chosen.publicOptions?.theme && chosen.publicOptions.theme.bg) || '#f7f7f7';
  const themePrimary = (chosen.publicOptions?.theme && chosen.publicOptions.theme.primary) || '#0b5fff';
  const logoUrl = chosen.publicOptions?.logo_url || '';
  const title = chosen.publicOptions?.title || slug;
  const btnLabel = (chosen.publicOptions?.labels && chosen.publicOptions.labels.primary) || 'Ouvrir';
  const links = Array.isArray(chosen.destination) ? chosen.destination : [];

  res.setHeader('Content-Type', 'text/html; charset=utf-8');
  res.send(`<!doctype html>
<html lang="fr">
<head>
  <meta charset="utf-8"/>
  <meta name="viewport" content="width=device-width, initial-scale=1"/>
  <title>${title}</title>
  <style>
    :root { --bg: ${themeBg}; --primary: ${themePrimary}; }
    body { font-family: system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial, sans-serif; margin: 0; padding: 20px; background: var(--bg); color: #222; }
    .wrap { max-width: 560px; margin: 0 auto; background: #fff; padding: 24px; border-radius: 12px; box-shadow: 0 4px 12px rgba(0,0,0,0.08); }
    .logo { text-align: center; margin-bottom: 16px; }
    .logo img { max-width: 120px; }
    .title { font-size: 20px; font-weight: 600; text-align: center; margin: 8px 0 16px; }
    .btn { display: block; padding: 14px 16px; margin: 10px 0; text-align: center; background: var(--primary); color: #fff; text-decoration: none; border-radius: 10px; }
  </style>
</head>
<body>
  <div class="wrap">
    ${logoUrl ? `<div class="logo"><img src="${logoUrl}" alt=""/></div>` : ''}
    <div class="title">${title}</div>
    ${links.length === 0 ? `<p style="text-align:center;">Aucun lien disponible.</p>` : links.map(l => {
      const url = normalizeUrl(l.url);
      const href = `/l/${slug}/click?url=` + encodeURIComponent(url);
      return `<a class="btn" href="${href}">${l.label || btnLabel}</a>`;
    }).join('')}
  </div>
</body>
</html>`);
});

// Click en mode fallback (enregistre et redirige)
app.get('/l/:slug/click', async (req, res) => {
  const { slug } = req.params;
  const urlParam = (req.query.url || '').toString();
  const ip = (req.headers['x-forwarded-for'] || req.socket.remoteAddress || '').toString();
  const ua = req.headers['user-agent'] || '';
  const ref = req.headers['referer'] || '';
  const normalizeUrl = (u) => {
    if (!u) return u;
    const t = u.trim();
    if (/^https?:\/\//i.test(t)) return t;
    if (t.startsWith('//')) return 'https:' + t;
    return 'https://' + t;
  };
  const target = normalizeUrl(urlParam);
  if (!target) return res.status(400).send('URL manquante');
  try {
    fallbackStats.recordClick(slug, { url: target, ip, ua, ref });
  } catch {}
  res.setHeader('Cache-Control', 'no-store');
  return res.redirect(302, target);
});

// Route de monitoring système
app.get('/api/system/status', authMiddleware, async (req, res) => {
  try {
    const status = await platformSettingsService.getSystemStatus();
    res.json({ success: true, status });
  } catch (error) {
    console.error('❌ Erreur statut système:', error);
    res.status(500).json({ error: 'Erreur lors de la récupération du statut système' });
  }
});

// Route de nettoyage des fichiers temporaires
app.post('/api/system/cleanup', authMiddleware, async (req, res) => {
  try {
    await authService.cleanupExpiredSessions();
    res.json({ success: true, message: 'Nettoyage effectué' });
  } catch (error) {
    console.error('❌ Erreur nettoyage système:', error);
    res.status(500).json({ error: 'Erreur lors du nettoyage du système' });
  }
});

// Middleware de gestion d'erreurs global
app.use((err, req, res, next) => {
  const status = err.status || err.statusCode || 500;
  const message = err.message || (status === 403 ? 'Accès refusé' : status === 404 ? 'Ressource non trouvée' : 'Erreur interne du serveur');
  const payload = {
    success: false,
    message,
  };
  if (err.code) payload.code = err.code;
  if (process.env.NODE_ENV === 'development' && err.stack) payload.stack = err.stack;
  res.status(status).json(payload);
});

// Route 404 globale
app.use('*', (req, res) => {
  res.status(404).json({ success: false, message: 'Route non trouvée', path: req.originalUrl });
});

// Démarrage du serveur
initializeDatabase().then(() => {
  app.listen(PORT, () => {
    console.log('\n🚀 ===== FUSEPOINT PLATFORM API =====');
    console.log(`📅 Démarré le: ${new Date().toLocaleString('fr-FR')}`);
    console.log(`🌐 Port: ${PORT}`);
    console.log(`🔧 Environnement: ${process.env.NODE_ENV} | Node ${process.version} | PID ${process.pid}`);
    console.log('💾 Base de données: MariaDB (initialisée)');
    console.log(`📧 Service email: ${emailTransporter ? 'Configuré' : 'Non configuré'}`);
    if (emailTransporter) {
      console.log(`   • SMTP: host=${process.env.SMTP_HOST}, port=${process.env.SMTP_PORT || 587}, secure=${process.env.SMTP_SECURE === 'true'}, user=${process.env.SMTP_USER}, from=${process.env.SMTP_FROM || process.env.SMTP_USER}`);
    }
    console.log('🔐 Authentification: JWT');
    console.log('📊 Analytics: Google Analytics proxy');
    console.log('🛡️ Sécurité: Helmet, CORS, Rate limiting');
    console.log('📁 Upload: Multer avec optimisation d\'images');

    console.log('\n🌍 URLs disponibles:');
    console.log('   • API: http://localhost:' + PORT + '/api');
    console.log('   • Documentation: http://localhost:' + PORT + '/api');
    console.log('   • Santé: http://localhost:' + PORT + '/health');
    console.log('   • Production: https://beta.fusepoint.ch');

    console.log('\n✅ Serveur prêt à recevoir les connexions');
    console.log('=====================================\n');

    if (emailTransporter) {
      emailTransporter.verify()
        .then(() => console.log('📧 SMTP: connexion vérifiée'))
        .catch((err) => console.log('⚠️ SMTP: vérification échouée:', err && err.message ? err.message : 'inconnue'));
    }
  });
});

// Route /r dupliquée supprimée (fusionnée avec le handler principal plus haut)
(async () => {
  try {
    await geoService.initMaxMind();
  } catch (e) {
    console.warn('GeoService init warning:', e.message);
  }
})();