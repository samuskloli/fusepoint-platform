<template>
  <div class="template-selector">
    <!-- En-tête -->
    <div class="selector-header">
      <div class="header-content">
        <h2 class="header-title">
          <i class="fas fa-layer-group mr-3"></i>
          {{ t('projectTemplates.selectTemplate') }}
        </h2>
        <p class="header-description">
          {{ t('projectTemplates.selectTemplateDescription') }}
        </p>
      </div>
      <div class="header-actions">
        <button 
          @click="showCreateTemplate = true"
          class="create-template-btn"
          v-if="canCreateTemplates"
        >
          <i class="fas fa-plus mr-2"></i>
          {{ t('projectTemplates.createTemplate') }}
        </button>
      </div>
    </div>

    <!-- Filtres -->
    <div class="filters-section">
      <div class="search-filters">
        <div class="search-box">
          <i class="fas fa-search search-icon"></i>
          <input 
            v-model="searchQuery"
            type="text"
            class="search-input"
            :placeholder="t('projectTemplates.searchTemplates')"
          />
        </div>
        
        <select v-model="selectedCategory" class="filter-select">
          <option value="">{{ t('projectTemplates.allCategories') }}</option>
          <option 
            v-for="category in templateCategories" 
            :key="category.value"
            :value="category.value"
          >
            {{ category.label }}
          </option>
        </select>
        
        <select v-model="sortBy" class="filter-select">
          <option value="name">{{ t('common.name') }}</option>
          <option value="created_at">{{ t('common.dateCreated') }}</option>
          <option value="usage_count">{{ t('projectTemplates.popularity') }}</option>
          <option value="rating">{{ t('common.rating') }}</option>
        </select>
        
        <button @click="toggleSortOrder" class="sort-order-btn">
          <i :class="sortOrder === 'asc' ? 'fas fa-sort-up' : 'fas fa-sort-down'"></i>
        </button>
      </div>
      
      <div class="view-controls">
        <div class="view-toggle">
          <button 
            @click="viewMode = 'grid'"
            :class="{ active: viewMode === 'grid' }"
            class="view-btn"
          >
            <i class="fas fa-th"></i>
          </button>
          <button 
            @click="viewMode = 'list'"
            :class="{ active: viewMode === 'list' }"
            class="view-btn"
          >
            <i class="fas fa-list"></i>
          </button>
        </div>
      </div>
    </div>

    <!-- Informations sur les résultats -->
    <div class="results-info">
      <span v-if="loading" class="loading-state">
        <i class="fas fa-spinner fa-spin text-3xl text-blue-600"></i>
        <p class="loading-text">{{ t('common.loading') }}...</p>
      </span>
      <span v-else-if="templates.length === 0" class="empty-state">
        <div class="empty-content">
          <i class="fas fa-layer-group text-6xl text-gray-300 mb-4"></i>
          <h3 class="empty-title">{{ t('projectTemplates.noTemplates') }}</h3>
          <p class="empty-description">{{ t('projectTemplates.noTemplatesDescription') }}</p>
          <button 
            @click="showCreateTemplate = true"
            class="create-first-template-btn"
            v-if="canCreateTemplates"
          >
            <i class="fas fa-plus mr-2"></i>
            {{ t('projectTemplates.createFirstTemplate') }}
          </button>
        </div>
      </span>
      <span v-else-if="filteredTemplates.length === 0" class="no-results-state">
        <div class="no-results-content">
          <i class="fas fa-search text-4xl text-gray-300 mb-4"></i>
          <h3 class="no-results-title">{{ t('projectTemplates.noResults') }}</h3>
          <p class="no-results-description">{{ t('projectTemplates.noResultsDescription') }}</p>
          <button @click="clearFilters" class="clear-filters-btn">
            {{ t('projectTemplates.clearFilters') }}
          </button>
        </div>
      </span>
    </div>

    <!-- Conteneur des modèles -->
    <div class="templates-container" v-if="!loading && filteredTemplates.length > 0">
      <!-- Vue grille -->
      <div v-if="viewMode === 'grid'" class="templates-grid">
        <div 
          v-for="template in paginatedTemplates" 
          :key="template.id"
          class="template-card"
          :class="{ selected: selectedTemplate?.id === template.id }"
          @click="selectTemplate(template)"
        >
          <div class="card-header">
            <div class="template-category">
              <i :class="getCategoryIcon(template.category)" class="category-icon"></i>
              <span class="category-name">{{ template.category }}</span>
            </div>
            <div class="template-actions">
              <button 
                @click.stop="toggleFavorite(template)"
                class="action-btn favorite-btn"
                :class="{ active: template.is_favorite }"
              >
                <i :class="template.is_favorite ? 'fas fa-heart' : 'far fa-heart'"></i>
              </button>
              <div class="dropdown" v-if="canManageTemplate(template)">
                <button   
                  @click.stop="toggleDropdown(template.id)"
                  class="action-btn dropdown-btn"
                >
                  <i class="fas fa-ellipsis-v"></i>
                </button>
                <div v-if="activeDropdown === template.id" class="dropdown-menu">
                  <button 
                    @click="editTemplate(template)"
                    class="dropdown-item"
                  >
                    <i class="fas fa-edit mr-2"></i>
                    {{ t('common.edit') }}
                  </button>
                  <button 
                    @click="duplicateTemplate(template)"
                    class="dropdown-item"
                  >
                    <i class="fas fa-copy mr-2"></i>
                    {{ t('common.duplicate') }}
                  </button>
                  <button 
                    @click="shareTemplate(template)"
                    class="dropdown-item"
                  >
                    <i class="fas fa-share mr-2"></i>
                    {{ t('common.share') }}
                  </button>
                  <div class="dropdown-divider"></div>
                  <button 
                    @click="deleteTemplate(template)"
                    class="dropdown-item danger"
                  >
                    <i class="fas fa-trash mr-2"></i>
                    {{ t('common.delete') }}
                  </button>
                </div>
              </div>
            </div>
          </div>
          
          <div class="card-content">
            <!-- Icône principale du modèle -->
            <div class="template-icon-container mb-3">
              <div class="template-main-icon" 
                   :style="{ backgroundColor: template.color ? template.color + '20' : '#f3f4f6', color: template.color || '#6b7280' }">
                <i :class="template.icon || 'fas fa-layer-group'" class="template-icon"></i>
              </div>
            </div>
            
            <h3 class="template-name">{{ template.name }}</h3>
            <p class="template-description">{{ template.description }}</p>
            
            <div class="template-meta">
              <div class="meta-row">
                <span class="meta-item">
                  <i class="fas fa-clock mr-1"></i>
                  {{ template.estimated_duration }} {{ t(`projectTemplates.${template.duration_unit}`) }}
                </span>
                
                <span class="meta-item">
                  <i class="fas fa-puzzle-piece mr-1"></i>
                  {{ template.widgets?.length || 0 }} {{ t('widgets.widgets') }}
                </span>
              </div>
              
              <div class="meta-row">
                <span class="meta-item">
                  <i class="fas fa-users mr-1"></i>
                  {{ template.usage_count || 0 }} {{ t('projectTemplates.uses') }}
                </span>
                
                <div class="template-rating">
                  <div class="stars">
                    <i 
                      v-for="i in 5" 
                      :key="i"
                      :class="i <= (template.rating || 0) ? 'fas fa-star' : 'far fa-star'"
                      class="star"
                    ></i>
                  </div>
                  <span class="rating-text">{{ template.rating || 0 }}/5</span>
                </div>
              </div>
            </div>
            
            <div class="template-tags" v-if="template.tags?.length">
              <span 
                v-for="tag in template.tags.slice(0, 3)" 
                :key="tag"
                class="tag"
              >
                {{ tag }}
              </span>
              <span v-if="template.tags.length > 3" class="tag more-tags">
                +{{ template.tags.length - 3 }}
              </span>
            </div>
          </div>
          
          <div class="card-footer">
            <div class="template-status">
              <span 
                class="status-badge"
                :class="getStatusClass(template.status)"
              >
                {{ t(`projectTemplates.${template.status}`) }}
              </span>
              
              <span v-if="template.is_public" class="public-badge">
                <i class="fas fa-globe mr-1"></i>
                {{ t('projectTemplates.public') }}
              </span>
            </div>
            
            <button 
              @click.stop="useTemplate(template)"
              class="use-template-btn"
              :disabled="template.status !== 'active'"
            >
              {{ t('projectTemplates.useTemplate') }}
            </button>
          </div>
        </div>
      </div>
      
      <!-- Vue liste -->
      <div v-else class="templates-list">
        <div class="list-header">
          <div class="list-header-cell name-header">{{ t('common.name') }}</div>
          <div class="list-header-cell category-header">{{ t('common.category') }}</div>
          <div class="list-header-cell duration-header">{{ t('projectTemplates.duration') }}</div>
          <div class="list-header-cell widgets-header">{{ t('widgets.widgets') }}</div>
          <div class="list-header-cell usage-header">{{ t('projectTemplates.uses') }}</div>
          <div class="list-header-cell rating-header">{{ t('common.rating') }}</div>
          <div class="list-header-cell status-header">{{ t('common.status') }}</div>
          <div class="list-header-cell actions-header">{{ t('common.actions') }}</div>
        </div>
        
        <div 
          v-for="template in paginatedTemplates" 
          :key="template.id" 
          class="list-row"
          @click="selectTemplate(template)"
        >
          <div class="list-cell name-cell">
            <div class="template-info">
              <h4 class="template-name">{{ template.name }}</h4>
              <p class="template-description">{{ template.description }}</p>
            </div>
          </div>
          
          <div class="list-cell category-cell">
            <div class="category-badge">
              <i :class="getCategoryIcon(template.category)" class="category-icon"></i>
              {{ template.category }}
            </div>
          </div>
          
          <div class="list-cell duration-cell">
            <span class="duration-text">
              {{ template.estimated_duration }} {{ t(`projectTemplates.${template.duration_unit}`) }}
            </span>
          </div>
          
          <div class="list-cell widgets-cell">
            <span class="widgets-count">{{ template.widgets?.length || 0 }}</span>
          </div>
          
          <div class="list-cell usage-cell">
            <span class="usage-count">{{ template.usage_count || 0 }}</span>
          </div>
          
          <div class="list-cell rating-cell">
            <div class="rating-display">
              <div class="stars">
                <i 
                  v-for="i in 5" 
                  :key="i"
                  :class="i <= (template.rating || 0) ? 'fas fa-star' : 'far fa-star'"
                  class="star"
                ></i>
              </div>
              <span class="rating-text">{{ template.rating || 0 }}/5</span>
            </div>
          </div>
          
          <div class="list-cell status-cell">
            <span 
              class="status-badge"
              :class="getStatusClass(template.status)"
            >
              {{ t(`projectTemplates.${template.status}`) }}
            </span>
          </div>
          
          <div class="list-cell actions-cell">
            <div class="row-actions">
              <button 
                @click.stop="toggleFavorite(template)"
                class="row-action-btn"
                :class="{ active: template.is_favorite }"
              >
                <i :class="template.is_favorite ? 'fas fa-heart' : 'far fa-heart'"></i>
              </button>
              
              <button 
                @click.stop="useTemplate(template)"
                class="row-action-btn primary"
                :disabled="template.status !== 'active'"
              >
                <i class="fas fa-play"></i>
              </button>
              
              <div class="dropdown" v-if="canManageTemplate(template)">
                <button   
                  @click.stop="toggleDropdown(template.id)"
                  class="row-action-btn"
                >
                  <i class="fas fa-ellipsis-v"></i>
                </button>
                <div v-if="activeDropdown === template.id" class="dropdown-menu">
                  <button 
                    @click="editTemplate(template)"
                    class="dropdown-item"
                  >
                    <i class="fas fa-edit mr-2"></i>
                    {{ t('common.edit') }}
                  </button>
                  <button 
                    @click="duplicateTemplate(template)"
                    class="dropdown-item"
                  >
                    <i class="fas fa-copy mr-2"></i>
                    {{ t('common.duplicate') }}
                  </button>
                  <button 
                    @click="shareTemplate(template)"
                    class="dropdown-item"
                  >
                    <i class="fas fa-share mr-2"></i>
                    {{ t('common.share') }}
                  </button>
                  <div class="dropdown-divider"></div>
                  <button 
                    @click="deleteTemplate(template)"
                    class="dropdown-item danger"
                  >
                    <i class="fas fa-trash mr-2"></i>
                    {{ t('common.delete') }}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Pagination -->
    <div v-if="totalPages > 1" class="pagination">
      <button 
        @click="currentPage = 1"
        :disabled="currentPage === 1"
        class="pagination-btn"
      >
        <i class="fas fa-angle-double-left"></i>
      </button>
      
      <button 
        @click="currentPage--"
        :disabled="currentPage === 1"
        class="pagination-btn"
      >
        <i class="fas fa-angle-left"></i>
      </button>
      
      <div class="pagination-info">
        <span class="current-page">{{ currentPage }}</span>
        <span class="page-separator">/</span>
        <span class="total-pages">{{ totalPages }}</span>
      </div>
      
      <button 
        @click="currentPage++"
        :disabled="currentPage === totalPages"
        class="pagination-btn"
      >
        <i class="fas fa-angle-right"></i>
      </button>
      
      <button 
        @click="currentPage = totalPages"
        :disabled="currentPage === totalPages"
        class="pagination-btn"
      >
        <i class="fas fa-angle-double-right"></i>
      </button>
    </div>

    <!-- Modales -->
    <ProjectTemplateModal
      v-if="showCreateTemplate"
      :template="editingTemplate"
      :isVisible="showCreateTemplate"
      @close="closeTemplateModal"
      @saved="handleTemplateSaved"
    />
    
    <ProjectCustomizationModal
      v-if="showCustomization"
      :template="selectedTemplate"
      @close="showCustomization = false"
      @project-created="handleProjectCreated"
      @preview="handleProjectPreview"
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
      console.log('🔄 Début du chargement des templates...')
      loading.value = true
      
      try {
        console.log('📞 Appel du service projectTemplateService.getTemplates()')
        const result = await projectTemplateService.getTemplates()
        console.log('📋 Résultat du service:', result)
        
        if (result.success) {
          console.log('✅ Templates chargés avec succès:', result.data.length, 'templates')
          templates.value = result.data
          console.log('📊 Templates stockés dans le state:', templates.value.length)
        } else {
          console.error('❌ Échec du chargement des templates:', result.error)
          showError(result.error || t('errors.loadingFailed'))
        }
      } catch (err) {
        console.error('❌ Erreur lors du chargement des templates:', err)
        showError(t('errors.loadingFailed'))
      } finally {
        loading.value = false
        console.log('🏁 Fin du chargement des templates. Loading:', loading.value)
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
          templates.value.push(result.data)
          success(t('projectTemplates.duplicateSuccess'))
        }
      } catch (err) {
        showError(t('errors.duplicateFailed'))
      }
      activeDropdown.value = null
    }
    
    const shareTemplate = (template) => {
      // Logique de partage
      activeDropdown.value = null
    }
    
    const deleteTemplate = async (template) => {
      const confirmed = await confirm(t('projectTemplates.confirmDelete'))
      if (!confirmed) return
      
      try {
        const result = await projectTemplateService.deleteTemplate(template.id)
        if (result.success) {
          templates.value = templates.value.filter(t => t.id !== template.id)
          success(t('projectTemplates.deleteSuccess'))
        }
      } catch (err) {
        showError(t('errors.deleteFailed'))
      }
      activeDropdown.value = null
    }
    
    const canManageTemplate = (template) => {
      return hasPermission('manage_templates') || template.created_by === user.value?.id
    }
    
    const getCategoryIcon = (category) => {
      const icons = {
        'marketing': 'fas fa-bullhorn',
        'ecommerce': 'fas fa-shopping-cart',
        'blog': 'fas fa-blog',
        'portfolio': 'fas fa-briefcase',
        'corporate': 'fas fa-building',
        'landing': 'fas fa-rocket'
      }
      return icons[category] || 'fas fa-layer-group'
    }
    
    const getStatusClass = (status) => {
      const classes = {
        'active': 'status-active',
        'draft': 'status-draft',
        'archived': 'status-archived'
      }
      return classes[status] || 'status-default'
    }
    
    const toggleSortOrder = () => {
      sortOrder.value = sortOrder.value === 'asc' ? 'desc' : 'asc'
    }
    
    const clearFilters = () => {
      searchQuery.value = ''
      selectedCategory.value = ''
      currentPage.value = 1
    }
    
    const closeTemplateModal = () => {
      showCreateTemplate.value = false
      editingTemplate.value = null
    }
    
    const handleTemplateSaved = (template) => {
      if (editingTemplate.value) {
        // Mise à jour
        const index = templates.value.findIndex(t => t.id === template.id)
        if (index !== -1) {
          templates.value[index] = template
        }
      } else {
        // Nouveau modèle
        templates.value.push(template)
      }
      closeTemplateModal()
    }
    
    const handleProjectCreated = (project) => {
      emit('project-created', project)
      showCustomization.value = false
    }
    
    const handleProjectPreview = (project) => {
      // Logique de prévisualisation
    }
    
    // Fermer le dropdown quand on clique ailleurs
    const handleClickOutside = (event) => {
      if (!event.target.closest('.dropdown')) {
        activeDropdown.value = null
      }
    }
    
    onMounted(() => {
      console.log('🚀 Montage du composant ProjectTemplateSelector')
      console.log('👤 Utilisateur connecté:', !!user.value)
      console.log('👤 Détails utilisateur:', user.value)
      console.log('🔑 Token dans localStorage:', !!localStorage.getItem('accessToken'))
      
      loadTemplates()
      document.addEventListener('click', handleClickOutside)
    })
    
    return {
      // État
      loading,
      templates,
      selectedTemplate,
      searchQuery,
      selectedCategory,
      sortBy,
      sortOrder,
      viewMode,
      currentPage,
      itemsPerPage,
      activeDropdown,
      showCreateTemplate,
      showCustomization,
      editingTemplate,
      
      // Computed
      templateCategories,
      canCreateTemplates,
      filteredTemplates,
      totalPages,
      paginatedTemplates,
      
      // Méthodes
      loadTemplates,
      selectTemplate,
      useTemplate,
      toggleFavorite,
      toggleDropdown,
      editTemplate,
      duplicateTemplate,
      shareTemplate,
      deleteTemplate,
      canManageTemplate,
      getCategoryIcon,
      getStatusClass,
      toggleSortOrder,
      clearFilters,
      closeTemplateModal,
      handleTemplateSaved,
      handleProjectCreated,
      handleProjectPreview,
      
      // Utils
      t
    }
  }
}
</script>

