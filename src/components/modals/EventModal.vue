<template>
  <div class="modal-overlay" @click="closeModal">
    <div class="modal-container" @click.stop>
      <div class="modal-header">
        <h3 class="modal-title">
          {{ isEditing ? t('widgets.calendar.editEvent') : t('widgets.calendar.createEvent') }}
        </h3>
        <button @click="closeModal" class="modal-close-btn">
          <i class="fas fa-times"></i>
        </button>
      </div>
      
      <div class="modal-body">
        <form @submit.prevent="handleSubmit" class="event-form">
          <!-- Titre de l'événement -->
          <div class="form-group">
            <label for="event-title" class="form-label">
              {{ t('widgets.calendar.eventTitle') }} *
            </label>
            <input
              id="event-title"
              v-model="formData.title"
              type="text"
              :placeholder="t('widgets.calendar.eventTitlePlaceholder')"
              class="form-input"
              required
              :disabled="loading"
            >
          </div>
          
          <!-- Description -->
          <div class="form-group">
            <label for="event-description" class="form-label">
              {{ t('widgets.calendar.eventDescription') }}
            </label>
            <textarea
              id="event-description"
              v-model="formData.description"
              :placeholder="t('widgets.calendar.eventDescriptionPlaceholder')"
              class="form-textarea"
              rows="3"
              :disabled="loading"
            ></textarea>
          </div>
          
          <!-- Type d'événement -->
          <div class="form-group">
            <label for="event-type" class="form-label">
              {{ t('widgets.calendar.eventType') }} *
            </label>
            <select
              id="event-type"
              v-model="formData.type"
              class="form-select"
              required
              :disabled="loading"
            >
              <option value="">{{ t('widgets.calendar.selectEventType') }}</option>
              <option value="meeting">{{ t('widgets.calendar.meeting') }}</option>
              <option value="deadline">{{ t('widgets.calendar.deadline') }}</option>
              <option value="reminder">{{ t('widgets.calendar.reminder') }}</option>
              <option value="task">{{ t('widgets.calendar.task') }}</option>
            </select>
          </div>
          
          <!-- Date et heure -->
          <div class="form-row">
            <div class="form-group">
              <label for="start-date" class="form-label">
                {{ t('widgets.calendar.startDate') }} *
              </label>
              <input
                id="start-date"
                v-model="formData.start_date"
                type="date"
                class="form-input"
                required
                :disabled="loading"
              >
            </div>
            
            <div class="form-group">
              <label for="start-time" class="form-label">
                {{ t('widgets.calendar.startTime') }}
              </label>
              <input
                id="start-time"
                v-model="formData.start_time"
                type="time"
                class="form-input"
                :disabled="loading"
              >
            </div>
          </div>
          
          <div class="form-row">
            <div class="form-group">
              <label for="end-date" class="form-label">
                {{ t('widgets.calendar.endDate') }}
              </label>
              <input
                id="end-date"
                v-model="formData.end_date"
                type="date"
                class="form-input"
                :disabled="loading"
              >
            </div>
            
            <div class="form-group">
              <label for="end-time" class="form-label">
                {{ t('widgets.calendar.endTime') }}
              </label>
              <input
                id="end-time"
                v-model="formData.end_time"
                type="time"
                class="form-input"
                :disabled="loading"
              >
            </div>
          </div>
          
          <!-- Options avancées -->
          <div class="advanced-options">
            <div class="form-group">
              <label class="form-checkbox">
                <input 
                  type="checkbox" 
                  v-model="formData.all_day"
                  :disabled="loading"
                >
                <span class="checkbox-label">{{ t('widgets.calendar.allDay') }}</span>
              </label>
            </div>
            
            <div class="form-group">
              <label class="form-checkbox">
                <input 
                  type="checkbox" 
                  v-model="formData.is_recurring"
                  :disabled="loading"
                >
                <span class="checkbox-label">{{ t('widgets.calendar.recurring') }}</span>
              </label>
            </div>
            
            <div v-if="formData.is_recurring" class="form-group">
              <label for="recurrence-pattern" class="form-label">
                {{ t('widgets.calendar.recurrencePattern') }}
              </label>
              <select
                id="recurrence-pattern"
                v-model="formData.recurrence_pattern"
                class="form-select"
                :disabled="loading"
              >
                <option value="daily">{{ t('widgets.calendar.daily') }}</option>
                <option value="weekly">{{ t('widgets.calendar.weekly') }}</option>
                <option value="monthly">{{ t('widgets.calendar.monthly') }}</option>
                <option value="yearly">{{ t('widgets.calendar.yearly') }}</option>
              </select>
            </div>
          </div>
          
          <!-- Priorité -->
          <div class="form-group">
            <label for="event-priority" class="form-label">
              {{ t('widgets.calendar.priority') }}
            </label>
            <select
              id="event-priority"
              v-model="formData.priority"
              class="form-select"
              :disabled="loading"
            >
              <option value="low">{{ t('widgets.calendar.lowPriority') }}</option>
              <option value="medium">{{ t('widgets.calendar.mediumPriority') }}</option>
              <option value="high">{{ t('widgets.calendar.highPriority') }}</option>
            </select>
          </div>
          
          <!-- Participants -->
          <div class="form-group">
            <label for="event-participants" class="form-label">
              {{ t('widgets.calendar.participants') }}
            </label>
            <input
              id="event-participants"
              v-model="formData.participants"
              type="text"
              :placeholder="t('widgets.calendar.participantsPlaceholder')"
              class="form-input"
              :disabled="loading"
            >
            <small class="form-help">{{ t('widgets.calendar.participantsHelp') }}</small>
          </div>
          
          <!-- Lieu -->
          <div class="form-group">
            <label for="event-location" class="form-label">
              {{ t('widgets.calendar.location') }}
            </label>
            <input
              id="event-location"
              v-model="formData.location"
              type="text"
              :placeholder="t('widgets.calendar.locationPlaceholder')"
              class="form-input"
              :disabled="loading"
            >
          </div>
        </form>
      </div>
      
      <div class="modal-footer">
        <button 
          type="button" 
          @click="closeModal" 
          class="btn btn-secondary"
          :disabled="loading"
        >
          {{ t('common.cancel') }}
        </button>
        <button 
          @click="handleSubmit" 
          class="btn btn-primary"
          :disabled="loading || !formData.title.trim() || !formData.type"
        >
          <i v-if="loading" class="fas fa-spinner fa-spin mr-2"></i>
          {{ isEditing ? t('common.save') : t('widgets.calendar.createEvent') }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted, watch, nextTick } from 'vue'
