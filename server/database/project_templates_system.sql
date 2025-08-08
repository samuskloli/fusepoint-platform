-- Système modulaire de projets avec widgets
-- Migration pour créer/mettre à jour les tables nécessaires

-- Table des modèles de projets (project_templates)
CREATE TABLE IF NOT EXISTS project_templates (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    duration_estimate INT, -- en jours
    tags JSON,
    icon VARCHAR(100),
    color VARCHAR(7), -- couleur hex
    category VARCHAR(100),
    is_active BOOLEAN DEFAULT 1,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Table des widgets disponibles
CREATE TABLE IF NOT EXISTS widgets (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    component_name VARCHAR(255) NOT NULL, -- nom du composant Vue
    description TEXT,
    icon VARCHAR(100),
    category VARCHAR(100),
    is_active BOOLEAN DEFAULT 1,
    config_schema JSON, -- schéma de configuration du widget
    default_config JSON, -- configuration par défaut
    permissions JSON, -- permissions requises
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Table de liaison modèles-widgets (project_template_widgets)
CREATE TABLE IF NOT EXISTS project_template_widgets (
    id INT AUTO_INCREMENT PRIMARY KEY,
    template_id INT NOT NULL,
    widget_id INT NOT NULL,
    position INT DEFAULT 0,
    is_enabled BOOLEAN DEFAULT 1,
    default_config JSON,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (template_id) REFERENCES project_templates(id) ON DELETE CASCADE,
    FOREIGN KEY (widget_id) REFERENCES widgets(id) ON DELETE CASCADE,
    UNIQUE KEY unique_template_widget (template_id, widget_id)
);

-- Table des projets (mise à jour de la structure existante)
ALTER TABLE projects 
ADD COLUMN IF NOT EXISTS template_id INT,
ADD COLUMN IF NOT EXISTS created_by INT,
ADD FOREIGN KEY IF NOT EXISTS (template_id) REFERENCES project_templates(id) ON DELETE SET NULL,
ADD FOREIGN KEY IF NOT EXISTS (created_by) REFERENCES users(id) ON DELETE SET NULL;

-- Table des widgets de projet (instances)
CREATE TABLE IF NOT EXISTS project_widgets (
    id INT AUTO_INCREMENT PRIMARY KEY,
    project_id INT NOT NULL,
    widget_id INT NOT NULL,
    position INT DEFAULT 0,
    is_enabled BOOLEAN DEFAULT 1,
    widget_config JSON, -- configuration spécifique pour cette instance
    widget_data JSON, -- données du widget
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE,
    FOREIGN KEY (widget_id) REFERENCES widgets(id) ON DELETE CASCADE,
    UNIQUE KEY unique_project_widget (project_id, widget_id)
);

-- Index pour optimiser les performances
CREATE INDEX IF NOT EXISTS idx_project_templates_category ON project_templates(category);
CREATE INDEX IF NOT EXISTS idx_widgets_category ON widgets(category);
CREATE INDEX IF NOT EXISTS idx_project_template_widgets_template ON project_template_widgets(template_id);
CREATE INDEX IF NOT EXISTS idx_project_template_widgets_widget ON project_template_widgets(widget_id);
CREATE INDEX IF NOT EXISTS idx_projects_template ON projects(template_id);
CREATE INDEX IF NOT EXISTS idx_project_widgets_project ON project_widgets(project_id);
CREATE INDEX IF NOT EXISTS idx_project_widgets_widget ON project_widgets(widget_id);

-- Insertion des widgets de base
INSERT IGNORE INTO widgets (name, component_name, description, icon, category, config_schema, default_config, permissions) VALUES
('Timeline', 'TimelineWidget', 'Suivi global du projet avec jalons, dates et progression', 'fas fa-timeline', 'tracking', '{}', '{}', '{"view": true, "edit": false}'),
('Checklist Tâches', 'ChecklistWidget', 'Liste de tâches avec statut, échéance, et responsable', 'fas fa-check-square', 'productivity', '{}', '{}', '{"view": true, "edit": true}'),
('Objectifs Projet', 'GoalsWidget', 'Affichage des objectifs du projet et leur progression', 'fas fa-bullseye', 'goals', '{}', '{}', '{"view": true, "edit": false}'),
('Performances Campagne', 'StatsWidget', 'Statistiques marketing (clics, conversions, ROI...)', 'fas fa-chart-line', 'analytics', '{}', '{}', '{"view": true, "edit": false}'),
('Fichiers', 'FilesWidget', 'Module de gestion de documents, avec métadonnées', 'fas fa-folder', 'files', '{}', '{}', '{"view": true, "edit": true}'),
('Commentaires', 'CommentsWidget', 'Espace d\'échange entre client et agent', 'fas fa-comments', 'communication', '{}', '{}', '{"view": true, "edit": true}'),
('Suggestions IA', 'AIWidget', 'Propositions de l\'IA selon le contexte', 'fas fa-brain', 'ai', '{}', '{}', '{"view": true, "edit": false}'),
('Suivi Design', 'DesignTrackingWidget', 'Affichage des maquettes, retour client, validation visuelle', 'fas fa-paint-brush', 'design', '{}', '{}', '{"view": true, "edit": true}'),
('Feedback Client', 'FeedbackWidget', 'Zone de retours du client par étape ou widget', 'fas fa-star', 'feedback', '{}', '{}', '{"view": true, "edit": true}'),
('Développement Front/Back', 'DevelopmentWidget', 'Suivi de dev (frontend et backend), avec status', 'fas fa-code', 'development', '{}', '{}', '{"view": true, "edit": false}'),
('Score SEO', 'SEOScoreWidget', 'Score SEO global basé sur audit', 'fas fa-search', 'seo', '{}', '{}', '{"view": true, "edit": false}'),
('Checklist SEO', 'SEOChecklistWidget', 'Liste d\'actions SEO à réaliser avec état', 'fas fa-list-check', 'seo', '{}', '{}', '{"view": true, "edit": true}'),
('Rapport Audit', 'AuditReportWidget', 'Synthèse complète d\'audit SEO exportable', 'fas fa-file-alt', 'seo', '{}', '{}', '{"view": true, "edit": false}'),
('Historique Améliorations', 'HistoryWidget', 'Journal des améliorations appliquées dans le temps', 'fas fa-history', 'tracking', '{}', '{}', '{"view": true, "edit": false}'),
('Planning Editorial', 'CalendarWidget', 'Calendrier des publications sociales', 'fas fa-calendar-alt', 'content', '{}', '{}', '{"view": true, "edit": true}'),
('Statistiques Posts', 'SocialStatsWidget', 'Suivi de performances sur les posts sociaux', 'fas fa-chart-bar', 'social', '{}', '{}', '{"view": true, "edit": false}'),
('Post Editor', 'PostEditorWidget', 'Éditeur de contenu pour les réseaux ou blog', 'fas fa-edit', 'content', '{}', '{}', '{"view": true, "edit": true}'),
('Logo Preview', 'LogoPreviewWidget', 'Aperçu des logos proposés', 'fas fa-image', 'design', '{}', '{}', '{"view": true, "edit": false}'),
('Charte Graphique', 'BrandGuideWidget', 'Présentation complète de l\'identité visuelle', 'fas fa-palette', 'design', '{}', '{}', '{"view": true, "edit": false}'),
('Palette Couleurs', 'ColorPaletteWidget', 'Affiche les couleurs utilisées dans le projet', 'fas fa-swatchbook', 'design', '{}', '{}', '{"view": true, "edit": false}'),
('Suivi Fonctionnalités', 'FeatureTrackingWidget', 'Suivi des fonctionnalités livrées dans une application', 'fas fa-cogs', 'development', '{}', '{}', '{"view": true, "edit": false}'),
('Versionning', 'VersioningWidget', 'Gestion des versions et changelogs', 'fas fa-code-branch', 'development', '{}', '{}', '{"view": true, "edit": false}'),
('Paramètres Tracking', 'TrackingSettingsWidget', 'Configuration et validation de balises de suivi', 'fas fa-tags', 'analytics', '{}', '{}', '{"view": true, "edit": true}'),
('Rapport Statistique', 'AnalyticsReportWidget', 'Rapport de données analytiques (Analytics...)', 'fas fa-chart-pie', 'analytics', '{}', '{}', '{"view": true, "edit": false}'),
('Checklist Tracking', 'TrackingChecklistWidget', 'Liste des balises installées et vérifiées', 'fas fa-check-circle', 'analytics', '{}', '{}', '{"view": true, "edit": true}');

-- Insertion des modèles de projets prédéfinis
INSERT IGNORE INTO project_templates (name, description, duration_estimate, tags, icon, color, category) VALUES
('Campagne Marketing', 'Modèle pour les campagnes marketing complètes', 30, '["marketing", "campagne", "digital"]', 'fas fa-bullhorn', '#3B82F6', 'marketing'),
('Refonte de Site Web', 'Modèle pour les projets de refonte de sites web', 60, '["web", "design", "développement"]', 'fas fa-globe', '#10B981', 'web'),
('Audit SEO', 'Modèle pour les audits et optimisations SEO', 21, '["seo", "audit", "optimisation"]', 'fas fa-search', '#F59E0B', 'seo'),
('Gestion Réseaux Sociaux', 'Modèle pour la gestion des réseaux sociaux', 90, '["social", "contenu", "community"]', 'fas fa-share-alt', '#8B5CF6', 'social'),
('Identité de Marque', 'Modèle pour la création d\'identité de marque', 45, '["branding", "design", "identité"]', 'fas fa-palette', '#EF4444', 'design'),
('Stratégie de Contenu', 'Modèle pour la stratégie de contenu', 30, '["contenu", "stratégie", "editorial"]', 'fas fa-pen-fancy', '#06B6D4', 'content'),
('Application Mobile', 'Modèle pour le développement d\'applications mobiles', 120, '["mobile", "app", "développement"]', 'fas fa-mobile-alt', '#84CC16', 'development'),
('Configuration Analytics', 'Modèle pour la configuration d\'outils analytics', 14, '["analytics", "tracking", "mesure"]', 'fas fa-chart-line', '#F97316', 'analytics');

-- Liaison des widgets aux modèles de projets
-- Campagne Marketing
INSERT IGNORE INTO project_template_widgets (template_id, widget_id, position) 
SELECT pt.id, w.id, ROW_NUMBER() OVER (ORDER BY w.id)
FROM project_templates pt, widgets w 
WHERE pt.name = 'Campagne Marketing' 
AND w.component_name IN ('TimelineWidget', 'ChecklistWidget', 'GoalsWidget', 'StatsWidget', 'FilesWidget', 'CommentsWidget', 'AIWidget');

-- Refonte de Site Web
INSERT IGNORE INTO project_template_widgets (template_id, widget_id, position)
SELECT pt.id, w.id, ROW_NUMBER() OVER (ORDER BY w.id)
FROM project_templates pt, widgets w 
WHERE pt.name = 'Refonte de Site Web' 
AND w.component_name IN ('TimelineWidget', 'DesignTrackingWidget', 'FeedbackWidget', 'DevelopmentWidget', 'FilesWidget', 'CommentsWidget');

-- Audit SEO
INSERT IGNORE INTO project_template_widgets (template_id, widget_id, position)
SELECT pt.id, w.id, ROW_NUMBER() OVER (ORDER BY w.id)
FROM project_templates pt, widgets w 
WHERE pt.name = 'Audit SEO' 
AND w.component_name IN ('SEOScoreWidget', 'SEOChecklistWidget', 'AuditReportWidget', 'AIWidget', 'HistoryWidget');

-- Gestion Réseaux Sociaux
INSERT IGNORE INTO project_template_widgets (template_id, widget_id, position)
SELECT pt.id, w.id, ROW_NUMBER() OVER (ORDER BY w.id)
FROM project_templates pt, widgets w 
WHERE pt.name = 'Gestion Réseaux Sociaux' 
AND w.component_name IN ('CalendarWidget', 'SocialStatsWidget', 'PostEditorWidget', 'CommentsWidget');

-- Identité de Marque
INSERT IGNORE INTO project_template_widgets (template_id, widget_id, position)
SELECT pt.id, w.id, ROW_NUMBER() OVER (ORDER BY w.id)
FROM project_templates pt, widgets w 
WHERE pt.name = 'Identité de Marque' 
AND w.component_name IN ('LogoPreviewWidget', 'BrandGuideWidget', 'FilesWidget', 'ColorPaletteWidget');

-- Stratégie de Contenu
INSERT IGNORE INTO project_template_widgets (template_id, widget_id, position)
SELECT pt.id, w.id, ROW_NUMBER() OVER (ORDER BY w.id)
FROM project_templates pt, widgets w 
WHERE pt.name = 'Stratégie de Contenu' 
AND w.component_name IN ('AIWidget', 'FeedbackWidget', 'CommentsWidget');

-- Application Mobile
INSERT IGNORE INTO project_template_widgets (template_id, widget_id, position)
SELECT pt.id, w.id, ROW_NUMBER() OVER (ORDER BY w.id)
FROM project_templates pt, widgets w 
WHERE pt.name = 'Application Mobile' 
AND w.component_name IN ('FeatureTrackingWidget', 'FeedbackWidget', 'VersioningWidget', 'FilesWidget');

-- Configuration Analytics
INSERT IGNORE INTO project_template_widgets (template_id, widget_id, position)
SELECT pt.id, w.id, ROW_NUMBER() OVER (ORDER BY w.id)
FROM project_templates pt, widgets w 
WHERE pt.name = 'Configuration Analytics' 
AND w.component_name IN ('TrackingSettingsWidget', 'AnalyticsReportWidget', 'TrackingChecklistWidget');