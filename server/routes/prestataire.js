const express = require('express');
const router = express.Router();
const prestataireInvitationService = require('../services/prestataireInvitationService');
const authMiddleware = require('../middleware/auth');
const { body, validationResult, param } = require('express-validator');

/**
 * Middleware de validation des erreurs
 */
const handleValidationErrors = (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({
            success: false,
            message: 'Données invalides',
            errors: errors.array()
        });
    }
    next();
};

/**
 * Middleware pour vérifier que l'utilisateur est un agent
 */
const requireAgentRole = (req, res, next) => {
    if (req.user.role !== 'agent' && req.user.role !== 'admin' && req.user.role !== 'super_admin') {
        return res.status(403).json({
            success: false,
            message: 'Accès refusé. Seuls les agents peuvent inviter des prestataires.'
        });
    }
    next();
};

/**
 * POST /api/prestataire/invite
 * Créer une nouvelle invitation de prestataire
 */
router.post('/invite', 
    authMiddleware,
    requireAgentRole,
    [
        body('email')
            .isEmail()
            .normalizeEmail()
            .withMessage('Email valide requis'),
        body('firstName')
            .optional()
            .trim()
            .isLength({ min: 1, max: 50 })
            .withMessage('Prénom doit contenir entre 1 et 50 caractères'),
        body('lastName')
            .optional()
            .trim()
            .isLength({ min: 1, max: 50 })
            .withMessage('Nom doit contenir entre 1 et 50 caractères'),
        body('speciality')
            .optional()
            .trim()
            .isLength({ max: 100 })
            .withMessage('Spécialité ne peut pas dépasser 100 caractères'),
        body('expirationDays')
            .optional()
            .isInt({ min: 1, max: 30 })
            .withMessage('Durée d\'expiration doit être entre 1 et 30 jours')
    ],
    handleValidationErrors,
    async (req, res) => {
        try {
            const { email, firstName, lastName, speciality, expirationDays } = req.body;
            const agentId = req.user.id;

            const prestataireInfo = {
                firstName: firstName || '',
                lastName: lastName || '',
                speciality: speciality || ''
            };

            const invitation = await prestataireInvitationService.createInvitation({
                email,
                agentId,
                prestataireInfo,
                expirationDays: expirationDays || 7
            });

            res.status(201).json({
                success: true,
                message: 'Invitation envoyée avec succès',
                data: {
                    id: invitation.id,
                    email: invitation.email,
                    expiresAt: invitation.expiresAt,
                    status: invitation.status
                }
            });

        } catch (error) {
            console.error('❌ Erreur création invitation:', error);
            res.status(400).json({
                success: false,
                message: error.message || 'Erreur lors de la création de l\'invitation'
            });
        }
    }
);

/**
 * GET /api/prestataire/invitations
 * Récupérer les invitations de l'agent connecté
 */
router.get('/invitations',
    authMiddleware,
    requireAgentRole,
    async (req, res) => {
        try {
            const agentId = req.user.id;
            const { status } = req.query;

            const invitations = await prestataireInvitationService.getAgentInvitations(agentId, status);

            res.json({
                success: true,
                data: invitations
            });

        } catch (error) {
            console.error('❌ Erreur récupération invitations:', error);
            res.status(500).json({
                success: false,
                message: 'Erreur lors de la récupération des invitations'
            });
        }
    }
);

/**
 * GET /api/prestataire/my-prestataires
 * Récupérer les prestataires de l'agent connecté
 */
router.get('/my-prestataires',
    authMiddleware,
    requireAgentRole,
    async (req, res) => {
        try {
            const agentId = req.user.id;
            const prestataires = await prestataireInvitationService.getAgentPrestataires(agentId);

            res.json({
                success: true,
                data: prestataires
            });

        } catch (error) {
            console.error('❌ Erreur récupération prestataires:', error);
            res.status(500).json({
                success: false,
                message: 'Erreur lors de la récupération des prestataires'
            });
        }
    }
);

/**
 * PUT /api/prestataire/invitations/:id/cancel
 * Annuler une invitation
 */
router.put('/invitations/:id/cancel',
    authMiddleware,
    requireAgentRole,
    [
        param('id').isInt().withMessage('ID d\'invitation invalide')
    ],
    handleValidationErrors,
    async (req, res) => {
        try {
            const invitationId = parseInt(req.params.id);
            const agentId = req.user.id;

            await prestataireInvitationService.cancelInvitation(invitationId, agentId);

            res.json({
                success: true,
                message: 'Invitation annulée avec succès'
            });

        } catch (error) {
            console.error('❌ Erreur annulation invitation:', error);
            res.status(400).json({
                success: false,
                message: error.message || 'Erreur lors de l\'annulation de l\'invitation'
            });
        }
    }
);

/**
 * GET /api/prestataire/verify-token/:token
 * Vérifier la validité d'un token d'invitation (route publique)
 */
router.get('/verify-token/:token',
    [
        param('token').notEmpty().withMessage('Token requis')
    ],
    handleValidationErrors,
    async (req, res) => {
        try {
            const { token } = req.params;
            const verification = await prestataireInvitationService.verifyInvitationToken(token);

            if (!verification.valid) {
                return res.status(400).json({
                    success: false,
                    message: verification.error
                });
            }

            res.json({
                success: true,
                data: verification.invitation
            });

        } catch (error) {
            console.error('❌ Erreur vérification token:', error);
            res.status(500).json({
                success: false,
                message: 'Erreur lors de la vérification du token'
            });
        }
    }
);

