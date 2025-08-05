/**
 * Service d'IA Contextuelle Avancé
 * Intègre les données de session client, métriques d'entreprise,
 * et analyses en temps réel pour des réponses IA personnalisées
 */

const OpenAI = require('openai');
const aiChatService = require('./aiChatService');
const companyDataService = require('./companyDataService');
const databaseService = require('./databaseService');

class ContextualAIService {
  constructor() {
    this.apiKey = process.env.OPENAI_API_KEY;
    this.isOpenAIConfigured = !!this.apiKey;
    
    if (this.apiKey) {
      this.openai = new OpenAI({ apiKey: this.apiKey });
    }
    
    // Cache des sessions utilisateur
    this.userSessions = new Map();
    
    // Cache des données d'entreprise
    this.companyDataCache = new Map();
    
    // Modèles de contexte
    this.contextModels = {
      businessMetrics: {
        googleAnalytics: ['sessions', 'users', 'pageviews', 'bounceRate', 'conversionRate'],
        facebook: ['reach', 'engagement', 'clicks', 'impressions', 'cpm'],
        email: ['openRate', 'clickRate', 'unsubscribeRate', 'deliveryRate'],
        sales: ['revenue', 'deals', 'pipeline', 'conversionRate']
      },
      userContext: {
        profile: ['industry', 'companySize', 'role', 'experience'],
        behavior: ['lastActions', 'preferences', 'goals', 'challenges'],
        session: ['duration', 'pagesVisited', 'interactions', 'timestamp']
      }
    };
  }

  /**
   * Génère une réponse IA contextuelle basée sur les données de l'entreprise
   */
  async generateContextualResponse(message, agentType, userId, companyId) {
    try {
      console.log(`🚀 Début génération réponse contextuelle pour ${companyId}`);
      
      // 1. Récupérer le contexte utilisateur et entreprise depuis la base de données
      console.log(`👤 Récupération contexte utilisateur depuis la base de données...`);
      const userContext = await this.getUserDataFromDB(userId);
      console.log(`✅ Contexte utilisateur récupéré depuis la base de données`);
      
      console.log(`📊 Récupération données entreprise depuis la base de données...`);
      const companyData = await companyDataService.getCompanyDataFromDatabase(companyId);
      console.log(`✅ Données entreprise récupérées depuis la base de données:`, Object.keys(companyData));
      
      const sessionData = await this.getSessionData(userId);
      
      // 2. Construire le prompt contextuel
      console.log(`🎯 Génération prompt contextuel...`);
      const contextualPrompt = this.buildContextualPrompt(
        message, 
        agentType, 
        userContext, 
        companyData, 
        sessionData
      );
      console.log(`✅ Prompt contextuel généré`);
      
      // 3. Générer la réponse avec OpenAI
      if (this.isOpenAIConfigured) {
        const response = await this.openai.chat.completions.create({
          model: 'gpt-3.5-turbo',
          messages: [
            {
              role: 'system',
              content: contextualPrompt.systemPrompt
            },
            {
              role: 'user',
              content: contextualPrompt.userMessage
            }
          ],
          max_tokens: 500,
          temperature: 0.7
        });
        
        const aiResponse = response.choices[0].message.content;
        
        // 4. Enrichir la réponse avec des données spécifiques
        const enrichedResponse = await this.enrichResponseWithData(
          aiResponse, 
          companyData, 
          agentType
        );
        
        // 5. Mettre à jour le contexte de session
        await this.updateSessionContext(userId, message, enrichedResponse);
        
        return {
          content: enrichedResponse.content,
          suggestions: enrichedResponse.suggestions,
          insights: enrichedResponse.insights,
          metrics: enrichedResponse.metrics,
          agent: this.getAgentInfo(agentType),
          timestamp: new Date().toISOString(),
          contextual: true
        };
      } else {
        // Fallback avec données contextuelles
        return await this.generateContextualFallback(
          message, 
          agentType, 
          companyData
        );
      }
      
    } catch (error) {
      console.error('Erreur génération réponse contextuelle:', error);
      return await aiChatService.generateResponse(message, agentType);
    }
  }

