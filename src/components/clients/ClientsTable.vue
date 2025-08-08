<template>
  <div class="bg-white shadow rounded-lg overflow-hidden">
    <!-- État de chargement -->
    <div v-if="loading" class="p-8 text-center">
      <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
      <p class="mt-4 text-gray-600">{{ messages.loading }}</p>
    </div>
    
    <!-- État d'erreur -->
    <div v-else-if="error" class="p-8 text-center">
      <div class="text-red-500 mb-4">
        <ExclamationTriangleIcon class="h-12 w-12 mx-auto" />
      </div>
      <p class="text-gray-600">{{ error }}</p>
      <button
        @click="$emit('retry')"
        class="mt-4 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
      >
        {{ messages.retry }}
      </button>
    </div>
    
    <!-- Aucun client -->
    <div v-else-if="clients.length === 0" class="p-8 text-center">
      <div class="text-gray-400 mb-4">
        <UsersIcon class="h-12 w-12 mx-auto" />
      </div>
      <p class="text-gray-600">{{ messages.noClients }}</p>
      <p class="text-sm text-gray-500 mt-1">{{ messages.noClientsSubtext }}</p>
    </div>
    
    <!-- Tableau des clients -->
    <div v-else>
      <!-- En-tête du tableau -->
      <div class="bg-gray-50 px-6 py-3 border-b border-gray-200">
        <div class="grid grid-cols-12 gap-4 items-center">
          <!-- Sélection et nom -->
          <div class="col-span-4 flex items-center">
            <input
              type="checkbox"
              :checked="selectedClients.length === clients.length && clients.length > 0"
              @change="$emit('toggleAll')"
              class="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            <span class="ml-3 text-sm font-medium text-gray-700">
              {{ selectedClients.length > 0 ? `${selectedClients.length} ${messages.selected}` : 'Client' }}
            </span>
          </div>
          
          <!-- En-têtes de colonnes pour desktop -->
           <div class="hidden lg:contents">
             <div class="col-span-1 text-xs font-medium text-gray-500 uppercase tracking-wider text-center">Entreprise</div>
             <div class="col-span-1 text-xs font-medium text-gray-500 uppercase tracking-wider text-center">Téléphone</div>
             <div class="col-span-2 text-xs font-medium text-gray-500 uppercase tracking-wider text-center">Agent attribué</div>
             <div class="col-span-1 text-xs font-medium text-gray-500 uppercase tracking-wider text-center">Statut</div>
             <div class="col-span-1 text-xs font-medium text-gray-500 uppercase tracking-wider text-center">Créé le</div>
             <div class="col-span-2 text-xs font-medium text-gray-500 uppercase tracking-wider text-center">Actions</div>
           </div>
        </div>
      </div>
      
      <!-- Corps du tableau -->
      <div class="divide-y divide-gray-200">
        <div
          v-for="client in clients"
          :key="client.id"
          class="px-6 py-4 hover:bg-gray-50 transition-colors duration-150"
        >
          <!-- Layout mobile -->
          <div class="lg:hidden">
            <div class="flex items-center justify-between">
              <!-- Section gauche: checkbox + avatar + nom -->
              <div class="flex items-center min-w-0 flex-1">
                <input
                  type="checkbox"
                  :checked="selectedClients.includes(client.id)"
                  @change="$emit('selectClient', client.id)"
                  class="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded flex-shrink-0"
                />
                
                <div class="ml-3 flex items-center min-w-0 flex-1">
                  <!-- Avatar -->
                  <div class="flex-shrink-0 h-8 w-8">
                    <div class="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center">
                      <span class="text-xs font-medium text-blue-600">
                        {{ getInitials(client.first_name, client.last_name) }}
                      </span>
                    </div>
                  </div>
                  
                  <!-- Informations principales -->
                  <div class="ml-2 min-w-0 flex-1">
                    <div class="text-sm font-medium text-gray-900 truncate cursor-pointer hover:text-blue-600 transition-colors duration-150" @click="$emit('showClientInfo', client)">
                      {{ client.first_name }} {{ client.last_name }}
                    </div>
                    <div class="text-xs text-gray-500 truncate">
                      {{ client.email }}
                    </div>
                  </div>
                </div>
              </div>
              
              <!-- Section droite: statut + actions -->
              <div class="flex items-center space-x-2 flex-shrink-0">
                <!-- Statut mobile -->
                <div class="flex-shrink-0">
                  <ClientStatusBadge :client="client" :messages="messages" />
                </div>
                
                <!-- Actions mobiles optimisées -->
                <div class="flex items-center space-x-2">
                  <!-- Actions principales -->
                  <div class="main-actions-mobile flex items-center space-x-1 bg-white rounded-lg shadow-md border border-gray-200 p-1.5">
                    <button
                      @click="$emit('showClientInfo', client)"
                      class="p-2.5 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-md transition-all duration-200 transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1 active:scale-95"
                      :title="messages.viewDetails"
                    >
                      <svg class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </button>
                    
                    <button
                      @click="$emit('editClient', client)"
                      class="p-2.5 text-amber-600 hover:text-amber-800 hover:bg-amber-50 rounded-md transition-all duration-200 transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:ring-offset-1 active:scale-95"
                      :title="messages.edit"
                    >
                      <svg class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                    </button>
                    
                    <!-- Menu déroulant pour actions secondaires -->
                    <div class="relative">
                      <button
                        @click.stop="toggleMobileMenu(client.id)"
                        class="p-2.5 text-gray-600 hover:text-gray-800 hover:bg-gray-50 rounded-md transition-all duration-200 transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-1 active:scale-95"
                        :title="'Plus d\'actions'"
                      >
                        <svg class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
                        </svg>
                      </button>
                      
                      <!-- Menu déroulant -->
                      <div v-if="showMobileMenu === client.id" @click.stop class="absolute right-0 top-full mt-1 w-48 bg-white rounded-lg shadow-lg border border-gray-200 z-50">
                        <div class="py-1">
                          <button
                            @click="$emit('assignAgent', client); hideMobileMenu()"
                            class="w-full text-left px-4 py-3 text-sm text-indigo-700 hover:bg-indigo-50 flex items-center"
                          >
                            <svg class="h-4 w-4 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                            </svg>
                            Attribuer agent
                          </button>
                          <button
                            @click="$emit('sendEmail', client); hideMobileMenu()"
                            class="w-full text-left px-4 py-3 text-sm text-green-700 hover:bg-green-50 flex items-center"
                          >
                            <svg class="h-4 w-4 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                            </svg>
                            Envoyer email
                          </button>
                          <button
                            @click="$emit('toggleStatus', client); hideMobileMenu()"
                            :class="[
                              'w-full text-left px-4 py-3 text-sm flex items-center',
                              (client.is_active === 1 || client.is_active === true)
                                ? 'text-red-700 hover:bg-red-50' 
                                : 'text-green-700 hover:bg-green-50'
                            ]"
                          >
                            <svg v-if="client.is_active === 1 || client.is_active === true" class="h-4 w-4 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728L5.636 5.636m12.728 12.728L18.364 5.636M5.636 18.364l12.728-12.728" />
                            </svg>
                            <svg v-else class="h-4 w-4 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            {{ (client.is_active === 1 || client.is_active === true) ? 'Désactiver' : 'Activer' }}
                          </button>
                          <div class="border-t border-gray-100 my-1"></div>
                          <button
                            @click="$emit('deleteClient', client); hideMobileMenu()"
                            class="w-full text-left px-4 py-3 text-sm text-red-700 hover:bg-red-50 flex items-center"
                          >
                            <svg class="h-4 w-4 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                            Supprimer
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            <!-- Ligne secondaire mobile avec informations supplémentaires -->
            <div class="mt-2 flex items-center justify-between text-xs text-gray-500">
              <div class="flex items-center space-x-4">
                <div class="truncate">
                  <span class="font-medium">Entreprise:</span> {{ client.company || messages.noCompany }}
                </div>
                <div class="truncate">
                  <span class="font-medium">Tél:</span> {{ client.phone || messages.noPhone }}
                </div>
              </div>
              <div class="text-xs text-gray-400">
                {{ formatDate(client.created_at) }}
              </div>
            </div>
            
            <!-- Agent attribué (mobile) -->
            <div class="mt-1">
              <div v-if="client.assigned_agent" class="inline-flex items-center text-xs text-green-600">
                <svg class="h-3 w-3 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
                Agent: {{ client.assigned_agent.first_name }} {{ client.assigned_agent.last_name }}
              </div>
              <div v-else class="inline-flex items-center text-xs text-gray-400">
                <svg class="h-3 w-3 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
                Aucun agent attribué
              </div>
            </div>
          </div>
          
          <!-- Layout desktop -->
          <div class="hidden lg:grid lg:grid-cols-12 lg:gap-4 lg:items-center">
            <!-- Client info (checkbox + avatar + nom) -->
            <div class="col-span-4 flex items-center">
              <input
                type="checkbox"
                :checked="selectedClients.includes(client.id)"
                @change="$emit('selectClient', client.id)"
                class="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded flex-shrink-0"
              />
              
              <div class="ml-4 flex items-center min-w-0">
                <!-- Avatar -->
                <div class="flex-shrink-0 h-10 w-10">
                  <div class="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                    <span class="text-sm font-medium text-blue-600">
                      {{ getInitials(client.first_name, client.last_name) }}
                    </span>
                  </div>
                </div>
                
                <!-- Informations principales -->
                <div class="ml-3 min-w-0">
                  <div class="text-sm font-medium text-gray-900 truncate cursor-pointer hover:text-blue-600 transition-colors duration-150" @click="$emit('showClientInfo', client)">
                    {{ client.first_name }} {{ client.last_name }}
                  </div>
                  <div class="text-sm text-gray-500 truncate">
                    {{ client.email }}
                  </div>
                </div>
              </div>
            </div>
            
            <!-- Colonnes pour desktop -->
            <div class="contents">
              <!-- Entreprise -->
              <div class="col-span-1 text-center">
                <div class="text-sm text-gray-900">
                  {{ client.company || messages.noCompany }}
                </div>
              </div>
              
              <!-- Téléphone -->
              <div class="col-span-1 text-center">
                <div class="text-sm text-gray-900">
                  {{ client.phone || messages.noPhone }}
                </div>
              </div>
              
              <!-- Agent attribué -->
              <div class="col-span-2 text-center">
                <div v-if="client.assigned_agent" class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                  <div class="flex items-center">
                    <div class="h-5 w-5 rounded-full bg-green-200 flex items-center justify-center mr-1.5">
                      <span class="text-xs font-semibold text-green-700">
                        {{ getInitials(client.assigned_agent.first_name, client.assigned_agent.last_name) }}
                      </span>
                    </div>
                    <span class="truncate max-w-[80px]">
                      {{ client.assigned_agent.first_name }} {{ client.assigned_agent.last_name }}
                    </span>
                  </div>
                </div>
                <div v-else class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-600">
                  <svg class="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                  Non attribué
                </div>
              </div>
              
              <!-- Statut -->
              <div class="col-span-1 text-center">
                <ClientStatusBadge :client="client" :messages="messages" />
              </div>
              
              <!-- Date de création -->
              <div class="col-span-1 text-center text-sm text-gray-500">
                {{ formatDate(client.created_at) }}
              </div>
              
              <!-- Actions -->
              <div class="col-span-2 text-center">
                <div class="flex items-center justify-center">
                  <!-- Groupe d'actions principales -->
                  <div class="main-actions flex items-center space-x-0.5 bg-white rounded-md shadow-sm border border-gray-200 p-0.5">
                    <!-- Attribuer un agent -->
                    <button
                      @click="$emit('assignAgent', client)"
                      class="p-1 text-indigo-600 hover:text-indigo-800 hover:bg-indigo-50 rounded transition-all duration-200 transform hover:scale-105 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                      :title="messages.assignAgent"
                    >
                      <svg class="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                      </svg>
                    </button>
                    
                    <!-- Envoyer un email -->
                    <button
                      @click="$emit('sendEmail', client)"
                      class="p-1 text-green-600 hover:text-green-800 hover:bg-green-50 rounded transition-all duration-200 transform hover:scale-105 focus:outline-none focus:ring-1 focus:ring-green-500"
                      :title="messages.sendEmail"
                    >
                      <svg class="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                      </svg>
                    </button>
                    
                    <!-- Envoyer un message -->
                    <button
                      @click="$emit('sendMessage', client)"
                      class="p-1 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded transition-all duration-200 transform hover:scale-105 focus:outline-none focus:ring-1 focus:ring-blue-500"
                      title="Envoyer message"
                    >
                      <svg class="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-3.582 8-8 8a8.955 8.955 0 01-4.126-.98L3 21l1.98-5.874A8.955 8.955 0 013 12c0-4.418 3.582-8 8-8s8 3.582 8 8z" />
                      </svg>
                    </button>
                  </div>
                  
                  <!-- Séparateur -->
                  <div class="mx-2 h-6 w-px bg-gray-300"></div>
                  
                  <!-- Groupe d'actions secondaires -->
                  <div class="secondary-actions flex items-center space-x-0.5 bg-white rounded-md shadow-sm border border-gray-200 p-0.5">
                    <!-- Voir les détails -->
                    <button
                      @click="$emit('showClientInfo', client)"
                      class="p-1 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded transition-all duration-200 transform hover:scale-105 focus:outline-none focus:ring-1 focus:ring-blue-500"
                      :title="messages.viewDetails || 'Voir les détails'"
                    >
                      <svg class="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </button>
                    
                    <!-- Modifier -->
                    <button
                      @click="$emit('editClient', client)"
                      class="p-1 text-amber-600 hover:text-amber-800 hover:bg-amber-50 rounded transition-all duration-200 transform hover:scale-105 focus:outline-none focus:ring-1 focus:ring-amber-500"
                      :title="messages.edit || 'Modifier'"
                    >
                      <svg class="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                    </button>
                    
                    <!-- Activer/Désactiver -->
                    <button
                      @click="$emit('toggleStatus', client)"
                      :class="[
                        'p-1 rounded transition-all duration-200 transform hover:scale-105 focus:outline-none focus:ring-1',
                        (client.is_active === 1 || client.is_active === true)
                          ? 'text-red-600 hover:text-red-800 hover:bg-red-50 focus:ring-red-500' 
                          : 'text-green-600 hover:text-green-800 hover:bg-green-50 focus:ring-green-500'
                      ]"
                      :title="(client.is_active === 1 || client.is_active === true) ? messages.deactivate : messages.activate"
                    >
                      <svg v-if="client.is_active === 1 || client.is_active === true" class="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728L5.636 5.636m12.728 12.728L18.364 5.636M5.636 18.364l12.728-12.728" />
                      </svg>
                      <svg v-else class="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </button>
                    
                    <!-- Supprimer -->
                    <button
                      @click="$emit('deleteClient', client)"
                      class="p-1 text-red-600 hover:text-red-800 hover:bg-red-50 rounded transition-all duration-200 transform hover:scale-105 focus:outline-none focus:ring-1 focus:ring-red-500"
                      :title="messages.deleteButton"
                    >
                      <svg class="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
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
    </div>
  </div>
