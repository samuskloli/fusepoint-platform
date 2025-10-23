<template>
  <SidebarNavSection title="Agent" :isCollapsed="isCollapsed" v-if="isAgent">
    <!-- Tableau de bord Agent -->
    <SidebarNavItem
      to="/agent"
      label="Tableau de Bord Agent"
      iconPath="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2H5a2 2 0 00-2-2v0a2 2 0 012-2h6l2 2h6a2 2 0 012 2z"
      :isCollapsed="isCollapsed"
      exactMatch
    />

    <!-- Gestion des Clients -->
    <SidebarNavItem
      to="/agent/clients"
      label="Gestion Clients"
      iconPath="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
      :isCollapsed="isCollapsed"
      exactMatch
    />

    <!-- Demandes Service -->
    <SidebarNavItem
      to="/agent/service-requests"
      label="Demandes Service"
      iconPath="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01"
      :isCollapsed="isCollapsed"
      exactMatch
    />

    <!-- Projets en cours -->
    <SidebarNavItem
      to="/agent/projects"
      label="Projets clients en cours"
      iconPath="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 4h.01M9 12h.01M15 12h.01M21 12c0 4.418-3.582 8-8 8s-8-3.582-8-8 3.582-8 8-8 8 3.582"
      :isCollapsed="isCollapsed"
      exactMatch
    />

    <!-- Modèles de Projets -->
    <SidebarNavItem
      to="/agent/project-templates"
      label="Modèles de Projets"
      iconPath="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
      :isCollapsed="isCollapsed"
      exactMatch
    />

    <!-- Prestataires -->
    <SidebarNavItem
      to="/agent/prestataires"
      label="Prestataires"
      iconPath="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z"
      :isCollapsed="isCollapsed"
      exactMatch
    />

    <!-- Rapports & Analytics Agent -->
    <SidebarNavItem
      to="/agent/reports"
      label="Rapports & Analytics Agent"
      iconPath="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
      :isCollapsed="isCollapsed"
      exactMatch
    />

    <!-- Librairie de Widgets -->
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
  name: 'SidebarAgentNav',
  components: {
    SidebarNavSection,
    SidebarNavItem
  },
  props: {
    isCollapsed: {
      type: Boolean,
      default: false
    },
    isAgent: {
      type: Boolean,
      default: false
    }
  }
}
</script>

<style scoped>
/* Utilise les classes centralisées */
</style>