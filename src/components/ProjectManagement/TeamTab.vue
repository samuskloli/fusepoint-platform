<template>
  <div class="space-y-6">
    <!-- En-tête avec actions -->
    <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between">
      <div>
        <h3 class="text-lg font-medium text-gray-900">Équipe du projet</h3>
        <p class="mt-1 text-sm text-gray-500">
          Gérez les membres de l'équipe et leurs rôles dans le projet
        </p>
      </div>
      <div class="mt-4 sm:mt-0 flex space-x-3">
        <button
          @click="showInviteModal = true"
          class="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          <svg class="-ml-1 mr-2 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path>
          </svg>
          Inviter un membre
        </button>
        <button
          @click="loadAvailableProviders"
          class="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          <svg class="-ml-1 mr-2 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2-2v2m8 0V6a2 2 0 012 2v6a2 2 0 01-2 2H6a2 2 0 01-2-2V8a2 2 0 012-2V6"></path>
          </svg>
          Prestataires disponibles
        </button>
      </div>
    </div>

    <!-- Filtres et recherche -->
    <div class="bg-white p-4 rounded-lg border border-gray-200">
      <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Rechercher</label>
          <div class="relative">
            <input
              v-model="searchQuery"
              type="text"
              placeholder="Nom, email, rôle..."
              class="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            >
            <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <svg class="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
              </svg>
            </div>
          </div>
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Rôle</label>
          <select
            v-model="selectedRole"
            class="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
          >
            <option value="">Tous les rôles</option>
            <option value="owner">Propriétaire</option>
            <option value="admin">Administrateur</option>
            <option value="manager">Manager</option>
            <option value="developer">Développeur</option>
            <option value="designer">Designer</option>
            <option value="tester">Testeur</option>
            <option value="client">Client</option>
            <option value="viewer">Observateur</option>
          </select>
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Statut</label>
          <select
            v-model="selectedStatus"
            class="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
          >
            <option value="">Tous les statuts</option>
            <option value="active">Actif</option>
            <option value="pending">En attente</option>
            <option value="inactive">Inactif</option>
          </select>
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Trier par</label>
          <select
            v-model="sortBy"
            class="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
          >
            <option value="name">Nom</option>
            <option value="role">Rôle</option>
            <option value="joined_at">Date d'ajout</option>
            <option value="last_activity">Dernière activité</option>
          </select>
        </div>
      </div>
    </div>

    <!-- Liste des membres -->
    <div class="bg-white shadow overflow-hidden sm:rounded-md">
      <ul class="divide-y divide-gray-200">
        <li v-for="member in filteredMembers" :key="member.id" class="px-6 py-4">
          <div class="flex items-center justify-between">
            <div class="flex items-center">
              <div class="flex-shrink-0">
                <img
                  v-if="member.avatar"
                  :src="member.avatar"
                  :alt="member.name"
                  class="h-10 w-10 rounded-full"
                >
                <div
                  v-else
                  class="h-10 w-10 rounded-full bg-gray-300 flex items-center justify-center"
                >
                  <span class="text-sm font-medium text-gray-700">
                    {{ getInitials(member.name) }}
                  </span>
                </div>
              </div>
              <div class="ml-4">
                <div class="flex items-center">
                  <p class="text-sm font-medium text-gray-900">{{ member.name }}</p>
                  <span
                    v-if="member.role === 'owner'"
                    class="ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800"
                  >
                    <svg class="-ml-0.5 mr-1.5 h-2 w-2 text-yellow-400" fill="currentColor" viewBox="0 0 8 8">
                      <circle cx="4" cy="4" r="3"></circle>
                    </svg>
                    Propriétaire
                  </span>
                </div>
                <div class="flex items-center mt-1">
                  <p class="text-sm text-gray-500">{{ member.email }}</p>
                  <span class="mx-2 text-gray-300">•</span>
                  <span
                    class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium"
                    :class="getRoleClass(member.role)"
                  >
                    {{ getRoleLabel(member.role) }}
                  </span>
                  <span class="mx-2 text-gray-300">•</span>
                  <span
                    class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium"
                    :class="getStatusClass(member.status)"
                  >
                    {{ getStatusLabel(member.status) }}
                  </span>
                </div>
                <div class="flex items-center mt-1 text-xs text-gray-500">
                  <span>Ajouté le {{ formatDate(member.joined_at) }}</span>
                  <span v-if="member.last_activity" class="mx-2">•</span>
                  <span v-if="member.last_activity">Dernière activité: {{ formatDate(member.last_activity) }}</span>
                </div>
              </div>
            </div>
            <div class="flex items-center space-x-2">
              <!-- Permissions -->
              <button
                @click="showPermissionsModal(member)"
                class="text-gray-400 hover:text-gray-600 transition-colors"
                title="Gérer les permissions"
              >
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"></path>
                </svg>
              </button>
              <!-- Modifier le rôle -->
              <button
                v-if="member.role !== 'owner'"
                @click="showEditRoleModal(member)"
                class="text-gray-400 hover:text-gray-600 transition-colors"
                title="Modifier le rôle"
              >
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path>
                </svg>
              </button>
              <!-- Supprimer -->
              <button
                v-if="member.role !== 'owner'"
                @click="removeMember(member)"
                class="text-red-400 hover:text-red-600 transition-colors"
                title="Retirer du projet"
              >
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
                </svg>
              </button>
            </div>
          </div>
        </li>
      </ul>
      
      <!-- État vide -->
      <div v-if="filteredMembers.length === 0" class="text-center py-12">
        <svg class="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"></path>
        </svg>
        <h3 class="mt-2 text-sm font-medium text-gray-900">Aucun membre trouvé</h3>
        <p class="mt-1 text-sm text-gray-500">Aucun membre ne correspond à vos critères de recherche.</p>
      </div>
    </div>

    <!-- Modal d'invitation -->
    <InviteMemberModal
      v-if="showInviteModal"
      :project-id="projectId"
      @close="showInviteModal = false"
      @invited="onMemberInvited"
    />

    <!-- Modal de modification de rôle -->
    <EditRoleModal
      v-if="showEditRole"
      :member="selectedMember"
      :project-id="projectId"
      @close="showEditRole = false"
      @updated="onRoleUpdated"
    />

    <!-- Modal de permissions -->
    <PermissionsModal
      v-if="showPermissions"
      :member="selectedMember"
      :project-id="projectId"
      @close="showPermissions = false"
      @updated="onPermissionsUpdated"
    />

    <!-- Modal des prestataires disponibles -->
    <AvailableProvidersModal
      v-if="showProvidersModal"
      :project-id="projectId"
      @close="showProvidersModal = false"
      @invited="onProviderInvited"
    />
  </div>
