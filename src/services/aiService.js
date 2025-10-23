import api from './api'
import axios from 'axios'

class AIService {
  constructor() {
    this.baseURL = import.meta.env.VITE_API_URL || import.meta.env.VITE_BACKEND_URL || 'http://localhost:3000';
    this.api = axios.create({
      baseURL: this.baseURL,
      timeout: 30000, // Timeout plus long pour les requêtes AI
      headers: {
        'Content-Type': 'application/json'
      }
    });

    // Intercepteur pour ajouter le token aux requêtes
    this.api.interceptors.request.use(
      (config) => {
        const token = localStorage.getItem('accessToken') || localStorage.getItem('authToken');
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => {
        return Promise.reject(error);
      }
    );

    // Intercepteur pour gérer les réponses
    this.api.interceptors.response.use(
      (response) => response,
      (error) => {
        if (error.response?.status === 401) {
          localStorage.removeItem('accessToken');
          localStorage.removeItem('authToken');
          window.location.href = '/login';
        }
        return Promise.reject(error);
      }
    );
  }

  /**
   * Récupère les conversations d'un projet
   * @param {string} projectId - ID du projet
   * @returns {Promise<Object>} Résultat de la requête
   */
  async getConversations(projectId) {
    try {
      const response = await this.api.get(`/api/projects/${projectId}/ai/conversations`);
      return { success: true, data: response.data };
    } catch (error) {
      console.error('Erreur lors de la récupération des conversations:', error);
      return { 
        success: false, 
        error: error.response?.data?.message || 'Erreur lors de la récupération des conversations' 
      };
    }
  }

  /**
   * Envoie un message à l'IA
   * @param {Object} messageData - Données du message
   * @returns {Promise<Object>} Résultat de la requête
   */
  async sendMessage(messageData) {
    try {
      const {
        projectId,
        message,
        conversationId,
        context,
        model = 'gpt-3.5-turbo',
        maxTokens = 1000,
        temperature = 0.7
      } = messageData;

      const payload = {
        message,
        conversationId,
        context,
        model,
        maxTokens,
        temperature
      };

      const response = await this.api.post(`/api/projects/${projectId}/ai/messages`, payload);
      return { success: true, data: response.data };
    } catch (error) {
      console.error('Erreur lors de l\'envoi du message:', error);
      return { 
        success: false, 
        error: error.response?.data?.message || 'Erreur lors de l\'envoi du message' 
      };
    }
  }

  /**
   * Évalue un message
   * @param {string} messageId - ID du message
   * @param {number} rating - Note (1-5)
   * @returns {Promise<Object>} Résultat de la requête
   */
  async rateMessage(messageId, rating) {
    try {
      const response = await this.api.post(`/api/ai/messages/${messageId}/rate`, { rating });
      return { success: true, data: response.data };
    } catch (error) {
      console.error('Erreur lors de l\'évaluation du message:', error);
      return { 
        success: false, 
        error: error.response?.data?.message || 'Erreur lors de l\'évaluation du message' 
      };
    }
  }

  /**
   * Efface l'historique des conversations d'un projet
   * @param {string} projectId - ID du projet
   * @returns {Promise<Object>} Résultat de la requête
   */
  async clearHistory(projectId) {
    try {
      const response = await this.api.delete(`/api/projects/${projectId}/ai/conversations`);
      return { success: true, data: response.data };
    } catch (error) {
      console.error('Erreur lors de l\'effacement de l\'historique:', error);
      return { 
        success: false, 
        error: error.response?.data?.message || 'Erreur lors de l\'effacement de l\'historique' 
      };
    }
  }

  /**
   * Sauvegarde une conversation
   * @param {Object} conversationData - Données de la conversation
   * @returns {Promise<Object>} Résultat de la requête
   */
  async saveConversation(conversationData) {
    try {
      const { projectId, ...data } = conversationData;
      const response = await this.api.post(`/api/projects/${projectId}/ai/conversations`, data);
      return { success: true, data: response.data };
    } catch (error) {
      console.error('Erreur lors de la sauvegarde de la conversation:', error);
      return { 
        success: false, 
        error: error.response?.data?.message || 'Erreur lors de la sauvegarde de la conversation' 
      };
    }
  }

  /**
   * Récupère une conversation spécifique
   * @param {string} conversationId - ID de la conversation
   * @returns {Promise<Object>} Résultat de la requête
   */
  async getConversation(conversationId) {
    try {
      const response = await this.api.get(`/api/ai/conversations/${conversationId}`);
      return { success: true, data: response.data };
    } catch (error) {
      console.error('Erreur lors de la récupération de la conversation:', error);
      return { 
        success: false, 
        error: error.response?.data?.message || 'Erreur lors de la récupération de la conversation' 
      };
    }
  }

  /**
   * Met à jour une conversation
   * @param {string} conversationId - ID de la conversation
   * @param {Object} updateData - Données à mettre à jour
   * @returns {Promise<Object>} Résultat de la requête
   */
  async updateConversation(conversationId, updateData) {
    try {
      const response = await this.api.put(`/api/ai/conversations/${conversationId}`, updateData);
      return { success: true, data: response.data };
    } catch (error) {
      console.error('Erreur lors de la mise à jour de la conversation:', error);
      return { 
        success: false, 
        error: error.response?.data?.message || 'Erreur lors de la mise à jour de la conversation' 
      };
    }
  }

  /**
   * Supprime une conversation
   * @param {string} conversationId - ID de la conversation
   * @returns {Promise<Object>} Résultat de la requête
   */
  async deleteConversation(conversationId) {
    try {
      const response = await this.api.delete(`/api/ai/conversations/${conversationId}`);
      return { success: true, data: response.data };
    } catch (error) {
      console.error('Erreur lors de la suppression de la conversation:', error);
      return { 
        success: false, 
        error: error.response?.data?.message || 'Erreur lors de la suppression de la conversation' 
      };
    }
  }

  /**
   * Récupère les statistiques AI d'un projet
   * @param {string} projectId - ID du projet
   * @param {Object} filters - Filtres pour les statistiques
   * @returns {Promise<Object>} Résultat de la requête
   */
  async getAIStats(projectId, filters = {}) {
    try {
      const params = new URLSearchParams();
      
      if (filters.period) params.append('period', filters.period);
      if (filters.startDate) params.append('startDate', filters.startDate);
      if (filters.endDate) params.append('endDate', filters.endDate);
      
      const queryString = params.toString();
      const url = `/api/projects/${projectId}/ai/stats${queryString ? '?' + queryString : ''}`;
      
      const response = await this.api.get(url);
      return { success: true, data: response.data };
    } catch (error) {
      console.error('Erreur lors de la récupération des statistiques AI:', error);
      return { 
        success: false, 
        error: error.response?.data?.message || 'Erreur lors de la récupération des statistiques AI' 
      };
    }
  }

  /**
   * Génère une réponse automatique
   * @param {Object} requestData - Données de la requête
   * @returns {Promise<Object>} Résultat de la requête
   */
  async generateResponse(requestData) {
    try {
      const {
        prompt,
        context,
        model = 'gpt-3.5-turbo',
        maxTokens = 1000,
        temperature = 0.7,
        agentType = 'general'
      } = requestData;

      const payload = {
        prompt,
        context,
        model,
        maxTokens,
        temperature,
        agentType
      };

      const response = await this.api.post('/api/ai/generate', payload);
      return { success: true, data: response.data };
    } catch (error) {
      console.error('Erreur lors de la génération de réponse:', error);
      return { 
        success: false, 
        error: error.response?.data?.message || 'Erreur lors de la génération de réponse' 
      };
    }
  }

  /**
   * Teste la connexion à l'API AI
   * @returns {Promise<Object>} Résultat du test
   */
  async testConnection() {
    try {
      const response = await this.api.get('/api/ai/health');
      return { success: true, data: response.data };
    } catch (error) {
      console.error('Erreur lors du test de connexion:', error);
      return { 
        success: false, 
        error: error.response?.data?.message || 'Erreur lors du test de connexion' 
      };
    }
  }

  /**
   * Récupère la configuration AI
   * @returns {Promise<Object>} Configuration AI
   */
  async getConfig() {
    try {
      const response = await this.api.get('/api/ai/config');
      return { success: true, data: response.data };
    } catch (error) {
      console.error('Erreur lors de la récupération de la configuration:', error);
      return { 
        success: false, 
        error: error.response?.data?.message || 'Erreur lors de la récupération de la configuration' 
      };
    }
  }

  /**
   * Met à jour la configuration AI
   * @param {Object} config - Nouvelle configuration
   * @returns {Promise<Object>} Résultat de la mise à jour
   */
  async updateConfig(config) {
    try {
      const response = await this.api.put('/api/ai/config', config);
      return { success: true, data: response.data };
    } catch (error) {
      console.error('Erreur lors de la mise à jour de la configuration:', error);
      return { 
        success: false, 
        error: error.response?.data?.message || 'Erreur lors de la mise à jour de la configuration' 
      };
    }
  }
}

// Export d'une instance unique
const aiService = new AIService();
export default aiService;