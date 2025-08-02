<template>
  <div class="flex flex-col h-full bg-white">
    <!-- En-tête du chat -->
    <div class="flex items-center justify-between p-4 border-b border-gray-200 bg-gray-50">
      <div class="flex items-center space-x-3">
        <div class="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
          <svg class="w-5 h-5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
          </svg>
        </div>
        <div>
          <h3 class="text-lg font-semibold text-gray-900">Chat avec votre agent</h3>
          <p class="text-sm text-gray-500" v-if="assignedAgent">
            {{ assignedAgent.first_name }} {{ assignedAgent.last_name }}
          </p>
          <p class="text-sm text-red-500" v-else>
            Aucun agent assigné
          </p>
        </div>
      </div>
      <div class="flex items-center space-x-2">
        <span v-if="unreadCount > 0" class="bg-red-500 text-white text-xs px-2 py-1 rounded-full">
          {{ unreadCount }}
        </span>
        <div class="w-3 h-3 rounded-full" :class="isOnline ? 'bg-green-400' : 'bg-gray-400'"></div>
      </div>
    </div>

    <!-- Zone des messages -->
    <div ref="messagesContainer" class="flex-1 overflow-y-auto p-4 space-y-4">
      <div v-if="loading" class="flex justify-center py-8">
        <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
      
      <div v-else-if="messages.length === 0" class="flex flex-col items-center justify-center py-12 text-gray-500">
        <svg class="w-16 h-16 mb-4 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
        </svg>
        <p class="text-lg font-medium">Aucun message</p>
        <p class="text-sm">Commencez une conversation avec votre agent</p>
      </div>

      <div v-else>
        <div v-for="message in messages" :key="message.id" class="flex" :class="message.sender_id === currentUser.id ? 'justify-end' : 'justify-start'">
          <div class="max-w-xs lg:max-w-md" :class="message.sender_id === currentUser.id ? 'order-1' : 'order-2'">
            <div class="px-4 py-2 rounded-lg" :class="message.sender_id === currentUser.id ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-900'">
              <!-- Message texte -->
              <p v-if="message.message_type === 'text'" class="text-sm">{{ message.content }}</p>
              
              <!-- Message fichier -->
              <div v-else-if="message.message_type === 'file'" class="space-y-2">
                <div class="flex items-center space-x-2">
                  <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
                  </svg>
                  <span class="text-sm font-medium">{{ message.file_name }}</span>
                </div>
                <a :href="getFileUrl(message.file_path)" target="_blank" class="text-xs underline opacity-75 hover:opacity-100">
                  Télécharger
                </a>
              </div>
            </div>
            <p class="text-xs text-gray-500 mt-1" :class="message.sender_id === currentUser.id ? 'text-right' : 'text-left'">
              {{ formatTime(message.created_at) }}
            </p>
          </div>
        </div>
      </div>
    </div>

    <!-- Zone de saisie -->
    <div class="border-t border-gray-200 p-4">
      <div v-if="!assignedAgent" class="text-center py-4">
        <p class="text-gray-500 text-sm">Aucun agent assigné. Contactez l'administration.</p>
      </div>
      <div v-else class="flex items-end space-x-2">
        <!-- Input fichier caché -->
        <input ref="fileInput" type="file" class="hidden" @change="handleFileSelect" accept=".pdf,.doc,.docx,.txt,.jpg,.jpeg,.png,.gif">
        
        <!-- Bouton fichier -->
        <button @click="$refs.fileInput.click()" class="flex-shrink-0 p-2 text-gray-400 hover:text-gray-600 transition-colors">
          <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
          </svg>
        </button>
        
        <!-- Zone de texte -->
        <div class="flex-1 relative">
          <textarea
            v-model="newMessage"
            @keydown.enter.prevent="handleKeyDown"
            placeholder="Tapez votre message..."
            rows="1"
            class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
            :disabled="sending"
          ></textarea>
        </div>
        
        <!-- Bouton envoyer -->
        <button
          @click="sendMessage"
          :disabled="!newMessage.trim() || sending"
          class="flex-shrink-0 bg-blue-600 text-white p-2 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          <svg v-if="sending" class="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <svg v-else class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
          </svg>
        </button>
      </div>
    </div>
  </div>
