<template>
  <BaseWidget 
    :widget="widgetConfig"
    :loading="loading"
    :error="error"
    @configure="showConfigModal = true"
    @toggle="toggleWidget"
    @retry="loadFeatures"
  >
    <div class="feature-tracking-widget">
      <!-- En-tête -->
      <div class="features-header">
        <div class="header-left">
          <h3 class="features-title">{{ t('widgets.features.title') }}</h3>
          <div class="features-stats">
            <span class="stat-item">
              <i class="fas fa-rocket mr-1"></i>
              {{ totalFeatures }} {{ t('widgets.features.totalFeatures') }}
            </span>
            <span class="stat-item">
              <i class="fas fa-check-circle mr-1 text-green-500"></i>
              {{ completedFeatures }} {{ t('widgets.features.completed') }}
            </span>
          </div>
        </div>
        <div class="header-right">
          <button 
            @click="showAddModal = true" 
            class="btn-primary btn-sm"
            :title="t('widgets.features.addFeature')"
          >
            <i class="fas fa-plus mr-1"></i>
            {{ t('widgets.features.add') }}
          </button>
        </div>
      </div>

      <!-- Filtres -->
      <div class="features-filters">
        <div class="filter-group">
          <select v-model="filterStatus" class="filter-select">
            <option value="all">{{ t('widgets.features.filters.allStatus') }}</option>
            <option value="planned">{{ t('widgets.features.status.planned') }}</option>
            <option value="in-progress">{{ t('widgets.features.status.inProgress') }}</option>
            <option value="testing">{{ t('widgets.features.status.testing') }}</option>
            <option value="completed">{{ t('widgets.features.status.completed') }}</option>
          </select>
        </div>
        <div class="filter-group">
          <select v-model="filterPriority" class="filter-select">
            <option value="all">{{ t('widgets.features.filters.allPriority') }}</option>
            <option value="high">{{ t('widgets.features.priority.high') }}</option>
            <option value="medium">{{ t('widgets.features.priority.medium') }}</option>
            <option value="low">{{ t('widgets.features.priority.low') }}</option>
          </select>
        </div>
      </div>

      <!-- Liste des fonctionnalités -->
      <div class="features-list">
        <div v-if="filteredFeatures.length === 0" class="empty-state">
          <i class="fas fa-rocket"></i>
          <p>{{ t('widgets.features.noFeatures') }}</p>
        </div>
        
        <div v-else class="features-items">
          <div 
            v-for="feature in paginatedFeatures" 
            :key="feature.id"
            class="feature-item"
            @click="selectFeature(feature)"
          >
            <div class="feature-content">
              <div class="feature-header-item">
                <div class="feature-info">
                  <h4 class="feature-name">{{ feature.name }}</h4>
                  <div class="feature-badges">
                    <span class="priority-badge" :class="`priority-${feature.priority}`">
                      {{ t(`widgets.features.priority.${feature.priority}`) }}
                    </span>
                    <span class="status-badge" :class="`status-${feature.status}`">
                      {{ t(`widgets.features.status.${feature.status}`) }}
                    </span>
                  </div>
                </div>
                <div class="feature-progress">
                  <div class="progress-bar">
                    <div class="progress-fill" :style="{ width: feature.progress + '%' }"></div>
                  </div>
                  <span class="progress-text">{{ feature.progress }}%</span>
                </div>
              </div>
              <p class="feature-description">{{ feature.description }}</p>
              <div class="feature-meta">
                <span class="feature-assignee">
                  <i class="fas fa-user mr-1"></i>
                  {{ feature.assignee || t('widgets.features.unassigned') }}
                </span>
                <span class="feature-date">
                  <i class="fas fa-calendar mr-1"></i>
                  {{ formatDate(feature.due_date) }}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Pagination -->
      <div v-if="totalPages > 1" class="pagination">
        <button 
          @click="currentPage--"
          :disabled="currentPage === 1"
          class="btn-secondary btn-sm"
        >
          <i class="fas fa-chevron-left"></i>
        </button>
        
        <span class="pagination-info">
          {{ currentPage }} / {{ totalPages }}
        </span>
        
        <button 
          @click="currentPage++"
          :disabled="currentPage === totalPages"
          class="btn-secondary btn-sm"
        >
          <i class="fas fa-chevron-right"></i>
        </button>
      </div>
    </div>

    <!-- Modal d'ajout de fonctionnalité -->
    <div v-if="showAddModal" class="modal-overlay" @click="showAddModal = false">
      <div class="modal-content" @click.stop>
        <div class="modal-header">
          <h3>{{ t('widgets.features.addFeature') }}</h3>
          <button @click="showAddModal = false" class="btn-close">
            <i class="fas fa-times"></i>
          </button>
        </div>
        <div class="modal-body">
          <form @submit.prevent="submitFeature">
            <div class="form-group">
              <label>{{ t('widgets.features.name') }}</label>
              <input v-model="newFeature.name" type="text" required>
            </div>
            <div class="form-group">
              <label>{{ t('widgets.features.description') }}</label>
              <textarea v-model="newFeature.description" rows="3"></textarea>
            </div>
            <div class="form-row">
              <div class="form-group">
                <label>{{ t('widgets.features.priority.label') }}</label>
                <select v-model="newFeature.priority" required>
                  <option value="high">{{ t('widgets.features.priority.high') }}</option>
                  <option value="medium">{{ t('widgets.features.priority.medium') }}</option>
                  <option value="low">{{ t('widgets.features.priority.low') }}</option>
                </select>
              </div>
              <div class="form-group">
                <label>{{ t('widgets.features.status.label') }}</label>
                <select v-model="newFeature.status" required>
                  <option value="planned">{{ t('widgets.features.status.planned') }}</option>
                  <option value="in-progress">{{ t('widgets.features.status.inProgress') }}</option>
                  <option value="testing">{{ t('widgets.features.status.testing') }}</option>
                  <option value="completed">{{ t('widgets.features.status.completed') }}</option>
                </select>
              </div>
            </div>
            <div class="form-row">
              <div class="form-group">
                <label>{{ t('widgets.features.assignee') }}</label>
                <input v-model="newFeature.assignee" type="text">
              </div>
              <div class="form-group">
                <label>{{ t('widgets.features.dueDate') }}</label>
                <input v-model="newFeature.due_date" type="date">
              </div>
            </div>
            <div class="form-actions">
              <button type="button" @click="showAddModal = false" class="btn-secondary">
                {{ t('common.cancel') }}
              </button>
              <button type="submit" class="btn-primary">
                {{ t('common.save') }}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>

    <!-- Modal de configuration -->
    <WidgetConfigModal 
      v-if="showConfigModal"
      :widget="widgetConfig"
      :options="configOptions"
      @close="showConfigModal = false"
      @save="updateConfig"
    />
  </BaseWidget>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import BaseWidget from '@/components/widgets/shared/components/BaseWidget.vue'
