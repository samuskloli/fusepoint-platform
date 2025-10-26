<template>
  <div class="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50" @click="closeModal">
    <div class="relative top-20 mx-auto p-5 border w-11/12 md:w-3/4 lg:w-1/2 shadow-lg rounded-md bg-white" @click.stop>
      <!-- Header -->
      <div class="flex items-center justify-between pb-4 border-b border-gray-200">
        <div>
          <h3 class="text-lg font-semibold text-gray-900">Demander une prestation</h3>
          <p class="text-sm text-gray-600 mt-1">{{ service.name }}</p>
        </div>
        <button @click="closeModal" class="text-gray-400 hover:text-gray-600">
          <XMarkIcon class="w-6 h-6" />
        </button>
      </div>

      <!-- Formulaire minimal -->
      <form @submit.prevent="submitRequest" class="mt-6">
        <!-- Description (optionnelle) -->
        <div class="mb-6">
          <label for="description" class="block text-sm font-medium text-gray-700 mb-2">
            Expliquez votre demande <span class="text-gray-400">(optionnel)</span>
          </label>
          <textarea
            id="description"
            v-model="form.description"
            rows="6"
            class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder="Décrivez brièvement votre besoin, vos objectifs ou tout contexte utile."
          ></textarea>
          <p class="mt-2 text-xs text-gray-500">
            Vous pouvez laisser ce champ vide si vous préférez préciser plus tard.
          </p>
        </div>

        <!-- Actions -->
        <div class="flex justify-end space-x-3 border-t border-gray-100 pt-4">
          <button
            type="button"
            @click="closeModal"
            class="px-4 py-2 border border-gray-300 text-gray-700 text-sm font-medium rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            Annuler
          </button>
          <button
            type="submit"
            :disabled="submitting"
            class="inline-flex items-center px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <svg v-if="submitting" class="-ml-1 mr-2 h-4 w-4 animate-spin" viewBox="0 0 24 24">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" fill="none"></circle>
              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"></path>
            </svg>
            Envoyer la demande
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<script>
import { ref } from 'vue'
import { XMarkIcon } from '@heroicons/vue/24/outline'

export default {
  name: 'ServiceRequestModal',
  components: {
    XMarkIcon
  },
  props: {
    service: {
      type: Object,
      required: true
    }
  },
  emits: ['close', 'submit'],
  setup(props, { emit }) {
    const submitting = ref(false)

    const form = ref({
      description: ''
    })

    const closeModal = () => {
      emit('close')
    }

    const submitRequest = async () => {
      try {
        submitting.value = true
        const requestData = {
          service_id: props.service.id,
          title: `Demande pour ${props.service.name}`,
          description: (form.value.description || '').trim()
        }
        emit('submit', requestData)
      } catch (error) {
        console.error('Erreur soumission formulaire:', error)
      } finally {
        submitting.value = false
      }
    }

    return {
      form,
      submitting,
      closeModal,
      submitRequest
    }
  }
}
</script>

<style scoped>
</style>