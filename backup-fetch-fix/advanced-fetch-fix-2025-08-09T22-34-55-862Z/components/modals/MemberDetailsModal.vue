<template>
  <div  class="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50' @click="closeModal=relative top-20 mx-auto p-5 border w-11/12 md:w-3/4 lg:w-2 3 shadow-lg rounded-lg bg-white(flex items-center justify-between pb-4 border-b border-gray-200'>
        <div class="flex items-center space-x-4>
          <div  class="w-16 h-16 bg-gray-300 rounded-full flex items-center justify-center=member.avatar member.avatar='member.name=w-16 h-16 rounded-full object-cover class="text-xl font-medium text-gray-700>
              {{ member.name?.charAt(0).toUpperCase() }}
            </div>
          </div>
          <div>
            <h 3 class="text-xl font-medium text-gray-900'>{{ member.name }}</h3>
            <p class="text-sm text-gray-600>{{ member.email }}</p>
            <div  class="flex items-center mt-1'>
              <span class="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium=getStatusClass(member.status)>
                <span  class="w-2 h-2 rounded-full mr-1' :class class="getStatusDotClass(member.status)></span>
                {{ t(`team.status.${member.status}`) }}
              </span>
              <span  class class="ml-2 text-xs text-gray-500'>{{ member.role }}</span>
            </div>
          </div>
        </div>
        <button  @click="closeModal=text-gray-400 hover:text-gray-600>
          <i  class(fas fa-times text-xl=mt-6'>
        <!-- Onglets -->
        <div class=""border-b border-gray-200>
          <nav  class="-mb-px flex space-x-8'>
            <button
              @click="activeTab = 'overview=py-2 px-1 border-b-2 font-medium text-sm=activeTab === 'overview='fas fa-user mr-2"></i>
              {{ t('team.overview === activeTab = 'tasks=py-2 px-1 border-b-2 font-medium text-sm='activeTab === 'tasks === fas fa-tasks mr-2"></i>
              {{ t('team.tasks === activeTab = 'activity=py-2 px-1 border-b-2 font-medium text-sm='activeTab === 'activity === fas fa-chart-line mr-2"></i>
              {{ t('team.activity === activeTab = 'permissions=py-2 px-1 border-b-2 font-medium text-sm='activeTab === 'permissions === fas fa-shield-alt mr-2"></i>
              {{ t('team.permissions === mt-6'>
          <!-- Vue d === activeTab === 'overview=space-y-6">
            <!-- Informations personnelles -->
            <div  class === bg-gray-50 rounded-lg p-4'>
              <h4 class === text-md font-medium text-gray-900 mb-3>{{ t('team.personalInfo === grid grid-cols-1 md:grid-cols-2 gap-4'>
                <div>
                  <label class === block text-sm font-medium text-gray-700">{{ t('team.fullName === mt-1 text-sm text-gray-900'>{{ member.name || t('common.notSpecified === block text-sm font-medium text-gray-700">{{ t('team.email === mt-1 text-sm text-gray-900'>{{ member.email }}</p>
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-700">{{ t('team.phone === mt-1 text-sm text-gray-900'>{{ member.phone || t('common.notSpecified === block text-sm font-medium text-gray-700">{{ t('team.department === mt-1 text-sm text-gray-900'>{{ member.department || t('common.notSpecified === block text-sm font-medium text-gray-700">{{ t('team.joinedDate === mt-1 text-sm text-gray-900'>{{ formatDate(member.joined_at) }}</p>
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-700">{{ t('team.lastActive === mt-1 text-sm text-gray-900'>{{ formatDate(member.last_active) }}</p>
                </div>
              </div>
            </div>
            
            <!-- Statistiques -->
            <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div  class="bg-blue-50 rounded-lg p-4'>
                <div class="flex items-center=flex-shrink-0>
                    <i  class="fas fa-tasks text-blue-600 text-xl=ml-3'>
                    <p class="text-sm font-medium text-blue-900>{{ t('team.totalTasks === text-2xl font-semibold text-blue-600'>{{ memberStats.total_tasks || 0 }}</p>
                  </div>
                </div>
              </div>
              
              <div class="bg-green-50 rounded-lg p-4">
                <div  class="flex items-center=flex-shrink-0'>
                    <i class="fas fa-check-circle text-green-600 text-xl=ml-3>
                    <p  class="text-sm font-medium text-green-900'>{{ t('team.completedTasks === text-2xl font-semibold text-green-600>{{ memberStats.completed_tasks || 0 }}</p>
                  </div>
                </div>
              </div>
              
              <div  class="bg-yellow-50 rounded-lg p-4'>
                <div class="flex items-center=flex-shrink-0>
                    <i  class="fas fa-clock text-yellow-600 text-xl=ml-3'>
                    <p class="text-sm font-medium text-yellow-900>{{ t('team.hoursWorked === text-2xl font-semibold text-yellow-600'>{{ memberStats.hours_worked || 0 }}h="bg-purple-50 rounded-lg p-4">
                <div  class="flex items-center=flex-shrink-0'>
                    <i class="fas fa-star text-purple-600 text-xl=ml-3>
                    <p  class="text-sm font-medium text-purple-900'>{{ t('team.performance === text-2xl font-semibold text-purple-600>{{ memberStats.performance_score || 0 }}%</p>
                  </div>
                </div>
              </div>
            </div>
            
            <!-- Compétences -->
            <div  v-if="member.skills && member.skills.length &gt; 0'>
              <h4 class="text-md font-medium text-gray-900 mb-3>{{ t('team.skills="flex flex-wrap gap-2'>
                <span
                  v-for="skill in member.skills=skill=inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800"
                >
                  {{ skill }}
                </span>
              </div>
            </div>
          </div>

          <!-- Tâches -->
          <div  v-if="activeTab === 'tasks=space-y-4'>
            <div class="flex justify-between items-center=text-md font-medium text-gray-900>{{ t('team.memberTasks === flex space-x-2'>
                <select v-model === taskFilter=text-sm border border-gray-300 rounded-md px-2 py-1">
                  <option  value === all=active='completed === overdue=loading === text-center py-8'>
              <i class === fas fa-spinner fa-spin text-gray-400 text-2xl=filteredTasks.length === 0 class === text-center py-8'>
              <i class === fas fa-tasks text-gray-400 text-3xl mb-2"></i>
              <p  class === text-gray-600'>{{ t('team.noTasks === space-y-3>
              <div 
                v-for === task in filteredTasks=task.id=border border-gray-200 rounded-lg p-4 hover:bg-gray-50'
              >
                <div class === flex items-center justify-between=flex-1>
                    <h 5 class === text-sm font-medium text-gray-900'>{{ task.title }}</h5>
                    <p class="text-xs text-gray-600 mt-1>{{ task.description }}</p>
                    <div  class="flex items-center mt-2 space-x-4'>
                      <span class class="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium=getTaskStatusClass(task.status)>
                        {{ t(`tasks.status.${task.status}`) }}
                      </span>
                      <span  class="text-xs text-gray-500'>
                        {{ t('tasks.priority="task.due_date=text-xs text-gray-500>
                        {{ t('tasks.dueDate="ml-4'>
                    <button
                      @click="viewTask(task)"
                      class="text-blue-600 hover:text-blue-800 text-sm=activeTab === 'activity='space-y-4">
            <h 4 class="text-md font-medium text-gray-900'>{{ t('team.recentActivity="loading=text-center py-8>
              <i  class="fas fa-spinner fa-spin text-gray-400 text-2xl=memberActivity.length === 0' class="text-center py-8>
              <i  class="fas fa-chart-line text-gray-400 text-3xl mb-2'></i>
              <p class="text-gray-600>{{ t('team.noActivity="space-y-3'>
              <div 
                v-for="activity in memberActivity=activity.id=flex items-start space-x-3 p-3 bg-gray-50 rounded-lg="flex-shrink-0'>
                  <div class="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center=getActivityIcon(activity.type) class="text-blue-600 text-sm=flex-1'>
                  <p class="text-sm text-gray-900">{{ activity.description }}</p>
                  <p  class="text-xs text-gray-600 mt-1'>{{ formatDate(activity.created_at) }}</p>
                </div>
              </div>
            </div>
          </div>

          <!-- Permissions -->
          <div v-if="activeTab === 'permissions=space-y-4>
            <div  class="flex justify-between items-center=text-md font-medium text-gray-900'>{{ t('team.memberPermissions === canEditPermissions=editPermissions=text-blue-600 hover:text-blue-800 text-sm='bg-gray-50 rounded-lg p-4">
              <div  class === mb-4'>
                <label class for === block text-sm font-medium text-gray-700 mb-2>{{ t('team.role === inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800'>
                  {{ member.role }}
                </label>
              </div>
              
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-3">{{ t('team.permissions === grid grid-cols-1 md:grid-cols-2 gap-3'>
                  <div 
                    v-for === permission in allPermissions=permission.value=flex items-center justify-between p-3 border border-gray-200 rounded-lg === flex-1'>
                      <p class === text-sm font-medium text-gray-900>{{ permission.label }}</p>
                      <p  class="text-xs text-gray-600'>{{ permission.description }}</p>
                    </div>
                    <div class="ml-3>
                      <span  v-if="hasPermission(permission.value)' class="text-green-600>
                        <i  class="fas fa-check-circle=text-gray-400'>
                        <i class="fas fa-times-circle=flex justify-between pt-4 border-t border-gray-200 mt-6>
        <div  class="flex space-x-3'>
          <button 
            v-if="canSendMessage=sendMessage=px-4 py-2 text-sm font-medium text-blue-700 bg-blue-100 rounded-md hover:bg-blue-200
          >
            <i  class="fas fa-envelope mr-2'></i>
            {{ t('team.sendMessage=""canAssignTask=assignTask=px-4 py-2 text-sm font-medium text-green-700 bg-green-100 rounded-md hover:bg-green-200'
          >
            <i class="fas fa-plus mr-2"></i>
            {{ t('team.assignTask="flex space-x-3'>
          <button
            v-if="canEditMember=editMember=px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
          >
            {{ t('team.editMember="closeModal=px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
          >
            {{ t('common.close') }}
          </button>
        </div>
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
  name: 'MemberDetailsModal',
  props: {
    member: {
      type: Object,
      required: true
    },
    projectId: {
      type: [String, Number],
      required: true
    }
  },
  emits: ['close', 'edit', 'assign-task', 'send-message'],
  setup(props, { emit }) {
    const { t } = useTranslation()

    const { success, error: showError } = useNotifications()
    const { user } = useAuth()
    const { t } = useTranslation()
    
    const loading = ref(false)
    const activeTab = ref('overview')
    const taskFilter = ref('all')
    
    const memberStats = ref({})
    const memberTasks = ref([])
    const memberActivity = ref([])
    
    const allPermissions = ref([
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
    
    const filteredTasks = computed(() => {
      if (taskFilter.value === 'all') return memberTasks.value
      if (taskFilter.value === 'active') return memberTasks.value.filter(task => ['todo', 'in_progress'].includes(task.status))
      if (taskFilter.value === 'completed') return memberTasks.value.filter(task => task.status === 'completed')
      if (taskFilter.value === 'overdue') return memberTasks.value.filter(task => task.is_overdue)
      return memberTasks.value
    })
    
    const canEditMember = computed(() => {
      return user.value?.role === 'admin' || user.value?.role === 'manager'
    })
    
    const canEditPermissions = computed(() => {
      return user.value?.role === 'admin'
    })
    
    const canSendMessage = computed(() => {
      return user.value?.id !== props.member.id
    })
    
    const canAssignTask = computed(() => {
      return user.value?.role === 'admin' || user.value?.role === 'manager'
    })
    
    const closeModal = () => {
      emit('close')
    }
    
    const editMember = () => {
      emit('edit', props.member)
    }
    
    const assignTask = () => {
      emit('assign-task', props.member)
    }
    
    const sendMessage = () => {
      emit('send-message', props.member)
    }
    
    const editPermissions = () => {
      // Logique pour éditer les permissions
      console.log('Édition des permissions pour:', props.member)
    }
    
    const viewTask = (task) => {
      // Logique pour voir les détails de la tâche
      console.log('Voir la tâche:', task)
    }
    
    const getStatusClass = (status) => {
      const classes = {
        active: 'bg-green-100 text-green-800',
        inactive: 'bg-gray-100 text-gray-800',
        busy: 'bg-yellow-100 text-yellow-800',
        away: 'bg-red-100 text-red-800'
      }
      return classes[status] || 'bg-gray-100 text-gray-800'
    }
    
    const getStatusDotClass = (status) => {
      const classes = {
        active: 'bg-green-400',
        inactive: 'bg-gray-400',
        busy: 'bg-yellow-400',
        away: 'bg-red-400'
      }
      return classes[status] || 'bg-gray-400'
    }
    
    const getTaskStatusClass = (status) => {
      const classes = {
        todo: 'bg-gray-100 text-gray-800',
        in_progress: 'bg-blue-100 text-blue-800',
        completed: 'bg-green-100 text-green-800',
        cancelled: 'bg-red-100 text-red-800'
      }
      return classes[status] || 'bg-gray-100 text-gray-800'
    }
    
    const getActivityIcon = (type) => {
      const icons = {
        task_created: 'fas fa-plus',
        task_completed: 'fas fa-check',
        task_updated: 'fas fa-edit',
        comment_added: 'fas fa-comment',
        file_uploaded: 'fas fa-upload',
        project_joined: 'fas fa-sign-in-alt'
      }
      return icons[type] || 'fas fa-circle'
    }
    
    const hasPermission = (permission) => {
      return props.member.permissions?.includes(permission) || false
    }
    
    const formatDate = (dateString) => {
      if (!dateString) return t('common.notSpecified')
      return new Date(dateString).toLocaleString()
    }
    
    const loadMemberStats = async () => {
      try {
        const response = await projectManagementService.getMemberStats({
          projectId: props.projectId,
          memberId: props.member.id
        })
        if (response.success) {
          memberStats.value = response.data
        }
      } catch (err) {
        console.error('Erreur lors du chargement des statistiques:', err)
      }
    }
    
    const loadMemberTasks = async () => {
      try {
        const response = await projectManagementService.getMemberTasks({
          projectId: props.projectId,
          memberId: props.member.id
        })
        if (response.success) {
          memberTasks.value = response.data
        }
      } catch (err) {
        console.error('Erreur lors du chargement des tâches:', err)
      }
    }
    
    const loadMemberActivity = async () => {
      try {
        const response = await projectManagementService.getMemberActivity({
          projectId: props.projectId,
          memberId: props.member.id
        })
        if (response.success) {
          memberActivity.value = response.data
        }
      } catch (err) {
        console.error('Erreur lors du chargement de l\'activité:', err)
      }
    }
    
    onMounted(() => {
      loadMemberStats()
      loadMemberTasks()
      loadMemberActivity()
    })
    
    return {
      loading,
      activeTab,
      taskFilter,
      memberStats,
      memberTasks,
      memberActivity,
      allPermissions,
      filteredTasks,
      canEditMember,
      canEditPermissions,
      canSendMessage,
      canAssignTask,
      closeModal,
      editMember,
      assignTask,
      sendMessage,
      editPermissions,
      viewTask,
      getStatusClass,
      getStatusDotClass,
      getTaskStatusClass,
      getActivityIcon,
      hasPermission,
      formatDate,
      t
    }
  }
}
</script>