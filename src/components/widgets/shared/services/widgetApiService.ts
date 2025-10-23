import api from '@/services/api'

interface WidgetConfig {
  id: string
  type: string
  settings: any
  position: { x: number; y: number }
  size: { width: number; height: number }
  isActive: boolean
}

interface WidgetData {
  [key: string]: any
}

interface ProjectConfig {
  widgets?: {
    data: any
    version: number
    updated_at: string
  }
  metrics?: {
    data: any
    version: number
    updated_at: string
  }
  settings?: {
    data: any
    version: number
    updated_at: string
  }
  permissions?: {
    data: any
    version: number
    updated_at: string
  }
}

interface MetricData {
  category: string
  key: string
  value: number
  unit?: string
  target?: number
}

class WidgetApiService {
  // Méthode utilitaire pour récupérer les informations de l'utilisateur connecté
  private getCurrentUser(): any {
    try {
      const userStr = localStorage.getItem('user')
      return userStr ? JSON.parse(userStr) : null
    } catch (error) {
      console.error('Error parsing user from localStorage:', error)
      return null
    }
  }

  // Méthode utilitaire pour vérifier si l'utilisateur est un client
  private isClientUser(): boolean {
    const user = this.getCurrentUser()
    return user && (user.role === 'user' || user.role === 'client')
  }

  // Configuration des widgets (legacy - pour compatibilité)
  async getWidgetConfig(widgetId: string): Promise<WidgetConfig | null> {
    try {
      const response = await api.get(`/widgets/${widgetId}/config`)
      return response.data
    } catch (error) {
      console.error('Error fetching widget config:', error)
      return null
    }
  }

  async saveWidgetConfig(widgetId: string, config: Partial<WidgetConfig>): Promise<boolean> {
    try {
      await api.put(`/widgets/${widgetId}/config`, config)
      return true
    } catch (error) {
      console.error('Error saving widget config:', error)
      return false
    }
  }

  async toggleWidgetActive(widgetId: string, isActive: boolean): Promise<boolean> {
    try {
      await api.post(`/widgets/${widgetId}/active`, { isActive })
      return true
    } catch (error) {
      console.error('Error toggling widget active:', error)
      return false
    }
  }

  async deleteWidgetConfig(widgetId: string): Promise<boolean> {
    try {
      await api.delete(`/widgets/${widgetId}/config`)
      return true
    } catch (error) {
      console.error('Error deleting widget config:', error)
      return false
    }
  }

  // === Project Configurations ===
  async getProjectConfigurations(clientId: string, projectId: string): Promise<ProjectConfig | null> {
    try {
      const response = await api.get(`/api/projects/${clientId}/${projectId}/config`)
      return response.data?.data ?? response.data
    } catch (error) {
      console.error('Error fetching project configurations:', error)
      return null
    }
  }

  async getProjectConfiguration(clientId: string, projectId: string, configType: string): Promise<any> {
    try {
      const response = await api.get(`/api/projects/${clientId}/${projectId}/config/${configType}`)
      // Route renvoie { success, data, version, updated_at }, on normalise
      return response.data?.data ?? response.data
    } catch (error) {
      console.error('Error fetching project configuration:', error)
      return null
    }
  }

  async updateProjectConfiguration(clientId: string, projectId: string, configType: string, configData: any): Promise<boolean> {
    try {
      await api.put(`/api/projects/${clientId}/${projectId}/config/${configType}`, { config_data: configData })
      return true
    } catch (error) {
      console.error('Error updating project configuration:', error)
      return false
    }
  }

  async initializeProjectConfigurations(clientId: string, projectId: string, clientType: string): Promise<boolean> {
    try {
      await api.post(`/api/projects/${clientId}/${projectId}/initialize`, { client_type: clientType })
      return true
    } catch (error) {
      console.error('Error initializing project configurations:', error)
      return false
    }
  }

  async getProjectMetrics(clientId: string, projectId: string, category?: string, days: number = 30): Promise<any> {
    try {
      const response = await api.get(`/api/projects/${clientId}/${projectId}/metrics`, { params: { category, days } })
      return response.data?.data ?? response.data
    } catch (error) {
      console.error('Error fetching project metrics:', error)
      return null
    }
  }

  async updateProjectMetrics(clientId: string, projectId: string, metrics: MetricData[]): Promise<boolean> {
    try {
      await api.post(`/api/projects/${clientId}/${projectId}/metrics`, { metrics })
      return true
    } catch (error) {
      console.error('Error updating project metrics:', error)
      return false
    }
  }

  async getProjectDashboard(clientId: string, projectId: string): Promise<any> {
    try {
      // Déprécié: clientId ignoré, route unifiée par projet
      const response = await api.get(`/api/projects/${projectId}/dashboard`)
      return response.data?.data ?? response.data
    } catch (error) {
      console.error('Error fetching project dashboard:', error)
      return null
    }
  }

