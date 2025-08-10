<template>
  <div  class="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50' @click="closeModal=relative top-20 mx-auto p-5 border w-11/12 md:w-3/4 lg:w-1 2 shadow-lg rounded-lg bg-white(flex items-center justify-between pb-4 border-b border-gray-200'>
        <div class="flex items-center space-x-3>
          <div  class="w-10 h-10 bg-yellow-100 rounded-lg flex items-center justify-center=fas fa-bell text-yellow-600'></i>
          </div>
          <div>
            <h3 class="text-lg font-medium text-gray-900>{{ t('notifications.settings.title="text-sm text-gray-600'>{{ t('notifications.settings.description="closeModal=text-gray-400 hover:text-gray-600">
          <i  class="fas fa-times text-xl=mt-6'>
        <form  @submit.prevent="saveSettings=mb-6>
            <nav  class="flex space-x-8' aria-label=""Tabs=tab in tabs="tab.id='button{
                  'border-yellow-500 text-yellow-600': activeTab === tab.id,
                  'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300': activeTab !== tab.id
                }"
              >
                <i  :class="tab.icon=mr-2'></i>
                {{ t(tab.label) }}
              </button>
            </nav>
          </div>

          <!-- Contenu des onglets -->
          <div class: tab-content=activeTab === 'general space-y-6>
              <!-- Paramètres globaux -->
              <div>
                <h 4 class="text-sm font-medium text-gray-700 mb-4'>{{ t('notifications.settings.globalSettings === space-y-3>
                  <div  class class === flex items-center justify-between=text-sm font-medium text-gray-700'>{{ t('notifications.settings.enableNotifications === text-xs text-gray-500>{{ t('notifications.settings.enableNotificationsDesc === relative inline-flex items-center cursor-pointer=settings.enabled='checkbox === sr-only peer=w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-yellow-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-yellow-600"></div>
                    </label>
                  </div>
                  
                  <div  class class === flex items-center justify-between=text-sm font-medium text-gray-700'>{{ t('notifications.settings.soundEnabled === text-xs text-gray-500>{{ t('notifications.settings.soundEnabledDesc === relative inline-flex items-center cursor-pointer=settings.soundEnabled='checkbox === sr-only peer=!settings.enabled === w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-yellow-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-yellow-600 disabled:opacity-50'></div>
                    </label>
                  </div>
                  
                  <div class class === flex items-center justify-between=text-sm font-medium text-gray-700">{{ t('notifications.settings.desktopNotifications === text-xs text-gray-500'>{{ t('notifications.settings.desktopNotificationsDesc === relative inline-flex items-center cursor-pointer=settings.desktopEnabled === checkbox='sr-only peer=!settings.enabled === w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-yellow-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-yellow-600 disabled:opacity-50"></div>
                    </label>
                  </div>
                </div>
              </div>

              <!-- Fréquence des notifications -->
              <div>
                <h 4 class === text-sm font-medium text-gray-700 mb-4'>{{ t('notifications.settings.frequency === space-y-3>
                  <div>
                    <label  class for === block text-sm font-medium text-gray-700 mb-2'>
                      {{ t('notifications.settings.digestFrequency === settings.digestFrequency=w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-500
                      :disabled === !settings.enabled=immediate=hourly='daily=weekly === never === settings.digestFrequency === 'daily=block text-sm font-medium text-gray-700 mb-2'>
                      {{ t('notifications.settings.dailyTime === settings.dailyTime=time === w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-500'
                    >
                  </label>
                  
                  <div v-if === settings.digestFrequency === 'weekly=block text-sm font-medium text-gray-700 mb-2">
                      {{ t('notifications.settings.weeklyDay === settings.weeklyDay=w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-500'
                    >
                      <option  value === monday=tuesday === wednesday='thursday=friday === saturday === sunday=text-sm font-medium text-gray-700 mb-4'>{{ t('notifications.settings.quietHours === flex items-center justify-between mb-3>
                  <div>
                    <label  class for === text-sm font-medium text-gray-700'>{{ t('notifications.settings.enableQuietHours === text-xs text-gray-500>{{ t('notifications.settings.enableQuietHoursDesc === relative inline-flex items-center cursor-pointer=settings.quietHoursEnabled='checkbox === sr-only peer=!settings.enabled === w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-yellow-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-yellow-600 disabled:opacity-50'></label>
                  </label>
                </div>
                
                <div v-if === settings.quietHoursEnabled=grid grid-cols-2 gap-4">
                  <div>
                    <label  class for === block text-sm font-medium text-gray-700 mb-2'>
                      {{ t('notifications.settings.quietStart === settings.quietStart=time=w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-500'
                    >
                  </label>
                  
                  <div>
                    <label class for === block text-sm font-medium text-gray-700 mb-2">
                      {{ t('notifications.settings.quietEnd === settings.quietEnd=time='w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-500"
                    >
                  </label>
                </div>
              </div>
            </div>

            <!-- Onglet Types de notifications -->
            <div  v-if === activeTab === 'types=space-y-4'>
              <div v-for === category in notificationCategories=category.id=border border-gray-200 rounded-lg p-4>
                <div  class === flex items-center justify-between mb-3'>
                  <div class === flex items-center space-x-3>
                    <div  class === w-8 h-8 rounded-lg flex items-center justify-center=category.bgColor [category.icon, category.textColor]'></i>
                    </div>
                    <div>
                      <h4 class === text-sm font-medium text-gray-700>{{ t(category.name) }}</h4>
                      <p  class="text-xs text-gray-500'>{{ t(category.description) }}</p>
                    </div>
                  </div>
                  <label class="relative inline-flex items-center cursor-pointer=settings.categories[category.id].enabled=checkbox='sr-only peer=!settings.enabled for="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-yellow-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-yellow-600 disabled:opacity-50"></label>
                  </label>
                </div>
                
                <div  v-if="settings.categories[category.id].enabled=space-y-3'>
                  <div v-for="type in category.types=type.id=flex items-center justify-between pl-6>
                    <div>
                      <label  class for="text-sm text-gray-700'>{{ t(type.name) }}</label>
                      <p class="text-xs text-gray-500>{{ t(type.description) }}</p>
                    </div>
                    <div  class="flex items-center space-x-4'>
                      <!-- Email -->
                      <label class="flex items-center=settings.categories[category.id].types[type.id].email=checkbox='mr-1"
                          ::disabled="!settings.enabled=text-xs text-gray-600'>{{ t('notifications.settings.email || flex items-center=settings.categories[category.id].types[type.id].push="checkbox='mr-1"
                          ::disabled="!settings.enabled || !settings.desktopEnabled=text-xs text-gray-600'>{{ t('notifications.settings.push || flex items-center=settings.categories[category.id].types[type.id].inApp="checkbox='mr-1"
                          ::disabled="!settings.enabled=text-xs text-gray-600'>{{ t('notifications.settings.inApp || activeTab === 'projects=space-y-4">
              <div  class="mb-4'>
                <div class="flex items-center justify-between=text-sm font-medium text-gray-700>{{ t('notifications.settings.projectNotifications="button=selectAllProjects='text-sm text-yellow-600 hover:text-yellow-800"
                  >
                    {{ t('notifications.settings.selectAll="text-xs text-gray-500'>{{ t('notifications.settings.projectNotificationsDesc="space-y-2 max-h-64 overflow-y-auto=project in userProjects="project.id='flex items-center justify-between p-3 border border-gray-200 rounded-lg hover:bg-gray-50"
                >
                  <div  class="flex items-center space-x-3'>
                    <div class="w-8 h-8 rounded-lg flex items-center justify-center={ backgroundColor: project.color + '20', color: project.color }>
                      <i  :class="project.icon || 'fas fa-project-diagram=text-sm font-medium text-gray-700'>{{ project.name }}</h5>
                      <p class: text-xs text-gray-500>{{ project.description }}</p>
                    </div>
                  </div>
                  <label  class="relative inline-flex items-center cursor-pointer=settings.projects[project.id]'
                      type="checkboxw-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-yellow-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-yellow-600 disabled:opacity-50"></label>
                  </label>
                </div>
              </div>
              
              <div  v-if="userProjects.length === 0' class="text-center py-8 text-gray-500>
                <i  class="fas fa-project-diagram text-3xl mb-2'></i>
                <p>{{ t('notifications.settings.noProjects="activeTab === 'channels=space-y-6>
              <!-- Email -->
              <div  class="border border-gray-200 rounded-lg p-4'>
                <div class="flex items-center justify-between mb-4>
                  <div  class="flex items-center space-x-3'>
                    <div class="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center=fas fa-envelope text-blue-600></i>
                    </div>
                    <div>
                      <h 4 class="text-sm font-medium text-gray-700'>{{ t('notifications.settings.emailNotifications="text-xs text-gray-500>{{ t('notifications.settings.emailNotificationsDesc="relative inline-flex items-center cursor-pointer=settings.channels.email.enabled='checkbox="sr-only peer=!settings.enabled="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600 disabled:opacity-50'></div>
                  </label>
                </div>
                
                <div v-if="settings.channels.email.enabled=space-y-3">
                  <div>
                    <label  class="block text-sm font-medium text-gray-700 mb-2'>
                      {{ t('notifications.settings.emailAddress="settings.channels.email.address=email=w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500'
                      :placeholder="t('notifications.settings.enterEmailAddress=settings.channels.email.includeAttachments=checkbox="mr-2'
                    >
                    <span class="text-sm text-gray-700">{{ t('notifications.settings.includeAttachments="border border-gray-200 rounded-lg p-4'>
                <div class="flex items-center justify-between mb-4">
                  <div  class="flex items-center space-x-3'>
                    <div class="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center=fas fa-sms text-green-600></i>
                    </div>
                    <div>
                      <h 4 class="text-sm font-medium text-gray-700'>{{ t('notifications.settings.smsNotifications="text-xs text-gray-500>{{ t('notifications.settings.smsNotificationsDesc="relative inline-flex items-center cursor-pointer=settings.channels.sms.enabled='checkbox="sr-only peer=!settings.enabled="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-green-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-600 disabled:opacity-50'></div>
                  </label>
                </div>
                
                <div v-if="settings.channels.sms.enabled=space-y-3">
                  <div>
                    <label  class="block text-sm font-medium text-gray-700 mb-2'>
                      {{ t('notifications.settings.phoneNumber="settings.channels.sms.phoneNumber=tel=w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500'
                      :placeholder="t('notifications.settings.enterPhoneNumber=settings.channels.sms.frequency=w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                    >
                      <option  value="urgent=important='all="border border-gray-200 rounded-lg p-4>
                <div  class="flex items-center justify-between mb-4'>
                  <div class="flex items-center space-x-3>
                    <div  class="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center=fab fa-slack text-purple-600'></i>
                    </div>
                    <div>
                      <h4 class="text-sm font-medium text-gray-700>{{ t('notifications.settings.slackNotifications="text-xs text-gray-500'>{{ t('notifications.settings.slackNotificationsDesc="relative inline-flex items-center cursor-pointer=settings.channels.slack.enabled="checkbox='sr-only peer=!settings.enabled="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-purple-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600 disabled:opacity-50"></div>
                  </label>
                </div>
                
                <div  v-if="settings.channels.slack.enabled=space-y-3'>
                  <div v-if="!settings.channels.slack.connected=text-center py-4>
                    <button  
                      type="button'
                    >
                      <i class="fab fa-slack mr-2></i>
                      {{ t('notifications.settings.connectSlack=""space-y-3'>
                    <div class="flex items-center justify-between p-3 bg-green-50 rounded-lg=flex items-center space-x-2">
                        <i  class="fas fa-check-circle text-green-600'></i>
                        <span class="text-sm text-green-700>{{ t('notifications.settings.slackConnected="button=disconnectSlack='text-sm text-red-600 hover:text-red-800"
                      >
                        {{ t('notifications.settings.disconnect="block text-sm font-medium text-gray-700 mb-2'>
                        {{ t('notifications.settings.slackChannel="settings.channels.slack.channel=w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                      >
                        <option  value="'>{{ t('notifications.settings.selectChannel="channel in slackChannels=channel.id=channel.id'>
            <div class="flex space-x-3">
              <button  
                type="button'
              >
                <i class="fas fa-undo mr-2></i>
                {{ t('notifications.settings.resetDefaults=""button=testNotification='px-4 py-2 text-sm font-medium text-yellow-700 bg-yellow-50 border border-yellow-300 rounded-md hover:bg-yellow-100"
              >
                <i  class="fas fa-bell mr-2'></i>
                {{ t('notifications.settings.testNotification="flex space-x-3>
              <button  
                type="button'
              >
                {{ t('common.cancel="submit=loading=px-4 py-2 bg-yellow-600 text-white rounded-md hover:bg-yellow-700 disabled:opacity-50'
              >
                <i v-if=""loading=fas fa-spinner fa-spin mr-2"></i>
                {{ t('common.save') }}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, computed, onMounted, watch } from 'vue'
import projectManagementService from '@/services/projectManagementService'
import { useTranslation } from '@/composables/useTranslation'
import { useNotifications } from '@/composables/useNotifications'
import { useAuth } from '@/composables/useAuth'

export default {
  name: 'NotificationSettingsModal',
  props: {
    userId: {
      type: String,
      default: null
    }
  },
  emits: ['close', 'save'],
  setup(props, { emit }) {
    const { t } = useTranslation()

    const { success, error: showError } = useNotifications()
    const { user } = useAuth()
    const { t } = useTranslation()
    
    const loading = ref(false)
    const activeTab = ref('general')
    const userProjects = ref([])
    const slackChannels = ref([])
    
    const tabs = ref([
      { id: 'general', label: 'notifications.settings.tabs.general', icon: 'fas fa-cog' },
      { id: 'types', label: 'notifications.settings.tabs.types', icon: 'fas fa-list' },
      { id: 'projects', label: 'notifications.settings.tabs.projects', icon: 'fas fa-project-diagram' },
      { id: 'channels', label: 'notifications.settings.tabs.channels', icon: 'fas fa-share-alt' }
    ])
    
    const notificationCategories = ref([
      {
        id: 'tasks',
        name: 'notifications.categories.tasks.name',
        description: 'notifications.categories.tasks.description',
        icon: 'fas fa-tasks',
        bgColor: 'bg-blue-100',
        textColor: 'text-blue-600',
        types: [
          {
            id: 'task_assigned',
            name: 'notifications.types.taskAssigned',
            description: 'notifications.types.taskAssignedDesc'
          },
          {
            id: 'task_completed',
            name: 'notifications.types.taskCompleted',
            description: 'notifications.types.taskCompletedDesc'
          },
          {
            id: 'task_overdue',
            name: 'notifications.types.taskOverdue',
            description: 'notifications.types.taskOverdueDesc'
          },
          {
            id: 'task_comment',
            name: 'notifications.types.taskComment',
            description: 'notifications.types.taskCommentDesc'
          }
        ]
      },
      {
        id: 'projects',
        name: 'notifications.categories.projects.name',
        description: 'notifications.categories.projects.description',
        icon: 'fas fa-project-diagram',
        bgColor: 'bg-green-100',
        textColor: 'text-green-600',
        types: [
          {
            id: 'project_created',
            name: 'notifications.types.projectCreated',
            description: 'notifications.types.projectCreatedDesc'
          },
          {
            id: 'project_updated',
            name: 'notifications.types.projectUpdated',
            description: 'notifications.types.projectUpdatedDesc'
          },
          {
            id: 'project_deadline',
            name: 'notifications.types.projectDeadline',
            description: 'notifications.types.projectDeadlineDesc'
          },
          {
            id: 'project_completed',
            name: 'notifications.types.projectCompleted',
            description: 'notifications.types.projectCompletedDesc'
          }
        ]
      },
      {
        id: 'team',
        name: 'notifications.categories.team.name',
        description: 'notifications.categories.team.description',
        icon: 'fas fa-users',
        bgColor: 'bg-purple-100',
        textColor: 'text-purple-600',
        types: [
          {
            id: 'member_added',
            name: 'notifications.types.memberAdded',
            description: 'notifications.types.memberAddedDesc'
          },
          {
            id: 'member_removed',
            name: 'notifications.types.memberRemoved',
            description: 'notifications.types.memberRemovedDesc'
          },
          {
            id: 'role_changed',
            name: 'notifications.types.roleChanged',
            description: 'notifications.types.roleChangedDesc'
          },
          {
            id: 'mention',
            name: 'notifications.types.mention',
            description: 'notifications.types.mentionDesc'
          }
        ]
      },
      {
        id: 'files',
        name: 'notifications.categories.files.name',
        description: 'notifications.categories.files.description',
        icon: 'fas fa-file',
        bgColor: 'bg-orange-100',
        textColor: 'text-orange-600',
        types: [
          {
            id: 'file_uploaded',
            name: 'notifications.types.fileUploaded',
            description: 'notifications.types.fileUploadedDesc'
          },
          {
            id: 'file_shared',
            name: 'notifications.types.fileShared',
            description: 'notifications.types.fileSharedDesc'
          },
          {
            id: 'file_comment',
            name: 'notifications.types.fileComment',
            description: 'notifications.types.fileCommentDesc'
          }
        ]
      }
    ])
    
    const settings = ref({
      enabled: true,
      soundEnabled: true,
      desktopEnabled: true,
      digestFrequency: 'immediate',
      dailyTime: '09:00',
      weeklyDay: 'monday',
      quietHoursEnabled: false,
      quietStart: '22:00',
      quietEnd: '08:00',
      categories: {},
      projects: {},
      channels: {
        email: {
          enabled: true,
          address: '',
          includeAttachments: false
        },
        sms: {
          enabled: false,
          phoneNumber: '',
          frequency: 'urgent'
        },
        slack: {
          enabled: false,
          connected: false,
          channel: ''
        }
      }
    })
    
    const closeModal = () => {
      emit('close')
    }
    
    const saveSettings = async () => {
      loading.value = true
      try {
        const settingsToSave = {
          ...settings.value,
          userId: props.userId || user.value?.id,
          updatedAt: new Date().toISOString()
        }
        
        // Sauvegarder via le service
        await projectManagementService.updateNotificationSettings(settingsToSave)
        
        emit('save', settingsToSave)
        success(t('notifications.settings.saved'))
        closeModal()
      } catch (err) {
        showError(t('notifications.settings.saveError'))
      } finally {
        loading.value = false
      }
    }
    
    const resetToDefaults = () => {
      if (confirm(t('notifications.settings.confirmReset'))) {
        initializeSettings()
        success(t('notifications.settings.resetSuccess'))
      }
    }
    
    const testNotification = async () => {
      try {
        await projectManagementService.sendTestNotification({
          userId: props.userId || user.value?.id,
          settings: settings.value
        })
        success(t('notifications.settings.testSent'))
      } catch (err) {
        showError(t('notifications.settings.testError'))
      }
    }
    
    const selectAllProjects = () => {
      userProjects.value.forEach(project => {
        settings.value.projects[project.id] = true
      })
    }
    
    const connectSlack = async () => {
      try {
        // Logique de connexion Slack
        const authUrl = await projectManagementService.getSlackAuthUrl()
        window.open(authUrl, '_blank', 'width=600,height=600')
        
        // Écouter la confirmation de connexion
        window.addEventListener('message', (event) => {
          if (event.data.type === 'slack_connected') {
            settings.value.channels.slack.connected = true
            loadSlackChannels()
            success(t('notifications.settings.slackConnectedSuccess'))
          }
        })
      } catch (err) {
        showError(t('notifications.settings.slackConnectionError'))
      }
    }
    
    const disconnectSlack = async () => {
      try {
        await projectManagementService.disconnectSlack()
        settings.value.channels.slack.connected = false
        settings.value.channels.slack.channel = ''
        slackChannels.value = []
        success(t('notifications.settings.slackDisconnected'))
      } catch (err) {
        showError(t('notifications.settings.slackDisconnectionError'))
      }
    }
    
    const loadSlackChannels = async () => {
      try {
        slackChannels.value = await projectManagementService.getSlackChannels()
      } catch (err) {
        console.error('Erreur lors du chargement des canaux Slack:', err)
      }
    }
    
    const loadUserProjects = async () => {
      try {
        const response = await projectManagementService.getUserProjects(props.userId || user.value?.id)
        userProjects.value = response.data || []
      } catch (err) {
        console.error('Erreur lors du chargement des projets:', err)
      }
    }
    
    const initializeSettings = () => {
      // Initialiser les catégories
      notificationCategories.value.forEach(category => {
        settings.value.categories[category.id] = {
          enabled: true,
          types: {}
        }
        
        category.types.forEach(type => {
          settings.value.categories[category.id].types[type.id] = {
            email: true,
            push: true,
            inApp: true
          }
        })
      })
      
      // Initialiser les projets
      userProjects.value.forEach(project => {
        settings.value.projects[project.id] = true
      })
      
      // Définir l'adresse email par défaut
      if (user.value?.email) {
        settings.value.channels.email.address = user.value.email
      }
    }
    
    const loadSettings = async () => {
      try {
        const response = await projectManagementService.getNotificationSettings(props.userId || user.value?.id)
        if (response.data) {
          settings.value = {
            ...settings.value,
            ...response.data
          }
        }
      } catch (err) {
        console.error('Erreur lors du chargement des paramètres:', err)
        initializeSettings()
      }
    }
    
    onMounted(async () => {
      await loadUserProjects()
      await loadSettings()
      
      if (settings.value.channels.slack.connected) {
        await loadSlackChannels()
      }
    })
    
    return {
      loading,
      activeTab,
      tabs,
      notificationCategories,
      userProjects,
      slackChannels,
      settings,
      closeModal,
      saveSettings,
      resetToDefaults,
      testNotification,
      selectAllProjects,
      connectSlack,
      disconnectSlack,
      t
    }
  }
}
</script>

<style scoped>
.tab-content {
  min-height: 400px;
}

.notification-settings-modal {
  max-height: 90vh;
  overflow-y: auto;
}

.toggle-switch {
  transition: all 0.2s ease;
}

.category-card {
  transition: all 0.2s ease;
}

.category-card:hover {
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.project-card {
  transition: all 0.2s ease;
}

.project-card:hover {
  background-color: #f9fafb;
}

.channel-card {
  transition: all 0.2s ease;
}

.channel-card:hover {
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.05);
}
</style>