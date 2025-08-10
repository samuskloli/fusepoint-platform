import axios from 'axios'

// Configuration de base pour les requêtes API
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3000',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json'
  },
  withCredentials: true
})

// Intercepteur pour les requêtes
api.interceptors.request.use(
  (config) => {
    // Ajouter le token d'authentification si disponible
    const token = localStorage.getItem('accessToken')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// Intercepteur pour les réponses
api.interceptors.response.use(
  (response) => {
    return response
  },
  async (error) => {
    const originalRequest = error.config
    
    // Gestion des erreurs globales
    if (error.response?.status === 401 && !originalRequest._retry) {
      // Vérifier si c'est une erreur de mot de passe pour la suppression
      const isDeleteRequest = error.config?.method === 'delete' && error.config?.url?.includes('/clients/')
      const hasPasswordInMessage = error.response?.data?.message?.toLowerCase().includes('mot de passe') || 
                                  error.response?.data?.message?.toLowerCase().includes('password')
      const hasPasswordInError = error.response?.data?.error?.toLowerCase().includes('mot de passe') || 
                                error.response?.data?.error?.toLowerCase().includes('password')
      
      const isDeletePasswordError = isDeleteRequest && (hasPasswordInMessage || hasPasswordInError)
      
      console.log('🔍 Intercepteur 401 - URL:', error.config?.url)
      console.log('🔍 Intercepteur 401 - Method:', error.config?.method)
      console.log('🔍 Intercepteur 401 - Message:', error.response?.data?.message)
      console.log('🔍 Intercepteur 401 - Error:', error.response?.data?.error)
      console.log('🔍 Intercepteur 401 - isDeletePasswordError:', isDeletePasswordError)
      
      if (!isDeletePasswordError) {
        // Essayer de rafraîchir le token avant de déconnecter
        const refreshToken = localStorage.getItem('refreshToken')
        if (refreshToken) {
          originalRequest._retry = true
          
          try {
            console.log('🔄 Tentative de rafraîchissement du token...')
            const response = await axios.post(`${import.meta.env.VITE_BACKEND_URL || 'http://localhost:3000'}/api/auth/refresh`, {
              refreshToken
            })
            
            const { accessToken } = response.data
            localStorage.setItem('accessToken', accessToken)
            
            // Réessayer la requête originale avec le nouveau token
            originalRequest.headers.Authorization = `Bearer ${accessToken}`
            return api(originalRequest)
          } catch (refreshError) {
            console.log('❌ Échec du rafraîchissement du token, déconnexion...')
            // Seulement maintenant on déconnecte l'utilisateur
            localStorage.removeItem('accessToken')
            localStorage.removeItem('refreshToken')
            localStorage.removeItem('sessionToken')
            localStorage.removeItem('user')
            window.location.href = '/login'
          }
        } else {
          console.log('🚪 Pas de refresh token, déconnexion automatique')
          localStorage.removeItem('accessToken')
          localStorage.removeItem('refreshToken')
          localStorage.removeItem('sessionToken')
          localStorage.removeItem('user')
          window.location.href = '/login'
        }
      } else {
        console.log('🔒 Erreur de mot de passe détectée - pas de déconnexion')
      }
    } else if (error.response?.status === 403) {
      // Accès refusé
      console.error('Accès refusé:', error.response.data?.message)
    } else if (error.response?.status >= 500) {
      // Erreur serveur
      console.error('Erreur serveur:', error.response.data?.message)
    }
    
    return Promise.reject(error)
  }
)

export default api