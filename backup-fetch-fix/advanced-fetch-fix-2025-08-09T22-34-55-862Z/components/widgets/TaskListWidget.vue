<template>
  <BaseWidget 
    :widget="widgetConfig=loading=error='showConfigModal = true=toggleWidget="loadTasks="task-list-widget=task-actions='!readonly class === empty-state=fas fa-tasks text-gray-400 text-3xl mb-3'></i>
          <p class === text-gray-500">{{ t('widgets.taskList.noTasks === !readonly=showAddTaskModal = true='empty-action-btn === tasks-list=task in filteredTasks === task.id='task-item"checkbox=task.status === 'completed === toggleTaskStatus(task)'
                :disabled === readonly=task-check=task-content === selectTask(task)'>
              <h 4 class === task-title=task-description === task.description='task-meta=task-priority === `priority-${task.priority}`>
                  {{ t(`customProjects.priorities.${task.priority}`) }}
                </span>
                
                <span class="task-due-date=task.due_date='fas fa-calendar-alt mr-1"></i>
                  {{ formatDate(task.due_date) }}
                </span>
                
                <span class="task-assignee=task.assignee='fas fa-user mr-1"></i>
                  {{ task.assignee.name }}
                </span>
              </div>
            </div>
            
            <div  class="task-actions-menu=!readonly editTask(task)'
                class="task-action-btn=t('widgets.taskList.editTask="deleteTask(task)'
                class="task-action-btn task-action-danger=t('widgets.taskList.deleteTask="task-stats='tasks.length &gt; 0>
        <div  class="stat-item=stat-value stat-label='stat-item=stat-value="stat-label="stat-item=stat-value='stat-label="showAddTaskModal || showEditTaskModal=selectedTask="projectId='closeTaskModal=saveTask="showConfigModal="widgetConfig=showConfigModal = false='updateConfig
     >
  </BaseWidget>
</template>

<script>
import { ref, computed, onMounted, watch } from 'vue'
import BaseWidget from './BaseWidget.vue'
import TaskModal from '../modals/TaskModal.vue'
import WidgetConfigModal from '../modals/WidgetConfigModal.vue'
import projectManagementService from '@/services/projectManagementService'
import { useTranslation } from '@/composables/useTranslation'
import { useNotifications } from '@/composables/useNotifications'

export default {
  name: 'TaskListWidget',
  components: {
    BaseWidget,
    TaskModal,
    WidgetConfigModal
  },
  props: {
    projectId: {
      type: [String, Number],
      required: true
    },
    widgetData: {
      type: Object,
      default: () => ({})
    },
    readonly: {
      type: Boolean,
      default: false
    }
  },
  emits: ['update-widget'],
  setup(props, { emit }) {
    const { success, error: showError } = useNotifications()
    const { t } = useTranslation()
    
    // État réactif
    const loading = ref(false)
    const error = ref(null)
    const tasks = ref([])
    const statusFilter = ref('all')
    const selectedTask = ref(null)
    const showAddTaskModal = ref(false)
    const showEditTaskModal = ref(false)
    const showConfigModal = ref(false)
    
    // Configuration du widget
    const widgetConfig = ref({
      id: 'task-list',
      name: 'Liste de Tâches',
      icon: 'fas fa-tasks',
      titleKey: 'widgets.taskList.title',
      isEnabled: true,
      ...props.widgetData
    })
    
    // Tâches filtrées
    const filteredTasks = computed(() => {
      if (statusFilter.value === 'all') return tasks.value
      
      return tasks.value.filter(task => {
        switch (statusFilter.value) {
          case 'completed':
            return task.status === 'completed'
          case 'pending':
            return task.status !== 'completed'
          case 'overdue':
            return isOverdue(task) && task.status !== 'completed'
          default:
            return true
        }
      })
    })
    
    // Statistiques
    const completedTasks = computed(() => 
      tasks.value.filter(task => task.status === 'completed')
    )
    
    const pendingTasks = computed(() => 
      tasks.value.filter(task => task.status !== 'completed')
    )
    
    const overdueTasks = computed(() => 
      tasks.value.filter(task => isOverdue(task) && task.status !== 'completed')
    )
    
    // Méthodes
    const loadTasks = async () => {
      loading.value = true
      error.value = null
      
      try {
        const result = await projectManagementService.getProjectTasks(props.projectId)
        if (result.success) {
          tasks.value = result.data
        } else {
          error.value = result.error
        }
      } catch (err) {
        error.value = t('errors.loadingFailed')
      } finally {
        loading.value = false
      }
    }
    
    const toggleTaskStatus = async (task) => {
      if (props.readonly) return
      
      const newStatus = task.status === 'completed' ? 'pending' : 'completed'
      
      try {
        const result = await projectManagementService.updateTask(task.id, {
          ...task,
          status: newStatus
        })
        
        if (result.success) {
          task.status = newStatus
          success(t('widgets.taskList.taskUpdated'))
        } else {
          showError(result.error)
        }
      } catch (err) {
        showError(t('errors.updateFailed'))
      }
    }
    
    const selectTask = (task) => {
      selectedTask.value = task
      showEditTaskModal.value = true
    }
    
    const editTask = (task) => {
      selectedTask.value = task
      showEditTaskModal.value = true
    }
    
    const deleteTask = async (task) => {
      if (!confirm(t('widgets.taskList.confirmDelete'))) return
      
      try {
        const result = await projectManagementService.deleteTask(task.id)
        if (result.success) {
          tasks.value = tasks.value.filter(t => t.id !== task.id)
          success(t('widgets.taskList.taskDeleted'))
        } else {
          showError(result.error)
        }
      } catch (err) {
        showError(t('errors.deleteFailed'))
      }
    }
    
    const saveTask = async (taskData) => {
      try {
        let result
        
        if (taskData.id) {
          // Mise à jour
          result = await projectManagementService.updateTask(taskData.id, taskData)
          if (result.success) {
            const index = tasks.value.findIndex(t => t.id === taskData.id)
            if (index !== -1) {
              tasks.value[index] = result.data
            }
          }
        } else {
          // Création
          result = await projectManagementService.createTask(props.projectId, taskData)
          if (result.success) {
            tasks.value.push(result.data)
          }
        }
        
        if (result.success) {
          success(t('widgets.taskList.taskSaved'))
          closeTaskModal()
        } else {
          showError(result.error)
        }
      } catch (err) {
        showError(t('errors.saveFailed'))
      }
    }
    
    const closeTaskModal = () => {
      showAddTaskModal.value = false
      showEditTaskModal.value = false
      selectedTask.value = null
    }
    
    const toggleWidget = () => {
      widgetConfig.value.isEnabled = !widgetConfig.value.isEnabled
      emit('update-widget', widgetConfig.value)
    }
    
    const updateConfig = (newConfig) => {
      widgetConfig.value = { ...widgetConfig.value, ...newConfig }
      emit('update-widget', widgetConfig.value)
      showConfigModal.value = false
    }
    
    const isOverdue = (task) => {
      if (!task.due_date) return false
      return new Date(task.due_date) < new Date() && task.status !== 'completed'
    }
    
    const formatDate = (date) => {
      return new Date(date).toLocaleDateString('fr-FR')
    }
    
    // Watchers
    watch(() => props.projectId, loadTasks, { immediate: true })
    
    onMounted(() => {
      loadTasks()
    })
    
    return {
      loading,
      error,
      tasks,
      statusFilter,
      selectedTask,
      showAddTaskModal,
      showEditTaskModal,
      showConfigModal,
      widgetConfig,
      filteredTasks,
      completedTasks,
      pendingTasks,
      overdueTasks,
      loadTasks,
      toggleTaskStatus,
      selectTask,
      editTask,
      deleteTask,
      saveTask,
      closeTaskModal,
      toggleWidget,
      updateConfig,
      isOverdue,
      formatDate,
      t
    }
  }
}
</script>

