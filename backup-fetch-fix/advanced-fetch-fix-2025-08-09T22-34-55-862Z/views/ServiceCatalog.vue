<template>
  <div class="min-h-screen bg-gray-50">
    <!-- Header de la page -->
    <div class="bg-white shadow-sm border-b border-gray-200">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div class="flex items-center justify-between">
          <div>
            <h1 class="text-2xl font-bold text-gray-900">Prestations Fusepoint</h1>
            <p class="mt-1 text-sm text-gray-600">
              Découvrez nos services marketing personnalisés pour booster votre croissance
            </p>
          </div>
          <div class="flex items-center space-x-3">
            <span class="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
              <svg class="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"></path>
              </svg>
              Accompagnement personnalisé
            </span>
          </div>
        </div>
      </div>
    </div>

    <!-- Filtres -->
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      <div class="flex flex-wrap items-center gap-4">
        <div class="flex items-center space-x-2">
          <label class="text-sm font-medium text-gray-700">Catégorie:</label>
          <select 
            v-model="selectedCategory" 
            class="rounded-md border-gray-300 text-sm focus:border-blue-500 focus:ring-blue-500"
          >
            <option value="">Toutes les catégories</option>
            <option value="strategy">Stratégie</option>
            <option value="creation">Création</option>
            <option value="advertising">Publicité</option>
            <option value="analysis">Analyse</option>
            <option value="technical">Technique</option>
          </select>
        </div>
        
        <div class="flex items-center space-x-2">
          <label class="text-sm font-medium text-gray-700">Prix:</label>
          <select 
            v-model="selectedPriceRange" 
            class="rounded-md border-gray-300 text-sm focus:border-blue-500 focus:ring-blue-500"
          >
            <option value="">Tous les prix</option>
            <option value="0-200">0{{ $getCurrencySymbol() }} - 200{{ $getCurrencySymbol() }}</option>
              <option value="200-500">200{{ $getCurrencySymbol() }} - 500{{ $getCurrencySymbol() }}</option>
              <option value="500-1000">500{{ $getCurrencySymbol() }} - 1000{{ $getCurrencySymbol() }}</option>
              <option value="1000+">1000{{ $getCurrencySymbol() }}+</option>
          </select>
        </div>
      </div>
    </div>

    <!-- Grille des services -->
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12">
      <div v-if="loading" class="flex justify-center py-12">
        <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
      
      <div v-else-if="error" class="text-center py-12">
        <div class="text-red-600 mb-4">
          <svg class="w-12 h-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
          </svg>
        </div>
        <h3 class="text-lg font-medium text-gray-900 mb-2">Erreur de chargement</h3>
        <p class="text-gray-600 mb-4">{{ error }}</p>
        <button 
          @click="loadServices" 
          class="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
        >
          Réessayer
        </button>
      </div>
      
      <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div 
          v-for="service in filteredServices" 
          :key="service.id"
          class="bg-white rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow duration-200"
        >
          <!-- Header de la carte -->
          <div class="p-6 pb-4">
            <div class="flex items-start justify-between">
              <div class="flex items-center">
                <div 
                  class="w-12 h-12 rounded-lg flex items-center justify-center"
                  :class="getServiceColorClass(service.color)"
                >
                  <component :is="getServiceIcon(service.icon)" class="w-6 h-6 text-white" />
                </div>
                <div class="ml-4">
                  <h3 class="text-lg font-semibold text-gray-900">{{ service.name }}</h3>
                  <span 
                    class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium"
                    :class="getCategoryClass(service.category)"
                  >
                    {{ getCategoryLabel(service.category) }}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <!-- Description -->
          <div class="px-6 pb-4">
            <p class="text-gray-600 text-sm leading-relaxed">{{ service.description }}</p>
          </div>

          <!-- Détails -->
          <div class="px-6 pb-4 space-y-3">
            <!-- Prix -->
            <div class="flex items-center justify-between">
              <span class="text-sm text-gray-500">Prix:</span>
              <div class="text-right">
                <span class="text-lg font-semibold text-gray-900">
                  {{ formatPrice(service.base_price, service.price_type) }}
                </span>
                <span v-if="service.price_type === 'hourly'" class="text-sm text-gray-500">/h</span>
              </div>
            </div>

            <!-- Durée -->
            <div class="flex items-center justify-between">
              <span class="text-sm text-gray-500">Durée estimée:</span>
              <span class="text-sm font-medium text-gray-900">{{ service.duration_estimate }}</span>
            </div>
          </div>

          <!-- Livrables -->
          <div class="px-6 pb-4">
            <h4 class="text-sm font-medium text-gray-900 mb-2">Livrables inclus:</h4>
            <ul class="space-y-1">
              <li 
                v-for="deliverable in service.deliverables" 
                :key="deliverable"
                class="flex items-center text-sm text-gray-600"
              >
                <svg class="w-4 h-4 text-green-500 mr-2 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"></path>
                </svg>
                {{ deliverable }}
              </li>
            </ul>
          </div>

          <!-- Prérequis -->
          <div v-if="service.requirements.length > 0" class="px-6 pb-4">
            <h4 class="text-sm font-medium text-gray-900 mb-2">Prérequis:</h4>
            <ul class="space-y-1">
              <li 
                v-for="requirement in service.requirements" 
                :key="requirement"
                class="flex items-center text-sm text-gray-600"
              >
                <svg class="w-4 h-4 text-blue-500 mr-2 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clip-rule="evenodd"></path>
                </svg>
                {{ requirement }}
              </li>
            </ul>
          </div>

          <!-- Actions -->
          <div class="px-6 py-4 bg-gray-50 rounded-b-lg">
            <div class="flex space-x-3">
              <button 
                @click="requestService(service)"
                class="flex-1 bg-blue-600 text-white text-sm font-medium py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors"
              >
                Demander cette prestation
              </button>
              <button 
                @click="viewServiceDetails(service)"
                class="px-4 py-2 border border-gray-300 text-gray-700 text-sm font-medium rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors"
              >
                Détails
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Modal de demande de prestation -->
    <ServiceRequestModal 
      v-if="showRequestModal"
      :service="selectedService"
      @close="showRequestModal = false"
      @submit="handleServiceRequest"
    />

    <!-- Modal de détails du service -->
    <ServiceDetailsModal 
      v-if="showDetailsModal"
      :service="selectedService"
      @close="showDetailsModal = false"
      @request="requestService"
    />
  </div>
