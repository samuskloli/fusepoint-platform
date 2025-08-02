<template>
  <div class="h-full">
    <!-- Chat pour les clients -->
    <ClientChat v-if="isClient" />
    
    <!-- Chat pour les agents, admins et super admins -->
    <AgentChat v-else-if="isAgent" />
    
    <!-- Message d'erreur si rôle non reconnu -->
    <div v-else class="flex items-center justify-center h-full text-gray-500">
      <div class="text-center">
        <svg class="w-16 h-16 mx-auto mb-4 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
        </svg>
        <p class="text-lg font-medium">Accès non autorisé</p>
        <p class="text-sm">Votre rôle ne permet pas d'accéder au chat</p>
      </div>
    </div>
  </div>
</template>

<script>
import ClientChat from './ClientChat.vue'
import AgentChat from './AgentChat.vue'

export default {
  name: 'ChatWrapper',
  components: {
    ClientChat,
    AgentChat
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
  }
}
</script>

<style scoped>
/* Styles spécifiques au composant */
</style>