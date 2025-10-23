<template>
  <div class="day-view">
    <!-- En-tête du jour -->
    <div class="day-header">
      <div class="day-info">
        <h3 class="day-title">{{ dayTitle }}</h3>
        <div class="day-stats">
          <span class="stat-item">
            <i class="fas fa-calendar-check"></i>
            {{ dayEvents.length }} {{ t('widgets.calendar.events') }}
          </span>
          <span v-if="allDayEvents.length > 0" class="stat-item">
            <i class="fas fa-clock"></i>
            {{ allDayEvents.length }} {{ t('widgets.calendar.allDay') }}
          </span>
        </div>
      </div>
    </div>
    
    <!-- Événements toute la journée -->
    <div v-if="allDayEvents.length > 0" class="all-day-section">
      <div class="all-day-header">
        <span class="all-day-label">{{ t('widgets.calendar.allDay') }}</span>
      </div>
      <div class="all-day-events">
        <div 
          v-for="event in allDayEvents" 
          :key="event.id"
          class="all-day-event"
          :class="`event-${event.type}`"
          :style="{ backgroundColor: getEventColor(event) }"
          @click="handleEventClick(event)"
        >
          <div class="event-content">
            <div class="event-title">{{ event.title }}</div>
            <div v-if="event.location" class="event-location">
              <i class="fas fa-map-marker-alt"></i>
              {{ event.location }}
            </div>
          </div>
        </div>
      </div>
    </div>
    
    <!-- Grille horaire -->
    <div class="time-grid">
      <!-- Colonne des heures -->
      <div class="time-column">
        <div 
          v-for="hour in hours" 
          :key="hour"
          class="time-slot"
        >
          <span class="hour-label">{{ formatHour(hour) }}</span>
          <span class="half-hour-mark"></span>
        </div>
      </div>
      
      <!-- Colonne des événements -->
      <div class="events-column">
        <div 
          v-for="hour in hours" 
          :key="hour"
          class="hour-block"
        >
          <!-- Slot pour la première demi-heure -->
          <div 
            class="time-slot-block"
            @click="handleTimeSlotClick(hour, 0)"
          >
            <!-- Événements de cette demi-heure -->
            <div 
              v-for="event in getEventsForTimeSlot(hour, 0)" 
              :key="event.id"
              class="day-event"
              :class="`event-${event.type}`"
              :style="{
                backgroundColor: getEventColor(event),
                height: getEventHeight(event) + 'px',
                top: getEventTop(event) + 'px',
                left: getEventLeft(event, getEventsForTimeSlot(hour, 0)) + 'px',
                width: getEventWidth(getEventsForTimeSlot(hour, 0)) + 'px'
              }"
              @click.stop="handleEventClick(event)"
            >
              <div class="event-content">
                <div class="event-title">{{ event.title }}</div>
                <div class="event-time">{{ formatEventTime(event) }}</div>
                <div v-if="event.location" class="event-location">
                  <i class="fas fa-map-marker-alt"></i>
                  {{ event.location }}
                </div>
                <div v-if="event.attendees.length > 0" class="event-attendees">
                  <i class="fas fa-users"></i>
                  {{ event.attendees.length }}
                </div>
              </div>
            </div>
          </div>
          
          <!-- Slot pour la deuxième demi-heure -->
          <div 
            class="time-slot-block"
            @click="handleTimeSlotClick(hour, 30)"
          >
            <!-- Événements de cette demi-heure -->
            <div 
              v-for="event in getEventsForTimeSlot(hour, 30)" 
              :key="event.id"
              class="day-event"
              :class="`event-${event.type}`"
              :style="{
                backgroundColor: getEventColor(event),
                height: getEventHeight(event) + 'px',
                top: getEventTop(event) + 'px'
              }"
              @click.stop="handleEventClick(event)"
            >
              <div class="event-content">
                <div class="event-title">{{ event.title }}</div>
                <div class="event-time">{{ formatEventTime(event) }}</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    
    <!-- Ligne de l'heure actuelle -->
    <div 
      v-if="showCurrentTimeLine"
      class="current-time-line"
      :style="{ top: currentTimePosition + 'px' }"
    >
      <div class="current-time-indicator">
        <span class="current-time-label">{{ currentTimeLabel }}</span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useTranslation } from '@/composables/useTranslation'
