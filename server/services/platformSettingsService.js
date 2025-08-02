const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const fs = require('fs');

class PlatformSettingsService {
  constructor() {
    this.dbPath = path.join(__dirname, '../database/fusepoint.db');
    console.log('🔧 Initialisation PlatformSettingsService');
    console.log('📁 Chemin DB:', this.dbPath);
    console.log('📄 Fichier existe:', fs.existsSync(this.dbPath));
    
    this.db = new sqlite3.Database(this.dbPath, (err) => {
      if (err) {
        console.error('❌ Erreur connexion DB:', err.message);
      } else {
        console.log('✅ Connexion DB réussie');
        this.initializeDefaultSettings();
      }
    });
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
    return new Promise((resolve, reject) => {
      // Vérifier si le paramètre existe déjà
      this.db.get(
        'SELECT id FROM platform_settings WHERE key = ?',
        [key],
        (err, row) => {
          if (err) {
            reject(err);
          } else if (row) {
            // Le paramètre existe déjà
            resolve({ exists: true, id: row.id });
          } else {
            // Créer le paramètre
            this.db.run(
              `INSERT INTO platform_settings (key, value, type, category, description) 
               VALUES (?, ?, ?, ?, ?)`,
              [key, value, type, category, description],
              function(err) {
                if (err) {
                  reject(err);
                } else {
                  resolve({ created: true, id: this.lastID });
                }
              }
            );
          }
        }
      );
    });
  }

  // Obtenir tous les paramètres
  async getAllSettings() {
    return new Promise((resolve, reject) => {
      this.db.all(
        'SELECT * FROM platform_settings ORDER BY category, key',
        [],
        (err, rows) => {
          if (err) {
            console.error('❌ Erreur getAllSettings:', err.message);
            reject(err);
          } else {
            console.log('✅ getAllSettings - Nombre de paramètres:', rows.length);
            resolve(rows);
          }
        }
      );
    });
  }

  // Obtenir les paramètres par catégorie
  async getSettingsByCategory(category) {
    return new Promise((resolve, reject) => {
      this.db.all(
        'SELECT * FROM platform_settings WHERE category = ? ORDER BY key',
        [category],
        (err, rows) => {
          if (err) {
            console.error('❌ Erreur getSettingsByCategory:', err.message);
            reject(err);
          } else {
            resolve(rows);
          }
        }
      );
    });
  }

  // Obtenir un paramètre spécifique
  async getSetting(key) {
    return new Promise((resolve, reject) => {
      this.db.get(
        'SELECT * FROM platform_settings WHERE key = ?',
        [key],
        (err, row) => {
          if (err) {
            console.error('❌ Erreur getSetting:', err.message);
            reject(err);
          } else {
            resolve(row);
          }
        }
      );
    });
  }

  // Mettre à jour un paramètre
  async updateSetting(key, value, type = 'string', category = 'general', description = '', updatedBy = null) {
    return new Promise((resolve, reject) => {
      this.db.run(
        `UPDATE platform_settings 
         SET value = ?, type = ?, category = ?, description = ?, updated_at = CURRENT_TIMESTAMP
         WHERE key = ?`,
        [value, type, category, description, key],
        function(err) {
          if (err) {
            console.error('❌ Erreur updateSetting:', err.message);
            reject(err);
          } else if (this.changes === 0) {
            // Si le paramètre n'existe pas, le créer
            reject(new Error('Paramètre non trouvé'));
          } else {
            console.log('✅ Paramètre mis à jour:', key);
            resolve({ key, value, updated: true });
          }
        }
      );
    });
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
    return new Promise((resolve, reject) => {
      this.db.run(
        `INSERT INTO platform_settings (key, value, type, category, description, is_sensitive)
         VALUES (?, ?, ?, ?, ?, ?)`,
        [key, value, type, category, description, isSensitive ? 1 : 0],
        function(err) {
          if (err) {
            if (err.code === 'SQLITE_CONSTRAINT_UNIQUE') {
              reject(new Error('Un paramètre avec cette clé existe déjà'));
            } else {
              console.error('❌ Erreur createSetting:', err.message);
              reject(err);
            }
          } else {
            console.log('✅ Paramètre créé:', key);
            resolve({ id: this.lastID, key, value, created: true });
          }
        }
      );
    });
  }

  // Supprimer un paramètre
  async deleteSetting(key, deletedBy = null) {
    return new Promise((resolve, reject) => {
      this.db.run(
        'DELETE FROM platform_settings WHERE key = ?',
        [key],
        function(err) {
          if (err) {
            console.error('❌ Erreur deleteSetting:', err.message);
            reject(err);
          } else if (this.changes === 0) {
            reject(new Error('Paramètre non trouvé'));
          } else {
            console.log('✅ Paramètre supprimé:', key);
            resolve({ key, deleted: true });
          }
        }
      );
    });
  }

  // Obtenir les statistiques de la plateforme
  async getPlatformStats() {
    return new Promise((resolve, reject) => {
      const queries = [
        'SELECT COUNT(*) as total_users FROM users',
        'SELECT COUNT(*) as total_companies FROM companies',
        'SELECT COUNT(*) as total_settings FROM platform_settings'
      ];

      Promise.all(queries.map(query => {
        return new Promise((resolve, reject) => {
          this.db.get(query, [], (err, row) => {
            if (err) {
              console.error('❌ Erreur requête stats:', query, err.message);
              resolve({ error: err.message });
            } else {
              resolve(row);
            }
          });
        });
      })).then(results => {
        const stats = {
          totalUsers: results[0]?.total_users || 0,
          totalCompanies: results[1]?.total_companies || 0,
          totalSettings: results[2]?.total_settings || 0,
          timestamp: new Date().toISOString()
        };
        
        console.log('✅ getPlatformStats - Stats générées:', stats);
        resolve(stats);
      }).catch(reject);
    });
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