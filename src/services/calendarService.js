import api from './api'

/**
 * Service pour la gestion du calendrier et des événements
 */
class CalendarService {
  /**
   * Récupérer tous les événements d'un projet
   * @param {string|number} projectId - ID du projet
   * @param {Object} filters - Filtres optionnels
   * @returns {Promise<Object>} Réponse avec les événements
   */
  async getEvents(projectId, filters = {}) {
    try {
      const params = new URLSearchParams({
        project_id: projectId,
        ...filters
      })
      
      const response = await api.get(`/calendar/events?${params}`)
      return {
        success: true,
        data: response.data.events || [],
        total: response.data.total || 0
      }
    } catch (error) {
      console.error('Erreur lors de la récupération des événements:', error)
      return {
        success: false,
        error: error.response?.data?.message || 'Erreur lors de la récupération des événements'
      }
    }
  }

  /**
   * Récupérer un événement par son ID
   * @param {string|number} eventId - ID de l'événement
   * @returns {Promise<Object>} Réponse avec l'événement
   */
  async getEvent(eventId) {
    try {
      const response = await api.get(`/calendar/events/${eventId}`)
      return {
        success: true,
        data: response.data.event
      }
    } catch (error) {
      console.error('Erreur lors de la récupération de l\'événement:', error)
      return {
        success: false,
        error: error.response?.data?.message || 'Erreur lors de la récupération de l\'événement'
      }
    }
  }

  /**
   * Créer un nouvel événement
   * @param {Object} eventData - Données de l'événement
   * @returns {Promise<Object>} Réponse avec l'événement créé
   */
  async createEvent(eventData) {
    try {
      const response = await api.post('/calendar/events', eventData)
      return {
        success: true,
        data: response.data.event
      }
    } catch (error) {
      console.error('Erreur lors de la création de l\'événement:', error)
      return {
        success: false,
        error: error.response?.data?.message || 'Erreur lors de la création de l\'événement'
      }
    }
  }

  /**
   * Mettre à jour un événement
   * @param {string|number} eventId - ID de l'événement
   * @param {Object} eventData - Nouvelles données de l'événement
   * @returns {Promise<Object>} Réponse avec l'événement mis à jour
   */
  async updateEvent(eventId, eventData) {
    try {
      const response = await api.put(`/calendar/events/${eventId}`, eventData)
      return {
        success: true,
        data: response.data.event
      }
    } catch (error) {
      console.error('Erreur lors de la mise à jour de l\'événement:', error)
      return {
        success: false,
        error: error.response?.data?.message || 'Erreur lors de la mise à jour de l\'événement'
      }
    }
  }

  /**
   * Supprimer un événement
   * @param {string|number} eventId - ID de l'événement
   * @returns {Promise<Object>} Réponse de suppression
   */
  async deleteEvent(eventId) {
    try {
      await api.delete(`/calendar/events/${eventId}`)
      return {
        success: true,
        message: 'Événement supprimé avec succès'
      }
    } catch (error) {
      console.error('Erreur lors de la suppression de l\'événement:', error)
      return {
        success: false,
        error: error.response?.data?.message || 'Erreur lors de la suppression de l\'événement'
      }
    }
  }

  /**
   * Récupérer les événements pour une période donnée
   * @param {string|number} projectId - ID du projet
   * @param {string} startDate - Date de début (YYYY-MM-DD)
   * @param {string} endDate - Date de fin (YYYY-MM-DD)
   * @returns {Promise<Object>} Réponse avec les événements
   */
  async getEventsByPeriod(projectId, startDate, endDate) {
    try {
      const params = new URLSearchParams({
        project_id: projectId,
        start_date: startDate,
        end_date: endDate
      })
      
      const response = await api.get(`/calendar/events/period?${params}`)
      return {
        success: true,
        data: response.data.events || []
      }
    } catch (error) {
      console.error('Erreur lors de la récupération des événements par période:', error)
      return {
        success: false,
        error: error.response?.data?.message || 'Erreur lors de la récupération des événements'
      }
    }
  }

  /**
   * Récupérer les événements du jour
   * @param {string|number} projectId - ID du projet
   * @param {string} date - Date (YYYY-MM-DD), par défaut aujourd'hui
   * @returns {Promise<Object>} Réponse avec les événements du jour
   */
  async getTodayEvents(projectId, date = null) {
    try {
      const targetDate = date || new Date().toISOString().split('T')[0]
      const params = new URLSearchParams({
        project_id: projectId,
        date: targetDate
      })
      
      const response = await api.get(`/calendar/events/today?${params}`)
      return {
        success: true,
        data: response.data.events || []
      }
    } catch (error) {
      console.error('Erreur lors de la récupération des événements du jour:', error)
      return {
        success: false,
        error: error.response?.data?.message || 'Erreur lors de la récupération des événements du jour'
      }
    }
  }

