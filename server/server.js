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
const aiChatService = require('./services/aiChatService');
const contextualAIService = require('./services/contextualAIService');
const companyDataService = require('./services/companyDataService');
const databaseService = require('./services/databaseService');
const accompagnementService = require('./services/accompagnementService');
const authService = require('./services/authService');
const platformSettingsService = require('./services/platformSettingsService');
const chatService = require('./services/chatService');

// Debug: vérifier le service importé
console.log('🔍 Debug platformSettingsService importé:', {
  isObject: typeof platformSettingsService === 'object',
  constructor: platformSettingsService.constructor?.name,
  hasGetPlatformStats: typeof platformSettingsService.getPlatformStats === 'function',
  hasGetAllSettings: typeof platformSettingsService.getAllSettings === 'function',
  methods: Object.getOwnPropertyNames(Object.getPrototypeOf(platformSettingsService)).filter(name => typeof platformSettingsService[name] === 'function')
});

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

// Middleware de sécurité
app.use(helmet());

// Configuration CORS
const corsOptions = {
  origin: function (origin, callback) {
    // Permettre les requêtes sans origin (mobile apps, etc.)
    if (!origin) return callback(null, true);
    
    const allowedOrigins = process.env.CORS_ORIGIN ? 
      process.env.CORS_ORIGIN.split(',').map(url => url.trim()) : 
      ['http://localhost:5173', 'http://localhost:8082', 'http://172.20.10.2:5173'];
    
    if (allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      console.log('❌ CORS blocked origin:', origin);
      console.log('✅ Allowed origins:', allowedOrigins);
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  optionsSuccessStatus: 200
};

app.use(cors(corsOptions));
app.use(express.json());

// Initialiser la base de données au démarrage
async function initializeDatabase() {
  try {
    await databaseService.initialize();
    console.log('✅ Base de données principale initialisée avec succès');
    
    // Le service de paramètres de plateforme s'initialise automatiquement dans son constructeur
    console.log('✅ Service de paramètres de plateforme prêt');
    
    // Le service d'accompagnement s'initialise automatiquement dans son constructeur
    console.log('✅ Service d\'accompagnement prêt');
    
    // Initialiser le service de chat
    await chatService.initialize();
    console.log('✅ Service de chat initialisé');
  } catch (error) {
    console.error('❌ Erreur initialisation base de données:', error);
    process.exit(1);
  }
}

// Initialiser la base de données de manière asynchrone
initializeDatabase().then(() => {
  console.log('🎯 Initialisation terminée, serveur prêt');
  
  // Démarrer le serveur seulement après l'initialisation
  app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 Serveur démarré sur le port ${PORT}`);
    console.log(`📊 API Google Analytics proxy disponible`);
    console.log(`🌐 Accessible sur http://localhost:${PORT}`);
  });
}).catch(error => {
  console.error('❌ Erreur fatale lors de l\'initialisation:', error);
  process.exit(1);
});

// Middleware de logging pour le débogage
app.use((req, res, next) => {
  const timestamp = new Date().toISOString();
  console.log(`[${timestamp}] ${req.method} ${req.path} - IP: ${req.ip}`);
  
  // Log des headers d'authentification (sans révéler le token)
  if (req.headers.authorization) {
    console.log(`[${timestamp}] Auth header présent: ${req.headers.authorization.substring(0, 20)}...`);
  }
  
  next();
});

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limite chaque IP à 100 requêtes par fenêtre
  message: 'Trop de requêtes depuis cette IP, réessayez plus tard.'
});
app.use('/api/', limiter);

// Configuration Google Analytics
const analytics = google.analyticsdata('v1beta');

// Authentification avec Service Account
const keyFilePath = process.env.GOOGLE_SERVICE_ACCOUNT_KEY_FILE || './config/service-account-key.json';
console.log(`🔑 Chargement du fichier de clés: ${keyFilePath}`);

const auth = new google.auth.GoogleAuth({
  keyFile: keyFilePath,
  scopes: ['https://www.googleapis.com/auth/analytics.readonly']
});

// Middleware d'authentification
const authMiddleware = require('./middleware/auth');
const authenticateUser = authMiddleware;

// Routes d'authentification
app.use('/api/auth', authRoutes);

// Routes de gestion des entreprises
app.use('/api/companies', companyRoutes);

// Routes Facebook Marketing API
app.use('/api/facebook', facebookRoutes);

