/**
 * Script de test de connexion MariaDB
 * Teste la connexion et affiche les paramètres de configuration
 */

require('dotenv').config({ path: '../.env.mariadb' });
const MariaDBConfig = require('../config/mariadb.config');

async function testConnection() {
  console.log('🔍 Test de connexion MariaDB...');
  
  // Afficher les variables d'environnement
  console.log('\n📋 Variables d\'environnement:');
  console.log('DATABASE_URL:', process.env.DATABASE_URL ? 'Définie' : 'Non définie');
  
  if (process.env.DATABASE_URL) {
    try {
      const url = new URL(process.env.DATABASE_URL);
      console.log('\n🔗 Paramètres extraits de DATABASE_URL:');
      console.log('Host:', url.hostname);
      console.log('Port:', url.port || 3306);
      console.log('User:', url.username);
      console.log('Password:', url.password ? '***masqué***' : 'Vide');
      console.log('Database:', url.pathname.substring(1));
    } catch (error) {
      console.error('❌ Erreur parsing DATABASE_URL:', error.message);
    }
  }
  
  // Tester la connexion
  const mariadb = new MariaDBConfig();
  
  console.log('\n⚙️ Configuration MariaDB:');
  console.log('Host:', mariadb.config.host);
  console.log('Port:', mariadb.config.port);
  console.log('User:', mariadb.config.user);
  console.log('Password:', mariadb.config.password ? '***masqué***' : 'Vide');
  console.log('Database:', mariadb.config.database);
  
  try {
    console.log('\n🔄 Test de connexion...');
    const success = await mariadb.testConnection();
    
    if (success) {
      console.log('✅ Connexion MariaDB réussie!');
      
      // Tester quelques requêtes de base
      const conn = await mariadb.getConnection();
      try {
        const version = await conn.query('SELECT VERSION() as version');
        console.log('📊 Version MariaDB:', version[0].version);
        
        const tables = await conn.query('SHOW TABLES');
        console.log('📋 Tables existantes:', tables.length);
        tables.forEach(table => {
          const tableName = Object.values(table)[0];
          console.log('  -', tableName);
        });
        
      } finally {
        conn.release();
      }
      
    } else {
      console.log('❌ Connexion MariaDB échouée');
    }
    
  } catch (error) {
    console.error('❌ Erreur test connexion:', error.message);
    console.error('Code erreur:', error.code);
    console.error('État SQL:', error.sqlState);
  } finally {
    await mariadb.closePool();
  }
}

// Exécuter le test
testConnection().catch(console.error);