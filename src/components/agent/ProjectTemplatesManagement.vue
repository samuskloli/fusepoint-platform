<template>
  <div class="project-templates-management">
    <!-- Header -->
    <div class="header">
      <h1 class="text-2xl font-bold text-gray-900 mb-6">{{ t('projectTemplates.title') }}</h1>
      <button 
        @click="showCreateModal = true"
        class="btn btn-primary"
      >
        <i class="fas fa-plus mr-2"></i>
        {{ t('projectTemplates.create') }}
      </button>
    </div>

    <!-- Filters -->
    <div class="filters mb-6">
      <div class="search-box">
        <i class="fas fa-search"></i>
        <input 
          v-model="searchQuery"
          @input="debouncedSearch"
          type="text"
          :placeholder="t('projectTemplates.searchPlaceholder')"
        >
      </div>
      <select v-model="selectedCategory" @change="loadTemplates" class="form-select">
        <option value="">{{ t('projectTemplates.allCategories') }}</option>
        <option 
          v-for="category in templateCategories" 
          :key="category.value" 
          :value="category.value"
        >
          {{ category.label }}
        </option>
      </select>
    </div>

    <!-- Templates Grid -->
    <div class="templates-grid" v-if="!loading">
      <div 
        v-for="template in templates" 
        :key="template.id"
        class="template-card"
        :class="{ 'inactive': !template.is_active }"
      >
        <div class="template-header">
          <h3>{{ template.name }}</h3>
          <div class="template-actions">
            <button 
              @click="editTemplate(template)"
              class="btn btn-sm btn-outline"
              :title="t('common.edit')"
            >
              <i class="fas fa-edit"></i>
            </button>
            <button 
              @click="duplicateTemplate(template.id)"
              class="btn btn-sm btn-outline"
              :title="t('common.duplicate')"
            >
              <i class="fas fa-copy"></i>
            </button>
            <button 
              @click="toggleTemplateStatus(template)"
              :class="template.is_active ? 'btn btn-sm btn-warning' : 'btn btn-sm btn-success'"
              :title="template.is_active ? t('common.deactivate') : t('common.activate')"
            >
              <i :class="template.is_active ? 'fas fa-pause' : 'fas fa-play'"></i>
            </button>
            <button 
              @click="deleteTemplate(template.id)"
              class="btn btn-sm btn-danger"
              :title="t('common.delete')"
            >
              <i class="fas fa-trash"></i>
            </button>
          </div>
        </div>
        
        <div class="template-description">
          <p>{{ template.description }}</p>
        </div>
        
        <div class="template-meta">
          <div class="duration" v-if="template.duration_estimate">
            <i class="fas fa-clock"></i>
            {{ template.duration_estimate }} {{ t('common.days') }}
          </div>
          <div class="widgets-count" v-if="template.widgets_count">
            <i class="fas fa-puzzle-piece"></i>
            {{ template.widgets_count }} {{ t('projectTemplates.widgets') }}
          </div>
        </div>
        
        <div class="template-tags" v-if="template.tags && typeof template.tags === 'string'">
          <span 
            v-for="tag in template.tags.split(',')" 
            :key="tag"
            class="tag"
          >
            {{ tag.trim() }}
          </span>
        </div>
        
        <div class="template-footer">
          <button 
            @click="manageWidgets(template)"
            class="btn btn-sm btn-secondary"
          >
            <i class="fas fa-cogs mr-1"></i>
            {{ t('projectTemplates.manageWidgets') }}
          </button>
          <button 
            @click="createProjectFromTemplate(template)"
            class="btn btn-sm btn-primary"
          >
            <i class="fas fa-rocket mr-1"></i>
            {{ t('projectTemplates.createProject') }}
          </button>
        </div>
      </div>
    </div>

    <!-- Loading -->
    <div v-if="loading" class="loading">
      <i class="fas fa-spinner fa-spin"></i>
      {{ t('common.loading') }}
    </div>

    <!-- Empty State -->
    <div v-if="!loading && templates.length === 0" class="empty-state">
      <i class="fas fa-folder-open"></i>
      <p>{{ t('projectTemplates.noTemplates') }}</p>
      <button 
        @click="showCreateModal = true"
        class="btn btn-primary"
      >
        {{ t('projectTemplates.createFirst') }}
      </button>
    </div>

    <!-- Modals -->
    <TemplateModal
      v-if="showCreateModal || showEditModal"
      :key="modalKey"
      :template="selectedTemplate"
      :is-edit="showEditModal"
      @close="closeModals"
      @saved="onTemplateSaved"
    />
    
    <WidgetsModal
      v-if="showWidgetsModal"
      :template="selectedTemplate"
      @close="showWidgetsModal = false"
      @updated="onWidgetsUpdated"
    />
    
    <CreateProjectModal
      v-if="showCreateProjectModal"
      :template="selectedTemplate"
      @close="showCreateProjectModal = false"
      @created="onProjectCreated"
    />
  </div>
