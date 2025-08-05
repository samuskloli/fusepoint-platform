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
    
    // Récupérer le token depuis l'en-tête Authorization
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        message: 'Token d\'authentification requis'
      });
    }

    // Extraire le token
    const token = authHeader.substring(7); // Enlever "Bearer "
    
    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Token manquant'
      });
    }

    // Vérifier le token
    const jwtSecret = process.env.JWT_SECRET || 'your-secret-key';
    const decoded = jwt.verify(token, jwtSecret);
    
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

module.exports = authMiddleware;