import type { CalendarEvent } from '../types'

interface Props {
  currentDate: Date
  events: CalendarEvent[]
}

interface Emits {
  (e: 'event-click', event: CalendarEvent): void
  (e: 'time-slot-click', date: string, time: string): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()
const { t } = useTranslation()

// États locaux
const currentTime = ref(new Date())
let timeInterval: NodeJS.Timeout | null = null

// Heures de la journée (de 0 à 23)
const hours = Array.from({ length: 24 }, (_, i) => i)

// Titre du jour
const dayTitle = computed(() => {
  return props.currentDate.toLocaleDateString('fr-FR', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })
})

// Événements du jour
const dayEvents = computed(() => {
  const dateStr = props.currentDate.toISOString().split('T')[0]
  return props.events.filter(event => {
    const eventDate = new Date(event.startDate).toISOString().split('T')[0]
    return eventDate === dateStr
  })
})

// Événements toute la journée
const allDayEvents = computed(() => {
  return dayEvents.value.filter(event => event.isAllDay)
})

// Événements avec horaire
const timedEvents = computed(() => {
  return dayEvents.value.filter(event => !event.isAllDay)
})

// Position de la ligne de temps actuelle
const currentTimePosition = computed(() => {
  const now = currentTime.value
  const hours = now.getHours()
  const minutes = now.getMinutes()
  const allDayHeight = allDayEvents.value.length > 0 ? 80 : 0
  const headerHeight = 100 + allDayHeight
  const hourHeight = 120 // 60px par demi-heure
  
  return headerHeight + (hours * hourHeight) + (minutes * hourHeight / 60)
})

// Label de l'heure actuelle
const currentTimeLabel = computed(() => {
  return currentTime.value.toLocaleTimeString('fr-FR', {
    hour: '2-digit',
    minute: '2-digit'
  })
})

// Afficher la ligne de temps actuelle seulement si c'est aujourd'hui
const showCurrentTimeLine = computed(() => {
  const today = new Date()
  const currentDateStr = props.currentDate.toISOString().split('T')[0]
  const todayStr = today.toISOString().split('T')[0]
  
  return currentDateStr === todayStr
})

// Utilitaires
const formatHour = (hour: number) => {
  return `${hour.toString().padStart(2, '0')}:00`
}

const formatEventTime = (event: CalendarEvent) => {
  if (event.isAllDay) {
    return t('widgets.calendar.allDay')
  }
  
  const start = new Date(event.startDate)
  const end = new Date(event.endDate)
  
  return `${start.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })} - ${end.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}`
}

const getEventsForTimeSlot = (hour: number, minutes: number) => {
  const slotStart = hour * 60 + minutes
  const slotEnd = slotStart + 30
  
  return timedEvents.value.filter(event => {
    const eventStart = new Date(event.startDate)
    const eventEnd = new Date(event.endDate)
    
    const eventStartMinutes = eventStart.getHours() * 60 + eventStart.getMinutes()
    const eventEndMinutes = eventEnd.getHours() * 60 + eventEnd.getMinutes()
    
    return eventStartMinutes < slotEnd && eventEndMinutes > slotStart
  })
}

const getEventHeight = (event: CalendarEvent) => {
  const start = new Date(event.startDate)
  const end = new Date(event.endDate)
  const durationMs = end.getTime() - start.getTime()
  const durationMinutes = durationMs / (1000 * 60)
  
  return Math.max(30, (durationMinutes * 120) / 60) // 120px par heure, minimum 30px
}

const getEventTop = (event: CalendarEvent) => {
  const start = new Date(event.startDate)
  const minutes = start.getMinutes()
  
  return (minutes * 120) / 60 // Position basée sur les minutes dans l'heure
}

