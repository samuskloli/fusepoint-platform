-- Schéma complet pour le système d'accompagnement Fusepoint

-- Table des prestations de l'agence (catalogue de services)
CREATE TABLE IF NOT EXISTS agency_services (
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

-- Table des demandes de prestations
CREATE TABLE IF NOT EXISTS service_requests (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    company_id INTEGER NOT NULL,
    user_id INTEGER NOT NULL,
    service_id INTEGER NOT NULL,
    status VARCHAR(50) DEFAULT 'pending',
    priority VARCHAR(20) DEFAULT 'normal',
    title VARCHAR(255),
    description TEXT,
    brief_data TEXT,
    budget_range VARCHAR(100),
    deadline DATE,
    assigned_to INTEGER,
    estimated_completion DATE,
    actual_completion DATE,
    client_feedback TEXT,
    internal_notes TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (service_id) REFERENCES agency_services(id) ON DELETE CASCADE
);

-- Table des recommandations Fusepoint
CREATE TABLE IF NOT EXISTS fusepoint_recommendations (
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

-- Table des notifications
CREATE TABLE IF NOT EXISTS notifications (
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

-- Table des conversations (compatible avec le système de chat)
CREATE TABLE IF NOT EXISTS conversations (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    client_id INTEGER NOT NULL,
    agent_id INTEGER NOT NULL,
    title TEXT NOT NULL,
    status TEXT DEFAULT 'active',
    last_message_at DATETIME,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);



-- Table de l'historique des statuts de demandes
CREATE TABLE IF NOT EXISTS request_status_history (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    request_id INTEGER NOT NULL,
    old_status VARCHAR(50),
    new_status VARCHAR(50) NOT NULL,
    changed_by INTEGER,
    comment TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (request_id) REFERENCES service_requests(id) ON DELETE CASCADE
);

-- Données de test pour les services
INSERT OR IGNORE INTO agency_services (id, name, description, category, price_type, base_price, duration_estimate, deliverables, requirements, display_order, icon, color) VALUES 
(1, 'Audit SEO Complet', 'Analyse approfondie de votre référencement naturel avec plan d''action détaillé', 'analysis', 'fixed', 497.00, '3-5 jours', '["Rapport d''audit SEO", "Plan d''action priorisé", "Recommandations techniques"]', '["Accès Google Analytics", "Accès Search Console"]', 1, 'search', 'blue'),
(2, 'Création de Campagne Facebook Ads', 'Conception et lancement d''une campagne publicitaire Facebook optimisée', 'advertising', 'project', 299.00, '2-3 jours', '["Stratégie de campagne", "Visuels publicitaires", "Configuration complète"]', '["Compte Facebook Business", "Budget publicitaire défini"]', 2, 'facebook', 'blue'),
(3, 'Rédaction de Contenu Blog', 'Articles de blog optimisés SEO pour votre secteur d''activité', 'creation', 'fixed', 149.00, '5-7 jours', '["Article optimisé SEO", "Images d''illustration", "Méta-descriptions"]', '["Brief détaillé", "Mots-clés cibles"]', 3, 'edit', 'green'),
(4, 'Optimisation de Conversion', 'Amélioration du taux de conversion de votre site web', 'strategy', 'project', 799.00, '1-2 semaines', '["Audit UX/UI", "Tests A/B", "Recommandations d''optimisation"]', '["Accès Google Analytics", "Trafic minimum 1000 visiteurs/mois"]', 4, 'trending-up', 'orange'),
(5, 'Formation Google Analytics', 'Formation personnalisée pour maîtriser Google Analytics', 'technical', 'hourly', 89.00, '2 heures', '["Session de formation", "Support de cours", "Suivi post-formation"]', '["Compte Google Analytics configuré"]', 5, 'academic-cap', 'purple');

-- Données de test pour les recommandations
INSERT OR IGNORE INTO fusepoint_recommendations (id, company_id, type, title, description, priority, status, category) VALUES 
(1, 1, 'seo', 'Optimiser les méta-descriptions', 'Vos méta-descriptions sont trop courtes et n''incitent pas au clic', 3, 'pending', 'SEO'),
(2, 1, 'analytics', 'Configurer les objectifs de conversion', 'Aucun objectif de conversion n''est configuré dans Google Analytics', 2, 'pending', 'Analytics'),
(3, 1, 'content', 'Créer du contenu pour le blog', 'Votre blog n''a pas été mis à jour depuis 3 mois', 1, 'pending', 'Contenu');

-- Données de test pour les notifications
INSERT OR IGNORE INTO notifications (id, user_id, company_id, type, title, message, is_read) VALUES 
(1, 1, 1, 'recommendation', 'Nouvelle recommandation disponible', 'Une nouvelle recommandation SEO a été générée pour votre site', 0),
(2, 1, 1, 'service_update', 'Mise à jour de votre demande', 'Votre demande d''audit SEO est en cours de traitement', 0),
(3, 1, 1, 'info', 'Bienvenue sur Fusepoint', 'Découvrez toutes les fonctionnalités de votre tableau de bord', 1);