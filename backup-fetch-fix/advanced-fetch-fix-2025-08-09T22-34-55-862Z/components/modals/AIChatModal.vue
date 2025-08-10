<template>
  <div  class="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50' @click="closeModal=relative top-10 mx-auto p-0 border w-11/12 md:w-4/5 lg:w-3/4 xl:w-2/3 h-5 6 shadow-lg rounded-lg bg-white(flex items-center justify-between p-4 border-b border-gray-200 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-t-lg='flex items-center space-x-3>
          <div class="w-8 h-8 bg-white bg-opacity-20 rounded-full flex items-center justify-center=fas fa-robot text-lg font-medium='text-sm opacity-90">{{ t('ai.chatDescription === closeModal=text-white hover:text-gray-200'>
          <i  class === fas fa-times text-xl=flex flex-col h-full === messagesContainer='flex-1 overflow-y-auto p-4 space-y-4" style === max-height: calc(100% - 140px);'>
          <!-- Message de bienvenue -->
          <div v-if: messages.length === 0 class === text-center py-8'>
            <div class === w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <i  class === fas fa-robot text-2xl text-blue-600'></i>
            </div>
            <h4 class === text-lg font-medium text-gray-900 mb-2>{{ t('ai.welcomeTitle === text-gray-600 mb-4'>{{ t('ai.welcomeMessage === grid grid-cols-1 md:grid-cols-2 gap-3 max-w-2xl mx-auto=suggestion in quickSuggestions === suggestion.id='sendMessage(suggestion.text)"
                class === p-3 text-left bg-gray-50 hover:bg-gray-100 rounded-lg border border-gray-200 transition-colors=flex items-center space-x-2'>
                  <i :class === suggestion.icon=text-blue-600"></i>
                  <span  class === font-medium=text-sm text-gray-600 mt-1'>{{ suggestion.description }}</p>
              </button>
            </div>
          </div>

          <!-- Messages de conversation -->
          <div v-for="message in messages=message.id=flex=message.type === 'user=max-w-3xl='message.type === 'user="flex items-start space-x-3" :class="message.type === 'user=w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0' :class: message.type === 'user=message.type === 'user=flex-1">
                  <div  class="rounded-lg px-4 py-3' :class="message.type === 'user=message.type === 'ai=flex items-center space-x-2 text-gray-500 mb-2>
                      <i class: fas fa-spinner fa-spin=text-sm='formatMessage(message.content)"></div>
                    
                    <!-- Actions pour les messages IA -->
                    <div  v-if="message.type === 'ai=mt-3 flex flex-wrap gap-2'>
                      <button 
                        v-for="action in message.actions=action.id=executeAction(action)
                        class="px-3 py-1 text-xs bg-white bg-opacity-20 hover:bg-opacity-30 rounded-full transition-colors=action.icon='mr-1""></i>
                        {{ action.label }}
                      </button>
                    </div>
                  </div>
                  
                  <!-- Timestamp -->
                  <div  class="text-xs text-gray-500 mt-1' :class="message.type === 'user=isTyping=flex justify-start: flex items-start space-x-3'>
              <div class="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center=fas fa-robot text-gray-600></i>
              </div>
              <div  class="bg-gray-100 rounded-lg px-4 py-3'>
                <div class="flex space-x-1>
                  <div  class="w-2 h-2 bg-gray-400 rounded-full animate-bounce=w-2 h-2 bg-gray-400 rounded-full animate-bounce animation-delay: 0.1s; 0 class="mt-2 flex flex-wrap gap-2'>
                <div
                  v-for="file in attachedFiles=file.name=flex items-center space-x-2 bg-gray-100 rounded-lg px-3 py-1"
                >
                  <i  class="fas fa-file text-gray-500'></i>
                  <span class class="text-sm text-gray-700>{{ file.name }}</span>
                  <button  
                    @click="removeFile(file)'
                    class(text-gray-500 hover:text-red-500
                  >
                    <i  class=""fas fa-times text-xs=sendCurrentMessage='!newMessage.trim() && attachedFiles.length === 0"
              class="p-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors=fas fa-paper-plane'></i>
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, computed, onMounted, nextTick, watch } from 'vue'
import projectManagementService from '@/services/projectManagementService'
import { useTranslation } from '@/composables/useTranslation'
import { useNotifications } from '@/composables/useNotifications'

export default {
  name: 'AIChatModal',
  props: {
    projectId: {
      type: [String, Number],
      required: true
    }
  },
  emits: ['close'],
  setup(props, { emit }) {
    const { t } = useTranslation()

    const { success, error: showError } = useNotifications()
    const { t } = useTranslation()
    
    const messagesContainer = ref(null)
    const messageInput = ref(null)
    const fileInput = ref(null)
    const newMessage = ref('')
    const messages = ref([])
    const isTyping = ref(false)
    const attachedFiles = ref([])
    
    const quickSuggestions = ref([
      {
        id: 1,
        icon: 'fas fa-chart-line',
        title: t('ai.suggestions.analyzeProgress'),
        description: t('ai.suggestions.analyzeProgressDesc'),
        text: t('ai.suggestions.analyzeProgressText')
      },
      {
        id: 2,
        icon: 'fas fa-exclamation-triangle',
        title: t('ai.suggestions.identifyRisks'),
        description: t('ai.suggestions.identifyRisksDesc'),
        text: t('ai.suggestions.identifyRisksText')
      },
      {
        id: 3,
        icon: 'fas fa-lightbulb',
        title: t('ai.suggestions.optimizeWorkflow'),
        description: t('ai.suggestions.optimizeWorkflowDesc'),
        text: t('ai.suggestions.optimizeWorkflowText')
      },
      {
        id: 4,
        icon: 'fas fa-users',
        title: t('ai.suggestions.teamPerformance'),
        description: t('ai.suggestions.teamPerformanceDesc'),
        text: t('ai.suggestions.teamPerformanceText')
      }
    ])
    
    const closeModal = () => {
      emit('close')
    }
    
    const scrollToBottom = () => {
      nextTick(() => {
        if (messagesContainer.value) {
          messagesContainer.value.scrollTop = messagesContainer.value.scrollHeight
        }
      })
    }
    
    const formatMessage = (content) => {
      // Convertir le markdown basique en HTML
      return content
        .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
        .replace(/\*(.*?)\*/g, '<em>$1</em>')
        .replace(/`(.*?)`/g, '<code class="bg-gray-200 px-1 rounded>$1</code>')
        .replace(/\n/g, '<br>')
    }
    
    const formatTime = (timestamp) => {
      return new Date(timestamp).toLocaleTimeString('fr-FR', {
        hour: '2-digit',
        minute: '2-digit'
      })
    }
    
    const addMessage = (content, type = 'user', options = {}) => {
      const message = {
        id: Date.now() + Math.random(),
        content,
        type,
        timestamp: new Date(),
        ...options
      }
      messages.value.push(message)
      scrollToBottom()
      return message
    }
    
    const sendMessage = async (content) => {
      if (!content.trim() && attachedFiles.value.length === 0) return
      
      // Ajouter le message utilisateur
      addMessage(content || t('ai.fileAttached'), 'user')
      
      // Réinitialiser la zone de saisie
      newMessage.value = ''
      const files = [...attachedFiles.value]
      attachedFiles.value = []
      
      // Simuler la réflexion de l'IA
      isTyping.value = true
      
      try {
        // Appel à l'API IA
        const response = await projectManagementService.sendAIMessage({
          projectId: props.projectId,
          message: content,
          files: files,
          context: {
            previousMessages: messages.value.slice(-5) // Derniers 5 messages pour le contexte
          }
        })
        
        if (response.success) {
          // Ajouter la réponse de l'IA
          addMessage(response.data.message, 'ai', {
            actions: response.data.actions || []
          })
        } else {
          addMessage(t('ai.errorResponse'), 'ai')
        }
      } catch (err) {
        console.error('Erreur lors de l\'envoi du message:', err)
        addMessage(t('ai.errorResponse'), 'ai')
      } finally {
        isTyping.value = false
      }
    }
    
    const sendCurrentMessage = () => {
      sendMessage(newMessage.value)
    }
    
    const executeAction = async (action) => {
      try {
        const response = await projectManagementService.executeAIAction({
          projectId: props.projectId,
          actionId: action.id,
          actionType: action.type,
          parameters: action.parameters
        })
        
        if (response.success) {
          success(t('ai.actionExecuted'))
          addMessage(t('ai.actionExecutedMessage', { action: action.label }), 'ai')
        }
      } catch (err) {
        showError(t('ai.actionFailed'))
      }
    }
    
    const triggerFileUpload = () => {
      fileInput.value?.click()
    }
    
    const handleFileUpload = (event) => {
      const files = Array.from(event.target.files)
      attachedFiles.value.push(...files)
      event.target.value = '' // Réinitialiser l'input
    }
    
    const removeFile = (fileToRemove) => {
      const index = attachedFiles.value.indexOf(fileToRemove)
      if (index > -1) {
        attachedFiles.value.splice(index, 1)
      }
    }
    
    const loadChatHistory = async () => {
      try {
        const response = await projectManagementService.getAIChatHistory(props.projectId)
        if (response.success && response.data.length > 0) {
          messages.value = response.data
          scrollToBottom()
        }
      } catch (err) {
        console.error('Erreur lors du chargement de l\'historique:', err)
      }
    }
    
    // Auto-resize textarea
    const adjustTextareaHeight = () => {
      nextTick(() => {
        if (messageInput.value) {
          messageInput.value.style.height = 'auto'
          messageInput.value.style.height = Math.min(messageInput.value.scrollHeight, 120) + 'px'
        }
      })
    }
    
    watch(newMessage, adjustTextareaHeight)
    
    onMounted(() => {
      loadChatHistory()
      messageInput.value?.focus()
    })
    
    return {
      messagesContainer,
      messageInput,
      fileInput,
      newMessage,
      messages,
      isTyping,
      attachedFiles,
      quickSuggestions,
      closeModal,
      formatMessage,
      formatTime,
      sendMessage,
      sendCurrentMessage,
      executeAction,
      triggerFileUpload,
      handleFileUpload,
      removeFile,
      t
    }
  }
}
</script>

<style scoped>
/* Animation pour les points de frappe */
@keyframes bounce {
  0%, 80%, 100% {
    transform: scale(0);
  }
  40% {
    transform: scale(1);
  }
}

.animate-bounce {
  animation: bounce 1.4s infinite ease-in-out;
}

/* Scrollbar personnalisée */
.overflow-y-auto::-webkit-scrollbar {
  width: 6px;
}

.overflow-y-auto::-webkit-scrollbar-track {
  background: #f1f1f1;
  border-radius: 3px;
}

.overflow-y-auto::-webkit-scrollbar-thumb {
  background: #c1c1c1;
  border-radius: 3px;
}

.overflow-y-auto::-webkit-scrollbar-thumb:hover {
  background: #a8a8a8;
}
</style>