import api from './api'
import axios from 'axios'
import tokenManager from './tokenManager.js'

class ProjectTemplateService {
  constructor() {
    const apiEnv = import.meta.env.VITE_API_URL
    const host = typeof window !== 'undefined' ? window.location.hostname : ''
    const isLocalNetworkHost = !!host && host !== 'localhost' && host !== '127.0.0.1'
    this.baseURL = isLocalNetworkHost
      ? ''
      : (apiEnv && apiEnv.startsWith('http')
          ? apiEnv.replace(/\/+$/, '')
          : '')
    this.api = axios.create({
      baseURL: this.baseURL,
      timeout: 10000,
      headers: {
        'Content-Type': 'application/json'
      }
    })

    // Abonner cette instance au gestionnaire de tokens centralisé
    tokenManager.subscribe(this.api, 'projectTemplateService.js')
  }

  // Gestion des modèles de projets
  async getProjectTemplates() {
    try {
      // Vérifier le token d'authentification
      const token = localStorage.getItem('accessToken')
      console.log('🔑 Token présent:', !!token)
      console.log('🔑 Token value:', token ? token.substring(0, 50) + '...' : 'null')
      
      // Déterminer la route à utiliser selon le rôle de l'utilisateur
      const userRole = this.getUserRole()
      console.log('👤 User role for template request:', userRole)
      
      // Utiliser la route client pour tous les rôles maintenant qu'elle accepte tous les rôles
      const endpoint = '/api/client/project-templates'
      const fullUrl = this.baseURL + endpoint
      
      console.log('🌐 Making request to:', fullUrl)
      console.log('📋 Request headers will include Authorization:', !!token)
      
      const response = await this.api.get(endpoint)
      console.log('✅ Template response status:', response.status)
      console.log('📊 Template response data:', response.data)
      console.log('📈 Number of templates received:', response.data.data?.length || 0)
      
      return { success: true, data: response.data.data || [] }
    } catch (error) {
      console.error('❌ Erreur lors de la récupération des modèles:', error)
      console.error('❌ Error status:', error.response?.status)
      console.error('❌ Error details:', error.response?.data)
      console.error('❌ Error message:', error.message)
      
      if (error.response?.status === 401) {
        console.error('🚫 Erreur d\'authentification - Token invalide ou expiré')
      }
      
      return { success: false, error: error.response?.data?.message || 'Erreur lors de la récupération des modèles' }
    }
  }

  // Méthode utilitaire pour récupérer le rôle de l'utilisateur
  getUserRole() {
    try {
      const token = localStorage.getItem('accessToken')
      if (!token) return null
      
      // Décoder le token JWT pour récupérer le rôle
      const payload = JSON.parse(atob(token.split('.')[1]))
      return payload.role
    } catch (error) {
      console.error('Erreur lors de la récupération du rôle utilisateur:', error)
      return null
    }
  }

  // Alias pour la compatibilité avec le composable
  async getTemplates() {
    return await this.getProjectTemplates()
  }

  // Méthodes pour les favoris
  async toggleTemplateFavorite(templateId) {
    try {
      const response = await this.api.patch(`/api/project-templates/${templateId}/favorite`)
      return { success: true, data: response.data.data }
    } catch (error) {
      console.error('Erreur lors du changement de favori:', error)
      return { success: false, error: error.response?.data?.message || 'Erreur lors du changement de favori' }
    }
  }

  // Alias pour la compatibilité
  async createTemplate(templateData) {
    return await this.createProjectTemplate(templateData)
  }

  async updateTemplate(templateId, templateData) {
    return await this.updateProjectTemplate(templateId, templateData)
  }

  async deleteTemplate(templateId) {
    return await this.deleteProjectTemplate(templateId)
  }

  async duplicateTemplate(templateId) {
    return await this.duplicateProjectTemplate(templateId)
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
      // Utiliser la route publique des widgets avec contrôle de rôle côté serveur
      const response = await this.api.get('/api/widgets')
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