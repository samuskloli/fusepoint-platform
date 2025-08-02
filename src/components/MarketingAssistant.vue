<template>
  <div class="bg-white rounded-lg shadow-lg p-6">
    <!-- Header -->
    <div class="flex items-center justify-between mb-6">
      <div class="flex items-center space-x-3">
        <div class="p-2 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg">
          <svg class="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
          </svg>
        </div>
        <div>
          <h3 class="text-lg font-semibold text-gray-900">Assistant Marketing IA</h3>
          <p class="text-sm text-gray-600">Insights automatisés basés sur vos données</p>
        </div>
      </div>
      <button 
        @click="refreshInsights" 
        :disabled="loading"
        class="p-2 text-gray-400 hover:text-gray-600 transition-colors disabled:opacity-50"
      >
        <svg class="h-5 w-5" :class="{ 'animate-spin': loading }" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
        </svg>
      </button>
    </div>

    <!-- Loading State -->
    <div v-if="loading" class="flex items-center justify-center py-8">
      <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
      <span class="ml-3 text-gray-600">Analyse en cours...</span>
    </div>

    <!-- Error State -->
    <div v-else-if="error" class="bg-red-50 border border-red-200 rounded-lg p-4">
      <div class="flex items-center">
        <svg class="h-5 w-5 text-red-400 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <span class="text-red-800">{{ error }}</span>
      </div>
    </div>

    <!-- Content -->
    <div v-else-if="report">
      <!-- Summary Cards -->
      <div class="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div class="bg-gradient-to-r from-blue-50 to-blue-100 rounded-lg p-4">
          <div class="text-2xl font-bold text-blue-600">{{ report.summary.totalInsights }}</div>
          <div class="text-sm text-blue-600">Insights générés</div>
        </div>
        <div class="bg-gradient-to-r from-red-50 to-red-100 rounded-lg p-4">
          <div class="text-2xl font-bold text-red-600">{{ report.summary.highPriorityIssues }}</div>
          <div class="text-sm text-red-600">Priorité haute</div>
        </div>
        <div class="bg-gradient-to-r from-green-50 to-green-100 rounded-lg p-4">
          <div class="text-2xl font-bold text-green-600">{{ report.summary.opportunities }}</div>
          <div class="text-sm text-green-600">Opportunités</div>
        </div>
        <div class="bg-gradient-to-r from-purple-50 to-purple-100 rounded-lg p-4">
          <div class="text-2xl font-bold text-purple-600">{{ report.summary.overallHealth }}%</div>
          <div class="text-sm text-purple-600">Santé marketing</div>
        </div>
      </div>

      <!-- Tabs -->
      <div class="border-b border-gray-200 mb-6">
        <nav class="-mb-px flex space-x-8">
          <button
            v-for="tab in tabs"
            :key="tab.id"
            @click="activeTab = tab.id"
            :class="[
              'py-2 px-1 border-b-2 font-medium text-sm transition-colors',
              activeTab === tab.id
                ? 'border-purple-500 text-purple-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            ]"
          >
            {{ tab.name }}
          </button>
        </nav>
      </div>

      <!-- Tab Content -->
      <div class="space-y-4">
        <!-- Insights Tab -->
        <div v-if="activeTab === 'insights'">
          <div v-for="(categoryInsights, category) in report.insights" :key="category" class="mb-6">
            <h4 class="text-md font-semibold text-gray-900 mb-3 capitalize">
              {{ formatCategoryName(category) }}
            </h4>
            <div class="space-y-3">
              <div 
                v-for="insight in categoryInsights" 
                :key="insight.title"
                :class="[
                  'border-l-4 p-4 rounded-r-lg',
                  getInsightClasses(insight.type, insight.priority)
                ]"
              >
                <div class="flex items-start justify-between">
                  <div class="flex-1">
                    <div class="flex items-center space-x-2 mb-2">
                      <h5 class="font-medium text-gray-900">{{ insight.title }}</h5>
                      <span :class="getPriorityBadgeClasses(insight.priority)" class="px-2 py-1 text-xs rounded-full">
                        {{ insight.priority === 'high' ? 'Urgent' : insight.priority === 'medium' ? 'Important' : 'Info' }}
                      </span>
                    </div>
                    <p class="text-sm text-gray-600 mb-2">{{ insight.description }}</p>
                    <p class="text-sm font-medium text-gray-800">💡 {{ insight.recommendation }}</p>
                  </div>
                  <div class="ml-4">
                    <span :class="getImpactClasses(insight.impact)" class="px-2 py-1 text-xs rounded-full">
                      {{ formatImpact(insight.impact) }}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Action Plan Tab -->
        <div v-if="activeTab === 'actions'">
          <div class="space-y-4">
            <div 
              v-for="action in report.actionPlan" 
              :key="action.step"
              class="bg-gray-50 rounded-lg p-4 border border-gray-200"
            >
              <div class="flex items-start space-x-4">
                <div class="flex-shrink-0">
                  <div class="w-8 h-8 bg-purple-600 text-white rounded-full flex items-center justify-center text-sm font-medium">
                    {{ action.step }}
                  </div>
                </div>
                <div class="flex-1">
                  <h5 class="font-medium text-gray-900 mb-1">{{ action.title }}</h5>
                  <p class="text-sm text-gray-600 mb-2">{{ action.action }}</p>
                  <div class="flex items-center space-x-4 text-xs text-gray-500">
                    <span>Impact: {{ formatImpact(action.impact) }}</span>
                    <span>Effort: {{ action.estimatedEffort }}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Automations Tab -->
        <div v-if="activeTab === 'automations'">
          <div class="space-y-4">
            <div 
              v-for="automation in report.automations" 
              :key="automation.title"
              class="bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg p-4 border border-purple-200"
            >
              <div class="flex items-start justify-between">
                <div class="flex-1">
                  <div class="flex items-center space-x-2 mb-2">
                    <h5 class="font-medium text-gray-900">{{ automation.title }}</h5>
                    <span class="px-2 py-1 text-xs bg-purple-100 text-purple-800 rounded-full">
                      {{ automation.type.replace('_', ' ').toUpperCase() }}
                    </span>
                  </div>
                  <p class="text-sm text-gray-600 mb-2">{{ automation.description }}</p>
                  <div class="flex items-center space-x-4 text-xs text-gray-500">
                    <span>Déclencheur: {{ automation.trigger.replace('_', ' ') }}</span>
                    <span>Fréquence: {{ automation.frequency }}</span>
                  </div>
                </div>
                <button class="ml-4 px-3 py-1 bg-purple-600 text-white text-xs rounded-lg hover:bg-purple-700 transition-colors">
                  Activer
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Empty State -->
    <div v-else class="text-center py-8">
      <svg class="mx-auto h-12 w-12 text-gray-400 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
      </svg>
      <h3 class="text-lg font-medium text-gray-900 mb-2">Aucune analyse disponible</h3>
      <p class="text-gray-600 mb-4">Connectez Google Analytics pour commencer l'analyse</p>
      <button 
        @click="refreshInsights" 
        class="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors"
      >
        Générer des insights
      </button>
    </div>
  </div>
