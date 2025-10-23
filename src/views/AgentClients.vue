<template>
  <RoleLayout>

    <!-- Main content -->
    <div class="flex-1 flex flex-col overflow-hidden">
      <!-- En-tête avec titre et actions -->
      <div class="bg-white shadow-sm border-b border-gray-200">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div class="flex justify-between items-center py-6">
            <div class="flex items-center">
              <!-- Sidebar toggle handled by RoleLayout -->
               <div>
                <h1 class="text-2xl font-bold text-gray-900">{{ messages.title }}</h1>
                <p class="mt-1 text-sm text-gray-500">{{ messages.subtitle }}</p>
              </div>
            </div>
            
            <div class="flex space-x-3">
              <!-- Bouton de suppression en masse -->
              <button
                v-if="selectedClients.length > 0"
                @click="openBulkDeleteModal"
                class="inline-flex items-center px-4 py-2 border border-red-300 text-sm font-medium rounded-md text-red-700 bg-red-50 hover:bg-red-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
              >
                <TrashIcon class="-ml-1 mr-2 h-4 w-4" />
                {{ messages.bulkDelete }} ({{ selectedClients.length }})
              </button>
              
              <!-- Bouton d'ajout -->
              <button
                @click="showCreateModal = true"
                class="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                <PlusIcon class="-ml-1 mr-2 h-4 w-4" />
                {{ messages.addClient }}
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Contenu principal -->
      <div class="flex-1 overflow-y-auto">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <!-- Filtres et recherche -->
          <SearchAndFilters
            v-model:search="searchQuery"
            v-model:filters="filters"
            v-model:show-filters="showFilters"
            :messages="messages.filters"
            @reset="resetFilters"
          />

          <!-- Actions groupées -->
          <div
            v-if="selectedClients.length > 0"
            class="mb-6 bg-blue-50 border border-blue-200 rounded-lg p-4 flex items-center justify-between"
          >
            <span class="text-blue-800 font-medium">{{ selectedClients.length }} {{ messages.clientsSelected }}</span>
            <div class="flex items-center space-x-3">
              <!-- Bouton notification groupée -->
              <button
                @click="openBulkNotificationModal"
                class="bg-yellow-600 hover:bg-yellow-700 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors duration-200 flex items-center"
              >
                <svg class="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 17h5l-5 5v-5zM11 19H6a2 2 0 01-2-2V7a2 2 0 012-2h5m5 0v5" />
                </svg>
                {{ messages.bulkNotification || 'Notifications' }} ({{ selectedClients.length }})
              </button>
              <!-- Bouton suppression groupée -->
              <button
                @click="openBulkDeleteModal"
                class="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors duration-200 flex items-center"
              >
                <TrashIcon class="h-4 w-4 mr-2" />
                {{ messages.bulkDelete }} ({{ selectedClients.length }})
              </button>
            </div>
          </div>

          <!-- Tableau des clients -->
          <ClientsTable
            :clients="paginatedClients"
            :selected-clients="selectedClients"
            :loading="loading"
            :error="error"
            :messages="messages.table"
            @toggle-all="toggleAllClients"
            @select-client="toggleClientSelection"
            @edit-client="editClient"
            @delete-client="openDeleteModal"
            @assign-agent="openAssignAgentModal"
            @send-email="openSendEmailModal"
            @send-notification="openSendNotificationModal"
            @send-message="openSendMessageModal"
            @toggle-status="toggleClientStatus"
            @status-change="handleStatusChange"
            @show-client-info="showClientInfo"
            @retry="loadClients"
          />

          <!-- Pagination -->
          <Pagination
            v-if="!loading && !error && filteredClients.length > 0"
            :current-page="currentPage"
            :total-pages="totalPages"
            :total-items="filteredClients.length"
            :items-per-page="itemsPerPage"
            :messages="messages.pagination"
            @previous="previousPage"
            @next="nextPage"
            @go-to="goToPage"
          />
        </div>
      </div>
    </div>
  </RoleLayout>

  <!-- Modal d'attribution d'agent -->
  <AgentAssignmentModal
    :show="showAssignAgentModal"
    :client="selectedClientForAssignment"
    :agents="availableAgents"
    :loading="loadingAgents"
    :assigning="assigningAgent"
    @close="closeAssignAgentModal"
    @assign="assignAgent"
  />

  <!-- Modal de suppression -->
  <DeleteModal
    :show="showDeleteModal"
    :client="clientToDelete"
    :is-deleting="isDeleting"
    :messages="messages.deleteModal"
    @confirm="confirmDelete"
    @cancel="closeDeleteModal"
  />

  <!-- Modal de suppression en masse -->
  <BulkDeleteModal
    :show="showBulkDeleteModal"
    :selected-clients="selectedClients"
    :is-deleting="isBulkDeleting"
    :messages="messages.bulkDeleteModal"
    @confirm="confirmBulkDelete"
    @cancel="closeBulkDeleteModal"
  />

  <!-- Modal d'envoi d'email -->
  <EmailModal
    :show="showEmailModal"
    :recipient="emailForm.recipient"
    :recipient-count="selectedClients.length"
    :selected-client-ids="selectedClients.map(c => c.id)"
    @close="closeSendEmailModal"
  />

  <!-- Modal d'envoi de notification -->
   <NotificationModal
    :show="showNotificationModal"
    :recipient="selectedClient"
    :recipient-count="selectedClients.length"
    :selected-client-ids="selectedClients.map(c => c.id)"
    @sent="handleNotificationSent"
    @close="closeSendNotificationModal"
  />

  <!-- Modal d'information client -->
  <ClientInfoModal
    :show="showInfoModal"
    :client="selectedClient || {}"
    :messages="messages.infoModal"
    @close="closeInfoModal"
    @edit="editClientFromInfo"
    @send-email="openSendEmailModal"
    @assign-agent="openAssignAgentModal"
    @change-password="openChangePasswordModal"
  />

  <!-- Modal de modification de mot de passe -->
  <ChangePasswordModal
    :show="showChangePasswordModal"
    :client="selectedClient || {}"
    :loading="isChangingPassword"
    @close="closeChangePasswordModal"
    @submit="handleChangePassword"
  />

  <!-- Modal de création/édition de client -->
  <ClientModal
    :show="showCreateModal || showEditModal"
    :client="newClient"
    :is-editing="showEditModal"
    :validation-errors="validationErrors"
    :is-saving="isSaving"
    :messages="messages.modal"
    @save="(clientData) => showEditModal ? updateClient(clientData) : createClient(clientData)"
    @close="closeModal"
  />
