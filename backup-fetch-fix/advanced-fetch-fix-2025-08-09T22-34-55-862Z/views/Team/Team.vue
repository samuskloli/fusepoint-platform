<template>
  <Layout>
    <div>
          <!-- Page Header -->
          <div class="mb-8">
            <div class="flex items-center justify-between">
              <div>
                <h1 class="text-3xl font-bold text-gray-900">Équipe</h1>
                <p class="mt-2 text-gray-600">Gérez les membres de votre équipe et leurs permissions</p>
              </div>
              <button @click="showInviteModal = true" class="bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 transition-colors flex items-center space-x-2">
                <svg class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
                <span>Inviter un membre</span>
              </button>
            </div>
          </div>

          <!-- Team Stats -->
          <div class="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <div class="bg-white rounded-lg shadow p-6">
              <div class="flex items-center">
                <div class="p-2 bg-blue-100 rounded-lg">
                  <svg class="h-6 w-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                </div>
                <div class="ml-4">
                  <p class="text-sm font-medium text-gray-600">Membres totaux</p>
                  <p class="text-2xl font-bold text-gray-900">12</p>
                </div>
              </div>
            </div>

            <div class="bg-white rounded-lg shadow p-6">
              <div class="flex items-center">
                <div class="p-2 bg-green-100 rounded-lg">
                  <svg class="h-6 w-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div class="ml-4">
                  <p class="text-sm font-medium text-gray-600">Actifs</p>
                  <p class="text-2xl font-bold text-gray-900">10</p>
                </div>
              </div>
            </div>

            <div class="bg-white rounded-lg shadow p-6">
              <div class="flex items-center">
                <div class="p-2 bg-yellow-100 rounded-lg">
                  <svg class="h-6 w-6 text-yellow-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div class="ml-4">
                  <p class="text-sm font-medium text-gray-600">Invitations en attente</p>
                  <p class="text-2xl font-bold text-gray-900">2</p>
                </div>
              </div>
            </div>

            <div class="bg-white rounded-lg shadow p-6">
              <div class="flex items-center">
                <div class="p-2 bg-purple-100 rounded-lg">
                  <svg class="h-6 w-6 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                  </svg>
                </div>
                <div class="ml-4">
                  <p class="text-sm font-medium text-gray-600">Administrateurs</p>
                  <p class="text-2xl font-bold text-gray-900">3</p>
                </div>
              </div>
            </div>
          </div>

          <!-- Search and Filter -->
          <div class="bg-white rounded-lg shadow p-6 mb-8">
            <div class="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
              <div class="flex flex-col md:flex-row md:items-center space-y-4 md:space-y-0 md:space-x-4">
                <div class="relative">
                  <input type="text" placeholder="Rechercher un membre..." class="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent w-full md:w-64">
                  <svg class="absolute left-3 top-2.5 h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
                <select class="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent">
                  <option>Tous les rôles</option>
                  <option>Administrateur</option>
                  <option>Éditeur</option>
                  <option>Analyste</option>
                  <option>Lecteur</option>
                </select>
                <select class="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent">
                  <option>Tous les statuts</option>
                  <option>Actif</option>
                  <option>Inactif</option>
                  <option>Invitation en attente</option>
                </select>
              </div>
            </div>
          </div>

          <!-- Team Members List -->
          <div class="bg-white rounded-lg shadow overflow-hidden">
            <div class="px-6 py-4 border-b border-gray-200">
              <h3 class="text-lg font-medium text-gray-900">Membres de l'équipe</h3>
            </div>
            <div class="divide-y divide-gray-200">
              <!-- Member 1 - Admin -->
              <div class="p-6 hover:bg-gray-50">
                <div class="flex items-center justify-between">
                  <div class="flex items-center space-x-4">
                    <div class="relative">
                      <img class="h-12 w-12 rounded-full" src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80" alt="">
                      <span class="absolute bottom-0 right-0 block h-3 w-3 rounded-full bg-green-400 ring-2 ring-white"></span>
                    </div>
                    <div>
                      <h4 class="text-sm font-medium text-gray-900">Samuel Oliveira</h4>
                      <p class="text-sm text-gray-600">samuel@fusepoint.com</p>
                      <div class="flex items-center space-x-2 mt-1">
                        <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                          Administrateur
                        </span>
                        <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                          Actif
                        </span>
                      </div>
                    </div>
                  </div>
                  <div class="flex items-center space-x-2">
                    <span class="text-sm text-gray-500">Propriétaire</span>
                    <div class="relative">
                      <button class="text-gray-400 hover:text-gray-600">
                        <svg class="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                          <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z" />
                        </svg>
                      </button>
                    </div>
                  </div>
                </div>
                <div class="mt-4 text-sm text-gray-600">
                  <p>Dernière connexion: il y a 5 minutes</p>
                  <p>Membre depuis: 15 janvier 2024</p>
                </div>
              </div>

              <!-- Member 2 - Editor -->
              <div class="p-6 hover:bg-gray-50">
                <div class="flex items-center justify-between">
                  <div class="flex items-center space-x-4">
                    <div class="relative">
                      <img class="h-12 w-12 rounded-full" src="https://images.unsplash.com/photo-1494790108755-2616b612b786?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80" alt="">
                      <span class="absolute bottom-0 right-0 block h-3 w-3 rounded-full bg-green-400 ring-2 ring-white"></span>
                    </div>
                    <div>
                      <h4 class="text-sm font-medium text-gray-900">Marie Dubois</h4>
                      <p class="text-sm text-gray-600">marie@fusepoint.com</p>
                      <div class="flex items-center space-x-2 mt-1">
                        <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                          Éditeur
                        </span>
                        <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                          Actif
                        </span>
                      </div>
                    </div>
                  </div>
                  <div class="flex items-center space-x-2">
                    <button class="text-primary-600 hover:text-primary-700 text-sm font-medium">Modifier</button>
                    <div class="relative">
                      <button class="text-gray-400 hover:text-gray-600">
                        <svg class="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                          <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z" />
                        </svg>
                      </button>
                    </div>
                  </div>
                </div>
                <div class="mt-4 text-sm text-gray-600">
                  <p>Dernière connexion: il y a 2 heures</p>
                  <p>Membre depuis: 20 janvier 2024</p>
                </div>
              </div>

              <!-- Member 3 - Analyst -->
              <div class="p-6 hover:bg-gray-50">
                <div class="flex items-center justify-between">
                  <div class="flex items-center space-x-4">
                    <div class="relative">
                      <img class="h-12 w-12 rounded-full" src="https://images.unsplash.com/photo-1519244703995-f4e0f30006d5?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80" alt="">
                      <span class="absolute bottom-0 right-0 block h-3 w-3 rounded-full bg-green-400 ring-2 ring-white"></span>
                    </div>
                    <div>
                      <h4 class="text-sm font-medium text-gray-900">Pierre Martin</h4>
                      <p class="text-sm text-gray-600">pierre@fusepoint.com</p>
                      <div class="flex items-center space-x-2 mt-1">
                        <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                          Analyste
                        </span>
                        <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                          Actif
                        </span>
                      </div>
                    </div>
                  </div>
                  <div class="flex items-center space-x-2">
                    <button class="text-primary-600 hover:text-primary-700 text-sm font-medium">Modifier</button>
                    <div class="relative">
                      <button class="text-gray-400 hover:text-gray-600">
                        <svg class="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                          <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z" />
                        </svg>
                      </button>
                    </div>
                  </div>
                </div>
                <div class="mt-4 text-sm text-gray-600">
                  <p>Dernière connexion: il y a 1 jour</p>
                  <p>Membre depuis: 25 janvier 2024</p>
                </div>
              </div>

              <!-- Member 4 - Pending Invitation -->
              <div class="p-6 hover:bg-gray-50">
                <div class="flex items-center justify-between">
                  <div class="flex items-center space-x-4">
                    <div class="relative">
                      <div class="h-12 w-12 rounded-full bg-gray-200 flex items-center justify-center">
                        <svg class="h-6 w-6 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                      </div>
                    </div>
                    <div>
                      <h4 class="text-sm font-medium text-gray-900">julie@example.com</h4>
                      <p class="text-sm text-gray-600">Invitation envoyée</p>
                      <div class="flex items-center space-x-2 mt-1">
                        <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                          Lecteur
                        </span>
                        <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                          En attente
                        </span>
                      </div>
                    </div>
                  </div>
                  <div class="flex items-center space-x-2">
                    <button class="text-primary-600 hover:text-primary-700 text-sm font-medium">Renvoyer</button>
                    <button class="text-red-600 hover:text-red-700 text-sm font-medium">Annuler</button>
                  </div>
                </div>
                <div class="mt-4 text-sm text-gray-600">
                  <p>Invitation envoyée: il y a 3 jours</p>
                </div>
              </div>
            </div>
          </div>
    </div>

    <!-- Invite Member Modal -->
    <div v-if="showInviteModal" class="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
      <div class="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
        <div class="mt-3">
          <div class="flex items-center justify-between mb-4">
            <h3 class="text-lg font-medium text-gray-900">Inviter un membre</h3>
            <button @click="showInviteModal = false" class="text-gray-400 hover:text-gray-600">
              <svg class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          
          <form @submit.prevent="sendInvitation">
            <div class="mb-4">
              <label class="block text-sm font-medium text-gray-700 mb-2">Adresse email</label>
              <input type="email" v-model="inviteForm.email" required class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent" placeholder="exemple@email.com">
            </div>
            
            <div class="mb-4">
              <label class="block text-sm font-medium text-gray-700 mb-2">Rôle</label>
              <select v-model="inviteForm.role" class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent">
                <option value="reader">Lecteur - Accès en lecture seule</option>
                <option value="analyst">Analyste - Accès aux rapports et analytics</option>
                <option value="editor">Éditeur - Peut créer et modifier les campagnes</option>
                <option value="admin">Administrateur - Accès complet</option>
              </select>
            </div>
            
            <div class="mb-6">
              <label class="block text-sm font-medium text-gray-700 mb-2">Message personnalisé (optionnel)</label>
              <textarea v-model="inviteForm.message" rows="3" class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent" placeholder="Ajoutez un message d'accueil..."></textarea>
            </div>
            
            <div class="flex justify-end space-x-3">
              <button type="button" @click="showInviteModal = false" class="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200">
                Annuler
              </button>
              <button type="submit" class="px-4 py-2 text-sm font-medium text-white bg-primary-600 rounded-md hover:bg-primary-700">
                Envoyer l'invitation
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
  name: 'Team',
  components: {
    Layout
  },
  data() {
    return {
      showInviteModal: false,
      inviteForm: {
        email: '',
        role: 'reader',
        message: ''
      }
    }
  },
  methods: {
    sendInvitation() {
      // Simulate sending invitation
      console.log('Sending invitation:', this.inviteForm)
      this.showInviteModal = false
      this.inviteForm = {
        email: '',
        role: 'reader',
        message: ''
      }
      // Here you would typically make an API call to send the invitation
    }
  }
}
</script>