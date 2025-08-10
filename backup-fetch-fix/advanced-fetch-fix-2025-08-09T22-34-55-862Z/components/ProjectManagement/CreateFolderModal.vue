<template>
  <div class="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50" @click="closeModal">
    <div class="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white" @click.stop>
      <!-- En-tête -->
      <div class="flex items-center justify-between pb-4 border-b border-gray-200">
        <h3 class="text-lg font-semibold text-gray-900">Créer un nouveau dossier</h3>
        <button @click="closeModal" class="text-gray-400 hover:text-gray-600 transition-colors">
          <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
          </svg>
        </button>
      </div>

      <!-- Formulaire -->
      <form @submit.prevent="submitForm" class="mt-6">
        <div class="space-y-4">
          <!-- Nom du dossier -->
          <div>
            <label for="name" class="block text-sm font-medium text-gray-700 mb-2">
              Nom du dossier *
            </label>
            <input
              id="name"
              v-model="form.name"
              type="text"
              required
              class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Entrez le nom du dossier"
              @input="validateName"
            >
            <p v-if="errors.name" class="mt-1 text-sm text-red-600">{{ errors.name }}</p>
          </div>

          <!-- Description -->
          <div>
            <label for="description" class="block text-sm font-medium text-gray-700 mb-2">
              Description (optionnelle)
            </label>
            <textarea
              id="description"
              v-model="form.description"
              rows="3"
              class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Décrivez le contenu de ce dossier"
            ></textarea>
          </div>

          <!-- Couleur du dossier -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">
              Couleur du dossier
            </label>
            <div class="flex space-x-2">
              <button
                v-for="color in folderColors"
                :key="color.value"
                type="button"
                @click="form.color = color.value"
                :class="[
                  'w-8 h-8 rounded-full border-2 transition-all',
                  form.color === color.value
                    ? 'border-gray-800 scale-110'
                    : 'border-gray-300 hover:border-gray-400'
                ]"
                :style="{ backgroundColor: color.hex }"
                :title="color.name"
              >
                <svg
                  v-if="form.color === color.value"
                  class="w-4 h-4 text-white mx-auto"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"></path>
                </svg>
              </button>
            </div>
          </div>

          <!-- Options avancées -->
          <div>
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

            <div v-if="showAdvanced" class="mt-4 p-4 bg-gray-50 rounded-lg space-y-3">
              <!-- Permissions -->
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">
                  Permissions
                </label>
                <div class="space-y-2">
                  <label class="flex items-center">
                    <input
                      v-model="form.is_public"
                      type="checkbox"
                      class="rounded border-gray-300 text-blue-600 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
                    >
                    <span class="ml-2 text-sm text-gray-700">Visible par tous les membres du projet</span>
                  </label>
                  <label class="flex items-center">
                    <input
                      v-model="form.allow_upload"
                      type="checkbox"
                      class="rounded border-gray-300 text-blue-600 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
                    >
                    <span class="ml-2 text-sm text-gray-700">Autoriser le téléchargement de fichiers</span>
                  </label>
                  <label class="flex items-center">
                    <input
                      v-model="form.allow_delete"
                      type="checkbox"
                      class="rounded border-gray-300 text-blue-600 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
                    >
                    <span class="ml-2 text-sm text-gray-700">Autoriser la suppression de fichiers</span>
                  </label>
                </div>
              </div>

              <!-- Limite de taille -->
              <div>
                <label for="size_limit" class="block text-sm font-medium text-gray-700 mb-1">
                  Limite de taille (MB)
                </label>
                <input
                  id="size_limit"
                  v-model.number="form.size_limit"
                  type="number"
                  min="0"
                  max="1000"
                  class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="0 = illimité"
                >
                <p class="mt-1 text-xs text-gray-500">
                  Limite de taille totale pour ce dossier (0 = illimité)
                </p>
              </div>

              <!-- Types de fichiers autorisés -->
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">
                  Types de fichiers autorisés
                </label>
                <div class="grid grid-cols-2 gap-2">
                  <label v-for="fileType in fileTypes" :key="fileType.value" class="flex items-center">
                    <input
                      v-model="form.allowed_file_types"
                      :value="fileType.value"
                      type="checkbox"
                      class="rounded border-gray-300 text-blue-600 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
                    >
                    <span class="ml-2 text-sm text-gray-700">{{ fileType.label }}</span>
                  </label>
                </div>
                <p class="mt-1 text-xs text-gray-500">
                  Laissez vide pour autoriser tous les types
                </p>
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
            :disabled="loading || !form.name.trim()"
            class="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <svg v-if="loading" class="animate-spin -ml-1 mr-2 h-4 w-4 text-white inline" fill="none" viewBox="0 0 24 24">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            {{ loading ? 'Création...' : 'Créer le dossier' }}
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<script>
import { ref, reactive } from 'vue'

