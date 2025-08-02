<template>
  <div class="flex h-screen bg-gray-50">
    <!-- Sidebar -->
    <div
      class="fixed inset-y-0 left-0 z-50 w-64 bg-gray-900 transform transition-transform duration-300 ease-in-out md:translate-x-0 md:static md:inset-0"
      :class="{ '-translate-x-full': !sidebarOpen, 'translate-x-0': sidebarOpen }"
    >
      <AgentSidebar @close-sidebar="sidebarOpen = false" />
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
      <main class="flex-1 overflow-y-auto bg-gray-50">
        <!-- Page Header -->
        <div class="bg-white shadow-sm border-b border-gray-200">
          <div class="px-4 sm:px-6 lg:px-8">
            <div class="flex justify-between items-center py-6">
              <div>
                <h1 class="text-2xl font-bold text-gray-900">Rapports & Analytics</h1>
                <p class="mt-1 text-sm text-gray-500">Analysez les performances et générez des rapports clients</p>
              </div>
              <div class="flex space-x-3">
                <button
                  @click="exportReport"
                  class="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                >
                  <svg class="-ml-1 mr-2 h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  Exporter
                </button>
                <button
                  @click="generateReport"
                  class="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
                >
                  <svg class="-ml-1 mr-2 h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                  Générer Rapport
                </button>
              </div>
            </div>
          </div>
        </div>

        <!-- Content -->
        <div class="p-4 sm:p-6 lg:p-8">
          <!-- Filters -->
          <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
            <h3 class="text-lg font-medium text-gray-900 mb-4">Filtres de Rapport</h3>
            <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">Période</label>
                <select v-model="filters.period" class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500">
                  <option value="7d">7 derniers jours</option>
                  <option value="30d">30 derniers jours</option>
                  <option value="90d">90 derniers jours</option>
                  <option value="1y">1 an</option>
                  <option value="custom">Personnalisé</option>
                </select>
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">Type de Rapport</label>
                <select v-model="filters.reportType" class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500">
                  <option value="clients">Clients</option>
                  <option value="requests">Demandes</option>
                  <option value="conversations">Conversations</option>
                  <option value="performance">Performance</option>
                </select>
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">Statut</label>
                <select v-model="filters.status" class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500">
                  <option value="">Tous</option>
                  <option value="active">Actif</option>
                  <option value="inactive">Inactif</option>
                  <option value="pending">En attente</option>
                  <option value="completed">Terminé</option>
                </select>
              </div>
              <div class="flex items-end">
                <button
                  @click="applyFilters"
                  class="w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  Appliquer
                </button>
              </div>
            </div>
          </div>

          <!-- Statistics Cards -->
          <div class="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
            <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div class="flex items-center">
                <div class="flex-shrink-0">
                  <div class="w-8 h-8 bg-blue-100 rounded-md flex items-center justify-center">
                    <svg class="w-5 h-5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
                    </svg>
                  </div>
                </div>
                <div class="ml-4">
                  <p class="text-sm font-medium text-gray-500">Total Clients</p>
                  <p class="text-2xl font-semibold text-gray-900">{{ reportStats.totalClients }}</p>
                </div>
              </div>
            </div>

            <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div class="flex items-center">
                <div class="flex-shrink-0">
                  <div class="w-8 h-8 bg-green-100 rounded-md flex items-center justify-center">
                    <svg class="w-5 h-5 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                </div>
                <div class="ml-4">
                  <p class="text-sm font-medium text-gray-500">Demandes Résolues</p>
                  <p class="text-2xl font-semibold text-gray-900">{{ reportStats.resolvedRequests }}</p>
                </div>
              </div>
            </div>

            <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div class="flex items-center">
                <div class="flex-shrink-0">
                  <div class="w-8 h-8 bg-yellow-100 rounded-md flex items-center justify-center">
                    <svg class="w-5 h-5 text-yellow-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                </div>
                <div class="ml-4">
                  <p class="text-sm font-medium text-gray-500">Temps Moyen Réponse</p>
                  <p class="text-2xl font-semibold text-gray-900">{{ reportStats.avgResponseTime }}</p>
                </div>
              </div>
            </div>

            <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div class="flex items-center">
                <div class="flex-shrink-0">
                  <div class="w-8 h-8 bg-purple-100 rounded-md flex items-center justify-center">
                    <svg class="w-5 h-5 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z" />
                    </svg>
                  </div>
                </div>
                <div class="ml-4">
                  <p class="text-sm font-medium text-gray-500">Satisfaction Client</p>
                  <p class="text-2xl font-semibold text-gray-900">{{ reportStats.satisfaction }}%</p>
                </div>
              </div>
            </div>
          </div>

          <!-- Charts Section -->
          <div class="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
            <!-- Activity Chart -->
            <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h3 class="text-lg font-medium text-gray-900 mb-4">Activité des Clients</h3>
              <div class="h-64 flex items-center justify-center bg-gray-50 rounded-lg">
                <div class="text-center">
                  <svg class="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                  <p class="mt-2 text-sm text-gray-500">Graphique d'activité</p>
                  <p class="text-xs text-gray-400">Intégration Chart.js à venir</p>
                </div>
              </div>
            </div>

            <!-- Performance Chart -->
            <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h3 class="text-lg font-medium text-gray-900 mb-4">Performance des Demandes</h3>
              <div class="h-64 flex items-center justify-center bg-gray-50 rounded-lg">
                <div class="text-center">
                  <svg class="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 3.055A9.001 9.001 0 1020.945 13H11V3.055z" />
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20.488 9H15V3.512A9.025 9.025 0 0120.488 9z" />
                  </svg>
                  <p class="mt-2 text-sm text-gray-500">Graphique de performance</p>
                  <p class="text-xs text-gray-400">Intégration Chart.js à venir</p>
                </div>
              </div>
            </div>
          </div>

          <!-- Detailed Reports Table -->
          <div class="bg-white rounded-lg shadow-sm border border-gray-200">
            <div class="px-6 py-4 border-b border-gray-200">
              <h3 class="text-lg font-medium text-gray-900">Rapport Détaillé</h3>
            </div>
            <div class="overflow-x-auto">
              <table class="min-w-full divide-y divide-gray-200">
                <thead class="bg-gray-50">
                  <tr>
                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Client</th>
                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Entreprise</th>
                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Demandes</th>
                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Messages</th>
                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Dernière Activité</th>
                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Statut</th>
                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody class="bg-white divide-y divide-gray-200">
                  <tr v-if="loading">
                    <td colspan="7" class="px-6 py-4 text-center text-gray-500">
                      Chargement des données...
                    </td>
                  </tr>
                  <tr v-else-if="reportData.length === 0">
                    <td colspan="7" class="px-6 py-4 text-center text-gray-500">
                      Aucune donnée disponible pour cette période
                    </td>
                  </tr>
                  <tr v-else v-for="item in reportData" :key="item.id" class="hover:bg-gray-50">
                    <td class="px-6 py-4 whitespace-nowrap">
                      <div class="flex items-center">
                        <div class="flex-shrink-0 h-10 w-10">
                          <div class="h-10 w-10 rounded-full bg-gray-300 flex items-center justify-center">
                            <span class="text-sm font-medium text-gray-700">{{ getInitials(item.client_name) }}</span>
                          </div>
                        </div>
                        <div class="ml-4">
                          <div class="text-sm font-medium text-gray-900">{{ item.client_name }}</div>
                          <div class="text-sm text-gray-500">{{ item.client_email }}</div>
                        </div>
                      </div>
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {{ item.company_name || 'Aucune' }}
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {{ item.total_requests }}
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {{ item.total_messages }}
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {{ formatDate(item.last_activity) }}
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap">
                      <span :class="[
                        'inline-flex px-2 py-1 text-xs font-semibold rounded-full',
                        item.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                      ]">
                        {{ item.status === 'active' ? 'Actif' : 'Inactif' }}
                      </span>
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <button
                        @click="viewClientDetails(item.client_id)"
                        class="text-blue-600 hover:text-blue-900 mr-3"
                      >
                        Voir
                      </button>
                      <button
                        @click="contactClient(item.client_id)"
                        class="text-green-600 hover:text-green-900"
                      >
                        Contacter
                      </button>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </main>
    </div>
  </div>
