<template>
  <div class="modal-overlay" @click="closeModal">
    <div class="modal-container" @click.stop>
      <div class="modal-header">
        <h3 class="modal-title">
          {{ isEditing ? t('comments.edit') : (isReply ? t('comments.reply') : t('comments.add')) }}
        </h3>
        <button @click="closeModal" class="modal-close-btn">
          <i class="fas fa-times"></i>
        </button>
      </div>
      
      <div class="modal-body">
        <!-- Commentaire parent si c'est une réponse -->
        <div v-if="isReply && parentComment" class="parent-comment">
          <div class="parent-comment-header">
            <span class="parent-comment-label">{{ t('comments.replyingTo') }}</span>
          </div>
          <div class="parent-comment-content">
            <div class="parent-comment-author">
              <img 
                v-if="parentComment.user?.avatar" 
                :src="parentComment.user.avatar" 
                :alt="parentComment.user.name"
                class="parent-comment-avatar"
              >
              <div v-else class="parent-comment-avatar-placeholder">
                {{ getInitials(parentComment.user?.name || 'U') }}
              </div>
              <span class="parent-comment-name">{{ parentComment.user?.name || t('common.unknown') }}</span>
            </div>
            <p class="parent-comment-text">{{ parentComment.content }}</p>
          </div>
        </div>
        
        <!-- Formulaire de commentaire -->
        <form @submit.prevent="handleSubmit" class="comment-form">
          <div class="form-group">
            <label for="comment-content" class="form-label">
              {{ t('comments.content') }}
            </label>
            <textarea
              id="comment-content"
              v-model="formData.content"
              :placeholder="isReply ? t('comments.replyPlaceholder') : t('comments.addPlaceholder')"
              class="form-textarea"
              rows="4"
              required
              :disabled="loading"
            ></textarea>
          </div>
          
          <!-- Options avancées -->
          <div class="advanced-options">
            <div class="form-group">
              <label class="form-checkbox">
                <input 
                  type="checkbox" 
                  v-model="formData.isPrivate"
                  :disabled="loading"
                >
                <span class="checkbox-label">{{ t('comments.private') }}</span>
              </label>
            </div>
            
            <div class="form-group">
              <label class="form-checkbox">
                <input 
                  type="checkbox" 
                  v-model="formData.notifyMentioned"
                  :disabled="loading"
                >
                <span class="checkbox-label">{{ t('comments.notifyMentioned') }}</span>
              </label>
            </div>
          </div>
          
          <!-- Pièces jointes -->
          <div class="attachments-section">
            <div class="attachments-header">
              <span class="attachments-label">{{ t('comments.attachments') }}</span>
              <button 
                type="button" 
                @click="triggerFileUpload"
                class="add-attachment-btn"
                :disabled="loading"
              >
                <i class="fas fa-paperclip"></i>
                {{ t('comments.addAttachment') }}
              </button>
            </div>
            
            <input 
              ref="fileInput"
              type="file"
              multiple
              @change="handleFileUpload"
              class="file-input"
              accept=".jpg,.jpeg,.png,.gif,.pdf,.doc,.docx,.txt"
            >
            
            <div v-if="formData.attachments.length > 0" class="attachments-list">
              <div 
                v-for="(attachment, index) in formData.attachments" 
                :key="index"
                class="attachment-item"
              >
                <i class="fas fa-file attachment-icon"></i>
                <span class="attachment-name">{{ attachment.name }}</span>
                <button 
                  type="button"
                  @click="removeAttachment(index)"
                  class="remove-attachment-btn"
                  :disabled="loading"
                >
                  <i class="fas fa-times"></i>
                </button>
              </div>
            </div>
          </div>
        </form>
      </div>
      
      <div class="modal-footer">
        <button 
          type="button" 
          @click="closeModal" 
          class="btn btn-secondary"
          :disabled="loading"
        >
          {{ t('common.cancel') }}
        </button>
        <button 
          @click="handleSubmit" 
          class="btn btn-primary"
          :disabled="loading || !formData.content.trim()"
        >
          <i v-if="loading" class="fas fa-spinner fa-spin mr-2"></i>
          {{ isEditing ? t('common.save') : t('comments.post') }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted, nextTick } from 'vue'
import { useTranslation } from '@/composables/useTranslation'
import { useNotifications } from '@/composables/useNotifications'

// Interfaces TypeScript
interface Comment {
  id?: string | number
  content: string
  user?: {
    id: string | number
    name: string
    avatar?: string
  }
  isPrivate?: boolean
  attachments?: File[]
  created_at?: string
  updated_at?: string
}

interface CommentFormData {
  content: string
  isPrivate: boolean
  notifyMentioned: boolean
  attachments: File[]
}

// Props
interface Props {
  comment?: Comment | null
  isEditing?: boolean
  isReply?: boolean
  parentComment?: Comment | null
}

const props = withDefaults(defineProps<Props>(), {
  comment: null,
  isEditing: false,
  isReply: false,
  parentComment: null
})

// Événements émis
interface Emits {
  close: []
  save: [data: CommentFormData]
}

const emit = defineEmits<Emits>()

// Composables
const { t } = useTranslation()
const { success, error } = useNotifications()

// État réactif
const loading = ref(false)
const fileInput = ref<HTMLInputElement | null>(null)

// Données du formulaire
const formData = reactive<CommentFormData>({
  content: '',
  isPrivate: false,
  notifyMentioned: true,
  attachments: []
})

