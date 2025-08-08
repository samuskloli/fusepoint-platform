<template>
  <div  class="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50' @click="closeModal=relative top-20 mx-auto p-5 border w-11/12 md:w-4/5 lg:w-3/4 xl:w-2 3 shadow-lg rounded-lg bg-white(flex items-center justify-between pb-4 border-b border-gray-200'>
        <div class="flex items-center space-x-3>
          <div  class="w-10 h-10 rounded-lg flex items-center justify-center={ backgroundColor: project.color + '20', color: project.color }'>
            <i :class="project.icon || 'fas fa-project-diagram=text-lg font-medium text-gray-900>{{ t('projects.settings.title === text-sm text-gray-600'>{{ project.name }}</p>
          </div>
        </div>
        <button @click: closeModal=text-gray-400 hover:text-gray-600">
          <i  class="fas fa-times text-xl=mt-6'>
        <form  @submit.prevent="saveSettings=mb-6>
            <nav  class="flex space-x-8' aria-label=""Tabs=tab in tabs="tab.id='button{
                  'border-blue-500 text-blue-600': activeTab === tab.id,
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
              <!-- Informations de base -->
              <div>
                <h 4 class="text-sm font-medium text-gray-700 mb-4'>{{ t('projects.settings.basicInfo="grid grid-cols-1 md:grid-cols-2 gap-4>
                  <div>
                    <label  class="block text-sm font-medium text-gray-700 mb-2'>
                      {{ t('projects.name="settings.name=text=w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500'
                      :placeholder="t('projects.enterName=settings.category=w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option  value="'>{{ t('projects.selectCategory="category in projectCategories=category.id=category.id'>
                    <label class for="block text-sm font-medium text-gray-700 mb-2">
                      {{ t('projects.description="settings.description=3'
                      class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      :placeholder="t('projects.enterDescription=settings.startDate=date='w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                  </label>
                  
                  <div>
                    <label  class for="block text-sm font-medium text-gray-700 mb-2'>
                      {{ t('projects.endDate="settings.endDate=date=w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500'
                    >
                  </label>
                </div>
              </div>

              <!-- Apparence -->
              <div>
                <h4 class="text-sm font-medium text-gray-700 mb-4">{{ t('projects.settings.appearance="grid grid-cols-1 md:grid-cols-2 gap-4'>
                  <div>
                    <label class="block text-sm font-medium text-gray-700 mb-2">
                      {{ t('projects.color="flex items-center space-x-3'>
                      <input  
                        v-model="settings.color""
                        placeholder="#000000'
                      >
                    </div>
                  </div>
                  
                  <div>
                    <label class="block text-sm font-medium text-gray-700 mb-2>
                      {{ t('projects.icon=""flex items-center space-x-3'>
                      <div class="w-10 h-10 rounded-lg flex items-center justify-center={ backgroundColor: settings.color + '20', color: settings.color }">
                        <i  :class="settings.icon || 'fas fa-project-diagram=settings.icon=flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500'
                      >
                        <option value: fas fa-project-diagram=fas fa-briefcase=fas fa-rocket='fas fa-lightbulb=fas fa-cog="fas fa-chart-line="fas fa-users=fas fa-globe='text-sm font-medium text-gray-700 mb-4">{{ t('projects.settings.statusPriority === grid grid-cols-1 md:grid-cols-3 gap-4'>
                  <div>
                    <label class === block text-sm font-medium text-gray-700 mb-2">
                      {{ t('projects.status === settings.status=w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500'
                    >
                      <option  value === planning=active === on_hold='completed=cancelled === block text-sm font-medium text-gray-700 mb-2>
                      {{ t('projects.priority === settings.priority=w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500'
                    >
                      <option  value === low=medium === high='urgent=block text-sm font-medium text-gray-700 mb-2>
                      {{ t('projects.visibility === settings.visibility=w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500'
                    >
                      <option  value === private=team === public='activeTab === 'features=space-y-6>
              <!-- Modules activés -->
              <div>
                <h 4 class === text-sm font-medium text-gray-700 mb-4'>{{ t('projects.settings.enabledModules === grid grid-cols-1 md:grid-cols-2 gap-4>
                  <div v-for === module in projectModules=module.id=flex items-center justify-between p-3 border border-gray-200 rounded-lg='flex items-center space-x-3">
                      <div  class === w-8 h-8 rounded-lg flex items-center justify-center=module.bgColor [module.icon, module.textColor]'></i>
                      </div>
                      <div>
                        <h5 class === text-sm font-medium text-gray-700>{{ t(module.name) }}</h5>
                        <p  class="text-xs text-gray-500'>{{ t(module.description) }}</p>
                      </div>
                    </div>
                    <label class="relative inline-flex items-center cursor-pointer=settings.modules[module.id]
                        type="checkbox'></label>
                    </label>
                  </div>
                </div>
              </div>

              <!-- Paramètres des tâches -->
              <div>
                <h4 class="text-sm font-medium text-gray-700 mb-4">{{ t('projects.settings.taskSettings="space-y-4'>
                  <div class class="flex items-center justify-between=text-sm font-medium text-gray-700">{{ t('projects.settings.autoAssignTasks="text-xs text-gray-500'>{{ t('projects.settings.autoAssignTasksDesc="relative inline-flex items-center cursor-pointer=settings.taskSettings.autoAssign="checkbox='sr-only peer=w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                    </label>
                  </div>
                  
                  <div  class class="flex items-center justify-between=text-sm font-medium text-gray-700'>{{ t('projects.settings.requireApproval="text-xs text-gray-500>{{ t('projects.settings.requireApprovalDesc="relative inline-flex items-center cursor-pointer=settings.taskSettings.requireApproval='checkbox="sr-only peer=w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                    </label>
                  </div>
                  
                  <div  class="grid grid-cols-1 md:grid-cols-2 gap-4'>
                    <div>
                      <label class="block text-sm font-medium text-gray-700 mb-2>
                        {{ t('projects.settings.defaultTaskPriority="settings.taskSettings.defaultPriority=w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500'
                      >
                        <option  value="low=medium="high='urgent=block text-sm font-medium text-gray-700 mb-2>
                        {{ t('projects.settings.defaultTaskDuration="flex items-center space-x-2'>
                        <input  
                          v-model.number="settings.taskSettings.defaultDuration=number="1'
                          class=""flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500
                        >
                        <span  class="text-sm text-gray-500'>{{ t('common.hours="activeTab === 'notifications=space-y-6>
              <!-- Notifications du projet -->
              <div>
                <h 4 class="text-sm font-medium text-gray-700 mb-4'>{{ t('projects.settings.projectNotifications="space-y-4>
                  <div v-for="notification in notificationTypes=notification.id=flex items-center justify-between p-3 border border-gray-200 rounded-lg='text-sm font-medium text-gray-700">{{ t(notification.name) }}</h5>
                      <p  class="text-xs text-gray-500'>{{ t(notification.description) }}</p>
                    </div>
                    <div class="flex items-center space-x-4>
                      <label  class="flex items-center=settings.notifications[notification.id].email='checkbox="mr-1
                        >
                        <span  class="text-xs text-gray-600'>{{ t('notifications.email="flex items-center=settings.notifications[notification.id].push=checkbox='mr-1"
                        >
                        <span  class="text-xs text-gray-600'>{{ t('notifications.push="flex items-center=settings.notifications[notification.id].inApp=checkbox='mr-1"
                        >
                        <span  class="text-xs text-gray-600'>{{ t('notifications.inApp="text-sm font-medium text-gray-700 mb-4>{{ t('projects.settings.automaticReminders="space-y-4'>
                  <div class class="flex items-center justify-between=text-sm font-medium text-gray-700">{{ t('projects.settings.enableReminders="text-xs text-gray-500'>{{ t('projects.settings.enableRemindersDesc="relative inline-flex items-center cursor-pointer=settings.reminders.enabled="checkbox='sr-only peer=w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                    </label>
                  </div>
                  
                  <div  v-if="settings.reminders.enabled=grid grid-cols-1 md:grid-cols-2 gap-4'>
                    <div>
                      <label class="block text-sm font-medium text-gray-700 mb-2>
                        {{ t('projects.settings.reminderFrequency="settings.reminders.frequency=w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500'
                      >
                        <option  value="daily=weekly="monthly='block text-sm font-medium text-gray-700 mb-2>
                        {{ t('projects.settings.reminderTime="settings.reminders.time=time='w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- Onglet Sécurité -->
            <div  v-if="activeTab === 'security=space-y-6'>
              <!-- Contrôle d="text-sm font-medium text-gray-700 mb-4>{{ t('projects.settings.accessControl="space-y-4'>
                  <div class class="flex items-center justify-between=text-sm font-medium text-gray-700">{{ t('projects.settings.requireInvitation="text-xs text-gray-500'>{{ t('projects.settings.requireInvitationDesc="relative inline-flex items-center cursor-pointer=settings.security.requireInvitation="checkbox='sr-only peer=w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                    </label>
                  </div>
                  
                  <div  class class="flex items-center justify-between=text-sm font-medium text-gray-700'>{{ t('projects.settings.enableTwoFactor="text-xs text-gray-500>{{ t('projects.settings.enableTwoFactorDesc="relative inline-flex items-center cursor-pointer=settings.security.twoFactorRequired='checkbox="sr-only peer=w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                    </label>
                  </div>
                  
                  <div  class class="flex items-center justify-between=text-sm font-medium text-gray-700'>{{ t('projects.settings.logActivities="text-xs text-gray-500>{{ t('projects.settings.logActivitiesDesc="relative inline-flex items-center cursor-pointer=settings.security.logActivities='checkbox="sr-only peer=w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                    </label>
                  </div>
                </div>
              </div>

              <!-- Sauvegarde et archivage -->
              <div>
                <h 4 class="text-sm font-medium text-gray-700 mb-4'>{{ t('projects.settings.backupArchive="space-y-4>
                  <div  class class="flex items-center justify-between=text-sm font-medium text-gray-700'>{{ t('projects.settings.autoBackup="text-xs text-gray-500>{{ t('projects.settings.autoBackupDesc="relative inline-flex items-center cursor-pointer=settings.backup.enabled='checkbox="sr-only peer=w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                    </label>
                  </div>
                  
                  <div  v-if="settings.backup.enabled=grid grid-cols-1 md:grid-cols-2 gap-4'>
                    <div>
                      <label class="block text-sm font-medium text-gray-700 mb-2>
                        {{ t('projects.settings.backupFrequency="settings.backup.frequency=w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500'
                      >
                        <option  value="daily=weekly="monthly='block text-sm font-medium text-gray-700 mb-2>
                        {{ t('projects.settings.retentionPeriod="settings.backup.retention=w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500'
                      >
                        <option value value="30">{{ t('projects.settings.days30') }}</option>
                        <option  value value="90'>{{ t('projects.settings.days90') }}</option>
                        <option value value="180>{{ t('projects.settings.days180') }}</option>
                        <option  value value="365'>{{ t('projects.settings.days365') }}</option>
                      </select>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Zone de danger -->
              <div class="border border-red-200 rounded-lg p-4 bg-red-50>
                <h 4 class="text-sm font-medium text-red-700 mb-4'>{{ t('projects.settings.dangerZone="space-y-3>
                  <div  class="flex items-center justify-between=text-sm font-medium text-red-700'>{{ t('projects.settings.archiveProject="text-xs text-red-600>{{ t('projects.settings.archiveProjectDesc="button=archiveProject='px-3 py-1 text-sm bg-red-100 text-red-700 rounded-md hover:bg-red-200"
                    >
                      {{ t('projects.settings.archive="flex items-center justify-between=text-sm font-medium text-red-700'>{{ t('projects.settings.deleteProject="text-xs text-red-600">{{ t('projects.settings.deleteProjectDesc="button=deleteProject='px-3 py-1 text-sm bg-red-600 text-white rounded-md hover:bg-red-700"
                    >
                      {{ t('projects.settings.delete="flex justify-between items-center pt-6 border-t border-gray-200'>
            <div class="flex space-x-3">
              <button  
                type="button'
              >
                <i class="fas fa-undo mr-2></i>
                {{ t('projects.settings.reset=""button=exportSettings='px-4 py-2 text-sm font-medium text-blue-700 bg-blue-50 border border-blue-300 rounded-md hover:bg-blue-100"
              >
                <i  class="fas fa-download mr-2'></i>
                {{ t('projects.settings.export="flex space-x-3>
              <button  
                type="button'
              >
                {{ t('common.cancel="submit=loading=px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50'
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
import { ref, computed, onMounted } from 'vue'
import projectManagementService from '@/services/projectManagementService'
import { useTranslation } from '@/composables/useTranslation'
import { useNotifications } from '@/composables/useNotifications'
import { useAuth } from '@/composables/useAuth'

export default {
  name: 'ProjectSettingsModal',
  props: {
    project: {
      type: Object,
      required: true
    }
  },
  emits: ['close', 'update', 'archive', 'delete'],
  setup(props, { emit }) {
    const { t } = useTranslation()

    const { success, error: showError } = useNotifications()
    const { hasPermission } = useAuth()
    const { t } = useTranslation()
    
    const loading = ref(false)
    const activeTab = ref('general')
    
    const tabs = ref([
      { id: 'general', label: 'projects.settings.tabs.general', icon: 'fas fa-cog' },
      { id: 'features', label: 'projects.settings.tabs.features', icon: 'fas fa-puzzle-piece' },
      { id: 'notifications', label: 'projects.settings.tabs.notifications', icon: 'fas fa-bell' },
      { id: 'security', label: 'projects.settings.tabs.security', icon: 'fas fa-shield-alt' }
    ])
    
    const projectCategories = ref([
      { id: 'web_development', name: 'projects.categories.webDevelopment' },
      { id: 'mobile_app', name: 'projects.categories.mobileApp' },
      { id: 'marketing', name: 'projects.categories.marketing' },
      { id: 'design', name: 'projects.categories.design' },
      { id: 'research', name: 'projects.categories.research' },
      { id: 'consulting', name: 'projects.categories.consulting' },
      { id: 'other', name: 'projects.categories.other' }
    ])
    
    const projectModules = ref([
      {
        id: 'tasks',
        name: 'projects.modules.tasks',
        description: 'projects.modules.tasksDesc',
        icon: 'fas fa-tasks',
        bgColor: 'bg-blue-100',
        textColor: 'text-blue-600'
      },
      {
        id: 'calendar',
        name: 'projects.modules.calendar',
        description: 'projects.modules.calendarDesc',
        icon: 'fas fa-calendar',
        bgColor: 'bg-green-100',
        textColor: 'text-green-600'
      },
      {
        id: 'files',
        name: 'projects.modules.files',
        description: 'projects.modules.filesDesc',
        icon: 'fas fa-folder',
        bgColor: 'bg-yellow-100',
        textColor: 'text-yellow-600'
      },
      {
        id: 'chat',
        name: 'projects.modules.chat',
        description: 'projects.modules.chatDesc',
        icon: 'fas fa-comments',
        bgColor: 'bg-purple-100',
        textColor: 'text-purple-600'
      },
      {
        id: 'time_tracking',
        name: 'projects.modules.timeTracking',
        description: 'projects.modules.timeTrackingDesc',
        icon: 'fas fa-clock',
        bgColor: 'bg-indigo-100',
        textColor: 'text-indigo-600'
      },
      {
        id: 'budget',
        name: 'projects.modules.budget',
        description: 'projects.modules.budgetDesc',
        icon: 'fas fa-euro-sign',
        bgColor: 'bg-red-100',
        textColor: 'text-red-600'
      }
    ])
    
    const notificationTypes = ref([
      {
        id: 'task_created',
        name: 'notifications.types.taskCreated',
        description: 'notifications.types.taskCreatedDesc'
      },
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
        id: 'deadline_approaching',
        name: 'notifications.types.deadlineApproaching',
        description: 'notifications.types.deadlineApproachingDesc'
      },
      {
        id: 'member_added',
        name: 'notifications.types.memberAdded',
        description: 'notifications.types.memberAddedDesc'
      },
      {
        id: 'file_uploaded',
        name: 'notifications.types.fileUploaded',
        description: 'notifications.types.fileUploadedDesc'
      }
    ])
    
    const settings = ref({
      // Général
      name: '',
      description: '',
      category: '',
      startDate: '',
      endDate: '',
      color: '#3B82F6',
      icon: 'fas fa-project-diagram',
      status: 'active',
      priority: 'medium',
      visibility: 'team',
      
      // Modules
      modules: {
        tasks: true,
        calendar: true,
        files: true,
        chat: false,
        time_tracking: false,
        budget: false
      },
      
      // Paramètres des tâches
      taskSettings: {
        autoAssign: false,
        requireApproval: false,
        defaultPriority: 'medium',
        defaultDuration: 8
      },
      
      // Notifications
      notifications: {},
      
      // Rappels
      reminders: {
        enabled: false,
        frequency: 'weekly',
        time: '09:00'
      },
      
      // Sécurité
      security: {
        requireInvitation: true,
        twoFactorRequired: false,
        logActivities: true
      },
      
      // Sauvegarde
      backup: {
        enabled: true,
        frequency: 'weekly',
        retention: '90'
      }
    })
    
    const closeModal = () => {
      emit('close')
    }
    
    const saveSettings = async () => {
      loading.value = true
      try {
        const updatedProject = await projectManagementService.updateProjectSettings(props.project.id, settings.value)
        emit('update', updatedProject)
        success(t('projects.settings.saved'))
        closeModal()
      } catch (err) {
        showError(t('projects.settings.saveError'))
      } finally {
        loading.value = false
      }
    }
    
    const resetSettings = () => {
      if (confirm(t('projects.settings.confirmReset'))) {
        initializeSettings()
        success(t('projects.settings.resetSuccess'))
      }
    }
    
    const exportSettings = async () => {
      try {
        const exportData = await projectManagementService.exportProjectSettings(props.project.id)
        const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' })
        const url = URL.createObjectURL(blob)
        const link = document.createElement('a')
        link.href = url
        link.download = `${props.project.name}-settings.json`
        link.click()
        URL.revokeObjectURL(url)
        success(t('projects.settings.exported'))
      } catch (err) {
        showError(t('projects.settings.exportError'))
      }
    }
    
    const archiveProject = async () => {
      if (!confirm(t('projects.settings.confirmArchive'))) return
      
      try {
        await projectManagementService.archiveProject(props.project.id)
        emit('archive', props.project)
        success(t('projects.settings.archived'))
        closeModal()
      } catch (err) {
        showError(t('projects.settings.archiveError'))
      }
    }
    
    const deleteProject = async () => {
      const confirmText = t('projects.settings.confirmDeleteText')
      const userInput = prompt(t('projects.settings.confirmDeletePrompt', { name: props.project.name, confirmText }))
      
      if (userInput !== confirmText) {
        showError(t('projects.settings.deleteConfirmationFailed'))
        return
      }
      
      try {
        await projectManagementService.deleteProject(props.project.id)
        emit('delete', props.project)
        success(t('projects.settings.deleted'))
        closeModal()
      } catch (err) {
        showError(t('projects.settings.deleteError'))
      }
    }
    
    const initializeSettings = () => {
      // Copier les données du projet
      settings.value = {
        ...settings.value,
        name: props.project.name || '',
        description: props.project.description || '',
        category: props.project.category || '',
        startDate: props.project.startDate || '',
        endDate: props.project.endDate || '',
        color: props.project.color || '#3B82F6',
        icon: props.project.icon || 'fas fa-project-diagram',
        status: props.project.status || 'active',
        priority: props.project.priority || 'medium',
        visibility: props.project.visibility || 'team'
      }
      
      // Initialiser les notifications
      notificationTypes.value.forEach(type => {
        settings.value.notifications[type.id] = {
          email: true,
          push: true,
          inApp: true
        }
      })
      
      // Appliquer les paramètres existants du projet
      if (props.project.settings) {
        settings.value = {
          ...settings.value,
          ...props.project.settings
        }
      }
    }
    
    onMounted(() => {
      initializeSettings()
    })
    
    return {
      loading,
      activeTab,
      tabs,
      projectCategories,
      projectModules,
      notificationTypes,
      settings,
      closeModal,
      saveSettings,
      resetSettings,
      exportSettings,
      archiveProject,
      deleteProject,
      t
    }
  }
}
</script>

<style scoped>
.tab-content {
  min-height: 500px;
}

.project-settings-modal {
  max-height: 90vh;
  overflow-y: auto;
}

.module-card {
  transition: all 0.2s ease;
}

.module-card:hover {
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.notification-card {
  transition: all 0.2s ease;
}

.notification-card:hover {
  background-color: #f9fafb;
}

.danger-zone {
  background-color: #fef2f2;
  border-color: #fecaca;
}

.toggle-switch {
  transition: all 0.2s ease;
}

.color-preview {
  transition: all 0.2s ease;
}

.icon-preview {
  transition: all 0.2s ease;
}
</style>