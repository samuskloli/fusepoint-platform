<template>
  <div v-if="isOpen" class="modal-overlay" @click.self="closeModal">
    <div class="modal-container">
      <div class="modal-header">
        <div class="header-left">
          <i :class="getWidgetIcon(widget?.widget_type)" class="header-icon"></i>
          <h3 class="header-title">{{ getWidgetName(widget?.widget_type) }}</h3>
        </div>
        <button class="close-btn" @click="closeModal">
          <i class="fas fa-times"></i>
        </button>
      </div>
      <div class="modal-content">
        <component
          :is="getWidgetComponent(widget?.widget_type)"
          :project-id="projectId"
          :widget="widget"
          @widget-updated="$emit('close')"
          @error="() => {}"
        />
      </div>
    </div>
  </div>
</template>

<script>
import { ref } from 'vue'
import { useTranslation } from '@/composables/useTranslation'
// Widgets
import TaskListWidget from '@/components/widgets/TaskListWidget.vue'
import StatsWidget from '@/components/widgets/StatsWidget.vue'
import CalendarWidget from '@/components/widgets/CalendarWidget.vue'
import CommentsWidget from '@/components/widgets/CommentsWidget.vue'
import GoalsWidget from '@/components/widgets/GoalsWidget.vue'
import AIWidget from '@/components/widgets/AIWidget.vue'
import FilesWidget from '@/components/widgets/FilesWidget.vue'
import HistoryWidget from '@/components/widgets/HistoryWidget.vue'
import ChecklistWidget from '@/components/widgets/ChecklistWidget.vue'
import TeamWidget from '@/components/widgets/TeamWidget.vue'
import DeliverablesWidget from '@/components/widgets/DeliverablesWidget.vue'

export default {
  name: 'WidgetViewerModal',
  components: {
    TaskListWidget,
    StatsWidget,
    CalendarWidget,
    CommentsWidget,
    GoalsWidget,
    AIWidget,
    FilesWidget,
    HistoryWidget,
    ChecklistWidget,
    TeamWidget,
    DeliverablesWidget
  },
  props: {
    isOpen: {
      type: Boolean,
      default: false
    },
    widget: {
      type: Object,
      default: () => ({})
    },
    projectId: {
      type: [String, Number],
      required: true
    }
  },
  emits: ['close'],
  setup(props, { emit }) {
    const { t } = useTranslation()

    const getWidgetComponent = (type) => {
      const map = {
        'task_list': 'TaskListWidget',
        'stats': 'StatsWidget',
        'calendar': 'CalendarWidget',
        'comments': 'CommentsWidget',
        'goals': 'GoalsWidget',
        'ai': 'AIWidget',
        'files': 'FilesWidget',
        'history': 'HistoryWidget',
        'checklist': 'ChecklistWidget',
        'team': 'TeamWidget',
        'deliverables': 'DeliverablesWidget'
      }
      return map[type] || 'div'
    }

    const getWidgetIcon = (type) => {
      const icons = {
        'task_list': 'fas fa-tasks',
        'stats': 'fas fa-chart-bar',
        'files': 'fas fa-folder',
        'team': 'fas fa-users',
        'calendar': 'fas fa-calendar',
        'comments': 'fas fa-sticky-note',
        'deliverables': 'fas fa-clipboard-check',
        'ai': 'fas fa-robot',
        'goals': 'fas fa-bullseye',
        'history': 'fas fa-history',
        'checklist': 'fas fa-clipboard-list'
      }
      return icons[type] || 'fas fa-puzzle-piece'
    }

    const getWidgetName = (type) => {
      const keys = {
        'task_list': 'widgets.taskList.title',
        'stats': 'widgets.stats.title',
        'files': 'widgets.files.title',
        'team': 'widgets.team.title',
        'calendar': 'widgets.calendar.title',
        'comments': 'widgets.comments.title',
        'deliverables': 'widgets.deliverables.title',
        'ai': 'widgets.ai.title',
        'goals': 'widgets.goals.title',
        'history': 'widgets.history.title',
        'checklist': 'widgets.checklist.title'
      }
      const key = keys[type] || 'widgets.widget'
      const translated = t(key)
      return translated !== key ? translated : 'Widget'
    }

    const closeModal = () => {
      emit('close')
    }

    return {
      t,
      getWidgetComponent,
      getWidgetIcon,
      getWidgetName,
      closeModal
    }
  }
}
</script>

<style scoped>
.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(17, 24, 39, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.modal-container {
  width: 90%;
  max-width: 1200px;
  background: white;
  border-radius: 12px;
  box-shadow: 0 20px 40px rgba(0,0,0,0.2);
  overflow: hidden;
}

.modal-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1rem 1.25rem;
  border-bottom: 1px solid #e5e7eb;
  background: #f9fafb;
}

.header-left {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.header-icon {
  color: #2563eb;
  font-size: 1.25rem;
}

.header-title {
  margin: 0;
  font-size: 1.125rem;
  font-weight: 600;
  color: #111827;
}

.close-btn {
  border: none;
  background: white;
  color: #6b7280;
  width: 36px;
  height: 36px;
  border-radius: 8px;
  cursor: pointer;
}

.close-btn:hover {
  background: #f3f4f6;
  color: #111827;
}

.modal-content {
  padding: 1rem 1.25rem;
}
</style>