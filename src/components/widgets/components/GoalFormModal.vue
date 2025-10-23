<template>
  <div class="modal-overlay" @click="closeModal">
    <div class="modal-container" @click.stop>
      <div class="modal-header">
        <h3 class="modal-title">
          {{ isEditing ? t('widgets.goals.editGoal') : t('widgets.goals.createGoal') }}
        </h3>
        <button @click="closeModal" class="modal-close-btn">
          <i class="fas fa-times"></i>
        </button>
      </div>
      
      <form @submit.prevent="handleSubmit" class="modal-body">
        <div class="form-group">
          <label for="goal-title" class="form-label">{{ t('widgets.goals.title') }} *</label>
          <input
            id="goal-title"
            v-model="formData.title"
            type="text"
            class="form-input"
            :placeholder="t('widgets.goals.titlePlaceholder')"
            required
          >
        </div>
        
        <div class="form-group">
          <label for="goal-description" class="form-label">{{ t('widgets.goals.description') }}</label>
          <textarea
            id="goal-description"
            v-model="formData.description"
            class="form-textarea"
            :placeholder="t('widgets.goals.descriptionPlaceholder')"
            rows="3"
          ></textarea>
        </div>
        
        <div class="form-row">
          <div class="form-group">
            <label for="goal-priority" class="form-label">{{ t('widgets.goals.priority') }}</label>
            <select id="goal-priority" v-model="formData.priority" class="form-select">
              <option value="low">{{ t('widgets.goals.priorityLow') }}</option>
              <option value="medium">{{ t('widgets.goals.priorityMedium') }}</option>
              <option value="high">{{ t('widgets.goals.priorityHigh') }}</option>
            </select>
          </div>
          
          <div class="form-group">
            <label for="goal-status" class="form-label">{{ t('widgets.goals.status') }}</label>
            <select id="goal-status" v-model="formData.status" class="form-select">
              <option value="active">{{ t('widgets.goals.statusActive') }}</option>
              <option value="paused">{{ t('widgets.goals.statusPaused') }}</option>
              <option value="completed">{{ t('widgets.goals.statusCompleted') }}</option>
              <option value="cancelled">{{ t('widgets.goals.statusCancelled') }}</option>
            </select>
          </div>
        </div>
        
        <div class="form-row">
          <div class="form-group">
            <label for="goal-progress" class="form-label">{{ t('widgets.goals.progress') }} ({{ formData.progress }}%)</label>
            <input
              id="goal-progress"
              v-model.number="formData.progress"
              type="range"
              min="0"
              max="100"
              step="5"
              class="form-range"
            >
          </div>
          
          <div class="form-group">
            <label for="goal-deadline" class="form-label">{{ t('widgets.goals.deadline') }}</label>
            <input
              id="goal-deadline"
              v-model="formData.deadline"
              type="date"
              class="form-input"
            >
          </div>
        </div>
        
        <div class="form-group">
          <label for="goal-assignee" class="form-label">{{ t('widgets.goals.assignee') }}</label>
          <input
            id="goal-assignee"
            v-model="formData.assigneeName"
            type="text"
            class="form-input"
            :placeholder="t('widgets.goals.assigneePlaceholder')"
          >
        </div>
        
        <div class="form-group">
          <label for="goal-tags" class="form-label">{{ t('widgets.goals.tags') }}</label>
          <input
            id="goal-tags"
            v-model="tagsInput"
            type="text"
            class="form-input"
            :placeholder="t('widgets.goals.tagsPlaceholder')"
            @keydown.enter.prevent="addTag"
          >
          <div v-if="formData.tags.length > 0" class="tags-container">
            <span
              v-for="(tag, index) in formData.tags"
              :key="index"
              class="tag"
            >
              {{ tag }}
              <button type="button" @click="removeTag(index)" class="tag-remove">
                <i class="fas fa-times"></i>
              </button>
            </span>
          </div>
        </div>
        
        <div class="modal-footer">
          <button type="button" @click="closeModal" class="btn btn-secondary">
            {{ t('common.cancel') }}
          </button>
          <button type="submit" class="btn btn-primary" :disabled="!isFormValid">
            {{ isEditing ? t('common.update') : t('common.create') }}
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import type { Goal, GoalStatus, GoalPriority } from '../GoalsWidget.vue'

