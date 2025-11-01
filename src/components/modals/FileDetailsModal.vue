<template>
  <div class="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50" @click.self="closeModal">
    <div class="relative w-11/12 md:w-4/5 lg:w-3/5 max-h-[85vh] overflow-y-auto border shadow-lg rounded-lg bg-white p-5">
      <!-- Header -->
      <div class="flex items-start justify-between pb-4 border-b border-gray-200">
        <div class="flex items-center space-x-4">
          <div :class="['w-12 h-12 rounded-lg flex items-center justify-center', getFileColorClass(file.type)]">
            <i :class="[getFileIcon(file.type), 'text-xl text-white']"></i>
          </div>
          <h3 class="text-lg font-medium text-gray-900">{{ file.name }}</h3>
        </div>
        <button class="text-gray-400 hover:text-gray-600" @click="closeModal" aria-label="Close">
          <i class="fas fa-times text-xl"></i>
        </button>
      </div>

      <!-- Preview -->
      <div class="mb-6">
        <h4 class="text-md font-medium text-gray-900 mb-3">{{ t('files.preview') }}</h4>
        <div class="bg-gray-50 rounded-lg p-4 text-center">
          <template v-if="isImage(file.type)">
            <img v-if="file.url && !imageError"
                 :src="file.url"
                 :alt="file.name"
                 class="max-w-full max-h-64 mx-auto rounded-lg shadow-sm"
                 @error="imageError = true" />
            <div v-else class="text-gray-500 py-8">
              <i class="fas fa-image text-4xl mb-2"></i>
              <p>{{ t('files.previewNotAvailable') }}</p>
            </div>
          </template>
          <template v-else-if="isPDF(file.type)">
            <div class="flex items-center justify-center py-8">
              <div class="text-center">
                <i class="fas fa-file-pdf text-4xl text-red-600 mb-2"></i>
                <p class="text-gray-700">{{ t('files.pdfDocument') }}</p>
                <button class="mt-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                        @click="openInNewTab">
                  {{ t('files.openInNewTab') }}
                </button>
              </div>
            </div>
          </template>
          <template v-else>
            <div class="flex items-center justify-center py-8">
              <div class="text-center">
                <i :class="[getFileIcon(file.type), 'text-4xl text-gray-500 mb-2']"></i>
                <p class="text-gray-700">{{ getFileTypeDescription(file.type) }}</p>
                <button class="mt-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                        @click="downloadFile">
                  <i class="fas fa-download mr-2"></i>
                  {{ t('files.download') }}
                </button>
              </div>
            </div>
          </template>
        </div>
      </div>

      <!-- Info + Metadata -->
      <div class="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <div>
          <h4 class="text-md font-medium text-gray-900 mb-3">{{ t('files.generalInfo') }}</h4>
          <div class="space-y-3">
            <div class="flex justify-between">
              <span class="text-sm text-gray-600">{{ t('files.fileName') }}</span>
              <span class="text-sm font-medium text-gray-900">{{ file.name }}</span>
            </div>
            <div class="flex justify-between">
              <span class="text-sm text-gray-600">{{ t('files.fileSize') }}</span>
              <span class="text-sm font-medium text-gray-900">{{ formatFileSize(file.size || 0) }}</span>
            </div>
            <div class="flex justify-between">
              <span class="text-sm text-gray-600">{{ t('files.fileType') }}</span>
              <span class="text-sm font-medium text-gray-900">{{ getFileTypeDescription(file.type || '') }}</span>
            </div>
            <div class="flex justify-between">
              <span class="text-sm text-gray-600">{{ t('files.uploadedBy') }}</span>
              <span class="text-sm font-medium text-gray-900">{{ file.uploaded_by?.name || t('common.unknown') }}</span>
            </div>
            <div class="flex justify-between">
              <span class="text-sm text-gray-600">{{ t('files.uploadDate') }}</span>
              <span class="text-sm font-medium text-gray-900">{{ formatDate(file.created_at) }}</span>
            </div>
            <div v-if="file.updated_at && file.updated_at !== file.created_at" class="flex justify-between">
              <span class="text-sm text-gray-600">{{ t('files.lastModified') }}</span>
              <span class="text-sm font-medium text-gray-900">{{ formatDate(file.updated_at) }}</span>
            </div>
          </div>
        </div>

        <div>
          <h4 class="text-md font-medium text-gray-900 mb-3">{{ t('files.metadata') }}</h4>
          <div class="space-y-3">
            <div>
              <span class="text-sm text-gray-600">{{ t('files.folder') }}</span>
              <span class="text-sm font-medium text-gray-900 ml-2">
                {{ file.folder?.name || t('files.rootFolder') }}
              </span>
            </div>
            <div>
              <span class="text-sm text-gray-600">{{ t('files.tags') }}</span>
              <div class="mt-1">
                <div v-if="file.tags && file.tags.length > 0" class="flex flex-wrap gap-1">
                  <span v-for="tag in file.tags" :key="tag" class="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                    {{ tag }}
                  </span>
                </div>
                <span v-else class="text-sm text-gray-500">{{ t('files.noTags') }}</span>
              </div>
            </div>
            <div>
              <span class="text-sm text-gray-600">{{ t('files.permissions') }}</span>
              <div class="mt-1 space-y-1">
                <div class="flex items-center text-sm">
                  <i class="fas fa-eye w-4 mr-2 text-gray-500"></i>
                  <span class="text-gray-700">{{ file.is_public ? t('files.publicAccess') : t('files.privateAccess') }}</span>
                </div>
                <div class="flex items-center text-sm">
                  <i class="fas fa-download w-4 mr-2 text-gray-500"></i>
                  <span class="text-gray-700">{{ file.allow_download ? t('files.downloadAllowed') : t('files.downloadNotAllowed') }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Versions -->
      <div v-if="file.versions && file.versions.length > 1" class="mb-6">
        <h4 class="text-md font-medium text-gray-900 mb-3">{{ t('files.versionHistory') }}</h4>
        <div class="space-y-2 max-h-32 overflow-y-auto">
          <div v-for="version in file.versions" :key="version.id" class="flex items-center justify-between p-2 bg-gray-50 rounded-lg">
            <div class="flex items-center space-x-3">
              <span class="text-sm font-medium text-gray-900">v{{ version.version }}</span>
              <span class="text-sm text-gray-600">{{ formatDate(version.created_at) }}</span>
              <span class="text-sm text-gray-600">{{ version.uploaded_by?.name }}</span>
            </div>
            <div class="flex items-center space-x-2">
              <span v-if="version.is_current" class="text-xs px-2 py-1 bg-green-100 text-green-800 rounded-full">{{ t('files.currentVersion') }}</span>
              <button class="text-blue-600 hover:text-blue-800" @click="downloadVersion(version)">
                <i class="fas fa-download"></i>
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Actions -->
      <div class="flex justify-between items-center pt-4 border-t border-gray-200">
        <div class="flex space-x-3">
          <button @click="downloadFile" class="flex items-center space-x-2 px-3 py-2 text-sm text-blue-700 bg-blue-100 hover:bg-blue-200 rounded-lg transition-colors">
            <i class="fas fa-download"></i>
            <span>{{ t('files.download') }}</span>
          </button>
          <button @click="shareFile" class="flex items-center space-x-2 px-3 py-2 text-sm text-green-700 bg-green-100 hover:bg-green-200 rounded-lg transition-colors">
            <i class="fas fa-share-alt"></i>
            <span>{{ t('files.share') }}</span>
          </button>
          <button v-if="canEdit" @click="editFile" class="flex items-center space-x-2 px-3 py-2 text-sm text-orange-700 bg-orange-100 hover:bg-orange-200 rounded-lg transition-colors">
            <i class="fas fa-edit"></i>
            <span>{{ t('files.edit') }}</span>
          </button>
        </div>
        <div class="flex space-x-3">
          <button v-if="canDelete" @click="deleteFile" class="px-4 py-2 text-sm font-medium text-red-700 bg-red-100 border border-red-300 rounded-md hover:bg-red-200">
            {{ t('files.delete') }}
          </button>
          <button @click="closeModal" class="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50">
            {{ t('common.close') }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, computed } from 'vue'
import projectManagementService from '@/services/projectManagementService'
import { useTranslation } from '@/composables/useTranslation'
import { useNotifications } from '@/composables/useNotifications'
import { useAuth } from '@/composables/useAuth'

export default {
  name: 'FileDetailsModal',
  props: {
    file: { type: Object, required: true },
    projectId: { type: [String, Number], required: true }
  },
  emits: ['close', 'share', 'edit', 'delete'],
  setup(props, { emit }) {
    const { t } = useTranslation()
    const { success, error: showError, confirm } = useNotifications()
    const { user } = useAuth()

    const imageError = ref(false)

    const canEdit = computed(() => {
      return props.file?.uploaded_by?.id === user.value?.id || user.value?.role === 'admin'
    })
    const canDelete = computed(() => {
      return props.file?.uploaded_by?.id === user.value?.id || user.value?.role === 'admin'
    })

    const closeModal = () => emit('close')
    const shareFile = () => emit('share', props.file)
    const editFile = () => emit('edit', props.file)
    const deleteFile = async () => {
      const ok = await confirm(t('files.confirmDelete') || 'Confirmer la suppression ?')
      if (ok) emit('delete', props.file)
    }

    const formatFileSize = (bytes) => {
      if (!bytes || bytes === 0) return '0 Bytes'
      const k = 1024
      const sizes = ['Bytes', 'KB', 'MB', 'GB']
      const i = Math.floor(Math.log(bytes) / Math.log(k))
      return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
    }

    const formatDate = (date) => {
      if (!date) return ''
      return new Date(date).toLocaleDateString('fr-FR', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      })
    }

    const isImage = (type = '') => type.startsWith('image/')
    const isPDF = (type = '') => type.includes('pdf')

    const getFileIcon = (type = '') => {
      if (type.startsWith('image/')) return 'fas fa-image'
      if (type.includes('pdf')) return 'fas fa-file-pdf'
      if (type.includes('word') || type.includes('document')) return 'fas fa-file-word'
      if (type.includes('excel') || type.includes('spreadsheet')) return 'fas fa-file-excel'
      if (type.includes('powerpoint') || type.includes('presentation')) return 'fas fa-file-powerpoint'
      if (type.includes('zip') || type.includes('rar')) return 'fas fa-file-archive'
      if (type.includes('text')) return 'fas fa-file-alt'
      return 'fas fa-file'
    }

    const getFileColorClass = (type = '') => {
      if (type.startsWith('image/')) return 'bg-green-600'
      if (type.includes('pdf')) return 'bg-red-600'
      if (type.includes('word') || type.includes('document')) return 'bg-blue-600'
      if (type.includes('excel') || type.includes('spreadsheet')) return 'bg-green-600'
      if (type.includes('powerpoint') || type.includes('presentation')) return 'bg-orange-600'
      if (type.includes('zip') || type.includes('rar')) return 'bg-purple-600'
      return 'bg-gray-600'
    }

    const getFileTypeDescription = (type = '') => {
      if (type.startsWith('image/')) return t('files.types.image')
      if (type.includes('pdf')) return t('files.types.pdf')
      if (type.includes('word') || type.includes('document')) return t('files.types.document')
      if (type.includes('excel') || type.includes('spreadsheet')) return t('files.types.spreadsheet')
      if (type.includes('powerpoint') || type.includes('presentation')) return t('files.types.presentation')
      if (type.includes('zip') || type.includes('rar')) return t('files.types.archive')
      if (type.includes('text')) return t('files.types.text')
      return t('files.types.unknown')
    }

    const downloadFile = async () => {
      try {
        const signed = await projectManagementService.getSignedFileUrl(props.file.id, 'download')
        if (signed.success) {
          const url = signed.data.url
          const link = document.createElement('a')
          link.href = url
          link.setAttribute('download', props.file.name || 'download')
          document.body.appendChild(link)
          link.click()
          link.remove()
          success(t('files.downloadStarted'))
        } else {
          throw new Error(signed.error || 'URL signée indisponible')
        }
      } catch (err) {
        console.error('Téléchargement via URL signée échoué:', err)
        showError(t('files.downloadError'))
      }
    }

    const downloadVersion = async (version) => {
      try {
        const signed = await projectManagementService.getSignedFileUrl(version.id, 'download')
        if (signed.success) {
          const url = signed.data.url
          const link = document.createElement('a')
          link.href = url
          link.setAttribute('download', `${props.file.name || 'download'} (v${version.version})`)
          document.body.appendChild(link)
          link.click()
          link.remove()
          success(t('files.downloadStarted'))
        } else {
          throw new Error(signed.error || 'URL signée indisponible pour la version')
        }
      } catch (err) {
        console.error('Téléchargement de version via URL signée échoué:', err)
        showError(t('files.downloadError'))
      }
    }

    const openInNewTab = () => {
      if (props.file?.url) window.open(props.file.url, '_blank')
    }

    return {
      t,
      imageError,
      canEdit,
      canDelete,
      closeModal,
      shareFile,
      editFile,
      deleteFile,
      formatFileSize,
      formatDate,
      isImage,
      isPDF,
      getFileIcon,
      getFileColorClass,
      getFileTypeDescription,
      downloadFile,
      downloadVersion,
      openInNewTab
    }
  }
}
</script>
