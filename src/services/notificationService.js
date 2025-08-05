/**
 * Service de gestion des notifications côté frontend
 * Centralise la logique d'envoi et de gestion des notifications
 */

import api from './api'
import { NOTIFICATION_TYPES, NOTIFICATION_PRIORITIES } from '@/constants/notificationMessages'

class NotificationService {
  constructor() {
    this.baseUrl = '/api/agent'
  }

  /**
   * Envoie une notification à un client spécifique
   * @param {string} clientId - ID du client
   * @param {Object} notificationData - Données de la notification
   * @returns {Promise<Object>} - Résultat de l'envoi
   */
  async sendToClient(clientId, notificationData) {
    try {
      const response = await api.post(`${this.baseUrl}/clients/${clientId}/notification`, {
        type: notificationData.type || NOTIFICATION_TYPES.INFO,
        priority: notificationData.priority || NOTIFICATION_PRIORITIES.NORMAL,
        title: notificationData.title,
        message: notificationData.message,
        sendEmail: notificationData.sendEmail || false,
        actionUrl: notificationData.actionUrl || null,
        scheduledDate: notificationData.scheduledDate || null
      })
      
      return {
        success: true,
        data: response.data
      }
    } catch (error) {
      console.error('Erreur lors de l\'envoi de la notification:', error)
      return {
        success: false,
        error: error.response?.data?.message || 'Erreur lors de l\'envoi de la notification'
      }
    }
  }

  /**
   * Envoie des notifications à plusieurs clients
   * @param {Array} clientIds - Liste des IDs des clients
   * @param {Object} notificationData - Données de la notification
   * @returns {Promise<Object>} - Résultat de l'envoi groupé
   */
  async sendToMultipleClients(clientIds, notificationData) {
    try {
      const response = await api.post(`${this.baseUrl}/clients/bulk-notification`, {
        clientIds,
        type: notificationData.type || NOTIFICATION_TYPES.INFO,
        priority: notificationData.priority || NOTIFICATION_PRIORITIES.NORMAL,
        title: notificationData.title,
        message: notificationData.message,
        sendEmail: notificationData.sendEmail || false,
        scheduledDate: notificationData.scheduledDate || null,
        actionUrl: notificationData.actionUrl || null
      })
      
      return {
        success: true,
        data: response.data
      }
    } catch (error) {
      console.error('Erreur lors de l\'envoi groupé de notifications:', error)
      return {
        success: false,
        error: error.response?.data?.message || error.message || 'Erreur lors de l\'envoi groupé'
      }
    }
  }

  /**
   * Envoie un email à un client spécifique
   * @param {string} clientId - ID du client
   * @param {Object} emailData - Données de l'email
   * @returns {Promise<Object>} - Résultat de l'envoi
   */
  async sendEmailToClient(clientId, emailData) {
    try {
      const response = await api.post(`${this.baseUrl}/clients/${clientId}/email`, {
        subject: emailData.subject,
        message: emailData.message || emailData.content
      })
      
      return {
        success: true,
        data: response.data
      }
    } catch (error) {
      console.error('Erreur lors de l\'envoi de l\'email:', error)
      return {
        success: false,
        error: error.response?.data?.message || 'Erreur lors de l\'envoi de l\'email'
      }
    }
  }

  /**
   * Envoie des emails à plusieurs clients
   * @param {Array} clientIds - Liste des IDs des clients
   * @param {Object} emailData - Données de l'email
   * @returns {Promise<Object>} - Résultat de l'envoi groupé
   */
  async sendEmailToMultipleClients(clientIds, emailData) {
    try {
      const promises = clientIds.map(clientId => 
        this.sendEmailToClient(clientId, emailData)
      )
      
      const results = await Promise.allSettled(promises)
      
      const successResults = results.filter(result => 
        result.status === 'fulfilled' && result.value.success
      )
      const failureResults = results.filter(result => 
        result.status === 'rejected' || !result.value.success
      )
      
      return {
        success: successResults.length > 0,
        successCount: successResults.length,
        failureCount: failureResults.length,
        total: clientIds.length,
        results: results
      }
    } catch (error) {
      console.error('Erreur lors de l\'envoi des emails groupés:', error)
      return {
        success: false,
        error: 'Erreur lors de l\'envoi des emails groupés'
      }
    }
  }

