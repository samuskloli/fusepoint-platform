/**
 * Configuration MariaDB pour Fusepoint Platform
 * Migration de SQLite vers MariaDB
 */

const mariadb = require('mariadb');

class MariaDBConfig {
  constructor() {
    // Configuration pour MariaDB local
    this.config = {
      host: process.env.MARIADB_HOST || 'localhost',
      port: process.env.MARIADB_PORT || 3306,
      user: process.env.MARIADB_USER || 'fusepoint_db',
      password: process.env.MARIADB_PASSWORD || 'FusepointBD2025!',
      database: process.env.MARIADB_DATABASE || 'fusepoint_db',
      connectionLimit: 50, // Augmenté de 10 à 50
      acquireTimeout: 60000, // 60 secondes pour obtenir une connexion
      timeout: 60000, // 60 secondes de timeout pour les requêtes
      leakDetectionTimeout: 30000, // Détection des fuites de connexions
      charset: 'utf8mb4',
      collation: 'utf8mb4_unicode_ci',
      // Paramètres de gestion des connexions
      idleTimeout: 300000, // 5 minutes avant fermeture des connexions inactives
      minimumIdle: 5, // Minimum de connexions à maintenir
      resetAfterUse: true, // Réinitialiser les connexions après usage
      bigIntAsNumber: true // Forcer la conversion des BIGINT en Number pour JSON
    };
    
    this.pool = null;

    // Instrumentation du pool
    this.poolStats = {
      createdAt: null,
      acquired: 0,
      released: 0,
      errors: 0,
      inUse: 0,
      pendingRequests: 0,
      lastAcquireAt: null,
      lastReleaseAt: null
    };
  }

  /**
   * Créer le pool de connexions
   */
  async createPool() {
    try {
      this.pool = mariadb.createPool(this.config);
      this.poolStats.createdAt = Date.now();
      console.log('✅ Pool de connexions MariaDB créé');
      return this.pool;
    } catch (error) {
      this.poolStats.errors += 1;
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
      // Suivi des demandes en attente
      this.poolStats.pendingRequests += 1;
      const conn = await this.pool.getConnection();
      this.poolStats.pendingRequests = Math.max(0, this.poolStats.pendingRequests - 1);

      // Mise à jour des stats d'acquisition
      this.poolStats.acquired += 1;
      this.poolStats.inUse += 1;
      this.poolStats.lastAcquireAt = Date.now();

      // Monkey-patch release pour comptabiliser systématiquement les libérations
      const originalRelease = conn.release.bind(conn);
      conn.release = () => {
        try {
          this.poolStats.released += 1;
          this.poolStats.inUse = Math.max(0, this.poolStats.inUse - 1);
          this.poolStats.lastReleaseAt = Date.now();
        } catch (e) {
          // Ignorer erreurs de stats
        }
        return originalRelease();
      };

      console.log('🔗 Connexion MariaDB obtenue');
      return conn;
    } catch (error) {
      this.poolStats.pendingRequests = Math.max(0, this.poolStats.pendingRequests - 1);
      this.poolStats.errors += 1;
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
      this.poolStats.errors += 1;
      console.error('❌ Test connexion MariaDB échoué:', error);
      return false;
    } finally {
      if (conn) conn.release();
    }
  }

  /**
   * Statistiques du pool de connexions
   */
  getPoolStats() {
    return {
      poolCreated: !!this.pool,
      connectionLimit: Number(this.config.connectionLimit) || null,
      createdAt: this.poolStats.createdAt,
      acquired: this.poolStats.acquired,
      released: this.poolStats.released,
      inUse: this.poolStats.inUse,
      pendingRequests: this.poolStats.pendingRequests,
      errors: this.poolStats.errors,
      lastAcquireAt: this.poolStats.lastAcquireAt,
      lastReleaseAt: this.poolStats.lastReleaseAt
    };
  }

  /**
   * Fermer le pool
   */
  async closePool() {
    if (this.pool) {
      await this.pool.end();
      console.log('🔒 Pool MariaDB fermé');
      this.pool = null;
    }
  }
}

module.exports = MariaDBConfig;