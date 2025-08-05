import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

/**
 * Service API pour les fonctionnalités Super Administrateur
 */
class SuperAdminAPI {
  constructor() {
    this.baseURL = `${API_BASE_URL}/api/super-admin`;
    
    // Intercepteur pour ajouter le token d'authentification
    axios.interceptors.request.use(
      (config) => {
        const token = localStorage.getItem('token');
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => {
        return Promise.reject(error);
      }
    );

    // Intercepteur pour gérer les erreurs de réponse
    axios.interceptors.response.use(
      (response) => response,
      (error) => {
        if (error.response?.status === 401) {
          // Token expiré ou invalide
          localStorage.removeItem('token');
          window.location.href = '/login';
        } else if (error.response?.status === 403) {
          // Accès refusé
          console.error('Accès refusé - Privilèges Super Admin requis');
        }
        return Promise.reject(error);
      }
    );
  }

  /**
   * Obtenir le tableau de bord avec statistiques
   */
  async getDashboard() {
    try {
      const response = await axios.get(`${this.baseURL}/dashboard`);
      return response.data;
    } catch (error) {
      console.error('Erreur getDashboard:', error);
      throw this.handleError(error);
    }
  }

  /**
   * Obtenir tous les paramètres de plateforme
   */
  async getSettings(category = null) {
    try {
      const params = category ? { category } : {};
      const response = await axios.get(`${this.baseURL}/settings`, { params });
      return response.data;
    } catch (error) {
      console.error('Erreur getSettings:', error);
      throw this.handleError(error);
    }
  }

  /**
   * Obtenir un paramètre spécifique
   */
  async getSetting(key) {
    try {
      const response = await axios.get(`${this.baseURL}/settings/${key}`);
      return response.data;
    } catch (error) {
      console.error('Erreur getSetting:', error);
      throw this.handleError(error);
    }
  }

  /**
   * Mettre à jour un paramètre
   */
  async updateSetting(key, value) {
    try {
      const response = await axios.put(`${this.baseURL}/settings/${key}`, { value });
      return response.data;
    } catch (error) {
      console.error('Erreur updateSetting:', error);
      throw this.handleError(error);
    }
  }

  /**
   * Créer un nouveau paramètre
   */
  async createSetting(settingData) {
    try {
      const response = await axios.post(`${this.baseURL}/settings`, settingData);
      return response.data;
    } catch (error) {
      console.error('Erreur createSetting:', error);
      throw this.handleError(error);
    }
  }

  /**
   * Supprimer un paramètre
   */
  async deleteSetting(key) {
    try {
      const response = await axios.delete(`${this.baseURL}/settings/${key}`);
      return response.data;
    } catch (error) {
      console.error('Erreur deleteSetting:', error);
      throw this.handleError(error);
    }
  }

  /**
   * Obtenir les logs d'actions
   */
  async getLogs(params = {}) {
    try {
      const { limit = 50, offset = 0, action_type } = params;
      const queryParams = { limit, offset };
      if (action_type) {
        queryParams.action_type = action_type;
      }
      
      const response = await axios.get(`${this.baseURL}/logs`, { params: queryParams });
      return response.data;
    } catch (error) {
      console.error('Erreur getLogs:', error);
      throw this.handleError(error);
    }
  }

  /**
   * Obtenir toutes les permissions système
   */
  async getPermissions() {
    try {
      const response = await axios.get(`${this.baseURL}/permissions`);
      return response.data;
    } catch (error) {
      console.error('Erreur getPermissions:', error);
      throw this.handleError(error);
    }
  }

  /**
   * Obtenir les permissions d'un rôle
   */
  async getRolePermissions(role) {
    try {
      const response = await axios.get(`${this.baseURL}/roles/${role}/permissions`);
      return response.data;
    } catch (error) {
      console.error('Erreur getRolePermissions:', error);
      throw this.handleError(error);
    }
  }

  /**
   * Obtenir l'état de santé du système
   */
  async getSystemHealth() {
    try {
      const response = await axios.get(`${this.baseURL}/system/health`);
      return response.data;
    } catch (error) {
      console.error('Erreur getSystemHealth:', error);
      throw this.handleError(error);
    }
  }

  /**
   * Créer une sauvegarde du système
   */
  async createBackup() {
    try {
      const response = await axios.post(`${this.baseURL}/system/backup`);
      return response.data;
    } catch (error) {
      console.error('Erreur createBackup:', error);
      throw this.handleError(error);
    }
  }

  /**
   * Obtenir tous les blocs de paramètres
   */
  async getSettingsBlocks() {
    try {
      const response = await axios.get(`${this.baseURL}/settings-blocks`);
      return response.data;
    } catch (error) {
      console.error('Erreur getSettingsBlocks:', error);
      throw this.handleError(error);
    }
  }

  /**
   * Obtenir un bloc de paramètres spécifique
   */
  async getSettingsBlock(blockKey) {
    try {
      const response = await axios.get(`${this.baseURL}/settings-blocks/${blockKey}`);
      return response.data;
    } catch (error) {
      console.error('Erreur getSettingsBlock:', error);
      throw this.handleError(error);
    }
  }

  /**
   * Sauvegarder les paramètres d'un bloc
   */
  async saveSettingsBlock(blockKey, settings) {
    try {
      const response = await axios.put(`${this.baseURL}/settings-blocks/${blockKey}/batch`, {
        settings
      });
      return response.data;
    } catch (error) {
      console.error('Erreur saveSettingsBlock:', error);
      throw this.handleError(error);
    }
  }

  /**
   * Réinitialiser un bloc aux valeurs par défaut
   */
  async resetSettingsBlock(blockKey) {
    try {
      const response = await axios.post(`${this.baseURL}/settings-blocks/${blockKey}/reset`);
      return response.data;
    } catch (error) {
      console.error('Erreur resetSettingsBlock:', error);
      throw this.handleError(error);
    }
  }

  /**
   * Exporter un bloc de paramètres
   */
  async exportSettingsBlock(blockKey) {
    try {
      const response = await axios.get(`${this.baseURL}/settings-blocks/${blockKey}/export`);
      return response.data;
    } catch (error) {
      console.error('Erreur exportSettingsBlock:', error);
      throw this.handleError(error);
    }
  }

  /**
   * Importer un bloc de paramètres
   */
  async importSettingsBlock(blockKey, data) {
    try {
      const response = await axios.post(`${this.baseURL}/settings-blocks/${blockKey}/import`, data);
      return response.data;
    } catch (error) {
      console.error('Erreur importSettingsBlock:', error);
      throw this.handleError(error);
    }
  }

  /**
   * Initialiser tous les blocs avec leurs valeurs par défaut
   */
  async initializeSettingsBlocks() {
    try {
      const response = await axios.post(`${this.baseURL}/settings-blocks/initialize`);
      return response.data;
    } catch (error) {
      console.error('Erreur initializeSettingsBlocks:', error);
      throw this.handleError(error);
    }
  }

  /**
   * Obtenir la configuration des blocs
   */
  async getSettingsBlocksConfig() {
    try {
      const response = await axios.get(`${this.baseURL}/settings-blocks/config`);
      return response.data;
    } catch (error) {
      console.error('Erreur getSettingsBlocksConfig:', error);
      throw this.handleError(error);
    }
  }

  /**
   * Valider les paramètres de configuration
   */
  async validateSettings(settings) {
    const validationErrors = [];
    
    // Validation des URLs
    const urlSettings = ['frontend_url', 'api_base_url', 'callback_url'];
    urlSettings.forEach(key => {
      const setting = settings.find(s => s.key === key);
    if (setting && setting.value) {
        try {
          new URL(setting.value);
          // Vérifier que ce n'est pas localhost en production
          if (process.env.NODE_ENV === 'production' && 
              setting.value.includes('localhost')) {
            validationErrors.push({
              key,
              message: 'Les URLs localhost ne sont pas autorisées en production'
            });
          }
        } catch (error) {
          validationErrors.push({
            key,
            message: 'URL invalide'
          });
        }
      }
    });

    // Validation des emails
    const emailSettings = ['smtp_user', 'email_from'];
    emailSettings.forEach(key => {
      const setting = settings.find(s => s.key === key);
    if (setting && setting.value) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(setting.value)) {
          validationErrors.push({
            key,
            message: 'Format d\'email invalide'
          });
        }
      }
    });

