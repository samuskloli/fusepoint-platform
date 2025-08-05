-- Schema pour le système d'invitation de prestataires externes
-- Table des invitations de prestataires

CREATE TABLE IF NOT EXISTS prestataire_invitations (
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

-- Index pour optimiser les recherches
CREATE INDEX IF NOT EXISTS idx_prestataire_invitations_token ON prestataire_invitations(token);
CREATE INDEX IF NOT EXISTS idx_prestataire_invitations_email ON prestataire_invitations(email);
CREATE INDEX IF NOT EXISTS idx_prestataire_invitations_agent ON prestataire_invitations(agent_id);
CREATE INDEX IF NOT EXISTS idx_prestataire_invitations_status ON prestataire_invitations(status);

-- Table de liaison entre prestataires et agents (pour gérer les relations)
CREATE TABLE IF NOT EXISTS agent_prestataires (
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

-- Index pour optimiser les recherches de relations
CREATE INDEX IF NOT EXISTS idx_agent_prestataires_agent ON agent_prestataires(agent_id);
CREATE INDEX IF NOT EXISTS idx_agent_prestataires_prestataire ON agent_prestataires(prestataire_id);

-- Table des tâches assignées aux prestataires
CREATE TABLE IF NOT EXISTS prestataire_tasks (
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

-- Index pour optimiser les recherches de tâches
CREATE INDEX IF NOT EXISTS idx_prestataire_tasks_prestataire ON prestataire_tasks(prestataire_id);
CREATE INDEX IF NOT EXISTS idx_prestataire_tasks_agent ON prestataire_tasks(agent_id);
CREATE INDEX IF NOT EXISTS idx_prestataire_tasks_status ON prestataire_tasks(status);
CREATE INDEX IF NOT EXISTS idx_prestataire_tasks_due_date ON prestataire_tasks(due_date);

-- Mise à jour du rôle prestataire dans la table users (si pas déjà fait)
-- Cette modification sera gérée par le service de base de données

-- Données de test pour le développement
INSERT OR IGNORE INTO prestataire_invitations (email, token, agent_id, expires_at, invitation_data) VALUES 
('prestataire.test@example.com', 'test-token-123', 3, datetime('now', '+7 days'), '{"firstName": "Jean", "lastName": "Dupont", "speciality": "Développement web"}');

-- Exemple de tâche pour test
INSERT OR IGNORE INTO prestataire_tasks (title, description, prestataire_id, agent_id, task_data) VALUES 
('Création site web client', 'Développer un site web responsive pour le client XYZ', 1, 3, '{"technologies": ["Vue.js", "Tailwind CSS"], "budget": 2500, "deadline": "2024-02-15"}');