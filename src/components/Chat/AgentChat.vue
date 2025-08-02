<template>
  <div class="flex h-full bg-white">
    <!-- Sidebar des conversations -->
    <div class="w-1/3 border-r border-gray-200 flex flex-col">
      <!-- En-tête avec recherche -->
      <div class="p-4 border-b border-gray-200 bg-gray-50">
        <h3 class="text-lg font-semibold text-gray-900 mb-3">Conversations</h3>
        
        <!-- Barre de recherche -->
        <div class="relative">
          <input
            v-model="searchQuery"
            @input="searchClients"
            type="text"
            placeholder="Rechercher un client..."
            class="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
          <svg class="absolute left-3 top-2.5 h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>
        
        <!-- Filtres -->
        <div class="flex space-x-2 mt-3">
          <button
            @click="filterType = 'assigned'"
            :class="filterType === 'assigned' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700'"
            class="px-3 py-1 rounded-full text-xs font-medium transition-colors"
          >
            Mes clients ({{ assignedClients.length }})
          </button>
          <button
            @click="filterType = 'all'"
            :class="filterType === 'all' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700'"
            class="px-3 py-1 rounded-full text-xs font-medium transition-colors"
          >
            Tous les clients
          </button>
        </div>
      </div>
      
      <!-- Liste des conversations -->
      <div class="flex-1 overflow-y-auto">
        <div v-if="loadingConversations" class="flex justify-center py-8">
          <div class="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
        </div>
        
        <div v-else-if="filteredConversations.length === 0" class="p-4 text-center text-gray-500">
          <p v-if="searchQuery">Aucun client trouvé</p>
          <p v-else>Aucune conversation</p>
        </div>
        
        <div v-else>
          <div
            v-for="conversation in filteredConversations"
            :key="conversation.id"
            @click="selectConversation(conversation)"
            class="p-4 border-b border-gray-100 cursor-pointer hover:bg-gray-50 transition-colors"
            :class="selectedConversation?.id === conversation.id ? 'bg-blue-50 border-blue-200' : ''"
          >
            <div class="flex items-center justify-between">
              <div class="flex items-center space-x-3">
                <div class="w-10 h-10 bg-gray-300 rounded-full flex items-center justify-center">
                  <span class="text-sm font-medium text-gray-700">
                    {{ getInitials(conversation.client_name) }}
                  </span>
                </div>
                <div class="flex-1 min-w-0">
                  <p class="text-sm font-medium text-gray-900 truncate">
                    {{ conversation.client_name }}
                  </p>
                  <p class="text-xs text-gray-500 truncate">
                    {{ conversation.last_message || 'Aucun message' }}
                  </p>
                </div>
              </div>
              <div class="flex flex-col items-end space-y-1">
                <span v-if="conversation.last_message_time" class="text-xs text-gray-400">
                  {{ formatTime(conversation.last_message_time) }}
                </span>
                <span v-if="conversation.unread_count > 0" class="bg-red-500 text-white text-xs px-2 py-1 rounded-full">
                  {{ conversation.unread_count }}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <!-- Bouton nouvelle conversation -->
      <div class="p-4 border-t border-gray-200">
        <button
          @click="showNewConversationModal = true"
          class="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center space-x-2"
        >
          <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
          </svg>
          <span>Nouvelle conversation</span>
        </button>
      </div>
    </div>
    
    <!-- Zone de chat principale -->
    <div class="flex-1 flex flex-col">
      <div v-if="!selectedConversation" class="flex-1 flex items-center justify-center text-gray-500">
        <div class="text-center">
          <svg class="w-16 h-16 mx-auto mb-4 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
          </svg>
          <p class="text-lg font-medium">Sélectionnez une conversation</p>
          <p class="text-sm">Choisissez un client pour commencer à discuter</p>
        </div>
      </div>
      
      <div v-else class="flex-1 flex flex-col">
        <!-- En-tête de la conversation -->
        <div class="flex items-center justify-between p-4 border-b border-gray-200 bg-gray-50">
          <div class="flex items-center space-x-3">
            <div class="w-10 h-10 bg-gray-300 rounded-full flex items-center justify-center">
              <span class="text-sm font-medium text-gray-700">
                {{ getInitials(selectedConversation.client_name) }}
              </span>
            </div>
            <div>
              <h3 class="text-lg font-semibold text-gray-900">{{ selectedConversation.client_name }}</h3>
              <p class="text-sm text-gray-500">Client</p>
            </div>
          </div>
          <div class="flex items-center space-x-2">
            <span v-if="selectedConversation.unread_count > 0" class="bg-red-500 text-white text-xs px-2 py-1 rounded-full">
              {{ selectedConversation.unread_count }}
            </span>
            <div class="w-3 h-3 bg-green-400 rounded-full"></div>
          </div>
        </div>
        
        <!-- Zone des messages -->
        <div ref="messagesContainer" class="flex-1 overflow-y-auto p-4 space-y-4">
          <div v-if="loadingMessages" class="flex justify-center py-8">
            <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
          
          <div v-else-if="messages.length === 0" class="flex flex-col items-center justify-center py-12 text-gray-500">
            <svg class="w-16 h-16 mb-4 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
            <p class="text-lg font-medium">Aucun message</p>
            <p class="text-sm">Commencez une conversation avec ce client</p>
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
          <div class="flex items-end space-x-2">
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
    </div>
    
    <!-- Modal nouvelle conversation -->
    <div v-if="showNewConversationModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div class="bg-white rounded-lg p-6 w-full max-w-md">
        <h3 class="text-lg font-semibold text-gray-900 mb-4">Nouvelle conversation</h3>
        
        <div class="mb-4">
          <label class="block text-sm font-medium text-gray-700 mb-2">Rechercher un client</label>
          <input
            v-model="newConversationSearch"
            @input="searchAllClients"
            type="text"
            placeholder="Nom du client..."
            class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
        </div>
        
        <div v-if="searchResults.length > 0" class="mb-4 max-h-40 overflow-y-auto border border-gray-200 rounded-lg">
          <div
            v-for="client in searchResults"
            :key="client.id"
            @click="startNewConversation(client)"
            class="p-3 hover:bg-gray-50 cursor-pointer border-b border-gray-100 last:border-b-0"
          >
            <p class="text-sm font-medium text-gray-900">{{ client.first_name }} {{ client.last_name }}</p>
            <p class="text-xs text-gray-500">{{ client.email }}</p>
          </div>
        </div>
        
        <div class="flex justify-end space-x-3">
          <button
            @click="showNewConversationModal = false"
            class="px-4 py-2 text-gray-700 bg-gray-200 rounded-lg hover:bg-gray-300 transition-colors"
          >
            Annuler
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { chatAPI } from '@/services/chatAPI.js'

