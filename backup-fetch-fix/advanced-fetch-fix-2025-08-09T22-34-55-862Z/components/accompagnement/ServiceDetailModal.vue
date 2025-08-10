<template>
  <div class="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50" @click="closeModal">
    <div class="relative top-10 mx-auto p-5 border w-11/12 md:w-4/5 lg:w-3/5 xl:w-1/2 shadow-lg rounded-md bg-white" @click.stop>
      <!-- Header -->
      <div class="flex items-start justify-between pb-4 border-b border-gray-200">
        <div class="flex items-start space-x-4">
          <div class="flex-shrink-0">
            <div class="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <component :is="getServiceIcon(service.category)" class="w-6 h-6 text-blue-600" />
            </div>
          </div>
          <div>
            <h3 class="text-xl font-semibold text-gray-900">{{ service.name }}</h3>
            <div class="flex items-center space-x-4 mt-1">
              <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                {{ getCategoryLabel(service.category) }}
              </span>
              <span class="text-lg font-bold text-blue-600">
                {{ formatPrice(service.base_price, service.price_type) }}
              </span>
            </div>
          </div>
        </div>
        <button @click="closeModal" class="text-gray-400 hover:text-gray-600">
          <XMarkIcon class="w-6 h-6" />
        </button>
      </div>

      <!-- Contenu principal -->
      <div class="mt-6 space-y-6">
        <!-- Description -->
        <div>
          <h4 class="text-sm font-medium text-gray-900 mb-2">Description</h4>
          <p class="text-gray-700 leading-relaxed">{{ service.description }}</p>
        </div>

        <!-- Détails du service -->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <!-- Informations générales -->
          <div>
            <h4 class="text-sm font-medium text-gray-900 mb-3">Informations générales</h4>
            <div class="space-y-3">
              <div class="flex justify-between">
                <span class="text-sm text-gray-600">Durée estimée:</span>
                <span class="text-sm font-medium text-gray-900">{{ service.duration_estimate }}</span>
              </div>
              <div class="flex justify-between">
                <span class="text-sm text-gray-600">Complexité:</span>
                <span class="text-sm font-medium text-gray-900">
                  <span class="inline-flex items-center">
                    <template v-for="i in 5" :key="i">
                      <StarIcon 
                        :class="[
                          'w-4 h-4',
                          i <= getComplexityLevel(service.complexity) 
                            ? 'text-yellow-400 fill-current' 
                            : 'text-gray-300'
                        ]"
                      />
                    </template>
                    <span class="ml-2 text-xs text-gray-500">({{ service.complexity }})</span>
                  </span>
                </span>
              </div>
              <div class="flex justify-between">
                <span class="text-sm text-gray-600">Disponibilité:</span>
                <span class="text-sm font-medium text-gray-900">
                  <span :class="[
                    'inline-flex items-center px-2 py-1 rounded-full text-xs font-medium',
                    service.is_available 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-red-100 text-red-800'
                  ]">
                    {{ service.is_available ? 'Disponible' : 'Non disponible' }}
                  </span>
                </span>
              </div>
            </div>
          </div>

          <!-- Prérequis -->
          <div v-if="service.prerequisites">
            <h4 class="text-sm font-medium text-gray-900 mb-3">Prérequis</h4>
            <div class="text-sm text-gray-700">
              <ul class="space-y-1">
                <li v-for="prerequisite in getPrerequisitesList(service.prerequisites)" :key="prerequisite" class="flex items-start">
                  <CheckIcon class="w-4 h-4 text-green-500 mt-0.5 mr-2 flex-shrink-0" />
                  {{ prerequisite }}
                </li>
              </ul>
            </div>
          </div>
        </div>

        <!-- Livrables -->
        <div v-if="service.deliverables">
          <h4 class="text-sm font-medium text-gray-900 mb-3">Livrables inclus</h4>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-2">
            <div 
              v-for="deliverable in getDeliverablesList(service.deliverables)" 
              :key="deliverable"
              class="flex items-center p-3 bg-gray-50 rounded-lg"
            >
              <DocumentCheckIcon class="w-5 h-5 text-blue-500 mr-3 flex-shrink-0" />
              <span class="text-sm text-gray-700">{{ deliverable }}</span>
            </div>
          </div>
        </div>

        <!-- Processus -->
        <div v-if="service.process_steps">
          <h4 class="text-sm font-medium text-gray-900 mb-3">Processus de réalisation</h4>
          <div class="space-y-3">
            <div 
              v-for="(step, index) in getProcessSteps(service.process_steps)" 
              :key="index"
              class="flex items-start"
            >
              <div class="flex-shrink-0 w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-xs font-medium mr-3 mt-0.5">
                {{ index + 1 }}
              </div>
              <div class="flex-1">
                <p class="text-sm text-gray-700">{{ step }}</p>
              </div>
            </div>
          </div>
        </div>

        <!-- FAQ ou informations supplémentaires -->
        <div v-if="service.additional_info">
          <h4 class="text-sm font-medium text-gray-900 mb-3">Informations supplémentaires</h4>
          <div class="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div class="flex items-start">
              <InformationCircleIcon class="w-5 h-5 text-blue-500 mr-3 mt-0.5 flex-shrink-0" />
              <p class="text-sm text-blue-700">{{ service.additional_info }}</p>
            </div>
          </div>
        </div>

        <!-- Exemples de réalisations -->
        <div v-if="service.portfolio_examples">
          <h4 class="text-sm font-medium text-gray-900 mb-3">Exemples de réalisations</h4>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div 
              v-for="example in getPortfolioExamples(service.portfolio_examples)" 
              :key="example.title"
              class="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
            >
              <h5 class="font-medium text-gray-900 mb-1">{{ example.title }}</h5>
              <p class="text-sm text-gray-600 mb-2">{{ example.description }}</p>
              <a 
                v-if="example.url" 
                :href="example.url" 
                target="_blank" 
                class="text-xs text-blue-600 hover:text-blue-800 flex items-center"
              >
                Voir l'exemple
                <ArrowTopRightOnSquareIcon class="w-3 h-3 ml-1" />
              </a>
            </div>
          </div>
        </div>
      </div>

      <!-- Actions -->
      <div class="flex items-center justify-end space-x-3 pt-6 mt-6 border-t border-gray-200">
        <button
          @click="closeModal"
          class="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
        >
          Fermer
        </button>
        <button
          @click="requestService"
          :disabled="!service.is_available"
          class="px-6 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {{ service.is_available ? 'Demander cette prestation' : 'Service indisponible' }}
        </button>
      </div>
    </div>
  </div>
