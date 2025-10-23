<template>
  <div class="modal-overlay" @click="handleOverlayClick">
    <div class="modal-content" @click.stop>
      <!-- En-tête du modal -->
      <div class="modal-header">
        <h3 class="modal-title">
          <i class="fas fa-edit"></i>
          {{ t('widgets.calendar.editEvent') }}
        </h3>
        <button @click="$emit('close')" class="close-btn">
          <i class="fas fa-times"></i>
        </button>
      </div>
      
      <!-- Formulaire -->
      <form @submit.prevent="handleSubmit" class="modal-body">
        <!-- Titre -->
        <div class="form-group">
          <label for="title" class="form-label required">
            {{ t('widgets.calendar.title') }}
          </label>
          <input
            id="title"
            v-model="formData.title"
            type="text"
            class="form-input"
            :class="{ 'error': errors.title }"
            :placeholder="t('widgets.calendar.titlePlaceholder')"
            required
          />
          <span v-if="errors.title" class="error-message">
            {{ errors.title }}
          </span>
        </div>
        
        <!-- Description -->
        <div class="form-group">
          <label for="description" class="form-label">
            {{ t('widgets.calendar.description') }}
          </label>
          <textarea
            id="description"
            v-model="formData.description"
            class="form-textarea"
            :placeholder="t('widgets.calendar.descriptionPlaceholder')"
            rows="3"
          ></textarea>
        </div>
        
        <!-- Type et Priorité -->
        <div class="form-row">
          <div class="form-group">
            <label for="type" class="form-label required">
              {{ t('widgets.calendar.type') }}
            </label>
            <select
              id="type"
              v-model="formData.type"
              class="form-select"
              :class="{ 'error': errors.type }"
              required
            >
              <option value="meeting">{{ t('widgets.calendar.eventTypes.meeting') }}</option>
              <option value="deadline">{{ t('widgets.calendar.eventTypes.deadline') }}</option>
              <option value="milestone">{{ t('widgets.calendar.eventTypes.milestone') }}</option>
              <option value="task">{{ t('widgets.calendar.eventTypes.task') }}</option>
              <option value="reminder">{{ t('widgets.calendar.eventTypes.reminder') }}</option>
            </select>
            <span v-if="errors.type" class="error-message">
              {{ errors.type }}
            </span>
          </div>
          
          <div class="form-group">
            <label for="priority" class="form-label">
              {{ t('widgets.calendar.priority') }}
            </label>
            <select
              id="priority"
              v-model="formData.priority"
              class="form-select"
            >
              <option value="low">{{ t('widgets.calendar.priorities.low') }}</option>
              <option value="medium">{{ t('widgets.calendar.priorities.medium') }}</option>
              <option value="high">{{ t('widgets.calendar.priorities.high') }}</option>
              <option value="urgent">{{ t('widgets.calendar.priorities.urgent') }}</option>
            </select>
          </div>
        </div>
        
        <!-- Statut -->
        <div class="form-group">
          <label for="status" class="form-label">
            {{ t('widgets.calendar.status') }}
          </label>
          <select
            id="status"
            v-model="formData.status"
            class="form-select"
          >
            <option value="confirmed">{{ t('widgets.calendar.statuses.confirmed') }}</option>
            <option value="tentative">{{ t('widgets.calendar.statuses.tentative') }}</option>
            <option value="cancelled">{{ t('widgets.calendar.statuses.cancelled') }}</option>
          </select>
        </div>
        
        <!-- Événement toute la journée -->
        <div class="form-group">
          <label class="checkbox-label">
            <input
              v-model="formData.isAllDay"
              type="checkbox"
              class="checkbox-input"
            />
            <span class="checkbox-text">
              {{ t('widgets.calendar.allDayEvent') }}
            </span>
          </label>
        </div>
        
        <!-- Dates et heures -->
        <div class="form-row">
          <div class="form-group">
            <label for="startDate" class="form-label required">
              {{ formData.isAllDay ? t('widgets.calendar.startDate') : t('widgets.calendar.startDateTime') }}
            </label>
            <div class="datetime-input">
              <input
                id="startDate"
                v-model="startDate"
                type="date"
                class="form-input"
                :class="{ 'error': errors.startDate }"
                required
              />
              <input
                v-if="!formData.isAllDay"
                v-model="startTime"
                type="time"
                class="form-input"
                :class="{ 'error': errors.startDate }"
                required
              />
            </div>
            <span v-if="errors.startDate" class="error-message">
              {{ errors.startDate }}
            </span>
          </div>
          
          <div class="form-group">
            <label for="endDate" class="form-label required">
              {{ formData.isAllDay ? t('widgets.calendar.endDate') : t('widgets.calendar.endDateTime') }}
            </label>
            <div class="datetime-input">
              <input
                id="endDate"
                v-model="endDate"
                type="date"
                class="form-input"
                :class="{ 'error': errors.endDate }"
                required
              />
              <input
                v-if="!formData.isAllDay"
                v-model="endTime"
                type="time"
                class="form-input"
                :class="{ 'error': errors.endDate }"
                required
              />
            </div>
            <span v-if="errors.endDate" class="error-message">
              {{ errors.endDate }}
            </span>
          </div>
        </div>
        
        <!-- Lieu -->
        <div class="form-group">
          <label for="location" class="form-label">
            {{ t('widgets.calendar.location') }}
          </label>
          <input
            id="location"
            v-model="formData.location"
            type="text"
            class="form-input"
            :placeholder="t('widgets.calendar.locationPlaceholder')"
          />
        </div>
        
        <!-- Participants -->
        <div class="form-group">
          <label class="form-label">
            {{ t('widgets.calendar.attendees') }}
          </label>
          <div class="attendees-section">
            <div class="attendee-input">
              <select
                v-model="selectedAttendee"
                class="form-select"
                :disabled="loadingTeamMembers"
              >
                <option value="">
                  {{ loadingTeamMembers ? t('common.loading') : t('widgets.calendar.selectAttendee') }}
                </option>
                <option
                  v-for="member in availableTeamMembers"
                  :key="member.id"
                  :value="member"
                >
                  {{ member.name }} ({{ member.email }})
                </option>
              </select>
              <button
                type="button"
                @click="addAttendee"
                class="btn-add"
                :disabled="!selectedAttendee"
              >
                <i class="fas fa-plus"></i>
                {{ t('widgets.calendar.addAttendee') }}
              </button>
            </div>
            
            <div v-if="formData.attendees.length > 0" class="attendees-list">
              <div
                v-for="(attendee, index) in formData.attendees"
                :key="attendee.id"
                class="attendee-item"
              >
                <div class="attendee-avatar">
                  <img
                    v-if="attendee.avatar"
                    :src="attendee.avatar"
                    :alt="attendee.name"
                    class="avatar-img"
                  />
                  <div v-else class="avatar-placeholder">
                    {{ attendee.name.charAt(0).toUpperCase() }}
                  </div>
                </div>
                <div class="attendee-info">
                  <div class="attendee-name">{{ attendee.name }}</div>
                  <div class="attendee-email">{{ attendee.email }}</div>
                </div>
                <div class="attendee-actions">
                  <label class="organizer-toggle">
                    <input
                      v-model="attendee.isOrganizer"
                      type="checkbox"
                      class="checkbox-input"
                    />
                    <span class="checkbox-text">{{ t('widgets.calendar.organizer') }}</span>
                  </label>
                  <button
                    type="button"
                    @click="removeAttendee(index)"
                    class="btn-remove"
                  >
                    <i class="fas fa-times"></i>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <!-- Tags -->
        <div class="form-group">
          <label class="form-label">
            {{ t('widgets.calendar.tags') }}
          </label>
          <div class="tags-section">
            <div class="tag-input">
              <input
                v-model="newTag"
                type="text"
                class="form-input"
                :placeholder="t('widgets.calendar.addTag')"
                @keyup.enter="addTag"
              />
              <button
                type="button"
                @click="addTag"
                class="btn-add"
                :disabled="!newTag.trim()"
              >
                <i class="fas fa-plus"></i>
                {{ t('widgets.calendar.add') }}
              </button>
            </div>
            
            <div v-if="formData.tags.length > 0" class="tags-list">
              <span
                v-for="(tag, index) in formData.tags"
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
          </div>
        </div>
        
        <!-- Rappels -->
        <div class="form-group">
          <label class="form-label">
            {{ t('widgets.calendar.reminders') }}
          </label>
          <div class="reminders-section">
            <div class="reminder-input">
              <select v-model="newReminder.type" class="form-select">
                <option value="email">{{ t('widgets.calendar.reminderTypes.email') }}</option>
                <option value="notification">{{ t('widgets.calendar.reminderTypes.notification') }}</option>
                <option value="popup">{{ t('widgets.calendar.reminderTypes.popup') }}</option>
              </select>
              <input
                v-model.number="newReminder.minutesBefore"
                type="number"
                class="form-input"
                :placeholder="t('widgets.calendar.minutesBefore')"
                min="0"
              />
              <button
                type="button"
                @click="addReminder"
                class="btn-add"
                :disabled="!newReminder.minutesBefore"
              >
                <i class="fas fa-plus"></i>
                {{ t('widgets.calendar.add') }}
              </button>
            </div>
            
            <div v-if="formData.reminders.length > 0" class="reminders-list">
              <div
                v-for="(reminder, index) in formData.reminders"
                :key="reminder.id"
                class="reminder-item"
              >
                <div class="reminder-icon">
                  <i :class="getReminderIcon(reminder.type)"></i>
                </div>
                <div class="reminder-info">
                  <span class="reminder-type">
                    {{ t(`widgets.calendar.reminderTypes.${reminder.type}`) }}
                  </span>
                  <span class="reminder-time">
                    {{ formatReminderTime(reminder.minutesBefore) }}
                  </span>
                </div>
                <div class="reminder-actions">
                  <label class="active-toggle">
                    <input
                      v-model="reminder.isActive"
                      type="checkbox"
                      class="checkbox-input"
                    />
                    <span class="checkbox-text">{{ t('widgets.calendar.active') }}</span>
                  </label>
                  <button
                    type="button"
                    @click="removeReminder(index)"
                    class="btn-remove"
                  >
                    <i class="fas fa-times"></i>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <!-- Couleur -->
        <div class="form-group">
          <label class="form-label">
            {{ t('widgets.calendar.color') }}
          </label>
          <div class="color-picker">
            <div
              v-for="color in predefinedColors"
              :key="color"
              class="color-option"
              :class="{ 'selected': formData.color === color }"
              :style="{ backgroundColor: color }"
              @click="formData.color = color"
            ></div>
            <input
              v-model="formData.color"
              type="color"
              class="color-input"
            />
          </div>
        </div>
        
        <!-- URL externe -->
        <div class="form-group">
          <label for="url" class="form-label">
            {{ t('widgets.calendar.externalUrl') }}
          </label>
          <input
            id="url"
            v-model="formData.url"
            type="url"
            class="form-input"
            :placeholder="t('widgets.calendar.externalUrlPlaceholder')"
          />
        </div>
      </form>
      
      <!-- Actions du modal -->
      <div class="modal-footer">
        <button type="button" @click="$emit('close')" class="btn-secondary">
          {{ t('common.cancel') }}
        </button>
        <button
          type="submit"
          @click="handleSubmit"
          class="btn-primary"
          :disabled="loading || !isFormValid"
        >
          <i v-if="loading" class="fas fa-spinner fa-spin"></i>
          <i v-else class="fas fa-save"></i>
          {{ loading ? t('common.saving') : t('widgets.calendar.updateEvent') }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted, watch } from 'vue'
