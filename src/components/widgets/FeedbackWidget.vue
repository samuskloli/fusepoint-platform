<template>
  <BaseWidget 
    :widget="widgetConfig"
    :loading="loading"
    :error="error"
    @configure="showConfigModal = true"
    @toggle="toggleWidget"
    @retry="loadFeedback"
  >
    <div class="feedback-widget">
      <!-- En-tête -->
      <div class="feedback-header">
        <div class="header-left">
          <h3 class="feedback-title">{{ t('widgets.feedback.title') }}</h3>
          <div class="feedback-stats">
            <span class="stat-item">
              <i class="fas fa-comment mr-1"></i>
              {{ totalFeedback }} {{ t('widgets.feedback.totalFeedback') }}
            </span>
            <span class="stat-item">
              <i class="fas fa-star mr-1"></i>
              {{ averageRating }}/5
            </span>
          </div>
        </div>
        <div class="header-right">
          <button 
            @click="showAddModal = true" 
            class="btn-primary btn-sm"
            :title="t('widgets.feedback.addFeedback')"
          >
            <i class="fas fa-plus mr-1"></i>
            {{ t('widgets.feedback.add') }}
          </button>
        </div>
      </div>

      <!-- Liste des feedbacks -->
      <div class="feedback-list">
        <div v-if="filteredFeedback.length === 0" class="empty-state">
          <i class="fas fa-comment-slash"></i>
          <p>{{ t('widgets.feedback.noFeedback') }}</p>
        </div>
        
        <div v-else class="feedback-items">
          <div 
            v-for="feedback in paginatedFeedback" 
            :key="feedback.id"
            class="feedback-item"
            @click="selectFeedback(feedback)"
          >
            <div class="feedback-content">
              <div class="feedback-header-item">
                <div class="feedback-rating">
                  <span v-for="star in 5" :key="star" class="star" :class="{ 'filled': star <= feedback.rating }">
                    <i class="fas fa-star"></i>
                  </span>
                </div>
                <span class="feedback-date">{{ formatDate(feedback.created_at) }}</span>
              </div>
              <p class="feedback-text">{{ feedback.message }}</p>
              <div class="feedback-meta">
                <span class="feedback-author">{{ feedback.author_name }}</span>
                <span class="feedback-type" :class="`type-${feedback.type}`">{{ feedback.type }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Pagination -->
      <div v-if="totalPages > 1" class="pagination">
        <button 
          @click="currentPage--"
          :disabled="currentPage === 1"
          class="btn-secondary btn-sm"
        >
          <i class="fas fa-chevron-left"></i>
        </button>
        
        <span class="pagination-info">
          {{ currentPage }} / {{ totalPages }}
        </span>
        
        <button 
          @click="currentPage++"
          :disabled="currentPage === totalPages"
          class="btn-secondary btn-sm"
        >
          <i class="fas fa-chevron-right"></i>
        </button>
      </div>
    </div>

    <!-- Modal d'ajout de feedback -->
    <div v-if="showAddModal" class="modal-overlay" @click="showAddModal = false">
      <div class="modal-content" @click.stop>
        <div class="modal-header">
          <h3>{{ t('widgets.feedback.addFeedback') }}</h3>
          <button @click="showAddModal = false" class="btn-close">
            <i class="fas fa-times"></i>
          </button>
        </div>
        <div class="modal-body">
          <form @submit.prevent="submitFeedback">
            <div class="form-group">
              <label>{{ t('widgets.feedback.rating') }}</label>
              <div class="rating-input">
                <span v-for="star in 5" :key="star" 
                      @click="newFeedback.rating = star"
                      class="star clickable" 
                      :class="{ 'filled': star <= newFeedback.rating }">
                  <i class="fas fa-star"></i>
                </span>
              </div>
            </div>
            <div class="form-group">
              <label>{{ t('widgets.feedback.type') }}</label>
              <select v-model="newFeedback.type" required>
                <option value="bug">{{ t('widgets.feedback.types.bug') }}</option>
                <option value="feature">{{ t('widgets.feedback.types.feature') }}</option>
                <option value="improvement">{{ t('widgets.feedback.types.improvement') }}</option>
                <option value="general">{{ t('widgets.feedback.types.general') }}</option>
              </select>
            </div>
            <div class="form-group">
              <label>{{ t('widgets.feedback.message') }}</label>
              <textarea v-model="newFeedback.message" required rows="4"></textarea>
            </div>
            <div class="form-actions">
              <button type="button" @click="showAddModal = false" class="btn-secondary">
                {{ t('common.cancel') }}
              </button>
              <button type="submit" class="btn-primary">
                {{ t('common.save') }}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>

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
import { ref, computed, onMounted, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import BaseWidget from './shared/components/BaseWidget.vue'
import WidgetConfigModal from './shared/components/WidgetConfigModal.vue'
// import FeedbackCreateModal from './components/FeedbackCreateModal.vue'
// import { useNotifications } from '@/composables/useNotifications'
// import { useAuth } from '@/composables/useAuth'
// import { feedbackService } from './services/feedbackService'
// import widgetDataService from '@/services/widgetDataService'

// Types
interface Feedback {
  id: string
  rating: number
  type: string
  message: string
  author_name: string
  created_at: string
}

interface FeedbackConfig {
  titleKey: string
  isEnabled: boolean
  showRatings: boolean
  showComments: boolean
  allowAnonymous: boolean
  maxFeedbacks: number
  autoRefresh: boolean
}

interface ConfigOption {
  key: string
  label: string
  type: string
  value: any
}

interface NewFeedback {
  rating: number
  type: string
  message: string
}

// Props
interface Props {
  projectId: string
  widgetData?: Record<string, any>
  widget?: Record<string, any>
}

const props = withDefaults(defineProps<Props>(), {
  widgetData: () => ({}),
  widget: () => ({})
})

// Emits
const emit = defineEmits<{
  'widget-updated': [updatedWidget: Record<string, any>]
}>()

// Composables
const { t } = useI18n()
// Mock notifications for now
const showNotification = (message: string, type: string = 'info') => {
  console.log(`${type}: ${message}`)
}
    
// État du widget
const loading = ref<boolean>(false)
const error = ref<string | null>(null)
const feedback = ref<Feedback[]>([])
const showAddModal = ref<boolean>(false)
const showConfigModal = ref<boolean>(false)
const currentPage = ref<number>(1)
const itemsPerPage = ref<number>(10)

// Configuration du widget
const widgetConfig = computed((): FeedbackConfig => ({
  titleKey: 'widgets.feedback.title',
  isEnabled: props.widget?.is_enabled ?? true,
  showRatings: props.widget?.show_ratings ?? true,
  showComments: props.widget?.show_comments ?? true,
  allowAnonymous: props.widget?.allow_anonymous ?? false,
  maxFeedbacks: props.widget?.max_feedbacks ?? 50,
  autoRefresh: props.widget?.auto_refresh ?? true
}))

// Nouveau feedback
const newFeedback = ref<NewFeedback>({
  rating: 5,
  type: 'general',
  message: ''
})
    
// Computed
const totalFeedback = computed((): number => feedback.value.length)
const averageRating = computed((): string => {
  if (feedback.value.length === 0) return '0'
  const sum = feedback.value.reduce((acc: number, item: Feedback) => acc + item.rating, 0)
  return (sum / feedback.value.length).toFixed(1)
})

const filteredFeedback = computed((): Feedback[] => {
  return feedback.value.sort((a: Feedback, b: Feedback) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
})

const totalPages = computed((): number => {
  return Math.ceil(filteredFeedback.value.length / itemsPerPage.value)
})

const paginatedFeedback = computed((): Feedback[] => {
  const start = (currentPage.value - 1) * itemsPerPage.value
  const end = start + itemsPerPage.value
  return filteredFeedback.value.slice(start, end)
})

// Options de configuration
const configOptions = computed((): ConfigOption[] => [
  {
    key: 'showRatings',
    label: t('widgets.feedback.config.showRating'),
    type: 'boolean',
    value: widgetConfig.value.showRatings
  },
  {
    key: 'showComments',
    label: t('widgets.feedback.config.showType'),
    type: 'boolean',
    value: widgetConfig.value.showComments
  },
  {
    key: 'autoRefresh',
    label: t('widgets.feedback.config.autoRefresh'),
    type: 'boolean',
    value: widgetConfig.value.autoRefresh
  }
])
    
// Méthodes
const loadFeedback = async (): Promise<void> => {
  try {
    loading.value = true
    error.value = null
    
    // Données de démonstration
    const demoFeedback: Feedback[] = [
      {
        id: '1',
        rating: 5,
        type: 'feature',
        message: 'Excellent travail sur cette fonctionnalité !',
        author_name: 'Jean Dupont',
        created_at: new Date().toISOString()
      },
      {
        id: '2',
        rating: 4,
        type: 'bug',
        message: 'Petit problème avec l\'interface utilisateur',
        author_name: 'Marie Martin',
        created_at: new Date(Date.now() - 86400000).toISOString()
      }
    ]
    
    feedback.value = demoFeedback
    
  } catch (err) {
    console.error('Erreur lors du chargement des feedbacks:', err)
    error.value = 'Erreur de chargement'
    showNotification('Erreur de chargement', 'error')
  } finally {
    loading.value = false
  }
}

const submitFeedback = async (): Promise<void> => {
  try {
    loading.value = true
    
    const newFeedbackItem: Feedback = {
      id: Date.now().toString(),
      rating: newFeedback.value.rating,
      type: newFeedback.value.type,
      message: newFeedback.value.message,
      author_name: 'Utilisateur',
      created_at: new Date().toISOString()
    }
    
    feedback.value.unshift(newFeedbackItem)
    
    // Réinitialiser le formulaire
    newFeedback.value = {
      rating: 5,
      type: 'general',
      message: ''
    }
    
    showAddModal.value = false
    showNotification('Feedback ajouté avec succès', 'success')
    
  } catch (err) {
    console.error('Erreur lors de l\'ajout du feedback:', err)
    showNotification('Erreur lors de l\'ajout', 'error')
  } finally {
    loading.value = false
  }
}

const selectFeedback = (feedbackItem: Feedback): void => {
  // Logique pour sélectionner/afficher les détails d'un feedback
  console.log('Feedback sélectionné:', feedbackItem)
}

const toggleWidget = (): void => {
  const updatedWidget = {
    ...props.widget,
    is_enabled: !props.widget?.is_enabled
  }
  emit('widget-updated', updatedWidget)
}

const updateConfig = (newConfig: Partial<FeedbackConfig>): void => {
  showConfigModal.value = false
  showNotification('Configuration sauvegardée', 'success')
}

const formatDate = (dateString: string): string => {
  return new Date(dateString).toLocaleDateString('fr-FR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}
    
    // Lifecycle
    onMounted(() => {
      loadFeedback()
    })
    
    // Watchers
    watch(() => props.projectId, () => {
      loadFeedback()
    })
    

</script>

<style scoped>
.feedback-widget {
  @apply h-full flex flex-col;
}

.feedback-header {
  @apply flex items-center justify-between mb-4 pb-3 border-b border-gray-200;
}

.header-left {
  @apply flex-1;
}

.feedback-title {
  @apply text-lg font-semibold text-gray-900 mb-1;
}

.feedback-stats {
  @apply flex items-center space-x-4 text-sm text-gray-600;
}

.stat-item {
  @apply flex items-center;
}

.feedback-list {
  @apply flex-1 overflow-hidden;
}

.empty-state {
  @apply flex flex-col items-center justify-center h-full text-gray-500;
}

.empty-state i {
  @apply text-4xl mb-2;
}

.feedback-items {
  @apply space-y-3 max-h-full overflow-y-auto;
}

.feedback-item {
  @apply bg-white border border-gray-200 rounded-lg p-4 cursor-pointer transition-all duration-200 hover:shadow-md hover:border-blue-300;
}

.feedback-header-item {
  @apply flex items-center justify-between mb-2;
}

.feedback-rating {
  @apply flex items-center;
}

.star {
  @apply text-gray-300 text-sm;
}

.star.filled {
  @apply text-yellow-400;
}

.star.clickable {
  @apply cursor-pointer hover:text-yellow-500;
}

.feedback-date {
  @apply text-xs text-gray-500;
}

.feedback-text {
  @apply text-gray-700 mb-2 line-clamp-2;
}

.feedback-meta {
  @apply flex items-center justify-between text-sm;
}

.feedback-author {
  @apply text-gray-600 font-medium;
}

.feedback-type {
  @apply px-2 py-1 rounded-full text-xs font-medium;
}

.type-bug {
  @apply bg-red-100 text-red-800;
}

.type-feature {
  @apply bg-green-100 text-green-800;
}

.type-improvement {
  @apply bg-blue-100 text-blue-800;
}

.type-general {
  @apply bg-gray-100 text-gray-800;
}

.pagination {
  @apply flex items-center justify-center space-x-2 mt-4 pt-3 border-t border-gray-200;
}

.pagination-info {
  @apply text-sm text-gray-600 mx-3;
}

.modal-overlay {
  @apply fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50;
}

.modal-content {
  @apply bg-white rounded-lg shadow-xl max-w-md w-full mx-4;
}

.modal-header {
  @apply flex items-center justify-between p-4 border-b border-gray-200;
}

.modal-header h3 {
  @apply text-lg font-semibold text-gray-900;
}

.btn-close {
  @apply text-gray-400 hover:text-gray-600 transition-colors;
}

.modal-body {
  @apply p-4;
}

.form-group {
  @apply mb-4;
}

.form-group label {
  @apply block text-sm font-medium text-gray-700 mb-1;
}

.rating-input {
  @apply flex items-center space-x-1;
}

.form-group select,
.form-group textarea {
  @apply w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent;
}

.form-actions {
  @apply flex items-center justify-end space-x-2 mt-6;
}

.btn-primary {
  @apply bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors;
}

.btn-secondary {
  @apply bg-gray-200 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-300 transition-colors;
}

.btn-sm {
  @apply px-3 py-1 text-sm;
}
</style>