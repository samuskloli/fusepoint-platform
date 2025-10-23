import { Ref } from 'vue'

export interface NotificationOptions {
  title: string
  message?: string
  type?: 'success' | 'error' | 'warning' | 'info'
  duration?: number
  persistent?: boolean
  actions?: Array<{
    label: string
    action: () => void
  }>
}

export interface UseNotificationsReturn {
  notify: (options: NotificationOptions) => void
  success: (title: string, message?: string) => void
  error: (title: string, message?: string) => void
  warning: (title: string, message?: string) => void
  info: (title: string, message?: string) => void
  clear: () => void
  notifications: Ref<NotificationOptions[]>
}

export declare function useNotifications(): UseNotificationsReturn