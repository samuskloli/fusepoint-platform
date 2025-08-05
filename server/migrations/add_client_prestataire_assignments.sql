-- Migration pour ajouter le système d'assignation de prestataires aux clients par les agents

-- Table pour gérer l'assignation des prestataires aux clients par les agents
CREATE TABLE IF NOT EXISTS client_prestataire_assignments (
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

-- Index pour optimiser les recherches
CREATE INDEX IF NOT EXISTS idx_client_prestataire_assignments_client ON client_prestataire_assignments(client_id);
CREATE INDEX IF NOT EXISTS idx_client_prestataire_assignments_prestataire ON client_prestataire_assignments(prestataire_id);
CREATE INDEX IF NOT EXISTS idx_client_prestataire_assignments_agent ON client_prestataire_assignments(agent_id);
CREATE INDEX IF NOT EXISTS idx_client_prestataire_assignments_status ON client_prestataire_assignments(status);

-- Données de test
INSERT OR IGNORE INTO client_prestataire_assignments (client_id, prestataire_id, agent_id, assignment_type, notes) VALUES 
(2, 4, 3, 'service', 'Assignation pour développement web'),
(5, 4, 3, 'consultation', 'Consultation marketing digital');