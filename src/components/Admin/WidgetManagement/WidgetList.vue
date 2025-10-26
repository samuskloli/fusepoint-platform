<template>
  <div class="bg-white shadow rounded-lg overflow-hidden">
    <!-- En-tête de la liste -->
    <div class="px-6 py-4 border-b border-gray-200">
      <div class="flex items-center justify-between">
        <h3 class="text-lg font-medium text-gray-900">
          Liste des widgets ({{ widgets.length }})
        </h3>
        <div class="flex items-center space-x-2">
          <button
            @click="viewMode = 'grid'"
            :class="[
              viewMode === 'grid' ? 'bg-primary-100 text-primary-700' : 'text-gray-500 hover:text-gray-700',
              'p-2 rounded-md'
            ]"
          >
            <i class="fas fa-th-large"></i>
          </button>
          <button
            @click="viewMode = 'list'"
            :class="[
              viewMode === 'list' ? 'bg-primary-100 text-primary-700' : 'text-gray-500 hover:text-gray-700',
              'p-2 rounded-md'
            ]"
          >
            <i class="fas fa-list"></i>
          </button>
        </div>
      </div>
    </div>

    <!-- Loading state -->
    <div v-if="loading" class="p-8 text-center">
      <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto mb-4"></div>
      <p class="text-gray-500">Chargement des widgets...</p>
    </div>

    <!-- Empty state -->
    <div v-else-if="widgets.length === 0" class="p-8 text-center">
      <i class="fas fa-puzzle-piece text-gray-300 text-4xl mb-4"></i>
      <p class="text-gray-500">Aucun widget trouvé</p>
    </div>

    <!-- Vue grille -->
    <div v-else-if="viewMode === 'grid'" class="p-6">
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <WidgetCard
          v-for="widget in widgets"
          :key="widget.name"
          :widget="widget"
          @add-to-db="$emit('add-to-db', widget)"
          @update="$emit('update-widget', widget.id, $event)"
          @delete="$emit('delete-widget', widget.id)"
          @view-details="showWidgetDetails(widget)"
        />
      </div>
    </div>

    <!-- Vue liste -->
    <div v-else class="overflow-x-auto">
      <table class="min-w-full divide-y divide-gray-200">
        <thead class="bg-gray-50">
          <tr>
            <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Widget
            </th>
            <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Statut
            </th>
            <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Score
            </th>
            <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Base de données
            </th>
            <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Manifeste
            </th>
            <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Actions
            </th>
          </tr>
        </thead>
        <tbody class="bg-white divide-y divide-gray-200">
          <tr v-for="widget in widgets" :key="widget.name" class="hover:bg-gray-50">
            <td class="px-6 py-4 whitespace-nowrap">
              <div class="flex items-center">
                <div class="flex-shrink-0 h-10 w-10">
                  <div class="h-10 w-10 rounded-lg bg-primary-100 flex items-center justify-center">
                    <i :class="getCategoryIcon(widget.category)" class="text-primary-600"></i>
                  </div>
                </div>
                <div class="ml-4">
                  <div class="text-sm font-medium text-gray-900">{{ widget.name }}</div>
                  <div class="text-sm text-gray-500">{{ getCategoryLabel(widget.category) }}</div>
                </div>
              </div>
            </td>
            <td class="px-6 py-4 whitespace-nowrap">
              <StatusBadge :status="widget.status" />
            </td>
            <td class="px-6 py-4 whitespace-nowrap">
              <div class="flex items-center">
                <div class="flex-1 bg-gray-200 rounded-full h-2 mr-2">
                  <div 
                    class="h-2 rounded-full transition-all duration-300 bg-blue-500"
                    style="width: 100%"
                  ></div>
                </div>
                <span class="text-sm font-medium text-gray-900">Développé</span>
              </div>
            </td>
            <td class="px-6 py-4 whitespace-nowrap">
              <span v-if="widget.inDatabase" class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                <i class="fas fa-check mr-1"></i>
                En base
              </span>
              <span v-else class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                <i class="fas fa-times mr-1"></i>
                Manquant
              </span>
            </td>
            <td class="px-6 py-4 whitespace-nowrap">
              <span v-if="widget.hasManifest" class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                <i class="fas fa-file-alt mr-1"></i>
                Présent
              </span>
              <span v-else class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                <i class="fas fa-exclamation-triangle mr-1"></i>
                Manquant
              </span>
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
              <div class="flex items-center space-x-2">
                <button
                  @click="showWidgetDetails(widget)"
                  class="text-primary-600 hover:text-primary-900"
                  title="Voir les détails"
                >
                  <i class="fas fa-eye"></i>
                </button>
                <button
                  v-if="!widget.inDatabase && widget.status === 'missing_in_database'"
                  @click="$emit('add-to-db', widget)"
                  class="text-green-600 hover:text-green-900"
                  title="Ajouter à la base de données"
                >
                  <i class="fas fa-plus"></i>
                </button>
                <button
                  v-if="widget.inDatabase"
                  @click="$emit('update-widget', widget.id, { is_enabled: !widget.is_enabled })"
                  :class="widget.is_enabled ? 'text-yellow-600 hover:text-yellow-900' : 'text-green-600 hover:text-green-900'"
                  :title="widget.is_enabled ? 'Désactiver' : 'Activer'"
                >
                  <i :class="widget.is_enabled ? 'fas fa-pause' : 'fas fa-play'"></i>
                </button>
                <button
                  v-if="widget.inDatabase"
                  @click="$emit('delete-widget', widget.id)"
                  class="text-red-600 hover:text-red-900"
                  title="Supprimer"
                >
                  <i class="fas fa-trash"></i>
                </button>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Modal de détails -->
    <WidgetDetailsModal
      v-if="selectedWidget"
      :widget="selectedWidget"
      @close="selectedWidget = null"
    />
  </div>
</template>

<script setup>
import { ref } from 'vue'
import WidgetCard from './WidgetCard.vue'
import StatusBadge from './StatusBadge.vue'
import WidgetDetailsModal from './WidgetDetailsModal.vue'

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

const emit = defineEmits(['refresh', 'add-to-db', 'update-widget', 'delete-widget'])

// État local
const viewMode = ref('grid')
const selectedWidget = ref(null)

// Méthodes
const showWidgetDetails = (widget) => {
  selectedWidget.value = widget
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


</script>