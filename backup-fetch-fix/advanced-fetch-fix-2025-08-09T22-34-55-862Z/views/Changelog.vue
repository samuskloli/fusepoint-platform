<template>
  <div class="changelog-page">
    <!-- Easter Egg: Konami Code -->
    <div v-if="showKonamiEgg" class="konami-easter-egg">
      🎉 KONAMI CODE ACTIVÉ! 🎉<br>
      <span class="rainbow-text">Vous avez débloqué le mode développeur secret!</span>
    </div>
    
    <!-- Easter Egg: Click Counter -->
    <div v-if="clickCount >= 10" class="click-easter-egg">
      🐰 Wow! {{ clickCount }} clics! Vous êtes vraiment motivé(e)! 🐰
    </div>

    <div class="changelog-header">
      <div class="container">
        <h1 @click="incrementClick" class="clickable-title">📋 Changelog Fusepoint</h1>
        <p class="subtitle">Suivez l'évolution de la plateforme et découvrez les nouvelles fonctionnalités</p>
        <!-- Easter Egg: Secret Developer Info -->
        <div v-if="showDevInfo" class="dev-info">
          👨‍💻 Développé avec ❤️ par l'équipe Fusepoint • {{ getRandomDevFact() }}
        </div>
        <div class="version-info">
          <span class="current-version" @dblclick="toggleDevInfo">Version actuelle: Alpha 1.0.0</span>
          <span class="last-update">Dernière mise à jour: {{ lastUpdate }}</span>
        </div>
      </div>
    </div>

    <div class="changelog-content">
      <div class="container">
        <!-- Fonctionnalités Actuelles -->
        <section class="changelog-section">
          <h2>🚀 Fonctionnalités Actuelles</h2>
          
          <div class="feature-category">
            <h3>👤 Fonctionnalités Utilisateur</h3>
            <div class="feature-grid">
              <div class="feature-card" @click="triggerChatEasterEgg">
                <div class="feature-status status-working">✅ Fonctionnel</div>
                <h4>💬 Chat IA Avancé</h4>
                <p>Assistant intelligent avec API OpenAI, conversations contextuelles et historique complet</p>
                <!-- Easter Egg: Hidden AI Message -->
                <div v-if="showChatEgg" class="hidden-message">
                  🤖 "Bonjour! Je suis l'IA secrète du changelog. Psst... il y a {{ totalEasterEggs }} Easter Eggs cachés ici!"
                </div>
              </div>
              <div class="feature-card">
                <div class="feature-status status-working">✅ Fonctionnel</div>
                <h4>📊 Dashboard Personnalisé</h4>
                <p>Métriques temps réel, widgets configurables et design responsive</p>
              </div>
              <div class="feature-card">
                <div class="feature-status status-working">✅ Fonctionnel</div>
                <h4>🔐 Authentification JWT</h4>
                <p>Sessions sécurisées, tokens refresh automatique et protection CSRF</p>
              </div>
              <div class="feature-card">
                <div class="feature-status status-working">✅ Fonctionnel</div>
                <h4>🌐 OAuth Social</h4>
                <p>Connexion Facebook/Instagram avec synchronisation automatique</p>
              </div>
              <div class="feature-card">
                <div class="feature-status status-partial">⚠️ Partiel</div>
                <h4>🔔 Système Notifications</h4>
                <p>Alertes email opérationnelles, notifications in-app en cours d'optimisation</p>
              </div>
            </div>
          </div>

          <div class="feature-category">
            <h3>🎯 Fonctionnalités Agent</h3>
            <div class="feature-grid">
              <div class="feature-card">
                <div class="feature-status status-working">✅ Fonctionnel</div>
                <h4>📈 Dashboard Agent</h4>
                <p>Vue d'ensemble clients, KPIs performance (responsive en cours d'amélioration)</p>
              </div>
              <div class="feature-card">
                <div class="feature-status status-working">✅ Fonctionnel</div>
                <h4>👥 Attribution Clients</h4>
                <p>Système automatique d'équilibrage de charge et historique complet</p>
              </div>
              <div class="feature-card">
                <div class="feature-status status-working">✅ Fonctionnel</div>
                <h4>📊 Rapports Avancés</h4>
                <p>Export PDF, analytics détaillées et graphiques interactifs</p>
              </div>
              <div class="feature-card">
                <div class="feature-status status-issue">🔧 En cours</div>
                <h4>💬 Chat Interne</h4>
                <p>Interface créée, transmission des messages en cours de débogage</p>
              </div>
            </div>
          </div>

          <div class="feature-category">
            <h3>⚙️ Fonctionnalités Super Admin</h3>
            <div class="feature-grid">
              <div class="feature-card">
                <div class="feature-status status-working">✅ Fonctionnel</div>
                <h4>👤 Gestion Utilisateurs</h4>
                <p>CRUD complet, permissions granulaires et gestion des rôles</p>
              </div>
              <div class="feature-card">
                <div class="feature-status status-working">✅ Fonctionnel</div>
                <h4>📧 Configuration SMTP</h4>
                <p>Paramètres serveur, templates personnalisés et tests d'envoi</p>
              </div>
              <div class="feature-card">
                <div class="feature-status status-critical">❌ Critique</div>
                <h4>📋 Système Logs</h4>
                <p>Affichage défaillant, base corrompue - priorité de correction</p>
              </div>
            </div>
          </div>
        </section>

        <!-- Corrections en Cours -->
        <section class="changelog-section">
          <h2>🔧 Corrections en Cours</h2>
          
          <div class="bug-category">
            <h3 class="priority-high">🔴 Priorité Haute</h3>
            <ul class="bug-list">
              <li>🔧 <strong>Chat IA</strong> - Problèmes de réactivité et d'affichage temps réel</li>
              <li>🔧 <strong>Dashboard Agent</strong> - Responsive design défaillant sur mobile</li>
              <li>🔧 <strong>Logs Super Admin</strong> - Interface complètement cassée</li>
            </ul>
          </div>
          
          <div class="bug-category">
            <h3 class="priority-medium">🟡 Priorité Moyenne</h3>
            <ul class="bug-list">
              <li>🔧 <strong>Notifications</strong> - Optimisation du système, élimination des doublons</li>
              <li>🔧 <strong>Chat Interne</strong> - Transmission des messages agent-prestataire</li>
              <li>🔧 <strong>Mon Suivi Fusepoint</strong> - Intégration sous-optimale, données incomplètes</li>
            </ul>
          </div>
          
          <div class="bug-category">
            <h3 class="priority-low">🟢 Priorité Basse</h3>
            <ul class="bug-list">
              <li>🔧 <strong>Thème Super Admin</strong> - Interface utilisateur à moderniser</li>
              <li>🔧 <strong>Performance</strong> - Optimisation temps de chargement</li>
              <!-- Easter Egg: Hidden Bug -->
              <li v-if="showHiddenBug" class="easter-egg-bug" @click="showBugMessage = !showBugMessage">
                🐛 <strong>Bug Secret</strong> - Les développeurs boivent trop de café ☕
                <div v-if="showBugMessage" class="bug-message">
                  💡 Solution: Ajouter plus de pauses café dans le planning!
                </div>
              </li>
            </ul>
          </div>
        </section>

        <!-- Roadmap -->
        <section class="changelog-section">
          <h2>🔮 Roadmap Fusepoint Hub</h2>
          
          <div class="roadmap-timeline">
            <div class="roadmap-phase">
              <div class="phase-header">
                <h3>📋 Phase 1 - Centralisation (Q3 2025)</h3>
                <span class="phase-status upcoming">À venir</span>
              </div>
              <div class="phase-content">
                <div class="roadmap-item">
                  <h4>🔐 Gestionnaire mots de passe</h4>
                  <p>Coffre-fort sécurisé, génération automatique</p>
                </div>
                <div class="roadmap-item">
                  <h4>🔗 Hub plateformes</h4>
                  <p>Connexions unifiées, synchronisation multi-comptes</p>
                </div>
                <div class="roadmap-item">
                  <h4>📁 Stockage documents</h4>
                  <p>Cloud sécurisé, versioning, partage collaboratif</p>
                </div>
                <div class="roadmap-item">
                  <h4>🔔 Notifications Push</h4>
                  <p>Temps réel, personnalisables, multi-canaux</p>
                </div>
              </div>
            </div>

            <div class="roadmap-phase">
              <div class="phase-header">
                <h3>🌐 Phase 2 - Réseautage (Q4 2025)</h3>
                <span class="phase-status upcoming">À venir</span>
              </div>
              <div class="phase-content">
                <div class="roadmap-item">
                  <h4>👥 Réseau professionnel</h4>
                  <p>Connexions inter-entreprises, recommandations</p>
                </div>
                <div class="roadmap-item">
                  <h4>💬 Chat unifié</h4>
                  <p>Messagerie cross-platform, traduction automatique</p>
                </div>
                <div class="roadmap-item">
                  <h4>📊 Analytics avancées</h4>
                  <p>BI intégré, prédictions IA, rapports automatisés</p>
                </div>
                <div class="roadmap-item">
                  <h4>🤖 Automatisation</h4>
                  <p>Workflows intelligents, triggers personnalisés</p>
                </div>
              </div>
            </div>

            <div class="roadmap-phase">
              <div class="phase-header">
                <h3>🚀 Phase 3 - Intelligence (Q1 2026)</h3>
                <span class="phase-status future">Futur</span>
              </div>
              <div class="phase-content">
                <div class="roadmap-item">
                  <h4>🧠 IA Prédictive</h4>
                  <p>Anticipation tendances, recommandations stratégiques</p>
                </div>
                <div class="roadmap-item">
                  <h4>📈 Optimisation ROI</h4>
                  <p>Allocation budgets automatique, A/B testing</p>
                </div>
                <div class="roadmap-item">
                  <h4>🎯 Ciblage avancé</h4>
                  <p>Segmentation IA, personas dynamiques</p>
                </div>
                <div class="roadmap-item" @mouseover="showSecretFeature = true" @mouseleave="showSecretFeature = false">
                  <h4>🔮 Fusepoint AI Assistant</h4>
                  <p>Assistant virtuel dédié, apprentissage continu</p>
                  <!-- Easter Egg: Secret Feature -->
                  <div v-if="showSecretFeature" class="secret-feature">
                    🕵️ Fonctionnalité secrète: Mode Ninja pour développeurs! 🥷
                  </div>
                </div>
              </div>
            </div>

            <div class="roadmap-phase">
              <div class="phase-header">
                <h3>🌟 Phase 4 - Écosystème (Q2 2026)</h3>
                <span class="phase-status future">Futur</span>
              </div>
              <div class="phase-content">
                <div class="roadmap-item">
                  <h4>🏪 Marketplace</h4>
                  <p>Extensions tierces, API publique</p>
                </div>
                <div class="roadmap-item">
                  <h4>🎨 White-label</h4>
                  <p>Solutions personnalisables, multi-tenant</p>
                </div>
                <div class="roadmap-item">
                  <h4>🌍 Expansion internationale</h4>
                  <p>Multi-langues, conformité RGPD</p>
                </div>
                <div class="roadmap-item">
                  <h4>📱 Applications mobiles</h4>
                  <p>iOS/Android natifs, synchronisation offline</p>
                </div>
                <!-- Easter Egg: Tesla Reference -->
                <div class="roadmap-item tesla-easter-egg" @click="showTeslaJoke = !showTeslaJoke">
                  <h4>🚗 Fusepoint Car (Mode Tesla)</h4>
                  <p>Voiture autonome intégrée à la plateforme marketing</p>
                  <div v-if="showTeslaJoke" class="tesla-joke">
                    🤖 "Comme Elon, nous aussi on annonce plein de trucs qui se feront... dans 10 ans ! Ou peut-être jamais ! 😅 Full Self-Driving Marketing inclus*"<br>
                    <small>*Fonctionnalité en bêta depuis 2019</small>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'Changelog',
  data() {
    return {
      lastUpdate: new Date().toLocaleDateString('fr-FR'),
      // Easter Eggs data
      clickCount: 0,
      showKonamiEgg: false,
      showDevInfo: false,
      showChatEgg: false,
      showSecretFeature: false,
      showHiddenBug: false,
      showBugMessage: false,
      showTeslaJoke: false,
      konamiCode: [],
      konamiSequence: ['ArrowUp', 'ArrowUp', 'ArrowDown', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'ArrowLeft', 'ArrowRight', 'KeyB', 'KeyA'],
      devFacts: [
        'Plus de 1000 lignes de code écrites avec amour',
        'Alimenté par une quantité industrielle de café ☕',
        'Testé sur 42 navigateurs différents',
        'Codé en écoutant de la lo-fi hip hop',
        'Débogué à 3h du matin (comme toujours)',
        'Optimisé pour les développeurs insomniaques',
        'Contient 0% de bugs... enfin on espère 😅'
      ],
      totalEasterEggs: 8
    }
  },
  mounted() {
    document.title = 'Changelog - Fusepoint Platform'
    this.setupKonamiCode()
    // Révéler le bug caché après 5 secondes
    setTimeout(() => {
      this.showHiddenBug = true
    }, 5000)
  },
  methods: {
    incrementClick() {
      this.clickCount++
      if (this.clickCount === 5) {
        this.showChatEgg = true
      }
    },
    toggleDevInfo() {
      this.showDevInfo = !this.showDevInfo
    },
    triggerChatEasterEgg() {
      this.showChatEgg = !this.showChatEgg
    },
    getRandomDevFact() {
      return this.devFacts[Math.floor(Math.random() * this.devFacts.length)]
    },
    setupKonamiCode() {
      document.addEventListener('keydown', (e) => {
        this.konamiCode.push(e.code)
        if (this.konamiCode.length > this.konamiSequence.length) {
          this.konamiCode.shift()
        }
        if (this.konamiCode.join('') === this.konamiSequence.join('')) {
          this.showKonamiEgg = true
          setTimeout(() => {
            this.showKonamiEgg = false
          }, 5000)
        }
      })
    }
  }
}
</script>

