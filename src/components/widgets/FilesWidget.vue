<template>
  <BaseWidget 
    :widget="widgetConfig"
    :loading="loading"
    :error="error"
    @configure="showConfigModal = true"
    @toggle="toggleWidget"
    @retry="loadFiles"
  >
    <div class="files-widget">
      <!-- En-tête des fichiers -->
      <div class="files-header">
        <div class="header-left">
          <h3 class="files-title">{{ t('widgets.files.title') }}</h3>
          <div class="files-stats">
            <span class="stat-item">
              <i class="fas fa-file mr-1"></i>
              {{ totalFiles }} {{ t('widgets.files.totalFiles') }}
            </span>
            <span class="stat-item">
              <i class="fas fa-hdd mr-1"></i>
              {{ formatFileSize(totalSize) }}
            </span>
          </div>
        </div>
        
        <div class="header-right">
          <div class="view-controls">
            <button 
              @click="viewMode = 'grid'"
              class="view-btn"
              :class="{ active: viewMode === 'grid' }"
              :title="t('widgets.files.gridView')"
            >
              <i class="fas fa-th"></i>
            </button>
            
            <button 
              @click="viewMode = 'list'"
              class="view-btn"
              :class="{ active: viewMode === 'list' }"
              :title="t('widgets.files.listView')"
            >
              <i class="fas fa-list"></i>
            </button>
          </div>
          
          <div class="filter-controls">
            <select v-model="filterType" class="filter-select">
              <option value="all">{{ t('widgets.files.allFiles') }}</option>
              <option value="images">{{ t('widgets.files.images') }}</option>
              <option value="documents">{{ t('widgets.files.documents') }}</option>
              <option value="videos">{{ t('widgets.files.videos') }}</option>
              <option value="archives">{{ t('widgets.files.archives') }}</option>
              <option value="recent">{{ t('widgets.files.recent') }}</option>
            </select>
            
            <select v-model="sortBy" class="filter-select">
              <option value="name">{{ t('widgets.files.sortByName') }}</option>
              <option value="date">{{ t('widgets.files.sortByDate') }}</option>
              <option value="size">{{ t('widgets.files.sortBySize') }}</option>
              <option value="type">{{ t('widgets.files.sortByType') }}</option>
            </select>
          </div>
          
          <button v-if="isAgentOrAdmin" @click="createNewFolder" class="upload-btn" :title="t('widgets.files.newFolder')">
            <i class="fas fa-folder-plus"></i>
            {{ t('widgets.files.newFolder') }}
          </button>
          
          <button v-if="isAgentOrAdmin" @click="openUploadModal" class="upload-btn">
            <i class="fas fa-upload"></i>
            {{ t('widgets.files.uploadFile') }}
          </button>
        </div>
      </div>
      
      <!-- Barre de recherche -->
      <div class="search-bar">
        <div class="search-input-wrapper">
          <i class="fas fa-search search-icon"></i>
          <input 
            v-model="searchQuery"
            type="text"
            :placeholder="t('widgets.files.searchFiles')"
            class="search-input"
          >
          <button 
            v-if="searchQuery"
            @click="searchQuery = ''"
            class="clear-search-btn"
          >
            <i class="fas fa-times"></i>
          </button>
        </div>
      </div>
      
      <!-- Navigation des dossiers -->
      <div class="breadcrumb" v-if="currentPath.length > 0">
        <button @click="navigateToPath([])" class="breadcrumb-item root">
          <i class="fas fa-home mr-1"></i>
          {{ t('widgets.files.root') }}
        </button>
        
        <template v-for="(folder, index) in currentPath" :key="index">
          <i class="fas fa-chevron-right breadcrumb-separator"></i>
          <button 
            @click="navigateToPath(currentPath.slice(0, index + 1))"
            class="breadcrumb-item"
          >
            {{ folder }}
          </button>
        </template>
      </div>
      
      <!-- Liste/Grille des fichiers -->
      <div class="files-container" :class="viewMode">
        <!-- Vue grille -->
        <div v-if="viewMode === 'grid'">
          <FileGrid
            :files="filteredFiles"
            :selected-ids="selectedIds"
            @open="handleFileDoubleClick"
            @update:selectedIds="updateSelectionFromIds"
          />
        </div>
        
        <!-- Vue liste -->
        <div v-else class="files-list">
          <div class="list-header">
            <div class="header-cell select">
              <input 
                type="checkbox" 
                :checked="selectedFiles.length > 0 && selectedFiles.length === filteredFiles.length"
                :indeterminate="selectedFiles.length > 0 && selectedFiles.length < filteredFiles.length"
                @change="toggleSelectAll"
                class="select-all-checkbox"
              />
            </div>
            <div class="header-cell name">{{ t('widgets.files.name') }}</div>
            <div class="header-cell size">{{ t('widgets.files.size') }}</div>
            <div class="header-cell type">{{ t('widgets.files.type') }}</div>
            <div class="header-cell date">{{ t('widgets.files.modified') }}</div>
            <div class="header-cell actions">{{ t('widgets.files.actions') }}</div>
          </div>
          
          <div 
            v-for="file in filteredFiles"
            :key="file.id"
            class="list-item"
            :class="{
              'selected': selectedFiles.some((f: FileItem) => f.id === file.id),
              'folder': isFolder(file)
            }"
            @dblclick="handleFileDoubleClick(file)"
          >
            <div class="list-cell select">
              <label class="select-checkbox-list" @click.stop="handleFileClick(file)">
                <input
                  type="checkbox"
                  :checked="selectedFiles.some((f: FileItem) => f.id === file.id)"
                  @change.stop
                />
              </label>
            </div>
            
            <div class="list-cell name">
              <div class="file-icon-small">
                <i v-if="isFolder(file)" class="fas fa-folder text-blue-500"></i>
                <i v-else :class="getFileIcon(file.mime_type)"></i>
              </div>
              <div class="file-info">
                <div class="file-name-wrapper">
                  <span 
                    class="file-name" 
                    :class="{ 'folder-name': isFolder(file) }"
                    @click="isFolder(file) ? navigateToPath([...currentPath, file.name]) : previewFile(file)"
                  >
                    {{ file.name }}
                  </span>
                  <span v-if="!isFolder(file)" class="file-type">{{ getFileTypeLabel(file.mime_type) }}</span>
                  <span v-if="!isFolder(file)" class="owner-badge" :class="{ you: isOwnedByCurrentUser(file), agent: isUploadedByAgent(file) }">
                    {{ isOwnedByCurrentUser(file) ? t('widgets.files.uploadedByYou') : (isUploadedByAgent(file) ? t('widgets.files.uploadedByAgent') : '') }}
                  </span>
                </div>
              </div>
            </div>
            
            <div class="list-cell size">
              <span v-if="!isFolder(file)">{{ formatFileSize(file.size) }}</span>
              <span v-else class="text-gray-400">—</span>
            </div>
            
            <div class="list-cell type">
              <span class="file-type-badge" :class="getFileTypeClass(file.mime_type)">
                {{ getFileTypeLabel(file.mime_type) }}
              </span>
            </div>
            
            <div class="list-cell date">
              {{ formatFileDate(file.updated_at) }}
            </div>
            
            <div class="list-cell actions">
              <div class="action-buttons">
                <button 
                  @click.stop="previewFile(file)"
                  class="action-btn-small"
                  :title="t('widgets.files.preview')"
                  v-if="!isFolder(file)"
                >
                  <i class="fas fa-eye"></i>
                </button>
                
                <button 
                  @click.stop="downloadFile(file)"
                  class="action-btn-small"
                  :title="t('widgets.files.download')"
                  v-if="normalizeBool(props.widget?.config?.allowDownload, true) && !isFolder(file)"
                >
                  <i class="fas fa-download"></i>
                </button>
                
                <button 
                  @click.stop="shareFile(file)"
                  class="action-btn-small"
                  :title="t('widgets.files.share')"
                  v-if="normalizeBool(props.widget?.config?.allowShare, true)"
                >
                  <i class="fas fa-share"></i>
                </button>
                
                <div class="dropdown" v-if="canManageFile(file)">
                  <button 
                    @click.stop="toggleFileMenu(file.id)"
                    class="action-btn-small"
                    :title="t('widgets.files.moreActions')"
                  >
                    <i class="fas fa-ellipsis-v"></i>
                  </button>
                  
                  <div v-if="activeFileMenu === file.id" class="dropdown-menu">
                    <button v-if="canManageFileFull(file)" @click="renameFile(file)" class="dropdown-item">
                      <i class="fas fa-edit mr-2"></i>
                      {{ t('widgets.files.rename') }}
                    </button>
                    
                    <button v-if="canManageFileFull(file)" @click="moveFile(file)" class="dropdown-item">
                      <i class="fas fa-cut mr-2"></i>
                      {{ t('widgets.files.move') }}
                    </button>
                    
                    <button v-if="canManageFileFull(file)" @click="copyFile(file)" class="dropdown-item">
                      <i class="fas fa-copy mr-2"></i>
                      {{ t('widgets.files.copy') }}
                    </button>
                    
                    <button v-if="canDeleteFile(file)" @click="deleteFile(file)" class="dropdown-item text-red-600">
                      <i class="fas fa-trash mr-2"></i>
                      {{ t('widgets.files.delete') }}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <!-- Message si aucun fichier -->
        <div v-if="filteredFiles.length === 0" class="no-files">
          <i class="fas fa-folder-open text-gray-400 text-4xl mb-3"></i>
          <h5 class="text-gray-600 mb-2">{{ t('widgets.files.noFiles') }}</h5>
          <p class="text-gray-500 text-sm">{{ t('widgets.files.noFilesDescription') }}</p>
          <button v-if="isAgentOrAdmin" @click="openUploadModal" class="upload-first-file-btn">
            <i class="fas fa-upload"></i>
            {{ t('widgets.files.uploadFirstFile') }}
          </button>
        </div>
      </div>
      
      <!-- Pagination -->
      <div v-if="totalPages > 1" class="pagination">
        <button 
          @click="currentPage--"
          :disabled="currentPage === 1"
          class="pagination-btn"
        >
          <i class="fas fa-chevron-left"></i>
        </button>
        
        <span class="pagination-info">
          {{ currentPage }} / {{ totalPages }}
        </span>
        
        <button 
          @click="currentPage++"
          :disabled="currentPage === totalPages"
          class="pagination-btn"
        >
          <i class="fas fa-chevron-right"></i>
        </button>
      </div>
    </div>
    
    <!-- Modal d'upload -->
    <FileUploadModal 
      v-if="showUploadModal"
      :project-id="props.projectId"
      :current-path="currentPath"
      @close="showUploadModal = false"
      @upload="handleFileUpload"
    />
    
    <!-- Modal de partage -->
    <FileShareModal 
      v-if="showShareModal"
      :project-id="props.projectId"
      :file="selectedFile"
      @close="showShareModal = false"
      @share="handleFileShare"
    />

    <!-- Modal d'aperçu -->
    <FilePreviewModal
      v-if="showPreviewModal && selectedFile"
      :file="selectedFile"
      :visible="showPreviewModal"
      :allow-download="normalizeBool(props.widget?.config?.allowDownload, true)"
       :allow-share="normalizeBool(props.widget?.config?.allowShare, true)"
       :allow-delete="selectedFile ? canDeleteFile(selectedFile) : false"
      @close="showPreviewModal = false"
      @download="selectedFile && downloadFile(selectedFile)"
      @share="selectedFile && shareFile(selectedFile)"
      @delete="selectedFile && deleteFile(selectedFile)"
    />
    
    <!-- Modal de configuration -->
    <WidgetConfigModal 
      v-if="showConfigModal"
      :widget="widgetConfig"
      :options="configOptions"
      @close="showConfigModal = false"
      @save="updateConfig"
    />
  </BaseWidget>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, watch } from 'vue'