  // === New Project Dashboard API ===
  async getProjectDashboardLayout(projectId: string): Promise<any> {
    try {
      const response = await api.get(`/api/projects/${projectId}/dashboard`)
      return response.data?.data || response.data
    } catch (error) {
      console.error('Error fetching project dashboard layout:', error)
      return null
    }
  }

  async updateProjectDashboardLayout(projectId: string, layoutJson: any, version?: number): Promise<boolean> {
    try {
      const headers: any = {}
      if (version !== undefined) {
        headers['If-Match'] = `"${version}"`
      }
      
      await api.put(`/api/projects/${projectId}/dashboard`, 
        { layout: layoutJson, version }, 
        { headers }
      )
      return true
    } catch (error) {
      console.error('Error updating project dashboard layout:', error)
      return false
    }
  }

  async getClientTemplates(clientType: string): Promise<any> {
    try {
      const response = await api.get(`/api/projects/templates/${clientType}`)
      return response.data?.data ?? response.data
    } catch (error) {
      console.error('Error fetching client templates:', error)
      return null
    }
  }

  // Données des widgets (legacy - pour compatibilité)
  async getWidgetData(projectId: string, widgetType: string): Promise<WidgetData | null> {
    try {
      const response = await api.get(`/projects/${projectId}/widgets/${widgetType}/data`)
      return response.data
    } catch (error) {
      console.error('Error fetching widget data:', error)
      return null
    }
  }

  async updateWidgetData(projectId: string, widgetType: string, data: WidgetData): Promise<boolean> {
    try {
      await api.put(`/projects/${projectId}/widgets/${widgetType}/data`, data)
      return true
    } catch (error) {
      console.error('Error updating widget data:', error)
      return false
    }
  }

  // === Client Widget Configs (déprécié) ===
  async getClientProjectWidgets(clientId: string, projectId: string): Promise<any> {
    try {
      // Charger les configs client/projet depuis l'API dédiée
      const response = await api.get(`/api/client-widget-configs/${clientId}/projects/${projectId}/widgets`)
      return response.data?.data ?? response.data
    } catch (error) {
      console.error('Error fetching project widgets catalog:', error)
      return null
    }
  }

  async getClientWidgetConfig(clientId: string, projectId: string, widgetId: string): Promise<any> {
    try {
      // Récupérer une configuration précise via l’API dédiée
      const response = await api.get(`/api/client-widget-configs/${clientId}/projects/${projectId}/widgets/${widgetId}`)
      return response.data?.data ?? response.data
    } catch (error) {
      console.error('Error fetching client widget config:', error)
      return null
    }
  }

  async upsertClientWidgetConfig(clientId: string, projectId: string, widgetId: string, configData: any): Promise<boolean> {
    try {
      await api.put(`/api/client-widget-configs/${clientId}/projects/${projectId}/widgets/${widgetId}`, configData)
      return true
    } catch (error) {
      console.error('Error upserting client widget config:', error)
      return false
    }
  }

  async deleteClientWidgetConfig(clientId: string, projectId: string, widgetId: string): Promise<boolean> {
    try {
      await api.delete(`/api/client-widget-configs/${clientId}/projects/${projectId}/widgets/${widgetId}`)
      return true
    } catch (error) {
      console.error('Error deleting client widget config:', error)
      return false
    }
  }

  async reorderClientProjectWidgets(clientId: string, projectId: string, widgetOrders: any): Promise<boolean> {
    try {
      const response = await api.post(`/api/client-widget-configs/${clientId}/projects/${projectId}/widgets/reorder`, { widgetOrders })
      return !!(response?.data?.success ?? true)
    } catch (error) {
      console.error('Error reordering client project widgets:', error)
      return false
    }
  }

  async initializeClientProjectWidgets(clientId: string, projectId: string, templateId: string): Promise<boolean> {
    try {
      console.warn('initializeClientProjectWidgets deprecated: use project dashboard templates if available')
      return false
    } catch (error) {
      console.error('Error initializing client project widgets:', error)
      return false
    }
  }

  // === Widgets Catalog ===
  async getAllWidgets(): Promise<any[]> {
    try {
      let response

      // Si l'utilisateur est un client, utiliser la route client
      if (this.isClientUser()) {
        console.log('🔍 Utilisation de la route client pour récupérer le catalogue de widgets')
        response = await api.get('/api/client/widgets')
      } else {
        // Pour les agents, admins et super_admins, utiliser la route standard
        console.log('🔍 Utilisation de la route agent pour récupérer le catalogue de widgets')
        response = await api.get('/api/widgets')
      }
      
      return response.data?.data ?? response.data ?? []
    } catch (error) {
      console.error('Error fetching widgets catalog:', error)
      return []
    }
  }
}

const widgetApiService = new WidgetApiService()
export default widgetApiService
export { WidgetApiService, type WidgetConfig, type WidgetData, type ProjectConfig, type MetricData }