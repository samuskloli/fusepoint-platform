// Types partagés pour le widget des objectifs

export type GoalStatus = 'active' | 'completed' | 'paused' | 'cancelled' | 'archived'
export type GoalPriority = 'high' | 'medium' | 'low'
export type FilterStatus = GoalStatus | 'all' | 'overdue' | 'upcoming'
export type SortBy = 'title' | 'deadline' | 'priority' | 'progress'

export interface Assignee {
  id: string
  name: string
  avatar?: string
}

export interface Goal {
  id: string
  title: string
  description?: string
  status: GoalStatus
  priority: GoalPriority
  progress: number
  deadline?: string
  assignee?: Assignee
  tags: string[]
  created_at: string
  updated_at: string
}