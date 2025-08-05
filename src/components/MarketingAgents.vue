<template>
  <div class="space-y-6">
    <!-- Header -->
    <div class="bg-gradient-to-r from-purple-600 to-pink-600 rounded-lg p-6 text-white">
      <div class="flex items-center justify-between">
        <div>
          <h2 class="text-2xl font-bold mb-2">Agents Marketing Fusepoint</h2>
          <p class="text-purple-100">Automatisez vos stratégies marketing avec l'intelligence artificielle</p>
        </div>
        <div class="text-right">
          <div class="text-3xl font-bold">{{ activeAgents }}</div>
          <div class="text-purple-200 text-sm">Agents actifs</div>
        </div>
      </div>
    </div>

    <!-- Quick Stats -->
    <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
      <div class="bg-white rounded-lg shadow p-4">
        <div class="flex items-center">
          <div class="p-2 bg-green-100 rounded-lg mr-3">
            <svg class="h-5 w-5 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
            </svg>
          </div>
          <div>
            <div class="text-lg font-semibold text-gray-900">{{ stats.conversionsGenerated }}</div>
            <div class="text-sm text-gray-600">Conversions générées</div>
          </div>
        </div>
      </div>
      <div class="bg-white rounded-lg shadow p-4">
        <div class="flex items-center">
          <div class="p-2 bg-blue-100 rounded-lg mr-3">
            <svg class="h-5 w-5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
            </svg>
          </div>
          <div>
            <div class="text-lg font-semibold text-gray-900">€{{ stats.revenueSaved.toLocaleString() }}</div>
            <div class="text-sm text-gray-600">Économies réalisées</div>
          </div>
        </div>
      </div>
      <div class="bg-white rounded-lg shadow p-4">
        <div class="flex items-center">
          <div class="p-2 bg-purple-100 rounded-lg mr-3">
            <svg class="h-5 w-5 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4" />
            </svg>
          </div>
          <div>
            <div class="text-lg font-semibold text-gray-900">{{ stats.tasksAutomated }}</div>
            <div class="text-sm text-gray-600">Tâches automatisées</div>
          </div>
        </div>
      </div>
      <div class="bg-white rounded-lg shadow p-4">
        <div class="flex items-center">
          <div class="p-2 bg-yellow-100 rounded-lg mr-3">
            <svg class="h-5 w-5 text-yellow-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          </div>
          <div>
            <div class="text-lg font-semibold text-gray-900">{{ stats.responseTime }}h</div>
            <div class="text-sm text-gray-600">Temps de réponse moyen</div>
          </div>
        </div>
      </div>
    </div>

    <!-- Agent Categories -->
    <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <!-- Content Marketing Agent -->
      <div class="bg-white rounded-lg shadow-lg overflow-hidden">
        <div class="bg-gradient-to-r from-blue-500 to-blue-600 p-4">
          <div class="flex items-center justify-between text-white">
            <div class="flex items-center space-x-3">
              <svg class="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
              <div>
                <h3 class="font-semibold">Agent Contenu</h3>
                <p class="text-blue-100 text-sm">Création et optimisation</p>
              </div>
            </div>
            <div class="text-right">
              <div class="w-3 h-3 bg-green-400 rounded-full"></div>
            </div>
          </div>
        </div>
        <div class="p-4">
          <div class="space-y-3">
            <div class="flex items-center justify-between py-2 border-b border-gray-100">
              <span class="text-sm text-gray-600">Génération d'articles</span>
              <span class="text-sm font-medium text-green-600">Actif</span>
            </div>
            <div class="flex items-center justify-between py-2 border-b border-gray-100">
              <span class="text-sm text-gray-600">Optimisation SEO</span>
              <span class="text-sm font-medium text-green-600">Actif</span>
            </div>
            <div class="flex items-center justify-between py-2 border-b border-gray-100">
              <span class="text-sm text-gray-600">Planification éditoriale</span>
              <span class="text-sm font-medium text-yellow-600">En pause</span>
            </div>
            <div class="flex items-center justify-between py-2">
              <span class="text-sm text-gray-600">A/B Testing titres</span>
              <span class="text-sm font-medium text-green-600">Actif</span>
            </div>
          </div>
          <div class="mt-4 pt-4 border-t border-gray-200">
            <div class="flex items-center justify-between mb-2">
              <span class="text-sm font-medium text-gray-700">Performance ce mois</span>
              <span class="text-sm text-green-600">+24%</span>
            </div>
            <div class="w-full bg-gray-200 rounded-full h-2">
              <div class="bg-blue-600 h-2 rounded-full" style="width: 76%"></div>
            </div>
          </div>
          <button class="w-full mt-4 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors">
            Configurer
          </button>
        </div>
      </div>

      <!-- Social Media Agent -->
      <div class="bg-white rounded-lg shadow-lg overflow-hidden">
        <div class="bg-gradient-to-r from-pink-500 to-pink-600 p-4">
          <div class="flex items-center justify-between text-white">
            <div class="flex items-center space-x-3">
              <svg class="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 4V2a1 1 0 011-1h8a1 1 0 011 1v2m-9 0h10m-10 0a2 2 0 00-2 2v14a2 2 0 002 2h10a2 2 0 002-2V6a2 2 0 00-2-2M9 12l2 2 4-4" />
              </svg>
              <div>
                <h3 class="font-semibold">Agent Social</h3>
                <p class="text-pink-100 text-sm">Gestion réseaux sociaux</p>
              </div>
            </div>
            <div class="text-right">
              <div class="w-3 h-3 bg-green-400 rounded-full"></div>
            </div>
          </div>
        </div>
        <div class="p-4">
          <div class="space-y-3">
            <div class="flex items-center justify-between py-2 border-b border-gray-100">
              <span class="text-sm text-gray-600">Publication automatique</span>
              <span class="text-sm font-medium text-green-600">Actif</span>
            </div>
            <div class="flex items-center justify-between py-2 border-b border-gray-100">
              <span class="text-sm text-gray-600">Réponses commentaires</span>
              <span class="text-sm font-medium text-green-600">Actif</span>
            </div>
            <div class="flex items-center justify-between py-2 border-b border-gray-100">
              <span class="text-sm text-gray-600">Analyse sentiment</span>
              <span class="text-sm font-medium text-green-600">Actif</span>
            </div>
            <div class="flex items-center justify-between py-2">
              <span class="text-sm text-gray-600">Hashtags optimisés</span>
              <span class="text-sm font-medium text-green-600">Actif</span>
            </div>
          </div>
          <div class="mt-4 pt-4 border-t border-gray-200">
            <div class="flex items-center justify-between mb-2">
              <span class="text-sm font-medium text-gray-700">Engagement ce mois</span>
              <span class="text-sm text-green-600">+18%</span>
            </div>
            <div class="w-full bg-gray-200 rounded-full h-2">
              <div class="bg-pink-600 h-2 rounded-full" style="width: 68%"></div>
            </div>
          </div>
          <button class="w-full mt-4 bg-pink-600 text-white py-2 px-4 rounded-lg hover:bg-pink-700 transition-colors">
            Configurer
          </button>
        </div>
      </div>

      <!-- Email Marketing Agent -->
      <div class="bg-white rounded-lg shadow-lg overflow-hidden">
        <div class="bg-gradient-to-r from-green-500 to-green-600 p-4">
          <div class="flex items-center justify-between text-white">
            <div class="flex items-center space-x-3">
              <svg class="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
              <div>
                <h3 class="font-semibold">Agent Email</h3>
                <p class="text-green-100 text-sm">Automatisation emails</p>
              </div>
            </div>
            <div class="text-right">
              <div class="w-3 h-3 bg-green-400 rounded-full"></div>
            </div>
          </div>
        </div>
        <div class="p-4">
          <div class="space-y-3">
            <div class="flex items-center justify-between py-2 border-b border-gray-100">
              <span class="text-sm text-gray-600">Séquences bienvenue</span>
              <span class="text-sm font-medium text-green-600">Actif</span>
            </div>
            <div class="flex items-center justify-between py-2 border-b border-gray-100">
              <span class="text-sm text-gray-600">Récupération panier</span>
              <span class="text-sm font-medium text-green-600">Actif</span>
            </div>
            <div class="flex items-center justify-between py-2 border-b border-gray-100">
              <span class="text-sm text-gray-600">Segmentation auto</span>
              <span class="text-sm font-medium text-green-600">Actif</span>
            </div>
            <div class="flex items-center justify-between py-2">
              <span class="text-sm text-gray-600">Personnalisation</span>
              <span class="text-sm font-medium text-green-600">Actif</span>
            </div>
          </div>
          <div class="mt-4 pt-4 border-t border-gray-200">
            <div class="flex items-center justify-between mb-2">
              <span class="text-sm font-medium text-gray-700">Taux d'ouverture</span>
              <span class="text-sm text-green-600">32.4%</span>
            </div>
            <div class="w-full bg-gray-200 rounded-full h-2">
              <div class="bg-green-600 h-2 rounded-full" style="width: 82%"></div>
            </div>
          </div>
          <button class="w-full mt-4 bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700 transition-colors">
            Configurer
          </button>
        </div>
      </div>
    </div>

    <!-- Advanced Agents -->
    <div class="bg-white rounded-lg shadow-lg p-6">
      <div class="flex items-center justify-between mb-6">
        <div>
          <h3 class="text-lg font-semibold text-gray-900">Agents Avancés</h3>
          <p class="text-gray-600">Automatisations marketing sophistiquées</p>
        </div>
        <button class="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors">
          Créer un agent
        </button>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
        <!-- Lead Scoring Agent -->
        <div class="border border-gray-200 rounded-lg p-4">
          <div class="flex items-center justify-between mb-3">
            <div class="flex items-center space-x-3">
              <div class="p-2 bg-indigo-100 rounded-lg">
                <svg class="h-5 w-5 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <div>
                <h4 class="font-medium text-gray-900">Lead Scoring IA</h4>
                <p class="text-sm text-gray-600">Qualification automatique des prospects</p>
              </div>
            </div>
            <div class="flex items-center space-x-2">
              <span class="w-2 h-2 bg-green-400 rounded-full"></span>
              <span class="text-sm text-green-600">Actif</span>
            </div>
          </div>
          <div class="space-y-2 text-sm text-gray-600">
            <div class="flex justify-between">
              <span>Leads qualifiés ce mois:</span>
              <span class="font-medium text-gray-900">247</span>
            </div>
            <div class="flex justify-between">
              <span>Taux de conversion:</span>
              <span class="font-medium text-green-600">+15%</span>
            </div>
            <div class="flex justify-between">
              <span>Temps économisé:</span>
              <span class="font-medium text-blue-600">32h/semaine</span>
            </div>
          </div>
        </div>

        <!-- Predictive Analytics Agent -->
        <div class="border border-gray-200 rounded-lg p-4">
          <div class="flex items-center justify-between mb-3">
            <div class="flex items-center space-x-3">
              <div class="p-2 bg-purple-100 rounded-lg">
                <svg class="h-5 w-5 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                </svg>
              </div>
              <div>
                <h4 class="font-medium text-gray-900">Prédictions IA</h4>
                <p class="text-sm text-gray-600">Analyse prédictive des tendances</p>
              </div>
            </div>
            <div class="flex items-center space-x-2">
              <span class="w-2 h-2 bg-green-400 rounded-full"></span>
              <span class="text-sm text-green-600">Actif</span>
            </div>
          </div>
          <div class="space-y-2 text-sm text-gray-600">
            <div class="flex justify-between">
              <span>Prédictions générées:</span>
              <span class="font-medium text-gray-900">18</span>
            </div>
            <div class="flex justify-between">
              <span>Précision moyenne:</span>
              <span class="font-medium text-green-600">87%</span>
            </div>
            <div class="flex justify-between">
              <span>ROI prédit (30j):</span>
              <span class="font-medium text-purple-600">+€12,450</span>
            </div>
          </div>
        </div>

        <!-- Customer Journey Agent -->
        <div class="border border-gray-200 rounded-lg p-4">
          <div class="flex items-center justify-between mb-3">
            <div class="flex items-center space-x-3">
              <div class="p-2 bg-yellow-100 rounded-lg">
                <svg class="h-5 w-5 text-yellow-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </div>
              <div>
                <h4 class="font-medium text-gray-900">Parcours Client</h4>
                <p class="text-sm text-gray-600">Optimisation du tunnel de conversion</p>
              </div>
            </div>
            <div class="flex items-center space-x-2">
              <span class="w-2 h-2 bg-green-400 rounded-full"></span>
              <span class="text-sm text-green-600">Actif</span>
            </div>
          </div>
          <div class="space-y-2 text-sm text-gray-600">
            <div class="flex justify-between">
              <span>Parcours optimisés:</span>
              <span class="font-medium text-gray-900">12</span>
            </div>
            <div class="flex justify-between">
              <span>Taux de conversion:</span>
              <span class="font-medium text-green-600">+22%</span>
            </div>
            <div class="flex justify-between">
              <span>Points de friction résolus:</span>
              <span class="font-medium text-yellow-600">8</span>
            </div>
          </div>
        </div>

        <!-- Competitive Intelligence Agent -->
        <div class="border border-gray-200 rounded-lg p-4">
          <div class="flex items-center justify-between mb-3">
            <div class="flex items-center space-x-3">
              <div class="p-2 bg-red-100 rounded-lg">
                <svg class="h-5 w-5 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
              </div>
              <div>
                <h4 class="font-medium text-gray-900">Veille Concurrentielle</h4>
                <p class="text-sm text-gray-600">Surveillance automatique des concurrents</p>
              </div>
            </div>
            <div class="flex items-center space-x-2">
              <span class="w-2 h-2 bg-green-400 rounded-full"></span>
              <span class="text-sm text-green-600">Actif</span>
            </div>
          </div>
          <div class="space-y-2 text-sm text-gray-600">
            <div class="flex justify-between">
              <span>Concurrents surveillés:</span>
              <span class="font-medium text-gray-900">5</span>
            </div>
            <div class="flex justify-between">
              <span>Alertes ce mois:</span>
              <span class="font-medium text-red-600">23</span>
            </div>
            <div class="flex justify-between">
              <span>Opportunités détectées:</span>
              <span class="font-medium text-green-600">7</span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Agent Performance Dashboard -->
    <div class="bg-white rounded-lg shadow-lg p-6">
      <h3 class="text-lg font-semibold text-gray-900 mb-6">Performance des Agents (30 derniers jours)</h3>
      <div class="space-y-4">
        <div v-for="agent in agentPerformance" :key="agent.name" class="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
          <div class="flex items-center space-x-4">
            <div :class="agent.color" class="p-2 rounded-lg">
              <svg class="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" :d="agent.icon" />
              </svg>
            </div>
            <div>
              <h4 class="font-medium text-gray-900">{{ agent.name }}</h4>
              <p class="text-sm text-gray-600">{{ agent.description }}</p>
            </div>
          </div>
          <div class="flex items-center space-x-6">
            <div class="text-center">
              <div class="text-lg font-semibold text-gray-900">{{ agent.tasksCompleted }}</div>
              <div class="text-xs text-gray-600">Tâches</div>
            </div>
            <div class="text-center">
              <div class="text-lg font-semibold" :class="agent.efficiency >= 90 ? 'text-green-600' : agent.efficiency >= 70 ? 'text-yellow-600' : 'text-red-600'">{{ agent.efficiency }}%</div>
              <div class="text-xs text-gray-600">Efficacité</div>
            </div>
            <div class="text-center">
              <div class="text-lg font-semibold text-purple-600">€{{ agent.valueGenerated.toLocaleString() }}</div>
              <div class="text-xs text-gray-600">Valeur générée</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'MarketingAgents',
  data() {
    return {
      activeAgents: 12,
      stats: {
        conversionsGenerated: 1247,
        revenueSaved: 45230,
        tasksAutomated: 2847,
        responseTime: 0.3
      },
      agentPerformance: [
        {
          name: 'Agent Contenu IA',
          description: 'Génération et optimisation de contenu',
          tasksCompleted: 156,
          efficiency: 94,
          valueGenerated: 12450,
          color: 'bg-blue-600',
          icon: 'M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z'
        },
        {
          name: 'Agent Social Media',
          description: 'Gestion automatisée des réseaux sociaux',
          tasksCompleted: 234,
          efficiency: 87,
          valueGenerated: 8750,
          color: 'bg-pink-600',
          icon: 'M7 4V2a1 1 0 011-1h8a1 1 0 011 1v2m-9 0h10m-10 0a2 2 0 00-2 2v14a2 2 0 002 2h10a2 2 0 002-2V6a2 2 0 00-2-2M9 12l2 2 4-4'
        },
        {
          name: 'Agent Email Marketing',
          description: 'Automatisation des campagnes email',
          tasksCompleted: 89,
          efficiency: 91,
          valueGenerated: 15230,
          color: 'bg-green-600',
          icon: 'M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z'
        },
        {
          name: 'Agent Lead Scoring',
          description: 'Qualification automatique des prospects',
          tasksCompleted: 67,
          efficiency: 96,
          valueGenerated: 18900,
          color: 'bg-indigo-600',
          icon: 'M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z'
        }
      ]
    };
  }
};
</script>