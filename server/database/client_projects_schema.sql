-- Schéma pour les projets et tâches des clients

-- Table des projets
CREATE TABLE IF NOT EXISTS projects (
    id INT AUTO_INCREMENT PRIMARY KEY,
    client_id INT NOT NULL,
    agent_id INT,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    status VARCHAR(50) DEFAULT 'en_cours',
    priority VARCHAR(20) DEFAULT 'normal',
    start_date DATE,
    end_date DATE,
    due_date DATE,
    last_update TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    next_step TEXT,
    progress INT DEFAULT 0,
    budget DECIMAL(10,2),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (client_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (agent_id) REFERENCES users(id) ON DELETE SET NULL
);

-- Table des tâches
CREATE TABLE IF NOT EXISTS tasks (
    id INT AUTO_INCREMENT PRIMARY KEY,
    project_id INT,
    client_id INT NOT NULL,
    agent_id INT,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    status VARCHAR(50) DEFAULT 'pending',
    priority VARCHAR(20) DEFAULT 'normal',
    due_date DATE,
    validation_comments TEXT,
    validated_at TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE,
    FOREIGN KEY (client_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (agent_id) REFERENCES users(id) ON DELETE SET NULL
);

-- Table des échéances
CREATE TABLE IF NOT EXISTS deadlines (
    id INT AUTO_INCREMENT PRIMARY KEY,
    project_id INT,
    client_id INT NOT NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    due_date DATE NOT NULL,
    urgency VARCHAR(20) DEFAULT 'Normal',
    status VARCHAR(50) DEFAULT 'pending',
    completed_at TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE,
    FOREIGN KEY (client_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Table de l'historique des tâches
CREATE TABLE IF NOT EXISTS task_history (
    id INT AUTO_INCREMENT PRIMARY KEY,
    task_id INT NOT NULL,
    action VARCHAR(100) NOT NULL,
    comments TEXT,
    created_by INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (task_id) REFERENCES tasks(id) ON DELETE CASCADE,
    FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL
);

-- Table des fichiers de projet
CREATE TABLE IF NOT EXISTS files (
    id INT AUTO_INCREMENT PRIMARY KEY,
    project_id INT,
    client_id INT NOT NULL,
    filename VARCHAR(255) NOT NULL,
    original_name VARCHAR(255) NOT NULL,
    file_path VARCHAR(500) NOT NULL,
    file_size INT,
    mime_type VARCHAR(100),
    folder_path VARCHAR(255) DEFAULT '/',
    uploaded_by INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE,
    FOREIGN KEY (client_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (uploaded_by) REFERENCES users(id) ON DELETE SET NULL
);

-- Table des membres d'équipe de projet
CREATE TABLE IF NOT EXISTS team_members (
    id INT AUTO_INCREMENT PRIMARY KEY,
    project_id INT NOT NULL,
    user_id INT NOT NULL,
    role VARCHAR(50) DEFAULT 'member',
    permissions TEXT,
    added_by INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (added_by) REFERENCES users(id) ON DELETE SET NULL,
    UNIQUE(project_id, user_id)
);

-- Index pour optimiser les performances
CREATE INDEX IF NOT EXISTS idx_projects_client ON projects(client_id);
CREATE INDEX IF NOT EXISTS idx_projects_status ON projects(status);
CREATE INDEX IF NOT EXISTS idx_tasks_client ON tasks(client_id);
CREATE INDEX IF NOT EXISTS idx_tasks_status ON tasks(status);
CREATE INDEX IF NOT EXISTS idx_deadlines_client ON deadlines(client_id);
CREATE INDEX IF NOT EXISTS idx_deadlines_due_date ON deadlines(due_date);
CREATE INDEX IF NOT EXISTS idx_files_project ON files(project_id);
CREATE INDEX IF NOT EXISTS idx_team_members_project ON team_members(project_id);
CREATE INDEX IF NOT EXISTS idx_team_members_user ON team_members(user_id);

-- Données d'exemple pour les tests
INSERT IGNORE INTO projects (id, client_id, title, description, status, start_date, end_date, next_step, progress) VALUES
(1, 1, 'Campagne Facebook Automne 2024', 'Création d''une campagne publicitaire pour la saison automne', 'en_cours', '2024-01-15', '2024-02-15', 'Création des visuels en cours, livraison prévue vendredi', 65),
(2, 1, 'Refonte du site web', 'Modernisation complète du site internet', 'en_validation', '2024-01-12', '2024-03-01', 'Maquettes prêtes, en attente de vos retours', 80),
(3, 1, 'Newsletter mensuelle', 'Mise en place d''une newsletter récurrente', 'en_pause', '2024-01-10', '2024-02-10', 'En attente du contenu de votre part', 30);

INSERT IGNORE INTO tasks (id, project_id, client_id, title, description, status) VALUES
(1, 1, 1, 'Valider les visuels de la campagne Facebook', 'Votre agent a préparé 5 visuels pour votre validation', 'pending_validation'),
(2, 2, 1, 'Approuver le planning éditorial', 'Planning des publications pour le mois prochain', 'pending_validation');

INSERT IGNORE INTO deadlines (id, project_id, client_id, title, description, due_date, urgency) VALUES
(1, 1, 1, 'Lancement campagne Facebook', 'Début de la campagne publicitaire', '2024-01-25', 'Urgent'),
(2, 2, 1, 'Livraison site web', 'Mise en ligne de la nouvelle version', '2024-02-01', 'Important'),
(3, NULL, 1, 'Réunion mensuelle', 'Point sur les performances et objectifs', '2024-02-05', 'Normal');