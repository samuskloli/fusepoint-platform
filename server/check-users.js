const MariaDBService = require('./services/mariadbService');

async function checkUsers() {
  const mariadbService = new MariaDBService();
  
  try {
    console.log('🔄 Initialisation de la connexion MariaDB...');
    await mariadbService.initialize();
    
    console.log('👥 Vérification des utilisateurs existants...');
    
    // Récupérer tous les utilisateurs
    const users = await mariadbService.query(`
      SELECT id, email, first_name, last_name, role, is_active, created_at 
      FROM users 
      ORDER BY created_at DESC
    `);
    
    if (users.length === 0) {
      console.log('❌ Aucun utilisateur trouvé dans la base de données');
      console.log('💡 Vous devez créer un utilisateur pour vous connecter.');
      return;
    }
    
    console.log(`\n📋 ${users.length} utilisateur(s) trouvé(s) :\n`);
    
    users.forEach((user, index) => {
      console.log(`${index + 1}. 👤 ${user.first_name} ${user.last_name}`);
      console.log(`   📧 Email: ${user.email}`);
      console.log(`   🔑 Rôle: ${user.role}`);
      console.log(`   ✅ Actif: ${user.is_active ? 'Oui' : 'Non'}`);
      console.log(`   📅 Créé le: ${new Date(user.created_at).toLocaleDateString('fr-FR')}`);
      console.log('');
    });
    
    console.log('💡 Pour vous connecter, utilisez l\'email et le mot de passe d\'un de ces utilisateurs.');
    console.log('💡 Si vous ne connaissez pas le mot de passe, vous pouvez en créer un nouveau utilisateur.');
    
  } catch (error) {
    console.error('❌ Erreur lors de la vérification des utilisateurs:', error);
    throw error;
  } finally {
    await mariadbService.close();
  }
}

// Exécuter le script si appelé directement
if (require.main === module) {
  checkUsers()
    .then(() => {
      console.log('✅ Vérification terminée');
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ Erreur:', error);
      process.exit(1);
    });
}

module.exports = checkUsers;