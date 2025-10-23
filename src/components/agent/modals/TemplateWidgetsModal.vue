<template>
  <div class="modal-overlay" @click.self="closeModal">
    <div class="modal-content">
      <div class="modal-header">
        <h3>{{ t('projectTemplates.manageWidgets') }}</h3>
        <button class="close-btn" @click="closeModal" aria-label="Close">
          <i class="fas fa-times"></i>
        </button>
      </div>

      <div class="modal-body">
        <!-- Filtres -->
        <div class="filters">
          <div class="search-box">
            <i class="fas fa-search"></i>
            <input
              v-model="searchQuery"
              type="text"
              :placeholder="t('widgets.searchPlaceholder')"
            />
          </div>
          <select v-model="selectedCategory" class="form-select">
            <option value="">{{ t('widgets.allCategories') }}</option>
            <option
              v-for="category in widgetCategories"
              :key="category.value"
              :value="category.value"
            >
              {{ t(category.labelKey || category.label || category.value) }}
            </option>
          </select>
        </div>

        <!-- Widgets disponibles -->
        <div class="widgets-section">
          <h4>{{ t('widgets.availableWidgets') }}</h4>
          <div class="widgets-grid">
            <div
              v-for="widget in filteredAvailableWidgets"
              :key="widget.id"
              class="widget-card"
              :class="{ selected: isWidgetSelected(widget.id) }"
              @click="toggleWidget(widget)"
            >
              <div class="widget-icon">
                <i :class="getWidgetIcon(widget.component_name || widget.composant_vue)"></i>
              </div>
              <div class="widget-info">
                <h5>{{ widget.name || widget.nom }}</h5>
                <p>{{ widget.description }}</p>
                <span class="widget-category">
                  {{ getCategoryLabel(widget.category) }}
                </span>
              </div>
              <div class="widget-action">
                <i
                  :class="isWidgetSelected(widget.id) ? 'fas fa-check-circle' : 'fas fa-plus-circle'"
                  :style="{ color: isWidgetSelected(widget.id) ? 'var(--success-color)' : 'var(--text-tertiary)' }"
                ></i>
              </div>
            </div>
          </div>
        </div>

        <!-- Widgets sélectionnés -->
        <div class="selected-widgets-section">
          <h4>{{ t('widgets.selectedWidgets') }}</h4>

          <div v-if="selectedWidgets.length > 0" class="selected-widgets-list">
            <div
              v-for="(widget, index) in selectedWidgets"
              :key="widget.id"
              class="selected-widget-item"
            >
              <i class="fas fa-grip-vertical drag-handle"></i>
              <div class="widget-icon">
                <i :class="getWidgetIcon(widget.component_name || widget.composant_vue)"></i>
              </div>
              <div class="widget-info">
                <div class="widget-name">{{ widget.name || widget.nom }}</div>
                <div class="widget-category">{{ getCategoryLabel(widget.category) }}</div>
              </div>
              <div class="widget-actions">
                <button
                  @click="moveWidget(index, -1)"
                  :disabled="index === 0"
                  class="btn btn-sm btn-outline"
                >
                  <i class="fas fa-arrow-up"></i>
                  {{ t('common.moveUp') }}
                </button>
                <button
                  @click="moveWidget(index, 1)"
                  :disabled="index === selectedWidgets.length - 1"
                  class="btn btn-sm btn-outline"
                >
                  <i class="fas fa-arrow-down"></i>
                  {{ t('common.moveDown') }}
                </button>
                <button
                  @click="removeWidget(widget.id)"
                  class="btn btn-sm btn-danger"
                >
                  <i class="fas fa-trash"></i>
                  {{ t('common.remove') }}
                </button>
              </div>
            </div>
          </div>

          <div v-else class="empty-state">
            <i class="fas fa-puzzle-piece"></i>
            <h4>{{ t('widgets.noWidgetsSelected') }}</h4>
            <p>{{ t('widgets.selectWidgetsDescription') }}</p>
          </div>
        </div>
      </div>

      <div class="modal-footer">
        <button @click="closeModal" class="btn btn-secondary">
          {{ t('common.close') }}
        </button>
        <button @click="saveWidgets" class="btn btn-primary" :disabled="loading">
          <i v-if="loading" class="fas fa-spinner fa-spin"></i>
          {{ t('common.save') }}
        </button>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, computed, onMounted } from 'vue'
import { useTranslation } from '@/composables/useTranslation'
import projectTemplateService from '@/services/projectTemplateService'
import { useToast } from '@/composables/useToast'

