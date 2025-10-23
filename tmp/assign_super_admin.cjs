const ps = require('../server/services/permissionsService.js');
(async () => {
  try {
    const role = await ps.getRoleByName('super_admin');
    console.log('Role super_admin:', role);
    if (role == null) {
      console.error('Role super_admin introuvable');
      process.exit(1);
    }
    const res = await ps.assignRoleToUser(1, role.id, 1);
    console.log('Assign result:', res);
    const isSA = await ps.isSuperAdmin(1);
    console.log('isSuperAdmin(1):', isSA);
  } catch (e) {
    console.error('Erreur script:', e);
    process.exit(2);
  }
})();
