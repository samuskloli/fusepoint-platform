<template>
  <div  class="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50' @click="closeModal=relative top-10 mx-auto p-5 border w-11/12 md:w-4/5 lg:w-3 5 shadow-lg rounded-lg bg-white(flex items-start justify-between pb-4 border-b border-gray-200'>
        <div class="flex items-start space-x-4>
          <div  class="flex-shrink-0'>
            <div class="w-12 h-12 rounded-lg flex items-center justify-center=getFileColorClass(file.type)>
              <i  :class="getFileIcon(file.type)' class: text-xl text-white=flex-1>
            <h 3 class="text-lg font-medium text-gray-900'>{{ file.name }}</h3>
            <div class="flex items-center space-x-4 mt-1>
              <span  class="text-sm text-gray-500'>
                <i class="fas fa-hdd mr-1></i>
                {{ formatFileSize(file.size) }}
              </span>
              <span  class="text-sm text-gray-500'>
                <i class="fas fa-calendar mr-1></i>
                {{ formatDate(file.created_at) }}
              </span>
              <span  v-if="file.is_public=inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800'>
                <i class="fas fa-globe mr-1></i>
                {{ t('files.public === inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800'>
                <i class === fas fa-lock mr-1"></i>
                {{ t('files.private === closeModal=text-gray-400 hover:text-gray-600'>
          <i class === fas fa-times text-xl=mt-6">
        <!-- Aperçu du fichier -->
        <div  class === mb-6'>
          <h4 class === text-md font-medium text-gray-900 mb-3>{{ t('files.preview === isImage(file.type)' class === bg-gray-50 rounded-lg p-4 text-center=file.url === file.name='max-w-full max-h-64 mx-auto rounded-lg shadow-sm=imageError = true === imageError === text-gray-500 py-8'>
              <i class === fas fa-image text-4xl mb-2"></i>
              <p>{{ t('files.previewNotAvailable === isPDF(file.type)' class === bg-gray-50 rounded-lg p-4">
            <div  class === flex items-center justify-center py-8'>
              <div class === text-center=fas fa-file-pdf text-4xl text-red-600 mb-2></i>
                <p  class === text-gray-700'>{{ t('files.pdfDocument === openInNewTab=mt-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors=bg-gray-50 rounded-lg p-4'>
            <div class === flex items-center justify-center py-8">
              <div  class === text-center=getFileIcon(file.type)' class === text-4xl text-gray-500 mb-2></i>
                <p  class === text-gray-700'>{{ getFileTypeDescription(file.type) }}</p>
                <button 
                  @click="downloadFile=mt-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors=fas fa-download mr-2'></i>
                  {{ t('files.download(grid grid-cols-1 md:grid-cols-2 gap-6 mb-6"">
          <!-- Informations générales -->
          <div>
            <h 4 class === text-md font-medium text-gray-900 mb-3'>{{ t('files.generalInfo === space-y-3>
              <div  class class === flex justify-between=text-sm text-gray-600'>{{ t('files.fileName === text-sm font-medium text-gray-900>{{ file.name }}</div>
              </div>
              <div  class class="flex justify-between=text-sm text-gray-600'>{{ t('files.fileSize === text-sm font-medium text-gray-900>{{ formatFileSize(file.size) }}</div>
              </div>
              <div  class class="flex justify-between=text-sm text-gray-600'>{{ t('files.fileType === text-sm font-medium text-gray-900>{{ getFileTypeDescription(file.type) }}</div>
              </div>
              <div  class class="flex justify-between=text-sm text-gray-600'>{{ t('files.uploadedBy="text-sm font-medium text-gray-900>{{ file.uploaded_by?.name || t('common.unknown="flex justify-between=text-sm text-gray-600'>{{ t('files.uploadDate="text-sm font-medium text-gray-900">{{ formatDate(file.created_at) }}</div>
              </div>
              <div  v-if="file.updated_at !== file.created_at=flex justify-between class=text-sm text-gray-600'>{{ t('files.lastModified === text-sm font-medium text-gray-900>{{ formatDate(file.updated_at) }}</div>
              </div>
            </div>
          </div>

          <!-- Métadonnées -->
          <div>
            <h 4 class="text-md font-medium text-gray-900 mb-3'>{{ t('files.metadata === space-y-3>
              <div>
                <span  class === text-sm text-gray-600'>{{ t('files.folder === text-sm font-medium text-gray-900 ml-2>
                  {{ file.folder?.name || t('files.rootFolder === text-sm text-gray-600'>{{ t('files.tags === mt-1">
                  <div  v-if === file.tags && file.tags.length &gt; 0' class === flex flex-wrap gap-1>
                    <span 
                      v-for === tag in file.tags=tag=inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800'
                    >
                      {{ tag }}
                    </span>
                  </div>
                  <span v-else class="text-sm text-gray-500>{{ t('files.noTags="text-sm text-gray-600'>{{ t('files.permissions="mt-1 space-y-1">
                  <div  class="flex items-center text-sm=fas fa-eye w-4 mr-2 text-gray-500'></i>
                    <span class="text-gray-700>{{ file.is_public ? t('files.publicAccess="flex items-center text-sm=fas fa-download w-4 mr-2 text-gray-500'></i>
                    <span class="text-gray-700">{{ file.allow_download ? t('files.downloadAllowed="file.stats=mb-6'>
          <h4 class="text-md font-medium text-gray-900 mb-3">{{ t('files.usageStats="grid grid-cols-1 md:grid-cols-4 gap-4'>
            <div class class="bg-blue-50 rounded-lg p-4 text-center=text-2xl font-bold text-blue-600">{{ file.stats.views || 0 }}</div>
              <div  class class="text-sm text-blue-800'>{{ t('files.views === bg-green-50 rounded-lg p-4 text-center=text-2xl font-bold text-green-600>{{ file.stats.downloads || 0 }}</div>
              <div  class class="text-sm text-green-800'>{{ t('files.downloads === bg-purple-50 rounded-lg p-4 text-center=text-2xl font-bold text-purple-600>{{ file.stats.shares || 0 }}</div>
              <div  class class="text-sm text-purple-800'>{{ t('files.shares === bg-orange-50 rounded-lg p-4 text-center=text-2xl font-bold text-orange-600>{{ file.stats.comments || 0 }}</div>
              <div  class="text-sm text-orange-800'>{{ t('files.comments === file.versions && file.versions.length &gt; 1 class === mb-6'>
          <h4 class === text-md font-medium text-gray-900 mb-3">{{ t('files.versionHistory === space-y-2 max-h-32 overflow-y-auto=version in file.versions='version.id === flex items-center justify-between p-2 bg-gray-50 rounded-lg=flex items-center space-x-3">
                <span  class class === text-sm font-medium text-gray-900'>v{{ version.version }}</span>
                <span class class="text-sm text-gray-600>{{ formatDate(version.created_at) }}</span>
                <span  class class="text-sm text-gray-600'>{{ version.uploaded_by?.name }}</span>
              </div>
              <div class="flex items-center space-x-2>
                <button  
                  v-if="version.is_current=text-xs px-2 py-1 bg-green-100 text-green-800 rounded-full=downloadVersion(version)'
                  class="text-blue-600 hover:text-blue-800
                >
                  <i  class=""fas fa-download=flex justify-between items-center pt-4 border-t border-gray-200'>
        <div class="flex space-x-3>
          <button  
            @click="downloadFile=flex items-center space-x-2 px-3 py-2 text-sm text-blue-700 bg-blue-100 hover:bg-blue-200 rounded-lg transition-colors='fas fa-download(shareFile=flex items-center space-x-2 px-3 py-2 text-sm text-green-700 bg-green-100 hover:bg-green-200 rounded-lg transition-colors=""fas fa-share-alt='canEdit=editFile="flex items-center space-x-2 px-3 py-2 text-sm text-orange-700 bg-orange-100 hover:bg-orange-200 rounded-lg transition-colors="fas fa-edit=flex space-x-3'>
          <button
            v-if=""canDelete=deleteFile=px-4 py-2 text-sm font-medium text-red-700 bg-red-100 border border-red-300 rounded-md hover:bg-red-200
          >
            {{ t('files.delete="closeModal=px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
          >
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
    file: {
      type: Object,
      required: true
    },
    projectId: {
      type: [String, Number],
      required: true
    }
  },
  emits: ['close', 'share', 'edit', 'delete'],
  setup(props, { emit }) {
    const { t } = useTranslation()

    const { success, error: showError, confirm } = useNotifications()
    const { t } = useTranslation()
    const { user } = useAuth()
    
    const imageError = ref(false)
    
    const canEdit = computed(() => {
      return props.file.uploaded_by?.id === user.value?.id || user.value?.role === 'admin'
    })
    
    const canDelete = computed(() => {
      return props.file.uploaded_by?.id === user.value?.id || user.value?.role === 'admin'
    })
    
    const closeModal = () => {
      emit('close')
    }
    
    const formatFileSize = (bytes) => {
      if (bytes === 0) return '0 Bytes'
      const k = 1024
      const sizes = ['Bytes', 'KB', 'MB', 'GB']
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
    
    const isImage = (type) => {
      return type.startsWith('image/')
    }
    
    const isPDF = (type) => {
      return type.includes('pdf')
    }
    
    const getFileIcon = (type) => {
      if (type.startsWith('image/')) return 'fas fa-image'
      if (type.includes('pdf')) return 'fas fa-file-pdf'
      if (type.includes('word') || type.includes('document')) return 'fas fa-file-word'
      if (type.includes('excel') || type.includes('spreadsheet')) return 'fas fa-file-excel'
      if (type.includes('powerpoint') || type.includes('presentation')) return 'fas fa-file-powerpoint'
      if (type.includes('zip') || type.includes('rar')) return 'fas fa-file-archive'
      if (type.includes('text')) return 'fas fa-file-alt'
      return 'fas fa-file'
    }
    
    const getFileColorClass = (type) => {
      if (type.startsWith('image/')) return 'bg-green-600'
      if (type.includes('pdf')) return 'bg-red-600'
      if (type.includes('word') || type.includes('document')) return 'bg-blue-600'
      if (type.includes('excel') || type.includes('spreadsheet')) return 'bg-green-600'
      if (type.includes('powerpoint') || type.includes('presentation')) return 'bg-orange-600'
      if (type.includes('zip') || type.includes('rar')) return 'bg-purple-600'
      return 'bg-gray-600'
    }
    
    const getFileTypeDescription = (type) => {
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
        const response = await projectManagementService.downloadFile(props.file.id)
        if (response.success) {
          // Créer un lien de téléchargement
          const link = document.createElement('a')
          link.href = response.data.url
          link.download = props.file.name
          document.body.appendChild(link)
          link.click()
          document.body.removeChild(link)
          
          success(t('files.downloadStarted'))
        }
      } catch (err) {
        showError(t('files.downloadError'))
      }
    }
    
    const downloadVersion = async (version) => {
      try {
        const response = await projectManagementService.downloadFileVersion(version.id)
        if (response.success) {
          const link = document.createElement('a')
          link.href = response.data.url
          link.download = `${props.file.name} (v${version.version})`
          document.body.appendChild(link)
          link.click()
          document.body.removeChild(link)
          
          success(t('files.downloadStarted'))
        }
      } catch (err) {
        showError(t('files.downloadError'))
      }
    }
    
    const openInNewTab = () => {
      window.open(props.file.url, '_blank')
    }
    
    const shareFile = () => {
      emit('share', props.file)
    }
    
    const editFile = () => {
      emit('edit', props.file)
    }
    
    const deleteFile = async () => {
      const confirmed = await confirm(
        t('files.confirmDelete'),
        t('files.confirmDeleteMessage', { name: props.file.name })
      )
      
      if (confirmed) {
        try {
          const response = await projectManagementService.deleteFile(props.file.id)
          if (response.success) {
            success(t('files.fileDeleted'))
            emit('delete', props.file)
            closeModal()
          }
        } catch (err) {
          showError(t('files.deleteError'))
        }
      }
    }
    
    return {
      imageError,
      canEdit,
      canDelete,
      closeModal,
      formatFileSize,
      formatDate,
      isImage,
      isPDF,
      getFileIcon,
      getFileColorClass,
      getFileTypeDescription,
      downloadFile,
      downloadVersion,
      openInNewTab,
      shareFile,
      editFile,
      deleteFile,
      t
    }
  }
}
</script>