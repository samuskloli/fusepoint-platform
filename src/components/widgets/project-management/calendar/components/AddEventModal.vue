<template>
  <div class="modal-overlay" @click="handleOverlayClick">
    <div class="modal-content" @click.stop>
      <!-- En-tête du modal -->
      <div class="modal-header">
        <h3 class="modal-title">{{ t('widgets.calendar.addEvent') }}</h3>
        <button @click="$emit('close')" class="close-btn">
          <i class="fas fa-times"></i>
        </button>
      </div>
      
      <!-- Formulaire -->
      <form @submit.prevent="handleSubmit" class="modal-body">
        <!-- Titre -->
        <div class="form-group">
          <label class="form-label required">{{ t('widgets.calendar.eventTitle') }}</label>
          <input 
            v-model="form.title"
            type="text"
            class="form-input"
            :class="{ 'error': errors.title }"
            :placeholder="t('widgets.calendar.enterEventTitle')"
            required
          />
          <span v-if="errors.title" class="error-message">{{ errors.title }}</span>
        </div>
        
        <!-- Description -->
        <div class="form-group">
          <label class="form-label">{{ t('widgets.calendar.description') }}</label>
          <textarea 
            v-model="form.description"
            class="form-textarea"
            rows="3"
            :placeholder="t('widgets.calendar.enterDescription')"
          ></textarea>
        </div>
        
        <!-- Type et priorité -->
        <div class="form-row">
          <div class="form-group">
            <label class="form-label required">{{ t('widgets.calendar.eventType') }}</label>
            <select v-model="form.type" class="form-select" required>
              <option value="meeting">{{ t('widgets.calendar.eventTypes.meeting') }}</option>
              <option value="deadline">{{ t('widgets.calendar.eventTypes.deadline') }}</option>
              <option value="milestone">{{ t('widgets.calendar.eventTypes.milestone') }}</option>
              <option value="task">{{ t('widgets.calendar.eventTypes.task') }}</option>
              <option value="reminder">{{ t('widgets.calendar.eventTypes.reminder') }}</option>
            </select>
          </div>
          
          <div class="form-group">
            <label class="form-label">{{ t('widgets.calendar.priority') }}</label>
            <select v-model="form.priority" class="form-select">
              <option value="low">{{ t('widgets.calendar.priorities.low') }}</option>
              <option value="medium">{{ t('widgets.calendar.priorities.medium') }}</option>
              <option value="high">{{ t('widgets.calendar.priorities.high') }}</option>
              <option value="urgent">{{ t('widgets.calendar.priorities.urgent') }}</option>
            </select>
          </div>
        </div>
        
        <!-- Événement toute la journée -->
        <div class="form-group">
          <label class="checkbox-label">
            <input 
              v-model="form.isAllDay"
              type="checkbox"
              class="checkbox-input"
            />
            <span class="checkbox-text">{{ t('widgets.calendar.allDayEvent') }}</span>
          </label>
        </div>
        
        <!-- Dates et heures -->
        <div class="form-row">
          <div class="form-group">
            <label class="form-label required">{{ t('widgets.calendar.startDate') }}</label>
            <input 
              v-model="form.startDate"
              type="date"
              class="form-input"
              :class="{ 'error': errors.startDate }"
              required
            />
            <span v-if="errors.startDate" class="error-message">{{ errors.startDate }}</span>
          </div>
          
          <div v-if="!form.isAllDay" class="form-group">
            <label class="form-label required">{{ t('widgets.calendar.startTime') }}</label>
            <input 
              v-model="form.startTime"
              type="time"
              class="form-input"
              :class="{ 'error': errors.startTime }"
              required
            />
            <span v-if="errors.startTime" class="error-message">{{ errors.startTime }}</span>
          </div>
        </div>
        
        <div class="form-row">
          <div class="form-group">
            <label class="form-label required">{{ t('widgets.calendar.endDate') }}</label>
            <input 
              v-model="form.endDate"
              type="date"
              class="form-input"
              :class="{ 'error': errors.endDate }"
              required
            />
            <span v-if="errors.endDate" class="error-message">{{ errors.endDate }}</span>
          </div>
          
          <div v-if="!form.isAllDay" class="form-group">
            <label class="form-label required">{{ t('widgets.calendar.endTime') }}</label>
            <input 
              v-model="form.endTime"
              type="time"
              class="form-input"
              :class="{ 'error': errors.endTime }"
              required
            />
            <span v-if="errors.endTime" class="error-message">{{ errors.endTime }}</span>
          </div>
        </div>
        
        <!-- Lieu -->
        <div class="form-group">
          <label class="form-label">{{ t('widgets.calendar.location') }}</label>
          <input 
            v-model="form.location"
            type="text"
            class="form-input"
            :placeholder="t('widgets.calendar.enterLocation')"
          />
        </div>
        
        <!-- Participants -->
        <div class="form-group">
          <label class="form-label">{{ t('widgets.calendar.attendees') }}</label>
          <div class="attendees-selector">
            <div class="selected-attendees">
              <div 
                v-for="attendee in selectedAttendees" 
                :key="attendee.id"
                class="attendee-chip"
              >
                <img 
                  v-if="attendee.avatar"
                  :src="attendee.avatar"
                  :alt="attendee.name"
                  class="attendee-avatar"
                />
                <div v-else class="attendee-avatar-placeholder">
                  {{ attendee.name.charAt(0).toUpperCase() }}
                </div>
                <span class="attendee-name">{{ attendee.name }}</span>
                <button 
                  @click="removeAttendee(attendee.id)"
                  type="button"
                  class="remove-attendee-btn"
                >
                  <i class="fas fa-times"></i>
                </button>
              </div>
            </div>
            
            <select 
              v-model="selectedAttendeeId"
              @change="addAttendee"
              class="form-select"
            >
              <option value="">{{ t('widgets.calendar.selectAttendee') }}</option>
              <option 
                v-for="member in availableMembers" 
                :key="member.id" 
                :value="member.id"
              >
                {{ member.name }}
              </option>
            </select>
          </div>
        </div>
        
        <!-- Tags -->
        <div class="form-group">
          <label class="form-label">{{ t('widgets.calendar.tags') }}</label>
          <div class="tags-input">
            <div class="selected-tags">
              <span 
                v-for="(tag, index) in form.tags" 
                :key="index"
                class="tag-chip"
              >
                {{ tag }}
                <button 
                  @click="removeTag(index)"
                  type="button"
                  class="remove-tag-btn"
                >
                  <i class="fas fa-times"></i>
                </button>
              </span>
            </div>
            <input 
              v-model="newTag"
              @keydown.enter.prevent="addTag"
              @keydown.comma.prevent="addTag"
              type="text"
              class="tag-input"
              :placeholder="t('widgets.calendar.addTag')"
            />
          </div>
        </div>
        
        <!-- Rappels -->
        <div class="form-group">
          <label class="form-label">{{ t('widgets.calendar.reminders') }}</label>
          <div class="reminders-list">
            <div 
              v-for="(reminder, index) in form.reminders" 
              :key="index"
              class="reminder-item"
            >
              <select v-model="reminder.type" class="reminder-type">
                <option value="email">{{ t('widgets.calendar.reminderTypes.email') }}</option>
                <option value="notification">{{ t('widgets.calendar.reminderTypes.notification') }}</option>
                <option value="popup">{{ t('widgets.calendar.reminderTypes.popup') }}</option>
              </select>
              
              <input 
                v-model.number="reminder.minutesBefore"
                type="number"
                min="0"
                class="reminder-time"
                :placeholder="t('widgets.calendar.minutesBefore')"
              />
              
              <button 
                @click="removeReminder(index)"
                type="button"
                class="remove-reminder-btn"
              >
                <i class="fas fa-trash"></i>
              </button>
            </div>
            
            <button 
              @click="addReminder"
              type="button"
              class="add-reminder-btn"
            >
              <i class="fas fa-plus"></i>
              {{ t('widgets.calendar.addReminder') }}
            </button>
          </div>
        </div>
      </form>
      
      <!-- Actions du modal -->
      <div class="modal-footer">
        <button @click="$emit('close')" type="button" class="btn-secondary">
          {{ t('common.cancel') }}
        </button>
        <button @click="handleSubmit" type="submit" class="btn-primary" :disabled="loading">
          <i v-if="loading" class="fas fa-spinner fa-spin"></i>
          <i v-else class="fas fa-save"></i>
          {{ t('widgets.calendar.createEvent') }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { useTranslation } from '@/composables/useTranslation'
import type { CreateEventData, EventType, EventPriority, EventReminder } from '../types'

interface Props {
  initialDate?: string
  initialTime?: string
}

interface Emits {
  (e: 'close'): void
  (e: 'save', eventData: CreateEventData): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()
const { t } = useTranslation()

// États locaux
const loading = ref(false)
const errors = ref<Record<string, string>>({})
const selectedAttendeeId = ref('')
const newTag = ref('')
const teamMembers = ref<any[]>([])

// Formulaire
const form = ref<{
  title: string
  description: string
  type: EventType
  priority: EventPriority
  isAllDay: boolean
  startDate: string
  startTime: string
  endDate: string
  endTime: string
  location: string
  attendeeIds: string[]
  tags: string[]
  reminders: Omit<EventReminder, 'id'>[]
}>({
  title: '',
  description: '',
  type: 'meeting',
  priority: 'medium',
  isAllDay: false,
  startDate: props.initialDate || new Date().toISOString().split('T')[0],
  startTime: props.initialTime || '09:00',
  endDate: props.initialDate || new Date().toISOString().split('T')[0],
  endTime: props.initialTime ? addHour(props.initialTime) : '10:00',
  location: '',
  attendeeIds: [],
  tags: [],
  reminders: []
})

// Participants sélectionnés
const selectedAttendees = computed(() => {
  return teamMembers.value.filter(member => 
    form.value.attendeeIds.includes(member.id)
  )
})

// Membres disponibles
const availableMembers = computed(() => {
  return teamMembers.value.filter(member => 
    !form.value.attendeeIds.includes(member.id)
  )
})

// Utilitaires
function addHour(time: string): string {
  const [hours, minutes] = time.split(':').map(Number)
  const newHours = (hours + 1) % 24
  return `${newHours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`
}

// Validation
const validateForm = () => {
  errors.value = {}
  
  if (!form.value.title.trim()) {
    errors.value.title = t('widgets.calendar.errors.titleRequired')
  }
  
  if (!form.value.startDate) {
    errors.value.startDate = t('widgets.calendar.errors.startDateRequired')
  }
  
  if (!form.value.endDate) {
    errors.value.endDate = t('widgets.calendar.errors.endDateRequired')
  }
  
  if (!form.value.isAllDay) {
    if (!form.value.startTime) {
      errors.value.startTime = t('widgets.calendar.errors.startTimeRequired')
    }
    
    if (!form.value.endTime) {
      errors.value.endTime = t('widgets.calendar.errors.endTimeRequired')
    }
    
    // Vérifier que la date/heure de fin est après le début
    const startDateTime = new Date(`${form.value.startDate}T${form.value.startTime}`)
    const endDateTime = new Date(`${form.value.endDate}T${form.value.endTime}`)
    
    if (endDateTime <= startDateTime) {
      errors.value.endTime = t('widgets.calendar.errors.endTimeAfterStart')
    }
  } else {
    // Pour les événements toute la journée, vérifier que la date de fin est >= date de début
    if (new Date(form.value.endDate) < new Date(form.value.startDate)) {
      errors.value.endDate = t('widgets.calendar.errors.endDateAfterStart')
    }
  }
  
  return Object.keys(errors.value).length === 0
}

// Gestion des participants
const addAttendee = () => {
  if (selectedAttendeeId.value && !form.value.attendeeIds.includes(selectedAttendeeId.value)) {
    form.value.attendeeIds.push(selectedAttendeeId.value)
    selectedAttendeeId.value = ''
  }
}

const removeAttendee = (attendeeId: string) => {
  form.value.attendeeIds = form.value.attendeeIds.filter(id => id !== attendeeId)
}

// Gestion des tags
const addTag = () => {
  const tag = newTag.value.trim()
  if (tag && !form.value.tags.includes(tag)) {
    form.value.tags.push(tag)
    newTag.value = ''
  }
}

const removeTag = (index: number) => {
  form.value.tags.splice(index, 1)
}

// Gestion des rappels
const addReminder = () => {
  form.value.reminders.push({
    type: 'email',
    minutesBefore: 15,
    isActive: true
  })
}

const removeReminder = (index: number) => {
  form.value.reminders.splice(index, 1)
}

// Actions
const handleOverlayClick = () => {
  emit('close')
}

const handleSubmit = async () => {
  if (!validateForm()) {
    return
  }
  
  loading.value = true
  
  try {
    const eventData: CreateEventData = {
      title: form.value.title.trim(),
      description: form.value.description.trim() || undefined,
      type: form.value.type,
      priority: form.value.priority,
      isAllDay: form.value.isAllDay,
      startDate: form.value.isAllDay 
        ? `${form.value.startDate}T00:00:00`
        : `${form.value.startDate}T${form.value.startTime}:00`,
      endDate: form.value.isAllDay 
        ? `${form.value.endDate}T23:59:59`
        : `${form.value.endDate}T${form.value.endTime}:00`,
      location: form.value.location.trim() || undefined,
      attendeeIds: form.value.attendeeIds,
      tags: form.value.tags,
      reminders: form.value.reminders
    }
    
    emit('save', eventData)
  } catch (error) {
    console.error('Error creating event:', error)
  } finally {
    loading.value = false
  }
}

// Chargement des membres de l'équipe
const loadTeamMembers = async () => {
  try {
    // TODO: Charger les membres de l'équipe depuis l'API
    teamMembers.value = [
      { id: '1', name: 'John Doe', email: 'john@example.com', avatar: null },
      { id: '2', name: 'Jane Smith', email: 'jane@example.com', avatar: null },
      { id: '3', name: 'Bob Johnson', email: 'bob@example.com', avatar: null }
    ]
  } catch (error) {
    console.error('Error loading team members:', error)
  }
}

// Watchers
watch(() => form.value.isAllDay, (isAllDay) => {
  if (isAllDay) {
    // Réinitialiser les heures pour les événements toute la journée
    form.value.startTime = '00:00'
    form.value.endTime = '23:59'
  }
})

// Initialisation
onMounted(() => {
  loadTeamMembers()
})
</script>

<style scoped>
.modal-overlay {
  @apply fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4;
}

.modal-content {
  @apply bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-screen overflow-hidden flex flex-col;
}

.modal-header {
  @apply flex items-center justify-between p-6 border-b border-gray-200;
}

.modal-title {
  @apply text-xl font-semibold text-gray-900 m-0;
}

.close-btn {
  @apply p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors;
}

.modal-body {
  @apply flex-1 overflow-y-auto p-6 space-y-4;
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

.form-label.required::after {
  content: ' *';
  @apply text-red-500;
}

.form-input,
.form-select,
.form-textarea {
  @apply w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent;
}

.form-input.error,
.form-select.error,
.form-textarea.error {
  @apply border-red-500 focus:ring-red-500;
}

.error-message {
  @apply text-sm text-red-600;
}

.checkbox-label {
  @apply flex items-center gap-2 cursor-pointer;
}

.checkbox-input {
  @apply w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500;
}

.checkbox-text {
  @apply text-sm text-gray-700;
}

.attendees-selector {
  @apply space-y-3;
}

.selected-attendees {
  @apply flex flex-wrap gap-2;
}

.attendee-chip {
  @apply flex items-center gap-2 bg-blue-100 text-blue-800 px-3 py-1 rounded-full;
}

.attendee-avatar {
  @apply w-5 h-5 rounded-full object-cover;
}

.attendee-avatar-placeholder {
  @apply w-5 h-5 bg-blue-500 text-white text-xs rounded-full flex items-center justify-center font-medium;
}

.attendee-name {
  @apply text-sm font-medium;
}

.remove-attendee-btn {
  @apply text-blue-600 hover:text-blue-800 transition-colors;
}

.tags-input {
  @apply border border-gray-300 rounded-lg p-2 space-y-2;
}

.selected-tags {
  @apply flex flex-wrap gap-1;
}

.tag-chip {
  @apply flex items-center gap-1 bg-gray-100 text-gray-800 px-2 py-1 rounded text-sm;
}

.remove-tag-btn {
  @apply text-gray-500 hover:text-gray-700 transition-colors;
}

.tag-input {
  @apply w-full border-0 focus:ring-0 focus:outline-none;
}

.reminders-list {
  @apply space-y-2;
}

.reminder-item {
  @apply flex items-center gap-2;
}

.reminder-type {
  @apply flex-1 px-3 py-2 border border-gray-300 rounded-lg;
}

.reminder-time {
  @apply w-24 px-3 py-2 border border-gray-300 rounded-lg;
}

.remove-reminder-btn {
  @apply p-2 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors;
}

.add-reminder-btn {
  @apply flex items-center gap-2 text-blue-600 hover:text-blue-800 transition-colors;
}

.modal-footer {
  @apply flex items-center justify-end gap-3 p-6 border-t border-gray-200;
}

.btn-secondary {
  @apply px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors;
}

.btn-primary {
  @apply px-4 py-2 bg-blue-600 text-white hover:bg-blue-700 rounded-lg transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed;
}
</style>