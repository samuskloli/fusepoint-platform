#!/usr/bin/env node

const fs = require('fs').promises;
const path = require('path');
const { exec } = require('child_process');
const util = require('util');
const archiver = require('archiver');
const crypto = require('crypto');
const cron = require('node-cron');
const execAsync = util.promisify(exec);

/**
 * Système de sauvegarde complet pour la plateforme Fusepoint
 * Gère les sauvegardes de base de données, fichiers de configuration et code source
 */
class ComprehensiveBackupSystem {
  constructor(options = {}) {
    this.projectRoot = options.projectRoot || path.resolve(__dirname, '..');
    this.backupDir = options.backupDir || path.join(this.projectRoot, 'backups', 'complete');
    this.dbPath = options.dbPath || path.join(this.projectRoot, 'server', 'database', 'fusepoint.db');
    this.configDir = options.configDir || path.join(this.projectRoot, 'server', 'config');
    this.maxBackups = options.maxBackups || 30;
    this.compressionLevel = options.compressionLevel || 6;
    
    // Planificateurs de tâches
    this.schedulers = {
      daily: null,
      weekly: null
    };
    
    this.initializeDirectories();
  }

  /**
   * Initialise les répertoires de sauvegarde
   */
  async initializeDirectories() {
    try {
      await fs.mkdir(this.backupDir, { recursive: true });
      await fs.mkdir(path.join(this.backupDir, 'database'), { recursive: true });
      await fs.mkdir(path.join(this.backupDir, 'config'), { recursive: true });
      await fs.mkdir(path.join(this.backupDir, 'source'), { recursive: true });
      await fs.mkdir(path.join(this.backupDir, 'full'), { recursive: true });
      console.log('✅ Répertoires de sauvegarde initialisés');
    } catch (error) {
      console.error('❌ Erreur lors de l\'initialisation des répertoires:', error.message);
      throw error;
    }
  }

  /**
   * Génère un ID unique pour la sauvegarde
   */
  generateBackupId() {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const randomSuffix = crypto.randomBytes(4).toString('hex');
    return `backup-${timestamp}-${randomSuffix}`;
  }

  /**
   * Crée une sauvegarde de la base de données
   */
  async backupDatabase(backupId) {
    try {
      const dbBackupPath = path.join(this.backupDir, 'database', `${backupId}.db`);
      
      // Vérifier que la base de données existe
      await fs.access(this.dbPath);
      
      // Copier la base de données
      await fs.copyFile(this.dbPath, dbBackupPath);
      
      // Créer un dump SQL pour plus de sécurité
      const sqlDumpPath = path.join(this.backupDir, 'database', `${backupId}.sql`);
      try {
        await execAsync(`sqlite3 "${this.dbPath}" ".dump" > "${sqlDumpPath}"`);
      } catch (sqlError) {
        console.warn('⚠️ Impossible de créer le dump SQL:', sqlError.message);
      }
      
      const stats = await fs.stat(dbBackupPath);
      console.log(`✅ Base de données sauvegardée: ${(stats.size / 1024 / 1024).toFixed(2)} MB`);
      
      return {
        path: dbBackupPath,
        size: stats.size,
        sqlDump: sqlDumpPath
      };
    } catch (error) {
      console.error('❌ Erreur lors de la sauvegarde de la base de données:', error.message);
      throw error;
    }
  }

  /**
   * Crée une sauvegarde des fichiers de configuration
   */
  async backupConfig(backupId) {
    try {
      const configBackupPath = path.join(this.backupDir, 'config', `${backupId}.tar.gz`);
      
      // Créer une archive des fichiers de configuration
      const output = require('fs').createWriteStream(configBackupPath);
      const archive = archiver('tar', {
        gzip: true,
        gzipOptions: { level: this.compressionLevel }
      });
      
      return new Promise((resolve, reject) => {
        output.on('close', () => {
          console.log(`✅ Configuration sauvegardée: ${(archive.pointer() / 1024 / 1024).toFixed(2)} MB`);
          resolve({
            path: configBackupPath,
            size: archive.pointer()
          });
        });
        
        archive.on('error', reject);
        archive.pipe(output);
        
        // Ajouter les fichiers de configuration
        const configFiles = [
          '.env',
          'server/.env',
          'server/config',
          'package.json',
          'server/package.json',
          'vite.config.js',
          'tailwind.config.js'
        ];
        
        configFiles.forEach(file => {
          const fullPath = path.join(this.projectRoot, file);
          try {
            if (require('fs').existsSync(fullPath)) {
              const stats = require('fs').statSync(fullPath);
              if (stats.isDirectory()) {
                archive.directory(fullPath, file);
              } else {
                archive.file(fullPath, { name: file });
              }
            }
          } catch (err) {
            console.warn(`⚠️ Impossible d'ajouter ${file}:`, err.message);
          }
        });
        
        archive.finalize();
      });
    } catch (error) {
      console.error('❌ Erreur lors de la sauvegarde de la configuration:', error.message);
      throw error;
    }
  }

