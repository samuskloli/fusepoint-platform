const express = require('express');
const router = express.Router();
const AccompagnementService = require('../services/accompagnementService');
const EmailService = require('../services/emailService');
const authMiddleware = require('../middleware/auth');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { requireRole } = require('../middleware/roleAuth');
const databaseService = require('../services/databaseService');

// Configuration multer pour l'upload de fichiers
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const uploadDir = path.join(__dirname, '../uploads/accompagnement');
        if (!fs.existsSync(uploadDir)) {
            fs.mkdirSync(uploadDir, { recursive: true });
        }
        cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
    }
});

const upload = multer({ 
    storage: storage,
    limits: {
        fileSize: 10 * 1024 * 1024 // 10MB max
    },
    fileFilter: (req, file, cb) => {
        // Autoriser tous les types de fichiers pour le moment
        cb(null, true);
    }
});

const accompagnementService = new AccompagnementService();

// ==================== ROUTES NOTIFICATIONS ====================

// POST /api/notifications - Créer une nouvelle notification
router.post('/notifications', authMiddleware, async (req, res) => {
    try {
        const {
            userId,
            type,
            title,
            message,
            actionUrl
        } = req.body;

        if (!userId || !type || !title || !message) {
            return res.status(400).json({
                success: false,
                message: 'userId, type, title et message sont requis'
            });
        }

        // Vérifier que l'utilisateur a le droit d'envoyer des notifications
        if (req.user.role !== 'agent' && req.user.role !== 'admin') {
            return res.status(403).json({
                success: false,
                message: 'Accès non autorisé'
            });
        }

        const notificationData = {
            user_id: userId,
            company_id: req.user.company_id,
            type,
            title,
            message,
            action_url: actionUrl
        };

        const notificationId = await accompagnementService.createNotification(notificationData);
        
        res.json({
            success: true,
            data: {
                id: notificationId,
                message: 'Notification envoyée avec succès'
            }
        });
    } catch (error) {
        console.error('Erreur création notification:', error);
        res.status(500).json({
            success: false,
            message: 'Erreur lors de l\'envoi de la notification'
        });
    }
});

// GET /api/notifications - Récupérer les notifications d'un utilisateur
router.get('/notifications', authMiddleware, async (req, res) => {
    try {
        const { unreadOnly = false, limit = 20, offset = 0, company_id } = req.query;
        
        let effectiveCompanyId = req.user.company_id;
        if (req.user.role === 'super_admin') {
            effectiveCompanyId = company_id ? parseInt(company_id) : null;
        }
        
        const notifications = await accompagnementService.getNotifications(
            req.user.id,
            effectiveCompanyId,
            unreadOnly === 'true',
            parseInt(limit)
        );
        
        res.json({
            success: true,
            data: notifications
        });
    } catch (error) {
        console.error('Erreur récupération notifications:', error);
        res.status(500).json({
            success: false,
            message: 'Erreur lors de la récupération des notifications'
        });
    }
});

// PUT /api/notifications/:id/read - Marquer une notification comme lue
router.put('/notifications/:id/read', authMiddleware, async (req, res) => {
    try {
        await accompagnementService.markNotificationAsRead(req.params.id, req.user.id);
        
        res.json({
            success: true,
            message: 'Notification marquée comme lue'
        });
    } catch (error) {
        console.error('Erreur marquage notification:', error);
        res.status(500).json({
            success: false,
            message: 'Erreur lors du marquage de la notification'
        });
    }
});

// Nouvelle route: PUT /api/accompagnement/notifications/mark-all-read - Marquer toutes les notifications comme lues
router.put('/notifications/mark-all-read', authMiddleware, async (req, res) => {
    try {
        const result = await accompagnementService.markAllNotificationsAsRead(req.user.id);
        res.json({ success: true, changes: result.changes });
    } catch (error) {
        console.error('Erreur marquage toutes notifications:', error);
        res.status(500).json({ success: false, message: 'Erreur lors du marquage des notifications' });
    }
});

