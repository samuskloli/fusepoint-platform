<template>
  <div class="flex h-screen bg-gray-50">
    <!-- Sidebar -->
    <div
      class="fixed inset-y-0 left-0 z-50 w-64 bg-gray-900 transform transition-transform duration-300 ease-in-out md:translate-x-0 md:static md:inset-0"
      :class="{ '-translate-x-full': !sidebarOpen, 'translate-x-0': sidebarOpen }"
    >
      <AgentSidebar @close-sidebar="sidebarOpen = false" />
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
      <main class="flex-1 overflow-y-auto bg-gray-50">
        <!-- Page Header -->
        <div class="bg-white shadow-sm border-b border-gray-200">
          <div class="px-4 sm:px-6 lg:px-8">
            <div class="flex justify-between items-center py-6">
              <div>
                <h1 class="text-2xl font-bold text-gray-900">Gestion des Clients</h1>
                <p class="mt-1 text-sm text-gray-500">Gérez vos clients et leurs informations</p>
              </div>
              <div class="flex space-x-3">
                <button
                  @click="showCreateUserModal = true"
                  class="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700"
                >
                  <svg class="-ml-1 mr-2 h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                  Créer Utilisateur
                </button>
                <button
                  @click="showEmailModal = true"
                  class="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                >
                <svg class="-ml-1 mr-2 h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                Email Groupé
              </button>
              <button
                @click="refreshClients"
                class="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
              >
                <svg class="-ml-1 mr-2 h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                Actualiser
              </button>
            </div>
          </div>
        </div>

        <!-- Filters -->
        <div class="p-4 sm:p-6 lg:p-8">
        <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
          <div class="grid grid-cols-1 md:grid-cols-5 gap-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">Rechercher</label>
              <input
                v-model="searchQuery"
                type="text"
                placeholder="Nom, email, entreprise..."
                class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">Statut</label>
              <select v-model="statusFilter" class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500">
                <option value="">Tous</option>
                <option value="active">Actif</option>
                <option value="inactive">Inactif</option>
              </select>
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">Entreprise</label>
              <select v-model="companyFilter" class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500">
                <option value="">Toutes</option>
                <option v-for="company in companies" :key="company" :value="company">{{ company }}</option>
              </select>
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">Agent attribué</label>
              <select v-model="agentFilter" class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500">
                <option value="">Tous</option>
                <option value="unassigned" class="text-red-600 font-medium">⚠️ Sans agent attribué</option>
                <option v-for="agent in availableAgents" :key="agent.id" :value="agent.id">
                  {{ agent.first_name }} {{ agent.last_name }}
                </option>
              </select>
            </div>
            <div class="flex items-end">
              <button
                @click="clearFilters"
                class="w-full px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
              >
                Effacer
              </button>
            </div>
          </div>
        </div>

        <!-- Clients List -->
        <div class="bg-white rounded-lg shadow-sm border border-gray-200">
          <div class="px-6 py-4 border-b border-gray-200">
            <div class="flex justify-between items-center">
              <h3 class="text-lg font-medium text-gray-900">Liste des Clients ({{ filteredClients.length }})</h3>
              <div class="flex items-center space-x-4">
                <div class="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    @change="toggleSelectAll"
                    :checked="selectedClients.length === filteredClients.length && filteredClients.length > 0"
                    class="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span class="text-sm text-gray-500">Sélectionner tout</span>
                </div>
                <button
                  v-if="selectedClients.length > 0"
                  @click="deleteSelectedClients"
                  class="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                >
                  <svg class="-ml-0.5 mr-2 h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                  Supprimer ({{ selectedClients.length }})
                </button>
              </div>
            </div>
          </div>
          
          <div v-if="loading" class="p-8 text-center text-gray-500">
            Chargement des clients...
          </div>
          
          <div v-else-if="filteredClients.length === 0" class="p-8 text-center text-gray-500">
            Aucun client trouvé
          </div>
          
          <div v-else class="divide-y divide-gray-200">
            <div
              v-for="client in filteredClients"
              :key="client.id"
              class="p-6 hover:bg-gray-50 transition-colors"
            >
              <div class="flex items-center justify-between">
                <div class="flex items-center space-x-4">
                  <input
                    type="checkbox"
                    :value="client.id"
                    v-model="selectedClients"
                    class="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <div class="flex-shrink-0">
                    <div class="h-12 w-12 rounded-full bg-gray-300 flex items-center justify-center">
                      <span class="text-lg font-medium text-gray-700">
                        {{ getInitials(client.first_name, client.last_name) }}
                      </span>
                    </div>
                  </div>
                  <div class="flex-1 min-w-0">
                    <div class="flex items-center space-x-2">
                      <h4 class="text-lg font-medium text-gray-900">
                        {{ client.first_name }} {{ client.last_name }}
                      </h4>
                      <span :class="[
                        'inline-flex px-2 py-1 text-xs font-semibold rounded-full',
                        client.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                      ]">
                        {{ client.is_active ? 'Actif' : 'Inactif' }}
                      </span>
                    </div>
                    <p class="text-sm text-gray-600">{{ client.email }}</p>
                    <p v-if="client.company_name" class="text-sm text-gray-500">{{ client.company_name }}</p>
                    <div class="mt-2 flex items-center space-x-4 text-xs text-gray-500">
                      <span>Inscrit le {{ formatDate(client.created_at) }}</span>
                      <span v-if="client.last_login">Dernière connexion: {{ formatDate(client.last_login) }}</span>
                      <span v-else>Jamais connecté</span>
                    </div>
                  </div>
                </div>
                
                <div class="flex items-center space-x-2">
                  <!-- Indicateur d'agent attribué -->
                  <div v-if="client.assigned_agent" class="flex items-center space-x-1 px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs">
                    <svg class="h-3 w-3" fill="currentColor" viewBox="0 0 20 20">
                      <path fill-rule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clip-rule="evenodd" />
                    </svg>
                    <span>{{ client.assigned_agent.first_name }} {{ client.assigned_agent.last_name }}</span>
                  </div>
                  <div v-else class="flex items-center space-x-1 px-2 py-1 bg-red-100 text-red-800 rounded-full text-xs">
                    <svg class="h-3 w-3" fill="currentColor" viewBox="0 0 20 20">
                      <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clip-rule="evenodd" />
                    </svg>
                    <span>Sans agent</span>
                  </div>
                  
                  <!-- Boutons d'attribution d'agent -->

                  <button
                    @click="openAssignAgentModal(client)"
                    class="p-2 text-indigo-600 hover:text-indigo-800 rounded-md hover:bg-indigo-50"
                    :title="client.assigned_agent ? 'Changer d\'agent' : 'Attribuer un agent'"
                  >
                    <svg class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                  </button>
                  
                  <button
                    @click="viewNotifications(client.id)"
                    class="p-2 text-gray-400 hover:text-gray-600 rounded-md hover:bg-gray-100"
                    title="Voir notifications"
                  >
                    <svg class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 17h5l-5 5v-5zM11 19H6a2 2 0 01-2-2V7a2 2 0 012-2h5m5 0v5" />
                    </svg>
                  </button>
                  <button
                    @click="sendMessage(client)"
                    class="p-2 text-blue-600 hover:text-blue-800 rounded-md hover:bg-blue-50"
                    title="Envoyer message"
                  >
                    <svg class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-3.582 8-8 8a8.955 8.955 0 01-4.126-.98L3 21l1.98-5.874A8.955 8.955 0 013 12c0-4.418 3.582-8 8-8s8 3.582 8 8z" />
                    </svg>
                  </button>
                  <button
                    @click="sendEmail(client)"
                    class="p-2 text-green-600 hover:text-green-800 rounded-md hover:bg-green-50"
                    title="Envoyer email"
                  >
                    <svg class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                  </button>
                  <button
                    @click="toggleClientStatus(client)"
                    :class="[
                      'p-2 rounded-md',
                      client.is_active 
                        ? 'text-red-600 hover:text-red-800 hover:bg-red-50' 
                        : 'text-green-600 hover:text-green-800 hover:bg-green-50'
                    ]"
                    :title="client.is_active ? 'Désactiver' : 'Activer'"
                  >
                    <svg v-if="client.is_active" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728L5.636 5.636m12.728 12.728L18.364 5.636M5.636 18.364l12.728-12.728" />
                    </svg>
                    <svg v-else class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </button>
                  <button
                    @click="deleteClient(client)"
                    class="p-2 text-red-600 hover:text-red-800 rounded-md hover:bg-red-50"
                    title="Supprimer"
                  >
                    <svg class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Email Modal -->
    <div v-if="showEmailModal" class="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
      <div class="relative top-20 mx-auto p-5 border w-11/12 md:w-3/4 lg:w-1/2 shadow-lg rounded-md bg-white">
        <div class="mt-3">
          <div class="flex justify-between items-center mb-4">
            <h3 class="text-lg font-medium text-gray-900">
              {{ emailForm.recipient ? 'Envoyer Email' : 'Email Groupé' }}
            </h3>
            <button @click="closeEmailModal" class="text-gray-400 hover:text-gray-600">
              <svg class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          
          <form @submit.prevent="submitEmail">
            <div class="space-y-4">
              <div v-if="!emailForm.recipient">
                <label class="block text-sm font-medium text-gray-700 mb-2">Destinataires</label>
                <p class="text-sm text-gray-600">{{ selectedClients.length }} client(s) sélectionné(s)</p>
              </div>
              
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">Sujet</label>
                <input
                  v-model="emailForm.subject"
                  type="text"
                  required
                  class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Sujet de l'email"
                />
              </div>
              
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">Message</label>
                <textarea
                  v-model="emailForm.content"
                  rows="6"
                  required
                  class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Contenu de l'email"
                ></textarea>
              </div>
              
              <div class="flex justify-end space-x-3">
                <button
                  type="button"
                  @click="closeEmailModal"
                  class="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  :disabled="sendingEmail"
                  class="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
                >
                  <span v-if="sendingEmail">Envoi...</span>
                  <span v-else>Envoyer</span>
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>

    <!-- Message Modal -->
    <div v-if="showMessageModal" class="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
      <div class="relative top-20 mx-auto p-5 border w-11/12 md:w-3/4 lg:w-1/2 shadow-lg rounded-md bg-white">
        <div class="mt-3">
          <div class="flex justify-between items-center mb-4">
            <h3 class="text-lg font-medium text-gray-900">Envoyer Message</h3>
            <button @click="closeMessageModal" class="text-gray-400 hover:text-gray-600">
              <svg class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          
          <form @submit.prevent="submitMessage">
            <div class="space-y-4">
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">Destinataire</label>
                <p class="text-sm text-gray-600">{{ messageForm.recipient?.first_name }} {{ messageForm.recipient?.last_name }}</p>
              </div>
              
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">Sujet</label>
                <input
                  v-model="messageForm.subject"
                  type="text"
                  required
                  class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Sujet du message"
                />
              </div>
              
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">Message</label>
                <textarea
                  v-model="messageForm.content"
                  rows="6"
                  required
                  class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Contenu du message"
                ></textarea>
              </div>
              
              <div class="flex justify-end space-x-3">
                <button
                  type="button"
                  @click="closeMessageModal"
                  class="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  :disabled="sendingMessage"
                  class="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
                >
                  <span v-if="sendingMessage">Envoi...</span>
                  <span v-else>Envoyer</span>
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>

    <!-- Create User Modal -->
    <div v-if="showCreateUserModal" class="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
      <div class="relative top-10 mx-auto p-5 border w-11/12 md:w-3/4 lg:w-1/2 shadow-lg rounded-md bg-white">
        <div class="mt-3">
          <div class="flex justify-between items-center mb-4">
            <h3 class="text-lg font-medium text-gray-900">Créer un Nouvel Utilisateur</h3>
            <button @click="closeCreateUserModal" class="text-gray-400 hover:text-gray-600">
              <svg class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          
          <form @submit.prevent="createUser">
            <div class="space-y-4">
              <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-2">Prénom *</label>
                  <input
                    v-model="createUserForm.firstName"
                    type="text"
                    required
                    class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                    placeholder="Prénom"
                  />
                </div>
                
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-2">Nom *</label>
                  <input
                    v-model="createUserForm.lastName"
                    type="text"
                    required
                    class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                    placeholder="Nom"
                  />
                </div>
              </div>
              
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">Email *</label>
                <input
                  v-model="createUserForm.email"
                  type="email"
                  required
                  class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                  placeholder="email@exemple.com"
                />
              </div>
              
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">Téléphone</label>
                <input
                  v-model="createUserForm.phone"
                  type="tel"
                  class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                  placeholder="+33 1 23 45 67 89"
                />
              </div>
              
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">Entreprise</label>
                <input
                  v-model="createUserForm.companyName"
                  type="text"
                  class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                  placeholder="Nom de l'entreprise"
                />
              </div>
              

              <div class="flex items-center">
                <input
                  v-model="createUserForm.isActive"
                  type="checkbox"
                  class="rounded border-gray-300 text-green-600 focus:ring-green-500"
                />
                <label class="ml-2 text-sm text-gray-700">Compte actif</label>
              </div>
              
              <div class="flex items-center">
                <input
                  v-model="createUserForm.sendWelcomeEmail"
                  type="checkbox"
                  class="rounded border-gray-300 text-green-600 focus:ring-green-500"
                />
                <label class="ml-2 text-sm text-gray-700">Envoyer un email de bienvenue</label>
              </div>
              
              <div class="flex justify-end space-x-3 pt-4">
                <button
                  type="button"
                  @click="closeCreateUserModal"
                  class="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  :disabled="creatingUser"
                  class="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50"
                >
                  <span v-if="creatingUser">Création...</span>
                  <span v-else>Créer Utilisateur</span>
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
    
    <!-- Modal d'attribution d'agent -->
    <div v-if="showAssignAgentModal" class="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
      <div class="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
        <div class="mt-3">
          <div class="flex items-center justify-between mb-4">
            <h3 class="text-lg font-medium text-gray-900">Attribuer un agent</h3>
            <button @click="closeAssignAgentModal" class="text-gray-400 hover:text-gray-600">
              <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
              </svg>
            </button>
          </div>
          
          <div v-if="selectedClientForAssignment" class="mb-4">
            <p class="text-sm text-gray-600">Client: <strong>{{ selectedClientForAssignment.first_name }} {{ selectedClientForAssignment.last_name }}</strong></p>
            <p class="text-sm text-gray-600">Email: {{ selectedClientForAssignment.email }}</p>
          </div>
          
          <div class="space-y-3">
            <h4 class="text-sm font-medium text-gray-700">Sélectionner un agent:</h4>
            <div v-if="availableAgents.length === 0" class="text-sm text-gray-500">
              Aucun agent disponible
            </div>
            <div v-else class="space-y-2 max-h-60 overflow-y-auto">
              <div 
                v-for="agent in availableAgents" 
                :key="agent.id"
                class="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50 cursor-pointer"
                @click="assignAgent(agent.id)"
              >
                <div class="flex items-center space-x-3">
                  <div class="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white text-sm font-medium">
                    {{ getInitials(agent.first_name + ' ' + agent.last_name) }}
                  </div>
                  <div>
                    <p class="text-sm font-medium text-gray-900">{{ agent.first_name }} {{ agent.last_name }}</p>
                    <p class="text-xs text-gray-500">{{ agent.email }}</p>
                    <p class="text-xs text-gray-400">{{ agent.active_conversations || 0 }} conversation(s) active(s)</p>
                  </div>
                </div>
                <div class="text-green-600">
                  <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path>
                  </svg>
                </div>
              </div>
            </div>
          </div>
          
          <div class="flex justify-end space-x-3 pt-4 mt-4 border-t">
            <button
              type="button"
              @click="closeAssignAgentModal"
              class="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
            >
              Annuler
            </button>
          </div>
        </div>
      </div>
    </div>
      </main>
    </div>
  </div>