</template>

<script>
import { chatAPI } from '@/services/chatAPI.js'

export default {
  name: 'ClientChat',
  data() {
    return {
      messages: [],
      newMessage: '',
      loading: true,
      sending: false,
      assignedAgent: null,
      conversationId: null,
      unreadCount: 0,
      isOnline: true,
      pollInterval: null
    }
  },
  computed: {
    currentUser() {
      return this.$store.getters.user || {}
    }
  },
  async mounted() {
    await this.initializeChat()
    this.startPolling()
  },
  beforeUnmount() {
    if (this.pollInterval) {
      clearInterval(this.pollInterval)
    }
  },
  methods: {
    async initializeChat() {
      try {
        this.loading = true
        
        // Récupérer l'agent assigné
        const agentResponse = await chatAPI.getAssignedAgent()
        if (agentResponse.success && agentResponse.agent) {
          this.assignedAgent = agentResponse.agent
          
          // Obtenir ou créer la conversation
          const conversationResponse = await chatAPI.getOrCreateConversation(this.assignedAgent.id)
          if (conversationResponse.success) {
            this.conversationId = conversationResponse.conversation.id
            await this.loadMessages()
          }
        }
      } catch (error) {
        console.error('Erreur lors de l\'initialisation du chat:', error)
      } finally {
        this.loading = false
      }
    },
    
    async loadMessages() {
      if (!this.conversationId) return
      
      try {
        const response = await chatAPI.getMessages(this.conversationId)
        if (response.success) {
          this.messages = response.messages
          this.$nextTick(() => {
            this.scrollToBottom()
          })
          
          // Marquer comme lu
          await chatAPI.markConversationAsRead(this.conversationId)
        }
      } catch (error) {
        console.error('Erreur lors du chargement des messages:', error)
      }
    },
    
    async sendMessage() {
      if (!this.newMessage.trim() || !this.conversationId || this.sending) return
      
      try {
        this.sending = true
        const response = await chatAPI.sendMessage(this.conversationId, {
          content: this.newMessage.trim(),
          message_type: 'text'
        })
        
        if (response.success) {
          this.messages.push(response.message)
          this.newMessage = ''
          this.$nextTick(() => {
            this.scrollToBottom()
          })
        }
      } catch (error) {
        console.error('Erreur lors de l\'envoi du message:', error)
      } finally {
        this.sending = false
      }
    },
    
    async handleFileSelect(event) {
      const file = event.target.files[0]
      if (!file || !this.conversationId) return
      
      try {
        this.sending = true
        const response = await chatAPI.uploadFile(this.conversationId, file)
        
        if (response.success) {
          this.messages.push(response.message)
          this.$nextTick(() => {
            this.scrollToBottom()
          })
        }
      } catch (error) {
        console.error('Erreur lors de l\'envoi du fichier:', error)
      } finally {
        this.sending = false
        event.target.value = '' // Reset input
      }
    },
    
    handleKeyDown(event) {
      if (event.shiftKey) {
        return // Permettre le saut de ligne avec Shift+Enter
      }
      this.sendMessage()
    },
    
    scrollToBottom() {
      if (this.$refs.messagesContainer) {
        this.$refs.messagesContainer.scrollTop = this.$refs.messagesContainer.scrollHeight
      }
    },
    
    formatTime(timestamp) {
      return new Date(timestamp).toLocaleTimeString('fr-FR', {
        hour: '2-digit',
        minute: '2-digit'
      })
    },
    
    getFileUrl(filePath) {
      return `${process.env.VUE_APP_API_URL || 'http://localhost:3000'}/uploads/${filePath}`
    },
    
    startPolling() {
      this.pollInterval = setInterval(async () => {
        if (this.conversationId) {
          await this.loadMessages()
        }
      }, 5000) // Poll toutes les 5 secondes
    }
  }
}
</script>

<style scoped>
/* Styles spécifiques au composant */
.animate-spin {
  animation: spin 1s linear infinite;
}

@keyframes spin {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}
</style>