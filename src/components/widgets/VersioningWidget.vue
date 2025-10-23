<template>
  <BaseWidget 
    :widget="widgetConfig"
    :loading="isLoading"
    :error="error"
    @configure="showConfigModal = true"
    @toggle="toggleWidget"
    @retry="loadVersions"
  >
    <div class="versioning-widget">
      <!-- En-tête -->
      <div class="versions-header">
        <div class="header-left">
          <h3 class="versions-title">{{ t('widgets.versioning.title') }}</h3>
          <div class="versions-stats">
            <span class="stat-item">
              <i class="fas fa-code-branch mr-1"></i>
              {{ totalVersions }} {{ t('widgets.versioning.totalVersions') }}
            </span>
            <span class="stat-item">
              <i class="fas fa-tag mr-1"></i>
              {{ currentVersion }}
            </span>
          </div>
        </div>
        <div class="header-right">
          <button 
            @click="showAddModal = true" 
            class="btn-primary btn-sm"
            :title="t('widgets.versioning.addVersion')"
          >
            <i class="fas fa-plus mr-1"></i>
            {{ t('widgets.versioning.add') }}
          </button>
        </div>
      </div>

      <!-- Filtres -->
      <div class="versions-filters">
        <div class="filter-group">
          <select v-model="filterType" class="filter-select">
            <option value="all">{{ t('widgets.versioning.filters.allTypes') }}</option>
            <option value="major">{{ t('widgets.versioning.types.major') }}</option>
            <option value="minor">{{ t('widgets.versioning.types.minor') }}</option>
            <option value="patch">{{ t('widgets.versioning.types.patch') }}</option>
            <option value="hotfix">{{ t('widgets.versioning.types.hotfix') }}</option>
          </select>
        </div>
        <div class="filter-group">
          <input 
            v-model="searchQuery" 
            type="text" 
            :placeholder="t('widgets.versioning.searchPlaceholder')"
            class="filter-input"
          >
        </div>
      </div>

      <!-- Timeline des versions -->
      <div class="versions-timeline">
        <div v-if="filteredVersions.length === 0" class="empty-state">
          <i class="fas fa-code-branch"></i>
          <p>{{ t('widgets.versioning.noVersions') }}</p>
        </div>
        
        <div v-else class="timeline-items">
          <div 
            v-for="(version, index) in paginatedVersions" 
            :key="version.id"
            class="timeline-item"
            @click="selectVersion(version)"
          >
            <div class="timeline-marker" :class="`marker-${version.type}`">
              <i :class="getVersionIcon(version.type)"></i>
            </div>
            <div class="timeline-content">
              <div class="version-header">
                <div class="version-info">
                  <h4 class="version-number">{{ version.version }}</h4>
                  <div class="version-badges">
                    <span class="type-badge" :class="`type-${version.type}`">
                      {{ t(`widgets.versioning.types.${version.type}`) }}
                    </span>
                    <span v-if="version.is_current" class="current-badge">
                      {{ t('widgets.versioning.current') }}
                    </span>
                  </div>
                </div>
                <div class="version-date">
                  {{ formatDate(version.release_date) }}
                </div>
              </div>
              <p class="version-description">{{ version.description }}</p>
              <div v-if="version.changes && version.changes.length > 0" class="version-changes">
                <h5 class="changes-title">{{ t('widgets.versioning.changes') }}:</h5>
                <ul class="changes-list">
                  <li v-for="change in version.changes.slice(0, 3)" :key="change.id" class="change-item">
                    <span class="change-type" :class="`change-${change.type}`">
                      <i :class="getChangeIcon(change.type)"></i>
                    </span>
                    <span class="change-text">{{ change.description }}</span>
                  </li>
                  <li v-if="version.changes.length > 3" class="more-changes">
                    +{{ version.changes.length - 3 }} {{ t('widgets.versioning.moreChanges') }}
                  </li>
                </ul>
              </div>
              <div class="version-meta">
                <span class="version-author">
                  <i class="fas fa-user mr-1"></i>
                  {{ version.author }}
                </span>
                <span class="version-downloads" v-if="version.downloads">
                  <i class="fas fa-download mr-1"></i>
                  {{ version.downloads }} {{ t('widgets.versioning.downloads') }}
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

    <!-- Modal d'ajout de version -->
    <div v-if="showAddModal" class="modal-overlay" @click="showAddModal = false">
      <div class="modal-content" @click.stop>
        <div class="modal-header">
          <h3>{{ t('widgets.versioning.addVersion') }}</h3>
          <button @click="showAddModal = false" class="btn-close">
            <i class="fas fa-times"></i>
          </button>
        </div>
        <div class="modal-body">
          <form @submit.prevent="submitVersion">
            <div class="form-row">
              <div class="form-group">
                <label>{{ t('widgets.versioning.version') }}</label>
                <input v-model="newVersion.version" type="text" required placeholder="1.0.0">
              </div>
              <div class="form-group">
                <label>{{ t('widgets.versioning.type') }}</label>
                <select v-model="newVersion.type" required>
                  <option value="major">{{ t('widgets.versioning.types.major') }}</option>
                  <option value="minor">{{ t('widgets.versioning.types.minor') }}</option>
                  <option value="patch">{{ t('widgets.versioning.types.patch') }}</option>
                  <option value="hotfix">{{ t('widgets.versioning.types.hotfix') }}</option>
                </select>
              </div>
            </div>
            <div class="form-group">
              <label>{{ t('widgets.versioning.description') }}</label>
              <textarea v-model="newVersion.description" rows="3" required></textarea>
            </div>
            <div class="form-row">
              <div class="form-group">
                <label>{{ t('widgets.versioning.author') }}</label>
                <input v-model="newVersion.author" type="text" required>
              </div>
              <div class="form-group">
                <label>{{ t('widgets.versioning.releaseDate') }}</label>
                <input v-model="newVersion.release_date" type="date" required>
              </div>
            </div>
            <div class="form-group">
              <label class="checkbox-label">
                <input v-model="newVersion.is_current" type="checkbox">
                {{ t('widgets.versioning.setCurrent') }}
              </label>
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
import WidgetConfigModal from '@/components/modals/WidgetConfigModal.vue'
import VersionCreateModal from './components/VersionCreateModal.vue'
import { useTranslation } from '@/composables/useTranslation'
import { useNotifications } from '@/composables/useNotifications'
import { useAuth } from '@/composables/useAuth'
import widgetDataService from '@/services/widgetDataService'

