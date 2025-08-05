<template>
  <Layout>
    <div>
          <!-- Page header -->
          <div class="mb-8">
            <h1 class="text-3xl font-bold text-gray-900">Paramètres</h1>
            <p class="mt-2 text-gray-600">
              Gérez votre compte et vos préférences.
            </p>
          </div>

          <!-- Settings sections -->
          <div class="space-y-6">
            <!-- Profile settings -->
            <div class="bg-white rounded-lg shadow p-6">
              <h2 class="text-lg font-medium text-gray-900 mb-6">Informations du profil</h2>
              <form @submit.prevent="updateProfile" class="space-y-4">
                <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label for="firstName" class="block text-sm font-medium text-gray-700 mb-1">
                      Prénom
                    </label>
                    <input
                      id="firstName"
                      v-model="profile.firstName"
                      type="text"
                      class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                      placeholder="Votre prénom"
                    />
                  </div>
                  <div>
                    <label for="lastName" class="block text-sm font-medium text-gray-700 mb-1">
                      Nom
                    </label>
                    <input
                      id="lastName"
                      v-model="profile.lastName"
                      type="text"
                      class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                      placeholder="Votre nom"
                    />
                  </div>
                </div>
                <div>
                  <label for="email" class="block text-sm font-medium text-gray-700 mb-1">
                    Adresse e-mail
                  </label>
                  <input
                    id="email"
                    v-model="profile.email"
                    type="email"
                    class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                    placeholder="votre@email.com"
                  />
                </div>
                <div class="flex justify-end">
                  <button
                    type="submit"
                    class="px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
                  >
                    Sauvegarder
                  </button>
                </div>
              </form>
            </div>

            <!-- Password settings -->
            <div class="bg-white rounded-lg shadow p-6">
              <h2 class="text-lg font-medium text-gray-900 mb-6">Changer le mot de passe</h2>
              <form @submit.prevent="updatePassword" class="space-y-4">
                <div>
                  <label for="currentPassword" class="block text-sm font-medium text-gray-700 mb-1">
                    Mot de passe actuel
                  </label>
                  <input
                    id="currentPassword"
                    v-model="passwordForm.current"
                    type="password"
                    class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                    placeholder="••••••••"
                  />
                </div>
                <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label for="newPassword" class="block text-sm font-medium text-gray-700 mb-1">
                      Nouveau mot de passe
                    </label>
                    <input
                      id="newPassword"
                      v-model="passwordForm.new"
                      type="password"
                      class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                      placeholder="••••••••"
                    />
                  </div>
                  <div>
                    <label for="confirmPassword" class="block text-sm font-medium text-gray-700 mb-1">
                      Confirmer le mot de passe
                    </label>
                    <input
                      id="confirmPassword"
                      v-model="passwordForm.confirm"
                      type="password"
                      class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                      placeholder="••••••••"
                    />
                  </div>
                </div>
                <div class="flex justify-end">
                  <button
                    type="submit"
                    class="px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
                  >
                    Mettre à jour
                  </button>
                </div>
              </form>
            </div>

            <!-- API Connections -->
            <div class="bg-white rounded-lg shadow p-6">
              <h2 class="text-lg font-medium text-gray-900 mb-6">Connexions API</h2>
              <div class="space-y-4">
                <div
                  v-for="connection in apiConnections"
                  :key="connection.id"
                  class="flex items-center justify-between p-4 border border-gray-200 rounded-lg"
                >
                  <div class="flex items-center space-x-4">
                    <div class="flex-shrink-0">
                      <div
                        class="w-10 h-10 rounded-lg flex items-center justify-center"
                        :class="connection.color"
                      >
                        <component :is="connection.icon" class="w-5 h-5 text-white" />
                      </div>
                    </div>
                    <div>
                      <h3 class="text-sm font-medium text-gray-900">{{ connection.name }}</h3>
                      <p class="text-sm text-gray-500">{{ connection.description }}</p>
                    </div>
                  </div>
                  <div class="flex items-center space-x-3">
                    <span
                      class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium"
                      :class="connection.connected ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'"
                    >
                      <span
                        class="w-1.5 h-1.5 rounded-full mr-1.5"
                        :class="connection.connected ? 'bg-green-400' : 'bg-gray-400'"
                      ></span>
                      {{ connection.connected ? 'Connecté' : 'Non connecté' }}
                    </span>
                    <button
                      @click="toggleConnection(connection)"
                      class="text-sm font-medium text-primary-600 hover:text-primary-500"
                    >
                      {{ connection.connected ? 'Déconnecter' : 'Connecter' }}
                    </button>
                  </div>
                </div>
              </div>
            </div>

            <!-- Notifications -->
            <div class="bg-white rounded-lg shadow p-6">
              <h2 class="text-lg font-medium text-gray-900 mb-6">Notifications</h2>
              <div class="space-y-4">
                <div class="flex items-center justify-between">
                  <div>
                    <h3 class="text-sm font-medium text-gray-900">Notifications par e-mail</h3>
                    <p class="text-sm text-gray-500">Recevoir des mises à jour par e-mail</p>
                  </div>
                  <button
                    @click="notifications.email = !notifications.email"
                    class="relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
                    :class="notifications.email ? 'bg-primary-600' : 'bg-gray-200'"
                  >
                    <span
                      class="pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out"
                      :class="notifications.email ? 'translate-x-5' : 'translate-x-0'"
                    ></span>
                  </button>
                </div>
                <div class="flex items-center justify-between">
                  <div>
                    <h3 class="text-sm font-medium text-gray-900">Notifications push</h3>
                    <p class="text-sm text-gray-500">Recevoir des notifications dans le navigateur</p>
                  </div>
                  <button
                    @click="notifications.push = !notifications.push"
                    class="relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
                    :class="notifications.push ? 'bg-primary-600' : 'bg-gray-200'"
                  >
                    <span
                      class="pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out"
                      :class="notifications.push ? 'translate-x-5' : 'translate-x-0'"
                    ></span>
                  </button>
                </div>
              </div>
            </div>

            <!-- Danger zone -->
            <div class="bg-white rounded-lg shadow p-6 border-l-4 border-red-400">
              <h2 class="text-lg font-medium text-red-900 mb-6">Zone de danger</h2>
              <div class="space-y-4">
                <div>
                  <h3 class="text-sm font-medium text-gray-900 mb-2">Supprimer le compte</h3>
                  <p class="text-sm text-gray-600 mb-4">
                    Cette action est irréversible. Toutes vos données seront définitivement supprimées.
                  </p>
                  <button
                    @click="showDeleteConfirm = true"
                    class="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
                  >
                    Supprimer mon compte
                  </button>
                </div>
              </div>
            </div>
          </div>
    </div>

    <!-- Delete confirmation modal -->
    <div
      v-if="showDeleteConfirm"
      class="fixed inset-0 z-50 overflow-y-auto"
      aria-labelledby="modal-title"
      role="dialog"
      aria-modal="true"
    >
      <div class="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
        <div class="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" @click="showDeleteConfirm = false"></div>
        <div class="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
          <div class="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
            <div class="sm:flex sm:items-start">
              <div class="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-red-100 sm:mx-0 sm:h-10 sm:w-10">
                <svg class="h-6 w-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
              </div>
              <div class="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left">
                <h3 class="text-lg leading-6 font-medium text-gray-900" id="modal-title">
                  Supprimer le compte
                </h3>
                <div class="mt-2">
                  <p class="text-sm text-gray-500">
                    Êtes-vous sûr de vouloir supprimer votre compte ? Cette action ne peut pas être annulée.
                  </p>
                </div>
              </div>
            </div>
          </div>
          <div class="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
            <button
              @click="deleteAccount"
              type="button"
              class="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-red-600 text-base font-medium text-white hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 sm:ml-3 sm:w-auto sm:text-sm"
            >
              Supprimer
            </button>
            <button
              @click="showDeleteConfirm = false"
              type="button"
              class="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
            >
              Annuler
            </button>
          </div>
        </div>
      </div>
    </div>
  </Layout>