  /**
   * Récupérer les événements à venir
   * @param {string|number} projectId - ID du projet
   * @param {number} limit - Nombre d'événements à récupérer
   * @returns {Promise<Object>} Réponse avec les événements à venir
   */
  async getUpcomingEvents(projectId, limit = 10) {
    try {
      const params = new URLSearchParams({
        project_id: projectId,
        limit: limit
      })
      
      const response = await api.get(`/calendar/events/upcoming?${params}`)
      return {
        success: true,
        data: response.data.events || []
      }
    } catch (error) {
      console.error('Erreur lors de la récupération des événements à venir:', error)
      return {
        success: false,
        error: error.response?.data?.message || 'Erreur lors de la récupération des événements à venir'
      }
    }
  }

  /**
   * Marquer un événement comme terminé
   * @param {string|number} eventId - ID de l'événement
   * @returns {Promise<Object>} Réponse de mise à jour
   */
  async markEventAsCompleted(eventId) {
    try {
      const response = await api.patch(`/calendar/events/${eventId}/complete`)
      return {
        success: true,
        data: response.data.event
      }
    } catch (error) {
      console.error('Erreur lors du marquage de l\'événement comme terminé:', error)
      return {
        success: false,
        error: error.response?.data?.message || 'Erreur lors de la mise à jour de l\'événement'
      }
    }
  }

  /**
   * Dupliquer un événement
   * @param {string|number} eventId - ID de l'événement à dupliquer
   * @param {Object} newData - Nouvelles données pour l'événement dupliqué
   * @returns {Promise<Object>} Réponse avec l'événement dupliqué
   */
  async duplicateEvent(eventId, newData = {}) {
    try {
      const response = await api.post(`/calendar/events/${eventId}/duplicate`, newData)
      return {
        success: true,
        data: response.data.event
      }
    } catch (error) {
      console.error('Erreur lors de la duplication de l\'événement:', error)
      return {
        success: false,
        error: error.response?.data?.message || 'Erreur lors de la duplication de l\'événement'
      }
    }
  }

  /**
   * Récupérer les statistiques du calendrier
   * @param {string|number} projectId - ID du projet
   * @param {string} period - Période (week, month, year)
   * @returns {Promise<Object>} Réponse avec les statistiques
   */
  async getCalendarStats(projectId, period = 'month') {
    try {
      const params = new URLSearchParams({
        project_id: projectId,
        period: period
      })
      
      const response = await api.get(`/calendar/stats?${params}`)
      return {
        success: true,
        data: response.data.stats
      }
    } catch (error) {
      console.error('Erreur lors de la récupération des statistiques:', error)
      return {
        success: false,
        error: error.response?.data?.message || 'Erreur lors de la récupération des statistiques'
      }
    }
  }

  /**
   * Rechercher des événements
   * @param {string|number} projectId - ID du projet
   * @param {string} query - Terme de recherche
   * @param {Object} filters - Filtres additionnels
   * @returns {Promise<Object>} Réponse avec les événements trouvés
   */
  async searchEvents(projectId, query, filters = {}) {
    try {
      const params = new URLSearchParams({
        project_id: projectId,
        q: query,
        ...filters
      })
      
      const response = await api.get(`/calendar/events/search?${params}`)
      return {
        success: true,
        data: response.data.events || [],
        total: response.data.total || 0
      }
    } catch (error) {
      console.error('Erreur lors de la recherche d\'événements:', error)
      return {
        success: false,
        error: error.response?.data?.message || 'Erreur lors de la recherche'
      }
    }
  }

  /**
   * Exporter le calendrier
   * @param {string|number} projectId - ID du projet
   * @param {string} format - Format d'export (ical, csv)
   * @param {Object} options - Options d'export
   * @returns {Promise<Object>} Réponse avec le fichier d'export
   */
  async exportCalendar(projectId, format = 'ical', options = {}) {
    try {
      const params = new URLSearchParams({
        project_id: projectId,
        format: format,
        ...options
      })
      
      const response = await api.get(`/calendar/export?${params}`, {
        responseType: 'blob'
      })
      
      return {
        success: true,
        data: response.data,
        filename: response.headers['content-disposition']?.split('filename=')[1] || `calendar.${format}`
      }
    } catch (error) {
      console.error('Erreur lors de l\'export du calendrier:', error)
      return {
        success: false,
        error: error.response?.data?.message || 'Erreur lors de l\'export'
      }
    }
  }

  /**
   * Importer des événements
   * @param {string|number} projectId - ID du projet
   * @param {File} file - Fichier à importer
   * @param {Object} options - Options d'import
   * @returns {Promise<Object>} Réponse d'import
   */
  async importEvents(projectId, file, options = {}) {
    try {
      const formData = new FormData()
      formData.append('file', file)
      formData.append('project_id', projectId)
      
      Object.keys(options).forEach(key => {
        formData.append(key, options[key])
      })
      
      const response = await api.post('/calendar/import', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      })
      
      return {
        success: true,
        data: response.data
      }
    } catch (error) {
      console.error('Erreur lors de l\'import d\'événements:', error)
      return {
        success: false,
        error: error.response?.data?.message || 'Erreur lors de l\'import'
      }
    }
  }
}

// Créer une instance unique du service
const calendarService = new CalendarService()

export default calendarService