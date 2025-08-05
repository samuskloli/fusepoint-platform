<template>
  <div class="bg-white rounded-lg shadow mb-6">
    <div class="p-6">
      <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
        <!-- Barre de recherche -->
        <div class="flex-1 max-w-lg">
          <div class="relative">
            <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <MagnifyingGlassIcon class="h-5 w-5 text-gray-400" />
            </div>
            <input
              :value="search"
              @input="$emit('update:search', $event.target.value)"
              type="text"
              class="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              :placeholder="messages.searchPlaceholder"
            />
          </div>
        </div>
        
        <!-- Boutons de filtre -->
        <div class="flex items-center space-x-3">
          <button
            @click="$emit('update:showFilters', !showFilters)"
            class="inline-flex items-center px-3 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            <FunnelIcon class="-ml-1 mr-2 h-4 w-4" />
            {{ messages.filtersButton }}
          </button>
        </div>
      </div>
      
      <!-- Filtres étendus -->
      <div v-if="showFilters" class="mt-4 pt-4 border-t border-gray-200">
        <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">
              {{ messages.statusLabel }}
            </label>
            <select
              :value="filters.status"
              @change="updateFilter('status', $event.target.value)"
              class="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            >
              <option value="">{{ messages.statusAll }}</option>
              <option value="active">{{ messages.statusActive }}</option>
              <option value="inactive">{{ messages.statusInactive }}</option>
            </select>
          </div>
          
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">
              {{ messages.periodLabel }}
            </label>
            <select
              :value="filters.dateRange"
              @change="updateFilter('dateRange', $event.target.value)"
              class="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            >
              <option value="">{{ messages.periodAll }}</option>
              <option value="today">{{ messages.periodToday }}</option>
              <option value="week">{{ messages.periodWeek }}</option>
              <option value="month">{{ messages.periodMonth }}</option>
            </select>
          </div>
          
          <div class="flex items-end">
            <button
              @click="$emit('reset')"
              class="w-full px-3 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              {{ messages.resetButton }}
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { MagnifyingGlassIcon, FunnelIcon } from '@heroicons/vue/24/outline'

export default {
  name: 'SearchAndFilters',
  components: {
    MagnifyingGlassIcon,
    FunnelIcon
  },
  props: {
    search: {
      type: String,
      default: ''
    },
    filters: {
      type: Object,
      default: () => ({})
    },
    showFilters: {
      type: Boolean,
      default: false
    },
    messages: {
      type: Object,
      required: true
    }
  },
  emits: ['update:search', 'update:filters', 'update:showFilters', 'reset'],
  methods: {
    updateFilter(key, value) {
      const newFilters = { ...this.filters }
      newFilters[key] = value
      this.$emit('update:filters', newFilters)
    }
  }
}
</script>