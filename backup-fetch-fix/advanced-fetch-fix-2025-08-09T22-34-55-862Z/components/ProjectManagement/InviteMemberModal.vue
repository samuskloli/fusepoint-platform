<template>
  <div class="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50" @click="closeModal">
    <div class="relative top-20 mx-auto p-5 border w-11/12 md:w-3/4 lg:w-1/2 shadow-lg rounded-md bg-white" @click.stop>
      <div class="flex items-center justify-between mb-4">
        <h3 class="text-lg font-medium text-gray-900">Inviter un membre</h3>
        <button @click="closeModal" class="text-gray-400 hover:text-gray-600">
          <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
          </svg>
        </button>
      </div>

      <form @submit.prevent="inviteMember">
        <!-- Type d'invitation -->
        <div class="mb-6">
          <label class="block text-sm font-medium text-gray-700 mb-2">Type d'invitation</label>
          <div class="grid grid-cols-2 gap-4">
            <label class="relative">
              <input
                v-model="invitationType"
                type="radio"
                value="email"
                class="sr-only"
              >
              <div
                class="border-2 rounded-lg p-4 cursor-pointer transition-colors"
                :class="invitationType === 'email' ? 'border-blue-500 bg-blue-50' : 'border-gray-300 hover:border-gray-400'"
              >
                <div class="flex items-center">
                  <svg class="w-6 h-6 text-blue-500 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path>
                  </svg>
                  <div>
                    <p class="font-medium text-gray-900">Par email</p>
                    <p class="text-sm text-gray-500">Inviter par adresse email</p>
                  </div>
                </div>
              </div>
            </label>
            <label class="relative">
              <input
                v-model="invitationType"
                type="radio"
                value="existing"
                class="sr-only"
              >
              <div
                class="border-2 rounded-lg p-4 cursor-pointer transition-colors"
                :class="invitationType === 'existing' ? 'border-blue-500 bg-blue-50' : 'border-gray-300 hover:border-gray-400'"
              >
                <div class="flex items-center">
                  <svg class="w-6 h-6 text-blue-500 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z"></path>
                  </svg>
                  <div>
                    <p class="font-medium text-gray-900">Utilisateur existant</p>
                    <p class="text-sm text-gray-500">Sélectionner un utilisateur</p>
                  </div>
                </div>
              </div>
            </label>
          </div>
        </div>

        <!-- Invitation par email -->
        <div v-if="invitationType === 'email'" class="space-y-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Adresse email *</label>
            <input
              v-model="form.email"
              type="email"
              required
              placeholder="exemple@email.com"
              class="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            >
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Nom complet *</label>
            <input
              v-model="form.name"
              type="text"
              required
              placeholder="Nom et prénom"
              class="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            >
          </div>
        </div>

        <!-- Sélection d'utilisateur existant -->
        <div v-if="invitationType === 'existing'" class="space-y-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Rechercher un utilisateur</label>
            <div class="relative">
              <input
                v-model="userSearchQuery"
                type="text"
                placeholder="Tapez pour rechercher..."
                class="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                @input="searchUsers"
              >
              <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg class="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
                </svg>
              </div>
            </div>
            
            <!-- Résultats de recherche -->
            <div v-if="searchResults.length > 0" class="mt-2 max-h-60 overflow-y-auto border border-gray-300 rounded-md">
              <ul class="divide-y divide-gray-200">
                <li
                  v-for="user in searchResults"
                  :key="user.id"
                  @click="selectUser(user)"
                  class="px-4 py-3 hover:bg-gray-50 cursor-pointer"
                  :class="selectedUser?.id === user.id ? 'bg-blue-50 border-blue-200' : ''"
                >
                  <div class="flex items-center">
                    <img
                      v-if="user.avatar"
                      :src="user.avatar"
                      :alt="user.name"
                      class="h-8 w-8 rounded-full mr-3"
                    >
                    <div
                      v-else
                      class="h-8 w-8 rounded-full bg-gray-300 flex items-center justify-center mr-3"
                    >
                      <span class="text-xs font-medium text-gray-700">
                        {{ getInitials(user.name) }}
                      </span>
                    </div>
                    <div>
                      <p class="text-sm font-medium text-gray-900">{{ user.name }}</p>
                      <p class="text-sm text-gray-500">{{ user.email }}</p>
                    </div>
                  </div>
                </li>
              </ul>
            </div>
            
            <!-- Utilisateur sélectionné -->
            <div v-if="selectedUser" class="mt-3 p-3 bg-blue-50 border border-blue-200 rounded-md">
              <div class="flex items-center justify-between">
                <div class="flex items-center">
                  <img
                    v-if="selectedUser.avatar"
                    :src="selectedUser.avatar"
                    :alt="selectedUser.name"
                    class="h-8 w-8 rounded-full mr-3"
                  >
                  <div
                    v-else
                    class="h-8 w-8 rounded-full bg-gray-300 flex items-center justify-center mr-3"
                  >
                    <span class="text-xs font-medium text-gray-700">
                      {{ getInitials(selectedUser.name) }}
                    </span>
                  </div>
                  <div>
                    <p class="text-sm font-medium text-gray-900">{{ selectedUser.name }}</p>
                    <p class="text-sm text-gray-500">{{ selectedUser.email }}</p>
                  </div>
                </div>
                <button
                  @click="selectedUser = null"
                  type="button"
                  class="text-gray-400 hover:text-gray-600"
                >
                  <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
                  </svg>
                </button>
              </div>
            </div>
          </div>
        </div>

        <!-- Rôle -->
        <div class="mt-4">
          <label class="block text-sm font-medium text-gray-700 mb-1">Rôle dans le projet *</label>
          <select
            v-model="form.role"
            required
            class="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
          >
            <option value="">Sélectionner un rôle</option>
            <option value="admin">Administrateur</option>
            <option value="manager">Manager</option>
            <option value="developer">Développeur</option>
            <option value="designer">Designer</option>
            <option value="tester">Testeur</option>
            <option value="client">Client</option>
            <option value="viewer">Observateur</option>
          </select>
        </div>

        <!-- Permissions -->
        <div class="mt-4">
          <label class="block text-sm font-medium text-gray-700 mb-2">Permissions</label>
          <div class="space-y-2">
            <label class="flex items-center">
              <input
                v-model="form.permissions.can_edit_project"
                type="checkbox"
                class="rounded border-gray-300 text-blue-600 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
              >
              <span class="ml-2 text-sm text-gray-700">Peut modifier le projet</span>
            </label>
            <label class="flex items-center">
              <input
                v-model="form.permissions.can_manage_tasks"
                type="checkbox"
                class="rounded border-gray-300 text-blue-600 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
              >
              <span class="ml-2 text-sm text-gray-700">Peut gérer les tâches</span>
            </label>
            <label class="flex items-center">
              <input
                v-model="form.permissions.can_manage_files"
                type="checkbox"
                class="rounded border-gray-300 text-blue-600 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
              >
              <span class="ml-2 text-sm text-gray-700">Peut gérer les fichiers</span>
            </label>
            <label class="flex items-center">
              <input
                v-model="form.permissions.can_invite_members"
                type="checkbox"
                class="rounded border-gray-300 text-blue-600 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
              >
              <span class="ml-2 text-sm text-gray-700">Peut inviter des membres</span>
            </label>
            <label class="flex items-center">
              <input
                v-model="form.permissions.can_view_reports"
                type="checkbox"
                class="rounded border-gray-300 text-blue-600 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
              >
              <span class="ml-2 text-sm text-gray-700">Peut voir les rapports</span>
            </label>
          </div>
        </div>

        <!-- Message d'invitation -->
        <div class="mt-4">
          <label class="block text-sm font-medium text-gray-700 mb-1">Message d'invitation (optionnel)</label>
          <textarea
            v-model="form.message"
            rows="3"
            placeholder="Ajoutez un message personnel à l'invitation..."
            class="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
          ></textarea>
        </div>

        <!-- Options avancées -->
        <div class="mt-4">
          <div class="flex items-center justify-between">
            <span class="text-sm font-medium text-gray-700">Options avancées</span>
            <button
              @click="showAdvanced = !showAdvanced"
              type="button"
              class="text-blue-600 hover:text-blue-500 text-sm"
            >
              {{ showAdvanced ? 'Masquer' : 'Afficher' }}
            </button>
          </div>
          
          <div v-if="showAdvanced" class="mt-3 space-y-3 p-3 bg-gray-50 rounded-md">
            <label class="flex items-center">
              <input
                v-model="form.send_notification"
                type="checkbox"
                class="rounded border-gray-300 text-blue-600 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
              >
              <span class="ml-2 text-sm text-gray-700">Envoyer une notification par email</span>
            </label>
            <label class="flex items-center">
              <input
                v-model="form.require_approval"
                type="checkbox"
                class="rounded border-gray-300 text-blue-600 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
              >
              <span class="ml-2 text-sm text-gray-700">Nécessite une approbation</span>
            </label>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Date d'expiration de l'invitation</label>
              <input
                v-model="form.expires_at"
                type="datetime-local"
                class="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              >
            </div>
          </div>
        </div>

        <!-- Actions -->
        <div class="flex justify-end space-x-3 mt-6 pt-4 border-t border-gray-200">
          <button
            @click="closeModal"
            type="button"
            class="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            Annuler
          </button>
          <button
            type="submit"
            :disabled="loading || !isFormValid"
            class="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <span v-if="loading" class="flex items-center">
              <svg class="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Envoi en cours...
            </span>
            <span v-else>Envoyer l'invitation</span>
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<script>
import { ref, computed, watch } from 'vue'
import { projectManagementService } from '@/services/projectManagementService'

