import { useAuthStore } from '../stores/auth'

/**
 * Middleware pour vérifier les rôles d'utilisateur
 * @param {Array} allowedRoles - Rôles autorisés
 */
export const requireRole = (allowedRoles = []) => {
  return (to, from, next) => {
    const authStore = useAuthStore()
    
    // Vérifier si l'utilisateur est authentifié
    if (!authStore.isAuthenticated) {
      next('/login')
      return
    }
    
    // Vérifier si l'utilisateur a le bon rôle
    const userRole = authStore.user?.role
    
    if (!allowedRoles.includes(userRole)) {
      // Rediriger vers le dashboard principal si pas le bon rôle
      next('/dashboard')
      return
    }
    
    next()
  }
}

/**
 * Middleware spécifique pour les agents/admins
 */
export const requireAgent = (to, from, next) => {
  const authStore = useAuthStore()
  
  // Vérifier si l'utilisateur est authentifié
  if (!authStore.isAuthenticated) {
    next('/login')
    return
  }
  
  // Utiliser la logique du store pour vérifier l'accès agent
  if (authStore.isAgent || authStore.isSuperAdmin) {
    next()
    return
  }
  
  // Fallback sur la vérification de rôle classique
  const userRole = authStore.user?.role
  if (['admin', 'agent', 'super_admin'].includes(userRole)) {
    next()
    return
  }
  
  // Rediriger vers le dashboard principal si pas le bon rôle
  next('/dashboard')
}

/**
 * Middleware spécifique pour les admins
 */
export const requireAdmin = requireRole(['admin'])

/**
 * Fonction utilitaire pour vérifier les rôles dans les composants
 */
export const hasRole = (role) => {
  const authStore = useAuthStore()
  return authStore.user?.role === role
}

/**
 * Fonction utilitaire pour vérifier si l'utilisateur a un des rôles autorisés
 */
export const hasAnyRole = (roles = []) => {
  const authStore = useAuthStore()
  return roles.includes(authStore.user?.role)
}

/**
 * Fonction utilitaire pour vérifier si l'utilisateur est un agent ou admin
 */
export const isAgent = () => {
  return hasAnyRole(['admin', 'agent', 'super_admin'])
}

/**
 * Fonction utilitaire pour vérifier si l'utilisateur est un admin
 */
export const isAdmin = () => {
  return hasRole('admin')
}