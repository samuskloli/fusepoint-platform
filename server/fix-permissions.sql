-- Insertion des permissions système manquantes
INSERT OR IGNORE INTO system_permissions (permission_name, permission_description, category) VALUES 
-- Permissions générales
('platform.settings.read', 'Lire les paramètres de plateforme', 'platform'),
('platform.settings.write', 'Modifier les paramètres de plateforme', 'platform'),
('platform.users.manage', 'Gérer tous les utilisateurs', 'users'),
('platform.logs.read', 'Consulter les logs système', 'logs'),
('platform.maintenance.manage', 'Gérer le mode maintenance', 'platform'),

-- Permissions utilisateurs
('users.create', 'Créer des utilisateurs', 'users'),
('users.read', 'Consulter les utilisateurs', 'users'),
('users.update', 'Modifier les utilisateurs', 'users'),
('users.delete', 'Supprimer les utilisateurs', 'users'),
('users.roles.manage', 'Gérer les rôles utilisateurs', 'users'),
('user_management', 'Gestion complète des utilisateurs', 'users'),

-- Permissions entreprises
('companies.create', 'Créer des entreprises', 'companies'),
('companies.read', 'Consulter les entreprises', 'companies'),
('companies.update', 'Modifier les entreprises', 'companies'),
('companies.delete', 'Supprimer les entreprises', 'companies'),

-- Permissions système
('system.backup', 'Effectuer des sauvegardes', 'system'),
('system.restore', 'Restaurer des sauvegardes', 'system'),
('system.monitor', 'Surveiller le système', 'system'),
('system.config', 'Configurer le système', 'system');