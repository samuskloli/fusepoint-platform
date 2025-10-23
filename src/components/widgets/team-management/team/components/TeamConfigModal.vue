<template>
  <div v-if="isOpen" class="fixed inset-0 z-50 overflow-y-auto">
    <div class="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
      <!-- Overlay -->
      <div 
        class="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity"
        @click="closeModal"
      ></div>

      <!-- Modal -->
      <div class="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-3xl sm:w-full">
        <!-- En-tête -->
        <div class="bg-white px-6 py-4 border-b border-gray-200">
          <div class="flex items-center justify-between">
            <h3 class="text-lg font-medium text-gray-900">Configuration du widget d'équipe</h3>
            <button
              @click="closeModal"
              class="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        <!-- Formulaire -->
        <form @submit.prevent="submitForm" class="bg-white">
          <div class="px-6 py-4 max-h-96 overflow-y-auto">
            <div class="space-y-6">
              <!-- Vue par défaut -->
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-3">
                  Vue par défaut
                </label>
                <div class="grid grid-cols-3 gap-3">
                  <label
                    v-for="view in viewOptions"
                    :key="view.value"
                    class="relative flex cursor-pointer rounded-lg border p-4 focus:outline-none"
                    :class="config.defaultView === view.value ? 'border-blue-600 ring-2 ring-blue-600' : 'border-gray-300'"
                  >
                    <input
                      v-model="config.defaultView"
                      type="radio"
                      :value="view.value"
                      class="sr-only"
                    />
                    <div class="flex flex-1 flex-col">
                      <div class="flex items-center">
                        <component :is="view.icon" class="w-5 h-5 mr-2 text-gray-600" />
                        <span class="block text-sm font-medium text-gray-900">{{ view.label }}</span>
                      </div>
                      <span class="mt-1 flex items-center text-xs text-gray-500">{{ view.description }}</span>
                    </div>
                  </label>
                </div>
              </div>

              <!-- Affichage -->
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-3">
                  Éléments à afficher
                </label>
                <div class="space-y-3">
                  <div class="flex items-center">
                    <input
                      id="showAvatar"
                      v-model="config.display.showAvatar"
                      type="checkbox"
                      class="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <label for="showAvatar" class="ml-2 block text-sm text-gray-900">
                      Afficher les avatars
                    </label>
                  </div>
                  
                  <div class="flex items-center">
                    <input
                      id="showContact"
                      v-model="config.display.showContact"
                      type="checkbox"
                      class="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <label for="showContact" class="ml-2 block text-sm text-gray-900">
                      Afficher les informations de contact
                    </label>
                  </div>
                  
                  <div class="flex items-center">
                    <input
                      id="showSkills"
                      v-model="config.display.showSkills"
                      type="checkbox"
                      class="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <label for="showSkills" class="ml-2 block text-sm text-gray-900">
                      Afficher les compétences
                    </label>
                  </div>
                  
                  <div class="flex items-center">
                    <input
                      id="showProjects"
                      v-model="config.display.showProjects"
                      type="checkbox"
                      class="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <label for="showProjects" class="ml-2 block text-sm text-gray-900">
                      Afficher les projets
                    </label>
                  </div>
                  
                  <div class="flex items-center">
                    <input
                      id="showPerformance"
                      v-model="config.display.showPerformance"
                      type="checkbox"
                      class="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <label for="showPerformance" class="ml-2 block text-sm text-gray-900">
                      Afficher les évaluations de performance
                    </label>
                  </div>
                  
                  <div class="flex items-center">
                    <input
                      id="showLastActivity"
                      v-model="config.display.showLastActivity"
                      type="checkbox"
                      class="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <label for="showLastActivity" class="ml-2 block text-sm text-gray-900">
                      Afficher la dernière activité
                    </label>
                  </div>
                </div>
              </div>

              <!-- Filtres par défaut -->
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-3">
                  Filtres par défaut
                </label>
                <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label for="defaultDepartments" class="block text-xs text-gray-500 mb-1">
                      Départements
                    </label>
                    <select
                      id="defaultDepartments"
                      v-model="config.filters.defaultDepartments"
                      multiple
                      class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="engineering">Ingénierie</option>
                      <option value="design">Design</option>
                      <option value="marketing">Marketing</option>
                      <option value="sales">Ventes</option>
                      <option value="hr">Ressources Humaines</option>
                      <option value="finance">Finance</option>
                      <option value="operations">Opérations</option>
                    </select>
                  </div>
                  
                  <div>
                    <label for="defaultRoles" class="block text-xs text-gray-500 mb-1">
                      Rôles
                    </label>
                    <select
                      id="defaultRoles"
                      v-model="config.filters.defaultRoles"
                      multiple
                      class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="admin">Administrateur</option>
                      <option value="manager">Manager</option>
                      <option value="developer">Développeur</option>
                      <option value="designer">Designer</option>
                      <option value="analyst">Analyste</option>
                      <option value="intern">Stagiaire</option>
                    </select>
                  </div>
                  
                  <div>
                    <label for="defaultStatuses" class="block text-xs text-gray-500 mb-1">
                      Statuts
                    </label>
                    <select
                      id="defaultStatuses"
                      v-model="config.filters.defaultStatuses"
                      multiple
                      class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="active">Actif</option>
                      <option value="pending">En attente</option>
                      <option value="inactive">Inactif</option>
                    </select>
                  </div>
                </div>
              </div>

              <!-- Pagination -->
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-3">
                  Pagination
                </label>
                <div class="grid grid-cols-2 gap-4">
                  <div>
                    <label for="itemsPerPage" class="block text-xs text-gray-500 mb-1">
                      Éléments par page
                    </label>
                    <select
                      id="itemsPerPage"
                      v-model.number="config.pagination.itemsPerPage"
                      class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option :value="10">10</option>
                      <option :value="20">20</option>
                      <option :value="50">50</option>
                      <option :value="100">100</option>
                    </select>
                  </div>
                  
                  <div class="flex items-end">
                    <div class="flex items-center">
                      <input
                        id="showPagination"
                        v-model="config.pagination.showPagination"
                        type="checkbox"
                        class="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      />
                      <label for="showPagination" class="ml-2 block text-sm text-gray-900">
                        Afficher la pagination
                      </label>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Tri -->
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-3">
                  Tri par défaut
                </label>
                <div class="grid grid-cols-2 gap-4">
                  <div>
                    <label for="defaultSortBy" class="block text-xs text-gray-500 mb-1">
                      Trier par
                    </label>
                    <select
                      id="defaultSortBy"
                      v-model="config.sorting.defaultSortBy"
                      class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="name">Nom</option>
                      <option value="role">Rôle</option>
                      <option value="department">Département</option>
                      <option value="joinDate">Date d'embauche</option>
                      <option value="lastActivity">Dernière activité</option>
                      <option value="status">Statut</option>
                    </select>
                  </div>
                  
                  <div>
                    <label for="defaultSortOrder" class="block text-xs text-gray-500 mb-1">
                      Ordre
                    </label>
                    <select
                      id="defaultSortOrder"
                      v-model="config.sorting.defaultSortOrder"
                      class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="asc">Croissant</option>
                      <option value="desc">Décroissant</option>
                    </select>
                  </div>
                </div>
              </div>

              <!-- Actions -->
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-3">
                  Actions disponibles
                </label>
                <div class="space-y-3">
                  <div class="flex items-center">
                    <input
                      id="allowAdd"
                      v-model="config.actions.allowAdd"
                      type="checkbox"
                      class="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <label for="allowAdd" class="ml-2 block text-sm text-gray-900">
                      Permettre l'ajout de membres
                    </label>
                  </div>
                  
                  <div class="flex items-center">
                    <input
                      id="allowEdit"
                      v-model="config.actions.allowEdit"
                      type="checkbox"
                      class="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <label for="allowEdit" class="ml-2 block text-sm text-gray-900">
                      Permettre la modification de membres
                    </label>
                  </div>
                  
                  <div class="flex items-center">
                    <input
                      id="allowDelete"
                      v-model="config.actions.allowDelete"
                      type="checkbox"
                      class="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <label for="allowDelete" class="ml-2 block text-sm text-gray-900">
                      Permettre la suppression de membres
                    </label>
                  </div>
                  
                  <div class="flex items-center">
                    <input
                      id="allowExport"
                      v-model="config.actions.allowExport"
                      type="checkbox"
                      class="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <label for="allowExport" class="ml-2 block text-sm text-gray-900">
                      Permettre l'export des données
                    </label>
                  </div>
                  
                  <div class="flex items-center">
                    <input
                      id="allowBulkActions"
                      v-model="config.actions.allowBulkActions"
                      type="checkbox"
                      class="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <label for="allowBulkActions" class="ml-2 block text-sm text-gray-900">
                      Permettre les actions en lot
                    </label>
                  </div>
                </div>
              </div>

              <!-- Notifications -->
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-3">
                  Notifications
                </label>
                <div class="space-y-3">
                  <div class="flex items-center">
                    <input
                      id="enableNotifications"
                      v-model="config.notifications.enabled"
                      type="checkbox"
                      class="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <label for="enableNotifications" class="ml-2 block text-sm text-gray-900">
                      Activer les notifications
                    </label>
                  </div>
                  
                  <div v-if="config.notifications.enabled" class="ml-6 space-y-2">
                    <div class="flex items-center">
                      <input
                        id="newMemberNotif"
                        v-model="config.notifications.newMember"
                        type="checkbox"
                        class="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      />
                      <label for="newMemberNotif" class="ml-2 block text-sm text-gray-700">
                        Nouveau membre
                      </label>
                    </div>
                    
                    <div class="flex items-center">
                      <input
                        id="memberUpdateNotif"
                        v-model="config.notifications.memberUpdate"
                        type="checkbox"
                        class="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      />
                      <label for="memberUpdateNotif" class="ml-2 block text-sm text-gray-700">
                        Mise à jour de membre
                      </label>
                    </div>
                    
                    <div class="flex items-center">
                      <input
                        id="statusChangeNotif"
                        v-model="config.notifications.statusChange"
                        type="checkbox"
                        class="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      />
                      <label for="statusChangeNotif" class="ml-2 block text-sm text-gray-700">
                        Changement de statut
                      </label>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Actualisation automatique -->
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-3">
                  Actualisation automatique
                </label>
                <div class="flex items-center space-x-4">
                  <div class="flex items-center">
                    <input
                      id="autoRefresh"
                      v-model="config.autoRefresh.enabled"
                      type="checkbox"
                      class="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <label for="autoRefresh" class="ml-2 block text-sm text-gray-900">
                      Activer l'actualisation automatique
                    </label>
                  </div>
                  
                  <div v-if="config.autoRefresh.enabled">
                    <label for="refreshInterval" class="block text-xs text-gray-500 mb-1">
                      Intervalle (minutes)
                    </label>
                    <select
                      id="refreshInterval"
                      v-model.number="config.autoRefresh.interval"
                      class="px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option :value="1">1 minute</option>
                      <option :value="5">5 minutes</option>
                      <option :value="10">10 minutes</option>
                      <option :value="30">30 minutes</option>
                      <option :value="60">1 heure</option>
                    </select>
                  </div>
                </div>
              </div>

              <!-- Thème -->
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-3">
                  Thème et couleurs
                </label>
                <div class="grid grid-cols-2 gap-4">
                  <div>
                    <label for="theme" class="block text-xs text-gray-500 mb-1">
                      Thème
                    </label>
                    <select
                      id="theme"
                      v-model="config.theme.mode"
                      class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="light">Clair</option>
                      <option value="dark">Sombre</option>
                      <option value="auto">Automatique</option>
                    </select>
                  </div>
                  
                  <div>
                    <label for="primaryColor" class="block text-xs text-gray-500 mb-1">
                      Couleur principale
                    </label>
                    <select
                      id="primaryColor"
                      v-model="config.theme.primaryColor"
                      class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="blue">Bleu</option>
                      <option value="green">Vert</option>
                      <option value="purple">Violet</option>
                      <option value="red">Rouge</option>
                      <option value="yellow">Jaune</option>
                      <option value="indigo">Indigo</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Actions -->
          <div class="bg-gray-50 px-6 py-4 flex justify-between">
            <button
              type="button"
              @click="resetToDefaults"
              class="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Réinitialiser
            </button>
            
            <div class="flex space-x-3">
              <button
                type="button"
                @click="closeModal"
                class="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Annuler
              </button>
              <button
                type="submit"
                :disabled="isLoading"
                class="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <span v-if="isLoading" class="flex items-center">
                  <svg class="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                    <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                    <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Sauvegarde...
                </span>
                <span v-else>Sauvegarder</span>
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, h } from 'vue'
import type { TeamWidgetConfig, TeamView } from '../types'