export default {
  name: 'CreateFolderModal',
  props: {
    parentFolderId: {
      type: [String, Number],
      default: null
    }
  },
  emits: ['close', 'create'],
  setup(props, { emit }) {
    const loading = ref(false)
    const showAdvanced = ref(false)
    const errors = ref({})

    const form = reactive({
      name: '',
      description: '',
      color: 'blue',
      is_public: true,
      allow_upload: true,
      allow_delete: false,
      size_limit: 0,
      allowed_file_types: []
    })

    const folderColors = [
      { value: 'blue', name: 'Bleu', hex: '#3B82F6' },
      { value: 'green', name: 'Vert', hex: '#10B981' },
      { value: 'yellow', name: 'Jaune', hex: '#F59E0B' },
      { value: 'red', name: 'Rouge', hex: '#EF4444' },
      { value: 'purple', name: 'Violet', hex: '#8B5CF6' },
      { value: 'pink', name: 'Rose', hex: '#EC4899' },
      { value: 'indigo', name: 'Indigo', hex: '#6366F1' },
      { value: 'gray', name: 'Gris', hex: '#6B7280' }
    ]

    const fileTypes = [
      { value: 'image', label: 'Images' },
      { value: 'document', label: 'Documents' },
      { value: 'video', label: 'Vidéos' },
      { value: 'audio', label: 'Audio' },
      { value: 'archive', label: 'Archives' },
      { value: 'code', label: 'Code' },
      { value: 'spreadsheet', label: 'Tableurs' },
      { value: 'presentation', label: 'Présentations' }
    ]

    const closeModal = () => {
      emit('close')
    }

    const validateName = () => {
      errors.value = {}
      
      if (!form.name.trim()) {
        errors.value.name = 'Le nom du dossier est requis'
        return false
      }
      
      // Vérifier les caractères interdits
      const invalidChars = /[<>:"/\\|?*]/
      if (invalidChars.test(form.name)) {
        errors.value.name = 'Le nom ne peut pas contenir les caractères < > : " / \\ | ? *'
        return false
      }
      
      // Vérifier la longueur
      if (form.name.length > 255) {
        errors.value.name = 'Le nom ne peut pas dépasser 255 caractères'
        return false
      }
      
      // Vérifier les noms réservés
      const reservedNames = ['CON', 'PRN', 'AUX', 'NUL', 'COM1', 'COM2', 'COM3', 'COM4', 'COM5', 'COM6', 'COM7', 'COM8', 'COM9', 'LPT1', 'LPT2', 'LPT3', 'LPT4', 'LPT5', 'LPT6', 'LPT7', 'LPT8', 'LPT9']
      if (reservedNames.includes(form.name.toUpperCase())) {
        errors.value.name = 'Ce nom est réservé par le système'
        return false
      }
      
      return true
    }

    const submitForm = async () => {
      if (!validateName()) {
        return
      }

      loading.value = true

      try {
        const folderData = {
          ...form,
          parent_id: props.parentFolderId,
          name: form.name.trim()
        }

        emit('create', folderData)
      } catch (error) {
        console.error('Erreur lors de la création du dossier:', error)
      } finally {
        loading.value = false
      }
    }

    return {
      form,
      loading,
      showAdvanced,
      errors,
      folderColors,
      fileTypes,
      closeModal,
      validateName,
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