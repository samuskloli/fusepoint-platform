<template>
  <div class="modal-overlay" @click="closeModal">
    <div class="modal-container" @click.stop>
      <div class="modal-header">
        <div class="header-content">
          <h3 class="modal-title">{{ goal?.title }}</h3>
          <div class="goal-meta">
            <span 
              class="priority-badge"
              :class="getPriorityClass(goal?.priority)"
            >
              {{ getPriorityLabel(goal?.priority) }}
            </span>
            <span 
              class="status-badge"
              :class="getStatusClass(goal?.status)"
            >
              {{ getStatusLabel(goal?.status) }}
            </span>
          </div>
        </div>
        <div class="header-actions">
          <button @click="editGoal" class="action-btn" :title="t('widgets.goals.edit')">
            <i class="fas fa-edit"></i>
          </button>
          <button @click="closeModal" class="modal-close-btn">
            <i class="fas fa-times"></i>
          </button>
        </div>
      </div>
      
      <div class="modal-body">
        <!-- Description -->
        <div v-if="goal?.description" class="section">
          <h4 class="section-title">{{ t('widgets.goals.description') }}</h4>
          <p class="description-text">{{ goal.description }}</p>
        </div>
        
        <!-- Progression -->
        <div class="section">
          <h4 class="section-title">{{ t('widgets.goals.progress') }}</h4>
          <div class="progress-section">
            <div class="progress-bar-container">
              <div 
                class="progress-bar"
                :style="{ width: goal?.progress + '%' }"
                :class="getProgressClass(goal?.progress)"
              ></div>
            </div>
            <span class="progress-text">{{ goal?.progress }}%</span>
          </div>
        </div>
        
        <!-- Informations -->
        <div class="section">
          <h4 class="section-title">{{ t('widgets.goals.information') }}</h4>
          <div class="info-grid">
            <div class="info-item">
              <span class="info-label">{{ t('widgets.goals.deadline') }}</span>
              <span class="info-value" :class="{ 'text-red-600': isOverdue(goal) }">
                {{ goal?.deadline ? formatDeadline(goal.deadline) : '—' }}
              </span>
            </div>
            
            <div class="info-item">
              <span class="info-label">{{ t('widgets.goals.assignee') }}</span>
              <div v-if="goal?.assignee" class="assignee-info">
                <img 
                  v-if="goal.assignee.avatar"
                  :src="goal.assignee.avatar"
                  :alt="goal.assignee.name"
                  class="assignee-avatar"
                >
                <div v-else class="assignee-avatar-placeholder">
                  {{ goal.assignee.name.charAt(0).toUpperCase() }}
                </div>
                <span class="assignee-name">{{ goal.assignee.name }}</span>
              </div>
              <span v-else class="info-value">—</span>
            </div>
            
            <div class="info-item">
              <span class="info-label">{{ t('widgets.goals.createdAt') }}</span>
              <span class="info-value">{{ formatDate(goal?.created_at) }}</span>
            </div>
            
            <div class="info-item">
              <span class="info-label">{{ t('widgets.goals.updatedAt') }}</span>
              <span class="info-value">{{ formatDate(goal?.updated_at) }}</span>
            </div>
          </div>
        </div>
        
        <!-- Tags -->
        <div v-if="goal?.tags && goal.tags.length > 0" class="section">
          <h4 class="section-title">{{ t('widgets.goals.tags') }}</h4>
          <div class="tags-container">
            <span 
              v-for="tag in goal.tags"
              :key="tag"
              class="tag"
            >
              {{ tag }}
            </span>
          </div>
        </div>
        
        <!-- Actions -->
        <div class="section">
          <h4 class="section-title">{{ t('widgets.goals.actions') }}</h4>
          <div class="actions-grid">
            <button @click="editGoal" class="action-button edit">
              <i class="fas fa-edit"></i>
              {{ t('widgets.goals.edit') }}
            </button>
            
            <button @click="duplicateGoal" class="action-button duplicate">
              <i class="fas fa-copy"></i>
              {{ t('widgets.goals.duplicate') }}
            </button>
            
            <button @click="toggleStatus" class="action-button status">
              <i :class="getToggleStatusIcon()"></i>
              {{ getToggleStatusLabel() }}
            </button>
            
            <button @click="deleteGoal" class="action-button delete">
              <i class="fas fa-trash"></i>
              {{ t('widgets.goals.delete') }}
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { Goal, GoalStatus, GoalPriority } from '../goals/types'