export default {
  name: 'InviteMemberModal',
  props: {
    projectId: {
      type: [String, Number],
      required: true
    }
  },
  emits: ['close', 'invited'],
  setup(props, { emit }) {
    const loading = ref(false)
    const invitationType = ref('email')
    const userSearchQuery = ref('')
    const searchResults = ref([])
    const selectedUser = ref(null)
    const showAdvanced = ref(false)
    
    const form = ref({
      email: '',
      name: '',
      role: '',
      message: '',
      permissions: {
        can_edit_project: false,
        can_manage_tasks: true,
        can_manage_files: true,
        can_invite_members: false,
        can_view_reports: true
      },
      send_notification: true,
      require_approval: false,
      expires_at: ''
    })

    const isFormValid = computed(() => {
      if (invitationType.value === 'email') {
        return form.value.email && form.value.name && form.value.role
      } else {
        return selectedUser.value && form.value.role
      }
    })

    // Mise à jour des permissions par défaut selon le rôle
    watch(() => form.value.role, (newRole) => {
      const defaultPermissions = {
        admin: {
          can_edit_project: true,
          can_manage_tasks: true,
          can_manage_files: true,
          can_invite_members: true,
          can_view_reports: true
        },
        manager: {
          can_edit_project: true,
          can_manage_tasks: true,
          can_manage_files: true,
          can_invite_members: true,
          can_view_reports: true
        },
        developer: {
          can_edit_project: false,
          can_manage_tasks: true,
          can_manage_files: true,
          can_invite_members: false,
          can_view_reports: true
        },
        designer: {
          can_edit_project: false,
          can_manage_tasks: true,
          can_manage_files: true,
          can_invite_members: false,
          can_view_reports: true
        },
        tester: {
          can_edit_project: false,
          can_manage_tasks: true,
          can_manage_files: false,
          can_invite_members: false,
          can_view_reports: true
        },
        client: {
          can_edit_project: false,
          can_manage_tasks: false,
          can_manage_files: false,
          can_invite_members: false,
          can_view_reports: true
        },
        viewer: {
          can_edit_project: false,
          can_manage_tasks: false,
          can_manage_files: false,
          can_invite_members: false,
          can_view_reports: true
        }
      }
      
      if (defaultPermissions[newRole]) {
        form.value.permissions = { ...defaultPermissions[newRole] }
      }
    })

    const searchUsers = async () => {
      if (userSearchQuery.value.length < 2) {
        searchResults.value = []
        return
      }

      try {
        const response = await projectManagementService.searchUsers(userSearchQuery.value)
        searchResults.value = response.data
      } catch (error) {
        console.error('Erreur lors de la recherche d\'utilisateurs:', error)
        searchResults.value = []
      }
    }

    const selectUser = (user) => {
      selectedUser.value = user
      searchResults.value = []
      userSearchQuery.value = user.name
    }

    const getInitials = (name) => {
      return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
    }

    const inviteMember = async () => {
      try {
        loading.value = true
        
        const inviteData = {
          project_id: props.projectId,
          role: form.value.role,
          message: form.value.message,
          permissions: form.value.permissions,
          send_notification: form.value.send_notification,
          require_approval: form.value.require_approval,
          expires_at: form.value.expires_at || null
        }

        if (invitationType.value === 'email') {
          inviteData.email = form.value.email
          inviteData.name = form.value.name
        } else {
          inviteData.user_id = selectedUser.value.id
        }

        await projectManagementService.inviteTeamMember(inviteData)
        emit('invited')
      } catch (error) {
        console.error('Erreur lors de l\'invitation:', error)
      } finally {
        loading.value = false
      }
    }

    const closeModal = () => {
      emit('close')
    }

    return {
      loading,
      invitationType,
      userSearchQuery,
      searchResults,
      selectedUser,
      showAdvanced,
      form,
      isFormValid,
      searchUsers,
      selectUser,
      getInitials,
      inviteMember,
      closeModal
    }
  }
}
</script>