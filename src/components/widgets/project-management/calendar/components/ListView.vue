<template>
  <div class="list-view">
    <!-- Filtres et tri -->
    <div class="list-controls">
      <div class="search-box">
        <i class="fas fa-search"></i>
        <input 
          v-model="searchQuery"
          type="text"
          :placeholder="t('widgets.calendar.searchEvents')"
          class="search-input"
        />
      </div>
      
      <div class="sort-controls">
        <select v-model="sortBy" class="sort-select">
          <option value="startDate">{{ t('widgets.calendar.sortByDate') }}</option>
          <option value="title">{{ t('widgets.calendar.sortByTitle') }}</option>
          <option value="type">{{ t('widgets.calendar.sortByType') }}</option>
          <option value="priority">{{ t('widgets.calendar.sortByPriority') }}</option>
        </select>
        
        <button 
          @click="toggleSortOrder"
          class="sort-order-btn"
          :title="sortOrder === 'asc' ? t('widgets.calendar.ascending') : t('widgets.calendar.descending')"
        >
          <i :class="sortOrder === 'asc' ? 'fas fa-sort-up' : 'fas fa-sort-down'"></i>
        </button>
      </div>
    </div>
    
    <!-- Liste des événements groupés par date -->
    <div class="events-list">
      <div 
        v-for="group in groupedEvents" 
        :key="group.date"
        class="date-group"
      >
        <div class="date-header">
          <h3 class="date-title">{{ formatDateHeader(group.date) }}</h3>
          <span class="events-count">
            {{ group.events.length }} {{ t('widgets.calendar.events') }}
          </span>
        </div>
        
        <div class="events-container">
          <div 
            v-for="event in group.events" 
            :key="event.id"
            class="event-item"
            :class="{
              'event-past': isPastEvent(event),
              'event-today': isTodayEvent(event),
              'event-upcoming': isUpcomingEvent(event)
            }"
            @click="handleEventClick(event)"
          >
            <!-- Indicateur de type d'événement -->
            <div 
              class="event-indicator"
              :class="`indicator-${event.type}`"
              :style="{ backgroundColor: getEventColor(event) }"
            ></div>
            
            <!-- Contenu de l'événement -->
            <div class="event-content">
              <div class="event-header">
                <h4 class="event-title">{{ event.title }}</h4>
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
              
              <div class="event-details">
                <div class="event-time">
                  <i class="fas fa-clock"></i>
                  <span v-if="event.isAllDay">
                    {{ t('widgets.calendar.allDay') }}
                  </span>
                  <span v-else>
                    {{ formatEventTime(event) }}
                  </span>
                </div>
                
                <div v-if="event.location" class="event-location">
                  <i class="fas fa-map-marker-alt"></i>
                  <span>{{ event.location }}</span>
                </div>
                
                <div v-if="event.attendees.length > 0" class="event-attendees">
                  <i class="fas fa-users"></i>
                  <div class="attendees-list">
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
                </div>
                
                <div v-if="event.description" class="event-description">
                  <p>{{ truncateText(event.description, 100) }}</p>
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
            
            <!-- Actions -->
            <div class="event-actions">
              <button 
                @click.stop="handleQuickEdit(event)"
                class="action-btn"
                :title="t('widgets.calendar.quickEdit')"
              >
                <i class="fas fa-edit"></i>
              </button>
              <button 
                @click.stop="handleEventClick(event)"
                class="action-btn"
                :title="t('widgets.calendar.viewDetails')"
              >
                <i class="fas fa-eye"></i>
              </button>
            </div>
          </div>
        </div>
      </div>
      
      <!-- Message si aucun événement -->
      <div v-if="filteredEvents.length === 0" class="no-events">
        <div class="no-events-icon">
          <i class="fas fa-calendar-times"></i>
        </div>
        <h3>{{ t('widgets.calendar.noEvents') }}</h3>
        <p>{{ t('widgets.calendar.noEventsDescription') }}</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useTranslation } from '@/composables/useTranslation'
import type { CalendarEvent } from '../types'

interface Props {
  events: CalendarEvent[]
  currentDate: Date
}

interface Emits {
  (e: 'event-click', event: CalendarEvent): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()
const { t } = useTranslation()

// États locaux
const searchQuery = ref('')
const sortBy = ref<'startDate' | 'title' | 'type' | 'priority'>('startDate')
const sortOrder = ref<'asc' | 'desc'>('asc')

// Événements filtrés et triés
const filteredEvents = computed(() => {
  let filtered = props.events
  
  // Filtrage par recherche
  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase()
    filtered = filtered.filter(event => 
      event.title.toLowerCase().includes(query) ||
      event.description?.toLowerCase().includes(query) ||
      event.location?.toLowerCase().includes(query) ||
      event.tags.some(tag => tag.toLowerCase().includes(query))
    )
  }
  
  // Tri
  filtered.sort((a, b) => {
    let comparison = 0
    
    switch (sortBy.value) {
      case 'startDate':
        comparison = new Date(a.startDate).getTime() - new Date(b.startDate).getTime()
        break
      case 'title':
        comparison = a.title.localeCompare(b.title)
        break
      case 'type':
        comparison = a.type.localeCompare(b.type)
        break
      case 'priority':
        const priorityOrder = { urgent: 4, high: 3, medium: 2, low: 1 }
        comparison = priorityOrder[a.priority] - priorityOrder[b.priority]
        break
    }
    
    return sortOrder.value === 'asc' ? comparison : -comparison
  })
  
  return filtered
})