import { useTranslation } from '@/composables/useTranslation'
import { useNotifications } from '@/composables/useNotifications'

// Interfaces TypeScript
interface CalendarEvent {
  id?: string | number
  title: string
  description?: string
  type: 'meeting' | 'deadline' | 'reminder' | 'task'
  start_date: string
  start_time?: string
  end_date?: string
  end_time?: string
  all_day?: boolean
  is_recurring?: boolean
  recurrence_pattern?: 'daily' | 'weekly' | 'monthly' | 'yearly'
  priority?: 'low' | 'medium' | 'high'
  participants?: string
  location?: string
  project_id?: string | number
  created_at?: string
  updated_at?: string
}

interface EventFormData {
  title: string
  description: string
  type: string
  start_date: string
  start_time: string
  end_date: string | null
  end_time: string
  all_day: boolean
  is_recurring: boolean
  recurrence_pattern: string
  priority: string
  participants: string
  location: string
}

// Props
interface Props {
  event?: CalendarEvent | null
  isEditing?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  event: null,
  isEditing: false
})

// Événements émis
interface Emits {
  close: []
  save: [data: EventFormData]
}

const emit = defineEmits<Emits>()

// Composables
const { t } = useTranslation()
const { success, error } = useNotifications()

// État réactif
const loading = ref(false)

// Données du formulaire
const formData = reactive<EventFormData>({
  title: '',
  description: '',
  type: '',
  start_date: '',
  start_time: '',
  end_date: '',
  end_time: '',
  all_day: false,
  is_recurring: false,
  recurrence_pattern: 'weekly',
  priority: 'medium',
  participants: '',
  location: ''
})

// Propriétés calculées
const modalTitle = computed(() => {
  return props.isEditing ? t('widgets.calendar.editEvent') : t('widgets.calendar.createEvent')
})

// Méthodes
const closeModal = (): void => {
  emit('close')
}

const formatDateForInput = (dateString: string): string => {
  if (!dateString) return ''
  const date = new Date(dateString)
  return date.toISOString().split('T')[0]
}

const formatTimeForInput = (dateString: string): string => {
  if (!dateString) return ''
  const date = new Date(dateString)
  return date.toTimeString().slice(0, 5)
}

const validateForm = (): boolean => {
  if (!formData.title.trim()) {
    error(t('widgets.calendar.errors.titleRequired'))
    return false
  }
  
  if (!formData.type) {
    error(t('widgets.calendar.errors.typeRequired'))
    return false
  }
  
  if (!formData.start_date) {
    error(t('widgets.calendar.errors.startDateRequired'))
    return false
  }
  
  // Vérifier que la date de fin n'est pas antérieure à la date de début
  if (formData.end_date && formData.start_date > formData.end_date) {
    error(t('widgets.calendar.errors.endDateBeforeStart'))
    return false
  }
  
  return true
}