import { useTranslation } from '@/composables/useTranslation'
import type { CalendarEvent, CreateEventData, TeamMember, EventAttendee, EventReminder } from '../types'

interface Props {
  event: CalendarEvent
}

interface Emits {
  (e: 'close'): void
  (e: 'update', eventData: CreateEventData): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()
const { t } = useTranslation()

// État du formulaire
const loading = ref(false)
const loadingTeamMembers = ref(false)
const teamMembers = ref<TeamMember[]>([])
const selectedAttendee = ref<TeamMember | null>(null)
const newTag = ref('')
const newReminder = reactive({
  type: 'email' as const,
  minutesBefore: 15
})

// Données du formulaire
const formData = reactive<CreateEventData>({
  title: props.event.title,
  description: props.event.description || '',
  type: props.event.type,
  priority: props.event.priority,
  status: props.event.status,
  startDate: props.event.startDate,
  endDate: props.event.endDate,
  isAllDay: props.event.isAllDay,
  location: props.event.location || '',
  attendees: [...props.event.attendees],
  tags: [...props.event.tags],
  reminders: [...props.event.reminders],
  color: props.event.color || '#3B82F6',
  url: props.event.url || ''
})

// Gestion des dates et heures
const startDate = ref('')
const startTime = ref('')
const endDate = ref('')
const endTime = ref('')

// Initialiser les champs de date/heure
const initializeDateTimeFields = () => {
  const start = new Date(props.event.startDate)
  const end = new Date(props.event.endDate)
  
  startDate.value = start.toISOString().split('T')[0]
  endDate.value = end.toISOString().split('T')[0]
  
  if (!props.event.isAllDay) {
    startTime.value = start.toTimeString().slice(0, 5)
    endTime.value = end.toTimeString().slice(0, 5)
  }
}

// Mettre à jour les dates dans formData
watch([startDate, startTime, endDate, endTime], () => {
  if (formData.isAllDay) {
    formData.startDate = `${startDate.value}T00:00:00`
    formData.endDate = `${endDate.value}T23:59:59`
  } else {
    formData.startDate = `${startDate.value}T${startTime.value}:00`
    formData.endDate = `${endDate.value}T${endTime.value}:00`
  }
})

// Réinitialiser les heures quand on passe en mode "toute la journée"
watch(() => formData.isAllDay, (isAllDay) => {
  if (isAllDay) {
    formData.startDate = `${startDate.value}T00:00:00`
    formData.endDate = `${endDate.value}T23:59:59`
  } else {
    startTime.value = '09:00'
    endTime.value = '10:00'
    formData.startDate = `${startDate.value}T${startTime.value}:00`
    formData.endDate = `${endDate.value}T${endTime.value}:00`
  }
})

// Erreurs de validation
const errors = reactive({
  title: '',
  type: '',
  startDate: '',
  endDate: ''
})

// Validation du formulaire
const isFormValid = computed(() => {
  return formData.title.trim() !== '' &&
         formData.type !== '' &&
         startDate.value !== '' &&
         endDate.value !== '' &&
         (!formData.isAllDay ? startTime.value !== '' && endTime.value !== '' : true) &&
         new Date(formData.startDate) <= new Date(formData.endDate)
})

// Couleurs prédéfinies
const predefinedColors = [
  '#3B82F6', // Bleu
  '#EF4444', // Rouge
  '#10B981', // Vert
  '#F59E0B', // Orange
  '#8B5CF6', // Violet
  '#EC4899', // Rose
  '#14B8A6', // Teal
  '#F97316'  // Orange foncé
]

// Membres d'équipe disponibles (excluant ceux déjà ajoutés)
const availableTeamMembers = computed(() => {
  return teamMembers.value.filter(member => 
    !formData.attendees.some(attendee => attendee.id === member.id)
  )
})

// Charger les membres d'équipe
const loadTeamMembers = async () => {
  loadingTeamMembers.value = true
  try {
    // Simulation d'un appel API
    await new Promise(resolve => setTimeout(resolve, 1000))
    teamMembers.value = [
      {
        id: '1',
        name: 'Alice Martin',
        email: 'alice@example.com',
        avatar: ''
      },
      {
        id: '2',
        name: 'Bob Dupont',
        email: 'bob@example.com',
        avatar: ''
      },
      {
        id: '3',
        name: 'Claire Moreau',
        email: 'claire@example.com',
        avatar: ''
      }
    ]
  } catch (error) {
    console.error('Erreur lors du chargement des membres:', error)
  } finally {
    loadingTeamMembers.value = false
  }
}

// Gestion des participants
const addAttendee = () => {
  if (selectedAttendee.value) {
    const attendee: EventAttendee = {
      id: selectedAttendee.value.id,
      name: selectedAttendee.value.name,
      email: selectedAttendee.value.email,
      avatar: selectedAttendee.value.avatar,
      status: 'pending',
      isOrganizer: false
    }
    formData.attendees.push(attendee)
    selectedAttendee.value = null
  }
}

const removeAttendee = (index: number) => {
  formData.attendees.splice(index, 1)
}

// Gestion des tags
const addTag = () => {
  const tag = newTag.value.trim()
  if (tag && !formData.tags.includes(tag)) {
    formData.tags.push(tag)
    newTag.value = ''
  }
}

const removeTag = (index: number) => {
  formData.tags.splice(index, 1)
}

// Gestion des rappels
const addReminder = () => {
  if (newReminder.minutesBefore > 0) {
    const reminder: EventReminder = {
      id: Date.now().toString(),
      type: newReminder.type,
      minutesBefore: newReminder.minutesBefore,
      isActive: true
    }
    formData.reminders.push(reminder)
    newReminder.minutesBefore = 15
  }
}

const removeReminder = (index: number) => {
  formData.reminders.splice(index, 1)
}

// Utilitaires
const getReminderIcon = (type: string) => {
  const icons = {
    email: 'fas fa-envelope',
    notification: 'fas fa-bell',
    popup: 'fas fa-window-restore'
  }
  return icons[type] || 'fas fa-bell'
}

const formatReminderTime = (minutes: number) => {
  if (minutes < 60) {
    return `${minutes} ${t('widgets.calendar.minutesBefore')}`
  }
  
  const hours = Math.floor(minutes / 60)
  const remainingMinutes = minutes % 60
  
  if (remainingMinutes === 0) {
    return `${hours} ${t('widgets.calendar.hoursBefore')}`
  }
  
  return `${hours}h ${remainingMinutes}min ${t('widgets.calendar.before')}`
}

// Validation
const validateForm = () => {
  // Réinitialiser les erreurs
  Object.keys(errors).forEach(key => {
    errors[key] = ''
  })
  
  let isValid = true
  
  // Validation du titre
  if (!formData.title.trim()) {
    errors.title = t('widgets.calendar.errors.titleRequired')
    isValid = false
  }
  
  // Validation du type
  if (!formData.type) {
    errors.type = t('widgets.calendar.errors.typeRequired')
    isValid = false
  }
  
  // Validation des dates
  if (!startDate.value) {
    errors.startDate = t('widgets.calendar.errors.startDateRequired')
    isValid = false
  }
  
  if (!endDate.value) {
    errors.endDate = t('widgets.calendar.errors.endDateRequired')
    isValid = false
  }
  
  // Validation de l'ordre des dates
  if (startDate.value && endDate.value) {
    const start = new Date(formData.startDate)
    const end = new Date(formData.endDate)
    
    if (start > end) {
      errors.endDate = t('widgets.calendar.errors.endDateAfterStart')
      isValid = false
    }
  }
  
  return isValid
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
    // Simulation d'un appel API
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    emit('update', { ...formData })
    emit('close')
  } catch (error) {
    console.error('Erreur lors de la mise à jour de l\'événement:', error)
  } finally {
    loading.value = false
  }
}

