<template>
  <div class="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50" @click.self="closeModal">
    <div class="relative top-10 mx-auto p-5 border w-11/12 md:w-3/4 lg:w-1/2 shadow-lg rounded-lg bg-white">
      <div class="flex items-center justify-between pb-4 border-b border-gray-200">
        <h3 class="text-lg font-medium text-gray-900">{{ t('files.uploadFiles') }}</h3>
        <button @click="closeModal" class="text-gray-400 hover:text-gray-600">
          <i class="fas fa-times text-xl"></i>
        </button>
      </div>
      
      <div class="mt-6">
        <div 
          @drop="handleDrop"
          @dragover.prevent
          @dragenter="handleDragEnter"
          @dragleave="handleDragLeave"
          :class="['border-2 border-dashed rounded-lg p-8 text-center transition-colors', isDragging ? 'border-blue-500 bg-blue-50' : 'border-gray-300 hover:border-gray-400']"
        >
          <div class="flex flex-col items-center">
            <div class="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
              <i class="fas fa-cloud-upload-alt text-2xl text-gray-500"></i>
            </div>
            <h4 class="text-lg font-medium text-gray-900 mb-2">{{ t('files.dropFilesHere') }}</h4>
            <p class="text-gray-600 mb-4">{{ t('files.orClickToSelect') }}</p>
            <button @click="triggerFileInput" class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
              {{ t('files.selectFiles') }}
            </button>
            <input 
              ref="fileInput" 
              type="file" 
              @change="handleFileSelect" 
              multiple 
              class="hidden" 
              :accept="acceptedTypes"
            >
          </div>
          <div class="mt-4 text-center">
            <p class="text-sm text-gray-500">{{ t('files.acceptedTypes') }}: {{ acceptedTypesText }}</p>
            <p class="text-sm text-gray-500">{{ t('files.maxSize') }}: {{ maxSizeText }}</p>
          </div>
        </div>
        
        <div v-if="selectedFiles.length > 0" class="mt-6">
           <h4 class="text-md font-medium text-gray-900 mb-3">{{ t('files.selectedFiles') }}</h4>
           <div class="space-y-3 max-h-64 overflow-y-auto">
             <div v-for="(file, index) in selectedFiles" :key="index" class="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
               <div class="flex items-center space-x-3 flex-1">
                 <div class="flex-shrink-0">
                   <i :class="[getFileIcon(file.type), getFileColor(file.type), 'text-xl']"></i>
                 </div>
                 <div class="flex-1 min-w-0">
                   <p class="text-sm font-medium text-gray-900 truncate">{{ file.name }}</p>
                   <p class="text-sm text-gray-500">{{ formatFileSize(file.size) }}</p>
                   
                   <!-- Barre de progression -->
                   <div v-if="file.uploading" class="mt-2">
                     <div class="flex items-center justify-between text-xs text-gray-600 mb-1">
                       <span>{{ t('files.uploading') }}</span>
                       <span>{{ file.progress }}%</span>
                     </div>
                     <div class="w-full bg-gray-200 rounded-full h-2">
                       <div 
                         class="bg-blue-600 h-2 rounded-full transition-all duration-300"
                         :style="{ width: file.progress + '%' }"
                       ></div>
                     </div>
                   </div>
                   
                   <!-- Statut -->
                   <div v-if="file.status" class="mt-1">
                     <span
                       :class="['inline-flex items-center px-2 py-1 rounded-full text-xs font-medium', getStatusClass(file.status)]"
                     >
                       <i :class="[getStatusIcon(file.status), 'mr-1']"></i>
                       {{ t(`files.status.${file.status}`) }}
                     </span>
                   </div>
                 </div>
               </div>
               
               <!-- Actions -->
               <div class="flex items-center space-x-2">
                 <button 
                   v-if="!file.uploading && file.status !== 'uploaded'"
                   @click="removeFile(index)"
                   class="text-red-500 hover:text-red-700"
                 >
                   <i class="fas fa-trash"></i>
                 </button>
               </div>
             </div>
        </div>
      </div>
    </div>
        
    <!-- Options d'upload -->
    <div v-if="selectedFiles.length > 0" class="mt-6">
      <h4 class="text-md font-medium text-gray-900 mb-3">{{ t('files.uploadOptions') }}</h4>
      <div class="space-y-4">
        <div class="mb-4">
           <label class="block text-sm font-medium text-gray-700 mb-2">
             {{ t('files.destinationFolder') }}
           </label>
           <select 
             v-model="selectedFolder"
             class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
           >
             <option value="">{{ t('files.rootFolder') }}</option>
             <option v-for="folder in folders" :key="folder.id" :value="folder.id">
               {{ folder.name }}
             </option>
           </select>
         </div>
         
         <div class="mb-4">
           <label class="block text-sm font-medium text-gray-700 mb-2">
             {{ t('files.tags') }}
           </label>
           <div class="flex flex-wrap gap-2 mb-2">
             <span 
               v-for="tag in fileTags" 
               :key="tag"
               class="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
             >
               {{ tag }}
               <button 
                 @click="removeTag(tag)"
                 type="button"
                 class="ml-1 text-blue-600 hover:text-blue-800"
               >
                 <i class="fas fa-times text-xs"></i>
               </button>
             </span>
           </div>
           <div class="flex">
             <input 
               v-model="newTag"
               @keyup.enter="addTag"
               type="text"
               class="flex-1 px-3 py-2 border border-gray-300 rounded-l-md focus:outline-none focus:ring-2 focus:ring-blue-500"
               :placeholder="t('files.addTag')"
             >
             <button 
               @click="addTag"
               type="button"
               class="px-4 py-2 bg-blue-600 text-white rounded-r-md hover:bg-blue-700"
             >
               <i class="fas fa-plus"></i>
             </button>
           </div>
         </div>
         
         <div class="mb-4">
            <label class="block text-sm font-medium text-gray-700 mb-2">{{ t('files.privacy') }}</label>
            <div class="space-y-2">
              <label class="flex items-center">
                <input 
                  v-model="isPublic" 
                  type="radio" 
                  :value="false" 
                  class="mr-2"
                >
                <span class="text-sm text-gray-700">{{ t('files.private') }}</span>
              </label>
              <label class="flex items-center">
                <input 
                  v-model="isPublic" 
                  type="radio" 
                  :value="true" 
                  class="mr-2"
                >
                <span class="text-sm text-gray-700">{{ t('files.public') }}</span>
              </label>
            </div>
          </div>
        </div>
      </div>
      
      <!-- Actions -->
      <div class="flex justify-end space-x-3 pt-4 border-t border-gray-200">
        <button
          @click="closeModal"
          type="button"
          class="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
        >
          {{ t('common.cancel') }}
        </button>
        <button
          @click="uploadFiles"
          :disabled="selectedFiles.length === 0 || uploading"
          class="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 disabled:opacity-50"
        >
          <i v-if="uploading" class="fas fa-spinner fa-spin mr-2"></i>
          {{ t('files.upload') }} ({{ selectedFiles.length }})
        </button>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, computed } from 'vue'
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
    },
    currentPath: {
      type: Array,
      default: () => []
    }
  },
  emits: ['close', 'upload'],
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
    const acceptedTypes = '.jpeg,.jpg,.png,.gif,.pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt,.zip,.rar'
    const MAX_FILES = 10
    const allowedExtensions = ['jpeg','jpg','png','gif','pdf','doc','docx','xls','xlsx','ppt','pptx','txt','zip','rar']
    const isAllowedFile = (file) => {
    const name = (file?.name || '').toLowerCase()
    const ext = name.includes('.') ? name.split('.').pop() : ''
    return !!ext && allowedExtensions.includes(ext)
    }
    
    const acceptedTypesText = computed(() => {
      return t('files.acceptedTypesText')
    })
    
    const maxSizeText = computed(() => {
      return t('files.maxSizeText')
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
      for (const file of files) {
        if (selectedFiles.value.length >= MAX_FILES) {
          showError(t('files.tooManyFiles', { max: MAX_FILES }))
          break
        }
        if (!isAllowedFile(file)) {
          showError(t('files.fileTypeNotAllowed', { name: file.name }))
          continue
        }
        if (file.size > maxFileSize) {
          showError(t('files.fileTooLarge', { name: file.name }))
          continue
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
      }
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
      if (selectedFiles.value.length === 0) return
      uploading.value = true
      
      try {
        const filesToUpload = selectedFiles.value.map(f => f.file)
        emit('upload', filesToUpload)
        // Removed premature success notification; parent will handle result
        closeModal()
      } finally {
        uploading.value = false
      }
    }
    
    // Dossier selection loading removed; parent context handles folder path for multi-tenant
    
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
      uploadFiles
    }
  }
}
</script>