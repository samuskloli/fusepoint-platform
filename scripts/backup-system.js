#!/usr/bin/env node

import fs from 'fs/promises';
import path from 'path';
import { exec } from 'child_process';
import util from 'util';
import archiver from 'archiver';
import crypto from 'crypto';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const execAsync = util.promisify(exec);

/**
 * Système de sauvegarde et récupération complet pour la plateforme Fusepoint
 * Inclut la base de données, les fichiers de configuration, et le code source
 */
class ComprehensiveBackupSystem {
  constructor() {
    this.projectRoot = path.resolve(__dirname, '..');
    this.backupDir = path.join(this.projectRoot, 'backups');
    this.dbPath = path.join(this.projectRoot, 'server/database/fusepoint.db');
    this.configPaths = [
      path.join(this.projectRoot, '.env'),
      path.join(this.projectRoot, 'server/.env'),
      path.join(this.projectRoot, 'package.json'),
      path.join(this.projectRoot, 'server/package.json'),
      path.join(this.projectRoot, 'frontend/package.json')
    ];
    this.excludePatterns = [
      'node_modules',
      '.git',
      'dist',
      'build',
      'logs',
      'tmp',
      '*.log',
      '.DS_Store',
      'backups'
    ];
  }

  /**
   * Initialiser le système de sauvegarde
   */
  async initialize() {
    try {
      await this.ensureBackupDirectory();
      console.log('✅ Système de sauvegarde initialisé');
    } catch (error) {
      console.error('❌ Erreur lors de l\'initialisation:', error);
      throw error;
    }
  }

  /**
   * S'assurer que le répertoire de sauvegarde existe
   */
  async ensureBackupDirectory() {
    try {
      await fs.access(this.backupDir);
    } catch (error) {
      await fs.mkdir(this.backupDir, { recursive: true });
      console.log('📁 Répertoire de sauvegarde créé:', this.backupDir);
    }
  }

  /**
   * Créer une sauvegarde complète du système
   */
  async createFullBackup(options = {}) {
    const {
      includeDatabase = true,
      includeConfig = true,
      includeSource = false,
      description = 'Sauvegarde complète automatique'
    } = options;

    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const backupId = `full_backup_${timestamp}`;
    const backupPath = path.join(this.backupDir, `${backupId}.zip`);

    console.log('🚀 Début de la sauvegarde complète...');
    console.log('📅 Timestamp:', timestamp);
    console.log('🆔 ID de sauvegarde:', backupId);

    try {
      // Créer l'archive ZIP
      const output = require('fs').createWriteStream(backupPath);
      const archive = archiver('zip', {
        zlib: { level: 9 } // Compression maximale
      });

      archive.pipe(output);

      // Ajouter la base de données
      if (includeDatabase) {
        await this.addDatabaseToArchive(archive);
      }

      // Ajouter les fichiers de configuration
      if (includeConfig) {
        await this.addConfigToArchive(archive);
      }

      // Ajouter le code source
      if (includeSource) {
        await this.addSourceToArchive(archive);
      }

      // Ajouter les métadonnées de sauvegarde
      const metadata = await this.generateBackupMetadata({
        id: backupId,
        timestamp,
        description,
        includeDatabase,
        includeConfig,
        includeSource
      });

      archive.append(JSON.stringify(metadata, null, 2), { name: 'backup_metadata.json' });

      // Finaliser l'archive
      await archive.finalize();

      // Attendre que l'écriture soit terminée
      await new Promise((resolve, reject) => {
        output.on('close', resolve);
        output.on('error', reject);
      });

      // Calculer le hash de l'archive
      const hash = await this.calculateFileHash(backupPath);
      metadata.hash = hash;

      // Sauvegarder les métadonnées
      await this.saveBackupMetadata(metadata);

      const stats = await fs.stat(backupPath);
      
      console.log('✅ Sauvegarde complète créée avec succès!');
      console.log('📁 Fichier:', backupPath);
      console.log('📊 Taille:', this.formatBytes(stats.size));
      console.log('🔐 Hash:', hash);

      return {
        success: true,
        backupId,
        path: backupPath,
        size: stats.size,
        hash,
        metadata
      };

    } catch (error) {
      console.error('❌ Erreur lors de la sauvegarde:', error);
      
      // Nettoyer le fichier de sauvegarde en cas d'erreur
      try {
        await fs.unlink(backupPath);
      } catch (cleanupError) {
        console.warn('⚠️ Impossible de supprimer le fichier de sauvegarde incomplet:', cleanupError.message);
      }

      throw error;
    }
  }

