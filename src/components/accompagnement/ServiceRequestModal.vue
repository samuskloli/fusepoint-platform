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

      <!-- Formulaire -->
      <form @submit.prevent="submitRequest" class="mt-6">
        <!-- Titre de la demande -->
        <div class="mb-6">
          <label for="title" class="block text-sm font-medium text-gray-700 mb-2">
            Titre de votre demande *
          </label>
          <input
            id="title"
            v-model="form.title"
            type="text"
            required
            class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder="Ex: Audit SEO pour mon site e-commerce"
          />
        </div>

        <!-- Description -->
        <div class="mb-6">
          <label for="description" class="block text-sm font-medium text-gray-700 mb-2">
            Description de votre besoin
          </label>
          <textarea
            id="description"
            v-model="form.description"
            rows="4"
            class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder="Décrivez votre projet, vos objectifs et vos attentes..."
          ></textarea>
        </div>

        <!-- Brief détaillé -->
        <div class="mb-6">
          <h4 class="text-sm font-medium text-gray-700 mb-3">Informations complémentaires</h4>
          
          <!-- Objectifs -->
          <div class="mb-4">
            <label for="objectives" class="block text-sm text-gray-600 mb-1">
              Quels sont vos objectifs principaux ?
            </label>
            <textarea
              id="objectives"
              v-model="form.brief_data.objectives"
              rows="2"
              class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Ex: Augmenter le trafic organique, améliorer le taux de conversion..."
            ></textarea>
          </div>

          <!-- Cible -->
          <div class="mb-4">
            <label for="target" class="block text-sm text-gray-600 mb-1">
              Qui est votre cible ?
            </label>
            <input
              id="target"
              v-model="form.brief_data.target"
              type="text"
              class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Ex: Femmes 25-45 ans intéressées par la mode"
            />
          </div>

          <!-- Contraintes -->
          <div class="mb-4">
            <label for="constraints" class="block text-sm text-gray-600 mb-1">
              Y a-t-il des contraintes particulières ?
            </label>
            <textarea
              id="constraints"
              v-model="form.brief_data.constraints"
              rows="2"
              class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Ex: Respect de la charte graphique, délais serrés..."
            ></textarea>
          </div>

          <!-- Références -->
          <div class="mb-4">
            <label for="references" class="block text-sm text-gray-600 mb-1">
              Avez-vous des références ou exemples à partager ?
            </label>
            <textarea
              id="references"
              v-model="form.brief_data.references"
              rows="2"
              class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="URLs, documents, exemples de concurrents..."
            ></textarea>
          </div>
        </div>

        <!-- Budget -->
        <div class="mb-6">
          <label for="budget" class="block text-sm font-medium text-gray-700 mb-2">
            Budget envisagé
          </label>
          <select
            id="budget"
            v-model="form.budget_range"
            class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="">Sélectionnez une fourchette</option>
            <option value="0-500">{{ $formatCurrency(0) }} - {{ $formatCurrency(500) }}</option>
                <option value="500-1000">{{ $formatCurrency(500) }} - {{ $formatCurrency(1000) }}</option>
                <option value="1000-2000">{{ $formatCurrency(1000) }} - {{ $formatCurrency(2000) }}</option>
                <option value="2000-5000">{{ $formatCurrency(2000) }} - {{ $formatCurrency(5000) }}</option>
                <option value="5000+">Plus de {{ $formatCurrency(5000) }}</option>
            <option value="custom">Budget personnalisé</option>
          </select>
        </div>

        <!-- Échéance -->
        <div class="mb-6">
          <label for="deadline" class="block text-sm font-medium text-gray-700 mb-2">
            Échéance souhaitée
          </label>
          <input
            id="deadline"
            v-model="form.deadline"
            type="date"
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
            <label class="flex items-center">
              <input
                v-model="form.priority"
                type="radio"
                value="urgent"
                class="mr-2 text-blue-600 focus:ring-blue-500"
              />
              <span class="text-sm text-gray-700">Urgente</span>
            </label>
          </div>
        </div>

        <!-- Récapitulatif du service -->
        <div class="mb-6 p-4 bg-gray-50 rounded-lg">
          <h4 class="text-sm font-medium text-gray-900 mb-2">Récapitulatif de la prestation</h4>
          <div class="space-y-2 text-sm">
            <div class="flex justify-between">
              <span class="text-gray-600">Service:</span>
              <span class="font-medium">{{ service.name }}</span>
            </div>
            <div class="flex justify-between">
              <span class="text-gray-600">Prix de base:</span>
              <span class="font-medium">{{ formatPrice(service.base_price, service.price_type) }}</span>
            </div>
            <div class="flex justify-between">
              <span class="text-gray-600">Durée estimée:</span>
              <span class="font-medium">{{ service.duration_estimate }}</span>
            </div>
          </div>
          
          <div class="mt-3">
            <p class="text-xs text-gray-500">
              * Le prix final sera ajusté selon vos besoins spécifiques et confirmé avant le début des travaux.
            </p>
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
            :disabled="submitting || !form.title"
            class="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <span v-if="submitting" class="flex items-center">
              <svg class="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Envoi en cours...
            </span>
            <span v-else>Envoyer la demande</span>
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<script>
import { ref, computed, onMounted } from 'vue'
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
      title: '',
      description: '',
      brief_data: {
        objectives: '',
        target: '',
        constraints: '',
        references: ''
      },
      budget_range: '',
      deadline: '',
      priority: 'normal'
    })

    const minDate = computed(() => {
      const tomorrow = new Date()
      tomorrow.setDate(tomorrow.getDate() + 1)
      return tomorrow.toISOString().split('T')[0]
    })

    const closeModal = () => {
      emit('close')
    }

    const submitRequest = async () => {
      if (!form.value.title.trim()) {
        return
      }

      submitting.value = true
      
      try {
        const requestData = {
          service_id: props.service.id,
          title: form.value.title.trim(),
          description: form.value.description.trim(),
          brief_data: form.value.brief_data,
          budget_range: form.value.budget_range,
          deadline: form.value.deadline || null,
          priority: form.value.priority
        }

        emit('submit', requestData)
      } catch (error) {
        console.error('Erreur soumission formulaire:', error)
      } finally {
        submitting.value = false
      }
    }

    const formatPrice = (price, priceType) => {
      if (priceType === 'custom') return 'Sur devis'
      if (!price) return `À partir de ${this.$formatCurrency(0)}`
      const suffix = priceType === 'hourly' ? `${this.$getCurrencySymbol()}/h` : ''
      return `${this.$formatCurrency(price)}${suffix}`
    }

    // Pré-remplir le titre avec le nom du service
    onMounted(() => {
      form.value.title = `Demande: ${props.service.name}`
    })

    return {
      form,
      submitting,
      minDate,
      closeModal,
      submitRequest,
      formatPrice
    }
  }
}
</script>