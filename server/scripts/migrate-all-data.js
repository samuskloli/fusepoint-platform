/**
 * Script pour migrer toutes les données de SQLite vers MariaDB
 * Migre toutes les tables avec leurs données
 */

const sqlite3 = require('sqlite3').verbose();
const { open } = require('sqlite');
const mysql = require('mysql2/promise');
const path = require('path');
const fs = require('fs');

class CompleteDataMigrator {
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

  async getTableList() {
    const tables = await this.sqliteDb.all(
      "SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%'"
    );
    return tables.map(t => t.name);
  }

  async checkTableExists(tableName) {
    try {
      const [result] = await this.mariadbConn.execute(
        "SELECT COUNT(*) as count FROM information_schema.tables WHERE table_schema = ? AND table_name = ?",
        [this.mariadbConfig.database, tableName]
      );
      return result[0].count > 0;
    } catch (error) {
      return false;
    }
  }

  async getTableStructure(tableName) {
    try {
      const [columns] = await this.mariadbConn.execute(`DESCRIBE ${tableName}`);
      return columns.map(col => col.Field);
    } catch (error) {
      console.error(`❌ Erreur structure table ${tableName}:`, error.message);
      return [];
    }
  }

  async migrateTableData(tableName) {
    try {
      console.log(`📋 Migration table ${tableName}...`);
      
      // Vérifier si la table existe dans MariaDB
      const tableExists = await this.checkTableExists(tableName);
      if (!tableExists) {
        console.log(`   ⚠️ Table ${tableName} n'existe pas dans MariaDB - ignorée`);
        return;
      }
      
      // Récupérer les données SQLite
      const rows = await this.sqliteDb.all(`SELECT * FROM ${tableName}`);
      
      if (rows.length === 0) {
        console.log(`   ℹ️ Table ${tableName} vide`);
        return;
      }
      
      // Obtenir la structure de la table MariaDB
      const mariadbColumns = await this.getTableStructure(tableName);
      if (mariadbColumns.length === 0) {
        console.log(`   ❌ Impossible d'obtenir la structure de ${tableName}`);
        return;
      }
      
      // Vider la table avant migration
      await this.mariadbConn.execute(`DELETE FROM ${tableName}`);
      console.log(`   🗑️ Table ${tableName} vidée`);
      
      // Préparer la requête d'insertion
      const placeholders = mariadbColumns.map(() => '?').join(', ');
      const sql = `INSERT INTO ${tableName} (${mariadbColumns.join(', ')}) VALUES (${placeholders})`;
      
      // Insérer les données
      let migratedCount = 0;
      for (const row of rows) {
        try {
          const values = mariadbColumns.map(col => {
            let value = row[col];
            // Conversion des valeurs booléennes
            if (typeof value === 'boolean') {
              value = value ? 1 : 0;
            }
            return value !== undefined ? value : null;
          });
          
          await this.mariadbConn.execute(sql, values);
          migratedCount++;
        } catch (error) {
          console.log(`   ⚠️ Erreur insertion ligne ${tableName}:`, error.message);
        }
      }
      
      console.log(`   ✅ ${migratedCount}/${rows.length} enregistrements migrés pour ${tableName}`);
      
    } catch (error) {
      console.error(`   ❌ Erreur migration ${tableName}:`, error.message);
    }
  }

  async migrateAllData() {
    try {
      console.log('🚀 Migration complète des données SQLite vers MariaDB');
      console.log('=' .repeat(60));

      await this.initialize();
      
      // Obtenir la liste des tables SQLite
      const tables = await this.getTableList();
      console.log(`📊 ${tables.length} tables trouvées dans SQLite:`);
      tables.forEach(table => console.log(`   - ${table}`));
      console.log('');
      
      // Migrer chaque table
      for (const tableName of tables) {
        await this.migrateTableData(tableName);
      }
      
      console.log('=' .repeat(60));
      console.log('✅ Migration complète terminée!');
      
      // Statistiques finales
      console.log('\n📊 Statistiques finales:');
      for (const tableName of ['users', 'companies', 'service_requests', 'notifications', 'messages']) {
        try {
          const [result] = await this.mariadbConn.execute(`SELECT COUNT(*) as count FROM ${tableName}`);
          console.log(`   - ${tableName}: ${result[0].count} enregistrements`);
        } catch (error) {
          console.log(`   - ${tableName}: table non trouvée`);
        }
      }
      
    } catch (error) {
      console.error('❌ Erreur migration complète:', error);
    } finally {
      if (this.sqliteDb) await this.sqliteDb.close();
      if (this.mariadbConn) await this.mariadbConn.end();
    }
  }
}

// Exécuter la migration complète
const migrator = new CompleteDataMigrator();
migrator.migrateAllData();