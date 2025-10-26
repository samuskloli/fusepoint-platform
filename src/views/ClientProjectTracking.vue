<template>
  <div class="flex h-screen bg-gray-50">
    <!-- Sidebar -->
    <div
      class="hidden md:block fixed inset-y-0 left-0 z-50 bg-gray-900 transform transition-all duration-300 ease-in-out md:translate-x-0 md:static md:inset-0"
      :class="{ 
        '-translate-x-full': !sidebarOpen, 
        'translate-x-0': sidebarOpen,
        'w-16': sidebarCollapsed,
        'w-64': !sidebarCollapsed
      }"
    >
      <Sidebar @close-sidebar="sidebarOpen = false" @toggle-collapse="handleSidebarCollapse" />
    </div>
    
    <!-- Main content -->
    <div class="flex-1 flex flex-col overflow-hidden">
      <!-- Header -->
      <Header @toggle-sidebar="sidebarOpen = !sidebarOpen" />
      
      <!-- Page content -->
      <main class="flex-1 overflow-y-auto">
        <!-- Page header -->
        <div class="bg-white shadow-sm border-b border-gray-200">
          <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 py-6">
              <div class="flex-1">
                <h1 class="text-2xl font-bold text-gray-900 flex items-center">
                  <svg class="w-6 h-6 mr-3 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01"></path>
                  </svg>
                  Suivi de mes projets
                </h1>
                <p class="text-gray-600 mt-1">
                  Suivez l'avancement de tous vos projets gérés par votre agent
                </p>
              </div>
              
              <!-- Filtres rapides -->
              <div class="w-full sm:w-auto flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4">
                <select 
                  v-model="selectedStatus" 
                  @change="filterProjects"
                  aria-label="Filtrer par statut"
                  class="w-full sm:w-auto border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Tous les statuts</option>
                  <option value="En cours">En cours</option>
                  <option value="En attente">En attente</option>
                  <option value="Terminé">Terminé</option>
                  <option value="En pause">En pause</option>
                </select>
                
                <select 
                  v-model="selectedPriority" 
                  @change="filterProjects"
                  aria-label="Filtrer par priorité"
                  class="w-full sm:w-auto border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Toutes les priorités</option>
                  <option value="Haute">Haute</option>
                  <option value="Moyenne">Moyenne</option>
                  <option value="Basse">Basse</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        <!-- Content -->
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <!-- Statistiques rapides (mobile chips comme tableau de bord agent) -->
          <div class="mb-6">
            <div v-if="isMobile" class="stats-compact">
              <div class="stat-chip">
                <span class="chip-value">{{ projectStats.total }}</span>
                <span class="chip-label">Total</span>
              </div>
              <div class="stat-chip">
                <span class="chip-value">{{ projectStats.active }}</span>
                <span class="chip-label">En cours</span>
              </div>
              <div class="stat-chip">
                <span class="chip-value">{{ projectStats.pending }}</span>
                <span class="chip-label">En attente</span>
              </div>
              <div class="stat-chip">
                <span class="chip-value">{{ projectStats.completed }}</span>
                <span class="chip-label">Terminés</span>
              </div>
            </div>

            <div v-else class="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div class="bg-white rounded-lg shadow p-4 sm:p-6">
                <div class="flex items-center">
                  <div class="flex-shrink-0">
                    <div class="w-8 h-8 bg-blue-100 rounded-md flex items-center justify-center">
                      <svg class="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4"></path>
                      </svg>
                    </div>
                  </div>
                  <div class="ml-4">
                    <p class="text-sm font-medium text-gray-500">Total projets</p>
                    <p class="text-xl sm:text-2xl font-semibold text-gray-900">{{ projectStats.total }}</p>
                  </div>
                </div>
              </div>
              
              <div class="bg-white rounded-lg shadow p-4 sm:p-6">
                <div class="flex items-center">
                  <div class="flex-shrink-0">
                    <div class="w-8 h-8 bg-green-100 rounded-md flex items-center justify-center">
                      <svg class="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path>
                      </svg>
                    </div>
                  </div>
                  <div class="ml-4">
                    <p class="text-sm font-medium text-gray-500">En cours</p>
                    <p class="text-xl sm:text-2xl font-semibold text-gray-900">{{ projectStats.active }}</p>
                  </div>
                </div>
              </div>
              
              <div class="bg-white rounded-lg shadow p-4 sm:p-6">
                <div class="flex items-center">
                  <div class="flex-shrink-0">
                    <div class="w-8 h-8 bg-yellow-100 rounded-md flex items-center justify-center">
                      <svg class="w-5 h-5 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                      </svg>
                    </div>
                  </div>
                  <div class="ml-4">
                    <p class="text-sm font-medium text-gray-500">En attente</p>
                    <p class="text-xl sm:text-2xl font-semibold text-gray-900">{{ projectStats.pending }}</p>
                  </div>
                </div>
              </div>
              
              <div class="bg-white rounded-lg shadow p-4 sm:p-6">
                <div class="flex items-center">
                  <div class="flex-shrink-0">
                    <div class="w-8 h-8 bg-purple-100 rounded-md flex items-center justify-center">
                      <svg class="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                      </svg>
                    </div>
                  </div>
                  <div class="ml-4">
                    <p class="text-sm font-medium text-gray-500">Terminés</p>
                    <p class="text-xl sm:text-2xl font-semibold text-gray-900">{{ projectStats.completed }}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Liste des projets -->
          <div class="bg-white shadow rounded-lg">
            <div class="px-6 py-4 border-b border-gray-200">
              <h3 class="text-lg font-medium text-gray-900">Mes projets</h3>
            </div>
            
            <!-- Loading state -->
            <div v-if="loading" class="p-8 text-center">
              <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
              <p class="text-gray-500 mt-4">Chargement des projets...</p>
            </div>
            
            <!-- Empty state -->
            <div v-else-if="filteredProjects.length === 0" class="p-8 text-center">
              <svg class="w-12 h-12 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4"></path>
              </svg>
              <p class="text-gray-500">Aucun projet trouvé</p>
            </div>
            
            <!-- Mobile tile view -->
            <div v-else-if="isMobile" class="px-2 py-2">
              <div class="projects-tiles">
                <div 
                  v-for="project in filteredProjects" 
                  :key="project.id"
                  class="project-tile"
                >
                  <div class="tile-header">
                    <div class="tile-title">{{ project.name }}</div>
                    <span 
                      class="status-badge"
                      :class="getStatusBadgeClass(project.status)"
                    >
                      {{ project.status }}
                    </span>
                  </div>
                  <div class="tile-body">
                    <div class="tile-description">{{ project.description }}</div>
                    <div v-if="project.progress !== undefined" class="tile-progress">
                      <div class="progress-bar">
                        <div class="progress-fill" :style="{ width: project.progress + '%' }"></div>
                      </div>
                      <span class="progress-label">{{ project.progress }}%</span>
                    </div>
                    <div v-if="project.deadline" class="tile-deadline">
                      Échéance: {{ formatDate(project.deadline) }}
                    </div>
                    <div v-if="project.agent_name" class="tile-agent">
                      Agent: {{ project.agent_name }}
                    </div>
                  </div>
                  <div class="tile-actions">
                    <button @click.stop="viewProjectDetails(project.id)" class="tile-btn primary">Voir</button>
                    <button v-if="project.agent_id" @click.stop="contactAgent(project.id, project.agent_id)" class="tile-btn">Contacter</button>
                  </div>
                </div>
              </div>
            </div>

            <!-- Desktop list -->
            <div v-else class="divide-y divide-gray-200">
              <div 
                v-for="project in filteredProjects" 
                :key="project.id"
                class="p-4 sm:p-6 hover:bg-gray-50 transition-colors duration-200 cursor-pointer"
                @click="viewProjectDetails(project.id)"
              >
                <div class="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                  <div class="flex-1">
                    <div class="flex items-center space-x-3 mb-2">
                      <h4 class="text-lg font-semibold text-gray-900">{{ project.name }}</h4>
                      <span 
                        class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium"
                        :class="getStatusBadgeClass(project.status)"
                      >
                        {{ project.status }}
                      </span>
                      <span 
                        class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium"
                        :class="getPriorityBadgeClass(project.priority)"
                      >
                        {{ project.priority }}
                      </span>
                    </div>
                    
                    <p class="text-gray-600 mb-3">{{ project.description }}</p>
                    
                    <div class="flex items-center space-x-6 text-sm text-gray-500">
                      <div class="flex items-center">
                        <svg class="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
                        </svg>
                        Créé le {{ formatDate(project.created_at) }}
                      </div>
                      
                      <div v-if="project.deadline" class="flex items-center">
                        <svg class="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                        </svg>
                        Échéance: {{ formatDate(project.deadline) }}
                      </div>
                      
                      <div v-if="project.agent_name" class="flex items-center">
                        <svg class="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path>
                        </svg>
                        Agent: {{ project.agent_name }}
                      </div>
                    </div>
                    
                    <!-- Progress bar -->
                    <div v-if="project.progress !== undefined" class="mt-4">
                      <div class="flex items-center justify-between text-sm text-gray-600 mb-1">
                        <span>Progression</span>
                        <span>{{ project.progress }}%</span>
                      </div>
                      <div class="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          class="bg-blue-600 h-2 rounded-full transition-all duration-300"
                          :style="{ width: project.progress + '%' }"
                        ></div>
                      </div>
                    </div>
                  </div>
                  
                  <div class="mt-4 sm:mt-0 flex flex-wrap gap-2 sm:ml-4">
                    <button 
                      @click.stop="viewProjectDetails(project.id)"
                      aria-label="Voir les détails du projet"
                      class="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors duration-200"
                    >
                      Voir détails
                    </button>
                    
                    <button 
                      v-if="project.agent_id"
                      @click.stop="contactAgent(project.id, project.agent_id)"
                      aria-label="Contacter l'agent du projet"
                      class="bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-md text-sm font-medium transition-colors duration-200"
                    >
                      Contacter l'agent
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  </div>
</template>

