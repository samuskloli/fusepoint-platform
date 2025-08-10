<template>
  <div class="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50" @click="closeModal">
    <div class="relative top-20 mx-auto p-5 border w-11/12 md:w-2/3 lg:w-1/2 shadow-lg rounded-md bg-white" @click.stop>
      <div class="flex items-center justify-between mb-4">
        <h3 class="text-lg font-medium text-gray-900">Gérer les permissions</h3>
        <button @click="closeModal" class="text-gray-400 hover:text-gray-600">
          <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
          </svg>
        </button>
      </div>

      <div class="mb-4">
        <h4 class="text-md font-medium text-gray-800 mb-2">
          Membre: {{ member.name || member.email }}
        </h4>
        <p class="text-sm text-gray-600">Rôle: {{ member.role }}</p>
      </div>

      <form @submit.prevent="updatePermissions">
        <div class="space-y-4">
          <div class="bg-gray-50 p-4 rounded-lg">
            <h5 class="text-sm font-medium text-gray-700 mb-3">Permissions du projet</h5>
            <div class="space-y-3">
              <label class="flex items-center">
                <input
                  type="checkbox"
                  v-model="permissions.can_edit_project"
                  class="rounded border-gray-300 text-blue-600 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
                >
                <span class="ml-2 text-sm text-gray-700">Peut modifier le projet</span>
              </label>
              
              <label class="flex items-center">
                <input
                  type="checkbox"
                  v-model="permissions.can_delete_project"
                  class="rounded border-gray-300 text-blue-600 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
                >
                <span class="ml-2 text-sm text-gray-700">Peut supprimer le projet</span>
              </label>
            </div>
          </div>

          <div class="bg-gray-50 p-4 rounded-lg">
            <h5 class="text-sm font-medium text-gray-700 mb-3">Permissions des tâches</h5>
            <div class="space-y-3">
              <label class="flex items-center">
                <input
                  type="checkbox"
                  v-model="permissions.can_manage_tasks"
                  class="rounded border-gray-300 text-blue-600 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
                >
                <span class="ml-2 text-sm text-gray-700">Peut gérer les tâches</span>
              </label>
              
              <label class="flex items-center">
                <input
                  type="checkbox"
                  v-model="permissions.can_assign_tasks"
                  class="rounded border-gray-300 text-blue-600 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
                >
                <span class="ml-2 text-sm text-gray-700">Peut assigner les tâches</span>
              </label>
            </div>
          </div>

          <div class="bg-gray-50 p-4 rounded-lg">
            <h5 class="text-sm font-medium text-gray-700 mb-3">Permissions des fichiers</h5>
            <div class="space-y-3">
              <label class="flex items-center">
                <input
                  type="checkbox"
                  v-model="permissions.can_manage_files"
                  class="rounded border-gray-300 text-blue-600 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
                >
                <span class="ml-2 text-sm text-gray-700">Peut gérer les fichiers</span>
              </label>
              
              <label class="flex items-center">
                <input
                  type="checkbox"
                  v-model="permissions.can_upload_files"
                  class="rounded border-gray-300 text-blue-600 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
                >
                <span class="ml-2 text-sm text-gray-700">Peut télécharger des fichiers</span>
              </label>
            </div>
          </div>

          <div class="bg-gray-50 p-4 rounded-lg">
            <h5 class="text-sm font-medium text-gray-700 mb-3">Permissions de l'équipe</h5>
            <div class="space-y-3">
              <label class="flex items-center">
                <input
                  type="checkbox"
                  v-model="permissions.can_invite_members"
                  class="rounded border-gray-300 text-blue-600 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
                >
                <span class="ml-2 text-sm text-gray-700">Peut inviter des membres</span>
              </label>
              
              <label class="flex items-center">
                <input
                  type="checkbox"
                  v-model="permissions.can_manage_roles"
                  class="rounded border-gray-300 text-blue-600 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
                >
                <span class="ml-2 text-sm text-gray-700">Peut gérer les rôles</span>
              </label>
            </div>
          </div>

          <div class="bg-gray-50 p-4 rounded-lg">
            <h5 class="text-sm font-medium text-gray-700 mb-3">Permissions des rapports</h5>
            <div class="space-y-3">
              <label class="flex items-center">
                <input
                  type="checkbox"
                  v-model="permissions.can_view_reports"
                  class="rounded border-gray-300 text-blue-600 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
                >
                <span class="ml-2 text-sm text-gray-700">Peut voir les rapports</span>
              </label>
              
              <label class="flex items-center">
                <input
                  type="checkbox"
                  v-model="permissions.can_generate_reports"
                  class="rounded border-gray-300 text-blue-600 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
                >
                <span class="ml-2 text-sm text-gray-700">Peut générer des rapports</span>
              </label>
            </div>
          </div>
        </div>

        <div class="flex justify-end space-x-3 mt-6">
          <button
            type="button"
            @click="closeModal"
            class="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 border border-gray-300 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
          >
            Annuler
          </button>
          <button
            type="submit"
            :disabled="loading"
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
import { ref, reactive, onMounted } from 'vue'
import { projectManagementService } from '@/services/projectManagementService'

export default {
  name: 'PermissionsModal',
  props: {
    member: {
      type: Object,
      required: true
    }
  },
  emits: ['close', 'updated'],
  setup(props, { emit }) {
    const loading = ref(false)
    
    const permissions = reactive({
      can_edit_project: false,
      can_delete_project: false,
      can_manage_tasks: false,
      can_assign_tasks: false,
      can_manage_files: false,
      can_upload_files: false,
      can_invite_members: false,
      can_manage_roles: false,
      can_view_reports: false,
      can_generate_reports: false
    })

    // Initialiser les permissions avec celles du membre
    onMounted(() => {
      if (props.member.permissions) {
        Object.assign(permissions, props.member.permissions)
      }
    })

    const updatePermissions = async () => {
      loading.value = true
      try {
        const response = await projectManagementService.updateMemberPermissions(props.member.id, permissions)
        if (response.success) {
          emit('updated', { ...props.member, permissions: { ...permissions } })
          closeModal()
        } else {
          alert('Erreur lors de la mise à jour des permissions')
        }
      } catch (error) {
        console.error('Erreur:', error)
        alert('Erreur lors de la mise à jour des permissions')
      } finally {
        loading.value = false
      }
    }

    const closeModal = () => {
      emit('close')
    }

    return {
      loading,
      permissions,
      updatePermissions,
      closeModal
    }
  }
}
</script>