<template>
  <Layout>
    <div>
          <!-- Page Header -->
          <div class="mb-8">
            <div class="flex items-center justify-between">
              <div>
                <h1 class="text-3xl font-bold text-gray-900">Facturation</h1>
                <p class="mt-2 text-gray-600">Gérez votre abonnement et vos paiements</p>
              </div>
              <div class="flex items-center space-x-3">
                <span class="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
                  Plan Pro - Actif
                </span>
                <button class="bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 transition-colors">
                  Mettre à niveau
                </button>
              </div>
            </div>
          </div>

          <!-- Current Plan -->
          <div class="bg-white rounded-lg shadow p-6 mb-8">
            <div class="flex items-center justify-between mb-6">
              <h2 class="text-xl font-semibold text-gray-900">Plan actuel</h2>
              <button class="text-primary-600 hover:text-primary-700 text-sm font-medium">Changer de plan</button>
            </div>
            
            <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div class="lg:col-span-2">
                <div class="flex items-center space-x-4 mb-4">
                  <div class="p-3 bg-primary-100 rounded-lg">
                    <svg class="h-8 w-8 text-primary-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                    </svg>
                  </div>
                  <div>
                    <h3 class="text-lg font-medium text-gray-900">Plan Pro</h3>
                    <p class="text-gray-600">Parfait pour les équipes en croissance</p>
                  </div>
                </div>
                
                <div class="grid grid-cols-2 gap-4 mb-4">
                  <div>
                    <p class="text-sm text-gray-600">Prix mensuel</p>
                    <p class="text-2xl font-bold text-gray-900">{{ $formatCurrency(99) }}<span class="text-sm font-normal text-gray-600">/mois</span></p>
                  </div>
                  <div>
                    <p class="text-sm text-gray-600">Prochaine facturation</p>
                    <p class="text-lg font-medium text-gray-900">15 mars 2024</p>
                  </div>
                </div>
                
                <div class="space-y-2">
                  <div class="flex items-center text-sm text-gray-600">
                    <svg class="h-4 w-4 text-green-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                      <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd" />
                    </svg>
                    Jusqu'à 50 membres d'équipe
                  </div>
                  <div class="flex items-center text-sm text-gray-600">
                    <svg class="h-4 w-4 text-green-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                      <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd" />
                    </svg>
                    Analytics avancées
                  </div>
                  <div class="flex items-center text-sm text-gray-600">
                    <svg class="h-4 w-4 text-green-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                      <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd" />
                    </svg>
                    Intégrations illimitées
                  </div>
                  <div class="flex items-center text-sm text-gray-600">
                    <svg class="h-4 w-4 text-green-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                      <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd" />
                    </svg>
                    Support prioritaire
                  </div>
                </div>
              </div>
              
              <div class="bg-gray-50 rounded-lg p-4">
                <h4 class="font-medium text-gray-900 mb-3">Utilisation ce mois</h4>
                <div class="space-y-3">
                  <div>
                    <div class="flex justify-between text-sm mb-1">
                      <span class="text-gray-600">Membres d'équipe</span>
                      <span class="text-gray-900">12 / 50</span>
                    </div>
                    <div class="w-full bg-gray-200 rounded-full h-2">
                      <div class="bg-primary-600 h-2 rounded-full" style="width: 24%"></div>
                    </div>
                  </div>
                  <div>
                    <div class="flex justify-between text-sm mb-1">
                      <span class="text-gray-600">Campagnes actives</span>
                      <span class="text-gray-900">8 / 100</span>
                    </div>
                    <div class="w-full bg-gray-200 rounded-full h-2">
                      <div class="bg-green-500 h-2 rounded-full" style="width: 8%"></div>
                    </div>
                  </div>
                  <div>
                    <div class="flex justify-between text-sm mb-1">
                      <span class="text-gray-600">Emails envoyés</span>
                      <span class="text-gray-900">45K / 100K</span>
                    </div>
                    <div class="w-full bg-gray-200 rounded-full h-2">
                      <div class="bg-yellow-500 h-2 rounded-full" style="width: 45%"></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Payment Method -->
          <div class="bg-white rounded-lg shadow p-6 mb-8">
            <div class="flex items-center justify-between mb-6">
              <h2 class="text-xl font-semibold text-gray-900">Méthode de paiement</h2>
              <button class="text-primary-600 hover:text-primary-700 text-sm font-medium">Modifier</button>
            </div>
            
            <div class="flex items-center space-x-4">
              <div class="p-3 bg-blue-100 rounded-lg">
                <svg class="h-8 w-8 text-blue-600" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
                  <path d="M2 8h20v2H2z"/>
                </svg>
              </div>
              <div>
                <p class="font-medium text-gray-900">Visa se terminant par 4242</p>
                <p class="text-sm text-gray-600">Expire le 12/2027</p>
              </div>
              <div class="ml-auto">
                <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                  Valide
                </span>
              </div>
            </div>
          </div>

          <!-- Billing History -->
          <div class="bg-white rounded-lg shadow overflow-hidden mb-8">
            <div class="px-6 py-4 border-b border-gray-200">
              <div class="flex items-center justify-between">
                <h2 class="text-xl font-semibold text-gray-900">Historique de facturation</h2>
                <button class="text-primary-600 hover:text-primary-700 text-sm font-medium">Télécharger tout</button>
              </div>
            </div>
            
            <div class="overflow-x-auto">
              <table class="min-w-full divide-y divide-gray-200">
                <thead class="bg-gray-50">
                  <tr>
                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Description</th>
                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Montant</th>
                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Statut</th>
                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody class="bg-white divide-y divide-gray-200">
                  <tr>
                    <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">15 fév 2024</td>
                    <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">Plan Pro - Février 2024</td>
                    <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{{ $formatCurrency(99) }}</td>
                    <td class="px-6 py-4 whitespace-nowrap">
                      <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        Payé
                      </span>
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <button class="text-primary-600 hover:text-primary-900">Télécharger</button>
                    </td>
                  </tr>
                  <tr>
                    <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">15 jan 2024</td>
                    <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">Plan Pro - Janvier 2024</td>
                    <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">99,00 €</td>
                    <td class="px-6 py-4 whitespace-nowrap">
                      <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        Payé
                      </span>
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <button class="text-primary-600 hover:text-primary-900">Télécharger</button>
                    </td>
                  </tr>
                  <tr>
                    <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">15 déc 2023</td>
                    <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">Plan Pro - Décembre 2023</td>
                    <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">99,00 €</td>
                    <td class="px-6 py-4 whitespace-nowrap">
                      <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        Payé
                      </span>
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <button class="text-primary-600 hover:text-primary-900">Télécharger</button>
                    </td>
                  </tr>
                  <tr>
                    <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">15 nov 2023</td>
                    <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">Mise à niveau vers Pro</td>
                    <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">99,00 €</td>
                    <td class="px-6 py-4 whitespace-nowrap">
                      <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        Payé
                      </span>
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <button class="text-primary-600 hover:text-primary-900">Télécharger</button>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          <!-- Upgrade Plans -->
          <div class="bg-white rounded-lg shadow p-6">
            <div class="text-center mb-8">
              <h2 class="text-2xl font-bold text-gray-900 mb-2">Choisissez votre plan</h2>
              <p class="text-gray-600">Sélectionnez le plan qui correspond le mieux à vos besoins</p>
            </div>
            
            <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
              <!-- Starter Plan -->
              <div class="border border-gray-200 rounded-lg p-6">
                <div class="text-center mb-6">
                  <h3 class="text-lg font-medium text-gray-900 mb-2">Starter</h3>
                  <div class="text-3xl font-bold text-gray-900 mb-1">{{ $formatCurrency(29) }}<span class="text-sm font-normal text-gray-600">/mois</span></div>
                  <p class="text-sm text-gray-600">Parfait pour débuter</p>
                </div>
                
                <ul class="space-y-3 mb-6">
                  <li class="flex items-center text-sm text-gray-600">
                    <svg class="h-4 w-4 text-green-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                      <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd" />
                    </svg>
                    Jusqu'à 5 membres
                  </li>
                  <li class="flex items-center text-sm text-gray-600">
                    <svg class="h-4 w-4 text-green-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                      <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd" />
                    </svg>
                    10 campagnes
                  </li>
                  <li class="flex items-center text-sm text-gray-600">
                    <svg class="h-4 w-4 text-green-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                      <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd" />
                    </svg>
                    10K emails/mois
                  </li>
                  <li class="flex items-center text-sm text-gray-600">
                    <svg class="h-4 w-4 text-green-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                      <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd" />
                    </svg>
                    Support email
                  </li>
                </ul>
                
                <button class="w-full bg-gray-100 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-200 transition-colors">
                  Plan actuel
                </button>
              </div>

              <!-- Pro Plan -->
              <div class="border-2 border-primary-500 rounded-lg p-6 relative">
                <div class="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                  <span class="bg-primary-500 text-white px-3 py-1 rounded-full text-xs font-medium">Populaire</span>
                </div>
                
                <div class="text-center mb-6">
                  <h3 class="text-lg font-medium text-gray-900 mb-2">Pro</h3>
                  <div class="text-3xl font-bold text-gray-900 mb-1">{{ $formatCurrency(99) }}<span class="text-sm font-normal text-gray-600">/mois</span></div>
                  <p class="text-sm text-gray-600">Pour les équipes en croissance</p>
                </div>
                
                <ul class="space-y-3 mb-6">
                  <li class="flex items-center text-sm text-gray-600">
                    <svg class="h-4 w-4 text-green-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                      <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd" />
                    </svg>
                    Jusqu'à 50 membres
                  </li>
                  <li class="flex items-center text-sm text-gray-600">
                    <svg class="h-4 w-4 text-green-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                      <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd" />
                    </svg>
                    Campagnes illimitées
                  </li>
                  <li class="flex items-center text-sm text-gray-600">
                    <svg class="h-4 w-4 text-green-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                      <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd" />
                    </svg>
                    100K emails/mois
                  </li>
                  <li class="flex items-center text-sm text-gray-600">
                    <svg class="h-4 w-4 text-green-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                      <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd" />
                    </svg>
                    Support prioritaire
                  </li>
                </ul>
                
                <button class="w-full bg-primary-600 text-white py-2 px-4 rounded-lg hover:bg-primary-700 transition-colors">
                  Plan actuel
                </button>
              </div>

              <!-- Enterprise Plan -->
              <div class="border border-gray-200 rounded-lg p-6">
                <div class="text-center mb-6">
                  <h3 class="text-lg font-medium text-gray-900 mb-2">Enterprise</h3>
                  <div class="text-3xl font-bold text-gray-900 mb-1">{{ $formatCurrency(299) }}<span class="text-sm font-normal text-gray-600">/mois</span></div>
                  <p class="text-sm text-gray-600">Pour les grandes entreprises</p>
                </div>
                
                <ul class="space-y-3 mb-6">
                  <li class="flex items-center text-sm text-gray-600">
                    <svg class="h-4 w-4 text-green-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                      <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd" />
                    </svg>
                    Membres illimités
                  </li>
                  <li class="flex items-center text-sm text-gray-600">
                    <svg class="h-4 w-4 text-green-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                      <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd" />
                    </svg>
                    Tout illimité
                  </li>
                  <li class="flex items-center text-sm text-gray-600">
                    <svg class="h-4 w-4 text-green-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                      <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd" />
                    </svg>
                    API personnalisée
                  </li>
                  <li class="flex items-center text-sm text-gray-600">
                    <svg class="h-4 w-4 text-green-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                      <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd" />
                    </svg>
                    Support dédié
                  </li>
                </ul>
                
                <button class="w-full bg-primary-600 text-white py-2 px-4 rounded-lg hover:bg-primary-700 transition-colors">
                  Mettre à niveau
                </button>
              </div>
            </div>
          </div>
    </div>
  </Layout>
</template>

<script>
import Layout from '../../components/Layout.vue'

export default {
  name: 'Billing',
  components: {
    Layout
  },
  data() {
    return {
    }
  }
}
</script>