// Configuration centralisée du serveur
// Fusepoint Hub - Google Analytics Proxy

module.exports = {
  // Configuration du serveur
  server: {
    port: process.env.PORT || 3001,
    frontendUrl: process.env.FRONTEND_URL || 'http://localhost:5173',
    nodeEnv: process.env.NODE_ENV || 'development'
  },

  // Configuration de sécurité
  security: {
    rateLimit: {
      windowMs: 15 * 60 * 1000, // 15 minutes
      max: 100, // limite par IP
      message: 'Trop de requêtes depuis cette IP, réessayez plus tard.'
    },
    cors: {
      credentials: true,
      optionsSuccessStatus: 200
    }
  },

  // Configuration Google Analytics
  googleAnalytics: {
    keyFile: process.env.GOOGLE_SERVICE_ACCOUNT_KEY_FILE || './config/service-account-key.json',
    scopes: ['https://www.googleapis.com/auth/analytics.readonly'],
    apiVersion: 'v1beta'
  },

  // Configuration JWT
  jwt: {
    secret: process.env.JWT_SECRET,
    expiresIn: '24h'
  },

  // Configuration des logs
  logging: {
    level: process.env.LOG_LEVEL || 'info',
    enableRequestLogging: process.env.NODE_ENV !== 'production'
  },

  // Limites des requêtes
  limits: {
    maxReportRows: 1000,
    maxDateRange: 365, // jours
    defaultPageSize: 10
  },

  // Messages d'erreur standardisés
  errorMessages: {
    unauthorized: 'Token d\'authentification requis',
    forbidden: 'Accès refusé',
    notFound: 'Ressource non trouvée',
    badRequest: 'Requête invalide',
    internalError: 'Erreur interne du serveur',
    propertyNotFound: 'Propriété GA4 introuvable. Vérifiez l\'ID de propriété.',
    accessDenied: 'Accès refusé. Vérifiez que le service account a accès à cette propriété.',
    missingParameters: 'Paramètres manquants',
    invalidDateRange: 'Plage de dates invalide'
  }
};