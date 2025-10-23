// Types et interfaces pour les widgets de la plateforme Fusepoint

/**
 * Interface de base pour un widget
 */
export interface Widget {
  id: string | number | null
  name: string
  icon?: string
  isEnabled: boolean
  titleKey?: string
  description?: string
  category?: string
  order?: number
  config?: Record<string, any>
}

/**
 * Types de tailles disponibles pour les widgets
 */
export type WidgetSize = 'small' | 'medium' | 'large' | 'full'

/**
 * Types de statuts pour les widgets
 */
export type WidgetStatus = 'active' | 'inactive' | 'loading' | 'error'

/**
 * Interface pour les props communes des widgets
 */
export interface BaseWidgetProps {
  widget: Widget
  loading?: boolean
  error?: string | null
  showHeader?: boolean
  showActions?: boolean
  canConfigure?: boolean
  canToggle?: boolean
  canRemove?: boolean
  size?: WidgetSize
}

/**
 * Interface pour les événements émis par les widgets
 */
export interface WidgetEmits {
  configure: []
  toggle: []
  remove: []
  retry: []
  update: [data: any]
  error: [error: string]
}

/**
 * Interface pour la configuration d'un widget
 */
export interface WidgetConfig {
  id: string
  type: string
  title: string
  description?: string
  icon?: string
  defaultSize?: WidgetSize
  configurable?: boolean
  removable?: boolean
  settings?: Record<string, any>
}

/**
 * Interface pour les données d'un widget AI
 */
export interface AIWidgetData {
  conversations: Conversation[]
  currentConversation?: Conversation
  isTyping: boolean
  suggestions: string[]
  config: AIConfig
}

/**
 * Interface pour une conversation AI
 */
export interface Conversation {
  id: string
  title: string
  messages: Message[]
  createdAt: Date
  updatedAt: Date
  isActive?: boolean
}

/**
 * Interface pour un message AI
 */
export interface Message {
  id: string
  content: string
  role: 'user' | 'assistant'
  timestamp: Date
  rating?: number
  metadata?: Record<string, any>
}

/**
 * Interface pour la configuration AI
 */
export interface AIConfig {
  model: string
  temperature: number
  maxTokens: number
  systemPrompt?: string
  enableHistory: boolean
  enableSuggestions: boolean
}

/**
 * Interface pour les données d'historique
 */
export interface HistoryWidgetData {
  events: HistoryEvent[]
  filters: HistoryFilters
  pagination: Pagination
  stats: HistoryStats
}

/**
 * Interface pour un événement d'historique
 */
export interface HistoryEvent {
  id: string
  type: string
  title: string
  description?: string
  timestamp: Date
  userId?: string
  projectId?: string
  metadata?: Record<string, any>
}

/**
 * Interface pour les filtres d'historique
 */
export interface HistoryFilters {
  dateRange?: {
    start: Date
    end: Date
  }
  eventTypes?: string[]
  userId?: string
  projectId?: string
  search?: string
}

/**
 * Interface pour les statistiques d'historique
 */
export interface HistoryStats {
  totalEvents: number
  eventsToday: number
  eventsThisWeek: number
  eventsThisMonth: number
  topEventTypes: Array<{
    type: string
    count: number
  }>
}

/**
 * Interface pour la pagination
 */
export interface Pagination {
  page: number
  limit: number
  total: number
  totalPages: number
}

/**
 * Interface pour les erreurs de widget
 */
export interface WidgetError {
  code: string
  message: string
  details?: any
  timestamp: Date
}

/**
 * Type pour les actions de widget
 */
export type WidgetAction = 'configure' | 'toggle' | 'remove' | 'refresh' | 'export' | 'import'

/**
 * Interface pour les permissions de widget
 */
export interface WidgetPermissions {
  canView: boolean
  canEdit: boolean
  canDelete: boolean
  canConfigure: boolean
  canExport: boolean
}

/**
 * Interface pour les métriques de performance d'un widget
 */
export interface WidgetMetrics {
  loadTime: number
  renderTime: number
  errorCount: number
  lastUpdated: Date
  usageCount: number
}