// Routes Instagram API
app.use('/api/instagram', instagramRoutes);

// Routes d'accompagnement client
app.use('/api/accompagnement', accompagnementRoutes);

// Routes pour les agents/employés Fusepoint
app.use('/api/agent', agentRoutes);

// Routes pour le Chat IA (avec authentification optionnelle) - DOIT être avant /api/chat
app.post('/api/chat/message', async (req, res) => {
  try {
    const { message, agentType, userId, companyId } = req.body;
    
    if (!message) {
      return res.status(400).json({ error: 'Message requis' });
    }

    console.log('📨 Requête chat reçue:', { 
      message: message.substring(0, 50) + '...', 
      agentType, 
      userId, 
      companyId,
      hasAuth: !!req.headers.authorization
    });

    // Vérifier l'authentification si userId et companyId sont fournis
    let authenticatedUser = null;
    if (userId && companyId && req.headers.authorization) {
      try {
        const token = req.headers.authorization.replace('Bearer ', '');
        authenticatedUser = await authService.verifyToken(token);
        
        // Vérifier que l'utilisateur a accès à cette entreprise
        const userCompany = await databaseService.db.get(
          'SELECT * FROM user_companies WHERE user_id = ? AND company_id = ?',
          [authenticatedUser.id, companyId]
        );
        
        if (!userCompany) {
          return res.status(403).json({ error: 'Accès refusé à cette entreprise' });
        }
        
        console.log('✅ Utilisateur authentifié:', authenticatedUser.email);
      } catch (authError) {
        console.log('⚠️ Erreur authentification, utilisation du mode démo:', authError.message);
      }
    }

    // Vérifier si l'utilisateur a un agent attribué
    if (authenticatedUser && authenticatedUser.id) {
      try {
        const assignmentCheck = await databaseService.db.get(
          `SELECT ap.*, u.first_name as agent_first_name, u.last_name as agent_last_name, u.email as agent_email
           FROM agent_prestataires ap
           JOIN users u ON ap.agent_id = u.id
           WHERE ap.client_id = ? AND ap.status = 'active'`,
          [authenticatedUser.id]
        );

        if (!assignmentCheck) {
          // Aucun agent attribué, retourner un message convivial
          return res.json({
            content: "🤝 Merci pour votre message ! Un de nos agents spécialisés va bientôt vous être attribué pour vous accompagner de manière personnalisée. Vous recevrez une notification dès qu'un agent sera disponible. En attendant, n'hésitez pas à nous faire part de vos questions !",
            suggestions: [
              "Voir mes données d'entreprise",
              "Configurer mes objectifs",
              "Explorer les fonctionnalités",
              "Contacter le support"
            ],
            agent: 'Système Fusepoint',
            timestamp: new Date().toISOString(),
            agentType: 'system',
            hasAssignedAgent: false,
            needsAgentAssignment: true,
            authenticated: true,
            userEmail: authenticatedUser.email
          });
        } else {
          // Agent attribué, inclure les informations dans la réponse
          const aiResponse = await aiChatService.generateResponse(message, agentType, userId, companyId);
          
          const response = {
            content: aiResponse.text || aiResponse.content || "Désolé, je n'ai pas pu générer une réponse. Pouvez-vous reformuler votre question ?",
            suggestions: aiResponse.suggestions || [],
            agent: aiResponse.agent || 'Agent IA',
            timestamp: aiResponse.timestamp || new Date().toISOString(),
            hasAssignedAgent: true,
            assignedAgent: {
              id: assignmentCheck.agent_id,
              first_name: assignmentCheck.agent_first_name,
              last_name: assignmentCheck.agent_last_name,
              email: assignmentCheck.agent_email
            },
            authenticated: true,
            userEmail: authenticatedUser.email,
            insights: aiResponse.insights || [],
            metrics: aiResponse.metrics || {},
            contextual: aiResponse.contextual || false
          };
          
          return res.json(response);
        }
      } catch (dbError) {
        console.error('Erreur lors de la vérification de l\'attribution:', dbError);
        // En cas d'erreur DB, continuer avec la logique normale
      }
    }

    // Générer la réponse
    const aiResponse = await aiChatService.generateResponse(message, agentType, userId, companyId);
    
    // Structurer la réponse selon le format attendu par le frontend
    const response = {
      content: aiResponse.text || aiResponse.content || "Désolé, je n'ai pas pu générer une réponse. Pouvez-vous reformuler votre question ?",
      suggestions: aiResponse.suggestions || [],
      agent: aiResponse.agent || 'Agent IA',
      timestamp: aiResponse.timestamp || new Date().toISOString(),
      authenticated: !!authenticatedUser,
      userEmail: authenticatedUser?.email,
      insights: aiResponse.insights || [],
      metrics: aiResponse.metrics || {},
      contextual: aiResponse.contextual || false
    };
    
    console.log('✅ Réponse structurée envoyée:', {
      hasContent: !!response.content,
      contentLength: response.content?.length || 0,
      suggestionsCount: response.suggestions?.length || 0
    });
    
    res.json(response);
  } catch (error) {
    console.error('❌ Erreur génération réponse:', error);
    res.status(500).json({ 
      error: 'Erreur lors de la génération de la réponse',
      details: error.message 
    });
  }
});

