const axios = require('axios');

const BASE_URL = 'http://localhost:3000';
const PROJECT_ID = '1';
const CLIENT_ID = '17';

async function testAPISynchronization() {
  console.log('=== TEST DE SYNCHRONISATION DES APIs ===\n');

  try {
    // Test 1: API Dashboard de projet (utilisée par l'agent)
    console.log('🔍 TEST 1: API Dashboard de projet (/api/projects/{id}/dashboard)');
    try {
      const dashboardResponse = await axios.get(`${BASE_URL}/api/projects/${PROJECT_ID}/dashboard`);
      console.log('✅ Réponse API Dashboard:');
      console.log('   - Status:', dashboardResponse.status);
      console.log('   - Version:', dashboardResponse.data?.version || 'N/A');
      console.log('   - Dernière mise à jour:', dashboardResponse.data?.updated_at || 'N/A');
      console.log('   - Widgets layout:', Object.keys(dashboardResponse.data?.layout?.widgetsLayout || {}).length, 'widgets');
    } catch (error) {
      console.log('❌ Erreur API Dashboard:', error.response?.status, error.response?.statusText);
    }

    console.log('\n' + '='.repeat(60) + '\n');

    // Test 2: API Widgets Client (utilisée par le client)
    console.log('🔍 TEST 2: API Widgets Client (/api/client-widget-configs/{clientId}/projects/{projectId}/widgets)');
    try {
      const widgetsResponse = await axios.get(`${BASE_URL}/api/client-widget-configs/${CLIENT_ID}/projects/${PROJECT_ID}/widgets`);
      console.log('✅ Réponse API Widgets:');
      console.log('   - Status:', widgetsResponse.status);
      console.log('   - Nombre de widgets:', Array.isArray(widgetsResponse.data) ? widgetsResponse.data.length : 'N/A');
      console.log('   - Premier widget:', widgetsResponse.data?.[0]?.widget_type || 'N/A');
      console.log('   - Positions des widgets:');
      if (Array.isArray(widgetsResponse.data)) {
        widgetsResponse.data.forEach(widget => {
          console.log(`     - ${widget.widget_type}: x=${widget.position_x}, y=${widget.position_y}, w=${widget.width}, h=${widget.height}`);
        });
      }
    } catch (error) {
      console.log('❌ Erreur API Widgets:', error.response?.status, error.response?.statusText);
    }

    console.log('\n' + '='.repeat(60) + '\n');

    // Test 3: Comparaison des données
    console.log('🔍 TEST 3: Comparaison des sources de données');
    
    try {
      const [dashboardRes, widgetsRes] = await Promise.all([
        axios.get(`${BASE_URL}/api/projects/${PROJECT_ID}/dashboard`).catch(e => ({ error: e })),
        axios.get(`${BASE_URL}/api/client-widget-configs/${CLIENT_ID}/projects/${PROJECT_ID}/widgets`).catch(e => ({ error: e }))
      ]);

      if (dashboardRes.error || widgetsRes.error) {
        console.log('❌ Impossible de comparer - erreurs dans les APIs');
        return;
      }

      const dashboardWidgets = dashboardRes.data?.layout?.widgetsLayout || {};
      const clientWidgets = widgetsRes.data || [];

      console.log('📊 COMPARAISON:');
      console.log(`   - Dashboard API: ${Object.keys(dashboardWidgets).length} widgets configurés`);
      console.log(`   - Client API: ${clientWidgets.length} widgets disponibles`);

      // Vérifier si les positions correspondent
      let positionsMatch = true;
      clientWidgets.forEach(widget => {
        const dashboardWidget = dashboardWidgets[`widget${widget.id}`] || dashboardWidgets[widget.widget_type];
        if (dashboardWidget) {
          const posMatch = (
            dashboardWidget.position_x === widget.position_x &&
            dashboardWidget.position_y === widget.position_y &&
            dashboardWidget.width === widget.width &&
            dashboardWidget.height === widget.height
          );
          if (!posMatch) {
            positionsMatch = false;
            console.log(`   ⚠️  Widget ${widget.widget_type} - positions différentes:`);
            console.log(`       Dashboard: x=${dashboardWidget.position_x}, y=${dashboardWidget.position_y}, w=${dashboardWidget.width}, h=${dashboardWidget.height}`);
            console.log(`       Client: x=${widget.position_x}, y=${widget.position_y}, w=${widget.width}, h=${widget.height}`);
          }
        }
      });

      if (positionsMatch) {
        console.log('   ✅ Les positions des widgets correspondent');
      } else {
        console.log('   ❌ PROBLÈME: Les positions des widgets ne correspondent PAS');
      }

    } catch (error) {
      console.log('❌ Erreur lors de la comparaison:', error.message);
    }

    console.log('\n' + '='.repeat(60) + '\n');

    // Test 4: Diagnostic du problème
    console.log('🎯 DIAGNOSTIC:');
    console.log('   1. L\'agent utilise: /api/projects/{id}/dashboard');
    console.log('   2. Le client utilise: /api/client-widget-configs/{clientId}/projects/{projectId}/widgets');
    console.log('   3. Ces deux APIs utilisent des tables différentes:');
    console.log('      - Dashboard API → table "project_dashboards"');
    console.log('      - Client API → table "client_widget_configs"');
    console.log('   4. Quand l\'agent modifie le dashboard, seule la table "project_dashboards" est mise à jour');
    console.log('   5. Le client continue à lire depuis "client_widget_configs" (données obsolètes)');
    
    console.log('\n💡 SOLUTION RECOMMANDÉE:');
    console.log('   - Unifier les APIs pour utiliser la même source de données');
    console.log('   - Ou synchroniser automatiquement les deux tables');
    console.log('   - Ou migrer le client vers l\'API Dashboard unifiée');

  } catch (error) {
    console.error('❌ Erreur générale:', error.message);
  }
}

// Exécuter le test
testAPISynchronization().then(() => {
  console.log('\n✅ Test terminé');
}).catch(error => {
  console.error('❌ Échec du test:', error.message);
});