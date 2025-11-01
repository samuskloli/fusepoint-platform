import api from './api'

/**
 * Service pour la gestion des notes de projet
 * Utilise les routes API backend avec scoping strict client_id/project_id
 */
class NotesService {
  constructor() {
    this.baseUrl = '/api/projects'
  }

  /**
   * Récupérer toutes les notes d'un projet
   * @param {string|number} projectId - ID du projet
   * @returns {Promise<Object>} - Résultat avec les notes
   */
  async getNotes(projectId, options = {}) {
    try {
      const includeArchived = options.includeArchived ? '1' : '0'
      const response = await api.get(`${this.baseUrl}/${projectId}/notes`, { params: { includeArchived } })
      // L'API backend renvoie { success: true, data: { notes: [...], pagination: {...} } }
      const notes = response.data?.data?.notes ?? response.data?.notes ?? response.data ?? []
      return {
        success: true,
        data: Array.isArray(notes) ? notes : []
      }
    } catch (error) {
      console.error('Erreur lors de la récupération des notes:', error)
      return {
        success: false,
        error: error.response?.data?.error || error.response?.data?.message || 'Erreur lors de la récupération des notes',
        data: []
      }
    }
  }

  /**
   * Créer une nouvelle note
   * @param {string|number} projectId - ID du projet
   * @param {Object} noteData - Données de la note
   * @returns {Promise<Object>} - Résultat avec la note créée
   */
  async createNote(projectId, noteData) {
    try {
      // Normaliser widget_instance_id en entier ou null
      const rawWidgetId = noteData.widget_instance_id
      let widgetInstanceId = null
      if (rawWidgetId !== null && typeof rawWidgetId !== 'undefined') {
        widgetInstanceId = typeof rawWidgetId === 'number' ? rawWidgetId : parseInt(String(rawWidgetId), 10)
        if (Number.isNaN(widgetInstanceId)) widgetInstanceId = null
      }

      // Normaliser category_id en entier ou null
      const rawCategoryId = noteData.category_id
      let categoryId = null
      if (rawCategoryId !== null && typeof rawCategoryId !== 'undefined') {
        categoryId = typeof rawCategoryId === 'number' ? rawCategoryId : parseInt(String(rawCategoryId), 10)
        if (Number.isNaN(categoryId)) categoryId = null
      }

      const response = await api.post(`${this.baseUrl}/${projectId}/notes`, {
        title: noteData.title || '',
        content: noteData.content,
        tags: noteData.tags || [],
        widget_instance_id: widgetInstanceId,
        category_id: categoryId,
        archived: !!noteData.archived
      })
      // Le backend renvoie { success: true, data: { id } }
      const newId = response.data?.data?.id ?? response.data?.id
      const createdNote = {
        id: newId,
        title: noteData.title || '',
        content: noteData.content,
        tags: Array.isArray(noteData.tags) ? noteData.tags : [],
        is_pinned: false,
        category_id: categoryId,
        archived: !!noteData.archived,
        archived_at: noteData.archived ? new Date().toISOString() : null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }
      return {
        success: true,
        data: createdNote
      }
    } catch (error) {
      console.error('Erreur lors de la création de la note:', error)
      return {
        success: false,
        error: error.response?.data?.error || error.response?.data?.message || 'Erreur lors de la création de la note'
      }
    }
  }

  /**
   * Mettre à jour une note existante
   * @param {string|number} projectId - ID du projet
   * @param {string|number} noteId - ID de la note
   * @param {Object} noteData - Nouvelles données de la note
   * @returns {Promise<Object>} - Résultat avec la note mise à jour
   */
  async updateNote(projectId, noteId, noteData) {
    try {
      const response = await api.put(`${this.baseUrl}/${projectId}/notes/${noteId}`, {
        title: noteData.title || '',
        content: noteData.content,
        tags: noteData.tags || [],
        category_id: typeof noteData.category_id === 'number' ? noteData.category_id : (noteData.category_id != null ? parseInt(String(noteData.category_id), 10) : undefined),
        archived: typeof noteData.archived !== 'undefined' ? !!noteData.archived : undefined
      })
      // Le backend renvoie { success: true } sans payload de note
      // On renvoie les données mises à jour pour simplifier la mise à jour côté UI
      const updatedNote = {
        id: noteId,
        title: noteData.title || '',
        content: noteData.content,
        tags: Array.isArray(noteData.tags) ? noteData.tags : [],
        category_id: noteData.category_id,
        archived: typeof noteData.archived !== 'undefined' ? !!noteData.archived : undefined,
        archived_at: noteData.archived ? new Date().toISOString() : null,
        updated_at: new Date().toISOString()
      }
      return {
        success: true,
        data: updatedNote
      }
    } catch (error) {
      console.error('Erreur lors de la mise à jour de la note:', error)
      return {
        success: false,
        error: error.response?.data?.error || error.response?.data?.message || 'Erreur lors de la mise à jour de la note'
      }
    }
  }

  /**
   * Supprimer une note
   * @param {string|number} projectId - ID du projet
   * @param {string|number} noteId - ID de la note
   * @returns {Promise<Object>} - Résultat de la suppression
   */
  async deleteNote(projectId, noteId) {
    try {
      await api.delete(`${this.baseUrl}/${projectId}/notes/${noteId}`)
      return {
        success: true
      }
    } catch (error) {
      console.error('Erreur lors de la suppression de la note:', error)
      return {
        success: false,
        error: error.response?.data?.error || error.response?.data?.message || 'Erreur lors de la suppression de la note'
      }
    }
  }
}

export default new NotesService()