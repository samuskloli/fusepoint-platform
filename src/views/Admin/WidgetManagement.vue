<template>
  <Layout>
    <!-- Header de la page -->
    <div class="mb-6">
      <div class="flex items-center justify-between">
        <div class="flex-1">
          <h1 class="text-2xl font-bold text-gray-900 flex items-center">
            <svg class="w-6 h-6 mr-3 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 9a2 2 0 00-2 2m0 0v6a2 2 0 002 2m14-2a2 2 0 002-2m-2-2a2 2 0 00-2-2m2 2a2 2 0 012 2M7 7l10 10M7 17L17 7"></path>
            </svg>
            {{ $t('admin.widget_management.title') }}
          </h1>
          <p class="mt-1 text-sm text-gray-500">
            {{ $t('admin.widget_management.description') }}
          </p>
        </div>
        
        <div class="flex items-center space-x-4">
          <!-- Bouton Actualiser -->
          <button
            @click="refreshAnalysis"
            :disabled="isLoading"
            class="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
          >
            <svg class="w-4 h-4 mr-2" :class="{ 'animate-spin': isLoading }" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path>
            </svg>
            {{ isLoading ? $t('common.loading') : $t('common.refresh') }}
          </button>
          
          <!-- Actions groupées -->
          <div class="relative">
            <button
              @click="showBulkActions = !showBulkActions"
              class="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path>
              </svg>
              {{ $t('admin.widget_management.bulk_actions') }}
            </button>
            
            <!-- Menu déroulant des actions groupées -->
            <div v-if="showBulkActions" class="absolute right-0 mt-2 w-56 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 z-10">
              <div class="py-1">
                <button
                  @click="addMissingWidgetsBulk"
                  class="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                >
                  <svg class="w-4 h-4 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path>
                  </svg>
                  {{ $t('admin.widget_management.add_missing_widgets') }}
                </button>
                <button
                  @click="generateMissingManifests"
                  class="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                >
                  <svg class="w-4 h-4 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
                  </svg>
                  {{ $t('admin.widget_management.generate_manifests') }}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

      <!-- Statistiques globales -->
      <div v-if="analysis" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div class="bg-white overflow-hidden shadow rounded-lg">
          <div class="p-5">
            <div class="flex items-center">
              <div class="flex-shrink-0">
                <div class="w-8 h-8 bg-blue-500 rounded-md flex items-center justify-center">
                  <i class="fas fa-puzzle-piece text-white text-sm"></i>
                </div>
              </div>
              <div class="ml-5 w-0 flex-1">
                <dl>
                  <dt class="text-sm font-medium text-gray-500 truncate">Total Widgets</dt>
                  <dd class="text-lg font-medium text-gray-900">{{ analysis.value?.stats.total || 0 }}</dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div class="bg-white overflow-hidden shadow rounded-lg">
          <div class="p-5">
            <div class="flex items-center">
              <div class="flex-shrink-0">
                <div class="w-8 h-8 bg-green-500 rounded-md flex items-center justify-center">
                  <i class="fas fa-check-circle text-white text-sm"></i>
                </div>
              </div>
              <div class="ml-5 w-0 flex-1">
                <dl>
                  <dt class="text-sm font-medium text-gray-500 truncate">Développés</dt>
                  <dd class="text-lg font-medium text-gray-900">{{ analysis.value?.stats.developed || 0 }}</dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div class="bg-white overflow-hidden shadow rounded-lg">
          <div class="p-5">
            <div class="flex items-center">
              <div class="flex-shrink-0">
                <div class="w-8 h-8 bg-purple-500 rounded-md flex items-center justify-center">
                  <i class="fas fa-database text-white text-sm"></i>
                </div>
              </div>
              <div class="ml-5 w-0 flex-1">
                <dl>
                  <dt class="text-sm font-medium text-gray-500 truncate">En base de données</dt>
                  <dd class="text-lg font-medium text-gray-900">{{ analysis.value?.stats.inDatabase || 0 }}</dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div class="bg-white overflow-hidden shadow rounded-lg">
          <div class="p-5">
            <div class="flex items-center">
              <div class="flex-shrink-0">
                <div class="w-8 h-8 bg-emerald-500 rounded-md flex items-center justify-center">
                  <i class="fas fa-sync text-white text-sm"></i>
                </div>
              </div>
              <div class="ml-5 w-0 flex-1">
                <dl>
                  <dt class="text-sm font-medium text-gray-500 truncate">Synchronisés</dt>
                  <dd class="text-lg font-medium text-gray-900">{{ analysis.value?.stats.synchronized || 0 }}</dd>
                </dl>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Graphique de progression -->
      <div v-if="analysis" class="bg-white shadow rounded-lg p-6 mb-8">
        <h3 class="text-lg font-medium text-gray-900 mb-4">État de synchronisation</h3>
        
        <!-- Barre de progression pour les widgets synchronisés -->
        <div class="mb-4">
          <div class="flex justify-between text-sm text-gray-600 mb-2">
            <span>Widgets synchronisés (DB + Code)</span>
            <span>{{ synchronizationProgress.toFixed(1) }}%</span>
          </div>
          <div class="w-full bg-gray-200 rounded-full h-3">
            <div class="bg-gradient-to-r from-emerald-400 to-emerald-600 h-3 rounded-full transition-all duration-500" 
                 :style="{ width: `${synchronizationProgress}%` }"></div>
          </div>
        </div>

        <!-- Barre de progression pour les widgets développés -->
        <div class="mb-4">
          <div class="flex justify-between text-sm text-gray-600 mb-2">
            <span>Widgets développés</span>
            <span>{{ developmentProgress.toFixed(1) }}%</span>
          </div>
          <div class="w-full bg-gray-200 rounded-full h-3">
            <div class="bg-gradient-to-r from-blue-400 to-blue-600 h-3 rounded-full transition-all duration-500" 
                 :style="{ width: `${developmentProgress}%` }"></div>
          </div>
        </div>

        <!-- Statistiques détaillées -->
        <div class="grid grid-cols-3 gap-4 text-center text-sm">
          <div>
            <div class="text-lg font-semibold text-emerald-600">{{ analysis.value?.stats.synchronized || 0 }}</div>
            <div class="text-gray-500">Synchronisés</div>
          </div>
          <div>
            <div class="text-lg font-semibold text-yellow-600">{{ analysis.value?.comparison.missingInDatabase?.length || 0 }}</div>
            <div class="text-gray-500">Manquants en DB</div>
          </div>
          <div>
            <div class="text-lg font-semibold text-red-600">{{ analysis.value?.comparison.missingInCode?.length || 0 }}</div>
            <div class="text-gray-500">Non développés</div>
          </div>
        </div>
      </div>

      <!-- Navigation par onglets -->
      <div class="mb-6">
        <nav class="flex space-x-8" aria-label="Tabs">
          <button
            v-for="tab in tabs"
            :key="tab.id"
            @click="activeTab = tab.id"
            :class="[
              activeTab === tab.id
                ? 'border-primary-500 text-primary-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300',
              'whitespace-nowrap py-2 px-1 border-b-2 font-medium text-sm'
            ]"
          >
            <i :class="tab.icon" class="mr-2"></i>
            {{ tab.label }}
            <span v-if="tab.count !== undefined" class="ml-2 bg-gray-100 text-gray-900 py-0.5 px-2.5 rounded-full text-xs font-medium">
              {{ tab.count }}
            </span>
          </button>
        </nav>
      </div>

      <!-- Filtres et recherche -->
      <div class="bg-white shadow rounded-lg p-4 mb-6">
        <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Recherche</label>
            <div class="relative">
              <input
                v-model="searchQuery"
                type="text"
                placeholder="Nom du widget..."
                class="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
              >
              <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <i class="fas fa-search text-gray-400"></i>
              </div>
            </div>
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Statut</label>
            <select
              v-model="statusFilter"
              class="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
            >
              <option value="all">Tous les statuts</option>
              <option value="synchronized">Synchronisé (DB + Code)</option>
              <option value="missing_in_code">Manquant dans le code</option>
              <option value="missing_in_database">Manquant en base de données</option>
            </select>
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Catégorie</label>
            <select
              v-model="categoryFilter"
              class="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
            >
              <option value="all">Toutes les catégories</option>
              <option v-for="category in categories" :key="category" :value="category">
                {{ getCategoryLabel(category) }}
              </option>
            </select>
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Base de données</label>
            <select
              v-model="databaseFilter"
              class="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
            >
              <option value="all">Tous</option>
              <option value="in_db">En base de données</option>
              <option value="not_in_db">Pas en base</option>
            </select>
          </div>
        </div>
      </div>

      <!-- Actions groupées -->
      <div v-if="showBulkActions" class="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
        <div class="flex items-center justify-between">
          <div class="flex items-center">
            <i class="fas fa-info-circle text-yellow-600 mr-2"></i>
            <span class="text-sm font-medium text-yellow-800">Actions groupées disponibles</span>
          </div>
          <div class="flex space-x-2">
            <button
              @click="addMissingWidgetsBulk"
              :disabled="loading"
              class="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50"
            >
              <i class="fas fa-plus mr-1"></i>
              Ajouter widgets développés en DB
            </button>
            <button
              @click="generateMissingManifests"
              :disabled="loading"
              class="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
            >
              <i class="fas fa-file-alt mr-1"></i>
              Générer manifestes manquants
            </button>
          </div>
        </div>
      </div>

      <!-- Contenu des onglets -->
      <div class="space-y-6">
        <!-- Vue d'ensemble -->
        <div v-if="activeTab === 'overview'">
          <WidgetOverview :analysis="analysis" :loading="loading" />
        </div>

        <!-- Liste des widgets -->
        <div v-if="activeTab === 'widgets'">
          <WidgetList 
            :widgets="filteredWidgets" 
            :loading="loading"
            @refresh="refreshAnalysis"
            @add-to-db="addWidgetToDatabase"
            @update-widget="updateWidget"
            @delete-widget="deleteWidget"
          />
        </div>

        <!-- Statistiques par catégorie -->
        <div v-if="activeTab === 'categories'">
          <CategoryStats :stats="analysis?.stats.byCategory" :loading="loading" />
        </div>

        <!-- Widgets manquants -->
        <div v-if="activeTab === 'missing'">
          <MissingWidgets 
            :widgets="missingWidgets" 
            :loading="loading"
            @add-to-db="addWidgetToDatabase"
          />
        </div>
      </div>
    <!-- Loading overlay -->
    <div v-if="loading" class="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50 flex items-center justify-center">
      <div class="bg-white p-6 rounded-lg shadow-xl">
        <div class="flex items-center">
          <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mr-4"></div>
          <span class="text-lg font-medium text-gray-900">Analyse en cours...</span>
        </div>
      </div>
    </div>
  </Layout>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useTranslation } from '@/composables/useTranslation'