export default {
  name: 'TemplateWidgetsModal',
  props: {
    template: {
      type: Object,
      required: true
    }
  },
  emits: ['close', 'updated'],
  setup(props, { emit }) {
    const { t } = useTranslation()
    const { showError } = useToast()

    const loading = ref(false)
    const searchQuery = ref('')
    const selectedCategory = ref('')
    const availableWidgets = ref([])
    const selectedWidgets = ref([])

    const widgetCategories = computed(() => {
      return projectTemplateService.getWidgetCategories()
    })

    const filteredAvailableWidgets = computed(() => {
      let filtered = availableWidgets.value

      if (searchQuery.value) {
        const query = searchQuery.value.toLowerCase()
        filtered = filtered.filter(widget => {
          const name = (widget.nom || widget.name || '').toLowerCase()
          const descText = (widget.description || '').toLowerCase()
          return name.includes(query) || descText.includes(query)
        })
      }

      if (selectedCategory.value) {
        filtered = filtered.filter(widget => widget.category === selectedCategory.value)
      }

      return filtered
    })

    const getWidgetIcon = (componentName) => {
      const iconMap = {
        'TimelineWidget': 'fas fa-timeline',
        'ChecklistWidget': 'fas fa-tasks',
        'GoalsWidget': 'fas fa-bullseye',
        'PerformanceWidget': 'fas fa-chart-line',
        'FilesWidget': 'fas fa-folder',
        'CommentsWidget': 'fas fa-comments',
        'AIWidget': 'fas fa-robot',
        'DesignWidget': 'fas fa-palette',
        'FeedbackWidget': 'fas fa-comment-dots',
        'DevelopmentWidget': 'fas fa-code',
        'SEOWidget': 'fas fa-search',
        'SocialWidget': 'fas fa-share-alt',
        'BrandWidget': 'fas fa-copyright',
        'AnalyticsWidget': 'fas fa-chart-bar'
      }
      return iconMap[componentName] || 'fas fa-puzzle-piece'
    }

    const getCategoryLabel = (categoryValue) => {
      const category = widgetCategories.value.find(cat => cat.value === categoryValue)
      return category ? t(category.labelKey || category.label || category.value) : categoryValue
    }

    const isWidgetSelected = (widgetId) => {
      return selectedWidgets.value.some(widget => widget.id === widgetId)
    }

    const toggleWidget = (widget) => {
      const index = selectedWidgets.value.findIndex(w => w.id === widget.id)
      if (index > -1) {
        selectedWidgets.value.splice(index, 1)
      } else {
        selectedWidgets.value.push({ ...widget })
      }
    }

    const removeWidget = (widgetId) => {
      const index = selectedWidgets.value.findIndex(w => w.id === widgetId)
      if (index > -1) {
        selectedWidgets.value.splice(index, 1)
      }
    }

    const moveWidget = (currentIndex, direction) => {
      const newIndex = currentIndex + direction
      if (newIndex >= 0 && newIndex < selectedWidgets.value.length) {
        const widget = selectedWidgets.value.splice(currentIndex, 1)[0]
        selectedWidgets.value.splice(newIndex, 0, widget)
      }
    }

    const loadData = async () => {
      loading.value = true
      try {
        const widgetsResult = await projectTemplateService.getWidgets()
        if (widgetsResult.success) {
          availableWidgets.value = widgetsResult.data
        }

        const templateWidgetsResult = await projectTemplateService.getTemplateWidgets(props.template.id)
        if (templateWidgetsResult.success) {
          selectedWidgets.value = templateWidgetsResult.data
        }
      } catch (error) {
        showError(t('widgets.loadError'))
      } finally {
        loading.value = false
      }
    }

    const saveWidgets = async () => {
      loading.value = true
      try {
        const payload = selectedWidgets.value.map((widget, index) => ({
          widget_id: widget.widget_id || widget.id,
          position: index + 1,
          // Le backend attend 'config' et 'is_required'
          config: widget.config || widget.default_config || {},
          is_required: widget.is_required || 0
        }))
        const result = await projectTemplateService.updateTemplateWidgets(
          props.template.id,
          payload
        )

        if (result.success) {
          emit('updated')
        } else {
          showError(result.error)
        }
      } catch (error) {
        showError(t('widgets.saveError'))
      } finally {
        loading.value = false
      }
    }

    const closeModal = () => {
      emit('close')
    }

    onMounted(() => {
      loadData()
    })

    return {
      loading,
      searchQuery,
      selectedCategory,
      availableWidgets,
      selectedWidgets,
      widgetCategories,
      filteredAvailableWidgets,
      getWidgetIcon,
      getCategoryLabel,
      isWidgetSelected,
      toggleWidget,
      removeWidget,
      moveWidget,
      saveWidgets,
      closeModal,
      t
    }
  }
}
</script>

<style scoped>
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 1rem;
}

.modal-content {
  background: var(--bg-primary);
  border-radius: 0.75rem;
  width: 100%;
  max-width: 900px;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.2);
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.5rem;
  border-bottom: 1px solid var(--border-color);
}

.modal-header h3 {
  margin: 0;
  color: var(--text-primary);
}

