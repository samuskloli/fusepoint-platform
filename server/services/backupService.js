const fs = require('fs').promises;
const path = require('path');
const databaseService = require('./databaseService');
const { exec } = require('child_process');
const util = require('util');
const execAsync = util.promisify(exec);
const ComprehensiveBackupSystem = require('../../scripts/backup-system.cjs');

class BackupService {
  constructor() {
    this.db = databaseService;
    this.backupDir = path.join(__dirname, '../backups');
    this.ensureBackupDirectory();
    
    // Initialiser le système de sauvegarde complet
    this.comprehensiveBackup = new ComprehensiveBackupSystem();
  }

  // S'assurer que le répertoire de sauvegarde existe
  async ensureBackupDirectory() {
    try {
      await fs.access(this.backupDir);
    } catch (error) {
      await fs.mkdir(this.backupDir, { recursive: true });
      console.log('Répertoire de sauvegarde créé:', this.backupDir);
    }
  }

  // Créer une sauvegarde complète
  async createBackup(type = 'manual', description = '') {
    try {
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const backupName = `backup_${type}_${timestamp}`;
      const backupPath = path.join(this.backupDir, `${backupName}.sql`);
      
      // Pour MariaDB, nous utilisons mysqldump
      const config = require('../config/mariadb.config');
      const command = `mysqldump -h ${config.host} -P ${config.port} -u ${config.user} -p${config.password} ${config.database}`;
      const { stdout } = await execAsync(command);
      
      await fs.writeFile(backupPath, stdout);
      
      // Obtenir les statistiques du fichier
      const stats = await fs.stat(backupPath);
      
      // Enregistrer les métadonnées de la sauvegarde
      const backupInfo = {
        id: Date.now().toString(),
        name: backupName,
        type: type,
        description: description,
        path: backupPath,
        size: stats.size,
        created_at: new Date().toISOString(),
        status: 'completed'
      };
      
      await this.saveBackupMetadata(backupInfo);
      
      console.log(`Sauvegarde créée: ${backupName} (${this.formatBytes(stats.size)})`);
      return backupInfo;
    } catch (error) {
      console.error('Erreur lors de la création de la sauvegarde:', error);
      throw error;
    }
  }

  // Sauvegarder les métadonnées de la sauvegarde
  async saveBackupMetadata(backupInfo) {
    try {
      // Créer la table si elle n'existe pas
      await this.db.run(`
        CREATE TABLE IF NOT EXISTS backups (
          id VARCHAR(255) PRIMARY KEY,
          name VARCHAR(255) NOT NULL,
          type VARCHAR(50) NOT NULL,
          description TEXT,
          path VARCHAR(500) NOT NULL,
          size BIGINT NOT NULL,
          created_at DATETIME NOT NULL,
          status VARCHAR(50) NOT NULL
        )
      `);
      
      // Insérer les métadonnées
      await this.db.run(`
        INSERT INTO backups (id, name, type, description, path, size, created_at, status)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      `, [
        backupInfo.id,
        backupInfo.name,
        backupInfo.type,
        backupInfo.description,
        backupInfo.path,
        backupInfo.size,
        backupInfo.created_at,
        backupInfo.status
      ]);
    } catch (error) {
      console.error('Erreur lors de la sauvegarde des métadonnées:', error);
      throw error;
    }
  }

  // Récupérer la liste des sauvegardes
  async getBackups() {
    try {
      const backups = await this.db.query(`
        SELECT * FROM backups 
        ORDER BY created_at DESC
      `);
      
      // Vérifier que les fichiers existent toujours
      const validBackups = [];
      for (const backup of backups) {
        try {
          await fs.access(backup.path);
          validBackups.push(backup);
        } catch (error) {
          // Le fichier n'existe plus, supprimer l'entrée de la base
          await this.db.run('DELETE FROM backups WHERE id = ?', [backup.id]);
          console.log(`Sauvegarde orpheline supprimée: ${backup.name}`);
        }
      }
      
      return validBackups;
    } catch (error) {
      console.error('Erreur lors de la récupération des sauvegardes:', error);
      return [];
    }
  }

