export type CalendarView = 'month' | 'week' | 'day' | 'list'

export type EventType = 'meeting' | 'deadline' | 'milestone' | 'task' | 'reminder'

export type EventStatus = 'confirmed' | 'tentative' | 'cancelled'

export type EventPriority = 'low' | 'medium' | 'high' | 'urgent'

export interface EventAttendee {
  id: string
  name: string
  email: string
  avatar?: string
  status: 'accepted' | 'declined' | 'pending'
  isOrganizer?: boolean
}

export interface EventReminder {
  id: string
  type: 'email' | 'notification' | 'popup'
  minutesBefore: number
  isActive: boolean
}

export interface EventRecurrence {
  type: 'daily' | 'weekly' | 'monthly' | 'yearly'
  interval: number
  endDate?: string
  count?: number
  daysOfWeek?: number[] // 0-6 (Sunday-Saturday)
  dayOfMonth?: number
}

export interface CalendarEvent {
  id: string
  title: string
  description?: string
  type: EventType
  status: EventStatus
  priority: EventPriority
  startDate: string
  endDate: string
  isAllDay: boolean
  location?: string
  attendees: EventAttendee[]
  reminders: EventReminder[]
  recurrence?: EventRecurrence
  color?: string
  tags: string[]
  projectId: string
  taskId?: string
  createdBy: string
  createdAt: string
  updatedAt: string
  url?: string
  attachments?: {
    id: string
    name: string
    url: string
    type: string
    size: number
  }[]
}

export interface CalendarFilter {
  eventTypes: EventType[]
  assignees: string[]
  priorities: EventPriority[]
  dateRange: {
    start: string
    end: string
  }
  showCompleted: boolean
  searchQuery: string
}

export interface CalendarStats {
  totalEvents: number
  upcomingEvents: number
  overdueEvents: number
  todayEvents: number
  thisWeekEvents: number
  eventsByType: Record<EventType, number>
  eventsByPriority: Record<EventPriority, number>
}

export interface CalendarWidgetConfig {
  defaultView: CalendarView
  showWeekends: boolean
  showStats: boolean
  showFilters: boolean
  showEventDetails: boolean
  showAttendees: boolean
  showReminders: boolean
  autoRefresh: boolean
  refreshInterval: number // en minutes
  timeFormat: '12h' | '24h'
  firstDayOfWeek: 0 | 1 // 0 = Sunday, 1 = Monday
  workingHours: {
    start: string // HH:mm
    end: string // HH:mm
  }
  eventColors: Record<EventType, string>
  notifications: {
    enabled: boolean
    beforeMinutes: number[]
  }
}

export interface CreateEventData {
  title: string
  description?: string
  type: EventType
  priority: EventPriority
  startDate: string
  endDate: string
  isAllDay: boolean
  location?: string
  attendeeIds: string[]
  reminders: Omit<EventReminder, 'id'>[]
  recurrence?: EventRecurrence
  tags: string[]
  taskId?: string
}

export interface UpdateEventData {
  title?: string
  description?: string
  type?: EventType
  priority?: EventPriority
  startDate?: string
  endDate?: string
  isAllDay?: boolean
  location?: string
  attendeeIds?: string[]
  reminders?: EventReminder[]
  recurrence?: EventRecurrence
  tags?: string[]
  status?: EventStatus
}

export interface CalendarTimeSlot {
  date: string
  time: string
  isAvailable: boolean
  events: CalendarEvent[]
}

export interface CalendarDay {
  date: string
  isCurrentMonth: boolean
  isToday: boolean
  isWeekend: boolean
  events: CalendarEvent[]
  hasEvents: boolean
}

export interface CalendarWeek {
  weekNumber: number
  days: CalendarDay[]
  startDate: string
  endDate: string
}

export interface CalendarMonth {
  year: number
  month: number
  weeks: CalendarWeek[]
  totalEvents: number
}

export interface TeamMember {
  id: string
  name: string
  email: string
  avatar?: string
  role: string
  isActive: boolean
}

export interface CalendarViewProps {
  currentDate: Date
  events: CalendarEvent[]
}

export interface CalendarEventProps {
  event: CalendarEvent
  isSelected?: boolean
  isEditable?: boolean
}

export interface CalendarConfigProps {
  config: CalendarWidgetConfig
}