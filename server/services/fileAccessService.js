const databaseService = require('./databaseService');

/**
 * Vérifie l'accès d'un tenant (client ou agent) à un fichier.
 * - Autorise si le fichier appartient au client (tenant)
 * - Autorise si l'agent est membre du projet (project_members/team_members)
 * - Autorise si l'agent est directement assigné au projet (projects.agent_id)
 * - Autorise si l'agent a une relation active avec le client du projet (agent_clients.status = 'active')
 * @param {number|string} fileId
 * @param {number|string} tenantId
 * @returns {Promise<object>} file row
 * @throws Error('NOT_FOUND') si fichier introuvable
 * @throws Error('FORBIDDEN') si tenant différent
 */
async function assertFileAccess(fileId, tenantId) {
  const file = await databaseService.get('SELECT * FROM files WHERE id = ?', [fileId]);
  if (!file) {
    const err = new Error('NOT_FOUND');
    err.code = 'NOT_FOUND';
    throw err;
  }
  
  // Si pas de tenantId fourni, on refuse l'accès
  if (!tenantId) {
    const err = new Error('FORBIDDEN');
    err.code = 'FORBIDDEN';
    throw err;
  }
  
  const fileTenant = file.client_id || file.clientId || file.tenant_id || file.tenantId;
  const projectId = file.project_id || file.projectId;
  
  // 1) Vérification directe du tenant (client propriétaire)
  if (String(fileTenant) === String(tenantId)) {
    return file;
  }
  
  // 2) Accès client via company_id (compatibilité multi-tenant) en se basant sur users
  try {
    const projectAccess = await databaseService.get(`
      SELECT f.* FROM files f
      INNER JOIN projects p ON f.project_id = p.id
      INNER JOIN users u ON p.client_id = u.id
      WHERE f.id = ? AND (u.id = ? OR u.company_id = ?)
    `, [fileId, tenantId, tenantId]);
    if (projectAccess) {
      return projectAccess;
    }
  } catch (e) {
    // Ignorer erreurs de schéma et continuer
  }
  
  // 3) Accès agent: membre du projet (project_members ou team_members) ou agent assigné au projet
  try {
    const memberAccess = await databaseService.get(`
      SELECT f.* FROM files f
      INNER JOIN projects p ON f.project_id = p.id
      LEFT JOIN project_members pm ON pm.project_id = p.id AND pm.user_id = ? AND pm.is_active = 1
      LEFT JOIN team_members tm ON tm.project_id = p.id AND tm.user_id = ?
      WHERE f.id = ? AND (pm.id IS NOT NULL OR tm.id IS NOT NULL OR p.agent_id = ?)
    `, [tenantId, tenantId, fileId, tenantId]);
    if (memberAccess) {
      return memberAccess;
    }
  } catch (e) {
    // Tables absentes: continuer
  }

  // 4) Dernière vérification : accès via assignation agent-client active (basé sur users)
  try {
    const agentAccess = await databaseService.get(`
      SELECT f.* FROM files f
      INNER JOIN projects p ON f.project_id = p.id
      INNER JOIN users u ON p.client_id = u.id
      INNER JOIN agent_clients ac ON u.id = ac.client_id
      WHERE f.id = ? AND ac.agent_id = ? AND ac.status = 'active'
    `, [fileId, tenantId]);
    if (agentAccess) {
      return agentAccess;
    }
  } catch (e) {
    // Ignorer erreurs et continuer
  }
  
  const err = new Error('FORBIDDEN');
  err.code = 'FORBIDDEN';
  throw err;
}

module.exports = { assertFileAccess };