-- Table pour gérer les demandes de suppression de comptes clients
CREATE TABLE IF NOT EXISTS deletion_requests (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  client_id INTEGER NOT NULL,
  agent_id INTEGER NOT NULL,
  reason TEXT,
  status TEXT NOT NULL DEFAULT 'pending', -- 'pending', 'approved', 'rejected'
  approved_by INTEGER, -- ID du super admin qui a traité la demande
  approved_at DATETIME,
  created_at DATETIME NOT NULL,
  updated_at DATETIME,
  FOREIGN KEY (client_id) REFERENCES users(id),
  FOREIGN KEY (agent_id) REFERENCES users(id),
  FOREIGN KEY (approved_by) REFERENCES users(id)
);

-- Index pour améliorer les performances
CREATE INDEX IF NOT EXISTS idx_deletion_requests_client_id ON deletion_requests(client_id);
CREATE INDEX IF NOT EXISTS idx_deletion_requests_agent_id ON deletion_requests(agent_id);
CREATE INDEX IF NOT EXISTS idx_deletion_requests_status ON deletion_requests(status);
CREATE INDEX IF NOT EXISTS idx_deletion_requests_created_at ON deletion_requests(created_at);