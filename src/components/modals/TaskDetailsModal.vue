<template>
  <div class="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50" @click="closeModal">
    <div class="relative top-20 mx-auto p-5 border w-11/12 md:w-4/5 lg:w-3/4 xl:w-2/3 shadow-lg rounded-lg bg-white" @click.stop>
      <!-- En-tête -->
      <div class="flex items-center justify-between pb-4 border-b border-gray-200">
        <div class="flex items-center space-x-3">
          <div class="w-10 h-10 rounded-lg flex items-center justify-center" :class="priorityConfig.bgColor">
            <i :class="[priorityConfig.icon, priorityConfig.textColor]"></i>
          </div>
          <div>
            <h3 class="text-lg font-medium text-gray-900">{{ task.title }}</h3>
            <div class="flex items-center space-x-4 text-sm text-gray-600">
              <span class="flex items-center">
                <i class="fas fa-project-diagram mr-1"></i>
                {{ task.project?.name }}
              </span>
              <span class="flex items-center">
                <i class="fas fa-calendar mr-1"></i>
                {{ t('tasks.createdOn') }} {{ formatDate(task.created_at) }}
              </span>
            </div>
          </div>
        </div>
        <div class="flex items-center space-x-2">
          <button  
            v-if="canEdit"
            @click="editTask"
            class="p-2 text-gray-400 hover:text-gray-600"
            :title="t('common.edit')"
          >
            <i class="fas fa-edit"></i>
          </button>
          <button
            @click="closeModal"
            class="p-2 text-gray-400 hover:text-gray-600"
          >
            <i class="fas fa-times text-xl"></i>
          </button>
        </div>
      </div>

      <div class="mt-6">
        <!-- Onglets -->
        <TabsComponent
          :tabs="tabs"
          :active-tab="activeTab"
          @tab-change="activeTab = $event"
        />

        <!-- Contenu des onglets -->
        <div class="tab-content" v-if="activeTab === 'details'">
          <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <!-- Colonne principale -->
            <div class="lg:col-span-2 space-y-6">
              <!-- Statut et priorité -->
              <div class="bg-gray-50 rounded-lg p-4">
                <div class="grid grid-cols-2 md:grid-cols-3 gap-4">
                  <div>
                    <label class="block text-sm font-medium text-gray-700 mb-1">{{ t('tasks.status') }}</label>
                    <div class="flex items-center space-x-2">
                      <div class="w-3 h-3 rounded-full" :class="statusConfig.color"></div>
                      <span class="text-sm font-medium" :class="statusConfig.textColor">
                        {{ t(statusConfig.label) }}
                      </span>
                    </div>
                  </div>
                  
                  <div>
                    <label class="block text-sm font-medium text-gray-700 mb-1">{{ t('tasks.priority') }}</label>
                    <div class="flex items-center space-x-2">
                      <i :class="[priorityConfig.icon, priorityConfig.textColor]"></i>
                      <span class="text-sm font-medium" :class="priorityConfig.textColor">
                        {{ t(priorityConfig.label) }}
                      </span>
                    </div>
                  </div>
                  
                  <div>
                    <label class="block text-sm font-medium text-gray-700 mb-1">{{ t('tasks.category') }}</label>
                    <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                      {{ task.category || t('tasks.noCategory') }}
                    </span>
                  </div>
                </div>
              </div>

              <!-- Description -->
              <div>
                <h4 class="text-sm font-medium text-gray-700 mb-3">{{ t('tasks.description') }}</h4>
                <div class="prose prose-sm max-w-none">
                  <p>{{ task.description || t('tasks.noDescription') }}</p>
                </div>
              </div>

              <!-- Dates et temps -->
              <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1">{{ t('tasks.startDate') }}</label>
                  <div class="flex items-center space-x-2 text-sm text-gray-600">
                    <i class="fas fa-calendar-plus"></i>
                    <span>{{ formatDate(task.start_date) || t('tasks.noStartDate') }}</span>
                  </div>
                </div>
                
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1">{{ t('tasks.dueDate') }}</label>
                  <div class="flex items-center space-x-2 text-sm" :class="dueDateClass">
                    <i class="fas fa-calendar-times"></i>
                    <span>{{ formatDate(task.due_date) || t('tasks.noDueDate') }}</span>
                  </div>
                </div>
                
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1">{{ t('tasks.estimatedTime') }}</label>
                  <div class="flex items-center space-x-2 text-sm text-gray-600">
                    <i class="fas fa-clock"></i>
                    <span>{{ task.estimated_hours ? task.estimated_hours + 'h' : t('tasks.noEstimation') }}</span>
                  </div>
                </div>
              </div>


            </div>

            <!-- Colonne latérale -->
            <div class="space-y-6">
              <!-- Assigné à -->
              <div>
                <h4 class="text-sm font-medium text-gray-700 mb-3">{{ t('tasks.assignedTo') }}</h4>
                <div v-if="task.assignees && task.assignees.length > 0" class="space-y-2">
                  <div 
                    v-for="assignee in task.assignees"
                    :key="assignee.id"
                    class="flex items-center space-x-3 p-2 bg-gray-50 rounded-lg"
                  >
                    <img 
                      :src="assignee.avatar || '/default-avatar.png'"
                      :alt="assignee.name"
                      class="w-8 h-8 rounded-full"
                    />
                    <div class="flex-1">
                      <p class="text-sm font-medium text-gray-700">{{ assignee.name }}</p>
                      <p class="text-xs text-gray-500">{{ assignee.role }}</p>
                    </div>
                  </div>
                </div>
                <div v-else class="text-sm text-gray-500">
                  {{ t('tasks.noAssignees') }}
                </div>
              </div>

              <!-- Suivi du temps -->
              <div>
                <h4 class="text-sm font-medium text-gray-700 mb-3">{{ t('tasks.timeTracking') }}</h4>
                <div class="space-y-2">
                  <div class="flex justify-between text-sm">
                    <span class="text-gray-600">{{ t('tasks.timeSpent') }}</span>
                    <span class="font-medium">{{ (task.timeSpent || 0) }}h</span>
                  </div>
                  <div class="flex justify-between text-sm">
                    <span class="text-gray-600">{{ t('tasks.estimatedTime') }}</span>
                    <span class="font-medium">{{ (task.estimated_hours || 0) }}h</span>
                  </div>
                  <div class="flex justify-between text-sm">
                    <span class="text-gray-600">{{ t('tasks.remaining') }}</span>
                    <span class="font-medium" :class="remainingTimeClass">
                      {{ Math.max(0, (task.estimated_hours || 0) - (task.timeSpent || 0)) }}h
                    </span>
                  </div>
                  <div class="w-full bg-gray-200 rounded-full h-2">
                    <div
                      class="h-2 rounded-full"
                      :class="timeProgressClass"
                      :style="{ width: Math.min(100, ((task.timeSpent || 0) / (task.estimated_hours || 1)) * 100) + '%' }"
                    ></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Onglet Commentaires -->
        <div class="tab-content" v-else-if="activeTab === 'comments'">
          <div class="space-y-4">
            <!-- Formulaire d'ajout de commentaire -->
            <div v-if="canComment" class="bg-gray-50 rounded-lg p-4">
              <textarea
                v-model="newComment"
                rows="3"
                class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                :placeholder="t('tasks.addComment')"
              ></textarea>
              <div class="flex items-center justify-between mt-3">
                <label class="flex items-center">
                  <input
                    v-model="commentIsPrivate"
                    type="checkbox"
                    class="rounded border-gray-300 text-blue-600 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
                  />
                  <span class="ml-2 text-sm text-gray-600">{{ t('tasks.privateComment') }}</span>
                </label>
                <button
                  @click="addComment"
                  :disabled="!newComment.trim() || addingComment"
                  class="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {{ addingComment ? t('common.adding') : t('common.add') }}
                </button>
              </div>
            </div>

            <!-- Liste des commentaires -->
            <div class="space-y-3">
              <div
                v-for="comment in task.comments"
                :key="comment.id"
                class="comment-card bg-white border border-gray-200 rounded-lg p-4"
              >
                <div class="flex items-start space-x-3">
                  <img
                    :src="comment.author?.avatar || '/default-avatar.png'"
                    :alt="comment.author?.name"
                    class="w-8 h-8 rounded-full"
                  />
                  <div class="flex-1">
                    <div class="flex items-center space-x-2">
                      <span class="text-sm font-medium text-gray-900">{{ comment.author?.name }}</span>
                      <span class="text-xs text-gray-500">{{ formatDate(comment.created_at) }}</span>
                      <span v-if="comment.is_private" class="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-yellow-100 text-yellow-800">
                        {{ t('tasks.private') }}
                      </span>
                    </div>
                    <p class="mt-1 text-sm text-gray-700">{{ comment.content }}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Onglet Fichiers -->
        <div class="tab-content" v-else-if="activeTab === 'files'">
          <div class="space-y-4">
            <!-- Zone de dépôt de fichiers -->
            <div v-if="canUploadFiles" class="drop-zone border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
              <i class="fas fa-cloud-upload-alt text-3xl text-gray-400 mb-2"></i>
              <p class="text-sm text-gray-600">{{ t('files.dropZone') }}</p>
              <input
                type="file"
                multiple
                @change="handleFileSelect"
                class="hidden"
                ref="fileInput"
              />
              <button
                @click="$refs.fileInput.click()"
                class="mt-2 px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700"
              >
                {{ t('files.selectFiles') }}
              </button>
            </div>

            <!-- Liste des fichiers -->
            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div
                v-for="file in task.files"
                :key="file.id"
                class="file-card border border-gray-200 rounded-lg p-4"
              >
                <div class="flex items-center space-x-3">
                  <i :class="[getFileIcon(file.type), 'text-2xl text-gray-500']"></i>
                  <div class="flex-1 min-w-0">
                    <p class="text-sm font-medium text-gray-900 truncate">{{ file.name }}</p>
                    <p class="text-xs text-gray-500">{{ formatFileSize(file.size) }}</p>
                  </div>
                  <div class="flex items-center space-x-1">
                    <button
                      @click="downloadFile(file)"
                      class="p-1 text-gray-400 hover:text-gray-600"
                      :title="t('files.download')"
                    >
                      <i class="fas fa-download"></i>
                    </button>
                    <button
                      v-if="canDeleteFile(file)"
                      @click="deleteFile(file)"
                      class="p-1 text-gray-400 hover:text-red-600"
                      :title="t('common.delete')"
                    >
                      <i class="fas fa-trash"></i>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Onglet Historique -->
        <div class="tab-content" v-else-if="activeTab === 'history'">
          <div class="space-y-3">
            <div
              v-for="activity in task.activities"
              :key="activity.id"
              class="activity-item flex items-start space-x-3 p-3 bg-gray-50 rounded-lg"
            >
              <div class="flex-shrink-0">
                <i :class="[getActivityIcon(activity.type), 'text-gray-500']"></i>
              </div>
              <div class="flex-1">
                <p class="text-sm text-gray-900">{{ activity.description }}</p>
                <p class="text-xs text-gray-500">{{ formatDate(activity.created_at) }}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, computed } from 'vue'
