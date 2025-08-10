<template>
  <div class="language-selector relative">
    <!-- Bouton principal -->
    <button
      @click="toggleDropdown"
      class="language-button flex items-center space-x-2 px-3 py-2 rounded-lg border border-gray-200 bg-white hover:bg-gray-50 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
    >
      <!-- Icône de globe -->
      <svg 
        class="h-4 w-4 text-gray-600" 
        fill="none" 
        viewBox="0 0 24 24" 
        stroke="currentColor"
      >
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
      </svg>
      <!-- Langue actuelle -->
      <span class="text-sm font-medium text-gray-700">{{ currentLanguage.code.toUpperCase() }}</span>
      <!-- Flèche -->
      <svg 
        class="h-4 w-4 text-gray-400 transition-transform duration-200" 
        :class="{ 'rotate-180': isOpen }"
        fill="none" 
        viewBox="0 0 24 24" 
        stroke="currentColor"
      >
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
      </svg>
    </button>

    <!-- Menu déroulant -->
    <transition
      enter-active-class="transition ease-out duration-200"
      enter-from-class="opacity-0 scale-95"
      enter-to-class="opacity-100 scale-100"
      leave-active-class="transition ease-in duration-150"
      leave-from-class="opacity-100 scale-100"
      leave-to-class="opacity-0 scale-95"
    >
      <div
        v-if="isOpen"
        class="language-dropdown absolute right-0 top-full mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-50"
      >
        <button
          v-for="(language, code) in availableLanguages"
          :key="code"
          @click="selectLanguage(code)"
          class="language-option w-full flex items-center space-x-3 px-4 py-2 text-left hover:bg-gray-50 transition-colors duration-150"
          :class="{
            'bg-blue-50 text-blue-700': selectedLanguage === code,
            'text-gray-700': selectedLanguage !== code
          }"
        >
          <div class="flex-1">
            <div class="text-sm font-medium">{{ language.name }}</div>
            <div class="text-xs text-gray-500">{{ language.code.toUpperCase() }}</div>
          </div>
          <svg
            v-if="selectedLanguage === code"
            class="h-4 w-4 text-blue-600"
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd" />
          </svg>
        </button>
      </div>
    </transition>

    <!-- Overlay pour fermer le menu -->
    <div
      v-if="isOpen"
      @click="closeDropdown"
      class="fixed inset-0 z-40"
    ></div>
  </div>
</template>

<script>
import { useI18n } from 'vue-i18n'
import { setLocale, getSavedLocale } from '@/plugins/i18n'
import { useTranslation } from '@/composables/useTranslation'

export default {
  name: 'LanguageSelector',
  setup() {
    const { t } = useTranslation()
    return { t }
  },
  data() {
    return {
      isOpen: false,
      selectedLanguage: getSavedLocale(),
      languages: [
        {
          code: 'fr',
          name: 'Français'
        },
        {
          code: 'en',
          name: 'English'
        }
      ],
      availableLanguages: {
        fr: {
          code: 'fr',
          name: 'Français',
          nativeName: 'Français',
          flag: '🇫🇷'
        },
        en: {
          code: 'en', 
          name: 'English',
          nativeName: 'English',
          flag: '🇬🇧'
        }
      }
    }
  },
  computed: {
    currentLanguage() {
      return this.availableLanguages[this.selectedLanguage] || this.availableLanguages.fr
    },
    currentLocale() {
      return this.selectedLanguage
    }
  },

  methods: {
    toggleDropdown() {
      this.isOpen = !this.isOpen
    },
    
    closeDropdown() {
      this.isOpen = false
    },
    
    async selectLanguage(locale) {
      if (locale === this.selectedLanguage) {
        this.closeDropdown()
        return
      }
      
      try {
        // Sauvegarder la langue en base de données
        await this.saveLanguagePreference(locale)
        
        // Changer la langue instantanément sans rechargement
        this.$i18n.locale = locale
        this.selectedLanguage = locale
        localStorage.setItem('preferred-language', locale)
        this.closeDropdown()
        
        // Émettre un événement pour notifier le changement
        this.$emit('language-changed', locale)
        
        // Afficher une notification si disponible
        if (this.$toast) {
          const languageName = this.availableLanguages[locale].name
          this.$toast.success(this.t('interface.languageChanged', { language: languageName }))
        }
        
      } catch (error) {
        console.error('Erreur lors de la sauvegarde de la langue:', error)
        // Continuer même en cas d'erreur de sauvegarde
        this.$i18n.locale = locale
        this.selectedLanguage = locale
        localStorage.setItem('preferred-language', locale)
        this.closeDropdown()
      }
    },
    
    async saveLanguagePreference(locale) {
      const token = localStorage.getItem('token')
      if (!token) return
      
      try {
        const response = await fetch('/api/auth/update-language', {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({ language: locale })
        })
        
        if (!response.ok) {
          throw new Error('Erreur lors de la sauvegarde')
        }
      } catch (error) {
        console.error('Erreur API:', error)
        throw error
      }
    },
    
    getCurrentLanguageCode() {
      return this.currentLocale.toUpperCase()
    }
  },
  mounted() {
    // Synchroniser avec la langue actuelle au montage
    this.selectedLanguage = getSavedLocale()
    
    // Fermer le dropdown si on clique en dehors
    document.addEventListener('click', (e) => {
      if (!this.$el.contains(e.target)) {
        this.isOpen = false
      }
    })
  },
  
  beforeUnmount() {
    // Nettoyer l'event listener
    document.removeEventListener('click', this.handleClickOutside)
  }
}
</script>

<style scoped>
.language-selector {
  @apply relative inline-block;
}

.language-button {
  min-width: 80px;
}

@media (min-width: 640px) {
  .language-button {
    min-width: 100px;
  }
}

.language-dropdown {
  box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
}

.language-option:first-child {
  @apply rounded-t-lg;
}

.language-option:last-child {
  @apply rounded-b-lg;
}

.rotate-180 {
  transform: rotate(180deg);
}
</style>