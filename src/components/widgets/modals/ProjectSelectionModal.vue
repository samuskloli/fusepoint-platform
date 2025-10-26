<template>
  <div class="modal-overlay" @click="$emit('close')">
    <div class="modal-container" @click.stop>
      <!-- Header -->
      <div class="modal-header">
        <div class="header-content">
          <div class="widget-info">
            <div class="widget-icon">
              <i :class="widget.icon"></i>
            </div>
            <div>
              <h2 class="modal-title">{{ tt('widgets.modal.selectProject', 'Sélectionner un projet') }}</h2>
              <p class="widget-name">{{ widget.name }}</p>
            </div>
          </div>
        </div>
        <button @click="$emit('close')" class="close-btn">
          <i class="fas fa-times"></i>
        </button>
      </div>

      <!-- Content -->
      <div class="modal-content">
        <!-- Installation Type Selection -->
        <div class="installation-type">
          <h3 class="section-title">{{ tt('widgets.modal.installationType', 'Type d\'installation') }}</h3>
          <div class="type-options">
            <label class="type-option" :class="{ active: installationType === 'project' }">
              <input
                type="radio"
                v-model="installationType"
                value="project"
                class="hidden"
              />
              <div class="option-content">
                <div class="option-icon">
                  <i class="fas fa-folder-open"></i>
                </div>
                <div class="option-info">
                  <div class="option-title">{{ tt('widgets.modal.installToProject', 'Installer dans un projet') }}</div>
                  <div class="option-description">{{ tt('widgets.modal.projectDescription', 'Le widget sera disponible uniquement dans le projet sélectionné') }}</div>
                </div>
              </div>
            </label>

            <label class="type-option" :class="{ active: installationType === 'template' }">
              <input
                type="radio"
                v-model="installationType"
                value="template"
                class="hidden"
              />
              <div class="option-content">
                <div class="option-icon">
                  <i class="fas fa-layer-group"></i>
                </div>
                <div class="option-info">
                  <div class="option-title">{{ tt('widgets.modal.installToTemplate', 'Installer dans un modèle') }}</div>
                  <div class="option-description">{{ tt('widgets.modal.templateDescription', 'Le widget sera disponible pour tous les nouveaux projets basés sur ce modèle') }}</div>
                </div>
              </div>
            </label>
          </div>
        </div>

        <!-- Project/Template Selection -->
        <div class="selection-section">
          <h3 class="section-title">
            {{ installationType === 'project' 
              ? tt('widgets.modal.selectProjectTitle', 'Sélectionner un projet') 
              : tt('widgets.modal.selectTemplateTitle', 'Sélectionner un modèle') 
            }}
          </h3>

          <!-- Search -->
          <div class="search-box">
            <i class="fas fa-search search-icon"></i>
            <input
              type="text"
              v-model="searchQuery"
              :placeholder="installationType === 'project' 
                ? tt('widgets.modal.searchProjects', 'Rechercher des projets...') 
                : tt('widgets.modal.searchTemplates', 'Rechercher des modèles...')"
              class="search-input"
            />
          </div>

          <!-- Loading State -->
          <div v-if="loading" class="loading-state">
            <div class="spinner"></div>
            <p>{{ tt('widgets.modal.loading', 'Chargement...') }}</p>
          </div>

          <!-- Items List -->
          <div v-else-if="filteredItems.length" class="items-list">
            <div
              v-for="item in filteredItems"
              :key="item.id"
              @click="selectedItem = item"
              class="item-card"
              :class="{ selected: selectedItem?.id === item.id }"
            >
              <div class="item-icon">
                <i :class="installationType === 'project' ? 'fas fa-folder' : 'fas fa-layer-group'"></i>
              </div>
              <div class="item-info">
                <div class="item-name">{{ item.name }}</div>
                <div class="item-description">{{ item.description || tt('widgets.modal.noDescription', 'Aucune description') }}</div>
                <div class="item-meta">
                  <span v-if="installationType === 'project'" class="meta-item">
                    <i class="fas fa-calendar"></i>
                    {{ formatDate(item.created_at) }}
                  </span>
                  <span v-if="item.widgets_count !== undefined" class="meta-item">
                    <i class="fas fa-puzzle-piece"></i>
                    {{ item.widgets_count }} {{ tt('widgets.modal.widgets', 'widgets') }}
                  </span>
                </div>
              </div>
              <div class="item-status">
                <div v-if="selectedItem?.id === item.id" class="selected-indicator">
                  <i class="fas fa-check"></i>
                </div>
              </div>
            </div>
          </div>

          <!-- Empty State -->
          <div v-else class="empty-state">
            <div class="empty-icon">
              <i :class="installationType === 'project' ? 'fas fa-folder-open' : 'fas fa-layer-group'"></i>
            </div>
            <h4 class="empty-title">
              {{ installationType === 'project' 
                ? tt('widgets.modal.noProjects', 'Aucun projet trouvé') 
                : tt('widgets.modal.noTemplates', 'Aucun modèle trouvé') 
              }}
            </h4>
            <p class="empty-description">
              {{ searchQuery 
                ? tt('widgets.modal.noSearchResults', 'Aucun résultat pour votre recherche') 
                : (installationType === 'project' 
                  ? tt('widgets.modal.createFirstProject', 'Créez votre premier projet pour installer des widgets') 
                  : tt('widgets.modal.createFirstTemplate', 'Créez votre premier modèle pour installer des widgets'))
              }}
            </p>
          </div>
        </div>

        <!-- Widget Configuration (if needed) -->
        <div v-if="widget.configurable && selectedItem" class="configuration-section">
          <h3 class="section-title">{{ tt('widgets.modal.configuration', 'Configuration') }}</h3>
          <div class="config-info">
            <i class="fas fa-info-circle text-blue-500"></i>
            <p>{{ tt('widgets.modal.configurationNote', "Ce widget peut être configuré après l'installation") }}</p>
          </div>
        </div>
      </div>

      <!-- Footer -->
      <div class="modal-footer">
        <div class="footer-info">
          <div v-if="selectedItem" class="selected-info">
            <i :class="installationType === 'project' ? 'fas fa-folder' : 'fas fa-layer-group'"></i>
            <span>{{ selectedItem.name }}</span>
          </div>
        </div>

        <div class="footer-actions">
          <button @click="$emit('close')" class="btn-secondary">
            {{ tt('common.cancel', 'Annuler') }}
          </button>
          <button
            @click="handleInstall"
            :disabled="!selectedItem || installing"
            class="btn-primary"
            :class="{ loading: installing }"
          >
            <i v-if="installing" class="fas fa-spinner fa-spin"></i>
            <i v-else class="fas fa-download"></i>
            {{ installing 
              ? tt('widgets.modal.installing', 'Installation...') 
              : tt('widgets.modal.install', 'Installer') 
            }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useI18n } from 'vue-i18n'

