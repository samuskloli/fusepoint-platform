<template>
  <Layout>
    <div>
          <!-- Page Header -->
          <div class="mb-8">
            <h1 class="text-3xl font-bold text-gray-900">Analytics - Vue d'ensemble</h1>
            <p class="mt-2 text-gray-600">Analysez vos performances marketing sur toutes les plateformes</p>
          </div>

          <!-- Quick Stats -->
          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div class="bg-white rounded-lg shadow p-6">
              <div class="flex items-center">
                <div class="p-2 bg-blue-100 rounded-lg">
                  <svg class="h-6 w-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                </div>
                <div class="ml-4">
                  <p class="text-sm font-medium text-gray-600">Vues totales</p>
                  <p class="text-2xl font-bold text-gray-900">847,392</p>
                  <p class="text-sm text-green-600">+12.5% ce mois</p>
                </div>
              </div>
            </div>

            <div class="bg-white rounded-lg shadow p-6">
              <div class="flex items-center">
                <div class="p-2 bg-green-100 rounded-lg">
                  <svg class="h-6 w-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                  </svg>
                </div>
                <div class="ml-4">
                  <p class="text-sm font-medium text-gray-600">Taux de conversion</p>
                  <p class="text-2xl font-bold text-gray-900">3.24%</p>
                  <p class="text-sm text-green-600">+0.8% ce mois</p>
                </div>
              </div>
            </div>

            <div class="bg-white rounded-lg shadow p-6">
              <div class="flex items-center">
                <div class="p-2 bg-purple-100 rounded-lg">
                  <svg class="h-6 w-6 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                  </svg>
                </div>
                <div class="ml-4">
                  <p class="text-sm font-medium text-gray-600">Revenus générés</p>
                  <p class="text-2xl font-bold text-gray-900">{{ $formatCurrency(45231) }}</p>
                  <p class="text-sm text-green-600">+18.2% ce mois</p>
                </div>
              </div>
            </div>

            <div class="bg-white rounded-lg shadow p-6">
              <div class="flex items-center">
                <div class="p-2 bg-orange-100 rounded-lg">
                  <svg class="h-6 w-6 text-orange-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                </div>
                <div class="ml-4">
                  <p class="text-sm font-medium text-gray-600">Nouveaux utilisateurs</p>
                  <p class="text-2xl font-bold text-gray-900">12,847</p>
                  <p class="text-sm text-green-600">+24.1% ce mois</p>
                </div>
              </div>
            </div>
          </div>

          <!-- Platform Overview -->
          <div class="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
            <router-link to="/analytics/google" class="bg-white rounded-lg shadow p-6 hover:shadow-lg transition-shadow">
              <div class="flex items-center justify-between mb-4">
                <h3 class="text-lg font-semibold text-gray-900">Google Analytics</h3>
                <span class="w-3 h-3 bg-green-400 rounded-full"></span>
              </div>
              <div class="space-y-2">
                <div class="flex justify-between">
                  <span class="text-sm text-gray-600">Sessions</span>
                  <span class="text-sm font-medium">234,567</span>
                </div>
                <div class="flex justify-between">
                  <span class="text-sm text-gray-600">Durée moyenne</span>
                  <span class="text-sm font-medium">3m 24s</span>
                </div>
                <div class="flex justify-between">
                  <span class="text-sm text-gray-600">Taux de rebond</span>
                  <span class="text-sm font-medium">42.3%</span>
                </div>
              </div>
            </router-link>

            <router-link to="/analytics/facebook" class="bg-white rounded-lg shadow p-6 hover:shadow-lg transition-shadow">
              <div class="flex items-center justify-between mb-4">
                <h3 class="text-lg font-semibold text-gray-900">Facebook Insights</h3>
                <span class="w-3 h-3 bg-green-400 rounded-full"></span>
              </div>
              <div class="space-y-2">
                <div class="flex justify-between">
                  <span class="text-sm text-gray-600">Portée</span>
                  <span class="text-sm font-medium">89,432</span>
                </div>
                <div class="flex justify-between">
                  <span class="text-sm text-gray-600">Engagement</span>
                  <span class="text-sm font-medium">5.8%</span>
                </div>
                <div class="flex justify-between">
                  <span class="text-sm text-gray-600">Clics</span>
                  <span class="text-sm font-medium">2,847</span>
                </div>
              </div>
            </router-link>

            <router-link to="/analytics/instagram" class="bg-white rounded-lg shadow p-6 hover:shadow-lg transition-shadow">
              <div class="flex items-center justify-between mb-4">
                <h3 class="text-lg font-semibold text-gray-900">Instagram Insights</h3>
                <span class="w-3 h-3 bg-green-400 rounded-full"></span>
              </div>
              <div class="space-y-2">
                <div class="flex justify-between">
                  <span class="text-sm text-gray-600">Impressions</span>
                  <span class="text-sm font-medium">156,789</span>
                </div>
                <div class="flex justify-between">
                  <span class="text-sm text-gray-600">Engagement</span>
                  <span class="text-sm font-medium">7.2%</span>
                </div>
                <div class="flex justify-between">
                  <span class="text-sm text-gray-600">Followers</span>
                  <span class="text-sm font-medium">+1,234</span>
                </div>
              </div>
            </router-link>
          </div>

          <!-- Charts Section -->
          <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div class="bg-white rounded-lg shadow p-6">
              <h3 class="text-lg font-semibold text-gray-900 mb-4">Trafic par source</h3>
              <div class="h-64 bg-gray-100 rounded-lg flex items-center justify-center">
                <p class="text-gray-500">Graphique en secteurs - Sources de trafic</p>
              </div>
            </div>

            <div class="bg-white rounded-lg shadow p-6">
              <h3 class="text-lg font-semibold text-gray-900 mb-4">Évolution des conversions</h3>
              <div class="h-64 bg-gray-100 rounded-lg flex items-center justify-center">
                <p class="text-gray-500">Graphique linéaire - Conversions dans le temps</p>
              </div>
            </div>
          </div>
    </div>
  </Layout>
</template>

<script>
import Layout from '../../components/Layout.vue'

export default {
  name: 'Analytics',
  components: {
    Layout
  }
}
</script>