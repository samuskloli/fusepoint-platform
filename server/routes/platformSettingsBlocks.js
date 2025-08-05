const express = require('express');
const router = express.Router();
const platformSettingsService = require('../services/platformSettingsService');
const systemLogsService = require('../services/systemLogsService');
const authMiddleware = require('../middleware/auth');
const superAdminAuth = require('../middleware/superAdminAuth');

// Configuration des blocs de paramètres
const SETTINGS_BLOCKS_CONFIG = {
  general: {
    title: 'Paramètres Généraux',
    description: 'Configuration de base de la plateforme',
    defaultSettings: [
      {
        key: 'frontend_url',
        value: 'https://fusepoint.ch',
        type: 'url',
        description: 'URL principale de la plateforme en production',
        required: true
      },
      {
        key: 'platform_name',
        value: 'Fusepoint Hub',
        type: 'string',
        description: 'Nom affiché dans l\'interface',
        required: true
      },
      {
        key: 'maintenance_mode',
        value: 'false',
        type: 'boolean',
        description: 'Activer le mode maintenance pour la plateforme',
        required: false
      }
    ]
  },
  email: {
    title: 'Configuration Email',
    description: 'Paramètres SMTP et notifications email',
    defaultSettings: [
      {
        key: 'smtp_enabled',
        value: 'true',
        type: 'boolean',
        description: 'Activer l\'envoi d\'emails via SMTP',
        required: false
      },
      {
        key: 'email_notifications',
        value: 'true',
        type: 'boolean',
        description: 'Envoyer des notifications par email',
        required: false
      },
      {
        key: 'email_from_name',
        value: 'Fusepoint Hub',
        type: 'string',
        description: 'Nom affiché comme expéditeur des emails',
        required: false
      }
    ]
  },
  security: {
    title: 'Sécurité',
    description: 'Paramètres de sécurité et authentification',
    defaultSettings: [
      {
        key: 'two_factor_enabled',
        value: 'false',
        type: 'boolean',
        description: 'Activer l\'authentification à deux facteurs',
        required: false
      },
      {
        key: 'session_timeout',
        value: '60',
        type: 'number',
        description: 'Durée avant expiration automatique des sessions (minutes)',
        required: false
      },
      {
        key: 'password_min_length',
        value: '8',
        type: 'number',
        description: 'Nombre minimum de caractères pour les mots de passe',
        required: false
      }
    ]
  },
  api: {
    title: 'Configuration API',
    description: 'Paramètres des APIs externes et intégrations',
    defaultSettings: [
      {
        key: 'api_rate_limit',
        value: '1000',
        type: 'number',
        description: 'Nombre maximum de requêtes par minute',
        required: false
      },
      {
        key: 'openai_enabled',
        value: 'true',
        type: 'boolean',
        description: 'Activer l\'intégration OpenAI',
        required: false
      },
      {
        key: 'facebook_api_enabled',
        value: 'true',
        type: 'boolean',
        description: 'Activer l\'intégration Facebook/Meta',
        required: false
      }
    ]
  },
  ui: {
    title: 'Interface Utilisateur',
    description: 'Personnalisation de l\'interface',
    defaultSettings: [
      {
        key: 'theme_mode',
        value: 'light',
        type: 'string',
        description: 'Thème par défaut de l\'interface',
        required: false
      },
      {
        key: 'show_welcome_tour',
        value: 'true',
        type: 'boolean',
        description: 'Afficher le tour guidé pour les nouveaux utilisateurs',
        required: false
      },
      {
        key: 'items_per_page',
        value: '25',
        type: 'string',
        description: 'Nombre d\'éléments affichés par page dans les listes',
        required: false
      }
    ]
  }
};

/**
 * GET /api/super-admin/settings-blocks
 * Récupérer tous les paramètres organisés par blocs
 */
router.get('/settings-blocks', authMiddleware, superAdminAuth.requireSuperAdmin(), async (req, res) => {
  try {
    const allSettings = await platformSettingsService.getAllSettings();
    
    // Organiser les paramètres par blocs
    const blocks = {};
    
    Object.keys(SETTINGS_BLOCKS_CONFIG).forEach(blockKey => {
      blocks[blockKey] = {
        ...SETTINGS_BLOCKS_CONFIG[blockKey],
        settings: allSettings.filter(setting => setting.category === blockKey)
      };
    });
    
    res.json({
      success: true,
      blocks: blocks,
      totalSettings: allSettings.length
    });
  } catch (error) {
    console.error('Erreur lors de la récupération des blocs de paramètres:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération des paramètres',
      error: error.message
    });
  }
});

