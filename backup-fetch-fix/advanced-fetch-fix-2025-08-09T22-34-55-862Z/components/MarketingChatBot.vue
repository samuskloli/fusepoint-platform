<template>
  <!-- Chat Button avec notification -->
  <div class="fixed bottom-6 right-6 z-50">
    <!-- Notification Badge -->
    <div v-if="hasUnreadMessages && !isChatOpen" class="absolute -top-2 -left-2 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center animate-pulse">
      {{ unreadCount }}
    </div>
    
    <button 
      @click="toggleChat" 
      class="relative bg-gradient-to-r from-purple-600 to-pink-600 text-white p-4 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 group"
    >
      <!-- Icône avec animation -->
      <div class="relative">
        <svg v-if="!isChatOpen" class="h-6 w-6 transition-transform duration-300 group-hover:rotate-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
        </svg>
        <svg v-else class="h-6 w-6 transition-transform duration-300 group-hover:rotate-90" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
        </svg>
        
        <!-- Indicateur de statut -->
        <div class="absolute -bottom-1 -right-1 w-3 h-3 bg-green-400 rounded-full border-2 border-white animate-pulse"></div>
      </div>
    </button>
    
    <!-- Tooltip -->
    <div v-if="!isChatOpen" class="absolute bottom-full right-0 mb-2 px-3 py-1 bg-gray-900 text-white text-sm rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300 whitespace-nowrap">
      Assistant IA Fusepoint
      <div class="absolute top-full right-4 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-900"></div>
    </div>
  </div>

  <!-- Chat Window avec animation d'entrée -->
  <transition 
    enter-active-class="transition-all duration-300 ease-out"
    enter-from-class="opacity-0 transform translate-y-4 scale-95"
    enter-to-class="opacity-100 transform translate-y-0 scale-100"
    leave-active-class="transition-all duration-200 ease-in"
    leave-from-class="opacity-100 transform translate-y-0 scale-100"
    leave-to-class="opacity-0 transform translate-y-4 scale-95"
  >
    <div 
      v-if="isChatOpen" 
      class="fixed bottom-24 right-6 w-96 h-[600px] bg-white rounded-2xl shadow-2xl border border-gray-200 z-40 flex flex-col backdrop-blur-sm"
    >
      <!-- Chat Header amélioré -->
      <div class="bg-gradient-to-r from-purple-600 via-purple-700 to-pink-600 text-white p-4 rounded-t-2xl relative overflow-hidden">
        <!-- Effet de fond animé -->
        <div class="absolute inset-0 bg-gradient-to-r from-purple-600/20 to-pink-600/20 animate-pulse"></div>
        
        <div class="relative flex items-center justify-between">
          <div class="flex items-center space-x-3">
            <!-- Avatar animé -->
            <div class="relative">
              <div class="w-10 h-10 bg-white bg-opacity-20 rounded-full flex items-center justify-center backdrop-blur-sm border border-white/30">
                <div class="text-lg animate-bounce">{{ currentAgent.avatar }}</div>
              </div>
              <div class="absolute -bottom-1 -right-1 w-4 h-4 bg-green-400 rounded-full border-2 border-white animate-pulse"></div>
            </div>
            
            <div>
              <h3 class="font-bold text-lg">Assistant Fusepoint</h3>
              <p class="text-purple-100 text-sm flex items-center space-x-1">
                <span>{{ currentAgent.name }}</span>
                <span class="w-1 h-1 bg-purple-200 rounded-full"></span>
                <span class="text-xs">{{ currentAgent.specialty }}</span>
              </p>
            </div>
          </div>
          
          <!-- Actions du header -->
          <div class="flex items-center space-x-2">
            <!-- Indicateur de statut -->
            <div class="flex items-center space-x-1 bg-white/20 px-2 py-1 rounded-full">
              <div class="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
              <span class="text-purple-100 text-xs font-medium">En ligne</span>
            </div>
            
            <!-- Bouton minimiser -->
            <button 
              @click="minimizeChat"
              class="p-1 hover:bg-white/20 rounded-full transition-colors"
              title="Minimiser"
            >
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 12H4"/>
              </svg>
            </button>
          </div>
        </div>
      </div>

      <!-- Agent Selector amélioré -->
      <div class="p-4 border-b border-gray-200 bg-gradient-to-r from-gray-50 to-purple-50">
        <div class="flex items-center justify-between mb-2">
          <label class="text-sm font-medium text-gray-700">Agent Spécialisé</label>
          <div class="text-xs text-gray-500 bg-white px-2 py-1 rounded-full">
            {{ availableAgents.length }} agents
          </div>
        </div>
        
        <!-- Sélecteur d'agent avec style personnalisé -->
        <div class="relative">
          <select 
            v-model="selectedAgentId" 
            @change="switchAgent"
            class="w-full text-sm border-2 border-gray-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all duration-200 bg-white appearance-none cursor-pointer"
          >
            <option v-for="agent in availableAgents" :key="agent.id" :value="agent.id">
              {{ agent.avatar }} {{ agent.name }} - {{ agent.specialty }}
            </option>
          </select>
          
          <!-- Icône de dropdown personnalisée -->
          <div class="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
            <svg class="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"/>
            </svg>
          </div>
        </div>
        
        <!-- Indicateur de changement d'agent -->
        <transition name="fade">
          <div v-if="agentSwitching" class="mt-2 text-xs text-purple-600 flex items-center space-x-1">
            <div class="w-3 h-3 border-2 border-purple-600 border-t-transparent rounded-full animate-spin"></div>
            <span>Changement d'agent...</span>
          </div>
        </transition>
      </div>

      <!-- Chat Messages avec scroll personnalisé -->
      <div class="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-thin scrollbar-thumb-purple-300 scrollbar-track-gray-100" ref="messagesContainer">
        <!-- Messages avec animations d'entrée -->
        <transition-group name="message" tag="div">
          <div 
            v-for="message in messages" 
            :key="message.id"
            :class="[
              'flex transition-all duration-300',
              message.sender === 'user' ? 'justify-end' : 'justify-start'
            ]"
          >
            <div 
              :class="[
                'max-w-xs lg:max-w-md px-4 py-3 rounded-2xl text-sm shadow-sm relative',
                message.sender === 'user' 
                  ? 'bg-gradient-to-r from-purple-600 to-purple-700 text-white' 
                  : 'bg-white text-gray-800 border border-gray-200'
              ]"
            >
              <!-- Header du message agent -->
              <div v-if="message.sender === 'agent'" class="flex items-center justify-between mb-2">
                <div class="flex items-center space-x-2">
                  <div class="w-5 h-5 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
                    <span class="text-xs text-white font-bold">{{ currentAgent.avatar }}</span>
                  </div>
                  <span class="text-xs text-purple-600 font-semibold">{{ currentAgent.name }}</span>
                </div>
                <div class="text-xs text-gray-400">{{ formatTime(message.timestamp) }}</div>
              </div>
              <!-- Contenu du message avec formatage -->
              <div class="prose prose-sm max-w-none" v-html="formatMessageContent(message.content)"></div>
              <!-- Suggestions améliorées -->
              <div v-if="message.suggestions && message.suggestions.length > 0" class="mt-3 space-y-2">
                <div class="text-xs font-medium text-gray-500 mb-2">Suggestions :</div>
                <div class="flex flex-wrap gap-2">
                  <button 
                    v-for="suggestion in message.suggestions" 
                    :key="suggestion"
                    @click="sendMessage(suggestion)"
                    class="text-xs bg-purple-100 hover:bg-purple-200 text-purple-700 px-3 py-1 rounded-full transition-all duration-200 hover:scale-105 hover:shadow-sm"
                  >
                    {{ suggestion }}
                  </button>
                </div>
              </div>
              <!-- Timestamp pour les messages utilisateur -->
              <div v-if="message.sender === 'user'" class="text-xs text-purple-200 mt-2 text-right">
                {{ formatTime(message.timestamp) }}
              </div>
              
              <!-- Indicateur de lecture -->
              <div v-if="message.sender === 'user'" class="absolute -bottom-1 -right-1">
                <div class="w-3 h-3 bg-green-400 rounded-full border border-white"></div>
              </div>
            </div>
          </div>
        </transition-group>
        
        <!-- Indicateur de frappe amélioré -->
        <transition name="typing">
          <div v-if="isTyping" class="flex justify-start">
            <div class="bg-white border border-gray-200 px-4 py-3 rounded-2xl text-sm shadow-sm">
              <div class="flex items-center space-x-2">
                <div class="w-6 h-6 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
                  <span class="text-xs text-white font-bold">{{ currentAgent.avatar }}</span>
                </div>
                <span class="text-gray-600 text-xs">{{ currentAgent.name }} écrit</span>
                <div class="flex space-x-1">
                  <div class="w-2 h-2 bg-purple-400 rounded-full animate-bounce"></div>
                  <div class="w-2 h-2 bg-purple-400 rounded-full animate-bounce" style="animation-delay: 0.1s"></div>
                  <div class="w-2 h-2 bg-purple-400 rounded-full animate-bounce" style="animation-delay: 0.2s"></div>
                </div>
              </div>
            </div>
          </div>
        </transition>
      </div>

      <!-- Zone de saisie améliorée -->
      <div class="p-4 border-t border-gray-200 bg-gradient-to-r from-gray-50 to-purple-50">
        <!-- Compteur de caractères et statut -->
        <div class="flex items-center justify-between mb-2">
          <div class="text-xs text-gray-500">
            {{ isTyping ? 'L\'assistant répond...' : 'Tapez votre message' }}
          </div>
          <div class="text-xs text-gray-400">
            {{ newMessage.length }}/500
          </div>
        </div>
        
        <div class="flex space-x-3">
          <!-- Zone de texte avec auto-resize -->
          <div class="flex-1 relative">
            <textarea 
              v-model="newMessage" 
              @keydown.enter.exact.prevent="sendMessage()"
              @keydown.enter.shift.exact="newMessage += '\n'"
              :disabled="isTyping"
              :maxlength="500"
              placeholder="Posez votre question marketing..."
              rows="1"
              class="w-full border-2 border-gray-200 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-purple-500 focus:border-purple-500 disabled:opacity-50 resize-none transition-all duration-200"
              style="min-height: 44px; max-height: 120px;"
              ref="messageInput"
            ></textarea>
            
            <!-- Indicateur de limite de caractères -->
            <div v-if="newMessage.length > 400" class="absolute -top-6 right-0 text-xs" :class="newMessage.length >= 500 ? 'text-red-500' : 'text-orange-500'">
              {{ 500 - newMessage.length }} caractères restants
            </div>
          </div>
          
          <!-- Boutons d'action -->
          <div class="flex flex-col space-y-2">
            <!-- Bouton d'envoi -->
            <button 
              @click="sendMessage()"
              :disabled="!newMessage.trim() || isTyping || newMessage.length > 500"
              class="bg-gradient-to-r from-purple-600 to-purple-700 text-white p-3 rounded-xl hover:from-purple-700 hover:to-purple-800 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-105 active:scale-95"
            >
              <svg v-if="!isTyping" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
              </svg>
              <div v-else class="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            </button>
            
            <!-- Bouton d'options -->
            <button 
              @click="showOptions = !showOptions"
              class="bg-gray-200 text-gray-600 p-3 rounded-xl hover:bg-gray-300 transition-colors"
              title="Options"
            >
              <svg class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
              </svg>
            </button>
          </div>
        </div>
        
        <!-- Actions rapides améliorées -->
        <transition name="slide-down">
          <div v-if="showQuickActions" class="mt-3">
            <div class="text-xs font-medium text-gray-600 mb-2">Actions rapides :</div>
            <div class="flex flex-wrap gap-2">
              <button 
                v-for="action in quickActions" 
                :key="action"
                @click="sendMessage(action)"
                class="text-xs bg-white hover:bg-purple-50 text-gray-700 hover:text-purple-700 px-3 py-2 rounded-full border border-gray-200 hover:border-purple-300 transition-all duration-200 hover:scale-105"
              >
                {{ action }}
              </button>
            </div>
          </div>
        </transition>
        
        <!-- Raccourcis clavier -->
        <div class="mt-2 text-xs text-gray-400 text-center">
          Entrée pour envoyer • Shift+Entrée pour nouvelle ligne
        </div>
      </div>
    </div>
  </transition>
