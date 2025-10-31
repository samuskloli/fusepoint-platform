<template>
  <div class="project-dashboard">
    <!-- En-tête du tableau de bord -->
    <div class="dashboard-header">
      <div class="header-content" v-if="!loading">
        <div class="project-info">
          <h1 class="project-title">{{ project.name }}</h1>
          <p v-if="project.description" class="project-description">{{ project.description }}</p>
          <div class="project-meta">
            <span class="meta-item">
              <i class="fas fa-calendar mr-2"></i>
              {{ formatDate(project.start_date) }} - {{ formatDate(project.end_date) }}
            </span>
            
            <span class="meta-item">
              <i class="fas fa-flag mr-2"></i>
              {{ t(`projects.priority.${project.priority}`) }}
            </span>
            
            <span class="meta-item">
              <i class="fas fa-users mr-2"></i>
              {{ project.team_members?.length || 0 }} {{ t('projects.members') }}
            </span>
            
            <span v-if="project.budget" class="meta-item">
              <i class="fas fa-euro-sign mr-2"></i>
              {{ formatCurrency(project.budget, project.currency) }}
            </span>
          </div>
        </div>
        
        <div class="header-actions">
          <button 
            @click="toggleEditMode" 
            class="action-btn"
            :class="{ active: isEditMode }"
            v-if="canEditDashboard"
          >
            <i :class="isEditMode ? 'fas fa-check' : 'fas fa-edit'" class="mr-2"></i>
            {{ isEditMode ? t('common.done') : t('common.edit') }}
          </button>
          
          <button 
            @click="showAddWidget = true" 
            class="action-btn primary"
            v-if="isEditMode"
          >
            <i class="fas fa-plus mr-2"></i>
            {{ t('widgets.addWidget') }}
          </button>
          
          <div class="dropdown" v-if="!isEditMode">
            <button @click="toggleDropdown" class="action-btn">
              <i class="fas fa-ellipsis-v"></i>
            </button>
            <div v-if="showDropdown" class="dropdown-menu">
              <button @click="exportDashboard" class="dropdown-item">
                <i class="fas fa-download mr-2"></i>
                {{ t('customizableProjects.exportDashboard') }}
              </button>
              <button @click="resetLayout" class="dropdown-item" v-if="canEditDashboard">
                <i class="fas fa-undo mr-2"></i>
                {{ t('customizableProjects.resetLayout') }}
              </button>
              <button @click="showSettings = true" class="dropdown-item" v-if="canEditDashboard">
                <i class="fas fa-cog mr-2"></i>
                {{ t('customizableProjects.dashboardSettings') }}
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Skeleton header -->
      <div v-else class="header-skeleton">
        <div class="skeleton-title shimmer"></div>
        <div class="skeleton-metas">
          <span v-for="n in 4" :key="n" class="skeleton-pill shimmer"></span>
        </div>
      </div>

      <!-- Quick actions -->
      <div v-if="!isEditMode" class="header-quick-actions">
        <button @click="gotoTab('tasks')" class="qa-btn" :aria-label="t('widgets.taskList.addTask')">
          <i class="fas fa-list-check"></i>
          <span class="qa-label">{{ t('widgets.taskList.addTask') }}</span>
        </button>
        <button @click="gotoTab('files')" class="qa-btn" :aria-label="t('widgets.files.uploadFile')">
          <i class="fas fa-upload"></i>
          <span class="qa-label">{{ t('widgets.files.uploadFile') }}</span>
        </button>
        <button @click="openWidgetByType('calendar')" class="qa-btn" :aria-label="t('widgets.calendar.openCalendar')">
          <i class="fas fa-calendar"></i>
          <span class="qa-label">{{ t('widgets.calendar.openCalendar') }}</span>
        </button>
        <button v-if="canContactAgent" @click="contactAgent" class="qa-btn primary" aria-label="Contacter l’agent">
          <i class="fas fa-headset"></i>
          <span class="qa-label">Contacter l’agent</span>
        </button>
      </div>
    </div>
    
    <!-- Message de bienvenue -->
    <div v-if="dashboardSettings.showWelcomeMessage && !isEditMode" class="welcome-message">
      <div class="welcome-content">
        <h3 class="welcome-title">{{ t('dashboard.welcome') }}</h3>
        <p class="welcome-text">{{ t('dashboard.welcomeText') }}</p>
        <button @click="dismissWelcome" class="welcome-dismiss">
          <i class="fas fa-times"></i>
        </button>
      </div>
    </div>
    
    <!-- État de chargement -->
    <div v-if="loading" class="loading-state">
      <div class="loading-spinner">
        <i class="fas fa-spinner fa-spin text-3xl text-blue-600"></i>
        <p class="loading-text">{{ t('common.loading') }}</p>
      </div>
      <div class="widgets-skeleton-grid">
        <div v-for="n in 4" :key="n" class="widget-skeleton shimmer"></div>
      </div>
    </div>

    <!-- Conteneur des widgets -->
    <div v-else class="widgets-container">
      <div 
        class="widgets-grid"
        :class="{
          'edit-mode': isEditMode
        }"
      >
        <!-- Placeholder pour ajouter des widgets -->
        <div v-if="isEditMode && projectWidgets.length === 0" class="widget-placeholder">
          <div class="placeholder-content">
            <i class="fas fa-plus text-4xl text-gray-300 mb-4"></i>
            <h3 class="placeholder-title">{{ t('widgets.noWidgets') }}</h3>
            <p class="placeholder-description">{{ t('widgets.addFirstWidget') }}</p>
            <button @click="showAddWidget = true" class="placeholder-btn">
              <i class="fas fa-plus mr-2"></i>
              {{ t('widgets.addWidget') }}
            </button>
          </div>
        </div>
        
        <!-- Widgets -->
        <div 
          v-for="widget in sortedWidgets" 
          :key="widget.id"
          class="widget-container"
          :class="{ dragging: draggingWidget && draggingWidget.id === widget.id }"
          :style="getWidgetStyle(widget)"
        >
          <!-- Overlay d'édition -->
          <div v-if="isEditMode" class="widget-edit-overlay">
            <!-- Poignée de déplacement -->
            <div 
              class="drag-handle" 
              @mousedown="startDrag(widget, $event)" 
              :title="t('widgets.move') || 'Déplacer le widget'"
            >
              <i class="fas fa-grip-vertical"></i>
            </div>
            <div class="edit-controls">
              <button 
                @click="moveWidgetUp(widget)"
                class="edit-btn"
                :title="t('widgets.moveUp')"
              >
                <i class="fas fa-arrow-up"></i>
              </button>
              <button 
                @click="moveWidgetDown(widget)"
                class="edit-btn"
                :title="t('widgets.moveDown')"
              >
                <i class="fas fa-arrow-down"></i>
              </button>
              <button 
                @click="configureWidget(widget)"
                class="edit-btn"
                :title="t('widgets.configure')"
              >
                <i class="fas fa-cog"></i>
              </button>
              <button 
                @click="toggleWidgetEnabled(widget)"
                class="edit-btn"
                :class="{ active: widget.is_enabled }"
                :title="widget.is_enabled ? t('widgets.disable') : t('widgets.enable')"
              >
                <i :class="widget.is_enabled ? 'fas fa-eye' : 'fas fa-eye-slash'"></i>
              </button>
              <button 
                @click="removeWidget(widget)"
                class="edit-btn danger"
                :title="t('widgets.remove')"
              >
                <i class="fas fa-trash"></i>
              </button>
            </div>
            
            <!-- Poignées de redimensionnement -->
            <div v-if="dashboardSettings.allowWidgetResize" class="resize-handles">
              <div 
                class="resize-handle resize-e"
                @mousedown="startResize(widget, 'e', $event)"
              ></div>
              <div 
                class="resize-handle resize-s"
                @mousedown="startResize(widget, 's', $event)"
              ></div>
              <div 
                class="resize-handle resize-se"
                @mousedown="startResize(widget, 'se', $event)"
              ></div>
            </div>
          </div>

          <!-- Composant widget -->
          <template v-if="!isMobile">
            <component 
              :is="getWidgetComponent(widget.widget_type)"
              :project-id="projectId"
              :widget="widget"
              @widget-updated="handleWidgetUpdated"
              @widget-error="handleWidgetError"
            />
            <!-- Action ouverture plein écran - repositionné en bas à droite -->
            <div v-if="!isEditMode" class="widget-fullscreen-btn">
              <button class="fullscreen-btn" @click.stop="openWidget(widget)" title="Voir en plein écran">
                <i class="fas fa-expand"></i>
              </button>
            </div>
          </template>
          
          <!-- Rendu mobile: tuile cliquable -->
          <template v-else>
            <div class="widget-icon-tile" @click="openWidget(widget)" role="button" tabindex="0" @keydown.enter="openWidget(widget)">
              <div class="tile-icon-badge">
                <i :class="getWidgetIcon(widget.widget_type)" class="tile-icon"></i>
              </div>
              <div class="tile-label">{{ getWidgetName(widget.widget_type) }}</div>
            </div>
          </template>
        </div>
      </div>
    </div>
    
    <!-- Modales -->
    <AddWidgetModal 
      v-if="showAddWidget"
      :is-open="showAddWidget"
      :existing-widgets="projectWidgets"
      @close="showAddWidget = false"
      @add-widget="handleAddWidgetFromModal"
    />
    
    <WidgetConfigModal 
      v-if="showWidgetConfig"
      :widget="configuringWidget"
      @close="showWidgetConfig = false"
      @config-saved="handleWidgetConfigSaved"
    />
    <WidgetViewerModal 
      v-if="showWidgetViewer"
      :is-open="showWidgetViewer"
      :widget="viewingWidget"
      :project-id="project.id"
      @close="showWidgetViewer = false"
    />
    
    <DashboardSettingsModal 
      v-if="showSettings"
      :dashboard-settings="dashboardSettings"
      :layout-settings="layoutSettings"
      @close="showSettings = false"
      @settings-saved="handleSettingsSaved"
    />
    <ConfirmDeleteModal 
      v-if="showDeleteConfirm"
      :title="t('widgets.remove')"
      :message="deleteConfirmMessage"
      @close="showDeleteConfirm = false"
      @confirm="performDeleteWidget"
    />
  </div>
