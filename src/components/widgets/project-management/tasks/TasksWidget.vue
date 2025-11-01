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
        <div v-if="creationFeedback" class="feedback-banner">
          <i class="fas fa-check-circle mr-2"></i>
          {{ creationFeedback }}
        </div>
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
          <option value="cancelled">{{ t('widgets.tasks.status.cancelled') }}</option>
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
      :server-error="createError"
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
import { useMultiTenantApi, useMultiTenant } from '@/services/multiTenantService'
import projectManagementService from '@/services/projectManagementService'


interface Props {
  widget: any
  projectId: string
}

const props = defineProps<Props>()
const { t } = useTranslation()
const { getTasks: apiGetTasks, createTask: apiCreateTask, updateTask: apiUpdateTask, deleteTask: apiDeleteTask } = useMultiTenantApi()

// Multi-tenant context helpers
const { validateContext, setContext } = useMultiTenant()

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

const tasks = ref<Task[]>([])
const selectedStatus = ref<string>('all')
const selectedPriority = ref<string>('all')
const showAddTaskModal = ref(false)
const createError = ref<string>('')
const creationFeedback = ref<string>('')



// Mapper une tâche API vers le format du widget
const mapApiTaskToWidgetTask = (apiTask: any): Task => {
  // Normaliser le statut de l'API vers les statuts UI supportés
  const rawStatus = String(apiTask.status || '').toLowerCase()
  let uiStatus: TaskStatus = 'pending'
  if (rawStatus === 'done' || rawStatus === 'completed') {
    uiStatus = 'completed'
  } else if (rawStatus === 'cancelled' || rawStatus === 'canceled' || rawStatus === 'rejected') {
    uiStatus = 'cancelled'
  } else if (rawStatus === 'in_progress' || rawStatus === 'progress') {
    uiStatus = 'in_progress'
  } else if (rawStatus === 'pending_validation' || rawStatus === 'in_review' || rawStatus === 'review') {
    // Pas d'état UI dédié, on le considère comme en attente
    uiStatus = 'pending'
  } else {
    // inclut 'todo', 'pending', et valeurs inconnues -> défaut en attente
    uiStatus = 'pending'
  }
  const priorityMap: Record<string, TaskPriority> = {
    low: 'low',
    medium: 'medium',
    high: 'high',
    urgent: 'high'
  }
  return {
    id: String(apiTask.id),
    title: apiTask.title,
    description: apiTask.description || '',
    status: uiStatus,
    priority: priorityMap[apiTask.priority] || 'medium',
    assignedTo: apiTask.assigned_to ? String(apiTask.assigned_to) : undefined,
    dueDate: apiTask.due_date || undefined,
    createdAt: apiTask.created_at,
    updatedAt: apiTask.updated_at || apiTask.created_at,
    projectId: props.projectId,
    tags: [],
    estimatedHours: typeof apiTask.estimated_hours !== 'undefined' && apiTask.estimated_hours !== null
      ? Number(apiTask.estimated_hours)
      : undefined,
    actualHours: typeof apiTask.actual_hours !== 'undefined' && apiTask.actual_hours !== null
      ? Number(apiTask.actual_hours)
      : undefined,
    dependencies: [],
    attachments: []
  }
}

// Mapper les mises à jour du widget vers l’API
const mapWidgetUpdatesToApi = (updates: Partial<Task>) => {
  const statusReverseMap: Record<TaskStatus, string> = {
    pending: 'todo',
    in_progress: 'in_progress',
    completed: 'done',
    cancelled: 'cancelled'
  }
  const payload: any = {}
  if (updates.title !== undefined) payload.title = updates.title
  if (updates.description !== undefined) payload.description = updates.description
  if (updates.status !== undefined) payload.status = statusReverseMap[updates.status]
  if (updates.priority !== undefined) payload.priority = updates.priority
  if (updates.assignedTo !== undefined) payload.assigned_to = updates.assignedTo ? Number(updates.assignedTo) : null
  if (updates.dueDate !== undefined) payload.due_date = updates.dueDate
  if (updates.estimatedHours !== undefined) payload.estimated_hours = updates.estimatedHours
  if (updates.actualHours !== undefined) payload.actual_hours = updates.actualHours
  return payload
}

const stats = computed(() => {
  const total = tasks.value.length
  const completed = tasks.value.filter(t => t.status === 'completed').length
  const inProgress = tasks.value.filter(t => t.status === 'in_progress').length
  const pending = tasks.value.filter(t => t.status === 'pending').length
  return { total, completed, inProgress, pending }
})

const filteredTasks = computed(() => {
  let filtered = tasks.value
  if (selectedStatus.value !== 'all') {
    filtered = filtered.filter(task => task.status === selectedStatus.value)
  }
  if (selectedPriority.value !== 'all') {
    filtered = filtered.filter(task => task.priority === selectedPriority.value)
  }
  return filtered.sort((a, b) => {
    const priorityOrder = { high: 3, medium: 2, low: 1 }
    if (priorityOrder[a.priority] !== priorityOrder[b.priority]) {
      return priorityOrder[b.priority] - priorityOrder[a.priority]
    }
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  })
})

