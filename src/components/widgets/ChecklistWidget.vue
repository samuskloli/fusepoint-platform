<template>
  <BaseWidget 
    :widget="widgetConfig"
    :loading="loading"
    :error="error"
    @configure="showConfigModal = true"
    @toggle="toggleWidget"
    @retry="loadChecklists"
  >
    <div class="checklist-widget">
      <!-- En-tête avec statistiques -->
      <div class="checklist-header">
        <div class="header-left">
          <div class="checklist-stats">
            <div class="stat-item">
              <span class="stat-value">{{ checklists.length }}</span>
              <span class="stat-label">{{ t('widgets.checklist.total') }}</span>
            </div>
            <div class="stat-divider"></div>
            <div class="stat-item">
              <span class="stat-value">{{ completedChecklists.length }}</span>
              <span class="stat-label">{{ t('widgets.checklist.completed') }}</span>
            </div>
            <div class="stat-divider"></div>
            <div class="stat-item">
              <span class="stat-value">{{ completionPercentage }}%</span>
              <span class="stat-label">{{ t('widgets.checklist.progress') }}</span>
            </div>
          </div>
        </div>
        
        <div class="header-right">
          <div class="view-controls">
            <button 
              @click="viewMode = 'list'"
              :class="{ active: viewMode === 'list' }"
              class="view-btn"
            >
              <i class="fas fa-list"></i>
            </button>
            <button 
              @click="viewMode = 'categories'"
              :class="{ active: viewMode === 'categories' }"
              class="view-btn"
            >
              <i class="fas fa-th-large"></i>
            </button>
          </div>
          
          <button 
            @click="showAddChecklistModal = true"
            class="add-btn"
          >
            <i class="fas fa-plus mr-2"></i>
            {{ t('widgets.checklist.addChecklist') }}
          </button>
        </div>
      </div>
      
      <!-- Barre de progression globale -->
      <div v-if="widgetConfig.showProgress" class="progress-section">
        <div class="progress-header">
          <span class="progress-label">{{ t('widgets.checklist.globalProgress') }}</span>
          <span class="progress-percentage">{{ completionPercentage }}%</span>
        </div>
        <div class="progress-bar">
          <div 
            class="progress-fill"
            :style="{ width: completionPercentage + '%' }"
          ></div>
        </div>
      </div>
      
      <!-- Filtres et recherche -->
      <div v-if="checklists.length > 0" class="checklist-filters">
        <div class="filters-left">
          <div class="search-box">
            <i class="fas fa-search search-icon"></i>
            <input 
              v-model="searchQuery"
              type="text"
              :placeholder="t('widgets.checklist.searchPlaceholder')"
            >
          </div>
          
          <select v-model="statusFilter" class="filter-select">
            <option value="all">{{ t('widgets.checklist.allStatuses') }}</option>
            <option value="pending">{{ t('widgets.checklist.pending') }}</option>
            <option value="in_progress">{{ t('widgets.checklist.inProgress') }}</option>
            <option value="completed">{{ t('widgets.checklist.completed') }}</option>
          </select>
          
          <select v-model="priorityFilter" class="filter-select">
            <option value="all">{{ t('widgets.checklist.allPriorities') }}</option>
            <option value="high">{{ t('widgets.checklist.high') }}</option>
            <option value="medium">{{ t('widgets.checklist.medium') }}</option>
            <option value="low">{{ t('widgets.checklist.low') }}</option>
          </select>
        </div>
        
        <div class="filters-right">
          <div class="sort-control">
            <select v-model="sortBy" class="sort-select">
              <option value="created_at">{{ t('widgets.checklist.sortByDate') }}</option>
              <option value="name">{{ t('widgets.checklist.sortByName') }}</option>
              <option value="priority">{{ t('widgets.checklist.sortByPriority') }}</option>
              <option value="progress">{{ t('widgets.checklist.sortByProgress') }}</option>
            </select>
            
            <button 
              @click="sortOrder = sortOrder === 'asc' ? 'desc' : 'asc'"
              class="sort-order-btn"
              :title="t('widgets.checklist.toggleSortOrder')"
            >
              <i :class="sortOrder === 'asc' ? 'fas fa-sort-up' : 'fas fa-sort-down'"></i>
            </button>
          </div>
        </div>
      </div>
      
      <!-- Vue liste -->
      <div v-if="viewMode === 'list'" class="checklist-list">
        <div 
          v-for="checklist in filteredChecklists"
          :key="checklist.id"
          class="checklist-card"
          :class="{ 'completed': checklist.progress === 100 }"
        >
          <div class="checklist-header-card">
            <div class="checklist-info">
              <h4 class="checklist-title">{{ checklist.name }}</h4>
              
              <div class="checklist-badges">
                <span 
                  class="priority-badge"
                  :class="`priority-${checklist.priority}`"
                >
                  {{ t(`widgets.checklist.${checklist.priority}Priority`) }}
                </span>
                
                <span 
                  class="status-badge"
                  :class="`status-${checklist.status}`"
                >
                  {{ t(`widgets.checklist.${checklist.status}`) }}
                </span>
              </div>
            </div>
            
            <div class="checklist-meta">
              <div class="checklist-progress">{{ checklist.progress }}%</div>
              
              <div class="checklist-date">
                <span>
                  <i class="fas fa-calendar mr-1"></i>
                  {{ formatDate(checklist.created_at) }}
                </span>
                
                <span v-if="checklist.due_date" class="checklist-due">
                  <i class="fas fa-clock mr-1"></i>
                  {{ formatDate(checklist.due_date) }}
                </span>
              </div>
            </div>
          </div>
          
          <div class="checklist-actions">
            <button 
              @click="toggleChecklistExpansion(checklist.id)"
              class="expand-btn"
              :class="{ active: expandedChecklists.includes(checklist.id) }"
              :title="t('widgets.checklist.toggleExpand')"
            >
              <i class="fas fa-chevron-down" :class="{ 'fa-rotate-180': expandedChecklists.includes(checklist.id) }"></i>
            </button>
            
            <button 
              @click="editChecklist(checklist)"
              class="edit-btn"
              :title="t('widgets.checklist.edit')"
            >
              <i class="fas fa-edit"></i>
            </button>
            
            <button 
              @click="duplicateChecklist(checklist)"
              class="duplicate-btn"
              :title="t('widgets.checklist.duplicate')"
            >
              <i class="fas fa-copy"></i>
            </button>
            
            <button 
              @click="deleteChecklist(checklist)"
              class="delete-btn"
              :title="t('widgets.checklist.delete')"
            >
              <i class="fas fa-trash"></i>
            </button>
          </div>
          
          <div class="checklist-progress-bar">
            <div 
              class="progress-fill"
              :style="{ width: checklist.progress + '%' }"
              :class="{ 
                'progress-low': checklist.progress < 30, 
                'progress-medium': checklist.progress >= 30 && checklist.progress < 70, 
                'progress-high': checklist.progress >= 70 
              }"
            ></div>
          </div>
          
          <!-- Items de la checklist -->
          <div 
            v-if="expandedChecklists.includes(checklist.id)"
            class="checklist-items"
          >
            <div class="items-header">
              <button 
                @click="addChecklistItem(checklist)"
                class="add-item-btn"
              >
                <i class="fas fa-plus mr-1"></i>
                {{ t('widgets.checklist.addItem') }}
              </button>
            </div>
            
            <div class="items-list">
              <div 
                v-for="item in checklist.items"
                :key="item.id"
                class="checklist-item"
              >
                <input 
                  :id="`item-${item.id}`"
                  v-model="item.completed"
                  type="checkbox"
                  class="checkbox"
                >
                <label :for="`item-${item.id}`" class="checkbox-label">
                  <div class="item-content">
                    <div class="item-text">
                      <h5 class="item-title">{{ item.title }}</h5>
                      <p v-if="item.description" class="item-description">{{ item.description }}</p>
                    </div>
                    
                    <div class="item-meta">
                      <span v-if="item.assignee" class="item-assignee">
                        <i class="fas fa-user mr-1"></i>
                        {{ item.assignee }}
                      </span>
                      
                      <span v-if="item.due_date" class="item-due">
                        <i class="fas fa-calendar mr-1"></i>
                        {{ formatDate(item.due_date) }}
                      </span>
                      
                      <span v-if="item.completed" class="item-completed-date">
                        <i class="fas fa-check mr-1"></i>
                        {{ formatDate(item.completed_at) }}
                      </span>
                    </div>
                  </div>
                </label>
                
                <div class="item-actions">
                  <button 
                    @click="editChecklistItem(checklist, item)"
                    class="item-edit-btn"
                    :title="t('widgets.checklist.editItem')"
                  >
                    <i class="fas fa-edit"></i>
                  </button>
                  
                  <button 
                    @click="deleteChecklistItem(checklist, item)"
                    class="item-delete-btn"
                    :title="t('widgets.checklist.deleteItem')"
                  >
                    <i class="fas fa-trash"></i>
                  </button>
                </div>
              </div>
            </div>
            
            <div v-if="checklist.items.length === 0" class="no-items">
              <i class="fas fa-list text-gray-400 text-2xl mb-2"></i>
              <p class="text-gray-500 text-sm">{{ t('widgets.checklist.noItems') }}</p>
            </div>
          </div>
        </div>
      </div>
      
      <!-- État vide -->
      <div v-if="filteredChecklists.length === 0" class="no-checklists">
        <i class="fas fa-clipboard-list text-gray-400 text-4xl mb-3"></i>
        <h5 class="text-gray-600 mb-2">{{ t('widgets.checklist.noChecklists') }}</h5>
        <p class="text-gray-500 text-sm mb-4">{{ t('widgets.checklist.noChecklistsDescription') }}</p>
        <button 
          @click="showAddChecklistModal = true"
          class="create-first-btn"
        >
          <i class="fas fa-plus mr-2"></i>
          {{ t('widgets.checklist.createFirst') }}
        </button>
      </div>
    </div>
    
    <!-- Modals -->
    <AddChecklistModal 
      v-if="showAddChecklistModal"
      :checklist="editingChecklist"
      @close="closeChecklistModal"
      @save="saveChecklist"
    />
    
    <AddChecklistItemModal 
      v-if="showAddItemModal"
      :checklist="selectedChecklist"
      :item="editingItem"
      @close="closeItemModal"
      @save="saveChecklistItem"
    />
    
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
import { ref, computed, onMounted, watch } from 'vue'
import { useTranslation } from '@/composables/useTranslation'
import { useNotifications } from '@/composables/useNotifications'
import { useAuth } from '@/composables/useAuth'
import BaseWidget from '@/components/widgets/shared/components/BaseWidget.vue'
import WidgetConfigModal from '@/components/widgets/shared/components/WidgetConfigModal.vue'
import ChecklistCreateModal from './components/ChecklistCreateModal.vue'
import ChecklistEditModal from './components/ChecklistEditModal.vue'
import { checklistService } from './services/checklistService'
import { projectManagementService } from '@/services/projectManagementService'
import type { Checklist, ChecklistItem } from './types'

