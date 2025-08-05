const MariaDBService = require('./services/mariadbService');

async function fixUserSessionsTable() {
  const mariadbService = new MariaDBService();
  
  try {
    console.log('🔄 Initialisation de la connexion MariaDB...');
    await mariadbService.initialize();
    
    console.log('🔧 Vérification de la structure de la table user_sessions...');
    
    // Vérifier si les colonnes existent
    const columns = await mariadbService.query(`
      SELECT COLUMN_NAME 
      FROM INFORMATION_SCHEMA.COLUMNS 
      WHERE TABLE_SCHEMA = 'fusepoint_db' 
      AND TABLE_NAME = 'user_sessions'
    `);
    
    const columnNames = columns.map(col => col.COLUMN_NAME);
    console.log('📋 Colonnes existantes:', columnNames);
    
    // Ajouter ip_address si elle n'existe pas
    if (!columnNames.includes('ip_address')) {
      console.log('➕ Ajout de la colonne ip_address...');
      await mariadbService.query(`
        ALTER TABLE user_sessions 
        ADD COLUMN ip_address VARCHAR(45)
      `);
      console.log('✅ Colonne ip_address ajoutée');
    } else {
      console.log('✅ Colonne ip_address déjà présente');
    }
    
    // Ajouter user_agent si elle n'existe pas
    if (!columnNames.includes('user_agent')) {
      console.log('➕ Ajout de la colonne user_agent...');
      await mariadbService.query(`
        ALTER TABLE user_sessions 
        ADD COLUMN user_agent TEXT
      `);
      console.log('✅ Colonne user_agent ajoutée');
    } else {
      console.log('✅ Colonne user_agent déjà présente');
    }
    
    console.log('🎉 Structure de la table user_sessions mise à jour avec succès!');
    
  } catch (error) {
    console.error('❌ Erreur lors de la mise à jour de la table user_sessions:', error);
    throw error;
  } finally {
    await mariadbService.close();
  }
}

// Exécuter le script si appelé directement
if (require.main === module) {
  fixUserSessionsTable()
    .then(() => {
      console.log('✅ Script terminé avec succès');
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ Erreur:', error);
      process.exit(1);
    });
}

module.exports = fixUserSessionsTable;