</template>

<script>
import marketingIntelligenceService from '../services/marketingIntelligenceService.js';
// Google Analytics service removed

export default {
  name: 'MarketingAssistant',
  data() {
    return {
      loading: false,
      error: null,
      report: null,
      activeTab: 'insights',
      tabs: [
        { id: 'insights', name: 'Insights' },
        { id: 'actions', name: 'Plan d\'action' },
        { id: 'automations', name: 'Automatisations' }
      ]
    };
  },
  async mounted() {
    await this.loadInsights();
  },
  methods: {
    async loadInsights() {
      // Google Analytics connection check removed

      this.loading = true;
      this.error = null;
      
      try {
        this.report = await marketingIntelligenceService.generateMarketingReport();
      } catch (error) {
        console.error('Erreur lors du chargement des insights:', error);
        this.error = 'Erreur lors de la génération des insights';
      } finally {
        this.loading = false;
      }
    },
    async refreshInsights() {
      await this.loadInsights();
    },
    formatCategoryName(category) {
      const names = {
        audienceInsights: 'Comportement Audience',
        contentPerformance: 'Performance Contenu',
        trafficOptimization: 'Optimisation Trafic',
        geographicOpportunities: 'Opportunités Géographiques',
        trendAnalysis: 'Analyse des Tendances',
        conversionOptimization: 'Optimisation Conversions'
      };
      return names[category] || category;
    },
    getInsightClasses(type, priority) {
      const baseClasses = 'bg-white';
      const typeClasses = {
        warning: 'border-red-400 bg-red-50',
        opportunity: 'border-green-400 bg-green-50',
        info: 'border-blue-400 bg-blue-50',
        positive: 'border-purple-400 bg-purple-50'
      };
      return `${baseClasses} ${typeClasses[type] || 'border-gray-400 bg-gray-50'}`;
    },
    getPriorityBadgeClasses(priority) {
      const classes = {
        high: 'bg-red-100 text-red-800',
        medium: 'bg-yellow-100 text-yellow-800',
        low: 'bg-gray-100 text-gray-800'
      };
      return classes[priority] || classes.low;
    },
    getImpactClasses(impact) {
      const classes = {
        conversion: 'bg-red-100 text-red-800',
        traffic: 'bg-blue-100 text-blue-800',
        engagement: 'bg-green-100 text-green-800',
        seo: 'bg-purple-100 text-purple-800',
        social: 'bg-pink-100 text-pink-800',
        content: 'bg-indigo-100 text-indigo-800',
        branding: 'bg-yellow-100 text-yellow-800'
      };
      return classes[impact] || 'bg-gray-100 text-gray-800';
    },
    formatImpact(impact) {
      const names = {
        conversion: 'Conversion',
        traffic: 'Trafic',
        engagement: 'Engagement',
        seo: 'SEO',
        social: 'Social',
        content: 'Contenu',
        branding: 'Marque',
        retention: 'Rétention',
        expansion: 'Expansion',
        localization: 'Localisation',
        timing: 'Timing',
        optimization: 'Optimisation'
      };
      return names[impact] || impact;
    }
  }
};
</script>