// Props
interface Props {
  projectId: string
  widgetData?: any
  widget?: any
}

const props = defineProps<Props>()

// Emits
const emit = defineEmits<{
  'widget-updated': [widget: any]
}>()

// Composables
// Composables
const { success, error: showError } = useNotifications()
const { t } = useTranslation()
const { user } = useAuth()
    
    // État réactif
    const loading = ref(false)
    const error = ref<string | null>(null)
    const checklists = ref<Checklist[]>([])
    const searchQuery = ref('')
    const statusFilter = ref<ChecklistStatus | 'all'>('all')
    const priorityFilter = ref<ChecklistPriority | 'all'>('all')
    const sortBy = ref<SortBy>('created_at')
    const sortOrder = ref<SortOrder>('desc')
    const viewMode = ref<ViewMode>('list')
    const expandedChecklists = ref<string[]>([])
    const showAddChecklistModal = ref(false)
    const showAddItemModal = ref(false)
    const showConfigModal = ref(false)
    const editingChecklist = ref<Checklist | null>(null)
    const editingItem = ref<ChecklistItem | null>(null)
    const selectedChecklist = ref<Checklist | null>(null)
    
    // Configuration du widget
    const widgetConfig = ref({
      id: 'checklist',
      name: 'Checklist',
      icon: 'fas fa-clipboard-list',
      titleKey: 'widgets.checklist.title',
      isEnabled: props.widget?.is_enabled ?? true,
      showProgress: props.widget?.show_progress ?? true,
      allowDuplication: props.widget?.allow_duplication ?? true,
      autoSave: props.widget?.auto_save ?? true,
      defaultView: props.widget?.default_view ?? 'list',
      ...props.widgetData
    })
    
    // Options de configuration
    const configOptions = ref([
      {
        key: 'showProgress',
        type: 'boolean',
        label: 'Afficher la progression globale',
        default: true
      },
      {
        key: 'allowDuplication',
        type: 'boolean',
        label: 'Autoriser la duplication',
        default: true
      },
      {
        key: 'autoSave',
        type: 'boolean',
        label: 'Sauvegarde automatique',
        default: true
      },
      {
        key: 'defaultView',
        type: 'select',
        label: 'Vue par défaut',
        options: [
          { value: 'list', label: 'Liste' },
          { value: 'categories', label: 'Catégories' }
        ],
        default: 'list'
      }
    ])
    
    // Propriétés calculées
    const completedChecklists = computed(() => 
      checklists.value.filter(checklist => checklist.progress === 100)
    )
    
    const completionPercentage = computed(() => {
      if (checklists.value.length === 0) return 0
      const totalProgress = checklists.value.reduce((sum, checklist) => sum + checklist.progress, 0)
      return Math.round(totalProgress / checklists.value.length)
    })
    
    const filteredChecklists = computed(() => {
      let filtered = [...checklists.value]
      
      // Filtrer par recherche
      if (searchQuery.value) {
        const query = searchQuery.value.toLowerCase()
        filtered = filtered.filter(checklist => 
          checklist.name.toLowerCase().includes(query) ||
          checklist.description?.toLowerCase().includes(query)
        )
      }
      
      // Filtrer par statut
      if (statusFilter.value !== 'all') {
        filtered = filtered.filter(checklist => checklist.status === statusFilter.value)
      }
      
      // Filtrer par priorité
      if (priorityFilter.value !== 'all') {
        filtered = filtered.filter(checklist => checklist.priority === priorityFilter.value)
      }
      
      // Trier
      filtered.sort((a, b) => {
        let aValue = a[sortBy.value]
        let bValue = b[sortBy.value]
        
        if (sortBy.value === 'created_at' || sortBy.value === 'due_date') {
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
    
    // Méthodes
    const loadChecklists = async () => {
      loading.value = true
      error.value = null
      
      try {
        const result = await projectManagementService.getProjectChecklists(props.projectId)
        if (result.success) {
          checklists.value = result.data
        } else {
          error.value = result.error
        }
      } catch (err) {
        error.value = t('errors.loadingFailed')
      } finally {
        loading.value = false
      }
    }
    
    const toggleWidget = () => {
      widgetConfig.value.isEnabled = !widgetConfig.value.isEnabled
      const updatedWidget = {
        ...widgetConfig.value,
        is_enabled: widgetConfig.value.isEnabled
      }
      emit('widget-updated', updatedWidget)
    }
    
    const toggleChecklistExpansion = (checklistId: string) => {
      const index = expandedChecklists.value.indexOf(checklistId)
      if (index > -1) {
        expandedChecklists.value.splice(index, 1)
      } else {
        expandedChecklists.value.push(checklistId)
      }
    }
    
    const editChecklist = (checklist: Checklist) => {
      editingChecklist.value = checklist
      showAddChecklistModal.value = true
    }
    
    const duplicateChecklist = async (checklist: Checklist) => {
      try {
        const result = await projectManagementService.duplicateChecklist(checklist.id)
        if (result.success) {
          checklists.value.push(result.data)
          success(t('widgets.checklist.duplicateSuccess'))
        } else {
          showError(result.error)
        }
      } catch (err) {
        showError(t('errors.duplicateFailed'))
      }
    }
    
    const deleteChecklist = async (checklist: Checklist) => {
      if (!confirm(t('widgets.checklist.confirmDelete'))) return
      
      try {
        const result = await projectManagementService.deleteChecklist(checklist.id)
        if (result.success) {
          checklists.value = checklists.value.filter(c => c.id !== checklist.id)
          success(t('widgets.checklist.deleteSuccess'))
        } else {
          showError(result.error)
        }
      } catch (err) {
        showError(t('errors.deleteFailed'))
      }
    }
    
    const addChecklistItem = (checklist: Checklist) => {
      selectedChecklist.value = checklist
      editingItem.value = null
      showAddItemModal.value = true
    }
    
    const editChecklistItem = (checklist: Checklist, item: ChecklistItem) => {
      selectedChecklist.value = checklist
      editingItem.value = item
      showAddItemModal.value = true
    }
    
    const deleteChecklistItem = async (checklist: Checklist, item: ChecklistItem) => {
      if (!confirm(t('widgets.checklist.confirmDeleteItem'))) return
      
      try {
        const result = await projectManagementService.deleteChecklistItem(item.id)
        if (result.success) {
          checklist.items = checklist.items.filter(i => i.id !== item.id)
          success(t('widgets.checklist.deleteItemSuccess'))
        } else {
          showError(result.error)
        }
      } catch (err) {
        showError(t('errors.deleteFailed'))
      }
    }
    
    const closeChecklistModal = () => {
      showAddChecklistModal.value = false
      editingChecklist.value = null
    }
    
    const closeItemModal = () => {
      showAddItemModal.value = false
      editingItem.value = null
      selectedChecklist.value = null
    }
    
    const saveChecklist = async (checklistData) => {
      try {
        let result
        
        if (checklistData.id) {
          // Mise à jour
          result = await projectManagementService.updateChecklist(checklistData.id, checklistData)
          if (result.success) {
            const index = checklists.value.findIndex(c => c.id === checklistData.id)
            if (index !== -1) {
              checklists.value[index] = result.data
            }
          }
        } else {
          // Création
          result = await projectManagementService.createChecklist(props.projectId, checklistData)
          if (result.success) {
            checklists.value.push(result.data)
          }
        }
        
        if (result.success) {
          success(t('widgets.checklist.saveSuccess'))
          closeChecklistModal()
        } else {
          showError(result.error)
        }
      } catch (err) {
        showError(t('errors.saveFailed'))
      }
    }
    
    const saveChecklistItem = async (itemData) => {
      try {
        let result
        
        if (itemData.id) {
          // Mise à jour
          result = await projectManagementService.updateChecklistItem(itemData.id, itemData)
          if (result.success) {
            const checklist = checklists.value.find(c => c.id === selectedChecklist.value.id)
            if (checklist) {
              const index = checklist.items.findIndex(i => i.id === itemData.id)
              if (index !== -1) {
                checklist.items[index] = result.data
              }
            }
          }
        } else {
          // Création
          result = await projectManagementService.createChecklistItem(selectedChecklist.value.id, itemData)
          if (result.success) {
            const checklist = checklists.value.find(c => c.id === selectedChecklist.value.id)
            if (checklist) {
              checklist.items.push(result.data)
            }
          }
        }
        
        if (result.success) {
          success(t('widgets.checklist.saveItemSuccess'))
          closeItemModal()
        } else {
          showError(result.error)
        }
      } catch (err) {
        showError(t('errors.saveFailed'))
      }
    }
    
    const updateConfig = (newConfig) => {
      widgetConfig.value = { ...widgetConfig.value, ...newConfig }
      emit('update-widget', widgetConfig.value)
      showConfigModal.value = false
    }
    
    const formatDate = (date) => {
      if (!date) return ''
      return new Date(date).toLocaleDateString()
    }
    
    // Lifecycle
    onMounted(() => {
      loadChecklists()
    })
</script>

<style scoped>
.checklist-widget {
  @apply space-y-4;
}

.checklist-header {
  @apply flex items-center justify-between;
}

.header-left {
  @apply flex items-center;
}

.checklist-stats {
  @apply flex items-center space-x-4;
}

.stat-item {
  @apply text-center;
}

.stat-value {
  @apply block text-2xl font-bold text-gray-900;
}

.stat-label {
  @apply block text-sm text-gray-500;
}

.stat-divider {
  @apply w-px h-8 bg-gray-200;
}

.header-right {
  @apply flex items-center space-x-3;
}

.view-controls {
  @apply flex items-center space-x-1 bg-gray-100 rounded-lg p-1;
}

.view-btn {
  @apply p-2 rounded-md text-gray-500 hover:text-gray-700 transition-colors;
}

.view-btn.active {
  @apply bg-white text-blue-600 shadow-sm;
}

.add-btn {
  @apply bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center;
}

.progress-section {
  @apply bg-gray-50 rounded-lg p-4;
}

.progress-header {
  @apply flex items-center justify-between mb-2;
}

.progress-label {
  @apply text-sm font-medium text-gray-700;
}

.progress-percentage {
  @apply text-sm font-bold text-blue-600;
}

.progress-bar {
  @apply w-full bg-gray-200 rounded-full h-2;
}

.progress-fill {
  @apply bg-blue-600 h-2 rounded-full transition-all duration-300;
}

.progress-low {
  @apply bg-red-500;
}

.progress-medium {
  @apply bg-yellow-500;
}

.progress-high {
  @apply bg-green-500;
}

.checklist-filters {
  @apply flex items-center justify-between bg-gray-50 rounded-lg p-4;
}

.filters-left {
  @apply flex items-center space-x-3;
}

.search-box {
  @apply relative;
}

.search-icon {
  @apply absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400;
}

.search-box input {
  @apply pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent;
}

.filter-select {
  @apply px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent;
}

.filters-right {
  @apply flex items-center;
}

.sort-control {
  @apply flex items-center space-x-2;
}

.sort-select {
  @apply px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent;
}

.sort-order-btn {
  @apply p-2 text-gray-500 hover:text-gray-700 transition-colors;
}

.checklist-list {
  @apply space-y-4;
}

.checklist-card {
  @apply bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow;
}

.checklist-card.completed {
  @apply bg-green-50 border-green-200;
}

.checklist-header-card {
  @apply flex items-start justify-between mb-3;
}

.checklist-info {
  @apply flex-1;
}

.checklist-title {
  @apply text-lg font-semibold text-gray-900 mb-2;
}

.checklist-badges {
  @apply flex items-center space-x-2;
}

.priority-badge {
  @apply px-2 py-1 rounded-full text-xs font-medium;
}

.priority-high {
  @apply bg-red-100 text-red-800;
}

.priority-medium {
  @apply bg-yellow-100 text-yellow-800;
}

.priority-low {
  @apply bg-green-100 text-green-800;
}

.status-badge {
  @apply px-2 py-1 rounded-full text-xs font-medium;
}

.status-pending {
  @apply bg-gray-100 text-gray-800;
}

.status-in_progress {
  @apply bg-blue-100 text-blue-800;
}

.status-completed {
  @apply bg-green-100 text-green-800;
}

.checklist-meta {
  @apply text-right;
}

.checklist-progress {
  @apply text-2xl font-bold text-blue-600 mb-1;
}

.checklist-date {
  @apply space-y-1;
}

.checklist-date span {
  @apply block text-sm text-gray-500;
}

.checklist-due {
  @apply text-orange-600;
}

.checklist-actions {
  @apply flex items-center space-x-2 mb-3;
}

.expand-btn,
.edit-btn,
.duplicate-btn,
.delete-btn {
  @apply p-2 rounded-md text-gray-500 hover:text-gray-700 hover:bg-gray-100 transition-colors;
}

.expand-btn.active {
  @apply text-blue-600 bg-blue-50;
}

.delete-btn:hover {
  @apply text-red-600 bg-red-50;
}

.checklist-progress-bar {
  @apply w-full bg-gray-200 rounded-full h-2 mb-3;
}

.checklist-items {
  @apply border-t border-gray-200 pt-4;
}

.items-header {
  @apply flex items-center justify-between mb-3;
}

.add-item-btn {
  @apply bg-gray-100 text-gray-700 px-3 py-2 rounded-lg hover:bg-gray-200 transition-colors flex items-center text-sm;
}

.items-list {
  @apply space-y-2;
}

.checklist-item {
  @apply flex items-start space-x-3 p-3 bg-gray-50 rounded-lg;
}

.checkbox {
  @apply mt-1;
}

.checkbox-label {
  @apply flex-1 cursor-pointer;
}

.item-content {
  @apply flex-1;
}

.item-text {
  @apply mb-2;
}

.item-title {
  @apply font-medium text-gray-900;
}

.item-description {
  @apply text-sm text-gray-600 mt-1;
}

.item-meta {
  @apply flex items-center space-x-4 text-sm text-gray-500;
}

.item-assignee,
.item-due,
.item-completed-date {
  @apply flex items-center;
}

.item-actions {
  @apply flex items-center space-x-1;
}

.item-edit-btn,
.item-delete-btn {
  @apply p-1 rounded text-gray-400 hover:text-gray-600 transition-colors;
}

.item-delete-btn:hover {
  @apply text-red-600;
}

.no-items,
.no-checklists {
  @apply text-center py-8;
}

.create-first-btn {
  @apply bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors inline-flex items-center;
}
</style>