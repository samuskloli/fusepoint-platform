<template>
  <div class="min-h-screen bg-gray-50">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <!-- En-tête -->
      <div class="mb-8">
        <nav class="flex" aria-label="Breadcrumb">
          <ol class="flex items-center space-x-4">
            <li>
              <router-link to="/dashboard" class="text-gray-400 hover:text-gray-500">
                <svg class="flex-shrink-0 h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z" />
                </svg>
                <span class="sr-only">Dashboard</span>
              </router-link>
            </li>
            <li>
              <div class="flex items-center">
                <svg class="flex-shrink-0 h-5 w-5 text-gray-300" fill="currentColor" viewBox="0 0 20 20">
                  <path fill-rule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clip-rule="evenodd" />
                </svg>
                <span class="ml-4 text-sm font-medium text-gray-500">Suivi d'action</span>
              </div>
            </li>
          </ol>
        </nav>
        
        <div class="mt-4">
          <h1 class="text-3xl font-bold text-gray-900">{{ action.title }}</h1>
          <div class="mt-2 flex items-center space-x-4">
            <span 
              class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium"
              :class="getStatusBadge(action.status)"
            >
              {{ action.status }}
            </span>
            <span class="text-gray-500">Dernière mise à jour: {{ formatDate(action.lastUpdate) }}</span>
          </div>
        </div>
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <!-- Contenu principal -->
        <div class="lg:col-span-2 space-y-8">
          <!-- Timeline -->
          <div class="bg-white shadow-sm rounded-lg border border-gray-200">
            <div class="px-6 py-4 border-b border-gray-200">
              <h2 class="text-lg font-semibold text-gray-900">Timeline du projet</h2>
            </div>
            <div class="p-6">
              <div class="flow-root">
                <ul class="-mb-8">
                  <li v-for="(event, index) in action.timeline" :key="index">
                    <div class="relative pb-8" :class="{ 'pb-0': index === action.timeline.length - 1 }">
                      <span 
                        v-if="index !== action.timeline.length - 1"
                        class="absolute top-4 left-4 -ml-px h-full w-0.5 bg-gray-200"
                      ></span>
                      <div class="relative flex space-x-3">
                        <div>
                          <span 
                            class="h-8 w-8 rounded-full flex items-center justify-center ring-8 ring-white"
                            :class="getEventColor(event.type)"
                          >
                            <svg class="h-4 w-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                              <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd" />
                            </svg>
                          </span>
                        </div>
                        <div class="min-w-0 flex-1 pt-1.5">
                          <div>
                            <p class="text-sm font-medium text-gray-900">{{ event.title }}</p>
                            <p class="text-sm text-gray-500">{{ event.description }}</p>
                          </div>
                          <div class="mt-2 text-sm text-gray-500">
                            <time>{{ formatDate(event.date) }}</time>
                          </div>
                        </div>
                      </div>
                    </div>
                  </li>
                </ul>
              </div>
            </div>
          </div>

          <!-- Livrables -->
          <div class="bg-white shadow-sm rounded-lg border border-gray-200">
            <div class="px-6 py-4 border-b border-gray-200">
              <h2 class="text-lg font-semibold text-gray-900">Livrables</h2>
            </div>
            <div class="p-6">
              <div class="grid gap-4">
                <div 
                  v-for="deliverable in action.deliverables" 
                  :key="deliverable.id"
                  class="border border-gray-200 rounded-lg p-4"
                >
                  <div class="flex items-center justify-between">
                    <div>
                      <h3 class="font-medium text-gray-900">{{ deliverable.name }}</h3>
                      <p class="text-sm text-gray-600">{{ deliverable.description }}</p>
                    </div>
                    <div class="flex items-center space-x-2">
                      <span 
                        class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium"
                        :class="getDeliverableStatus(deliverable.status)"
                      >
                        {{ deliverable.status }}
                      </span>
                      <button 
                        v-if="deliverable.file"
                        class="text-blue-600 hover:text-blue-800 text-sm font-medium"
                      >
                        Télécharger
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Sidebar -->
        <div class="space-y-8">
          <!-- Informations du projet -->
          <div class="bg-white shadow-sm rounded-lg border border-gray-200">
            <div class="px-6 py-4 border-b border-gray-200">
              <h2 class="text-lg font-semibold text-gray-900">Informations</h2>
            </div>
            <div class="p-6 space-y-4">
              <div>
                <dt class="text-sm font-medium text-gray-500">Agent responsable</dt>
                <dd class="mt-1 text-sm text-gray-900">Sophie Martin</dd>
              </div>
              <div>
                <dt class="text-sm font-medium text-gray-500">Date de début</dt>
                <dd class="mt-1 text-sm text-gray-900">{{ formatDate(action.startDate) }}</dd>
              </div>
              <div>
                <dt class="text-sm font-medium text-gray-500">Date de fin prévue</dt>
                <dd class="mt-1 text-sm text-gray-900">{{ formatDate(action.endDate) }}</dd>
              </div>
              <div>
                <dt class="text-sm font-medium text-gray-500">Progression</dt>
                <dd class="mt-1">
                  <div class="bg-gray-200 rounded-full h-2">
                    <div 
                      class="bg-blue-600 h-2 rounded-full transition-all duration-300"
                      :style="{ width: action.progress + '%' }"
                    ></div>
                  </div>
                  <span class="text-sm text-gray-600 mt-1">{{ action.progress }}%</span>
                </dd>
              </div>
            </div>
          </div>

          <!-- Actions rapides -->
          <div class="bg-white shadow-sm rounded-lg border border-gray-200">
            <div class="px-6 py-4 border-b border-gray-200">
              <h2 class="text-lg font-semibold text-gray-900">Actions</h2>
            </div>
            <div class="p-6 space-y-3">
              <button class="w-full bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors duration-200">
                Contacter l'agent
              </button>
              <button class="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-lg font-medium transition-colors duration-200">
                Demander une modification
              </button>
              <button class="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-lg font-medium transition-colors duration-200">
                Télécharger le rapport
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'ActionDetails',
  data() {
    return {
      action: {
        id: 1,
        title: 'Campagne Facebook Automne 2024',
        status: 'En cours',
        lastUpdate: new Date('2024-01-15'),
        startDate: new Date('2024-01-01'),
        endDate: new Date('2024-01-30'),
        progress: 65,
        timeline: [
          {
            type: 'start',
            title: 'Projet initié',
            description: 'Briefing client et définition des objectifs',
            date: new Date('2024-01-01')
          },
          {
            type: 'progress',
            title: 'Stratégie validée',
            description: 'Plan de campagne approuvé par le client',
            date: new Date('2024-01-05')
          },
          {
            type: 'progress',
            title: 'Création en cours',
            description: 'Développement des visuels et contenus',
            date: new Date('2024-01-10')
          },
          {
            type: 'current',
            title: 'Révisions',
            description: 'Ajustements basés sur les retours client',
            date: new Date('2024-01-15')
          }
        ],
        deliverables: [
          {
            id: 1,
            name: 'Brief créatif',
            description: 'Document de stratégie créative',
            status: 'Livré',
            file: true
          },
          {
            id: 2,
            name: 'Visuels campagne',
            description: '5 visuels pour Facebook Ads',
            status: 'En cours',
            file: false
          },
          {
            id: 3,
            name: 'Rapport de performance',
            description: 'Analyse des résultats de campagne',
            status: 'À venir',
            file: false
          }
        ]
      }
    }
  },
  methods: {
    formatDate(date) {
      return new Intl.DateTimeFormat('fr-FR', {
        day: 'numeric',
        month: 'long',
        year: 'numeric'
      }).format(date);
    },
    
    getStatusBadge(status) {
      const badges = {
        'En cours': 'bg-blue-100 text-blue-800',
        'En validation': 'bg-orange-100 text-orange-800',
        'En pause': 'bg-gray-100 text-gray-800',
        'Terminée': 'bg-green-100 text-green-800'
      };
      return badges[status] || 'bg-gray-100 text-gray-800';
    },
    
    getEventColor(type) {
      const colors = {
        'start': 'bg-green-500',
        'progress': 'bg-blue-500',
        'current': 'bg-orange-500',
        'completed': 'bg-green-500'
      };
      return colors[type] || 'bg-gray-500';
    },
    
    getDeliverableStatus(status) {
      const badges = {
        'Livré': 'bg-green-100 text-green-800',
        'En cours': 'bg-blue-100 text-blue-800',
        'À venir': 'bg-gray-100 text-gray-800'
      };
      return badges[status] || 'bg-gray-100 text-gray-800';
    }
  },
  
  mounted() {
    // Ici on pourrait charger les données de l'action basées sur l'ID de la route
    const actionId = this.$route.params.id;
    console.log('Loading action details for ID:', actionId);
  }
}
</script>