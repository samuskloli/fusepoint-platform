const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../middleware/auth');
const { requireRole } = require('../middleware/roleAuth');
const clientWidgetConfigService = require('../services/clientWidgetConfigService');
const responseService = require('../services/responseService');
const databaseService = require('../services/databaseService');
const agentService = require('../services/agentService');
const { requireProjectView, requireProjectEdit } = require('../middleware/projectAccess');

// Middleware pour s'assurer que le projet appartient bien au client fourni
async function ensureProjectClientMatch(req, res, next) {
  try {
    const { clientId, projectId } = req.params;
    const projectCheck = await databaseService.query(
      'SELECT id FROM projects WHERE id = ? AND client_id = ?',
      [projectId, clientId]
    );
    if (projectCheck.length === 0) {
      return responseService.error(res, 'Projet non trouvé pour ce client', 404);
    }
    next();
  } catch (error) {
    console.error('Erreur vérification client-projet:', error);
    return responseService.error(res, 'Erreur serveur', 500);
  }
}

/**
 * @route GET /api/client-widget-configs/:clientId/projects/:projectId/widgets
 * @desc Récupérer toutes les configurations de widgets pour un client et un projet
 * @access Private (Agent, Admin, Super Admin)
 */
router.get('/:clientId/projects/:projectId/widgets', 
  authenticateToken, 
  requireProjectView,
  ensureProjectClientMatch,
  async (req, res) => {
    try {
      const { clientId, projectId } = req.params;
      const result = await clientWidgetConfigService.getClientProjectWidgets(clientId, projectId);
      if (result.success) {
        responseService.success(res, 'Configurations de widgets récupérées avec succès', result.data);
      } else {
        responseService.error(res, result.error, 500);
      }
    } catch (error) {
      console.error('Erreur lors de la récupération des configurations de widgets:', error);
      responseService.error(res, 'Erreur serveur', 500);
    }
  }
);

/**
 * @route GET /api/client-widget-configs/:clientId/projects/:projectId/widgets/:widgetId
 * @desc Récupérer la configuration d'un widget spécifique
 * @access Private (Agent, Admin, Super Admin)
 */
router.get('/:clientId/projects/:projectId/widgets/:widgetId', 
  authenticateToken, 
  requireProjectView,
  ensureProjectClientMatch,
  async (req, res) => {
    try {
      const { clientId, projectId, widgetId } = req.params;
      const result = await clientWidgetConfigService.getClientWidgetConfig(clientId, projectId, widgetId);
      if (result.success) {
        responseService.success(res, 'Configuration du widget récupérée avec succès', result.data);
      } else {
        responseService.error(res, result.error, 500);
      }
    } catch (error) {
      console.error('Erreur lors de la récupération de la configuration du widget:', error);
      responseService.error(res, 'Erreur serveur', 500);
    }
  }
);

/**
 * @route POST /api/client-widget-configs/:clientId/projects/:projectId/widgets/:widgetId
 * @desc Créer ou mettre à jour la configuration d'un widget
 * @access Private (Agent, Admin, Super Admin)
 */
router.post('/:clientId/projects/:projectId/widgets/:widgetId', 
  authenticateToken, 
  requireProjectEdit,
  ensureProjectClientMatch,
  async (req, res) => {
    try {
      const { clientId, projectId, widgetId } = req.params;
      const configData = req.body;
      const result = await clientWidgetConfigService.saveClientWidgetConfig(
        clientId,
        projectId,
        widgetId,
        configData
      );
      if (result.success) {
        responseService.success(res, 'Configuration du widget mise à jour avec succès', result.data);
      } else {
        responseService.error(res, result.error, 500);
      }
    } catch (error) {
      console.error("Erreur lors de la création/mise à jour de la configuration du widget:", error);
      responseService.error(res, 'Erreur serveur', 500);
    }
  }
);

