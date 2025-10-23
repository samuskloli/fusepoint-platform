const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/auth');
const superAdminAuth = require('../middleware/superAdminAuth');
const databaseService = require('../services/databaseService');

/**
 * @route GET /api/debug/db-pool
 * @desc Retourne les statistiques du pool MariaDB
 * @access Super Admin
 */
router.get('/db-pool', 
  authMiddleware,
  superAdminAuth.requireSuperAdmin(),
  async (req, res) => {
    try {
      const stats = databaseService.mariadb.getPoolStats();
      return res.json({ success: true, stats });
    } catch (error) {
      console.error('❌ Erreur récupération stats pool:', error);
      return res.status(500).json({ success: false, error: error.message });
    }
  }
);

module.exports = router;