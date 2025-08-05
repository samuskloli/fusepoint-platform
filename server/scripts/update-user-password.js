const databaseService = require('../services/databaseService');
const bcrypt = require('bcryptjs');

/**
 * Script pour mettre à jour le mot de passe d'un utilisateur
 */
async function updateUserPassword() {
  try {
    // Initialiser la base de données
    await databaseService.initialize();
    console.log('✅ Connexion à la base de données établie');
    
    const email = 'client1@test.com';
const newPassword = 'client1!';
    
    // Vérifier si l'utilisateur existe
    const existingUser = await databaseService.db.get(
      'SELECT id, email, first_name, last_name, role FROM users WHERE email = ?',
      [email]
    );
    
    if (!existingUser) {
      console.log('❌ Utilisateur non trouvé avec l\'email:', email);
      return;
    }
    
    console.log('👤 Utilisateur trouvé:', {
      id: existingUser.id,
      email: existingUser.email,
      nom: `${existingUser.first_name} ${existingUser.last_name}`,
      role: existingUser.role
    });
    
    // Hacher le nouveau mot de passe
    console.log('🔐 Hachage du nouveau mot de passe...');
    const hashedPassword = await databaseService.hashPassword(newPassword);
    
    // Mettre à jour le mot de passe
    const result = await databaseService.db.run(
      'UPDATE users SET password_hash = ?, updated_at = datetime("now") WHERE id = ?',
      [hashedPassword, existingUser.id]
    );
    
    if (result.changes === 0) {
      console.log('❌ Échec de la mise à jour du mot de passe');
      return;
    }
    
    console.log('✅ Mot de passe mis à jour avec succès pour:', email);
    console.log('🔑 Nouveau mot de passe:', newPassword);
    console.log('📝 Hash généré:', hashedPassword.substring(0, 20) + '...');
    
    // Vérifier que le mot de passe fonctionne
    const isValid = await bcrypt.compare(newPassword, hashedPassword);
    console.log('🔍 Vérification du mot de passe:', isValid ? '✅ Valide' : '❌ Invalide');
    
  } catch (error) {
    console.error('❌ Erreur lors de la mise à jour du mot de passe:', error);
  } finally {
    // Fermer la connexion à la base de données
    if (databaseService.db) {
      await databaseService.db.close();
      console.log('🔒 Connexion à la base de données fermée');
    }
  }
}

// Exécuter le script
if (require.main === module) {
  updateUserPassword();
}

module.exports = updateUserPassword;