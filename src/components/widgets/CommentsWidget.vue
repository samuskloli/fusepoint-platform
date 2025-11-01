<template>
  <BaseWidget 
    :widget="widgetConfig"
    :loading="loading"
    :error="error"
    @configure="showConfigModal = true"
    @toggle="toggleWidget"
    @retry="loadComments"
  >
    <div class="comments-widget">
      <!-- En-tête des commentaires -->
      <div class="comments-header">
        <div class="header-left">
          <h3 class="comments-title">{{ t('widgets.comments.title') }}</h3>
          <div class="comments-stats">
            <span class="stat-item">
              <i class="fas fa-comments mr-1"></i>
              {{ totalComments }} {{ t('widgets.comments.totalComments') }}
            </span>
            <span class="stat-item">
              <i class="fas fa-clock mr-1"></i>
              {{ recentComments.length }} {{ t('widgets.comments.recentComments') }}
            </span>
          </div>
        </div>
        
        <div class="header-right">
          <div class="filter-controls">
            <select v-model="filterType" class="filter-select">
              <option value="all">{{ t('widgets.comments.allComments') }}</option>
              <option value="unread">{{ t('widgets.comments.unreadComments') }}</option>
              <option value="mentions">{{ t('widgets.comments.mentions') }}</option>
              <option value="my-comments">{{ t('widgets.comments.myComments') }}</option>
            </select>
            
            <select v-model="sortBy" class="filter-select">
              <option value="newest">{{ t('widgets.comments.newest') }}</option>
              <option value="oldest">{{ t('widgets.comments.oldest') }}</option>
              <option value="most-replies">{{ t('widgets.comments.mostReplies') }}</option>
            </select>
          </div>
          
          <button @click="showAddCommentModal = true" class="add-comment-btn">
            <i class="fas fa-plus mr-2"></i>
            {{ t('widgets.comments.addComment') }}
          </button>
        </div>
      </div>
      
      <!-- Barre de recherche -->
      <div class="search-bar">
        <div class="search-input-wrapper">
          <i class="fas fa-search search-icon"></i>
          <input 
            v-model="searchQuery"
            type="text"
            :placeholder="t('widgets.comments.searchComments')"
            class="search-input"
          >
          <button 
            v-if="searchQuery"
            @click="searchQuery = ''"
            class="clear-search-btn"
          >
            <i class="fas fa-times"></i>
          </button>
        </div>
      </div>
      
      <!-- Liste des commentaires -->
      <div class="comments-list">
        <div 
          v-for="comment in filteredComments"
          :key="comment.id"
          class="comment-item"
          :class="{
            'unread': !comment.is_read,
            'mention': comment.has_mention,
            'my-comment': comment.user_id === currentUserId
          }"
        >
          <!-- En-tête du commentaire -->
          <div class="comment-header">
            <div class="comment-author">
              <img 
                :src="comment.user?.avatar || '/default-avatar.png'"
                :alt="comment.user?.name"
                class="author-avatar"
              >
              <div class="author-info">
                <h5 class="author-name">{{ comment.user?.name || t('widgets.comments.unknownUser') }}</h5>
                <span class="comment-date">{{ formatCommentDate(comment.created_at) }}</span>
              </div>
            </div>
            
            <div class="comment-actions">
              <button 
                v-if="!comment.is_read"
                @click="markAsRead(comment)"
                class="action-btn"
                :title="t('widgets.comments.markAsRead')"
              >
                <i class="fas fa-eye"></i>
              </button>
              
              <button 
                @click="replyToComment(comment)"
                class="action-btn"
                :title="t('widgets.comments.reply')"
              >
                <i class="fas fa-reply"></i>
              </button>
              
              <button 
                v-if="canEditComment(comment)"
                @click="editComment(comment)"
                class="action-btn"
                :title="t('widgets.comments.edit')"
              >
                <i class="fas fa-edit"></i>
              </button>
              
              <button 
                v-if="canDeleteComment(comment)"
                @click="deleteComment(comment)"
                class="action-btn delete"
                :title="t('widgets.comments.delete')"
              >
                <i class="fas fa-trash"></i>
              </button>
            </div>
          </div>
          
          <!-- Contenu du commentaire -->
          <div class="comment-content">
            <div v-if="comment.parent_id" class="reply-indicator">
              <i class="fas fa-reply mr-1"></i>
              {{ t('widgets.comments.replyTo') }} {{ comment.parent?.user?.name }}
            </div>
            
            <div class="comment-text" v-html="formatCommentText(comment.content)"></div>
            
            <div v-if="comment.attachments?.length" class="comment-attachments">
              <div 
                v-for="attachment in comment.attachments"
                :key="attachment.id"
                class="attachment-item"
              >
                <i :class="getAttachmentIcon(attachment.type)"></i>
                <a :href="attachment.url" target="_blank" class="attachment-link">
                  {{ attachment.name }}
                </a>
              </div>
            </div>
          </div>
          
          <!-- Métadonnées du commentaire -->
          <div class="comment-meta">
            <div class="meta-left">
              <span v-if="comment.task_id" class="meta-item">
                <i class="fas fa-tasks mr-1"></i>
                {{ t('widgets.comments.relatedToTask') }}
              </span>
              
              <span v-if="comment.has_mention" class="meta-item mention">
                <i class="fas fa-at mr-1"></i>
                {{ t('widgets.comments.mentionsYou') }}
              </span>
              
              <span v-if="comment.priority" class="meta-item priority" :class="`priority-${comment.priority}`">
                <i class="fas fa-exclamation-circle mr-1"></i>
                {{ t(`widgets.comments.priority.${comment.priority}`) }}
              </span>
            </div>
            
            <div class="meta-right">
              <button 
                @click="toggleReplies(comment)"
                class="replies-toggle"
                v-if="comment.replies_count > 0"
              >
                <i class="fas fa-comments mr-1"></i>
                {{ comment.replies_count }} {{ t('widgets.comments.replies') }}
                <i :class="comment.showReplies ? 'fas fa-chevron-up' : 'fas fa-chevron-down'" class="ml-1"></i>
              </button>
            </div>
          </div>
          
          <!-- Réponses -->
          <div v-if="comment.showReplies && comment.replies?.length" class="comment-replies">
            <div 
              v-for="reply in comment.replies"
              :key="reply.id"
              class="reply-item"
            >
              <div class="reply-header">
                <img 
                  :src="reply.user?.avatar || '/default-avatar.png'"
                  :alt="reply.user?.name"
                  class="reply-avatar"
                >
                <div class="reply-info">
                  <span class="reply-author">{{ reply.user?.name }}</span>
                  <span class="reply-date">{{ formatCommentDate(reply.created_at) }}</span>
                </div>
              </div>
              
              <div class="reply-content" v-html="formatCommentText(reply.content)"></div>
            </div>
          </div>
        </div>
        
        <!-- Message si aucun commentaire -->
        <div v-if="filteredComments.length === 0" class="no-comments">
          <i class="fas fa-comments text-gray-400 text-4xl mb-3"></i>
          <h5 class="text-gray-600 mb-2">{{ t('widgets.comments.noComments') }}</h5>
          <p class="text-gray-500 text-sm">{{ t('widgets.comments.noCommentsDescription') }}</p>
          <button @click="showAddCommentModal = true" class="add-first-comment-btn">
            <i class="fas fa-plus mr-2"></i>
            {{ t('widgets.comments.addFirstComment') }}
          </button>
        </div>
      </div>
      
      <!-- Pagination -->
      <div v-if="totalPages > 1" class="pagination">
        <button 
          @click="currentPage--"
          :disabled="currentPage === 1"
          class="pagination-btn"
        >
          <i class="fas fa-chevron-left"></i>
        </button>
        
        <span class="pagination-info">
          {{ currentPage }} / {{ totalPages }}
        </span>
        
        <button 
          @click="currentPage++"
          :disabled="currentPage === totalPages"
          class="pagination-btn"
        >
          <i class="fas fa-chevron-right"></i>
        </button>
      </div>
    </div>
    
    <!-- Modal d'ajout/édition de commentaire -->
    <CommentModal 
      v-if="showAddCommentModal || showEditCommentModal"
      :comment="selectedComment"
      :is-editing="showEditCommentModal"
      :is-reply="isReply"
      :parent-comment="parentComment"
      @close="closeCommentModal"
      @save="saveComment"
    />
    
    <!-- Modal de configuration -->
    <WidgetConfigModal 
      v-if="showConfigModal"
      :widget="widgetConfig"
      :options="configOptions"
      @close="showConfigModal = false"
      @save="updateConfig"
    />
  </BaseWidget>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch, onUnmounted } from 'vue'
