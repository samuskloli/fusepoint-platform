/**
 * Service de gestion des emails groupés
 * Centralise toute la logique métier liée aux envois d'emails en masse
 */

const databaseService = require('./databaseService');
const emailService = require('./emailService');
const translationService = require('./translationService');
const validationService = require('./validationService');

class BulkEmailService {
  /**
   * Envoie un email à plusieurs clients
   * @param {Array} clientIds - IDs des clients
   * @param {string} subject - Sujet de l'email
   * @param {string} content - Contenu de l'email
   * @param {number} agentId - ID de l'agent expéditeur
   * @returns {Object} - Résultat de l'envoi
   */
  async sendBulkEmail(clientIds, subject, content, agentId) {
    try {
      // Validation des paramètres
      if (!clientIds || !Array.isArray(clientIds) || clientIds.length === 0) {
        throw new Error('Liste de clients requise');
      }
      
      if (!subject || !content) {
        throw new Error('Sujet et contenu requis');
      }
      
      // Récupérer les informations de l'agent
      const agent = await databaseService.get(
        'SELECT first_name, last_name, email FROM users WHERE id = ? AND role = "agent"',
        [agentId]
      );
      
      if (!agent) {
        throw new Error('Agent not found');
      }
      
      // Récupérer les clients
      const placeholders = clientIds.map(() => '?').join(',');
      const clients = await databaseService.query(
        `SELECT id, first_name, last_name, email FROM users 
         WHERE id IN (${placeholders}) AND role IN ('user', 'client')`,
        clientIds
      );
      
      if (clients.length === 0) {
        throw new Error('No clients found');
      }
      
      const agentName = `${agent.first_name} ${agent.last_name}`;
      let successCount = 0;
      let errorCount = 0;
      
      // Envoyer l'email à chaque client
      for (const client of clients) {
        try {
          const clientName = `${client.first_name} ${client.last_name}`;
          
          await emailService.sendAgentEmail({
            to: client.email,
            subject: subject,
            content: content,
            clientName: clientName,
            agentName: agentName,
            agentEmail: agent.email
          });
          
          successCount++;
        } catch (emailError) {
          console.error(`❌ Erreur envoi email à ${client.email}:`, emailError);
          errorCount++;
        }
      }
      
      return {
        sent: successCount,
        failed: errorCount,
        total: clients.length,
        message: `Emails envoyés: ${successCount} réussis, ${errorCount} échecs`
      };
    } catch (error) {
      console.error('❌ Erreur lors de l\'envoi d\'emails groupés:', error);
      throw error;
    }
  }

  /**
   * Attribution automatique d'un agent à un client
   * @param {number} clientId - ID du client
   * @returns {Object} - Résultat de l'attribution
   */
  async autoAssignAgent(clientId) {
    try {
      // Vérifier que le client existe
      const client = await databaseService.get(
        'SELECT id, first_name, last_name, email, agent_id FROM users WHERE id = ? AND role IN ("user", "client")',
        [clientId]
      );
      
      if (!client) {
        throw new Error('Client not found');
      }
      
      // Vérifier si le client a déjà un agent attribué
      if (client.agent_id) {
        const existingAgent = await databaseService.get(
          'SELECT first_name, last_name, email FROM users WHERE id = ? AND role = "agent"',
          [client.agent_id]
        );
        
        if (existingAgent) {
          throw new Error('Client already has assigned agent');
        }
      }
      
      // Trouver un agent disponible (celui qui a le moins de clients)
      const availableAgent = await databaseService.get(`
        SELECT 
          u.id,
          u.first_name,
          u.last_name,
          u.email,
          COUNT(assigned.id) as client_count
        FROM users u
        LEFT JOIN users assigned ON assigned.agent_id = u.id AND assigned.role IN ('user', 'client')
        WHERE u.role = 'agent' AND u.is_active = 1
        GROUP BY u.id, u.first_name, u.last_name, u.email
        ORDER BY client_count ASC, u.created_at ASC
        LIMIT 1
      `);
      
      if (!availableAgent) {
        throw new Error('No available agent');
      }
      
      // Attribuer l'agent au client
      await databaseService.run(
        'UPDATE users SET agent_id = ?, updated_at = NOW() WHERE id = ?',
        [availableAgent.id, clientId]
      );
      
      // Créer une entrée dans agent_prestataires pour la compatibilité
      await databaseService.run(`
        INSERT INTO agent_prestataires 
        (agent_id, prestataire_id, status, assigned_at, created_at, updated_at)
        VALUES (?, ?, 'active', NOW(), NOW(), NOW())
        ON DUPLICATE KEY UPDATE 
        status = VALUES(status), assigned_at = VALUES(assigned_at), updated_at = VALUES(updated_at)
      `, [availableAgent.id, clientId]);
      
      return {
        agent: {
          id: availableAgent.id,
          first_name: availableAgent.first_name,
          last_name: availableAgent.last_name,
          email: availableAgent.email
        },
        client: {
          id: client.id,
          first_name: client.first_name,
          last_name: client.last_name,
          email: client.email
        },
        message: `Agent ${availableAgent.first_name} ${availableAgent.last_name} attribué avec succès`
      };
    } catch (error) {
      console.error('❌ Erreur lors de l\'attribution automatique:', error);
      throw error;
    }
  }
}

module.exports = new BulkEmailService();