<template>
  <span :class="badgeClasses" class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium">
    <i :class="iconClass" class="mr-1"></i>
    {{ statusLabel }}
  </span>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  status: {
    type: String,
    required: true
  }
})

const statusConfig = {
  'fully_developed': {
    label: 'Entièrement développé',
    icon: 'fas fa-check-circle',
    classes: 'bg-green-100 text-green-800'
  },
  'partially_developed': {
    label: 'Partiellement développé',
    icon: 'fas fa-clock',
    classes: 'bg-yellow-100 text-yellow-800'
  },
  'not_developed': {
    label: 'Non développé',
    icon: 'fas fa-times-circle',
    classes: 'bg-red-100 text-red-800'
  },
  'in_database_only': {
    label: 'Base de données uniquement',
    icon: 'fas fa-database',
    classes: 'bg-blue-100 text-blue-800'
  },
  'needs_update': {
    label: 'Mise à jour requise',
    icon: 'fas fa-exclamation-triangle',
    classes: 'bg-orange-100 text-orange-800'
  },
  'unknown': {
    label: 'Statut inconnu',
    icon: 'fas fa-question-circle',
    classes: 'bg-gray-100 text-gray-800'
  }
}

const statusLabel = computed(() => {
  return statusConfig[props.status]?.label || 'Statut inconnu'
})

const iconClass = computed(() => {
  return statusConfig[props.status]?.icon || 'fas fa-question-circle'
})

const badgeClasses = computed(() => {
  return statusConfig[props.status]?.classes || 'bg-gray-100 text-gray-800'
})
</script>