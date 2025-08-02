<template>
  <Layout>
    <div>
      <!-- Configuration Setup -->
      <div v-if="showSetup">
        <GoogleAnalyticsSetup @connection-updated="handleConnectionUpdate" />
      </div>
      
      <!-- Analytics Dashboard -->
      <div v-else>
        <!-- Page Header -->
        <div class="mb-8">
          <div class="flex items-center justify-between">
            <div>
              <h1 class="text-3xl font-bold text-gray-900">Google Analytics</h1>
              <p class="mt-2 text-gray-600">Analysez le comportement de vos visiteurs</p>
            </div>
            <div class="flex items-center space-x-4">
              <div class="flex items-center space-x-2">
                <span :class="connectionStatusClass" class="w-3 h-3 rounded-full"></span>
                <span class="text-sm text-gray-600">{{ connectionStatus }}</span>
              </div>
              <button
                @click="showSetup = true"
                class="text-sm text-primary-600 hover:text-primary-800"
              >
                Paramètres
              </button>
            </div>
          </div>
        </div>

        <!-- Time Period Selector -->
        <div class="mb-6">
          <div class="flex space-x-2">
            <button 
              @click="changePeriod('7daysAgo', 'today')"
              :class="selectedPeriod === '7daysAgo' ? 'bg-primary-600 text-white' : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'"
              class="px-4 py-2 rounded-lg text-sm font-medium"
            >
              7 derniers jours
            </button>
            <button 
              @click="changePeriod('30daysAgo', 'today')"
              :class="selectedPeriod === '30daysAgo' ? 'bg-primary-600 text-white' : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'"
              class="px-4 py-2 rounded-lg text-sm font-medium"
            >
              30 derniers jours
            </button>
            <button 
              @click="changePeriod('90daysAgo', 'today')"
              :class="selectedPeriod === '90daysAgo' ? 'bg-primary-600 text-white' : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'"
              class="px-4 py-2 rounded-lg text-sm font-medium"
            >
              3 derniers mois
            </button>
          </div>
        </div>

        <!-- Loading State -->
        <div v-if="loading" class="flex items-center justify-center py-12">
          <svg class="animate-spin h-8 w-8 text-primary-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <span class="ml-2 text-gray-600">Chargement des données...</span>
        </div>

        <!-- Error State -->
        <div v-else-if="error" class="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
          <div class="flex">
            <svg class="h-5 w-5 text-red-400 mr-2" fill="currentColor" viewBox="0 0 20 20">
              <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd" />
            </svg>
            <div>
              <h3 class="text-sm font-medium text-red-800">Erreur de chargement</h3>
              <p class="text-sm text-red-700 mt-1">{{ error }}</p>
              <button @click="loadData" class="mt-2 text-sm text-red-600 hover:text-red-800 underline">
                Réessayer
              </button>
            </div>
          </div>
        </div>

        <!-- Key Metrics -->
        <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div class="bg-white rounded-lg shadow p-6">
            <div class="flex items-center justify-between">
              <div>
                <p class="text-sm font-medium text-gray-600">Sessions</p>
                <p class="text-2xl font-bold text-gray-900">{{ metrics.sessions || '0' }}</p>
                <p class="text-sm text-gray-500">Période sélectionnée</p>
              </div>
              <div class="p-2 bg-blue-100 rounded-lg">
                <svg class="h-6 w-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </div>
            </div>
          </div>

          <div class="bg-white rounded-lg shadow p-6">
            <div class="flex items-center justify-between">
              <div>
                <p class="text-sm font-medium text-gray-600">Utilisateurs</p>
                <p class="text-2xl font-bold text-gray-900">{{ metrics.users || '0' }}</p>
                <p class="text-sm text-gray-500">Période sélectionnée</p>
              </div>
              <div class="p-2 bg-green-100 rounded-lg">
                <svg class="h-6 w-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </div>
            </div>
          </div>

          <div class="bg-white rounded-lg shadow p-6">
            <div class="flex items-center justify-between">
              <div>
                <p class="text-sm font-medium text-gray-600">Durée moyenne</p>
                <p class="text-2xl font-bold text-gray-900">{{ metrics.averageSessionDuration || '0m 0s' }}</p>
                <p class="text-sm text-gray-500">Période sélectionnée</p>
              </div>
              <div class="p-2 bg-purple-100 rounded-lg">
                <svg class="h-6 w-6 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
          </div>

          <div class="bg-white rounded-lg shadow p-6">
            <div class="flex items-center justify-between">
              <div>
                <p class="text-sm font-medium text-gray-600">Taux de rebond</p>
                <p class="text-2xl font-bold text-gray-900">{{ metrics.bounceRate || '0%' }}</p>
                <p class="text-sm text-gray-500">Période sélectionnée</p>
              </div>
              <div class="p-2 bg-orange-100 rounded-lg">
                <svg class="h-6 w-6 text-orange-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 17h8m0 0V9m0 8l-8-8-4 4-6-6" />
                </svg>
              </div>
            </div>
          </div>
        </div>

        <!-- Charts -->
        <div v-if="!loading && !error" class="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <div class="bg-white rounded-lg shadow p-6">
            <h3 class="text-lg font-semibold text-gray-900 mb-4">Sessions au fil du temps</h3>
            <div class="h-64">
              <div v-if="sessionsOverTime.length > 0" class="h-full">
                <!-- Graphique simple avec les données -->
                <div class="space-y-2">
                  <div v-for="(item, index) in sessionsOverTime.slice(0, 7)" :key="index" class="flex items-center justify-between text-sm">
                    <span class="text-gray-600">{{ formatDate(item.date) }}</span>
                    <div class="flex items-center">
                      <div class="w-32 bg-gray-200 rounded-full h-2 mr-2">
                        <div class="bg-primary-600 h-2 rounded-full" :style="{ width: getBarWidth(item.sessions, sessionsOverTime) + '%' }"></div>
                      </div>
                      <span class="text-gray-900 font-medium w-16 text-right">{{ item.sessions.toLocaleString() }}</span>
                    </div>
                  </div>
                </div>
              </div>
              <div v-else class="h-full bg-gray-100 rounded-lg flex items-center justify-center">
                <p class="text-gray-500">Aucune donnée disponible</p>
              </div>
            </div>
          </div>

          <div class="bg-white rounded-lg shadow p-6">
            <h3 class="text-lg font-semibold text-gray-900 mb-4">Sources de trafic</h3>
            <div class="h-64">
              <div v-if="trafficSources.length > 0" class="space-y-3">
                <div v-for="(source, index) in trafficSources.slice(0, 5)" :key="index" class="flex items-center justify-between">
                  <div class="flex items-center">
                    <div class="w-3 h-3 rounded-full mr-3" :class="getSourceColor(index)"></div>
                    <span class="text-gray-900 font-medium">{{ source.source }}</span>
                  </div>
                  <div class="text-right">
                    <div class="text-gray-900 font-medium">{{ source.sessions.toLocaleString() }}</div>
                    <div class="text-sm text-gray-500">{{ getPercentage(source.sessions, trafficSources) }}%</div>
                  </div>
                </div>
              </div>
              <div v-else class="h-full bg-gray-100 rounded-lg flex items-center justify-center">
                <p class="text-gray-500">Aucune donnée disponible</p>
              </div>
            </div>
          </div>
        </div>

        <!-- Detailed Tables -->
        <div v-if="!loading && !error" class="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <!-- Top Pages -->
          <div class="bg-white rounded-lg shadow">
            <div class="px-6 py-4 border-b border-gray-200">
              <h3 class="text-lg font-semibold text-gray-900">Pages les plus visitées</h3>
            </div>
            <div class="p-6">
              <div v-if="topPages.length > 0" class="space-y-4">
                <div v-for="(page, index) in topPages" :key="index" class="flex items-center justify-between">
                  <div>
                    <p class="font-medium text-gray-900">{{ page.path }}</p>
                    <p class="text-sm text-gray-600">{{ page.title || 'Sans titre' }}</p>
                  </div>
                  <div class="text-right">
                    <p class="font-medium text-gray-900">{{ page.views.toLocaleString() }}</p>
                    <p class="text-sm text-gray-600">vues</p>
                  </div>
                </div>
              </div>
              <div v-else class="text-center py-8">
                <p class="text-gray-500">Aucune donnée disponible</p>
              </div>
            </div>
          </div>

          <!-- Geographic Data -->
          <div class="bg-white rounded-lg shadow">
            <div class="px-6 py-4 border-b border-gray-200">
              <h3 class="text-lg font-semibold text-gray-900">Répartition géographique</h3>
            </div>
            <div class="p-6">
              <div v-if="geographicData.length > 0" class="space-y-4">
                <div v-for="(country, index) in geographicData" :key="index" class="flex items-center justify-between">
                  <div class="flex items-center">
                    <span class="text-lg mr-2">{{ getCountryFlag(country.country) }}</span>
                    <span class="font-medium text-gray-900">{{ country.country }}</span>
                  </div>
                  <div class="text-right">
                    <p class="font-medium text-gray-900">{{ country.users.toLocaleString() }}</p>
                    <p class="text-sm text-gray-600">{{ getCountryPercentage(country.users, geographicData) }}%</p>
                  </div>
                </div>
              </div>
              <div v-else class="text-center py-8">
                <p class="text-gray-500">Aucune donnée disponible</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </Layout>
