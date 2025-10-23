<template>
  <div class="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50" @click="closeModal">
    <div class="relative top-20 mx-auto p-5 border w-11/12 md:w-3/4 lg:w-1/2 shadow-lg rounded-lg bg-white" @click.stop>
      <!-- En-tête -->
      <div class="flex items-center justify-between pb-4 border-b border-gray-200">
        <div class="flex items-center space-x-3">
          <div class="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
            <i class="fas fa-user-edit text-blue-600"></i>
          </div>
          <div>
            <h3 class="text-lg font-medium text-gray-900">{{ t('team.editMember') }}</h3>
            <p class="text-sm text-gray-600">{{ member.name }}</p>
          </div>
        </div>
        <button @click="closeModal" class="text-gray-400 hover:text-gray-600">
          <i class="fas fa-times text-xl"></i>
        </button>
      </div>

      <div class="mt-6">
        <form @submit.prevent="saveMember">
          <!-- Onglets -->
          <div class="border-b border-gray-200">
            <nav class="-mb-px flex space-x-8">
              <button
                type="button"
                @click="activeTab = 'basic'"
                class="py-2 px-1 border-b-2 font-medium text-sm"
                :class="activeTab === 'basic' ? 'border-blue-500 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'"
              >
                <i class="fas fa-user mr-2"></i>
                {{ t('team.basicInfo') }}
              </button>
              <button
                type="button"
                @click="activeTab = 'role'"
                class="py-2 px-1 border-b-2 font-medium text-sm"
                :class="activeTab === 'role' ? 'border-blue-500 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'"
              >
                <i class="fas fa-shield-alt mr-2"></i>
                {{ t('team.rolePermissions') }}
              </button>
              <button
                type="button"
                @click="activeTab = 'settings'"
                class="py-2 px-1 border-b-2 font-medium text-sm"
                :class="activeTab === 'settings' ? 'border-blue-500 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'"
              >
                <i class="fas fa-cog mr-2"></i>
                {{ t('team.settings') }}
              </button>
            </nav>
          </div>

          <div class="mt-6">
            <!-- Informations de base -->
            <div v-if="activeTab === 'basic'" class="space-y-4">
              <!-- Photo de profil -->
              <div class="flex items-center space-x-4">
                <div class="w-20 h-20 bg-gray-300 rounded-full flex items-center justify-center overflow-hidden">
                  <img v-if="editForm.avatar || member.avatar" :src="editForm.avatar || member.avatar" :alt="editForm.name" class="w-20 h-20 rounded-full object-cover" />
                  <span v-else class="text-2xl font-medium text-gray-700">
                    {{ editForm.name?.charAt(0).toUpperCase() }}
                  </span>
                </div>
                <div>
                  <button  
                    type="button"
                    @click="$refs.avatarInput.click()"
                    class="px-4 py-2 text-sm font-medium text-blue-700 bg-blue-100 rounded-md hover:bg-blue-200"
                  >
                    {{ t('team.changePhoto') }}
                  </button>
                  <input 
                    ref="avatarInput"
                    type="file"
                    accept="image/*"
                    @change="handleAvatarChange"
                    :hidden="true"
                  />
                  <p class="text-xs text-gray-600 mt-1">{{ t('team.photoRequirements') }}</p>
                </div>
              </div>

              <!-- Nom complet -->
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">
                  {{ t('team.fullName') }}
                  <span class="text-red-500">*</span>
                </label>
                <input  
                  v-model="editForm.name"
                  type="text"
                  required
                  class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  :placeholder="t('team.enterFullName')"
                />
              </div>

              <!-- Email -->
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">
                  {{ t('team.email') }}
                  <span class="text-red-500">*</span>
                </label>
                <input
                  v-model="editForm.email"
                  type="email"
                  required
                  class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  :placeholder="t('team.enterEmail')"
                />
              </div>

              <!-- Téléphone -->
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">
                  {{ t('team.phone') }}
                </label>
                <input
                  v-model="editForm.phone"
                  type="tel"
                  class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  :placeholder="t('team.enterPhone')"
                />
              </div>

              <!-- Département -->
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">
                  {{ t('team.department') }}
                </label>
                <select
                  v-model="editForm.department"
                  class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">{{ t('team.selectDepartment') }}</option>
                  <option v-for="dept in departments" :key="dept.value" :value="dept.value">
                    {{ dept.label }}
                  </option>
                </select>
              </div>

              <!-- Titre du poste -->
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">
                  {{ t('team.jobTitle') }}
                </label>
                <input
                  v-model="editForm.job_title"
                  type="text"
                  class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  :placeholder="t('team.enterJobTitle')"
                />
              </div>

              <!-- Compétences -->
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">
                  {{ t('team.skills') }}
                </label>
                <div class="flex flex-wrap gap-2 mb-2">
                  <span
                    v-for="skill in editForm.skills"
                    :key="skill"
                    class="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
                  >
                    {{ skill }}
                    <button  
                      type="button"
                      @click="removeSkill(skill)"
                      class="ml-1 text-blue-600 hover:text-blue-800"
                    >
                      <i class="fas fa-times text-xs"></i>
                    </button>
                  </span>
                </div>
                <div class="flex">
                  <input
                    v-model="newSkill"
                    @keyup.enter="addSkill"
                    type="text"
                    class="flex-1 px-3 py-2 border border-gray-300 rounded-l-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    :placeholder="t('team.enterSkill')"
                  />
                  <button
                    type="button"
                    @click="addSkill"
                    class="px-4 py-2 bg-blue-600 text-white rounded-r-md hover:bg-blue-700"
                  >
                    <i class="fas fa-plus"></i>
                  </button>
                </div>
              </div>
            </div>

            <!-- Rôle et permissions -->
            <div v-if="activeTab === 'role'" class="space-y-4">
              <!-- Rôle -->
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">
                  {{ t('team.role') }}
                  <span class="text-red-500">*</span>
                </label>
                <select 
                  v-model="editForm.role"
                  required
                  class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">{{ t('team.selectRole') }}</option>
                  <option v-for="role in availableRoles" :key="role.value" :value="role.value">
                    {{ role.label }}
                  </option>
                </select>
                <p class="text-xs text-gray-600 mt-1">{{ getRoleDescription(editForm.role) }}</p>
              </div>
              
              <!-- Permissions personnalisées -->
              <div v-if="canCustomizePermissions">
                <label class="block text-sm font-medium text-gray-700 mb-3">
                  {{ t('team.customPermissions') }}
                </label>
                <div class="space-y-3">
                  <div 
                    v-for="permission in availablePermissions"
                    :key="permission.value"
                    class="flex items-start space-x-3 p-3 border border-gray-200 rounded-lg"
                  >
                    <input
                      v-model="editForm.permissions"
                      type="checkbox"
                      :value="permission.value"
                      :id="permission.value"
                      class="mt-1"
                    >
                    <div class="flex-1">
                      <label :for="permission.value" class="text-sm font-medium text-gray-900 cursor-pointer">
                        {{ permission.label }}
                      </label>
                      <p class="text-xs text-gray-600 mt-1">{{ permission.description }}</p>
                    </div>
                  </div>
                </div>
              </div>
              
              <!-- Accès aux projets -->
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">
                  {{ t('team.projectAccess') }}
                </label>
                <div class="space-y-2">
                  <label class="flex items-center">
                    <input
                      v-model="editForm.project_access"
                      type="radio"
                      value="all"
                      class="mr-2"
                    >
                    <div class="flex-1">
                      <span class="text-sm font-medium text-gray-900">{{ t('team.allProjects') }}</span>
                      <p class="text-xs text-gray-600">{{ t('team.allProjectsDesc') }}</p>
                    </div>
                  </label>
                  <label class="flex items-center">
                    <input
                      v-model="editForm.project_access"
                      type="radio"
                      value="assigned"
                      class="mr-2"
                    >
                    <div class="flex-1">
                      <span class="text-sm font-medium text-gray-900">{{ t('team.assignedProjects') }}</span>
                      <p class="text-xs text-gray-600">{{ t('team.assignedProjectsDesc') }}</p>
                    </div>
                  </label>
                </div>
              </div>
            </div>

            <!-- Paramètres -->
            <div v-if="activeTab === 'settings'" class="space-y-4">
              <!-- Statut -->
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">
                  {{ t('team.status') }}
                </label>
                <select
                  v-model="editForm.status"
                  class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="active">{{ t('team.status.active') }}</option>
                  <option value="inactive">{{ t('team.status.inactive') }}</option>
                  <option value="suspended">{{ t('team.status.suspended') }}</option>
                </select>
              </div>

              <!-- Notifications -->
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-3">
                  {{ t('team.notifications') }}
                </label>
                <div class="space-y-2">
                  <label class="flex items-center">
                    <input
                      v-model="editForm.notifications.email"
                      type="checkbox"
                      class="mr-2"
                    >
                    <span class="text-sm text-gray-700">{{ t('team.emailNotifications') }}</span>
                  </label>
                  <label class="flex items-center">
                    <input
                      v-model="editForm.notifications.push"
                      type="checkbox"
                      class="mr-2"
                    >
                    <span class="text-sm text-gray-700">{{ t('team.pushNotifications') }}</span>
                  </label>
                  <label class="flex items-center">
                    <input
                      v-model="editForm.notifications.sms"
                      type="checkbox"
                      class="mr-2"
                    >
                    <span class="text-sm text-gray-700">{{ t('team.smsNotifications') }}</span>
                  </label>
                </div>
              </div>

              <!-- Fuseau horaire -->
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">
                  {{ t('team.timezone') }}
                </label>
                <select
                  v-model="editForm.timezone"
                  class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option v-for="tz in timezones" :key="tz.value" :value="tz.value">
                    {{ tz.label }}
                  </option>
                </select>
              </div>

              <!-- Langue -->
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">
                  {{ t('team.language') }}
                </label>
                <select
                  v-model="editForm.language"
                  class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option v-for="lang in languages" :key="lang.value" :value="lang.value">
                    {{ lang.label }}
                  </option>
                </select>
              </div>

              <!-- Taux horaire -->
              <div v-if="canEditBilling">
                <label class="block text-sm font-medium text-gray-700 mb-2">
                  {{ t('team.hourlyRate') }}
                </label>
                <div class="flex">
                  <span class="inline-flex items-center px-3 py-2 rounded-l-md border border-r-0 border-gray-300 bg-gray-50 text-gray-500 text-sm">
                    €
                  </span>
                  <input
                    v-model="editForm.hourly_rate"
                    type="number"
                    min="0"
                    step="0.01"
                    class="flex-1 px-3 py-2 border border-gray-300 rounded-r-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    :placeholder="t('team.enterHourlyRate')"
                  />
                </div>
              </div>

              <!-- Supprimer le membre -->
              <div v-if="canRemoveMember" class="pt-4 border-t border-gray-200">
                <button
                  type="button"
                  @click="confirmRemoveMember"
                  class="px-4 py-2 text-sm font-medium text-red-700 bg-red-100 rounded-md hover:bg-red-200"
                >
                  {{ t('team.removeMember') }}
                </button>
              </div>
            </div>
          </div>

          <!-- Actions -->
          <div class="flex justify-end space-x-3 pt-6 border-t border-gray-200 mt-6">
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
              class="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
            >
              <i v-if="loading" class="fas fa-spinner fa-spin mr-2"></i>
              {{ t('common.save') }}
            </button>
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
    
    const timezones = ref([
      { value: 'Europe/Paris', label: 'Europe/Paris (CET)' },
      { value: 'Europe/London', label: 'Europe/London (GMT)' },
      { value: 'America/New_York', label: 'America/New_York (EST)' },
      { value: 'America/Los_Angeles', label: 'America/Los_Angeles (PST)' },
      { value: 'Asia/Tokyo', label: 'Asia/Tokyo (JST)' }
    ])
    
    const languages = ref([
      { value: 'fr', label: 'Français' },
      { value: 'en', label: 'English' },
      { value: 'es', label: 'Español' },
      { value: 'de', label: 'Deutsch' }
    ])
    
    // Computed properties
    const canCustomizePermissions = computed(() => {
      return user.value?.role === 'admin' && editForm.value.role !== 'admin'
    })
    
    const canEditBilling = computed(() => {
      return user.value?.role === 'admin' || user.value?.permissions?.includes('manage_billing')
    })
    
    const canRemoveMember = computed(() => {
      return user.value?.role === 'admin' && user.value?.id !== props.member.id
    })
    
    // Methods
    const closeModal = () => {
      emit('close')
    }
    
    const initializeForm = () => {
      editForm.value = {
        name: props.member.name || '',
        email: props.member.email || '',
        phone: props.member.phone || '',
        department: props.member.department || '',
        job_title: props.member.job_title || '',
        skills: props.member.skills || [],
        role: props.member.role || '',
        permissions: props.member.permissions || [],
        project_access: props.member.project_access || 'assigned',
        status: props.member.status || 'active',
        notifications: {
          email: props.member.notifications?.email ?? true,
          push: props.member.notifications?.push ?? true,
          sms: props.member.notifications?.sms ?? false
        },
        timezone: props.member.timezone || 'Europe/Paris',
        language: props.member.language || 'fr',
        hourly_rate: props.member.hourly_rate || 0,
        avatar: props.member.avatar || ''
      }
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
      if (newSkill.value.trim() && !editForm.value.skills.includes(newSkill.value.trim())) {
        editForm.value.skills.push(newSkill.value.trim())
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
      try {
        loading.value = true
        
        const response = await projectManagementService.updateMember(props.projectId, props.member.id, editForm.value)
        
        if (response.success) {
          success(t('team.memberUpdated'))
          emit('updated', response.data)
          closeModal()
        } else {
          showError(response.message || t('errors.updateMember'))
        }
      } catch (error) {
        console.error('Erreur lors de la mise à jour du membre:', error)
        showError(t('errors.updateMember'))
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
      try {
        loading.value = true
        
        const response = await projectManagementService.removeMember(props.projectId, props.member.id)
        
        if (response.success) {
          success(t('team.memberRemoved'))
          emit('removed', props.member)
          closeModal()
        } else {
          showError(response.message || t('errors.removeMember'))
        }
      } catch (error) {
        console.error('Erreur lors de la suppression du membre:', error)
        showError(t('errors.removeMember'))
      } finally {
        loading.value = false
      }
    }
    
    // Lifecycle
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

<style scoped>
/* Styles spécifiques au composant */
</style>