  /**
   * Construit un prompt contextuel enrichi
   */
  buildContextualPrompt(message, agentType, userContext, companyData, sessionData) {
    const agentPersonality = this.getAgentPersonality(agentType);
    
    const systemPrompt = `Tu es ${agentPersonality.name}, ${agentPersonality.description}.

CONTEXTE ENTREPRISE:
${this.formatCompanyContext(companyData)}

CONTEXTE UTILISATEUR:
${this.formatUserContext(userContext, sessionData)}

INSTRUCTIONS:
- Utilise les données réelles de l'entreprise dans tes réponses
- Fais référence aux métriques spécifiques quand c'est pertinent
- Propose des actions concrètes basées sur les performances actuelles
- Adapte ton ton selon le profil utilisateur
- Fournis des insights actionnables
- Réponds en français de manière professionnelle mais accessible

Format de réponse:
- Réponse principale avec données spécifiques
- 3-4 suggestions d'actions concrètes
- Insights basés sur les métriques`;

    const userMessage = `Question: ${message}

Contexte de la conversation: ${sessionData.conversationHistory || 'Nouvelle conversation'}`;

    return {
      systemPrompt,
      userMessage
    };
  }

  /**
   * Formate le contexte entreprise pour le prompt
   */
  formatCompanyContext(companyData) {
    if (!companyData) return 'Données d\'entreprise non disponibles';
    
    let context = `Entreprise: ${companyData.name || 'Non spécifié'}\n`;
    context += `Secteur: ${companyData.industry || 'Non spécifié'}\n`;
    context += `Taille: ${companyData.size || 'Non spécifié'}\n\n`;
    
    // Métriques Google Analytics
    if (companyData.analytics) {
      context += `MÉTRIQUES GOOGLE ANALYTICS (30 derniers jours):\n`;
      context += `- Sessions: ${companyData.analytics.sessions || 'N/A'}\n`;
      context += `- Utilisateurs: ${companyData.analytics.users || 'N/A'}\n`;
      context += `- Taux de rebond: ${companyData.analytics.bounceRate || 'N/A'}%\n`;
      context += `- Durée moyenne session: ${companyData.analytics.avgSessionDuration || 'N/A'}s\n`;
      context += `- Taux de conversion: ${companyData.analytics.conversionRate || 'N/A'}%\n\n`;
    }
    
    // Métriques Facebook/Meta
    if (companyData.facebook) {
      context += `MÉTRIQUES FACEBOOK/META (30 derniers jours):\n`;
      context += `- Portée: ${companyData.facebook.reach || 'N/A'}\n`;
      context += `- Engagement: ${companyData.facebook.engagement || 'N/A'}%\n`;
      context += `- Clics: ${companyData.facebook.clicks || 'N/A'}\n`;
      context += `- CPM: ${companyData.facebook.cpm || 'N/A'}€\n\n`;
    }
    
    // Métriques Email
    if (companyData.email) {
      context += `MÉTRIQUES EMAIL MARKETING (30 derniers jours):\n`;
      context += `- Taux d'ouverture: ${companyData.email.openRate || 'N/A'}%\n`;
      context += `- Taux de clic: ${companyData.email.clickRate || 'N/A'}%\n`;
      context += `- Taux de désabonnement: ${companyData.email.unsubscribeRate || 'N/A'}%\n\n`;
    }
    
    // Objectifs et défis
    if (companyData.goals) {
      context += `OBJECTIFS ACTUELS: ${companyData.goals.join(', ')}\n`;
    }
    
    if (companyData.challenges) {
      context += `DÉFIS IDENTIFIÉS: ${companyData.challenges.join(', ')}\n`;
    }
    
    return context;
  }

  /**
   * Formate le contexte utilisateur pour le prompt
   */
  formatUserContext(userContext, sessionData) {
    if (!userContext) return 'Contexte utilisateur non disponible';
    
    let context = `PROFIL UTILISATEUR:\n`;
    context += `- Rôle: ${userContext.role || 'Non spécifié'}\n`;
    context += `- Expérience: ${userContext.experience || 'Non spécifié'}\n`;
    context += `- Objectifs: ${userContext.goals?.join(', ') || 'Non spécifiés'}\n\n`;
    
    context += `SESSION ACTUELLE:\n`;
    context += `- Durée: ${sessionData.duration || 0} minutes\n`;
    context += `- Pages visitées: ${sessionData.pagesVisited || 0}\n`;
    context += `- Dernières actions: ${sessionData.lastActions?.join(', ') || 'Aucune'}\n`;
    
    return context;
  }

