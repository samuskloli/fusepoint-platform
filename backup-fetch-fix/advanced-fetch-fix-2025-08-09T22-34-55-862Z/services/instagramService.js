/**
 * Service Instagram API
 * Gère l'authentification OAuth et la récupération des statistiques Instagram
 * Utilise Instagram Basic Display API et Instagram Graph API
 */

class InstagramService {
  constructor() {
    // Configuration OAuth Instagram
    this.appId = import.meta.env.VITE_INSTAGRAM_APP_ID || import.meta.env.VITE_FACEBOOK_APP_ID || '';
    this.appSecret = import.meta.env.VITE_INSTAGRAM_APP_SECRET || import.meta.env.VITE_FACEBOOK_APP_SECRET || '';
    this.redirectUri = `${window.location.origin}/oauth/instagram/callback`;
    this.scope = 'user_profile,user_media';
    
    // URLs API Instagram
    this.baseUrl = 'https://graph.instagram.com';
    this.basicDisplayUrl = 'https://api.instagram.com';
    this.authUrl = 'https://api.instagram.com/oauth/authorize';
    this.tokenUrl = 'https://api.instagram.com/oauth/access_token';
    this.graphTokenUrl = 'https://graph.instagram.com/access_token';
    
    // État de l'utilisateur actuel
    this.currentUser = {
      accessToken: null,
      longLivedToken: null,
      userId: null,
      username: null,
      accountType: null, // PERSONAL, BUSINESS, CREATOR
      expiresAt: null,
      businessAccounts: []
    };
    
    // Charger les données utilisateur depuis le stockage
    this.loadUserData();
  }

  /**
   * Charge les données utilisateur depuis localStorage
   */
  loadUserData() {
    try {
      const userData = localStorage.getItem('ig_user_data');
      if (userData) {
        this.currentUser = JSON.parse(userData);
      }
    } catch (error) {
      console.error('Erreur lors du chargement des données Instagram:', error);
      this.resetUserData();
    }
  }

  /**
   * Sauvegarde les données utilisateur dans localStorage
   */
  saveUserData() {
    try {
      localStorage.setItem('ig_user_data', JSON.stringify(this.currentUser));
    } catch (error) {
      console.error('Erreur lors de la sauvegarde des données Instagram:', error);
    }
  }

  /**
   * Remet à zéro les données utilisateur
   */
  resetUserData() {
    this.currentUser = {
      accessToken: null,
      longLivedToken: null,
      userId: null,
      username: null,
      accountType: null,
      expiresAt: null,
      businessAccounts: []
    };
  }

  /**
   * Vérifie si l'utilisateur est connecté
   */
  isConnected() {
    return !!(this.currentUser.accessToken && !this.isTokenExpired());
  }

  /**
   * Vérifie si le token est expiré
   */
  isTokenExpired() {
    if (!this.currentUser.expiresAt) return true;
    return Date.now() >= this.currentUser.expiresAt;
  }

  /**
   * Génère l'URL d'autorisation OAuth
   */
  generateAuthUrl() {
    const state = this.generateState();
    localStorage.setItem('ig_oauth_state', state);

    const params = new URLSearchParams({
      client_id: this.appId,
      redirect_uri: this.redirectUri,
      scope: this.scope,
      response_type: 'code',
      state: state
    });

    return `${this.authUrl}?${params.toString()}`;
  }

  /**
   * Génère un state pour la sécurité CSRF
   */
  generateState() {
    return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
  }

  /**
   * Démarre le processus d'authentification
   */
  async authenticate() {
    try {
      if (!this.appId) {
        throw new Error('Instagram App ID non configuré');
      }

      const authUrl = this.generateAuthUrl();
      window.location.href = authUrl;
      
    } catch (error) {
      console.error('Erreur lors de l\'authentification Instagram:', error);
      throw new Error(`Erreur d'authentification Instagram: ${error.message}`);
    }
  }

  /**
   * Traite la callback OAuth et échange le code contre des tokens
   */
  async handleOAuthCallback(code, state) {
    try {
      // Vérifier le state pour la sécurité CSRF
      const storedState = localStorage.getItem('ig_oauth_state');
      if (state !== storedState) {
        throw new Error('État OAuth invalide');
      }

      // Échanger le code contre un access token
      const tokenResponse = await this.exchangeCodeForToken(code);
      
      // Obtenir un token longue durée
      const longLivedToken = await this.getLongLivedToken(tokenResponse.access_token);
      
      // Stocker les tokens
      this.currentUser.accessToken = longLivedToken.access_token;
      this.currentUser.longLivedToken = longLivedToken.access_token;
      this.currentUser.expiresAt = Date.now() + (longLivedToken.expires_in * 1000);
      this.currentUser.userId = tokenResponse.user_id;
      
      // Récupérer les informations utilisateur
      await this.loadUserProfile();
      
      this.saveUserData();
      localStorage.removeItem('ig_oauth_state');
      
      return {
        success: true,
        user: this.currentUser
      };
      
    } catch (error) {
      console.error('Erreur lors du traitement de la callback Instagram:', error);
      throw new Error(`Erreur de callback Instagram: ${error.message}`);
    }
  }

