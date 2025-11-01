<template>
  <SidebarNavSection title="Gestion" :isCollapsed="isCollapsed">
    <!-- Intégrations -->
    <SidebarNavItem
      to="/integrations"
      label="Intégrations"
      iconPath="M8 9l3 3-3 3m5 0h3M5 20h14a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v14a2 2 0 002 2z"
      :isCollapsed="isCollapsed"
      exactMatch
    />

    <!-- Librairie de Widgets (Bêta) -->
    <SidebarNavItem
      to="/agent/widgets-library"
      label="Librairie de Widgets"
      badge="Bêta"
      badgeClass="ml-auto px-2 py-1 text-xs bg-yellow-500 text-white rounded-full"
      iconPath="M4 5a1 1 0 011-1h5a1 1 0 011 1v5a1 1 0 01-1 1H5a1 1 0 01-1-1V5zm9 0a1 1 0 011-1h5a1 1 0 011 1v5a1 1 0 01-1 1h-5a1 1 0 01-1-1V5zM4 14a1 1 0 011-1h5a1 1 0 011 1v5a1 1 0 01-1 1H5a1 1 0 01-1-1v-5zm9 0a1 1 0 011-1h5a1 1 0 011 1v5a1 1 0 01-1 1h-5a1 1 0 01-1-1v-5z"
      :isCollapsed="isCollapsed"
      exactMatch
    />

    <!-- Services (Gestion) -->
    <SidebarNavItem
      to="/management/services"
      label="Gestion des Services"
      iconPath="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
      :isCollapsed="isCollapsed"
      exactMatch
    />

    <!-- Supervision des LinkPoints -->
    <SidebarNavItem
      to="/linkpoints/status"
      label="Supervision des LinkPoints"
      iconPath="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
      :isCollapsed="isCollapsed"
      exactMatch
    />

    <!-- Équipe -->
    <SidebarNavItem
      to="/team"
      label="Équipe"
      iconPath="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z"
      :isCollapsed="isCollapsed"
      exactMatch
    />

    <!-- Mon Compte -->
    <SidebarNavItem
      to="/settings"
      label="Mon Compte"
      iconPath="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
      :isCollapsed="isCollapsed"
      exactMatch
    />

    <!-- Facturation -->
    <SidebarNavItem
      to="/billing"
      label="Facturation"
      iconPath="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"
      :isCollapsed="isCollapsed"
      exactMatch
    />
  </SidebarNavSection>
</template>

<script>
import SidebarNavSection from './SidebarNavSection.vue'
import SidebarNavItem from './SidebarNavItem.vue'

export default {
  name: 'SidebarManagementNav',
  components: {
    SidebarNavSection,
    SidebarNavItem
  },
  props: {
    isCollapsed: {
      type: Boolean,
      default: false
    }
  }
}
</script>

<style scoped>
/* Utilise les classes centralisées */
</style>