</template>

<script>
import { ref, computed, onMounted, watch } from 'vue'
import { PlusIcon, TrashIcon } from '@heroicons/vue/24/outline'
import RoleLayout from '@/components/RoleLayout.vue'
import SearchAndFilters from '@/components/clients/SearchAndFilters.vue'
import ClientsTable from '@/components/clients/ClientsTable.vue'
import Pagination from '@/components/common/Pagination.vue'
import ClientModal from '@/components/clients/ClientModal.vue'
import ClientInfoModal from '@/components/clients/ClientInfoModal.vue'
import ChangePasswordModal from '@/components/clients/ChangePasswordModal.vue'
import DeleteModal from '@/components/clients/DeleteModal.vue'
import BulkDeleteModal from '@/components/clients/BulkDeleteModal.vue'
import AgentAssignmentModal from '@/components/AgentAssignmentModal.vue'
import EmailModal from '@/components/EmailModal.vue'
import NotificationModal from '@/components/NotificationModal.vue'
import { useClientManagement } from '@/composables/useClientManagement'
import { useNotifications } from '@/composables/useNotifications'
import { useClientStatus } from '@/composables/useClientStatus'
import { ClientStatusUtils } from '@/constants/clientStatus'
import { MESSAGES } from '@/constants/clientMessages'

