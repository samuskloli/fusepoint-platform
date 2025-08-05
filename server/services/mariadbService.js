/**
 * Service de base de données MariaDB pour Fusepoint Platform
 * Remplace le service SQLite pour une meilleure performance et scalabilité
 */

const mysql = require('mysql2/promise');
const bcrypt = require('bcrypt');
const crypto = require('crypto');
const EmailService = require('./emailService');
const emailService = new EmailService();
const path = require('path');
const fs = require('fs');

class MariaDBService {
  constructor() {
    this.pool = null;
    this.encryptionKey = process.env.DB_ENCRYPTION_KEY || this.generateEncryptionKey();
    this.config = this.loadMariaDBConfig();
  }

  loadMariaDBConfig() {
    // Charger la configuration depuis .env.mariadb
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

    return {
      host: process.env.MARIADB_HOST || 'localhost',
      port: parseInt(process.env.MARIADB_PORT) || 3306,
      user: process.env.MARIADB_USER || 'oliveirasamuel',
      password: process.env.MARIADB_PASSWORD || '',
      database: process.env.MARIADB_DATABASE || 'fusepoint_db',
      connectionLimit: 10,

      charset: 'utf8mb4'
    };
  }

  generateEncryptionKey() {
    return crypto.randomBytes(32).toString('hex');
  }

  async initialize() {
    try {
      this.pool = mysql.createPool(this.config);
      
      // Tester la connexion
      const connection = await this.pool.getConnection();
      await connection.ping();
      connection.release();
      
      console.log('✅ Service MariaDB initialisé avec succès');
      return true;
    } catch (error) {
      console.error('❌ Erreur initialisation MariaDB:', error);
      throw error;
    }
  }

  /**
   * Obtenir une connexion
   */
  async getConnection() {
    try {
      if (!this.pool) {
        await this.initialize();
      }
      return await this.pool.getConnection();
    } catch (error) {
      console.error('❌ Erreur obtention connexion:', error);
      throw error;
    }
  }

  /**
   * Exécuter une requête
   */
  async query(sql, params = []) {
    let conn;
    try {
      conn = await this.getConnection();
      const [rows] = await conn.query(sql, params);
      return rows;
    } catch (error) {
      console.error('❌ Erreur requête MariaDB:', error);
      throw error;
    } finally {
      if (conn) conn.release();
    }
  }

  /**
   * Exécuter une requête et retourner un seul résultat
   */
  async get(sql, params = []) {
    const results = await this.query(sql, params);
    return results.length > 0 ? results[0] : null;
  }

  /**
   * Exécuter une requête et retourner tous les résultats
   */
  async all(sql, params = []) {
    return await this.query(sql, params);
  }

  /**
   * Exécuter une requête de mise à jour/insertion
   */
  async run(sql, params = []) {
    let conn;
    try {
      conn = await this.getConnection();
      const [result] = await conn.query(sql, params);
      return {
        lastID: result.insertId,
        changes: result.affectedRows
      };
    } catch (error) {
      console.error('❌ Erreur requête run MariaDB:', error);
      throw error;
    } finally {
      if (conn) conn.release();
    }
  }

  // ===== MÉTHODES D'AUTHENTIFICATION =====