const getEventLeft = (event: CalendarEvent, overlappingEvents: CalendarEvent[]) => {
  const index = overlappingEvents.findIndex(e => e.id === event.id)
  const totalEvents = overlappingEvents.length
  
  if (totalEvents === 1) return 0
  
  return (index * 200) / totalEvents // Répartir les événements qui se chevauchent
}

const getEventWidth = (overlappingEvents: CalendarEvent[]) => {
  const totalEvents = overlappingEvents.length
  if (totalEvents === 1) return 200
  
  return Math.max(150, 200 / totalEvents) // Largeur minimale de 150px
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

// Gestion des clics
const handleTimeSlotClick = (hour: number, minutes: number) => {
  const dateStr = props.currentDate.toISOString().split('T')[0]
  const time = `${hour.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`
  emit('time-slot-click', dateStr, time)
}

const handleEventClick = (event: CalendarEvent) => {
  emit('event-click', event)
}

// Mise à jour de l'heure actuelle
onMounted(() => {
  timeInterval = setInterval(() => {
    currentTime.value = new Date()
  }, 60000) // Mise à jour chaque minute
})

onUnmounted(() => {
  if (timeInterval) {
    clearInterval(timeInterval)
  }
})
</script>

<style scoped>
.day-view {
  @apply relative overflow-auto max-h-screen;
}

.day-header {
  @apply p-4 border-b border-gray-200 bg-white sticky top-0 z-10;
}

.day-title {
  @apply text-xl font-semibold text-gray-900 m-0;
}

.day-stats {
  @apply flex items-center gap-4 mt-2;
}

.stat-item {
  @apply flex items-center gap-1 text-sm text-gray-600;
}

.all-day-section {
  @apply border-b border-gray-200 bg-gray-50;
}

.all-day-header {
  @apply p-2 border-b border-gray-200;
}

.all-day-label {
  @apply text-sm font-medium text-gray-700;
}

.all-day-events {
  @apply p-2 space-y-1;
}

.all-day-event {
  @apply p-2 rounded text-white cursor-pointer hover:opacity-80 transition-opacity;
}

.time-grid {
  @apply grid grid-cols-12;
}

.time-column {
  @apply col-span-2 border-r border-gray-200;
}

.time-slot {
  @apply h-30 p-2 border-b border-gray-100 relative;
}

.hour-label {
  @apply text-sm text-gray-500 font-medium;
}

.half-hour-mark {
  @apply absolute left-0 right-0 top-1/2 h-px bg-gray-200;
}

.events-column {
  @apply col-span-10 relative;
}

.hour-block {
  @apply h-30 border-b border-gray-100 relative;
}

.time-slot-block {
  @apply h-15 cursor-pointer hover:bg-gray-50 transition-colors relative;
}

.day-event {
  @apply absolute rounded text-white text-sm p-2 cursor-pointer hover:opacity-80 transition-opacity z-20 shadow-sm;
}

.event-content {
  @apply space-y-1;
}

.event-title {
  @apply font-medium truncate;
}

.event-time {
  @apply text-xs opacity-75;
}

.event-location {
  @apply text-xs opacity-75 flex items-center gap-1;
}

.event-attendees {
  @apply text-xs opacity-75 flex items-center gap-1;
}

.current-time-line {
  @apply absolute left-0 right-0 z-30 pointer-events-none;
}

.current-time-indicator {
  @apply h-0.5 bg-red-500 relative;
}

.current-time-indicator::before {
  content: '';
  @apply absolute left-0 top-0 w-2 h-2 bg-red-500 rounded-full transform -translate-y-1/2;
}

.current-time-label {
  @apply absolute right-2 top-0 transform -translate-y-1/2 bg-red-500 text-white text-xs px-2 py-1 rounded;
}

.event-meeting {
  @apply bg-blue-500;
}

.event-deadline {
  @apply bg-red-500;
}

.event-milestone {
  @apply bg-green-500;
}

.event-task {
  @apply bg-yellow-500;
}

.event-reminder {
  @apply bg-purple-500;
}
</style>