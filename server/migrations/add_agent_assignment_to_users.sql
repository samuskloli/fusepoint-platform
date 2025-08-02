-- Migration pour ajouter l'attribution d'agent aux clients
-- Cette migration ajoute un champ agent_id à la table users pour permettre l'attribution d'un agent à un client

-- Ajouter la colonne agent_id à la table users
ALTER TABLE users ADD COLUMN agent_id INTEGER REFERENCES users(id) ON DELETE SET NULL;

-- Créer un index pour optimiser les recherches par agent
CREATE INDEX IF NOT EXISTS idx_users_agent_id ON users(agent_id);

-- Commentaire: 
-- agent_id dans la table users permet d'attribuer un agent (role='agent') à un client (role='client')
-- Cette relation est optionnelle (NULL autorisé) et sera supprimée si l'agent est supprimé

COMMIT;