// ==================== ROUTES PRESTATIONS ====================

// GET /api/accompagnement/services - Récupérer les prestations disponibles
router.get('/services', authMiddleware, async (req, res) => {
    try {
        const activeOnly = req.query.activeOnly !== 'false'
        const services = await accompagnementService.getAgencyServices(activeOnly)
        
        // Si aucun service en base, retourner des services par défaut
        if (!services || services.length === 0) {
            const defaultServices = [
                {
                    id: 1,
                    name: 'Audit Analytics Complet',
                    category: 'Analytics',
                    description: 'Analyse approfondie de vos données Google Analytics avec recommandations personnalisées.',
                    base_price: 150,
                    price_type: 'fixed',
                    duration_hours: 2,
                    icon: 'chart-bar',
                    color: 'blue',
                    is_active: 1,
                    is_available: 1,
                    deliverables: ['Rapport d\'audit complet', 'Recommandations personnalisées'],
                    requirements: ['Accès Google Analytics']
                },
                {
                    id: 2,
                    name: 'Stratégie Marketing Digital',
                    category: 'Marketing',
                    description: 'Élaboration d\'une stratégie marketing digital sur mesure pour votre entreprise.',
                    base_price: 300,
                    price_type: 'fixed',
                    duration_hours: 4,
                    icon: 'megaphone',
                    color: 'green',
                    is_active: 1,
                    is_available: 1,
                    deliverables: ['Plan marketing 3 mois', 'Calendrier éditorial'],
                    requirements: ['Accès aux réseaux sociaux']
                }
            ]
            return res.json({ success: true, data: defaultServices })
        }

        res.json({ success: true, data: services })
    } catch (error) {
        console.error('Erreur récupération prestations:', error)
        res.status(500).json({ success: false, message: 'Erreur lors de la récupération des prestations' })
    }
});

// ==================== ROUTES DEMANDES ====================

// POST /api/accompagnement/requests - Créer une nouvelle demande
router.post('/requests', authMiddleware, async (req, res) => {
    try {
        const {
            service_id,
            title,
            description,
            brief_data,
            budget_range,
            deadline
        } = req.body;

        if (!service_id || !title) {
            return res.status(400).json({
                success: false,
                message: 'Service ID et titre sont requis'
            });
        }

        const requestData = {
            company_id: req.user.company_id,
            user_id: req.user.id,
            service_id,
            title,
            description,
            brief_data,
            budget_range,
            deadline
        };

        const requestId = await accompagnementService.createServiceRequest(requestData);
        
        // Créer automatiquement une conversation pour cette demande
        const conversationId = await accompagnementService.createConversation(
            req.user.company_id,
            requestId,
            'service',
            `Discussion - ${title}`
        );

        // Notifier l'agent assigné (si existant) et envoyer un email
        try {
            // Récupérer l'agent assigné au client courant
            const agent = await databaseService.get(
                `SELECT a.id, a.email, a.first_name, a.last_name
                 FROM users c
                 LEFT JOIN users a ON a.id = c.agent_id
                 WHERE c.id = ?`,
                [req.user.id]
            );

            if (agent && agent.id) {
                // Notification plateforme pour l'agent
                await accompagnementService.createNotification({
                    user_id: agent.id,
                    company_id: req.user.company_id,
                    type: 'new_service_request',
                    title: 'Nouvelle demande de prestation',
                    message: `${req.user.first_name} ${req.user.last_name} a demandé: ${title}`,
                    data: { request_id: requestId, service_id, client_id: req.user.id },
                    action_url: '/agent/service-requests'
                });

                // Email de notification à l'agent
                const emailService = new EmailService();
                try {
                    await emailService.sendNotification(
                        agent.email,
                        `${agent.first_name} ${agent.last_name}`,
                        'new_service_request',
                        'Nouvelle demande de prestation',
                        `${req.user.first_name} ${req.user.last_name} a créé une nouvelle demande: "${title}"`,
                        '/agent/service-requests'
                    );
                } catch (emailErr) {
                    console.warn('Erreur envoi email à l\'agent pour nouvelle demande:', emailErr?.message || emailErr);
                }
            }
        } catch (notifyErr) {
            console.warn('Notification agent échouée (non bloquant):', notifyErr?.message || notifyErr);
        }

        // Email de confirmation au client (optionnel, non bloquant)
        try {
            const emailService = new EmailService();
            await emailService.sendNotification(
                req.user.email,
                `${req.user.first_name} ${req.user.last_name}`,
                'request_confirmation',
                'Votre demande a bien été créée',
                `Votre demande "${title}" a bien été enregistrée. Notre équipe vous recontactera rapidement.`,
                '/dashboard'
            );
        } catch (emailClientErr) {
            console.warn('Email de confirmation client échoué (non bloquant):', emailClientErr?.message || emailClientErr);
        }

        res.status(201).json({
            success: true,
            data: {
                request_id: Number(requestId),
                conversation_id: Number(conversationId)
            },
            message: 'Demande créée avec succès'
        });
    } catch (error) {
        console.error('Erreur création demande:', error);
        res.status(500).json({
            success: false,
            message: 'Erreur lors de la création de la demande'
        });
    }
});

