import api from './api'
import axios from 'axios'

class HistoryService {
  constructor() {
    this.baseURL = import.meta.env.VITE_API_URL || import.meta.env.VITE_BACKEND_URL || 'http://localhost:3000';
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
        const token = localStorage.getItem('accessToken');
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
          window.location.href = '/login';
        }
        return Promise.reject(error);
      }
    );
  }

  /**
   * Récupère l'historique d'un projet
   * @param {string} projectId - ID du projet
   * @param {Object} filters - Filtres pour l'historique
   * @returns {Promise<Object>} Résultat de la requête
   */
  async getProjectHistory(projectId, filters = {}) {
    try {
      const params = new URLSearchParams();
      
      if (filters.period) params.append('period', filters.period);
      if (filters.user) params.append('user', filters.user);
      if (filters.type) params.append('type', filters.type);
      if (filters.search) params.append('search', filters.search);
      if (filters.page) params.append('page', filters.page);
      if (filters.limit) params.append('limit', filters.limit);
      if (filters.sortBy) params.append('sortBy', filters.sortBy);
      if (filters.sortOrder) params.append('sortOrder', filters.sortOrder);
      
      const queryString = params.toString();
      const url = `/api/projects/${projectId}/history${queryString ? '?' + queryString : ''}`;
      
      const response = await this.api.get(url);
      return { success: true, data: response.data };
    } catch (error) {
      console.error('Erreur lors de la récupération de l\'historique:', error);
      return { 
        success: false, 
        error: error.response?.data?.message || 'Erreur lors de la récupération de l\'historique' 
      };
    }
  }

  /**
   * Supprime un événement de l'historique
   * @param {string} eventId - ID de l'événement
   * @returns {Promise<Object>} Résultat de la requête
   */
  async deleteEvent(eventId) {
    try {
      const response = await this.api.delete(`/api/history/events/${eventId}`);
      return { success: true, data: response.data };
    } catch (error) {
      console.error('Erreur lors de la suppression de l\'événement:', error);
      return { 
        success: false, 
        error: error.response?.data?.message || 'Erreur lors de la suppression de l\'événement' 
      };
    }
  }

  /**
   * Exporte l'historique d'un projet
   * @param {string} projectId - ID du projet
   * @param {Object} options - Options d'export
   * @returns {Promise<Object>} Résultat de la requête
   */
  async exportHistory(projectId, options = {}) {
    try {
      const params = new URLSearchParams();
      
      if (options.format) params.append('format', options.format);
      if (options.period) params.append('period', options.period);
      if (options.user) params.append('user', options.user);
      if (options.type) params.append('type', options.type);
      if (options.startDate) params.append('startDate', options.startDate);
      if (options.endDate) params.append('endDate', options.endDate);
      
      const queryString = params.toString();
      const url = `/api/projects/${projectId}/history/export${queryString ? '?' + queryString : ''}`;
      
      const response = await this.api.get(url, {
        responseType: 'blob'
      });
      
      return { success: true, data: response.data };
    } catch (error) {
      console.error('Erreur lors de l\'export de l\'historique:', error);
      return { 
        success: false, 
        error: error.response?.data?.message || 'Erreur lors de l\'export de l\'historique' 
      };
    }
  }

  /**
   * Ajoute un événement à l'historique
   * @param {string} projectId - ID du projet
   * @param {Object} eventData - Données de l'événement
   * @returns {Promise<Object>} Résultat de la requête
   */
  async addEvent(projectId, eventData) {
    try {
      const response = await this.api.post(`/api/projects/${projectId}/history`, eventData);
      return { success: true, data: response.data };
    } catch (error) {
      console.error('Erreur lors de l\'ajout de l\'événement:', error);
      return { 
        success: false, 
        error: error.response?.data?.message || 'Erreur lors de l\'ajout de l\'événement' 
      };
    }
  }

  /**
   * Met à jour un événement de l'historique
   * @param {string} eventId - ID de l'événement
   * @param {Object} eventData - Nouvelles données de l'événement
   * @returns {Promise<Object>} Résultat de la requête
   */
  async updateEvent(eventId, eventData) {
    try {
      const response = await this.api.put(`/api/history/events/${eventId}`, eventData);
      return { success: true, data: response.data };
    } catch (error) {
      console.error('Erreur lors de la mise à jour de l\'événement:', error);
      return { 
        success: false, 
        error: error.response?.data?.message || 'Erreur lors de la mise à jour de l\'événement' 
      };
    }
  }

  /**
   * Récupère les détails d'un événement
   * @param {string} eventId - ID de l'événement
   * @returns {Promise<Object>} Résultat de la requête
   */
  async getEventDetails(eventId) {
    try {
      const response = await this.api.get(`/api/history/events/${eventId}`);
      return { success: true, data: response.data };
    } catch (error) {
      console.error('Erreur lors de la récupération des détails de l\'événement:', error);
      return { 
        success: false, 
        error: error.response?.data?.message || 'Erreur lors de la récupération des détails de l\'événement' 
      };
    }
  }

  /**
   * Récupère les statistiques de l'historique
   * @param {string} projectId - ID du projet
   * @param {Object} filters - Filtres pour les statistiques
   * @returns {Promise<Object>} Résultat de la requête
   */
  async getHistoryStats(projectId, filters = {}) {
    try {
      const params = new URLSearchParams();
      
      if (filters.period) params.append('period', filters.period);
      if (filters.startDate) params.append('startDate', filters.startDate);
      if (filters.endDate) params.append('endDate', filters.endDate);
      
      const queryString = params.toString();
      const url = `/api/projects/${projectId}/history/stats${queryString ? '?' + queryString : ''}`;
      
      const response = await this.api.get(url);
      return { success: true, data: response.data };
    } catch (error) {
      console.error('Erreur lors de la récupération des statistiques:', error);
      return { 
        success: false, 
        error: error.response?.data?.message || 'Erreur lors de la récupération des statistiques' 
      };
    }
  }
}

// Export d'une instance unique
const historyService = new HistoryService();
export default historyService;