// Types
interface Version {
  id: number
  version: string
  type: 'major' | 'minor' | 'patch' | 'hotfix'
  description: string
  author: string
  release_date: string
  is_current: boolean
  downloads: number
  changes: Array<{
    id: number
    type: 'feature' | 'improvement' | 'fix' | 'breaking'
    description: string
  }>
}

type VersionType = 'major' | 'minor' | 'patch' | 'hotfix'

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
const { success: showNotification, error: showError } = useNotifications()
const { t } = useTranslation()
const { user } = useAuth()

// State
const isLoading = ref(false)
const versions = ref<Version[]>([])
const showConfigModal = ref(false)
const showCreateModal = ref(false)
const selectedVersion = ref<Version | null>(null)
const error = ref(null)
const showAddModal = ref(false)
const currentPage = ref(1)
const itemsPerPage = ref(6)
const filterType = ref('all')
const searchQuery = ref('')
    
    // Configuration du widget
    const widgetConfig = ref({
      ...props.widget,
      title: props.widget?.title || t('widgets.versioning.title'),
      isEnabled: props.widget?.is_enabled ?? true,
      showChanges: true,
      showDownloads: true,
      maxVersions: 10
    })
    
    // Nouvelle version
    const newVersion = ref({
      version: '',
      type: 'patch',
      description: '',
      author: '',
      release_date: new Date().toISOString().split('T')[0],
      is_current: false
    })
    
    // Computed
    const totalVersions = computed(() => {
      return Array.isArray(versions.value) ? versions.value.length : 0
    })
    const currentVersion = computed(() => {
      if (!Array.isArray(versions.value)) {
        return t('widgets.versioning.noCurrentVersion')
      }
      const current = versions.value.find((v: Version) => v.is_current)
      return current ? current.version : t('widgets.versioning.noCurrentVersion')
    })
    
    const filteredVersions = computed(() => {
      if (!Array.isArray(versions.value)) {
        return []
      }
      
      let filtered = versions.value
      
      if (filterType.value !== 'all') {
        filtered = filtered.filter((v: Version) => v.type === filterType.value)
      }
      
      if (searchQuery.value) {
        const query = searchQuery.value.toLowerCase()
        filtered = filtered.filter((v: Version) => 
          v.version.toLowerCase().includes(query) ||
          v.description.toLowerCase().includes(query) ||
          v.author.toLowerCase().includes(query)
        )
      }
      
      return filtered.sort((a: Version, b: Version) => new Date(b.release_date).getTime() - new Date(a.release_date).getTime())
    })
    
    const totalPages = computed(() => {
      return Math.ceil(filteredVersions.value.length / itemsPerPage.value)
    })
    
    const paginatedVersions = computed(() => {
      const start = (currentPage.value - 1) * itemsPerPage.value
      const end = start + itemsPerPage.value
      return filteredVersions.value.slice(start, end)
    })
    
    // Options de configuration
    const configOptions = computed(() => [
      {
        key: 'showChanges',
        label: t('widgets.versioning.config.showChanges'),
        type: 'boolean',
        value: widgetConfig.value.showChanges
      },
      {
        key: 'showDownloads',
        label: t('widgets.versioning.config.showDownloads'),
        type: 'boolean',
        value: widgetConfig.value.showDownloads
      },
      {
        key: 'autoRefresh',
        label: t('widgets.versioning.config.autoRefresh'),
        type: 'boolean',
        value: widgetConfig.value.autoRefresh
      }
    ])
    
    // Méthodes
    const loadVersions = async () => {
      try {
        isLoading.value = true
        error.value = null
        
        // Charger les données de versioning depuis l'API
        const data = await widgetDataService.getVersioningData(props.projectId)
        versions.value = data.versions || []
        
      } catch (err) {
        console.error('Erreur lors du chargement des versions:', err)
        error.value = t('widgets.versioning.loadError')
        
        // Utiliser des données de démonstration en cas d'erreur
        versions.value = [
          {
            id: 1,
            version: '2.1.0',
            type: 'minor',
            description: 'Nouvelle interface utilisateur et amélioration des performances.',
            author: 'Équipe Dev',
            release_date: '2024-01-15',
            is_current: true,
            downloads: 1250,
            changes: [
              { id: 1, type: 'feature', description: 'Nouveau tableau de bord' },
              { id: 2, type: 'improvement', description: 'Optimisation des requêtes' },
              { id: 3, type: 'fix', description: 'Correction bug authentification' }
            ]
          },
          {
            id: 2,
            version: '2.0.1',
            type: 'patch',
            description: 'Corrections de bugs critiques et améliorations de sécurité.',
            author: 'Jean Dupont',
            release_date: '2024-01-05',
            is_current: false,
            downloads: 890,
            changes: [
              { id: 4, type: 'fix', description: 'Correction faille de sécurité' },
              { id: 5, type: 'fix', description: 'Résolution problème de cache' }
            ]
          }
        ]
      } finally {
        isLoading.value = false
      }
    }
    
    const submitVersion = async () => {
      try {
        isLoading.value = true
        
        // Ajouter la version via l'API
        const versionData = {
          ...newVersion.value,
          project_id: props.projectId
        }
        
        const result = await widgetDataService.addVersioningData(props.projectId, newVersion.value)
        
        if (result.success) {
          // Recharger les données
          await loadVersions()
          
          // Réinitialiser le formulaire
          newVersion.value = {
            version: '',
            type: 'patch',
            description: '',
            author: '',
            release_date: new Date().toISOString().split('T')[0],
            is_current: false
          }
          
          showAddModal.value = false
          showNotification(t('widgets.versioning.versionCreated'))
        } else {
          throw new Error(result.message || 'Erreur lors de l\'ajout')
        }
        
      } catch (err) {
        console.error('Erreur lors de l\'ajout de la version:', err)
        showError(t('widgets.versioning.error'))
      } finally {
        isLoading.value = false
      }
    }
    
    const selectVersion = (version: Version) => {
      // Logique pour sélectionner/afficher les détails d'une version
      console.log('Version sélectionnée:', version)
    }
    
    const toggleWidget = () => {
      widgetConfig.value.isEnabled = !widgetConfig.value.isEnabled
      const updatedWidget = {
        ...props.widget,
        is_enabled: widgetConfig.value.isEnabled
      }
      emit('widget-updated', updatedWidget)
    }
    
    const updateConfig = (newConfig: any) => {
      Object.assign(widgetConfig.value, newConfig)
      showConfigModal.value = false
      showNotification(t('widgets.versioning.configUpdated'))
    }
    
    const formatDate = (dateString: string) => {
      return new Date(dateString).toLocaleDateString('fr-FR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
      })
    }
    
    const getVersionIcon = (type: VersionType) => {
      const icons: Record<VersionType, string> = {
        major: 'fas fa-rocket',
        minor: 'fas fa-plus-circle',
        patch: 'fas fa-wrench',
        hotfix: 'fas fa-fire'
      }
      return icons[type] || 'fas fa-code-branch'
    }
    
    const getChangeIcon = (type: string) => {
      const icons: Record<string, string> = {
        feature: 'fas fa-plus text-green-500',
        improvement: 'fas fa-arrow-up text-blue-500',
        fix: 'fas fa-bug text-red-500',
        breaking: 'fas fa-exclamation-triangle text-orange-500'
      }
      return icons[type] || 'fas fa-circle'
    }
    
    // Lifecycle
    onMounted(() => {
      loadVersions()
    })
    
    // Watchers
    watch(() => props.projectId, () => {
      loadVersions()
    })
    
    watch([filterType, searchQuery], () => {
      currentPage.value = 1
    })
    





