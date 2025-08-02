<template>
  <div class="analytics-dashboard">
    <div class="dashboard-header">
      <h2 class="text-2xl font-bold text-gray-800 mb-6">
        📊 Tableau de bord Google Analytics
      </h2>
      
      <!-- Statut de connexion -->
      <div class="connection-status mb-4">
        <div v-if="isConnected" class="flex items-center text-green-600">
          <svg class="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
            <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"></path>
          </svg>
          Connecté à GA4 (Propriété: {{ propertyId }})
        </div>
        <div v-else class="flex items-center text-red-600">
          <svg class="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
            <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd"></path>
          </svg>
          Non connecté
        </div>
      </div>
    </div>

    <!-- Contrôles de période -->
    <div class="date-controls mb-6">
      <div class="flex gap-4 items-center">
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Date de début</label>
          <input 
            v-model="startDate" 
            type="date" 
            class="border border-gray-300 rounded-md px-3 py-2"
          >
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Date de fin</label>
          <input 
            v-model="endDate" 
            type="date" 
            class="border border-gray-300 rounded-md px-3 py-2"
          >
        </div>
        <button 
          @click="refreshData" 
          :disabled="loading"
          class="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 disabled:opacity-50 mt-6"
        >
          {{ loading ? 'Chargement...' : 'Actualiser' }}
        </button>
      </div>
    </div>

    <!-- Indicateurs de chargement -->
    <div v-if="loading" class="text-center py-8">
      <div class="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      <p class="mt-2 text-gray-600">Récupération des données...</p>
    </div>

    <!-- Données Analytics -->
    <div v-else-if="isConnected" class="analytics-data">
      <!-- Sources de trafic -->
      <div class="data-section mb-8">
        <h3 class="text-xl font-semibold text-gray-800 mb-4">🚀 Sources de trafic</h3>
        <div v-if="trafficSources.length > 0" class="bg-white rounded-lg shadow p-6">
          <div class="grid gap-4">
            <div 
              v-for="source in trafficSources" 
              :key="source.source"
              class="flex justify-between items-center p-3 bg-gray-50 rounded"
            >
              <div>
                <span class="font-medium">{{ source.source }}</span>
                <span class="text-sm text-gray-600 ml-2">({{ source.users }} utilisateurs)</span>
              </div>
              <div class="text-right">
                <div class="font-bold text-blue-600">{{ source.sessions }} sessions</div>
                <div class="text-sm text-gray-500">Taux de rebond: {{ (source.bounceRate * 100).toFixed(1) }}%</div>
              </div>
            </div>
          </div>
        </div>
        <div v-else class="text-gray-500 italic">Aucune donnée de trafic disponible</div>
      </div>

      <!-- Pages populaires -->
      <div class="data-section mb-8">
        <h3 class="text-xl font-semibold text-gray-800 mb-4">📄 Pages les plus visitées</h3>
        <div v-if="topPages.length > 0" class="bg-white rounded-lg shadow p-6">
          <div class="space-y-3">
            <div 
              v-for="(page, index) in topPages" 
              :key="page.path"
              class="flex items-center justify-between p-3 bg-gray-50 rounded"
            >
              <div class="flex items-center">
                <span class="bg-blue-100 text-blue-800 text-xs font-medium px-2 py-1 rounded-full mr-3">
                  {{ index + 1 }}
                </span>
                <div>
                  <div class="font-medium truncate max-w-md">{{ page.title || page.path }}</div>
                  <div class="text-sm text-gray-500">{{ page.path }}</div>
                </div>
              </div>
              <div class="text-right">
                <div class="font-bold text-green-600">{{ page.pageViews }} vues</div>
                <div class="text-sm text-gray-500">{{ page.users }} utilisateurs</div>
              </div>
            </div>
          </div>
        </div>
        <div v-else class="text-gray-500 italic">Aucune donnée de pages disponible</div>
      </div>

      <!-- Données géographiques -->
      <div class="data-section mb-8">
        <h3 class="text-xl font-semibold text-gray-800 mb-4">🌍 Répartition géographique</h3>
        <div v-if="geographicData.length > 0" class="bg-white rounded-lg shadow p-6">
          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div 
              v-for="country in geographicData.slice(0, 9)" 
              :key="country.country"
              class="flex justify-between items-center p-3 bg-gray-50 rounded"
            >
              <span class="font-medium">{{ country.country }}</span>
              <div class="text-right">
                <div class="font-bold text-purple-600">{{ country.users }}</div>
                <div class="text-sm text-gray-500">{{ country.sessions }} sessions</div>
              </div>
            </div>
          </div>
        </div>
        <div v-else class="text-gray-500 italic">Aucune donnée géographique disponible</div>
      </div>

      <!-- JSON brut pour débogage -->
      <div class="debug-section" v-if="showDebug">
        <h3 class="text-xl font-semibold text-gray-800 mb-4">🔧 Données JSON brutes</h3>
        <div class="bg-gray-900 text-green-400 p-4 rounded-lg overflow-auto">
          <pre class="text-sm">{{ JSON.stringify(debugData, null, 2) }}</pre>
        </div>
      </div>
    </div>

    <!-- Message si non connecté -->
    <div v-else class="text-center py-12">
      <div class="text-gray-400 mb-4">
        <svg class="w-16 h-16 mx-auto" fill="currentColor" viewBox="0 0 20 20">
          <path fill-rule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zm0 4a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H4a1 1 0 01-1-1V8zm8 0a1 1 0 011-1h4a1 1 0 011 1v2a1 1 0 01-1 1h-4a1 1 0 01-1-1V8zm0 4a1 1 0 011-1h4a1 1 0 011 1v2a1 1 0 01-1 1h-4a1 1 0 01-1-1v-2z" clip-rule="evenodd"></path>
        </svg>
      </div>
      <h3 class="text-xl font-semibold text-gray-600 mb-2">Aucune connexion Google Analytics</h3>
      <p class="text-gray-500 mb-4">Configurez d'abord votre connexion Google Analytics pour voir les données.</p>
      <router-link 
        to="/analytics/setup" 
        class="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 inline-block"
      >
        Configurer Google Analytics
      </router-link>
    </div>

    <!-- Bouton debug -->
    <div class="fixed bottom-4 right-4">
      <button 
        @click="showDebug = !showDebug"
        class="bg-gray-600 text-white p-2 rounded-full hover:bg-gray-700"
        title="Afficher/Masquer les données JSON"
      >
        🔧
      </button>
    </div>
  </div>