import BaseWidget from './shared/components/BaseWidget.vue'
import FileUploadModal from '../modals/FileUploadModal.vue'
import FileShareModal from '../modals/FileShareModal.vue'
import FilePreviewModal from '../modals/FilePreviewModal.vue'
import WidgetConfigModal from '../modals/WidgetConfigModal.vue'
import { useTranslation } from '@/composables/useTranslation'
import { useNotifications } from '@/composables/useNotifications'
import { useAuth } from '@/composables/useAuth'
import { useMultiTenant, useMultiTenantApi } from '@/services/multiTenantService'
import type { FileItem } from '@/services/multiTenantService'
// Using multi-tenant API for downloads; legacy filesService import removed
import clientManagementService from '@/services/clientManagementService'
import http from '@/services/api'
import FileGrid from './collaboration/files/FileGrid.vue'

// Types pour les services
interface User {
  id: string
  role: string
  [key: string]: any
}

interface WidgetConfig {
  id: string
  name: string
  icon: string
  titleKey: string
  isEnabled: boolean
  showFileCount: boolean
  showFileSize: boolean
  allowUpload: boolean
  allowDownload: boolean
  allowShare: boolean
  maxFileSize: number
  allowedTypes: string[]
  autoRefresh?: boolean
  refreshInterval?: number
}

// Props
interface Props {
  projectId: string
  widgetData?: any
  widget?: any
}

const props = defineProps<Props>()

// Emits
const emit = defineEmits<{
  'widget-updated': [widget: WidgetConfig]
}>()

// Composables
const { t } = useTranslation()
const { success, error: showError } = useNotifications()
const { user } = useAuth()