<style scoped>
.changelog-page {
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding-bottom: 2rem;
}

.changelog-header {
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
  color: white;
  padding: 3rem 0;
  text-align: center;
}

.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 2rem;
}

.changelog-header h1 {
  font-size: 3rem;
  margin-bottom: 1rem;
  font-weight: 700;
}

.subtitle {
  font-size: 1.2rem;
  margin-bottom: 2rem;
  opacity: 0.9;
}

.version-info {
  display: flex;
  justify-content: center;
  gap: 2rem;
  flex-wrap: wrap;
}

.current-version, .last-update {
  background: rgba(255, 255, 255, 0.2);
  padding: 0.5rem 1rem;
  border-radius: 20px;
  font-size: 0.9rem;
}

.changelog-content {
  padding: 3rem 0;
}

.changelog-section {
  background: white;
  border-radius: 15px;
  padding: 2rem;
  margin-bottom: 2rem;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
}

.changelog-section h2 {
  color: #667eea;
  font-size: 2rem;
  margin-bottom: 2rem;
  border-bottom: 3px solid #667eea;
  padding-bottom: 0.5rem;
}

.feature-category {
  margin-bottom: 3rem;
}

.feature-category h3 {
  color: #333;
  font-size: 1.5rem;
  margin-bottom: 1.5rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.feature-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 1.5rem;
}

