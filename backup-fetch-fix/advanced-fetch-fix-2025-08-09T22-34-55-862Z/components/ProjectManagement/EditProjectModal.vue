<template>
  <div class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
    <div class="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
      <div class="flex items-center justify-between p-6 border-b">
        <h3 class="text-lg font-semibold text-gray-900">Modifier le projet</h3>
        <button @click="$emit('close')" class="text-gray-400 hover:text-gray-600">
          <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
          </svg>
        </button>
      </div>

      <form @submit.prevent="updateProject" class="p-6 space-y-6">
        <!-- Informations de base -->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">Nom du projet *</label>
            <input
              v-model="form.title"
              type="text"
              required
              class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Nom du projet"
            >
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">Type de projet</label>
            <select
              v-model="form.type"
              class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="marketing">Marketing</option>
              <option value="development">Développement</option>
              <option value="design">Design</option>
              <option value="consulting">Conseil</option>
              <option value="other">Autre</option>
            </select>
          </div>
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">Description</label>
          <textarea
            v-model="form.description"
            rows="3"
            class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Description du projet"
          ></textarea>
        </div>

        <!-- Dates et budget -->
        <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">Date de début</label>
            <input
              v-model="form.startDate"
              type="date"
              class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">Date de fin prévue</label>
            <input
              v-model="form.endDate"
              type="date"
              class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">Budget (CHF)</label>
            <input
              v-model="form.budget"
              type="number"
              min="0"
              step="0.01"
              class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="0.00"
            >
          </div>
        </div>

        <!-- Priorité et statut -->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">Priorité</label>
            <select
              v-model="form.priority"
              class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="low">Basse</option>
              <option value="medium">Moyenne</option>
              <option value="high">Haute</option>
              <option value="urgent">Urgente</option>
            </select>
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">Statut</label>
            <select
              v-model="form.status"
              class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="draft">Brouillon</option>
              <option value="planning">Planification</option>
              <option value="active">Actif</option>
              <option value="on_hold">En pause</option>
              <option value="completed">Terminé</option>
              <option value="cancelled">Annulé</option>
            </select>
          </div>
        </div>

        <!-- Progression -->
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">Progression (%)</label>
          <div class="flex items-center space-x-4">
            <input
              v-model="form.progress"
              type="range"
              min="0"
              max="100"
              class="flex-1"
            >
            <span class="text-sm font-medium text-gray-700 w-12">{{ form.progress }}%</span>
          </div>
        </div>

        <!-- Tags -->
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">Tags</label>
          <div class="flex flex-wrap gap-2 mb-2">
            <span
              v-for="tag in form.tags"
              :key="tag"
              class="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
            >
              {{ tag }}
              <button
                @click="removeTag(tag)"
                type="button"
                class="ml-1 text-blue-600 hover:text-blue-800"
              >
                ×
              </button>
            </span>
          </div>
          <div class="flex gap-2">
            <input
              v-model="newTag"
              @keyup.enter="addTag"
              type="text"
              class="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Ajouter un tag"
            >
            <button
              @click="addTag"
              type="button"
              class="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200"
            >
              Ajouter
            </button>
          </div>
        </div>

        <!-- Actions -->
        <div class="flex justify-end space-x-3 pt-6 border-t">
          <button
            @click="$emit('close')"
            type="button"
            class="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
          >
            Annuler
          </button>
          <button
            type="submit"
            :disabled="loading || !form.title"
            class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <span v-if="loading">Mise à jour...</span>
            <span v-else>Mettre à jour</span>
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<script>
import { ref, reactive, watch } from 'vue'
import { projectManagementService } from '../../services/projectManagementService'

export default {
  name: 'EditProjectModal',
  props: {
    project: {
      type: Object,
      required: true
    }
  },
  emits: ['close', 'updated'],
  setup(props, { emit }) {
    const loading = ref(false)
    const newTag = ref('')

    const form = reactive({
      title: '',
      description: '',
      type: 'marketing',
      startDate: '',
      endDate: '',
      budget: '',
      priority: 'medium',
      status: 'planning',
      progress: 0,
      tags: []
    })

    // Initialiser le formulaire avec les données du projet
    const initializeForm = () => {
      if (props.project) {
        form.title = props.project.title || ''
        form.description = props.project.description || ''
        form.type = props.project.type || 'marketing'
        form.startDate = props.project.startDate ? props.project.startDate.split('T')[0] : ''
        form.endDate = props.project.endDate ? props.project.endDate.split('T')[0] : ''
        form.budget = props.project.budget || ''
        form.priority = props.project.priority || 'medium'
        form.status = props.project.status || 'planning'
        form.progress = props.project.progress || 0
        form.tags = props.project.tags ? [...props.project.tags] : []
      }
    }

    // Initialiser le formulaire au montage
    initializeForm()

    // Réinitialiser le formulaire si le projet change
    watch(() => props.project, () => {
      initializeForm()
    }, { deep: true })

    const addTag = () => {
      if (newTag.value.trim() && !form.tags.includes(newTag.value.trim())) {
        form.tags.push(newTag.value.trim())
        newTag.value = ''
      }
    }

    const removeTag = (tag) => {
      const index = form.tags.indexOf(tag)
      if (index > -1) {
        form.tags.splice(index, 1)
      }
    }

    const updateProject = async () => {
      try {
        loading.value = true
        
        const projectData = {
          ...form,
          id: props.project.id,
          budget: form.budget ? parseFloat(form.budget) : null
        }

        const updatedProject = await projectManagementService.updateProject(props.project.id, projectData)
        emit('updated', updatedProject)
      } catch (error) {
        console.error('Erreur lors de la mise à jour du projet:', error)
        // Ici vous pourriez ajouter une notification d'erreur
      } finally {
        loading.value = false
      }
    }

    return {
      loading,
      form,
      newTag,
      addTag,
      removeTag,
      updateProject
    }
  }
}
</script>