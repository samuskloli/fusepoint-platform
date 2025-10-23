<template>
  <div class="modal-overlay" @click="handleOverlayClick">
    <div class="modal-content" @click.stop>
      <!-- En-tête du modal -->
      <div class="modal-header">
        <div class="header-info">
          <div 
            class="event-type-indicator"
            :style="{ backgroundColor: getEventColor(event) }"
          ></div>
          <div>
            <h3 class="modal-title">{{ event.title }}</h3>
            <div class="event-meta">
              <span 
                class="event-type-badge"
                :class="`badge-${event.type}`"
              >
                {{ t(`widgets.calendar.eventTypes.${event.type}`) }}
              </span>
              <span 
                v-if="event.priority !== 'medium'"
                class="priority-badge"
                :class="`priority-${event.priority}`"
              >
                {{ t(`widgets.calendar.priorities.${event.priority}`) }}
              </span>
              <span 
                class="status-badge"
                :class="`status-${event.status}`"
              >
                {{ t(`widgets.calendar.statuses.${event.status}`) }}
              </span>
            </div>
          </div>
        </div>
        
        <div class="header-actions">
          <button 
            @click="handleEdit"
            class="action-btn"
            :title="t('widgets.calendar.editEvent')"
          >
            <i class="fas fa-edit"></i>
          </button>
          <button 
            @click="handleDelete"
            class="action-btn delete-btn"
            :title="t('widgets.calendar.deleteEvent')"
          >
            <i class="fas fa-trash"></i>
          </button>
          <button @click="$emit('close')" class="close-btn">
            <i class="fas fa-times"></i>
          </button>
        </div>
      </div>
      
      <!-- Contenu du modal -->
      <div class="modal-body">
        <!-- Date et heure -->
        <div class="detail-section">
          <div class="section-header">
            <i class="fas fa-calendar-alt"></i>
            <h4 class="section-title">{{ t('widgets.calendar.dateTime') }}</h4>
          </div>
          <div class="section-content">
            <div class="datetime-info">
              <div class="datetime-item">
                <span class="datetime-label">{{ t('widgets.calendar.start') }}:</span>
                <span class="datetime-value">{{ formatDateTime(event.startDate, event.isAllDay) }}</span>
              </div>
              <div class="datetime-item">
                <span class="datetime-label">{{ t('widgets.calendar.end') }}:</span>
                <span class="datetime-value">{{ formatDateTime(event.endDate, event.isAllDay) }}</span>
              </div>
              <div v-if="!event.isAllDay" class="datetime-item">
                <span class="datetime-label">{{ t('widgets.calendar.duration') }}:</span>
                <span class="datetime-value">{{ getEventDuration(event) }}</span>
              </div>
            </div>
          </div>
        </div>
        
        <!-- Description -->
        <div v-if="event.description" class="detail-section">
          <div class="section-header">
            <i class="fas fa-align-left"></i>
            <h4 class="section-title">{{ t('widgets.calendar.description') }}</h4>
          </div>
          <div class="section-content">
            <p class="description-text">{{ event.description }}</p>
          </div>
        </div>
        
        <!-- Lieu -->
        <div v-if="event.location" class="detail-section">
          <div class="section-header">
            <i class="fas fa-map-marker-alt"></i>
            <h4 class="section-title">{{ t('widgets.calendar.location') }}</h4>
          </div>
          <div class="section-content">
            <div class="location-info">
              <span class="location-text">{{ event.location }}</span>
              <a 
                v-if="isValidUrl(event.location)"
                :href="event.location"
                target="_blank"
                class="location-link"
              >
                <i class="fas fa-external-link-alt"></i>
                {{ t('widgets.calendar.openLocation') }}
              </a>
            </div>
          </div>
        </div>
        
        <!-- Participants -->
        <div v-if="event.attendees.length > 0" class="detail-section">
          <div class="section-header">
            <i class="fas fa-users"></i>
            <h4 class="section-title">
              {{ t('widgets.calendar.attendees') }} ({{ event.attendees.length }})
            </h4>
          </div>
          <div class="section-content">
            <div class="attendees-list">
              <div 
                v-for="attendee in event.attendees" 
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
                  <div class="attendee-name">
                    {{ attendee.name }}
                    <span v-if="attendee.isOrganizer" class="organizer-badge">
                      {{ t('widgets.calendar.organizer') }}
                    </span>
                  </div>
                  <div class="attendee-email">{{ attendee.email }}</div>
                </div>
                <div class="attendee-status">
                  <span 
                    class="status-indicator"
                    :class="`status-${attendee.status}`"
                    :title="t(`widgets.calendar.attendeeStatuses.${attendee.status}`)"
                  >
                    <i :class="getStatusIcon(attendee.status)"></i>
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <!-- Tags -->
        <div v-if="event.tags.length > 0" class="detail-section">
          <div class="section-header">
            <i class="fas fa-tags"></i>
            <h4 class="section-title">{{ t('widgets.calendar.tags') }}</h4>
          </div>
          <div class="section-content">
            <div class="tags-list">
              <span 
                v-for="tag in event.tags" 
                :key="tag"
                class="tag-item"
              >
                {{ tag }}
              </span>
            </div>
          </div>
        </div>
        
        <!-- Rappels -->
        <div v-if="event.reminders.length > 0" class="detail-section">
          <div class="section-header">
            <i class="fas fa-bell"></i>
            <h4 class="section-title">{{ t('widgets.calendar.reminders') }}</h4>
          </div>
          <div class="section-content">
            <div class="reminders-list">
              <div 
                v-for="reminder in event.reminders" 
                :key="reminder.id"
                class="reminder-item"
                :class="{ 'inactive': !reminder.isActive }"
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
                <div class="reminder-status">
                  <span 
                    class="status-indicator"
                    :class="{ 'active': reminder.isActive }"
                  >
                    <i :class="reminder.isActive ? 'fas fa-check' : 'fas fa-times'"></i>
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <!-- Récurrence -->
        <div v-if="event.recurrence" class="detail-section">
          <div class="section-header">
            <i class="fas fa-redo"></i>
            <h4 class="section-title">{{ t('widgets.calendar.recurrence') }}</h4>
          </div>
          <div class="section-content">
            <div class="recurrence-info">
              <span class="recurrence-pattern">
                {{ formatRecurrencePattern(event.recurrence) }}
              </span>
              <span v-if="event.recurrence.endDate" class="recurrence-end">
                {{ t('widgets.calendar.until') }} {{ formatDate(event.recurrence.endDate) }}
              </span>
            </div>
          </div>
        </div>
        
        <!-- Pièces jointes -->
        <div v-if="event.attachments && event.attachments.length > 0" class="detail-section">
          <div class="section-header">
            <i class="fas fa-paperclip"></i>
            <h4 class="section-title">{{ t('widgets.calendar.attachments') }}</h4>
          </div>
          <div class="section-content">
            <div class="attachments-list">
              <a 
                v-for="attachment in event.attachments" 
                :key="attachment.id"
                :href="attachment.url"
                target="_blank"
                class="attachment-item"
              >
                <div class="attachment-icon">
                  <i :class="getFileIcon(attachment.type)"></i>
                </div>
                <div class="attachment-info">
                  <span class="attachment-name">{{ attachment.name }}</span>
                  <span class="attachment-size">{{ formatFileSize(attachment.size) }}</span>
                </div>
                <div class="attachment-action">
                  <i class="fas fa-download"></i>
                </div>
              </a>
            </div>
          </div>
        </div>
        
        <!-- Métadonnées -->
        <div class="detail-section">
          <div class="section-header">
            <i class="fas fa-info-circle"></i>
            <h4 class="section-title">{{ t('widgets.calendar.metadata') }}</h4>
          </div>
          <div class="section-content">
            <div class="metadata-grid">
              <div class="metadata-item">
                <span class="metadata-label">{{ t('widgets.calendar.createdBy') }}:</span>
                <span class="metadata-value">{{ event.createdBy }}</span>
              </div>
              <div class="metadata-item">
                <span class="metadata-label">{{ t('widgets.calendar.createdAt') }}:</span>
                <span class="metadata-value">{{ formatDateTime(event.createdAt, false) }}</span>
              </div>
              <div class="metadata-item">
                <span class="metadata-label">{{ t('widgets.calendar.lastUpdated') }}:</span>
                <span class="metadata-value">{{ formatDateTime(event.updatedAt, false) }}</span>
              </div>
              <div v-if="event.url" class="metadata-item">
                <span class="metadata-label">{{ t('widgets.calendar.externalLink') }}:</span>
                <a :href="event.url" target="_blank" class="metadata-link">
                  {{ t('widgets.calendar.openExternal') }}
                  <i class="fas fa-external-link-alt"></i>
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <!-- Actions du modal -->
      <div class="modal-footer">
        <button @click="$emit('close')" class="btn-secondary">
          {{ t('common.close') }}
        </button>
        <div class="action-buttons">
          <button @click="handleEdit" class="btn-primary">
            <i class="fas fa-edit"></i>
            {{ t('widgets.calendar.editEvent') }}
          </button>
          <button @click="handleDelete" class="btn-danger">
            <i class="fas fa-trash"></i>
            {{ t('widgets.calendar.deleteEvent') }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useTranslation } from '@/composables/useTranslation'