// Multi-tenant context
const { currentClient, currentProject, isContextValid, error: contextError, setContext } = useMultiTenant()
const api = useMultiTenantApi()

// Helper: convertir valeurs booléennes potentiellement string/number
const normalizeBool = (val: any, defaultVal: boolean = false): boolean => {
  if (val === undefined || val === null) return defaultVal
  if (typeof val === 'boolean') return val
  if (typeof val === 'string') {
    const v = val.toLowerCase().trim()
    return v === 'true' || v === '1'
  }
  if (typeof val === 'number') return val === 1
  return defaultVal
}

// Résolution automatique du contexte multi-tenant à partir du projectId
const resolveContextFromProject = async (): Promise<void> => {
  try {
    if (!props.projectId) return
    // Si le contexte correspond déjà au projet, ne rien faire
    if (currentProject.value?.id && String(currentProject.value.id) === String(props.projectId) && currentClient.value) {
      return
    }
    // Tenter de récupérer le projet côté client ou agent selon le rôle
    let resp
    const currentUser = user.value
    if (currentUser && (currentUser.role === 'user' || currentUser.role === 'client')) {
      resp = await http.get(`/api/client/projects/${String(props.projectId)}`)
    } else {
      resp = await http.get(`/api/agent/projects/${String(props.projectId)}`)
    }
    const project = resp.data?.data ?? resp.data
    if (!project) return
    const clientIdNum = Number(project.client_id ?? project.clientId ?? project.client?.id)
    const projectIdNum = Number(project.id ?? props.projectId)
    if (!clientIdNum || Number.isNaN(clientIdNum) || !projectIdNum || Number.isNaN(projectIdNum)) {
      return
    }
    const clientCtx = {
      id: clientIdNum,
      name: project.client?.name ?? '',
      status: project.client?.status ?? 'active'
    }
    const projectCtx = {
      id: projectIdNum,
      name: project.name ?? '',
      status: project.status ?? 'active',
      client_id: clientIdNum
    }
    setContext(clientCtx, projectCtx)
  } catch (e) {
    console.error('Échec de la résolution automatique du contexte depuis projectId', e)
  }
}

// État réactif
const loading = ref<boolean>(false)
const error = ref<string | null>(null)

// Widget configuration
const widgetConfig = ref({
  ...props.widget,
  title: props.widget?.title || t('widgets.files.title'),
  isEnabled: normalizeBool(props.widget?.is_enabled, true),
  showThumbnails: true,
  allowUpload: true,
  allowDownload: true,
  allowShare: true
})

// État réactif avec gestion multi-tenant
const files = ref<FileItem[]>([])
const currentPath = ref<string[]>([])
const viewMode = ref<'grid' | 'list'>('grid')
const filterType = ref<string>('all')
const sortBy = ref<string>('name')
const searchQuery = ref<string>('')
const selectedFiles = ref<FileItem[]>([])
const currentPage = ref<number>(1)
const itemsPerPage = ref<number>(20)
const showUploadModal = ref<boolean>(false)
const showShareModal = ref<boolean>(false)
const showConfigModal = ref<boolean>(false)
const showPreviewModal = ref<boolean>(false)
const selectedFile = ref<FileItem | null>(null)
const activeFileMenu = ref<number | null>(null)
const pagination = ref<{ page: number; limit: number; total?: number; pages?: number }>({ page: 1, limit: 50, total: 0, pages: 0 })

// Ensemble typé des IDs sélectionnés pour la grille (évite les types implicites dans le template)
const selectedIds = computed<Set<string>>(() => {
  return new Set((selectedFiles.value || []).map((f: FileItem) => String(f.id)))
})

// Configuration locale du widget
const localConfig = ref({
  autoRefresh: normalizeBool(props.widget?.config?.autoRefresh, false),
  refreshInterval: typeof props.widget?.config?.refreshInterval === 'number' ? props.widget?.config?.refreshInterval : 30000,
  showUpload: normalizeBool(props.widget?.config?.showUpload, true),
  showSearch: normalizeBool(props.widget?.config?.showSearch, true),
  defaultView: props.widget?.config?.defaultView === 'list' ? 'list' : 'grid'
})

// Options de configuration
const configOptions = ref([
  {
    key: 'showThumbnails',
    type: 'boolean',
    label: 'Afficher les miniatures',
    default: true
  },
  {
    key: 'allowUpload',
    type: 'boolean',
    label: 'Permettre l\'upload',
    default: true
  },
  {
    key: 'allowDownload',
    type: 'boolean',
    label: 'Permettre le téléchargement',
    default: true
  },
  {
    key: 'allowShare',
    type: 'boolean',
    label: 'Permettre le partage',
    default: true
  },
  {
    key: 'maxFileSize',
    type: 'number',
    label: 'Taille max des fichiers (bytes)',
    min: 1024,
    max: 1024 * 1024 * 1024,
    step: 1024 * 1024,
    default: 100 * 1024 * 1024
  },
  {
    key: 'autoRefresh',
    type: 'boolean',
    label: 'Actualisation automatique',
    default: true
  },
  {
    key: 'refreshInterval',
    type: 'number',
    label: 'Intervalle d\'actualisation (ms)',
    min: 10000,
    max: 300000,
    step: 10000,
    default: 60000
  }
])

// Propriétés calculées
const currentUserId = computed(() => user.value?.id)
const isAgentOrAdmin = computed(() => {
  const r = (user.value as unknown as User)?.role
  return r === 'agent' || r === 'admin' || r === 'super_admin'
})

const totalFiles = computed(() => files.value.filter(file => !isFolder(file)).length)

const totalSize = computed(() => {
  return files.value
    .filter(file => !isFolder(file))
    .reduce((total: number, file: FileItem) => total + (file.size || 0), 0)
})
    
const isFolder = (file: FileItem): boolean => {
  return file.mime_type === 'application/x-directory' || file.mime_type === 'folder' || file.folder_path === file.name
}

