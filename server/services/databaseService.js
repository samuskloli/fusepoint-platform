const MariaDBConfig = require('../config/mariadb.config');
const bcrypt = require('bcryptjs');
const crypto = require('node:crypto');
const path = require('path');
const fs = require('fs');

/**
 * Service de base de données sécurisé avec MariaDB
 * Gère l'authentification, le chiffrement et l'accès aux données
 */
class DatabaseService {
  constructor() {
    this.mariadb = new MariaDBConfig();
    this.pool = null;
    this.encryptionKey = process.env.DB_ENCRYPTION_KEY || this.generateEncryptionKey();
    this.schemaPath = path.join(__dirname, '../database/schema.sql');
    this.agentSchemaPath = path.join(__dirname, '../database/agent_schema_simple.sql');
    this.prestataireSchemaPath = path.join(__dirname, '../database/prestataire_schema.sql');
    this.clientProjectsSchemaPath = path.join(__dirname, '../database/client_projects_schema.sql');
    this.agentClientsSchemaPath = path.join(__dirname, '../database/agent_clients_schema.sql');
  }

  /**
   * Initialiser la base de données MariaDB
   */
  async initialize() {
    try {
      // Créer le pool de connexions MariaDB
      this.pool = await this.mariadb.createPool();
      
      // Tester la connexion
      const isConnected = await this.mariadb.testConnection();
      if (!isConnected) {
        throw new Error('Impossible de se connecter à MariaDB');
      }

      // Créer les tables si elles n'existent pas
      await this.createTables();

      console.log('✅ Base de données MariaDB initialisée avec succès');
      return true;
    } catch (error) {
      console.error('❌ Erreur initialisation base de données MariaDB:', error);
      throw error;
    }
  }

  /**
   * Créer les tables à partir du schema pour MariaDB
   */
  async createTables() {
    let conn;
    try {
      conn = await this.mariadb.getConnection();
      
      // Créer les tables principales
      if (fs.existsSync(this.schemaPath)) {
        const schema = fs.readFileSync(this.schemaPath, 'utf8');
        // Adapter le schema SQLite vers MariaDB
        const mariadbSchema = this.adaptSchemaToMariaDB(schema);
        await this.executeMultipleQueries(conn, mariadbSchema);
        console.log('📊 Tables principales créées avec succès');
      } else {
        console.warn('⚠️ Fichier schema.sql non trouvé');
      }

      // Créer les tables pour les agents
      if (fs.existsSync(this.agentSchemaPath)) {
        const agentSchema = fs.readFileSync(this.agentSchemaPath, 'utf8');
        const mariadbAgentSchema = this.adaptSchemaToMariaDB(agentSchema);
        await this.executeMultipleQueries(conn, mariadbAgentSchema);
        console.log('🤖 Tables agent créées avec succès');
      } else {
        console.warn('⚠️ Fichier agent_schema_simple.sql non trouvé');
      }

      // Créer les tables pour les prestataires
      if (fs.existsSync(this.prestataireSchemaPath)) {
        const prestataireSchema = fs.readFileSync(this.prestataireSchemaPath, 'utf8');
        const mariadbPrestataireSchema = this.adaptSchemaToMariaDB(prestataireSchema);
        await this.executeMultipleQueries(conn, mariadbPrestataireSchema);
        console.log('👥 Tables prestataire créées avec succès');
      } else {
        console.warn('⚠️ Fichier prestataire_schema.sql non trouvé');
      }

      // Créer la table agent_clients
      if (fs.existsSync(this.agentClientsSchemaPath)) {
        const agentClientsSchema = fs.readFileSync(this.agentClientsSchemaPath, 'utf8');
        const mariadbAgentClientsSchema = this.adaptSchemaToMariaDB(agentClientsSchema);
        await this.executeMultipleQueries(conn, mariadbAgentClientsSchema);
        console.log('🔗 Table agent_clients créée avec succès');
      } else {
        console.warn('⚠️ Fichier agent_clients_schema.sql non trouvé');
      }

      console.log('✅ Toutes les tables MariaDB créées avec succès');
    } catch (error) {
      console.error('❌ Erreur création tables MariaDB:', error);
      throw error;
    } finally {
      if (conn) conn.release();
    }
  }

