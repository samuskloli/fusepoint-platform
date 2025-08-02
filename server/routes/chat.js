const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/auth');
const roleAuth = require('../middleware/roleAuth');
const chatService = require('../services/chatService');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { body, validationResult, param } = require('express-validator');

// Configuration de multer pour l'upload de fichiers
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(__dirname, '../uploads/chat');
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
    // Types de fichiers autorisés
    const allowedTypes = /jpeg|jpg|png|gif|pdf|doc|docx|txt|zip|rar/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);
    
    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error('Type de fichier non autorisé'));
    }
  }
});

// Middleware pour toutes les routes chat
router.use(authMiddleware);

/**
 * GET /api/chat/conversations
 * Récupérer les conversations de l'utilisateur connecté
 */
router.get('/conversations', async (req, res) => {
  try {
    const userId = req.user.id;
    const userRole = req.user.role;
    
    console.log(`🔍 Récupération des conversations pour utilisateur ${userId} (${userRole})`);
    
    const conversations = await chatService.getUserConversations(userId, userRole);
    
    res.json({
      success: true,
      data: conversations
    });
  } catch (error) {
    console.error('❌ Erreur récupération conversations:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération des conversations',
      error: error.message
    });
  }
});

/**
 * GET /api/chat/conversation/:conversationId/messages
 * Récupérer les messages d'une conversation
 */
router.get('/conversation/:conversationId/messages', [
  param('conversationId').isInt().withMessage('ID de conversation invalide')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Données invalides',
        errors: errors.array()
      });
    }

    const conversationId = parseInt(req.params.conversationId);
    const userId = req.user.id;
    const limit = parseInt(req.query.limit) || 50;
    const offset = parseInt(req.query.offset) || 0;
    
    console.log(`🔍 Récupération des messages pour conversation ${conversationId}`);
    
    // Vérifier que l'utilisateur a accès à cette conversation
    const conversation = await chatService.db.get(
      'SELECT * FROM conversations WHERE id = ? AND (client_id = ? OR agent_id = ?)',
      [conversationId, userId, userId]
    );
    
    if (!conversation) {
      return res.status(403).json({
        success: false,
        message: 'Accès non autorisé à cette conversation'
      });
    }
    
    const messages = await chatService.getMessages(conversationId, limit, offset);
    
    // Marquer la conversation comme lue
    await chatService.markConversationAsRead(conversationId, userId);
    
    res.json({
      success: true,
      data: messages
    });
  } catch (error) {
    console.error('❌ Erreur récupération messages:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération des messages',
      error: error.message
    });
  }
});

/**
 * POST /api/chat/conversation/:conversationId/message
 * Envoyer un message dans une conversation
 */
router.post('/conversation/:conversationId/message', [
  param('conversationId').isInt().withMessage('ID de conversation invalide'),
  body('content').notEmpty().withMessage('Le contenu du message est requis'),
  body('messageType').optional().isIn(['text', 'file', 'image']).withMessage('Type de message invalide')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Données invalides',
        errors: errors.array()
      });
    }

    const conversationId = parseInt(req.params.conversationId);
    const userId = req.user.id;
    const { content, messageType = 'text' } = req.body;
    
    console.log(`📤 Envoi de message dans conversation ${conversationId}`);
    
    // Vérifier que l'utilisateur a accès à cette conversation
    const conversation = await chatService.db.get(
      'SELECT * FROM conversations WHERE id = ? AND (client_id = ? OR agent_id = ?)',
      [conversationId, userId, userId]
    );
    
    if (!conversation) {
      return res.status(403).json({
        success: false,
        message: 'Accès non autorisé à cette conversation'
      });
    }
    
    // Déterminer le destinataire
    const recipientId = conversation.client_id === userId ? conversation.agent_id : conversation.client_id;
    
    const message = await chatService.sendMessage(
      conversationId,
      userId,
      recipientId,
      content,
      messageType
    );
    
    res.json({
      success: true,
      data: message
    });
  } catch (error) {
    console.error('❌ Erreur envoi message:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de l\'envoi du message',
      error: error.message
    });
  }
});

/**
 * POST /api/chat/conversation/:conversationId/upload
 * Uploader un fichier dans une conversation
 */
