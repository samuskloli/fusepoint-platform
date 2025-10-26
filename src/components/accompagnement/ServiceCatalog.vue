<template>
  <Layout>
    <div class="p-6 space-y-6">
      <!-- Header -->
      <div class="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
        <div>
          <h1 class="text-2xl font-bold text-gray-900">Catalogue des prestations</h1>
          <p class="mt-1 text-gray-600">Choisissez une prestation et envoyez une demande en quelques clics.</p>
        </div>
        
        <!-- Filtres -->
        <div class="flex items-center gap-3">
          <select v-model="selectedCategory" class="px-3 py-2 border rounded-md text-sm">
            <option value="">Toutes les catégories</option>
            <option value="analytics">Analytics</option>
            <option value="marketing">Marketing</option>
            <option value="strategy">Stratégie</option>
            <option value="automation">Automatisation</option>
            <option value="sales">Ventes</option>
            <option value="training">Formation</option>
            <option value="optimization">Optimisation</option>
          </select>
          <select v-model="selectedDuration" class="px-3 py-2 border rounded-md text-sm">
            <option value="">Toutes les durées</option>
            <option value="short">Courte</option>
            <option value="medium">Moyenne</option>
            <option value="long">Longue</option>
          </select>
        </div>
      </div>

      <!-- Grid services -->
      <div v-if="loading" class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        <div v-for="i in 6" :key="i" class="h-56 bg-gray-100 rounded animate-pulse"></div>
      </div>

      <div v-else class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        <div 
          v-for="service in filteredServices" 
          :key="service.id"
          class="bg-white rounded-lg shadow-sm border border-gray-200 hover:shadow transition p-6 flex flex-col justify-between"
        >
          <div>
            <div class="flex items-center gap-3 mb-3">
              <component :is="getIconComponent(service.icon)" class="w-6 h-6" :class="colorTextMap[service.color] || 'text-blue-600'" />
              <h3 class="text-lg font-semibold text-gray-900">{{ service.name }}</h3>
            </div>
            <p class="text-gray-600 mb-4">{{ service.description }}</p>
            <div class="text-sm text-gray-500">Durée: <span class="font-medium">{{ formatDurationLabel(service) }}</span></div>
          </div>

          <div class="mt-4 flex items-center justify-between">
            <span class="text-sm font-medium" :class="colorTextMap[service.color] || 'text-blue-600'">{{ service.category }}</span>
            <button 
              class="px-3 py-2 bg-blue-600 text-white text-sm rounded-md hover:bg-blue-700"
              @click="openServiceDetail(service)"
            >
              En savoir plus
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Modal de détail du service -->
    <ServiceDetailModal 
      v-if="selectedService"
      :service="selectedService"
      @close="selectedService = null"
      @request-service="onRequestFromDetails"
    />

    <!-- Modal de demande de prestation -->
    <ServiceRequestModal 
      v-if="showRequestModal"
      :service="selectedService"
      @close="showRequestModal = false"
      @submit="submitServiceRequest"
    />

    <!-- Modal de confirmation -->
    <RequestConfirmationModal 
      v-if="showConfirmationModal"
      :service="selectedService"
      @close="showConfirmationModal = false"
    />
  </Layout>
</template>

<script>
import { ref, computed, onMounted } from 'vue'
import Layout from '../Layout.vue'
import ServiceDetailModal from './ServiceDetailModal.vue'
import ServiceRequestModal from '@/components/accompagnement/ServiceRequestModal.vue'
import RequestConfirmationModal from '@/components/accompagnement/RequestConfirmationModal.vue'
import { 
  ChartBarIcon, 
  MegaphoneIcon, 
  LightBulbIcon, 
  CogIcon,
  PresentationChartLineIcon,
  UserGroupIcon,
  DocumentTextIcon,
  AcademicCapIcon,
  ArrowTrendingUpIcon
} from '@heroicons/vue/24/outline'
import api from '@/services/api.js'
import { useToast } from '@/composables/useToast'

