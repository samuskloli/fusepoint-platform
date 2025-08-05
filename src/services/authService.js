import axios from 'axios';
import translationService from '@/services/translationService';

/**
 * Service d'authentification côté client
 * Gère les appels API d'authentification et la gestion des tokens
 */
class AuthService {
  constructor() {
    this.baseURL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:3000';
    console.log('🔍 Base URL utilisée:', this.baseURL);
    this.api = axios.create({
      baseURL: this.baseURL,
      timeout: 10000,
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
              this.clearTokens();
              this.clearUser();
              this.clearCompanies();
              // Ne pas rediriger automatiquement, laisser le routeur gérer
            }
          } else {
            this.clearTokens();
            this.clearUser();
            this.clearCompanies();
            // Ne pas rediriger automatiquement, laisser le routeur gérer
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
        throw new Error(translationService.t('auth.emailPasswordRequired'));
      }

      if (!this.isValidEmail(email)) {
        throw new Error(translationService.t('auth.invalidEmailFormat'));
      }

      if (password.length < 8) {
        throw new Error(translationService.t('auth.passwordTooShort'));
      }

      const response = await this.api.post('/api/auth/login', {
        email,
        password
      });

      console.log('🔍 Réponse de connexion:', response.data);
      
      // La réponse contient { success, message, user, companies, tokens, expiresAt }
      const { user, companies, tokens, expiresAt } = response.data;

      if (!tokens || !user) {
        throw new Error(translationService.t('auth.loginError'));
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
        translationService.t('auth.loginError')
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
        throw new Error(translationService.t('auth.allFieldsRequired'));
      }

      if (!this.isValidEmail(email)) {
        throw new Error(translationService.t('auth.invalidEmailFormat'));
      }

      if (password.length < 8) {
        throw new Error(translationService.t('auth.passwordTooShort'));
      }

      if (!this.isStrongPassword(password)) {
        throw new Error(translationService.t('auth.passwordWeak'));
      }

      if (password !== confirmPassword) {
        throw new Error(translationService.t('auth.passwordsNotMatch'));
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
        translationService.t('auth.registrationError')
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
        throw new Error(translationService.t('auth.tokenRefreshInvalid'));
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
      throw new Error(error.response?.data?.error || translationService.t('auth.registrationError'));
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
    return !!(token && user && !this.isTokenExpired());
  }

  /**
   * Vérifier si le token est expiré
   */
  isTokenExpired() {
    const expiresAt = localStorage.getItem('tokenExpiresAt');
    if (!expiresAt) return true;
    
    return new Date() >= new Date(expiresAt);
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
    // Au moins 8 caractères, 1 majuscule, 1 minuscule, 1 chiffre, 1 caractère spécial
    const strongPasswordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
    return strongPasswordRegex.test(password);
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
    localStorage.setItem('tokenExpiresAt', expiresAt);
  }

  clearTokens() {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('sessionToken');
    localStorage.removeItem('tokenExpiresAt');
    // Nettoyer les anciens tokens de l'authentification mock
    localStorage.removeItem('authToken');
    localStorage.removeItem('isAuthenticated');
  }

  /**
   * Gestion des données utilisateur
   */
  setUser(user) {
    localStorage.setItem('user', JSON.stringify(user));
    // Maintenir la compatibilité avec l'ancien système
    localStorage.setItem('userEmail', user.email);
    localStorage.setItem('userName', user.firstName || user.email.split('@')[0]);
  }

  getUser() {
    const userStr = localStorage.getItem('user');
    return userStr ? JSON.parse(userStr) : null;
  }

  clearUser() {
    localStorage.removeItem('user');
    localStorage.removeItem('userEmail');
    localStorage.removeItem('userName');
  }

  /**
   * Gestion des entreprises
   */
  setCompanies(companies) {
    localStorage.setItem('companies', JSON.stringify(companies || []));
  }

  getCompanies() {
    const companiesStr = localStorage.getItem('companies');
    return companiesStr ? JSON.parse(companiesStr) : [];
  }

  clearCompanies() {
    localStorage.removeItem('companies');
  }

  /**
   * Demander une réinitialisation de mot de passe
   */
  async forgotPassword(email) {
    try {
      if (!email) {
        throw new Error(translationService.t('auth.emailRequired'));
      }

      if (!this.isValidEmail(email)) {
        throw new Error(translationService.t('auth.invalidEmailFormat'));
      }

      const response = await this.api.post('/api/auth/forgot-password', {
        email
      });

      return response.data;
    } catch (error) {
      console.error('❌ Erreur mot de passe oublié:', error);
      throw new Error(
        error.response?.data?.error || 
        error.message || 
        translationService.t('auth.forgotPasswordError')
      );
    }
  }

  /**
   * Réinitialiser le mot de passe avec un token
   */
  async resetPassword(token, newPassword) {
    try {
      if (!token || !newPassword) {
        throw new Error(translationService.t('auth.tokenPasswordRequired'));
      }

      if (newPassword.length < 8) {
        throw new Error(translationService.t('auth.passwordTooShort'));
      }

      const response = await this.api.post('/api/auth/reset-password', {
        token,
        newPassword
      });

      return response.data;
    } catch (error) {
      console.error('❌ Erreur réinitialisation mot de passe:', error);
      throw new Error(
        error.response?.data?.error || 
        error.message || 
        translationService.t('auth.resetPasswordError')
      );
    }
  }

  /**
   * Obtenir l'instance API configurée
   */
  getApiInstance() {
    return this.api;
  }
}

// Export d'une instance singleton
export default new AuthService();