/**
 * GET /api/super-admin/settings-blocks/:blockKey
 * Récupérer les paramètres d'un bloc spécifique
 */
router.get('/settings-blocks/:blockKey', authMiddleware, superAdminAuth.requireSuperAdmin(), async (req, res) => {
  try {
    const { blockKey } = req.params;
    
    if (!SETTINGS_BLOCKS_CONFIG[blockKey]) {
      return res.status(404).json({
        success: false,
        message: `Bloc de paramètres '${blockKey}' non trouvé`
      });
    }
    
    const blockSettings = await platformSettingsService.getSettingsByCategory(blockKey);
    
    res.json({
      success: true,
      block: {
        ...SETTINGS_BLOCKS_CONFIG[blockKey],
        settings: blockSettings
      }
    });
  } catch (error) {
    console.error(`Erreur lors de la récupération du bloc ${req.params.blockKey}:`, error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération du bloc',
      error: error.message
    });
  }
});

/**
 * POST /api/super-admin/settings-blocks/:blockKey/reset
 * Réinitialiser un bloc aux valeurs par défaut
 */
router.post('/settings-blocks/:blockKey/reset', authMiddleware, superAdminAuth.requireSuperAdmin(), async (req, res) => {
  try {
    const { blockKey } = req.params;
    
    if (!SETTINGS_BLOCKS_CONFIG[blockKey]) {
      return res.status(404).json({
        success: false,
        message: `Bloc de paramètres '${blockKey}' non trouvé`
      });
    }
    
    const blockConfig = SETTINGS_BLOCKS_CONFIG[blockKey];
    const resetPromises = [];
    
    // Réinitialiser chaque paramètre du bloc
    for (const defaultSetting of blockConfig.defaultSettings) {
      resetPromises.push(
        platformSettingsService.createSettingIfNotExists(
          defaultSetting.key,
          defaultSetting.value,
          defaultSetting.type,
          blockKey,
          defaultSetting.description
        )
      );
    }
    
    await Promise.all(resetPromises);
    
    res.json({
      success: true,
      message: `Bloc '${blockConfig.title}' réinitialisé aux valeurs par défaut`,
      resetCount: blockConfig.defaultSettings.length
    });
  } catch (error) {
    console.error(`Erreur lors de la réinitialisation du bloc ${req.params.blockKey}:`, error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la réinitialisation',
      error: error.message
    });
  }
});

/**
 * PUT /api/super-admin/settings-blocks/:blockKey/batch
 * Sauvegarder plusieurs paramètres d'un bloc en une fois
 */
router.put('/settings-blocks/:blockKey/batch', authMiddleware, superAdminAuth.requireSuperAdmin(), async (req, res) => {
  try {
    const { blockKey } = req.params;
    const { settings } = req.body;
    
    if (!SETTINGS_BLOCKS_CONFIG[blockKey]) {
      return res.status(404).json({
        success: false,
        message: `Bloc de paramètres '${blockKey}' non trouvé`
      });
    }
    
    if (!Array.isArray(settings)) {
      return res.status(400).json({
        success: false,
        message: 'Le paramètre \'settings\' doit être un tableau'
      });
    }
    
    const updatePromises = [];
    const results = {
      success: 0,
      failed: 0,
      errors: []
    };
    
    // Valider et mettre à jour chaque paramètre
    for (const setting of settings) {
      try {
        if (!setting.key || setting.value === undefined) {
          results.failed++;
          results.errors.push({
            key: setting.key || 'unknown',
            error: 'Clé ou valeur manquante'
          });
          continue;
        }
        
        await platformSettingsService.updateOrCreateSetting(
          setting.key,
          setting.value,
          setting.type || 'string',
          blockKey,
          setting.description || ''
        );
        
        results.success++;
      } catch (error) {
        results.failed++;
        results.errors.push({
          key: setting.key,
          error: error.message
        });
      }
    }
    
    res.json({
      success: results.failed === 0,
      message: `${results.success} paramètres mis à jour, ${results.failed} échecs`,
      results: results
    });
  } catch (error) {
    console.error(`Erreur lors de la sauvegarde en lot du bloc ${req.params.blockKey}:`, error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la sauvegarde en lot',
      error: error.message
    });
  }
});

/**
 * GET /api/super-admin/settings-blocks/:blockKey/export
 * Exporter les paramètres d'un bloc
 */
