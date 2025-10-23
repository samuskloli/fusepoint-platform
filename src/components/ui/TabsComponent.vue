<template>
  <div class="tabs-component">
    <!-- Navigation des onglets -->
    <nav class="flex space-x-1 border-b border-gray-200" aria-label="Tabs">
      <button
        v-for="tab in tabs"
        :key="tab.id"
        type="button"
        @click="$emit('tab-change', tab.id)"
        :class="[
          'whitespace-nowrap py-3 px-4 border-b-2 font-medium text-sm transition-colors duration-200',
          activeTab === tab.id
            ? 'border-blue-500 text-blue-600 bg-blue-50'
            : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 hover:bg-gray-50'
        ]"
        :aria-selected="activeTab === tab.id"
        role="tab"
      >
        <i v-if="tab.icon" :class="[tab.icon, 'mr-2']"></i>
        {{ tab.label }}
        <span v-if="tab.badge" class="ml-2 inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
          {{ tab.badge }}
        </span>
      </button>
    </nav>

    <!-- Contenu des onglets -->
    <div class="tab-content mt-6">
      <slot></slot>
    </div>
  </div>
</template>

<script>
export default {
  name: 'TabsComponent',
  props: {
    tabs: {
      type: Array,
      required: true,
      validator: (tabs) => {
        return tabs.every(tab => 
          tab.hasOwnProperty('id') && 
          tab.hasOwnProperty('label')
        )
      }
    },
    activeTab: {
      type: String,
      required: true
    }
  },
  emits: ['tab-change']
}
</script>

<style scoped>
.tabs-component {
  @apply w-full;
}

.tab-content {
  @apply min-h-0;
}

/* Animation pour le changement d'onglet */
.tab-content > * {
  @apply transition-opacity duration-200;
}

/* Focus states pour l'accessibilité */
button:focus {
  @apply outline-none ring-2 ring-blue-500 ring-offset-2;
}

/* Responsive design */
@media (max-width: 640px) {
  nav {
    @apply overflow-x-auto;
  }
  
  button {
    @apply flex-shrink-0;
  }
}
</style>