const handleSubmit = async (): Promise<void> => {
  if (!validateForm()) return
  
  loading.value = true
  
  try {
    // Préparer les données à envoyer
    const eventData = {
      ...formData,
      // Combiner date et heure si nécessaire
      start_date: formData.all_day 
        ? formData.start_date 
        : `${formData.start_date}${formData.start_time ? 'T' + formData.start_time : ''}`,
      end_date: formData.end_date 
        ? (formData.all_day 
            ? formData.end_date 
            : `${formData.end_date}${formData.end_time ? 'T' + formData.end_time : ''}`)
        : null
    }
    
    // Émettre les données du formulaire
    emit('save', eventData)
    
    success(props.isEditing ? t('widgets.calendar.eventUpdated') : t('widgets.calendar.eventCreated'))
    closeModal()
  } catch (err) {
    console.error('Erreur lors de la sauvegarde de l\'événement:', err)
    error(t('widgets.calendar.errors.saveFailed'))
  } finally {
    loading.value = false
  }
}

// Watchers
watch(() => formData.all_day, (isAllDay) => {
  if (isAllDay) {
    formData.start_time = ''
    formData.end_time = ''
  }
})

watch(() => formData.start_date, (newStartDate) => {
  if (newStartDate && !formData.end_date) {
    formData.end_date = newStartDate
  }
})

// Initialisation
onMounted(() => {
  if (props.isEditing && props.event) {
    formData.title = props.event.title || ''
    formData.description = props.event.description || ''
    formData.type = props.event.type || ''
    formData.start_date = formatDateForInput(props.event.start_date)
    formData.start_time = formatTimeForInput(props.event.start_date)
    formData.end_date = props.event.end_date ? formatDateForInput(props.event.end_date) : ''
    formData.end_time = props.event.end_date ? formatTimeForInput(props.event.end_date) : ''
    formData.all_day = props.event.all_day || false
    formData.is_recurring = props.event.is_recurring || false
    formData.recurrence_pattern = props.event.recurrence_pattern || 'weekly'
    formData.priority = props.event.priority || 'medium'
    formData.participants = props.event.participants || ''
    formData.location = props.event.location || ''
  } else {
    // Valeurs par défaut pour un nouvel événement
    const today = new Date()
    formData.start_date = today.toISOString().split('T')[0]
    formData.end_date = today.toISOString().split('T')[0]
  }
  
  // Focus sur le champ titre
  nextTick(() => {
    const titleInput = document.getElementById('event-title') as HTMLInputElement
    if (titleInput) {
      titleInput.focus()
    }
  })
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
  @apply text-xl font-semibold text-gray-900 m-0;
}

.modal-close-btn {
  @apply p-2 text-gray-400 hover:text-gray-600 transition-colors;
}

.modal-body {
  @apply p-6 max-h-[60vh] overflow-y-auto;
}

.event-form {
  @apply space-y-4;
}

.form-group {
  @apply space-y-2;
}

.form-row {
  @apply grid grid-cols-2 gap-4;
}

.form-label {
  @apply block text-sm font-medium text-gray-700;
}

.form-input {
  @apply w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent;
}

.form-textarea {
    @apply w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-y;
  }

.form-select {
  @apply w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent;
}

.form-input:disabled,
.form-textarea:disabled,
.form-select:disabled {
  @apply bg-gray-100 cursor-not-allowed;
}

.form-checkbox {
  @apply flex items-center space-x-2 cursor-pointer;
}

.form-checkbox input[type="checkbox"] {
  @apply rounded border-gray-300 text-blue-600 focus:ring-blue-500;
}

.checkbox-label {
  @apply text-sm text-gray-700;
}

.form-help {
  @apply text-xs text-gray-500 mt-1;
}

.advanced-options {
  @apply space-y-3 p-4 bg-gray-50 rounded-lg;
}

.modal-footer {
  @apply flex items-center justify-end space-x-3 p-6 border-t border-gray-200 bg-gray-50;
}

.btn {
  @apply px-4 py-2 rounded-md font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2;
}

.btn-secondary {
  @apply bg-white text-gray-700 border border-gray-300 hover:bg-gray-50 focus:ring-gray-500;
}

.btn-primary {
  @apply bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500;
}

.btn:disabled {
  @apply opacity-50 cursor-not-allowed;
}

.fa-spin {
  animation: spin 1s linear infinite;
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}
</style>