router.get('/settings-blocks/:blockKey/export', authMiddleware, superAdminAuth.requireSuperAdmin(), async (req, res) => {
  try {
    const { blockKey } = req.params;
    
    if (!SETTINGS_BLOCKS_CONFIG[blockKey]) {
      return res.status(404).json({
        success: false,
        message: `Bloc de paramètres '${blockKey}' non trouvé`
      });
    }
    
    const blockSettings = await platformSettingsService.getSettingsByCategory(blockKey);
    
    const exportData = {
      block: blockKey,
      title: SETTINGS_BLOCKS_CONFIG[blockKey].title,
      exportDate: new Date().toISOString(),
      version: '1.0',
      settings: blockSettings.map(setting => ({
        key: setting.key,
        value: setting.value,
        type: setting.type,
        description: setting.description
      }))
    };
    
    // Définir les en-têtes pour le téléchargement
    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Content-Disposition', `attachment; filename="${blockKey}-settings-${new Date().toISOString().split('T')[0]}.json"`);
    
    res.json(exportData);
  } catch (error) {
    console.error(`Erreur lors de l'export du bloc ${req.params.blockKey}:`, error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de l\'export',
      error: error.message
    });
  }
});

/**
 * POST /api/super-admin/settings-blocks/:blockKey/import
 * Importer les paramètres d'un bloc
 */
router.post('/settings-blocks/:blockKey/import', authMiddleware, superAdminAuth.requireSuperAdmin(), async (req, res) => {
  try {
    const { blockKey } = req.params;
    const importData = req.body;
    
    if (!SETTINGS_BLOCKS_CONFIG[blockKey]) {
      return res.status(404).json({
        success: false,
        message: `Bloc de paramètres '${blockKey}' non trouvé`
      });
    }
    
    if (!importData.settings || !Array.isArray(importData.settings)) {
      return res.status(400).json({
        success: false,
        message: 'Données d\'import invalides'
      });
    }
    
    const importPromises = [];
    const results = {
      imported: 0,
      failed: 0,
      errors: []
    };
    
    // Importer chaque paramètre
    for (const setting of importData.settings) {
      try {
        if (!setting.key || setting.value === undefined) {
          results.failed++;
          results.errors.push({
            key: setting.key || 'unknown',
            error: 'Clé ou valeur manquante'
          });
          continue;
        }
        
        await platformSettingsService.updateOrCreateSetting(
          setting.key,
          setting.value,
          setting.type || 'string',
          blockKey,
          setting.description || ''
        );
        
        results.imported++;
      } catch (error) {
        results.failed++;
        results.errors.push({
          key: setting.key,
          error: error.message
        });
      }
    }
    
    res.json({
      success: results.failed === 0,
      message: `${results.imported} paramètres importés, ${results.failed} échecs`,
      results: results
    });
  } catch (error) {
    console.error(`Erreur lors de l'import du bloc ${req.params.blockKey}:`, error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de l\'import',
      error: error.message
    });
  }
});

/**
 * POST /api/super-admin/settings-blocks/initialize
 * Initialiser tous les blocs avec leurs valeurs par défaut
 */
router.post('/settings-blocks/initialize', authMiddleware, superAdminAuth.requireSuperAdmin(), async (req, res) => {
  try {
    const initPromises = [];
    let totalInitialized = 0;
    
    // Initialiser chaque bloc
    for (const [blockKey, blockConfig] of Object.entries(SETTINGS_BLOCKS_CONFIG)) {
      for (const defaultSetting of blockConfig.defaultSettings) {
        initPromises.push(
          platformSettingsService.createSettingIfNotExists(
            defaultSetting.key,
            defaultSetting.value,
            defaultSetting.type,
            blockKey,
            defaultSetting.description
          )
        );
        totalInitialized++;
      }
    }
    
    await Promise.all(initPromises);
    
    res.json({
      success: true,
      message: 'Tous les blocs de paramètres ont été initialisés',
      totalSettings: totalInitialized,
      blocks: Object.keys(SETTINGS_BLOCKS_CONFIG)
    });
  } catch (error) {
    console.error('Erreur lors de l\'initialisation des blocs:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de l\'initialisation',
      error: error.message
    });
  }
});

/**
 * GET /api/super-admin/settings-blocks/config
 * Récupérer la configuration des blocs (sans les valeurs)
 */
router.get('/settings-blocks/config', authMiddleware, superAdminAuth.requireSuperAdmin(), async (req, res) => {
  try {
    res.json({
      success: true,
      config: SETTINGS_BLOCKS_CONFIG
    });
  } catch (error) {
    console.error('Erreur lors de la récupération de la configuration:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération de la configuration',
      error: error.message
    });
  }
});

module.exports = router;