<template>
  <div class="modal-overlay" @click="handleOverlayClick">
    <div class="modal-content" @click.stop>
      <!-- En-tête du modal -->
      <div class="modal-header">
        <div class="header-info">
          <h3 class="modal-title">{{ formatDate(date) }}</h3>
          <span class="events-count">
            {{ events.length }} {{ t('widgets.calendar.events') }}
          </span>
        </div>
        <button @click="$emit('close')" class="close-btn">
          <i class="fas fa-times"></i>
        </button>
      </div>
      
      <!-- Liste des événements -->
      <div class="modal-body">
        <div v-if="events.length === 0" class="no-events">
          <div class="no-events-icon">
            <i class="fas fa-calendar-times"></i>
          </div>
          <p>{{ t('widgets.calendar.noEventsThisDay') }}</p>
        </div>
        
        <div v-else class="events-list">
          <!-- Événements toute la journée -->
          <div v-if="allDayEvents.length > 0" class="event-section">
            <h4 class="section-title">
              <i class="fas fa-sun"></i>
              {{ t('widgets.calendar.allDay') }}
            </h4>
            <div class="events-group">
              <div 
                v-for="event in allDayEvents" 
                :key="event.id"
                class="event-item all-day-event"
                :class="`event-${event.type}`"
                :style="{ borderLeftColor: getEventColor(event) }"
                @click="handleEventClick(event)"
              >
                <div class="event-content">
                  <div class="event-header">
                    <h5 class="event-title">{{ event.title }}</h5>
                    <span 
                      class="event-type-badge"
                      :class="`badge-${event.type}`"
                    >
                      {{ t(`widgets.calendar.eventTypes.${event.type}`) }}
                    </span>
                  </div>
                  
                  <div v-if="event.description" class="event-description">
                    {{ truncateText(event.description, 80) }}
                  </div>
                  
                  <div class="event-meta">
                    <span v-if="event.location" class="meta-item">
                      <i class="fas fa-map-marker-alt"></i>
                      {{ event.location }}
                    </span>
                    <span v-if="event.attendees.length > 0" class="meta-item">
                      <i class="fas fa-users"></i>
                      {{ event.attendees.length }} {{ t('widgets.calendar.attendees') }}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          <!-- Événements avec horaire -->
          <div v-if="timedEvents.length > 0" class="event-section">
            <h4 class="section-title">
              <i class="fas fa-clock"></i>
              {{ t('widgets.calendar.scheduled') }}
            </h4>
            <div class="events-group">
              <div 
                v-for="event in sortedTimedEvents" 
                :key="event.id"
                class="event-item timed-event"
                :class="`event-${event.type}`"
                :style="{ borderLeftColor: getEventColor(event) }"
                @click="handleEventClick(event)"
              >
                <div class="event-time-indicator">
                  <div class="time-start">{{ formatTime(event.startDate) }}</div>
                  <div class="time-duration">{{ getEventDuration(event) }}</div>
                </div>
                
                <div class="event-content">
                  <div class="event-header">
                    <h5 class="event-title">{{ event.title }}</h5>
                    <div class="event-badges">
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
                    </div>
                  </div>
                  
                  <div v-if="event.description" class="event-description">
                    {{ truncateText(event.description, 80) }}
                  </div>
                  
                  <div class="event-meta">
                    <span v-if="event.location" class="meta-item">
                      <i class="fas fa-map-marker-alt"></i>
                      {{ event.location }}
                    </span>
                    <span v-if="event.attendees.length > 0" class="meta-item">
                      <i class="fas fa-users"></i>
                      <div class="attendees-preview">
                        <div 
                          v-for="attendee in event.attendees.slice(0, 3)" 
                          :key="attendee.id"
                          class="attendee-avatar"
                          :title="attendee.name"
                        >
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
                        <span v-if="event.attendees.length > 3" class="more-attendees">
                          +{{ event.attendees.length - 3 }}
                        </span>
                      </div>
                    </span>
                  </div>
                  
                  <div v-if="event.tags.length > 0" class="event-tags">
                    <span 
                      v-for="tag in event.tags.slice(0, 3)" 
                      :key="tag"
                      class="event-tag"
                    >
                      {{ tag }}
                    </span>
                    <span v-if="event.tags.length > 3" class="more-tags">
                      +{{ event.tags.length - 3 }}
                    </span>
                  </div>
                </div>
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
        <button @click="addNewEvent" class="btn-primary">
          <i class="fas fa-plus"></i>
          {{ t('widgets.calendar.addEvent') }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useTranslation } from '@/composables/useTranslation'
import type { CalendarEvent } from '../types'

interface Props {
  date?: string
  events: CalendarEvent[]
}

