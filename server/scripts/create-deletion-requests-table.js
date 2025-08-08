const mysql = require('mysql2/promise');
const path = require('path');
const fs = require('fs');

// Configuration de la base de données MariaDB
const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'fusepoint',
  port: process.env.DB_PORT || 3306
};

const schemaPath = path.join(__dirname, '../database/deletion_requests_schema.sql');

console.log('🔧 Création de la table deletion_requests...');
console.log('📄 Schéma:', schemaPath);

// Vérifier que le fichier de schéma existe
if (!fs.existsSync(schemaPath)) {
  console.error('❌ Fichier de schéma non trouvé:', schemaPath);
  process.exit(1);
}

// Fonction principale asynchrone
async function createDeletionRequestsTable() {
  try {
    // Lire le schéma SQL
    const schema = fs.readFileSync(schemaPath, 'utf8');
    
    // Connexion à la base de données
    const connection = await mysql.createConnection(dbConfig);
    console.log('✅ Connexion à la base de données réussie');
    
    // Diviser le schéma en requêtes individuelles
    const queries = schema.split(';').filter(query => query.trim());
    
    // Exécuter chaque requête
    for (const query of queries) {
      if (query.trim()) {
        await connection.execute(query);
      }
    }
    
    console.log('✅ Table deletion_requests créée avec succès');
    
    // Vérifier que la table a été créée
    const [tables] = await connection.execute(`
      SELECT TABLE_NAME as name 
      FROM INFORMATION_SCHEMA.TABLES 
      WHERE TABLE_SCHEMA = ? AND TABLE_NAME = 'deletion_requests'
    `, [dbConfig.database]);
    
    if (tables.length > 0) {
      console.log('✅ Table deletion_requests confirmée dans la base de données');
    } else {
      console.error('❌ Table deletion_requests non trouvée après création');
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
createDeletionRequestsTable();