  /**
   * Crée une sauvegarde du code source
   */
  async backupSource(backupId) {
    try {
      const sourceBackupPath = path.join(this.backupDir, 'source', `${backupId}.tar.gz`);
      
      const output = require('fs').createWriteStream(sourceBackupPath);
      const archive = archiver('tar', {
        gzip: true,
        gzipOptions: { level: this.compressionLevel }
      });
      
      return new Promise((resolve, reject) => {
        output.on('close', () => {
          console.log(`✅ Code source sauvegardé: ${(archive.pointer() / 1024 / 1024).toFixed(2)} MB`);
          resolve({
            path: sourceBackupPath,
            size: archive.pointer()
          });
        });
        
        archive.on('error', reject);
        archive.pipe(output);
        
        // Exclure certains répertoires
        const excludePatterns = [
          'node_modules/**',
          'dist/**',
          'backups/**',
          'logs/**',
          '.git/**',
          '*.log',
          'server/database/fusepoint.db*'
        ];
        
        // Ajouter le code source en excluant les patterns
        archive.glob('**/*', {
          cwd: this.projectRoot,
          ignore: excludePatterns,
          dot: true
        });
        
        archive.finalize();
      });
    } catch (error) {
      console.error('❌ Erreur lors de la sauvegarde du code source:', error.message);
      throw error;
    }
  }

  /**
   * Crée une sauvegarde complète
   */
  async createCompleteBackup(type = 'full') {
    const backupId = this.generateBackupId();
    const startTime = Date.now();
    
    console.log(`🚀 Début de la sauvegarde ${type}: ${backupId}`);
    
    try {
      const backupInfo = {
        id: backupId,
        type: type,
        timestamp: new Date().toISOString(),
        components: {}
      };
      
      // Sauvegarde de la base de données (toujours incluse)
      console.log('📊 Sauvegarde de la base de données...');
      backupInfo.components.database = await this.backupDatabase(backupId);
      
      if (type === 'full' || type === 'config') {
        // Sauvegarde de la configuration
        console.log('⚙️ Sauvegarde de la configuration...');
        backupInfo.components.config = await this.backupConfig(backupId);
      }
      
      if (type === 'full' || type === 'source') {
        // Sauvegarde du code source
        console.log('📁 Sauvegarde du code source...');
        backupInfo.components.source = await this.backupSource(backupId);
      }
      
      // Calculer la taille totale
      backupInfo.totalSize = Object.values(backupInfo.components)
        .reduce((total, component) => total + (component.size || 0), 0);
      
      // Sauvegarder les métadonnées
      const metadataPath = path.join(this.backupDir, 'full', `${backupId}.json`);
      await fs.writeFile(metadataPath, JSON.stringify(backupInfo, null, 2));
      
      const duration = Date.now() - startTime;
      console.log(`✅ Sauvegarde terminée en ${(duration / 1000).toFixed(2)}s`);
      console.log(`📦 Taille totale: ${(backupInfo.totalSize / 1024 / 1024).toFixed(2)} MB`);
      
      return backupInfo;
    } catch (error) {
      console.error('❌ Erreur lors de la sauvegarde complète:', error.message);
      throw error;
    }
  }

  /**
   * Liste toutes les sauvegardes disponibles
   */
  async listBackups() {
    try {
      const metadataDir = path.join(this.backupDir, 'full');
      const files = await fs.readdir(metadataDir);
      const backups = [];
      
      for (const file of files) {
        if (file.endsWith('.json')) {
          try {
            const content = await fs.readFile(path.join(metadataDir, file), 'utf8');
            const backup = JSON.parse(content);
            backups.push(backup);
          } catch (err) {
            console.warn(`⚠️ Impossible de lire ${file}:`, err.message);
          }
        }
      }
      
      return backups.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
    } catch (error) {
      console.error('❌ Erreur lors de la liste des sauvegardes:', error.message);
      return [];
    }
  }

