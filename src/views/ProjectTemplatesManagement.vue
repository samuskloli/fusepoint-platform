<template>
  <RoleLayout>
    <!-- Contenu principal -->
    <div class="flex-1 flex flex-col overflow-hidden">
      <!-- En-tête -->
      <div class="bg-white shadow-sm border-b border-gray-200 px-6 py-4">
        <div class="flex items-center justify-between">
          <div>
            <h1 class="text-2xl font-bold text-gray-900">{{ t('projectTemplates.management.title') }}</h1>
            <p class="text-gray-600 mt-1">{{ t('projectTemplates.management.subtitle') }}</p>
          </div>
          <button 
            @click="showCreateTemplateModal = true"
            class="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors"
          >
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path>
            </svg>
            <span>{{ t('projectTemplates.management.createTemplate') }}</span>
          </button>
        </div>
      </div>

      <!-- Filtres et recherche -->
      <div class="bg-white px-6 py-4 border-b border-gray-200">
        <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
          <div class="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-4">
            <!-- Barre de recherche -->
            <div class="relative">
              <input 
                v-model="searchQuery" 
                type="text" 
                :placeholder="t('common.search')" 
                class="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent w-64"
              >
              <svg class="absolute left-3 top-2.5 h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
              </svg>
            </div>
            
            <!-- Filtre par catégorie -->
            <select v-model="selectedCategory" class="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent">
              <option value="">{{ t('projectTemplates.management.allCategories') }}</option>
              <option value="marketing">{{ t('projectTemplates.categories.marketing') }}</option>
              <option value="development">{{ t('projectTemplates.categories.development') }}</option>
              <option value="design">{{ t('projectTemplates.categories.design') }}</option>
              <option value="consulting">{{ t('projectTemplates.categories.consulting') }}</option>
            </select>
          </div>
          
          <!-- Mode d'affichage -->
          <div class="flex items-center space-x-2">
            <button  
              @click="viewMode = 'grid'"
              :class="[
                'p-2 rounded-lg transition-colors',
                viewMode === 'grid' ? 'bg-blue-100 text-blue-600' : 'text-gray-400 hover:text-gray-600'
              ]"
            >
              <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path d="M5 3a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2V5a2 2 0 00-2-2H5zM5 11a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2v-2a2 2 0 00-2-2H5zM11 5a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V5zM11 13a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z"></path>
              </svg>
            </button>
            <button  
              @click="viewMode = 'list'"
              :class="[
                'p-2 rounded-lg transition-colors',
                viewMode === 'list' ? 'bg-blue-100 text-blue-600' : 'text-gray-400 hover:text-gray-600'
              ]"
            >
              <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clip-rule="evenodd"></path>
              </svg>
            </button>
          </div>
        </div>
      </div>
      
      <!-- Contenu principal -->
      <div class="flex-1 overflow-auto p-6">
        <!-- État de chargement -->
        <div v-if="loading" class="flex items-center justify-center h-64">
          <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>

        <!-- Aucun template -->
        <div v-else-if="filteredTemplates.length === 0" class="text-center py-12">
          <svg class="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
          </svg>
          <h3 class="mt-2 text-sm font-medium text-gray-900">{{ t('projectTemplates.management.noTemplates') }}</h3>
          <p class="mt-1 text-sm text-gray-500">{{ t('projectTemplates.management.noTemplatesDescription') }}</p>
          <div class="mt-6">
            <button  
              @click="showCreateTemplateModal = true"
              class="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              <svg class="-ml-1 mr-2 h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path>
              </svg>
              {{ t('projectTemplates.management.createFirstTemplate') }}
            </button>
          </div>
        </div>

        <!-- Affichage en grille -->
        <div v-else-if="viewMode === 'grid'" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div
            v-for="template in filteredTemplates"
            :key="template.id"
            class="bg-white rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow p-6"
          >
            <div class="flex items-center justify-between mb-4">
              <div class="flex items-center space-x-3">
                <div class="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                  <svg class="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
                  </svg>
                </div>
                <div>
                  <h3 class="text-lg font-medium text-gray-900">{{ template.name }}</h3>
                  <p class="text-sm text-gray-500">{{ template.description }}</p>
                </div>
              </div>
              <div class="flex items-center space-x-2">
                <button  
                  @click="editTemplate(template)"
                  class="text-gray-400 hover:text-gray-600 transition-colors"
                  :title="t('common.edit')"
                >
                  <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path>
                  </svg>
                </button>
                <button  
                  @click="duplicateTemplate(template)"
                  class="text-gray-400 hover:text-gray-600 transition-colors"
                  :title="t('common.duplicate')"
                >
                  <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"></path>
                  </svg>
                </button>
                <button  
                  @click="deleteTemplate(template)"
                  class="text-red-400 hover:text-red-600 transition-colors"
                  :title="t('common.delete')"
                >
                  <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
                  </svg>
                </button>
              </div>
            </div>
            
            <div class="flex items-center justify-between">
              <span class="px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded-full">{{ getCategoryLabel(template.categorie) }}</span>
              <span class="text-sm text-gray-500">
                {{ template.widgets?.length || 0 }} {{ t('projectTemplates.management.widgets') }}
              </span>
            </div>
          </div>
        </div>

        <!-- Affichage en liste -->
        <div v-else class="bg-white shadow-sm rounded-lg overflow-hidden">
          <table class="min-w-full divide-y divide-gray-200">
            <thead class="bg-gray-50">
              <tr>
                <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{{ t('projectTemplates.management.name') }}</th>
                <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{{ t('projectTemplates.management.description') }}</th>
                <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{{ t('projectTemplates.management.category') }}</th>
                <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{{ t('projectTemplates.management.widgets') }}</th>
                <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{{ t('common.actions') }}</th>
              </tr>
            </thead>
            <tbody class="bg-white divide-y divide-gray-200">
              <tr v-for="template in filteredTemplates" :key="template.id" class="hover:bg-gray-50">
                <td class="px-6 py-4 whitespace-nowrap">
                  <div class="flex items-center">
                    <div class="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center mr-4">
                      <svg class="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
                      </svg>
                    </div>
                    <div>
                      <div class="text-sm font-medium text-gray-900">{{ template.name }}</div>
                      <div class="text-sm text-gray-500">{{ template.description }}</div>
                    </div>
                  </div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                  <span class="px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded-full">{{ getCategoryLabel(template.categorie) }}</span>
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {{ template.widgets?.length || 0 }}
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <div class="flex items-center space-x-3">
                    <button   
                      @click="editTemplate(template)"
                      class="text-blue-600 hover:text-blue-900 transition-colors"
                      :title="t('common.edit')"
                    >
                      <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path>
                      </svg>
                    </button>
                    <button   
                      @click="duplicateTemplate(template)"
                      class="text-gray-600 hover:text-gray-900 transition-colors"
                      :title="t('common.duplicate')"
                    >
                      <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"></path>
                      </svg>
                    </button>
                    <button   
                      @click="deleteTemplate(template)"
                      class="text-red-600 hover:text-red-900 transition-colors"
                      :title="t('common.delete')"
                    >
                      <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
      </div>

    <!-- Modals -->
    <ProjectTemplateModal
      v-if="showCreateTemplateModal || showEditTemplateModal"
      :template="selectedTemplate"
      @close="closeTemplateModal"
      @saved="handleTemplateSaved"
    />

    <TemplateWidgetsModal
      v-if="showWidgetsModal"
      :template="selectedTemplate"
      @close="showWidgetsModal = false"
      @updated="handleWidgetsUpdated"
    />

    <ConfirmDeleteModal
      v-if="showDeleteModal"
      :title="t('projectTemplates.management.deleteTemplate')"
      :message="t('projectTemplates.management.deleteConfirmMessage', { name: templateToDelete?.name })"
      @confirm="confirmDeleteTemplate"
      @cancel="showDeleteModal = false"
    />
  </RoleLayout>
