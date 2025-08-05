const permissionsService = require('../services/permissionsService');

/**
 * Middleware d'authentification et d'autorisation pour les Super Administrateurs
 */
class SuperAdminAuth {
  constructor() {
    this.permissionsService = permissionsService;
    this.initialized = false;
  }

  /**
   * Initialiser le service
   */
  async initialize() {
    if (!this.initialized) {
      // permissionsService n'a pas besoin d'initialisation
      this.initialized = true;
    }
  }

  /**
   * Middleware pour vérifier si l'utilisateur est un super admin
   */
  requireSuperAdmin() {
    return async (req, res, next) => {
      try {
        await this.initialize();

        // Vérifier si l'utilisateur est authentifié
        if (!req.user || !req.user.id) {
          return res.status(401).json({
            success: false,
            message: 'Authentification requise'
          });
        }

        // Vérifier si l'utilisateur est un super admin
        const isSuperAdmin = await this.permissionsService.isSuperAdmin(req.user.id);
        if (!isSuperAdmin) {
          // Logger la tentative d'accès non autorisée
          console.log(`Tentative d'accès non autorisée par l'utilisateur ${req.user.id} à une ressource super admin`);

          return res.status(403).json({
            success: false,
            message: 'Accès refusé. Privilèges Super Administrateur requis.'
          });
        }

        // Ajouter les informations super admin à la requête
        req.superAdmin = {
          id: req.user.id,
          email: req.user.email,
          role: req.user.role
        };

        next();
      } catch (error) {
        console.error('❌ Erreur middleware super admin:', error);
        res.status(500).json({
          success: false,
          message: 'Erreur interne du serveur'
        });
      }
    };
  }

  /**
   * Middleware pour vérifier une permission spécifique
   */
  requirePermission(permissionName) {
    return async (req, res, next) => {
      try {
        await this.initialize();

        // Vérifier si l'utilisateur est authentifié
        if (!req.user || !req.user.id) {
          return res.status(401).json({
            success: false,
            message: 'Authentification requise'
          });
        }

        // Vérifier la permission
        const hasPermission = await this.permissionsService.userHasPermission(req.user.id, permissionName);
        if (!hasPermission) {
          // Logger la tentative d'accès non autorisée
          console.log(`Accès refusé pour l'utilisateur ${req.user.id} - permission: ${permissionName}`);

          return res.status(403).json({
            success: false,
            message: `Permission requise: ${permissionName}`
          });
        }

        next();
      } catch (error) {
        console.error('❌ Erreur vérification permission:', error);
        res.status(500).json({
          success: false,
          message: 'Erreur interne du serveur'
        });
      }
    };
  }

  /**
   * Middleware pour vérifier plusieurs permissions (OR)
   */
  requireAnyPermission(permissions) {
    return async (req, res, next) => {
      try {
        await this.initialize();

        // Vérifier si l'utilisateur est authentifié
        if (!req.user || !req.user.id) {
          return res.status(401).json({
            success: false,
            message: 'Authentification requise'
          });
        }

        // Vérifier si l'utilisateur a au moins une des permissions
        let hasAnyPermission = false;
        for (const permission of permissions) {
          const hasPermission = await this.permissionsService.userHasPermission(req.user.id, permission);
          if (hasPermission) {
            hasAnyPermission = true;
            break;
          }
        }

        if (!hasAnyPermission) {
          // Logger la tentative d'accès non autorisée
          console.log(`Accès refusé pour l'utilisateur ${req.user.id} - permissions: ${permissions.join(', ')}`);

          return res.status(403).json({
            success: false,
            message: `Une des permissions suivantes est requise: ${permissions.join(', ')}`
          });
        }

        next();
      } catch (error) {
        console.error('❌ Erreur vérification permissions multiples:', error);
        res.status(500).json({
          success: false,
          message: 'Erreur interne du serveur'
        });
      }
    };
  }

  /**
   * Middleware pour vérifier toutes les permissions (AND)
   */
  requireAllPermissions(permissions) {
    return async (req, res, next) => {
      try {
        await this.initialize();

        // Vérifier si l'utilisateur est authentifié
        if (!req.user || !req.user.id) {
          return res.status(401).json({
            success: false,
            message: 'Authentification requise'
          });
        }

        // Vérifier si l'utilisateur a toutes les permissions
        for (const permission of permissions) {
          const hasPermission = await this.permissionsService.userHasPermission(req.user.id, permission);
          if (!hasPermission) {
            // Logger la tentative d'accès non autorisée
            console.log(`Permission manquante pour l'utilisateur ${req.user.id}: ${permission}`);

            return res.status(403).json({
              success: false,
              message: `Permission manquante: ${permission}`
            });
          }
        }

        next();
      } catch (error) {
        console.error('❌ Erreur vérification permissions complètes:', error);
        res.status(500).json({
          success: false,
          message: 'Erreur interne du serveur'
        });
      }
    };
  }

  /**
   * Middleware pour les routes qui nécessitent soit super admin soit agent/admin
   */
  requireSuperAdminOrAgent() {
    return async (req, res, next) => {
      try {
        await this.initialize();

        // Vérifier si l'utilisateur est authentifié
        if (!req.user || !req.user.id) {
          return res.status(401).json({
            success: false,
            message: 'Authentification requise'
          });
        }

        // Vérifier si l'utilisateur est super admin
        const isSuperAdmin = await this.permissionsService.isSuperAdmin(req.user.id);
        if (isSuperAdmin) {
          req.superAdmin = {
            id: req.user.id,
            email: req.user.email,
            role: req.user.role
          };
          return next();
        }

        // Sinon, vérifier si c'est un agent ou admin
        if (req.user.role === 'admin' || req.user.role === 'agent') {
          return next();
        }

        // Accès refusé
        console.log(`Tentative d'accès avec rôle insuffisant pour l'utilisateur ${req.user.id}: ${req.user.role}`);

        return res.status(403).json({
          success: false,
          message: 'Accès refusé. Privilèges administrateur requis.'
        });
      } catch (error) {
        console.error('❌ Erreur middleware super admin ou agent:', error);
        res.status(500).json({
          success: false,
          message: 'Erreur interne du serveur'
        });
      }
    };
  }

  /**
   * Middleware pour logger automatiquement les actions sensibles
   */
  logAction(actionType, description) {
    return async (req, res, next) => {
      try {
        await this.initialize();

        // Stocker les informations pour le log post-action
        req.logAction = {
          type: actionType,
          description: description,
          startTime: Date.now()
        };

        // Intercepter la réponse pour logger après l'action
        const originalSend = res.send;
        res.send = function(data) {
          // Logger l'action si elle a réussi
          if (req.user && req.logAction && res.statusCode < 400) {
            console.log(`Action loggée pour l'utilisateur ${req.user.id}: ${req.logAction.type} - ${req.logAction.description}`);
          }
          originalSend.call(this, data);
        };

        next();
      } catch (error) {
        console.error('❌ Erreur middleware log action:', error);
        next(); // Continuer même en cas d'erreur de log
      }
    };
  }
}

// Créer une instance singleton
const superAdminAuth = new SuperAdminAuth();

module.exports = superAdminAuth;