// GET /api/accompagnement/requests - Récupérer les demandes de l'entreprise
router.get('/requests', authMiddleware, async (req, res) => {
    try {
        const { status } = req.query;
        const requests = await accompagnementService.getServiceRequests(req.user.company_id, status);
        
        res.json({
            success: true,
            data: requests
        });
    } catch (error) {
        console.error('Erreur récupération demandes:', error);
        res.status(500).json({
            success: false,
            message: 'Erreur lors de la récupération des demandes'
        });
    }
});

// PUT /api/accompagnement/requests/:id/status - Mettre à jour le statut d'une demande
router.put('/requests/:id/status', authMiddleware, async (req, res) => {
    try {
        const { status, comment } = req.body;
        
        if (!status) {
            return res.status(400).json({
                success: false,
                message: 'Statut requis'
            });
        }

        await accompagnementService.updateRequestStatus(
            req.params.id,
            status,
            req.user.id,
            comment
        );

        res.json({
            success: true,
            message: 'Statut mis à jour avec succès'
        });
    } catch (error) {
        console.error('Erreur mise à jour statut:', error);
        res.status(500).json({
            success: false,
            message: 'Erreur lors de la mise à jour du statut'
        });
    }
});

// GET /api/accompagnement/requests/:id/history - Récupérer l'historique d'une demande
router.get('/requests/:id/history', authMiddleware, async (req, res) => {
    try {
        const history = await accompagnementService.getRequestHistory(req.params.id);
        res.json({
            success: true,
            data: history
        });
    } catch (error) {
        console.error('Erreur récupération historique:', error);
        res.status(500).json({
            success: false,
            message: 'Erreur lors de la récupération de l\'historique'
        });
    }
});

// ==================== ROUTES CONVERSATIONS ====================

// GET /api/accompagnement/conversations - Récupérer les conversations
router.get('/conversations', authMiddleware, async (req, res) => {
    try {
        const { request_id } = req.query;
        const conversations = await accompagnementService.getConversations(
            req.user.company_id,
            request_id || null
        );
        
        res.json({
            success: true,
            data: conversations
        });
    } catch (error) {
        console.error('Erreur récupération conversations:', error);
        res.status(500).json({
            success: false,
            message: 'Erreur lors de la récupération des conversations'
        });
    }
});

// POST /api/accompagnement/conversations - Créer une nouvelle conversation
router.post('/conversations', authMiddleware, async (req, res) => {
    try {
        const { request_id, type, title } = req.body;
        
        const conversationId = await accompagnementService.createConversation(
            req.user.company_id,
            request_id || null,
            type || 'general',
            title
        );

        res.status(201).json({
            success: true,
            data: { conversation_id: conversationId },
            message: 'Conversation créée avec succès'
        });
    } catch (error) {
        console.error('Erreur création conversation:', error);
        res.status(500).json({
            success: false,
            message: 'Erreur lors de la création de la conversation'
        });
    }
});