.feature-card {
  background: #f8f9ff;
  border: 1px solid #e1e5f2;
  border-radius: 10px;
  padding: 1.5rem;
  transition: transform 0.2s, box-shadow 0.2s;
}

.feature-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.1);
}

.feature-status {
  display: inline-block;
  padding: 0.3rem 0.8rem;
  border-radius: 15px;
  font-size: 0.8rem;
  font-weight: 600;
  margin-bottom: 1rem;
}

.status-working {
  background: #d4edda;
  color: #155724;
}

.status-partial {
  background: #fff3cd;
  color: #856404;
}

.status-issue {
  background: #f8d7da;
  color: #721c24;
}

.status-critical {
  background: #f5c6cb;
  color: #721c24;
}

.feature-card h4 {
  color: #333;
  margin-bottom: 0.5rem;
  font-size: 1.1rem;
}

.feature-card p {
  color: #666;
  line-height: 1.5;
  margin: 0;
}

.bug-category {
  margin-bottom: 2rem;
}

.bug-category h3 {
  margin-bottom: 1rem;
  font-size: 1.3rem;
}

.priority-high {
  color: #dc3545;
}

.priority-medium {
  color: #ffc107;
}

.priority-low {
  color: #28a745;
}

.bug-list {
  list-style: none;
  padding: 0;
}

