const MariaDBService = require('../services/mariadbService');
const bcrypt = require('bcrypt');

/**
 * Script pour réinitialiser le mot de passe de l'admin avec bcrypt (compatible avec MariaDB)
 */
async function resetAdminPassword() {
  const mariadbService = new MariaDBService();
  
  try {
    // Initialiser la base de données
    await mariadbService.initialize();
    console.log('✅ Connexion à MariaDB établie');
    
    const email = 'admin@fusepoint.com';
    const newPassword = 'admin123';
    
    // Vérifier si l'utilisateur existe
    const existingUser = await mariadbService.get(
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
    
    // Hacher le nouveau mot de passe avec bcrypt (même que MariaDBService)
    console.log('🔐 Hachage du nouveau mot de passe avec bcrypt...');
    const hashedPassword = await bcrypt.hash(newPassword, 12);
    
    // Mettre à jour le mot de passe
    const result = await mariadbService.run(
      'UPDATE users SET password_hash = ?, updated_at = NOW() WHERE id = ?',
      [hashedPassword, existingUser.id]
    );
    
    if (result.changes === 0) {
      console.log('❌ Échec de la mise à jour du mot de passe');
      return;
    }
    
    console.log('✅ Mot de passe mis à jour avec succès pour:', email);
    console.log('🔑 Nouveau mot de passe:', newPassword);
    console.log('📝 Hash généré:', hashedPassword.substring(0, 20) + '...');
    
    // Vérifier que le mot de passe fonctionne avec la méthode du service
    const isValid = await mariadbService.verifyPassword(newPassword, hashedPassword);
    console.log('🔍 Vérification du mot de passe:', isValid ? '✅ Valide' : '❌ Invalide');
    
  } catch (error) {
    console.error('❌ Erreur lors de la réinitialisation du mot de passe:', error);
  } finally {
    // Fermer la connexion
    if (mariadbService.pool) {
      await mariadbService.pool.end();
      console.log('🔒 Connexion MariaDB fermée');
    }
  }
}

// Exécuter le script
if (require.main === module) {
  resetAdminPassword();
}

module.exports = resetAdminPassword;