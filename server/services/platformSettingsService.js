const databaseService = require('./databaseService');

class PlatformSettingsService {
  constructor() {
    this.db = databaseService;
    console.log('🔧 Initialisation PlatformSettingsService');
    this.initializeDefaultSettings();
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
      const row = await this.db.get(
        'SELECT id FROM platform_settings WHERE `key` = ?',
        [key]
      );
      
      if (row) {
        // Le paramètre existe déjà
        return { exists: true, id: row.id };
      } else {
        // Créer le paramètre
        const result = await this.db.run(
          `INSERT INTO platform_settings (\`key\`, value, type, category, description) 
           VALUES (?, ?, ?, ?, ?)`,
          [key, value, type, category, description]
        );
        return { created: true, id: result.insertId };
      }
    } catch (err) {
      throw err;
    }
  }

  // Récupérer tous les paramètres
  async getAllSettings() {
    try {
      const settings = await this.db.query('SELECT * FROM platform_settings ORDER BY category, `key`');
      return settings;
    } catch (err) {
      console.error('Erreur lors de la récupération des paramètres:', err);
      throw err;
    }
  }

  // Récupérer les paramètres par catégorie
  async getSettingsByCategory(category) {
    try {
      const settings = await this.db.query('SELECT * FROM platform_settings WHERE category = ? ORDER BY `key`', [category]);
      return settings;
    } catch (err) {
      console.error('Erreur lors de la récupération des paramètres par catégorie:', err);
      throw err;
    }
  }

  // Récupérer un paramètre spécifique
  async getSetting(key) {
    try {
      const setting = await this.db.get('SELECT * FROM platform_settings WHERE `key` = ?', [key]);
      return setting;
    } catch (err) {
      console.error('Erreur lors de la récupération du paramètre:', err);
      throw err;
    }
  }

  // Mettre à jour un paramètre existant
  async updateSetting(key, value, type = 'string', category = 'general', description = '') {
    try {
      const result = await this.db.run(
        `UPDATE platform_settings 
         SET value = ?, type = ?, category = ?, description = ?, updated_at = CURRENT_TIMESTAMP 
         WHERE \`key\` = ?`,
        [value, type, category, description, key]
      );
      
      if (result.changes === 0) {
        throw new Error(`Paramètre '${key}' non trouvé`);
      }
      
      return { success: true, changes: result.changes };
    } catch (err) {
      console.error('Erreur lors de la mise à jour du paramètre:', err);
      throw err;
    }
  }

  // Mettre à jour ou créer un paramètre
  async updateOrCreateSetting(key, value, type = 'string', category = 'general', description = '') {
    try {
      const existing = await this.getSetting(key);
      if (existing) {
        return await this.updateSetting(key, value, type, category, description);
      } else {
        return await this.createSetting(key, value, type, category, description, false);
      }
    } catch (err) {
      console.error('Erreur lors de la mise à jour/création du paramètre:', err);
      throw err;
    }
  }

  // Créer un nouveau paramètre
  async createSetting(key, value, type = 'string', category = 'general', description = '', isSensitive = false) {
    try {
      const result = await this.db.run(
        `INSERT INTO platform_settings (\`key\`, value, type, category, description, is_sensitive) 
         VALUES (?, ?, ?, ?, ?, ?)`,
        [key, value, type, category, description, isSensitive ? 1 : 0]
      );
      
      return { 
        success: true, 
        id: result.insertId,
        key,
        value,
        type,
        category,
        description
      };
    } catch (err) {
      console.error('Erreur lors de la création du paramètre:', err);
      throw err;
    }
  }

  // Supprimer un paramètre
  async deleteSetting(key) {
    try {
      console.log(`Suppression du paramètre '${key}'`);
      
      const result = await this.db.run('DELETE FROM platform_settings WHERE `key` = ?', [key]);
      
      if (result.changes === 0) {
        throw new Error(`Paramètre '${key}' non trouvé`);
      }
      
      return { success: true, changes: result.changes };
    } catch (err) {
      console.error('Erreur lors de la suppression du paramètre:', err);
      throw err;
    }
  }

  // Récupérer les statistiques de la plateforme
  async getPlatformStats() {
    try {
      const stats = await this.db.query(`
        SELECT 
          (SELECT COUNT(*) FROM users WHERE role = 'user') as total_clients,
          (SELECT COUNT(*) FROM users WHERE role = 'agent') as total_agents,
          (SELECT COUNT(*) FROM projects) as total_projects,
          (SELECT COUNT(*) FROM projects WHERE status = 'active') as active_projects,
          (SELECT COUNT(*) FROM tasks) as total_tasks,
          (SELECT COUNT(*) FROM tasks WHERE status = 'completed') as completed_tasks
      `);
      
      return stats[0] || {};
    } catch (err) {
      console.error('Erreur lors de la récupération des statistiques:', err);
      throw err;
    }
  }
}

module.exports = PlatformSettingsService;