// Composables simulés
const { t } = {
  t: (key: string): string => {
    const translations: Record<string, string> = {
      'widgets.goals.edit': 'Modifier',
      'widgets.goals.description': 'Description',
      'widgets.goals.progress': 'Progression',
      'widgets.goals.information': 'Informations',
      'widgets.goals.deadline': 'Échéance',
      'widgets.goals.assignee': 'Assigné à',
      'widgets.goals.createdAt': 'Créé le',
      'widgets.goals.updatedAt': 'Modifié le',
      'widgets.goals.tags': 'Tags',
      'widgets.goals.actions': 'Actions',
      'widgets.goals.duplicate': 'Dupliquer',
      'widgets.goals.delete': 'Supprimer',
      'widgets.goals.markComplete': 'Marquer comme terminé',
      'widgets.goals.markActive': 'Marquer comme actif',
      'widgets.goals.priorityHigh': 'Élevée',
      'widgets.goals.priorityMedium': 'Moyenne',
      'widgets.goals.priorityLow': 'Faible',
      'widgets.goals.statusActive': 'Actif',
      'widgets.goals.statusCompleted': 'Terminé',
      'widgets.goals.statusPaused': 'En pause',
      'widgets.goals.statusCancelled': 'Annulé'
    }
    return translations[key] || key
  }
}

// Props
interface Props {
  goal: Goal | null
}

const props = defineProps<Props>()

// Emits
const emit = defineEmits<{
  close: []
  edit: [goal: Goal]
  delete: [goal: Goal]
}>()

// Méthodes utilitaires
const getPriorityClass = (priority?: GoalPriority): string => {
  switch (priority) {
    case 'high': return 'priority-high'
    case 'medium': return 'priority-medium'
    case 'low': return 'priority-low'
    default: return 'priority-medium'
  }
}

const getPriorityLabel = (priority?: GoalPriority): string => {
  switch (priority) {
    case 'high': return t('widgets.goals.priorityHigh')
    case 'medium': return t('widgets.goals.priorityMedium')
    case 'low': return t('widgets.goals.priorityLow')
    default: return t('widgets.goals.priorityMedium')
  }
}

const getStatusClass = (status?: GoalStatus): string => {
  switch (status) {
    case 'active': return 'status-active'
    case 'completed': return 'status-completed'
    case 'paused': return 'status-paused'
    case 'cancelled': return 'status-cancelled'
    default: return 'status-active'
  }
}

const getStatusLabel = (status?: GoalStatus): string => {
  switch (status) {
    case 'active': return t('widgets.goals.statusActive')
    case 'completed': return t('widgets.goals.statusCompleted')
    case 'paused': return t('widgets.goals.statusPaused')
    case 'cancelled': return t('widgets.goals.statusCancelled')
    default: return t('widgets.goals.statusActive')
  }
}

const getProgressClass = (progress?: number): string => {
  if (!progress) return 'progress-low'
  if (progress < 30) return 'progress-low'
  if (progress < 70) return 'progress-medium'
  return 'progress-high'
}

const isOverdue = (goal?: Goal | null): boolean => {
  if (!goal?.deadline) return false
  return new Date(goal.deadline) < new Date()
}

const formatDeadline = (deadline: string): string => {
  return new Date(deadline).toLocaleDateString('fr-FR')
}

