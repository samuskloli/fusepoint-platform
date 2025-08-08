const express = require('express');
const router = express.Router();
const projectTemplateService = require('../services/projectTemplateService');
const { authenticateToken } = require('../middleware/auth');
const { requireRole } = require('../middleware/roleAuth');
const responseService = require('../services/responseService');

/**
 * @route GET /api/widgets
 * @desc Récupérer tous les widgets disponibles
 * @access Agent
 */
router.get('/', authenticateToken, requireRole(['agent', 'admin']), async (req, res) => {
  try {
    const filters = {
      category: req.query.category
    };
    
    const result = await projectTemplateService.getAllWidgets(filters);
    
    if (result.success) {
      responseService.success(res, result.data, 'Widgets récupérés avec succès');
    } else {
      responseService.error(res, result.error, 400);
    }
  } catch (error) {
    responseService.error(res, 'Erreur serveur lors de la récupération des widgets', 500);
  }
});

/**
 * @route GET /api/widgets/categories
 * @desc Récupérer les catégories de widgets
 * @access Agent
 */
router.get('/categories', authenticateToken, requireRole(['agent', 'admin']), async (req, res) => {
  try {
    const result = await projectTemplateService.getWidgetCategories();
    
    if (result.success) {
      responseService.success(res, result.data, 'Catégories de widgets récupérées avec succès');
    } else {
      responseService.error(res, result.error, 400);
    }
  } catch (error) {
    responseService.error(res, 'Erreur serveur lors de la récupération des catégories de widgets', 500);
  }
});

module.exports = router;