import authService from '@/services/authService';

/**
 * Middleware d'authentification pour Vue Router
 * Protège les routes et gère l'état de connexion
 */

/**
 * Guard pour les routes protégées
 * Redirige vers /login si l'utilisateur n'est pas authentifié
 */
export const requireAuth = (to, from, next) => {
  const token = localStorage.getItem('accessToken');
  const user = localStorage.getItem('user');
  
  if (!token || !user) {
    next('/login');
    return;
  }
  
  // Vérifier si le token n'est pas expiré
  const expiresAt = localStorage.getItem('tokenExpiresAt');
  if (expiresAt && new Date() >= new Date(expiresAt)) {
    // Token expiré, nettoyer et rediriger
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('sessionToken');
    localStorage.removeItem('tokenExpiresAt');
    localStorage.removeItem('user');
    localStorage.removeItem('companies');
    next('/login');
    return;
  }
  
  next();
};

/**
 * Guard pour les routes publiques (login, register)
 * Redirige vers /dashboard si l'utilisateur est déjà connecté
 */
export const requireGuest = (to, from, next) => {
  const token = localStorage.getItem('accessToken');
  const user = localStorage.getItem('user');
  const expiresAt = localStorage.getItem('tokenExpiresAt');
  
  // Vérifier si l'utilisateur est connecté avec un token valide
  if (token && user && expiresAt && new Date() < new Date(expiresAt)) {
    next('/dashboard');
  } else {
    next();
  }
};

/**
 * Guard pour vérifier les permissions utilisateur
 * @param {string|Array} requiredPermissions - Permission(s) requise(s)
 */
export const requirePermission = (requiredPermissions) => {
  return async (to, from, next) => {
    try {
      if (!authService.isAuthenticated()) {
        next('/login');
        return;
      }

      const user = authService.getUser();
      const companies = authService.getCompanies();

      // Vérifier si l'utilisateur a les permissions requises
      const hasPermission = checkUserPermissions(user, companies, requiredPermissions);

      if (hasPermission) {
        next();
      } else {
        // Rediriger vers une page d'erreur ou le dashboard
        next('/dashboard?error=insufficient_permissions');
      }
    } catch (error) {
      console.error('❌ Erreur vérification permissions:', error);
      next('/login');
    }
  };
};

/**
 * Vérifier les permissions utilisateur
 * @param {Object} user - Données utilisateur
 * @param {Array} companies - Entreprises de l'utilisateur
 * @param {string|Array} requiredPermissions - Permission(s) requise(s)
 */
function checkUserPermissions(user, companies, requiredPermissions) {
  // Convertir en tableau si c'est une chaîne
  const permissions = Array.isArray(requiredPermissions) 
    ? requiredPermissions 
    : [requiredPermissions];

  // Admin global a toutes les permissions
  if (user.role === 'admin') {
    return true;
  }

  // Vérifier les permissions dans les entreprises
  for (const company of companies) {
    const userPermissions = company.permissions || {};
    
    // Vérifier si l'utilisateur a toutes les permissions requises
    const hasAllPermissions = permissions.every(permission => {
      return userPermissions[permission] === true;
    });

    if (hasAllPermissions) {
      return true;
    }
  }

  return false;
}

/**
 * Middleware global pour initialiser l'état d'authentification
 */
export const initializeAuth = async (to, from, next) => {
  try {
    const token = authService.getAccessToken();
    const user = authService.getUser();
    
    // Si pas de token ou token expiré, nettoyer et continuer
    if (!token || authService.isTokenExpired()) {
      authService.clearTokens();
      authService.clearUser();
      authService.clearCompanies();
      next();
      return;
    }
    
    // Si token présent mais pas d'utilisateur en cache, essayer de récupérer
    if (token && !user && !authService.isTokenExpired()) {
      try {
        await authService.getCurrentUser();
      } catch (error) {
        console.warn('⚠️ Token invalide, nettoyage:', error);
        authService.clearTokens();
        authService.clearUser();
        authService.clearCompanies();
      }
    }
    
    next();
  } catch (error) {
    console.error('❌ Erreur initialisation auth:', error);
    next();
  }
};

/**
 * Utilitaire pour vérifier l'authentification dans les composants
 */
export const useAuth = () => {
  return {
    isAuthenticated: () => authService.isAuthenticated(),
    getUser: () => authService.getUser(),
    getCompanies: () => authService.getCompanies(),
    logout: () => authService.logout(),
    hasPermission: (permission) => {
      const user = authService.getUser();
      const companies = authService.getCompanies();
      return checkUserPermissions(user, companies, permission);
    }
  };
};

export default {
  requireAuth,
  requireGuest,
  requirePermission,
  initializeAuth,
  useAuth
};