<style scoped>
.task-list-widget {
  @apply space-y-4;
}

.task-actions {
  @apply flex items-center justify-between mb-4;
}

.add-task-btn {
  @apply px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors flex items-center;
}

.task-filters {
  @apply flex items-center space-x-2;
}

.filter-select {
  @apply px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500;
}

.tasks-container {
  @apply min-h-48;
}

.empty-state {
  @apply text-center py-8;
}

.empty-action-btn {
  @apply mt-3 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors;
}

.tasks-list {
  @apply space-y-2;
}

.task-item {
  @apply flex items-start space-x-3 p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors;
}

.task-completed {
  @apply bg-green-50 border-green-200;
}

.task-overdue {
  @apply bg-red-50 border-red-200;
}

.task-checkbox {
  @apply flex-shrink-0 pt-1;
}

.task-check {
  @apply w-4 h-4 text-blue-600 rounded focus:ring-blue-500;
}

.task-content {
  @apply flex-1 cursor-pointer;
}

.task-title {
  @apply font-medium text-gray-900 mb-1;
}

.task-completed .task-title {
  @apply line-through text-gray-500;
}

.task-description {
  @apply text-sm text-gray-600 mb-2;
}

.task-meta {
  @apply flex items-center space-x-3 text-xs;
}

.task-priority {
  @apply px-2 py-1 rounded-full text-xs font-medium;
}

.priority-low {
  @apply bg-gray-100 text-gray-800;
}

.priority-medium {
  @apply bg-yellow-100 text-yellow-800;
}

.priority-high {
  @apply bg-orange-100 text-orange-800;
}

.priority-urgent {
  @apply bg-red-100 text-red-800;
}

.task-due-date {
  @apply text-gray-500;
}

.task-assignee {
  @apply text-gray-500;
}

.task-actions-menu {
  @apply flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-opacity;
}

.task-item:hover .task-actions-menu {
  @apply opacity-100;
}

.task-action-btn {
  @apply p-1 rounded text-gray-400 hover:text-gray-600 transition-colors;
}

.task-action-danger {
  @apply hover:text-red-600;
}

.task-stats {
  @apply flex items-center justify-around pt-4 border-t border-gray-200 mt-4;
}

.stat-item {
  @apply text-center;
}

.stat-value {
  @apply block text-2xl font-bold text-gray-900;
}

.stat-label {
  @apply text-sm text-gray-500;
}
</style>