const { t, te } = useI18n()
const tt = (key, fallback) => (te(key) ? t(key) : fallback)

const props = defineProps({
  widget: {
    type: Object,
    required: true
  }
})

const emit = defineEmits(['close', 'install'])

// Reactive data
const installationType = ref('project')
const selectedItem = ref(null)
const searchQuery = ref('')
const loading = ref(false)
const installing = ref(false)
const projects = ref([])
const templates = ref([])

// Computed
const currentItems = computed(() => {
  return installationType.value === 'project' ? projects.value : templates.value
})

const filteredItems = computed(() => {
  if (!searchQuery.value) return currentItems.value
  
  const query = searchQuery.value.toLowerCase()
  return currentItems.value.filter(item => 
    item.name.toLowerCase().includes(query) ||
    (item.description && item.description.toLowerCase().includes(query))
  )
})

// Methods
const loadProjects = async () => {
  loading.value = true
  try {
    // Simuler un appel API - à remplacer par votre logique
    await new Promise(resolve => setTimeout(resolve, 500))
    
    projects.value = [
      {
        id: 1,
        name: 'Campagne Marketing Q1',
        description: 'Campagne de marketing digital pour le premier trimestre',
        created_at: '2024-01-15',
        widgets_count: 5
      },
      {
        id: 2,
        name: 'Lancement Produit X',
        description: 'Projet de lancement du nouveau produit X',
        created_at: '2024-02-01',
        widgets_count: 3
      },
      {
        id: 3,
        name: 'Refonte Site Web',
        description: 'Refonte complète du site web corporate',
        created_at: '2024-01-20',
        widgets_count: 8
      }
    ]
  } catch (error) {
    console.error('Erreur lors du chargement des projets:', error)
  } finally {
    loading.value = false
  }
}

const loadTemplates = async () => {
  loading.value = true
  try {
    // Simuler un appel API - à remplacer par votre logique
    await new Promise(resolve => setTimeout(resolve, 500))
    
    templates.value = [
      {
        id: 1,
        name: 'Modèle Marketing',
        description: 'Modèle standard pour les projets marketing',
        widgets_count: 7
      },
      {
        id: 2,
        name: 'Modèle Vente',
        description: 'Modèle optimisé pour les équipes de vente',
        widgets_count: 5
      },
      {
        id: 3,
        name: 'Modèle Support',
        description: 'Modèle pour les équipes de support client',
        widgets_count: 4
      }
    ]
  } catch (error) {
    console.error('Erreur lors du chargement des modèles:', error)
  } finally {
    loading.value = false
  }
}

const handleInstall = async () => {
  if (!selectedItem.value) return
  
  installing.value = true
  try {
    // Simuler l'installation
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    emit('install', {
      widget: props.widget,
      target: selectedItem.value,
      type: installationType.value
    })
  } catch (error) {
    console.error('Erreur lors de l\'installation:', error)
  } finally {
    installing.value = false
  }
}