  /**
   * Ajouter la base de données à l'archive
   */
  async addDatabaseToArchive(archive) {
    try {
      await fs.access(this.dbPath);
      archive.file(this.dbPath, { name: 'database/fusepoint.db' });
      console.log('📊 Base de données ajoutée à la sauvegarde');
    } catch (error) {
      console.warn('⚠️ Base de données non trouvée:', this.dbPath);
    }
  }

  /**
   * Ajouter les fichiers de configuration à l'archive
   */
  async addConfigToArchive(archive) {
    console.log('⚙️ Ajout des fichiers de configuration...');
    
    for (const configPath of this.configPaths) {
      try {
        await fs.access(configPath);
        const relativePath = path.relative(this.projectRoot, configPath);
        archive.file(configPath, { name: `config/${relativePath}` });
        console.log('✅ Config ajoutée:', relativePath);
      } catch (error) {
        console.log('⚠️ Config non trouvée:', configPath);
      }
    }
  }

  /**
   * Ajouter le code source à l'archive
   */
  async addSourceToArchive(archive) {
    console.log('📝 Ajout du code source...');
    
    // Ajouter les répertoires principaux
    const sourceDirs = ['server', 'frontend', 'src', 'scripts'];
    
    for (const dir of sourceDirs) {
      const dirPath = path.join(this.projectRoot, dir);
      try {
        await fs.access(dirPath);
        archive.directory(dirPath, `source/${dir}`, (entry) => {
          // Exclure certains patterns
          return !this.shouldExclude(entry.name);
        });
        console.log('✅ Répertoire ajouté:', dir);
      } catch (error) {
        console.log('⚠️ Répertoire non trouvé:', dir);
      }
    }

    // Ajouter les fichiers racine importants
    const rootFiles = [
      'package.json',
      'README.md',
      'admin-commands.sh',
      'start-all-servers.sh'
    ];

    for (const file of rootFiles) {
      const filePath = path.join(this.projectRoot, file);
      try {
        await fs.access(filePath);
        archive.file(filePath, { name: `source/${file}` });
        console.log('✅ Fichier ajouté:', file);
      } catch (error) {
        console.log('⚠️ Fichier non trouvé:', file);
      }
    }
  }

  /**
   * Vérifier si un fichier doit être exclu
   */
  shouldExclude(filename) {
    return this.excludePatterns.some(pattern => {
      if (pattern.includes('*')) {
        const regex = new RegExp(pattern.replace(/\*/g, '.*'));
        return regex.test(filename);
      }
      return filename.includes(pattern);
    });
  }

  /**
   * Générer les métadonnées de sauvegarde
   */
  async generateBackupMetadata(options) {
    const {
      id,
      timestamp,
      description,
      includeDatabase,
      includeConfig,
      includeSource
    } = options;

    // Obtenir des informations sur le système
    const systemInfo = {
      platform: process.platform,
      arch: process.arch,
      nodeVersion: process.version,
      hostname: require('os').hostname(),
      user: process.env.USER || process.env.USERNAME
    };

    // Obtenir des informations sur le projet
    let projectInfo = {};
    try {
      const packageJson = await fs.readFile(path.join(this.projectRoot, 'package.json'), 'utf8');
      const pkg = JSON.parse(packageJson);
      projectInfo = {
        name: pkg.name,
        version: pkg.version,
        description: pkg.description
      };
    } catch (error) {
      console.warn('⚠️ Impossible de lire package.json');
    }

    return {
      id,
      timestamp,
      description,
      type: 'full_system_backup',
      version: '1.0.0',
      components: {
        database: includeDatabase,
        config: includeConfig,
        source: includeSource
      },
      system: systemInfo,
      project: projectInfo,
      created_at: new Date().toISOString()
    };
  }

  /**
   * Calculer le hash SHA256 d'un fichier
   */
  async calculateFileHash(filePath) {
    const hash = crypto.createHash('sha256');
    const stream = require('fs').createReadStream(filePath);
    
    return new Promise((resolve, reject) => {
      stream.on('data', data => hash.update(data));
      stream.on('end', () => resolve(hash.digest('hex')));
      stream.on('error', reject);
    });
  }

