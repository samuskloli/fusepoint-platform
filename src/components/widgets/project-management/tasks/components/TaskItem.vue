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
          
          <!-- Tags -->
          <div v-if="task.tags && task.tags.length > 0" class="task-tags">
            <span 
              v-for="tag in task.tags" 
              :key="tag" 
              class="task-tag"
            >
              {{ tag }}
            </span>
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
    
    <!-- Barre de progression (si applicable) -->
    <div v-if="task.status === 'in_progress' && progressPercentage > 0" class="task-progress">
      <div class="progress-bar">
        <div 
          class="progress-fill" 
          :style="{ width: `${progressPercentage}%` }"
        ></div>
      </div>
      <span class="progress-text">{{ progressPercentage }}%</span>
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
import { ref, computed } from 'vue'
import { useTranslation } from '@/composables/useTranslation'
import EditTaskModal from './EditTaskModal.vue'
import ConfirmDeleteModal from '@/components/common/ConfirmDeleteModal.vue'
import type { Task, UpdateTaskData } from '../types'

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

// États locaux
const showEditModal = ref(false)
const showDeleteModal = ref(false)

// Classes CSS calculées
const taskClasses = computed(() => ({
  'task-completed': props.task.status === 'completed',
  'task-overdue': isOverdue.value,
  'task-high-priority': props.task.priority === 'high'
}))

// Vérification si la tâche est en retard
const isOverdue = computed(() => {
  if (!props.task.dueDate) return false
  return new Date(props.task.dueDate) < new Date() && props.task.status !== 'completed'
})

// Calcul du pourcentage de progression
const progressPercentage = computed(() => {
  if (!props.task.estimatedHours || !props.task.actualHours) return 0
  return Math.min(100, Math.round((props.task.actualHours / props.task.estimatedHours) * 100))
})

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
const handleUpdate = (updates: UpdateTaskData) => {
  emit('update', props.task.id, updates)
  showEditModal.value = false
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

.task-tags {
  @apply flex flex-wrap gap-1;
}

.task-tag {
  @apply px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full;
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

.task-progress {
  @apply mt-3 flex items-center gap-2;
}

.progress-bar {
  @apply flex-1 h-2 bg-gray-200 rounded-full overflow-hidden;
}

.progress-fill {
  @apply h-full bg-blue-500 transition-all duration-300;
}

.progress-text {
  @apply text-xs text-gray-500 font-medium;
}
</style>