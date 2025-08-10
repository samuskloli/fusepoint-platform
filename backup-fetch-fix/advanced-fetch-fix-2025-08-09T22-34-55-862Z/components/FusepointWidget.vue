<template>
  <div class="bg-gradient-to-br from-blue-50 to-purple-50 border border-blue-200 rounded-lg p-4 mb-6">
    <div class="flex items-start space-x-3">
      <!-- Icône Fusepoint -->
      <div class="flex-shrink-0">
        <div class="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
          <span class="text-white font-bold text-sm">F</span>
        </div>
      </div>

      <!-- Contenu du conseil -->
      <div class="flex-1 min-w-0">
        <div class="flex items-center justify-between mb-2">
          <h3 class="text-sm font-semibold text-gray-900 flex items-center">
            <LightBulbIcon class="w-4 h-4 text-yellow-500 mr-1" />
            Notre conseil Fusepoint
          </h3>
          <button 
            @click="dismiss" 
            class="text-gray-400 hover:text-gray-600 transition-colors"
            title="Masquer ce conseil"
          >
            <XMarkIcon class="w-4 h-4" />
          </button>
        </div>

        <!-- Message du conseil -->
        <div v-if="!loading" class="space-y-2">
          <p class="text-sm text-gray-700">{{ recommendation.message }}</p>
          
          <!-- Métriques associées -->
          <div v-if="recommendation.metrics" class="flex items-center space-x-4 text-xs text-gray-600">
            <span v-for="metric in recommendation.metrics" :key="metric.name" class="flex items-center">
              <component :is="getMetricIcon(metric.type)" class="w-3 h-3 mr-1" />
              {{ metric.name }}: {{ metric.value }}
            </span>
          </div>

          <!-- Actions suggérées -->
          <div v-if="recommendation.actions && recommendation.actions.length > 0" class="flex flex-wrap gap-2 mt-3">
            <button 
              v-for="action in recommendation.actions" 
              :key="action.id"
              @click="executeAction(action)"
              class="inline-flex items-center px-3 py-1 text-xs font-medium rounded-full transition-colors"
              :class="getActionButtonClass(action.type)"
            >
              <component :is="getActionIcon(action.type)" class="w-3 h-3 mr-1" />
              {{ action.label }}
            </button>
          </div>
        </div>

        <!-- État de chargement -->
        <div v-else class="flex items-center space-x-2">
          <div class="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
          <span class="text-sm text-gray-600">Analyse en cours...</span>
        </div>
      </div>
    </div>

    <!-- Barre de progression pour les recommandations temporelles -->
    <div v-if="recommendation.priority && !dismissed" class="mt-3">
      <div class="flex items-center justify-between text-xs text-gray-600 mb-1">
        <span>Priorité: {{ getPriorityLabel(recommendation.priority) }}</span>
        <span v-if="recommendation.deadline">Échéance: {{ formatDeadline(recommendation.deadline) }}</span>
      </div>
      <div class="w-full bg-gray-200 rounded-full h-1">
        <div 
          class="h-1 rounded-full transition-all duration-300"
          :class="getPriorityBarClass(recommendation.priority)"
          :style="{ width: getPriorityWidth(recommendation.priority) }"
        ></div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, onMounted, computed } from 'vue'
import { 
  LightBulbIcon, 
  XMarkIcon,
  ChartBarIcon,
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon,
  ExclamationTriangleIcon,
  PlayIcon,
  PlusIcon,
  CogIcon
} from '@heroicons/vue/24/outline'
import axios from 'axios'

