/**
 * Service de gestion des notifications et communications
 * Centralise la logique d'envoi d'emails, messages et notifications
 */

const EmailService = require('./emailService');
const emailService = new EmailService();
const clientService = require('./clientService');
const agentService = require('./agentService');
const bulkEmailService = require('./bulkEmailService');
const languageService = require('./languageService');
const translationService = require('./translationService');
const systemLogsService = require('./systemLogsService');
const databaseService = require('./databaseService');

class NotificationManagementService {
  /**
   * Envoie un email à un client avec validation
   * @param {string} clientId - ID du client
   * @param {Object} emailData - Données de l'email
   * @param {string} agentId - ID de l'agent
   * @returns {boolean} - Succès de l'envoi
   */
  static async sendEmailToClient(clientId, emailData, agentId) {
    const { subject, message, type = 'general' } = emailData;

    // Validation des champs requis
    if (!subject || !message) {
      const error = new Error('Required fields missing');
      error.code = 'REQUIRED_FIELDS_MISSING';
      throw error;
    }

    // Vérifier que le client existe
    const client = await clientService.getClientById(clientId);
    if (!client) {
      const error = new Error('Client not found');
      error.code = 'CLIENT_NOT_FOUND';
      throw error;
    }

    // Vérifier que l'agent a accès au client
    const hasAccess = await agentService.checkAgentClientAccess(agentId, clientId);
    if (!hasAccess) {
      const error = new Error('Access denied');
      error.code = 'ACCESS_DENIED';
      throw error;
    }

    // Récupérer les informations de l'agent
    const agent = await agentService.getAgentById(agentId);
    if (!agent) {
      const error = new Error('Agent not found');
      error.code = 'AGENT_NOT_FOUND';
      throw error;
    }

    // Envoyer l'email
    const emailSent = await emailService.sendAgentEmail({
      to: client.email,
      subject,
      content: message,
      clientName: `${client.first_name} ${client.last_name}`,
      agentName: `${agent.first_name} ${agent.last_name}`,
      agentEmail: agent.email
    });

    if (emailSent) {
      // Log de l'opération
    systemLogsService.info('Email envoyé', 'notifications', null, null, {
      clientId,
      agentId,
      subject,
      type
    });
    }

    return emailSent;
  }

  /**
   * Envoie un message à un client
   * @param {string} clientId - ID du client
   * @param {Object} messageData - Données du message
   * @param {string} agentId - ID de l'agent
   * @returns {Object} - Message envoyé
   */
  static async sendMessageToClient(clientId, messageData, agentId) {
    const { content, type = 'text', priority = 'normal' } = messageData;

    // Validation des champs requis
    if (!content) {
      const error = new Error('Message content required');
      error.code = 'MESSAGE_CONTENT_REQUIRED';
      throw error;
    }

    // Vérifier que le client existe
    const client = await clientService.getClientById(clientId);
    if (!client) {
      const error = new Error('Client not found');
      error.code = 'CLIENT_NOT_FOUND';
      throw error;
    }

    // Vérifier que l'agent a accès au client
    const hasAccess = await agentService.checkAgentClientAccess(agentId, clientId);
    if (!hasAccess) {
      const error = new Error('Access denied');
      error.code = 'ACCESS_DENIED';
      throw error;
    }

    // Envoyer le message
    const message = await clientService.sendMessage({
      clientId,
      agentId,
      content,
      type,
      priority,
      timestamp: new Date()
    });

    // Log de l'opération
    systemLogsService.info('Message envoyé', 'notifications', null, null, {
      clientId,
      agentId,
      messageId: message.id,
      type
    });

    return message;
  }

  /**
   * Récupère les notifications d'un client
   * @param {string} clientId - ID du client
   * @param {string} agentId - ID de l'agent
   * @param {Object} options - Options de pagination
   * @returns {Array} - Liste des notifications
   */
  static async getClientNotifications(clientId, agentId, options = {}) {
    const { page = 1, limit = 20, unreadOnly = false } = options;

    // Vérifier que l'agent a accès au client
    const hasAccess = await agentService.checkAgentClientAccess(agentId, clientId);
    if (!hasAccess) {
      const error = new Error('Access denied');
      error.code = 'ACCESS_DENIED';
      throw error;
    }

    const filters = { clientId };
    if (unreadOnly) {
      filters.read = false;
    }

    const notifications = await clientService.getNotifications(filters, {
      page: parseInt(page),
      limit: parseInt(limit)
    });

    // Log de l'opération
    systemLogsService.info('Notifications récupérées', 'notifications', null, null, {
      clientId,
      agentId,
      count: notifications.length,
      unreadOnly
    });

    return notifications;
  }

