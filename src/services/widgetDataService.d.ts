export interface FeedbackData {
  id?: number
  rating: number
  type: 'feature' | 'improvement' | 'bug'
  message: string
  author_name?: string
  created_at?: string
}

export interface FeatureData {
  id?: number
  name: string
  description: string
  priority: 'high' | 'medium' | 'low'
  status: 'planned' | 'in-progress' | 'testing' | 'completed'
  assignee?: string
  due_date?: string
  progress?: number
  created_at?: string
}

export interface VersionData {
  id?: number
  version: string
  type: 'major' | 'minor' | 'patch' | 'hotfix'
  description: string
  author?: string
  release_date?: string
  is_current?: boolean
  downloads?: number
  changes?: Array<{
    id: number
    type: 'feature' | 'improvement' | 'fix' | 'breaking'
    description: string
  }>
  created_at?: string
}

export interface DeliverableData {
  id?: number
  title: string
  description?: string
  status: 'pending' | 'in_review' | 'approved' | 'rejected'
  due_date?: string
  version?: string
  submitted_by?: string
  submitted_at?: string
  approved_at?: string
  rejection_reason?: string
}

export interface ServiceResponse<T> {
  success: boolean
  data?: T
  error?: string
}

export interface VersioningResponse {
  versions: VersionData[]
}

export interface DeliverablesResponse {
  deliverables: DeliverableData[]
}

export interface WidgetDataService {
  getFeedbackData(projectId: string | number): Promise<ServiceResponse<FeedbackData[]>>
  addFeedback(projectId: string | number, feedbackData: FeedbackData): Promise<ServiceResponse<FeedbackData>>
  getFeatureTrackingData(projectId: string | number): Promise<ServiceResponse<FeatureData[]>>
  addFeature(projectId: string | number, featureData: FeatureData): Promise<ServiceResponse<FeatureData>>
  addVersioningData(projectId: string | number, versionData: VersionData): Promise<ServiceResponse<VersionData>>
  getVersioningData(projectId: string | number): Promise<VersioningResponse>
  // Deliverables
  getDeliverablesData(projectId: string | number): Promise<DeliverablesResponse>
  updateDeliverableStatus(projectId: string | number, deliverableId: number, status: DeliverableData['status'], reason?: string): Promise<ServiceResponse<DeliverableData>>
  addDeliverable(projectId: string | number, deliverableData: Partial<DeliverableData>): Promise<ServiceResponse<DeliverableData>>
}

declare const widgetDataService: WidgetDataService
export default widgetDataService