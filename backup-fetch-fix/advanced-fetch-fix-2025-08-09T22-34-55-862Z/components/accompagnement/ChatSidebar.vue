<template>
  <div class="flex flex-col h-full bg-white border-l border-gray-200">
    <!-- Header du chat -->
    <div class="flex items-center justify-between p-4 border-b border-gray-200 bg-gray-50">
      <div class="flex items-center space-x-3">
        <div class="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
          <ChatBubbleLeftRightIcon class="w-4 h-4 text-blue-600" />
        </div>
        <div>
          <h3 class="text-sm font-medium text-gray-900">Chat Fusepoint</h3>
          <p class="text-xs text-gray-500">{{ getConversationTitle() }}</p>
        </div>
      </div>
      <button 
        @click="toggleChat" 
        class="text-gray-400 hover:text-gray-600"
        :title="isExpanded ? 'Réduire' : 'Agrandir'"
      >
        <component :is="isExpanded ? ChevronRightIcon : ChevronLeftIcon" class="w-5 h-5" />
      </button>
    </div>

    <!-- Liste des conversations (mode réduit) -->
    <div v-if="!isExpanded" class="flex-1 overflow-y-auto p-2">
      <div class="space-y-2">
        <button
          v-for="conversation in conversations"
          :key="conversation.id"
          @click="selectConversation(conversation)"
          :class="[
            'w-full p-2 text-left rounded-lg transition-colors',
            selectedConversation?.id === conversation.id
              ? 'bg-blue-100 border border-blue-200'
              : 'hover:bg-gray-100'
          ]"
        >
          <div class="flex items-center space-x-2">
            <div class="w-2 h-2 rounded-full" :class="{
              'bg-green-400': conversation.status === 'active',
              'bg-yellow-400': conversation.status === 'pending',
              'bg-gray-400': conversation.status === 'closed'
            }"></div>
            <div class="flex-1 min-w-0">
              <p class="text-xs font-medium text-gray-900 truncate">{{ conversation.title }}</p>
              <p class="text-xs text-gray-500 truncate">{{ getLastMessagePreview(conversation) }}</p>
            </div>
          </div>
          <div v-if="conversation.unread_count > 0" class="mt-1">
            <span class="inline-flex items-center px-1.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
              {{ conversation.unread_count }}
            </span>
          </div>
        </button>
      </div>
    </div>

    <!-- Chat complet (mode étendu) -->
    <div v-else class="flex-1 flex flex-col">
      <!-- Sélecteur de conversation -->
      <div v-if="conversations.length > 1" class="p-3 border-b border-gray-200">
        <select 
          v-model="selectedConversationId" 
          @change="onConversationChange"
          class="w-full text-sm border border-gray-300 rounded-md px-2 py-1 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        >
          <option value="">Sélectionner une conversation</option>
          <option 
            v-for="conversation in conversations" 
            :key="conversation.id" 
            :value="conversation.id"
          >
            {{ conversation.title }}
          </option>
        </select>
      </div>

      <!-- Messages -->
      <div class="flex-1 overflow-y-auto p-3 space-y-3" ref="messagesContainer">
        <div v-if="loading" class="flex justify-center py-4">
          <div class="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
        </div>
        
        <div v-else-if="!selectedConversation" class="text-center py-8">
          <ChatBubbleLeftRightIcon class="w-12 h-12 text-gray-400 mx-auto mb-3" />
          <p class="text-sm text-gray-500">Sélectionnez une conversation</p>
        </div>
        
        <div v-else-if="messages.length === 0" class="text-center py-8">
          <p class="text-sm text-gray-500">Aucun message pour le moment</p>
          <p class="text-xs text-gray-400 mt-1">Commencez la conversation !</p>
        </div>
        
        <div v-else>
          <div 
            v-for="message in messages" 
            :key="message.id"
            :class="[
              'flex',
              message.sender_type === 'client' ? 'justify-end' : 'justify-start'
            ]"
          >
            <div :class="[
              'max-w-xs lg:max-w-md px-3 py-2 rounded-lg text-sm',
              message.sender_type === 'client'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-900'
            ]">
              <!-- Contenu du message -->
              <div class="whitespace-pre-wrap">{{ message.content }}</div>
              
              <!-- Fichiers attachés -->
              <div v-if="message.attachments && message.attachments.length > 0" class="mt-2 space-y-1">
                <div 
                  v-for="attachment in getAttachments(message.attachments)" 
                  :key="attachment.name"
                  class="flex items-center space-x-2 p-2 bg-white bg-opacity-20 rounded"
                >
                  <PaperClipIcon class="w-4 h-4" />
                  <a 
                    :href="attachment.url" 
                    :download="attachment.name"
                    class="text-xs underline hover:no-underline truncate"
                  >
                    {{ attachment.name }}
                  </a>
                </div>
              </div>
              
              <!-- Timestamp -->
              <div :class="[
                'text-xs mt-1',
                message.sender_type === 'client' ? 'text-blue-100' : 'text-gray-500'
              ]">
                {{ formatMessageTime(message.created_at) }}
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Zone de saisie -->
      <div v-if="selectedConversation" class="border-t border-gray-200 p-3">
        <form @submit.prevent="sendMessage" class="space-y-2">
          <!-- Fichiers sélectionnés -->
          <div v-if="selectedFiles.length > 0" class="space-y-1">
            <div 
              v-for="(file, index) in selectedFiles" 
              :key="index"
              class="flex items-center justify-between p-2 bg-gray-50 rounded text-xs"
            >
              <div class="flex items-center space-x-2">
                <PaperClipIcon class="w-3 h-3 text-gray-400" />
                <span class="truncate">{{ file.name }}</span>
              </div>
              <button 
                type="button" 
                @click="removeFile(index)"
                class="text-gray-400 hover:text-gray-600"
              >
                <XMarkIcon class="w-3 h-3" />
              </button>
            </div>
          </div>
          
          <!-- Zone de texte -->
          <div class="flex space-x-2">
            <div class="flex-1">
              <textarea
                v-model="newMessage"
                @keydown.enter.exact.prevent="sendMessage"
                @keydown.enter.shift.exact="newMessage += '\n'"
                placeholder="Tapez votre message..."
                rows="2"
                class="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
              ></textarea>
            </div>
            <div class="flex flex-col space-y-1">
              <!-- Bouton fichier -->
              <label class="cursor-pointer p-2 text-gray-400 hover:text-gray-600 rounded border border-gray-300 hover:bg-gray-50">
                <PaperClipIcon class="w-4 h-4" />
                <input 
                  type="file" 
                  multiple 
                  @change="onFileSelect"
                  class="hidden"
                  accept=".pdf,.doc,.docx,.txt,.jpg,.jpeg,.png,.gif"
                />
              </label>
              
              <!-- Bouton envoyer -->
              <button
                type="submit"
                :disabled="sending || (!newMessage.trim() && selectedFiles.length === 0)"
                class="p-2 bg-blue-600 text-white rounded hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <PaperAirplaneIcon class="w-4 h-4" />
              </button>
            </div>
          </div>
        </form>
        
        <!-- Indicateur de frappe -->
        <div v-if="isTyping" class="text-xs text-gray-500 mt-1">
          L'équipe Fusepoint est en train d'écrire...
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, computed, watch, nextTick, onMounted, onUnmounted } from 'vue'
import {
  ChatBubbleLeftRightIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  PaperClipIcon,
  PaperAirplaneIcon,
  XMarkIcon
} from '@heroicons/vue/24/outline'
import authService from '@/services/authService'