export default {
  name: 'ServiceCatalog',
  components: {
    Layout,
    ServiceDetailModal,
    ServiceRequestModal,
    RequestConfirmationModal,
    ChartBarIcon,
    MegaphoneIcon,
    LightBulbIcon,
    CogIcon,
    PresentationChartLineIcon,
    UserGroupIcon,
    DocumentTextIcon,
    AcademicCapIcon,
    ArrowTrendingUpIcon
  },
  setup() {
    const { showToast } = useToast()
    const selectedCategory = ref('')
    const selectedDuration = ref('')
    const selectedService = ref(null)
    const services = ref([])
    const loading = ref(true)
    const showRequestModal = ref(false)
    const showConfirmationModal = ref(false)

    const colorLightMap = {
      blue: 'bg-blue-100',
      green: 'bg-green-100',
      yellow: 'bg-yellow-100',
      purple: 'bg-purple-100',
      pink: 'bg-pink-100',
      indigo: 'bg-indigo-100'
    }

    const colorTextMap = {
      blue: 'text-blue-600',
      green: 'text-green-600',
      yellow: 'text-yellow-600',
      purple: 'text-purple-600',
      pink: 'text-pink-600',
      indigo: 'text-indigo-600'
    }

    const iconsMap = {
      chart: ChartBarIcon,
      megaphone: MegaphoneIcon,
      bulb: LightBulbIcon,
      cog: CogIcon,
      presentation: PresentationChartLineIcon,
      users: UserGroupIcon,
      document: DocumentTextIcon,
      academic: AcademicCapIcon,
      trending: ArrowTrendingUpIcon
    }

    const getIconComponent = (icon) => iconsMap[icon] || ChartBarIcon

    const formatDurationLabel = (service) => {
      const hours = service.duration_hours || 0
      if (hours === 0) return 'Non spécifiée'
      if (hours <= 2) return 'Courte'
      const label = `${hours}h`
      if (label.includes('semaine') || label.includes('week')) return 'Moyenne'
      return 'Longue'
    }

    const filteredServices = computed(() => {
      return services.value.filter(service => {
        const categoryMatch = !selectedCategory.value || (service.category || '').toLowerCase() === selectedCategory.value
        const durationLabel = formatDurationLabel(service).toLowerCase()
        const durationMatch = !selectedDuration.value || durationLabel.includes(selectedDuration.value)
        return categoryMatch && durationMatch
      })
    })

    const loadServices = async () => {
      try {
        const response = await api.get('/api/accompagnement/services')
        const servicesData = response.data.data || response.data
        services.value = Array.isArray(servicesData) && servicesData.length > 0 ? servicesData : []
      } catch (error) {
        console.error('Erreur lors du chargement des services:', error)
        showToast(error.userMessage || 'Erreur lors du chargement des services', 'error')
        services.value = []
      } finally {
        loading.value = false
      }
    }

    const openServiceDetail = (service) => {
      selectedService.value = service
    }

    const onRequestFromDetails = (service) => {
      selectedService.value = service
      showRequestModal.value = true
    }

    const submitServiceRequest = async (requestData) => {
      try {
        await api.post('/api/accompagnement/requests', requestData)
        showRequestModal.value = false
        showConfirmationModal.value = true
      } catch (error) {
        console.error('Erreur lors de la demande de service:', error)
        showToast(error.userMessage || 'Erreur lors de la demande de service', 'error')
      }
    }

    onMounted(() => {
      loadServices()
    })

    return {
      selectedCategory,
      selectedDuration,
      selectedService,
      services,
      loading,
      filteredServices,
      openServiceDetail,
      onRequestFromDetails,
      submitServiceRequest,
      showRequestModal,
      showConfirmationModal,
      getIconComponent,
      colorLightMap,
      colorTextMap,
      formatDurationLabel
    }
  }
}
</script>

<style scoped>
/* Le Layout gère le fond; pas besoin d'un wrapper spécifique ici */
</style>