  // Supprimer une sauvegarde
  async deleteBackup(backupId) {
    try {
      // Récupérer les informations de la sauvegarde
      const backup = await this.db.get('SELECT * FROM backups WHERE id = ?', [backupId]);
      
      if (!backup) {
        throw new Error('Sauvegarde non trouvée');
      }
      
      // Supprimer le fichier
      try {
        await fs.unlink(backup.path);
      } catch (error) {
        console.log('Fichier de sauvegarde déjà supprimé:', backup.path);
      }
      
      // Supprimer l'entrée de la base
      await this.db.run('DELETE FROM backups WHERE id = ?', [backupId]);
      
      console.log(`Sauvegarde supprimée: ${backup.name}`);
      return { success: true };
    } catch (error) {
      console.error('Erreur lors de la suppression de la sauvegarde:', error);
      throw error;
    }
  }

  // Restaurer une sauvegarde
  async restoreBackup(backupId) {
    try {
      // Récupérer les informations de la sauvegarde
      const backup = await this.db.get('SELECT * FROM backups WHERE id = ?', [backupId]);
      
      if (!backup) {
        throw new Error('Sauvegarde non trouvée');
      }
      
      // Vérifier que le fichier existe
      await fs.access(backup.path);
      
      // Lire le contenu du fichier SQL
      const sqlContent = await fs.readFile(backup.path, 'utf8');
      
      // Exécuter la restauration
      const config = require('../config/mariadb.config');
      const command = `mysql -h ${config.host} -P ${config.port} -u ${config.user} -p${config.password} ${config.database}`;
      
      await execAsync(command, { input: sqlContent });
      
      console.log(`Sauvegarde restaurée: ${backup.name}`);
      return { success: true };
    } catch (error) {
      console.error('Erreur lors de la restauration:', error);
      throw error;
    }
  }

  // Télécharger une sauvegarde
  async downloadBackup(backupId) {
    try {
      const backup = await this.db.get('SELECT * FROM backups WHERE id = ?', [backupId]);
      
      if (!backup) {
        throw new Error('Sauvegarde non trouvée');
      }
      
      // Vérifier que le fichier existe
      await fs.access(backup.path);
      
      return {
        path: backup.path,
        name: backup.name,
        size: backup.size
      };
    } catch (error) {
      console.error('Erreur lors du téléchargement:', error);
      throw error;
    }
  }

