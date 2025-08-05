<template>
  <div class="relative inline-block text-left">
    <!-- Bouton déclencheur -->
    <button
      ref="triggerRef"
      @click="toggleMenu"
      :disabled="isChanging || !hasAvailableActions"
      :class="[
        'inline-flex items-center px-3 py-1.5 border border-gray-300 shadow-sm text-xs font-medium rounded-md transition-colors duration-200',
        isChanging || !hasAvailableActions
          ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
          : 'bg-white text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500'
      ]"
      :title="buttonTitle"
    >
      <!-- Icône de statut actuel -->
      <component
        v-if="currentStatusConfig && iconComponent"
        :is="iconComponent"
        class="w-4 h-4 mr-1.5"
      />
      
      <!-- Indicateur de chargement -->
      <svg
        v-if="isChanging"
        class="w-4 h-4 mr-1.5 animate-spin"
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
      
      <span>{{ buttonText }}</span>
      
      <!-- Flèche du menu -->
      <ChevronDownIcon
        v-if="!isChanging"
        class="w-4 h-4 ml-1.5"
        :class="{ 'transform rotate-180': isOpen }"
      />
    </button>

    <!-- Menu déroulant -->
    <Transition
      enter-active-class="transition ease-out duration-100"
      enter-from-class="transform opacity-0 scale-95"
      enter-to-class="transform opacity-100 scale-100"
      leave-active-class="transition ease-in duration-75"
      leave-from-class="transform opacity-100 scale-100"
      leave-to-class="transform opacity-0 scale-95"
    >
      <div
        v-if="isOpen"
        ref="menuRef"
        :class="[
          'absolute z-50 mt-2 w-56 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 focus:outline-none',
          menuPosition === 'left' ? 'right-0' : 'left-0'
        ]"
      >
        <div class="py-1">
          <!-- En-tête du menu -->
          <div class="px-4 py-2 text-xs font-medium text-gray-500 uppercase tracking-wider border-b border-gray-100">
            Changer le statut
          </div>
          
          <!-- Options de statut -->
          <template v-for="status in availableStatuses" :key="status.key">
            <button
              @click="handleStatusChange(status)"
              :disabled="!canChangeToStatus(status)"
              :class="[
                'group flex items-center w-full px-4 py-2 text-sm transition-colors duration-150',
                canChangeToStatus(status)
                  ? 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'
                  : 'text-gray-400 cursor-not-allowed',
                status.key === currentStatusConfig?.key
                  ? 'bg-gray-50 font-medium'
                  : ''
              ]"
            >
              <!-- Icône du statut -->
              <component
                v-if="getStatusIcon(status)"
                :is="getStatusIcon(status)"
                :class="[
                  'w-4 h-4 mr-3 flex-shrink-0',
                  status.textColor.replace('text-', 'text-')
                ]"
              />
              
              <!-- Point coloré si pas d'icône -->
              <span
                v-else
                :class="[
                  'w-2 h-2 rounded-full mr-3 flex-shrink-0',
                  `bg-${status.color}-500`
                ]"
              ></span>
              
              <div class="flex-1 text-left">
                <div class="font-medium">{{ status.label }}</div>
                <div class="text-xs text-gray-500 mt-0.5">{{ status.description }}</div>
              </div>
              
              <!-- Indicateur de statut actuel -->
              <CheckIcon
                v-if="status.key === currentStatusConfig?.key"
                class="w-4 h-4 text-blue-600 flex-shrink-0"
              />
            </button>
          </template>
          
          <!-- Message si aucune action disponible -->
          <div
            v-if="availableStatuses.length === 0"
            class="px-4 py-3 text-sm text-gray-500 text-center"
          >
            Aucun changement de statut disponible
          </div>
        </div>
      </div>
    </Transition>
  </div>
</template>

<script>
import { ref, computed, onMounted, onUnmounted, defineAsyncComponent } from 'vue'
import { ChevronDownIcon, CheckIcon } from '@heroicons/vue/24/outline'
import { ClientStatusUtils, CLIENT_STATUS } from '@/constants/clientStatus'

// Import dynamique des icônes
const iconComponents = {
  CheckCircleIcon: defineAsyncComponent(() => import('@heroicons/vue/24/outline').then(m => ({ default: m.CheckCircleIcon }))),
  XCircleIcon: defineAsyncComponent(() => import('@heroicons/vue/24/outline').then(m => ({ default: m.XCircleIcon }))),
  ClockIcon: defineAsyncComponent(() => import('@heroicons/vue/24/outline').then(m => ({ default: m.ClockIcon }))),
  ExclamationTriangleIcon: defineAsyncComponent(() => import('@heroicons/vue/24/outline').then(m => ({ default: m.ExclamationTriangleIcon }))),
  ArchiveBoxIcon: defineAsyncComponent(() => import('@heroicons/vue/24/outline').then(m => ({ default: m.ArchiveBoxIcon })))
}

