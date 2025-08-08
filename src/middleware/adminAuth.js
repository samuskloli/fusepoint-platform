import { useAuthStore } from '../stores/auth.js'

/**
 * Middleware pour vérifier si l'utilisateur a les droits admin ou super_admin
 * @param {Object} to - Route de destination
 * @param {Object} from - Route d'origine
 * @param {Function} next - Fonction de navigation
 */
export function requireAdmin(to, from, next) {
  const token = localStorage.getItem('accessToken');
  const userStr = localStorage.getItem('user');
  const expiresAt = localStorage.getItem('tokenExpiresAt');
  
  if (!token || !userStr) {
    console.log('❌ Admin: Token ou utilisateur manquant');
    next('/login');
    return;
  }
  
  // Vérifier si le token n'est pas expiré
  if (expiresAt && new Date() >= new Date(expiresAt)) {
    console.log('❌ Admin: Token expiré, nettoyage et redirection');
    // Token expiré, nettoyer et rediriger
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('sessionToken');
    localStorage.removeItem('tokenExpiresAt');
    localStorage.removeItem('user');
    next('/login');
    return;
  }
  
  try {
    const user = JSON.parse(userStr);
    const authStore = useAuthStore();
    
    // Vérifier si l'utilisateur est admin ou super_admin
    if (authStore.isAdmin || authStore.isSuperAdmin || user.role === 'admin' || user.role === 'super_admin') {
      console.log('✅ Admin: Accès autorisé pour', user.role);
      next();
    } else {
      console.log('❌ Admin: Accès refusé pour le rôle', user.role);
      next('/dashboard');
    }
  } catch (error) {
    console.error('❌ Admin: Erreur lors de la vérification:', error);
    next('/login');
  }
}

/**
 * Middleware pour vérifier si l'utilisateur a les droits admin, agent ou super_admin
 * @param {Object} to - Route de destination
 * @param {Object} from - Route d'origine
 * @param {Function} next - Fonction de navigation
 */
export function requireAdminOrAgent(to, from, next) {
  const token = localStorage.getItem('accessToken');
  const userStr = localStorage.getItem('user');
  const expiresAt = localStorage.getItem('tokenExpiresAt');
  
  if (!token || !userStr) {
    console.log('❌ Admin/Agent: Token ou utilisateur manquant');
    next('/login');
    return;
  }
  
  // Vérifier si le token n'est pas expiré
  if (expiresAt && new Date() >= new Date(expiresAt)) {
    console.log('❌ Admin/Agent: Token expiré, nettoyage et redirection');
    // Token expiré, nettoyer et rediriger
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('sessionToken');
    localStorage.removeItem('tokenExpiresAt');
    localStorage.removeItem('user');
    next('/login');
    return;
  }
  
  try {
    const user = JSON.parse(userStr);
    const authStore = useAuthStore();
    
    // Vérifier si l'utilisateur est admin, agent ou super_admin
    if (authStore.isAdmin || authStore.isAgent || authStore.isSuperAdmin || 
        user.role === 'admin' || user.role === 'agent' || user.role === 'super_admin') {
      console.log('✅ Admin/Agent: Accès autorisé pour', user.role);
      next();
    } else {
      console.log('❌ Admin/Agent: Accès refusé pour le rôle', user.role);
      next('/dashboard');
    }
  } catch (error) {
    console.error('❌ Admin/Agent: Erreur lors de la vérification:', error);
    next('/login');
  }
}