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
    const previewSecret = typeof jwtSecret === 'string' ? (jwtSecret.length > 10 ? jwtSecret.slice(0, 10) + '...' : jwtSecret) : '[secret indisponible]';
    console.log('🔑 Auth middleware - Vérification token avec secret:', previewSecret);
    const decoded = jwt.verify(token, jwtSecret);
    
    console.log('✅ Auth middleware - Token valide:', { userId: decoded.id || decoded.userId, tenantId: decoded.tenantId, email: decoded.email });
    
    // Ajouter les informations utilisateur et tenant à la requête
    req.user = {
      id: decoded.id || decoded.userId, // Support des deux formats
      email: decoded.email,
      role: decoded.role,
      company_id: decoded.company_id
    };
    // Exposer userId et tenantId de manière explicite pour les contrôles d'accès
    req.userId = decoded.id || decoded.userId;
    req.tenantId = decoded.tenantId || decoded.company_id; // Fallback sur company_id si tenantId absent
    
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
    
    // Par défaut, éviter une 500 due à l'auth et retourner 401
    return res.status(401).json({
      success: false,
      message: 'Erreur d\'authentification'
    });
  }
};

// Export par défaut
module.exports = authMiddleware;

// Export nommé pour compatibilité
module.exports.authenticateToken = authMiddleware;