  /**
   * Restaure une sauvegarde
   */
  async restoreBackup(backupId, components = ['database', 'config']) {
    console.log(`🔄 Restauration de la sauvegarde: ${backupId}`);
    
    try {
      const metadataPath = path.join(this.backupDir, 'full', `${backupId}.json`);
      const backupInfo = JSON.parse(await fs.readFile(metadataPath, 'utf8'));
      
      const results = {};
      
      if (components.includes('database') && backupInfo.components.database) {
        console.log('📊 Restauration de la base de données...');
        await fs.copyFile(backupInfo.components.database.path, this.dbPath);
        results.database = 'restored';
        console.log('✅ Base de données restaurée');
      }
      
      if (components.includes('config') && backupInfo.components.config) {
        console.log('⚙️ Restauration de la configuration...');
        // Extraire l'archive de configuration
        await execAsync(`tar -xzf "${backupInfo.components.config.path}" -C "${this.projectRoot}"`);
        results.config = 'restored';
        console.log('✅ Configuration restaurée');
      }
      
      if (components.includes('source') && backupInfo.components.source) {
        console.log('📁 Restauration du code source...');
        // Créer un répertoire temporaire pour l'extraction
        const tempDir = path.join(this.backupDir, 'temp_restore');
        await fs.mkdir(tempDir, { recursive: true });
        
        try {
          await execAsync(`tar -xzf "${backupInfo.components.source.path}" -C "${tempDir}"`);
          // Copier les fichiers (attention: ceci écrasera le code actuel)
          await execAsync(`cp -r "${tempDir}"/* "${this.projectRoot}"/`);
          results.source = 'restored';
          console.log('✅ Code source restauré');
        } finally {
          // Nettoyer le répertoire temporaire
          await execAsync(`rm -rf "${tempDir}"`);
        }
      }
      
      console.log('✅ Restauration terminée');
      return results;
    } catch (error) {
      console.error('❌ Erreur lors de la restauration:', error.message);
      throw error;
    }
  }

  /**
   * Supprime les anciennes sauvegardes
   */
  async cleanupOldBackups(daysToKeep = 30) {
    console.log(`🧹 Nettoyage des sauvegardes de plus de ${daysToKeep} jours...`);
    
    try {
      const backups = await this.listBackups();
      const cutoffDate = new Date(Date.now() - (daysToKeep * 24 * 60 * 60 * 1000));
      const toDelete = backups.filter(backup => new Date(backup.timestamp) < cutoffDate);
      
      let deletedCount = 0;
      let freedSpace = 0;
      
      for (const backup of toDelete) {
        try {
          // Supprimer les fichiers de sauvegarde
          for (const [componentName, component] of Object.entries(backup.components)) {
            if (component.path && require('fs').existsSync(component.path)) {
              await fs.unlink(component.path);
              freedSpace += component.size || 0;
            }
            if (component.sqlDump && require('fs').existsSync(component.sqlDump)) {
              await fs.unlink(component.sqlDump);
            }
          }
          
          // Supprimer le fichier de métadonnées
          const metadataPath = path.join(this.backupDir, 'full', `${backup.id}.json`);
          if (require('fs').existsSync(metadataPath)) {
            await fs.unlink(metadataPath);
          }
          
          deletedCount++;
        } catch (err) {
          console.warn(`⚠️ Impossible de supprimer la sauvegarde ${backup.id}:`, err.message);
        }
      }
      
      console.log(`✅ ${deletedCount} sauvegardes supprimées, ${(freedSpace / 1024 / 1024).toFixed(2)} MB libérés`);
      return { deletedCount, freedSpace };
    } catch (error) {
      console.error('❌ Erreur lors du nettoyage:', error.message);
      throw error;
    }
  }

