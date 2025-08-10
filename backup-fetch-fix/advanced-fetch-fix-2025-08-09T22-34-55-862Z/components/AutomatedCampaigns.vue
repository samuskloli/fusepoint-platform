<template>
  <div class="p-6 bg-gray-50 min-h-screen">
    <!-- Header -->
    <div class="mb-8">
      <div class="flex justify-between items-center">
        <div>
          <h1 class="text-3xl font-bold text-gray-900">Campagnes Automatisées</h1>
          <p class="text-gray-600 mt-2">Créez et gérez vos workflows marketing intelligents</p>
        </div>
        <button 
          @click="showCreateModal = true"
          class="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-6 py-3 rounded-lg hover:shadow-lg transition-all duration-300 transform hover:scale-105"
        >
          <svg class="h-5 w-5 inline mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
          </svg>
          Nouvelle Campagne IA
        </button>
      </div>
    </div>

    <!-- Quick Stats -->
    <div class="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
      <div class="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-sm font-medium text-gray-600">Campagnes Actives</p>
            <p class="text-2xl font-bold text-gray-900">{{ activeCampaigns.length }}</p>
          </div>
          <div class="h-12 w-12 bg-green-100 rounded-lg flex items-center justify-center">
            <svg class="h-6 w-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
            </svg>
          </div>
        </div>
      </div>
      
      <div class="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-sm font-medium text-gray-600">Conversions Totales</p>
            <p class="text-2xl font-bold text-gray-900">{{ totalConversions }}</p>
          </div>
          <div class="h-12 w-12 bg-blue-100 rounded-lg flex items-center justify-center">
            <svg class="h-6 w-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
          </div>
        </div>
      </div>
      
      <div class="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-sm font-medium text-gray-600">ROI Moyen</p>
            <p class="text-2xl font-bold text-gray-900">{{ averageROI }}%</p>
          </div>
          <div class="h-12 w-12 bg-yellow-100 rounded-lg flex items-center justify-center">
            <svg class="h-6 w-6 text-yellow-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
            </svg>
          </div>
        </div>
      </div>
      
      <div class="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-sm font-medium text-gray-600">Économies IA</p>
            <p class="text-2xl font-bold text-gray-900">{{ totalSavings }}€</p>
          </div>
          <div class="h-12 w-12 bg-purple-100 rounded-lg flex items-center justify-center">
            <svg class="h-6 w-6 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
            </svg>
          </div>
        </div>
      </div>
    </div>

    <!-- Campaign Templates -->
    <div class="mb-8">
      <h2 class="text-xl font-semibold text-gray-900 mb-4">Modèles de Campagnes IA</h2>
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div 
          v-for="(template, key) in campaignTemplates" 
          :key="key"
          @click="selectTemplate(key)"
          class="bg-white p-6 rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition-all duration-300 cursor-pointer hover:border-purple-300"
        >
          <div class="flex items-center justify-between mb-4">
            <div class="h-12 w-12 bg-gradient-to-r from-purple-100 to-pink-100 rounded-lg flex items-center justify-center">
              <span class="text-2xl">{{ getTemplateIcon(key) }}</span>
            </div>
            <span class="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full">IA</span>
          </div>
          <h3 class="font-semibold text-gray-900 mb-2">{{ template.name }}</h3>
          <p class="text-sm text-gray-600 mb-4">{{ template.description }}</p>
          <div class="flex justify-between items-center text-xs text-gray-500">
            <span>{{ template.steps.length }} étapes</span>
            <span>{{ Math.round(template.expectedConversion * 100) }}% conv.</span>
          </div>
        </div>
      </div>
    </div>

    <!-- Active Campaigns -->
    <div class="mb-8">
      <h2 class="text-xl font-semibold text-gray-900 mb-4">Campagnes en Cours</h2>
      <div class="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div v-if="activeCampaigns.length === 0" class="p-8 text-center">
          <svg class="h-12 w-12 text-gray-400 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
          </svg>
          <h3 class="text-lg font-medium text-gray-900 mb-2">Aucune campagne active</h3>
          <p class="text-gray-600 mb-4">Créez votre première campagne automatisée pour commencer</p>
          <button 
            @click="showCreateModal = true"
            class="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors"
          >
            Créer une campagne
          </button>
        </div>
        
        <div v-else>
          <div class="overflow-x-auto">
            <table class="min-w-full divide-y divide-gray-200">
              <thead class="bg-gray-50">
                <tr>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Campagne</th>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Statut</th>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Performance</th>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ROI</th>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Budget</th>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody class="bg-white divide-y divide-gray-200">
                <tr v-for="campaign in activeCampaigns" :key="campaign.id" class="hover:bg-gray-50">
                  <td class="px-6 py-4 whitespace-nowrap">
                    <div class="flex items-center">
                      <div class="h-10 w-10 bg-gradient-to-r from-purple-100 to-pink-100 rounded-lg flex items-center justify-center mr-4">
                        <span class="text-lg">{{ getTemplateIcon(campaign.template) }}</span>
                      </div>
                      <div>
                        <div class="text-sm font-medium text-gray-900">{{ campaign.name }}</div>
                        <div class="text-sm text-gray-500">{{ formatDate(campaign.createdAt) }}</div>
                      </div>
                    </div>
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap">
                    <span :class="getStatusClass(campaign.status)" class="inline-flex px-2 py-1 text-xs font-semibold rounded-full">
                      {{ getStatusText(campaign.status) }}
                    </span>
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    <div class="flex items-center space-x-4">
                      <div class="text-center">
                        <div class="font-medium">{{ campaign.performance.conversions }}</div>
                        <div class="text-xs text-gray-500">Conv.</div>
                      </div>
                      <div class="text-center">
                        <div class="font-medium">{{ campaign.performance.clicks }}</div>
                        <div class="text-xs text-gray-500">Clics</div>
                      </div>
                      <div class="text-center">
                        <div class="font-medium">{{ formatNumber(campaign.performance.impressions) }}</div>
                        <div class="text-xs text-gray-500">Impr.</div>
                      </div>
                    </div>
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap">
                    <div class="text-sm font-medium" :class="getROIClass(calculateROI(campaign))">
                      {{ calculateROI(campaign) }}%
                    </div>
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    <div>
                      <div class="font-medium">{{ campaign.performance.cost }}€ / {{ campaign.budget.daily }}€</div>
                      <div class="w-full bg-gray-200 rounded-full h-2 mt-1">
                        <div 
                          class="bg-purple-600 h-2 rounded-full" 
                          :style="{ width: Math.min((campaign.performance.cost / campaign.budget.daily) * 100, 100) + '%' }"
                        ></div>
                      </div>
                    </div>
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div class="flex space-x-2">
                      <button 
                        @click="viewCampaign(campaign)"
                        class="text-purple-600 hover:text-purple-900 transition-colors"
                      >
                        Voir
                      </button>
                      <button 
                        v-if="campaign.status === 'active'"
                        @click="pauseCampaign(campaign.id)"
                        class="text-yellow-600 hover:text-yellow-900 transition-colors"
                      >
                        Pause
                      </button>
                      <button 
                        v-else-if="campaign.status === 'paused'"
                        @click="resumeCampaign(campaign.id)"
                        class="text-green-600 hover:text-green-900 transition-colors"
                      >
                        Reprendre
                      </button>
                      <button 
                        @click="stopCampaign(campaign.id)"
                        class="text-red-600 hover:text-red-900 transition-colors"
                      >
                        Arrêter
                      </button>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>

    <!-- Create Campaign Modal -->
    <div v-if="showCreateModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div class="bg-white rounded-xl p-8 max-w-2xl w-full mx-4 max-h-screen overflow-y-auto">
        <div class="flex justify-between items-center mb-6">
          <h2 class="text-2xl font-bold text-gray-900">Créer une Campagne IA</h2>
          <button @click="showCreateModal = false" class="text-gray-400 hover:text-gray-600">
            <svg class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        
        <form @submit.prevent="createCampaign">
          <div class="space-y-6">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">Nom de la campagne</label>
              <input 
                v-model="newCampaign.name" 
                type="text" 
                required
                class="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                placeholder="Ex: Campagne de nurturing Q4"
              />
            </div>
            
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">Modèle de campagne</label>
              <select 
                v-model="newCampaign.template" 
                required
                class="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              >
                <option value="">Sélectionner un modèle</option>
                <option v-for="(template, key) in campaignTemplates" :key="key" :value="key">
                  {{ template.name }} - {{ template.description }}
                </option>
              </select>
            </div>
            
            <div class="grid grid-cols-2 gap-4">
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">Budget quotidien (€)</label>
                <input 
                  v-model.number="newCampaign.dailyBudget" 
                  type="number" 
                  min="10"
                  required
                  class="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  placeholder="50"
                />
              </div>
              
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">Budget total (€)</label>
                <input 
                  v-model.number="newCampaign.totalBudget" 
                  type="number" 
                  min="100"
                  required
                  class="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  placeholder="1500"
                />
              </div>
            </div>
            
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">Audience cible</label>
              <textarea 
                v-model="newCampaign.targetAudience" 
                rows="3"
                class="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                placeholder="Décrivez votre audience cible (âge, intérêts, comportements...)"
              ></textarea>
            </div>
            
            <div class="flex justify-end space-x-4">
              <button 
                type="button" 
                @click="showCreateModal = false"
                class="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
              >
                Annuler
              </button>
              <button 
                type="submit" 
                :disabled="isCreating"
                class="px-6 py-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg hover:shadow-lg transition-all duration-300 disabled:opacity-50"
              >
                {{ isCreating ? 'Création...' : 'Créer la Campagne IA' }}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script>
