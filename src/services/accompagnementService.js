import api from './api'

// Service pour la gestion de l'accompagnement Fusepoint
export const accompagnementService = {
  // Gestion des services
  async getServices(options = {}) {
    try {
      const { activeOnly = true } = options
      const response = await api.get('/api/accompagnement/services', { params: { activeOnly } })
      return response.data
    } catch (error) {
      console.error('Erreur lors de la récupération des services:', error)
      throw error
    }
  },

  async createService(serviceData) {
    try {
      const response = await api.post('/api/accompagnement/services', serviceData)
      return response.data
    } catch (error) {
      console.error('Erreur lors de la création du service:', error)
      throw error
    }
  },

  // Ajout: récupérer un service par ID
  async getServiceById(serviceId) {
    try {
      const response = await api.get(`/api/accompagnement/services/${serviceId}`)
      return response.data
    } catch (error) {
      console.error('Erreur lors de la récupération du service:', error)
      throw error
    }
  },

  // Ajout: mettre à jour un service
  async updateService(serviceId, serviceData) {
    try {
      const response = await api.put(`/api/accompagnement/services/${serviceId}`, serviceData)
      return response.data
    } catch (error) {
      console.error('Erreur lors de la mise à jour du service:', error)
      throw error
    }
  },

  // Ajout: supprimer un service
  async deleteService(serviceId) {
    try {
      const response = await api.delete(`/api/accompagnement/services/${serviceId}`)
      return response.data
    } catch (error) {
      console.error('Erreur lors de la suppression du service:', error)
      throw error
    }
  },

  // Gestion des demandes de service
  async getServiceRequests() {
    try {
      const response = await api.get('/api/accompagnement/requests')
      return response.data
    } catch (error) {
      console.error('Erreur lors de la récupération des demandes:', error)
      throw error
    }
  },

  async createServiceRequest(requestData) {
    try {
      const response = await api.post('/api/accompagnement/requests', requestData)
      return response.data
    } catch (error) {
      console.error('Erreur lors de la création de la demande:', error)
      throw error
    }
  },

  async updateServiceRequestStatus(requestId, status) {
    try {
      const response = await api.patch(`/api/accompagnement/requests/${requestId}/status`, { status })
      return response.data
    } catch (error) {
      console.error('Erreur lors de la mise à jour du statut:', error)
      throw error
    }
  },

  // Gestion des conversations
  async getConversations(params = {}) {
    try {
      const response = await api.get('/api/accompagnement/conversations', { params })
      return response.data
    } catch (error) {
      console.error('Erreur lors de la récupération des conversations:', error)
      throw error
    }
  },

  async getMessages(conversationId) {
    try {
      const response = await api.get(`/api/accompagnement/conversations/${conversationId}/messages`)
      return response.data
    } catch (error) {
      console.error('Erreur lors de la récupération des messages:', error)
      throw error
    }
  },

  async sendMessage(conversationId, messageData) {
    try {
      const response = await api.post(`/api/accompagnement/conversations/${conversationId}/messages`, messageData)
      return response.data
    } catch (error) {
      console.error('Erreur lors de l\'envoi du message:', error)
      throw error
    }
  },

  async markAsRead(conversationId) {
    try {
      const response = await api.post(`/api/accompagnement/conversations/${conversationId}/read`)
      return response.data
    } catch (error) {
      console.error('Erreur lors du marquage comme lu:', error)
      throw error
    }
  },

  // Gestion des recommandations
  async getRecommendations() {
    try {
      const response = await api.get('/api/accompagnement/recommendations')
      return response.data
    } catch (error) {
      console.error('Erreur lors de la récupération des recommandations:', error)
      throw error
    }
  },

  async updateRecommendationStatus(recommendationId, status) {
    try {
      const response = await api.patch(`/api/accompagnement/recommendations/${recommendationId}/status`, { status })
      return response.data
    } catch (error) {
      console.error('Erreur lors de la mise à jour de la recommandation:', error)
      throw error
    }
  },

  async scheduleRecommendation(recommendationId, scheduleData) {
    try {
      const response = await api.post(`/api/accompagnement/recommendations/${recommendationId}/schedule`, scheduleData)
      return response.data
    } catch (error) {
      console.error('Erreur lors de la planification:', error)
      throw error
    }
  },

  async applyRecommendation(recommendationId) {
    try {
      const response = await api.post(`/api/accompagnement/recommendations/${recommendationId}/apply`)
      return response.data
    } catch (error) {
      console.error('Erreur lors de l\'application de la recommandation:', error)
      throw error
    }
  },

  // Gestion des rendez-vous
  async getAppointments() {
    try {
      const response = await api.get('/api/accompagnement/appointments')
      return response.data
    } catch (error) {
      console.error('Erreur lors de la récupération des rendez-vous:', error)
      throw error
    }
  },

  async createAppointment(appointmentData) {
    try {
      const response = await api.post('/api/accompagnement/appointments', appointmentData)
      return response.data
    } catch (error) {
      console.error('Erreur lors de la création du rendez-vous:', error)
      throw error
    }
  },

  // Gestion des notifications
  async getNotifications() {
    try {
      const response = await api.get('/api/accompagnement/notifications')
      // Adapter la réponse pour le composant NotificationCenter
      return {
        data: response.data?.data || [],
        hasMore: response.data?.pagination?.hasMore || false
      }
    } catch (error) {
      console.error('Erreur lors de la récupération des notifications:', error)
      throw error
    }
  },

  async markNotificationAsRead(notificationId) {
    try {
      const response = await api.put(`/api/accompagnement/notifications/${notificationId}/read`)
      return response.data
    } catch (error) {
      console.error('Erreur lors du marquage de la notification comme lue:', error)
      throw error
    }
  },

  async createTestNotification() {
    try {
      const response = await api.post('/api/accompagnement/notifications/test')
      return response.data
    } catch (error) {
      console.error('Erreur lors de la création de la notification de test:', error)
      throw error
    }
  },

  // Gestion des statistiques
  async getStats() {
    try {
      const response = await api.get('/api/accompagnement/stats')
      return response.data
    } catch (error) {
      console.error('Erreur lors de la récupération des statistiques:', error)
      throw error
    }
  },

  async getMetrics() {
    try {
      const response = await api.get('/api/accompagnement/metrics')
      return response.data
    } catch (error) {
      console.error('Erreur lors de la récupération des métriques:', error)
      throw error
    }
  }
}

export default accompagnementService