// Propriétés calculées
const modalTitle = computed(() => {
  if (props.isEditing) return t('comments.edit')
  if (props.isReply) return t('comments.reply')
  return t('comments.add')
})

// Méthodes
const getInitials = (name: string): string => {
  return name
    .split(' ')
    .map(word => word.charAt(0))
    .join('')
    .toUpperCase()
    .slice(0, 2)
}

const closeModal = (): void => {
  emit('close')
}

const triggerFileUpload = (): void => {
  fileInput.value?.click()
}

const handleFileUpload = (event: Event): void => {
  const target = event.target as HTMLInputElement
  const files = target.files
  
  if (files) {
    const newFiles = Array.from(files)
    formData.attachments.push(...newFiles)
  }
  
  // Reset input
  if (target) {
    target.value = ''
  }
}

const removeAttachment = (index: number): void => {
  formData.attachments.splice(index, 1)
}

const validateForm = (): boolean => {
  if (!formData.content.trim()) {
    error(t('comments.errors.contentRequired'))
    return false
  }
  
  if (formData.content.length > 2000) {
    error(t('comments.errors.contentTooLong'))
    return false
  }
  
  return true
}

const handleSubmit = async (): Promise<void> => {
  if (!validateForm()) return
  
  loading.value = true
  
  try {
    // Émettre les données du formulaire
    emit('save', { ...formData })
    
    success(props.isEditing ? t('comments.updated') : t('comments.posted'))
    closeModal()
  } catch (err) {
    console.error('Erreur lors de la sauvegarde du commentaire:', err)
    error(t('comments.errors.saveFailed'))
  } finally {
    loading.value = false
  }
}

// Initialisation
onMounted(() => {
  if (props.isEditing && props.comment) {
    formData.content = props.comment.content || ''
    formData.isPrivate = props.comment.isPrivate || false
  }
  
  // Focus sur le textarea
  nextTick(() => {
    const textarea = document.getElementById('comment-content') as HTMLTextAreaElement
    if (textarea) {
      textarea.focus()
    }
  })
})
</script>

<style scoped>
.modal-overlay {
  @apply fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50;
}

.modal-container {
  @apply bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-hidden;
}

.modal-header {
  @apply flex items-center justify-between p-6 border-b border-gray-200;
}

.modal-title {
  @apply text-xl font-semibold text-gray-900 m-0;
}

.modal-close-btn {
  @apply p-2 text-gray-400 hover:text-gray-600 transition-colors;
}

.modal-body {
  @apply p-6 max-h-[60vh] overflow-y-auto;
}

.parent-comment {
  @apply mb-6 p-4 bg-gray-50 rounded-lg border-l-4 border-blue-500;
}

.parent-comment-header {
  @apply mb-2;
}

.parent-comment-label {
  @apply text-sm font-medium text-gray-600;
}

.parent-comment-content {
  @apply space-y-2;
}

.parent-comment-author {
  @apply flex items-center space-x-2;
}

.parent-comment-avatar {
  @apply w-6 h-6 rounded-full object-cover;
}

.parent-comment-avatar-placeholder {
  @apply w-6 h-6 rounded-full bg-gray-300 flex items-center justify-center text-xs font-medium text-gray-600;
}

.parent-comment-name {
  @apply text-sm font-medium text-gray-700;
}

.parent-comment-text {
  @apply text-sm text-gray-600 pl-8;
}

.comment-form {
  @apply space-y-4;
}

.form-group {
  @apply space-y-2;
}

.form-label {
  @apply block text-sm font-medium text-gray-700;
}

.form-textarea {
    @apply w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-y;
  }

.form-textarea:disabled {
  @apply bg-gray-100 cursor-not-allowed;
}

.advanced-options {
  @apply space-y-3;
}

.form-checkbox {
  @apply flex items-center space-x-2 cursor-pointer;
}

.form-checkbox input[type="checkbox"] {
  @apply rounded border-gray-300 text-blue-600 focus:ring-blue-500;
}

.checkbox-label {
  @apply text-sm text-gray-700;
}

.attachments-section {
  @apply space-y-3;
}

.attachments-header {
  @apply flex items-center justify-between;
}

.attachments-label {
  @apply text-sm font-medium text-gray-700;
}

.add-attachment-btn {
  @apply text-sm text-blue-600 hover:text-blue-700 transition-colors flex items-center space-x-1;
}

.file-input {
  @apply hidden;
}

.attachments-list {
  @apply space-y-2;
}

.attachment-item {
  @apply flex items-center space-x-2 p-2 bg-gray-50 rounded border;
}

.attachment-icon {
  @apply text-gray-400;
}

.attachment-name {
  @apply flex-1 text-sm text-gray-700 truncate;
}

.remove-attachment-btn {
  @apply p-1 text-red-500 hover:text-red-700 transition-colors;
}

.modal-footer {
  @apply flex items-center justify-end space-x-3 p-6 border-t border-gray-200 bg-gray-50;
}

.btn {
  @apply px-4 py-2 rounded-md font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2;
}

.btn-secondary {
  @apply bg-white text-gray-700 border border-gray-300 hover:bg-gray-50 focus:ring-gray-500;
}

.btn-primary {
  @apply bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500;
}

.btn:disabled {
  @apply opacity-50 cursor-not-allowed;
}

.fa-spin {
  animation: spin 1s linear infinite;
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}
</style>