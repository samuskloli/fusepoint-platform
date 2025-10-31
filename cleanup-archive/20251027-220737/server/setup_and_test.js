const databaseService = require('./services/databaseService');
const axios = require('axios');

/**
 * Script pour configurer un utilisateur de test et tester les APIs de dashboard
 */

const BASE_URL = 'http://localhost:3000/api';
const TEST_PROJECT_ID = 1;

const TEST_USER = {
  email: 'test@fusepoint.ch',
  password: 'test123',
  firstName: 'Test',
  lastName: 'User',
  role: 'admin'
};

const testDashboardLayout = {
  dashboard: {
    title: "Dashboard de Test",
    description: "Dashboard créé par le script de test"
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

async function setupTestUser() {
  console.log('👤 Configuration de l\'utilisateur de test...');
  
  try {
    // Vérifier si l'utilisateur existe déjà
    const existingUser = await databaseService.getUserByEmail(TEST_USER.email, false);
    if (existingUser) {
      console.log('✅ Utilisateur de test existe déjà');
      return true;
    }

    // Créer l'utilisateur de test
    const userData = {
      email: TEST_USER.email,
      password: TEST_USER.password,
      firstName: TEST_USER.firstName,
      lastName: TEST_USER.lastName,
      role: TEST_USER.role,
      isActive: true,
      isEmailConfirmed: true
    };

    await databaseService.createUser(userData, false); // Ne pas envoyer d'email de confirmation
    console.log('✅ Utilisateur de test créé avec succès');
    return true;
  } catch (error) {
    console.error('❌ Erreur lors de la création de l\'utilisateur de test:', error.message);
    return false;
  }
}

async function setupTestProject() {
  console.log('📁 Configuration du projet de test...');
  
  try {
    // Vérifier si le projet existe
    const existingProject = await databaseService.getProjectById(TEST_PROJECT_ID);
    if (existingProject) {
      console.log('✅ Projet de test existe déjà');
      return true;
    }

    // Créer un projet de test simple
    const projectQuery = `
      INSERT INTO projects (id, name, description, status, created_at, updated_at)
      VALUES (?, ?, ?, ?, NOW(), NOW())
      ON DUPLICATE KEY UPDATE name = VALUES(name)
    `;
    
    await databaseService.query(projectQuery, [
      TEST_PROJECT_ID,
      'Projet de Test Dashboard',
      'Projet créé pour tester les APIs de dashboard',
      'active'
    ]);
    
    console.log('✅ Projet de test créé avec succès');
    return true;
  } catch (error) {
    console.error('❌ Erreur lors de la création du projet de test:', error.message);
    return false;
  }
}

async function authenticateTestUser() {
  console.log('🔐 Authentification de l\'utilisateur de test...');
  
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
    console.error('❌ Erreur d\'authentification:', error.response?.data?.message || error.message);
    return null;
  }
}

async function testDashboardAPIs(token) {
  console.log('\n🧪 Test des APIs de tableau de bord');
  console.log('='.repeat(50));

  const headers = {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  };

  let testResults = {
    get: false,
    put: false,
    getAfterPut: false,
    versionControl: false
  };

  try {
    // Test 1: GET dashboard initial
    console.log('\n📊 Test 1: GET dashboard initial');
    try {
      const getResponse = await axios.get(`${BASE_URL}/projects/${TEST_PROJECT_ID}/dashboard`, { headers });
      console.log('✅ GET réussi:', {
        status: getResponse.status,
        version: getResponse.data?.version
      });
      testResults.get = true;
    } catch (error) {
      if (error.response?.status === 404) {
        console.log('ℹ️  Dashboard non trouvé (normal pour un nouveau projet)');
        testResults.get = true; // C'est un comportement attendu
      } else {
        console.log('❌ Erreur GET:', error.response?.status, error.response?.data?.message || error.message);
      }
    }

    // Test 2: PUT dashboard
    console.log('\n📝 Test 2: Création/mise à jour du dashboard');
    try {
      const putResponse = await axios.put(`${BASE_URL}/projects/${TEST_PROJECT_ID}/dashboard`, {
        layout_json: testDashboardLayout
      }, { headers });
      
      console.log('✅ PUT réussi:', {
        status: putResponse.status,
        message: putResponse.data?.message,
        version: putResponse.data?.version
      });
      testResults.put = true;
    } catch (error) {
      console.log('❌ Erreur PUT:', error.response?.status, error.response?.data?.message || error.message);
    }

    // Test 3: GET dashboard après mise à jour
    console.log('\n🔄 Test 3: Vérification après mise à jour');
    try {
      const getAfterPutResponse = await axios.get(`${BASE_URL}/projects/${TEST_PROJECT_ID}/dashboard`, { headers });
      const receivedLayout = getAfterPutResponse.data?.layout_json;
      
      console.log('✅ GET après PUT réussi:', {
        status: getAfterPutResponse.status,
        version: getAfterPutResponse.data?.version,
        hasLayout: !!receivedLayout
      });
      testResults.getAfterPut = true;
    } catch (error) {
      console.log('❌ Erreur GET après PUT:', error.response?.status, error.response?.data?.message || error.message);
    }

    // Test 4: Test de contrôle de version
    console.log('\n🔒 Test 4: Contrôle de version');
    try {
      // Tentative de mise à jour avec une mauvaise version
      await axios.put(`${BASE_URL}/projects/${TEST_PROJECT_ID}/dashboard`, {
        layout_json: { ...testDashboardLayout, test: 'conflict' }
      }, {
        headers: {
          ...headers,
          'If-Match': '999' // Version inexistante
        }
      });
      
      console.log('⚠️  Contrôle de version non fonctionnel');
    } catch (error) {
      if (error.response?.status === 412) {
        console.log('✅ Contrôle de version fonctionne correctement');
        testResults.versionControl = true;
      } else {
        console.log('❌ Erreur inattendue:', error.response?.status, error.response?.data?.message || error.message);
      }
    }

    // Résumé des tests
    console.log('\n📊 Résumé des tests:');
    console.log('='.repeat(30));
    Object.entries(testResults).forEach(([test, success]) => {
      console.log(`${success ? '✅' : '❌'} ${test}: ${success ? 'RÉUSSI' : 'ÉCHOUÉ'}`);
    });

    const allTestsPassed = Object.values(testResults).every(result => result);
    console.log(`\n🎯 Résultat global: ${allTestsPassed ? '✅ TOUS LES TESTS RÉUSSIS' : '❌ CERTAINS TESTS ONT ÉCHOUÉ'}`);

    return allTestsPassed;

  } catch (error) {
    console.error('💥 Erreur générale lors des tests:', error.message);
    return false;
  }
}

async function runCompleteTest() {
  console.log('🚀 Démarrage du test complet des APIs de dashboard');
  console.log('='.repeat(60));

  try {
    // Initialiser la base de données
    await databaseService.initialize();
    console.log('✅ Base de données initialisée');

    // Configurer l'utilisateur de test
    const userSetup = await setupTestUser();
    if (!userSetup) {
      console.log('❌ Échec de la configuration de l\'utilisateur');
      return false;
    }

    // Configurer le projet de test
    const projectSetup = await setupTestProject();
    if (!projectSetup) {
      console.log('❌ Échec de la configuration du projet');
      return false;
    }

    // Attendre un peu pour que le serveur soit prêt
    console.log('⏳ Attente de la disponibilité du serveur...');
    await new Promise(resolve => setTimeout(resolve, 2000));

    // Authentifier l'utilisateur
    const token = await authenticateTestUser();
    if (!token) {
      console.log('❌ Échec de l\'authentification');
      return false;
    }

    // Tester les APIs
    const testSuccess = await testDashboardAPIs(token);
    
    console.log('\n🏁 Test complet terminé');
    console.log('='.repeat(60));
    
    return testSuccess;

  } catch (error) {
    console.error('💥 Erreur lors du test complet:', error.message);
    return false;
  }
}

// Exécuter si appelé directement
if (require.main === module) {
  runCompleteTest()
    .then((success) => {
      process.exit(success ? 0 : 1);
    })
    .catch((error) => {
      console.error('Erreur fatale:', error);
      process.exit(1);
    });
}

module.exports = { runCompleteTest };