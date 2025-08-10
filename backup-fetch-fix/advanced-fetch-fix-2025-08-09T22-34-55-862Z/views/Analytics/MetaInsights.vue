<template>
  <div class="flex h-screen bg-gray-50">
    <!-- Sidebar -->
    <div
      class="fixed inset-y-0 left-0 z-50 w-64 bg-gray-900 transform transition-transform duration-300 ease-in-out md:translate-x-0 md:static md:inset-0"
      :class="{ '-translate-x-full': !sidebarOpen, 'translate-x-0': sidebarOpen }"
    >
      <Sidebar @close-sidebar="sidebarOpen = false" />
    </div>

    <!-- Overlay for mobile -->
    <div
      v-if="sidebarOpen"
      class="fixed inset-0 z-40 bg-gray-600 bg-opacity-75 md:hidden"
      @click="sidebarOpen = false"
    ></div>

    <!-- Main content -->
    <div class="flex-1 flex flex-col overflow-hidden">
      <!-- Header -->
      <Header @toggle-sidebar="sidebarOpen = !sidebarOpen" />

      <!-- Main content area -->
      <main class="flex-1 overflow-x-hidden overflow-y-auto bg-gray-50">
        <div class="container mx-auto px-6 py-8">
          <!-- En-tête style Google Analytics -->
          <div class="bg-white border-b border-gray-200 rounded-lg mb-6">
            <div class="px-6 py-4">
              <div class="flex items-center justify-between">
                <div>
                  <h1 class="text-2xl font-semibold text-gray-900">Meta Analytics</h1>
                  <p class="text-sm text-gray-600 mt-1">Tableau de bord des performances Facebook et Instagram</p>
                </div>
                <div class="flex items-center space-x-3">
                  <!-- Sélecteur de période -->
                  <div class="relative">
                    <select class="appearance-none bg-white border border-gray-300 rounded-md px-4 py-2 pr-8 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
                      <option>7 derniers jours</option>
                      <option>30 derniers jours</option>
                      <option>90 derniers jours</option>
                    </select>
                    <div class="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none">
                      <svg class="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path>
                      </svg>
                    </div>
                  </div>
                  <button
                    @click="refreshData"
                    class="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  >
                    <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path>
                    </svg>
                    Actualiser
                  </button>
                </div>
              </div>
            </div>
          </div>

          <!-- État de connexion -->
          <div v-if="!isConnected" class="px-6 py-8">
            <div class="max-w-md mx-auto bg-white rounded-lg shadow-sm border border-gray-200 p-8 text-center">
              <div class="w-16 h-16 mx-auto bg-blue-100 rounded-full flex items-center justify-center mb-4">
                <svg class="w-8 h-8 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 class="text-lg font-semibold text-gray-900 mb-2">Connexion Meta requise</h3>
              <p class="text-gray-600 mb-6">Connectez votre compte Facebook pour accéder aux analytics de vos pages et comptes Instagram.</p>
              <button
                @click="connectFacebook"
                :disabled="loading"
                class="w-full bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-md font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <span v-if="loading" class="flex items-center justify-center">
                  <svg class="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                    <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Connexion en cours...
                </span>
                <span v-else>Se connecter avec Meta</span>
              </button>
            </div>
          </div>

          <!-- Erreur -->
          <div v-if="error" class="px-6 py-4">
            <div class="bg-red-50 border-l-4 border-red-400 p-4 rounded-r-md">
              <div class="flex">
                <div class="flex-shrink-0">
                  <svg class="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                    <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd" />
                  </svg>
                </div>
                <div class="ml-3 flex-1">
                  <p class="text-sm text-red-800 font-medium">{{ error }}</p>
                </div>
                <div class="ml-auto pl-3">
                  <button @click="refreshData" class="text-red-600 hover:text-red-500 transition-colors">
                    <svg class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                      <path fill-rule="evenodd" d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z" clip-rule="evenodd" />
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          </div>

          <!-- Contenu principal -->
          <div v-if="isConnected">
            <!-- Chargement -->
            <div v-if="loading" class="flex justify-center items-center py-20">
              <div class="text-center">
                <svg class="animate-spin h-8 w-8 text-blue-600 mx-auto mb-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                  <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                <p class="text-gray-600">Chargement des analytics...</p>
              </div>
            </div>

            <!-- Données chargées -->
            <div v-else>
              <!-- Navigation par onglets style Google Analytics -->
              <div class="bg-white border-b border-gray-200">
                <div class="px-6">
                  <nav class="-mb-px flex space-x-8">
                    <button
                      @click="activeTab = 'overview'"
                      :class="[
                        'py-4 px-1 border-b-2 font-medium text-sm transition-colors',
                        activeTab === 'overview' 
                          ? 'border-indigo-500 text-indigo-600' 
                          : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                      ]"
                    >
                      <div class="flex items-center">
                        <svg class="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                        </svg>
                        Vue d'ensemble
                      </div>
                    </button>
                    <button
                      @click="activeTab = 'facebook'"
                      :class="[
                        'py-4 px-1 border-b-2 font-medium text-sm transition-colors',
                        activeTab === 'facebook' 
                          ? 'border-blue-500 text-blue-600' 
                          : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                      ]"
                    >
                      <div class="flex items-center">
                        <svg class="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                        </svg>
                        Facebook
                      </div>
                    </button>
                    <button
                      @click="activeTab = 'instagram'"
                      :class="[
                        'py-4 px-1 border-b-2 font-medium text-sm transition-colors',
                        activeTab === 'instagram' 
                          ? 'border-pink-500 text-pink-600' 
                          : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                      ]"
                    >
                      <div class="flex items-center">
                        <svg class="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                        </svg>
                        Instagram
                      </div>
                    </button>
                  </nav>
                </div>
              </div>

              <!-- Onglet Vue d'ensemble -->
              <div v-if="activeTab === 'overview'" class="px-6 py-6">
                <!-- Métriques globales -->
                <div class="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                  <div class="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-md transition-shadow">
                    <div class="flex items-center justify-between">
                      <div>
                        <p class="text-sm font-medium text-gray-600 uppercase tracking-wide">Total Abonnés</p>
                        <p class="text-3xl font-bold text-gray-900 mt-2">{{ formatNumber(totalFollowers) }}</p>
                        <div class="flex items-center mt-2 text-sm text-blue-600">
                          <svg class="w-4 h-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 515.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                          </svg>
                          <span class="font-medium">Toutes plateformes</span>
                        </div>
                      </div>
                      <div class="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                        <svg class="h-6 w-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 515.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                        </svg>
                      </div>
                    </div>
                  </div>

                  <div class="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-md transition-shadow">
                    <div class="flex items-center justify-between">
                      <div>
                        <p class="text-sm font-medium text-gray-600 uppercase tracking-wide">Portée Totale</p>
                        <p class="text-3xl font-bold text-gray-900 mt-2">{{ formatNumber(totalReach) }}</p>
                        <div class="flex items-center mt-2 text-sm text-green-600">
                          <svg class="w-4 h-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 11l5-5m0 0l5 5m-5-5v12" />
                          </svg>
                          <span class="font-medium">+5.2%</span>
                        </div>
                      </div>
                      <div class="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                        <svg class="h-6 w-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        </svg>
                      </div>
                    </div>
                  </div>

                  <div class="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-md transition-shadow">
                    <div class="flex items-center justify-between">
                      <div>
                        <p class="text-sm font-medium text-gray-600 uppercase tracking-wide">Impressions</p>
                        <p class="text-3xl font-bold text-gray-900 mt-2">{{ formatNumber(totalImpressions) }}</p>
                        <div class="flex items-center mt-2 text-sm text-purple-600">
                          <svg class="w-4 h-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                          </svg>
                          <span class="font-medium">Vues totales</span>
                        </div>
                      </div>
                      <div class="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                        <svg class="h-6 w-6 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                        </svg>
                      </div>
                    </div>
                  </div>

                  <div class="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-md transition-shadow">
                    <div class="flex items-center justify-between">
                      <div>
                        <p class="text-sm font-medium text-gray-600 uppercase tracking-wide">Engagement</p>
                        <p class="text-3xl font-bold text-gray-900 mt-2">{{ formatNumber(totalEngagement) }}</p>
                        <div class="flex items-center mt-2 text-sm text-orange-600">
                          <svg class="w-4 h-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                          </svg>
                          <span class="font-medium">Interactions</span>
                        </div>
                      </div>
                      <div class="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                        <svg class="h-6 w-6 text-orange-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                        </svg>
                      </div>
                    </div>
                  </div>
                </div>

                <!-- Résumé des plateformes -->
                <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <!-- Facebook -->
                  <div class="bg-white rounded-lg border border-gray-200 p-6">
                    <div class="flex items-center justify-between mb-4">
                      <h3 class="text-lg font-semibold text-gray-900 flex items-center">
                        <div class="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center mr-3">
                          <svg class="h-5 w-5 text-white" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                          </svg>
                        </div>
                        Facebook
                      </h3>
                      <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                        {{ facebookPages.length }} {{ facebookPages.length === 1 ? 'page' : 'pages' }}
                      </span>
                    </div>
                    <div class="grid grid-cols-3 gap-4">
                      <div class="text-center">
                        <p class="text-2xl font-bold text-blue-600">{{ formatNumber(facebookTotalFans) }}</p>
                        <p class="text-xs text-gray-500 uppercase tracking-wide">Fans</p>
                      </div>
                      <div class="text-center">
                        <p class="text-2xl font-bold text-blue-600">{{ formatNumber(facebookTotalReach) }}</p>
                        <p class="text-xs text-gray-500 uppercase tracking-wide">Portée</p>
                      </div>
                      <div class="text-center">
                        <p class="text-2xl font-bold text-blue-600">{{ formatNumber(facebookTotalEngagement) }}</p>
                        <p class="text-xs text-gray-500 uppercase tracking-wide">Engagement</p>
                      </div>
                    </div>
                  </div>

                  <!-- Instagram -->
                  <div class="bg-white rounded-lg border border-gray-200 p-6">
                    <div class="flex items-center justify-between mb-4">
                      <h3 class="text-lg font-semibold text-gray-900 flex items-center">
                        <div class="w-8 h-8 bg-gradient-to-br from-purple-500 via-pink-500 to-red-500 rounded-lg flex items-center justify-center mr-3">
                          <svg class="h-5 w-5 text-white" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                          </svg>
                        </div>
                        Instagram
                      </h3>
                      <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-pink-100 text-pink-800">
                        {{ instagramAccounts.length }} {{ instagramAccounts.length === 1 ? 'compte' : 'comptes' }}
                      </span>
                    </div>
                    <div class="grid grid-cols-3 gap-4">
                      <div class="text-center">
                        <p class="text-2xl font-bold text-pink-600">{{ formatNumber(instagramTotalFollowers) }}</p>
                        <p class="text-xs text-gray-500 uppercase tracking-wide">Abonnés</p>
                      </div>
                      <div class="text-center">
                        <p class="text-2xl font-bold text-pink-600">{{ formatNumber(instagramTotalReach) }}</p>
                        <p class="text-xs text-gray-500 uppercase tracking-wide">Portée</p>
                      </div>
                      <div class="text-center">
                        <p class="text-2xl font-bold text-pink-600">{{ formatNumber(instagramTotalImpressions) }}</p>
                        <p class="text-xs text-gray-500 uppercase tracking-wide">Impressions</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Onglet Facebook -->
              <div v-if="activeTab === 'facebook'" class="px-6 py-6">
                <!-- Métriques Facebook -->
                <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                  <div class="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-md transition-shadow">
                    <div class="flex items-center justify-between">
                      <div>
                        <p class="text-sm font-medium text-gray-600 uppercase tracking-wide">Total Fans</p>
                        <p class="text-3xl font-bold text-gray-900 mt-2">{{ formatNumber(facebookTotalFans) }}</p>
                        <div class="flex items-center mt-2 text-sm text-blue-600">
                          <svg class="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                          </svg>
                          <span class="font-medium">{{ facebookPages.length }} pages</span>
                        </div>
                      </div>
                      <div class="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                        <svg class="h-6 w-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 515.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                        </svg>
                      </div>
                    </div>
                  </div>

                  <div class="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-md transition-shadow">
                    <div class="flex items-center justify-between">
                      <div>
                        <p class="text-sm font-medium text-gray-600 uppercase tracking-wide">Portée</p>
                        <p class="text-3xl font-bold text-gray-900 mt-2">{{ formatNumber(facebookTotalReach) }}</p>
                        <div class="flex items-center mt-2 text-sm text-green-600">
                          <svg class="w-4 h-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 11l5-5m0 0l5 5m-5-5v12" />
                          </svg>
                          <span class="font-medium">+2.1%</span>
                        </div>
                      </div>
                      <div class="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                        <svg class="h-6 w-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        </svg>
                      </div>
                    </div>
                  </div>

                  <div class="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-md transition-shadow">
                    <div class="flex items-center justify-between">
                      <div>
                        <p class="text-sm font-medium text-gray-600 uppercase tracking-wide">Engagement</p>
                        <p class="text-3xl font-bold text-gray-900 mt-2">{{ formatNumber(facebookTotalEngagement) }}</p>
                        <div class="flex items-center mt-2 text-sm text-orange-600">
                          <svg class="w-4 h-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                          </svg>
                          <span class="font-medium">Interactions</span>
                        </div>
                      </div>
                      <div class="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                        <svg class="h-6 w-6 text-orange-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                        </svg>
                      </div>
                    </div>
                  </div>
                </div>

                <!-- Liste des pages Facebook -->
                <div class="bg-white rounded-lg border border-gray-200">
                  <div class="px-6 py-4 border-b border-gray-200">
                    <div class="flex items-center justify-between">
                      <h3 class="text-lg font-semibold text-gray-900">Pages Facebook</h3>
                      <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                        {{ facebookPages.length }} {{ facebookPages.length === 1 ? 'page' : 'pages' }}
                      </span>
                    </div>
                  </div>
                  <div class="overflow-hidden">
                    <div v-if="facebookPages.length === 0" class="text-center py-12">
                      <div class="w-16 h-16 mx-auto bg-blue-100 rounded-full flex items-center justify-center mb-4">
                        <svg class="h-8 w-8 text-blue-600" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                        </svg>
                      </div>
                      <h3 class="text-lg font-medium text-gray-900 mb-2">Aucune page Facebook</h3>
                      <p class="text-sm text-gray-500">Aucune page Facebook n'a été trouvée pour ce compte Meta.</p>
                    </div>
                    <div v-else class="divide-y divide-gray-200">
                      <div v-for="page in facebookPages" :key="page.id" class="p-6 hover:bg-gray-50 transition-colors">
                        <div class="flex items-start justify-between mb-4">
                          <div class="flex items-center">
                            <div class="relative">
                              <img v-if="page.picture" :src="page.picture.data.url" :alt="page.name" class="w-14 h-14 rounded-full object-cover border-2 border-white shadow-sm">
                              <div class="w-14 h-14 bg-blue-600 rounded-full flex items-center justify-center shadow-sm" v-else>
                                <svg class="h-7 w-7 text-white" fill="currentColor" viewBox="0 0 24 24">
                                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                                </svg>
                              </div>
                              <div class="absolute -bottom-1 -right-1 w-5 h-5 bg-green-400 border-2 border-white rounded-full"></div>
                            </div>
                            <div class="ml-4">
                              <h4 class="text-lg font-semibold text-gray-900">{{ page.name }}</h4>
                              <p class="text-sm text-gray-500 flex items-center mt-1">
                                <svg class="w-4 h-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                                </svg>
                                {{ page.category || 'Page Facebook' }}
                              </p>
                              <p class="text-xs text-gray-400 mt-1">ID: {{ page.id }}</p>
                            </div>
                          </div>
                          <div class="text-right">
                            <div class="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
                              <svg class="w-4 h-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                              </svg>
                              {{ formatNumber(page.fan_count || 0) }} fans
                            </div>
                          </div>
                        </div>
                        
                        <!-- Métriques de la page -->
                        <div v-if="page.insights" class="grid grid-cols-3 gap-4 pt-4 border-t border-gray-100">
                          <div class="text-center p-3 bg-blue-50 rounded-lg">
                            <p class="text-2xl font-bold text-blue-600">{{ formatNumber(page.insights.fan_count || 0) }}</p>
                            <p class="text-xs font-medium text-blue-700 uppercase tracking-wide">Fans</p>
                          </div>
                          <div class="text-center p-3 bg-green-50 rounded-lg">
                            <p class="text-2xl font-bold text-green-600">{{ formatNumber(page.insights.page_impressions || 0) }}</p>
                            <p class="text-xs font-medium text-green-700 uppercase tracking-wide">Portée</p>
                          </div>
                          <div class="text-center p-3 bg-orange-50 rounded-lg">
                            <p class="text-2xl font-bold text-orange-600">{{ formatNumber(page.insights.page_engaged_users || 0) }}</p>
                            <p class="text-xs font-medium text-orange-700 uppercase tracking-wide">Engagement</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Onglet Instagram -->
              <div v-if="activeTab === 'instagram'" class="px-6 py-6">
                <!-- Métriques Instagram -->
                <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                  <div class="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-md transition-shadow">
                    <div class="flex items-center justify-between">
                      <div>
                        <p class="text-sm font-medium text-gray-600 uppercase tracking-wide">Total Abonnés</p>
                        <p class="text-3xl font-bold text-gray-900 mt-2">{{ formatNumber(instagramTotalFollowers) }}</p>
                        <div class="flex items-center mt-2 text-sm text-pink-600">
                          <svg class="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                          </svg>
                          <span class="font-medium">{{ instagramAccounts.length }} comptes</span>
                        </div>
                      </div>
                      <div class="w-12 h-12 bg-pink-100 rounded-lg flex items-center justify-center">
                        <svg class="h-6 w-6 text-pink-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 515.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                        </svg>
                      </div>
                    </div>
                  </div>

                  <div class="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-md transition-shadow">
                    <div class="flex items-center justify-between">
                      <div>
                        <p class="text-sm font-medium text-gray-600 uppercase tracking-wide">Portée</p>
                        <p class="text-3xl font-bold text-gray-900 mt-2">{{ formatNumber(instagramTotalReach) }}</p>
                        <div class="flex items-center mt-2 text-sm text-green-600">
                          <svg class="w-4 h-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 11l5-5m0 0l5 5m-5-5v12" />
                          </svg>
                          <span class="font-medium">+3.8%</span>
                        </div>
                      </div>
                      <div class="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                        <svg class="h-6 w-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        </svg>
                      </div>
                    </div>
                  </div>

                  <div class="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-md transition-shadow">
                    <div class="flex items-center justify-between">
                      <div>
                        <p class="text-sm font-medium text-gray-600 uppercase tracking-wide">Impressions</p>
                        <p class="text-3xl font-bold text-gray-900 mt-2">{{ formatNumber(instagramTotalImpressions) }}</p>
                        <div class="flex items-center mt-2 text-sm text-purple-600">
                          <svg class="w-4 h-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                          </svg>
                          <span class="font-medium">Vues</span>
                        </div>
                      </div>
                      <div class="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                        <svg class="h-6 w-6 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                        </svg>
                      </div>
                    </div>
                  </div>
                </div>

                <!-- Liste des comptes Instagram -->
                <div class="bg-white rounded-lg border border-gray-200">
                  <div class="px-6 py-4 border-b border-gray-200">
                    <div class="flex items-center justify-between">
                      <h3 class="text-lg font-semibold text-gray-900">Comptes Instagram</h3>
                      <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-pink-100 text-pink-800">
                        {{ instagramAccounts.length }} {{ instagramAccounts.length === 1 ? 'compte' : 'comptes' }}
                      </span>
                    </div>
                  </div>
                  <div class="overflow-hidden">
                    <div v-if="instagramAccounts.length === 0" class="text-center py-12">
                      <div class="w-16 h-16 mx-auto bg-gradient-to-br from-purple-100 to-pink-100 rounded-full flex items-center justify-center mb-4">
                        <svg class="h-8 w-8 text-pink-500" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                        </svg>
                      </div>
                      <h3 class="text-lg font-medium text-gray-900 mb-2">Aucun compte Instagram</h3>
                      <p class="text-sm text-gray-500">Aucun compte Instagram n'a été trouvé pour ce compte Meta.</p>
                    </div>
                    <div v-else class="divide-y divide-gray-200">
                      <div v-for="account in instagramAccounts" :key="account.id" class="p-6 hover:bg-gray-50 transition-colors">
                        <div class="flex items-start justify-between mb-4">
                          <div class="flex items-center">
                            <div class="relative">
                              <img v-if="account.profile_picture_url" :src="account.profile_picture_url" :alt="account.username" class="w-14 h-14 rounded-full object-cover border-2 border-white shadow-sm">
                              <div class="w-14 h-14 bg-gradient-to-br from-purple-500 via-pink-500 to-red-500 rounded-full flex items-center justify-center shadow-sm" v-else>
                                <svg class="h-7 w-7 text-white" fill="currentColor" viewBox="0 0 24 24">
                                  <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                                </svg>
                              </div>
                              <div class="absolute -bottom-1 -right-1 w-5 h-5 bg-green-400 border-2 border-white rounded-full"></div>
                            </div>
                            <div class="ml-4">
                              <h4 class="text-lg font-semibold text-gray-900">@{{ account.username }}</h4>
                              <p class="text-sm text-gray-500 flex items-center mt-1">
                                <svg class="w-4 h-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                </svg>
                                {{ account.account_type || 'Compte Instagram' }}
                              </p>
                              <p class="text-xs text-gray-400 mt-1">ID: {{ account.id }}</p>
                            </div>
                          </div>
                          <div class="text-right">
                            <div class="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-pink-100 text-pink-800">
                              <svg class="w-4 h-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 515.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                              </svg>
                              {{ formatNumber(account.followers_count || 0) }} abonnés
                            </div>
                          </div>
                        </div>
                        
                        <!-- Métriques du compte -->
                        <div v-if="account.insights" class="grid grid-cols-3 gap-4 pt-4 border-t border-gray-100">
                          <div class="text-center p-3 bg-pink-50 rounded-lg">
                            <p class="text-2xl font-bold text-pink-600">{{ formatNumber(account.insights.followers_count || 0) }}</p>
                            <p class="text-xs font-medium text-pink-700 uppercase tracking-wide">Abonnés</p>
                          </div>
                          <div class="text-center p-3 bg-purple-50 rounded-lg">
                            <p class="text-2xl font-bold text-purple-600">{{ formatNumber(account.insights.reach || 0) }}</p>
                            <p class="text-xs font-medium text-purple-700 uppercase tracking-wide">Portée</p>
                          </div>
                          <div class="text-center p-3 bg-orange-50 rounded-lg">
                            <p class="text-2xl font-bold text-orange-600">{{ formatNumber(account.insights.impressions || 0) }}</p>
                            <p class="text-xs font-medium text-orange-700 uppercase tracking-wide">Impressions</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  </div>