import { useTranslation } from '@/composables/useTranslation'
import { useNotifications } from '@/composables/useNotifications'
import { useAuth } from '@/composables/useAuth'
import BaseWidget from '@/components/widgets/shared/components/BaseWidget.vue'
import WidgetConfigModal from '@/components/widgets/shared/components/WidgetConfigModal.vue'
import CommentCreateModal from './components/CommentCreateModal.vue'
import commentsService from '@/services/commentsService'
import type { Comment, CommentType } from './types'
import { sanitizeComments } from '@/utils/sanitize'

// Props
interface Props {
  projectId: string
  widgetData?: any
  widget?: any
}

const props = defineProps<Props>()

// Emits
const emit = defineEmits<{
  'widget-updated': [widget: any]
}>()

// Composables
const { success, error: showError } = useNotifications()
const { t } = useTranslation()
const { user } = useAuth()
    
    // État réactif
    const loading = ref(false)
    const error = ref(null)
    const comments = ref([])
    const filterType = ref('all')
    const sortBy = ref('newest')
    const searchQuery = ref('')
    const currentPage = ref(1)
    const itemsPerPage = ref(10)
    const showAddCommentModal = ref(false)
    const showEditCommentModal = ref(false)
    const showConfigModal = ref(false)
    const selectedComment = ref(null)
    const parentComment = ref(null)
    const isReply = ref(false)
    
    // Configuration du widget
    const widgetConfig = ref({
      id: 'comments',
      name: 'Commentaires',
      icon: 'fas fa-comments',
      titleKey: 'widgets.comments.title',
      isEnabled: props.widget?.is_enabled ?? true,
      showUnreadOnly: false,
      autoRefresh: true,
      refreshInterval: 30000, // 30 secondes
      showAvatars: true,
      showAttachments: true,
      allowMentions: true,
      ...props.widgetData
    })
    
    // Options de configuration
    const configOptions = ref([
      {
        key: 'showUnreadOnly',
        type: 'boolean',
        label: 'Afficher uniquement les non lus',
        default: false
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
        min: 5000,
        max: 300000,
        step: 5000,
        default: 30000
      },
      {
        key: 'showAvatars',
        type: 'boolean',
        label: 'Afficher les avatars',
        default: true
      },
      {
        key: 'showAttachments',
        type: 'boolean',
        label: 'Afficher les pièces jointes',
        default: true
      },
      {
        key: 'allowMentions',
        type: 'boolean',
        label: 'Permettre les mentions',
        default: true
      }
    ])
    
    // Propriétés calculées
    const currentUserId = computed(() => user.value?.id)
    
    const totalComments = computed(() => comments.value.length)
    
    const recentComments = computed(() => {
      const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000)
      return comments.value.filter(comment => 
        new Date(comment.created_at) > oneDayAgo
      )
    })
    
    const filteredComments = computed(() => {
      let filtered = [...comments.value]
      
      // Filtrer par type
      switch (filterType.value) {
        case 'unread':
          filtered = filtered.filter(comment => !comment.is_read)
          break
        case 'mentions':
          filtered = filtered.filter(comment => comment.has_mention)
          break
        case 'my-comments':
          filtered = filtered.filter(comment => comment.user_id === currentUserId.value)
          break
      }
      
      // Filtrer par recherche
      if (searchQuery.value) {
        const query = searchQuery.value.toLowerCase()
        filtered = filtered.filter(comment => 
          comment.content.toLowerCase().includes(query) ||
          comment.user?.name.toLowerCase().includes(query)
        )
      }
      
      // Trier
      switch (sortBy.value) {
        case 'oldest':
          filtered.sort((a, b) => new Date(a.created_at) - new Date(b.created_at))
          break
        case 'most-replies':
          filtered.sort((a, b) => (b.replies_count || 0) - (a.replies_count || 0))
          break
        default: // newest
          filtered.sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
      }
      
      // Pagination
      const start = (currentPage.value - 1) * itemsPerPage.value
      const end = start + itemsPerPage.value
      
      return filtered.slice(start, end)
    })
    
    const totalPages = computed(() => {
      const totalFiltered = comments.value.filter(comment => {
        // Appliquer les mêmes filtres que filteredComments mais sans pagination
        let include = true
        
        switch (filterType.value) {
          case 'unread':
            include = !comment.is_read
            break
          case 'mentions':
            include = comment.has_mention
            break
          case 'my-comments':
            include = comment.user_id === currentUserId.value
            break
        }
        
        if (searchQuery.value && include) {
          const query = searchQuery.value.toLowerCase()
          include = comment.content.toLowerCase().includes(query) ||
                   comment.user?.name.toLowerCase().includes(query)
        }
        
        return include
      }).length
      
      return Math.ceil(totalFiltered / itemsPerPage.value)
    })
    
    // Méthodes
    const loadComments = async () => {
      loading.value = true
      error.value = null
      
      try {
        const result = await commentsService.getProjectComments(props.projectId)
        if (result.success) {
          comments.value = result.data
        } else {
          error.value = result.error
        }
      } catch (err) {
        error.value = t('errors.loadingFailed')
      } finally {
        loading.value = false
      }
    }
    
    const toggleWidget = () => {
      widgetConfig.value.isEnabled = !widgetConfig.value.isEnabled
      const updatedWidget = {
        ...widgetConfig.value,
        is_enabled: widgetConfig.value.isEnabled
      }
      emit('widget-updated', updatedWidget)
    }
    
    const formatCommentDate = (dateString) => {
      const date = new Date(dateString)
      const now = new Date()
      const diffInHours = (now - date) / (1000 * 60 * 60)
      
      if (diffInHours < 1) {
        const diffInMinutes = Math.floor((now - date) / (1000 * 60))
        return t('widgets.comments.timeAgo.minutes', { count: diffInMinutes })
      } else if (diffInHours < 24) {
        return t('widgets.comments.timeAgo.hours', { count: Math.floor(diffInHours) })
      } else if (diffInHours < 168) { // 7 jours
        const diffInDays = Math.floor(diffInHours / 24)
        return t('widgets.comments.timeAgo.days', { count: diffInDays })
      } else {
        return date.toLocaleDateString('fr-FR', {
          day: 'numeric',
          month: 'short',
          year: 'numeric'
        })
      }
    }
    
    const formatCommentText = (text) => {
      let input = String(text ?? '')
      // Remplacer les mentions @username par des spans stylés
      if (widgetConfig.value.allowMentions) {
        input = input.replace(/@([\w\-\.]+)/g, '<span class="mention">@$1</span>')
      }
      // Transformer les URLs en liens sûrs
      input = input.replace(
        /(https?:\/\/[^\s]+)/g,
        '<a href="$1" target="_blank" rel="noopener noreferrer" class="comment-link">$1</a>'
      )
      // Sauts de ligne
      input = input.replace(/\n/g, '<br>')
      // Sanitiser strictement le HTML produit
      return sanitizeComments(input)
    }
    
    const getAttachmentIcon = (type) => {
      const icons = {
        image: 'fas fa-image',
        document: 'fas fa-file-alt',
        pdf: 'fas fa-file-pdf',
        video: 'fas fa-video',
        audio: 'fas fa-music',
        archive: 'fas fa-file-archive'
      }
      return icons[type] || 'fas fa-file'
    }
    
    const canEditComment = (comment) => {
      return comment.user_id === currentUserId.value || user.value?.role === 'admin'
    }
    
    const canDeleteComment = (comment) => {
      return comment.user_id === currentUserId.value || user.value?.role === 'admin'
    }
    
    const markAsRead = async (comment) => {
      try {
        const result = await commentsService.markAsRead(comment.id)
        if (result.success) {
          comment.is_read = true
        }
      } catch (err) {
        showError(t('widgets.comments.markAsReadError'))
      }
    }
    
    const replyToComment = (comment) => {
      parentComment.value = comment
      isReply.value = true
      selectedComment.value = null
      showAddCommentModal.value = true
    }
    
    const editComment = (comment) => {
      selectedComment.value = { ...comment }
      isReply.value = false
      parentComment.value = null
      showEditCommentModal.value = true
    }
    
    const deleteComment = async (comment) => {
      if (!confirm(t('widgets.comments.confirmDelete'))) return
      
      try {
        const result = await commentsService.deleteComment(comment.id)
        if (result.success) {
          comments.value = comments.value.filter(c => c.id !== comment.id)
          success(t('widgets.comments.commentDeleted'))
        } else {
          showError(result.error)
        }
      } catch (err) {
        showError(t('widgets.comments.deleteError'))
      }
    }
    
    const toggleReplies = async (comment) => {
      if (!comment.showReplies && !comment.replies) {
        // Charger les réponses
        try {
          const result = await commentsService.getCommentReplies(comment.id)
          if (result.success) {
            comment.replies = result.data
          }
        } catch (err) {
          showError(t('widgets.comments.loadRepliesError'))
          return
        }
      }
      
      comment.showReplies = !comment.showReplies
    }
    
    const saveComment = async (commentData) => {
      try {
        let result
        
        if (showEditCommentModal.value) {
          result = await commentsService.updateComment(selectedComment.value.id, commentData)
        } else {
          const payload = {
            ...commentData,
            project_id: props.projectId,
            parent_id: isReply.value ? parentComment.value.id : null
          }
          result = await commentsService.createComment(payload)
        }
        
        if (result.success) {
          if (showEditCommentModal.value) {
            const index = comments.value.findIndex(c => c.id === selectedComment.value.id)
            if (index !== -1) {
              comments.value[index] = result.data
            }
            success(t('widgets.comments.commentUpdated'))
          } else {
            if (isReply.value) {
              // Ajouter la réponse au commentaire parent
              const parentIndex = comments.value.findIndex(c => c.id === parentComment.value.id)
              if (parentIndex !== -1) {
                if (!comments.value[parentIndex].replies) {
                  comments.value[parentIndex].replies = []
                }
                comments.value[parentIndex].replies.push(result.data)
                comments.value[parentIndex].replies_count = (comments.value[parentIndex].replies_count || 0) + 1
              }
            } else {
              comments.value.unshift(result.data)
            }
            success(t('widgets.comments.commentCreated'))
          }
          
          closeCommentModal()
        } else {
          showError(result.error)
        }
      } catch (err) {
        showError(t('widgets.comments.saveError'))
      }
    }
    
    const closeCommentModal = () => {
      showAddCommentModal.value = false
      showEditCommentModal.value = false
      selectedComment.value = null
      parentComment.value = null
      isReply.value = false
    }
    
    const updateConfig = (newConfig) => {
      widgetConfig.value = { ...widgetConfig.value, ...newConfig }
      emit('update-widget', widgetConfig.value)
      showConfigModal.value = false
    }
    
    // Auto-refresh
    let refreshInterval = null
    
    const startAutoRefresh = () => {
      if (widgetConfig.value.autoRefresh && widgetConfig.value.refreshInterval) {
        refreshInterval = setInterval(loadComments, widgetConfig.value.refreshInterval)
      }
    }
    
    const stopAutoRefresh = () => {
      if (refreshInterval) {
        clearInterval(refreshInterval)
        refreshInterval = null
      }
    }
    
    // Lifecycle
    onMounted(() => {
      loadComments()
      startAutoRefresh()
    })
    
    // Watchers
    watch(() => props.projectId, loadComments)
    
    watch(() => widgetConfig.value.autoRefresh, (newValue) => {
      if (newValue) {
        startAutoRefresh()
      } else {
        stopAutoRefresh()
      }
    })
    
    watch(() => widgetConfig.value.refreshInterval, () => {
      stopAutoRefresh()
      startAutoRefresh()
    })
    
    // Cleanup
    onUnmounted(() => {
      stopAutoRefresh()
    })
    

