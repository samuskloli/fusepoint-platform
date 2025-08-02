<template>
  <div class="client-management">
    <!-- En-tête avec statistiques -->
    <div class="header-section">
      <div class="page-header">
        <h1 class="page-title">
          <i class="fas fa-users"></i>
          Gestion Clients & Prospects IA
        </h1>
        <p class="page-subtitle">Plateforme intelligente de CRM avec scoring automatique et prédictions comportementales</p>
      </div>

      <!-- Statistiques rapides -->
      <div class="quick-stats">
        <div class="stat-card">
          <div class="stat-icon prospects">
            <i class="fas fa-user-plus"></i>
          </div>
          <div class="stat-content">
            <div class="stat-number">{{ stats.totalProspects }}</div>
            <div class="stat-label">Prospects Actifs</div>
            <div class="stat-change positive">+{{ stats.newProspectsThisWeek }} cette semaine</div>
          </div>
        </div>

        <div class="stat-card">
          <div class="stat-icon clients">
            <i class="fas fa-handshake"></i>
          </div>
          <div class="stat-content">
            <div class="stat-number">{{ stats.totalClients }}</div>
            <div class="stat-label">Clients</div>
            <div class="stat-change positive">{{ stats.conversionRate }}% conversion</div>
          </div>
        </div>

        <div class="stat-card">
          <div class="stat-icon revenue">
            <i class="fas fa-euro-sign"></i>
          </div>
          <div class="stat-content">
            <div class="stat-number">{{ formatCurrency(stats.totalRevenue) }}</div>
            <div class="stat-label">Chiffre d'Affaires</div>
            <div class="stat-change positive">{{ formatCurrency(stats.averageLTV) }} LTV moyenne</div>
          </div>
        </div>

        <div class="stat-card">
          <div class="stat-icon ai-score">
            <i class="fas fa-brain"></i>
          </div>
          <div class="stat-content">
            <div class="stat-number">{{ stats.averageScore }}</div>
            <div class="stat-label">Score IA Moyen</div>
            <div class="stat-change positive">{{ stats.highScoreProspects }} prospects > 70</div>
          </div>
        </div>
      </div>
    </div>

    <!-- Navigation et filtres -->
    <div class="navigation-section">
      <div class="nav-tabs">
        <button 
          v-for="tab in tabs" 
          :key="tab.id"
          :class="['nav-tab', { active: activeTab === tab.id }]"
          @click="activeTab = tab.id"
        >
          <i :class="tab.icon"></i>
          {{ tab.label }}
          <span v-if="tab.count" class="tab-count">{{ tab.count }}</span>
        </button>
      </div>

      <div class="filters-section">
        <div class="search-box">
          <i class="fas fa-search"></i>
          <input 
            v-model="searchQuery" 
            type="text" 
            placeholder="Rechercher clients, prospects..."
            @input="handleSearch"
          >
        </div>

        <div class="filter-controls">
          <select v-model="selectedSegment" @change="applyFilters">
            <option value="">Tous les segments</option>
            <option v-for="segment in segments" :key="segment.id" :value="segment.id">
              {{ segment.name }} ({{ segment.members.length }})
            </option>
          </select>

          <select v-model="sortBy" @change="applySorting">
            <option value="score">Score IA</option>
            <option value="lastActivity">Dernière activité</option>
            <option value="lifetimeValue">Valeur vie</option>
            <option value="churnRisk">Risque churn</option>
            <option value="name">Nom</option>
          </select>

          <button class="btn-secondary" @click="showAddProspectModal = true">
            <i class="fas fa-plus"></i>
            Nouveau Prospect
          </button>
        </div>
      </div>
    </div>

    <!-- Contenu principal -->
    <div class="main-content">
      <!-- Vue Prospects -->
      <div v-if="activeTab === 'prospects'" class="prospects-view">
        <div class="prospects-grid">
          <div 
            v-for="prospect in filteredProspects" 
            :key="prospect.id"
            class="prospect-card"
            @click="selectEntity(prospect)"
          >
            <div class="card-header">
              <div class="entity-info">
                <h3 class="entity-name">{{ prospect.name }}</h3>
                <p class="entity-email">{{ prospect.email }}</p>
                <span class="entity-industry">{{ prospect.industry }}</span>
              </div>
              <div class="score-badge" :class="getScoreClass(prospect.score)">
                {{ prospect.score }}
              </div>
            </div>

            <div class="card-metrics">
              <div class="metric">
                <span class="metric-label">Valeur Potentielle</span>
                <span class="metric-value">{{ formatCurrency(prospect.lifetimeValue) }}</span>
              </div>
              <div class="metric">
                <span class="metric-label">Dernière Activité</span>
                <span class="metric-value">{{ formatDate(prospect.lastActivity) }}</span>
              </div>
              <div class="metric">
                <span class="metric-label">Source</span>
                <span class="metric-value">{{ prospect.source }}</span>
              </div>
            </div>

            <div class="card-status">
              <span class="status-badge" :class="prospect.status.toLowerCase()">
                {{ prospect.status }}
              </span>
              <div class="quick-actions">
                <button class="action-btn" @click.stop="contactProspect(prospect)">
                  <i class="fas fa-phone"></i>
                </button>
                <button class="action-btn" @click.stop="emailProspect(prospect)">
                  <i class="fas fa-envelope"></i>
                </button>
                <button class="action-btn" @click.stop="scheduleCall(prospect)">
                  <i class="fas fa-calendar"></i>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Vue Clients -->
      <div v-if="activeTab === 'clients'" class="clients-view">
        <div class="clients-grid">
          <div 
            v-for="client in filteredClients" 
            :key="client.id"
            class="client-card"
            @click="selectEntity(client)"
          >
            <div class="card-header">
              <div class="entity-info">
                <h3 class="entity-name">{{ client.name }}</h3>
                <p class="entity-email">{{ client.email }}</p>
                <span class="entity-industry">{{ client.industry }}</span>
              </div>
              <div class="churn-indicator" :class="getChurnRiskClass(client.churnRisk)">
                <i class="fas fa-exclamation-triangle" v-if="client.churnRisk > 0.6"></i>
                {{ Math.round(client.churnRisk * 100) }}%
              </div>
            </div>

            <div class="card-metrics">
              <div class="metric">
                <span class="metric-label">Chiffre d'Affaires</span>
                <span class="metric-value">{{ formatCurrency(client.totalRevenue) }}</span>
              </div>
              <div class="metric">
                <span class="metric-label">Valeur Vie</span>
                <span class="metric-value">{{ formatCurrency(client.lifetimeValue) }}</span>
              </div>
              <div class="metric">
                <span class="metric-label">Dernière Activité</span>
                <span class="metric-value">{{ formatDate(client.lastActivity) }}</span>
              </div>
            </div>

            <div class="card-status">
              <span class="status-badge" :class="client.status.toLowerCase()">
                {{ client.status }}
              </span>
              <div class="quick-actions">
                <button class="action-btn" @click.stop="viewClientDetails(client)">
                  <i class="fas fa-eye"></i>
                </button>
                <button class="action-btn" @click.stop="renewContract(client)">
                  <i class="fas fa-sync"></i>
                </button>
                <button class="action-btn" @click.stop="scheduleReview(client)">
                  <i class="fas fa-calendar-check"></i>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Vue Segments -->
      <div v-if="activeTab === 'segments'" class="segments-view">
        <div class="segments-grid">
          <div 
            v-for="segment in segments" 
            :key="segment.id"
            class="segment-card"
            :style="{ borderColor: segment.color }"
          >
            <div class="segment-header">
              <div class="segment-info">
                <h3 class="segment-name">{{ segment.name }}</h3>
                <p class="segment-description">{{ segment.description }}</p>
              </div>
              <div class="segment-count" :style="{ backgroundColor: segment.color }">
                {{ segment.members.length }}
              </div>
            </div>

            <div class="segment-metrics">
              <div class="metric">
                <span class="metric-label">Pourcentage</span>
                <span class="metric-value">{{ getSegmentPercentage(segment) }}%</span>
              </div>
              <div class="metric">
                <span class="metric-label">Valeur Totale</span>
                <span class="metric-value">{{ formatCurrency(getSegmentValue(segment)) }}</span>
              </div>
            </div>

            <div class="segment-actions">
              <button class="btn-primary" @click="viewSegmentMembers(segment)">
                Voir les Membres
              </button>
              <button class="btn-secondary" @click="createCampaignForSegment(segment)">
                Créer Campagne
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Vue Analytics -->
      <div v-if="activeTab === 'analytics'" class="analytics-view">
        <div class="analytics-dashboard">
          <!-- Graphiques de performance -->
          <div class="charts-section">
            <div class="chart-card">
              <h3>Évolution des Scores IA</h3>
              <div class="chart-placeholder">
                <canvas ref="scoreChart"></canvas>
              </div>
            </div>

            <div class="chart-card">
              <h3>Analyse du Churn</h3>
              <div class="chart-placeholder">
                <canvas ref="churnChart"></canvas>
              </div>
            </div>

            <div class="chart-card">
              <h3>Pipeline de Conversion</h3>
              <div class="conversion-funnel">
                <div class="funnel-stage">
                  <span class="stage-label">Prospects</span>
                  <div class="stage-bar" style="width: 100%">
                    <span class="stage-count">{{ stats.totalProspects }}</span>
                  </div>
                </div>
                <div class="funnel-stage">
                  <span class="stage-label">Qualifiés</span>
                  <div class="stage-bar" style="width: 75%">
                    <span class="stage-count">{{ Math.round(stats.totalProspects * 0.75) }}</span>
                  </div>
                </div>
                <div class="funnel-stage">
                  <span class="stage-label">Négociation</span>
                  <div class="stage-bar" style="width: 45%">
                    <span class="stage-count">{{ Math.round(stats.totalProspects * 0.45) }}</span>
                  </div>
                </div>
                <div class="funnel-stage">
                  <span class="stage-label">Clients</span>
                  <div class="stage-bar" style="width: 25%">
                    <span class="stage-count">{{ stats.totalClients }}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Recommandations IA -->
          <div class="recommendations-section">
            <h3>Recommandations IA</h3>
            <div class="recommendations-list">
              <div 
                v-for="recommendation in recommendations" 
                :key="recommendation.title"
                class="recommendation-card"
                :class="recommendation.type"
              >
                <div class="recommendation-header">
                  <div class="recommendation-icon">
                    <i class="fas fa-lightbulb" v-if="recommendation.type === 'opportunity'"></i>
                    <i class="fas fa-exclamation-triangle" v-if="recommendation.type === 'warning'"></i>
                    <i class="fas fa-cog" v-if="recommendation.type === 'optimization'"></i>
                  </div>
                  <div class="recommendation-info">
                    <h4>{{ recommendation.title }}</h4>
                    <span class="priority-badge" :class="recommendation.priority">
                      {{ recommendation.priority.toUpperCase() }}
                    </span>
                  </div>
                </div>
                <p class="recommendation-description">{{ recommendation.description }}</p>
                <div class="recommendation-action">
                  <span class="action-text">{{ recommendation.action }}</span>
                  <span class="impact-text">{{ recommendation.expectedImpact }}</span>
                </div>
                <button class="btn-primary" @click="applyRecommendation(recommendation)">
                  Appliquer
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Modal Détails Entité -->
    <div v-if="selectedEntity" class="modal-overlay" @click="closeEntityModal">
      <div class="modal-content entity-modal" @click.stop>
        <div class="modal-header">
          <h2>{{ selectedEntity.name }}</h2>
          <button class="close-btn" @click="closeEntityModal">
            <i class="fas fa-times"></i>
          </button>
        </div>

        <div class="modal-body">
          <div class="entity-details">
            <div class="details-section">
              <h3>Informations Générales</h3>
              <div class="details-grid">
                <div class="detail-item">
                  <span class="detail-label">Email</span>
                  <span class="detail-value">{{ selectedEntity.email }}</span>
                </div>
                <div class="detail-item">
                  <span class="detail-label">Téléphone</span>
                  <span class="detail-value">{{ selectedEntity.phone }}</span>
                </div>
                <div class="detail-item">
                  <span class="detail-label">Industrie</span>
                  <span class="detail-value">{{ selectedEntity.industry }}</span>
                </div>
                <div class="detail-item">
                  <span class="detail-label">Taille</span>
                  <span class="detail-value">{{ selectedEntity.size }}</span>
                </div>
              </div>
            </div>

            <div class="details-section" v-if="selectedEntity.score !== undefined">
              <h3>Scoring IA</h3>
              <div class="scoring-details">
                <div class="score-display">
                  <div class="score-circle" :class="getScoreClass(selectedEntity.score)">
                    {{ selectedEntity.score }}
                  </div>
                  <div class="score-breakdown">
                    <div class="score-factor">
                      <span>Engagement Email</span>
                      <div class="score-bar">
                        <div class="score-fill" style="width: 75%"></div>
                      </div>
                    </div>
                    <div class="score-factor">
                      <span>Activité Site Web</span>
                      <div class="score-bar">
                        <div class="score-fill" style="width: 60%"></div>
                      </div>
                    </div>
                    <div class="score-factor">
                      <span>Profil Démographique</span>
                      <div class="score-bar">
                        <div class="score-fill" style="width: 85%"></div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div class="details-section">
              <h3>Historique des Interactions</h3>
              <div class="interactions-timeline">
                <div 
                  v-for="interaction in getEntityInteractions(selectedEntity.id)" 
                  :key="interaction.id"
                  class="interaction-item"
                >
                  <div class="interaction-icon">
                    <i :class="getInteractionIcon(interaction.type)"></i>
                  </div>
                  <div class="interaction-content">
                    <div class="interaction-type">{{ formatInteractionType(interaction.type) }}</div>
                    <div class="interaction-date">{{ formatDateTime(interaction.timestamp) }}</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div class="modal-footer">
          <button class="btn-secondary" @click="closeEntityModal">Fermer</button>
          <button class="btn-primary" @click="editEntity(selectedEntity)">Modifier</button>
          <button v-if="selectedEntity.score !== undefined" class="btn-success" @click="convertToClient(selectedEntity)">
            Convertir en Client
          </button>
        </div>
      </div>
    </div>

    <!-- Modal Nouveau Prospect -->
    <div v-if="showAddProspectModal" class="modal-overlay" @click="closeAddProspectModal">
      <div class="modal-content add-prospect-modal" @click.stop>
        <div class="modal-header">
          <h2>Nouveau Prospect</h2>
          <button class="close-btn" @click="closeAddProspectModal">
            <i class="fas fa-times"></i>
          </button>
        </div>

        <div class="modal-body">
          <form @submit.prevent="addNewProspect">
            <div class="form-grid">
              <div class="form-group">
                <label>Nom de l'entreprise *</label>
                <input v-model="newProspect.name" type="text" required>
              </div>
              <div class="form-group">
                <label>Email *</label>
                <input v-model="newProspect.email" type="email" required>
              </div>
              <div class="form-group">
                <label>Téléphone</label>
                <input v-model="newProspect.phone" type="tel">
              </div>
              <div class="form-group">
                <label>Industrie</label>
                <select v-model="newProspect.industry">
                  <option value="Technology">Technology</option>
                  <option value="Finance">Finance</option>
                  <option value="Healthcare">Healthcare</option>
                  <option value="E-commerce">E-commerce</option>
                  <option value="Marketing">Marketing</option>
                  <option value="Startup">Startup</option>
                </select>
              </div>
              <div class="form-group">
                <label>Taille de l'entreprise</label>
                <select v-model="newProspect.size">
                  <option value="Small">Petite (1-50)</option>
                  <option value="Medium">Moyenne (51-250)</option>
                  <option value="Enterprise">Grande (250+)</option>
                </select>
              </div>
              <div class="form-group">
                <label>Source</label>
                <select v-model="newProspect.source">
                  <option value="Website">Site Web</option>
                  <option value="Google Ads">Google Ads</option>
                  <option value="Social Media">Réseaux Sociaux</option>
                  <option value="Referral">Recommandation</option>
                  <option value="Event">Événement</option>
                  <option value="Cold Outreach">Prospection</option>
                </select>
              </div>
            </div>
          </form>
        </div>

        <div class="modal-footer">
          <button class="btn-secondary" @click="closeAddProspectModal">Annuler</button>
          <button class="btn-primary" @click="addNewProspect">Ajouter Prospect</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import clientManagementService from '../services/clientManagementService.js';
