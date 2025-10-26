const axios = require('axios');

const API_BASE_URL = 'http://localhost:3000/api';

async function testSubscriptionFix() {
  console.log('🧪 Test de correction du statut d\'abonnement...\n');

  try {
    // Test 1: Connexion
    console.log('1️⃣ Test de connexion...');
    const loginResponse = await axios.post(`${API_BASE_URL}/auth/login`, {
      email: 'admin@fusepoint.com',
      password: 'admin123'
    });

    if (loginResponse.data.success) {
      console.log('✅ Connexion réussie');
      console.log('📊 Statut d\'abonnement dans la réponse de login:', loginResponse.data.user.isPaid);
      
      const accessToken = loginResponse.data.accessToken;

      // Test 2: Endpoint /auth/me
      console.log('\n2️⃣ Test de l\'endpoint /auth/me...');
      const meResponse = await axios.get(`${API_BASE_URL}/auth/me`, {
        headers: {
          'Authorization': `Bearer ${accessToken}`
        }
      });

      if (meResponse.data.success) {
        console.log('✅ Endpoint /auth/me fonctionne');
        console.log('📊 Statut d\'abonnement dans /auth/me:', meResponse.data.user.isPaid);
      } else {
        console.log('❌ Erreur dans /auth/me:', meResponse.data);
      }

      // Test 3: Cohérence des données
      console.log('\n3️⃣ Test de cohérence...');
      const loginIsPaid = loginResponse.data.user.isPaid;
      const meIsPaid = meResponse.data.user.isPaid;
      
      if (loginIsPaid === meIsPaid) {
        console.log('✅ Les statuts d\'abonnement sont cohérents entre login et /auth/me');
      } else {
        console.log('❌ Incohérence détectée:');
        console.log(`   Login isPaid: ${loginIsPaid}`);
        console.log(`   /auth/me isPaid: ${meIsPaid}`);
      }

    } else {
      console.log('❌ Échec de la connexion:', loginResponse.data);
    }

  } catch (error) {
    console.log('❌ Erreur lors du test:', error.response?.data || error.message);
    if (error.response?.status === 500) {
      console.log('🚨 Erreur 500 détectée - le problème persiste');
    }
  }

  console.log('\n🏁 Test terminé');
}

testSubscriptionFix();