</template>

<script>
import AgentSidebar from '@/components/AgentSidebar.vue';
import Header from '@/components/Header.vue';
import api from '@/services/api';
import { useNotifications } from '@/composables/useNotifications';

export default {
  name: 'AgentClients',
  components: {
    AgentSidebar,
    Header
  },
  data() {
    return {
      loading: true,
      sidebarOpen: false,
      clients: [],
      selectedClients: [],
      searchQuery: '',
      statusFilter: '',
      companyFilter: '',
      agentFilter: '',
      showEmailModal: false,
      showMessageModal: false,
      showCreateUserModal: false,
      showAssignAgentModal: false,
      availableAgents: [],
      selectedClientForAssignment: null,
      assigningAgent: false,
      sendingEmail: false,
      sendingMessage: false,
      creatingUser: false,
      emailForm: {
        recipient: null,
        subject: '',
        content: ''
      },
      messageForm: {
        recipient: null,
        subject: '',
        content: ''
      },
      createUserForm: {
          firstName: '',
          lastName: '',
          email: '',
          phone: '',
          companyName: '',
          isActive: true,
          sendWelcomeEmail: true
        }
    }
  },
  computed: {
    $toast() {
      const { success, error, warning, info } = useNotifications();
      return {
        success,
        error,
        warning,
        info
      };
    },
    
    filteredClients() {
      let filtered = this.clients;
      
      if (this.searchQuery) {
        const query = this.searchQuery.toLowerCase();
        filtered = filtered.filter(client => 
          client.first_name.toLowerCase().includes(query) ||
          client.last_name.toLowerCase().includes(query) ||
          client.email.toLowerCase().includes(query) ||
          (client.company_name && client.company_name.toLowerCase().includes(query))
        );
      }
      
      if (this.statusFilter) {
        filtered = filtered.filter(client => 
          this.statusFilter === 'active' ? client.is_active : !client.is_active
        );
      }
      
      if (this.companyFilter) {
        filtered = filtered.filter(client => client.company_name === this.companyFilter);
      }
      
      if (this.agentFilter) {
        if (this.agentFilter === 'unassigned') {
          filtered = filtered.filter(client => !client.assigned_agent);
        } else {
          filtered = filtered.filter(client => 
            client.assigned_agent && client.assigned_agent.id == this.agentFilter
          );
        }
      }
      
      return filtered;
    },
    
    companies() {
      const companies = this.clients
        .map(client => client.company_name)
        .filter(company => company)
        .filter((company, index, arr) => arr.indexOf(company) === index);
      return companies.sort();
    }
  },
  async mounted() {
    await this.loadClients();
    await this.loadAvailableAgents();
  },
  methods: {
    async loadClients() {
      try {
        this.loading = true;
        const response = await api.get('/api/agent/clients');
        if (response.data.success) {
          this.clients = response.data.data;
        }
      } catch (error) {
        console.error('Erreur lors du chargement des clients:', error);
        this.$toast.error('Erreur lors du chargement des clients');
      } finally {
        this.loading = false;
      }
    },
    
    async refreshClients() {
      await this.loadClients();
      this.$toast.success('Liste des clients actualisée');
    },
    
    clearFilters() {
      this.searchQuery = '';
      this.statusFilter = '';
      this.companyFilter = '';
      this.agentFilter = '';
    },
    
    toggleSelectAll() {
      console.log('🔍 Debug toggleSelectAll - avant:', {
        selectedClients: this.selectedClients,
        filteredClients: this.filteredClients.length,
        filteredClientIds: this.filteredClients.map(c => c.id)
      });
      
      if (this.selectedClients.length === this.filteredClients.length) {
        this.selectedClients = [];
        console.log('📝 Désélection de tous les clients');
      } else {
        this.selectedClients = this.filteredClients.map(client => client.id);
        console.log('📝 Sélection de tous les clients:', this.selectedClients);
      }
      
      console.log('🔍 Debug toggleSelectAll - après:', this.selectedClients);
    },
    
    sendEmail(client = null) {
      this.emailForm = {
        recipient: client,
        subject: '',
        content: ''
      };
      this.showEmailModal = true;
    },
    
    sendMessage(client) {
      this.messageForm = {
        recipient: client,
        subject: '',
        content: ''
      };
      this.showMessageModal = true;
    },
    
    async submitEmail() {
      try {
        this.sendingEmail = true;
        
        if (this.emailForm.recipient) {
          // Email individuel
          const response = await api.post(`/api/agent/clients/${this.emailForm.recipient.id}/email`, {
            subject: this.emailForm.subject,
            content: this.emailForm.content
          });
          
          if (response.data.success) {
            this.$toast.success('Email envoyé avec succès');
          }
        } else {
          // Email groupé
          const promises = this.selectedClients.map(clientId => 
            api.post(`/api/agent/clients/${clientId}/email`, {
              subject: this.emailForm.subject,
              content: this.emailForm.content
            })
          );
          
          await Promise.all(promises);
          this.$toast.success(`Email envoyé à ${this.selectedClients.length} client(s)`);
        }
        
        this.closeEmailModal();
      } catch (error) {
        console.error('Erreur lors de l\'envoi de l\'email:', error);
        this.$toast.error('Erreur lors de l\'envoi de l\'email');
      } finally {
        this.sendingEmail = false;
      }
    },
    
    async submitMessage() {
      try {
        this.sendingMessage = true;
        
        const response = await api.post(`/api/agent/clients/${this.messageForm.recipient.id}/message`, {
          subject: this.messageForm.subject,
          content: this.messageForm.content
        });
        
        if (response.data.success) {
          this.$toast.success('Message envoyé avec succès');
          this.closeMessageModal();
        }
      } catch (error) {
        console.error('Erreur lors de l\'envoi du message:', error);
        this.$toast.error('Erreur lors de l\'envoi du message');
      } finally {
        this.sendingMessage = false;
      }
    },
    
    async toggleClientStatus(client) {
      try {
        const response = await api.put(`/api/agent/clients/${client.id}/status`, {
          is_active: !client.is_active
        });
        
        if (response.data.success) {
          client.is_active = !client.is_active;
          this.$toast.success(`Client ${client.is_active ? 'activé' : 'désactivé'} avec succès`);
        }
      } catch (error) {
        console.error('Erreur lors de la mise à jour du statut:', error);
        this.$toast.error('Erreur lors de la mise à jour du statut');
      }
    },
    
    async deleteClient(client) {
      if (!confirm(`Êtes-vous sûr de vouloir supprimer le client ${client.first_name} ${client.last_name} ?`)) {
        return;
      }
      
      try {
        const response = await api.delete(`/api/agent/clients/${client.id}`);
        
        if (response.data.success) {
          this.clients = this.clients.filter(c => c.id !== client.id);
          this.selectedClients = this.selectedClients.filter(id => id !== client.id);
          this.$toast.success('Client supprimé avec succès');
        }
      } catch (error) {
        console.error('Erreur lors de la suppression:', error);
        this.$toast.error('Erreur lors de la suppression du client');
      }
    },
    
    async viewNotifications(clientId) {
      try {
        const response = await api.get(`/api/agent/clients/${clientId}/notifications`);
        if (response.data.success) {
          // Afficher les notifications dans une modal ou rediriger
          console.log('Notifications:', response.data.data);
          this.$toast.info('Fonctionnalité de visualisation des notifications à implémenter');
        }
      } catch (error) {
        console.error('Erreur lors du chargement des notifications:', error);
        this.$toast.error('Erreur lors du chargement des notifications');
      }
    },
    
    async deleteSelectedClients() {
      console.log('🔍 Debug deleteSelectedClients - selectedClients:', this.selectedClients);
      
      if (this.selectedClients.length === 0) {
        this.$toast.warning('Aucun client sélectionné');
        return;
      }
      
      if (!confirm(`Êtes-vous sûr de vouloir supprimer ${this.selectedClients.length} client(s) sélectionné(s) ?`)) {
        return;
      }
      
      try {
        console.log('🚀 Début suppression multiple pour les IDs:', this.selectedClients);
        
        const promises = this.selectedClients.map(clientId => {
          console.log(`📤 Suppression du client ID: ${clientId}`);
          return api.delete(`/api/agent/clients/${clientId}`);
        });
        
        const results = await Promise.all(promises);
        console.log('✅ Toutes les suppressions terminées:', results.map(r => r.data));
        
        // Mettre à jour la liste locale
        const deletedIds = [...this.selectedClients];
        
        // Solution Vue 3: Mise à jour réactive immédiate + rechargement serveur
        
        // 1. Mise à jour immédiate pour l'UX (Vue 3 compatible)
        this.clients = this.clients.filter(c => !deletedIds.includes(c.id));
        this.selectedClients = [];
        
        // 2. Forcer la mise à jour du DOM
        await this.$nextTick();
        
        // 3. Rechargement serveur en arrière-plan pour garantir la synchronisation
        setTimeout(async () => {
          await this.loadClients();
          this.selectedClients = [];
        }, 500);
        
        console.log('🔄 Liste mise à jour, clients restants:', this.clients.length);
        console.log('🔄 Clients actuels:', this.clients.map(c => c.id));
        console.log('🔄 Filtered clients:', this.filteredClients.map(c => c.id));
        this.$toast.success(`${deletedIds.length} client(s) supprimé(s) avec succès`);
        
        // Debug: Vérifier la réactivité après un délai
        setTimeout(() => {
          console.log('🔄 Vérification après 1s - clients:', this.clients.length);
          console.log('🔄 Vérification après 1s - filteredClients:', this.filteredClients.length);
        }, 1000);
        
      } catch (error) {
        console.error('❌ Erreur lors de la suppression multiple:', error);
        if (error.response) {
          console.error('   Status:', error.response.status);
          console.error('   Data:', error.response.data);
        }
        this.$toast.error('Erreur lors de la suppression des clients: ' + (error.response?.data?.message || error.message));
      }
    },
    
    async createUser() {
      try {
        this.creatingUser = true;
        
        // Validation des champs requis
        if (!this.createUserForm.firstName || !this.createUserForm.lastName || !this.createUserForm.email) {
          this.$toast.error('Veuillez remplir tous les champs obligatoires');
          return;
        }
        
        // Préparer les données utilisateur
        const userData = {
          firstName: this.createUserForm.firstName,
          lastName: this.createUserForm.lastName,
          email: this.createUserForm.email,
          phone: this.createUserForm.phone || null,
          companyName: this.createUserForm.companyName || null,
          isActive: this.createUserForm.isActive
        };
        
        console.log('🚀 Création utilisateur avec les données:', userData);
        
        // Créer l'utilisateur
        const response = await api.post('/api/agent/clients/create', userData);
        
        if (response.data.success) {
          const newUser = response.data.data;
          console.log('✅ Utilisateur créé avec succès:', newUser);
          
          // Créer un objet utilisateur complet pour l'affichage local
          const userForDisplay = {
            id: newUser.userId,
            email: newUser.email,
            first_name: userData.firstName,
            last_name: userData.lastName,
            phone: userData.phone,
            company_name: userData.companyName,
            is_active: userData.isActive,
            first_login_token: newUser.firstLoginToken,
            created_at: new Date().toISOString()
          };
          
          // Ajouter le nouvel utilisateur à la liste locale
          this.clients.unshift(userForDisplay);
          
          // Envoyer l'email de bienvenue si demandé
          if (this.createUserForm.sendWelcomeEmail) {
            await this.sendWelcomeEmail(userForDisplay);
          }
          
          this.$toast.success(`Utilisateur ${userData.firstName} ${userData.lastName} créé avec succès`);
          this.closeCreateUserModal();
          
          // Recharger la liste pour s'assurer de la synchronisation
          await this.loadClients();
        }
      } catch (error) {
        console.error('❌ Erreur lors de la création de l\'utilisateur:', error);
        if (error.response) {
          console.error('   Status:', error.response.status);
          console.error('   Data:', error.response.data);
          
          if (error.response.status === 409) {
            this.$toast.error('Un utilisateur avec cet email existe déjà');
          } else {
            this.$toast.error('Erreur lors de la création: ' + (error.response.data?.message || 'Erreur inconnue'));
          }
        } else {
          this.$toast.error('Erreur lors de la création de l\'utilisateur');
        }
      } finally {
        this.creatingUser = false;
      }
    },
    
    async sendWelcomeEmail(user) {
      try {
        console.log('📧 Envoi de l\'email de bienvenue à:', user.email);
        
        // Récupérer les informations de l'agent connecté
        const agentInfo = JSON.parse(localStorage.getItem('user') || '{}');
        const agentName = `${agentInfo.first_name || 'Agent'} ${agentInfo.last_name || 'Fusepoint'}`;
        
        const emailData = {
          to: user.email,
          subject: 'Bienvenue sur Fusepoint - Votre compte a été créé',
          clientName: `${user.first_name} ${user.last_name}`,
          agentName: agentName,
          firstLoginToken: user.first_login_token || 'temp-token',
          companyName: user.company_name || null
        };
        
        console.log('📧 Données email de bienvenue:', emailData);
        
        const response = await api.post('/api/agent/send-welcome-email', emailData);
        
        if (response.data.success) {
          console.log('✅ Email de bienvenue envoyé avec succès');
          this.$toast.success('Email de bienvenue envoyé avec succès');
        }
      } catch (error) {
        console.error('❌ Erreur lors de l\'envoi de l\'email de bienvenue:', error);
        if (error.response && error.response.data) {
          console.error('   Détails:', error.response.data);
        }
        this.$toast.warning('Utilisateur créé mais erreur lors de l\'envoi de l\'email de bienvenue');
      }
    },
    
    async loadAvailableAgents() {
      try {
        const response = await api.get('/api/agent/available');
        if (response.data.success) {
          this.availableAgents = response.data.data;
        }
      } catch (error) {
        console.error('Erreur lors du chargement des agents:', error);
        this.$toast.error('Erreur lors du chargement des agents disponibles');
      }
    },
    
    openAssignAgentModal(client) {
      this.selectedClientForAssignment = client;
      this.showAssignAgentModal = true;
    },
    
    closeAssignAgentModal() {
      this.showAssignAgentModal = false;
      this.selectedClientForAssignment = null;
    },
    
    async assignAgent(agentId) {
      try {
        this.assigningAgent = true;
        
        const response = await api.post('/api/agent/assign', {
          clientId: this.selectedClientForAssignment.id,
          agentId: agentId
        });
        
        if (response.data.success) {
          // Mettre à jour le client localement
          const clientIndex = this.clients.findIndex(c => c.id === this.selectedClientForAssignment.id);
          if (clientIndex !== -1) {
            const assignedAgent = this.availableAgents.find(a => a.id == agentId);
            this.clients[clientIndex].assigned_agent = assignedAgent;
          }
          
          this.$toast.success(response.data.message);
          this.closeAssignAgentModal();
        }
      } catch (error) {
        console.error('Erreur lors de l\'attribution d\'agent:', error);
        this.$toast.error('Erreur lors de l\'attribution de l\'agent');
      } finally {
        this.assigningAgent = false;
      }
    },
    

    
    closeCreateUserModal() {
      this.showCreateUserModal = false;
      this.createUserForm = {
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        companyName: '',
        isActive: true,
        sendWelcomeEmail: true
      };
    },
    
    closeEmailModal() {
      this.showEmailModal = false;
      this.emailForm = { recipient: null, subject: '', content: '' };
    },
    
    closeMessageModal() {
      this.showMessageModal = false;
      this.messageForm = { recipient: null, subject: '', content: '' };
    },
    
    getInitials(firstName, lastName) {
      const first = firstName && firstName.length > 0 ? firstName[0] : '?';
      const last = lastName && lastName.length > 0 ? lastName[0] : '?';
      return `${first}${last}`.toUpperCase();
    },
    
    formatDate(dateString) {
      if (!dateString) return 'Jamais';
      const date = new Date(dateString);
      return date.toLocaleDateString('fr-FR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
      });
    }
  }
};
</script>