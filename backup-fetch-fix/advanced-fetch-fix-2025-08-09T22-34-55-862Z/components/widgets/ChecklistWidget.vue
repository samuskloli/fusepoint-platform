<template>
  <BaseWidget 
    :widget="widgetConfig=loading=error='showConfigModal = true=toggleWidget="loadChecklists="checklist-widget=checklist-header='header-left="checklist-stats=stat-item="stat-value='stat-label=stat-divider="stat-item="stat-value=stat-label='stat-divider="stat-item=stat-value="stat-label='header-right=view-controlsviewMode = 'categories={ active: viewMode === 'categories="view-btn='t('widgets.checklist.categoryView=showAddChecklistModal = true="add-btn="t('widgets.checklist.addChecklist=progress-section='widgetConfig.showProgress="progress-header=progress-label="progress-percentage='progress-bar=progress-fill="{ width: completionPercentage + '%' }
          ></div>
        </div>
      </div>
      
      <!-- Filtres et recherche -->
      <div  class="checklist-filters=checklists.length &gt; 0'>
        <div  class="filters-left=search-box fas fa-search search-icon=searchQuery=text='t('widgets.checklist.searchPlaceholder="status-filter=statusFilter="filter-select='all=pending="in_progress="completed=priority-filter='priorityFilter="filter-select=all="high='medium=low="filters-right="sort-control=sortBy='sort-select="created_at=name="priority='progress=sortOrder = sortOrder === 'asc="sort-order-btn="t('widgets.checklist.toggleSortOrder')sortOrder === 'asc='viewMode === 'list=checklist-list="checklist in filteredChecklists="checklist.id=checklist-card='{ 'completed': checklist.progress === 100 }"
        >
          <div  class="checklist-header-card=checklist-info checklist-title='checklist-badges=priority-badge="`priority-${checklist.priority}`
                  >
                    {{ t(`widgets.checklist.${checklist.priority}Priority`) }}
                  </div>
                  
                  <span  
                    class="status-badge=`status-${checklist.status}`'
                  >
                    {{ t(`widgets.checklist.${checklist.status}`) }}
                  </span>
                </div>
              </div>
              
              <div class="checklist-meta=checklist-progress checklist-date=fas fa-calendar mr-1'></i>
                  {{ formatDate(checklist.created_at) }}
                </span>
                
                <span v-if="checklist.due_date=checklist-due=fas fa-clock mr-1"></i>
                  {{ formatDate(checklist.due_date) }}
                </span>
              </div>
            </div>
            
            <div  class="checklist-actions=toggleChecklistExpansion(checklist.id)'
                class="expand-btn={ active: expandedChecklists.includes(checklist.id) }"
                :title="t('widgets.checklist.toggleExpand={ 'fa-rotate-180': expandedChecklists.includes(checklist.id) }'></i>
              </button>
              
              <button  
                @click="editChecklist(checklist)
                class(edit-btn=t('widgets.checklist.edit='duplicateChecklist(checklist)""
                class="duplicate-btn=t('widgets.checklist.duplicate='deleteChecklist(checklist)"
                class="delete-btn=t('widgets.checklist.delete='checklist-progress-bar="progress-fill={ width: checklist.progress + '%' }""
              :class="{ 'progress-low': checklist.progress &lt; 30, 'progress-medium': checklist.progress >= 30 && checklist.progress &lt; 70, 'progress-high': checklist.progress &gt;= 70 }'
            ></div>
          </div>
          
          <!-- Items de la checklist -->
          <div  
            v-if: expandedChecklists.includes(checklist.id)""
            class="checklist-items=items-header='addChecklistItem(checklist)"
                class="add-item-btn=fas fa-plus mr-1'></i>
                {{ t('widgets.checklist.addItem="items-list=item in checklist.items=item.id='checklist-item"checkbox=`item-${item.id}`"
                    v-model="item.completed" class="checkbox-label=item-content='item-text="item-title=item.description="item-description='item-meta=item.assignee="item-assignee="fas fa-user mr-1'></i>
                      {{ item.assignee }}
                    </span>
                    
                    <span v-if="item.due_date=item-due=fas fa-calendar mr-1"></i>
                      {{ formatDate(item.due_date) }}
                    </span>
                    
                    <span  v-if="item.completed=item-completed-date=fas fa-check mr-1'></i>
                      {{ formatDate(item.completed_at) }}
                    </span>
                  </div>
                </div>
                
                <div class="item-actions=editChecklistItem(checklist, item)
                    class="item-edit-btn=t('widgets.checklist.editItem='deleteChecklistItem(checklist, item)"
                    class="item-delete-btn=t('widgets.checklist.deleteItem='checklist.items.length === 0" class="no-items=fas fa-list text-gray-400 text-2xl mb-2'></i>
                <p  class="text-gray-500 text-sm=filteredChecklists.length === 0" class="no-checklists=fas fa-clipboard-list text-gray-400 text-4xl mb-3'></i>
          <h5 class="text-gray-600 mb-2>{{ t('widgets.checklist.noChecklists="text-gray-500 text-sm mb-4'>{{ t('widgets.checklist.noChecklistsDescription="showAddChecklistModal = true=create-first-btn="fas fa-plus mr-2'></i>
            {{ t('widgets.checklist.createFirst="viewMode === 'categories=categories-view="category in checklistCategories='category.name=category-section="category-header="category-info=category-title='category.icon="mr-2"></i>
                {{ category.name }}
              </h4>
              
              <span  class="category-count=category-progress='progress-text="mini-progress-bar=mini-progress-fill="{ width: category.completionPercentage + '%' }'
                ></div>
              </div>
            </div>
          </div>
          
          <div class="category-checklists=checklist in category.checklists checklist.id=mini-checklist-card=toggleChecklistExpansion(checklist.id)'
            >
              <div  class="mini-card-header=mini-card-info mini-card-title="mini-card-badges=mini-priority-badge='`priority-${checklist.priority}`
                    ></div>
                  </div>
                </div>
                
                <div class="mini-card-progress=mini-progress-text mini-progress='mini-progress-fill={ width: checklist.progress + '%' }"
                    ></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    
    <!-- Modal d="showAddChecklistModal=editingChecklist='closeChecklistModal="saveChecklist=showAddItemModal="selectedChecklist='editingItem=closeItemModal="saveChecklistItem="showConfigModal=widgetConfig='configOptions="showConfigModal = false=updateConfig"
    />
  </BaseWidget>
</template>

<script>
import { ref, computed, onMounted, watch } from 'vue'
import BaseWidget from './BaseWidget.vue'
import AddChecklistModal from '../modals/AddChecklistModal.vue'
import AddChecklistItemModal from '../modals/AddChecklistItemModal.vue'
import WidgetConfigModal from '../modals/WidgetConfigModal.vue'
import projectManagementService from '@/services/projectManagementService'
import { useTranslation } from '@/composables/useTranslation'
import { useNotifications } from '@/composables/useNotifications'

export default {
  name: 'ChecklistWidget',
  components: {
    BaseWidget,
    AddChecklistModal,
    AddChecklistItemModal,
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
    const checklists = ref([])
    const searchQuery = ref('')
    const statusFilter = ref('all')
    const priorityFilter = ref('all')
    const sortBy = ref('created_at')
    const sortOrder = ref('desc')
    const viewMode = ref('list')
    const expandedChecklists = ref([])
    const showAddChecklistModal = ref(false)
    const showAddItemModal = ref(false)
    const showConfigModal = ref(false)
    const editingChecklist = ref(null)
    const editingItem = ref(null)
    const selectedChecklist = ref(null)
    
    // Configuration du widget
    const widgetConfig = ref({
      id: 'checklist',
      name: 'Checklist',
      icon: 'fas fa-clipboard-list',
      titleKey: 'widgets.checklist.title',
      isEnabled: true,
      showProgress: true,
      allowDuplication: true,
      autoSave: true,
      defaultView: 'list',
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
    const totalItems = computed(() => {
      return checklists.value.reduce((total, checklist) => total + checklist.total_items, 0)
    })
    
    const completedItems = computed(() => {
      return checklists.value.reduce((total, checklist) => total + checklist.completed_items, 0)
    })
    
    const completionPercentage = computed(() => {
      if (totalItems.value === 0) return 0
      return Math.round((completedItems.value / totalItems.value) * 100)
    })
    
    const filteredChecklists = computed(() => {
      let filtered = [...checklists.value]
      
      // Filtrer par recherche
      if (searchQuery.value) {
        const query = searchQuery.value.toLowerCase()
        filtered = filtered.filter(checklist => 
          checklist.name.toLowerCase().includes(query) ||
          checklist.description?.toLowerCase().includes(query) ||
          checklist.items.some(item => 
            item.title.toLowerCase().includes(query) ||
            item.description?.toLowerCase().includes(query)
          )
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
        let aValue, bValue
        
        switch (sortBy.value) {
          case 'name':
            aValue = a.name.toLowerCase()
            bValue = b.name.toLowerCase()
            break
          case 'priority':
            const priorityOrder = { high: 3, medium: 2, low: 1 }
            aValue = priorityOrder[a.priority]
            bValue = priorityOrder[b.priority]
            break
          case 'progress':
            aValue = a.progress
            bValue = b.progress
            break
          case 'created_at':
          default:
            aValue = new Date(a.created_at)
            bValue = new Date(b.created_at)
            break
        }
        
        if (sortOrder.value === 'asc') {
          return aValue > bValue ? 1 : -1
        } else {
          return aValue < bValue ? 1 : -1
        }
      })
      
      return filtered
    })
    
    const checklistCategories = computed(() => {
      const categories = {
        t('status.inProgress'): { name: t('status.inProgress'), icon: 'fas fa-play-circle text-blue-500', checklists: [] },
        'Terminées': { name: 'Terminées', icon: 'fas fa-check-circle text-green-500', checklists: [] },
        t('status.pending'): { name: t('status.pending'), icon: 'fas fa-pause-circle text-yellow-500', checklists: [] }
      }
      
      filteredChecklists.value.forEach(checklist => {
        if (checklist.progress === 100) {
          categories['Terminées'].checklists.push(checklist)
        } else if (checklist.status === 'in_progress') {
          categories[t('status.inProgress')].checklists.push(checklist)
        } else {
          categories[t('status.pending')].checklists.push(checklist)
        }
      })
      
      // Calculer le pourcentage de completion pour chaque catégorie
      Object.values(categories).forEach(category => {
        if (category.checklists.length > 0) {
          const totalProgress = category.checklists.reduce((sum, checklist) => sum + checklist.progress, 0)
          category.completionPercentage = Math.round(totalProgress / category.checklists.length)
        } else {
          category.completionPercentage = 0
        }
      })
      
      return Object.values(categories).filter(category => category.checklists.length > 0)
    })
    
    // Méthodes
    const loadChecklists = async () => {
      loading.value = true
      error.value = null
      
      try {
        // Simuler le chargement des checklists
        const result = await projectManagementService.getProjectChecklists?.(props.projectId) || {
          success: true,
          data: [
            {
              id: 1,
              name: 'Préparation du lancement',
              description: 'Checklist pour préparer le lancement du projet',
              status: 'in_progress',
              priority: 'high',
              progress: 60,
              total_items: 5,
              completed_items: 3,
              due_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
              created_at: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
              items: [
                {
                  id: 1,
                  title: 'Valider le cahier des charges',
                  description: 'Vérifier que tous les éléments sont définis',
                  completed: true,
                  assignee: 'Jean Dupont',
                  due_date: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
                  completed_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString()
                },
                {
                  id: 2,
                  title: 'Préparer l\'environnement de développement',
                  description: 'Configurer les serveurs et outils nécessaires',
                  completed: true,
                  assignee: 'Marie Martin',
                  due_date: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000).toISOString(),
                  completed_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString()
                },
                {
                  id: 3,
                  title: 'Créer les maquettes UI/UX',
                  description: 'Concevoir l\'interface utilisateur',
                  completed: true,
                  assignee: 'Pierre Durand',
                  due_date: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(),
                  completed_at: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString()
                },
                {
                  id: 4,
                  title: 'Configurer la base de données',
                  description: 'Mettre en place la structure de données',
                  completed: false,
                  assignee: 'Marie Martin',
                  due_date: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString()
                },
                {
                  id: 5,
                  title: 'Tests de sécurité',
                  description: 'Vérifier la sécurité de l\'application',
                  completed: false,
                  assignee: 'Jean Dupont',
                  due_date: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString()
                }
              ]
            },
            {
              id: 2,
              name: 'Contrôle qualité',
              description: 'Vérifications avant mise en production',
              status: 'pending',
              priority: 'medium',
              progress: 0,
              total_items: 3,
              completed_items: 0,
              due_date: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(),
              created_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
              items: [
                {
                  id: 6,
                  title: 'Tests unitaires',
                  description: 'Exécuter tous les tests automatisés',
                  completed: false,
                  assignee: 'Marie Martin',
                  due_date: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000).toISOString()
                },
                {
                  id: 7,
                  title: 'Tests d\'intégration',
                  description: 'Vérifier l\'intégration entre les modules',
                  completed: false,
                  assignee: 'Jean Dupont',
                  due_date: new Date(Date.now() + 12 * 24 * 60 * 60 * 1000).toISOString()
                },
                {
                  id: 8,
                  title: 'Tests utilisateur',
                  description: 'Validation par les utilisateurs finaux',
                  completed: false,
                  assignee: 'Pierre Durand',
                  due_date: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString()
                }
              ]
            },
            {
              id: 3,
              name: 'Documentation',
              description: 'Rédaction de la documentation technique',
              status: 'completed',
              priority: 'low',
              progress: 100,
              total_items: 2,
              completed_items: 2,
              due_date: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
              created_at: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
              items: [
                {
                  id: 9,
                  title: 'Documentation API',
                  description: 'Documenter toutes les endpoints',
                  completed: true,
                  assignee: 'Jean Dupont',
                  due_date: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
                  completed_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString()
                },
                {
                  id: 10,
                  title: 'Guide utilisateur',
                  description: 'Créer le manuel d\'utilisation',
                  completed: true,
                  assignee: 'Pierre Durand',
                  due_date: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
                  completed_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString()
                }
              ]
            }
          ]
        }
        
        if (result.success) {
          checklists.value = result.data
        }
      } catch (err) {
        error.value = t('errors.loadingFailed')
      } finally {
        loading.value = false
      }
    }
    
    const toggleChecklistExpansion = (checklistId) => {
      const index = expandedChecklists.value.indexOf(checklistId)
      if (index > -1) {
        expandedChecklists.value.splice(index, 1)
      } else {
        expandedChecklists.value.push(checklistId)
      }
    }
    
    const editChecklist = (checklist) => {
      editingChecklist.value = { ...checklist }
      showAddChecklistModal.value = true
    }
    
    const duplicateChecklist = async (checklist) => {
      try {
        const result = await projectManagementService.duplicateChecklist?.(checklist.id)
        
        if (result?.success) {
          success(t('widgets.checklist.duplicated'))
          loadChecklists()
        }
      } catch (err) {
        showError(t('widgets.checklist.duplicateFailed'))
      }
    }
    
    const deleteChecklist = async (checklist) => {
      if (!confirm(t('widgets.checklist.confirmDelete', { name: checklist.name }))) {
        return
      }
      
      try {
        const result = await projectManagementService.deleteChecklist?.(checklist.id)
        
        if (result?.success) {
          success(t('widgets.checklist.deleted'))
          loadChecklists()
        }
      } catch (err) {
        showError(t('widgets.checklist.deleteFailed'))
      }
    }
    
    const addChecklistItem = (checklist) => {
      selectedChecklist.value = checklist
      editingItem.value = null
      showAddItemModal.value = true
    }
    
    const editChecklistItem = (checklist, item) => {
      selectedChecklist.value = checklist
      editingItem.value = { ...item }
      showAddItemModal.value = true
    }
    
    const deleteChecklistItem = async (checklist, item) => {
      if (!confirm(t('widgets.checklist.confirmDeleteItem', { title: item.title }))) {
        return
      }
      
      try {
        const result = await projectManagementService.deleteChecklistItem?.(item.id)
        
        if (result?.success) {
          success(t('widgets.checklist.itemDeleted'))
          loadChecklists()
        }
      } catch (err) {
        showError(t('widgets.checklist.itemDeleteFailed'))
      }
    }
    
    const updateItemStatus = async (checklist, item) => {
      try {
        const result = await projectManagementService.updateChecklistItem?.(item.id, {
          completed: item.completed,
          completed_at: item.completed ? new Date().toISOString() : null
        })
        
        if (result?.success) {
          // Mettre à jour les statistiques de la checklist
          const completedCount = checklist.items.filter(i => i.completed).length
          checklist.completed_items = completedCount
          checklist.progress = Math.round((completedCount / checklist.total_items) * 100)
          
          if (widgetConfig.value.autoSave) {
            success(t('widgets.checklist.itemUpdated'))
          }
        }
      } catch (err) {
        // Revenir à l'état précédent en cas d'erreur
        item.completed = !item.completed
        showError(t('widgets.checklist.updateFailed'))
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
        
        if (editingChecklist.value) {
          result = await projectManagementService.updateChecklist?.(editingChecklist.value.id, checklistData)
        } else {
          result = await projectManagementService.createChecklist?.(props.projectId, checklistData)
        }
        
        if (result?.success) {
          success(editingChecklist.value ? t('widgets.checklist.updated') : t('widgets.checklist.created'))
          closeChecklistModal()
          loadChecklists()
        }
      } catch (err) {
        showError(t('widgets.checklist.saveFailed'))
      }
    }
    
    const saveChecklistItem = async (itemData) => {
      try {
        let result
        
        if (editingItem.value) {
          result = await projectManagementService.updateChecklistItem?.(editingItem.value.id, itemData)
        } else {
          result = await projectManagementService.createChecklistItem?.(selectedChecklist.value.id, itemData)
        }
        
        if (result?.success) {
          success(editingItem.value ? t('widgets.checklist.itemUpdated') : t('widgets.checklist.itemCreated'))
          closeItemModal()
          loadChecklists()
        }
      } catch (err) {
        showError(t('widgets.checklist.itemSaveFailed'))
      }
    }
    
    const formatDate = (dateString) => {
      if (!dateString) return ''
      
      const date = new Date(dateString)
      const now = new Date()
      const diffTime = date - now
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
      
      if (diffDays === 0) {
        return t('widgets.checklist.today')
      } else if (diffDays === 1) {
        return t('widgets.checklist.tomorrow')
      } else if (diffDays === -1) {
        return t('widgets.checklist.yesterday')
      } else if (diffDays > 0 && diffDays <= 7) {
        return t('widgets.checklist.inDays', { days: diffDays })
      } else if (diffDays < 0 && diffDays >= -7) {
        return t('widgets.checklist.daysAgo', { days: Math.abs(diffDays) })
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
      
      // Appliquer la vue par défaut
      if (newConfig.defaultView) {
        viewMode.value = newConfig.defaultView
      }
    }
    
    // Watchers
    watch(() => props.projectId, () => loadChecklists(), { immediate: true })
    
    onMounted(() => {
      viewMode.value = widgetConfig.value.defaultView || 'list'
      loadChecklists()
    })
    
    return {
      loading,
      error,
      checklists,
      searchQuery,
      statusFilter,
      priorityFilter,
      sortBy,
      sortOrder,
      viewMode,
      expandedChecklists,
      showAddChecklistModal,
      showAddItemModal,
      showConfigModal,
      editingChecklist,
      editingItem,
      selectedChecklist,
      widgetConfig,
      configOptions,
      totalItems,
      completedItems,
      completionPercentage,
      filteredChecklists,
      checklistCategories,
      loadChecklists,
      toggleChecklistExpansion,
      editChecklist,
      duplicateChecklist,
      deleteChecklist,
      addChecklistItem,
      editChecklistItem,
      deleteChecklistItem,
      updateItemStatus,
      closeChecklistModal,
      closeItemModal,
      saveChecklist,
      saveChecklistItem,
      formatDate,
      toggleWidget,
      updateConfig,
      t
    }
  }
}
</script>

<style scoped>
.checklist-widget {
  @apply space-y-4;
}

.checklist-header {
  @apply flex items-center justify-between flex-wrap gap-4;
}

.header-left {
  @apply flex-1;
}

.checklist-stats {
  @apply flex items-center space-x-4;
}

.stat-item {
  @apply flex flex-col items-center;
}

.stat-value {
  @apply text-lg font-bold text-gray-900;
}

.stat-label {
  @apply text-xs text-gray-600;
}

.stat-divider {
  @apply w-px h-8 bg-gray-300;
}

.header-right {
  @apply flex items-center space-x-3;
}

.view-controls {
  @apply flex items-center bg-gray-100 rounded-lg p-1;
}

.view-btn {
  @apply px-3 py-2 text-gray-600 hover:text-gray-900 rounded-md transition-colors;
}

.view-btn.active {
  @apply bg-white text-blue-600 shadow-sm;
}

.add-btn {
  @apply px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center transition-colors;
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
  @apply text-sm font-bold text-gray-900;
}

.progress-bar {
  @apply w-full bg-gray-200 rounded-full h-2;
}

.progress-fill {
  @apply bg-blue-600 h-2 rounded-full transition-all duration-300;
}

.checklist-filters {
  @apply flex items-center justify-between flex-wrap gap-3;
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

.search-input {
  @apply pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm;
}

.filter-select {
  @apply px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm;
}

.filters-right {
  @apply flex items-center space-x-2;
}

.sort-control {
  @apply flex items-center space-x-1;
}

.sort-select {
  @apply px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm;
}

.sort-order-btn {
  @apply p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-md transition-colors;
}

.checklist-list {
  @apply space-y-4;
}

.checklist-card {
  @apply bg-white border rounded-lg shadow-sm overflow-hidden;
}

.checklist-card.completed {
  @apply border-green-200 bg-green-50;
}

.checklist-header-card {
  @apply flex items-start justify-between p-4;
}

.checklist-info {
  @apply flex-1;
}

.checklist-title {
  @apply flex items-center justify-between mb-2;
}

.checklist-title h4 {
  @apply text-lg font-semibold text-gray-900;
}

.checklist-badges {
  @apply flex items-center space-x-2;
}

.priority-badge {
  @apply px-2 py-1 text-xs rounded-full font-medium;
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
  @apply px-2 py-1 text-xs rounded-full font-medium;
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
  @apply flex items-center space-x-4 text-sm text-gray-600;
}

.checklist-actions {
  @apply flex items-center space-x-1;
}

.expand-btn,
.edit-btn,
.duplicate-btn,
.delete-btn {
  @apply w-8 h-8 flex items-center justify-center text-gray-400 hover:text-gray-600 rounded transition-colors;
}

.expand-btn.active {
  @apply text-blue-600;
}

.edit-btn:hover {
  @apply text-blue-600;
}

.duplicate-btn:hover {
  @apply text-green-600;
}

.delete-btn:hover {
  @apply text-red-600;
}

.checklist-progress-bar {
  @apply mx-4 mb-4;
}

.checklist-progress-bar .progress-bar {
  @apply bg-gray-200 h-1;
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

.checklist-items {
  @apply border-t border-gray-200 p-4 space-y-4;
}

.items-header {
  @apply flex items-center justify-between;
}

.items-header h5 {
  @apply text-sm font-semibold text-gray-900;
}

.add-item-btn {
  @apply px-3 py-1 bg-green-600 text-white rounded text-sm hover:bg-green-700 flex items-center transition-colors;
}

.items-list {
  @apply space-y-3;
}

.checklist-item {
  @apply flex items-start space-x-3 p-3 bg-gray-50 rounded-lg;
}

.checklist-item.completed {
  @apply bg-green-50;
}

.item-checkbox {
  @apply relative flex-shrink-0 mt-1;
}

.checkbox-input {
  @apply sr-only;
}

.checkbox-label {
  @apply w-5 h-5 border-2 border-gray-300 rounded cursor-pointer flex items-center justify-center transition-colors;
}

.checkbox-input:checked + .checkbox-label {
  @apply bg-green-600 border-green-600;
}

.checkbox-input:checked + .checkbox-label::after {
  content: '✓';
  @apply text-white text-sm font-bold;
}

.item-content {
  @apply flex-1;
}

.item-text {
  @apply space-y-1;
}

.item-title {
  @apply text-sm font-medium text-gray-900 block;
}

.checklist-item.completed .item-title {
  @apply line-through text-gray-500;
}

.item-description {
  @apply text-xs text-gray-600 block;
}

.item-meta {
  @apply flex items-center space-x-3 mt-2 text-xs text-gray-500;
}

.item-actions {
  @apply flex items-center space-x-1;
}

.item-edit-btn,
.item-delete-btn {
  @apply w-6 h-6 flex items-center justify-center text-gray-400 hover:text-gray-600 rounded transition-colors;
}

.item-edit-btn:hover {
  @apply text-blue-600;
}

.item-delete-btn:hover {
  @apply text-red-600;
}

.no-items {
  @apply text-center py-8;
}

.no-checklists {
  @apply text-center py-12;
}

.create-first-btn {
  @apply px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center mx-auto transition-colors;
}

.categories-view {
  @apply space-y-6;
}

.category-section {
  @apply bg-white border rounded-lg overflow-hidden;
}

.category-header {
  @apply flex items-center justify-between p-4 bg-gray-50 border-b;
}

.category-info {
  @apply flex items-center space-x-3;
}

.category-title {
  @apply text-lg font-semibold text-gray-900 flex items-center;
}

.category-count {
  @apply text-sm text-gray-600;
}

.category-progress {
  @apply flex items-center space-x-3;
}

.progress-text {
  @apply text-sm font-medium text-gray-700;
}

.mini-progress-bar {
  @apply w-20 bg-gray-200 rounded-full h-2;
}

.mini-progress-fill {
  @apply bg-blue-600 h-2 rounded-full transition-all duration-300;
}

.category-checklists {
  @apply p-4 space-y-3;
}

.mini-checklist-card {
  @apply p-3 bg-gray-50 rounded-lg cursor-pointer hover:bg-gray-100 transition-colors;
}

.mini-card-header {
  @apply flex items-center justify-between;
}

.mini-card-info {
  @apply flex items-center space-x-2;
}

.mini-card-title {
  @apply text-sm font-medium text-gray-900;
}

.mini-card-badges {
  @apply flex items-center space-x-1;
}

.mini-priority-badge {
  @apply w-2 h-2 rounded-full;
}

.mini-priority-badge.priority-high {
  @apply bg-red-500;
}

.mini-priority-badge.priority-medium {
  @apply bg-yellow-500;
}

.mini-priority-badge.priority-low {
  @apply bg-green-500;
}

.mini-card-progress {
  @apply flex items-center space-x-2;
}

.mini-progress-text {
  @apply text-xs text-gray-600;
}

.mini-progress {
  @apply w-16 bg-gray-200 rounded-full h-1;
}
</style>