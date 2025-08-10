/**
 * Service de Gestion des Clients et Prospects avec IA
 * Intègre des fonctionnalités avancées de CRM, scoring automatique,
 * segmentation intelligente et prédictions de comportement
 */

// import googleAnalyticsService from './googleAnalyticsService.js'; // Google Analytics integration removed
import aiPersonalizationService from './aiPersonalizationService.js';
import predictiveAnalyticsService from './predictiveAnalyticsService.js';
import authService from '@/services/authService'

class ClientManagementService {
  constructor() {
    this.clients = new Map();
    this.prospects = new Map();
    this.interactions = new Map();
    this.segments = new Map();
    this.scoringModels = {
      leadScoring: {
        name: 'Lead Scoring IA',
        accuracy: 0.89,
        factors: [
          { name: 'Engagement Email', weight: 0.25 },
          { name: 'Activité Site Web', weight: 0.30 },
          { name: 'Profil Démographique', weight: 0.20 },
          { name: 'Comportement Social', weight: 0.15 },
          { name: 'Historique Achats', weight: 0.10 }
        ]
      },
      churnRisk: {
        name: 'Risque de Churn',
        accuracy: 0.92,
        factors: [
          { name: 'Fréquence Connexion', weight: 0.35 },
          { name: 'Utilisation Produit', weight: 0.30 },
          { name: 'Support Tickets', weight: 0.20 },
          { name: 'Satisfaction Score', weight: 0.15 }
        ]
      },
      lifetimeValue: {
        name: 'Valeur Vie Client',
        accuracy: 0.87,
        factors: [
          { name: 'Historique Achats', weight: 0.40 },
          { name: 'Fréquence Achats', weight: 0.25 },
          { name: 'Panier Moyen', weight: 0.20 },
          { name: 'Fidélité', weight: 0.15 }
        ]
      }
    };
    
    this.automationRules = new Map();
    this.initialized = false;
  }

  /**
   * Initialise le service avec les données existantes
   */
  async initialize() {
    if (this.initialized) return;

    try {
      await this.loadExistingData();
      await this.initializeAIModels();
      await this.setupAutomationRules();
      this.initialized = true;
      console.log('Service de gestion clients initialisé avec succès');
    } catch (error) {
        if (error.response?.status === 401) {
          router.push('/login');
          return;
        }
      console.error('Erreur lors de l\'initialisation du service clients:', error);
      throw error;
    }
  }

  /**
   * Charge les données existantes depuis diverses sources
   */
  async loadExistingData() {
    try {
      // Charger les clients depuis l'API
      const clientsResponse = await this.getAssignedClients();
      if (clientsResponse.success) {
        clientsResponse.data.forEach(client => {
          this.clients.set(client.id, client);
        });
      }

      // Charger les prospects depuis l'API
      const prospectsResponse = await this.getProspects();
      if (prospectsResponse.success) {
        prospectsResponse.data.forEach(prospect => {
          this.prospects.set(prospect.id, prospect);
        });
      }

      // Charger les interactions depuis l'API
      await this.loadInteractions();
    } catch (error) {
        if (error.response?.status === 401) {
          router.push('/login');
          return;
        }
      console.error('Erreur lors du chargement des données:', error);
    }
  }

