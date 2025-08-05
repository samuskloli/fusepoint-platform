/**
 * Script de migration SQLite vers MariaDB simplifié
 * Migre seulement les colonnes compatibles
 */

const sqlite3 = require('sqlite3').verbose();
const { open } = require('sqlite');
const mysql = require('mysql2/promise');
const path = require('path');
const fs = require('fs');

class SimpleMigrator {
  constructor() {
    this.sqliteDbPath = path.join(__dirname, '../database/fusepoint.db');
    this.sqliteDb = null;
    this.mariadbConn = null;
    
    // Configuration MariaDB depuis .env.mariadb
    this.loadMariaDBConfig();
  }

  loadMariaDBConfig() {
    const envPath = path.join(__dirname, '..', '.env.mariadb');
    if (fs.existsSync(envPath)) {
      const envContent = fs.readFileSync(envPath, 'utf8');
      const envLines = envContent.split('\n');
      
      envLines.forEach(line => {
        const [key, value] = line.split('=');
        if (key && value) {
          process.env[key.trim()] = value.trim();
        }
      });
    }

    this.mariadbConfig = {
      host: process.env.MARIADB_HOST || 'localhost',
      port: parseInt(process.env.MARIADB_PORT) || 3306,
      user: process.env.MARIADB_USER || 'oliveirasamuel',
      password: process.env.MARIADB_PASSWORD || 'FusepointDB2025!',
      database: process.env.MARIADB_DATABASE || 'fusepoint_db'
    };
  }

  async initialize() {
    try {
      // Connexion SQLite
      this.sqliteDb = await open({
        filename: this.sqliteDbPath,
        driver: sqlite3.Database
      });
      console.log('✅ Connexion SQLite établie');

      // Connexion MariaDB
      this.mariadbConn = await mysql.createConnection(this.mariadbConfig);
      console.log('✅ Connexion MariaDB établie');

      return true;
    } catch (error) {
      console.error('❌ Erreur initialisation:', error);
      throw error;
    }
  }

  async migrateUsers() {
    try {
      console.log('👥 Migration des utilisateurs...');
      
      // Récupérer les utilisateurs SQLite
      const users = await this.sqliteDb.all('SELECT * FROM users');
      console.log(`📊 ${users.length} utilisateurs trouvés dans SQLite`);

      if (users.length === 0) {
        console.log('ℹ️ Aucun utilisateur à migrer');
        return;
      }

      // Vider la table users MariaDB
      await this.mariadbConn.execute('DELETE FROM users');
      console.log('🗑️ Table users MariaDB vidée');

      // Insérer les utilisateurs avec seulement les colonnes compatibles
      const sql = `
        INSERT INTO users (
          email, password_hash, first_name, last_name, phone, 
          role, email_verified, confirmation_token, token_expiry, 
          reset_token, reset_token_expiry
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `;

      for (const user of users) {
        console.log(`   - Migration utilisateur: ${user.email} (${user.role})`);
        
        const values = [
          user.email,
          user.password_hash || user.password,
          user.first_name,
          user.last_name,
          user.phone,
          user.role, // Garder le rôle original
          user.email_verified || user.is_confirmed || 0,
          user.confirmation_token,
          user.token_expiry,
          user.reset_token,
          user.reset_token_expiry
        ];
        
        await this.mariadbConn.execute(sql, values);
      }

      console.log(`✅ ${users.length} utilisateurs migrés vers MariaDB`);
    } catch (error) {
      console.error('❌ Erreur migration utilisateurs:', error);
      throw error;
    }
  }

  async migrate() {
    try {
      console.log('🚀 Début de la migration SQLite vers MariaDB');
      console.log('=' .repeat(50));

      await this.initialize();
      await this.migrateUsers();

      console.log('=' .repeat(50));
      console.log('✅ Migration terminée avec succès!');
      
      // Vérification
      const [userCount] = await this.mariadbConn.execute('SELECT COUNT(*) as count FROM users');
      console.log(`📊 Utilisateurs dans MariaDB: ${userCount[0].count}`);
      
      // Afficher quelques utilisateurs
      const [sampleUsers] = await this.mariadbConn.execute('SELECT id, email, role FROM users LIMIT 5');
      console.log('👥 Exemples d\'utilisateurs migrés:');
      sampleUsers.forEach(user => {
        console.log(`   - ${user.email} (${user.role})`);
      });
      
    } catch (error) {
      console.error('❌ Erreur migration:', error);
    } finally {
      if (this.sqliteDb) await this.sqliteDb.close();
      if (this.mariadbConn) await this.mariadbConn.end();
    }
  }
}

// Exécuter la migration
const migrator = new SimpleMigrator();
migrator.migrate();