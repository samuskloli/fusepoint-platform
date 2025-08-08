<template>
  <div class="language-selector flex items-center space-x-2">
    <label class="form-label">
      {{ t('interface.language') }}
    </label>
    <select 
      v-model="selectedLanguage" 
      @change="changeLanguage" 
      class="form-select"
    >
      <option 
        v-for="(language, code) in availableLanguages" 
        :key="code" 
        :value="code"
      >
        {{ language.flag }} {{ language.name }}
      </option>
    </select>
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
      selectedLanguage: getSavedLocale(),
      availableLanguages: {
        fr: {
          code: 'fr',
          name: 'Français',
          flag: '🇫🇷'
        },
        en: {
          code: 'en', 
          name: 'English',
          flag: '🇬🇧'
        }
      }
    }
  },
  methods: {
    changeLanguage() {
      const success = setLocale(this.selectedLanguage)
      
      if (success) {
        // Émettre un événement pour notifier le changement
        this.$emit('language-changed', this.selectedLanguage)
        
        // Afficher une notification si disponible
        if (this.$toast) {
          const languageName = this.availableLanguages[this.selectedLanguage].name
          this.$toast.success(this.t('interface.languageChanged', { language: languageName }))
        }
        
        // Recharger la page pour appliquer les changements partout
        setTimeout(() => {
          window.location.reload()
        }, 500)
      }
    }
  },
  mounted() {
    // Synchroniser avec la langue actuelle au montage
    this.selectedLanguage = getSavedLocale()
  }
}
</script>

<style scoped>
/* Styles spécifiques au sélecteur de langue */
.language-selector {
  @apply inline-block;
}

.language-selector select {
  min-width: 140px;
}
</style>