  /**
   * Obtient les statistiques des sauvegardes
   */
  async getBackupStats() {
    try {
      const backups = await this.listBackups();
      const totalSize = backups.reduce((sum, backup) => sum + (backup.totalSize || 0), 0);
      
      const stats = {
        totalBackups: backups.length,
        totalSize: totalSize,
        totalSizeMB: (totalSize / 1024 / 1024).toFixed(2),
        oldestBackup: backups.length > 0 ? backups[backups.length - 1].timestamp : null,
        newestBackup: backups.length > 0 ? backups[0].timestamp : null,
        backupsByType: {}
      };
      
      // Compter par type
      backups.forEach(backup => {
        stats.backupsByType[backup.type] = (stats.backupsByType[backup.type] || 0) + 1;
      });
      
      return stats;
    } catch (error) {
      console.error('❌ Erreur lors du calcul des statistiques:', error.message);
      return null;
    }
  }

  /**
   * Démarre les sauvegardes automatiques
   */
  startAutoBackup() {
    console.log('⏰ Démarrage des sauvegardes automatiques...');
    
    // Sauvegarde quotidienne (base de données + configuration) à 2h du matin
    this.schedulers.daily = cron.schedule('0 2 * * *', async () => {
      console.log('🌙 Sauvegarde automatique quotidienne...');
      try {
        await this.createCompleteBackup('config');
        console.log('✅ Sauvegarde quotidienne terminée');
      } catch (error) {
        console.error('❌ Erreur lors de la sauvegarde quotidienne:', error.message);
      }
    }, {
      scheduled: false,
      timezone: 'Europe/Paris'
    });
    
    // Sauvegarde hebdomadaire complète le dimanche à 3h du matin
    this.schedulers.weekly = cron.schedule('0 3 * * 0', async () => {
      console.log('📅 Sauvegarde automatique hebdomadaire...');
      try {
        await this.createCompleteBackup('full');
        await this.cleanupOldBackups(30);
        console.log('✅ Sauvegarde hebdomadaire terminée');
      } catch (error) {
        console.error('❌ Erreur lors de la sauvegarde hebdomadaire:', error.message);
      }
    }, {
      scheduled: false,
      timezone: 'Europe/Paris'
    });
    
    // Démarrer les planificateurs
    this.schedulers.daily.start();
    this.schedulers.weekly.start();
    
    console.log('✅ Sauvegardes automatiques configurées:');
    console.log('  - Quotidienne (DB + Config): 2h00');
    console.log('  - Hebdomadaire (Complète): Dimanche 3h00');
  }

  /**
   * Arrête les sauvegardes automatiques
   */
  stopAutoBackup() {
    if (this.schedulers.daily) {
      this.schedulers.daily.stop();
      this.schedulers.daily = null;
    }
    if (this.schedulers.weekly) {
      this.schedulers.weekly.stop();
      this.schedulers.weekly = null;
    }
    console.log('⏹️ Sauvegardes automatiques arrêtées');
  }

  /**
   * Vérifie l'intégrité d'une sauvegarde
   */
  async verifyBackup(backupId) {
    try {
      const metadataPath = path.join(this.backupDir, 'full', `${backupId}.json`);
      const backupInfo = JSON.parse(await fs.readFile(metadataPath, 'utf8'));
      
      const results = {
        id: backupId,
        valid: true,
        components: {},
        errors: []
      };
      
      for (const [componentName, component] of Object.entries(backupInfo.components)) {
        try {
          await fs.access(component.path);
          const stats = await fs.stat(component.path);
          results.components[componentName] = {
            exists: true,
            size: stats.size,
            expectedSize: component.size,
            sizeMatch: stats.size === component.size
          };
          
          if (stats.size !== component.size) {
            results.valid = false;
            results.errors.push(`Taille incorrecte pour ${componentName}`);
          }
        } catch (error) {
          results.valid = false;
          results.components[componentName] = {
            exists: false,
            error: error.message
          };
          results.errors.push(`Fichier manquant: ${componentName}`);
        }
      }
      
      return results;
    } catch (error) {
      return {
        id: backupId,
        valid: false,
        errors: [`Erreur lors de la vérification: ${error.message}`]
      };
    }
  }