  /**
   * Récupère les notifications d'un client
   * @param {string} clientId - ID du client
   * @param {Object} options - Options de pagination et filtrage
   * @returns {Promise<Object>} - Liste des notifications
   */
  async getClientNotifications(clientId, options = {}) {
    try {
      const params = new URLSearchParams()
      
      if (options.page) params.append('page', options.page)
      if (options.limit) params.append('limit', options.limit)
      if (options.unreadOnly) params.append('unreadOnly', options.unreadOnly)
      if (options.type) params.append('type', options.type)
      
      const response = await api.get(`${this.baseUrl}/clients/${clientId}/notifications?${params}`)
      
      return {
        success: true,
        data: response.data
      }
    } catch (error) {
      console.error('Erreur lors de la récupération des notifications:', error)
      return {
        success: false,
        error: error.response?.data?.message || 'Erreur lors de la récupération des notifications'
      }
    }
  }

  /**
   * Marque des notifications comme lues
   * @param {Array} notificationIds - IDs des notifications
   * @returns {Promise<Object>} - Résultat de l'opération
   */
  async markAsRead(notificationIds) {
    try {
      const response = await api.post(`${this.baseUrl}/notifications/mark-read`, {
        notificationIds
      })
      
      return {
        success: true,
        data: response.data
      }
    } catch (error) {
      console.error('Erreur lors du marquage des notifications:', error)
      return {
        success: false,
        error: error.response?.data?.message || 'Erreur lors du marquage des notifications'
      }
    }
  }

  /**
   * Crée une notification système
   * @param {Object} notificationData - Données de la notification système
   * @returns {Promise<Object>} - Résultat de la création
   */
  async createSystemNotification(notificationData) {
    try {
      const response = await api.post(`${this.baseUrl}/notifications/system`, {
        title: notificationData.title,
        message: notificationData.message,
        type: notificationData.type || NOTIFICATION_TYPES.INFO,
        priority: notificationData.priority || NOTIFICATION_PRIORITIES.NORMAL,
        recipients: notificationData.recipients || [],
        actionUrl: notificationData.actionUrl || null
      })
      
      return {
        success: true,
        data: response.data
      }
    } catch (error) {
      console.error('Erreur lors de la création de la notification système:', error)
      return {
        success: false,
        error: error.response?.data?.message || 'Erreur lors de la création de la notification système'
      }
    }
  }

  /**
   * Récupère l'historique des communications avec un client
   * @param {string} clientId - ID du client
   * @param {Object} options - Options de filtrage
   * @returns {Promise<Object>} - Historique des communications
   */
  async getCommunicationHistory(clientId, options = {}) {
    try {
      const params = new URLSearchParams()
      
      if (options.page) params.append('page', options.page)
      if (options.limit) params.append('limit', options.limit)
      if (options.type) params.append('type', options.type)
      if (options.startDate) params.append('startDate', options.startDate)
      if (options.endDate) params.append('endDate', options.endDate)
      
      const response = await api.get(`${this.baseUrl}/clients/${clientId}/communications?${params}`)
      
      return {
        success: true,
        data: response.data
      }
    } catch (error) {
      console.error('Erreur lors de la récupération de l\'historique:', error)
      return {
        success: false,
        error: error.response?.data?.message || 'Erreur lors de la récupération de l\'historique'
      }
    }
  }

  /**
   * Valide les données d'une notification
   * @param {Object} notificationData - Données à valider
   * @returns {Object} - Résultat de la validation
   */
  validateNotificationData(notificationData) {
    const errors = []
    
    if (!notificationData.title || notificationData.title.trim() === '') {
      errors.push('Le titre est requis')
    }
    
    if (!notificationData.message || notificationData.message.trim() === '') {
      errors.push('Le message est requis')
    }
    
    if (notificationData.type && !Object.values(NOTIFICATION_TYPES).includes(notificationData.type)) {
      errors.push('Type de notification invalide')
    }
    
    if (notificationData.priority && !Object.values(NOTIFICATION_PRIORITIES).includes(notificationData.priority)) {
      errors.push('Priorité invalide')
    }
    
    if (notificationData.actionUrl && !this.isValidUrl(notificationData.actionUrl)) {
      errors.push('URL d\'action invalide')
    }
    
    if (notificationData.scheduledDate && new Date(notificationData.scheduledDate) <= new Date()) {
      errors.push('La date de programmation doit être dans le futur')
    }
    
    return {
      isValid: errors.length === 0,
      errors
    }
  }

  /**
   * Valide une URL
   * @param {string} url - URL à valider
   * @returns {boolean} - True si l'URL est valide
   */
  isValidUrl(url) {
    try {
      new URL(url)
      return true
    } catch {
      return false
    }
  }
}

// Instance singleton
const notificationService = new NotificationService()
export default notificationService