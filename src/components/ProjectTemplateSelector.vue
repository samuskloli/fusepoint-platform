<template>
  <div class="template-selector=selector-header header-content='header-title=fas fa-layer-group mr-3"></i>
          {{ t('projectTemplates.selectTemplate="header-description=header-actions='showCreateTemplate = true="create-template-btn=canCreateTemplates="fas fa-plus mr-2'></i>
          {{ t('projectTemplates.createTemplate="filters-section=search-filters="search-box='fas fa-search search-icon=searchQuery="text="search-input=t('projectTemplates.searchTemplates='selectedCategory="filter-select=">{{ t('projectTemplates.allCategories='category in templateCategories=category.value="category.value="sortBy=filter-select='name="created_at=usage_count="rating='toggleSortOrder=sort-order-btn="sortOrder === 'asc="sortOrder === 'asc=view-controls='view-toggle="viewMode = 'grid={ active: viewMode === 'grid="view-btn'{ active: viewMode === 'list="view-btn=fas fa-list="results-info='loading=loading-state="loading-spinner="fas fa-spinner fa-spin text-3xl text-blue-600'></i>
        <p class="loading-text=templates.length === 0" class="empty-state=empty-content='fas fa-layer-group text-6xl text-gray-300 mb-4"></i>
        <h 3 class="empty-title=empty-description='showCreateTemplate = true="create-first-template-btn=canCreateTemplates="fas fa-plus mr-2'></i>
          {{ t('projectTemplates.createFirstTemplate="filteredTemplates.length === 0 class="no-results-state=no-results-content='fas fa-search text-4xl text-gray-300 mb-4"></i>
        <h 3 class="no-results-title=no-results-description='clearFilters="clear-filters-btn=templates-container="viewMode === 'grid='templates-grid"template-card={ selected: selectedTemplate?.id === template.id }"
          @click="selectTemplate(template)'
        >
          <div class(card-header=template-category getCategoryIcon(template.category) class="category-icon=category-name='template-actions="toggleFavorite(template)"
                class="action-btn favorite-btn={ active: template.is_favorite }'
              >
                <i :class="template.is_favorite ? 'fas fa-heart=dropdown=canManageTemplate(template)">
                <button   
                  @click.stop="toggleDropdown(template.id)'
                  class="action-btn dropdown-btn=fas fa-ellipsis-v=""activeDropdown === template.id='dropdown-menu=editTemplate(template)"
                    class="dropdown-item=fas fa-edit mr-2'></i>
                    {{ t('common.edit === duplicateTemplate(template)
                    class === "dropdown-item=fas fa-copy mr-2'></i>
                    {{ t('common.duplicate === shareTemplate(template)"
                    class === dropdown-item=fas fa-share mr-2'></i>
                    {{ t('common.share === dropdown-divider=deleteTemplate(template)"
                    class === dropdown-item danger=fas fa-trash mr-2'></i>
                    {{ t('common.delete === card-content=template-name === template-description='template-meta=meta-row === meta-item === fas fa-clock mr-1'></i>
                  {{ template.estimated_duration }} {{ t(`projectTemplates.${template.duration_unit}`) }}
                </span>
                
                <span class="meta-item=fas fa-puzzle-piece mr-1"></i>
                  {{ template.widgets?.length || 0 }} {{ t('widgets.widgets="meta-row=meta-item='fas fa-users mr-1"></i>
                  {{ template.usage_count || 0 }} {{ t('projectTemplates.uses="template-rating=stars='i in 5" 
                      :key="i=i &lt;= (template.rating || 0) ? 'fas fa-star=star='rating-text=template-tags="template.tags?.length="tag in template.tags.slice(0, 3)' 
                :key="tag=tag=template.tags.length &gt; 3" class="tag more-tags=card-footer='template-status="status-badge=getStatusClass(template.status)"
              >
                {{ t(`projectTemplates.${template.status}`) }}
              </span>
              
              <span  v-if="template.is_public=public-badge=fas fa-globe mr-1'></i>
                {{ t('projectTemplates.public === useTemplate(template)
              class === use-template-btn=template.status !== 'active='templates-list === list-header=list-header-cell name-header === list-header-cell category-header='list-header-cell duration-header=list-header-cell widgets-header === list-header-cell usage-header === list-header-cell rating-header=list-header-cell status-header='list-header-cell actions-header === template in paginatedTemplates=template.id === list-row'
          @click === selectTemplate(template)"
        >
          <div  class === list-cell name-cell=template-info template-name='template-description=list-cell category-cell === category-badge === getCategoryIcon(template.category)' class === category-icon=list-cell duration-cell === duration-text='list-cell widgets-cell=widgets-count === list-cell usage-cell === usage-count=list-cell rating-cell='rating-display === stars=i in 5" 
                  :key === i=i &lt;= (template.rating || 0) ? 'fas fa-star=star='rating-text=list-cell status-cell === status-badge === getStatusClass(template.status)'
            >
              {{ t(`projectTemplates.${template.status}`) }}
            </div>
          </div>
          
          <div class="list-cell actions-cell=row-actions toggleFavorite(template)
                class="row-action-btn={ active: template.is_favorite }'
              >
                <i  :class="template.is_favorite ? 'fas fa-heart=useTemplate(template)"
                class="row-action-btn primary=template.status !== 'active='fas fa-play="dropdown=canManageTemplate(template)>
                <button   
                  @click.stop="toggleDropdown(template.id)'
                  class="row-action-btn=fas fa-ellipsis-v=""activeDropdown === template.id='dropdown-menu=editTemplate(template)"
                    class="dropdown-item=fas fa-edit mr-2'></i>
                    {{ t('common.edit="duplicateTemplate(template)
                    class=""dropdown-item=fas fa-copy mr-2'></i>
                    {{ t('common.duplicate="shareTemplate(template)"
                    class="dropdown-item=fas fa-share mr-2'></i>
                    {{ t('common.share="dropdown-divider=deleteTemplate(template)"
                    class="dropdown-item danger=fas fa-trash mr-2'></i>
                    {{ t('common.delete="totalPages &gt; 1" class="pagination=currentPage = 1'
          :disabled="currentPage === 1"
          class="pagination-btn=fas fa-angle-double-left='currentPage--="currentPage === 1"
          class="pagination-btn=fas fa-angle-left='pagination-info="current-page=page-separator="total-pages='currentPage++"
          ::disabled="currentPage === totalPages=pagination-btn=fas fa-angle-right='currentPage = totalPages=currentPage === totalPages || pagination-btn="fas fa-angle-double-right=showCreateTemplate='showCreateTemplate="editingTemplate=closeTemplateModal="handleTemplateSaved='showCustomization=showCustomization="selectedTemplate="showCustomization = false=handleProjectCreated='handleProjectPreview"
    />
  </div>
</template>

<script>
import { ref, computed, onMounted, watch } from 'vue'
import projectTemplateService from '@/services/projectTemplateService'
import { useNotifications } from '@/composables/useNotifications'
import { useAuth } from '@/composables/useAuth'
import { useTranslation } from '@/composables/useTranslation'
import ProjectTemplateModal from '@/components/modals/ProjectTemplateModal.vue'
import ProjectCustomizationModal from '@/components/modals/ProjectCustomizationModal.vue'

export default {
  name: 'ProjectTemplateSelector',
  components: {
    ProjectTemplateModal,
    ProjectCustomizationModal
  },
  emits: ['template-selected', 'project-created'],
  setup(props, { emit }) {
    const { success, error: showError, confirm } = useNotifications()
    const { user, hasPermission } = useAuth()
    const { t } = useTranslation()
    
    // État réactif
    const loading = ref(false)
    const templates = ref([])
    const selectedTemplate = ref(null)
    const searchQuery = ref('')
    const selectedCategory = ref('')
    const sortBy = ref('name')
    const sortOrder = ref('asc')
    const viewMode = ref('grid')
    const currentPage = ref(1)
    const itemsPerPage = ref(12)
    const activeDropdown = ref(null)
    
    // Modales
    const showCreateTemplate = ref(false)
    const showCustomization = ref(false)
    const editingTemplate = ref(null)
    
    // Propriétés calculées
    const templateCategories = computed(() => {
      return projectTemplateService.getTemplateCategories()
    })
    
    const canCreateTemplates = computed(() => {
      return hasPermission('create_templates')
    })
    
    const filteredTemplates = computed(() => {
      let filtered = templates.value
      
      // Filtrage par recherche
      if (searchQuery.value) {
        const query = searchQuery.value.toLowerCase()
        filtered = filtered.filter(template => 
          template.name.toLowerCase().includes(query) ||
          template.description.toLowerCase().includes(query) ||
          template.tags?.some(tag => tag.toLowerCase().includes(query))
        )
      }
      
      // Filtrage par catégorie
      if (selectedCategory.value) {
        filtered = filtered.filter(template => template.category === selectedCategory.value)
      }
      
      // Tri
      filtered.sort((a, b) => {
        let aValue = a[sortBy.value]
        let bValue = b[sortBy.value]
        
        if (sortBy.value === 'created_at') {
          aValue = new Date(aValue)
          bValue = new Date(bValue)
        }
        
        if (sortOrder.value === 'asc') {
          return aValue > bValue ? 1 : -1
        } else {
          return aValue < bValue ? 1 : -1
        }
      })
      
      return filtered
    })
    
    const totalPages = computed(() => {
      return Math.ceil(filteredTemplates.value.length / itemsPerPage.value)
    })
    
    const paginatedTemplates = computed(() => {
      const start = (currentPage.value - 1) * itemsPerPage.value
      const end = start + itemsPerPage.value
      return filteredTemplates.value.slice(start, end)
    })
    
    // Méthodes
    const loadTemplates = async () => {
      loading.value = true
      
      try {
        const result = await projectTemplateService.getTemplates()
        if (result.success) {
          templates.value = result.data
        }
      } catch (err) {
        showError(t('errors.loadingFailed'))
      } finally {
        loading.value = false
      }
    }
    
    const selectTemplate = (template) => {
      selectedTemplate.value = template
      emit('template-selected', template)
    }
    
    const useTemplate = (template) => {
      if (template.status !== 'active') return
      
      selectedTemplate.value = template
      showCustomization.value = true
    }
    
    const toggleFavorite = async (template) => {
      try {
        const result = await projectTemplateService.toggleTemplateFavorite(template.id)
        if (result.success) {
          template.is_favorite = !template.is_favorite
        }
      } catch (err) {
        showError(t('errors.updateFailed'))
      }
    }
    
    const canManageTemplate = (template) => {
      return template.created_by === user.value?.id || hasPermission('manage_all_templates')
    }
    
    const toggleDropdown = (templateId) => {
      activeDropdown.value = activeDropdown.value === templateId ? null : templateId
    }
    
    const editTemplate = (template) => {
      editingTemplate.value = template
      showCreateTemplate.value = true
      activeDropdown.value = null
    }
    
    const duplicateTemplate = async (template) => {
      try {
        const result = await projectTemplateService.duplicateTemplate(template.id)
        if (result.success) {
          success(t('projectTemplates.templateDuplicated'))
          await loadTemplates()
        }
      } catch (err) {
        showError(t('errors.duplicatingFailed'))
      } finally {
        activeDropdown.value = null
      }
    }
    
    const shareTemplate = (template) => {
      // Logique de partage
      activeDropdown.value = null
    }
    
    const deleteTemplate = async (template) => {
      const confirmed = await confirm(
        t('projectTemplates.deleteConfirmation'),
        t('projectTemplates.deleteConfirmationMessage', { name: template.name })
      )
      
      if (confirmed) {
        try {
          const result = await projectTemplateService.deleteTemplate(template.id)
          if (result.success) {
            success(t('projectTemplates.templateDeleted'))
            await loadTemplates()
          }
        } catch (err) {
          showError(t('errors.deletingFailed'))
        }
      }
      
      activeDropdown.value = null
    }
    
    const getCategoryIcon = (category) => {
      const categoryMap = {
        marketing: 'fas fa-bullhorn',
        development: 'fas fa-code',
        design: 'fas fa-palette',
        business: 'fas fa-briefcase',
        education: 'fas fa-graduation-cap',
        other: 'fas fa-folder'
      }
      
      return categoryMap[category] || 'fas fa-folder'
    }
    
    const getStatusClass = (status) => {
      const statusMap = {
        active: 'status-active',
        draft: 'status-draft',
        archived: 'status-archived'
      }
      
      return statusMap[status] || 'status-draft'
    }
    
    const toggleSortOrder = () => {
      sortOrder.value = sortOrder.value === 'asc' ? 'desc' : 'asc'
    }
    
    const clearFilters = () => {
      searchQuery.value = ''
      selectedCategory.value = ''
      sortBy.value = 'name'
      sortOrder.value = 'asc'
      currentPage.value = 1
    }
    
    const closeTemplateModal = () => {
      showCreateTemplate.value = false
      editingTemplate.value = null
    }
    
    const handleTemplateSaved = async () => {
      await loadTemplates()
      closeTemplateModal()
    }
    
    const handleProjectCreated = (project) => {
      emit('project-created', project)
      showCustomization.value = false
    }
    
    const handleProjectPreview = (previewData) => {
      // Logique de prévisualisation
      console.log('Preview data:', previewData)
    }
    
    // Watchers
    watch([searchQuery, selectedCategory, sortBy, sortOrder], () => {
      currentPage.value = 1
    })
    
    // Fermer le dropdown quand on clique ailleurs
    const handleClickOutside = () => {
      activeDropdown.value = null
    }
    
    onMounted(() => {
      loadTemplates()
      document.addEventListener('click', handleClickOutside)
    })
    
    return {
      loading,
      templates,
      selectedTemplate,
      searchQuery,
      selectedCategory,
      sortBy,
      sortOrder,
      viewMode,
      currentPage,
      activeDropdown,
      showCreateTemplate,
      showCustomization,
      editingTemplate,
      templateCategories,
      canCreateTemplates,
      filteredTemplates,
      totalPages,
      paginatedTemplates,
      selectTemplate,
      useTemplate,
      toggleFavorite,
      canManageTemplate,
      toggleDropdown,
      editTemplate,
      duplicateTemplate,
      shareTemplate,
      deleteTemplate,
      getCategoryIcon,
      getStatusClass,
      toggleSortOrder,
      clearFilters,
      closeTemplateModal,
      handleTemplateSaved,
      handleProjectCreated,
      handleProjectPreview,
      t
    }
  }
}
</script>

<style scoped>
.template-selector {
  @apply space-y-6;
}

/* En-tête */
.selector-header {
  @apply flex items-start justify-between;
}

.header-content {
  @apply flex-1;
}

.header-title {
  @apply text-2xl font-bold text-gray-900 flex items-center;
}

.header-description {
  @apply text-gray-600 mt-2;
}

.header-actions {
  @apply flex items-center space-x-3;
}

.create-template-btn {
  @apply px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center;
}

/* Filtres */
.filters-section {
  @apply bg-white rounded-lg border border-gray-200 p-4;
}

.search-filters {
  @apply flex items-center justify-between flex-wrap gap-4 mb-4;
}

.search-box {
  @apply relative flex-1 max-w-md;
}

.search-icon {
  @apply absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400;
}

.search-input {
  @apply w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500;
}

.filter-controls {
  @apply flex items-center space-x-3;
}

.filter-select {
  @apply px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500;
}

.sort-order-btn {
  @apply p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors;
}

.view-controls {
  @apply flex items-center justify-between;
}

.view-toggle {
  @apply flex items-center space-x-1 bg-gray-100 rounded-lg p-1;
}

.view-btn {
  @apply px-3 py-2 text-gray-600 hover:text-gray-900 rounded-md transition-colors;
}

.view-btn.active {
  @apply bg-white text-blue-600 shadow-sm;
}

.results-info {
  @apply text-sm text-gray-600;
}

/* États */
.loading-state {
  @apply flex items-center justify-center py-20;
}

.loading-spinner {
  @apply text-center;
}

.loading-text {
  @apply mt-4 text-gray-600;
}

.empty-state,
.no-results-state {
  @apply flex items-center justify-center py-20;
}

.empty-content,
.no-results-content {
  @apply text-center max-w-md;
}

.empty-title,
.no-results-title {
  @apply text-xl font-semibold text-gray-900 mb-2;
}

.empty-description,
.no-results-description {
  @apply text-gray-600 mb-6;
}

.create-first-template-btn,
.clear-filters-btn {
  @apply px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors;
}

/* Vue grille */
.templates-grid {
  @apply grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6;
}

.template-card {
  @apply bg-white border border-gray-200 rounded-lg hover:shadow-md transition-shadow cursor-pointer;
}

.template-card.selected {
  @apply border-blue-500 ring-2 ring-blue-200;
}

.card-header {
  @apply flex items-center justify-between p-4 border-b border-gray-100;
}

.template-category {
  @apply flex items-center space-x-2;
}

.category-icon {
  @apply text-gray-600;
}

.category-name {
  @apply text-sm font-medium text-gray-700;
}

.template-actions {
  @apply flex items-center space-x-1;
}

.action-btn {
  @apply w-8 h-8 flex items-center justify-center text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100 transition-colors;
}

.favorite-btn.active {
  @apply text-red-500;
}

.dropdown {
  @apply relative;
}

.dropdown-btn {
  @apply w-8 h-8 flex items-center justify-center text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100 transition-colors;
}

.dropdown-menu {
  @apply absolute right-0 top-full mt-1 w-48 bg-white border border-gray-200 rounded-lg shadow-lg z-10;
}

.dropdown-item {
  @apply w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center;
}

.dropdown-item.danger {
  @apply text-red-600 hover:bg-red-50;
}

.dropdown-divider {
  @apply border-gray-200 my-1;
}

.card-content {
  @apply p-4 space-y-3;
}

.template-name {
  @apply text-lg font-semibold text-gray-900;
}

.template-description {
  @apply text-sm text-gray-600 line-clamp-2;
}

.template-meta {
  @apply space-y-2;
}

.meta-row {
  @apply flex items-center justify-between;
}

.meta-item {
  @apply text-xs text-gray-500 flex items-center;
}

.template-rating {
  @apply flex items-center space-x-1;
}

.stars {
  @apply flex items-center space-x-1;
}

.star {
  @apply text-xs text-yellow-400;
}

.rating-text {
  @apply text-xs text-gray-500;
}

.template-tags {
  @apply flex items-center flex-wrap gap-1;
}

.tag {
  @apply px-2 py-1 text-xs bg-gray-100 text-gray-600 rounded;
}

.more-tags {
  @apply bg-blue-100 text-blue-600;
}

.card-footer {
  @apply flex items-center justify-between p-4 border-t border-gray-100;
}

.template-status {
  @apply flex items-center space-x-2;
}

.status-badge {
  @apply px-2 py-1 text-xs font-medium rounded;
}

.status-active {
  @apply bg-green-100 text-green-800;
}

.status-draft {
  @apply bg-yellow-100 text-yellow-800;
}

.status-archived {
  @apply bg-gray-100 text-gray-800;
}

.public-badge {
  @apply px-2 py-1 text-xs bg-blue-100 text-blue-600 rounded flex items-center;
}

.use-template-btn {
  @apply px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed;
}

/* Vue liste */
.templates-list {
  @apply bg-white border border-gray-200 rounded-lg overflow-hidden;
}

.list-header {
  @apply grid grid-cols-8 gap-4 p-4 bg-gray-50 border-b border-gray-200 text-sm font-medium text-gray-700;
}

.list-header-cell {
  @apply flex items-center;
}

.name-header {
  @apply col-span-2;
}

.list-row {
  @apply grid grid-cols-8 gap-4 p-4 border-b border-gray-100 hover:bg-gray-50 cursor-pointer;
}

.list-row.selected {
  @apply bg-blue-50 border-blue-200;
}

.list-cell {
  @apply flex items-center;
}

.name-cell {
  @apply col-span-2;
}

.template-info {
  @apply space-y-1;
}

.template-name {
  @apply text-sm font-medium text-gray-900;
}

.template-description {
  @apply text-xs text-gray-600 line-clamp-1;
}

.category-badge {
  @apply flex items-center space-x-2 px-2 py-1 bg-gray-100 rounded text-sm;
}

.duration-text,
.widgets-count,
.usage-count {
  @apply text-sm text-gray-700;
}

.rating-display {
  @apply flex items-center space-x-1;
}

.row-actions {
  @apply flex items-center space-x-1;
}

.row-action-btn {
  @apply w-8 h-8 flex items-center justify-center text-gray-400 hover:text-gray-600 rounded hover:bg-gray-100 transition-colors;
}

.row-action-btn.primary {
  @apply text-blue-600 hover:text-blue-700;
}

.row-action-btn.active {
  @apply text-red-500;
}

/* Pagination */
.pagination {
  @apply flex items-center justify-center space-x-2 mt-6;
}

.pagination-btn {
  @apply w-10 h-10 flex items-center justify-center text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed;
}

.pagination-info {
  @apply flex items-center space-x-1 px-4 py-2 text-sm text-gray-700;
}

.current-page {
  @apply font-medium;
}

.page-separator {
  @apply text-gray-400;
}

.total-pages {
  @apply text-gray-600;
}
</style>