  // Nettoyer les anciennes sauvegardes
  async cleanOldBackups(daysToKeep = 30) {
    try {
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - daysToKeep);
      
      const oldBackups = await this.db.query(`
        SELECT * FROM backups 
        WHERE created_at < ? AND type = 'auto'
      `, [cutoffDate.toISOString()]);
      
      let deletedCount = 0;
      let freedSpace = 0;
      
      for (const backup of oldBackups) {
        try {
          await fs.unlink(backup.path);
          freedSpace += backup.size;
        } catch (error) {
          console.log('Fichier déjà supprimé:', backup.path);
        }
        
        await this.db.run('DELETE FROM backups WHERE id = ?', [backup.id]);
        deletedCount++;
      }
      
      console.log(`Nettoyage terminé: ${deletedCount} sauvegardes supprimées, ${this.formatBytes(freedSpace)} libérés`);
      return { deletedCount, freedSpace };
    } catch (error) {
      console.error('Erreur lors du nettoyage:', error);
      throw error;
    }
  }

  // Programmer une sauvegarde automatique
  async scheduleAutoBackup() {
    try {
      // Créer une sauvegarde automatique
      const backup = await this.createBackup('auto', 'Sauvegarde automatique programmée');
      
      // Nettoyer les anciennes sauvegardes automatiques
      await this.cleanOldBackups(30);
      
      return backup;
    } catch (error) {
      console.error('Erreur lors de la sauvegarde automatique:', error);
      throw error;
    }
  }

  // Obtenir les statistiques des sauvegardes
  async getBackupStats() {
    try {
      const stats = await this.db.query(`
        SELECT 
          COUNT(*) as total_backups,
          SUM(size) as total_size,
          AVG(size) as avg_size,
          MIN(created_at) as oldest_backup,
          MAX(created_at) as newest_backup,
          type,
          COUNT(*) as count_by_type
        FROM backups 
        GROUP BY type
      `);
      
      const totalStats = await this.db.get(`
        SELECT 
          COUNT(*) as total_backups,
          SUM(size) as total_size,
          AVG(size) as avg_size
        FROM backups
      `);
      
      return {
        total: totalStats,
        byType: stats
      };
    } catch (error) {
      console.error('Erreur lors de la récupération des statistiques:', error);
      return { total: {}, byType: [] };
    }
  }

  // Vérifier l'intégrité d'une sauvegarde
  async verifyBackup(backupId) {
    try {
      const backup = await this.db.get('SELECT * FROM backups WHERE id = ?', [backupId]);
      
      if (!backup) {
        return { valid: false, error: 'Sauvegarde non trouvée' };
      }
      
      // Vérifier que le fichier existe
      try {
        const stats = await fs.stat(backup.path);
        
        // Vérifier la taille
        if (stats.size !== backup.size) {
          return { 
            valid: false, 
            error: 'Taille du fichier incorrecte',
            expected: backup.size,
            actual: stats.size
          };
        }
        
        // Vérifier le contenu SQL basique
        const content = await fs.readFile(backup.path, 'utf8');
        if (!content.includes('CREATE TABLE') && !content.includes('INSERT INTO')) {
          return { 
            valid: false, 
            error: 'Contenu SQL invalide'
          };
        }
        
        return { 
          valid: true, 
          size: stats.size,
          lastModified: stats.mtime
        };
      } catch (error) {
        return { 
          valid: false, 
          error: 'Fichier inaccessible: ' + error.message
        };
      }
    } catch (error) {
      console.error('Erreur lors de la vérification:', error);
      return { valid: false, error: error.message };
    }
  }

  // Formater les octets en format lisible
  formatBytes(bytes) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  // === NOUVELLES MÉTHODES POUR LE SYSTÈME COMPLET ===

  /**
   * Créer une sauvegarde complète du système
   */
  async createFullSystemBackup(options = {}) {
    try {
      await this.comprehensiveBackup.initialize();
      return await this.comprehensiveBackup.createFullBackup(options);
    } catch (error) {
      console.error('Erreur lors de la sauvegarde complète:', error);
      return {
        success: false,
        error: error.message,
        message: 'Erreur lors de la création de la sauvegarde complète'
      };
    }
  }

  /**
   * Lister toutes les sauvegardes système
   */
  async getSystemBackups() {
    try {
      await this.comprehensiveBackup.initialize();
      return await this.comprehensiveBackup.listSystemBackups();
    } catch (error) {
      console.error('Erreur lors de la récupération des sauvegardes système:', error);
      return [];
    }
  }

  /**
   * Restaurer une sauvegarde système complète
   */
  async restoreSystemBackup(backupId, options = {}) {
    try {
      await this.comprehensiveBackup.initialize();
      return await this.comprehensiveBackup.restoreSystemBackup(backupId, options);
    } catch (error) {
      console.error('Erreur lors de la restauration système:', error);
      return {
        success: false,
        error: error.message,
        message: 'Erreur lors de la restauration de la sauvegarde système'
      };
    }
  }

  /**
   * Obtenir les statistiques complètes des sauvegardes
   */
  async getComprehensiveStats() {
    try {
      await this.comprehensiveBackup.initialize();
      const systemStats = await this.comprehensiveBackup.getBackupStats();
      const dbStats = await this.getBackupStats();
      
      return {
        system: systemStats,
        database: dbStats,
        combined: {
          totalBackups: systemStats.total + dbStats.total,
          totalSize: systemStats.totalSize + dbStats.totalSize,
          healthStatus: this.getCombinedHealthStatus(systemStats.healthStatus, dbStats.healthStatus || 'healthy')
        }
      };
    } catch (error) {
      console.error('Erreur lors du calcul des statistiques complètes:', error);
      return {
        system: { total: 0, totalSize: 0, healthStatus: 'error' },
        database: { total: 0, totalSize: 0, healthStatus: 'error' },
        combined: { totalBackups: 0, totalSize: 0, healthStatus: 'error' }
      };
    }
  }

  /**
   * Nettoyer toutes les anciennes sauvegardes
   */
  async cleanAllOldBackups(daysToKeep = 30) {
    try {
      await this.comprehensiveBackup.initialize();
      
      // Nettoyer les sauvegardes système
      const systemResult = await this.comprehensiveBackup.cleanOldBackups(daysToKeep);
      
      // Nettoyer les sauvegardes de base de données
      const dbResult = await this.cleanOldBackups(daysToKeep);
      
      return {
        success: true,
        system: systemResult,
        database: dbResult,
        totalDeleted: (systemResult.deletedCount || 0) + (dbResult.deletedCount || 0)
      };
    } catch (error) {
      console.error('Erreur lors du nettoyage complet:', error);
      return {
        success: false,
        error: error.message,
        message: 'Erreur lors du nettoyage des anciennes sauvegardes'
      };
    }
  }

  /**
   * Démarrer les sauvegardes automatiques complètes
   */
  async startComprehensiveAutoBackup() {
    try {
      await this.comprehensiveBackup.initialize();
      
      // Démarrer les sauvegardes automatiques du système complet
      this.comprehensiveBackup.scheduleAutoBackups();
      
      // Démarrer les sauvegardes automatiques de la base de données
      await this.scheduleAutoBackup();
      
      console.log('✅ Sauvegardes automatiques complètes démarrées');
      
      return {
        success: true,
        message: 'Sauvegardes automatiques démarrées avec succès'
      };
    } catch (error) {
      console.error('Erreur lors du démarrage des sauvegardes automatiques:', error);
      return {
        success: false,
        error: error.message,
        message: 'Erreur lors du démarrage des sauvegardes automatiques'
      };
    }
  }

  /**
   * Vérifier l'intégrité de toutes les sauvegardes
   */
  async verifyAllBackups() {
    try {
      const results = {
        database: [],
        system: [],
        summary: {
          total: 0,
          valid: 0,
          invalid: 0,
          missing: 0
        }
      };
      
      // Vérifier les sauvegardes de base de données
      const dbBackups = await this.getBackups();
      for (const backup of dbBackups) {
        const verification = await this.verifyBackup(backup.id);
        results.database.push({
          id: backup.id,
          name: backup.name,
          ...verification
        });
        
        results.summary.total++;
        if (verification.success) {
          results.summary.valid++;
        } else if (backup.exists === false) {
          results.summary.missing++;
        } else {
          results.summary.invalid++;
        }
      }
      
      // Vérifier les sauvegardes système
      await this.comprehensiveBackup.initialize();
      const systemBackups = await this.comprehensiveBackup.listSystemBackups();
      for (const backup of systemBackups) {
        const isValid = backup.exists && backup.hash;
        results.system.push({
          id: backup.id,
          name: backup.id,
          success: isValid,
          message: isValid ? 'Sauvegarde valide' : 'Sauvegarde invalide ou manquante'
        });
        
        results.summary.total++;
        if (isValid) {
          results.summary.valid++;
        } else if (!backup.exists) {
          results.summary.missing++;
        } else {
          results.summary.invalid++;
        }
      }
      
      return results;
    } catch (error) {
      console.error('Erreur lors de la vérification des sauvegardes:', error);
      return {
        database: [],
        system: [],
        summary: { total: 0, valid: 0, invalid: 0, missing: 0 },
        error: error.message
      };
    }
  }

  /**
   * Obtenir le statut de santé combiné
   */
  getCombinedHealthStatus(systemStatus, dbStatus) {
    const statusPriority = {
      'error': 4,
      'critical': 3,
      'warning': 2,
      'healthy': 1
    };
    
    const maxPriority = Math.max(
      statusPriority[systemStatus] || 1,
      statusPriority[dbStatus] || 1
    );
    
    return Object.keys(statusPriority).find(status => statusPriority[status] === maxPriority) || 'healthy';
  }

  /**
   * Créer un rapport de sauvegarde détaillé
   */
  async generateBackupReport() {
    try {
      const stats = await this.getComprehensiveStats();
      const verification = await this.verifyAllBackups();
      
      const report = {
        timestamp: new Date().toISOString(),
        statistics: stats,
        verification: verification,
        recommendations: []
      };
      
      // Générer des recommandations
      if (stats.combined.healthStatus === 'critical') {
        report.recommendations.push('🚨 Créer une sauvegarde immédiatement');
      }
      
      if (stats.combined.healthStatus === 'warning') {
        report.recommendations.push('⚠️ Planifier une sauvegarde dans les prochaines heures');
      }
      
      if (verification.summary.invalid > 0) {
        report.recommendations.push('🔧 Vérifier et réparer les sauvegardes corrompues');
      }
      
      if (verification.summary.missing > 0) {
        report.recommendations.push('📁 Nettoyer les métadonnées des sauvegardes manquantes');
      }
      
      const totalSizeGB = stats.combined.totalSize / (1024 * 1024 * 1024);
      if (totalSizeGB > 10) {
        report.recommendations.push('🧹 Considérer le nettoyage des anciennes sauvegardes');
      }
      
      if (report.recommendations.length === 0) {
        report.recommendations.push('✅ Système de sauvegarde en bon état');
      }
      
      return report;
    } catch (error) {
      console.error('Erreur lors de la génération du rapport:', error);
      return {
        timestamp: new Date().toISOString(),
        error: error.message,
        statistics: null,
        verification: null,
        recommendations: ['❌ Impossible de générer le rapport de sauvegarde']
      };
    }
  }
}

module.exports = new BackupService();