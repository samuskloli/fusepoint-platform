<template>
  <BaseWidget 
    :widget="widgetConfig"
    :loading="loading"
    :error="error"
    @configure="showConfigModal = true"
    @toggle="toggleWidget"
    @retry="loadAIData"
  >
    <div class="ai-widget">
      <!-- En-tête avec statistiques -->
      <div class="ai-header">
        <div class="header-left">
          <div class="ai-stats">
            <div class="stat-item">
              <span class="stat-value">{{ totalQueries }}</span>
              <span class="stat-label">{{ t('widgets.ai.totalQueries') }}</span>
            </div>
            <div class="stat-divider"></div>
            <div class="stat-item">
              <span class="stat-value">{{ todayQueries }}</span>
              <span class="stat-label">{{ t('widgets.ai.todayQueries') }}</span>
            </div>
            <div class="stat-divider"></div>
            <div class="stat-item">
              <span class="stat-value">{{ averageResponseTime }}ms</span>
              <span class="stat-label">{{ t('widgets.ai.avgResponseTime') }}</span>
            </div>
          </div>
        </div>
        
        <div class="header-right">
          <div class="view-controls">
            <button 
              @click="viewMode = 'chat'"
              :class="{ active: viewMode === 'chat' }"
              class="view-btn"
            >
              <i class="fas fa-comments"></i>
            </button>
            <button 
              @click="viewMode = 'history'"
              :class="{ active: viewMode === 'history' }"
              class="view-btn"
            >
              <i class="fas fa-history"></i>
            </button>
            <button 
              @click="viewMode = 'analytics'"
              :class="{ active: viewMode === 'analytics' }"
              class="view-btn"
            >
              <i class="fas fa-chart-bar"></i>
            </button>
          </div>
          
          <button 
            @click="clearHistory"
            class="clear-btn"
            :disabled="conversations.length === 0"
          >
            <i class="fas fa-trash mr-2"></i>
            {{ t('widgets.ai.clearHistory') }}
          </button>
        </div>
      </div>
      
      <!-- Vue Chat -->
      <div v-if="viewMode === 'chat'" class="chat-view">
        <!-- Zone de conversation -->
        <div class="chat-container">
          <div class="chat-messages" ref="chatMessages">
            <div 
              v-for="message in currentConversation"
              :key="message.id"
              class="message"
              :class="{ 'user-message': message.role === 'user', 'ai-message': message.role === 'assistant' }"
            >
              <div class="message-avatar">
                <i v-if="message.role === 'user'" class="fas fa-user"></i>
                <i v-else class="fas fa-robot"></i>
              </div>
              
              <div class="message-content">
                <div class="message-header">
                  <span class="message-role">{{ message.role === 'user' ? t('widgets.ai.you') : t('widgets.ai.assistant') }}</span>
                  <span class="message-time">{{ formatTime(message.timestamp) }}</span>
                </div>
                
                <div class="message-text" v-html="formatMessage(message.content)"></div>
                
                <div v-if="message.role === 'assistant'" class="message-actions">
                  <button 
                    @click="copyMessage(message.content)"
                    class="action-btn"
                    :title="t('widgets.ai.copyMessage')"
                  >
                    <i class="fas fa-copy"></i>
                  </button>
                  
                  <button 
                    @click="regenerateResponse(message)"
                    class="action-btn"
                    :title="t('widgets.ai.regenerate')"
                  >
                    <i class="fas fa-redo"></i>
                  </button>
                  
                  <button 
                    @click="rateMessage(message, 'positive')"
                    class="action-btn"
                    :class="{ active: message.rating === 'positive' }"
                    :title="t('widgets.ai.thumbsUp')"
                  >
                    <i class="fas fa-thumbs-up"></i>
                  </button>
                  
                  <button 
                    @click="rateMessage(message, 'negative')"
                    class="action-btn"
                    :class="{ active: message.rating === 'negative' }"
                    :title="t('widgets.ai.thumbsDown')"
                  >
                    <i class="fas fa-thumbs-down"></i>
                  </button>
                </div>
              </div>
            </div>
            
            <!-- Message de chargement -->
            <div v-if="isTyping" class="message ai-message typing">
              <div class="message-avatar">
                <i class="fas fa-robot"></i>
              </div>
              <div class="message-content">
                <div class="typing-indicator">
                  <span></span>
                  <span></span>
                  <span></span>
                </div>
              </div>
            </div>
          </div>
          
          <!-- Zone de saisie -->
          <div class="chat-input-container">
            <div class="input-wrapper">
              <textarea 
                v-model="currentMessage"
                @keydown.enter.prevent="handleEnterKey"
                @input="adjustTextareaHeight"
                ref="messageInput"
                :placeholder="t('widgets.ai.messagePlaceholder')"
                :disabled="isTyping"
                class="message-input"
                rows="1"
              ></textarea>
              
              <div class="input-actions">
                <button 
                  @click="attachFile"
                  class="attach-btn"
                  :title="t('widgets.ai.attachFile')"
                >
                  <i class="fas fa-paperclip"></i>
                </button>
                
                <button 
                  @click="sendMessage"
                  :disabled="!currentMessage.trim() || isTyping"
                  class="send-btn"
                >
                  <i class="fas fa-paper-plane"></i>
                </button>
              </div>
            </div>
            
            <!-- Suggestions rapides -->
            <div v-if="quickSuggestions.length > 0 && currentConversation.length === 0" class="quick-suggestions">
              <button 
                v-for="suggestion in quickSuggestions"
                :key="suggestion.id"
                @click="useSuggestion(suggestion.text)"
                class="suggestion-btn"
              >
                <i :class="suggestion.icon" class="mr-2"></i>
                {{ suggestion.text }}
              </button>
            </div>
          </div>
        </div>
      </div>
      
      <!-- Vue Historique -->
      <div v-if="viewMode === 'history'" class="history-view">
        <div class="history-header">
          <h4 class="history-title">{{ t('widgets.ai.conversationHistory') }}</h4>
          
          <div class="history-filters">
            <input 
              v-model="historySearch"
              type="text"
              :placeholder="t('widgets.ai.searchHistory')"
              class="search-input"
            >
            
            <select v-model="historyFilter" class="filter-select">
              <option value="all">{{ t('widgets.ai.allConversations') }}</option>
              <option value="today">{{ t('widgets.ai.today') }}</option>
              <option value="week">{{ t('widgets.ai.thisWeek') }}</option>
              <option value="month">{{ t('widgets.ai.thisMonth') }}</option>
            </select>
          </div>
        </div>
        
        <div class="history-list">
          <div 
            v-for="conversation in filteredConversations"
            :key="conversation.id"
            class="history-item"
            @click="loadConversation(conversation)"
          >
            <div class="history-item-header">
              <h5 class="conversation-title">{{ conversation.title || t('widgets.ai.untitledConversation') }}</h5>
              <span class="conversation-date">{{ formatDate(conversation.created_at) }}</span>
            </div>
            
            <p class="conversation-preview">{{ getConversationPreview(conversation) }}</p>
            
            <div class="conversation-meta">
              <span class="message-count">
                <i class="fas fa-comments mr-1"></i>
                {{ conversation.messages.length }} {{ t('widgets.ai.messages') }}
              </span>
              
              <span class="conversation-duration">
                <i class="fas fa-clock mr-1"></i>
                {{ getConversationDuration(conversation) }}
              </span>
            </div>
          </div>
        </div>
        
        <div v-if="filteredConversations.length === 0" class="no-history">
          <i class="fas fa-history text-gray-400 text-4xl mb-3"></i>
          <h5 class="text-gray-600 mb-2">{{ t('widgets.ai.noHistory') }}</h5>
          <p class="text-gray-500 text-sm">{{ t('widgets.ai.noHistoryDescription') }}</p>
        </div>
      </div>
      
      <!-- Vue Analytics -->
      <div v-if="viewMode === 'analytics'" class="analytics-view">
        <div class="analytics-grid">
          <!-- Graphique d'utilisation -->
          <div class="analytics-card">
            <h4 class="card-title">{{ t('widgets.ai.usageChart') }}</h4>
            <div class="chart-container">
              <!-- Ici vous pouvez intégrer un graphique avec Chart.js ou similaire -->
              <div class="placeholder-chart">
                <i class="fas fa-chart-line text-gray-400 text-3xl mb-2"></i>
                <p class="text-gray-500 text-sm">{{ t('widgets.ai.chartPlaceholder') }}</p>
              </div>
            </div>
          </div>
          
          <!-- Top des requêtes -->
          <div class="analytics-card">
            <h4 class="card-title">{{ t('widgets.ai.topQueries') }}</h4>
            <div class="top-queries">
              <div 
                v-for="(query, index) in topQueries"
                :key="index"
                class="query-item"
              >
                <span class="query-rank">{{ index + 1 }}</span>
                <span class="query-text">{{ query.text }}</span>
                <span class="query-count">{{ query.count }}</span>
              </div>
            </div>
          </div>
          
          <!-- Statistiques détaillées -->
          <div class="analytics-card">
            <h4 class="card-title">{{ t('widgets.ai.detailedStats') }}</h4>
            <div class="stats-grid">
              <div class="stat-detail">
                <span class="stat-label">{{ t('widgets.ai.totalTokens') }}</span>
                <span class="stat-value">{{ totalTokens.toLocaleString() }}</span>
              </div>
              
              <div class="stat-detail">
                <span class="stat-label">{{ t('widgets.ai.avgTokensPerQuery') }}</span>
                <span class="stat-value">{{ averageTokensPerQuery }}</span>
              </div>
              
              <div class="stat-detail">
                <span class="stat-label">{{ t('widgets.ai.successRate') }}</span>
                <span class="stat-value">{{ successRate }}%</span>
              </div>
              
              <div class="stat-detail">
                <span class="stat-label">{{ t('widgets.ai.favoriteModel') }}</span>
                <span class="stat-value">{{ favoriteModel }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    
    <!-- Modal de configuration -->
    <WidgetConfigModal 
      v-if="showConfigModal"
      :widget="widgetConfig"
      :options="configOptions"
      @close="showConfigModal = false"
      @save="updateConfig"
    />
  </BaseWidget>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, nextTick, watch } from 'vue'
