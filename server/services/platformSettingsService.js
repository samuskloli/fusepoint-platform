const MariaDBService = require('./mariadbService');
const path = require('path');
const fs = require('fs');

class PlatformSettingsService {
  constructor() {
    this.mariadbService = new MariaDBService();
    console.log('🔧 Initialisation PlatformSettingsService');
    this.init();
  }

  async init() {
    try {
      await this.mariadbService.initialize();
      console.log('✅ Connexion MariaDB configurée');
      await this.initializeDefaultSettings();
    } catch (error) {
      console.error('❌ Erreur initialisation PlatformSettingsService:', error);
    }
  }

  // Initialiser les paramètres par défaut si nécessaire
  async initializeDefaultSettings() {
    try {
      // Ajouter l'URL de production si elle n'existe pas
      await this.createSettingIfNotExists(
        'frontend_url',
        'https://fusepoint.ch',
        'url',
        'general',
        'URL de production de la plateforme'
      );
      
      console.log('✅ Paramètres par défaut initialisés');
    } catch (error) {
      console.error('❌ Erreur initialisation paramètres:', error);
    }
  }

  // Créer un paramètre seulement s'il n'existe pas
  async createSettingIfNotExists(key, value, type = 'string', category = 'general', description = '') {
    try {
      // Vérifier si le paramètre existe déjà
      const existingRows = await this.mariadbService.query(
        'SELECT id FROM platform_settings WHERE `key` = ?',
        [key]
      );
      
      if (existingRows.length > 0) {
        // Le paramètre existe déjà
        return { exists: true, id: existingRows[0].id };
      } else {
        // Créer le paramètre
        const result = await this.mariadbService.query(
          `INSERT INTO platform_settings (\`key\`, value, type, category, description) 
           VALUES (?, ?, ?, ?, ?)`,
          [key, value, type, category, description]
        );
        return { created: true, id: result.insertId };
      }
    } catch (error) {
      throw error;
    }
  }

  // Obtenir tous les paramètres
  async getAllSettings() {
    try {
      const rows = await this.mariadbService.query(
        'SELECT * FROM platform_settings ORDER BY category, `key`'
      );
      console.log('✅ getAllSettings - Nombre de paramètres:', rows.length);
      return rows;
    } catch (error) {
      console.error('❌ Erreur getAllSettings:', error.message);
      throw error;
    }
  }

  // Obtenir les paramètres par catégorie
  async getSettingsByCategory(category) {
    try {
      const rows = await this.mariadbService.query(
        'SELECT * FROM platform_settings WHERE category = ? ORDER BY `key`',
        [category]
      );
      return rows;
    } catch (error) {
      console.error('❌ Erreur getSettingsByCategory:', error.message);
      throw error;
    }
  }

  // Obtenir un paramètre spécifique
  async getSetting(key) {
    try {
      const rows = await this.mariadbService.query(
        'SELECT * FROM platform_settings WHERE `key` = ?',
        [key]
      );
      return rows[0] || null;
    } catch (error) {
      console.error('❌ Erreur getSetting:', error.message);
      throw error;
    }
  }

  // Mettre à jour un paramètre
  async updateSetting(key, value, type = 'string', category = 'general', description = '', updatedBy = null) {
    try {
      const result = await this.mariadbService.query(
        `UPDATE platform_settings 
         SET value = ?, type = ?, category = ?, description = ?, updated_at = CURRENT_TIMESTAMP
         WHERE \`key\` = ?`,
        [value, type, category, description, key]
      );
      
      if (result.affectedRows === 0) {
        throw new Error('Paramètre non trouvé');
      }
      
      console.log('✅ Paramètre mis à jour:', key);
      return { key, value, updated: true };
    } catch (error) {
      console.error('❌ Erreur updateSetting:', error.message);
      throw error;
    }
  }

  // Mettre à jour ou créer un paramètre
  async updateOrCreateSetting(key, value, type = 'string', category = 'general', description = '', updatedBy = null) {
    try {
      return await this.updateSetting(key, value, type, category, description, updatedBy);
    } catch (error) {
      if (error.message === 'Paramètre non trouvé') {
        return await this.createSetting(key, value, type, category, description, false, updatedBy);
      }
      throw error;
    }
  }

  // Créer un nouveau paramètre
  async createSetting(key, value, type = 'string', category = 'general', description = '', isSensitive = false, createdBy = null) {
    try {
      const result = await this.mariadbService.query(
        `INSERT INTO platform_settings (\`key\`, value, type, category, description, is_sensitive)
         VALUES (?, ?, ?, ?, ?, ?)`,
        [key, value, type, category, description, isSensitive ? 1 : 0]
      );
      
      console.log('✅ Paramètre créé:', key);
      return { id: result.insertId, key, value, created: true };
    } catch (error) {
      if (error.code === 'ER_DUP_ENTRY') {
        throw new Error('Un paramètre avec cette clé existe déjà');
      } else {
        console.error('❌ Erreur createSetting:', error.message);
        throw error;
      }
    }
  }

  // Supprimer un paramètre
  async deleteSetting(key, deletedBy = null) {
    try {
      const result = await this.mariadbService.query(
        'DELETE FROM platform_settings WHERE `key` = ?',
        [key]
      );
      
      if (result.affectedRows === 0) {
        throw new Error('Paramètre non trouvé');
      }
      
      console.log('✅ Paramètre supprimé:', key);
      return { key, deleted: true };
    } catch (error) {
      console.error('❌ Erreur deleteSetting:', error.message);
      throw error;
    }
  }

  // Obtenir les statistiques de la plateforme
  async getPlatformStats() {
    try {
      const queries = [
        'SELECT COUNT(*) as total_users FROM users',
        'SELECT COUNT(*) as total_companies FROM companies',
        'SELECT COUNT(*) as total_settings FROM platform_settings'
      ];

      const results = await Promise.all(queries.map(async (query) => {
        try {
          const rows = await this.mariadbService.query(query);
          return rows[0];
        } catch (error) {
          console.error('❌ Erreur requête stats:', query, error.message);
          return { error: error.message };
        }
      }));

      const stats = {
        totalUsers: results[0]?.total_users || 0,
        totalCompanies: results[1]?.total_companies || 0,
        totalSettings: results[2]?.total_settings || 0,
        timestamp: new Date().toISOString()
      };
      
      console.log('✅ getPlatformStats - Stats générées:', stats);
      return stats;
    } catch (error) {
      throw error;
    }
  }
}

// Créer et exporter une instance du service
let instance;
try {
  console.log('🚀 Création instance PlatformSettingsService...');
  instance = new PlatformSettingsService();
  console.log('✅ Instance créée avec succès');
  console.log('🔍 getAllSettings disponible:', typeof instance.getAllSettings);
  console.log('🔍 getPlatformStats disponible:', typeof instance.getPlatformStats);
  module.exports = instance;
  console.log('✅ Service exporté avec succès');
} catch (error) {
  console.error('❌ ERREUR CRITIQUE:', error.message);
  module.exports = {};
}

console.log('🏁 Fin du fichier platformSettingsService.js');