</template>

<script>
import Layout from '../../components/Layout.vue';
import GoogleAnalyticsSetup from '../../components/GoogleAnalyticsSetup.vue';
import googleAnalyticsService from '../../services/googleAnalyticsService.js';

export default {
  name: 'GoogleAnalytics',
  components: {
    Layout,
    GoogleAnalyticsSetup
  },
  data() {
    return {
      showSetup: false,
      loading: false,
      error: null,
      selectedPeriod: '7daysAgo',
      endDate: 'today',
      metrics: {
        sessions: '0',
        users: '0',
        averageSessionDuration: '0m 0s',
        bounceRate: '0%',
        pageViews: '0'
      },
      sessionsOverTime: [],
      trafficSources: [],
      topPages: [],
      geographicData: []
    };
  },
  computed: {
    isConnected() {
      return googleAnalyticsService.isConnected();
    },
    connectionStatus() {
      return this.isConnected ? 'Connecté' : 'Non connecté';
    },
    connectionStatusClass() {
      return this.isConnected ? 'bg-green-400' : 'bg-red-400';
    }
  },
  async mounted() {
    // Vérifier si on doit afficher la configuration
    const setupParam = this.$route.query.setup;
    if (setupParam === 'true' || !this.isConnected) {
      this.showSetup = true;
    } else {
      await this.loadData();
    }
  },
  methods: {
    async loadData() {
      if (!this.isConnected) {
        this.showSetup = true;
        return;
      }

      this.loading = true;
      this.error = null;

      try {
        // Charger toutes les données en parallèle
        const [metrics, sessionsData, trafficData, pagesData, geoData] = await Promise.all([
          googleAnalyticsService.getMainMetrics(this.selectedPeriod, this.endDate),
          googleAnalyticsService.getSessionsOverTime(this.selectedPeriod, this.endDate),
          googleAnalyticsService.getTrafficSources(this.selectedPeriod, this.endDate),
          googleAnalyticsService.getTopPages(this.selectedPeriod, this.endDate),
          googleAnalyticsService.getGeographicData(this.selectedPeriod, this.endDate)
        ]);

        this.metrics = metrics;
        this.sessionsOverTime = sessionsData;
        this.trafficSources = trafficData;
        this.topPages = pagesData;
        this.geographicData = geoData;

      } catch (error) {
        console.error('Erreur lors du chargement des données:', error);
        this.error = error.message;
      } finally {
        this.loading = false;
      }
    },

    async changePeriod(startDate, endDate) {
      this.selectedPeriod = startDate;
      this.endDate = endDate;
      await this.loadData();
    },

    handleConnectionUpdate() {
      this.showSetup = false;
      this.loadData();
    },

    formatDate(dateString) {
      const date = new Date(dateString.replace(/(\d{4})(\d{2})(\d{2})/, '$1-$2-$3'));
      return date.toLocaleDateString('fr-FR', { month: 'short', day: 'numeric' });
    },

    getBarWidth(value, data) {
      if (!data.length) return 0;
      const max = Math.max(...data.map(item => item.sessions));
      return max > 0 ? (value / max) * 100 : 0;
    },

    getSourceColor(index) {
      const colors = [
        'bg-blue-500',
        'bg-green-500',
        'bg-yellow-500',
        'bg-purple-500',
        'bg-red-500'
      ];
      return colors[index % colors.length];
    },

    getPercentage(value, data) {
      const total = data.reduce((sum, item) => sum + item.sessions, 0);
      return total > 0 ? ((value / total) * 100).toFixed(1) : 0;
    },

    getCountryFlag(countryName) {
      const flags = {
        'France': '🇫🇷',
        'Belgium': '🇧🇪',
        'Switzerland': '🇨🇭',
        'Canada': '🇨🇦',
        'United States': '🇺🇸',
        'Germany': '🇩🇪',
        'United Kingdom': '🇬🇧',
        'Spain': '🇪🇸',
        'Italy': '🇮🇹',
        'Netherlands': '🇳🇱'
      };
      return flags[countryName] || '🌍';
    },

    getCountryPercentage(value, data) {
      const total = data.reduce((sum, item) => sum + item.users, 0);
      return total > 0 ? ((value / total) * 100).toFixed(1) : 0;
    }
  }
};
</script>