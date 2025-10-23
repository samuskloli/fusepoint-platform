// Export du widget des tâches et de ses composants
export { default as TasksWidget } from './TasksWidget.vue'
export { default as TaskItem } from './components/TaskItem.vue'
export { default as AddTaskModal } from './components/AddTaskModal.vue'
export { default as EditTaskModal } from './components/EditTaskModal.vue'
export { default as TasksConfigModal } from './components/TasksConfigModal.vue'

// Export des types
export type {
  Task,
  TaskStatus,
  TaskPriority,
  TaskAttachment,
  TaskComment,
  TaskFilter,
  TaskStats,
  TasksWidgetConfig,
  CreateTaskData,
  UpdateTaskData
} from './types'