import BaseWidget from './shared/components/BaseWidget.vue'
import WidgetConfigModal from '../modals/WidgetConfigModal.vue'
import aiService from '@/services/aiService'
import { useTranslation } from '@/composables/useTranslation'
import { useNotifications } from '@/composables/useNotifications'
  import { sanitizeBasic } from '@/utils/sanitize'

// Interfaces TypeScript
interface Message {
  id: number
  role: 'user' | 'assistant'
  content: string
  timestamp: string
  responseTime?: number
  model?: string
  tokens?: number
  rating?: string
}

interface Conversation {
  id: number
  title: string
  messages: Message[]
  created_at: string
  updated_at?: string
}

interface AIConfig {
  model: string
  temperature: number
  maxTokens: number
  enableHistory: boolean
}

interface WidgetConfig {
  id: string
  name: string
  icon: string
  titleKey: string
  isEnabled: boolean
  model: string
  temperature: number
  maxTokens: number
  enableHistory: boolean
}

interface QuickSuggestion {
  id: number
  text: string
  icon: string
}

interface ConfigOption {
  key: string
  type: string
  label: string
  options?: Array<{ value: string; label: string }>
  min?: number
  max?: number
  step?: number
}

// Props
interface Props {
  projectId: string
  widgetData?: any
  widget?: any
}