<script>
import Header from '@/components/Header.vue'
import Sidebar from '@/components/Sidebar.vue'
import { clientProjectService } from '@/services/projectManagementService'
import { useToast } from 'vue-toastification'
import { useAuthStore } from '@/stores/auth'

export default {
  name: 'ClientProjectTracking',
  components: {
    Header,
    Sidebar
  },
  setup() {
    const toast = useToast()
    const authStore = useAuthStore()
    return { toast, authStore }
  },
  data() {
    return {
      sidebarOpen: false,
      sidebarCollapsed: false,
      loading: true,
      projects: [],
      filteredProjects: [],
      selectedStatus: '',
      selectedPriority: '',
      isMobile: false,
      projectStats: {
        total: 0,
        active: 0,
        pending: 0,
        completed: 0
      }
    }
  },
  computed: {
    userId() {
      const storeUser = this.authStore?.user
      if (storeUser && storeUser.id) {
        return storeUser.id
      }
      return null
    }
  },
  methods: {
    handleSidebarCollapse(isCollapsed) {
      this.sidebarCollapsed = isCollapsed
    },
    
    updateViewport() {
      this.isMobile = window.innerWidth <= 768
    },

    async loadProjects() {
      try {
        this.loading = true
        const response = await clientProjectService.getMyProjects()
        
        if (response.success) {
          this.projects = response.data || []
          this.filteredProjects = [...this.projects]
          this.calculateStats()
        } else {
          this.toast.error('Erreur lors du chargement des projets')
        }
      } catch (error) {
        console.error('Erreur lors du chargement des projets:', error)
        this.toast.error('Erreur lors du chargement des projets')
      } finally {
        this.loading = false
      }
    },
    
    calculateStats() {
      this.projectStats = {
        total: this.projects.length,
        active: this.projects.filter(p => p.status === 'En cours').length,
        pending: this.projects.filter(p => p.status === 'En attente').length,
        completed: this.projects.filter(p => p.status === 'Terminé').length
      }
    },
    
    filterProjects() {
      let filtered = [...this.projects]
      
      if (this.selectedStatus) {
        filtered = filtered.filter(project => project.status === this.selectedStatus)
      }
      
      if (this.selectedPriority) {
        filtered = filtered.filter(project => project.priority === this.selectedPriority)
      }
      
      this.filteredProjects = filtered
    },
    
    viewProjectDetails(projectId) {
      this.$router.push(`/projects/${projectId}`)
    },
    
    contactAgent(projectId, agentId) {
      // Ouvrir l'onglet Équipe du projet pour contacter l'agent
      this.$router.push({ name: 'ProjectDetails', params: { id: projectId, tab: 'team' } })
      this.toast.info("Ouverture de l'équipe du projet pour contacter l'agent")
    },
    
    formatDate(date) {
      if (!date) return 'Non défini'
      return new Intl.DateTimeFormat('fr-FR', {
        day: 'numeric',
        month: 'long',
        year: 'numeric'
      }).format(new Date(date))
    },
    
    getStatusBadgeClass(status) {
      const classes = {
        'En cours': 'bg-blue-100 text-blue-800',
        'En attente': 'bg-yellow-100 text-yellow-800',
        'Terminé': 'bg-green-100 text-green-800',
        'En pause': 'bg-gray-100 text-gray-800',
        'Annulé': 'bg-red-100 text-red-800'
      }
      return classes[status] || 'bg-gray-100 text-gray-800'
    },
    
    getPriorityBadgeClass(priority) {
      const classes = {
        'Haute': 'bg-red-100 text-red-800',
        'Moyenne': 'bg-orange-100 text-orange-800',
        'Basse': 'bg-green-100 text-green-800'
      }
      return classes[priority] || 'bg-gray-100 text-gray-800'
    }
  },
  
  async mounted() {
    this.authStore.initializeAuth()
    this.updateViewport()
    window.addEventListener('resize', this.updateViewport)
    await this.loadProjects()
  },
  beforeUnmount() {
    window.removeEventListener('resize', this.updateViewport)
  }
}
</script>