</template>

<script>
import { ref, computed, onMounted, onUnmounted, watch } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import projectManagementService from '@/services/projectManagementService'
import widgetApiService from '@/components/widgets/shared/services/widgetApiService'
import { useNotifications } from '@/composables/useNotifications'
import { useAuth } from '@/composables/useAuth'
import { useTranslation } from '@/composables/useTranslation'
import { componentNameToType, typeToIcon, typeToNameKey } from '@/utils/widgetsMap'

// Import des widgets
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
import ProjectOverviewWidget from '@/components/widgets/ProjectOverviewWidget.vue'
import BudgetWidget from '@/components/widgets/BudgetWidget.vue'

import NotesWidget from '@/components/widgets/NotesWidget.vue'

// Import des modales
import AddWidgetModal from '@/components/modals/AddWidgetModal.vue'
import WidgetConfigModal from '@/components/modals/WidgetConfigModal.vue'
import WidgetViewerModal from '@/components/modals/WidgetViewerModal.vue'
import DashboardSettingsModal from '@/components/modals/DashboardSettingsModal.vue'
import ConfirmDeleteModal from '@/components/ConfirmDeleteModal.vue'
import commentsService from '@/services/commentsService'
import widgetDataService from '@/services/widgetDataService'
import checklistService from '@/components/widgets/services/checklistService'

