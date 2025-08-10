const mariadb = require('mariadb');
require('dotenv').config({ path: '../.env.mariadb' });

async function addLanguageColumn() {
  let conn;
  
  try {
    // Connexion locale MariaDB
    conn = await mariadb.createConnection({
      host: 'localhost',
      port: 3306,
      user: 'root',
      password: '',
      database: 'fusepoint_platform',
      acquireTimeout: 60000,
      timeout: 60000
    });

    console.log('🔄 Ajout de la colonne language à la table users...');
    
    // Vérifier si la colonne existe déjà
    const columns = await conn.query(
      "SHOW COLUMNS FROM users LIKE 'language'"
    );
    
    if (columns.length > 0) {
      console.log('✅ La colonne language existe déjà');
      return;
    }
    
    // Ajouter la colonne language
    await conn.query(
      "ALTER TABLE users ADD COLUMN language VARCHAR(5) DEFAULT 'fr' AFTER role"
    );
    
    console.log('✅ Colonne language ajoutée avec succès');
    
    // Ajouter l'index
    await conn.query(
      "CREATE INDEX IF NOT EXISTS idx_users_language ON users(language)"
    );
    
    console.log('✅ Index créé avec succès');
    
  } catch (error) {
    console.error('❌ Erreur lors de l\'ajout de la colonne:', error.message);
  } finally {
    if (conn) await conn.end();
  }
}

addLanguageColumn();