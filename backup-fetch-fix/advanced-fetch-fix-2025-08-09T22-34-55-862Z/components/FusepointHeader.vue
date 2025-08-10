<template>
  <div class="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-4 py-2 shadow-sm">
    <div class="flex items-center justify-between max-w-7xl mx-auto">
      <!-- Logo et titre Fusepoint -->
      <div class="flex items-center space-x-3">
        <div class="w-8 h-8 bg-white bg-opacity-20 rounded-lg flex items-center justify-center">
          <span class="text-white font-bold text-sm">F</span>
        </div>
        <div>
          <h2 class="text-sm font-semibold">{{ $t('header.accompagnementFusepoint') }}</h2>
          <p class="text-xs text-blue-100">{{ $t('header.personalizedMarketingCopilot') }}</p>
        </div>
      </div>

      <!-- Notifications et actions -->
      <div class="flex items-center space-x-4">
        <!-- Indicateur d'activité -->
        <div class="flex items-center space-x-2 text-xs">
          <div class="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
          <span class="text-blue-100">{{ $t('header.online') }}</span>
        </div>

        <!-- Notifications via NotificationCenter -->
        <NotificationCenter />

        <!-- Message personnalisé -->
        <div class="hidden md:block text-right">
          <p class="text-xs text-blue-100">{{ personalizedMessage }}</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import NotificationCenter from './NotificationCenter.vue'

const { t } = useI18n()

const personalizedMessage = computed(() => {
  const hour = new Date().getHours()
  const userName = localStorage.getItem('userName') || 'cher client'
  
  if (hour < 12) {
    return t('header.goodMorning', { userName })
  } else if (hour < 18) {
    return t('header.goodAfternoon', { userName })
  } else {
    return t('header.goodEvening', { userName })
  }
})
</script>

<style scoped>
/* Animations pour les notifications */
@keyframes slideDown {
  from {
    opacity: 0;
    transform: translateY(-10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.absolute {
  animation: slideDown 0.2s ease-out;
}
</style>