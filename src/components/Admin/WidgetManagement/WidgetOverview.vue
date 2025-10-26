<template>
  <div class="space-y-6">
    <!-- Graphiques de répartition -->
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <!-- Répartition par statut -->
      <div class="bg-white shadow rounded-lg p-6">
        <h3 class="text-lg font-medium text-gray-900 mb-4">Répartition par statut de développement</h3>
        <div v-if="!loading && analysis" class="space-y-4">
          <div v-for="status in statusList" :key="status.key" class="flex items-center justify-between">
            <div class="flex items-center">
              <div class="w-4 h-4 rounded-full mr-3" :style="{ backgroundColor: status.color }"></div>
              <span class="text-sm font-medium text-gray-700">{{ status.label }}</span>
            </div>
            <div class="flex items-center space-x-2">
              <span class="text-sm font-bold text-gray-900">{{ analysis.stats[status.key] }}</span>
              <span class="text-xs text-gray-500">({{ getPercentage(analysis.stats[status.key]) }}%)</span>
            </div>
          </div>
          
          <!-- Barre de progression visuelle -->
          <div class="mt-4">
            <div class="flex h-4 bg-gray-200 rounded-full overflow-hidden">
              <div 
                v-for="status in statusList" 
                :key="status.key"
                class="transition-all duration-500"
                :style="{ 
                  width: `${getPercentage(analysis.stats[status.key])}%`,
                  backgroundColor: status.color 
                }"
              ></div>
            </div>
          </div>
        </div>
        <div v-else-if="loading" class="flex items-center justify-center h-32">
          <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
        </div>
      </div>

      <!-- Répartition par catégorie -->
      <div class="bg-white shadow rounded-lg p-6">
        <h3 class="text-lg font-medium text-gray-900 mb-4">Répartition par catégorie</h3>
        <div v-if="!loading && analysis" class="space-y-3">
          <div v-for="(stats, category) in analysis.stats.byCategory" :key="category" class="flex items-center justify-between">
            <div class="flex items-center">
              <i :class="getCategoryIcon(category)" class="text-gray-500 mr-3"></i>
              <span class="text-sm font-medium text-gray-700">{{ getCategoryLabel(category) }}</span>
            </div>
            <div class="flex items-center space-x-2">
              <span class="text-sm font-bold text-gray-900">{{ stats.total }}</span>
              <div class="flex space-x-1">
                <div class="w-2 h-2 rounded-full bg-green-500" v-if="stats.fullyDeveloped > 0"></div>
                <div class="w-2 h-2 rounded-full bg-yellow-500" v-if="stats.partiallyDeveloped > 0"></div>
                <div class="w-2 h-2 rounded-full bg-orange-500" v-if="stats.basicStructure > 0"></div>
                <div class="w-2 h-2 rounded-full bg-red-500" v-if="stats.notDeveloped > 0"></div>
              </div>
            </div>
          </div>
        </div>
        <div v-else-if="loading" class="flex items-center justify-center h-32">
          <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
        </div>
      </div>
    </div>

    <!-- Métriques détaillées -->
    <div class="bg-white shadow rounded-lg p-6">
      <h3 class="text-lg font-medium text-gray-900 mb-4">Métriques détaillées</h3>
      <div v-if="!loading && analysis" class="grid grid-cols-1 md:grid-cols-3 gap-6">
        <!-- Couverture de développement -->
        <div class="text-center">
          <div class="text-3xl font-bold text-primary-600 mb-2">{{ developmentCoverage }}%</div>
          <div class="text-sm text-gray-600">Couverture de développement</div>
          <div class="text-xs text-gray-500 mt-1">
            ({{ analysis.stats.fullyDeveloped + analysis.stats.partiallyDeveloped }}/{{ analysis.stats.total }} widgets)
          </div>
        </div>

        <!-- Widgets en base -->
        <div class="text-center">
          <div class="text-3xl font-bold text-blue-600 mb-2">{{ analysis.stats.inDatabase }}</div>
          <div class="text-sm text-gray-600">Widgets en base de données</div>
          <div class="text-xs text-gray-500 mt-1">
            {{ Math.round((analysis.stats.inDatabase / analysis.stats.total) * 100) }}% du total
          </div>
        </div>

        <!-- Widgets avec manifeste -->
        <div class="text-center">
          <div class="text-3xl font-bold text-green-600 mb-2">{{ analysis.stats.withManifest }}</div>
          <div class="text-sm text-gray-600">Widgets avec manifeste</div>
          <div class="text-xs text-gray-500 mt-1">
            {{ Math.round((analysis.stats.withManifest / analysis.stats.total) * 100) }}% du total
          </div>
        </div>
      </div>
      <div v-else-if="loading" class="flex items-center justify-center h-32">
        <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
      </div>
    </div>

    <!-- Actions recommandées -->
    <div class="bg-white shadow rounded-lg p-6">
      <h3 class="text-lg font-medium text-gray-900 mb-4">Actions recommandées</h3>
      <div v-if="!loading && analysis" class="space-y-4">
        <!-- Widgets développés non en base -->
        <div v-if="developedNotInDb > 0" class="flex items-start p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
          <div class="flex-shrink-0">
            <i class="fas fa-exclamation-triangle text-yellow-600 mt-1"></i>
          </div>
          <div class="ml-3 flex-1">
            <h4 class="text-sm font-medium text-yellow-800">Widgets développés non référencés</h4>
            <p class="text-sm text-yellow-700 mt-1">
              {{ developedNotInDb }} widgets entièrement développés ne sont pas présents en base de données.
            </p>
            <div class="mt-2">
              <button class="text-sm font-medium text-yellow-800 hover:text-yellow-900 underline">
                Ajouter automatiquement →
              </button>
            </div>
          </div>
        </div>

        <!-- Widgets sans manifeste -->
        <div v-if="developedWithoutManifest > 0" class="flex items-start p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <div class="flex-shrink-0">
            <i class="fas fa-file-alt text-blue-600 mt-1"></i>
          </div>
          <div class="ml-3 flex-1">
            <h4 class="text-sm font-medium text-blue-800">Manifestes manquants</h4>
            <p class="text-sm text-blue-700 mt-1">
              {{ developedWithoutManifest }} widgets développés n'ont pas de manifeste.
            </p>
            <div class="mt-2">
              <button class="text-sm font-medium text-blue-800 hover:text-blue-900 underline">
                Générer automatiquement →
              </button>
            </div>
          </div>
        </div>

        <!-- Widgets manquants dans le code -->
        <div v-if="inDevelopment > 0" class="flex items-start p-4 bg-green-50 border border-green-200 rounded-lg">
          <div class="flex-shrink-0">
            <i class="fas fa-code text-green-600 mt-1"></i>
          </div>
          <div class="ml-3 flex-1">
            <h4 class="text-sm font-medium text-green-800">Widgets manquants dans le code</h4>
            <p class="text-sm text-green-700 mt-1">
              {{ inDevelopment }} widgets sont présents en base de données mais manquent dans le code.
            </p>
            <div class="mt-2">
              <button class="text-sm font-medium text-green-800 hover:text-green-900 underline">
                Voir les détails →
              </button>
            </div>
          </div>
        </div>

        <!-- Aucune action nécessaire -->
        <div v-if="developedNotInDb === 0 && developedWithoutManifest === 0 && inDevelopment === 0" 
             class="flex items-start p-4 bg-green-50 border border-green-200 rounded-lg">
          <div class="flex-shrink-0">
            <i class="fas fa-check-circle text-green-600 mt-1"></i>
          </div>
          <div class="ml-3 flex-1">
            <h4 class="text-sm font-medium text-green-800">Tout est en ordre !</h4>
            <p class="text-sm text-green-700 mt-1">
              Tous les widgets développés sont correctement configurés.
            </p>
          </div>
        </div>
      </div>
      <div v-else-if="loading" class="flex items-center justify-center h-32">
        <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
      </div>
    </div>

    <!-- Dernière mise à jour -->
    <div v-if="analysis" class="text-center text-sm text-gray-500">
      Dernière mise à jour : {{ formatDate(analysis.lastUpdated) }}
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  analysis: {
    type: Object,
    default: null
  },
  loading: {
    type: Boolean,
    default: false
  }
})

