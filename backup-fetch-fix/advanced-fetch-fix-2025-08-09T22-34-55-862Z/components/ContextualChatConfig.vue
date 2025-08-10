<template>
  <div class="bg-white rounded-lg shadow-lg p-6 mb-6">
    <div class="flex items-center justify-between mb-4">
      <h3 class="text-lg font-semibold text-gray-800 flex items-center">
        <span class="mr-2">🏢</span>
        Configuration IA Contextuelle
      </h3>
      <button 
        @click="toggleConfig"
        class="text-gray-500 hover:text-gray-700 transition-colors"
      >
        <svg class="w-5 h-5" :class="{ 'rotate-180': showConfig }" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path>
        </svg>
      </button>
    </div>

    <div v-if="showConfig" class="space-y-4">
      <!-- Status de l'IA Contextuelle -->
      <div class="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
        <div class="flex items-center">
          <div class="w-3 h-3 rounded-full mr-3" :class="contextualStatus.color"></div>
          <span class="text-sm font-medium">{{ contextualStatus.text }}</span>
        </div>
        <span class="text-xs text-gray-500">{{ contextualStatus.description }}</span>
      </div>

      <!-- Configuration Utilisateur -->
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">
            ID Utilisateur
          </label>
          <input 
            v-model="localUserId"
            type="text"
            placeholder="user_123"
            class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
          />
          <p class="text-xs text-gray-500 mt-1">Identifiant unique de l'utilisateur</p>
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">
            ID Entreprise
          </label>
          <select 
            v-model="localCompanyId"
            class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
          >
            <option value="">Sélectionner une entreprise</option>
            <option value="company_1">TechStart Solutions</option>
            <option value="company_2">E-Commerce Plus</option>
            <option value="company_demo">Entreprise Demo</option>
          </select>
          <p class="text-xs text-gray-500 mt-1">Entreprise pour les données contextuelles</p>
        </div>
      </div>

      <!-- Aperçu des Données -->
      <div v-if="localCompanyId" class="mt-4">
        <h4 class="text-sm font-medium text-gray-700 mb-3">Aperçu des données disponibles :</h4>
        <div class="grid grid-cols-2 md:grid-cols-4 gap-3">
          <div class="bg-blue-50 p-3 rounded-lg text-center">
            <div class="text-lg font-bold text-blue-600">📊</div>
            <div class="text-xs text-blue-800 font-medium">Analytics</div>
            <div class="text-xs text-blue-600">Google Analytics</div>
          </div>
          <div class="bg-green-50 p-3 rounded-lg text-center">
            <div class="text-lg font-bold text-green-600">📱</div>
            <div class="text-xs text-green-800 font-medium">Social</div>
            <div class="text-xs text-green-600">Facebook/Meta</div>
          </div>
          <div class="bg-purple-50 p-3 rounded-lg text-center">
            <div class="text-lg font-bold text-purple-600">📧</div>
            <div class="text-xs text-purple-800 font-medium">Email</div>
            <div class="text-xs text-purple-600">Campagnes</div>
          </div>
          <div class="bg-orange-50 p-3 rounded-lg text-center">
            <div class="text-lg font-bold text-orange-600">💰</div>
            <div class="text-xs text-orange-800 font-medium">Ventes</div>
            <div class="text-xs text-orange-600">CRM</div>
          </div>
        </div>
      </div>

      <!-- Actions -->
      <div class="flex justify-between items-center pt-4 border-t border-gray-200">
        <div class="flex space-x-2">
          <button 
            @click="saveConfig"
            :disabled="!localUserId || !localCompanyId"
            class="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            Activer l'IA Contextuelle
          </button>
          <button 
            @click="resetConfig"
            class="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
          >
            Réinitialiser
          </button>
        </div>
        
        <button 
          v-if="localCompanyId"
          @click="testContextualAI"
          :disabled="isTestingAI"
          class="px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors text-sm"
        >
          <span v-if="isTestingAI">Test en cours...</span>
          <span v-else>Tester l'IA</span>
        </button>
      </div>

      <!-- Résultat du Test -->
      <div v-if="testResult" class="mt-4 p-3 rounded-lg" :class="testResult.success ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'">
        <div class="flex items-center">
          <div class="mr-2" :class="testResult.success ? 'text-green-600' : 'text-red-600'">
            {{ testResult.success ? '✅' : '❌' }}
          </div>
          <div>
            <div class="text-sm font-medium" :class="testResult.success ? 'text-green-800' : 'text-red-800'">
              {{ testResult.message }}
            </div>
            <div v-if="testResult.details" class="text-xs mt-1" :class="testResult.success ? 'text-green-600' : 'text-red-600'">
              {{ testResult.details }}
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import aiChatService from '../services/aiChatService';

