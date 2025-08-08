const express = require('express');
const authService = require('../services/authService');
const databaseService = require('../services/databaseService');
const companyDataService = require('../services/companyDataService');
const router = express.Router();

/**
 * Routes de gestion des entreprises
 * Toutes les routes nécessitent une authentification
 */

// Middleware d'authentification pour toutes les routes
router.use(async (req, res, next) => {
  try {
    await authService.authenticateMiddleware(req, res, next);
  } catch (error) {
    console.error('❌ Erreur authentification:', error);
    res.status(401).json({ error: 'Token invalide' });
  }
});

/**
 * GET /api/companies
 * Récupérer les entreprises de l'utilisateur
 */
router.get('/', async (req, res) => {
  try {
    const { user } = req;
    
    const companies = await databaseService.getUserCompanies(user.id);

    res.json({
      success: true,
      companies
    });

  } catch (error) {
    console.error('❌ Erreur récupération entreprises:', error);
    res.status(500).json({ error: 'Erreur lors de la récupération des entreprises' });
  }
});

/**
 * POST /api/companies
 * Créer une nouvelle entreprise
 */
router.post('/', async (req, res) => {
  try {
    const { user } = req;
    const { name, industry, size, location, website, description } = req.body;

    // Validation des données
    if (!name || !industry) {
      return res.status(400).json({ 
        error: 'Nom et secteur d\'activité requis',
        fields: ['name', 'industry']
      });
    }

    const company = await databaseService.createCompany({
      name,
      industry,
      size,
      location,
      website,
      description
    }, user.id);

    res.status(201).json({
      success: true,
      message: 'Entreprise créée avec succès',
      company
    });

  } catch (error) {
    console.error('❌ Erreur création entreprise:', error);
    res.status(500).json({ error: 'Erreur lors de la création de l\'entreprise' });
  }
});

/**
 * GET /api/companies/:companyId
 * Récupérer les détails d'une entreprise
 */
router.get('/:companyId', async (req, res) => {
    try {
      const { companyId } = req.params;
      const { user } = req;

      const company = await databaseService.get(
        'SELECT * FROM companies WHERE id = ?',
        [companyId]
      );

      if (!company) {
        return res.status(404).json({ error: 'Entreprise non trouvée' });
      }

      // Vérifier que l'utilisateur a accès à cette entreprise
      const userCompany = await databaseService.get(
        'SELECT * FROM user_companies WHERE user_id = ? AND company_id = ?',
        [user.id, companyId]
      );

      if (!userCompany) {
        return res.status(403).json({ error: 'Accès refusé à cette entreprise' });
      }

      res.json({
        success: true,
        company: {
          ...company,
          userRole: userCompany.role,
          permissions: JSON.parse(userCompany.permissions || '{}')
        }
      });

    } catch (error) {
      console.error('❌ Erreur récupération entreprise:', error);
      res.status(500).json({ error: 'Erreur lors de la récupération de l\'entreprise' });
    }
  }
);

/**
 * PUT /api/companies/:companyId
 * Mettre à jour une entreprise
 */
router.put('/:companyId', async (req, res) => {
    try {
      // Vérifier les permissions admin
      const { user } = req;
      const { companyId } = req.params;
      
      const userCompany = await databaseService.get(
        'SELECT * FROM user_companies WHERE user_id = ? AND company_id = ? AND (role = "admin" OR role = "owner")',
        [user.id, companyId]
      );
      
      if (!userCompany) {
         return res.status(403).json({ error: 'Permissions insuffisantes' });
       }

       const { name, industry, size, location, website, description } = req.body;

      if (!name || !industry) {
        return res.status(400).json({ 
          error: 'Nom et secteur d\'activité requis' 
        });
      }

      await databaseService.run(
        `UPDATE companies 
         SET name = ?, industry = ?, size = ?, location = ?, website = ?, description = ?, updated_at = CURRENT_TIMESTAMP 
         WHERE id = ?`,
        [name, industry, size, location, website, description, companyId]
      );

      // Log d'audit
      await databaseService.logAudit(
        user.id,
        companyId,
        'COMPANY_UPDATED',
        'companies',
        { name, industry },
        req.ip
      );

      res.json({
        success: true,
        message: 'Entreprise mise à jour avec succès'
      });

    } catch (error) {
      console.error('❌ Erreur mise à jour entreprise:', error);
      res.status(500).json({ error: 'Erreur lors de la mise à jour de l\'entreprise' });
    }
  }
);

