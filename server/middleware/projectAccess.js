const databaseService = require('../services/databaseService');

/**
 * Middleware d'accès unifié par projet
 * Usage: app.use('/api/projects', assertProjectAccess('view'))
 *        ou au niveau route: router.get('/:projectId/tasks', assertProjectAccess('view'), handler)
 */
function normalizeRole(role) {
  return String(role || '').toLowerCase();
}

async function getProjectById(projectId) {
  const row = await databaseService.get('SELECT id, client_id FROM projects WHERE id = ?', [projectId]);
  return row || null;
}

async function findProjectMember({ projectId, userId, tenantId }) {
  // Essayer project_members
  try {
    const pm = await databaseService.get(
      'SELECT id, role, is_active FROM project_members WHERE project_id = ? AND user_id = ? AND (tenant_id = ? OR ? IS NULL) LIMIT 1',
      [projectId, userId, tenantId || null, tenantId || null]
    );
    if (pm) return pm;
  } catch (e) {
    // Table absente ou colonne manquante: ignorer
  }
  // Essayer team_members (schéma alternatif)
  try {
    const tm = await databaseService.get(
      'SELECT id, role, 1 as is_active FROM team_members WHERE project_id = ? AND user_id = ? LIMIT 1',
      [projectId, userId]
    );
    if (tm) return tm;
  } catch (e) {
    // Table absente: ignorer
  }
  // Vérifier si l'agent est assigné directement au projet
  try {
    const assigned = await databaseService.get(
      'SELECT id, agent_id FROM projects WHERE id = ? AND agent_id = ? LIMIT 1',
      [projectId, userId]
    );
    if (assigned) {
      return { id: assigned.id, role: 'agent', is_active: 1 };
    }
  } catch (e) {}
  // Vérifier relation agent↔client active (fallback lecture/édition si le projet appartient au client)
  try {
    const project = await getProjectById(projectId);
    if (project) {
      const ac = await databaseService.get(
        'SELECT id FROM agent_clients WHERE agent_id = ? AND client_id = ? AND status = ? LIMIT 1',
        [userId, project.client_id, 'active']
      );
      if (ac) {
        return { id: ac.id, role: 'agent', is_active: 1 };
      }
    }
  } catch (e) {}
  // Fallback: autoriser si client possède le projet
  try {
    const project = await getProjectById(projectId);
    if (!project) return null;
    const user = await databaseService.get('SELECT id, client_id, company_id FROM users WHERE id = ?', [userId]);
    const userClient = user ? (user.client_id ?? user.company_id) : null;
    if (userClient && String(userClient) === String(project.client_id)) {
      return { id: 0, role: 'client', is_active: 1 };
    }
  } catch (e) {}
  return null;
}

function logAccess({ req, status, code }) {
  try {
    const tenantId = req.tenantId ?? (req.user?.tenantId || req.user?.company_id || null);
    const userId = req.user?.id || null;
    const projectId = req.params?.projectId || req.projectId || null;
    const route = req.originalUrl;
    console.log(`🔎 Access | tenantId=${tenantId} projectId=${projectId} userId=${userId} route=${route} status=${status}${code ? ` code=${code}` : ''}`);
  } catch (e) {}
}