  /**
   * Adapter un schéma SQLite vers MariaDB
   */
  adaptSchemaToMariaDB(sqliteSchema) {
    let mariadbSchema = sqliteSchema;
    
    // Remplacer INTEGER PRIMARY KEY AUTOINCREMENT par INT AUTO_INCREMENT PRIMARY KEY
    mariadbSchema = mariadbSchema.replace(/INTEGER PRIMARY KEY AUTOINCREMENT/gi, 'INT AUTO_INCREMENT PRIMARY KEY');
    
    // Remplacer BOOLEAN par TINYINT(1)
    mariadbSchema = mariadbSchema.replace(/BOOLEAN/gi, 'TINYINT(1)');
    
    // Remplacer DATETIME par TIMESTAMP
    mariadbSchema = mariadbSchema.replace(/DATETIME/gi, 'TIMESTAMP');
    
    // Remplacer CURRENT_TIMESTAMP par NOW()
    mariadbSchema = mariadbSchema.replace(/DEFAULT CURRENT_TIMESTAMP/gi, 'DEFAULT CURRENT_TIMESTAMP');
    
    // Remplacer TEXT par LONGTEXT pour les champs longs
    mariadbSchema = mariadbSchema.replace(/TEXT/gi, 'LONGTEXT');
    
    // Ajouter IF NOT EXISTS seulement si pas déjà présent
    mariadbSchema = mariadbSchema.replace(/CREATE TABLE (?!IF NOT EXISTS)([^\s]+)/gi, 'CREATE TABLE IF NOT EXISTS $1');
    
    return mariadbSchema;
  }

  /**
   * Exécuter plusieurs requêtes SQL
   */
  async executeMultipleQueries(conn, sqlScript) {
    const queries = sqlScript.split(';').filter(query => query.trim().length > 0);
    
    for (const query of queries) {
      const trimmedQuery = query.trim();
      if (trimmedQuery) {
        try {
          await conn.query(trimmedQuery);
        } catch (error) {
          // Ignorer les erreurs de table déjà existante
          if (!error.message.includes('already exists')) {
            console.warn('⚠️ Erreur requête SQL:', trimmedQuery, error.message);
          }
        }
      }
    }
  }

  /**
   * Obtenir une connexion MariaDB
   */
  async getConnection() {
    return await this.mariadb.getConnection();
  }

  /**
   * Générer une clé de chiffrement
   */
  generateEncryptionKey() {
    const key = crypto.randomBytes(32).toString('hex');
    console.log('🔑 Clé de chiffrement générée. Ajoutez DB_ENCRYPTION_KEY à votre .env');
    return key;
  }

  /**
   * Chiffrer des données sensibles
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
      const textParts = encryptedText.split(':');
      const iv = Buffer.from(textParts.shift(), 'hex');
      const encryptedData = textParts.join(':');
      const decipher = crypto.createDecipher('aes-256-cbc', this.encryptionKey);
      let decrypted = decipher.update(encryptedData, 'hex', 'utf8');
      decrypted += decipher.final('utf8');
      return decrypted;
    } catch (error) {
      console.error('❌ Erreur déchiffrement:', error);
      throw error;
    }
  }

  /**
   * Hacher un mot de passe
   */
  async hashPassword(password) {
    const saltRounds = 12;
    return await bcrypt.hash(password, saltRounds);
  }

  /**
   * Vérifier un mot de passe
   */
  async verifyPassword(password, hash) {
    try {
      return await bcrypt.compare(password, hash);
    } catch (error) {
      console.error('❌ Erreur vérification mot de passe:', error);
      return false;
    }
  }

  /**
   * Générer un token aléatoire
   */
  generateToken() {
    return require('crypto').randomBytes(32).toString('hex');
  }

  /**
   * Confirmer un compte utilisateur
   */
  async confirmUserAccount(token) {
    try {
      // Vérifier le token et sa validité
      const user = await this.get(
        'SELECT * FROM users WHERE confirmation_token = ? AND token_expiry > NOW()',
        [token]
      );

      if (!user) {
        throw new Error('Token de confirmation invalide ou expiré');
      }

      // Activer le compte et supprimer le token
      await this.run(
        'UPDATE users SET is_active = 1, confirmation_token = NULL, token_expiry = NULL WHERE id = ?',
        [user.id]
      );

      // Log d'audit
      await this.logAudit(companyId, userId, 'COMPANY_CREATED', 'companies', {
        name,
        industry
      });

      return {
        id: companyId,
        name,
        industry,
        size,
        location,
        website,
        description,
        createdAt: new Date().toISOString()
      };
    } catch (error) {
      console.error('❌ Erreur création entreprise:', error);
      throw error;
    }
  }

