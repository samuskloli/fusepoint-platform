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

// Services
const aiChatService = require('./services/aiChatService');
const contextualAIService = require('./services/contextualAIService');
const companyDataService = require('./services/companyDataService');
const MariaDBService = require('./services/mariadbService');
const databaseService = new MariaDBService();
const accompagnementService = require('./services/accompagnementService');
const authService = require('./services/authService');
const platformSettingsService = require('./services/platformSettingsService');


// Routes
const authRoutes = require('./routes/auth');
const companyRoutes = require('./routes/companies');
const facebookRoutes = require('./routes/facebook');
const instagramRoutes = require('./routes/instagram');
const accompagnementRoutes = require('./routes/accompagnement');
const agentRoutes = require('./routes/agent');
const superAdminRoutes = require('./routes/superAdmin');
const prestataireRoutes = require('./routes/prestataire');
const platformSettingsBlocksRoutes = require('./routes/platformSettingsBlocks');
const clientRoutes = require('./routes/client');


const app = express();
const PORT = process.env.PORT || 3002;

// Middleware de sécurité - CSP désactivée pour éviter les blocages
app.use(helmet({
  contentSecurityPolicy: false
}));

// Configuration CORS optimisée pour production et développement
const corsOptions = {
  origin: function (origin, callback) {
    if (!origin) return callback(null, true);
    
    const allowedOrigins = [
      'https://beta.fusepoint.ch',
      'https://fusepoint.ch',
      'https://www.fusepoint.ch',
      'http://localhost:5173',
      'http://localhost:8080',
      'http://localhost:8082',
      'http://172.20.10.2:5173',
      'http://127.0.0.1:5173',
      'http://127.0.0.1:8080'
    ];
    
    if (allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      console.log('❌ CORS blocked origin:', origin);
      callback(null, false);
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept', 'Origin'],
  optionsSuccessStatus: 200
};

app.use(cors(corsOptions));
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
    console.log('✅ Base de données MariaDB initialisée');
    

  } catch (error) {
    console.error('❌ Erreur initialisation MariaDB:', error);
    process.exit(1);
  }
}

// Routes API
app.use('/api/auth', authRoutes);
app.use('/api/companies', companyRoutes);
app.use('/api/facebook', facebookRoutes);
app.use('/api/instagram', instagramRoutes);
app.use('/api/accompagnement', accompagnementRoutes);
app.use('/api/agent', agentRoutes);
app.use('/api/client', clientRoutes);
app.use('/api/prestataire', prestataireRoutes);
app.use('/api/super-admin', superAdminRoutes);
app.use('/api/super-admin', platformSettingsBlocksRoutes);


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
    const dbStatus = await databaseService.pool ? 'connected' : 'disconnected';
    
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

// Route de santé
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

// Route de monitoring système
app.get('/api/system/status', authMiddleware, async (req, res) => {
  try {
    const dbStatus = await databaseService.checkConnection();
    const memoryUsage = process.memoryUsage();
    const uptime = process.uptime();
    
    res.json({
      status: 'operational',
      timestamp: new Date().toISOString(),
      uptime: Math.floor(uptime),
      memory: {
        used: Math.round(memoryUsage.heapUsed / 1024 / 1024),
        total: Math.round(memoryUsage.heapTotal / 1024 / 1024),
        external: Math.round(memoryUsage.external / 1024 / 1024)
      },
      database: dbStatus,
      email: !!emailTransporter,
      environment: process.env.NODE_ENV || 'development',
      version: '2.0.0'
    });
  } catch (error) {
    console.error('❌ Erreur statut système:', error);
    res.status(500).json({ error: 'Erreur lors de la récupération du statut' });
  }
});

// Route de nettoyage des fichiers temporaires
app.post('/api/system/cleanup', authMiddleware, async (req, res) => {
  try {
    const uploadsDir = path.join(__dirname, '../uploads');
    const files = fs.readdirSync(uploadsDir);
    const now = Date.now();
    const maxAge = 7 * 24 * 60 * 60 * 1000; // 7 jours
    
    let deletedCount = 0;
    
    for (const file of files) {
      const filePath = path.join(uploadsDir, file);
      const stats = fs.statSync(filePath);
      
      if (now - stats.mtime.getTime() > maxAge) {
        fs.unlinkSync(filePath);
        deletedCount++;
      }
    }
    
    res.json({
      success: true,
      message: `${deletedCount} fichiers supprimés`,
      deletedCount
    });
  } catch (error) {
    console.error('❌ Erreur nettoyage:', error);
    res.status(500).json({ error: 'Erreur lors du nettoyage' });
  }
});

// Documentation API améliorée
app.get('/api', (req, res) => {
  res.json({
    message: 'Fusepoint Platform API',
    version: '2.0.0',
    description: 'API complète pour la plateforme marketing Fusepoint',
    endpoints: {
      authentication: {
        login: 'POST /api/auth/login',
        register: 'POST /api/auth/register',
        refresh: 'POST /api/auth/refresh',
        logout: 'POST /api/auth/logout'
      },
      companies: {
        list: 'GET /api/companies',
        create: 'POST /api/companies',
        update: 'PUT /api/companies/:id',
        delete: 'DELETE /api/companies/:id'
      },

      files: {
        upload: 'POST /api/upload',
        serve: 'GET /uploads/:filename'
      },
      email: {
        send: 'POST /api/email/send',
        test: 'POST /api/email/test'
      },
      system: {
        status: 'GET /api/system/status',
        cleanup: 'POST /api/system/cleanup',
        health: 'GET /health'
      },
      analytics: 'GET /api/analytics/*',
      social: {
        facebook: '/api/facebook/*',
        instagram: '/api/instagram/*'
      }
    },
    features: [
      'Authentification JWT',
      'Upload de fichiers avec optimisation',
      'Envoi d\'emails SMTP',
      'Chat IA contextuel',
      'Intégrations sociales',
      'Analytics Google',
      'Rate limiting',
      'Monitoring système'
    ],
    documentation: 'https://beta.fusepoint.ch/api',
    support: 'support@fusepoint.ch'
  });
});

