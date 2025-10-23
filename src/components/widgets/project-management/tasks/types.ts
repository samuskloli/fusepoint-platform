// Types pour le widget des tâches

export type TaskStatus = 'pending' | 'in_progress' | 'completed'
export type TaskPriority = 'low' | 'medium' | 'high'

export interface Task {
  id: string
  title: string
  description?: string
  status: TaskStatus
  priority: TaskPriority
  assignedTo?: string
  assignedToName?: string
  dueDate?: string
  createdAt: string
  updatedAt: string
  projectId: string
  tags?: string[]
  estimatedHours?: number
  actualHours?: number
  dependencies?: string[]
  attachments?: TaskAttachment[]
}

export interface TaskAttachment {
  id: string
  name: string
  url: string
  type: string
  size: number
  uploadedAt: string
}

export interface TaskComment {
  id: string
  taskId: string
  authorId: string
  authorName: string
  content: string
  createdAt: string
}

export interface TaskFilter {
  status?: TaskStatus | 'all'
  priority?: TaskPriority | 'all'
  assignedTo?: string | 'all'
  tags?: string[]
  search?: string
}

export interface TaskStats {
  total: number
  completed: number
  inProgress: number
  pending: number
  overdue: number
}

export interface TasksWidgetConfig {
  showStats: boolean
  showFilters: boolean
  showAssignee: boolean
  showDueDate: boolean
  showPriority: boolean
  showTags: boolean
  defaultView: 'list' | 'kanban' | 'calendar'
  itemsPerPage: number
  autoRefresh: boolean
  refreshInterval: number
}

export interface CreateTaskData {
  title: string
  description?: string
  priority: TaskPriority
  assignedTo?: string
  dueDate?: string
  tags?: string[]
  estimatedHours?: number
}

export interface UpdateTaskData {
  title?: string
  description?: string
  status?: TaskStatus
  priority?: TaskPriority
  assignedTo?: string
  dueDate?: string
  tags?: string[]
  estimatedHours?: number
  actualHours?: number
}