  /**
   * Créer un utilisateur
   */
  async createUser(userData) {
    try {
      const {
        email,
        password,
        firstName,
        lastName,
        phone,
        role = 'user',
        agentId = null,
        companyId = null
      } = userData;

      // Hasher le mot de passe si fourni
      let passwordHash = null;
      if (password) {
        passwordHash = await bcrypt.hash(password, 12);
      }

      // Générer un token de première connexion si pas de mot de passe
      let firstLoginToken = null;
      if (!password) {
        firstLoginToken = crypto.randomBytes(32).toString('hex');
      }

      // Générer un token de confirmation pour tous les nouveaux utilisateurs
      const confirmationToken = this.generateToken();
      const tokenExpiry = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 heures
      const tokenExpiryFormatted = tokenExpiry.toISOString().slice(0, 19).replace('T', ' '); // Format MySQL DATETIME

      const sql = `
        INSERT INTO users (
          email, password_hash, first_name, last_name, phone, 
          role, agent_id, company_id, first_login_token,
          confirmation_token, token_expiry, is_active,
          created_at, updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 0, NOW(), NOW())
      `;

      const result = await this.run(sql, [
        email, passwordHash, firstName, lastName, phone,
        role, agentId, companyId, firstLoginToken,
        confirmationToken, tokenExpiryFormatted
      ]);

      // Envoyer l'email de confirmation
      try {
  
        await emailService.sendAccountConfirmation(email, firstName, confirmationToken);
        console.log(`✅ Email de confirmation envoyé à ${email}`);
      } catch (emailError) {
        console.error('❌ Erreur envoi email de confirmation:', emailError);
        // Ne pas faire échouer la création si l'email échoue
      }

      return {
        id: result.lastID,
        email,
        firstName,
        lastName,
        role,
        firstLoginToken,
        confirmationToken
      };
    } catch (error) {
      console.error('❌ Erreur création utilisateur:', error);
      throw error;
    }
  }

  /**
   * Trouver un utilisateur par email
   */
  async findUserByEmail(email) {
    try {
      const sql = 'SELECT * FROM users WHERE email = ?';
      return await this.get(sql, [email]);
    } catch (error) {
      console.error('❌ Erreur recherche utilisateur:', error);
      throw error;
    }
  }

  /**
   * Trouver un utilisateur par ID
   */
  async findUserById(id) {
    try {
      const sql = 'SELECT * FROM users WHERE id = ?';
      return await this.get(sql, [id]);
    } catch (error) {
      console.error('❌ Erreur recherche utilisateur par ID:', error);
      throw error;
    }
  }

  /**
   * Alias pour findUserById (compatibilité)
   */
  async getUserById(id) {
    return await this.findUserById(id);
  }

  /**
   * Mettre à jour un utilisateur
   */
  async updateUser(id, updates) {
    try {
      const fields = [];
      const values = [];

      Object.keys(updates).forEach(key => {
        if (updates[key] !== undefined) {
          fields.push(`${key} = ?`);
          values.push(updates[key]);
        }
      });

      if (fields.length === 0) {
        throw new Error('Aucune mise à jour fournie');
      }

      fields.push('updated_at = NOW()');
      values.push(id);

      const sql = `UPDATE users SET ${fields.join(', ')} WHERE id = ?`;
      return await this.run(sql, values);
    } catch (error) {
      console.error('❌ Erreur mise à jour utilisateur:', error);
      throw error;
    }
  }

  /**
   * Vérifier un mot de passe
   */
  async verifyPassword(plainPassword, hashedPassword) {
    try {
      return await bcrypt.compare(plainPassword, hashedPassword);
    } catch (error) {
      console.error('❌ Erreur vérification mot de passe:', error);
      return false;
    }
  }

  // ===== MÉTHODES POUR LES ENTREPRISES =====

  /**
   * Créer une entreprise
   */
  async createCompany(companyData) {
    try {
      const { name, description, website, industry, size } = companyData;
      
      const sql = `
        INSERT INTO companies (name, description, website, industry, size, created_at, updated_at)
        VALUES (?, ?, ?, ?, ?, NOW(), NOW())
      `;
      
      const result = await this.run(sql, [name, description, website, industry, size]);
      
      return {
        id: result.lastID,
        name,
        description,
        website,
        industry,
        size
      };
    } catch (error) {
      console.error('❌ Erreur création entreprise:', error);
      throw error;
    }
  }

  /**
   * Obtenir toutes les entreprises
   */
  async getAllCompanies() {
    try {
      const sql = 'SELECT * FROM companies ORDER BY name';
      return await this.all(sql);
    } catch (error) {
      console.error('❌ Erreur récupération entreprises:', error);
      throw error;
    }
  }

  /**
   * Obtenir les entreprises d'un utilisateur
   */
  async getUserCompanies(userId) {
    try {
      const sql = `
        SELECT c.* FROM companies c
        INNER JOIN user_companies uc ON c.id = uc.company_id
        WHERE uc.user_id = ?
        ORDER BY c.name
      `;
      return await this.all(sql, [userId]);
    } catch (error) {
      console.error('❌ Erreur récupération entreprises utilisateur:', error);
      // Retourner un tableau vide en cas d'erreur plutôt que de faire planter l'application
      return [];
    }
  }