export default {
  name: 'FusepointWidget',
  components: {
    LightBulbIcon,
    XMarkIcon,
    ChartBarIcon,
    ArrowTrendingUpIcon,
    ArrowTrendingDownIcon,
    ExclamationTriangleIcon,
    PlayIcon,
    PlusIcon,
    CogIcon
  },
  props: {
    context: {
      type: String,
      required: true,
      validator: value => ['analytics', 'marketing', 'dashboard', 'reports'].includes(value)
    },
    data: {
      type: Object,
      default: () => ({})
    }
  },
  emits: ['action-executed', 'widget-dismissed'],
  setup(props, { emit }) {
    const loading = ref(true)
    const dismissed = ref(false)
    const recommendation = ref({})

    const loadRecommendation = async () => {
      try {
        loading.value = true
        const response = await axios.post('/api/accompagnement/recommendations/generate', {
          context: props.context,
          data: props.data
        })
        recommendation.value = response.data
      } catch (error) {
        console.error('Erreur chargement recommandation:', error)
        // Recommandation par défaut en cas d'erreur
        recommendation.value = {
          message: "Nous analysons vos données pour vous proposer des conseils personnalisés.",
          priority: 'low',
          actions: []
        }
      } finally {
        loading.value = false
      }
    }

    const dismiss = () => {
      dismissed.value = true
      emit('widget-dismissed', recommendation.value.id)
      
      // Sauvegarder le statut de masquage
      if (recommendation.value.id) {
        localStorage.setItem(`fusepoint-widget-dismissed-${recommendation.value.id}`, 'true')
      }
    }

    const executeAction = async (action) => {
      try {
        // Exécuter l'action côté serveur
        await axios.post('/api/accompagnement/recommendations/action', {
          recommendationId: recommendation.value.id,
          actionId: action.id
        })

        // Émettre l'événement pour le composant parent
        emit('action-executed', { recommendation: recommendation.value, action })

        // Actions spécifiques selon le type
        switch (action.type) {
          case 'navigate':
            if (action.route) {
              this.$router.push(action.route)
            }
            break
          case 'create':
            // Ouvrir un modal de création
            break
          case 'optimize':
            // Lancer une optimisation
            break
        }
      } catch (error) {
        console.error('Erreur exécution action:', error)
      }
    }

    const getMetricIcon = (type) => {
      switch (type) {
        case 'increase': return ArrowTrendingUpIcon
        case 'decrease': return ArrowTrendingDownIcon
        case 'warning': return ExclamationTriangleIcon
        default: return ChartBarIcon
      }
    }

    const getActionIcon = (type) => {
      switch (type) {
        case 'create': return PlusIcon
        case 'optimize': return CogIcon
        case 'navigate': return PlayIcon
        default: return PlayIcon
      }
    }

    const getActionButtonClass = (type) => {
      switch (type) {
        case 'create':
          return 'bg-green-100 text-green-700 hover:bg-green-200'
        case 'optimize':
          return 'bg-blue-100 text-blue-700 hover:bg-blue-200'
        case 'navigate':
          return 'bg-purple-100 text-purple-700 hover:bg-purple-200'
        default:
          return 'bg-gray-100 text-gray-700 hover:bg-gray-200'
      }
    }

    const getPriorityLabel = (priority) => {
      switch (priority) {
        case 'high': return 'Élevée'
        case 'medium': return 'Moyenne'
        case 'low': return 'Faible'
        default: return 'Non définie'
      }
    }

    const getPriorityBarClass = (priority) => {
      switch (priority) {
        case 'high': return 'bg-red-500'
        case 'medium': return 'bg-yellow-500'
        case 'low': return 'bg-green-500'
        default: return 'bg-gray-500'
      }
    }

    const getPriorityWidth = (priority) => {
      switch (priority) {
        case 'high': return '90%'
        case 'medium': return '60%'
        case 'low': return '30%'
        default: return '0%'
      }
    }

    const formatDeadline = (deadline) => {
      const date = new Date(deadline)
      const now = new Date()
      const diffDays = Math.ceil((date - now) / (1000 * 60 * 60 * 24))
      
      if (diffDays < 0) return 'Échue'
      if (diffDays === 0) return 'Aujourd\'hui'
      if (diffDays === 1) return 'Demain'
      if (diffDays < 7) return `Dans ${diffDays} jours`
      return date.toLocaleDateString('fr-FR')
    }

    // Vérifier si le widget a été masqué
    const checkDismissed = () => {
      if (recommendation.value.id) {
        const isDismissed = localStorage.getItem(`fusepoint-widget-dismissed-${recommendation.value.id}`)
        dismissed.value = isDismissed === 'true'
      }
    }

    onMounted(() => {
      loadRecommendation().then(() => {
        checkDismissed()
      })
    })

    return {
      loading,
      dismissed,
      recommendation,
      dismiss,
      executeAction,
      getMetricIcon,
      getActionIcon,
      getActionButtonClass,
      getPriorityLabel,
      getPriorityBarClass,
      getPriorityWidth,
      formatDeadline
    }
  }
}
</script>

<style scoped>
/* Animation d'apparition */
@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.bg-gradient-to-br {
  animation: fadeInUp 0.3s ease-out;
}

/* Effet de survol pour les boutons d'action */
.transition-colors {
  transition: background-color 0.2s ease, color 0.2s ease;
}
</style>