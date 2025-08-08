import api from './api'
import axios from 'axios'

class ProjectTemplateService {
  constructor() {
    this.baseURL = import.meta.env.VITE_API_URL || 'http://localhost:3003'
    this.api = axios.create({
      baseURL: this.baseURL,
      timeout: 10000,
      headers: {
        'Content-Type': 'application/json'
      }
    })

    // Intercepteur pour ajouter le token aux requêtes
    this.api.interceptors.request.use(
      (config) => {
        const token = localStorage.getItem('accessToken')
        if (token) {
          config.headers.Authorization = `Bearer ${token}`
        }
        return config
      },
      (error) => {
        return Promise.reject(error)
      }
    )
  }

  // Gestion des modèles de projets
  async getProjectTemplates() {
    try {
      const response = await this.api.get('/api/project-templates')
      return { success: true, data: response.data.data || [] }
    } catch (error) {
      console.error('Erreur lors de la récupération des modèles:', error)
      return { success: false, error: error.response?.data?.message || 'Erreur lors de la récupération des modèles' }
    }
  }

  // Alias pour la compatibilité avec le composable
  async getTemplates() {
    return await this.getProjectTemplates()
  }

  async getProjectTemplate(templateId) {
    try {
      const response = await this.api.get(`/api/project-templates/${templateId}`)
      return { success: true, data: response.data.data }
    } catch (error) {
      console.error('Erreur lors de la récupération du modèle:', error)
      return { success: false, error: error.response?.data?.message || 'Erreur lors de la récupération du modèle' }
    }
  }

  async createProjectTemplate(templateData) {
    try {
      const response = await this.api.post('/api/project-templates', templateData)
      return { success: true, data: response.data.data }
    } catch (error) {
      console.error('Erreur lors de la création du modèle:', error)
      return { success: false, error: error.response?.data?.message || 'Erreur lors de la création du modèle' }
    }
  }

  async updateProjectTemplate(templateId, templateData) {
    try {
      const response = await this.api.put(`/api/project-templates/${templateId}`, templateData)
      return { success: true, data: response.data.data }
    } catch (error) {
      console.error('Erreur lors de la mise à jour du modèle:', error)
      return { success: false, error: error.response?.data?.message || 'Erreur lors de la mise à jour du modèle' }
    }
  }

  async deleteProjectTemplate(templateId) {
    try {
      await this.api.delete(`/api/project-templates/${templateId}`)
      return { success: true }
    } catch (error) {
      console.error('Erreur lors de la suppression du modèle:', error)
      return { success: false, error: error.response?.data?.message || 'Erreur lors de la suppression du modèle' }
    }
  }

  async duplicateProjectTemplate(templateId) {
    try {
      const response = await this.api.post(`/api/project-templates/${templateId}/duplicate`)
      return { success: true, data: response.data.data }
    } catch (error) {
      console.error('Erreur lors de la duplication du modèle:', error)
      return { success: false, error: error.response?.data?.message || 'Erreur lors de la duplication du modèle' }
    }
  }

  async toggleTemplateStatus(templateId, isActive) {
    try {
      const response = await this.api.patch(`/api/project-templates/${templateId}/status`, { is_active: isActive })
      return { success: true, data: response.data.data }
    } catch (error) {
      console.error('Erreur lors du changement de statut du modèle:', error)
      return { success: false, error: error.response?.data?.message || 'Erreur lors du changement de statut du modèle' }
    }
  }

  // Gestion des widgets
  async getWidgets() {
    try {
      const response = await this.api.get('/api/agent/widgets')
      return { success: true, data: response.data.data || [] }
    } catch (error) {
      console.error('Erreur lors de la récupération des widgets:', error)
      return { success: false, error: error.response?.data?.message || 'Erreur lors de la récupération des widgets' }
    }
  }