import WidgetConfigModal from '@/components/widgets/shared/components/WidgetConfigModal.vue'
import FeatureCreateModal from '@/components/widgets/components/FeatureCreateModal.vue'
import { useTranslation } from '@/composables/useTranslation'
import { useNotifications } from '@/composables/useNotifications'
import { useAuth } from '@/composables/useAuth'
import { featureTrackingService } from '@/components/widgets/services/featureTrackingService'
import type { Feature, FeatureStatus, FeaturePriority } from '@/components/widgets/types'

// Props
interface Props {
  projectId: string
  widgetData?: any
  widget?: any
}

const props = defineProps<Props>()

// Emits
const emit = defineEmits<{
  'widget-updated': [widget: any]
}>()

// Composables
const { success, error: showError } = useNotifications()
const { t } = useTranslation()
const { user } = useAuth()

// State
const loading = ref<boolean>(false)
const error = ref<string | null>(null)
const features = ref<Feature[]>([])
const showAddModal = ref<boolean>(false)
const showConfigModal = ref<boolean>(false)
const selectedFeature = ref<Feature | null>(null)
const editingFeature = ref<Feature | null>(null)
const currentPage = ref<number>(1)
const itemsPerPage = ref<number>(8)
const filterStatus = ref<string>('all')
const filterPriority = ref<string>('all')
    
    // Widget configuration
    const widgetConfig = ref({
      ...props.widget,
      title: props.widget?.title || t('widgets.featureTracking.title'),
      isEnabled: props.widget?.is_enabled ?? true,
      showProgress: true,
      showPriority: true,
      maxFeatures: 20
    })
    
    // Nouvelle fonctionnalité
    const newFeature = ref<Omit<Feature, 'id' | 'created_at' | 'updated_at'>>({
      name: '',
      description: '',
      priority: 'medium' as FeaturePriority,
      status: 'planned' as FeatureStatus,
      assignee: '',
      due_date: '',
      progress: 0
    })
    
    // Computed
    const totalFeatures = computed(() => features.value.length)
    const completedFeatures = computed(() => 
      features.value.filter(f => f.status === 'completed').length
    )
    
    const filteredFeatures = computed(() => {
      let filtered = features.value
      
      if (filterStatus.value !== 'all') {
        filtered = filtered.filter(f => f.status === filterStatus.value)
      }
      
      if (filterPriority.value !== 'all') {
        filtered = filtered.filter(f => f.priority === filterPriority.value)
      }
      
      return filtered.sort((a: Feature, b: Feature) => {
        // Trier par priorité puis par date
        const priorityOrder: Record<FeaturePriority, number> = { high: 3, medium: 2, low: 1 }
        if (priorityOrder[a.priority] !== priorityOrder[b.priority]) {
          return priorityOrder[b.priority] - priorityOrder[a.priority]
        }
        return new Date(a.due_date).getTime() - new Date(b.due_date).getTime()
      })
    })
    
    const totalPages = computed(() => {
      return Math.ceil(filteredFeatures.value.length / itemsPerPage.value)
    })
    
    const paginatedFeatures = computed(() => {
      const start = (currentPage.value - 1) * itemsPerPage.value
      const end = start + itemsPerPage.value
      return filteredFeatures.value.slice(start, end)
    })
    
    // Options de configuration
    const configOptions = computed(() => [
      {
        key: 'showProgress',
        label: t('widgets.features.config.showProgress'),
        type: 'boolean',
        value: widgetConfig.value.showProgress
      },
      {
        key: 'showPriority',
        label: t('widgets.features.config.showPriority'),
        type: 'boolean',
        value: widgetConfig.value.showPriority
      },
      {
        key: 'autoRefresh',
        label: t('widgets.features.config.autoRefresh'),
        type: 'boolean',
        value: widgetConfig.value.autoRefresh
      }
    ])
    
    // Méthodes
    const loadFeatures = async () => {
      try {
        loading.value = true
        error.value = null
        
        // Charger les données de fonctionnalités depuis le service
        const result = await featureTrackingService.getFeatures(props.projectId)
        
        if (result.success) {
          features.value = result.data
        } else {
          // Utiliser les données de démonstration si l'API échoue
          features.value = result.data
          console.warn('Utilisation des données de démonstration pour les fonctionnalités')
        }
        
      } catch (err) {
        console.error('Erreur lors du chargement des fonctionnalités:', err)
        error.value = t('widgets.features.loadError')
        showError(t('widgets.features.loadError'))
      } finally {
        loading.value = false
      }
    }
    
    const submitFeature = async () => {
      try {
        loading.value = true
        
        // Simuler l'ajout d'une fonctionnalité
        const featureData: Feature = {
          id: Date.now(),
          ...newFeature.value,
          progress: newFeature.value.status === 'completed' ? 100 : 0,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }
        
        features.value.unshift(featureData)
        
        // Réinitialiser le formulaire
        newFeature.value = {
          name: '',
          description: '',
          priority: 'medium' as FeaturePriority,
          status: 'planned' as FeatureStatus,
          assignee: '',
          due_date: '',
          progress: 0
        }
        
        showAddModal.value = false
        success(t('widgets.features.addSuccess'))
        
      } catch (err) {
        console.error('Erreur lors de l\'ajout de la fonctionnalité:', err)
        showError(t('widgets.features.addError'))
      } finally {
        loading.value = false
      }
    }
    
    const selectFeature = (feature: Feature) => {
      // Logique pour sélectionner/afficher les détails d'une fonctionnalité
      console.log('Fonctionnalité sélectionnée:', feature)
    }
    
    // Toggle widget function
    const toggleWidget = () => {
      widgetConfig.value.isEnabled = !widgetConfig.value.isEnabled
      const updatedWidget = {
        ...props.widget,
        is_enabled: widgetConfig.value.isEnabled
      }
      emit('widget-updated', updatedWidget)
    }
    
    const updateConfig = (newConfig: Record<string, any>) => {
      Object.assign(widgetConfig.value, newConfig)
      showConfigModal.value = false
      success(t('widgets.features.configSaved'))
    }
    
    const formatDate = (dateString: string) => {
      if (!dateString) return t('widgets.features.noDate')
      return new Date(dateString).toLocaleDateString('fr-FR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
      })
    }
    
    // Lifecycle
    onMounted(() => {
      loadFeatures()
    })
    
    // Watchers
    watch(() => props.projectId, () => {
      loadFeatures()
    })
    
    watch([filterStatus, filterPriority], () => {
      currentPage.value = 1
    })