</script>

<style scoped>
.comments-widget {
  @apply space-y-4;
}

.comments-header {
  @apply flex items-center justify-between;
}

.header-left {
  @apply flex flex-col space-y-2;
}

.comments-title {
  @apply text-xl font-bold text-gray-900;
}

.comments-stats {
  @apply flex items-center space-x-4 text-sm text-gray-600;
}

.stat-item {
  @apply flex items-center;
}

.header-right {
  @apply flex items-center space-x-3;
}

.filter-controls {
  @apply flex items-center space-x-2;
}

.filter-select {
  @apply px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent;
}

.add-comment-btn {
  @apply bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center;
}

.search-bar {
  @apply relative;
}

.search-input-wrapper {
  @apply relative;
}

.search-icon {
  @apply absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400;
}

.search-input {
  @apply w-full pl-10 pr-10 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent;
}

.clear-search-btn {
  @apply absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600;
}

.comments-list {
  @apply space-y-4 max-h-96 overflow-y-auto;
}

.comment-item {
  @apply bg-white border rounded-lg p-4 transition-shadow;
}

.comment-item.unread {
  @apply border-blue-200 bg-blue-50;
}

.comment-item.mention {
  @apply border-yellow-200 bg-yellow-50;
}

.comment-item.my-comment {
  @apply border-green-200 bg-green-50;
}