export default {
  name: 'ProjectDashboard',
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
    DeliverablesWidget,
    ProjectOverviewWidget,
    BudgetWidget,

    NotesWidget,
    AddWidgetModal,
    WidgetConfigModal,
    WidgetViewerModal,
    DashboardSettingsModal,
    ConfirmDeleteModal
  },
  props: {
    projectId: {
      type: [String, Number],
      required: true
    }
  },
  setup(props) {
    const { success, error: showError, confirm } = useNotifications()
    const { user, hasPermission, hasRole } = useAuth()
    const { t } = useTranslation()
    const router = useRouter()
    const route = useRoute()
    
    // État réactif
    const loading = ref(false)
    const project = ref({})
    const projectWidgets = ref([])
    const isEditMode = ref(false)
    const showDropdown = ref(false)
    const showAddWidget = ref(false)
    const showWidgetConfig = ref(false)
    const showSettings = ref(false)
    const configuringWidget = ref(null)
    const resizingWidget = ref(null)
    const showWidgetViewer = ref(false)
    const viewingWidget = ref(null)
    const showDeleteConfirm = ref(false)
    const deleteConfirmMessage = ref('')
    const widgetToDelete = ref(null)

    // Détection du viewport (mobile)
    const isMobile = ref(false)
    const updateIsMobile = () => {
      isMobile.value = window.innerWidth <= 768
    }
    onMounted(() => {
      updateIsMobile()
      window.addEventListener('resize', updateIsMobile)
    })
    onUnmounted(() => {
      window.removeEventListener('resize', updateIsMobile)
    })

    // Paramètres du tableau de bord
    const dashboardSettings = ref({
      showWelcomeMessage: true,
      enableNotifications: true,
      autoSaveLayout: true,
      allowWidgetResize: true,
      colorScheme: 'light',
      accentColor: '#3B82F6'
    })
    
    // Paramètres de disposition
    const layoutSettings = ref({
      columns: 12,
      spacing: 'normal'
    })
    
    // Overrides persistés pour taille/position (chargés depuis serveur/local)
    const layoutOverrides = ref({})
    
    // Permissions renvoyées par l’API dashboard
    const apiPermissions = ref({ canEdit: false })
    
    // Propriétés calculées
    const canEditDashboard = computed(() => {
      // Priorité aux permissions renvoyées par l’API
      if (apiPermissions.value && typeof apiPermissions.value.canEdit === 'boolean') {
        return apiPermissions.value.canEdit
      }
      // Fallback côté client si l’API ne fournit pas la permission
      if (hasRole('client')) return false
      return hasPermission('edit_project_dashboard') || project.value.created_by === user.value?.id
    })
    
    const canContactAgent = computed(() => {
      return hasRole('client') || hasPermission('contact_agent')
    })

    const sortedWidgets = computed(() => {
      return [...projectWidgets.value]
        .filter(widget => widget.is_enabled || isEditMode.value)
        .sort((a, b) => {
          const aOrder = a.position_y * layoutSettings.value.columns + a.position_x
          const bOrder = b.position_y * layoutSettings.value.columns + b.position_x
          return aOrder - bOrder
        })
    })

    // Helpers mapping and transform
    const transformBackendWidgetToUI = (w) => ({
      id: w.id,
      widget_id: w.widgetId ?? w.widget_id ?? w.id,
      widget_type: componentNameToType(w.componentName ?? w.component_name),
      position_x: w.position?.x ?? w.position_x ?? 0,
      position_y: w.position?.y ?? w.position_y ?? 0,
      width: w.size?.width ?? w.width ?? 4,
      height: w.size?.height ?? w.height ?? 2,
      is_enabled: (typeof w.isEnabled !== 'undefined' ? w.isEnabled : (typeof w.is_enabled !== 'undefined' ? w.is_enabled : true)),
      widget_config: w.config ?? w.widget_config ?? {},
      component_name: w.componentName ?? w.component_name
    })

    // Méthodes
    const loadProject = async () => {
      try {
        const result = await projectManagementService.getProjectDetails(props.projectId)
        if (result.success) {
          project.value = result.data
        }
      } catch (err) {
        showError(t('errors.loadingFailed'))
      }
    }
    
    const loadProjectWidgets = async () => {
      try {
        // CORRECTION: Utiliser l'API unifiée du dashboard au lieu de l'ancienne API des widgets clients
        // Cela garantit que l'agent et le client voient les mêmes données
        const dashboardData = await widgetApiService.getProjectDashboardLayout(String(props.projectId))
        
        if (dashboardData && dashboardData.layout && dashboardData.layout.widgetsLayout) {
          // Convertir le layout du dashboard en widgets pour l'affichage
          const widgetsLayout = dashboardData.layout.widgetsLayout
          projectWidgets.value = Object.entries(widgetsLayout).map(([widgetKey, layoutData]) => {
            // Les clés du layout sont du type "<type>:<widget_id>"
            const [keyType, keyId] = String(widgetKey).includes(':')
              ? String(widgetKey).split(':', 2)
              : [layoutData.widget_type || 'widget', String(widgetKey)]
            const widgetType = layoutData.widget_type || keyType
            const widgetId = layoutData.widget_id || layoutData.widgetId || keyId
            return {
              id: widgetId,
              widget_id: widgetId,
              widget_type: widgetType,
              position_x: layoutData.position_x || 0,
              position_y: layoutData.position_y || 0,
              width: layoutData.width || 4,
              height: layoutData.height || 2,
              is_enabled: layoutData.is_enabled !== false,
              widget_config: layoutData.widget_config || {},
              component_name: layoutData.component_name || undefined
            }
          })
        } else {
          // Fallback vers l'ancienne API si le nouveau dashboard n'existe pas encore
          console.warn('Dashboard layout not found, falling back to legacy widget API')
          const clientId = project.value?.client_id || route.params.clientId
          const widgets = await widgetApiService.getClientProjectWidgets(String(clientId), String(props.projectId))
          projectWidgets.value = Array.isArray(widgets) ? widgets.map(transformBackendWidgetToUI) : []
        }

        if (!projectWidgets.value.length) {
          // Persist a default set in DB for first-time projects
          const initialized = await initializeDefaultWidgetsPersisted()
          if (initialized) {
            // Recharger depuis l'API unifiée après initialisation
            const reloadedDashboard = await widgetApiService.getProjectDashboardLayout(String(props.projectId))
            if (reloadedDashboard && reloadedDashboard.layout && reloadedDashboard.layout.widgetsLayout) {
              const widgetsLayout = reloadedDashboard.layout.widgetsLayout
              projectWidgets.value = Object.entries(widgetsLayout).map(([widgetKey, layoutData]) => {
                // Les clés du layout sont du type "<type>:<widget_id>"
                const [keyType, keyId] = String(widgetKey).includes(':')
                  ? String(widgetKey).split(':', 2)
                  : [layoutData.widget_type || 'widget', String(widgetKey)]
                const widgetType = layoutData.widget_type || keyType
                const widgetId = layoutData.widget_id || layoutData.widgetId || keyId
                return {
                  id: widgetId,
                  widget_id: widgetId,
                  widget_type: widgetType,
                  position_x: layoutData.position_x || 0,
                  position_y: layoutData.position_y || 0,
                  width: layoutData.width || 4,
                  height: layoutData.height || 2,
                  is_enabled: layoutData.is_enabled !== false,
                  widget_config: layoutData.widget_config || {},
                  component_name: layoutData.component_name || undefined
                }
              })
            } else {
              projectWidgets.value = getDefaultWidgets()
            }
          } else {
            // Fallback to local defaults if persistence fails
            projectWidgets.value = getDefaultWidgets()
          }
        }
      } catch (err) {
        console.error('Failed to load project widgets', err)
        projectWidgets.value = getDefaultWidgets()
      }
    }

    const getDefaultWidgets = () => {
      // Disposition par défaut optimisée pour une vue Overview
      const pid = String(props.projectId || 'project')
      const mkId = (suffix) => `w_${pid}_${suffix}`
      return [
        {
          id: mkId('stats'),
          widget_id: mkId('stats'),
          widget_type: 'stats',
          component_name: getWidgetComponent('stats'),
          position_x: 0,
          position_y: 0,
          width: 12,
          height: 3, // plus de hauteur pour afficher les indicateurs
          is_enabled: true,
          widget_config: {}
        },
        {
          id: mkId('tasks'),
          widget_id: mkId('tasks'),
          widget_type: 'task_list',
          component_name: getWidgetComponent('task_list'),
          position_x: 0,
          position_y: 4, // espace d'une ligne sous le bloc stats
          width: 8,
          height: 5, // plus de hauteur pour la liste des tâches
          is_enabled: true,
          widget_config: {}
        },
        {
          id: mkId('files'),
          widget_id: mkId('files'),
          widget_type: 'files',
          component_name: getWidgetComponent('files'),
          position_x: 8,
          position_y: 4, // aligné avec tasks pour la même rangée
          width: 4,
          height: 5, // plus de hauteur pour parcourir les fichiers
          is_enabled: true,
          widget_config: {}
        },
        {
          id: mkId('team'),
          widget_id: mkId('team'),
          widget_type: 'team',
          component_name: getWidgetComponent('team'),
          position_x: 0,
          position_y: 10, // laisser de l'espace après la rangée tasks/files
          width: 6, // demi-largeur pour permettre un agencement en grille
          height: 4, // hauteur adaptée pour l'équipe
          is_enabled: true,
          widget_config: {}
        },
        {
          id: mkId('deliverables'),
          widget_id: mkId('deliverables'),
          widget_type: 'deliverables',
          component_name: getWidgetComponent('deliverables'),
          position_x: 6, // à côté du widget Équipe
          position_y: 10, // aligné sur la même rangée que Équipe
          width: 6, // demi-largeur
          height: 4, // hauteur adaptée pour les livrables
          is_enabled: true,
          widget_config: {}
        }
      ]
    }

    const initializeDefaultWidgetsPersisted = async () => {
      try {
        // Utiliser l'API unifiée pour initialiser les widgets par défaut
        // Les widgets par défaut sont déjà définis dans projectWidgets.value
        const defaults = getDefaultWidgets()
        projectWidgets.value = defaults
        
        // Sauvegarder la configuration initiale via l'API unifiée
        await saveProjectDashboardLayout()
        
        return true
      } catch (e) {
        console.error('Failed to initialize default widgets persisted', e)
        return false
      }
    }
    
    const getWidgetComponent = (widgetType) => {
      const componentMap = {
        'task_list': 'TaskListWidget',
        'tasks': 'TaskListWidget',
        'stats': 'StatsWidget',
        'calendar': 'CalendarWidget',
        'comments': 'CommentsWidget',
        'goals': 'GoalsWidget',
        'ai': 'AIWidget',
        'files': 'FilesWidget',
        'history': 'HistoryWidget',
        'checklist': 'ChecklistWidget',
        'team': 'TeamWidget',
        'deliverables': 'DeliverablesWidget',
        'project_overview': 'ProjectOverviewWidget',
        'budget': 'BudgetWidget',

        'notes': 'NotesWidget'
      }
      return componentMap[widgetType] || 'div'
    }
    
    const getWidgetStyle = (widget) => {
      if (isMobile.value) {
        return {
          gridColumn: 'span 1',
          gridRow: 'span 1'
        }
      }
      return {
        gridColumnStart: (Number(widget.position_x || 0) + 1),
        gridColumn: `span ${widget.width || 4}`,
        gridRowStart: (Number(widget.position_y || 0) + 1),
        gridRow: `span ${widget.height || 2}`
      }
    }
    
    const toggleEditMode = async () => {
      isEditMode.value = !isEditMode.value
      if (!isEditMode.value) {
        await persistAllWidgetPositions()
        saveDashboardSettings()
      }
    }
    
    const toggleDropdown = () => {
      showDropdown.value = !showDropdown.value
    }
    
    const configureWidget = (widget) => {
      configuringWidget.value = widget
      showWidgetConfig.value = true
    }
    
    const toggleWidgetEnabled = async (widget) => {
      try {
        widget.is_enabled = !widget.is_enabled
        // Utiliser l'API unifiée pour sauvegarder l'état du widget
        await saveProjectDashboardLayout()
        success(t('widgets.statusUpdated'))
      } catch (err) {
        showError(t('errors.updateFailed'))
        widget.is_enabled = !widget.is_enabled // Revert
      }
    }

    const findSortedWidgets = () => {
      return [...projectWidgets.value]
        .sort((a, b) => {
          const aOrder = a.position_y * layoutSettings.value.columns + a.position_x
          const bOrder = b.position_y * layoutSettings.value.columns + b.position_x
          return aOrder - bOrder
        })
    }

    const persistWidgetPosition = async (w) => {
      // Skip non-persisted temp widgets
      if (!w.widget_id || String(w.widget_id).startsWith('temp-')) return
      
      // Utiliser l'API unifiée pour sauvegarder toute la configuration du dashboard
      await saveProjectDashboardLayout()
    }

    const persistAllWidgetPositions = async () => {
      try {
        // Utiliser l'API unifiée pour sauvegarder toute la configuration du dashboard
        // Cela inclut les positions et l'ordre des widgets
        await saveProjectDashboardLayout()
        success(t('widgets.configSaved'))
      } catch (e) {
        console.warn('Failed to persist layout:', e)
        showError(t('errors.saveFailed'))
      }
    }

    const moveWidgetUp = async (widget) => {
      const sorted = findSortedWidgets()
      const idx = sorted.findIndex(w => w.id === widget.id)
      if (idx <= 0) return
      const above = sorted[idx - 1]
      // Échanger positions complètes pour éviter les chevauchements
      const tmpX = widget.position_x
      const tmpY = widget.position_y
      widget.position_x = above.position_x
      widget.position_y = above.position_y
      above.position_x = tmpX
      above.position_y = tmpY
      try {
        await Promise.all([persistWidgetPosition(widget), persistWidgetPosition(above)])
        success(t('widgets.configSaved'))
        await saveDashboardSettings()
      } catch (e) {
        showError(t('errors.updateFailed'))
      }
    }

    const moveWidgetDown = async (widget) => {
      const sorted = findSortedWidgets()
      const idx = sorted.findIndex(w => w.id === widget.id)
      if (idx === -1 || idx >= sorted.length - 1) return
      const below = sorted[idx + 1]
      const tmpX = widget.position_x
      const tmpY = widget.position_y
      widget.position_x = below.position_x
      widget.position_y = below.position_y
      below.position_x = tmpX
      below.position_y = tmpY
      try {
        await Promise.all([persistWidgetPosition(widget), persistWidgetPosition(below)])
        success(t('widgets.configSaved'))
        await saveDashboardSettings()
      } catch (e) {
        showError(t('errors.updateFailed'))
      }
    }

    const clamp = (n, min, max) => Math.max(min, Math.min(n, max))

    const persistWidgetSize = async (w) => {
      if (!w.widget_id || String(w.widget_id).startsWith('temp-')) return
      
      // Utiliser l'API unifiée pour sauvegarder la taille du widget
      await saveProjectDashboardLayout()
    }

    const startResize = (widget, handle, event) => {
      const gridEl = document.querySelector('.widgets-grid')
      const rect = gridEl?.getBoundingClientRect?.()
      const cellWidth = rect ? (rect.width / (layoutSettings.value?.columns || 12)) : 100
      const rowUnit = 140 // correspond à grid-auto-rows: minmax(140px, auto)

      resizingWidget.value = {
        id: widget.id,
        handle,
        startX: event?.clientX || 0,
        startY: event?.clientY || 0,
        initialWidth: widget.width || 4,
        initialHeight: widget.height || 2,
        cellWidth,
        rowUnit
      }

      window.addEventListener('mousemove', onResizeMouseMove)
      window.addEventListener('mouseup', onResizeMouseUp)
    }

    const onResizeMouseMove = (e) => {
      const r = resizingWidget.value
      if (!r) return
      const dxUnits = Math.round((e.clientX - r.startX) / r.cellWidth)
      const dyUnits = Math.round((e.clientY - r.startY) / r.rowUnit)
      const target = projectWidgets.value.find(w => w.id === r.id)
      if (!target) return

      if (r.handle === 'e' || r.handle === 'se') {
        const maxCols = layoutSettings.value?.columns || 12
        target.width = clamp((r.initialWidth + dxUnits), 1, maxCols)
      }
      if (r.handle === 's' || r.handle === 'se') {
        target.height = clamp((r.initialHeight + dyUnits), 1, 12)
      }
    }

    const onResizeMouseUp = async () => {
      const r = resizingWidget.value
      if (!r) return
      window.removeEventListener('mousemove', onResizeMouseMove)
      window.removeEventListener('mouseup', onResizeMouseUp)
      const target = projectWidgets.value.find(w => w.id === r.id)
      resizingWidget.value = null
      if (!target) return
      try {
        // Toujours persister la taille côté serveur si possible
        await persistWidgetSize(target)
        // Capturer un snapshot du layout (local + serveur via settings)
        await saveDashboardSettings()
        success(t('widgets.configSaved'))
      } catch (err) {
        showError(t('errors.saveFailed'))
      }
    }

    // === Déplacement par glisser-déposer ===
    const draggingWidget = ref(null)

    const startDrag = (widget, event) => {
      if (!isEditMode.value) return
      // Empêcher la sélection de texte et la propagation
      event?.preventDefault?.()
      event?.stopPropagation?.()
      const gridEl = document.querySelector('.widgets-grid')
      const rect = gridEl?.getBoundingClientRect?.()
      const cellWidth = rect ? (rect.width / (layoutSettings.value?.columns || 12)) : 100
      const rowUnit = 140

      // Désactiver la sélection pendant le drag
      try {
        document.body.style.userSelect = 'none'
        document.body.style.webkitUserSelect = 'none'
        document.body.style.msUserSelect = 'none'
      } catch {}

      draggingWidget.value = {
        id: widget.id,
        startX: event?.clientX || 0,
        startY: event?.clientY || 0,
        initialX: widget.position_x || 0,
        initialY: widget.position_y || 0,
        cellWidth,
        rowUnit,
        gridRect: rect
      }

      // Écouter les mouvements pour empêcher les comportements par défaut
      window.addEventListener('mousemove', onDragMouseMove)
      window.addEventListener('mouseup', onDragMouseUp)
    }

    const onDragMouseMove = (e) => {
      // Éviter la sélection de texte pendant la glisse et mettre à jour l’aperçu de position
      e?.preventDefault?.()
      const r = draggingWidget.value
      if (!r) return
      const target = projectWidgets.value.find(w => w.id === r.id)
      if (!target || !r.gridRect) return
      const columns = layoutSettings.value?.columns || 12
      const col = clamp(Math.floor((e.clientX - r.gridRect.left) / r.cellWidth), 0, Math.max(0, columns - (target.width || 1)))
      const currentBottom = projectWidgets.value.reduce((max, w) => {
        const h = Number(w.height || 1)
        const y = Number(w.position_y || 0)
        return Math.max(max, y + h)
      }, 0)
      const maxRow = Math.max(currentBottom, target.position_y || 0)
      const row = clamp(Math.floor((e.clientY - r.gridRect.top) / r.rowUnit), 0, maxRow)
      target.position_x = col
      target.position_y = row
    }

    const onDragMouseUp = async (e) => {
      const r = draggingWidget.value
      if (!r) return
      // Réactiver la sélection
      try {
        document.body.style.userSelect = ''
        document.body.style.webkitUserSelect = ''
        document.body.style.msUserSelect = ''
      } catch {}
      window.removeEventListener('mousemove', onDragMouseMove)
      window.removeEventListener('mouseup', onDragMouseUp)
      draggingWidget.value = null

      try {
        const target = projectWidgets.value.find(w => w.id === r.id)
        if (!target) return

        const columns = layoutSettings.value?.columns || 12
        const rect = r.gridRect
        if (!rect) return
        // Calculer la colonne et la ligne de destination en fonction de la position du curseur
        const col = clamp(Math.floor((e.clientX - rect.left) / r.cellWidth), 0, Math.max(0, columns - (target.width || 1)))
        const currentBottom = projectWidgets.value.reduce((max, w) => {
          const h = Number(w.height || 1)
          const y = Number(w.position_y || 0)
          return Math.max(max, y + h)
        }, 0)
        const maxRow = Math.max(currentBottom, target.position_y || 0)
        const row = clamp(Math.floor((e.clientY - rect.top) / r.rowUnit), 0, maxRow)

        target.position_x = col
        target.position_y = row

        await persistWidgetPosition(target)
        await saveDashboardSettings()
        // Éviter d’effacer des messages en cours (ex: dans le widget commentaires) avec un toast intrusif
        // Le layout est bien enregistré en arrière-plan.
      } catch (err) {
        console.warn('Drag move failed:', err)
        showError(t('errors.updateFailed'))
      }
    }
    
    const fetchLinkedDataCounts = async (widget) => {
      const counts = { tasks: 0, files: 0, comments: 0, deliverables: 0, checklists: 0 }
      try {
        switch (widget.widget_type) {
          case 'task_list': {
            const res = await projectManagementService.getProjectTasks(props.projectId)
            counts.tasks = Array.isArray(res?.data) ? res.data.length : 0
            break
          }
          case 'files': {
            const res = await projectManagementService.getProjectFiles(props.projectId)
            counts.files = Array.isArray(res?.data) ? res.data.length : 0
            break
          }
          case 'comments': {
            const res = await commentsService.getComments('project', Number(props.projectId))
            counts.comments = Array.isArray(res) ? res.length : 0
            break
          }
          case 'deliverables': {
            const res = await widgetDataService.getDeliverablesData(props.projectId)
            const list = res?.deliverables || res?.data || []
            counts.deliverables = Array.isArray(list) ? list.length : 0
            break
          }
          case 'checklist': {
            const res = await checklistService.getChecklists(String(props.projectId))
            counts.checklists = Array.isArray(res?.data) ? res.data.length : 0
            break
          }
          default:
            break
        }
      } catch (e) {
        console.warn('Failed to fetch linked data counts:', e)
      }
      return counts
    }

    const buildDeleteMessage = (widget, counts) => {
      const label = getWidgetName(widget.widget_type)
      const parts = []
      if (widget.widget_type === 'task_list' && counts.tasks > 0) parts.push(`${counts.tasks} tâches`)
      if (widget.widget_type === 'files' && counts.files > 0) parts.push(`${counts.files} fichiers`)
      if (widget.widget_type === 'comments' && counts.comments > 0) parts.push(`${counts.comments} notes/commentaires`)
      if (widget.widget_type === 'deliverables' && counts.deliverables > 0) parts.push(`${counts.deliverables} livrables`)
      if (widget.widget_type === 'checklist' && counts.checklists > 0) parts.push(`${counts.checklists} checklists`)
      const hasData = parts.length > 0
      if (hasData) {
        return `Ce widget “${label}” est lié à ${parts.join(', ')} dans ce projet. Supprimer le widget n’efface pas ces données, mais vous ne pourrez plus y accéder depuis le tableau de bord. Voulez-vous vraiment supprimer ce widget ?`
      }
      return `Voulez-vous supprimer le widget “${label}” ?`
    }

    const removeWidget = async (widget) => {
      try {
        const counts = await fetchLinkedDataCounts(widget)
        deleteConfirmMessage.value = buildDeleteMessage(widget, counts)
      } catch (e) {
        deleteConfirmMessage.value = 'Êtes-vous sûr de vouloir supprimer ce widget ?'
      }
      widgetToDelete.value = widget
      showDeleteConfirm.value = true
    }

    const performDeleteWidget = async () => {
      showDeleteConfirm.value = false
      const widget = widgetToDelete.value
      if (!widget) return
      try {
        // Snapshot avant suppression (local)
        const beforeSnapshot = snapshotCurrentLayout()
        const beforeCount = Array.isArray(projectWidgets.value) ? projectWidgets.value.length : 0
        // Supprimer le widget de la liste locale (utiliser la clé composite pour éviter les collisions d'ID)
        const keyToRemove = getWidgetKey(widget)
        projectWidgets.value = projectWidgets.value.filter(w => getWidgetKey(w) !== keyToRemove)
        const afterCount = Array.isArray(projectWidgets.value) ? projectWidgets.value.length : 0
        // Snapshot après suppression (local)
        const afterLocalSnapshot = snapshotCurrentLayout()

        // Sécurité: si une suppression isolée vide tout le dashboard de manière inattendue, on annule et on recharge
        if (beforeCount > 1 && afterCount === 0) {
          console.warn('[Dashboard] Suppression annulée: le tableau de bord serait entièrement vide après suppression d’un seul widget.', {
            beforeCount,
            afterCount,
            removedId: widget.id
          })
          // Recharger depuis l’API pour rétablir l’état précédent
          await loadProjectWidgets()
          showError('La suppression a été annulée car elle aurait vidé tout le tableau de bord.')
          return
        }
        
        // Sauvegarder via l'API unifiée
        await saveProjectDashboardLayout()

        // Forcer un rechargement depuis le serveur et comparer les layouts
        try {
          const reloaded = await widgetApiService.getProjectDashboardLayout(String(props.projectId))
          const serverLayout = reloaded?.layout?.widgetsLayout || {}
          const localKeys = Object.keys(afterLocalSnapshot)
          const serverKeys = Object.keys(serverLayout)
          const mismatch = (serverKeys.length !== localKeys.length) || serverKeys.some(k => !localKeys.includes(k))
          if (mismatch) {
            console.warn('[Dashboard] Mismatch layout après suppression', {
              beforeCount,
              afterCount,
              localKeys,
              serverKeys
            })
            // Tentative de ré-enregistrement du layout local si le serveur a "perdu" des widgets
            await saveProjectDashboardLayout()
            // Puis recharger pour synchroniser l'UI avec l'état serveur final
            await loadProjectWidgets()
            showError('Incohérence détectée entre la configuration locale et la configuration serveur après suppression. Un resynchronisation a été effectuée.')
          }
        } catch (cmpErr) {
          console.warn('Échec de la comparaison des layouts après suppression:', cmpErr)
        }
        
        success(t('widgets.removed'))
      } catch (err) {
        showError(t('errors.deleteFailed'))
      } finally {
        widgetToDelete.value = null
      }
    }
    
    const getAdaptiveSizeForType = (type) => {
      const sizes = {
        // Tailles logiques par type pour un layout esthétique
        // Largeurs sur 12 colonnes
        stats: { width: 12, height: 3 },        // Statistiques globales: bandeau complet
        task_list: { width: 8, height: 5 },     // Liste des tâches: large
        tasks: { width: 8, height: 5 },         // Alias
        files: { width: 4, height: 5 },         // Fichiers: colonne
        team: { width: 6, height: 4 },          // Équipe: demi-largeur
        deliverables: { width: 6, height: 4 },  // Livrables: demi-largeur
        calendar: { width: 8, height: 6 },      // Calendrier: large
        goals: { width: 6, height: 4 },         // Objectifs: demi-largeur
        comments: { width: 6, height: 4 },      // Commentaires/Notes: demi-largeur
        history: { width: 6, height: 4 },       // Historique: demi-largeur
        checklist: { width: 6, height: 4 },     // Checklist: demi-largeur
        project_overview: { width: 6, height: 3 }, // Vue d'ensemble: demi-largeur
        budget: { width: 6, height: 4 },        // Budget: demi-largeur
        notes: { width: 6, height: 4 },         // Notes: demi-largeur
        ai: { width: 6, height: 5 }             // Assistant/AI: demi-largeur
      }
      return sizes[type] || { width: 4, height: 2 }
    }

    const handleAddWidgetFromModal = async (selected) => {
      try {
        const selectedList = Array.isArray(selected) ? selected : [selected]
        if (!selectedList.length) return

        const fallbackNameMap = {
          tasks: 'TasksWidget',
          task_list: 'TaskListWidget',
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

        // Position de départ sous le contenu existant
        const columns = 12
        const currentBottom = projectWidgets.value.reduce((max, w) => {
          const h = Number(w.height || 1)
          const y = Number(w.position_y || 0)
          return Math.max(max, y + h)
        }, 0)
        let rowY = currentBottom + 1
        let rowX = 0
        let rowHeight = 0

        const newWidgets = []
        selectedList.forEach((selectedWidget, idx) => {
          const initialType = selectedWidget?.type || selectedWidget?.widget_type
          const rawComponentName = selectedWidget?.component_name || (initialType ? fallbackNameMap[initialType] : null)
          const derivedType = rawComponentName ? componentNameToType(rawComponentName) : undefined
          const type = (initialType && initialType !== 'widget')
            ? initialType
            : ((derivedType && derivedType !== 'widget') ? derivedType : 'task_list')
          const componentName = rawComponentName || fallbackNameMap[type] || 'TaskListWidget'

          const adaptive = getAdaptiveSizeForType(type)
          const width = Math.min(selectedWidget?.default_width ?? adaptive.width, columns)
          const height = selectedWidget?.default_height ?? adaptive.height

          // Saut de ligne si dépassement horizontal
          if (rowX + width > columns) {
            rowY += rowHeight + 1
            rowX = 0
            rowHeight = 0
          }

          const widgetId = `widget_${Date.now()}_${idx}`
          const newWidget = {
            id: widgetId,
            widget_id: widgetId,
            widget_type: type,
            component_name: componentName,
            position_x: rowX,
            position_y: rowY,
            width,
            height,
            is_enabled: true,
            widget_config: {}
          }

          newWidgets.push(newWidget)
          // Avancer le curseur horizontal et mettre à jour la hauteur de ligne
          rowX += width
          rowHeight = Math.max(rowHeight, height)
        })

        projectWidgets.value.push(...newWidgets)
        await saveProjectDashboardLayout()

        showAddWidget.value = false
        success(selectedList.length > 1 ? t('widgets.addedMultiple', { count: selectedList.length }) : t('widgets.added'))
      } catch (err) {
        console.error('Failed to add widget(s)', err)
        showError(t('errors.saveFailed'))
      }
    }

    const handleWidgetAdded = (newWidget) => {
      projectWidgets.value.push(newWidget)
      success(t('widgets.added'))
    }
    
    const handleWidgetUpdated = (updatedWidget) => {
      const index = projectWidgets.value.findIndex(w => w.id === updatedWidget.id)
      if (index !== -1) {
        projectWidgets.value[index] = updatedWidget
      }
    }
    
    const handleWidgetError = (error) => {
      showError(error.message || t('errors.widgetError'))
    }
    
    const handleWidgetConfigSaved = (updatedWidget) => {
      handleWidgetUpdated(updatedWidget)
      success(t('widgets.configSaved'))
    }
    
    const handleSettingsSaved = (settings) => {
      dashboardSettings.value = { ...dashboardSettings.value, ...settings.dashboard }
      layoutSettings.value = { ...layoutSettings.value, ...settings.layout }
      saveDashboardSettings()
      success(t('dashboard.settingsSaved'))
    }
    
    const dismissWelcome = () => {
      dashboardSettings.value.showWelcomeMessage = false
      saveDashboardSettings()
    }
    
    const exportDashboard = () => {
      // Logique d'export
      console.log('Export dashboard')
    }
    
    const resetLayout = async () => {
      const confirmed = await confirm(t('dashboard.confirmReset'))
      if (confirmed) {
        // Reset layout logic
        await loadProjectWidgets()
        success(t('dashboard.layoutReset'))
      }
    }
    
    // Helpers d'affichage des tuiles et ouverture du modal
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
        'checklist': 'fas fa-clipboard-list',
        'project_overview': 'fas fa-project-diagram',
        'budget': 'fas fa-euro-sign',
        'documents': 'fas fa-folder',
        'notes': 'fas fa-sticky-note'
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
        'checklist': 'widgets.checklist.title',
        'project_overview': 'widgets.project_overview.title',
        'budget': 'widgets.budget.title',
        'documents': 'widgets.documents.title',
        'notes': 'widgets.notes.title'
      }
      const fallbackNames = {
        'task_list': 'Tâches',
        'stats': 'Statistiques',
        'files': 'Fichiers',
        'team': 'Équipe',
        'calendar': 'Calendrier',
        'comments': 'Commentaires',
        'deliverables': 'Livrables',
        'ai': 'Assistant IA',
        'goals': 'Objectifs',
        'history': 'Historique',
        'checklist': 'Checklist',
        'project_overview': 'Aperçu du projet',
        'budget': 'Budget',
        'documents': 'Documents',
        'notes': 'Notes'
      }
      const key = keys[type] || 'widgets.widget'
      const translated = t(key)
      return translated !== key ? translated : (fallbackNames[type] || 'Widget')
    }

    // Génère une clé unique pour les overrides de layout
    const getWidgetKey = (w) => {
      const type = w.widget_type || componentNameToType(w.component_name) || 'unknown'
      // Utiliser l'id principal du widget, en s'assurant qu'il existe
      const wid = String(w.widget_id || w.id || `temp_${Date.now()}`)
      return `${type}:${wid}`
    }

    // Applique les overrides (taille/position) sur les widgets chargés
    const applyLayoutOverrides = () => {
      const map = layoutOverrides.value || {}
      projectWidgets.value.forEach((w) => {
        const key = getWidgetKey(w)
        const ov = map[key]
        if (!ov) return
        if (typeof ov.position_x === 'number') w.position_x = ov.position_x
        if (typeof ov.position_y === 'number') w.position_y = ov.position_y
        if (typeof ov.width === 'number') w.width = ov.width
        if (typeof ov.height === 'number') w.height = ov.height
      })
    }
    
    const openWidget = (widget) => {
      const isAgentView = route.path.startsWith('/agent/')
      const type = widget.widget_type || componentNameToType(widget.component_name)
      const widgetId = String(widget.widget_id || widget.id)
      if (isAgentView) {
        const clientId = route.params.clientId || project.value?.client_id
        router.push({ 
          name: 'AgentProjectWidgetView', 
          params: { clientId: String(clientId), projectId: String(props.projectId), type, widgetId } 
        })
      } else {
        router.push({ 
          name: 'ProjectWidgetView', 
          params: { id: String(props.projectId), type, widgetId } 
        })
      }
    }
    
    const snapshotCurrentLayout = () => {
       const map = {}
       projectWidgets.value.forEach((w) => {
         const key = getWidgetKey(w)
         // Inclure toutes les données nécessaires pour le widget
         map[key] = { 
           widget_type: w.widget_type,
           widget_id: String(w.widget_id || w.id),
           component_name: w.component_name,
           width: w.width, 
           height: w.height, 
           position_x: w.position_x, 
           position_y: w.position_y,
           is_enabled: w.is_enabled,
           widget_config: w.widget_config || {}
         }
       })
       return map
     }

    const saveDashboardSettings = async () => {
      try {
        // Try new project dashboard API first
        const success = await saveProjectDashboardLayout()
        if (success) {
          return
        }
        
        // Fallback to legacy method
        const settings = {
          dashboard: dashboardSettings.value,
          layout: layoutSettings.value,
          widgetsLayout: snapshotCurrentLayout()
        }
        
        localStorage.setItem(`dashboard-settings-${props.projectId}`, JSON.stringify(settings))
        
        if (dashboardSettings.value.autoSaveLayout) {
          const clientId = project.value?.client_id || route.params.clientId
          await widgetApiService.updateProjectConfiguration(String(clientId), String(props.projectId), 'settings', settings)
        }
      } catch (err) {
        console.warn('Failed to save dashboard settings:', err)
      }
    }
    
    const formatDate = (date) => {
      if (!date) return ''
      return new Date(date).toLocaleDateString()
    }
    
    const formatCurrency = (amount, currency = 'EUR') => {
      if (!amount) return ''
      return new Intl.NumberFormat('fr-FR', {
        style: 'currency',
        currency: currency
      }).format(amount)
    }
    
    // === New Project Dashboard Layout Management ===
    const currentDashboardVersion = ref(0)
    
    const loadProjectDashboardLayout = async () => {
      try {
        const dashboardData = await widgetApiService.getProjectDashboardLayout(String(props.projectId))
        if (dashboardData && dashboardData.layout) {
          const layout = dashboardData.layout
          currentDashboardVersion.value = dashboardData.version || 0
          
          // Capture des permissions de l’API
          if (dashboardData.permissions) {
            apiPermissions.value = { ...apiPermissions.value, ...dashboardData.permissions }
          }
          
          // Apply dashboard settings
          if (layout.dashboard) {
            dashboardSettings.value = { ...dashboardSettings.value, ...layout.dashboard }
          }
          
          // Apply layout settings
          if (layout.layout) {
            layoutSettings.value = { ...layoutSettings.value, ...layout.layout }
          }
          
          // Apply widget layout overrides
          if (layout.widgetsLayout) {
            layoutOverrides.value = { ...layout.widgetsLayout }
          }
          
          return true
        }
        return false
      } catch (err) {
        console.warn('Failed to load project dashboard layout:', err)
        return false
      }
    }
    
    const saveProjectDashboardLayout = async () => {
      try {
        const snapshot = snapshotCurrentLayout()
        // Garde de sécurité: éviter d'écraser le layout avec un snapshot vide
        // sauf si on veut explicitement vider le dashboard (fonctionnalité non prise en charge pour le moment)
        const snapCount = Object.keys(snapshot || {}).length
        if (snapCount === 0) {
          console.warn('[Dashboard] Sauvegarde annulée: snapshot vide détecté. Pour éviter la suppression accidentelle des widgets, la sauvegarde est bloquée.', {
            snapCount
          })
          return false
        }

        const layoutData = {
          dashboard: dashboardSettings.value,
          layout: layoutSettings.value,
          widgetsLayout: snapshot
        }
        if (import.meta.env?.MODE !== 'production') {
          console.debug('[Dashboard] Envoi sauvegarde layout', layoutData)
        }
        
        const success = await widgetApiService.updateProjectDashboardLayout(
          String(props.projectId), 
          layoutData, 
          currentDashboardVersion.value
        )
        
        if (success) {
          currentDashboardVersion.value += 1
          // Also save locally as backup
          localStorage.setItem(`dashboard-settings-${props.projectId}`, JSON.stringify(layoutData))
        }
        
        return success
      } catch (err) {
        console.warn('Failed to save project dashboard layout:', err)
        return false
      }
    }

    // Charger les paramètres du dashboard (local + serveur) - Legacy fallback
    const loadDashboardSettings = async () => {
      try {
        // Try new project dashboard API first
        const loaded = await loadProjectDashboardLayout()
        if (loaded) {
          return
        }
        
        // Fallback to legacy method
        const localKey = `dashboard-settings-${props.projectId}`
        let combined = { dashboard: {}, layout: {}, widgetsLayout: {} }

        const raw = localStorage.getItem(localKey)
        if (raw) {
          try {
            const parsed = JSON.parse(raw)
            combined.dashboard = parsed?.dashboard || {}
            combined.layout = parsed?.layout || {}
            combined.widgetsLayout = parsed?.widgetsLayout || {}
          } catch (e) {
            console.warn('Paramètres locaux invalides, réinitialisation.', e)
            localStorage.removeItem(localKey)
          }
        }

        // Also try to load persisted settings from project_configurations (legacy)
        try {
          const clientId = project.value?.client_id || route.params.clientId
          if (clientId) {
            const serverSettings = await widgetApiService.getProjectConfiguration(String(clientId), String(props.projectId), 'settings')
            const serverData = serverSettings?.data || serverSettings
            if (serverData && typeof serverData === 'object') {
              // Merge server settings into combined, preferring local if already present
              combined.dashboard = { ...(serverData.dashboard || {}), ...combined.dashboard }
              combined.layout = { ...(serverData.layout || {}), ...combined.layout }
              combined.widgetsLayout = { ...(serverData.widgetsLayout || {}), ...combined.widgetsLayout }
            }
          }
        } catch (e) {
          console.warn('Impossible de charger les paramètres du serveur (legacy settings):', e)
        }

        // Apply combined settings
        if (Object.keys(combined.dashboard).length) {
          dashboardSettings.value = { ...dashboardSettings.value, ...combined.dashboard }
        }
        if (Object.keys(combined.layout).length) {
          layoutSettings.value = { ...layoutSettings.value, ...combined.layout }
        }
        if (Object.keys(combined.widgetsLayout).length) {
          layoutOverrides.value = { ...layoutOverrides.value, ...combined.widgetsLayout }
        }
      } catch (err) {
        console.warn('Échec du chargement des paramètres du dashboard (fallback):', err)
      }
    }
    
    // Lifecycle
    onMounted(async () => {
      loading.value = true
      try {
        await loadProject()
        await loadDashboardSettings()
        await loadProjectWidgets()
        applyLayoutOverrides()
      } finally {
        loading.value = false
      }
    })
    
    // Fermer le dropdown quand on clique ailleurs
    const handleClickOutside = (event) => {
      if (!event.target.closest('.dropdown')) {
        showDropdown.value = false
      }
    }
    
    onMounted(() => {
      document.addEventListener('click', handleClickOutside)
    })
    
    onUnmounted(() => {
      document.removeEventListener('click', handleClickOutside)
    })
    
    const gotoTab = (tab) => {
      try {
        if (route.name === 'ProjectDetailDashboard') {
          const clientId = route.params.clientId
          router.push({ name: 'ProjectDetailDashboard', params: { clientId, projectId: props.projectId, tab } })
        } else {
          router.push({ name: 'ProjectDetails', params: { id: props.projectId, tab } })
        }
      } catch (err) {
        console.warn('Navigation tab failed:', err)
      }
    }

    const openWidgetByType = (type) => {
      const target = projectWidgets.value.find((w) => {
        const tType = w.widget_type || componentNameToType(w.component_name)
        return tType === type
      })
      if (target) {
        openWidget(target)
      } else {
        showError(t('widgets.calendar.openCalendar') + ' indisponible')
      }
    }

    const contactAgent = () => {
      gotoTab('team')
      success('Ouverture de l’onglet Équipe — contactez votre agent.')
    }

    return {
      loading,
      project,
      projectWidgets,
      isEditMode,
      showDropdown,
      showAddWidget,
      showWidgetConfig,
      showSettings,
      configuringWidget,
      dashboardSettings,
      layoutSettings,
      canEditDashboard,
      canContactAgent,
      sortedWidgets,
      getWidgetComponent,
      getWidgetStyle,
      startResize,
      startDrag,
      toggleEditMode,
      toggleDropdown,
      configureWidget,
      toggleWidgetEnabled,
      removeWidget,
      handleWidgetAdded,
      handleAddWidgetFromModal,
      handleWidgetUpdated,
      handleWidgetError,
      handleWidgetConfigSaved,
      handleSettingsSaved,
      dismissWelcome,
      exportDashboard,
      resetLayout,
      formatDate,
      formatCurrency,
      t,
      gotoTab,
      openWidgetByType,
      contactAgent,
      getWidgetIcon,
      getWidgetName,
      openWidget,
      showWidgetViewer,
      viewingWidget,
      // Ajouts pour la confirmation de suppression
      showDeleteConfirm,
      deleteConfirmMessage,
      performDeleteWidget,
      // Expose mobile state
      isMobile
    }
  }
}
</script>