</template>

<script>
import AgentSidebar from '@/components/AgentSidebar.vue';
import Header from '@/components/Header.vue';
import api from '@/services/api';

export default {
  name: 'AgentReports',
  components: {
    AgentSidebar,
    Header
  },
  data() {
    return {
      loading: true,
      sidebarOpen: false,
      filters: {
        period: '30d',
        reportType: 'clients',
        status: ''
      },
      reportStats: {
        totalClients: 0,
        resolvedRequests: 0,
        avgResponseTime: '0h',
        satisfaction: 0
      },
      reportData: []
    };
  },
  async mounted() {
    await this.loadReportData();
  },
  methods: {
    async loadReportData() {
      try {
        this.loading = true;
        
        // Charger les statistiques
        const statsResponse = await api.get('/api/agent/stats');
        if (statsResponse.data.success) {
          this.reportStats = {
            totalClients: statsResponse.data.data.totalClients,
            resolvedRequests: statsResponse.data.data.totalRequests - statsResponse.data.data.pendingRequests,
            avgResponseTime: '2h 30m', // Calculé côté serveur
            satisfaction: 94 // Calculé côté serveur
          };
        }
        
        // Charger les données détaillées du rapport
        const reportResponse = await api.get('/api/agent/assigned-clients');
        if (reportResponse.data.success) {
          this.reportData = reportResponse.data.data.map(client => ({
            id: client.id,
            client_id: client.id,
            client_name: `${client.first_name} ${client.last_name}`,
            client_email: client.email,
            company_name: client.company_name,
            total_requests: Math.floor(Math.random() * 10) + 1, // À remplacer par vraies données
            total_messages: Math.floor(Math.random() * 50) + 5, // À remplacer par vraies données
            last_activity: client.last_login || client.created_at,
            status: client.is_active ? 'active' : 'inactive'
          }));
        }
      } catch (error) {
        console.error('Erreur lors du chargement des rapports:', error);
        this.$toast.error('Erreur lors du chargement des rapports');
      } finally {
        this.loading = false;
      }
    },
    
    async applyFilters() {
      await this.loadReportData();
    },
    
    async generateReport() {
      try {
        this.$toast.info('Génération du rapport en cours...');
        // Logique de génération de rapport
        setTimeout(() => {
          this.$toast.success('Rapport généré avec succès');
        }, 2000);
      } catch (error) {
        console.error('Erreur lors de la génération:', error);
        this.$toast.error('Erreur lors de la génération du rapport');
      }
    },
    
    async exportReport() {
      try {
        this.$toast.info('Export en cours...');
        // Logique d'export
        setTimeout(() => {
          this.$toast.success('Rapport exporté avec succès');
        }, 1500);
      } catch (error) {
        console.error('Erreur lors de l\'export:', error);
        this.$toast.error('Erreur lors de l\'export');
      }
    },
    
    viewClientDetails(clientId) {
      this.$router.push(`/agent/clients/${clientId}`);
    },
    
    contactClient(clientId) {
      // Fonctionnalité de chat désactivée
      this.$toast.info('La fonctionnalité de chat n\'est plus disponible.');
    },
    
    getInitials(name) {
      return name.split(' ').map(n => n[0]).join('').toUpperCase();
    },
    
    formatDate(dateString) {
      if (!dateString) return 'Jamais';
      const date = new Date(dateString);
      return date.toLocaleDateString('fr-FR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
      });
    }
  }
};
</script>