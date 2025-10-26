<template>
  <RoleLayout>
    
    <!-- Contenu principal -->
    <div class="flex-1 flex flex-col overflow-hidden">
      <!-- En-tête -->
      <div class="bg-white shadow-sm border-b border-gray-200 px-3 py-3 md:px-6 md:py-4">
        <div class="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div class="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-0 sm:space-x-4">
            <button 
              @click="goBack" 
              class="flex items-center text-gray-600 hover:text-gray-900 transition-colors text-sm sm:text-base"
            >
              <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"></path>
              </svg>
              Retour aux clients
            </button>
            <div class="hidden sm:block h-6 w-px bg-gray-300"></div>
            <div v-if="clientInfo">
              <h1 class="text-xl md:text-2xl font-bold text-gray-900">
                Tableau de bord - {{ clientInfo.first_name }} {{ clientInfo.last_name }}
              </h1>
              <p class="text-xs sm:text-sm text-gray-600 truncate max-w-[85vw] sm:max-w-none">{{ clientInfo.email }}</p>
            </div>
          </div>
          <div class="flex items-center sm:space-x-3 space-x-2 sm:mt-0 mt-2">
            <span class="text-xs sm:text-sm text-gray-500">Dernière mise à jour: {{ formatDate(new Date()) }}</span>
            <button 
              @click="refreshData" 
              :disabled="loading"
              class="bg-blue-600 text-white px-3 py-2 md:px-4 md:py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
            >
              <svg v-if="loading" class="animate-spin -ml-1 mr-2 h-4 w-4 text-white inline" fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              {{ loading ? 'Actualisation...' : 'Actualiser' }}
            </button>
          </div>
        </div>
      </div>

      <!-- Contenu du tableau de bord -->
      <div class="flex-1 overflow-auto p-3 md:p-6">
        <div class="space-y-4 md:space-y-8">
      <!-- Infos client + actions de contact -->
        <div v-if="clientInfo" class="bg-white rounded-lg shadow p-3 md:p-6">
      <div class="flex flex-col md:flex-row md:items-center md:justify-between">
        <div class="mb-3 md:mb-0">
          <div class="text-lg font-semibold text-gray-900">Informations du client</div>
          <div class="mt-2 grid grid-cols-1 sm:grid-cols-2 gap-1 md:gap-4 text-sm text-gray-700">
            <div>
              <span class="font-medium">Entreprise:</span>
              <span class="ml-2">{{ clientInfo.company || 'Non renseignée' }}</span>
            </div>
            <div>
              <span class="font-medium">Téléphone:</span>
              <span class="ml-2">{{ clientInfo.phone || 'Non renseigné' }}</span>
            </div>
            <div>
              <span class="font-medium">Statut:</span>
              <span class="ml-2">{{ clientInfo.status || 'Actif' }}</span>
            </div>
            <div>
              <span class="font-medium">Dernière connexion:</span>
              <span class="ml-2">{{ clientInfo.last_login ? formatDate(clientInfo.last_login) : 'Jamais' }}</span>
            </div>
          </div>
        </div>

        <!-- Statistiques -->
        <div>
          <h2 class="text-lg font-semibold text-gray-900 mb-2 md:mb-3">Statistiques</h2>
          <div v-if="isMobile" class="stats-compact">
            <div class="stat-chip">
              <span class="chip-value">{{ stats.totalProjects }}</span>
              <span class="chip-label">Total</span>
            </div>
            <div class="stat-chip">
              <span class="chip-value">{{ stats.completedProjects }}</span>
              <span class="chip-label">Terminés</span>
            </div>
            <div class="stat-chip">
              <span class="chip-value">{{ stats.activeProjects }}</span>
              <span class="chip-label">En cours</span>
            </div>
            <div class="stat-chip">
              <span class="chip-value">{{ stats.overdueProjects }}</span>
              <span class="chip-label">En retard</span>
            </div>
          </div>

          <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4 lg:gap-6">
            <div class="bg-white rounded-lg shadow p-2 md:p-4 lg:p-6">
              <div class="flex items-center">
                <div class="p-2 bg-blue-100 rounded-lg">
                  <svg class="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4"></path>
                  </svg>
                </div>
                <div class="ml-3 md:ml-4">
                  <p class="text-sm font-medium text-gray-600">Projets Totaux</p>
                  <p class="text-2xl font-bold text-gray-900">{{ stats.totalProjects }}</p>
                </div>
              </div>
            </div>
            <div class="bg-white rounded-lg shadow p-2 md:p-4 lg:p-6">
              <div class="flex items-center">
                <div class="p-2 bg-green-100 rounded-lg">
                  <svg class="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                  </svg>
                </div>
                <div class="ml-3 md:ml-4">
                  <p class="text-sm font-medium text-gray-600">Projets Terminés</p>
                  <p class="text-2xl font-bold text-gray-900">{{ stats.completedProjects }}</p>
                </div>
              </div>
            </div>
            <div class="bg-white rounded-lg shadow p-2 md:p-4 lg:p-6">
              <div class="flex items-center">
                <div class="p-2 bg-yellow-100 rounded-lg">
                  <svg class="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                  </svg>
                </div>
                <div class="ml-3 md:ml-4">
                  <p class="text-sm font-medium text-gray-600">En Cours</p>
                  <p class="text-2xl font-bold text-gray-900">{{ stats.activeProjects }}</p>
                </div>
              </div>
            </div>
            <div class="bg-white rounded-lg shadow p-2 md:p-4 lg:p-6">
              <div class="flex items-center">
                <div class="p-2 bg-red-100 rounded-lg">
                  <svg class="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"></path>
                  </svg>
                </div>
                <div class="ml-3 md:ml-4">
                  <p class="text-sm font-medium text-gray-600">En Retard</p>
                  <p class="text-2xl font-bold text-gray-900">{{ stats.overdueProjects }}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

        <!-- Projets du client -->
        <div class="bg-white rounded-lg shadow">
          <div class="px-3 py-3 md:px-6 md:py-4 border-b border-gray-200">
            <div class="flex items-center justify-between">
              <h2 class="text-lg font-semibold text-gray-900">Projets du Client</h2>
              <div class="flex items-center space-x-2 md:space-x-3">
                <div class="relative">
                  <select 
                     v-model="statusFilter" 
                     class="appearance-none border border-gray-300 rounded-md pl-2 pr-7 py-1.5 md:py-2 text-xs md:text-sm font-normal text-gray-700 bg-white hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 w-auto"
                     aria-label="Filtrer par statut"
                   >
                    <option value="">Tous les statuts</option>
                    <option value="planification">Planification</option>
                    <option value="en_cours">En cours</option>
                    <option value="en_revision">En révision</option>
                    <option value="termine">Terminé</option>
                    <option value="en_pause">En pause</option>
                  </select>
                  <svg class="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 w-3 h-3 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                     <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
                   </svg>
                </div>
                <button 
                  @click="showCreateProjectModal = true"
                  class="bg-blue-600 text-white inline-flex items-center justify-center gap-2 px-3 py-2 md:px-4 md:py-2 rounded-lg hover:bg-blue-700 transition-colors text-center"
                >
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path>
                  </svg>
                  Nouveau Projet
                </button>
              </div>
            </div>
          </div>

          <!-- Vue tuiles (mobile) -->
          <div v-if="isMobile" class="px-2 py-2 md:px-6 md:py-4">
            <div class="projects-tiles">
              <div 
                v-for="project in filteredProjects" 
                :key="project.id" 
                class="project-tile"
              >
                <div class="tile-header">
                  <div class="tile-title">{{ project.title }}</div>
                  <span :class="getStatusClass(project.status)" class="status-badge">{{ getStatusLabel(project.status) }}</span>
                </div>
                <div class="tile-body">
                  <div class="tile-description">{{ project.description }}</div>
                  <div class="tile-progress">
                    <div class="progress-bar">
                      <div :class="getProgressClass(project.progress)" class="progress-fill" :style="{ width: project.progress + '%' }"></div>
                    </div>
                    <span class="progress-label">{{ project.progress }}%</span>
                  </div>
                  <div class="tile-deadline" :class="{ overdue: isOverdue(project.end_date) }">
                    Échéance: {{ formatDate(project.end_date) }}
                  </div>
                </div>
                <div class="tile-actions">
                  <button @click="viewProject(project)" class="tile-btn primary">Voir</button>
                  <button @click="editProject(project)" class="tile-btn">Modifier</button>
                  <button @click="deleteProject(project)" class="tile-btn danger">Supprimer</button>
                </div>
              </div>
            </div>
            <div v-if="filteredProjects.length === 0" class="text-center py-4 md:py-6 text-gray-600">
              Aucun projet pour ce client.
            </div>
          </div>

          <!-- Vue table (desktop) -->
          <div v-else class="overflow-x-auto max-h-[65vh]">
            <table class="min-w-full table-fixed divide-y divide-gray-200 text-sm">
              <thead>
                <tr class="bg-gray-50">
                  <th class="sticky top-0 z-10 bg-gray-50 px-3 py-2 text-left font-medium text-gray-500 uppercase tracking-wider w-10">
                    <input 
                      type="checkbox" 
                      :checked="isAllSelected" 
                      @change="toggleSelectAll"
                      class="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    >
                  </th>
                  <th class="sticky top-0 z-10 bg-gray-50 px-3 py-2 text-left font-medium text-gray-500 uppercase tracking-wider w-2/5">Projet</th>
                  <th class="sticky top-0 z-10 bg-gray-50 px-3 py-2 text-left font-medium text-gray-500 uppercase tracking-wider w-28">Statut</th>
                  <th class="sticky top-0 z-10 bg-gray-50 px-3 py-2 text-left font-medium text-gray-500 uppercase tracking-wider w-28">Priorité</th>
                  <th class="sticky top-0 z-10 bg-gray-50 px-3 py-2 text-left font-medium text-gray-500 uppercase tracking-wider w-40">Progrès</th>
                  <th class="sticky top-0 z-10 bg-gray-50 px-3 py-2 text-left font-medium text-gray-500 uppercase tracking-wider w-32">Échéance</th>
                  <th class="sticky top-0 z-10 bg-gray-50 px-3 py-2 text-left font-medium text-gray-500 uppercase tracking-wider w-40">Actions</th>
                </tr>
              </thead>
              <tbody class="bg-white divide-y divide-gray-200">

                <tr v-for="project in filteredProjects" :key="project.id" class="hover:bg-gray-50" :class="{ 'bg-blue-50': selectedProjects.includes(project.id) }">
                  <td class="px-6 py-4 whitespace-nowrap">
                    <input 
                      type="checkbox" 
                      :checked="selectedProjects.includes(project.id)"
                      @change="toggleProjectSelection(project.id)"
                      class="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    >
                  </td>
                  <td class="px-3 py-2 whitespace-nowrap">
                    <div class="max-w-[32rem]">
                      <div class="text-sm font-semibold text-gray-900">{{ project.title }}</div>
                      <div class="text-sm text-gray-500 truncate">{{ project.description }}</div>
                    </div>
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap">
                    <span :class="getStatusClass(project.status)" class="inline-flex items-center justify-center px-2 py-1 text-xs leading-none font-semibold rounded-full">
                      {{ getStatusLabel(project.status) }}
                    </span>
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap">
                    <span :class="getPriorityClass(project.priority)" class="inline-flex items-center justify-center px-2 py-1 text-xs leading-none font-semibold rounded-full">
                      {{ getPriorityLabel(project.priority) }}
                    </span>
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap">
                    <div class="flex items-center">
                      <div class="w-full bg-gray-200 rounded-full h-2 mr-2">
                        <div :class="getProgressClass(project.progress)" class="h-2 rounded-full transition-all duration-300" :style="{ width: project.progress + '%' }"></div>
                      </div>
                      <span class="text-sm text-gray-600 min-w-0">{{ project.progress }}%</span>
                    </div>
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    <span :class="{ 'text-red-600 font-semibold': isOverdue(project.end_date) }">
                      {{ formatDate(project.end_date) }}
                    </span>
                  </td>
                  <td class="px-3 py-2 whitespace-nowrap">
                    <div class="flex items-center gap-2">
                      <button 
                        @click="viewProject(project)" 
                        class="px-2 py-1 rounded-md bg-blue-50 text-blue-700 hover:bg-blue-100 border border-blue-200 transition-colors"
                      >
                        Voir
                      </button>
                      <button 
                        @click="editProject(project)" 
                        class="px-2 py-1 rounded-md bg-amber-50 text-amber-700 hover:bg-amber-100 border border-amber-200 transition-colors"
                      >
                        Modifier
                      </button>
                      <button 
                        @click="deleteProject(project)" 
                        class="px-2 py-1 rounded-md bg-red-50 text-red-700 hover:bg-red-100 border border-red-200 transition-colors"
                      >
                        Supprimer
                      </button>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
            
            <!-- Message si aucun projet -->
            <div v-if="filteredProjects.length === 0" class="text-center py-12">
              <svg class="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4"></path>
              </svg>
              <h3 class="mt-2 text-sm font-medium text-gray-900">Aucun projet</h3>
              <p class="mt-1 text-sm text-gray-500">Ce client n'a pas encore de projets assignés.</p>
              <button 
                @click="showCreateProjectModal = true"
                class="mt-4 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
              >
                Créer le premier projet
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
    </div>

    <!-- Modal de création de projet -->
    <CreateProjectModal
      v-if="showCreateProjectModal"
      :client-id="clientId"
      @close="showCreateProjectModal = false"
      @projectCreated="onProjectCreated"
    />

    <!-- Modal d'édition de projet -->
    <EditProjectModal
      v-if="showEditProjectModal"
      :project="selectedProject"
      @close="showEditProjectModal = false"
      @update="onProjectUpdated"
    />

    <!-- Modal de confirmation de suppression -->
    <ConfirmDeleteModal
      v-if="showDeleteModal"
      :title="'Supprimer le projet'"
      :message="`Êtes-vous sûr de vouloir supprimer le projet '${selectedProject?.title}' ? Cette action est irréversible.`"
      @close="showDeleteModal = false"
      @confirm="confirmDeleteProject"
    />

    <!-- Modal de confirmation de suppression multiple -->
    <ConfirmDeleteModal
      v-if="showBulkDeleteModal"
      :title="'Supprimer les projets sélectionnés'"
      :message="`Êtes-vous sûr de vouloir supprimer ${selectedProjects.length} projet(s) ? Cette action est irréversible.`"
      @close="showBulkDeleteModal = false"
      @confirm="confirmBulkDeleteProjects"
    />

    <!-- Modales de contact -->
    <EmailModal
      v-if="showEmailModal"
      :show="showEmailModal"
      :recipient="clientInfo"
      @close="closeEmailModal"
    />
    
    <NotificationModal
      v-if="showNotificationModal"
      :show="showNotificationModal"
      :recipient="clientInfo"
      @close="closeNotificationModal"
    />
  </RoleLayout>
