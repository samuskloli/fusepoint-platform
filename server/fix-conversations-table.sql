-- Script pour corriger la table conversations
-- Supprimer la table existante si elle existe
DROP TABLE IF EXISTS conversations;

-- Recréer la table avec la structure correcte
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

-- Créer l'index pour client_id et agent_id
CREATE INDEX IF NOT EXISTS idx_conversations_client_agent ON conversations(client_id, agent_id);

-- Afficher la structure de la table pour vérification
.schema conversations