</template>

<script>
import { inject } from 'vue'
import { 
  XMarkIcon, 
  StarIcon, 
  CheckIcon, 
  DocumentCheckIcon, 
  InformationCircleIcon,
  ArrowTopRightOnSquareIcon,
  ChartBarIcon,
  MegaphoneIcon,
  PaintBrushIcon,
  CogIcon,
  AcademicCapIcon,
  ChatBubbleLeftRightIcon
} from '@heroicons/vue/24/outline'

export default {
  name: 'ServiceDetailModal',
  components: {
    XMarkIcon,
    StarIcon,
    CheckIcon,
    DocumentCheckIcon,
    InformationCircleIcon,
    ArrowTopRightOnSquareIcon,
    ChartBarIcon,
    MegaphoneIcon,
    PaintBrushIcon,
    CogIcon,
    AcademicCapIcon,
    ChatBubbleLeftRightIcon
  },
  props: {
    service: {
      type: Object,
      required: true
    }
  },
  emits: ['close', 'request-service'],
  setup(props, { emit }) {
    // Injection des fonctions de devise
    const formatCurrency = inject('formatCurrency')
    const getCurrencySymbol = inject('getCurrencySymbol')

    const closeModal = () => {
      emit('close')
    }

    const requestService = () => {
      if (props.service.is_available) {
        emit('request-service', props.service)
      }
    }

    const getServiceIcon = (category) => {
      const icons = {
        'analytics': ChartBarIcon,
        'advertising': MegaphoneIcon,
        'design': PaintBrushIcon,
        'technical': CogIcon,
        'consulting': AcademicCapIcon,
        'communication': ChatBubbleLeftRightIcon
      }
      return icons[category] || CogIcon
    }

    const getCategoryLabel = (category) => {
      const labels = {
        'analytics': 'Analytics',
        'advertising': 'Publicité',
        'design': 'Design',
        'technical': 'Technique',
        'consulting': 'Conseil',
        'communication': 'Communication'
      }
      return labels[category] || category
    }

    const formatPrice = (price, priceType) => {
      if (priceType === 'custom') return 'Sur devis'
      if (!price) return `À partir de ${formatCurrency(0)}`
      const suffix = priceType === 'hourly' ? `${getCurrencySymbol()}/h` : ''
      return `À partir de ${formatCurrency(price)}${suffix}`
    }

    const getComplexityLevel = (complexity) => {
      const levels = {
        'simple': 1,
        'intermediate': 3,
        'advanced': 5
      }
      return levels[complexity] || 3
    }

    const getPrerequisitesList = (prerequisites) => {
      if (typeof prerequisites === 'string') {
        return prerequisites.split('\n').filter(item => item.trim())
      }
      return Array.isArray(prerequisites) ? prerequisites : []
    }

    const getDeliverablesList = (deliverables) => {
      if (typeof deliverables === 'string') {
        return deliverables.split('\n').filter(item => item.trim())
      }
      return Array.isArray(deliverables) ? deliverables : []
    }

    const getProcessSteps = (processSteps) => {
      if (typeof processSteps === 'string') {
        return processSteps.split('\n').filter(item => item.trim())
      }
      return Array.isArray(processSteps) ? processSteps : []
    }

    const getPortfolioExamples = (examples) => {
      if (typeof examples === 'string') {
        try {
          return JSON.parse(examples)
        } catch {
          return []
        }
      }
      return Array.isArray(examples) ? examples : []
    }

    return {
      closeModal,
      requestService,
      getServiceIcon,
      getCategoryLabel,
      formatPrice,
      getComplexityLevel,
      getPrerequisitesList,
      getDeliverablesList,
      getProcessSteps,
      getPortfolioExamples
    }
  }
}
</script>