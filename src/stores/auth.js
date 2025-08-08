import { ref, computed } from 'vue'
import { defineStore } from 'pinia'
import authService from '../services/authService'

/**
 * Store d'authentification utilisant Pinia
 * Gère l'état d'authentification de l'utilisateur
 */
export const useAuthStore = defineStore('auth', () => {
  // État réactif
  const user = ref(null)
  const isLoading = ref(false)
  const error = ref(null)

  // Getters calculés
  const isAuthenticated = computed(() => {
    return authService.isAuthenticated()
  })

  const userRole = computed(() => {
    const userData = authService.getUser()
    return userData?.role || null
  })

  const isAdmin = computed(() => {
    return userRole.value === 'admin'
  })

  const isAgent = computed(() => {
    // Si super admin, il a accès à tout
    if (userRole.value === 'super_admin' || user.value?.isSuperAdmin) {
      return true
    }
    // Sinon, vérifier les permissions spécifiques
    if (user.value?.permissions?.canAccessAgent !== undefined) {
      return user.value.permissions.canAccessAgent
    }
    // Fallback sur l'ancien système
    return ['admin', 'agent'].includes(userRole.value)
  })

  const isSuperAdmin = computed(() => {
    // Utiliser la propriété isSuperAdmin du backend si disponible
    if (user.value?.isSuperAdmin !== undefined) {
      return user.value.isSuperAdmin
    }
    // Fallback sur l'ancien système
    return userRole.value === 'super_admin'
  })

  const token = computed(() => {
    return authService.getAccessToken()
  })

  // Actions
  const login = async (credentials) => {
    isLoading.value = true
    error.value = null
    
    try {
      // Extraire email et password des credentials
      const { email, password } = credentials
      console.log('🔐 Tentative de connexion pour:', email)
      const response = await authService.login(email, password)
      
      if (response.success && response.user) {
        user.value = response.user
        console.log('✅ Connexion réussie:', response.user)
        
        console.log('🔄 Rafraîchissement des informations utilisateur...')
        // Rafraîchir immédiatement les informations utilisateur pour obtenir les rôles multiples
        try {
          const userInfoResponse = await authService.getCurrentUser()
          if (userInfoResponse.user) {
            user.value = userInfoResponse.user
            console.log('✅ Informations utilisateur enrichies après connexion:', userInfoResponse.user)
          }
        } catch (refreshError) {
          console.warn('⚠️ Impossible de rafraîchir les informations utilisateur après connexion:', refreshError)
          // Continuer avec les données de connexion
        }
        
        console.log('✅ Connexion terminée avec succès')
        return { success: true, user: user.value }
      } else {
        throw new Error(response.message || 'Réponse de connexion invalide')
      }
    } catch (err) {
      console.error('❌ Erreur de connexion:', err)
      error.value = err.message || 'Erreur de connexion'
      return { success: false, error: error.value }
    } finally {
      isLoading.value = false
    }
  }

  const logout = async () => {
    try {
      await authService.logout()
      user.value = null
      error.value = null
    } catch (err) {
      console.error('Erreur lors de la déconnexion:', err)
    }
  }

  const register = async (userData) => {
    try {
      isLoading.value = true
      error.value = null
      
      const response = await authService.register(userData)
      
      if (response.success) {
        user.value = response.user
        return response
      } else {
        throw new Error(response.message || 'Erreur d\'inscription')
      }
    } catch (err) {
      error.value = err.message
      throw err
    } finally {
      isLoading.value = false
    }
  }

  const refreshToken = async () => {
    try {
      const response = await authService.refreshToken()
      if (response.success) {
        user.value = response.user
        return response
      }
    } catch (err) {
      console.error('Erreur lors du rafraîchissement du token:', err)
      await logout()
    }
  }

  const initializeAuth = async () => {
    try {
      const userData = authService.getUser()
      if (userData && authService.isAuthenticated()) {
        user.value = userData
        console.log('🔄 État utilisateur restauré après rafraîchissement:', userData)
        
        // Rafraîchir les informations utilisateur depuis le serveur pour obtenir les rôles multiples
        try {
          const response = await authService.getCurrentUser()
          if (response.user) {
            user.value = response.user
            console.log('✅ Informations utilisateur mises à jour avec rôles multiples:', response.user)
          }
        } catch (refreshError) {
          console.warn('⚠️ Impossible de rafraîchir les informations utilisateur:', refreshError)
          // Continuer avec les données locales
        }
      } else {
        console.log('⚠️ Aucun utilisateur authentifié trouvé lors de l\'initialisation')
      }
    } catch (err) {
      console.error('Erreur lors de l\'initialisation de l\'authentification:', err)
    }
  }

  const hasRole = (role) => {
    return userRole.value === role
  }

  const hasAnyRole = (roles) => {
    return roles.includes(userRole.value)
  }

  // Initialiser l'authentification au chargement du store
  initializeAuth()

  return {
    // État
    user,
    isLoading,
    error,
    
    // Getters
    isAuthenticated,
    userRole,
    isAdmin,
    isAgent,
    isSuperAdmin,
    token,
    
    // Actions
    login,
    logout,
    register,
    refreshToken,
    initializeAuth,
    hasRole,
    hasAnyRole
  }
})