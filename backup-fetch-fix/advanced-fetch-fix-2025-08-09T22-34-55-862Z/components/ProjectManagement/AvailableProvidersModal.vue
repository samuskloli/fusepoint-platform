<template>
  <div class="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50" @click="closeModal">
    <div class="relative top-20 mx-auto p-5 border w-11/12 md:w-3/4 lg:w-2/3 shadow-lg rounded-md bg-white" @click.stop>
      <div class="flex items-center justify-between mb-4">
        <h3 class="text-lg font-medium text-gray-900">Prestataires disponibles</h3>
        <button @click="closeModal" class="text-gray-400 hover:text-gray-600">
          <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
          </svg>
        </button>
      </div>

      <!-- Filtres et recherche -->
      <div class="mb-6">
        <div class="flex flex-col md:flex-row gap-4">
          <div class="flex-1">
            <input
              type="text"
              v-model="searchQuery"
              placeholder="Rechercher un prestataire..."
              class="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            >
          </div>
          <div class="w-full md:w-48">
            <select
              v-model="selectedSpecialty"
              class="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            >
              <option value="">Toutes les spécialités</option>
              <option value="development">Développement</option>
              <option value="design">Design</option>
              <option value="marketing">Marketing</option>
              <option value="content">Contenu</option>
              <option value="seo">SEO</option>
              <option value="consulting">Conseil</option>
            </select>
          </div>
        </div>
      </div>

      <!-- Liste des prestataires -->
      <div class="max-h-96 overflow-y-auto">
        <div v-if="loading" class="text-center py-8">
          <div class="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <p class="mt-2 text-gray-600">Chargement des prestataires...</p>
        </div>

        <div v-else-if="filteredProviders.length === 0" class="text-center py-8">
          <p class="text-gray-500">Aucun prestataire trouvé</p>
        </div>

        <div v-else class="grid gap-4">
          <div
            v-for="provider in filteredProviders"
            :key="provider.id"
            class="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
          >
            <div class="flex items-start justify-between">
              <div class="flex-1">
                <div class="flex items-center mb-2">
                  <div class="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center mr-3">
                    <span class="text-blue-600 font-semibold text-sm">
                      {{ provider.name.charAt(0).toUpperCase() }}
                    </span>
                  </div>
                  <div>
                    <h4 class="text-lg font-medium text-gray-900">{{ provider.name }}</h4>
                    <p class="text-sm text-gray-600">{{ provider.email }}</p>
                  </div>
                </div>
                
                <div class="mb-3">
                  <div class="flex flex-wrap gap-2 mb-2">
                    <span
                      v-for="specialty in provider.specialties"
                      :key="specialty"
                      class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
                    >
                      {{ getSpecialtyLabel(specialty) }}
                    </span>
                  </div>
                  
                  <div class="flex items-center mb-2">
                    <div class="flex items-center">
                      <svg class="w-4 h-4 text-yellow-400 mr-1" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"></path>
                      </svg>
                      <span class="text-sm text-gray-600">{{ provider.rating || 'N/A' }}/5</span>
                    </div>
                    <span class="mx-2 text-gray-300">•</span>
                    <span class="text-sm text-gray-600">{{ provider.projects_completed || 0 }} projets</span>
                  </div>
                  
                  <p class="text-sm text-gray-700 line-clamp-2">{{ provider.description }}</p>
                </div>
                
                <div class="flex items-center justify-between">
                  <div class="text-sm text-gray-600">
                    <span class="font-medium">Tarif:</span> {{ provider.hourly_rate ? $formatCurrency(provider.hourly_rate) + '/h' : 'À négocier' }}
                  </div>
                  <div class="flex items-center space-x-2">
                    <span
                      :class="[
                        'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium',
                        provider.availability === 'available' ? 'bg-green-100 text-green-800' :
                        provider.availability === 'busy' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-red-100 text-red-800'
                      ]"
                    >
                      {{ getAvailabilityLabel(provider.availability) }}
                    </span>
                  </div>
                </div>
              </div>
              
              <div class="ml-4">
                <button
                  @click="inviteProvider(provider)"
                  :disabled="provider.invited || invitingProviders.includes(provider.id)"
                  class="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <span v-if="invitingProviders.includes(provider.id)">Invitation...</span>
                  <span v-else-if="provider.invited">Invité</span>
                  <span v-else>Inviter</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="flex justify-end mt-6">
        <button
          @click="closeModal"
          class="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 border border-gray-300 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
        >
          Fermer
        </button>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, computed, onMounted } from 'vue'
import { projectManagementService } from '@/services/projectManagementService'

export default {
  name: 'AvailableProvidersModal',
  props: {
    clientId: {
      type: [String, Number],
      required: true
    }
  },
  emits: ['close', 'invited'],
  setup(props, { emit }) {
    const loading = ref(false)
    const providers = ref([])
    const searchQuery = ref('')
    const selectedSpecialty = ref('')
    const invitingProviders = ref([])

    const specialtyLabels = {
      development: 'Développement',
      design: 'Design',
      marketing: 'Marketing',
      content: 'Contenu',
      seo: 'SEO',
      consulting: 'Conseil'
    }

    const availabilityLabels = {
      available: 'Disponible',
      busy: 'Occupé',
      unavailable: 'Indisponible'
    }

    const filteredProviders = computed(() => {
      let filtered = providers.value

      if (searchQuery.value) {
        const query = searchQuery.value.toLowerCase()
        filtered = filtered.filter(provider => 
          provider.name.toLowerCase().includes(query) ||
          provider.email.toLowerCase().includes(query) ||
          provider.description.toLowerCase().includes(query)
        )
      }

      if (selectedSpecialty.value) {
        filtered = filtered.filter(provider => 
          provider.specialties.includes(selectedSpecialty.value)
        )
      }

      return filtered
    })

    const getSpecialtyLabel = (specialty) => {
      return specialtyLabels[specialty] || specialty
    }

    const getAvailabilityLabel = (availability) => {
      return availabilityLabels[availability] || availability
    }

    const loadProviders = async () => {
      loading.value = true
      try {
        const response = await projectManagementService.getAvailableProviders()
        if (response.success) {
          providers.value = response.data
        }
      } catch (error) {
        console.error('Erreur lors du chargement des prestataires:', error)
      } finally {
        loading.value = false
      }
    }

    const inviteProvider = async (provider) => {
      invitingProviders.value.push(provider.id)
      try {
        const response = await projectManagementService.inviteProvider(props.clientId, {
          provider_id: provider.id,
          role: 'provider',
          message: `Invitation à rejoindre le projet`
        })
        
        if (response.success) {
          provider.invited = true
          emit('invited', provider)
        } else {
          alert('Erreur lors de l\'invitation du prestataire')
        }
      } catch (error) {
        console.error('Erreur:', error)
        alert('Erreur lors de l\'invitation du prestataire')
      } finally {
        invitingProviders.value = invitingProviders.value.filter(id => id !== provider.id)
      }
    }

    const closeModal = () => {
      emit('close')
    }

    onMounted(() => {
      loadProviders()
    })

    return {
      loading,
      providers,
      searchQuery,
      selectedSpecialty,
      invitingProviders,
      filteredProviders,
      getSpecialtyLabel,
      getAvailabilityLabel,
      inviteProvider,
      closeModal
    }
  }
}
</script>

<style scoped>
.line-clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
</style>