<template>
  <RoleLayout>
    <div class="widget-fullpage">
      <div class="header">
        <button class="back-btn" @click="goBack">
          <i class="fas fa-arrow-left"></i>
          <span>{{ t('common.back') }}</span>
        </button>
        <h2 class="title">
          <i :class="getWidgetIcon(type)" v-if="type"></i>
          {{ getWidgetName(type) }}
        </h2>
      </div>

      <div v-if="loading" class="loading">
        <i class="fas fa-spinner fa-spin"></i>
        <span>{{ t('common.loading') }}</span>
      </div>

      <div v-else class="content">
        <div v-if="!widget" class="empty">
          <i class="fas fa-puzzle-piece"></i>
          <p>{{ t('widgets.loadError') }}</p>
        </div>
        <component
          v-else
          :is="getWidgetComponent(type)"
          :project-id="projectId"
          :widget="widget"
          @widget-updated="onWidgetUpdated"
          @widget-error="onWidgetError"
          @widget-config-saved="onWidgetConfigSaved"
        />
      </div>
    </div>
  </RoleLayout>
</template>

<script>
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useTranslation } from '@/composables/useTranslation'
import { useNotifications } from '@/composables/useNotifications'
import projectManagementService from '@/services/projectManagementService'
import widgetApiService from '@/components/widgets/shared/services/widgetApiService'
import RoleLayout from '@/components/RoleLayout.vue'

// Import des widgets (mêmes que dans ProjectDashboard)
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
  name: 'ProjectWidgetView',
  components: {
    RoleLayout,
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
  setup() {
    const route = useRoute()
    const router = useRouter()
    const { t } = useTranslation()
    const { success, error: showError } = useNotifications()

    const loading = ref(true)
    const project = ref(null)
    const widget = ref(null)

    const clientId = computed(() => route.params.clientId)
    const projectId = computed(() => route.params.projectId || route.params.id)
    const widgetId = computed(() => route.params.widgetId)
    const type = computed(() => route.params.type)

    const componentMap = {
      'task_list': 'TaskListWidget',
      'stats': 'StatsWidget',
      'files': 'FilesWidget',
      'team': 'TeamWidget',
      'calendar': 'CalendarWidget',
      'comments': 'CommentsWidget',
      'deliverables': 'DeliverablesWidget',
      'goals': 'GoalsWidget',
      'ai': 'AIWidget',
      'history': 'HistoryWidget',
      'checklist': 'ChecklistWidget'
    }

    const transformBackendWidgetToUI = (w) => ({
      id: w.id,
      widget_id: w.widgetId ?? w.widget_id ?? w.id,
      widget_type: w.widget_type || componentNameToType(w.componentName ?? w.component_name),
      position_x: w.position?.x ?? w.position_x ?? 0,
      position_y: w.position?.y ?? w.position_y ?? 0,
      width: w.size?.width ?? w.width ?? 12,
      height: w.size?.height ?? w.height ?? 4,
      is_enabled: (typeof w.isEnabled !== 'undefined' ? w.isEnabled : (typeof w.is_enabled !== 'undefined' ? w.is_enabled : true)),
      widget_config: w.config ?? w.widget_config ?? {},
      component_name: w.componentName ?? w.component_name
    })

    const componentNameToType = (name) => {
      const map = {
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
        ChecklistWidget: 'checklist'
      }
      return map[name] || 'widget'
    }

    const getWidgetComponent = (widgetType) => {
      return componentMap[widgetType] || 'div'
    }

    const getWidgetIcon = (widgetType) => {
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
      return icons[widgetType] || 'fas fa-puzzle-piece'
    }

    const getWidgetName = (widgetType) => {
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
      const key = keys[widgetType] || 'widgets.widget'
      const translated = t(key)
      return translated !== key ? translated : 'Widget'
    }

    const loadData = async () => {
      loading.value = true
      try {
        let cid = clientId.value
        const pid = String(projectId.value)

        if (!cid) {
          const result = await projectManagementService.getProjectDetails(pid)
          if (result.success) {
            project.value = result.data
            cid = String(result.data.client_id)
          }
        }

        const widgets = await widgetApiService.getClientProjectWidgets(String(cid), String(pid))
        const list = Array.isArray(widgets) ? widgets.map(transformBackendWidgetToUI) : []
        const found = list.find(w => String(w.widget_id || w.id) === String(widgetId.value)) || list.find(w => w.widget_type === type.value)

        if (found) {
          widget.value = found
        } else {
          // Fallback minimal config
          widget.value = {
            id: String(widgetId.value || `${Date.now()}-${type.value}`),
            widget_id: String(widgetId.value || `${Date.now()}-${type.value}`),
            widget_type: type.value,
            position_x: 0,
            position_y: 0,
            width: 12,
            height: 4,
            is_enabled: true,
            widget_config: {}
          }
        }
      } catch (err) {
        console.error('Failed to load widget for full page', err)
        showError(t('widgets.errorMessage'))
      } finally {
        loading.value = false
      }
    }

    const goBack = () => {
      if (route.path.startsWith('/agent/')) {
        router.push({ name: 'ProjectDetailDashboard', params: { clientId: route.params.clientId, projectId: projectId.value } })
      } else {
        router.push({ name: 'ProjectDetails', params: { id: projectId.value } })
      }
    }

    const onWidgetUpdated = () => {
      success(t('widgets.statusUpdated'))
    }
    const onWidgetError = (error) => {
      showError(error?.message || t('widgets.errorMessage'))
    }
    const onWidgetConfigSaved = () => {
      success(t('widgets.configSaved'))
    }

    onMounted(loadData)

    return {
      t,
      loading,
      projectId,
      type,
      widget,
      getWidgetComponent,
      getWidgetName,
      getWidgetIcon,
      onWidgetUpdated,
      onWidgetError,
      onWidgetConfigSaved,
      goBack
    }
  }
}
</script>

<style scoped>
.widget-fullpage {
  padding: 16px;
}
.header {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 16px;
}
.back-btn {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 8px 12px;
  border: none;
  background: var(--fp-bg-muted, #f1f3f5);
  border-radius: 6px;
  cursor: pointer;
}
.title {
  margin: 0;
  font-size: 20px;
}
.loading, .empty {
  display: flex;
  align-items: center;
  gap: 8px;
  color: var(--fp-text-muted, #666);
}
.content {
  margin-top: 12px;
}
</style>