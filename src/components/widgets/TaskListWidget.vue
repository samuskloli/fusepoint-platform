<template>
  <BaseWidget 
    :widget="widgetConfig"
    :loading="loading"
    :error="error"
    @show-config="showConfigModal = true"
    @toggle="toggleWidget"
    @refresh="loadTasks"
  >
    <div class="task-list-widget">
      <!-- Actions et filtres -->
      <div class="task-actions">
        <div class="filter-tabs">
          <button 
            v-for="filter in filterOptions" 
            :key="filter.value"
            :class="['filter-tab', { active: statusFilter === filter.value }]"
            @click="statusFilter = filter.value"
          >
            {{ t(filter.label) }}
            <span v-if="filter.count !== undefined" class="filter-count">
              {{ filter.count }}
            </span>
          </button>
        </div>
        
        <button 
          v-if="!readonly" 
          class="add-task-btn"
          @click="showAddTaskModal = true"
        >
          <i class="fas fa-plus mr-2"></i>
          {{ t('widgets.taskList.addTask') }}
        </button>
      </div>
      
      <!-- État vide -->
      <div v-if="filteredTasks.length === 0" class="empty-state">
        <i class="fas fa-tasks text-gray-400 text-3xl mb-3"></i>
        <p class="text-gray-500">{{ t('widgets.taskList.noTasks') }}</p>
        <button 
          v-if="!readonly" 
          @click="showAddTaskModal = true" 
          class="empty-action-btn"
        >
          {{ t('widgets.taskList.addFirstTask') }}
        </button>
      </div>
      
      <!-- Liste des tâches -->
      <div v-else class="tasks-list">
        <div 
          v-for="task in filteredTasks" 
          :key="task.id" 
          class="task-item"
        >
          <div class="task-main">
            <input 
              type="checkbox" 
              :checked="task.status === 'completed'" 
              @change="toggleTaskStatus(task)"
              :disabled="readonly"
              class="task-check"
            >
            
            <div class="task-content" @click="selectTask(task)">
              <h4 class="task-title">{{ task.title }}</h4>
              <p v-if="task.description" class="task-description">
                {{ task.description }}
              </p>
              
              <div class="task-meta">
                <span 
                  v-if="task.priority" 
                  :class="['task-priority', `priority-${task.priority}`]"
                >
                  {{ t(`customProjects.priorities.${task.priority}`) }}
                </span>
                
                <span v-if="task.due_date" class="task-due-date">
                  <i class="fas fa-calendar-alt mr-1"></i>
                  {{ formatDate(task.due_date) }}
                </span>
                
                <span v-if="task.assignee" class="task-assignee">
                  <i class="fas fa-user mr-1"></i>
                  {{ task.assignee.name }}
                </span>
              </div>
            </div>
            
            <div v-if="!readonly" class="task-actions-menu">
              <button 
                @click="editTask(task)"
                class="task-action-btn"
                :title="t('widgets.taskList.editTask')"
              >
                <i class="fas fa-edit"></i>
              </button>
              <button 
                @click="deleteTask(task)"
                class="task-action-btn task-action-danger"
                :title="t('widgets.taskList.deleteTask')"
              >
                <i class="fas fa-trash"></i>
              </button>
            </div>
          </div>
        </div>
      </div>
      
      <!-- Statistiques -->
      <div v-if="tasks.length > 0" class="task-stats">
        <div class="stat-item">
          <span class="stat-value">{{ tasks.length }}</span>
          <span class="stat-label">{{ t('widgets.taskList.total') }}</span>
        </div>
        <div class="stat-item">
          <span class="stat-value">{{ completedTasks.length }}</span>
          <span class="stat-label">{{ t('widgets.taskList.completed') }}</span>
        </div>
        <div class="stat-item">
          <span class="stat-value">{{ pendingTasks.length }}</span>
          <span class="stat-label">{{ t('widgets.taskList.pending') }}</span>
        </div>
      </div>
    </div>
    
    <!-- Modals -->
    <TaskModal
      v-if="showAddTaskModal || showEditTaskModal"
      :task="selectedTask"
      :project-id="projectId"
      @close="closeTaskModal"
      @save="saveTask"
    />
    
    <WidgetConfigModal
      v-if="showConfigModal"
      :widget="widgetConfig"
      @close="showConfigModal = false"
      @save="updateConfig"
    />
  </BaseWidget>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import BaseWidget from './shared/components/BaseWidget.vue'
