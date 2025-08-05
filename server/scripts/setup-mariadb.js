#!/usr/bin/env node
/**
 * Script d'installation et configuration MariaDB
 * Fusepoint Platform - Migration SQLite vers MariaDB
 */

const { execSync, spawn } = require('child_process');
const fs = require('fs');
const path = require('path');
const readline = require('readline');

class MariaDBSetup {
  constructor() {
    this.rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout
    });
  }

  /**
   * Poser une question à l'utilisateur
   */
  question(query) {
    return new Promise(resolve => {
      this.rl.question(query, resolve);
    });
  }

  /**
   * Exécuter une commande shell
   */
  execCommand(command, options = {}) {
    try {
      console.log(`🔧 Exécution: ${command}`);
      const result = execSync(command, { 
        encoding: 'utf8', 
        stdio: 'inherit',
        ...options 
      });
      return result;
    } catch (error) {
      console.error(`❌ Erreur commande: ${command}`);
      console.error(error.message);
      throw error;
    }
  }

  /**
   * Vérifier si MariaDB est installé
   */
  checkMariaDBInstallation() {
    try {
      this.execCommand('which mariadb', { stdio: 'pipe' });
      console.log('✅ MariaDB est installé');
      return true;
    } catch (error) {
      console.log('❌ MariaDB n\'est pas installé');
      return false;
    }
  }

  /**
   * Installer MariaDB via Homebrew
   */
  async installMariaDB() {
    try {
      console.log('📦 Installation de MariaDB via Homebrew...');
      
      // Vérifier si Homebrew est installé
      try {
        this.execCommand('which brew', { stdio: 'pipe' });
      } catch (error) {
        console.error('❌ Homebrew n\'est pas installé. Veuillez l\'installer d\'abord.');
        console.log('Visitez: https://brew.sh/');
        throw error;
      }

      // Installer MariaDB
      this.execCommand('brew install mariadb');
      
      console.log('✅ MariaDB installé avec succès');
    } catch (error) {
      console.error('❌ Erreur installation MariaDB:', error.message);
      throw error;
    }
  }

  /**
   * Initialiser MariaDB
   */
  async initializeMariaDB() {
    try {
      console.log('🔧 Initialisation de MariaDB...');
      
      // Arrêter le service s'il est en cours
      try {
        this.execCommand('brew services stop mariadb');
      } catch (error) {
        console.log('ℹ️ Service MariaDB n\'était pas démarré');
      }

      // Initialiser la base de données
      this.execCommand('mariadb-install-db');
      
      // Démarrer le service
      this.execCommand('brew services start mariadb');
      
      console.log('✅ MariaDB initialisé et démarré');
      
      // Attendre que le service soit prêt
      console.log('⏳ Attente du démarrage du service...');
      await this.sleep(3000);
      
    } catch (error) {
      console.error('❌ Erreur initialisation MariaDB:', error.message);
      throw error;
    }
  }

  /**
   * Créer la base de données Fusepoint
   */
  async createDatabase() {
    try {
      console.log('🗄️ Création de la base de données fusepoint_db...');
      
      // Se connecter à MariaDB et créer la base
      const createDbCommand = `mariadb -u ${process.env.USER || 'root'} -e "CREATE DATABASE IF NOT EXISTS fusepoint_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;"`;
      
      this.execCommand(createDbCommand);
      
      console.log('✅ Base de données fusepoint_db créée');
    } catch (error) {
      console.error('❌ Erreur création base de données:', error.message);
      throw error;
    }
  }

  /**
   * Créer le fichier .env pour MariaDB
   */
  async createEnvFile() {
    try {
      const envPath = path.join(__dirname, '../.env.mariadb');
      
      const envContent = `# Configuration MariaDB pour Fusepoint Platform
# Généré automatiquement le ${new Date().toISOString()}

# Base de données
DB_TYPE=mariadb
MARIADB_HOST=localhost
MARIADB_PORT=3306
MARIADB_USER=${process.env.USER || 'root'}
MARIADB_PASSWORD=
MARIADB_DATABASE=fusepoint_db

# Clé de chiffrement (générez une nouvelle clé pour la production)
DB_ENCRYPTION_KEY=${require('crypto').randomBytes(32).toString('hex')}

# Configuration existante (à copier depuis votre .env actuel)
# JWT_SECRET=votre_jwt_secret
# SMTP_HOST=votre_smtp_host
# SMTP_PORT=587
# SMTP_USER=votre_smtp_user
# SMTP_PASS=votre_smtp_pass
# etc...
`;

      fs.writeFileSync(envPath, envContent);
      console.log(`✅ Fichier de configuration créé: ${envPath}`);
      console.log('📝 N\'oubliez pas de copier vos variables d\'environnement existantes!');
      
    } catch (error) {
      console.error('❌ Erreur création fichier .env:', error.message);
      throw error;
    }
  }

  /**
   * Tester la connexion MariaDB
   */
  async testConnection() {
    try {
      console.log('🔍 Test de connexion à MariaDB...');
      
      const testCommand = `mariadb -u ${process.env.USER || 'root'} fusepoint_db -e "SELECT 1 as test;"`;
      this.execCommand(testCommand);
      
      console.log('✅ Connexion MariaDB réussie');
      return true;
    } catch (error) {
      console.error('❌ Test de connexion échoué:', error.message);
      return false;
    }
  }

  /**
   * Exécuter la migration
   */
  async runMigration() {
    try {
      console.log('🚀 Préparation de la migration SQLite vers MariaDB...');
      
      // Charger les variables d'environnement MariaDB
      const envPath = path.join(__dirname, '../.env.mariadb');
      if (fs.existsSync(envPath)) {
        require('dotenv').config({ path: envPath });
      }
      
      console.log('📋 Pour exécuter la migration, utilisez:');
      console.log('   cd server && node scripts/migrate-sqlite-to-mariadb.js');
      console.log('📋 Pour tester la migration, utilisez:');
      console.log('   cd server && node scripts/test-mariadb-migration.js');
      
      console.log('✅ Configuration prête pour la migration');
    } catch (error) {
      console.error('❌ Erreur préparation migration:', error.message);
      throw error;
    }
  }

  /**
   * Fonction utilitaire pour attendre
   */
  sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Processus d'installation complet
   */
  async setup() {
    try {
      console.log('🚀 Configuration MariaDB pour Fusepoint Platform');
      console.log('=' .repeat(60));
      
      // 1. Vérifier l'installation MariaDB
      if (!this.checkMariaDBInstallation()) {
        const install = await this.question('MariaDB n\'est pas installé. Voulez-vous l\'installer ? (y/N): ');
        if (install.toLowerCase() === 'y' || install.toLowerCase() === 'yes') {
          await this.installMariaDB();
        } else {
          console.log('❌ Installation annulée');
          return;
        }
      }
      
      // 2. Initialiser MariaDB
      const init = await this.question('Voulez-vous initialiser/redémarrer MariaDB ? (Y/n): ');
      if (init.toLowerCase() !== 'n' && init.toLowerCase() !== 'no') {
        await this.initializeMariaDB();
      }
      
      // 3. Créer la base de données
      await this.createDatabase();
      
      // 4. Tester la connexion
      const connectionOk = await this.testConnection();
      if (!connectionOk) {
        console.error('❌ Impossible de se connecter à MariaDB');
        return;
      }
      
      // 5. Créer le fichier de configuration
      await this.createEnvFile();
      
      // 6. Préparer la migration
      await this.runMigration();
      
      console.log('\n🎉 Configuration MariaDB terminée avec succès!');
      console.log('=' .repeat(60));
      console.log('📋 Prochaines étapes:');
      console.log('1. Copiez vos variables d\'environnement dans .env.mariadb');
      console.log('2. Modifiez votre application pour utiliser MariaDBService');
      console.log('3. Testez votre application avec la nouvelle base de données');
      console.log('4. Une fois validé, vous pouvez supprimer l\'ancienne base SQLite');
      
    } catch (error) {
      console.error('❌ Erreur configuration:', error.message);
    } finally {
      this.rl.close();
    }
  }
}

// Exécuter le setup si le script est appelé directement
if (require.main === module) {
  const setup = new MariaDBSetup();
  setup.setup();
}

module.exports = MariaDBSetup;