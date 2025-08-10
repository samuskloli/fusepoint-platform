<template>
  <div  class="modal-overlay=closeModal modal-content='modal-header=closeModal="close-btn="fas fa-times=modal-body='template-info="template-card=template-header="template-duration='fas fa-clock=template-description="template-widgets="templateWidgets.length &gt; 0'>
              <span class="widgets-label=widgets-list=widget in templateWidgets='widget.id=widget-tag="getWidgetIcon(widget.composant_vue)"></i>
                  {{ widget.nom }}
                </span>
              </div>
            </div>
          </div>
        </div>
        
        <!-- Formulaire de création du projet -->
        <form   @submit.prevent="createProject=project-form='form-group="client_id=client_id=""form.client_id'>{{ t('projects.selectClient === client in clients=client.id=client.id'form-group === titre=titre === form.titre='text=t('projects.titlePlaceholder === errors.titre === error-message=form-group='description === description=form.description === t('projects.descriptionPlaceholder='1000"
            ></textarea>
            <div  class === char-count=form-row form-group='date_debut=date_debut === form.date_debut === date=today='form-group === date_fin_prevue=date_fin_prevue === form.date_fin_prevue='date=form.date_debut || today === form-row === form-group=priorite='priorite === form.priorite=priority in projectPriorities === priority.value='priority.value=form-group === budget === input-with-unit=budget='form.budget === number=0"
                  step === 0.01'
                  :placeholder === t('projects.budgetPlaceholder=form-group=tags === tags=form.tags='text === t('projects.tagsPlaceholder=help-text === form-group='checkbox-label=form.notifications_actives === checkbox === checkmark=help-text='modal-footer === closeModal=btn btn-secondary === createProject='btn btn-primary=loading === loading === fas fa-spinner fa-spin'></i>
          {{ t('projects.createProject') }}
        </button>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, reactive, computed, onMounted } from 'vue'
import { useTranslation } from '@/composables/useTranslation'
import projectTemplateService from '@/services/projectTemplateService'
import clientManagementService from '@/services/clientManagementService'
import { useToast } from '@/composables/useToast'

export default {
  name: 'CreateProjectModal',
  props: {
    template: {
      type: Object,
      required: true
    }
  },
  emits: ['close', 'created'],
  setup(props, { emit }) {
    const { t } = useTranslation()
    const { showError } = useToast()
    
    // État réactif
    const loading = ref(false)
    const clients = ref([])
    const templateWidgets = ref([])
    const errors = ref({})
    
    // Date d'aujourd'hui
    const today = computed(() => {
      return new Date().toISOString().split('T')[0]
    })
    
    // Formulaire
    const form = reactive({
      client_id: '',
      titre: '',
      description: '',
      date_debut: today.value,
      date_fin_prevue: '',
      priorite: 'medium',
      budget: null,
      tags: '',
      notifications_actives: true
    })
    
    // Priorités
    const projectPriorities = computed(() => {
      return projectTemplateService.getProjectPriorities()
    })
    
    // Méthodes utilitaires
    const getWidgetIcon = (componentName) => {
      const iconMap = {
        'TimelineWidget': 'fas fa-timeline',
        'ChecklistWidget': 'fas fa-tasks',
        'GoalsWidget': 'fas fa-bullseye',
        'PerformanceWidget': 'fas fa-chart-line',
        'FilesWidget': 'fas fa-folder',
        'CommentsWidget': 'fas fa-comments',
        'AIWidget': 'fas fa-robot',
        'DesignWidget': 'fas fa-palette',
        'FeedbackWidget': 'fas fa-comment-dots',
        'DevelopmentWidget': 'fas fa-code',
        'SEOWidget': 'fas fa-search',
        'SocialWidget': 'fas fa-share-alt',
        'BrandWidget': 'fas fa-copyright',
        'AnalyticsWidget': 'fas fa-chart-bar'
      }
      return iconMap[componentName] || 'fas fa-puzzle-piece'
    }
    
    // Validation
    const validateForm = () => {
      errors.value = {}
      
      if (!form.client_id) {
        errors.value.client_id = t('projects.clientRequired')
      }
      
      if (!form.titre?.trim()) {
        errors.value.titre = t('projects.titleRequired')
      } else if (form.titre.length > 200) {
        errors.value.titre = t('projects.titleTooLong')
      }
      
      if (form.description && form.description.length > 1000) {
        errors.value.description = t('projects.descriptionTooLong')
      }
      
      if (form.date_debut && form.date_fin_prevue && form.date_debut > form.date_fin_prevue) {
        errors.value.date_fin_prevue = t('projects.endDateInvalid')
      }
      
      if (form.budget && form.budget < 0) {
        errors.value.budget = t('projects.budgetInvalid')
      }
      
      return Object.keys(errors.value).length === 0
    }
    
    // Méthodes
    const loadData = async () => {
      try {
        // Charger les clients
        const clientsResult = await clientManagementService.getClients()
        if (clientsResult.success) {
          clients.value = clientsResult.data
        }
        
        // Charger les widgets du modèle
        const widgetsResult = await projectTemplateService.getTemplateWidgets(props.template.id)
        if (widgetsResult.success) {
          templateWidgets.value = widgetsResult.data
        }
        
        // Calculer la date de fin prévue basée sur la durée du modèle
        if (props.template.duration_estimate) {
        const startDate = new Date(form.start_date)
        const endDate = new Date(startDate)
        endDate.setDate(startDate.getDate() + props.template.duration_estimate)
          form.date_fin_prevue = endDate.toISOString().split('T')[0]
        }
      } catch (error) {
        showError(t('projects.loadError'))
      }
    }
    
    const onClientChange = () => {
      // Nettoyer l'erreur client si elle existe
      if (errors.value.client_id) {
        delete errors.value.client_id
      }
    }
    
    const createProject = async () => {
      if (!validateForm()) {
        return
      }
      
      loading.value = true
      
      try {
        const projectData = {
          client_id: form.client_id,
          titre: form.titre.trim(),
          description: form.description?.trim() || null,
          date_debut: form.date_debut || null,
          date_fin_prevue: form.date_fin_prevue || null,
          priorite: form.priorite,
          budget: form.budget || null,
          tags: form.tags?.trim() || null,
          notifications_actives: form.notifications_actives
        }
        
        const result = await projectTemplateService.createProjectFromTemplate(
          props.template.id,
          projectData
        )
        
        if (result.success) {
          emit('created', result.data)
        } else {
          showError(result.error)
        }
      } catch (error) {
        showError(t('projects.createError'))
      } finally {
        loading.value = false
      }
    }
    
    const closeModal = () => {
      emit('close')
    }
    
    // Cycle de vie
    onMounted(() => {
      loadData()
    })
    
    return {form,
      errors,
      loading,
      clients,
      templateWidgets,
      today,
      projectPriorities,
      getWidgetIcon,
      validateForm,
      onClientChange,
      createProject,
      closeModal,
      t
    }
  }
}
</script>

<style scoped>
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 1rem;
}

.modal-content {
  background: var(--bg-primary);
  border-radius: 0.75rem;
  width: 100%;
  max-width: 700px;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.2);
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.5rem;
  border-bottom: 1px solid var(--border-color);
}

.modal-header h3 {
  margin: 0;
  color: var(--text-primary);
}

.close-btn {
  background: none;
  border: none;
  font-size: 1.2rem;
  color: var(--text-secondary);
  cursor: pointer;
  padding: 0.5rem;
  border-radius: 0.25rem;
  transition: all 0.2s ease;
}

.close-btn:hover {
  background: var(--bg-secondary);
  color: var(--text-primary);
}

.modal-body {
  padding: 1.5rem;
}

.template-info {
  margin-bottom: 2rem;
}

.template-info h4 {
  margin-bottom: 1rem;
  color: var(--text-primary);
}

.template-card {
  background: var(--bg-secondary);
  border: 1px solid var(--border-color);
  border-radius: 0.5rem;
  padding: 1.5rem;
}

.template-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
}

