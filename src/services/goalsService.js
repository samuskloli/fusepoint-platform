import api from './api'

class GoalsService {
  // Récupérer tous les objectifs
  async getGoals(filters = {}) {
    try {
      const params = new URLSearchParams()
      
      if (filters.status) params.append('status', filters.status)
      if (filters.priority) params.append('priority', filters.priority)
      if (filters.category) params.append('category', filters.category)
      if (filters.assignee) params.append('assignee', filters.assignee)
      if (filters.search) params.append('search', filters.search)
      
      const queryString = params.toString()
      const url = queryString ? `/goals?${queryString}` : '/goals'
      
      const response = await api.get(url)
      return response.data
    } catch (error) {
      console.error('Erreur lors de la récupération des objectifs:', error)
      throw error
    }
  }

  // Récupérer un objectif par ID
  async getGoal(id) {
    try {
      const response = await api.get(`/goals/${id}`)
      return response.data
    } catch (error) {
      console.error('Erreur lors de la récupération de l\'objectif:', error)
      throw error
    }
  }

  // Créer un nouvel objectif
  async createGoal(goalData) {
    try {
      const response = await api.post('/goals', goalData)
      return response.data
    } catch (error) {
      console.error('Erreur lors de la création de l\'objectif:', error)
      throw error
    }
  }

  // Mettre à jour un objectif
  async updateGoal(id, goalData) {
    try {
      const response = await api.put(`/goals/${id}`, goalData)
      return response.data
    } catch (error) {
      console.error('Erreur lors de la mise à jour de l\'objectif:', error)
      throw error
    }
  }

  // Supprimer un objectif
  async deleteGoal(id) {
    try {
      const response = await api.delete(`/goals/${id}`)
      return response.data
    } catch (error) {
      console.error('Erreur lors de la suppression de l\'objectif:', error)
      throw error
    }
  }

  // Mettre à jour le statut d'un objectif
  async updateGoalStatus(id, status) {
    try {
      const response = await api.patch(`/goals/${id}/status`, { status })
      return response.data
    } catch (error) {
      console.error('Erreur lors de la mise à jour du statut:', error)
      throw error
    }
  }

  // Mettre à jour la progression d'un objectif
  async updateGoalProgress(id, progress) {
    try {
      const response = await api.patch(`/goals/${id}/progress`, { progress })
      return response.data
    } catch (error) {
      console.error('Erreur lors de la mise à jour de la progression:', error)
      throw error
    }
  }

  // Récupérer les statistiques des objectifs
  async getGoalsStats() {
    try {
      const response = await api.get('/goals/stats')
      return response.data
    } catch (error) {
      console.error('Erreur lors de la récupération des statistiques:', error)
      throw error
    }
  }

  // Récupérer les catégories d'objectifs
  async getGoalCategories() {
    try {
      const response = await api.get('/goals/categories')
      return response.data
    } catch (error) {
      console.error('Erreur lors de la récupération des catégories:', error)
      throw error
    }
  }

  // Dupliquer un objectif
  async duplicateGoal(id) {
    try {
      const response = await api.post(`/goals/${id}/duplicate`)
      return response.data
    } catch (error) {
      console.error('Erreur lors de la duplication de l\'objectif:', error)
      throw error
    }
  }

  // Archiver un objectif
  async archiveGoal(id) {
    try {
      const response = await api.patch(`/goals/${id}/archive`)
      return response.data
    } catch (error) {
      console.error('Erreur lors de l\'archivage de l\'objectif:', error)
      throw error
    }
  }

  // Restaurer un objectif archivé
  async restoreGoal(id) {
    try {
      const response = await api.patch(`/goals/${id}/restore`)
      return response.data
    } catch (error) {
      console.error('Erreur lors de la restauration de l\'objectif:', error)
      throw error
    }
  }
}

export default new GoalsService()