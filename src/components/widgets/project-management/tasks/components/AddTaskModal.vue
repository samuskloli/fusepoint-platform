<template>
  <div class="modal-overlay" @click.self="$emit('close')">
    <div class="modal-content">
      <div class="modal-header">
        <h3 class="modal-title">{{ t('widgets.tasks.addTask') }}</h3>
        <button @click="$emit('close')" class="modal-close" aria-label="{{ t('common.close') }}">
          <i class="fas fa-times"></i>
        </button>
      </div>

      <!-- Message d'erreur serveur -->
      <div v-if="serverError" class="server-error" role="alert">
        <i class="fas fa-exclamation-triangle mr-2"></i>
        {{ serverError }}
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
            autofocus
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
        
        <!-- Priorité et Assignation -->
        <div class="form-row">
          <div class="form-group">
            <label class="form-label">{{ t('widgets.tasks.priority') }} *</label>
            <select v-model="form.priority" class="form-select" required>
              <option value="low">{{ t('widgets.tasks.priority.low') }}</option>
              <option value="medium">{{ t('widgets.tasks.priority.medium') }}</option>
              <option value="high">{{ t('widgets.tasks.priority.high') }}</option>
            </select>
          </div>
          
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
        </div>
        
        <!-- Date d'échéance et Temps estimé -->
        <div class="form-row">
          <div class="form-group">
            <label class="form-label">{{ t('widgets.tasks.dueDate') }}</label>
            <input
              v-model="form.dueDate"
              type="date"
              class="form-input"
              :min="today"
            >
          </div>
          
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
        

        
        <!-- Actions -->
        <div class="modal-actions">
          <button type="button" @click="$emit('close')" class="btn-secondary">
            {{ t('common.cancel') }}
          </button>
          <button type="submit" class="btn-primary" :disabled="!isFormValid || loading" :aria-busy="loading ? 'true' : 'false'">
            <i v-if="loading" class="fas fa-spinner fa-spin mr-2" aria-hidden="true"></i>
            {{ t('widgets.tasks.createTask') }}
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useTranslation } from '@/composables/useTranslation'
import type { CreateTaskData, TaskPriority } from '../types'

interface TeamMember {
  id: string
  name: string
}

interface Emits {
  close: []
  save: [taskData: CreateTaskData]
}

interface Props {
  serverError?: string
}

const emit = defineEmits<Emits>()
const props = defineProps<Props>()
const { t } = useTranslation()

// États du formulaire
const form = ref<CreateTaskData>({
  title: '',
  description: '',
  priority: 'medium' as TaskPriority,
  assignedTo: '',
  dueDate: '',
  estimatedHours: undefined,
  actualHours: undefined
})

const loading = ref(false)
const errors = ref<Record<string, string>>({})
const teamMembers = ref<TeamMember[]>([])

// Date d'aujourd'hui pour la validation
const today = computed(() => {
  return new Date().toISOString().split('T')[0]
})

// Validation du formulaire
const isFormValid = computed(() => {
  return form.value.title.trim().length > 0 && 
         form.value.title.trim().length <= 255
})

// Validation des champs
const validateForm = () => {
  errors.value = {}
  
  if (!form.value.title.trim()) {
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
    // Nettoyage des données
    const taskData: CreateTaskData = {
      title: form.value.title.trim(),
      description: form.value.description?.trim() || undefined,
      priority: form.value.priority,
      assignedTo: form.value.assignedTo || undefined,
      dueDate: form.value.dueDate || undefined,
      estimatedHours: form.value.estimatedHours || undefined,
      actualHours: form.value.actualHours || undefined
    }
    
    emit('save', taskData)
  } catch (error) {
    console.error('Error creating task:', error)
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
.modal-overlay {
  @apply fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4;
}

.modal-content {
  @apply bg-white shadow-xl w-full max-h-[100vh] overflow-hidden rounded-none sm:max-w-2xl sm:rounded-lg sm:max-h-[90vh];
}

.modal-header {
  @apply flex items-center justify-between p-4 sm:p-6 border-b border-gray-200 sticky top-0 bg-white z-10;
}

.modal-title {
  @apply text-xl font-semibold text-gray-900 m-0;
}

.modal-close {
  @apply p-2 text-gray-400 hover:text-gray-600 rounded-md hover:bg-gray-100 transition-colors;
}

.modal-body {
  @apply p-4 sm:p-6 overflow-y-auto max-h-[calc(100vh-160px)] sm:max-h-[calc(90vh-140px)] space-y-4;
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

.form-help {
  @apply text-sm text-gray-500;
}



.modal-actions {
  @apply flex justify-end gap-3 pt-4 border-t border-gray-200 sticky bottom-0 bg-white p-4 sm:p-6;
}

.btn-secondary {
  @apply px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md transition-colors;
}

.btn-primary {
  @apply px-4 py-2 bg-blue-600 text-white hover:bg-blue-700 rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center;
}

.server-error {
  @apply mx-4 sm:mx-6 mt-2 mb-0 p-3 bg-red-50 text-red-700 rounded-md border border-red-200 flex items-center;
}
</style>