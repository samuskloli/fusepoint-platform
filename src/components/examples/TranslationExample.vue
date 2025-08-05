<template>
  <div class="translation-example">
    <!-- Utilisation du composable useTranslation -->
    <div class="header">
      <h1>{{ t('dashboard.title') }}</h1>
      <p>{{ t('dashboard.welcome') }}</p>
    </div>

    <!-- Utilisation des directives personnalisées -->
    <div class="actions">
      <button 
        class="btn btn-primary" 
        v-t="'actions.save'"
      ></button>
      
      <button 
        class="btn btn-secondary" 
        v-t="'actions.cancel'"
      ></button>
      
      <input 
        type="text" 
        v-t-placeholder="'forms.search'"
        class="form-control"
      />
    </div>

    <!-- Utilisation des sections spécifiques -->
    <div class="navigation">
      <nav>
        <a href="#" v-t="'navigation.dashboard'"></a>
        <a href="#" v-t="'navigation.clients'"></a>
        <a href="#" v-t="'navigation.services'"></a>
        <a href="#" v-t="'navigation.requests'"></a>
      </nav>
    </div>

    <!-- Messages avec interpolation -->
    <div class="messages">
      <p>{{ t('validation.min_length', { min: 8 }) }}</p>
      <p>{{ t('validation.max_length', { max: 255 }) }}</p>
    </div>

    <!-- Utilisation des statuts avec classes CSS -->
    <div class="status-examples">
      <span :class="getStatusClass('success')">{{ t('status.success') }}</span>
      <span :class="getStatusClass('error')">{{ t('status.error') }}</span>
      <span :class="getStatusClass('warning')">{{ t('status.warning') }}</span>
      <span :class="getStatusClass('info')">{{ t('status.info') }}</span>
    </div>

    <!-- Formatage des dates et nombres -->
    <div class="formatting">
      <p>{{ t('forms.date') }}: {{ formatDate(new Date()) }}</p>
      <p>{{ t('forms.price') }}: {{ formatCurrency(1234.56) }}</p>
      <p>{{ t('forms.quantity') }}: {{ formatNumber(1234567) }}</p>
    </div>

    <!-- Sélecteur de langue -->
    <div class="language-selector">
      <LanguageSelector variant="dropdown" />
    </div>

    <!-- Utilisation des sections -->
    <div class="sections">
      <h3>{{ tSection('clients').title }}</h3>
      <button>{{ tSection('clients').add_client }}</button>
      
      <h3>{{ tSection('services').title }}</h3>
      <button>{{ tSection('services').add_service }}</button>
    </div>

    <!-- Vérification d'existence de clés -->
    <div class="conditional">
      <p v-if="tExists('custom.key')">{{ t('custom.key') }}</p>
      <p v-else>{{ t('messages.notFound') }}</p>
    </div>

    <!-- Utilisation des méthodes globales (alternative) -->
    <div class="global-methods">
      <h2>{{ $t('dashboard.overview') }}</h2>
      <p>{{ $t('dashboard.recent_activity') }}</p>
      <select v-model="selectedLanguage" @change="$setLanguage(selectedLanguage)">
        <option 
          v-for="lang in $availableLanguages" 
          :key="lang.code" 
          :value="lang.code"
        >
          {{ lang.name }}
        </option>
      </select>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useTranslation } from '@/composables/useTranslation'
import LanguageSelector from '@/components/common/LanguageSelector.vue'

// Utilisation du composable de traduction
const { 
  t, 
  tSection, 
  tExists, 
  formatDate, 
  formatCurrency, 
  formatNumber, 
  getStatusClass,
  currentLanguage,
  availableLanguages,
  setLanguage 
} = useTranslation()

// Langue sélectionnée pour l'exemple
const selectedLanguage = ref(currentLanguage.value)

// Exemple de fonction qui utilise les traductions
const showSuccessMessage = () => {
  // Utilisation avec notification (exemple)
  console.log(t('messages.actionCompleted'))
}

// Exemple de validation avec messages traduits
const validateForm = (data) => {
  const errors = []
  
  if (!data.email) {
    errors.push(t('validation.required'))
  } else if (!isValidEmail(data.email)) {
    errors.push(t('validation.email'))
  }
  
  if (data.password && data.password.length < 8) {
    errors.push(t('validation.min_length', { min: 8 }))
  }
  
  return errors
}

// Fonction utilitaire pour la validation email
const isValidEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

// Exemple de données formatées
const exampleData = {
  createdAt: new Date(),
  price: 1234.56,
  quantity: 1000
}
</script>

<style scoped>
.translation-example {
  padding: 20px;
  max-width: 800px;
  margin: 0 auto;
}

.header {
  margin-bottom: 30px;
  text-align: center;
}

.actions {
  display: flex;
  gap: 10px;
  margin-bottom: 20px;
  align-items: center;
}

.btn {
  padding: 8px 16px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
}

.btn-primary {
  background-color: #007bff;
  color: white;
}

.btn-secondary {
  background-color: #6c757d;
  color: white;
}

.form-control {
  padding: 8px 12px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 14px;
}

.navigation {
  margin-bottom: 20px;
}

.navigation nav {
  display: flex;
  gap: 15px;
}

.navigation a {
  color: #007bff;
  text-decoration: none;
  padding: 5px 10px;
  border-radius: 3px;
}

.navigation a:hover {
  background-color: #f8f9fa;
}

.messages {
  margin-bottom: 20px;
  padding: 15px;
  background-color: #f8f9fa;
  border-radius: 4px;
}

.status-examples {
  display: flex;
  gap: 10px;
  margin-bottom: 20px;
}

.status-examples span {
  padding: 4px 8px;
  border-radius: 3px;
  font-size: 12px;
  font-weight: bold;
}

.formatting {
  margin-bottom: 20px;
  padding: 15px;
  background-color: #e9ecef;
  border-radius: 4px;
}

.language-selector {
  margin-bottom: 20px;
}

.sections {
  margin-bottom: 20px;
}

.sections h3 {
  margin-bottom: 10px;
  color: #495057;
}

.sections button {
  margin-bottom: 15px;
  padding: 6px 12px;
  background-color: #28a745;
  color: white;
  border: none;
  border-radius: 3px;
  cursor: pointer;
}

.conditional {
  margin-bottom: 20px;
  padding: 10px;
  border: 1px solid #dee2e6;
  border-radius: 4px;
}

.global-methods {
  padding: 15px;
  background-color: #fff3cd;
  border-radius: 4px;
}

.global-methods select {
  margin-top: 10px;
  padding: 5px;
  border: 1px solid #ddd;
  border-radius: 3px;
}

/* Classes CSS pour les statuts (exemples) */
:deep(.status-success) {
  background-color: #d4edda;
  color: #155724;
  border: 1px solid #c3e6cb;
}

:deep(.status-error) {
  background-color: #f8d7da;
  color: #721c24;
  border: 1px solid #f5c6cb;
}

:deep(.status-warning) {
  background-color: #fff3cd;
  color: #856404;
  border: 1px solid #ffeaa7;
}

:deep(.status-info) {
  background-color: #d1ecf1;
  color: #0c5460;
  border: 1px solid #bee5eb;
}
</style>