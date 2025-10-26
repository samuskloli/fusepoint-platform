<template>
  <div class="modal-overlay" @click.self="closeModal">
    <div class="modal-content">
      <div class="modal-header">
        <h3>{{ isEdit ? t('projectTemplates.editTitle') : t('projectTemplates.createTitle') }}</h3>
        <button class="close-btn" @click="closeModal">
          <i class="fas fa-times"></i>
        </button>
      </div>
      <form @submit.prevent="saveTemplate">
        <div class="modal-body">
          <div class="form-group">
            <label for="nom">{{ t('projectTemplates.name') }}</label>
            <input id="nom" v-model="form.name" type="text" :placeholder="t('projectTemplates.namePlaceholder')" required />
            <span v-if="errors.name" class="error-message">{{ errors.name }}</span>
          </div>
          <div class="form-group">
            <label for="description">{{ t('projectTemplates.description') }}</label>
            <textarea id="description" v-model="form.description" :placeholder="t('projectTemplates.descriptionPlaceholder')"></textarea>
            <span v-if="errors.description" class="error-message">{{ errors.description }}</span>
          </div>
          <div class="form-group">
            <label for="duree_estimee">{{ t('projectTemplates.durationEstimate') }}</label>
            <div class="input-with-unit">
              <input id="duree_estimee" v-model.number="form.duration_estimate" type="number" min="1" max="365" required />
              <span class="unit">{{ t('time.days') }}</span>
            </div>
            <span v-if="errors.duration_estimate" class="error-message">{{ errors.duration_estimate }}</span>
          </div>
          <div class="form-group">
            <label for="category">{{ t('projectTemplates.category') }}</label>
            <select id="category" v-model="form.category">
              <option value="">{{ t('projectTemplates.selectCategory') }}</option>
              <option v-for="category in templateCategories" :key="category.value" :value="category.value">
                {{ t(category.labelKey || category.label || category.value) }}
              </option>
            </select>
          </div>
          <div class="form-group">
            <label for="tags">{{ t('projectTemplates.tags') }}</label>
            <input id="tags" v-model="form.tags" type="text" :placeholder="t('projectTemplates.tagsPlaceholder')" />
            <span v-if="errors.tags" class="error-message">{{ errors.tags }}</span>
          </div>
          <div class="form-group">
            <label class="checkbox-label">
              <input type="checkbox" v-model="form.is_active" />
              <span class="checkmark"></span>
              {{ t('projectTemplates.active') }}
            </label>
            <p class="help-text">{{ t('projectTemplates.activeHelp') }}</p>
          </div>
        </div>
        <div class="modal-footer">
          <button type="button" class="btn btn-secondary" @click="closeModal">
            {{ t('common.cancel') }}
          </button>
          <button type="submit" class="btn btn-primary" :disabled="loading">
            <i v-if="loading" class="fas fa-spinner fa-spin"></i>
            {{ isEdit ? t('common.update') : t('common.create') }}
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<script>
import { ref, reactive, computed, watch, nextTick } from 'vue'
import projectTemplateService from '@/services/projectTemplateService'
import { useToast } from '@/composables/useToast'
import { useTranslation } from '@/composables/useTranslation'