  // ===== MÉTHODES POUR LES NOTIFICATIONS =====

  /**
   * Créer une notification
   */
  async createNotification(notificationData) {
    try {
      const { userId, title, message, type = 'info' } = notificationData;
      
      const sql = `
        INSERT INTO notifications (user_id, title, message, type, created_at)
        VALUES (?, ?, ?, ?, NOW())
      `;
      
      const result = await this.run(sql, [userId, title, message, type]);
      
      return {
        id: result.lastID,
        userId,
        title,
        message,
        type
      };
    } catch (error) {
      console.error('❌ Erreur création notification:', error);
      throw error;
    }
  }

  /**
   * Obtenir les notifications d'un utilisateur
   */
  async getUserNotifications(userId, limit = 50) {
    try {
      const sql = `
        SELECT * FROM notifications 
        WHERE user_id = ? 
        ORDER BY created_at DESC 
        LIMIT ?
      `;
      return await this.all(sql, [userId, limit]);
    } catch (error) {
      console.error('❌ Erreur récupération notifications:', error);
      throw error;
    }
  }

  // ===== MÉTHODES POUR LES TOKENS =====

  /**
   * Générer un token sécurisé
   */
  generateToken() {
    return crypto.randomBytes(32).toString('hex');
  }

  /**
   * Générer un token de réinitialisation de mot de passe
   */
  async generatePasswordResetToken(email) {
    try {
      // Vérifier si l'utilisateur existe
      const user = await this.get('SELECT * FROM users WHERE email = ?', [email]);
      
      if (!user) {
        throw new Error('Aucun compte trouvé avec cet email');
      }

      // Générer le token et définir l'expiration (1 heure)
      const resetToken = this.generateToken();
      const tokenExpiry = new Date(Date.now() + 60 * 60 * 1000); // 1 heure
      const tokenExpiryFormatted = tokenExpiry.toISOString().slice(0, 19).replace('T', ' '); // Format MySQL DATETIME

      // Mettre à jour l'utilisateur avec le token
      await this.run(
        'UPDATE users SET reset_token = ?, token_expiry = ? WHERE id = ?',
        [resetToken, tokenExpiryFormatted, user.id]
      );

      // Envoyer l'email de réinitialisation
      try {
  
        await emailService.sendPasswordReset(email, user.first_name, resetToken);
        console.log(`✅ Email de réinitialisation envoyé à ${email}`);
      } catch (emailError) {
        console.error('❌ Erreur envoi email de réinitialisation:', emailError);
        // Ne pas faire échouer la génération du token si l'email échoue
      }

      return {
        success: true,
        message: 'Un email de réinitialisation a été envoyé si le compte existe'
      };
    } catch (error) {
      console.error('❌ Erreur génération token de réinitialisation:', error);
      throw error;
    }
  }

  /**
   * Réinitialiser le mot de passe avec un token
   */
  async resetPassword(token, newPassword) {
    try {
      // Vérifier le token et sa validité
      const currentTime = new Date().toISOString().slice(0, 19).replace('T', ' ');
      const user = await this.get(
        'SELECT * FROM users WHERE reset_token = ? AND token_expiry > ?',
        [token, currentTime]
      );

      if (!user) {
        throw new Error('Token de réinitialisation invalide ou expiré');
      }

      // Hasher le nouveau mot de passe
      const passwordHash = await bcrypt.hash(newPassword, 12);

      // Mettre à jour le mot de passe et supprimer le token
      await this.run(
        'UPDATE users SET password_hash = ?, reset_token = NULL, token_expiry = NULL, updated_at = NOW() WHERE id = ?',
        [passwordHash, user.id]
      );

      console.log(`✅ Mot de passe réinitialisé pour l'utilisateur ${user.email}`);

      return {
        success: true,
        message: 'Mot de passe réinitialisé avec succès'
      };
    } catch (error) {
      console.error('❌ Erreur réinitialisation mot de passe:', error);
      throw error;
    }
  }

