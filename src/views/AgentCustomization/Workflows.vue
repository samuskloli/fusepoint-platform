<template>
  <div class="flex h-screen bg-gray-50">
    <!-- Sidebar -->
    <div
      class="fixed inset-y-0 left-0 z-50 w-64 bg-gray-900 transform transition-transform duration-300 ease-in-out md:translate-x-0 md:static md:inset-0"
      :class="{ '-translate-x-full': !sidebarOpen, 'translate-x-0': sidebarOpen }"
    >
      <AgentSidebar @close-sidebar="sidebarOpen = false" />
    </div>

    <!-- Overlay for mobile -->
    <div
      v-if="sidebarOpen"
      class="fixed inset-0 z-40 bg-gray-600 bg-opacity-75 md:hidden"
      @click="sidebarOpen = false"
    ></div>

    <!-- Main content -->
    <div class="flex-1 flex flex-col overflow-hidden">
      <!-- Header -->
      <header class="bg-white shadow-sm border-b border-gray-200">
        <div class="flex items-center justify-between px-6 py-4">
          <div class="flex items-center">
            <button
              @click="sidebarOpen = !sidebarOpen"
              class="text-gray-500 hover:text-gray-600 md:hidden"
            >
              <svg class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
            <h1 class="text-2xl font-bold text-gray-900 ml-4 md:ml-0">
              <i class="fas fa-project-diagram mr-3 text-green-600"></i>
              Personnaliser les Workflows
            </h1>
          </div>
        </div>
      </header>

      <!-- Content -->
      <div class="flex-1 p-6">
        <div class="max-w-4xl mx-auto">
          <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div class="text-center text-gray-500">
              <i class="fas fa-project-diagram text-4xl mb-4"></i>
              <h3 class="text-lg font-medium mb-2">Personnalisation des Workflows</h3>
              <p>Cette fonctionnalité sera bientôt disponible.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import AgentSidebar from '../../components/AgentSidebar.vue'

export default {
  name: 'AgentWorkflows',
  components: {
    AgentSidebar
  },
  data() {
    return {
      sidebarOpen: false
    }
  }
}
</script>

<style scoped>
/* Styles spécifiques au composant */
</style>