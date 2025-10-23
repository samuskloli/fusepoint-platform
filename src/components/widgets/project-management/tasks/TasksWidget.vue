<template>
  <BaseWidget 
    :widget="widgetConfig"
    :loading="loading"
    :error="error"
    @configure="showConfiguration"
    @toggle="toggleWidget"
    @retry="refreshWidget"
    class="tasks-widget"
  >
    <div class="tasks-content">
      <!-- En-tête avec statistiques -->
      <div class="tasks-header">
        <div class="tasks-stats">
          <div class="stat-card">
            <div class="stat-number">{{ stats.total }}</div>
            <div class="stat-label">{{ t('widgets.tasks.total') }}</div>
          </div>
          <div class="stat-card">
            <div class="stat-number text-green-600">{{ stats.completed }}</div>
            <div class="stat-label">{{ t('widgets.tasks.completed') }}</div>
          </div>
          <div class="stat-card">
            <div class="stat-number text-blue-600">{{ stats.inProgress }}</div>
            <div class="stat-label">{{ t('widgets.tasks.inProgress') }}</div>
          </div>
          <div class="stat-card">
            <div class="stat-number text-orange-600">{{ stats.pending }}</div>
            <div class="stat-label">{{ t('widgets.tasks.pending') }}</div>
          </div>
        </div>
        
        <div class="tasks-actions">
          <button @click="showAddTaskModal = true" class="btn-primary">
            <i class="fas fa-plus"></i>
            {{ t('widgets.tasks.addTask') }}
          </button>
        </div>
      </div>
      
      <!-- Filtres -->
      <div class="tasks-filters">
        <select v-model="selectedStatus" @change="filterTasks" class="filter-select">
          <option value="all">{{ t('widgets.tasks.allTasks') }}</option>
          <option value="pending">{{ t('widgets.tasks.pending') }}</option>
          <option value="in_progress">{{ t('widgets.tasks.inProgress') }}</option>
          <option value="completed">{{ t('widgets.tasks.completed') }}</option>
        </select>
        
        <select v-model="selectedPriority" @change="filterTasks" class="filter-select">
          <option value="all">{{ t('widgets.tasks.allPriorities') }}</option>
          <option value="high">{{ t('widgets.tasks.highPriority') }}</option>
          <option value="medium">{{ t('widgets.tasks.mediumPriority') }}</option>
          <option value="low">{{ t('widgets.tasks.lowPriority') }}</option>
        </select>
      </div>
      
      <!-- Liste des tâches -->
      <div class="tasks-list">
        <div v-if="filteredTasks.length === 0" class="empty-state">
          <i class="fas fa-tasks text-gray-400 text-4xl mb-4"></i>
          <p class="text-gray-500">{{ t('widgets.tasks.noTasks') }}</p>
        </div>
        
        <TaskItem
          v-for="task in filteredTasks"
          :key="task.id"
          :task="task"
          @update="updateTask"
          @delete="deleteTask"
          @toggle-status="toggleTaskStatus"
        />
      </div>
    </div>
    
    <!-- Modal d'ajout de tâche -->
    <AddTaskModal
      v-if="showAddTaskModal"
      @close="showAddTaskModal = false"
      @save="addTask"
    />
    
    <!-- Modal de configuration -->
    <TasksConfigModal
      v-if="isConfiguring"
      :config="widgetConfig"
      @close="hideConfiguration"
      @save="saveConfiguration"
    />
  </BaseWidget>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useWidget } from '../../shared/composables'
import { BaseWidget } from '../../shared/components'
import { widgetApiService } from '../../shared/services'
import TaskItem from './components/TaskItem.vue'
import AddTaskModal from './components/AddTaskModal.vue'
import TasksConfigModal from './components/TasksConfigModal.vue'
import { useTranslation } from '@/composables/useTranslation'
import type { Task, TaskStatus, TaskPriority } from './types'

interface Props {
  widget: any
  projectId: string
}

const props = defineProps<Props>()
const { t } = useTranslation()

// Utilisation du composable widget
const {
  loading,
  error,
  data,
  isConfiguring,
  widgetConfig,
  setLoading,
  setError,
  setData,
  toggleWidget,
  showConfiguration,
  hideConfiguration,
  refreshWidget,
  handleError
} = useWidget(props.widget)