// Initialisation
onMounted(() => {
  initializeDateTimeFields()
  loadTeamMembers()
})
</script>

<style scoped>
.modal-overlay {
  @apply fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4;
}

.modal-content {
  @apply bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-screen overflow-hidden flex flex-col;
}

.modal-header {
  @apply flex items-center justify-between p-6 border-b border-gray-200;
}

.modal-title {
  @apply text-xl font-semibold text-gray-900 flex items-center gap-2;
}

.close-btn {
  @apply p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors;
}

.modal-body {
  @apply flex-1 overflow-y-auto p-6 space-y-6;
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
  @apply text-red-500 ml-1;
  content: '*';
}

.form-input,
.form-select,
.form-textarea {
  @apply w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors;
}

.form-input.error,
.form-select.error,
.form-textarea.error {
  @apply border-red-500 focus:ring-red-500 focus:border-red-500;
}

.datetime-input {
  @apply flex gap-2;
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

.error-message {
  @apply text-sm text-red-600;
}

.attendees-section,
.tags-section,
.reminders-section {
  @apply space-y-3;
}

.attendee-input,
.tag-input,
.reminder-input {
  @apply flex gap-2;
}

.btn-add {
  @apply px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2 whitespace-nowrap;
}

.attendees-list {
  @apply space-y-2;
}

.attendee-item {
  @apply flex items-center gap-3 p-3 bg-gray-50 rounded-lg;
}

.attendee-avatar {
  @apply w-10 h-10 rounded-full overflow-hidden;
}

.avatar-img {
  @apply w-full h-full object-cover;
}

.avatar-placeholder {
  @apply w-full h-full bg-gray-300 text-gray-600 text-sm flex items-center justify-center font-medium;
}

.attendee-info {
  @apply flex-1;
}

.attendee-name {
  @apply font-medium text-gray-900;
}

.attendee-email {
  @apply text-sm text-gray-600;
}

.attendee-actions {
  @apply flex items-center gap-3;
}

.organizer-toggle,
.active-toggle {
  @apply flex items-center gap-1;
}

.btn-remove {
  @apply p-1 text-red-600 hover:text-red-800 hover:bg-red-50 rounded transition-colors;
}

.tags-list {
  @apply flex flex-wrap gap-2;
}

.tag-item {
  @apply px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm flex items-center gap-2;
}

.tag-remove {
  @apply text-blue-600 hover:text-blue-800 transition-colors;
}

.reminders-list {
  @apply space-y-2;
}

.reminder-item {
  @apply flex items-center gap-3 p-3 bg-gray-50 rounded-lg;
}

.reminder-icon {
  @apply w-8 h-8 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center;
}

.reminder-info {
  @apply flex-1;
}

.reminder-type {
  @apply font-medium text-gray-900;
}

.reminder-time {
  @apply text-sm text-gray-600;
}

.reminder-actions {
  @apply flex items-center gap-3;
}

.color-picker {
  @apply flex items-center gap-2;
}

.color-option {
  @apply w-8 h-8 rounded-full cursor-pointer border-2 border-transparent hover:border-gray-300 transition-colors;
}

.color-option.selected {
  @apply border-gray-600;
}

.color-input {
  @apply w-12 h-8 rounded border border-gray-300 cursor-pointer;
}

.modal-footer {
  @apply flex items-center justify-between p-6 border-t border-gray-200;
}

.btn-secondary {
  @apply px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors;
}

.btn-primary {
  @apply px-4 py-2 bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg transition-colors flex items-center gap-2;
}
</style>