const formatDate = (dateString) => {
  return new Date(dateString).toLocaleDateString('fr-FR', {
    day: 'numeric',
    month: 'short',
    year: 'numeric'
  })
}

// Watchers
watch(installationType, () => {
  selectedItem.value = null
  searchQuery.value = ''
  
  if (installationType.value === 'project' && projects.value.length === 0) {
    loadProjects()
  } else if (installationType.value === 'template' && templates.value.length === 0) {
    loadTemplates()
  }
})

// Lifecycle
onMounted(() => {
  loadProjects()
})
</script>

<style scoped>
.modal-overlay {
  @apply fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4;
}

.modal-container {
  @apply bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden flex flex-col;
}

.modal-header {
  @apply flex items-center justify-between p-6 border-b border-gray-200;
}

.header-content {
  @apply flex-1;
}

.widget-info {
  @apply flex items-center gap-4;
}

.widget-icon {
  @apply w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center text-white text-xl;
}

.modal-title {
  @apply text-xl font-semibold text-gray-900;
}

.widget-name {
  @apply text-gray-500 text-sm;
}

.close-btn {
  @apply p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100 transition-colors;
}

.modal-content {
  @apply flex-1 overflow-y-auto p-6 space-y-6;
}

.section-title {
  @apply text-lg font-medium text-gray-900 mb-4;
}

.installation-type {
  @apply space-y-4;
}

.type-options {
  @apply space-y-3;
}

.type-option {
  @apply block cursor-pointer;
}

.type-option.active .option-content {
  @apply border-blue-500 bg-blue-50;
}

.option-content {
  @apply border-2 border-gray-200 rounded-xl p-4 hover:border-gray-300 transition-colors flex items-start gap-4;
}

.option-icon {
  @apply w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center text-gray-600;
}

.type-option.active .option-icon {
  @apply bg-blue-100 text-blue-600;
}

.option-info {
  @apply flex-1;
}

.option-title {
  @apply font-medium text-gray-900 mb-1;
}

.option-description {
  @apply text-sm text-gray-500;
}

.selection-section {
  @apply space-y-4;
}

.search-box {
  @apply relative;
}

.search-icon {
  @apply absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400;
}

.search-input {
  @apply w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent;
}

.loading-state {
  @apply flex items-center justify-center gap-3 py-8 text-gray-500;
}

.spinner {
  @apply w-5 h-5 border-2 border-gray-300 border-t-blue-500 rounded-full animate-spin;
}

.items-list {
  @apply space-y-3 max-h-64 overflow-y-auto;
}

.item-card {
  @apply border border-gray-200 rounded-lg p-4 cursor-pointer hover:border-gray-300 transition-colors flex items-start gap-4;
}

.item-card.selected {
  @apply border-blue-500 bg-blue-50;
}

.item-icon {
  @apply w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center text-gray-600;
}

.item-card.selected .item-icon {
  @apply bg-blue-100 text-blue-600;
}

.item-info {
  @apply flex-1;
}

.item-name {
  @apply font-medium text-gray-900 mb-1;
}

.item-description {
  @apply text-sm text-gray-500 mb-2;
}

.item-meta {
  @apply flex items-center gap-4 text-xs text-gray-400;
}

.meta-item {
  @apply flex items-center gap-1;
}

.item-status {
  @apply flex items-center;
}

.selected-indicator {
  @apply w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center text-xs;
}

.empty-state {
  @apply text-center py-12;
}

.empty-icon {
  @apply text-4xl text-gray-300 mb-4;
}

.empty-title {
  @apply text-lg font-medium text-gray-900 mb-2;
}

.empty-description {
  @apply text-gray-500;
}

.configuration-section {
  @apply space-y-4;
}

.config-info {
  @apply flex items-start gap-3 p-4 bg-blue-50 rounded-lg;
}

.config-info p {
  @apply text-sm text-blue-700;
}

.modal-footer {
  @apply flex items-center justify-between p-6 border-t border-gray-200 bg-gray-50;
}

.footer-info {
  @apply flex items-center;
}

.selected-info {
  @apply flex items-center gap-2 text-sm text-gray-600;
}

.footer-actions {
  @apply flex items-center gap-3;
}

.btn-primary {
  @apply bg-blue-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-blue-700 transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed;
}

.btn-secondary {
  @apply bg-gray-100 text-gray-700 px-6 py-2 rounded-lg font-medium hover:bg-gray-200 transition-colors;
}

.btn-primary.loading {
  @apply cursor-not-allowed;
}

/* Responsive */
@media (max-width: 768px) {
  .modal-container {
    @apply max-w-full m-2;
  }
  
  .modal-header {
    @apply p-4;
  }
  
  .modal-content {
    @apply p-4;
  }
  
  .modal-footer {
    @apply p-4 flex-col gap-4;
  }
  
  .footer-actions {
    @apply w-full justify-center;
  }
}
</style>