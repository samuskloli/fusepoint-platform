<template>
  <div class="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50" @click="closeModal">
    <div class="relative top-20 mx-auto p-5 border w-11/12 md:w-3/4 lg:w-1/2 shadow-lg rounded-lg bg-white" @click.stop>
      <!-- En-tête -->
      <div class="flex items-center justify-between pb-4 border-b border-gray-200">
        <div class="flex items-center space-x-3">
          <div class="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
            <i class="fas fa-user-plus text-green-600"></i>
          </div>
          <div>
            <h3 class="text-lg font-medium text-gray-900">{{ t('team.inviteMember') }}</h3>
            <p class="text-sm text-gray-600">{{ t('team.inviteMemberDesc') }}</p>
          </div>
        </div>
        <button @click="closeModal" class="text-gray-400 hover:text-gray-600">
          <i class="fas fa-times text-xl"></i>
        </button>
      </div>

      <div class="mt-6">
        <!-- Onglets -->
        <div class="border-b border-gray-200">
          <nav class="-mb-px flex space-x-8">
            <button
              type="button"
              @click="activeTab = 'single'"
              class="py-2 px-1 border-b-2 font-medium text-sm"
              :class="activeTab === 'single' ? 'border-green-500 text-green-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'"
            >
              <i class="fas fa-user mr-2"></i>
              {{ t('team.inviteSingle') }}
            </button>
            <button
              type="button"
              @click="activeTab = 'bulk'"
              class="py-2 px-1 border-b-2 font-medium text-sm"
              :class="activeTab === 'bulk' ? 'border-green-500 text-green-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'"
            >
              <i class="fas fa-users mr-2"></i>
              {{ t('team.inviteBulk') }}
            </button>
            <button
              type="button"
              @click="activeTab = 'link'"
              class="py-2 px-1 border-b-2 font-medium text-sm"
              :class="activeTab === 'link' ? 'border-green-500 text-green-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'"
            >
              <i class="fas fa-link mr-2"></i>
              {{ t('team.inviteLink') }}
            </button>
          </nav>
        </div>

        <div class="mt-6">
          <!-- Invitation individuelle -->
          <div v-if="activeTab === 'single'" class="space-y-4">
            <form @submit.prevent="inviteSingleMember">
              <!-- Email -->
              <div class="mb-4">
                <label class="block text-sm font-medium text-gray-700 mb-2">
                  {{ t('team.email') }}
                  <span class="text-red-500">*</span>
                </label>
                <input  
                  v-model="singleInvite.email"
                  type="email"
                  required
                  class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                  :placeholder="t('team.enterEmail')"
                />
              </div>

              <!-- Nom complet -->
              <div class="mb-4">
                <label class="block text-sm font-medium text-gray-700 mb-2">
                  {{ t('team.fullName') }}
                </label>
                <input
                  v-model="singleInvite.name"
                  type="text"
                  class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                  :placeholder="t('team.enterFullName')"
                />
              </div>

              <!-- Rôle -->
              <div class="mb-4">
                <label class="block text-sm font-medium text-gray-700 mb-2">
                  {{ t('team.role') }}
                  <span class="text-red-500">*</span>
                </label>
                <select
                  v-model="singleInvite.role"
                  required
                  class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                >
                  <option value="">{{ t('team.selectRole') }}</option>
                  <option v-for="role in availableRoles" :key="role.value" :value="role.value">
                    {{ role.label }}
                  </option>
                </select>
              </div>

              <!-- Permissions -->
              <div class="mb-4">
                <label class="block text-sm font-medium text-gray-700 mb-2">
                  {{ t('team.permissions') }}
                </label>
                <div class="space-y-2">
                  <label 
                    v-for="permission in availablePermissions"
                    :key="permission.value"
                    class="flex items-center"
                  >
                    <input
                      v-model="singleInvite.permissions"
                      type="checkbox"
                      :value="permission.value"
                      class="mr-2"
                    >
                    <div class="flex-1">
                      <span class="text-sm font-medium text-gray-900">{{ permission.label }}</span>
                      <p class="text-xs text-gray-600">{{ permission.description }}</p>
                    </div>
                  </label>
                </div>
              </div>
              
              <!-- Message personnalisé -->
              <div class="mb-4">
                <label class="block text-sm font-medium text-gray-700 mb-2">
                  {{ t('team.customMessage') }}
                </label>
                <textarea
                  v-model="singleInvite.message"
                  rows="3"
                  class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                  :placeholder="t('team.customMessagePlaceholder')"
                ></textarea>
              </div>

              <!-- Actions -->
              <div class="flex justify-end space-x-3">
                <button
                  type="button"
                  @click="closeModal"
                  class="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
                >
                  {{ t('common.cancel') }}
                </button>
                <button
                  type="submit"
                  :disabled="loading"
                  class="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50"
                >
                  <i v-if="loading" class="fas fa-spinner fa-spin mr-2"></i>
                  {{ t('team.sendInvitation') }}
                </button>
              </div>
            </form>
          </div>

          <!-- Invitation en masse -->
          <div v-if="activeTab === 'bulk'" class="space-y-4">
            <div>
              <h4 class="text-md font-medium text-gray-900 mb-3">{{ t('team.bulkInvite') }}</h4>
              
              <!-- Liste d'emails -->
              <div class="mb-4">
                <label class="block text-sm font-medium text-gray-700 mb-2">
                  {{ t('team.emailList') }}
                </label>
                <textarea
                  v-model="bulkInvite.emails"
                  rows="6"
                  class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                  :placeholder="t('team.emailListPlaceholder')"
                ></textarea>
              </div>

              <!-- Rôle par défaut -->
              <div class="mb-4">
                <label class="block text-sm font-medium text-gray-700 mb-2">
                  {{ t('team.defaultRole') }}
                  <span class="text-red-500">*</span>
                </label>
                <select 
                  v-model="bulkInvite.role"
                  required
                  class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                >
                  <option value="">{{ t('team.selectRole') }}</option>
                  <option v-for="role in availableRoles" :key="role.value" :value="role.value">
                    {{ role.label }}
                  </option>
                </select>
              </div>

              <!-- Permissions par défaut -->
              <div class="mb-4">
                <label class="block text-sm font-medium text-gray-700 mb-2">
                  {{ t('team.defaultPermissions') }}
                </label>
                <div class="space-y-2">
                  <label 
                    v-for="permission in availablePermissions"
                    :key="permission.value"
                    class="flex items-center"
                  >
                    <input
                      v-model="bulkInvite.permissions"
                      type="checkbox"
                      :value="permission.value"
                      class="mr-2"
                    >
                    <span class="text-sm text-gray-700">{{ permission.label }}</span>
                  </label>
                </div>
              </div>
              
              <!-- Message personnalisé -->
              <div class="mb-4">
                <label class="block text-sm font-medium text-gray-700 mb-2">
                  {{ t('team.customMessage') }}
                </label>
                <textarea
                  v-model="bulkInvite.message"
                  rows="3"
                  class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                  :placeholder="t('team.customMessagePlaceholder')"
                ></textarea>
              </div>

              <!-- Actions -->
              <div class="flex justify-end space-x-3">
                <button
                  type="button"
                  @click="closeModal"
                  class="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
                >
                  {{ t('common.cancel') }}
                </button>
                <button
                  type="button"
                  @click="inviteBulkMembers"
                  :disabled="loading || !bulkInvite.emails.trim()"
                  class="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50"
                >
                  <i v-if="loading" class="fas fa-spinner fa-spin mr-2"></i>
                  {{ t('team.sendInvitations') }}
                </button>
              </div>
            </div>
          </div>

          <!-- Lien d'invitation -->
          <div v-if="activeTab === 'link'" class="space-y-4">
            <div>
              <h4 class="text-md font-medium text-gray-900 mb-3">{{ t('team.invitationLink') }}</h4>
              
              <!-- Rôle pour le lien -->
              <div class="mb-4">
                <label class="block text-sm font-medium text-gray-700 mb-2">
                  {{ t('team.linkRole') }}
                  <span class="text-red-500">*</span>
                </label>
                <select
                  v-model="linkInvite.role"
                  required
                  class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                >
                  <option value="">{{ t('team.selectRole') }}</option>
                  <option v-for="role in availableRoles" :key="role.value" :value="role.value">
                    {{ role.label }}
                  </option>
                </select>
              </div>

              <!-- Limite d'utilisation -->
              <div class="mb-4">
                <div class="flex items-center mb-2">
                  <input 
                    v-model="linkInvite.hasLimit"
                    type="checkbox"
                    id="has_limit"
                    class="mr-2"
                  >
                  <label for="has_limit" class="text-sm font-medium text-gray-700">
                    {{ t('team.limitUsage') }}
                  </label>
                </div>
                <div v-if="linkInvite.hasLimit" class="mt-2">
                  <input  
                    v-model="linkInvite.maxUses"
                    type="number"
                    min="1"
                    class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                    :placeholder="t('team.maxUses')"
                  />
                </div>
              </div>

              <!-- Date d'expiration -->
              <div class="mb-4">
                <div class="flex items-center mb-2">
                  <input
                    v-model="linkInvite.hasExpiration"
                    type="checkbox"
                    id="has_expiration"
                    class="mr-2"
                  >
                  <label for="has_expiration" class="text-sm font-medium text-gray-700">
                    {{ t('team.setExpiration') }}
                  </label>
                </div>
                <div v-if="linkInvite.hasExpiration" class="mt-2">
                  <input  
                    v-model="linkInvite.expiresAt"
                    type="datetime-local"
                    class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                  />
                </div>
              </div>

              <!-- Lien généré -->
              <div v-if="invitationLink" class="mb-4">
                <label class="block text-sm font-medium text-gray-700 mb-2">
                  {{ t('team.generatedLink') }}
                </label>
                <div class="flex">
                  <input
                    :value="invitationLink"
                    readonly
                    class="flex-1 px-3 py-2 border border-gray-300 rounded-l-md bg-white focus:outline-none"
                  />
                  <button
                    type="button"
                    @click="copyInvitationLink"
                    class="px-4 py-2 bg-green-600 text-white rounded-r-md hover:bg-green-700 transition-colors"
                  >
                    <i class="fas fa-copy"></i>
                  </button>
                </div>
                <p class="mt-2 text-xs text-gray-600">
                  <span v-if="linkInvite.hasLimit">{{ t('team.linkUsageLimit', { max: linkInvite.maxUses }) }}</span>
                  <span v-if="linkInvite.hasExpiration">{{ t('team.linkExpiration', { date: linkInvite.expiresAt }) }}</span>
                </p>
              </div>

              <!-- Actions -->
              <div class="flex justify-end space-x-3">
                <button 
                  v-if="invitationLink"
                  type="button"
                  @click="revokeInvitationLink"
                  class="px-4 py-2 text-sm font-medium text-red-700 bg-white border border-red-300 rounded-md hover:bg-red-50"
                >
                  {{ t('team.revokeLink') }}
                </button>
                <button
                  type="button"
                  @click="generateInvitationLink"
                  :disabled="loading || !linkInvite.role"
                  class="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50"
                >
                  <i v-if="loading" class="fas fa-spinner fa-spin mr-2"></i>
                  {{ invitationLink ? t('team.updateLink') : t('team.generateLink') }}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, onMounted } from 'vue'
