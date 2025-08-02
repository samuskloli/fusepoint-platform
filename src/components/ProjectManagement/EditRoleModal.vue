<template>
  <div class="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50" @click="closeModal">
    <div class="relative top-20 mx-auto p-5 border w-11/12 md:w-1/2 lg:w-1/3 shadow-lg rounded-md bg-white" @click.stop>
      <div class="flex items-center justify-between mb-4">
        <h3 class="text-lg font-medium text-gray-900">Modifier le rôle</h3>
        <button @click="closeModal" class="text-gray-400 hover:text-gray-600">
          <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
          </svg>
        </button>
      </div>

      <form @submit.prevent="updateRole">
        <div class="mb-4">
          <label class="block text-sm font-medium text-gray-700 mb-2">
            Membre: {{ member.name || member.email }}
          </label>
        </div>

        <div class="mb-4">
          <label class="block text-sm font-medium text-gray-700 mb-2">
            Nouveau rôle
          </label>
          <select 
            v-model="selectedRole" 
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

        <div class="mb-6">
          <label class="block text-sm font-medium text-gray-700 mb-2">
            Description du rôle
          </label>
          <div class="text-sm text-gray-600 p-3 bg-gray-50 rounded-md">
            {{ getRoleDescription(selectedRole) }}
          </div>
        </div>

        <div class="flex justify-end space-x-3">
          <button
            type="button"
            @click="closeModal"
            class="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 border border-gray-300 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
          >
            Annuler
          </button>
          <button
            type="submit"
            :disabled="loading || !selectedRole"
            class="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
          >
            <span v-if="loading">Mise à jour...</span>
            <span v-else>Mettre à jour</span>
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<script>
import { ref, computed } from 'vue'
import { projectManagementService } from '@/services/projectManagementService'

export default {
  name: 'EditRoleModal',
  props: {
    member: {
      type: Object,
      required: true
    }
  },
  emits: ['close', 'updated'],
  setup(props, { emit }) {
    const loading = ref(false)
    const selectedRole = ref(props.member.role || '')

    const roleDescriptions = {
      admin: 'Accès complet à toutes les fonctionnalités du projet',
      manager: 'Peut gérer les tâches, les membres et voir les rapports',
      developer: 'Peut gérer les tâches et les fichiers',
      designer: 'Peut gérer les tâches et les fichiers de design',
      tester: 'Peut gérer les tâches de test et voir les rapports',
      client: 'Peut voir le projet et commenter',
      viewer: 'Accès en lecture seule au projet'
    }

    const getRoleDescription = (role) => {
      return roleDescriptions[role] || 'Sélectionnez un rôle pour voir sa description'
    }

    const updateRole = async () => {
      if (!selectedRole.value) return
      
      loading.value = true
      try {
        const response = await projectManagementService.updateMemberRole(props.member.id, selectedRole.value)
        if (response.success) {
          emit('updated', { ...props.member, role: selectedRole.value })
          closeModal()
        } else {
          alert('Erreur lors de la mise à jour du rôle')
        }
      } catch (error) {
        console.error('Erreur:', error)
        alert('Erreur lors de la mise à jour du rôle')
      } finally {
        loading.value = false
      }
    }

    const closeModal = () => {
      emit('close')
    }

    return {
      loading,
      selectedRole,
      getRoleDescription,
      updateRole,
      closeModal
    }
  }
}
</script>