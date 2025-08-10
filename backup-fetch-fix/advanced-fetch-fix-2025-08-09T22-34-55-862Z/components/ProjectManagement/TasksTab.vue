<template>
  <div class="space-y-6">
    <!-- En-tête avec actions -->
    <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between">
      <div>
        <h3 class="text-lg font-medium text-gray-900">Gestion des tâches</h3>
        <p class="mt-1 text-sm text-gray-500">Organisez et suivez les tâches du projet</p>
      </div>
      <div class="mt-4 sm:mt-0 flex space-x-3">
        <button
          @click="showCreateTask = true"
          class="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          <svg class="-ml-1 mr-2 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"></path>
          </svg>
          Nouvelle tâche
        </button>
      </div>
    </div>

    <!-- Filtres et recherche -->
    <div class="bg-white p-4 rounded-lg border border-gray-200">
      <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
        <!-- Recherche -->
        <div>
          <label for="search" class="block text-sm font-medium text-gray-700 mb-1">
            Rechercher
          </label>
          <div class="relative">
            <input
              id="search"
              v-model="filters.search"
              type="text"
              placeholder="Rechercher une tâche..."
              class="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
            <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <svg class="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
              </svg>
            </div>
          </div>
        </div>

        <!-- Statut -->
        <div>
          <label for="status-filter" class="block text-sm font-medium text-gray-700 mb-1">
            Statut
          </label>
          <select
            id="status-filter"
            v-model="filters.status"
            class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">Tous les statuts</option>
            <option value="todo">À faire</option>
            <option value="in_progress">En cours</option>
            <option value="review">En révision</option>
            <option value="completed">Terminée</option>
            <option value="blocked">Bloquée</option>
          </select>
        </div>

        <!-- Priorité -->
        <div>
          <label for="priority-filter" class="block text-sm font-medium text-gray-700 mb-1">
            Priorité
          </label>
          <select
            id="priority-filter"
            v-model="filters.priority"
            class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">Toutes les priorités</option>
            <option value="low">Basse</option>
            <option value="medium">Moyenne</option>
            <option value="high">Haute</option>
            <option value="urgent">Urgente</option>
          </select>
        </div>

        <!-- Assigné à -->
        <div>
          <label for="assignee-filter" class="block text-sm font-medium text-gray-700 mb-1">
            Assigné à
          </label>
          <select
            id="assignee-filter"
            v-model="filters.assignee"
            class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">Tous les membres</option>
            <option v-for="member in teamMembers" :key="member.id" :value="member.id">
              {{ member.name }}
            </option>
          </select>
        </div>
      </div>
    </div>

    <!-- Vue Kanban / Liste -->
    <div class="bg-white rounded-lg border border-gray-200">
      <!-- Toggle vue -->
      <div class="px-4 py-3 border-b border-gray-200">
        <div class="flex items-center justify-between">
          <div class="flex items-center space-x-4">
            <span class="text-sm font-medium text-gray-700">Vue :</span>
            <div class="flex rounded-md shadow-sm">
              <button
                @click="viewMode = 'kanban'"
                :class="[
                  viewMode === 'kanban'
                    ? 'bg-blue-600 text-white'
                    : 'bg-white text-gray-700 hover:bg-gray-50',
                  'px-3 py-2 text-sm font-medium rounded-l-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500'
                ]"
              >
                Kanban
              </button>
              <button
                @click="viewMode = 'list'"
                :class="[
                  viewMode === 'list'
                    ? 'bg-blue-600 text-white'
                    : 'bg-white text-gray-700 hover:bg-gray-50',
                  'px-3 py-2 text-sm font-medium rounded-r-md border-t border-r border-b border-gray-300 -ml-px focus:outline-none focus:ring-2 focus:ring-blue-500'
                ]"
              >
                Liste
              </button>
            </div>
          </div>
          <div class="text-sm text-gray-500">
            {{ filteredTasks.length }} tâche(s)
          </div>
        </div>
      </div>

      <!-- Vue Kanban -->
      <div v-if="viewMode === 'kanban'" class="p-4">
        <div class="grid grid-cols-1 md:grid-cols-5 gap-4">
          <!-- Colonnes Kanban -->
          <div v-for="status in kanbanColumns" :key="status.key" class="bg-gray-50 rounded-lg p-3">
            <div class="flex items-center justify-between mb-3">
              <h4 class="font-medium text-gray-900">{{ status.label }}</h4>
              <span class="bg-gray-200 text-gray-700 text-xs px-2 py-1 rounded-full">
                {{ getTasksByStatus(status.key).length }}
              </span>
            </div>
            
            <div class="space-y-3">
              <div
                v-for="task in getTasksByStatus(status.key)"
                :key="task.id"
                class="bg-white p-3 rounded-lg border border-gray-200 cursor-pointer hover:shadow-md transition-shadow"
                @click="editTask(task)"
              >
                <div class="flex items-start justify-between mb-2">
                  <h5 class="font-medium text-gray-900 text-sm">{{ task.title }}</h5>
                  <span
                    :class="getPriorityClass(task.priority)"
                    class="text-xs px-2 py-1 rounded-full"
                  >
                    {{ getPriorityLabel(task.priority) }}
                  </span>
                </div>
                
                <p v-if="task.description" class="text-sm text-gray-600 mb-2 line-clamp-2">
                  {{ task.description }}
                </p>
                
                <div class="flex items-center justify-between text-xs text-gray-500">
                  <div class="flex items-center space-x-2">
                    <span v-if="task.assignee">{{ task.assignee.name }}</span>
                    <span v-if="task.due_date" class="flex items-center">
                      <svg class="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
                      </svg>
                      {{ formatDate(task.due_date) }}
                    </span>
                  </div>
                  <div class="flex items-center space-x-1">
                    <button
                      @click.stop="editTask(task)"
                      class="text-blue-600 hover:text-blue-800"
                    >
                      <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path>
                      </svg>
                    </button>
                    <button
                      @click.stop="deleteTask(task.id)"
                      class="text-red-600 hover:text-red-800"
                    >
                      <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
                      </svg>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Vue Liste -->
      <div v-else class="overflow-x-auto">
        <table class="min-w-full divide-y divide-gray-200">
          <thead class="bg-gray-50">
            <tr>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Tâche
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Statut
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Priorité
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Assigné à
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Échéance
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Progrès
              </th>
              <th class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody class="bg-white divide-y divide-gray-200">
            <tr v-for="task in filteredTasks" :key="task.id" class="hover:bg-gray-50">
              <td class="px-6 py-4 whitespace-nowrap">
                <div>
                  <div class="text-sm font-medium text-gray-900">{{ task.title }}</div>
                  <div v-if="task.description" class="text-sm text-gray-500 truncate max-w-xs">
                    {{ task.description }}
                  </div>
                </div>
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <span
                  :class="getStatusClass(task.status)"
                  class="inline-flex px-2 py-1 text-xs font-semibold rounded-full"
                >
                  {{ getStatusLabel(task.status) }}
                </span>
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <span
                  :class="getPriorityClass(task.priority)"
                  class="inline-flex px-2 py-1 text-xs font-semibold rounded-full"
                >
                  {{ getPriorityLabel(task.priority) }}
                </span>
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                {{ task.assignee ? task.assignee.name : 'Non assigné' }}
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                {{ task.due_date ? formatDate(task.due_date) : '-' }}
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <div class="flex items-center">
                  <div class="w-16 bg-gray-200 rounded-full h-2 mr-2">
                    <div
                      class="bg-blue-600 h-2 rounded-full"
                      :style="{ width: task.progress + '%' }"
                    ></div>
                  </div>
                  <span class="text-sm text-gray-900">{{ task.progress }}%</span>
                </div>
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                <div class="flex items-center justify-end space-x-2">
                  <button
                    @click="editTask(task)"
                    class="text-blue-600 hover:text-blue-900"
                  >
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path>
                    </svg>
                  </button>
                  <button
                    @click="deleteTask(task.id)"
                    class="text-red-600 hover:text-red-900"
                  >
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
                    </svg>
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Modal de création/édition de tâche -->
    <CreateTaskModal
      v-if="showCreateTask"
      :task="selectedTask"
      :project-id="projectId"
      :team-members="teamMembers"
      @close="closeTaskModal"
      @save="saveTask"
    />
  </div>