.close-btn {
  background: none;
  border: none;
  font-size: 1.2rem;
  color: var(--text-secondary);
  cursor: pointer;
  padding: 0.5rem;
  border-radius: 0.25rem;
  transition: all 0.2s ease;
}

.close-btn:hover {
  background: var(--bg-secondary);
  color: var(--text-primary);
}

.modal-body { padding: 1.5rem; }

.filters { display: flex; gap: 1rem; margin-bottom: 2rem; align-items: center; }
.search-box { position: relative; flex: 1; }
.search-box i { position: absolute; left: 1rem; top: 50%; transform: translateY(-50%); color: var(--text-secondary); }
.search-box input { width: 100%; padding: 0.75rem 1rem 0.75rem 2.5rem; border: 1px solid var(--border-color); border-radius: 0.5rem; font-size: 0.9rem; }

.widgets-section { margin-bottom: 2rem; }
.widgets-section h4 { margin-bottom: 1rem; color: var(--text-primary); }
.widgets-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(300px, 1fr)); gap: 1rem; }

.widget-card { display: flex; align-items: center; gap: 1rem; padding: 1rem; border: 1px solid var(--border-color); border-radius: 0.5rem; cursor: pointer; transition: all 0.2s ease; background: var(--bg-secondary); }
.widget-card:hover { border-color: var(--primary-color); transform: translateY(-1px); }
.widget-card.selected { border-color: var(--success-color); background: rgba(var(--success-color-rgb), 0.1); }
.widget-icon { width: 40px; height: 40px; display: flex; align-items: center; justify-content: center; background: var(--primary-color); color: white; border-radius: 0.5rem; font-size: 1.2rem; }
.widget-info { flex: 1; }
.widget-info h5 { margin: 0 0 0.25rem 0; color: var(--text-primary); font-size: 0.9rem; }
.widget-info p { margin: 0 0 0.25rem 0; color: var(--text-secondary); font-size: 0.8rem; line-height: 1.4; }
.widget-category { font-size: 0.7rem; color: var(--text-tertiary); background: var(--bg-tertiary); padding: 0.2rem 0.5rem; border-radius: 0.25rem; }
.widget-action { font-size: 1.2rem; }

.selected-widgets-section { margin-bottom: 2rem; }
.selected-widgets-section h4 { margin-bottom: 1rem; color: var(--text-primary); }
.selected-widgets-list { display: flex; flex-direction: column; gap: 0.5rem; }
.selected-widget-item { display: flex; align-items: center; gap: 1rem; padding: 0.75rem; background: var(--bg-secondary); border: 1px solid var(--border-color); border-radius: 0.5rem; }
.drag-handle { color: var(--text-tertiary); cursor: grab; }
.drag-handle:active { cursor: grabbing; }
.selected-widget-item .widget-icon { width: 32px; height: 32px; font-size: 1rem; }
.selected-widget-item .widget-info { display: flex; flex-direction: column; gap: 0.25rem; }
.widget-name { font-weight: 500; color: var(--text-primary); font-size: 0.9rem; }
.widget-actions { display: flex; gap: 0.5rem; }

.empty-state { text-align: center; padding: 3rem; color: var(--text-secondary); }
.empty-state i { font-size: 3rem; margin-bottom: 1rem; color: var(--text-tertiary); }
.empty-state h4 { margin-bottom: 0.5rem; color: var(--text-primary); }

.modal-footer { display: flex; justify-content: flex-end; gap: 1rem; padding: 1.5rem; border-top: 1px solid var(--border-color); }

.btn { padding: 0.75rem 1.5rem; border: none; border-radius: 0.5rem; cursor: pointer; font-size: 0.9rem; transition: all 0.2s ease; display: inline-flex; align-items: center; gap: 0.5rem; }
.btn-sm { padding: 0.375rem 0.75rem; font-size: 0.8rem; }
.btn-primary { background: var(--primary-color); color: white; }
.btn-secondary { background: var(--bg-secondary); color: var(--text-primary); border: 1px solid var(--border-color); }
.btn-outline { background: transparent; border: 1px solid var(--border-color); color: var(--text-primary); }
.btn-danger { background: var(--danger-color); color: white; }
.btn:hover:not(:disabled) { transform: translateY(-1px); box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1); }
.btn:disabled { opacity: 0.6; cursor: not-allowed; }

select { padding: 0.75rem; border: 1px solid var(--border-color); border-radius: 0.5rem; background: var(--bg-primary); color: var(--text-primary); font-size: 0.9rem; }

@media (max-width: 768px) {
  .modal-content { margin: 1rem; max-height: calc(100vh - 2rem); }
  .widgets-grid { grid-template-columns: 1fr; }
  .filters { flex-direction: column; align-items: stretch; }
  .modal-footer { flex-direction: column; }
  .modal-footer .btn { width: 100%; justify-content: center; }
}
</style>