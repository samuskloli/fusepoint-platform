const path = require('path');
const fs = require('fs');
const databaseService = require('./databaseService');

/**
 * Service de gestion du chat intégré
 * Gère les conversations entre clients et agents
 */
class ChatService {
  constructor() {
    this.db = null;
    this.initialized = false;
  }

  /**
   * Initialiser le service de chat
   */
  async initialize() {
    if (!this.initialized) {
      await databaseService.initialize();
      this.db = databaseService.db;
      await this.createChatTables();
      this.initialized = true;
    }
  }

  /**
   * Créer les tables de chat si elles n'existent pas
   */
  async createChatTables() {
    try {
      // Exécution des requêtes SQL une par une pour éviter les problèmes de duplication
      const queries = [
        `CREATE TABLE IF NOT EXISTS conversations (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          client_id INTEGER NOT NULL,
          agent_id INTEGER NOT NULL,
          title TEXT NOT NULL,
          status TEXT DEFAULT 'active',
          last_message_at DATETIME,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )`,
        `CREATE TABLE IF NOT EXISTS messages (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          conversation_id INTEGER NOT NULL,
          sender_id INTEGER NOT NULL,
          recipient_id INTEGER NOT NULL,
          message_type TEXT DEFAULT 'text',
          content TEXT NOT NULL,
          file_url TEXT,
          file_name TEXT,
          file_size INTEGER,
          mime_type TEXT,
          is_system BOOLEAN DEFAULT 0,
          read_at DATETIME,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )`,
        `CREATE TABLE IF NOT EXISTS conversation_participants (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          conversation_id INTEGER NOT NULL,
          user_id INTEGER NOT NULL,
          role TEXT DEFAULT 'participant',
          joined_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          last_read_at DATETIME,
          UNIQUE(conversation_id, user_id)
        )`,
        `CREATE TABLE IF NOT EXISTS chat_notifications (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          user_id INTEGER NOT NULL,
          conversation_id INTEGER NOT NULL,
          message_id INTEGER,
          notification_type TEXT DEFAULT 'message',
          title TEXT,
          message TEXT,
          is_read BOOLEAN DEFAULT 0,
          read_at DATETIME,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )`
      ];
      
      // Exécuter chaque requête individuellement
      for (const query of queries) {
        console.log('🔍 Exécution requête:', query.substring(0, 50) + '...');
        await this.db.exec(query);
      }
      
      // Créer les index avec vérification dynamique des colonnes
      await this.createIndexesSafely();
      
      console.log('✅ Tables de chat créées avec succès');
    } catch (error) {
      console.error('❌ Erreur lors de la création des tables de chat:', error);
      throw error;
    }
  }