</template>

<script>
import { ref, computed } from 'vue'
import CreateTaskModal from './CreateTaskModal.vue'

export default {
  name: 'TasksTab',
  components: {
    CreateTaskModal
  },
  props: {
    tasks: {
      type: Array,
      default: () => []
    },
    project: {
      type: Object,
      default: () => null
    },
    teamMembers: {
      type: Array,
      default: () => []
    }
  },
  setup(props, { emit }) {
    const loading = ref(false)
    const showCreateTask = ref(false)
    const selectedTask = ref(null)
    const viewMode = ref('kanban')

    const filters = ref({
      search: '',
      status: '',
      priority: '',
      assignee: ''
    })

    const kanbanColumns = [
      { key: 'todo', label: 'À faire' },
      { key: 'in_progress', label: 'En cours' },
      { key: 'review', label: 'En révision' },
      { key: 'completed', label: 'Terminée' },
      { key: 'blocked', label: 'Bloquée' }
    ]

    const filteredTasks = computed(() => {
      if (!Array.isArray(props.tasks)) return []
      return props.tasks.filter(task => {
        const matchesSearch = !filters.value.search || 
          task.title.toLowerCase().includes(filters.value.search.toLowerCase()) ||
          (task.description && task.description.toLowerCase().includes(filters.value.search.toLowerCase()))
        
        const matchesStatus = !filters.value.status || task.status === filters.value.status
        const matchesPriority = !filters.value.priority || task.priority === filters.value.priority
        const matchesAssignee = !filters.value.assignee || 
          (task.assignee && task.assignee.id.toString() === filters.value.assignee)

        return matchesSearch && matchesStatus && matchesPriority && matchesAssignee
      })
    })

    const getTasksByStatus = (status) => {
      return filteredTasks.value.filter(task => task.status === status)
    }

    const getStatusClass = (status) => {
      const classes = {
        'todo': 'bg-gray-100 text-gray-800',
        'in_progress': 'bg-blue-100 text-blue-800',
        'review': 'bg-yellow-100 text-yellow-800',
        'completed': 'bg-green-100 text-green-800',
        'blocked': 'bg-red-100 text-red-800'
      }
      return classes[status] || 'bg-gray-100 text-gray-800'
    }

    const getStatusLabel = (status) => {
      const labels = {
        'todo': 'À faire',
        'in_progress': 'En cours',
        'review': 'En révision',
        'completed': 'Terminée',
        'blocked': 'Bloquée'
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

    const formatDate = (date) => {
      return new Date(date).toLocaleDateString('fr-FR')
    }

    const editTask = (task) => {
      selectedTask.value = { ...task }
      showCreateTask.value = true
    }

    const deleteTask = (taskId) => {
      if (confirm('Êtes-vous sûr de vouloir supprimer cette tâche ?')) {
        emit('delete-task', taskId)
      }
    }

    const closeTaskModal = () => {
      showCreateTask.value = false
      selectedTask.value = null
    }

    const saveTask = (taskData) => {
      if (selectedTask.value) {
        emit('edit-task', { id: selectedTask.value.id, ...taskData })
      } else {
        emit('create-task', taskData)
      }
      closeTaskModal()
    }

    return {
      loading,
      showCreateTask,
      selectedTask,
      viewMode,
      filters,
      kanbanColumns,
      filteredTasks,
      getTasksByStatus,
      getStatusClass,
      getStatusLabel,
      getPriorityClass,
      getPriorityLabel,
      formatDate,
      editTask,
      deleteTask,
      closeTaskModal,
      saveTask
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