import TaskModal from '../modals/TaskModal.vue'
import WidgetConfigModal from '../modals/WidgetConfigModal.vue'
import projectManagementService from '@/services/projectManagementService'
import { useTranslation } from '@/composables/useTranslation'
import { useNotifications } from '@/composables/useNotifications'

// Props
interface Props {
  projectId: string
  widgetData?: any
  widget?: any
}

const props = defineProps<Props>()

// Emits
const emit = defineEmits<{
  'widget-updated': [widget: any]
}>()

// Composables
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
  isEnabled: props.widget?.is_enabled ?? true,
  showCompleted: props.widget?.show_completed ?? true,
  showPriority: props.widget?.show_priority ?? true,
  showDueDate: props.widget?.show_due_date ?? true,
  maxTasks: props.widget?.max_tasks ?? 10
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
    
// Options de filtre
const filterOptions = computed(() => [
  {
    value: 'all',
    label: 'widgets.taskList.filters.all',
    count: tasks.value.length
  },
  {
    value: 'pending',
    label: 'widgets.taskList.filters.pending',
    count: pendingTasks.value.length
  },
  {
    value: 'completed',
    label: 'widgets.taskList.filters.completed',
    count: completedTasks.value.length
  },
  {
    value: 'overdue',
    label: 'widgets.taskList.filters.overdue',
    count: overdueTasks.value.length
  }
])

// Méthodes utilitaires
const isOverdue = (task) => {
  if (!task.due_date || task.status === 'completed') return false
  return new Date(task.due_date) < new Date()
}

const formatDate = (dateString) => {
  if (!dateString) return ''
  const date = new Date(dateString)
  return date.toLocaleDateString('fr-FR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  })
}
    
    // Méthodes
    const loadTasks = async () => {
      loading.value = true
      error.value = null
      
      try {
        const result = await projectManagementService.getProjectTasks(props.projectId)
        if (result.success) {
          tasks.value = result.data || []
        } else {
          error.value = result.error
        }
      } catch (err) {
        console.error('Erreur lors du chargement des tâches:', err)
        error.value = t('errors.loadingFailed')
        showError('Erreur lors du chargement des tâches')
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
        console.error('Erreur lors de la mise à jour de la tâche:', err)
        showError(t('errors.updateFailed'))
      }
    }
    
    const selectTask = (task) => {
      if (props.readonly) return
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
        console.error('Erreur lors de la suppression de la tâche:', err)
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
          success(taskData.id ? t('widgets.taskList.taskUpdated') : t('widgets.taskList.taskCreated'))
          closeTaskModal()
        } else {
          showError(result.error)
        }
      } catch (err) {
        console.error('Erreur lors de la sauvegarde de la tâche:', err)
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
  const updatedWidget = {
    ...props.widget,
    is_enabled: widgetConfig.value.isEnabled
  }
  emit('widget-updated', updatedWidget)
}
    
    const updateConfig = (newConfig) => {
      widgetConfig.value = { ...widgetConfig.value, ...newConfig }
      emit('widget-updated', widgetConfig.value)
      showConfigModal.value = false
    }
    
    // Watchers
    watch(() => props.projectId, () => {
      if (props.projectId) {
        loadTasks()
      }
    }, { immediate: true })
    
    // Lifecycle
    onMounted(() => {
      if (props.projectId) {
        loadTasks()
      }
    })
    

</script>

<style scoped>
.task-list-widget {
  padding: 1rem;
}

.task-actions {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
  flex-wrap: wrap;
  gap: 1rem;
}

.filter-tabs {
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
}

.filter-tab {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  background: #f3f4f6;
  border: 1px solid #d1d5db;
  border-radius: 0.375rem;
  font-size: 0.875rem;
  color: #374151;
  cursor: pointer;
  transition: all 0.2s;
}

