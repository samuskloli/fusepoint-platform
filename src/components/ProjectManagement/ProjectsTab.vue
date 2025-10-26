<template>
  <div class="space-y-6">
    <!-- En-tête avec statistiques -->
    <div class="grid grid-cols-1 md:grid-cols-4 gap-6">
      <div class="bg-white rounded-lg shadow p-6">
        <div class="flex items-center">
          <div class="p-2 bg-blue-100 rounded-lg">
            <svg class="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4"></path>
            </svg>
          </div>
          <div class="ml-4">
            <p class="text-sm font-medium text-gray-600">Total</p>
            <p class="text-2xl font-bold text-gray-900">{{ projects.length }}</p>
          </div>
        </div>
      </div>

      <div class="bg-white rounded-lg shadow p-6">
        <div class="flex items-center">
          <div class="p-2 bg-green-100 rounded-lg">
            <svg class="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
            </svg>
          </div>
          <div class="ml-4">
            <p class="text-sm font-medium text-gray-600">Terminés</p>
            <p class="text-2xl font-bold text-gray-900">{{ completedProjects }}</p>
          </div>
        </div>
      </div>

      <div class="bg-white rounded-lg shadow p-6">
        <div class="flex items-center">
          <div class="p-2 bg-yellow-100 rounded-lg">
            <svg class="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
            </svg>
          </div>
          <div class="ml-4">
            <p class="text-sm font-medium text-gray-600">En Cours</p>
            <p class="text-2xl font-bold text-gray-900">{{ activeProjects }}</p>
          </div>
        </div>
      </div>

      <div class="bg-white rounded-lg shadow p-6">
        <div class="flex items-center">
          <div class="p-2 bg-red-100 rounded-lg">
            <svg class="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"></path>
            </svg>
          </div>
          <div class="ml-4">
            <p class="text-sm font-medium text-gray-600">En Retard</p>
            <p class="text-2xl font-bold text-gray-900">{{ overdueProjects }}</p>
          </div>
        </div>
      </div>
    </div>

    <!-- Filtres et actions -->
    <div class="bg-white rounded-lg shadow p-6">
      <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
        <div class="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-4">
          <div class="relative">
            <select 
               v-model="statusFilter" 
               class="appearance-none border border-gray-300 rounded-md pl-2 pr-7 py-1.5 md:py-2 text-xs md:text-sm font-normal text-gray-700 bg-white hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 w-auto"
             >
              <option value="">Tous les statuts</option>
              <option value="planning">Planification</option>
              <option value="in_progress">En cours</option>
              <option value="review">En révision</option>
              <option value="completed">Terminé</option>
              <option value="on_hold">En pause</option>
            </select>
            <svg class="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 w-3 h-3 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
               <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
             </svg>
          </div>

          <div class="relative">
            <select 
               v-model="priorityFilter" 
               class="appearance-none border border-gray-300 rounded-md pl-2 pr-7 py-1.5 md:py-2 text-xs md:text-sm font-normal text-gray-700 bg-white hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 w-auto"
             >
              <option value="">Toutes les priorités</option>
              <option value="low">Basse</option>
              <option value="medium">Moyenne</option>
              <option value="high">Haute</option>
              <option value="urgent">Urgente</option>
            </select>
            <svg class="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 w-3 h-3 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
               <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
             </svg>
          </div>

          <input 
            v-model="searchQuery"
            type="text"
            placeholder="Rechercher un projet..."
            class="border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
        </div>

        <div class="flex space-x-2">
          <button 
            @click="toggleView"
            class="bg-gray-100 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200 transition-colors flex items-center"
          >
            <svg v-if="viewMode === 'grid'" class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 10h16M4 14h16M4 18h16"></path>
            </svg>
            <svg v-else class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z"></path>
            </svg>
            {{ viewMode === 'grid' ? 'Liste' : 'Grille' }}
          </button>
        </div>
      </div>
    </div>

    <!-- Vue grille -->
    <div v-if="viewMode === 'grid'" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      <div 
        v-for="project in filteredProjects" 
        :key="project.id"
        class="bg-white rounded-lg shadow hover:shadow-lg transition-shadow cursor-pointer"
        @click="$emit('view-project', project)"
      >
        <div class="p-6">
          <div class="flex items-center justify-between mb-4">
            <h3 class="text-lg font-semibold text-gray-900 truncate">{{ project.title }}</h3>
            <div class="flex space-x-1">
              <button 
                @click.stop="$emit('edit-project', project)"
                class="text-gray-400 hover:text-blue-600 transition-colors"
              >
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path>
                </svg>
              </button>
              <button 
                @click.stop="$emit('duplicate-project', project)"
                class="text-gray-400 hover:text-green-600 transition-colors"
              >
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"></path>
                </svg>
              </button>
              <button 
                @click.stop="$emit('delete-project', project)"
                class="text-gray-400 hover:text-red-600 transition-colors"
              >
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
                </svg>
              </button>
            </div>
          </div>

          <p class="text-sm text-gray-600 mb-4 line-clamp-2">{{ project.description }}</p>

          <div class="flex items-center justify-between mb-4">
            <span :class="getStatusClass(project.status)" class="inline-flex items-center justify-center px-2 py-1 text-xs leading-none font-semibold rounded-full">
              {{ getStatusLabel(project.status) }}
            </span>
            <span :class="getPriorityClass(project.priority)" class="inline-flex items-center justify-center px-2 py-1 text-xs leading-none font-semibold rounded-full">
              {{ getPriorityLabel(project.priority) }}
            </span>
          </div>

          <div class="mb-4">
            <div class="flex items-center justify-between text-sm text-gray-600 mb-1">
              <span>Progrès</span>
              <span>{{ project.progress }}%</span>
            </div>
            <div class="w-full bg-gray-200 rounded-full h-2">
              <div :class="getProgressClass(project.progress)" class="h-2 rounded-full transition-all duration-300" :style="{ width: project.progress + '%' }"></div>
            </div>
          </div>

          <div class="text-sm text-gray-600">
            <div class="flex items-center justify-between">
              <span>Début:</span>
              <span>{{ formatDate(project.start_date) }}</span>
            </div>
            <div class="flex items-center justify-between">
              <span>Échéance:</span>
              <span :class="{ 'text-red-600 font-semibold': isOverdue(project.end_date) }">
                {{ formatDate(project.end_date) }}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Vue liste -->
    <div v-else class="bg-white rounded-lg shadow overflow-hidden">
      <div class="overflow-x-auto">
        <table class="min-w-full divide-y divide-gray-200">
          <thead class="bg-gray-50">
            <tr>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Projet</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Statut</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Priorité</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Progrès</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Échéance</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody class="bg-white divide-y divide-gray-200">
            <tr v-for="project in filteredProjects" :key="project.id" class="hover:bg-gray-50">
              <td class="px-6 py-4 whitespace-nowrap">
                <div class="cursor-pointer" @click="$emit('view-project', project)">
                  <div class="text-sm font-medium text-gray-900">{{ project.title }}</div>
                  <div class="text-sm text-gray-500">{{ project.description }}</div>
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
              <td class="px-6 py-4 whitespace-nowrap text-sm font-medium">
                <div class="flex space-x-2">
                  <button 
                    @click="$emit('view-project', project)" 
                    class="text-blue-600 hover:text-blue-900 transition-colors"
                  >
                    Voir
                  </button>
                  <button 
                    @click="$emit('edit-project', project)" 
                    class="text-green-600 hover:text-green-900 transition-colors"
                  >
                    Modifier
                  </button>
                  <button 
                    @click="$emit('duplicate-project', project)" 
                    class="text-purple-600 hover:text-purple-900 transition-colors"
                  >
                    Dupliquer
                  </button>
                  <button 
                    @click="$emit('delete-project', project)" 
                    class="text-red-600 hover:text-red-900 transition-colors"
                  >
                    Supprimer
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Message si aucun projet -->
      <div v-if="filteredProjects.length === 0" class="text-center py-12">
        <svg class="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4"></path>
        </svg>
        <h3 class="mt-2 text-sm font-medium text-gray-900">Aucun projet trouvé</h3>
        <p class="mt-1 text-sm text-gray-500">
          {{ searchQuery || statusFilter || priorityFilter ? 'Aucun projet ne correspond aux critères de recherche.' : 'Ce client n\'a pas encore de projets.' }}
        </p>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, computed } from 'vue'