export default {
  name: 'ClientStatusMenu',
  components: {
    ChevronDownIcon,
    CheckIcon
  },
  props: {
    /**
     * Objet client
     */
    client: {
      type: Object,
      required: true
    },
    
    /**
     * Indique si un changement est en cours
     */
    isChanging: {
      type: Boolean,
      default: false
    },
    
    /**
     * Position du menu (left ou right)
     */
    menuPosition: {
      type: String,
      default: 'left',
      validator: (value) => ['left', 'right'].includes(value)
    },
    
    /**
     * Statuts à exclure du menu
     */
    excludeStatuses: {
      type: Array,
      default: () => []
    }
  },
  
  emits: ['status-change', 'menu-open', 'menu-close'],
  
  setup(props, { emit }) {
    const isOpen = ref(false)
    const triggerRef = ref(null)
    const menuRef = ref(null)
    
    // Configuration du statut actuel
    const currentStatusConfig = computed(() => {
      return ClientStatusUtils.getClientStatus(props.client)
    })
    
    // Icône du statut actuel
    const iconComponent = computed(() => {
      const config = currentStatusConfig.value
      if (!config) return null
      return iconComponents[config.icon] || null
    })
    
    // Texte du bouton
    const buttonText = computed(() => {
      if (props.isChanging) return 'Changement...'
      return currentStatusConfig.value?.label || 'Statut'
    })
    
    // Titre du bouton
    const buttonTitle = computed(() => {
      if (props.isChanging) return 'Changement de statut en cours'
      if (!hasAvailableActions.value) return 'Aucune action disponible'
      return 'Changer le statut du client'
    })
    
    // Statuts disponibles pour le changement
    const availableStatuses = computed(() => {
      const allStatuses = ClientStatusUtils.getAllStatuses()
      const current = currentStatusConfig.value
      
      return allStatuses.filter(status => {
        // Exclure le statut actuel
        if (status.key === current?.key) return false
        
        // Exclure les statuts dans la liste d'exclusion
        if (props.excludeStatuses.includes(status.key)) return false
        
        // Vérifier les transitions autorisées
        if (current) {
          const validation = ClientStatusUtils.validateStatusChange(current, status)
          return validation.valid
        }
        
        return true
      })
    })
    
    // Vérifier s'il y a des actions disponibles
    const hasAvailableActions = computed(() => {
      return availableStatuses.value.length > 0
    })
    
    // Obtenir l'icône d'un statut
    const getStatusIcon = (status) => {
      return iconComponents[status.icon] || null
    }
    
    // Vérifier si on peut changer vers un statut
    const canChangeToStatus = (status) => {
      const current = currentStatusConfig.value
      if (!current) return true
      
      const validation = ClientStatusUtils.validateStatusChange(current, status)
      return validation.valid
    }
    
    // Basculer l'ouverture du menu
    const toggleMenu = () => {
      if (props.isChanging || !hasAvailableActions.value) return
      
      isOpen.value = !isOpen.value
      
      if (isOpen.value) {
        emit('menu-open')
      } else {
        emit('menu-close')
      }
    }
    
    // Fermer le menu
    const closeMenu = () => {
      if (isOpen.value) {
        isOpen.value = false
        emit('menu-close')
      }
    }
    
    // Gérer le changement de statut
    const handleStatusChange = (newStatus) => {
      if (!canChangeToStatus(newStatus)) return
      
      closeMenu()
      
      emit('status-change', {
        client: props.client,
        currentStatus: currentStatusConfig.value,
        newStatus: newStatus
      })
    }
    
    // Fermer le menu en cliquant à l'extérieur
    const handleClickOutside = (event) => {
      if (!isOpen.value) return
      
      const trigger = triggerRef.value
      const menu = menuRef.value
      
      if (trigger && menu) {
        if (!trigger.contains(event.target) && !menu.contains(event.target)) {
          closeMenu()
        }
      }
    }
    
    // Fermer le menu avec Escape
    const handleKeyDown = (event) => {
      if (event.key === 'Escape' && isOpen.value) {
        closeMenu()
      }
    }
    
    // Lifecycle
    onMounted(() => {
      document.addEventListener('click', handleClickOutside)
      document.addEventListener('keydown', handleKeyDown)
    })
    
    onUnmounted(() => {
      document.removeEventListener('click', handleClickOutside)
      document.removeEventListener('keydown', handleKeyDown)
    })
    
    return {
      isOpen,
      triggerRef,
      menuRef,
      currentStatusConfig,
      iconComponent,
      buttonText,
      buttonTitle,
      availableStatuses,
      hasAvailableActions,
      getStatusIcon,
      canChangeToStatus,
      toggleMenu,
      closeMenu,
      handleStatusChange
    }
  }
}
</script>

<style scoped>
/* Styles pour les transitions */
.transition {
  transition-property: all;
  transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
}

/* Styles pour le menu déroulant */
.menu-enter-active,
.menu-leave-active {
  transition: all 0.2s ease;
}

.menu-enter-from,
.menu-leave-to {
  opacity: 0;
  transform: translateY(-10px) scale(0.95);
}
</style>