.filter-tab:hover {
  background: #e5e7eb;
}

.filter-tab.active {
  background: #3b82f6;
  border-color: #3b82f6;
  color: white;
}

.filter-count {
  background: rgba(255, 255, 255, 0.2);
  padding: 0.125rem 0.375rem;
  border-radius: 0.25rem;
  font-size: 0.75rem;
  font-weight: 600;
}

.filter-tab.active .filter-count {
  background: rgba(255, 255, 255, 0.3);
}

.add-task-btn {
  display: flex;
  align-items: center;
  padding: 0.5rem 1rem;
  background: #10b981;
  border: none;
  border-radius: 0.375rem;
  color: white;
  font-size: 0.875rem;
  cursor: pointer;
  transition: background 0.2s;
}

.add-task-btn:hover {
  background: #059669;
}

.empty-state {
  text-align: center;
  padding: 2rem;
  color: #6b7280;
}

.empty-action-btn {
  margin-top: 1rem;
  padding: 0.5rem 1rem;
  background: #3b82f6;
  border: none;
  border-radius: 0.375rem;
  color: white;
  cursor: pointer;
  transition: background 0.2s;
}

.empty-action-btn:hover {
  background: #2563eb;
}

.tasks-list {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.task-item {
  background: white;
  border: 1px solid #e5e7eb;
  border-radius: 0.5rem;
  padding: 1rem;
  transition: all 0.2s;
}

.task-item:hover {
  border-color: #d1d5db;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.task-main {
  display: flex;
  align-items: flex-start;
  gap: 1rem;
}

.task-check {
  margin-top: 0.25rem;
  width: 1rem;
  height: 1rem;
  cursor: pointer;
}

.task-content {
  flex: 1;
  cursor: pointer;
}

.task-title {
  font-size: 1rem;
  font-weight: 600;
  color: #1f2937;
  margin-bottom: 0.25rem;
}

.task-description {
  font-size: 0.875rem;
  color: #6b7280;
  margin-bottom: 0.5rem;
  line-height: 1.4;
}

.task-meta {
  display: flex;
  gap: 1rem;
  flex-wrap: wrap;
  font-size: 0.75rem;
  color: #6b7280;
}

.task-priority {
  padding: 0.125rem 0.5rem;
  border-radius: 0.25rem;
  font-weight: 600;
  text-transform: uppercase;
}

.priority-low {
  background: #d1fae5;
  color: #065f46;
}

.priority-medium {
  background: #fef3c7;
  color: #92400e;
}

.priority-high {
  background: #fee2e2;
  color: #991b1b;
}

.task-due-date,
.task-assignee {
  display: flex;
  align-items: center;
  gap: 0.25rem;
}

.task-actions-menu {
  display: flex;
  gap: 0.5rem;
}

.task-action-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 2rem;
  height: 2rem;
  background: #f3f4f6;
  border: 1px solid #d1d5db;
  border-radius: 0.375rem;
  color: #6b7280;
  cursor: pointer;
  transition: all 0.2s;
}

.task-action-btn:hover {
  background: #e5e7eb;
  color: #374151;
}

.task-action-danger:hover {
  background: #fee2e2;
  border-color: #fca5a5;
  color: #dc2626;
}

.task-stats {
  display: flex;
  justify-content: space-around;
  margin-top: 1.5rem;
  padding: 1rem;
  background: #f9fafb;
  border-radius: 0.5rem;
  border: 1px solid #e5e7eb;
}

.stat-item {
  text-align: center;
}

.stat-value {
  display: block;
  font-size: 1.5rem;
  font-weight: bold;
  color: #1f2937;
}

.stat-label {
  font-size: 0.75rem;
  color: #6b7280;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.mr-1 {
  margin-right: 0.25rem;
}

.mr-2 {
  margin-right: 0.5rem;
}

.text-gray-400 {
  color: #9ca3af;
}

.text-gray-500 {
  color: #6b7280;
}

.text-3xl {
  font-size: 1.875rem;
}

.mb-3 {
  margin-bottom: 0.75rem;
}
</style>