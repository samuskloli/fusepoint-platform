<template>
  <span
    :class="[
      'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium transition-colors duration-200',
      statusClasses.bg,
      statusClasses.text,
      statusClasses.border,
      'border',
      { 'cursor-pointer hover:opacity-80': clickable }
    ]"
    :title="statusConfig?.description || statusText"
    @click="handleClick"
  >
    <!-- Icône du statut -->
    <component
      v-if="showIcon && iconComponent"
      :is="iconComponent"
      class="w-3 h-3 mr-1.5 flex-shrink-0"
    />
    
    <!-- Indicateur de statut (point coloré) -->
    <span
      v-else-if="showDot"
      :class="[
        'w-2 h-2 rounded-full mr-1.5 flex-shrink-0',
        `bg-${statusConfig?.color}-500` || 'bg-gray-500'
      ]"
    ></span>
    
    <!-- Texte du statut -->
    <span class="truncate">{{ statusText }}</span>
    
    <!-- Indicateur de changement en cours -->
    <svg
      v-if="isChanging"
      class="w-3 h-3 ml-1.5 animate-spin flex-shrink-0"
      fill="none"
      viewBox="0 0 24 24"
    >
      <circle
        class="opacity-25"
        cx="12"
        cy="12"
        r="10"
        stroke="currentColor"
        stroke-width="4"
      ></circle>
      <path
        class="opacity-75"
        fill="currentColor"
        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
      ></path>
    </svg>
  </span>
</template>

<script>
import { computed, defineAsyncComponent } from 'vue'
import { ClientStatusUtils } from '@/constants/clientStatus'

// Import dynamique des icônes Heroicons
const iconComponents = {
  CheckCircleIcon: defineAsyncComponent(() => import('@heroicons/vue/24/outline').then(m => ({ default: m.CheckCircleIcon }))),
  XCircleIcon: defineAsyncComponent(() => import('@heroicons/vue/24/outline').then(m => ({ default: m.XCircleIcon }))),
  ClockIcon: defineAsyncComponent(() => import('@heroicons/vue/24/outline').then(m => ({ default: m.ClockIcon }))),
  ExclamationTriangleIcon: defineAsyncComponent(() => import('@heroicons/vue/24/outline').then(m => ({ default: m.ExclamationTriangleIcon }))),
  ArchiveBoxIcon: defineAsyncComponent(() => import('@heroicons/vue/24/outline').then(m => ({ default: m.ArchiveBoxIcon })))
}

export default {
  name: 'ClientStatusBadge',
  props: {
    /**
     * Objet client contenant les informations de statut
     */
    client: {
      type: Object,
      required: true
    },
    
    /**
     * Afficher l'icône du statut
     */
    showIcon: {
      type: Boolean,
      default: true
    },
    
    /**
     * Afficher un point coloré au lieu de l'icône
     */
    showDot: {
      type: Boolean,
      default: false
    },
    
    /**
     * Rendre le badge cliquable
     */
    clickable: {
      type: Boolean,
      default: false
    },
    
    /**
     * Indique si un changement de statut est en cours
     */
    isChanging: {
      type: Boolean,
      default: false
    },
    
    /**
     * Taille du badge
     */
    size: {
      type: String,
      default: 'sm',
      validator: (value) => ['xs', 'sm', 'md', 'lg'].includes(value)
    },
    
    /**
     * Variante du style
     */
    variant: {
      type: String,
      default: 'default',
      validator: (value) => ['default', 'solid', 'outline'].includes(value)
    }
  },
  
  emits: ['click', 'status-change'],
  
  setup(props, { emit }) {
    // Configuration du statut basée sur le client
    const statusConfig = computed(() => {
      return ClientStatusUtils.getClientStatus(props.client)
    })
    
    // Texte à afficher pour le statut
    const statusText = computed(() => {
      return statusConfig.value?.label || 'Inconnu'
    })
    
    // Classes CSS pour le badge
    const statusClasses = computed(() => {
      const config = statusConfig.value
      if (!config) {
        return {
          bg: 'bg-gray-100',
          text: 'text-gray-800',
          border: 'border-gray-200'
        }
      }
      
      // Adapter les classes selon la variante
      switch (props.variant) {
        case 'solid':
          return {
            bg: `bg-${config.color}-500`,
            text: 'text-white',
            border: `border-${config.color}-500`
          }
        case 'outline':
          return {
            bg: 'bg-transparent',
            text: config.textColor,
            border: config.borderColor
          }
        default:
          return {
            bg: config.bgColor,
            text: config.textColor,
            border: config.borderColor
          }
      }
    })
    
    // Composant d'icône à utiliser
    const iconComponent = computed(() => {
      const config = statusConfig.value
      if (!config || !props.showIcon) return null
      
      return iconComponents[config.icon] || null
    })
    
    // Gestionnaire de clic
    const handleClick = () => {
      if (props.clickable) {
        emit('click', {
          client: props.client,
          currentStatus: statusConfig.value
        })
      }
    }
    
    return {
      statusConfig,
      statusText,
      statusClasses,
      iconComponent,
      handleClick
    }
  }
}
</script>

<style scoped>
/* Styles pour les différentes tailles */
.badge-xs {
  @apply px-1.5 py-0.5 text-xs;
}

.badge-sm {
  @apply px-2.5 py-0.5 text-xs;
}

.badge-md {
  @apply px-3 py-1 text-sm;
}

.badge-lg {
  @apply px-4 py-1.5 text-base;
}

/* Animation pour les changements de statut */
.status-changing {
  @apply animate-pulse;
}

/* Effet hover pour les badges cliquables */
.cursor-pointer:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
}
</style>