const databaseService = require('./databaseService');

// Utilitaire pour sérialiser en JSON en gérant les BigInt
function safeJSONStringify(obj) {
  try {
    return JSON.stringify(obj, (key, value) => {
      return typeof value === 'bigint' ? Number(value) : value;
    });
  } catch (e) {
    // En cas d'erreur de sérialisation, retourner une version stringifiée basique
    try {
      return JSON.stringify(String(obj));
    } catch (_) {
      return null;
    }
  }
}

class SystemLogsService {
  constructor() {
    this.db = databaseService;
    this.initializeLogsTable();
  }

  // Initialiser la table des logs
  async initializeLogsTable() {
    const createTableQuery = `
      CREATE TABLE IF NOT EXISTS system_logs (
        id INT AUTO_INCREMENT PRIMARY KEY,
        level VARCHAR(50) NOT NULL,
        message TEXT NOT NULL,
        category VARCHAR(100) DEFAULT 'general',
        user_id INT,
        ip_address VARCHAR(45),
        user_agent TEXT,
        metadata TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `;

    try {
      await this.db.run(createTableQuery);
      console.log('Table system_logs initialisée avec succès');
      this.insertSampleLogs();
    } catch (err) {
      console.error('Erreur lors de la création de la table system_logs:', err);
    }
  }

  // Insérer des logs d'exemple
  async insertSampleLogs() {
    const sampleLogs = [
      {
        level: 'info',
        message: 'Application démarrée avec succès',
        category: 'system',
        metadata: safeJSONStringify({ version: '1.0.0' })
      },
      {
        level: 'info',
        message: 'Utilisateur connecté',
        category: 'auth',
        user_id: 1,
        ip_address: '127.0.0.1',
        metadata: safeJSONStringify({ loginMethod: 'email' })
      },
      {
        level: 'warning',
        message: 'Tentative de connexion avec un mot de passe incorrect',
        category: 'auth',
        ip_address: '192.168.1.100',
        metadata: safeJSONStringify({ attempts: 3 })
      },
      {
        level: 'error',
        message: 'Erreur de connexion à la base de données',
        category: 'database',
        metadata: safeJSONStringify({ error: 'Connection timeout' })
      }
    ];

    for (const log of sampleLogs) {
      try {
        const existing = await this.db.get(
          'SELECT id FROM system_logs WHERE message = ? AND category = ?',
          [log.message, log.category]
        );
        
        if (!existing) {
          await this.db.run(
            'INSERT INTO system_logs (level, message, category, user_id, ip_address, metadata) VALUES (?, ?, ?, ?, ?, ?)',
            [log.level, log.message, log.category, log.user_id || null, log.ip_address || null, log.metadata || null]
          );
        }
      } catch (err) {
        console.error('Erreur lors de l\'insertion du log d\'exemple:', err);
      }
    }
  }

  // Récupérer les logs avec filtres
  async getLogs(filters = {}) {
    try {
      let query = 'SELECT * FROM system_logs WHERE 1=1';
      const params = [];

      if (filters.level) {
        query += ' AND level = ?';
        params.push(filters.level);
      }

      if (filters.category) {
        query += ' AND category = ?';
        params.push(filters.category);
      }

      if (filters.user_id) {
        query += ' AND user_id = ?';
        params.push(filters.user_id);
      }

      if (filters.start_date) {
        query += ' AND created_at >= ?';
        params.push(filters.start_date);
      }

      if (filters.end_date) {
        query += ' AND created_at <= ?';
        params.push(filters.end_date);
      }

      if (filters.search) {
        query += ' AND message LIKE ?';
        params.push(`%${filters.search}%`);
      }

      query += ' ORDER BY created_at DESC';

      if (filters.limit) {
        query += ' LIMIT ?';
        params.push(parseInt(filters.limit));
      }

      if (filters.offset) {
        query += ' OFFSET ?';
        params.push(parseInt(filters.offset));
      }

      const logs = await this.db.query(query, params);
      
      // Parser le metadata JSON
      return logs.map(log => ({
        ...log,
        metadata: log.metadata ? JSON.parse(log.metadata) : null
      }));
    } catch (err) {
      console.error('Erreur lors de la récupération des logs:', err);
      throw err;
    }
  }

  // Compter les logs avec filtres
  async getLogsCount(filters = {}) {
    try {
      let query = 'SELECT COUNT(*) as count FROM system_logs WHERE 1=1';
      const params = [];

      if (filters.level) {
        query += ' AND level = ?';
        params.push(filters.level);
      }

      if (filters.category) {
        query += ' AND category = ?';
        params.push(filters.category);
      }

      if (filters.user_id) {
        query += ' AND user_id = ?';
        params.push(filters.user_id);
      }

      if (filters.start_date) {
        query += ' AND created_at >= ?';
        params.push(filters.start_date);
      }

      if (filters.end_date) {
        query += ' AND created_at <= ?';
        params.push(filters.end_date);
      }

      if (filters.search) {
        query += ' AND message LIKE ?';
        params.push(`%${filters.search}%`);
      }

      const result = await this.db.get(query, params);
      return result.count;
    } catch (err) {
      console.error('Erreur lors du comptage des logs:', err);
      throw err;
    }
  }