</template>

<script>
import facebookService from '@/services/facebookService';
import Header from '@/components/Header.vue';
import Sidebar from '@/components/Sidebar.vue';

export default {
  name: 'MetaInsights',
  components: {
    Header,
    Sidebar
  },
  data() {
    return {
      loading: false,
      error: null,
      isConnected: false,
      activeTab: 'overview',
      sidebarOpen: false,
      facebookPages: [],
      instagramAccounts: [],
      metaData: {
        totalReach: 0,
        totalEngagement: 0,
        totalFollowers: 0
      }
    };
  },
  computed: {
    // Métriques Facebook calculées
    facebookTotalFans() {
      return this.facebookPages.reduce((total, page) => {
        return total + (page.fan_count || 0);
      }, 0);
    },
    facebookTotalReach() {
      return this.facebookPages.reduce((total, page) => {
        return total + (page.insights?.page_impressions || 0);
      }, 0);
    },
    facebookTotalEngagement() {
      return this.facebookPages.reduce((total, page) => {
        return total + (page.insights?.page_engaged_users || 0);
      }, 0);
    },
    
    // Métriques Instagram calculées
    instagramTotalFollowers() {
      return this.instagramAccounts.reduce((total, account) => {
        return total + (account.insights?.followers_count || 0);
      }, 0);
    },
    instagramTotalReach() {
      return this.instagramAccounts.reduce((total, account) => {
        return total + (account.insights?.reach || 0);
      }, 0);
    },
    instagramTotalImpressions() {
      return this.instagramAccounts.reduce((total, account) => {
        return total + (account.insights?.impressions || 0);
      }, 0);
    },
    
    // Métriques globales
    totalFollowers() {
      return this.facebookTotalFans + this.instagramTotalFollowers;
    },
    totalReach() {
      return this.facebookTotalReach + this.instagramTotalReach;
    },
    totalImpressions() {
      return this.instagramTotalImpressions;
    },
    totalEngagement() {
      return this.facebookTotalEngagement;
    }
  },
  async mounted() {
    await this.checkConnection();
    if (this.isConnected) {
      await this.loadData();
    }
  },
  methods: {
    /**
     * Vérifie si Facebook est connecté
     */
    async checkConnection() {
      try {
        this.isConnected = facebookService.isConnected();
      } catch (error) {
        console.error('Erreur lors de la vérification de la connexion:', error);
        this.isConnected = false;
      }
    },
    
    /**
     * Connecte à Facebook
     */
    async connectFacebook() {
      try {
        this.loading = true;
        this.error = null;
        
        await facebookService.authenticate();
        
      } catch (error) {
        console.error('Erreur lors de la connexion Facebook:', error);
        this.error = error.message || 'Erreur lors de la connexion à Facebook';
      } finally {
        this.loading = false;
      }
    },
    
    /**
     * Charge les données Meta
     */
    async loadData() {
      try {
        this.loading = true;
        this.error = null;
        
        // Charger les pages Facebook
        try {
          const pagesResponse = await facebookService.getAvailablePages();
          if (pagesResponse.success) {
            this.facebookPages = pagesResponse.data;
            
            // Charger les insights pour chaque page
            for (const page of this.facebookPages) {
              try {
                const insightsResponse = await facebookService.getPageInsights(page.id);
                if (insightsResponse.success) {
                  page.insights = insightsResponse.data;
                }
              } catch (error) {
                console.warn(`Erreur lors du chargement des insights pour la page ${page.id}:`, error);
              }
            }
          }
        } catch (error) {
          console.warn('Erreur lors du chargement des pages Facebook:', error);
        }
        
        // Charger les comptes Instagram
        try {
          const accountsResponse = await facebookService.getAvailableInstagramAccounts();
          if (accountsResponse.success) {
            this.instagramAccounts = accountsResponse.data;
            
            // Charger les insights pour chaque compte
            for (const account of this.instagramAccounts) {
              try {
                const insightsResponse = await facebookService.getInstagramInsights(account.id);
                if (insightsResponse.success) {
                  account.insights = insightsResponse.data;
                }
              } catch (error) {
                console.warn(`Erreur lors du chargement des insights pour le compte ${account.id}:`, error);
              }
            }
          }
        } catch (error) {
          console.warn('Erreur lors du chargement des comptes Instagram:', error);
        }
        
      } catch (error) {
        console.error('Erreur lors du chargement des données:', error);
        this.error = error.message || 'Erreur lors du chargement des données Meta';
      } finally {
        this.loading = false;
      }
    },
    
    /**
     * Actualise les données
     */
    async refreshData() {
      await this.checkConnection();
      if (this.isConnected) {
        await this.loadData();
      }
    },
    
    /**
     * Formate un nombre
     */
    formatNumber(num) {
      if (!num) return '0';
      return new Intl.NumberFormat('fr-FR').format(num);
    }
  }
};
</script>

<style scoped>
.animate-spin {
  animation: spin 1s linear infinite;
}

@keyframes spin {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

.transition-colors {
  transition: color 0.2s ease-in-out, background-color 0.2s ease-in-out;
}
</style>