  /**
   * Échange le code d'autorisation contre un access token
   */
  async exchangeCodeForToken(code) {
    const formData = new FormData();
    formData.append('client_id', this.appId);
    formData.append('client_secret', this.appSecret);
    formData.append('grant_type', 'authorization_code');
    formData.append('redirect_uri', this.redirectUri);
    formData.append('code', code);

    const response = await fetch(this.tokenUrl, {
      method: 'POST',
      body: formData
    });
    
    if (!response.ok) {
      throw new Error('Erreur lors de l\'échange du code');
    }

    return await response.json();
  }

  /**
   * Obtient un token longue durée (60 jours)
   */
  async getLongLivedToken(shortLivedToken) {
    const params = new URLSearchParams({
      grant_type: 'ig_exchange_token',
      client_secret: this.appSecret,
      access_token: shortLivedToken
    });

    const response = await fetch(`${this.graphTokenUrl}?${params.toString()}`);
    
    if (!response.ok) {
      throw new Error('Erreur lors de l\'obtention du token longue durée');
    }

    return await response.json();
  }

  /**
   * Rafraîchit le token longue durée
   */
  async refreshLongLivedToken() {
    try {
      const params = new URLSearchParams({
        grant_type: 'ig_refresh_token',
        access_token: this.currentUser.longLivedToken
      });

      const response = await fetch(`${this.graphTokenUrl}?${params.toString()}`);
      
      if (!response.ok) {
        throw new Error('Erreur lors du rafraîchissement du token');
      }

      const tokenData = await response.json();
      
      this.currentUser.accessToken = tokenData.access_token;
      this.currentUser.longLivedToken = tokenData.access_token;
      this.currentUser.expiresAt = Date.now() + (tokenData.expires_in * 1000);
      
      this.saveUserData();
      
      return tokenData;
      
    } catch (error) {
      console.error('Erreur lors du rafraîchissement du token:', error);
      throw error;
    }
  }

  /**
   * Charge le profil utilisateur
   */
  async loadUserProfile() {
    try {
      const response = await this.makeAuthenticatedRequest('/me?fields=id,username,account_type,media_count');
      
      this.currentUser.username = response.username;
      this.currentUser.accountType = response.account_type;
      this.currentUser.mediaCount = response.media_count;
      
    } catch (error) {
      console.error('Erreur lors du chargement du profil:', error);
    }
  }

