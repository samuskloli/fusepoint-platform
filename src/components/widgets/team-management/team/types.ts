// Types de base
export type MemberStatus = 'active' | 'inactive' | 'pending'
export type MemberRole = 'admin' | 'manager' | 'developer' | 'designer' | 'analyst' | 'intern'
export type Department = 'engineering' | 'design' | 'marketing' | 'sales' | 'hr' | 'finance' | 'operations'
export type TeamView = 'grid' | 'list' | 'org'
export type SortOrder = 'asc' | 'desc'

// Interfaces principales
export interface TeamMember {
  id: string
  name: string
  email: string
  phone?: string
  avatar?: string
  role: MemberRole
  department: Department
  status: MemberStatus
  joinDate: string
  lastActive?: string
  location?: string
  timezone?: string
  bio?: string
  skills: string[]
  projects: string[]
  managerId?: string
  directReports: string[]
  workingHours?: {
    start: string
    end: string
    timezone: string
  }
  socialLinks?: {
    linkedin?: string
    github?: string
    twitter?: string
  }
  emergencyContact?: {
    name: string
    phone: string
    relationship: string
  }
  salary?: {
    amount: number
    currency: string
    effectiveDate: string
  }
  benefits?: string[]
  performanceRating?: number
  goals?: string[]
  notes?: string
  createdAt: string
  updatedAt: string
  createdBy: string
}

export interface TeamStats {
  totalMembers: number
  activeMembers: number
  departments: number
  newThisMonth: number
}

export interface MemberFilter {
  search?: string
  department?: Department | ''
  role?: MemberRole | ''
  status?: MemberStatus | ''
  skills?: string[]
  location?: string
  managerId?: string
}

export interface TeamWidgetConfig {
  defaultView: TeamView
  showStats: boolean
  showFilters: boolean
  showSearch: boolean
  itemsPerPage: number
  sortBy: keyof TeamMember
  sortOrder: SortOrder
  showDepartments: boolean
  showRoles: boolean
  showStatus: boolean
  showAvatar: boolean
  showContactInfo: boolean
  showSkills: boolean
  showProjects: boolean
  showLastActive: boolean
  showLocation: boolean
  showWorkingHours: boolean
  showSocialLinks: boolean
  enableExport: boolean
  enableBulkActions: boolean
  enableOrgChart: boolean
  autoRefresh: {
    enabled: boolean
    interval: number
  }
  refreshInterval: number
  display: {
    showAvatar: boolean
    showContact: boolean
    showSkills: boolean
    showProjects: boolean
    showPerformance: boolean
    showLastActivity: boolean
  }
  filters: {
    departments: Department[]
    roles: MemberRole[]
    statuses: MemberStatus[]
  }
  pagination: {
    itemsPerPage: number
    showPagination: boolean
  }
  sorting: {
    defaultBy: keyof TeamMember
    defaultOrder: SortOrder
  }
  actions: {
    canAdd: boolean
    canEdit: boolean
    canDelete: boolean
    canExport: boolean
    canBulkEdit: boolean
  }
  notifications: {
    enabled: boolean
    newMembers: boolean
    updates: boolean
    statusChanges: boolean
  }
  theme: {
    primaryColor: string
    accentColor: string
  }
}

// Types pour les formulaires
export interface CreateMemberData {
  name: string
  email: string
  phone?: string
  avatar?: string
  role: MemberRole
  department: Department
  status: MemberStatus
  joinDate: string
  location?: string
  timezone?: string
  bio?: string
  skills: string[]
  managerId?: string
  workingHours?: {
    start: string
    end: string
    timezone: string
  }
  socialLinks?: {
    linkedin?: string
    github?: string
    twitter?: string
  }
  emergencyContact?: {
    name: string
    phone: string
    relationship: string
  }
  salary?: {
    amount: number
    currency: string
    effectiveDate: string
  }
  benefits?: string[]
  goals?: string[]
  notes?: string
}

export interface UpdateMemberData extends Partial<CreateMemberData> {
  lastActive?: string
  performanceRating?: number
}

// Types pour les composants
export interface MemberCardProps {
  member: TeamMember
  showAvatar?: boolean
  showContactInfo?: boolean
  showSkills?: boolean
  showStatus?: boolean
  showLastActive?: boolean
  showActions?: boolean
}