  /**
   * Sauvegarder les métadonnées de sauvegarde
   */
  async saveBackupMetadata(metadata) {
    const metadataPath = path.join(this.backupDir, 'system_backups_metadata.json');
    
    try {
      let allMetadata = [];
      
      // Lire les métadonnées existantes
      try {
        const existingData = await fs.readFile(metadataPath, 'utf8');
        allMetadata = JSON.parse(existingData);
      } catch (error) {
        // Fichier n'existe pas encore
      }
      
      // Ajouter les nouvelles métadonnées
      allMetadata.push(metadata);
      
      // Garder seulement les 100 dernières sauvegardes
      if (allMetadata.length > 100) {
        allMetadata = allMetadata.slice(-100);
      }
      
      // Sauvegarder
      await fs.writeFile(metadataPath, JSON.stringify(allMetadata, null, 2));
      console.log('💾 Métadonnées sauvegardées');
    } catch (error) {
      console.error('❌ Erreur lors de la sauvegarde des métadonnées:', error);
    }
  }

  /**
   * Lister toutes les sauvegardes système
   */
  async listSystemBackups() {
    const metadataPath = path.join(this.backupDir, 'system_backups_metadata.json');
    
    try {
      const data = await fs.readFile(metadataPath, 'utf8');
      const metadata = JSON.parse(data);
      
      // Vérifier l'existence des fichiers
      const validBackups = [];
      
      for (const backup of metadata) {
        const backupPath = path.join(this.backupDir, `${backup.id}.zip`);
        try {
          const stats = await fs.stat(backupPath);
          validBackups.push({
            ...backup,
            path: backupPath,
            size: stats.size,
            exists: true
          });
        } catch (error) {
          validBackups.push({
            ...backup,
            exists: false,
            status: 'missing'
          });
        }
      }
      
      return validBackups.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
    } catch (error) {
      console.error('❌ Erreur lors de la récupération des sauvegardes:', error);
      return [];
    }
  }

  /**
   * Restaurer une sauvegarde système
   */
  async restoreSystemBackup(backupId, options = {}) {
    const {
      restoreDatabase = true,
      restoreConfig = true,
      restoreSource = false,
      createPreRestoreBackup = true
    } = options;

    console.log('🔄 Début de la restauration du système...');
    console.log('🆔 ID de sauvegarde:', backupId);

    try {
      // Trouver la sauvegarde
      const backups = await this.listSystemBackups();
      const backup = backups.find(b => b.id === backupId);
      
      if (!backup) {
        throw new Error(`Sauvegarde non trouvée: ${backupId}`);
      }
      
      if (!backup.exists) {
        throw new Error(`Fichier de sauvegarde manquant: ${backup.path}`);
      }

      // Créer une sauvegarde de pré-restauration
      if (createPreRestoreBackup) {
        console.log('💾 Création d\'une sauvegarde de pré-restauration...');
        await this.createFullBackup({
          includeDatabase: true,
          includeConfig: true,
          includeSource: false,
          description: `Sauvegarde automatique avant restauration de ${backupId}`
        });
      }

      // Extraire l'archive
      const extractPath = path.join(this.backupDir, `extract_${Date.now()}`);
      await this.extractBackup(backup.path, extractPath);

      try {
        // Restaurer les composants demandés
        if (restoreDatabase) {
          await this.restoreDatabase(extractPath);
        }
        
        if (restoreConfig) {
          await this.restoreConfig(extractPath);
        }
        
        if (restoreSource) {
          await this.restoreSource(extractPath);
        }

        console.log('✅ Restauration terminée avec succès!');
        
        return {
          success: true,
          message: 'Système restauré avec succès',
          restoredComponents: {
            database: restoreDatabase,
            config: restoreConfig,
            source: restoreSource
          }
        };

      } finally {
        // Nettoyer le répertoire d'extraction
        try {
          await this.removeDirectory(extractPath);
        } catch (error) {
          console.warn('⚠️ Impossible de nettoyer le répertoire d\'extraction:', error.message);
        }
      }

    } catch (error) {
      console.error('❌ Erreur lors de la restauration:', error);
      throw error;
    }
  }