// Composables simulés
const { t } = {
  t: (key: string): string => {
    const translations: Record<string, string> = {
      'widgets.goals.editGoal': 'Modifier l\'objectif',
      'widgets.goals.createGoal': 'Créer un objectif',
      'widgets.goals.title': 'Titre',
      'widgets.goals.titlePlaceholder': 'Entrez le titre de l\'objectif',
      'widgets.goals.description': 'Description',
      'widgets.goals.descriptionPlaceholder': 'Décrivez l\'objectif en détail',
      'widgets.goals.priority': 'Priorité',
      'widgets.goals.priorityLow': 'Faible',
      'widgets.goals.priorityMedium': 'Moyenne',
      'widgets.goals.priorityHigh': 'Élevée',
      'widgets.goals.status': 'Statut',
      'widgets.goals.statusActive': 'Actif',
      'widgets.goals.statusPaused': 'En pause',
      'widgets.goals.statusCompleted': 'Terminé',
      'widgets.goals.statusCancelled': 'Annulé',
      'widgets.goals.progress': 'Progression',
      'widgets.goals.deadline': 'Échéance',
      'widgets.goals.assignee': 'Assigné à',
      'widgets.goals.assigneePlaceholder': 'Nom de la personne assignée',
      'widgets.goals.tags': 'Tags',
      'widgets.goals.tagsPlaceholder': 'Ajoutez des tags (Entrée pour valider)',
      'common.cancel': 'Annuler',
      'common.update': 'Mettre à jour',
      'common.create': 'Créer'
    }
    return translations[key] || key
  }
}

// Props
interface Props {
  goal?: Goal | null
  projectId?: string
}

const props = withDefaults(defineProps<Props>(), {
  goal: null,
  projectId: undefined
})

// Emits
const emit = defineEmits<{
  close: []
  save: [goalData: Partial<Goal>]
}>()

// État du formulaire
const formData = ref({
  title: '',
  description: '',
  status: 'active' as GoalStatus,
  priority: 'medium' as GoalPriority,
  progress: 0,
  deadline: '',
  assigneeName: '',
  tags: [] as string[]
})

const tagsInput = ref('')

// Computed
const isEditing = computed(() => !!props.goal)

const isFormValid = computed(() => {
  return formData.value.title.trim().length > 0
})

// Méthodes
const closeModal = (): void => {
  emit('close')
}

const addTag = (): void => {
  const tag = tagsInput.value.trim()
  if (tag && !formData.value.tags.includes(tag)) {
    formData.value.tags.push(tag)
    tagsInput.value = ''
  }
}

const removeTag = (index: number): void => {
  formData.value.tags.splice(index, 1)
}

const handleSubmit = (): void => {
  if (!isFormValid.value) return
  
  const goalData: Partial<Goal> = {
    title: formData.value.title,
    description: formData.value.description || undefined,
    status: formData.value.status,
    priority: formData.value.priority,
    progress: formData.value.progress,
    deadline: formData.value.deadline || undefined,
    tags: formData.value.tags,
    assignee: formData.value.assigneeName ? {
      id: Date.now().toString(),
      name: formData.value.assigneeName
    } : undefined
  }
  
  if (isEditing.value && props.goal) {
    goalData.id = props.goal.id
  }
  
  emit('save', goalData)
}

// Initialisation
onMounted(() => {
  if (props.goal) {
    formData.value = {
      title: props.goal.title,
      description: props.goal.description || '',
      status: props.goal.status,
      priority: props.goal.priority,
      progress: props.goal.progress,
      deadline: props.goal.deadline || '',
      assigneeName: props.goal.assignee?.name || '',
      tags: [...props.goal.tags]
    }
  }
})
</script>

<style scoped>
.modal-overlay {
  @apply fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50;
}

.modal-container {
  @apply bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-hidden;
}

.modal-header {
  @apply flex items-center justify-between p-6 border-b border-gray-200;
}

.modal-title {
  @apply text-xl font-semibold text-gray-900;
}

.modal-close-btn {
  @apply p-2 text-gray-400 hover:text-gray-600 transition-colors;
}

.modal-body {
  @apply p-6 overflow-y-auto;
}

.form-group {
  @apply mb-4;
}

.form-row {
  @apply grid grid-cols-1 md:grid-cols-2 gap-4 mb-4;
}

.form-label {
  @apply block text-sm font-medium text-gray-700 mb-2;
}

.form-input {
  @apply w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent;
}

.form-textarea {
  @apply w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent;
  resize: vertical;
}

.form-select {
  @apply w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent;
}

.form-range {
  @apply w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer;
}

.form-range::-webkit-slider-thumb {
  @apply appearance-none w-4 h-4 bg-blue-500 rounded-full cursor-pointer;
}

.tags-container {
  @apply flex flex-wrap gap-2 mt-2;
}

.tag {
  @apply inline-flex items-center px-3 py-1 bg-blue-100 text-blue-800 text-sm rounded-full;
}

.tag-remove {
  @apply ml-2 text-blue-600 hover:text-blue-800;
}

.modal-footer {
  @apply flex justify-end space-x-3 pt-4 border-t border-gray-200;
}

.btn {
  @apply px-4 py-2 rounded-md font-medium transition-colors;
}

.btn-secondary {
  @apply bg-gray-200 text-gray-800 hover:bg-gray-300;
}

.btn-primary {
  @apply bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed;
}
</style>