  /**
   * Créer les index de manière sécurisée en vérifiant l'existence des colonnes
   */
  async createIndexesSafely() {
    try {
      // Vérifier les colonnes de la table conversations
      const conversationsInfo = await this.db.all("PRAGMA table_info(conversations)");
      const hasClientId = conversationsInfo.some(col => col.name === "client_id");
      const hasAgentId = conversationsInfo.some(col => col.name === "agent_id");
      
      if (hasClientId && hasAgentId) {
        console.log('🔍 Création index conversations...');
        await this.db.exec(`CREATE INDEX IF NOT EXISTS idx_conversations_client_agent ON conversations(client_id, agent_id)`);
      } else {
        console.warn("⚠️ L'index idx_conversations_client_agent n'a pas été créé : colonnes manquantes (client_id ou agent_id). Vérifie la structure de la table conversations.");
      }

      // Vérifier les colonnes de la table messages
      const messagesInfo = await this.db.all("PRAGMA table_info(messages)");
      const hasConversationId = messagesInfo.some(col => col.name === "conversation_id");
      
      if (hasConversationId) {
        console.log('🔍 Création index messages...');
        await this.db.exec(`CREATE INDEX IF NOT EXISTS idx_messages_conversation ON messages(conversation_id)`);
      } else {
        console.warn("⚠️ L'index idx_messages_conversation n'a pas été créé : colonne conversation_id manquante.");
      }

      // Vérifier les colonnes de la table conversation_participants
      const participantsInfo = await this.db.all("PRAGMA table_info(conversation_participants)");
      const hasParticipantConversationId = participantsInfo.some(col => col.name === "conversation_id");
      const hasUserId = participantsInfo.some(col => col.name === "user_id");
      
      if (hasParticipantConversationId) {
        console.log('🔍 Création index conversation_participants (conversation)...');
        await this.db.exec(`CREATE INDEX IF NOT EXISTS idx_conversation_participants_conversation ON conversation_participants(conversation_id)`);
      } else {
        console.warn("⚠️ L'index idx_conversation_participants_conversation n'a pas été créé : colonne conversation_id manquante.");
      }
      
      if (hasUserId) {
        console.log('🔍 Création index conversation_participants (user)...');
        await this.db.exec(`CREATE INDEX IF NOT EXISTS idx_conversation_participants_user ON conversation_participants(user_id)`);
      } else {
        console.warn("⚠️ L'index idx_conversation_participants_user n'a pas été créé : colonne user_id manquante.");
      }

      // Vérifier les colonnes de la table chat_notifications
      const notificationsInfo = await this.db.all("PRAGMA table_info(chat_notifications)");
      const hasNotificationUserId = notificationsInfo.some(col => col.name === "user_id");
      const hasNotificationConversationId = notificationsInfo.some(col => col.name === "conversation_id");
      const hasIsRead = notificationsInfo.some(col => col.name === "is_read");
      
      if (hasNotificationUserId) {
        console.log('🔍 Création index chat_notifications (user)...');
        await this.db.exec(`CREATE INDEX IF NOT EXISTS idx_chat_notifications_user ON chat_notifications(user_id)`);
      } else {
        console.warn("⚠️ L'index idx_chat_notifications_user n'a pas été créé : colonne user_id manquante.");
      }
      
      if (hasNotificationConversationId) {
        console.log('🔍 Création index chat_notifications (conversation)...');
        await this.db.exec(`CREATE INDEX IF NOT EXISTS idx_chat_notifications_conversation ON chat_notifications(conversation_id)`);
      } else {
        console.warn("⚠️ L'index idx_chat_notifications_conversation n'a pas été créé : colonne conversation_id manquante.");
      }
      
      if (hasIsRead) {
        console.log('🔍 Création index chat_notifications (read)...');
        await this.db.exec(`CREATE INDEX IF NOT EXISTS idx_chat_notifications_read ON chat_notifications(is_read)`);
      } else {
        console.warn("⚠️ L'index idx_chat_notifications_read n'a pas été créé : colonne is_read manquante.");
      }
      
      console.log('✅ Index créés avec succès (avec vérifications)');
    } catch (error) {
      console.error('❌ Erreur lors de la création des index:', error);
      // Ne pas faire planter l'application, juste logger l'erreur
      console.warn('⚠️ Certains index n\'ont pas pu être créés, mais l\'application peut continuer.');
    }
  }

