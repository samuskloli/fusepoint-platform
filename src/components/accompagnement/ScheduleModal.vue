<template>
  <div class="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50" @click="closeModal">
    <div class="relative top-20 mx-auto p-5 border w-11/12 md:w-3/4 lg:w-1/2 shadow-lg rounded-md bg-white" @click.stop>
      <!-- Header -->
      <div class="flex items-center justify-between pb-4 border-b border-gray-200">
        <div>
          <h3 class="text-lg font-semibold text-gray-900">Planifier une action</h3>
          <p class="text-sm text-gray-600 mt-1">{{ recommendation.title }}</p>
        </div>
        <button @click="closeModal" class="text-gray-400 hover:text-gray-600">
          <XMarkIcon class="w-6 h-6" />
        </button>
      </div>

      <!-- Contenu de la recommandation -->
      <div class="mt-6">
        <div class="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
          <div class="flex items-start">
            <div class="flex-shrink-0">
              <component :is="getRecommendationIcon(recommendation.type)" class="w-6 h-6 text-blue-600" />
            </div>
            <div class="ml-3 flex-1">
              <h4 class="text-sm font-medium text-blue-900">Recommandation Fusepoint</h4>
              <p class="text-sm text-blue-700 mt-1">{{ recommendation.description }}</p>
              
              <!-- Impact estimé -->
              <div v-if="recommendation.estimated_impact" class="mt-3">
                <div class="flex items-center space-x-4 text-xs">
                  <div class="flex items-center">
                    <ArrowTrendingUpIcon class="w-4 h-4 text-green-600 mr-1" />
                    <span class="text-gray-600">Impact estimé:</span>
                    <span class="font-medium text-gray-900 ml-1">{{ recommendation.estimated_impact }}</span>
                  </div>
                  <div v-if="recommendation.effort_level" class="flex items-center">
                    <ClockIcon class="w-4 h-4 text-orange-600 mr-1" />
                    <span class="text-gray-600">Effort:</span>
                    <span class="font-medium text-gray-900 ml-1">{{ getEffortLabel(recommendation.effort_level) }}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Formulaire de planification -->
        <form @submit.prevent="submitSchedule">
          <!-- Type d'action -->
          <div class="mb-6">
            <label class="block text-sm font-medium text-gray-700 mb-3">
              Comment souhaitez-vous procéder ?
            </label>
            <div class="space-y-3">
              <label class="flex items-start">
                <input
                  v-model="form.action_type"
                  type="radio"
                  value="schedule"
                  class="mt-1 mr-3 text-blue-600 focus:ring-blue-500"
                />
                <div>
                  <div class="text-sm font-medium text-gray-900">Planifier pour plus tard</div>
                  <div class="text-sm text-gray-500">Définir une date pour mettre en œuvre cette recommandation</div>
                </div>
              </label>
              <label class="flex items-start">
                <input
                  v-model="form.action_type"
                  type="radio"
                  value="request_service"
                  class="mt-1 mr-3 text-blue-600 focus:ring-blue-500"
                />
                <div>
                  <div class="text-sm font-medium text-gray-900">Demander une prestation</div>
                  <div class="text-sm text-gray-500">Confier la réalisation à l'équipe Fusepoint</div>
                </div>
              </label>
              <label class="flex items-start">
                <input
                  v-model="form.action_type"
                  type="radio"
                  value="discuss"
                  class="mt-1 mr-3 text-blue-600 focus:ring-blue-500"
                />
                <div>
                  <div class="text-sm font-medium text-gray-900">En discuter d'abord</div>
                  <div class="text-sm text-gray-500">Échanger avec l'équipe avant de décider</div>
                </div>
              </label>
            </div>
          </div>

          <!-- Date de planification (si planification) -->
          <div v-if="form.action_type === 'schedule'" class="mb-6">
            <label for="scheduled_date" class="block text-sm font-medium text-gray-700 mb-2">
              Date de mise en œuvre souhaitée
            </label>
            <input
              id="scheduled_date"
              v-model="form.scheduled_date"
              type="date"
              required
              class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              :min="minDate"
            />
          </div>

          <!-- Priorité -->
          <div class="mb-6">
            <label class="block text-sm font-medium text-gray-700 mb-2">
              Niveau de priorité
            </label>
            <div class="flex space-x-4">
              <label class="flex items-center">
                <input
                  v-model="form.priority"
                  type="radio"
                  value="low"
                  class="mr-2 text-blue-600 focus:ring-blue-500"
                />
                <span class="text-sm text-gray-700">Faible</span>
              </label>
              <label class="flex items-center">
                <input
                  v-model="form.priority"
                  type="radio"
                  value="normal"
                  class="mr-2 text-blue-600 focus:ring-blue-500"
                />
                <span class="text-sm text-gray-700">Normal</span>
              </label>
              <label class="flex items-center">
                <input
                  v-model="form.priority"
                  type="radio"
                  value="high"
                  class="mr-2 text-blue-600 focus:ring-blue-500"
                />
                <span class="text-sm text-gray-700">Élevée</span>
              </label>
            </div>
          </div>

          <!-- Notes personnelles -->
          <div class="mb-6">
            <label for="notes" class="block text-sm font-medium text-gray-700 mb-2">
              Notes personnelles (optionnel)
            </label>
            <textarea
              id="notes"
              v-model="form.notes"
              rows="3"
              class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Ajoutez vos commentaires, questions ou précisions..."
            ></textarea>
          </div>

          <!-- Rappel -->
          <div v-if="form.action_type === 'schedule'" class="mb-6">
            <div class="flex items-center">
              <input
                id="reminder"
                v-model="form.reminder_enabled"
                type="checkbox"
                class="mr-3 text-blue-600 focus:ring-blue-500 rounded"
              />
              <label for="reminder" class="text-sm text-gray-700">
                M'envoyer un rappel par email
              </label>
            </div>
            
            <div v-if="form.reminder_enabled" class="mt-3 ml-6">
              <label for="reminder_days" class="block text-sm text-gray-600 mb-1">
                Nombre de jours avant la date prévue
              </label>
              <select
                id="reminder_days"
                v-model="form.reminder_days"
                class="w-32 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="1">1 jour</option>
                <option value="3">3 jours</option>
                <option value="7">7 jours</option>
                <option value="14">14 jours</option>
              </select>
            </div>
          </div>

          <!-- Résumé de l'action -->
          <div class="mb-6 p-4 bg-gray-50 rounded-lg">
            <h4 class="text-sm font-medium text-gray-900 mb-2">Résumé de votre choix</h4>
            <div class="text-sm text-gray-700">
              <div v-if="form.action_type === 'schedule'">
                <p><strong>Action:</strong> Planification personnelle</p>
                <p v-if="form.scheduled_date"><strong>Date:</strong> {{ formatDate(form.scheduled_date) }}</p>
                <p><strong>Priorité:</strong> {{ getPriorityLabel(form.priority) }}</p>
                <p v-if="form.reminder_enabled"><strong>Rappel:</strong> {{ form.reminder_days }} jour(s) avant</p>
              </div>
              <div v-else-if="form.action_type === 'request_service'">
                <p><strong>Action:</strong> Demande de prestation à Fusepoint</p>
                <p><strong>Priorité:</strong> {{ getPriorityLabel(form.priority) }}</p>
              </div>
              <div v-else-if="form.action_type === 'discuss'">
                <p><strong>Action:</strong> Discussion avec l'équipe Fusepoint</p>
                <p><strong>Priorité:</strong> {{ getPriorityLabel(form.priority) }}</p>
              </div>
            </div>
          </div>

          <!-- Actions -->
          <div class="flex items-center justify-end space-x-3 pt-4 border-t border-gray-200">
            <button
              type="button"
              @click="closeModal"
              class="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            >
              Annuler
            </button>
            <button
              type="submit"
              :disabled="submitting || !isFormValid"
              class="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <span v-if="submitting" class="flex items-center">
                <svg class="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                  <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                  <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Traitement...
              </span>
              <span v-else>{{ getSubmitButtonText() }}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, computed } from 'vue'
