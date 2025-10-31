const axios = require('axios');

/**
 * Script de test authentifié pour les APIs de tableau de bord de projet
 */

const BASE_URL = 'http://localhost:3000/api';
const TEST_PROJECT_ID = 1;

// Configuration de test pour l'authentification
const TEST_USER = {
  email: 'admin@fusepoint.ch', // Utilisez un utilisateur existant
  password: 'admin123' // Mot de passe par défaut
};

const testDashboardLayout = {
  dashboard: {
    title: "Test Dashboard Authentifié",
    description: "Dashboard de test avec authentification"
  },
  layout: {
    columns: 3,
    spacing: 16
  },
  widgetsLayout: {
    "tasks": { x: 0, y: 0, w: 1, h: 2, enabled: true },
    "calendar": { x: 1, y: 0, w: 1, h: 2, enabled: true },
    "team": { x: 2, y: 0, w: 1, h: 1, enabled: true },
    "metrics": { x: 2, y: 1, w: 1, h: 1, enabled: true }
  }
};

async function authenticateUser() {
  console.log('🔐 Authentification...');
  try {
    const response = await axios.post(`${BASE_URL}/auth/login`, {
      email: TEST_USER.email,
      password: TEST_USER.password
    });
    
    if (response.data && response.data.token) {
      console.log('✅ Authentification réussie');
      return response.data.token;
    } else {
      throw new Error('Token non reçu');
    }
  } catch (error) {
    console.log('❌ Erreur d\'authentification:', error.response?.data?.message || error.message);
    console.log('💡 Vérifiez que l\'utilisateur admin@fusepoint.ch existe avec le mot de passe admin123');
    return null;
  }
}

async function testAuthenticatedDashboardAPIs(token) {
  console.log('\n🧪 Test des APIs de tableau de bord avec authentification');
  console.log('='.repeat(60));

  const headers = {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  };

  try {
    // Test 1: GET dashboard
    console.log('\n📊 Test 1: GET /api/projects/:projectId/dashboard');
    try {
      const getResponse = await axios.get(`${BASE_URL}/projects/${TEST_PROJECT_ID}/dashboard`, { headers });
      console.log('✅ GET réussi:', {
        status: getResponse.status,
        hasData: !!getResponse.data,
        version: getResponse.data?.version,
        hasLayout: !!getResponse.data?.layout_json
      });
    } catch (error) {
      if (error.response?.status === 404) {
        console.log('ℹ️  Dashboard non trouvé (normal pour un nouveau projet)');
      } else {
        console.log('❌ Erreur GET:', error.response?.status, error.response?.data?.message || error.message);
      }
    }

    // Test 2: PUT dashboard (créer/mettre à jour)
    console.log('\n📝 Test 2: PUT /api/projects/:projectId/dashboard');
    try {
      const putResponse = await axios.put(`${BASE_URL}/projects/${TEST_PROJECT_ID}/dashboard`, {
        layout_json: testDashboardLayout
      }, { headers });
      console.log('✅ PUT réussi:', {
        status: putResponse.status,
        message: putResponse.data?.message,
        version: putResponse.data?.version
      });
    } catch (error) {
      console.log('❌ Erreur PUT:', error.response?.status, error.response?.data?.message || error.message);
    }

    // Test 3: GET dashboard après mise à jour
    console.log('\n🔄 Test 3: GET après mise à jour');
    try {
      const getAfterPutResponse = await axios.get(`${BASE_URL}/projects/${TEST_PROJECT_ID}/dashboard`, { headers });
      const receivedLayout = getAfterPutResponse.data?.layout_json;
      const layoutMatches = JSON.stringify(receivedLayout) === JSON.stringify(testDashboardLayout);
      
      console.log('✅ GET après PUT réussi:', {
        status: getAfterPutResponse.status,
        version: getAfterPutResponse.data?.version,
        hasCorrectLayout: layoutMatches
      });

      if (!layoutMatches) {
        console.log('📋 Layout reçu:', JSON.stringify(receivedLayout, null, 2));
        console.log('📋 Layout attendu:', JSON.stringify(testDashboardLayout, null, 2));
      }
    } catch (error) {
      console.log('❌ Erreur GET après PUT:', error.response?.status, error.response?.data?.message || error.message);
    }

    // Test 4: Test de mise à jour avec version
    console.log('\n🔒 Test 4: PUT avec gestion de version');
    try {
      // D'abord, récupérer la version actuelle
      const currentResponse = await axios.get(`${BASE_URL}/projects/${TEST_PROJECT_ID}/dashboard`, { headers });
      const currentVersion = currentResponse.data?.version;

      if (currentVersion) {
        const updatedLayout = {
          ...testDashboardLayout,
          dashboard: {
            ...testDashboardLayout.dashboard,
            title: "Dashboard Mis à Jour avec Version"
          }
        };

        const putWithVersionResponse = await axios.put(`${BASE_URL}/projects/${TEST_PROJECT_ID}/dashboard`, {
          layout_json: updatedLayout
        }, {
          headers: {
            ...headers,
            'If-Match': currentVersion.toString()
          }
        });
        
        console.log('✅ PUT avec version réussi:', {
          status: putWithVersionResponse.status,
          oldVersion: currentVersion,
          newVersion: putWithVersionResponse.data?.version
        });
      } else {
        console.log('⚠️  Impossible de récupérer la version actuelle');
      }
    } catch (error) {
      if (error.response?.status === 412) {
        console.log('ℹ️  Conflit de version détecté (comportement attendu)');
      } else {
        console.log('❌ Erreur PUT avec version:', error.response?.status, error.response?.data?.message || error.message);
      }
    }

    // Test 5: Test de conflit de version intentionnel
    console.log('\n⚔️  Test 5: Test de conflit de version');
    try {
      const conflictLayout = {
        ...testDashboardLayout,
        dashboard: {
          ...testDashboardLayout.dashboard,
          title: "Conflit Intentionnel"
        }
      };

      await axios.put(`${BASE_URL}/projects/${TEST_PROJECT_ID}/dashboard`, {
        layout_json: conflictLayout
      }, {
        headers: {
          ...headers,
          'If-Match': '999' // Version inexistante
        }
      });
      
      console.log('⚠️  Conflit de version non détecté (inattendu)');
    } catch (error) {
      if (error.response?.status === 412) {
        console.log('✅ Conflit de version correctement détecté');
      } else {
        console.log('❌ Erreur inattendue:', error.response?.status, error.response?.data?.message || error.message);
      }
    }

    console.log('\n🎉 Tests authentifiés terminés !');
    console.log('='.repeat(60));

  } catch (error) {
    console.error('💥 Erreur générale lors des tests authentifiés:', error.message);
  }
}

async function runAuthenticatedTests() {
  console.log('🚀 Démarrage des tests authentifiés');
  console.log('='.repeat(60));

  const token = await authenticateUser();
  if (token) {
    await testAuthenticatedDashboardAPIs(token);
  } else {
    console.log('⚠️  Tests annulés - authentification échouée');
    process.exit(1);
  }
}

// Exécuter si appelé directement
if (require.main === module) {
  runAuthenticatedTests().catch(console.error);
}

module.exports = { runAuthenticatedTests };