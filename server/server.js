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

// Services
const aiChatService = require('./services/aiChatService');
const contextualAIService = require('./services/contextualAIService');
const companyDataService = require('./services/companyDataService');
const databaseService = require('./services/databaseService');
const accompagnementService = require('./services/accompagnementService');
const authService = require('./services/authService');
const platformSettingsService = require('./services/platformSettingsService');
const chatService = require('./services/chatService');

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
const chatRoutes = require('./routes/chat');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware de sécurité - CSP désactivée pour éviter les blocages
app.use(helmet({
  contentSecurityPolicy: false
}));

// Configuration CORS optimisée pour beta.fusepoint.ch
const corsOptions = {
  origin: function (origin, callback) {
    if (!origin) return callback(null, true);
    
    const allowedOrigins = [
      'https://beta.fusepoint.ch',
      'http://localhost:5173',
      'http://localhost:8082',
      'http://172.20.10.2:5173'
    ];
    
    if (allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      console.log('❌ CORS blocked origin:', origin);
      callback(null, false);
    }
  },
  credentials: true,
  optionsSuccessStatus: 200
};

app.use(cors(corsOptions));
app.use(compression());
app.use(express.json());
app.use(morgan('combined'));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: 'Trop de requêtes depuis cette IP, réessayez plus tard.'
});
app.use('/api/', limiter);

// Configuration Google Analytics
const analytics = google.analyticsdata('v1beta');
const keyFilePath = process.env.GOOGLE_SERVICE_ACCOUNT_KEY_FILE || './config/service-account-key.json';
const auth = new google.auth.GoogleAuth({
  keyFile: keyFilePath,
  scopes: ['https://www.googleapis.com/auth/analytics.readonly']
});

// Middleware d'authentification
const authMiddleware = require('./middleware/auth');

// Initialiser la base de données
async function initializeDatabase() {
  try {
    await databaseService.initialize();
    console.log('✅ Base de données initialisée');
    
    await chatService.initialize();
    console.log('✅ Service de chat initialisé');
  } catch (error) {
    console.error('❌ Erreur initialisation:', error);
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
app.use('/api/chat', chatRoutes);

// Route chat IA principale
app.post('/api/chat/message', async (req, res) => {
  try {
    const { message, agentType, userId, companyId } = req.body;
    
    if (!message) {
      return res.status(400).json({ error: 'Message requis' });
    }

    let authenticatedUser = null;
    if (userId && companyId && req.headers.authorization) {
      try {
        const token = req.headers.authorization.replace('Bearer ', '');
        authenticatedUser = await authService.verifyToken(token);
        
        const userCompany = await databaseService.db.get(
          'SELECT * FROM user_companies WHERE user_id = ? AND company_id = ?',
          [authenticatedUser.id, companyId]
        );
        
        if (!userCompany) {
          return res.status(403).json({ error: 'Accès refusé à cette entreprise' });
        }
      } catch (authError) {
        console.log('⚠️ Mode démo:', authError.message);
      }
    }

    const aiResponse = await aiChatService.generateResponse(message, agentType, userId, companyId);
    
    const response = {
      content: aiResponse.text || aiResponse.content || "Désolé, je n'ai pas pu générer une réponse.",
      suggestions: aiResponse.suggestions || [],
      agent: aiResponse.agent || 'Agent IA',
      timestamp: aiResponse.timestamp || new Date().toISOString(),
      authenticated: !!authenticatedUser,
      userEmail: authenticatedUser?.email,
      insights: aiResponse.insights || [],
      metrics: aiResponse.metrics || {},
      contextual: aiResponse.contextual || false
    };
    
    res.json(response);
  } catch (error) {
    console.error('❌ Erreur chat:', error);
    res.status(500).json({ 
      error: 'Erreur lors de la génération de la réponse',
      details: error.message 
    });
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

// Documentation API
app.get('/api', (req, res) => {
  res.json({
    message: 'Fusepoint Platform API',
    version: '1.0.0',
    endpoints: {
      auth: '/api/auth',
      companies: '/api/companies',
      chat: '/api/chat',
      analytics: '/api/analytics',
      health: '/health'
    },
    documentation: 'https://beta.fusepoint.ch/api'
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

// Gestion globale des erreurs
app.use((error, req, res, next) => {
  console.error('❌ Erreur serveur:', error);
  res.status(500).json({
    error: 'Erreur interne du serveur',
    message: process.env.NODE_ENV === 'development' ? error.message : 'Une erreur est survenue'
  });
});

// Démarrage du serveur
initializeDatabase().then(() => {
  app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 Serveur Fusepoint démarré sur le port ${PORT}`);
    console.log(`🌐 Accessible sur https://beta.fusepoint.ch`);
    console.log(`📊 API Google Analytics proxy disponible`);
    console.log(`✅ Prêt à recevoir les connexions`);
  });
}).catch(error => {
  console.error('❌ Erreur fatale:', error);
  process.exit(1);
});