/**
 * @route PUT /api/client-widget-configs/:clientId/projects/:projectId/widgets/:widgetId
 * @desc Mettre à jour la configuration d'un widget
 * @access Private (Agent, Admin, Super Admin)
 */
router.put('/:clientId/projects/:projectId/widgets/:widgetId', 
  authenticateToken, 
  requireProjectEdit,
  ensureProjectClientMatch,
  async (req, res) => {
    try {
      const { clientId, projectId, widgetId } = req.params;
      const configData = req.body;
      const result = await clientWidgetConfigService.saveClientWidgetConfig(
        clientId, 
        projectId, 
        widgetId, 
        configData
      );
      if (result.success) {
        responseService.success(res, 'Configuration du widget mise à jour avec succès', result.data);
      } else {
        responseService.error(res, result.error, 500);
      }
    } catch (error) {
      console.error('Erreur lors de la mise à jour de la configuration du widget:', error);
      responseService.error(res, 'Erreur serveur', 500);
    }
  }
);

/**
 * @route DELETE /api/client-widget-configs/:clientId/projects/:projectId/widgets/:widgetId
 * @desc Supprimer la configuration d'un widget
 * @access Private (Agent, Admin, Super Admin)
 */
router.delete('/:clientId/projects/:projectId/widgets/:widgetId', 
  authenticateToken, 
  requireProjectEdit,
  ensureProjectClientMatch,
  async (req, res) => {
    try {
      const { clientId, projectId, widgetId } = req.params;
      const result = await clientWidgetConfigService.deleteClientWidgetConfig(clientId, projectId, widgetId);
      if (result.success) {
        responseService.success(res, 'Configuration du widget supprimée avec succès');
      } else {
        responseService.error(res, result.error, 500);
      }
    } catch (error) {
      console.error('Erreur lors de la suppression de la configuration du widget:', error);
      responseService.error(res, 'Erreur serveur', 500);
    }
  }
);

/**
 * @route POST /api/client-widget-configs/:clientId/projects/:projectId/widgets/reorder
 * @desc Réorganiser l'ordre des widgets
 * @access Private (Agent, Admin, Super Admin)
 */
router.post('/:clientId/projects/:projectId/widgets/reorder', 
  authenticateToken, 
  requireProjectEdit,
  ensureProjectClientMatch,
  async (req, res) => {
    try {
      const { clientId, projectId } = req.params;
      const { widgetOrders } = req.body;
      if (!Array.isArray(widgetOrders)) {
        return responseService.error(res, 'Format de données invalide', 400);
      }
      const result = await clientWidgetConfigService.reorderClientWidgets(clientId, projectId, widgetOrders);
      if (result.success) {
        responseService.success(res, 'Ordre des widgets mis à jour avec succès');
      } else {
        responseService.error(res, result.error, 500);
      }
    } catch (error) {
      console.error('Erreur lors de la réorganisation des widgets:', error);
      responseService.error(res, 'Erreur serveur', 500);
    }
  }
);

/**
 * @route POST /api/client-widget-configs/:clientId/projects/:projectId/initialize/:templateId
 * @desc Initialiser les widgets d'un projet à partir d'un template
 * @access Private (Agent, Admin, Super Admin)
 */
router.post('/:clientId/projects/:projectId/initialize/:templateId', 
  authenticateToken, 
  requireProjectEdit,
  ensureProjectClientMatch,
  async (req, res) => {
    try {
      const { clientId, projectId, templateId } = req.params;
      const result = await clientWidgetConfigService.copyTemplateWidgetsToClient(
        clientId, 
        projectId, 
        templateId
      );
      if (result.success) {
        responseService.success(res, 'Widgets initialisés avec succès', result.data);
      } else {
        responseService.error(res, result.error, 500);
      }
    } catch (error) {
      console.error("Erreur lors de l'initialisation des widgets:", error);
      responseService.error(res, 'Erreur serveur', 500);
    }
  }
);