import projectManagementService from '@/services/projectManagementService'
import { useTranslation } from '@/composables/useTranslation'
import { useNotifications } from '@/composables/useNotifications'

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
    const { t } = useTranslation()
    const { success, error: showError } = useNotifications()
    
    const loading = ref(false)
    const activeTab = ref('single')
    const invitationLink = ref('')
    
    const availableRoles = ref([
      { value: 'member', label: t('team.roles.member') },
      { value: 'manager', label: t('team.roles.manager') },
      { value: 'admin', label: t('team.roles.admin') }
    ])
    
    const availablePermissions = ref([
      {
        value: 'view_project',
        label: t('permissions.viewProject'),
        description: t('permissions.viewProjectDesc')
      },
      {
        value: 'edit_project',
        label: t('permissions.editProject'),
        description: t('permissions.editProjectDesc')
      },
      {
        value: 'manage_tasks',
        label: t('permissions.manageTasks'),
        description: t('permissions.manageTasksDesc')
      },
      {
        value: 'manage_team',
        label: t('permissions.manageTeam'),
        description: t('permissions.manageTeamDesc')
      },
      {
        value: 'view_reports',
        label: t('permissions.viewReports'),
        description: t('permissions.viewReportsDesc')
      },
      {
        value: 'manage_files',
        label: t('permissions.manageFiles'),
        description: t('permissions.manageFilesDesc')
      }
    ])
    
    const singleInvite = ref({
      email: '',
      name: '',
      role: '',
      permissions: [],
      message: ''
    })
    
    const bulkInvite = ref({
      emails: '',
      role: '',
      permissions: [],
      message: ''
    })
    
    const linkInvite = ref({
      role: '',
      hasLimit: false,
      maxUses: 10,
      hasExpiration: false,
      expiresAt: ''
    })
    
    // Methods
    const closeModal = () => {
      emit('close')
    }
    
    const inviteSingleMember = async () => {
      try {
        loading.value = true
        
        const response = await projectManagementService.inviteMember(props.projectId, singleInvite.value)
        
        if (response.success) {
          success(t('team.invitationSent'))
          emit('invited', response.data)
          resetSingleForm()
          closeModal()
        } else {
          showError(response.message || t('errors.inviteMember'))
        }
      } catch (error) {
        console.error('Erreur lors de l\'invitation du membre:', error)
        showError(t('errors.inviteMember'))
      } finally {
        loading.value = false
      }
    }
    
    const inviteBulkMembers = async () => {
      try {
        loading.value = true
        
        const emails = bulkInvite.value.emails
          .split('\n')
          .map(email => email.trim())
          .filter(email => email && email.includes('@'))
        
        if (emails.length === 0) {
          showError(t('team.noValidEmails'))
          return
        }
        
        const inviteData = {
          emails,
          role: bulkInvite.value.role,
          permissions: bulkInvite.value.permissions,
          message: bulkInvite.value.message
        }
        
        const response = await projectManagementService.inviteBulkMembers(props.projectId, inviteData)
        
        if (response.success) {
          success(t('team.bulkInvitationsSent', { count: emails.length }))
          emit('invited', response.data)
          resetBulkForm()
          closeModal()
        } else {
          showError(response.message || t('errors.inviteBulkMembers'))
        }
      } catch (error) {
        console.error('Erreur lors de l\'invitation en masse:', error)
        showError(t('errors.inviteBulkMembers'))
      } finally {
        loading.value = false
      }
    }
    
    const generateInvitationLink = async () => {
      try {
        loading.value = true
        
        const linkData = {
          role: linkInvite.value.role,
          maxUses: linkInvite.value.hasLimit ? linkInvite.value.maxUses : null,
          expiresAt: linkInvite.value.hasExpiration ? linkInvite.value.expiresAt : null
        }
        
        const response = await projectManagementService.generateInvitationLink(props.projectId, linkData)
        
        if (response.success) {
          invitationLink.value = response.data.link
          success(t('team.linkGenerated'))
        } else {
          showError(response.message || t('errors.generateLink'))
        }
      } catch (error) {
        console.error('Erreur lors de la génération du lien:', error)
        showError(t('errors.generateLink'))
      } finally {
        loading.value = false
      }
    }
    
    const copyInvitationLink = async () => {
      try {
        await navigator.clipboard.writeText(invitationLink.value)
        success(t('team.linkCopied'))
      } catch (error) {
        console.error('Erreur lors de la copie:', error)
        showError(t('errors.copyLink'))
      }
    }
    
    const revokeInvitationLink = async () => {
      try {
        loading.value = true
        
        const response = await projectManagementService.revokeInvitationLink(props.projectId, invitationLink.value)
        
        if (response.success) {
          invitationLink.value = ''
          success(t('team.linkRevoked'))
        } else {
          showError(response.message || t('errors.revokeLink'))
        }
      } catch (error) {
        console.error('Erreur lors de la révocation du lien:', error)
        showError(t('errors.revokeLink'))
      } finally {
        loading.value = false
      }
    }
    
    const resetSingleForm = () => {
      singleInvite.value = {
        email: '',
        name: '',
        role: '',
        permissions: [],
        message: ''
      }
    }
    
    const resetBulkForm = () => {
      bulkInvite.value = {
        emails: '',
        role: '',
        permissions: [],
        message: ''
      }
    }
    
    const resetLinkForm = () => {
      linkInvite.value = {
        role: '',
        hasLimit: false,
        maxUses: 10,
        hasExpiration: false,
        expiresAt: ''
      }
      invitationLink.value = ''
    }
    
    // Lifecycle
    onMounted(() => {
      // Initialisation si nécessaire
    })
    
    return {
      loading,
      activeTab,
      invitationLink,
      availableRoles,
      availablePermissions,
      singleInvite,
      bulkInvite,
      linkInvite,
      closeModal,
      inviteSingleMember,
      inviteBulkMembers,
      generateInvitationLink,
      copyInvitationLink,
      revokeInvitationLink,
      t
    }
  }
}
</script>

<style scoped>
/* Styles spécifiques au composant */
</style>