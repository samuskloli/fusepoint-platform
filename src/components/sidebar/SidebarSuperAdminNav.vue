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

    <!-- Gestion des Utilisateurs -->
    <SidebarNavItem
      to="/admin/users"
      label="Gestion des Utilisateurs"
      iconPath="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z"
      :isCollapsed="isCollapsed"
      exactMatch
    />

    <!-- Gestion des Widgets -->
    <SidebarNavItem
      to="/admin/widgets"
      label="Gestion des Widgets"
      iconPath="M4 5a1 1 0 011-1h5a1 1 0 011 1v5a1 1 0 01-1 1H5a1 1 0 01-1-1V5zm9 0a1 1 0 011-1h5a1 1 0 011 1v5a1 1 0 01-1 1h-5a1 1 0 01-1-1V5zM4 14a1 1 0 011-1h5a1 1 0 011 1v5a1 1 0 01-1 1H5a1 1 0 01-1-1v-5zm9 0a1 1 0 011-1h5a1 1 0 011 1v5a1 1 0 01-1 1h-5a1 1 0 01-1-1v-5z"
      :isCollapsed="isCollapsed"
      exactMatch
    />

    <!-- Paramètres Système -->
    <SidebarNavItem
      to="/admin/settings"
      label="Paramètres Système"
      iconPath="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z M15 12a3 3 0 11-6 0 3 3 0 016 0z"
      :isCollapsed="isCollapsed"
      exactMatch
    />

    <!-- Logs Système -->
    <SidebarNavItem
      to="/admin/logs"
      label="Logs Système"
      iconPath="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
      :isCollapsed="isCollapsed"
      exactMatch
    />

    <!-- Demandes bêta -->
    <SidebarNavItem
      to="/super-admin/beta-requests"
      label="Demandes bêta"
      iconPath="M11 3.055A9.001 9.001 0 1020.945 13H11V3.055z M20.488 9H15V3.512A9.025 9.025 0 0120.488 9z"
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