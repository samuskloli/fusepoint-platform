const fs = require('fs');
const path = require('path');
const MariaDBService = require('./services/mariadbService');

async function createMissingTables() {
  const mariadbService = new MariaDBService();
  
  try {
    console.log('🔄 Initialisation de la connexion MariaDB...');
    await mariadbService.initialize();
    
    console.log('📖 Lecture du fichier SQL...');
    const sqlFile = path.join(__dirname, 'create-missing-tables.sql');
    const sqlContent = fs.readFileSync(sqlFile, 'utf8');
    
    // Diviser le contenu en requêtes individuelles
    const queries = sqlContent
      .split(';')
      .map(query => query.trim())
      .filter(query => query.length > 0 && !query.startsWith('--'));
    
    console.log(`🔧 Exécution de ${queries.length} requêtes...`);
    
    for (let i = 0; i < queries.length; i++) {
      const query = queries[i];
      if (query.trim()) {
        try {
          console.log(`⚡ Exécution requête ${i + 1}/${queries.length}`);
          await mariadbService.query(query);
        } catch (error) {
          if (error.code === 'ER_TABLE_EXISTS_ERROR' || error.code === 'ER_DUP_KEYNAME') {
            console.log(`⚠️  Table/Index existe déjà (ignoré): ${error.message}`);
          } else {
            console.error(`❌ Erreur requête ${i + 1}:`, error.message);
            console.error('Requête:', query.substring(0, 100) + '...');
          }
        }
      }
    }
    
    console.log('✅ Tables créées avec succès!');
    
    // Vérifier que la table user_companies existe
    const tables = await mariadbService.query('SHOW TABLES LIKE "user_companies"');
    if (tables.length > 0) {
      console.log('✅ Table user_companies confirmée');
    } else {
      console.log('❌ Table user_companies non trouvée');
    }
    
  } catch (error) {
    console.error('❌ Erreur lors de la création des tables:', error);
  } finally {
    if (mariadbService.pool) {
      await mariadbService.close();
    }
    process.exit(0);
  }
}

createMissingTables();