// Props
interface Props {
  isOpen: boolean
  currentConfig?: TeamWidgetConfig
}

const props = withDefaults(defineProps<Props>(), {
  currentConfig: () => ({
    defaultView: 'grid' as TeamView,
    showStats: true,
    showFilters: true,
    showSearch: true,
    itemsPerPage: 20,
    sortBy: 'name',
    sortOrder: 'asc',
    showDepartments: true,
    showRoles: true,
    showStatus: true,
    showAvatar: true,
    showContactInfo: true,
    showSkills: true,
    showProjects: true,
    showLastActive: true,
    showLocation: true,
    showWorkingHours: false,
    showSocialLinks: false,
    enableExport: true,
    enableBulkActions: true,
    enableOrgChart: true,
    autoRefresh: {
      enabled: false,
      interval: 5
    },
    refreshInterval: 300,
    display: {
      showAvatar: true,
      showContact: true,
      showSkills: true,
      showProjects: true,
      showPerformance: false,
      showLastActivity: true
    },
    filters: {
      departments: [],
      roles: [],
      statuses: ['active']
    },
    pagination: {
      itemsPerPage: 20,
      showPagination: true
    },
    sorting: {
      defaultBy: 'name',
      defaultOrder: 'asc'
    },
    actions: {
      canAdd: true,
      canEdit: true,
      canDelete: false,
      canExport: true,
      canBulkEdit: true
    },
    notifications: {
      enabled: true,
      newMembers: true,
      updates: true,
      statusChanges: true
    },
    theme: {
      primaryColor: '#3B82F6',
      accentColor: '#10B981'
    }
  })
})