  /**
   * Enrichit la réponse avec des données spécifiques
   */
  async enrichResponseWithData(aiResponse, companyData, agentType) {
    const insights = this.generateInsights(companyData, agentType);
    const metrics = this.extractRelevantMetrics(companyData, agentType);
    const suggestions = this.generateContextualSuggestions(companyData, agentType);
    
    return {
      content: aiResponse,
      suggestions,
      insights,
      metrics
    };
  }

  /**
   * Génère des insights basés sur les données
   */
  generateInsights(companyData, agentType) {
    const insights = [];
    
    if (!companyData) return insights;
    
    // Insights Google Analytics
    if (companyData.analytics) {
      const { bounceRate, conversionRate, avgSessionDuration } = companyData.analytics;
      
      if (bounceRate > 70) {
        insights.push({
          type: 'warning',
          title: 'Taux de rebond élevé',
          message: `Votre taux de rebond de ${bounceRate}% est supérieur à la moyenne. Optimisez vos pages d'atterrissage.`,
          priority: 'high'
        });
      }
      
      if (conversionRate < 2) {
        insights.push({
          type: 'opportunity',
          title: 'Potentiel d\'amélioration des conversions',
          message: `Avec ${conversionRate}% de taux de conversion, vous pourriez améliorer votre tunnel de vente.`,
          priority: 'medium'
        });
      }
      
      if (avgSessionDuration < 60) {
        insights.push({
          type: 'info',
          title: 'Engagement à améliorer',
          message: `La durée moyenne de session (${avgSessionDuration}s) suggère un besoin d'améliorer l'engagement.`,
          priority: 'medium'
        });
      }
    }
    
    // Insights Facebook
    if (companyData.facebook) {
      const { engagement, cpm } = companyData.facebook;
      
      if (engagement < 2) {
        insights.push({
          type: 'warning',
          title: 'Engagement Facebook faible',
          message: `Votre taux d'engagement de ${engagement}% est en dessous de la moyenne (3-5%).`,
          priority: 'high'
        });
      }
      
      if (cpm > 15) {
        insights.push({
          type: 'cost',
          title: 'CPM élevé',
          message: `Votre CPM de ${cpm}€ pourrait être optimisé avec un meilleur ciblage.`,
          priority: 'medium'
        });
      }
    }
    
    return insights;
  }

  /**
   * Extrait les métriques pertinentes selon l'agent
   */
  extractRelevantMetrics(companyData, agentType) {
    if (!companyData) return {};
    
    const metricsMap = {
      analytics: companyData.analytics || {},
      social: companyData.facebook || {},
      email: companyData.email || {},
      content: {
        pageviews: companyData.analytics?.pageviews,
        avgSessionDuration: companyData.analytics?.avgSessionDuration,
        bounceRate: companyData.analytics?.bounceRate
      },
      strategy: {
        sessions: companyData.analytics?.sessions,
        conversionRate: companyData.analytics?.conversionRate,
        revenue: companyData.sales?.revenue
      }
    };
    
    return metricsMap[agentType] || {};
  }

  /**
   * Génère des suggestions contextuelles
   */
  generateContextualSuggestions(companyData, agentType) {
    const baseSuggestions = {
      analytics: [
        'Analyser le taux de rebond par page',
        'Optimiser le tunnel de conversion',
        'Segmenter les audiences',
        'Créer un rapport personnalisé'
      ],
      social: [
        'Améliorer l\'engagement Facebook',
        'Optimiser les heures de publication',
        'Créer du contenu viral',
        'Analyser la concurrence'
      ],
      email: [
        'Segmenter la liste email',
        'Tester les objets d\'email',
        'Automatiser les séquences',
        'Nettoyer la base de données'
      ],
      content: [
        'Créer du contenu SEO',
        'Optimiser les pages populaires',
        'Développer une stratégie vidéo',
        'Améliorer le temps de lecture'
      ],
      strategy: [
        'Définir les KPIs prioritaires',
        'Optimiser le budget marketing',
        'Analyser le ROI par canal',
        'Planifier la stratégie Q2'
      ]
    };
    
    // Personnaliser selon les données
    let suggestions = baseSuggestions[agentType] || baseSuggestions.strategy;
    
    if (companyData?.analytics?.bounceRate > 70) {
      suggestions = ['Réduire le taux de rebond', ...suggestions.slice(1)];
    }
    
    if (companyData?.analytics?.conversionRate < 2) {
      suggestions = ['Optimiser les conversions', ...suggestions.slice(1)];
    }
    
    return suggestions;
  }

