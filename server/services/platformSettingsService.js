const MariaDBService = require('./mariadbService');

class PlatformSettingsService {
  constructor() {
    this.mariadb = new MariaDBService();
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
      const row = await this.mariadb.get(
        'SELECT id FROM platform_settings WHERE `key` = ?',
        [key]
      );
      
      if (row) {
        // Le paramètre existe déjà
        return { exists: true, id: row.id };
      } else {
        // Créer le paramètre
        const result = await this.mariadb.run(
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

  // Obtenir tous les paramètres
  async getAllSettings() {
    try {
      const rows = await this.mariadb.all(
        'SELECT * FROM platform_settings ORDER BY category, `key`'
      );
      console.log('✅ getAllSettings - Nombre de paramètres:', rows.length);
      return rows;
    } catch (err) {
      console.error('❌ Erreur getAllSettings:', err.message);
      throw err;
    }
  }

  // Obtenir les paramètres par catégorie
  async getSettingsByCategory(category) {
    try {
      const rows = await this.mariadb.all(
        'SELECT * FROM platform_settings WHERE category = ? ORDER BY `key`',
        [category]
      );
      return rows;
    } catch (err) {
      console.error('❌ Erreur getSettingsByCategory:', err.message);
      throw err;
    }
  }

  // Obtenir un paramètre spécifique
  async getSetting(key) {
    try {
      const row = await this.mariadb.get(
        'SELECT * FROM platform_settings WHERE `key` = ?',
        [key]
      );
      return row;
    } catch (err) {
      console.error('❌ Erreur getSetting:', err.message);
      throw err;
    }
  }

  // Mettre à jour un paramètre
  async updateSetting(key, value, type = 'string', category = 'general', description = '', updatedBy = null) {
    try {
      const result = await this.mariadb.run(
        `UPDATE platform_settings 
         SET value = ?, type = ?, category = ?, description = ?, updated_at = CURRENT_TIMESTAMP
         WHERE \`key\` = ?`,
        [value, type, category, description, key]
      );
      
      if (result.affectedRows === 0) {
        // Si le paramètre n'existe pas, le créer
        throw new Error('Paramètre non trouvé');
      } else {
        console.log('✅ Paramètre mis à jour:', key);
        return { key, value, updated: true };
      }
    } catch (err) {
      console.error('❌ Erreur updateSetting:', err.message);
      throw err;
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
      const result = await this.mariadb.run(
        `INSERT INTO platform_settings (\`key\`, value, type, category, description, is_sensitive)
         VALUES (?, ?, ?, ?, ?, ?)`,
        [key, value, type, category, description, isSensitive ? 1 : 0]
      );
      
      console.log('✅ Paramètre créé:', key);
      return { id: result.insertId, key, value, created: true };
    } catch (err) {
      if (err.code === 'ER_DUP_ENTRY') {
        throw new Error('Un paramètre avec cette clé existe déjà');
      } else {
        console.error('❌ Erreur createSetting:', err.message);
        throw err;
      }
    }
  }

  // Supprimer un paramètre
  async deleteSetting(key, deletedBy = null) {
    try {
      const result = await this.mariadb.run(
        'DELETE FROM platform_settings WHERE `key` = ?',
        [key]
      );
      
      if (result.affectedRows === 0) {
        throw new Error('Paramètre non trouvé');
      } else {
        console.log('✅ Paramètre supprimé:', key);
        return { key, deleted: true };
      }
    } catch (err) {
      console.error('❌ Erreur deleteSetting:', err.message);
      throw err;
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
          const row = await this.mariadb.get(query);
          return row;
        } catch (err) {
          console.error('❌ Erreur requête stats:', query, err.message);
          return { error: err.message };
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
    } catch (err) {
      throw err;
    }
  }
}

// Exporter la classe au lieu d'une instance pour éviter les initialisations multiples
module.exports = PlatformSettingsService;