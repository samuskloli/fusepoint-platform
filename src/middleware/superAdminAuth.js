/**
 * Middleware d'authentification pour les Super Administrateurs
 */

export function requireSuperAdmin(to, from, next) {
  const token = localStorage.getItem('accessToken');
  const userStr = localStorage.getItem('user');
  const expiresAt = localStorage.getItem('tokenExpiresAt');
  
  if (!token || !userStr) {
    console.log('❌ Super Admin: Token ou utilisateur manquant');
    next('/login');
    return;
  }
  
  // Vérifier si le token n'est pas expiré
  if (expiresAt && new Date() >= new Date(expiresAt)) {
    console.log('❌ Super Admin: Token expiré, nettoyage et redirection');
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
  
  try {
    const user = JSON.parse(userStr);
    
    // Utiliser les nouvelles propriétés de permissions
    const hasAccess = user.isSuperAdmin || user.canAccessSuperAdmin || user.role === 'super_admin';
    
    if (!hasAccess) {
      console.log('❌ Super Admin: Accès refusé - permissions insuffisantes:', {
        role: user.role,
        isSuperAdmin: user.isSuperAdmin,
        canAccessSuperAdmin: user.canAccessSuperAdmin
      });
      // Rediriger vers le dashboard approprié selon les permissions
      if (user.canAccessAgent || user.role === 'agent' || user.role === 'admin') {
        next('/agent');
      } else {
        next('/dashboard');
      }
      return;
    }
    
    console.log('✅ Super Admin: Accès autorisé pour', user.email);
    next();
    
  } catch (error) {
    console.error('❌ Super Admin: Erreur parsing utilisateur:', error);
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('sessionToken');
    localStorage.removeItem('tokenExpiresAt');
    localStorage.removeItem('user');
    localStorage.removeItem('companies');
    next('/login');
  }
}

/**
 * Vérifier si l'utilisateur actuel est un Super Admin
 */
export function isSuperAdmin() {
  try {
    const userStr = localStorage.getItem('user');
    if (!userStr) return false;
    
    const user = JSON.parse(userStr);
    // Utiliser les nouvelles propriétés de permissions
    return user.isSuperAdmin || user.canAccessSuperAdmin || user.role === 'super_admin';
  } catch (error) {
    console.error('Erreur vérification Super Admin:', error);
    return false;
  }
}

/**
 * Obtenir les informations de l'utilisateur Super Admin
 */
export function getSuperAdminUser() {
  try {
    const userStr = localStorage.getItem('user');
    if (!userStr) return null;
    
    const user = JSON.parse(userStr);
    // Utiliser les nouvelles propriétés de permissions
    const hasAccess = user.isSuperAdmin || user.canAccessSuperAdmin || user.role === 'super_admin';
    if (!hasAccess) return null;
    
    return user;
  } catch (error) {
    console.error('Erreur récupération Super Admin:', error);
    return null;
  }
}