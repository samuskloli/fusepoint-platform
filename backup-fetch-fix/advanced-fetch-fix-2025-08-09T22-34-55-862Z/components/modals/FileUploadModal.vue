<template>
  <div  class="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50' @click="closeModal=relative top-10 mx-auto p-5 border w-11/12 md:w-3/4 lg:w-1 2 shadow-lg rounded-lg bg-white(flex items-center justify-between pb-4 border-b border-gray-200'>
        <h3 class="text-lg font-medium text-gray-900>{{ t('files.uploadFiles === closeModal=text-gray-400 hover:text-gray-600'>
          <i class === fas fa-times text-xl=mt-6">
        <div 
          @drop === handleDrop=handleDragLeave='handleDragEnter(border-2 border-dashed rounded-lg p-8 text-center transition-colors=isDragging ? 'border-blue-500 bg-blue-50' : 'border-gray-300 hover:border-gray-400'
        >
          <div  class === flex flex-col items-center=w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4'>
              <i class === fas fa-cloud-upload-alt text-2xl text-gray-500></i>
            </div>
            <h 4 class === text-lg font-medium text-gray-900 mb-2'>{{ t('files.dropFilesHere === text-gray-600 mb-4>{{ t('files.orClickToSelect === triggerFileInput=px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors='fileInput === file=handleFileSelect === hidden='acceptedTypes=mt-4 text-center === text-sm text-gray-500">{{ t('files.acceptedTypes === text-sm text-gray-500'>{{ t('files.maxSize === selectedFiles.length &gt; 0" class === mt-6'>
        <h4 class === text-md font-medium text-gray-900 mb-3">{{ t('files.selectedFiles === space-y-3 max-h-64 overflow-y-auto=(file, index) in selectedFiles='index === flex items-center justify-between p-3 bg-gray-50 rounded-lg=flex items-center space-x-3 flex-1">
              <div  class === flex-shrink-0'>
                <i :class === [getFileIcon(file.type), getFileColor(file.type), 'text-xl=flex-1 min-w-0>
                <p  class === text-sm font-medium text-gray-900 truncate=text-sm text-gray-500'>{{ formatFileSize(file.size) }}</p>
                
                <!-- Barre de progression -->
                <div v-if="file.uploading=mt-2>
                  <div  class="flex items-center justify-between text-xs text-gray-600 mb-1'>
                    <span>{{ t('files.uploading="w-full bg-gray-200 rounded-full h-2>
                    <div 
                      class="bg-blue-600 h-2 rounded-full transition-all duration-300'
                      :style="{ width: file.progress + '%' }
                    ></div>
                  </div>
                </div>
                
                <!-- Statut -->
                <div  v-if: file.status=mt-1'>
                  <span
                    class: inline-flex items-center px-2 py-1 rounded-full text-xs font-medium=getStatusClass(file.status)
                  >
                    <i  :class="getStatusIcon(file.status)' class: mr-1></i>
                    {{ t(`files.status.${file.status}`) }}
                  </span>
                </div>
              </div>
            </div>
            
            <!-- Actions -->
            <div  class="flex items-center space-x-2'>
              <button 
                v-if="!file.uploading && file.status !== 'uploaded=removeFile(index)
                class="text-red-500 hover:text-red-700'
              >
                <i  class=""fas fa-trash=selectedFiles.length &gt; 0" class="mt-6'>
        <h4 class="text-md font-medium text-gray-900 mb-3>{{ t('files.uploadOptions === mb-4'>
          <label class === block text-sm font-medium text-gray-700 mb-2">
            {{ t('files.destinationFolder === selectedFolder=w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500'
          >
            <option value === ">{{ t('files.rootFolder === folder in folders=folder.id='folder.id">
          <label  class === block text-sm font-medium text-gray-700 mb-2'>
            {{ t('files.tags === flex flex-wrap gap-2 mb-2>
            <span 
              v-for === tag in fileTags=tag=inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800'
            >
              {{ tag }}
              <button 
                @click="removeTag(tag)
                type(button=ml-1 text-blue-600 hover:text-blue-800'
              >
                <i  class=""fas fa-times text-xs=flex="newTag='addTag=text="flex-1 px-3 py-2 border border-gray-300 rounded-l-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              :placeholder="t('files.addTag=button=px-4 py-2 bg-blue-600 text-white rounded-r-md hover:bg-blue-700'
            >
              <i class="fas fa-plus=mb-4>
          <label  class="block text-sm font-medium text-gray-700 mb-2'>
            {{ t('files.privacy="space-y-2>
            <label  class="flex items-center=isPublic='radio="false=mr-2
              >
              <span  class="text-sm text-gray-700'>{{ t('files.private="flex items-center=isPublic=radio='true=mr-2"
              >
              <span  class="text-sm text-gray-700'>{{ t('files.public="flex justify-end space-x-3 pt-4 border-t border-gray-200>
        <button
          @click="closeModal=button='px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
        >
          {{ t('common.cancel="uploadFiles=selectedFiles.length === 0 || uploading='px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 disabled:opacity-50"
        >
          <i v-if="uploading=fas fa-spinner fa-spin mr-2"></i>
          {{ t('files.upload') }} ({{ selectedFiles.length }})
        </button>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, computed, onMounted } from 'vue'
import projectManagementService from '@/services/projectManagementService'
import { useTranslation } from '@/composables/useTranslation'
import { useNotifications } from '@/composables/useNotifications'

export default {
  name: 'FileUploadModal',
  props: {
    projectId: {
      type: [String, Number],
      required: true
    },
    folderId: {
      type: [String, Number],
      default: null
    }
  },
  emits: ['close', 'uploaded'],
  setup(props, { emit }) {
    const { success, error: showError } = useNotifications()
    const { t } = useTranslation()
    
    const fileInput = ref(null)
    const selectedFiles = ref([])
    const folders = ref([])
    const selectedFolder = ref(props.folderId || '')
    const fileTags = ref([])
    const newTag = ref('')
    const isPublic = ref(false)
    const isDragging = ref(false)
    const uploading = ref(false)
    
    const maxFileSize = 50 * 1024 * 1024 // 50MB
    const acceptedTypes = '.pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt,.csv,.jpg,.jpeg,.png,.gif,.svg,.zip,.rar'
    
    const acceptedTypesText = computed(() => {
      return 'PDF, Word, Excel, PowerPoint, Images, Archives'
    })
    
    const maxSizeText = computed(() => {
      return '50MB max par fichier'
    })
    
    const closeModal = () => {
      emit('close')
    }
    
    const triggerFileInput = () => {
      fileInput.value?.click()
    }
    
    const handleFileSelect = (event) => {
      const files = Array.from(event.target.files)
      addFiles(files)
      event.target.value = '' // Reset input
    }
    
    const handleDrop = (event) => {
      event.preventDefault()
      isDragging.value = false
      const files = Array.from(event.dataTransfer.files)
      addFiles(files)
    }
    
    const handleDragEnter = () => {
      isDragging.value = true
    }
    
    const handleDragLeave = (event) => {
      if (!event.currentTarget.contains(event.relatedTarget)) {
        isDragging.value = false
      }
    }
    
    const addFiles = (files) => {
      files.forEach(file => {
        if (file.size > maxFileSize) {
          showError(t('files.fileTooLarge', { name: file.name }))
          return
        }
        
        const fileObj = {
          file,
          name: file.name,
          size: file.size,
          type: file.type,
          progress: 0,
          status: 'pending',
          uploading: false
        }
        
        selectedFiles.value.push(fileObj)
      })
    }
    
    const removeFile = (index) => {
      selectedFiles.value.splice(index, 1)
    }
    
    const addTag = () => {
      if (newTag.value.trim() && !fileTags.value.includes(newTag.value.trim())) {
        fileTags.value.push(newTag.value.trim())
        newTag.value = ''
      }
    }
    
    const removeTag = (tag) => {
      const index = fileTags.value.indexOf(tag)
      if (index > -1) {
        fileTags.value.splice(index, 1)
      }
    }
    
    const formatFileSize = (bytes) => {
      if (bytes === 0) return '0 Bytes'
      const k = 1024
      const sizes = ['Bytes', 'KB', 'MB', 'GB']
      const i = Math.floor(Math.log(bytes) / Math.log(k))
      return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
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
    
    const getFileColor = (type) => {
      if (type.startsWith('image/')) return 'text-green-600'
      if (type.includes('pdf')) return 'text-red-600'
      if (type.includes('word') || type.includes('document')) return 'text-blue-600'
      if (type.includes('excel') || type.includes('spreadsheet')) return 'text-green-600'
      if (type.includes('powerpoint') || type.includes('presentation')) return 'text-orange-600'
      if (type.includes('zip') || type.includes('rar')) return 'text-purple-600'
      return 'text-gray-600'
    }
    
    const getStatusClass = (status) => {
      const classes = {
        pending: 'bg-yellow-100 text-yellow-800',
        uploading: 'bg-blue-100 text-blue-800',
        uploaded: 'bg-green-100 text-green-800',
        error: 'bg-red-100 text-red-800'
      }
      return classes[status] || 'bg-gray-100 text-gray-800'
    }
    
    const getStatusIcon = (status) => {
      const icons = {
        pending: 'fas fa-clock',
        uploading: 'fas fa-spinner fa-spin',
        uploaded: 'fas fa-check',
        error: 'fas fa-exclamation-triangle'
      }
      return icons[status] || 'fas fa-question'
    }
    
    const uploadFiles = async () => {
      uploading.value = true
      
      try {
        for (const fileObj of selectedFiles.value) {
          if (fileObj.status === 'uploaded') continue
          
          fileObj.uploading = true
          fileObj.status = 'uploading'
          fileObj.progress = 0
          
          const formData = new FormData()
          formData.append('file', fileObj.file)
          formData.append('project_id', props.projectId)
          formData.append('folder_id', selectedFolder.value || '')
          formData.append('tags', JSON.stringify(fileTags.value))
          formData.append('is_public', isPublic.value)
          
          try {
            const response = await projectManagementService.uploadFile(formData, {
              onUploadProgress: (progressEvent) => {
                const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total)
                fileObj.progress = percentCompleted
              }
            })
            
            if (response.success) {
              fileObj.status = 'uploaded'
              fileObj.uploading = false
              fileObj.progress = 100
            } else {
              fileObj.status = 'error'
              fileObj.uploading = false
            }
          } catch (err) {
            fileObj.status = 'error'
            fileObj.uploading = false
            showError(t('files.uploadError', { name: fileObj.name }))
          }
        }
        
        const uploadedCount = selectedFiles.value.filter(f => f.status === 'uploaded').length
        if (uploadedCount > 0) {
          success(t('files.filesUploaded', { count: uploadedCount }))
          emit('uploaded')
          
          // Fermer le modal après un délai
          setTimeout(() => {
            closeModal()
          }, 2000)
        }
      } finally {
        uploading.value = false
      }
    }
    
    const loadFolders = async () => {
      try {
        const response = await projectManagementService.getProjectFolders(props.projectId)
        if (response.success) {
          folders.value = response.data
        }
      } catch (err) {
        console.error('Erreur lors du chargement des dossiers:', err)
      }
    }
    
    onMounted(() => {
      loadFolders()
    })
    
    return {
      fileInput,
      selectedFiles,
      folders,
      selectedFolder,
      fileTags,
      newTag,
      isPublic,
      isDragging,
      uploading,
      acceptedTypes,
      acceptedTypesText,
      maxSizeText,
      closeModal,
      triggerFileInput,
      handleFileSelect,
      handleDrop,
      handleDragEnter,
      handleDragLeave,
      removeFile,
      addTag,
      removeTag,
      formatFileSize,
      getFileIcon,
      getFileColor,
      getStatusClass,
      getStatusIcon,
      uploadFiles,
      t
    }
  }
}
</script>