  /**
   * Récupérer un utilisateur par ID
   */
  async getUserById(userId) {
    let conn;
    try {
      conn = await this.getConnection();
      const result = await conn.query(
        'SELECT id, email, first_name, last_name, role, is_active, created_at, last_login, email_verified, onboarding_completed FROM users WHERE id = ?',
        [userId]
      );
      return result.length > 0 ? result[0] : null;
    } catch (error) {
      console.error('❌ Erreur récupération utilisateur par ID:', error);
      throw error;
    } finally {
      if (conn) conn.release();
    }
  }

  /**
   * Supprimer un utilisateur
   */
  async deleteUser(userId, deletedBy) {
    let conn;
    try {
      // Vérifier que l'utilisateur existe
      const user = await this.getUserById(userId);
      if (!user) {
        throw new Error('Utilisateur non trouvé');
      }

      conn = await this.getConnection();
      
      // Supprimer l'utilisateur
      const result = await conn.query(
        'DELETE FROM users WHERE id = ?',
        [userId]
      );

      if (result.affectedRows === 0) {
        throw new Error('Aucun utilisateur supprimé');
      }

      // Log de l'action
      await conn.query(
        `INSERT INTO system_logs (level, message, category, user_id, ip_address, user_agent, metadata, created_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, NOW())`,
        [
          'warning',
          `Utilisateur supprimé: ${user.email} (ID: ${userId})`,
          'user_management',
          deletedBy,
          null,
          null,
          JSON.stringify({ 
            deletedUserId: userId, 
            deletedUserEmail: user.email,
            action: 'user_delete' 
          })
        ]
      );

      return { 
        success: true, 
        message: 'Utilisateur supprimé avec succès',
        deletedUser: {
          id: userId,
          email: user.email,
          name: `${user.first_name} ${user.last_name}`
        }
      };
    } catch (error) {
      console.error('❌ Erreur suppression utilisateur:', error);
      throw error;
    } finally {
      if (conn) conn.release();
    }
  }

  /**
   * Log d'audit
      await this.logAudit(user.id, null, 'USER_CONFIRMED', 'users');

      // Envoyer l'email de bienvenue
      try {
        const EmailService = require('./emailService');
        const emailService = new EmailService();
        await emailService.sendWelcomeEmail(user.email, user.first_name);
        console.log(`✅ Email de bienvenue envoyé à ${user.email}`);
      } catch (emailError) {
        console.error('❌ Erreur envoi email de bienvenue:', emailError);
      }

      return {
        id: user.id,
        email: user.email,
        firstName: user.first_name,
        lastName: user.last_name,
        role: user.role
      };
    } catch (error) {
      console.error('❌ Erreur confirmation compte:', error);
      throw error;
    }
  }

  /**
   * Générer un token de réinitialisation de mot de passe
   */
  async generatePasswordResetToken(email) {
    try {
      const user = await this.getUserByEmail(email);
      if (!user) {
        throw new Error('Aucun compte trouvé avec cet email');
      }

      const resetToken = this.generateToken();
      const tokenExpiry = new Date(Date.now() + 60 * 60 * 1000); // 1 heure

      // Sauvegarder le token de réinitialisation
      await this.run(
        'UPDATE users SET reset_token = ?, reset_token_expiry = ? WHERE id = ?',
        [resetToken, tokenExpiry.toISOString(), user.id]
      );

      // Envoyer l'email de réinitialisation
      try {
        const EmailService = require('./emailService');
        const emailService = new EmailService();
        await emailService.sendPasswordReset(email, user.first_name, resetToken);
        console.log(`✅ Email de réinitialisation envoyé à ${email}`);
      } catch (emailError) {
        console.error('❌ Erreur envoi email de réinitialisation:', emailError);
        throw emailError;
      }

      return { message: 'Email de réinitialisation envoyé' };
    } catch (error) {
      console.error('❌ Erreur génération token de réinitialisation:', error);
      throw error;
    }
  }