  /**
   * Récupère le contexte utilisateur
   */
  async getUserContext(userId) {
    // Simuler la récupération depuis la base de données
    return {
      id: userId,
      role: 'Marketing Manager',
      experience: 'Intermédiaire',
      goals: ['Augmenter les conversions', 'Améliorer le ROI'],
      preferences: ['Analytics', 'Automation'],
      lastLogin: new Date()
    };
  }

  /**
   * Récupérer les données utilisateur depuis la base de données
   */
  async getUserDataFromDB(userId) {
    try {
      console.log('👤 Récupération données utilisateur depuis la base de données:', userId);
      
      const user = await databaseService.db.get(
        'SELECT id, email, first_name, last_name, preferences, created_at, last_login FROM users WHERE id = ? AND is_active = 1',
        [userId]
      );

      if (!user) {
        console.log('⚠️ Utilisateur non trouvé, utilisation des données de démonstration');
        return this.getUserContext(userId);
      }

      // Récupérer les entreprises de l'utilisateur
      const companies = await databaseService.getUserCompanies(userId);

      // Récupérer les sessions récentes
      const recentSessions = await databaseService.db.all(
        'SELECT * FROM user_sessions WHERE user_id = ? ORDER BY created_at DESC LIMIT 5',
        [userId]
      );

      return {
        id: user.id,
        email: user.email,
        name: `${user.first_name} ${user.last_name}`.trim(),
        firstName: user.first_name,
        lastName: user.last_name,
        role: 'Marketing Manager',
        experience: 'Intermédiaire',
        goals: ['Augmenter les conversions', 'Améliorer le ROI'],
        preferences: user.preferences ? JSON.parse(user.preferences) : ['Analytics', 'Automation'],
        companies: companies.map(c => ({
          id: c.id,
          name: c.name,
          role: c.role
        })),
        history: {
          lastLogin: user.last_login || new Date(),
          totalSessions: recentSessions.length,
          memberSince: user.created_at
        }
      };

    } catch (error) {
      console.error('❌ Erreur récupération données utilisateur depuis la base de données:', error);
      return this.getUserContext(userId);
    }
  }

  /**
   * Récupère les données de l'entreprise
   */
  async getCompanyData(companyId) {
    try {
      // Utiliser le service de données d'entreprise
      return await companyDataService.getCompanyData(companyId);
    } catch (error) {
      console.error(`Erreur récupération données entreprise ${companyId}:`, error);
      // Fallback vers les données mock
      return companyDataService.getMockCompanyData(companyId);
    }
  }

  /**
   * Récupère les données de session
   */
  async getSessionData(userId) {
    const sessionId = `session_${userId}_${Date.now()}`;
    
    if (!this.userSessions.has(userId)) {
      this.userSessions.set(userId, {
        id: sessionId,
        startTime: new Date(),
        duration: 0,
        pagesVisited: 1,
        lastActions: [],
        conversationHistory: ''
      });
    }
    
    const session = this.userSessions.get(userId);
    session.duration = Math.floor((Date.now() - session.startTime) / 60000); // en minutes
    
    return session;
  }

  /**
   * Met à jour le contexte de session
   */
  async updateSessionContext(userId, userMessage, aiResponse) {
    const session = this.userSessions.get(userId);
    if (session) {
      session.lastActions.push(`Question: ${userMessage.substring(0, 50)}...`);
      session.conversationHistory += `User: ${userMessage}\nAI: ${aiResponse.content.substring(0, 100)}...\n`;
      
      // Garder seulement les 5 dernières actions
      if (session.lastActions.length > 5) {
        session.lastActions = session.lastActions.slice(-5);
      }
    }
  }