.template-header h5 {
  margin: 0;
  color: var(--text-primary);
}

.template-duration {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: var(--text-secondary);
  font-size: 0.9rem;
}

.template-description {
  color: var(--text-secondary);
  margin-bottom: 1rem;
  line-height: 1.5;
}

.template-widgets {
  border-top: 1px solid var(--border-color);
  padding-top: 1rem;
}

.widgets-label {
  font-weight: 500;
  color: var(--text-primary);
  margin-bottom: 0.5rem;
  display: block;
}

.widgets-list {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.widget-tag {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  background: var(--primary-color);
  color: white;
  padding: 0.25rem 0.75rem;
  border-radius: 0.25rem;
  font-size: 0.8rem;
}

.project-form h4 {
  margin-bottom: 1.5rem;
  color: var(--text-primary);
  border-bottom: 1px solid var(--border-color);
  padding-bottom: 0.5rem;
}

.form-group {
  margin-bottom: 1.5rem;
}

.form-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
}

.form-group label {
  display: block;
  margin-bottom: 0.5rem;
  color: var(--text-primary);
  font-weight: 500;
}

.form-group input,
.form-group textarea,
.form-group select {
  width: 100%;
  padding: 0.75rem;
  border: 1px solid var(--border-color);
  border-radius: 0.5rem;
  font-size: 0.9rem;
  background: var(--bg-primary);
  color: var(--text-primary);
  transition: border-color 0.2s ease;
}