</template>

<script>
import { ref, computed, onMounted, inject } from 'vue'
import { useRouter } from 'vue-router'
import { useToast } from '@/composables/useToast'
import authService from '@/services/authService'
import ServiceRequestModal from '@/components/accompagnement/ServiceRequestModal.vue'
import ServiceDetailsModal from '@/components/accompagnement/ServiceDetailsModal.vue'
import {
  MagnifyingGlassIcon,
  PencilIcon,
  ChartBarIcon,
  CogIcon,
  MegaphoneIcon,
  AcademicCapIcon,
  ArrowTrendingUpIcon
} from '@heroicons/vue/24/outline'

export default {
  name: 'ServiceCatalog',
  components: {
    ServiceRequestModal,
    ServiceDetailsModal
  },
  setup() {
    const router = useRouter()
    const { showToast } = useToast()
    
    // Injection des fonctions de devise
    const formatCurrency = inject('formatCurrency')
    const getCurrencySymbol = inject('getCurrencySymbol')
    
    // État réactif
    const services = ref([])
    const loading = ref(true)
    const error = ref(null)
    const selectedCategory = ref('')
    const selectedPriceRange = ref('')
    const showRequestModal = ref(false)
    const showDetailsModal = ref(false)
    const selectedService = ref(null)

    // Services filtrés
    const filteredServices = computed(() => {
      let filtered = services.value

      // Filtrer par catégorie
      if (selectedCategory.value) {
        filtered = filtered.filter(service => service.category === selectedCategory.value)
      }

      // Filtrer par prix
      if (selectedPriceRange.value) {
        const [min, max] = selectedPriceRange.value.split('-').map(p => p.replace('+', ''))
        filtered = filtered.filter(service => {
          const price = service.base_price
          if (selectedPriceRange.value.includes('+')) {
            return price >= parseInt(min)
          }
          return price >= parseInt(min) && price <= parseInt(max)
        })
      }

      return filtered
    })

    // Charger les services
    const loadServices = async () => {
      try {
        loading.value = true
        error.value = null
        
        const response = await authService.getApiInstance().get('/accompagnement/services')
        
        services.value = Array.isArray(response.data.services) ? response.data.services : []
      } catch (err) {
        if (err.response?.status === 401) {
          router.push('/login')
          return
        }
        error.value = err.message
        console.error('Erreur lors du chargement des services:', err)
        showToast('Erreur lors du chargement des services', 'error')
      } finally {
        loading.value = false
      }
    }

    // Demander une prestation
    const requestService = (service) => {
      selectedService.value = service
      showRequestModal.value = true
    }

    // Voir les détails d'un service
    const viewServiceDetails = (service) => {
      selectedService.value = service
      showDetailsModal.value = true
    }

    // Gérer la soumission d'une demande
    const handleServiceRequest = async (requestData) => {
      try {
        const response = await authService.getApiInstance().post('/accompagnement/requests', requestData)
        
        showToast('Demande créée avec succès', 'success')
        showRequestModal.value = false
        
        // Rediriger vers la page d'accompagnement
        router.push('/accompagnement')
      } catch (err) {
        if (err.response?.status === 401) {
          router.push('/login')
          return
        }
        console.error('Erreur lors de la création de la demande:', err)
        showToast(err.message, 'error')
      }
    }

    // Utilitaires
    const getServiceIcon = (iconName) => {
      const icons = {
        search: MagnifyingGlassIcon,
        edit: PencilIcon,
        'chart-bar': ChartBarIcon,
        cog: CogIcon,
        megaphone: MegaphoneIcon,
        'academic-cap': AcademicCapIcon,
        'trending-up': ArrowTrendingUpIcon,
        facebook: MegaphoneIcon // Fallback
      }
      return icons[iconName] || MagnifyingGlassIcon
    }

    const getServiceColorClass = (color) => {
      const colors = {
        blue: 'bg-blue-500',
        green: 'bg-green-500',
        purple: 'bg-purple-500',
        orange: 'bg-orange-500',
        red: 'bg-red-500',
        indigo: 'bg-indigo-500'
      }
      return colors[color] || 'bg-blue-500'
    }

    const getCategoryClass = (category) => {
      const classes = {
        strategy: 'bg-purple-100 text-purple-800',
        creation: 'bg-green-100 text-green-800',
        advertising: 'bg-blue-100 text-blue-800',
        analysis: 'bg-orange-100 text-orange-800',
        technical: 'bg-gray-100 text-gray-800'
      }
      return classes[category] || 'bg-gray-100 text-gray-800'
    }

    const getCategoryLabel = (category) => {
      const labels = {
        strategy: 'Stratégie',
        creation: 'Création',
        advertising: 'Publicité',
        analysis: 'Analyse',
        technical: 'Technique'
      }
      return labels[category] || category
    }

    const formatPrice = (price, priceType) => {
      if (priceType === 'custom') return 'Sur devis'
      if (!price) return `À partir de 0${getCurrencySymbol()}`
      return formatCurrency(price)
    }

    // Lifecycle
    onMounted(() => {
      loadServices()
    })

    return {
      services,
      loading,
      error,
      selectedCategory,
      selectedPriceRange,
      filteredServices,
      showRequestModal,
      showDetailsModal,
      selectedService,
      loadServices,
      requestService,
      viewServiceDetails,
      handleServiceRequest,
      getServiceIcon,
      getServiceColorClass,
      getCategoryClass,
      getCategoryLabel,
      formatPrice
    }
  }
}
</script>