export default {
  name: 'AgentClients',
  components: {
    RoleLayout,
    SearchAndFilters,
    ClientsTable,
    Pagination,
    ClientModal,
    ClientInfoModal,
    ChangePasswordModal,
    DeleteModal,
    BulkDeleteModal,
    AgentAssignmentModal,
    EmailModal,
    NotificationModal,
    PlusIcon,
    TrashIcon
  },
  setup() {
    // Messages centralisés
    const messages = MESSAGES
    
    // Composables
    const { success: showSuccess, error: showError } = useNotifications()
    const {
      clients,
      loading,
      error,
      loadClients,
      createClient: createClientAPI,
      updateClient: updateClientAPI,
      deleteClient: deleteClientAPI,
      bulkDeleteClients: bulkDeleteClientsAPI,
      updateClientPassword: updateClientPasswordAPI
    } = useClientManagement()
    const {
      changeClientStatus,
      toggleClientStatus: toggleClientStatusFn,
      activateClient,
      deactivateClient,
      suspendClient,
      archiveClient,
      getAvailableActions,
      canPerformAction,
      isChangingStatus
    } = useClientStatus()

    // État réactif
    // sidebarOpen is managed internally by RoleLayout
    const searchQuery = ref('')
    const showFilters = ref(false)
    const filters = ref({
      status: '',
      dateRange: ''
    })
    
    // Sélection
    const selectedClients = ref([])
    
    // Pagination
    const currentPage = ref(1)
    const itemsPerPage = ref(10)
    
    // Modales
    const showCreateModal = ref(false)
    const showEditModal = ref(false)
    const showInfoModal = ref(false)
    const showDeleteModal = ref(false)
    const showBulkDeleteModal = ref(false)
    
    // Données des formulaires
    const newClient = ref({
      first_name: '',
      last_name: '',
      email: '',
      phone: '',
      company: '',
      status: 'active'
    })
    
    const clientToDelete = ref(null)
    const deleteReason = ref('')
    const bulkDeleteReason = ref('')
    
    // États de chargement
    const isSaving = ref(false)
    const isDeleting = ref(false)
    const isBulkDeleting = ref(false)
    
    // Erreurs de validation
    const validationErrors = ref({})
    
    // Nouvelles fonctionnalités
    const showAssignAgentModal = ref(false)
    const showEmailModal = ref(false)
    const showNotificationModal = ref(false)
    const showChangePasswordModal = ref(false)
    const selectedClient = ref(null)
    const selectedClientForAssignment = ref(null)
    const loadingAgents = ref(false)
    const assigningAgent = ref(false)
    const sendingEmail = ref(false)
    const sendingNotification = ref(false)
    const isChangingPassword = ref(false)
    const availableAgents = ref([])
    
    const emailForm = ref({
      recipient: null,
      subject: '',
      content: ''
    })
    
    const notificationForm = ref({
      recipient: null,
      type: 'info',
      title: '',
      message: ''
    })

    // Computed
    const filteredClients = computed(() => {
      let result = clients.value
      
      // Recherche
      if (searchQuery.value) {
        const query = searchQuery.value.toLowerCase()
        result = result.filter(client => 
          client.first_name.toLowerCase().includes(query) ||
          client.last_name.toLowerCase().includes(query) ||
          client.email.toLowerCase().includes(query) ||
          (client.company && client.company.toLowerCase().includes(query))
        )
      }
      
      // Filtres
      if (filters.value.status) {
        result = result.filter(client => client.status === filters.value.status)
      }
      
      if (filters.value.dateRange) {
        const now = new Date()
        const filterDate = new Date()
        
        switch (filters.value.dateRange) {
          case 'today':
            filterDate.setHours(0, 0, 0, 0)
            break
          case 'week':
            filterDate.setDate(now.getDate() - 7)
            break
          case 'month':
            filterDate.setMonth(now.getMonth() - 1)
            break
        }
        
        result = result.filter(client => new Date(client.created_at) >= filterDate)
      }
      
      return result
    })
    
    const totalPages = computed(() => Math.ceil(filteredClients.value.length / itemsPerPage.value))
    
    const paginatedClients = computed(() => {
      const start = (currentPage.value - 1) * itemsPerPage.value
      const end = start + itemsPerPage.value
      return filteredClients.value.slice(start, end)
    })

    // Méthodes
    const resetFilters = () => {
      filters.value = {
        status: '',
        dateRange: ''
      }
      searchQuery.value = ''
    }
    
    const toggleAllClients = () => {
      if (selectedClients.value.length === paginatedClients.value.length) {
        selectedClients.value = []
      } else {
        selectedClients.value = paginatedClients.value.map(client => client.id)
      }
    }
    
    const toggleClientSelection = (clientId) => {
      const index = selectedClients.value.indexOf(clientId)
      if (index > -1) {
        selectedClients.value.splice(index, 1)
      } else {
        selectedClients.value.push(clientId)
      }
    }
    
    // Pagination
    const previousPage = () => {
      if (currentPage.value > 1) {
        currentPage.value--
      }
    }
    
    const nextPage = () => {
      if (currentPage.value < totalPages.value) {
        currentPage.value++
      }
    }
    
    const goToPage = (page) => {
      currentPage.value = page
    }
    
    // Gestion des modales
    const closeModal = () => {
      showCreateModal.value = false
      showEditModal.value = false
      newClient.value = {
        first_name: '',
        last_name: '',
        email: '',
        phone: '',
        company: '',
        status: 'active'
      }
      validationErrors.value = {}
    }
    
    const showClientInfo = (client) => {
      selectedClient.value = client
      showInfoModal.value = true
    }
    
    const closeInfoModal = () => {
      showInfoModal.value = false
      selectedClient.value = null
    }
    
    const editClientFromInfo = (client) => {
      closeInfoModal()
      editClient(client)
    }
    
    const editClient = (client) => {
      newClient.value = { ...client }
      showEditModal.value = true
    }
    
    const openDeleteModal = (client) => {
      clientToDelete.value = client
      deleteReason.value = ''
      showDeleteModal.value = true
    }
    
    const closeDeleteModal = () => {
      showDeleteModal.value = false
      clientToDelete.value = null
      deleteReason.value = ''
    }
    
    const openBulkDeleteModal = () => {
      bulkDeleteReason.value = ''
      showBulkDeleteModal.value = true
    }
    
    const closeBulkDeleteModal = () => {
      showBulkDeleteModal.value = false
      bulkDeleteReason.value = ''
    }
    
    // Actions CRUD
    const createClient = async (clientData = null) => {
      console.log('🏗️ AgentClients - createClient appelé avec:', clientData);
      console.log('🏗️ AgentClients - newClient.value:', newClient.value);
      
      try {
        isSaving.value = true
        validationErrors.value = {}
        
        // Utiliser les données passées en paramètre ou les données par défaut
        const dataToSave = clientData || newClient.value
        console.log('🏗️ AgentClients - dataToSave final:', dataToSave);
        console.log('🏗️ AgentClients - dataToSave.first_name:', dataToSave.first_name);
        console.log('🏗️ AgentClients - dataToSave.last_name:', dataToSave.last_name);
        
        await createClientAPI(dataToSave)
        showSuccess(messages.notifications.clientCreated)
        closeModal()
        await loadClients()
      } catch (error) {
        if (error.response?.data?.errors) {
          validationErrors.value = error.response.data.errors
        } else {
          showError(messages.notifications.createError)
        }
      } finally {
        isSaving.value = false
      }
    }
    
    const updateClient = async (clientData = null) => {
      try {
        isSaving.value = true
        validationErrors.value = {}
        
        // Utiliser les données passées en paramètre ou les données par défaut
        const dataToSave = clientData || newClient.value
        await updateClientAPI(dataToSave.id, dataToSave)
        showSuccess(messages.notifications.clientUpdated)
        closeModal()
        await loadClients()
      } catch (error) {
        if (error.response?.data?.errors) {
          validationErrors.value = error.response.data.errors
        } else {
          showError(messages.notifications.updateError)
        }
      } finally {
        isSaving.value = false
      }
    }
    
    const confirmDelete = async (password) => {
      try {
        isDeleting.value = true
        
        await deleteClientAPI(clientToDelete.value.id, deleteReason.value, password)
        showSuccess(messages.notifications.deleteSuccess)
        closeDeleteModal()
        await loadClients()
      } catch (error) {
        if (error.response && error.response.status === 401) {
          showError(messages.notifications.deletePasswordError)
        } else {
          showError(messages.notifications.deleteError)
        }
      } finally {
        isDeleting.value = false
      }
    }
    
    const confirmBulkDelete = async (password) => {
      try {
        isBulkDeleting.value = true
        
        await bulkDeleteClientsAPI(selectedClients.value, bulkDeleteReason.value, password)
        showSuccess(messages.notifications.bulkDeleteSuccess)
        selectedClients.value = []
        closeBulkDeleteModal()
        await loadClients()
      } catch (error) {
        if (error.response && error.response.status === 401) {
          showError(messages.notifications.bulkDeletePasswordError)
        } else {
          showError(messages.notifications.bulkDeleteError)
        }
      } finally {
        isBulkDeleting.value = false
      }
    }
    
    const getInitials = (firstName, lastName) => {
      const first = firstName && firstName.length > 0 ? firstName[0] : '?'
      const last = lastName && lastName.length > 0 ? lastName[0] : '?'
      return `${first}${last}`.toUpperCase()
    }
    
    // Basculer le statut d'un client (utilise le nouveau système)
    const toggleClientStatus = async (client) => {
      await toggleClientStatusFn(client)
    }
    
    // Gérer le changement de statut depuis le menu
    const handleStatusChange = async (client, newStatus) => {
      await changeClientStatus(client, newStatus)
    }
    
    // Fonctions pour ouvrir les modales
    const openAssignAgentModal = async (client) => {
      selectedClientForAssignment.value = client
      await loadAvailableAgents()
      showAssignAgentModal.value = true
    }

    const closeAssignAgentModal = () => {
      showAssignAgentModal.value = false
      selectedClientForAssignment.value = null
    }

    const loadAvailableAgents = async () => {
      loadingAgents.value = true
      try {
        // Utiliser la même logique de récupération de token que aiChatService
        const authToken = localStorage.getItem('accessToken') || localStorage.getItem('authToken') || null
        
        if (!authToken) {
          console.error('Aucun token d\'authentification trouvé')
          return
        }
        
        const base = import.meta.env.VITE_API_URL || import.meta.env.VITE_BACKEND_URL || 'http://localhost:3000'
        const response = await fetch(`${base}/api/agent/available`, {
          headers: {
            'Authorization': `Bearer ${authToken}`,
            'Content-Type': 'application/json'
          }
        })
        
        if (response.ok) {
          const data = await response.json()
          availableAgents.value = data.data || data
          console.log('Agents disponibles chargés:', availableAgents.value)
        } else {
          console.error('Erreur HTTP lors du chargement des agents:', response.status, response.statusText)
        }
      } catch (error) {
        console.error('Erreur lors du chargement des agents:', error)
      } finally {
        loadingAgents.value = false
      }
    }

    const assignAgent = async (agent) => {
      if (!selectedClientForAssignment.value || !agent) return
      
      assigningAgent.value = true
      try {
        const base = import.meta.env.VITE_API_URL || import.meta.env.VITE_BACKEND_URL || 'http://localhost:3000'
        const response = await fetch(`${base}/api/client/${selectedClientForAssignment.value.id}/assign-agent`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('accessToken')}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ agentId: agent.id })
        })
        
        if (response.ok) {
          // Afficher un message de succès avant de fermer la modale
          showSuccess(`Agent ${agent.first_name} ${agent.last_name} assigné avec succès au client ${selectedClientForAssignment.value.first_name} ${selectedClientForAssignment.value.last_name}`)
          // Rafraîchir la liste des clients
          await loadClients()
          closeAssignAgentModal()
        } else {
          const errorData = await response.json().catch(() => ({ message: 'Erreur inconnue' }))
          showError(`Erreur lors de l'assignation de l'agent: ${errorData.message || 'Erreur inconnue'}`)
        }
      } catch (error) {
        console.error('Erreur:', error)
        showError('Erreur de connexion lors de l\'assignation de l\'agent')
      } finally {
        assigningAgent.value = false
      }
    }
    
    const openSendEmailModal = (client) => {
      emailForm.value.recipient = client
      showEmailModal.value = true
    }
    
    const closeSendEmailModal = () => {
      showEmailModal.value = false
      emailForm.value = {
        recipient: null,
        subject: '',
        content: ''
      }
    }
    

    
    const openSendNotificationModal = (client) => {
      selectedClient.value = client
      selectedClients.value = [] // Reset la sélection multiple
      showNotificationModal.value = true
    }
    
    const openBulkNotificationModal = () => {
      selectedClient.value = null // Reset la sélection individuelle
      showNotificationModal.value = true
    }
    
    const closeSendNotificationModal = () => {
      showNotificationModal.value = false
      selectedClient.value = null
      selectedClients.value = []
    }
     
     const handleSendNotification = async (notificationData) => {
       try {
         let result
         
         if (selectedClient.value) {
           // Envoi à un client spécifique
           result = await notifications.sendNotificationToClient(selectedClient.value.id, notificationData)
         } else if (selectedClients.value.length > 0) {
           // Envoi groupé
           const clientIds = selectedClients.value.map(client => client.id)
           result = await notifications.sendNotificationToMultipleClients(clientIds, notificationData)
         }
         
         if (result?.success) {
           closeSendNotificationModal()
           // Rafraîchir la liste si nécessaire
           await loadClients()
         }
       } catch (error) {
         console.error('Erreur lors de l\'envoi de la notification:', error)
         notifications.error('Erreur lors de l\'envoi de la notification')
       }
     }
     
     const handleNotificationSent = (data) => {
       // La notification a été envoyée avec succès
       if (data.type === 'single') {
         showSuccess(`Notification envoyée à ${data.recipient.first_name} ${data.recipient.last_name}`)
       } else if (data.type === 'group') {
         showSuccess(`${data.successCount} notifications envoyées avec succès`)
         if (data.failureCount > 0) {
           showError(`${data.failureCount} notifications ont échoué`)
         }
       }
       // Rafraîchir la liste des clients si nécessaire
       loadClients()
     }
    
    const openSendMessageModal = (client) => {
      // Alias pour openSendNotificationModal
      openSendNotificationModal(client)
    }
    
    const openChangePasswordModal = (client) => {
      selectedClient.value = client
      showChangePasswordModal.value = true
    }
    
    const closeChangePasswordModal = () => {
      showChangePasswordModal.value = false
      selectedClient.value = null
    }
    
    const handleChangePassword = async (passwordData) => {
      try {
        isChangingPassword.value = true
        await updateClientPasswordAPI(passwordData.clientId, passwordData.newPassword)
        showSuccess('Mot de passe modifié avec succès')
        closeChangePasswordModal()
      } catch (error) {
        console.error('Erreur lors de la modification du mot de passe:', error)
        showError('Erreur lors de la modification du mot de passe')
      } finally {
        isChangingPassword.value = false
      }
    }

    // Watchers
    watch([searchQuery, filters], () => {
      currentPage.value = 1
    }, { deep: true })

    // Lifecycle
    onMounted(() => {
      loadClients()
    })

    return {
      // Messages
      messages,
      
      // État
      searchQuery,
      showFilters,
      filters,
      selectedClient,
      selectedClients,
      currentPage,
      itemsPerPage,
      
      // Modales
      showCreateModal,
      showEditModal,
      showInfoModal,
      showDeleteModal,
      showBulkDeleteModal,
      showAssignAgentModal,
      showEmailModal,
      showChangePasswordModal,
      
      // Données
      newClient,
      clientToDelete,
      deleteReason,
      bulkDeleteReason,
      selectedClientForAssignment,
      availableAgents,
      emailForm,
      
      // États de chargement
      loading,
      error,
      isSaving,
      isDeleting,
      isBulkDeleting,
      loadingAgents,
      assigningAgent,
      sendingEmail,
      isChangingPassword,
      validationErrors,
      
      // Computed
      filteredClients,
      totalPages,
      paginatedClients,
      
      // Méthodes
      resetFilters,
      toggleAllClients,
      toggleClientSelection,
      previousPage,
      nextPage,
      goToPage,
      closeModal,
      showClientInfo,
      closeInfoModal,
      editClientFromInfo,
      editClient,
      openDeleteModal,
      closeDeleteModal,
      openBulkDeleteModal,
      closeBulkDeleteModal,
      createClient,
      updateClient,
      confirmDelete,
      confirmBulkDelete,
      showNotificationModal,
      notificationForm,
      sendingNotification,
      getInitials,
      toggleClientStatus,
      handleStatusChange,
      openAssignAgentModal,
      closeAssignAgentModal,
      assignAgent,
      openSendEmailModal,
      closeSendEmailModal,
      openSendNotificationModal,
      openBulkNotificationModal,
      closeSendNotificationModal,
      handleSendNotification,
      handleNotificationSent,
      openSendMessageModal,
      openChangePasswordModal,
      closeChangePasswordModal,
      handleChangePassword,
      loadClients,
      showSuccess,
      showError
    }
  }
}
</script>

<style scoped>
/* Styles spécifiques au composant si nécessaire */
</style>