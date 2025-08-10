<template>
  <div class="user-settings">
    <div class="max-w-4xl mx-auto p-6">
      <!-- En-tête -->
      <div class="mb-8">
        <h1 class="text-2xl font-bold text-gray-900">Paramètres du compte</h1>
        <p class="text-gray-600 mt-2">
          Gérez vos informations personnelles, connexions et préférences
        </p>
      </div>

      <!-- Navigation par onglets -->
      <div class="border-b border-gray-200 mb-6">
        <nav class="-mb-px flex space-x-8">
          <button
            v-for="tab in tabs"
            :key="tab.id"
            @click="activeTab = tab.id"
            :class="[
              'py-2 px-1 border-b-2 font-medium text-sm transition-colors',
              activeTab === tab.id
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            ]"
          >
            <svg class="w-4 h-4 inline mr-2" :class="tab.iconClass" fill="currentColor" viewBox="0 0 20 20">
              <path :d="tab.iconPath" />
            </svg>
            {{ tab.name }}
          </button>
        </nav>
      </div>

      <!-- Contenu des onglets -->
      <div class="tab-content">
        <!-- Onglet Profil -->
        <div v-if="activeTab === 'profile'" class="space-y-6">
          <div class="bg-white rounded-lg shadow-md p-6">
            <h2 class="text-lg font-medium text-gray-900 mb-4">Informations personnelles</h2>
            <form @submit.prevent="updateProfile" class="space-y-4">
              <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1">Prénom</label>
                  <input
                    v-model="profile.firstName"
                    type="text"
                    class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Votre prénom"
                  />
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1">Nom</label>
                  <input
                    v-model="profile.lastName"
                    type="text"
                    class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Votre nom"
                  />
                </div>
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <input
                  v-model="profile.email"
                  type="email"
                  class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="votre@email.com"
                />
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Entreprise</label>
                <input
                  v-model="profile.company"
                  type="text"
                  class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Nom de votre entreprise"
                />
              </div>
              <div class="flex justify-end">
                <button
                  type="submit"
                  class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  :disabled="profileLoading"
                >
                  {{ profileLoading ? 'Enregistrement...' : 'Enregistrer' }}
                </button>
              </div>
            </form>
          </div>
        </div>

        <!-- Onglet Connexions -->
        <div v-if="activeTab === 'connections'">
          <ConnectionsManager @connection-updated="handleConnectionUpdate" @all-disconnected="handleAllDisconnected" />
        </div>

        <!-- Onglet Sécurité -->
        <div v-if="activeTab === 'security'" class="space-y-6">
          <!-- Changement de mot de passe -->
          <div class="bg-white rounded-lg shadow-md p-6">
            <h2 class="text-lg font-medium text-gray-900 mb-4">Changer le mot de passe</h2>
            <form @submit.prevent="changePassword" class="space-y-4">
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Mot de passe actuel</label>
                <input
                  v-model="passwordForm.currentPassword"
                  type="password"
                  class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Votre mot de passe actuel"
                />
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Nouveau mot de passe</label>
                <input
                  v-model="passwordForm.newPassword"
                  type="password"
                  class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Nouveau mot de passe"
                />
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Confirmer le nouveau mot de passe</label>
                <input
                  v-model="passwordForm.confirmPassword"
                  type="password"
                  class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Confirmer le nouveau mot de passe"
                />
              </div>
              <div class="flex justify-end">
                <button
                  type="submit"
                  class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  :disabled="passwordLoading"
                >
                  {{ passwordLoading ? 'Modification...' : 'Changer le mot de passe' }}
                </button>
              </div>
            </form>
          </div>

          <!-- Sessions actives -->
          <div class="bg-white rounded-lg shadow-md p-6">
            <h2 class="text-lg font-medium text-gray-900 mb-4">Sessions actives</h2>
            <div class="space-y-3">
              <div v-for="session in activeSessions" :key="session.id" class="flex items-center justify-between p-3 border rounded-lg">
                <div class="flex items-center space-x-3">
                  <div class="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center">
                    <svg class="w-4 h-4 text-gray-600" fill="currentColor" viewBox="0 0 20 20">
                      <path fill-rule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zm0 4a1 1 0 011-1h12a1 1 0 011 1v6a1 1 0 01-1 1H4a1 1 0 01-1-1V8zm2 2a1 1 0 000 2h.01a1 1 0 100-2H5zm3 0a1 1 0 000 2h3a1 1 0 100-2H8z" clip-rule="evenodd" />
                    </svg>
                  </div>
                  <div>
                    <p class="text-sm font-medium text-gray-900">{{ session.device }}</p>
                    <p class="text-xs text-gray-500">{{ session.location }} • {{ session.lastActive }}</p>
                  </div>
                </div>
                <div class="flex items-center space-x-2">
                  <span v-if="session.current" class="px-2 py-1 text-xs font-medium text-green-800 bg-green-100 rounded-full">
                    Session actuelle
                  </span>
                  <button
                    v-else
                    @click="revokeSession(session.id)"
                    class="text-red-600 hover:text-red-800 text-sm font-medium"
                  >
                    Révoquer
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Onglet Préférences -->
        <div v-if="activeTab === 'preferences'" class="space-y-6">
          <div class="bg-white rounded-lg shadow-md p-6">
            <h2 class="text-lg font-medium text-gray-900 mb-4">Préférences d'affichage</h2>
            <div class="space-y-4">
              <div class="flex items-center justify-between">
                <div>
                  <h3 class="text-sm font-medium text-gray-900">Mode sombre</h3>
                  <p class="text-sm text-gray-500">Utiliser le thème sombre pour l'interface</p>
                </div>
                <label class="relative inline-flex items-center cursor-pointer">
                  <input v-model="preferences.darkMode" type="checkbox" class="sr-only peer">
                  <div class="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                </label>
              </div>
              <div class="flex items-center justify-between">
                <div>
                  <h3 class="text-sm font-medium text-gray-900">Notifications par email</h3>
                  <p class="text-sm text-gray-500">Recevoir des notifications par email</p>
                </div>
                <label class="relative inline-flex items-center cursor-pointer">
                  <input v-model="preferences.emailNotifications" type="checkbox" class="sr-only peer">
                  <div class="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                </label>
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Langue</label>
                <select
                  v-model="preferences.language"
                  class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="fr">Français</option>
                  <option value="en">English</option>
                  <option value="es">Español</option>
                </select>
              </div>
              <div class="flex justify-end">
                <button
                  @click="savePreferences"
                  class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  :disabled="preferencesLoading"
                >
                  {{ preferencesLoading ? 'Enregistrement...' : 'Enregistrer' }}
                </button>
              </div>
            </div>
          </div>
        </div>

        <!-- Onglet Danger Zone -->
        <div v-if="activeTab === 'danger'" class="space-y-6">
          <div class="bg-white rounded-lg shadow-md p-6 border-l-4 border-red-500">
            <h2 class="text-lg font-medium text-red-900 mb-4">Zone de danger</h2>
            <div class="space-y-4">
              <div class="p-4 bg-red-50 rounded-lg">
                <h3 class="text-sm font-medium text-red-900 mb-2">Supprimer le compte</h3>
                <p class="text-sm text-red-700 mb-4">
                  Cette action est irréversible. Toutes vos données seront définitivement supprimées.
                </p>
                <button
                  @click="showDeleteAccountModal = true"
                  class="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                >
                  Supprimer mon compte
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Messages -->
      <div v-if="message" class="fixed bottom-4 right-4 max-w-sm">
        <div class="bg-white rounded-lg shadow-lg border p-4" :class="messageClass">
          <div class="flex items-start">
              <svg v-if="messageType === 'success'" class="w-5 h-5 text-green-400 mr-2 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" />
              </svg>
              <svg v-else-if="messageType === 'error'" class="w-5 h-5 text-red-400 mr-2 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd" />
              </svg>
              <div class="flex-1">
                <p class="text-sm font-medium" :class="messageType === 'success' ? 'text-green-800' : 'text-red-800'">{{ message }}</p>
              </div>
              <button @click="clearMessage" class="ml-3">
                <svg class="w-4 h-4 text-gray-400 hover:text-gray-600" fill="currentColor" viewBox="0 0 20 20">
                  <path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd" />
                </svg>
              </button>
            </div>
      </div>
    </div>

    <!-- Modale de suppression de compte -->
    <div v-if="showDeleteAccountModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" @click.self="showDeleteAccountModal = false">
      <div class="bg-white rounded-lg p-6 max-w-md mx-4">
        <div class="flex items-center mb-4">
          <div class="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center mr-3">
            <svg class="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16c-.77.833.192 2.5 1.732 2.5z"></path>
            </svg>
          </div>
          <h3 class="text-lg font-medium text-gray-900">Confirmer la suppression</h3>
        </div>
        <p class="text-gray-600 mb-4">
          Êtes-vous sûr de vouloir supprimer votre compte ? Cette action est irréversible et toutes vos données seront définitivement perdues.
        </p>
        <div class="mb-4">
          <label class="block text-sm font-medium text-gray-700 mb-1">
            Tapez "SUPPRIMER" pour confirmer
          </label>
          <input
            v-model="deleteConfirmation"
            type="text"
            class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
            placeholder="SUPPRIMER"
          />
        </div>
        <div class="flex space-x-3">
          <button 
            @click="deleteAccount" 
            :disabled="deleteConfirmation !== 'SUPPRIMER' || deleteAccountLoading"
            class="flex-1 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {{ deleteAccountLoading ? 'Suppression...' : 'Supprimer définitivement' }}
          </button>
          <button 
            @click="showDeleteAccountModal = false" 
            class="flex-1 bg-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-400 transition-colors"
            :disabled="deleteAccountLoading"
          >
            Annuler
          </button>
        </div>
      </div>
    </div>
  </div>
