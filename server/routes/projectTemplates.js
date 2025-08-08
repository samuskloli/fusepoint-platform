const express = require('express');
const router = express.Router();
const projectTemplateService = require('../services/projectTemplateService');
const { authenticateToken } = require('../middleware/auth');
const { requireRole } = require('../middleware/roleAuth');
const responseService = require('../services/responseService');

/**
 * @route GET /api/project-templates
 * @desc Récupérer tous les modèles de projets
 * @access Agent
 */
router.get('/', authenticateToken, requireRole(['agent', 'admin', 'super_admin']), async (req, res) => {
  try {
    const filters = {
      category: req.query.category,
      search: req.query.search
    };
    
    const result = await projectTemplateService.getAllTemplates(filters);
    
    if (result.success) {
      responseService.success(res, 'projectTemplates.retrieved', result.data);
    } else {
      responseService.error(res, result.error, 400);
    }
  } catch (error) {
    responseService.error(res, 'projectTemplates.retrieveError', 500);
  }
});

/**
 * @route GET /api/project-templates/categories
 * @desc Récupérer les catégories de modèles
 * @access Agent
 */
router.get('/categories', authenticateToken, requireRole(['agent', 'admin', 'super_admin']), async (req, res) => {
  try {
    const result = await projectTemplateService.getTemplateCategories();
    
    if (result.success) {
      responseService.success(res, 'projectTemplates.categoriesRetrieved', result.data);
    } else {
      responseService.error(res, result.error, 400);
    }
  } catch (error) {
    responseService.error(res, 'projectTemplates.categoriesRetrieveError', 500);
  }
});

/**
 * @route GET /api/project-templates/:id
 * @desc Récupérer un modèle de projet par ID
 * @access Agent
 */
router.get('/:id', authenticateToken, requireRole(['agent', 'admin', 'super_admin']), async (req, res) => {
  try {
    const templateId = parseInt(req.params.id);
    
    if (isNaN(templateId)) {
      return responseService.error(res, 'projectTemplates.invalidTemplateId', 400);
    }
    
    const result = await projectTemplateService.getTemplateById(templateId);
    
    if (result.success) {
      responseService.success(res, 'projectTemplates.templateRetrieved', result.data);
    } else {
      responseService.error(res, result.error, 404);
    }
  } catch (error) {
    responseService.error(res, 'projectTemplates.templateRetrieveError', 500);
  }
});

/**
 * @route POST /api/project-templates
 * @desc Créer un nouveau modèle de projet
 * @access Agent
 */
router.post('/', authenticateToken, requireRole(['agent', 'admin', 'super_admin']), async (req, res) => {
  try {
    const templateData = req.body;
    const agentId = req.user.id;
    
    const result = await projectTemplateService.createTemplate(templateData, agentId);
    
    if (result.success) {
      responseService.success(res, 'projectTemplates.templateCreated', result.data, 201);
    } else {
      responseService.error(res, result.error, 400);
    }
  } catch (error) {
    responseService.error(res, 'projectTemplates.templateCreateError', 500);
  }
});

/**
 * @route PUT /api/project-templates/:id
 * @desc Mettre à jour un modèle de projet
 * @access Agent
 */
router.put('/:id', authenticateToken, requireRole(['agent', 'admin', 'super_admin']), async (req, res) => {
  try {
    const templateId = parseInt(req.params.id);
    const templateData = req.body;
    const agentId = req.user.id;
    
    if (isNaN(templateId)) {
      return responseService.error(res, 'projectTemplates.invalidTemplateId', 400);
    }
    
    const result = await projectTemplateService.updateTemplate(templateId, templateData, agentId);
    
    if (result.success) {
      responseService.success(res, 'projectTemplates.templateUpdated', result.data);
    } else {
      responseService.error(res, result.error, 400);
    }
  } catch (error) {
    responseService.error(res, 'projectTemplates.templateUpdateError', 500);
  }
});

/**
 * @route DELETE /api/project-templates/:id
 * @desc Supprimer un modèle de projet
 * @access Agent
 */
