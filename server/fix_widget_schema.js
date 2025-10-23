const mysql = require('mysql2/promise');
const path = require('path');
const fs = require('fs');

async function fixWidgetSchema() {
    let connection;
    
    try {
        // Charger la configuration depuis .env.mariadb
        const envPath = path.join(__dirname, '.env.mariadb');
        if (fs.existsSync(envPath)) {
            const envContent = fs.readFileSync(envPath, 'utf8');
            const envLines = envContent.split('\n');
            
            envLines.forEach(line => {
                const [key, value] = line.split('=');
                if (key && value) {
                    process.env[key.trim()] = value.trim();
                }
            });
        }

        // Configuration de la base de données
        const dbConfig = {
            host: process.env.MARIADB_HOST || 'localhost',
            user: process.env.MARIADB_USER || 'oliveirasamuel',
            password: process.env.MARIADB_PASSWORD || '',
            database: process.env.MARIADB_DATABASE || 'fusepoint_db',
            port: process.env.MARIADB_PORT || 3306
        };

        connection = await mysql.createConnection(dbConfig);
        console.log('✅ Connexion à la base de données réussie');
        
        // Vérifier si la table client_widget_configs existe
        const [tables] = await connection.execute(
            "SHOW TABLES LIKE 'client_widget_configs'"
        );
        
        if (tables.length > 0) {
            console.log('📋 Table client_widget_configs trouvée, modification du schéma...');
            
            // Vérifier les contraintes de clé étrangère existantes
            const [constraints] = await connection.execute(`
                SELECT CONSTRAINT_NAME 
                FROM information_schema.KEY_COLUMN_USAGE 
                WHERE TABLE_SCHEMA = ? 
                AND TABLE_NAME = 'client_widget_configs' 
                AND REFERENCED_TABLE_NAME IS NOT NULL
            `, [dbConfig.database]);
            
            console.log('🔍 Contraintes trouvées:', constraints.map(c => c.CONSTRAINT_NAME));
            
            // Supprimer les contraintes de clé étrangère une par une
            for (const constraint of constraints) {
                try {
                    await connection.execute(`
                        ALTER TABLE client_widget_configs 
                        DROP FOREIGN KEY ${constraint.CONSTRAINT_NAME}
                    `);
                    console.log(`✅ Contrainte ${constraint.CONSTRAINT_NAME} supprimée`);
                } catch (error) {
                    console.log(`⚠️ Erreur suppression contrainte ${constraint.CONSTRAINT_NAME}:`, error.message);
                }
            }
            
            // Modifier le type de la colonne widget_id
            await connection.execute(`
                ALTER TABLE client_widget_configs 
                MODIFY COLUMN widget_id VARCHAR(50) NOT NULL
            `);
            
            console.log('✅ Colonne widget_id modifiée en VARCHAR(50)');
            
            // Recréer les contraintes de clé étrangère (sans celle sur widget_id)
            try {
                await connection.execute(`
                    ALTER TABLE client_widget_configs 
                    ADD CONSTRAINT fk_client_widget_configs_client 
                    FOREIGN KEY (client_id) REFERENCES clients(id) ON DELETE CASCADE
                `);
                console.log('✅ Contrainte FK client_id recréée');
            } catch (error) {
                console.log('⚠️ Contrainte FK client_id déjà existante ou erreur:', error.message);
            }
            
            try {
                await connection.execute(`
                    ALTER TABLE client_widget_configs 
                    ADD CONSTRAINT fk_client_widget_configs_project 
                    FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE
                `);
                console.log('✅ Contrainte FK project_id recréée');
            } catch (error) {
                console.log('⚠️ Contrainte FK project_id déjà existante ou erreur:', error.message);
            }
            
        } else {
            console.log('📋 Table client_widget_configs non trouvée, création...');
            
            // Créer la table avec le bon type de colonne
            await connection.execute(`
                CREATE TABLE client_widget_configs (
                    id INT AUTO_INCREMENT PRIMARY KEY,
                    client_id INT NOT NULL,
                    project_id INT NOT NULL,
                    widget_id VARCHAR(50) NOT NULL,
                    template_id VARCHAR(50),
                    config JSON,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                    FOREIGN KEY (client_id) REFERENCES clients(id) ON DELETE CASCADE,
                    FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE
                )
            `);
            
            console.log('✅ Table client_widget_configs créée avec le bon schéma');
        }

        // Vérifier si la table project_dashboards existe
        const [dashboardTables] = await connection.execute(
            "SHOW TABLES LIKE 'project_dashboards'"
        );

        if (dashboardTables.length === 0) {
            console.log('Création de la table project_dashboards...');
            await connection.execute(`
                CREATE TABLE project_dashboards (
                    project_id INT PRIMARY KEY,
                    layout_json JSON NOT NULL,
                    version INT NOT NULL DEFAULT 1,
                    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    updated_by INT,
                    INDEX idx_pd_project (project_id),
                    INDEX idx_pd_updated (updated_at)
                )
            `);
            console.log('Table project_dashboards créée avec succès');
        }

        console.log('Migration terminée avec succès !');

    } catch (error) {
        console.error('Erreur lors de la migration:', error.message);
        process.exit(1);
    } finally {
        if (connection) {
            await connection.end();
        }
    }
}

fixWidgetSchema();