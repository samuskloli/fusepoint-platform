const jwt = require('jsonwebtoken');

/**
 * Middleware pour vérifier les rôles d'utilisateur
 * @param {Array} allowedRoles - Rôles autorisés pour accéder à la route
 */
const roleAuth = (allowedRoles = []) => {
  return (req, res, next) => {
    try {
      console.log('🔍 Debug roleAuth - req.user:', req.user);
      console.log('🔍 Debug roleAuth - allowedRoles:', allowedRoles);
      
      // Vérifier si l'utilisateur est authentifié
      if (!req.user) {
        console.log('❌ Pas d\'utilisateur authentifié');
        return res.status(401).json({
          success: false,
          message: 'Authentification requise'
        });
      }

      console.log('🔍 Debug roleAuth - user role:', req.user.role);
      
      // Les super_admin ont accès à tout
      if (req.user.role === 'super_admin') {
        console.log('✅ Super Admin - Accès autorisé à toutes les routes');
        return next();
      }
      
      // Vérifier si le rôle de l'utilisateur est autorisé
      if (!allowedRoles.includes(req.user.role)) {
        console.log('❌ Rôle non autorisé:', req.user.role, 'allowedRoles:', allowedRoles);
        return res.status(403).json({
          success: false,
          message: 'Accès refusé - Privilèges insuffisants'
        });
      }

      console.log('✅ Autorisation accordée');
      next();
    } catch (error) {
      console.error('❌ Erreur vérification rôle:', error);
      return res.status(500).json({
        success: false,
        message: 'Erreur serveur lors de la vérification des privilèges'
      });
    }
  };
};

module.exports = roleAuth;