<style scoped>
.template-selector {
  @apply p-6 bg-white rounded-lg shadow-sm;
}

/* Styles pour les icônes des modèles */
.template-icon-container {
  @apply flex justify-center;
}

.template-main-icon {
  @apply w-16 h-16 rounded-xl flex items-center justify-center;
  transition: all 0.3s ease;
}

.template-icon {
  @apply text-2xl;
}

.template-card:hover .template-main-icon {
  transform: scale(1.05);
}

.selector-header {
  @apply flex justify-between items-start mb-6;
}

.header-content h2 {
  @apply text-2xl font-bold text-gray-900 mb-2;
}

.header-description {
  @apply text-gray-600;
}

.create-template-btn {
  @apply bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors;
}

.filters-section {
  @apply flex justify-between items-center mb-6 gap-4;
}

.search-filters {
  @apply flex gap-4 flex-1;
}

.search-box {
  @apply relative flex-1 max-w-md;
}

.search-icon {
  @apply absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400;
}

.search-input {
  @apply w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent;
}

.filter-select {
  @apply px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent;
}

.sort-order-btn {
  @apply p-2 border border-gray-300 rounded-lg hover:bg-gray-50;
}

.view-toggle {
  @apply flex border border-gray-300 rounded-lg overflow-hidden;
}