  /**
   * Réinitialiser le mot de passe
   */
  async resetPassword(token, newPassword) {
    let conn;
    try {
      conn = await this.getConnection();
      
      // Vérifier le token et sa validité
      const result = await conn.query(
        'SELECT * FROM users WHERE reset_token = ? AND reset_token_expiry > NOW()',
        [token]
      );
      
      const user = result.length > 0 ? result[0] : null;
      if (!user) {
        throw new Error('Token de réinitialisation invalide ou expiré');
      }

      // Hacher le nouveau mot de passe
      const passwordHash = await this.hashPassword(newPassword);

      // Mettre à jour le mot de passe et supprimer le token
      await conn.query(
        'UPDATE users SET password_hash = ?, reset_token = NULL, reset_token_expiry = NULL WHERE id = ?',
        [passwordHash, user.id]
      );

      // Log d'audit
      await this.logAudit(user.id, null, 'PASSWORD_RESET', 'users');

      return { message: 'Mot de passe réinitialisé avec succès' };
    } catch (error) {
      console.error('❌ Erreur réinitialisation mot de passe:', error);
      throw error;
    } finally {
      if (conn) conn.release();
    }
  }

  /**
   * Créer un utilisateur
   */
  async createUser(userData, sendConfirmationEmail = true) {
    try {
      const { email, password, firstName, lastName, role = 'client' } = userData;
      
      // Vérifier si l'utilisateur existe déjà (actif ou inactif)
      const existingUser = await this.getUserByEmail(email, false);
      if (existingUser) {
        throw new Error('Un utilisateur avec cet email existe déjà');
      }

      // Hacher le mot de passe
      const passwordHash = await this.hashPassword(password);

      // Générer un token de confirmation
      const confirmationToken = this.generateToken();
      const tokenExpiry = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 heures

      let conn;
      try {
        conn = await this.getConnection();
        
        // Insérer l'utilisateur avec is_active = 0 (compte non confirmé)
        const result = await conn.query(
          `INSERT INTO users (email, password_hash, first_name, last_name, role, confirmation_token, token_expiry, is_active) 
           VALUES (?, ?, ?, ?, ?, ?, ?, 0)`,
          [email, passwordHash, firstName, lastName, role, confirmationToken, tokenExpiry.toISOString()]
        );

        // Log d'audit
        await this.logAudit(result.insertId, null, 'USER_CREATED', 'users', {
          email,
          role
        });

        const newUser = {
          id: result.insertId,
          email,
          firstName,
          lastName,
          role,
          confirmationToken,
          createdAt: new Date().toISOString()
        };
      } finally {
        if (conn) conn.release();
      }

      // Envoyer l'email de confirmation si demandé
      if (sendConfirmationEmail) {
        try {
          const EmailService = require('./emailService');
          const emailService = new EmailService();
          await emailService.sendAccountConfirmation(email, firstName, confirmationToken);
          console.log(`✅ Email de confirmation envoyé à ${email}`);
        } catch (emailError) {
          console.error('❌ Erreur envoi email de confirmation:', emailError);
          // Ne pas faire échouer la création du compte si l'email échoue
        }
      }

      return newUser;
    } catch (error) {
      console.error('❌ Erreur création utilisateur:', error);
      throw error;
    }
  }

  /**
   * Récupérer un utilisateur par email
   */
  async getUserByEmail(email, activeOnly = true) {
    let conn;
    try {
      conn = await this.getConnection();
      const whereClause = activeOnly ? 
        'SELECT * FROM users WHERE email = ? AND is_active = 1' :
        'SELECT * FROM users WHERE email = ?';
      
      const result = await conn.query(whereClause, [email]);
      return result.length > 0 ? result[0] : null;
    } catch (error) {
      console.error('❌ Erreur récupération utilisateur:', error);
      throw error;
    } finally {
      if (conn) conn.release();
    }
  }

  /**
   * Récupérer tous les utilisateurs avec pagination
   */
  async getAllUsers(options = {}) {
    let conn;
    try {
      const {
        limit = 50,
        offset = 0,
        role = null,
        activeOnly = true,
        search = null
      } = options;

      conn = await this.getConnection();
      let query = 'SELECT id, email, first_name, last_name, role, is_active, created_at, last_login FROM users';
      const params = [];
      const conditions = [];

      if (activeOnly) {
        conditions.push('is_active = 1');
      }

      if (role) {
        conditions.push('role = ?');
        params.push(role);
      }

      if (search) {
        conditions.push('(email LIKE ? OR first_name LIKE ? OR last_name LIKE ?)');
        const searchTerm = `%${search}%`;
        params.push(searchTerm, searchTerm, searchTerm);
      }

      if (conditions.length > 0) {
        query += ' WHERE ' + conditions.join(' AND ');
      }

      query += ' ORDER BY created_at DESC LIMIT ? OFFSET ?';
      params.push(limit, offset);

      const users = await conn.query(query, params);
      return users;
    } catch (error) {
      console.error('❌ Erreur récupération utilisateurs:', error);
      throw error;
    } finally {
      if (conn) conn.release();
    }
  }

