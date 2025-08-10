<template>
  <div class="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50" @click="closeModal">
    <div class="relative top-20 mx-auto p-5 border w-11/12 md:w-3/4 lg:w-1/2 shadow-lg rounded-md bg-white" @click.stop>
      <!-- En-tête -->
      <div class="flex items-center justify-between pb-4 border-b border-gray-200">
        <h3 class="text-lg font-semibold text-gray-900">
          {{ task ? 'Modifier la tâche' : 'Créer une nouvelle tâche' }}
        </h3>
        <button @click="closeModal" class="text-gray-400 hover:text-gray-600 transition-colors">
          <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
          </svg>
        </button>
      </div>

      <!-- Formulaire -->
      <form @submit.prevent="submitForm" class="mt-6">
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <!-- Titre de la tâche -->
          <div class="md:col-span-2">
            <label for="title" class="block text-sm font-medium text-gray-700 mb-2">
              Titre de la tâche *
            </label>
            <input
              id="title"
              v-model="form.title"
              type="text"
              required
              class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Entrez le titre de la tâche"
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
              placeholder="Décrivez la tâche en détail"
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
              <option value="todo">À faire</option>
              <option value="in_progress">En cours</option>
              <option value="review">En révision</option>
              <option value="completed">Terminée</option>
              <option value="blocked">Bloquée</option>
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

          <!-- Assigné à -->
          <div>
            <label for="assignee" class="block text-sm font-medium text-gray-700 mb-2">
              Assigné à
            </label>
            <select
              id="assignee"
              v-model="form.assignee_id"
              class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">Non assigné</option>
              <option v-for="member in teamMembers" :key="member.id" :value="member.id">
                {{ member.name }} ({{ member.role }})
              </option>
            </select>
          </div>

          <!-- Type de tâche -->
          <div>
            <label for="type" class="block text-sm font-medium text-gray-700 mb-2">
              Type de tâche
            </label>
            <select
              id="type"
              v-model="form.type"
              class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="task">Tâche</option>
              <option value="bug">Bug</option>
              <option value="feature">Fonctionnalité</option>
              <option value="improvement">Amélioration</option>
              <option value="research">Recherche</option>
              <option value="documentation">Documentation</option>
              <option value="testing">Test</option>
              <option value="deployment">Déploiement</option>
            </select>
          </div>

          <!-- Date de début -->
          <div>
            <label for="start_date" class="block text-sm font-medium text-gray-700 mb-2">
              Date de début
            </label>
            <input
              id="start_date"
              v-model="form.start_date"
              type="date"
              class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
          </div>

          <!-- Date d'échéance -->
          <div>
            <label for="due_date" class="block text-sm font-medium text-gray-700 mb-2">
              Date d'échéance
            </label>
            <input
              id="due_date"
              v-model="form.due_date"
              type="date"
              class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
            <p v-if="errors.due_date" class="mt-1 text-sm text-red-600">{{ errors.due_date }}</p>
          </div>

          <!-- Estimation (heures) -->
          <div>
            <label for="estimated_hours" class="block text-sm font-medium text-gray-700 mb-2">
              Estimation (heures)
            </label>
            <input
              id="estimated_hours"
              v-model.number="form.estimated_hours"
              type="number"
              min="0"
              step="0.5"
              class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="0"
            >
          </div>

          <!-- Progrès -->
          <div>
            <label for="progress" class="block text-sm font-medium text-gray-700 mb-2">
              Progrès (%) - {{ form.progress }}%
            </label>
            <input
              id="progress"
              v-model.number="form.progress"
              type="range"
              min="0"
              max="100"
              step="5"
              class="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
            >
            <div class="flex justify-between text-xs text-gray-500 mt-1">
              <span>0%</span>
              <span>50%</span>
              <span>100%</span>
            </div>
          </div>

          <!-- Tags -->
          <div class="md:col-span-2">
            <label for="tags" class="block text-sm font-medium text-gray-700 mb-2">
              Tags (séparés par des virgules)
            </label>
            <input
              id="tags"
              v-model="form.tags"
              type="text"
              class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="frontend, urgent, design"
            >
          </div>

          <!-- Dépendances -->
          <div class="md:col-span-2">
            <label for="dependencies" class="block text-sm font-medium text-gray-700 mb-2">
              Dépendances (IDs des tâches séparés par des virgules)
            </label>
            <input
              id="dependencies"
              v-model="form.dependencies"
              type="text"
              class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="1, 5, 12"
            >
            <p class="mt-1 text-xs text-gray-500">
              Cette tâche ne peut commencer qu'après la completion des tâches listées
            </p>
          </div>

          <!-- Critères d'acceptation -->
          <div class="md:col-span-2">
            <label for="acceptance_criteria" class="block text-sm font-medium text-gray-700 mb-2">
              Critères d'acceptation
            </label>
            <textarea
              id="acceptance_criteria"
              v-model="form.acceptance_criteria"
              rows="3"
              class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="- Le bouton doit être cliquable\n- La validation doit fonctionner\n- Les erreurs doivent s'afficher"
            ></textarea>
          </div>

          <!-- Notes -->
          <div class="md:col-span-2">
            <label for="notes" class="block text-sm font-medium text-gray-700 mb-2">
              Notes additionnelles
            </label>
            <textarea
              id="notes"
              v-model="form.notes"
              rows="2"
              class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Notes, commentaires ou informations supplémentaires"
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
              <!-- Récurrente -->
              <div>
                <label class="flex items-center">
                  <input
                    v-model="form.is_recurring"
                    type="checkbox"
                    class="rounded border-gray-300 text-blue-600 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
                  >
                  <span class="ml-2 text-sm text-gray-700">Tâche récurrente</span>
                </label>
              </div>

              <!-- Critique -->
              <div>
                <label class="flex items-center">
                  <input
                    v-model="form.is_critical"
                    type="checkbox"
                    class="rounded border-gray-300 text-blue-600 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
                  >
                  <span class="ml-2 text-sm text-gray-700">Tâche critique</span>
                </label>
              </div>

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

              <!-- Temps de travail -->
              <div>
                <label class="flex items-center">
                  <input
                    v-model="form.track_time"
                    type="checkbox"
                    class="rounded border-gray-300 text-blue-600 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
                  >
                  <span class="ml-2 text-sm text-gray-700">Suivre le temps de travail</span>
                </label>
              </div>
            </div>

            <!-- Récurrence (si activée) -->
            <div v-if="form.is_recurring" class="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label for="recurrence_pattern" class="block text-sm font-medium text-gray-700 mb-1">
                  Fréquence
                </label>
                <select
                  id="recurrence_pattern"
                  v-model="form.recurrence_pattern"
                  class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="daily">Quotidienne</option>
                  <option value="weekly">Hebdomadaire</option>
                  <option value="monthly">Mensuelle</option>
                  <option value="yearly">Annuelle</option>
                </select>
              </div>
              <div>
                <label for="recurrence_end" class="block text-sm font-medium text-gray-700 mb-1">
                  Fin de récurrence
                </label>
                <input
                  id="recurrence_end"
                  v-model="form.recurrence_end"
                  type="date"
                  class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
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
            {{ loading ? (task ? 'Modification...' : 'Création...') : (task ? 'Modifier la tâche' : 'Créer la tâche') }}
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<script>
import { ref, reactive, watch } from 'vue'