<style scoped>
/* Styles tuiles et chips inspirés du dashboard agent */
.projects-tiles {
  display: grid;
  grid-template-columns: 1fr;
  gap: 0.5rem;
}

.project-tile {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  padding: 0.75rem;
  border: 1px solid #e5e7eb;
  border-radius: 14px;
  background: #ffffff;
  box-shadow: 0 1px 3px rgba(0,0,0,0.08);
}

.tile-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.tile-title {
  font-weight: 700;
  color: #111827;
}

.status-badge {
  padding: 0.25rem 0.5rem;
  border-radius: 9999px;
  font-size: 0.75rem;
  font-weight: 600;
}

.tile-body {
  display: flex;
  flex-direction: column;
  gap: 0.35rem;
}

.tile-description {
  color: #4b5563;
  font-size: 0.9rem;
}

.tile-progress {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.progress-bar {
  flex: 1;
  height: 8px;
  background: #e5e7eb;
  border-radius: 9999px;
  overflow: hidden;
}

.progress-fill {
  height: 8px;
  background: #2563eb;
  border-radius: 9999px;
}

.progress-label {
  font-size: 0.8rem;
  color: #6b7280;
}

.tile-deadline {
  font-size: 0.85rem;
  color: #374151;
}

.tile-agent {
  font-size: 0.85rem;
  color: #374151;
}

.tile-actions {
  display: flex;
  gap: 0.5rem;
}

.tile-btn {
  padding: 0.4rem 0.6rem;
  border: 1px solid #e5e7eb;
  border-radius: 10px;
  background: #fff;
  color: #111827;
  font-size: 0.85rem;
}

.tile-btn.primary {
  background: #2563eb;
  border-color: #2563eb;
  color: white;
}

/* Chips stats pour mobile */
.stats-compact {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 0.5rem;
}

.stat-chip {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0.4rem 0.6rem;
  border: 1px solid #e5e7eb;
  border-radius: 10px;
  background: #fff;
}

.chip-value {
  font-weight: 700;
  font-size: 1rem;
  color: #111827;
}

.chip-label {
  font-size: 0.8rem;
}
</style>