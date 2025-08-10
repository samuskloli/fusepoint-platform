<template>
  <div class="service-catalog">
    <FusepointHeader />
    
    <div class="container mx-auto px-6 py-8">
      <div class="mb-8">
        <h1 class="text-3xl font-bold text-gray-900 mb-4">Catalogue de Services Fusepoint</h1>
        <p class="text-gray-600">Découvrez nos services d'accompagnement personnalisés pour optimiser votre stratégie marketing digital.</p>
      </div>

      <!-- Filtres -->
      <div class="mb-8 flex flex-wrap gap-4">
        <select v-model="selectedCategory" class="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500">
          <option value="">Toutes les catégories</option>
          <option value="analytics">Analytics</option>
          <option value="marketing">Marketing</option>
          <option value="strategy">Stratégie</option>
          <option value="technical">Technique</option>
        </select>
        
        <select v-model="selectedDuration" class="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500">
          <option value="">Toutes les durées</option>
          <option value="1h">1 heure</option>
          <option value="2h">2 heures</option>
          <option value="half-day">Demi-journée</option>
          <option value="full-day">Journée complète</option>
        </select>
      </div>

      <!-- Grille des services -->
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div 
          v-for="service in filteredServices" 
          :key="service.id"
          class="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300 p-6 border border-gray-200"
        >
          <div class="flex items-center mb-4">
            <div class="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mr-4">
              <component :is="service.icon" class="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <h3 class="text-lg font-semibold text-gray-900">{{ service.name }}</h3>
              <span class="text-sm text-gray-500">{{ service.category }}</span>
            </div>
          </div>
          
          <p class="text-gray-600 mb-4">{{ service.description }}</p>
          
          <div class="flex items-center justify-between mb-4">
            <span class="text-sm text-gray-500">Durée: {{ service.duration }}</span>
            <span class="text-lg font-bold text-blue-600">{{ service.price }}</span>
          </div>
          
          <div class="flex flex-wrap gap-2 mb-4">
            <span 
              v-for="tag in service.tags" 
              :key="tag"
              class="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-full"
            >
              {{ tag }}
            </span>
          </div>
          
          <button 
            @click="openServiceDetail(service)"
            class="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors duration-200"
          >
            En savoir plus
          </button>
        </div>
      </div>
    </div>

    <!-- Modal de détail du service -->
    <ServiceDetailModal 
      v-if="selectedService"
      :service="selectedService"
      @close="selectedService = null"
      @request="handleServiceRequest"
    />
  </div>
</template>

<script>
import { ref, computed, onMounted, inject } from 'vue'
import FusepointHeader from '../FusepointHeader.vue'
import ServiceDetailModal from './ServiceDetailModal.vue'
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
import axios from 'axios'

export default {
  name: 'ServiceCatalog',
  components: {
    FusepointHeader,
    ServiceDetailModal,
    ChartBarIcon,
    MegaphoneIcon,
    LightBulbIcon,
    CogIcon,
    PresentationChartLineIcon,
    UserGroupIcon,
    DocumentTextIcon,
    AcademicCapIcon
  },
  setup() {
    // Injection des fonctions de devise
    const formatCurrency = inject('formatCurrency')

    const selectedCategory = ref('')
    const selectedDuration = ref('')
    const selectedService = ref(null)
    const services = ref([])
    const loading = ref(true)

    const defaultServices = [
      {
        id: 1,
        name: 'Audit Analytics Complet',
        category: 'Analytics',
        description: 'Analyse approfondie de vos données Google Analytics avec recommandations personnalisées.',
        duration: '2 heures',
        price: formatCurrency(150),
        tags: ['Google Analytics', 'Audit', 'Recommandations'],
        icon: 'ChartBarIcon',
        details: 'Audit complet de votre configuration Google Analytics, analyse des performances et recommandations d\'optimisation.'
      },
      {
        id: 2,
        name: 'Stratégie Marketing Digital',
        category: 'Marketing',
        description: 'Élaboration d\'une stratégie marketing digital sur mesure pour votre entreprise.',
        duration: 'Demi-journée',
        price: formatCurrency(300),
        tags: ['Stratégie', 'Marketing', 'Digital'],
        icon: 'MegaphoneIcon',
        details: 'Développement d\'une stratégie marketing digital complète adaptée à vos objectifs business.'
      },
      {
        id: 3,
        name: 'Optimisation SEO',
        category: 'Marketing',
        description: 'Amélioration du référencement naturel de votre site web.',
        duration: '2 heures',
        price: formatCurrency(200),
        tags: ['SEO', 'Référencement', 'Optimisation'],
        icon: 'LightBulbIcon',
        details: 'Audit SEO complet et mise en place d\'optimisations pour améliorer votre visibilité.'
      },
      {
        id: 4,
        name: 'Configuration Technique',
        category: 'Technique',
        description: 'Configuration et optimisation de vos outils marketing.',
        duration: '1 heure',
        price: formatCurrency(100),
        tags: ['Configuration', 'Technique', 'Outils'],
        icon: 'CogIcon',
        details: 'Configuration professionnelle de vos outils marketing et analytics.'
      },
      {
        id: 5,
        name: 'Formation Analytics',
        category: 'Formation',
        description: 'Formation personnalisée sur l\'utilisation de Google Analytics.',
        duration: 'Demi-journée',
        price: formatCurrency(250),
        tags: ['Formation', 'Analytics', 'Google'],
        icon: 'AcademicCapIcon',
        details: 'Formation complète pour maîtriser Google Analytics et interpréter vos données.'
      },
      {
        id: 6,
        name: 'Rapport Personnalisé',
        category: 'Analytics',
        description: 'Création de rapports analytics personnalisés pour votre activité.',
        duration: '1 heure',
        price: formatCurrency(120),
        tags: ['Rapport', 'Personnalisé', 'Analytics'],
        icon: 'DocumentTextIcon',
        details: 'Création de rapports sur mesure pour suivre vos KPIs les plus importants.'
      }
    ]

    const filteredServices = computed(() => {
      return services.value.filter(service => {
        const categoryMatch = !selectedCategory.value || service.category.toLowerCase() === selectedCategory.value
        const durationMatch = !selectedDuration.value || service.duration.toLowerCase().includes(selectedDuration.value)
        return categoryMatch && durationMatch
      })
    })

    const loadServices = async () => {
      try {
        const response = await axios.get('/api/accompagnement/services')
        const servicesData = response.data.data || response.data
        services.value = Array.isArray(servicesData) && servicesData.length > 0 ? servicesData : defaultServices
      } catch (error) {
        console.error('Erreur lors du chargement des services:', error)
        services.value = defaultServices
      } finally {
        loading.value = false
      }
    }

    const openServiceDetail = (service) => {
      selectedService.value = service
    }

    const handleServiceRequest = async (serviceId, requestData) => {
      try {
        await axios.post('/api/accompagnement/requests', {
          serviceId,
          ...requestData
        })
        selectedService.value = null
        // Afficher une notification de succès
      } catch (error) {
        console.error('Erreur lors de la demande de service:', error)
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
      handleServiceRequest
    }
  }
}
</script>

<style scoped>
.service-catalog {
  min-height: 100vh;
  background-color: #f9fafb;
}
</style>