// GET /api/accompagnement/conversations/:id/messages - Récupérer les messages d'une conversation
router.get('/conversations/:id/messages', authMiddleware, async (req, res) => {
    try {
        const { limit = 50, offset = 0 } = req.query;
        const messages = await accompagnementService.getMessages(
            req.params.id,
            parseInt(limit),
            parseInt(offset)
        );
        
        res.json({
            success: true,
            data: messages
        });
    } catch (error) {
        console.error('Erreur récupération messages:', error);
        res.status(500).json({
            success: false,
            message: 'Erreur lors de la récupération des messages'
        });
    }
});

// POST /api/accompagnement/conversations/:id/messages - Envoyer un message
router.post('/conversations/:id/messages', authMiddleware, upload.single('file'), async (req, res) => {
    try {
        const { content, message_type = 'text' } = req.body;
        
        if (!content && !req.file) {
            return res.status(400).json({
                success: false,
                message: 'Contenu ou fichier requis'
            });
        }

        let fileData = null;
        if (req.file) {
            fileData = {
                url: `/uploads/accompagnement/${req.file.filename}`,
                name: req.file.originalname,
                size: req.file.size
            };
        }

        const messageId = await accompagnementService.sendMessage(
            req.params.id,
            req.user.id,
            'client',
            content || `Fichier envoyé: ${req.file?.originalname}`,
            req.file ? 'file' : message_type,
            fileData
        );

        res.status(201).json({
            success: true,
            data: { message_id: messageId },
            message: 'Message envoyé avec succès'
        });
    } catch (error) {
        console.error('Erreur envoi message:', error);
        res.status(500).json({
            success: false,
            message: 'Erreur lors de l\'envoi du message'
        });
    }
});

// PUT /api/accompagnement/conversations/:id/read - Marquer les messages comme lus
router.put('/conversations/:id/read', authMiddleware, async (req, res) => {
    try {
        await accompagnementService.markMessagesAsRead(req.params.id, req.user.id);
        
        res.json({
            success: true,
            message: 'Messages marqués comme lus'
        });
    } catch (error) {
        console.error('Erreur marquage messages lus:', error);
        res.status(500).json({
            success: false,
            message: 'Erreur lors du marquage des messages'
        });
    }
});

// ==================== ROUTES RECOMMANDATIONS ====================

// GET /api/accompagnement/recommendations - Récupérer les recommandations
router.get('/recommendations', authMiddleware, async (req, res) => {
    try {
        const { status, limit } = req.query;
        const recommendations = await accompagnementService.getRecommendations(
            req.user.company_id,
            status || null,
            limit ? parseInt(limit) : null
        );
        
        res.json({
            success: true,
            data: recommendations
        });
    } catch (error) {
        console.error('Erreur récupération recommandations:', error);
        res.status(500).json({
            success: false,
            message: 'Erreur lors de la récupération des recommandations'
        });
    }
});

// PUT /api/accompagnement/recommendations/:id/response - Répondre à une recommandation
router.put('/recommendations/:id/response', authMiddleware, async (req, res) => {
    try {
        const { response, scheduled_date } = req.body;
        
        if (!response || !['accept', 'schedule', 'decline'].includes(response)) {
            return res.status(400).json({
                success: false,
                message: 'Réponse invalide (accept, schedule, decline)'
            });
        }

        let status = 'pending';
        if (response === 'accept') status = 'accepted';
        else if (response === 'schedule') status = 'scheduled';
        else if (response === 'decline') status = 'declined';

        await accompagnementService.updateRecommendationStatus(
            req.params.id,
            status,
            response,
            scheduled_date || null
        );

        // Créer une notification pour l'équipe Fusepoint
        await accompagnementService.createNotification({
            user_id: req.user.id,
            company_id: req.user.company_id,
            type: 'recommendation_response',
            title: 'Réponse à une recommandation',
            message: `${req.user.first_name} ${req.user.last_name} a ${response === 'accept' ? 'accepté' : response === 'schedule' ? 'planifié' : 'refusé'} une recommandation`,
            data: { recommendation_id: req.params.id, response },
            action_url: `/accompagnement/recommendations/${req.params.id}`
        });

        res.json({
            success: true,
            message: 'Réponse enregistrée avec succès'
        });
    } catch (error) {
        console.error('Erreur réponse recommandation:', error);
        res.status(500).json({
            success: false,
            message: 'Erreur lors de l\'enregistrement de la réponse'
        });
    }
});