router.post('/conversation/:conversationId/upload', [
  param('conversationId').isInt().withMessage('ID de conversation invalide')
], upload.single('file'), async (req, res) => {
  try {
    const conversationId = parseInt(req.params.conversationId);
    const userId = req.user.id;
    
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'Aucun fichier fourni'
      });
    }
    
    console.log(`📎 Upload de fichier dans conversation ${conversationId}`);
    
    // Vérifier que l'utilisateur a accès à cette conversation
    const conversation = await chatService.db.get(
      'SELECT * FROM conversations WHERE id = ? AND (client_id = ? OR agent_id = ?)',
      [conversationId, userId, userId]
    );
    
    if (!conversation) {
      // Supprimer le fichier uploadé
      fs.unlinkSync(req.file.path);
      return res.status(403).json({
        success: false,
        message: 'Accès non autorisé à cette conversation'
      });
    }
    
    // Déterminer le destinataire
    const recipientId = conversation.client_id === userId ? conversation.agent_id : conversation.client_id;
    
    // Créer l'URL du fichier
    const fileUrl = `/uploads/chat/${req.file.filename}`;
    
    // Déterminer le type de message
    const messageType = req.file.mimetype.startsWith('image/') ? 'image' : 'file';
    
    const fileData = {
      url: fileUrl,
      name: req.file.originalname,
      size: req.file.size,
      mimeType: req.file.mimetype
    };
    
    const message = await chatService.sendMessage(
      conversationId,
      userId,
      recipientId,
      `Fichier partagé: ${req.file.originalname}`,
      messageType,
      fileData
    );
    
    res.json({
      success: true,
      data: message
    });
  } catch (error) {
    console.error('❌ Erreur upload fichier:', error);
    
    // Supprimer le fichier en cas d'erreur
    if (req.file && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }
    
    res.status(500).json({
      success: false,
      message: 'Erreur lors de l\'upload du fichier',
      error: error.message
    });
  }
});

/**
 * POST /api/chat/start-conversation
 * Démarrer une nouvelle conversation (pour les agents avec un client)
 */
router.post('/start-conversation', [
  roleAuth(['agent', 'admin', 'super_admin']),
  body('clientId').isInt().withMessage('ID client invalide')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Données invalides',
        errors: errors.array()
      });
    }

    const agentId = req.user.id;
    const { clientId } = req.body;
    
    console.log(`🆕 Démarrage conversation entre agent ${agentId} et client ${clientId}`);
    
    // Vérifier que le client existe et a le bon rôle
    const client = await chatService.db.get(
      'SELECT * FROM users WHERE id = ? AND role = "user" AND is_active = 1',
      [clientId]
    );
    
    if (!client) {
      return res.status(404).json({
        success: false,
        message: 'Client non trouvé ou inactif'
      });
    }
    
    const conversation = await chatService.getOrCreateConversation(clientId, agentId);
    
    res.json({
      success: true,
      data: conversation
    });
  } catch (error) {
    console.error('❌ Erreur démarrage conversation:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors du démarrage de la conversation',
      error: error.message
    });
  }
});

/**
 * GET /api/chat/my-agent
 * Récupérer l'agent assigné au client connecté
 */
router.get('/my-agent', roleAuth(['user']), async (req, res) => {
  try {
    const clientId = req.user.id;
    
    console.log(`🔍 Recherche agent assigné pour client ${clientId}`);
    
    const agent = await chatService.getAssignedAgent(clientId);
    
    if (!agent) {
      return res.status(404).json({
        success: false,
        message: 'Aucun agent assigné trouvé'
      });
    }
    
    res.json({
      success: true,
      data: agent
    });
  } catch (error) {
    console.error('❌ Erreur récupération agent assigné:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération de l\'agent assigné',
      error: error.message
    });
  }
});

/**
 * GET /api/chat/my-clients
 * Récupérer les clients assignés à l'agent connecté
 */
router.get('/my-clients', roleAuth(['agent', 'admin', 'super_admin']), async (req, res) => {
  try {
    const agentId = req.user.id;
    
    console.log(`🔍 Recherche clients assignés pour agent ${agentId}`);
    
    const clients = await chatService.getAssignedClients(agentId);
    
    res.json({
      success: true,
      data: clients
    });
  } catch (error) {
    console.error('❌ Erreur récupération clients assignés:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération des clients assignés',
      error: error.message
    });
  }
});