  /**
   * Envoie des emails en masse avec validation
   * @param {Object} bulkEmailData - Données de l'email en masse
   * @param {string} agentId - ID de l'agent
   * @returns {Object} - Résultat de l'envoi
   */
  static async sendBulkEmail(bulkEmailData, agentId) {
    const { subject, message, recipients, type = 'marketing' } = bulkEmailData;

    // Validation des champs requis
    if (!subject || !message || !recipients || !Array.isArray(recipients)) {
      const error = new Error('Invalid bulk email data');
      error.code = 'INVALID_BULK_EMAIL_DATA';
      throw error;
    }

    if (recipients.length === 0) {
      const error = new Error('No recipients specified');
      error.code = 'NO_RECIPIENTS';
      throw error;
    }

    // Vérifier que l'agent existe
    const agent = await agentService.getAgentById(agentId);
    if (!agent) {
      const error = new Error('Agent not found');
      error.code = 'AGENT_NOT_FOUND';
      throw error;
    }

    // Valider les emails des destinataires
    const validEmails = recipients.filter(email => 
      typeof email === 'string' && email.includes('@')
    );

    if (validEmails.length === 0) {
      const error = new Error('No valid email addresses');
      error.code = 'NO_VALID_EMAILS';
      throw error;
    }

    // Envoyer les emails en masse
    const result = await bulkEmailService.sendBulkEmail({
      subject,
      message,
      recipients: validEmails,
      type,
      agentId
    });

    // Log de l'opération
    systemLogsService.info('Emails en masse envoyés', 'notifications', null, null, {
      agentId,
      recipientCount: validEmails.length,
      subject,
      type,
      successCount: result.successCount,
      failureCount: result.failureCount
    });

    return result;
  }

  /**
   * Marque les notifications comme lues
   * @param {Array} notificationIds - IDs des notifications
   * @param {string} agentId - ID de l'agent
   * @returns {boolean} - Succès de l'opération
   */
  static async markNotificationsAsRead(notificationIds, agentId) {
    if (!Array.isArray(notificationIds) || notificationIds.length === 0) {
      const error = new Error('Invalid notification IDs');
      error.code = 'INVALID_NOTIFICATION_IDS';
      throw error;
    }

    // Marquer comme lues
    const result = await clientService.markNotificationsAsRead(notificationIds, agentId);

    // Log de l'opération
    systemLogsService.info('Notifications marquées comme lues', 'notifications', null, null, {
      agentId,
      notificationCount: notificationIds.length
    });

    return result;
  }



  /**
   * Récupère l'historique des communications avec un client
   * @param {string} clientId - ID du client
   * @param {string} agentId - ID de l'agent
   * @param {Object} options - Options de filtrage
   * @returns {Object} - Historique des communications
   */
  static async getCommunicationHistory(clientId, agentId, options = {}) {
    const { page = 1, limit = 50, type, startDate, endDate } = options;

    // Vérifier que l'agent a accès au client
    const hasAccess = await agentService.checkAgentClientAccess(agentId, clientId);
    if (!hasAccess) {
      const error = new Error('Access denied');
      error.code = 'ACCESS_DENIED';
      throw error;
    }

    const filters = { clientId };
    if (type) filters.type = type;
    if (startDate) filters.startDate = startDate;
    if (endDate) filters.endDate = endDate;

    const [emails, messages, notifications] = await Promise.all([
      emailService.getEmailHistory(filters, { page, limit }),
      clientService.getMessageHistory(filters, { page, limit }),
      clientService.getNotificationHistory(filters, { page, limit })
    ]);

    // Combiner et trier par date
    const allCommunications = [
      ...emails.map(e => ({ ...e, communicationType: 'email' })),
      ...messages.map(m => ({ ...m, communicationType: 'message' })),
      ...notifications.map(n => ({ ...n, communicationType: 'notification' }))
    ].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    // Log de l'opération
    systemLogsService.info('Historique des communications récupéré', 'notifications', null, null, {
      clientId,
      agentId,
      totalCommunications: allCommunications.length,
      emailCount: emails.length,
      messageCount: messages.length,
      notificationCount: notifications.length
    });

    return {
      communications: allCommunications,
      summary: {
        total: allCommunications.length,
        emails: emails.length,
        messages: messages.length,
        notifications: notifications.length
      }
    };
  }