  /**
   * Effectue une requête authentifiée à l'API Instagram
   */
  async makeAuthenticatedRequest(endpoint, useBasicDisplay = false) {
    if (!this.isConnected()) {
      // Tenter de rafraîchir le token si expiré
      if (this.currentUser.longLivedToken && this.isTokenExpired()) {
        await this.refreshLongLivedToken();
      } else {
        throw new Error('Non connecté à Instagram');
      }
    }

    const baseUrl = useBasicDisplay ? this.basicDisplayUrl : this.baseUrl;
    const url = `${baseUrl}${endpoint}${endpoint.includes('?') ? '&' : '?'}access_token=${this.currentUser.accessToken}`;
    
    const response = await fetch(url);
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error?.message || 'Erreur API Instagram');
    }

    return await response.json();
  }

  /**
   * Récupère les médias de l'utilisateur
   */
  async getUserMedia(limit = 25, fields = 'id,caption,media_type,media_url,thumbnail_url,permalink,timestamp') {
    try {
      const endpoint = `/me/media?fields=${fields}&limit=${limit}`;
      const response = await this.makeAuthenticatedRequest(endpoint);
      
      // Récupérer les insights pour chaque média (si compte business)
      if (this.currentUser.accountType === 'BUSINESS') {
        const mediaWithInsights = await Promise.all(
          response.data.map(async (media) => {
            try {
              const insights = await this.getMediaInsights(media.id);
              return { ...media, insights };
            } catch (error) {
              console.warn(`Impossible de récupérer les insights pour le média ${media.id}:`, error);
              return { ...media, insights: null };
            }
          })
        );
        
        return {
          success: true,
          data: mediaWithInsights,
          paging: response.paging
        };
      }
      
      return {
        success: true,
        data: response.data,
        paging: response.paging
      };
      
    } catch (error) {
      console.error('Erreur lors de la récupération des médias:', error);
      throw new Error(`Erreur médias Instagram: ${error.message}`);
    }
  }

  /**
   * Récupère les insights d'un média (compte business uniquement)
   */
  async getMediaInsights(mediaId) {
    try {
      if (this.currentUser.accountType !== 'BUSINESS') {
        throw new Error('Les insights ne sont disponibles que pour les comptes business');
      }

      const metrics = ['impressions', 'reach', 'engagement', 'saves', 'profile_visits', 'website_clicks'];
      const endpoint = `/${mediaId}/insights?metric=${metrics.join(',')}`;
      
      const response = await this.makeAuthenticatedRequest(endpoint);
      
      return response.data;
      
    } catch (error) {
      console.error('Erreur lors de la récupération des insights de média:', error);
      return null;
    }
  }

  /**
   * Récupère les insights du compte (compte business uniquement)
   */
  async getAccountInsights(period = 'day', since = null, until = null) {
    try {
      if (this.currentUser.accountType !== 'BUSINESS') {
        throw new Error('Les insights ne sont disponibles que pour les comptes business');
      }

      // Définir la période par défaut (30 derniers jours)
      if (!since) {
        const date = new Date();
        date.setDate(date.getDate() - 30);
        since = date.toISOString().split('T')[0];
      }
      
      if (!until) {
        until = new Date().toISOString().split('T')[0];
      }

      const metrics = ['impressions', 'reach', 'profile_views', 'website_clicks'];
      const endpoint = `/me/insights?metric=${metrics.join(',')}&period=${period}&since=${since}&until=${until}`;
      
      const response = await this.makeAuthenticatedRequest(endpoint);
      
      return {
        success: true,
        data: response.data,
        period: { since, until },
        metrics: metrics
      };
      
    } catch (error) {
      console.error('Erreur lors de la récupération des insights de compte:', error);
      throw new Error(`Erreur insights Instagram: ${error.message}`);
    }
  }

  /**
   * Récupère les informations détaillées d'un média
   */
  async getMediaDetails(mediaId) {
    try {
      const fields = 'id,caption,media_type,media_url,thumbnail_url,permalink,timestamp,like_count,comments_count';
      const endpoint = `/${mediaId}?fields=${fields}`;
      
      const response = await this.makeAuthenticatedRequest(endpoint);
      
      // Ajouter les insights si disponibles
      if (this.currentUser.accountType === 'BUSINESS') {
        try {
          const insights = await this.getMediaInsights(mediaId);
          response.insights = insights;
        } catch (error) {
          console.warn('Insights non disponibles pour ce média:', error);
        }
      }
      
      return {
        success: true,
        data: response
      };
      
    } catch (error) {
      console.error('Erreur lors de la récupération des détails du média:', error);
      throw new Error(`Erreur détails média Instagram: ${error.message}`);
    }
  }

  /**
   * Récupère les hashtags populaires (simulation - Instagram ne fournit pas cette API publiquement)
   */
  async getPopularHashtags() {
    // Cette fonctionnalité nécessiterait une API tierce ou une analyse des médias existants
    return {
      success: true,
      data: [
        { tag: 'marketing', count: 1000000 },
        { tag: 'business', count: 800000 },
        { tag: 'entrepreneur', count: 600000 },
        { tag: 'socialmedia', count: 500000 },
        { tag: 'digitalmarketing', count: 400000 }
      ],
      note: 'Données simulées - API hashtags non disponible publiquement'
    };
  }

  /**
   * Déconnecte l'utilisateur
   */
  async disconnect() {
    try {
      this.resetUserData();
      localStorage.removeItem('ig_user_data');
      localStorage.removeItem('ig_oauth_state');
      
      return { success: true };
      
    } catch (error) {
      console.error('Erreur lors de la déconnexion Instagram:', error);
      throw new Error(`Erreur de déconnexion Instagram: ${error.message}`);
    }
  }

  /**
   * Récupère les informations de l'utilisateur connecté
   */
  getCurrentUser() {
    return {
      isConnected: this.isConnected(),
      userId: this.currentUser.userId,
      username: this.currentUser.username,
      accountType: this.currentUser.accountType,
      mediaCount: this.currentUser.mediaCount,
      expiresAt: this.currentUser.expiresAt
    };
  }

  /**
   * Vérifie si le compte est un compte business (pour les insights)
   */
  isBusinessAccount() {
    return this.currentUser.accountType === 'BUSINESS';
  }

  /**
   * Récupère un résumé des statistiques
   */
  async getStatsSummary() {
    try {
      const user = this.getCurrentUser();
      
      if (!user.isConnected) {
        throw new Error('Non connecté à Instagram');
      }

      const summary = {
        user: user,
        mediaCount: user.mediaCount || 0,
        accountType: user.accountType,
        hasInsights: this.isBusinessAccount()
      };

      // Ajouter les insights si compte business
      if (this.isBusinessAccount()) {
        try {
          const insights = await this.getAccountInsights();
          summary.insights = insights.data;
        } catch (error) {
          console.warn('Impossible de récupérer les insights:', error);
        }
      }

      return {
        success: true,
        data: summary
      };
      
    } catch (error) {
      console.error('Erreur lors de la récupération du résumé:', error);
      throw new Error(`Erreur résumé Instagram: ${error.message}`);
    }
  }
}

export default new InstagramService();