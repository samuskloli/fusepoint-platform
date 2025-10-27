#!/usr/bin/env node

const path = require('path');
// Charger l'env depuis la racine et le dossier server
try {
  require('dotenv').config({ path: path.resolve(__dirname, '..', '..', '.env') });
  require('dotenv').config({ path: path.resolve(__dirname, '..', '.env') });
} catch (_) {}

const databaseService = require('../services/databaseService');

(async () => {
  const oldEmail = 'admin@fusepoint.com';
  const newEmail = 'info@fusepoint.ch';
  const updatedBy = null; // ID de l'utilisateur effectuant la modif si disponible

  try {
    console.log('🔧 Mise à jour du super administrateur dans la base de données...');
    await databaseService.initialize();

    // Récupérer l'utilisateur existant avec l'ancien email et avec le nouvel email
    const oldUser = await databaseService.getUserByEmail(oldEmail, false);
    const existingNew = await databaseService.getUserByEmail(newEmail, false);

    if (!oldUser && !existingNew) {
      console.log('⚠️ Aucun utilisateur trouvé avec admin@fusepoint.com et info@fusepoint.ch. Rien à mettre à jour.');
      await databaseService.close();
      process.exit(0);
    }

    if (existingNew && oldUser && existingNew.id !== oldUser.id) {
      console.error(`❌ L'email ${newEmail} est déjà utilisé par un autre utilisateur (ID=${existingNew.id}). Abandon.`);
      await databaseService.close();
      process.exit(1);
    }

    const targetUserId = oldUser ? oldUser.id : existingNew.id;

    // Mettre à jour l'email si nécessaire
    if (oldUser && oldUser.email !== newEmail) {
      await databaseService.updateUser(targetUserId, { email: newEmail }, updatedBy);
      console.log(`✅ Email mis à jour: ${oldEmail} -> ${newEmail}`);
    } else {
      console.log(`ℹ️ Email déjà configuré sur ${newEmail}`);
    }

    // Forcer le rôle super_admin
    await databaseService.updateUserRole(targetUserId, 'super_admin', updatedBy);
    console.log('✅ Rôle mis à jour: super_admin');

    // Forcer le statut actif
    await databaseService.updateUserStatus(targetUserId, true, updatedBy);
    console.log('✅ Statut mis à jour: actif');

    // Afficher le résumé
    const user = await databaseService.getUserById(targetUserId);
    console.log('📄 Résumé utilisateur:', {
      id: user.id,
      email: user.email,
      role: user.role,
      is_active: user.is_active,
    });

    await databaseService.close();
    console.log('✅ Mise à jour terminée.');
    process.exit(0);
  } catch (err) {
    console.error('❌ Erreur lors de la mise à jour du super admin:', err.message || err);
    try { await databaseService.close(); } catch (_) {}
    process.exit(1);
  }
})();