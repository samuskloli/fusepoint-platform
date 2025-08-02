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
      <!-- Header -->
      <Header @toggle-sidebar="sidebarOpen = !sidebarOpen" />

      <!-- Main content area -->
      <main class="flex-1 overflow-y-auto bg-gray-50">
        <!-- Page Header -->
        <div class="bg-white shadow-sm border-b border-gray-200">
          <div class="px-4 sm:px-6 lg:px-8">
            <div class="flex justify-between items-center py-6">
              <div>
                <h1 class="text-2xl font-bold text-gray-900">Demandes de Service</h1>
                <p class="mt-1 text-sm text-gray-500">Gérez les demandes de service de vos clients</p>
              </div>
              <div class="flex space-x-3">
                <button
                  @click="refreshRequests"
                  class="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
                >
                  <svg class="-ml-1 mr-2 h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                  Actualiser
                </button>
              </div>
            </div>
          </div>
        </div>

        <!-- Content -->
        <div class="p-4 sm:p-6 lg:p-8">
          <!-- Stats Cards -->
          <div class="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
            <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div class="flex items-center">
                <div class="flex-shrink-0">
                  <div class="w-8 h-8 bg-blue-100 rounded-md flex items-center justify-center">
                    <svg class="w-5 h-5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                    </svg>
                  </div>
                </div>
                <div class="ml-4">
                  <p class="text-sm font-medium text-gray-500">Total</p>
                  <p class="text-2xl font-semibold text-gray-900">{{ stats.total }}</p>
                </div>
              </div>
            </div>
            
            <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div class="flex items-center">
                <div class="flex-shrink-0">
                  <div class="w-8 h-8 bg-yellow-100 rounded-md flex items-center justify-center">
                    <svg class="w-5 h-5 text-yellow-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                </div>
                <div class="ml-4">
                  <p class="text-sm font-medium text-gray-500">En Attente</p>
                  <p class="text-2xl font-semibold text-gray-900">{{ stats.pending }}</p>
                </div>
              </div>
            </div>
            
            <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div class="flex items-center">
                <div class="flex-shrink-0">
                  <div class="w-8 h-8 bg-blue-100 rounded-md flex items-center justify-center">
                    <svg class="w-5 h-5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                  </div>
                </div>
                <div class="ml-4">
                  <p class="text-sm font-medium text-gray-500">En Cours</p>
                  <p class="text-2xl font-semibold text-gray-900">{{ stats.in_progress }}</p>
                </div>
              </div>
            </div>
            
            <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div class="flex items-center">
                <div class="flex-shrink-0">
                  <div class="w-8 h-8 bg-green-100 rounded-md flex items-center justify-center">
                    <svg class="w-5 h-5 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                </div>
                <div class="ml-4">
                  <p class="text-sm font-medium text-gray-500">Terminées</p>
                  <p class="text-2xl font-semibold text-gray-900">{{ stats.completed }}</p>
                </div>
              </div>
            </div>
          </div>

          <!-- Filters -->
          <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
            <div class="grid grid-cols-1 md:grid-cols-5 gap-4">
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">Rechercher</label>
                <input
                  v-model="searchQuery"
                  type="text"
                  placeholder="Titre, description..."
                  class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">Statut</label>
                <select v-model="statusFilter" class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500">
                  <option value="">Tous</option>
                  <option value="pending">En Attente</option>
                  <option value="in_progress">En Cours</option>
                  <option value="completed">Terminé</option>
                  <option value="cancelled">Annulé</option>
                </select>
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">Priorité</label>
                <select v-model="priorityFilter" class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500">
                  <option value="">Toutes</option>
                  <option value="low">Basse</option>
                  <option value="medium">Moyenne</option>
                  <option value="high">Haute</option>
                  <option value="urgent">Urgente</option>
                </select>
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">Type de Service</label>
                <select v-model="serviceTypeFilter" class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500">
                  <option value="">Tous</option>
                  <option value="consultation">Consultation</option>
                  <option value="development">Développement</option>
                  <option value="design">Design</option>
                  <option value="marketing">Marketing</option>
                  <option value="support">Support</option>
                </select>
              </div>
              <div class="flex items-end">
                <button
                  @click="clearFilters"
                  class="w-full px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                >
                  Effacer
                </button>
              </div>
            </div>
          </div>

          <!-- Service Requests List -->
          <div class="bg-white rounded-lg shadow-sm border border-gray-200">
            <div class="px-6 py-4 border-b border-gray-200">
              <h3 class="text-lg font-medium text-gray-900">Demandes de Service ({{ filteredRequests.length }})</h3>
            </div>
            
            <div v-if="loading" class="p-8 text-center text-gray-500">
              Chargement des demandes...
            </div>
            
            <div v-else-if="filteredRequests.length === 0" class="p-8 text-center text-gray-500">
              Aucune demande trouvée
            </div>
            
            <div v-else class="divide-y divide-gray-200">
              <div
                v-for="request in filteredRequests"
                :key="request.id"
                class="p-6 hover:bg-gray-50 transition-colors"
              >
                <div class="flex items-start justify-between">
                  <div class="flex-1 min-w-0">
                    <div class="flex items-center space-x-3 mb-2">
                      <h4 class="text-lg font-medium text-gray-900">{{ request.title }}</h4>
                      <span :class="getStatusBadgeClass(request.status)">
                        {{ getStatusLabel(request.status) }}
                      </span>
                      <span :class="getPriorityBadgeClass(request.priority)">
                        {{ getPriorityLabel(request.priority) }}
                      </span>
                    </div>
                    
                    <p class="text-sm text-gray-600 mb-3">{{ request.description }}</p>
                    
                    <div class="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-gray-500">
                      <div>
                        <span class="font-medium">Client:</span>
                        <p>{{ request.client_name || 'Non assigné' }}</p>
                      </div>
                      <div>
                        <span class="font-medium">Type:</span>
                        <p>{{ getServiceTypeLabel(request.service_type) }}</p>
                      </div>
                      <div>
                        <span class="font-medium">Budget:</span>
                        <p>{{ request.budget_range || 'Non spécifié' }}</p>
                      </div>
                      <div>
                        <span class="font-medium">Échéance:</span>
                        <p>{{ formatDate(request.deadline) }}</p>
                      </div>
                    </div>
                    
                    <div class="mt-3 flex items-center space-x-4 text-xs text-gray-500">
                      <span>Créé le {{ formatDate(request.created_at) }}</span>
                      <span v-if="request.assigned_to">Assigné à: {{ request.assigned_to }}</span>
                      <span v-if="request.estimated_completion_date">Estimation: {{ formatDate(request.estimated_completion_date) }}</span>
                    </div>
                  </div>
                  
                  <div class="flex items-center space-x-2 ml-4">
                    <select
                      :value="request.status"
                      @change="updateRequestStatus(request.id, $event.target.value)"
                      class="text-sm border border-gray-300 rounded-md px-2 py-1 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="pending">En Attente</option>
                      <option value="in_progress">En Cours</option>
                      <option value="completed">Terminé</option>
                      <option value="cancelled">Annulé</option>
                    </select>
                    
                    <button
                      @click="viewRequestDetails(request)"
                      class="p-2 text-blue-600 hover:text-blue-800 rounded-md hover:bg-blue-50"
                      title="Voir détails"
                    >
                      <svg class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                    </button>
                    
                    <button
                      @click="editRequest(request)"
                      class="p-2 text-green-600 hover:text-green-800 rounded-md hover:bg-green-50"
                      title="Modifier"
                    >
                      <svg class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>

    <!-- Request Details Modal -->
    <div v-if="showDetailsModal" class="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
      <div class="relative top-20 mx-auto p-5 border w-11/12 md:w-3/4 lg:w-2/3 shadow-lg rounded-md bg-white">
        <div class="mt-3">
          <div class="flex justify-between items-center mb-4">
            <h3 class="text-lg font-medium text-gray-900">Détails de la Demande</h3>
            <button @click="closeDetailsModal" class="text-gray-400 hover:text-gray-600">
              <svg class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          
          <div v-if="selectedRequest" class="space-y-6">
            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 class="text-sm font-medium text-gray-900 mb-2">Informations Générales</h4>
                <div class="bg-gray-50 rounded-lg p-4 space-y-2">
                  <div><span class="font-medium">Titre:</span> {{ selectedRequest.title }}</div>
                  <div><span class="font-medium">Statut:</span> {{ getStatusLabel(selectedRequest.status) }}</div>
                  <div><span class="font-medium">Priorité:</span> {{ getPriorityLabel(selectedRequest.priority) }}</div>
                  <div><span class="font-medium">Type:</span> {{ getServiceTypeLabel(selectedRequest.service_type) }}</div>
                </div>
              </div>
              
              <div>
                <h4 class="text-sm font-medium text-gray-900 mb-2">Dates et Budget</h4>
                <div class="bg-gray-50 rounded-lg p-4 space-y-2">
                  <div><span class="font-medium">Créé le:</span> {{ formatDate(selectedRequest.created_at) }}</div>
                  <div><span class="font-medium">Échéance:</span> {{ formatDate(selectedRequest.deadline) }}</div>
                  <div><span class="font-medium">Budget:</span> {{ selectedRequest.budget_range || 'Non spécifié' }}</div>
                  <div v-if="selectedRequest.estimated_completion_date">
                    <span class="font-medium">Estimation:</span> {{ formatDate(selectedRequest.estimated_completion_date) }}
                  </div>
                </div>
              </div>
            </div>
            
            <div>
              <h4 class="text-sm font-medium text-gray-900 mb-2">Description</h4>
              <div class="bg-gray-50 rounded-lg p-4">
                <p class="text-sm text-gray-700">{{ selectedRequest.description }}</p>
              </div>
            </div>
            
            <div v-if="selectedRequest.internal_notes">
              <h4 class="text-sm font-medium text-gray-900 mb-2">Notes Internes</h4>
              <div class="bg-gray-50 rounded-lg p-4">
                <p class="text-sm text-gray-700">{{ selectedRequest.internal_notes }}</p>
              </div>
            </div>
            
            <div v-if="selectedRequest.client_feedback">
              <h4 class="text-sm font-medium text-gray-900 mb-2">Feedback Client</h4>
              <div class="bg-gray-50 rounded-lg p-4">
                <p class="text-sm text-gray-700">{{ selectedRequest.client_feedback }}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import AgentSidebar from '@/components/AgentSidebar.vue';
