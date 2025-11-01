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
    this.projectTemplatesSchemaPath = path.join(__dirname, '../database/project_templates_schema.sql');
    this.clientWidgetConfigsSchemaPath = path.join(__dirname, '../database/client_widget_configs_schema.sql');
    this.projectDashboardsSchemaPath = path.join(__dirname, '../database/project_dashboards_schema.sql');
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

      // Créer les tables pour les projets clients (fichiers, tâches, etc.)
      if (fs.existsSync(this.clientProjectsSchemaPath)) {
        const clientProjectsSchema = fs.readFileSync(this.clientProjectsSchemaPath, 'utf8');
        const mariadbClientProjectsSchema = this.adaptSchemaToMariaDB(clientProjectsSchema);
        await this.executeMultipleQueries(conn, mariadbClientProjectsSchema);
        console.log('📂 Tables projets clients créées avec succès');
      } else {
        console.warn('⚠️ Fichier client_projects_schema.sql non trouvé');
      }

      // S'assurer que les tables critiques existent au minimum (utilisateurs, entreprises, associations, sessions)
      await this.ensureCompaniesBaseTable(conn);
      await this.ensureUsersBaseTable(conn);
      await this.ensureUserCompaniesBaseTable(conn);
      await this.ensureUserSessionsBaseTable(conn);

      // S'assurer que la table files existe au minimum
      await this.ensureFilesBaseTable(conn);

      // S'assurer que la table files contient les colonnes étendues
      try {
        await this.ensureFilesExtendedSchema(conn);
      } catch (e) {
        if (!String(e.message).includes("doesn't exist")) {
          console.warn('⚠️ Erreur mise à niveau schema files:', e.message);
        }
      }

      // S'assurer que la table tasks contient les colonnes étendues
      try {
        await this.ensureTasksExtendedSchema(conn);
      } catch (e) {
        if (!String(e.message).includes("doesn't exist")) {
          console.warn('⚠️ Erreur mise à niveau schema tasks:', e.message);
        }
      }

      // === LinkPoint: créer les tables si absentes ===
      await this.ensureLinkPointsSchema(conn);

      console.log('✅ Base de schéma LinkPoint vérifiée');

      // === Domaines personnalisés: créer la table si absente ===
      await this.ensureCustomDomainsSchema(conn);
      console.log('✅ Table domaines personnalisés vérifiée');

      // Dossiers LinkPoint désactivés; aucune action requise.

      // Créer les tables pour les templates de projets et widgets
      // S'assurer que la table widgets contient les colonnes étendues avant insertions
      try {
        await this.ensureWidgetsExtendedSchema(conn);
      } catch (e) {
        // Ignorer si la table n'existe pas encore; elle sera créée juste après
        if (!String(e.message).includes("doesn't exist")) {
          console.warn('⚠️ Erreur mise à niveau schema widgets:', e.message);
        }
      }

      if (fs.existsSync(this.projectTemplatesSchemaPath)) {
        const projectTemplatesSchema = fs.readFileSync(this.projectTemplatesSchemaPath, 'utf8');
        let mariadbProjectTemplatesSchema = this.adaptSchemaToMariaDB(projectTemplatesSchema);

        // Option pour désactiver l'insertion automatique des templates par défaut
        const skipDefaultTemplates = (
          process.env.DISABLE_DEFAULT_TEMPLATES === '1' ||
          String(process.env.DISABLE_DEFAULT_TEMPLATES || '').toLowerCase() === 'true'
        );
        if (skipDefaultTemplates) {
          try {
            const filtered = mariadbProjectTemplatesSchema
              .split(';')
              .filter(q => {
                const qt = q.trim();
                if (!qt) return false;
                const upper = qt.toUpperCase();
                // Ne pas exécuter les INSERT vers project_templates ou project_template_widgets
                if (upper.startsWith('INSERT') && upper.includes('INTO PROJECT_TEMPLATES')) return false;
                if (upper.startsWith('INSERT') && upper.includes('INTO PROJECT_TEMPLATE_WIDGETS')) return false;
                return true;
              })
              .join(';');
            mariadbProjectTemplatesSchema = filtered;
            console.log('🚫 Insertion des templates par défaut désactivée (DISABLE_DEFAULT_TEMPLATES activé)');
          } catch (e) {
            console.warn('⚠️ Filtrage des inserts de templates échoué:', e.message);
          }
        }

        await this.executeMultipleQueries(conn, mariadbProjectTemplatesSchema);
        console.log('📋 Tables templates de projets et widgets créées avec succès');
      } else {
        console.warn('⚠️ Fichier project_templates_schema.sql non trouvé');
      }

      // Charger le schéma des configurations de widgets par client
      if (fs.existsSync(this.clientWidgetConfigsSchemaPath)) {
        const clientWidgetsSchema = fs.readFileSync(this.clientWidgetConfigsSchemaPath, 'utf8');
        let mariadbClientWidgetsSchema = this.adaptSchemaToMariaDB(clientWidgetsSchema);

        // Appliquer le même filtrage si demandé, car ce schéma peut aussi insérer des templates
        const skipDefaultTemplates = (
          process.env.DISABLE_DEFAULT_TEMPLATES === '1' ||
          String(process.env.DISABLE_DEFAULT_TEMPLATES || '').toLowerCase() === 'true'
        );
        if (skipDefaultTemplates) {
          try {
            const filteredClient = mariadbClientWidgetsSchema
              .split(';')
              .filter(q => {
                const qt = q.trim();
                if (!qt) return false;
                const upper = qt.toUpperCase();
                // Ne pas exécuter les INSERT vers project_templates ou project_template_widgets depuis ce schéma
                if (upper.startsWith('INSERT') && upper.includes('INTO PROJECT_TEMPLATES')) return false;
                if (upper.startsWith('INSERT') && upper.includes('INTO PROJECT_TEMPLATE_WIDGETS')) return false;
                return true;
              })
              .join(';');
            mariadbClientWidgetsSchema = filteredClient;
            console.log('🚫 Templates par défaut ignorés dans client_widget_configs (DISABLE_DEFAULT_TEMPLATES activé)');
          } catch (e) {
            console.warn('⚠️ Filtrage des inserts (client_widget_configs) échoué:', e.message);
          }
        }

        await this.executeMultipleQueries(conn, mariadbClientWidgetsSchema);
        console.log('🧩 Tables client_widget_configs et templates initialisées avec succès');
      } else {
        console.warn('⚠️ Fichier client_widget_configs_schema.sql non trouvé');
      }

      // Charger le schéma des dashboards de projets
      if (fs.existsSync(this.projectDashboardsSchemaPath)) {
        const projectDashboardsSchema = fs.readFileSync(this.projectDashboardsSchemaPath, 'utf8');
        const mariadbProjectDashboardsSchema = this.adaptSchemaToMariaDB(projectDashboardsSchema);
        await this.executeMultipleQueries(conn, mariadbProjectDashboardsSchema);
        console.log('📊 Table project_dashboards initialisée avec succès');
      } else {
        console.warn('⚠️ Fichier project_dashboards_schema.sql non trouvé');
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
    
    // Remplacer DEFAULT CURRENT_TIMESTAMP (laisser tel quel pour MariaDB)
    mariadbSchema = mariadbSchema.replace(/DEFAULT CURRENT_TIMESTAMP/gi, 'DEFAULT CURRENT_TIMESTAMP');
    
    // Remplacer TEXT par LONGTEXT pour les champs longs
    mariadbSchema = mariadbSchema.replace(/\bTEXT\b/gi, 'LONGTEXT');

    // Remplacer les colonnes de type JSON par LONGTEXT pour compatibilité MariaDB
    // Ne pas altérer les fonctions JSON_* (JSON_OBJECT, JSON_ARRAY, etc.)
    mariadbSchema = mariadbSchema.replace(/\bJSON\s*(?=,|\n|\r|\))/gi, 'LONGTEXT');
    mariadbSchema = mariadbSchema.replace(/\bJSON\s+NOT\s+NULL\b/gi, 'LONGTEXT NOT NULL');
    
    // Ajouter IF NOT EXISTS sur CREATE TABLE si absent
    mariadbSchema = mariadbSchema.replace(/CREATE TABLE (?!IF NOT EXISTS)([^\s]+)/gi, 'CREATE TABLE IF NOT EXISTS $1');

    // Adapter les index SQLite vers MariaDB
    // - Supprimer IF NOT EXISTS sur CREATE INDEX (non supporté par certaines versions)
    mariadbSchema = mariadbSchema.replace(/CREATE\s+INDEX\s+IF\s+NOT\s+EXISTS/gi, 'CREATE INDEX');
    // - Échapper les colonnes réservées pour platform_settings
    mariadbSchema = mariadbSchema.replace(/ON\s+platform_settings\s*\(\s*key\s*\)/gi, 'ON platform_settings (`key`)');
    
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
          const msg = String(error.message || '');
          // Ignorer les erreurs bénignes: table/index déjà existants
          if (!msg.includes('already exists') && !msg.includes('Duplicate key name') && !msg.includes('ER_DUP_KEYNAME')) {
            console.warn('⚠️ Erreur requête SQL:', trimmedQuery, msg);
          }
        }
      }
    }
  }

  /**
   * S'assurer que la table files contient les colonnes étendues
   */
  async ensureFilesExtendedSchema(conn) {
    const alterQueries = [
      "ALTER TABLE files ADD COLUMN IF NOT EXISTS folder_path VARCHAR(255) DEFAULT '/'",
      "ALTER TABLE files ADD COLUMN IF NOT EXISTS is_deleted TINYINT(1) DEFAULT 0",
      "ALTER TABLE files ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP",
      "ALTER TABLE files ADD COLUMN IF NOT EXISTS original_name VARCHAR(255)",
      "ALTER TABLE files ADD COLUMN IF NOT EXISTS mime_type VARCHAR(100) DEFAULT 'application/octet-stream'"
    ];
    for (const q of alterQueries) {
      try {
        await conn.query(q);
      } catch (error) {
        const msg = String(error.message || '');
        if (!msg.includes('Duplicate column') && !msg.includes("doesn't exist")) {
          console.warn('⚠️ Erreur ALTER files:', error.message);
        }
      }
    }
  }

  /**
   * Mise à niveau de la table tasks pour ajouter des colonnes étendues si absentes
   * - Ajoute la colonne category (VARCHAR(100) NULL) si inexistante
   */
  async ensureTasksExtendedSchema(conn) {
    try {
      const columns = await conn.query('SHOW COLUMNS FROM tasks');
      const colNames = columns.map(c => c.Field);
      const has = (name) => colNames.includes(name);

      // Ajouter la colonne priority si absente
      if (!has('priority')) {
        try {
          // Utiliser VARCHAR pour une compatibilité maximale, avec une valeur par défaut
          await conn.query("ALTER TABLE tasks ADD COLUMN priority VARCHAR(20) DEFAULT 'medium'");
          console.log('🛠️ Colonne tasks.priority ajoutée (VARCHAR(20) DEFAULT \'medium\')');
          // Normaliser les lignes existantes à la valeur par défaut
          await conn.query("UPDATE tasks SET priority = 'medium' WHERE priority IS NULL");
        } catch (err) {
          console.warn('⚠️ Échec ajout tasks.priority:', err.message);
        }
      }

      // Ajouter la colonne category si absente
      if (!has('category')) {
        await conn.query("ALTER TABLE tasks ADD COLUMN category VARCHAR(100) NULL AFTER due_date");
        console.log('🛠️ Colonne tasks.category ajoutée');
      }

      // Ajouter les colonnes de progression si absentes
      if (!has('estimated_hours')) {
        try {
          await conn.query("ALTER TABLE tasks ADD COLUMN estimated_hours DECIMAL(7,2) NULL AFTER due_date");
          console.log('🛠️ Colonne tasks.estimated_hours ajoutée (DECIMAL(7,2))');
        } catch (err) {
          console.warn('⚠️ Échec ajout tasks.estimated_hours:', err.message);
        }
      }
      if (!has('actual_hours')) {
        try {
          await conn.query("ALTER TABLE tasks ADD COLUMN actual_hours DECIMAL(7,2) DEFAULT 0 AFTER estimated_hours");
          console.log('🛠️ Colonne tasks.actual_hours ajoutée (DECIMAL(7,2) DEFAULT 0)');
        } catch (err) {
          console.warn('⚠️ Échec ajout tasks.actual_hours:', err.message);
        }
      }
    } catch (e) {
      console.warn('⚠️ ensureTasksExtendedSchema a rencontré une erreur:', e.message);
      throw e;
    }
  }

  /**
   * Crée une table files minimale si elle n'existe pas
   */
  async ensureFilesBaseTable(conn) {
    try {
      const [tables] = await conn.query("SHOW TABLES LIKE 'files'");
      const exists = Array.isArray(tables) && tables.length > 0;
      if (!exists) {
        await conn.query(`
          CREATE TABLE IF NOT EXISTS files (
            id INT AUTO_INCREMENT PRIMARY KEY,
            client_id INT NOT NULL,
            project_id INT,
            name VARCHAR(255) NOT NULL,
            original_name VARCHAR(255),
            mime_type VARCHAR(100),
            size INT DEFAULT 0,
            folder_path VARCHAR(255) DEFAULT '/',
            created_by INT,
            is_deleted TINYINT(1) DEFAULT 0,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
          )
        `);
        try {
          await conn.query("CREATE INDEX idx_files_scope ON files (client_id, project_id)");
        } catch (e) {
          // Ignorer si l'index existe déjà
        }
        console.log('📁 Table files minimale créée');
      }
    } catch (error) {
      console.warn("⚠️ Impossible de vérifier/créer la table files:", error.message);
    }
  }

  /**
   * Crée une table users minimale si elle n'existe pas
   */
  async ensureUsersBaseTable(conn) {
    try {
      const [tables] = await conn.query("SHOW TABLES LIKE 'users'");
      const exists = Array.isArray(tables) && tables.length > 0;
      if (!exists) {
        await conn.query(`
          CREATE TABLE IF NOT EXISTS users (
            id INT AUTO_INCREMENT PRIMARY KEY,
            email VARCHAR(255) NOT NULL UNIQUE,
            password_hash VARCHAR(255) NOT NULL,
            first_name VARCHAR(100),
            last_name VARCHAR(100),
            role VARCHAR(50) DEFAULT 'user',
            is_active TINYINT(1) DEFAULT 1,
            onboarding_completed TINYINT(1) DEFAULT 0,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            last_login TIMESTAMP NULL DEFAULT NULL
          )
        `);
        try {
          await conn.query("CREATE INDEX idx_users_email ON users (email)");
        } catch (e) {
          // Ignorer si l'index existe déjà
        }
        console.log('👤 Table users minimale créée');
      }
    } catch (error) {
      console.warn("⚠️ Impossible de vérifier/créer la table users:", error.message);
    }
  }

  /**
   * Crée une table companies minimale si elle n'existe pas
   */
  async ensureCompaniesBaseTable(conn) {
    try {
      const [tables] = await conn.query("SHOW TABLES LIKE 'companies'");
      const exists = Array.isArray(tables) && tables.length > 0;
      if (!exists) {
        await conn.query(`
          CREATE TABLE IF NOT EXISTS companies (
            id INT AUTO_INCREMENT PRIMARY KEY,
            name VARCHAR(255) NOT NULL,
            industry VARCHAR(100),
            size VARCHAR(50),
            location VARCHAR(255),
            website VARCHAR(255),
            description TEXT,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
          )
        `);
        try {
          await conn.query("CREATE INDEX idx_companies_name ON companies (name)");
        } catch (e) {
          // Ignorer si l'index existe déjà
        }
        console.log('🏢 Table companies minimale créée');
      }
    } catch (error) {
      console.warn("⚠️ Impossible de vérifier/créer la table companies:", error.message);
    }
  }

  /**
   * Crée une table user_companies minimale si elle n'existe pas
   */
  async ensureUserCompaniesBaseTable(conn) {
    try {
      const [tables] = await conn.query("SHOW TABLES LIKE 'user_companies'");
      const exists = Array.isArray(tables) && tables.length > 0;
      if (!exists) {
        await conn.query(`
          CREATE TABLE IF NOT EXISTS user_companies (
            id INT AUTO_INCREMENT PRIMARY KEY,
            user_id INT NOT NULL,
            company_id INT NOT NULL,
            role VARCHAR(50) DEFAULT 'user',
            permissions TEXT,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
          )
        `);
        try {
          await conn.query("CREATE INDEX idx_user_companies_user ON user_companies (user_id)");
          await conn.query("CREATE INDEX idx_user_companies_company ON user_companies (company_id)");
        } catch (e) {
          // Ignorer si l'index existe déjà
        }
        console.log('🔗 Table user_companies minimale créée');
      }
    } catch (error) {
      console.warn("⚠️ Impossible de vérifier/créer la table user_companies:", error.message);
    }
  }

  /**
   * Crée une table user_sessions minimale si elle n'existe pas
   */
  async ensureUserSessionsBaseTable(conn) {
    try {
      const [tables] = await conn.query("SHOW TABLES LIKE 'user_sessions'");
      const exists = Array.isArray(tables) && tables.length > 0;
      if (!exists) {
        await conn.query(`
          CREATE TABLE IF NOT EXISTS user_sessions (
            id INT AUTO_INCREMENT PRIMARY KEY,
            user_id INT NOT NULL,
            session_token VARCHAR(255) NOT NULL UNIQUE,
            expires_at DATETIME NOT NULL,
            ip_address VARCHAR(100),
            user_agent VARCHAR(255),
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
          )
        `);
        try {
          await conn.query("CREATE INDEX idx_user_sessions_user ON user_sessions (user_id)");
          await conn.query("CREATE INDEX idx_user_sessions_token ON user_sessions (session_token)");
        } catch (e) {
          // Ignorer si l'index existe déjà
        }
        console.log('🔑 Table user_sessions minimale créée');
      }
    } catch (error) {
      console.warn("⚠️ Impossible de vérifier/créer la table user_sessions:", error.message);
    }
  }

  /**
   * S'assurer que la table widgets contient les colonnes étendues
   */
  async ensureWidgetsExtendedSchema(conn) {
    const alterQueries = [
      "ALTER TABLE widgets ADD COLUMN IF NOT EXISTS nameKey VARCHAR(255)",
      "ALTER TABLE widgets ADD COLUMN IF NOT EXISTS descriptionKey VARCHAR(255)",
      "ALTER TABLE widgets ADD COLUMN IF NOT EXISTS default_width INT DEFAULT 4",
      "ALTER TABLE widgets ADD COLUMN IF NOT EXISTS default_height INT DEFAULT 2"
    ];
    for (const q of alterQueries) {
      try {
        await conn.query(q);
      } catch (error) {
        if (!String(error.message).includes('Duplicate column')) {
          console.warn('⚠️ Erreur ALTER widgets:', error.message);
        }
      }
    }
  }

  /**
   * Créer les tables LinkPoint si elles n'existent pas
   */
  async ensureLinkPointsSchema(conn) {
    const queries = [
      `CREATE TABLE IF NOT EXISTS linkpoints (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        type ENUM('external','generated','links') NOT NULL,
        slug VARCHAR(100) NOT NULL UNIQUE,
        logo_url VARCHAR(255),
        theme JSON,
        external_url VARCHAR(1024),
        owner_user_id INT,
        company_id INT,
        archived TINYINT(1) DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )`,
      `CREATE TABLE IF NOT EXISTS linkpoint_links (
        id INT AUTO_INCREMENT PRIMARY KEY,
        linkpoint_id INT NOT NULL,
        label VARCHAR(255) NOT NULL,
        url VARCHAR(1024) NOT NULL,
        icon VARCHAR(100),
        sort_order INT DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (linkpoint_id) REFERENCES linkpoints(id) ON DELETE CASCADE
      )`,
      `CREATE TABLE IF NOT EXISTS linkpoint_events (
        id BIGINT AUTO_INCREMENT PRIMARY KEY,
        linkpoint_id INT NOT NULL,
        event_type ENUM('scan','click') NOT NULL,
        link_id INT NULL,
        occurred_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        ip VARCHAR(64),
        user_agent VARCHAR(255),
        referrer VARCHAR(1024),
        country_code VARCHAR(3),
        region VARCHAR(64),
        device_type VARCHAR(32),
        FOREIGN KEY (linkpoint_id) REFERENCES linkpoints(id) ON DELETE CASCADE
      )`,
      `CREATE TABLE IF NOT EXISTS linkpoint_stats_daily (
        id BIGINT AUTO_INCREMENT PRIMARY KEY,
        linkpoint_id INT NOT NULL,
        stat_date DATE NOT NULL,
        scans INT DEFAULT 0,
        clicks INT DEFAULT 0,
        ctr DECIMAL(5,2) DEFAULT 0,
        UNIQUE KEY uniq_lp_day (linkpoint_id, stat_date),
        FOREIGN KEY (linkpoint_id) REFERENCES linkpoints(id) ON DELETE CASCADE
      )`
    ];

    for (const q of queries) {
      try {
        await conn.query(q);
      } catch (error) {
        const msg = String(error.message || '');
        if (!msg.includes('Duplicate') && !msg.includes("doesn't exist")) {
          console.warn('⚠️ Erreur création tables LinkPoint:', error.message);
        }
      }
    }
  }

  // Nouveau: Domaines personnalisés par entreprise
  async ensureCustomDomainsSchema(conn) {
    const queries = [
      `CREATE TABLE IF NOT EXISTS company_custom_domains (
        id INT AUTO_INCREMENT PRIMARY KEY,
        company_id INT NOT NULL,
        domain VARCHAR(255) NOT NULL UNIQUE,
        is_active TINYINT(1) DEFAULT 0,
        verification_token VARCHAR(64),
        verified_at TIMESTAMP NULL DEFAULT NULL,
        ssl_status ENUM('unknown','pending','valid','invalid') DEFAULT 'unknown',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE CASCADE
      )`
    ];

    for (const q of queries) {
      try {
        await conn.query(q);
      } catch (error) {
        const msg = String(error.message || '');
        if (!msg.includes('Duplicate') && !msg.includes("doesn't exist")) {
          console.warn('⚠️ Erreur création table company_custom_domains:', error.message);
        }
      }
    }
  }

  // ensureLinkPointFoldersSchema supprimé pour revenir à l'état précédent

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
      let conn;
      let user;
      try {
        conn = await this.getConnection();
        const rows = await conn.query(
          'SELECT id, email, first_name, last_name, role FROM users WHERE confirmation_token = ? AND token_expiry > NOW()',
          [token]
        );
        user = rows.length > 0 ? rows[0] : null;
        if (!user) {
          throw new Error('Token de confirmation invalide ou expiré');
        }
        await conn.query(
          'UPDATE users SET is_active = 1, email_verified = 1, confirmation_token = NULL, token_expiry = NULL, updated_at = NOW() WHERE id = ?',
          [user.id]
        );
      } finally {
        if (conn) conn.release();
      }

      await this.logAudit(
        user.id,
        null,
        'USER_CONFIRMED',
        'users',
        { email: user.email }
      );

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
        [resetToken, tokenExpiry.toISOString().slice(0, 19).replace('T', ' '), user.id]
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
      let newUser;
      try {
        conn = await this.getConnection();
        
        // Insérer l'utilisateur avec is_active = 1 (compte actif pour les tests)
        const result = await conn.query(
          `INSERT INTO users (email, password_hash, first_name, last_name, role, confirmation_token, token_expiry, is_active) 
           VALUES (?, ?, ?, ?, ?, ?, ?, 1)`,
          [email, passwordHash, firstName, lastName, role, confirmationToken, tokenExpiry.toISOString().slice(0, 19).replace('T', ' ')]
        );

        // Log d'audit
        await this.logAudit(result.insertId, null, 'USER_CREATED', 'users', {
          email,
          role
        });

        newUser = {
          id: Number(result.insertId),
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
          JSON.stringify({ userId, isActive, action: 'status_update' }, (k, v) => typeof v === 'bigint' ? Number(v) : v)
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

      return companies.map(company => {
        let permissions = {};
        try {
          // Certaines anciennes entrées peuvent contenir des permissions non JSON
          permissions = JSON.parse(company.permissions || '{}');
        } catch (parseError) {
          console.warn('⚠️ Permissions invalides pour la société', { companyId: company.id, permissions: company.permissions });
          permissions = {};
        }
        return {
          ...company,
          permissions
        };
      });
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
      const conn = await this.getConnection();
      await conn.query(
        `INSERT INTO audit_logs (user_id, company_id, action, resource, details, ip_address) 
         VALUES (?, ?, ?, ?, ?, ?)`,
        [userId, companyId, action, resource, JSON.stringify(details, (k, v) => typeof v === 'bigint' ? Number(v) : v), ipAddress]
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
    let conn;
    try {
      conn = await this.mariadb.getConnection();
      const debug = process.env.DB_DEBUG_SQL === '1' || process.env.DB_DEBUG_SQL === 'true';
      if (debug) {
        console.log('🔎 SQL query:', sql);
        if (params && params.length) console.log('   ↳ params:', params);
      }
      const result = await conn.query(sql, params);
      return result;
    } catch (error) {
      console.error('❌ Erreur requête query:', error.message || error);
      console.error('   ↳ SQL:', sql);
      if (params && params.length) console.error('   ↳ params:', params);
      throw error;
    } finally {
      if (conn) conn.release();
    }
  }

  /**
   * Exécuter une requête qui retourne un seul résultat
   */
  async get(sql, params = []) {
    let conn;
    try {
      conn = await this.mariadb.getConnection();
      const debug = process.env.DB_DEBUG_SQL === '1' || process.env.DB_DEBUG_SQL === 'true';
      if (debug) {
        console.log('🔎 SQL get:', sql);
        if (params && params.length) console.log('   ↳ params:', params);
      }
      const result = await conn.query(sql, params);
      return result[0] || null;
    } catch (error) {
      console.error('❌ Erreur requête get:', error.message || error);
      console.error('   ↳ SQL:', sql);
      if (params && params.length) console.error('   ↳ params:', params);
      throw error;
    } finally {
      if (conn) conn.release();
    }
  }

  /**
   * Exécuter une requête de modification (INSERT, UPDATE, DELETE)
   */
  async run(sql, params = []) {
    let conn;
    try {
      conn = await this.mariadb.getConnection();
      const debug = process.env.DB_DEBUG_SQL === '1' || process.env.DB_DEBUG_SQL === 'true';
      if (debug) {
        console.log('🔎 SQL run:', sql);
        if (params && params.length) console.log('   ↳ params:', params);
      }
      const result = await conn.query(sql, params);
      return result;
    } catch (error) {
      console.error('❌ Erreur requête run:', error.message || error);
      console.error('   ↳ SQL:', sql);
      if (params && params.length) console.error('   ↳ params:', params);
      throw error;
    } finally {
      if (conn) conn.release();
    }
  }

  /**
   * Récupérer un projet par son ID
   */
  async getProjectById(projectId) {
    let conn;
    try {
      const conn = await this.mariadb.getConnection();
      const result = await conn.query(
        'SELECT * FROM projects WHERE id = ?',
        [projectId]
      );
      const project = result[0] || null;
      return project;
    } catch (error) {
      console.error('❌ Erreur récupération projet par ID:', error);
      throw error;
    } finally {
      if (conn) conn.release();
    }
  }

  /**
   * Récupérer les tâches d'un projet spécifique
   */
  async getProjectTasks(projectId) {
    let conn;
    try {
      const conn = await this.mariadb.getConnection();
      const tasks = await conn.query(
        'SELECT * FROM tasks WHERE project_id = ? ORDER BY created_at DESC',
        [projectId]
      );
      return tasks;
    } catch (error) {
      console.error('❌ Erreur récupération tâches du projet:', error);
      return [];
    } finally {
      if (conn) conn.release();
    }
  }

  /**
   * Récupérer les fichiers d'un projet spécifique
   */
  async getProjectFiles(projectId) {
    let conn;
    try {
      const conn = await this.mariadb.getConnection();
      const files = await conn.query(
        'SELECT * FROM files WHERE project_id = ? ORDER BY created_at DESC',
        [projectId]
      );
      return files;
    } catch (error) {
      console.error('❌ Erreur récupération fichiers du projet:', error);
      return [];
    } finally {
      if (conn) conn.release();
    }
  }

  /**
   * Récupérer les membres de l'équipe d'un projet spécifique
   */
  async getProjectTeamMembers(projectId) {
    let conn;
    try {
      const conn = await this.mariadb.getConnection();
      const members = await conn.query(
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
    } finally {
      if (conn) conn.release();
    }
  }

  /**
   * Vérifier la connexion à la base de données
   */
  async checkConnection() {
    let conn;
    try {
      if (!this.pool) {
        return { connected: false, error: 'Base de données non initialisée' };
      }
      conn = await this.mariadb.getConnection();
      await conn.query('SELECT 1');
      return { connected: true };
    } catch (error) {
      console.error('❌ Erreur vérification connexion DB:', error);
      return { connected: false, error: error.message };
    } finally {
      if (conn) conn.release();
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