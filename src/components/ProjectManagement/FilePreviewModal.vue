<template>
  <div class="fixed inset-0 bg-black bg-opacity-75 overflow-y-auto h-full w-full z-50" @click="closeModal">
    <div class="relative min-h-screen flex items-center justify-center p-4">
      <div class="relative bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden" @click.stop>
        <!-- En-tête -->
        <div class="flex items-center justify-between p-4 border-b border-gray-200">
          <div class="flex items-center space-x-3">
            <div class="flex-shrink-0">
              <svg
                class="w-8 h-8"
                :class="getFileIconClass(file.type)"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path fill-rule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z" clip-rule="evenodd"></path>
              </svg>
            </div>
            <div>
              <h3 class="text-lg font-semibold text-gray-900">{{ file.name }}</h3>
              <p class="text-sm text-gray-500">
                {{ getFileTypeLabel(file.type) }} • {{ formatFileSize(file.size) }} • 
                Modifié le {{ formatDate(file.updated_at) }}
              </p>
            </div>
          </div>
          <div class="flex items-center space-x-2">
            <button
              @click="downloadFile"
              class="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              <svg class="-ml-0.5 mr-2 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
              </svg>
              Télécharger
            </button>
            <button
              @click="closeModal"
              class="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
              </svg>
            </button>
          </div>
        </div>

        <!-- Contenu de prévisualisation -->
        <div class="flex-1 overflow-auto" style="max-height: calc(90vh - 120px);">
          <!-- Prévisualisation d'image -->
          <div v-if="isImage" class="p-4 flex items-center justify-center bg-gray-50">
            <img
              :src="file.url || file.preview_url"
              :alt="file.name"
              class="max-w-full max-h-full object-contain rounded-lg shadow-lg"
              @load="onImageLoad"
              @error="onImageError"
            >
          </div>

          <!-- Prévisualisation de vidéo -->
          <div v-else-if="isVideo" class="p-4 flex items-center justify-center bg-black">
            <video
              :src="file.url || file.preview_url"
              controls
              class="max-w-full max-h-full rounded-lg"
              @loadedmetadata="onVideoLoad"
              @error="onVideoError"
            >
              Votre navigateur ne supporte pas la lecture de vidéos.
            </video>
          </div>

          <!-- Prévisualisation d'audio -->
          <div v-else-if="isAudio" class="p-8 flex flex-col items-center justify-center bg-gray-50">
            <div class="bg-white rounded-lg p-6 shadow-lg w-full max-w-md">
              <div class="flex items-center space-x-4 mb-4">
                <div class="flex-shrink-0">
                  <svg class="w-12 h-12 text-purple-500" fill="currentColor" viewBox="0 0 20 20">
                    <path fill-rule="evenodd" d="M9.383 3.076A1 1 0 0110 4v12a1 1 0 01-1.707.707L4.586 13H2a1 1 0 01-1-1V8a1 1 0 011-1h2.586l3.707-3.707a1 1 0 011.09-.217zM15.657 6.343a1 1 0 011.414 0A9.972 9.972 0 0119 12a9.972 9.972 0 01-1.929 5.657 1 1 0 11-1.414-1.414A7.971 7.971 0 0017 12a7.971 7.971 0 00-1.343-4.243 1 1 0 010-1.414z" clip-rule="evenodd"></path>
                    <path fill-rule="evenodd" d="M13.828 8.172a1 1 0 011.414 0A5.983 5.983 0 0117 12a5.983 5.983 0 01-1.758 3.828 1 1 0 11-1.414-1.414A3.987 3.987 0 0015 12a3.987 3.987 0 00-1.172-2.828 1 1 0 010-1.414z" clip-rule="evenodd"></path>
                  </svg>
                </div>
                <div class="flex-1">
                  <h4 class="text-lg font-medium text-gray-900">{{ file.name }}</h4>
                  <p class="text-sm text-gray-500">Fichier audio</p>
                </div>
              </div>
              <audio
                :src="file.url || file.preview_url"
                controls
                class="w-full"
                @loadedmetadata="onAudioLoad"
                @error="onAudioError"
              >
                Votre navigateur ne supporte pas la lecture audio.
              </audio>
            </div>
          </div>

          <!-- Prévisualisation de PDF -->
          <div v-else-if="isPDF" class="h-full">
            <iframe
              :src="file.url || file.preview_url"
              class="w-full h-full border-0"
              @load="onPDFLoad"
              @error="onPDFError"
            >
              Votre navigateur ne supporte pas l'affichage de PDF.
            </iframe>
          </div>

          <!-- Prévisualisation de texte -->
          <div v-else-if="isText" class="p-6">
            <div class="bg-gray-50 rounded-lg p-4">
              <pre v-if="textContent" class="whitespace-pre-wrap text-sm text-gray-800 font-mono">{{ textContent }}</pre>
              <div v-else class="flex items-center justify-center py-8">
                <div class="text-center">
                  <svg class="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
                  </svg>
                  <p class="mt-2 text-sm text-gray-500">Chargement du contenu...</p>
                </div>
              </div>
            </div>
          </div>

          <!-- Prévisualisation de code -->
          <div v-else-if="isCode" class="p-6">
            <div class="bg-gray-900 rounded-lg p-4 overflow-auto">
              <pre v-if="codeContent" class="text-sm text-green-400 font-mono"><code>{{ codeContent }}</code></pre>
              <div v-else class="flex items-center justify-center py-8">
                <div class="text-center">
                  <svg class="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4"></path>
                  </svg>
                  <p class="mt-2 text-sm text-gray-400">Chargement du code...</p>
                </div>
              </div>
            </div>
          </div>

          <!-- Pas de prévisualisation disponible -->
          <div v-else class="p-8 flex flex-col items-center justify-center bg-gray-50">
            <div class="text-center">
              <svg class="mx-auto h-16 w-16 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
              </svg>
              <h3 class="mt-4 text-lg font-medium text-gray-900">Prévisualisation non disponible</h3>
              <p class="mt-2 text-sm text-gray-500">
                Ce type de fichier ne peut pas être prévisualisé dans le navigateur.
              </p>
              <button
                @click="downloadFile"
                class="mt-4 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                <svg class="-ml-1 mr-2 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
                </svg>
                Télécharger le fichier
              </button>
            </div>
          </div>
        </div>

        <!-- Informations du fichier -->
        <div class="border-t border-gray-200 bg-gray-50 px-4 py-3">
          <div class="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            <div>
              <span class="font-medium text-gray-700">Taille :</span>
              <span class="text-gray-900 ml-1">{{ formatFileSize(file.size) }}</span>
            </div>
            <div>
              <span class="font-medium text-gray-700">Type :</span>
              <span class="text-gray-900 ml-1">{{ file.type }}</span>
            </div>
            <div>
              <span class="font-medium text-gray-700">Téléchargé par :</span>
              <span class="text-gray-900 ml-1">{{ file.uploaded_by ? file.uploaded_by.name : 'Inconnu' }}</span>
            </div>
          </div>
          <div v-if="file.description" class="mt-2">
            <span class="font-medium text-gray-700">Description :</span>
            <p class="text-gray-900 mt-1">{{ file.description }}</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, computed, onMounted } from 'vue'
