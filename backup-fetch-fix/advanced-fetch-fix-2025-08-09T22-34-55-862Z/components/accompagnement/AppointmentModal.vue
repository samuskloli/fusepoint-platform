<template>
  <div class="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50" @click="closeModal">
    <div class="relative top-20 mx-auto p-5 border w-11/12 md:w-3/4 lg:w-1/2 shadow-lg rounded-md bg-white" @click.stop>
      <!-- Header -->
      <div class="flex items-center justify-between pb-4 border-b border-gray-200">
        <div>
          <h3 class="text-lg font-semibold text-gray-900">Planifier un rendez-vous</h3>
          <p class="text-sm text-gray-600 mt-1">Réservez un créneau avec l'équipe Fusepoint</p>
        </div>
        <button @click="closeModal" class="text-gray-400 hover:text-gray-600">
          <XMarkIcon class="w-6 h-6" />
        </button>
      </div>

      <!-- Formulaire -->
      <form @submit.prevent="submitForm" class="mt-6">
        <!-- Type de rendez-vous -->
        <div class="mb-6">
          <label class="block text-sm font-medium text-gray-700 mb-3">
            Type de rendez-vous
          </label>
          <div class="space-y-3">
            <label class="flex items-start">
              <input
                v-model="form.type"
                type="radio"
                value="consultation"
                class="mt-1 mr-3 text-blue-600 focus:ring-blue-500"
              />
              <div>
                <div class="text-sm font-medium text-gray-900">Consultation stratégique</div>
                <div class="text-sm text-gray-500">Discussion sur votre stratégie marketing</div>
              </div>
            </label>
            <label class="flex items-start">
              <input
                v-model="form.type"
                type="radio"
                value="formation"
                class="mt-1 mr-3 text-blue-600 focus:ring-blue-500"
              />
              <div>
                <div class="text-sm font-medium text-gray-900">Formation</div>
                <div class="text-sm text-gray-500">Session de formation personnalisée</div>
              </div>
            </label>
            <label class="flex items-start">
              <input
                v-model="form.type"
                type="radio"
                value="support"
                class="mt-1 mr-3 text-blue-600 focus:ring-blue-500"
              />
              <div>
                <div class="text-sm font-medium text-gray-900">Support technique</div>
                <div class="text-sm text-gray-500">Aide technique sur vos outils</div>
              </div>
            </label>
            <label class="flex items-start">
              <input
                v-model="form.type"
                type="radio"
                value="audit"
                class="mt-1 mr-3 text-blue-600 focus:ring-blue-500"
              />
              <div>
                <div class="text-sm font-medium text-gray-900">Audit en direct</div>
                <div class="text-sm text-gray-500">Analyse en temps réel de vos données</div>
              </div>
            </label>
          </div>
        </div>

        <!-- Titre -->
        <div class="mb-4">
          <label for="title" class="block text-sm font-medium text-gray-700 mb-2">
            Titre du rendez-vous
          </label>
          <input
            id="title"
            v-model="form.title"
            type="text"
            required
            class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder="Ex: Consultation stratégie Q1 2024"
          />
        </div>

        <!-- Description -->
        <div class="mb-4">
          <label for="description" class="block text-sm font-medium text-gray-700 mb-2">
            Description (optionnel)
          </label>
          <textarea
            id="description"
            v-model="form.description"
            rows="3"
            class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder="Décrivez brièvement l'objectif de ce rendez-vous..."
          ></textarea>
        </div>

        <!-- Date et heure -->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div>
            <label for="date" class="block text-sm font-medium text-gray-700 mb-2">
              Date souhaitée
            </label>
            <input
              id="date"
              v-model="form.date"
              type="date"
              required
              class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              :min="minDate"
            />
          </div>
          <div>
            <label for="time" class="block text-sm font-medium text-gray-700 mb-2">
              Heure préférée
            </label>
            <select
              id="time"
              v-model="form.time"
              class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">Flexible</option>
              <option value="09:00">09:00</option>
              <option value="10:00">10:00</option>
              <option value="11:00">11:00</option>
              <option value="14:00">14:00</option>
              <option value="15:00">15:00</option>
              <option value="16:00">16:00</option>
              <option value="17:00">17:00</option>
            </select>
          </div>
        </div>

        <!-- Durée -->
        <div class="mb-4">
          <label for="duration" class="block text-sm font-medium text-gray-700 mb-2">
            Durée estimée
          </label>
          <select
            id="duration"
            v-model="form.duration"
            class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="30min">30 minutes</option>
            <option value="1h00">1 heure</option>
            <option value="1h30">1h30</option>
            <option value="2h00">2 heures</option>
            <option value="3h00">3 heures</option>
          </select>
        </div>

        <!-- Priorité -->
        <div class="mb-6">
          <label class="block text-sm font-medium text-gray-700 mb-3">
            Priorité
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
              <span class="text-sm text-gray-700">Urgent</span>
            </label>
          </div>
        </div>

        <!-- Résumé -->
        <div v-if="isFormValid" class="bg-gray-50 border border-gray-200 rounded-lg p-4 mb-6">
          <h4 class="text-sm font-medium text-gray-900 mb-2">Résumé de votre demande</h4>
          <div class="text-sm text-gray-600 space-y-1">
            <p><strong>Type:</strong> {{ getTypeLabel(form.type) }}</p>
            <p><strong>Titre:</strong> {{ form.title }}</p>
            <p><strong>Date:</strong> {{ formatDate(form.date) }}</p>
            <p v-if="form.time"><strong>Heure:</strong> {{ form.time }}</p>
            <p><strong>Durée:</strong> {{ form.duration }}</p>
            <p><strong>Priorité:</strong> {{ getPriorityLabel(form.priority) }}</p>
          </div>
        </div>

        <!-- Actions -->
        <div class="flex justify-end space-x-3">
          <button
            type="button"
            @click="closeModal"
            class="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            Annuler
          </button>
          <button
            type="submit"
            :disabled="!isFormValid || loading"
            class="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <span v-if="loading" class="flex items-center">
              <svg class="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Envoi en cours...
            </span>
            <span v-else>Planifier le rendez-vous</span>
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<script>
import { ref, computed } from 'vue'
import { XMarkIcon } from '@heroicons/vue/24/outline'
import axios from 'axios'