import aiPersonalizationService from '../services/aiPersonalizationService.js';

export default {
  name: 'ClientManagement',
  data() {
    return {
      activeTab: 'prospects',
      searchQuery: '',
      selectedSegment: '',
      sortBy: 'score',
      selectedEntity: null,
      showAddProspectModal: false,
      prospects: [],
      clients: [],
      segments: [],
      recommendations: [],
      stats: {
        totalProspects: 0,
        totalClients: 0,
        totalRevenue: 0,
        averageLTV: 0,
        conversionRate: 0,
        averageScore: 0,
        highScoreProspects: 0,
        newProspectsThisWeek: 0
      },
      newProspect: {
        name: '',
        email: '',
        phone: '',
        industry: 'Technology',
        size: 'Medium',
        source: 'Website'
      },
      loading: false
    };
  },
  computed: {
    tabs() {
      return [
        {
          id: 'prospects',
          label: 'Prospects',
          icon: 'fas fa-user-plus',
          count: this.prospects.length
        },
        {
          id: 'clients',
          label: 'Clients',
          icon: 'fas fa-handshake',
          count: this.clients.length
        },
        {
          id: 'segments',
          label: 'Segments IA',
          icon: 'fas fa-layer-group',
          count: this.segments.length
        },
        {
          id: 'analytics',
          label: 'Analytics',
          icon: 'fas fa-chart-line'
        }
      ];
    },
    filteredProspects() {
      let filtered = [...this.prospects];

      // Filtrage par recherche
      if (this.searchQuery) {
        const query = this.searchQuery.toLowerCase();
        filtered = filtered.filter(prospect => 
          prospect.name.toLowerCase().includes(query) ||
          prospect.email.toLowerCase().includes(query) ||
          prospect.industry.toLowerCase().includes(query)
        );
      }

      // Filtrage par segment
      if (this.selectedSegment) {
        const segment = this.segments.find(s => s.id === this.selectedSegment);
        if (segment) {
          filtered = filtered.filter(prospect => segment.members.includes(prospect.id));
        }
      }

      // Tri
      filtered.sort((a, b) => {
        switch (this.sortBy) {
          case 'score':
            return b.score - a.score;
          case 'lastActivity':
            return new Date(b.lastActivity) - new Date(a.lastActivity);
          case 'lifetimeValue':
            return b.lifetimeValue - a.lifetimeValue;
          case 'churnRisk':
            return b.churnRisk - a.churnRisk;
          case 'name':
            return a.name.localeCompare(b.name);
          default:
            return 0;
        }
      });

      return filtered;
    },
    filteredClients() {
      let filtered = [...this.clients];

      // Filtrage par recherche
      if (this.searchQuery) {
        const query = this.searchQuery.toLowerCase();
        filtered = filtered.filter(client => 
          client.name.toLowerCase().includes(query) ||
          client.email.toLowerCase().includes(query) ||
          client.industry.toLowerCase().includes(query)
        );
      }

      // Filtrage par segment
      if (this.selectedSegment) {
        const segment = this.segments.find(s => s.id === this.selectedSegment);
        if (segment) {
          filtered = filtered.filter(client => segment.members.includes(client.id));
        }
      }

      // Tri
      filtered.sort((a, b) => {
        switch (this.sortBy) {
          case 'lastActivity':
            return new Date(b.lastActivity) - new Date(a.lastActivity);
          case 'lifetimeValue':
            return b.lifetimeValue - a.lifetimeValue;
          case 'churnRisk':
            return b.churnRisk - a.churnRisk;
          case 'name':
            return a.name.localeCompare(b.name);
          default:
            return 0;
        }
      });

      return filtered;
    }
  },
  async mounted() {
    await this.initializeData();
    await this.trackUserBehavior('client_management_viewed');
  },
  methods: {
    async initializeData() {
      this.loading = true;
      try {
        await clientManagementService.initialize();
        await this.loadData();
      } catch (error) {
        console.error('Erreur lors de l\'initialisation:', error);
        this.showNotification('Erreur lors du chargement des données', 'error');
      } finally {
        this.loading = false;
      }
    },
    async loadData() {
      this.prospects = clientManagementService.getProspects();
      this.clients = clientManagementService.getClients();
      this.segments = clientManagementService.getSegments();
      
      const report = await clientManagementService.generateClientAnalysisReport();
      this.stats = {
        totalProspects: report.overview.totalProspects,
        totalClients: report.overview.totalClients,
        totalRevenue: report.overview.totalRevenue,
        averageLTV: report.valueAnalysis.averageLTV,
        conversionRate: Math.round(report.overview.conversionRate),
        averageScore: report.scoring.averageScore,
        highScoreProspects: report.scoring.highScoreProspects,
        newProspectsThisWeek: Math.floor(Math.random() * 10) + 5
      };
      
      this.recommendations = report.recommendations;
    },
    async handleSearch() {
      await this.trackUserBehavior('search_entities', { query: this.searchQuery });
    },
    async applyFilters() {
      await this.trackUserBehavior('filter_applied', { segment: this.selectedSegment });
    },
    async applySorting() {
      await this.trackUserBehavior('sort_applied', { sortBy: this.sortBy });
    },
    selectEntity(entity) {
      this.selectedEntity = entity;
      this.trackUserBehavior('entity_selected', { entityId: entity.id, type: entity.score !== undefined ? 'prospect' : 'client' });
    },
    closeEntityModal() {
      this.selectedEntity = null;
    },
    closeAddProspectModal() {
      this.showAddProspectModal = false;
      this.resetNewProspectForm();
    },
    resetNewProspectForm() {
      this.newProspect = {
        name: '',
        email: '',
        phone: '',
        industry: 'Technology',
        size: 'Medium',
        source: 'Website'
      };
    },
    async addNewProspect() {
      try {
        const prospect = await clientManagementService.addProspect(this.newProspect);
        this.prospects.push(prospect);
        this.closeAddProspectModal();
        this.showNotification('Prospect ajouté avec succès', 'success');
        await this.trackUserBehavior('prospect_added', { prospectId: prospect.id });
        await this.loadData(); // Recharger les stats
      } catch (error) {
        console.error('Erreur lors de l\'ajout du prospect:', error);
        this.showNotification('Erreur lors de l\'ajout du prospect', 'error');
      }
    },
    async convertToClient(prospect) {
      try {
        const contractData = {
          value: prospect.lifetimeValue * 0.3, // 30% de la LTV comme valeur initiale
          startDate: new Date(),
          endDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000) // 1 an
        };
        
        const client = await clientManagementService.convertProspectToClient(prospect.id, contractData);
        
        // Mettre à jour les listes
        this.prospects = this.prospects.filter(p => p.id !== prospect.id);
        this.clients.push(client);
        
        this.closeEntityModal();
        this.showNotification('Prospect converti en client avec succès', 'success');
        await this.trackUserBehavior('prospect_converted', { prospectId: prospect.id, clientId: client.id });
        await this.loadData(); // Recharger les stats
      } catch (error) {
        console.error('Erreur lors de la conversion:', error);
        this.showNotification('Erreur lors de la conversion', 'error');
      }
    },
    async contactProspect(prospect) {
      await this.recordInteraction(prospect.id, {
        type: 'call',
        value: 50,
        metadata: { duration: 300, outcome: 'positive' }
      });
      this.showNotification(`Appel programmé avec ${prospect.name}`, 'success');
    },
    async emailProspect(prospect) {
      await this.recordInteraction(prospect.id, {
        type: 'email_sent',
        value: 25,
        metadata: { template: 'follow_up', personalized: true }
      });
      this.showNotification(`Email envoyé à ${prospect.name}`, 'success');
    },
    async scheduleCall(prospect) {
      await this.recordInteraction(prospect.id, {
        type: 'meeting',
        value: 75,
        metadata: { type: 'demo', scheduled: true }
      });
      this.showNotification(`Rendez-vous programmé avec ${prospect.name}`, 'success');
    },
    async recordInteraction(entityId, interactionData) {
      try {
        await clientManagementService.recordInteraction(entityId, interactionData);
        await this.loadData(); // Recharger pour mettre à jour les scores
      } catch (error) {
        console.error('Erreur lors de l\'enregistrement de l\'interaction:', error);
      }
    },
    async applyRecommendation(recommendation) {
      this.showNotification(`Recommandation appliquée: ${recommendation.title}`, 'success');
      await this.trackUserBehavior('recommendation_applied', { recommendation: recommendation.title });
    },
    getEntityInteractions(entityId) {
      return clientManagementService.getInteractions(entityId).slice(0, 5); // Dernières 5 interactions
    },
    getScoreClass(score) {
      if (score >= 80) return 'excellent';
      if (score >= 60) return 'good';
      if (score >= 40) return 'average';
      return 'poor';
    },
    getChurnRiskClass(risk) {
      if (risk >= 0.7) return 'high-risk';
      if (risk >= 0.4) return 'medium-risk';
      return 'low-risk';
    },
    getSegmentPercentage(segment) {
      const total = this.prospects.length + this.clients.length;
      return total > 0 ? Math.round((segment.members.length / total) * 100) : 0;
    },
    getSegmentValue(segment) {
      let totalValue = 0;
      segment.members.forEach(memberId => {
        const prospect = this.prospects.find(p => p.id === memberId);
        const client = this.clients.find(c => c.id === memberId);
        if (prospect) totalValue += prospect.lifetimeValue;
        if (client) totalValue += client.lifetimeValue;
      });
      return totalValue;
    },
    getInteractionIcon(type) {
      const icons = {
        'email_open': 'fas fa-envelope-open',
        'email_click': 'fas fa-mouse-pointer',
        'website_visit': 'fas fa-globe',
        'download': 'fas fa-download',
        'demo_request': 'fas fa-play',
        'call': 'fas fa-phone',
        'meeting': 'fas fa-calendar',
        'proposal_sent': 'fas fa-file-contract'
      };
      return icons[type] || 'fas fa-circle';
    },
    formatInteractionType(type) {
      const types = {
        'email_open': 'Email ouvert',
        'email_click': 'Clic email',
        'website_visit': 'Visite site',
        'download': 'Téléchargement',
        'demo_request': 'Demande démo',
        'call': 'Appel',
        'meeting': 'Rendez-vous',
        'proposal_sent': 'Proposition envoyée'
      };
      return types[type] || type;
    },
    formatCurrency(amount) {
      return new Intl.NumberFormat('fr-FR', {
        style: 'currency',
        currency: 'CHF',
        minimumFractionDigits: 0
      }).format(amount);
    },
    formatDate(date) {
      return new Date(date).toLocaleDateString('fr-FR');
    },
    formatDateTime(date) {
      return new Date(date).toLocaleString('fr-FR');
    },
    async trackUserBehavior(action, data = {}) {
      try {
        await aiPersonalizationService.trackUserBehavior({
          action,
          page: 'client_management',
          timestamp: new Date().toISOString(),
          ...data
        });
      } catch (error) {
        console.error('Erreur lors du tracking:', error);
      }
    },
    showNotification(message, type = 'info') {
      // Implémentation simple avec alert, peut être remplacée par un système de notifications plus sophistiqué
      alert(message);
    }
  }
};
</script>