  /**
   * Extraire une archive de sauvegarde
   */
  async extractBackup(archivePath, extractPath) {
    const unzipper = require('unzipper');
    
    await fs.mkdir(extractPath, { recursive: true });
    
    return new Promise((resolve, reject) => {
      require('fs').createReadStream(archivePath)
        .pipe(unzipper.Extract({ path: extractPath }))
        .on('close', resolve)
        .on('error', reject);
    });
  }

  /**
   * Restaurer la base de données
   */
  async restoreDatabase(extractPath) {
    const dbBackupPath = path.join(extractPath, 'database/fusepoint.db');
    
    try {
      await fs.access(dbBackupPath);
      await fs.copyFile(dbBackupPath, this.dbPath);
      console.log('✅ Base de données restaurée');
    } catch (error) {
      console.warn('⚠️ Impossible de restaurer la base de données:', error.message);
    }
  }

  /**
   * Restaurer la configuration
   */
  async restoreConfig(extractPath) {
    const configBackupPath = path.join(extractPath, 'config');
    
    try {
      await fs.access(configBackupPath);
      
      // Restaurer chaque fichier de configuration
      const configFiles = await fs.readdir(configBackupPath);
      
      for (const file of configFiles) {
        const sourcePath = path.join(configBackupPath, file);
        const targetPath = path.join(this.projectRoot, file);
        
        try {
          await fs.copyFile(sourcePath, targetPath);
          console.log('✅ Config restaurée:', file);
        } catch (error) {
          console.warn('⚠️ Impossible de restaurer:', file, error.message);
        }
      }
    } catch (error) {
      console.warn('⚠️ Impossible de restaurer la configuration:', error.message);
    }
  }

  /**
   * Restaurer le code source
   */
  async restoreSource(extractPath) {
    const sourceBackupPath = path.join(extractPath, 'source');
    
    try {
      await fs.access(sourceBackupPath);
      
      // Copier récursivement le code source
      await this.copyDirectory(sourceBackupPath, this.projectRoot);
      console.log('✅ Code source restauré');
    } catch (error) {
      console.warn('⚠️ Impossible de restaurer le code source:', error.message);
    }
  }

  /**
   * Copier un répertoire récursivement
   */
  async copyDirectory(source, target) {
    await fs.mkdir(target, { recursive: true });
    
    const entries = await fs.readdir(source, { withFileTypes: true });
    
    for (const entry of entries) {
      const sourcePath = path.join(source, entry.name);
      const targetPath = path.join(target, entry.name);
      
      if (entry.isDirectory()) {
        await this.copyDirectory(sourcePath, targetPath);
      } else {
        await fs.copyFile(sourcePath, targetPath);
      }
    }
  }

  /**
   * Supprimer un répertoire récursivement
   */
  async removeDirectory(dirPath) {
    try {
      await fs.rm(dirPath, { recursive: true, force: true });
    } catch (error) {
      // Fallback pour les anciennes versions de Node.js
      await execAsync(`rm -rf "${dirPath}"`);
    }
  }