// ==================== ROUTES NOTIFICATIONS ====================

// GET /api/accompagnement/notifications - Récupérer les notifications avec pagination
router.get('/notifications', authMiddleware, async (req, res) => {
    try {
        const { unread_only, limit, page, company_id } = req.query;
        const limitNum = parseInt(limit) || 20;
        const pageNum = parseInt(page) || 1;
        const unreadOnlyBool = unread_only === 'true';

        let effectiveCompanyId = req.user.company_id;
        if (req.user.role === 'super_admin') {
            effectiveCompanyId = company_id ? parseInt(company_id) : null;
        }

        const notifications = await accompagnementService.getNotifications(
            req.user.id,
            effectiveCompanyId,
            unreadOnlyBool,
            limitNum
        );

        res.json({
            success: true,
            data: notifications,
            pagination: { page: pageNum, limit: limitNum }
        });
    } catch (error) {
        console.error('Erreur récupération notifications:', error);
        res.status(500).json({
            success: false,
            message: 'Erreur lors de la récupération des notifications'
        });
    }
});

// PUT /api/accompagnement/notifications/:id/read - Marquer une notification comme lue
router.put('/notifications/:id/read', authMiddleware, async (req, res) => {
    try {
        await accompagnementService.markNotificationAsRead(req.params.id);
        
        res.json({
            success: true,
            message: 'Notification marquée comme lue'
        });
    } catch (error) {
        console.error('Erreur marquage notification:', error);
        res.status(500).json({
            success: false,
            message: 'Erreur lors du marquage des notifications'
        });
    }
});

// POST /api/accompagnement/notifications/test - Créer une notification de test
router.post('/notifications/test', authMiddleware, async (req, res) => {
    try {
        const testNotification = {
            user_id: req.user.id,
            company_id: req.user.company_id,
            type: 'test',
            title: 'Notification de test',
            message: 'Ceci est une notification de test pour vérifier le système unifié.',
            data: {
                test: true,
                timestamp: new Date().toISOString()
            },
            action_url: null
        };
        
        // Créer la notification en base de données
        const notificationId = await accompagnementService.createNotification(testNotification);
        
        // Envoyer aussi un email de notification
        try {
            const emailService = new EmailService();
            const userName = `${req.user.first_name} ${req.user.last_name}`;
            await emailService.sendNotification(
                req.user.email,
                userName,
                'test',
                'Notification de test',
                'Ceci est une notification de test pour vérifier le système unifié. Vous devriez recevoir cet email si tout fonctionne correctement.',
                null
            );
            console.log('📧 Email de test envoyé à:', req.user.email);
        } catch (emailError) {
            console.error('❌ Erreur envoi email de test:', emailError);
            // Ne pas faire échouer la requête si l'email échoue
        }
        
        res.status(201).json({
            success: true,
            data: {
                id: notificationId,
                ...testNotification
            },
            message: 'Notification de test créée avec succès (notification + email)'
        });
    } catch (error) {
        console.error('Erreur création notification de test:', error);
        res.status(500).json({
            success: false,
            message: 'Erreur lors de la création de la notification de test'
        });
    }
});

// ==================== ROUTES MÉTRIQUES ====================

