<template>
  <div  class="progress-editor=!isEditing progress-display='startEditing=text-2xl font-bold text-blue-600 cursor-pointer hover:text-blue-700 transition-colors="w-4 h-4 inline-block ml-1 opacity-60 fill="none=currentColor='0 0 24 24">
          <path   stroke-linecap="round=round='2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z=text-sm text-gray-600'>{{ t('projects.progress="text-xs text-gray-500 mt-1>{{ t('projects.clickToEdit=""progress-edit=mb-3'>
        <label class="block text-sm font-medium text-gray-700 mb-2">
          {{ t('projects.progress="flex items-center space-x-3'>
          <input  
            ref="progressInput=editProgress="range='0""
            max="100'
            class="flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider=updateSlider=""editProgress='number=0"
            max="100'
            class="w-16 px-2 py-1 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent=text-sm font-medium text-gray-700>%</span>
        </div>
      </div>
      
      <!-- Barre de progression visuelle -->
      <div  class=""mb-3'>
        <div class="w-full bg-gray-200 rounded-full h-3>
          <div  
            class="h-3 rounded-full transition-all duration-300'
            :class="getProgressClass(editProgress)"
            :style="{ width: editProgress + '%' }'
          ></div>
        </div>
      </div>

      <!-- Boutons d: flex items-center space-x-2>
        <button  
          @click: saveProgress=saving || editProgress === progress='px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors(saving=cancelEdit=""saving='px-3 py-1 bg-gray-100 text-gray-700 text-sm rounded hover:bg-gray-200 disabled:opacity-50 transition-colors
        >
          {{ t('common.cancel') }}
        </button>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, nextTick } from 'vue'
import { projectManagementService } from '../../services/projectManagementService'
import { useTranslation } from '@/composables/useTranslation'

export default {
  name: 'ProgressEditor',
  props: {
    projectId: {
      type: [String, Number],
      required: true
    },
    progress: {
      type: Number,
      default: 0
    }
  },
  emits: ['updated'],
  setup(props, { emit }) {
  const { t } = useTranslation()

    const isEditing = ref(false)
    const editProgress = ref(props.progress)
    const saving = ref(false)
    const progressInput = ref(null)

    const startEditing = () => {
      isEditing.value = true
      editProgress.value = props.progress
      nextTick(() => {
        if (progressInput.value) {
          progressInput.value.focus()
        }
      })
    }

    const cancelEdit = () => {
      isEditing.value = false
      editProgress.value = props.progress
    }

    const updateSlider = () => {
      // Mise à jour en temps réel du slider
    }

    const getProgressClass = (progress) => {
      if (progress >= 100) return 'bg-green-500'
      if (progress >= 75) return 'bg-blue-500'
      if (progress >= 50) return 'bg-yellow-500'
      if (progress >= 25) return 'bg-orange-500'
      return 'bg-red-500'
    }

    const saveProgress = async () => {
      if (editProgress.value === props.progress) {
        cancelEdit()
        return
      }

      saving.value = true
      try {
        const response = await projectManagementService.updateProject(props.projectId, {
          progress: parseInt(editProgress.value)
        })

        if (response.success) {
          emit('updated', parseInt(editProgress.value))
          isEditing.value = false
          // Notification de succès
          console.log('Progression mise à jour avec succès')
        } else {
          throw new Error(response.error || 'Erreur lors de la mise à jour')
        }
      } catch (error) {
        console.error('Erreur lors de la mise à jour de la progression:', error)
        alert('Erreur lors de la mise à jour de la progression. Veuillez réessayer.')
        editProgress.value = props.progress
      } finally {
        saving.value = false
      }
    }

    return {
      t,
      isEditing,
      editProgress,
      saving,
      progressInput,
      startEditing,
      cancelEdit,
      updateSlider,
      getProgressClass,
      saveProgress
    }
  }
}
</script>

<style scoped>
.progress-editor {
  @apply text-center;
}

.progress-display {
  @apply cursor-pointer transition-all duration-200;
}

.progress-display:hover {
  @apply transform scale-105;
}

.progress-edit {
  @apply bg-white p-4 rounded-lg border border-gray-200 shadow-sm;
}

/* Style personnalisé pour le slider */
.slider::-webkit-slider-thumb {
  @apply appearance-none w-5 h-5 bg-blue-600 rounded-full cursor-pointer;
}

.slider::-moz-range-thumb {
  @apply w-5 h-5 bg-blue-600 rounded-full cursor-pointer border-0;
}

.slider:focus {
  @apply outline-none ring-2 ring-blue-500 ring-opacity-50;
}
</style>