<template>
  <div class="space-y-6">
    <!-- En-tête -->
    <div class="bg-white shadow rounded-lg p-6">
      <div class="flex items-center justify-between">
        <div>
          <h3 class="text-lg font-medium text-gray-900">Widgets Développés Manquants en Base</h3>
          <p class="mt-1 text-sm text-gray-600">
            Ces widgets sont développés mais ne sont pas référencés dans la base de données
          </p>
        </div>
        <div class="flex items-center space-x-3">
          <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-orange-100 text-orange-800">
            {{ widgets.length }} widgets manquants
          </span>
          <button
            v-if="widgets.length > 0"
            @click="addAllToDatabase"
            :disabled="loading"
            class="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50"
          >
            <i class="fas fa-plus mr-2"></i>
            Ajouter tous
          </button>
        </div>
      </div>
    </div>

    <!-- Liste des widgets manquants -->
    <div v-if="widgets.length > 0" class="bg-white shadow rounded-lg overflow-hidden">
      <div class="px-6 py-4 border-b border-gray-200">
        <h4 class="text-sm font-medium text-gray-900">Widgets à ajouter</h4>
      </div>
      <ul class="divide-y divide-gray-200">
        <li v-for="widget in widgets" :key="widget.name" class="px-6 py-4 hover:bg-gray-50">
          <div class="flex items-center justify-between">
            <div class="flex items-center space-x-4">
              <div class="flex-shrink-0">
                <div class="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                  <i class="fas fa-puzzle-piece text-green-600"></i>
                </div>
              </div>
              <div class="flex-1 min-w-0">
                <div class="flex items-center space-x-2">
                  <p class="text-sm font-medium text-gray-900 truncate">
                    {{ widget.name }}
                  </p>
                  <span class="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800">
                    Développé
                  </span>
                </div>
                <div class="mt-1 flex items-center space-x-4 text-sm text-gray-500">
                  <span>
                    <i class="fas fa-tag mr-1"></i>
                    {{ getCategoryLabel(widget.category) }}
                  </span>
                  <span>
                    <i class="fas fa-check-circle mr-1 text-green-500"></i>
                    Développé
                  </span>
                  <span v-if="widget.analysis.hasTypeScript">
                    <i class="fab fa-js-square mr-1 text-blue-500"></i>
                    TypeScript
                  </span>
                  <span v-if="widget.analysis.hasCompositionAPI">
                    <i class="fas fa-layer-group mr-1 text-purple-500"></i>
                    Composition API
                  </span>
                </div>
                <p v-if="widget.analysis.description" class="mt-1 text-sm text-gray-600">
                  {{ widget.analysis.description }}
                </p>
              </div>
            </div>
            <div class="flex items-center space-x-2">
              <button
                @click="$emit('add-to-db', widget)"
                :disabled="loading"
                class="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50"
              >
                <i class="fas fa-plus mr-1"></i>
                Ajouter
              </button>
              <button
                @click="showDetails(widget)"
                class="inline-flex items-center px-3 py-1.5 border border-gray-300 text-xs font-medium rounded text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
              >
                <i class="fas fa-info-circle mr-1"></i>
                Détails
              </button>
            </div>
          </div>
        </li>
      </ul>
    </div>

    <!-- État vide -->
    <div v-else class="bg-white shadow rounded-lg p-12 text-center">
      <div class="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
        <i class="fas fa-check text-green-600 text-2xl"></i>
      </div>
      <h3 class="text-lg font-medium text-gray-900 mb-2">Tous les widgets sont en base</h3>
      <p class="text-gray-600">
        Tous les widgets développés sont correctement référencés dans la base de données.
      </p>
    </div>

    <!-- Recommandations -->
    <div v-if="widgets.length > 0" class="bg-blue-50 border border-blue-200 rounded-lg p-4">
      <div class="flex">
        <div class="flex-shrink-0">
          <i class="fas fa-lightbulb text-blue-400"></i>
        </div>
        <div class="ml-3">
          <h3 class="text-sm font-medium text-blue-800">Recommandations</h3>
          <div class="mt-2 text-sm text-blue-700">
            <ul class="list-disc list-inside space-y-1">
              <li>Ajoutez ces widgets à la base de données pour les rendre disponibles aux utilisateurs</li>
              <li>Vérifiez que chaque widget a une description appropriée</li>
              <li>Assurez-vous que les catégories sont correctement définies</li>
              <li v-if="hasWidgetsWithoutManifest">Créez les manifestes manquants pour une meilleure documentation</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useTranslation } from '@/composables/useTranslation'

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

const emit = defineEmits(['add-to-db'])

const { t } = useTranslation()

// Computed
const hasWidgetsWithoutManifest = computed(() => {
  return props.widgets.some(widget => !widget.hasManifest)
})

// Méthodes
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

const addAllToDatabase = () => {
  if (confirm(t('common.confirmations.addWidgetsToDatabase', { count: props.widgets.length }))) {
    props.widgets.forEach(widget => {
      emit('add-to-db', widget)
    })
  }
}

const showDetails = (widget) => {
  // Cette fonctionnalité pourrait ouvrir une modale avec plus de détails
  console.log('Détails du widget:', widget)
}
</script>