import { useTranslation } from '@/composables/useTranslation'
import { useNotifications } from '@/composables/useNotifications'
import { useAuth } from '@/composables/useAuth'
import TabsComponent from '@/components/ui/TabsComponent.vue'

export default {
  name: 'TaskDetailsModal',
  components: {
    TabsComponent
  },
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
        completed: {
          label: 'tasks.status.completed',
          color: 'bg-green-400',
          textColor: 'text-green-700'
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
          textColor: 'text-green-600',
          bgColor: 'bg-green-100'
        },
        medium: {
          label: 'tasks.priority.medium',
          icon: 'fas fa-minus',
          textColor: 'text-yellow-600',
          bgColor: 'bg-yellow-100'
        },
        high: {
          label: 'tasks.priority.high',
          icon: 'fas fa-arrow-up',
          textColor: 'text-red-600',
          bgColor: 'bg-red-100'
        },
        urgent: {
          label: 'tasks.priority.urgent',
          icon: 'fas fa-exclamation',
          textColor: 'text-red-700',
          bgColor: 'bg-red-200'
        }
      }
      return configs[props.task.priority] || configs.medium
    })
    
    const dueDateClass = computed(() => {
      if (!props.task.due_date) return 'text-gray-600'
      const dueDate = new Date(props.task.due_date)
      const now = new Date()
      const diffDays = Math.ceil((dueDate - now) / (1000 * 60 * 60 * 24))
      
      if (diffDays < 0) return 'text-red-600'
      if (diffDays <= 3) return 'text-orange-600'
      return 'text-gray-600'
    })
    
    const remainingTimeClass = computed(() => {
      const remaining = Math.max(0, (props.task.estimated_hours || 0) - (props.task.timeSpent || 0))
      if (remaining <= 0) return 'text-red-600'
      if (remaining <= 2) return 'text-orange-600'
      return 'text-green-600'
    })
    
    const timeProgressClass = computed(() => {
      const progress = ((props.task.timeSpent || 0) / (props.task.estimated_hours || 1)) * 100
      if (progress >= 100) return 'bg-red-500'
      if (progress >= 80) return 'bg-orange-500'
      return 'bg-blue-500'
    })
    
    const canEdit = computed(() => {
      return hasPermission('tasks.edit') || props.task.assigned_to === user.value?.id
    })
    
    const canComment = computed(() => {
      return hasPermission('tasks.comment')
    })
    
    const canUploadFiles = computed(() => {
      return hasPermission('tasks.upload')
    })
    
    const closeModal = () => emit('close')
    const editTask = () => emit('edit', props.task)
    
    const addComment = async () => {
      if (!newComment.value.trim()) return
      
      addingComment.value = true
      try {
        // Logique d'ajout de commentaire
        success(t('tasks.commentAdded'))
        newComment.value = ''
        commentIsPrivate.value = false
      } catch (error) {
        showError(t('tasks.commentError'))
      } finally {
        addingComment.value = false
      }
    }
    
    const canDeleteFile = (file) => {
      return hasPermission('files.delete') || file.uploaded_by === user.value?.id
    }
    
    const getFileIcon = (type = '') => {
      if (type.startsWith('image/')) return 'fas fa-image'
      if (type.includes('pdf')) return 'fas fa-file-pdf'
      if (type.includes('word') || type.includes('document')) return 'fas fa-file-word'
      if (type.includes('excel') || type.includes('spreadsheet')) return 'fas fa-file-excel'
      if (type.includes('powerpoint') || type.includes('presentation')) return 'fas fa-file-powerpoint'
      if (type.includes('zip') || type.includes('rar')) return 'fas fa-file-archive'
      return 'fas fa-file'
    }
    
    const getActivityIcon = (type) => {
      const icons = {
        created: 'fas fa-plus',
        updated: 'fas fa-edit',
        status_changed: 'fas fa-exchange-alt',
        assigned: 'fas fa-user-plus',
        comment_added: 'fas fa-comment',
        file_uploaded: 'fas fa-upload'
      }
      return icons[type] || 'fas fa-circle'
    }
    
    const formatDate = (date) => {
      if (!date) return ''
      return new Date(date).toLocaleDateString('fr-FR', {
        year: 'numeric',
        month: 'long',
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
      canEdit,
      canComment,
      canUploadFiles,
      closeModal,
      editTask,
      addComment,
      canDeleteFile,
      getFileIcon,
      getActivityIcon,
      formatDate,
      formatFileSize,
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