</template>

<script>
import Layout from '../components/Layout.vue'

export default {
  name: 'Settings',
  components: {
    Layout
  },
  data() {
    return {
      showDeleteConfirm: false,
      profile: {
        firstName: '',
        lastName: '',
        email: localStorage.getItem('userEmail') || ''
      },
      passwordForm: {
        current: '',
        new: '',
        confirm: ''
      },
      notifications: {
        email: true,
        push: false
      },
      apiConnections: [
        {
          id: 'google',
          name: 'Google Analytics',
          description: 'Analysez le trafic de votre site web',
          connected: true,
          color: 'bg-red-500',
          icon: 'GoogleIcon'
        },
        {
          id: 'facebook',
          name: 'Facebook',
          description: 'Gérez vos pages et publicités Facebook',
          connected: true,
          color: 'bg-blue-600',
          icon: 'FacebookIcon'
        },
        {
          id: 'instagram',
          name: 'Instagram',
          description: 'Analysez vos performances Instagram',
          connected: false,
          color: 'bg-pink-500',
          icon: 'InstagramIcon'
        },
        {
          id: 'mailchimp',
          name: 'Mailchimp',
          description: 'Gérez vos campagnes e-mail',
          connected: false,
          color: 'bg-yellow-500',
          icon: 'MailIcon'
        }
      ]
    }
  },
  methods: {
    updateProfile() {
      // Mock profile update
      alert('Profil mis à jour avec succès !')
    },
    updatePassword() {
      if (this.passwordForm.new !== this.passwordForm.confirm) {
        alert('Les mots de passe ne correspondent pas')
        return
      }
      // Mock password update
      alert('Mot de passe mis à jour avec succès !')
      this.passwordForm = { current: '', new: '', confirm: '' }
    },
    toggleConnection(connection) {
      connection.connected = !connection.connected
      const status = connection.connected ? 'connecté' : 'déconnecté'
      alert(`${connection.name} ${status} avec succès !`)
    },
    deleteAccount() {
      // Mock account deletion
      localStorage.clear()
      alert('Compte supprimé avec succès')
      this.$router.push('/login')
    }
  }
}
</script>