</script>

<style scoped>
.feature-tracking-widget {
  @apply h-full flex flex-col;
}

.features-header {
  @apply flex items-center justify-between mb-4 pb-3 border-b border-gray-200;
}

.header-left {
  @apply flex-1;
}

.features-title {
  @apply text-lg font-semibold text-gray-900 mb-1;
}

.features-stats {
  @apply flex items-center space-x-4 text-sm text-gray-600;
}

.stat-item {
  @apply flex items-center;
}

.features-filters {
  @apply flex items-center space-x-3 mb-4;
}

.filter-group {
  @apply flex-1;
}

.filter-select {
  @apply w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent;
}

.features-list {
  @apply flex-1 overflow-hidden;
}

.empty-state {
  @apply flex flex-col items-center justify-center h-full text-gray-500;
}

.empty-state i {
  @apply text-4xl mb-2;
}

.features-items {
  @apply space-y-3 max-h-full overflow-y-auto;
}

.feature-item {
  @apply bg-white border border-gray-200 rounded-lg p-4 cursor-pointer transition-all duration-200 hover:shadow-md hover:border-blue-300;
}

.feature-header-item {
  @apply flex items-start justify-between mb-2;
}

.feature-info {
  @apply flex-1;
}

.feature-name {
  @apply text-base font-semibold text-gray-900 mb-1;
}