import { projectManagementService } from '@/services/projectManagementService'

export default {
  name: 'FilePreviewModal',
  props: {
    file: {
      type: Object,
      required: true
    }
  },
  emits: ['close'],
  setup(props, { emit }) {
    const textContent = ref('')
    const codeContent = ref('')
    const loading = ref(false)

    const isImage = computed(() => {
      return props.file.type.startsWith('image/')
    })

    const isVideo = computed(() => {
      return props.file.type.startsWith('video/')
    })

    const isAudio = computed(() => {
      return props.file.type.startsWith('audio/')
    })

    const isPDF = computed(() => {
      return props.file.type === 'application/pdf'
    })

    const isText = computed(() => {
      return props.file.type.startsWith('text/') || 
             props.file.type === 'application/json' ||
             props.file.name.endsWith('.txt') ||
             props.file.name.endsWith('.md') ||
             props.file.name.endsWith('.json')
    })

    const isCode = computed(() => {
      const codeExtensions = ['.js', '.ts', '.vue', '.html', '.css', '.scss', '.php', '.py', '.java', '.cpp', '.c', '.h', '.xml', '.yaml', '.yml']
      return codeExtensions.some(ext => props.file.name.toLowerCase().endsWith(ext))
    })

    const getFileIconClass = (mimeType) => {
      if (mimeType.startsWith('image/')) return 'text-green-500'
      if (mimeType.startsWith('video/')) return 'text-purple-500'
      if (mimeType.startsWith('audio/')) return 'text-yellow-500'
      if (mimeType.includes('pdf')) return 'text-red-500'
      if (mimeType.startsWith('text/')) return 'text-blue-500'
      return 'text-gray-500'
    }

    const getFileTypeLabel = (mimeType) => {
      if (mimeType.startsWith('image/')) return 'Image'
      if (mimeType.startsWith('video/')) return 'Vidéo'
      if (mimeType.startsWith('audio/')) return 'Audio'
      if (mimeType.includes('pdf')) return 'PDF'
      if (mimeType.startsWith('text/')) return 'Texte'
      if (mimeType.includes('zip') || mimeType.includes('rar')) return 'Archive'
      return 'Fichier'
    }

    const formatFileSize = (bytes) => {
      if (bytes === 0) return '0 B'
      const k = 1024
      const sizes = ['B', 'KB', 'MB', 'GB']
      const i = Math.floor(Math.log(bytes) / Math.log(k))
      return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
    }

    const formatDate = (date) => {
      return new Date(date).toLocaleDateString('fr-FR', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      })
    }

    const closeModal = () => {
      emit('close')
    }

    const downloadFile = async () => {
      try {
        const response = await projectManagementService.downloadFile(props.file.id)
        const url = window.URL.createObjectURL(new Blob([response.data]))
        const link = document.createElement('a')
        link.href = url
        link.setAttribute('download', props.file.name)
        document.body.appendChild(link)
        link.click()
        link.remove()
        window.URL.revokeObjectURL(url)
      } catch (error) {
        console.error('Erreur lors du téléchargement:', error)
      }
    }

    const loadTextContent = async () => {
      if (!isText.value && !isCode.value) return

      try {
        loading.value = true
        const response = await fetch(props.file.url || props.file.preview_url)
        const content = await response.text()
        
        if (isCode.value) {
          codeContent.value = content
        } else {
          textContent.value = content
        }
      } catch (error) {
        console.error('Erreur lors du chargement du contenu:', error)
        if (isCode.value) {
          codeContent.value = 'Erreur lors du chargement du fichier'
        } else {
          textContent.value = 'Erreur lors du chargement du fichier'
        }
      } finally {
        loading.value = false
      }
    }

    const onImageLoad = () => {
      console.log('Image chargée avec succès')
    }

    const onImageError = () => {
      console.error('Erreur lors du chargement de l\'image')
    }

    const onVideoLoad = () => {
      console.log('Vidéo chargée avec succès')
    }

    const onVideoError = () => {
      console.error('Erreur lors du chargement de la vidéo')
    }

    const onAudioLoad = () => {
      console.log('Audio chargé avec succès')
    }

    const onAudioError = () => {
      console.error('Erreur lors du chargement de l\'audio')
    }

    const onPDFLoad = () => {
      console.log('PDF chargé avec succès')
    }

    const onPDFError = () => {
      console.error('Erreur lors du chargement du PDF')
    }

    // Gestion des touches du clavier
    const handleKeydown = (event) => {
      if (event.key === 'Escape') {
        closeModal()
      }
    }

    onMounted(() => {
      loadTextContent()
      document.addEventListener('keydown', handleKeydown)
    })

    // Nettoyage
    const cleanup = () => {
      document.removeEventListener('keydown', handleKeydown)
    }

    return {
      textContent,
      codeContent,
      loading,
      isImage,
      isVideo,
      isAudio,
      isPDF,
      isText,
      isCode,
      getFileIconClass,
      getFileTypeLabel,
      formatFileSize,
      formatDate,
      closeModal,
      downloadFile,
      onImageLoad,
      onImageError,
      onVideoLoad,
      onVideoError,
      onAudioLoad,
      onAudioError,
      onPDFLoad,
      onPDFError,
      cleanup
    }
  },
  beforeUnmount() {
    this.cleanup()
  }
}
</script>

<style scoped>
/* Styles pour la prévisualisation de code */
code {
  font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
  line-height: 1.5;
}

/* Styles pour le scrollbar dans le code */
.bg-gray-900::-webkit-scrollbar {
  width: 8px;
  height: 8px;
}

.bg-gray-900::-webkit-scrollbar-track {
  background: #374151;
}

.bg-gray-900::-webkit-scrollbar-thumb {
  background: #6b7280;
  border-radius: 4px;
}

.bg-gray-900::-webkit-scrollbar-thumb:hover {
  background: #9ca3af;
}
</style>