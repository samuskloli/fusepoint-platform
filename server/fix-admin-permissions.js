const databaseService = require('./services/databaseService');
const permissionsService = require('./services/permissionsService');

async function fixAdminPermissions() {
  try {
    console.log('🔧 Correction des permissions pour admin@fusepoint.com');
    console.log('=' .repeat(60));
    
    // Initialiser la base de données
    await databaseService.initialize();
    await permissionsService.init();
    console.log('✅ Services initialisés');
    
    // Rechercher l'utilisateur
    const user = await databaseService.get(
      'SELECT id, email, first_name, last_name, role FROM users WHERE email = ?',
      ['admin@fusepoint.com']
    );
    
    if (!user) {
      console.log('❌ Compte admin@fusepoint.com non trouvé');
      return;
    }
    
    console.log(`\n👤 Utilisateur trouvé: ${user.first_name} ${user.last_name} (ID: ${user.id})`);
    
    // Vérifier si le rôle super_admin existe
    const superAdminRole = await permissionsService.getRoleByName('super_admin');
    if (!superAdminRole) {
      console.log('❌ Rôle super_admin non trouvé dans la base de données');
      return;
    }
    
    console.log(`\n🎭 Rôle super_admin trouvé (ID: ${superAdminRole.id})`);
    
    // Vérifier si l'utilisateur a déjà le rôle super_admin
    const existingRole = await databaseService.get(
      'SELECT * FROM user_roles WHERE user_id = ? AND role_id = ?',
      [user.id, superAdminRole.id]
    );
    
    if (existingRole) {
      console.log('✅ L\'utilisateur a déjà le rôle super_admin assigné');
    } else {
      // Assigner le rôle super_admin
      await databaseService.run(
        'INSERT INTO user_roles (user_id, role_id, assigned_at, assigned_by) VALUES (?, ?, NOW(), ?)',
        [user.id, superAdminRole.id, 1] // assigné par le système (ID 1)
      );
      console.log('✅ Rôle super_admin assigné avec succès');
    }
    
    // Mettre à jour le rôle dans la table users si nécessaire
    if (user.role !== 'super_admin') {
      await databaseService.run(
        'UPDATE users SET role = ? WHERE id = ?',
        ['super_admin', user.id]
      );
      console.log('✅ Rôle mis à jour dans la table users');
    }
    
    // Assigner toutes les permissions au rôle super_admin
    console.log('\n🔐 Attribution des permissions...');
    await permissionsService.assignAllPermissionsToSuperAdmin();
    console.log('✅ Toutes les permissions assignées au rôle super_admin');
    
    // Vérification finale
    console.log('\n🔍 Vérification finale:');
    const isSuperAdmin = await permissionsService.isSuperAdmin(user.id);
    console.log('Super Admin:', isSuperAdmin ? '✅ Oui' : '❌ Non');
    
    const userRoles = await permissionsService.getUserRoles(user.id);
    console.log('Rôles assignés:', userRoles.length > 0 ? userRoles.map(r => r.name).join(', ') : 'Aucun');
    
    console.log('\n🎉 Correction terminée avec succès!');
    
  } catch (error) {
    console.error('❌ Erreur lors de la correction:', error);
  } finally {
    await databaseService.close();
  }
}

fixAdminPermissions();