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
      to="/user-settings"
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