<style scoped>
.project-dashboard {
  padding: 1.5rem;
  background: #f8fafc;
  min-height: 100vh;
}
@media (max-width: 768px) {
  .project-dashboard {
    padding: 0.5rem;
  }
  .dashboard-header {
    padding: 1rem;
    margin-bottom: 1rem;
  }
}

.dashboard-header {
  background: white;
  border-radius: 12px;
  padding: 2rem;
  margin-bottom: 2rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.header-content {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 2rem;
}

/* Quick actions */
.header-quick-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 0.75rem;
  margin-top: 1rem;
}

.qa-btn {
  display: inline-flex;
  align-items: center;
  padding: 0.6rem 1rem;
  border: 1px solid #d1d5db;
  border-radius: 8px;
  background: #f9fafb;
  color: #374151;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
}

.qa-btn:hover {
  background: #eef2ff;
  border-color: #93c5fd;
  color: #1f2937;
}

.qa-btn.primary {
  background: #3b82f6;
  color: white;
  border-color: #3b82f6;
}

.qa-btn.primary:hover {
  background: #2563eb;
}

.project-info {
  flex: 1;
}

.project-title {
  font-size: 2rem;
  font-weight: 700;
  color: #1f2937;
  margin-bottom: 0.5rem;
}

.project-description {
  color: #6b7280;
  margin-bottom: 1rem;
  line-height: 1.6;
}