</script>

<style scoped>
.versioning-widget {
  @apply h-full flex flex-col;
}

.versions-header {
  @apply flex items-center justify-between mb-4 pb-3 border-b border-gray-200;
}

.header-left {
  @apply flex-1;
}

.versions-title {
  @apply text-lg font-semibold text-gray-900 mb-1;
}

.versions-stats {
  @apply flex items-center space-x-4 text-sm text-gray-600;
}

.stat-item {
  @apply flex items-center;
}

.versions-filters {
  @apply flex items-center space-x-3 mb-4;
}

.filter-group {
  @apply flex-1;
}

.filter-select,
.filter-input {
  @apply w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent;
}

.versions-timeline {
  @apply flex-1 overflow-hidden;
}

.empty-state {
  @apply flex flex-col items-center justify-center h-full text-gray-500;
}

.empty-state i {
  @apply text-4xl mb-2;
}

.timeline-items {
  @apply space-y-4 max-h-full overflow-y-auto;
}

.timeline-item {
  @apply flex items-start space-x-4 cursor-pointer transition-all duration-200 hover:bg-gray-50 p-3 rounded-lg;
}

.timeline-marker {
  @apply flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center text-white font-bold;
}

.marker-major {
  @apply bg-red-500;
}

.marker-minor {
  @apply bg-blue-500;
}