// Résoudre et initialiser le contexte à partir du projectId si nécessaire
const resolveContextFromProject = async () => {
  try {
    if (validateContext()) return
    if (!props.projectId) return
    const resp = await projectManagementService.getProjectDetails(String(props.projectId))
    if (resp?.success && resp.data) {
      const project = resp.data
      const clientIdNum = Number(project.client_id ?? project.clientId ?? project.client?.id)
      const projectIdNum = Number(project.id ?? props.projectId)
      if (!clientIdNum || Number.isNaN(clientIdNum) || !projectIdNum || Number.isNaN(projectIdNum)) return
      const clientCtx = {
        id: clientIdNum,
        name: project.client?.name ?? '',
        status: project.client?.status ?? 'active'
      }
      const projectCtx = {
        id: projectIdNum,
        name: project.name ?? '',
        status: project.status ?? 'active',
        client_id: clientIdNum
      }
      setContext(clientCtx, projectCtx)
    }
  } catch (e) {
    console.error('Échec de la résolution du contexte pour TasksWidget', e)
  }
}

const loadData = async () => {
  try {
    setLoading(true)
    await resolveContextFromProject()
    const resp = await apiGetTasks()
    const apiTasks = resp?.data?.tasks || []
    tasks.value = apiTasks.map(mapApiTaskToWidgetTask)
    setData({ tasks: tasks.value, stats: resp?.data?.stats || {} })
  } catch (err) {
    handleError(err)
  } finally {
    setLoading(false)
  }
}

const addTask = async (taskData: Partial<Task>) => {
  try {
    setLoading(true)
    createError.value = ''
    await resolveContextFromProject()
    const payload: any = {
      title: taskData.title!,
      description: taskData.description,
      priority: taskData.priority || 'medium',
      assigned_to: taskData.assignedTo ? Number(taskData.assignedTo) : undefined,
      due_date: taskData.dueDate
    }
    // Inclure les heures estimées si fournies (pour activer l'affichage de la progression)
    if (typeof taskData.estimatedHours !== 'undefined') {
      payload.estimated_hours = taskData.estimatedHours
    }
    // Inclure les heures réelles si fournies
    if (typeof taskData.actualHours !== 'undefined') {
      payload.actual_hours = taskData.actualHours
    }
    const resp = await apiCreateTask(payload)
    const created = resp?.data?.task
    if (created) {
      tasks.value.unshift(mapApiTaskToWidgetTask(created))
      showAddTaskModal.value = false
      creationFeedback.value = t('widgets.tasks.taskCreated')
      setTimeout(() => { creationFeedback.value = '' }, 2500)
    }
  } catch (err: any) {
    createError.value = err?.message || t('widgets.tasks.errors.saveFailed')
    handleError(err)
  } finally {
    setLoading(false)
  }
}

const updateTask = async (taskId: string, updates: Partial<Task>) => {
  try {
    console.log('🔄 Updating task:', taskId, 'with updates:', updates)
    
    // Mise à jour optimiste pour une réactivité immédiate
    const taskIndex = tasks.value.findIndex(t => t.id === taskId)
    if (taskIndex !== -1) {
      const currentTask = tasks.value[taskIndex]
      
      // Créer une nouvelle instance de tâche avec les mises à jour
      const optimisticTask = {
        ...currentTask,
        ...updates,
        updatedAt: new Date().toISOString()
      }
      
      // Mise à jour immédiate pour la réactivité
      tasks.value[taskIndex] = optimisticTask
      console.log('✅ Optimistic update applied:', optimisticTask)
    }
    
    // Appel API pour persister les changements
    const resp = await apiUpdateTask(Number(taskId), mapWidgetUpdatesToApi(updates))
    const updated = resp?.data?.task
    
    if (updated) {
      const index = tasks.value.findIndex(t => t.id === taskId)
      if (index !== -1) {
        // Remplacer par les données confirmées du serveur
        const serverTask = mapApiTaskToWidgetTask(updated)
        tasks.value[index] = serverTask
        console.log('🔄 Server update confirmed:', serverTask)
      }
    }
  } catch (err) {
    console.error('❌ Task update failed:', err)
    
    // En cas d'erreur, recharger les données pour restaurer l'état correct
    await loadData()
    handleError(err)
  }
}

const deleteTask = async (taskId: string) => {
  try {
    await apiDeleteTask(Number(taskId))
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
    await widgetApiService.saveWidgetConfig(props.widget.id, config)
    hideConfiguration()
  } catch (err) {
    handleError(err)
  }
}

onMounted(async () => {
  if (props.widget.isEnabled) {
    await resolveContextFromProject()
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

.feedback-banner {
  @apply mb-2 p-3 bg-green-50 text-green-700 rounded-md border border-green-200 flex items-center;
}
</style>

<template>
  <div class="tasks-widget">
    <!-- Panneau de test de progression (temporaire) -->
    <ProgressTestPanel v-if="isDevelopment" />
    
    <!-- En-tête du widget -->
    <div class="widget-header">
      <div class="header-left">
        <h3 class="widget-title">{{ t('tasks.title') }}</h3>
        <span class="task-count">{{ filteredTasks.length }} {{ t('tasks.count') }}</span>
      </div>
      
      <div class="header-actions">
        <div class="filter-tabs">
          <button 
            v-for="filter in filters" 
            :key="filter.value"
            @click="activeFilter = filter.value"
            :class="['filter-tab', { active: activeFilter === filter.value }]"
          >
            {{ filter.label }}
            <span class="count">{{ getFilterCount(filter.value) }}</span>
          </button>
        </div>
        
        <button @click="showCreateModal = true" class="add-task-btn">
          <PlusIcon class="icon" />
          {{ t('tasks.add') }}
        </button>
      </div>
    </div>

    <!-- ... rest of existing template ... -->
  </div>
</template>