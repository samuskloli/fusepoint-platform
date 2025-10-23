<template>
  <div class="flex h-screen bg-gray-50">
    <!-- Sidebar -->
    <div
      class="fixed inset-y-0 left-0 z-50 bg-gray-900 transform transition-all duration-300 ease-in-out md:translate-x-0 md:static md:inset-0"
      :class="[{ '-translate-x-full': !sidebarOpen, 'translate-x-0': sidebarOpen }, sidebarWidthClass]"
    >
      <!-- Unifier: toujours Sidebar -->
      <Sidebar
        @close-sidebar="sidebarOpen = false"
        @toggle-collapse="handleSidebarCollapse"
      />
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
      <Header @toggle-sidebar="sidebarOpen = !sidebarOpen" />

      <!-- Main content area -->
      <main class="flex-1 overflow-x-hidden overflow-y-auto bg-gray-50">
        <div class="container mx-auto px-6 py-8 max-w-7xl">
          <slot />
        </div>
      </main>
    </div>
  </div>
</template>

<script>
import Header from './Header.vue'
import Sidebar from './Sidebar.vue'
// import AgentSidebar from './AgentSidebar.vue' // supprimé: on unifie sur Sidebar
import { useAuthStore } from '@/stores/auth'
import { ref, computed } from 'vue'

export default {
  name: 'RoleLayout',
  components: {
    Header,
    Sidebar,
    // AgentSidebar
  },
  setup() {
    const authStore = useAuthStore()
    const isAgent = computed(() => authStore.isAgent)

    const sidebarOpen = ref(false)
    const sidebarCollapsed = ref(false)

    const handleSidebarCollapse = (isCollapsed) => {
      sidebarCollapsed.value = !!isCollapsed
    }

    const sidebarWidthClass = computed(() => {
      if (isAgent.value) return 'w-64'
      return sidebarCollapsed.value ? 'w-16' : 'w-64'
    })

    return {
      isAgent,
      sidebarOpen,
      sidebarCollapsed,
      handleSidebarCollapse,
      sidebarWidthClass
    }
  }
}
</script>

<style scoped>
/* Le layout utilise désormais principalement Tailwind via les classes appliquées. */
</style>