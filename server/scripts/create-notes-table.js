const mysql = require('mysql2/promise');
const path = require('path');
const fs = require('fs');

// Charger les variables d'environnement depuis .env.mariadb
const envPath = path.join(__dirname, '..', '.env.mariadb');
if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, 'utf8');
  const envLines = envContent.split('\n');
  
  envLines.forEach(line => {
    const trimmedLine = line.trim();
    if (trimmedLine && !trimmedLine.startsWith('#')) {
      const [key, ...valueParts] = trimmedLine.split('=');
      if (key && valueParts.length > 0) {
        const value = valueParts.join('=');
        process.env[key.trim()] = value.trim();
      }
    }
  });
}

// Configuration de la base de données MariaDB
const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'oliveirasamuel',
  password: process.env.DB_PASSWORD || 'FusepointDB2025!',
  database: process.env.DB_NAME || 'fusepoint_db',
  port: process.env.DB_PORT || 3306
};

console.log('🔧 Création de la table notes...');

// Fonction principale asynchrone
async function createNotesTable() {
  try {
    // Connexion à la base de données
    const connection = await mysql.createConnection(dbConfig);
    console.log('✅ Connexion à la base de données réussie');
    
    // Requête de création de la table notes
    const createNotesTableQuery = `
      CREATE TABLE IF NOT EXISTS notes (
        id INT AUTO_INCREMENT PRIMARY KEY,
        title VARCHAR(255),
        content TEXT NOT NULL,
        client_id INT NOT NULL,
        project_id INT NOT NULL,
        widget_instance_id INT,
        created_by INT,
        is_pinned BOOLEAN DEFAULT FALSE,
        tags JSON,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        
        INDEX idx_notes_scope (client_id, project_id),
        INDEX idx_notes_pinned (client_id, project_id, is_pinned),
        INDEX idx_notes_widget (client_id, project_id, widget_instance_id)
      )
    `;
    
    // Exécuter la requête
    await connection.execute(createNotesTableQuery);
    console.log('✅ Table notes créée avec succès');
    
    // Vérifier que la table a été créée
    const [tables] = await connection.execute(`
      SELECT TABLE_NAME as name 
      FROM INFORMATION_SCHEMA.TABLES 
      WHERE TABLE_SCHEMA = ? AND TABLE_NAME = 'notes'
    `, [dbConfig.database]);
    
    if (tables.length > 0) {
      console.log('✅ Table notes confirmée dans la base de données');
      
      // Afficher la structure de la table
      const [columns] = await connection.execute(`
        SELECT COLUMN_NAME, DATA_TYPE, IS_NULLABLE, COLUMN_DEFAULT
        FROM INFORMATION_SCHEMA.COLUMNS 
        WHERE TABLE_SCHEMA = ? AND TABLE_NAME = 'notes'
        ORDER BY ORDINAL_POSITION
      `, [dbConfig.database]);
      
      console.log('📋 Structure de la table notes:');
      columns.forEach(col => {
        console.log(`   - ${col.COLUMN_NAME}: ${col.DATA_TYPE} ${col.IS_NULLABLE === 'NO' ? 'NOT NULL' : 'NULL'} ${col.COLUMN_DEFAULT ? `DEFAULT ${col.COLUMN_DEFAULT}` : ''}`);
      });
    } else {
      console.error('❌ Table notes non trouvée après création');
    }
    
    // Fermer la connexion
    await connection.end();
    console.log('✅ Connexion fermée');
    
  } catch (error) {
    console.error('❌ Erreur:', error.message);
    process.exit(1);
  }
}

// Exécuter la fonction
createNotesTable();