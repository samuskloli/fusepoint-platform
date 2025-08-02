<template>
  <Layout>
    <div>
          <!-- Page Header -->
          <div class="mb-8">
            <div class="flex items-center justify-between">
              <div>
                <h1 class="text-3xl font-bold text-gray-900">Rapports</h1>
                <p class="mt-2 text-gray-600">Analyses détaillées de vos performances marketing</p>
              </div>
              <div class="flex items-center space-x-3">
                <select class="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent">
                  <option>7 derniers jours</option>
                  <option>30 derniers jours</option>
                  <option>3 derniers mois</option>
                  <option>12 derniers mois</option>
                  <option>Personnalisé</option>
                </select>
                <button class="bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 transition-colors flex items-center space-x-2">
                  <svg class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 10v6m0 0l-4-4m4 4l4-4m3-2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span>Exporter</span>
                </button>
              </div>
            </div>
          </div>

          <!-- Key Metrics Overview -->
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
                  <p class="text-sm font-medium text-gray-600">Impressions totales</p>
                  <p class="text-2xl font-bold text-gray-900">2.4M</p>
                  <p class="text-sm text-green-600">+12.5% vs période précédente</p>
                </div>
              </div>
            </div>

            <div class="bg-white rounded-lg shadow p-6">
              <div class="flex items-center">
                <div class="p-2 bg-green-100 rounded-lg">
                  <svg class="h-6 w-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 15l-2 5L9 9l11 4-5 2zm0 0l5 5M7.188 2.239l.777 2.897M5.136 7.965l-2.898-.777M13.95 4.05l-2.122 2.122m-5.657 5.656l-2.12 2.122" />
                  </svg>
                </div>
                <div class="ml-4">
                  <p class="text-sm font-medium text-gray-600">Clics totaux</p>
                  <p class="text-2xl font-bold text-gray-900">156K</p>
                  <p class="text-sm text-green-600">+8.3% vs période précédente</p>
                </div>
              </div>
            </div>

            <div class="bg-white rounded-lg shadow p-6">
              <div class="flex items-center">
                <div class="p-2 bg-yellow-100 rounded-lg">
                  <svg class="h-6 w-6 text-yellow-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                </div>
                <div class="ml-4">
                  <p class="text-sm font-medium text-gray-600">Taux de conversion</p>
                  <p class="text-2xl font-bold text-gray-900">6.5%</p>
                  <p class="text-sm text-red-600">-2.1% vs période précédente</p>
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
                  <p class="text-sm font-medium text-gray-600">ROI moyen</p>
                  <p class="text-2xl font-bold text-gray-900">285%</p>
                  <p class="text-sm text-green-600">+15.7% vs période précédente</p>
                </div>
              </div>
            </div>
          </div>

          <!-- Charts Section -->
          <div class="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
            <!-- Performance Over Time -->
            <div class="bg-white rounded-lg shadow p-6">
              <div class="flex items-center justify-between mb-6">
                <h3 class="text-lg font-medium text-gray-900">Performance dans le temps</h3>
                <div class="flex items-center space-x-2">
                  <button class="px-3 py-1 text-sm bg-primary-100 text-primary-700 rounded-md">Impressions</button>
                  <button class="px-3 py-1 text-sm text-gray-600 hover:bg-gray-100 rounded-md">Clics</button>
                  <button class="px-3 py-1 text-sm text-gray-600 hover:bg-gray-100 rounded-md">Conversions</button>
                </div>
              </div>
              <div class="h-64 bg-gray-50 rounded-lg flex items-center justify-center">
                <p class="text-gray-500">Graphique des performances - Placeholder</p>
              </div>
            </div>

            <!-- Traffic Sources -->
            <div class="bg-white rounded-lg shadow p-6">
              <h3 class="text-lg font-medium text-gray-900 mb-6">Sources de trafic</h3>
              <div class="space-y-4">
                <div class="flex items-center justify-between">
                  <div class="flex items-center space-x-3">
                    <div class="w-4 h-4 bg-blue-500 rounded-full"></div>
                    <span class="text-sm font-medium text-gray-900">Google Ads</span>
                  </div>
                  <div class="text-right">
                    <p class="text-sm font-medium text-gray-900">45.2%</p>
                    <p class="text-xs text-gray-600">68,450 visites</p>
                  </div>
                </div>
                <div class="flex items-center justify-between">
                  <div class="flex items-center space-x-3">
                    <div class="w-4 h-4 bg-blue-600 rounded-full"></div>
                    <span class="text-sm font-medium text-gray-900">Facebook Ads</span>
                  </div>
                  <div class="text-right">
                    <p class="text-sm font-medium text-gray-900">28.7%</p>
                    <p class="text-xs text-gray-600">43,520 visites</p>
                  </div>
                </div>
                <div class="flex items-center justify-between">
                  <div class="flex items-center space-x-3">
                    <div class="w-4 h-4 bg-green-500 rounded-full"></div>
                    <span class="text-sm font-medium text-gray-900">Email Marketing</span>
                  </div>
                  <div class="text-right">
                    <p class="text-sm font-medium text-gray-900">15.8%</p>
                    <p class="text-xs text-gray-600">23,890 visites</p>
                  </div>
                </div>
                <div class="flex items-center justify-between">
                  <div class="flex items-center space-x-3">
                    <div class="w-4 h-4 bg-purple-500 rounded-full"></div>
                    <span class="text-sm font-medium text-gray-900">Instagram</span>
                  </div>
                  <div class="text-right">
                    <p class="text-sm font-medium text-gray-900">10.3%</p>
                    <p class="text-xs text-gray-600">15,620 visites</p>
                  </div>
                </div>
              </div>
              <div class="mt-6 h-32 bg-gray-50 rounded-lg flex items-center justify-center">
                <p class="text-gray-500">Graphique en secteurs - Placeholder</p>
              </div>
            </div>
          </div>

          <!-- Campaign Performance -->
          <div class="bg-white rounded-lg shadow overflow-hidden mb-8">
            <div class="px-6 py-4 border-b border-gray-200">
              <div class="flex items-center justify-between">
                <h3 class="text-lg font-medium text-gray-900">Performance des campagnes</h3>
                <button class="text-primary-600 hover:text-primary-700 text-sm font-medium">Voir tout</button>
              </div>
            </div>
            
            <div class="overflow-x-auto">
              <table class="min-w-full divide-y divide-gray-200">
                <thead class="bg-gray-50">
                  <tr>
                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Campagne</th>
                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Impressions</th>
                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Clics</th>
                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">CTR</th>
                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Conversions</th>
                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">CPA</th>
                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ROI</th>
                  </tr>
                </thead>
                <tbody class="bg-white divide-y divide-gray-200">
                  <tr>
                    <td class="px-6 py-4 whitespace-nowrap">
                      <div class="flex items-center">
                        <div class="flex-shrink-0 h-10 w-10">
                          <div class="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                            <span class="text-sm font-medium text-blue-600">SP</span>
                          </div>
                        </div>
                        <div class="ml-4">
                          <div class="text-sm font-medium text-gray-900">Summer Promo 2024</div>
                          <div class="text-sm text-gray-500">Google Ads</div>
                        </div>
                      </div>
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">485,230</td>
                    <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">32,145</td>
                    <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">6.62%</td>
                    <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">2,087</td>
                    <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{{ $formatCurrency(24.50) }}</td>
                    <td class="px-6 py-4 whitespace-nowrap">
                      <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        +285%
                      </span>
                    </td>
                  </tr>
                  <tr>
                    <td class="px-6 py-4 whitespace-nowrap">
                      <div class="flex items-center">
                        <div class="flex-shrink-0 h-10 w-10">
                          <div class="h-10 w-10 rounded-full bg-purple-100 flex items-center justify-center">
                            <span class="text-sm font-medium text-purple-600">FB</span>
                          </div>
                        </div>
                        <div class="ml-4">
                          <div class="text-sm font-medium text-gray-900">Facebook Retargeting</div>
                          <div class="text-sm text-gray-500">Facebook Ads</div>
                        </div>
                      </div>
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">298,567</td>
                    <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">18,923</td>
                    <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">6.34%</td>
                    <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">1,456</td>
                    <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{{ $formatCurrency(31.20) }}</td>
                    <td class="px-6 py-4 whitespace-nowrap">
                      <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        +198%
                      </span>
                    </td>
                  </tr>
                  <tr>
                    <td class="px-6 py-4 whitespace-nowrap">
                      <div class="flex items-center">
                        <div class="flex-shrink-0 h-10 w-10">
                          <div class="h-10 w-10 rounded-full bg-green-100 flex items-center justify-center">
                            <span class="text-sm font-medium text-green-600">EM</span>
                          </div>
                        </div>
                        <div class="ml-4">
                          <div class="text-sm font-medium text-gray-900">Email Newsletter</div>
                          <div class="text-sm text-gray-500">Email Marketing</div>
                        </div>
                      </div>
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">125,890</td>
                    <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">8,945</td>
                    <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">7.11%</td>
                    <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">892</td>
                    <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{{ $formatCurrency(18.75) }}</td>
                    <td class="px-6 py-4 whitespace-nowrap">
                      <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        +425%
                      </span>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          <!-- Geographic Performance -->
          <div class="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <!-- Geographic Data -->
            <div class="bg-white rounded-lg shadow p-6">
              <h3 class="text-lg font-medium text-gray-900 mb-6">Performance géographique</h3>
              <div class="space-y-4">
                <div class="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div class="flex items-center space-x-3">
                    <span class="text-2xl">🇫🇷</span>
                    <div>
                      <p class="text-sm font-medium text-gray-900">France</p>
                      <p class="text-xs text-gray-600">45.2% du trafic</p>
                    </div>
                  </div>
                  <div class="text-right">
                    <p class="text-sm font-medium text-gray-900">68,450</p>
                    <p class="text-xs text-green-600">+12.5%</p>
                  </div>
                </div>
                
                <div class="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div class="flex items-center space-x-3">
                    <span class="text-2xl">🇺🇸</span>
                    <div>
                      <p class="text-sm font-medium text-gray-900">États-Unis</p>
                      <p class="text-xs text-gray-600">28.7% du trafic</p>
                    </div>
                  </div>
                  <div class="text-right">
                    <p class="text-sm font-medium text-gray-900">43,520</p>
                    <p class="text-xs text-green-600">+8.3%</p>
                  </div>
                </div>
                
                <div class="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div class="flex items-center space-x-3">
                    <span class="text-2xl">🇨🇦</span>
                    <div>
                      <p class="text-sm font-medium text-gray-900">Canada</p>
                      <p class="text-xs text-gray-600">15.8% du trafic</p>
                    </div>
                  </div>
                  <div class="text-right">
                    <p class="text-sm font-medium text-gray-900">23,890</p>
                    <p class="text-xs text-red-600">-2.1%</p>
                  </div>
                </div>
                
                <div class="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div class="flex items-center space-x-3">
                    <span class="text-2xl">🇬🇧</span>
                    <div>
                      <p class="text-sm font-medium text-gray-900">Royaume-Uni</p>
                      <p class="text-xs text-gray-600">10.3% du trafic</p>
                    </div>
                  </div>
                  <div class="text-right">
                    <p class="text-sm font-medium text-gray-900">15,620</p>
                    <p class="text-xs text-green-600">+5.7%</p>
                  </div>
                </div>
              </div>
            </div>

            <!-- Device Performance -->
            <div class="bg-white rounded-lg shadow p-6">
              <h3 class="text-lg font-medium text-gray-900 mb-6">Performance par appareil</h3>
              <div class="space-y-6">
                <div>
                  <div class="flex items-center justify-between mb-2">
                    <div class="flex items-center space-x-2">
                      <svg class="h-5 w-5 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
                      </svg>
                      <span class="text-sm font-medium text-gray-900">Mobile</span>
                    </div>
                    <span class="text-sm text-gray-600">65.4%</span>
                  </div>
                  <div class="w-full bg-gray-200 rounded-full h-2">
                    <div class="bg-blue-600 h-2 rounded-full" style="width: 65.4%"></div>
                  </div>
                  <div class="flex justify-between text-xs text-gray-600 mt-1">
                    <span>99,234 sessions</span>
                    <span>Taux de conversion: 5.8%</span>
                  </div>
                </div>
                
                <div>
                  <div class="flex items-center justify-between mb-2">
                    <div class="flex items-center space-x-2">
                      <svg class="h-5 w-5 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                      </svg>
                      <span class="text-sm font-medium text-gray-900">Desktop</span>
                    </div>
                    <span class="text-sm text-gray-600">28.9%</span>
                  </div>
                  <div class="w-full bg-gray-200 rounded-full h-2">
                    <div class="bg-green-600 h-2 rounded-full" style="width: 28.9%"></div>
                  </div>
                  <div class="flex justify-between text-xs text-gray-600 mt-1">
                    <span>43,876 sessions</span>
                    <span>Taux de conversion: 8.2%</span>
                  </div>
                </div>
                
                <div>
                  <div class="flex items-center justify-between mb-2">
                    <div class="flex items-center space-x-2">
                      <svg class="h-5 w-5 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 18h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                      </svg>
                      <span class="text-sm font-medium text-gray-900">Tablette</span>
                    </div>
                    <span class="text-sm text-gray-600">5.7%</span>
                  </div>
                  <div class="w-full bg-gray-200 rounded-full h-2">
                    <div class="bg-purple-600 h-2 rounded-full" style="width: 5.7%"></div>
                  </div>
                  <div class="flex justify-between text-xs text-gray-600 mt-1">
                    <span>8,654 sessions</span>
                    <span>Taux de conversion: 6.1%</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
    </div>
  </Layout>
</template>

<script>
import Layout from '../../components/Layout.vue'

export default {
  name: 'Reports',
  components: {
    Layout
  },
  data() {
    return {
    }
  }
}
</script>