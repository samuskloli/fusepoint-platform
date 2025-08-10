<template>
  <Layout>
    <div>
          <!-- Page Header -->
          <div class="mb-8">
            <div class="flex items-center justify-between">
              <div>
                <h1 class="text-3xl font-bold text-gray-900">Modèles</h1>
                <p class="mt-2 text-gray-600">Créez et gérez vos modèles d'emails et de campagnes</p>
              </div>
              <button @click="showCreateModal = true" class="bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 transition-colors flex items-center space-x-2">
                <svg class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
                <span>Nouveau modèle</span>
              </button>
            </div>
          </div>

          <!-- Template Stats -->
          <div class="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <div class="bg-white rounded-lg shadow p-6">
              <div class="flex items-center">
                <div class="p-2 bg-blue-100 rounded-lg">
                  <svg class="h-6 w-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <div class="ml-4">
                  <p class="text-sm font-medium text-gray-600">Total modèles</p>
                  <p class="text-2xl font-bold text-gray-900">24</p>
                </div>
              </div>
            </div>

            <div class="bg-white rounded-lg shadow p-6">
              <div class="flex items-center">
                <div class="p-2 bg-green-100 rounded-lg">
                  <svg class="h-6 w-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                </div>
                <div class="ml-4">
                  <p class="text-sm font-medium text-gray-600">Modèles email</p>
                  <p class="text-2xl font-bold text-gray-900">18</p>
                </div>
              </div>
            </div>

            <div class="bg-white rounded-lg shadow p-6">
              <div class="flex items-center">
                <div class="p-2 bg-purple-100 rounded-lg">
                  <svg class="h-6 w-6 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 3.055A9.001 9.001 0 1020.945 13H11V3.055z" />
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20.488 9H15V3.512A9.025 9.025 0 0120.488 9z" />
                  </svg>
                </div>
                <div class="ml-4">
                  <p class="text-sm font-medium text-gray-600">Modèles campagne</p>
                  <p class="text-2xl font-bold text-gray-900">6</p>
                </div>
              </div>
            </div>

            <div class="bg-white rounded-lg shadow p-6">
              <div class="flex items-center">
                <div class="p-2 bg-yellow-100 rounded-lg">
                  <svg class="h-6 w-6 text-yellow-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
                <div class="ml-4">
                  <p class="text-sm font-medium text-gray-600">Plus utilisé</p>
                  <p class="text-2xl font-bold text-gray-900">Newsletter</p>
                </div>
              </div>
            </div>
          </div>

          <!-- Search and Filter -->
          <div class="bg-white rounded-lg shadow p-6 mb-8">
            <div class="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
              <div class="flex flex-col md:flex-row md:items-center space-y-4 md:space-y-0 md:space-x-4">
                <div class="relative">
                  <input type="text" placeholder="Rechercher un modèle..." class="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent w-full md:w-64">
                  <svg class="absolute left-3 top-2.5 h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
                <select class="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent">
                  <option>Tous les types</option>
                  <option>Email</option>
                  <option>Campagne</option>
                  <option>Landing Page</option>
                </select>
                <select class="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent">
                  <option>Toutes les catégories</option>
                  <option>Newsletter</option>
                  <option>Promotion</option>
                  <option>Bienvenue</option>
                  <option>Abandon de panier</option>
                  <option>Événement</option>
                </select>
              </div>
              <div class="flex items-center space-x-2">
                <button class="p-2 text-gray-400 hover:text-gray-600">
                  <svg class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                  </svg>
                </button>
                <button class="p-2 text-gray-600">
                  <svg class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 10h16M4 14h16M4 18h16" />
                  </svg>
                </button>
              </div>
            </div>
          </div>

          <!-- Templates Grid -->
          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <!-- Email Template 1 -->
            <div class="bg-white rounded-lg shadow overflow-hidden hover:shadow-lg transition-shadow">
              <div class="h-48 bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center">
                <div class="text-white text-center">
                  <svg class="h-12 w-12 mx-auto mb-2" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                  <p class="text-sm">Aperçu du modèle</p>
                </div>
              </div>
              <div class="p-6">
                <div class="flex items-center justify-between mb-2">
                  <h3 class="text-lg font-medium text-gray-900">Newsletter Hebdomadaire</h3>
                  <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                    Email
                  </span>
                </div>
                <p class="text-sm text-gray-600 mb-4">Modèle moderne pour newsletter avec sections actualités et promotions</p>
                <div class="flex items-center justify-between text-sm text-gray-500 mb-4">
                  <span>Utilisé 45 fois</span>
                  <span>Modifié il y a 2 jours</span>
                </div>
                <div class="flex items-center space-x-2">
                  <button class="flex-1 bg-primary-600 text-white py-2 px-3 rounded-md text-sm hover:bg-primary-700 transition-colors">
                    Utiliser
                  </button>
                  <button class="p-2 text-gray-400 hover:text-gray-600">
                    <svg class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                    </svg>
                  </button>
                  <button class="p-2 text-gray-400 hover:text-gray-600">
                    <svg class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                    </svg>
                  </button>
                  <button class="p-2 text-gray-400 hover:text-red-600">
                    <svg class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
              </div>
            </div>

            <!-- Email Template 2 -->
            <div class="bg-white rounded-lg shadow overflow-hidden hover:shadow-lg transition-shadow">
              <div class="h-48 bg-gradient-to-br from-green-400 to-green-600 flex items-center justify-center">
                <div class="text-white text-center">
                  <svg class="h-12 w-12 mx-auto mb-2" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                  <p class="text-sm">Aperçu du modèle</p>
                </div>
              </div>
              <div class="p-6">
                <div class="flex items-center justify-between mb-2">
                  <h3 class="text-lg font-medium text-gray-900">Email de Bienvenue</h3>
                  <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                    Email
                  </span>
                </div>
                <p class="text-sm text-gray-600 mb-4">Accueillez vos nouveaux abonnés avec style et personnalisation</p>
                <div class="flex items-center justify-between text-sm text-gray-500 mb-4">
                  <span>Utilisé 128 fois</span>
                  <span>Modifié il y a 1 semaine</span>
                </div>
                <div class="flex items-center space-x-2">
                  <button class="flex-1 bg-primary-600 text-white py-2 px-3 rounded-md text-sm hover:bg-primary-700 transition-colors">
                    Utiliser
                  </button>
                  <button class="p-2 text-gray-400 hover:text-gray-600">
                    <svg class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                    </svg>
                  </button>
                  <button class="p-2 text-gray-400 hover:text-gray-600">
                    <svg class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                    </svg>
                  </button>
                  <button class="p-2 text-gray-400 hover:text-red-600">
                    <svg class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
              </div>
            </div>

            <!-- Campaign Template -->
            <div class="bg-white rounded-lg shadow overflow-hidden hover:shadow-lg transition-shadow">
              <div class="h-48 bg-gradient-to-br from-purple-400 to-purple-600 flex items-center justify-center">
                <div class="text-white text-center">
                  <svg class="h-12 w-12 mx-auto mb-2" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M11 3.055A9.001 9.001 0 1020.945 13H11V3.055z" />
                    <path d="M20.488 9H15V3.512A9.025 9.025 0 0120.488 9z" />
                  </svg>
                  <p class="text-sm">Aperçu du modèle</p>
                </div>
              </div>
              <div class="p-6">
                <div class="flex items-center justify-between mb-2">
                  <h3 class="text-lg font-medium text-gray-900">Campagne Promo</h3>
                  <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                    Campagne
                  </span>
                </div>
                <p class="text-sm text-gray-600 mb-4">Template complet pour campagnes promotionnelles multi-canaux</p>
                <div class="flex items-center justify-between text-sm text-gray-500 mb-4">
                  <span>Utilisé 23 fois</span>
                  <span>Modifié il y a 3 jours</span>
                </div>
                <div class="flex items-center space-x-2">
                  <button class="flex-1 bg-primary-600 text-white py-2 px-3 rounded-md text-sm hover:bg-primary-700 transition-colors">
                    Utiliser
                  </button>
                  <button class="p-2 text-gray-400 hover:text-gray-600">
                    <svg class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                    </svg>
                  </button>
                  <button class="p-2 text-gray-400 hover:text-gray-600">
                    <svg class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                    </svg>
                  </button>
                  <button class="p-2 text-gray-400 hover:text-red-600">
                    <svg class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
              </div>
            </div>

            <!-- Email Template 3 -->
            <div class="bg-white rounded-lg shadow overflow-hidden hover:shadow-lg transition-shadow">
              <div class="h-48 bg-gradient-to-br from-red-400 to-red-600 flex items-center justify-center">
                <div class="text-white text-center">
                  <svg class="h-12 w-12 mx-auto mb-2" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                  <p class="text-sm">Aperçu du modèle</p>
                </div>
              </div>
              <div class="p-6">
                <div class="flex items-center justify-between mb-2">
                  <h3 class="text-lg font-medium text-gray-900">Abandon de Panier</h3>
                  <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                    Email
                  </span>
                </div>
                <p class="text-sm text-gray-600 mb-4">Récupérez les ventes perdues avec ce template optimisé</p>
                <div class="flex items-center justify-between text-sm text-gray-500 mb-4">
                  <span>Utilisé 89 fois</span>
                  <span>Modifié il y a 5 jours</span>
                </div>
                <div class="flex items-center space-x-2">
                  <button class="flex-1 bg-primary-600 text-white py-2 px-3 rounded-md text-sm hover:bg-primary-700 transition-colors">
                    Utiliser
                  </button>
                  <button class="p-2 text-gray-400 hover:text-gray-600">
                    <svg class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                    </svg>
                  </button>
                  <button class="p-2 text-gray-400 hover:text-gray-600">
                    <svg class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                    </svg>
                  </button>
                  <button class="p-2 text-gray-400 hover:text-red-600">
                    <svg class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
              </div>
            </div>

            <!-- Email Template 4 -->
            <div class="bg-white rounded-lg shadow overflow-hidden hover:shadow-lg transition-shadow">
              <div class="h-48 bg-gradient-to-br from-yellow-400 to-orange-500 flex items-center justify-center">
                <div class="text-white text-center">
                  <svg class="h-12 w-12 mx-auto mb-2" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                  <p class="text-sm">Aperçu du modèle</p>
                </div>
              </div>
              <div class="p-6">
                <div class="flex items-center justify-between mb-2">
                  <h3 class="text-lg font-medium text-gray-900">Invitation Événement</h3>
                  <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                    Email
                  </span>
                </div>
                <p class="text-sm text-gray-600 mb-4">Template élégant pour invitations à vos événements</p>
                <div class="flex items-center justify-between text-sm text-gray-500 mb-4">
                  <span>Utilisé 34 fois</span>
                  <span>Modifié il y a 1 semaine</span>
                </div>
                <div class="flex items-center space-x-2">
                  <button class="flex-1 bg-primary-600 text-white py-2 px-3 rounded-md text-sm hover:bg-primary-700 transition-colors">
                    Utiliser
                  </button>
                  <button class="p-2 text-gray-400 hover:text-gray-600">
                    <svg class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                    </svg>
                  </button>
                  <button class="p-2 text-gray-400 hover:text-gray-600">
                    <svg class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                    </svg>
                  </button>
                  <button class="p-2 text-gray-400 hover:text-red-600">
                    <svg class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
              </div>
            </div>

            <!-- Landing Page Template -->
            <div class="bg-white rounded-lg shadow overflow-hidden hover:shadow-lg transition-shadow">
              <div class="h-48 bg-gradient-to-br from-indigo-400 to-indigo-600 flex items-center justify-center">
                <div class="text-white text-center">
                  <svg class="h-12 w-12 mx-auto mb-2" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                  <p class="text-sm">Aperçu du modèle</p>
                </div>
              </div>
              <div class="p-6">
                <div class="flex items-center justify-between mb-2">
                  <h3 class="text-lg font-medium text-gray-900">Landing Page Promo</h3>
                  <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800">
                    Landing
                  </span>
                </div>
                <p class="text-sm text-gray-600 mb-4">Page de destination optimisée pour les conversions</p>
                <div class="flex items-center justify-between text-sm text-gray-500 mb-4">
                  <span>Utilisé 12 fois</span>
                  <span>Modifié il y a 4 jours</span>
                </div>
                <div class="flex items-center space-x-2">
                  <button class="flex-1 bg-primary-600 text-white py-2 px-3 rounded-md text-sm hover:bg-primary-700 transition-colors">
                    Utiliser
                  </button>
                  <button class="p-2 text-gray-400 hover:text-gray-600">
                    <svg class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                    </svg>
                  </button>
                  <button class="p-2 text-gray-400 hover:text-gray-600">
                    <svg class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                    </svg>
                  </button>
                  <button class="p-2 text-gray-400 hover:text-red-600">
                    <svg class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          </div>
    </div>

    <!-- Create Template Modal -->
    <div v-if="showCreateModal" class="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
      <div class="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
        <div class="mt-3">
          <div class="flex items-center justify-between mb-4">
            <h3 class="text-lg font-medium text-gray-900">Créer un nouveau modèle</h3>
            <button @click="showCreateModal = false" class="text-gray-400 hover:text-gray-600">
              <svg class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          
          <form @submit.prevent="createTemplate">
            <div class="mb-4">
              <label class="block text-sm font-medium text-gray-700 mb-2">Nom du modèle</label>
              <input type="text" v-model="templateForm.name" required class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent" placeholder="Mon nouveau modèle">
            </div>
            
            <div class="mb-4">
              <label class="block text-sm font-medium text-gray-700 mb-2">Type</label>
              <select v-model="templateForm.type" class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent">
                <option value="email">Email</option>
                <option value="campaign">Campagne</option>
                <option value="landing">Landing Page</option>
              </select>
            </div>
            
            <div class="mb-4">
              <label class="block text-sm font-medium text-gray-700 mb-2">Catégorie</label>
              <select v-model="templateForm.category" class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent">
                <option value="newsletter">Newsletter</option>
                <option value="promotion">Promotion</option>
                <option value="welcome">Bienvenue</option>
                <option value="cart-abandonment">Abandon de panier</option>
                <option value="event">Événement</option>
              </select>
            </div>
            
            <div class="mb-6">
              <label class="block text-sm font-medium text-gray-700 mb-2">Description</label>
              <textarea v-model="templateForm.description" rows="3" class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent" placeholder="Description du modèle..."></textarea>
            </div>
            
            <div class="flex justify-end space-x-3">
              <button type="button" @click="showCreateModal = false" class="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200">
                Annuler
              </button>
              <button type="submit" class="px-4 py-2 text-sm font-medium text-white bg-primary-600 rounded-md hover:bg-primary-700">
                Créer le modèle
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  </Layout>
</template>

<script>
import Layout from '../../components/Layout.vue'

export default {
  name: 'Templates',
  components: {
    Layout
  },
  data() {
    return {
      showCreateModal: false,
      templateForm: {
        name: '',
        type: 'email',
        category: 'newsletter',
        description: ''
      }
    }
  },
  methods: {
    createTemplate() {
      // Simulate creating template
      console.log('Creating template:', this.templateForm)
      this.showCreateModal = false
      this.templateForm = {
        name: '',
        type: 'email',
        category: 'newsletter',
        description: ''
      }
      // Here you would typically make an API call to create the template
    }
  }
}
</script>