import api from './api.js';

/**
 * Service API pour les fonctionnalités Administrateur
 * Permet aux admins et super_admins d'accéder aux fonctionnalités de gestion des utilisateurs
 */
class AdminAPI {
  constructor() {
    this.baseURL = '/api/admin';
  }

  // ===== GESTION DES UTILISATEURS =====

  /**
   * Récupérer la liste des utilisateurs
   */
  async getUsers(options = {}) {
    try {
      const {
        page = 1,
        limit = 20,
        role = null,
        search = null,
        activeOnly = true
      } = options;

      const params = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString()
      });

      if (activeOnly !== null) {
        params.append('activeOnly', activeOnly.toString());
      }
      if (role) params.append('role', role);
      if (search) params.append('search', search);

      const response = await api.get(`${this.baseURL}/users?${params.toString()}`);
      return response.data;
    } catch (error) {
      console.error('Erreur lors de la récupération des utilisateurs:', error);
      throw error;
    }
  }

  /**
   * Récupérer les détails complets d'un utilisateur
   */
  async getUserDetails(userId) {
    try {
      const response = await api.get(`${this.baseURL}/users/${userId}`);
      return response.data.user;
    } catch (error) {
      console.error(`Erreur lors de la récupération des détails de l'utilisateur ${userId}:`, error);
      throw error;
    }
  }

  /**
   * Mettre à jour le rôle d'un utilisateur
   */
  async updateUserRole(userId, role) {
    try {
      const response = await api.put(`${this.baseURL}/users/${userId}/role`, {
        role
      });
      return response.data;
    } catch (error) {
      console.error(`Erreur lors de la mise à jour du rôle pour l'utilisateur ${userId}:`, error);
      throw error;
    }
  }

  /**
   * Activer/désactiver un utilisateur
   */
  async updateUserStatus(userId, isActive) {
    try {
      const response = await api.put(`${this.baseURL}/users/${userId}/status`, {
        isActive
      });
      return response.data;
    } catch (error) {
      console.error(`Erreur lors de la mise à jour du statut pour l'utilisateur ${userId}:`, error);
      throw error;
    }
  }

  /**
   * Mettre à jour les informations complètes d'un utilisateur
   */
  async updateUser(userId, userData) {
    try {
      const response = await api.put(`${this.baseURL}/users/${userId}`, userData);
      return response.data;
    } catch (error) {
      console.error(`Erreur lors de la mise à jour de l'utilisateur ${userId}:`, error);
      throw error;
    }
  }

  /**
   * Récupérer les rôles disponibles
   */
  async getUserRoles() {
    try {
      const response = await api.get(`${this.baseURL}/users/roles`);
      return response.data;
    } catch (error) {
      console.error('Erreur lors de la récupération des rôles:', error);
      throw error;
    }
  }

  /**
   * Modifier le mot de passe d'un utilisateur
   */
  async updateUserPassword(userId, newPassword) {
    try {
      const response = await api.put(`${this.baseURL}/users/${userId}/password`, {
        password: newPassword
      });
      return response.data;
    } catch (error) {
      console.error(`Erreur lors de la modification du mot de passe pour l'utilisateur ${userId}:`, error);
      throw error;
    }
  }

  /**
   * Récupérer le statut d'abonnement d'un utilisateur
   */
  async getUserSubscriptionStatus(userId) {
    try {
      const response = await api.get(`${this.baseURL}/users/${userId}/subscription`);
      return response.data;
    } catch (error) {
      console.error(`Erreur lors de la récupération du statut d'abonnement pour l'utilisateur ${userId}:`, error);
      throw error;
    }
  }

  /**
   * Mettre à jour le statut d'abonnement d'un utilisateur
   */
  async updateUserSubscriptionStatus(userId, isPaid) {
    try {
      const response = await api.put(`${this.baseURL}/users/${userId}/subscription`, {
        isPaid: isPaid
      });
      return response.data;
    } catch (error) {
      console.error(`Erreur lors de la mise à jour du statut d'abonnement pour l'utilisateur ${userId}:`, error);
      throw error;
    }
  }

  /**
   * Récupérer les statuts d'abonnement de plusieurs utilisateurs
   */
  async getSubscriptionStatuses(userIds) {
    try {
      if (!userIds || userIds.length === 0) {
        return { statuses: {} };
      }

      // Récupérer les statuts réels depuis l'API
      const statuses = {};
      
      // Récupérer le statut pour chaque utilisateur
      const promises = userIds.map(async (userId) => {
        try {
          const response = await this.getUserSubscriptionStatus(userId);
          statuses[userId] = response.isPaid ? 'paid' : 'free';
        } catch (error) {
          console.error(`Erreur lors de la récupération du statut pour l'utilisateur ${userId}:`, error);
          // En cas d'erreur, considérer comme gratuit par défaut
          statuses[userId] = 'free';
        }
      });

      await Promise.all(promises);
      return { statuses };
    } catch (error) {
      console.error('Erreur lors de la récupération des statuts d\'abonnement:', error);
      throw error;
    }
  }

  /**
   * Récupérer les statuts d'abonnement disponibles
   */
  async getAvailableSubscriptionStatuses() {
    try {
      // Retourne les statuts d'abonnement disponibles
      return {
        data: [
          { value: true, label: 'Payé' },
          { value: false, label: 'Non payé' }
        ]
      };
    } catch (error) {
      console.error('Erreur lors de la récupération des statuts d\'abonnement:', error);
      throw error;
    }
  }
}

// Créer une instance unique
const adminAPI = new AdminAPI();

export default adminAPI;