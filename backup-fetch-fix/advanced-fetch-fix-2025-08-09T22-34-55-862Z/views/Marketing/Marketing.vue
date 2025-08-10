<template>
  <Layout>
    <div>
          <!-- Page Header -->
          <div class="mb-8">
            <div class="flex items-center justify-between">
              <div>
                <h1 class="text-3xl font-bold text-gray-900">Marketing Intelligence</h1>
                <p class="mt-2 text-gray-600">Plateforme marketing alimentée par l'IA - Fusepoint</p>
              </div>
              <div class="flex space-x-3">
                <button @click="activeView = 'integrated'" :class="activeView === 'integrated' ? 'bg-purple-600 text-white' : 'bg-gray-100 text-gray-700'" class="px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors">
                  Tableau de Bord IA
                </button>
                <button @click="activeView = 'agents'" :class="activeView === 'agents' ? 'bg-purple-600 text-white' : 'bg-gray-100 text-gray-700'" class="px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors">
                  Agents IA
                </button>
                <button @click="activeView = 'campaigns'" :class="activeView === 'campaigns' ? 'bg-purple-600 text-white' : 'bg-gray-100 text-gray-700'" class="px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors">
                  Campagnes
                </button>
                <button @click="activeView = 'automated'" :class="activeView === 'automated' ? 'bg-purple-600 text-white' : 'bg-gray-100 text-gray-700'" class="px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors">
                  Campagnes IA
                </button>
                <button @click="activeView = 'assistant'" :class="activeView === 'assistant' ? 'bg-purple-600 text-white' : 'bg-gray-100 text-gray-700'" class="px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors">
                  Assistant IA
                </button>
                <button @click="activeView = 'predictive'" :class="activeView === 'predictive' ? 'bg-purple-600 text-white' : 'bg-gray-100 text-gray-700'" class="px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors">
                  Analyse Prédictive
                </button>
                <button @click="activeView = 'clients'" :class="activeView === 'clients' ? 'bg-purple-600 text-white' : 'bg-gray-100 text-gray-700'" class="px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors">
                  Gestion Clients
                </button>
              </div>
            </div>
          </div>



          <!-- Content based on active view -->
          <div v-if="activeView === 'integrated'">
            <IntegratedAIDashboard @open-chat="$emit('open-chat')" />
          </div>
          
          <div v-else-if="activeView === 'agents'">
            <MarketingAgents />
          </div>
          
          <div v-else-if="activeView === 'assistant'">
            <MarketingAssistant />
          </div>
          
          <div v-else-if="activeView === 'automated'">
            <AutomatedCampaigns @show-notification="showNotification" />
          </div>
          
          <div v-else-if="activeView === 'predictive'">
            <PredictiveAnalyticsDashboard />
          </div>
          
          <div v-else-if="activeView === 'clients'">
            <ClientManagement />
          </div>

          <div v-else-if="activeView === 'campaigns'">
            <!-- Quick Stats -->
            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div class="bg-white rounded-lg shadow p-6">
              <div class="flex items-center justify-between">
                <div>
                  <p class="text-sm font-medium text-gray-600">Campagnes actives</p>
                  <p class="text-2xl font-bold text-gray-900">12</p>
                  <p class="text-sm text-green-600">+3 ce mois</p>
                </div>
                <div class="p-2 bg-blue-100 rounded-lg">
                  <svg class="h-6 w-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                  </svg>
                </div>
              </div>
            </div>

            <div class="bg-white rounded-lg shadow p-6">
              <div class="flex items-center justify-between">
                <div>
                  <p class="text-sm font-medium text-gray-600">Taux de conversion</p>
                  <p class="text-2xl font-bold text-gray-900">3.8%</p>
                  <p class="text-sm text-green-600">+0.5% ce mois</p>
                </div>
                <div class="p-2 bg-green-100 rounded-lg">
                  <svg class="h-6 w-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
              </div>
            </div>

            <div class="bg-white rounded-lg shadow p-6">
              <div class="flex items-center justify-between">
                <div>
                  <p class="text-sm font-medium text-gray-600">ROI moyen</p>
                  <p class="text-2xl font-bold text-gray-900">285%</p>
                  <p class="text-sm text-green-600">+12% ce mois</p>
                </div>
                <div class="p-2 bg-yellow-100 rounded-lg">
                  <svg class="h-6 w-6 text-yellow-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                  </svg>
                </div>
              </div>
            </div>

            <div class="bg-white rounded-lg shadow p-6">
              <div class="flex items-center justify-between">
                <div>
                  <p class="text-sm font-medium text-gray-600">Budget total</p>
                  <p class="text-2xl font-bold text-gray-900">{{ $formatCurrency(45230) }}</p>
                  <p class="text-sm text-gray-600">Ce mois</p>
                </div>
                <div class="p-2 bg-purple-100 rounded-lg">
                  <svg class="h-6 w-6 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                </div>
              </div>
            </div>
          </div>

          <!-- Campaign Performance Chart -->
          <div class="bg-white rounded-lg shadow p-6 mb-8">
            <div class="flex items-center justify-between mb-6">
              <h3 class="text-lg font-semibold text-gray-900">Performance des campagnes</h3>
              <div class="flex space-x-2">
                <button class="px-3 py-1 text-sm bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200">7j</button>
                <button class="px-3 py-1 text-sm bg-primary-600 text-white rounded-md">30j</button>
                <button class="px-3 py-1 text-sm bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200">90j</button>
              </div>
            </div>
            <div class="h-64 bg-gray-100 rounded-lg flex items-center justify-center">
              <p class="text-gray-500">Graphique des performances - Impressions, Clics, Conversions</p>
            </div>
          </div>

          <!-- Active Campaigns -->
          <div class="bg-white rounded-lg shadow mb-8">
            <div class="px-6 py-4 border-b border-gray-200">
              <div class="flex items-center justify-between">
                <h3 class="text-lg font-semibold text-gray-900">Campagnes actives</h3>
                <router-link to="/marketing/campaigns" class="text-primary-600 hover:text-primary-700 text-sm font-medium">
                  Voir toutes
                </router-link>
              </div>
            </div>
            <div class="p-6">
              <div class="space-y-4">
                <div class="border border-gray-200 rounded-lg p-4">
                  <div class="flex items-center justify-between mb-3">
                    <div class="flex items-center space-x-3">
                      <div class="w-3 h-3 bg-green-400 rounded-full"></div>
                      <h4 class="font-medium text-gray-900">Campagne Été 2024</h4>
                      <span class="px-2 py-1 text-xs bg-green-100 text-green-800 rounded-full">Actif</span>
                    </div>
                    <div class="text-right">
                      <p class="text-sm font-medium text-gray-900">{{ $formatCurrency(8450) }} / {{ $formatCurrency(10000) }}</p>
                      <p class="text-xs text-gray-600">Budget utilisé</p>
                    </div>
                  </div>
                  <div class="grid grid-cols-4 gap-4 text-sm">
                    <div>
                      <p class="font-medium text-gray-900">156,789</p>
                      <p class="text-gray-600">Impressions</p>
                    </div>
                    <div>
                      <p class="font-medium text-gray-900">4,567</p>
                      <p class="text-gray-600">Clics</p>
                    </div>
                    <div>
                      <p class="font-medium text-gray-900">2.9%</p>
                      <p class="text-gray-600">CTR</p>
                    </div>
                    <div>
                      <p class="font-medium text-gray-900">234</p>
                      <p class="text-gray-600">Conversions</p>
                    </div>
                  </div>
                  <div class="mt-3">
                    <div class="w-full bg-gray-200 rounded-full h-2">
                      <div class="bg-green-600 h-2 rounded-full" style="width: 84.5%"></div>
                    </div>
                  </div>
                </div>

                <div class="border border-gray-200 rounded-lg p-4">
                  <div class="flex items-center justify-between mb-3">
                    <div class="flex items-center space-x-3">
                      <div class="w-3 h-3 bg-blue-400 rounded-full"></div>
                      <h4 class="font-medium text-gray-900">Lancement Produit X</h4>
                      <span class="px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded-full">Actif</span>
                    </div>
                    <div class="text-right">
                      <p class="text-sm font-medium text-gray-900">{{ $formatCurrency(3200) }} / {{ $formatCurrency(5000) }}</p>
                      <p class="text-xs text-gray-600">Budget utilisé</p>
                    </div>
                  </div>
                  <div class="grid grid-cols-4 gap-4 text-sm">
                    <div>
                      <p class="font-medium text-gray-900">89,234</p>
                      <p class="text-gray-600">Impressions</p>
                    </div>
                    <div>
                      <p class="font-medium text-gray-900">2,890</p>
                      <p class="text-gray-600">Clics</p>
                    </div>
                    <div>
                      <p class="font-medium text-gray-900">3.2%</p>
                      <p class="text-gray-600">CTR</p>
                    </div>
                    <div>
                      <p class="font-medium text-gray-900">145</p>
                      <p class="text-gray-600">Conversions</p>
                    </div>
                  </div>
                  <div class="mt-3">
                    <div class="w-full bg-gray-200 rounded-full h-2">
                      <div class="bg-blue-600 h-2 rounded-full" style="width: 64%"></div>
                    </div>
                  </div>
                </div>

                <div class="border border-gray-200 rounded-lg p-4">
                  <div class="flex items-center justify-between mb-3">
                    <div class="flex items-center space-x-3">
                      <div class="w-3 h-3 bg-yellow-400 rounded-full"></div>
                      <h4 class="font-medium text-gray-900">Retargeting Q2</h4>
                      <span class="px-2 py-1 text-xs bg-yellow-100 text-yellow-800 rounded-full">En pause</span>
                    </div>
                    <div class="text-right">
                      <p class="text-sm font-medium text-gray-900">{{ $formatCurrency(1850) }} / {{ $formatCurrency(3000) }}</p>
                      <p class="text-xs text-gray-600">Budget utilisé</p>
                    </div>
                  </div>
                  <div class="grid grid-cols-4 gap-4 text-sm">
                    <div>
                      <p class="font-medium text-gray-900">45,678</p>
                      <p class="text-gray-600">Impressions</p>
                    </div>
                    <div>
                      <p class="font-medium text-gray-900">1,234</p>
                      <p class="text-gray-600">Clics</p>
                    </div>
                    <div>
                      <p class="font-medium text-gray-900">2.7%</p>
                      <p class="text-gray-600">CTR</p>
                    </div>
                    <div>
                      <p class="font-medium text-gray-900">89</p>
                      <p class="text-gray-600">Conversions</p>
                    </div>
                  </div>
                  <div class="mt-3">
                    <div class="w-full bg-gray-200 rounded-full h-2">
                      <div class="bg-yellow-600 h-2 rounded-full" style="width: 61.7%"></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Quick Actions -->
          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <router-link to="/marketing/campaigns" class="bg-white rounded-lg shadow p-6 hover:shadow-lg transition-shadow">
              <div class="flex items-center space-x-4">
                <div class="p-3 bg-blue-100 rounded-lg">
                  <svg class="h-6 w-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                  </svg>
                </div>
                <div>
                  <h3 class="font-medium text-gray-900">Gérer les campagnes</h3>
                  <p class="text-sm text-gray-600">Créer et optimiser vos campagnes</p>
                </div>
              </div>
            </router-link>

            <router-link to="/marketing/emails" class="bg-white rounded-lg shadow p-6 hover:shadow-lg transition-shadow">
              <div class="flex items-center space-x-4">
                <div class="p-3 bg-green-100 rounded-lg">
                  <svg class="h-6 w-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                </div>
                <div>
                  <h3 class="font-medium text-gray-900">Email Marketing</h3>
                  <p class="text-sm text-gray-600">Newsletters et automatisation</p>
                </div>
              </div>
            </router-link>

            <router-link to="/reports" class="bg-white rounded-lg shadow p-6 hover:shadow-lg transition-shadow">
              <div class="flex items-center space-x-4">
                <div class="p-3 bg-purple-100 rounded-lg">
                  <svg class="h-6 w-6 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                </div>
                <div>
                  <h3 class="font-medium text-gray-900">Rapports détaillés</h3>
                  <p class="text-sm text-gray-600">Analyses et insights</p>
                </div>
              </div>
            </router-link>
          </div>
          </div>
    </div>
  </Layout>
</template>

<script>
import Layout from '../../components/Layout.vue'
import MarketingAssistant from '../../components/MarketingAssistant.vue'
import MarketingAgents from '../../components/MarketingAgents.vue'
import AutomatedCampaigns from '../../components/AutomatedCampaigns.vue'
import PredictiveAnalyticsDashboard from '../../components/PredictiveAnalyticsDashboard.vue'
import IntegratedAIDashboard from '../../components/IntegratedAIDashboard.vue'
import ClientManagement from '../../components/ClientManagement.vue'

export default {
  name: 'Marketing',
  components: {
    Layout,
    MarketingAssistant,
    MarketingAgents,
    AutomatedCampaigns,
    PredictiveAnalyticsDashboard,
    IntegratedAIDashboard,
    ClientManagement
  },
  data() {
    return {
      activeView: 'integrated' // Par défaut, afficher le tableau de bord IA
    }
  },
  methods: {
    showNotification(notification) {
      // Handle notifications (could integrate with a toast library)
      console.log('Notification:', notification);
      if (notification.type === 'success') {
        alert('✅ ' + notification.message);
      } else if (notification.type === 'error') {
        alert('❌ ' + notification.message);
      }
    }
  }
}
</script>