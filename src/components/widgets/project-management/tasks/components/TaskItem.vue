<template>
  <div class="task-item" :class="taskClasses">
    <div class="task-main">
      <!-- Checkbox pour marquer comme terminé -->
      <button 
        @click="$emit('toggle-status', task.id)"
        class="task-checkbox"
        :class="{ 'checked': task.status === 'completed' }"
      >
        <i v-if="task.status === 'completed'" class="fas fa-check"></i>
      </button>
      
      <!-- Contenu de la tâche -->
      <div class="task-content">
        <div class="task-header">
          <h4 class="task-title" :class="{ 'completed': task.status === 'completed' }">
            {{ task.title }}
          </h4>
          
          <div class="task-meta">
            <!-- Priorité -->
            <span class="priority-badge" :class="`priority-${task.priority}`">
              {{ t(`widgets.tasks.priority.${task.priority}`) }}
            </span>
            
            <!-- Statut -->
            <span class="status-badge" :class="`status-${task.status}`">
              {{ t(`widgets.tasks.status.${task.status}`) }}
            </span>
          </div>
        </div>
        
        <!-- Description -->
        <p v-if="task.description" class="task-description">
          {{ task.description }}
        </p>
        
        <!-- Informations supplémentaires -->
        <div class="task-info">
          <div class="task-details">
            <!-- Assigné à -->
            <div v-if="task.assignedToName" class="task-assignee">
              <i class="fas fa-user"></i>
              <span>{{ task.assignedToName }}</span>
            </div>
            
            <!-- Date d'échéance -->
            <div v-if="task.dueDate" class="task-due-date" :class="{ 'overdue': isOverdue }">
              <i class="fas fa-calendar"></i>
              <span>{{ formatDate(task.dueDate) }}</span>
            </div>
            
            <!-- Temps estimé/réel -->
            <div v-if="task.estimatedHours" class="task-hours">
              <i class="fas fa-clock"></i>
              <span>
                {{ task.actualHours || 0 }}h / {{ task.estimatedHours }}h
              </span>
            </div>
          </div>
          

        </div>
      </div>
      
      <!-- Actions -->
      <div class="task-actions">
        <button 
          @click="showEditModal = true"
          class="action-btn"
          :title="t('common.edit')"
        >
          <i class="fas fa-edit"></i>
        </button>
        
        <button 
          @click="confirmDelete"
          class="action-btn action-danger"
          :title="t('common.delete')"
        >
          <i class="fas fa-trash"></i>
        </button>
      </div>
    </div>
    

    
    <!-- Modal d'édition -->
    <EditTaskModal
      v-if="showEditModal"
      :task="task"
      @close="showEditModal = false"
      @save="handleUpdate"
    />
    
    <!-- Modal de confirmation de suppression -->
    <ConfirmDeleteModal
      v-if="showDeleteModal"
      :title="t('widgets.tasks.deleteTask')"
      :message="t('widgets.tasks.deleteTaskConfirm', { title: task.title })"
      @close="showDeleteModal = false"
      @confirm="handleDelete"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, nextTick, shallowRef } from 'vue'
import { useTranslation } from '@/composables/useTranslation'
import EditTaskModal from './EditTaskModal.vue'
import ConfirmDeleteModal from '@/components/common/ConfirmDeleteModal.vue'
import type { Task, UpdateTaskData } from '../types'
import { 
  validateTaskProgress, 
  calculateProgressPercentage, 
  hasValidProgressData,
  ProgressLogger 
} from '@/utils/progressValidation'
import { useProgressMonitoring } from '@/utils/progressMonitoring'
import { useProgressBackup } from '@/utils/progressBackup'

interface Props {
  task: Task
}

