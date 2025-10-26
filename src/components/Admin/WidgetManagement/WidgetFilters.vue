<template>
  <div class="bg-white shadow rounded-lg p-6">
    <div class="flex items-center justify-between mb-4">
      <h3 class="text-lg font-medium text-gray-900">Filtres</h3>
      <button
        @click="resetFilters"
        class="text-sm text-primary-600 hover:text-primary-800"
      >
        Réinitialiser
      </button>
    </div>

    <div class="space-y-4">
      <!-- Recherche par nom -->
      <div>
        <label for="search" class="block text-sm font-medium text-gray-700 mb-1">
          Rechercher par nom
        </label>
        <div class="relative">
          <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <i class="fas fa-search text-gray-400"></i>
          </div>
          <input
            id="search"
            v-model="localFilters.search"
            type="text"
            placeholder="Nom du widget..."
            class="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-primary-500 focus:border-primary-500"
          />
        </div>
      </div>

      <!-- Filtre par statut -->
      <div>
        <label class="block text-sm font-medium text-gray-700 mb-2">
          Statut de développement
        </label>
        <div class="space-y-2">
          <label v-for="status in statusOptions" :key="status.value" class="flex items-center">
            <input
              v-model="localFilters.status"
              :value="status.value"
              type="checkbox"
              class="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
            />
            <span class="ml-2 text-sm text-gray-700">{{ status.label }}</span>
            <span v-if="status.count !== undefined" class="ml-auto text-xs text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full">
              {{ status.count }}
            </span>
          </label>
        </div>
      </div>

      <!-- Filtre par catégorie -->
      <div>
        <label class="block text-sm font-medium text-gray-700 mb-2">
          Catégorie
        </label>
        <div class="space-y-2 max-h-40 overflow-y-auto">
          <label v-for="category in categoryOptions" :key="category.value" class="flex items-center">
            <input
              v-model="localFilters.category"
              :value="category.value"
              type="checkbox"
              class="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
            />
            <span class="ml-2 text-sm text-gray-700">{{ category.label }}</span>
            <span v-if="category.count !== undefined" class="ml-auto text-xs text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full">
              {{ category.count }}
            </span>
          </label>
        </div>
      </div>

      <!-- Filtre par présence en base de données -->
      <div>
        <label class="block text-sm font-medium text-gray-700 mb-2">
          Base de données
        </label>
        <div class="space-y-2">
          <label class="flex items-center">
            <input
              v-model="localFilters.inDatabase"
              value="true"
              type="radio"
              name="database"
              class="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300"
            />
            <span class="ml-2 text-sm text-gray-700">En base de données</span>
          </label>
          <label class="flex items-center">
            <input
              v-model="localFilters.inDatabase"
              value="false"
              type="radio"
              name="database"
              class="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300"
            />
            <span class="ml-2 text-sm text-gray-700">Pas en base de données</span>
          </label>
          <label class="flex items-center">
            <input
              v-model="localFilters.inDatabase"
              value=""
              type="radio"
              name="database"
              class="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300"
            />
            <span class="ml-2 text-sm text-gray-700">Tous</span>
          </label>
        </div>
      </div>

      <!-- Filtre par manifeste -->
      <div>
        <label class="block text-sm font-medium text-gray-700 mb-2">
          Manifeste
        </label>
        <div class="space-y-2">
          <label class="flex items-center">
            <input
              v-model="localFilters.hasManifest"
              value="true"
              type="radio"
              name="manifest"
              class="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300"
            />
            <span class="ml-2 text-sm text-gray-700">Avec manifeste</span>
          </label>
          <label class="flex items-center">
            <input
              v-model="localFilters.hasManifest"
              value="false"
              type="radio"
              name="manifest"
              class="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300"
            />
            <span class="ml-2 text-sm text-gray-700">Sans manifeste</span>
          </label>
          <label class="flex items-center">
            <input
              v-model="localFilters.hasManifest"
              value=""
              type="radio"
              name="manifest"
              class="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300"
            />
            <span class="ml-2 text-sm text-gray-700">Tous</span>
          </label>
        </div>
      </div>

      <!-- Filtre par score -->
      <div>
        <label class="block text-sm font-medium text-gray-700 mb-2">
          Score de développement
        </label>
        <div class="space-y-2">
          <div class="flex items-center space-x-2">
            <input
              v-model.number="localFilters.minScore"
              type="range"
              min="0"
              max="100"
              step="10"
              class="flex-1"
            />
            <span class="text-sm text-gray-600 w-12">{{ localFilters.minScore }}%</span>
          </div>
          <div class="text-xs text-gray-500">
            Afficher les widgets avec un score ≥ {{ localFilters.minScore }}%
          </div>
        </div>
      </div>

      <!-- Technologies -->
      <div>
        <label class="block text-sm font-medium text-gray-700 mb-2">
          Technologies
        </label>
        <div class="space-y-2">
          <label class="flex items-center">
            <input
              v-model="localFilters.technologies"
              value="vue3"
              type="checkbox"
              class="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
            />
            <span class="ml-2 text-sm text-gray-700">Vue 3</span>
          </label>
          <label class="flex items-center">
            <input
              v-model="localFilters.technologies"
              value="typescript"
              type="checkbox"
              class="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
            />
            <span class="ml-2 text-sm text-gray-700">TypeScript</span>
          </label>
          <label class="flex items-center">
            <input
              v-model="localFilters.technologies"
              value="composition"
              type="checkbox"
              class="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
            />
            <span class="ml-2 text-sm text-gray-700">Composition API</span>
          </label>
        </div>
      </div>
    </div>

    <!-- Résumé des filtres actifs -->
    <div v-if="hasActiveFilters" class="mt-6 pt-4 border-t border-gray-200">
      <div class="flex items-center justify-between">
        <span class="text-sm text-gray-600">{{ activeFiltersCount }} filtre(s) actif(s)</span>
        <button
          @click="resetFilters"
          class="text-xs text-red-600 hover:text-red-800"
        >
          Tout effacer
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'

