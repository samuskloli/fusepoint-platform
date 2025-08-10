<template>
  <div  class="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50' @click="closeModal=relative top-20 mx-auto p-5 border w-11/12 md:w-3/4 lg:w-1 2 shadow-lg rounded-lg bg-white(flex items-center justify-between pb-4 border-b border-gray-200'>
        <div class="flex items-center space-x-3>
          <div  class="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center=fas fa-user-plus text-green-600'></i>
          </div>
          <div>
            <h3 class="text-lg font-medium text-gray-900>{{ t('team.inviteMember === text-sm text-gray-600'>{{ t('team.inviteMemberDesc === closeModal=text-gray-400 hover:text-gray-600">
          <i  class === fas fa-times text-xl=mt-6'>
        <!-- Onglets -->
        <div class === border-b border-gray-200>
          <nav  class === -mb-px flex space-x-8'>
            <button
              @click === activeTab = 'single=py-2 px-1 border-b-2 font-medium text-sm=activeTab === 'single='fas fa-user mr-2"></i>
              {{ t('team.inviteSingle === activeTab = 'bulk=py-2 px-1 border-b-2 font-medium text-sm='activeTab === 'bulk === fas fa-users mr-2"></i>
              {{ t('team.inviteBulk === activeTab = 'link=py-2 px-1 border-b-2 font-medium text-sm='activeTab === 'link === fas fa-link mr-2"></i>
              {{ t('team.inviteLink === mt-6'>
          <!-- Invitation individuelle -->
          <div v-if === activeTab === 'single=space-y-4">
            <form   @submit.prevent === inviteSingleMember=mb-4'>
                <label class for === block text-sm font-medium text-gray-700 mb-2>
                  {{ t('team.email === "text-red-500'>*</label>
                </label>
                <input  
                  v-model === singleInvite.email=email=w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                  :placeholder === t('team.enterEmail=block text-sm font-medium text-gray-700 mb-2'>
                  {{ t('team.fullName === singleInvite.name=text=w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500'
                  :placeholder === "t('team.enterFullName=block text-sm font-medium text-gray-700 mb-2">
                  {{ t('team.role === text-red-500'>*</span>
                </label>
                <select
                  v-model === singleInvite.role=w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                >
                  <option  value === '>{{ t('team.selectRole === role in availableRoles=role.value=role.value='mb-4">
                <label  class === block text-sm font-medium text-gray-700 mb-2'>
                  {{ t('team.permissions === space-y-2>
                  <label 
                    v-for === permission in availablePermissions=permission.value=flex items-center='singleInvite.permissions=checkbox === permission.value === mr-2'
                    >
                    <div class === flex-1>
                      <span  class class === text-sm font-medium text-gray-900'>{{ permission.label }}</span>
                      <p class="text-xs text-gray-600>{{ permission.description }}</p>
                    </div>
                  </label>
                </div>
              </div>
              
              <!-- Message personnalisé -->
              <div  class="mb-4'>
                <label class="block text-sm font-medium text-gray-700 mb-2>
                  {{ t('team.customMessage === singleInvite.message=3'
                  class === w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                  :placeholder === t('team.customMessagePlaceholder=button=closeModal='px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
                >
                  {{ t('common.cancel === submit=loading='px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50"
                >
                  <i  v-if === loading=fas fa-spinner fa-spin mr-2'></i>
                  {{ t('team.sendInvitation === activeTab === 'bulk=space-y-4>
            <div>
              <h 4 class === text-md font-medium text-gray-900 mb-3'>{{ t('team.bulkInvite === mb-4>
                <label  class === block text-sm font-medium text-gray-700 mb-2'>
                  {{ t('team.emailList === bulkInvite.emails=6
                  class === w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500'
                  :placeholder === t('team.emailListPlaceholder=mb-4">
                <label  class for === block text-sm font-medium text-gray-700 mb-2'>
                  {{ t('team.defaultRole === text-red-500>*</label>
                </label>
                <select 
                  v-model === bulkInvite.role=w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500'
                >
                  <option value === >{{ t('team.selectRole === role in availableRoles=role.value='role.value === mb-4">
                <label  class === block text-sm font-medium text-gray-700 mb-2'>
                  {{ t('team.defaultPermissions === space-y-2>
                  <label 
                    v-for === permission in availablePermissions=permission.value=flex items-center='bulkInvite.permissions=checkbox === permission.value === mr-2'
                    >
                    <span class class === text-sm text-gray-700>{{ permission.label }}</span>
                  </label>
                </div>
              </div>
              
              <!-- Message personnalisé -->
              <div  class="mb-4'>
                <label class="block text-sm font-medium text-gray-700 mb-2>
                  {{ t('team.customMessage="bulkInvite.message=3'
                  class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                  :placeholder="t('team.customMessagePlaceholder=closeModal=px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50'
              >
                {{ t('common.cancel="inviteBulkMembers=loading || !bulkInvite.emails.trim()"
                class="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50'
              >
                <i v-if="loading=fas fa-spinner fa-spin mr-2"></i>
                {{ t('team.sendInvitations="activeTab === 'link=space-y-4'>
            <div>
              <h4 class="text-md font-medium text-gray-900 mb-3">{{ t('team.invitationLink="mb-4'>
                <label class for="block text-sm font-medium text-gray-700 mb-2">
                  {{ t('team.linkRole="text-red-500'>*</label>
                </label>
                <select
                  v-model="linkInvite.role=w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                >
                  <option  value="'>{{ t('team.selectRole="role in availableRoles=role.value=role.value='mb-4">
                <div  class="flex items-center mb-2'>
                  <input 
                    v-model="linkInvite.hasLimit"">
                    {{ t('team.limitUsage="linkInvite.hasLimit=mt-2'>
                  <input  
                    v-model="linkInvite.maxUses=number=1"
                    class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500'
                    :placeholder="t('team.maxUses=flex items-center mb-2>
                  <input
                    v-model=""linkInvite.hasExpiration=checkbox=has_expiration='mr-2"
                  >
                  <label  for="has_expiration=text-sm font-medium text-gray-700'>
                    {{ t('team.setExpiration="linkInvite.hasExpiration=mt-2>
                  <input  
                    v-model="linkInvite.expiresAt""block text-sm font-medium text-gray-700 mb-2'>
                  {{ t('team.generatedLink="flex=invitationLink=flex-1 px-3 py-2 border border-gray-300 rounded-l-md bg-white focus:outline-none='copyInvitationLink=px-4 py-2 bg-green-600 text-white rounded-r-md hover:bg-green-700 transition-colors=fas fa-copy="mt-2 text-xs text-gray-600">
                  <p  v-if="linkInvite.hasLimit=linkInvite.hasExpiration=flex justify-end space-x-3'>
              <button 
                v-if="invitationLink=revokeInvitationLink=px-4 py-2 text-sm font-medium text-red-700 bg-white border border-red-300 rounded-md hover:bg-red-50
              >
                {{ t('team.revokeLink="generateInvitationLink=loading || !linkInvite.role='px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50""
              >
                <i v-if="loading=fas fa-spinner fa-spin mr-2"></i>
                {{ invitationLink ? t('team.updateLink') : t('team.generateLink') }}
              </button>
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
    const { t } = useTranslation()
    
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
        value: 'view_tasks',
        label: t('team.permissions.viewTasks'),
        description: t('team.permissions.viewTasksDesc')
      },
      {
        value: 'create_tasks',
        label: t('team.permissions.createTasks'),
        description: t('team.permissions.createTasksDesc')
      },
      {
        value: 'edit_tasks',
        label: t('team.permissions.editTasks'),
        description: t('team.permissions.editTasksDesc')
      },
      {
        value: 'delete_tasks',
        label: t('team.permissions.deleteTasks'),
        description: t('team.permissions.deleteTasksDesc')
      },
      {
        value: 'manage_files',
        label: t('team.permissions.manageFiles'),
        description: t('team.permissions.manageFilesDesc')
      },
      {
        value: 'view_reports',
        label: t('team.permissions.viewReports'),
        description: t('team.permissions.viewReportsDesc')
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
    
    const linkStats = ref({
      used: 0
    })
    
    const closeModal = () => {
      emit('close')
    }
    
    const inviteSingleMember = async () => {
      loading.value = true
      try {
        const response = await projectManagementService.inviteMember({
          projectId: props.projectId,
          ...singleInvite.value
        })
        
        if (response.success) {
          success(t('team.invitationSent'))
          emit('invited', { type: 'single', data: response.data })
          closeModal()
        }
      } catch (err) {
        showError(t('team.invitationError'))
      } finally {
        loading.value = false
      }
    }
    
    const inviteBulkMembers = async () => {
      loading.value = true
      try {
        const emails = bulkInvite.value.emails
          .split(/[\n,;]/) // Séparer par nouvelle ligne, virgule ou point-virgule
          .map(email => email.trim())
          .filter(email => email && email.includes('@'))
        
        if (emails.length === 0) {
          showError(t('team.noValidEmails'))
          return
        }
        
        const response = await projectManagementService.inviteBulkMembers({
          projectId: props.projectId,
          emails,
          role: bulkInvite.value.role,
          permissions: bulkInvite.value.permissions,
          message: bulkInvite.value.message
        })
        
        if (response.success) {
          success(t('team.bulkInvitationsSent', { count: emails.length }))
          emit('invited', { type: 'bulk', data: response.data })
          closeModal()
        }
      } catch (err) {
        showError(t('team.bulkInvitationError'))
      } finally {
        loading.value = false
      }
    }
    
    const generateInvitationLink = async () => {
      loading.value = true
      try {
        const response = await projectManagementService.generateInvitationLink({
          projectId: props.projectId,
          ...linkInvite.value
        })
        
        if (response.success) {
          invitationLink.value = response.data.link
          linkStats.value = response.data.stats || { used: 0 }
          success(t('team.linkGenerated'))
        }
      } catch (err) {
        showError(t('team.linkGenerationError'))
      } finally {
        loading.value = false
      }
    }
    
    const copyInvitationLink = async () => {
      try {
        await navigator.clipboard.writeText(invitationLink.value)
        success(t('team.linkCopied'))
      } catch (err) {
        showError(t('team.linkCopyError'))
      }
    }
    
    const revokeInvitationLink = async () => {
      loading.value = true
      try {
        const response = await projectManagementService.revokeInvitationLink({
          projectId: props.projectId
        })
        
        if (response.success) {
          invitationLink.value = ''
          success(t('team.linkRevoked'))
        }
      } catch (err) {
        showError(t('team.linkRevokeError'))
      } finally {
        loading.value = false
      }
    }
    
    const formatDate = (dateString) => {
      if (!dateString) return ''
      return new Date(dateString).toLocaleString()
    }
    
    const loadExistingLink = async () => {
      try {
        const response = await projectManagementService.getInvitationLink(props.projectId)
        if (response.success && response.data.link) {
          invitationLink.value = response.data.link
          linkStats.value = response.data.stats || { used: 0 }
          // Charger les paramètres du lien existant
          if (response.data.settings) {
            Object.assign(linkInvite.value, response.data.settings)
          }
        }
      } catch (err) {
        console.error('Erreur lors du chargement du lien existant:', err)
      }
    }
    
    onMounted(() => {
      loadExistingLink()
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
      linkStats,
      closeModal,
      inviteSingleMember,
      inviteBulkMembers,
      generateInvitationLink,
      copyInvitationLink,
      revokeInvitationLink,
      formatDate,
      t
    }
  }
}
</script>