.comment-header {
  @apply flex items-start justify-between mb-3;
}

.comment-author {
  @apply flex items-start space-x-3;
}

.author-avatar {
  @apply w-8 h-8 rounded-full object-cover;
}

.author-info {
  @apply flex flex-col;
}

.author-name {
  @apply font-medium text-gray-900;
}

.comment-date {
  @apply text-sm text-gray-500;
}

.comment-actions {
  @apply flex items-center space-x-2;
}

.action-btn {
  @apply p-2 text-gray-400 hover:text-gray-600 transition-colors;
}

.action-btn.delete {
  @apply hover:text-red-600;
}

.comment-content {
  @apply mb-3;
}

.reply-indicator {
  @apply text-sm text-gray-500 mb-2 flex items-center;
}

.comment-text {
  @apply text-gray-900 leading-relaxed;
}

.comment-attachments {
  @apply mt-3 space-y-2;
}

.attachment-item {
  @apply flex items-center space-x-2 text-sm;
}

.attachment-link {
  @apply text-blue-600 hover:text-blue-800 underline;
}

.comment-meta {
  @apply flex items-center justify-between text-sm;
}

.meta-left {
  @apply flex items-center space-x-3;
}

.meta-item {
  @apply flex items-center text-gray-500;
}

.meta-item.mention {
  @apply text-yellow-600;
}

