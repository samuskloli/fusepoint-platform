import axios from 'axios'

// Configuration de base pour les requêtes API
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3000',
  timeout: 20000,
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
    const status = error.response?.status || 0
    const data = error.response?.data || {}
    const message = data.message || data.error || error.message || 'Erreur serveur'

    // Attacher un message normalisé pour éviter les 'undefined'
    error.userMessage = message
    error.status = status
    error.payload = data

    // Gestion des erreurs globales
    if (status === 401 && !originalRequest._retry) {
      const isDeleteRequest = error.config?.method === 'delete' && error.config?.url?.includes('/clients/')
      const hasPasswordInMessage = (data.message || '').toLowerCase().includes('mot de passe') || (data.message || '').toLowerCase().includes('password')
      const hasPasswordInError = (data.error || '').toLowerCase().includes('mot de passe') || (data.error || '').toLowerCase().includes('password')
      const isDeletePasswordError = isDeleteRequest && (hasPasswordInMessage || hasPasswordInError)

      if (!isDeletePasswordError) {
        const refreshToken = localStorage.getItem('refreshToken')
        if (refreshToken) {
          originalRequest._retry = true
          try {
            const backendUrl = import.meta.env.VITE_API_URL || api.defaults.baseURL || 'http://localhost:3000'
            const response = await axios.post(`${backendUrl}/api/auth/refresh`, { refreshToken })
            const { accessToken } = response.data
            localStorage.setItem('accessToken', accessToken)
            originalRequest.headers.Authorization = `Bearer ${accessToken}`
            return api(originalRequest)
          } catch (refreshError) {
            localStorage.removeItem('accessToken')
            localStorage.removeItem('refreshToken')
            localStorage.removeItem('sessionToken')
            localStorage.removeItem('user')
            window.location.href = '/login'
          }
        } else {
          localStorage.removeItem('accessToken')
          localStorage.removeItem('refreshToken')
          localStorage.removeItem('sessionToken')
          localStorage.removeItem('user')
          window.location.href = '/login'
        }
      }
    } else if (status === 403) {
      console.error('Accès refusé:', message)
    } else if (status >= 500) {
      console.error('Erreur serveur:', message)
    }

    return Promise.reject(error)
  }
)

export default api