  /**
   * Compter le nombre total d'utilisateurs
   */
  async getUsersCount(options = {}) {
    let conn;
    try {
      const {
        role = null,
        activeOnly = true,
        search = null
      } = options;

      conn = await this.getConnection();
      let query = 'SELECT COUNT(*) as count FROM users';
      const params = [];
      const conditions = [];

      if (activeOnly) {
        conditions.push('is_active = 1');
      }

      if (role) {
        conditions.push('role = ?');
        params.push(role);
      }

      if (search) {
        conditions.push('(email LIKE ? OR first_name LIKE ? OR last_name LIKE ?)');
        const searchTerm = `%${search}%`;
        params.push(searchTerm, searchTerm, searchTerm);
      }

      if (conditions.length > 0) {
        query += ' WHERE ' + conditions.join(' AND ');
      }

      const result = await conn.query(query, params);
      return result[0].count;
    } catch (error) {
      console.error('❌ Erreur comptage utilisateurs:', error);
      throw error;
    } finally {
      if (conn) conn.release();
    }
  }

  /**
   * Mettre à jour le rôle d'un utilisateur
   */
  async updateUserRole(userId, newRole, updatedBy) {
    let conn;
    try {
      conn = await this.getConnection();
      const result = await conn.query(
        'UPDATE users SET role = ?, updated_at = NOW() WHERE id = ?',
        [newRole, userId]
      );

      if (result.affectedRows === 0) {
        throw new Error('Utilisateur non trouvé');
      }

      // Log de l'action
      await conn.query(
        `INSERT INTO system_logs (level, message, category, user_id, ip_address, user_agent, metadata, created_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, NOW())`,
        [
          'info',
          `Rôle utilisateur modifié: ${userId} -> ${newRole}`,
          'user_management',
          updatedBy,
          null,
          null,
          JSON.stringify({ userId, newRole, action: 'role_update' })
        ]
      );

      return { success: true, message: 'Rôle mis à jour avec succès' };
    } catch (error) {
      console.error('❌ Erreur mise à jour rôle:', error);
      throw error;
    } finally {
      if (conn) conn.release();
    }
  }

  /**
   * Activer/désactiver un utilisateur
   */
  async updateUserStatus(userId, isActive, updatedBy) {
    try {
      const result = await this.run(
        'UPDATE users SET is_active = ?, updated_at = NOW() WHERE id = ?',
        [isActive ? 1 : 0, userId]
      );

      if (result.affectedRows === 0) {
        throw new Error('Utilisateur non trouvé');
      }

      // Log de l'action
      await this.run(
        `INSERT INTO system_logs (level, message, category, user_id, ip_address, user_agent, metadata, created_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, NOW())`,
        [
          'info',
          `Statut utilisateur modifié: ${userId} -> ${isActive ? 'actif' : 'inactif'}`,
          'user_management',
          updatedBy,
          null,
          null,
          JSON.stringify({ userId, isActive, action: 'status_update' })
        ]
      );

      return { success: true, message: 'Statut mis à jour avec succès' };
    } catch (error) {
      console.error('❌ Erreur mise à jour statut:', error);
      throw error;
    }
  }