// Émissions
const emit = defineEmits<{
  close: []
  save: [config: TeamWidgetConfig]
}>()

// État local
const isLoading = ref(false)

// Configuration
const config = reactive<TeamWidgetConfig>({ ...props.currentConfig })

// Options de vue
const viewOptions = [
  {
    value: 'grid' as TeamView,
    label: 'Grille',
    description: 'Cartes en grille',
    icon: () => h('svg', {
      class: 'w-5 h-5',
      fill: 'none',
      stroke: 'currentColor',
      viewBox: '0 0 24 24'
    }, [
      h('path', {
        'stroke-linecap': 'round',
        'stroke-linejoin': 'round',
        'stroke-width': '2',
        d: 'M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z'
      })
    ])
  },
  {
    value: 'list' as TeamView,
    label: 'Liste',
    description: 'Tableau détaillé',
    icon: () => h('svg', {
      class: 'w-5 h-5',
      fill: 'none',
      stroke: 'currentColor',
      viewBox: '0 0 24 24'
    }, [
      h('path', {
        'stroke-linecap': 'round',
        'stroke-linejoin': 'round',
        'stroke-width': '2',
        d: 'M4 6h16M4 10h16M4 14h16M4 18h16'
      })
    ])
  },
  {
    value: 'org-chart' as TeamView,
    label: 'Organigramme',
    description: 'Structure hiérarchique',
    icon: () => h('svg', {
      class: 'w-5 h-5',
      fill: 'none',
      stroke: 'currentColor',
      viewBox: '0 0 24 24'
    }, [
      h('path', {
        'stroke-linecap': 'round',
        'stroke-linejoin': 'round',
        'stroke-width': '2',
        d: 'M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10'
      })
    ])
  }
]