/**
 * GET /api/chat/search-clients
 * Rechercher des clients (pour les agents)
 */
router.get('/search-clients', [
  roleAuth(['agent', 'admin', 'super_admin'])
], async (req, res) => {
  try {
    const { q: searchTerm, limit = 20 } = req.query;
    
    if (!searchTerm || searchTerm.trim().length < 2) {
      return res.status(400).json({
        success: false,
        message: 'Le terme de recherche doit contenir au moins 2 caractères'
      });
    }
    
    console.log(`🔍 Recherche clients avec terme: ${searchTerm}`);
    
    const clients = await chatService.searchClients(searchTerm.trim(), parseInt(limit));
    
    res.json({
      success: true,
      data: clients
    });
  } catch (error) {
    console.error('❌ Erreur recherche clients:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la recherche de clients',
      error: error.message
    });
  }
});

/**
 * GET /api/chat/notifications
 * Récupérer les notifications de chat
 */
router.get('/notifications', async (req, res) => {
  try {
    const userId = req.user.id;
    const unreadOnly = req.query.unread_only !== 'false';
    
    console.log(`🔔 Récupération notifications pour utilisateur ${userId}`);
    
    const notifications = await chatService.getChatNotifications(userId, unreadOnly);
    
    res.json({
      success: true,
      data: notifications
    });
  } catch (error) {
    console.error('❌ Erreur récupération notifications:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération des notifications',
      error: error.message
    });
  }
});

/**
 * PUT /api/chat/conversation/:conversationId/read
 * Marquer une conversation comme lue
 */
router.put('/conversation/:conversationId/read', [
  param('conversationId').isInt().withMessage('ID de conversation invalide')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Données invalides',
        errors: errors.array()
      });
    }

    const conversationId = parseInt(req.params.conversationId);
    const userId = req.user.id;
    
    console.log(`✅ Marquage conversation ${conversationId} comme lue`);
    
    // Vérifier que l'utilisateur a accès à cette conversation
    const conversation = await chatService.db.get(
      'SELECT * FROM conversations WHERE id = ? AND (client_id = ? OR agent_id = ?)',
      [conversationId, userId, userId]
    );
    
    if (!conversation) {
      return res.status(403).json({
        success: false,
        message: 'Accès non autorisé à cette conversation'
      });
    }
    
    await chatService.markConversationAsRead(conversationId, userId);
    
    res.json({
      success: true,
      message: 'Conversation marquée comme lue'
    });
  } catch (error) {
    console.error('❌ Erreur marquage conversation comme lue:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors du marquage de la conversation comme lue',
      error: error.message
    });
  }
});

/**
 * GET /api/chat/conversation/with/:userId
 * Obtenir ou créer une conversation avec un utilisateur spécifique
 */
router.get('/conversation/with/:userId', [
  param('userId').isInt().withMessage('ID utilisateur invalide')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Données invalides',
        errors: errors.array()
      });
    }

    const currentUserId = req.user.id;
    const currentUserRole = req.user.role;
    const targetUserId = parseInt(req.params.userId);
    
    console.log(`🔍 Recherche/création conversation entre ${currentUserId} et ${targetUserId}`);
    
    // Vérifier que l'utilisateur cible existe
    const targetUser = await chatService.db.get(
      'SELECT * FROM users WHERE id = ? AND is_active = 1',
      [targetUserId]
    );
    
    if (!targetUser) {
      return res.status(404).json({
        success: false,
        message: 'Utilisateur cible non trouvé ou inactif'
      });
    }
    
    let conversation;
    
    // Logique selon les rôles
    if (currentUserRole === 'user' && targetUser.role === 'agent') {
      // Client vers agent
      conversation = await chatService.getOrCreateConversation(currentUserId, targetUserId);
    } else if ((currentUserRole === 'agent' || currentUserRole === 'admin' || currentUserRole === 'super_admin') && targetUser.role === 'user') {
      // Agent vers client
      conversation = await chatService.getOrCreateConversation(targetUserId, currentUserId);
    } else {
      return res.status(403).json({
        success: false,
        message: 'Type de conversation non autorisé'
      });
    }
    
    res.json({
      success: true,
      data: conversation
    });
  } catch (error) {
    console.error('❌ Erreur récupération/création conversation:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération/création de la conversation',
      error: error.message
    });
  }
});

module.exports = router;