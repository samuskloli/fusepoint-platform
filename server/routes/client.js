const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/auth');
const databaseService = require('../services/databaseService');
const ClientManagementService = require('../services/clientManagementService');

// Middleware pour toutes les routes client
router.use(authMiddleware);

/**
 * GET /api/client/:id/actions
 * Récupérer les actions/projets en cours du client
 */
router.get('/:id/actions', async (req, res) => {
  try {
    const clientId = req.params.id;
    const userId = req.user.id;
    
    // Vérifier que l'utilisateur peut accéder aux données de ce client
    if (userId != clientId && req.user.role !== 'admin' && req.user.role !== 'agent' && req.user.role !== 'super_admin') {
      return res.status(403).json({ error: 'Accès non autorisé' });
    }

    const query = `
      SELECT 
        p.id,
        p.title,
        p.description,
        p.status,
        p.start_date,
        p.end_date,
        p.last_update,
        p.next_step,
        p.progress
      FROM projects p
      WHERE p.client_id = ? AND p.status IN ('en_cours', 'en_validation', 'en_pause')
      ORDER BY p.last_update DESC
    `;

    const actions = await databaseService.query(query, [clientId]);
    
    // Formater les données pour le frontend
    const formattedActions = actions.map(action => ({
      id: action.id,
      title: action.title,
      status: action.status,
      lastUpdate: action.last_update,
      nextStep: action.next_step || 'En cours de traitement',
      progress: action.progress || 0
    }));

    res.json(formattedActions);
  } catch (error) {
    console.error('Erreur lors de la récupération des actions:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

/**
 * GET /api/client/:id/pending-tasks
 * Récupérer les tâches en attente de validation
 */
router.get('/:id/pending-tasks', async (req, res) => {
  try {
    const clientId = req.params.id;
    const userId = req.user.id;
    
    // Vérifier que l'utilisateur peut accéder aux données de ce client
    if (userId != clientId && req.user.role !== 'admin' && req.user.role !== 'agent' && req.user.role !== 'super_admin') {
      return res.status(403).json({ error: 'Accès non autorisé' });
    }

    const query = `
      SELECT 
        t.id,
        t.title,
        t.description,
        t.created_at,
        t.due_date,
        p.title as project_title
      FROM tasks t
      LEFT JOIN projects p ON t.project_id = p.id
      WHERE t.client_id = ? AND t.status = 'pending_validation'
      ORDER BY t.created_at DESC
    `;

    const tasks = await databaseService.query(query, [clientId]);
    
    // Formater les données pour le frontend
    const formattedTasks = tasks.map(task => ({
      id: task.id,
      title: task.title,
      description: task.description,
      projectTitle: task.project_title,
      createdAt: task.created_at,
      dueDate: task.due_date
    }));

    res.json(formattedTasks);
  } catch (error) {
    console.error('Erreur lors de la récupération des tâches en attente:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

/**
 * GET /api/client/:id/deadlines
 * Récupérer les prochaines échéances
 */
router.get('/:id/deadlines', async (req, res) => {
  try {
    const clientId = req.params.id;
    const userId = req.user.id;
    
    // Vérifier que l'utilisateur peut accéder aux données de ce client
    if (userId != clientId && req.user.role !== 'admin' && req.user.role !== 'agent' && req.user.role !== 'super_admin') {
      return res.status(403).json({ error: 'Accès non autorisé' });
    }

    const query = `
      SELECT 
        d.id,
        d.title,
        d.description,
        d.due_date,
        d.urgency,
        p.title as project_title
      FROM deadlines d
      LEFT JOIN projects p ON d.project_id = p.id
      WHERE d.client_id = ? AND d.due_date >= date('now')
      ORDER BY d.due_date ASC
      LIMIT 10
    `;

    const deadlines = await databaseService.query(query, [clientId]);
    
    // Formater les données pour le frontend
    const formattedDeadlines = deadlines.map(deadline => ({
      id: deadline.id,
      title: deadline.title,
      description: deadline.description,
      date: deadline.due_date,
      urgency: deadline.urgency || 'Normal',
      projectTitle: deadline.project_title
    }));

    res.json(formattedDeadlines);
  } catch (error) {
    console.error('Erreur lors de la récupération des échéances:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

/**
 * GET /api/client/projects
 * Récupérer tous les projets du client connecté
 */
router.get('/projects', async (req, res) => {
  try {
    const userId = req.user.id;
    
    const query = `
      SELECT 
        p.id,
        p.title,
        p.description,
        p.status,
        p.priority,
        p.start_date,
        p.end_date,
        p.created_at,
        p.progress,
        u.first_name as agent_first_name,
        u.last_name as agent_last_name,
        u.email as agent_email
      FROM projects p
      LEFT JOIN users u ON p.agent_id = u.id
      WHERE p.client_id = ?
      ORDER BY p.created_at DESC
    `;

    const projects = await databaseService.query(query, [userId]);
    
    // Formater les données pour le frontend
    const formattedProjects = projects.map(project => ({
      id: project.id,
      name: project.title,
      description: project.description,
      status: project.status,
      priority: project.priority || 'medium',
      createdAt: project.created_at,
      deadline: project.end_date,
      progress: project.progress || 0,
      agent: project.agent_first_name ? {
        firstName: project.agent_first_name,
        lastName: project.agent_last_name,
        email: project.agent_email
      } : null
    }));

    res.json(formattedProjects);
  } catch (error) {
    console.error('Erreur lors de la récupération des projets:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

/**
 * GET /api/client/projects/:id
 * Récupérer les détails d'un projet spécifique
 */
router.get('/projects/:id', async (req, res) => {
  try {
    const projectId = req.params.id;
    const userId = req.user.id;
    
    const query = `
      SELECT 
        p.*,
        u.first_name as agent_first_name,
        u.last_name as agent_last_name,
        u.email as agent_email
      FROM projects p
      LEFT JOIN users u ON p.agent_id = u.id
      WHERE p.id = ? AND p.client_id = ?
    `;

    const project = await databaseService.get(query, [projectId, userId]);
    
    if (!project) {
      return res.status(404).json({ error: 'Projet non trouvé' });
    }

    // Formater les données pour le frontend
    const formattedProject = {
      id: project.id,
      name: project.title,
      description: project.description,
      status: project.status,
      priority: project.priority || 'medium',
      createdAt: project.created_at,
      deadline: project.end_date,
      progress: project.progress || 0,
      agent: project.agent_first_name ? {
        firstName: project.agent_first_name,
        lastName: project.agent_last_name,
        email: project.agent_email
      } : null
    };

    res.json(formattedProject);
  } catch (error) {
    console.error('Erreur lors de la récupération du projet:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

/**
 * GET /api/client/:id/assigned-agent
 * Récupérer l'agent attribué au client
 */
router.get('/:id/assigned-agent', async (req, res) => {
  try {
    const clientId = req.params.id;
    const userId = req.user.id;
    
    // Vérifier que l'utilisateur peut accéder aux données de ce client
    if (userId != clientId && req.user.role !== 'admin' && req.user.role !== 'agent' && req.user.role !== 'super_admin') {
      return res.status(403).json({ error: 'Accès non autorisé' });
    }

    console.log('🔍 Vérification attribution pour client ID:', clientId);
    
    // Vérifier l'attribution dans agent_prestataires
    // Note: prestataire_id est utilisé pour stocker l'ID du client
    const assignment = await databaseService.db.get(
      `SELECT ap.*, u.first_name, u.last_name, u.email 
       FROM agent_prestataires ap 
       JOIN users u ON ap.agent_id = u.id 
       WHERE ap.prestataire_id = ? AND ap.status = 'active'`,
      [clientId]
    );
    
    console.log('📊 Résultat attribution:', assignment);
    
    if (assignment) {
      res.json({
        success: true,
        hasAssignedAgent: true,
        agent: {
          id: assignment.agent_id,
          firstName: assignment.first_name,
          lastName: assignment.last_name,
          email: assignment.email,
          assigned_at: assignment.assigned_at || assignment.created_at
        }
      });
    } else {
      res.json({
        success: true,
        hasAssignedAgent: false,
        agent: null
      });
    }
  } catch (error) {
    console.error('Erreur vérification attribution:', error);
    res.status(500).json({ success: false, message: 'Erreur serveur' });
  }
});

/**
 * GET /api/client/:id/stats
 * Récupérer les statistiques du client
 */
router.get('/:id/stats', async (req, res) => {
  try {
    const clientId = req.params.id;
    const userId = req.user.id;
    
    // Vérifier que l'utilisateur peut accéder aux données de ce client
    if (userId != clientId && req.user.role !== 'admin' && req.user.role !== 'agent' && req.user.role !== 'super_admin') {
      return res.status(403).json({ error: 'Accès non autorisé' });
    }

    // Récupérer les statistiques
    const [completedProjects] = await databaseService.query(
      'SELECT COUNT(*) as count FROM projects WHERE client_id = ? AND status = "completed"',
      [clientId]
    );
    
    const [activeActions] = await databaseService.query(
      'SELECT COUNT(*) as count FROM projects WHERE client_id = ? AND status = "active"',
      [clientId]
    );
    
    const [pendingTasks] = await databaseService.query(
      'SELECT COUNT(*) as count FROM tasks WHERE project_id IN (SELECT id FROM projects WHERE client_id = ?) AND status = "pending"',
      [clientId]
    );
    
    const [upcomingDeadlines] = await databaseService.query(
      'SELECT COUNT(*) as count FROM deadlines WHERE project_id IN (SELECT id FROM projects WHERE client_id = ?) AND due_date > datetime("now")',
      [clientId]
    );

    const stats = {
      completedProjects: completedProjects?.count || 0,
      activeActions: activeActions?.count || 0,
      pendingTasks: pendingTasks?.count || 0,
      upcomingDeadlines: upcomingDeadlines?.count || 0
    };

    res.json(stats);
  } catch (error) {
    console.error('Erreur lors de la récupération des statistiques:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

/**
 * POST /api/client/tasks/:id/validate
 * Valider une tâche
 */
router.post('/tasks/:id/validate', async (req, res) => {
  try {
    const taskId = req.params.id;
    const userId = req.user.id;
    const { approved, comments } = req.body;
    
    // Vérifier que la tâche appartient au client
    const task = await databaseService.get(
      'SELECT * FROM tasks WHERE id = ? AND client_id = ?',
      [taskId, userId]
    );
    
    if (!task) {
      return res.status(404).json({ error: 'Tâche non trouvée' });
    }

    // Mettre à jour le statut de la tâche
    const newStatus = approved ? 'approved' : 'rejected';
    await databaseService.run(
      'UPDATE tasks SET status = ?, validation_comments = ?, validated_at = datetime("now") WHERE id = ?',
      [newStatus, comments || null, taskId]
    );

    // Enregistrer l'historique
    await databaseService.run(
      'INSERT INTO task_history (task_id, action, comments, created_by, created_at) VALUES (?, ?, ?, ?, datetime("now"))',
      [taskId, `Task ${newStatus}`, comments || null, userId]
    );

    res.json({ 
      success: true, 
      message: `Tâche ${approved ? 'approuvée' : 'rejetée'} avec succès` 
    });
  } catch (error) {
    console.error('Erreur lors de la validation de la tâche:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

/**
 * GET /api/client/actions/:id
 * Récupérer les détails d'une action
 */
router.get('/actions/:id', async (req, res) => {
  try {
    const actionId = req.params.id;
    const userId = req.user.id;
    
    const action = await databaseService.get(
      'SELECT * FROM projects WHERE id = ? AND (client_id = ? OR ? IN (SELECT id FROM users WHERE role IN ("admin", "agent")))',
      [actionId, userId, userId]
    );
    
    if (!action) {
      return res.status(404).json({ error: 'Action non trouvée' });
    }

    res.json(action);
  } catch (error) {
    console.error('Erreur lors de la récupération des détails de l\'action:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

/**
 * GET /api/client/tasks/:id
 * Récupérer les détails d'une tâche
 */
router.get('/tasks/:id', async (req, res) => {
  try {
    const taskId = req.params.id;
    const userId = req.user.id;
    
    const task = await databaseService.get(
      'SELECT * FROM tasks WHERE id = ? AND (client_id = ? OR ? IN (SELECT id FROM users WHERE role IN ("admin", "agent")))',
      [taskId, userId, userId]
    );
    
    if (!task) {
      return res.status(404).json({ error: 'Tâche non trouvée' });
    }

    res.json(task);
  } catch (error) {
    console.error('Erreur lors de la récupération des détails de la tâche:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});



/**
 * POST /api/client/:id/assign-agent
 * Assigner un agent à un client
 */
router.post('/:id/assign-agent', async (req, res) => {
  console.log('🔍 Début de assign-agent endpoint');
  console.log('clientId:', req.params.id);
  console.log('req.body:', req.body);
  
  const { agentId } = req.body;
  const clientId = req.params.id;
  const currentUserId = req.user.id;
  
  console.log('agentId:', agentId);
  console.log('currentUserId:', currentUserId);
  console.log('user role:', req.user.role);

  try {
    // Vérifier les permissions
    if (!['agent', 'admin', 'super_admin'].includes(req.user.role)) {
      console.log('❌ Permissions insuffisantes');
      return res.status(403).json({ 
        success: false, 
        message: 'Accès refusé. Seuls les agents peuvent assigner des clients.' 
      });
    }

    // Validation des paramètres
    if (!clientId || !agentId) {
      console.log('❌ Paramètres manquants - clientId:', clientId, 'agentId:', agentId);
      return res.status(400).json({ 
        success: false, 
        message: 'ID client et ID agent requis' 
      });
    }

    console.log('✅ Validation passée, appel du service...');
    
    // Assigner l'agent au client
    const result = await ClientManagementService.assignAgentToClient(
      clientId, 
      agentId, 
      currentUserId
    );

    console.log('✅ Service terminé avec succès:', result);

    res.json({
      success: true,
      message: 'Agent assigné avec succès',
      data: result
    });

  } catch (error) {
    console.error('❌ Erreur complète dans assign-agent:', error);
    console.error('❌ Error message:', error.message);
    console.error('❌ Error code:', error.code);
    console.error('❌ Error stack:', error.stack);
    
    let statusCode = 500;
    let message = 'Erreur serveur lors de l\'assignation d\'agent';
    
    if (error.code === 'CLIENT_NOT_FOUND') {
      statusCode = 404;
      message = 'Client non trouvé';
    } else if (error.code === 'AGENT_NOT_FOUND') {
      statusCode = 404;
      message = 'Agent non trouvé';
    } else if (error.code === 'ACCESS_DENIED') {
      statusCode = 403;
      message = 'Accès refusé';
    }
    
    console.log('❌ Réponse envoyée avec status:', statusCode, 'message:', message);
    
    res.status(statusCode).json({
      success: false,
      message: message,
      error: error.message
    });
  }
});

module.exports = router;