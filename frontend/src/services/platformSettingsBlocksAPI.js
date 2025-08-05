import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

/**
 * Service API pour la gestion simplifiée des paramètres par blocs
 */
class PlatformSettingsBlocksAPI {
  constructor() {
    this.baseURL = `${API_BASE_URL}/api/super-admin`;
  }

  /**
   * Récupérer tous les paramètres organisés par blocs
   */
  async getSettingsByBlocks() {
    try {
      const response = await axios.get(`${this.baseURL}/settings`);
      return this.organizeSettingsByBlocks(response.data);
    } catch (error) {
      console.error('Erreur lors de la récupération des paramètres par blocs:', error);
      throw error;
    }
  }

  /**
   * Organiser les paramètres par blocs/catégories
   */
  organizeSettingsByBlocks(settings) {
    const blocks = {
      general: [],
      email: [],
      security: [],
      api: [],
      ui: []
    };

    settings.forEach(setting => {
      const category = setting.category || 'general';
      if (blocks[category]) {
        blocks[category].push({
          key: setting.key,
        value: setting.value,
          type: setting.value_type,
          description: setting.description,
          category: setting.category,
          updatedAt: setting.updated_at
        });
      }
    });

    return blocks;
  }

  /**
   * Sauvegarder un paramètre spécifique
   */
  async saveSetting(key, value, type = 'string', category = 'general', description = '') {
    try {
      const response = await axios.put(`${this.baseURL}/settings/${key}`, {
        value: value,
        type: type,
        category: category,
        description: description
      });
      return response.data;
    } catch (error) {
      console.error(`Erreur lors de la sauvegarde du paramètre ${key}:`, error);
      throw error;
    }
  }

  /**
   * Sauvegarder plusieurs paramètres en lot
   */
  async saveBatchSettings(settingsArray) {
    try {
      const promises = settingsArray.map(setting => 
        this.saveSetting(
          setting.key, 
          setting.value, 
          setting.type, 
          setting.category, 
          setting.description
        )
      );
      
      const results = await Promise.allSettled(promises);
      
      const failed = results.filter(result => result.status === 'rejected');
      if (failed.length > 0) {
        console.warn(`${failed.length} paramètres n'ont pas pu être sauvegardés:`, failed);
      }
      
      return {
        success: results.filter(result => result.status === 'fulfilled').length,
        failed: failed.length,
        total: settingsArray.length
      };
    } catch (error) {
      console.error('Erreur lors de la sauvegarde en lot:', error);
      throw error;
    }
  }

  /**
   * Créer un nouveau paramètre
   */
  async createSetting(key, value, type = 'string', category = 'general', description = '', isSensitive = false) {
    try {
      const response = await axios.post(`${this.baseURL}/settings`, {
        key: key,
        value: value,
        type: type,
        category: category,
        description: description,
        isSensitive: isSensitive
      });
      return response.data;
    } catch (error) {
      console.error(`Erreur lors de la création du paramètre ${key}:`, error);
      throw error;
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
      console.error(`Erreur lors de la suppression du paramètre ${key}:`, error);
      throw error;
    }
  }

  /**
   * Réinitialiser un bloc de paramètres aux valeurs par défaut
   */
  async resetBlockToDefaults(blockKey, defaultSettings) {
    try {
      const promises = defaultSettings.map(setting => 
        this.saveSetting(
          setting.key,
          setting.default,
          setting.type,
          blockKey,
          setting.description
        )
      );
      
      await Promise.all(promises);
      return { success: true, message: `Bloc ${blockKey} réinitialisé aux valeurs par défaut` };
    } catch (error) {
      console.error(`Erreur lors de la réinitialisation du bloc ${blockKey}:`, error);
      throw error;
    }
  }

  /**
   * Valider les paramètres d'un bloc
   */
  validateBlockSettings(blockKey, settings, blockConfig) {
    const errors = [];
    
    blockConfig.settings.forEach(settingConfig => {
      const setting = settings.find(s => s.key === settingConfig.key);
      
      // Vérifier les champs requis
      if (settingConfig.required && (!setting || !setting.value)) {
        errors.push({
          key: settingConfig.key,
          message: `Le paramètre "${settingConfig.label}" est requis`
        });
      }
      
      // Vérifier les types
      if (setting && setting.value) {
        switch (settingConfig.type) {
          case 'number':
            const numValue = Number(setting.value);
            if (isNaN(numValue)) {
              errors.push({
                key: settingConfig.key,
                message: `"${settingConfig.label}" doit être un nombre`
              });
            } else {
              if (settingConfig.min !== undefined && numValue < settingConfig.min) {
                errors.push({
                  key: settingConfig.key,
                  message: `"${settingConfig.label}" doit être supérieur ou égal à ${settingConfig.min}`
                });
              }
              if (settingConfig.max !== undefined && numValue > settingConfig.max) {
                errors.push({
                  key: settingConfig.key,
                  message: `"${settingConfig.label}" doit être inférieur ou égal à ${settingConfig.max}`
                });
              }
            }
            break;
            
          case 'url':
            try {
              new URL(setting.value);
            } catch {
              errors.push({
                key: settingConfig.key,
                message: `"${settingConfig.label}" doit être une URL valide`
              });
            }
            break;
        }
      }
    });
    
    return errors;
  }

  /**
   * Exporter les paramètres d'un bloc
   */
  async exportBlockSettings(blockKey) {
    try {
      const response = await axios.get(`${this.baseURL}/settings`, {
        params: { category: blockKey }
      });
      
      const exportData = {
        block: blockKey,
        exportDate: new Date().toISOString(),
        settings: response.data.map(setting => ({
          key: setting.key,
        value: setting.value,
          type: setting.value_type,
          description: setting.description
        }))
      };
      
      return exportData;
    } catch (error) {
      console.error(`Erreur lors de l'export du bloc ${blockKey}:`, error);
      throw error;
    }
  }

  /**
   * Importer les paramètres d'un bloc
   */
  async importBlockSettings(importData) {
    try {
      const promises = importData.settings.map(setting => 
        this.saveSetting(
          setting.key,
          setting.value,
          setting.type,
          importData.block,
          setting.description
        )
      );
      
      await Promise.all(promises);
      return { 
        success: true, 
        message: `${importData.settings.length} paramètres importés pour le bloc ${importData.block}` 
      };
    } catch (error) {
      console.error('Erreur lors de l\'import:', error);
      throw error;
    }
  }

  /**
   * Obtenir l'historique des modifications d'un paramètre
   */
  async getSettingHistory(key) {
    try {
      const response = await axios.get(`${this.baseURL}/settings/${key}/history`);
      return response.data;
    } catch (error) {
      console.error(`Erreur lors de la récupération de l'historique pour ${key}:`, error);
      throw error;
    }
  }
}

export default new PlatformSettingsBlocksAPI();