  /**
   * Envoyer une notification à un client
   * @param {string} clientId - ID du client
   * @param {Object} notificationData - Données de la notification
   * @param {string} agentId - ID de l'agent
   * @returns {Promise<Object>} - Résultat de l'envoi
   */
  static async sendNotificationToClient(clientId, notificationData, agentId) {
    const { type, priority, title, message, sendEmail, scheduledDate, actionUrl } = notificationData;

    try {
      // Validation des champs requis
      if (!title || !message) {
        const error = new Error('Title and message are required');
        error.code = 'REQUIRED_FIELDS_MISSING';
        throw error;
      }

      // Récupérer les informations du client
      const client = await clientService.getClientById(clientId);
      if (!client) {
        const error = new Error('Client not found');
        error.code = 'CLIENT_NOT_FOUND';
        throw error;
      }

      // Créer la notification système
      const notificationId = await this.createSystemNotification({
        clientId,
        agentId,
        type,
        priority,
        title,
        message,
        actionUrl,
        scheduledDate
      });

      // Envoyer un email si demandé
      if (sendEmail && client.email) {
        try {
          await this.sendEmailToClient(clientId, {
            subject: title,
            message: message,
            type: 'notification'
          }, agentId);
        } catch (emailError) {
          console.warn('Erreur lors de l\'envoi de l\'email de notification:', emailError);
          // Ne pas faire échouer la notification si l'email échoue
        }
      }

      // Enregistrer dans l'historique des communications
      await this.logCommunication({
        clientId,
        agentId,
        type: 'notification',
        content: `${title}: ${message}`,
        metadata: {
          notificationId,
          priority,
          actionUrl,
          emailSent: sendEmail
        }
      });

      return {
        success: true,
        notificationId,
        message: 'Notification envoyée avec succès'
      };

    } catch (error) {
      console.error('Erreur lors de l\'envoi de la notification:', error);
      throw error;
    }
  }

  /**
   * Envoyer une notification à plusieurs clients
   * @param {Array} clientIds - IDs des clients
   * @param {Object} notificationData - Données de la notification
   * @param {string} agentId - ID de l'agent
   * @returns {Promise<Object>} - Résultat de l'envoi groupé
   */
  static async sendBulkNotification(clientIds, notificationData, agentId) {
    try {
      const results = [];
      let successCount = 0;
      let failureCount = 0;

      for (const clientId of clientIds) {
        try {
          const result = await this.sendNotificationToClient(clientId, notificationData, agentId);
          results.push({ clientId, success: true, result });
          successCount++;
        } catch (error) {
          results.push({ clientId, success: false, error: error.message });
          failureCount++;
        }
      }

      return {
        success: true,
        successCount,
        failureCount,
        totalCount: clientIds.length,
        results,
        message: `${successCount} notifications envoyées avec succès, ${failureCount} échecs`
      };

    } catch (error) {
      console.error('Erreur lors de l\'envoi groupé de notifications:', error);
      throw error;
    }
  }

  /**
    * Créer une notification système
    * @param {Object} notificationData - Données de la notification
    * @returns {Promise<string>} - ID de la notification créée
    */
   static async createSystemNotification(notificationData) {
     const {
       clientId,
       agentId,
       type = 'info',
       title,
       message,
       actionUrl
     } = notificationData;
 
     try {
       // Utiliser la structure de table existante
       const query = `
         INSERT INTO notifications (
           user_id, type, title, message, action_url, data, created_at
         ) VALUES (?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
       `;
 
       const data = JSON.stringify({ clientId, agentId });
 
       const result = await databaseService.run(query, [
        clientId, // user_id correspond au client destinataire
        type,
        title,
        message,
        actionUrl,
        data
      ]);

      // Envoi push (non bloquant)
      try {
        const pushService = require('./pushService');
        await pushService.sendToUser(clientId, { title, body: message, url: actionUrl || '/' });
      } catch (e) {
        // Ne pas bloquer en cas d'échec
      }
 
      return result.insertId;
 
     } catch (error) {
       console.error('Erreur lors de la création de la notification système:', error);
       throw error;
     }
   }
 
   /**
    * Enregistrer une communication dans l'historique
    * @param {Object} communicationData - Données de la communication
    * @returns {Promise<string>} - ID de l'enregistrement créé
    */
   static async logCommunication(communicationData) {
     const { clientId, agentId, type, content, metadata } = communicationData;
 
     try {
       // Créer la table si elle n'existe pas
       await databaseService.run(`
         CREATE TABLE IF NOT EXISTS communication_history (
           id INTEGER PRIMARY KEY AUTOINCREMENT,
           client_id INTEGER NOT NULL,
           agent_id INTEGER NOT NULL,
           type VARCHAR(50) NOT NULL,
           content TEXT NOT NULL,
           metadata TEXT,
           created_at DATETIME DEFAULT CURRENT_TIMESTAMP
         )
       `);
 
       const query = `
         INSERT INTO communication_history (
           client_id, agent_id, type, content, metadata, created_at
         ) VALUES (?, ?, ?, ?, ?, CURRENT_TIMESTAMP)`;
 
       const result = await databaseService.run(query, [
         clientId,
         agentId,
         type,
         content,
         JSON.stringify(metadata || {})
       ]);
 
       return result.insertId;
 
     } catch (error) {
       console.error('Erreur lors de l\'enregistrement de la communication:', error);
       throw error;
     }
   }
}

module.exports = NotificationManagementService;