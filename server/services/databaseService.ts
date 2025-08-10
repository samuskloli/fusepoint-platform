import * as crypto from 'crypto';
import * as path from 'path';
import * as fs from 'fs';
import * as bcrypt from 'bcryptjs';
import { DatabaseService as IDatabaseService, DatabaseConnection, DatabaseQueryResult, User } from '../types';

const MariaDBConfig = require('../config/mariadb.config');

/**
 * Service de base de données sécurisé avec MariaDB
 * Gère l'authentification, le chiffrement et l'accès aux données
 */
class DatabaseService implements IDatabaseService {
  private mariadb: any;
  private pool: any;
  private encryptionKey: string;
  private schemaPath: string;
  private agentSchemaPath: string;
  private prestataireSchemaPath: string;
  private clientProjectsSchemaPath: string;
  private agentClientsSchemaPath: string;

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
  async initialize(): Promise<boolean> {
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
  private async createTables(): Promise<void> {
    let conn: any;
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
  private adaptSchemaToMariaDB(sqliteSchema: string): string {
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
  private async executeMultipleQueries(conn: any, sqlScript: string): Promise<void> {
    const queries = sqlScript.split(';').filter(query => query.trim().length > 0);
    
    for (const query of queries) {
      const trimmedQuery = query.trim();
      if (trimmedQuery) {
        try {
          await conn.query(trimmedQuery);
        } catch (error: any) {
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
  async getConnection(): Promise<any> {
    return await this.mariadb.getConnection();
  }

  /**
   * Générer une clé de chiffrement
   */
  private generateEncryptionKey(): string {
    const key = crypto.randomBytes(32).toString('hex');
    console.log('🔑 Clé de chiffrement générée. Ajoutez DB_ENCRYPTION_KEY à votre .env');
    return key;
  }

  /**
   * Chiffrer des données sensibles
   */
  encrypt(text: string): string {
    try {
      const iv = crypto.randomBytes(16);
      const cipher = crypto.createCipheriv('aes-256-cbc', this.encryptionKey, iv);
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
  decrypt(encryptedText: string): string {
    try {
      const textParts = encryptedText.split(':');
      const iv = Buffer.from(textParts.shift()!, 'hex');
      const encryptedData = textParts.join(':');
      const decipher = crypto.createDecipheriv('aes-256-cbc', this.encryptionKey, iv);
      let decrypted = decipher.update(encryptedData, 'hex', 'utf8');
      decrypted += decipher.final('utf8');
      return decrypted;
    } catch (error) {
      console.error('❌ Erreur déchiffrement:', error);
      throw error;
    }
  }

  /**
   * Exécuter une requête SQL
   */
  async query<T = any>(sql: string, params: any[] = []): Promise<T[]> {
    let conn: any;
    try {
      conn = await this.getConnection();
      const [rows] = await conn.execute(sql, params);
      return rows as T[];
    } catch (error) {
      console.error('❌ Erreur requête SQL:', error);
      throw error;
    } finally {
      if (conn) conn.release();
    }
  }

  /**
   * Exécuter une requête SQL avec modification
   */
  async run(sql: string, params: any[] = []): Promise<DatabaseQueryResult> {
    let conn: any;
    try {
      conn = await this.getConnection();
      const [result] = await conn.execute(sql, params);
      return {
        insertId: (result as any).insertId,
        affectedRows: (result as any).affectedRows
      };
    } catch (error) {
      console.error('❌ Erreur requête SQL:', error);
      throw error;
    } finally {
      if (conn) conn.release();
    }
  }

  /**
   * Obtenir un seul résultat
   */
  async get<T = any>(sql: string, params: any[] = []): Promise<T | null> {
    const results = await this.query<T>(sql, params);
    return results.length > 0 ? results[0] : null;
  }

  /**
   * Fermer la connexion
   */
  async close(): Promise<void> {
    if (this.pool) {
      await this.pool.end();
      this.pool = null;
    }
  }

  /**
   * Authentifier un utilisateur
   */
  async authenticateUser(email: string, password: string): Promise<User | null> {
    try {
      const user = await this.get<User>(
        'SELECT * FROM users WHERE email = ? AND is_active = 1',
        [email]
      );

      if (!user) {
        return null;
      }

      const isValidPassword = await bcrypt.compare(password, user.password);
      if (!isValidPassword) {
        return null;
      }

      // Ne pas retourner le mot de passe
      const { password: _, ...userWithoutPassword } = user;
      return userWithoutPassword as User;
    } catch (error) {
      console.error('❌ Erreur authentification:', error);
      throw error;
    }
  }

  /**
   * Créer un utilisateur
   */
  async createUser(userData: Partial<User>): Promise<User> {
    try {
      const hashedPassword = await bcrypt.hash(userData.password!, 12);
      
      const result = await this.run(
        `INSERT INTO users (email, password, first_name, last_name, role, created_at, updated_at) 
         VALUES (?, ?, ?, ?, ?, NOW(), NOW())`,
        [
          userData.email,
          hashedPassword,
          userData.firstName,
          userData.lastName,
          userData.role || 'client'
        ]
      );

      const user = await this.get<User>(
        'SELECT * FROM users WHERE id = ?',
        [result.insertId]
      );

      if (!user) {
        throw new Error('Erreur lors de la création de l\'utilisateur');
      }

      // Ne pas retourner le mot de passe
      const { password: _, ...userWithoutPassword } = user;
      return userWithoutPassword as User;
    } catch (error) {
      console.error('❌ Erreur création utilisateur:', error);
      throw error;
    }
  }
}

module.exports = DatabaseService;