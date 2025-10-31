const axios = require('axios');
const databaseService = require('./services/databaseService');

const BASE_URL = 'http://localhost:3000';

// Données de test
const CLIENT_EMAIL = 'samuskl@gmail.com';
const CLIENT_PASSWORD = 'password';
const AGENT_EMAIL = 'info@fusepoint.ch';
const AGENT_PASSWORD = 'password';
const PROJECT_ID = 1;

/**
 * Authentifier un utilisateur et récupérer son token
 */
async function authenticateUser(email, password) {
  try {
    console.log(`🔐 Authentification de ${email}...`);
    const response = await axios.post(`${BASE_URL}/api/auth/login`, {
      email,
      password
    });
    
    // Vérifier différents formats de réponse
    let token = null;
    if (response.data.success) {
      // Nouveau format avec tokens.accessToken
      if (response.data.tokens && response.data.tokens.accessToken) {
        token = response.data.tokens.accessToken;
      }
      // Ancien format avec token direct
      else if (response.data.token) {
        token = response.data.token;
      }
    }
    
    if (token) {
      console.log(`✅ ${email} authentifié avec succès`);
      return token;
    } else {
      console.log(`❌ Échec d'authentification pour ${email} - token non trouvé:`, response.data);
      return null;
    }
  } catch (error) {
    console.log(`❌ Erreur d'authentification pour ${email}:`, error.response?.data || error.message);
    return null;
  }
}

/**
 * Récupérer le dashboard d'un projet
 */
