/**
 * Script pour recréer la structure complète SQLite dans MariaDB
 * Supprime et recrée toutes les tables avec la structure identique
 */

const sqlite3 = require('sqlite3').verbose();
const { open } = require('sqlite');
const mysql = require('mysql2/promise');
const path = require('path');
const fs = require('fs');

class MariaDBStructureRecreator {
  constructor() {
    this.sqliteDbPath = path.join(__dirname, '../database/fusepoint.db');
    this.sqliteDb = null;
    this.mariadbConn = null;
    
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
      this.sqliteDb = await open({
        filename: this.sqliteDbPath,
        driver: sqlite3.Database
      });
      console.log('✅ Connexion SQLite établie');

      this.mariadbConn = await mysql.createConnection(this.mariadbConfig);
      console.log('✅ Connexion MariaDB établie');

      return true;
    } catch (error) {
      console.error('❌ Erreur initialisation:', error);
      throw error;
    }
  }

  async dropAllTables() {
    try {
      console.log('🗑️ Suppression de toutes les tables MariaDB...');
      
      // Désactiver les contraintes de clés étrangères
      await this.mariadbConn.execute('SET FOREIGN_KEY_CHECKS = 0');
      
      // Obtenir la liste des tables
      const [tables] = await this.mariadbConn.execute('SHOW TABLES');
      
      for (const table of tables) {
        const tableName = Object.values(table)[0];
        await this.mariadbConn.execute(`DROP TABLE IF EXISTS \`${tableName}\``);
        console.log(`   - Table ${tableName} supprimée`);
      }
      
      // Réactiver les contraintes
      await this.mariadbConn.execute('SET FOREIGN_KEY_CHECKS = 1');
      
      console.log('✅ Toutes les tables supprimées');
    } catch (error) {
      console.error('❌ Erreur suppression tables:', error);
      throw error;
    }
  }

  async createTablesFromSQLite() {
    try {
      console.log('🏗️ Création des tables à partir de SQLite...');
      
      // Obtenir le schéma SQLite
      const tables = await this.sqliteDb.all(
        "SELECT name, sql FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%'"
      );
      
      console.log(`📊 ${tables.length} tables trouvées dans SQLite`);
      
      for (const table of tables) {
        console.log(`   - Création de la table ${table.name}...`);
        
        // Convertir le SQL SQLite en SQL MariaDB
        let mariadbSQL = this.convertSQLiteToMariaDB(table.sql);
        
        try {
          await this.mariadbConn.execute(mariadbSQL);
          console.log(`   ✅ Table ${table.name} créée`);
        } catch (error) {
          console.error(`   ❌ Erreur création table ${table.name}:`, error.message);
          console.log(`   SQL: ${mariadbSQL}`);
        }
      }
      
      // Créer les index
      await this.createIndexes();
      
    } catch (error) {
      console.error('❌ Erreur création tables:', error);
      throw error;
    }
  }

  convertSQLiteToMariaDB(sqliteSQL) {
    let mariadbSQL = sqliteSQL;
    
    // Remplacer INTEGER PRIMARY KEY AUTOINCREMENT par INT AUTO_INCREMENT PRIMARY KEY
    mariadbSQL = mariadbSQL.replace(/INTEGER PRIMARY KEY AUTOINCREMENT/gi, 'INT AUTO_INCREMENT PRIMARY KEY');
    
    // Remplacer INTEGER par INT
    mariadbSQL = mariadbSQL.replace(/\bINTEGER\b/gi, 'INT');
    
    // Remplacer TEXT par TEXT
    mariadbSQL = mariadbSQL.replace(/\bTEXT\b/gi, 'TEXT');
    
    // Remplacer BOOLEAN par TINYINT(1)
    mariadbSQL = mariadbSQL.replace(/\bBOOLEAN\b/gi, 'TINYINT(1)');
    
    // Remplacer DATETIME par DATETIME
    mariadbSQL = mariadbSQL.replace(/\bDATETIME\b/gi, 'DATETIME');
    
    // Remplacer VARCHAR par VARCHAR
    mariadbSQL = mariadbSQL.replace(/\bVARCHAR\b/gi, 'VARCHAR');
    
    // Ajouter ENGINE=InnoDB et charset
    if (!mariadbSQL.includes('ENGINE=')) {
      mariadbSQL = mariadbSQL.replace(/;\s*$/, '') + ' ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;';
    }
    
    return mariadbSQL;
  }

  async createIndexes() {
    try {
      console.log('📇 Création des index...');
      
      // Obtenir les index SQLite
      const indexes = await this.sqliteDb.all(
        "SELECT name, sql FROM sqlite_master WHERE type='index' AND name NOT LIKE 'sqlite_%' AND sql IS NOT NULL"
      );
      
      for (const index of indexes) {
        try {
          let indexSQL = index.sql;
          // Adapter le SQL d'index pour MariaDB si nécessaire
          await this.mariadbConn.execute(indexSQL);
          console.log(`   ✅ Index ${index.name} créé`);
        } catch (error) {
          console.log(`   ⚠️ Index ${index.name} ignoré: ${error.message}`);
        }
      }
    } catch (error) {
      console.error('❌ Erreur création index:', error);
    }
  }

  async migrateAllData() {
    try {
      console.log('📊 Migration de toutes les données...');
      
      // Obtenir la liste des tables
      const tables = await this.sqliteDb.all(
        "SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%'"
      );
      
      for (const table of tables) {
        await this.migrateTableData(table.name);
      }
      
    } catch (error) {
      console.error('❌ Erreur migration données:', error);
      throw error;
    }
  }

  async migrateTableData(tableName) {
    try {
      console.log(`   📋 Migration table ${tableName}...`);
      
      // Récupérer les données SQLite
      const rows = await this.sqliteDb.all(`SELECT * FROM ${tableName}`);
      
      if (rows.length === 0) {
        console.log(`   ℹ️ Table ${tableName} vide`);
        return;
      }
      
      // Obtenir la structure de la table
      const [columns] = await this.mariadbConn.execute(`DESCRIBE ${tableName}`);
      const columnNames = columns.map(col => col.Field);
      
      // Préparer la requête d'insertion
      const placeholders = columnNames.map(() => '?').join(', ');
      const sql = `INSERT INTO ${tableName} (${columnNames.join(', ')}) VALUES (${placeholders})`;
      
      // Insérer les données
      for (const row of rows) {
        const values = columnNames.map(col => row[col] || null);
        await this.mariadbConn.execute(sql, values);
      }
      
      console.log(`   ✅ ${rows.length} enregistrements migrés pour ${tableName}`);
      
    } catch (error) {
      console.error(`   ❌ Erreur migration ${tableName}:`, error.message);
    }
  }

  async recreate() {
    try {
      console.log('🚀 Recréation complète de la structure MariaDB');
      console.log('=' .repeat(60));

      await this.initialize();
      await this.dropAllTables();
      await this.createTablesFromSQLite();
      await this.migrateAllData();

      console.log('=' .repeat(60));
      console.log('✅ Recréation terminée avec succès!');
      
      // Vérification finale
      const [tableCount] = await this.mariadbConn.execute(
        "SELECT COUNT(*) as count FROM information_schema.tables WHERE table_schema = ?",
        [this.mariadbConfig.database]
      );
      console.log(`📊 Tables créées: ${tableCount[0].count}`);
      
      const [userCount] = await this.mariadbConn.execute('SELECT COUNT(*) as count FROM users');
      console.log(`👥 Utilisateurs migrés: ${userCount[0].count}`);
      
    } catch (error) {
      console.error('❌ Erreur recréation:', error);
    } finally {
      if (this.sqliteDb) await this.sqliteDb.close();
      if (this.mariadbConn) await this.mariadbConn.end();
    }
  }
}

// Exécuter la recréation
const recreator = new MariaDBStructureRecreator();
recreator.recreate();