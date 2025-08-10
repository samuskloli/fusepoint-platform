<template>
  <Layout>
    <div>
          <!-- Page Header -->
          <div class="mb-8">
            <div class="flex items-center justify-between">
              <div>
                <h1 class="text-3xl font-bold text-gray-900">Intégrations</h1>
                <p class="mt-2 text-gray-600">Connectez vos outils et services préférés</p>
              </div>
              <div class="flex items-center space-x-2">
                <span class="text-sm text-gray-600">12 intégrations actives</span>
                <div class="w-2 h-2 bg-green-400 rounded-full"></div>
              </div>
            </div>
          </div>

          <!-- Search and Filter -->
          <div class="bg-white rounded-lg shadow p-6 mb-8">
            <div class="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
              <div class="flex flex-col md:flex-row md:items-center space-y-4 md:space-y-0 md:space-x-4">
                <div class="relative">
                  <input type="text" placeholder="Rechercher une intégration..." class="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent w-full md:w-64">
                  <svg class="absolute left-3 top-2.5 h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
                <select class="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent">
                  <option>Toutes les catégories</option>
                  <option>Analytics</option>
                  <option>CRM</option>
                  <option>Email Marketing</option>
                  <option>Réseaux Sociaux</option>
                  <option>E-commerce</option>
                  <option>Automatisation</option>
                </select>
                <select class="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent">
                  <option>Tous les statuts</option>
                  <option>Connecté</option>
                  <option>Déconnecté</option>
                  <option>Configuration requise</option>
                </select>
              </div>
            </div>
          </div>

          <!-- Social Media Test Component -->
          <div class="mb-8">
            <SocialMediaTest />
          </div>

          <!-- Connected Integrations -->
          <div class="mb-8">
            <h2 class="text-xl font-semibold text-gray-900 mb-6">Intégrations connectées</h2>
            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <!-- Google Analytics integration removed -->

              <!-- Facebook Ads -->
              <SocialMediaConnections platform="facebook" />

              <!-- Mailchimp -->
              <div class="bg-white rounded-lg shadow p-6">
                <div class="flex items-center justify-between mb-4">
                  <div class="flex items-center space-x-3">
                    <div class="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                      <svg class="h-6 w-6 text-yellow-600" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.568 14.832c-.385.772-1.188 1.296-2.088 1.296-.772 0-1.44-.386-1.826-1.016-.193-.315-.289-.677-.289-1.054 0-.193.048-.386.145-.563.193-.354.531-.563.917-.563.193 0 .386.048.563.145.354.193.563.531.563.917 0 .193-.048.386-.145.563-.097.177-.241.322-.434.434-.193.112-.418.177-.658.177-.531 0-.966-.289-1.199-.724-.112-.209-.177-.451-.177-.708 0-.289.08-.563.225-.804.289-.482.804-.804 1.393-.804.289 0 .563.08.804.225.482.289.804.804.804 1.393 0 .289-.08.563-.225.804z"/>
                      </svg>
                    </div>
                    <div>
                      <h3 class="font-medium text-gray-900">Mailchimp</h3>
                      <p class="text-sm text-gray-600">Email Marketing</p>
                    </div>
                  </div>
                  <div class="flex items-center space-x-2">
                    <span class="w-2 h-2 bg-green-400 rounded-full"></span>
                    <span class="text-sm text-green-600">Connecté</span>
                  </div>
                </div>
                <p class="text-sm text-gray-600 mb-4">Synchronisation des listes et campagnes email</p>
                <div class="flex items-center justify-between">
                  <span class="text-xs text-gray-500">Dernière sync: il y a 8 min</span>
                  <button class="text-sm text-primary-600 hover:text-primary-700">Configurer</button>
                </div>
              </div>

              <!-- Shopify -->
              <div class="bg-white rounded-lg shadow p-6">
                <div class="flex items-center justify-between mb-4">
                  <div class="flex items-center space-x-3">
                    <div class="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                      <svg class="h-6 w-6 text-green-600" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M15.337 2.368c-.332-.066-.664-.066-.996 0-1.328.264-2.656.794-3.652 1.658-.332.264-.664.596-.93.928-.266-.066-.598-.132-.93-.132-1.328 0-2.656.53-3.652 1.658C4.845 7.144 4.513 8.008 4.513 8.936c0 .928.332 1.792.664 2.656.332.864.73 1.658 1.328 2.32.598.662 1.328 1.192 2.124 1.658.796.466 1.658.73 2.588.862.93.132 1.86.066 2.79-.132.93-.198 1.792-.53 2.588-.996.796-.466 1.526-1.06 2.124-1.724.598-.664 1.06-1.394 1.394-2.19.332-.796.53-1.658.53-2.52 0-.862-.198-1.724-.53-2.52-.332-.796-.796-1.526-1.394-2.19-.598-.664-1.328-1.258-2.124-1.724-.796-.466-1.658-.798-2.588-.996z"/>
                      </svg>
                    </div>
                    <div>
                      <h3 class="font-medium text-gray-900">Shopify</h3>
                      <p class="text-sm text-gray-600">E-commerce</p>
                    </div>
                  </div>
                  <div class="flex items-center space-x-2">
                    <span class="w-2 h-2 bg-green-400 rounded-full"></span>
                    <span class="text-sm text-green-600">Connecté</span>
                  </div>
                </div>
                <p class="text-sm text-gray-600 mb-4">Synchronisation des commandes et données clients</p>
                <div class="flex items-center justify-between">
                  <span class="text-xs text-gray-500">Dernière sync: il y a 3 min</span>
                  <button class="text-sm text-primary-600 hover:text-primary-700">Configurer</button>
                </div>
              </div>

              <!-- Slack -->
              <div class="bg-white rounded-lg shadow p-6">
                <div class="flex items-center justify-between mb-4">
                  <div class="flex items-center space-x-3">
                    <div class="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                      <svg class="h-6 w-6 text-purple-600" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M5.042 15.165a2.528 2.528 0 0 1-2.52 2.523A2.528 2.528 0 0 1 0 15.165a2.527 2.527 0 0 1 2.522-2.52h2.52v2.52zM6.313 15.165a2.527 2.527 0 0 1 2.521-2.52 2.527 2.527 0 0 1 2.521 2.52v6.313A2.528 2.528 0 0 1 8.834 24a2.528 2.528 0 0 1-2.521-2.522v-6.313zM8.834 5.042a2.528 2.528 0 0 1-2.521-2.52A2.528 2.528 0 0 1 8.834 0a2.528 2.528 0 0 1 2.521 2.522v2.52H8.834zM8.834 6.313a2.528 2.528 0 0 1 2.521 2.521 2.528 2.528 0 0 1-2.521 2.521H2.522A2.528 2.528 0 0 1 0 8.834a2.528 2.528 0 0 1 2.522-2.521h6.312zM18.956 8.834a2.528 2.528 0 0 1 2.522-2.521A2.528 2.528 0 0 1 24 8.834a2.528 2.528 0 0 1-2.522 2.521h-2.522V8.834zM17.688 8.834a2.528 2.528 0 0 1-2.523 2.521 2.527 2.527 0 0 1-2.52-2.521V2.522A2.527 2.527 0 0 1 15.165 0a2.528 2.528 0 0 1 2.523 2.522v6.312zM15.165 18.956a2.528 2.528 0 0 1 2.523 2.522A2.528 2.528 0 0 1 15.165 24a2.527 2.527 0 0 1-2.52-2.522v-2.522h2.52zM15.165 17.688a2.527 2.527 0 0 1-2.52-2.523 2.526 2.526 0 0 1 2.52-2.52h6.313A2.527 2.527 0 0 1 24 15.165a2.528 2.528 0 0 1-2.522 2.523h-6.313z"/>
                      </svg>
                    </div>
                    <div>
                      <h3 class="font-medium text-gray-900">Slack</h3>
                      <p class="text-sm text-gray-600">Communication</p>
                    </div>
                  </div>
                  <div class="flex items-center space-x-2">
                    <span class="w-2 h-2 bg-green-400 rounded-full"></span>
                    <span class="text-sm text-green-600">Connecté</span>
                  </div>
                </div>
                <p class="text-sm text-gray-600 mb-4">Notifications automatiques des campagnes</p>
                <div class="flex items-center justify-between">
                  <span class="text-xs text-gray-500">Dernière sync: il y a 15 min</span>
                  <button class="text-sm text-primary-600 hover:text-primary-700">Configurer</button>
                </div>
              </div>

              <!-- Zapier -->
              <div class="bg-white rounded-lg shadow p-6">
                <div class="flex items-center justify-between mb-4">
                  <div class="flex items-center space-x-3">
                    <div class="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                      <svg class="h-6 w-6 text-orange-600" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.568 14.832c-.385.772-1.188 1.296-2.088 1.296-.772 0-1.44-.386-1.826-1.016-.193-.315-.289-.677-.289-1.054 0-.193.048-.386.145-.563.193-.354.531-.563.917-.563.193 0 .386.048.563.145.354.193.563.531.563.917 0 .193-.048.386-.145.563-.097.177-.241.322-.434.434-.193.112-.418.177-.658.177-.531 0-.966-.289-1.199-.724-.112-.209-.177-.451-.177-.708 0-.289.08-.563.225-.804.289-.482.804-.804 1.393-.804.289 0 .563.08.804.225.482.289.804.804.804 1.393 0 .289-.08.563-.225.804z"/>
                      </svg>
                    </div>
                    <div>
                      <h3 class="font-medium text-gray-900">Zapier</h3>
                      <p class="text-sm text-gray-600">Automatisation</p>
                    </div>
                  </div>
                  <div class="flex items-center space-x-2">
                    <span class="w-2 h-2 bg-green-400 rounded-full"></span>
                    <span class="text-sm text-green-600">Connecté</span>
                  </div>
                </div>
                <p class="text-sm text-gray-600 mb-4">Automatisation des workflows marketing</p>
                <div class="flex items-center justify-between">
                  <span class="text-xs text-gray-500">Dernière sync: il y a 20 min</span>
                  <button class="text-sm text-primary-600 hover:text-primary-700">Configurer</button>
                </div>
              </div>
            </div>
          </div>

          <!-- Available Integrations -->
          <div>
            <h2 class="text-xl font-semibold text-gray-900 mb-6">Intégrations disponibles</h2>
            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <!-- HubSpot -->
              <div class="bg-white rounded-lg shadow p-6 border-2 border-dashed border-gray-200">
                <div class="flex items-center justify-between mb-4">
                  <div class="flex items-center space-x-3">
                    <div class="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                      <svg class="h-6 w-6 text-orange-600" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.568 14.832c-.385.772-1.188 1.296-2.088 1.296-.772 0-1.44-.386-1.826-1.016-.193-.315-.289-.677-.289-1.054 0-.193.048-.386.145-.563.193-.354.531-.563.917-.563.193 0 .386.048.563.145.354.193.563.531.563.917 0 .193-.048.386-.145.563-.097.177-.241.322-.434.434-.193.112-.418.177-.658.177-.531 0-.966-.289-1.199-.724-.112-.209-.177-.451-.177-.708 0-.289.08-.563.225-.804.289-.482.804-.804 1.393-.804.289 0 .563.08.804.225.482.289.804.804.804 1.393 0 .289-.08.563-.225.804z"/>
                      </svg>
                    </div>
                    <div>
                      <h3 class="font-medium text-gray-900">HubSpot</h3>
                      <p class="text-sm text-gray-600">CRM</p>
                    </div>
                  </div>
                  <div class="flex items-center space-x-2">
                    <span class="w-2 h-2 bg-gray-400 rounded-full"></span>
                    <span class="text-sm text-gray-500">Disponible</span>
                  </div>
                </div>
                <p class="text-sm text-gray-600 mb-4">Synchronisez vos contacts et leads avec HubSpot CRM</p>
                <button class="w-full bg-primary-600 text-white py-2 px-4 rounded-lg hover:bg-primary-700 transition-colors">
                  Connecter
                </button>
              </div>

              <!-- Salesforce -->
              <div class="bg-white rounded-lg shadow p-6 border-2 border-dashed border-gray-200">
                <div class="flex items-center justify-between mb-4">
                  <div class="flex items-center space-x-3">
                    <div class="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                      <svg class="h-6 w-6 text-blue-600" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.568 14.832c-.385.772-1.188 1.296-2.088 1.296-.772 0-1.44-.386-1.826-1.016-.193-.315-.289-.677-.289-1.054 0-.193.048-.386.145-.563.193-.354.531-.563.917-.563.193 0 .386.048.563.145.354.193.563.531.563.917 0 .193-.048.386-.145.563-.097.177-.241.322-.434.434-.193.112-.418.177-.658.177-.531 0-.966-.289-1.199-.724-.112-.209-.177-.451-.177-.708 0-.289.08-.563.225-.804.289-.482.804-.804 1.393-.804.289 0 .563.08.804.225.482.289.804.804.804 1.393 0 .289-.08.563-.225.804z"/>
                      </svg>
                    </div>
                    <div>
                      <h3 class="font-medium text-gray-900">Salesforce</h3>
                      <p class="text-sm text-gray-600">CRM</p>
                    </div>
                  </div>
                  <div class="flex items-center space-x-2">
                    <span class="w-2 h-2 bg-gray-400 rounded-full"></span>
                    <span class="text-sm text-gray-500">Disponible</span>
                  </div>
                </div>
                <p class="text-sm text-gray-600 mb-4">Intégrez vos données marketing avec Salesforce</p>
                <button class="w-full bg-primary-600 text-white py-2 px-4 rounded-lg hover:bg-primary-700 transition-colors">
                  Connecter
                </button>
              </div>

              <!-- Instagram Business -->
              <SocialMediaConnections platform="instagram" />

              <!-- LinkedIn Ads -->
              <div class="bg-white rounded-lg shadow p-6 border-2 border-dashed border-gray-200">
                <div class="flex items-center justify-between mb-4">
                  <div class="flex items-center space-x-3">
                    <div class="w-12 h-12 bg-blue-700 rounded-lg flex items-center justify-center">
                      <svg class="h-6 w-6 text-white" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                      </svg>
                    </div>
                    <div>
                      <h3 class="font-medium text-gray-900">LinkedIn Ads</h3>
                      <p class="text-sm text-gray-600">Publicité B2B</p>
                    </div>
                  </div>
                  <div class="flex items-center space-x-2">
                    <span class="w-2 h-2 bg-gray-400 rounded-full"></span>
                    <span class="text-sm text-gray-500">Disponible</span>
                  </div>
                </div>
                <p class="text-sm text-gray-600 mb-4">Gérez vos campagnes LinkedIn pour le B2B</p>
                <button class="w-full bg-primary-600 text-white py-2 px-4 rounded-lg hover:bg-primary-700 transition-colors">
                  Connecter
                </button>
              </div>

              <!-- Stripe -->
              <div class="bg-white rounded-lg shadow p-6 border-2 border-dashed border-gray-200">
                <div class="flex items-center justify-between mb-4">
                  <div class="flex items-center space-x-3">
                    <div class="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                      <svg class="h-6 w-6 text-purple-600" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M13.976 9.15c-2.172-.806-3.356-1.426-3.356-2.409 0-.831.683-1.305 1.901-1.305 2.227 0 4.515.858 6.09 1.631l.89-5.494C18.252.274 15.697 0 12.165 0 9.667 0 7.589.654 6.104 1.872 4.56 3.147 3.757 4.992 3.757 7.218c0 4.039 2.467 5.76 6.476 7.219 2.585.92 3.445 1.574 3.445 2.583 0 .98-.84 1.545-2.354 1.545-1.875 0-4.965-.921-6.99-2.109l-.9 5.555C5.175 22.99 8.385 24 11.714 24c2.641 0 4.843-.624 6.328-1.813 1.664-1.305 2.525-3.236 2.525-5.732 0-4.128-2.524-5.851-6.594-7.305h.003z"/>
                      </svg>
                    </div>
                    <div>
                      <h3 class="font-medium text-gray-900">Stripe</h3>
                      <p class="text-sm text-gray-600">Paiements</p>
                    </div>
                  </div>
                  <div class="flex items-center space-x-2">
                    <span class="w-2 h-2 bg-gray-400 rounded-full"></span>
                    <span class="text-sm text-gray-500">Disponible</span>
                  </div>
                </div>
                <p class="text-sm text-gray-600 mb-4">Suivez vos revenus et conversions Stripe</p>
                <button class="w-full bg-primary-600 text-white py-2 px-4 rounded-lg hover:bg-primary-700 transition-colors">
                  Connecter
                </button>
              </div>

              <!-- Webhooks -->
              <div class="bg-white rounded-lg shadow p-6 border-2 border-dashed border-gray-200">
                <div class="flex items-center justify-between mb-4">
                  <div class="flex items-center space-x-3">
                    <div class="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center">
                      <svg class="h-6 w-6 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
                      </svg>
                    </div>
                    <div>
                      <h3 class="font-medium text-gray-900">Webhooks</h3>
                      <p class="text-sm text-gray-600">API personnalisée</p>
                    </div>
                  </div>
                  <div class="flex items-center space-x-2">
                    <span class="w-2 h-2 bg-gray-400 rounded-full"></span>
                    <span class="text-sm text-gray-500">Disponible</span>
                  </div>
                </div>
                <p class="text-sm text-gray-600 mb-4">Configurez des webhooks pour vos intégrations personnalisées</p>
                <button class="w-full bg-primary-600 text-white py-2 px-4 rounded-lg hover:bg-primary-700 transition-colors">
                  Configurer
                </button>
              </div>
            </div>
          </div>
    </div>
  </Layout>
</template>

<script>
import Layout from '../../components/Layout.vue'
import SocialMediaConnections from '../../components/SocialMediaConnections.vue'
import SocialMediaTest from '../../components/SocialMediaTest.vue'
// Google Analytics component removed

export default {
  name: 'Integrations',
  components: {
    Layout,
    SocialMediaConnections,
    SocialMediaTest,
    // GoogleAnalyticsSimpleSetup removed
  },
  data() {
    return {
      integrationStats: {
        activeIntegrations: 12,
        // googleAnalyticsConnected removed
      }
    }
  },
  methods: {
    // Méthodes pour gérer les intégrations
  }
}
</script>