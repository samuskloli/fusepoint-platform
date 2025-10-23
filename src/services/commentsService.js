import api from './api'

class CommentsService {
  /**
   * Récupère tous les commentaires pour un élément donné
   * @param {string} entityType - Type d'entité (project, task, etc.)
   * @param {number} entityId - ID de l'entité
   * @returns {Promise<Array>} Liste des commentaires
   */
  async getComments(entityType, entityId) {
    try {
      const response = await api.get(`/comments/${entityType}/${entityId}`)
      return response.data
    } catch (error) {
      console.error('Erreur lors de la récupération des commentaires:', error)
      throw error
    }
  }

  /**
   * Crée un nouveau commentaire
   * @param {Object} commentData - Données du commentaire
   * @returns {Promise<Object>} Commentaire créé
   */
  async createComment(commentData) {
    try {
      const response = await api.post('/comments', commentData)
      return response.data
    } catch (error) {
      console.error('Erreur lors de la création du commentaire:', error)
      throw error
    }
  }

  /**
   * Met à jour un commentaire existant
   * @param {number} commentId - ID du commentaire
   * @param {Object} commentData - Nouvelles données du commentaire
   * @returns {Promise<Object>} Commentaire mis à jour
   */
  async updateComment(commentId, commentData) {
    try {
      const response = await api.put(`/comments/${commentId}`, commentData)
      return response.data
    } catch (error) {
      console.error('Erreur lors de la mise à jour du commentaire:', error)
      throw error
    }
  }

  /**
   * Supprime un commentaire
   * @param {number} commentId - ID du commentaire à supprimer
   * @returns {Promise<void>}
   */
  async deleteComment(commentId) {
    try {
      await api.delete(`/comments/${commentId}`)
    } catch (error) {
      console.error('Erreur lors de la suppression du commentaire:', error)
      throw error
    }
  }

  /**
   * Ajoute une réaction à un commentaire
   * @param {number} commentId - ID du commentaire
   * @param {string} reaction - Type de réaction (like, dislike, etc.)
   * @returns {Promise<Object>} Réaction ajoutée
   */
  async addReaction(commentId, reaction) {
    try {
      const response = await api.post(`/comments/${commentId}/reactions`, { reaction })
      return response.data
    } catch (error) {
      console.error('Erreur lors de l\'ajout de la réaction:', error)
      throw error
    }
  }

  /**
   * Supprime une réaction d'un commentaire
   * @param {number} commentId - ID du commentaire
   * @param {number} reactionId - ID de la réaction
   * @returns {Promise<void>}
   */
  async removeReaction(commentId, reactionId) {
    try {
      await api.delete(`/comments/${commentId}/reactions/${reactionId}`)
    } catch (error) {
      console.error('Erreur lors de la suppression de la réaction:', error)
      throw error
    }
  }

  /**
   * Marque un commentaire comme lu
   * @param {number} commentId - ID du commentaire
   * @returns {Promise<void>}
   */
  async markAsRead(commentId) {
    try {
      await api.patch(`/comments/${commentId}/read`)
    } catch (error) {
      console.error('Erreur lors du marquage comme lu:', error)
      throw error
    }
  }

  /**
   * Recherche des commentaires
   * @param {Object} searchParams - Paramètres de recherche
   * @returns {Promise<Array>} Résultats de la recherche
   */
  async searchComments(searchParams) {
    try {
      const response = await api.get('/comments/search', { params: searchParams })
      return response.data
    } catch (error) {
      console.error('Erreur lors de la recherche de commentaires:', error)
      throw error
    }
  }

  /**
   * Récupère les commentaires récents pour un utilisateur
   * @param {number} userId - ID de l'utilisateur
   * @param {number} limit - Nombre maximum de commentaires à récupérer
   * @returns {Promise<Array>} Commentaires récents
   */
  async getRecentComments(userId, limit = 10) {
    try {
      const response = await api.get(`/comments/recent/${userId}`, { params: { limit } })
      return response.data
    } catch (error) {
      console.error('Erreur lors de la récupération des commentaires récents:', error)
      throw error
    }
  }

  /**
   * Récupère les statistiques des commentaires
   * @param {string} entityType - Type d'entité
   * @param {number} entityId - ID de l'entité
   * @returns {Promise<Object>} Statistiques des commentaires
   */
  async getCommentStats(entityType, entityId) {
    try {
      const response = await api.get(`/comments/${entityType}/${entityId}/stats`)
      return response.data
    } catch (error) {
      console.error('Erreur lors de la récupération des statistiques:', error)
      throw error
    }
  }

  /**
   * Upload d'une pièce jointe pour un commentaire
   * @param {File} file - Fichier à uploader
   * @param {number} commentId - ID du commentaire (optionnel)
   * @returns {Promise<Object>} Informations du fichier uploadé
   */
  async uploadAttachment(file, commentId = null) {
    try {
      const formData = new FormData()
      formData.append('file', file)
      if (commentId) {
        formData.append('commentId', commentId)
      }

      const response = await api.post('/comments/attachments', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      })
      return response.data
    } catch (error) {
      console.error('Erreur lors de l\'upload de la pièce jointe:', error)
      throw error
    }
  }

  /**
   * Supprime une pièce jointe
   * @param {number} attachmentId - ID de la pièce jointe
   * @returns {Promise<void>}
   */
  async deleteAttachment(attachmentId) {
    try {
      await api.delete(`/comments/attachments/${attachmentId}`)
    } catch (error) {
      console.error('Erreur lors de la suppression de la pièce jointe:', error)
      throw error
    }
  }
}

const commentsService = new CommentsService()
export default commentsService