</div>
</template>

<script>
import ConnectionsManager from '../components/ConnectionsManager.vue';

export default {
  name: 'UserSettings',
  components: {
    ConnectionsManager
  },
  data() {
    return {
      activeTab: 'profile',
      tabs: [
        {
          id: 'profile',
          name: 'Profil',
          iconClass: 'text-current',
          iconPath: 'M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z'
        },
        {
          id: 'connections',
          name: 'Connexions',
          iconClass: 'text-current',
          iconPath: 'M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3z'
        },
        {
          id: 'security',
          name: 'Sécurité',
          iconClass: 'text-current',
          iconPath: 'M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2z'
        },
        {
          id: 'preferences',
          name: 'Préférences',
          iconClass: 'text-current',
          iconPath: 'M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z'
        },
        {
          id: 'danger',
          name: 'Danger',
          iconClass: 'text-red-500',
          iconPath: 'M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92z'
        }
      ],
      profile: {
        firstName: '',
        lastName: '',
        email: '',
        company: ''
      },
      passwordForm: {
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      },
      preferences: {
        darkMode: false,
        emailNotifications: true,
        language: 'fr'
      },
      activeSessions: [
        {
          id: 1,
          device: 'MacBook Pro - Chrome',
          location: 'Paris, France',
          lastActive: 'Maintenant',
          current: true
        },
        {
          id: 2,
          device: 'iPhone - Safari',
          location: 'Paris, France',
          lastActive: 'Il y a 2 heures',
          current: false
        }
      ],
      profileLoading: false,
      passwordLoading: false,
      preferencesLoading: false,
      deleteAccountLoading: false,
      showDeleteAccountModal: false,
      deleteConfirmation: '',
      message: '',
      messageType: 'info'
    };
  },
  computed: {
    messageClass() {
      return {
        'border-green-200': this.messageType === 'success',
        'border-red-200': this.messageType === 'error',
        'border-blue-200': this.messageType === 'info'
      };
    }
  },
  mounted() {
    this.loadUserProfile();
  },
  methods: {
    /**
     * Charger le profil utilisateur
     */
    async loadUserProfile() {
      try {
        // Simuler le chargement du profil depuis l'API
        // const response = await userService.getProfile();
        // this.profile = response.data;
        
        // Données de test
        this.profile = {
          firstName: 'John',
          lastName: 'Doe',
          email: 'john.doe@example.com',
          company: 'Fusepoint'
        };
      } catch (error) {
        console.error('Erreur lors du chargement du profil:', error);
      }
    },

    /**
     * Mettre à jour le profil
     */
    async updateProfile() {
      try {
        this.profileLoading = true;
        
        // Simuler la mise à jour du profil
        // await userService.updateProfile(this.profile);
        
        this.showMessage('Profil mis à jour avec succès', 'success');
      } catch (error) {
        console.error('Erreur lors de la mise à jour du profil:', error);
        this.showMessage('Erreur lors de la mise à jour du profil', 'error');
      } finally {
        this.profileLoading = false;
      }
    },

    /**
     * Changer le mot de passe
     */
    async changePassword() {
      try {
        if (this.passwordForm.newPassword !== this.passwordForm.confirmPassword) {
          this.showMessage('Les mots de passe ne correspondent pas', 'error');
          return;
        }
        
        this.passwordLoading = true;
        
        // Simuler le changement de mot de passe
        // await userService.changePassword(this.passwordForm);
        
        this.passwordForm = {
          currentPassword: '',
          newPassword: '',
          confirmPassword: ''
        };
        
        this.showMessage('Mot de passe modifié avec succès', 'success');
      } catch (error) {
        console.error('Erreur lors du changement de mot de passe:', error);
        this.showMessage('Erreur lors du changement de mot de passe', 'error');
      } finally {
        this.passwordLoading = false;
      }
    },

    /**
     * Sauvegarder les préférences
     */
    async savePreferences() {
      try {
        this.preferencesLoading = true;
        
        // Simuler la sauvegarde des préférences
        // await userService.updatePreferences(this.preferences);
        
        this.showMessage('Préférences sauvegardées avec succès', 'success');
      } catch (error) {
        console.error('Erreur lors de la sauvegarde des préférences:', error);
        this.showMessage('Erreur lors de la sauvegarde des préférences', 'error');
      } finally {
        this.preferencesLoading = false;
      }
    },

    /**
     * Révoquer une session
     */
    async revokeSession(sessionId) {
      try {
        // Simuler la révocation de session
        // await userService.revokeSession(sessionId);
        
        this.activeSessions = this.activeSessions.filter(session => session.id !== sessionId);
        this.showMessage('Session révoquée avec succès', 'success');
      } catch (error) {
        console.error('Erreur lors de la révocation de session:', error);
        this.showMessage('Erreur lors de la révocation de session', 'error');
      }
    },

    /**
     * Supprimer le compte
     */
    async deleteAccount() {
      try {
        this.deleteAccountLoading = true;
        
        // Simuler la suppression du compte
        // await userService.deleteAccount();
        
        this.showMessage('Compte supprimé avec succès', 'success');
        
        // Rediriger vers la page de connexion après suppression
        setTimeout(() => {
          this.$router.push('/login');
        }, 2000);
        
      } catch (error) {
        console.error('Erreur lors de la suppression du compte:', error);
        this.showMessage('Erreur lors de la suppression du compte', 'error');
      } finally {
        this.deleteAccountLoading = false;
        this.showDeleteAccountModal = false;
        this.deleteConfirmation = '';
      }
    },

    /**
     * Gérer la mise à jour de connexion
     */
    handleConnectionUpdate(data) {
      console.log('Connexion mise à jour:', data);
      this.showMessage(`${data.service} ${data.isConnected ? 'connecté' : 'déconnecté'} avec succès`, 'success');
    },

    /**
     * Gérer la déconnexion globale
     */
    handleAllDisconnected() {
      console.log('Toutes les connexions ont été supprimées');
      this.showMessage('Toutes les connexions ont été supprimées avec succès', 'success');
    },

    /**
     * Afficher un message
     */
    showMessage(text, type = 'info') {
      this.message = text;
      this.messageType = type;
      
      // Auto-hide après 5 secondes
      setTimeout(() => {
        this.clearMessage();
      }, 5000);
    },

    /**
     * Effacer le message
     */
    clearMessage() {
      this.message = '';
      this.messageType = 'info';
    }
  }
};
</script>

<style scoped>
.user-settings {
  min-height: 100vh;
  background-color: #f9fafb;
}

.tab-content {
  min-height: 400px;
}

/* Animations pour les transitions */
.transition-colors {
  transition: background-color 0.2s ease, color 0.2s ease, border-color 0.2s ease;
}

/* Style pour les toggles */
.peer:checked + div {
  background-color: #2563eb;
}

.peer:checked + div:after {
  transform: translateX(100%);
  border-color: white;
}
</style>