</template>

<script>
import googleAnalyticsProxyService from '../services/googleAnalyticsProxy.js';

export default {
  name: 'GoogleAnalyticsDashboard',
  data() {
    return {
      loading: false,
      showDebug: false,
      startDate: this.getDateString(-30), // 30 jours avant
      endDate: this.getDateString(0), // Aujourd'hui
      trafficSources: [],
      topPages: [],
      geographicData: [],
      debugData: {}
    };
  },
  computed: {
    isConnected() {
      return googleAnalyticsProxyService.isConnected();
    },
    propertyId() {
      return googleAnalyticsProxyService.getPropertyId();
    }
  },
  async mounted() {
    if (this.isConnected) {
      await this.loadData();
    }
  },
  methods: {
    /**
     * Génère une date au format YYYY-MM-DD
     */
    getDateString(daysOffset) {
      const date = new Date();
      date.setDate(date.getDate() + daysOffset);
      return date.toISOString().split('T')[0];
    },

    /**
     * Charge toutes les données Analytics
     */
    async loadData() {
      this.loading = true;
      try {
        // Charger les données en parallèle
        const [trafficSources, topPages, geographicData] = await Promise.all([
          googleAnalyticsProxyService.getTrafficSources(this.startDate, this.endDate),
          googleAnalyticsProxyService.getTopPages(this.startDate, this.endDate),
          googleAnalyticsProxyService.getGeographicData(this.startDate, this.endDate)
        ]);

        // Assigner les données
        this.trafficSources = trafficSources || [];
        this.topPages = topPages || [];
        this.geographicData = geographicData || [];

        // Données de débogage
        this.debugData = {
          trafficSources: this.trafficSources,
          topPages: this.topPages,
          geographicData: this.geographicData,
          dateRange: {
            start: this.startDate,
            end: this.endDate
          },
          propertyId: this.propertyId
        };

        console.log('📊 Données Analytics chargées:', this.debugData);
      } catch (error) {
        console.error('❌ Erreur chargement données:', error);
        this.$toast?.error(`Erreur: ${error.message}`);
      } finally {
        this.loading = false;
      }
    },

    /**
     * Actualise les données
     */
    async refreshData() {
      await this.loadData();
    }
  }
};
</script>

<style scoped>
.analytics-dashboard {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
}

.data-section {
  margin-bottom: 2rem;
}

.debug-section pre {
  max-height: 400px;
  overflow-y: auto;
}

@media (max-width: 768px) {
  .date-controls .flex {
    flex-direction: column;
    gap: 1rem;
  }
  
  .date-controls button {
    margin-top: 0;
  }
}
</style>