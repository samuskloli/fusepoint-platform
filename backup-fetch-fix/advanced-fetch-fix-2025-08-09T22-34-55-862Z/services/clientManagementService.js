/**
 * Service de Gestion des Clients - Version Simplifiée
 * Service côté client pour les appels API uniquement
 * La logique métier complexe est gérée côté serveur
 */

import api from './api';

class ClientManagementService {
  constructor() {
    this.baseURL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:3000';
  }

  /**
   * Récupérer la liste des clients
   */
  async getClients() {
    try {
      const response = await api.get('/api/agent/clients');
      return response.data;
    } catch (error) {
      console.error('Erreur lors de la récupération des clients:', error);
      throw error;
    }
  }

  /**
   * Récupérer les clients assignés à l'agent
   */
  async getAssignedClients() {
    try {
      const response = await api.get('/api/agent/assigned-clients');
      return response.data;
    } catch (error) {
      console.error('Erreur lors de la récupération des clients assignés:', error);
      throw error;
    }
  }

  /**
   * Créer un nouveau client
   */
  async createClient(clientData) {
    try {
      const response = await api.post('/api/agent/clients', clientData);
      return { success: true, data: response.data };
    } catch (error) {
      console.error('Erreur lors de la création du client:', error);
      return { 
        success: false, 
        error: error.response?.data?.message || 'Erreur lors de la création du client' 
      };
    }
  }

  /**
   * Mettre à jour un client
   */
  async updateClient(clientId, clientData) {
    try {
      const response = await api.put(`/api/agent/clients/${clientId}`, clientData);
      return { success: true, data: response.data };
    } catch (error) {
      console.error('Erreur lors de la mise à jour du client:', error);
      return { 
        success: false, 
        error: error.response?.data?.message || 'Erreur lors de la mise à jour du client' 
      };
    }
  }

  /**
   * Supprimer un client
   */
  async deleteClient(clientId, reason) {
    try {
      const response = await api.delete(`/api/agent/clients/${clientId}`, {
        data: { reason }
      });
      return { success: true, data: response.data };
    } catch (error) {
      console.error('Erreur lors de la suppression du client:', error);
      return { 
        success: false, 
        error: error.response?.data?.message || 'Erreur lors de la suppression du client' 
      };
    }
  }

  /**
   * Récupérer un client par son ID
   */
  async getClientById(clientId) {
    try {
      const response = await api.get(`/api/client/${clientId}`);
      return { success: true, data: response.data };
    } catch (error) {
      console.error('Erreur lors de la récupération du client:', error);
      return { 
        success: false, 
        error: error.response?.data?.message || 'Erreur lors de la récupération du client' 
      };
    }
  }

  /**
   * Récupérer les statistiques d'un client
   */
  async getClientStats(clientId) {
    try {
      const response = await api.get(`/api/agent/clients/${clientId}/stats`);
      return { success: true, data: response.data };
    } catch (error) {
      console.error('Erreur lors de la récupération des statistiques:', error);
      return { 
        success: false, 
        error: error.response?.data?.message || 'Erreur lors de la récupération des statistiques' 
      };
    }
  }

  /**
   * Récupérer les fichiers d'un client
   */
  async getClientFiles(clientId) {
    try {
      const response = await api.get(`/api/agent/clients/${clientId}/files`);
      return { success: true, data: response.data };
    } catch (error) {
      console.error('Erreur lors de la récupération des fichiers:', error);
      return { 
        success: false, 
        error: error.response?.data?.message || 'Erreur lors de la récupération des fichiers' 
      };
    }
  }

  /**
   * Récupérer l'équipe d'un client
   */
  async getClientTeam(clientId) {
    try {
      const response = await api.get(`/api/agent/clients/${clientId}/team`);
      return { success: true, data: response.data };
    } catch (error) {
      console.error('Erreur lors de la récupération de l\'équipe:', error);
      return { 
        success: false, 
        error: error.response?.data?.message || 'Erreur lors de la récupération de l\'équipe' 
      };
    }
  }

  /**
   * Auto-assigner un agent à un client
   */
  async autoAssignAgent(clientId) {
    try {
      const response = await api.post(`/api/agent/auto-assign/${clientId}`);
      return { success: true, data: response.data };
    } catch (error) {
      console.error('Erreur lors de l\'auto-assignation:', error);
      return { 
        success: false, 
        error: error.response?.data?.message || 'Erreur lors de l\'auto-assignation' 
      };
    }
  }

  /**
   * Envoyer un email de bienvenue
   */
  async sendWelcomeEmail(clientId) {
    try {
      const response = await api.post(`/api/agent/clients/${clientId}/welcome-email`);
      return { success: true, data: response.data };
    } catch (error) {
      console.error('Erreur lors de l\'envoi de l\'email:', error);
      return { 
        success: false, 
        error: error.response?.data?.message || 'Erreur lors de l\'envoi de l\'email' 
      };
    }
  }

  /**
   * Rechercher des clients
   */
  async searchClients(query, filters = {}) {
    try {
      const params = new URLSearchParams({ query, ...filters });
      const response = await api.get(`/api/agent/clients/search?${params}`);
      return { success: true, data: response.data };
    } catch (error) {
      console.error('Erreur lors de la recherche:', error);
      return { 
        success: false, 
        error: error.response?.data?.message || 'Erreur lors de la recherche' 
      };
    }
  }
}

const clientManagementService = new ClientManagementService();
export default clientManagementService;