</template>

<script>
import { ref, reactive, onMounted, computed } from 'vue'
import { useTranslation } from '@/composables/useTranslation'
import projectTemplateService from '@/services/projectTemplateService'
import TemplateModal from './modals/TemplateModal.vue'
import WidgetsModal from './modals/WidgetsModal.vue'
import CreateProjectModal from './modals/CreateProjectModal.vue'
import { debounce } from 'lodash-es'
import { useToast } from '@/composables/useToast'

export default {
  name: 'ProjectTemplatesManagement',
  components: {
    TemplateModal,
    WidgetsModal,
    CreateProjectModal
  },
  setup() {
    const { t } = useTranslation()
    const { showSuccess, showError } = useToast()
    
    // État réactif
    const templates = ref([])
    const loading = ref(false)
    const searchQuery = ref('')
    const selectedCategory = ref('')
    const selectedTemplate = ref(null)
    
    // Modales
    const showCreateModal = ref(false)
    const showEditModal = ref(false)
    const showWidgetsModal = ref(false)
    const showCreateProjectModal = ref(false)
    const modalKey = ref(0)
    
    // Catégories
    const templateCategories = computed(() => {
      return projectTemplateService.getTemplateCategories()
    })
    
    // Méthodes
    const loadTemplates = async () => {
      loading.value = true
      try {
        const filters = {
          search: searchQuery.value,
          category: selectedCategory.value
        }
        
        const result = await projectTemplateService.getProjectTemplates(filters)
        if (result.success) {
          templates.value = result.data
        } else {
          showError(result.error)
        }
      } catch (error) {
        showError(t('projectTemplates.loadError'))
      } finally {
        loading.value = false
      }
    }
    
    const debouncedSearch = debounce(() => {
      loadTemplates()
    }, 300)
    
    const editTemplate = (template) => {
      selectedTemplate.value = JSON.parse(JSON.stringify(template))
      modalKey.value++
      showEditModal.value = true
    }
    
    const duplicateTemplate = async (templateId) => {
      try {
        const result = await projectTemplateService.duplicateProjectTemplate(templateId)
        if (result.success) {
          showSuccess(t('projectTemplates.duplicateSuccess'))
          loadTemplates()
        } else {
          showError(result.error)
        }
      } catch (error) {
        showError(t('projectTemplates.duplicateError'))
      }
    }
    
    const toggleTemplateStatus = async (template) => {
      try {
        const result = await projectTemplateService.toggleTemplateStatus(
          template.id, 
          !template.is_active
        )
        if (result.success) {
          template.is_active = !template.is_active
          showSuccess(
            template.is_active 
              ? t('projectTemplates.activateSuccess') 
              : t('projectTemplates.deactivateSuccess')
          )
        } else {
          showError(result.error)
        }
      } catch (error) {
        showError(t('projectTemplates.statusError'))
      }
    }
    
    const deleteTemplate = async (templateId) => {
      if (!confirm(t('projectTemplates.deleteConfirm'))) {
        return
      }
      
      try {
        const result = await projectTemplateService.deleteProjectTemplate(templateId)
        if (result.success) {
          showSuccess(t('projectTemplates.deleteSuccess'))
          loadTemplates()
        } else {
          showError(result.error)
        }
      } catch (error) {
        showError(t('projectTemplates.deleteError'))
      }
    }
    
    const manageWidgets = (template) => {
      selectedTemplate.value = template
      showWidgetsModal.value = true
    }
    
    const createProjectFromTemplate = (template) => {
      selectedTemplate.value = template
      showCreateProjectModal.value = true
    }
    
    const closeModals = () => {
      showCreateModal.value = false
      showEditModal.value = false
      selectedTemplate.value = null
    }
    
    const onTemplateSaved = () => {
      closeModals()
      loadTemplates()
      showSuccess(t('projectTemplates.saveSuccess'))
    }
    
    const onWidgetsUpdated = () => {
      showWidgetsModal.value = false
      loadTemplates()
      showSuccess(t('projectTemplates.widgetsUpdateSuccess'))
    }
    
    const onProjectCreated = () => {
      showCreateProjectModal.value = false
      showSuccess(t('projectTemplates.projectCreateSuccess'))
    }
    
    // Cycle de vie
    onMounted(() => {
      loadTemplates()
    })
    
    return {
      templates,
      loading,
      searchQuery,
      selectedCategory,
      selectedTemplate,
      showCreateModal,
      showEditModal,
      showWidgetsModal,
      showCreateProjectModal,
      modalKey,
      templateCategories,
      loadTemplates,
      debouncedSearch,
      editTemplate,
      duplicateTemplate,
      toggleTemplateStatus,
      deleteTemplate,
      manageWidgets,
      createProjectFromTemplate,
      closeModals,
      onTemplateSaved,
      onWidgetsUpdated,
      onProjectCreated,
      t
    }
  }
}
</script>