import type { CalendarEvent, EventRecurrence } from '../types'

interface Props {
  event: CalendarEvent
}

interface Emits {
  (e: 'close'): void
  (e: 'edit', eventId: string): void
  (e: 'delete', eventId: string): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()
const { t } = useTranslation()

// Utilitaires
const formatDateTime = (dateStr: string, isAllDay: boolean) => {
  const date = new Date(dateStr)
  
  if (isAllDay) {
    return date.toLocaleDateString('fr-FR', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }
  
  return date.toLocaleDateString('fr-FR', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

const formatDate = (dateStr: string) => {
  return new Date(dateStr).toLocaleDateString('fr-FR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })
}

const getEventDuration = (event: CalendarEvent) => {
  const start = new Date(event.startDate)
  const end = new Date(event.endDate)
  const durationMs = end.getTime() - start.getTime()
  const durationMinutes = Math.floor(durationMs / (1000 * 60))
  
  if (durationMinutes < 60) {
    return `${durationMinutes} ${t('widgets.calendar.minutes')}`
  }
  
  const hours = Math.floor(durationMinutes / 60)
  const minutes = durationMinutes % 60
  
  if (minutes === 0) {
    return `${hours} ${t('widgets.calendar.hours')}`
  }
  
  return `${hours}h ${minutes}min`
}

const getEventColor = (event: CalendarEvent) => {
  const colors = {
    meeting: '#3B82F6',
    deadline: '#EF4444',
    milestone: '#10B981',
    task: '#F59E0B',
    reminder: '#8B5CF6'
  }
  return event.color || colors[event.type] || '#6B7280'
}

const isValidUrl = (string: string) => {
  try {
    new URL(string)
    return true
  } catch (_) {
    return false
  }
}

const getStatusIcon = (status: string) => {
  const icons = {
    accepted: 'fas fa-check',
    declined: 'fas fa-times',
    pending: 'fas fa-clock'
  }
  return icons[status] || 'fas fa-question'
}

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

const formatRecurrencePattern = (recurrence: EventRecurrence) => {
  const patterns = {
    daily: t('widgets.calendar.recurrencePatterns.daily'),
    weekly: t('widgets.calendar.recurrencePatterns.weekly'),
    monthly: t('widgets.calendar.recurrencePatterns.monthly'),
    yearly: t('widgets.calendar.recurrencePatterns.yearly')
  }
  
  let pattern = patterns[recurrence.type] || recurrence.type
  
  if (recurrence.interval > 1) {
    pattern = `${t('widgets.calendar.every')} ${recurrence.interval} ${pattern}`
  }
  
  return pattern
}

const getFileIcon = (type: string) => {
  const icons = {
    'application/pdf': 'fas fa-file-pdf',
    'application/msword': 'fas fa-file-word',
    'application/vnd.ms-excel': 'fas fa-file-excel',
    'application/vnd.ms-powerpoint': 'fas fa-file-powerpoint',
    'image/': 'fas fa-file-image',
    'video/': 'fas fa-file-video',
    'audio/': 'fas fa-file-audio'
  }
  
  for (const [key, icon] of Object.entries(icons)) {
    if (type.startsWith(key)) {
      return icon
    }
  }
  
  return 'fas fa-file'
}

const formatFileSize = (bytes: number) => {
  if (bytes === 0) return '0 B'
  
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

// Actions
const handleOverlayClick = () => {
  emit('close')
}

const handleEdit = () => {
  emit('edit', props.event.id)
}

const handleDelete = () => {
  if (confirm(t('widgets.calendar.confirmDeleteEvent'))) {
    emit('delete', props.event.id)
  }
}
</script>

<style scoped>
.modal-overlay {
  @apply fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4;
}

.modal-content {
  @apply bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-screen overflow-hidden flex flex-col;
}

.modal-header {
  @apply flex items-start justify-between p-6 border-b border-gray-200;
}

.header-info {
  @apply flex items-start gap-4;
}

.event-type-indicator {
  @apply w-1 h-16 rounded-full flex-shrink-0;
}

.modal-title {
  @apply text-xl font-semibold text-gray-900 m-0;
}

.event-meta {
  @apply flex items-center gap-2 mt-2;
}

.event-type-badge,
.priority-badge,
.status-badge {
  @apply px-2 py-1 text-xs font-medium rounded-full;
}

.badge-meeting {
  @apply bg-blue-100 text-blue-800;
}

.badge-deadline {
  @apply bg-red-100 text-red-800;
}

.badge-milestone {
  @apply bg-green-100 text-green-800;
}

.badge-task {
  @apply bg-yellow-100 text-yellow-800;
}

.badge-reminder {
  @apply bg-purple-100 text-purple-800;
}

.priority-urgent {
  @apply bg-red-100 text-red-800;
}

.priority-high {
  @apply bg-orange-100 text-orange-800;
}

.priority-low {
  @apply bg-gray-100 text-gray-800;
}

.status-confirmed {
  @apply bg-green-100 text-green-800;
}

.status-tentative {
  @apply bg-yellow-100 text-yellow-800;
}

.status-cancelled {
  @apply bg-red-100 text-red-800;
}

.header-actions {
  @apply flex items-center gap-2;
}

.action-btn {
  @apply p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors;
}

.delete-btn {
  @apply hover:text-red-600 hover:bg-red-50;
}

.close-btn {
  @apply p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors;
}

.modal-body {
  @apply flex-1 overflow-y-auto p-6 space-y-6;
}

.detail-section {
  @apply space-y-3;
}

.section-header {
  @apply flex items-center gap-2;
}

.section-title {
  @apply text-lg font-medium text-gray-900 m-0;
}

.section-content {
  @apply ml-6;
}

.datetime-info {
  @apply space-y-2;
}

.datetime-item {
  @apply flex items-center gap-3;
}

.datetime-label {
  @apply text-sm font-medium text-gray-600 w-20;
}

.datetime-value {
  @apply text-sm text-gray-900;
}

.description-text {
  @apply text-gray-700 leading-relaxed;
}

.location-info {
  @apply flex items-center gap-3;
}

.location-text {
  @apply text-gray-900;
}

.location-link {
  @apply text-blue-600 hover:text-blue-800 transition-colors flex items-center gap-1;
}

.attendees-list {
  @apply space-y-3;
}

.attendee-item {
  @apply flex items-center gap-3;
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
  @apply font-medium text-gray-900 flex items-center gap-2;
}

.organizer-badge {
  @apply px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded-full;
}

.attendee-email {
  @apply text-sm text-gray-600;
}

.attendee-status {
  @apply flex items-center;
}

.status-indicator {
  @apply w-6 h-6 rounded-full flex items-center justify-center;
}

.status-accepted {
  @apply bg-green-100 text-green-600;
}

.status-declined {
  @apply bg-red-100 text-red-600;
}

.status-pending {
  @apply bg-yellow-100 text-yellow-600;
}

.tags-list {
  @apply flex flex-wrap gap-2;
}

.tag-item {
  @apply px-3 py-1 bg-gray-100 text-gray-800 rounded-full text-sm;
}

.reminders-list {
  @apply space-y-2;
}

.reminder-item {
  @apply flex items-center gap-3 p-3 bg-gray-50 rounded-lg;
}

.reminder-item.inactive {
  @apply opacity-50;
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

.reminder-status .status-indicator.active {
  @apply bg-green-100 text-green-600;
}

.reminder-status .status-indicator:not(.active) {
  @apply bg-red-100 text-red-600;
}

.recurrence-info {
  @apply space-y-1;
}

.recurrence-pattern {
  @apply font-medium text-gray-900;
}

.recurrence-end {
  @apply text-sm text-gray-600;
}

.attachments-list {
  @apply space-y-2;
}

.attachment-item {
  @apply flex items-center gap-3 p-3 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors;
}

.attachment-icon {
  @apply w-8 h-8 bg-gray-200 text-gray-600 rounded flex items-center justify-center;
}

.attachment-info {
  @apply flex-1;
}

.attachment-name {
  @apply font-medium text-gray-900;
}

.attachment-size {
  @apply text-sm text-gray-600;
}

.attachment-action {
  @apply text-blue-600;
}

.metadata-grid {
  @apply grid grid-cols-1 md:grid-cols-2 gap-3;
}

.metadata-item {
  @apply flex flex-col gap-1;
}

.metadata-label {
  @apply text-sm font-medium text-gray-600;
}

.metadata-value {
  @apply text-sm text-gray-900;
}

.metadata-link {
  @apply text-blue-600 hover:text-blue-800 transition-colors flex items-center gap-1;
}

.modal-footer {
  @apply flex items-center justify-between p-6 border-t border-gray-200;
}

.action-buttons {
  @apply flex items-center gap-3;
}

.btn-secondary {
  @apply px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors;
}

.btn-primary {
  @apply px-4 py-2 bg-blue-600 text-white hover:bg-blue-700 rounded-lg transition-colors flex items-center gap-2;
}

.btn-danger {
  @apply px-4 py-2 bg-red-600 text-white hover:bg-red-700 rounded-lg transition-colors flex items-center gap-2;
}
</style>