const filteredFiles = computed((): FileItem[] => {
  // Filtrer les fichiers valides d'abord
  let filtered = files.value.filter((file: FileItem) => file && file.name && file.mime_type)
  
  // Filtrer par type
  switch (filterType.value) {
    case 'images':
      filtered = filtered.filter((file: FileItem) => 
        isFolder(file) || isImageFile(file)
      )
      break
    case 'documents':
      filtered = filtered.filter((file: FileItem) => 
        isFolder(file) || isDocumentFile(file)
      )
      break
    case 'videos':
      filtered = filtered.filter((file: FileItem) => 
        isFolder(file) || isVideoFile(file)
      )
      break
    case 'archives':
      filtered = filtered.filter((file: FileItem) => 
        isFolder(file) || isArchiveFile(file)
      )
      break
    case 'recent':
      const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000)
      filtered = filtered.filter((file: FileItem) => 
        isFolder(file) || (!!file.updated_at && new Date(file.updated_at) > oneDayAgo)
      )
      break
  }
  
  // Filtrer par recherche
  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase()
    filtered = filtered.filter((file: FileItem) => 
      file.name && file.name.toLowerCase().includes(query)
    )
  }
  
  // Trier
  filtered.sort((a: FileItem, b: FileItem) => {
    if (!a || !b) return 0
    
    // Dossiers en premier
    if (isFolder(a) && !isFolder(b)) return -1
    if (!isFolder(a) && isFolder(b)) return 1
    
    switch (sortBy.value) {
      case 'date':
        const dateA = a.updated_at ? new Date(a.updated_at).getTime() : 0
        const dateB = b.updated_at ? new Date(b.updated_at).getTime() : 0
        return dateB - dateA
      case 'size':
        return (b.size || 0) - (a.size || 0)
      case 'type':
        return (a.mime_type || '').localeCompare(b.mime_type || '')
      default: // name
        return a.name.localeCompare(b.name)
    }
  })
  
  // Pagination
  const start = (currentPage.value - 1) * itemsPerPage.value
  const end = start + itemsPerPage.value
  
  return filtered.slice(start, end)
})

const totalPages = computed((): number => {
  const totalFiltered = files.value.filter((file: FileItem) => {
    if (!file || !file.name || !file.mime_type) return false
    
    let include = true
    
    switch (filterType.value) {
      case 'images':
        include = isFolder(file) || isImageFile(file)
        break
      case 'documents':
        include = isFolder(file) || isDocumentFile(file)
        break
      case 'videos':
        include = isFolder(file) || isVideoFile(file)
        break
      case 'archives':
        include = isFolder(file) || isArchiveFile(file)
        break
      case 'recent':
        const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000)
        include = isFolder(file) || (!!file.updated_at && new Date(file.updated_at) > oneDayAgo)
        break
    }
    
    if (searchQuery.value && include) {
      const query = searchQuery.value.toLowerCase()
      include = file.name.toLowerCase().includes(query)
    }
    
    return include
  })
  
  return Math.ceil(totalFiltered.length / itemsPerPage.value)
})
    
// Méthodes
const loadFiles = async (): Promise<void> => {
  if (!isContextValid.value) {
    await resolveContextFromProject()
  }
  if (!isContextValid.value) {
    error.value = 'Contexte client/projet requis'
    return
  }
  
  try {
    loading.value = true
    error.value = null
    
    const folderPath = currentPath.value.length > 0 ? currentPath.value.join('/') : '/'
    const response = await api.getFiles(folderPath, pagination.value.page, pagination.value.limit)
    
    if (response.success && response.data) {
      files.value = response.data.files || []
      pagination.value = response.data.pagination
    } else {
      throw new Error(response.error || t('widgets.files.loadError'))
    }
  } catch (err) {
    console.error('Erreur lors du chargement des fichiers:', err)
    error.value = err instanceof Error ? err.message : t('widgets.files.loadError')
    // Évite de passer une valeur potentiellement null à showError
    showError(error.value || t('widgets.files.loadError'))
    files.value = []
  } finally {
    loading.value = false
  }
}

const toggleWidget = () => {
  widgetConfig.value.isEnabled = !widgetConfig.value.isEnabled
  const updatedWidget = {
    ...props.widget,
    is_enabled: widgetConfig.value.isEnabled
  }
  emit('widget-updated', updatedWidget)
  
  if (widgetConfig.value.isEnabled) {
    loadFiles()
    startAutoRefresh()
  } else {
    stopAutoRefresh()
  }
}

const formatFileSize = (bytes?: number): string => {
  if (!bytes || bytes === 0) return '0 B'
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

const formatFileDate = (dateString?: string): string => {
  if (!dateString) return '—'
  
  try {
    const date = new Date(dateString)
    if (isNaN(date.getTime())) return '—'
    
    const now = new Date()
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60)
    
    if (diffInHours < 24) {
      return date.toLocaleTimeString('fr-FR', {
        hour: '2-digit',
        minute: '2-digit'
      })
    } else if (diffInHours < 168) { // 7 jours
      return date.toLocaleDateString('fr-FR', {
        weekday: 'short',
        day: 'numeric',
        month: 'short'
      })
    } else {
      return date.toLocaleDateString('fr-FR', {
        day: 'numeric',
        month: 'short',
        year: 'numeric'
      })
    }
  } catch {
    return '—'
  }
}

const isImageFile = (file: FileItem): boolean => {
  if (!file) return false
  const f = file as any
  const mime = f.mime_type || f.type || ''
  if (mime && typeof mime === 'string' && mime.startsWith('image/')) return true
  const exts = ['jpg', 'jpeg', 'png', 'gif', 'bmp', 'svg', 'webp', 'avif', 'heic', 'heif', 'tif', 'tiff', 'ico', 'jfif']
  const extFrom = (s?: string) => s?.split('?')[0]?.split('#')[0]?.split('.').pop()?.toLowerCase()
  const candidateExts = [
    extFrom(file.name),
    extFrom(f.original_name),
    extFrom(f.url)
  ].filter(Boolean) as string[]
  return candidateExts.some(e => exts.includes(e))
}

const isDocumentFile = (file: FileItem): boolean => {
  if (!file || !file.name) return false
  const extension = file.name.split('.').pop()?.toLowerCase()
  return ['pdf', 'doc', 'docx', 'xls', 'xlsx', 'ppt', 'pptx', 'txt', 'rtf'].includes(extension || '')
}

const isVideoFile = (file: FileItem): boolean => {
  if (!file || !file.name) return false
  const extension = file.name.split('.').pop()?.toLowerCase()
  return ['mp4', 'avi', 'mov', 'wmv', 'flv', 'webm', 'mkv'].includes(extension || '')
}

const isArchiveFile = (file: FileItem): boolean => {
  if (!file || !file.name) return false
  const extension = file.name.split('.').pop()?.toLowerCase()
  return ['zip', 'rar', '7z', 'tar', 'gz', 'bz2'].includes(extension || '')
}
    
// Helpers miniatures/preview + lazy-loading
const visibleIds = ref<Set<string>>(new Set())
const loadedIds = ref<Set<string>>(new Set())
const errorIds = ref<Set<string>>(new Set())
const imgSrcMap = ref<Record<string, string>>({})
let io: IntersectionObserver | null = null

const observeVisibility = (el: any, id: string): void => {
  if (!id) return
  const elem: Element | null = el?.$el ? (el.$el as Element) : (el as Element | null)
  if (!elem) return
  if (!io) {
    io = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        const targetId = (entry.target as any).__fileId as string
        if (!targetId) return
        if (entry.isIntersecting) {
          visibleIds.value.add(targetId)
        }
      })
    }, { rootMargin: '200px' })
  }
  ;(elem as any).__fileId = id
  io.observe(elem)
}

