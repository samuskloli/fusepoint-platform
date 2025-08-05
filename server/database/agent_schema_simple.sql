-- Schéma simplifié pour le système agent Fusepoint
-- Tables pour gérer les conversations chat et demandes de service



-- Table des demandes de service
CREATE TABLE IF NOT EXISTS service_requests (
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

-- Index pour optimiser les performances

CREATE INDEX IF NOT EXISTS idx_service_requests_user_id ON service_requests(user_id);
CREATE INDEX IF NOT EXISTS idx_service_requests_status ON service_requests(status);
CREATE INDEX IF NOT EXISTS idx_service_requests_priority ON service_requests(priority);