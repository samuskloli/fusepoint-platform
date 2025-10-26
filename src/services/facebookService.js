/**
 * Service Facebook Marketing API
 * Gère l'authentification OAuth et la récupération des statistiques Facebook
 */

class FacebookService {
  constructor() {
    // Configuration OAuth Facebook
    this.appId = import.meta.env.VITE_FACEBOOK_APP_ID || '';
    this.appSecret = import.meta.env.VITE_FACEBOOK_APP_SECRET || '';
    this.redirectUri = `${window.location.origin}/oauth/facebook/callback`;
    // Permissions Facebook - Configuration avec permissions avancées
    this.scope = 'email,public_profile,pages_show_list,pages_read_engagement,read_insights,business_management';
    
    // URLs API Facebook Graph
    this.baseUrl = 'https://graph.facebook.com/v18.0';
    this.authUrl = 'https://www.facebook.com/v18.0/dialog/oauth';
    this.tokenUrl = 'https://graph.facebook.com/v18.0/oauth/access_token';
    
    // État de l'utilisateur actuel
    this.currentUser = {
      accessToken: null,
      longLivedToken: null,
      pageTokens: {},
      expiresAt: null,
      userId: null,
      pages: [],
      instagramAccounts: []
    };
    
    // Charger les données utilisateur depuis le stockage
    this.loadUserData();
  }

  /**
   * Charge les données utilisateur depuis localStorage
   */
  loadUserData() {
    try {
      const userData = localStorage.getItem('fb_user_data');
      if (userData) {
        this.currentUser = JSON.parse(userData);
      }
    } catch (error) {
      console.error('Erreur lors du chargement des données Facebook:', error);
      this.resetUserData();
    }
  }

  /**
   * Sauvegarde les données utilisateur dans localStorage
   */
  saveUserData() {
    try {
      localStorage.setItem('fb_user_data', JSON.stringify(this.currentUser));
    } catch (error) {
      console.error('Erreur lors de la sauvegarde des données Facebook:', error);
    }
  }