  /**
   * Nettoyer les anciennes sauvegardes
   */
  async cleanOldBackups(daysToKeep = 30) {
    console.log(`🧹 Nettoyage des sauvegardes de plus de ${daysToKeep} jours...`);
    
    try {
      const backups = await this.listSystemBackups();
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - daysToKeep);
      
      let deletedCount = 0;
      
      for (const backup of backups) {
        const backupDate = new Date(backup.created_at);
        
        if (backupDate < cutoffDate && backup.type !== 'manual') {
          try {
            await fs.unlink(backup.path);
            deletedCount++;
            console.log('🗑️ Sauvegarde supprimée:', backup.id);
          } catch (error) {
            console.warn('⚠️ Impossible de supprimer:', backup.id, error.message);
          }
        }
      }
      
      // Mettre à jour les métadonnées
      const remainingBackups = backups.filter(backup => {
        const backupDate = new Date(backup.created_at);
        return backupDate >= cutoffDate || backup.type === 'manual';
      });
      
      const metadataPath = path.join(this.backupDir, 'system_backups_metadata.json');
      await fs.writeFile(metadataPath, JSON.stringify(remainingBackups, null, 2));
      
      console.log(`✅ ${deletedCount} anciennes sauvegardes supprimées`);
      
      return {
        success: true,
        deletedCount,
        message: `${deletedCount} anciennes sauvegardes supprimées`
      };
    } catch (error) {
      console.error('❌ Erreur lors du nettoyage:', error);
      throw error;
    }
  }

  /**
   * Programmer des sauvegardes automatiques
   */
  scheduleAutoBackups() {
    console.log('⏰ Programmation des sauvegardes automatiques...');
    
    // Sauvegarde quotidienne (base de données + config)
    setInterval(async () => {
      try {
        console.log('🕐 Début de la sauvegarde automatique quotidienne...');
        await this.createFullBackup({
          includeDatabase: true,
          includeConfig: true,
          includeSource: false,
          description: 'Sauvegarde automatique quotidienne'
        });
        
        // Nettoyer les anciennes sauvegardes
        await this.cleanOldBackups(30);
      } catch (error) {
        console.error('❌ Erreur lors de la sauvegarde automatique:', error);
      }
    }, 24 * 60 * 60 * 1000); // 24 heures
    
    // Sauvegarde hebdomadaire complète (tout)
    setInterval(async () => {
      try {
        console.log('🕐 Début de la sauvegarde automatique hebdomadaire...');
        await this.createFullBackup({
          includeDatabase: true,
          includeConfig: true,
          includeSource: true,
          description: 'Sauvegarde automatique hebdomadaire complète'
        });
      } catch (error) {
        console.error('❌ Erreur lors de la sauvegarde hebdomadaire:', error);
      }
    }, 7 * 24 * 60 * 60 * 1000); // 7 jours
    
    console.log('✅ Sauvegardes automatiques programmées');
    console.log('📅 Quotidienne: Base de données + Configuration');
    console.log('📅 Hebdomadaire: Sauvegarde complète');
  }

  /**
   * Formater la taille en bytes
   */
  formatBytes(bytes) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  /**
   * Obtenir les statistiques des sauvegardes
   */
  async getBackupStats() {
    try {
      const backups = await this.listSystemBackups();
      
      const stats = {
        total: backups.length,
        totalSize: 0,
        byType: {},
        recent: backups.slice(0, 5),
        oldestBackup: null,
        newestBackup: null,
        healthStatus: 'healthy'
      };
      
      if (backups.length > 0) {
        stats.totalSize = backups.reduce((sum, backup) => sum + (backup.size || 0), 0);
        stats.oldestBackup = backups[backups.length - 1];
        stats.newestBackup = backups[0];
        
        // Compter par type
        backups.forEach(backup => {
          const type = backup.description.includes('automatique') ? 'auto' : 'manual';
          stats.byType[type] = (stats.byType[type] || 0) + 1;
        });
        
        // Vérifier la santé des sauvegardes
        const lastBackup = new Date(stats.newestBackup.created_at);
        const daysSinceLastBackup = (Date.now() - lastBackup.getTime()) / (1000 * 60 * 60 * 24);
        
        if (daysSinceLastBackup > 2) {
          stats.healthStatus = 'warning';
        }
        if (daysSinceLastBackup > 7) {
          stats.healthStatus = 'critical';
        }
      } else {
        stats.healthStatus = 'critical';
      }
      
      return stats;
    } catch (error) {
      console.error('❌ Erreur lors du calcul des statistiques:', error);
      return {
        total: 0,
        totalSize: 0,
        byType: {},
        recent: [],
        oldestBackup: null,
        newestBackup: null,
        healthStatus: 'error'
      };
    }
  }
}