</template>

<script>
import marketingIntelligenceService from '../services/marketingIntelligenceService.js';
import aiChatService from '../services/aiChatService.js';

export default {
  name: 'MarketingChatBot',
  data() {
    return {
      isChatOpen: false,
      isTyping: false,
      newMessage: '',
      selectedAgentId: 'content',
      agentSwitching: false,
      showOptions: false,
      showQuickActions: true,
      hasUnreadMessages: false,
      unreadCount: 0,
      isMinimized: false,
      messages: [
        {
          id: 1,
          sender: 'agent',
          content: '👋 Bonjour ! Je suis votre assistant marketing IA Fusepoint. Comment puis-je vous aider à optimiser vos campagnes aujourd\'hui ?',
          timestamp: new Date(),
          suggestions: [
            'Analyser mes performances',
            'Créer une campagne',
            'Optimiser mon SEO',
            'Stratégie réseaux sociaux'
          ]
        }
      ],
      availableAgents: [
        {
          id: 'content',
          name: 'Expert Contenu',
          specialty: 'Création de contenu marketing',
          avatar: '✍️'
        },
        {
          id: 'social',
          name: 'Social Media',
          specialty: 'Gestion des réseaux sociaux',
          avatar: '📱'
        },
        {
          id: 'email',
          name: 'Email Marketing',
          specialty: 'Campagnes email',
          avatar: '📧'
        },
        {
          id: 'analytics',
          name: 'Analytics',
          specialty: 'Analyse de données',
          avatar: '📊'
        },
        {
          id: 'strategy',
          name: 'Stratégie',
          specialty: 'Stratégie marketing globale',
          avatar: '🎯'
        }
      ],
      quickActions: [
        '📊 Rapport hebdomadaire',
        '💡 Idées de contenu',
        '💰 Optimiser budget',
        '📈 Tendances marché',
        '🎯 Stratégie SEO',
        '📱 Réseaux sociaux'
      ]
    };
  },
  computed: {
    currentAgent() {
      return this.availableAgents.find(agent => agent.id === this.selectedAgentId) || this.availableAgents[0];
    }
  },
  async mounted() {
    // Tester la connexion à l'API et charger les agents
    try {
      const isConnected = await aiChatService.testConnection();
      if (isConnected) {
        console.log('✅ Connexion API établie');
        const agents = await aiChatService.getAvailableAgents();
        if (agents && agents.length > 0) {
          this.availableAgents = agents;
        }
      } else {
        console.log('⚠️ API non disponible, utilisation du mode hors ligne');
      }
    } catch (error) {
      console.log('⚠️ Erreur de connexion API, utilisation du mode hors ligne');
    }
  },
  methods: {
    toggleChat() {
      this.isChatOpen = !this.isChatOpen;
      if (this.isChatOpen) {
        this.hasUnreadMessages = false;
        this.unreadCount = 0;
        this.isMinimized = false;
        this.$nextTick(() => {
          this.scrollToBottom();
          if (this.$refs.messageInput) {
            this.$refs.messageInput.focus();
          }
        });
      }
    },

    minimizeChat() {
      this.isMinimized = true;
      this.isChatOpen = false;
    },
    async sendMessage(content = null) {
      const messageContent = content || this.newMessage.trim();
      if (!messageContent) return;

      // Add user message
      const userMessage = {
        id: Date.now(),
        sender: 'user',
        content: messageContent,
        timestamp: new Date()
      };
      this.messages.push(userMessage);
      this.newMessage = '';
      
      this.scrollToBottom();
      this.isTyping = true;

      // Simulate agent response
      setTimeout(async () => {
        const response = await this.generateAgentResponse(messageContent);
        this.messages.push(response);
        this.isTyping = false;
        this.scrollToBottom();
      }, 1000 + Math.random() * 2000);
    },
    async generateAgentResponse(userMessage) {
      const agent = this.currentAgent;
      let response = {
        id: Date.now() + 1,
        sender: 'agent',
        content: '',
        timestamp: new Date()
      };

      try {
        // Utiliser le service d'IA réel
        const conversationHistory = this.formatConversationHistory();
        const aiResponse = await aiChatService.sendMessage(userMessage, this.selectedAgentId, conversationHistory);
        
        response.content = aiResponse.content;
        response.suggestions = aiResponse.suggestions;
        
        return response;
      } catch (error) {
        console.error('Erreur IA:', error);
        // Fallback vers les réponses simulées en cas d'erreur
        return await this.generateFallbackResponse(userMessage);
      }
    },
    
    async generateFallbackResponse(userMessage) {
      const agent = this.currentAgent;
      let response = {
        id: Date.now() + 1,
        sender: 'agent',
        content: '',
        timestamp: new Date()
      };

      // Simulate different agent responses based on type and message
      const lowerMessage = userMessage.toLowerCase();
      
      if (lowerMessage.includes('performance') || lowerMessage.includes('analyser')) {
        try {
          const insights = await marketingIntelligenceService.generateMarketingInsights();
          const totalInsights = Object.values(insights).flat().length;
          response.content = `📊 J'ai analysé vos données marketing. Voici ce que j'ai trouvé :\n\n• ${totalInsights} insights générés\n• ${insights.audienceInsights?.length || 0} recommandations d'audience\n• ${insights.trafficOptimization?.length || 0} optimisations de trafic\n\nVoulez-vous que je détaille un aspect particulier ?`;
          response.suggestions = ['Détailler l\'audience', 'Optimisations trafic', 'Plan d\'action', 'Rapport complet'];
        } catch (error) {
          response.content = `❌ Je n'ai pas pu accéder à vos données analytics. Assurez-vous que Google Analytics est connecté pour obtenir des insights personnalisés.`;
          response.suggestions = ['Connecter Google Analytics', 'Aide configuration', 'Données de démonstration'];
        }
      } else if (lowerMessage.includes('campagne') || lowerMessage.includes('créer')) {
        response.content = `🚀 Excellente idée ! Pour créer une campagne optimale, j'ai besoin de quelques informations :\n\n• Quel est votre objectif principal ?\n• Quel budget avez-vous prévu ?\n• Quelle est votre audience cible ?\n\nJe peux vous proposer une stratégie personnalisée basée sur vos données.`;
        response.suggestions = ['Campagne conversion', 'Campagne notoriété', 'Campagne engagement', 'Budget automatique'];
      } else if (lowerMessage.includes('seo') || lowerMessage.includes('référencement')) {
        response.content = `🔍 Pour optimiser votre SEO, voici mes recommandations immédiates :\n\n• Analysez vos mots-clés actuels\n• Optimisez vos méta-descriptions\n• Améliorez la vitesse de chargement\n• Créez du contenu de qualité\n\nJe peux analyser votre site pour des recommandations spécifiques.`;
        response.suggestions = ['Audit SEO complet', 'Mots-clés tendance', 'Optimiser contenu', 'Stratégie backlinks'];
      } else if (lowerMessage.includes('social') || lowerMessage.includes('réseaux')) {
        response.content = `📱 Stratégie réseaux sociaux personnalisée :\n\n• Planification de contenu automatique\n• Meilleurs moments de publication\n• Hashtags optimisés\n• Engagement automatisé\n\nSur quels réseaux souhaitez-vous vous concentrer ?`;
        response.suggestions = ['Instagram', 'LinkedIn', 'Facebook', 'TikTok', 'Tous les réseaux'];
      } else if (lowerMessage.includes('budget') || lowerMessage.includes('coût')) {
        response.content = `💰 Optimisation budgétaire intelligente :\n\n• Réallocation automatique des budgets\n• ROI en temps réel\n• Prédictions de performance\n• Alertes de dépassement\n\nVotre budget actuel peut être optimisé de 15-25% en moyenne.`;
        response.suggestions = ['Analyser ROI', 'Répartition optimale', 'Prédictions', 'Alertes budget'];
      } else if (lowerMessage.includes('rapport') || lowerMessage.includes('données')) {
        response.content = `📈 Rapports automatisés disponibles :\n\n• Rapport hebdomadaire personnalisé\n• Dashboard en temps réel\n• Alertes de performance\n• Recommandations IA\n\nQuel type de rapport vous intéresse ?`;
        response.suggestions = ['Rapport hebdo', 'Dashboard live', 'Alertes perso', 'Export PDF'];
      } else {
        // Default responses based on agent type
        const agentResponses = {
          content: `📝 En tant qu'expert contenu, je peux vous aider avec :\n\n• Génération d'idées d'articles\n• Optimisation SEO\n• Calendrier éditorial\n• A/B testing des titres\n\nQue souhaitez-vous améliorer en priorité ?`,
          social: `📱 Spécialiste réseaux sociaux à votre service ! Je peux :\n\n• Programmer vos publications\n• Analyser l'engagement\n• Optimiser vos hashtags\n• Gérer les commentaires\n\nSur quel réseau commençons-nous ?`,
          email: `📧 Expert email marketing ici ! Mes services :\n\n• Séquences automatisées\n• Segmentation avancée\n• A/B testing\n• Personnalisation IA\n\nQuel est votre défi email actuel ?`,
          analytics: `📊 Analyste de données marketing ! Je peux :\n\n• Analyser vos KPIs\n• Prédire les tendances\n• Optimiser les conversions\n• Rapports automatisés\n\nQuelles métriques vous préoccupent ?`,
          strategy: `🎯 Stratège marketing à votre écoute ! Mes expertises :\n\n• Planification campagnes\n• Analyse concurrentielle\n• Positionnement marché\n• ROI optimization\n\nQuel est votre objectif principal ?`
        };
        
        response.content = agentResponses[agent.id] || agentResponses.strategy;
        response.suggestions = ['Audit complet', 'Recommandations', 'Plan d\'action', 'Formation équipe'];
      }

      return response;
    },
    
    formatConversationHistory() {
      // Formater l'historique pour l'IA (garder les 5 derniers messages)
      return this.messages.slice(-5).map(msg => ({
        sender: msg.sender,
        content: msg.content,
        timestamp: msg.timestamp
      }));
    },
    switchAgent() {
      this.agentSwitching = true;
      
      // Simulation du changement d'agent
      setTimeout(() => {
        this.agentSwitching = false;
        
        // Message de confirmation du changement d'agent
        const newAgent = this.currentAgent;
        this.messages.push({
          id: Date.now(),
          sender: 'agent',
          content: `Bonjour ! Je suis ${newAgent.name}, votre ${newAgent.specialty}. Comment puis-je vous aider aujourd'hui ?`,
          timestamp: new Date(),
          suggestions: this.getAgentSuggestions(newAgent.id)
        });
        
        this.$nextTick(() => {
          this.scrollToBottom();
        });
      }, 1000);
    },

    getAgentSuggestions(agentId) {
      const suggestions = {
        content: ['Créer un article de blog', 'Idées de contenu viral', 'Calendrier éditorial'],
        social: ['Stratégie Instagram', 'Planifier des posts', 'Analyser l\'engagement'],
        email: ['Créer une newsletter', 'Segmenter ma liste', 'A/B test subject'],
        analytics: ['Rapport de performance', 'ROI campagnes', 'Métriques clés'],
        strategy: ['Plan marketing 2024', 'Budget allocation', 'Analyse concurrence']
      };
      return suggestions[agentId] || [];
    },
    scrollToBottom() {
      this.$nextTick(() => {
        const container = this.$refs.messagesContainer;
        if (container) {
          container.scrollTop = container.scrollHeight;
        }
      });
    },
    formatTime(timestamp) {
      const now = new Date();
      const messageTime = new Date(timestamp);
      const diffInMinutes = Math.floor((now - messageTime) / (1000 * 60));
      
      if (diffInMinutes < 1) {
        return 'À l\'instant';
      } else if (diffInMinutes < 60) {
        return `Il y a ${diffInMinutes}min`;
      } else if (diffInMinutes < 1440) {
        const hours = Math.floor(diffInMinutes / 60);
        return `Il y a ${hours}h`;
      } else {
        return messageTime.toLocaleDateString('fr-FR', {
          day: 'numeric',
          month: 'short'
        });
      }
    },

    formatMessageContent(content) {
      // Formatage basique du contenu avec support markdown simple
      return content
        .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
        .replace(/\*(.*?)\*/g, '<em>$1</em>')
        .replace(/`(.*?)`/g, '<code class="bg-gray-100 px-1 rounded">$1</code>')
        .replace(/\n/g, '<br>');
    },

    // Gestion des notifications
    addUnreadMessage() {
      if (!this.isChatOpen) {
        this.hasUnreadMessages = true;
        this.unreadCount = Math.min(this.unreadCount + 1, 9);
      }
    },

    // Auto-resize du textarea
    autoResizeTextarea() {
      this.$nextTick(() => {
        const textarea = this.$refs.messageInput;
        if (textarea) {
          textarea.style.height = 'auto';
          textarea.style.height = Math.min(textarea.scrollHeight, 120) + 'px';
        }
      });
    }
  },

  watch: {
    newMessage() {
      this.autoResizeTextarea();
    },

    messages: {
      handler(newMessages, oldMessages) {
        if (newMessages.length > oldMessages.length) {
          const lastMessage = newMessages[newMessages.length - 1];
          if (lastMessage.sender === 'agent') {
            this.addUnreadMessage();
          }
        }
      },
      deep: true
    }
  },

  mounted() {
    // Auto-focus sur l'input quand le chat s'ouvre
    this.$nextTick(() => {
      if (this.isChatOpen && this.$refs.messageInput) {
        this.$refs.messageInput.focus();
      }
    });
  }
};
</script>

