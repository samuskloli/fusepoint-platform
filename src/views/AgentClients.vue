<template>
  <div class="flex h-screen bg-gray-50">
    <!-- Sidebar -->
    <div
      class="fixed inset-y-0 left-0 z-50 w-64 bg-gray-900 transform transition-transform duration-300 ease-in-out md:translate-x-0 md:static md:inset-0"
      :class="{ '-translate-x-full': !sidebarOpen, 'translate-x-0': sidebarOpen }"
    >
      <AgentSidebar @close-sidebar="sidebarOpen = false" />
    </div>

    <!-- Overlay for mobile -->
    <div
      v-if="sidebarOpen"
      class="fixed inset-0 z-40 bg-gray-600 bg-opacity-75 md:hidden"
      @click="sidebarOpen = false"
    ></div>

    <!-- Main content -->
    <div class="flex-1 flex flex-col overflow-hidden">
      <!-- En-tête avec titre et actions -->
      <div class="bg-white shadow-sm border-b border-gray-200">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div class="flex justify-between items-center py-6">
            <div class="flex items-center">
              <!-- Bouton menu mobile -->
              <button
                @click="sidebarOpen = !sidebarOpen"
                class="md:hidden p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-500 mr-4"
              >
                <svg class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </button>
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
            @toggle-status="toggleClientStatus"
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
  </div>
</template>

<script>
import { ref, computed, onMounted, watch } from 'vue'
import { PlusIcon, TrashIcon } from '@heroicons/vue/24/outline'
import AgentSidebar from '@/components/AgentSidebar.vue'
import SearchAndFilters from '@/components/clients/SearchAndFilters.vue'
import ClientsTable from '@/components/clients/ClientsTable.vue'
import Pagination from '@/components/common/Pagination.vue'
import ClientModal from '@/components/clients/ClientModal.vue'
import DeleteModal from '@/components/clients/DeleteModal.vue'
import BulkDeleteModal from '@/components/clients/BulkDeleteModal.vue'
import { useClientManagement } from '@/composables/useClientManagement'
import { useNotifications } from '@/composables/useNotifications'
import { MESSAGES } from '@/constants/clientMessages'

export default {
  name: 'AgentClients',
  components: {
    AgentSidebar,
    SearchAndFilters,
    ClientsTable,
    Pagination,
    ClientModal,
    DeleteModal,
    BulkDeleteModal,
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
      bulkDeleteClients: bulkDeleteClientsAPI
    } = useClientManagement()

    // État réactif
    const sidebarOpen = ref(false)
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
    const selectedClientForAssignment = ref(null)
    const assigningAgent = ref(false)
    const sendingEmail = ref(false)
    const sendingNotification = ref(false)
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
    const createClient = async () => {
      try {
        isSaving.value = true
        validationErrors.value = {}
        
        await createClientAPI(newClient.value)
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
    
    const updateClient = async () => {
      try {
        isSaving.value = true
        validationErrors.value = {}
        
        await updateClientAPI(newClient.value.id, newClient.value)
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
    
    const toggleClientStatus = async (client) => {
      try {
        const newIsActive = !client.is_active
        const statusText = newIsActive ? 'activé' : 'désactivé'
        showSuccess(`Client ${client.first_name} ${client.last_name} ${statusText} avec succès`)
        
        const clientIndex = clients.value.findIndex(c => c.id === client.id)
        if (clientIndex !== -1) {
          clients.value[clientIndex] = { ...clients.value[clientIndex], is_active: newIsActive }
        }
        
        const token = localStorage.getItem('accessToken') || localStorage.getItem('token')
        const response = await fetch(`/api/agent/clients/${client.id}/status`, {
          method: 'PUT',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            is_active: newIsActive
          })
        })
        
        if (!response.ok) {
          if (clientIndex !== -1) {
            clients.value[clientIndex] = { ...clients.value[clientIndex], is_active: !newIsActive }
          }
          const errorData = await response.json()
          showError(`Erreur lors du changement de statut: ${errorData.message || 'Erreur inconnue'}`)
          return
        }
        
        loadClients().catch(console.error)
      } catch (error) {
        console.error('Erreur lors du changement de statut:', error)
        showError('Erreur lors du changement de statut du client')
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
      sidebarOpen,
      searchQuery,
      showFilters,
      filters,
      selectedClients,
      currentPage,
      itemsPerPage,
      
      // Modales
      showCreateModal,
      showEditModal,
      showDeleteModal,
      showBulkDeleteModal,
      showAssignAgentModal,
      showEmailModal,
      
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
      assigningAgent,
      sendingEmail,
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