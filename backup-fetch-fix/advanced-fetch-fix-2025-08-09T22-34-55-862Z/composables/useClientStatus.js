// Composable centralisé pour la gestion des statuts clients
// Centralise toute la logique de changement de statut avec synchronisation backend

import { ref, computed } from 'vue'
import { ClientStatusUtils } from '@/constants/clientStatus'
import api from '@/services/api'
import { useNotifications } from '@/composables/useNotifications'

export function useClientStatus() {
  const { success: showSuccess, error: showError } = useNotifications()
  
  // État réactif
  const isChangingStatus = ref(false)
  const statusChangeQueue = ref(new Map()) // Queue pour gérer les changements multiples
  
  /**
   * Changer le statut d'un client
   * @param {Object} client - Objet client
   * @param {Object} newStatus - Nouveau statut
   * @param {Object} options - Options supplémentaires
   * @returns {Promise<Object>} Résultat du changement
   */
  const changeClientStatus = async (client, newStatus, options = {}) => {
    const {
      showNotification = true,
      updateLocalState = true,
      reason = '',
      skipValidation = false
    } = options
    
    // Déclarer originalClientState en dehors du bloc try pour éviter les erreurs de portée
    let originalClientState = null
    
    try {
      // Vérifier si un changement est déjà en cours pour ce client
      if (statusChangeQueue.value.has(client.id)) {
        throw new Error('Un changement de statut est déjà en cours pour ce client')
      }
      
      // Obtenir le statut actuel
      const currentStatus = ClientStatusUtils.getClientStatus(client)
      
      // Validation du changement si pas ignorée
      if (!skipValidation) {
        const validation = ClientStatusUtils.validateStatusChange(currentStatus, newStatus)
        if (!validation.valid) {
          throw new Error(validation.message)
        }
      }
      
      // Marquer le changement comme en cours
      isChangingStatus.value = true
      statusChangeQueue.value.set(client.id, {
        clientId: client.id,
        currentStatus,
        newStatus,
        timestamp: Date.now()
      })
      
      // Mise à jour optimiste de l'état local si demandée
      if (updateLocalState && client) {
        originalClientState = { ...client }
        updateClientLocalStatus(client, newStatus)
      }
      
      // Pas de notification de début pour éviter les doublons
      
      // Appel API pour changer le statut
      const response = await api.put(`/api/agent/clients/${client.id}/status`, {
        status: newStatus.key,
        status_value: newStatus.value,
        reason: reason,
        previous_status: currentStatus?.key
      })
      
      if (!response.data.success) {
        throw new Error(response.data.message || 'Erreur lors du changement de statut')
      }
      
      // Mise à jour avec les données du serveur
      const updatedClient = response.data.client || response.data.data
      if (updateLocalState && updatedClient) {
        Object.assign(client, updatedClient)
      }
      
      // Notification de succès
      if (showNotification) {
        showSuccess(`Statut changé vers "${newStatus.label}" avec succès`)
      }
      
      return {
        success: true,
        client: updatedClient || client,
        previousStatus: currentStatus,
        newStatus: newStatus,
        message: 'Statut changé avec succès'
      }
      
    } catch (error) {
      console.error('Erreur lors du changement de statut:', error)
      
      // Restaurer l'état local en cas d'erreur
      if (updateLocalState && originalClientState) {
        Object.assign(client, originalClientState)
      }
      
      // Notification d'erreur
      if (showNotification) {
        const errorMessage = error.response?.data?.message || error.message || 'Erreur lors du changement de statut'
        showError(errorMessage)
      }
      
      return {
        success: false,
        error: error.message,
        client: client
      }
      
    } finally {
      // Nettoyer l'état
      isChangingStatus.value = false
      statusChangeQueue.value.delete(client.id)
    }
  }
  
  /**
   * Activer un client
   * @param {Object} client - Objet client
   * @param {Object} options - Options
   * @returns {Promise<Object>} Résultat
   */
  const activateClient = async (client, options = {}) => {
    const activeStatus = ClientStatusUtils.getStatusByKey('active')
    return await changeClientStatus(client, activeStatus, {
      ...options,
      reason: options.reason || 'Activation du client'
    })
  }
  
  /**
   * Désactiver un client
   * @param {Object} client - Objet client
   * @param {Object} options - Options
   * @returns {Promise<Object>} Résultat
   */
  const deactivateClient = async (client, options = {}) => {
    const inactiveStatus = ClientStatusUtils.getStatusByKey('inactive')
    return await changeClientStatus(client, inactiveStatus, {
      ...options,
      reason: options.reason || 'Désactivation du client'
    })
  }
  
  /**
   * Suspendre un client
   * @param {Object} client - Objet client
   * @param {Object} options - Options
   * @returns {Promise<Object>} Résultat
   */
  const suspendClient = async (client, options = {}) => {
    const suspendedStatus = ClientStatusUtils.getStatusByKey('suspended')
    return await changeClientStatus(client, suspendedStatus, {
      ...options,
      reason: options.reason || 'Suspension du client'
    })
  }
  
  /**
   * Archiver un client
   * @param {Object} client - Objet client
   * @param {Object} options - Options
   * @returns {Promise<Object>} Résultat
   */
  const archiveClient = async (client, options = {}) => {
    const archivedStatus = ClientStatusUtils.getStatusByKey('archived')
    return await changeClientStatus(client, archivedStatus, {
      ...options,
      reason: options.reason || 'Archivage du client'
    })
  }
  
  /**
   * Basculer entre actif/inactif (pour compatibilité)
   * @param {Object} client - Objet client
   * @param {Object} options - Options
   * @returns {Promise<Object>} Résultat
   */
  const toggleClientStatus = async (client, options = {}) => {
    const currentStatus = ClientStatusUtils.getClientStatus(client)
    
    // Logique de basculement
    let targetStatus
    if (currentStatus?.key === 'active') {
      targetStatus = ClientStatusUtils.getStatusByKey('inactive')
    } else {
      targetStatus = ClientStatusUtils.getStatusByKey('active')
    }
    
    return await changeClientStatus(client, targetStatus, options)
  }
  
  /**
   * Mettre à jour le statut local d'un client
   * @param {Object} client - Objet client
   * @param {Object} status - Nouveau statut
   */
  const updateClientLocalStatus = (client, status) => {
    if (!client || !status) return
    
    // Mettre à jour les propriétés du client
    client.status = status.key
    client.is_active = status.value
    
    // Mettre à jour la date de modification
    client.updated_at = new Date().toISOString()
  }
  
  /**
   * Vérifier si un client est en cours de changement de statut
   * @param {number} clientId - ID du client
   * @returns {boolean} True si en cours de changement
   */
  const isClientStatusChanging = (clientId) => {
    return statusChangeQueue.value.has(clientId)
  }
  
  /**
   * Obtenir les actions disponibles pour un client
   * @param {Object} client - Objet client
   * @returns {Array} Liste des actions disponibles
   */
  const getAvailableActions = (client) => {
    const currentStatus = ClientStatusUtils.getClientStatus(client)
    return ClientStatusUtils.getAvailableActions(currentStatus)
  }
  
  /**
   * Vérifier si une action est autorisée pour un client
   * @param {Object} client - Objet client
   * @param {string} action - Action à vérifier
   * @returns {boolean} True si autorisée
   */
  const canPerformAction = (client, action) => {
    const currentStatus = ClientStatusUtils.getClientStatus(client)
    return ClientStatusUtils.canPerformAction(currentStatus, action)
  }
  
  /**
   * Obtenir les statistiques des statuts
   * @param {Array} clients - Liste des clients
   * @returns {Object} Statistiques
   */
  const getStatusStats = (clients) => {
    if (!Array.isArray(clients)) return {}
    
    const stats = {
      total: clients.length,
      active: 0,
      inactive: 0,
      pending: 0,
      suspended: 0,
      archived: 0
    }
    
    clients.forEach(client => {
      const status = ClientStatusUtils.getClientStatus(client)
      if (status && stats.hasOwnProperty(status.key)) {
        stats[status.key]++
      }
    })
    
    return stats
  }
  
  /**
   * Changement de statut en masse
   * @param {Array} clients - Liste des clients
   * @param {Object} newStatus - Nouveau statut
   * @param {Object} options - Options
   * @returns {Promise<Object>} Résultat
   */
  const bulkChangeStatus = async (clients, newStatus, options = {}) => {
    const results = {
      success: [],
      errors: [],
      total: clients.length
    }
    
    try {
      isChangingStatus.value = true
      
      // Traiter les clients par lots pour éviter la surcharge
      const batchSize = 5
      for (let i = 0; i < clients.length; i += batchSize) {
        const batch = clients.slice(i, i + batchSize)
        
        const batchPromises = batch.map(async (client) => {
          try {
            const result = await changeClientStatus(client, newStatus, {
              ...options,
              showNotification: false // Éviter les notifications multiples
            })
            
            if (result.success) {
              results.success.push({ client, result })
            } else {
              results.errors.push({ client, error: result.error })
            }
          } catch (error) {
            results.errors.push({ client, error: error.message })
          }
        })
        
        await Promise.all(batchPromises)
      }
      
      // Notification globale
      if (options.showNotification !== false) {
        if (results.errors.length === 0) {
          showSuccess(`${results.success.length} clients mis à jour vers "${newStatus.label}"`)
        } else {
          showError(`${results.errors.length} erreurs sur ${results.total} clients`)
        }
      }
      
      return results
      
    } finally {
      isChangingStatus.value = false
    }
  }
  
  // Computed properties
  const hasActiveChanges = computed(() => {
    return statusChangeQueue.value.size > 0
  })
  
  const activeChangesCount = computed(() => {
    return statusChangeQueue.value.size
  })
  
  return {
    // État
    isChangingStatus,
    hasActiveChanges,
    activeChangesCount,
    
    // Actions principales
    changeClientStatus,
    activateClient,
    deactivateClient,
    suspendClient,
    archiveClient,
    toggleClientStatus,
    bulkChangeStatus,
    
    // Utilitaires
    updateClientLocalStatus,
    isClientStatusChanging,
    getAvailableActions,
    canPerformAction,
    getStatusStats,
    
    // Accès aux utilitaires de statut
    ClientStatusUtils
  }
}