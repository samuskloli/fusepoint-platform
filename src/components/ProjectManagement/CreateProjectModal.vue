<template>
  <div class="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50" @click="closeModal">
    <div class="relative top-20 mx-auto p-5 border w-11/12 md:w-3/4 lg:w-1/2 shadow-lg rounded-md bg-white" @click.stop>
      <!-- En-tête -->
      <div class="flex items-center justify-between pb-4 border-b border-gray-200">
        <h3 class="text-lg font-semibold text-gray-900">Créer un nouveau projet</h3>
        <button @click="closeModal" class="text-gray-400 hover:text-gray-600 transition-colors">
          <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
          </svg>
        </button>
      </div>

      <!-- Formulaire -->
      <form @submit.prevent="submitForm" class="mt-6">
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <!-- Titre du projet -->
          <div class="md:col-span-2">
            <label for="title" class="block text-sm font-medium text-gray-700 mb-2">
              Titre du projet *
            </label>
            <input
              id="title"
              v-model="form.title"
              type="text"
              required
              class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Entrez le titre du projet"
            >
            <p v-if="errors.title" class="mt-1 text-sm text-red-600">{{ errors.title }}</p>
          </div>

          <!-- Description -->
          <div class="md:col-span-2">
            <label for="description" class="block text-sm font-medium text-gray-700 mb-2">
              Description
            </label>
            <textarea
              id="description"
              v-model="form.description"
              rows="3"
              class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Décrivez le projet en détail"
            ></textarea>
          </div>

          <!-- Statut -->
          <div>
            <label for="status" class="block text-sm font-medium text-gray-700 mb-2">
              Statut *
            </label>
            <select
              id="status"
              v-model="form.status"
              required
              class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="planning">Planification</option>
              <option value="in_progress">En cours</option>
              <option value="review">En révision</option>
              <option value="completed">Terminé</option>
              <option value="on_hold">En pause</option>
            </select>
          </div>

          <!-- Priorité -->
          <div>
            <label for="priority" class="block text-sm font-medium text-gray-700 mb-2">
              Priorité *
            </label>
            <select
              id="priority"
              v-model="form.priority"
              required
              class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="low">Basse</option>
              <option value="medium">Moyenne</option>
              <option value="high">Haute</option>
              <option value="urgent">Urgente</option>
            </select>
          </div>

          <!-- Date de début -->
          <div>
            <label for="start_date" class="block text-sm font-medium text-gray-700 mb-2">
              Date de début *
            </label>
            <input
              id="start_date"
              v-model="form.start_date"
              type="date"
              required
              class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
            <p v-if="errors.start_date" class="mt-1 text-sm text-red-600">{{ errors.start_date }}</p>
          </div>

          <!-- Date de fin -->
          <div>
            <label for="end_date" class="block text-sm font-medium text-gray-700 mb-2">
              Date de fin *
            </label>
            <input
              id="end_date"
              v-model="form.end_date"
              type="date"
              required
              class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
            <p v-if="errors.end_date" class="mt-1 text-sm text-red-600">{{ errors.end_date }}</p>
          </div>

          <!-- Budget -->
          <div>
            <label for="budget" class="block text-sm font-medium text-gray-700 mb-2">
              Budget (CHF)
            </label>
            <input
              id="budget"
              v-model.number="form.budget"
              type="number"
              min="0"
              step="0.01"
              class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="0.00"
            >
          </div>

          <!-- Progrès initial -->
          <div>
            <label for="progress" class="block text-sm font-medium text-gray-700 mb-2">
              Progrès initial (%)
            </label>
            <input
              id="progress"
              v-model.number="form.progress"
              type="number"
              min="0"
              max="100"
              class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="0"
            >
          </div>

          <!-- Catégorie -->
          <div>
            <label for="category" class="block text-sm font-medium text-gray-700 mb-2">
              Catégorie
            </label>
            <select
              id="category"
              v-model="form.category"
              class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">Sélectionner une catégorie</option>
              <option value="web_development">Développement Web</option>
              <option value="mobile_development">Développement Mobile</option>
              <option value="design">Design</option>
              <option value="marketing">Marketing</option>
              <option value="seo">SEO</option>
              <option value="content">Contenu</option>
              <option value="consulting">Conseil</option>
              <option value="maintenance">Maintenance</option>
              <option value="other">Autre</option>
            </select>
          </div>

          <!-- Tags -->
          <div>
            <label for="tags" class="block text-sm font-medium text-gray-700 mb-2">
              Tags (séparés par des virgules)
            </label>
            <input
              id="tags"
              v-model="form.tags"
              type="text"
              class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="urgent, design, responsive"
            >
          </div>

          <!-- Objectifs -->
          <div class="md:col-span-2">
            <label for="objectives" class="block text-sm font-medium text-gray-700 mb-2">
              Objectifs du projet
            </label>
            <textarea
              id="objectives"
              v-model="form.objectives"
              rows="3"
              class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Définissez les objectifs principaux du projet"
            ></textarea>
          </div>

          <!-- Livrables -->
          <div class="md:col-span-2">
            <label for="deliverables" class="block text-sm font-medium text-gray-700 mb-2">
              Livrables attendus
            </label>
            <textarea
              id="deliverables"
              v-model="form.deliverables"
              rows="3"
              class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Listez les livrables attendus"
            ></textarea>
          </div>

          <!-- Risques -->
          <div class="md:col-span-2">
            <label for="risks" class="block text-sm font-medium text-gray-700 mb-2">
              Risques identifiés
            </label>
            <textarea
              id="risks"
              v-model="form.risks"
              rows="2"
              class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Identifiez les risques potentiels"
            ></textarea>
          </div>
        </div>

        <!-- Options avancées -->
        <div class="mt-6">
          <button
            type="button"
            @click="showAdvanced = !showAdvanced"
            class="flex items-center text-sm text-blue-600 hover:text-blue-800 transition-colors"
          >
            <svg 
              class="w-4 h-4 mr-1 transition-transform" 
              :class="{ 'rotate-90': showAdvanced }"
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"></path>
            </svg>
            Options avancées
          </button>

          <div v-if="showAdvanced" class="mt-4 p-4 bg-gray-50 rounded-lg">
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <!-- Notifications -->
              <div>
                <label class="flex items-center">
                  <input
                    v-model="form.notifications_enabled"
                    type="checkbox"
                    class="rounded border-gray-300 text-blue-600 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
                  >
                  <span class="ml-2 text-sm text-gray-700">Activer les notifications</span>
                </label>
              </div>

              <!-- Projet public -->
              <div>
                <label class="flex items-center">
                  <input
                    v-model="form.is_public"
                    type="checkbox"
                    class="rounded border-gray-300 text-blue-600 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
                  >
                  <span class="ml-2 text-sm text-gray-700">Projet visible par l'équipe</span>
                </label>
              </div>

              <!-- Template -->
              <div>
                <label class="flex items-center">
                  <input
                    v-model="form.save_as_template"
                    type="checkbox"
                    class="rounded border-gray-300 text-blue-600 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
                  >
                  <span class="ml-2 text-sm text-gray-700">Sauvegarder comme modèle</span>
                </label>
              </div>

              <!-- Auto-assignation -->
              <div>
                <label class="flex items-center">
                  <input
                    v-model="form.auto_assign"
                    type="checkbox"
                    class="rounded border-gray-300 text-blue-600 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
                  >
                  <span class="ml-2 text-sm text-gray-700">M'assigner automatiquement</span>
                </label>
              </div>
            </div>
          </div>
        </div>

        <!-- Boutons d'action -->
        <div class="flex items-center justify-end space-x-4 mt-8 pt-6 border-t border-gray-200">
          <button
            type="button"
            @click="closeModal"
            class="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 border border-gray-300 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 transition-colors"
          >
            Annuler
          </button>
          <button
            type="submit"
            :disabled="loading"
            class="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <svg v-if="loading" class="animate-spin -ml-1 mr-2 h-4 w-4 text-white inline" fill="none" viewBox="0 0 24 24">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            {{ loading ? 'Création...' : 'Créer le projet' }}
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<script>
import { ref, reactive } from 'vue'

