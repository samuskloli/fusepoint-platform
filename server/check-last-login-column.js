const MariaDBService = require('./services/mariadbService');

async function checkLastLoginColumn() {
  const mariadbService = new MariaDBService();
  
  try {
    console.log('🔄 Initialisation de la connexion MariaDB...');
    await mariadbService.initialize();
    
    console.log('🔍 Vérification de la structure de la table users...');
    
    // Vérifier la structure de la table users
    const columns = await mariadbService.query('DESCRIBE users');
    console.log('📋 Colonnes actuelles de la table users:');
    columns.forEach(col => {
      console.log(`  - ${col.Field} (${col.Type}) ${col.Null === 'YES' ? 'NULL' : 'NOT NULL'} ${col.Default ? `DEFAULT ${col.Default}` : ''}`);
    });
    
    // Vérifier si la colonne last_login existe
    const lastLoginColumn = columns.find(col => col.Field === 'last_login');
    
    if (lastLoginColumn) {
      console.log('✅ La colonne last_login existe déjà');
      
      // Vérifier quelques utilisateurs pour voir leurs dernières connexions
      console.log('\n🔍 Vérification des dernières connexions des utilisateurs:');
      const users = await mariadbService.query(
        'SELECT id, email, first_name, last_name, last_login, created_at FROM users LIMIT 5'
      );
      
      users.forEach(user => {
        console.log(`  - ${user.first_name} ${user.last_name} (${user.email}):`);
        console.log(`    Dernière connexion: ${user.last_login || 'Jamais'}`);
        console.log(`    Créé le: ${user.created_at}`);
      });
    } else {
      console.log('❌ La colonne last_login n\'existe pas');
      console.log('🔧 Ajout de la colonne last_login...');
      
      await mariadbService.query(
        'ALTER TABLE users ADD COLUMN last_login DATETIME NULL'
      );
      
      console.log('✅ Colonne last_login ajoutée avec succès');
    }
    
  } catch (error) {
    console.error('❌ Erreur lors de la vérification:', error);
  } finally {
    await mariadbService.close();
  }
}

checkLastLoginColumn();