/**
 * POST /api/prestataire/accept-invitation
 * Accepter une invitation et créer le compte prestataire (route publique)
 */
router.post('/accept-invitation',
    [
        body('token').notEmpty().withMessage('Token requis'),
        body('firstName')
            .trim()
            .isLength({ min: 1, max: 50 })
            .withMessage('Prénom requis (1-50 caractères)'),
        body('lastName')
            .trim()
            .isLength({ min: 1, max: 50 })
            .withMessage('Nom requis (1-50 caractères)'),
        body('password')
            .isLength({ min: 8 })
            .withMessage('Mot de passe doit contenir au moins 8 caractères')
            .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/)
            .withMessage('Mot de passe doit contenir au moins une minuscule, une majuscule, un chiffre et un caractère spécial'),
        body('phone')
            .optional()
            .trim()
            .isMobilePhone('any')
            .withMessage('Numéro de téléphone invalide')
    ],
    handleValidationErrors,
    async (req, res) => {
        try {
            const { token, firstName, lastName, password, phone } = req.body;

            const result = await prestataireInvitationService.acceptInvitation(token, {
                firstName,
                lastName,
                password,
                phone
            });

            res.status(201).json({
                success: true,
                message: 'Compte prestataire créé avec succès',
                data: {
                    userId: result.userId,
                    email: result.email,
                    role: result.role
                }
            });

        } catch (error) {
            console.error('❌ Erreur acceptation invitation:', error);
            res.status(400).json({
                success: false,
                message: error.message || 'Erreur lors de la création du compte'
            });
        }
    }
);

/**
 * POST /api/prestataire/cleanup-expired
 * Nettoyer les invitations expirées (route admin)
 */
router.post('/cleanup-expired',
    authMiddleware,
    async (req, res) => {
        try {
            // Vérifier que l'utilisateur est admin
            if (req.user.role !== 'admin' && req.user.role !== 'super_admin') {
                return res.status(403).json({
                    success: false,
                    message: 'Accès refusé. Seuls les administrateurs peuvent effectuer cette action.'
                });
            }

            const cleanedCount = await prestataireInvitationService.cleanupExpiredInvitations();

            res.json({
                success: true,
                message: `${cleanedCount} invitations expirées nettoyées`,
                data: { cleanedCount }
            });

        } catch (error) {
            console.error('❌ Erreur nettoyage invitations:', error);
            res.status(500).json({
                success: false,
                message: 'Erreur lors du nettoyage des invitations expirées'
            });
        }
    }
);

/**
 * GET /api/prestataire/dashboard-data
 * Récupérer les données du dashboard prestataire
 */
router.get('/dashboard-data',
    authMiddleware,
    async (req, res) => {
        try {
            // Vérifier que l'utilisateur est un prestataire
            if (req.user.role !== 'prestataire') {
                return res.status(403).json({
                    success: false,
                    message: 'Accès refusé. Cette route est réservée aux prestataires.'
                });
            }

            const prestataireId = req.user.id;

            // Récupérer les tâches du prestataire
            const db = await require('../services/databaseService').getDatabase();
            
            const tasks = await db.all(
                `SELECT t.*, u.first_name as agent_first_name, u.last_name as agent_last_name,
                        c.first_name as client_first_name, c.last_name as client_last_name
                 FROM prestataire_tasks t
                 JOIN users u ON t.agent_id = u.id
                 LEFT JOIN users c ON t.client_id = c.id
                 WHERE t.prestataire_id = ?
                 ORDER BY t.created_at DESC`,
                [prestataireId]
            );

            // Récupérer les agents associés
            const agents = await db.all(
                `SELECT u.id, u.first_name, u.last_name, u.email, ap.relationship_type
                 FROM agent_prestataires ap
                 JOIN users u ON ap.agent_id = u.id
                 WHERE ap.prestataire_id = ? AND ap.status = 'active'
                 ORDER BY ap.created_at DESC`,
                [prestataireId]
            );

            // Statistiques
            const stats = {
                totalTasks: tasks.length,
                completedTasks: tasks.filter(t => t.status === 'completed').length,
                inProgressTasks: tasks.filter(t => t.status === 'in_progress').length,
                assignedTasks: tasks.filter(t => t.status === 'assigned').length,
                totalAgents: agents.length
            };

            res.json({
                success: true,
                data: {
                    stats,
                    tasks: tasks.map(t => ({
                        id: t.id,
                        title: t.title,
                        description: t.description,
                        status: t.status,
                        priority: t.priority,
                        dueDate: t.due_date,
                        createdAt: t.created_at,
                        completedAt: t.completed_at,
                        agent: {
                            name: `${t.agent_first_name} ${t.agent_last_name}`
                        },
                        client: t.client_first_name ? {
                            name: `${t.client_first_name} ${t.client_last_name}`
                        } : null,
                        taskData: JSON.parse(t.task_data || '{}')
                    })),
                    agents: agents.map(a => ({
                        id: a.id,
                        name: `${a.first_name} ${a.last_name}`,
                        email: a.email,
                        relationshipType: a.relationship_type
                    }))
                }
            });

        } catch (error) {
            console.error('❌ Erreur récupération données dashboard prestataire:', error);
            res.status(500).json({
                success: false,
                message: 'Erreur lors de la récupération des données du dashboard'
            });
        }
    }
);

module.exports = router;