const jwt = require('jsonwebtoken');

/**
 * Middleware d'authentification JWT
 * Vérifie la validité du token d'accès dans les en-têtes de la requête
 */
const authMiddleware = (req, res, next) => {
  try {
    // Ignorer les requêtes OPTIONS (preflight CORS)
    if (req.method === 'OPTIONS') {
      return next();
    }
    
    console.log(`🔍 Auth middleware - ${req.method} ${req.path}`);
    
    // Récupérer le token depuis l'en-tête Authorization
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      console.log('❌ Auth middleware - Pas de token Authorization:', { authHeader });
      return res.status(401).json({
        success: false,
        message: 'Token d\'authentification requis'
      });
    }

    // Extraire le token
    const token = authHeader.substring(7); // Enlever "Bearer "
    
    if (!token) {
      console.log('❌ Auth middleware - Token vide après extraction');
      return res.status(401).json({
        success: false,
        message: 'Token manquant'
      });
    }

    // Vérifier le token avec le même secret que l'authService
    const authService = require('../services/authService');
    const jwtSecret = authService.jwtSecret;
    console.log('🔑 Auth middleware - Vérification token avec secret:', jwtSecret.substring(0, 10) + '...');
    const decoded = jwt.verify(token, jwtSecret);
    
    console.log('✅ Auth middleware - Token valide:', { userId: decoded.id || decoded.userId, email: decoded.email });
    
    // Ajouter les informations utilisateur à la requête
    req.user = {
      id: decoded.id || decoded.userId, // Support des deux formats
      email: decoded.email,
      role: decoded.role,
      company_id: decoded.company_id
    };
    
    next();
    
  } catch (error) {
    console.error('Erreur authentification:', error);
    
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({
        success: false,
        message: 'Token invalide'
      });
    }
    
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        message: 'Token expiré'
      });
    }
    
    return res.status(500).json({
      success: false,
      message: 'Erreur serveur lors de l\'authentification'
    });
  }
};

// Export par défaut
module.exports = authMiddleware;

// Export nommé pour compatibilité
module.exports.authenticateToken = authMiddleware;