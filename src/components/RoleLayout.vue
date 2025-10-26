<template>
  <div class="flex min-h-screen bg-gray-50">
    <!-- Sidebar -->
    <div
      class="fixed inset-y-0 left-0 z-50 bg-gray-900 transform transition-all duration-300 ease-in-out md:translate-x-0 md:static md:inset-0 w-full"
      :class="[{ '-translate-x-full': !sidebarOpen, 'translate-x-0': sidebarOpen }, sidebarWidthClassMd]"
    >
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
        <div class="container mx-auto px-6 pt-8 pb-24 md:pb-8 max-w-7xl">
          <slot />
        </div>
      </main>
    </div>

    <!-- Barre de navigation collante mobile (rôles non-client) -->
    <MobileBottomNav v-if="!isClient" />
  </div>
</template>

<script>
import Header from './Header.vue'
import Sidebar from './Sidebar.vue'
import MobileBottomNav from './MobileBottomNav.vue'
import { useAuthStore } from '@/stores/auth'
import { ref, computed } from 'vue'

export default {
  name: 'RoleLayout',
  components: {
    Header,
    Sidebar,
    MobileBottomNav
  },
  setup() {
    const authStore = useAuthStore()
    const isAgent = computed(() => authStore.isAgent)
    const isClient = computed(() => authStore.userRole === 'client' || authStore.user?.role === 'client')

    const sidebarOpen = ref(false)
    const sidebarCollapsed = ref(false)

    const handleSidebarCollapse = (isCollapsed) => {
      sidebarCollapsed.value = !!isCollapsed
    }

    // Sur mobile: plein écran (w-full); sur desktop: largeur contrôlée
    const sidebarWidthClassMd = computed(() => {
      if (isAgent.value) return 'md:w-64'
      return sidebarCollapsed.value ? 'md:w-16' : 'md:w-64'
    })

    return {
      isAgent,
      isClient,
      sidebarOpen,
      sidebarCollapsed,
      handleSidebarCollapse,
      sidebarWidthClassMd
    }
  }
}
</script>

<style scoped>
/* Le layout utilise désormais principalement Tailwind via les classes appliquées. */
</style>