import { useNotifications } from '@/composables/useNotifications'
import widgetAnalysisService from '@/services/widgetAnalysisService'
import Layout from '@/components/Layout.vue'
import WidgetOverview from '@/components/Admin/WidgetManagement/WidgetOverview.vue'
import WidgetList from '@/components/Admin/WidgetManagement/WidgetList.vue'
import CategoryStats from '@/components/Admin/WidgetManagement/CategoryStats.vue'
import MissingWidgets from '@/components/Admin/WidgetManagement/MissingWidgets.vue'

const { t } = useTranslation()
const { success, error: showError } = useNotifications()

// État réactif
const loading = ref(false)
const isLoading = computed(() => loading.value)
const analysis = ref(null)
const activeTab = ref('overview')
const searchQuery = ref('')
const statusFilter = ref('all')
const categoryFilter = ref('all')
const databaseFilter = ref('all')
const showBulkActions = ref(false)

// Onglets
const tabs = computed(() => [
  {
    id: 'overview',
    label: 'Vue d\'ensemble',
    icon: 'fas fa-chart-pie',
    count: undefined
  },
  {
    id: 'widgets',
    label: 'Widgets',
    icon: 'fas fa-puzzle-piece',
    count: analysis.value?.stats.total
  },
  {
    id: 'categories',
    label: 'Catégories',
    icon: 'fas fa-tags',
    count: Object.keys(analysis.value?.stats.byCategory || {}).length
  },
  {
    id: 'missing',
    label: 'Manquants en DB',
    icon: 'fas fa-exclamation-triangle',
    count: analysis.value?.comparison.missingInDatabase?.length || 0
  }
])