export default {
  name: 'CreateProjectModal',
  emits: ['close', 'create'],
  setup(props, { emit }) {
    const loading = ref(false)
    const showAdvanced = ref(false)
    const errors = ref({})

    const form = reactive({
      title: '',
      description: '',
      status: 'planning',
      priority: 'medium',
      start_date: new Date().toISOString().split('T')[0],
      end_date: '',
      budget: null,
      progress: 0,
      category: '',
      tags: '',
      objectives: '',
      deliverables: '',
      risks: '',
      notifications_enabled: true,
      is_public: false,
      save_as_template: false,
      auto_assign: true
    })

    const closeModal = () => {
      emit('close')
    }

    const validateForm = () => {
      errors.value = {}

      if (!form.title.trim()) {
        errors.value.title = 'Le titre est requis'
      }

      if (!form.start_date) {
        errors.value.start_date = 'La date de début est requise'
      }

      if (!form.end_date) {
        errors.value.end_date = 'La date de fin est requise'
      }

      if (form.start_date && form.end_date && new Date(form.start_date) >= new Date(form.end_date)) {
        errors.value.end_date = 'La date de fin doit être postérieure à la date de début'
      }

      return Object.keys(errors.value).length === 0
    }

    const submitForm = async () => {
      if (!validateForm()) {
        return
      }

      loading.value = true

      try {
        // Préparer les données
        const projectData = {
          ...form,
          tags: form.tags ? form.tags.split(',').map(tag => tag.trim()).filter(tag => tag) : [],
          budget: form.budget || 0,
          progress: form.progress || 0
        }

        emit('create', projectData)
      } catch (error) {
        console.error('Erreur lors de la création du projet:', error)
      } finally {
        loading.value = false
      }
    }

    return {
      form,
      loading,
      showAdvanced,
      errors,
      closeModal,
      submitForm
    }
  }
}
</script>

<style scoped>
.rotate-90 {
  transform: rotate(90deg);
}
</style>