  /**
   * Confirmer un compte utilisateur
   */
  async confirmUserAccount(token) {
    try {
      // Vérifier le token et sa validité
      const currentTime = new Date().toISOString().slice(0, 19).replace('T', ' ');
      const user = await this.get(
        'SELECT * FROM users WHERE confirmation_token = ? AND token_expiry > ?',
        [token, currentTime]
      );

      if (!user) {
        throw new Error('Token de confirmation invalide ou expiré');
      }

      if (user.is_active) {
        throw new Error('Ce compte est déjà activé');
      }

      // Activer le compte et supprimer seulement le token de confirmation
      await this.run(
        'UPDATE users SET is_active = 1, confirmation_token = NULL, updated_at = NOW() WHERE id = ?',
        [user.id]
      );

      console.log(`✅ Compte confirmé pour l'utilisateur ${user.email}`);

      return {
        success: true,
        message: 'Compte confirmé avec succès',
        user: {
          id: user.id,
          email: user.email,
          firstName: user.first_name,
          lastName: user.last_name
        }
      };
    } catch (error) {
      console.error('❌ Erreur confirmation de compte:', error);
      throw error;
    }
  }

  /**
   * Obtenir un utilisateur par email
   */
  async getUserByEmail(email) {
    return await this.findUserByEmail(email);
  }

  /**
   * Hasher un mot de passe
   */
  async hashPassword(password) {
    return await bcrypt.hash(password, 12);
  }

  // ===== MÉTHODES UTILITAIRES =====

  /**
   * Générer une clé de chiffrement
   */
  generateEncryptionKey() {
    const key = crypto.randomBytes(32).toString('hex');
    console.log('🔑 Clé de chiffrement générée. Ajoutez DB_ENCRYPTION_KEY à votre .env');
    return key;
  }

  /**
   * Chiffrer des données
   */
  encrypt(text) {
    try {
      const iv = crypto.randomBytes(16);
      const cipher = crypto.createCipher('aes-256-cbc', this.encryptionKey);
      let encrypted = cipher.update(text, 'utf8', 'hex');
      encrypted += cipher.final('hex');
      return iv.toString('hex') + ':' + encrypted;
    } catch (error) {
      console.error('❌ Erreur chiffrement:', error);
      throw error;
    }
  }

  /**
   * Déchiffrer des données
   */
  decrypt(encryptedText) {
    try {
      const parts = encryptedText.split(':');
      const iv = Buffer.from(parts[0], 'hex');
      const encrypted = parts[1];
      const decipher = crypto.createDecipher('aes-256-cbc', this.encryptionKey);
      let decrypted = decipher.update(encrypted, 'hex', 'utf8');
      decrypted += decipher.final('utf8');
      return decrypted;
    } catch (error) {
      console.error('❌ Erreur déchiffrement:', error);
      throw error;
    }
  }

  /**
   * Fermer les connexions
   */
  async close() {
    try {
      if (this.pool && this.pool._pool && !this.pool._pool._closed) {
        await this.pool.end();
        console.log('🔒 Pool MariaDB fermé');
      }
    } catch (error) {
      console.error('❌ Erreur fermeture pool:', error);
    } finally {
      // Toujours marquer le pool comme fermé
      this.pool = null;
    }
  }

  /**
   * Obtenir des statistiques de la base de données
   */
  async getStats() {
    try {
      const stats = {};
      
      // Compter les utilisateurs
      const userCount = await this.get('SELECT COUNT(*) as count FROM users');
      stats.users = userCount.count;
      
      // Compter les entreprises
      const companyCount = await this.get('SELECT COUNT(*) as count FROM companies');
      stats.companies = companyCount.count;
      
      // Compter les notifications
      const notificationCount = await this.get('SELECT COUNT(*) as count FROM notifications');
      stats.notifications = notificationCount.count;
      
      return stats;
    } catch (error) {
      console.error('❌ Erreur récupération statistiques:', error);
      throw error;
    }
  }
}

module.exports = MariaDBService;