  // Obtenir les statistiques des logs
  async getLogsStats() {
    try {
      const stats = {};
      
      // Statistiques par niveau
      const levelStats = await this.db.query(`
        SELECT level, COUNT(*) as count 
        FROM system_logs 
        GROUP BY level
      `);
      stats.byLevel = levelStats;

      // Statistiques par catégorie
      const categoryStats = await this.db.query(`
        SELECT category, COUNT(*) as count 
        FROM system_logs 
        GROUP BY category
      `);
      stats.byCategory = categoryStats;

      // Statistiques par jour (7 derniers jours)
      const dailyStats = await this.db.query(`
        SELECT DATE(created_at) as date, COUNT(*) as count 
        FROM system_logs 
        WHERE created_at >= DATE_SUB(NOW(), INTERVAL 7 DAY)
        GROUP BY DATE(created_at)
        ORDER BY date
      `);
      stats.daily = dailyStats;

      return stats;
    } catch (err) {
      console.error('Erreur lors de la récupération des statistiques:', err);
      throw err;
    }
  }

  // Ajouter un nouveau log
  async addLog(level, message, category = 'general', userId = null, ipAddress = null, userAgent = null, metadata = null) {
    try {
      const metadataStr = metadata ? safeJSONStringify(metadata) : null;
      
      const result = await this.db.run(
        'INSERT INTO system_logs (level, message, category, user_id, ip_address, user_agent, metadata) VALUES (?, ?, ?, ?, ?, ?, ?)',
        [level, message, category, userId, ipAddress, userAgent, metadataStr]
      );

      return {
        id: result.insertId,
        level,
        message,
        category,
        user_id: userId,
        ip_address: ipAddress,
        user_agent: userAgent,
        metadata,
        created_at: new Date()
      };
    } catch (err) {
      console.error('Erreur lors de l\'ajout du log:', err);
      // Ne pas propager l'erreur de log pour éviter de casser la requête principale
      return {
        id: null,
        level,
        message,
        category,
        user_id: userId,
        ip_address: ipAddress,
        user_agent: userAgent,
        metadata,
        created_at: new Date(),
        error: err.message
      };
    }
  }

  // Nettoyer les anciens logs
  async cleanOldLogs(daysToKeep = 30) {
    try {
      const result = await this.db.run(
        'DELETE FROM system_logs WHERE created_at < DATE_SUB(NOW(), INTERVAL ? DAY)',
        [daysToKeep]
      );
      
      console.log(`${result.affectedRows} anciens logs supprimés`);
      return result.affectedRows;
    } catch (err) {
      console.error('Erreur lors du nettoyage des logs:', err);
      throw err;
    }
  }

  // Exporter les logs
  async exportLogs(filters = {}, format = 'json') {
    try {
      const logs = await this.getLogs(filters);
      
      if (format === 'csv') {
        return this.convertToCSV(logs);
      }
      
      return JSON.stringify(logs, null, 2);
    } catch (err) {
      console.error('Erreur lors de l\'export des logs:', err);
      throw err;
    }
  }

  // Convertir en CSV
  convertToCSV(logs) {
    if (logs.length === 0) return '';
    
    const headers = ['id', 'level', 'message', 'category', 'user_id', 'ip_address', 'user_agent', 'created_at'];
    const csvRows = [headers.join(',')];
    
    logs.forEach(log => {
      const row = headers.map(header => {
        let value = log[header] || '';
        if (typeof value === 'string' && value.includes(',')) {
          value = `"${value.replace(/"/g, '""')}"`;
        }
        return value;
      });
      csvRows.push(row.join(','));
    });
    
    return csvRows.join('\n');
  }

  // Obtenir les catégories disponibles
  async getCategories() {
    try {
      const result = await this.db.query(
        'SELECT DISTINCT category FROM system_logs ORDER BY category'
      );
      return result.map(row => row.category);
    } catch (err) {
      console.error('Erreur lors de la récupération des catégories:', err);
      throw err;
    }
  }

  // Obtenir les niveaux disponibles
  getLevels() {
    return ['debug', 'info', 'warning', 'error'];
  }

  // Méthodes de convenance pour ajouter des logs
  async info(message, category = 'general', userId = null, ipAddress = null, metadata = null) {
    return this.addLog('info', message, category, userId, ipAddress, null, metadata);
  }

  async warning(message, category = 'general', userId = null, ipAddress = null, metadata = null) {
    return this.addLog('warning', message, category, userId, ipAddress, null, metadata);
  }

  async error(message, category = 'general', userId = null, ipAddress = null, metadata = null) {
    return this.addLog('error', message, category, userId, ipAddress, null, metadata);
  }

  async debug(message, category = 'general', userId = null, ipAddress = null, metadata = null) {
    return this.addLog('debug', message, category, userId, ipAddress, null, metadata);
  }

  // Fermer la connexion
  async close() {
    if (this.db && this.db.close) {
      await this.db.close();
    }
  }
}

module.exports = new SystemLogsService();