<template>
  <div class="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50" @click="closeModal">
    <div class="relative top-20 mx-auto p-5 border w-11/12 md:w-3/4 lg:w-1/2 shadow-lg rounded-lg bg-white" @click.stop>
      <div class="flex items-center justify-between pb-4 border-b border-gray-200">
        <div class="flex items-center space-x-3">
          <div class="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
            <i class="fas fa-share-alt text-blue-600"></i>
          </div>
          <div>
            <h3 class="text-lg font-medium text-gray-900">{{ t('files.shareFile') }}</h3>
            <p class="text-sm text-gray-600">{{ file.name }}</p>
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
              @click="activeTab = 'link'"
              :class="['py-2 px-1 border-b-2 font-medium text-sm', activeTab === 'link' ? 'border-blue-500 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700']"
            >
              <i class="fas fa-link mr-2"></i>
              {{ t('files.shareViaLink') }}
            </button>
            <button
              @click="activeTab = 'email'"
              :class="['py-2 px-1 border-b-2 font-medium text-sm', activeTab === 'email' ? 'border-blue-500 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700']"
            >
              <i class="fas fa-envelope mr-2"></i>
              {{ t('files.shareViaEmail') }}
            </button>
            <button
              @click="activeTab = 'team'"
              :class="['py-2 px-1 border-b-2 font-medium text-sm', activeTab === 'team' ? 'border-blue-500 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700']"
            >
              <i class="fas fa-users mr-2"></i>
              {{ t('files.shareWithTeam') }}
            </button>
          </nav>
        </div>
        
        <div class="mt-6">
          <!-- Partage par lien -->
          <div v-if="activeTab === 'link'" class="space-y-4">
            <!-- Options de lien -->
            <div>
              <h4 class="text-md font-medium text-gray-900 mb-3">{{ t('files.linkOptions') }}</h4>
              <div class="mb-4">
                <label class="block text-sm font-medium text-gray-700 mb-2">
                  {{ t('files.accessType') }}
                </label>
                <div class="space-y-2">
                  <label class="flex items-center">
                    <input
                      v-model="linkSettings.access_type"
                      type="radio"
                      value="view"
                      class="mr-2"
                    >
                    <div class="flex-1">
                      <span class="text-sm font-medium text-gray-900">{{ t('files.viewOnly') }}</span>
                      <p class="text-xs text-gray-600">{{ t('files.viewOnlyDesc') }}</p>
                    </div>
                  </label>
                  <label class="flex items-center">
                    <input
                      v-model="linkSettings.access_type"
                      type="radio"
                      value="download"
                      class="mr-2"
                    >
                    <div class="flex-1">
                      <span class="text-sm font-medium text-gray-900">{{ t('files.viewAndDownload') }}</span>
                      <p class="text-xs text-gray-600">{{ t('files.viewAndDownloadDesc') }}</p>
                    </div>
                  </label>
                </div>
              </div>
              
              <div class="mb-4">
                <div class="flex items-center mb-2">
                  <input
                    v-model="linkSettings.password_protected"
                    type="checkbox"
                    id="password_protected"
                    class="mr-2"
                  >
                  <label for="password_protected" class="text-sm font-medium text-gray-700">
                    {{ t('files.passwordProtected') }}
                  </label>
                </div>
                <div v-if="linkSettings.password_protected" class="mt-2">
                  <input
                    v-model="linkSettings.password"
                    type="password"
                    class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    :placeholder="t('files.enterPassword')"
                  >
                </div>
                
                <div class="flex items-center mb-2">
                  <input
                    v-model="linkSettings.has_expiration"
                    type="checkbox"
                    id="has_expiration"
                    class="mr-2"
                  >
                  <label for="has_expiration" class="text-sm font-medium text-gray-700">
                    {{ t('files.setExpiration') }}
                  </label>
                </div>
                <div v-if="linkSettings.has_expiration" class="mt-2">
                  <input
                    v-model="linkSettings.expires_at"
                    type="datetime-local"
                    class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                </div>
              </div>
              
              <!-- Lien généré -->
              <div v-if="shareLink">
                <label class="block text-sm font-medium text-gray-700 mb-2">
                  {{ t('files.shareLink') }}
                </label>
                <div class="flex">
                  <input
                    :value="shareLink"
                    readonly
                    class="flex-1 px-3 py-2 border border-gray-300 rounded-l-md bg-white focus:outline-none"
                  >
                  <button
                    @click="copyLink"
                    class="px-4 py-2 bg-blue-600 text-white rounded-r-md hover:bg-blue-700 transition-colors"
                  >
                    <i class="fas fa-copy"></i>
                  </button>
                </div>
                <p class="text-xs text-gray-600 mt-2">{{ t('files.linkCreated') }}</p>
              </div>
              
              <div class="flex justify-end space-x-3">
                <button
                  @click="generateLink"
                  :disabled="loading"
                  class="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
                >
                  <i v-if="loading" class="fas fa-spinner fa-spin mr-2"></i>
                  {{ shareLink ? t('files.updateLink') : t('files.generateLink') }}
                </button>
              </div>
            </div>
          </div>
          
          <!-- Partage par email -->
          <div v-if="activeTab === 'email'" class="space-y-4">
            <div>
              <h4 class="text-md font-medium text-gray-900 mb-3">{{ t('files.emailShare') }}</h4>
              <div class="mb-4">
                <label class="block text-sm font-medium text-gray-700 mb-2">
                  {{ t('files.recipients') }}
                </label>
                <div class="flex flex-wrap gap-2 mb-2">
                  <span
                    v-for="email in emailSettings.recipients"
                    :key="email"
                    class="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
                  >
                    {{ email }}
                    <button  
                      @click="removeRecipient(email)"
                      type="button"
                      class="ml-1 text-blue-600 hover:text-blue-800"
                    >
                      <i class="fas fa-times text-xs"></i>
                    </button>
                  </span>
                </div>
                <div class="flex">
                  <input
                    v-model="newRecipient"
                    @keyup.enter="addRecipient"
                    type="email"
                    class="flex-1 px-3 py-2 border border-gray-300 rounded-l-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    :placeholder="t('files.enterEmail')"
                  >
                  <button
                    @click="addRecipient"
                    type="button"
                    class="px-4 py-2 bg-blue-600 text-white rounded-r-md hover:bg-blue-700"
                  >
                    <i class="fas fa-plus"></i>
                  </button>
                </div>
              </div>
              
              <div class="mb-4">
                <label class="block text-sm font-medium text-gray-700 mb-2">
                  {{ t('files.subject') }}
                </label>
                <input
                  v-model="emailSettings.subject"
                  type="text"
                  class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  :placeholder="t('files.emailSubjectPlaceholder')"
                >
              </div>
              
              <div class="mb-4">
                <label class="block text-sm font-medium text-gray-700 mb-2">
                  {{ t('files.message') }}
                </label>
                <textarea
                  v-model="emailSettings.message"
                  rows="4"
                  class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  :placeholder="t('files.emailMessagePlaceholder')"
                ></textarea>
              </div>
              
              <div class="mb-4">
                <div class="flex items-center">
                  <input
                    v-model="emailSettings.allow_download"
                    type="checkbox"
                    id="allow_download"
                    class="mr-2"
                  >
                  <label for="allow_download" class="text-sm text-gray-700">
                    {{ t('files.allowDownload') }}
                  </label>
                </div>
              </div>
              
              <div class="flex justify-end space-x-3">
                <button  
                  @click="sendEmail"
                  :disabled="loading || emailSettings.recipients.length === 0"
                  class="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
                >
                  <i v-if="loading" class="fas fa-spinner fa-spin mr-2"></i>
                  {{ t('files.sendEmail') }}
                </button>
               </div>
             </div>
           </div>
           
           <!-- Partage d'équipe -->
           <div v-if="activeTab === 'team'" class="space-y-4">
             <div>
               <h4 class="text-md font-medium text-gray-900 mb-3">{{ t('files.teamShare') }}</h4>
               <div class="mb-4">
                  <label class="block text-sm font-medium text-gray-700 mb-2">
                    {{ t('files.selectMembers') }}
                  </label>
                  <div class="space-y-2 max-h-48 overflow-y-auto border border-gray-200 rounded-md p-3">
                     <label
                       v-for="member in teamMembers"
                       :key="member.id"
                       class="flex items-center space-x-3 p-2 hover:bg-gray-50 rounded-md cursor-pointer"
                     >
                       <input
                         v-model="teamSettings.selected_members"
                         type="checkbox"
                         :value="member.id"
                         class="mr-2"
                       >
                        <div class="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center">
                          <span class="text-xs font-medium text-gray-700">
                            {{ member.name.charAt(0).toUpperCase() }}
                          </span>
                        </div>
                        <div class="flex-1">
                          <p class="text-sm font-medium text-gray-900">{{ member.name }}</p>
                          <p class="text-xs text-gray-600">{{ member.email }}</p>
                        </div>
                        <span class="text-xs text-gray-500">{{ member.role }}</span>
                  </label>
                </div>
              </div>
              
              <!-- Permissions -->
              <div class="mb-4">
                <label class="block text-sm font-medium text-gray-700 mb-2">
                  {{ t('files.permissions') }}
                </label>
                <div class="space-y-2">
                  <label class="flex items-center">
                    <input
                      v-model="teamSettings.permission"
                      type="radio"
                      value="view"
                      class="mr-2"
                    >
                    <span class="text-sm text-gray-700">{{ t('files.viewOnly') }}</span>
                  </label>
                  <label class="flex items-center">
                    <input
                      v-model="teamSettings.permission"
                      type="radio"
                      value="download"
                      class="mr-2"
                    >
                    <span class="text-sm text-gray-700">{{ t('files.viewAndDownload') }}</span>
                  </label>
                  <label class="flex items-center">
                    <input
                      v-model="teamSettings.permission"
                      type="radio"
                      value="edit"
                      class="mr-2"
                    >
                    <span class="text-sm text-gray-700">{{ t('files.viewDownloadEdit') }}</span>
                  </label>
                </div>
              </div>
              
              <div class="mb-4">
                <div class="flex items-center">
                  <input
                    v-model="teamSettings.notify_members"
                    type="checkbox"
                    id="notify_members"
                    class="mr-2"
                  >
                  <label for="notify_members" class="text-sm text-gray-700">
                    {{ t('files.notifyMembers') }}
                  </label>
                </div>
              </div>
              
              <div class="flex justify-end space-x-3">
                <button
                  @click="shareWithTeam"
                  :disabled="loading || teamSettings.selected_members.length === 0"
                  class="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
                >
                  <i v-if="loading" class="fas fa-spinner fa-spin mr-2"></i>
                  {{ t('files.shareWithSelected') }}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <div class="flex justify-end pt-4 border-t border-gray-200 mt-6">
        <button
          @click="closeModal"
          class="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
        >
          {{ t('common.close') }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useTranslation } from '@/composables/useTranslation'
import { useNotifications } from '@/composables/useNotifications'
import { useAuth } from '@/composables/useAuth'
import BaseWidget from '@/components/widgets/shared/components/BaseWidget.vue'
import WidgetConfigModal from '@/components/widgets/shared/components/WidgetConfigModal.vue'
import { fileShareService } from '@/services/fileShareService'
import type { SharedFile, SharePermission } from '@/types/fileShare'

// Props
interface Props {
  file: any
  projectId: string
}

const props = defineProps<Props>()

// Emits
const emit = defineEmits<{
  'close': []
  'shared': [data: any]
}>()

// Composables
const { success, error: showError } = useNotifications()
const { t } = useTranslation()
const { user } = useAuth()
    
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
</script>