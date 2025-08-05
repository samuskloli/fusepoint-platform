import { useAuthStore } from '@/stores/auth'

/**
 * Middleware d'authentification pour les prestataires
 * Vérifie que l'utilisateur est connecté et a le rôle 'prestataire'
 */
export const requirePrestataire = (to, from, next) => {
  const token = localStorage.getItem('accessToken')
  const user = JSON.parse(localStorage.getItem('user') || '{}')
  
  // Vérifier si l'utilisateur est connecté
  if (!token) {
    next('/login')
    return
  }
  
  // Vérifier si l'utilisateur a le rôle prestataire
  if (user.role !== 'prestataire') {
    // Rediriger vers le tableau de bord approprié selon le rôle
    switch (user.role) {
      case 'super_admin':
        next('/super-admin')
        break
      case 'agent':
        next('/agent')
        break
      default:
        next('/dashboard')
    }
    return
  }
  
  next()
}

/**
 * Middleware pour empêcher l'accès aux prestataires à certaines pages
 * Utilisé pour protéger les pages réservées aux clients/agents/admins
 */
export const blockPrestataire = (to, from, next) => {
  const user = JSON.parse(localStorage.getItem('user') || '{}')
  
  if (user.role === 'prestataire') {
    next('/prestataire/dashboard')
    return
  }
  
  next()
}