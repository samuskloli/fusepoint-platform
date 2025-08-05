/**
 * Service de Chat IA
 * Gère les interactions avec l'API OpenAI pour les réponses de chat
 */

const OpenAI = require('openai');
const contextualAIService = require('./contextualAIService');

class AIChatService {
  constructor() {
    this.apiKey = process.env.OPENAI_API_KEY;
    this.isOpenAIConfigured = !!this.apiKey;
    
    if (this.apiKey) {
      this.openai = new OpenAI({ apiKey: this.apiKey });
    }
    
    // Agents disponibles
    this.agents = {
      content: {
        name: 'Agent Contenu',
        personality: 'Expert en création et optimisation de contenu marketing',
        systemPrompt: 'Tu es un expert en création de contenu marketing. Tu aides à créer, optimiser et analyser le contenu pour maximiser l\'engagement et les conversions.'
      },
      social: {
        name: 'Agent Social',
        personality: 'Spécialiste des réseaux sociaux et de l\'engagement communautaire',
        systemPrompt: 'Tu es un spécialiste des réseaux sociaux. Tu aides à développer des stratégies social media, créer du contenu engageant et analyser les performances.'
      },
      email: {
        name: 'Agent Email',
        personality: 'Expert en email marketing et automation',
        systemPrompt: 'Tu es un expert en email marketing. Tu aides à créer des campagnes email efficaces, optimiser les taux d\'ouverture et de conversion.'
      },
      analytics: {
        name: 'Agent Analytics',
        personality: 'Analyste de données marketing et insights',
        systemPrompt: 'Tu es un analyste de données marketing. Tu aides à interpréter les métriques, identifier les tendances et proposer des optimisations basées sur les données.'
      },
      strategy: {
        name: 'Agent Stratégie',
        personality: 'Stratège marketing global et consultant',
        systemPrompt: 'Tu es un stratège marketing. Tu aides à développer des stratégies marketing globales, identifier les opportunités et optimiser les performances.'
      }
    };
  }

  /**
   * Génère une réponse IA
   */
  async generateResponse(message, agentType = 'strategy', userId = null, companyId = null) {
    try {
      console.log(`🤖 Génération réponse IA - Agent: ${agentType}, Message: ${message.substring(0, 50)}...`);
      
      // Si userId et companyId sont fournis, utiliser le service contextuel
      if (userId && companyId) {
        console.log('📊 Utilisation du service contextuel');
        return await contextualAIService.generateContextualResponse(message, agentType, userId, companyId);
      }
      
      // Sinon, utiliser la réponse standard
      return await this.generateStandardResponse(message, agentType);
      
    } catch (error) {
      console.error('Erreur génération réponse IA:', error);
      return this.getFallbackResponse(message, agentType);
    }
  }

  /**
   * Génère une réponse standard avec OpenAI
   */
  async generateStandardResponse(message, agentType) {
    if (!this.isOpenAIConfigured) {
      return this.getFallbackResponse(message, agentType);
    }

    try {
      const agent = this.agents[agentType] || this.agents.strategy;
      
      const response = await this.openai.chat.completions.create({
        model: 'gpt-3.5-turbo',
        messages: [
          {
            role: 'system',
            content: `${agent.systemPrompt}\n\nRéponds en français de manière professionnelle mais accessible. Fournis des conseils pratiques et actionnables.`
          },
          {
            role: 'user',
            content: message
          }
        ],
        max_tokens: 500,
        temperature: 0.7
      });

      const aiResponse = response.choices[0].message.content;
      
      return {
        content: aiResponse,
        suggestions: this.generateSuggestions(agentType),
        agent: agent.name,
        timestamp: new Date().toISOString(),
        contextual: false
      };
      
    } catch (error) {
      console.error('Erreur OpenAI:', error);
      return this.getFallbackResponse(message, agentType);
    }
  }

  /**
   * Génère des suggestions basées sur le type d'agent
   */
  generateSuggestions(agentType) {
    const suggestions = {
      content: [
        'Analyser mes contenus actuels',
        'Créer un calendrier éditorial',
        'Optimiser mon SEO',
        'Améliorer mes titres'
      ],
      social: [
        'Analyser mes performances sociales',
        'Créer une stratégie Instagram',
        'Optimiser mes publications',
        'Planifier mes contenus'
      ],
      email: [
        'Analyser mes campagnes email',
        'Optimiser mes taux d\'ouverture',
        'Créer une séquence d\'automation',
        'Améliorer mes conversions'
      ],
      analytics: [
        'Analyser mes performances',
        'Identifier les tendances',
        'Optimiser mes conversions',
        'Créer un rapport personnalisé'
      ],
      strategy: [
        'Analyser ma stratégie actuelle',
        'Identifier de nouvelles opportunités',
        'Optimiser mon budget marketing',
        'Développer ma présence en ligne'
      ]
    };
    
    return suggestions[agentType] || suggestions.strategy;
  }

  /**
   * Réponse de fallback en cas d'erreur
   */
  getFallbackResponse(message, agentType) {
    const agent = this.agents[agentType] || this.agents.strategy;
    
    const fallbackResponses = {
      content: 'Je suis votre assistant contenu ! Je peux vous aider à créer et optimiser vos contenus marketing. Que souhaitez-vous améliorer dans votre stratégie de contenu ?',
      social: 'Je suis votre assistant réseaux sociaux ! Je peux vous aider à développer votre présence sociale et engager votre communauté. Sur quels réseaux souhaitez-vous vous concentrer ?',
      email: 'Je suis votre assistant email marketing ! Je peux vous aider à créer des campagnes efficaces et améliorer vos taux de conversion. Quel est votre objectif principal ?',
      analytics: 'Je suis votre assistant analytics ! Je peux vous aider à analyser vos données et identifier des opportunités d\'optimisation. Quelles métriques vous intéressent le plus ?',
      strategy: 'Je suis votre assistant stratégie marketing ! Je peux vous aider à développer et optimiser votre stratégie globale. Quel est votre principal défi actuel ?'
    };
    
    return {
      content: fallbackResponses[agentType] || fallbackResponses.strategy,
      suggestions: this.generateSuggestions(agentType),
      agent: agent.name,
      timestamp: new Date().toISOString(),
      contextual: false
    };
  }

  /**
   * Test de connexion à l'API OpenAI
   */
  async testConnection() {
    if (!this.isOpenAIConfigured) {
      return { success: false, error: 'Clé API OpenAI non configurée' };
    }
    
    try {
      const response = await this.openai.chat.completions.create({
        model: 'gpt-3.5-turbo',
        messages: [{ role: 'user', content: 'Test de connexion' }],
        max_tokens: 10
      });
      
      return { success: true, message: 'Connexion OpenAI réussie' };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }
}

module.exports = new AIChatService();