import { 
  XMarkIcon, 
  ClockIcon,
  CalendarIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  ArrowTrendingUpIcon,
  BellIcon,
  ChartBarIcon,
  MegaphoneIcon,
  CogIcon,
  LightBulbIcon
} from '@heroicons/vue/24/outline'

export default {
  name: 'ScheduleModal',
  components: {
    XMarkIcon,
    ArrowTrendingUpIcon,
    ClockIcon,
    ChartBarIcon,
    MegaphoneIcon,
    CogIcon,
    LightBulbIcon,
    ExclamationTriangleIcon
  },
  props: {
    recommendation: {
      type: Object,
      required: true
    }
  },
  emits: ['close', 'submit'],
  setup(props, { emit }) {
    const submitting = ref(false)
    
    const form = ref({
      action_type: 'schedule',
      scheduled_date: '',
      priority: 'normal',
      notes: '',
      reminder_enabled: true,
      reminder_days: 3
    })

    const minDate = computed(() => {
      const tomorrow = new Date()
      tomorrow.setDate(tomorrow.getDate() + 1)
      return tomorrow.toISOString().split('T')[0]
    })

    const isFormValid = computed(() => {
      if (form.value.action_type === 'schedule') {
        return form.value.scheduled_date !== ''
      }
      return true
    })

    const closeModal = () => {
      emit('close')
    }

    const submitSchedule = async () => {
      if (!isFormValid.value) return

      submitting.value = true
      
      try {
        const scheduleData = {
          recommendation_id: props.recommendation.id,
          action_type: form.value.action_type,
          scheduled_date: form.value.action_type === 'schedule' ? form.value.scheduled_date : null,
          priority: form.value.priority,
          notes: form.value.notes.trim(),
          reminder_enabled: form.value.reminder_enabled,
          reminder_days: form.value.reminder_enabled ? form.value.reminder_days : null
        }

        emit('submit', scheduleData)
      } catch (error) {
        console.error('Erreur soumission planification:', error)
      } finally {
        submitting.value = false
      }
    }

    const getRecommendationIcon = (type) => {
      const icons = {
        'optimization': ChartBarIcon,
        'campaign': MegaphoneIcon,
        'technical': CogIcon,
        'strategy': LightBulbIcon,
        'alert': ExclamationTriangleIcon
      }
      return icons[type] || LightBulbIcon
    }

    const getEffortLabel = (level) => {
      const labels = {
        'low': 'Faible',
        'medium': 'Moyen',
        'high': 'Élevé'
      }
      return labels[level] || level
    }

    const getPriorityLabel = (priority) => {
      const labels = {
        'low': 'Faible',
        'normal': 'Normal',
        'high': 'Élevée'
      }
      return labels[priority] || priority
    }

    const formatDate = (dateString) => {
      if (!dateString) return ''
      const date = new Date(dateString)
      return date.toLocaleDateString('fr-FR', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      })
    }

    const getSubmitButtonText = () => {
      switch (form.value.action_type) {
        case 'schedule':
          return 'Planifier'
        case 'request_service':
          return 'Demander la prestation'
        case 'discuss':
          return 'Ouvrir la discussion'
        default:
          return 'Confirmer'
      }
    }

    return {
      form,
      submitting,
      minDate,
      isFormValid,
      closeModal,
      submitSchedule,
      getRecommendationIcon,
      getEffortLabel,
      getPriorityLabel,
      formatDate,
      getSubmitButtonText
    }
  }
}
</script>