.meta-item.priority {
  @apply font-medium;
}

.priority-high {
  @apply text-red-600;
}

.priority-medium {
  @apply text-yellow-600;
}

.priority-low {
  @apply text-green-600;
}

.meta-right {
  @apply flex items-center;
}

.replies-toggle {
  @apply text-blue-600 hover:text-blue-800 flex items-center transition-colors;
}

.comment-replies {
  @apply mt-4 pl-6 border-l-2 border-gray-200 space-y-3;
}

.reply-item {
  @apply bg-gray-50 rounded-lg p-3;
}

.reply-header {
  @apply flex items-center space-x-2 mb-2;
}

.reply-avatar {
  @apply w-6 h-6 rounded-full object-cover;
}

.reply-info {
  @apply flex items-center space-x-2;
}

.reply-author {
  @apply font-medium text-gray-900 text-sm;
}

.reply-date {
  @apply text-xs text-gray-500;
}

.reply-content {
  @apply text-sm text-gray-800;
}

.no-comments {
  @apply text-center py-8;
}

.add-first-comment-btn {
  @apply mt-4 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center mx-auto;
}

.pagination {
  @apply flex items-center justify-center space-x-4 pt-4 border-t border-gray-200;
}

.pagination-btn {
  @apply p-2 text-gray-500 hover:text-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors;
}

.pagination-info {
  @apply text-sm text-gray-600;
}

/* Styles pour le contenu formaté */
:deep(.mention) {
  @apply bg-blue-100 text-blue-800 px-1 rounded font-medium;
}

:deep(.comment-link) {
  @apply text-blue-600 hover:text-blue-800 underline;
}
</style>