  /**
   * Mettre à jour les informations d'un utilisateur
   */
  async updateUser(userId, userData, updatedBy) {
    try {
      const { first_name, last_name, email } = userData;
      
      // Construire la requête de mise à jour dynamiquement
      const updates = [];
      const values = [];
      
      if (first_name !== undefined) {
        updates.push('first_name = ?');
        values.push(first_name);
      }
      
      if (last_name !== undefined) {
        updates.push('last_name = ?');
        values.push(last_name);
      }
      
      if (email !== undefined) {
        updates.push('email = ?');
        values.push(email);
      }
      
      // Note: phone column removed from schema
      
      if (updates.length === 0) {
        throw new Error('Aucune donnée à mettre à jour');
      }
      
      // Ajouter la date de mise à jour
      updates.push('updated_at = NOW()');
      values.push(userId);
      
      const query = `UPDATE users SET ${updates.join(', ')} WHERE id = ?`;
      
      const result = await this.run(query, values);
      
      if (result.affectedRows === 0) {
        throw new Error('Utilisateur non trouvé');
      }
      
      // Log de l'action
      await this.run(
        `INSERT INTO system_logs (level, message, category, user_id, ip_address, user_agent, metadata, created_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, NOW())`,
        [
          'info',
          `Informations utilisateur mises à jour: ${userId}`,
          'user_management',
          updatedBy,
          null,
          null,
          JSON.stringify({ userId, updatedFields: Object.keys(userData) })
        ]
      );
      
      return {
        success: true,
        message: 'Informations utilisateur mises à jour avec succès'
      };
      
    } catch (error) {
      console.error('❌ Erreur mise à jour utilisateur:', error);
      throw error;
    }
  }

  /**
   * Récupérer toutes les entreprises
   */
  async getAllCompanies() {
    try {
      const companies = await this.query('SELECT * FROM companies ORDER BY name');
      return companies;
    } catch (error) {
      console.error('❌ Erreur récupération entreprises:', error);
      throw error;
    }
  }

  /**
   * Associer un utilisateur à une entreprise
   */
  async addUserToCompany(userId, companyId, role = 'user') {
    try {
      const result = await this.run(
        `INSERT INTO user_companies (user_id, company_id, role, created_at)
         VALUES (?, ?, ?, NOW()) ON DUPLICATE KEY UPDATE role = VALUES(role)`,
        [userId, companyId, role]
      );
      
      return { userId, companyId, role, id: result.insertId };
    } catch (error) {
      console.error('❌ Erreur association utilisateur-entreprise:', error);
      throw error;
    }
  }

  /**
   * Supprimer l'association utilisateur-entreprise
   */
  async removeUserFromCompany(userId, companyId) {
    try {
      const result = await this.run(
        'DELETE FROM user_companies WHERE user_id = ? AND company_id = ?',
        [userId, companyId]
      );
      
      return { changes: result.affectedRows };
    } catch (error) {
      console.error('❌ Erreur suppression association utilisateur-entreprise:', error);
      throw error;
    }
  }

  /**
   * Authentifier un utilisateur
   */
  async authenticateUser(email, password) {
    try {
      const user = await this.getUserByEmail(email);
      if (!user) {
        throw new Error('Compte inexistant');
      }

      const isValidPassword = await this.verifyPassword(password, user.password_hash);
      
      if (!isValidPassword) {
        console.log('❌ Mot de passe incorrect pour:', email);
        throw new Error('Mot de passe incorrect');
      }

      // Mettre à jour la dernière connexion
      await this.run(
        'UPDATE users SET last_login = CURRENT_TIMESTAMP WHERE id = ?',
        [user.id]
      );

      // Log d'audit
      await this.logAudit(user.id, null, 'USER_LOGIN', 'users');

      // Retourner les données utilisateur (sans le mot de passe)
      const { password_hash, ...userWithoutPassword } = user;
      return userWithoutPassword;
    } catch (error) {
      console.error('❌ Erreur authentification:', error);
      throw error;
    }
  }

  /**
   * Créer une entreprise
   */
  async createCompany(companyData, userId) {
    try {
      const { name, industry, size, location, website, description } = companyData;

      // Insérer l'entreprise
      const result = await this.run(
        `INSERT INTO companies (name, industry, size, location, website, description) 
         VALUES (?, ?, ?, ?, ?, ?)`,
        [name, industry, size, location, website, description]
      );

      const companyId = result.insertId;

      // Associer l'utilisateur à l'entreprise comme propriétaire
      await this.run(
        `INSERT INTO user_companies (user_id, company_id, role, permissions) 
         VALUES (?, ?, 'owner', ?)`,
        [userId, companyId, JSON.stringify({ admin: true, analytics: true, social: true, email: true })]
      );

      // Log d'audit
      await this.logAudit(userId, companyId, 'COMPANY_CREATED', 'companies', {
        name,
        industry
      });

      return {
        id: companyId,
        name,
        industry,
        size,
        location,
        website,
        description,
        createdAt: new Date().toISOString()
      };
    } catch (error) {
      console.error('❌ Erreur création entreprise:', error);
      throw error;
    }
  }

