import { ref, computed, onMounted } from 'vue'
import { useTranslation } from '@/composables/useTranslation'
import { useToast } from '@/composables/useToast'
import projectTemplateService from '@/services/projectTemplateService'

/**
 * Composable pour gérer les modèles de projets
 */
export function useProjectTemplates() {
  const { t } = useTranslation()
  const { showToast } = useToast()

  // État réactif
  const templates = ref([])
  const loading = ref(false)
  const error = ref(null)
  const searchQuery = ref('')
  const selectedCategory = ref('')
  const categories = ref([])

  // Templates filtrés
  const filteredTemplates = computed(() => {
    let filtered = templates.value

    // Filtrage par recherche
    if (searchQuery.value) {
      const query = searchQuery.value.toLowerCase()
      filtered = filtered.filter(template => 
        template.name.toLowerCase().includes(query) ||
        template.description?.toLowerCase().includes(query) ||
        template.tags?.toLowerCase().includes(query)
      )
    }

    // Filtrage par catégorie
    if (selectedCategory.value) {
      filtered = filtered.filter(template => template.categorie === selectedCategory.value)
    }

    return filtered
  })

  // Charger les modèles
  const loadTemplates = async () => {
    try {
      loading.value = true
      error.value = null
      const response = await projectTemplateService.getTemplates()
      templates.value = response.data || []
    } catch (err) {
      error.value = err.message
      showToast(t('projectTemplates.loadError'), 'error')
    } finally {
      loading.value = false
    }
  }

  // Charger les catégories
  const loadCategories = async () => {
    try {
      const response = await projectTemplateService.getTemplateCategories()
      categories.value = response.data || []
    } catch (err) {
      console.error('Erreur lors du chargement des catégories:', err)
    }
  }

  // Créer un modèle
  const createTemplate = async (templateData) => {
    try {
      const response = await projectTemplateService.createTemplate(templateData)
      templates.value.push(response.data)
      showToast(t('projectTemplates.saveSuccess'), 'success')
      return response.data
    } catch (err) {
      showToast(t('projectTemplates.saveError'), 'error')
      throw err
    }
  }

  // Mettre à jour un modèle
  const updateTemplate = async (id, templateData) => {
    try {
      const response = await projectTemplateService.updateTemplate(id, templateData)
      const index = templates.value.findIndex(t => t.id === id)
      if (index !== -1) {
        templates.value[index] = response.data
      }
      showToast(t('projectTemplates.saveSuccess'), 'success')
      return response.data
    } catch (err) {
      showToast(t('projectTemplates.saveError'), 'error')
      throw err
    }
  }

  // Dupliquer un modèle
  const duplicateTemplate = async (id) => {
    try {
      const response = await projectTemplateService.duplicateTemplate(id)
      templates.value.push(response.data)
      showToast(t('projectTemplates.duplicateSuccess'), 'success')
      return response.data
    } catch (err) {
      showToast(t('projectTemplates.duplicateError'), 'error')
      throw err
    }
  }

  // Changer le statut d'un modèle
  const toggleTemplateStatus = async (id, isActive) => {
    try {
      await projectTemplateService.updateTemplate(id, { is_active: isActive })
      const template = templates.value.find(t => t.id === id)
      if (template) {
        template.is_active = isActive
      }
      const message = isActive ? 
        t('projectTemplates.activateSuccess') : 
        t('projectTemplates.deactivateSuccess')
      showToast(message, 'success')
    } catch (err) {
      showToast(t('projectTemplates.statusError'), 'error')
      throw err
    }
  }

  // Supprimer un modèle
  const deleteTemplate = async (id) => {
    try {
      await projectTemplateService.deleteTemplate(id)
      templates.value = templates.value.filter(t => t.id !== id)
      showToast(t('projectTemplates.deleteSuccess'), 'success')
    } catch (err) {
      showToast(t('projectTemplates.deleteError'), 'error')
      throw err
    }
  }

  // Initialisation
  onMounted(() => {
    loadTemplates()
    loadCategories()
  })

  return {
    // État
    templates,
    loading,
    error,
    searchQuery,
    selectedCategory,
    categories,
    
    // Computed
    filteredTemplates,
    
    // Méthodes
    loadTemplates,
    loadCategories,
    createTemplate,
    updateTemplate,
    duplicateTemplate,
    toggleTemplateStatus,
    deleteTemplate
  }
}