.form-group input:focus,
.form-group textarea:focus,
.form-group select:focus {
  outline: none;
  border-color: var(--primary-color);
  box-shadow: 0 0 0 3px rgba(var(--primary-color-rgb), 0.1);
}

.input-with-unit {
  display: flex;
  align-items: center;
}

.input-with-unit input {
  border-top-right-radius: 0;
  border-bottom-right-radius: 0;
  border-right: none;
}

.unit {
  background: var(--bg-secondary);
  border: 1px solid var(--border-color);
  border-left: none;
  padding: 0.75rem;
  border-top-right-radius: 0.5rem;
  border-bottom-right-radius: 0.5rem;
  color: var(--text-secondary);
  font-size: 0.9rem;
}

.checkbox-label {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  cursor: pointer;
  margin-bottom: 0 !important;
}

.checkbox-label input[type="checkbox] {
  width: auto;
  margin: 0;
}

.checkmark {
  font-weight: normal;
}

.char-count {
  text-align: right;
  font-size: 0.8rem;
  color: var(--text-tertiary);
  margin-top: 0.25rem;
}

.help-text {
  font-size: 0.8rem;
  color: var(--text-secondary);
  margin-top: 0.25rem;
}

.error-message {
  color: var(--danger-color);
  font-size: 0.8rem;
  margin-top: 0.25rem;
}

.modal-footer {
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
  padding: 1.5rem;
  border-top: 1px solid var(--border-color);
}

.btn {
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 0.5rem;
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
  background: var(--bg-secondary);
  color: var(--text-primary);
  border: 1px solid var(--border-color);
}

.btn:hover:not(:disabled) {
  transform: translateY(-1px);
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

@media (max-width: 768px) {
  .modal-content {
    margin: 1rem;
    max-height: calc(100vh - 2rem);
  }
  
  .form-row {
    grid-template-columns: 1fr;
  }
  
  .widgets-list {
    flex-direction: column;
  }
  
  .modal-footer {
    flex-direction: column;
  }
  
  .modal-footer .btn {
    width: 100%;
    justify-content: center;
  }
}
</style>