<style scoped>
/* Styles personnalisés pour le chat amélioré */
.chat-container {
  font-family: 'Inter', sans-serif;
}

/* Animations des messages */
.message-enter-active {
  transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
}

.message-leave-active {
  transition: all 0.3s ease-in;
}

.message-enter-from {
  opacity: 0;
  transform: translateY(20px) scale(0.9);
}

.message-leave-to {
  opacity: 0;
  transform: translateY(-10px) scale(0.95);
}

/* Animation de l'indicateur de frappe */
.typing-enter-active,
.typing-leave-active {
  transition: all 0.3s ease;
}

.typing-enter-from,
.typing-leave-to {
  opacity: 0;
  transform: translateY(10px) scale(0.9);
}

/* Animation fade */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

/* Animation slide-down */
.slide-down-enter-active {
  transition: all 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94);
}

.slide-down-leave-active {
  transition: all 0.2s ease-in;
}

.slide-down-enter-from {
  opacity: 0;
  transform: translateY(-10px);
  max-height: 0;
}

.slide-down-leave-to {
  opacity: 0;
  transform: translateY(-5px);
  max-height: 0;
}

/* Scrollbar personnalisée */
.scrollbar-thin {
  scrollbar-width: thin;
}

.scrollbar-thin::-webkit-scrollbar {
  width: 6px;
}