// Événements groupés par date
const groupedEvents = computed(() => {
  const groups = new Map<string, CalendarEvent[]>()
  
  filteredEvents.value.forEach(event => {
    const date = new Date(event.startDate).toISOString().split('T')[0]
    if (!groups.has(date)) {
      groups.set(date, [])
    }
    groups.get(date)!.push(event)
  })
  
  return Array.from(groups.entries())
    .map(([date, events]) => ({ date, events }))
    .sort((a, b) => a.date.localeCompare(b.date))
})

// Utilitaires
const formatDateHeader = (dateStr: string) => {
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

const formatEventTime = (event: CalendarEvent) => {
  const start = new Date(event.startDate)
  const end = new Date(event.endDate)
  
  if (event.isAllDay) {
    return t('widgets.calendar.allDay')
  }
  
  const startTime = start.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })
  const endTime = end.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })
  
  return `${startTime} - ${endTime}`
}

const truncateText = (text: string, maxLength: number) => {
  if (text.length <= maxLength) return text
  return text.substring(0, maxLength) + '...'
}

const isPastEvent = (event: CalendarEvent) => {
  return new Date(event.endDate) < new Date()
}

const isTodayEvent = (event: CalendarEvent) => {
  const today = new Date().toISOString().split('T')[0]
  const eventDate = new Date(event.startDate).toISOString().split('T')[0]
  return eventDate === today
}

const isUpcomingEvent = (event: CalendarEvent) => {
  return new Date(event.startDate) > new Date()
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
const toggleSortOrder = () => {
  sortOrder.value = sortOrder.value === 'asc' ? 'desc' : 'asc'
}

const handleEventClick = (event: CalendarEvent) => {
  emit('event-click', event)
}

const handleQuickEdit = (event: CalendarEvent) => {
  // TODO: Implémenter l'édition rapide
  console.log('Quick edit:', event)
}
</script>

<style scoped>
.list-view {
  @apply space-y-4;
}

.list-controls {
  @apply flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 p-4 bg-gray-50 rounded-lg;
}

.search-box {
  @apply relative flex-1 max-w-md;
}

.search-box i {
  @apply absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400;
}

.search-input {
  @apply w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent;
}

.sort-controls {
  @apply flex items-center gap-2;
}

.sort-select {
  @apply border border-gray-300 rounded-lg px-3 py-2 bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent;
}

.sort-order-btn {
  @apply p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors;
}

.events-list {
  @apply space-y-6;
}

.date-group {
  @apply space-y-3;
}

.date-header {
  @apply flex items-center justify-between;
}

.date-title {
  @apply text-lg font-semibold text-gray-900 m-0;
}

.events-count {
  @apply text-sm text-gray-500;
}

.events-container {
  @apply space-y-2;
}

.event-item {
  @apply flex items-start gap-4 p-4 bg-white border border-gray-200 rounded-lg cursor-pointer hover:shadow-md transition-shadow;
}

.event-item.event-past {
  @apply opacity-75;
}

.event-item.event-today {
  @apply border-blue-200 bg-blue-50;
}

.event-item.event-upcoming {
  @apply border-green-200;
}

.event-indicator {
  @apply w-1 h-16 rounded-full flex-shrink-0;
}

.event-content {
  @apply flex-1 space-y-2;
}

.event-header {
  @apply flex items-start justify-between gap-2;
}

.event-title {
  @apply text-lg font-medium text-gray-900 m-0;
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

.event-details {
  @apply space-y-2;
}

.event-time,
.event-location {
  @apply flex items-center gap-2 text-sm text-gray-600;
}

.event-attendees {
  @apply flex items-center gap-2;
}

.attendees-list {
  @apply flex items-center gap-1;
}

.attendee-avatar {
  @apply w-6 h-6 rounded-full overflow-hidden;
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

.event-description {
  @apply text-sm text-gray-600;
}

.event-tags {
  @apply flex items-center gap-1 flex-wrap;
}

.event-tag {
  @apply px-2 py-1 text-xs bg-gray-100 text-gray-700 rounded-full;
}

.more-tags {
  @apply text-xs text-gray-500;
}

.event-actions {
  @apply flex items-center gap-1;
}

.action-btn {
  @apply p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors;
}

.no-events {
  @apply text-center py-12;
}

.no-events-icon {
  @apply text-4xl text-gray-300 mb-4;
}

.no-events h3 {
  @apply text-lg font-medium text-gray-900 mb-2;
}

.no-events p {
  @apply text-gray-500;
}
</style>