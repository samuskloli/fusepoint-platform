<template>
  <div class="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50" @click="closeModal">
    <div class="relative top-20 mx-auto p-5 border w-11/12 md:w-4/5 lg:w-3/4 xl:w-2/3 shadow-lg rounded-lg bg-white" @click.stop>
      <!-- En-tête -->
      <div class="flex items-center justify-between pb-4 border-b border-gray-200">
        <div class="flex items-center space-x-3">
          <div class="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
            <i class="fas fa-cog text-blue-600 text-lg"></i>
          </div>
          <div>
            <h3 class="text-lg font-medium text-gray-900">{{ t('dashboard.settings.title') }}</h3>
            <p class="text-sm text-gray-600">{{ t('dashboard.settings.description') }}</p>
          </div>
        </div>
        <button @click="closeModal" class="text-gray-400 hover:text-gray-600">
          <i class="fas fa-times text-xl"></i>
        </button>
      </div>

      <!-- Contenu -->
      <div class="mt-6">
        <form @submit.prevent="saveSettings" class="mb-6">
          <!-- Onglets -->
          <div class="border-b border-gray-200 mb-6">
            <nav class="-mb-px flex space-x-8">
              <button
                v-for="tab in tabs"
                :key="tab.id"
                type="button"
                @click="activeTab = tab.id"
                :class="[
                  'py-2 px-1 border-b-2 font-medium text-sm',
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                ]"
              >
                <i :class="tab.icon" class="mr-2"></i>
                {{ t(tab.label) }}
              </button>
            </nav>
          </div>

          <!-- Contenu des onglets -->
          <!-- Onglet Général -->
          <div v-if="activeTab === 'general'" class="space-y-6">
            <!-- Paramètres d'affichage -->
            <div>
              <h4 class="text-sm font-medium text-gray-700 mb-4">{{ t('dashboard.settings.display') }}</h4>
              <div class="space-y-4">
                <div class="flex items-center justify-between">
                  <div>
                    <h5 class="text-sm font-medium text-gray-700">{{ t('dashboard.settings.showWelcome') }}</h5>
                    <p class="text-xs text-gray-500">{{ t('dashboard.settings.showWelcomeDesc') }}</p>
                  </div>
                  <label class="relative inline-flex items-center cursor-pointer">
                    <input
                      v-model="settings.dashboard.showWelcomeMessage"
                      type="checkbox"
                      class="sr-only peer"
                    >
                    <div class="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                  </label>
                </div>

                <div class="flex items-center justify-between">
                  <div>
                    <h5 class="text-sm font-medium text-gray-700">{{ t('dashboard.settings.enableNotifications') }}</h5>
                    <p class="text-xs text-gray-500">{{ t('dashboard.settings.enableNotificationsDesc') }}</p>
                  </div>
                  <label class="relative inline-flex items-center cursor-pointer">
                    <input
                      v-model="settings.dashboard.enableNotifications"
                      type="checkbox"
                      class="sr-only peer"
                    >
                    <div class="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                  </label>
                </div>

                <div class="flex items-center justify-between">
                  <div>
                    <h5 class="text-sm font-medium text-gray-700">{{ t('dashboard.settings.autoSaveLayout') }}</h5>
                    <p class="text-xs text-gray-500">{{ t('dashboard.settings.autoSaveLayoutDesc') }}</p>
                  </div>
                  <label class="relative inline-flex items-center cursor-pointer">
                    <input
                      v-model="settings.dashboard.autoSaveLayout"
                      type="checkbox"
                      class="sr-only peer"
                    >
                    <div class="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                  </label>
                </div>
              </div>
            </div>

            <!-- Thème et couleurs -->
            <div>
              <h4 class="text-sm font-medium text-gray-700 mb-4">{{ t('dashboard.settings.theme') }}</h4>
              <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-2">
                    {{ t('dashboard.settings.colorScheme') }}
                  </label>
                  <select
                    v-model="settings.dashboard.colorScheme"
                    class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="light">{{ t('dashboard.settings.light') }}</option>
                    <option value="dark">{{ t('dashboard.settings.dark') }}</option>
                    <option value="auto">{{ t('dashboard.settings.auto') }}</option>
                  </select>
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-2">
                    {{ t('dashboard.settings.accentColor') }}
                  </label>
                  <div class="flex items-center space-x-3">
                    <input
                      v-model="settings.dashboard.accentColor"
                      type="color"
                      class="w-12 h-10 border border-gray-300 rounded-md cursor-pointer"
                    >
                    <input
                      v-model="settings.dashboard.accentColor"
                      type="text"
                      class="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="#3B82F6"
                    >
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Onglet Disposition -->
          <div v-if="activeTab === 'layout'" class="space-y-6">
            <!-- Paramètres de grille -->
            <div>
              <h4 class="text-sm font-medium text-gray-700 mb-4">{{ t('dashboard.settings.gridSettings') }}</h4>
              <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-2">
                    {{ t('dashboard.settings.columns') }}
                  </label>
                  <select
                    v-model.number="settings.layout.columns"
                    class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option :value="8">8 {{ t('dashboard.settings.columnsText') }}</option>
                    <option :value="12">12 {{ t('dashboard.settings.columnsText') }}</option>
                    <option :value="16">16 {{ t('dashboard.settings.columnsText') }}</option>
                  </select>
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-2">
                    {{ t('dashboard.settings.spacing') }}
                  </label>
                  <select
                    v-model="settings.layout.spacing"
                    class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="compact">{{ t('dashboard.settings.compact') }}</option>
                    <option value="normal">{{ t('dashboard.settings.normal') }}</option>
                    <option value="comfortable">{{ t('dashboard.settings.comfortable') }}</option>
                  </select>
                </div>
              </div>
            </div>

            <!-- Options de redimensionnement -->
            <div>
              <h4 class="text-sm font-medium text-gray-700 mb-4">{{ t('dashboard.settings.resizeOptions') }}</h4>
              <div class="space-y-4">
                <div class="flex items-center justify-between">
                  <div>
                    <h5 class="text-sm font-medium text-gray-700">{{ t('dashboard.settings.allowWidgetResize') }}</h5>
                    <p class="text-xs text-gray-500">{{ t('dashboard.settings.allowWidgetResizeDesc') }}</p>
                  </div>
                  <label class="relative inline-flex items-center cursor-pointer">
                    <input
                      v-model="settings.dashboard.allowWidgetResize"
                      type="checkbox"
                      class="sr-only peer"
                    >
                    <div class="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                  </label>
                </div>
              </div>
            </div>
          </div>

          <!-- Actions -->
          <div class="flex justify-between items-center pt-6 border-t border-gray-200">
            <div class="flex space-x-3">
              <button
                type="button"
                @click="resetToDefaults"
                class="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {{ t('dashboard.settings.resetDefaults') }}
              </button>
            </div>
            <div class="flex space-x-3">
              <button
                type="button"
                @click="closeModal"
                class="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {{ t('common.cancel') }}
              </button>
              <button
                type="submit"
                class="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {{ t('common.save') }}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, computed } from 'vue'