const props = defineProps<Props>()

// Emits
const emit = defineEmits<{
  'widget-updated': [widget: any]
}>()

// Composables
const { success, error: showError } = useNotifications()
const { t } = useTranslation()
    
    // État réactif
    const loading = ref<boolean>(false)
    const error = ref<string | null>(null)
    const viewMode = ref<'chat' | 'history' | 'analytics'>('chat')
    const currentMessage = ref<string>('')
    const currentConversation = ref<Message[]>([])
    const conversations = ref<Conversation[]>([])
    const isTyping = ref<boolean>(false)
    const historySearch = ref<string>('')
    const historyFilter = ref<string>('all')
    const showConfigModal = ref<boolean>(false)
    
    // Références DOM
    const chatMessages = ref<HTMLElement | null>(null)
    const messageInput = ref<HTMLTextAreaElement | null>(null)
    
    // Configuration du widget
    const widgetConfig = ref<WidgetConfig>({
      id: 'ai-assistant',
      name: 'Assistant IA',
      icon: 'fas fa-robot',
      titleKey: 'widgets.ai.title',
      isEnabled: props.widget?.is_enabled ?? true,
      model: props.widget?.model ?? 'gpt-3.5-turbo',
      temperature: props.widget?.temperature ?? 0.7,
      maxTokens: props.widget?.max_tokens ?? 1000,
      enableHistory: props.widget?.enable_history ?? true
    })
    
    // Options de configuration
    const configOptions = ref<ConfigOption[]>([
      {
        key: 'model',
        type: 'select',
        label: 'Modèle IA',
        options: [
          { value: 'gpt-3.5-turbo', label: 'GPT-3.5 Turbo' },
          { value: 'gpt-4', label: 'GPT-4' },
          { value: 'claude-3', label: 'Claude 3' }
        ],
        default: 'gpt-3.5-turbo'
      },
      {
        key: 'maxTokens',
        type: 'number',
        label: 'Tokens maximum',
        min: 100,
        max: 4000,
        default: 2000
      },
      {
        key: 'temperature',
        type: 'range',
        label: 'Créativité (Temperature)',
        min: 0,
        max: 1,
        step: 0.1,
        default: 0.7
      },
      {
        key: 'enableHistory',
        type: 'boolean',
        label: 'Activer l\'historique',
        default: true
      },
      {
        key: 'enableAnalytics',
        type: 'boolean',
        label: 'Activer les analytics',
        default: true
      }
    ])
    
    // Suggestions rapides
    const quickSuggestions = ref<QuickSuggestion[]>([
      {
        id: 1,
        text: t('widgets.ai.suggestions.projectSummary'),
        icon: 'fas fa-project-diagram'
      },
      {
        id: 2,
        text: t('widgets.ai.suggestions.taskHelp'),
        icon: 'fas fa-tasks'
      },
      {
        id: 3,
        text: t('widgets.ai.suggestions.codeReview'),
        icon: 'fas fa-code'
      },
      {
        id: 4,
        text: t('widgets.ai.suggestions.documentation'),
        icon: 'fas fa-file-alt'
      }
    ])
    
    // Propriétés calculées
    const totalQueries = computed((): number => {
      return conversations.value.reduce((total: number, conv: Conversation) => 
        total + conv.messages.filter((m: Message) => m.role === 'user').length, 0)
    })
    
    const todayQueries = computed((): number => {
      const today = new Date().toDateString()
      return conversations.value.reduce((total: number, conv: Conversation) => {
        return total + conv.messages.filter((m: Message) => 
          m.role === 'user' && new Date(m.timestamp).toDateString() === today
        ).length
      }, 0)
    })
    
    const averageResponseTime = computed((): number => {
      const responseTimes = conversations.value.flatMap((conv: Conversation) => 
        conv.messages.filter((m: Message) => m.role === 'assistant' && m.responseTime)
          .map((m: Message) => m.responseTime!)
      )
      
      if (responseTimes.length === 0) return 0
      return Math.round(responseTimes.reduce((sum: number, time: number) => sum + time, 0) / responseTimes.length)
    })
    
    const filteredConversations = computed((): Conversation[] => {
      let filtered = [...conversations.value]
      
      // Filtrer par recherche
      if (historySearch.value) {
        const query = historySearch.value.toLowerCase()
        filtered = filtered.filter((conv: Conversation) => 
          conv.title?.toLowerCase().includes(query) ||
          conv.messages.some((m: Message) => m.content.toLowerCase().includes(query))
        )
      }
      
      // Filtrer par période
      if (historyFilter.value !== 'all') {
        const now = new Date()
        const filterDate = new Date()
        
        switch (historyFilter.value) {
          case 'today':
            filterDate.setHours(0, 0, 0, 0)
            break
          case 'week':
            filterDate.setDate(now.getDate() - 7)
            break
          case 'month':
            filterDate.setMonth(now.getMonth() - 1)
            break
        }
        
        filtered = filtered.filter((conv: Conversation) => new Date(conv.created_at) >= filterDate)
      }
      
      return filtered.sort((a: Conversation, b: Conversation) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
    })
    
    const topQueries = computed((): Array<{ text: string; count: number }> => {
      const queryCount: Record<string, number> = {}
      
      conversations.value.forEach((conv: Conversation) => {
        conv.messages.filter((m: Message) => m.role === 'user').forEach((message: Message) => {
          const query = message.content.toLowerCase().trim()
          queryCount[query] = (queryCount[query] || 0) + 1
        })
      })
      
      return Object.entries(queryCount)
        .map(([text, count]) => ({ text, count }))
        .sort((a, b) => (b.count as number) - (a.count as number))
        .slice(0, 10)
    })
    
    const totalTokens = computed((): number => {
      return conversations.value.reduce((total: number, conv: Conversation) => {
        return total + conv.messages.reduce((convTotal: number, message: Message) => {
          return convTotal + (message.tokens || 0)
        }, 0)
      }, 0)
    })
    
    const averageTokensPerQuery = computed((): number => {
      const userMessages = conversations.value.flatMap((conv: Conversation) => 
        conv.messages.filter((m: Message) => m.role === 'user')
      )
      
      if (userMessages.length === 0) return 0
      return Math.round(totalTokens.value / userMessages.length)
    })
    
    const successRate = computed((): number => {
      const totalMessages = conversations.value.flatMap((conv: Conversation) => conv.messages)
      const successfulMessages = totalMessages.filter((m: Message) => !(m as any).error)
      
      if (totalMessages.length === 0) return 100
      return Math.round((successfulMessages.length / totalMessages.length) * 100)
    })
    
    const favoriteModel = computed((): string => {
      const modelCount: Record<string, number> = {}
      
      conversations.value.forEach((conv: Conversation) => {
        conv.messages.filter((m: Message) => m.role === 'assistant').forEach((message: Message) => {
          const model = message.model || widgetConfig.value.model
          modelCount[model] = (modelCount[model] || 0) + 1
        })
      })
      
      const entries = Object.entries(modelCount)
      if (entries.length === 0) return widgetConfig.value.model
      
      return entries.reduce((a, b) => (a[1] as number) > (b[1] as number) ? a : b)[0]
    })
    
    // Méthodes
    const loadAIData = async (): Promise<void> => {
      loading.value = true
      error.value = null
      
      try {
        const result = await aiService.getConversations(props.projectId)
        if (result.success) {
          conversations.value = result.data
        } else {
          error.value = result.error
        }
      } catch (err) {
        error.value = t('errors.loadingFailed')
      } finally {
        loading.value = false
      }
    }
    
    const toggleWidget = (): void => {
      widgetConfig.value.isEnabled = !widgetConfig.value.isEnabled
      const updatedWidget = {
        ...props.widget,
        is_enabled: widgetConfig.value.isEnabled
      }
      emit('widget-updated', updatedWidget)
    }
    
    const sendMessage = async (): Promise<void> => {
      if (!currentMessage.value.trim() || isTyping.value) return
      
      const userMessage: Message = {
        id: Date.now(),
        role: 'user',
        content: currentMessage.value.trim(),
        timestamp: new Date().toISOString()
      }
      
      currentConversation.value.push(userMessage)
      const messageToSend = currentMessage.value.trim()
      currentMessage.value = ''
      
      // Ajuster la hauteur du textarea
      nextTick(() => {
        adjustTextareaHeight()
        scrollToBottom()
      })
      
      isTyping.value = true
      
      try {
        const startTime = Date.now()
        const result = await aiService.sendMessage({
          message: messageToSend,
          conversation: currentConversation.value,
          projectId: props.projectId,
          config: {
            model: widgetConfig.value.model,
            maxTokens: widgetConfig.value.maxTokens,
            temperature: widgetConfig.value.temperature
          }
        })
        
        const responseTime = Date.now() - startTime
        
        if (result.success) {
          const aiMessage: Message = {
            id: Date.now() + 1,
            role: 'assistant',
            content: result.data.content,
            timestamp: new Date().toISOString(),
            responseTime,
            model: result.data.model,
            tokens: result.data.tokens
          }
          
          currentConversation.value.push(aiMessage)
          
          // Sauvegarder la conversation
          if (widgetConfig.value.enableHistory) {
            await saveConversation()
          }
        } else {
          showError(result.error)
        }
      } catch (err) {
        showError(t('widgets.ai.sendError'))
      } finally {
        isTyping.value = false
        nextTick(() => scrollToBottom())
      }
    }
    
    const handleEnterKey = (event: KeyboardEvent): void => {
      if (event.shiftKey) {
        // Shift + Enter = nouvelle ligne
        return
      }
      
      event.preventDefault()
      sendMessage()
    }
    
    const adjustTextareaHeight = (): void => {
      const textarea = messageInput.value
      if (textarea) {
        textarea.style.height = 'auto'
        textarea.style.height = Math.min(textarea.scrollHeight, 120) + 'px'
      }
    }
    
    const scrollToBottom = (): void => {
      nextTick(() => {
        if (chatMessages.value) {
          chatMessages.value.scrollTop = chatMessages.value.scrollHeight
        }
      })
    }
    
    const useSuggestion = (suggestion: string): void => {
      currentMessage.value = suggestion
      nextTick(() => {
        messageInput.value?.focus()
        adjustTextareaHeight()
      })
    }
    
    const copyMessage = async (content: string): Promise<void> => {
      try {
        await navigator.clipboard.writeText(content)
        success(t('widgets.ai.messageCopied'))
      } catch (err) {
        showError(t('widgets.ai.copyError'))
      }
    }
    
    const regenerateResponse = async (message: Message): Promise<void> => {
      // Trouver le message utilisateur précédent
      const messageIndex = currentConversation.value.findIndex(m => m.id === message.id)
      if (messageIndex > 0) {
        const userMessage = currentConversation.value[messageIndex - 1]
        
        // Supprimer la réponse actuelle
        currentConversation.value.splice(messageIndex, 1)
        
        // Renvoyer le message
        currentMessage.value = userMessage.content
        await sendMessage()
      }
    }
    
    const rateMessage = async (message: Message, rating: string): Promise<void> => {
      try {
        message.rating = message.rating === rating ? undefined : rating
        
        const result = await aiService.rateMessage(message.id, message.rating)
        if (result.success) {
          success(t('widgets.ai.ratingSubmitted'))
        }
      } catch (err) {
        showError(t('widgets.ai.ratingError'))
      }
    }
    
    const attachFile = (): void => {
      // Implémentation de l'attachement de fichier
      showError(t('widgets.ai.featureNotImplemented'))
    }
    
    const clearHistory = async () => {
      if (!confirm(t('widgets.ai.confirmClearHistory'))) return
      
      try {
        const result = await aiService.clearHistory(props.projectId)
        if (result.success) {
          conversations.value = []
          currentConversation.value = []
          success(t('widgets.ai.historyCleared'))
        } else {
          showError(result.error)
        }
      } catch (err) {
        showError(t('widgets.ai.clearError'))
      }
    }
    
    const loadConversation = (conversation: Conversation): void => {
      currentConversation.value = [...conversation.messages]
      viewMode.value = 'chat'
      nextTick(() => scrollToBottom())
    }
    
    const saveConversation = async () => {
      try {
        const conversationData = {
          projectId: props.projectId,
          messages: currentConversation.value,
          title: generateConversationTitle(currentConversation.value[0]?.content)
        }
        
        const result = await aiService.saveConversation(conversationData)
        if (result.success) {
          // Mettre à jour la liste des conversations
          const existingIndex = conversations.value.findIndex(c => c.id === result.data.id)
          if (existingIndex !== -1) {
            conversations.value[existingIndex] = result.data
          } else {
            conversations.value.unshift(result.data)
          }
        }
      } catch (err) {
        console.error('Erreur lors de la sauvegarde:', err)
      }
    }
    
    const generateConversationTitle = (firstMessage: string): string => {
      if (!firstMessage) return t('widgets.ai.untitledConversation')
      
      const words = firstMessage.split(' ').slice(0, 6)
      return words.join(' ') + (firstMessage.split(' ').length > 6 ? '...' : '')
    }
    
    const getConversationPreview = (conversation: Conversation): string => {
      const lastMessage = conversation.messages[conversation.messages.length - 1]
      if (!lastMessage) return ''
      
      const preview = lastMessage.content.substring(0, 100)
      return preview + (lastMessage.content.length > 100 ? '...' : '')
    }
    
    const getConversationDuration = (conversation: Conversation): string => {
      if (conversation.messages.length < 2) return '0 min'
      
      const start = new Date(conversation.messages[0].timestamp)
      const end = new Date(conversation.messages[conversation.messages.length - 1].timestamp)
      const duration = Math.round((end.getTime() - start.getTime()) / (1000 * 60))
      
      return duration + ' min'
    }
    
    const formatMessage = (content: string): string => {
      if (!content) return ''
      // Formatage basique du markdown, puis sanitization stricte
      const html = content
        .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
        .replace(/\*(.*?)\*/g, '<em>$1</em>')
        .replace(/`(.*?)`/g, '<code>$1</code>')
        .replace(/\n/g, '<br>')
      return sanitizeBasic(html)
    }
    
    const formatTime = (timestamp: string): string => {
      return new Date(timestamp).toLocaleTimeString('fr-FR', {
        hour: '2-digit',
        minute: '2-digit'
      })
    }
    
    const formatDate = (timestamp: string): string => {
      return new Date(timestamp).toLocaleDateString('fr-FR', {
        day: 'numeric',
        month: 'short',
        hour: '2-digit',
        minute: '2-digit'
      })
    }
    
    const updateConfig = (newConfig: Partial<WidgetConfig>): void => {
      widgetConfig.value = { ...widgetConfig.value, ...newConfig }
      emit('widget-updated', widgetConfig.value)
      showConfigModal.value = false
    }
    
    // Lifecycle
    onMounted(() => {
      loadAIData()
    })
    
    // Watchers
    watch(() => currentConversation.value.length, () => {
      nextTick(() => scrollToBottom())
    })
    
    // Lifecycle hooks
    onMounted(() => {
      loadAIData()
      
      // Auto-focus sur l'input de message
      nextTick(() => {
        if (messageInput.value) {
          messageInput.value.focus()
        }
      })
    })
    
    // Watchers
    watch(() => props.widget, (newWidget) => {
      if (newWidget) {
        widgetConfig.value = {
          ...widgetConfig.value,
          ...newWidget
        }
      }
    }, { deep: true })
</script>

<style scoped>
.ai-widget {
  @apply space-y-4;
}

.ai-header {
  @apply flex items-center justify-between;
}

.header-left {
  @apply flex items-center;
}

.ai-stats {
  @apply flex items-center space-x-4;
}

.stat-item {
  @apply text-center;
}

.stat-value {
  @apply block text-2xl font-bold text-gray-900;
}

.stat-label {
  @apply block text-sm text-gray-500;
}

.stat-divider {
  @apply w-px h-8 bg-gray-200;
}

.header-right {
  @apply flex items-center space-x-3;
}

.view-controls {
  @apply flex items-center space-x-1 bg-gray-100 rounded-lg p-1;
}

.view-btn {
  @apply p-2 rounded-md text-gray-500 hover:text-gray-700 transition-colors;
}

.view-btn.active {
  @apply bg-white text-blue-600 shadow-sm;
}

.clear-btn {
  @apply bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors flex items-center disabled:opacity-50 disabled:cursor-not-allowed;
}

.chat-view {
  @apply bg-white rounded-lg border border-gray-200 overflow-hidden;
}

.chat-container {
  @apply flex flex-col h-96;
}

.chat-messages {
  @apply flex-1 overflow-y-auto p-4 space-y-4;
}

.message {
  @apply flex space-x-3;
}

.user-message {
  @apply flex-row-reverse space-x-reverse;
}

.message-avatar {
  @apply w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center text-gray-600 flex-shrink-0;
}

.user-message .message-avatar {
  @apply bg-blue-600 text-white;
}

.ai-message .message-avatar {
  @apply bg-green-600 text-white;
}

.message-content {
  @apply flex-1 max-w-xs sm:max-w-md;
}

.user-message .message-content {
  @apply text-right;
}

.message-header {
  @apply flex items-center justify-between mb-1;
}

.user-message .message-header {
  @apply flex-row-reverse;
}

.message-role {
  @apply text-sm font-medium text-gray-700;
}

.message-time {
  @apply text-xs text-gray-500;
}

.message-text {
  @apply bg-gray-100 rounded-lg px-3 py-2 text-sm;
}

.user-message .message-text {
  @apply bg-blue-600 text-white;
}

.message-actions {
  @apply flex items-center space-x-2 mt-2;
}

.action-btn {
  @apply p-1 rounded text-gray-400 hover:text-gray-600 transition-colors;
}

.action-btn.active {
  @apply text-blue-600;
}

.typing {
  @apply opacity-75;
}

.typing-indicator {
  @apply flex space-x-1 p-3;
}

.typing-indicator span {
  @apply w-2 h-2 bg-gray-400 rounded-full animate-pulse;
}

.typing-indicator span:nth-child(2) {
  animation-delay: 0.2s;
}

.typing-indicator span:nth-child(3) {
  animation-delay: 0.4s;
}

.chat-input-container {
  @apply border-t border-gray-200 p-4;
}

.input-wrapper {
  @apply flex items-end space-x-2;
}

.message-input {
  @apply flex-1 resize-none border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent;
}

.input-actions {
  @apply flex items-center space-x-2;
}

.attach-btn {
  @apply p-2 text-gray-500 hover:text-gray-700 transition-colors;
}

.send-btn {
  @apply bg-blue-600 text-white p-2 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed;
}

.quick-suggestions {
  @apply flex flex-wrap gap-2 mt-3;
}

.suggestion-btn {
  @apply bg-gray-100 text-gray-700 px-3 py-2 rounded-lg hover:bg-gray-200 transition-colors text-sm flex items-center;
}

.history-view {
  @apply space-y-4;
}

.history-header {
  @apply flex items-center justify-between;
}

.history-title {
  @apply text-lg font-semibold text-gray-900;
}

.history-filters {
  @apply flex items-center space-x-3;
}

.search-input {
  @apply px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent;
}

.filter-select {
  @apply px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent;
}

.history-list {
  @apply space-y-3;
}

.history-item {
  @apply bg-white border border-gray-200 rounded-lg p-4 cursor-pointer hover:shadow-md transition-shadow;
}

.history-item-header {
  @apply flex items-center justify-between mb-2;
}

.conversation-title {
  @apply font-medium text-gray-900;
}

.conversation-date {
  @apply text-sm text-gray-500;
}

.conversation-preview {
  @apply text-sm text-gray-600 mb-3;
}

.conversation-meta {
  @apply flex items-center space-x-4 text-sm text-gray-500;
}

.message-count,
.conversation-duration {
  @apply flex items-center;
}

.no-history {
  @apply text-center py-8;
}

.analytics-view {
  @apply space-y-6;
}

.analytics-grid {
  @apply grid grid-cols-1 lg:grid-cols-2 gap-6;
}

.analytics-card {
  @apply bg-white border border-gray-200 rounded-lg p-6;
}

.card-title {
  @apply text-lg font-semibold text-gray-900 mb-4;
}

.chart-container {
  @apply h-48;
}

.placeholder-chart {
  @apply h-full flex flex-col items-center justify-center;
}

.top-queries {
  @apply space-y-3;
}

.query-item {
  @apply flex items-center justify-between;
}

.query-rank {
  @apply w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-sm font-medium;
}

.query-text {
  @apply flex-1 mx-3 text-sm text-gray-700 truncate;
}

.query-count {
  @apply text-sm font-medium text-gray-900;
}

.stats-grid {
  @apply grid grid-cols-2 gap-4;
}

.stat-detail {
  @apply text-center;
}

.stat-detail .stat-label {
  @apply block text-sm text-gray-500 mb-1;
}

.stat-detail .stat-value {
  @apply block text-lg font-bold text-gray-900;
}
</style>