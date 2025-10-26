<template>
  <div class="fixed inset-0 z-50 overflow-y-auto" aria-labelledby="modal-title" role="dialog" aria-modal="true">
    <div class="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
      <!-- Overlay -->
      <div class="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" @click="$emit('close')"></div>

      <!-- Modal -->
      <div class="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-4xl sm:w-full">
        <!-- En-tête -->
        <div class="bg-white px-6 py-4 border-b border-gray-200">
          <div class="flex items-center justify-between">
            <div class="flex items-center space-x-3">
              <div class="flex-shrink-0">
                <div class="h-12 w-12 rounded-lg bg-primary-100 flex items-center justify-center">
                  <i :class="getCategoryIcon(widget.category)" class="text-primary-600 text-lg"></i>
                </div>
              </div>
              <div>
                <h3 class="text-lg font-medium text-gray-900" id="modal-title">
                  {{ widget.name }}
                </h3>
                <p class="text-sm text-gray-500">{{ getCategoryLabel(widget.category) }}</p>
              </div>
            </div>
            <button
              @click="$emit('close')"
              class="bg-white rounded-md text-gray-400 hover:text-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
            >
              <span class="sr-only">Fermer</span>
              <i class="fas fa-times text-xl"></i>
            </button>
          </div>
        </div>

        <!-- Corps -->
        <div class="bg-white px-6 py-4 max-h-96 overflow-y-auto">
          <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <!-- Informations générales -->
            <div>
              <h4 class="text-sm font-medium text-gray-900 mb-3">Informations générales</h4>
              <div class="space-y-3">
                <div>
                  <dt class="text-xs font-medium text-gray-500 uppercase tracking-wider">Statut</dt>
                  <dd class="mt-1">
                    <StatusBadge :status="widget.status" />
                  </dd>
                </div>
                
                <div>
                  <dt class="text-xs font-medium text-gray-500 uppercase tracking-wider">Statut de développement</dt>
                  <dd class="mt-1">
                    <div class="flex items-center">
                      <div class="flex-1 bg-gray-200 rounded-full h-2 mr-3">
                        <div 
                          class="h-2 rounded-full transition-all duration-300 bg-blue-500"
                          style="width: 100%"
                        ></div>
                      </div>
                      <span class="text-sm font-medium text-gray-900">Développé</span>
                    </div>
                  </dd>
                </div>

                <div>
                  <dt class="text-xs font-medium text-gray-500 uppercase tracking-wider">Description</dt>
                  <dd class="mt-1 text-sm text-gray-900">
                    {{ widget.description || 'Aucune description disponible' }}
                  </dd>
                </div>

                <div v-if="widget.path">
                  <dt class="text-xs font-medium text-gray-500 uppercase tracking-wider">Chemin du fichier</dt>
                  <dd class="mt-1 text-sm text-gray-900 font-mono bg-gray-50 p-2 rounded">
                    {{ widget.path }}
                  </dd>
                </div>
              </div>
            </div>

            <!-- État technique -->
            <div>
              <h4 class="text-sm font-medium text-gray-900 mb-3">État technique</h4>
              <div class="space-y-3">
                <div class="grid grid-cols-2 gap-4">
                  <div class="flex items-center">
                    <div :class="widget.inDatabase ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'" 
                         class="w-3 h-3 rounded-full mr-2"></div>
                    <span class="text-sm text-gray-700">Base de données</span>
                  </div>
                  <div class="flex items-center">
                    <div :class="widget.hasManifest ? 'bg-green-100 text-green-600' : 'bg-yellow-100 text-yellow-600'" 
                         class="w-3 h-3 rounded-full mr-2"></div>
                    <span class="text-sm text-gray-700">Manifeste</span>
                  </div>
                </div>

                <!-- Technologies utilisées -->
                <div>
                  <dt class="text-xs font-medium text-gray-500 uppercase tracking-wider mb-2">Technologies</dt>
                  <dd class="flex flex-wrap gap-2">
                    <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                      <i class="fab fa-vuejs mr-1"></i>
                      Vue 3
                    </span>
                    <span v-if="widget.category" class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                      <i class="fas fa-tag mr-1"></i>
                      {{ widget.category }}
                    </span>
                  </dd>
                </div>

                <!-- Statut du widget -->
                <div>
                  <dt class="text-xs font-medium text-gray-500 uppercase tracking-wider mb-2">Statut</dt>
                  <dd class="text-sm text-gray-700">
                    <StatusBadge :status="widget.status" />
                  </dd>
                </div>
              </div>
            </div>
          </div>

          <!-- Informations de base de données -->
          <div v-if="widget.inDatabase" class="mt-6 pt-6 border-t border-gray-200">
            <h4 class="text-sm font-medium text-gray-900 mb-3">Informations de base de données</h4>
            <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <dt class="text-xs font-medium text-gray-500 uppercase tracking-wider">ID</dt>
                <dd class="mt-1 text-sm text-gray-900">{{ widget.id }}</dd>
              </div>
              <div>
                <dt class="text-xs font-medium text-gray-500 uppercase tracking-wider">Activé</dt>
                <dd class="mt-1">
                  <span :class="widget.is_enabled ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'" 
                        class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium">
                    <i :class="widget.is_enabled ? 'fas fa-check' : 'fas fa-times'" class="mr-1"></i>
                    {{ widget.is_enabled ? 'Oui' : 'Non' }}
                  </span>
                </dd>
              </div>
              <div v-if="widget.created_at">
                <dt class="text-xs font-medium text-gray-500 uppercase tracking-wider">Créé le</dt>
                <dd class="mt-1 text-sm text-gray-900">{{ formatDate(widget.created_at) }}</dd>
              </div>
            </div>
          </div>

          <!-- Recommandations -->
          <div v-if="getRecommendations(widget).length > 0" class="mt-6 pt-6 border-t border-gray-200">
            <h4 class="text-sm font-medium text-gray-900 mb-3">Recommandations</h4>
            <div class="space-y-2">
              <div v-for="recommendation in getRecommendations(widget)" :key="recommendation.text" 
                   :class="recommendation.type === 'warning' ? 'bg-yellow-50 border-yellow-200' : 'bg-blue-50 border-blue-200'"
                   class="p-3 rounded-md border">
                <div class="flex">
                  <div class="flex-shrink-0">
                    <i :class="recommendation.type === 'warning' ? 'fas fa-exclamation-triangle text-yellow-400' : 'fas fa-info-circle text-blue-400'"></i>
                  </div>
                  <div class="ml-3">
                    <p :class="recommendation.type === 'warning' ? 'text-yellow-800' : 'text-blue-800'" 
                       class="text-sm">
                      {{ recommendation.text }}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Pied de page -->
        <div class="bg-gray-50 px-6 py-3 flex justify-end space-x-3">
          <button
            @click="$emit('close')"
            type="button"
            class="bg-white py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
          >
            Fermer
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import StatusBadge from './StatusBadge.vue'

const props = defineProps({
  widget: {
    type: Object,
    required: true
  }
})

const emit = defineEmits(['close'])

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



const formatDate = (dateString) => {
  return new Date(dateString).toLocaleDateString('fr-FR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

const getRecommendations = (widget) => {
  const recommendations = []

  if (!widget.inDatabase && widget.status === 'missing_in_database') {
    recommendations.push({
      type: 'info',
      text: 'Ce widget est entièrement développé mais n\'est pas présent en base de données. Vous devriez l\'ajouter.'
    })
  }

  if (!widget.hasManifest && widget.status === 'missing_in_database') {
    recommendations.push({
      type: 'warning',
      text: 'Ce widget n\'a pas de manifeste. Créez un fichier manifest.json pour le décrire.'
    })
  }

  if (widget.status === 'in_development') {
    recommendations.push({
      type: 'warning',
      text: 'Ce widget est en cours de développement. Complétez son développement pour l\'utiliser pleinement.'
    })
  }

  if (widget.inDatabase && widget.status === 'missing_in_code') {
    recommendations.push({
      type: 'warning',
      text: 'Ce widget est en base de données mais n\'est pas développé. Développez-le ou supprimez-le de la base.'
    })
  }

  return recommendations
}
</script>