import axios from 'axios';

/**
 * Service d'authentification côté client
 * Gère les appels API d'authentification et la gestion des tokens
 */
class AuthService {
  constructor() {
    this.baseURL = import.meta.env.VITE_API_URL || import.meta.env.VITE_BACKEND_URL || 'http://localhost:3000';
    console.log('🔍 Base URL utilisée:', this.baseURL);
    this.api = axios.create({
      baseURL: this.baseURL,
      timeout: 20000,
      headers: {
        'Content-Type': 'application/json'
      }
    });

    // Intercepteur pour ajouter le token aux requêtes
    this.api.interceptors.request.use(
      (config) => {
        const token = this.getAccessToken();
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => {
        return Promise.reject(error);
      }
    );

    // Intercepteur pour gérer les erreurs d'authentification
    this.api.interceptors.response.use(
      (response) => response,
      async (error) => {
        if (error.response?.status === 401) {
          // Token expiré, essayer de le rafraîchir
          const refreshToken = this.getRefreshToken();
          if (refreshToken && !error.config._retry) {
            error.config._retry = true;
            try {
              await this.refreshToken();
              // Retry la requête originale
              return this.api.request(error.config);
            } catch (refreshError) {
              // Seulement nettoyer les tokens si le rafraîchissement échoue
              console.log('🔄 Échec du rafraîchissement du token, déconnexion nécessaire');
              this.clearTokens();
              this.clearUser();
              this.clearCompanies();
              throw refreshError;
            }
          }
        }
        return Promise.reject(error);
      }
    );
  }
  /**
   * Connexion utilisateur
   */
  async login(email, password) {
    try {
      // Validation côté client
      if (!email || !password) {
        throw new Error('Email et mot de passe requis');
      }

      if (!this.isValidEmail(email)) {
        throw new Error('Format d\'email invalide');
      }

      if (password.length < 8) {
        throw new Error('Le mot de passe doit contenir au moins 8 caractères');
      }

      const response = await this.api.post('/api/auth/login', {
        email,
        password
      });

      console.log('🔍 Réponse de connexion:', response.data);
      
      // La réponse contient { success, message, user, companies, tokens, expiresAt }
      const { user, companies, tokens, expiresAt } = response.data;

      if (!tokens || !user) {
        throw new Error('Réponse de connexion invalide');
      }

      // Stocker les tokens de manière sécurisée
      this.setTokens(tokens);
      this.setUser(user);
      this.setCompanies(companies || []);
      this.setTokenExpiration(expiresAt);
      
      console.log('✅ Tokens stockés:', {
        hasAccessToken: !!tokens.accessToken,
        hasRefreshToken: !!tokens.refreshToken,
        hasSessionToken: !!tokens.sessionToken,
        expiresAt
      });

      return {
        success: true,
        user,
        companies
      };
    } catch (error) {
      console.error('❌ Erreur connexion:', error);
      throw new Error(
        error.response?.data?.error || 
        error.message || 
        'Erreur lors de la connexion'
      );
    }
  }

  /**
   * Inscription utilisateur
   */
  async register(userData) {
    try {
      const { email, password, firstName, lastName, confirmPassword } = userData;

      // Validation côté client
      if (!email || !password || !firstName || !lastName) {
        throw new Error('Tous les champs sont requis');
      }

      if (!this.isValidEmail(email)) {
        throw new Error('Format d\'email invalide');
      }

      if (password.length < 8) {
        throw new Error('Le mot de passe doit contenir au moins 8 caractères');
      }

      if (!this.isStrongPassword(password)) {
        throw new Error('Le mot de passe doit contenir au moins une majuscule, une minuscule, un chiffre et un caractère spécial');
      }

      if (password !== confirmPassword) {
        throw new Error('Les mots de passe ne correspondent pas');
      }

      const response = await this.api.post('/api/auth/register', {
        email,
        password,
        firstName,
        lastName
      });

      return response.data;
    } catch (error) {
      console.error('❌ Erreur inscription:', error);
      throw new Error(
        error.response?.data?.error || 
        error.message || 
        'Erreur lors de l\'inscription'
      );
    }
  }

  /**
   * Déconnexion
   */
  async logout() {
    try {
      const sessionToken = this.getSessionToken();
      if (sessionToken) {
        await this.api.post('/api/auth/logout', { sessionToken });
      }
    } catch (error) {
      console.error('❌ Erreur déconnexion:', error);
    } finally {
      this.clearTokens();
      this.clearUser();
      this.clearCompanies();
    }
  }

  /**
   * Rafraîchir le token d'accès
   */
  async refreshToken() {
    try {
      const refreshToken = this.getRefreshToken();
      if (!refreshToken) {
        throw new Error('Token de rafraîchissement non disponible');
      }

      const response = await axios.post(`${this.baseURL}/api/auth/refresh`, {
        refreshToken
      });

      const { accessToken, user, expiresAt } = response.data;
      
      // Mettre à jour le token d'accès et son expiration
      localStorage.setItem('accessToken', accessToken);
      if (expiresAt) {
        this.setTokenExpiration(expiresAt);
      }
      this.setUser(user);

      return accessToken;
    } catch (error) {
      console.error('❌ Erreur rafraîchissement token:', error);
      throw error;
    }
  }

  /**
   * Récupérer les informations de l'utilisateur connecté
   */
  async completeOnboarding(companyData) {
    try {
      const response = await this.api.post('/api/auth/complete-onboarding', companyData);
      return response.data;
    } catch (error) {
      console.error('❌ Erreur completion onboarding:', error);
      throw new Error(error.response?.data?.error || 'Erreur lors de la completion de l\'onboarding');
    }
  }

  async getCurrentUser() {
    try {
      const response = await this.api.get('/api/auth/me');
      const { user, companies } = response.data;
      
      this.setUser(user);
      this.setCompanies(companies);
      
      return { user, companies };
    } catch (error) {
      console.error('❌ Erreur récupération utilisateur:', error);
      throw error;
    }
  }

  /**
   * Vérifier si l'utilisateur est connecté
   */
  isAuthenticated() {
    const token = this.getAccessToken();
    const user = this.getUser();
    return !!token && !!user;
  }

  /**
   * Vérifier si le token est expiré
   */
  isTokenExpired() {
    const expiresAt = localStorage.getItem('tokenExpiresAt');
    if (!expiresAt) return true;
    // Utiliser correctement l'horodatage ISO renvoyé par le backend
    const expiryMs = new Date(expiresAt).getTime();
    if (Number.isNaN(expiryMs)) {
      // Si le format est invalide, considérer expiré et nettoyer plus tard
      return true;
    }
    return Date.now() > expiryMs;
  }

  /**
   * Validation email
   */
  isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  /**
   * Validation mot de passe fort
   */
  isStrongPassword(password) {
    const strongRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^\w\s]).{8,}$/;
    return strongRegex.test(password);
  }

  /**
   * Gestion des tokens
   */
  setTokens(tokens) {
    localStorage.setItem('accessToken', tokens.accessToken);
    localStorage.setItem('refreshToken', tokens.refreshToken);
    localStorage.setItem('sessionToken', tokens.sessionToken);
  }

  getAccessToken() {
    return localStorage.getItem('accessToken');
  }

  getRefreshToken() {
    return localStorage.getItem('refreshToken');
  }

  getSessionToken() {
    return localStorage.getItem('sessionToken');
  }

  setTokenExpiration(expiresAt) {
    if (expiresAt) {
      localStorage.setItem('tokenExpiresAt', expiresAt.toString());
    }
  }

  clearTokens() {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('sessionToken');
    localStorage.removeItem('tokenExpiresAt');
  }

  /**
   * Gestion de l'utilisateur
   */
  setUser(user) {
    localStorage.setItem('user', JSON.stringify(user));
  }

  getUser() {
    const user = localStorage.getItem('user');
    return user ? JSON.parse(user) : null;
  }

  clearUser() {
    localStorage.removeItem('user');
  }

  /**
   * Gestion des sociétés
   */
  setCompanies(companies) {
    localStorage.setItem('companies', JSON.stringify(companies || []));
  }

  getCompanies() {
    const companies = localStorage.getItem('companies');
    return companies ? JSON.parse(companies) : [];
  }

  clearCompanies() {
    localStorage.removeItem('companies');
  }

  /**
   * Exposer l'instance Axios si nécessaire
   */
  getApiInstance() {
    return this.api;
  }
}

export default new AuthService();