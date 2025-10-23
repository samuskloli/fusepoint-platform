<template>
  <div class="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50" @click="closeModal">
    <div class="relative top-20 mx-auto p-5 border w-11/12 md:w-2/3 lg:w-1/2 shadow-lg rounded-md bg-white" @click.stop>
      <div class="flex items-center justify-between mb-4">
        <h3 class="text-lg font-medium text-gray-900">{{ t('events.details.title') }}</h3>
        <button @click="closeModal" class="text-gray-400 hover:text-gray-600">
          <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
          </svg>
        </button>
      </div>

      <div class="space-y-4">
        <!-- Titre et statut -->
        <div class="flex items-start justify-between">
          <div class="flex-1">
            <h4 class="text-xl font-semibold text-gray-900 mb-2">{{ event.title }}</h4>
            <div class="flex items-center space-x-4">
              <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium" :class="getStatusClass(event.status)">
                {{ getStatusLabel(event.status) }}
              </span>
              <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium" :class="getTypeClass(event.type)">
                <i :class="getTypeIcon(event.type)" class="mr-1"></i>
                {{ getTypeLabel(event.type) }}
              </span>
              <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium" :class="getPriorityClass(event.priority)">
                {{ getPriorityLabel(event.priority) }}
              </span>
            </div>
          </div>
          <div class="flex space-x-2">
            <button
              v-if="canEdit"
              @click="editEvent"
              class="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              <i class="fas fa-edit mr-2"></i>
              {{ t('common.edit') }}
            </button>
            <button
              v-if="canDelete"
              @click="confirmDelete"
              class="inline-flex items-center px-3 py-2 border border-red-300 shadow-sm text-sm leading-4 font-medium rounded-md text-red-700 bg-white hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
            >
              <i class="fas fa-trash mr-2"></i>
              {{ t('common.delete') }}
            </button>
          </div>
        </div>

        <!-- Description -->
        <div v-if="event.description">
          <h5 class="text-sm font-medium text-gray-900 mb-2">{{ t('events.details.description') }}</h5>
          <p class="text-sm text-gray-700 whitespace-pre-wrap">{{ event.description }}</p>
        </div>

        <!-- Informations temporelles -->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <h5 class="text-sm font-medium text-gray-900 mb-2">{{ t('events.details.startDate') }}</h5>
            <p class="text-sm text-gray-700">
              <i class="fas fa-calendar mr-2"></i>
              {{ formatDateTime(event.start_date) }}
            </p>
          </div>
          <div v-if="event.end_date">
            <h5 class="text-sm font-medium text-gray-900 mb-2">{{ t('events.details.endDate') }}</h5>
            <p class="text-sm text-gray-700">
              <i class="fas fa-calendar mr-2"></i>
              {{ formatDateTime(event.end_date) }}
            </p>
          </div>
        </div>

        <!-- Durée -->
        <div v-if="event.end_date">
          <h5 class="text-sm font-medium text-gray-900 mb-2">{{ t('events.details.duration') }}</h5>
          <p class="text-sm text-gray-700">
            <i class="fas fa-clock mr-2"></i>
            {{ getDuration(event.start_date, event.end_date) }}
          </p>
        </div>

        <!-- Lieu -->
        <div v-if="event.location">
          <h5 class="text-sm font-medium text-gray-900 mb-2">{{ t('events.details.location') }}</h5>
          <p class="text-sm text-gray-700">
            <i class="fas fa-map-marker-alt mr-2"></i>
            {{ event.location }}
          </p>
        </div>

        <!-- Participants -->
        <div v-if="event.participants && event.participants.length > 0">
          <h5 class="text-sm font-medium text-gray-900 mb-2">{{ t('events.details.participants') }}</h5>
          <div class="flex flex-wrap gap-2">
            <div
              v-for="participant in event.participants"
              :key="participant.id"
              class="flex items-center space-x-2 bg-gray-100 rounded-full px-3 py-1"
            >
              <div class="w-6 h-6 bg-gray-300 rounded-full flex items-center justify-center">
                <img v-if="participant.avatar" :src="participant.avatar" :alt="participant.name" class="w-6 h-6 rounded-full object-cover" />
                <span v-else class="text-xs font-medium text-gray-700">
                  {{ participant.name?.charAt(0).toUpperCase() }}
                </span>
              </div>
              <span class="text-sm text-gray-700">{{ participant.name }}</span>
            </div>
          </div>
        </div>

        <!-- Rappels -->
        <div v-if="event.reminders && event.reminders.length > 0">
          <h5 class="text-sm font-medium text-gray-900 mb-2">{{ t('events.details.reminders') }}</h5>
          <div class="space-y-1">
            <div
              v-for="reminder in event.reminders"
              :key="reminder.id"
              class="flex items-center text-sm text-gray-700"
            >
              <i class="fas fa-bell mr-2"></i>
              {{ getReminderText(reminder) }}
            </div>
          </div>
        </div>

        <!-- Récurrence -->
        <div v-if="event.recurrence">
          <h5 class="text-sm font-medium text-gray-900 mb-2">{{ t('events.details.recurrence') }}</h5>
          <p class="text-sm text-gray-700">
            <i class="fas fa-repeat mr-2"></i>
            {{ getRecurrenceText(event.recurrence) }}
          </p>
        </div>

        <!-- Pièces jointes -->
        <div v-if="event.attachments && event.attachments.length > 0">
          <h5 class="text-sm font-medium text-gray-900 mb-2">{{ t('events.details.attachments') }}</h5>
          <div class="space-y-2">
            <div
              v-for="attachment in event.attachments"
              :key="attachment.id"
              class="flex items-center justify-between p-2 border border-gray-200 rounded-md"
            >
              <div class="flex items-center space-x-2">
                <i class="fas fa-paperclip text-gray-400"></i>
                <span class="text-sm text-gray-700">{{ attachment.name }}</span>
                <span class="text-xs text-gray-500">({{ formatFileSize(attachment.size) }})</span>
              </div>
              <button
                @click="downloadAttachment(attachment)"
                class="text-blue-600 hover:text-blue-800 text-sm"
              >
                <i class="fas fa-download"></i>
              </button>
            </div>
          </div>
        </div>

        <!-- Métadonnées -->
        <div class="border-t border-gray-200 pt-4">
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-600">
            <div>
              <span class="font-medium">{{ t('events.details.createdBy') }}:</span>
              {{ event.created_by?.name || t('common.unknown') }}
            </div>
            <div>
              <span class="font-medium">{{ t('events.details.createdAt') }}:</span>
              {{ formatDateTime(event.created_at) }}
            </div>
            <div v-if="event.updated_at && event.updated_at !== event.created_at">
              <span class="font-medium">{{ t('events.details.updatedAt') }}:</span>
              {{ formatDateTime(event.updated_at) }}
            </div>
            <div v-if="event.project">
              <span class="font-medium">{{ t('events.details.project') }}:</span>
              {{ event.project.name }}
            </div>
          </div>
        </div>
      </div>

      <!-- Actions -->
      <div class="flex justify-end space-x-3 mt-6 pt-4 border-t border-gray-200">
        <button
          @click="closeModal"
          class="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          {{ t('common.close') }}
        </button>
      </div>
    </div>
  </div>