.project-meta {
  display: flex;
  gap: 1.5rem;
  flex-wrap: wrap;
}

.meta-item {
  display: flex;
  align-items: center;
  color: #6b7280;
  font-size: 0.875rem;
}

.header-actions {
  display: flex;
  gap: 1rem;
  align-items: center;
}

.action-btn {
  display: flex;
  align-items: center;
  padding: 0.75rem 1.5rem;
  border: 1px solid #d1d5db;
  border-radius: 8px;
  background: white;
  color: #374151;
  font-weight: 500;
  transition: all 0.2s;
  cursor: pointer;
}

.action-btn:hover {
  background: #f9fafb;
  border-color: #9ca3af;
}

.action-btn.active {
  background: #3b82f6;
  color: white;
  border-color: #3b82f6;
}

.action-btn.primary {
  background: #3b82f6;
  color: white;
  border-color: #3b82f6;
}

.dropdown {
  position: relative;
}

.dropdown-menu {
  position: absolute;
  top: 100%;
  right: 0;
  background: white;
  border: 1px solid #d1d5db;
  border-radius: 8px;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
  z-index: 50;
  min-width: 200px;
}

.dropdown-item {
  display: flex;
  align-items: center;
  width: 100%;
  padding: 0.75rem 1rem;
  text-align: left;
  color: #374151;
  background: none;
  border: none;
  cursor: pointer;
  transition: background 0.2s;
}