import Header from '@/components/Header.vue';
import axios from 'axios';

export default {
  name: 'AgentServiceRequests',
  components: {
    AgentSidebar,
    Header
  },
  data() {
    return {
      loading: true,
      sidebarOpen: false,
      requests: [],
      searchQuery: '',
      statusFilter: '',
      priorityFilter: '',
      serviceTypeFilter: '',
      showDetailsModal: false,
      selectedRequest: null,
      stats: {
        total: 0,
        pending: 0,
        in_progress: 0,
        completed: 0
      }
    };
  },
  computed: {
    filteredRequests() {
      let filtered = this.requests;
      
      if (this.searchQuery) {
        const query = this.searchQuery.toLowerCase();
        filtered = filtered.filter(request => 
          request.title.toLowerCase().includes(query) ||
          request.description.toLowerCase().includes(query)
        );
      }
      
      if (this.statusFilter) {
        filtered = filtered.filter(request => request.status === this.statusFilter);
      }
      
      if (this.priorityFilter) {
        filtered = filtered.filter(request => request.priority === this.priorityFilter);
      }
      
      if (this.serviceTypeFilter) {
        filtered = filtered.filter(request => request.service_type === this.serviceTypeFilter);
      }
      
      return filtered;
    }
  },
  async mounted() {
    await this.loadRequests();
  },
  methods: {
    async loadRequests() {
      try {
        this.loading = true;
        const response = await axios.get('/api/agent/service-requests');
        if (response.data.success) {
          this.requests = response.data.data;
          this.calculateStats();
        }
      } catch (error) {
        console.error('Erreur lors du chargement des demandes:', error);
        this.$toast.error('Erreur lors du chargement des demandes');
        // Données de fallback pour le développement
        this.requests = [];
        this.calculateStats();
      } finally {
        this.loading = false;
      }
    },
    
    calculateStats() {
      this.stats = {
        total: this.requests.length,
        pending: this.requests.filter(r => r.status === 'pending').length,
        in_progress: this.requests.filter(r => r.status === 'in_progress').length,
        completed: this.requests.filter(r => r.status === 'completed').length
      };
    },
    
    async refreshRequests() {
      await this.loadRequests();
      this.$toast.success('Liste des demandes actualisée');
    },
    
    clearFilters() {
      this.searchQuery = '';
      this.statusFilter = '';
      this.priorityFilter = '';
      this.serviceTypeFilter = '';
    },
    
    async updateRequestStatus(requestId, newStatus) {
      try {
        const response = await axios.put(`/api/agent/service-requests/${requestId}/status`, {
          status: newStatus
        });
        
        if (response.data.success) {
          const request = this.requests.find(r => r.id === requestId);
          if (request) {
            request.status = newStatus;
            this.calculateStats();
            this.$toast.success('Statut mis à jour avec succès');
          }
        }
      } catch (error) {
        console.error('Erreur lors de la mise à jour du statut:', error);
        this.$toast.error('Erreur lors de la mise à jour du statut');
      }
    },
    
    viewRequestDetails(request) {
      this.selectedRequest = request;
      this.showDetailsModal = true;
    },
    
    closeDetailsModal() {
      this.showDetailsModal = false;
      this.selectedRequest = null;
    },
    
    editRequest(request) {
      // Rediriger vers la page d'édition ou ouvrir un modal d'édition
      this.$router.push(`/agent/service-requests/${request.id}/edit`);
    },
    
    getStatusBadgeClass(status) {
      const classes = {
        pending: 'px-2 py-1 text-xs font-medium bg-yellow-100 text-yellow-800 rounded-full',
        in_progress: 'px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded-full',
        completed: 'px-2 py-1 text-xs font-medium bg-green-100 text-green-800 rounded-full',
        cancelled: 'px-2 py-1 text-xs font-medium bg-red-100 text-red-800 rounded-full'
      };
      return classes[status] || classes.pending;
    },
    
    getPriorityBadgeClass(priority) {
      const classes = {
        low: 'px-2 py-1 text-xs font-medium bg-gray-100 text-gray-800 rounded-full',
        medium: 'px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded-full',
        high: 'px-2 py-1 text-xs font-medium bg-orange-100 text-orange-800 rounded-full',
        urgent: 'px-2 py-1 text-xs font-medium bg-red-100 text-red-800 rounded-full'
      };
      return classes[priority] || classes.medium;
    },
    
    getStatusLabel(status) {
      const labels = {
        pending: 'En Attente',
        in_progress: 'En Cours',
        completed: 'Terminé',
        cancelled: 'Annulé'
      };
      return labels[status] || status;
    },
    
    getPriorityLabel(priority) {
      const labels = {
        low: 'Basse',
        medium: 'Moyenne',
        high: 'Haute',
        urgent: 'Urgente'
      };
      return labels[priority] || priority;
    },
    
    getServiceTypeLabel(type) {
      const labels = {
        consultation: 'Consultation',
        development: 'Développement',
        design: 'Design',
        marketing: 'Marketing',
        support: 'Support'
      };
      return labels[type] || type;
    },
    
    formatDate(dateString) {
      if (!dateString) return 'Non défini';
      const date = new Date(dateString);
      return date.toLocaleDateString('fr-FR', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      });
    }
  }
};
</script>