  /**
   * Génère un rapport de santé des sauvegardes
   */
  async generateHealthReport() {
    const backups = await this.listBackups();
    const stats = await this.getBackupStats();
    
    const report = {
      timestamp: new Date().toISOString(),
      stats: stats,
      recentBackups: backups.slice(0, 5),
      health: {
        hasRecentBackup: false,
        oldestBackupAge: null,
        issues: []
      }
    };
    
    if (backups.length > 0) {
      const newestBackup = new Date(backups[0].timestamp);
      const daysSinceLastBackup = (Date.now() - newestBackup.getTime()) / (1000 * 60 * 60 * 24);
      
      report.health.hasRecentBackup = daysSinceLastBackup <= 2;
      report.health.daysSinceLastBackup = daysSinceLastBackup;
      
      if (daysSinceLastBackup > 7) {
        report.health.issues.push('Aucune sauvegarde récente (> 7 jours)');
      }
      
      const oldestBackup = new Date(backups[backups.length - 1].timestamp);
      report.health.oldestBackupAge = (Date.now() - oldestBackup.getTime()) / (1000 * 60 * 60 * 24);
    } else {
      report.health.issues.push('Aucune sauvegarde disponible');
    }
    
    return report;
  }
}

// Interface en ligne de commande
if (require.main === module) {
  const args = process.argv.slice(2);
  const command = args[0];
  
  const backupSystem = new ComprehensiveBackupSystem();
  
  async function runCommand() {
    try {
      switch (command) {
        case 'create':
          const type = args.find(arg => arg.startsWith('--type='))?.split('=')[1] || 'full';
          await backupSystem.createCompleteBackup(type);
          break;
          
        case 'list':
          const backups = await backupSystem.listBackups();
          console.log('\n📋 Sauvegardes disponibles:');
          backups.forEach(backup => {
            console.log(`  ${backup.id} (${backup.type}) - ${backup.timestamp} - ${(backup.totalSize / 1024 / 1024).toFixed(2)} MB`);
          });
          break;
          
        case 'restore':
          const backupId = args[1];
          if (!backupId) {
            console.error('❌ ID de sauvegarde requis');
            process.exit(1);
          }
          const components = args.slice(2).length > 0 ? args.slice(2) : ['database', 'config'];
          await backupSystem.restoreBackup(backupId, components);
          break;
          
        case 'cleanup':
          const days = parseInt(args.find(arg => arg.startsWith('--days='))?.split('=')[1]) || 30;
          await backupSystem.cleanupOldBackups(days);
          break;
          
        case 'stats':
          const stats = await backupSystem.getBackupStats();
          console.log('\n📊 Statistiques des sauvegardes:');
          console.log(JSON.stringify(stats, null, 2));
          break;
          
        case 'verify':
          const verifyId = args[1];
          if (!verifyId) {
            console.error('❌ ID de sauvegarde requis');
            process.exit(1);
          }
          const verification = await backupSystem.verifyBackup(verifyId);
          console.log('\n🔍 Vérification de la sauvegarde:');
          console.log(JSON.stringify(verification, null, 2));
          break;
          
        case 'health':
          const health = await backupSystem.generateHealthReport();
          console.log('\n🏥 Rapport de santé:');
          console.log(JSON.stringify(health, null, 2));
          break;
          
        case 'auto-start':
          backupSystem.startAutoBackup();
          console.log('✅ Sauvegardes automatiques démarrées. Appuyez sur Ctrl+C pour arrêter.');
          
          // Gérer l'arrêt propre
          process.on('SIGINT', () => {
            console.log('\n🛑 Arrêt des sauvegardes automatiques...');
            backupSystem.stopAutoBackup();
            process.exit(0);
          });
          
          // Garder le processus en vie
          setInterval(() => {}, 1000);
          break;
          
        default:
          console.log(`
🔧 Système de sauvegarde complet Fusepoint

Commandes disponibles:
  create [--type=full|config|database]  Créer une sauvegarde
  list                                  Lister les sauvegardes
  restore <id> [components...]          Restaurer une sauvegarde
  cleanup [--days=30]                   Nettoyer les anciennes sauvegardes
  stats                                 Afficher les statistiques
  verify <id>                           Vérifier l'intégrité
  health                                Rapport de santé
  auto-start                            Démarrer les sauvegardes automatiques

Exemples:
  node backup-system.cjs create --type=full
  node backup-system.cjs restore backup-2024-01-01T10-00-00-000Z-abc123
  node backup-system.cjs cleanup --days=15`);
      }
    } catch (error) {
      console.error('❌ Erreur:', error.message);
      process.exit(1);
    }
  }
  
  runCommand();
}

// Exporter la classe pour utilisation en tant que module
module.exports = ComprehensiveBackupSystem;