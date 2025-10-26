// Centralized widget mappings and helpers

// Map: component name -> widget type
export const TYPE_BY_COMPONENT = {
  TaskListWidget: 'task_list',
  TasksWidget: 'tasks',
  StatsWidget: 'stats',
  FilesWidget: 'files',
  TeamWidget: 'team',
  CalendarWidget: 'calendar',
  CommentsWidget: 'comments',
  DeliverablesWidget: 'deliverables',
  GoalsWidget: 'goals',
  AIWidget: 'ai',
  HistoryWidget: 'history',
  ChecklistWidget: 'checklist',
  ProjectOverviewWidget: 'project_overview',
  BudgetWidget: 'budget',
  NotesWidget: 'notes'
}

// Map: widget type -> component name
export const COMPONENT_BY_TYPE = {
  task_list: 'TaskListWidget',
  tasks: 'TaskListWidget',
  stats: 'StatsWidget',
  files: 'FilesWidget',
  team: 'TeamWidget',
  calendar: 'CalendarWidget',
  comments: 'CommentsWidget',
  deliverables: 'DeliverablesWidget',
  goals: 'GoalsWidget',
  ai: 'AIWidget',
  history: 'HistoryWidget',
  checklist: 'ChecklistWidget',
  project_overview: 'ProjectOverviewWidget',
  budget: 'BudgetWidget',
  notes: 'NotesWidget'
}

// Map: widget type -> i18n title key
export const NAME_KEY_BY_TYPE = {
  task_list: 'widgets.taskList.title',
  stats: 'widgets.stats.title',
  files: 'widgets.files.title',
  team: 'widgets.team.title',
  calendar: 'widgets.calendar.title',
  comments: 'widgets.comments.title',
  deliverables: 'widgets.deliverables.title',
  goals: 'widgets.goals.title',
  ai: 'widgets.ai.title',
  history: 'widgets.history.title',
  checklist: 'widgets.checklist.title',
  project_overview: 'widgets.projectOverview.title',
  budget: 'widgets.budget.title',
  notes: 'widgets.notes.title'
}

// Map: widget type -> icon class
export const ICON_BY_TYPE = {
  task_list: 'fas fa-tasks',
  stats: 'fas fa-chart-bar',
  files: 'fas fa-folder',
  team: 'fas fa-users',
  calendar: 'fas fa-calendar',
  comments: 'fas fa-sticky-note',
  deliverables: 'fas fa-clipboard-check',
  goals: 'fas fa-bullseye',
  ai: 'fas fa-robot',
  history: 'fas fa-history',
  checklist: 'fas fa-clipboard-list',
  project_overview: 'fas fa-project-diagram',
  budget: 'fas fa-euro-sign',
  notes: 'fas fa-sticky-note'
}

// Optional: direct component name -> icon class mapping for library modals
export const ICON_BY_COMPONENT = {
  TimelineWidget: 'fas fa-timeline',
  ChecklistWidget: 'fas fa-tasks',
  GoalsWidget: 'fas fa-bullseye',
  PerformanceWidget: 'fas fa-chart-line',
  FilesWidget: 'fas fa-folder',
  CommentsWidget: 'fas fa-comments',
  AIWidget: 'fas fa-robot',
  DesignWidget: 'fas fa-palette',
  FeedbackWidget: 'fas fa-comment-dots',
  DevelopmentWidget: 'fas fa-code',
  SEOWidget: 'fas fa-search',
  SocialWidget: 'fas fa-share-alt',
  BrandWidget: 'fas fa-copyright',
  AnalyticsWidget: 'fas fa-chart-bar',
  ProjectOverviewWidget: 'fas fa-project-diagram',
  TasksWidget: 'fas fa-tasks',
  BudgetWidget: 'fas fa-euro-sign',
  NotesWidget: 'fas fa-sticky-note'
}

const LOWER_TYPE_BY_COMPONENT = Object.fromEntries(
  Object.entries(TYPE_BY_COMPONENT).map(([k, v]) => [k.toLowerCase(), v])
)

export const SUPPORTED_COMPONENTS_SET = new Set(
  Object.keys(TYPE_BY_COMPONENT).map((k) => k.toLowerCase())
)

export function componentNameToType(name) {
  if (!name) return null
  const direct = TYPE_BY_COMPONENT[name]
  if (direct) return direct
  return LOWER_TYPE_BY_COMPONENT[String(name).toLowerCase()] || null
}

export function typeToComponent(type) {
  if (!type) return null
  return COMPONENT_BY_TYPE[type] || null
}

export function typeToIcon(type) {
  return ICON_BY_TYPE[type] || 'fas fa-puzzle-piece'
}

export function typeToNameKey(type) {
  return NAME_KEY_BY_TYPE[type] || null
}

export function componentNameToIcon(name) {
  if (!name) return 'fas fa-puzzle-piece'
  if (ICON_BY_COMPONENT[name]) return ICON_BY_COMPONENT[name]
  const type = componentNameToType(name)
  return type ? typeToIcon(type) : 'fas fa-puzzle-piece'
}