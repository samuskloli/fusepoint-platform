<template>
  <div class="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50" @click="closeModal">
    <div class="relative top-20 mx-auto p-5 border w-11/12 md:w-2/3 lg:w-1/2 shadow-lg rounded-md bg-white" @click.stop>
      <div class="flex items-center justify-between mb-4">
        <h3 class="text-lg font-medium text-gray-900">Détails de l'événement</h3>
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
              <span
                :class="[
                  'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium',
                  getStatusClass(event.status)
                ]"
              >
                {{ getStatusLabel(event.status) }}
              </span>
              <span
                :class="[
                  'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium',
                  getPriorityClass(event.priority)
                ]"
              >
                {{ getPriorityLabel(event.priority) }}
              </span>
              <span
                :class="[
                  'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium',
                  getTypeClass(event.type)
                ]"
              >
                {{ getTypeLabel(event.type) }}
              </span>
            </div>
          </div>
          <div
            class="w-4 h-4 rounded-full ml-4"
            :style="{ backgroundColor: getColorHex(event.color) }"
          ></div>
        </div>

        <!-- Description -->
        <div v-if="event.description">
          <h5 class="text-sm font-medium text-gray-700 mb-1">Description</h5>
          <p class="text-gray-600 text-sm">{{ event.description }}</p>
        </div>

        <!-- Dates et heures -->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <h5 class="text-sm font-medium text-gray-700 mb-1">Date de début</h5>
            <p class="text-gray-600 text-sm">
              {{ formatDateTime(event.start_date) }}
            </p>
          </div>
          <div v-if="event.end_date">
            <h5 class="text-sm font-medium text-gray-700 mb-1">Date de fin</h5>
            <p class="text-gray-600 text-sm">
              {{ formatDateTime(event.end_date) }}
            </p>
          </div>
        </div>

        <!-- Durée -->
        <div v-if="event.end_date">
          <h5 class="text-sm font-medium text-gray-700 mb-1">Durée</h5>
          <p class="text-gray-600 text-sm">{{ getDuration() }}</p>
        </div>

        <!-- Lieu -->
        <div v-if="event.location">
          <h5 class="text-sm font-medium text-gray-700 mb-1">Lieu</h5>
          <p class="text-gray-600 text-sm">{{ event.location }}</p>
        </div>

        <!-- Participants -->
        <div v-if="event.participants && event.participants.length > 0">
          <h5 class="text-sm font-medium text-gray-700 mb-2">Participants ({{ event.participants.length }})</h5>
          <div class="space-y-1">
            <div
              v-for="participant in event.participants"
              :key="participant"
              class="flex items-center space-x-2"
            >
              <div class="w-6 h-6 bg-gray-200 rounded-full flex items-center justify-center">
                <span class="text-xs text-gray-600">
                  {{ participant.charAt(0).toUpperCase() }}
                </span>
              </div>
              <span class="text-sm text-gray-600">{{ participant }}</span>
            </div>
          </div>
        </div>

        <!-- Rappel -->
        <div v-if="event.reminder">
          <h5 class="text-sm font-medium text-gray-700 mb-1">Rappel</h5>
          <p class="text-gray-600 text-sm">{{ getReminderLabel(event.reminder) }}</p>
        </div>

        <!-- Informations supplémentaires -->
        <div class="bg-gray-50 p-3 rounded-lg">
          <h5 class="text-sm font-medium text-gray-700 mb-2">Informations</h5>
          <div class="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span class="text-gray-500">Créé le:</span>
              <span class="text-gray-700 ml-1">{{ formatDate(event.created_at) }}</span>
            </div>
            <div v-if="event.updated_at">
              <span class="text-gray-500">Modifié le:</span>
              <span class="text-gray-700 ml-1">{{ formatDate(event.updated_at) }}</span>
            </div>
            <div v-if="event.all_day">
              <span class="text-gray-500">Toute la journée:</span>
              <span class="text-green-600 ml-1">Oui</span>
            </div>
          </div>
        </div>
      </div>

      <div class="flex justify-between mt-6">
        <div class="flex space-x-3">
          <button
            @click="editEvent"
            class="px-4 py-2 text-sm font-medium text-blue-600 bg-blue-50 border border-blue-200 rounded-md hover:bg-blue-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            Modifier
          </button>
          <button
            @click="deleteEvent"
            class="px-4 py-2 text-sm font-medium text-red-600 bg-red-50 border border-red-200 rounded-md hover:bg-red-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
          >
            Supprimer
          </button>
        </div>
        <button
          @click="closeModal"
          class="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 border border-gray-300 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
        >
          Fermer
        </button>
      </div>
    </div>
  </div>
