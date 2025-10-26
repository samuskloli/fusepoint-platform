<template>
  <div class="bg-white shadow rounded-lg overflow-hidden">
    <!-- En-tête -->
    <div class="px-6 py-4 border-b border-gray-200">
      <h3 class="text-lg font-medium text-gray-900">Statistiques par catégorie</h3>
    </div>

    <!-- Loading state -->
    <div v-if="loading" class="p-8 text-center">
      <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto mb-4"></div>
      <p class="text-gray-500">Chargement des statistiques...</p>
    </div>

    <!-- Empty state -->
    <div v-else-if="categoryStats.length === 0" class="p-8 text-center">
      <i class="fas fa-chart-bar text-gray-300 text-4xl mb-4"></i>
      <p class="text-gray-500">Aucune donnée disponible</p>
    </div>

    <!-- Statistiques -->
    <div v-else class="p-6">
      <div class="space-y-6">
        <!-- Vue d'ensemble -->
        <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div class="bg-blue-50 rounded-lg p-4">
            <div class="flex items-center">
              <div class="flex-shrink-0">
                <i class="fas fa-layer-group text-blue-600 text-xl"></i>
              </div>
              <div class="ml-3">
                <p class="text-sm font-medium text-blue-900">Total catégories</p>
                <p class="text-2xl font-semibold text-blue-600">{{ categoryStats.length }}</p>
              </div>
            </div>
          </div>

          <div class="bg-green-50 rounded-lg p-4">
            <div class="flex items-center">
              <div class="flex-shrink-0">
                <i class="fas fa-check-circle text-green-600 text-xl"></i>
              </div>
              <div class="ml-3">
                <p class="text-sm font-medium text-green-900">Catégories actives</p>
                <p class="text-2xl font-semibold text-green-600">{{ activeCategoriesCount }}</p>
              </div>
            </div>
          </div>

          <div class="bg-purple-50 rounded-lg p-4">
            <div class="flex items-center">
              <div class="flex-shrink-0">
                <i class="fas fa-percentage text-purple-600 text-xl"></i>
              </div>
              <div class="ml-3">
                <p class="text-sm font-medium text-purple-900">Couverture moyenne</p>
                <p class="text-2xl font-semibold text-purple-600">{{ averageCoverage }}%</p>
              </div>
            </div>
          </div>
        </div>

        <!-- Liste des catégories -->
        <div class="space-y-4">
          <div
            v-for="category in sortedCategoryStats"
            :key="category.name"
            class="border border-gray-200 rounded-lg p-4 hover:shadow-sm transition-shadow"
          >
            <div class="flex items-center justify-between mb-3">
              <div class="flex items-center space-x-3">
                <div class="flex-shrink-0">
                  <div class="h-10 w-10 rounded-lg bg-primary-100 flex items-center justify-center">
                    <i :class="getCategoryIcon(category.name)" class="text-primary-600"></i>
                  </div>
                </div>
                <div>
                  <h4 class="text-sm font-medium text-gray-900">{{ getCategoryLabel(category.name) }}</h4>
                  <p class="text-xs text-gray-500">{{ category.total }} widget(s)</p>
                </div>
              </div>
              <div class="text-right">
                <div class="text-sm font-medium text-gray-900">{{ category.developmentPercentage }}%</div>
                <div class="text-xs text-gray-500">développé</div>
              </div>
            </div>

            <!-- Barre de progression -->
            <div class="mb-3">
              <div class="flex items-center justify-between text-xs text-gray-600 mb-1">
                <span>Progression du développement</span>
                <span>{{ category.fullyDeveloped }}/{{ category.total }}</span>
              </div>
              <div class="w-full bg-gray-200 rounded-full h-2">
                <div 
                  class="h-2 rounded-full transition-all duration-300"
                  :class="getProgressColor(category.developmentPercentage)"
                  :style="{ width: `${category.developmentPercentage}%` }"
                ></div>
              </div>
            </div>

            <!-- Détails des statuts -->
            <div class="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs">
              <div class="flex items-center">
                <div class="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                <span class="text-gray-600">Développé: {{ category.fullyDeveloped }}</span>
              </div>
              <div class="flex items-center">
                <div class="w-2 h-2 bg-yellow-500 rounded-full mr-2"></div>
                <span class="text-gray-600">Partiel: {{ category.partiallyDeveloped }}</span>
              </div>
              <div class="flex items-center">
                <div class="w-2 h-2 bg-red-500 rounded-full mr-2"></div>
                <span class="text-gray-600">Non développé: {{ category.notDeveloped }}</span>
              </div>
              <div class="flex items-center">
                <div class="w-2 h-2 bg-blue-500 rounded-full mr-2"></div>
                <span class="text-gray-600">Base seule: {{ category.databaseOnly }}</span>
              </div>
            </div>

            <!-- Indicateurs supplémentaires -->
            <div class="mt-3 pt-3 border-t border-gray-100">
              <div class="flex items-center justify-between text-xs">
                <div class="flex items-center space-x-4">
                  <span class="flex items-center">
                    <i class="fas fa-database text-gray-400 mr-1"></i>
                    En base: {{ category.inDatabase }}
                  </span>
                  <span class="flex items-center">
                    <i class="fas fa-file-alt text-gray-400 mr-1"></i>
                    Manifeste: {{ category.hasManifest }}
                  </span>
                </div>
                <div class="text-gray-500">
                  Score moyen: {{ category.averageScore }}/100
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Graphique de répartition -->
        <div class="border-t border-gray-200 pt-6">
          <h4 class="text-sm font-medium text-gray-900 mb-4">Répartition globale</h4>
          <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div class="text-center">
              <div class="text-2xl font-bold text-green-600">{{ totalStats.fullyDeveloped }}</div>
              <div class="text-xs text-gray-500">Entièrement développés</div>
            </div>
            <div class="text-center">
              <div class="text-2xl font-bold text-yellow-600">{{ totalStats.partiallyDeveloped }}</div>
              <div class="text-xs text-gray-500">Partiellement développés</div>
            </div>
            <div class="text-center">
              <div class="text-2xl font-bold text-red-600">{{ totalStats.notDeveloped }}</div>
              <div class="text-xs text-gray-500">Non développés</div>
            </div>
            <div class="text-center">
              <div class="text-2xl font-bold text-blue-600">{{ totalStats.databaseOnly }}</div>
              <div class="text-xs text-gray-500">Base de données uniquement</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  widgets: {
    type: Array,
    default: () => []
  },
  loading: {
    type: Boolean,
    default: false
  }
})