.dropdown-item:hover {
  background: #f9fafb;
}

.welcome-message {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border-radius: 12px;
  padding: 2rem;
  margin-bottom: 2rem;
  position: relative;
}

.welcome-content {
  max-width: 600px;
}

.welcome-title {
  font-size: 1.5rem;
  font-weight: 600;
  margin-bottom: 0.5rem;
}

.welcome-text {
  opacity: 0.9;
  line-height: 1.6;
}

.welcome-dismiss {
  position: absolute;
  top: 1rem;
  right: 1rem;
  background: rgba(255, 255, 255, 0.2);
  border: none;
  color: white;
  width: 32px;
  height: 32px;
  border-radius: 50%;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
}

.loading-state {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 400px;
}

.loading-spinner {
  text-align: center;
}

.loading-text {
  margin-top: 1rem;
  color: #6b7280;
}

.widgets-container {
  background: white;
  border-radius: 12px;
  padding: 2rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}
@media (max-width: 768px) {
  .widgets-container {
    padding: 0.75rem;
  }
}

.widgets-grid {
  display: grid;
  grid-template-columns: repeat(12, 1fr);
  gap: 1.5rem;
  grid-auto-rows: minmax(140px, auto);
  min-height: 400px;
}

.widgets-grid.edit-mode {
  border: 2px dashed #d1d5db;
  border-radius: 8px;
  padding: 1rem;
}