export default {
  name: 'AgentChat',
  data() {
    return {
      conversations: [],
      assignedClients: [],
      selectedConversation: null,
      messages: [],
      newMessage: '',
      searchQuery: '',
      filterType: 'assigned', // 'assigned' ou 'all'
      loadingConversations: true,
      loadingMessages: false,
      sending: false,
      showNewConversationModal: false,
      newConversationSearch: '',
      searchResults: [],
      pollInterval: null
    }
  },
  computed: {
    currentUser() {
      return this.$store.getters.user || {}
    },
    filteredConversations() {
      let filtered = this.filterType === 'assigned' 
        ? this.conversations.filter(conv => this.assignedClients.some(client => client.id === conv.client_id))
        : this.conversations
      
      if (this.searchQuery) {
        filtered = filtered.filter(conv => 
          conv.client_name.toLowerCase().includes(this.searchQuery.toLowerCase())
        )
      }
      
      return filtered.sort((a, b) => {
        // Trier par messages non lus d'abord, puis par dernière activité
        if (a.unread_count > 0 && b.unread_count === 0) return -1
        if (a.unread_count === 0 && b.unread_count > 0) return 1
        return new Date(b.last_message_time || 0) - new Date(a.last_message_time || 0)
      })
    }
  },
  async mounted() {
    await this.loadConversations()
    await this.loadAssignedClients()
    this.startPolling()
  },
  beforeUnmount() {
    if (this.pollInterval) {
      clearInterval(this.pollInterval)
    }
  },
  methods: {
    async loadConversations() {
      try {
        this.loadingConversations = true
        const response = await chatAPI.getAgentConversations()
        if (response.success) {
          this.conversations = response.conversations
        }
      } catch (error) {
        console.error('Erreur lors du chargement des conversations:', error)
      } finally {
        this.loadingConversations = false
      }
    },
    
    async loadAssignedClients() {
      try {
        const response = await chatAPI.getAssignedClients()
        if (response.success) {
          this.assignedClients = response.clients
        }
      } catch (error) {
        console.error('Erreur lors du chargement des clients assignés:', error)
      }
    },
    
    async selectConversation(conversation) {
      this.selectedConversation = conversation
      await this.loadMessages()
      
      // Marquer comme lu
      if (conversation.unread_count > 0) {
        await chatAPI.markConversationAsRead(conversation.id)
        conversation.unread_count = 0
      }
    },
    
    async loadMessages() {
      if (!this.selectedConversation) return
      
      try {
        this.loadingMessages = true
        const response = await chatAPI.getMessages(this.selectedConversation.id)
        if (response.success) {
          this.messages = response.messages
          this.$nextTick(() => {
            this.scrollToBottom()
          })
        }
      } catch (error) {
        console.error('Erreur lors du chargement des messages:', error)
      } finally {
        this.loadingMessages = false
      }
    },
    
    async sendMessage() {
      if (!this.newMessage.trim() || !this.selectedConversation || this.sending) return
      
      try {
        this.sending = true
        const response = await chatAPI.sendMessage(this.selectedConversation.id, {
          content: this.newMessage.trim(),
          message_type: 'text'
        })
        
        if (response.success) {
          this.messages.push(response.message)
          this.newMessage = ''
          
          // Mettre à jour la conversation dans la liste
          const convIndex = this.conversations.findIndex(c => c.id === this.selectedConversation.id)
          if (convIndex !== -1) {
            this.conversations[convIndex].last_message = response.message.content
            this.conversations[convIndex].last_message_time = response.message.created_at
          }
          
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
      if (!file || !this.selectedConversation) return
      
      try {
        this.sending = true
        const response = await chatAPI.uploadFile(this.selectedConversation.id, file)
        
        if (response.success) {
          this.messages.push(response.message)
          
          // Mettre à jour la conversation dans la liste
          const convIndex = this.conversations.findIndex(c => c.id === this.selectedConversation.id)
          if (convIndex !== -1) {
            this.conversations[convIndex].last_message = `📎 ${response.message.file_name}`
            this.conversations[convIndex].last_message_time = response.message.created_at
          }
          
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
    
    async searchClients() {
      // Recherche locale dans les conversations existantes
      // La recherche est gérée par le computed filteredConversations
    },
    
    async searchAllClients() {
      if (!this.newConversationSearch.trim()) {
        this.searchResults = []
        return
      }
      
      try {
        const response = await chatAPI.searchClients(this.newConversationSearch)
        if (response.success) {
          this.searchResults = response.clients
        }
      } catch (error) {
        console.error('Erreur lors de la recherche de clients:', error)
      }
    },
    
    async startNewConversation(client) {
      try {
        const response = await chatAPI.getOrCreateConversation(client.id)
        if (response.success) {
          // Ajouter la nouvelle conversation à la liste si elle n'existe pas
          const existingConv = this.conversations.find(c => c.id === response.conversation.id)
          if (!existingConv) {
            const newConv = {
              id: response.conversation.id,
              client_id: client.id,
              client_name: `${client.first_name} ${client.last_name}`,
              last_message: null,
              last_message_time: null,
              unread_count: 0
            }
            this.conversations.unshift(newConv)
            this.selectedConversation = newConv
          } else {
            this.selectedConversation = existingConv
          }
          
          await this.loadMessages()
        }
      } catch (error) {
        console.error('Erreur lors de la création de la conversation:', error)
      } finally {
        this.showNewConversationModal = false
        this.newConversationSearch = ''
        this.searchResults = []
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
      if (!timestamp) return ''
      const date = new Date(timestamp)
      const now = new Date()
      const diffInHours = (now - date) / (1000 * 60 * 60)
      
      if (diffInHours < 24) {
        return date.toLocaleTimeString('fr-FR', {
          hour: '2-digit',
          minute: '2-digit'
        })
      } else {
        return date.toLocaleDateString('fr-FR', {
          day: '2-digit',
          month: '2-digit'
        })
      }
    },
    
    getInitials(name) {
      return name
        .split(' ')
        .map(word => word.charAt(0))
        .join('')
        .toUpperCase()
        .substring(0, 2)
    },
    
    getFileUrl(filePath) {
      return `${process.env.VUE_APP_API_URL || 'http://localhost:3000'}/uploads/${filePath}`
    },
    
    startPolling() {
      this.pollInterval = setInterval(async () => {
        await this.loadConversations()
        if (this.selectedConversation) {
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