// Route pour obtenir les agents disponibles
app.get('/api/chat/agents', (req, res) => {
  const agents = [
    {
      id: 'content',
      name: 'Agent Contenu',
      specialty: 'Création et optimisation de contenu',
      avatar: '📝'
    },
    {
      id: 'social',
      name: 'Agent Social',
      specialty: 'Gestion des réseaux sociaux',
      avatar: '📱'
    },
    {
      id: 'email',
      name: 'Agent Email',
      specialty: 'Campagnes email marketing',
      avatar: '📧'
    },
    {
      id: 'analytics',
      name: 'Agent Analytics',
      specialty: 'Analyse de données et insights',
      avatar: '📊'
    },
    {
      id: 'strategy',
      name: 'Agent Stratégie',
      specialty: 'Stratégie marketing globale',
      avatar: '🎯'
    }
  ];
  
  res.json({ agents });
});



// Route spécifique pour que les clients puissent vérifier leur attribution d'agent
app.get('/api/client/:id/assigned-agent', authenticateUser, async (req, res) => {
  try {
    const clientId = req.params.id;
    const userId = req.user.id;
    
    // Vérifier que l'utilisateur demande ses propres informations ou est admin/agent
    if (userId != clientId && !['admin', 'agent', 'super_admin'].includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: 'Accès refusé - Vous ne pouvez consulter que vos propres informations'
      });
    }
    
    console.log('🔍 Vérification attribution pour client ID:', clientId);
    
    // Vérifier l'attribution dans agent_prestataires
    const assignment = await databaseService.db.get(
      `SELECT ap.*, u.first_name, u.last_name, u.email 
       FROM agent_prestataires ap 
       JOIN users u ON ap.agent_id = u.id 
       WHERE ap.prestataire_id = ? AND ap.status = 'active'`,
      [clientId]
    );
    
    console.log('📊 Résultat attribution:', assignment);
    
    if (assignment) {
      res.json({
        success: true,
        hasAssignedAgent: true,
        agent: {
          id: assignment.agent_id,
          firstName: assignment.first_name,
          lastName: assignment.last_name,
          email: assignment.email
        }
      });
    } else {
      res.json({
        success: true,
        hasAssignedAgent: false,
        agent: null
      });
    }
  } catch (error) {
    console.error('Erreur vérification attribution:', error);
    res.status(500).json({ success: false, message: 'Erreur serveur' });
  }
});

// Routes client
app.use('/api/client', clientRoutes);

// Routes pour les prestataires
app.use('/api/prestataire', prestataireRoutes);

// Routes pour les Super Administrateurs
app.use('/api/super-admin', superAdminRoutes);

// Routes pour les blocs de paramètres de plateforme
app.use('/api/super-admin', platformSettingsBlocksRoutes);

// Routes pour le système de chat
const chatRoutes = require('./routes/chat');
app.use('/api/chat', chatRoutes);

// Route pour tester la connexion à une propriété GA4
app.post('/api/analytics/test-connection', authenticateUser, async (req, res) => {
  try {
    const { propertyId } = req.body;
    
    if (!propertyId) {
      return res.status(400).json({ error: 'ID de propriété requis' });
    }
    
    const authClient = await auth.getClient();
    
    // Test de connexion avec l'endpoint metadata
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
      errorMessage = 'Propriété GA4 introuvable. Vérifiez l\'ID de propriété.';
      statusCode = 404;
    } else if (error.code === 403) {
      errorMessage = 'Accès refusé. Vérifiez que le service account a accès à cette propriété.';
      statusCode = 403;
    }
    
    res.status(statusCode).json({ error: errorMessage });
  }
});