// GET /api/accompagnement/stats - Récupérer les statistiques d'accompagnement
router.get('/stats', authMiddleware, async (req, res) => {
    try {
        const metrics = await accompagnementService.getAccompanimentMetrics(req.user.company_id);
        
        res.json({
            success: true,
            data: {
                pending: metrics.pendingRequests || 0,
                completed: metrics.completedRequests || 0,
                supportSessions: metrics.totalConversations || 0,
                satisfaction: 4.8 // Valeur par défaut
            }
        });
    } catch (error) {
        console.error('Erreur récupération statistiques:', error);
        res.status(500).json({
            success: false,
            message: 'Erreur lors de la récupération des statistiques'
        });
    }
});

// GET /api/accompagnement/metrics - Récupérer les métriques d'accompagnement
router.get('/metrics', authMiddleware, async (req, res) => {
    try {
        const metrics = await accompagnementService.getAccompanimentMetrics(req.user.company_id);
        
        res.json({
            success: true,
            data: metrics
        });
    } catch (error) {
        console.error('Erreur récupération métriques:', error);
        res.status(500).json({
            success: false,
            message: 'Erreur lors de la récupération des métriques'
        });
    }
});

// GET /api/accompagnement/appointments - Récupérer les rendez-vous
router.get('/appointments', authMiddleware, async (req, res) => {
    try {
        // Pour le moment, retourner des données de démonstration
        const appointments = [
            {
                id: 1,
                title: 'Consultation stratégie marketing',
                date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // Dans 7 jours
                duration: '1h30',
                type: 'consultation',
                status: 'confirmed'
            },
            {
                id: 2,
                title: 'Formation Google Analytics',
                date: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(), // Dans 14 jours
                duration: '2h00',
                type: 'formation',
                status: 'pending'
            }
        ];
        
        res.json({
            success: true,
            data: appointments
        });
    } catch (error) {
        console.error('Erreur récupération rendez-vous:', error);
        res.status(500).json({
            success: false,
            message: 'Erreur lors de la récupération des rendez-vous'
        });
    }
});

// POST /api/accompagnement/appointments - Créer un nouveau rendez-vous
router.post('/appointments', authMiddleware, async (req, res) => {
    try {
        const { title, date, duration, type, description } = req.body;
        
        if (!title || !date) {
            return res.status(400).json({
                success: false,
                message: 'Titre et date sont requis'
            });
        }
        
        // TODO: Implémenter la création en base de données
        const appointmentId = Date.now(); // ID temporaire
        
        res.status(201).json({
            success: true,
            data: {
                id: appointmentId,
                title,
                date,
                duration: duration || '1h00',
                type: type || 'consultation',
                status: 'pending'
            },
            message: 'Rendez-vous créé avec succès'
        });
    } catch (error) {
        console.error('Erreur création rendez-vous:', error);
        res.status(500).json({
            success: false,
            message: 'Erreur lors de la création du rendez-vous'
        });
    }
});

// GET /api/accompagnement/activity - Récupérer l'activité récente
router.get('/activity', authMiddleware, async (req, res) => {
    try {
        const { limit } = req.query;
        const activity = await accompagnementService.getRecentActivity(
            req.user.company_id,
            limit ? parseInt(limit) : 10
        );
        
        res.json({
            success: true,
            data: activity
        });
    } catch (error) {
        console.error('Erreur récupération activité:', error);
        res.status(500).json({
            success: false,
            message: 'Erreur lors de la récupération de l\'activité'
        });
    }
});

// ==================== ROUTE DE TEST ====================

// GET /api/accompagnement/test - Route de test pour vérifier la connexion
router.get('/test', authMiddleware, async (req, res) => {
    try {
        res.json({
            success: true,
            message: 'API Accompagnement fonctionnelle',
            user: {
                id: req.user.id,
                company_id: req.user.company_id,
                name: `${req.user.first_name} ${req.user.last_name}`
            }
        });
    } catch (error) {
        console.error('Erreur test API:', error);
        res.status(500).json({
            success: false,
            message: 'Erreur API Accompagnement'
        });
    }
});

module.exports = router;