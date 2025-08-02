<template>
  <div class="flex h-screen bg-gray-50">
    <!-- Sidebar -->
    <div
      class="fixed inset-y-0 left-0 z-50 bg-gray-900 transform transition-all duration-300 ease-in-out md:translate-x-0 md:static md:inset-0"
      :class="{ 
        '-translate-x-full': !sidebarOpen, 
        'translate-x-0': sidebarOpen,
        'w-16': sidebarCollapsed,
        'w-64': !sidebarCollapsed
      }"
    >
      <Sidebar @close-sidebar="sidebarOpen = false" @toggle-collapse="handleSidebarCollapse" />
    </div>
    
    <!-- Main content -->
    <div class="flex-1 flex flex-col overflow-hidden">
      <!-- Header -->
      <Header @toggle-sidebar="sidebarOpen = !sidebarOpen" />
      
      <!-- Dashboard content -->
      <main class="flex-1 overflow-y-auto">
        <!-- Header personnalisé client -->
        <div class="bg-white shadow-sm border-b border-gray-200">
          <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div class="flex items-center justify-between py-6">
              <!-- Message de bienvenue -->
              <div class="flex-1">
                <h1 class="text-2xl font-bold text-gray-900">
                  Bonjour {{ clientFirstName }} 👋
                </h1>
                <p class="text-gray-600 mt-1">
                  Bienvenue sur votre espace Fusepoint
                </p>
              </div>
              
              <!-- Agent dédié ou attribution -->
              <div class="flex items-center space-x-4">
                <!-- Chargement -->
                <div v-if="loadingAgent" class="flex items-center space-x-2">
                  <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                  <p class="text-gray-600">Vérification de votre agent...</p>
                </div>
                
                <!-- Agent attribué -->
                <div v-else-if="hasAssignedAgent && assignedAgent" class="flex items-center space-x-4">
                  <div class="text-right">
                    <p class="text-sm text-gray-500">Votre agent dédié</p>
                    <p class="font-semibold text-gray-900">{{ agentName }}</p>
                  </div>
                  <div class="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                    <span class="text-white font-bold text-lg">{{ agentInitials }}</span>
                  </div>
                  <button 
                    @click="contactAgent"
                    class="bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-lg font-medium transition-colors duration-200 flex items-center space-x-2"
                  >
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"></path>
                    </svg>
                    <span>Contacter mon agent</span>
                  </button>
                </div>
                
                <!-- Aucun agent attribué -->
                <div v-else class="text-right">
                  <p class="text-sm text-gray-500">Attribution d'agent</p>
                  <p class="font-semibold text-orange-600">En attente d'attribution</p>
                  <p class="text-xs text-gray-500 mt-1">Notre équipe vous attribuera un agent bientôt</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Contenu principal -->
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        <!-- Colonne principale -->
        <div class="lg:col-span-2 space-y-8">
          
          <!-- Section Attribution d'Agent (si pas d'agent attribué) -->
          <div v-if="!hasAssignedAgent && !loadingAgent" class="bg-white rounded-xl shadow-sm border border-gray-200">
            <div class="p-6 border-b border-gray-200">
              <h2 class="text-xl font-semibold text-gray-900 flex items-center">
                <svg class="w-5 h-5 mr-2 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"></path>
                </svg>
                Attribution d'un agent dédié
              </h2>
              <p class="text-gray-600 mt-1">Pour bénéficier d'un accompagnement personnalisé</p>
            </div>
            
            <div class="p-6">
              <AgentAssignment 
                :client-id="userId"
                @agent-assigned="onAgentAssigned"
              />
            </div>
          </div>
          
          <!-- Section Informations Agent (si agent attribué) -->
          <div v-if="hasAssignedAgent && assignedAgent" class="bg-white rounded-xl shadow-sm border border-gray-200">
            <div class="p-6 border-b border-gray-200">
              <h2 class="text-xl font-semibold text-gray-900 flex items-center">
                <svg class="w-5 h-5 mr-2 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path>
                </svg>
                Votre agent dédié
              </h2>
              <p class="text-gray-600 mt-1">Votre interlocuteur privilégié pour tous vos projets</p>
            </div>
            
            <div class="p-6">
              <div class="flex items-center space-x-4 mb-6">
                <div class="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                  <span class="text-white font-bold text-xl">{{ agentInitials }}</span>
                </div>
                <div class="flex-1">
                  <h3 class="text-lg font-semibold text-gray-900">{{ agentName }}</h3>
                  <p class="text-gray-600">{{ agentEmail }}</p>
                  <p class="text-sm text-green-600 mt-1">✓ Agent attribué et disponible</p>
                </div>
                <div class="flex space-x-3">
                  <button 
                    @click="openChat"
                    class="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors duration-200 flex items-center space-x-2"
                  >
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"></path>
                    </svg>
                    <span>Chat</span>
                  </button>
                  <button 
                    @click="sendEmail"
                    class="bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-lg font-medium transition-colors duration-200 flex items-center space-x-2"
                  >
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path>
                    </svg>
                    <span>Email</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
          
          <!-- Bloc "Mes actions en cours" -->
          <div class="bg-white rounded-xl shadow-sm border border-gray-200">
            <div class="p-6 border-b border-gray-200">
              <h2 class="text-xl font-semibold text-gray-900 flex items-center">
                <svg class="w-5 h-5 mr-2 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path>
                </svg>
                Mes actions en cours
              </h2>
              <p class="text-gray-600 mt-1">Suivez l'avancement de vos projets</p>
            </div>
            
            <div class="p-6">
              <div v-if="currentActions.length === 0" class="text-center py-8">
                <svg class="w-12 h-12 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"></path>
                </svg>
                <p class="text-gray-500">Aucune action en cours</p>
              </div>
              
              <div v-else class="grid gap-4">
                <div 
                  v-for="action in currentActions" 
                  :key="action.id"
                  class="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow duration-200"
                >
                  <div class="flex items-start justify-between">
                    <div class="flex-1">
                      <h3 class="font-semibold text-gray-900 mb-2">{{ action.title }}</h3>
                      <div class="flex items-center space-x-4 text-sm text-gray-600 mb-3">
                        <span class="flex items-center">
                          <span 
                            class="w-2 h-2 rounded-full mr-2"
                            :class="getStatusColor(action.status)"
                          ></span>
                          {{ action.status }}
                        </span>
                        <span>{{ formatDate(action.lastUpdate) }}</span>
                      </div>
                      <p class="text-gray-700 mb-3">{{ action.nextStep }}</p>
                    </div>
                    <button 
                      @click="viewActionDetails(action.id)"
                      class="bg-gray-100 hover:bg-gray-200 text-gray-700 px-3 py-1 rounded-md text-sm font-medium transition-colors duration-200"
                    >
                      Voir le suivi
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Bloc "À valider" -->
          <div class="bg-white rounded-xl shadow-sm border border-gray-200">
            <div class="p-6 border-b border-gray-200">
              <h2 class="text-xl font-semibold text-gray-900 flex items-center">
                <svg class="w-5 h-5 mr-2 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                </svg>
                À valider
                <span v-if="pendingTasks.length > 0" class="ml-2 bg-orange-100 text-orange-800 text-xs font-medium px-2.5 py-0.5 rounded-full">
                  {{ pendingTasks.length }}
                </span>
              </h2>
              <p class="text-gray-600 mt-1">Tâches en attente de votre validation</p>
            </div>
            
            <div class="p-6">
              <div v-if="pendingTasks.length === 0" class="text-center py-8">
                <svg class="w-12 h-12 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                </svg>
                <p class="text-gray-500">Aucune tâche en attente</p>
              </div>
              
              <div v-else class="space-y-3">
                <div 
                  v-for="task in pendingTasks" 
                  :key="task.id"
                  class="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors duration-200"
                >
                  <div class="flex items-center space-x-3">
                    <div class="w-2 h-2 bg-orange-400 rounded-full"></div>
                    <div>
                      <p class="font-medium text-gray-900">{{ task.title }}</p>
                      <p class="text-sm text-gray-600">{{ task.description }}</p>
                    </div>
                  </div>
                  <div class="flex space-x-2">
                    <button 
                      @click="validateTask(task.id)"
                      class="bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded-md text-sm font-medium transition-colors duration-200"
                    >
                      Valider
                    </button>
                    <button 
                      @click="viewTask(task.id)"
                      class="bg-gray-100 hover:bg-gray-200 text-gray-700 px-3 py-1 rounded-md text-sm font-medium transition-colors duration-200"
                    >
                      Voir
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Colonne latérale -->
        <div class="space-y-8">
          
          <!-- Bloc "Prochaine échéance" -->
          <div class="bg-white rounded-xl shadow-sm border border-gray-200">
            <div class="p-6 border-b border-gray-200">
              <h2 class="text-xl font-semibold text-gray-900 flex items-center">
                <svg class="w-5 h-5 mr-2 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                </svg>
                Prochaines échéances
              </h2>
              <p class="text-gray-600 mt-1">Deadlines importantes</p>
            </div>
            
            <div class="p-6">
              <div v-if="upcomingDeadlines.length === 0" class="text-center py-8">
                <svg class="w-12 h-12 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                </svg>
                <p class="text-gray-500">Aucune échéance prochaine</p>
              </div>
              
              <div v-else class="space-y-4">
                <div 
                  v-for="deadline in upcomingDeadlines" 
                  :key="deadline.id"
                  class="border-l-4 pl-4 py-2"
                  :class="getDeadlineColor(deadline.urgency)"
                >
                  <div class="flex items-start justify-between">
                    <div class="flex-1">
                      <h4 class="font-medium text-gray-900">{{ deadline.title }}</h4>
                      <p class="text-sm text-gray-600 mt-1">{{ deadline.description }}</p>
                      <div class="flex items-center mt-2 text-xs text-gray-500">
                        <svg class="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
                        </svg>
                        {{ formatDate(deadline.date) }}
                      </div>
                    </div>
                    <span 
                      class="text-xs font-medium px-2 py-1 rounded-full"
                      :class="getUrgencyBadge(deadline.urgency)"
                    >
                      {{ deadline.urgency }}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Statistiques rapides -->
          <div class="bg-white rounded-xl shadow-sm border border-gray-200">
            <div class="p-6 border-b border-gray-200">
              <h2 class="text-xl font-semibold text-gray-900 flex items-center">
                <svg class="w-5 h-5 mr-2 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"></path>
                </svg>
                Aperçu
              </h2>
            </div>
            
            <div class="p-6 space-y-4">
              <div class="flex items-center justify-between">
                <span class="text-gray-600">Actions actives</span>
                <span class="font-semibold text-gray-900">{{ currentActions.length }}</span>
              </div>
              <div class="flex items-center justify-between">
                <span class="text-gray-600">En attente</span>
                <span class="font-semibold text-orange-600">{{ pendingTasks.length }}</span>
              </div>
              <div class="flex items-center justify-between">
                <span class="text-gray-600">Échéances</span>
                <span class="font-semibold text-red-600">{{ upcomingDeadlines.length }}</span>
              </div>
              <div class="flex items-center justify-between">
                <span class="text-gray-600">Projets terminés</span>
                <span class="font-semibold text-green-600">{{ completedProjects }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
        </div>
      </main>
    </div>

    <!-- Modale de contact agent -->
    <div v-if="showContactModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div class="bg-white rounded-xl p-6 max-w-md w-full mx-4">
        <div class="flex items-center justify-between mb-4">
          <h3 class="text-lg font-semibold text-gray-900">Contacter {{ agentName }}</h3>
          <button @click="showContactModal = false" class="text-gray-400 hover:text-gray-600">
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
            </svg>
          </button>
        </div>
        
        <div class="space-y-4">
          <button 
            @click="openChat"
            class="w-full bg-blue-600 hover:bg-blue-700 text-white p-3 rounded-lg font-medium transition-colors duration-200 flex items-center justify-center space-x-2"
          >
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"></path>
            </svg>
            <span>Ouvrir le chat</span>
          </button>
          
          <button 
            @click="sendEmail"
            class="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 p-3 rounded-lg font-medium transition-colors duration-200 flex items-center justify-center space-x-2"
          >
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path>
            </svg>
            <span>Envoyer un email</span>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import Header from '@/components/Header.vue';
import Sidebar from '@/components/Sidebar.vue';
import AgentAssignment from '@/components/AgentAssignment.vue';
import authService from '@/services/authService';
import aiChatService from '@/services/aiChatService';
import clientProjectService from '@/services/clientProjectService';
import { useToast } from 'vue-toastification';
import { useAuthStore } from '@/stores/auth';

export default {
  name: 'ClientDashboard',
  components: {
    Header,
    Sidebar,
    AgentAssignment
  },
  setup() {
    const toast = useToast();
    const authStore = useAuthStore();
    return { toast, authStore };
  },
  data() {
    return {
      sidebarOpen: false,
      sidebarCollapsed: false,
      showContactModal: false,
      user: null,
      assignedAgent: null,
      hasAssignedAgent: false,
      loadingAgent: true,
      currentActions: [],
      pendingTasks: [],
      upcomingDeadlines: [],
      completedProjects: 0,
      loading: false
    }
  },
  computed: {
    clientFirstName() {
      // Utiliser le store Pinia en priorité
      const storeUser = this.authStore?.user;
      if (storeUser && storeUser.firstName) {
        return storeUser.firstName;
      }
      if (this.user && this.user.firstName) {
        return this.user.firstName;
      }
      return localStorage.getItem('userName')?.split(' ')[0] || 'Client';
    },
    agentName() {
      if (this.assignedAgent) {
        return `${this.assignedAgent.agent_first_name} ${this.assignedAgent.agent_last_name}`;
      }
      return null;
    },
    agentEmail() {
      return this.assignedAgent?.agent_email || null;
    },
    agentInitials() {
      if (this.agentName) {
        return this.agentName.split(' ').map(name => name.charAt(0)).join('').toUpperCase();
      }
      return '';
    },
    userId() {
      // Utiliser le store Pinia en priorité pour éviter la perte après rafraîchissement
      const storeUser = this.authStore?.user;
      if (storeUser && storeUser.id) {
        return storeUser.id;
      }
      return this.user?.id || authService.getUser()?.id;
    }
  },
  methods: {
    handleSidebarCollapse(isCollapsed) {
      this.sidebarCollapsed = isCollapsed
    },
    contactAgent() {
      if (this.hasAssignedAgent && this.assignedAgent) {
        this.showContactModal = true;
      } else {
         this.toast.warning('Vous devez d\'abord avoir un agent attribué pour le contacter.');
       }
    },
    
    openChat() {
      this.showContactModal = false;
      // Fonctionnalité de chat désactivée
      this.toast.info('La fonctionnalité de chat n\'est plus disponible.');
    },
    
    sendEmail() {
      this.showContactModal = false;
      if (this.agentEmail) {
        window.location.href = `mailto:${this.agentEmail}?subject=Contact depuis le dashboard`;
      } else {
         this.toast.warning('Aucun agent attribué pour envoyer un email.');
       }
    },
    
    async viewActionDetails(actionId) {
      try {
        const response = await clientProjectService.getActionDetails(actionId);
        if (response.success) {
          this.$router.push(`/actions/${actionId}`);
        } else {
          this.toast.error('Impossible d\'accéder aux détails de l\'action');
        }
      } catch (error) {
        console.error('Erreur lors de l\'accès aux détails:', error);
        this.toast.error('Erreur lors de l\'accès aux détails de l\'action');
      }
    },
    
    async validateTask(taskId) {
      try {
        const response = await clientProjectService.validateTask(taskId);
        if (response.success) {
          // Recharger les données pour mettre à jour l'affichage
          await this.loadDashboardData();
          this.toast.success('Tâche validée avec succès !');
        } else {
          this.toast.error('Erreur lors de la validation de la tâche');
        }
      } catch (error) {
        console.error('Erreur lors de la validation:', error);
        this.toast.error('Erreur lors de la validation de la tâche');
      }
    },
    
    async viewTask(taskId) {
      try {
        const response = await clientProjectService.getTaskDetails(taskId);
        if (response.success) {
          this.$router.push(`/tasks/${taskId}`);
        } else {
          this.toast.error('Impossible d\'accéder aux détails de la tâche');
        }
      } catch (error) {
        console.error('Erreur lors de l\'accès aux détails:', error);
        this.toast.error('Erreur lors de l\'accès aux détails de la tâche');
      }
    },
    
    formatDate(date) {
      return new Intl.DateTimeFormat('fr-FR', {
        day: 'numeric',
        month: 'long',
        year: 'numeric'
      }).format(date);
    },
    
    getStatusColor(status) {
      const colors = {
        'En cours': 'bg-blue-400',
        'En validation': 'bg-orange-400',
        'En pause': 'bg-gray-400',
        'Terminée': 'bg-green-400'
      };
      return colors[status] || 'bg-gray-400';
    },
    
    getDeadlineColor(urgency) {
      const colors = {
        'Urgent': 'border-red-400',
        'Important': 'border-orange-400',
        'Normal': 'border-blue-400'
      };
      return colors[urgency] || 'border-gray-400';
    },
    
    getUrgencyBadge(urgency) {
      const badges = {
        'Urgent': 'bg-red-100 text-red-800',
        'Important': 'bg-orange-100 text-orange-800',
        'Normal': 'bg-blue-100 text-blue-800'
      };
      return badges[urgency] || 'bg-gray-100 text-gray-800';
    },
    
    loadUserData() {
      this.user = authService.getUser();
    },
    
    async checkAgentAssignment() {
      if (!this.userId) {
        console.warn('⚠️ checkAgentAssignment: Aucun userId disponible');
        return;
      }
      
      try {
        this.loadingAgent = true;
        console.log('🔍 checkAgentAssignment: Vérification pour userId:', this.userId);
        const response = await aiChatService.checkAgentAssignment(this.userId);
        console.log('📡 checkAgentAssignment: Réponse reçue:', response);
        
        // Vérifier si la réponse contient les données d'attribution
        if (response && response.hasAssignedAgent && response.agent) {
          this.assignedAgent = {
            id: response.agent.id,
            agent_first_name: response.agent.firstName,
            agent_last_name: response.agent.lastName,
            agent_email: response.agent.email
          };
          this.hasAssignedAgent = true;
          
          console.log('✅ checkAgentAssignment: Agent attribué trouvé:', this.assignedAgent);
          
        } else {
          console.log('❌ checkAgentAssignment: Aucun agent attribué');
          this.hasAssignedAgent = false;
          this.assignedAgent = null;
        }
      } catch (error) {
        console.error('❌ checkAgentAssignment: Erreur:', error);
        this.hasAssignedAgent = false;
        this.assignedAgent = null;
      } finally {
        this.loadingAgent = false;
      }
    },
    
    onAgentAssigned(agent) {
      this.assignedAgent = agent;
      this.hasAssignedAgent = true;
      this.toast.success(`Agent ${agent.agent_first_name} ${agent.agent_last_name} vous a été attribué !`);
    },
    
    async loadDashboardData() {
      if (!this.userId) return;
      
      try {
        this.loading = true;
        const response = await clientProjectService.getDashboardData(this.userId);
        
        if (response.success) {
          this.currentActions = response.data.currentActions || [];
          this.pendingTasks = response.data.pendingTasks || [];
          this.upcomingDeadlines = response.data.upcomingDeadlines || [];
          this.completedProjects = response.data.completedProjects || 0;
        }
      } catch (error) {
        console.error('Erreur lors du chargement des données du dashboard:', error);
        this.toast.error('Erreur lors du chargement des données');
      } finally {
        this.loading = false;
      }
    }
  },
  
  async mounted() {
    // S'assurer que l'état utilisateur est initialisé
    this.authStore.initializeAuth();
    this.loadUserData();
    
    console.log('🔍 ClientDashboard mounted - userId:', this.userId);
    console.log('🔍 Store user:', this.authStore.user);
    console.log('🔍 Local user:', this.user);
    
    if (!this.userId) {
      console.warn('⚠️ Aucun userId disponible pour vérifier l\'attribution d\'agent');
      return;
    }
    
    console.log('🔍 Vérification de l\'attribution d\'agent pour userId:', this.userId);
    await this.checkAgentAssignment();
    await this.loadDashboardData();
  }
}
</script>

<style scoped>
/* Styles personnalisés si nécessaire */
.nav-item {
  @apply flex items-center space-x-3 px-3 py-2 rounded-lg text-gray-300 hover:text-white hover:bg-gray-700 transition-colors duration-200;
}

.nav-item-active {
  @apply bg-primary-600 text-white;
}
</style>