  /**
   * Charge les interactions depuis l'API
   */
  async loadInteractions() {
    try {
      const token = localStorage.getItem('accessToken') || localStorage.getItem('token');
      if (!token) {
        throw new Error('Token d\'authentification manquant');
      }

      const response = await fetch('/api/agent/interactions', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      const data = await response.data;
      
      // Organiser les interactions par entité (client/prospect)
      if (data.interactions) {
        data.interactions.forEach(interaction => {
          const entityId = interaction.clientId || interaction.prospectId;
          if (entityId) {
            if (!this.interactions.has(entityId)) {
              this.interactions.set(entityId, []);
            }
            this.interactions.get(entityId).push(interaction);
          }
        });
      }
    } catch (error) {
        if (error.response?.status === 401) {
          router.push('/login');
          return;
        }
      console.error('Erreur lors du chargement des interactions:', error);
    }
  }

  /**
   * Initialise les modèles d'IA
   */
  async initializeAIModels() {
    // Simuler l'entraînement des modèles
    console.log('Initialisation des modèles IA pour la gestion clients...');
    
    // Calculer les scores pour tous les prospects
    for (const [prospectId, prospect] of this.prospects) {
      prospect.score = await this.calculateLeadScore(prospectId);
      prospect.churnRisk = await this.calculateChurnRisk(prospectId);
      prospect.lifetimeValue = await this.calculateLifetimeValue(prospectId);
    }

    // Calculer les scores pour tous les clients
    for (const [clientId, client] of this.clients) {
      client.churnRisk = await this.calculateChurnRisk(clientId);
      client.lifetimeValue = await this.calculateLifetimeValue(clientId);
    }

    // Créer des segments automatiques
    await this.createAutomaticSegments();
  }

  /**
   * Configure les règles d'automatisation
   */
  async setupAutomationRules() {
    const rules = [
      {
        id: 'high_score_prospect',
        name: 'Prospect Score Élevé',
        condition: (prospect) => prospect.score > 80,
        action: 'assign_to_sales',
        priority: 'high'
      },
      {
        id: 'inactive_prospect',
        name: 'Prospect Inactif',
        condition: (prospect) => {
          const daysSinceLastActivity = (Date.now() - prospect.lastActivity) / (1000 * 60 * 60 * 24);
          return daysSinceLastActivity > 7;
        },
        action: 'send_reengagement_email',
        priority: 'medium'
      },
      {
        id: 'high_churn_risk',
        name: 'Risque de Churn Élevé',
        condition: (client) => client.churnRisk > 0.7,
        action: 'schedule_retention_call',
        priority: 'high'
      },
      {
        id: 'high_value_client',
        name: 'Client Haute Valeur',
        condition: (client) => client.lifetimeValue > 100000,
        action: 'assign_account_manager',
        priority: 'high'
      }
    ];

    rules.forEach(rule => {
      this.automationRules.set(rule.id, rule);
    });
  }

  /**
   * Calcule le score de lead pour un prospect
   */
  async calculateLeadScore(prospectId) {
    const prospect = this.prospects.get(prospectId);
    if (!prospect) return 0;

    const interactions = this.interactions.get(prospectId) || [];
    let score = 0;

    // Score basé sur l'engagement email
    const emailInteractions = interactions.filter(i => i.type.includes('email'));
    const emailScore = Math.min(emailInteractions.length * 10, 25);
    score += emailScore * 0.25;

    // Score basé sur l'activité site web
    const webInteractions = interactions.filter(i => i.type === 'website_visit');
    const webScore = Math.min(webInteractions.length * 8, 30);
    score += webScore * 0.30;

    // Score basé sur le profil démographique
    let demoScore = 0;
    if (prospect.industry === 'Technology') demoScore += 20;
    if (prospect.size === 'Enterprise') demoScore += 15;
    if (prospect.size === 'Medium') demoScore += 10;
    score += demoScore * 0.20;

    // Score basé sur les actions à haute valeur
    const highValueActions = interactions.filter(i => 
      ['demo_request', 'proposal_sent', 'meeting'].includes(i.type)
    );
    const actionScore = Math.min(highValueActions.length * 15, 15);
    score += actionScore * 0.15;

    // Score basé sur la récence
    const daysSinceLastActivity = (Date.now() - prospect.lastActivity) / (1000 * 60 * 60 * 24);
    const recencyScore = Math.max(0, 10 - daysSinceLastActivity);
    score += recencyScore * 0.10;

    return Math.min(Math.round(score), 100);
  }

  /**
   * Calcule le risque de churn
   */
  async calculateChurnRisk(entityId) {
    const entity = this.clients.get(entityId) || this.prospects.get(entityId);
    if (!entity) return 0;

    let riskScore = 0;

    // Fréquence de connexion/activité
    const daysSinceLastActivity = (Date.now() - entity.lastActivity) / (1000 * 60 * 60 * 24);
    if (daysSinceLastActivity > 30) riskScore += 0.4;
    else if (daysSinceLastActivity > 14) riskScore += 0.2;
    else if (daysSinceLastActivity > 7) riskScore += 0.1;

    // Utilisation du produit (simulé)
    const usageScore = Math.random() * 0.3;
    riskScore += usageScore;

    // Support tickets (simulé)
    const supportIssues = Math.random() > 0.8 ? 0.2 : 0;
    riskScore += supportIssues;

    // Satisfaction (simulé)
    const satisfactionScore = Math.random() * 0.15;
    riskScore += satisfactionScore;

    return Math.min(riskScore, 1);
  }

  /**
   * Calcule la valeur vie client
   */
  async calculateLifetimeValue(entityId) {
    const entity = this.clients.get(entityId) || this.prospects.get(entityId);
    if (!entity) return 0;

    // Pour les clients existants
    if (this.clients.has(entityId)) {
      const client = entity;
      const monthlyRevenue = client.totalRevenue / 12;
      const retentionRate = 1 - (client.churnRisk || 0.1);
      const averageLifespan = 1 / (1 - retentionRate);
      return Math.round(monthlyRevenue * averageLifespan * 12);
    }

    // Pour les prospects
    const prospect = entity;
    let baseValue = 0;

    // Valeur basée sur la taille de l'entreprise
    switch (prospect.size) {
      case 'Enterprise':
        baseValue = 100000;
        break;
      case 'Medium':
        baseValue = 50000;
        break;
      case 'Small':
        baseValue = 20000;
        break;
      default:
        baseValue = 10000;
    }

    // Ajustement basé sur l'industrie
    const industryMultiplier = {
      'Technology': 1.5,
      'Finance': 1.3,
      'Healthcare': 1.2,
      'E-commerce': 1.1,
      'Marketing': 1.0,
      'Startup': 0.8
    };

    const multiplier = industryMultiplier[prospect.industry] || 1.0;
    const scoreMultiplier = (prospect.score || 50) / 100;

    return Math.round(baseValue * multiplier * scoreMultiplier);
  }

  /**
   * Crée des segments automatiques basés sur l'IA
   */
  async createAutomaticSegments() {
    const segments = {
      'high_value_prospects': {
        name: 'Prospects Haute Valeur',
        description: 'Prospects avec score élevé et forte valeur potentielle',
        criteria: (entity) => entity.score > 70 && entity.lifetimeValue > 50000,
        color: '#00b894',
        members: []
      },
      'at_risk_clients': {
        name: 'Clients à Risque',
        description: 'Clients avec risque de churn élevé',
        criteria: (entity) => entity.churnRisk > 0.6,
        color: '#e17055',
        members: []
      },
      'enterprise_prospects': {
        name: 'Prospects Enterprise',
        description: 'Grandes entreprises avec potentiel élevé',
        criteria: (entity) => entity.size === 'Enterprise',
        color: '#74b9ff',
        members: []
      },
      'inactive_prospects': {
        name: 'Prospects Inactifs',
        description: 'Prospects sans activité récente',
        criteria: (entity) => {
          const daysSinceLastActivity = (Date.now() - entity.lastActivity) / (1000 * 60 * 60 * 24);
          return daysSinceLastActivity > 14;
        },
        color: '#fdcb6e',
        members: []
      },
      'vip_clients': {
        name: 'Clients VIP',
        description: 'Clients avec la plus haute valeur vie',
        criteria: (entity) => entity.lifetimeValue > 100000,
        color: '#a29bfe',
        members: []
      }
    };

    // Assigner les entités aux segments
    [...this.prospects.values(), ...this.clients.values()].forEach(entity => {
      Object.keys(segments).forEach(segmentId => {
        const segment = segments[segmentId];
        if (segment.criteria(entity)) {
          segment.members.push(entity.id);
        }
      });
    });

    // Sauvegarder les segments
    Object.keys(segments).forEach(segmentId => {
      this.segments.set(segmentId, segments[segmentId]);
    });
  }

  /**
   * Ajoute un nouveau prospect
   */
  async addProspect(prospectData) {
    const prospect = {
      id: `prospect_${Date.now()}`,
      ...prospectData,
      status: 'New',
      createdAt: new Date(),
      lastActivity: new Date(),
      score: 0,
      interactions: []
    };

    this.prospects.set(prospect.id, prospect);
    this.interactions.set(prospect.id, []);

    // Calculer le score initial
    prospect.score = await this.calculateLeadScore(prospect.id);
    prospect.churnRisk = await this.calculateChurnRisk(prospect.id);
    prospect.lifetimeValue = await this.calculateLifetimeValue(prospect.id);

    // Appliquer les règles d'automatisation
    await this.applyAutomationRules(prospect);

    // Mettre à jour les segments
    await this.updateSegments();

    return prospect;
  }

  /**
   * Convertit un prospect en client
   */
  async convertProspectToClient(prospectId, contractData) {
    const prospect = this.prospects.get(prospectId);
    if (!prospect) {
      throw new Error('Prospect non trouvé');
    }

    const client = {
      ...prospect,
      id: `client_${Date.now()}`,
      status: 'Active',
      totalRevenue: contractData.value,
      contracts: [{
        id: `contract_${Date.now()}`,
        ...contractData,
        status: 'Active'
      }]
    };

    // Supprimer le prospect et ajouter le client
    this.prospects.delete(prospectId);
    this.clients.set(client.id, client);

    // Transférer les interactions
    const interactions = this.interactions.get(prospectId) || [];
    this.interactions.delete(prospectId);
    this.interactions.set(client.id, interactions);

    // Recalculer les métriques
    client.churnRisk = await this.calculateChurnRisk(client.id);
    client.lifetimeValue = await this.calculateLifetimeValue(client.id);

    // Mettre à jour les segments
    await this.updateSegments();

    return client;
  }

  /**
   * Enregistre une nouvelle interaction
   */
  async recordInteraction(entityId, interactionData) {
    const interaction = {
      id: `interaction_${Date.now()}`,
      entityId,
      timestamp: new Date(),
      ...interactionData
    };

    const interactions = this.interactions.get(entityId) || [];
    interactions.push(interaction);
    this.interactions.set(entityId, interactions);

    // Mettre à jour l'activité de l'entité
    const entity = this.prospects.get(entityId) || this.clients.get(entityId);
    if (entity) {
      entity.lastActivity = new Date();
      
      // Recalculer le score si c'est un prospect
      if (this.prospects.has(entityId)) {
        entity.score = await this.calculateLeadScore(entityId);
        await this.applyAutomationRules(entity);
      }
    }

    return interaction;
  }

  /**
   * Applique les règles d'automatisation
   */
  async applyAutomationRules(entity) {
    const applicableRules = [];

    this.automationRules.forEach((rule, ruleId) => {
      if (rule.condition(entity)) {
        applicableRules.push({
          ruleId,
          rule,
          entityId: entity.id,
          timestamp: new Date()
        });
      }
    });

    // Exécuter les actions (simulé)
    applicableRules.forEach(({ rule, entityId }) => {
      console.log(`Règle appliquée: ${rule.name} pour ${entityId} - Action: ${rule.action}`);
      // Ici, on pourrait déclencher des actions réelles comme l'envoi d'emails, etc.
    });

    return applicableRules;
  }

  /**
   * Met à jour les segments
   */
  async updateSegments() {
    // Réinitialiser les membres des segments
    this.segments.forEach(segment => {
      segment.members = [];
    });

    // Réassigner les entités aux segments
    [...this.prospects.values(), ...this.clients.values()].forEach(entity => {
      this.segments.forEach((segment, segmentId) => {
        if (segment.criteria(entity)) {
          segment.members.push(entity.id);
        }
      });
    });
  }

  /**
   * Génère un rapport d'analyse des clients
   */
  async generateClientAnalysisReport() {
    const totalClients = this.clients.size;
    const totalProspects = this.prospects.size;
    const totalRevenue = Array.from(this.clients.values())
      .reduce((sum, client) => sum + client.totalRevenue, 0);

    // Analyse des scores
    const prospectScores = Array.from(this.prospects.values()).map(p => p.score);
    const averageScore = prospectScores.reduce((sum, score) => sum + score, 0) / prospectScores.length;
    const highScoreProspects = prospectScores.filter(score => score > 70).length;

    // Analyse du churn
    const clientsAtRisk = Array.from(this.clients.values())
      .filter(client => client.churnRisk > 0.6).length;

    // Analyse de la valeur vie
    const lifetimeValues = Array.from(this.clients.values()).map(c => c.lifetimeValue);
    const averageLTV = lifetimeValues.reduce((sum, ltv) => sum + ltv, 0) / lifetimeValues.length;

    // Analyse des segments
    const segmentAnalysis = {};
    this.segments.forEach((segment, segmentId) => {
      segmentAnalysis[segmentId] = {
        name: segment.name,
        count: segment.members.length,
        percentage: (segment.members.length / (totalClients + totalProspects)) * 100
      };
    });

    // Tendances de conversion
    const conversionRate = totalClients / (totalClients + totalProspects) * 100;

    return {
      overview: {
        totalClients,
        totalProspects,
        totalRevenue,
        conversionRate
      },
      scoring: {
        averageScore: Math.round(averageScore),
        highScoreProspects,
        scoringAccuracy: this.scoringModels.leadScoring.accuracy * 100
      },
      churnAnalysis: {
        clientsAtRisk,
        riskPercentage: (clientsAtRisk / totalClients) * 100,
        churnModelAccuracy: this.scoringModels.churnRisk.accuracy * 100
      },
      valueAnalysis: {
        averageLTV: Math.round(averageLTV),
        totalPotentialValue: Math.round(averageLTV * totalClients),
        ltvModelAccuracy: this.scoringModels.lifetimeValue.accuracy * 100
      },
      segments: segmentAnalysis,
      recommendations: await this.generateRecommendations(),
      timestamp: new Date().toISOString()
    };
  }

  /**
   * Génère des recommandations basées sur l'analyse
   */
  async generateRecommendations() {
    const recommendations = [];

    // Recommandations basées sur les prospects à score élevé
    const highScoreProspects = Array.from(this.prospects.values())
      .filter(p => p.score > 80).length;
    
    if (highScoreProspects > 0) {
      recommendations.push({
        type: 'opportunity',
        priority: 'high',
        title: 'Prospects Haute Priorité',
        description: `${highScoreProspects} prospects avec score élevé nécessitent un suivi immédiat`,
        action: 'Assigner à l\'équipe commerciale',
        expectedImpact: 'Augmentation du taux de conversion de 15-25%'
      });
    }

    // Recommandations basées sur le risque de churn
    const atRiskClients = Array.from(this.clients.values())
      .filter(c => c.churnRisk > 0.6).length;
    
    if (atRiskClients > 0) {
      recommendations.push({
        type: 'warning',
        priority: 'high',
        title: 'Clients à Risque',
        description: `${atRiskClients} clients présentent un risque de churn élevé`,
        action: 'Lancer campagne de rétention',
        expectedImpact: 'Réduction du churn de 20-30%'
      });
    }

    // Recommandations basées sur les prospects inactifs
    const inactiveProspects = Array.from(this.prospects.values())
      .filter(p => {
        const daysSinceLastActivity = (Date.now() - p.lastActivity) / (1000 * 60 * 60 * 24);
        return daysSinceLastActivity > 14;
      }).length;
    
    if (inactiveProspects > 0) {
      recommendations.push({
        type: 'optimization',
        priority: 'medium',
        title: 'Réactivation Prospects',
        description: `${inactiveProspects} prospects inactifs depuis plus de 14 jours`,
        action: 'Campagne de réengagement automatisée',
        expectedImpact: 'Réactivation de 10-15% des prospects'
      });
    }

    // Recommandations basées sur la segmentation
    const enterpriseProspects = this.segments.get('enterprise_prospects')?.members.length || 0;
    if (enterpriseProspects > 0) {
      recommendations.push({
        type: 'opportunity',
        priority: 'medium',
        title: 'Prospects Enterprise',
        description: `${enterpriseProspects} prospects enterprise identifiés`,
        action: 'Stratégie commerciale dédiée',
        expectedImpact: 'Augmentation de la valeur moyenne des deals'
      });
    }

    return recommendations;
  }

  /**
   * Obtient tous les prospects
   */
  async getProspects() {
    try {
      const token = localStorage.getItem('accessToken') || localStorage.getItem('token');
      if (!token) {
        throw new Error('Token d\'authentification manquant');
      }

      const response = await fetch('/api/agent/prospects', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      const data = await response.data;
      return {
        success: true,
        data: data.data || []
      };
    } catch (error) {
        if (error.response?.status === 401) {
          router.push('/login');
          return;
        }
      console.error('Erreur lors de la récupération des prospects:', error);
      return {
        success: false,
        error: error.message,
        data: []
      };
    }
  }

  getProspectsFromCache() {
    return Array.from(this.prospects.values());
  }

  /**
   * Obtient tous les clients
   */
  async getClients() {
    try {
      const token = localStorage.getItem('accessToken') || localStorage.getItem('token');
      if (!token) {
        throw new Error('Token d\'authentification manquant');
      }

      const response = await fetch('/api/agent/clients', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      const data = await response.data;
      return {
        success: true,
        data: data.data || []
      };
    } catch (error) {
        if (error.response?.status === 401) {
          router.push('/login');
          return;
        }
      console.error('Erreur lors de la récupération des clients:', error);
      return {
        success: false,
        error: error.message,
        data: []
      };
    }
  }

  getClientsFromCache() {
    return Array.from(this.clients.values());
  }

  /**
   * Obtient tous les segments
   */
  getSegments() {
    return Array.from(this.segments.values());
  }

  /**
   * Obtient les interactions pour une entité
   */
  getInteractions(entityId) {
    return this.interactions.get(entityId) || [];
  }

  /**
   * Recherche des entités
   */
  searchEntities(query, type = 'all') {
    const searchTerm = query.toLowerCase();
    const results = [];

    if (type === 'all' || type === 'prospects') {
      this.prospects.forEach(prospect => {
        if (prospect.name.toLowerCase().includes(searchTerm) ||
            prospect.email.toLowerCase().includes(searchTerm) ||
            prospect.industry.toLowerCase().includes(searchTerm)) {
          results.push({ ...prospect, type: 'prospect' });
        }
      });
    }

    if (type === 'all' || type === 'clients') {
      this.clients.forEach(client => {
        if (client.name.toLowerCase().includes(searchTerm) ||
            client.email.toLowerCase().includes(searchTerm) ||
            client.industry.toLowerCase().includes(searchTerm)) {
          results.push({ ...client, type: 'client' });
        }
      });
    }

    return results;
  }

  /**
   * Récupère les clients assignés à l'agent connecté
   */
  async getAssignedClients() {
    try {
      const token = localStorage.getItem('accessToken') || localStorage.getItem('token');
      if (!token) {
        throw new Error('Token d\'authentification manquant');
      }

      const response = await fetch('/api/agent/assigned-clients', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      const data = await response.data;
      return {
        success: true,
        data: data.data || []
      };
    } catch (error) {
        if (error.response?.status === 401) {
          router.push('/login');
          return;
        }
      console.error('Erreur lors de la récupération des clients assignés:', error);
      return {
        success: false,
        error: error.message,
        data: []
      };
    }
  }
}

// Instance singleton
const clientManagementService = new ClientManagementService();
export default clientManagementService;