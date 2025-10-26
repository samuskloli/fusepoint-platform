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
import { ref, reactive, watch, onMounted, onUnmounted, onBeforeUnmount, nextTick } from 'vue'
import { projectManagementService } from '../../services/projectManagementService'

export default {
  name: 'EditProjectModal',
  props: {
    project: {
      type: Object,
      required: true
    }
  },
  emits: ['close', 'update'],
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

    const normalizeTags = (tags) => {
      if (!tags) return []
      if (Array.isArray(tags)) return [...tags]
      if (typeof tags === 'string') {
        try {
          const parsed = JSON.parse(tags)
          if (Array.isArray(parsed)) return parsed
        } catch (_) {}
        return tags.split(',').map(t => t.trim()).filter(Boolean)
      }
      if (typeof tags === 'object' && tags !== null && Array.isArray(tags.list)) {
        return tags.list
      }
      return []
    }

    const toDateInput = (value) => {
      if (!value) return ''
      try {
        const d = new Date(value)
        if (!isNaN(d.getTime())) return d.toISOString().slice(0, 10)
      } catch (_) {}
      const s = String(value)
      if (s.includes('T')) return s.split('T')[0]
      // Fallback: assume YYYY-MM-DD or similar
      return s.slice(0, 10)
    }

    // Initialiser le formulaire avec les données du projet
    const initializeForm = async () => {
      console.log('=== EditProjectModal initializeForm START ===')
      console.log('EditProjectModal initializeForm called with project:', props.project)
      console.log('EditProjectModal props.project type:', typeof props.project)
      console.log('EditProjectModal props.project keys:', props.project ? Object.keys(props.project) : 'NO KEYS')
      
      if (!props.project) {
        console.log('EditProjectModal - NO PROJECT DATA, returning early')
        return
      }

      // Attendre que le DOM soit prêt
      await nextTick()

      console.log('EditProjectModal - BEFORE form initialization, current form:', JSON.stringify(form))

      // FORCER la réinitialisation complète du formulaire
      Object.assign(form, {
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

      // Gestion flexible des noms de champs avec plusieurs alias
      const titleValue = props.project.name || props.project.title || props.project.project_name || props.project.project_title || ''
      console.log('EditProjectModal - title field candidates:', {
        'props.project.name': props.project.name,
        'props.project.title': props.project.title,
        'props.project.project_name': props.project.project_name,
        'props.project.project_title': props.project.project_title,
        'final titleValue': titleValue
      })
      
      // FORCER l'assignation des valeurs
      form.title = titleValue
      form.description = props.project.description || ''
      form.type = props.project.type || 'marketing'
      
      const start = props.project.startDate || props.project.start_date || props.project.start || props.project.begin_date || ''
      const end = props.project.endDate || props.project.end_date || props.project.deadline || props.project.due_date || props.project.end || ''
      form.startDate = toDateInput(start)
      form.endDate = toDateInput(end)
      form.budget = props.project.budget || props.project.estimated_budget || props.project.total_budget || ''
      form.priority = props.project.priority || 'medium'
      form.status = props.project.status || props.project.state || 'planning'
      form.progress = props.project.progress || props.project.completion || props.project.progress_percentage || 0
      form.tags = normalizeTags(props.project.tags || props.project.tag_list)
      
      console.log('EditProjectModal - AFTER form initialization, final form:', JSON.stringify(form))
      
      // FORCER une mise à jour supplémentaire après un délai
      setTimeout(() => {
        console.log('EditProjectModal - TIMEOUT CHECK, form state:', JSON.stringify(form))
        if (!form.title && titleValue) {
          console.log('EditProjectModal - FORCING title again:', titleValue)
          form.title = titleValue
        }
        
        // FALLBACK COMPLET - forcer tous les champs si ils sont vides
        if (!form.title && props.project) {
          console.log('EditProjectModal - FALLBACK MECHANISM ACTIVATED')
          const project = props.project
          form.title = project.name || project.title || project.project_name || project.project_title || 'Projet sans nom'
          form.description = project.description || ''
          form.type = project.type || 'marketing'
          form.startDate = toDateInput(project.startDate || project.start_date || project.start || project.begin_date)
          form.endDate = toDateInput(project.endDate || project.end_date || project.deadline || project.due_date || project.end)
          form.budget = project.budget || project.estimated_budget || project.total_budget || ''
          form.priority = project.priority || 'medium'
          form.status = project.status || project.state || 'planning'
          form.progress = project.progress || project.completion || project.progress_percentage || 0
          form.tags = normalizeTags(project.tags || project.tag_list)
          console.log('EditProjectModal - FALLBACK COMPLETED, form:', JSON.stringify(form))
        }
      }, 100)
      
      console.log('=== EditProjectModal initializeForm END ===')
    }

    // Initialiser le formulaire au montage si le projet est déjà disponible
    onMounted(async () => {
      console.log('=== EditProjectModal MOUNTED ===')
      console.log('EditProjectModal onMounted - props.project:', props.project)
      console.log('EditProjectModal onMounted - props.project keys:', props.project ? Object.keys(props.project) : 'NO KEYS')
      
      // FORCER l'initialisation immédiatement au montage
      if (props.project) {
        console.log('EditProjectModal onMounted - calling initializeForm()')
        await initializeForm()
        
        // DOUBLE VÉRIFICATION après un délai
        setTimeout(async () => {
          console.log('EditProjectModal onMounted - DOUBLE CHECK after 200ms')
          if (!form.title && props.project) {
            console.log('EditProjectModal onMounted - FORCING re-initialization')
            await initializeForm()
          }
        }, 200)
      } else {
        console.log('EditProjectModal onMounted - NO project, not calling initializeForm()')
      }
      console.log('=== EditProjectModal MOUNTED END ===')
    })

    // Initialiser et réagir immédiatement aux changements de projet
    watch(
      () => props.project,
      async (newVal, oldVal) => {
        console.log('=== EditProjectModal WATCH TRIGGERED ===')
        console.log('EditProjectModal watch project - newVal:', newVal)
        console.log('EditProjectModal watch project - oldVal:', oldVal)
        console.log('EditProjectModal watch project - newVal type:', typeof newVal)
        console.log('EditProjectModal watch project - newVal keys:', newVal ? Object.keys(newVal) : 'NO KEYS')
        if (newVal) {
          console.log('EditProjectModal watch - calling initializeForm()')
          await initializeForm()
        } else {
          console.log('EditProjectModal watch - NO newVal, not calling initializeForm()')
        }
        console.log('=== EditProjectModal WATCH END ===')
      },
      { immediate: true, deep: true }
    )

    const addTag = () => {
      const tag = newTag.value.trim()
      if (tag && !form.tags.includes(tag)) {
        form.tags.push(tag)
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
          name: form.title?.trim() || '',
          description: form.description?.trim() || '',
          budget: form.budget ? parseFloat(form.budget) : null,
          priority: form.priority,
          status: form.status,
          deadline: form.endDate || null
        }

        const result = await projectManagementService.updateProject(props.project.id, projectData)
        if (result.success) {
          emit('update', result.data)
        } else {
          console.error('Erreur lors de la mise à jour du projet:', result.error)
        }
      } catch (error) {
        console.error('Erreur lors de la mise à jour du projet:', error)
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