  /**
   * Mettre à jour le mot de passe d'un utilisateur
   */
  async updateUserPassword(userId, hashedPassword) {
    try {
      const result = await this.run(
        'UPDATE users SET password_hash = ?, updated_at = NOW() WHERE id = ?',
        [hashedPassword, userId]
      );

      if (result.affectedRows === 0) {
        throw new Error('Utilisateur non trouvé');
      }

      console.log(`✅ Mot de passe mis à jour pour l'utilisateur ${userId}`);
      return result;
    } catch (error) {
      console.error('❌ Erreur mise à jour mot de passe:', error);
      throw error;
    }
  }

  /**
   * Récupérer les entreprises d'un utilisateur
   */
  async getUserCompanies(userId) {
    try {
      const companies = await this.query(
        `SELECT c.*, uc.role, uc.permissions 
         FROM companies c 
         JOIN user_companies uc ON c.id = uc.company_id 
         WHERE uc.user_id = ? 
         ORDER BY c.name`,
        [userId]
      );

      return companies.map(company => ({
        ...company,
        permissions: JSON.parse(company.permissions || '{}')
      }));
    } catch (error) {
      console.error('❌ Erreur récupération entreprises:', error);
      throw error;
    }
  }

  /**
   * Sauvegarder une configuration API
   */
  async saveApiConfiguration(companyId, serviceType, configData, userId) {
    try {
      // Chiffrer les données sensibles
      const encryptedConfig = this.encrypt(JSON.stringify(configData));

      // Insérer ou mettre à jour la configuration
      await this.run(
        `INSERT INTO api_configurations 
         (company_id, service_type, config_data, updated_at) 
         VALUES (?, ?, ?, CURRENT_TIMESTAMP)
         ON DUPLICATE KEY UPDATE config_data = VALUES(config_data), updated_at = VALUES(updated_at)`,
        [companyId, serviceType, encryptedConfig]
      );

      // Log d'audit
      await this.logAudit(userId, companyId, 'API_CONFIG_SAVED', 'api_configurations', {
        serviceType
      });

      console.log(`✅ Configuration ${serviceType} sauvegardée pour l'entreprise ${companyId}`);
      return true;
    } catch (error) {
      console.error('❌ Erreur sauvegarde configuration:', error);
      throw error;
    }
  }

  /**
   * Récupérer une configuration API
   */
  async getApiConfiguration(companyId, serviceType) {
    try {
      const config = await this.get(
        'SELECT * FROM api_configurations WHERE company_id = ? AND service_type = ? AND is_active = 1',
        [companyId, serviceType]
      );

      if (!config) {
        return null;
      }

      // Déchiffrer les données
      const decryptedConfig = JSON.parse(this.decrypt(config.config_data));
      
      return {
        ...config,
        config_data: decryptedConfig
      };
    } catch (error) {
      console.error('❌ Erreur récupération configuration:', error);
      throw error;
    }
  }

  /**
   * Créer une session utilisateur
   */
  async createSession(userId, sessionToken, expiresAt, ipAddress, userAgent) {
    try {
      const conn = await this.mariadb.getConnection();
      await conn.query(
        `INSERT INTO user_sessions (user_id, session_token, expires_at, ip_address, user_agent) 
         VALUES (?, ?, ?, ?, ?)`,
        [userId, sessionToken, expiresAt, ipAddress, userAgent]
      );
      conn.release();

      return true;
    } catch (error) {
      console.error('❌ Erreur création session:', error);
      throw error;
    }
  }

  /**
   * Valider une session
   */
  async validateSession(sessionToken) {
    try {
      const conn = await this.mariadb.getConnection();
      const result = await conn.query(
        `SELECT s.*, u.* FROM user_sessions s 
         JOIN users u ON s.user_id = u.id 
         WHERE s.session_token = ? AND s.expires_at > CURRENT_TIMESTAMP AND u.is_active = 1`,
        [sessionToken]
      );
      conn.release();
      const session = result[0] || null;

      return session;
    } catch (error) {
      console.error('❌ Erreur validation session:', error);
      throw error;
    }
  }

  /**
   * Supprimer une session
   */
  async deleteSession(sessionToken) {
    try {
      const conn = await this.mariadb.getConnection();
      await conn.query(
        'DELETE FROM user_sessions WHERE session_token = ?',
        [sessionToken]
      );
      conn.release();
      return true;
    } catch (error) {
      console.error('❌ Erreur suppression session:', error);
      throw error;
    }
  }

