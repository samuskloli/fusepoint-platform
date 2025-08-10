<template>
  <div class="flex h-screen bg-gray-50">
    <!-- Sidebar -->
    <div
      class="fixed inset-y-0 left-0 z-50 w-64 bg-gray-900 transform transition-transform duration-300 ease-in-out md:translate-x-0 md:static md:inset-0"
      :class="{ '-translate-x-full': !sidebarOpen, 'translate-x-0': sidebarOpen }"
    >
      <Sidebar @close-sidebar="sidebarOpen = false" />
    </div>

    <!-- Overlay for mobile -->
    <div
      v-if="sidebarOpen"
      class="fixed inset-0 z-40 bg-gray-600 bg-opacity-75 md:hidden"
      @click="sidebarOpen = false"
    ></div>

    <!-- Main content -->
    <div class="flex-1 flex flex-col overflow-hidden">
      <!-- Header -->
      <Header @toggle-sidebar="sidebarOpen = !sidebarOpen" />

      <!-- Main content area -->
      <main class="flex-1 overflow-x-hidden overflow-y-auto bg-gray-50">
        <div class="container mx-auto px-6 py-8">
          <!-- Welcome section -->
          <div class="mb-8">
            <h1 class="text-3xl font-bold text-gray-900">
              {{ $t('messages.hello') }} {{ userName }} 👋
            </h1>
            <p class="mt-2 text-gray-600">
              Voici un aperçu de vos performances marketing aujourd'hui.
            </p>
          </div>

          <!-- Agent Assignment Section -->
          <div class="mb-8">
            <!-- Agent assigned -->
            <div v-if="assignedAgent" class="bg-green-50 border border-green-200 rounded-lg p-6">
              <div class="flex items-center">
                <div class="flex-shrink-0">
                  <img 
                    :src="assignedAgent.avatar || '/default-avatar.png'" 
                    :alt="assignedAgent.nom"
                    class="w-12 h-12 rounded-full object-cover"
                  >
                </div>
                <div class="ml-4">
                  <h3 class="text-lg font-semibold text-green-800">
                    👤 Votre agent Fusepoint : {{ assignedAgent.nom }}
                  </h3>
                  <p class="text-green-700">
                    Spécialité : {{ assignedAgent.specialite }}
                  </p>
                  <p class="text-sm text-green-600 mt-1">
                    📧 {{ assignedAgent.email }} | 📞 {{ assignedAgent.telephone }}
                  </p>
                </div>
                <div class="ml-auto">
                  <button 
                    @click="contactSupport"
                    class="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition-colors duration-200"
                  >
                    📞 Contacter le support
                  </button>
                </div>
              </div>
            </div>

            <!-- No agent assigned -->
            <div v-else class="bg-blue-50 border border-blue-200 rounded-lg p-6">
              <div class="text-center">
                <div class="text-4xl mb-4">🎉</div>
                <h3 class="text-xl font-semibold text-blue-800 mb-2">
                  Bienvenue {{ userName }} !
                </h3>
                <p class="text-blue-700 mb-4">
                  Votre compte a bien été créé.<br>
                  Un membre de l'équipe Fusepoint va bientôt vous être attribué.
                </p>
                <div class="text-left max-w-md mx-auto">
                  <p class="text-blue-700 font-medium mb-3">⏳ En attendant, vous pouvez :</p>
                  <ul class="space-y-2 text-blue-600">
                    <li class="flex items-center">
                      <span class="mr-2">✅</span>
                      Compléter votre profil
                    </li>
                    <li class="flex items-center">
                      <span class="mr-2">✅</span>
                      Décrire vos besoins marketing
                    </li>
                    <li class="flex items-center">
                      <span class="mr-2">✅</span>
                      Télécharger vos premiers documents
                    </li>
                  </ul>
                </div>
                <button 
                  @click="requestAgentAssignment"
                  :disabled="isRequestingAgent"
                  class="mt-4 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white px-6 py-2 rounded-lg transition-colors duration-200"
                >
                  {{ isRequestingAgent ? '⏳ Demande en cours...' : '🚀 Demander un agent' }}
                </button>
              </div>
            </div>
          </div>


          <!-- Stats cards -->
          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div class="bg-white rounded-lg shadow p-6">
              <div class="flex items-center">
                <div class="flex-shrink-0">
                  <div class="w-8 h-8 bg-blue-500 rounded-md flex items-center justify-center">
                    <svg class="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                  </div>
                </div>
                <div class="ml-5 w-0 flex-1">
                  <dl>
                    <dt class="text-sm font-medium text-gray-500 truncate">Visites totales</dt>
                    <dd class="text-lg font-medium text-gray-900">12,345</dd>
                  </dl>
                </div>
                <div class="flex items-center text-sm text-green-600">
                  <svg class="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                    <path fill-rule="evenodd" d="M5.293 9.707a1 1 0 010-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 01-1.414 1.414L11 7.414V15a1 1 0 11-2 0V7.414L6.707 9.707a1 1 0 01-1.414 0z" clip-rule="evenodd" />
                  </svg>
                  +12%
                </div>
              </div>
            </div>

            <div class="bg-white rounded-lg shadow p-6">
              <div class="flex items-center">
                <div class="flex-shrink-0">
                  <div class="w-8 h-8 bg-green-500 rounded-md flex items-center justify-center">
                    <svg class="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                    </svg>
                  </div>
                </div>
                <div class="ml-5 w-0 flex-1">
                  <dl>
                    <dt class="text-sm font-medium text-gray-500 truncate">Taux d'engagement</dt>
                    <dd class="text-lg font-medium text-gray-900">68.2%</dd>
                  </dl>
                </div>
                <div class="flex items-center text-sm text-green-600">
                  <svg class="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                    <path fill-rule="evenodd" d="M5.293 9.707a1 1 0 010-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 01-1.414 1.414L11 7.414V15a1 1 0 11-2 0V7.414L6.707 9.707a1 1 0 01-1.414 0z" clip-rule="evenodd" />
                  </svg>
                  +5.4%
                </div>
              </div>
            </div>

            <div class="bg-white rounded-lg shadow p-6">
              <div class="flex items-center">
                <div class="flex-shrink-0">
                  <div class="w-8 h-8 bg-purple-500 rounded-md flex items-center justify-center">
                    <svg class="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 4V2a1 1 0 011-1h8a1 1 0 011 1v2h4a1 1 0 110 2h-1v12a2 2 0 01-2 2H6a2 2 0 01-2-2V6H3a1 1 0 110-2h4z" />
                    </svg>
                  </div>
                </div>
                <div class="ml-5 w-0 flex-1">
                  <dl>
                    <dt class="text-sm font-medium text-gray-500 truncate">Posts publiés</dt>
                    <dd class="text-lg font-medium text-gray-900">24</dd>
                  </dl>
                </div>
                <div class="flex items-center text-sm text-green-600">
                  <svg class="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                    <path fill-rule="evenodd" d="M5.293 9.707a1 1 0 010-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 01-1.414 1.414L11 7.414V15a1 1 0 11-2 0V7.414L6.707 9.707a1 1 0 01-1.414 0z" clip-rule="evenodd" />
                  </svg>
                  +8
                </div>
              </div>
            </div>

            <div class="bg-white rounded-lg shadow p-6">
              <div class="flex items-center">
                <div class="flex-shrink-0">
                  <div class="w-8 h-8 bg-yellow-500 rounded-md flex items-center justify-center">
                    <svg class="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                    </svg>
                  </div>
                </div>
                <div class="ml-5 w-0 flex-1">
                  <dl>
                    <dt class="text-sm font-medium text-gray-500 truncate">Revenus générés</dt>
                    <dd class="text-lg font-medium text-gray-900">{{ $formatCurrency(2847) }}</dd>
                  </dl>
                </div>
                <div class="flex items-center text-sm text-red-600">
                  <svg class="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                    <path fill-rule="evenodd" d="M14.707 10.293a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 111.414-1.414L9 12.586V5a1 1 0 012 0v7.586l2.293-2.293a1 1 0 011.414 0z" clip-rule="evenodd" />
                  </svg>
                  -3.2%
                </div>
              </div>
            </div>
          </div>

          <!-- Charts section -->
          <div class="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            <!-- Traffic chart -->
            <div class="bg-white rounded-lg shadow p-6">
              <h3 class="text-lg font-medium text-gray-900 mb-4">Trafic des 7 derniers jours</h3>
              <div class="h-64 bg-gray-100 rounded-lg flex items-center justify-center">
                <div class="text-center text-gray-500">
                  <svg class="w-12 h-12 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                  <p>Graphique de trafic</p>
                  <p class="text-sm">(Données mockées)</p>
                </div>
              </div>
            </div>

            <!-- Engagement chart -->
            <div class="bg-white rounded-lg shadow p-6">
              <h3 class="text-lg font-medium text-gray-900 mb-4">Engagement par plateforme</h3>
              <div class="h-64 bg-gray-100 rounded-lg flex items-center justify-center">
                <div class="text-center text-gray-500">
                  <svg class="w-12 h-12 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 3.055A9.001 9.001 0 1020.945 13H11V3.055z" />
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20.488 9H15V3.512A9.025 9.025 0 0120.488 9z" />
                  </svg>
                  <p>Graphique d'engagement</p>
                  <p class="text-sm">(Données mockées)</p>
                </div>
              </div>
            </div>
          </div>

          <!-- Connect services section -->
          <div class="bg-white rounded-lg shadow p-6">
            <h3 class="text-lg font-medium text-gray-900 mb-6">Connecter vos services</h3>
            <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
              <button class="flex items-center justify-center p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-gray-400 transition-colors duration-200">
                <div class="text-center">
                  <div class="w-12 h-12 bg-red-500 rounded-lg flex items-center justify-center mx-auto mb-3">
                    <svg class="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                    </svg>
                  </div>
                  <h4 class="font-medium text-gray-900">Google Analytics</h4>
                  <p class="text-sm text-gray-500 mt-1">Connecter votre compte</p>
                </div>
              </button>

              <button class="flex items-center justify-center p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-gray-400 transition-colors duration-200">
                <div class="text-center">
                  <div class="w-12 h-12 bg-blue-600 rounded-lg flex items-center justify-center mx-auto mb-3">
                    <svg class="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                    </svg>
                  </div>
                  <h4 class="font-medium text-gray-900">Facebook / Instagram</h4>
                  <p class="text-sm text-gray-500 mt-1">Connecter vos pages</p>
                </div>
              </button>

              <button class="flex items-center justify-center p-4 border-2 border-dashed border-gray-300 rounded-lg opacity-50 cursor-not-allowed">
                <div class="text-center">
                  <div class="w-12 h-12 bg-yellow-500 rounded-lg flex items-center justify-center mx-auto mb-3">
                    <svg class="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 0C5.374 0 0 5.374 0 12s5.374 12 12 12 12-5.374 12-12S18.626 0 12 0zm5.568 8.16c-.169 1.858-.896 3.433-2.173 4.71-1.277 1.277-2.852 2.004-4.71 2.173-.38.035-.747.035-1.37.035s-.99 0-1.37-.035c-1.858-.169-3.433-.896-4.71-2.173-1.277-1.277-2.004-2.852-2.173-4.71C1.027 7.78 1.027 7.413 1.027 6.79s0-.99.035-1.37c.169-1.858.896-3.433 2.173-4.71 1.277-1.277 2.852-2.004 4.71-2.173.38-.035.747-.035 1.37-.035s.99 0 1.37.035c1.858.169 3.433.896 4.71 2.173 1.277 1.277 2.004 2.852 2.173 4.71.035.38.035.747.035 1.37s0 .99-.035 1.37z"/>
                    </svg>
                  </div>
                  <h4 class="font-medium text-gray-400">Mailchimp</h4>
                  <p class="text-sm text-gray-400 mt-1">Bientôt disponible</p>
                </div>
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  </div>
</template>

