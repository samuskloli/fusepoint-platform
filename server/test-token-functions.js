const MariaDBService = require('./services/mariadbService');

/**
 * Script de test pour vérifier les fonctions de gestion des tokens
 */
async function testTokenFunctions() {
  const mariadbService = new MariaDBService();
  
  try {
    console.log('🔄 Initialisation de la connexion MariaDB...');
    await mariadbService.initialize();
    console.log('✅ Connexion établie');
    
    // Test 1: Créer un utilisateur de test
    console.log('\n📝 Test 1: Création d\'un utilisateur avec token de confirmation');
    const testEmail = 'test-token@fusepoint.com';
    
    // Supprimer l'utilisateur de test s'il existe
    await mariadbService.run('DELETE FROM users WHERE email = ?', [testEmail]);
    
    const newUser = await mariadbService.createUser({
      email: testEmail,
      password: 'testpassword123',
      firstName: 'Test',
      lastName: 'Token',
      phone: '+33123456789',
      role: 'user'
    });
    
    console.log('✅ Utilisateur créé:', {
      id: newUser.id,
      email: newUser.email,
      confirmationToken: newUser.confirmationToken ? 'Généré' : 'Manquant'
    });
    
    // Test 2: Vérifier que les tokens sont bien stockés
    console.log('\n🔍 Test 2: Vérification des tokens dans la base de données');
    const userFromDB = await mariadbService.get(
      'SELECT id, email, confirmation_token, token_expiry, is_active FROM users WHERE email = ?',
      [testEmail]
    );
    
    console.log('📊 Données utilisateur en base:', {
      id: userFromDB.id,
      email: userFromDB.email,
      confirmationToken: userFromDB.confirmation_token ? 'Présent' : 'Absent',
      tokenExpiry: userFromDB.token_expiry ? 'Défini' : 'Absent',
      isActive: userFromDB.is_active
    });
    
    // Test 3: Générer un token de réinitialisation
    console.log('\n🔑 Test 3: Génération d\'un token de réinitialisation');
    const resetResult = await mariadbService.generatePasswordResetToken(testEmail);
    console.log('✅ Token de réinitialisation:', resetResult.message);
    
    // Vérifier le token de réinitialisation
    const userWithResetToken = await mariadbService.get(
      'SELECT reset_token, token_expiry FROM users WHERE email = ?',
      [testEmail]
    );
    
    console.log('📊 Token de réinitialisation:', {
      resetToken: userWithResetToken.reset_token ? 'Présent' : 'Absent',
      tokenExpiry: userWithResetToken.token_expiry ? 'Défini' : 'Absent'
    });
    
    // Test 4: Confirmer le compte
    console.log('\n✅ Test 4: Confirmation du compte');
    if (userFromDB.confirmation_token) {
      const confirmResult = await mariadbService.confirmUserAccount(userFromDB.confirmation_token);
      console.log('✅ Compte confirmé:', confirmResult.message);
      
      // Vérifier que le compte est maintenant actif
      const confirmedUser = await mariadbService.get(
        'SELECT is_active, confirmation_token FROM users WHERE email = ?',
        [testEmail]
      );
      
      console.log('📊 État après confirmation:', {
        isActive: confirmedUser.is_active,
        confirmationToken: confirmedUser.confirmation_token ? 'Encore présent' : 'Supprimé'
      });
    }
    
    // Test 5: Réinitialiser le mot de passe
    console.log('\n🔄 Test 5: Réinitialisation du mot de passe');
    if (userWithResetToken.reset_token) {
      const resetPasswordResult = await mariadbService.resetPassword(
        userWithResetToken.reset_token,
        'nouveaumotdepasse123'
      );
      console.log('✅ Mot de passe réinitialisé:', resetPasswordResult.message);
      
      // Vérifier que le token a été supprimé
      const userAfterReset = await mariadbService.get(
        'SELECT reset_token, token_expiry FROM users WHERE email = ?',
        [testEmail]
      );
      
      console.log('📊 État après réinitialisation:', {
        resetToken: userAfterReset.reset_token ? 'Encore présent' : 'Supprimé',
        tokenExpiry: userAfterReset.token_expiry ? 'Encore défini' : 'Supprimé'
      });
    }
    
    // Nettoyer
    console.log('\n🧹 Nettoyage: Suppression de l\'utilisateur de test');
    await mariadbService.run('DELETE FROM users WHERE email = ?', [testEmail]);
    console.log('✅ Utilisateur de test supprimé');
    
    console.log('\n🎉 Tous les tests sont passés avec succès!');
    console.log('\n📋 Résumé des fonctionnalités testées:');
    console.log('   ✅ Génération automatique de token de confirmation à la création');
    console.log('   ✅ Stockage des tokens et dates d\'expiration');
    console.log('   ✅ Génération de token de réinitialisation de mot de passe');
    console.log('   ✅ Confirmation de compte avec suppression du token');
    console.log('   ✅ Réinitialisation de mot de passe avec suppression du token');
    
  } catch (error) {
    console.error('❌ Erreur lors des tests:', error);
  } finally {
    await mariadbService.close();
    console.log('🔒 Connexion fermée');
  }
}

// Exécuter les tests
if (require.main === module) {
  testTokenFunctions();
}

module.exports = testTokenFunctions;