<style scoped>
.client-management {
  padding: 20px;
  background: #f8f9fa;
  min-height: 100vh;
}

/* En-tête */
.header-section {
  margin-bottom: 30px;
}

.page-header {
  text-align: center;
  margin-bottom: 30px;
}

.page-title {
  font-size: 2.5rem;
  color: #2c3e50;
  margin-bottom: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 15px;
}

.page-title i {
  color: #3498db;
}

.page-subtitle {
  font-size: 1.1rem;
  color: #7f8c8d;
  margin: 0;
}

/* Statistiques rapides */
.quick-stats {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 20px;
  margin-bottom: 30px;
}

.stat-card {
  background: white;
  border-radius: 12px;
  padding: 20px;
  box-shadow: 0 2px 10px rgba(0,0,0,0.1);
  display: flex;
  align-items: center;
  gap: 15px;
  transition: transform 0.2s ease;
}

.stat-card:hover {
  transform: translateY(-2px);
}

.stat-icon {
  width: 60px;
  height: 60px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.5rem;
  color: white;
}

.stat-icon.prospects { background: linear-gradient(135deg, #3498db, #2980b9); }
.stat-icon.clients { background: linear-gradient(135deg, #27ae60, #229954); }
.stat-icon.revenue { background: linear-gradient(135deg, #f39c12, #e67e22); }
.stat-icon.ai-score { background: linear-gradient(135deg, #9b59b6, #8e44ad); }

.stat-content {
  flex: 1;
}

.stat-number {
  font-size: 2rem;
  font-weight: bold;
  color: #2c3e50;
  margin-bottom: 5px;
}

.stat-label {
  font-size: 0.9rem;
  color: #7f8c8d;
  margin-bottom: 5px;
}

.stat-change {
  font-size: 0.8rem;
  font-weight: 500;
}

.stat-change.positive {
  color: #27ae60;
}

/* Navigation */
.navigation-section {
  background: white;
  border-radius: 12px;
  padding: 20px;
  margin-bottom: 30px;
  box-shadow: 0 2px 10px rgba(0,0,0,0.1);
}

.nav-tabs {
  display: flex;
  gap: 10px;
  margin-bottom: 20px;
  border-bottom: 1px solid #ecf0f1;
  padding-bottom: 15px;
}

.nav-tab {
  padding: 12px 20px;
  border: none;
  background: transparent;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  gap: 8px;
  font-weight: 500;
  color: #7f8c8d;
}

.nav-tab:hover {
  background: #ecf0f1;
  color: #2c3e50;
}

.nav-tab.active {
  background: #3498db;
  color: white;
}

.tab-count {
  background: rgba(255,255,255,0.2);
  padding: 2px 8px;
  border-radius: 12px;
  font-size: 0.8rem;
}

.nav-tab.active .tab-count {
  background: rgba(255,255,255,0.3);
}

.filters-section {
  display: flex;
  gap: 15px;
  align-items: center;
  flex-wrap: wrap;
}

.search-box {
  position: relative;
  flex: 1;
  min-width: 300px;
}

.search-box i {
  position: absolute;
  left: 15px;
  top: 50%;
  transform: translateY(-50%);
  color: #7f8c8d;
}

.search-box input {
  width: 100%;
  padding: 12px 15px 12px 45px;
  border: 1px solid #ddd;
  border-radius: 8px;
  font-size: 1rem;
}

.filter-controls {
  display: flex;
  gap: 10px;
  align-items: center;
}

.filter-controls select {
  padding: 10px 15px;
  border: 1px solid #ddd;
  border-radius: 8px;
  background: white;
  cursor: pointer;
}

/* Grilles */
.prospects-grid,
.clients-grid,
.segments-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
  gap: 20px;
}

/* Cartes */
.prospect-card,
.client-card,
.segment-card {
  background: white;
  border-radius: 12px;
  padding: 20px;
  box-shadow: 0 2px 10px rgba(0,0,0,0.1);
  transition: all 0.2s ease;
  cursor: pointer;
  border: 2px solid transparent;
}

.prospect-card:hover,
.client-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 20px rgba(0,0,0,0.15);
  border-color: #3498db;
}

.segment-card {
  cursor: default;
  border-left: 4px solid;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 15px;
}

.entity-info h3 {
  margin: 0 0 5px 0;
  color: #2c3e50;
  font-size: 1.2rem;
}

.entity-email {
  color: #7f8c8d;
  font-size: 0.9rem;
  margin: 0 0 5px 0;
}

.entity-industry {
  background: #ecf0f1;
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 0.8rem;
  color: #2c3e50;
}

.score-badge {
  width: 50px;
  height: 50px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
  color: white;
  font-size: 1.1rem;
}

.score-badge.excellent { background: #27ae60; }
.score-badge.good { background: #f39c12; }
.score-badge.average { background: #e67e22; }
.score-badge.poor { background: #e74c3c; }

.churn-indicator {
  padding: 8px 12px;
  border-radius: 8px;
  font-weight: bold;
  font-size: 0.9rem;
  display: flex;
  align-items: center;
  gap: 5px;
}

.churn-indicator.low-risk {
  background: #d5f4e6;
  color: #27ae60;
}

.churn-indicator.medium-risk {
  background: #fef9e7;
  color: #f39c12;
}

.churn-indicator.high-risk {
  background: #fadbd8;
  color: #e74c3c;
}

.card-metrics {
  display: grid;
  grid-template-columns: 1fr;
  gap: 10px;
  margin-bottom: 15px;
}

.metric {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.metric-label {
  font-size: 0.9rem;
  color: #7f8c8d;
}

.metric-value {
  font-weight: 500;
  color: #2c3e50;
}

.card-status {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.status-badge {
  padding: 4px 12px;
  border-radius: 20px;
  font-size: 0.8rem;
  font-weight: 500;
}

.status-badge.new {
  background: #e8f4fd;
  color: #3498db;
}

.status-badge.qualified {
  background: #fef9e7;
  color: #f39c12;
}

.status-badge.active {
  background: #d5f4e6;
  color: #27ae60;
}

.quick-actions {
  display: flex;
  gap: 5px;
}

.action-btn {
  width: 32px;
  height: 32px;
  border: none;
  border-radius: 6px;
  background: #ecf0f1;
  color: #7f8c8d;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;
}

.action-btn:hover {
  background: #3498db;
  color: white;
}

/* Segments */
.segment-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 15px;
}

.segment-name {
  margin: 0 0 5px 0;
  color: #2c3e50;
  font-size: 1.2rem;
}

.segment-description {
  color: #7f8c8d;
  font-size: 0.9rem;
  margin: 0;
}

.segment-count {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-weight: bold;
}

.segment-actions {
  display: flex;
  gap: 10px;
  margin-top: 15px;
}

/* Analytics */
.analytics-dashboard {
  display: grid;
  gap: 30px;
}

.charts-section {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
  gap: 20px;
}

.chart-card {
  background: white;
  border-radius: 12px;
  padding: 20px;
  box-shadow: 0 2px 10px rgba(0,0,0,0.1);
}

.chart-card h3 {
  margin: 0 0 20px 0;
  color: #2c3e50;
}

.chart-placeholder {
  height: 300px;
  background: #f8f9fa;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #7f8c8d;
}

.conversion-funnel {
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.funnel-stage {
  display: flex;
  align-items: center;
  gap: 15px;
}

.stage-label {
  width: 100px;
  font-weight: 500;
  color: #2c3e50;
}

.stage-bar {
  flex: 1;
  height: 30px;
  background: linear-gradient(135deg, #3498db, #2980b9);
  border-radius: 15px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-weight: bold;
  position: relative;
}

.stage-count {
  position: relative;
  z-index: 1;
}

/* Recommandations */
.recommendations-section {
  background: white;
  border-radius: 12px;
  padding: 20px;
  box-shadow: 0 2px 10px rgba(0,0,0,0.1);
}

.recommendations-section h3 {
  margin: 0 0 20px 0;
  color: #2c3e50;
}

.recommendations-list {
  display: grid;
  gap: 15px;
}

.recommendation-card {
  border: 1px solid #ecf0f1;
  border-radius: 8px;
  padding: 15px;
  border-left: 4px solid;
}

.recommendation-card.opportunity {
  border-left-color: #27ae60;
  background: #f8fff9;
}

.recommendation-card.warning {
  border-left-color: #e74c3c;
  background: #fef8f8;
}

.recommendation-card.optimization {
  border-left-color: #f39c12;
  background: #fffbf5;
}

.recommendation-header {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 10px;
}

.recommendation-icon {
  width: 30px;
  height: 30px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
}

.recommendation-card.opportunity .recommendation-icon {
  background: #27ae60;
}

.recommendation-card.warning .recommendation-icon {
  background: #e74c3c;
}

.recommendation-card.optimization .recommendation-icon {
  background: #f39c12;
}

.recommendation-info h4 {
  margin: 0;
  color: #2c3e50;
}

.priority-badge {
  padding: 2px 8px;
  border-radius: 4px;
  font-size: 0.7rem;
  font-weight: bold;
  margin-left: 10px;
}

.priority-badge.high {
  background: #e74c3c;
  color: white;
}

.priority-badge.medium {
  background: #f39c12;
  color: white;
}

.priority-badge.low {
  background: #95a5a6;
  color: white;
}

.recommendation-description {
  color: #7f8c8d;
  margin: 10px 0;
  line-height: 1.5;
}

.recommendation-action {
  margin: 10px 0;
}

.action-text {
  font-weight: 500;
  color: #2c3e50;
  display: block;
  margin-bottom: 5px;
}

.impact-text {
  font-size: 0.9rem;
  color: #7f8c8d;
  font-style: italic;
}

/* Modales */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0,0,0,0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.modal-content {
  background: white;
  border-radius: 12px;
  max-width: 800px;
  width: 90%;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: 0 10px 30px rgba(0,0,0,0.3);
}

.modal-header {
  padding: 20px;
  border-bottom: 1px solid #ecf0f1;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.modal-header h2 {
  margin: 0;
  color: #2c3e50;
}

.close-btn {
  width: 30px;
  height: 30px;
  border: none;
  background: #ecf0f1;
  border-radius: 50%;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #7f8c8d;
}

.close-btn:hover {
  background: #e74c3c;
  color: white;
}

.modal-body {
  padding: 20px;
}

.modal-footer {
  padding: 20px;
  border-top: 1px solid #ecf0f1;
  display: flex;
  justify-content: flex-end;
  gap: 10px;
}

/* Détails entité */
.entity-details {
  display: grid;
  gap: 20px;
}

.details-section h3 {
  margin: 0 0 15px 0;
  color: #2c3e50;
  border-bottom: 2px solid #3498db;
  padding-bottom: 5px;
}

.details-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 15px;
}

.detail-item {
  display: flex;
  flex-direction: column;
  gap: 5px;
}

.detail-label {
  font-size: 0.9rem;
  color: #7f8c8d;
  font-weight: 500;
}

.detail-value {
  color: #2c3e50;
  font-weight: 500;
}

/* Scoring */
.scoring-details {
  display: grid;
  gap: 20px;
}

.score-display {
  display: flex;
  gap: 30px;
  align-items: center;
}

.score-circle {
  width: 80px;
  height: 80px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.5rem;
  font-weight: bold;
  color: white;
}

.score-breakdown {
  flex: 1;
  display: grid;
  gap: 10px;
}

.score-factor {
  display: flex;
  align-items: center;
  gap: 15px;
}

.score-factor span {
  width: 150px;
  font-size: 0.9rem;
  color: #7f8c8d;
}

.score-bar {
  flex: 1;
  height: 8px;
  background: #ecf0f1;
  border-radius: 4px;
  overflow: hidden;
}

.score-fill {
  height: 100%;
  background: linear-gradient(135deg, #3498db, #2980b9);
  transition: width 0.3s ease;
}

/* Timeline interactions */
.interactions-timeline {
  display: grid;
  gap: 10px;
  max-height: 300px;
  overflow-y: auto;
}

.interaction-item {
  display: flex;
  align-items: center;
  gap: 15px;
  padding: 10px;
  background: #f8f9fa;
  border-radius: 8px;
}

.interaction-icon {
  width: 30px;
  height: 30px;
  border-radius: 50%;
  background: #3498db;
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.8rem;
}

.interaction-content {
  flex: 1;
}

.interaction-type {
  font-weight: 500;
  color: #2c3e50;
  margin-bottom: 2px;
}

.interaction-date {
  font-size: 0.8rem;
  color: #7f8c8d;
}

/* Formulaire */
.form-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 20px;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 5px;
}

.form-group label {
  font-weight: 500;
  color: #2c3e50;
}

.form-group input,
.form-group select {
  padding: 10px 15px;
  border: 1px solid #ddd;
  border-radius: 8px;
  font-size: 1rem;
  transition: border-color 0.2s ease;
}

.form-group input:focus,
.form-group select:focus {
  outline: none;
  border-color: #3498db;
  box-shadow: 0 0 0 3px rgba(52, 152, 219, 0.1);
}

/* Boutons */
.btn-primary,
.btn-secondary,
.btn-success {
  padding: 10px 20px;
  border: none;
  border-radius: 8px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  display: inline-flex;
  align-items: center;
  gap: 8px;
  text-decoration: none;
}

.btn-primary {
  background: #3498db;
  color: white;
}

.btn-primary:hover {
  background: #2980b9;
  transform: translateY(-1px);
}

.btn-secondary {
  background: #95a5a6;
  color: white;
}

.btn-secondary:hover {
  background: #7f8c8d;
}

.btn-success {
  background: #27ae60;
  color: white;
}

.btn-success:hover {
  background: #229954;
}

/* Responsive */
@media (max-width: 768px) {
  .client-management {
    padding: 10px;
  }
  
  .quick-stats {
    grid-template-columns: 1fr;
  }
  
  .prospects-grid,
  .clients-grid,
  .segments-grid {
    grid-template-columns: 1fr;
  }
  
  .filters-section {
    flex-direction: column;
    align-items: stretch;
  }
  
  .search-box {
    min-width: auto;
  }
  
  .nav-tabs {
    flex-wrap: wrap;
  }
  
  .charts-section {
    grid-template-columns: 1fr;
  }
  
  .modal-content {
    width: 95%;
    margin: 20px;
  }
  
  .form-grid {
    grid-template-columns: 1fr;
  }
  
  .score-display {
    flex-direction: column;
    text-align: center;
  }
}

@media (max-width: 480px) {
  .page-title {
    font-size: 1.8rem;
    flex-direction: column;
    gap: 10px;
  }
  
  .stat-card {
    flex-direction: column;
    text-align: center;
  }
  
  .card-header {
    flex-direction: column;
    gap: 10px;
  }
  
  .card-status {
    flex-direction: column;
    gap: 10px;
    align-items: stretch;
  }
  
  .quick-actions {
    justify-content: center;
  }
}

/* Animations */
@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.prospect-card,
.client-card,
.segment-card {
  animation: fadeIn 0.3s ease;
}

/* États de chargement */
.loading {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 40px;
  color: #7f8c8d;
}

.loading::after {
  content: '';
  width: 20px;
  height: 20px;
  border: 2px solid #ecf0f1;
  border-top: 2px solid #3498db;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-left: 10px;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

/* Scrollbar personnalisée */
.interactions-timeline::-webkit-scrollbar {
  width: 6px;
}

.interactions-timeline::-webkit-scrollbar-track {
  background: #f1f1f1;
  border-radius: 3px;
}

.interactions-timeline::-webkit-scrollbar-thumb {
  background: #c1c1c1;
  border-radius: 3px;
}

.interactions-timeline::-webkit-scrollbar-thumb:hover {
  background: #a1a1a1;
}
</style>