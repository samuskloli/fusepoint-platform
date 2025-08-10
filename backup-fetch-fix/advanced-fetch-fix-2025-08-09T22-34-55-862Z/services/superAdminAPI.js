import api from './api.js';

/**
 * Service API pour les fonctionnalités Super Administrateur
 */
class SuperAdminAPI {
  constructor() {
    this.baseURL = '/api/super-admin';
  }

  /**
   * Récupérer tous les blocs de paramètres
   */
  async getAllSettingsBlocks() {
    try {
      const response = await api.get(`${this.baseURL}/settings-blocks`);
      return response.data;
    } catch (error) {
      console.error('Erreur lors de la récupération des blocs de paramètres:', error);
      throw error;
    }
  }

  /**
   * Récupérer un bloc de paramètres spécifique
   */
  async getSettingsBlock(blockKey) {
    try {
      const response = await api.get(`${this.baseURL}/settings-blocks/${blockKey}`);
      return response.data;
    } catch (error) {
      console.error(`Erreur lors de la récupération du bloc ${blockKey}:`, error);
      throw error;
    }
  }

  /**
   * Sauvegarder les paramètres d'un bloc
   */
  async saveBlockSettings(blockKey, settings) {
    try {
      const response = await api.put(`${this.baseURL}/settings-blocks/${blockKey}/batch`, {
        settings
      });
      return response.data;
    } catch (error) {
      console.error(`Erreur lors de la sauvegarde du bloc ${blockKey}:`, error);
      throw error;
    }
  }

  /**
   * Réinitialiser un bloc aux valeurs par défaut
   */
  async resetBlock(blockKey) {
    try {
      const response = await api.post(`${this.baseURL}/settings-blocks/${blockKey}/reset`);
      return response.data;
    } catch (error) {
      console.error(`Erreur lors de la réinitialisation du bloc ${blockKey}:`, error);
      throw error;
    }
  }

  /**
   * Exporter un bloc de paramètres
   */
  async exportBlock(blockKey) {
    try {
      const response = await api.get(`${this.baseURL}/settings-blocks/${blockKey}/export`);
      return response.data;
    } catch (error) {
      console.error(`Erreur lors de l'export du bloc ${blockKey}:`, error);
      throw error;
    }
  }

  /**
   * Importer un bloc de paramètres
   */
  async importBlock(blockKey, importData) {
    try {
      const response = await api.post(`${this.baseURL}/settings-blocks/${blockKey}/import`, importData);
      return response.data;
    } catch (error) {
      console.error(`Erreur lors de l'import du bloc ${blockKey}:`, error);
      throw error;
    }
  }

  /**
   * Initialiser tous les blocs avec leurs valeurs par défaut
   */
  async initializeAllBlocks() {
    try {
      const response = await api.post(`${this.baseURL}/settings-blocks/initialize`);
      return response.data;
    } catch (error) {
      console.error('Erreur lors de l\'initialisation des blocs:', error);
      throw error;
    }
  }

  /**
   * Récupérer la configuration des blocs
   */
  async getBlocksConfig() {
    try {
      const response = await api.get(`${this.baseURL}/settings-blocks/config`);
      return response.data;
    } catch (error) {
      console.error('Erreur lors de la récupération de la configuration:', error);
      throw error;
    }
  }

  /**
   * Récupérer les statistiques de la plateforme
   */
  async getPlatformStats() {
    try {
      const response = await api.get(`${this.baseURL}/platform-stats`);
      return response.data;
    } catch (error) {
      console.error('Erreur lors de la récupération des statistiques:', error);
      throw error;
    }
  }

  /**
   * Récupérer les logs système
   */
  async getSystemLogs(filters = {}) {
    try {
      const params = new URLSearchParams(filters).toString();
      const response = await api.get(`${this.baseURL}/logs${params ? '?' + params : ''}`);
      return response.data;
    } catch (error) {
      console.error('Erreur lors de la récupération des logs:', error);
      throw error;
    }
  }

  /**
   * Récupérer la santé du système
   */
  async getSystemHealth() {
    try {
      const response = await api.get(`${this.baseURL}/system-health`);
      return response.data;
    } catch (error) {
      console.error('Erreur lors de la récupération de la santé du système:', error);
      throw error;
    }
  }

  /**
   * Gérer les permissions utilisateur
   */
  async getUserPermissions(userId) {
    try {
      const response = await api.get(`${this.baseURL}/permissions/user/${userId}`);
      return response.data;
    } catch (error) {
      console.error(`Erreur lors de la récupération des permissions pour l'utilisateur ${userId}:`, error);
      throw error;
    }
  }

  /**
   * Mettre à jour les permissions utilisateur
   */
  async updateUserPermissions(userId, permissions) {
    try {
      const response = await api.put(`${this.baseURL}/permissions/user/${userId}`, {
        permissions
      });
      return response.data;
    } catch (error) {
      console.error(`Erreur lors de la mise à jour des permissions pour l'utilisateur ${userId}:`, error);
      throw error;
    }
  }

  /**
   * Sauvegarde système
   */
  async createBackup() {
    try {
      const response = await api.post(`${this.baseURL}/backup`);
      return response.data;
    } catch (error) {
      console.error('Erreur lors de la création de la sauvegarde:', error);
      throw error;
    }
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
        limit: limit.toString(),
        activeOnly: activeOnly.toString()
      });

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
   * Supprimer un utilisateur
   */
  async deleteUser(userId) {
    try {
      const response = await api.delete(`${this.baseURL}/users/${userId}`);
      return response.data;
    } catch (error) {
      console.error(`Erreur lors de la suppression de l'utilisateur ${userId}:`, error);
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
   * Récupérer les entreprises associées à un utilisateur
   */
  async getUserCompanies(userId) {
    try {
      const response = await api.get(`${this.baseURL}/users/${userId}/companies`);
      return response.data;
    } catch (error) {
      console.error(`Erreur lors de la récupération des entreprises pour l'utilisateur ${userId}:`, error);
      throw error;
    }
  }

  /**
   * Récupérer toutes les entreprises disponibles
   */
  async getAllCompanies() {
    try {
      const response = await api.get(`${this.baseURL}/companies`);
      return response.data;
    } catch (error) {
      console.error('Erreur lors de la récupération des entreprises:', error);
      throw error;
    }
  }

  /**
   * Associer un utilisateur à une entreprise
   */
  async addUserToCompany(userId, companyId, role = 'user') {
    try {
      const response = await api.post(`${this.baseURL}/users/${userId}/companies`, {
        companyId,
        role
      });
      return response.data;
    } catch (error) {
      console.error(`Erreur lors de l'association utilisateur-entreprise:`, error);
      throw error;
    }
  }

  /**
   * Supprimer l'association utilisateur-entreprise
   */
  async removeUserFromCompany(userId, companyId) {
    try {
      const response = await api.delete(`${this.baseURL}/users/${userId}/companies/${companyId}`);
      return response.data;
    } catch (error) {
      console.error(`Erreur lors de la suppression de l'association utilisateur-entreprise:`, error);
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
}

// Créer une instance singleton
const superAdminAPI = new SuperAdminAPI();

export default superAdminAPI;