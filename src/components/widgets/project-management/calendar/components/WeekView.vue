<template>
  <div class="week-view">
    <!-- En-tête avec les jours de la semaine -->
    <div class="week-header">
      <div class="time-column-header"></div>
      <div 
        v-for="day in weekDays" 
        :key="day.date"
        class="day-header"
        :class="{
          'today': day.isToday,
          'weekend': day.isWeekend
        }"
      >
        <div class="day-name">{{ day.dayName }}</div>
        <div class="day-number">{{ day.dayNumber }}</div>
      </div>
    </div>
    
    <!-- Grille horaire -->
    <div class="week-grid">
      <!-- Colonne des heures -->
      <div class="time-column">
        <div 
          v-for="hour in hours" 
          :key="hour"
          class="time-slot"
        >
          {{ formatHour(hour) }}
        </div>
      </div>
      
      <!-- Colonnes des jours -->
      <div class="days-grid">
        <div 
          v-for="day in weekDays" 
          :key="day.date"
          class="day-column"
          :class="{
            'today': day.isToday,
            'weekend': day.isWeekend
          }"
        >
          <!-- Slots horaires -->
          <div 
            v-for="hour in hours" 
            :key="hour"
            class="hour-slot"
            @click="handleTimeSlotClick(day.date, hour)"
          >
            <!-- Événements de cette heure -->
            <div 
              v-for="event in getEventsForHour(day.date, hour)" 
              :key="event.id"
              class="week-event"
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
                <div class="event-time">
                  {{ formatEventTime(event) }}
                </div>
                <div v-if="event.location" class="event-location">
                  <i class="fas fa-map-marker-alt"></i>
                  {{ event.location }}
                </div>
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
      <div class="current-time-indicator"></div>
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

// Jours de la semaine
const weekDays = computed(() => {
  const startOfWeek = getStartOfWeek(props.currentDate)
  const today = new Date()
  const days = []
  
  for (let i = 0; i < 7; i++) {
    const date = new Date(startOfWeek)
    date.setDate(startOfWeek.getDate() + i)
    
    const dateStr = date.toISOString().split('T')[0]
    const todayStr = today.toISOString().split('T')[0]
    
    days.push({
      date: dateStr,
      dayName: date.toLocaleDateString('fr-FR', { weekday: 'short' }),
      dayNumber: date.getDate(),
      isToday: dateStr === todayStr,
      isWeekend: date.getDay() === 0 || date.getDay() === 6
    })
  }
  
  return days
})

// Position de la ligne de temps actuelle
const currentTimePosition = computed(() => {
  const now = currentTime.value
  const hours = now.getHours()
  const minutes = now.getMinutes()
  const headerHeight = 80 // Hauteur de l'en-tête
  const hourHeight = 60 // Hauteur d'une heure
  
  return headerHeight + (hours * hourHeight) + (minutes * hourHeight / 60)
})

// Afficher la ligne de temps actuelle seulement si c'est la semaine courante
const showCurrentTimeLine = computed(() => {
  const today = new Date()
  const startOfWeek = getStartOfWeek(props.currentDate)
  const endOfWeek = new Date(startOfWeek)
  endOfWeek.setDate(startOfWeek.getDate() + 6)
  
  return today >= startOfWeek && today <= endOfWeek
})

// Utilitaires
const getStartOfWeek = (date: Date) => {
  const d = new Date(date)
  const day = d.getDay()
  const diff = d.getDate() - day + (day === 0 ? -6 : 1) // Lundi comme premier jour
  return new Date(d.setDate(diff))
}

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

const getEventsForHour = (date: string, hour: number) => {
  return props.events.filter(event => {
    const eventDate = new Date(event.startDate).toISOString().split('T')[0]
    const eventHour = new Date(event.startDate).getHours()
    
    if (eventDate !== date) return false
    
    if (event.isAllDay) {
      return hour === 0 // Afficher les événements toute la journée à 00:00
    }
    
    const endHour = new Date(event.endDate).getHours()
    return eventHour <= hour && hour < endHour
  })
}

const getEventHeight = (event: CalendarEvent) => {
  if (event.isAllDay) {
    return 30 // Hauteur fixe pour les événements toute la journée
  }
  
  const start = new Date(event.startDate)
  const end = new Date(event.endDate)
  const durationMs = end.getTime() - start.getTime()
  const durationHours = durationMs / (1000 * 60 * 60)
  
  return Math.max(30, durationHours * 60) // Minimum 30px, 60px par heure
}

const getEventTop = (event: CalendarEvent) => {
  if (event.isAllDay) {
    return 5
  }
  
  const start = new Date(event.startDate)
  const minutes = start.getMinutes()
  
  return (minutes * 60) / 60 // Position basée sur les minutes
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
const handleTimeSlotClick = (date: string, hour: number) => {
  const time = `${hour.toString().padStart(2, '0')}:00`
  emit('time-slot-click', date, time)
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
.week-view {
  @apply relative overflow-auto max-h-96;
}

.week-header {
  @apply grid grid-cols-8 border-b border-gray-200 bg-white sticky top-0 z-10;
}

.time-column-header {
  @apply w-16 border-r border-gray-200;
}

.day-header {
  @apply p-3 text-center border-r border-gray-200;
}

.day-header.today {
  @apply bg-blue-50;
}

.day-header.weekend {
  @apply bg-gray-50;
}

.day-name {
  @apply text-sm font-medium text-gray-700;
}

.day-number {
  @apply text-lg font-semibold text-gray-900;
}

.day-header.today .day-number {
  @apply bg-blue-600 text-white rounded-full w-8 h-8 flex items-center justify-center mx-auto;
}

.week-grid {
  @apply grid grid-cols-8;
}

.time-column {
  @apply w-16 border-r border-gray-200;
}

.time-slot {
  @apply h-15 p-2 text-xs text-gray-500 border-b border-gray-100 text-right;
}

.days-grid {
  @apply grid grid-cols-7 col-span-7;
}

.day-column {
  @apply border-r border-gray-200 relative;
}

.day-column.today {
  @apply bg-blue-25;
}

.day-column.weekend {
  @apply bg-gray-25;
}

.hour-slot {
  @apply h-15 border-b border-gray-100 cursor-pointer hover:bg-gray-50 transition-colors relative;
}

.week-event {
  @apply absolute left-1 right-1 rounded text-white text-xs p-1 cursor-pointer hover:opacity-80 transition-opacity z-20;
}

.event-content {
  @apply space-y-1;
}

.event-title {
  @apply font-medium truncate;
}

.event-time {
  @apply opacity-75;
}

.event-location {
  @apply opacity-75 flex items-center gap-1;
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