async function getDashboard(token, userLabel) {
  try {
    console.log(`📊 Récupération du dashboard pour ${userLabel}...`);
    const response = await axios.get(`${BASE_URL}/api/projects/${PROJECT_ID}/dashboard`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    if (response.data.success) {
      console.log(`✅ Dashboard récupéré pour ${userLabel}`);
      console.log(`   - Version: ${response.data.data.version}`);
      console.log(`   - Dernière mise à jour: ${response.data.data.updatedAt}`);
      console.log(`   - Mis à jour par: ${response.data.data.updatedBy}`);
      console.log(`   - Permissions d'édition: ${response.data.data.permissions?.canEdit}`);
      return response.data.data;
    } else {
      console.log(`❌ Échec de récupération du dashboard pour ${userLabel}:`, response.data);
      return null;
    }
  } catch (error) {
    console.log(`❌ Erreur de récupération du dashboard pour ${userLabel}:`, error.response?.data || error.message);
    return null;
  }
}

/**
 * Mettre à jour le dashboard (agent uniquement)
 */
async function updateDashboard(token, userLabel, newLayout) {
  try {
    console.log(`📝 Mise à jour du dashboard par ${userLabel}...`);
    const response = await axios.put(`${BASE_URL}/api/projects/${PROJECT_ID}/dashboard`, {
      layout: newLayout,
      version: 1 // Version de test
    }, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    if (response.data.success) {
      console.log(`✅ Dashboard mis à jour par ${userLabel}`);
      console.log(`   - Nouvelle version: ${response.data.data.version}`);
      return response.data.data;
    } else {
      console.log(`❌ Échec de mise à jour du dashboard par ${userLabel}:`, response.data);
      return null;
    }
  } catch (error) {
    console.log(`❌ Erreur de mise à jour du dashboard par ${userLabel}:`, error.response?.data || error.message);
    return null;
  }
}

/**
 * Vérifier directement en base de données
 */
async function checkDatabaseDashboard() {
  try {
    console.log(`🗄️ Vérification directe en base de données...`);
    const dashboard = await databaseService.get(
      'SELECT project_id, layout_json, version, updated_at, updated_by FROM project_dashboards WHERE project_id = ?',
      [PROJECT_ID]
    );
    
    if (dashboard) {
      console.log(`✅ Dashboard trouvé en base:`);
      console.log(`   - Projet ID: ${dashboard.project_id}`);
      console.log(`   - Version: ${dashboard.version}`);
      console.log(`   - Dernière mise à jour: ${dashboard.updated_at}`);
      console.log(`   - Mis à jour par: ${dashboard.updated_by}`);
      console.log(`   - Layout (100 premiers caractères): ${JSON.stringify(dashboard.layout_json).substring(0, 100)}...`);
      return dashboard;
    } else {
      console.log(`❌ Aucun dashboard trouvé en base pour le projet ${PROJECT_ID}`);
      return null;
    }
  } catch (error) {
    console.log(`❌ Erreur de vérification en base:`, error.message);
    return null;
  }
}

/**
 * Test principal
 */
async function testDashboardSync() {
  try {
    console.log('🧪 Test de synchronisation des dashboards agent/client\n');

    // 1. Authentifier les utilisateurs
    console.log('=== ÉTAPE 1: AUTHENTIFICATION ===');
    const clientToken = await authenticateUser(CLIENT_EMAIL, CLIENT_PASSWORD);
    const agentToken = await authenticateUser(AGENT_EMAIL, AGENT_PASSWORD);
    
    if (!clientToken || !agentToken) {
      console.log('❌ Impossible de continuer sans authentification');
      return;
    }

    // 2. Récupérer les dashboards initiaux
    console.log('\n=== ÉTAPE 2: DASHBOARDS INITIAUX ===');
    const clientDashboardInitial = await getDashboard(clientToken, 'CLIENT');
    const agentDashboardInitial = await getDashboard(agentToken, 'AGENT');
    const dbDashboardInitial = await checkDatabaseDashboard();

    // 3. Comparer les versions initiales
    console.log('\n=== ÉTAPE 3: COMPARAISON INITIALE ===');
    if (clientDashboardInitial && agentDashboardInitial) {
      const sameVersion = clientDashboardInitial.version === agentDashboardInitial.version;
      console.log(`🔍 Versions identiques: ${sameVersion ? '✅' : '❌'}`);
      console.log(`   - Client: ${clientDashboardInitial.version}`);
      console.log(`   - Agent: ${agentDashboardInitial.version}`);
      console.log(`   - Base: ${dbDashboardInitial?.version}`);
    }

    // 4. Modifier le dashboard côté agent
    console.log('\n=== ÉTAPE 4: MODIFICATION PAR L\'AGENT ===');
    const newLayout = {
      dashboard: { theme: 'dark', autoSave: true },
      layout: { columns: 12, gap: 16 },
      widgetsLayout: {
        widget1: { width: 6, height: 4, position_x: 0, position_y: 0 },
        widget2: { width: 6, height: 4, position_x: 6, position_y: 0 }
      },
      timestamp: new Date().toISOString()
    };
    
    const updatedDashboard = await updateDashboard(agentToken, 'AGENT', newLayout);

    // 5. Vérifier la synchronisation
    console.log('\n=== ÉTAPE 5: VÉRIFICATION APRÈS MODIFICATION ===');
    const clientDashboardAfter = await getDashboard(clientToken, 'CLIENT');
    const agentDashboardAfter = await getDashboard(agentToken, 'AGENT');
    const dbDashboardAfter = await checkDatabaseDashboard();

    // 6. Analyser les résultats
    console.log('\n=== ÉTAPE 6: ANALYSE DES RÉSULTATS ===');
    if (clientDashboardAfter && agentDashboardAfter && dbDashboardAfter) {
      const clientVersion = clientDashboardAfter.version;
      const agentVersion = agentDashboardAfter.version;
      const dbVersion = dbDashboardAfter.version;
      
      console.log(`🔍 Versions après modification:`);
      console.log(`   - Client: ${clientVersion}`);
      console.log(`   - Agent: ${agentVersion}`);
      console.log(`   - Base: ${dbVersion}`);
      
      const allSynced = clientVersion === agentVersion && agentVersion === dbVersion;
      console.log(`\n🎯 Synchronisation: ${allSynced ? '✅ RÉUSSIE' : '❌ ÉCHOUÉE'}`);
      
      if (!allSynced) {
        console.log('\n🔍 DIAGNOSTIC DU PROBLÈME:');
        if (clientVersion !== agentVersion) {
          console.log('   ❌ Le client ne voit pas les modifications de l\'agent');
        }
        if (agentVersion !== dbVersion) {
          console.log('   ❌ L\'agent ne voit pas les données de la base');
        }
        if (clientVersion !== dbVersion) {
          console.log('   ❌ Le client ne voit pas les données de la base');
        }
      }
    }

    console.log('\n✅ Test terminé');

  } catch (error) {
    console.error('❌ Erreur lors du test:', error);
  } finally {
    // Fermer la connexion à la base de données
    try {
      await databaseService.close();
    } catch (e) {
      // Ignorer les erreurs de fermeture
    }
  }
}

// Exécuter le test
if (require.main === module) {
  testDashboardSync();
}

module.exports = { testDashboardSync };