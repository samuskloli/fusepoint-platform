const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/auth');
const superAdminAuth = require('../middleware/superAdminAuth');
const databaseService = require('../services/databaseService');

/**
 * @route GET /api/debug/db-pool
 * @desc Retourne les statistiques du pool MariaDB
 * @access Super Admin (ou dev si INSTALL_ENABLED=true)
 */
const isInstallEnabled = () => {
  const enabled = String(process.env.INSTALL_ENABLED || '').toLowerCase();
  return enabled === 'true' || enabled === '1';
};

// En développement ET si INSTALL_ENABLED=true, permettre l'accès sans auth pour le diagnostic local
if (false) {
  // Mode debug public désactivé (restauré). Utiliser un token Super Admin.
} else {
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
}

module.exports = router;