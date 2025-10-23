import api from './api'

class WidgetsCatalogService {
  async getWidgets(filters = {}) {
    try {
      const params = new URLSearchParams()
      if (filters.category) params.set('category', filters.category)
      const response = await api.get(`/api/widgets${params.toString() ? `?${params.toString()}` : ''}`)
      return { success: true, data: response.data?.data || response.data }
    } catch (error) {
      console.error('Erreur lors de la récupération des widgets:', error)
      return { success: false, error: error.response?.data?.message || 'Erreur lors de la récupération des widgets' }
    }
  }

  async getCategories() {
    try {
      const response = await api.get('/api/widgets/categories')
      return { success: true, data: response.data?.data || response.data }
    } catch (error) {
      console.error('Erreur lors de la récupération des catégories de widgets:', error)
      return { success: false, error: error.response?.data?.message || 'Erreur lors de la récupération des catégories de widgets' }
    }
  }
}

export default new WidgetsCatalogService()