    // Validation des ports
    const portSettings = ['smtp_port'];
    portSettings.forEach(key => {
      const setting = settings.find(s => s.key === key);
    if (setting && setting.value) {
      const port = parseInt(setting.value);
        if (isNaN(port) || port < 1 || port > 65535) {
          validationErrors.push({
            key,
            message: 'Port invalide (doit être entre 1 et 65535)'
          });
        }
      }
    });

    return validationErrors;
  }

  /**
   * Formater les données de paramètres pour l'affichage
   */
  formatSettingsForDisplay(settings) {
    return settings.map(setting => ({
      ...setting,
      displayValue: setting.is_sensitive ? '••••••••' : setting.value,
        isEditable: !['created_at', 'updated_at'].includes(setting.key),
      category: setting.category || 'Général'
    }));
  }

  /**
   * Obtenir les catégories de paramètres disponibles
   */
  getSettingCategories() {
    return [
      { value: 'general', label: 'Général' },
      { value: 'email', label: 'Configuration Email' },
      { value: 'security', label: 'Sécurité' },
      { value: 'oauth', label: 'OAuth & Authentification' },
      { value: 'api', label: 'Configuration API' },
      { value: 'ui', label: 'Interface Utilisateur' },
      { value: 'monitoring', label: 'Surveillance' },
      { value: 'backup', label: 'Sauvegarde' }
    ];
  }

  /**
   * Obtenir les types de paramètres disponibles
   */
  getSettingTypes() {
    return [
      { value: 'string', label: 'Texte' },
      { value: 'number', label: 'Nombre' },
      { value: 'boolean', label: 'Booléen' },
      { value: 'url', label: 'URL' },
      { value: 'email', label: 'Email' },
      { value: 'password', label: 'Mot de passe' },
      { value: 'json', label: 'JSON' }
    ];
  }

  /**
   * Gérer les erreurs API
   */
  handleError(error) {
    if (error.response) {
      // Erreur de réponse du serveur
      const message = error.response.data?.message || 'Erreur du serveur';
      return new Error(message);
    } else if (error.request) {
      // Erreur de réseau
      return new Error('Erreur de connexion au serveur');
    } else {
      // Autre erreur
      return new Error('Erreur inattendue');
    }
  }

  /**
   * Exporter les paramètres en JSON
   */
  async exportSettings() {
    try {
      const response = await this.getSettings();
      const settings = response.data.settings;
      
      // Créer un objet d'export avec métadonnées
      const exportData = {
        export_date: new Date().toISOString(),
        platform: 'Fusepoint',
        version: '1.0.0',
        settings: settings
      };
      
      // Créer et télécharger le fichier
      const blob = new Blob([JSON.stringify(exportData, null, 2)], {
        type: 'application/json'
      });
      
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `fusepoint-settings-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      
      return { success: true, message: 'Paramètres exportés avec succès' };
    } catch (error) {
      console.error('Erreur export paramètres:', error);
      throw this.handleError(error);
    }
  }
}

// Créer une instance singleton
const superAdminAPI = new SuperAdminAPI();

export { superAdminAPI };
export default superAdminAPI;