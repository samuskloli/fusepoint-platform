<template>
  <div class="month-view">
    <!-- En-tête des jours de la semaine -->
    <div class="weekdays-header">
      <div 
        v-for="day in weekdays" 
        :key="day"
        class="weekday-cell"
      >
        {{ t(`widgets.calendar.weekdays.${day}`) }}
      </div>
    </div>
    
    <!-- Grille du calendrier -->
    <div class="calendar-grid">
      <div 
        v-for="day in calendarDays" 
        :key="day.date"
        class="day-cell"
        :class="{
          'other-month': !day.isCurrentMonth,
          'today': day.isToday,
          'weekend': day.isWeekend,
          'has-events': day.hasEvents
        }"
        @click="handleDayClick(day.date)"
      >
        <div class="day-number">
          {{ new Date(day.date).getDate() }}
        </div>
        
        <!-- Événements du jour -->
        <div v-if="day.events.length > 0" class="day-events">
          <div 
            v-for="(event, index) in day.events.slice(0, 3)" 
            :key="event.id"
            class="event-item"
            :class="`event-${event.type}`"
            :style="{ backgroundColor: getEventColor(event) }"
            @click.stop="handleEventClick(event)"
          >
            <span class="event-title">{{ event.title }}</span>
            <span v-if="!event.isAllDay" class="event-time">
              {{ formatTime(event.startDate) }}
            </span>
          </div>
          
          <!-- Indicateur d'événements supplémentaires -->
          <div 
            v-if="day.events.length > 3"
            class="more-events"
            @click.stop="showMoreEvents(day)"
          >
            +{{ day.events.length - 3 }} {{ t('widgets.calendar.more') }}
          </div>
        </div>
      </div>
    </div>
    
    <!-- Modal pour plus d'événements -->
    <DayEventsModal
      v-if="showDayEventsModal"
      :date="selectedDay?.date"
      :events="selectedDay?.events || []"
      @close="showDayEventsModal = false"
      @event-click="handleEventClick"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useTranslation } from '@/composables/useTranslation'
import DayEventsModal from './DayEventsModal.vue'
import type { CalendarEvent, CalendarDay } from '../types'

interface Props {
  currentDate: Date
  events: CalendarEvent[]
}

interface Emits {
  (e: 'event-click', event: CalendarEvent): void
  (e: 'date-click', date: string): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()
const { t } = useTranslation()

// États locaux
const showDayEventsModal = ref(false)
const selectedDay = ref<CalendarDay | null>(null)

// Jours de la semaine
const weekdays = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday']

// Génération des jours du calendrier
const calendarDays = computed(() => {
  const year = props.currentDate.getFullYear()
  const month = props.currentDate.getMonth()
  const today = new Date()
  
  // Premier jour du mois
  const firstDay = new Date(year, month, 1)
  // Dernier jour du mois
  const lastDay = new Date(year, month + 1, 0)
  
  // Premier lundi de la grille (peut être du mois précédent)
  const startDate = new Date(firstDay)
  const dayOfWeek = firstDay.getDay()
  const daysToSubtract = dayOfWeek === 0 ? 6 : dayOfWeek - 1
  startDate.setDate(firstDay.getDate() - daysToSubtract)
  
  // Génération de 42 jours (6 semaines)
  const days: CalendarDay[] = []
  const currentDate = new Date(startDate)
  
  for (let i = 0; i < 42; i++) {
    const dateStr = currentDate.toISOString().split('T')[0]
    const dayEvents = props.events.filter(event => {
      const eventDate = new Date(event.startDate).toISOString().split('T')[0]
      return eventDate === dateStr
    })
    
    days.push({
      date: dateStr,
      isCurrentMonth: currentDate.getMonth() === month,
      isToday: dateStr === today.toISOString().split('T')[0],
      isWeekend: currentDate.getDay() === 0 || currentDate.getDay() === 6,
      events: dayEvents,
      hasEvents: dayEvents.length > 0
    })
    
    currentDate.setDate(currentDate.getDate() + 1)
  }
  
  return days
})

// Gestion des clics
const handleDayClick = (date: string) => {
  emit('date-click', date)
}

const handleEventClick = (event: CalendarEvent) => {
  emit('event-click', event)
}

const showMoreEvents = (day: CalendarDay) => {
  selectedDay.value = day
  showDayEventsModal.value = true
}

// Utilitaires
const formatTime = (dateStr: string) => {
  const date = new Date(dateStr)
  return date.toLocaleTimeString('fr-FR', {
    hour: '2-digit',
    minute: '2-digit'
  })
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
</script>

<style scoped>
.month-view {
  @apply w-full;
}

.weekdays-header {
  @apply grid grid-cols-7 border-b border-gray-200;
}

.weekday-cell {
  @apply p-3 text-center text-sm font-medium text-gray-700 bg-gray-50;
}

.calendar-grid {
  @apply grid grid-cols-7;
}

.day-cell {
  @apply min-h-24 p-1 border-r border-b border-gray-200 cursor-pointer hover:bg-gray-50 transition-colors;
}

.day-cell.other-month {
  @apply bg-gray-50 text-gray-400;
}

.day-cell.today {
  @apply bg-blue-50;
}

.day-cell.weekend {
  @apply bg-gray-25;
}

.day-cell.has-events {
  @apply bg-blue-25;
}

.day-number {
  @apply text-sm font-medium text-center mb-1;
}

.day-cell.today .day-number {
  @apply bg-blue-600 text-white rounded-full w-6 h-6 flex items-center justify-center mx-auto;
}

.day-events {
  @apply space-y-1;
}

.event-item {
  @apply px-1 py-0.5 rounded text-xs text-white cursor-pointer hover:opacity-80 transition-opacity;
}

.event-title {
  @apply block truncate;
}

.event-time {
  @apply block text-xs opacity-75;
}

.more-events {
  @apply text-xs text-blue-600 cursor-pointer hover:text-blue-800 font-medium;
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