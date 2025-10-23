<template>
  <div class="modal-overlay" @click.self="$emit('close')">
    <div class="modal-content">
      <div class="modal-header">
        <h3 class="modal-title">{{ t('widgets.tasks.editTask') }}</h3>
        <button @click="$emit('close')" class="modal-close">
          <i class="fas fa-times"></i>
        </button>
      </div>
      
      <form @submit.prevent="handleSubmit" class="modal-body">
        <!-- Titre -->
        <div class="form-group">
          <label class="form-label">{{ t('widgets.tasks.title') }} *</label>
          <input
            v-model="form.title"
            type="text"
            class="form-input"
            :placeholder="t('widgets.tasks.titlePlaceholder')"
            required
            maxlength="255"
          >
          <div v-if="errors.title" class="form-error">{{ errors.title }}</div>
        </div>
        
        <!-- Description -->
        <div class="form-group">
          <label class="form-label">{{ t('widgets.tasks.description') }}</label>
          <textarea
            v-model="form.description"
            class="form-textarea"
            :placeholder="t('widgets.tasks.descriptionPlaceholder')"
            rows="3"
            maxlength="1000"
          ></textarea>
        </div>
        
        <!-- Statut et Priorité -->
        <div class="form-row">
          <div class="form-group">
            <label class="form-label">{{ t('widgets.tasks.status') }} *</label>
            <select v-model="form.status" class="form-select" required>
              <option value="pending">{{ t('widgets.tasks.status.pending') }}</option>
              <option value="in_progress">{{ t('widgets.tasks.status.in_progress') }}</option>
              <option value="completed">{{ t('widgets.tasks.status.completed') }}</option>
            </select>
          </div>
          
          <div class="form-group">
            <label class="form-label">{{ t('widgets.tasks.priority') }} *</label>
            <select v-model="form.priority" class="form-select" required>
              <option value="low">{{ t('widgets.tasks.priority.low') }}</option>
              <option value="medium">{{ t('widgets.tasks.priority.medium') }}</option>
              <option value="high">{{ t('widgets.tasks.priority.high') }}</option>
            </select>
          </div>
        </div>
        
        <!-- Assignation -->
        <div class="form-group">
          <label class="form-label">{{ t('widgets.tasks.assignTo') }}</label>
          <select v-model="form.assignedTo" class="form-select">
            <option value="">{{ t('widgets.tasks.unassigned') }}</option>
            <option 
              v-for="member in teamMembers" 
              :key="member.id" 
              :value="member.id"
            >
              {{ member.name }}
            </option>
          </select>
        </div>
        
        <!-- Date d'échéance -->
        <div class="form-group">
          <label class="form-label">{{ t('widgets.tasks.dueDate') }}</label>
          <input
            v-model="form.dueDate"
            type="date"
            class="form-input"
          >
        </div>
        
        <!-- Temps estimé et réel -->
        <div class="form-row">
          <div class="form-group">
            <label class="form-label">{{ t('widgets.tasks.estimatedHours') }}</label>
            <input
              v-model.number="form.estimatedHours"
              type="number"
              class="form-input"
              min="0"
              max="999"
              step="0.5"
              :placeholder="t('widgets.tasks.hoursPlaceholder')"
            >
          </div>
          
          <div class="form-group">
            <label class="form-label">{{ t('widgets.tasks.actualHours') }}</label>
            <input
              v-model.number="form.actualHours"
              type="number"
              class="form-input"
              min="0"
              max="999"
              step="0.5"
              :placeholder="t('widgets.tasks.hoursPlaceholder')"
            >
          </div>
        </div>
        
        <!-- Tags -->
        <div class="form-group">
          <label class="form-label">{{ t('widgets.tasks.tags') }}</label>
          <div class="tags-input">
            <div class="selected-tags">
              <span 
                v-for="(tag, index) in form.tags" 
                :key="index" 
                class="tag-item"
              >
                {{ tag }}
                <button 
                  type="button" 
                  @click="removeTag(index)"
                  class="tag-remove"
                >
                  <i class="fas fa-times"></i>
                </button>
              </span>
            </div>
            <input
              v-model="newTag"
              type="text"
              class="tag-input"
              :placeholder="t('widgets.tasks.addTag')"
              @keydown.enter.prevent="addTag"
              @keydown.comma.prevent="addTag"
            >
          </div>
        </div>
        
        <!-- Actions -->
        <div class="modal-actions">
          <button type="button" @click="$emit('close')" class="btn-secondary">
            {{ t('common.cancel') }}
          </button>
          <button type="submit" class="btn-primary" :disabled="!isFormValid || loading">
            <i v-if="loading" class="fas fa-spinner fa-spin mr-2"></i>
            {{ t('widgets.tasks.updateTask') }}
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useTranslation } from '@/composables/useTranslation'
import type { Task, UpdateTaskData, TaskStatus, TaskPriority } from '../types'

interface TeamMember {
  id: string
  name: string
}

interface Props {
  task: Task
}