  /**
   * Remet à zéro les données utilisateur
   */
  resetUserData() {
    this.currentUser = {
      accessToken: null,
      longLivedToken: null,
      pageTokens: {},
      expiresAt: null,
      userId: null,
      pages: [],
      instagramAccounts: []
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
    localStorage.setItem('fb_oauth_state', state);

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
        throw new Error('Facebook App ID non configuré');
      }

      const authUrl = this.generateAuthUrl();
      window.location.href = authUrl;
      
    } catch (error) {
      console.error('Erreur lors de l\'authentification Facebook:', error);
      throw new Error(`Erreur d'authentification Facebook: ${error.message}`);
    }
  }

  /**
   * Traite la callback OAuth et échange le code contre des tokens
   */
  async handleOAuthCallback(code, state) {
    try {
      console.log('🔄 Début du traitement de la callback Facebook...');
      
      // Vérifier le state pour la sécurité CSRF
      const storedState = localStorage.getItem('fb_oauth_state');
      if (state !== storedState) {
        throw new Error('État OAuth invalide');
      }

      // Échanger le code contre un access token via le backend
      console.log('🔑 Échange du code contre un token...');
      const tokenResponse = await this.exchangeCodeForToken(code);
      
      // Stocker les tokens (le backend retourne déjà un token longue durée)
      this.currentUser.accessToken = tokenResponse.access_token;
      this.currentUser.longLivedToken = tokenResponse.access_token;
      
      // Vérification et correction de expires_in
      let expiresIn = tokenResponse.expires_in;
      if (!expiresIn || expiresIn <= 0) {
        console.warn('⚠️ expires_in invalide reçu du backend:', expiresIn);
        console.log('🔧 Application d\'une durée par défaut (60 jours) pour token longue durée Facebook');
        expiresIn = 60 * 24 * 60 * 60; // 60 jours en secondes (durée standard Facebook)
      }
      
      this.currentUser.expiresAt = Date.now() + (expiresIn * 1000);
      console.log('⏰ Token configuré avec expiration dans', Math.floor(expiresIn / (24 * 60 * 60)), 'jours');
      
      // Sauvegarder immédiatement les tokens pour éviter les problèmes de timing
      this.saveUserData();
      console.log('💾 Tokens sauvegardés');
      
      // Vérifier que la connexion est maintenant active
      if (!this.isConnected()) {
        throw new Error('Échec de l\'établissement de la connexion après l\'obtention du token');
      }
      
      // Récupérer l'ID utilisateur
      console.log('👤 Récupération de l\'ID utilisateur...');
      this.currentUser.userId = await this.getUserId();
      
      // Récupérer les pages gérées
      console.log('📄 Chargement des pages...');
      await this.loadUserPages();
      
      // Sauvegarder les données complètes
      this.saveUserData();
      localStorage.removeItem('fb_oauth_state');
      
      console.log('✅ Callback Facebook traitée avec succès');
      
      return {
        success: true,
        user: this.currentUser
      };
      
    } catch (error) {
      console.error('❌ Erreur lors du traitement de la callback Facebook:', error);
      
      // Diagnostic détaillé de l'erreur
      console.error('🔍 État du service au moment de l\'erreur:', {
        accessToken: this.currentUser.accessToken ? 'présent' : 'manquant',
        isConnected: this.isConnected(),
        expiresAt: this.currentUser.expiresAt
      });
      
      // Nettoyer en cas d'erreur
      this.resetUserData();
      localStorage.removeItem('fb_oauth_state');
      
      throw new Error(`Erreur de callback Facebook: ${error.message}`);
    }
  }

  /**
   * Échange le code d'autorisation contre un access token via le backend
   */
  async exchangeCodeForToken(code) {
    const backendUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:3004';
    
    const response = await fetch(`${backendUrl}/api/facebook/oauth/exchange`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        code: code,
        state: localStorage.getItem('fb_oauth_state')
      })
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Erreur lors de l\'échange du code');
    }

    const data = await response.json();
    return {
      access_token: data.data.accessToken,
      expires_in: data.data.expiresIn
    };
  }

  /**
   * Obtient un token longue durée
   */
  async getLongLivedToken(shortLivedToken) {
    const params = new URLSearchParams({
      grant_type: 'fb_exchange_token',
      client_id: this.appId,
      client_secret: this.appSecret,
      fb_exchange_token: shortLivedToken
    });

    const response = await fetch(`${this.tokenUrl}?${params.toString()}`);
    
    if (!response.ok) {
      throw new Error('Erreur lors de l\'obtention du token longue durée');
    }

    return await response.json();
  }

  /**
   * Récupère l'ID utilisateur
   */
  async getUserId() {
    const response = await this.makeAuthenticatedRequest('/me?fields=id,name');
    return response.id;
  }

  /**
   * Charge les pages gérées par l'utilisateur
   */
  async loadUserPages() {
    try {
      console.log('🔄 Chargement des pages Facebook...');
      const response = await this.makeAuthenticatedRequest('/me/accounts?fields=id,name,access_token,category,instagram_business_account');
      
      this.currentUser.pages = response.data || [];
      console.log(`📄 ${this.currentUser.pages.length} page(s) trouvée(s)`);
      
      if (this.currentUser.pages.length === 0) {
        console.warn('⚠️ Aucune page Facebook trouvée. Vérifiez:');
        console.warn('   1. Que vous gérez des pages Facebook');
        console.warn('   2. Les permissions pages_show_list et business_management');
        console.warn('   3. Que votre app Facebook est configurée correctement');
      }
      
      // Stocker les tokens de page
      this.currentUser.pageTokens = {};
      this.currentUser.pages.forEach(page => {
        this.currentUser.pageTokens[page.id] = page.access_token;
        console.log(`✅ Page: ${page.name} (${page.category})`);
      });
      
      // Charger les comptes Instagram associés
      await this.loadInstagramAccounts();
      
    } catch (error) {
      console.error('❌ Erreur lors du chargement des pages:', error);
      this.currentUser.pages = [];
      
      // Diagnostic de l'erreur
      if (error.message.includes('permissions')) {
        console.error('🔧 Solution: Vérifiez les permissions Facebook dans votre app');
      } else if (error.message.includes('token')) {
        console.error('🔧 Solution: Reconnectez-vous à Facebook');
      }
    }
  }

  /**
   * Effectue une requête authentifiée à l'API Facebook
   */
  async makeAuthenticatedRequest(endpoint, pageId = null) {
    if (!this.isConnected()) {
      throw new Error('Non connecté à Facebook');
    }

    // Utiliser le token de page si spécifié, sinon le token utilisateur
    const token = pageId && this.currentUser.pageTokens[pageId] 
      ? this.currentUser.pageTokens[pageId] 
      : this.currentUser.accessToken;

    const url = `${this.baseUrl}${endpoint}${endpoint.includes('?') ? '&' : '?'}access_token=${token}`;
    
    const response = await fetch(url);
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error?.message || 'Erreur API Facebook');
    }

    return await response.json();
  }

  /**
   * Récupère les statistiques d'une page
   */
  async getPageInsights(pageId, period = 'day', since = null, until = null) {
    try {
      // Métriques de base pour les pages (mises à jour pour éviter les métriques dépréciées)
      const metrics = [
        'page_fans',
        'page_impressions_unique',
        'page_total_actions'
      ];
      
      // Construire les paramètres de date
      let dateParams = '';
      if (since && until) {
        dateParams = `&since=${since}&until=${until}`;
      } else {
        // Par défaut, récupérer les données des 30 derniers jours
        const endDate = new Date();
        const startDate = new Date();
        startDate.setDate(endDate.getDate() - 30);
        dateParams = `&since=${startDate.toISOString().split('T')[0]}&until=${endDate.toISOString().split('T')[0]}`;
      }
      
      const response = await this.makeAuthenticatedRequest(
        `/${pageId}/insights?metric=${metrics.join(',')}&period=${period}${dateParams}`
      );
      
      if (response.data) {
        // Transformer les données en format plus utilisable
        const insights = {};
        response.data.forEach(metric => {
          const latestValue = metric.values && metric.values.length > 0 
            ? metric.values[metric.values.length - 1].value 
            : 0;
          insights[metric.name] = latestValue;
        });
        
        return {
          success: true,
          data: insights
        };
      }
      
      return {
        success: false,
        error: 'Aucune donnée reçue',
        data: null
      };
      
    } catch (error) {
      console.error('Erreur lors de la récupération des insights:', error);
      return {
        success: false,
        error: error.message || 'Erreur lors de la récupération des insights',
        data: null
      };
    }
  }

  /**
   * Récupère les posts d'une page avec leurs statistiques
   */
  async getPagePosts(pageId, limit = 10) {
    try {
      const response = await this.makeAuthenticatedRequest(
        `/${pageId}/posts?fields=id,message,created_time,story,full_picture,permalink_url&limit=${limit}`
      );
      
      if (response.data) {
        // Charger les insights pour chaque post
        const postsWithInsights = await Promise.all(
          response.data.map(async (post) => {
            try {
              const insights = await this.getPostInsights(post.id);
              return {
                ...post,
                insights: insights.success ? insights.data : null
              };
            } catch (error) {
              console.warn(`Erreur lors du chargement des insights pour le post ${post.id}:`, error);
              return post;
            }
          })
        );
        
        return {
          success: true,
          data: postsWithInsights
        };
      }
      
      return {
        success: false,
        error: 'Aucune donnée reçue',
        data: []
      };
      
    } catch (error) {
      console.error('Erreur lors de la récupération des posts:', error);
      return {
        success: false,
        error: error.message || 'Erreur lors de la récupération des posts',
        data: []
      };
    }
  }

  /**
   * Récupère les statistiques d'un post
   */
  async getPostInsights(postId, pageId) {
    try {
      const metrics = ['post_impressions', 'post_clicks', 'post_reactions_by_type_total'];
      const endpoint = `/${postId}/insights?metric=${metrics.join(',')}`;
      
      const response = await this.makeAuthenticatedRequest(endpoint, pageId);
      
      return response.data;
      
    } catch (error) {
      console.error('Erreur lors de la récupération des insights de post:', error);
      return null;
    }
  }

  /**
   * Déconnecte l'utilisateur
   */
  async disconnect() {
    try {
      this.resetUserData();
      localStorage.removeItem('fb_user_data');
      localStorage.removeItem('fb_oauth_state');
      
      return { success: true };
      
    } catch (error) {
      console.error('Erreur lors de la déconnexion Facebook:', error);
      throw new Error(`Erreur de déconnexion Facebook: ${error.message}`);
    }
  }

  /**
   * Récupère les pages disponibles
   */
  getAvailablePages() {
    const pages = this.currentUser.pages || [];
    
    if (pages.length === 0) {
      console.warn('⚠️ getAvailablePages(): Aucune page disponible');
      console.warn('🔧 Essayez de vous reconnecter à Facebook ou vérifiez vos permissions');
    }
    
    return {
      success: true,
      data: pages
    };
  }

  /**
   * Charge les comptes Instagram associés aux pages Facebook
   */
  async loadInstagramAccounts() {
    try {
      console.log('📱 Chargement des comptes Instagram...');
      this.currentUser.instagramAccounts = [];
      
      if (!this.currentUser.pages || this.currentUser.pages.length === 0) {
        console.warn('⚠️ Aucune page disponible pour charger les comptes Instagram');
        return;
      }
      
      let pagesWithInstagram = 0;
      
      for (const page of this.currentUser.pages) {
        if (page.instagram_business_account) {
          pagesWithInstagram++;
          try {
            const instagramData = await this.makeAuthenticatedRequest(
              `/${page.instagram_business_account.id}?fields=id,username,name,profile_picture_url,followers_count,media_count`,
              page.id
            );
            
            this.currentUser.instagramAccounts.push({
              ...instagramData,
              pageId: page.id,
              pageName: page.name
            });
            
            console.log(`✅ Compte Instagram: @${instagramData.username} (${page.name})`);
          } catch (error) {
            console.warn(`❌ Impossible de charger le compte Instagram pour la page ${page.name}:`, error);
          }
        }
      }
      
      console.log(`📱 ${this.currentUser.instagramAccounts.length} compte(s) Instagram chargé(s)`);
      
      if (pagesWithInstagram === 0) {
        console.warn('⚠️ Aucune page n\'a de compte Instagram Business connecté.');
        console.warn('🔧 Pour connecter Instagram:');
        console.warn('   1. Allez sur votre page Facebook');
        console.warn('   2. Paramètres > Instagram');
        console.warn('   3. Connectez un compte Instagram Business');
      }
      
    } catch (error) {
      console.error('❌ Erreur lors du chargement des comptes Instagram:', error);
      this.currentUser.instagramAccounts = [];
    }
  }

  /**
   * Récupère les métriques d'un compte Instagram
   */
  async getInstagramInsights(instagramAccountId, pageId, metrics = ['impressions', 'reach', 'profile_views'], period = 'day', since = null, until = null) {
    try {
      if (!instagramAccountId) {
        throw new Error('ID de compte Instagram requis');
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

      const metricsParam = metrics.join(',');
      const endpoint = `/${instagramAccountId}/insights?metric=${metricsParam}&period=${period}&since=${since}&until=${until}`;
      
      const response = await this.makeAuthenticatedRequest(endpoint, pageId);
      
      return {
        success: true,
        data: response.data,
        instagramAccountId: instagramAccountId,
        period: { since, until },
        metrics: metrics
      };
      
    } catch (error) {
      console.error('Erreur lors de la récupération des insights Instagram:', error);
      throw new Error(`Erreur insights Instagram: ${error.message}`);
    }
  }

  /**
   * Récupère les posts Instagram d'un compte avec leurs métriques
   */
  async getInstagramMedia(instagramAccountId, pageId, limit = 25) {
    try {
      const endpoint = `/${instagramAccountId}/media?fields=id,caption,media_type,media_url,permalink,timestamp,like_count,comments_count&limit=${limit}`;
      const response = await this.makeAuthenticatedRequest(endpoint, pageId);
      
      // Récupérer les insights pour chaque post
      const mediaWithInsights = await Promise.all(
        response.data.map(async (media) => {
          try {
            const insights = await this.getInstagramMediaInsights(media.id, pageId);
            return { ...media, insights };
          } catch (error) {
            console.warn(`Impossible de récupérer les insights pour le media ${media.id}:`, error);
            return { ...media, insights: null };
          }
        })
      );
      
      return {
        success: true,
        data: mediaWithInsights,
        instagramAccountId: instagramAccountId
      };
      
    } catch (error) {
      console.error('Erreur lors de la récupération des médias Instagram:', error);
      throw new Error(`Erreur médias Instagram: ${error.message}`);
    }
  }

  /**
   * Récupère les métriques d'un post Instagram
   */
  async getInstagramMediaInsights(mediaId, pageId) {
    try {
      const metrics = ['impressions', 'reach', 'engagement'];
      const endpoint = `/${mediaId}/insights?metric=${metrics.join(',')}`;
      
      const response = await this.makeAuthenticatedRequest(endpoint, pageId);
      
      return response.data;
      
    } catch (error) {
      console.error('Erreur lors de la récupération des insights de média Instagram:', error);
      return null;
    }
  }

  /**
   * Récupère les comptes Instagram disponibles
   */
  getAvailableInstagramAccounts() {
    const accounts = this.currentUser.instagramAccounts || [];
    
    if (accounts.length === 0) {
      console.warn('⚠️ getAvailableInstagramAccounts(): Aucun compte Instagram disponible');
      console.warn('🔧 Vérifiez que vos pages Facebook ont des comptes Instagram Business connectés');
    }
    
    return {
      success: true,
      data: accounts
    };
  }

  /**
   * Méthode de diagnostic pour vérifier l'état du service Facebook
   * @returns {Object} Rapport de diagnostic détaillé
   */
  getDiagnosticReport() {
    const report = {
      timestamp: new Date().toISOString(),
      isConnected: this.isConnected(),
      hasValidToken: !!this.currentUser.accessToken,
      tokenExpired: this.isTokenExpired(),
      userId: this.currentUser.userId,
      pagesCount: (this.currentUser.pages || []).length,
      instagramAccountsCount: (this.currentUser.instagramAccounts || []).length,
      pages: [],
      instagramAccounts: [],
      issues: [],
      suggestions: []
    };

    // Analyser les pages
    if (this.currentUser.pages) {
      report.pages = this.currentUser.pages.map(page => ({
        id: page.id,
        name: page.name,
        category: page.category,
        hasToken: !!page.access_token,
        hasInstagram: !!page.instagram_business_account
      }));
    }

    // Analyser les comptes Instagram
    if (this.currentUser.instagramAccounts) {
      report.instagramAccounts = this.currentUser.instagramAccounts.map(account => ({
        id: account.id,
        username: account.username,
        name: account.name,
        pageId: account.pageId,
        pageName: account.pageName,
        followersCount: account.followers_count
      }));
    }

    // Identifier les problèmes
    if (!report.isConnected) {
      report.issues.push('Non connecté à Facebook');
      report.suggestions.push('Reconnectez-vous à Facebook');
    }

    if (report.tokenExpired) {
      report.issues.push('Token Facebook expiré');
      report.suggestions.push('Reconnectez-vous pour renouveler le token');
    }

    if (report.pagesCount === 0) {
      report.issues.push('Aucune page Facebook trouvée');
      report.suggestions.push('Vérifiez que vous gérez des pages Facebook');
      report.suggestions.push('Vérifiez les permissions pages_show_list et business_management');
    }

    if (report.instagramAccountsCount === 0 && report.pagesCount > 0) {
      report.issues.push('Aucun compte Instagram Business connecté');
      report.suggestions.push('Connectez des comptes Instagram Business à vos pages Facebook');
    }

    return report;
  }

  /**
   * Affiche un rapport de diagnostic dans la console
   */
  printDiagnostic() {
    const report = this.getDiagnosticReport();
    
    console.log('\n=== DIAGNOSTIC FACEBOOK SERVICE ===');
    console.log(`🕐 Timestamp: ${report.timestamp}`);
    console.log(`🔗 Connecté: ${report.isConnected ? '✅ Oui' : '❌ Non'}`);
    console.log(`🎫 Token valide: ${report.hasValidToken && !report.tokenExpired ? '✅ Oui' : '❌ Non'}`);
    console.log(`👤 User ID: ${report.userId || 'Non défini'}`);
    console.log(`📄 Pages: ${report.pagesCount}`);
    console.log(`📱 Comptes Instagram: ${report.instagramAccountsCount}`);

    if (report.pages.length > 0) {
      console.log('\n📄 Détails des pages:');
      report.pages.forEach((page, index) => {
        console.log(`  ${index + 1}. ${page.name} (${page.category})`);
        console.log(`     ID: ${page.id}`);
        console.log(`     Token: ${page.hasToken ? '✅' : '❌'}`);
        console.log(`     Instagram: ${page.hasInstagram ? '✅' : '❌'}`);
      });
    }

    if (report.instagramAccounts.length > 0) {
      console.log('\n📱 Détails des comptes Instagram:');
      report.instagramAccounts.forEach((account, index) => {
        console.log(`  ${index + 1}. @${account.username} (${account.name})`);
        console.log(`     ID: ${account.id}`);
        console.log(`     Page: ${account.pageName}`);
        console.log(`     Followers: ${account.followersCount || 'N/A'}`);
      });
    }

    if (report.issues.length > 0) {
      console.log('\n⚠️ Problèmes détectés:');
      report.issues.forEach((issue, index) => {
        console.log(`  ${index + 1}. ${issue}`);
      });
    }

    if (report.suggestions.length > 0) {
      console.log('\n🔧 Suggestions:');
      report.suggestions.forEach((suggestion, index) => {
        console.log(`  ${index + 1}. ${suggestion}`);
      });
    }

    console.log('\n=== FIN DU DIAGNOSTIC ===\n');
    
    return report;
  }

  /**
   * Récupère les informations de l'utilisateur connecté
   */
  getCurrentUser() {
    return {
      isConnected: this.isConnected(),
      userId: this.currentUser.userId,
      pages: this.currentUser.pages,
      instagramAccounts: this.currentUser.instagramAccounts || [],
      expiresAt: this.currentUser.expiresAt
    };
  }

  /**
   * Diagnostic et réparation automatique des problèmes de pages
   * Résout le problème de pages non récupérées après connexion
   */
  async diagnosePagesIssue() {
    console.log('🔍 DIAGNOSTIC AUTOMATIQUE - Problème de récupération des pages');
    
    const issues = [];
    const solutions = [];
    
    try {
      // 1. Vérifier la connexion
      if (!this.isConnected()) {
        issues.push('Non connecté à Facebook');
        solutions.push('Reconnectez-vous à Facebook');
        return { issues, solutions, canAutoFix: false };
      }
      
      // 2. Vérifier les pages en mémoire
      const pagesInMemory = this.currentUser.pages?.length || 0;
      console.log(`📄 Pages en mémoire: ${pagesInMemory}`);
      
      // 3. Tester l'API directement
      let apiResponse;
      try {
        apiResponse = await this.makeAuthenticatedRequest('/me/accounts?fields=id,name,access_token,category,instagram_business_account');
        console.log(`🌐 Pages via API: ${apiResponse.data?.length || 0}`);
      } catch (apiError) {
        issues.push(`Erreur API: ${apiError.message}`);
        if (apiError.message.includes('permissions')) {
          solutions.push('Vérifiez les permissions pages_show_list et business_management dans votre app Facebook');
        } else if (apiError.message.includes('token')) {
          solutions.push('Token expiré - reconnectez-vous à Facebook');
        }
        return { issues, solutions, canAutoFix: false };
      }
      
      // 4. Comparer les données
      const apiPagesCount = apiResponse.data?.length || 0;
      
      if (apiPagesCount === 0) {
        issues.push('Aucune page trouvée via l\'API Facebook');
        solutions.push('Vérifiez que vous gérez des pages Facebook');
        solutions.push('Vérifiez les permissions de votre app Facebook');
        return { issues, solutions, canAutoFix: false };
      }
      
      if (pagesInMemory !== apiPagesCount) {
        issues.push(`Désynchronisation: ${pagesInMemory} pages en mémoire vs ${apiPagesCount} via API`);
        solutions.push('Rechargement automatique des pages');
        
        // Auto-fix: recharger les pages
        console.log('🔧 Correction automatique: rechargement des pages...');
        await this.loadUserPages();
        
        const newPagesCount = this.currentUser.pages?.length || 0;
        if (newPagesCount === apiPagesCount) {
          console.log('✅ Problème résolu: pages synchronisées');
          return { 
            issues: ['Désynchronisation des pages (résolu)'], 
            solutions: ['Pages rechargées automatiquement'], 
            canAutoFix: true,
            fixed: true
          };
        }
      }
      
      // 5. Vérifier les tokens de page
      const pagesWithoutTokens = this.currentUser.pages?.filter(page => !page.access_token) || [];
      if (pagesWithoutTokens.length > 0) {
        issues.push(`${pagesWithoutTokens.length} page(s) sans token d'accès`);
        solutions.push('Problème de configuration de l\'app Facebook');
      }
      
      // 6. Vérifier les permissions
      try {
        const permissions = await this.makeAuthenticatedRequest('/me/permissions');
        const requiredPerms = ['pages_show_list', 'business_management'];
        const grantedPerms = permissions.data?.filter(p => p.status === 'granted').map(p => p.permission) || [];
        
        const missingPerms = requiredPerms.filter(perm => !grantedPerms.includes(perm));
        if (missingPerms.length > 0) {
          issues.push(`Permissions manquantes: ${missingPerms.join(', ')}`);
          solutions.push('Reconfigurez les permissions dans votre app Facebook');
        }
      } catch (permError) {
        console.warn('Impossible de vérifier les permissions:', permError);
      }
      
      if (issues.length === 0) {
        console.log('✅ Aucun problème détecté');
        return { 
          issues: ['Aucun problème détecté'], 
          solutions: ['Le système fonctionne correctement'], 
          canAutoFix: true 
        };
      }
      
      return { issues, solutions, canAutoFix: false };
      
    } catch (error) {
      console.error('Erreur lors du diagnostic:', error);
      return {
        issues: [`Erreur de diagnostic: ${error.message}`],
        solutions: ['Contactez le support technique'],
        canAutoFix: false
      };
    }
  }

  /**
   * Tentative de réparation automatique des problèmes de pages
   */
  async autoFixPagesIssue() {
    console.log('🔧 RÉPARATION AUTOMATIQUE - Problème de pages');
    
    try {
      // 1. Nettoyer les données corrompues
      console.log('🧹 Nettoyage des données...');
      this.currentUser.pages = [];
      this.currentUser.pageTokens = {};
      this.currentUser.instagramAccounts = [];
      
      // 2. Recharger les pages
      console.log('🔄 Rechargement des pages...');
      await this.loadUserPages();
      
      // 3. Sauvegarder
      this.saveUserData();
      
      // 4. Vérifier le résultat
      const pagesCount = this.currentUser.pages?.length || 0;
      console.log(`✅ Réparation terminée: ${pagesCount} page(s) récupérée(s)`);
      
      return {
        success: true,
        message: `Réparation réussie: ${pagesCount} page(s) récupérée(s)`,
        pagesCount
      };
      
    } catch (error) {
      console.error('❌ Échec de la réparation automatique:', error);
      return {
        success: false,
        message: `Échec de la réparation: ${error.message}`,
        error: error.message
      };
    }
  }
}

// Créer une instance unique du service
const facebookService = new FacebookService();

// Exposer le service dans window pour le débogage (uniquement en développement)
if (import.meta.env.DEV) {
  window.facebookService = facebookService;
  console.log('🔧 Service Facebook exposé dans window.facebookService pour le débogage');
  console.log('💡 Utilisez window.facebookService.printDiagnostic() pour un diagnostic complet');
}

export default facebookService;