.view-btn {
  @apply px-3 py-2 bg-white hover:bg-gray-50 transition-colors;
}

.view-btn.active {
  @apply bg-blue-600 text-white;
}

.loading-state {
  @apply flex flex-col items-center justify-center py-12;
}

.empty-state, .no-results-state {
  @apply flex justify-center py-12;
}

.empty-content, .no-results-content {
  @apply text-center;
}

.templates-grid {
  @apply grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6;
}

.template-card {
  @apply bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer;
}

.template-card.selected {
  @apply border-blue-500 ring-2 ring-blue-200;
}

.card-header {
  @apply flex justify-between items-start mb-3;
}

.template-category {
  @apply flex items-center gap-2 text-sm text-gray-600;
}

.template-actions {
  @apply flex gap-2;
}

.action-btn {
  @apply p-1 text-gray-400 hover:text-gray-600 transition-colors;
}

.favorite-btn.active {
  @apply text-red-500;
}

.dropdown {
  @apply relative;
}

.dropdown-menu {
  @apply absolute right-0 top-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-10 min-w-48;
}

.dropdown-item {
  @apply w-full text-left px-4 py-2 hover:bg-gray-50 transition-colors;
}

.dropdown-item.danger {
  @apply text-red-600 hover:bg-red-50;
}

