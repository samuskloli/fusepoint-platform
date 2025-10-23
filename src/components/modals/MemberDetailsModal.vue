<template>
  <div class="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50" @click="closeModal">
    <div class="relative top-20 mx-auto p-5 border w-11/12 md:w-3/4 lg:w-2/3 shadow-lg rounded-lg bg-white" @click.stop>
      <!-- En-tête -->
      <div class="flex items-center justify-between pb-4 border-b border-gray-200">
        <div class="flex items-center space-x-4">
          <div class="w-16 h-16 bg-gray-300 rounded-full flex items-center justify-center">
            <img v-if="member.avatar" :src="member.avatar" :alt="member.name" class="w-16 h-16 rounded-full object-cover" />
            <span v-else class="text-xl font-medium text-gray-700">
              {{ member.name?.charAt(0).toUpperCase() }}
            </span>
          </div>
          <div>
            <h3 class="text-xl font-medium text-gray-900">{{ member.name }}</h3>
            <p class="text-sm text-gray-600">{{ member.email }}</p>
            <div class="flex items-center mt-1">
              <span class="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium" :class="getStatusClass(member.status)">
                <span class="w-2 h-2 rounded-full mr-1" :class="getStatusDotClass(member.status)"></span>
                {{ t(`team.status.${member.status}`) }}
              </span>
              <span class="ml-2 text-xs text-gray-500">{{ member.role }}</span>
            </div>
          </div>
        </div>
        <button @click="closeModal" class="text-gray-400 hover:text-gray-600">
          <i class="fas fa-times text-xl"></i>
        </button>
      </div>

      <div class="mt-6">
        <!-- Onglets -->
        <div class="border-b border-gray-200">
          <nav class="-mb-px flex space-x-8">
            <button
              @click="activeTab = 'overview'"
              class="py-2 px-1 border-b-2 font-medium text-sm"
              :class="activeTab === 'overview' ? 'border-blue-500 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'"
            >
              <i class="fas fa-user mr-2"></i>
              {{ t('team.overview') }}
            </button>
            <button
              @click="activeTab = 'tasks'"
              class="py-2 px-1 border-b-2 font-medium text-sm"
              :class="activeTab === 'tasks' ? 'border-blue-500 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'"
            >
              <i class="fas fa-tasks mr-2"></i>
              {{ t('team.tasks') }}
            </button>
            <button
              @click="activeTab = 'activity'"
              class="py-2 px-1 border-b-2 font-medium text-sm"
              :class="activeTab === 'activity' ? 'border-blue-500 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'"
            >
              <i class="fas fa-chart-line mr-2"></i>
              {{ t('team.activity') }}
            </button>
            <button
              @click="activeTab = 'permissions'"
              class="py-2 px-1 border-b-2 font-medium text-sm"
              :class="activeTab === 'permissions' ? 'border-blue-500 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'"
            >
              <i class="fas fa-shield-alt mr-2"></i>
              {{ t('team.permissions') }}
            </button>
          </nav>
        </div>

        <div class="mt-6">
          <!-- Vue d'ensemble -->
          <div v-if="activeTab === 'overview'" class="space-y-6">
            <!-- Informations personnelles -->
            <div class="bg-gray-50 rounded-lg p-4">
              <h4 class="text-md font-medium text-gray-900 mb-3">{{ t('team.personalInfo') }}</h4>
              <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label class="block text-sm font-medium text-gray-700">{{ t('team.fullName') }}</label>
                  <p class="mt-1 text-sm text-gray-900">{{ member.name || t('common.notSpecified') }}</p>
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-700">{{ t('team.email') }}</label>
                  <p class="mt-1 text-sm text-gray-900">{{ member.email }}</p>
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-700">{{ t('team.phone') }}</label>
                  <p class="mt-1 text-sm text-gray-900">{{ member.phone || t('common.notSpecified') }}</p>
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-700">{{ t('team.department') }}</label>
                  <p class="mt-1 text-sm text-gray-900">{{ member.department || t('common.notSpecified') }}</p>
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-700">{{ t('team.joinedDate') }}</label>
                  <p class="mt-1 text-sm text-gray-900">{{ formatDate(member.joined_at) }}</p>
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-700">{{ t('team.lastActive') }}</label>
                  <p class="mt-1 text-sm text-gray-900">{{ formatDate(member.last_active) }}</p>
                </div>
              </div>
            </div>
            
            <!-- Statistiques -->
            <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div class="bg-blue-50 rounded-lg p-4">
                <div class="flex items-center">
                  <div class="flex-shrink-0">
                    <i class="fas fa-tasks text-blue-600 text-xl"></i>
                  </div>
                  <div class="ml-3">
                    <p class="text-sm font-medium text-blue-900">{{ t('team.totalTasks') }}</p>
                    <p class="text-2xl font-semibold text-blue-600">{{ memberStats.total_tasks || 0 }}</p>
                  </div>
                </div>
              </div>
              
              <div class="bg-green-50 rounded-lg p-4">
                <div class="flex items-center">
                  <div class="flex-shrink-0">
                    <i class="fas fa-check-circle text-green-600 text-xl"></i>
                  </div>
                  <div class="ml-3">
                    <p class="text-sm font-medium text-green-900">{{ t('team.completedTasks') }}</p>
                    <p class="text-2xl font-semibold text-green-600">{{ memberStats.completed_tasks || 0 }}</p>
                  </div>
                </div>
              </div>
              
              <div class="bg-yellow-50 rounded-lg p-4">
                <div class="flex items-center">
                  <div class="flex-shrink-0">
                    <i class="fas fa-clock text-yellow-600 text-xl"></i>
                  </div>
                  <div class="ml-3">
                    <p class="text-sm font-medium text-yellow-900">{{ t('team.hoursWorked') }}</p>
                    <p class="text-2xl font-semibold text-yellow-600">{{ memberStats.hours_worked || 0 }}h</p>
                  </div>
                </div>
              </div>
              
              <div class="bg-purple-50 rounded-lg p-4">
                <div class="flex items-center">
                  <div class="flex-shrink-0">
                    <i class="fas fa-star text-purple-600 text-xl"></i>
                  </div>
                  <div class="ml-3">
                    <p class="text-sm font-medium text-purple-900">{{ t('team.performance') }}</p>
                    <p class="text-2xl font-semibold text-purple-600">{{ memberStats.performance_score || 0 }}%</p>
                  </div>
                </div>
              </div>
            </div>
            
            <!-- Compétences -->
            <div v-if="member.skills && member.skills.length > 0">
              <h4 class="text-md font-medium text-gray-900 mb-3">{{ t('team.skills') }}</h4>
              <div class="flex flex-wrap gap-2">
                <span
                  v-for="skill in member.skills"
                  :key="skill"
                  class="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800"
                >
                  {{ skill }}
                </span>
              </div>
            </div>
          </div>

          <!-- Tâches -->
          <div v-if="activeTab === 'tasks'" class="space-y-4">
            <div class="flex justify-between items-center">
              <h4 class="text-md font-medium text-gray-900">{{ t('team.memberTasks') }}</h4>
              <div class="flex space-x-2">
                <select v-model="taskFilter" class="text-sm border border-gray-300 rounded-md px-2 py-1">
                  <option value="all">{{ t('tasks.filter.all') }}</option>
                  <option value="active">{{ t('tasks.filter.active') }}</option>
                  <option value="completed">{{ t('tasks.filter.completed') }}</option>
                  <option value="overdue">{{ t('tasks.filter.overdue') }}</option>
                </select>
              </div>
            </div>
            
            <div v-if="loading" class="text-center py-8">
              <i class="fas fa-spinner fa-spin text-gray-400 text-2xl"></i>
            </div>
            
            <div v-else-if="filteredTasks.length === 0" class="text-center py-8">
              <i class="fas fa-tasks text-gray-400 text-3xl mb-2"></i>
              <p class="text-gray-600">{{ t('team.noTasks') }}</p>
            </div>
            
            <div v-else class="space-y-3">
              <div 
                v-for="task in filteredTasks"
                :key="task.id"
                class="border border-gray-200 rounded-lg p-4 hover:bg-gray-50"
              >
                <div class="flex items-center justify-between">
                  <div class="flex-1">
                    <h5 class="text-sm font-medium text-gray-900">{{ task.title }}</h5>
                    <p class="text-xs text-gray-600 mt-1">{{ task.description }}</p>
                    <div class="flex items-center mt-2 space-x-4">
                      <span class="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium" :class="getTaskStatusClass(task.status)">
                        {{ t(`tasks.status.${task.status}`) }}
                      </span>
                      <span class="text-xs text-gray-500">
                        {{ t('tasks.priority') }}: {{ task.priority }}
                      </span>
                      <span v-if="task.due_date" class="text-xs text-gray-500">
                        {{ t('tasks.dueDate') }}: {{ formatDate(task.due_date) }}
                      </span>
                    </div>
                  </div>
                  <div class="ml-4">
                    <button
                      @click="viewTask(task)"
                      class="text-blue-600 hover:text-blue-800 text-sm"
                    >
                      {{ t('common.view') }}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Activité -->
          <div v-if="activeTab === 'activity'" class="space-y-4">
            <h4 class="text-md font-medium text-gray-900">{{ t('team.recentActivity') }}</h4>
            
            <div v-if="loading" class="text-center py-8">
              <i class="fas fa-spinner fa-spin text-gray-400 text-2xl"></i>
            </div>
            
            <div v-else-if="memberActivity.length === 0" class="text-center py-8">
              <i class="fas fa-chart-line text-gray-400 text-3xl mb-2"></i>
              <p class="text-gray-600">{{ t('team.noActivity') }}</p>
            </div>
            
            <div v-else class="space-y-3">
              <div 
                v-for="activity in memberActivity"
                :key="activity.id"
                class="flex items-start space-x-3 p-3 bg-gray-50 rounded-lg"
              >
                <div class="flex-shrink-0">
                  <div class="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                    <i :class="getActivityIcon(activity.type)" class="text-blue-600 text-sm"></i>
                  </div>
                </div>
                <div class="flex-1">
                  <p class="text-sm text-gray-900">{{ activity.description }}</p>
                  <p class="text-xs text-gray-600 mt-1">{{ formatDate(activity.created_at) }}</p>
                </div>
              </div>
            </div>
          </div>

          <!-- Permissions -->
          <div v-if="activeTab === 'permissions'" class="space-y-4">
            <div class="flex justify-between items-center">
              <h4 class="text-md font-medium text-gray-900">{{ t('team.memberPermissions') }}</h4>
              <button v-if="canEditPermissions" @click="editPermissions" class="text-blue-600 hover:text-blue-800 text-sm">
                {{ t('team.editPermissions') }}
              </button>
            </div>
            
            <div class="bg-gray-50 rounded-lg p-4">
              <div class="mb-4">
                <label class="block text-sm font-medium text-gray-700 mb-2">{{ t('team.role') }}</label>
                <span class="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
                  {{ member.role }}
                </span>
              </div>
              
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-3">{{ t('team.permissions') }}</label>
                <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div 
                    v-for="permission in allPermissions"
                    :key="permission.value"
                    class="flex items-center justify-between p-3 border border-gray-200 rounded-lg"
                  >
                    <div class="flex-1">
                      <p class="text-sm font-medium text-gray-900">{{ permission.label }}</p>
                      <p class="text-xs text-gray-600">{{ permission.description }}</p>
                    </div>
                    <div class="ml-3">
                      <span v-if="hasPermission(permission.value)" class="text-green-600">
                        <i class="fas fa-check-circle"></i>
                      </span>
                      <span v-else class="text-gray-400">
                        <i class="fas fa-times-circle"></i>
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Actions -->
        <div class="flex justify-between pt-4 border-t border-gray-200 mt-6">
          <div class="flex space-x-3">
            <button 
              v-if="canSendMessage"
              @click="sendMessage"
              class="px-4 py-2 text-sm font-medium text-blue-700 bg-blue-100 rounded-md hover:bg-blue-200"
            >
              <i class="fas fa-envelope mr-2"></i>
              {{ t('team.sendMessage') }}
            </button>
            <button
              v-if="canAssignTask"
              @click="assignTask"
              class="px-4 py-2 text-sm font-medium text-green-700 bg-green-100 rounded-md hover:bg-green-200"
            >
              <i class="fas fa-plus mr-2"></i>
              {{ t('team.assignTask') }}
            </button>
          </div>
          <div class="flex space-x-3">
            <button
              v-if="canEditMember"
              @click="editMember"
              class="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
            >
              {{ t('team.editMember') }}
            </button>
            <button
              @click="closeModal"
              class="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
            >
              {{ t('common.close') }}
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, computed, onMounted } from 'vue'
import projectManagementService from '@/services/projectManagementService'
import { useTranslation } from '@/composables/useTranslation'
import { useNotifications } from '@/composables/useNotifications'
import { useAuth } from '@/composables/useAuth'