</template>

<script>
import { ref, computed, onMounted } from 'vue'
import { projectManagementService } from '@/services/projectManagementService'
import { useTranslation } from '@/composables/useTranslation'
import InviteMemberModal from './InviteMemberModal.vue'
import EditRoleModal from './EditRoleModal.vue'
import PermissionsModal from './PermissionsModal.vue'
import AvailableProvidersModal from './AvailableProvidersModal.vue'

export default {
  name: 'TeamTab',
  components: {
    InviteMemberModal,
    EditRoleModal,
    PermissionsModal,
    AvailableProvidersModal
  },
  props: {
    projectId: {
      type: [String, Number],
      required: true
    }
  },
  setup(props) {
    const { t } = useTranslation()
    const members = ref([])
    const loading = ref(false)
    const searchQuery = ref('')
    const selectedRole = ref('')
    const selectedStatus = ref('')
    const sortBy = ref('name')
    const showInviteModal = ref(false)
    const showEditRole = ref(false)
    const showPermissions = ref(false)
    const showProvidersModal = ref(false)
    const selectedMember = ref(null)

    const filteredMembers = computed(() => {
      let filtered = [...members.value]

      // Filtrage par recherche
      if (searchQuery.value) {
        const query = searchQuery.value.toLowerCase()
        filtered = filtered.filter(member => 
          member.name.toLowerCase().includes(query) ||
          member.email.toLowerCase().includes(query) ||
          getRoleLabel(member.role).toLowerCase().includes(query)
        )
      }

      // Filtrage par rôle
      if (selectedRole.value) {
        filtered = filtered.filter(member => member.role === selectedRole.value)
      }

      // Filtrage par statut
      if (selectedStatus.value) {
        filtered = filtered.filter(member => member.status === selectedStatus.value)
      }

      // Tri
      filtered.sort((a, b) => {
        switch (sortBy.value) {
          case 'name':
            return a.name.localeCompare(b.name)
          case 'role':
            return a.role.localeCompare(b.role)
          case 'joined_at':
            return new Date(b.joined_at) - new Date(a.joined_at)
          case 'last_activity':
            return new Date(b.last_activity || 0) - new Date(a.last_activity || 0)
          default:
            return 0
        }
      })

      return filtered
    })

    const loadMembers = async () => {
      try {
        loading.value = true
        const response = await projectManagementService.getTeamMembers(props.projectId)
        members.value = response.data
      } catch (error) {
        console.error('Erreur lors du chargement des membres:', error)
      } finally {
        loading.value = false
      }
    }

    const loadAvailableProviders = () => {
      showProvidersModal.value = true
    }

    const showEditRoleModal = (member) => {
      selectedMember.value = member
      showEditRole.value = true
    }

    const showPermissionsModal = (member) => {
      selectedMember.value = member
      showPermissions.value = true
    }

    const removeMember = async (member) => {
      if (!confirm(t('common.confirmations.removeMember', { name: member.name }))) {
        return
      }

      try {
        await projectManagementService.removeTeamMember(props.projectId, member.id)
        await loadMembers()
      } catch (error) {
        console.error('Erreur lors de la suppression du membre:', error)
      }
    }

    const onMemberInvited = () => {
      showInviteModal.value = false
      loadMembers()
    }

    const onProviderInvited = () => {
      showProvidersModal.value = false
      loadMembers()
    }

    const onRoleUpdated = () => {
      showEditRole.value = false
      loadMembers()
    }

    const onPermissionsUpdated = () => {
      showPermissions.value = false
      loadMembers()
    }

    const getInitials = (name) => {
      return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
    }

    const getRoleClass = (role) => {
      const classes = {
        owner: 'bg-yellow-100 text-yellow-800',
        admin: 'bg-red-100 text-red-800',
        manager: 'bg-purple-100 text-purple-800',
        developer: 'bg-blue-100 text-blue-800',
        designer: 'bg-pink-100 text-pink-800',
        tester: 'bg-green-100 text-green-800',
        client: 'bg-orange-100 text-orange-800',
        viewer: 'bg-gray-100 text-gray-800'
      }
      return classes[role] || 'bg-gray-100 text-gray-800'
    }

    const getRoleLabel = (role) => {
      const labels = {
        owner: 'Propriétaire',
        admin: 'Administrateur',
        manager: 'Manager',
        developer: 'Développeur',
        designer: 'Designer',
        tester: 'Testeur',
        client: 'Client',
        viewer: 'Observateur'
      }
      return labels[role] || role
    }

    const getStatusClass = (status) => {
      const classes = {
        active: 'bg-green-100 text-green-800',
        pending: 'bg-yellow-100 text-yellow-800',
        inactive: 'bg-gray-100 text-gray-800'
      }
      return classes[status] || 'bg-gray-100 text-gray-800'
    }

    const getStatusLabel = (status) => {
      const labels = {
        active: 'Actif',
        pending: 'En attente',
        inactive: 'Inactif'
      }
      return labels[status] || status
    }

    const formatDate = (date) => {
      return new Date(date).toLocaleDateString('fr-FR', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      })
    }

    onMounted(() => {
      loadMembers()
    })

    return {
      members,
      loading,
      searchQuery,
      selectedRole,
      selectedStatus,
      sortBy,
      showInviteModal,
      showEditRole,
      showPermissions,
      showProvidersModal,
      selectedMember,
      filteredMembers,
      loadAvailableProviders,
      showEditRoleModal,
      showPermissionsModal,
      removeMember,
      onMemberInvited,
      onProviderInvited,
      onRoleUpdated,
      onPermissionsUpdated,
      getInitials,
      getRoleClass,
      getRoleLabel,
      getStatusClass,
      getStatusLabel,
      formatDate,
      t
    }
  }
}
</script>