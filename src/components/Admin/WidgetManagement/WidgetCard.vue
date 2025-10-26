<template>
  <div class="bg-white border border-gray-200 rounded-lg shadow-sm hover:shadow-md transition-shadow duration-200">
    <!-- En-tête de la carte -->
    <div class="p-4 border-b border-gray-100">
      <div class="flex items-center justify-between">
        <div class="flex items-center space-x-3">
          <div class="flex-shrink-0">
            <div class="h-10 w-10 rounded-lg bg-primary-100 flex items-center justify-center">
              <i :class="getCategoryIcon(widget.category)" class="text-primary-600"></i>
            </div>
          </div>
          <div class="flex-1 min-w-0">
            <h4 class="text-sm font-medium text-gray-900 truncate">{{ widget.name }}</h4>
            <p class="text-xs text-gray-500">{{ getCategoryLabel(widget.category) }}</p>
          </div>
        </div>
        <div class="flex items-center space-x-1">
          <button
            @click="$emit('view-details', widget)"
            class="p-1 text-gray-400 hover:text-gray-600 rounded"
            title="Voir les détails"
          >
            <i class="fas fa-eye text-xs"></i>
          </button>
          <div class="relative">
            <button
              @click="showActions = !showActions"
              class="p-1 text-gray-400 hover:text-gray-600 rounded"
            >
              <i class="fas fa-ellipsis-v text-xs"></i>
            </button>
            <!-- Menu d'actions -->
            <div
              v-if="showActions"
              v-click-outside="() => showActions = false"
              class="absolute right-0 top-6 w-48 bg-white rounded-md shadow-lg border border-gray-200 z-10"
            >
              <div class="py-1">
                <button
                  v-if="!widget.inDatabase && widget.status === 'missing_in_database'"
                  @click="handleAddToDb"
                  class="w-full text-left px-4 py-2 text-sm text-green-700 hover:bg-green-50 flex items-center"
                >
                  <i class="fas fa-plus mr-2"></i>
                  Ajouter à la base
                </button>
                <button
                  v-if="widget.inDatabase"
                  @click="handleToggleStatus"
                  class="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 flex items-center"
                >
                  <i :class="widget.is_enabled ? 'fas fa-pause' : 'fas fa-play'" class="mr-2"></i>
                  {{ widget.is_enabled ? 'Désactiver' : 'Activer' }}
                </button>
                <button
                  v-if="widget.inDatabase"
                  @click="handleDelete"
                  class="w-full text-left px-4 py-2 text-sm text-red-700 hover:bg-red-50 flex items-center"
                >
                  <i class="fas fa-trash mr-2"></i>
                  Supprimer
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Corps de la carte -->
    <div class="p-4">
      <!-- Statut -->
      <div class="mb-3">
        <StatusBadge :status="widget.status" />
      </div>

      <!-- Statut de développement -->
      <div class="mb-3">
        <div class="flex items-center justify-between text-sm mb-1">
          <span class="text-gray-600">Statut</span>
          <span class="font-medium text-blue-600">Développé</span>
        </div>
        <div class="w-full bg-gray-200 rounded-full h-2">
          <div 
            class="h-2 rounded-full transition-all duration-300 bg-blue-500"
            style="width: 100%"
          ></div>
        </div>
      </div>

      <!-- Indicateurs -->
      <div class="grid grid-cols-2 gap-2 mb-3">
        <div class="flex items-center text-xs">
          <div class="flex items-center">
            <div :class="widget.inDatabase ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'" 
                 class="w-2 h-2 rounded-full mr-2"></div>
            <span class="text-gray-600">Base de données</span>
          </div>
        </div>
        <div class="flex items-center text-xs">
          <div class="flex items-center">
            <div :class="widget.hasManifest ? 'bg-green-100 text-green-600' : 'bg-yellow-100 text-yellow-600'" 
                 class="w-2 h-2 rounded-full mr-2"></div>
            <span class="text-gray-600">Manifeste</span>
          </div>
        </div>
      </div>

      <!-- Description -->
      <div v-if="widget.description" class="text-xs text-gray-500 line-clamp-2">
        {{ widget.description }}
      </div>
      <div v-else class="text-xs text-gray-400 italic">
        Aucune description disponible
      </div>
    </div>

    <!-- Pied de carte -->
    <div class="px-4 py-3 bg-gray-50 border-t border-gray-100">
      <div class="flex items-center justify-between">
        <!-- Informations techniques -->
        <div class="flex items-center space-x-2 text-xs text-gray-500">
          <span class="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800">
            Vue 3
          </span>
          <span v-if="widget.category" class="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800">
            {{ widget.category }}
          </span>
        </div>

        <!-- Actions rapides -->
        <div class="flex items-center space-x-1">
          <button
            v-if="!widget.inDatabase && widget.status === 'missing_in_database'"
            @click="handleAddToDb"
            class="text-green-600 hover:text-green-800 p-1 rounded"
            title="Ajouter à la base de données"
          >
            <i class="fas fa-plus text-xs"></i>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useTranslation } from '@/composables/useTranslation'
import StatusBadge from './StatusBadge.vue'

const props = defineProps({
  widget: {
    type: Object,
    required: true
  }
})

const emit = defineEmits(['add-to-db', 'update', 'delete', 'view-details'])

const { t } = useTranslation()

// État local
const showActions = ref(false)

// Méthodes
const handleAddToDb = () => {
  showActions.value = false
  emit('add-to-db', props.widget)
}

const handleToggleStatus = () => {
  showActions.value = false
  emit('update', { is_enabled: !props.widget.is_enabled })
}

const handleDelete = () => {
  showActions.value = false
  if (confirm(t('common.confirmations.deleteWidget', { widgetName: props.widget.name }))) {
    emit('delete')
  }
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



// Directive pour fermer le menu au clic extérieur
const vClickOutside = {
  beforeMount(el, binding) {
    el.clickOutsideEvent = function(event) {
      if (!(el === event.target || el.contains(event.target))) {
        binding.value()
      }
    }
    document.addEventListener('click', el.clickOutsideEvent)
  },
  unmounted(el) {
    document.removeEventListener('click', el.clickOutsideEvent)
  }
}
</script>

<style scoped>
.line-clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
</style>