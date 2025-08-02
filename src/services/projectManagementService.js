import api from './api'

class ProjectManagementService {
  // Gestion des projets
  async createProject(clientId, projectData) {
    try {
      const response = await api.post(`/api/agent/clients/${clientId}/projects`, projectData)
      return { success: true, data: response.data }
    } catch (error) {
      console.error('Erreur lors de la création du projet:', error)
      return { success: false, error: error.response?.data?.message || 'Erreur lors de la création du projet' }
    }
  }

  async updateProject(projectId, projectData) {
    try {
      const response = await api.put(`/api/agent/projects/${projectId}`, projectData)
      return { success: true, data: response.data }
    } catch (error) {
      console.error('Erreur lors de la mise à jour du projet:', error)
      return { success: false, error: error.response?.data?.message || 'Erreur lors de la mise à jour du projet' }
    }
  }

  async deleteProject(projectId) {
    try {
      await api.delete(`/api/agent/projects/${projectId}`)
      return { success: true }
    } catch (error) {
      console.error('Erreur lors de la suppression du projet:', error)
      return { success: false, error: error.response?.data?.message || 'Erreur lors de la suppression du projet' }
    }
  }

  async duplicateProject(projectId) {
    try {
      const response = await api.post(`/api/agent/projects/${projectId}/duplicate`)
      return { success: true, data: response.data }
    } catch (error) {
      console.error('Erreur lors de la duplication du projet:', error)
      return { success: false, error: error.response?.data?.message || 'Erreur lors de la duplication du projet' }
    }
  }

  async getProjectDetails(projectId) {
    try {
      console.log('🔍 Debug - Appel API getProjectDetails pour projectId:', projectId)
      const response = await api.get(`/api/agent/projects/${projectId}`)
      console.log('🔍 Debug - Réponse API getProjectDetails:', response)
      
      // L'API retourne { success: true, data: {...} }, donc on accède à response.data.data
      if (response.data && response.data.success && response.data.data) {
        return { success: true, data: response.data.data }
      } else {
        console.error('❌ Structure de réponse inattendue:', response.data)
        return { success: false, error: 'Structure de réponse inattendue' }
      }
    } catch (error) {
      console.error('❌ Erreur lors de la récupération des détails du projet:', {
        message: error.message,
        status: error.response?.status,
        statusText: error.response?.statusText,
        data: error.response?.data,
        url: error.config?.url
      })
      return { success: false, error: error.response?.data?.message || error.message || 'Erreur lors de la récupération des détails du projet' }
    }
  }

  // Méthodes spécifiques aux projets individuels
  async getProjectTasks(projectId) {
    try {
      console.log('🔍 Debug - Appel API getProjectTasks pour projectId:', projectId)
      const response = await api.get(`/api/agent/projects/${projectId}/tasks`)
      console.log('🔍 Debug - Réponse API getProjectTasks:', response)
      
      // L'API retourne { success: true, data: [...] }, donc on accède à response.data.data
      if (response.data && response.data.success && Array.isArray(response.data.data)) {
        return { success: true, data: response.data.data }
      } else {
        console.error('❌ Structure de réponse inattendue pour les tâches:', response.data)
        return { success: true, data: [] } // Retourner un tableau vide si pas de tâches
      }
    } catch (error) {
      console.error('❌ Erreur lors de la récupération des tâches du projet:', {
        message: error.message,
        status: error.response?.status,
        statusText: error.response?.statusText,
        data: error.response?.data,
        url: error.config?.url
      })
      return { success: false, error: error.response?.data?.message || error.message || 'Erreur lors de la récupération des tâches du projet' }
    }
  }

  async getProjectFiles(projectId) {
    try {
      const response = await api.get(`/api/agent/projects/${projectId}/files`)
      
      // L'API retourne { success: true, data: [...] }, donc on accède à response.data.data
      if (response.data && response.data.success && Array.isArray(response.data.data)) {
        return { success: true, data: response.data.data }
      } else {
        return { success: true, data: [] } // Retourner un tableau vide si pas de fichiers
      }
    } catch (error) {
      console.error('Erreur lors de la récupération des fichiers du projet:', error)
      return { success: false, error: error.response?.data?.message || 'Erreur lors de la récupération des fichiers du projet' }
    }
  }

