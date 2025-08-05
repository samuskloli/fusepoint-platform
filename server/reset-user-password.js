const MariaDBService = require('./services/mariadbService');
const bcrypt = require('bcrypt');

async function resetUserPassword() {
  const mariadbService = new MariaDBService();
  
  try {
    console.log('🔄 Initialisation de la connexion MariaDB...');
    await mariadbService.initialize();
    
    // Email et nouveau mot de passe par défaut
    const email = 'admin@fusepoint.com';
    const newPassword = 'admin123';
    
    console.log(`🔑 Réinitialisation du mot de passe pour: ${email}`);
    
    // Vérifier si l'utilisateur existe
    const users = await mariadbService.query(
      'SELECT id, email, first_name, last_name, role FROM users WHERE email = ?',
      [email]
    );
    
    if (users.length === 0) {
      console.log(`❌ Utilisateur avec l'email ${email} non trouvé`);
      return;
    }
    
    const user = users[0];
    console.log(`👤 Utilisateur trouvé: ${user.first_name} ${user.last_name} (${user.role})`);
    
    // Hasher le nouveau mot de passe
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(newPassword, saltRounds);
    
    // Mettre à jour le mot de passe
    await mariadbService.query(
      'UPDATE users SET password_hash = ? WHERE email = ?',
      [hashedPassword, email]
    );
    
    console.log('✅ Mot de passe mis à jour avec succès!');
    console.log('');
    console.log('🔐 Informations de connexion:');
    console.log(`   📧 Email: ${email}`);
    console.log(`   🔑 Mot de passe: ${newPassword}`);
    console.log('');
    console.log('💡 Vous pouvez maintenant vous connecter avec ces informations.');
    
  } catch (error) {
    console.error('❌ Erreur lors de la réinitialisation du mot de passe:', error);
    throw error;
  } finally {
    await mariadbService.close();
  }
}

// Exécuter le script si appelé directement
if (require.main === module) {
  resetUserPassword()
    .then(() => {
      console.log('✅ Script terminé avec succès');
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ Erreur:', error);
      process.exit(1);
    });
}

module.exports = resetUserPassword;