/**
 * POST /api/companies/:companyId/api-config
 * Sauvegarder une configuration API
 */
router.post('/:companyId/api-config', async (req, res) => {
    try {
      // Vérifier les permissions admin
      const { user } = req;
      const { companyId } = req.params;
      
      const userCompany = await databaseService.get(
        'SELECT * FROM user_companies WHERE user_id = ? AND company_id = ? AND (role = "admin" OR role = "owner")',
        [user.id, companyId]
      );
      
      if (!userCompany) {
         return res.status(403).json({ error: 'Permissions insuffisantes' });
       }

       const { serviceType, config } = req.body;

      if (!serviceType || !config) {
        return res.status(400).json({ 
          error: 'Type de service et configuration requis',
          fields: ['serviceType', 'config']
        });
      }

      // Valider le type de service
      const validServices = ['google_analytics', 'facebook', 'email_marketing', 'sales'];
      if (!validServices.includes(serviceType)) {
        return res.status(400).json({ 
          error: 'Type de service invalide',
          validServices
        });
      }

      await databaseService.saveApiConfiguration(
        companyId,
        serviceType,
        config,
        user.id
      );

      res.json({
        success: true,
        message: `Configuration ${serviceType} sauvegardée avec succès`
      });

    } catch (error) {
      console.error('❌ Erreur sauvegarde configuration:', error);
      res.status(500).json({ error: 'Erreur lors de la sauvegarde de la configuration' });
    }
  }
);

/**
 * GET /api/companies/:companyId/api-config/:serviceType
 * Récupérer une configuration API
 */
router.get('/:companyId/api-config/:serviceType', async (req, res) => {
    try {
      const { companyId, serviceType } = req.params;

      const config = await databaseService.getApiConfiguration(companyId, serviceType);

      if (!config) {
        return res.status(404).json({ 
          error: 'Configuration non trouvée',
          serviceType
        });
      }

      // Masquer les données sensibles pour la réponse
      const safeConfig = { ...config };
      if (safeConfig.config_data) {
        // Masquer les clés API et tokens
        Object.keys(safeConfig.config_data).forEach(key => {
          if (key.toLowerCase().includes('key') || 
              key.toLowerCase().includes('token') || 
              key.toLowerCase().includes('secret')) {
            safeConfig.config_data[key] = '***masked***';
          }
        });
      }

      res.json({
        success: true,
        config: safeConfig
      });

    } catch (error) {
      console.error('❌ Erreur récupération configuration:', error);
      res.status(500).json({ error: 'Erreur lors de la récupération de la configuration' });
    }
  }
);

/**
 * GET /api/companies/:companyId/data
 * Récupérer les données de l'entreprise (analytics, social, etc.)
 */
router.get('/:companyId/data', async (req, res) => {
    try {
      const { companyId } = req.params;
      const { user } = req;

      // Récupérer les données de l'entreprise via le service
      const companyData = await companyDataService.getCompanyData(companyId);

      // Log d'audit
      await databaseService.logAudit(
        user.id,
        companyId,
        'COMPANY_DATA_ACCESSED',
        'companies',
        { dataTypes: Object.keys(companyData) },
        req.ip
      );

      res.json({
        success: true,
        data: companyData
      });

    } catch (error) {
      console.error('❌ Erreur récupération données entreprise:', error);
      res.status(500).json({ error: 'Erreur lors de la récupération des données' });
    }
  }
);

/**
 * POST /api/companies/:companyId/test-api
 * Tester une configuration API
 */
