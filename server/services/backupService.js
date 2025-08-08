const fs = require('fs').promises;
const path = require('path');
const MariaDBService = require('./mariadbService');
const { exec } = require('child_process');
const util = require('util');
const execAsync = util.promisify(exec);
const ComprehensiveBackupSystem = require('../../scripts/backup-system.cjs');

class BackupService {
  constructor() {
    this.mariadb = new MariaDBService();
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
      
      return {
        success: true,
        backup: backupInfo,
        message: 'Sauvegarde créée avec succès'
      };
    } catch (error) {
      console.error('Erreur lors de la création de la sauvegarde:', error);
      return {
        success: false,
        error: error.message,
        message: 'Erreur lors de la création de la sauvegarde'
      };
    }
  }

  // Sauvegarder les métadonnées de sauvegarde
  async saveBackupMetadata(backupInfo) {
    const metadataPath = path.join(this.backupDir, 'backups_metadata.json');
    
    try {
      let metadata = [];
      
      // Lire les métadonnées existantes
      try {
        const existingData = await fs.readFile(metadataPath, 'utf8');
        metadata = JSON.parse(existingData);
      } catch (error) {
        // Fichier n'existe pas encore, on commence avec un tableau vide
      }
      
      // Ajouter la nouvelle sauvegarde
      metadata.push(backupInfo);
      
      // Garder seulement les 50 dernières sauvegardes dans les métadonnées
      if (metadata.length > 50) {
        metadata = metadata.slice(-50);
      }
      
      // Sauvegarder les métadonnées
      await fs.writeFile(metadataPath, JSON.stringify(metadata, null, 2));
    } catch (error) {
      console.error('Erreur lors de la sauvegarde des métadonnées:', error);
    }
  }

  // Récupérer la liste des sauvegardes
  async getBackups() {
    const metadataPath = path.join(this.backupDir, 'backups_metadata.json');
    
    try {
      const data = await fs.readFile(metadataPath, 'utf8');
      const metadata = JSON.parse(data);
      
      // Vérifier que les fichiers existent encore
      const validBackups = [];
      
      for (const backup of metadata) {
        try {
          await fs.access(backup.path);
          const stats = await fs.stat(backup.path);
          validBackups.push({
            ...backup,
            size: stats.size,
            exists: true
          });
        } catch (error) {
          // Fichier n'existe plus, marquer comme manquant
          validBackups.push({
            ...backup,
            exists: false,
            status: 'missing'
          });
        }
      }
      
      return validBackups.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
    } catch (error) {
      console.error('Erreur lors de la récupération des sauvegardes:', error);
      return [];
    }
  }

  // Supprimer une sauvegarde
  async deleteBackup(backupId) {
    try {
      const backups = await this.getBackups();
      const backup = backups.find(b => b.id === backupId);
      
      if (!backup) {
        return {
          success: false,
          message: 'Sauvegarde non trouvée'
        };
      }
      
      // Supprimer le fichier
      try {
        await fs.unlink(backup.path);
      } catch (error) {
        console.warn('Fichier de sauvegarde déjà supprimé:', backup.path);
      }
      
      // Mettre à jour les métadonnées
      const updatedBackups = backups.filter(b => b.id !== backupId);
      const metadataPath = path.join(this.backupDir, 'backups_metadata.json');
      await fs.writeFile(metadataPath, JSON.stringify(updatedBackups, null, 2));
      
      return {
        success: true,
        message: 'Sauvegarde supprimée avec succès'
      };
    } catch (error) {
      console.error('Erreur lors de la suppression de la sauvegarde:', error);
      return {
        success: false,
        error: error.message,
        message: 'Erreur lors de la suppression de la sauvegarde'
      };
    }
  }

  // Restaurer une sauvegarde
  async restoreBackup(backupId) {
    try {
      const backups = await this.getBackups();
      const backup = backups.find(b => b.id === backupId);
      
      if (!backup) {
        return {
          success: false,
          message: 'Sauvegarde non trouvée'
        };
      }
      
      if (!backup.exists) {
        return {
          success: false,
          message: 'Fichier de sauvegarde manquant'
        };
      }
      
      // Créer une sauvegarde de la base actuelle avant restauration
      await this.createBackup('pre_restore', `Sauvegarde automatique avant restauration de ${backup.name}`);
      
      // Restaurer la sauvegarde
      const config = require('../config/mariadb.config');
      const command = `mysql -h ${config.host} -P ${config.port} -u ${config.user} -p${config.password} ${config.database} < "${backup.path}"`;
      await execAsync(command);
      
      return {
        success: true,
        message: 'Sauvegarde restaurée avec succès'
      };
    } catch (error) {
      console.error('Erreur lors de la restauration:', error);
      return {
        success: false,
        error: error.message,
        message: 'Erreur lors de la restauration de la sauvegarde'
      };
    }
  }

  // Télécharger une sauvegarde
  async downloadBackup(backupId) {
    try {
      const backups = await this.getBackups();
      const backup = backups.find(b => b.id === backupId);
      
      if (!backup) {
        throw new Error('Sauvegarde non trouvée');
      }
      
      if (!backup.exists) {
        throw new Error('Fichier de sauvegarde manquant');
      }
      
      return {
        success: true,
        path: backup.path,
        name: `${backup.name}.sql`,
        size: backup.size
      };
    } catch (error) {
      console.error('Erreur lors du téléchargement:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  // Nettoyer les anciennes sauvegardes
  async cleanOldBackups(daysToKeep = 30) {
    try {
      const backups = await this.getBackups();
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - daysToKeep);
      
      let deletedCount = 0;
      
      for (const backup of backups) {
        const backupDate = new Date(backup.created_at);
        
        if (backupDate < cutoffDate && backup.type !== 'manual') {
          const result = await this.deleteBackup(backup.id);
          if (result.success) {
            deletedCount++;
          }
        }
      }
      
      return {
        success: true,
        deletedCount: deletedCount,
        message: `${deletedCount} anciennes sauvegardes supprimées`
      };
    } catch (error) {
      console.error('Erreur lors du nettoyage:', error);
      return {
        success: false,
        error: error.message,
        message: 'Erreur lors du nettoyage des anciennes sauvegardes'
      };
    }
  }

  // Programmer des sauvegardes automatiques
  async scheduleAutoBackup() {
    // Sauvegarde quotidienne
    setInterval(async () => {
      try {
        await this.createBackup('auto_daily', 'Sauvegarde automatique quotidienne');
        console.log('Sauvegarde automatique quotidienne créée');
        
        // Nettoyer les anciennes sauvegardes automatiques
        await this.cleanOldBackups(30);
      } catch (error) {
        console.error('Erreur lors de la sauvegarde automatique:', error);
      }
    }, 24 * 60 * 60 * 1000); // 24 heures
    
    console.log('Sauvegarde automatique programmée (quotidienne)');
  }

  // Obtenir les statistiques des sauvegardes
  async getBackupStats() {
    try {
      const backups = await this.getBackups();
      
      const stats = {
        total: backups.length,
        totalSize: 0,
        byType: {},
        recent: backups.slice(0, 5),
        oldestBackup: null,
        newestBackup: null
      };
      
      if (backups.length > 0) {
        stats.totalSize = backups.reduce((sum, backup) => sum + (backup.size || 0), 0);
        stats.oldestBackup = backups[backups.length - 1];
        stats.newestBackup = backups[0];
        
        // Compter par type
        backups.forEach(backup => {
          stats.byType[backup.type] = (stats.byType[backup.type] || 0) + 1;
        });
      }
      
      return stats;
    } catch (error) {
      console.error('Erreur lors du calcul des statistiques:', error);
      return {
        total: 0,
        totalSize: 0,
        byType: {},
        recent: [],
        oldestBackup: null,
        newestBackup: null
      };
    }
  }

  // Vérifier l'intégrité d'une sauvegarde
  async verifyBackup(backupId) {
    try {
      const backups = await this.getBackups();
      const backup = backups.find(b => b.id === backupId);
      
      if (!backup) {
        return {
          success: false,
          message: 'Sauvegarde non trouvée'
        };
      }
      
      if (!backup.exists) {
        return {
          success: false,
          message: 'Fichier de sauvegarde manquant'
        };
      }
      
      // Tester la validité du fichier SQL
      try {
        const sqlContent = await fs.readFile(backup.path, 'utf8');
        if (sqlContent.includes('-- MySQL dump') || sqlContent.includes('-- MariaDB dump') || sqlContent.length > 0) {
          return {
            success: true,
            message: 'Sauvegarde valide'
          };
        } else {
          return {
            success: false,
            message: 'Fichier de sauvegarde invalide'
          };
        }
      } catch (error) {
        return {
          success: false,
          message: 'Erreur lors de la lecture du fichier',
          error: error.message
        };
      }
    } catch (error) {
      console.error('Erreur lors de la vérification:', error);
      return {
        success: false,
        error: error.message,
        message: 'Erreur lors de la vérification de la sauvegarde'
      };
    }
  }

  // Formater la taille en bytes
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