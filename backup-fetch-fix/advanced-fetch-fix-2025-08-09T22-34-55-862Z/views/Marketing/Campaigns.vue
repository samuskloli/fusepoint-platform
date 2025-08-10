<template>
  <Layout>
    <div>
          <!-- Page Header -->
          <div class="mb-8">
            <div class="flex items-center justify-between">
              <div>
                <h1 class="text-3xl font-bold text-gray-900">Campagnes Marketing</h1>
                <p class="mt-2 text-gray-600">Créez et gérez vos campagnes publicitaires</p>
              </div>
              <button @click="showCreateModal = true" class="bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 transition-colors flex items-center space-x-2">
                <svg class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
                <span>Nouvelle campagne</span>
              </button>
            </div>
          </div>

          <!-- Filters and Search -->
          <div class="bg-white rounded-lg shadow p-6 mb-8">
            <div class="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
              <div class="flex flex-col md:flex-row md:items-center space-y-4 md:space-y-0 md:space-x-4">
                <div class="relative">
                  <input type="text" placeholder="Rechercher une campagne..." class="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent">
                  <svg class="absolute left-3 top-2.5 h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
                <select class="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent">
                  <option>Tous les statuts</option>
                  <option>Actif</option>
                  <option>En pause</option>
                  <option>Terminé</option>
                  <option>Brouillon</option>
                </select>
                <select class="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent">
                  <option>Toutes les plateformes</option>
                  <option>Google Ads</option>
                  <option>Facebook Ads</option>
                  <option>Instagram Ads</option>
                  <option>LinkedIn Ads</option>
                </select>
              </div>
              <div class="flex items-center space-x-2">
                <button class="p-2 border border-gray-300 rounded-lg hover:bg-gray-50">
                  <svg class="h-5 w-5 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
                  </svg>
                </button>
                <button class="p-2 border border-gray-300 rounded-lg hover:bg-gray-50">
                  <svg class="h-5 w-5 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                  </svg>
                </button>
              </div>
            </div>
          </div>

          <!-- Campaigns List -->
          <div class="space-y-6">
            <!-- Campaign Card 1 -->
            <div class="bg-white rounded-lg shadow">
              <div class="p-6">
                <div class="flex items-center justify-between mb-4">
                  <div class="flex items-center space-x-4">
                    <div class="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                      <svg class="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                      </svg>
                    </div>
                    <div>
                      <h3 class="text-lg font-semibold text-gray-900">Campagne Été 2024</h3>
                      <p class="text-sm text-gray-600">Google Ads • Créée le 15 juin 2024</p>
                    </div>
                  </div>
                  <div class="flex items-center space-x-3">
                    <span class="px-3 py-1 text-sm bg-green-100 text-green-800 rounded-full">Actif</span>
                    <div class="relative">
                      <button class="p-2 hover:bg-gray-100 rounded-lg">
                        <svg class="h-5 w-5 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
                        </svg>
                      </button>
                    </div>
                  </div>
                </div>

                <div class="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4 mb-6">
                  <div class="text-center">
                    <p class="text-2xl font-bold text-gray-900">{{ $formatCurrency(8450) }}</p>
                    <p class="text-sm text-gray-600">Dépensé</p>
                    <p class="text-xs text-gray-500">sur {{ $formatCurrency(10000) }}</p>
                  </div>
                  <div class="text-center">
                    <p class="text-2xl font-bold text-gray-900">156,789</p>
                    <p class="text-sm text-gray-600">Impressions</p>
                    <p class="text-xs text-green-600">+12.5%</p>
                  </div>
                  <div class="text-center">
                    <p class="text-2xl font-bold text-gray-900">4,567</p>
                    <p class="text-sm text-gray-600">Clics</p>
                    <p class="text-xs text-green-600">+8.3%</p>
                  </div>
                  <div class="text-center">
                    <p class="text-2xl font-bold text-gray-900">2.9%</p>
                    <p class="text-sm text-gray-600">CTR</p>
                    <p class="text-xs text-green-600">+0.4%</p>
                  </div>
                  <div class="text-center">
                    <p class="text-2xl font-bold text-gray-900">234</p>
                    <p class="text-sm text-gray-600">Conversions</p>
                    <p class="text-xs text-green-600">+15.2%</p>
                  </div>
                  <div class="text-center">
                    <p class="text-2xl font-bold text-gray-900">{{ $formatCurrency(36.12) }}</p>
                    <p class="text-sm text-gray-600">CPA</p>
                    <p class="text-xs text-red-600">+2.1%</p>
                  </div>
                </div>

                <div class="flex items-center justify-between">
                  <div class="flex-1 mr-4">
                    <div class="flex items-center justify-between text-sm mb-1">
                      <span class="text-gray-600">Budget utilisé</span>
                      <span class="text-gray-900 font-medium">84.5%</span>
                    </div>
                    <div class="w-full bg-gray-200 rounded-full h-2">
                      <div class="bg-green-600 h-2 rounded-full" style="width: 84.5%"></div>
                    </div>
                  </div>
                  <div class="flex space-x-2">
                    <button class="px-4 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50">Modifier</button>
                    <button class="px-4 py-2 text-sm bg-yellow-100 text-yellow-800 rounded-lg hover:bg-yellow-200">Pause</button>
                  </div>
                </div>
              </div>
            </div>

            <!-- Campaign Card 2 -->
            <div class="bg-white rounded-lg shadow">
              <div class="p-6">
                <div class="flex items-center justify-between mb-4">
                  <div class="flex items-center space-x-4">
                    <div class="w-12 h-12 bg-gradient-to-br from-pink-500 to-red-600 rounded-lg flex items-center justify-center">
                      <svg class="h-6 w-6 text-white" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                      </svg>
                    </div>
                    <div>
                      <h3 class="text-lg font-semibold text-gray-900">Lancement Produit X</h3>
                      <p class="text-sm text-gray-600">Facebook Ads • Créée le 10 juin 2024</p>
                    </div>
                  </div>
                  <div class="flex items-center space-x-3">
                    <span class="px-3 py-1 text-sm bg-blue-100 text-blue-800 rounded-full">Actif</span>
                    <div class="relative">
                      <button class="p-2 hover:bg-gray-100 rounded-lg">
                        <svg class="h-5 w-5 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
                        </svg>
                      </button>
                    </div>
                  </div>
                </div>

                <div class="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4 mb-6">
                  <div class="text-center">
                    <p class="text-2xl font-bold text-gray-900">{{ $formatCurrency(3200) }}</p>
                    <p class="text-sm text-gray-600">Dépensé</p>
                    <p class="text-xs text-gray-500">sur {{ $formatCurrency(5000) }}</p>
                  </div>
                  <div class="text-center">
                    <p class="text-2xl font-bold text-gray-900">89,234</p>
                    <p class="text-sm text-gray-600">Impressions</p>
                    <p class="text-xs text-green-600">+18.7%</p>
                  </div>
                  <div class="text-center">
                    <p class="text-2xl font-bold text-gray-900">2,890</p>
                    <p class="text-sm text-gray-600">Clics</p>
                    <p class="text-xs text-green-600">+22.1%</p>
                  </div>
                  <div class="text-center">
                    <p class="text-2xl font-bold text-gray-900">3.2%</p>
                    <p class="text-sm text-gray-600">CTR</p>
                    <p class="text-xs text-green-600">+0.8%</p>
                  </div>
                  <div class="text-center">
                    <p class="text-2xl font-bold text-gray-900">145</p>
                    <p class="text-sm text-gray-600">Conversions</p>
                    <p class="text-xs text-green-600">+28.3%</p>
                  </div>
                  <div class="text-center">
                    <p class="text-2xl font-bold text-gray-900">{{ $formatCurrency(22.07) }}</p>
                    <p class="text-sm text-gray-600">CPA</p>
                    <p class="text-xs text-green-600">-5.2%</p>
                  </div>
                </div>

                <div class="flex items-center justify-between">
                  <div class="flex-1 mr-4">
                    <div class="flex items-center justify-between text-sm mb-1">
                      <span class="text-gray-600">Budget utilisé</span>
                      <span class="text-gray-900 font-medium">64%</span>
                    </div>
                    <div class="w-full bg-gray-200 rounded-full h-2">
                      <div class="bg-blue-600 h-2 rounded-full" style="width: 64%"></div>
                    </div>
                  </div>
                  <div class="flex space-x-2">
                    <button class="px-4 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50">Modifier</button>
                    <button class="px-4 py-2 text-sm bg-yellow-100 text-yellow-800 rounded-lg hover:bg-yellow-200">Pause</button>
                  </div>
                </div>
              </div>
            </div>

            <!-- Campaign Card 3 -->
            <div class="bg-white rounded-lg shadow">
              <div class="p-6">
                <div class="flex items-center justify-between mb-4">
                  <div class="flex items-center space-x-4">
                    <div class="w-12 h-12 bg-gradient-to-br from-yellow-500 to-orange-600 rounded-lg flex items-center justify-center">
                      <svg class="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                      </svg>
                    </div>
                    <div>
                      <h3 class="text-lg font-semibold text-gray-900">Retargeting Q2</h3>
                      <p class="text-sm text-gray-600">Multi-plateforme • Créée le 1 juin 2024</p>
                    </div>
                  </div>
                  <div class="flex items-center space-x-3">
                    <span class="px-3 py-1 text-sm bg-yellow-100 text-yellow-800 rounded-full">En pause</span>
                    <div class="relative">
                      <button class="p-2 hover:bg-gray-100 rounded-lg">
                        <svg class="h-5 w-5 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
                        </svg>
                      </button>
                    </div>
                  </div>
                </div>

                <div class="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4 mb-6">
                  <div class="text-center">
                    <p class="text-2xl font-bold text-gray-900">{{ $formatCurrency(1850) }}</p>
                    <p class="text-sm text-gray-600">Dépensé</p>
                    <p class="text-xs text-gray-500">sur {{ $formatCurrency(3000) }}</p>
                  </div>
                  <div class="text-center">
                    <p class="text-2xl font-bold text-gray-900">45,678</p>
                    <p class="text-sm text-gray-600">Impressions</p>
                    <p class="text-xs text-red-600">-2.3%</p>
                  </div>
                  <div class="text-center">
                    <p class="text-2xl font-bold text-gray-900">1,234</p>
                    <p class="text-sm text-gray-600">Clics</p>
                    <p class="text-xs text-red-600">-5.1%</p>
                  </div>
                  <div class="text-center">
                    <p class="text-2xl font-bold text-gray-900">2.7%</p>
                    <p class="text-sm text-gray-600">CTR</p>
                    <p class="text-xs text-red-600">-0.2%</p>
                  </div>
                  <div class="text-center">
                    <p class="text-2xl font-bold text-gray-900">89</p>
                    <p class="text-sm text-gray-600">Conversions</p>
                    <p class="text-xs text-red-600">-8.7%</p>
                  </div>
                  <div class="text-center">
                    <p class="text-2xl font-bold text-gray-900">{{ $formatCurrency(20.79) }}</p>
                    <p class="text-sm text-gray-600">CPA</p>
                    <p class="text-xs text-green-600">-3.4%</p>
                  </div>
                </div>

                <div class="flex items-center justify-between">
                  <div class="flex-1 mr-4">
                    <div class="flex items-center justify-between text-sm mb-1">
                      <span class="text-gray-600">Budget utilisé</span>
                      <span class="text-gray-900 font-medium">61.7%</span>
                    </div>
                    <div class="w-full bg-gray-200 rounded-full h-2">
                      <div class="bg-yellow-600 h-2 rounded-full" style="width: 61.7%"></div>
                    </div>
                  </div>
                  <div class="flex space-x-2">
                    <button class="px-4 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50">Modifier</button>
                    <button class="px-4 py-2 text-sm bg-green-100 text-green-800 rounded-lg hover:bg-green-200">Reprendre</button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Pagination -->
          <div class="mt-8 flex items-center justify-between">
            <div class="text-sm text-gray-700">
              Affichage de <span class="font-medium">1</span> à <span class="font-medium">3</span> sur <span class="font-medium">12</span> campagnes
            </div>
            <div class="flex space-x-2">
              <button class="px-3 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50" disabled>
                Précédent
              </button>
              <button class="px-3 py-2 text-sm bg-primary-600 text-white rounded-lg">1</button>
              <button class="px-3 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50">2</button>
              <button class="px-3 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50">3</button>
              <button class="px-3 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50">
                Suivant
              </button>
            </div>
          </div>
        </div>

        <!-- Create Campaign Modal -->
    <div v-if="showCreateModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div class="bg-white rounded-lg p-6 w-full max-w-md mx-4">
        <div class="flex items-center justify-between mb-4">
          <h3 class="text-lg font-semibold text-gray-900">Nouvelle campagne</h3>
          <button @click="showCreateModal = false" class="text-gray-400 hover:text-gray-600">
            <svg class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <form @submit.prevent="createCampaign">
          <div class="space-y-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Nom de la campagne</label>
              <input type="text" v-model="newCampaign.name" class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent" required>
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Plateforme</label>
              <select v-model="newCampaign.platform" class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent" required>
                <option value="">Sélectionner une plateforme</option>
                <option value="google">Google Ads</option>
                <option value="facebook">Facebook Ads</option>
                <option value="instagram">Instagram Ads</option>
                <option value="linkedin">LinkedIn Ads</option>
              </select>
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Budget ({{ $getCurrencyCode() }})</label>
              <input type="number" v-model="newCampaign.budget" class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent" required>
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Objectif</label>
              <select v-model="newCampaign.objective" class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent" required>
                <option value="">Sélectionner un objectif</option>
                <option value="awareness">Notoriété</option>
                <option value="traffic">Trafic</option>
                <option value="conversions">Conversions</option>
                <option value="leads">Génération de leads</option>
              </select>
            </div>
          </div>
          <div class="flex space-x-3 mt-6">
            <button type="button" @click="showCreateModal = false" class="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">
              Annuler
            </button>
            <button type="submit" class="flex-1 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700">
              Créer
            </button>
          </div>
        </form>
      </div>
    </div>
  </Layout>
</template>

<script>
import Layout from '../../components/Layout.vue'

export default {
  name: 'Campaigns',
  components: {
    Layout
  },
  data() {
    return {
      showCreateModal: false,
      newCampaign: {
        name: '',
        platform: '',
        budget: '',
        objective: ''
      }
    }
  },
  methods: {
    createCampaign() {
      // Simulate campaign creation
      console.log('Creating campaign:', this.newCampaign)
      this.showCreateModal = false
      this.newCampaign = {
        name: '',
        platform: '',
        budget: '',
        objective: ''
      }
    }
  }
}
</script>