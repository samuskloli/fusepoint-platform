<template>
  <div class="space-y-6">
    <!-- En-tête avec actions -->
    <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between">
      <div>
        <h3 class="text-lg font-medium text-gray-900">Gestion des fichiers</h3>
        <p class="mt-1 text-sm text-gray-500">Téléchargez, organisez et partagez les fichiers du projet</p>
      </div>
      <div class="mt-4 sm:mt-0 flex space-x-3">
        <button
          @click="showCreateFolder = true"
          class="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          <svg class="-ml-1 mr-2 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path>
          </svg>
          Nouveau dossier
        </button>
        <label class="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 cursor-pointer">
          <svg class="-ml-1 mr-2 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"></path>
          </svg>
          Télécharger des fichiers
          <input
            ref="fileInput"
            type="file"
            multiple
            @change="handleFileUpload"
            class="hidden"
          >
        </label>
      </div>
    </div>

    <!-- Barre de navigation / Breadcrumb -->
    <div class="bg-white p-4 rounded-lg border border-gray-200">
      <nav class="flex" aria-label="Breadcrumb">
        <ol class="flex items-center space-x-2">
          <li>
            <button
              @click="navigateToFolder(null)"
              class="text-blue-600 hover:text-blue-800 font-medium"
            >
              Racine
            </button>
          </li>
          <li v-for="(folder, index) in breadcrumb" :key="folder.id" class="flex items-center">
            <svg class="flex-shrink-0 h-4 w-4 text-gray-400 mx-2" fill="currentColor" viewBox="0 0 20 20">
              <path fill-rule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clip-rule="evenodd"></path>
            </svg>
            <button
              @click="navigateToFolder(folder.id)"
              :class="[
                index === breadcrumb.length - 1
                  ? 'text-gray-500 cursor-default'
                  : 'text-blue-600 hover:text-blue-800',
                'font-medium'
              ]"
            >
              {{ folder.name }}
            </button>
          </li>
        </ol>
      </nav>
    </div>

    <!-- Filtres et recherche -->
    <div class="bg-white p-4 rounded-lg border border-gray-200">
      <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
        <!-- Recherche -->
        <div>
          <label for="search" class="block text-sm font-medium text-gray-700 mb-1">
            Rechercher
          </label>
          <div class="relative">
            <input
              id="search"
              v-model="filters.search"
              type="text"
              placeholder="Rechercher un fichier..."
              class="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
            <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <svg class="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
              </svg>
            </div>
          </div>
        </div>

        <!-- Type de fichier -->
        <div>
          <label for="type-filter" class="block text-sm font-medium text-gray-700 mb-1">
            Type
          </label>
          <select
            id="type-filter"
            v-model="filters.type"
            class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">Tous les types</option>
            <option value="image">Images</option>
            <option value="document">Documents</option>
            <option value="video">Vidéos</option>
            <option value="audio">Audio</option>
            <option value="archive">Archives</option>
            <option value="other">Autres</option>
          </select>
        </div>

        <!-- Taille -->
        <div>
          <label for="size-filter" class="block text-sm font-medium text-gray-700 mb-1">
            Taille
          </label>
          <select
            id="size-filter"
            v-model="filters.size"
            class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">Toutes les tailles</option>
            <option value="small">< 1 MB</option>
            <option value="medium">1-10 MB</option>
            <option value="large">10-100 MB</option>
            <option value="xlarge">> 100 MB</option>
          </select>
        </div>

        <!-- Vue -->
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">
            Vue
          </label>
          <div class="flex rounded-md shadow-sm">
            <button
              @click="viewMode = 'grid'"
              :class="[
                viewMode === 'grid'
                  ? 'bg-blue-600 text-white'
                  : 'bg-white text-gray-700 hover:bg-gray-50',
                'px-3 py-2 text-sm font-medium rounded-l-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500'
              ]"
            >
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z"></path>
              </svg>
            </button>
            <button
              @click="viewMode = 'list'"
              :class="[
                viewMode === 'list'
                  ? 'bg-blue-600 text-white'
                  : 'bg-white text-gray-700 hover:bg-gray-50',
                'px-3 py-2 text-sm font-medium rounded-r-md border-t border-r border-b border-gray-300 -ml-px focus:outline-none focus:ring-2 focus:ring-blue-500'
              ]"
            >
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 10h16M4 14h16M4 18h16"></path>
              </svg>
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Liste des fichiers -->
    <div class="bg-white rounded-lg border border-gray-200">
      <!-- En-tête avec statistiques -->
      <div class="px-4 py-3 border-b border-gray-200">
        <div class="flex items-center justify-between">
          <div class="flex items-center space-x-4">
            <span class="text-sm font-medium text-gray-700">
              {{ filteredItems.length }} élément(s)
            </span>
            <span class="text-sm text-gray-500">
              {{ formatFileSize(totalSize) }} au total
            </span>
          </div>
          <div class="flex items-center space-x-2">
            <button
              @click="selectAll"
              class="text-sm text-blue-600 hover:text-blue-800"
            >
              Tout sélectionner
            </button>
            <button
              v-if="selectedItems.length > 0"
              @click="deleteSelected"
              class="text-sm text-red-600 hover:text-red-800"
            >
              Supprimer ({{ selectedItems.length }})
            </button>
          </div>
        </div>
      </div>

      <!-- Vue grille -->
      <div v-if="viewMode === 'grid'" class="p-4">
        <div class="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
          <!-- Dossiers -->
          <div
            v-for="folder in filteredFolders"
            :key="'folder-' + folder.id"
            class="group relative bg-gray-50 rounded-lg p-4 hover:bg-gray-100 cursor-pointer transition-colors"
            @click="navigateToFolder(folder.id)"
          >
            <div class="flex flex-col items-center">
              <svg class="w-12 h-12 text-blue-500 mb-2" fill="currentColor" viewBox="0 0 20 20">
                <path d="M2 6a2 2 0 012-2h5l2 2h5a2 2 0 012 2v6a2 2 0 01-2 2H4a2 2 0 01-2-2V6z"></path>
              </svg>
              <span class="text-sm font-medium text-gray-900 text-center truncate w-full">
                {{ folder.name }}
              </span>
              <span class="text-xs text-gray-500 mt-1">
                {{ folder.items_count }} élément(s)
              </span>
            </div>
            <div class="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
              <button
                @click.stop="editFolder(folder)"
                class="text-gray-400 hover:text-gray-600"
              >
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z"></path>
                </svg>
              </button>
            </div>
          </div>

          <!-- Fichiers -->
          <div
            v-for="file in filteredFiles"
            :key="'file-' + file.id"
            class="group relative bg-white rounded-lg border border-gray-200 p-4 hover:shadow-md cursor-pointer transition-shadow"
            @click="previewFile(file)"
          >
            <div class="flex flex-col items-center">
              <!-- Checkbox de sélection -->
              <div class="absolute top-2 left-2">
                <input
                  v-model="selectedItems"
                  :value="file.id"
                  type="checkbox"
                  @click.stop
                  class="rounded border-gray-300 text-blue-600 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
                >
              </div>

              <!-- Icône ou miniature -->
              <div class="mb-2">
                <img
                  v-if="file.thumbnail"
                  :src="file.thumbnail"
                  :alt="file.name"
                  class="w-12 h-12 object-cover rounded"
                >
                <svg
                  v-else
                  class="w-12 h-12"
                  :class="getFileIconClass(file.type)"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path fill-rule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z" clip-rule="evenodd"></path>
                </svg>
              </div>

              <span class="text-sm font-medium text-gray-900 text-center truncate w-full mb-1">
                {{ file.name }}
              </span>
              <span class="text-xs text-gray-500">
                {{ formatFileSize(file.size) }}
              </span>
              <span class="text-xs text-gray-400 mt-1">
                {{ formatDate(file.updated_at) }}
              </span>
            </div>

            <!-- Menu d'actions -->
            <div class="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
              <div class="relative">
                <button
                  @click.stop="toggleFileMenu(file.id)"
                  class="text-gray-400 hover:text-gray-600"
                >
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z"></path>
                  </svg>
                </button>
                <div
                  v-if="activeFileMenu === file.id"
                  class="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg z-10 border border-gray-200"
                >
                  <div class="py-1">
                    <button
                      @click="downloadFile(file)"
                      class="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    >
                      Télécharger
                    </button>
                    <button
                      @click="shareFile(file)"
                      class="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    >
                      Partager
                    </button>
                    <button
                      @click="renameFile(file)"
                      class="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    >
                      Renommer
                    </button>
                    <button
                      @click="moveFile(file)"
                      class="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    >
                      Déplacer
                    </button>
                    <hr class="my-1">
                    <button
                      @click="deleteFile(file.id)"
                      class="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                    >
                      Supprimer
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Vue liste -->
      <div v-else class="overflow-x-auto">
        <table class="min-w-full divide-y divide-gray-200">
          <thead class="bg-gray-50">
            <tr>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                <input
                  v-model="selectAllChecked"
                  type="checkbox"
                  @change="toggleSelectAll"
                  class="rounded border-gray-300 text-blue-600 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
                >
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Nom
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Type
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Taille
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Modifié
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Partagé par
              </th>
              <th class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody class="bg-white divide-y divide-gray-200">
            <!-- Dossiers -->
            <tr
              v-for="folder in filteredFolders"
              :key="'folder-' + folder.id"
              class="hover:bg-gray-50 cursor-pointer"
              @click="navigateToFolder(folder.id)"
            >
              <td class="px-6 py-4 whitespace-nowrap">
                <!-- Pas de checkbox pour les dossiers -->
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <div class="flex items-center">
                  <svg class="w-5 h-5 text-blue-500 mr-3" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M2 6a2 2 0 012-2h5l2 2h5a2 2 0 012 2v6a2 2 0 01-2 2H4a2 2 0 01-2-2V6z"></path>
                  </svg>
                  <span class="text-sm font-medium text-gray-900">{{ folder.name }}</span>
                </div>
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                Dossier
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {{ folder.items_count }} élément(s)
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {{ formatDate(folder.updated_at) }}
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {{ folder.created_by ? folder.created_by.name : '-' }}
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                <button
                  @click.stop="editFolder(folder)"
                  class="text-blue-600 hover:text-blue-900 mr-3"
                >
                  Modifier
                </button>
                <button
                  @click.stop="deleteFolder(folder.id)"
                  class="text-red-600 hover:text-red-900"
                >
                  Supprimer
                </button>
              </td>
            </tr>

            <!-- Fichiers -->
            <tr
              v-for="file in filteredFiles"
              :key="'file-' + file.id"
              class="hover:bg-gray-50"
            >
              <td class="px-6 py-4 whitespace-nowrap">
                <input
                  v-model="selectedItems"
                  :value="file.id"
                  type="checkbox"
                  class="rounded border-gray-300 text-blue-600 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
                >
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <div class="flex items-center cursor-pointer" @click="previewFile(file)">
                  <img
                    v-if="file.thumbnail"
                    :src="file.thumbnail"
                    :alt="file.name"
                    class="w-8 h-8 object-cover rounded mr-3"
                  >
                  <svg
                    v-else
                    class="w-5 h-5 mr-3"
                    :class="getFileIconClass(file.type)"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path fill-rule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z" clip-rule="evenodd"></path>
                  </svg>
                  <span class="text-sm font-medium text-gray-900">{{ file.name }}</span>
                </div>
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {{ getFileTypeLabel(file.type) }}
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {{ formatFileSize(file.size) }}
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {{ formatDate(file.updated_at) }}
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {{ file.uploaded_by ? file.uploaded_by.name : '-' }}
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                <div class="flex items-center justify-end space-x-2">
                  <button
                    @click="downloadFile(file)"
                    class="text-blue-600 hover:text-blue-900"
                  >
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
                    </svg>
                  </button>
                  <button
                    @click="shareFile(file)"
                    class="text-green-600 hover:text-green-900"
                  >
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.367 2.684 3 3 0 00-5.367-2.684z"></path>
                    </svg>
                  </button>
                  <button
                    @click="deleteFile(file.id)"
                    class="text-red-600 hover:text-red-900"
                  >
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
                    </svg>
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Modal de création de dossier -->
    <CreateFolderModal
      v-if="showCreateFolder"
      :parent-folder-id="currentFolderId"
      @close="showCreateFolder = false"
      @create="createFolder"
    />

    <!-- Modal de prévisualisation -->
    <FilePreviewModal
      v-if="showPreview"
      :file="selectedFile"
      @close="showPreview = false"
    />
  </div>