// Configuration par défaut
const defaultConfig: TeamWidgetConfig = {
  defaultView: 'grid',
  showStats: true,
  showFilters: true,
  showSearch: true,
  itemsPerPage: 20,
  sortBy: 'name',
  sortOrder: 'asc',
  showDepartments: true,
  showRoles: true,
  showStatus: true,
  showAvatar: true,
  showContactInfo: true,
  showSkills: true,
  showProjects: true,
  showLastActive: true,
  showLocation: true,
  showWorkingHours: false,
  showSocialLinks: false,
  enableExport: true,
  enableBulkActions: true,
  enableOrgChart: true,
  autoRefresh: {
    enabled: false,
    interval: 5
  },
  refreshInterval: 300,
  display: {
    showAvatar: true,
    showContact: true,
    showSkills: true,
    showProjects: true,
    showPerformance: false,
    showLastActivity: true
  },
  filters: {
    departments: [],
    roles: [],
    statuses: ['active']
  },
  pagination: {
    itemsPerPage: 20,
    showPagination: true
  },
  sorting: {
    defaultBy: 'name',
    defaultOrder: 'asc'
  },
  actions: {
    canAdd: true,
    canEdit: true,
    canDelete: false,
    canExport: true,
    canBulkEdit: true
  },
  notifications: {
    enabled: true,
    newMembers: true,
    updates: true,
    statusChanges: true
  },
  theme: {
    primaryColor: '#3B82F6',
    accentColor: '#10B981'
  }
}

// Méthodes
const resetToDefaults = () => {
  Object.assign(config, defaultConfig)
}

const closeModal = () => {
  emit('close')
}

const submitForm = async () => {
  isLoading.value = true
  
  try {
    // Simulation d'un appel API
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    emit('save', { ...config })
    closeModal()
  } catch (error) {
    console.error('Erreur lors de la sauvegarde de la configuration:', error)
  } finally {
    isLoading.value = false
  }
}
</script>