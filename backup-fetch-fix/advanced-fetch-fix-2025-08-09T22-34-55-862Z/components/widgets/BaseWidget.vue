<template>
  <div  class="widget-container=widgetClasses widget-header='showHeader=widget-title-section="widget.icon="widget-icon=widget.icon='widget-title="widget-actions=showActions="$emit('configure='widget-action-btn=t('widgets.configure="fas fa-cog="$emit('toggle=widget-action-btn='widget.isEnabled ? t('widgets.disable="canToggle=widget.isEnabled ? 'fas fa-eye-slash="$emit('remove='widget-action-btn widget-action-danger=t('common.delete="fas fa-times="widget-content={ 'widget-disabled='widget.isEnabled="widget-disabled-overlay=widget-disabled-message="fas fa-eye-slash text-gray-400 text-2xl mb-2'></i>
          <p class="text-gray-500>{{ t('widgets.disabled === loading=widget-loading='loading-spinner === loading-text=error === widget-error='fas fa-exclamation-triangle text-red-500 mb-2"></i>
      <p  class === text-red-600'>{{ error }}</p>
      <button @click type="$emit('retry=retry-btn>
        {{ t('common.retry') }}
      </button>
    </div>
  </div>
</template>

<script>
import { computed } from 'vue'
import { useTranslation } from '@/composables/useTranslation'

export default {
  name: 'BaseWidget',
  props: {
    widget: {
      type: Object,
      required: true,
      default: () => ({
        id: null,
        name: '',
        icon: '',
        isEnabled: true,
        titleKey: ''
      })
    },
    loading: {
      type: Boolean,
      default: false
    },
    error: {
      type: String,
      default: null
    },
    showHeader: {
      type: Boolean,
      default: true
    },
    showActions: {
      type: Boolean,
      default: true
    },
    canConfigure: {
      type: Boolean,
      default: true
    },
    canToggle: {
      type: Boolean,
      default: true
    },
    canRemove: {
      type: Boolean,
      default: false
    },
    size: {
      type: String,
      default: 'medium',
      validator: (value) => ['small', 'medium', 'large', 'full'].includes(value)
    }
  },
  emits: ['configure', 'toggle', 'remove', 'retry'],
  setup(props) {
    const { t } = useTranslation()
    
    const widgetClasses = computed(() => {
      return {
      'widget-small': props.size === 'small',
        'widget-medium': props.size === 'medium',
        'widget-large': props.size === 'large',
        'widget-full': props.size === 'full',
        'widget-loading': props.loading,
        'widget-error': props.error,
      t
    }
    })
    
    return {
      t,
      widgetClasses
    }
  }
}
</script>

<style scoped>
.widget-container {
  @apply bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden;
  transition: all 0.3s ease;
}

.widget-container:hover {
  @apply shadow-md;
}

.widget-header {
  @apply flex items-center justify-between p-4 border-b border-gray-100 bg-gray-50;
}

.widget-title-section {
  @apply flex items-center space-x-3;
}

.widget-icon {
  @apply text-blue-600 text-lg;
}

.widget-title {
  @apply text-lg font-semibold text-gray-900 m-0;
}

.widget-actions {
  @apply flex items-center space-x-2;
}

.widget-action-btn {
  @apply p-2 rounded-md text-gray-500 hover:text-gray-700 hover:bg-gray-100 transition-colors;
}

.widget-action-danger {
  @apply hover:text-red-600 hover:bg-red-50;
}

.widget-content {
  @apply p-4 relative;
}

.widget-disabled {
  @apply opacity-50;
}

.widget-disabled-overlay {
  @apply flex items-center justify-center py-8;
}

.widget-disabled-message {
  @apply text-center;
}

.widget-loading {
  @apply absolute inset-0 bg-white bg-opacity-90 flex flex-col items-center justify-center;
}

.loading-spinner {
  @apply w-8 h-8 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mb-2;
}

.loading-text {
  @apply text-gray-600 text-sm;
}

.widget-error {
  @apply absolute inset-0 bg-red-50 flex flex-col items-center justify-center text-center p-4;
}

.retry-btn {
  @apply mt-3 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors;
}

/* Tailles de widgets */
.widget-small {
  @apply min-h-48;
}

.widget-medium {
  @apply min-h-64;
}

.widget-large {
  @apply min-h-80;
}

.widget-full {
  @apply min-h-96;
}
</style>