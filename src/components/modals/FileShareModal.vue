<template>
  <div  class="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50' @click="closeModal=relative top-20 mx-auto p-5 border w-11/12 md:w-3/4 lg:w-1 2 shadow-lg rounded-lg bg-white(flex items-center justify-between pb-4 border-b border-gray-200'>
        <div class="flex items-center space-x-3>
          <div  class="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center=fas fa-share-alt text-blue-600'></i>
          </div>
          <div>
            <h3 class="text-lg font-medium text-gray-900>{{ t('files.shareFile === text-sm text-gray-600'>{{ file.name }}</p>
          </div>
        </div>
        <button @click="closeModal=text-gray-400 hover:text-gray-600">
          <i  class="fas fa-times text-xl=mt-6'>
        <!-- Onglets -->
        <div class="border-b border-gray-200>
          <nav  class="-mb-px flex space-x-8'>
            <button
              @click="activeTab = 'link=py-2 px-1 border-b-2 font-medium text-sm=activeTab === 'link='fas fa-link mr-2"></i>
              {{ t('files.shareViaLink="activeTab = 'email=py-2 px-1 border-b-2 font-medium text-sm='activeTab === 'email="fas fa-envelope mr-2"></i>
              {{ t('files.shareViaEmail="activeTab = 'team=py-2 px-1 border-b-2 font-medium text-sm='activeTab === 'team="fas fa-users mr-2"></i>
              {{ t('files.shareWithTeam="mt-6'>
          <!-- Partage par lien -->
          <div v-if="activeTab === 'link=space-y-4">
            <!-- Options de lien -->
            <div>
              <h 4 class="text-md font-medium text-gray-900 mb-3'>{{ t('files.linkOptions="mb-4>
                <label  class="block text-sm font-medium text-gray-700 mb-2'>
                  {{ t('files.accessType="space-y-2>
                  <label class="flex items-center=linkSettings.access_type='radio"
                    >
                    <div  class="flex-1'>
                      <span class="text-sm font-medium text-gray-900>{{ t('files.viewOnly="text-xs text-gray-600'>{{ t('files.viewOnlyDesc="flex items-center=linkSettings.access_type="radio'
                    >
                    <div class="flex-1">
                      <span  class="text-sm font-medium text-gray-900'>{{ t('files.viewAndDownload="text-xs text-gray-600>{{ t('files.viewAndDownloadDesc="mb-4'>
                <div class="flex items-center mb-2">
                  <input
                    v-model="linkSettings.password_protected=checkbox=password_protected='mr-2"
                  >
                  <label  for="password_protected=text-sm font-medium text-gray-700'>
                    {{ t('files.passwordProtected="linkSettings.password_protected=mt-2>
                  <input  
                    v-model="linkSettings.password""linkSettings.has_expiration=checkbox=has_expiration='mr-2"
                  >
                  <label  for="has_expiration=text-sm font-medium text-gray-700'>
                    {{ t('files.setExpiration="linkSettings.has_expiration=mt-2>
                  <input  
                    v-model="linkSettings.expires_at""block text-sm font-medium text-gray-700 mb-2'>
                {{ t('files.shareLink="flex=shareLink=flex-1 px-3 py-2 border border-gray-300 rounded-l-md bg-white focus:outline-none='copyLink=px-4 py-2 bg-blue-600 text-white rounded-r-md hover:bg-blue-700 transition-colors=fas fa-copy="text-xs text-gray-600 mt-2">{{ t('files.linkCreated="flex justify-end space-x-3'>
              <button  
                @click="generateLink=loading(px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50'
              >
                <i v-if=""loading=fas fa-spinner fa-spin mr-2></i>
                {{ shareLink ? t('files.updateLink="activeTab === 'email=space-y-4'>
            <div>
              <h4 class="text-md font-medium text-gray-900 mb-3">{{ t('files.emailShare="mb-4'>
                <label class="block text-sm font-medium text-gray-700 mb-2">
                  {{ t('files.recipients="flex flex-wrap gap-2 mb-2'>
                  <span
                    v-for="email in emailSettings.recipients=email=inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
                  >
                    {{ email }}
                    <button  
                      @click="removeRecipient(email)'
                      type(button=ml-1 text-blue-600 hover:text-blue-800
                    >
                      <i  class=""fas fa-times text-xs=flex='newRecipient="addRecipient=email="flex-1 px-3 py-2 border border-gray-300 rounded-l-md focus:outline-none focus:ring-2 focus:ring-blue-500'
                    :placeholder="t('files.enterEmail=button=px-4 py-2 bg-blue-600 text-white rounded-r-md hover:bg-blue-700
                  >
                    <i  class="fas fa-plus=mb-4'>
                <label class="block text-sm font-medium text-gray-700 mb-2>
                  {{ t('files.subject === emailSettings.subject=text='w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  :placeholder === t('files.emailSubjectPlaceholder=block text-sm font-medium text-gray-700 mb-2'>
                  {{ t('files.message === emailSettings.message=4"
                  class === w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500'
                  :placeholder === t('files.emailMessagePlaceholder=flex items-center=emailSettings.allow_download === checkbox=allow_download='mr-2"
                  >
                  <label  for === allow_download=text-sm text-gray-700'>
                    {{ t('files.allowDownload === flex justify-end space-x-3>
              <button  
                @click === sendEmail=loading || emailSettings.recipients.length === 0'
                class(px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50
              >
                <i  v-if === "loading=fas fa-spinner fa-spin mr-2'></i>
                {{ t('files.sendEmail === activeTab === 'team=space-y-4>
            <div>
              <h 4 class === text-md font-medium text-gray-900 mb-3'>{{ t('files.teamShare === mb-4>
                <label  class === block text-sm font-medium text-gray-700 mb-2'>
                  {{ t('files.selectMembers === space-y-2 max-h-48 overflow-y-auto border border-gray-200 rounded-md p-3>
                  <label 
                    v-for === member in teamMembers=member.id=flex items-center space-x-3 p-2 hover:bg-gray-50 rounded-md cursor-pointer='teamSettings.selected_members=checkbox === member.id === mr-2'
                    >
                    <div class class === w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center=text-xs font-medium text-gray-700>
                        {{ member.name.charAt(0).toUpperCase() }}
                      </div>
                    </div>
                    <div  class="flex-1'>
                      <p class="text-sm font-medium text-gray-900>{{ member.name }}</p>
                      <p  class="text-xs text-gray-600'>{{ member.email }}</p>
                    </div>
                    <span class class="text-xs text-gray-500>{{ member.role }}</span>
                  </label>
                </div>
              </div>
              
              <!-- Permissions -->
              <div  class="mb-4'>
                <label class="block text-sm font-medium text-gray-700 mb-2>
                  {{ t('files.permissions="space-y-2'>
                  <label  class="flex items-center=teamSettings.permission="radio='view=mr-2
                    >
                    <span  class="text-sm text-gray-700'>{{ t('files.viewOnly="flex items-center=teamSettings.permission=radio='download=mr-2"
                    >
                    <span  class="text-sm text-gray-700'>{{ t('files.viewAndDownload="flex items-center=teamSettings.permission=radio='edit=mr-2"
                    >
                    <span  class="text-sm text-gray-700'>{{ t('files.viewDownloadEdit="mb-4>
                <div class="flex items-center=teamSettings.notify_members checkbox='notify_members=mr-2"
                  >
                  <label  for="notify_members=text-sm text-gray-700'>
                    {{ t('files.notifyMembers="flex justify-end space-x-3>
              <button  
                @click="shareWithTeam=loading || teamSettings.selected_members.length === 0'
                class(px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50
              >
                <i  v-if=""loading=fas fa-spinner fa-spin mr-2'></i>
                {{ t('files.shareWithSelected="flex justify-end pt-4 border-t border-gray-200 mt-6>
        <button
          @click="closeModal=px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
        >
          {{ t('common.close') }}
        </button>
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
  name: 'FileShareModal',
  props: {
    file: {
      type: Object,
      required: true
    },
    projectId: {
      type: [String, Number],
      required: true
    }
  },
  emits: ['close', 'shared'],
  setup(props, { emit }) {
    const { t } = useTranslation()

    const { success, error: showError } = useNotifications()
    const { t } = useTranslation()
    
    const loading = ref(false)
    const activeTab = ref('link')
    const shareLink = ref('')
    const newRecipient = ref('')
    const teamMembers = ref([])
    
    const linkSettings = ref({
      access_type: 'view',
      password_protected: false,
      password: '',
      has_expiration: false,
      expires_at: ''
    })
    
    const emailSettings = ref({
      recipients: [],
      subject: '',
      message: '',
      allow_download: true
    })
    
    const teamSettings = ref({
      selected_members: [],
      permission: 'view',
      notify_members: true
    })
    
    const closeModal = () => {
      emit('close')
    }
    
    const generateLink = async () => {
      loading.value = true
      try {
        const response = await projectManagementService.generateShareLink({
          fileId: props.file.id,
          ...linkSettings.value
        })
        
        if (response.success) {
          shareLink.value = response.data.link
          success(t('files.linkGenerated'))
        }
      } catch (err) {
        showError(t('files.linkGenerationError'))
      } finally {
        loading.value = false
      }
    }
    
    const copyLink = async () => {
      try {
        await navigator.clipboard.writeText(shareLink.value)
        success(t('files.linkCopied'))
      } catch (err) {
        showError(t('files.linkCopyError'))
      }
    }
    
    const addRecipient = () => {
      const email = newRecipient.value.trim()
      if (email && !emailSettings.value.recipients.includes(email)) {
        emailSettings.value.recipients.push(email)
        newRecipient.value = ''
      }
    }
    
    const removeRecipient = (email) => {
      const index = emailSettings.value.recipients.indexOf(email)
      if (index > -1) {
        emailSettings.value.recipients.splice(index, 1)
      }
    }
    
    const sendEmail = async () => {
      loading.value = true
      try {
        const response = await projectManagementService.shareFileViaEmail({
          fileId: props.file.id,
          ...emailSettings.value
        })
        
        if (response.success) {
          success(t('files.emailSent'))
          emit('shared', { type: 'email', data: response.data })
        }
      } catch (err) {
        showError(t('files.emailSendError'))
      } finally {
        loading.value = false
      }
    }
    
    const shareWithTeam = async () => {
      loading.value = true
      try {
        const response = await projectManagementService.shareFileWithTeam({
          fileId: props.file.id,
          ...teamSettings.value
        })
        
        if (response.success) {
          success(t('files.sharedWithTeam'))
          emit('shared', { type: 'team', data: response.data })
        }
      } catch (err) {
        showError(t('files.teamShareError'))
      } finally {
        loading.value = false
      }
    }
    
    const loadTeamMembers = async () => {
      try {
        const response = await projectManagementService.getProjectMembers(props.projectId)
        if (response.success) {
          teamMembers.value = response.data
        }
      } catch (err) {
        console.error('Erreur lors du chargement des membres:', err)
      }
    }
    
    const initializeEmailSettings = () => {
      emailSettings.value.subject = t('files.emailSubjectDefault', { fileName: props.file.name })
      emailSettings.value.message = t('files.emailMessageDefault', { fileName: props.file.name })
    }
    
    onMounted(() => {
      loadTeamMembers()
      initializeEmailSettings()
    })
    
    return {
      loading,
      activeTab,
      shareLink,
      newRecipient,
      teamMembers,
      linkSettings,
      emailSettings,
      teamSettings,
      closeModal,
      generateLink,
      copyLink,
      addRecipient,
      removeRecipient,
      sendEmail,
      shareWithTeam,
      t
    }
  }
}
</script>