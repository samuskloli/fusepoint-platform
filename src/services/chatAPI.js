/**
 * Service API pour le système de chat
 * Gère toutes les interactions avec l'API backend du chat
 */

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3002/api';

/**
 * Fonction utilitaire pour effectuer des requêtes API
 */
const apiRequest = async (endpoint, options = {}) => {
  const token = localStorage.getItem('token');
  
  const config = {
    headers: {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
      ...options.headers,
    },
    ...options,
  };

  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, config);
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error(`API Error [${endpoint}]:`, error);
    throw error;
  }
};

/**
 * Fonction utilitaire pour les uploads de fichiers
 */
const uploadRequest = async (endpoint, formData) => {
  const token = localStorage.getItem('token');
  
  const config = {
    method: 'POST',
    headers: {
      ...(token && { Authorization: `Bearer ${token}` }),
    },
    body: formData,
  };

  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, config);
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error(`Upload Error [${endpoint}]:`, error);
    throw error;
  }
};

export const chatAPI = {
  /**
   * Récupérer les conversations de l'utilisateur connecté
   * @returns {Promise<Object>} Liste des conversations
   */
  getConversations: async () => {
    return apiRequest('/chat/conversations');
  },

  /**
   * Récupérer les messages d'une conversation
   * @param {number} conversationId - ID de la conversation
   * @param {number} limit - Nombre de messages à récupérer (défaut: 50)
   * @param {number} offset - Décalage pour la pagination (défaut: 0)
   * @returns {Promise<Object>} Liste des messages
   */
  getMessages: async (conversationId, limit = 50, offset = 0) => {
    return apiRequest(`/chat/conversation/${conversationId}/messages?limit=${limit}&offset=${offset}`);
  },

  /**
   * Envoyer un message dans une conversation
   * @param {number} conversationId - ID de la conversation
   * @param {string} content - Contenu du message
   * @param {string} messageType - Type de message (défaut: 'text')
   * @returns {Promise<Object>} Message créé
   */
  sendMessage: async (conversationId, content, messageType = 'text') => {
    return apiRequest(`/chat/conversation/${conversationId}/message`, {
      method: 'POST',
      body: JSON.stringify({
        content,
        messageType,
      }),
    });
  },

  /**
   * Uploader un fichier dans une conversation
   * @param {number} conversationId - ID de la conversation
   * @param {File} file - Fichier à uploader
   * @returns {Promise<Object>} Message avec fichier créé
   */
  uploadFile: async (conversationId, file) => {
    const formData = new FormData();
    formData.append('file', file);
    
    return uploadRequest(`/chat/conversation/${conversationId}/upload`, formData);
  },

  /**
   * Démarrer une nouvelle conversation (pour les agents)
   * @param {number} clientId - ID du client
   * @returns {Promise<Object>} Conversation créée
   */
  startConversation: async (clientId) => {
    return apiRequest('/chat/start-conversation', {
      method: 'POST',
      body: JSON.stringify({ clientId }),
    });
  },

  /**
   * Récupérer l'agent assigné au client connecté
   * @returns {Promise<Object>} Informations de l'agent
   */
  getMyAgent: async () => {
    return apiRequest('/chat/my-agent');
  },

  /**
   * Récupérer les clients assignés à l'agent connecté
   * @returns {Promise<Object>} Liste des clients assignés
   */
  getMyClients: async () => {
    return apiRequest('/chat/my-clients');
  },

  /**
   * Rechercher des clients (pour les agents)
   * @param {string} searchTerm - Terme de recherche
   * @param {number} limit - Nombre de résultats maximum (défaut: 20)
   * @returns {Promise<Object>} Liste des clients trouvés
   */
  searchClients: async (searchTerm, limit = 20) => {
    const encodedTerm = encodeURIComponent(searchTerm);
    return apiRequest(`/chat/search-clients?q=${encodedTerm}&limit=${limit}`);
  },

  /**
   * Récupérer les notifications de chat
   * @param {boolean} unreadOnly - Ne récupérer que les notifications non lues (défaut: true)
   * @returns {Promise<Object>} Liste des notifications
   */
  getNotifications: async (unreadOnly = true) => {
    return apiRequest(`/chat/notifications?unread_only=${unreadOnly}`);
  },

  /**
   * Marquer une conversation comme lue
   * @param {number} conversationId - ID de la conversation
   * @returns {Promise<Object>} Confirmation
   */
  markConversationAsRead: async (conversationId) => {
    return apiRequest(`/chat/conversation/${conversationId}/read`, {
      method: 'PUT',
    });
  },

  /**
   * Obtenir ou créer une conversation avec un utilisateur spécifique
   * @param {number} userId - ID de l'utilisateur
   * @returns {Promise<Object>} Conversation
   */
  getConversationWith: async (userId) => {
    return apiRequest(`/chat/conversation/with/${userId}`);
  },

  /**
   * Récupérer les statistiques de chat pour un utilisateur
   * @returns {Promise<Object>} Statistiques
   */
  getChatStats: async () => {
    return apiRequest('/chat/stats');
  },

  /**
   * Marquer tous les messages d'une conversation comme lus
   * @param {number} conversationId - ID de la conversation
   * @returns {Promise<Object>} Confirmation
   */
  markAllMessagesAsRead: async (conversationId) => {
    return apiRequest(`/chat/conversation/${conversationId}/messages/read-all`, {
      method: 'PUT',
    });
  },

  /**
   * Supprimer un message (si autorisé)
   * @param {number} messageId - ID du message
   * @returns {Promise<Object>} Confirmation
   */
  deleteMessage: async (messageId) => {
    return apiRequest(`/chat/message/${messageId}`, {
      method: 'DELETE',
    });
  },

  /**
   * Modifier un message (si autorisé)
   * @param {number} messageId - ID du message
   * @param {string} newContent - Nouveau contenu
   * @returns {Promise<Object>} Message modifié
   */
  editMessage: async (messageId, newContent) => {
    return apiRequest(`/chat/message/${messageId}`, {
      method: 'PUT',
      body: JSON.stringify({ content: newContent }),
    });
  },

  /**
   * Récupérer l'historique des conversations archivées
   * @param {number} limit - Nombre de conversations à récupérer
   * @param {number} offset - Décalage pour la pagination
   * @returns {Promise<Object>} Liste des conversations archivées
   */
  getArchivedConversations: async (limit = 20, offset = 0) => {
    return apiRequest(`/chat/conversations/archived?limit=${limit}&offset=${offset}`);
  },

  /**
   * Archiver une conversation
   * @param {number} conversationId - ID de la conversation
   * @returns {Promise<Object>} Confirmation
   */
  archiveConversation: async (conversationId) => {
    return apiRequest(`/chat/conversation/${conversationId}/archive`, {
      method: 'PUT',
    });
  },

  /**
   * Désarchiver une conversation
   * @param {number} conversationId - ID de la conversation
   * @returns {Promise<Object>} Confirmation
   */
  unarchiveConversation: async (conversationId) => {
    return apiRequest(`/chat/conversation/${conversationId}/unarchive`, {
      method: 'PUT',
    });
  },

  /**
   * Rechercher dans l'historique des messages
   * @param {string} searchTerm - Terme de recherche
   * @param {number} conversationId - ID de la conversation (optionnel)
   * @param {number} limit - Nombre de résultats maximum
   * @returns {Promise<Object>} Messages trouvés
   */
  searchMessages: async (searchTerm, conversationId = null, limit = 50) => {
    const params = new URLSearchParams({
      q: searchTerm,
      limit: limit.toString(),
    });
    
    if (conversationId) {
      params.append('conversation_id', conversationId.toString());
    }
    
    return apiRequest(`/chat/search/messages?${params.toString()}`);
  },

  /**
   * Obtenir les informations détaillées d'une conversation
   * @param {number} conversationId - ID de la conversation
   * @returns {Promise<Object>} Détails de la conversation
   */
  getConversationDetails: async (conversationId) => {
    return apiRequest(`/chat/conversation/${conversationId}/details`);
  },

  /**
   * Mettre à jour les paramètres de notification pour une conversation
   * @param {number} conversationId - ID de la conversation
   * @param {Object} settings - Paramètres de notification
   * @returns {Promise<Object>} Confirmation
   */
  updateNotificationSettings: async (conversationId, settings) => {
    return apiRequest(`/chat/conversation/${conversationId}/notifications`, {
      method: 'PUT',
      body: JSON.stringify(settings),
    });
  },

  /**
   * Signaler un message inapproprié
   * @param {number} messageId - ID du message
   * @param {string} reason - Raison du signalement
   * @returns {Promise<Object>} Confirmation
   */
  reportMessage: async (messageId, reason) => {
    return apiRequest(`/chat/message/${messageId}/report`, {
      method: 'POST',
      body: JSON.stringify({ reason }),
    });
  },

  /**
   * Obtenir les métriques de performance du chat
   * @param {string} period - Période ('day', 'week', 'month')
   * @returns {Promise<Object>} Métriques
   */
  getChatMetrics: async (period = 'week') => {
    return apiRequest(`/chat/metrics?period=${period}`);
  },
};

export default chatAPI;