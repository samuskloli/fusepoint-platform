const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');

// Configuration de la base de données MariaDB
const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'fusepoint',
  port: process.env.DB_PORT || 3306
};

/**
 * Script d'initialisation de la base de données
 */
async function initializeDatabase() {
  try {
    console.log('🚀 Initialisation de la base de données...');
    
    // Chemin vers le fichier de schéma
    const schemaPath = path.join(__dirname, '..', 'database', 'schema.sql');
    
    // Lire le fichier SQL
    if (!fs.existsSync(schemaPath)) {
      console.error('❌ Fichier schema.sql non trouvé:', schemaPath);
      process.exit(1);
    }
    
    const sqlContent = fs.readFileSync(schemaPath, 'utf8');
    console.log('📄 Fichier schema.sql lu avec succès');
    
    // Créer la connexion à la base de données
    const connection = await mysql.createConnection(dbConfig);
    console.log('✅ Connexion à la base de données établie');
    
    // Diviser le contenu SQL en requêtes individuelles
    const queries = sqlContent.split(';').filter(query => query.trim());
    
    // Exécuter chaque requête
    for (const query of queries) {
      if (query.trim()) {
        await connection.execute(query);
      }
    }
    
    console.log('✅ Tables créées et données de test insérées');
    
    // Vérifier les tables créées
    const [tables] = await connection.execute(`
      SELECT TABLE_NAME as name 
      FROM INFORMATION_SCHEMA.TABLES 
      WHERE TABLE_SCHEMA = ?
    `, [dbConfig.database]);
    
    console.log('📋 Tables créées:', tables.map(t => t.name).join(', '));
    
    await connection.end();
    console.log('✅ Connexion fermée');
    
    return Promise.resolve();
    
  } catch (error) {
    console.error('❌ Erreur initialisation:', error);
    process.exit(1);
  }
}

// Exécuter si appelé directement
if (require.main === module) {
  initializeDatabase()
    .then(() => {
      console.log('🎉 Initialisation terminée avec succès!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ Échec initialisation:', error);
      process.exit(1);
    });
}

module.exports = { initializeDatabase };