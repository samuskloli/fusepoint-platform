-- Migration simplifiée pour ajouter les colonnes manquantes à la table users
-- Compatible avec SQLite

-- Ajouter les colonnes manquantes à la table users
ALTER TABLE users ADD COLUMN user_code VARCHAR(20);
ALTER TABLE users ADD COLUMN status VARCHAR(20) DEFAULT 'active';
ALTER TABLE users ADD COLUMN specialties TEXT;
ALTER TABLE users ADD COLUMN company_id INTEGER;

-- Créer des index pour optimiser les recherches
CREATE INDEX IF NOT EXISTS idx_users_user_code ON users(user_code);
CREATE INDEX IF NOT EXISTS idx_users_status ON users(status);
CREATE INDEX IF NOT EXISTS idx_users_company_id ON users(company_id);

-- Mettre à jour le statut des utilisateurs existants
UPDATE users SET status = 'active' WHERE status IS NULL;