router.post('/:companyId/test-api', async (req, res) => {
    try {
      // Vérifier les permissions admin
      const { user } = req;
      const { companyId } = req.params;
      
      const userCompany = await databaseService.get(
        'SELECT * FROM user_companies WHERE user_id = ? AND company_id = ? AND (role = "admin" OR role = "owner")',
        [user.id, companyId]
      );
      
      if (!userCompany) {
         return res.status(403).json({ error: 'Permissions insuffisantes' });
       }

       const { serviceType } = req.body;

      if (!serviceType) {
        return res.status(400).json({ error: 'Type de service requis' });
      }

      let testResult;
      
      switch (serviceType) {
        case 'google_analytics':
          try {
            const analyticsData = await companyDataService.getGoogleAnalyticsData(companyId);
            testResult = {
              success: true,
              message: 'Connexion Google Analytics réussie',
              sampleData: {
                sessions: analyticsData.sessions || 0,
                users: analyticsData.users || 0
              }
            };
          } catch (error) {
            testResult = {
              success: false,
              message: 'Erreur connexion Google Analytics',
              error: error.message
            };
          }
          break;

        case 'facebook':
          try {
            const facebookData = await companyDataService.getFacebookData(companyId);
            testResult = {
              success: true,
              message: 'Connexion Facebook réussie',
              sampleData: {
                followers: facebookData.followers || 0,
                engagement: facebookData.engagement || 0
              }
            };
          } catch (error) {
            testResult = {
              success: false,
              message: 'Erreur connexion Facebook',
              error: error.message
            };
          }
          break;

        default:
          return res.status(400).json({ error: 'Type de service non supporté pour les tests' });
      }

      res.json({
        success: true,
        testResult
      });

    } catch (error) {
      console.error('❌ Erreur test API:', error);
      res.status(500).json({ error: 'Erreur lors du test de l\'API' });
    }
  }
);

/**
 * GET /api/companies/:companyId/users
 * Récupérer les utilisateurs de l'entreprise
 */
router.get('/:companyId/users', async (req, res) => {
    try {
      // Vérifier les permissions admin
      const { user } = req;
      const { companyId } = req.params;
      
      const userCompany = await databaseService.db.get(
        'SELECT * FROM user_companies WHERE user_id = ? AND company_id = ? AND (role = "admin" OR role = "owner")',
        [user.id, companyId]
      );
      
      if (!userCompany) {
         return res.status(403).json({ error: 'Permissions insuffisantes' });
       }

      const users = await databaseService.all(
        `SELECT u.id, u.email, u.first_name, u.last_name, uc.role, uc.permissions, uc.created_at
         FROM users u
         JOIN user_companies uc ON u.id = uc.user_id
         WHERE uc.company_id = ? AND u.is_active = 1
         ORDER BY u.first_name, u.last_name`,
        [companyId]
      );

      res.json({
        success: true,
        users: users.map(user => ({
          ...user,
          permissions: JSON.parse(user.permissions || '{}')
        }))
      });

    } catch (error) {
      console.error('❌ Erreur récupération utilisateurs:', error);
      res.status(500).json({ error: 'Erreur lors de la récupération des utilisateurs' });
    }
  }
);

/**
 * DELETE /api/companies/:companyId
 * Supprimer une entreprise (propriétaire uniquement)
 */
router.delete('/:companyId',
  async (req, res) => {
    try {
      const { companyId } = req.params;
      const { user } = req;

      // Vérifier que l'utilisateur est propriétaire
      const userCompany = await databaseService.get(
        'SELECT * FROM user_companies WHERE user_id = ? AND company_id = ? AND role = "owner"',
        [user.id, companyId]
      );

      if (!userCompany) {
        return res.status(403).json({ 
          error: 'Seul le propriétaire peut supprimer l\'entreprise' 
        });
      }

      // Supprimer l'entreprise (cascade supprimera les relations)
      await databaseService.run(
        'DELETE FROM companies WHERE id = ?',
        [companyId]
      );

      // Log d'audit
      await databaseService.logAudit(
        user.id,
        companyId,
        'COMPANY_DELETED',
        'companies',
        {},
        req.ip
      );

      res.json({
        success: true,
        message: 'Entreprise supprimée avec succès'
      });

    } catch (error) {
      console.error('❌ Erreur suppression entreprise:', error);
      res.status(500).json({ error: 'Erreur lors de la suppression de l\'entreprise' });
    }
  }
);

module.exports = router;