/**
 * @route GET /api/client-widget-configs/templates/:clientType
 * @desc Récupérer les templates de widgets pour un type de client
 * @access Private (Agent, Admin, Super Admin)
 */
router.get('/templates/:clientType', 
  authenticateToken, 
  requireRole(['agent', 'admin', 'super_admin']), 
  async (req, res) => {
    try {
      const { clientType } = req.params;
      
      // Validation du type de client
      const validClientTypes = ['individual', 'small_business', 'enterprise', 'agency'];
      if (!validClientTypes.includes(clientType)) {
        return responseService.error(res, 'Type de client invalide', 400);
      }
      
      const query = `
        SELECT 
          cwt.*,
          w.name as widget_name,
          w.component_name,
          w.category,
          w.icon
        FROM client_widget_templates cwt
        INNER JOIN widgets w ON cwt.widget_id = w.id
        WHERE cwt.client_type = ? AND cwt.is_enabled = 1 AND cwt.is_active = 1
        ORDER BY cwt.default_position_y, cwt.default_position_x
      `;
      
      const result = await databaseService.query(query, [clientType]);
      
      const templates = result.map(template => ({
        id: template.id,
        templateName: template.template_name,
        clientType: template.client_type,
        widgetId: template.widget_id,
        widgetName: template.widget_name,
        componentName: template.component_name,
        category: template.category,
        icon: template.icon,
        defaultConfig: (() => { try { return template.default_config ? JSON.parse(template.default_config) : {}; } catch (e) { return {}; } })(),
        defaultPosition: {
          x: template.default_position_x,
          y: template.default_position_y
        },
        defaultSize: {
          width: template.default_width,
          height: template.default_height
        },
        defaultPermissions: (() => { try { return template.default_permissions ? JSON.parse(template.default_permissions) : {}; } catch (e) { return {}; } })(),
        isEnabled: template.is_enabled
      }));
      
      responseService.success(res, 'Templates récupérés avec succès', templates);
      
    } catch (error) {
      console.error('Erreur lors de la récupération des templates:', error);
      responseService.error(res, 'Erreur serveur', 500);
    }
  }
);

/**
 * Fonction utilitaire pour vérifier l'accès agent-client
 * Utilise agent_clients si synchronisé, sinon fallback sur users.agent_id
 */
async function checkAgentClientAccess(agentId, clientId) {
  return agentService.checkAgentClientAccess(agentId, clientId);
}

/**
 * Fonction utilitaire pour vérifier que l'agent est bien membre du projet (partage explicite)
 */
async function checkAgentProjectMembership(agentId, projectId) {
  try {
    // team_members
    const tm = await databaseService.query(
      'SELECT id FROM team_members WHERE project_id = ? AND user_id = ? LIMIT 1',
      [projectId, agentId]
    );
    if (tm && tm.length > 0) return true;

    // project_members
    const pm = await databaseService.query(
      'SELECT id FROM project_members WHERE project_id = ? AND user_id = ? LIMIT 1',
      [projectId, agentId]
    );
    if (pm && pm.length > 0) return true;

    // projet assigné directement à l'agent
    const assigned = await databaseService.get(
      'SELECT id FROM projects WHERE id = ? AND agent_id = ? LIMIT 1',
      [projectId, agentId]
    );
    if (assigned) return true;

    // relation agent↔client active (si le projet appartient à ce client)
    const project = await databaseService.get('SELECT id, client_id FROM projects WHERE id = ? LIMIT 1', [projectId]);
    if (project) {
      const ac = await databaseService.get(
        'SELECT id FROM agent_clients WHERE agent_id = ? AND client_id = ? AND status = ? LIMIT 1',
        [agentId, project.client_id, 'active']
      );
      if (ac) return true;
    }

    return false;
  } catch (error) {
    console.error("Erreur lors de la vérification de l'appartenance de l'agent au projet:", error);
    return false;
  }
}

module.exports = router;