</template>

<script>
import { ref, computed, onMounted } from 'vue'
import { useTranslation } from '@/composables/useTranslation'
import RoleLayout from '@/components/RoleLayout.vue'
import ProjectTemplateModal from '@/components/modals/ProjectTemplateModal.vue'
import ConfirmDeleteModal from '@/components/ConfirmDeleteModal.vue'
import { useProjectTemplates } from '@/composables/useProjectTemplates'
import TemplateWidgetsModal from '@/components/agent/modals/TemplateWidgetsModal.vue'

export default {
  name: 'ProjectTemplatesManagement',
  components: {
    RoleLayout,
    ProjectTemplateModal,
    ConfirmDeleteModal,
    TemplateWidgetsModal
  },
  setup() {
    const { t } = useTranslation()
    const { 
      templates, 
      loading, 
      loadTemplates: getTemplates, 
      createTemplate, 
      updateTemplate, 
      deleteTemplate: deleteTemplateService,
      duplicateTemplate: duplicateTemplateService 
    } = useProjectTemplates()
    
    // État réactif
    const searchQuery = ref('')
    const selectedCategory = ref('')
    const viewMode = ref('grid')
    
    // Modals
    const showCreateTemplateModal = ref(false)
    const showEditTemplateModal = ref(false)
    const showDeleteModal = ref(false)
    const showWidgetsModal = ref(false)
    const selectedTemplate = ref(null)
    const templateToDelete = ref(null)
    
    // Templates filtrés
    const filteredTemplates = computed(() => {
      let filtered = templates.value
      
      if (searchQuery.value) {
        const query = searchQuery.value.toLowerCase()
        filtered = filtered.filter(template => 
          template.name?.toLowerCase().includes(query) ||
          template.description?.toLowerCase().includes(query)
        )
      }
      
      if (selectedCategory.value) {
        filtered = filtered.filter(template => template.categorie === selectedCategory.value)
      }
      
      return filtered
    })
    
    // Méthodes
    const loadTemplates = async () => {
      try {
        await getTemplates()
      } catch (error) {
        console.error('Erreur lors du chargement des templates:', error)
      }
    }
    
    const editTemplate = (template) => {
      selectedTemplate.value = template
      showEditTemplateModal.value = true
    }
    
    const manageWidgets = (template) => {
      selectedTemplate.value = template
      showWidgetsModal.value = true
    }
    
    const handleWidgetsUpdated = async () => {
      await loadTemplates()
      showWidgetsModal.value = false
    }
    
    const duplicateTemplate = async (template) => {
      try {
        await duplicateTemplateService(template.id)
        await loadTemplates()
      } catch (error) {
        console.error('Erreur lors de la duplication du template:', error)
      }
    }
    
    const deleteTemplate = (template) => {
      templateToDelete.value = template
      showDeleteModal.value = true
    }
    
    const confirmDeleteTemplate = async () => {
      try {
        await deleteTemplateService(templateToDelete.value.id)
        await loadTemplates()
        showDeleteModal.value = false
        templateToDelete.value = null
      } catch (error) {
        console.error('Erreur lors de la suppression du template:', error)
      }
    }
    
    const closeTemplateModal = () => {
      showCreateTemplateModal.value = false
      showEditTemplateModal.value = false
      selectedTemplate.value = null
    }
    
    const handleTemplateSaved = async () => {
      await loadTemplates()
      closeTemplateModal()
    }
    
    const getCategoryLabel = (category) => {
      const categories = {
        marketing: t('projectTemplates.categories.marketing'),
        development: t('projectTemplates.categories.development'),
        design: t('projectTemplates.categories.design'),
        consulting: t('projectTemplates.categories.consulting')
      }
      return categories[category] || category
    }
    
    // Chargement initial
    onMounted(() => {
      loadTemplates()
    })
    
    return {
      t,
      templates,
      loading,
      searchQuery,
      selectedCategory,
      viewMode,
      showCreateTemplateModal,
      showEditTemplateModal,
      showDeleteModal,
      showWidgetsModal,
      selectedTemplate,
      templateToDelete,
      filteredTemplates,
      editTemplate,
      manageWidgets,
      handleWidgetsUpdated,
      duplicateTemplate,
      deleteTemplate,
      confirmDeleteTemplate,
      closeTemplateModal,
      handleTemplateSaved,
      getCategoryLabel
    }
  }
}
</script>

<style scoped>
/* scoped styles for ProjectTemplatesManagement */
</style>