router.delete('/:id', authenticateToken, requireRole(['agent', 'admin', 'super_admin']), async (req, res) => {
  try {
    const templateId = parseInt(req.params.id);
    const agentId = req.user.id;
    
    if (isNaN(templateId)) {
      return responseService.error(res, 'projectTemplates.invalidTemplateId', 400);
    }
    
    const result = await projectTemplateService.deleteTemplate(templateId, agentId);
    
    if (result.success) {
      responseService.success(res, 'projectTemplates.templateDeleted', null);
    } else {
      responseService.error(res, result.error, 400);
    }
  } catch (error) {
    responseService.error(res, 'projectTemplates.templateDeleteError', 500);
  }
});

/**
 * @route GET /api/project-templates/:id/widgets
 * @desc Récupérer les widgets d'un modèle
 * @access Agent
 */
router.get('/:id/widgets', authenticateToken, requireRole(['agent', 'admin', 'super_admin']), async (req, res) => {
  try {
    const templateId = parseInt(req.params.id);
    
    if (isNaN(templateId)) {
      return responseService.error(res, 'projectTemplates.invalidTemplateId', 400);
    }
    
    const widgets = await projectTemplateService.getTemplateWidgets(templateId);
    responseService.success(res, 'projectTemplates.widgetsRetrieved', widgets);
  } catch (error) {
    responseService.error(res, 'projectTemplates.widgetsRetrieveError', 500);
  }
});

/**
 * @route PUT /api/project-templates/:id/widgets
 * @desc Mettre à jour les widgets d'un modèle
 * @access Agent
 */
router.put('/:id/widgets', authenticateToken, requireRole(['agent', 'admin', 'super_admin']), async (req, res) => {
  try {
    const templateId = parseInt(req.params.id);
    const widgets = req.body.widgets;
    
    if (isNaN(templateId)) {
      return responseService.error(res, 'projectTemplates.invalidTemplateId', 400);
    }
    
    if (!Array.isArray(widgets)) {
      return responseService.error(res, 'projectTemplates.invalidWidgetsFormat', 400);
    }
    
    const result = await projectTemplateService.updateTemplateWidgets(templateId, widgets);
    
    if (result.success) {
      responseService.success(res, 'projectTemplates.widgetsUpdated', null);
    } else {
      responseService.error(res, result.error, 400);
    }
  } catch (error) {
    responseService.error(res, 'projectTemplates.widgetsUpdateError', 500);
  }
});

/**
 * @route GET /api/project-templates/projects/:projectId/widgets
 * @desc Récupérer les widgets d'un projet
 * @access Agent
 */
router.get('/projects/:projectId/widgets', authenticateToken, requireRole(['agent', 'admin', 'super_admin']), async (req, res) => {
  try {
    const projectId = parseInt(req.params.projectId);
    
    if (isNaN(projectId)) {
      return responseService.error(res, 'ID de projet invalide', 400);
    }
    
    const widgets = await projectTemplateService.getProjectWidgets(projectId);
    responseService.success(res, widgets, 'Widgets du projet récupérés avec succès');
  } catch (error) {
    responseService.error(res, 'Erreur serveur lors de la récupération des widgets du projet', 500);
  }
});

/**
 * @route POST /api/project-templates/:id/create-project
 * @desc Créer un projet à partir d'un modèle
 * @access Agent
 */
router.post('/:id/create-project', authenticateToken, requireRole(['agent', 'admin', 'super_admin']), async (req, res) => {
  try {
    const templateId = parseInt(req.params.id);
    const projectData = req.body;
    const agentId = req.user.id;
    
    if (isNaN(templateId)) {
      return responseService.error(res, 'ID de modèle invalide', 400);
    }
    
    if (!projectData.client_id || !projectData.title) {
      return responseService.error(res, 'Données de projet incomplètes', 400);
    }
    
    const result = await projectTemplateService.createProjectFromTemplate(templateId, projectData, agentId);
    
    if (result.success) {
      responseService.success(res, result.data, 'Projet créé avec succès à partir du modèle', 201);
    } else {
      responseService.error(res, result.error, 400);
    }
  } catch (error) {
    responseService.error(res, 'Erreur serveur lors de la création du projet', 500);
  }
});

module.exports = router;