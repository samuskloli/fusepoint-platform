const express = require('express');
const router = express.Router();
const databaseService = require('../services/databaseService');
const { requireProjectView } = require('../middleware/projectAccess');

// GET /api/projects/:projectId/widgets/catalog
router.get('/:projectId/widgets/catalog', requireProjectView, async (req, res) => {
  try {
    console.log('🔍 Début récupération catalog widgets pour projet:', req.params.projectId);
    const rows = await databaseService.query(
      'SELECT id, nameKey AS `key`, name, category, is_active, config_schema FROM widgets WHERE is_active = 1 ORDER BY category, name'
    );
    console.log('✅ Widgets récupérés:', rows.length, 'widgets trouvés');
    return res.json({ success: true, data: { catalog: rows } });
  } catch (error) {
    console.error('❌ Erreur récupération du catalog widgets:', error);
    console.error('❌ Stack trace:', error.stack);
    return res.status(500).json({ success: false, error: 'Erreur lors de la récupération du catalog de widgets' });
  }
});

module.exports = router;