<style scoped>
.project-templates-management {
  padding: 2rem;
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
}

.header h2 {
  margin: 0;
  color: var(--text-primary);
}

.filters {
  display: flex;
  gap: 1rem;
  margin-bottom: 2rem;
  align-items: center;
}

.search-box {
  position: relative;
  flex: 1;
  max-width: 400px;
}

.search-box i {
  position: absolute;
  left: 1rem;
  top: 50%;
  transform: translateY(-50%);
  color: var(--text-secondary);
}

.search-box input {
  width: 100%;
  padding: 0.75rem 1rem 0.75rem 2.5rem;
  border: 1px solid var(--border-color);
  border-radius: 0.5rem;
  font-size: 0.9rem;
}

.templates-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
  gap: 1.5rem;
}

.template-card {
  background: var(--bg-secondary);
  border: 1px solid var(--border-color);
  border-radius: 0.75rem;
  padding: 1.5rem;
  transition: all 0.2s ease;
}

.template-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.template-card.inactive {
  opacity: 0.6;
}

.template-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 1rem;
}

.template-header h3 {
  margin: 0;
  color: var(--text-primary);
  font-size: 1.1rem;
}

.template-actions {
  display: flex;
  gap: 0.5rem;
}

.template-description {
  color: var(--text-secondary);
  margin-bottom: 1rem;
  line-height: 1.5;
}

.template-meta {
  display: flex;
  gap: 1rem;
  margin-bottom: 1rem;
  font-size: 0.9rem;
  color: var(--text-secondary);
}

.template-meta span {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.template-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  margin-bottom: 1rem;
}

.tag {
  background: var(--primary-color);
  color: white;
  padding: 0.25rem 0.5rem;
  border-radius: 0.25rem;
  font-size: 0.8rem;
}

.template-footer {
  display: flex;
  gap: 0.5rem;
  justify-content: space-between;
}

.loading, .empty-state {
  text-align: center;
  padding: 3rem;
  color: var(--text-secondary);
}

.empty-state i {
  font-size: 3rem;
  margin-bottom: 1rem;
  color: var(--text-tertiary);
}

.empty-state h3 {
  margin-bottom: 0.5rem;
  color: var(--text-primary);
}

.btn {
  padding: 0.5rem 1rem;
  border: none;
  border-radius: 0.375rem;
  cursor: pointer;
  font-size: 0.9rem;
  transition: all 0.2s ease;
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
}

.btn-primary {
  background: var(--primary-color);
  color: white;
}

.btn-secondary {
  background: var(--secondary-color);
  color: white;
}

.btn-outline {
  background: transparent;
  border: 1px solid var(--border-color);
  color: var(--text-primary);
}

.btn-success {
  background: var(--success-color);
  color: white;
}

.btn-warning {
  background: var(--warning-color);
  color: white;
}

.btn-danger {
  background: var(--danger-color);
  color: white;
}

.btn-sm {
  padding: 0.375rem 0.75rem;
  font-size: 0.8rem;
}

.btn:hover {
  transform: translateY(-1px);
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

select {
  padding: 0.75rem;
  border: 1px solid var(--border-color);
  border-radius: 0.5rem;
  background: var(--bg-primary);
  color: var(--text-primary);
  font-size: 0.9rem;
}
</style>