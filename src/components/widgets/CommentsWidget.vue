<template>
  <BaseWidget 
    :widget="widgetConfig=loading=error='showConfigModal = true=toggleWidget="loadComments="comments-widget=add-comment-form='canAddComments="comment-input-container=user-avatar="currentUser.avatar || '/default-avatar.png='currentUser.name=avatar-img="comment-input-wrapper="newComment=t('widgets.comments.placeholder='3"
              @keydown.ctrl.enter="addComment=addComment='input-actions="input-options=toggleMentions="option-btn='{ active: showMentions }"
                  :title="t('widgets.comments.mentions=toggleEmojis=option-btn='{ active: showEmojis }"
                  :title="t('widgets.comments.emojis=fileInput=file='image *,.pdf,.doc,.docx=handleFileUpload=":hidden="$refs.fileInput.click()'
                  class === option-btn=t('widgets.comments.attachFile="addComment='!newComment.trim() || isSubmitting=submit-btn="fas fa-paper-plane="!isSubmitting=fas fa-spinner fa-spin='attached-files="attachedFiles.length &gt; 0>
          <div  
            v-for="(file, index) in attachedFiles=index=attached-file='fas fa-file=file-name="removeAttachedFile(index)"
              class="remove-file-btn=fas fa-times='mentions-dropdown="showMentions=mentions-header="showMentions = false='close-btn=fas fa-times="mentions-list="user in projectUsers=user.id='mention-item
            >
              <img  :src="user.avatar || ' default-avatar.png=user.name=mention-avatar='mention-name=mention-role="emojis-dropdown="showEmojis=emojis-header='showEmojis = false="close-btn=fas fa-times="emojis-grid='emoji in commonEmojis"
              class="emoji-btn=comments-filters='filter-options="sortOrder=sort-select="newest='oldest=showOnlyUnread = !showOnlyUnread="filter-btn="{ active: showOnlyUnread }'
          >
            <i class="fas fa-eye=comments-count=comments-list='comment in paginatedComments=comment.id="comment-item"
        >
          <div  class="comment-avatar=comment.user.avatar || ' default-avatar.png comment.user.name='avatar-img=user-status="comment.user.status="comment-content=comment-header='comment-author="author-name=author-role="comment-meta='comment-time=comment-actions="replyToComment(comment)"
                    class="action-btn=t('widgets.comments.reply='toggleReaction(comment)"
                    class="action-btn={ active: comment.user_reacted }'
                    :title class="t('widgets.comments.like=comment.reactions_count &gt; 0>{{ comment.reactions_count }}</div>
                  </button>
                  
                  <div  class="dropdown=canManageComment(comment)'>
                    <button  
                      @click="toggleCommentMenu(comment.id)
                      class(action-btn=fas fa-ellipsis-v='activeCommentMenu === comment.id=""dropdown-menu=editComment(comment)"
                        class="dropdown-item=fas fa-edit mr-2'></i>
                        {{ t('common.edit="deleteComment(comment)""
                        class="dropdown-item text-red-600'
                      >
                        <i class="fas fa-trash mr-2"></i>
                        {{ t('common.delete="comment-body=editingComment?.id === comment.id='edit-comment-form"3"
                ></textarea>
                
                <div  class="edit-actions=saveEditComment save-btn='cancelEditComment=cancel-btn="comment-text class="formatCommentText(comment.content)'></div>
              
              <!-- Fichiers attachés -->
              <div class="comment-attachments=comment.attachments?.length &gt; 0>
                <div 
                  v-for="attachment in comment.attachments=attachment.id=attachment-item='downloadAttachment(attachment)"
                >
                  <i  class="fas fa-file=attachment-name='attachment-size="comment-replies=comment.replies?.length &gt; 0>
              <div  
                v-for="reply in comment.replies=reply.id=reply-item='reply-avatar=reply.user.avatar || ' default-avatar.png="reply.user.name="avatar-img small=reply-content='reply-header="reply-author=reply-time="reply-text class='formatCommentText(reply.content)></div>
                </div>
              </div>
            </div>
            
            <!-- Formulaire de réponse -->
            <div  class="reply-form=replyingTo?.id === comment.id reply-input-container='replyText=t('widgets.comments.replyPlaceholder="2
                ></textarea>
                
                <div  class="reply-actions=submitReply !replyText.trim()'
                    class="reply-submit-btn=cancelReply="reply-cancel-btn='filteredComments.length === 0" class="no-comments=fas fa-comments text-gray-400 text-3xl mb-3'></i>
          <p class="text-gray-500>{{ t('widgets.comments.noComments="text-gray-400 text-sm=comments-pagination='totalPages &gt; 1">
        <button   
          @click="currentPage--=currentPage === 1'
          class(pagination-btn=fas fa-chevron-left=""pagination-info='currentPage++"
          ::disabled="currentPage === totalPages=pagination-btn=fas fa-chevron-right='showConfigModal=widgetConfig || configOptions=""showConfigModal = false=updateConfig'
     >
  </BaseWidget>
</template>

<script>
import { ref, computed, onMounted, watch, nextTick } from 'vue'
import BaseWidget from './BaseWidget.vue'
import WidgetConfigModal from '../modals/WidgetConfigModal.vue'
import projectManagementService from '@/services/projectManagementService'
import { useTranslation } from '@/composables/useTranslation'
import { useNotifications } from '@/composables/useNotifications'
import { useAuth } from '@/composables/useAuth'

export default {
  name: 'CommentsWidget',
  components: {
    BaseWidget,
    WidgetConfigModal
  },
  props: {
    projectId: {
      type: [String, Number],
      required: true
    },
    widgetData: {
      type: Object,
      default: () => ({})
    }
  },
  emits: ['update-widget'],
  setup(props, { emit }) {
    const { success, error: showError } = useNotifications()
    const { user: currentUser } = useAuth()
    const { t } = useTranslation()
    
    // État réactif
    const loading = ref(false)
    const error = ref(null)
    const comments = ref([])
    const projectUsers = ref([])
    const newComment = ref('')
    const attachedFiles = ref([])
    const isSubmitting = ref(false)
    const showMentions = ref(false)
    const showEmojis = ref(false)
    const showOnlyUnread = ref(false)
    const sortOrder = ref('newest')
    const currentPage = ref(1)
    const commentsPerPage = ref(10)
    const activeCommentMenu = ref(null)
    const editingComment = ref(null)
    const editCommentText = ref('')
    const replyingTo = ref(null)
    const replyText = ref('')
    const showConfigModal = ref(false)
    
    // Configuration du widget
    const widgetConfig = ref({
      id: 'comments',
      name: 'Commentaires',
      icon: 'fas fa-comments',
      titleKey: 'widgets.comments.title',
      isEnabled: true,
      canAddComments: true,
      allowAttachments: true,
      allowMentions: true,
      allowEmojis: true,
      autoRefresh: true,
      refreshInterval: 30000,
      ...props.widgetData
    })
    
    // Options de configuration
    const configOptions = ref([
      {
        key: 'canAddComments',
        type: 'boolean',
        label: 'Permettre l\'ajout de commentaires',
        default: true
      },
      {
        key: 'allowAttachments',
        type: 'boolean',
        label: 'Autoriser les pièces jointes',
        default: true
      },
      {
        key: 'allowMentions',
        type: 'boolean',
        label: 'Autoriser les mentions',
        default: true
      },
      {
        key: 'allowEmojis',
        type: 'boolean',
        label: 'Autoriser les emojis',
        default: true
      },
      {
        key: 'autoRefresh',
        type: 'boolean',
        label: 'Actualisation automatique',
        default: true
      },
      {
        key: 'refreshInterval',
        type: 'number',
        label: 'Intervalle d\'actualisation (ms)',
        default: 30000,
        min: 5000,
        max: 300000
      }
    ])
    
    // Emojis communs
    const commonEmojis = ref([
      '😀', '😃', '😄', '😁', '😊', '😍', '🤔', '😮', '😢', '😡',
      '👍', '👎', '👌', '✌️', '🤝', '👏', '🙏', '💪', '🎉', '🔥'
    ])
    
    // Propriétés calculées
    const canAddComments = computed(() => widgetConfig.value.canAddComments)
    
    const filteredComments = computed(() => {
      let filtered = [...comments.value]
      
      if (showOnlyUnread.value) {
        filtered = filtered.filter(comment => !comment.is_read)
      }
      
      // Tri
      filtered.sort((a, b) => {
        const dateA = new Date(a.created_at)
        const dateB = new Date(b.created_at)
        return sortOrder.value === 'newest' ? dateB - dateA : dateA - dateB
      })
      
      return filtered
    })
    
    const totalPages = computed(() => {
      return Math.ceil(filteredComments.value.length / commentsPerPage.value)
    })
    
    const paginatedComments = computed(() => {
      const start = (currentPage.value - 1) * commentsPerPage.value
      const end = start + commentsPerPage.value
      return filteredComments.value.slice(start, end)
    })
    
    // Méthodes
    const loadComments = async () => {
      loading.value = true
      error.value = null
      
      try {
        // Simuler le chargement des commentaires
        const result = await projectManagementService.getProjectComments?.(props.projectId) || {
          success: true,
          data: [
            {
              id: 1,
              content: 'Excellent travail sur cette fonctionnalité ! 👍',
              user_id: 1,
              user: {
                id: 1,
                name: 'Marie Dubois',
                role: 'Chef de projet',
                avatar: null,
                status: 'online'
              },
              created_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
              is_read: true,
              reactions_count: 2,
              user_reacted: false,
              attachments: [],
              replies: [
                {
                  id: 2,
                  content: 'Merci ! J\'ai hâte de voir la suite.',
                  user: {
                    id: 2,
                    name: 'Jean Martin',
                    avatar: null
                  },
                  created_at: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString()
                }
              ]
            }
          ]
        }
        
        if (result.success) {
          comments.value = result.data
        }
        
        // Charger les utilisateurs du projet
        const usersResult = await projectManagementService.getProjectMembers?.(props.projectId) || {
          success: true,
          data: [
            { id: 1, name: 'Marie Dubois', role: 'Chef de projet', avatar: null },
            { id: 2, name: 'Jean Martin', role: 'Développeur', avatar: null }
          ]
        }
        
        if (usersResult.success) {
          projectUsers.value = usersResult.data
        }
      } catch (err) {
        error.value = t('errors.loadingFailed')
      } finally {
        loading.value = false
      }
    }
    
    const addComment = async () => {
      if (!newComment.value.trim() || isSubmitting.value) return
      
      isSubmitting.value = true
      
      try {
        const commentData = {
          content: newComment.value,
          project_id: props.projectId,
          attachments: attachedFiles.value
        }
        
        // Simuler l'ajout du commentaire
        const newCommentObj = {
          id: Date.now(),
          content: newComment.value,
          user_id: currentUser.value.id,
          user: {
            id: currentUser.value.id,
            name: currentUser.value.name,
            role: currentUser.value.role,
            avatar: currentUser.value.avatar,
            status: 'online'
          },
          created_at: new Date().toISOString(),
          is_read: true,
          reactions_count: 0,
          user_reacted: false,
          attachments: [...attachedFiles.value],
          replies: []
        }
        
        comments.value.unshift(newCommentObj)
        newComment.value = ''
        attachedFiles.value = []
        showMentions.value = false
        showEmojis.value = false
        
        success(t('widgets.comments.commentAdded'))
      } catch (err) {
        showError(t('widgets.comments.addFailed'))
      } finally {
        isSubmitting.value = false
      }
    }
    
    const handleFileUpload = (event) => {
      const files = Array.from(event.target.files)
      attachedFiles.value.push(...files)
      event.target.value = ''
    }
    
    const removeAttachedFile = (index) => {
      attachedFiles.value.splice(index, 1)
    }
    
    const toggleMentions = () => {
      showMentions.value = !showMentions.value
      showEmojis.value = false
    }
    
    const toggleEmojis = () => {
      showEmojis.value = !showEmojis.value
      showMentions.value = false
    }
    
    const addMention = (user) => {
      newComment.value += `@${user.name} `
      showMentions.value = false
    }
    
    const addEmoji = (emoji) => {
      newComment.value += emoji
      showEmojis.value = false
    }
    
    const formatCommentTime = (dateString) => {
      const date = new Date(dateString)
      const now = new Date()
      const diffMs = now - date
      const diffMins = Math.floor(diffMs / 60000)
      const diffHours = Math.floor(diffMs / 3600000)
      const diffDays = Math.floor(diffMs / 86400000)
      
      if (diffMins < 1) return t('widgets.comments.justNow')
      if (diffMins < 60) return t('widgets.comments.minutesAgo', { count: diffMins })
      if (diffHours < 24) return t('widgets.comments.hoursAgo', { count: diffHours })
      if (diffDays < 7) return t('widgets.comments.daysAgo', { count: diffDays })
      
      return date.toLocaleDateString('fr-FR')
    }
    
    const formatCommentText = (text) => {
      // Remplacer les mentions par des liens
      let formatted = text.replace(/@([\w\s]+)/g, '<span class class="mention>@$1</span>')
      
      // Remplacer les URLs par des liens
      formatted = formatted.replace(
        /(https?:\/\/[^\s]+)/g,
        '<a  href="$1' target="_blank=comment-link>$1</a>'
      )
      
      return formatted
    }
    
    const formatFileSize = (bytes) => {
      if (bytes === 0) return '0 B'
      const k = 1024
      const sizes = ['B', 'KB', 'MB', 'GB']
      const i = Math.floor(Math.log(bytes) / Math.log(k))
      return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
    }
    
    const canManageComment = (comment) => {
      return comment.user_id === currentUser.value.id || currentUser.value.role === 'admin'
    }
    
    const toggleCommentMenu = (commentId) => {
      activeCommentMenu.value = activeCommentMenu.value === commentId ? null : commentId
    }
    
    const editComment = (comment) => {
      editingComment.value = comment
      editCommentText.value = comment.content
      activeCommentMenu.value = null
    }
    
    const saveEditComment = async () => {
      if (!editCommentText.value.trim()) return
      
      try {
        // Simuler la mise à jour
        const index = comments.value.findIndex(c => c.id === editingComment.value.id)
        if (index !== -1) {
          comments.value[index].content = editCommentText.value
          comments.value[index].updated_at = new Date().toISOString()
        }
        
        editingComment.value = null
        editCommentText.value = ''
        success(t('widgets.comments.commentUpdated'))
      } catch (err) {
        showError(t('widgets.comments.updateFailed'))
      }
    }
    
    const cancelEditComment = () => {
      editingComment.value = null
      editCommentText.value = ''
    }
    
    const deleteComment = async (comment) => {
      if (!confirm(t('widgets.comments.confirmDelete'))) return
      
      try {
        comments.value = comments.value.filter(c => c.id !== comment.id)
        activeCommentMenu.value = null
        success(t('widgets.comments.commentDeleted'))
      } catch (err) {
        showError(t('widgets.comments.deleteFailed'))
      }
    }
    
    const toggleReaction = async (comment) => {
      try {
        if (comment.user_reacted) {
          comment.reactions_count--
          comment.user_reacted = false
        } else {
          comment.reactions_count++
          comment.user_reacted = true
        }
      } catch (err) {
        showError(t('widgets.comments.reactionFailed'))
      }
    }
    
    const replyToComment = (comment) => {
      replyingTo.value = comment
      replyText.value = ''
    }
    
    const submitReply = async () => {
      if (!replyText.value.trim()) return
      
      try {
        const reply = {
          id: Date.now(),
          content: replyText.value,
          user: {
            id: currentUser.value.id,
            name: currentUser.value.name,
            avatar: currentUser.value.avatar
          },
          created_at: new Date().toISOString()
        }
        
        if (!replyingTo.value.replies) {
          replyingTo.value.replies = []
        }
        replyingTo.value.replies.push(reply)
        
        replyingTo.value = null
        replyText.value = ''
        success(t('widgets.comments.replyAdded'))
      } catch (err) {
        showError(t('widgets.comments.replyFailed'))
      }
    }
    
    const cancelReply = () => {
      replyingTo.value = null
      replyText.value = ''
    }
    
    const downloadAttachment = (attachment) => {
      // Simuler le téléchargement
      const link = document.createElement('a')
      link.href = attachment.url
      link.download = attachment.name
      link.click()
    }
    
    const toggleWidget = () => {
      widgetConfig.value.isEnabled = !widgetConfig.value.isEnabled
      emit('update-widget', widgetConfig.value)
    }
    
    const updateConfig = (newConfig) => {
      widgetConfig.value = { ...widgetConfig.value, ...newConfig }
      emit('update-widget', widgetConfig.value)
      showConfigModal.value = false
    }
    
    // Watchers
    watch(() => props.projectId, loadComments, { immediate: true })
    
    // Auto-refresh
    let refreshInterval
    watch(() => widgetConfig.value.autoRefresh, (enabled) => {
      if (refreshInterval) {
        clearInterval(refreshInterval)
      }
      
      if (enabled) {
        refreshInterval = setInterval(loadComments, widgetConfig.value.refreshInterval)
      }
    }, { immediate: true })
    
    onMounted(() => {
      loadComments()
    })
    
    return {
      loading,
      error,
      comments,
      projectUsers,
      newComment,
      attachedFiles,
      isSubmitting,
      showMentions,
      showEmojis,
      showOnlyUnread,
      sortOrder,
      currentPage,
      commentsPerPage,
      activeCommentMenu,
      editingComment,
      editCommentText,
      replyingTo,
      replyText,
      showConfigModal,
      widgetConfig,
      configOptions,
      commonEmojis,
      canAddComments,
      filteredComments,
      totalPages,
      paginatedComments,
      currentUser,
      loadComments,
      addComment,
      handleFileUpload,
      removeAttachedFile,
      toggleMentions,
      toggleEmojis,
      addMention,
      addEmoji,
      formatCommentTime,
      formatCommentText,
      formatFileSize,
      canManageComment,
      toggleCommentMenu,
      editComment,
      saveEditComment,
      cancelEditComment,
      deleteComment,
      toggleReaction,
      replyToComment,
      submitReply,
      cancelReply,
      downloadAttachment,
      toggleWidget,
      updateConfig,
      t
    }
  }
}
</script>

<style scoped>
.comments-widget {
  @apply space-y-4;
}

.add-comment-form {
  @apply space-y-3;
}

.comment-input-container {
  @apply flex space-x-3;
}

.user-avatar {
  @apply flex-shrink-0;
}

.avatar-img {
  @apply w-10 h-10 rounded-full object-cover;
}

.avatar-img.small {
  @apply w-8 h-8;
}

.comment-input-wrapper {
  @apply flex-1 space-y-2;
}

.comment-input {
  @apply w-full p-3 border border-gray-300 rounded-lg resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent;
}

.input-actions {
  @apply flex items-center justify-between;
}

.input-options {
  @apply flex items-center space-x-2;
}

.option-btn {
  @apply p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-md transition-colors;
}

.option-btn.active {
  @apply text-blue-600 bg-blue-50;
}

.submit-btn {
  @apply px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2;
}

.attached-files {
  @apply flex flex-wrap gap-2;
}

.attached-file {
  @apply flex items-center space-x-2 px-3 py-2 bg-gray-100 rounded-md text-sm;
}

.file-name {
  @apply text-gray-700;
}

.remove-file-btn {
  @apply text-gray-500 hover:text-red-600;
}

.mentions-dropdown,
.emojis-dropdown {
  @apply absolute z-10 mt-2 bg-white border border-gray-200 rounded-lg shadow-lg max-h-48 overflow-y-auto;
}

.mentions-header,
.emojis-header {
  @apply flex items-center justify-between p-3 border-b border-gray-200;
}

.close-btn {
  @apply text-gray-500 hover:text-gray-700;
}

.mentions-list {
  @apply p-2;
}

.mention-item {
  @apply flex items-center space-x-3 p-2 hover:bg-gray-50 rounded-md cursor-pointer;
}

.mention-avatar {
  @apply w-8 h-8 rounded-full object-cover;
}

.mention-name {
  @apply font-medium text-gray-900;
}

.mention-role {
  @apply text-sm text-gray-500;
}

.emojis-grid {
  @apply grid grid-cols-5 gap-1 p-2;
}

.emoji-btn {
  @apply p-2 hover:bg-gray-100 rounded-md text-lg;
}

.comments-filters {
  @apply flex items-center justify-between py-3 border-b border-gray-200;
}

.filter-options {
  @apply flex items-center space-x-3;
}

.sort-select {
  @apply px-3 py-2 border border-gray-300 rounded-md text-sm;
}

.filter-btn {
  @apply px-3 py-2 text-sm border border-gray-300 rounded-md hover:bg-gray-50 flex items-center space-x-2;
}

.filter-btn.active {
  @apply bg-blue-50 border-blue-300 text-blue-700;
}

.comments-count {
  @apply text-sm text-gray-500;
}

.comments-list {
  @apply space-y-4 max-h-96 overflow-y-auto;
}

.comment-item {
  @apply flex space-x-3 p-3 rounded-lg transition-colors;
}

.comment-item.unread {
  @apply bg-blue-50 border-l-4 border-blue-500;
}

.comment-item.own-comment {
  @apply bg-green-50;
}

.comment-avatar {
  @apply relative flex-shrink-0;
}

.user-status {
  @apply absolute -bottom-1 -right-1 w-3 h-3 rounded-full border-2 border-white;
}

.user-status.online {
  @apply bg-green-500;
}

.user-status.away {
  @apply bg-yellow-500;
}

.user-status.offline {
  @apply bg-gray-400;
}

.comment-content {
  @apply flex-1 space-y-2;
}

.comment-header {
  @apply flex items-start justify-between;
}

.comment-author {
  @apply flex items-center space-x-2;
}

.author-name {
  @apply font-medium text-gray-900;
}

.author-role {
  @apply text-sm text-gray-500;
}

.comment-meta {
  @apply flex items-center space-x-2;
}

.comment-time {
  @apply text-sm text-gray-500;
}

.comment-actions {
  @apply flex items-center space-x-1;
}

.action-btn {
  @apply p-1 text-gray-500 hover:text-gray-700 rounded-md transition-colors flex items-center space-x-1;
}

.action-btn.active {
  @apply text-red-500;
}

.dropdown {
  @apply relative;
}

.dropdown-menu {
  @apply absolute right-0 mt-2 bg-white border border-gray-200 rounded-lg shadow-lg z-10 min-w-[120px];
}

.dropdown-item {
  @apply w-full px-3 py-2 text-left text-sm hover:bg-gray-50 flex items-center;
}

.comment-body {
  @apply space-y-2;
}

.edit-comment-form {
  @apply space-y-2;
}

.edit-input {
  @apply w-full p-2 border border-gray-300 rounded-md resize-none;
}

.edit-actions {
  @apply flex items-center space-x-2;
}

.save-btn {
  @apply px-3 py-1 bg-blue-600 text-white rounded-md text-sm;
}

.cancel-btn {
  @apply px-3 py-1 bg-gray-300 text-gray-700 rounded-md text-sm;
}

.comment-text {
  @apply text-gray-900 leading-relaxed;
}

.comment-attachments {
  @apply space-y-2;
}

.attachment-item {
  @apply flex items-center space-x-2 p-2 bg-gray-50 rounded-md cursor-pointer hover:bg-gray-100;
}

.attachment-name {
  @apply flex-1 text-sm text-gray-700;
}

.attachment-size {
  @apply text-xs text-gray-500;
}

.comment-replies {
  @apply ml-4 space-y-3 border-l-2 border-gray-200 pl-4;
}

.reply-item {
  @apply flex space-x-2;
}

.reply-content {
  @apply flex-1;
}

.reply-header {
  @apply flex items-center space-x-2;
}

.reply-author {
  @apply font-medium text-gray-900 text-sm;
}

.reply-time {
  @apply text-xs text-gray-500;
}

.reply-text {
  @apply text-sm text-gray-700;
}

.reply-form {
  @apply ml-4 mt-2;
}

.reply-input-container {
  @apply space-y-2;
}

.reply-input {
  @apply w-full p-2 border border-gray-300 rounded-md resize-none text-sm;
}

.reply-actions {
  @apply flex items-center space-x-2;
}

.reply-submit-btn {
  @apply px-3 py-1 bg-blue-600 text-white rounded-md text-sm;
}

.reply-cancel-btn {
  @apply px-3 py-1 bg-gray-300 text-gray-700 rounded-md text-sm;
}

.no-comments {
  @apply text-center py-8;
}

.comments-pagination {
  @apply flex items-center justify-center space-x-4 pt-4 border-t border-gray-200;
}

.pagination-btn {
  @apply p-2 text-gray-500 hover:text-gray-700 disabled:opacity-50 disabled:cursor-not-allowed;
}

.pagination-info {
  @apply text-sm text-gray-600;
}

/* Styles pour les mentions et liens */
:deep(.mention) {
  @apply text-blue-600 font-medium;
}

:deep(.comment-link) {
  @apply text-blue-600 underline hover:text-blue-800;
}
</style>