.template-name {
  @apply font-semibold text-gray-900 mb-2;
}

.template-description {
  @apply text-sm text-gray-600 mb-3;
}

.template-icon-container {
  @apply flex justify-center;
}

.template-main-icon {
  @apply w-12 h-12 rounded-lg flex items-center justify-center;
}

.template-icon {
  @apply text-xl;
}

.template-meta {
  @apply space-y-2 mb-3;
}

.meta-row {
  @apply flex justify-between items-center;
}

.meta-item {
  @apply text-xs text-gray-500;
}

.template-rating {
  @apply flex items-center gap-1;
}

.stars {
  @apply flex gap-1;
}

.star {
  @apply text-yellow-400 text-xs;
}

.template-tags {
  @apply flex flex-wrap gap-1 mb-3;
}

.tag {
  @apply px-2 py-1 bg-gray-100 text-xs text-gray-600 rounded;
}

.card-footer {
  @apply flex justify-between items-center pt-3 border-t border-gray-100;
}

.status-badge {
  @apply px-2 py-1 text-xs rounded;
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

.use-template-btn {
  @apply bg-blue-600 text-white px-3 py-1 text-sm rounded hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed;
}

.templates-list {
  @apply bg-white border border-gray-200 rounded-lg overflow-hidden;
}

.list-header {
  @apply grid grid-cols-8 gap-4 p-4 bg-gray-50 border-b border-gray-200 font-semibold text-sm text-gray-700;
}

.list-row {
  @apply grid grid-cols-8 gap-4 p-4 border-b border-gray-100 hover:bg-gray-50 cursor-pointer;
}

.list-cell {
  @apply flex items-center;
}

.pagination {
  @apply flex justify-center items-center gap-2 mt-6;
}

.pagination-btn {
  @apply p-2 border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed;
}

.pagination-info {
  @apply flex items-center gap-1 px-4;
}
</style>