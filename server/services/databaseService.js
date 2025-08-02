const sqlite3 = require('sqlite3').verbose();
const { open } = require('sqlite');
const bcrypt = require('bcryptjs');
const crypto = require('node:crypto');
const path = require('path');
const fs = require('fs');

/**
 * Service de base de données sécurisé
 * Gère l'authentification, le chiffrement et l'accès aux données
 */
class DatabaseService {
  constructor() {
    this.db = null;
    this.encryptionKey = process.env.DB_ENCRYPTION_KEY || this.generateEncryptionKey();
    this.dbPath = path.join(__dirname, '../database/fusepoint.db');
    this.schemaPath = path.join(__dirname, '../database/schema.sql');
    this.agentSchemaPath = path.join(__dirname, '../database/agent_schema_simple.sql');
    this.prestataireSchemaPath = path.join(__dirname, '../database/prestataire_schema.sql');
    this.clientProjectsSchemaPath = path.join(__dirname, '../database/client_projects_schema.sql');
  }

  /**
   * Initialiser la base de données
   */
  async initialize() {
    try {
      // Créer le dossier database s'il n'existe pas
      const dbDir = path.dirname(this.dbPath);
      if (!fs.existsSync(dbDir)) {
        fs.mkdirSync(dbDir, { recursive: true });
      }

      // Ouvrir la connexion à la base de données
      this.db = await open({
        filename: this.dbPath,
        driver: sqlite3.Database
      });

      // Activer les clés étrangères
      await this.db.exec('PRAGMA foreign_keys = ON');

      // Créer les tables si elles n'existent pas
      await this.createTables();

      // Les colonnes sont maintenant créées directement dans la migration password_hash nullable
      console.log('ℹ️ Colonnes users gérées par la migration principale');
      
      // Migration pour permettre password_hash NULL (pour les utilisateurs créés par agents)
      try {
        // Créer une nouvelle table temporaire avec password_hash nullable et agent_id
        await this.db.exec(`
          CREATE TABLE IF NOT EXISTS users_temp (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
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
            updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            last_login DATETIME,
            agent_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
            user_code VARCHAR(20) UNIQUE,
            status VARCHAR(20) DEFAULT 'active',
            specialties TEXT,
            company_id INTEGER REFERENCES companies(id)
          )
        `);
        
        // Copier les données existantes
        await this.db.exec(`
          INSERT OR IGNORE INTO users_temp 
          SELECT id, email, password_hash, first_name, last_name, 
                 phone, role, is_active, email_verified, first_login_token, 
                 first_login_token_expires, confirmation_token, token_expiry, 
                 reset_token, reset_token_expiry, onboarding_completed, 
                 created_at, updated_at, last_login,
                 agent_id, user_code, status, specialties, company_id
          FROM users
        `);
        
        // Supprimer l'ancienne table et renommer la nouvelle
        await this.db.exec('DROP TABLE users');
        await this.db.exec('ALTER TABLE users_temp RENAME TO users');
        
        // Recréer les index
        await this.db.exec('CREATE INDEX IF NOT EXISTS idx_users_email ON users(email)');
        await this.db.exec('CREATE INDEX IF NOT EXISTS idx_users_agent_id ON users(agent_id)');
        await this.db.exec('CREATE INDEX IF NOT EXISTS idx_users_user_code ON users(user_code)');
        await this.db.exec('CREATE INDEX IF NOT EXISTS idx_users_company_id ON users(company_id)');
        
        console.log('✅ Migration password_hash nullable appliquée');
      } catch (migrationError) {
        console.log('ℹ️ Migration password_hash déjà appliquée ou non nécessaire');
      }

      // Migration pour la table client_prestataire_assignments
      try {
        const clientPrestataireAssignmentsMigrationPath = path.join(__dirname, '../migrations/add_client_prestataire_assignments.sql');
        if (fs.existsSync(clientPrestataireAssignmentsMigrationPath)) {
          const migrationSql = fs.readFileSync(clientPrestataireAssignmentsMigrationPath, 'utf8');
          await this.db.exec(migrationSql);
          console.log('✅ Migration client_prestataire_assignments appliquée');
        }
      } catch (migrationError) {
        console.log('ℹ️ Migration client_prestataire_assignments déjà appliquée ou erreur:', migrationError.message);
      }

      console.log('✅ Base de données initialisée avec succès');
      return true;
    } catch (error) {
      console.error('❌ Erreur initialisation base de données:', error);
      throw error;
    }
  }