</template>

<script>
import { ExclamationTriangleIcon } from '@heroicons/vue/24/outline'
import ClientStatusBadge from './ClientStatusBadge.vue'
import ClientStatusMenu from './ClientStatusMenu.vue'

export default {
  name: 'ClientsTable',
  components: {
    ExclamationTriangleIcon,
    ClientStatusBadge,
    ClientStatusMenu
  },
  props: {
    clients: {
      type: Array,
      default: () => []
    },
    selectedClients: {
      type: Array,
      default: () => []
    },
    loading: {
      type: Boolean,
      default: false
    },
    error: {
      type: String,
      default: null
    },
    messages: {
      type: Object,
      required: true
    }
  },
  emits: ['toggleAll', 'selectClient', 'editClient', 'deleteClient', 'retry', 'assignAgent', 'sendEmail', 'sendNotification', 'sendMessage', 'toggleStatus', 'statusChange', 'showClientInfo'],
  data() {
    return {
      sortBy: 'created_at',
      sortOrder: 'desc',
      showDropdown: null,
      showMobileMenu: null
    }
  },
  methods: {
    getInitials(firstName, lastName) {
      const first = firstName && firstName.length > 0 ? firstName[0] : '?'
      const last = lastName && lastName.length > 0 ? lastName[0] : '?'
      return `${first}${last}`.toUpperCase()
    },
    
    formatDate(dateString) {
      if (!dateString) return this.messages.never
      const date = new Date(dateString)
      return date.toLocaleDateString('fr-FR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
      })
    },
    
    handleStatusChange(client, newStatus) {
      this.$emit('statusChange', client, newStatus)
    },
     
     toggleMobileMenu(clientId) {
       this.showMobileMenu = this.showMobileMenu === clientId ? null : clientId
     },
     
     hideMobileMenu() {
        this.showMobileMenu = null
      },
      
      handleClickOutside(event) {
        // Fermer le menu si on clique en dehors du conteneur du menu
        if (!event.target.closest('.relative') && this.showMobileMenu !== null) {
          this.showMobileMenu = null
        }
      }
    },
    
    mounted() {
      document.addEventListener('click', this.handleClickOutside)
    },
    
    beforeUnmount() {
      document.removeEventListener('click', this.handleClickOutside)
    }
  }
