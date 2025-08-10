<template>
  <div class="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50" @click="closeModal">
    <div class="relative top-20 mx-auto p-5 border w-11/12 md:w-2/3 lg:w-1/2 shadow-lg rounded-md bg-white" @click.stop>
      <div class="flex items-center justify-between mb-4">
        <h3 class="text-lg font-medium text-gray-900">Créer un événement</h3>
        <button @click="closeModal" class="text-gray-400 hover:text-gray-600">
          <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
          </svg>
        </button>
      </div>

      <form @submit.prevent="createEvent">
        <div class="space-y-4">
          <!-- Titre -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">
              Titre de l'événement *
            </label>
            <input
              type="text"
              v-model="form.title"
              required
              class="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              placeholder="Nom de l'événement"
            >
          </div>

          <!-- Description -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">
              Description
            </label>
            <textarea
              v-model="form.description"
              rows="3"
              class="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              placeholder="Description de l'événement"
            ></textarea>
          </div>

          <!-- Type d'événement -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">
              Type d'événement
            </label>
            <select
              v-model="form.type"
              class="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            >
              <option value="meeting">Réunion</option>
              <option value="deadline">Échéance</option>
              <option value="milestone">Jalon</option>
              <option value="review">Révision</option>
              <option value="presentation">Présentation</option>
              <option value="other">Autre</option>
            </select>
          </div>

          <!-- Dates et heures -->
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">
                Date de début *
              </label>
              <input
                type="datetime-local"
                v-model="form.start_date"
                required
                class="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              >
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">
                Date de fin
              </label>
              <input
                type="datetime-local"
                v-model="form.end_date"
                class="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              >
            </div>
          </div>

          <!-- Événement toute la journée -->
          <div>
            <label class="flex items-center">
              <input
                type="checkbox"
                v-model="form.all_day"
                class="rounded border-gray-300 text-blue-600 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
              >
              <span class="ml-2 text-sm text-gray-700">Événement toute la journée</span>
            </label>
          </div>

          <!-- Lieu -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">
              Lieu
            </label>
            <input
              type="text"
              v-model="form.location"
              class="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              placeholder="Lieu de l'événement"
            >
          </div>

          <!-- Participants -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">
              Participants
            </label>
            <div class="space-y-2">
              <div v-for="(participant, index) in form.participants" :key="index" class="flex items-center space-x-2">
                <input
                  type="email"
                  v-model="form.participants[index]"
                  class="flex-1 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  placeholder="Email du participant"
                >
                <button
                  type="button"
                  @click="removeParticipant(index)"
                  class="text-red-600 hover:text-red-800"
                >
                  <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
                  </svg>
                </button>
              </div>
              <button
                type="button"
                @click="addParticipant"
                class="text-blue-600 hover:text-blue-800 text-sm"
              >
                + Ajouter un participant
              </button>
            </div>
          </div>

          <!-- Rappel -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">
              Rappel
            </label>
            <select
              v-model="form.reminder"
              class="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            >
              <option value="">Aucun rappel</option>
              <option value="5">5 minutes avant</option>
              <option value="15">15 minutes avant</option>
              <option value="30">30 minutes avant</option>
              <option value="60">1 heure avant</option>
              <option value="1440">1 jour avant</option>
            </select>
          </div>

          <!-- Priorité -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">
              Priorité
            </label>
            <select
              v-model="form.priority"
              class="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            >
              <option value="low">Faible</option>
              <option value="medium">Moyenne</option>
              <option value="high">Élevée</option>
              <option value="urgent">Urgente</option>
            </select>
          </div>

          <!-- Couleur -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">
              Couleur
            </label>
            <div class="flex space-x-2">
              <button
                v-for="color in colors"
                :key="color.value"
                type="button"
                @click="form.color = color.value"
                :class="[
                  'w-8 h-8 rounded-full border-2',
                  form.color === color.value ? 'border-gray-800' : 'border-gray-300'
                ]"
                :style="{ backgroundColor: color.hex }"
                :title="color.name"
              ></button>
            </div>
          </div>
        </div>

        <div class="flex justify-end space-x-3 mt-6">
          <button
            type="button"
            @click="closeModal"
            class="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 border border-gray-300 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
          >
            Annuler
          </button>
          <button
            type="submit"
            :disabled="loading"
            class="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
          >
            <span v-if="loading">Création...</span>
            <span v-else>Créer l'événement</span>
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<script>
import { ref, reactive } from 'vue'
import { projectManagementService } from '@/services/projectManagementService'

export default {
  name: 'CreateEventModal',
  props: {
    projectId: {
      type: [String, Number],
      required: true
    },
    selectedDate: {
      type: String,
      default: null
    }
  },
  emits: ['close', 'created'],
  setup(props, { emit }) {
    const loading = ref(false)
    
    const form = reactive({
      title: '',
      description: '',
      type: 'meeting',
      start_date: props.selectedDate || '',
      end_date: '',
      all_day: false,
      location: '',
      participants: [''],
      reminder: '',
      priority: 'medium',
      color: 'blue'
    })

    const colors = [
      { name: 'Bleu', value: 'blue', hex: '#3B82F6' },
      { name: 'Vert', value: 'green', hex: '#10B981' },
      { name: 'Rouge', value: 'red', hex: '#EF4444' },
      { name: 'Jaune', value: 'yellow', hex: '#F59E0B' },
      { name: 'Violet', value: 'purple', hex: '#8B5CF6' },
      { name: 'Rose', value: 'pink', hex: '#EC4899' },
      { name: 'Indigo', value: 'indigo', hex: '#6366F1' },
      { name: 'Gris', value: 'gray', hex: '#6B7280' }
    ]

    const addParticipant = () => {
      form.participants.push('')
    }

    const removeParticipant = (index) => {
      if (form.participants.length > 1) {
        form.participants.splice(index, 1)
      }
    }

    const createEvent = async () => {
      loading.value = true
      try {
        const eventData = {
          ...form,
          participants: form.participants.filter(p => p.trim() !== ''),
          project_id: props.projectId
        }
        
        const response = await projectManagementService.createEvent(props.projectId, eventData)
        if (response.success) {
          emit('created', response.data)
          closeModal()
        } else {
          alert('Erreur lors de la création de l\'événement')
        }
      } catch (error) {
        console.error('Erreur:', error)
        alert('Erreur lors de la création de l\'événement')
      } finally {
        loading.value = false
      }
    }

    const closeModal = () => {
      emit('close')
    }

    return {
      loading,
      form,
      colors,
      addParticipant,
      removeParticipant,
      createEvent,
      closeModal
    }
  }
}
</script>