export default {
  name: 'TemplateModal',
  props: {
    template: {
      type: Object,
      default: null
    },
    isEdit: {
      type: Boolean,
      default: false
    }
  },
  emits: ['close', 'saved'],
  setup(props, { emit }) {
    const { t } = useTranslation()
    const { showSuccess, showError } = useToast()
    
    // État
    const loading = ref(false)
    const errors = ref({})
    
    // Formulaire
    const form = reactive({
      name: '',
      description: '',
      duration_estimate: 30,
      category: '',
      tags: '',
      is_active: true
    })
    
    // Catégories
    const templateCategories = computed(() => {
      return projectTemplateService.getTemplateCategories()
    })
    
    // Fonction pour initialiser le formulaire
    const initializeForm = async () => {
      await nextTick()
      
      console.log('=== DEBUG initializeForm ===');
      console.log('props.isEdit:', props.isEdit);
      console.log('props.template:', props.template);
      console.log('props.template type:', typeof props.template);
      
      // Réinitialiser les erreurs
      errors.value = {}
      
      if (props.isEdit && props.template) {
        console.log('=== MODE ÉDITION ===');
        console.log('Template data:', JSON.stringify(props.template, null, 2));
        
        // Mode édition - charger les données du template
        form.name = props.template.name || ''
        form.description = props.template.description || ''
        // Gérer la différence de nommage: estimated_duration (backend) vs duration_estimate (UI)
        form.duration_estimate = Number(
          props.template.duration_estimate ?? props.template.estimated_duration
        ) || 30
        form.category = props.template.category || ''
        form.tags = Array.isArray(props.template.tags)
          ? props.template.tags.join(', ')
          : (props.template.tags || '')
        form.is_active = Boolean(props.template.is_active)
        
        console.log('Form après assignation:', {
          name: form.name,
          description: form.description,
          duration_estimate: form.duration_estimate,
          category: form.category,
          tags: form.tags,
          is_active: form.is_active
        });
      } else {
        console.log('=== MODE CRÉATION ===');
        // Mode création - valeurs par défaut
        form.name = ''
        form.description = ''
        form.duration_estimate = 30
        form.category = ''
        form.tags = ''
        form.is_active = true
      }
    }
    
    // Watcher pour réinitialiser le formulaire quand les props changent
    watch([() => props.template, () => props.isEdit], (newValues, oldValues) => {
      console.log('=== WATCHER TRIGGERED ===');
      console.log('New values:', newValues);
      console.log('Old values:', oldValues);
      console.log('props.template:', props.template);
      console.log('props.isEdit:', props.isEdit);
      initializeForm()
    }, { immediate: true, deep: true })
    
    // Validation
    const validateForm = () => {
      errors.value = {}
      
      if (!form.name?.trim()) {
        errors.value.name = t('projectTemplates.nameRequired')
      } else if (form.name.length > 100) {
        errors.value.name = t('projectTemplates.nameTooLong')
      }
      
      if (!form.duration_estimate || form.duration_estimate < 1 || form.duration_estimate > 365) {
        errors.value.duration_estimate = t('projectTemplates.durationInvalid')
      }
      
      if (form.description && form.description.length > 500) {
        errors.value.description = t('projectTemplates.descriptionTooLong')
      }
      
      if (form.tags && form.tags.length > 200) {
        errors.value.tags = t('projectTemplates.tagsTooLong')
      }
      
      return Object.keys(errors.value).length === 0
    }
    
    // Méthodes
    const closeModal = () => {
      emit('close')
    }
    
    const saveTemplate = async () => {
      if (!validateForm()) {
        return
      }
      
      loading.value = true
      
      try {
        const templateData = {
          name: form.name.trim(),
          description: form.description?.trim() || '',
          // Le backend attend estimated_duration
          estimated_duration: form.duration_estimate,
          category: form.category,
          // Envoyer un tableau de tags, pas une string
          tags: form.tags
            ? form.tags.split(',').map(s => s.trim()).filter(Boolean)
            : [],
          is_active: form.is_active
        }
        
        let result
        if (props.isEdit && props.template) {
          result = await projectTemplateService.updateProjectTemplate(
            props.template.id,
            templateData
          )
        } else {
          result = await projectTemplateService.createProjectTemplate(templateData)
        }
        
        if (result.success) {
          emit('saved', result.data)
        } else {
          showError(result.error)
        }
      } catch (error) {
        showError(t('projectTemplates.saveError'))
      } finally {
        loading.value = false
      }
    }
    
    // Nettoyer les erreurs quand l'utilisateur tape
    watch(() => form.name, () => {
      if (errors.value.name) {
        delete errors.value.name
      }
    })
    
    watch(() => form.duration_estimate, () => {
      if (errors.value.duration_estimate) {
        delete errors.value.duration_estimate
      }
    })
    
    watch(() => form.description, () => {
      if (errors.value.description) {
        delete errors.value.description
      }
    })
    
    watch(() => form.tags, () => {
      if (errors.value.tags) {
        delete errors.value.tags
      }
    })
    
    return {
      loading,
      errors,
      form,
      templateCategories,
      closeModal,
      saveTemplate,
      isEdit: props.isEdit,
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
}

.modal-content {
  background: var(--bg-primary);
  border-radius: 0.5rem;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
  width: 90%;
  max-width: 500px;
  max-height: 90vh;
  overflow-y: auto;
}

.modal-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1.5rem;
  border-bottom: 1px solid var(--border-color);
}

.modal-header h3 {
  margin: 0;
  font-size: 1.25rem;
  font-weight: 600;
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

.form-group {
  margin-bottom: 1.5rem;
}

.form-group label {
  display: block;
  margin-bottom: 0.5rem;
  font-weight: 500;
  color: var(--text-primary);
}

.form-group input,
.form-group textarea,
.form-group select {
  width: 100%;
  padding: 0.75rem;
  border: 1px solid var(--border-color);
  border-radius: 0.375rem;
  font-size: 0.875rem;
  transition: border-color 0.2s ease;
  background: var(--bg-primary);
  color: var(--text-primary);
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
  padding: 0.75rem;
  background: var(--bg-secondary);
  border: 1px solid var(--border-color);
  border-left: none;
  border-top-right-radius: 0.375rem;
  border-bottom-right-radius: 0.375rem;
  font-size: 0.875rem;
  color: var(--text-secondary);
}

.checkbox-label {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  cursor: pointer;
  margin-bottom: 0 !important;
}

.checkbox-label input[type="checkbox"] {
  width: auto;
  margin: 0;
}

.help-text {
  margin-top: 0.25rem;
  font-size: 0.75rem;
  color: var(--text-secondary);
}

.error-message {
  margin-top: 0.25rem;
  font-size: 0.75rem;
  color: var(--error-color);
}

.modal-footer {
  display: flex;
  gap: 0.75rem;
  justify-content: flex-end;
  margin-top: 2rem;
}

.btn {
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 0.375rem;
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.btn-secondary {
  background: var(--bg-secondary);
  color: var(--text-primary);
  border: 1px solid var(--border-color);
}

.btn-secondary:hover:not(:disabled) {
  background: var(--bg-tertiary);
}

.btn-primary {
  background: var(--primary-color);
  color: white;
}

.btn-primary:hover:not(:disabled) {
  background: var(--primary-color-dark);
}

@media (max-width: 640px) {
  .modal-content {
    width: 95%;
    margin: 1rem;
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