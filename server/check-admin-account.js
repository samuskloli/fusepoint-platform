const databaseService = require('./services/databaseService');
const permissionsService = require('./services/permissionsService');

async function checkAdminAccount() {
  try {
    console.log('🔍 Vérification du compte admin@fusepoint.com');
    console.log('=' .repeat(60));
    
    // Initialiser la base de données
    await databaseService.initialize();
    console.log('✅ Base de données initialisée');
    
    // Rechercher l'utilisateur par email
    const user = await databaseService.get(
      'SELECT id, email, first_name, last_name, role, is_active, created_at, last_login FROM users WHERE email = ?',
      ['admin@fusepoint.com']
    );
    
    if (!user) {
      console.log('❌ Compte admin@fusepoint.com non trouvé dans la base de données');
      return;
    }
    
    console.log('\n👤 Informations du compte:');
    console.log('ID:', user.id);
    console.log('Email:', user.email);
    console.log('Nom:', user.first_name, user.last_name);
    console.log('Rôle:', user.role);
    console.log('Actif:', user.is_active ? 'Oui' : 'Non');
    console.log('Créé le:', user.created_at);
    console.log('Dernière connexion:', user.last_login || 'Jamais');
    
    // Vérifier les permissions super admin
    console.log('\n🔐 Vérification des permissions:');
    const isSuperAdmin = await permissionsService.isSuperAdmin(user.id);
    console.log('Super Admin:', isSuperAdmin ? 'Oui' : 'Non');
    
    // Récupérer tous les rôles de l'utilisateur
    const userRoles = await permissionsService.getUserRoles(user.id);
    console.log('\n📋 Rôles assignés:');
    if (userRoles.length > 0) {
      userRoles.forEach(role => {
        console.log(`- ${role.name} (assigné le: ${role.assigned_at})`);
      });
    } else {
      console.log('Aucun rôle assigné dans la table user_roles');
    }
    
    // Vérifier les permissions spécifiques (méthode non disponible)
    console.log('\n🎯 Permissions spécifiques:');
    console.log('Méthode getUserPermissions non disponible dans permissionsService');
    
    // Recommandations
    console.log('\n💡 Recommandations:');
    if (!user.is_active) {
      console.log('⚠️  Le compte est désactivé - Activer le compte');
    }
    if (user.role !== 'super_admin' && user.role !== 'admin') {
      console.log('⚠️  Le rôle n\'est pas admin/super_admin - Vérifier le rôle');
    }
    if (!isSuperAdmin && user.role === 'super_admin') {
      console.log('⚠️  Le rôle est super_admin mais pas de permissions - Assigner les permissions');
    }
    
  } catch (error) {
    console.error('❌ Erreur lors de la vérification:', error);
  } finally {
    await databaseService.close();
  }
}

checkAdminAccount();