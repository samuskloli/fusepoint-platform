const bcrypt = require('bcryptjs');
const databaseService = require('../services/databaseService');

(async () => {
  const email = process.env.SUPER_ADMIN_EMAIL || 'samuskl@gmail.com';
  const password = process.env.SUPER_ADMIN_PASSWORD || 'SuperAdmin2024!';
  const firstName = process.env.SUPER_ADMIN_FIRST_NAME || 'Super';
  const lastName = process.env.SUPER_ADMIN_LAST_NAME || 'Admin';

  try {
    console.log('🚀 Initialisation base de données (MariaDB)...');
    await databaseService.initialize();

    const existing = await databaseService.getUserByEmail(email, false);
    const passwordHash = await bcrypt.hash(password, 10);

    if (existing) {
      console.log(`ℹ️ Utilisateur existant: ${email}. Mise à jour du rôle et du mot de passe...`);
      await databaseService.run(
        'UPDATE users SET role = ?, is_active = 1, email_verified = 1, password_hash = ?, confirmation_token = NULL, token_expiry = NULL, updated_at = NOW() WHERE id = ?',
        ['super_admin', passwordHash, existing.id]
      );
      console.log('✅ Super admin mis à jour avec succès.');
    } else {
      console.log(`🆕 Création du super admin: ${email}...`);
      const user = await databaseService.createUser({
        email,
        password,
        firstName,
        lastName,
        role: 'super_admin'
      });
      await databaseService.run(
        'UPDATE users SET is_active = 1, email_verified = 1, confirmation_token = NULL, token_expiry = NULL, updated_at = NOW() WHERE id = ?',
        [user.id]
      );
      console.log('✅ Super admin créé et activé.');
    }

    console.log('🔑 Identifiants:');
    console.log(`   Email: ${email}`);
    console.log(`   Mot de passe: ${password}`);
  } catch (err) {
    console.error('❌ Erreur création/mise à jour super admin:', err);
    process.exitCode = 1;
  } finally {
    await databaseService.close();
    console.log('📦 Connexion DB fermée.');
  }
})();