// Catégories disponibles
const categories = computed(() => {
  if (!analysis.value) return []
  return Object.keys(analysis.value.stats.byCategory).sort()
})

// Progression du développement
const developmentProgress = computed(() => {
  if (!analysis.value || analysis.value.stats.total === 0) return 0
  return (analysis.value.stats.developed / analysis.value.stats.total) * 100
})

// Progression de synchronisation
const synchronizationProgress = computed(() => {
  if (!analysis.value || analysis.value.stats.total === 0) return 0
  return (analysis.value.stats.synchronized / analysis.value.stats.total) * 100
})

// Widgets filtrés - combine les widgets de la DB et du filesystem
const filteredWidgets = computed(() => {
  if (!analysis.value) return []
  
  // Créer une liste unifiée de tous les widgets
  let allWidgets = []
  
  // Ajouter les widgets de la base de données avec leurs informations
  analysis.value.database.widgets.forEach(dbWidget => {
    allWidgets.push({
      ...dbWidget,
      source: 'database',
      status: dbWidget.isDeveloped ? 'synchronized' : 'missing_in_code',
      inDatabase: true,
      isDeveloped: dbWidget.isDeveloped,
      developedAs: dbWidget.developedAs
    })
  })
  
  // Ajouter les widgets développés qui ne sont pas en DB
  analysis.value.filesystem.widgets.forEach(fsWidget => {
    if (!fsWidget.inDatabase) {
      allWidgets.push({
        ...fsWidget,
        source: 'filesystem',
        status: 'missing_in_database',
        inDatabase: false,
        isDeveloped: true,
        name: fsWidget.componentName,
        component_name: fsWidget.componentName
      })
    }
  })

  let widgets = allWidgets

  // Filtre par recherche
  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase()
    widgets = widgets.filter(widget => 
      (widget.name && widget.name.toLowerCase().includes(query)) ||
      (widget.componentName && widget.componentName.toLowerCase().includes(query)) ||
      (widget.description && widget.description.toLowerCase().includes(query))
    )
  }

  // Filtre par statut
  if (statusFilter.value !== 'all') {
    widgets = widgets.filter(widget => widget.status === statusFilter.value)
  }

  // Filtre par catégorie
  if (categoryFilter.value !== 'all') {
    widgets = widgets.filter(widget => widget.category === categoryFilter.value)
  }

  // Filtre par base de données
  if (databaseFilter.value === 'in_db') {
    widgets = widgets.filter(widget => widget.inDatabase)
  } else if (databaseFilter.value === 'not_in_db') {
    widgets = widgets.filter(widget => !widget.inDatabase)
  }

  return widgets
})

