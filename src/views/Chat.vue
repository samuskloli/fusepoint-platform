<template>
  <div class="flex h-screen bg-gray-50">
    <!-- Sidebar de navigation (optionnelle selon le rôle) -->
    <div v-if="showSidebar" class="w-64 bg-white shadow-lg border-r border-gray-200">
      <div class="p-4 border-b border-gray-200">
        <h2 class="text-lg font-semibold text-gray-900">Fusepoint Chat</h2>
        <p class="text-sm text-gray-500">Communication client-agent</p>
      </div>
      
      <nav class="p-4">
        <ul class="space-y-2">
          <li>
            <router-link
              to="/dashboard"
              class="flex items-center px-3 py-2 text-sm font-medium text-gray-700 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <svg class="w-5 h-5 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2H5a2 2 0 00-2-2z" />
              </svg>
              Tableau de bord
            </router-link>
          </li>
          <li v-if="isAgent">
            <router-link
              to="/agent/clients"
              class="flex items-center px-3 py-2 text-sm font-medium text-gray-700 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <svg class="w-5 h-5 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-2.239" />
              </svg>
              Mes clients
            </router-link>
          </li>
          <li>
            <div class="flex items-center px-3 py-2 text-sm font-medium text-blue-600 bg-blue-50 rounded-lg">
              <svg class="w-5 h-5 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
              Chat
              <span v-if="totalUnreadCount > 0" class="ml-auto bg-red-500 text-white text-xs px-2 py-1 rounded-full">
                {{ totalUnreadCount }}
              </span>
            </div>
          </li>
        </ul>
      </nav>
    </div>
    
    <!-- Zone de chat principale -->
    <div class="flex-1 flex flex-col">
      <!-- En-tête -->
      <div class="bg-white shadow-sm border-b border-gray-200 px-6 py-4">
        <div class="flex items-center justify-between">
          <div class="flex items-center space-x-4">
            <button 
              v-if="!showSidebar"
              @click="toggleSidebar"
              class="p-2 text-gray-400 hover:text-gray-600 transition-colors"
            >
              <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
            <div>
              <h1 class="text-xl font-semibold text-gray-900">Chat</h1>
              <p class="text-sm text-gray-500">
                {{ isClient ? 'Discutez avec votre agent dédié' : 'Gérez vos conversations clients' }}
              </p>
            </div>
          </div>
          
          <div class="flex items-center space-x-3">
            <!-- Indicateur de statut -->
            <div class="flex items-center space-x-2">
              <div class="w-2 h-2 bg-green-400 rounded-full"></div>
              <span class="text-sm text-gray-500">En ligne</span>
            </div>
            
            <!-- Notifications -->
            <div v-if="totalUnreadCount > 0" class="flex items-center space-x-2">
              <svg class="w-5 h-5 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 17h5l-5 5v-5zM11 19H6a2 2 0 01-2-2V7a2 2 0 012-2h5m5 0v5" />
              </svg>
              <span class="text-sm font-medium text-red-600">{{ totalUnreadCount }} nouveau(x) message(s)</span>
            </div>
          </div>
        </div>
      </div>
      
      <!-- Composant de chat -->
      <div class="flex-1">
        <ChatWrapper @unread-count-updated="updateUnreadCount" />
      </div>
    </div>
  </div>
</template>

<script>
import ChatWrapper from '@/components/Chat/ChatWrapper.vue'

export default {
  name: 'Chat',
  components: {
    ChatWrapper
  },
  data() {
    return {
      showSidebar: true,
      totalUnreadCount: 0
    }
  },
  computed: {
    currentUser() {
      return this.$store.getters.user || {}
    },
    userRole() {
      return this.currentUser.role || ''
    },
    isClient() {
      return this.userRole === 'user' || this.userRole === 'client'
    },
    isAgent() {
      return ['agent', 'admin', 'super_admin'].includes(this.userRole)
    }
  },
  mounted() {
    // Masquer la sidebar sur mobile
    this.checkScreenSize()
    window.addEventListener('resize', this.checkScreenSize)
  },
  beforeUnmount() {
    window.removeEventListener('resize', this.checkScreenSize)
  },
  methods: {
    toggleSidebar() {
      this.showSidebar = !this.showSidebar
    },
    checkScreenSize() {
      this.showSidebar = window.innerWidth >= 1024 // lg breakpoint
    },
    updateUnreadCount(count) {
      this.totalUnreadCount = count
    }
  }
}
</script>

<style scoped>
/* Styles spécifiques à la vue Chat */
</style>