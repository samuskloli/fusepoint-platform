const MariaDBService = require('./mariadbService');

class SystemLogsService {
  constructor() {
    this.mariadb = new MariaDBService();
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
      await this.mariadb.run(createTableQuery);
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
        metadata: JSON.stringify({ version: '1.0.0' })
      },
      {
        level: 'info',
        message: 'Utilisateur connecté',
        category: 'auth',
        user_id: 1,
        ip_address: '127.0.0.1',
        metadata: JSON.stringify({ loginMethod: 'email' })
      },
      {
        level: 'warning',
        message: 'Tentative de connexion avec mot de passe incorrect',
        category: 'security',
        ip_address: '192.168.1.100',
        metadata: JSON.stringify({ attempts: 3 })
      },
      {
        level: 'error',
        message: 'Erreur de connexion à la base de données',
        category: 'database',
        metadata: JSON.stringify({ error: 'Connection timeout' })
      },
      {
        level: 'info',
        message: 'Sauvegarde automatique effectuée',
        category: 'backup',
        metadata: JSON.stringify({ size: '2.5MB', duration: '15s' })
      }
    ];

    for (const log of sampleLogs) {
      try {
        await this.mariadb.run(
          `INSERT IGNORE INTO system_logs (level, message, category, user_id, ip_address, metadata) 
           VALUES (?, ?, ?, ?, ?, ?)`,
          [log.level, log.message, log.category, log.user_id || null, log.ip_address || null, log.metadata]
        );
      } catch (err) {
        console.error(`Erreur lors de l'insertion du log:`, err);
      }
    }
  }

  // Récupérer tous les logs avec filtres
  async getLogs(filters = {}) {
    try {
      let query = 'SELECT * FROM system_logs WHERE 1=1';
      const params = [];

      // Filtres
      if (filters.level) {
        query += ' AND level = ?';
        params.push(filters.level);
      }

      if (filters.category) {
        query += ' AND category = ?';
        params.push(filters.category);
      }

      if (filters.search) {
        query += ' AND message LIKE ?';
        params.push(`%${filters.search}%`);
      }

      if (filters.startDate) {
        query += ' AND created_at >= ?';
        params.push(filters.startDate);
      }

      if (filters.endDate) {
        query += ' AND created_at <= ?';
        params.push(filters.endDate);
      }

      // Tri
      const sortBy = filters.sortBy || 'created_at';
      const sortOrder = filters.sortOrder || 'DESC';
      query += ` ORDER BY ${sortBy} ${sortOrder}`;

      // Pagination
      const limit = filters.limit || 50;
      const offset = filters.offset || 0;
      query += ' LIMIT ? OFFSET ?';
      params.push(limit, offset);

      const rows = await this.mariadb.all(query, params);
      const logs = rows.map(log => ({
        ...log,
        metadata: log.metadata ? JSON.parse(log.metadata) : null
      }));
      return logs;
    } catch (err) {
      throw err;
    }
  }

  // Compter le nombre total de logs
  async getLogsCount(filters = {}) {
    try {
      let query = 'SELECT COUNT(*) as total FROM system_logs WHERE 1=1';
      const params = [];

      // Appliquer les mêmes filtres que getLogs
      if (filters.level) {
        query += ' AND level = ?';
        params.push(filters.level);
      }

      if (filters.category) {
        query += ' AND category = ?';
        params.push(filters.category);
      }

      if (filters.search) {
        query += ' AND message LIKE ?';
        params.push(`%${filters.search}%`);
      }

      if (filters.startDate) {
        query += ' AND created_at >= ?';
        params.push(filters.startDate);
      }

      if (filters.endDate) {
        query += ' AND created_at <= ?';
        params.push(filters.endDate);
      }

      const row = await this.mariadb.get(query, params);
      return row.total;
    } catch (err) {
      throw err;
    }
  }

  // Obtenir les statistiques des logs
  async getLogsStats() {
    try {
      const queries = [
        'SELECT COUNT(*) as total FROM system_logs',
        'SELECT COUNT(*) as errors FROM system_logs WHERE level = "error"',
        'SELECT COUNT(*) as warnings FROM system_logs WHERE level = "warning"',
        'SELECT COUNT(*) as info FROM system_logs WHERE level = "info"',
        'SELECT COUNT(*) as today FROM system_logs WHERE DATE(created_at) = CURDATE()',
        'SELECT level, COUNT(*) as count FROM system_logs GROUP BY level',
        'SELECT category, COUNT(*) as count FROM system_logs GROUP BY category ORDER BY count DESC LIMIT 5'
      ];

      const results = await Promise.all(queries.map(query => this.mariadb.all(query, [])));
      
      const stats = {
        total: results[0][0].total,
        errors: results[1][0].errors,
        warnings: results[2][0].warnings,
        info: results[3][0].info,
        today: results[4][0].today,
        byLevel: results[5],
        byCategory: results[6]
      };
      return stats;
    } catch (err) {
      throw err;
    }
  }

  // Ajouter un nouveau log
  async addLog(level, message, category = 'general', userId = null, ipAddress = null, userAgent = null, metadata = null) {
    try {
      const metadataStr = metadata ? JSON.stringify(metadata) : null;
      
      const result = await this.mariadb.run(
        `INSERT INTO system_logs (level, message, category, user_id, ip_address, user_agent, metadata) 
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [level, message, category, userId, ipAddress, userAgent, metadataStr]
      );
      return { id: result.insertId };
    } catch (err) {
      // Log vers la console si MariaDB n'est pas disponible
      console.log(`[${level.toUpperCase()}] ${category}: ${message}`);
      if (metadata) {
        console.log('Metadata:', metadata);
      }
      return null;
    }
  }

  // Supprimer les anciens logs
  async cleanOldLogs(daysToKeep = 30) {
    try {
      const result = await this.mariadb.run(
        'DELETE FROM system_logs WHERE created_at < DATE_SUB(NOW(), INTERVAL ? DAY)',
        [daysToKeep]
      );
      return { deletedCount: result.affectedRows };
    } catch (err) {
      throw err;
    }
  }

  // Exporter les logs
  async exportLogs(filters = {}, format = 'json') {
    try {
      const logs = await this.getLogs({ ...filters, limit: 10000, offset: 0 });
      
      if (format === 'csv') {
        return this.convertToCSV(logs);
      } else {
        return JSON.stringify(logs, null, 2);
      }
    } catch (error) {
      throw new Error(`Erreur lors de l'export des logs: ${error.message}`);
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
        // Échapper les guillemets et virgules
        if (typeof value === 'string' && (value.includes(',') || value.includes('"'))) {
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
      const rows = await this.mariadb.all(
        'SELECT DISTINCT category FROM system_logs ORDER BY category',
        []
      );
      return rows.map(row => row.category);
    } catch (err) {
      throw err;
    }
  }

  // Obtenir les niveaux disponibles
  getLevels() {
    return ['info', 'warning', 'error', 'debug'];
  }

  // Méthodes de logging pratiques
  async info(message, category = 'general', userId = null, ipAddress = null, metadata = null) {
    try {
      return await this.addLog('info', message, category, userId, ipAddress, null, metadata);
    } catch (error) {
      console.log(`[LOG INFO] ${category}: ${message}`);
      return null;
    }
  }

  async warning(message, category = 'general', userId = null, ipAddress = null, metadata = null) {
    try {
      return await this.addLog('warning', message, category, userId, ipAddress, null, metadata);
    } catch (error) {
      console.warn(`[LOG WARNING] ${category}: ${message}`);
      return null;
    }
  }

  async error(message, category = 'general', userId = null, ipAddress = null, metadata = null) {
    try {
      return await this.addLog('error', message, category, userId, ipAddress, null, metadata);
    } catch (error) {
      console.error(`[LOG ERROR] ${category}: ${message}`);
      return null;
    }
  }

  async debug(message, category = 'general', userId = null, ipAddress = null, metadata = null) {
    try {
      return await this.addLog('debug', message, category, userId, ipAddress, null, metadata);
    } catch (error) {
      console.log(`[LOG DEBUG] ${category}: ${message}`);
      return null;
    }
  }

  // Fermer la connexion
  async close() {
    try {
      await this.mariadb.close();
      console.log('Connexion à la base de données fermée.');
    } catch (err) {
      console.error('Erreur lors de la fermeture de la base de données:', err);
    }
  }
}

module.exports = new SystemLogsService();