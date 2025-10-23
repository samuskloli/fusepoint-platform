<template>
  <div class="widget-container" :class="widgetClasses">
    <!-- En-tête du widget -->
    <div v-if="showHeader" class="widget-header">
      <div class="widget-title-section">
        <i v-if="widget.icon" class="widget-icon" :class="widget.icon"></i>
        <h3 class="widget-title">
          {{ widget.titleKey ? t(widget.titleKey) : widget.name }}
        </h3>
      </div>
      
      <div v-if="showActions" class="widget-actions">
        <button 
          v-if="canConfigure"
          @click="$emit('configure')"
          class="widget-action-btn"
          :title="t('widgets.configure')"
        >
          <i class="fas fa-cog"></i>
        </button>
        
        <button 
          v-if="canToggle"
          @click="$emit('toggle')"
          class="widget-action-btn"
          :title="widget.isEnabled ? t('widgets.disable') : t('widgets.enable')"
        >
          <i :class="widget.isEnabled ? 'fas fa-eye-slash' : 'fas fa-eye'"></i>
        </button>
        
        <button 
          v-if="canRemove"
          @click="$emit('remove')"
          class="widget-action-btn widget-action-danger"
          :title="t('common.delete')"
        >
          <i class="fas fa-times"></i>
        </button>
      </div>
    </div>
    
    <!-- Contenu du widget -->
    <div class="widget-content" :class="{ 'widget-disabled': !widget.isEnabled }">
      <!-- Overlay désactivé -->
      <div v-if="!widget.isEnabled" class="widget-disabled-overlay">
        <div class="widget-disabled-message">
          <i class="fas fa-eye-slash text-gray-400 text-2xl mb-2"></i>
          <p class="text-gray-500">{{ t('widgets.disabled') }}</p>
        </div>
      </div>
      
      <!-- État de chargement -->
      <div v-else-if="loading" class="widget-loading">
        <div class="loading-spinner"></div>
        <p class="loading-text">{{ t('common.loading') }}</p>
      </div>
      
      <!-- État d'erreur -->
      <div v-else-if="error" class="widget-error">
        <i class="fas fa-exclamation-triangle text-red-500 mb-2"></i>
        <p class="text-red-600">{{ error }}</p>
        <button @click="$emit('retry')" class="retry-btn">
          {{ t('common.retry') }}
        </button>
      </div>
      
      <!-- Contenu principal -->
      <div v-else>
        <slot></slot>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useTranslation } from '@/composables/useTranslation'
import type { BaseWidgetProps, WidgetEmits } from '@/types/widgets'

// Props avec valeurs par défaut utilisant les types définis
const props = withDefaults(defineProps<BaseWidgetProps>(), {
  loading: false,
  error: null,
  showHeader: true,
  showActions: true,
  canConfigure: true,
  canToggle: true,
  canRemove: false,
  size: 'medium'
})

// Définition des événements émis avec les types
const emit = defineEmits<WidgetEmits>()

// Composable pour les traductions
const { t } = useTranslation()

// Classes CSS calculées pour le widget
const widgetClasses = computed(() => {
  return {
    'widget-small': props.size === 'small',
    'widget-medium': props.size === 'medium',
    'widget-large': props.size === 'large',
    'widget-full': props.size === 'full',
    'widget-loading': props.loading,
    'widget-error': !!props.error
  }
})
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