export default {
  name: 'ProjectsTab',
  props: {
    projects: {
      type: Array,
      default: () => []
    },
    loading: {
      type: Boolean,
      default: false
    }
  },
  emits: ['edit-project', 'delete-project', 'view-project', 'duplicate-project'],
  setup(props) {
    const statusFilter = ref('')
    const priorityFilter = ref('')
    const searchQuery = ref('')
    const viewMode = ref('grid')

    const completedProjects = computed(() => {
      return props.projects.filter(p => p.status === 'completed').length
    })

    const activeProjects = computed(() => {
      return props.projects.filter(p => p.status === 'in_progress').length
    })

    const overdueProjects = computed(() => {
      return props.projects.filter(p => {
        if (!p.end_date) return false
        return new Date(p.end_date) < new Date() && p.status !== 'completed'
      }).length
    })

    const filteredProjects = computed(() => {
      let filtered = props.projects

      if (statusFilter.value) {
        filtered = filtered.filter(project => project.status === statusFilter.value)
      }

      if (priorityFilter.value) {
        filtered = filtered.filter(project => project.priority === priorityFilter.value)
      }

      if (searchQuery.value) {
        const query = searchQuery.value.toLowerCase()
        filtered = filtered.filter(project => 
          project.title.toLowerCase().includes(query) ||
          project.description.toLowerCase().includes(query)
        )
      }

      return filtered
    })

    const toggleView = () => {
      viewMode.value = viewMode.value === 'grid' ? 'list' : 'grid'
    }

    const getStatusClass = (status) => {
      const classes = {
        'planning': 'bg-gray-100 text-gray-800',
        'in_progress': 'bg-blue-100 text-blue-800',
        'review': 'bg-yellow-100 text-yellow-800',
        'completed': 'bg-green-100 text-green-800',
        'on_hold': 'bg-red-100 text-red-800'
      }
      return classes[status] || 'bg-gray-100 text-gray-800'
    }

    const getStatusLabel = (status) => {
      const labels = {
        'planning': 'Planification',
        'in_progress': 'En cours',
        'review': 'En révision',
        'completed': 'Terminé',
        'on_hold': 'En pause'
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

    return {
      statusFilter,
      priorityFilter,
      searchQuery,
      viewMode,
      completedProjects,
      activeProjects,
      overdueProjects,
      filteredProjects,
      toggleView,
      getStatusClass,
      getStatusLabel,
      getPriorityClass,
      getPriorityLabel,
      getProgressClass,
      formatDate,
      isOverdue
    }
  }
}
</script>

<style scoped>
.line-clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
</style>