.bug-list li {
  background: #f8f9fa;
  border-left: 4px solid #667eea;
  padding: 1rem;
  margin-bottom: 0.5rem;
  border-radius: 0 8px 8px 0;
}

.roadmap-timeline {
  position: relative;
}

.roadmap-phase {
  margin-bottom: 3rem;
  position: relative;
}

.phase-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
  flex-wrap: wrap;
  gap: 1rem;
}

.phase-header h3 {
  color: #333;
  font-size: 1.5rem;
  margin: 0;
}

.phase-status {
  padding: 0.5rem 1rem;
  border-radius: 20px;
  font-size: 0.9rem;
  font-weight: 600;
}

.upcoming {
  background: #e3f2fd;
  color: #1976d2;
}

.future {
  background: #f3e5f5;
  color: #7b1fa2;
}

.phase-content {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1rem;
}

.roadmap-item {
  background: #f8f9ff;
  border: 1px solid #e1e5f2;
  border-radius: 8px;
  padding: 1rem;
}

.roadmap-item h4 {
  color: #667eea;
  margin-bottom: 0.5rem;
  font-size: 1rem;
}

.roadmap-item p {
  color: #666;
  margin: 0;
  font-size: 0.9rem;
  line-height: 1.4;
}

/* Easter Eggs Styles */
.konami-easter-egg {
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  background: linear-gradient(45deg, #ff6b6b, #4ecdc4, #45b7d1, #96ceb4, #ffeaa7);
  background-size: 300% 300%;
  animation: rainbow-bg 2s ease infinite, bounce 0.5s ease infinite alternate;
  color: white;
  padding: 2rem;
  border-radius: 20px;
  text-align: center;
  font-size: 1.5rem;
  font-weight: bold;
  z-index: 9999;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
}

.rainbow-text {
  background: linear-gradient(45deg, #ff6b6b, #4ecdc4, #45b7d1, #96ceb4, #ffeaa7, #ff6b6b);
  background-size: 300% 300%;
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  animation: rainbow-bg 3s ease infinite;
}

.click-easter-egg {
  position: fixed;
  top: 20px;
  right: 20px;
  background: #ff6b6b;
  color: white;
  padding: 1rem;
  border-radius: 15px;
  animation: wiggle 0.5s ease infinite;
  z-index: 1000;
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.2);
}

.clickable-title {
  cursor: pointer;
  transition: transform 0.2s, color 0.2s;
}

.clickable-title:hover {
  transform: scale(1.05);
  color: #ffeaa7;
}

.dev-info {
  background: rgba(255, 255, 255, 0.2);
  padding: 1rem;
  border-radius: 10px;
  margin: 1rem 0;
  animation: fadeInUp 0.5s ease;
  backdrop-filter: blur(5px);
}

.hidden-message {
  background: #e8f4fd;
  border: 2px dashed #4ecdc4;
  padding: 1rem;
  margin-top: 1rem;
  border-radius: 10px;
  animation: slideInDown 0.5s ease;
  font-style: italic;
  color: #2c3e50;
}

.secret-feature {
  background: linear-gradient(45deg, #667eea, #764ba2);
  color: white;
  padding: 0.5rem;
  border-radius: 8px;
  margin-top: 0.5rem;
  animation: pulse 1s ease infinite;
  text-align: center;
  font-weight: bold;
}

.easter-egg-bug {
  background: linear-gradient(45deg, #ff9a9e, #fecfef) !important;
  border-left: 4px solid #ff6b6b !important;
  cursor: pointer;
  transition: transform 0.2s;
}

.easter-egg-bug:hover {
  transform: translateX(10px);
}

.bug-message {
   background: #fff3cd;
   border: 1px solid #ffeaa7;
   padding: 0.5rem;
   margin-top: 0.5rem;
   border-radius: 5px;
   animation: fadeIn 0.3s ease;
   color: #856404;
 }
 
 .tesla-easter-egg {
   background: linear-gradient(45deg, #1a1a1a, #333333) !important;
   color: white !important;
   border: 2px solid #ff6b6b;
   cursor: pointer;
   transition: all 0.3s ease;
   position: relative;
   overflow: hidden;
 }
 
 .tesla-easter-egg:hover {
   transform: scale(1.02);
   box-shadow: 0 0 20px rgba(255, 107, 107, 0.5);
 }
 
 .tesla-easter-egg h4 {
   color: #ff6b6b !important;
 }
 
 .tesla-joke {
   background: rgba(255, 107, 107, 0.1);
   border: 1px dashed #ff6b6b;
   padding: 1rem;
   margin-top: 1rem;
   border-radius: 8px;
   animation: slideInDown 0.5s ease;
   font-style: italic;
   line-height: 1.6;
 }
 
 .tesla-joke small {
   opacity: 0.8;
   font-size: 0.8rem;
 }

/* Animations */
@keyframes rainbow-bg {
  0% { background-position: 0% 50%; }
  50% { background-position: 100% 50%; }
  100% { background-position: 0% 50%; }
}

@keyframes bounce {
  0% { transform: translate(-50%, -50%) scale(1); }
  100% { transform: translate(-50%, -50%) scale(1.1); }
}

@keyframes wiggle {
  0%, 100% { transform: rotate(0deg); }
  25% { transform: rotate(-3deg); }
  75% { transform: rotate(3deg); }
}

@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes slideInDown {
  from {
    opacity: 0;
    transform: translateY(-20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes pulse {
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.05); }
}

@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

@media (max-width: 768px) {
  .changelog-header h1 {
    font-size: 2rem;
  }
  
  .container {
    padding: 0 1rem;
  }
  
  .changelog-section {
    padding: 1.5rem;
  }
  
  .feature-grid {
    grid-template-columns: 1fr;
  }
  
  .phase-content {
    grid-template-columns: 1fr;
  }
  
  .version-info {
    flex-direction: column;
    gap: 1rem;
  }
  
  .konami-easter-egg {
    font-size: 1.2rem;
    padding: 1.5rem;
  }
  
  .click-easter-egg {
    top: 10px;
    right: 10px;
    padding: 0.8rem;
    font-size: 0.9rem;
  }
}
</style>