</template>

<script>
import { ref, computed, onMounted } from 'vue'
import { useTranslation } from '@/composables/useTranslation'
import CreateFolderModal from './CreateFolderModal.vue'
import FilePreviewModal from './FilePreviewModal.vue'
import { projectManagementService } from '@/services/projectManagementService'

export default {
  name: 'FilesTab',
  components: {
    CreateFolderModal,
    FilePreviewModal
  },
  props: {
    projectId: {
      type: [String, Number],
      required: true
    }
  },
  setup(props) {
    // Traduction
    const { t } = useTranslation()
    
    const files = ref([])
    const folders = ref([])
    const breadcrumb = ref([])
    const currentFolderId = ref(null)
    const loading = ref(false)
    const selectedItems = ref([])
    const selectAllChecked = ref(false)
    const viewMode = ref('grid')
    const showCreateFolder = ref(false)
    const showPreview = ref(false)
    const selectedFile = ref(null)
    const activeFileMenu = ref(null)
    const fileInput = ref(null)

    const filters = ref({
      search: '',
      type: '',
      size: ''
    })

    const filteredFolders = computed(() => {
      return folders.value.filter(folder => {
        const matchesSearch = !filters.value.search || 
          folder.name.toLowerCase().includes(filters.value.search.toLowerCase())
        return matchesSearch
      })
    })

    const filteredFiles = computed(() => {
      return files.value.filter(file => {
        const matchesSearch = !filters.value.search || 
          file.name.toLowerCase().includes(filters.value.search.toLowerCase())
        
        const matchesType = !filters.value.type || getFileCategory(file.type) === filters.value.type
        
        const matchesSize = !filters.value.size || checkFileSize(file.size, filters.value.size)

        return matchesSearch && matchesType && matchesSize
      })
    })

    const filteredItems = computed(() => {
      return [...filteredFolders.value, ...filteredFiles.value]
    })

    const totalSize = computed(() => {
      return files.value.reduce((total, file) => total + file.size, 0)
    })

    const getFileCategory = (mimeType) => {
      if (mimeType.startsWith('image/')) return 'image'
      if (mimeType.startsWith('video/')) return 'video'
      if (mimeType.startsWith('audio/')) return 'audio'
      if (mimeType.includes('pdf') || mimeType.includes('document') || mimeType.includes('text')) return 'document'
      if (mimeType.includes('zip') || mimeType.includes('rar') || mimeType.includes('tar')) return 'archive'
      return 'other'
    }

    const checkFileSize = (size, filter) => {
      const mb = size / (1024 * 1024)
      switch (filter) {
        case 'small': return mb < 1
        case 'medium': return mb >= 1 && mb <= 10
        case 'large': return mb > 10 && mb <= 100
        case 'xlarge': return mb > 100
        default: return true
      }
    }

    const getFileIconClass = (mimeType) => {
      const category = getFileCategory(mimeType)
      const classes = {
        'image': 'text-green-500',
        'video': 'text-purple-500',
        'audio': 'text-yellow-500',
        'document': 'text-blue-500',
        'archive': 'text-orange-500',
        'other': 'text-gray-500'
      }
      return classes[category] || 'text-gray-500'
    }

    const getFileTypeLabel = (mimeType) => {
      const category = getFileCategory(mimeType)
      const labels = {
        'image': 'Image',
        'video': 'Vidéo',
        'audio': 'Audio',
        'document': 'Document',
        'archive': 'Archive',
        'other': 'Autre'
      }
      return labels[category] || 'Fichier'
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
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      })
    }

    const loadFiles = async () => {
      try {
        loading.value = true
        const response = await projectManagementService.getProjectFiles(props.projectId)
        if (response.success) {
          files.value = response.data || []
          folders.value = [] // Pour l'instant, pas de gestion des dossiers
          breadcrumb.value = []
        } else {
          console.error('Erreur lors du chargement des fichiers:', response.error)
          files.value = []
          folders.value = []
          breadcrumb.value = []
        }
      } catch (error) {
        console.error('Erreur lors du chargement des fichiers:', error)
        files.value = []
        folders.value = []
        breadcrumb.value = []
      } finally {
        loading.value = false
      }
    }

    const navigateToFolder = (folderId) => {
      currentFolderId.value = folderId
      loadFiles()
    }

    const handleFileUpload = async (event) => {
      const uploadedFiles = Array.from(event.target.files)
      if (uploadedFiles.length === 0) return

      try {
        loading.value = true
        for (const file of uploadedFiles) {
          await projectManagementService.uploadFile(props.projectId, file, currentFolderId.value)
        }
        await loadFiles()
        fileInput.value.value = ''
      } catch (error) {
        console.error('Erreur lors du téléchargement:', error)
      } finally {
        loading.value = false
      }
    }

    const createFolder = async (folderData) => {
      try {
        await projectManagementService.createFolder(props.projectId, {
          ...folderData,
          parent_id: currentFolderId.value
        })
        await loadFiles()
        showCreateFolder.value = false
      } catch (error) {
        console.error('Erreur lors de la création du dossier:', error)
      }
    }

    const editFolder = (folder) => {
      // Implémenter l'édition de dossier
      console.log('Éditer le dossier:', folder)
    }

    const deleteFolder = async (folderId) => {
      if (confirm(t('common.confirmations.deleteFolder'))) {
        try {
          await projectManagementService.deleteFolder(folderId)
          await loadFiles()
        } catch (error) {
          console.error('Erreur lors de la suppression:', error)
        }
      }
    }

    const previewFile = (file) => {
      selectedFile.value = file
      showPreview.value = true
    }

    const downloadFile = async (file) => {
      try {
        const response = await projectManagementService.downloadFile(file.id)
        // Convertir le contenu en data: URL pour contourner blob: bloqué par CSP
        const url = await (async () => {
          try {
            const { bytesToDataURL } = await import('@/utils/blob')
            return await bytesToDataURL(response.headers['content-type'] || 'application/octet-stream', response.data)
          } catch (_) {
            // Fallback minimaliste: construire un Blob puis blobToDataURL
            try {
              const { blobToDataURL } = await import('@/utils/blob')
              const blob = new Blob([response.data], { type: response.headers['content-type'] || 'application/octet-stream' })
              return await blobToDataURL(blob)
            } catch (_) {
              return ''
            }
          }
        })()
        const link = document.createElement('a')
        link.href = url
        link.setAttribute('download', file.name)
        document.body.appendChild(link)
        link.click()
        link.remove()
        // data: URL: pas de revoke nécessaire
      } catch (error) {
        console.error('Erreur lors du téléchargement:', error)
      }
    }

    const shareFile = (file) => {
      // Implémenter le partage de fichier
      console.log('Partager le fichier:', file)
    }

    const renameFile = (file) => {
      // Implémenter le renommage de fichier
      console.log('Renommer le fichier:', file)
    }

    const moveFile = (file) => {
      // Implémenter le déplacement de fichier
      console.log('Déplacer le fichier:', file)
    }

    const deleteFile = async (fileId) => {
      if (confirm(t('common.confirmations.deleteFile'))) {
        try {
          await projectManagementService.deleteFile(fileId)
          await loadFiles()
        } catch (error) {
          console.error('Erreur lors de la suppression:', error)
        }
      }
    }

    const deleteSelected = async () => {
      if (selectedItems.value.length === 0) return
      
      if (confirm(t('common.confirmations.deleteMultipleFiles', { count: selectedItems.value.length }))) {
        try {
          for (const fileId of selectedItems.value) {
            await projectManagementService.deleteFile(fileId)
          }
          selectedItems.value = []
          await loadFiles()
        } catch (error) {
          console.error('Erreur lors de la suppression:', error)
        }
      }
    }

    const selectAll = () => {
      if (selectedItems.value.length === filteredFiles.value.length) {
        selectedItems.value = []
      } else {
        selectedItems.value = filteredFiles.value.map(file => file.id)
      }
    }

    const toggleSelectAll = () => {
      if (selectAllChecked.value) {
        selectedItems.value = filteredFiles.value.map(file => file.id)
      } else {
        selectedItems.value = []
      }
    }

    const toggleFileMenu = (fileId) => {
      activeFileMenu.value = activeFileMenu.value === fileId ? null : fileId
    }

    onMounted(() => {
      loadFiles()
    })

    return {
      // Traduction
      t,
      
      // État
      files,
      folders,
      breadcrumb,
      currentFolderId,
      loading,
      selectedItems,
      selectAllChecked,
      viewMode,
      showCreateFolder,
      showPreview,
      selectedFile,
      activeFileMenu,
      fileInput,
      filters,
      filteredFolders,
      filteredFiles,
      filteredItems,
      totalSize,
      getFileIconClass,
      getFileTypeLabel,
      formatFileSize,
      formatDate,
      navigateToFolder,
      handleFileUpload,
      createFolder,
      editFolder,
      deleteFolder,
      previewFile,
      downloadFile,
      shareFile,
      renameFile,
      moveFile,
      deleteFile,
      deleteSelected,
      selectAll,
      toggleSelectAll,
      toggleFileMenu
    }
  }
}
</script>

<style scoped>
/* Styles spécifiques au composant */
.drag-over {
  @apply border-blue-500 bg-blue-50 border-dashed border-2;
}

.drag-active {
  @apply border-blue-400 border-dashed border-2;
}
</style>