// Route pour récupérer les données de trafic
app.post('/api/analytics/traffic-sources', authenticateUser, async (req, res) => {
  try {
    const { propertyId, startDate, endDate } = req.body;
    
    if (!propertyId || !startDate || !endDate) {
      return res.status(400).json({ error: 'Paramètres manquants' });
    }
    
    const authClient = await auth.getClient();
    
    const response = await analytics.properties.runReport({
      auth: authClient,
      property: `properties/${propertyId}`,
      requestBody: {
        dateRanges: [{ startDate, endDate }],
        dimensions: [{ name: 'sessionDefaultChannelGrouping' }],
        metrics: [
          { name: 'sessions' },
          { name: 'users' },
          { name: 'bounceRate' }
        ]
      }
    });
    
    const formattedData = response.data.rows?.map(row => ({
      source: row.dimensionValues[0].value,
      sessions: parseInt(row.metricValues[0].value),
      users: parseInt(row.metricValues[1].value),
      bounceRate: parseFloat(row.metricValues[2].value)
    })) || [];
    
    res.json({ data: formattedData });
    
  } catch (error) {
    console.error('Erreur récupération données:', error);
    res.status(500).json({ error: 'Erreur lors de la récupération des données' });
  }
});

// Route pour récupérer les pages les plus visitées
app.post('/api/analytics/top-pages', authenticateUser, async (req, res) => {
  try {
    const { propertyId, startDate, endDate } = req.body;
    
    const authClient = await auth.getClient();
    
    const response = await analytics.properties.runReport({
      auth: authClient,
      property: `properties/${propertyId}`,
      requestBody: {
        dateRanges: [{ startDate, endDate }],
        dimensions: [{ name: 'pagePath' }, { name: 'pageTitle' }],
        metrics: [
          { name: 'screenPageViews' },
          { name: 'users' }
        ],
        orderBys: [{ metric: { metricName: 'screenPageViews' }, desc: true }],
        limit: 10
      }
    });
    
    const formattedData = response.data.rows?.map(row => ({
      path: row.dimensionValues[0].value,
      title: row.dimensionValues[1].value,
      pageViews: parseInt(row.metricValues[0].value),
      users: parseInt(row.metricValues[1].value)
    })) || [];
    
    res.json({ data: formattedData });
    
  } catch (error) {
    console.error('Erreur récupération pages:', error);
    res.status(500).json({ error: 'Erreur lors de la récupération des pages' });
  }
});

// Route pour récupérer les données géographiques
app.post('/api/analytics/geographic-data', authenticateUser, async (req, res) => {
  try {
    const { propertyId, startDate, endDate } = req.body;
    
    const authClient = await auth.getClient();
    
    const response = await analytics.properties.runReport({
      auth: authClient,
      property: `properties/${propertyId}`,
      requestBody: {
        dateRanges: [{ startDate, endDate }],
        dimensions: [{ name: 'country' }],
        metrics: [
          { name: 'users' },
          { name: 'sessions' }
        ],
        orderBys: [{ metric: { metricName: 'users' }, desc: true }],
        limit: 20
      }
    });
    
    const formattedData = response.data.rows?.map(row => ({
      country: row.dimensionValues[0].value,
      users: parseInt(row.metricValues[0].value),
      sessions: parseInt(row.metricValues[1].value)
    })) || [];
    
    res.json({ data: formattedData });
    
  } catch (error) {
    console.error('Erreur données géographiques:', error);
    res.status(500).json({ error: 'Erreur lors de la récupération des données géographiques' });
  }
});



