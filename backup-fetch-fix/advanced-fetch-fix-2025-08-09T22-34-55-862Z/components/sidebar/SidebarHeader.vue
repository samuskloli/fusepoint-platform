<template>
  <div class="flex items-center justify-between p-4 border-b border-gray-700">
    <!-- Logo et titre -->
    <div class="flex items-center space-x-3" v-if="!isCollapsed">
      <div class="flex-shrink-0">
        <svg class="h-8 w-8 text-primary-500" fill="currentColor" viewBox="0 0 20 20">
          <path fill-rule="evenodd" d="M3 3a1 1 0 000 2v8a2 2 0 002 2h2.586l-1.293 1.293a1 1 0 101.414 1.414L10 15.414l2.293 2.293a1 1 0 001.414-1.414L12.414 15H15a2 2 0 002-2V5a1 1 0 100-2H3zm11.707 4.707a1 1 0 00-1.414-1.414L10 9.586 8.707 8.293a1 1 0 00-1.414 0l-2 2a1 1 0 101.414 1.414L8 10.414l1.293 1.293a1 1 0 001.414 0l4-4z" clip-rule="evenodd" />
        </svg>
      </div>
      <div>
        <h1 class="text-lg font-semibold text-white">Fusepoint</h1>
        <p class="text-xs text-gray-400">Marketing Platform</p>
      </div>
    </div>

    <!-- Logo réduit -->
    <div class="flex justify-center w-full" v-else>
      <svg class="h-8 w-8 text-primary-500" fill="currentColor" viewBox="0 0 20 20">
        <path fill-rule="evenodd" d="M3 3a1 1 0 000 2v8a2 2 0 002 2h2.586l-1.293 1.293a1 1 0 101.414 1.414L10 15.414l2.293 2.293a1 1 0 001.414-1.414L12.414 15H15a2 2 0 002-2V5a1 1 0 100-2H3zm11.707 4.707a1 1 0 00-1.414-1.414L10 9.586 8.707 8.293a1 1 0 00-1.414 0l-2 2a1 1 0 101.414 1.414L8 10.414l1.293 1.293a1 1 0 001.414 0l4-4z" clip-rule="evenodd" />
      </svg>
    </div>

    <!-- Boutons de contrôle -->
    <div class="flex items-center space-x-2">
      <!-- Bouton de réduction/extension -->
      <button
        @click="$emit('toggle-collapse')"
        class="p-2 text-gray-400 hover:text-white hover:bg-gray-700 rounded-lg transition-base"
        :title="isCollapsed ? 'Étendre la barre latérale' : 'Réduire la barre latérale'"
      >
        <svg class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path v-if="!isCollapsed" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 19l-7-7 7-7m8 14l-7-7 7-7" />
          <path v-else stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 5l7 7-7 7M5 5l7 7-7 7" />
        </svg>
      </button>

      <!-- Bouton de fermeture mobile -->
      <button
        @click="$emit('close-sidebar')"
        class="md:hidden p-2 text-gray-400 hover:text-white hover:bg-gray-700 rounded-lg transition-base"
        title="Fermer la barre latérale"
      >
        <svg class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
    </div>
  </div>
</template>

<script>
export default {
  name: 'SidebarHeader',
  props: {
    isCollapsed: {
      type: Boolean,
      default: false
    }
  },
  emits: ['close-sidebar', 'toggle-collapse']
}
</script>

<style scoped>
/* Utilise les classes centralisées */
</style>