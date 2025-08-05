/**
 * Script de migration SQLite vers MariaDB
 * Fusepoint Platform Database Migration
 */

const sqlite3 = require('sqlite3').verbose();
const { open } = require('sqlite');
const mariadb = require('mariadb');
const path = require('path');
const fs = require('fs');
const MariaDBConfig = require('../config/mariadb.config');

class SQLiteToMariaDBMigrator {
  constructor() {
    this.sqliteDbPath = path.join(__dirname, '../database/fusepoint.db');
    this.mariadbConfig = new MariaDBConfig();
    this.sqliteDb = null;
    this.mariadbConn = null;
  }

  /**
   * Initialiser les connexions
   */
  async initialize() {
    try {
      // Connexion SQLite
      this.sqliteDb = await open({
        filename: this.sqliteDbPath,
        driver: sqlite3.Database
      });
      console.log('✅ Connexion SQLite établie');

      // Connexion MariaDB
      this.mariadbConn = await this.mariadbConfig.getConnection();
      console.log('✅ Connexion MariaDB établie');

      return true;
    } catch (error) {
      console.error('❌ Erreur initialisation:', error);
      throw error;
    }
  }

  /**
   * Créer les tables MariaDB
   */
  async createMariaDBTables() {
    try {
      console.log('🏗️ Création des tables MariaDB...');

      // Table users
      await this.mariadbConn.query(`
        CREATE TABLE IF NOT EXISTS users (
          id INT AUTO_INCREMENT PRIMARY KEY,
          email VARCHAR(255) UNIQUE NOT NULL,
          password_hash VARCHAR(255),
          first_name VARCHAR(100),
          last_name VARCHAR(100),
          phone VARCHAR(20),
          role VARCHAR(50) DEFAULT 'user',
          is_active BOOLEAN DEFAULT 1,
          email_verified BOOLEAN DEFAULT 0,
          first_login_token VARCHAR(255),
          first_login_token_expires DATETIME,
          confirmation_token VARCHAR(255),
          token_expiry DATETIME,
          reset_token VARCHAR(255),
          reset_token_expiry DATETIME,
          onboarding_completed BOOLEAN DEFAULT 0,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
          last_login DATETIME,
          agent_id INT,
          user_code VARCHAR(20) UNIQUE,
          status VARCHAR(20) DEFAULT 'active',
          specialties TEXT,
          company_id INT,
          INDEX idx_users_email (email),
          INDEX idx_users_agent_id (agent_id),
          INDEX idx_users_user_code (user_code),
          INDEX idx_users_company_id (company_id)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
      `);

      // Table companies
      await this.mariadbConn.query(`
        CREATE TABLE IF NOT EXISTS companies (
          id INT AUTO_INCREMENT PRIMARY KEY,
          name VARCHAR(255) NOT NULL,
          description TEXT,
          website VARCHAR(255),
          industry VARCHAR(100),
          size VARCHAR(50),
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
      `);

      // Table projects
      await this.mariadbConn.query(`
        CREATE TABLE IF NOT EXISTS projects (
          id INT AUTO_INCREMENT PRIMARY KEY,
          name VARCHAR(255) NOT NULL,
          description TEXT,
          status VARCHAR(50) DEFAULT 'active',
          company_id INT,
          created_by INT,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
          INDEX idx_projects_company_id (company_id),
          INDEX idx_projects_created_by (created_by)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
      `);

      // Table notifications
      await this.mariadbConn.query(`
        CREATE TABLE IF NOT EXISTS notifications (
          id INT AUTO_INCREMENT PRIMARY KEY,
          user_id INT NOT NULL,
          title VARCHAR(255) NOT NULL,
          message TEXT,
          type VARCHAR(50) DEFAULT 'info',
          is_read BOOLEAN DEFAULT 0,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          INDEX idx_notifications_user_id (user_id)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
      `);

      // Autres tables importantes
      await this.createAdditionalTables();

      console.log('✅ Tables MariaDB créées avec succès');
    } catch (error) {
      console.error('❌ Erreur création tables MariaDB:', error);
      throw error;
    }
  }

