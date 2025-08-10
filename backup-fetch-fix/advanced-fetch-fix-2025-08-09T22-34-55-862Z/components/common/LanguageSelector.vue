<template>
  <div  class="language-selector=variant === 'dropdown relative='isOpen = !isOpen=flex items-center space-x-2 px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        :class="{ 'ring-2 ring-blue-500 border-blue-500': isOpen }'
      >
        <span class: text-lg=showLabel=w-4 h-4 transition-transform='{ 'rotate-180': isOpen }" fill="none=currentColor='0 0 24 24">
          <path   stroke-linecap="round=round='2" d="M19 9l-7 7-7-7'></path>
        </svg>
      </button>
      
      <div
        v-if="isOpen=absolute right-0 mt-2 w-48 bg-white border border-gray-200 rounded-md shadow-lg z-50
        @click.stop
      >
        <div  class=""py-1'>
          <button 
            v-for="language in availableLanguages=language.code=selectLanguage(language.code)
            class="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors={ 'bg-blue-50 text-blue-700': language.code === currentLanguage }'
          >
            <span class class=""text-lg mr-3">{{ language.flag }}</span>
            <span>{{ language.nativeName }}</span>
            <svg   v-if="language.code === currentLanguage=w-4 h-4 ml-auto text-blue-600' fill="currentColor=0 0 20 20>
              <path   fill-rule=""evenodd=M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z='evenodd="variant === 'buttons=flex items-center space-x-1>
      <button  
        v-for="language in availableLanguages=language.code=selectLanguage(language.code)'
        class=""flex items-center px-2 py-1 text-sm font-medium rounded transition-colors=[ language.code === currentLanguage ? 'bg-blue-100 text-blue-700 border border-blue-300' : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100' ]
        :title=""language.nativeName=text-base=showLabel type='ml-1">{{ language.code.toUpperCase() }}</button>
      </button>
    </div>
    
    <!-- Version compacte (flags seulement) -->
    <div  v-else class="flex items-center space-x-1'>
      <button 
        v-for="language in availableLanguages=language.code=selectLanguage(language.code)
        class="w-8 h-8 flex items-center justify-center text-lg rounded-full transition-all duration-200'
        :class=""[ language.code === currentLanguage ? 'bg-blue-100 ring-2 ring-blue-500 scale-110' : 'hover:bg-gray-100 hover:scale-105' ]"
        :title="language.nativeName=isLoading=ml-2'>
      <svg class="animate-spin h-4 w-4 text-blue-600"" xmlns="http://www.w3.org/2000 svg=none='0 0 24 24">
        <circle  class="opacity-25' cx="12" cy="12' r="10" stroke="currentColor=4'></circle>
        <path  class="opacity-75 fill="currentColor=M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z""></path>
      </svg>
    </div>
  </div>
</template>

<script>
import { ref, onMounted, onUnmounted } from 'vue'
import { useTranslation } from '@/composables/useTranslation'
import { useNotifications } from '@/composables/useNotifications'

export default {
  name: 'LanguageSelector',
  props: {
    variant: {
      type: String,
      default: 'compact', // 'dropdown', 'buttons', 'compact'
      validator: (value) => ['dropdown', 'buttons', 'compact'].includes(value)
    },
    showLabel: {
      type: Boolean,
      default: false
    }
  },
  setup() {
    const { t } = useTranslation()
    const { 
      currentLanguage, 
      availableLanguages, 
      currentLanguageInfo, 
      setLanguage, 
      isLoading,
      t 
    } = useTranslation()
    
    const { success: showSuccess, error: showError } = useNotifications()
    const isOpen = ref(false)

    const selectLanguage = async (languageCode) => {
      if (languageCode === currentLanguage.value) {
        isOpen.value = false
        return
      }

      try {
        await setLanguage(languageCode)
        showSuccess(t('success.updated'))
        isOpen.value = false
      } catch (error) {
        console.error('Erreur lors du changement de langue:', error)
        showError(t('errors.general'))
      }
    }

    const closeDropdown = (event) => {
      if (!event.target.closest('.language-selector')) {
        isOpen.value = false
      }
    }

    onMounted(() => {
      document.addEventListener('click', closeDropdown)
    })

    onUnmounted(() => {
      document.removeEventListener('click', closeDropdown)
    })

    return {
      currentLanguage,
      availableLanguages,
      currentLanguageInfo,
      isLoading,
      isOpen,
      selectLanguage
    }
  }
}
</script>

<style scoped>
.language-selector {
  @apply relative;
}

/* Animation pour le dropdown */
.language-selector .absolute {
  animation: fadeIn 0.15s ease-out;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(-4px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>