-- Schéma pour la table agent_clients manquante
-- Cette table gère les relations entre agents et clients

CREATE TABLE IF NOT EXISTS agent_clients (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    agent_id INTEGER NOT NULL,
    client_id INTEGER NOT NULL,
    assigned_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    status VARCHAR(50) DEFAULT 'active', -- 'active', 'inactive', 'suspended'
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (agent_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (client_id) REFERENCES users(id) ON DELETE CASCADE,
    UNIQUE(agent_id, client_id)
);

-- Index pour optimiser les performances
CREATE INDEX IF NOT EXISTS idx_agent_clients_agent ON agent_clients(agent_id);
CREATE INDEX IF NOT EXISTS idx_agent_clients_client ON agent_clients(client_id);
CREATE INDEX IF NOT EXISTS idx_agent_clients_status ON agent_clients(status);

-- Données de test pour le développement
INSERT OR IGNORE INTO agent_clients (agent_id, client_id, status) VALUES 
(3, 1, 'active'),  -- Agent ID 3 assigné au client ID 1
(3, 2, 'active');  -- Agent ID 3 assigné au client ID 2