interface Emits {
  (e: 'close'): void
  (e: 'event-click', event: CalendarEvent): void
  (e: 'add-event', date: string): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()
const { t } = useTranslation()

// Événements toute la journée
const allDayEvents = computed(() => {
  return props.events.filter(event => event.isAllDay)
})

// Événements avec horaire
const timedEvents = computed(() => {
  return props.events.filter(event => !event.isAllDay)
})

// Événements avec horaire triés par heure de début
const sortedTimedEvents = computed(() => {
  return [...timedEvents.value].sort((a, b) => {
    return new Date(a.startDate).getTime() - new Date(b.startDate).getTime()
  })
})

// Utilitaires
const formatDate = (dateStr?: string) => {
  if (!dateStr) return ''
  
  const date = new Date(dateStr)
  const today = new Date()
  const tomorrow = new Date(today)
  tomorrow.setDate(today.getDate() + 1)
  const yesterday = new Date(today)
  yesterday.setDate(today.getDate() - 1)
  
  const dateOnly = dateStr
  const todayStr = today.toISOString().split('T')[0]
  const tomorrowStr = tomorrow.toISOString().split('T')[0]
  const yesterdayStr = yesterday.toISOString().split('T')[0]
  
  if (dateOnly === todayStr) {
    return t('widgets.calendar.today')
  } else if (dateOnly === tomorrowStr) {
    return t('widgets.calendar.tomorrow')
  } else if (dateOnly === yesterdayStr) {
    return t('widgets.calendar.yesterday')
  }
  
  return date.toLocaleDateString('fr-FR', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })
}

const formatTime = (dateStr: string) => {
  return new Date(dateStr).toLocaleTimeString('fr-FR', {
    hour: '2-digit',
    minute: '2-digit'
  })
}

const getEventDuration = (event: CalendarEvent) => {
  const start = new Date(event.startDate)
  const end = new Date(event.endDate)
  const durationMs = end.getTime() - start.getTime()
  const durationMinutes = Math.floor(durationMs / (1000 * 60))
  
  if (durationMinutes < 60) {
    return `${durationMinutes}min`
  }
  
  const hours = Math.floor(durationMinutes / 60)
  const minutes = durationMinutes % 60
  
  if (minutes === 0) {
    return `${hours}h`
  }
  
  return `${hours}h${minutes.toString().padStart(2, '0')}`
}

const truncateText = (text: string, maxLength: number) => {
  if (text.length <= maxLength) return text
  return text.substring(0, maxLength) + '...'
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

// Actions
const handleOverlayClick = () => {
  emit('close')
}

const handleEventClick = (event: CalendarEvent) => {
  emit('event-click', event)
}

const addNewEvent = () => {
  if (props.date) {
    emit('add-event', props.date)
  }
  emit('close')
}
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

.header-info {
  @apply flex items-center gap-3;
}

.modal-title {
  @apply text-xl font-semibold text-gray-900 m-0;
}

.events-count {
  @apply text-sm text-gray-500 bg-gray-100 px-2 py-1 rounded-full;
}

.close-btn {
  @apply p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors;
}

.modal-body {
  @apply flex-1 overflow-y-auto p-6;
}

.no-events {
  @apply text-center py-8;
}

.no-events-icon {
  @apply text-3xl text-gray-300 mb-3;
}

.events-list {
  @apply space-y-6;
}

.event-section {
  @apply space-y-3;
}

.section-title {
  @apply flex items-center gap-2 text-lg font-medium text-gray-900 m-0;
}

.events-group {
  @apply space-y-3;
}

.event-item {
  @apply p-4 bg-gray-50 border-l-4 rounded-r-lg cursor-pointer hover:bg-gray-100 transition-colors;
}

.all-day-event {
  @apply bg-blue-50 hover:bg-blue-100;
}

.timed-event {
  @apply flex gap-4;
}

.event-time-indicator {
  @apply flex-shrink-0 text-center;
}

.time-start {
  @apply text-lg font-semibold text-gray-900;
}

.time-duration {
  @apply text-xs text-gray-500;
}

.event-content {
  @apply flex-1 space-y-2;
}

.event-header {
  @apply flex items-start justify-between gap-2;
}

.event-title {
  @apply text-base font-medium text-gray-900 m-0;
}

.event-badges {
  @apply flex items-center gap-2;
}

.event-type-badge {
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

.priority-badge {
  @apply px-2 py-1 text-xs font-medium rounded-full;
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

.event-description {
  @apply text-sm text-gray-600;
}

.event-meta {
  @apply flex items-center gap-4 text-sm text-gray-500;
}

.meta-item {
  @apply flex items-center gap-1;
}

.attendees-preview {
  @apply flex items-center gap-1;
}

.attendee-avatar {
  @apply w-5 h-5 rounded-full overflow-hidden;
}

.avatar-img {
  @apply w-full h-full object-cover;
}

.avatar-placeholder {
  @apply w-full h-full bg-gray-300 text-gray-600 text-xs flex items-center justify-center font-medium;
}

.more-attendees {
  @apply text-xs text-gray-500;
}

.event-tags {
  @apply flex items-center gap-1 flex-wrap;
}

.event-tag {
  @apply px-2 py-1 text-xs bg-gray-200 text-gray-700 rounded-full;
}

.more-tags {
  @apply text-xs text-gray-500;
}

.modal-footer {
  @apply flex items-center justify-end gap-3 p-6 border-t border-gray-200;
}

.btn-secondary {
  @apply px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors;
}

.btn-primary {
  @apply px-4 py-2 bg-blue-600 text-white hover:bg-blue-700 rounded-lg transition-colors flex items-center gap-2;
}
</style>