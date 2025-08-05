PRAGMA foreign_keys=OFF;
BEGIN TRANSACTION;
CREATE TABLE users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    first_name VARCHAR(100),
    last_name VARCHAR(100),
    role VARCHAR(50) DEFAULT 'user',
    is_active BOOLEAN DEFAULT 1,
    confirmation_token VARCHAR(255),
    token_expiry DATETIME,
    reset_token VARCHAR(255),
    reset_token_expiry DATETIME,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    last_login DATETIME
);
INSERT INTO users VALUES(1,'admin@fusepoint.com','$2b$10$example_hash','Admin','Fusepoint','admin',1,NULL,NULL,NULL,NULL,'2025-08-04 09:46:23','2025-08-04 09:46:23',NULL);
INSERT INTO users VALUES(2,'demo@example.com','$2b$10$example_hash','Demo','User','user',1,NULL,NULL,NULL,NULL,'2025-08-04 09:46:23','2025-08-04 09:46:23',NULL);
INSERT INTO users VALUES(3,'agent@fusepoint.com','$2b$10$example_hash','Agent','Fusepoint','agent',1,NULL,NULL,NULL,NULL,'2025-08-04 09:46:23','2025-08-04 09:46:23',NULL);
CREATE TABLE companies (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name VARCHAR(255) NOT NULL,
    industry VARCHAR(100),
    size VARCHAR(50),
    location VARCHAR(255),
    website VARCHAR(255),
    description TEXT,
    logo_url VARCHAR(500),
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
INSERT INTO companies VALUES(1,'Fusepoint Demo','Marketing Digital','PME','France','https://fusepoint.com',NULL,NULL,'2025-08-04 09:46:23','2025-08-04 09:46:23');
INSERT INTO companies VALUES(2,'E-commerce Plus','E-commerce','Startup','Paris, France','https://ecommerce-plus.com',NULL,NULL,'2025-08-04 09:46:23','2025-08-04 09:46:23');
CREATE TABLE user_companies (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    company_id INTEGER NOT NULL,
    role VARCHAR(50) DEFAULT 'member',
    permissions TEXT, -- JSON des permissions
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE CASCADE,
    UNIQUE(user_id, company_id)
);
INSERT INTO user_companies VALUES(1,1,1,'owner','{"admin": true, "analytics": true, "social": true}','2025-08-04 09:46:23');
INSERT INTO user_companies VALUES(2,2,2,'admin','{"analytics": true, "social": true}','2025-08-04 09:46:23');
CREATE TABLE api_configurations (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    company_id INTEGER NOT NULL,
    service_type VARCHAR(50) NOT NULL, -- 'google_analytics', 'facebook', 'email', etc.
    config_data TEXT NOT NULL, -- JSON chiffré des configurations
    is_active BOOLEAN DEFAULT 1,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE CASCADE,
    UNIQUE(company_id, service_type)
);
CREATE TABLE user_sessions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    session_token VARCHAR(255) UNIQUE NOT NULL,
    expires_at DATETIME NOT NULL,
    ip_address VARCHAR(45),
    user_agent TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);
