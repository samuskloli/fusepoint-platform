<template>
  <div class="min-h-screen bg-gray-50 py-8">
    <div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
      <!-- En-tête -->
      <div class="mb-8">
        <div class="flex items-center justify-between">
          <div>
            <h1 class="text-2xl font-bold text-gray-900">Configuration des devises</h1>
            <p class="mt-1 text-sm text-gray-600">
              Gérez la devise principale utilisée dans l'application
            </p>
          </div>
          <div class="flex items-center space-x-2">
            <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
              <svg class="-ml-0.5 mr-1.5 h-2 w-2 text-green-400" fill="currentColor" viewBox="0 0 8 8">
                <circle cx="4" cy="4" r="3"/>
              </svg>
              Système actif
            </span>
          </div>
        </div>
      </div>

      <!-- Navigation -->
      <div class="mb-6">
        <nav class="flex space-x-8" aria-label="Tabs">
          <button
            @click="activeTab = 'settings'"
            :class="[
              activeTab === 'settings'
                ? 'border-primary-500 text-primary-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300',
              'whitespace-nowrap py-2 px-1 border-b-2 font-medium text-sm'
            ]"
          >
            Configuration
          </button>
          <button
            @click="activeTab = 'preview'"
            :class="[
              activeTab === 'preview'
                ? 'border-primary-500 text-primary-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300',
              'whitespace-nowrap py-2 px-1 border-b-2 font-medium text-sm'
            ]"
          >
            Aperçu
          </button>
          <button
            @click="activeTab = 'history'"
            :class="[
              activeTab === 'history'
                ? 'border-primary-500 text-primary-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300',
              'whitespace-nowrap py-2 px-1 border-b-2 font-medium text-sm'
            ]"
          >
            Historique
          </button>
        </nav>
      </div>

      <!-- Contenu des onglets -->
      <div class="space-y-6">
        <!-- Onglet Configuration -->
        <div v-if="activeTab === 'settings'">
          <CurrencySettings @currency-changed="onCurrencyChanged" />
        </div>

        <!-- Onglet Aperçu -->
        <div v-if="activeTab === 'preview'" class="bg-white shadow rounded-lg p-6">
          <h3 class="text-lg font-medium text-gray-900 mb-4">Aperçu des formatages</h3>
          
          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <!-- Exemples de montants -->
            <div>
              <h4 class="text-sm font-medium text-gray-700 mb-3">Exemples de montants</h4>
              <div class="space-y-2">
                <div class="flex justify-between items-center py-2 px-3 bg-gray-50 rounded">
                  <span class="text-sm text-gray-600">Petit montant:</span>
                  <span class="font-medium">{{ $formatCurrency(29.99) }}</span>
                </div>
                <div class="flex justify-between items-center py-2 px-3 bg-gray-50 rounded">
                  <span class="text-sm text-gray-600">Montant moyen:</span>
                  <span class="font-medium">{{ $formatCurrency(1234.56) }}</span>
                </div>
                <div class="flex justify-between items-center py-2 px-3 bg-gray-50 rounded">
                  <span class="text-sm text-gray-600">Grand montant:</span>
                  <span class="font-medium">{{ $formatCurrency(45230.00) }}</span>
                </div>
                <div class="flex justify-between items-center py-2 px-3 bg-gray-50 rounded">
                  <span class="text-sm text-gray-600">Montant avec décimales:</span>
                  <span class="font-medium">{{ $formatCurrency(999.95) }}</span>
                </div>
              </div>
            </div>

            <!-- Contextes d'utilisation -->
            <div>
              <h4 class="text-sm font-medium text-gray-700 mb-3">Contextes d'utilisation</h4>
              <div class="space-y-3">
                <div class="border border-gray-200 rounded-lg p-3">
                  <p class="text-xs text-gray-500 mb-1">Tableau de bord - Revenus</p>
                  <p class="text-lg font-bold text-gray-900">{{ $formatCurrency(45231) }}</p>
                </div>
                <div class="border border-gray-200 rounded-lg p-3">
                  <p class="text-xs text-gray-500 mb-1">Facturation - Abonnement</p>
                  <p class="text-lg font-bold text-gray-900">{{ $formatCurrency(99) }}<span class="text-sm font-normal text-gray-600">/mois</span></p>
                </div>
                <div class="border border-gray-200 rounded-lg p-3">
                  <p class="text-xs text-gray-500 mb-1">Campagne - Budget</p>
                  <p class="text-sm font-medium text-gray-900">{{ $formatCurrency(8450) }} / {{ $formatCurrency(10000) }}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Onglet Historique -->
        <div v-if="activeTab === 'history'" class="bg-white shadow rounded-lg p-6">
          <h3 class="text-lg font-medium text-gray-900 mb-4">Historique des changements</h3>
          
          <div class="flow-root">
            <ul class="-mb-8">
              <li v-for="(change, index) in currencyHistory" :key="index">
                <div class="relative pb-8">
                  <span v-if="index !== currencyHistory.length - 1" class="absolute top-4 left-4 -ml-px h-full w-0.5 bg-gray-200" aria-hidden="true"></span>
                  <div class="relative flex space-x-3">
                    <div>
                      <span class="h-8 w-8 rounded-full bg-primary-500 flex items-center justify-center ring-8 ring-white">
                        <svg class="h-4 w-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                          <path fill-rule="evenodd" d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z" clip-rule="evenodd"></path>
                        </svg>
                      </span>
                    </div>
                    <div class="min-w-0 flex-1 pt-1.5 flex justify-between space-x-4">
                      <div>
                        <p class="text-sm text-gray-500">
                          Devise changée de <span class="font-medium text-gray-900">{{ change.from }}</span> vers 
                          <span class="font-medium text-gray-900">{{ change.to }}</span>
                        </p>
                        <p v-if="change.user" class="text-xs text-gray-400">Par {{ change.user }}</p>
                      </div>
                      <div class="text-right text-sm whitespace-nowrap text-gray-500">
                        <time :datetime="change.date">{{ formatDate(change.date) }}</time>
                      </div>
                    </div>
                  </div>
                </div>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import CurrencySettings from '@/components/CurrencySettings.vue'

export default {
  name: 'CurrencyConfig',
  components: {
    CurrencySettings
  },
  data() {
    return {
      activeTab: 'settings',
      currencyHistory: [
        {
          from: 'EUR',
          to: 'CHF',
          date: new Date().toISOString(),
          user: 'Administrateur'
        },
        {
          from: 'USD',
          to: 'EUR',
          date: new Date(Date.now() - 86400000).toISOString(),
          user: 'Administrateur'
        }
      ]
    }
  },
  methods: {
    onCurrencyChanged(newCurrency) {
      // Ajouter à l'historique
      this.currencyHistory.unshift({
        from: this.currencyHistory[0]?.to || 'EUR',
        to: newCurrency.code,
        date: new Date().toISOString(),
        user: 'Administrateur'
      })
      
      // Sauvegarder l'historique (ici vous pourriez l'envoyer au serveur)
      localStorage.setItem('currencyHistory', JSON.stringify(this.currencyHistory))
    },
    formatDate(dateString) {
      const date = new Date(dateString)
      return date.toLocaleDateString('fr-FR', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      })
    }
  },
  mounted() {
    // Charger l'historique depuis le localStorage
    const savedHistory = localStorage.getItem('currencyHistory')
    if (savedHistory) {
      this.currencyHistory = JSON.parse(savedHistory)
    }
  }
}
</script>