.widget-placeholder {
  grid-column: 1 / -1;
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 300px;
}

.placeholder-content {
  text-align: center;
  color: #6b7280;
}

.placeholder-title {
  font-size: 1.25rem;
  font-weight: 600;
  margin-bottom: 0.5rem;
}

.placeholder-description {
  margin-bottom: 1.5rem;
}

.placeholder-btn {
  display: inline-flex;
  align-items: center;
  padding: 0.75rem 1.5rem;
  background: #3b82f6;
  color: white;
  border: none;
  border-radius: 8px;
  font-weight: 500;
  cursor: pointer;
  transition: background 0.2s;
}

.placeholder-btn:hover {
  background: #2563eb;
}

.widget-container {
  position: relative;
  background: #f9fafb;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  min-height: 140px;
  overflow: auto;
  transition: all 0.2s;
}

.widget-container:hover {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

/* État visuel pendant le glisser-déposer */
.widget-container.dragging {
  opacity: 0.9;
  outline: 2px dashed #3b82f6;
  cursor: grabbing;
}

.widget-edit-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(59, 130, 246, 0.1);
  border: 2px solid #3b82f6;
  z-index: 10;
  pointer-events: none;
}

/* Bouton plein écran en bas à droite */
.widget-fullscreen-btn {
  position: absolute;
  bottom: 0.5rem;
  right: 0.5rem;
  z-index: 5;
}