/**
 * Composable pour gérer les widgets
 */
export function useWidgets() {
  const { t } = useTranslation()
  const { showToast } = useToast()

  // État réactif
  const widgets = ref([])
  const loading = ref(false)
  const error = ref(null)
  const searchQuery = ref('')
  const selectedCategory = ref('')
  const categories = ref([])

  // Widgets filtrés
  const filteredWidgets = computed(() => {
    let filtered = widgets.value

    // Filtrage par recherche
    if (searchQuery.value) {
      const query = searchQuery.value.toLowerCase()
      filtered = filtered.filter(widget => 
        widget.nom.toLowerCase().includes(query) ||
        widget.description?.toLowerCase().includes(query)
      )
    }

    // Filtrage par catégorie
    if (selectedCategory.value) {
      filtered = filtered.filter(widget => widget.categorie === selectedCategory.value)
    }

    return filtered
  })

  // Charger les widgets
  const loadWidgets = async () => {
    try {
      loading.value = true
      error.value = null
      const response = await projectTemplateService.getWidgets()
      widgets.value = response.data || []
    } catch (err) {
      error.value = err.message
      showToast(t('widgets.loadError'), 'error')
    } finally {
      loading.value = false
    }
  }

  // Charger les catégories de widgets
  const loadWidgetCategories = async () => {
    try {
      const response = await projectTemplateService.getWidgetCategories()
      categories.value = response.data || []
    } catch (err) {
      console.error('Erreur lors du chargement des catégories de widgets:', err)
    }
  }

  // Charger les widgets d'un modèle
  const loadTemplateWidgets = async (templateId) => {
    try {
      const response = await projectTemplateService.getTemplateWidgets(templateId)
      return response.data || []
    } catch (err) {
      showToast(t('widgets.loadError'), 'error')
      throw err
    }
  }

  // Mettre à jour les widgets d'un modèle
  const updateTemplateWidgets = async (templateId, widgetIds) => {
    try {
      await projectTemplateService.updateTemplateWidgets(templateId, widgetIds)
      showToast(t('projectTemplates.widgetsUpdateSuccess'), 'success')
    } catch (err) {
      showToast(t('widgets.saveError'), 'error')
      throw err
    }
  }

  // Charger les widgets d'un projet
  const loadProjectWidgets = async (projectId) => {
    try {
      const response = await projectTemplateService.getProjectWidgets(projectId)
      return response.data || []
    } catch (err) {
      showToast(t('widgets.loadError'), 'error')
      throw err
    }
  }

  // Mettre à jour l'état d'un widget de projet
  const updateProjectWidgetState = async (projectId, widgetId, state) => {
    try {
      await projectTemplateService.updateProjectWidgetState(projectId, widgetId, state)
    } catch (err) {
      console.error('Erreur lors de la mise à jour de l\'état du widget:', err)
      throw err
    }
  }

  // Initialisation
  onMounted(() => {
    loadWidgets()
    loadWidgetCategories()
  })

  return {
    // État
    widgets,
    loading,
    error,
    searchQuery,
    selectedCategory,
    categories,
    
    // Computed
    filteredWidgets,
    
    // Méthodes
    loadWidgets,
    loadWidgetCategories,
    loadTemplateWidgets,
    updateTemplateWidgets,
    loadProjectWidgets,
    updateProjectWidgetState
  }
}

/**
 * Composable pour gérer les projets basés sur des modèles
 */
export function useTemplateProjects() {
  const { t } = useTranslation()
  const { showToast } = useToast()

  // Créer un projet à partir d'un modèle
  const createProjectFromTemplate = async (templateId, projectData) => {
    try {
      const response = await projectTemplateService.createProjectFromTemplate(templateId, projectData)
      showToast(t('projectTemplates.projectCreateSuccess'), 'success')
      return response.data
    } catch (err) {
      showToast(t('projects.createError'), 'error')
      throw err
    }
  }

  return {
    createProjectFromTemplate
  }
}