</template>

<script>
import { computed } from 'vue'
import { useTranslation } from '@/composables/useTranslation'
import { useAuth } from '@/composables/useAuth'
import { useNotifications } from '@/composables/useNotifications'

export default {
  name: 'EventDetailsModal',
  props: {
    event: {
      type: Object,
      required: true
    }
  },
  emits: ['close', 'edit', 'delete'],
  setup(props, { emit }) {
    const { t } = useTranslation()
    const { user } = useAuth()
    const { success, error: showError } = useNotifications()

    const canEdit = computed(() => {
      return user.value && (
        user.value.role === 'admin' ||
        user.value.role === 'super_admin' ||
        props.event.created_by?.id === user.value.id
      )
    })

    const canDelete = computed(() => {
      return user.value && (
        user.value.role === 'admin' ||
        user.value.role === 'super_admin' ||
        props.event.created_by?.id === user.value.id
      )
    })

    const closeModal = () => {
      emit('close')
    }

    const editEvent = () => {
      emit('edit', props.event)
    }

    const confirmDelete = () => {
      if (confirm(t('events.confirmDelete'))) {
        emit('delete', props.event)
      }
    }

    const getStatusClass = (status) => {
      const classes = {
        'planned': 'bg-blue-100 text-blue-800',
        'in_progress': 'bg-yellow-100 text-yellow-800',
        'completed': 'bg-green-100 text-green-800',
        'cancelled': 'bg-red-100 text-red-800',
        'postponed': 'bg-gray-100 text-gray-800'
      }
      return classes[status] || 'bg-gray-100 text-gray-800'
    }

    const getStatusLabel = (status) => {
      const labels = {
        'planned': t('events.status.planned'),
        'in_progress': t('events.status.inProgress'),
        'completed': t('events.status.completed'),
        'cancelled': t('events.status.cancelled'),
        'postponed': t('events.status.postponed')
      }
      return labels[status] || status
    }

    const getTypeClass = (type) => {
      const classes = {
        'meeting': 'bg-blue-100 text-blue-800',
        'task': 'bg-green-100 text-green-800',
        'deadline': 'bg-red-100 text-red-800',
        'milestone': 'bg-purple-100 text-purple-800',
        'reminder': 'bg-yellow-100 text-yellow-800'
      }
      return classes[type] || 'bg-gray-100 text-gray-800'
    }

    const getTypeIcon = (type) => {
      const icons = {
        'meeting': 'fas fa-users',
        'task': 'fas fa-tasks',
        'deadline': 'fas fa-exclamation-triangle',
        'milestone': 'fas fa-flag',
        'reminder': 'fas fa-bell'
      }
      return icons[type] || 'fas fa-calendar'
    }

    const getTypeLabel = (type) => {
      const labels = {
        'meeting': t('events.type.meeting'),
        'task': t('events.type.task'),
        'deadline': t('events.type.deadline'),
        'milestone': t('events.type.milestone'),
        'reminder': t('events.type.reminder')
      }
      return labels[type] || type
    }

    const getPriorityClass = (priority) => {
      const classes = {
        'low': 'bg-green-100 text-green-800',
        'medium': 'bg-yellow-100 text-yellow-800',
        'high': 'bg-orange-100 text-orange-800',
        'urgent': 'bg-red-100 text-red-800'
      }
      return classes[priority] || 'bg-gray-100 text-gray-800'
    }

    const getPriorityLabel = (priority) => {
      const labels = {
        'low': t('events.priority.low'),
        'medium': t('events.priority.medium'),
        'high': t('events.priority.high'),
        'urgent': t('events.priority.urgent')
      }
      return labels[priority] || priority
    }

    const formatDateTime = (dateString) => {
      if (!dateString) return ''
      const date = new Date(dateString)
      return date.toLocaleString()
    }

    const getDuration = (startDate, endDate) => {
      if (!startDate || !endDate) return ''
      const start = new Date(startDate)
      const end = new Date(endDate)
      const diffMs = end - start
      const diffHours = Math.floor(diffMs / (1000 * 60 * 60))
      const diffMinutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60))
      
      if (diffHours > 0) {
        return `${diffHours}h ${diffMinutes}min`
      }
      return `${diffMinutes}min`
    }

    const getReminderText = (reminder) => {
      const value = reminder.value
      const unit = reminder.unit
      const unitLabels = {
        'minutes': t('time.minutes'),
        'hours': t('time.hours'),
        'days': t('time.days'),
        'weeks': t('time.weeks')
      }
      return `${value} ${unitLabels[unit] || unit} ${t('events.details.beforeEvent')}`
    }

    const getRecurrenceText = (recurrence) => {
      const patterns = {
        'daily': t('events.recurrence.daily'),
        'weekly': t('events.recurrence.weekly'),
        'monthly': t('events.recurrence.monthly'),
        'yearly': t('events.recurrence.yearly')
      }
      return patterns[recurrence.pattern] || recurrence.pattern
    }

    const formatFileSize = (bytes) => {
      if (bytes === 0) return '0 B'
      const k = 1024
      const sizes = ['B', 'KB', 'MB', 'GB']
      const i = Math.floor(Math.log(bytes) / Math.log(k))
      return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
    }

    const downloadAttachment = async (attachment) => {
      try {
        // Logique de téléchargement
        const link = document.createElement('a')
        link.href = attachment.url
        link.download = attachment.name
        link.click()
        success(t('events.attachmentDownloaded'))
      } catch (error) {
        console.error('Erreur lors du téléchargement:', error)
        showError(t('events.downloadError'))
      }
    }

    return {
      canEdit,
      canDelete,
      closeModal,
      editEvent,
      confirmDelete,
      getStatusClass,
      getStatusLabel,
      getTypeClass,
      getTypeIcon,
      getTypeLabel,
      getPriorityClass,
      getPriorityLabel,
      formatDateTime,
      getDuration,
      getReminderText,
      getRecurrenceText,
      formatFileSize,
      downloadAttachment,
      t
    }
  }
}
</script>

<style scoped>
/* Styles spécifiques au composant */
</style>