.feature-badges {
  @apply flex items-center space-x-2;
}

.priority-badge,
.status-badge {
  @apply px-2 py-1 rounded-full text-xs font-medium;
}

.priority-high {
  @apply bg-red-100 text-red-800;
}

.priority-medium {
  @apply bg-yellow-100 text-yellow-800;
}

.priority-low {
  @apply bg-green-100 text-green-800;
}

.status-planned {
  @apply bg-gray-100 text-gray-800;
}

.status-in-progress {
  @apply bg-blue-100 text-blue-800;
}

.status-testing {
  @apply bg-purple-100 text-purple-800;
}

.status-completed {
  @apply bg-green-100 text-green-800;
}

.feature-progress {
  @apply flex items-center space-x-2 ml-4;
}

.progress-bar {
  @apply w-20 h-2 bg-gray-200 rounded-full overflow-hidden;
}

.progress-fill {
  @apply h-full bg-blue-500 transition-all duration-300;
}

.progress-text {
  @apply text-xs text-gray-600 font-medium;
}

.feature-description {
  @apply text-gray-700 text-sm mb-2 line-clamp-2;
}

.feature-meta {
  @apply flex items-center justify-between text-xs text-gray-500;
}

.feature-assignee,
.feature-date {
  @apply flex items-center;
}

.pagination {
  @apply flex items-center justify-center space-x-2 mt-4 pt-3 border-t border-gray-200;
}

.pagination-info {
  @apply text-sm text-gray-600 mx-3;
}

.modal-overlay {
  @apply fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50;
}

.modal-content {
  @apply bg-white rounded-lg shadow-xl max-w-lg w-full mx-4;
}

.modal-header {
  @apply flex items-center justify-between p-4 border-b border-gray-200;
}

.modal-header h3 {
  @apply text-lg font-semibold text-gray-900;
}

.btn-close {
  @apply text-gray-400 hover:text-gray-600 transition-colors;
}

.modal-body {
  @apply p-4;
}

.form-group {
  @apply mb-4;
}

.form-row {
  @apply grid grid-cols-2 gap-4;
}

.form-group label {
  @apply block text-sm font-medium text-gray-700 mb-1;
}

.form-group input,
.form-group select,
.form-group textarea {
  @apply w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent;
}

.form-actions {
  @apply flex items-center justify-end space-x-2 mt-6;
}

.btn-primary {
  @apply bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors;
}

.btn-secondary {
  @apply bg-gray-200 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-300 transition-colors;
}

.btn-sm {
  @apply px-3 py-1 text-sm;
}
</style>