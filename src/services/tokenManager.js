/**
 * Gestionnaire centralisé des tokens d'authentification
 * Synchronise tous les intercepteurs Axios quand le token change
 */
class TokenManager {
  constructor() {
    this.subscribers = new Set();
    this.currentToken = null;
    this.refreshToken = null;
    this.sessionToken = null;
    
    // Initialiser avec les tokens existants
    this.loadTokensFromStorage();
    
    // Écouter les événements de rafraîchissement de token
    if (typeof window !== 'undefined') {
      window.addEventListener('tokenRefreshed', (event) => {
        console.log('🔄 Événement tokenRefreshed reçu');
        this.setTokens({
          accessToken: event.detail.accessToken,
          refreshToken: event.detail.refreshToken,
          sessionToken: this.sessionToken
        });
      });
    }
  }

  /**
   * Initialiser le gestionnaire de tokens
   */
  init() {
    console.log('🚀 Initialisation du TokenManager');
    this.loadTokensFromStorage();
    this.notifySubscribers();
  }

  /**
   * Charger les tokens depuis le localStorage
   */
  loadTokensFromStorage() {
    this.currentToken = localStorage.getItem('accessToken');
    this.refreshToken = localStorage.getItem('refreshToken');
    this.sessionToken = localStorage.getItem('sessionToken');
  }

  /**
   * Abonner une instance Axios aux changements de token
   */
  subscribe(axiosInstance, name = 'unknown') {
    console.log(`🔗 Abonnement de l'instance Axios: ${name}`);
    this.subscribers.add({ instance: axiosInstance, name });
    
    // Appliquer le token actuel immédiatement
    this.updateAxiosInstance(axiosInstance, this.currentToken);
  }

  /**
   * Désabonner une instance Axios
   */
  unsubscribe(axiosInstance) {
    this.subscribers.forEach(subscriber => {
      if (subscriber.instance === axiosInstance) {
        this.subscribers.delete(subscriber);
      }
    });
  }

  /**
   * Mettre à jour le token et notifier tous les abonnés
   */
  setTokens(tokens) {
    console.log('🔄 Mise à jour des tokens via TokenManager');
    
    // Stocker dans localStorage
    if (tokens.accessToken) {
      localStorage.setItem('accessToken', tokens.accessToken);
      this.currentToken = tokens.accessToken;
    }
    if (tokens.refreshToken) {
      localStorage.setItem('refreshToken', tokens.refreshToken);
      this.refreshToken = tokens.refreshToken;
    }
    if (tokens.sessionToken) {
      localStorage.setItem('sessionToken', tokens.sessionToken);
      this.sessionToken = tokens.sessionToken;
    }

    // Notifier tous les abonnés
    this.notifySubscribers();
  }

  /**
   * Supprimer les tokens et notifier tous les abonnés
   */
  clearTokens() {
    console.log('🗑️ Suppression des tokens via TokenManager');
    
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('sessionToken');
    
    this.currentToken = null;
    this.refreshToken = null;
    this.sessionToken = null;

    // Notifier tous les abonnés
    this.notifySubscribers();
  }

  /**
   * Obtenir le token d'accès actuel
   */
  getAccessToken() {
    return this.currentToken || localStorage.getItem('accessToken');
  }

  /**
   * Obtenir le refresh token actuel
   */
  getRefreshToken() {
    return this.refreshToken || localStorage.getItem('refreshToken');
  }

  /**
   * Obtenir le session token actuel
   */
  getSessionToken() {
    return this.sessionToken || localStorage.getItem('sessionToken');
  }

  /**
   * Notifier tous les abonnés du changement de token
   */
  notifySubscribers() {
    console.log(`📢 Notification de ${this.subscribers.size} instances Axios`);
    
    this.subscribers.forEach(subscriber => {
      this.updateAxiosInstance(subscriber.instance, this.currentToken);
      console.log(`✅ Instance ${subscriber.name} mise à jour`);
    });
  }

  /**
   * Mettre à jour une instance Axios avec le nouveau token
   */
  updateAxiosInstance(axiosInstance, token) {
    // N'efface PAS les intercepteurs existants (cela peut supprimer des intercepteurs
    // personnalisés comme la normalisation d'URL dans api.js). Utiliser les headers par défaut.
    const currentToken = token || this.getAccessToken();
    if (!axiosInstance.defaults) {
      axiosInstance.defaults = {};
    }
    if (!axiosInstance.defaults.headers) {
      axiosInstance.defaults.headers = {};
    }
    if (!axiosInstance.defaults.headers.common) {
      axiosInstance.defaults.headers.common = {};
    }
    if (currentToken) {
      axiosInstance.defaults.headers.common.Authorization = `Bearer ${currentToken}`;
    } else {
      // Supprimer l'en-tête si aucun token
      delete axiosInstance.defaults.headers.common.Authorization;
    }
  }

  /**
   * Rafraîchir le token via l'API
   */
  async refreshAccessToken() {
    const refreshToken = this.getRefreshToken();
    if (!refreshToken) {
      throw new Error('Aucun refresh token disponible');
    }

    try {
      console.log('🔄 Rafraîchissement du token via TokenManager');
      
      const response = await fetch('/api/auth/refresh', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ refreshToken })
      });

      if (!response.ok) {
        throw new Error('Échec du rafraîchissement du token');
      }

      const data = await response.json();
      
      if (data.success && data.data.accessToken) {
        // Mettre à jour les tokens via le gestionnaire
        this.setTokens({
          accessToken: data.data.accessToken,
          refreshToken: data.data.refreshToken || refreshToken,
          sessionToken: data.data.sessionToken || this.getSessionToken()
        });
        
        console.log('✅ Token rafraîchi avec succès');
        return data.data.accessToken;
      } else {
        throw new Error('Réponse invalide du serveur');
      }
    } catch (error) {
      console.error('❌ Erreur lors du rafraîchissement du token:', error);
      throw error;
    }
  }
}

// Instance singleton
const tokenManager = new TokenManager();

export default tokenManager;