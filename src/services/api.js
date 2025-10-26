import axios from 'axios'
import tokenManager from './tokenManager.js'

// Déterminer une base relative quand l'app est servie via une IP locale
const apiEnv = import.meta.env.VITE_API_URL
const backendEnv = import.meta.env.VITE_BACKEND_URL
const host = typeof window !== 'undefined' ? window.location.hostname : ''
const isLocalNetworkHost = !!host && host !== 'localhost' && host !== '127.0.0.1'

// Si l'app est ouverte via une IP locale (ex: 192.168.x.x), utiliser base relative
const baseURL = isLocalNetworkHost
  ? ''
  : (apiEnv && apiEnv.startsWith('http')
      ? apiEnv.replace(/\/+$/, '')
      : backendEnv && backendEnv.startsWith('http')
        ? backendEnv.replace(/\/+$/, '')
        : '') // par défaut, relatif à l'origine (Vite proxy gère '/api')

// Configuration de base pour les requêtes API
const api = axios.create({
  baseURL,
  timeout: 20000,
  headers: {
    'Content-Type': 'application/json'
  },
  withCredentials: true
})

// Abonner cette instance au gestionnaire de tokens centralisé
tokenManager.subscribe(api, 'api.js')

// Note: L'intercepteur de requête est maintenant géré par le TokenManager

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

    // Gestion 401: rafraîchissement token (chemin toujours relatif)
    if (status === 401 && !originalRequest._retry) {
      originalRequest._retry = true
      try {
        await axios.post('/api/auth/refresh', {}, { withCredentials: true })
        const newToken = localStorage.getItem('accessToken')
        if (newToken) {
          originalRequest.headers = originalRequest.headers || {}
          originalRequest.headers.Authorization = `Bearer ${newToken}`
        }
        return api(originalRequest)
      } catch (refreshError) {
        localStorage.removeItem('accessToken')
        return Promise.reject(refreshError)
      }
    }

    return Promise.reject(error)
  }
)

export default api