<template>
  <div class="layout-container">
    <!-- Sidebar -->
    <div
      class="sidebar-wrapper hidden md:block"
      :class="{ 
        '-translate-x-full': !sidebarOpen, 
        'translate-x-0': sidebarOpen,
        'w-16': sidebarCollapsed,
        'w-64': !sidebarCollapsed
      }"
    >
      <Sidebar @close-sidebar="sidebarOpen = false" @toggle-collapse="handleSidebarCollapse" />
    </div>

    <!-- Overlay for mobile -->
    <div
      v-if="sidebarOpen"
      class="mobile-overlay"
      @click="sidebarOpen = false"
    ></div>

    <!-- Main content -->
    <div class="main-wrapper">
      <!-- Header -->
      <Header @toggle-sidebar="sidebarOpen = !sidebarOpen" />

      <!-- Main content area -->
      <main class="main-content">
        <div class="content-container">
          <slot />
        </div>
      </main>
    </div>
  </div>
</template>

<script>
import Header from './Header.vue'
import Sidebar from './Sidebar.vue'

export default {
  name: 'Layout',
  components: {
    Header,
    Sidebar
  },
  data() {
    return {
      sidebarOpen: false,
      sidebarCollapsed: false
    }
  },
  methods: {
    handleSidebarCollapse(isCollapsed) {
      this.sidebarCollapsed = isCollapsed
    }
  }
}
</script>

<style scoped>
/* Styles spécifiques au layout - utilise les classes centralisées */
.layout-container {
  @apply flex min-h-screen bg-gray-50;
}

.sidebar-wrapper {
  @apply fixed inset-y-0 left-0 z-50 bg-gray-900 transform transition-all duration-300 ease-in-out;
  @apply md:translate-x-0 md:static md:inset-0;
}

.mobile-overlay {
  @apply fixed inset-0 z-40 bg-gray-600 bg-opacity-75 md:hidden;
}

.main-wrapper {
  @apply flex-1 flex flex-col overflow-hidden;
}

.main-content {
  @apply flex-1 overflow-x-hidden overflow-y-auto bg-gray-50;
}

.content-container {
  @apply container mx-auto px-3 sm:px-6 py-4 sm:py-8 max-w-full sm:max-w-7xl;
}
</style>