  /**
   * Créer les tables additionnelles
   */
  async createAdditionalTables() {
    // Table service_requests
    await this.mariadbConn.query(`
      CREATE TABLE IF NOT EXISTS service_requests (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT,
        service_type VARCHAR(100),
        description TEXT,
        status VARCHAR(50) DEFAULT 'pending',
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        INDEX idx_service_requests_user_id (user_id)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);

    // Table api_configurations
    await this.mariadbConn.query(`
      CREATE TABLE IF NOT EXISTS api_configurations (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT,
        platform VARCHAR(50),
        access_token TEXT,
        refresh_token TEXT,
        expires_at DATETIME,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        INDEX idx_api_configurations_user_id (user_id)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);

    // Table audit_logs
    await this.mariadbConn.query(`
      CREATE TABLE IF NOT EXISTS audit_logs (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT,
        action VARCHAR(100),
        table_name VARCHAR(50),
        record_id INT,
        old_values JSON,
        new_values JSON,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        INDEX idx_audit_logs_user_id (user_id),
        INDEX idx_audit_logs_table_name (table_name)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);
  }

  /**
   * Migrer les données d'une table
   */
  async migrateTable(tableName) {
    try {
      console.log(`📊 Migration de la table ${tableName}...`);

      // Récupérer les données SQLite
      const rows = await this.sqliteDb.all(`SELECT * FROM ${tableName}`);
      
      if (rows.length === 0) {
        console.log(`ℹ️ Table ${tableName} vide, aucune donnée à migrer`);
        return;
      }

      // Préparer l'insertion en batch
      const columns = Object.keys(rows[0]);
      const placeholders = columns.map(() => '?').join(', ');
      const columnNames = columns.join(', ');
      
      const insertQuery = `INSERT INTO ${tableName} (${columnNames}) VALUES (${placeholders})`;

      // Insérer les données par batch
      const batchSize = 100;
      for (let i = 0; i < rows.length; i += batchSize) {
        const batch = rows.slice(i, i + batchSize);
        
        for (const row of batch) {
          const values = columns.map(col => {
            let value = row[col];
            // Conversion des types SQLite vers MariaDB
            if (value === null || value === undefined) {
              return null;
            }
            // Conversion des booléens
            if (typeof value === 'boolean') {
              return value ? 1 : 0;
            }
            return value;
          });
          
          try {
            await this.mariadbConn.query(insertQuery, values);
          } catch (insertError) {
            console.warn(`⚠️ Erreur insertion ligne ${tableName}:`, insertError.message);
            // Continuer avec les autres lignes
          }
        }
      }

      console.log(`✅ Table ${tableName} migrée: ${rows.length} enregistrements`);
    } catch (error) {
      console.error(`❌ Erreur migration table ${tableName}:`, error);
      throw error;
    }
  }

  /**
   * Obtenir la liste des tables SQLite
   */
  async getSQLiteTables() {
    try {
      const tables = await this.sqliteDb.all(
        "SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%'"
      );
      return tables.map(table => table.name);
    } catch (error) {
      console.error('❌ Erreur récupération tables SQLite:', error);
      throw error;
    }
  }

  /**
   * Exécuter la migration complète
   */
  async migrate() {
    try {
      console.log('🚀 Début de la migration SQLite vers MariaDB...');
      
      // Initialiser les connexions
      await this.initialize();
      
      // Créer les tables MariaDB
      await this.createMariaDBTables();
      
      // Obtenir la liste des tables
      const tables = await this.getSQLiteTables();
      console.log(`📋 Tables à migrer: ${tables.join(', ')}`);
      
      // Migrer chaque table
      for (const table of tables) {
        await this.migrateTable(table);
      }
      
      console.log('🎉 Migration terminée avec succès!');
      
      // Afficher un résumé
      await this.showMigrationSummary();
      
    } catch (error) {
      console.error('❌ Erreur migration:', error);
      throw error;
    } finally {
      await this.cleanup();
    }
  }

  /**
   * Afficher un résumé de la migration
   */
  async showMigrationSummary() {
    try {
      console.log('\n📊 Résumé de la migration:');
      console.log('=' .repeat(50));
      
      const tables = ['users', 'companies', 'projects', 'notifications'];
      
      for (const table of tables) {
        try {
          const result = await this.mariadbConn.query(`SELECT COUNT(*) as count FROM ${table}`);
          console.log(`${table}: ${result[0].count} enregistrements`);
        } catch (error) {
          console.log(`${table}: Table non trouvée`);
        }
      }
      
      console.log('=' .repeat(50));
    } catch (error) {
      console.error('❌ Erreur résumé:', error);
    }
  }

  /**
   * Nettoyer les connexions
   */
  async cleanup() {
    try {
      if (this.sqliteDb) {
        await this.sqliteDb.close();
        console.log('🔒 Connexion SQLite fermée');
      }
      
      if (this.mariadbConn) {
        this.mariadbConn.release();
        console.log('🔒 Connexion MariaDB fermée');
      }
      
      await this.mariadbConfig.closePool();
    } catch (error) {
      console.error('❌ Erreur nettoyage:', error);
    }
  }
}

// Exécuter la migration si le script est appelé directement
if (require.main === module) {
  const migrator = new SQLiteToMariaDBMigrator();
  
  migrator.migrate()
    .then(() => {
      console.log('✅ Migration terminée');
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ Migration échouée:', error);
      process.exit(1);
    });
}

module.exports = SQLiteToMariaDBMigrator;