export default {
  name: 'ChatSidebar',
  components: {
    ChatBubbleLeftRightIcon,
    ChevronLeftIcon,
    ChevronRightIcon,
    PaperClipIcon,
    PaperAirplaneIcon,
    XMarkIcon
  },
  props: {
    contextType: {
      type: String,
      default: 'general' // 'service_request', 'recommendation', 'general'
    },
    contextId: {
      type: [String, Number],
      default: null
    },
    initialExpanded: {
      type: Boolean,
      default: false
    }
  },
  emits: ['conversation-selected', 'message-sent'],
  setup(props, { emit }) {
    const isExpanded = ref(props.initialExpanded)
    const loading = ref(false)
    const sending = ref(false)
    const isTyping = ref(false)
    
    const conversations = ref([])
    const selectedConversation = ref(null)
    const selectedConversationId = ref('')
    const messages = ref([])
    const newMessage = ref('')
    const selectedFiles = ref([])
    
    const messagesContainer = ref(null)
    
    let typingTimeout = null
    let pollInterval = null

    const toggleChat = () => {
      isExpanded.value = !isExpanded.value
    }

    const loadConversations = async () => {
      loading.value = true
      try {
        const params = new URLSearchParams()
        if (props.contextType) params.append('context_type', props.contextType)
        if (props.contextId) params.append('context_id', props.contextId)
        
        const response = await authService.getApiInstance().get(`/api/accompagnement/conversations?${params}`)
        if (response.data) {
          conversations.value = response.data
          
          // Sélectionner automatiquement la première conversation
          if (conversations.value.length > 0 && !selectedConversation.value) {
            selectConversation(conversations.value[0])
          }
        }
      } catch (error) {
        console.error('Erreur chargement conversations:', error)
        if (error.response?.status === 401) {
          console.log('Problème d\'authentification détecté dans loadConversations')
        }
      } finally {
        loading.value = false
      }
    }

    const selectConversation = async (conversation) => {
      selectedConversation.value = conversation
      selectedConversationId.value = conversation.id
      emit('conversation-selected', conversation)
      await loadMessages(conversation.id)
      await markAsRead(conversation.id)
    }

    const onConversationChange = () => {
      const conversation = conversations.value.find(c => c.id === selectedConversationId.value)
      if (conversation) {
        selectConversation(conversation)
      }
    }

    const loadMessages = async (conversationId) => {
      try {
        const response = await authService.getApiInstance().get(`/api/accompagnement/conversations/${conversationId}/messages`)
        if (response.data) {
          messages.value = response.data
          await nextTick()
          scrollToBottom()
        }
      } catch (error) {
        console.error('Erreur chargement messages:', error)
        if (error.response?.status === 401) {
          console.log('Problème d\'authentification détecté dans loadMessages')
        }
      }
    }

    const sendMessage = async () => {
      if ((!newMessage.value.trim() && selectedFiles.value.length === 0) || sending.value) {
        return
      }

      sending.value = true
      
      try {
        const formData = new FormData()
        formData.append('content', newMessage.value.trim())
        
        selectedFiles.value.forEach((file, index) => {
          formData.append(`files`, file)
        })

        const response = await authService.getApiInstance().post(`/api/accompagnement/conversations/${selectedConversation.value.id}/messages`, formData, {
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        })

        if (response.data) {
          messages.value.push(response.data)
          newMessage.value = ''
          selectedFiles.value = []
          
          emit('message-sent', response.data)
          
          await nextTick()
          scrollToBottom()
        }
      } catch (error) {
        console.error('Erreur envoi message:', error)
        if (error.response?.status === 401) {
          console.log('Problème d\'authentification détecté dans sendMessage')
        }
      } finally {
        sending.value = false
      }
    }

    const markAsRead = async (conversationId) => {
      try {
        await authService.getApiInstance().post(`/api/accompagnement/conversations/${conversationId}/read`)
        
        // Mettre à jour le compteur local
        const conversation = conversations.value.find(c => c.id === conversationId)
        if (conversation) {
          conversation.unread_count = 0
        }
      } catch (error) {
        console.error('Erreur marquage lecture:', error)
        if (error.response?.status === 401) {
          console.log('Problème d\'authentification détecté dans markAsRead')
        }
      }
    }

    const onFileSelect = (event) => {
      const files = Array.from(event.target.files)
      selectedFiles.value.push(...files)
      event.target.value = '' // Reset input
    }

    const removeFile = (index) => {
      selectedFiles.value.splice(index, 1)
    }

    const scrollToBottom = () => {
      if (messagesContainer.value) {
        messagesContainer.value.scrollTop = messagesContainer.value.scrollHeight
      }
    }

    const getConversationTitle = () => {
      if (selectedConversation.value) {
        return selectedConversation.value.title
      }
      return props.contextType === 'general' ? 'Support général' : 'Chat contextuel'
    }

    const getLastMessagePreview = (conversation) => {
      if (conversation.last_message) {
        return conversation.last_message.content.substring(0, 30) + '...'
      }
      return 'Aucun message'
    }

    const getAttachments = (attachments) => {
      if (typeof attachments === 'string') {
        try {
          return JSON.parse(attachments)
        } catch {
          return []
        }
      }
      return Array.isArray(attachments) ? attachments : []
    }

    const formatMessageTime = (timestamp) => {
      const date = new Date(timestamp)
      const now = new Date()
      const diffInHours = (now - date) / (1000 * 60 * 60)
      
      if (diffInHours < 24) {
        return date.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })
      } else {
        return date.toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit' })
      }
    }

    // Polling pour les nouveaux messages
    const startPolling = () => {
      pollInterval = setInterval(async () => {
        if (selectedConversation.value) {
          await loadMessages(selectedConversation.value.id)
        }
        await loadConversations()
      }, 10000) // Poll toutes les 10 secondes
    }

    const stopPolling = () => {
      if (pollInterval) {
        clearInterval(pollInterval)
        pollInterval = null
      }
    }

    // Watchers
    watch(() => props.contextId, () => {
      loadConversations()
    })

    // Lifecycle
    onMounted(() => {
      loadConversations()
      startPolling()
    })

    onUnmounted(() => {
      stopPolling()
      if (typingTimeout) {
        clearTimeout(typingTimeout)
      }
    })

    return {
      isExpanded,
      loading,
      sending,
      isTyping,
      conversations,
      selectedConversation,
      selectedConversationId,
      messages,
      newMessage,
      selectedFiles,
      messagesContainer,
      toggleChat,
      selectConversation,
      onConversationChange,
      sendMessage,
      onFileSelect,
      removeFile,
      getConversationTitle,
      getLastMessagePreview,
      getAttachments,
      formatMessageTime
    }
  }
}
</script>