// Route pour vérifier le statut de l'IA
app.get('/api/ai/status', async (req, res) => {
  try {
    // Vérifier le statut de la base de données
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
    console.error('❌ Erreur vérification statut:', error);
    res.status(500).json({
      status: 'error',
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

// Route pour tester la connexion OpenAI
app.post('/api/ai/test', authenticateUser, async (req, res) => {
  try {
    const model = req.body.model || 'gpt-3.5-turbo';
    
    // Utiliser la clé API configurée côté serveur
    const apiKey = process.env.OPENAI_API_KEY;
    
    if (!apiKey) {
      return res.status(500).json({ error: 'Clé API OpenAI non configurée côté serveur' });
    }
    
    // Tester la connexion avec la clé configurée
    const testResult = await aiChatService.testOpenAIConnection(apiKey, model);
    
    if (testResult.success) {
      res.json({ success: true, message: 'Connexion OpenAI réussie' });
    } else {
      res.status(400).json({ error: testResult.error });
    }
    
  } catch (error) {
    console.error('Erreur test OpenAI:', error);
    res.status(500).json({ error: 'Erreur lors du test de connexion' });
  }
});

// Route pour configurer OpenAI
app.post('/api/ai/configure', authenticateUser, async (req, res) => {
  try {
    const { model = 'gpt-3.5-turbo', temperature = 0.7 } = req.body;
    
    // Utiliser la clé API configurée côté serveur
    const apiKey = process.env.OPENAI_API_KEY;
    
    if (!apiKey) {
      return res.status(500).json({ error: 'Clé API OpenAI non configurée côté serveur' });
    }
    
    // Configurer le service IA
    const configResult = await aiChatService.configure(apiKey, model, temperature);
    
    if (configResult.success) {
      res.json({ success: true, message: 'Configuration IA mise à jour' });
    } else {
      res.status(400).json({ error: configResult.error });
    }
    
  } catch (error) {
    console.error('Erreur configuration IA:', error);
    res.status(500).json({ error: 'Erreur lors de la configuration' });
  }
});



// Route racine avec documentation des endpoints
app.get('/', (req, res) => {
  res.json({
    message: '🚀 API Google Analytics Proxy - Fusepoint Hub',
    version: '1.0.0',
    endpoints: {
      health: 'GET /health',
      testConnection: 'POST /api/analytics/test-connection',
      trafficSources: 'POST /api/analytics/traffic-sources',
      topPages: 'POST /api/analytics/top-pages',
      geographicData: 'POST /api/analytics/geographic-data'
    },
    documentation: 'Consultez README_PROXY_SOLUTION.md pour plus d\'informations',
    timestamp: new Date().toISOString()
  });
});

// Route de santé
app.get('/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Route pour lister les endpoints disponibles
app.get('/api', (req, res) => {
  res.json({
    message: 'API Google Analytics Proxy',
    availableEndpoints: [
      {
        method: 'POST',
        path: '/api/analytics/test-connection',
        description: 'Tester la connexion à une propriété GA4',
        requiredFields: ['propertyId']
      },
      {
        method: 'POST',
        path: '/api/analytics/traffic-sources',
        description: 'Récupérer les sources de trafic',
        requiredFields: ['propertyId', 'startDate', 'endDate']
      },
      {
        method: 'POST',
        path: '/api/analytics/top-pages',
        description: 'Récupérer les pages les plus visitées',
        requiredFields: ['propertyId', 'startDate', 'endDate']
      },
      {
        method: 'POST',
        path: '/api/analytics/geographic-data',
        description: 'Récupérer les données géographiques',
        requiredFields: ['propertyId', 'startDate', 'endDate']
      }
    ],
    authentication: 'Bearer token requis dans l\'en-tête Authorization'
  });
});

// Gestion des erreurs globales
app.use((error, req, res, next) => {
  console.error('Erreur serveur:', error);
  res.status(500).json({ error: 'Erreur interne du serveur' });
});

// Route 404 avec suggestions
app.use('*', (req, res) => {
  const suggestions = [];
  
  if (req.path.startsWith('/api/')) {
    suggestions.push('Consultez GET /api pour voir les endpoints disponibles');
    suggestions.push('Vérifiez que vous utilisez la bonne méthode HTTP (POST pour les endpoints analytics)');
    suggestions.push('Assurez-vous d\'inclure le token d\'authentification Bearer');
  } else {
    suggestions.push('Consultez GET / pour voir la documentation de l\'API');
    suggestions.push('Les endpoints analytics sont sous /api/analytics/');
  }
  
  res.status(404).json({ 
    error: 'Route non trouvée',
    path: req.path,
    method: req.method,
    suggestions: suggestions,
    availableRoutes: {
      documentation: 'GET /',
      health: 'GET /health',
      apiInfo: 'GET /api',
      analytics: 'POST /api/analytics/*'
    }
  });
});

// Le serveur est maintenant démarré après l'initialisation de la base de données