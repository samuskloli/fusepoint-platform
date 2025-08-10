<template>
  <div  class="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50' @click="closeModal=relative top-20 mx-auto p-5 border w-11/12 md:w-4/5 lg:w-3/4 xl:w-2 3 shadow-lg rounded-lg bg-white(flex items-center justify-between pb-4 border-b border-gray-200'>
        <div class="flex items-center space-x-3>
          <div  class="w-10 h-10 rounded-lg flex items-center justify-center=priorityConfig.bgColor [priorityConfig.icon, priorityConfig.textColor]'></i>
          </div>
          <div>
            <h3 class="text-lg font-medium text-gray-900>{{ task.title }}</h3>
            <div  class="flex items-center space-x-4 text-sm text-gray-600'>
              <span class="flex items-center=fas fa-project-diagram mr-1></i>
                {{ task.project?.name }}
              </span>
              <span  class="flex items-center=fas fa-calendar mr-1'></i>
                {{ t('tasks.createdOn="flex items-center space-x-2>
          <button  
            v-if="canEdit=editTask=p-2 text-gray-400 hover:text-gray-600'
            :title="t('common.edit=closeModal=p-2 text-gray-400 hover:text-gray-600>
            <i  class=""fas fa-times text-xl=mt-6'>
        <!-- Onglets -->
        <div class="mb-6>
          <nav  class="flex space-x-8' aria-label="Tabs=tab in tabs="tab.id='button{
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
        <div class: tab-content=activeTab === 'details grid grid-cols-1 lg:grid-cols-3 gap-6>
            <!-- Colonne principale -->
            <div  class="lg:col-span-2 space-y-6'>
              <!-- Statut et priorité -->
              <div class="bg-gray-50 rounded-lg p-4>
                <div  class="grid grid-cols-2 md:grid-cols-4 gap-4'>
                  <div>
                    <label class="block text-sm font-medium text-gray-700 mb-1>{{ t('tasks.status="flex items-center space-x-2'>
                      <div  class="w-3 h-3 rounded-full=statusConfig.color text-sm font-medium="statusConfig.textColor=block text-sm font-medium text-gray-700 mb-1'>{{ t('tasks.priority="flex items-center space-x-2>
                      <i  :class="[priorityConfig.icon, priorityConfig.textColor]'></i>
                      <span class: text-sm font-medium=priorityConfig.textColor=block text-sm font-medium text-gray-700 mb-1'>{{ t('tasks.progress="flex items-center space-x-2">
                      <div  class="flex-1 bg-gray-200 rounded-full h-2'>
                        <div class class="bg-blue-600 h-2 rounded-full={ width: task.progress + '%' }></div>
                      </div>
                      <span  class class="text-sm font-medium text-gray-700'>{{ task.progress }}%</span>
                    </div>
                  </div>
                  
                  <div>
                    <label class="block text-sm font-medium text-gray-700 mb-1>{{ t('tasks.category === inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800'>
                      {{ task.category || t('tasks.noCategory === text-sm font-medium text-gray-700 mb-3">{{ t('tasks.description === prose prose-sm max-w-none=task.description || t('tasks.noDescription='grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label  class === block text-sm font-medium text-gray-700 mb-1'>{{ t('tasks.startDate === flex items-center space-x-2 text-sm text-gray-600>
                    <i  class === fas fa-calendar-plus=block text-sm font-medium text-gray-700 mb-1'>{{ t('tasks.dueDate === flex items-center space-x-2 text-sm=dueDateClass=fas fa-calendar-times='block text-sm font-medium text-gray-700 mb-1">{{ t('tasks.estimatedHours === flex items-center space-x-2 text-sm text-gray-600'>
                    <i class === fas fa-clock=task.tags && task.tags.length &gt; 0">
                <h 4 class === text-sm font-medium text-gray-700 mb-3'>{{ t('tasks.tags === flex flex-wrap gap-2>
                  <span 
                    v-for === tag in task.tags=tag=inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800'
                  >
                    {{ tag }}
                  </span>
                </div>
              </div>

              <!-- Dépendances -->
              <div v-if="task.dependencies && task.dependencies.length &gt; 0>
                <h 4 class="text-sm font-medium text-gray-700 mb-3'>{{ t('tasks.dependencies === space-y-2>
                  <div
                    v-for === dependency in task.dependencies=dependency.id=flex items-center justify-between p-3 bg-gray-50 rounded-lg='flex items-center space-x-3">
                      <div  class class === w-3 h-3 rounded-full=getTaskStatusColor(dependency.status)'></div>
                      <span class class === text-sm font-medium text-gray-700>{{ dependency.title }}</span>
                    </div>
                    <span  class class="text-xs text-gray-500'>{{ t('tasks.dependencyType.' + dependency.type) }}</span>
                  </div>
                </div>
              </div>
            </div>

            <!-- Colonne latérale -->
            <div class="space-y-6>
              <!-- Assigné à -->
              <div>
                <h 4 class="text-sm font-medium text-gray-700 mb-3'>{{ t('tasks.assignedTo === task.assignees && task.assignees.length &gt; 0 class === space-y-2'>
                  <div 
                    v-for === assignee in task.assignees=assignee.id=flex items-center space-x-3 p-2 bg-gray-50 rounded-lg === assignee.avatar || ' default-avatar.png=assignee.name='w-8 h-8 rounded-full === flex-1>
                      <p  class === text-sm font-medium text-gray-700'>{{ assignee.name }}</p>
                      <p class="text-xs text-gray-500>{{ assignee.role }}</p>
                    </div>
                  </div>
                </div>
                <div  v-else class="text-sm text-gray-500'>
                  {{ t('tasks.noAssignees="text-sm font-medium text-gray-700 mb-3>{{ t('tasks.timeTracking="space-y-2'>
                  <div class="flex justify-between text-sm=text-gray-600">{{ t('tasks.timeSpent="font-medium=flex justify-between text-sm='text-gray-600">{{ t('tasks.estimatedTime="font-medium=flex justify-between text-sm='text-gray-600">{{ t('tasks.remaining="font-medium=remainingTimeClass='w-full bg-gray-200 rounded-full h-2">
                    <div
                      class="h-2 rounded-full=timeProgressClass='{ width: Math.min(100, ((task.timeSpent || 0)   (task.estimatedHours || 1)) * 100) + '%' }"
                    ></div>
                  </div>
                </div>
              </div>

              <!-- Budget -->
              <div  v-if="task.budget=text-sm font-medium text-gray-700 mb-3'>{{ t('tasks.budget === space-y-2>
                  <div  class === flex justify-between text-sm=text-gray-600'>{{ t('tasks.budgetAllocated === font-medium=flex justify-between text-sm=text-gray-600'>{{ t('tasks.budgetSpent === font-medium=flex justify-between text-sm === text-gray-600'>{{ t('tasks.budgetRemaining === font-medium=remainingBudgetClass === canEdit='text-sm font-medium text-gray-700 mb-3">{{ t('tasks.quickActions === space-y-2'>
                  <button  
                    @click === updateStatus('in_progress=task.status === 'in_progress(w-full px-3 py-2 text-sm bg-blue-50 text-blue-700 rounded-md hover:bg-blue-100 disabled:opacity-50'
                  >
                    <i class === "fas fa-play mr-2></i>
                    {{ t('tasks.startTask === updateStatus('completed=task.status === 'completed='w-full px-3 py-2 text-sm bg-green-50 text-green-700 rounded-md hover:bg-green-100 disabled:opacity-50"
                  >
                    <i  class === fas fa-check mr-2'></i>
                    {{ t('tasks.completeTask === updateStatus('on_hold=task.status === 'on_hold=w-full px-3 py-2 text-sm bg-yellow-50 text-yellow-700 rounded-md hover:bg-yellow-100 disabled:opacity-50'
                  >
                    <i class === fas fa-pause mr-2"></i>
                    {{ t('tasks.pauseTask === activeTab === 'comments=space-y-6'>
            <!-- Nouveau commentaire -->
            <div v-if === canComment=bg-gray-50 rounded-lg p-4">
              <h 4 class === text-sm font-medium text-gray-700 mb-3'>{{ t('tasks.addComment === addComment=newComment=3'
                  class === w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  :placeholder === t('tasks.commentPlaceholder=flex items-center space-x-2'>
                    <input  
                      v-model === commentIsPrivate=checkbox=private-comment === rounded=private-comment='text-sm text-gray-600>
                      {{ t('tasks.privateComment === "submit=!newComment.trim() || addingComment='px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
                  >
                    <i  v-if === addingComment=fas fa-spinner fa-spin mr-2'></i>
                    {{ t('tasks.postComment === space-y-4>
              <div 
                v-for === comment in task.comments=comment.id=bg-white border border-gray-200 rounded-lg p-4'
              >
                <div class === flex items-start space-x-3>
                  <img
                    :src === comment.author.avatar || ' default-avatar.png=comment.author.name=w-8 h-8 rounded-full='flex-1">
                    <div  class === flex items-center space-x-2 mb-1'>
                      <span class class === text-sm font-medium text-gray-700>{{ comment.author.name }}</span>
                      <span  class class="text-xs text-gray-500'>{{ formatDate(comment.createdAt) }}</span>
                      <span v-if="comment.isPrivate=inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-red-100 text-red-800>
                        <i  class="fas fa-lock mr-1'></i>
                        {{ t('tasks.private === prose prose-sm max-w-none=comment.content=canEditComment(comment)' class === flex items-center space-x-3 mt-2">
                      <button  
                        @click === editComment(comment)'
                        class(text-xs text-gray-500 hover:text-gray-700
                      >
                        {{ t('common.edit === "deleteComment(comment.id)'
                        class === text-xs text-red-500 hover:text-red-700"
                      >
                        {{ t('common.delete === !task.comments || task.comments.length === 0' class === text-center py-8 text-gray-500">
                <i  class === fas fa-comments text-3xl mb-2'></i>
                <p>{{ t('tasks.noComments === activeTab === 'files=space-y-6>
            <!-- Upload de fichiers -->
            <div  v-if === canUploadFiles=bg-gray-50 rounded-lg p-4'>
              <h4 class === text-sm font-medium text-gray-700 mb-3>{{ t('tasks.uploadFiles === handleFileDrop=border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-gray-400 transition-colors='fas fa-cloud-upload-alt text-3xl text-gray-400 mb-2"></i>
                <p  class === text-sm text-gray-600 mb-2'>{{ t('tasks.dropFilesHere === fileInput=file=handleFileSelect='hidden=$refs.fileInput.click()"
                  class === px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700'
                >
                  {{ t('tasks.selectFiles === space-y-3">
              <div 
                v-for === file in task.files=file.id=flex items-center justify-between p-3 bg-white border border-gray-200 rounded-lg hover:bg-gray-50'
              >
                <div class === flex items-center space-x-3>
                  <div  class === w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center=getFileIcon(file.type)' class === text-gray-600></i>
                  </div>
                  <div>
                    <p  class === text-sm font-medium text-gray-700'>{{ file.name }}</p>
                    <p class="text-xs text-gray-500>
                      {{ formatFileSize(file.size) }} • {{ t('tasks.uploadedBy === flex items-center space-x-2'>
                  <button  
                    @click === downloadFile(file)"
                    class === p-2 text-gray-400 hover:text-gray-600'
                    :title === t('common.download=canDeleteFile(file)""
                    @click === deleteFile(file.id)'
                    class(p-2 text-red-400 hover:text-red-600""
                    :title === t('common.delete=!task.files || task.files.length === 0' class === text-center py-8 text-gray-500>
                <i  class === "fas fa-file text-3xl mb-2'></i>
                <p>{{ t('tasks.noFiles === activeTab === 'history=space-y-4>
            <div  class === space-y-3'>
              <div
                v-for === activity in task.activities=activity.id=flex items-start space-x-3 p-3 bg-gray-50 rounded-lg=w-8 h-8 rounded-full flex items-center justify-center=getActivityIcon(activity.type).bgColor='[getActivityIcon(activity.type).icon, getActivityIcon(activity.type).textColor]"></i>
                </div>
                <div  class === flex-1'>
                  <div class === flex items-center space-x-2 mb-1>
                    <span  class class === text-sm font-medium text-gray-700'>{{ activity.user.name }}</span>
                    <span class class="text-xs text-gray-500>{{ formatDate(activity.createdAt) }}</span>
                  </div>
                  <p  class="text-sm text-gray-600'>{{ t(activity.description, activity.data) }}</p>
                  <div v-if="activity.changes=mt-2 text-xs text-gray-500>
                    <div  v-for="change in activity.changes=change.field=flex items-center space-x-2'>
                      <span class="font-medium=line-through=fas fa-arrow-right='font-medium=!task.activities || task.activities.length === 0" class="text-center py-8 text-gray-500'>
                <i class="fas fa-history text-3xl mb-2"></i>
                <p>{{ t('tasks.noActivity') }}</p>
              </div>
            </div>
          </div>
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
  name: 'TaskDetailsModal',
  props: {
    taskId: {
      type: String,
      required: true
    },
    task: {
      type: Object,
      default: () => ({})
    }
  },
  emits: ['close', 'update', 'edit'],
  setup(props, { emit }) {
    const { t } = useTranslation()

    const { success, error: showError } = useNotifications()
    const { user, hasPermission } = useAuth()
    const { t } = useTranslation()
    
    const activeTab = ref('details')
    const newComment = ref('')
    const commentIsPrivate = ref(false)
    const addingComment = ref(false)
    
    const tabs = ref([
      { id: 'details', label: 'tasks.tabs.details', icon: 'fas fa-info-circle' },
      { id: 'comments', label: 'tasks.tabs.comments', icon: 'fas fa-comments' },
      { id: 'files', label: 'tasks.tabs.files', icon: 'fas fa-paperclip' },
      { id: 'history', label: 'tasks.tabs.history', icon: 'fas fa-history' }
    ])
    
    const statusConfig = computed(() => {
      const configs = {
        todo: {
          label: 'tasks.status.todo',
          color: 'bg-gray-400',
          textColor: 'text-gray-700'
        },
        in_progress: {
          label: 'tasks.status.inProgress',
          color: 'bg-blue-400',
          textColor: 'text-blue-700'
        },
        review: {
          label: 'tasks.status.review',
          color: 'bg-yellow-400',
          textColor: 'text-yellow-700'
        },
        completed: {
          label: 'tasks.status.completed',
          color: 'bg-green-400',
          textColor: 'text-green-700'
        },
        on_hold: {
          label: 'tasks.status.onHold',
          color: 'bg-orange-400',
          textColor: 'text-orange-700'
        },
        cancelled: {
          label: 'tasks.status.cancelled',
          color: 'bg-red-400',
          textColor: 'text-red-700'
        }
      }
      return configs[props.task.status] || configs.todo
    })
    
    const priorityConfig = computed(() => {
      const configs = {
        low: {
          label: 'tasks.priority.low',
          icon: 'fas fa-arrow-down',
          bgColor: 'bg-green-100',
          textColor: 'text-green-600'
        },
        medium: {
          label: 'tasks.priority.medium',
          icon: 'fas fa-minus',
          bgColor: 'bg-yellow-100',
          textColor: 'text-yellow-600'
        },
        high: {
          label: 'tasks.priority.high',
          icon: 'fas fa-arrow-up',
          bgColor: 'bg-orange-100',
          textColor: 'text-orange-600'
        },
        urgent: {
          label: 'tasks.priority.urgent',
          icon: 'fas fa-exclamation',
          bgColor: 'bg-red-100',
          textColor: 'text-red-600'
        }
      }
      return configs[props.task.priority] || configs.medium
    })
    
    const dueDateClass = computed(() => {
      if (!props.task.dueDate) return 'text-gray-600'
      
      const dueDate = new Date(props.task.dueDate)
      const now = new Date()
      const diffDays = Math.ceil((dueDate - now) / (1000 * 60 * 60 * 24))
      
      if (diffDays < 0) return 'text-red-600'
      if (diffDays <= 3) return 'text-orange-600'
      return 'text-gray-600'
    })
    
    const remainingTimeClass = computed(() => {
      const remaining = (props.task.estimatedHours || 0) - (props.task.timeSpent || 0)
      if (remaining < 0) return 'text-red-600'
      if (remaining <= 2) return 'text-orange-600'
      return 'text-green-600'
    })
    
    const timeProgressClass = computed(() => {
      const progress = ((props.task.timeSpent || 0) / (props.task.estimatedHours || 1)) * 100
      if (progress > 100) return 'bg-red-600'
      if (progress > 80) return 'bg-orange-600'
      return 'bg-blue-600'
    })
    
    const remainingBudgetClass = computed(() => {
      const remaining = (props.task.budget || 0) - (props.task.budgetSpent || 0)
      if (remaining < 0) return 'text-red-600'
      if (remaining <= (props.task.budget || 0) * 0.2) return 'text-orange-600'
      return 'text-green-600'
    })
    
    const canEdit = computed(() => {
      return hasPermission('tasks.edit') || props.task.assignees?.some(a => a.id === user.value?.id)
    })
    
    const canComment = computed(() => {
      return hasPermission('tasks.comment') || props.task.assignees?.some(a => a.id === user.value?.id)
    })
    
    const canUploadFiles = computed(() => {
      return hasPermission('tasks.upload') || props.task.assignees?.some(a => a.id === user.value?.id)
    })
    
    const closeModal = () => {
      emit('close')
    }
    
    const editTask = () => {
      emit('edit', props.task)
    }
    
    const updateStatus = async (newStatus) => {
      try {
        await projectManagementService.updateTaskStatus(props.taskId, newStatus)
        emit('update', { ...props.task, status: newStatus })
        success(t('tasks.statusUpdated'))
      } catch (err) {
        showError(t('tasks.statusUpdateError'))
      }
    }
    
    const addComment = async () => {
      if (!newComment.value.trim()) return
      
      addingComment.value = true
      try {
        const comment = await projectManagementService.addTaskComment(props.taskId, {
          content: newComment.value,
          isPrivate: commentIsPrivate.value
        })
        
        props.task.comments = props.task.comments || []
        props.task.comments.unshift(comment)
        
        newComment.value = ''
        commentIsPrivate.value = false
        success(t('tasks.commentAdded'))
      } catch (err) {
        showError(t('tasks.commentAddError'))
      } finally {
        addingComment.value = false
      }
    }
    
    const editComment = (comment) => {
      // Logique d'édition de commentaire
      console.log('Edit comment:', comment)
    }
    
    const deleteComment = async (commentId) => {
      if (!confirm(t('tasks.confirmDeleteComment'))) return
      
      try {
        await projectManagementService.deleteTaskComment(commentId)
        props.task.comments = props.task.comments.filter(c => c.id !== commentId)
        success(t('tasks.commentDeleted'))
      } catch (err) {
        showError(t('tasks.commentDeleteError'))
      }
    }
    
    const canEditComment = (comment) => {
      return comment.author.id === user.value?.id || hasPermission('tasks.moderate')
    }
    
    const handleFileDrop = (event) => {
      event.preventDefault()
      const files = Array.from(event.dataTransfer.files)
      uploadFiles(files)
    }
    
    const handleFileSelect = (event) => {
      const files = Array.from(event.target.files)
      uploadFiles(files)
    }
    
    const uploadFiles = async (files) => {
      try {
        for (const file of files) {
          const uploadedFile = await projectManagementService.uploadTaskFile(props.taskId, file)
          props.task.files = props.task.files || []
          props.task.files.unshift(uploadedFile)
        }
        success(t('tasks.filesUploaded'))
      } catch (err) {
        showError(t('tasks.fileUploadError'))
      }
    }
    
    const downloadFile = async (file) => {
      try {
        const url = await projectManagementService.getFileDownloadUrl(file.id)
        const link = document.createElement('a')
        link.href = url
        link.download = file.name
        link.click()
      } catch (err) {
        showError(t('tasks.fileDownloadError'))
      }
    }
    
    const deleteFile = async (fileId) => {
      if (!confirm(t('tasks.confirmDeleteFile'))) return
      
      try {
        await projectManagementService.deleteTaskFile(fileId)
        props.task.files = props.task.files.filter(f => f.id !== fileId)
        success(t('tasks.fileDeleted'))
      } catch (err) {
        showError(t('tasks.fileDeleteError'))
      }
    }
    
    const canDeleteFile = (file) => {
      return file.uploadedBy.id === user.value?.id || hasPermission('tasks.moderate')
    }
    
    const getFileIcon = (fileType) => {
      const icons = {
        'image/': 'fas fa-image',
        'video/': 'fas fa-video',
        'audio/': 'fas fa-music',
        'application/pdf': 'fas fa-file-pdf',
        'application/msword': 'fas fa-file-word',
        'application/vnd.ms-excel': 'fas fa-file-excel',
        'application/vnd.ms-powerpoint': 'fas fa-file-powerpoint',
        'text/': 'fas fa-file-alt',
        'application/zip': 'fas fa-file-archive'
      }
      
      for (const [type, icon] of Object.entries(icons)) {
        if (fileType.startsWith(type)) return icon
      }
      
      return 'fas fa-file'
    }
    
    const getTaskStatusColor = (status) => {
      const colors = {
        todo: 'bg-gray-400',
        in_progress: 'bg-blue-400',
        review: 'bg-yellow-400',
        completed: 'bg-green-400',
        on_hold: 'bg-orange-400',
        cancelled: 'bg-red-400'
      }
      return colors[status] || 'bg-gray-400'
    }
    
    const getActivityIcon = (type) => {
      const icons = {
        created: {
          icon: 'fas fa-plus',
          bgColor: 'bg-green-100',
          textColor: 'text-green-600'
        },
        updated: {
          icon: 'fas fa-edit',
          bgColor: 'bg-blue-100',
          textColor: 'text-blue-600'
        },
        status_changed: {
          icon: 'fas fa-exchange-alt',
          bgColor: 'bg-yellow-100',
          textColor: 'text-yellow-600'
        },
        assigned: {
          icon: 'fas fa-user-plus',
          bgColor: 'bg-purple-100',
          textColor: 'text-purple-600'
        },
        comment_added: {
          icon: 'fas fa-comment',
          bgColor: 'bg-gray-100',
          textColor: 'text-gray-600'
        },
        file_uploaded: {
          icon: 'fas fa-upload',
          bgColor: 'bg-indigo-100',
          textColor: 'text-indigo-600'
        }
      }
      return icons[type] || icons.updated
    }
    
    const formatDate = (date) => {
      if (!date) return ''
      return new Date(date).toLocaleDateString('fr-FR', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      })
    }
    
    const formatFileSize = (bytes) => {
      if (bytes === 0) return '0 Bytes'
      const k = 1024
      const sizes = ['Bytes', 'KB', 'MB', 'GB']
      const i = Math.floor(Math.log(bytes) / Math.log(k))
      return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
    }
    
    const formatCurrency = (amount) => {
      return new Intl.NumberFormat('fr-FR', {
        style: 'currency',
        currency: 'EUR'
      }).format(amount)
    }
    
    return {
      activeTab,
      tabs,
      newComment,
      commentIsPrivate,
      addingComment,
      statusConfig,
      priorityConfig,
      dueDateClass,
      remainingTimeClass,
      timeProgressClass,
      remainingBudgetClass,
      canEdit,
      canComment,
      canUploadFiles,
      closeModal,
      editTask,
      updateStatus,
      addComment,
      editComment,
      deleteComment,
      canEditComment,
      handleFileDrop,
      handleFileSelect,
      downloadFile,
      deleteFile,
      canDeleteFile,
      getFileIcon,
      getTaskStatusColor,
      getActivityIcon,
      formatDate,
      formatFileSize,
      formatCurrency,
      t
    }
  }
}
</script>

<style scoped>
.tab-content {
  min-height: 500px;
}

.prose {
  max-width: none;
}

.prose p {
  margin-bottom: 0.5rem;
}

.task-details-modal {
  max-height: 90vh;
  overflow-y: auto;
}

.priority-badge {
  transition: all 0.2s ease;
}

.status-badge {
  transition: all 0.2s ease;
}

.comment-card {
  transition: all 0.2s ease;
}

.comment-card:hover {
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.file-card {
  transition: all 0.2s ease;
}

.file-card:hover {
  background-color: #f9fafb;
}

.activity-item {
  transition: all 0.2s ease;
}

.drop-zone {
  transition: all 0.2s ease;
}

.drop-zone:hover {
  border-color: #6b7280;
}
</style>