const formatDate = (date?: string): string => {
  if (!date) return '—'
  return new Date(date).toLocaleDateString('fr-FR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })
}

const getToggleStatusIcon = (): string => {
  return props.goal?.status === 'completed' ? 'fas fa-undo' : 'fas fa-check'
}

const getToggleStatusLabel = (): string => {
  return props.goal?.status === 'completed' 
    ? t('widgets.goals.markActive')
    : t('widgets.goals.markComplete')
}

// Actions
const closeModal = (): void => {
  emit('close')
}

const editGoal = (): void => {
  if (props.goal) {
    emit('edit', props.goal)
  }
}

const deleteGoal = (): void => {
  if (props.goal) {
    emit('delete', props.goal)
  }
}

const duplicateGoal = (): void => {
  // Logique de duplication à implémenter
  console.log('Duplicate goal:', props.goal)
}

const toggleStatus = (): void => {
  // Logique de changement de statut à implémenter
  console.log('Toggle status for goal:', props.goal)
}
</script>

<style scoped>
.modal-overlay {
  @apply fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50;
}

.modal-container {
  @apply bg-white rounded-lg shadow-xl max-w-3xl w-full mx-4 max-h-[90vh] overflow-hidden;
}

.modal-header {
  @apply flex items-start justify-between p-6 border-b border-gray-200;
}

.header-content {
  @apply flex-1;
}

.modal-title {
  @apply text-xl font-semibold text-gray-900 mb-2;
}

.goal-meta {
  @apply flex items-center space-x-2;
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

.status-active {
  @apply bg-blue-100 text-blue-800;
}

.status-completed {
  @apply bg-green-100 text-green-800;
}

.status-paused {
  @apply bg-yellow-100 text-yellow-800;
}

.status-cancelled {
  @apply bg-red-100 text-red-800;
}

.header-actions {
  @apply flex items-center space-x-2;
}

.action-btn {
  @apply p-2 text-gray-400 hover:text-gray-600 transition-colors;
}

.modal-close-btn {
  @apply p-2 text-gray-400 hover:text-gray-600 transition-colors;
}

.modal-body {
  @apply p-6 overflow-y-auto;
}

.section {
  @apply mb-6;
}

.section-title {
  @apply text-lg font-medium text-gray-900 mb-3;
}

.description-text {
  @apply text-gray-700 leading-relaxed;
}

.progress-section {
  @apply flex items-center space-x-3;
}

.progress-bar-container {
  @apply flex-1 bg-gray-200 rounded-full h-3;
}

.progress-bar {
  @apply h-full rounded-full transition-all duration-300;
}

.progress-low {
  @apply bg-red-500;
}

.progress-medium {
  @apply bg-yellow-500;
}

.progress-high {
  @apply bg-green-500;
}

.progress-text {
  @apply text-sm font-medium text-gray-700;
}

.info-grid {
  @apply grid grid-cols-1 md:grid-cols-2 gap-4;
}

.info-item {
  @apply flex flex-col space-y-1;
}

.info-label {
  @apply text-sm font-medium text-gray-500;
}

.info-value {
  @apply text-sm text-gray-900;
}

.assignee-info {
  @apply flex items-center space-x-2;
}

.assignee-avatar {
  @apply w-6 h-6 rounded-full object-cover;
}

.assignee-avatar-placeholder {
  @apply w-6 h-6 rounded-full bg-gray-300 flex items-center justify-center text-xs font-medium text-gray-700;
}

.assignee-name {
  @apply text-sm text-gray-900;
}

.tags-container {
  @apply flex flex-wrap gap-2;
}

.tag {
  @apply px-3 py-1 bg-blue-100 text-blue-800 text-sm rounded-full;
}

.actions-grid {
  @apply grid grid-cols-2 md:grid-cols-4 gap-3;
}

.action-button {
  @apply flex items-center justify-center space-x-2 px-4 py-2 rounded-md font-medium transition-colors;
}

.action-button.edit {
  @apply bg-blue-100 text-blue-700 hover:bg-blue-200;
}

.action-button.duplicate {
  @apply bg-gray-100 text-gray-700 hover:bg-gray-200;
}

.action-button.status {
  @apply bg-green-100 text-green-700 hover:bg-green-200;
}

.action-button.delete {
  @apply bg-red-100 text-red-700 hover:bg-red-200;
}
</style>