.scrollbar-thin::-webkit-scrollbar-track {
  background: #f1f5f9;
  border-radius: 3px;
}

.scrollbar-thin::-webkit-scrollbar-thumb {
  background: #d1d5db;
  border-radius: 3px;
}

.scrollbar-thin::-webkit-scrollbar-thumb:hover {
  background: #9ca3af;
}

.scrollbar-thumb-purple-300::-webkit-scrollbar-thumb {
  background: #d8b4fe;
}

.scrollbar-track-gray-100::-webkit-scrollbar-track {
  background: #f3f4f6;
}

/* Effet de hover sur les boutons */
.group:hover .group-hover\:opacity-100 {
  opacity: 1;
}

/* Animation de rotation */
.group-hover\:rotate-12:hover {
  transform: rotate(12deg);
}

.group-hover\:rotate-90:hover {
  transform: rotate(90deg);
}

/* Effet de glassmorphism */
.backdrop-blur-sm {
  backdrop-filter: blur(4px);
}

/* Animation de bounce personnalisée */
@keyframes bounce-soft {
  0%, 100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-4px);
  }
}

.animate-bounce {
  animation: bounce-soft 1s infinite;
}

/* Effet de pulsation */
@keyframes pulse-soft {
  0%, 100% {
    opacity: 1;
  }
  50% {
    opacity: 0.7;
  }
}

.animate-pulse {
  animation: pulse-soft 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
}

/* Styles pour les suggestions */
.suggestion-button {
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
}

.suggestion-button:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(139, 92, 246, 0.15);
}

/* Effet de focus amélioré */
.focus\:ring-2:focus {
  box-shadow: 0 0 0 2px rgba(139, 92, 246, 0.2);
}

/* Animation du spinner */
@keyframes spin {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

.animate-spin {
  animation: spin 1s linear infinite;
}

/* Responsive design */
@media (max-width: 640px) {
  .fixed.bottom-24.right-6 {
    right: 1rem;
    left: 1rem;
    width: auto;
  }
  
  .w-96 {
    width: 100%;
  }
}

/* Amélioration de l'accessibilité */
.focus-visible:focus {
  outline: 2px solid #8b5cf6;
  outline-offset: 2px;
}

/* Animation d'entrée du tooltip */
.tooltip {
  transition: opacity 0.3s ease, transform 0.3s ease;
}

/* Effet de hover sur les actions rapides */
.quick-action:hover {
  transform: scale(1.05);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}
</style>