  /**
   * Obtenir ou créer une conversation entre un client et un agent
   * @param {number} clientId - ID du client
   * @param {number} agentId - ID de l'agent
   * @returns {Object} Conversation
   */
  async getOrCreateConversation(clientId, agentId) {
    await this.initialize();
    
    try {
      // Vérifier si une conversation existe déjà
      let conversation = await this.db.get(
        `SELECT c.*, 
                u1.first_name as client_first_name, u1.last_name as client_last_name, u1.email as client_email,
                u2.first_name as agent_first_name, u2.last_name as agent_last_name, u2.email as agent_email
         FROM conversations c
         JOIN users u1 ON c.client_id = u1.id
         JOIN users u2 ON c.agent_id = u2.id
         WHERE c.client_id = ? AND c.agent_id = ?`,
        [clientId, agentId]
      );

      if (!conversation) {
        // Créer une nouvelle conversation
        const result = await this.db.run(
          `INSERT INTO conversations (client_id, agent_id, title, status)
           VALUES (?, ?, ?, 'active')`,
          [clientId, agentId, `Conversation avec le client`]
        );

        // Récupérer la conversation créée
        conversation = await this.db.get(
          `SELECT c.*, 
                  u1.first_name as client_first_name, u1.last_name as client_last_name, u1.email as client_email,
                  u2.first_name as agent_first_name, u2.last_name as agent_last_name, u2.email as agent_email
           FROM conversations c
           JOIN users u1 ON c.client_id = u1.id
           JOIN users u2 ON c.agent_id = u2.id
           WHERE c.id = ?`,
          [result.lastID]
        );

        // Créer les participants
        await this.db.run(
          `INSERT INTO conversation_participants (conversation_id, user_id, role)
           VALUES (?, ?, 'participant'), (?, ?, 'participant')`,
          [conversation.id, clientId, conversation.id, agentId]
        );
      }

      return {
        id: conversation.id,
        client_id: conversation.client_id,
        agent_id: conversation.agent_id,
        title: conversation.title,
        status: conversation.status,
        last_message_at: conversation.last_message_at,
        created_at: conversation.created_at,
        client: {
          id: conversation.client_id,
          first_name: conversation.client_first_name,
          last_name: conversation.client_last_name,
          email: conversation.client_email
        },
        agent: {
          id: conversation.agent_id,
          first_name: conversation.agent_first_name,
          last_name: conversation.agent_last_name,
          email: conversation.agent_email
        }
      };
    } catch (error) {
      console.error('❌ Erreur lors de la création/récupération de conversation:', error);
      throw error;
    }
  }