CREATE TABLE audit_logs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER,
    company_id INTEGER,
    action VARCHAR(100) NOT NULL,
    resource VARCHAR(100),
    details TEXT, -- JSON des détails
    ip_address VARCHAR(45),
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL,
    FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE SET NULL
);
CREATE TABLE platform_settings (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    key VARCHAR(255) UNIQUE NOT NULL,
    value TEXT,
    type VARCHAR(50) DEFAULT 'string', -- 'string', 'number', 'boolean', 'json'
    category VARCHAR(100) DEFAULT 'general',
    description TEXT,
    is_sensitive BOOLEAN DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
INSERT INTO platform_settings VALUES(1,'platform_name','Fusepoint Hub','string','general','Nom de la plateforme',0,'2025-08-04 09:46:23','2025-08-04 09:46:23');
INSERT INTO platform_settings VALUES(2,'platform_version','1.0.0','string','general','Version de la plateforme',0,'2025-08-04 09:46:23','2025-08-04 09:46:23');
INSERT INTO platform_settings VALUES(3,'maintenance_mode','false','boolean','system','Mode maintenance activé',0,'2025-08-04 09:46:23','2025-08-04 09:46:23');
INSERT INTO platform_settings VALUES(4,'max_users_per_company','50','number','limits','Nombre maximum d''utilisateurs par entreprise',0,'2025-08-04 09:46:23','2025-08-04 09:46:23');
INSERT INTO platform_settings VALUES(5,'session_timeout','3600','number','security','Durée de session en secondes',0,'2025-08-04 09:46:23','2025-08-04 09:46:23');
CREATE TABLE roles (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT UNIQUE NOT NULL,
        description TEXT,
        is_system_role BOOLEAN DEFAULT 0,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      );
INSERT INTO roles VALUES(1,'super_admin','Super Administrateur avec tous les droits',1,'2025-08-04 09:46:23','2025-08-04 09:46:23');
INSERT INTO roles VALUES(2,'agent','Agent',1,'2025-08-04 09:46:23','2025-08-04 09:46:23');
INSERT INTO roles VALUES(3,'admin','Administrateur',1,'2025-08-04 09:46:23','2025-08-04 09:46:23');
INSERT INTO roles VALUES(4,'user','Utilisateur standard',1,'2025-08-04 09:46:23','2025-08-04 09:46:23');
CREATE TABLE service_requests (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    company_id INTEGER,
    user_id INTEGER NOT NULL,
    service_id INTEGER,
    status VARCHAR(50) DEFAULT 'pending',
    priority VARCHAR(20) DEFAULT 'medium',
    title VARCHAR(255) NOT NULL,
    description TEXT,
    service_type VARCHAR(100),
    budget_range VARCHAR(100),
    deadline DATE,
    assigned_to INTEGER,
    estimated_completion DATE,
    actual_completion DATE,
    client_feedback TEXT,
    internal_notes TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
CREATE TABLE prestataire_invitations (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    email VARCHAR(255) NOT NULL,
    token VARCHAR(255) UNIQUE NOT NULL,
    agent_id INTEGER NOT NULL,
    role VARCHAR(50) DEFAULT 'prestataire',
    status VARCHAR(50) DEFAULT 'pending', -- 'pending', 'accepted', 'expired', 'cancelled'
    invited_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    expires_at DATETIME NOT NULL,
    accepted_at DATETIME,
    created_user_id INTEGER, -- ID de l'utilisateur créé après acceptation
    invitation_data TEXT, -- JSON avec données supplémentaires (nom, prénom suggérés, etc.)
    FOREIGN KEY (agent_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (created_user_id) REFERENCES users(id) ON DELETE SET NULL
);
INSERT INTO prestataire_invitations VALUES(1,'prestataire.test@example.com','test-token-123',3,'prestataire','pending','2025-08-04 09:46:23','2025-08-11 09:46:23',NULL,NULL,'{"firstName": "Jean", "lastName": "Dupont", "speciality": "Développement web"}');
CREATE TABLE agent_prestataires (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    agent_id INTEGER NOT NULL,
    prestataire_id INTEGER NOT NULL,
    relationship_type VARCHAR(50) DEFAULT 'collaborator', -- 'collaborator', 'subcontractor', 'partner'
    permissions TEXT, -- JSON des permissions spécifiques
    status VARCHAR(50) DEFAULT 'active', -- 'active', 'inactive', 'suspended'
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (agent_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (prestataire_id) REFERENCES users(id) ON DELETE CASCADE,
    UNIQUE(agent_id, prestataire_id)
);
CREATE TABLE prestataire_tasks (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    prestataire_id INTEGER NOT NULL,
    agent_id INTEGER NOT NULL,
    client_id INTEGER, -- Optionnel, si la tâche est liée à un client spécifique
    status VARCHAR(50) DEFAULT 'assigned', -- 'assigned', 'in_progress', 'completed', 'cancelled'
    priority VARCHAR(50) DEFAULT 'medium', -- 'low', 'medium', 'high', 'urgent'
    due_date DATETIME,
    completed_at DATETIME,
    task_data TEXT, -- JSON avec données spécifiques de la tâche
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (prestataire_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (agent_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (client_id) REFERENCES users(id) ON DELETE SET NULL
);
INSERT INTO prestataire_tasks VALUES(1,'Création site web client','Développer un site web responsive pour le client XYZ',1,3,NULL,'assigned','medium',NULL,NULL,'{"technologies": ["Vue.js", "Tailwind CSS"], "budget": 2500, "deadline": "2024-02-15"}','2025-08-04 09:46:23','2025-08-04 09:46:23');
INSERT INTO prestataire_tasks VALUES(2,'Création site web client','Développer un site web responsive pour le client XYZ',1,3,NULL,'assigned','medium',NULL,NULL,'{"technologies": ["Vue.js", "Tailwind CSS"], "budget": 2500, "deadline": "2024-02-15"}','2025-08-04 09:46:23','2025-08-04 09:46:23');
INSERT INTO prestataire_tasks VALUES(3,'Création site web client','Développer un site web responsive pour le client XYZ',1,3,NULL,'assigned','medium',NULL,NULL,'{"technologies": ["Vue.js", "Tailwind CSS"], "budget": 2500, "deadline": "2024-02-15"}','2025-08-04 09:46:23','2025-08-04 09:46:23');
INSERT INTO prestataire_tasks VALUES(4,'Création site web client','Développer un site web responsive pour le client XYZ',1,3,NULL,'assigned','medium',NULL,NULL,'{"technologies": ["Vue.js", "Tailwind CSS"], "budget": 2500, "deadline": "2024-02-15"}','2025-08-04 09:46:23','2025-08-04 09:46:23');
INSERT INTO prestataire_tasks VALUES(5,'Création site web client','Développer un site web responsive pour le client XYZ',1,3,NULL,'assigned','medium',NULL,NULL,'{"technologies": ["Vue.js", "Tailwind CSS"], "budget": 2500, "deadline": "2024-02-15"}','2025-08-04 09:46:23','2025-08-04 09:46:23');
CREATE TABLE users_temp (
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
          );
CREATE TABLE client_prestataire_assignments (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    client_id INTEGER NOT NULL,
    prestataire_id INTEGER NOT NULL,
    agent_id INTEGER NOT NULL, -- L'agent qui a fait l'assignation
    assignment_type VARCHAR(50) DEFAULT 'service', -- 'service', 'project', 'consultation'
    status VARCHAR(50) DEFAULT 'active', -- 'active', 'inactive', 'completed'
    assigned_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    notes TEXT, -- Notes de l'agent sur l'assignation
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (client_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (prestataire_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (agent_id) REFERENCES users(id) ON DELETE CASCADE,
    UNIQUE(client_id, prestataire_id, agent_id)
);
CREATE TABLE agency_services (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    category VARCHAR(100),
    price_type VARCHAR(50),
    base_price DECIMAL(10,2),
    duration_estimate VARCHAR(100),
    deliverables TEXT,
    requirements TEXT,
    is_active BOOLEAN DEFAULT 1,
    display_order INTEGER DEFAULT 0,
    icon VARCHAR(100),
    color VARCHAR(50),
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
INSERT INTO agency_services VALUES(1,'Audit SEO Complet','Analyse approfondie de votre référencement naturel avec plan d''action détaillé','analysis','fixed',497,'3-5 jours','["Rapport d''audit SEO", "Plan d''action priorisé", "Recommandations techniques"]','["Accès Google Analytics", "Accès Search Console"]',1,1,'search','blue','2025-08-04 09:46:23','2025-08-04 09:46:23');
INSERT INTO agency_services VALUES(2,'Création de Campagne Facebook Ads','Conception et lancement d''une campagne publicitaire Facebook optimisée','advertising','project',299,'2-3 jours','["Stratégie de campagne", "Visuels publicitaires", "Configuration complète"]','["Compte Facebook Business", "Budget publicitaire défini"]',1,2,'facebook','blue','2025-08-04 09:46:23','2025-08-04 09:46:23');
INSERT INTO agency_services VALUES(3,'Rédaction de Contenu Blog','Articles de blog optimisés SEO pour votre secteur d''activité','creation','fixed',149,'5-7 jours','["Article optimisé SEO", "Images d''illustration", "Méta-descriptions"]','["Brief détaillé", "Mots-clés cibles"]',1,3,'edit','green','2025-08-04 09:46:23','2025-08-04 09:46:23');
INSERT INTO agency_services VALUES(4,'Optimisation de Conversion','Amélioration du taux de conversion de votre site web','strategy','project',799,'1-2 semaines','["Audit UX/UI", "Tests A/B", "Recommandations d''optimisation"]','["Accès Google Analytics", "Trafic minimum 1000 visiteurs/mois"]',1,4,'trending-up','orange','2025-08-04 09:46:23','2025-08-04 09:46:23');
INSERT INTO agency_services VALUES(5,'Formation Google Analytics','Formation personnalisée pour maîtriser Google Analytics','technical','hourly',89,'2 heures','["Session de formation", "Support de cours", "Suivi post-formation"]','["Compte Google Analytics configuré"]',1,5,'academic-cap','purple','2025-08-04 09:46:23','2025-08-04 09:46:23');
CREATE TABLE fusepoint_recommendations (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    company_id INTEGER NOT NULL,
    type VARCHAR(100) NOT NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    priority INTEGER DEFAULT 1,
    status VARCHAR(50) DEFAULT 'pending',
    client_response VARCHAR(50),
    scheduled_date DATETIME,
    action_data TEXT,
    estimated_impact VARCHAR(100),
    category VARCHAR(100),
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
INSERT INTO fusepoint_recommendations VALUES(1,1,'seo','Optimiser les méta-descriptions','Vos méta-descriptions sont trop courtes et n''incitent pas au clic',3,'pending',NULL,NULL,NULL,NULL,'SEO','2025-08-04 09:46:23','2025-08-04 09:46:23');
INSERT INTO fusepoint_recommendations VALUES(2,1,'analytics','Configurer les objectifs de conversion','Aucun objectif de conversion n''est configuré dans Google Analytics',2,'pending',NULL,NULL,NULL,NULL,'Analytics','2025-08-04 09:46:23','2025-08-04 09:46:23');
INSERT INTO fusepoint_recommendations VALUES(3,1,'content','Créer du contenu pour le blog','Votre blog n''a pas été mis à jour depuis 3 mois',1,'pending',NULL,NULL,NULL,NULL,'Contenu','2025-08-04 09:46:23','2025-08-04 09:46:23');
CREATE TABLE notifications (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    company_id INTEGER,
    type VARCHAR(100) NOT NULL,
    title VARCHAR(255) NOT NULL,
    message TEXT,
    data TEXT,
    action_url VARCHAR(500),
    is_read BOOLEAN DEFAULT 0,
    read_at DATETIME,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
INSERT INTO notifications VALUES(1,1,1,'recommendation','Nouvelle recommandation disponible','Une nouvelle recommandation SEO a été générée pour votre site',NULL,NULL,0,NULL,'2025-08-04 09:46:23');
INSERT INTO notifications VALUES(2,1,1,'service_update','Mise à jour de votre demande','Votre demande d''audit SEO est en cours de traitement',NULL,NULL,0,NULL,'2025-08-04 09:46:23');
INSERT INTO notifications VALUES(3,1,1,'info','Bienvenue sur Fusepoint','Découvrez toutes les fonctionnalités de votre tableau de bord',NULL,NULL,1,NULL,'2025-08-04 09:46:23');
CREATE TABLE conversations (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    client_id INTEGER NOT NULL,
    agent_id INTEGER NOT NULL,
    title TEXT NOT NULL,
    status TEXT DEFAULT 'active',
    last_message_at DATETIME,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
CREATE TABLE request_status_history (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    request_id INTEGER NOT NULL,
    old_status VARCHAR(50),
    new_status VARCHAR(50) NOT NULL,
    changed_by INTEGER,
    comment TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (request_id) REFERENCES service_requests(id) ON DELETE CASCADE
);
CREATE TABLE messages (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          conversation_id INTEGER NOT NULL,
          sender_id INTEGER NOT NULL,
          recipient_id INTEGER NOT NULL,
          message_type TEXT DEFAULT 'text',
          content TEXT NOT NULL,
          file_url TEXT,
          file_name TEXT,
          file_size INTEGER,
          mime_type TEXT,
          is_system BOOLEAN DEFAULT 0,
          read_at DATETIME,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        );
CREATE TABLE conversation_participants (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          conversation_id INTEGER NOT NULL,
          user_id INTEGER NOT NULL,
          role TEXT DEFAULT 'participant',
          joined_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          last_read_at DATETIME,
          UNIQUE(conversation_id, user_id)
        );
CREATE TABLE chat_notifications (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          user_id INTEGER NOT NULL,
          conversation_id INTEGER NOT NULL,
          message_id INTEGER,
          notification_type TEXT DEFAULT 'message',
          title TEXT,
          message TEXT,
          is_read BOOLEAN DEFAULT 0,
          read_at DATETIME,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        );
CREATE TABLE permissions (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT UNIQUE NOT NULL,
        description TEXT,
        category TEXT DEFAULT 'general',
        resource TEXT,
        action TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      );
INSERT INTO permissions VALUES(1,'system.view_health','Voir la santé du système','system','system','view_health','2025-08-04 09:46:23');
INSERT INTO permissions VALUES(2,'system.view_logs','Voir les logs système','system','system','view_logs','2025-08-04 09:46:23');
INSERT INTO permissions VALUES(3,'system.backup','Créer des sauvegardes','system','system','backup','2025-08-04 09:46:23');
INSERT INTO permissions VALUES(4,'users.create','Créer des utilisateurs','users','users','create','2025-08-04 09:46:23');
INSERT INTO permissions VALUES(5,'users.update','Modifier les utilisateurs','users','users','update','2025-08-04 09:46:23');
INSERT INTO permissions VALUES(6,'users.delete','Supprimer les utilisateurs','users','users','delete','2025-08-04 09:46:23');
INSERT INTO permissions VALUES(7,'user_management','Gestion complète des utilisateurs','users','users','management','2025-08-04 09:46:23');
INSERT INTO permissions VALUES(8,'roles.create','Créer des rôles','roles','roles','create','2025-08-04 09:46:23');
INSERT INTO permissions VALUES(9,'roles.read','Voir les rôles','roles','roles','read','2025-08-04 09:46:23');
INSERT INTO permissions VALUES(10,'roles.update','Modifier les rôles','roles','roles','update','2025-08-04 09:46:23');
INSERT INTO permissions VALUES(11,'settings.read','Voir les paramètres','settings','settings','read','2025-08-04 09:46:23');
INSERT INTO permissions VALUES(12,'settings.update','Modifier les paramètres','settings','settings','update','2025-08-04 09:46:23');
INSERT INTO permissions VALUES(13,'platform.settings.write','Écrire les paramètres de plateforme','platform','platform','settings_write','2025-08-04 09:46:23');
INSERT INTO permissions VALUES(14,'roles.delete','Supprimer les rôles','roles','roles','delete','2025-08-04 09:46:23');
INSERT INTO permissions VALUES(15,'users.read','Voir les utilisateurs','users','users','read','2025-08-04 09:46:23');
INSERT INTO permissions VALUES(16,'agents.manage','Gérer les agents','agents','agents','manage','2025-08-04 09:46:23');
INSERT INTO permissions VALUES(17,'agents.view','Voir les agents','agents','agents','view','2025-08-04 09:46:23');
INSERT INTO permissions VALUES(18,'accompagnement.create','Créer des accompagnements','accompagnement','accompagnement','create','2025-08-04 09:46:23');
INSERT INTO permissions VALUES(19,'accompagnement.read','Voir les accompagnements','accompagnement','accompagnement','read','2025-08-04 09:46:23');
INSERT INTO permissions VALUES(20,'accompagnement.update','Modifier les accompagnements','accompagnement','accompagnement','update','2025-08-04 09:46:23');
INSERT INTO permissions VALUES(21,'accompagnement.delete','Supprimer les accompagnements','accompagnement','accompagnement','delete','2025-08-04 09:46:23');
INSERT INTO permissions VALUES(22,'system_backup','Créer des sauvegardes système','system','system','backup','2025-08-04 09:46:23');
INSERT INTO permissions VALUES(23,'platform.logs.read','Lire les logs de plateforme','platform','platform','logs_read','2025-08-04 09:46:23');
INSERT INTO permissions VALUES(24,'system.manage','Gérer le système','system','system','manage','2025-08-04 09:46:23');
CREATE TABLE role_permissions (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        role_id INTEGER NOT NULL,
        permission_id INTEGER NOT NULL,
        granted BOOLEAN DEFAULT 1,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (role_id) REFERENCES roles (id) ON DELETE CASCADE,
        FOREIGN KEY (permission_id) REFERENCES permissions (id) ON DELETE CASCADE,
        UNIQUE(role_id, permission_id)
      );
INSERT INTO role_permissions VALUES(1,1,18,1,'2025-08-04 09:46:24');
INSERT INTO role_permissions VALUES(2,1,16,1,'2025-08-04 09:46:24');
INSERT INTO role_permissions VALUES(3,1,17,1,'2025-08-04 09:46:24');
INSERT INTO role_permissions VALUES(4,1,23,1,'2025-08-04 09:46:24');
INSERT INTO role_permissions VALUES(5,1,13,1,'2025-08-04 09:46:24');
INSERT INTO role_permissions VALUES(6,1,8,1,'2025-08-04 09:46:24');
INSERT INTO role_permissions VALUES(7,1,14,1,'2025-08-04 09:46:24');
INSERT INTO role_permissions VALUES(8,1,9,1,'2025-08-04 09:46:24');
INSERT INTO role_permissions VALUES(9,1,10,1,'2025-08-04 09:46:24');
INSERT INTO role_permissions VALUES(10,1,11,1,'2025-08-04 09:46:24');
INSERT INTO role_permissions VALUES(11,1,12,1,'2025-08-04 09:46:24');
INSERT INTO role_permissions VALUES(12,1,3,1,'2025-08-04 09:46:24');
INSERT INTO role_permissions VALUES(13,1,24,1,'2025-08-04 09:46:24');
INSERT INTO role_permissions VALUES(14,1,1,1,'2025-08-04 09:46:24');
INSERT INTO role_permissions VALUES(15,1,2,1,'2025-08-04 09:46:24');
INSERT INTO role_permissions VALUES(16,1,22,1,'2025-08-04 09:46:24');
INSERT INTO role_permissions VALUES(17,1,7,1,'2025-08-04 09:46:24');
INSERT INTO role_permissions VALUES(18,1,4,1,'2025-08-04 09:46:24');
INSERT INTO role_permissions VALUES(19,1,6,1,'2025-08-04 09:46:24');
INSERT INTO role_permissions VALUES(20,1,15,1,'2025-08-04 09:46:24');
INSERT INTO role_permissions VALUES(21,1,5,1,'2025-08-04 09:46:24');
INSERT INTO role_permissions VALUES(22,1,19,1,'2025-08-04 09:46:24');
INSERT INTO role_permissions VALUES(23,1,20,1,'2025-08-04 09:46:24');
INSERT INTO role_permissions VALUES(24,1,21,1,'2025-08-04 09:46:24');
CREATE TABLE user_roles (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL,
        role_id INTEGER NOT NULL,
        assigned_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        assigned_by INTEGER,
        FOREIGN KEY (role_id) REFERENCES roles (id) ON DELETE CASCADE,
        UNIQUE(user_id, role_id)
      );
CREATE TABLE system_logs (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        level TEXT NOT NULL,
        message TEXT NOT NULL,
        category TEXT DEFAULT 'general',
        user_id INTEGER,
        ip_address TEXT,
        user_agent TEXT,
        metadata TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      );
INSERT INTO system_logs VALUES(1,'info','Application démarrée avec succès','system',NULL,NULL,NULL,'{"version":"1.0.0"}','2025-08-04 09:46:23');
INSERT INTO system_logs VALUES(2,'info','Sauvegarde automatique effectuée','backup',NULL,NULL,NULL,'{"size":"2.5MB","duration":"15s"}','2025-08-04 09:46:23');
INSERT INTO system_logs VALUES(3,'warning','Tentative de connexion avec mot de passe incorrect','security',NULL,'192.168.1.100',NULL,'{"attempts":3}','2025-08-04 09:46:23');
INSERT INTO system_logs VALUES(4,'error','Erreur de connexion à la base de données','database',NULL,NULL,NULL,'{"error":"Connection timeout"}','2025-08-04 09:46:23');
INSERT INTO system_logs VALUES(5,'info','Utilisateur connecté','auth',1,'127.0.0.1',NULL,'{"loginMethod":"email"}','2025-08-04 09:46:23');
DELETE FROM sqlite_sequence;
INSERT INTO sqlite_sequence VALUES('users',3);
INSERT INTO sqlite_sequence VALUES('companies',2);
INSERT INTO sqlite_sequence VALUES('user_companies',10);
INSERT INTO sqlite_sequence VALUES('platform_settings',25);
INSERT INTO sqlite_sequence VALUES('prestataire_invitations',5);
INSERT INTO sqlite_sequence VALUES('prestataire_tasks',5);
INSERT INTO sqlite_sequence VALUES('agency_services',5);
INSERT INTO sqlite_sequence VALUES('fusepoint_recommendations',3);
INSERT INTO sqlite_sequence VALUES('notifications',3);
INSERT INTO sqlite_sequence VALUES('roles',4);
INSERT INTO sqlite_sequence VALUES('permissions',24);
INSERT INTO sqlite_sequence VALUES('system_logs',5);
INSERT INTO sqlite_sequence VALUES('role_permissions',24);
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_user_companies_user_id ON user_companies(user_id);
CREATE INDEX idx_user_companies_company_id ON user_companies(company_id);
CREATE INDEX idx_api_configurations_company_id ON api_configurations(company_id);
CREATE INDEX idx_user_sessions_token ON user_sessions(session_token);
CREATE INDEX idx_user_sessions_user_id ON user_sessions(user_id);
CREATE INDEX idx_audit_logs_user_id ON audit_logs(user_id);
CREATE INDEX idx_audit_logs_company_id ON audit_logs(company_id);
CREATE INDEX idx_audit_logs_created_at ON audit_logs(created_at);
CREATE INDEX idx_platform_settings_key ON platform_settings(key);
CREATE INDEX idx_platform_settings_category ON platform_settings(category);
CREATE INDEX idx_service_requests_user_id ON service_requests(user_id);
CREATE INDEX idx_service_requests_status ON service_requests(status);
CREATE INDEX idx_service_requests_priority ON service_requests(priority);
CREATE INDEX idx_prestataire_invitations_token ON prestataire_invitations(token);
CREATE INDEX idx_prestataire_invitations_email ON prestataire_invitations(email);
CREATE INDEX idx_prestataire_invitations_agent ON prestataire_invitations(agent_id);
CREATE INDEX idx_prestataire_invitations_status ON prestataire_invitations(status);
CREATE INDEX idx_agent_prestataires_agent ON agent_prestataires(agent_id);
CREATE INDEX idx_agent_prestataires_prestataire ON agent_prestataires(prestataire_id);
CREATE INDEX idx_prestataire_tasks_prestataire ON prestataire_tasks(prestataire_id);
CREATE INDEX idx_prestataire_tasks_agent ON prestataire_tasks(agent_id);
CREATE INDEX idx_prestataire_tasks_status ON prestataire_tasks(status);
CREATE INDEX idx_prestataire_tasks_due_date ON prestataire_tasks(due_date);
CREATE INDEX idx_client_prestataire_assignments_client ON client_prestataire_assignments(client_id);
CREATE INDEX idx_client_prestataire_assignments_prestataire ON client_prestataire_assignments(prestataire_id);
CREATE INDEX idx_client_prestataire_assignments_agent ON client_prestataire_assignments(agent_id);
CREATE INDEX idx_client_prestataire_assignments_status ON client_prestataire_assignments(status);
CREATE INDEX idx_conversations_client_agent ON conversations(client_id, agent_id);
CREATE INDEX idx_messages_conversation ON messages(conversation_id);
CREATE INDEX idx_conversation_participants_conversation ON conversation_participants(conversation_id);
CREATE INDEX idx_conversation_participants_user ON conversation_participants(user_id);
CREATE INDEX idx_chat_notifications_user ON chat_notifications(user_id);
CREATE INDEX idx_chat_notifications_conversation ON chat_notifications(conversation_id);
CREATE INDEX idx_chat_notifications_read ON chat_notifications(is_read);
COMMIT;