interface Emits {
  update: [taskId: string, updates: UpdateTaskData]
  delete: [taskId: string]
  'toggle-status': [taskId: string]
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()
const { t } = useTranslation()

// Instance du logger pour le débogage
const progressLogger = ProgressLogger.getInstance()

// Services de monitoring et sauvegarde
const { measurePerformance, recordMetric } = useProgressMonitoring()
const { autoSave, recoverTask } = useProgressBackup()

// États locaux avec optimisation
const showEditModal = ref(false)
const showDeleteModal = ref(false)

// Cache pour les calculs coûteux
const progressCache = shallowRef<{
  taskId: string
  estimatedHours: number | undefined
  actualHours: number | undefined
  percentage: number
  timestamp: number
}>()

// Fonction de debounce pour limiter les recalculs
const debounce = <T extends (...args: any[]) => any>(
  func: T,
  wait: number
): ((...args: Parameters<T>) => void) => {
  let timeout: NodeJS.Timeout
  return (...args: Parameters<T>) => {
    clearTimeout(timeout)
    timeout = setTimeout(() => func(...args), wait)
  }
}

// Classes CSS calculées avec mémorisation
const taskClasses = computed(() => ({
  'task-completed': props.task.status === 'completed',
  'task-overdue': isOverdue.value,
  'task-high-priority': props.task.priority === 'high'
}))

// Vérification si la tâche est en retard (mémorisée)
const isOverdue = computed(() => {
  if (!props.task.dueDate) return false
  return new Date(props.task.dueDate) < new Date() && props.task.status !== 'completed'
})

// Calcul du pourcentage de progression avec cache et optimisation
const progressPercentage = computed(() => {
  const currentTask = props.task
  const now = performance.now()
  
  // Vérifier le cache (valide pendant 100ms)
  if (
    progressCache.value &&
    progressCache.value.taskId === currentTask.id &&
    progressCache.value.estimatedHours === currentTask.estimatedHours &&
    progressCache.value.actualHours === currentTask.actualHours &&
    (now - progressCache.value.timestamp) < 100
  ) {
    progressLogger.log(`Using cached progress for task ${currentTask.id}`, {
      percentage: progressCache.value.percentage,
      cacheAge: `${(now - progressCache.value.timestamp).toFixed(2)}ms`
    })
    return progressCache.value.percentage
  }
  
  const startTime = performance.now()
  
  // Validation complète de la tâche (uniquement si pas en cache)
  const validation = validateTaskProgress({
    id: currentTask.id,
    estimatedHours: currentTask.estimatedHours,
    actualHours: currentTask.actualHours,
    status: currentTask.status
  })
  
  // Log des erreurs et warnings (avec throttling)
  if (validation.errors.length > 0) {
    debouncedErrorLog(currentTask.id, validation.errors)
  }
  
  if (validation.warnings.length > 0) {
    debouncedWarningLog(currentTask.id, validation.warnings)
  }
  
  // Calcul sécurisé du pourcentage
  const percentage = calculateProgressPercentage(
    currentTask.estimatedHours, 
    currentTask.actualHours
  )
  
  const calculationTime = performance.now() - startTime
  
  // Mettre à jour le cache
  progressCache.value = {
    taskId: currentTask.id,
    estimatedHours: currentTask.estimatedHours,
    actualHours: currentTask.actualHours,
    percentage,
    timestamp: now
  }
  
  progressLogger.log(`Progress calculated for task ${currentTask.id}`, {
    estimated: currentTask.estimatedHours,
    actual: currentTask.actualHours,
    percentage,
    calculationTime: `${calculationTime.toFixed(2)}ms`,
    isValid: validation.isValid,
    cached: false
  })
  
  return percentage
})

// Variable pour tracker la dernière valeur de hasProgressData
let lastProgressDataValue: boolean | undefined = undefined

// Afficher la progression si les heures sont connues (optimisée)
const hasProgressData = computed(() => {
  const hasData = hasValidProgressData(
    props.task.estimatedHours, 
    props.task.actualHours
  )
  
  // Log uniquement si la valeur change
  if (lastProgressDataValue !== hasData) {
    progressLogger.log(`Progress data check for task ${props.task.id}`, {
      estimated: props.task.estimatedHours,
      actual: props.task.actualHours,
      hasData
    })
    lastProgressDataValue = hasData
  }
  
  return hasData
})

// Fonctions de logging avec debounce pour éviter le spam
const debouncedErrorLog = debounce((taskId: string, errors: string[]) => {
  progressLogger.log(`Validation errors for task ${taskId}`, errors)
}, 500)

const debouncedWarningLog = debounce((taskId: string, warnings: string[]) => {
  progressLogger.log(`Validation warnings for task ${taskId}`, warnings)
}, 500)

const debouncedProgressUpdate = debounce((taskId: string) => {
  progressLogger.log(`Progress update completed for task ${taskId}`)
}, 100)

// Watchers optimisés pour détecter les changements de progression
watch(
  () => props.task.estimatedHours,
  (newEstimated, oldEstimated) => {
    if (newEstimated !== oldEstimated) {
      // Invalider le cache
      if (progressCache.value?.taskId === props.task.id) {
        progressCache.value = undefined
      }
      
      progressLogger.log(`Estimated hours changed for task ${props.task.id}`, {
        from: oldEstimated,
        to: newEstimated
      })
    }
  }
)

watch(
  () => props.task.actualHours,
  (newActual, oldActual) => {
    if (newActual !== oldActual) {
      // Invalider le cache
      if (progressCache.value?.taskId === props.task.id) {
        progressCache.value = undefined
      }
      
      progressLogger.log(`Actual hours changed for task ${props.task.id}`, {
        from: oldActual,
        to: newActual
      })
      
      // Force la mise à jour du DOM au prochain tick (avec debounce)
      nextTick(() => {
        debouncedProgressUpdate(props.task.id)
      })
    }
  }
)

// Watcher pour détecter les changements de tâche complète (optimisé)
watch(
  () => props.task,
  (newTask, oldTask) => {
    if (oldTask && newTask.id === oldTask.id) {
      const hasProgressChanges = 
        newTask.estimatedHours !== oldTask.estimatedHours ||
        newTask.actualHours !== oldTask.actualHours
      
      if (hasProgressChanges) {
        progressLogger.log(`Task updated: ${newTask.id}`, {
          estimatedHours: newTask.estimatedHours,
          actualHours: newTask.actualHours,
          updatedAt: newTask.updatedAt
        })
      }
    }
  },
  { deep: false } // Optimisation: pas de deep watch
)

// Formatage de la date
const formatDate = (dateString: string) => {
  const date = new Date(dateString)
  return date.toLocaleDateString('fr-FR', {
    day: 'numeric',
    month: 'short',
    year: date.getFullYear() !== new Date().getFullYear() ? 'numeric' : undefined
  })
}

// Gestion des événements
const handleUpdate = async (updates: UpdateTaskData) => {
  try {
    // Mesurer la performance de la mise à jour
    await measurePerformance('ui_update', async () => {
      // Sauvegarde automatique avant la mise à jour
      autoSave(props.task.id, { ...props.task, ...updates }, 'high')
      
      // Émettre l'événement de mise à jour
      emit('update', props.task.id, updates)
      
      // Enregistrer la métrique de succès
      recordMetric('ui_update', 0, true, undefined, {
        taskId: props.task.id,
        updatedFields: Object.keys(updates)
      })
    }, {
      taskId: props.task.id,
      updateType: 'task_edit'
    })
    
    showEditModal.value = false
  } catch (error) {
    // Enregistrer l'erreur
    recordMetric('ui_update', 0, false, error instanceof Error ? error.message : 'Unknown error', {
      taskId: props.task.id,
      updateType: 'task_edit'
    })
    
    // Récupérer les données de sauvegarde en cas d'erreur
    const backupData = recoverTask(props.task.id)
    if (backupData) {
      progressLogger.log(`Données récupérées depuis la sauvegarde pour la tâche ${props.task.id}`)
    }
    
    throw error
  }
}

const confirmDelete = () => {
  showDeleteModal.value = true
}

const handleDelete = () => {
  emit('delete', props.task.id)
  showDeleteModal.value = false
}
</script>

<style scoped>
.task-item {
  @apply bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-all duration-200;
}

.task-item.task-completed {
  @apply bg-gray-50 opacity-75;
}

.task-item.task-overdue {
  @apply border-red-300 bg-red-50;
}

.task-item.task-high-priority {
  @apply border-l-4 border-l-red-500;
}

.task-main {
  @apply flex items-start gap-3;
}

.task-checkbox {
  @apply w-5 h-5 border-2 border-gray-300 rounded flex items-center justify-center mt-1 hover:border-blue-500 transition-colors;
}

.task-checkbox.checked {
  @apply bg-green-500 border-green-500 text-white;
}

.task-content {
  @apply flex-1 min-w-0;
}

.task-header {
  @apply flex items-start justify-between gap-2 mb-2;
}

.task-title {
  @apply text-lg font-medium text-gray-900 m-0;
}

.task-title.completed {
  @apply line-through text-gray-500;
}

.task-meta {
  @apply flex gap-2 flex-shrink-0;
}

.priority-badge {
  @apply px-2 py-1 text-xs font-medium rounded-full;
}

.priority-high {
  @apply bg-red-100 text-red-800;
}

.priority-medium {
  @apply bg-yellow-100 text-yellow-800;
}

.priority-low {
  @apply bg-green-100 text-green-800;
}

.status-badge {
  @apply px-2 py-1 text-xs font-medium rounded-full;
}

.status-pending {
  @apply bg-gray-100 text-gray-800;
}

.status-in_progress {
  @apply bg-blue-100 text-blue-800;
}

.status-completed {
  @apply bg-green-100 text-green-800;
}

/* Statut annulé */
.status-cancelled {
  @apply bg-gray-200 text-gray-700;
}

.task-description {
  @apply text-gray-600 text-sm mb-3 line-clamp-2;
}

.task-info {
  @apply space-y-2;
}

.task-details {
  @apply flex flex-wrap gap-4 text-sm text-gray-500;
}

.task-assignee,
.task-due-date,
.task-hours {
  @apply flex items-center gap-1;
}

.task-due-date.overdue {
  @apply text-red-600;
}



.task-actions {
  @apply flex gap-1 flex-shrink-0;
}

.action-btn {
  @apply p-2 text-gray-400 hover:text-gray-600 rounded-md hover:bg-gray-100 transition-colors;
}

.action-danger {
  @apply hover:text-red-600 hover:bg-red-50;
}


</style>