import marketingAutomationService from '../services/marketingAutomationService.js';

export default {
  name: 'AutomatedCampaigns',
  data() {
    return {
      activeCampaigns: [],
      campaignTemplates: {},
      showCreateModal: false,
      isCreating: false,
      newCampaign: {
        name: '',
        template: '',
        dailyBudget: 50,
        totalBudget: 1500,
        targetAudience: ''
      }
    };
  },
  computed: {
    totalConversions() {
      return this.activeCampaigns.reduce((sum, campaign) => sum + campaign.performance.conversions, 0);
    },
    averageROI() {
      if (this.activeCampaigns.length === 0) return 0;
      const totalROI = this.activeCampaigns.reduce((sum, campaign) => sum + this.calculateROI(campaign), 0);
      return Math.round(totalROI / this.activeCampaigns.length);
    },
    totalSavings() {
      return this.activeCampaigns.reduce((sum, campaign) => {
        const manualCost = campaign.performance.cost * 1.5; // Estimation du coût manuel
        return sum + Math.max(0, manualCost - campaign.performance.cost);
      }, 0);
    }
  },
  async mounted() {
    await this.loadData();
  },
  methods: {
    async loadData() {
      try {
        this.campaignTemplates = marketingAutomationService.getCampaignTemplates();
        this.activeCampaigns = marketingAutomationService.getActiveCampaigns();
      } catch (error) {
        console.error('Error loading campaigns:', error);
      }
    },
    selectTemplate(templateKey) {
      this.newCampaign.template = templateKey;
      this.showCreateModal = true;
    },
    async createCampaign() {
      if (!this.newCampaign.template) return;
      
      this.isCreating = true;
      try {
        const customization = {
          name: this.newCampaign.name,
          budget: {
            daily: this.newCampaign.dailyBudget,
            total: this.newCampaign.totalBudget
          },
          targetAudience: this.newCampaign.targetAudience
        };
        
        await marketingAutomationService.createAutomatedCampaign(this.newCampaign.template, customization);
        await this.loadData();
        
        this.showCreateModal = false;
        this.resetForm();
        
        // Show success message
        this.$emit('show-notification', {
          type: 'success',
          message: 'Campagne IA créée avec succès !'
        });
      } catch (error) {
        console.error('Error creating campaign:', error);
        this.$emit('show-notification', {
          type: 'error',
          message: 'Erreur lors de la création de la campagne'
        });
      } finally {
        this.isCreating = false;
      }
    },
    resetForm() {
      this.newCampaign = {
        name: '',
        template: '',
        dailyBudget: 50,
        totalBudget: 1500,
        targetAudience: ''
      };
    },
    pauseCampaign(campaignId) {
      marketingAutomationService.pauseCampaign(campaignId);
      this.loadData();
    },
    resumeCampaign(campaignId) {
      marketingAutomationService.resumeCampaign(campaignId);
      this.loadData();
    },
    stopCampaign(campaignId) {
      if (confirm('Êtes-vous sûr de vouloir arrêter cette campagne ?')) {
        marketingAutomationService.stopCampaign(campaignId);
        this.loadData();
      }
    },
    viewCampaign(campaign) {
      // Implement campaign detail view
      console.log('Viewing campaign:', campaign);
    },
    calculateROI(campaign) {
      if (campaign.performance.cost === 0) return 0;
      return Math.round(((campaign.performance.revenue - campaign.performance.cost) / campaign.performance.cost) * 100);
    },
    getTemplateIcon(templateKey) {
      const icons = {
        leadNurturing: '🎯',
        reEngagement: '🔄',
        contentPromotion: '📢',
        seasonalCampaign: '🎊'
      };
      return icons[templateKey] || '🚀';
    },
    getStatusClass(status) {
      const classes = {
        active: 'bg-green-100 text-green-800',
        paused: 'bg-yellow-100 text-yellow-800',
        stopped: 'bg-red-100 text-red-800'
      };
      return classes[status] || 'bg-gray-100 text-gray-800';
    },
    getStatusText(status) {
      const texts = {
        active: 'Actif',
        paused: 'En pause',
        stopped: 'Arrêté'
      };
      return texts[status] || status;
    },
    getROIClass(roi) {
      if (roi > 100) return 'text-green-600';
      if (roi > 0) return 'text-yellow-600';
      return 'text-red-600';
    },
    formatDate(date) {
      return new Intl.DateTimeFormat('fr-FR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
      }).format(new Date(date));
    },
    formatNumber(num) {
      if (num >= 1000) {
        return (num / 1000).toFixed(1) + 'k';
      }
      return num.toString();
    }
  }
};
</script>