</script>

<style scoped>
/* Styles pour les groupes d'actions */
.main-actions, .secondary-actions {
  @apply shadow-sm;
  background: linear-gradient(135deg, #ffffff 0%, #f8fafc 100%);
  border: 1px solid rgba(148, 163, 184, 0.15);
}

.main-actions:hover, .secondary-actions:hover {
  @apply shadow-md;
}

/* Transitions optimisées pour mobile */
.main-actions button, .secondary-actions button {
  transition: all 0.2s ease;
}

/* Design responsive optimisé */
@media (max-width: 1024px) {
  .main-actions, .secondary-actions {
    @apply px-0.5 py-0.5 space-x-0.5;
  }
  
  .main-actions button, .secondary-actions button {
    @apply p-0.5;
  }
  
  .main-actions button svg, .secondary-actions button svg {
    @apply h-3 w-3;
  }
}

@media (max-width: 640px) {
  .main-actions, .secondary-actions {
    @apply px-0.5 py-0.5 space-x-0.5;
  }
  
  .main-actions button, .secondary-actions button {
    @apply p-0.5;
  }
  
  .main-actions button svg, .secondary-actions button svg {
    @apply h-2.5 w-2.5;
  }
}

/* Animations et transitions personnalisées */
.transition-colors {
  transition-property: color, background-color, border-color;
  transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
}

/* Effets d'ombre et de profondeur pour les groupes d'actions */
.inline-flex.bg-gray-50 {
  box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06);
  backdrop-filter: blur(10px);
  background-color: rgba(249, 250, 251, 0.8);
  border: 1px solid rgba(229, 231, 235, 0.5);
}

/* Effet de survol pour les groupes d'actions */
.inline-flex.bg-gray-50:hover {
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
  background-color: rgba(249, 250, 251, 0.95);
  transform: translateY(-1px);
  transition: all 0.2s ease-in-out;
}

/* Animation de pulsation pour les boutons actifs */
@keyframes pulse-subtle {
  0%, 100% {
    opacity: 1;
  }
  50% {
    opacity: 0.8;
  }
}

/* Effet de focus amélioré */
.group:focus-visible {
  outline: 2px solid #3B82F6;
  outline-offset: 2px;
  border-radius: 0.375rem;
}

/* Amélioration des transitions pour les boutons */
.group {
  position: relative;
  overflow: hidden;
}

.group::before {
  content: '';
  position: absolute;
  top: 50%;
  left: 50%;
  width: 0;
  height: 0;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 50%;
  transform: translate(-50%, -50%);
  transition: width 0.3s ease, height 0.3s ease;
}

.group:hover::before {
  width: 100%;
  height: 100%;
}

/* Animation d'apparition pour les tooltips */
[title]:hover::after {
  animation: fadeIn 0.2s ease-in-out;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(5px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>