import { useTranslation } from '@/composables/useTranslation'
import { useNotifications } from '@/composables/useNotifications'

export default {
  name: 'DashboardSettingsModal',
  props: {
    modelValue: {
      type: Boolean,
      default: false
    },
    currentSettings: {
      type: Object,
      default: () => ({
        dashboard: {
          showWelcomeMessage: true,
          enableNotifications: true,
          autoSaveLayout: true,
          allowWidgetResize: true,
          colorScheme: 'light',
          accentColor: '#3B82F6'
        },
        layout: {
          columns: 12,
          spacing: 'normal'
        }
      })
    }
  },
  emits: ['update:modelValue', 'save'],
  setup(props, { emit }) {
    const { t } = useTranslation()
    const { success } = useNotifications()
    
    const activeTab = ref('general')
    const settings = ref({
      dashboard: { ...props.currentSettings.dashboard },
      layout: { ...props.currentSettings.layout }
    })
    
    const tabs = computed(() => [
      {
        id: 'general',
        label: 'dashboard.settings.general',
        icon: 'fas fa-cog'
      },
      {
        id: 'layout',
        label: 'dashboard.settings.layout',
        icon: 'fas fa-th-large'
      }
    ])
    
    const closeModal = () => {
      emit('update:modelValue', false)
    }
    
    const saveSettings = () => {
      emit('save', settings.value)
      closeModal()
    }
    
    const resetToDefaults = () => {
      settings.value = {
        dashboard: {
          showWelcomeMessage: true,
          enableNotifications: true,
          autoSaveLayout: true,
          allowWidgetResize: true,
          colorScheme: 'light',
          accentColor: '#3B82F6'
        },
        layout: {
          columns: 12,
          spacing: 'normal'
        }
      }
      success(t('dashboard.settings.resetSuccess'))
    }
    
    return {
      activeTab,
      settings,
      tabs,
      closeModal,
      saveSettings,
      resetToDefaults,
      t
    }
  }
}
</script>

<style scoped>
/* Styles spécifiques au modal si nécessaire */
</style>