async function assertProjectAccess(req, res, next, roleNeeded = 'view') {
  try {
    console.log('🔍 DEBUG projectAccess START');
    const user = req.user || {};
    const role = normalizeRole(user.role);
    const userId = user.id;
    const tenantId = user.tenantId ?? user.company_id ?? null;
    const projectId = parseInt(req.params.projectId, 10);
    
    console.log('🔍 DEBUG projectAccess:', { userId, role, tenantId, projectId, roleNeeded });

    if (!projectId || isNaN(projectId)) {
      console.log('🚫 DEBUG: Invalid projectId:', projectId);
      logAccess({ req, status: 400, code: 'INVALID_PROJECT_ID' });
      return res.status(400).json({ success: false, error: 'projectId invalide' });
    }

    console.log('🔍 DEBUG: Getting project by ID:', projectId);
    const project = await getProjectById(projectId);
    console.log('🔍 DEBUG: Project found:', project);
    
    if (!project) {
      console.log('🚫 DEBUG: Project not found');
      logAccess({ req, status: 404, code: 'PROJECT_NOT_FOUND' });
      return res.status(404).json({ success: false, error: 'Projet introuvable' });
    }

    // Admins ont accès complet
    console.log('🔍 DEBUG: Checking admin access for role:', role);
    if (role === 'admin' || role === 'super_admin') {
      console.log('✅ DEBUG: Admin access granted');
      req.projectId = projectId;
      req.tenantId = tenantId ?? project.client_id ?? null;
      logAccess({ req, status: 200 });
      return next();
    }

    // Accès direct pour clients/users appartenant au même client que le projet
    const userClientId = user.client_id ?? user.company_id ?? null;
    if ((role === 'client' || role === 'user') && userClientId && String(userClientId) === String(project.client_id)) {
      console.log('✅ DEBUG: Client/user access granted by client ownership');
      req.projectId = projectId;
      req.tenantId = tenantId ?? project.client_id ?? null;
      logAccess({ req, status: 200 });
      return next();
    }

    // Accès client/user via correspondance de company_id avec le propriétaire du projet
    if (role === 'client' || role === 'user') {
      try {
        const projectOwner = await databaseService.get('SELECT company_id FROM users WHERE id = ?', [project.client_id]);
        const userCompanyId = user.company_id ?? user.client_id ?? null;
        if (projectOwner && userCompanyId && String(userCompanyId) === String(projectOwner.company_id)) {
          console.log('✅ DEBUG: Client/user access granted by company match');
          req.projectId = projectId;
          req.tenantId = tenantId ?? project.client_id ?? null;
          logAccess({ req, status: 200 });
          return next();
        }
      } catch (e) {
        console.log('⚠️ DEBUG: Company match check failed or users table missing:', e?.message);
      }
    }

    // Rechercher le membre du projet
    const pm = await findProjectMember({ projectId, userId, tenantId });
    console.log('🔍 DEBUG findProjectMember result:', pm);

    if (!pm || pm.is_active === 0) {
      console.log('🚫 DEBUG: Accès refusé - pas membre du projet ou inactif');
      logAccess({ req, status: 403, code: 'NOT_PROJECT_MEMBER' });
      return res.status(403).json({ success: false, error: 'Accès refusé : membre du projet requis' });
    }

    // Vérifier les permissions d'édition
    const memberRole = normalizeRole(pm.role);
    console.log('🔍 DEBUG permissions:', { roleNeeded, memberRole, canEdit: roleNeeded !== 'edit' || memberRole === 'agent' });
    
    if (roleNeeded === 'edit' && memberRole !== 'agent') {
      console.log('🚫 DEBUG: Accès refusé - rôle insuffisant pour édition');
      logAccess({ req, status: 403, code: 'EDIT_FORBIDDEN' });
      return res.status(403).json({ success: false, error: 'Accès refusé - rôle insuffisant' });
    }

    req.projectId = projectId;
    req.tenantId = tenantId ?? project.client_id ?? null;
    logAccess({ req, status: 200 });
    return next();
  } catch (error) {
    console.error('❌ assertProjectAccess error:', error);
    logAccess({ req, status: 500, code: 'INTERNAL_ERROR' });
    return res.status(500).json({ success: false, error: 'Erreur interne contrôle d\'accès projet' });
  }
}

// Wrappers compatibles avec Express pour usage direct
function requireProjectView(req, res, next) {
  return assertProjectAccess(req, res, next, 'view');
}
function requireProjectEdit(req, res, next) {
  return assertProjectAccess(req, res, next, 'edit');
}

module.exports = {
  assertProjectAccess,
  requireProjectView,
  requireProjectEdit
};