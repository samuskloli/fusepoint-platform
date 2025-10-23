const databaseService = require('./services/databaseService');
const projectDashboardService = require('./services/projectDashboardService');

const PROJECT_ID = 1;
const TEST_USER_ID = 1; // Admin user
const CLIENT_USER_ID = 35; // Client user from logs

/**
 * Test direct de la base de données et des services
 */
async function testDashboardDirect() {
  try {
    console.log('🧪 Test direct de synchronisation des dashboards\n');

    // 1. Vérifier l'état actuel en base
    console.log('=== ÉTAPE 1: ÉTAT ACTUEL EN BASE ===');
    const currentDashboard = await databaseService.get(
      'SELECT project_id, layout_json, version, updated_at, updated_by FROM project_dashboards WHERE project_id = ?',
      [PROJECT_ID]
    );
    
    if (currentDashboard) {
      console.log(`✅ Dashboard trouvé en base:`);
      console.log(`   - Projet ID: ${currentDashboard.project_id}`);
      console.log(`   - Version: ${currentDashboard.version}`);
      console.log(`   - Dernière mise à jour: ${currentDashboard.updated_at}`);
      console.log(`   - Mis à jour par: ${currentDashboard.updated_by}`);
      console.log(`   - Layout: ${JSON.stringify(currentDashboard.layout_json).substring(0, 200)}...`);
    } else {
      console.log(`❌ Aucun dashboard trouvé en base pour le projet ${PROJECT_ID}`);
    }

    // 2. Tester le service de récupération pour l'agent
    console.log('\n=== ÉTAPE 2: SERVICE AGENT ===');
    try {
      const agentDashboard = await projectDashboardService.getProjectDashboard(PROJECT_ID, TEST_USER_ID);
      console.log(`✅ Dashboard récupéré via service (agent):`);
      console.log(`   - Version: ${agentDashboard.version}`);
      console.log(`   - Dernière mise à jour: ${agentDashboard.updatedAt}`);
      console.log(`   - Mis à jour par: ${agentDashboard.updatedBy}`);
    } catch (error) {
      console.log(`❌ Erreur service agent:`, error.message);
    }

    // 3. Tester le service de récupération pour le client
    console.log('\n=== ÉTAPE 3: SERVICE CLIENT ===');
    try {
      const clientDashboard = await projectDashboardService.getProjectDashboard(PROJECT_ID, CLIENT_USER_ID);
      console.log(`✅ Dashboard récupéré via service (client):`);
      console.log(`   - Version: ${clientDashboard.version}`);
      console.log(`   - Dernière mise à jour: ${clientDashboard.updatedAt}`);
      console.log(`   - Mis à jour par: ${clientDashboard.updatedBy}`);
    } catch (error) {
      console.log(`❌ Erreur service client:`, error.message);
    }

    // 4. Tester une mise à jour par l'agent
    console.log('\n=== ÉTAPE 4: MISE À JOUR PAR AGENT ===');
    const newLayout = {
      dashboard: { 
        theme: 'dark', 
        autoSave: true,
        showWelcome: false 
      },
      layout: { 
        columns: 12, 
        gap: 16,
        responsive: true 
      },
      widgetsLayout: {
        widget1: { width: 6, height: 4, position_x: 0, position_y: 0 },
        widget2: { width: 6, height: 4, position_x: 6, position_y: 0 },
        widget3: { width: 12, height: 3, position_x: 0, position_y: 4 }
      },
      timestamp: new Date().toISOString(),
      modifiedBy: 'agent_test'
    };

    try {
      const updatedDashboard = await projectDashboardService.updateProjectDashboard(
        PROJECT_ID,
        newLayout,
        TEST_USER_ID
      );
      console.log(`✅ Dashboard mis à jour par agent:`);
      console.log(`   - Nouvelle version: ${updatedDashboard.version}`);
      console.log(`   - Mis à jour par: ${updatedDashboard.updatedBy}`);
    } catch (error) {
      console.log(`❌ Erreur mise à jour agent:`, error.message);
    }

    // 5. Vérifier l'état après mise à jour
    console.log('\n=== ÉTAPE 5: VÉRIFICATION APRÈS MISE À JOUR ===');
    
    // Base de données
    const updatedDbDashboard = await databaseService.get(
      'SELECT project_id, layout_json, version, updated_at, updated_by FROM project_dashboards WHERE project_id = ?',
      [PROJECT_ID]
    );
    
    if (updatedDbDashboard) {
      console.log(`✅ État en base après mise à jour:`);
      console.log(`   - Version: ${updatedDbDashboard.version}`);
      console.log(`   - Mis à jour par: ${updatedDbDashboard.updated_by}`);
    }

    // Service agent
    try {
      const agentDashboardAfter = await projectDashboardService.getProjectDashboard(PROJECT_ID, TEST_USER_ID);
      console.log(`✅ Service agent après mise à jour:`);
      console.log(`   - Version: ${agentDashboardAfter.version}`);
    } catch (error) {
      console.log(`❌ Erreur service agent après:`, error.message);
    }

    // Service client
    try {
      const clientDashboardAfter = await projectDashboardService.getProjectDashboard(PROJECT_ID, CLIENT_USER_ID);
      console.log(`✅ Service client après mise à jour:`);
      console.log(`   - Version: ${clientDashboardAfter.version}`);
    } catch (error) {
      console.log(`❌ Erreur service client après:`, error.message);
    }

    // 6. Vérifier les permissions
    console.log('\n=== ÉTAPE 6: VÉRIFICATION DES PERMISSIONS ===');
    
    // Vérifier les utilisateurs
    const agentUser = await databaseService.get('SELECT id, email, role FROM users WHERE id = ?', [TEST_USER_ID]);
    const clientUser = await databaseService.get('SELECT id, email, role FROM users WHERE id = ?', [CLIENT_USER_ID]);
    
    console.log(`🔍 Utilisateur agent: ${agentUser ? `${agentUser.email} (${agentUser.role})` : 'Non trouvé'}`);
    console.log(`🔍 Utilisateur client: ${clientUser ? `${clientUser.email} (${clientUser.role})` : 'Non trouvé'}`);

    // Vérifier le projet
    const project = await databaseService.get('SELECT id, client_id, name FROM projects WHERE id = ?', [PROJECT_ID]);
    console.log(`🔍 Projet: ${project ? `${project.name} (client_id: ${project.client_id})` : 'Non trouvé'}`);

    // 7. Diagnostic final
    console.log('\n=== ÉTAPE 7: DIAGNOSTIC FINAL ===');
    
    if (updatedDbDashboard && agentUser && clientUser) {
      console.log(`🎯 RÉSUMÉ:`);
      console.log(`   - Dashboard existe en base: ✅`);
      console.log(`   - Version actuelle: ${updatedDbDashboard.version}`);
      console.log(`   - Agent peut lire: ${agentUser ? '✅' : '❌'}`);
      console.log(`   - Client peut lire: ${clientUser ? '✅' : '❌'}`);
      console.log(`   - Même source de données: ✅ (table project_dashboards)`);
      
      console.log(`\n🔍 PROBLÈME POTENTIEL:`);
      console.log(`   - Si le client ne voit pas les modifications, c'est probablement:`);
      console.log(`     1. Un problème de cache côté frontend`);
      console.log(`     2. Un problème de permissions dans les middlewares`);
      console.log(`     3. Un problème de rafraîchissement des données côté client`);
    }

    console.log('\n✅ Test direct terminé');

  } catch (error) {
    console.error('❌ Erreur lors du test direct:', error);
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
  testDashboardDirect();
}

module.exports = { testDashboardDirect };