interface Emits {
  close: []
  save: [updates: UpdateTaskData]
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()
const { t } = useTranslation()

// États du formulaire
const form = ref<UpdateTaskData>({
  title: props.task.title,
  description: props.task.description || '',
  status: props.task.status,
  priority: props.task.priority,
  assignedTo: props.task.assignedTo || '',
  dueDate: props.task.dueDate || '',
  tags: [...(props.task.tags || [])],
  estimatedHours: props.task.estimatedHours,
  actualHours: props.task.actualHours
})

const newTag = ref('')
const loading = ref(false)
const errors = ref<Record<string, string>>({})
const teamMembers = ref<TeamMember[]>([])

// Validation du formulaire
const isFormValid = computed(() => {
  return form.value.title && 
         form.value.title.trim().length > 0 && 
         form.value.title.trim().length <= 255
})

// Gestion des tags
const addTag = () => {
  const tag = newTag.value.trim()
  if (tag && !form.value.tags?.includes(tag)) {
    if (!form.value.tags) form.value.tags = []
    form.value.tags.push(tag)
    newTag.value = ''
  }
}

const removeTag = (index: number) => {
  if (form.value.tags) {
    form.value.tags.splice(index, 1)
  }
}

// Validation des champs
const validateForm = () => {
  errors.value = {}
  
  if (!form.value.title?.trim()) {
    errors.value.title = t('widgets.tasks.errors.titleRequired')
  } else if (form.value.title.trim().length > 255) {
    errors.value.title = t('widgets.tasks.errors.titleTooLong')
  }
  
  return Object.keys(errors.value).length === 0
}

// Soumission du formulaire
const handleSubmit = async () => {
  if (!validateForm()) return
  
  loading.value = true
  
  try {
    // Préparation des données modifiées
    const updates: UpdateTaskData = {}
    
    if (form.value.title?.trim() !== props.task.title) {
      updates.title = form.value.title.trim()
    }
    
    if (form.value.description?.trim() !== props.task.description) {
      updates.description = form.value.description?.trim() || undefined
    }
    
    if (form.value.status !== props.task.status) {
      updates.status = form.value.status
    }
    
    if (form.value.priority !== props.task.priority) {
      updates.priority = form.value.priority
    }
    
    if (form.value.assignedTo !== props.task.assignedTo) {
      updates.assignedTo = form.value.assignedTo || undefined
    }
    
    if (form.value.dueDate !== props.task.dueDate) {
      updates.dueDate = form.value.dueDate || undefined
    }
    
    if (JSON.stringify(form.value.tags) !== JSON.stringify(props.task.tags)) {
      updates.tags = form.value.tags?.filter(tag => tag.trim()) || undefined
    }
    
    if (form.value.estimatedHours !== props.task.estimatedHours) {
      updates.estimatedHours = form.value.estimatedHours || undefined
    }
    
    if (form.value.actualHours !== props.task.actualHours) {
      updates.actualHours = form.value.actualHours || undefined
    }
    
    emit('save', updates)
  } catch (error) {
    console.error('Error updating task:', error)
  } finally {
    loading.value = false
  }
}

// Chargement des membres de l'équipe
const loadTeamMembers = async () => {
  try {
    // TODO: Implémenter le chargement des membres de l'équipe
    teamMembers.value = [
      { id: '1', name: 'John Doe' },
      { id: '2', name: 'Jane Smith' },
      { id: '3', name: 'Bob Johnson' }
    ]
  } catch (error) {
    console.error('Error loading team members:', error)
  }
}

onMounted(() => {
  loadTeamMembers()
})
</script>

<style scoped>
/* Réutilisation des styles du AddTaskModal */
.modal-overlay {
  @apply fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4;
}

.modal-content {
  @apply bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-hidden;
}

.modal-header {
  @apply flex items-center justify-between p-6 border-b border-gray-200;
}

.modal-title {
  @apply text-xl font-semibold text-gray-900 m-0;
}

.modal-close {
  @apply p-2 text-gray-400 hover:text-gray-600 rounded-md hover:bg-gray-100 transition-colors;
}

.modal-body {
  @apply p-6 overflow-y-auto max-h-[calc(90vh-140px)] space-y-4;
}

.form-group {
  @apply space-y-2;
}

.form-row {
  @apply grid grid-cols-1 md:grid-cols-2 gap-4;
}

.form-label {
  @apply block text-sm font-medium text-gray-700;
}

.form-input,
.form-select,
.form-textarea {
  @apply w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent;
}

.form-textarea {
  @apply resize-vertical;
}

.form-error {
  @apply text-sm text-red-600;
}

.tags-input {
  @apply border border-gray-300 rounded-md p-2 min-h-[42px] focus-within:ring-2 focus-within:ring-blue-500 focus-within:border-transparent;
}

.selected-tags {
  @apply flex flex-wrap gap-1 mb-2;
}

.tag-item {
  @apply inline-flex items-center gap-1 px-2 py-1 bg-blue-100 text-blue-800 text-sm rounded-full;
}

.tag-remove {
  @apply text-blue-600 hover:text-blue-800 p-0.5 rounded-full hover:bg-blue-200 transition-colors;
}

.tag-input {
  @apply border-0 outline-0 flex-1 min-w-[120px] p-0;
}

.modal-actions {
  @apply flex justify-end gap-3 pt-4 border-t border-gray-200;
}

.btn-secondary {
  @apply px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md transition-colors;
}

.btn-primary {
  @apply px-4 py-2 bg-blue-600 text-white hover:bg-blue-700 rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center;
}
</style>