// Widgets manquants en base de données
const missingWidgets = computed(() => {
  if (!analysis.value) return []
  return analysis.value.comparison.missingInDatabase || []
})

// Méthodes
const refreshAnalysis = async () => {
  loading.value = true
  try {
    widgetAnalysisService.clearCache()
    analysis.value = await widgetAnalysisService.getCompleteAnalysis()
    success('Analyse mise à jour avec succès')
  } catch (error) {
    console.error('Erreur lors de l\'actualisation:', error)
    showError('Erreur lors de l\'actualisation de l\'analyse')
  } finally {
    loading.value = false
  }
}

const addWidgetToDatabase = async (widget) => {
  try {
    await widgetAnalysisService.addWidgetToDatabase(widget)
    success(`Widget ${widget.name} ajouté à la base de données`)
    await refreshAnalysis()
  } catch (error) {
    console.error('Erreur lors de l\'ajout:', error)
    showError(`Erreur lors de l'ajout du widget ${widget.name}`)
  }
}

const updateWidget = async (widgetId, updates) => {
  try {
    await widgetAnalysisService.updateWidget(widgetId, updates)
    success('Widget mis à jour avec succès')
    await refreshAnalysis()
  } catch (error) {
    console.error('Erreur lors de la mise à jour:', error)
    showError('Erreur lors de la mise à jour du widget')
  }
}

const deleteWidget = async (widgetId) => {
  if (!confirm(t('common.confirmations.deleteWidget'))) return
  
  try {
    await widgetAnalysisService.deleteWidget(widgetId)
    success('Widget supprimé avec succès')
    await refreshAnalysis()
  } catch (error) {
    console.error('Erreur lors de la suppression:', error)
    showError('Erreur lors de la suppression du widget')
  }
}

const addMissingWidgetsBulk = async () => {
  if (!confirm(`Ajouter ${missingWidgets.value.length} widgets développés à la base de données ?`)) return
  
  loading.value = true
  let successCount = 0
  
  try {
    for (const widget of missingWidgets.value) {
      try {
        await widgetAnalysisService.addWidgetToDatabase(widget)
        successCount++
      } catch (error) {
        console.error(`Erreur pour ${widget.name}:`, error)
      }
    }
    
    success(`${successCount} widgets ajoutés avec succès`)
    await refreshAnalysis()
  } catch (error) {
    showError('Erreur lors de l\'ajout groupé')
  } finally {
    loading.value = false
  }
}

const generateMissingManifests = async () => {
  const widgetsWithoutManifest = analysis.value?.filesystem.widgets.filter(w => 
    !w.hasManifest
  ) || []
  
  if (widgetsWithoutManifest.length === 0) {
    showError('Aucun manifeste à générer')
    return
  }
  
  if (!confirm(`Générer ${widgetsWithoutManifest.length} manifestes manquants ?`)) return
  
  // Cette fonctionnalité nécessiterait un endpoint côté serveur
  showError('Fonctionnalité en cours de développement')
}

const getCategoryLabel = (category) => {
  const labels = {
    'analytics': 'Analytique',
    'project-management': 'Gestion de projet',
    'team-management': 'Gestion d\'équipe',
    'communication': 'Communication',
    'development': 'Développement',
    'productivity': 'Productivité',
    'file-management': 'Gestion de fichiers',
    'time-management': 'Gestion du temps',
    'finance': 'Finance',
    'integrations': 'Intégrations',
    'system': 'Système',
    'security': 'Sécurité',
    'other': 'Autre'
  }
  return labels[category] || category
}

// Lifecycle
onMounted(() => {
  refreshAnalysis()
})

// Watchers
watch([searchQuery, statusFilter, categoryFilter, databaseFilter], () => {
  // Les filtres sont réactifs via les computed
}, { deep: true })
</script>

<style scoped>
.animate-spin {
  animation: spin 1s linear infinite;
}

@keyframes spin {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}
</style>