export default {
  name: 'AppointmentModal',
  components: {
    XMarkIcon
  },
  emits: ['close', 'scheduled'],
  setup(props, { emit }) {
    const loading = ref(false)
    const form = ref({
      type: 'consultation',
      title: '',
      description: '',
      date: '',
      time: '',
      duration: '1h00',
      priority: 'normal'
    })

    const minDate = computed(() => {
      const tomorrow = new Date()
      tomorrow.setDate(tomorrow.getDate() + 1)
      return tomorrow.toISOString().split('T')[0]
    })

    const isFormValid = computed(() => {
      return form.value.title.trim() !== '' && form.value.date !== ''
    })

    const closeModal = () => {
      emit('close')
    }

    const getTypeLabel = (type) => {
      const labels = {
        'consultation': 'Consultation stratégique',
        'formation': 'Formation',
        'support': 'Support technique',
        'audit': 'Audit en direct'
      }
      return labels[type] || type
    }

    const getPriorityLabel = (priority) => {
      const labels = {
        'low': 'Faible',
        'normal': 'Normal',
        'high': 'Urgent'
      }
      return labels[priority] || priority
    }

    const formatDate = (dateString) => {
      if (!dateString) return ''
      return new Date(dateString).toLocaleDateString('fr-FR', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      })
    }

    const submitForm = async () => {
      if (!isFormValid.value || loading.value) return

      loading.value = true
      try {
        const appointmentData = {
          title: form.value.title,
          description: form.value.description,
          date: form.value.date + (form.value.time ? `T${form.value.time}:00` : ''),
          duration: form.value.duration,
          type: form.value.type,
          priority: form.value.priority
        }

        const response = await axios.post('/api/accompagnement/appointments', appointmentData)
        
        if (response.data.success) {
          emit('scheduled', response.data.data)
          closeModal()
        }
      } catch (error) {
        console.error('Erreur lors de la planification:', error)
        // TODO: Afficher un message d'erreur à l'utilisateur
      } finally {
        loading.value = false
      }
    }

    return {
      loading,
      form,
      minDate,
      isFormValid,
      closeModal,
      getTypeLabel,
      getPriorityLabel,
      formatDate,
      submitForm
    }
  }
}
</script>

<style scoped>
/* Styles spécifiques au modal */
</style>