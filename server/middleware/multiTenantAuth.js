const jwt = require('jsonwebtoken');
const mariadbService = require('../services/mariadbService');
const agentService = require('../services/agentService');

// Middleware d'authentification JWT
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ 
      success: false, 
      error: 'Token d\'authentification requis' 
    });
  }

  jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key', (err, user) => {
    if (err) {
      return res.status(403).json({ 
        success: false, 
        error: 'Token invalide' 
      });
    }
    
    req.user = user;
    next();
  });
};

// Middleware de validation des rôles
const requireRole = (allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ 
        success: false, 
        error: 'Authentification requise' 
      });
    }

    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({ 
        success: false, 
        error: 'Permissions insuffisantes' 
      });
    }

    next();
  };
};

// Middleware de validation du scope multi-tenant
const validateMultiTenantScope = async (req, res, next) => {
  try {
    const { clientId, projectId } = req.params;
    const userId = req.user.id;
    const userRole = req.user.role;
    
    // Validation des paramètres
    if (!clientId || !projectId) {
      return res.status(400).json({ 
        success: false, 
        error: 'clientId et projectId sont requis dans l\'URL' 
      });
    }
    
    // Convertir en entiers et valider
    const clientIdInt = parseInt(clientId);
    const projectIdInt = parseInt(projectId);
    
    if (isNaN(clientIdInt) || isNaN(projectIdInt)) {
      return res.status(400).json({ 
        success: false, 
        error: 'clientId et projectId doivent être des entiers valides' 
      });
    }
    
    // Vérifier que le projet appartient au client
    const project = await mariadbService.query(
      'SELECT id, name, status FROM projects WHERE id = ? AND client_id = ?',
      [projectIdInt, clientIdInt]
    );
    
    if (project.length === 0) {
      return res.status(404).json({ 
        success: false, 
        error: 'Projet non trouvé ou n\'appartient pas au client spécifié' 
      });
    }
    
    // Vérifier les permissions d'accès selon le rôle
    const hasAccess = await checkUserAccess(userId, userRole, clientIdInt, projectIdInt);
    
    if (!hasAccess.allowed) {
      return res.status(403).json({ 
        success: false, 
        error: hasAccess.reason || 'Accès refusé au projet' 
      });
    }
    
    // Ajouter les IDs validés et les informations du projet à la requête
    req.validatedScope = {
      clientId: clientIdInt,
      projectId: projectIdInt,
      project: project[0],
      userAccess: hasAccess
    };
    
    // Logger l'accès pour audit
    await logAccess(userId, userRole, clientIdInt, projectIdInt, req.method, req.originalUrl);
    
    next();
  } catch (error) {
    console.error('Erreur validation scope multi-tenant:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Erreur interne du serveur lors de la validation du scope' 
    });
  }
};

// Fonction pour vérifier l'accès utilisateur selon le rôle
async function checkUserAccess(userId, userRole, clientId, projectId) {
  try {
    switch (userRole) {
      case 'admin':
      case 'super_admin':
        // Les admins ont accès à tout
        return { allowed: true, level: 'admin' };
        
      case 'agent':
        // Vérifier l'accès agent-client via logique unifiée
        const hasAccess = await agentService.checkAgentClientAccess(userId, clientId);
        if (!hasAccess) {
          return {
            allowed: false,
            reason: 'Agent non autorisé pour ce client'
          };
        }
        // Tenter de récupérer les permissions depuis agent_clients si disponibles
        const ac = await mariadbService.query(
          'SELECT permissions FROM agent_clients WHERE agent_id = ? AND client_id = ? AND status = ?',
          [userId, clientId, 'active']
        );
        if (ac.length > 0) {
          return { allowed: true, level: 'agent', permissions: ac[0].permissions };
        }
        return { allowed: true, level: 'agent' };
        
      case 'client':
      case 'user':
        // Vérifier que l'utilisateur appartient au client
        const clientUser = await mariadbService.query(
          'SELECT id, role FROM users WHERE id = ? AND client_id = ?',
          [userId, clientId]
        );
        
        if (clientUser.length === 0) {
          return { 
            allowed: false, 
            reason: 'Utilisateur non autorisé pour ce client' 
          };
        }
        
        // Vérifier l'accès au projet spécifique
        const projectAccess = await mariadbService.query(
          'SELECT id FROM project_members WHERE user_id = ? AND project_id = ? AND is_active = 1',
          [userId, projectId]
        );
        
        if (projectAccess.length === 0) {
          return { 
            allowed: false, 
            reason: 'Accès non autorisé à ce projet' 
          };
        }
        
        return { 
          allowed: true, 
          level: 'user' 
        };
        
      default:
        return { 
          allowed: false, 
          reason: 'Rôle utilisateur non reconnu' 
        };
    }
  } catch (error) {
    console.error('Erreur vérification accès utilisateur:', error);
    return { 
      allowed: false, 
      reason: 'Erreur lors de la vérification des permissions' 
    };
  }
}