// Statuts avec couleurs
const statusList = [
  { key: 'synchronized', label: 'Synchronisé (DB + Code)', color: '#10B981' },
  { key: 'developed', label: 'Développé', color: '#3B82F6' },
  { key: 'inDatabase', label: 'En base de données', color: '#F59E0B' }
]

// Métriques calculées
const developmentProgress = computed(() => {
  if (!props.analysis || props.analysis.stats.total === 0) return 0
  return Math.round((props.analysis.stats.developed / props.analysis.stats.total) * 100)
})

const developedNotInDb = computed(() => {
  if (!props.analysis) return 0
  return props.analysis.comparison.missingInDatabase || 0
})

const developedWithoutManifest = computed(() => {
  if (!props.analysis) return 0
  return props.analysis.filesystem.widgets.filter(w => !w.hasManifest).length
})

const inDevelopment = computed(() => {
  if (!props.analysis) return 0
  return props.analysis.comparison.missingInCode || 0
})

// Méthodes utilitaires
const getPercentage = (value) => {
  if (!props.analysis || props.analysis.stats.total === 0) return 0
  return Math.round((value / props.analysis.stats.total) * 100)
}

const getCategoryIcon = (category) => {
  const icons = {
    'analytics': 'fas fa-chart-bar',
    'project-management': 'fas fa-project-diagram',
    'team-management': 'fas fa-users',
    'communication': 'fas fa-comments',
    'development': 'fas fa-code',
    'productivity': 'fas fa-tasks',
    'file-management': 'fas fa-folder',
    'time-management': 'fas fa-clock',
    'finance': 'fas fa-dollar-sign',
    'integrations': 'fas fa-plug',
    'system': 'fas fa-cog',
    'security': 'fas fa-shield-alt',
    'other': 'fas fa-puzzle-piece'
  }
  return icons[category] || 'fas fa-puzzle-piece'
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

const formatDate = (dateString) => {
  const date = new Date(dateString)
  return date.toLocaleDateString('fr-FR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}
</script>