// Servir les fichiers statiques du frontend
const frontendPath = path.join(__dirname, '../dist');
if (fs.existsSync(frontendPath)) {
  app.use(express.static(frontendPath));
  
  // Route catch-all pour SPA
  app.get('*', (req, res) => {
    res.sendFile(path.join(frontendPath, 'index.html'));
  });
}

// Middleware de gestion des erreurs 404
app.use((req, res, next) => {
  if (req.path.startsWith('/api/')) {
    res.status(404).json({
      error: 'Endpoint non trouvé',
      path: req.path,
      method: req.method,
      timestamp: new Date().toISOString()
    });
  } else {
    next();
  }
});

// Gestion globale des erreurs améliorée
app.use((error, req, res, next) => {
  console.error('❌ Erreur serveur:', {
    message: error.message,
    stack: error.stack,
    url: req.url,
    method: req.method,
    ip: req.ip,
    userAgent: req.get('User-Agent'),
    timestamp: new Date().toISOString()
  });

  // Erreurs spécifiques
  if (error.name === 'ValidationError') {
    return res.status(400).json({
      error: 'Erreur de validation',
      details: error.message
    });
  }

  if (error.name === 'UnauthorizedError') {
    return res.status(401).json({
      error: 'Non autorisé',
      message: 'Token invalide ou expiré'
    });
  }

  if (error.code === 'LIMIT_FILE_SIZE') {
    return res.status(413).json({
      error: 'Fichier trop volumineux',
      message: 'La taille du fichier dépasse la limite autorisée'
    });
  }

  if (error.code === 'SQLITE_BUSY') {
    return res.status(503).json({
      error: 'Base de données occupée',
      message: 'Veuillez réessayer dans quelques instants'
    });
  }

  // Erreur générique
  res.status(error.status || 500).json({
    error: 'Erreur interne du serveur',
    message: process.env.NODE_ENV === 'development' ? error.message : 'Une erreur est survenue',
    timestamp: new Date().toISOString(),
    requestId: req.headers['x-request-id'] || 'unknown'
  });
});

// Fonction de démarrage du serveur
async function startServer() {
  try {
    // Initialisation de la base de données
    await initializeDatabase();
    
    // Démarrage du serveur HTTP
    const server = app.listen(PORT, '0.0.0.0', () => {
      console.log('\n🚀 ===== FUSEPOINT PLATFORM API =====');
      console.log(`📅 Démarré le: ${new Date().toLocaleString('fr-FR')}`);
      console.log(`🌐 Port: ${PORT}`);
      console.log(`🔧 Environnement: ${process.env.NODE_ENV || 'development'}`);
      console.log(`💾 Base de données: MariaDB (initialisée)`);

      console.log(`📧 Service email: ${emailTransporter ? 'Configuré' : 'Non configuré'}`);
      console.log(`🔐 Authentification: JWT`);
      console.log(`📊 Analytics: Google Analytics proxy`);
      console.log(`🛡️ Sécurité: Helmet, CORS, Rate limiting`);
      console.log(`📁 Upload: Multer avec optimisation d'images`);
      console.log(`\n🌍 URLs disponibles:`);
      console.log(`   • API: http://localhost:${PORT}/api`);
      console.log(`   • Documentation: http://localhost:${PORT}/api`);
      console.log(`   • Santé: http://localhost:${PORT}/health`);
      console.log(`   • Production: https://beta.fusepoint.ch`);
      console.log(`\n✅ Serveur prêt à recevoir les connexions`);
      console.log('=====================================\n');
    });

    // Gestion propre de l'arrêt du serveur
    const gracefulShutdown = (signal) => {
      console.log(`\n🛑 Signal ${signal} reçu, arrêt en cours...`);
      
      server.close(async () => {
        console.log('🔌 Serveur HTTP fermé');
        
        try {
          // Fermer les connexions de base de données
          if (databaseService && databaseService.close) {
            await databaseService.close();
            console.log('💾 Base de données fermée');
          }
          
          // Fermer le transporteur email
          if (emailTransporter && emailTransporter.close) {
            emailTransporter.close();
            console.log('📧 Service email fermé');
          }
          
          console.log('✅ Arrêt propre terminé');
          process.exit(0);
        } catch (error) {
          console.error('❌ Erreur lors de l\'arrêt:', error);
          process.exit(1);
        }
      });
      
      // Forcer l'arrêt après 30 secondes
      setTimeout(() => {
        console.error('⏰ Timeout: arrêt forcé');
        process.exit(1);
      }, 30000);
    };

    // Écouter les signaux d'arrêt
    process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
    process.on('SIGINT', () => gracefulShutdown('SIGINT'));
    
    // Gestion des erreurs non capturées
    process.on('uncaughtException', (error) => {
      console.error('❌ Exception non capturée:', error);
      gracefulShutdown('uncaughtException');
    });
    
    process.on('unhandledRejection', (reason, promise) => {
      console.error('❌ Promesse rejetée non gérée:', reason);
      gracefulShutdown('unhandledRejection');
    });
    
  } catch (error) {
    console.error('❌ Erreur fatale lors du démarrage:', error);
    process.exit(1);
  }
}

// Démarrer le serveur
startServer();