-- Schema de base de données pour Fusepoint Hub
-- Base de données sécurisée pour les informations d'entreprise

-- Table des utilisateurs
CREATE TABLE IF NOT EXISTS users (
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

-- Table des entreprises
CREATE TABLE IF NOT EXISTS companies (
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

-- Table de liaison utilisateurs-entreprises
CREATE TABLE IF NOT EXISTS user_companies (
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

-- Table des configurations API
CREATE TABLE IF NOT EXISTS api_configurations (
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

-- Table des sessions utilisateur
CREATE TABLE IF NOT EXISTS user_sessions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    session_token VARCHAR(255) UNIQUE NOT NULL,
    expires_at DATETIME NOT NULL,
    ip_address VARCHAR(45),
    user_agent TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Table des logs d'audit
CREATE TABLE IF NOT EXISTS audit_logs (
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

-- Table des paramètres de plateforme
CREATE TABLE IF NOT EXISTS platform_settings (
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

-- Index pour optimiser les performances
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_user_companies_user_id ON user_companies(user_id);
CREATE INDEX IF NOT EXISTS idx_user_companies_company_id ON user_companies(company_id);
CREATE INDEX IF NOT EXISTS idx_api_configurations_company_id ON api_configurations(company_id);
CREATE INDEX IF NOT EXISTS idx_user_sessions_token ON user_sessions(session_token);
CREATE INDEX IF NOT EXISTS idx_user_sessions_user_id ON user_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_user_id ON audit_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_company_id ON audit_logs(company_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_created_at ON audit_logs(created_at);
CREATE INDEX IF NOT EXISTS idx_platform_settings_key ON platform_settings(key);
CREATE INDEX IF NOT EXISTS idx_platform_settings_category ON platform_settings(category);

-- Données de test (optionnel)
INSERT OR IGNORE INTO users (id, email, password_hash, first_name, last_name, role) VALUES 
(1, 'admin@fusepoint.com', '$2b$10$example_hash', 'Admin', 'Fusepoint', 'admin'),
(2, 'demo@example.com', '$2b$10$example_hash', 'Demo', 'User', 'user'),
(3, 'agent@fusepoint.com', '$2b$10$example_hash', 'Agent', 'Fusepoint', 'agent');

INSERT OR IGNORE INTO companies (id, name, industry, size, location, website) VALUES 
(1, 'Fusepoint Demo', 'Marketing Digital', 'PME', 'France', 'https://fusepoint.com'),
(2, 'E-commerce Plus', 'E-commerce', 'Startup', 'Paris, France', 'https://ecommerce-plus.com');

INSERT OR IGNORE INTO user_companies (user_id, company_id, role, permissions) VALUES 
(1, 1, 'owner', '{"admin": true, "analytics": true, "social": true}'),
(2, 2, 'admin', '{"analytics": true, "social": true}');

-- Paramètres de plateforme par défaut
INSERT OR IGNORE INTO platform_settings (key, value, type, category, description) VALUES 
('platform_name', 'Fusepoint Hub', 'string', 'general', 'Nom de la plateforme'),
('platform_version', '1.0.0', 'string', 'general', 'Version de la plateforme'),
('maintenance_mode', 'false', 'boolean', 'system', 'Mode maintenance activé'),
('max_users_per_company', '50', 'number', 'limits', 'Nombre maximum d''utilisateurs par entreprise'),
('session_timeout', '3600', 'number', 'security', 'Durée de session en secondes');