.fullscreen-btn {
  width: 32px;
  height: 32px;
  border: none;
  border-radius: 6px;
  background: rgba(255, 255, 255, 0.9);
  color: #6b7280;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
  transition: all 0.2s;
  backdrop-filter: blur(4px);
}

.fullscreen-btn:hover {
  background: rgba(255, 255, 255, 1);
  color: #374151;
  transform: scale(1.05);
}

.edit-controls {
  position: absolute;
  top: 0.5rem;
  right: 0.5rem;
  display: flex;
  gap: 0.25rem;
  pointer-events: all;
}

.edit-btn {
  width: 32px;
  height: 32px;
  border: none;
  border-radius: 6px;
  background: white;
  color: #6b7280;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  transition: all 0.2s;
}

.edit-btn:hover {
  background: #f3f4f6;
  color: #374151;
}

.edit-btn.active {
  background: #3b82f6;
  color: white;
}

.edit-btn.danger:hover {
  background: #ef4444;
  color: white;
}

.resize-handles {
  pointer-events: all;
}

.resize-handle {
  position: absolute;
  background: #3b82f6;
  opacity: 0.7;
}

.resize-e {
  top: 50%;
  right: 0;
  transform: translateY(-50%);
  width: 10px;
  height: 60%;
  cursor: ew-resize;
  border-radius: 4px 0 0 4px;
}

.resize-s {
  left: 50%;
  bottom: 0;
  transform: translateX(-50%);
  width: 60%;
  height: 10px;
  cursor: ns-resize;
  border-radius: 4px 4px 0 0;
}

.resize-se {
  bottom: 0;
  right: 0;
  width: 12px;
  height: 12px;
  cursor: se-resize;
}

/* Poignée de déplacement */
.drag-handle {
  position: absolute;
  top: 0.5rem;
  left: 0.5rem;
  width: 32px;
  height: 32px;
  border-radius: 6px;
  background: white;
  color: #6b7280;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  pointer-events: all;
  cursor: grab;
  z-index: 15;
}

.drag-handle:active {
  cursor: grabbing;
}

@media (max-width: 768px) {
  .widgets-grid {
    grid-template-columns: 1fr;
    justify-items: center;
    align-items: start;
  }
  .widget-container {
    width: 100%;
    max-width: 100%;
    margin: 0 auto;
    box-sizing: border-box;
    min-height: 140px;
    overflow: visible; /* pour afficher l'ombre des tuiles */
  }
  .widget-container p,
  .widget-container li,
  .widget-container span,
  .widget-container h1,
  .widget-container h2,
  .widget-container h3 {
    word-break: break-word;
    white-space: normal;
  }
  .placeholder-title {
    font-size: 1.4rem;
  }
  .fullscreen-btn,
  .edit-btn {
    width: 38px;
    height: 38px;
  }
}

.widget-icon-tile {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
  padding: 1rem;
  border: 1px solid #e5e7eb;
  border-radius: 14px;
  background: #ffffff;
  cursor: pointer;
  transition: background 0.2s, border-color 0.2s, box-shadow 0.2s, transform 0.15s ease;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.08);
}

.widget-icon-tile:hover {
  background: #f9fafb;
  border-color: #93c5fd;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.12);
  transform: translateY(-1px);
}

.widget-icon-tile:active {
  transform: translateY(0);
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.1);
}

.tile-icon-badge {
  width: 56px;
  height: 56px;
  border-radius: 50%;
  background: #eef2ff;
  border: 1px solid #dbeafe;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 0.5rem;
}

.tile-icon {
  font-size: 1.5rem;
  color: #3b82f6;
}

.tile-label {
  font-size: 1rem;
  font-weight: 600;
  color: #1f2937;
  text-align: center;
}

@media (max-width: 768px) {
  .widgets-grid {
    grid-template-columns: 1fr;
    justify-items: center;
    align-items: stretch;
    gap: 0.5rem;
  }
  .widget-container {
    width: 100%;
    max-width: 100%;
    margin: 0 auto;
    box-sizing: border-box;
    min-height: 140px;
    overflow: visible; /* pour afficher l'ombre des tuiles */
  }
  .widget-container p,
  .widget-container li,
  .widget-container span,
  .widget-container h1,
  .widget-container h2,
  .widget-container h3 {
    word-break: break-word;
    white-space: normal;
  }
  .placeholder-title {
    font-size: 1.4rem;
  }
  .fullscreen-btn,
  .edit-btn {
    width: 38px;
    height: 38px;
  }
}

.tile-icon {
  font-size: 1.75rem;
  color: #374151;
  margin-bottom: 0.5rem;
}

.tile-label {
  font-weight: 600;
  color: #1f2937;
}
</style>