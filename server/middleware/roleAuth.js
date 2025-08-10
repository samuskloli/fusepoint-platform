/**
 * Middleware pour vérifier les rôles d'utilisateur
 */

const requireRole = (allowedRoles) => {
  return (req, res, next) => {
    try {
      // Vérifier si l'utilisateur est authentifié
      if (!req.user) {
        return res.status(401).json({
          success: false,
          message: 'Utilisateur non authentifié'
        });
      }

      // Vérifier si le rôle de l'utilisateur est autorisé
      const userRole = req.user.role;
      if (!allowedRoles.includes(userRole)) {
        return res.status(403).json({
          success: false,
          message: 'Accès refusé - rôle insuffisant'
        });
      }

      next();
    } catch (error) {
      console.error('Erreur dans requireRole:', error);
      return res.status(500).json({
        success: false,
        message: 'Erreur interne du serveur'
      });
    }
  };
};

// Export par défaut pour compatibilité avec les anciens imports
module.exports = requireRole;

// Export nommé pour les nouveaux imports
module.exports.requireRole = requireRole;