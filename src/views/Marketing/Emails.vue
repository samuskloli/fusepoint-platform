<template>
  <Layout>
    <div>
          <!-- Page Header -->
          <div class="mb-8">
            <div class="flex items-center justify-between">
              <div>
                <h1 class="text-3xl font-bold text-gray-900">Email Marketing</h1>
                <p class="mt-2 text-gray-600">Créez et gérez vos campagnes email et newsletters</p>
              </div>
              <div class="flex space-x-3">
                <button @click="showTemplateModal = true" class="bg-white border border-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-50 transition-colors flex items-center space-x-2">
                  <svg class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zM16 13a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z" />
                  </svg>
                  <span>Templates</span>
                </button>
                <button @click="showCreateModal = true" class="bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 transition-colors flex items-center space-x-2">
                  <svg class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                  <span>Nouvelle campagne</span>
                </button>
              </div>
            </div>
          </div>

          <!-- Stats Overview -->
          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div class="bg-white rounded-lg shadow p-6">
              <div class="flex items-center justify-between">
                <div>
                  <p class="text-sm font-medium text-gray-600">Emails envoyés</p>
                  <p class="text-2xl font-bold text-gray-900">45,678</p>
                  <p class="text-sm text-green-600">+12.5% ce mois</p>
                </div>
                <div class="p-2 bg-blue-100 rounded-lg">
                  <svg class="h-6 w-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                </div>
              </div>
            </div>

            <div class="bg-white rounded-lg shadow p-6">
              <div class="flex items-center justify-between">
                <div>
                  <p class="text-sm font-medium text-gray-600">Taux d'ouverture</p>
                  <p class="text-2xl font-bold text-gray-900">24.8%</p>
                  <p class="text-sm text-green-600">+2.3% ce mois</p>
                </div>
                <div class="p-2 bg-green-100 rounded-lg">
                  <svg class="h-6 w-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                </div>
              </div>
            </div>

            <div class="bg-white rounded-lg shadow p-6">
              <div class="flex items-center justify-between">
                <div>
                  <p class="text-sm font-medium text-gray-600">Taux de clic</p>
                  <p class="text-2xl font-bold text-gray-900">3.7%</p>
                  <p class="text-sm text-green-600">+0.8% ce mois</p>
                </div>
                <div class="p-2 bg-purple-100 rounded-lg">
                  <svg class="h-6 w-6 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 15l-2 5L9 9l11 4-5 2zm0 0l5 5M7.188 2.239l.777 2.897M5.136 7.965l-2.898-.777M13.95 4.05l-2.122 2.122m-5.657 5.656l-2.12 2.122" />
                  </svg>
                </div>
              </div>
            </div>

            <div class="bg-white rounded-lg shadow p-6">
              <div class="flex items-center justify-between">
                <div>
                  <p class="text-sm font-medium text-gray-600">Abonnés actifs</p>
                  <p class="text-2xl font-bold text-gray-900">12,456</p>
                  <p class="text-sm text-green-600">+156 ce mois</p>
                </div>
                <div class="p-2 bg-yellow-100 rounded-lg">
                  <svg class="h-6 w-6 text-yellow-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
                  </svg>
                </div>
              </div>
            </div>
          </div>

          <!-- Tabs -->
          <div class="mb-8">
            <div class="border-b border-gray-200">
              <nav class="-mb-px flex space-x-8">
                <button 
                  @click="activeTab = 'campaigns'"
                  :class="activeTab === 'campaigns' ? 'border-primary-500 text-primary-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'"
                  class="whitespace-nowrap py-2 px-1 border-b-2 font-medium text-sm"
                >
                  Campagnes
                </button>
                <button 
                  @click="activeTab = 'automation'"
                  :class="activeTab === 'automation' ? 'border-primary-500 text-primary-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'"
                  class="whitespace-nowrap py-2 px-1 border-b-2 font-medium text-sm"
                >
                  Automatisation
                </button>
                <button 
                  @click="activeTab = 'lists'"
                  :class="activeTab === 'lists' ? 'border-primary-500 text-primary-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'"
                  class="whitespace-nowrap py-2 px-1 border-b-2 font-medium text-sm"
                >
                  Listes de contacts
                </button>
              </nav>
            </div>
          </div>

          <!-- Campaigns Tab -->
          <div v-if="activeTab === 'campaigns'" class="space-y-6">
            <!-- Recent Campaigns -->
            <div class="bg-white rounded-lg shadow">
              <div class="px-6 py-4 border-b border-gray-200">
                <h3 class="text-lg font-semibold text-gray-900">Campagnes récentes</h3>
              </div>
              <div class="p-6">
                <div class="space-y-4">
                  <div class="border border-gray-200 rounded-lg p-4">
                    <div class="flex items-center justify-between mb-3">
                      <div class="flex items-center space-x-3">
                        <div class="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                          <svg class="h-5 w-5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                          </svg>
                        </div>
                        <div>
                          <h4 class="font-medium text-gray-900">Newsletter Juillet 2024</h4>
                          <p class="text-sm text-gray-600">Envoyée le 15 juillet 2024</p>
                        </div>
                      </div>
                      <span class="px-3 py-1 text-sm bg-green-100 text-green-800 rounded-full">Envoyée</span>
                    </div>
                    <div class="grid grid-cols-4 gap-4 text-sm">
                      <div>
                        <p class="font-medium text-gray-900">8,456</p>
                        <p class="text-gray-600">Envoyés</p>
                      </div>
                      <div>
                        <p class="font-medium text-gray-900">2,134</p>
                        <p class="text-gray-600">Ouverts (25.2%)</p>
                      </div>
                      <div>
                        <p class="font-medium text-gray-900">312</p>
                        <p class="text-gray-600">Clics (3.7%)</p>
                      </div>
                      <div>
                        <p class="font-medium text-gray-900">45</p>
                        <p class="text-gray-600">Conversions</p>
                      </div>
                    </div>
                  </div>

                  <div class="border border-gray-200 rounded-lg p-4">
                    <div class="flex items-center justify-between mb-3">
                      <div class="flex items-center space-x-3">
                        <div class="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                          <svg class="h-5 w-5 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 4V2a1 1 0 011-1h8a1 1 0 011 1v2h3a1 1 0 011 1v16a1 1 0 01-1 1H4a1 1 0 01-1-1V5a1 1 0 011-1h3z" />
                          </svg>
                        </div>
                        <div>
                          <h4 class="font-medium text-gray-900">Promotion Été - Derniers jours</h4>
                          <p class="text-sm text-gray-600">Envoyée le 10 juillet 2024</p>
                        </div>
                      </div>
                      <span class="px-3 py-1 text-sm bg-green-100 text-green-800 rounded-full">Envoyée</span>
                    </div>
                    <div class="grid grid-cols-4 gap-4 text-sm">
                      <div>
                        <p class="font-medium text-gray-900">12,234</p>
                        <p class="text-gray-600">Envoyés</p>
                      </div>
                      <div>
                        <p class="font-medium text-gray-900">3,567</p>
                        <p class="text-gray-600">Ouverts (29.1%)</p>
                      </div>
                      <div>
                        <p class="font-medium text-gray-900">567</p>
                        <p class="text-gray-600">Clics (4.6%)</p>
                      </div>
                      <div>
                        <p class="font-medium text-gray-900">89</p>
                        <p class="text-gray-600">Conversions</p>
                      </div>
                    </div>
                  </div>

                  <div class="border border-gray-200 rounded-lg p-4">
                    <div class="flex items-center justify-between mb-3">
                      <div class="flex items-center space-x-3">
                        <div class="w-10 h-10 bg-yellow-100 rounded-lg flex items-center justify-center">
                          <svg class="h-5 w-5 text-yellow-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                        </div>
                        <div>
                          <h4 class="font-medium text-gray-900">Bienvenue nouveaux abonnés</h4>
                          <p class="text-sm text-gray-600">Programmée pour le 20 juillet 2024</p>
                        </div>
                      </div>
                      <span class="px-3 py-1 text-sm bg-yellow-100 text-yellow-800 rounded-full">Programmée</span>
                    </div>
                    <div class="grid grid-cols-4 gap-4 text-sm">
                      <div>
                        <p class="font-medium text-gray-900">234</p>
                        <p class="text-gray-600">Destinataires</p>
                      </div>
                      <div>
                        <p class="font-medium text-gray-900">-</p>
                        <p class="text-gray-600">Ouverts</p>
                      </div>
                      <div>
                        <p class="font-medium text-gray-900">-</p>
                        <p class="text-gray-600">Clics</p>
                      </div>
                      <div>
                        <p class="font-medium text-gray-900">-</p>
                        <p class="text-gray-600">Conversions</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Automation Tab -->
          <div v-if="activeTab === 'automation'" class="space-y-6">
            <div class="bg-white rounded-lg shadow">
              <div class="px-6 py-4 border-b border-gray-200">
                <div class="flex items-center justify-between">
                  <h3 class="text-lg font-semibold text-gray-900">Séquences d'automatisation</h3>
                  <button class="bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 text-sm">
                    Créer une séquence
                  </button>
                </div>
              </div>
              <div class="p-6">
                <div class="space-y-4">
                  <div class="border border-gray-200 rounded-lg p-4">
                    <div class="flex items-center justify-between mb-3">
                      <div class="flex items-center space-x-3">
                        <div class="w-3 h-3 bg-green-400 rounded-full"></div>
                        <h4 class="font-medium text-gray-900">Séquence de bienvenue</h4>
                        <span class="px-2 py-1 text-xs bg-green-100 text-green-800 rounded-full">Actif</span>
                      </div>
                      <div class="text-right">
                        <p class="text-sm font-medium text-gray-900">156 abonnés</p>
                        <p class="text-xs text-gray-600">dans la séquence</p>
                      </div>
                    </div>
                    <p class="text-sm text-gray-600 mb-3">Séquence de 5 emails envoyés aux nouveaux abonnés sur 2 semaines</p>
                    <div class="grid grid-cols-3 gap-4 text-sm">
                      <div>
                        <p class="font-medium text-gray-900">89.2%</p>
                        <p class="text-gray-600">Taux d'ouverture</p>
                      </div>
                      <div>
                        <p class="font-medium text-gray-900">12.4%</p>
                        <p class="text-gray-600">Taux de clic</p>
                      </div>
                      <div>
                        <p class="font-medium text-gray-900">23</p>
                        <p class="text-gray-600">Conversions</p>
                      </div>
                    </div>
                  </div>

                  <div class="border border-gray-200 rounded-lg p-4">
                    <div class="flex items-center justify-between mb-3">
                      <div class="flex items-center space-x-3">
                        <div class="w-3 h-3 bg-blue-400 rounded-full"></div>
                        <h4 class="font-medium text-gray-900">Réactivation clients inactifs</h4>
                        <span class="px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded-full">Actif</span>
                      </div>
                      <div class="text-right">
                        <p class="text-sm font-medium text-gray-900">89 abonnés</p>
                        <p class="text-xs text-gray-600">dans la séquence</p>
                      </div>
                    </div>
                    <p class="text-sm text-gray-600 mb-3">Séquence de réactivation pour les clients inactifs depuis 3 mois</p>
                    <div class="grid grid-cols-3 gap-4 text-sm">
                      <div>
                        <p class="font-medium text-gray-900">34.7%</p>
                        <p class="text-gray-600">Taux d'ouverture</p>
                      </div>
                      <div>
                        <p class="font-medium text-gray-900">5.8%</p>
                        <p class="text-gray-600">Taux de clic</p>
                      </div>
                      <div>
                        <p class="font-medium text-gray-900">12</p>
                        <p class="text-gray-600">Réactivations</p>
                      </div>
                    </div>
                  </div>

                  <div class="border border-gray-200 rounded-lg p-4">
                    <div class="flex items-center justify-between mb-3">
                      <div class="flex items-center space-x-3">
                        <div class="w-3 h-3 bg-yellow-400 rounded-full"></div>
                        <h4 class="font-medium text-gray-900">Suivi panier abandonné</h4>
                        <span class="px-2 py-1 text-xs bg-yellow-100 text-yellow-800 rounded-full">En pause</span>
                      </div>
                      <div class="text-right">
                        <p class="text-sm font-medium text-gray-900">45 abonnés</p>
                        <p class="text-xs text-gray-600">dans la séquence</p>
                      </div>
                    </div>
                    <p class="text-sm text-gray-600 mb-3">Séquence de récupération pour les paniers abandonnés</p>
                    <div class="grid grid-cols-3 gap-4 text-sm">
                      <div>
                        <p class="font-medium text-gray-900">67.3%</p>
                        <p class="text-gray-600">Taux d'ouverture</p>
                      </div>
                      <div>
                        <p class="font-medium text-gray-900">18.9%</p>
                        <p class="text-gray-600">Taux de clic</p>
                      </div>
                      <div>
                        <p class="font-medium text-gray-900">8</p>
                        <p class="text-gray-600">Récupérations</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Lists Tab -->
          <div v-if="activeTab === 'lists'" class="space-y-6">
            <div class="bg-white rounded-lg shadow">
              <div class="px-6 py-4 border-b border-gray-200">
                <div class="flex items-center justify-between">
                  <h3 class="text-lg font-semibold text-gray-900">Listes de contacts</h3>
                  <button class="bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 text-sm">
                    Créer une liste
                  </button>
                </div>
              </div>
              <div class="p-6">
                <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  <div class="border border-gray-200 rounded-lg p-4">
                    <div class="flex items-center justify-between mb-3">
                      <h4 class="font-medium text-gray-900">Tous les abonnés</h4>
                      <span class="px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded-full">Principal</span>
                    </div>
                    <p class="text-2xl font-bold text-gray-900 mb-1">12,456</p>
                    <p class="text-sm text-gray-600 mb-3">contacts actifs</p>
                    <div class="text-xs text-gray-500">
                      <p>Dernière mise à jour: il y a 2h</p>
                    </div>
                  </div>

                  <div class="border border-gray-200 rounded-lg p-4">
                    <div class="flex items-center justify-between mb-3">
                      <h4 class="font-medium text-gray-900">Clients VIP</h4>
                      <span class="px-2 py-1 text-xs bg-purple-100 text-purple-800 rounded-full">Segment</span>
                    </div>
                    <p class="text-2xl font-bold text-gray-900 mb-1">1,234</p>
                    <p class="text-sm text-gray-600 mb-3">clients premium</p>
                    <div class="text-xs text-gray-500">
                      <p>Dernière mise à jour: il y a 1j</p>
                    </div>
                  </div>

                  <div class="border border-gray-200 rounded-lg p-4">
                    <div class="flex items-center justify-between mb-3">
                      <h4 class="font-medium text-gray-900">Prospects qualifiés</h4>
                      <span class="px-2 py-1 text-xs bg-green-100 text-green-800 rounded-full">Lead</span>
                    </div>
                    <p class="text-2xl font-bold text-gray-900 mb-1">567</p>
                    <p class="text-sm text-gray-600 mb-3">prospects chauds</p>
                    <div class="text-xs text-gray-500">
                      <p>Dernière mise à jour: il y a 3h</p>
                    </div>
                  </div>

                  <div class="border border-gray-200 rounded-lg p-4">
                    <div class="flex items-center justify-between mb-3">
                      <h4 class="font-medium text-gray-900">Nouveaux abonnés</h4>
                      <span class="px-2 py-1 text-xs bg-yellow-100 text-yellow-800 rounded-full">Récent</span>
                    </div>
                    <p class="text-2xl font-bold text-gray-900 mb-1">234</p>
                    <p class="text-sm text-gray-600 mb-3">ce mois</p>
                    <div class="text-xs text-gray-500">
                      <p>Dernière mise à jour: il y a 1h</p>
                    </div>
                  </div>

                  <div class="border border-gray-200 rounded-lg p-4">
                    <div class="flex items-center justify-between mb-3">
                      <h4 class="font-medium text-gray-900">Clients inactifs</h4>
                      <span class="px-2 py-1 text-xs bg-red-100 text-red-800 rounded-full">Inactif</span>
                    </div>
                    <p class="text-2xl font-bold text-gray-900 mb-1">890</p>
                    <p class="text-sm text-gray-600 mb-3">+ de 3 mois</p>
                    <div class="text-xs text-gray-500">
                      <p>Dernière mise à jour: il y a 1j</p>
                    </div>
                  </div>

                  <div class="border-2 border-dashed border-gray-300 rounded-lg p-4 flex items-center justify-center">
                    <div class="text-center">
                      <svg class="mx-auto h-8 w-8 text-gray-400 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                      </svg>
                      <p class="text-sm text-gray-600">Créer une nouvelle liste</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

    <!-- Create Campaign Modal -->
    <div v-if="showCreateModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div class="bg-white rounded-lg p-6 w-full max-w-md mx-4">
        <div class="flex items-center justify-between mb-4">
          <h3 class="text-lg font-semibold text-gray-900">Nouvelle campagne email</h3>
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
              <input type="text" class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent" required>
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Type de campagne</label>
              <select class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent" required>
                <option value="">Sélectionner un type</option>
                <option value="newsletter">Newsletter</option>
                <option value="promotion">Promotion</option>
                <option value="announcement">Annonce</option>
                <option value="welcome">Bienvenue</option>
              </select>
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Liste de destinataires</label>
              <select class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent" required>
                <option value="">Sélectionner une liste</option>
                <option value="all">Tous les abonnés (12,456)</option>
                <option value="vip">Clients VIP (1,234)</option>
                <option value="prospects">Prospects qualifiés (567)</option>
                <option value="new">Nouveaux abonnés (234)</option>
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

    <!-- Template Modal -->
    <div v-if="showTemplateModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div class="bg-white rounded-lg p-6 w-full max-w-4xl mx-4 max-h-[90vh] overflow-y-auto">
        <div class="flex items-center justify-between mb-6">
          <h3 class="text-lg font-semibold text-gray-900">Templates d'email</h3>
          <button @click="showTemplateModal = false" class="text-gray-400 hover:text-gray-600">
            <svg class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div class="border border-gray-200 rounded-lg overflow-hidden hover:shadow-lg transition-shadow cursor-pointer">
            <div class="h-48 bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center">
              <span class="text-white font-bold text-lg">Newsletter</span>
            </div>
            <div class="p-4">
              <h4 class="font-medium text-gray-900 mb-2">Newsletter moderne</h4>
              <p class="text-sm text-gray-600">Template élégant pour vos newsletters hebdomadaires</p>
            </div>
          </div>
          <div class="border border-gray-200 rounded-lg overflow-hidden hover:shadow-lg transition-shadow cursor-pointer">
            <div class="h-48 bg-gradient-to-br from-green-400 to-blue-500 flex items-center justify-center">
              <span class="text-white font-bold text-lg">Promotion</span>
            </div>
            <div class="p-4">
              <h4 class="font-medium text-gray-900 mb-2">Email promotionnel</h4>
              <p class="text-sm text-gray-600">Parfait pour vos offres spéciales et promotions</p>
            </div>
          </div>
          <div class="border border-gray-200 rounded-lg overflow-hidden hover:shadow-lg transition-shadow cursor-pointer">
            <div class="h-48 bg-gradient-to-br from-pink-400 to-red-500 flex items-center justify-center">
              <span class="text-white font-bold text-lg">Bienvenue</span>
            </div>
            <div class="p-4">
              <h4 class="font-medium text-gray-900 mb-2">Email de bienvenue</h4>
              <p class="text-sm text-gray-600">Accueillez vos nouveaux abonnés avec style</p>
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
  name: 'Emails',
  components: {
    Layout
  },
  data() {
    return {
      activeTab: 'campaigns',
      showCreateModal: false,
      showTemplateModal: false
    }
  },
  methods: {
    createCampaign() {
      this.showCreateModal = false
    }
  }
}
</script>