const toAbsoluteUrl = (u?: string): string => {
  if (!u) return ''
  try {
    // Recognize signed token like "<base64url>.<hex>" and wrap into API path
    const tokenPattern = /^[A-Za-z0-9_-]+\.[0-9a-f]{64}$/
    if (tokenPattern.test(u)) return `/api/files/signed/${u}`
    if (u.startsWith('/uploads')) return u
    if (u.startsWith('data:') || /^https?:\/\//.test(u)) return u
    const base = (import.meta as any).env?.VITE_BACKEND_URL || (import.meta as any).env?.VITE_API_URL || (http as any)?.defaults?.baseURL || window.location.origin
    const normalized = u.startsWith('/') ? u : `/${u}`
    return new URL(normalized, base).href
  } catch {
    return u
  }
}

const buildThumbnailUrl = (file: FileItem, size: number = 256): string => {
  const id = String((file as any).id)
  return `/api/thumbnails/${encodeURIComponent(id)}?size=${size}`
}

const getPreviewSrc = (file: FileItem): string => {
  const f = file as any
  // Préférer l'endpoint thumbnail pour les images
  if (isImageFile(file)) {
    return buildThumbnailUrl(file, 256)
  }
  const src = f.thumbnail || f.preview_url || f.url || ''
  return toAbsoluteUrl(src)
}

const onThumbnailError = async (file: FileItem): Promise<void> => {
  const id = String((file as any).id)
  // Si déjà tenté une URL signée → fallback icône
  if (imgSrcMap.value[id]) {
    errorIds.value.add(id)
    return
  }
  try {
    const resp = await http.post('/api/files/signed-url', { fileId: id, intent: 'thumbnail' })
    const url = resp.data?.url || resp.data?.data?.url
    if (url) {
      imgSrcMap.value[id] = url
    } else {
      errorIds.value.add(id)
    }
  } catch (e) {
    console.warn('Signed URL thumbnail error', e)
    errorIds.value.add(id)
  }
}

const onThumbnailLoad = (file: FileItem): void => {
  const id = String((file as any).id)
  loadedIds.value.add(id)
}

const shouldShowThumbnail = (file: FileItem): boolean => {
  if (!normalizeBool(props.widget?.config?.showThumbnails, true)) return false
  const f = file as any
  // Ne pas afficher l'image si elle est en erreur
  if (errorIds.value.has(String(f.id))) return false
  return isImageFile(file) || !!f?.thumbnail || !!f?.preview_url
}
    
const getFileIcon = (mimeType: string): string => {
  if (mimeType === 'application/x-directory' || mimeType === 'folder') return 'fas fa-folder text-blue-500'
  
  if (mimeType.startsWith('image/')) return 'fas fa-image text-green-500'
  if (mimeType.startsWith('video/')) return 'fas fa-file-video text-purple-500'
  if (mimeType.startsWith('audio/')) return 'fas fa-file-audio text-pink-500'
  if (mimeType === 'application/pdf') return 'fas fa-file-pdf text-red-500'
  if (mimeType.includes('document') || mimeType.includes('word')) return 'fas fa-file-word text-blue-600'
  if (mimeType.includes('spreadsheet') || mimeType.includes('excel')) return 'fas fa-file-excel text-green-600'
  if (mimeType.includes('presentation') || mimeType.includes('powerpoint')) return 'fas fa-file-powerpoint text-orange-500'
  if (mimeType.startsWith('text/')) return 'fas fa-file-alt text-gray-500'
  if (mimeType.includes('zip') || mimeType.includes('archive') || mimeType.includes('compressed')) return 'fas fa-file-archive text-yellow-600'
  
  return 'fas fa-file text-gray-500'
}

const getFileTypeClass = (mimeType: string): string => {
  if (mimeType === 'application/x-directory' || mimeType === 'folder') return 'folder'
  
  if (mimeType.startsWith('image/')) return 'image'
  if (mimeType.startsWith('video/')) return 'video'
  if (mimeType.startsWith('audio/')) return 'audio'
  if (mimeType === 'application/pdf' || mimeType.includes('document') || mimeType.includes('text')) return 'document'
  if (mimeType.includes('zip') || mimeType.includes('archive') || mimeType.includes('compressed')) return 'archive'
  
  return 'other'
}

const getFileTypeLabel = (mimeType: string): string => {
  if (mimeType === 'application/x-directory' || mimeType === 'folder') return t('widgets.files.folder')
  
  if (mimeType.startsWith('image/')) return 'Image'
  if (mimeType.startsWith('video/')) return 'Vidéo'
  if (mimeType.startsWith('audio/')) return 'Audio'
  if (mimeType === 'application/pdf') return 'PDF'
  if (mimeType.includes('document') || mimeType.includes('word')) return 'Word'
  if (mimeType.includes('spreadsheet') || mimeType.includes('excel')) return 'Excel'
  if (mimeType.includes('presentation') || mimeType.includes('powerpoint')) return 'PowerPoint'
  if (mimeType.startsWith('text/')) return 'Texte'
  if (mimeType.includes('zip') || mimeType.includes('archive') || mimeType.includes('compressed')) return 'Archive'
  
  const parts = mimeType.split('/')
  return parts[parts.length - 1].toUpperCase()
}

// Permissions et badges propriétaire
const isOwnedByCurrentUser = (file: FileItem): boolean => {
  const creator = (file as any)?.created_by ?? (file as any)?.user_id
  return String(creator) === String(currentUserId.value)
}

const isUploadedByAgent = (file: FileItem): boolean => {
  const role = (user.value as unknown as User)?.role
  if (role !== 'client') return false
  return !isOwnedByCurrentUser(file)
}

const canManageFileFull = (_file: FileItem): boolean => {
  return isAgentOrAdmin.value
}

const canDeleteFile = (file: FileItem): boolean => {
  return isAgentOrAdmin.value || isOwnedByCurrentUser(file)
}

// Conserver canManageFile pour compatibilité avec le template existant
const canManageFile = (file: FileItem): boolean => {
  return canManageFileFull(file) || canDeleteFile(file)
}

const handleFileClick = (file: FileItem): void => {
  if (selectedFiles.value.some((f: FileItem) => f.id === file.id)) {
    // Désélectionner le fichier
    selectedFiles.value = selectedFiles.value.filter((f: FileItem) => f.id !== file.id)
  } else {
    // Ajouter le fichier à la sélection (sélection multiple)
    selectedFiles.value = [...selectedFiles.value, file]
  }
}

const toggleSelectAll = (): void => {
  if (selectedFiles.value.length === filteredFiles.value.length) {
    selectedFiles.value = []
  } else {
    selectedFiles.value = [...filteredFiles.value]
  }
}

const handleFileDoubleClick = (file: FileItem): void => {
  if (isFolder(file)) {
    navigateToPath([...currentPath.value, file.name])
  } else if (file.url) {
    previewFile(file)
  }
}

const updateSelectionFromIds = (ids: Set<string>): void => {
  const idSet = new Set(Array.from(ids).map(String))
  selectedFiles.value = files.value.filter((f: FileItem) => idSet.has(String(f.id)))
}

const navigateToPath = (path: string[]): void => {
  currentPath.value = path
  // loadFiles() sera appelé automatiquement par le watcher sur currentPath
}

const toggleFileMenu = (fileId: number | null): void => {
  activeFileMenu.value = activeFileMenu.value === fileId ? null : fileId
}

const downloadFile = async (file: FileItem): Promise<void> => {
  if (!normalizeBool(props.widget?.config?.allowDownload, true)) {
    showError(t('widgets.files.downloadNotAllowed'))
    return
  }

  try {
    // 1) Télécharger directement via l'URL publique si disponible
    if ((file as any).url) {
      const a = document.createElement('a')
      a.href = (file as any).url
      a.download = (file as any).original_name || file.name || 'download'
      document.body.appendChild(a)
      a.click()
      a.remove()
      success(t('widgets.files.downloadStarted'))
      return
    }

    // 2) Essayer une URL signée côté serveur (préféré pour la CSP stricte)
    try {
      const resp = await http.post('/api/files/signed-url', { fileId: String((file as any).id), intent: 'download' })
      const signed = resp.data?.url || resp.data?.data?.url
      if (signed) {
        const a = document.createElement('a')
        a.href = toAbsoluteUrl(signed)
        a.download = (file as any).original_name || file.name || 'download'
        document.body.appendChild(a)
        a.click()
        a.remove()
        success(t('widgets.files.downloadStarted'))
        return
      }
    } catch (e) {
      console.warn('Signed download URL error', e)
    }

    // 3) Dernier recours: via l'API (blob). Attention: conversion data: peut être bloquée par la CSP
    const blob = await api.downloadFile(Number(file.id))
    const a = document.createElement('a')
    // Utiliser URL.createObjectURL si blob: autorisé, sinon conversion data: (peut échouer selon CSP)
    let href = ''
    try {
      href = URL.createObjectURL(blob)
    } catch (_) {
      try {
        const { blobToDataURL } = await import('@/utils/blob')
        href = await blobToDataURL(blob)
      } catch {
        href = ''
      }
    }
    if (!href) throw new Error('Impossible de préparer le téléchargement')
    a.href = href
    a.download = (file as any).original_name || file.name || 'download'
    document.body.appendChild(a)
    a.click()
    a.remove()
    success(t('widgets.files.downloadStarted'))
  } catch (err) {
    showError(err instanceof Error ? err.message : t('widgets.files.downloadError'))
  }
}

const shareFile = (file: FileItem): void => {
  if (!normalizeBool(props.widget?.config?.allowShare, true)) {
    showError(t('widgets.files.shareNotAllowed'))
    return
  }
  
  selectedFile.value = file
  showShareModal.value = true
}

const previewFile = (file: FileItem): void => {
  selectedFile.value = file
  showPreviewModal.value = true
}

const renameFile = async (file: FileItem): Promise<void> => {
  if (!isContextValid.value) return
  
  const newName = prompt(t('widgets.files.enterNewName') || 'Nouveau nom', file.name)
  if (!newName || newName === file.name) {
    activeFileMenu.value = null
    return
  }
  
  try {
    loading.value = true
    if (isFolder(file)) {
      const response = await api.renameFolder(Number(file.id), newName)
      if (response.success) {
        success(t('widgets.files.folderRenamed') || 'Dossier renommé')
        await loadFiles()
      } else {
        throw new Error((response as any).error || t('widgets.files.renameError') || 'Erreur lors du renommage')
      }
    } else {
      showError(t('widgets.files.renameNotImplemented') || 'Renommage de fichier non disponible')
    }
  } catch (err) {
    showError(err instanceof Error ? err.message : t('widgets.files.renameError') || 'Erreur lors du renommage')
  } finally {
    loading.value = false
  }
  
  activeFileMenu.value = null
}

const moveFile = async (file: FileItem): Promise<void> => {
  if (!isContextValid.value) return
  
  if (isFolder(file)) {
    const currentParent = currentPath.value.join('/') || '/'
    const newParentPath = prompt(t('widgets.files.enterNewFolderPath') || 'Nouveau chemin parent (ex: dossier/sous-dossier)', currentParent)
    if (!newParentPath) {
      activeFileMenu.value = null
      return
    }
    try {
      loading.value = true
      const response = await api.moveFolder(Number(file.id), newParentPath)
      if (response.success) {
        success(t('widgets.files.folderMoved') || 'Dossier déplacé')
        await loadFiles()
      } else {
        throw new Error((response as any).error || t('widgets.files.moveError') || 'Erreur lors du déplacement')
      }
    } catch (err) {
      showError(err instanceof Error ? err.message : t('widgets.files.moveError') || 'Erreur lors du déplacement')
    } finally {
      loading.value = false
    }
  } else {
    showError(t('widgets.files.moveNotImplemented') || 'Déplacement de fichier non disponible')
  }
  activeFileMenu.value = null
}

const copyFile = async (file: FileItem): Promise<void> => {
  // Implémenter la logique de copie
  showError(t('widgets.files.copyNotImplemented'))
  activeFileMenu.value = null
}

const deleteFile = async (file: FileItem): Promise<void> => {
  if (!isContextValid.value) return
  
  if (!confirm(t('widgets.files.confirmDelete', { name: file.name }))) return
  
  try {
    const response = isFolder(file)
      ? await api.deleteFolder(Number(file.id))
      : await api.deleteFile(Number(file.id))
    
    if (response.success) {
      files.value = files.value.filter((f: FileItem) => f.id !== file.id)
      success(t('widgets.files.fileDeleted'))
    } else {
      throw new Error(response.error || t('widgets.files.deleteError'))
    }
  } catch (err) {
    showError(err instanceof Error ? err.message : t('widgets.files.deleteError'))
  }
  
  activeFileMenu.value = null
}

// Nouvelle méthode: ouvrir la modale seulement si le contexte est valide
const createNewFolder = async (): Promise<void> => {
  if (!isContextValid.value) {
    await resolveContextFromProject()
  }
  if (!isContextValid.value) {
    showError(t('widgets.files.contextRequired'))
    return
  }

  const folderName = prompt(t('widgets.files.enterFolderName') || 'Nom du dossier')
  if (!folderName) return

  try {
    loading.value = true
    const parentPath = (currentPath.value && currentPath.value.length > 0) ? currentPath.value.join('/') : '/'
    const response = await api.createFolder(folderName, parentPath)
    if (response.success) {
      success(t('widgets.files.folderCreated') || 'Dossier créé')
      try {
        await loadFiles()
      } catch (loadError) {
        console.warn('Erreur lors du rechargement des fichiers après création du dossier:', loadError)
        // Le dossier a été créé avec succès, mais le rechargement a échoué
        // On affiche un message informatif plutôt qu'une erreur
        showError(t('widgets.files.folderCreatedButRefreshFailed') || 'Dossier créé avec succès. Veuillez rafraîchir manuellement.')
      }
    } else {
      throw new Error((response as any).error || t('widgets.files.createFolderError') || 'Erreur lors de la création du dossier')
    }
  } catch (err) {
    console.error('Erreur lors de la création du dossier:', err)
    showError(err instanceof Error ? err.message : t('widgets.files.createFolderError') || 'Erreur lors de la création du dossier')
  } finally {
    loading.value = false
  }
}

const openUploadModal = async (): Promise<void> => {
  if (!isAgentOrAdmin.value) {
    showError(t('messages.unauthorized'))
    return
  }
  if (!isContextValid.value) {
    await resolveContextFromProject()
  }
  if (!isContextValid.value) {
    showError(t('widgets.files.contextRequired'))
    return
  }
  showUploadModal.value = true
}

const handleFileUpload = async (uploadedFiles: File[]): Promise<void> => {
  if (!isAgentOrAdmin.value) {
    showError(t('messages.unauthorized'))
    return
  }
  if (!isContextValid.value) {
    await resolveContextFromProject()
  }
  if (!isContextValid.value) {
    showError(t('widgets.files.contextRequired'))
    return
  }
  try {
    loading.value = true
    const folderPath = (currentPath.value && currentPath.value.length > 0)
      ? currentPath.value.join('/')
      : '/'
    const response = await api.uploadFiles(uploadedFiles, folderPath)
    if (response.success) {
      showUploadModal.value = false
      await loadFiles()
      const uploadedCount = Array.isArray((response as any).data?.files)
        ? (response as any).data.files.length
        : uploadedFiles.length
      success(t('widgets.files.uploadSuccess', { count: uploadedCount }) || `Fichiers téléversés: ${uploadedCount}`)
    } else {
      throw new Error((response as any).error || t('widgets.files.uploadError') || 'Erreur lors du téléversement des fichiers')
    }
  } catch (err) {
    showError(err instanceof Error ? err.message : t('widgets.files.uploadError') || 'Erreur lors du téléversement des fichiers')
  } finally {
    loading.value = false
  }
}

const handleFileShare = (_shareData: any): void => {
  success(t('widgets.files.fileShared'))
}

const handleImageError = (event: Event): void => {
  const target = event.target as HTMLImageElement
  target.style.display = 'none'
  if (target.parentNode) {
    const parentElement = target.parentNode as HTMLElement
    parentElement.innerHTML = '<i class="fas fa-image text-gray-400 text-3xl"></i>'
  }
}

const updateConfig = (newConfig: any): void => {
  Object.assign(localConfig.value, newConfig)
  
  // Émettre avec la structure attendue par le backend
  const updatedWidget = {
    ...props.widget,
    config: {
      ...props.widget?.config,
      ...newConfig
    }
  }
  emit('widget-updated', updatedWidget)
  showConfigModal.value = false
}

// Auto-refresh
let refreshInterval: ReturnType<typeof setInterval> | null = null

const startAutoRefresh = (): void => {
  stopAutoRefresh() // Arrêter l'ancien interval s'il existe
  if (localConfig.value.autoRefresh && localConfig.value.refreshInterval && widgetConfig.value.isEnabled) {
    refreshInterval = setInterval(() => {
      if (widgetConfig.value.isEnabled) {
        loadFiles()
      }
    }, localConfig.value.refreshInterval)
  }
}

const stopAutoRefresh = (): void => {
  if (refreshInterval) {
    clearInterval(refreshInterval)
    refreshInterval = null
  }
}

// Lifecycle
onMounted(async () => {
  await resolveContextFromProject()
  if (widgetConfig.value.isEnabled && isContextValid.value) {
    // vue par défaut depuis la config locale
    viewMode.value = (localConfig.value.defaultView === 'list' ? 'list' : 'grid')
    loadFiles()
    startAutoRefresh()
  }
})

// Watchers avec gestion multi-tenant
watch([currentClient, currentProject], () => {
  if (isContextValid.value) {
    loadFiles()
  } else {
    files.value = []
  }
}, { immediate: true })

// Mettre à jour le contexte automatiquement si le projectId change
watch(() => props.projectId, async (newPid) => {
  if (newPid) {
    await resolveContextFromProject()
  }
})

watch(() => widgetConfig.value.isEnabled, (newValue) => {
  if (newValue) {
    startAutoRefresh()
  } else {
    stopAutoRefresh()
  }
})

watch(() => currentPath.value, () => {
  currentPage.value = 1
  selectedFiles.value = []
  if (isContextValid.value) {
    loadFiles()
  }
})

watch(() => localConfig.value.autoRefresh, (newValue) => {
  if (newValue) {
    startAutoRefresh()
  } else {
    stopAutoRefresh()
  }
})

watch(() => localConfig.value.refreshInterval, () => {
  stopAutoRefresh()
  startAutoRefresh()
})

watch(contextError, (newError) => {
  if (newError) {
    error.value = newError
  }
})

// Cleanup
onUnmounted(() => {
  stopAutoRefresh()
})
    
// Dans <script setup>, nous n'avons pas besoin de return
</script>

<style scoped>
.files-widget {
  @apply space-y-4 max-w-full overflow-auto;
}

.files-header {
  @apply flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 max-w-full;
}

.header-left {
  @apply flex flex-col space-y-2;
}

.files-title {
  @apply text-xl font-bold text-gray-900;
}

.files-stats {
  @apply flex items-center space-x-4 text-sm text-gray-600;
}

.stat-item {
  @apply flex items-center;
}

.header-right {
  @apply flex flex-wrap items-center gap-2 sm:space-x-3;
}

.view-controls {
  @apply flex items-center space-x-1 border border-gray-300 rounded-md;
}

.view-btn {
  @apply p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 transition-colors;
}

.view-btn.active {
  @apply text-blue-600 bg-blue-50;
}

.filter-controls {
  @apply flex flex-wrap items-center gap-2;
}

.filter-select {
  @apply px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent;
}

.upload-btn {
  @apply bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center;
}

.search-bar {
  @apply relative;
}

.search-input-wrapper {
  @apply relative;
}

.search-icon {
  @apply absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400;
}

.search-input {
  @apply w-full pl-10 pr-10 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent;
}

.clear-search-btn {
  @apply absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600;
}

.breadcrumb {
  @apply flex flex-wrap items-center gap-2 text-sm text-gray-600 py-2 border-b border-gray-200 max-w-full overflow-hidden;
}

.breadcrumb-item {
  @apply hover:text-blue-600 transition-colors;
}

.breadcrumb-item.root {
  @apply flex items-center;
}

.breadcrumb-separator {
  @apply text-gray-400;
}
.files-container {
  @apply min-h-[300px] max-w-full overflow-auto;
}

/* Vue grille */
.files-grid {
  @apply grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 2xl:grid-cols-8 gap-4 max-w-full;
}

.file-card {
  @apply bg-white border border-gray-200 rounded-lg p-3 hover:shadow-md transition-shadow cursor-pointer max-w-[200px] mx-auto;
}

.file-card.selected {
  @apply border-blue-500 bg-blue-50;
}

.file-card.folder {
  @apply border-blue-200;
}

.file-preview {
  @apply relative flex items-center justify-center h-32 mb-2 rounded-md overflow-hidden bg-gray-100;
}

.preview-image {
  @apply w-full h-full object-cover;
}

.overlay-actions {
  @apply absolute top-2 right-2 flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-opacity;
}

.overlay-btn {
  @apply bg-white/80 backdrop-blur-sm rounded-md shadow-sm border border-gray-200 p-1 hover:bg-white;
}

.overlay-title {
  @apply absolute bottom-0 left-0 right-0 text-white text-xs px-2 py-1 bg-gradient-to-t from-black/60 to-transparent;
}

.overlay-name {
  @apply truncate;
}

.select-checkbox {
  @apply absolute top-2 left-2 bg-white/90 border border-gray-300 rounded-md p-1 shadow-sm;
}

.select-checkbox input {
  @apply w-4 h-4 cursor-pointer;
}

.file-icon {
  @apply flex items-center justify-center;
}

.file-info {
  @apply space-y-1;
}

.file-card .file-name {
  @apply text-sm font-medium text-gray-900 truncate max-w-full;
}

.file-meta {
  @apply text-xs text-gray-500 space-y-1;
}

.file-size {
  @apply block;
}

.file-date {
  @apply block;
}

.file-actions {
  @apply flex items-center justify-end space-x-1 mt-2 opacity-0 group-hover:opacity-100 transition-opacity;
}

.file-card:hover .file-actions {
  @apply opacity-100;
}

.action-btn {
  @apply p-1 text-gray-400 hover:text-gray-600 transition-colors;
}

/* Vue liste */
.files-list {
  @apply space-y-1 max-w-full overflow-auto;
}

.list-header {
  @apply flex items-center gap-2 px-4 py-2 bg-gray-50 border-b border-gray-200 text-sm font-medium text-gray-700;
}

.list-item {
  @apply flex items-center gap-2 px-4 py-3 hover:bg-gray-50 cursor-pointer border-b border-gray-100;
}

.list-item.selected {
  @apply bg-blue-50 border-blue-200;
}

.list-item.folder {
  @apply bg-blue-50;
}

.header-cell.name,
.list-cell.name {
  @apply flex-1 min-w-0 flex items-center space-x-2;
}

.header-cell.size {
  @apply w-16 sm:w-20 flex-shrink-0 flex items-center text-right;
}

.list-cell.size {
  @apply w-16 sm:w-20 flex-shrink-0 flex items-center text-right text-xs sm:text-sm;
}

.header-cell.type {
  @apply w-20 sm:w-24 flex-shrink-0 flex items-center;
}

.list-cell.type {
  @apply w-20 sm:w-24 flex-shrink-0 flex items-center;
}

.header-cell.date {
  @apply w-24 sm:w-28 flex-shrink-0 flex items-center text-right;
}

.list-cell.date {
  @apply w-24 sm:w-28 flex-shrink-0 flex items-center text-right text-xs sm:text-sm;
}

.header-cell.actions {
  @apply w-16 sm:w-20 flex-shrink-0 flex items-center justify-end;
}

.list-cell.actions {
  @apply w-16 sm:w-20 flex-shrink-0 flex items-center justify-end;
}

.file-icon-small {
  @apply flex-shrink-0 w-4 h-4;
}

.file-name {
  @apply truncate max-w-full;
}

.file-type-badge {
  @apply px-1 sm:px-2 py-1 text-xs rounded-full font-medium max-w-full truncate;
}

.file-type-badge.folder {
  @apply bg-blue-100 text-blue-800;
}

.file-type-badge.image {
  @apply bg-green-100 text-green-800;
}

.file-type-badge.document {
  @apply bg-red-100 text-red-800;
}

.file-type-badge.video {
  @apply bg-purple-100 text-purple-800;
}

.file-type-badge.audio {
  @apply bg-pink-100 text-pink-800;
}

.file-type-badge.archive {
  @apply bg-yellow-100 text-yellow-800;
}

.file-type-badge.other {
  @apply bg-gray-100 text-gray-800;
}

.action-buttons {
  @apply flex items-center space-x-1;
}

.action-btn-small {
  @apply p-1 text-gray-400 hover:text-gray-600 transition-colors;
}

.dropdown {
  @apply relative;
}

.dropdown-menu {
  @apply absolute right-0 mt-2 bg-white border border-gray-200 rounded-lg shadow-lg z-10 min-w-[150px];
}

.dropdown-item {
  @apply w-full px-3 py-2 text-left text-sm hover:bg-gray-50 flex items-center;
}

.no-files {
  @apply text-center py-12;
}

.upload-first-file-btn {
  @apply mt-4 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center mx-auto;
}

.pagination {
  @apply flex items-center justify-center space-x-4 pt-4 border-t border-gray-200;
}

.pagination-btn {
  @apply p-2 text-gray-500 hover:text-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors;
}

.pagination-info {
  @apply text-sm text-gray-600;
}

/* Styles pour les cases à cocher */
.header-cell.select {
  @apply w-12 flex items-center justify-center;
}

.list-cell.select {
  @apply w-12 flex items-center justify-center;
}

.select-checkbox-list {
  @apply cursor-pointer p-1 rounded hover:bg-gray-100 transition-colors flex items-center justify-center;
}

.select-checkbox-list input {
  @apply w-4 h-4 cursor-pointer;
}

.select-all-checkbox {
  @apply w-4 h-4 cursor-pointer;
}

/* Styles pour les noms de fichiers et dossiers */
.file-name {
  @apply cursor-pointer hover:text-blue-600 transition-colors;
}

.file-name.folder-name {
  @apply text-blue-600 font-medium;
}

.file-name.folder-name:hover {
  @apply text-blue-800 underline;
}
</style>
