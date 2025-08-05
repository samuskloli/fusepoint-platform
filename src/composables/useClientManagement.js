// Composable pour la gestion des clients
// Centralise toute la logique métier liée aux clients

import { ref, reactive, computed } from 'vue'
import api from '@/services/api'
import { useNotifications } from '@/composables/useNotifications'
import { useClientStatus } from '@/composables/useClientStatus'
import { ClientStatusUtils } from '@/constants/clientStatus'

export function useClientManagement() {
  const { success: showSuccess, error: showError } = useNotifications()
  const clientStatusManager = useClientStatus()
  
  // État réactif
  const clients = ref([])
  const loading = ref(false)
  const error = ref(null)
  
  // Configuration de l'API
  const API_BASE = '/api/agent/clients'
  
  // Charger la liste des clients
  const loadClients = async () => {
    loading.value = true
    error.value = null
    
    try {
      const response = await api.get(API_BASE)
      clients.value = response.data.data || []
    } catch (err) {
      console.error('Erreur lors du chargement des clients:', err)
      error.value = 'Erreur lors du chargement des clients'
      clients.value = []
    } finally {
      loading.value = false
    }
  }
  
  // Créer un nouveau client
  const createClient = async (clientData) => {
    try {
      const response = await api.post('/api/agent/clients', clientData)
      
      if (response.data.success) {
        // Ajouter le nouveau client à la liste locale
        clients.value.unshift(response.data.client)
        return response.data.client
      } else {
        throw new Error(response.data.message || 'Erreur lors de la création')
      }
    } catch (err) {
      console.error('Erreur lors de la création du client:', err)
      throw err
    }
  }
  
  // Mettre à jour un client existant
  const updateClient = async (clientId, clientData) => {
    try {
      const response = await api.put(`/api/agent/clients/${clientId}`, clientData)
      
      if (response.data.success) {
        // Mettre à jour le client dans la liste locale
        const index = clients.value.findIndex(c => c.id === clientId)
        if (index !== -1) {
          clients.value[index] = response.data.client
        }
        return response.data.client
      } else {
        throw new Error(response.data.message || 'Erreur lors de la modification')
      }
    } catch (err) {
      console.error('Erreur lors de la modification du client:', err)
      throw err
    }
  }
  
  // Supprimer définitivement un client
  const deleteClient = async (clientId, reason, password) => {
    try {
      const response = await api.delete(`/api/agent/clients/${clientId}`, {
        data: { reason, password }
      })
      
      if (response.data.success) {
        // Supprimer le client de la liste locale
        const clientIndex = clients.value.findIndex(c => c.id === clientId)
        if (clientIndex !== -1) {
          clients.value.splice(clientIndex, 1)
        }
        return response.data
      } else {
        throw new Error(response.data.message || 'Erreur lors de la suppression')
      }
    } catch (err) {
      console.error('Erreur lors de la suppression:', err)
      throw err
    }
  }
  
  // Supprimer définitivement plusieurs clients
  const bulkDeleteClients = async (clientIds, reason, password) => {
    try {
      const promises = clientIds.map(clientId => 
        api.delete(`/api/agent/clients/${clientId}`, {
          data: { reason, password }
        })
      )
      
      const responses = await Promise.all(promises)
      
      // Vérifier que toutes les requêtes ont réussi
      const allSuccessful = responses.every(response => response.data.success)
      
      if (allSuccessful) {
        // Supprimer les clients de la liste locale
        clientIds.forEach(clientId => {
          const clientIndex = clients.value.findIndex(c => c.id === clientId)
          if (clientIndex !== -1) {
            clients.value.splice(clientIndex, 1)
          }
        })
        return responses
      } else {
        throw new Error('Certaines suppressions ont échoué')
      }
    } catch (err) {
      console.error('Erreur lors des suppressions en masse:', err)
      throw err
    }
  }
  
  // Obtenir un client par ID
  const getClientById = (clientId) => {
    return clients.value.find(client => client.id === clientId)
  }
  
  // Filtrer les clients par statut
  const getClientsByStatus = (status) => {
    return clients.value.filter(client => {
      const clientStatus = ClientStatusUtils.getClientStatus(client)
      return clientStatus?.key === status
    })
  }
  
  // Rechercher des clients
  const searchClients = (query) => {
    if (!query) return clients.value
    
    const searchTerm = query.toLowerCase()
    return clients.value.filter(client => 
      client.first_name.toLowerCase().includes(searchTerm) ||
      client.last_name.toLowerCase().includes(searchTerm) ||
      client.email.toLowerCase().includes(searchTerm) ||
      (client.company && client.company.toLowerCase().includes(searchTerm))
    )
  }
  
  // Statistiques des clients
  const getClientStats = () => {
    return clientStatusManager.getStatusStats(clients.value)
  }
  
  // Fonctions utilitaires
  const getInitials = (firstName, lastName) => {
    const first = firstName && firstName.length > 0 ? firstName[0] : '?'
    const last = lastName && lastName.length > 0 ? lastName[0] : '?'
    return `${first}${last}`.toUpperCase()
  }
  
  const formatDate = (dateString) => {
    if (!dateString) return 'Jamais'
    const date = new Date(dateString)
    return date.toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    })
  }
  
  const formatDateTime = (dateString) => {
    if (!dateString) return 'Jamais'
    const date = new Date(dateString)
    return date.toLocaleString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }
  
  // Validation des données client
  const validateClientData = (clientData) => {
    const errors = {}
    
    if (!clientData.first_name || clientData.first_name.trim().length === 0) {
      errors.first_name = 'Le prénom est requis'
    }
    
    if (!clientData.last_name || clientData.last_name.trim().length === 0) {
      errors.last_name = 'Le nom est requis'
    }
    
    if (!clientData.email || clientData.email.trim().length === 0) {
      errors.email = 'L\'email est requis'
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(clientData.email)) {
      errors.email = 'L\'email n\'est pas valide'
    }
    
    if (clientData.phone && !/^[+]?[0-9\s\-\(\)]+$/.test(clientData.phone)) {
      errors.phone = 'Le numéro de téléphone n\'est pas valide'
    }
    
    return {
      isValid: Object.keys(errors).length === 0,
      errors
    }
  }
  
  // Fonctions de gestion de statut (délégation vers useClientStatus)
  const changeClientStatus = async (client, newStatus, options = {}) => {
    return await clientStatusManager.changeClientStatus(client, newStatus, options)
  }
  
  const activateClient = async (client, options = {}) => {
    return await clientStatusManager.activateClient(client, options)
  }
  
  const deactivateClient = async (client, options = {}) => {
    return await clientStatusManager.deactivateClient(client, options)
  }
  
  const suspendClient = async (client, options = {}) => {
    return await clientStatusManager.suspendClient(client, options)
  }
  
  const archiveClient = async (client, options = {}) => {
    return await clientStatusManager.archiveClient(client, options)
  }
  
  const toggleClientStatus = async (client, options = {}) => {
    return await clientStatusManager.toggleClientStatus(client, options)
  }
  
  const bulkChangeStatus = async (clients, newStatus, options = {}) => {
    return await clientStatusManager.bulkChangeStatus(clients, newStatus, options)
  }
  
  const getAvailableActions = (client) => {
    return clientStatusManager.getAvailableActions(client)
  }
  
  const canPerformAction = (client, action) => {
    return clientStatusManager.canPerformAction(client, action)
  }
  
  return {
    // État
    clients,
    loading,
    error,
    
    // Actions CRUD
    loadClients,
    createClient,
    updateClient,
    deleteClient,
    bulkDeleteClients,
    
    // Gestion de statut
    changeClientStatus,
    activateClient,
    deactivateClient,
    suspendClient,
    archiveClient,
    toggleClientStatus,
    bulkChangeStatus,
    getAvailableActions,
    canPerformAction,
    
    // Recherche et filtrage
    getClientById,
    getClientsByStatus,
    searchClients,
    getClientStats,
    
    // Utilitaires
    getInitials,
    formatDate,
    formatDateTime,
    validateClientData,
    
    // Accès aux utilitaires de statut
    ClientStatusUtils,
    
    // État du gestionnaire de statut
    isChangingStatus: clientStatusManager.isChangingStatus,
    hasActiveChanges: clientStatusManager.hasActiveChanges
  }
}