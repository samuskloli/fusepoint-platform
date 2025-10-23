<template>
  <div class="fixed left-0 top-0 h-screen w-64 flex flex-col bg-gray-900 z-50">
    <!-- Sidebar header -->
    <div class="flex items-center justify-between p-4 border-b border-gray-700">
      <div class="flex items-center space-x-3">
        <div class="w-8 h-8 bg-primary-600 rounded-lg flex items-center justify-center">
          <span class="text-white font-bold text-sm">F</span>
        </div>
        <span class="text-white font-semibold text-lg">Fusepoint</span>
      </div>
      <button
        @click="$emit('close-sidebar')"
        class="md:hidden p-1 rounded-md text-gray-400 hover:text-white hover:bg-gray-700"
      >
        <svg class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
    </div>

    <!-- Navigation pour agents -->
    <nav class="flex-1 px-4 py-6 space-y-2 overflow-y-auto">
      <!-- Tableau de bord Agent -->
      <router-link
        to="/agent"
        class="nav-item"
        :class="{ 'nav-item-active': $route.path === '/agent' }"
      >
        <svg class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2H5a2 2 0 00-2-2v0a2 2 0 012-2h6l2 2h6a2 2 0 012 2z" />
        </svg>
        <span>Tableau de bord</span>
      </router-link>

      <!-- Gestion des Clients -->
      <div class="pt-4">
        <h3 class="px-3 text-xs font-semibold text-gray-400 uppercase tracking-wider">
          Gestion Clients
        </h3>
        <div class="mt-2 space-y-1">
          <router-link
            to="/agent/clients"
            class="nav-item"
            :class="{ 'nav-item-active': $route.path === '/agent/clients' }"
          >
            <svg class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
            <span>Gestion Clients</span>
          </router-link>



          <router-link
            to="/agent/service-requests"
            class="nav-item"
            :class="{ 'nav-item-active': $route.path === '/agent/service-requests' }"
          >
            <svg class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
            </svg>
            <span>Demandes Service</span>
          </router-link>

          <router-link
            to="/agent/projects"
            class="nav-item"
            :class="{ 'nav-item-active': $route.path === '/agent/projects' }"
          >
            <svg class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 4h.01M9 12h.01M15 12h.01M21 12c0 4.418-3.582 8-8 8s-8-3.582-8-8 3.582-8 8-8 8 3.582 8 8z" />
            </svg>
            <span>Projets en cours</span>
          </router-link>

          <router-link
            to="/agent/project-templates"
            class="nav-item"
            :class="{ 'nav-item-active': $route.path === '/agent/project-templates' }"
          >
            <svg class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <span>Modèles de Projets</span>
          </router-link>

          <router-link
            to="/agent/prestataires"
            class="nav-item"
            :class="{ 'nav-item-active': $route.path === '/agent/prestataires' }"
          >
            <svg class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
            </svg>
            <span>Prestataires</span>
          </router-link>
        </div>
      </div>

      <!-- Support & Communication -->
      <div class="pt-4">
        <h3 class="px-3 text-xs font-semibold text-gray-400 uppercase tracking-wider">
          Support & Communication
        </h3>
        <div class="mt-2 space-y-1">
          <router-link
            to="/email"
            class="nav-item"
            :class="{ 'nav-item-active': $route.path === '/email' }"
          >
            <svg class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
            <span>Communication Email</span>
          </router-link>

          <router-link
            to="/agent/chat"
            class="nav-item"
            :class="{ 'nav-item-active': $route.path === '/agent/chat' }"
          >
            <svg class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
            <span>Chat Client</span>
            <span class="ml-auto px-2 py-1 text-xs bg-green-600 text-white rounded-full">Nouveau</span>
          </router-link>
        </div>
      </div>

      <!-- Rapports & Analytics -->
      <div class="pt-4">
        <h3 class="px-3 text-xs font-semibold text-gray-400 uppercase tracking-wider">
          Rapports
        </h3>
        <div class="mt-2 space-y-1">
          <router-link
            to="/agent/reports"
            class="nav-item"
            :class="{ 'nav-item-active': $route.path === '/agent/reports' }"
          >
            <svg class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <span>Rapports & Analytics</span>
          </router-link>

          <!-- Lien ajouté: Librairie de Widgets -->
          <router-link
            to="/agent/widgets-library"
            class="nav-item"
            :class="{ 'nav-item-active': $route.path === '/agent/widgets-library' }"
          >
            <svg class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 5a1 1 0 011-1h5a1 1 0 011 1v5a1 1 0 01-1 1H5a1 1 0 01-1-1V5zm9 0a1 1 0 011-1h5a1 1 0 011 1v5a1 1 0 01-1 1h-5a1 1 0 01-1-1V5zM4 14a1 1 0 011-1h5a1 1 0 011 1v5a1 1 0 01-1 1H5a1 1 0 01-1-1v-5zm9 0a1 1 0 011-1h5a1 1 0 011 1v5a1 1 0 01-1 1h-5a1 1 0 01-1-1v-5z" />
            </svg>
            <span>Librairie de Widgets</span>
          </router-link>

          <router-link
            to="/analytics"
            class="nav-item"
            :class="{ 'nav-item-active': $route.path.startsWith('/analytics') && $route.path === '/analytics' }"
          >
            <svg class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
            <span>Analytics Globales</span>
          </router-link>
        </div>
      </div>

      <!-- Personnalisation -->
      <div class="pt-4">
        <h3 class="px-3 text-xs font-semibold text-gray-400 uppercase tracking-wider">
          Personnalisation
        </h3>
        <div class="mt-2 space-y-1">
          <router-link
            to="/agent/customization/themes"
            class="nav-item"
            :class="{ 'nav-item-active': $route.path === '/agent/customization/themes' }"
          >
            <svg class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zM21 5a2 2 0 00-2-2h-4a2 2 0 00-2 2v12a4 4 0 004 4h4a2 2 0 002-2V5z" />
            </svg>
            <span>Thèmes & Apparence</span>
          </router-link>

          <router-link
            to="/agent/customization/dashboard"
            class="nav-item"
            :class="{ 'nav-item-active': $route.path === '/agent/customization/dashboard' }"
          >
            <svg class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zM16 13a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z" />
            </svg>
            <span>Personnaliser Tableau de Bord</span>
          </router-link>

          <router-link
            to="/agent/customization/notifications"
            class="nav-item"
            :class="{ 'nav-item-active': $route.path === '/agent/customization/notifications' }"
          >
            <svg class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 17h5l-5 5v-5zM4.868 19.718c.64.64 1.536 1.032 2.524 1.032h8.236a4 4 0 003.464-6l-4-7A4 4 0 0011.618 6H4.868C3.28 6 2 7.28 2 8.868v8.236c0 .988.392 1.884 1.032 2.524l1.836 1.09z" />
            </svg>
            <span>Préférences Notifications</span>
          </router-link>

          <router-link
            to="/agent/customization/workflows"
            class="nav-item"
            :class="{ 'nav-item-active': $route.path === '/agent/customization/workflows' }"
          >
            <svg class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
            <span>Automatisations & Workflows</span>
          </router-link>
        </div>
      </div>

      <!-- Administration (pour admins seulement) -->
      <div v-if="isAdmin" class="pt-4">
        <h3 class="px-3 text-xs font-semibold text-gray-400 uppercase tracking-wider">
          Administration
        </h3>
        <div class="mt-2 space-y-1">
          <router-link
            to="/team"
            class="nav-item"
            :class="{ 'nav-item-active': $route.path === '/team' }"
          >
            <svg class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
            </svg>
            <span>Gestion Équipe</span>
          </router-link>

          <router-link
            to="/integrations"
            class="nav-item"
            :class="{ 'nav-item-active': $route.path === '/integrations' }"
          >
            <svg class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 9l3 3-3 3m5 0h3M5 20h14a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v14a2 2 0 002 2z" />
            </svg>
            <span>Intégrations</span>
          </router-link>
        </div>
      </div>

      <!-- Paramètres Personnels -->
      <div class="pt-4">
        <h3 class="px-3 text-xs font-semibold text-gray-400 uppercase tracking-wider">
          Paramètres
        </h3>
        <div class="mt-2 space-y-1">
          <router-link
            to="/user-settings"
            class="nav-item"
            :class="{ 'nav-item-active': $route.path === '/user-settings' }"
          >
            <svg class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
            <span>Mon Compte</span>
          </router-link>
        </div>
      </div>
    </nav>

    <!-- Bottom section -->
    <div class="p-4 border-t border-gray-700">
      <router-link
        to="/settings"
        class="nav-item"
        :class="{ 'nav-item-active': $route.path === '/settings' }"
      >
        <svg class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
        <span>Paramètres Système</span>
      </router-link>
    </div>
  </div>
</template>

<script>
import { useAuthStore } from '../stores/auth'
import { computed } from 'vue'

export default {
  name: 'AgentSidebar',
  emits: ['close-sidebar'],
  setup() {
    const authStore = useAuthStore()
    
    const isAdmin = computed(() => {
      return authStore.user?.role === 'admin'
    })
    
    return {
      isAdmin
    }
  }
}
</script>

<style scoped>
.nav-item {
  @apply flex items-center space-x-3 px-3 py-2 text-sm font-medium text-gray-300 rounded-lg hover:bg-gray-700 hover:text-white transition-colors duration-200;
}

.nav-item-active {
  @apply bg-primary-600 text-white;
}
</style>