  /**
   * Envoyer un message dans une conversation
   * @param {number} conversationId - ID de la conversation
   * @param {number} senderId - ID de l'expéditeur
   * @param {number} recipientId - ID du destinataire
   * @param {string} content - Contenu du message
   * @param {string} messageType - Type de message ('text', 'file', 'image')
   * @param {Object} fileData - Données du fichier (optionnel)
   * @returns {Object} Message créé
   */
  async sendMessage(conversationId, senderId, recipientId, content, messageType = 'text', fileData = null) {
    await this.initialize();
    
    try {
      const messageData = {
        conversation_id: conversationId,
        sender_id: senderId,
        recipient_id: recipientId,
        message_type: messageType,
        content: content
      };

      // Ajouter les données de fichier si présentes
      if (fileData) {
        messageData.file_url = fileData.url;
        messageData.file_name = fileData.name;
        messageData.file_size = fileData.size;
        messageData.mime_type = fileData.mimeType;
      }

      const result = await this.db.run(
        `INSERT INTO messages (conversation_id, sender_id, recipient_id, message_type, content, file_url, file_name, file_size, mime_type)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          messageData.conversation_id,
          messageData.sender_id,
          messageData.recipient_id,
          messageData.message_type,
          messageData.content,
          messageData.file_url || null,
          messageData.file_name || null,
          messageData.file_size || null,
          messageData.mime_type || null
        ]
      );

      // Récupérer le message créé avec les informations de l'expéditeur
      const message = await this.db.get(
        `SELECT m.*, 
                u.first_name as sender_first_name, u.last_name as sender_last_name, u.email as sender_email
         FROM messages m
         JOIN users u ON m.sender_id = u.id
         WHERE m.id = ?`,
        [result.lastID]
      );

      return {
        id: message.id,
        conversation_id: message.conversation_id,
        sender_id: message.sender_id,
        recipient_id: message.recipient_id,
        message_type: message.message_type,
        content: message.content,
        file_url: message.file_url,
        file_name: message.file_name,
        file_size: message.file_size,
        mime_type: message.mime_type,
        read_at: message.read_at,
        created_at: message.created_at,
        sender: {
          id: message.sender_id,
          first_name: message.sender_first_name,
          last_name: message.sender_last_name,
          email: message.sender_email
        }
      };
    } catch (error) {
      console.error('❌ Erreur lors de l\'envoi du message:', error);
      throw error;
    }
  }

  /**
   * Récupérer les messages d'une conversation
   * @param {number} conversationId - ID de la conversation
   * @param {number} limit - Nombre de messages à récupérer
   * @param {number} offset - Décalage pour la pagination
   * @returns {Array} Liste des messages
   */
  async getMessages(conversationId, limit = 50, offset = 0) {
    await this.initialize();
    
    try {
      const messages = await this.db.all(
        `SELECT m.*, 
                u.first_name as sender_first_name, u.last_name as sender_last_name, u.email as sender_email
         FROM messages m
         JOIN users u ON m.sender_id = u.id
         WHERE m.conversation_id = ?
         ORDER BY m.created_at DESC
         LIMIT ? OFFSET ?`,
        [conversationId, limit, offset]
      );

      return messages.map(message => ({
        id: message.id,
        conversation_id: message.conversation_id,
        sender_id: message.sender_id,
        recipient_id: message.recipient_id,
        message_type: message.message_type,
        content: message.content,
        file_url: message.file_url,
        file_name: message.file_name,
        file_size: message.file_size,
        mime_type: message.mime_type,
        read_at: message.read_at,
        created_at: message.created_at,
        sender: {
          id: message.sender_id,
          first_name: message.sender_first_name,
          last_name: message.sender_last_name,
          email: message.sender_email
        }
      })).reverse(); // Inverser pour avoir les plus anciens en premier
    } catch (error) {
      console.error('❌ Erreur lors de la récupération des messages:', error);
      throw error;
    }
  }

  /**
   * Marquer un message comme lu
   * @param {number} messageId - ID du message
   * @param {number} userId - ID de l'utilisateur qui lit le message
   */
  async markMessageAsRead(messageId, userId) {
    await this.initialize();
    
    try {
      await this.db.run(
        `UPDATE messages SET read_at = CURRENT_TIMESTAMP WHERE id = ? AND recipient_id = ? AND read_at IS NULL`,
        [messageId, userId]
      );
    } catch (error) {
      console.error('❌ Erreur lors du marquage du message comme lu:', error);
      throw error;
    }
  }

  /**
   * Marquer tous les messages d'une conversation comme lus
   * @param {number} conversationId - ID de la conversation
   * @param {number} userId - ID de l'utilisateur qui lit les messages
   */
  async markConversationAsRead(conversationId, userId) {
    await this.initialize();
    
    try {
      await this.db.run(
        `UPDATE messages SET read_at = CURRENT_TIMESTAMP 
         WHERE conversation_id = ? AND recipient_id = ? AND read_at IS NULL`,
        [conversationId, userId]
      );

      // Marquer les notifications comme lues
      await this.db.run(
        `UPDATE chat_notifications SET is_read = 1, read_at = CURRENT_TIMESTAMP 
         WHERE conversation_id = ? AND user_id = ? AND is_read = 0`,
        [conversationId, userId]
      );
    } catch (error) {
      console.error('❌ Erreur lors du marquage de la conversation comme lue:', error);
      throw error;
    }
  }

  /**
   * Récupérer les conversations d'un utilisateur
   * @param {number} userId - ID de l'utilisateur
   * @param {string} userRole - Rôle de l'utilisateur ('user', 'agent')
   * @returns {Array} Liste des conversations
   */
  async getUserConversations(userId, userRole) {
    await this.initialize();
    
    try {
      let query;
      let params;

      if (userRole === 'user') {
        // Pour un client, récupérer ses conversations avec les agents
        query = `
          SELECT c.*, 
                 u.first_name as agent_first_name, u.last_name as agent_last_name, u.email as agent_email,
                 COUNT(CASE WHEN m.recipient_id = ? AND m.read_at IS NULL THEN 1 END) as unread_count,
                 last_msg.content as last_message_content,
                 last_msg.message_type as last_message_type,
                 last_msg.created_at as last_message_time
          FROM conversations c
          JOIN users u ON c.agent_id = u.id
          LEFT JOIN messages m ON c.id = m.conversation_id
          LEFT JOIN (
            SELECT DISTINCT conversation_id, content, message_type, created_at,
                   ROW_NUMBER() OVER (PARTITION BY conversation_id ORDER BY created_at DESC) as rn
            FROM messages
          ) last_msg ON c.id = last_msg.conversation_id AND last_msg.rn = 1
          WHERE c.client_id = ?
          GROUP BY c.id
          ORDER BY c.last_message_at DESC`;
        params = [userId, userId];
      } else {
        // Pour un agent, récupérer ses conversations avec les clients
        query = `
          SELECT c.*, 
                 u.first_name as client_first_name, u.last_name as client_last_name, u.email as client_email,
                 COUNT(CASE WHEN m.recipient_id = ? AND m.read_at IS NULL THEN 1 END) as unread_count,
                 last_msg.content as last_message_content,
                 last_msg.message_type as last_message_type,
                 last_msg.created_at as last_message_time
          FROM conversations c
          JOIN users u ON c.client_id = u.id
          LEFT JOIN messages m ON c.id = m.conversation_id
          LEFT JOIN (
            SELECT DISTINCT conversation_id, content, message_type, created_at,
                   ROW_NUMBER() OVER (PARTITION BY conversation_id ORDER BY created_at DESC) as rn
            FROM messages
          ) last_msg ON c.id = last_msg.conversation_id AND last_msg.rn = 1
          WHERE c.agent_id = ?
          GROUP BY c.id
          ORDER BY c.last_message_at DESC`;
        params = [userId, userId];
      }

      const conversations = await this.db.all(query, params);

      return conversations.map(conv => ({
        id: conv.id,
        client_id: conv.client_id,
        agent_id: conv.agent_id,
        title: conv.title,
        status: conv.status,
        last_message_at: conv.last_message_at,
        created_at: conv.created_at,
        unread_count: conv.unread_count || 0,
        last_message: {
          content: conv.last_message_content,
          type: conv.last_message_type,
          time: conv.last_message_time
        },
        participant: userRole === 'user' ? {
          id: conv.agent_id,
          first_name: conv.agent_first_name,
          last_name: conv.agent_last_name,
          email: conv.agent_email,
          role: 'agent'
        } : {
          id: conv.client_id,
          first_name: conv.client_first_name,
          last_name: conv.client_last_name,
          email: conv.client_email,
          role: 'user'
        }
      }));
    } catch (error) {
      console.error('❌ Erreur lors de la récupération des conversations:', error);
      throw error;
    }
  }

  /**
   * Vérifier si un agent est assigné à un client
   * @param {number} clientId - ID du client
   * @param {number} agentId - ID de l'agent
   * @returns {boolean} True si l'agent est assigné au client
   */
  async isAgentAssignedToClient(clientId, agentId) {
    await this.initialize();
    
    try {
      // Vérifier via la colonne agent_id dans la table users
      const assignment = await this.db.get(
        `SELECT id FROM users 
         WHERE id = ? AND agent_id = ? AND role IN ('user', 'client')`,
        [clientId, agentId]
      );

      return !!assignment;
    } catch (error) {
      console.error('❌ Erreur lors de la vérification de l\'assignation:', error);
      return false;
    }
  }

  /**
   * Récupérer l'agent assigné à un client
   * @param {number} clientId - ID du client
   * @returns {Object|null} Agent assigné ou null
   */
  async getAssignedAgent(clientId) {
    await this.initialize();
    
    try {
      const agent = await this.db.get(
        `SELECT a.id, a.first_name, a.last_name, a.email, u.updated_at as assigned_at
         FROM users u
         JOIN users a ON u.agent_id = a.id
         WHERE u.id = ? AND u.role IN ('user', 'client') AND a.role = 'agent'
         LIMIT 1`,
        [clientId]
      );

      return agent ? {
        id: agent.id,
        first_name: agent.first_name,
        last_name: agent.last_name,
        email: agent.email,
        assigned_at: agent.assigned_at
      } : null;
    } catch (error) {
      console.error('❌ Erreur lors de la récupération de l\'agent assigné:', error);
      return null;
    }
  }

  /**
   * Récupérer les clients assignés à un agent
   * @param {number} agentId - ID de l'agent
   * @returns {Array} Liste des clients assignés
   */
  async getAssignedClients(agentId) {
    await this.initialize();
    
    try {
      const clients = await this.db.all(
        `SELECT u.id, u.first_name, u.last_name, u.email, u.created_at, u.updated_at as assigned_at
         FROM users u
         WHERE u.agent_id = ? AND u.role IN ('user', 'client')
         ORDER BY u.updated_at DESC`,
        [agentId]
      );

      return clients.map(client => ({
        id: client.id,
        first_name: client.first_name,
        last_name: client.last_name,
        email: client.email,
        created_at: client.created_at,
        assigned_at: client.assigned_at
      }));
    } catch (error) {
      console.error('❌ Erreur lors de la récupération des clients assignés:', error);
      return [];
    }
  }

  /**
   * Rechercher des clients (pour les agents)
   * @param {string} searchTerm - Terme de recherche
   * @param {number} limit - Limite de résultats
   * @returns {Array} Liste des clients trouvés
   */
  async searchClients(searchTerm, limit = 20) {
    await this.initialize();
    
    try {
      const clients = await this.db.all(
        `SELECT u.id, u.first_name, u.last_name, u.email, u.created_at,
                c.name as company_name
         FROM users u
         LEFT JOIN user_companies uc ON u.id = uc.user_id
         LEFT JOIN companies c ON uc.company_id = c.id
         WHERE u.role IN ('user', 'client') 
         AND (u.first_name LIKE ? OR u.last_name LIKE ? OR u.email LIKE ? OR c.name LIKE ?)
         ORDER BY u.first_name, u.last_name
         LIMIT ?`,
        [`%${searchTerm}%`, `%${searchTerm}%`, `%${searchTerm}%`, `%${searchTerm}%`, limit]
      );

      return clients.map(client => ({
        id: client.id,
        first_name: client.first_name,
        last_name: client.last_name,
        email: client.email,
        company_name: client.company_name,
        created_at: client.created_at
      }));
    } catch (error) {
      console.error('❌ Erreur lors de la recherche de clients:', error);
      return [];
    }
  }

  /**
   * Récupérer les notifications de chat d'un utilisateur
   * @param {number} userId - ID de l'utilisateur
   * @param {boolean} unreadOnly - Récupérer seulement les non lues
   * @returns {Array} Liste des notifications
   */
  async getChatNotifications(userId, unreadOnly = true) {
    await this.initialize();
    
    try {
      let query = `
        SELECT cn.*, c.title as conversation_title,
               u.first_name as sender_first_name, u.last_name as sender_last_name
        FROM chat_notifications cn
        JOIN conversations c ON cn.conversation_id = c.id
        LEFT JOIN messages m ON cn.message_id = m.id
        LEFT JOIN users u ON m.sender_id = u.id
        WHERE cn.user_id = ?`;
      
      if (unreadOnly) {
        query += ` AND cn.is_read = 0`;
      }
      
      query += ` ORDER BY cn.created_at DESC LIMIT 50`;

      const notifications = await this.db.all(query, [userId]);

      return notifications.map(notif => ({
        id: notif.id,
        conversation_id: notif.conversation_id,
        message_id: notif.message_id,
        type: notif.notification_type,
        title: notif.title,
        content: notif.content,
        is_read: notif.is_read,
        created_at: notif.created_at,
        conversation_title: notif.conversation_title,
        sender: notif.sender_first_name ? {
          first_name: notif.sender_first_name,
          last_name: notif.sender_last_name
        } : null
      }));
    } catch (error) {
      console.error('❌ Erreur lors de la récupération des notifications:', error);
      return [];
    }
  }
}

module.exports = new ChatService();