// Calculer les statistiques par catégorie
const categoryStats = computed(() => {
  const stats = {}

  props.widgets.forEach(widget => {
    const category = widget.category || 'other'
    
    if (!stats[category]) {
      stats[category] = {
        name: category,
        total: 0,
        fullyDeveloped: 0,
        partiallyDeveloped: 0,
        notDeveloped: 0,
        databaseOnly: 0,
        inDatabase: 0,
        hasManifest: 0,
        totalScore: 0
      }
    }

    const categoryData = stats[category]
    categoryData.total++
    categoryData.totalScore += widget.analysis?.score || 0

    if (widget.inDatabase) categoryData.inDatabase++
    if (widget.hasManifest) categoryData.hasManifest++

    switch (widget.analysis?.status) {
      case 'fully_developed':
        categoryData.fullyDeveloped++
        break
      case 'partially_developed':
        categoryData.partiallyDeveloped++
        break
      case 'not_developed':
        categoryData.notDeveloped++
        break
      case 'in_database_only':
        categoryData.databaseOnly++
        break
    }
  })

  // Calculer les pourcentages et scores moyens
  return Object.values(stats).map(category => ({
    ...category,
    developmentPercentage: category.total > 0 
      ? Math.round((category.fullyDeveloped / category.total) * 100) 
      : 0,
    averageScore: category.total > 0 
      ? Math.round(category.totalScore / category.total) 
      : 0
  }))
})

// Trier les catégories par pourcentage de développement
const sortedCategoryStats = computed(() => {
  return [...categoryStats.value].sort((a, b) => b.developmentPercentage - a.developmentPercentage)
})

// Compter les catégories actives (avec au moins un widget développé)
const activeCategoriesCount = computed(() => {
  return categoryStats.value.filter(cat => cat.fullyDeveloped > 0).length
})

// Calculer la couverture moyenne
const averageCoverage = computed(() => {
  if (categoryStats.value.length === 0) return 0
  const totalPercentage = categoryStats.value.reduce((sum, cat) => sum + cat.developmentPercentage, 0)
  return Math.round(totalPercentage / categoryStats.value.length)
})

// Statistiques totales
const totalStats = computed(() => {
  return categoryStats.value.reduce((total, category) => ({
    fullyDeveloped: total.fullyDeveloped + category.fullyDeveloped,
    partiallyDeveloped: total.partiallyDeveloped + category.partiallyDeveloped,
    notDeveloped: total.notDeveloped + category.notDeveloped,
    databaseOnly: total.databaseOnly + category.databaseOnly
  }), {
    fullyDeveloped: 0,
    partiallyDeveloped: 0,
    notDeveloped: 0,
    databaseOnly: 0
  })
})

// Méthodes
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

const getProgressColor = (percentage) => {
  if (percentage >= 80) return 'bg-green-500'
  if (percentage >= 60) return 'bg-yellow-500'
  if (percentage >= 40) return 'bg-orange-500'
  return 'bg-red-500'
}
</script>