</template>

<script>
import { computed } from 'vue'

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
    const statusLabels = {
      scheduled: 'Planifié',
      in_progress: 'En cours',
      completed: 'Terminé',
      cancelled: 'Annulé',
      postponed: 'Reporté'
    }

    const priorityLabels = {
      low: 'Faible',
      medium: 'Moyenne',
      high: 'Élevée',
      urgent: 'Urgente'
    }

    const typeLabels = {
      meeting: 'Réunion',
      deadline: 'Échéance',
      milestone: 'Jalon',
      review: 'Révision',
      presentation: 'Présentation',
      other: 'Autre'
    }

    const reminderLabels = {
      '5': '5 minutes avant',
      '15': '15 minutes avant',
      '30': '30 minutes avant',
      '60': '1 heure avant',
      '1440': '1 jour avant'
    }

    const colors = {
      blue: '#3B82F6',
      green: '#10B981',
      red: '#EF4444',
      yellow: '#F59E0B',
      purple: '#8B5CF6',
      pink: '#EC4899',
      indigo: '#6366F1',
      gray: '#6B7280'
    }

    const getStatusLabel = (status) => statusLabels[status] || status
    const getPriorityLabel = (priority) => priorityLabels[priority] || priority
    const getTypeLabel = (type) => typeLabels[type] || type
    const getReminderLabel = (reminder) => reminderLabels[reminder] || `${reminder} minutes avant`
    const getColorHex = (color) => colors[color] || colors.blue

    const getStatusClass = (status) => {
      const classes = {
        scheduled: 'bg-blue-100 text-blue-800',
        in_progress: 'bg-yellow-100 text-yellow-800',
        completed: 'bg-green-100 text-green-800',
        cancelled: 'bg-red-100 text-red-800',
        postponed: 'bg-gray-100 text-gray-800'
      }
      return classes[status] || 'bg-gray-100 text-gray-800'
    }

    const getPriorityClass = (priority) => {
      const classes = {
        low: 'bg-green-100 text-green-800',
        medium: 'bg-yellow-100 text-yellow-800',
        high: 'bg-orange-100 text-orange-800',
        urgent: 'bg-red-100 text-red-800'
      }
      return classes[priority] || 'bg-gray-100 text-gray-800'
    }

    const getTypeClass = (type) => {
      return 'bg-purple-100 text-purple-800'
    }

    const formatDateTime = (dateString) => {
      if (!dateString) return ''
      const date = new Date(dateString)
      return date.toLocaleString('fr-FR', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      })
    }

    const formatDate = (dateString) => {
      if (!dateString) return ''
      const date = new Date(dateString)
      return date.toLocaleDateString('fr-FR', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      })
    }

    const getDuration = () => {
      if (!props.event.start_date || !props.event.end_date) return ''
      
      const start = new Date(props.event.start_date)
      const end = new Date(props.event.end_date)
      const diffMs = end - start
      
      const diffHours = Math.floor(diffMs / (1000 * 60 * 60))
      const diffMinutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60))
      
      if (diffHours > 0) {
        return `${diffHours}h${diffMinutes > 0 ? ` ${diffMinutes}min` : ''}`
      } else {
        return `${diffMinutes}min`
      }
    }

    const editEvent = () => {
      emit('edit', props.event)
    }

    const deleteEvent = () => {
      if (confirm('Êtes-vous sûr de vouloir supprimer cet événement ?')) {
        emit('delete', props.event)
      }
    }

    const closeModal = () => {
      emit('close')
    }

    return {
      getStatusLabel,
      getPriorityLabel,
      getTypeLabel,
      getReminderLabel,
      getColorHex,
      getStatusClass,
      getPriorityClass,
      getTypeClass,
      formatDateTime,
      formatDate,
      getDuration,
      editEvent,
      deleteEvent,
      closeModal
    }
  }
}
</script>