// Middleware pour forcer le scope dans les données
const enforceDataScope = (req, res, next) => {
  if (!req.validatedScope) {
    return res.status(500).json({ 
      success: false, 
      error: 'Scope non validé - middleware validateMultiTenantScope requis' 
    });
  }
  
  const { clientId, projectId } = req.validatedScope;
  
  // Ajouter automatiquement client_id et project_id aux données POST/PUT/PATCH
  if (req.body && typeof req.body === 'object' && ['POST', 'PUT', 'PATCH'].includes(req.method)) {
    req.body.client_id = clientId;
    req.body.project_id = projectId;
    req.body.updated_at = new Date();
    
    if (req.method === 'POST') {
      req.body.created_by = req.user.id;
      req.body.created_at = new Date();
    }
  }
  
  next();
};

// Middleware pour valider les requêtes de base de données
const validateDatabaseQuery = (req, res, next) => {
  if (!req.validatedScope) {
    return res.status(500).json({ 
      success: false, 
      error: 'Scope non validé pour la requête base de données' 
    });
  }
  
  // Ajouter une fonction helper pour construire les clauses WHERE avec scope
  req.buildScopeWhere = (additionalConditions = '') => {
    const { clientId, projectId } = req.validatedScope;
    let whereClause = `client_id = ${clientId} AND project_id = ${projectId}`;
    
    if (additionalConditions) {
      whereClause += ` AND ${additionalConditions}`;
    }
    
    return whereClause;
  };
  
  // Ajouter une fonction helper pour les paramètres de scope
  req.getScopeParams = () => {
    const { clientId, projectId } = req.validatedScope;
    return [clientId, projectId];
  };
  
  next();
};

// Fonction de logging pour audit
async function logAccess(userId, userRole, clientId, projectId, method, url) {
  try {
    await mariadbService.query(`
      INSERT INTO access_logs (
        user_id, user_role, client_id, project_id, 
        method, url, timestamp, ip_address
      ) VALUES (?, ?, ?, ?, ?, ?, NOW(), ?)
    `, [userId, userRole, clientId, projectId, method, url, '127.0.0.1']);
  } catch (error) {
    console.error('Erreur logging accès:', error);
    // Ne pas faire échouer la requête pour un problème de log
  }
}

// Middleware pour vérifier les permissions spécifiques
const requirePermission = (permission) => {
  return (req, res, next) => {
    if (!req.validatedScope || !req.validatedScope.userAccess) {
      return res.status(500).json({ 
        success: false, 
        error: 'Informations d\'accès non disponibles' 
      });
    }
    
    const { userAccess } = req.validatedScope;
    
    // Les admins ont toutes les permissions
    if (userAccess.level === 'admin') {
      return next();
    }
    
    // Vérifier les permissions spécifiques pour les agents
    if (userAccess.level === 'agent' && userAccess.permissions) {
      try {
        const permissions = JSON.parse(userAccess.permissions);
        if (permissions.includes(permission) || permissions.includes('*')) {
          return next();
        }
      } catch (error) {
        console.error('Erreur parsing permissions:', error);
      }
    }
    
    // Les utilisateurs ont des permissions limitées par défaut
    const defaultUserPermissions = ['read', 'upload', 'create_task'];
    if (userAccess.level === 'user' && defaultUserPermissions.includes(permission)) {
      return next();
    }
    
    return res.status(403).json({ 
      success: false, 
      error: `Permission '${permission}' requise` 
    });
  };
};

// Middleware pour limiter le taux de requêtes par scope
const rateLimitByScope = (maxRequests = 100, windowMs = 60000) => {
  const requestCounts = new Map();
  
  return (req, res, next) => {
    if (!req.validatedScope) {
      return next();
    }
    
    const { clientId, projectId } = req.validatedScope;
    const key = `${clientId}:${projectId}:${req.user.id}`;
    const now = Date.now();
    
    // Nettoyer les anciennes entrées
    for (const [k, data] of requestCounts.entries()) {
      if (now - data.resetTime > windowMs) {
        requestCounts.delete(k);
      }
    }
    
    // Vérifier le taux pour ce scope
    const current = requestCounts.get(key) || { count: 0, resetTime: now };
    
    if (now - current.resetTime > windowMs) {
      current.count = 0;
      current.resetTime = now;
    }
    
    current.count++;
    requestCounts.set(key, current);
    
    if (current.count > maxRequests) {
      return res.status(429).json({ 
        success: false, 
        error: 'Trop de requêtes pour ce projet' 
      });
    }
    
    next();
  };
};

module.exports = {
  authenticateToken,
  requireRole,
  validateMultiTenantScope,
  enforceDataScope,
  validateDatabaseQuery,
  requirePermission,
  rateLimitByScope,
  checkUserAccess,
  logAccess
};