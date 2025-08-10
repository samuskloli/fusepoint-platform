<template>
  <div  class="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50' @click="closeModal=relative top-20 mx-auto p-5 border w-11/12 md:w-3/4 lg:w-1 2 shadow-lg rounded-lg bg-white(flex items-center justify-between pb-4 border-b border-gray-200'>
        <div class="flex items-center space-x-3>
          <div  class="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center=fas fa-user-edit text-blue-600'></i>
          </div>
          <div>
            <h3 class="text-lg font-medium text-gray-900>{{ t('team.editMember === text-sm text-gray-600'>{{ member.name }}</p>
          </div>
        </div>
        <button @click="closeModal=text-gray-400 hover:text-gray-600">
          <i  class="fas fa-times text-xl=mt-6'>
        <form  @submit.prevent="saveMember=border-b border-gray-200>
            <nav  class="-mb-px flex space-x-8'>
              <button
                type=""buttonactiveTab === 'basic=fas fa-user mr-2"></i>
                {{ t('team.basicInfo="button=activeTab = 'role='py-2 px-1 border-b-2 font-medium text-sm="activeTab === 'role=fas fa-shield-alt mr-2"></i>
                {{ t('team.rolePermissions="button=activeTab = 'settings='py-2 px-1 border-b-2 font-medium text-sm="activeTab === 'settings=fas fa-cog mr-2"></i>
                {{ t('team.settings="mt-6'>
            <!-- Informations de base -->
            <div v-if="activeTab === 'basic=space-y-4">
              <!-- Photo de profil -->
              <div  class="flex items-center space-x-4'>
                <div class="w-20 h-20 bg-gray-300 rounded-full flex items-center justify-center overflow-hidden=editForm.avatar || member.avatar editForm.avatar || member.avatar=editForm.name=w-20 h-20 rounded-full object-cover class='text-2xl font-medium text-gray-700">
                    {{ editForm.name?.charAt(0).toUpperCase() }}
                  </div>
                </div>
                <div>
                  <button  
                    type="button'
                  >
                    {{ t('team.changePhoto="avatarInput=file=image/*'
                    @change=""handleAvatarChange=:hidden="text-xs text-gray-600 mt-1'>{{ t('team.photoRequirements === block text-sm font-medium text-gray-700 mb-2">
                  {{ t('team.fullName="text-red-500'>*</button>
                </label>
                <input  
                  v-model="editForm.name=text=w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  :placeholder="t('team.enterFullName=text-red-500'>*</span>
                </label>
                <input
                  v-model="editForm.email"t('team.enterEmail=editForm.phone=tel='w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  :placeholder="t('team.enterPhone=editForm.department=w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500'
                >
                  <option value="">{{ t('team.selectDepartment="dept in departments=dept.value='dept.value="block text-sm font-medium text-gray-700 mb-2">
                  {{ t('team.jobTitle="editForm.job_title=text='w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  :placeholder="t('team.enterJobTitle=flex flex-wrap gap-2 mb-2'>
                  <span
                    v-for="skill in editForm.skills=skill=inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
                  >
                    {{ skill }}
                    <button  
                      type="button=removeSkill(skill)'
                      class="ml-1 text-blue-600 hover:text-blue-800
                    >
                      <i  class=""fas fa-times text-xs=flex='newSkill="addSkill=text="flex-1 px-3 py-2 border border-gray-300 rounded-l-md focus:outline-none focus:ring-2 focus:ring-blue-500'
                    :placeholder="t('team.enterSkill=addSkill=px-4 py-2 bg-blue-600 text-white rounded-r-md hover:bg-blue-700
                  >
                    <i class="fas fa-plus=activeTab === 'role='space-y-4">
              <!-- Rôle -->
              <div>
                <label  class for="block text-sm font-medium text-gray-700 mb-2'>
                  {{ t('team.role="text-red-500>*</label>
                </label>
                <select 
                  v-model="editForm.role"role in availableRoles=role.value='role.value="text-xs text-gray-600 mt-1">{{ getRoleDescription(editForm.role) }}</p>
              </div>
              
              <!-- Permissions personnalisées -->
              <div  v-if="canCustomizePermissions=block text-sm font-medium text-gray-700 mb-3'>
                  {{ t('team.customPermissions === space-y-3>
                  <div 
                    v-for === permission in availablePermissions=permission.value=flex items-start space-x-3 p-3 border border-gray-200 rounded-lg='editForm.permissions=checkbox === permission.value === permission.value=mt-1'
                    >
                    <div class === flex-1>
                      <label  :for === permission.value=text-sm font-medium text-gray-900 cursor-pointer=text-xs text-gray-600 mt-1'>{{ permission.description }}</p>
                    </div>
                  </div>
                </div>
              </div>
              
              <!-- Accès aux projets -->
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2>
                  {{ t('team.projectAccess="space-y-2'>
                  <label  class="flex items-center=editForm.project_access="radio='all=mr-2
                    >
                    <div  class="flex-1'>
                      <span class="text-sm font-medium text-gray-900>{{ t('team.allProjects="text-xs text-gray-600'>{{ t('team.allProjectsDesc="flex items-center=editForm.project_access="radio='assigned=mr-2"
                    >
                    <div  class="flex-1'>
                      <span class="text-sm font-medium text-gray-900>{{ t('team.assignedProjects="text-xs text-gray-600'>{{ t('team.assignedProjectsDesc="activeTab === 'settings=space-y-4">
              <!-- Statut -->
              <div>
                <label  class="block text-sm font-medium text-gray-700 mb-2'>
                  {{ t('team.status="editForm.status=w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500
                >
                  <option  value="active=inactive='suspended="block text-sm font-medium text-gray-700 mb-3>
                  {{ t('team.notifications="space-y-2'>
                  <label  class="flex items-center=editForm.notifications.email="checkbox='mr-2
                    >
                    <span  class="text-sm text-gray-700'>{{ t('team.emailNotifications="flex items-center=editForm.notifications.push=checkbox='mr-2"
                    >
                    <span  class="text-sm text-gray-700'>{{ t('team.pushNotifications="flex items-center=editForm.notifications.sms=checkbox='mr-2"
                    >
                    <span  class="text-sm text-gray-700'>{{ t('team.smsNotifications="block text-sm font-medium text-gray-700 mb-2>
                  {{ t('team.timezone="editForm.timezone=w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500'
                >
                  <option  v-for="tz in timezones=tz.value=tz.value="block text-sm font-medium text-gray-700 mb-2'>
                  {{ t('team.language="editForm.language=w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500
                >
                  <option v-for="lang in languages=lang.value=lang.value='canEditBilling=block text-sm font-medium text-gray-700 mb-2">
                  {{ t('team.hourlyRate="flex=inline-flex items-center px-3 py-2 rounded-l-md border border-r-0 border-gray-300 bg-gray-50 text-gray-500 text-sm='editForm.hourly_rate="number=0"
                    step="0.01'
                    class="flex-1 px-3 py-2 border border-gray-300 rounded-r-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    :placeholder="t('team.enterHourlyRate=canRemoveMember=button='confirmRemoveMember=px-4 py-2 text-sm font-medium text-red-700 bg-red-100 rounded-md hover:bg-red-200"
              >
                {{ t('team.removeMember="flex space-x-3'>
              <button
                type="button"
              >
                {{ t('common.cancel="submit=loading='px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
              >
                <i v-if="loading=fas fa-spinner fa-spin mr-2"></i>
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
  name: 'EditMemberModal',
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
  emits: ['close', 'updated', 'removed'],
  setup(props, { emit }) {
    const { success, error: showError, confirm } = useNotifications()
    const { user } = useAuth()
    const { t } = useTranslation()
    
    const loading = ref(false)
    const activeTab = ref('basic')
    const newSkill = ref('')
    const avatarInput = ref(null)
    
    const editForm = ref({
      name: '',
      email: '',
      phone: '',
      department: '',
      job_title: '',
      skills: [],
      role: '',
      permissions: [],
      project_access: 'assigned',
      status: 'active',
      notifications: {
        email: true,
        push: true,
        sms: false
      },
      timezone: 'Europe/Paris',
      language: 'fr',
      hourly_rate: 0,
      avatar: ''
    })
    
    const departments = ref([
      { value: 'development', label: t('team.departments.development') },
      { value: 'design', label: t('team.departments.design') },
      { value: 'marketing', label: t('team.departments.marketing') },
      { value: 'sales', label: t('team.departments.sales') },
      { value: 'support', label: t('team.departments.support') },
      { value: 'management', label: t('team.departments.management') }
    ])
    
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
    
    const timezones = ref([
      { value: 'Europe/Paris', label: 'Europe/Paris (GMT+1)' },
      { value: 'Europe/London', label: 'Europe/London (GMT+0)' },
      { value: 'America/New_York', label: 'America/New_York (GMT-5)' },
      { value: 'America/Los_Angeles', label: 'America/Los_Angeles (GMT-8)' },
      { value: 'Asia/Tokyo', label: 'Asia/Tokyo (GMT+9)' }
    ])
    
    const languages = ref([
      { value: 'fr', label: 'Français' },
      { value: 'en', label: 'English' },
      { value: 'es', label: 'Español' },
      { value: 'de', label: 'Deutsch' }
    ])
    
    const canCustomizePermissions = computed(() => {
      return user.value?.role === 'admin'
    })
    
    const canEditBilling = computed(() => {
      return user.value?.role === 'admin' || user.value?.role === 'manager'
    })
    
    const canRemoveMember = computed(() => {
      return user.value?.role === 'admin' && user.value?.id !== props.member.id
    })
    
    const closeModal = () => {
      emit('close')
    }
    
    const selectAvatar = () => {
      avatarInput.value?.click()
    }
    
    const handleAvatarChange = (event) => {
      const file = event.target.files[0]
      if (file) {
        const reader = new FileReader()
        reader.onload = (e) => {
          editForm.value.avatar = e.target.result
        }
        reader.readAsDataURL(file)
      }
    }
    
    const addSkill = () => {
      const skill = newSkill.value.trim()
      if (skill && !editForm.value.skills.includes(skill)) {
        editForm.value.skills.push(skill)
        newSkill.value = ''
      }
    }
    
    const removeSkill = (skill) => {
      const index = editForm.value.skills.indexOf(skill)
      if (index > -1) {
        editForm.value.skills.splice(index, 1)
      }
    }
    
    const getRoleDescription = (role) => {
      const descriptions = {
        member: t('team.roleDescriptions.member'),
        manager: t('team.roleDescriptions.manager'),
        admin: t('team.roleDescriptions.admin')
      }
      return descriptions[role] || ''
    }
    
    const saveMember = async () => {
      loading.value = true
      try {
        const response = await projectManagementService.updateMember({
          projectId: props.projectId,
          memberId: props.member.id,
          ...editForm.value
        })
        
        if (response.success) {
          success(t('team.memberUpdated'))
          emit('updated', response.data)
          closeModal()
        }
      } catch (err) {
        showError(t('team.memberUpdateError'))
      } finally {
        loading.value = false
      }
    }
    
    const confirmRemoveMember = async () => {
      const confirmed = await confirm(
        t('team.confirmRemoveMember'),
        t('team.confirmRemoveMemberDesc', { name: props.member.name })
      )
      
      if (confirmed) {
        await removeMember()
      }
    }
    
    const removeMember = async () => {
      loading.value = true
      try {
        const response = await projectManagementService.removeMember({
          projectId: props.projectId,
          memberId: props.member.id
        })
        
        if (response.success) {
          success(t('team.memberRemoved'))
          emit('removed', props.member)
          closeModal()
        }
      } catch (err) {
        showError(t('team.memberRemoveError'))
      } finally {
        loading.value = false
      }
    }
    
    const initializeForm = () => {
      // Copier les données du membre dans le formulaire
      Object.keys(editForm.value).forEach(key => {
        if (props.member[key] !== undefined) {
          editForm.value[key] = props.member[key]
        }
      })
      
      // Initialiser les valeurs par défaut si nécessaire
      if (!editForm.value.skills) editForm.value.skills = []
      if (!editForm.value.permissions) editForm.value.permissions = []
      if (!editForm.value.notifications) {
        editForm.value.notifications = {
          email: true,
          push: true,
          sms: false
        }
      }
    }
    
    onMounted(() => {
      initializeForm()
    })
    
    return {
      loading,
      activeTab,
      newSkill,
      avatarInput,
      editForm,
      departments,
      availableRoles,
      availablePermissions,
      timezones,
      languages,
      canCustomizePermissions,
      canEditBilling,
      canRemoveMember,
      closeModal,
      selectAvatar,
      handleAvatarChange,
      addSkill,
      removeSkill,
      getRoleDescription,
      saveMember,
      confirmRemoveMember,
      t
    }
  }
}
</script>