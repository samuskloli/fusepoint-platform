import api from './api'

/**
 * Service pour la gestion des catégories de notes
 */
class NoteCategoriesService {
  constructor() {
    this.baseUrl = '/api/projects'
  }

  async getCategories(projectId) {
    try {
      const res = await api.get(`${this.baseUrl}/${projectId}/note-categories`)
      const categories = res.data?.data?.categories ?? res.data?.categories ?? []
      return { success: true, data: Array.isArray(categories) ? categories : [] }
    } catch (error) {
      console.error('Erreur lors de la récupération des catégories:', error)
      return { success: false, error: error.response?.data?.error || 'Erreur lors de la récupération des catégories', data: [] }
    }
  }

  async createCategory(projectId, payload) {
    try {
      const res = await api.post(`${this.baseUrl}/${projectId}/note-categories`, payload)
      const id = res.data?.data?.id ?? res.data?.id
      return { success: true, data: { id } }
    } catch (error) {
      console.error('Erreur lors de la création de la catégorie:', error)
      return { success: false, error: error.response?.data?.error || 'Erreur lors de la création de la catégorie' }
    }
  }

  async updateCategory(projectId, categoryId, payload) {
    try {
      await api.put(`${this.baseUrl}/${projectId}/note-categories/${categoryId}`, payload)
      return { success: true }
    } catch (error) {
      console.error('Erreur lors de la mise à jour de la catégorie:', error)
      return { success: false, error: error.response?.data?.error || 'Erreur lors de la mise à jour de la catégorie' }
    }
  }

  async deleteCategory(projectId, categoryId) {
    try {
      await api.delete(`${this.baseUrl}/${projectId}/note-categories/${categoryId}`)
      return { success: true }
    } catch (error) {
      console.error('Erreur lors de la suppression de la catégorie:', error)
      return { success: false, error: error.response?.data?.error || 'Erreur lors de la suppression de la catégorie' }
    }
  }
}

const noteCategoriesService = new NoteCategoriesService()
export default noteCategoriesService