export default {
  name: 'CreateTaskModal',
  props: {
    task: {
      type: Object,
      default: null
    },
    projectId: {
      type: [String, Number],
      required: true
    },
    teamMembers: {
      type: Array,
      default: () => []
    }
  },
  emits: ['close', 'save'],
  setup(props, { emit }) {
    const loading = ref(false)
    const showAdvanced = ref(false)
    const errors = ref({})

    const form = reactive({
      title: '',
      description: '',
      status: 'todo',
      priority: 'medium',
      type: 'task',
      assignee_id: '',
      start_date: '',
      due_date: '',
      estimated_hours: null,
      progress: 0,
      tags: '',
      dependencies: '',
      acceptance_criteria: '',
      notes: '',
      is_recurring: false,
      is_critical: false,
      notifications_enabled: true,
      track_time: false,
      recurrence_pattern: 'weekly',
      recurrence_end: ''
    })

    // Initialiser le formulaire si on édite une tâche
    watch(() => props.task, (newTask) => {
      if (newTask) {
        Object.keys(form).forEach(key => {
          if (newTask[key] !== undefined) {
            if (key === 'tags' && Array.isArray(newTask[key])) {
              form[key] = newTask[key].join(', ')
            } else if (key === 'dependencies' && Array.isArray(newTask[key])) {
              form[key] = newTask[key].join(', ')
            } else if (key === 'assignee_id' && newTask.assignee) {
              form[key] = newTask.assignee.id
            } else {
              form[key] = newTask[key]
            }
          }
        })
      }
    }, { immediate: true })

    const closeModal = () => {
      emit('close')
    }

    const validateForm = () => {
      errors.value = {}

      if (!form.title.trim()) {
        errors.value.title = 'Le titre est requis'
      }

      if (form.start_date && form.due_date && new Date(form.start_date) > new Date(form.due_date)) {
        errors.value.due_date = 'La date d\'échéance doit être postérieure à la date de début'
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
        const taskData = {
          ...form,
          project_id: props.projectId,
          tags: form.tags ? form.tags.split(',').map(tag => tag.trim()).filter(tag => tag) : [],
          dependencies: form.dependencies ? form.dependencies.split(',').map(dep => parseInt(dep.trim())).filter(dep => !isNaN(dep)) : [],
          estimated_hours: form.estimated_hours || 0,
          assignee_id: form.assignee_id || null
        }

        emit('save', taskData)
      } catch (error) {
        console.error('Erreur lors de la sauvegarde de la tâche:', error)
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

/* Style pour le slider de progrès */
input[type="range"]::-webkit-slider-thumb {
  appearance: none;
  height: 20px;
  width: 20px;
  border-radius: 50%;
  background: #3b82f6;
  cursor: pointer;
}

input[type="range"]::-moz-range-thumb {
  height: 20px;
  width: 20px;
  border-radius: 50%;
  background: #3b82f6;
  cursor: pointer;
  border: none;
}
</style>