const db = require('../server/services/databaseService.js');
(async () => {
  try {
    const admin = await db.get('SELECT id FROM users WHERE email = ?', ['admin@fusepoint.com']);
    console.log('Admin:', admin);
    if (!admin) { console.error('Utilisateur admin introuvable'); process.exit(1); }
    const role = await db.get('SELECT id FROM roles WHERE name = ?', ['super_admin']);
    console.log('Role:', role);
    if (!role) { console.error('Rôle super_admin introuvable'); process.exit(1); }
    await db.run('INSERT IGNORE INTO user_roles (user_id, role_id, assigned_by) VALUES (?, ?, ?)', [admin.id, role.id, admin.id]);
    const check = await db.get('SELECT COUNT(*) AS cnt FROM user_roles ur JOIN roles r ON r.id=ur.role_id WHERE ur.user_id=? AND r.name=?', [admin.id, 'super_admin']);
    console.log('Check super_admin count:', check);
  } catch (e) {
    console.error('Erreur script:', e);
    process.exit(2);
  }
})();