export interface MemberListProps {
  members: TeamMember[]
  sortBy: keyof TeamMember
  sortOrder: SortOrder
  showAvatar?: boolean
  showContactInfo?: boolean
  showSkills?: boolean
  showStatus?: boolean
  showLastActive?: boolean
  showActions?: boolean
}

export interface OrgChartProps {
  members: TeamMember[]
  showAvatar?: boolean
  showContactInfo?: boolean
  expandAll?: boolean
}

// Types pour l'organigramme
export interface OrgNode {
  id: string
  member: TeamMember
  children: OrgNode[]
  level: number
  isExpanded: boolean
}

// Types pour les actions en lot
export interface BulkAction {
  id: string
  label: string
  icon: string
  action: (memberIds: string[]) => Promise<void>
  requiresConfirmation: boolean
  confirmationMessage?: string
}

// Types pour l'export
export interface ExportOptions {
  format: 'csv' | 'xlsx' | 'pdf'
  fields: (keyof TeamMember)[]
  filters?: MemberFilter
  includeStats?: boolean
}

// Types pour les notifications
export interface MemberNotification {
  id: string
  type: 'birthday' | 'anniversary' | 'new_member' | 'status_change' | 'performance_review'
  memberId: string
  title: string
  message: string
  date: string
  isRead: boolean
}

// Types pour les rapports
export interface TeamReport {
  id: string
  title: string
  type: 'headcount' | 'turnover' | 'performance' | 'skills' | 'diversity'
  period: {
    start: string
    end: string
  }
  data: any
  generatedAt: string
  generatedBy: string
}

// Types pour les permissions
export interface MemberPermissions {
  canView: boolean
  canEdit: boolean
  canDelete: boolean
  canViewSalary: boolean
  canViewPersonalInfo: boolean
  canManageTeam: boolean
  canExport: boolean
  canGenerateReports: boolean
}

// Types pour l'historique
export interface MemberHistory {
  id: string
  memberId: string
  action: 'created' | 'updated' | 'deleted' | 'status_changed' | 'role_changed' | 'department_changed'
  field?: string
  oldValue?: any
  newValue?: any
  timestamp: string
  userId: string
  userEmail: string
  notes?: string
}

// Types pour les intégrations
export interface SlackIntegration {
  enabled: boolean
  webhookUrl?: string
  channelId?: string
  notifyOnNewMember: boolean
  notifyOnStatusChange: boolean
  notifyOnBirthday: boolean
}

export interface EmailIntegration {
  enabled: boolean
  smtpConfig?: {
    host: string
    port: number
    secure: boolean
    auth: {
      user: string
      pass: string
    }
  }
  templates: {
    welcome: string
    birthday: string
    anniversary: string
  }
}

export interface HRISIntegration {
  enabled: boolean
  provider: 'bamboohr' | 'workday' | 'adp' | 'custom'
  apiKey?: string
  baseUrl?: string
  syncInterval: number
  lastSync?: string
  fieldMapping: Record<string, string>
}

// Types pour les métriques
export interface TeamMetrics {
  headcount: {
    total: number
    byDepartment: Record<Department, number>
    byRole: Record<MemberRole, number>
    byStatus: Record<MemberStatus, number>
  }
  turnover: {
    rate: number
    departures: number
    hires: number
    period: string
  }
  diversity: {
    genderDistribution: Record<string, number>
    ageDistribution: Record<string, number>
    locationDistribution: Record<string, number>
  }
  performance: {
    averageRating: number
    ratingDistribution: Record<number, number>
    topPerformers: TeamMember[]
  }
  engagement: {
    activeMembers: number
    lastActiveDistribution: Record<string, number>
    responseRate: number
  }
}

// Types pour les alertes
export interface TeamAlert {
  id: string
  type: 'birthday' | 'anniversary' | 'performance_review_due' | 'inactive_member' | 'missing_info'
  severity: 'low' | 'medium' | 'high'
  title: string
  message: string
  memberId?: string
  actionRequired: boolean
  dueDate?: string
  createdAt: string
  resolvedAt?: string
  resolvedBy?: string
}