export default {
  name: 'ContextualChatConfig',
  props: {
    userId: {
      type: String,
      default: ''
    },
    companyId: {
      type: String,
      default: ''
    }
  },
  emits: ['config-updated'],
  data() {
    return {
      showConfig: false,
      localUserId: this.userId || 'user_demo_123',
      localCompanyId: this.companyId || '',
      isTestingAI: false,
      testResult: null
    };
  },
  computed: {
    contextualStatus() {
      if (this.localUserId && this.localCompanyId) {
        return {
          color: 'bg-green-500',
          text: 'IA Contextuelle Active',
          description: 'Réponses personnalisées avec données d\'entreprise'
        };
      } else if (this.localUserId || this.localCompanyId) {
        return {
          color: 'bg-yellow-500',
          text: 'Configuration Partielle',
          description: 'Complétez la configuration pour activer'
        };
      } else {
        return {
          color: 'bg-gray-400',
          text: 'IA Standard',
          description: 'Réponses génériques sans contexte entreprise'
        };
      }
    }
  },
  watch: {
    userId(newVal) {
      this.localUserId = newVal;
    },
    companyId(newVal) {
      this.localCompanyId = newVal;
    }
  },
  methods: {
    toggleConfig() {
      this.showConfig = !this.showConfig;
    },
    
    saveConfig() {
      if (!this.localUserId || !this.localCompanyId) {
        return;
      }
      
      this.$emit('config-updated', {
        userId: this.localUserId,
        companyId: this.localCompanyId
      });
      
      // Sauvegarder dans le localStorage
      localStorage.setItem('contextual_ai_config', JSON.stringify({
        userId: this.localUserId,
        companyId: this.localCompanyId,
        timestamp: Date.now()
      }));
      
      this.testResult = {
        success: true,
        message: 'Configuration sauvegardée',
        details: 'L\'IA utilisera maintenant les données de votre entreprise'
      };
      
      setTimeout(() => {
        this.testResult = null;
      }, 3000);
    },
    
    resetConfig() {
      this.localUserId = 'user_demo_123';
      this.localCompanyId = '';
      
      this.$emit('config-updated', {
        userId: '',
        companyId: ''
      });
      
      localStorage.removeItem('contextual_ai_config');
      
      this.testResult = {
        success: true,
        message: 'Configuration réinitialisée',
        details: 'Retour au mode IA standard'
      };
      
      setTimeout(() => {
        this.testResult = null;
      }, 3000);
    },
    
    async testContextualAI() {
      this.isTestingAI = true;
      this.testResult = null;
      
      try {
        const testMessage = 'Peux-tu analyser les performances de mon entreprise ?';
        
        const response = await aiChatService.sendMessage(
          testMessage,
          'analytics',
          [],
          {
            userId: this.localUserId,
            companyId: this.localCompanyId
          }
        );
        
        if (response.contextual) {
          this.testResult = {
            success: true,
            message: 'IA Contextuelle fonctionnelle !',
            details: `Données d'entreprise intégrées pour ${response.companyId}`
          };
        } else {
          this.testResult = {
            success: false,
            message: 'Mode standard utilisé',
            details: 'Vérifiez la configuration ou les données d\'entreprise'
          };
        }
        
      } catch (error) {
        console.error('Erreur test IA contextuelle:', error);
        this.testResult = {
          success: false,
          message: 'Erreur lors du test',
          details: error.message
        };
      } finally {
        this.isTestingAI = false;
        
        setTimeout(() => {
          this.testResult = null;
        }, 5000);
      }
    },
    
    loadSavedConfig() {
      try {
        const saved = localStorage.getItem('contextual_ai_config');
        if (saved) {
          const config = JSON.parse(saved);
          // Vérifier que la config n'est pas trop ancienne (24h)
          if (Date.now() - config.timestamp < 24 * 60 * 60 * 1000) {
            this.localUserId = config.userId || this.localUserId;
            this.localCompanyId = config.companyId || this.localCompanyId;
            
            // Émettre la configuration chargée
            this.$emit('config-updated', {
              userId: this.localUserId,
              companyId: this.localCompanyId
            });
          }
        }
      } catch (error) {
        console.error('Erreur chargement config:', error);
      }
    }
  },
  
  mounted() {
    this.loadSavedConfig();
  }
};
</script>

<style scoped>
.rotate-180 {
  transform: rotate(180deg);
}

/* Animation pour les transitions */
.transition-colors {
  transition: color 0.2s ease, background-color 0.2s ease;
}

/* Style pour les inputs focus */
input:focus, select:focus {
  outline: none;
}

/* Animation pour l'ouverture/fermeture */
.config-enter-active, .config-leave-active {
  transition: all 0.3s ease;
}

.config-enter-from, .config-leave-to {
  opacity: 0;
  transform: translateY(-10px);
}
</style>