// Fonction principale pour l'utilisation en ligne de commande
async function main() {
  const args = process.argv.slice(2);
  const command = args[0];
  
  const backupSystem = new ComprehensiveBackupSystem();
  await backupSystem.initialize();
  
  try {
    switch (command) {
      case 'create':
        const includeSource = args.includes('--source');
        const description = args.find(arg => arg.startsWith('--desc='))?.split('=')[1] || 'Sauvegarde manuelle';
        
        const result = await backupSystem.createFullBackup({
          includeDatabase: true,
          includeConfig: true,
          includeSource,
          description
        });
        
        console.log('\n📋 Résumé de la sauvegarde:');
        console.log('🆔 ID:', result.backupId);
        console.log('📁 Fichier:', result.path);
        console.log('📊 Taille:', backupSystem.formatBytes(result.size));
        console.log('🔐 Hash:', result.hash);
        break;
        
      case 'list':
        const backups = await backupSystem.listSystemBackups();
        
        console.log('\n📋 Liste des sauvegardes système:');
        console.log('=' .repeat(80));
        
        if (backups.length === 0) {
          console.log('Aucune sauvegarde trouvée.');
        } else {
          backups.forEach((backup, index) => {
            console.log(`${index + 1}. ${backup.id}`);
            console.log(`   📅 Date: ${new Date(backup.created_at).toLocaleString()}`);
            console.log(`   📝 Description: ${backup.description}`);
            console.log(`   📊 Taille: ${backup.exists ? backupSystem.formatBytes(backup.size) : 'Fichier manquant'}`);
            console.log(`   🔐 Hash: ${backup.hash || 'N/A'}`);
            console.log(`   ✅ Statut: ${backup.exists ? 'Disponible' : 'Manquant'}`);
            console.log('');
          });
        }
        break;
        
      case 'restore':
        const backupId = args[1];
        if (!backupId) {
          console.error('❌ Veuillez spécifier l\'ID de la sauvegarde à restaurer');
          process.exit(1);
        }
        
        const restoreOptions = {
          restoreDatabase: !args.includes('--no-db'),
          restoreConfig: !args.includes('--no-config'),
          restoreSource: args.includes('--source'),
          createPreRestoreBackup: !args.includes('--no-pre-backup')
        };
        
        await backupSystem.restoreSystemBackup(backupId, restoreOptions);
        break;
        
      case 'clean':
        const days = parseInt(args[1]) || 30;
        await backupSystem.cleanOldBackups(days);
        break;
        
      case 'stats':
        const stats = await backupSystem.getBackupStats();
        
        console.log('\n📊 Statistiques des sauvegardes:');
        console.log('=' .repeat(50));
        console.log(`📦 Total: ${stats.total} sauvegardes`);
        console.log(`📊 Taille totale: ${backupSystem.formatBytes(stats.totalSize)}`);
        console.log(`🏥 Statut: ${stats.healthStatus}`);
        
        if (stats.newestBackup) {
          console.log(`📅 Dernière sauvegarde: ${new Date(stats.newestBackup.created_at).toLocaleString()}`);
        }
        
        console.log('\n📋 Répartition par type:');
        Object.entries(stats.byType).forEach(([type, count]) => {
          console.log(`   ${type}: ${count}`);
        });
        break;
        
      case 'schedule':
        console.log('⏰ Démarrage du planificateur de sauvegardes...');
        backupSystem.scheduleAutoBackups();
        
        // Garder le processus en vie
        process.on('SIGINT', () => {
          console.log('\n🛑 Arrêt du planificateur de sauvegardes...');
          process.exit(0);
        });
        
        console.log('✅ Planificateur démarré. Appuyez sur Ctrl+C pour arrêter.');
        break;
        
      default:
        console.log('\n🔧 Système de sauvegarde et récupération Fusepoint');
        console.log('=' .repeat(50));
        console.log('\nCommandes disponibles:');
        console.log('  create [--source] [--desc="Description"]  - Créer une sauvegarde');
        console.log('  list                                      - Lister les sauvegardes');
        console.log('  restore <backup-id> [options]            - Restaurer une sauvegarde');
        console.log('  clean [days]                              - Nettoyer les anciennes sauvegardes');
        console.log('  stats                                     - Afficher les statistiques');
        console.log('  schedule                                  - Démarrer les sauvegardes automatiques');
        console.log('\nOptions de restauration:');
        console.log('  --no-db          - Ne pas restaurer la base de données');
        console.log('  --no-config      - Ne pas restaurer la configuration');
        console.log('  --source         - Restaurer le code source');
        console.log('  --no-pre-backup  - Ne pas créer de sauvegarde de pré-restauration');
        console.log('\nExemples:');
        console.log('  node backup-system.js create --source --desc="Avant mise à jour"');
        console.log('  node backup-system.js restore full_backup_2024-01-15T10-30-00-000Z');
        console.log('  node backup-system.js clean 7');
        break;
    }
  } catch (error) {
    console.error('❌ Erreur:', error.message);
    process.exit(1);
  }
}

// Exporter la classe pour utilisation en tant que module
export default ComprehensiveBackupSystem;

// Exécuter si appelé directement
if (require.main === module) {
  main();
}