export default {
  name: 'MemberDetailsModal',
  props: {
    member: {
      type: Object,
      required: true
    },
    projectId: {
      type: [String, Number],
      required: true
    }
  },
  emits: ['close', 'edit', 'assign-task', 'send-message'],
  setup(props, { emit }) {
    const { t } = useTranslation()
    const { success, error: showError } = useNotifications()
    const { user } = useAuth()
    
    const loading = ref(false)
    const activeTab = ref('overview')
    const taskFilter = ref('all')
    
    const memberStats = ref({})
    const memberTasks = ref([])
    const memberActivity = ref([])
    const allPermissions = ref([
      {
        value: 'view_project',
        label: t('permissions.viewProject'),
        description: t('permissions.viewProjectDesc')
      },
      {
        value: 'edit_project',
        label: t('permissions.editProject'),
        description: t('permissions.editProjectDesc')
      },
      {
        value: 'manage_tasks',
        label: t('permissions.manageTasks'),
        description: t('permissions.manageTasksDesc')
      },
      {
        value: 'manage_team',
        label: t('permissions.manageTeam'),
        description: t('permissions.manageTeamDesc')
      },
      {
        value: 'view_reports',
        label: t('permissions.viewReports'),
        description: t('permissions.viewReportsDesc')
      },
      {
        value: 'manage_files',
        label: t('permissions.manageFiles'),
        description: t('permissions.manageFilesDesc')
      }
    ])
    
    // Computed properties
    const filteredTasks = computed(() => {
      if (taskFilter.value === 'all') return memberTasks.value
      return memberTasks.value.filter(task => {
        switch (taskFilter.value) {
          case 'active':
            return ['pending', 'in_progress'].includes(task.status)
          case 'completed':
            return task.status === 'completed'
          case 'overdue':
            return new Date(task.due_date) < new Date() && task.status !== 'completed'
          default:
            return true
        }
      })
    })
    
    const canEditPermissions = computed(() => {
      return user.value?.role === 'admin' || user.value?.permissions?.includes('manage_team')
    })
    
    const canSendMessage = computed(() => {
      return user.value?.id !== props.member.id
    })
    
    const canAssignTask = computed(() => {
      return user.value?.permissions?.includes('manage_tasks')
    })
    
    const canEditMember = computed(() => {
      return user.value?.role === 'admin' || user.value?.permissions?.includes('manage_team')
    })
    
    // Methods
    const closeModal = () => {
      emit('close')
    }
    
    const editMember = () => {
      emit('edit', props.member)
    }
    
    const assignTask = () => {
      emit('assign-task', props.member)
    }
    
    const sendMessage = () => {
      emit('send-message', props.member)
    }
    
    const editPermissions = () => {
      // Logique pour éditer les permissions
    }
    
    const viewTask = (task) => {
      // Logique pour voir les détails de la tâche
    }
    
    const formatDate = (date) => {
      if (!date) return t('common.notSpecified')
      return new Date(date).toLocaleDateString()
    }
    
    const getStatusClass = (status) => {
      const classes = {
        active: 'bg-green-100 text-green-800',
        inactive: 'bg-gray-100 text-gray-800',
        busy: 'bg-yellow-100 text-yellow-800',
        away: 'bg-red-100 text-red-800'
      }
      return classes[status] || 'bg-gray-100 text-gray-800'
    }
    
    const getStatusDotClass = (status) => {
      const classes = {
        active: 'bg-green-400',
        inactive: 'bg-gray-400',
        busy: 'bg-yellow-400',
        away: 'bg-red-400'
      }
      return classes[status] || 'bg-gray-400'
    }
    
    const getTaskStatusClass = (status) => {
      const classes = {
        pending: 'bg-yellow-100 text-yellow-800',
        in_progress: 'bg-blue-100 text-blue-800',
        completed: 'bg-green-100 text-green-800',
        cancelled: 'bg-red-100 text-red-800'
      }
      return classes[status] || 'bg-gray-100 text-gray-800'
    }
    
    const getActivityIcon = (type) => {
      const icons = {
        task_created: 'fas fa-plus',
        task_completed: 'fas fa-check',
        task_updated: 'fas fa-edit',
        comment_added: 'fas fa-comment',
        file_uploaded: 'fas fa-upload',
        project_joined: 'fas fa-user-plus'
      }
      return icons[type] || 'fas fa-circle'
    }
    
    const hasPermission = (permission) => {
      return props.member.permissions?.includes(permission) || false
    }
    
    const loadMemberData = async () => {
      try {
        loading.value = true
        
        // Charger les statistiques du membre
        const statsResponse = await projectManagementService.getMemberStats(props.projectId, props.member.id)
        memberStats.value = statsResponse.data
        
        // Charger les tâches du membre
        const tasksResponse = await projectManagementService.getMemberTasks(props.projectId, props.member.id)
        memberTasks.value = tasksResponse.data
        
        // Charger l'activité du membre
        const activityResponse = await projectManagementService.getMemberActivity(props.projectId, props.member.id)
        memberActivity.value = activityResponse.data
        
      } catch (error) {
        console.error('Erreur lors du chargement des données du membre:', error)
        showError(t('errors.loadMemberData'))
      } finally {
        loading.value = false
      }
    }
    
    // Lifecycle
    onMounted(() => {
      loadMemberData()
    })
    
    return {
      loading,
      activeTab,
      taskFilter,
      memberStats,
      memberTasks,
      memberActivity,
      allPermissions,
      filteredTasks,
      canEditPermissions,
      canSendMessage,
      canAssignTask,
      canEditMember,
      closeModal,
      editMember,
      assignTask,
      sendMessage,
      editPermissions,
      viewTask,
      formatDate,
      getStatusClass,
      getStatusDotClass,
      getTaskStatusClass,
      getActivityIcon,
      hasPermission,
      t
    }
  }
}
</script>

<style scoped>
/* Styles spécifiques au composant */
</style>