  async getTemplateWidgets(templateId) {
    try {
      const response = await this.api.get(`/api/project-templates/${templateId}/widgets`)
      return { success: true, data: response.data.data || [] }
    } catch (error) {
      console.error('Erreur lors de la récupération des widgets du modèle:', error)
      return { success: false, error: error.response?.data?.message || 'Erreur lors de la récupération des widgets du modèle' }
    }
  }

  async updateTemplateWidgets(templateId, widgets) {
    try {
      const response = await this.api.put(`/api/project-templates/${templateId}/widgets`, { widgets })
      return { success: true, data: response.data.data }
    } catch (error) {
      console.error('Erreur lors de la mise à jour des widgets du modèle:', error)
      return { success: false, error: error.response?.data?.message || 'Erreur lors de la mise à jour des widgets du modèle' }
    }
  }

  // Gestion des projets avec modèles
  async createProjectFromTemplate(templateId, projectData) {
    try {
      const response = await this.api.post(`/api/project-templates/${templateId}/create-project`, projectData)
      return { success: true, data: response.data.data }
    } catch (error) {
      console.error('Erreur lors de la création du projet depuis le modèle:', error)
      return { success: false, error: error.response?.data?.message || 'Erreur lors de la création du projet depuis le modèle' }
    }
  }

  async getProjectWidgets(projectId) {
    try {
      const response = await this.api.get(`/api/project-templates/projects/${projectId}/widgets`)
      return { success: true, data: response.data.data || [] }
    } catch (error) {
      console.error('Erreur lors de la récupération des widgets du projet:', error)
      return { success: false, error: error.response?.data?.message || 'Erreur lors de la récupération des widgets du projet' }
    }
  }

  async updateProjectWidget(projectId, widgetId, widgetData) {
    try {
      const response = await this.api.put(`/api/agent/projects/${projectId}/widgets/${widgetId}`, widgetData)
      return { success: true, data: response.data.data }
    } catch (error) {
      console.error('Erreur lors de la mise à jour du widget du projet:', error)
      return { success: false, error: error.response?.data?.message || 'Erreur lors de la mise à jour du widget du projet' }
    }
  }

  async toggleProjectWidget(projectId, widgetId, isEnabled) {
    try {
      const response = await this.api.patch(`/api/agent/projects/${projectId}/widgets/${widgetId}/toggle`, { is_enabled: isEnabled })
      return { success: true, data: response.data.data }
    } catch (error) {
      console.error('Erreur lors du changement de statut du widget:', error)
      return { success: false, error: error.response?.data?.message || 'Erreur lors du changement de statut du widget' }
    }
  }

  // Utilitaires
  getWidgetCategories() {
    return [
      { value: 'productivity', labelKey: 'categories.productivity' },
      { value: 'planning', labelKey: 'categories.planning' },
      { value: 'analytics', labelKey: 'categories.analytics' },
      { value: 'communication', labelKey: 'categories.communication' },
      { value: 'tracking', labelKey: 'categories.tracking' },
      { value: 'ai', labelKey: 'categories.ai' },
      { value: 'files', labelKey: 'categories.files' },
      { value: 'team', labelKey: 'categories.team' }
    ]
  }

  getTemplateCategories() {
    return [
      { value: 'client', labelKey: 'projectTemplates.categories.client' },
      { value: 'goals', labelKey: 'projectTemplates.categories.goals' },
      { value: 'communication', labelKey: 'projectTemplates.categories.communication' },
      { value: 'productivity', labelKey: 'projectTemplates.categories.productivity' },
      { value: 'analytics', labelKey: 'projectTemplates.categories.analytics' }
    ]
  }

  getProjectPriorities() {
    return [
      { value: 'low', labelKey: 'priorities.low' },
      { value: 'medium', labelKey: 'priorities.medium' },
      { value: 'high', labelKey: 'priorities.high' },
      { value: 'urgent', labelKey: 'priorities.urgent' }
    ]
  }
}

export default new ProjectTemplateService()