  async getProjectTeamMembers(projectId) {
    try {
      const response = await api.get(`/api/agent/projects/${projectId}/team`)
      
      // L'API retourne { success: true, data: [...] }, donc on accède à response.data.data
      if (response.data && response.data.success && Array.isArray(response.data.data)) {
        return { success: true, data: response.data.data }
      } else {
        return { success: true, data: [] } // Retourner un tableau vide si pas de membres
      }
    } catch (error) {
      console.error('Erreur lors de la récupération des membres de l\'équipe du projet:', error)
      return { success: false, error: error.response?.data?.message || 'Erreur lors de la récupération des membres de l\'équipe du projet' }
    }
  }

  async createTask(projectId, taskData) {
    try {
      const response = await api.post(`/api/agent/projects/${projectId}/tasks`, taskData)
      return { success: true, data: response.data }
    } catch (error) {
      console.error('Erreur lors de la création de la tâche:', error)
      return { success: false, error: error.response?.data?.message || 'Erreur lors de la création de la tâche' }
    }
  }

  async uploadFile(projectId, fileData) {
    try {
      const formData = new FormData()
      formData.append('file', fileData.file)
      formData.append('description', fileData.description || '')
      
      const response = await api.post(`/api/agent/projects/${projectId}/files`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      })
      return { success: true, data: response.data }
    } catch (error) {
      console.error('Erreur lors du téléchargement du fichier:', error)
      return { success: false, error: error.response?.data?.message || 'Erreur lors du téléchargement du fichier' }
    }
  }

  async inviteProvider(projectId, providerData) {
    try {
      const response = await api.post(`/api/agent/projects/${projectId}/team/invite`, providerData)
      return { success: true, data: response.data }
    } catch (error) {
      console.error('Erreur lors de l\'invitation du prestataire:', error)
      return { success: false, error: error.response?.data?.message || 'Erreur lors de l\'invitation du prestataire' }
    }
  }

  async removeMember(projectId, memberId) {
    try {
      await api.delete(`/api/agent/projects/${projectId}/team/members/${memberId}`)
      return { success: true }
    } catch (error) {
      console.error('Erreur lors de la suppression du membre:', error)
      return { success: false, error: error.response?.data?.message || 'Erreur lors de la suppression du membre' }
    }
  }

  async updateMemberRole(projectId, memberId, role) {
    try {
      const response = await api.put(`/api/agent/projects/${projectId}/team/members/${memberId}/role`, { role })
      return { success: true, data: response.data }
    } catch (error) {
      console.error('Erreur lors de la mise à jour du rôle:', error)
      return { success: false, error: error.response?.data?.message || 'Erreur lors de la mise à jour du rôle' }
    }
  }

  // Gestion des tâches
  async getTasks(clientId) {
    try {
      const response = await api.get(`/api/agent/clients/${clientId}/tasks`)
      return { success: true, data: response.data }
    } catch (error) {
      console.error('Erreur lors de la récupération des tâches:', error)
      return { success: false, error: error.response?.data?.message || 'Erreur lors de la récupération des tâches' }
    }
  }

  async createTask(clientId, taskData) {
    try {
      const response = await api.post(`/api/agent/clients/${clientId}/tasks`, taskData)
      return { success: true, data: response.data }
    } catch (error) {
      console.error('Erreur lors de la création de la tâche:', error)
      return { success: false, error: error.response?.data?.message || 'Erreur lors de la création de la tâche' }
    }
  }

  async updateTask(taskId, taskData) {
    try {
      const response = await api.put(`/api/agent/tasks/${taskId}`, taskData)
      return { success: true, data: response.data }
    } catch (error) {
      console.error('Erreur lors de la mise à jour de la tâche:', error)
      return { success: false, error: error.response?.data?.message || 'Erreur lors de la mise à jour de la tâche' }
    }
  }

  async deleteTask(taskId) {
    try {
      await api.delete(`/api/agent/tasks/${taskId}`)
      return { success: true }
    } catch (error) {
      console.error('Erreur lors de la suppression de la tâche:', error)
      return { success: false, error: error.response?.data?.message || 'Erreur lors de la suppression de la tâche' }
    }
  }

  async assignTask(taskId, assigneeId) {
    try {
      const response = await api.put(`/api/agent/tasks/${taskId}/assign`, { assignee_id: assigneeId })
      return { success: true, data: response.data }
    } catch (error) {
      console.error('Erreur lors de l\'attribution de la tâche:', error)
      return { success: false, error: error.response?.data?.message || 'Erreur lors de l\'attribution de la tâche' }
    }
  }

  async updateTaskStatus(taskId, status) {
    try {
      const response = await api.put(`/api/agent/tasks/${taskId}/status`, { status })
      return { success: true, data: response.data }
    } catch (error) {
      console.error('Erreur lors de la mise à jour du statut de la tâche:', error)
      return { success: false, error: error.response?.data?.message || 'Erreur lors de la mise à jour du statut de la tâche' }
    }
  }

  // Gestion des fichiers
  async getFiles(clientId) {
    try {
      const response = await api.get(`/api/agent/clients/${clientId}/files`)
      return { success: true, data: response.data }
    } catch (error) {
      console.error('Erreur lors de la récupération des fichiers:', error)
      return { success: false, error: error.response?.data?.message || 'Erreur lors de la récupération des fichiers' }
    }
  }

  async uploadFile(clientId, fileData) {
    try {
      const formData = new FormData()
      formData.append('file', fileData.file)
      formData.append('project_id', fileData.project_id)
      formData.append('description', fileData.description || '')
      
      const response = await api.post(`/api/agent/clients/${clientId}/files`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      })
      return { success: true, data: response.data }
    } catch (error) {
      console.error('Erreur lors du téléchargement du fichier:', error)
      return { success: false, error: error.response?.data?.message || 'Erreur lors du téléchargement du fichier' }
    }
  }

  async deleteFile(fileId) {
    try {
      await api.delete(`/api/agent/files/${fileId}`)
      return { success: true }
    } catch (error) {
      console.error('Erreur lors de la suppression du fichier:', error)
      return { success: false, error: error.response?.data?.message || 'Erreur lors de la suppression du fichier' }
    }
  }

  async downloadFile(fileId) {
    try {
      const response = await api.get(`/api/agent/files/${fileId}/download`, {
        responseType: 'blob'
      })
      
      // Créer un lien de téléchargement
      const url = window.URL.createObjectURL(new Blob([response.data]))
      const link = document.createElement('a')
      link.href = url
      
      // Extraire le nom du fichier depuis les headers
      const contentDisposition = response.headers['content-disposition']
      let filename = 'download'
      if (contentDisposition) {
        const filenameMatch = contentDisposition.match(/filename="(.+)"/)
        if (filenameMatch) {
          filename = filenameMatch[1]
        }
      }
      
      link.setAttribute('download', filename)
      document.body.appendChild(link)
      link.click()
      link.remove()
      window.URL.revokeObjectURL(url)
      
      return { success: true }
    } catch (error) {
      console.error('Erreur lors du téléchargement du fichier:', error)
      return { success: false, error: error.response?.data?.message || 'Erreur lors du téléchargement du fichier' }
    }
  }

  // Gestion de l'équipe
  async getTeamMembers(clientId) {
    try {
      const response = await api.get(`/api/agent/clients/${clientId}/team`)
      return { success: true, data: response.data }
    } catch (error) {
      console.error('Erreur lors de la récupération des membres de l\'équipe:', error)
      return { success: false, error: error.response?.data?.message || 'Erreur lors de la récupération des membres de l\'équipe' }
    }
  }

  async getAvailableProviders() {
    try {
      const response = await api.get('/api/agent/providers/available')
      return { success: true, data: response.data }
    } catch (error) {
      console.error('Erreur lors de la récupération des prestataires disponibles:', error)
      return { success: false, error: error.response?.data?.message || 'Erreur lors de la récupération des prestataires disponibles' }
    }
  }

  async inviteProvider(clientId, providerData) {
    try {
      const response = await api.post(`/api/agent/clients/${clientId}/team/invite`, providerData)
      return { success: true, data: response.data }
    } catch (error) {
      console.error('Erreur lors de l\'invitation du prestataire:', error)
      return { success: false, error: error.response?.data?.message || 'Erreur lors de l\'invitation du prestataire' }
    }
  }

  async removeMember(memberId) {
    try {
      await api.delete(`/api/agent/team/members/${memberId}`)
      return { success: true }
    } catch (error) {
      console.error('Erreur lors de la suppression du membre:', error)
      return { success: false, error: error.response?.data?.message || 'Erreur lors de la suppression du membre' }
    }
  }

  async updateMemberRole(memberId, newRole) {
    try {
      const response = await api.put(`/api/agent/team/members/${memberId}/role`, { role: newRole })
      return { success: true, data: response.data }
    } catch (error) {
      console.error('Erreur lors de la mise à jour du rôle:', error)
      return { success: false, error: error.response?.data?.message || 'Erreur lors de la mise à jour du rôle' }
    }
  }

  async updateMemberPermissions(memberId, permissions) {
    try {
      const response = await api.put(`/api/agent/team/members/${memberId}/permissions`, { permissions })
      return { success: true, data: response.data }
    } catch (error) {
      console.error('Erreur lors de la mise à jour des permissions:', error)
      return { success: false, error: error.response?.data?.message || 'Erreur lors de la mise à jour des permissions' }
    }
  }

  // Méthodes pour la gestion des événements
  async createEventAdvanced(projectId, eventData) {
    try {
      const response = await api.post(`/api/agent/projects/${projectId}/events`, eventData)
      return { success: true, data: response.data }
    } catch (error) {
      console.error('Erreur lors de la création de l\'événement:', error)
      return { success: false, error: error.response?.data?.message || 'Erreur lors de la création de l\'événement' }
    }
  }

  async updateEventAdvanced(projectId, eventId, eventData) {
    try {
      const response = await api.put(`/api/agent/projects/${projectId}/events/${eventId}`, eventData)
      return { success: true, data: response.data }
    } catch (error) {
      console.error('Erreur lors de la mise à jour de l\'événement:', error)
      return { success: false, error: error.response?.data?.message || 'Erreur lors de la mise à jour de l\'événement' }
    }
  }

  async deleteEventAdvanced(projectId, eventId) {
    try {
      await api.delete(`/api/agent/projects/${projectId}/events/${eventId}`)
      return { success: true }
    } catch (error) {
      console.error('Erreur lors de la suppression de l\'événement:', error)
      return { success: false, error: error.response?.data?.message || 'Erreur lors de la suppression de l\'événement' }
    }
  }

  async getEventsAdvanced(projectId) {
    try {
      const response = await api.get(`/api/agent/projects/${projectId}/events`)
      return { success: true, data: response.data }
    } catch (error) {
      console.error('Erreur lors de la récupération des événements:', error)
      return { success: false, error: error.response?.data?.message || 'Erreur lors de la récupération des événements' }
    }
  }

  // Gestion du calendrier
  async getEvents(clientId) {
    try {
      const response = await api.get(`/api/agent/clients/${clientId}/events`)
      return { success: true, data: response.data }
    } catch (error) {
      console.error('Erreur lors de la récupération des événements:', error)
      return { success: false, error: error.response?.data?.message || 'Erreur lors de la récupération des événements' }
    }
  }

  async createEvent(clientId, eventData) {
    try {
      const response = await api.post(`/api/agent/clients/${clientId}/events`, eventData)
      return { success: true, data: response.data }
    } catch (error) {
      console.error('Erreur lors de la création de l\'événement:', error)
      return { success: false, error: error.response?.data?.message || 'Erreur lors de la création de l\'événement' }
    }
  }

  async updateEvent(eventId, eventData) {
    try {
      const response = await api.put(`/api/agent/events/${eventId}`, eventData)
      return { success: true, data: response.data }
    } catch (error) {
      console.error('Erreur lors de la mise à jour de l\'événement:', error)
      return { success: false, error: error.response?.data?.message || 'Erreur lors de la mise à jour de l\'événement' }
    }
  }

  async deleteEvent(eventId) {
    try {
      await api.delete(`/api/agent/events/${eventId}`)
      return { success: true }
    } catch (error) {
      console.error('Erreur lors de la suppression de l\'événement:', error)
      return { success: false, error: error.response?.data?.message || 'Erreur lors de la suppression de l\'événement' }
    }
  }

  // Rapports et statistiques
  async getProjectStats(clientId) {
    try {
      const response = await api.get(`/api/agent/clients/${clientId}/stats`)
      return { success: true, data: response.data }
    } catch (error) {
      console.error('Erreur lors de la récupération des statistiques:', error)
      return { success: false, error: error.response?.data?.message || 'Erreur lors de la récupération des statistiques' }
    }
  }

  async generateReport(clientId, reportType, dateRange) {
    try {
      const response = await api.post(`/api/agent/clients/${clientId}/reports`, {
        type: reportType,
        date_range: dateRange
      })
      return { success: true, data: response.data }
    } catch (error) {
      console.error('Erreur lors de la génération du rapport:', error)
      return { success: false, error: error.response?.data?.message || 'Erreur lors de la génération du rapport' }
    }
  }

  // Notifications
  async getNotifications(projectId) {
    try {
      const response = await api.get(`/projects/${projectId}/notifications`)
      return { success: true, data: response.data }
    } catch (error) {
      console.error('Erreur lors de la récupération des notifications:', error)
      return { success: false, error: error.response?.data?.message || 'Erreur lors de la récupération des notifications' }
    }
  }

  async markNotificationAsRead(projectId, notificationId) {
    try {
      const response = await api.put(`/projects/${projectId}/notifications/${notificationId}/read`)
      return { success: true, data: response.data }
    } catch (error) {
      console.error('Erreur lors du marquage de la notification:', error)
      return { success: false, error: error.response?.data?.message || 'Erreur lors du marquage de la notification' }
    }
  }

  // Méthodes pour les rapports avancés
  async generateAdvancedReport(projectId, reportConfig) {
    try {
      const response = await api.post(`/projects/${projectId}/reports/generate`, reportConfig)
      return { success: true, data: response.data }
    } catch (error) {
      console.error('Erreur lors de la génération du rapport:', error)
      return { success: false, error: error.response?.data?.message || 'Erreur lors de la génération du rapport' }
    }
  }

  async exportAdvancedProjectData(projectId, format = 'pdf') {
    try {
      const response = await api.get(`/projects/${projectId}/export`, {
        params: { format },
        responseType: 'blob'
      })
      return { success: true, data: response.data }
    } catch (error) {
      console.error('Erreur lors de l\'export:', error)
      return { success: false, error: error.response?.data?.message || 'Erreur lors de l\'export' }
    }
  }

  // Méthodes pour la recherche d'utilisateurs
  async searchUsers(query) {
    try {
      const response = await api.get('/users/search', {
        params: { q: query }
      })
      return { success: true, data: response.data }
    } catch (error) {
      console.error('Erreur lors de la recherche d\'utilisateurs:', error)
      return { success: false, error: error.response?.data?.message || 'Erreur lors de la recherche d\'utilisateurs' }
    }
  }
}

const projectManagementService = new ProjectManagementService()
export { projectManagementService }
export default projectManagementService