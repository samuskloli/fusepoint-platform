<template>
  <BaseWidget 
    :widget="widgetConfig=loading=error='showConfigModal = true=toggleWidget="loadFiles="files-widget=files-toolbar='toolbar-left="view-toggle=viewMode = 'grid="view-btn'viewMode = 'list="view-btn={ active: viewMode === 'list="t('widgets.files.listView='search-box=fas fa-search search-icon="searchQuery="text=t('widgets.files.searchFiles='toolbar-right="sort-dropdown=sortBy="sort-select='name=date="size="type=sortOrder = sortOrder === 'asc='sort-order-btn="t('widgets.files.toggleSortOrder=sortOrder === 'asc="showUploadModal = true='upload-btn=t('widgets.files.uploadFiles="file-filters="activeFilter = 'all=filter-btn='{ active: activeFilter === 'all="type in fileTypes=type.key="activeFilter = type.key='filter-btn={ active: activeFilter === type.key }
        >
          <i  :class="type.icon=mr-1'></i>
          {{ type.label }} ({{ getFileCountByType(type.key) }})
        </button>
      </div>
      
      <!-- Zone de drag & drop -->
      <div 
        v-if: isDragOver=drop-zone=handleDrop === isDragOver = false=drop-content=fas fa-cloud-upload-alt text-4xl text-blue-500 mb-3'></i>
          <h4 class="text-lg font-semibold text-gray-900 mb-2">{{ t('widgets.files.dropFiles="text-gray-600'>{{ t('widgets.files.dropFilesDescription="files-container=viewMode === 'grid="files-grid'file-card="selectFile(file)"
            @dblclick="openFile(file)'
            :class({ selected: selectedFiles.includes(file.id) }"
          >
            <div  class="file-preview=isImageFile(file)' class="image-preview=file.thumbnail || file.url="file.name='preview-img=file-icon="getFileIcon(file.type)" class="text-3xl=file-overlay='file-actions="downloadFile(file)"
                    class="action-btn=t('widgets.files.download='shareFile(file)"
                    class="action-btn=t('widgets.files.share='deleteFile(file)"
                    class="action-btn delete=t('widgets.files.delete='file-info="file-name=file.name="file-meta='file-size=file-date="filteredFiles.length === 0" class="no-files=fas fa-folder-open text-gray-400 text-4xl mb-3'></i>
            <h5 class="text-gray-600 mb-2>{{ t('widgets.files.noFiles="text-gray-500 text-sm mb-4'>{{ t('widgets.files.noFilesDescription="showUploadModal = true=upload-first-btn="fas fa-upload mr-2'></i>
              {{ t('widgets.files.uploadFirst="files-list=list-header="header-cell name='header-cell size=header-cell type="header-cell date"file in filteredFiles="file.id=list-row='selectFile(file)"
              @dblclick="openFile(file)'
              :class({ selected: selectedFiles.includes(file.id) }"
            >
              <div  class="list-cell name=file-name-cell getFileIcon(file.type)' class="file-icon-small mr-2></i>
                  <span  class="file-name-text=file.name='list-cell size="list-cell type=type-badge class="getTypeClass(file.type)'>
                  {{ getFileTypeLabel(file.type) }}
                </span>
              </div>
              
              <div class="list-cell date=list-cell actions action-buttons=downloadFile(file)'
                    class="action-btn-small=t('widgets.files.download="shareFile(file)'
                    class="action-btn-small=t('widgets.files.share="showFileDetails(file)'
                    class="action-btn-small=t('widgets.files.details="deleteFile(file)'
                    class="action-btn-small delete=t('widgets.files.delete="filteredFiles.length === 0' class="no-files-list=no-files-content="fas fa-folder-open text-gray-400 text-2xl mb-2'></i>
              <span class="text-gray-600">{{ t('widgets.files.noFilesInFilter="files-stats=files.length &gt; 0'>
        <div  class="stats-grid=stat-item stat-icon="fas fa-file text-blue-500'></i>
            </div>
            <div class="stat-content=stat-value stat-label=stat-item=stat-icon='fas fa-hdd text-green-500"></i>
            </div>
            <div  class="stat-content=stat-value stat-label='stat-item=stat-icon="fas fa-clock text-purple-500></i>
            </div>
            <div  class="stat-content=stat-value stat-label='selectedFiles.length &gt; 0" class="bulk-actions=bulk-info='selected-count="bulk-buttons=downloadSelectedFiles="bulk-btn='fas fa-download mr-2></i>
            {{ t('widgets.files.downloadSelected="deleteSelectedFiles=bulk-btn delete='fas fa-trash mr-2"></i>
            {{ t('widgets.files.deleteSelected="clearSelection=bulk-btn cancel='showUploadModal="projectId=showUploadModal = false="handleFileUploaded='showDetailsModal=selectedFile="showDetailsModal = false="handleFileUpdated=handleFileDeleted='showShareModal="selectedFile=showShareModal = false="showConfigModal='widgetConfig=configOptions="showConfigModal = false="updateConfig"
    />
  </BaseWidget>
</template>

<script>
import { ref, computed, onMounted, watch, onUnmounted } from 'vue'
import BaseWidget from './BaseWidget.vue'
import FileUploadModal from '../modals/FileUploadModal.vue'
import FileDetailsModal from '../modals/FileDetailsModal.vue'
import FileShareModal from '../modals/FileShareModal.vue'
import WidgetConfigModal from '../modals/WidgetConfigModal.vue'
import projectManagementService from '@/services/projectManagementService'
import { useTranslation } from '@/composables/useTranslation'
import { useNotifications } from '@/composables/useNotifications'

export default {
  name: 'FilesWidget',
  components: {
    BaseWidget,
    FileUploadModal,
    FileDetailsModal,
    FileShareModal,
    WidgetConfigModal
  },
  props: {
    projectId: {
      type: [String, Number],
      required: true
    },
    widgetData: {
      type: Object,
      default: () => ({})
    }
  },
  emits: ['update-widget'],
  setup(props, { emit }) {
    const { success, error: showError } = useNotifications()
    const { t } = useTranslation()
    
    // État réactif
    const loading = ref(false)
    const error = ref(null)
    const files = ref([])
    const selectedFiles = ref([])
    const selectedFile = ref(null)
    const viewMode = ref('grid')
    const searchQuery = ref('')
    const sortBy = ref('name')
    const sortOrder = ref('asc')
    const activeFilter = ref('all')
    const isDragOver = ref(false)
    const showUploadModal = ref(false)
    const showDetailsModal = ref(false)
    const showShareModal = ref(false)
    const showConfigModal = ref(false)
    
    // Configuration du widget
    const widgetConfig = ref({
      id: 'files',
      name: 'Fichiers',
      icon: 'fas fa-folder',
      titleKey: 'widgets.files.title',
      isEnabled: true,
      allowUpload: true,
      allowDownload: true,
      allowShare: true,
      allowDelete: true,
      maxFileSize: 10485760, // 10MB
      allowedTypes: ['image', 'document', 'video', 'audio', 'archive'],
      showThumbnails: true,
      autoRefresh: true,
      ...props.widgetData
    })
    
    // Options de configuration
    const configOptions = ref([
      {
        key: 'allowUpload',
        type: 'boolean',
        label: 'Autoriser l\'upload',
        default: true
      },
      {
        key: 'allowDownload',
        type: 'boolean',
        label: 'Autoriser le téléchargement',
        default: true
      },
      {
        key: 'allowShare',
        type: 'boolean',
        label: 'Autoriser le partage',
        default: true
      },
      {
        key: 'allowDelete',
        type: 'boolean',
        label: 'Autoriser la suppression',
        default: true
      },
      {
        key: 'maxFileSize',
        type: 'number',
        label: 'Taille max (bytes)',
        default: 10485760,
        min: 1048576,
        max: 104857600
      },
      {
        key: 'showThumbnails',
        type: 'boolean',
        label: 'Afficher les miniatures',
        default: true
      },
      {
        key: 'autoRefresh',
        type: 'boolean',
        label: 'Actualisation automatique',
        default: true
      }
    ])
    
    // Types de fichiers
    const fileTypes = ref([
      {
        key: 'image',
        label: t('widgets.files.types.images'),
        icon: 'fas fa-image',
        extensions: ['jpg', 'jpeg', 'png', 'gif', 'bmp', 'svg', 'webp']
      },
      {
        key: 'document',
        label: t('widgets.files.types.documents'),
        icon: 'fas fa-file-alt',
        extensions: ['pdf', 'doc', 'docx', 'xls', 'xlsx', 'ppt', 'pptx', 'txt', 'rtf']
      },
      {
        key: 'video',
        label: t('widgets.files.types.videos'),
        icon: 'fas fa-video',
        extensions: ['mp4', 'avi', 'mov', 'wmv', 'flv', 'webm', 'mkv']
      },
      {
        key: 'audio',
        label: t('widgets.files.types.audio'),
        icon: 'fas fa-music',
        extensions: ['mp3', 'wav', 'flac', 'aac', 'ogg', 'wma']
      },
      {
        key: 'archive',
        label: t('widgets.files.types.archives'),
        icon: 'fas fa-file-archive',
        extensions: ['zip', 'rar', '7z', 'tar', 'gz', 'bz2']
      }
    ])
    
    // Propriétés calculées
    const filteredFiles = computed(() => {
      let filtered = [...files.value]
      
      // Filtrer par recherche
      if (searchQuery.value) {
        const query = searchQuery.value.toLowerCase()
        filtered = filtered.filter(file => 
          file.name.toLowerCase().includes(query) ||
          file.description?.toLowerCase().includes(query)
        )
      }
      
      // Filtrer par type
      if (activeFilter.value !== 'all') {
        const typeConfig = fileTypes.value.find(t => t.key === activeFilter.value)
        if (typeConfig) {
          filtered = filtered.filter(file => {
            const extension = file.name.split('.').pop()?.toLowerCase()
            return typeConfig.extensions.includes(extension)
          })
        }
      }
      
      // Trier
      filtered.sort((a, b) => {
        let aValue, bValue
        
        switch (sortBy.value) {
          case 'name':
            aValue = a.name.toLowerCase()
            bValue = b.name.toLowerCase()
            break
          case 'date':
            aValue = new Date(a.created_at)
            bValue = new Date(b.created_at)
            break
          case 'size':
            aValue = a.size
            bValue = b.size
            break
          case 'type':
            aValue = a.name.split('.').pop()?.toLowerCase() || ''
            bValue = b.name.split('.').pop()?.toLowerCase() || ''
            break
          default:
            return 0
        }
        
        if (aValue < bValue) return sortOrder.value === 'asc' ? -1 : 1
        if (aValue > bValue) return sortOrder.value === 'asc' ? 1 : -1
        return 0
      })
      
      return filtered
    })
    
    const totalSize = computed(() => {
      return files.value.reduce((total, file) => total + file.size, 0)
    })
    
    const lastUpload = computed(() => {
      if (files.value.length === 0) return null
      return Math.max(...files.value.map(f => new Date(f.created_at)))
    })
    
    // Méthodes
    const loadFiles = async () => {
      loading.value = true
      error.value = null
      
      try {
        const result = await projectManagementService.getProjectFiles(props.projectId)
        
        if (result.success) {
          files.value = result.data
        }
      } catch (err) {
        error.value = t('errors.loadingFailed')
      } finally {
        loading.value = false
      }
    }
    
    const selectFile = (file) => {
      const index = selectedFiles.value.indexOf(file.id)
      if (index > -1) {
        selectedFiles.value.splice(index, 1)
      } else {
        selectedFiles.value.push(file.id)
      }
    }
    
    const clearSelection = () => {
      selectedFiles.value = []
    }
    
    const openFile = (file) => {
      if (isImageFile(file) || file.type === 'pdf') {
        // Ouvrir dans une nouvelle fenêtre
        window.open(file.url, '_blank')
      } else {
        downloadFile(file)
      }
    }
    
    const downloadFile = async (file) => {
      if (!widgetConfig.value.allowDownload) {
        showError(t('widgets.files.downloadNotAllowed'))
        return
      }
      
      try {
        const link = document.createElement('a')
        link.href = file.url
        link.download = file.name
        link.click()
        
        success(t('widgets.files.downloadStarted'))
      } catch (err) {
        showError(t('widgets.files.downloadFailed'))
      }
    }
    
    const downloadSelectedFiles = async () => {
      const selectedFileObjects = files.value.filter(f => selectedFiles.value.includes(f.id))
      
      for (const file of selectedFileObjects) {
        await downloadFile(file)
      }
      
      clearSelection()
    }
    
    const shareFile = (file) => {
      if (!widgetConfig.value.allowShare) {
        showError(t('widgets.files.shareNotAllowed'))
        return
      }
      
      selectedFile.value = file
      showShareModal.value = true
    }
    
    const showFileDetails = (file) => {
      selectedFile.value = file
      showDetailsModal.value = true
    }
    
    const deleteFile = async (file) => {
      if (!widgetConfig.value.allowDelete) {
        showError(t('widgets.files.deleteNotAllowed'))
        return
      }
      
      if (!confirm(t('widgets.files.confirmDelete', { name: file.name }))) {
        return
      }
      
      try {
        const result = await projectManagementService.deleteProjectFile(props.projectId, file.id)
        
        if (result.success) {
          files.value = files.value.filter(f => f.id !== file.id)
          selectedFiles.value = selectedFiles.value.filter(id => id !== file.id)
          success(t('widgets.files.fileDeleted'))
        }
      } catch (err) {
        showError(t('widgets.files.deleteFailed'))
      }
    }
    
    const deleteSelectedFiles = async () => {
      if (!confirm(t('widgets.files.confirmDeleteMultiple', { count: selectedFiles.value.length }))) {
        return
      }
      
      const selectedFileObjects = files.value.filter(f => selectedFiles.value.includes(f.id))
      
      for (const file of selectedFileObjects) {
        await deleteFile(file)
      }
    }
    
    const handleDrop = (event) => {
      isDragOver.value = false
      
      if (!widgetConfig.value.allowUpload) {
        showError(t('widgets.files.uploadNotAllowed'))
        return
      }
      
      const droppedFiles = Array.from(event.dataTransfer.files)
      
      // Valider les fichiers
      const validFiles = droppedFiles.filter(file => {
        if (file.size > widgetConfig.value.maxFileSize) {
          showError(t('widgets.files.fileTooLarge', { name: file.name }))
          return false
        }
        return true
      })
      
      if (validFiles.length > 0) {
        uploadFiles(validFiles)
      }
    }
    
    const uploadFiles = async (fileList) => {
      try {
        for (const file of fileList) {
          const formData = new FormData()
          formData.append('file', file)
          formData.append('project_id', props.projectId)
          
          const result = await projectManagementService.uploadProjectFile(formData)
          
          if (result.success) {
            files.value.push(result.data)
          }
        }
        
        success(t('widgets.files.filesUploaded', { count: fileList.length }))
      } catch (err) {
        showError(t('widgets.files.uploadFailed'))
      }
    }
    
    const handleFileUploaded = (newFile) => {
      files.value.push(newFile)
      showUploadModal.value = false
    }
    
    const handleFileUpdated = (updatedFile) => {
      const index = files.value.findIndex(f => f.id === updatedFile.id)
      if (index > -1) {
        files.value[index] = updatedFile
      }
      showDetailsModal.value = false
    }
    
    const handleFileDeleted = (deletedFileId) => {
      files.value = files.value.filter(f => f.id !== deletedFileId)
      selectedFiles.value = selectedFiles.value.filter(id => id !== deletedFileId)
      showDetailsModal.value = false
    }
    
    const getFileCountByType = (type) => {
      if (type === 'all') return files.value.length
      
      const typeConfig = fileTypes.value.find(t => t.key === type)
      if (!typeConfig) return 0
      
      return files.value.filter(file => {
        const extension = file.name.split('.').pop()?.toLowerCase()
        return typeConfig.extensions.includes(extension)
      }).length
    }
    
    const isImageFile = (file) => {
      const extension = file.name.split('.').pop()?.toLowerCase()
      const imageExtensions = ['jpg', 'jpeg', 'png', 'gif', 'bmp', 'svg', 'webp']
      return imageExtensions.includes(extension)
    }
    
    const getFileIcon = (type) => {
      const extension = type?.toLowerCase()
      
      const iconMap = {
        // Images
        jpg: 'fas fa-image text-green-500',
        jpeg: 'fas fa-image text-green-500',
        png: 'fas fa-image text-green-500',
        gif: 'fas fa-image text-green-500',
        svg: 'fas fa-image text-green-500',
        
        // Documents
        pdf: 'fas fa-file-pdf text-red-500',
        doc: 'fas fa-file-word text-blue-500',
        docx: 'fas fa-file-word text-blue-500',
        xls: 'fas fa-file-excel text-green-500',
        xlsx: 'fas fa-file-excel text-green-500',
        ppt: 'fas fa-file-powerpoint text-orange-500',
        pptx: 'fas fa-file-powerpoint text-orange-500',
        txt: 'fas fa-file-alt text-gray-500',
        
        // Vidéos
        mp4: 'fas fa-file-video text-purple-500',
        avi: 'fas fa-file-video text-purple-500',
        mov: 'fas fa-file-video text-purple-500',
        
        // Audio
        mp3: 'fas fa-file-audio text-pink-500',
        wav: 'fas fa-file-audio text-pink-500',
        
        // Archives
        zip: 'fas fa-file-archive text-yellow-500',
        rar: 'fas fa-file-archive text-yellow-500',
        '7z': 'fas fa-file-archive text-yellow-500'
      }
      
      return iconMap[extension] || 'fas fa-file text-gray-500'
    }
    
    const getFileTypeLabel = (type) => {
      const extension = type?.toLowerCase()
      return extension?.toUpperCase() || 'FILE'
    }
    
    const getTypeClass = (type) => {
      const extension = type?.toLowerCase()
      
      if (['jpg', 'jpeg', 'png', 'gif', 'svg'].includes(extension)) {
        return 'type-image'
      }
      if (['pdf', 'doc', 'docx', 'xls', 'xlsx', 'ppt', 'pptx'].includes(extension)) {
        return 'type-document'
      }
      if (['mp4', 'avi', 'mov'].includes(extension)) {
        return 'type-video'
      }
      if (['mp3', 'wav'].includes(extension)) {
        return 'type-audio'
      }
      if (['zip', 'rar', '7z'].includes(extension)) {
        return 'type-archive'
      }
      
      return 'type-other'
    }
    
    const formatFileSize = (bytes) => {
      if (bytes === 0) return '0 B'
      
      const k = 1024
      const sizes = ['B', 'KB', 'MB', 'GB']
      const i = Math.floor(Math.log(bytes) / Math.log(k))
      
      return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i]
    }
    
    const formatFileDate = (dateString) => {
      if (!dateString) return ''
      
      const date = new Date(dateString)
      const now = new Date()
      const diffMs = now - date
      const diffDays = Math.floor(diffMs / 86400000)
      
      if (diffDays === 0) {
        return t('widgets.files.today')
      } else if (diffDays === 1) {
        return t('widgets.files.yesterday')
      } else if (diffDays < 7) {
        return t('widgets.files.daysAgo', { count: diffDays })
      } else {
        return date.toLocaleDateString('fr-FR')
      }
    }
    
    const toggleWidget = () => {
      widgetConfig.value.isEnabled = !widgetConfig.value.isEnabled
      emit('update-widget', widgetConfig.value)
    }
    
    const updateConfig = (newConfig) => {
      widgetConfig.value = { ...widgetConfig.value, ...newConfig }
      emit('update-widget', widgetConfig.value)
      showConfigModal.value = false
    }
    
    // Gestion du drag & drop global
    const handleDragOver = (event) => {
      event.preventDefault()
      isDragOver.value = true
    }
    
    const handleDragLeave = (event) => {
      if (!event.relatedTarget || !event.currentTarget.contains(event.relatedTarget)) {
        isDragOver.value = false
      }
    }
    
    // Watchers
    watch(() => props.projectId, loadFiles, { immediate: true })
    
    // Auto-refresh
    let refreshInterval
    watch(() => widgetConfig.value.autoRefresh, (enabled) => {
      if (refreshInterval) {
        clearInterval(refreshInterval)
      }
      
      if (enabled) {
        refreshInterval = setInterval(loadFiles, 30000) // 30 secondes
      }
    }, { immediate: true })
    
    onMounted(() => {
      loadFiles()
      
      // Ajouter les listeners pour le drag & drop
      document.addEventListener('dragover', handleDragOver)
      document.addEventListener('dragleave', handleDragLeave)
    })
    
    onUnmounted(() => {
      if (refreshInterval) {
        clearInterval(refreshInterval)
      }
      
      document.removeEventListener('dragover', handleDragOver)
      document.removeEventListener('dragleave', handleDragLeave)
    })
    
    return {
      loading,
      error,
      files,
      selectedFiles,
      selectedFile,
      viewMode,
      searchQuery,
      sortBy,
      sortOrder,
      activeFilter,
      isDragOver,
      showUploadModal,
      showDetailsModal,
      showShareModal,
      showConfigModal,
      widgetConfig,
      configOptions,
      fileTypes,
      filteredFiles,
      totalSize,
      lastUpload,
      loadFiles,
      selectFile,
      clearSelection,
      openFile,
      downloadFile,
      downloadSelectedFiles,
      shareFile,
      showFileDetails,
      deleteFile,
      deleteSelectedFiles,
      handleDrop,
      handleFileUploaded,
      handleFileUpdated,
      handleFileDeleted,
      getFileCountByType,
      isImageFile,
      getFileIcon,
      getFileTypeLabel,
      getTypeClass,
      formatFileSize,
      formatFileDate,
      toggleWidget,
      updateConfig,
      t
    }
  }
}
</script>

<style scoped>
.files-widget {
  @apply space-y-4;
}

.files-toolbar {
  @apply flex items-center justify-between flex-wrap gap-3;
}

.toolbar-left {
  @apply flex items-center space-x-3;
}

.view-toggle {
  @apply flex items-center bg-gray-100 rounded-md p-1;
}

.view-btn {
  @apply p-2 rounded-md transition-colors;
}

.view-btn:not(.active) {
  @apply text-gray-500 hover:text-gray-700;
}

.view-btn.active {
  @apply bg-white text-blue-600 shadow-sm;
}

.search-box {
  @apply relative;
}

.search-icon {
  @apply absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400;
}

.search-input {
  @apply pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500;
}

.toolbar-right {
  @apply flex items-center space-x-2;
}

.sort-select {
  @apply px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500;
}

.sort-order-btn {
  @apply p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-md transition-colors;
}

.upload-btn {
  @apply px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 flex items-center transition-colors;
}

.file-filters {
  @apply flex items-center space-x-2 flex-wrap;
}

.filter-btn {
  @apply px-3 py-2 text-sm rounded-md transition-colors flex items-center;
}

.filter-btn:not(.active) {
  @apply text-gray-600 hover:text-gray-900 hover:bg-gray-100;
}

.filter-btn.active {
  @apply bg-blue-100 text-blue-700;
}

.drop-zone {
  @apply fixed inset-0 bg-blue-500 bg-opacity-20 flex items-center justify-center z-50;
}

.drop-content {
  @apply bg-white rounded-lg p-8 text-center shadow-lg;
}

.files-container {
  @apply min-h-64;
}

.files-grid {
  @apply grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4;
}

.file-card {
  @apply bg-white border rounded-lg overflow-hidden cursor-pointer transition-all hover:shadow-md;
}

.file-card.selected {
  @apply border-blue-500 bg-blue-50;
}

.file-preview {
  @apply relative aspect-square;
}

.image-preview {
  @apply w-full h-full;
}

.preview-img {
  @apply w-full h-full object-cover;
}

.file-icon {
  @apply w-full h-full flex items-center justify-center bg-gray-50;
}

.file-overlay {
  @apply absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity;
}

.file-actions {
  @apply flex items-center space-x-2;
}

.action-btn {
  @apply w-8 h-8 bg-white text-gray-700 rounded-md flex items-center justify-center hover:bg-gray-100 transition-colors;
}

.action-btn.delete {
  @apply bg-red-100 text-red-600 hover:bg-red-200;
}

.file-info {
  @apply p-3;
}

.file-name {
  @apply text-sm font-medium text-gray-900 truncate;
}

.file-meta {
  @apply flex items-center justify-between text-xs text-gray-500 mt-1;
}

.no-files {
  @apply col-span-full text-center py-12;
}

.upload-first-btn {
  @apply px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 flex items-center;
}

.files-list {
  @apply bg-white border rounded-lg overflow-hidden;
}

.list-header {
  @apply grid grid-cols-12 gap-4 p-3 bg-gray-50 border-b text-sm font-medium text-gray-700;
}

.list-body {
  @apply divide-y divide-gray-200;
}

.list-row {
  @apply grid grid-cols-12 gap-4 p-3 hover:bg-gray-50 cursor-pointer transition-colors;
}

.list-row.selected {
  @apply bg-blue-50;
}

.list-cell {
  @apply flex items-center;
}

.list-cell.name {
  @apply col-span-4;
}

.list-cell.size {
  @apply col-span-2;
}

.list-cell.type {
  @apply col-span-2;
}

.list-cell.date {
  @apply col-span-2;
}

.list-cell.actions {
  @apply col-span-2;
}

.header-cell.name {
  @apply col-span-4;
}

.header-cell.size {
  @apply col-span-2;
}

.header-cell.type {
  @apply col-span-2;
}

.header-cell.date {
  @apply col-span-2;
}

.header-cell.actions {
  @apply col-span-2;
}

.file-name-cell {
  @apply flex items-center;
}

.file-icon-small {
  @apply text-lg;
}

.file-name-text {
  @apply truncate;
}

.type-badge {
  @apply px-2 py-1 text-xs rounded-full font-medium;
}

.type-image {
  @apply bg-green-100 text-green-800;
}

.type-document {
  @apply bg-blue-100 text-blue-800;
}

.type-video {
  @apply bg-purple-100 text-purple-800;
}

.type-audio {
  @apply bg-pink-100 text-pink-800;
}

.type-archive {
  @apply bg-yellow-100 text-yellow-800;
}

.type-other {
  @apply bg-gray-100 text-gray-800;
}

.action-buttons {
  @apply flex items-center space-x-1;
}

.action-btn-small {
  @apply w-6 h-6 flex items-center justify-center text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded transition-colors;
}

.action-btn-small.delete {
  @apply hover:text-red-600 hover:bg-red-100;
}

.no-files-list {
  @apply col-span-12 py-8;
}

.no-files-content {
  @apply text-center;
}

.files-stats {
  @apply bg-gray-50 rounded-lg p-4;
}

.stats-grid {
  @apply grid grid-cols-3 gap-4;
}

.stat-item {
  @apply flex items-center space-x-3;
}

.stat-icon {
  @apply w-10 h-10 rounded-lg bg-white flex items-center justify-center text-lg;
}

.stat-content {
  @apply flex-1;
}

.stat-value {
  @apply text-lg font-bold text-gray-900;
}

.stat-label {
  @apply text-xs text-gray-600;
}

.bulk-actions {
  @apply fixed bottom-4 left-1/2 transform -translate-x-1/2 bg-white border rounded-lg shadow-lg p-4 flex items-center space-x-4 z-40;
}

.bulk-info {
  @apply text-sm text-gray-700;
}

.selected-count {
  @apply font-medium;
}

.bulk-buttons {
  @apply flex items-center space-x-2;
}

.bulk-btn {
  @apply px-3 py-2 text-sm rounded-md transition-colors flex items-center;
}

.bulk-btn:not(.delete):not(.cancel) {
  @apply bg-blue-600 text-white hover:bg-blue-700;
}

.bulk-btn.delete {
  @apply bg-red-600 text-white hover:bg-red-700;
}

.bulk-btn.cancel {
  @apply bg-gray-200 text-gray-700 hover:bg-gray-300;
}
</style>