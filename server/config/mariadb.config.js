/**
 * Configuration MariaDB pour Fusepoint Platform
 * Migration de SQLite vers MariaDB
 */

const mariadb = require('mariadb');

class MariaDBConfig {
  constructor() {
    this.config = {
      host: process.env.MARIADB_HOST || 'localhost',
      port: process.env.MARIADB_PORT || 3306,
      user: process.env.MARIADB_USER || 'oliveirasamuel',
      password: process.env.MARIADB_PASSWORD || '',
      database: process.env.MARIADB_DATABASE || 'fusepoint_db',
      connectionLimit: 10,
      charset: 'utf8mb4',
      collation: 'utf8mb4_unicode_ci'
    };
    
    this.pool = null;
  }

  /**
   * Créer le pool de connexions
   */
  async createPool() {
    try {
      this.pool = mariadb.createPool(this.config);
      console.log('✅ Pool de connexions MariaDB créé');
      return this.pool;
    } catch (error) {
      console.error('❌ Erreur création pool MariaDB:', error);
      throw error;
    }
  }

  /**
   * Obtenir une connexion
   */
  async getConnection() {
    try {
      if (!this.pool) {
        await this.createPool();
      }
      const conn = await this.pool.getConnection();
      console.log('🔗 Connexion MariaDB obtenue');
      return conn;
    } catch (error) {
      console.error('❌ Erreur connexion MariaDB:', error);
      throw error;
    }
  }

  /**
   * Tester la connexion
   */
  async testConnection() {
    let conn;
    try {
      conn = await this.getConnection();
      const result = await conn.query('SELECT 1 as test');
      console.log('✅ Test connexion MariaDB réussi:', result);
      return true;
    } catch (error) {
      console.error('❌ Test connexion MariaDB échoué:', error);
      return false;
    } finally {
      if (conn) conn.release();
    }
  }

  /**
   * Fermer le pool
   */
  async closePool() {
    if (this.pool) {
      await this.pool.end();
      console.log('🔒 Pool MariaDB fermé');
    }
  }
}

module.exports = MariaDBConfig;