  /**
   * Log d'audit
   */
  async logAudit(userId, companyId, action, resource, details = {}, ipAddress = null) {
    try {
      const conn = await this.mariadb.getConnection();
      await conn.query(
        `INSERT INTO audit_logs (user_id, company_id, action, resource, details, ip_address) 
         VALUES (?, ?, ?, ?, ?, ?)`,
        [userId, companyId, action, resource, JSON.stringify(details), ipAddress]
      );
      conn.release();
    } catch (error) {
      console.error('❌ Erreur log audit:', error);
      // Ne pas faire échouer l'opération principale pour un problème de log
    }
  }

  /**
   * Exécuter une requête qui retourne plusieurs résultats
   */
  async query(sql, params = []) {
    try {
      const conn = await this.mariadb.getConnection();
      const result = await conn.query(sql, params);
      conn.release();
      return result;
    } catch (error) {
      console.error('❌ Erreur requête query:', error);
      throw error;
    }
  }

  /**
   * Exécuter une requête qui retourne un seul résultat
   */
  async get(sql, params = []) {
    try {
      const conn = await this.mariadb.getConnection();
      const result = await conn.query(sql, params);
      conn.release();
      return result[0] || null;
    } catch (error) {
      console.error('❌ Erreur requête get:', error);
      throw error;
    }
  }

  /**
   * Exécuter une requête de modification (INSERT, UPDATE, DELETE)
   */
  async run(sql, params = []) {
    try {
      const conn = await this.mariadb.getConnection();
      const result = await conn.query(sql, params);
      conn.release();
      return result;
    } catch (error) {
      console.error('❌ Erreur requête run:', error);
      throw error;
    }
  }

  /**
   * Récupérer un projet par son ID
   */
  async getProjectById(projectId) {
    try {
      const conn = await this.mariadb.getConnection();
      const result = await conn.query(
        'SELECT * FROM projects WHERE id = ?',
        [projectId]
      );
      conn.release();
      const project = result[0] || null;
      return project;
    } catch (error) {
      console.error('❌ Erreur récupération projet par ID:', error);
      throw error;
    }
  }

  /**
   * Récupérer les tâches d'un projet spécifique
   */
  async getProjectTasks(projectId) {
    try {
      const conn = await this.mariadb.getConnection();
      const tasks = await conn.query(
        'SELECT * FROM tasks WHERE project_id = ? ORDER BY created_at DESC',
        [projectId]
      );
      conn.release();
      return tasks;
    } catch (error) {
      console.error('❌ Erreur récupération tâches du projet:', error);
      return [];
    }
  }

  /**
   * Récupérer les fichiers d'un projet spécifique
   */
  async getProjectFiles(projectId) {
    try {
      const conn = await this.mariadb.getConnection();
      const files = await conn.query(
        'SELECT * FROM files WHERE project_id = ? ORDER BY created_at DESC',
        [projectId]
      );
      conn.release();
      return files;
    } catch (error) {
      console.error('❌ Erreur récupération fichiers du projet:', error);
      return [];
    }
  }

  /**
   * Récupérer les membres de l'équipe d'un projet spécifique
   */
  async getProjectTeamMembers(projectId) {
    try {
      const conn = await this.mariadb.getConnection();
      const members = await conn.query(
        `SELECT tm.*, u.first_name, u.last_name, u.email 
         FROM team_members tm 
         LEFT JOIN users u ON tm.user_id = u.id 
         WHERE tm.project_id = ?`,
        [projectId]
      );
      conn.release();
      return members;
    } catch (error) {
      console.error('❌ Erreur récupération membres équipe du projet:', error);
      return [];
    }
  }

  /**
   * Vérifier la connexion à la base de données
   */
  async checkConnection() {
    try {
      if (!this.pool) {
        return { connected: false, error: 'Base de données non initialisée' };
      }
      
      // Test simple de connexion
      const conn = await this.mariadb.getConnection();
      await conn.query('SELECT 1');
      conn.release();
      return { connected: true };
    } catch (error) {
      console.error('❌ Erreur vérification connexion DB:', error);
      return { connected: false, error: error.message };
    }
  }

  /**
   * Fermer la connexion à la base de données
   */
  async close() {
    if (this.pool) {
      await this.pool.end();
      console.log('🔒 Connexion base de données fermée');
    }
  }
}

module.exports = new DatabaseService();