const databaseService = require('../services/databaseService');

/**
 * Script pour définir le rôle d'un utilisateur par email
 * Usage: node server/scripts/set-user-role.js <email> <role>
 * Exemples:
 *  - node server/scripts/set-user-role.js samuskl@gmail.com client
 */
(async () => {
  const emailArg = process.argv[2] || 'samuskl@gmail.com';
  const roleArg = process.argv[3] || 'client';

  try {
    console.log('🚀 Initialisation de la base MariaDB...');
    await databaseService.initialize();

    console.log(`🔍 Recherche de l'utilisateur: ${emailArg}`);
    const user = await databaseService.getUserByEmail(emailArg, false);
    if (!user) {
      console.error(`❌ Utilisateur introuvable: ${emailArg}`);
      process.exit(1);
    }

    console.log('👤 Utilisateur trouvé:', {
      id: user.id,
      email: user.email,
      nom: `${user.first_name} ${user.last_name}`,
      role_actuel: user.role,
      is_active: !!user.is_active
    });

    console.log(`🔁 Mise à jour du rôle -> ${roleArg}`);
    const updatedBy = user.id; // journalisation minimale
    await databaseService.updateUserRole(user.id, roleArg, updatedBy);

    if (!user.is_active) {
      console.log('✅ Activation du compte (is_active = 1)');
      await databaseService.updateUserStatus(user.id, true, updatedBy);
    }

    console.log('🧹 Nettoyage des tokens de confirmation');
    await databaseService.run(
      'UPDATE users SET confirmation_token = NULL, token_expiry = NULL WHERE id = ?',
      [user.id]
    );

    console.log('✅ Rôle mis à jour avec succès');
    process.exit(0);
  } catch (error) {
    console.error('❌ Erreur lors de la mise à jour du rôle:', error.message || error);
    process.exit(1);
  }
})();