<template>
  <div class="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50" @click="closeModal">
    <div class="relative top-10 mx-auto p-5 border w-11/12 md:w-4/5 lg:w-3/4 xl:w-2/3 shadow-lg rounded-lg bg-white" @click.stop>
      <!-- En-tête -->
      <div class="flex items-center justify-between pb-4 border-b border-gray-200">
        <div class="flex items-center space-x-3">
          <div class="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
            <i class="fas fa-plus text-blue-600"></i>
          </div>
          <div>
            <h3 class="text-lg font-medium text-gray-900">{{ t('customProjects.title') }}</h3>
            <p class="text-sm text-gray-600">{{ currentStep === 1 ? t('customProjects.subtitle') : t('customProjects.projectDetails') }}</p>
          </div>
        </div>
        <button @click="closeModal" class="text-gray-400 hover:text-gray-600 transition-colors">
          <i class="fas fa-times text-xl"></i>
        </button>
      </div>

      <!-- Indicateur d'étapes -->
      <div class="flex items-center justify-center py-6">
        <div class="flex items-center space-x-4">
          <!-- Étape 1 -->
          <div class="flex items-center">
            <div class="w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-all" :class="currentStep >= 1 ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-500'">
              1
            </div>
            <span class="ml-2 text-sm font-medium" :class="currentStep >= 1 ? 'text-blue-600' : 'text-gray-500'">
              {{ t('customProjects.selectTemplate') }}
            </span>
          </div>
          
          <div class="w-12 h-0.5 transition-colors" :class="currentStep >= 2 ? 'bg-blue-600' : 'bg-gray-200'"></div>
          
          <!-- Étape 2 -->
          <div class="flex items-center">
            <div class="w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-all" :class="currentStep >= 2 ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-500'">
              2
            </div>
            <span class="ml-2 text-sm font-medium" :class="currentStep >= 2 ? 'text-blue-600' : 'text-gray-500'">
              {{ t('customProjects.projectDetails') }}
            </span>
          </div>
        </div>
      </div>

      <!-- Contenu des étapes -->
      <div class="max-h-96 overflow-y-auto">
        <!-- Étape 1: Sélection du modèle -->
        <div v-if="currentStep === 1" class="space-y-6">
          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div 
              v-for="template in projectTemplatesComputed" 
              :key="template.id"
              @click="selectTemplate(template)"
              class="relative p-4 border-2 rounded-lg cursor-pointer transition-all hover:shadow-md"
              :class="selectedTemplate?.id === template.id ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-gray-300'"
            >
              <!-- Badge de sélection -->
              <div v-if="selectedTemplate?.id === template.id" class="absolute top-2 right-2 w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center">
                <i class="fas fa-check text-white text-xs"></i>
              </div>
              
              <!-- Icône du modèle -->
              <div class="w-12 h-12 rounded-lg flex items-center justify-center mb-3" 
                   :style="{ backgroundColor: template.color + '20', color: template.color }">
                <i :class="template.icon" class="text-xl"></i>
              </div>
              
              <h4 class="font-medium text-gray-900 mb-2">{{ template.name }}</h4>
              <p class="text-sm text-gray-600 mb-3">{{ template.description }}</p>
              
              <!-- Tags -->
              <div class="flex flex-wrap gap-1" v-if="template.tags && typeof template.tags === 'string'">
                <span 
                  v-for="tag in template.tags.split(',')" 
                  :key="tag"
                  class="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800"
                >
                  {{ tag.trim() }}
                </span>
              </div>
              
              <!-- Durée estimée -->
              <div class="mt-3 flex items-center text-sm text-gray-500" v-if="template.duration_estimate">
                <i class="fas fa-clock mr-1"></i>
                {{ template.duration_estimate }} jours
              </div>
            </div>
          </div>
        </div>

        <!-- Étape 2: Formulaire de création -->
        <div v-if="currentStep === 2" class="space-y-6">
          <!-- Template sélectionné -->
          <div v-if="selectedTemplate" class="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div class="flex items-center space-x-3">
              <div class="w-10 h-10 rounded-lg flex items-center justify-center" :style="{ backgroundColor: selectedTemplate.color + '20', color: selectedTemplate.color }">
                <i :class="selectedTemplate.icon" class="text-lg"></i>
              </div>
              <div>
                <h4 class="font-medium text-gray-900">{{ selectedTemplate.name }}</h4>
                <p class="text-sm text-gray-600">{{ t('customProjects.templateSelected') }}</p>
              </div>
            </div>
          </div>

          <form @submit.prevent="createProject" class="space-y-4">
            <!-- Nom du projet -->
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">
                {{ t('customProjects.form.name') }} *
              </label>
              <input 
                v-model="projectForm.name"
                type="text"
                required
                class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                :placeholder="t('customProjects.form.namePlaceholder')"
              >
            </div>

            <!-- Description -->
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">
                {{ t('customProjects.form.description') }}
              </label>
              <textarea 
                v-model="projectForm.description"
                rows="3"
                class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                :placeholder="t('customProjects.form.descriptionPlaceholder')"
              ></textarea>
            </div>

            <!-- Client assigné -->
            <div v-if="selectedClient" class="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div class="flex items-center space-x-3">
                <div class="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                  <i class="fas fa-user text-blue-600"></i>
                </div>
                <div>
                  <h4 class="font-medium text-gray-900">{{ selectedClient.name }}</h4>
                  <p class="text-sm text-gray-600">{{ t('customProjects.form.clientAutoAssigned') }}</p>
                </div>
              </div>
            </div>

            <!-- Dates -->
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">
                  {{ t('customProjects.form.startDate') }} *
                </label>
                <input 
                  v-model="projectForm.startDate"
                  type="date"
                  required
                  class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">
                  {{ t('customProjects.form.endDate') }} *
                </label>
                <input 
                  v-model="projectForm.endDate"
                  type="date"
                  required
                  class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
              </div>
            </div>

            <!-- Budget et Priorité -->
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">
                  {{ t('customProjects.form.budget') }}
                </label>
                <input 
                  v-model="projectForm.budget"
                  type="number"
                  min="0"
                  step="0.01"
                  class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  :placeholder="t('customProjects.form.budgetPlaceholder')"
                >
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">
                  {{ t('customProjects.form.priority') }} *
                </label>
                <select 
                  v-model="projectForm.priority"
                  class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="low">{{ t('customProjects.form.priorityLow') }}</option>
                  <option value="medium">{{ t('customProjects.form.priorityMedium') }}</option>
                  <option value="high">{{ t('customProjects.form.priorityHigh') }}</option>
                  <option value="urgent">{{ t('customProjects.form.priorityUrgent') }}</option>
                </select>
              </div>
            </div>
          </form>
        </div>
      </div>

      <!-- Actions -->
      <div class="flex items-center justify-between pt-4 border-t border-gray-200">
        <div>
          <button 
            v-if="currentStep === 2"
            @click="goToPreviousStep"
            class="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
          >
            <i class="fas fa-arrow-left mr-2"></i>
            {{ t('actions.previous') }}
          </button>
        </div>
        
        <div class="flex space-x-3">
          <button 
            @click="closeModal"
            class="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition-colors"
          >
            {{ t('actions.cancel') }}
          </button>
          
          <button 
            v-if="currentStep === 1"
            @click="goToNextStep"
            :disabled="!selectedTemplate"
            class="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
          >
            {{ t('actions.next') }}
            <i class="fas fa-arrow-right ml-2"></i>
          </button>
          
          <button 
            v-if="currentStep === 2"
            @click="createProject"
            :disabled="isCreateButtonDisabled"
            class="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
          >
            <i v-if="isCreating" class="fas fa-spinner fa-spin mr-2"></i>
            <i v-else class="fas fa-plus mr-2"></i>
            {{ t('customProjects.form.create') }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import { useNotifications } from '@/composables/useNotifications'
import { useTranslation } from '@/composables/useTranslation'
import projectManagementService from '@/services/projectManagementService'
import clientManagementService from '@/services/clientManagementService'
import projectTemplateService from '@/services/projectTemplateService'

const { success, error } = useNotifications()
const { t } = useTranslation()

// Props et émissions
const props = defineProps({
  clientId: {
    type: [String, Number],
    default: null
  }
})

const emit = defineEmits(['close', 'projectCreated'])

// État réactif
const currentStep = ref(1)
const selectedTemplate = ref(null)
const isCreating = ref(false)
const selectedClient = ref(null)
const projectTemplates = ref([])

// Formulaire de projet
const projectForm = reactive({
  name: '',
  description: '',
  clientId: '',
  startDate: new Date().toISOString().split('T')[0],
  endDate: '',
  budget: '',
  priority: 'medium'
})

// Computed
const isCreateButtonDisabled = computed(() => {
  return isCreating.value || !projectForm.name || !selectedTemplate.value || !props.clientId
})

const projectTemplatesComputed = computed(() => projectTemplates.value)

// Méthodes
const closeModal = () => {
  emit('close')
}

const selectTemplate = (template) => {
  selectedTemplate.value = template
  // Pré-remplir le nom si vide
  if (template.name && !projectForm.name) {
    projectForm.name = `${template.name} - ${new Date().getFullYear()}`
  }
}

const goToNextStep = () => {
  if (currentStep.value === 1 && selectedTemplate.value) {
    currentStep.value = 2
  }
}

const goToPreviousStep = () => {
  if (currentStep.value === 2) {
    currentStep.value = 1
  }
}

const createProject = async () => {
  if (!selectedTemplate.value) {
    error(t('customProjects.errors.noTemplate'))
    return
  }

  isCreating.value = true
  
  try {
    // Utiliser le service de template pour créer le projet avec ses widgets
    const result = await projectTemplateService.createProjectFromTemplate(
      selectedTemplate.value.id,
      {
        name: projectForm.name,
        description: projectForm.description,
        clientId: props.clientId,
        startDate: projectForm.startDate,
        endDate: projectForm.endDate,
        priority: projectForm.priority,
        budget: projectForm.budget
      }
    )
    
    if (result.success) {
      success(t('customProjects.success.created'))
      emit('projectCreated', result.data)
      closeModal()
    } else {
      error(result.error || t('customProjects.errors.createFailed'))
    }
  } catch (err) {
    console.error('Erreur lors de la création du projet:', err)
    error(t('customProjects.errors.createFailed'))
  } finally {
    isCreating.value = false
  }
}

const loadProjectTemplates = async () => {
  try {
    const result = await projectTemplateService.getProjectTemplates()
    if (result.success) {
      projectTemplates.value = result.data
    } else {
      console.error('Erreur lors du chargement des modèles:', result.error)
      error(t('customProjects.errors.loadTemplatesFailed'))
    }
  } catch (err) {
    console.error('Erreur lors du chargement des modèles:', err)
    error(t('customProjects.errors.loadTemplatesFailed'))
  }
}

const loadSelectedClient = async () => {
  if (props.clientId) {
    try {
      const result = await clientManagementService.getClientById(props.clientId)
      if (result.success) {
        selectedClient.value = result.data
        projectForm.clientId = props.clientId
      }
    } catch (err) {
      console.error('Erreur lors du chargement du client:', err)
    }
  }
}

// Initialisation
onMounted(() => {
  loadProjectTemplates()
  loadSelectedClient()
})
</script>

<style scoped>
.modal-overlay {
  backdrop-filter: blur(2px);
}
</style>