.marker-patch {
  @apply bg-green-500;
}

.marker-hotfix {
  @apply bg-orange-500;
}

.timeline-content {
  @apply flex-1 min-w-0;
}

.version-header {
  @apply flex items-start justify-between mb-2;
}

.version-info {
  @apply flex-1;
}

.version-number {
  @apply text-lg font-bold text-gray-900 mb-1;
}

.version-badges {
  @apply flex items-center space-x-2;
}

.type-badge {
  @apply px-2 py-1 rounded-full text-xs font-medium;
}

.type-major {
  @apply bg-red-100 text-red-800;
}

.type-minor {
  @apply bg-blue-100 text-blue-800;
}

.type-patch {
  @apply bg-green-100 text-green-800;
}

.type-hotfix {
  @apply bg-orange-100 text-orange-800;
}

.current-badge {
  @apply px-2 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800;
}

.version-date {
  @apply text-sm text-gray-500 font-medium;
}

.version-description {
  @apply text-gray-700 mb-3;
}

.version-changes {
  @apply mb-3;
}

.changes-title {
  @apply text-sm font-semibold text-gray-900 mb-2;
}

.changes-list {
  @apply space-y-1;
}

.change-item {
  @apply flex items-center space-x-2 text-sm;
}

.change-type {
  @apply flex-shrink-0;
}

.change-feature {
  @apply text-green-500;
}

.change-improvement {
  @apply text-blue-500;
}

.change-fix {
  @apply text-red-500;
}

.change-breaking {
  @apply text-orange-500;
}

.change-text {
  @apply text-gray-700;
}

.more-changes {
  @apply text-sm text-gray-500 italic;
}

.version-meta {
  @apply flex items-center justify-between text-xs text-gray-500;
}

.version-author,
.version-downloads {
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

.checkbox-label {
  @apply flex items-center space-x-2 cursor-pointer;
}

.form-group input,
.form-group select,
.form-group textarea {
  @apply w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent;
}

.form-group input[type="checkbox"] {
  @apply w-auto;
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