</template>

<script>
import { ref, onMounted, computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import RoleLayout from '../components/RoleLayout.vue'
import CreateProjectModal from '../components/modals/CreateProjectModal.vue'
import EditProjectModal from '../components/ProjectManagement/EditProjectModal.vue'
import ConfirmDeleteModal from '../components/ConfirmDeleteModal.vue'
import EmailModal from '@/components/EmailModal.vue'
import NotificationModal from '@/components/NotificationModal.vue'
import projectManagementService, { clientProjectService } from '../services/projectManagementService'
import { useProjectsStore } from '@/stores/projects'

export default {
  name: 'ClientProjectDashboard',
  components: {
    RoleLayout,
    CreateProjectModal,
    EditProjectModal,
    ConfirmDeleteModal,
    EmailModal,
    NotificationModal
  },
  setup() {
    const router = useRouter()
    const route = useRoute()
    const clientId = route.params.clientId
    const projectsStore = useProjectsStore()
    
    const clientInfo = ref(null)
    const projects = ref([])
    const loading = ref(false)
    const statusFilter = ref('')
    const showCreateProjectModal = ref(false)
    const showEditProjectModal = ref(false)
    const showDeleteModal = ref(false)
    const showBulkDeleteModal = ref(false)
    const selectedProject = ref(null)
    const selectedProjects = ref([])

    // Détection viewport pour basculer en tuiles sur mobile
    const isMobile = ref(false)
    const updateViewport = () => {
      // Inclure les tablettes dans le mode tuiles
      isMobile.value = window.innerWidth <= 1024
    }
    onMounted(() => {
      updateViewport()
      window.addEventListener('resize', updateViewport)
    })

    // Contact modals
    const showEmailModal = ref(false)
    const showNotificationModal = ref(false)

    const stats = computed(() => {
      // Vérifier que projects.value est un tableau
      const projectsArray = Array.isArray(projects.value) ? projects.value : []
      
      const totalProjects = projectsArray.length
      const completedProjects = projectsArray.filter(p => p.status === 'completed' || p.status === 'termine').length
      const activeProjects = projectsArray.filter(p => p.status === 'in_progress' || p.status === 'en_cours').length
      const overdueProjects = projectsArray.filter(p => {
        if (!p.end_date) return false
        return new Date(p.end_date) < new Date() && p.status !== 'completed' && p.status !== 'termine'
      }).length
      
      return { totalProjects, completedProjects, activeProjects, overdueProjects }
    })

    const filteredProjects = computed(() => {
      const projectsArray = Array.isArray(projects.value) ? projects.value : [];
      
      return statusFilter.value === '' 
    ? projectsArray
    : projectsArray.filter(project => project.status === statusFilter.value);
    });

    const isAllSelected = computed(() => {
      return filteredProjects.value.length > 0 && 
             filteredProjects.value.every(project => selectedProjects.value.includes(project.id))
    })

    const loadClientData = async () => {
      try {
        loading.value = true
        
        // Récupérer les informations du client
        const clientsResponse = await projectManagementService.getAssignedClients()
        if (clientsResponse.success) {
          clientInfo.value = clientsResponse.data.find(client => client.id == clientId)
        }
        
        // Récupérer les projets du client
        const projectsResponse = await clientProjectService.getClientProjects(clientId)
        console.log('🔍 Debug - Réponse getClientProjects:', {
          success: projectsResponse.success,
          dataLength: projectsResponse.data ? projectsResponse.data.length : 0,
          data: projectsResponse.data
        });
        if (projectsResponse.success) {
          // Les projets sont maintenant correctement extraits dans le service
          projects.value = projectsResponse.data || []
          console.log('🔍 Debug - Projets assignés à projects.value:', projects.value.length);
        } else {
          console.error('Échec de récupération des projets:', projectsResponse)
        }
      } catch (error) {
        console.error('Erreur lors du chargement des données du client:', error)
      } finally {
        loading.value = false
      }
    }

    const refreshData = () => {
      loadClientData()
    }

    const goBack = () => {
      router.push('/agent/projects')
    }

    const getStatusClass = (status) => {
      const classes = {
        'planning': 'bg-gray-100 text-gray-800',
        'planification': 'bg-gray-100 text-gray-800',
        'in_progress': 'bg-blue-100 text-blue-800',
        'en_cours': 'bg-blue-100 text-blue-800',
        'review': 'bg-yellow-100 text-yellow-800',
        'en_revision': 'bg-yellow-100 text-yellow-800',
        'completed': 'bg-green-100 text-green-800',
        'termine': 'bg-green-100 text-green-800',
        'on_hold': 'bg-red-100 text-red-800',
        'en_pause': 'bg-red-100 text-red-800'
      }
      return classes[status] || 'bg-gray-100 text-gray-800'
    }

    const getStatusLabel = (status) => {
      const labels = {
        'planning': 'Planification',
        'planification': 'Planification',
        'in_progress': 'En cours',
        'en_cours': 'En cours',
        'review': 'En révision',
        'en_revision': 'En révision',
        'completed': 'Terminé',
        'termine': 'Terminé',
        'on_hold': 'En pause',
        'en_pause': 'En pause'
      }
      return labels[status] || status
    }

    const getPriorityClass = (priority) => {
      const classes = {
        'low': 'bg-green-100 text-green-800',
        'medium': 'bg-yellow-100 text-yellow-800',
        'high': 'bg-orange-100 text-orange-800',
        'urgent': 'bg-red-100 text-red-800'
      }
      return classes[priority] || 'bg-gray-100 text-gray-800'
    }

    const getPriorityLabel = (priority) => {
      const labels = {
        'low': 'Basse',
        'medium': 'Moyenne',
        'high': 'Haute',
        'urgent': 'Urgente'
      }
      return labels[priority] || priority
    }

    const getProgressClass = (progress) => {
      if (progress >= 80) return 'bg-green-500'
      if (progress >= 60) return 'bg-blue-500'
      if (progress >= 40) return 'bg-yellow-500'
      return 'bg-red-500'
    }

    const formatDate = (dateString) => {
      if (!dateString) return 'Non définie'
      return new Date(dateString).toLocaleDateString('fr-FR')
    }

    const isOverdue = (dateString) => {
      if (!dateString) return false
      return new Date(dateString) < new Date()
    }

    const viewProject = (project) => {
      router.push(`/agent/clients/${clientId}/projects/${project.id}`)
    }

    const manageProject = (project) => {
      router.push(`/agent/clients/${clientId}/projects/${project.id}`)
    }

    const editProject = (project) => {
      console.log('ClientProjectDashboard.vue - editProject called with:', project)
      console.log('ClientProjectDashboard.vue - project keys:', Object.keys(project || {}))
      console.log('ClientProjectDashboard.vue - project values:', project)
      selectedProject.value = project
      console.log('ClientProjectDashboard.vue - selectedProject.value set to:', selectedProject.value)
      showEditProjectModal.value = true
      console.log('ClientProjectDashboard.vue - showEditProjectModal set to true')
    }

    const duplicateProject = async (project) => {
      try {
        loading.value = true
        const duplicatedProject = await projectManagementService.duplicateProject(project.id)
        projects.value.push(duplicatedProject)
        // Notification de succès
      } catch (error) {
        console.error('Erreur lors de la duplication du projet:', error)
        // Notification d'erreur
      } finally {
        loading.value = false
      }
    }

    const deleteProject = (project) => {
      selectedProject.value = project
      showDeleteModal.value = true
    }

    const confirmDeleteProject = async () => {
      try {
        loading.value = true
        const result = await projectManagementService.deleteProject(selectedProject.value.id)
        
        if (result.success) {
          // Supprimer du store global
          projectsStore.removeProject(selectedProject.value.id)
          
          // Supprimer de la liste locale
          const projectsArray = Array.isArray(projects.value) ? projects.value : []
          projects.value = projectsArray.filter(p => p.id !== selectedProject.value.id)
          
          // Forcer le rafraîchissement des données du client dans le store
          await projectsStore.loadClientProjects(clientId, true)
          
          showDeleteModal.value = false
          selectedProject.value = null
          // Notification de succès
        } else {
          console.error('Erreur lors de la suppression du projet:', result.error)
          // Notification d'erreur
        }
      } catch (error) {
        console.error('Erreur lors de la suppression du projet:', error)
        // Notification d'erreur
      } finally {
        loading.value = false
      }
    }

    const onProjectCreated = (projectData) => {
      try {
        // Vérifier que projects.value est un tableau avant d'ajouter
        if (!Array.isArray(projects.value)) {
          projects.value = []
        }
        
        // S'assurer que le projet a les propriétés par défaut nécessaires
        const projectWithDefaults = {
          ...projectData,
          status: projectData.status || 'planification',
          progress: projectData.progress || 0,
          priority: projectData.priority || 'medium'
        }
        
        projects.value.unshift(projectWithDefaults)
        showCreateProjectModal.value = false
        
        // Forcer la réactivité des statistiques
        // Les stats computed se mettront à jour automatiquement
        console.log('Projet créé avec succès:', projectData)
      } catch (error) {
        console.error('Erreur lors de l\'ajout du projet à la liste:', error)
      }
    }

    const onProjectUpdated = (updatedProject) => {
      const index = projects.value.findIndex(p => p.id === updatedProject.id)
      if (index !== -1) {
        // S'assurer que le projet mis à jour a toutes les propriétés nécessaires
        const projectWithDefaults = {
          ...projects.value[index], // Garder les propriétés existantes
          ...updatedProject, // Appliquer les mises à jour
          status: updatedProject.status || projects.value[index].status || 'planification',
          progress: updatedProject.progress !== undefined ? updatedProject.progress : (projects.value[index].progress || 0),
          priority: updatedProject.priority || projects.value[index].priority || 'medium'
        }
        projects.value[index] = projectWithDefaults
      }
      showEditProjectModal.value = false
      selectedProject.value = null
    }

    // Méthodes pour la gestion de la sélection multiple
    const toggleProjectSelection = (projectId) => {
      const index = selectedProjects.value.indexOf(projectId)
      if (index > -1) {
        selectedProjects.value.splice(index, 1)
      } else {
        selectedProjects.value.push(projectId)
      }
    }

    const toggleSelectAll = () => {
      if (isAllSelected.value) {
        selectedProjects.value = []
      } else {
        selectedProjects.value = filteredProjects.value.map(project => project.id)
      }
    }

    const clearSelection = () => {
      selectedProjects.value = []
    }

    const deleteSelectedProjects = () => {
      if (selectedProjects.value.length > 0) {
        showBulkDeleteModal.value = true
      }
    }

    const confirmBulkDeleteProjects = async () => {
      try {
        loading.value = true
        await projectManagementService.deleteMultipleProjects(selectedProjects.value)
        
        // Supprimer les projets de la liste locale
        const projectsArray = Array.isArray(projects.value) ? projects.value : []
        projects.value = projectsArray.filter(p => !selectedProjects.value.includes(p.id))
        
        // Réinitialiser la sélection
        selectedProjects.value = []
        showBulkDeleteModal.value = false
        
        // Notification de succès
        console.log('Projets supprimés avec succès')
      } catch (error) {
        console.error('Erreur lors de la suppression des projets:', error)
        // Notification d'erreur
      } finally {
        loading.value = false
      }
    }

    // Actions de contact
    const openEmailModal = () => {
      showEmailModal.value = true
    }
    const closeEmailModal = () => {
      showEmailModal.value = false
    }
    const openNotificationModal = () => {
      showNotificationModal.value = true
    }
    const closeNotificationModal = () => {
      showNotificationModal.value = false
    }

    onMounted(() => {
      loadClientData()
    })

    return {
      clientId,
      clientInfo,
      projects,
      loading,
      statusFilter,
      showCreateProjectModal,
      showEditProjectModal,
      showDeleteModal,
      showBulkDeleteModal,
      selectedProject,
      selectedProjects,
      // Expose mobile state
      isMobile,
      stats,
      filteredProjects,
      isAllSelected,
      refreshData,
      goBack,
      getStatusClass,
      getStatusLabel,
      getPriorityClass,
      getPriorityLabel,
      getProgressClass,
      formatDate,
      isOverdue,
      viewProject,
      manageProject,
      editProject,
      duplicateProject,
      deleteProject,
      confirmDeleteProject,
      onProjectCreated,
      onProjectUpdated,
      toggleProjectSelection,
      toggleSelectAll,
      clearSelection,
      deleteSelectedProjects,
      confirmBulkDeleteProjects,
      // contact
      showEmailModal,
      showNotificationModal,
      openEmailModal,
      closeEmailModal,
      openNotificationModal,
      closeNotificationModal
    }
  }
}
</script>

<style scoped>
.projects-tiles {
  display: grid;
  grid-template-columns: 1fr;
  gap: 0.75rem;
}

.project-tile {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
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
  font-size: 1rem;
}

.status-badge {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 0.25rem 0.5rem;
  border-radius: 9999px;
  font-size: 0.75rem;
  font-weight: 600;
  line-height: 1;
  white-space: nowrap;
}

.tile-body {
  display: flex;
  flex-direction: column;
  gap: 0.6rem;
}

.tile-description {
  color: #4b5563;
  font-size: 0.9rem;
}

.tile-progress {
  display: flex;
  align-items: center;
  gap: 0.6rem;
}

.progress-bar {
  flex: 1;
  height: 8px;
  background: #e5e7eb;
  border-radius: 9999px;
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  border-radius: 9999px;
  transition: width 0.25s ease;
}

.progress-label {
  font-size: 0.85rem;
  color: #6b7280;
}

.tile-deadline {
  font-size: 0.85rem;
  color: #374151;
}

.tile-deadline.overdue {
  color: #dc2626;
  font-weight: 600;
}

.tile-actions {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 0.5rem;
}

.tile-btn {
  padding: 0.5rem 0.75rem;
  border: 1px solid #e5e7eb;
  border-radius: 10px;
  background: #f9fafb;
  color: #1f2937;
  font-weight: 600;
  text-align: center;
}

.tile-btn.primary {
  background: #eef2ff;
  border-color: #dbeafe;
  color: #1f2937;
}

.tile-btn.danger {
  background: #fff1f2;
  border-color: #fecdd3;
  color: #b91c1c;
}

@media (min-width: 768px) {
  .projects-tiles {
    grid-template-columns: repeat(2, 1fr);
    gap: 1rem;
  }
  .project-tile {
    padding: 1rem;
  }
  .tile-actions {
    gap: 0.5rem;
  }
  .tile-btn {
    padding: 0.5rem 0.75rem;
  }
  .stats-compact {
    gap: 1rem;
  }
}

/* Statistiques compactes (mobile) */
.stats-compact {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 0.75rem;
}

.stat-chip {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0.6rem 0.8rem;
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