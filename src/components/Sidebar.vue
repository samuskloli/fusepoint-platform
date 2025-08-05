<template>
  <div class="bg-gray-800 text-white h-full flex flex-col" :class="{ 'w-16': isCollapsed, 'w-64': !isCollapsed }">
    <!-- Header -->
    <SidebarHeader 
      :isCollapsed="isCollapsed" 
      @close-sidebar="$emit('close-sidebar')"
      @toggle-collapse="toggleCollapse"
    />

    <!-- Navigation -->
    <nav class="flex-1 px-2 py-4 space-y-2 overflow-y-auto">
      <!-- Navigation principale -->
      <SidebarMainNav :isCollapsed="isCollapsed" />
      
      <!-- Navigation Super Admin -->
      <SidebarSuperAdminNav :isCollapsed="isCollapsed" :isSuperAdmin="isSuperAdmin" />
      
      <!-- Navigation Agent -->
      <SidebarAgentNav :isCollapsed="isCollapsed" :isAgent="isAgent" />
      
      <!-- Navigation Gestion -->
      <SidebarManagementNav :isCollapsed="isCollapsed" />


        <!-- Navigation Inférieure -->
        <SidebarBottomNav :isCollapsed="isCollapsed" />    </nav>
  </div>
</template>

<script>
import { useAuthStore } from '../stores/auth'
import { ref } from 'vue'
import SidebarHeader from './sidebar/SidebarHeader.vue'
import SidebarMainNav from './sidebar/SidebarMainNav.vue'
import SidebarAgentNav from './sidebar/SidebarAgentNav.vue'
import SidebarSuperAdminNav from './sidebar/SidebarSuperAdminNav.vue'
import SidebarManagementNav from './sidebar/SidebarManagementNav.vue'
import SidebarBottomNav from './sidebar/SidebarBottomNav.vue'

export default {
  name: 'Sidebar',
  components: {
    SidebarHeader,
    SidebarMainNav,
    SidebarAgentNav,
    SidebarSuperAdminNav,
    SidebarManagementNav,
    SidebarBottomNav
  },
  emits: ['close-sidebar', 'toggle-collapse'],
  setup(props, { emit }) {
    const authStore = useAuthStore()
    const isCollapsed = ref(false)
    
    const toggleCollapse = () => {
      isCollapsed.value = !isCollapsed.value
      emit('toggle-collapse', isCollapsed.value)
    }
    
    return {
      isAgent: authStore.isAgent,
      isSuperAdmin: authStore.isSuperAdmin,
      isCollapsed,
      toggleCollapse
    }
  }
}
</script>

<style scoped>
/* 
  Note: Les styles de navigation sont maintenant gérés par les composants modulaires.
  Ce fichier principal ne contient que les styles de layout de base.
*/

/* Layout principal du sidebar */
.sidebar-container {
  transition: width 0.2s ease;
}

/* Styles pour la navigation scrollable */
nav {
  scrollbar-width: thin;
  scrollbar-color: rgba(156, 163, 175, 0.3) transparent;
}

nav::-webkit-scrollbar {
  width: 4px;
}

nav::-webkit-scrollbar-track {
  background: transparent;
}

nav::-webkit-scrollbar-thumb {
  background-color: rgba(156, 163, 175, 0.3);
  border-radius: 2px;
}

nav::-webkit-scrollbar-thumb:hover {
  background-color: rgba(156, 163, 175, 0.5);
}
</style>