// États locaux
const tasks = ref<Task[]>([])
const selectedStatus = ref<string>('all')
const selectedPriority = ref<string>('all')
const showAddTaskModal = ref(false)

// Statistiques calculées
const stats = computed(() => {
  const total = tasks.value.length
  const completed = tasks.value.filter(t => t.status === 'completed').length
  const inProgress = tasks.value.filter(t => t.status === 'in_progress').length
  const pending = tasks.value.filter(t => t.status === 'pending').length
  
  return { total, completed, inProgress, pending }
})

// Tâches filtrées
const filteredTasks = computed(() => {
  let filtered = tasks.value
  
  if (selectedStatus.value !== 'all') {
    filtered = filtered.filter(task => task.status === selectedStatus.value)
  }
  
  if (selectedPriority.value !== 'all') {
    filtered = filtered.filter(task => task.priority === selectedPriority.value)
  }
  
  return filtered.sort((a, b) => {
    // Tri par priorité puis par date de création
    const priorityOrder = { high: 3, medium: 2, low: 1 }
    if (priorityOrder[a.priority] !== priorityOrder[b.priority]) {
      return priorityOrder[b.priority] - priorityOrder[a.priority]
    }
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  })
})

// Chargement des données
const loadData = async () => {
  try {
    setLoading(true)
    const response = await widgetApiService.getWidgetData(props.projectId, 'tasks')
    tasks.value = Array.isArray(response?.tasks) ? response.tasks : []
    setData(response)
  } catch (err) {
    handleError(err)
  } finally {
    setLoading(false)
  }
}

// Gestion des tâches
const addTask = async (taskData: Partial<Task>) => {
  try {
    setLoading(true)
    const newTask = await widgetApiService.updateWidgetData(props.projectId, 'tasks', {
      action: 'create',
      task: taskData
    })
    tasks.value.unshift(newTask)
    showAddTaskModal.value = false
  } catch (err) {
    handleError(err)
  } finally {
    setLoading(false)
  }
}

const updateTask = async (taskId: string, updates: Partial<Task>) => {
  try {
    const updatedTask = await widgetApiService.updateWidgetData(props.projectId, 'tasks', {
      action: 'update',
      taskId,
      updates
    })
    const index = tasks.value.findIndex(t => t.id === taskId)
    if (index !== -1) {
      tasks.value[index] = { ...tasks.value[index], ...updatedTask }
    }
  } catch (err) {
    handleError(err)
  }
}

const deleteTask = async (taskId: string) => {
  try {
    await widgetApiService.updateWidgetData(props.projectId, 'tasks', {
      action: 'delete',
      taskId
    })
    tasks.value = tasks.value.filter(t => t.id !== taskId)
  } catch (err) {
    handleError(err)
  }
}

const toggleTaskStatus = async (taskId: string) => {
  const task = tasks.value.find(t => t.id === taskId)
  if (!task) return
  
  const newStatus: TaskStatus = task.status === 'completed' ? 'pending' : 'completed'
  await updateTask(taskId, { status: newStatus })
}

const filterTasks = () => {
  // Les tâches sont automatiquement filtrées via le computed filteredTasks
}

const saveConfiguration = async (config: any) => {
  try {
    await WidgetApiService.saveWidgetConfig(props.widget.id, config)
    hideConfiguration()
  } catch (err) {
    handleError(err)
  }
}

// Chargement initial
onMounted(() => {
  if (props.widget.isEnabled) {
    loadData()
  }
})
</script>

<style scoped>
.tasks-widget {
  @apply min-h-96;
}

.tasks-content {
  @apply space-y-4;
}

.tasks-header {
  @apply flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4;
}

.tasks-stats {
  @apply grid grid-cols-2 sm:grid-cols-4 gap-4;
}

.stat-card {
  @apply bg-gray-50 rounded-lg p-3 text-center;
}

.stat-number {
  @apply text-2xl font-bold;
}

.stat-label {
  @apply text-sm text-gray-600 mt-1;
}

.tasks-actions {
  @apply flex justify-end;
}

.btn-primary {
  @apply bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2;
}

.tasks-filters {
  @apply flex gap-4;
}

.filter-select {
  @apply border border-gray-300 rounded-lg px-3 py-2 bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent;
}

.tasks-list {
  @apply space-y-2 max-h-96 overflow-y-auto;
}

.empty-state {
  @apply text-center py-8;
}
</style>