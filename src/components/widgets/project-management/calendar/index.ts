// Composant principal
export { default as CalendarWidget } from './CalendarWidget.vue'

// Composants de vue
export { default as MonthView } from './components/MonthView.vue'
export { default as WeekView } from './components/WeekView.vue'
export { default as DayView } from './components/DayView.vue'
export { default as ListView } from './components/ListView.vue'

// Modales
export { default as DayEventsModal } from './components/DayEventsModal.vue'
export { default as AddEventModal } from './components/AddEventModal.vue'
export { default as EditEventModal } from './components/EditEventModal.vue'
export { default as EventDetailsModal } from './components/EventDetailsModal.vue'
export { default as CalendarConfigModal } from './components/CalendarConfigModal.vue'

// Types
export type {
  CalendarView,
  EventType,
  EventStatus,
  EventPriority,
  EventAttendee,
  EventReminder,
  EventRecurrence,
  CalendarEvent,
  EventFilter,
  EventStats,
  CalendarWidgetConfig,
  CreateEventData,
  UpdateEventData,
  TimeSlot,
  CalendarDay,
  CalendarWeek,
  CalendarMonth,
  TeamMember,
  MonthViewProps,
  WeekViewProps,
  DayViewProps,
  ListViewProps,
  EventItemProps
} from './types'