  /**
   * Génère une réponse de fallback contextuelle
   */
  async generateContextualFallback(message, agentType, companyData) {
    const insights = this.generateInsights(companyData, agentType);
    const metrics = this.extractRelevantMetrics(companyData, agentType);
    const suggestions = this.generateContextualSuggestions(companyData, agentType);
    
    const agentInfo = this.getAgentInfo(agentType);
    
    let content = `${agentInfo.emoji} ${agentInfo.name} - Mode Contextuel\n\n`;
    content += `Basé sur vos données d'entreprise, voici mon analyse :\n\n`;
    
    // Ajouter les métriques pertinentes
    if (Object.keys(metrics).length > 0) {
      content += `📊 **Vos métriques actuelles :**\n`;
      Object.entries(metrics).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          content += `• ${this.formatMetricName(key)}: ${value}${this.getMetricUnit(key)}\n`;
        }
      });
      content += `\n`;
    }
    
    // Ajouter les insights
    if (insights.length > 0) {
      content += `💡 **Insights basés sur vos données :**\n`;
      insights.slice(0, 2).forEach(insight => {
        content += `• ${insight.message}\n`;
      });
      content += `\n`;
    }
    
    content += `Pour des conseils IA personnalisés avancés, configurez votre clé OpenAI.`;
    
    return {
      content,
      suggestions,
      insights,
      metrics,
      agent: agentInfo,
      timestamp: new Date().toISOString(),
      contextual: true
    };
  }

  /**
   * Informations des agents
   */
  getAgentInfo(agentType) {
    const agents = {
      content: { name: 'Agent Contenu', emoji: '📝' },
      social: { name: 'Agent Social', emoji: '📱' },
      email: { name: 'Agent Email', emoji: '📧' },
      analytics: { name: 'Agent Analytics', emoji: '📊' },
      strategy: { name: 'Agent Stratégie', emoji: '🎯' }
    };
    
    return agents[agentType] || agents.strategy;
  }

  /**
   * Personnalités des agents
   */
  getAgentPersonality(agentType) {
    const personalities = {
      content: {
        name: 'l\'Expert Contenu',
        description: 'spécialiste en création et optimisation de contenu marketing'
      },
      social: {
        name: 'l\'Expert Réseaux Sociaux',
        description: 'spécialiste en stratégie et gestion des réseaux sociaux'
      },
      email: {
        name: 'l\'Expert Email Marketing',
        description: 'spécialiste en campagnes email et automatisation'
      },
      analytics: {
        name: 'l\'Analyste de Données',
        description: 'spécialiste en analyse de données et métriques marketing'
      },
      strategy: {
        name: 'le Stratège Marketing',
        description: 'expert en stratégie marketing globale et optimisation ROI'
      }
    };
    
    return personalities[agentType] || personalities.strategy;
  }

  /**
   * Formate les noms de métriques
   */
  formatMetricName(key) {
    const names = {
      sessions: 'Sessions',
      users: 'Utilisateurs',
      pageviews: 'Pages vues',
      bounceRate: 'Taux de rebond',
      conversionRate: 'Taux de conversion',
      avgSessionDuration: 'Durée moyenne session',
      reach: 'Portée',
      engagement: 'Engagement',
      clicks: 'Clics',
      cpm: 'CPM',
      openRate: 'Taux d\'ouverture',
      clickRate: 'Taux de clic',
      revenue: 'Chiffre d\'affaires'
    };
    
    return names[key] || key;
  }

  /**
   * Retourne l'unité de la métrique
   */
  getMetricUnit(key) {
    const units = {
      bounceRate: '%',
      conversionRate: '%',
      engagement: '%',
      openRate: '%',
      clickRate: '%',
      avgSessionDuration: 's',
      cpm: '€',
      revenue: '€'
    };
    
    return units[key] || '';
  }

  /**
   * Nettoie le cache des sessions anciennes
   */
  cleanupSessions() {
    const now = Date.now();
    const maxAge = 24 * 60 * 60 * 1000; // 24 heures
    
    for (const [userId, session] of this.userSessions.entries()) {
      if (now - session.startTime.getTime() > maxAge) {
        this.userSessions.delete(userId);
      }
    }
  }
}

module.exports = new ContextualAIService();