const props = defineProps({
  filters: {
    type: Object,
    default: () => ({})
  },
  widgets: {
    type: Array,
    default: () => []
  }
})

const emit = defineEmits(['update:filters'])

// État local des filtres
const localFilters = ref({
  search: '',
  status: [],
  category: [],
  inDatabase: '',
  hasManifest: '',
  minScore: 0,
  technologies: [],
  ...props.filters
})

// Options de statut
const statusOptions = computed(() => {
  const statusCounts = {}
  props.widgets.forEach(widget => {
    const status = widget.analysis?.status || 'unknown'
    statusCounts[status] = (statusCounts[status] || 0) + 1
  })

  return [
    { value: 'fully_developed', label: 'Entièrement développé', count: statusCounts.fully_developed || 0 },
    { value: 'partially_developed', label: 'Partiellement développé', count: statusCounts.partially_developed || 0 },
    { value: 'not_developed', label: 'Non développé', count: statusCounts.not_developed || 0 },
    { value: 'in_database_only', label: 'Base de données uniquement', count: statusCounts.in_database_only || 0 },
    { value: 'needs_update', label: 'Mise à jour requise', count: statusCounts.needs_update || 0 }
  ]
})

// Options de catégorie
const categoryOptions = computed(() => {
  const categoryCounts = {}
  props.widgets.forEach(widget => {
    const category = widget.category || 'other'
    categoryCounts[category] = (categoryCounts[category] || 0) + 1
  })

  const categories = [
    { value: 'analytics', label: 'Analytique' },
    { value: 'project-management', label: 'Gestion de projet' },
    { value: 'team-management', label: 'Gestion d\'équipe' },
    { value: 'communication', label: 'Communication' },
    { value: 'development', label: 'Développement' },
    { value: 'productivity', label: 'Productivité' },
    { value: 'file-management', label: 'Gestion de fichiers' },
    { value: 'time-management', label: 'Gestion du temps' },
    { value: 'finance', label: 'Finance' },
    { value: 'integrations', label: 'Intégrations' },
    { value: 'system', label: 'Système' },
    { value: 'security', label: 'Sécurité' },
    { value: 'other', label: 'Autre' }
  ]

  return categories
    .filter(cat => categoryCounts[cat.value] > 0)
    .map(cat => ({
      ...cat,
      count: categoryCounts[cat.value]
    }))
})

// Vérifier si des filtres sont actifs
const hasActiveFilters = computed(() => {
  return localFilters.value.search ||
         localFilters.value.status.length > 0 ||
         localFilters.value.category.length > 0 ||
         localFilters.value.inDatabase ||
         localFilters.value.hasManifest ||
         localFilters.value.minScore > 0 ||
         localFilters.value.technologies.length > 0
})

// Compter les filtres actifs
const activeFiltersCount = computed(() => {
  let count = 0
  if (localFilters.value.search) count++
  if (localFilters.value.status.length > 0) count++
  if (localFilters.value.category.length > 0) count++
  if (localFilters.value.inDatabase) count++
  if (localFilters.value.hasManifest) count++
  if (localFilters.value.minScore > 0) count++
  if (localFilters.value.technologies.length > 0) count++
  return count
})

// Réinitialiser les filtres
const resetFilters = () => {
  localFilters.value = {
    search: '',
    status: [],
    category: [],
    inDatabase: '',
    hasManifest: '',
    minScore: 0,
    technologies: []
  }
}

// Watcher pour émettre les changements
watch(localFilters, (newFilters) => {
  emit('update:filters', { ...newFilters })
}, { deep: true })

// Watcher pour synchroniser avec les props
watch(() => props.filters, (newFilters) => {
  localFilters.value = { ...localFilters.value, ...newFilters }
}, { deep: true })
</script>