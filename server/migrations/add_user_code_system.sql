-- Migration pour ajouter le système de code unique utilisateur
-- À exécuter dans votre base de données SQLite

-- Ajouter les colonnes manquantes à la table users
ALTER TABLE users ADD COLUMN user_code VARCHAR(20) UNIQUE;
ALTER TABLE users ADD COLUMN status VARCHAR(20) DEFAULT 'active';
ALTER TABLE users ADD COLUMN specialties TEXT; -- JSON des spécialités pour les agents
ALTER TABLE users ADD COLUMN company_id INTEGER REFERENCES companies(id);

-- Créer un index pour optimiser les recherches par code
CREATE INDEX IF NOT EXISTS idx_users_user_code ON users(user_code);
CREATE INDEX IF NOT EXISTS idx_users_status ON users(status);
CREATE INDEX IF NOT EXISTS idx_users_company_id ON users(company_id);

-- Générer des codes uniques pour les utilisateurs existants
-- Format: AG001 pour agents, CL001 pour clients, PT001 pour prestataires, AD001 pour admins

-- Mise à jour des codes pour les agents existants
UPDATE users SET 
    user_code = 'AG' || printf('%03d', ROW_NUMBER() OVER (ORDER BY id)),
    status = 'active',
    specialties = CASE 
        WHEN role = 'agent' THEN '["Marketing Digital", "SEO", "Social Media"]'
        ELSE NULL
    END
WHERE role = 'agent' AND user_code IS NULL;

-- Mise à jour des codes pour les clients existants
UPDATE users SET 
    user_code = 'CL' || printf('%03d', ROW_NUMBER() OVER (ORDER BY id)),
    status = 'active'
WHERE role = 'client' AND user_code IS NULL;

-- Mise à jour des codes pour les prestataires existants
UPDATE users SET 
    user_code = 'PT' || printf('%03d', ROW_NUMBER() OVER (ORDER BY id)),
    status = 'active'
WHERE role = 'prestataire' AND user_code IS NULL;

-- Mise à jour des codes pour les admins existants
UPDATE users SET 
    user_code = 'AD' || printf('%03d', ROW_NUMBER() OVER (ORDER BY id)),
    status = 'active'
WHERE role IN ('admin', 'super_admin') AND user_code IS NULL;

-- Mise à jour des codes pour les autres rôles
UPDATE users SET 
    user_code = 'US' || printf('%03d', ROW_NUMBER() OVER (ORDER BY id)),
    status = 'active'
WHERE user_code IS NULL;

-- Ajouter des données de test pour les agents avec spécialités
INSERT OR IGNORE INTO users (email, password_hash, first_name, last_name, role, user_code, status, specialties) VALUES 
('agent1@fusepoint.com', '$2b$10$example_hash', 'Marie', 'Dupont', 'agent', 'AG101', 'active', '["SEO", "Content Marketing", "Analytics"]'),
('agent2@fusepoint.com', '$2b$10$example_hash', 'Pierre', 'Martin', 'agent', 'AG102', 'active', '["Social Media", "Publicité Facebook", "Instagram Marketing"]'),
('agent3@fusepoint.com', '$2b$10$example_hash', 'Sophie', 'Bernard', 'agent', 'AG103', 'active', '["E-commerce", "Shopify", "Conversion Optimization"]'),
('client1@example.com', '$2b$10$example_hash', 'Jean', 'Durand', 'client', 'CL101', 'active', NULL),
('prestataire1@example.com', '$2b$10$example_hash', 'Alice', 'Moreau', 'prestataire', 'PT101', 'active', NULL);

COMMIT;