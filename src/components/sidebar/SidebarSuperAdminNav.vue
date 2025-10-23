<template>
  <SidebarNavSection title="Super Admin" :isCollapsed="isCollapsed" v-if="isSuperAdmin">
    <!-- Tableau de bord Super Admin -->
    <SidebarNavItem
      to="/super-admin"
      label="Tableau de Bord Super Admin"
      iconPath="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
      badge="Admin"
      badgeClass="ml-auto px-2 py-1 text-xs bg-red-600 text-white rounded-full"
      :isCollapsed="isCollapsed"
    />

    <!-- Librairie de Widgets (accessible aux Super Admins et Admins via la route Agent) -->
    <SidebarNavItem
      to="/agent/widgets-library"
      label="Librairie de Widgets"
      iconPath="M4 5a1 1 0 011-1h5a1 1 0 011 1v5a1 1 0 01-1 1H5a1 1 0 01-1-1V5zm9 0a1 1 0 011-1h5a1 1 0 011 1v5a1 1 0 01-1 1h-5a1 1 0 01-1-1V5zM4 14a1 1 0 011-1h5a1 1 0 011 1v5a1 1 0 01-1 1H5a1 1 0 01-1-1v-5zm9 0a1 1 0 011-1h5a1 1 0 011 1v5a1 1 0 01-1 1h-5a1 1 0 01-1-1v-5z"
      :isCollapsed="isCollapsed"
      exactMatch
    />
  </SidebarNavSection>
</template>

<script>
import SidebarNavSection from './SidebarNavSection.vue'
import SidebarNavItem from './SidebarNavItem.vue'

export default {
  name: 'SidebarSuperAdminNav',
  components: {
    SidebarNavSection,
    SidebarNavItem
  },
  props: {
    isCollapsed: {
      type: Boolean,
      default: false
    },
    isSuperAdmin: {
      type: Boolean,
      default: false
    }
  }
}
</script>

<style scoped>
/* Utilise les classes centralisées */
</style>