<script>
import Header from '@/components/Header.vue';
import Sidebar from '@/components/Sidebar.vue';
import { aiChatService } from '@/services/aiChatService';
import authService from '@/services/authService';
import { useAuthStore } from '@/stores/auth';

export default {
  name: 'Dashboard',
  components: {
    Header,
    Sidebar
  },
  setup() {
    const authStore = useAuthStore();
    return { authStore };
  },
  data() {
    return {
      sidebarOpen: false,
      assignedAgent: null,
      isRequestingAgent: false
    };
  },
  computed: {
    userName() {
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      return user.firstName || 'Utilisateur';
    },
    userId() {
      // Utiliser le store Pinia en priorité pour éviter la perte après rafraîchissement
      const storeUser = this.authStore?.user;
      if (storeUser && storeUser.id) {
        return storeUser.id;
      }
      const user = authService.getUser();
      return user?.id;
    }
  },
  async mounted() {
    console.log('🔄 Dashboard mounted - Initialisation...');
    
    // Vérifier l'attribution d'agent au chargement via API (persistant)
    await this.checkAgentAssignment();
    
    // Charger les données utilisateur
    await this.loadUserData();
    
    console.log('✅ Dashboard mounted - Terminé');
  },
  methods: {
    async checkAgentAssignment() {
      if (!this.userId) return;
      
      try {
        const response = await aiChatService.checkAgentAssignment(this.userId);
        if (response.success && response.agent) {
          this.assignedAgent = response.agent;
        }
      } catch (error) {
        console.error('Erreur lors de la vérification de l\'agent attribué:', error);
      }
    },
    
    async requestAgentAssignment() {
      if (!this.userId || this.isRequestingAgent) return;
      
      this.isRequestingAgent = true;
      try {
        const response = await aiChatService.requestAgentAssignment(this.userId);
        if (response.success && response.agent) {
          this.assignedAgent = response.agent;
          this.$toast?.success('Un agent vous a été attribué avec succès!');
        } else {
          this.$toast?.info('Votre demande a été enregistrée. Un agent vous sera attribué prochainement.');
        }
      } catch (error) {
        console.error('Erreur lors de la demande d\'attribution d\'agent:', error);
        this.$toast?.error('Erreur lors de la demande d\'agent. Veuillez réessayer.');
      } finally {
        this.isRequestingAgent = false;
      }
    },
    

  }
};
</script>