  /**
   * Créer les tables à partir du schema
   */
  async createTables() {
    try {
      // Créer les tables principales
      if (fs.existsSync(this.schemaPath)) {
        const schema = fs.readFileSync(this.schemaPath, 'utf8');
        await this.db.exec(schema);
        console.log('📊 Tables principales créées avec succès');
      } else {
        console.warn('⚠️ Fichier schema.sql non trouvé');
      }

      // Créer les tables pour les agents
       if (fs.existsSync(this.agentSchemaPath)) {
         const agentSchema = fs.readFileSync(this.agentSchemaPath, 'utf8');
         await this.db.exec(agentSchema);
         console.log('🤖 Tables agent créées avec succès');
       } else {
         console.warn('⚠️ Fichier agent_schema_simple.sql non trouvé');
       }

      // Créer les tables pour les prestataires
       if (fs.existsSync(this.prestataireSchemaPath)) {
         const prestataireSchema = fs.readFileSync(this.prestataireSchemaPath, 'utf8');
         await this.db.exec(prestataireSchema);
         console.log('👥 Tables prestataire créées avec succès');
       } else {
         console.warn('⚠️ Fichier prestataire_schema.sql non trouvé');
       }

      // Créer les tables pour les projets clients (temporairement désactivé)
       /*if (fs.existsSync(this.clientProjectsSchemaPath)) {
         const clientProjectsSchema = fs.readFileSync(this.clientProjectsSchemaPath, 'utf8');
         await this.db.exec(clientProjectsSchema);
         console.log('📋 Tables projets clients créées avec succès');
       } else {
         console.warn('⚠️ Fichier client_projects_schema.sql non trouvé');
       }*/
       console.log('⚠️ Tables projets clients temporairement désactivées pour debug');
    } catch (error) {
      console.error('❌ Erreur création tables:', error);
      throw error;
    }
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
      const user = await this.db.get(
        'SELECT * FROM users WHERE confirmation_token = ? AND token_expiry > datetime("now")',
        [token]
      );

      if (!user) {
        throw new Error('Token de confirmation invalide ou expiré');
      }

      // Activer le compte et supprimer le token
      await this.db.run(
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
    try {
      const user = await this.db.get(
        'SELECT id, email, first_name, last_name, role, is_active, created_at, last_login, phone, email_verified, onboarding_completed FROM users WHERE id = ?',
        [userId]
      );
      return user;
    } catch (error) {
      console.error('❌ Erreur récupération utilisateur par ID:', error);
      throw error;
    }
  }

  /**
   * Supprimer un utilisateur
   */
  async deleteUser(userId, deletedBy) {
    try {
      // Vérifier que l'utilisateur existe
      const user = await this.getUserById(userId);
      if (!user) {
        throw new Error('Utilisateur non trouvé');
      }

      // Supprimer l'utilisateur
      const result = await this.db.run(
        'DELETE FROM users WHERE id = ?',
        [userId]
      );

      if (result.changes === 0) {
        throw new Error('Aucun utilisateur supprimé');
      }

      // Log de l'action
      await this.db.run(
        `INSERT INTO system_logs (level, message, category, user_id, ip_address, user_agent, metadata, created_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, datetime('now'))`,
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
      await this.db.run(
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
    try {
      // Vérifier le token et sa validité
      const user = await this.db.get(
        'SELECT * FROM users WHERE reset_token = ? AND reset_token_expiry > datetime("now")',
        [token]
      );

      if (!user) {
        throw new Error('Token de réinitialisation invalide ou expiré');
      }

      // Hacher le nouveau mot de passe
      const passwordHash = await this.hashPassword(newPassword);

      // Mettre à jour le mot de passe et supprimer le token
      await this.db.run(
        'UPDATE users SET password_hash = ?, reset_token = NULL, reset_token_expiry = NULL WHERE id = ?',
        [passwordHash, user.id]
      );

      // Log d'audit
      await this.logAudit(user.id, null, 'PASSWORD_RESET', 'users');

      return { message: 'Mot de passe réinitialisé avec succès' };
    } catch (error) {
      console.error('❌ Erreur réinitialisation mot de passe:', error);
      throw error;
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

      // Insérer l'utilisateur avec is_active = 0 (compte non confirmé)
      const result = await this.db.run(
        `INSERT INTO users (email, password_hash, first_name, last_name, role, confirmation_token, token_expiry, is_active) 
         VALUES (?, ?, ?, ?, ?, ?, ?, 0)`,
        [email, passwordHash, firstName, lastName, role, confirmationToken, tokenExpiry.toISOString()]
      );

      // Log d'audit
      await this.logAudit(result.lastID, null, 'USER_CREATED', 'users', {
        email,
        role
      });

      const newUser = {
        id: result.lastID,
        email,
        firstName,
        lastName,
        role,
        confirmationToken,
        createdAt: new Date().toISOString()
      };

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
    try {
      const whereClause = activeOnly ? 
        'SELECT * FROM users WHERE email = ? AND is_active = 1' :
        'SELECT * FROM users WHERE email = ?';
      
      const user = await this.db.get(whereClause, [email]);
      return user;
    } catch (error) {
      console.error('❌ Erreur récupération utilisateur:', error);
      throw error;
    }
  }

  /**
   * Récupérer tous les utilisateurs avec pagination
   */
  async getAllUsers(options = {}) {
    try {
      const {
        limit = 50,
        offset = 0,
        role = null,
        activeOnly = true,
        search = null
      } = options;

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

      const users = await this.db.all(query, params);
      return users;
    } catch (error) {
      console.error('❌ Erreur récupération utilisateurs:', error);
      throw error;
    }
  }

  /**
   * Compter le nombre total d'utilisateurs
   */
  async getUsersCount(options = {}) {
    try {
      const {
        role = null,
        activeOnly = true,
        search = null
      } = options;

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

      const result = await this.db.get(query, params);
      return result.count;
    } catch (error) {
      console.error('❌ Erreur comptage utilisateurs:', error);
      throw error;
    }
  }

  /**
   * Mettre à jour le rôle d'un utilisateur
   */
  async updateUserRole(userId, newRole, updatedBy) {
    try {
      const result = await this.db.run(
        'UPDATE users SET role = ?, updated_at = datetime("now") WHERE id = ?',
        [newRole, userId]
      );

      if (result.changes === 0) {
        throw new Error('Utilisateur non trouvé');
      }

      // Log de l'action
      await this.db.run(
        `INSERT INTO system_logs (level, message, category, user_id, ip_address, user_agent, metadata, created_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, datetime('now'))`,
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
    }
  }

  /**
   * Activer/désactiver un utilisateur
   */
  async updateUserStatus(userId, isActive, updatedBy) {
    try {
      const result = await this.db.run(
        'UPDATE users SET is_active = ?, updated_at = datetime("now") WHERE id = ?',
        [isActive ? 1 : 0, userId]
      );

      if (result.changes === 0) {
        throw new Error('Utilisateur non trouvé');
      }

      // Log de l'action
      await this.db.run(
        `INSERT INTO system_logs (level, message, category, user_id, ip_address, user_agent, metadata, created_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, datetime('now'))`,
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
      const { first_name, last_name, email, phone } = userData;
      
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
      
      if (phone !== undefined) {
        updates.push('phone = ?');
        values.push(phone);
      }
      
      if (updates.length === 0) {
        throw new Error('Aucune donnée à mettre à jour');
      }
      
      // Ajouter la date de mise à jour
      updates.push('updated_at = datetime("now")');
      values.push(userId);
      
      const query = `UPDATE users SET ${updates.join(', ')} WHERE id = ?`;
      
      const result = await this.db.run(query, values);
      
      if (result.changes === 0) {
        throw new Error('Utilisateur non trouvé');
      }
      
      // Log de l'action
      await this.db.run(
        `INSERT INTO system_logs (level, message, category, user_id, ip_address, user_agent, metadata, created_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, datetime('now'))`,
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
      const companies = await this.db.all('SELECT * FROM companies ORDER BY name');
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
      const result = await this.db.run(
        `INSERT OR REPLACE INTO user_companies (user_id, company_id, role, created_at)
         VALUES (?, ?, ?, datetime('now'))`,
        [userId, companyId, role]
      );
      
      return { userId, companyId, role, id: result.lastID };
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
      const result = await this.db.run(
        'DELETE FROM user_companies WHERE user_id = ? AND company_id = ?',
        [userId, companyId]
      );
      
      return { changes: result.changes };
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
      await this.db.run(
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
      const result = await this.db.run(
        `INSERT INTO companies (name, industry, size, location, website, description) 
         VALUES (?, ?, ?, ?, ?, ?)`,
        [name, industry, size, location, website, description]
      );

      const companyId = result.lastID;

      // Associer l'utilisateur à l'entreprise comme propriétaire
      await this.db.run(
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
      const result = await this.db.run(
        'UPDATE users SET password_hash = ?, updated_at = datetime("now") WHERE id = ?',
        [hashedPassword, userId]
      );

      if (result.changes === 0) {
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
      const companies = await this.db.all(
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
      await this.db.run(
        `INSERT OR REPLACE INTO api_configurations 
         (company_id, service_type, config_data, updated_at) 
         VALUES (?, ?, ?, CURRENT_TIMESTAMP)`,
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
      const config = await this.db.get(
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
      await this.db.run(
        `INSERT INTO user_sessions (user_id, session_token, expires_at, ip_address, user_agent) 
         VALUES (?, ?, ?, ?, ?)`,
        [userId, sessionToken, expiresAt, ipAddress, userAgent]
      );

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
      const session = await this.db.get(
        `SELECT s.*, u.* FROM user_sessions s 
         JOIN users u ON s.user_id = u.id 
         WHERE s.session_token = ? AND s.expires_at > CURRENT_TIMESTAMP AND u.is_active = 1`,
        [sessionToken]
      );

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
      await this.db.run(
        'DELETE FROM user_sessions WHERE session_token = ?',
        [sessionToken]
      );
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
      await this.db.run(
        `INSERT INTO audit_logs (user_id, company_id, action, resource, details, ip_address) 
         VALUES (?, ?, ?, ?, ?, ?)`,
        [userId, companyId, action, resource, JSON.stringify(details), ipAddress]
      );
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
      const result = await this.db.all(sql, params);
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
      return await this.db.get(sql, params);
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
      return await this.db.run(sql, params);
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
      const project = await this.db.get(
        'SELECT * FROM projects WHERE id = ?',
        [projectId]
      );
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
      const tasks = await this.db.all(
        'SELECT * FROM tasks WHERE project_id = ? ORDER BY created_at DESC',
        [projectId]
      );
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
      const files = await this.db.all(
        'SELECT * FROM files WHERE project_id = ? ORDER BY created_at DESC',
        [projectId]
      );
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
      const members = await this.db.all(
        `SELECT tm.*, u.first_name, u.last_name, u.email 
         FROM team_members tm 
         LEFT JOIN users u ON tm.user_id = u.id 
         WHERE tm.project_id = ?`,
        [projectId]
      );
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
      if (!this.db) {
        return { connected: false, error: 'Base de données non initialisée' };
      }
      
      // Test simple de connexion
      await this.db.get('SELECT 1');
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
    if (this.db) {
      await this.db.close();
      console.log('🔒 Connexion base de données fermée');
    }
  }
}

module.exports = new DatabaseService();