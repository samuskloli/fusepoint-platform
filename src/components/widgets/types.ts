// Types pour les widgets
export interface Feature {
  id: number
  name: string
  description: string
  priority: 'high' | 'medium' | 'low'
  status: 'planned' | 'in-progress' | 'testing' | 'completed'
  assignee: string
  due_date: string
  progress: number
  created_at?: string
  updated_at?: string
}

export type FeatureStatus = 'planned' | 'in-progress' | 'testing' | 'completed'
export type FeaturePriority = 'high' | 'medium' | 'low'

export interface FeatureResponse {
  success: boolean
  data: Feature[]
  message?: string
}

// Types pour les autres widgets
export interface CalendarEvent {
  id: string
  title: string
  description?: string
  start_date: string
  end_date?: string
  location?: string
  attendees?: string[]
  type?: 'meeting' | 'deadline' | 'event' | 'reminder'
  priority?: 'high' | 'medium' | 'low'
  status?: 'confirmed' | 'tentative' | 'cancelled'
}

export interface TeamMember {
  id: string
  name: string
  email: string
  role: string
  avatar?: string
  status?: 'active' | 'inactive' | 'busy'
  workload?: number
  active_tasks?: number
  last_activity?: string
}

export interface FileItem {
  id: string
  name: string
  type: 'file' | 'folder'
  size?: number
  updated_at: string
  created_at?: string
  path?: string
  thumbnail?: string
  shared?: boolean
  owner?: string
}

export interface AIMessage {
  id: string
  content: string
  type: 'user' | 'assistant'
  timestamp: string
  model?: string
  tokens?: number
  responseTime?: number
  rating?: number
}

export interface Widget {
  id: string
  name: string
  type: string
  title?: string
  is_enabled?: boolean
  position?: {
    x: number
    y: number
    width: number
    height: number
  }
  config?: Record<string, any>
  data?: any
}

export interface WidgetConfig {
  [key: string]: any
}

// Types pour les checklists
export type ChecklistStatus = 'pending' | 'in_progress' | 'completed'
export type ChecklistPriority = 'low' | 'medium' | 'high'
export type ViewMode = 'list' | 'categories'
export type SortBy = 'name' | 'created_at' | 'due_date' | 'priority' | 'status' | 'progress'
export type SortOrder = 'asc' | 'desc'

export interface ChecklistItem {
  id: string
  title: string
  description?: string
  completed: boolean
  priority: ChecklistPriority
  due_date?: string
  created_at: string
  updated_at: string
}

export interface Checklist {
  id: string
  name: string
  description?: string
  status: ChecklistStatus
  priority: ChecklistPriority
  progress: number
  items: ChecklistItem[]
  due_date?: string
  created_at: string
  updated_at: string
  project_id: string
}

export interface ChecklistWidgetConfig {
  title: string
  showProgress: boolean
  showFilters: boolean
  defaultView: ViewMode
  autoSave: boolean
  maxItems: number
}

export interface FilterOptions {
  status: ChecklistStatus | 'all'
  priority: ChecklistPriority | 'all'
  search: string
}

export interface SortOptions {
  by: SortBy
  order: SortOrder
}