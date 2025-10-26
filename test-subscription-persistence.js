const axios = require('axios');

// Configuration
const API_BASE_URL = 'http://localhost:3000/api';
const TEST_USER = {
  email: 'test@example.com',
  password: 'testpassword123'
};

async function testSubscriptionPersistence() {
  console.log('🧪 Test de persistance du statut d\'abonnement\n');

  try {
    // 1. Test de connexion
    console.log('1️⃣ Test de connexion...');
    const loginResponse = await axios.post(`${API_BASE_URL}/auth/login`, TEST_USER);
    
    if (loginResponse.data.success) {
      console.log('✅ Connexion réussie');
      console.log('📊 Données utilisateur reçues:', {
        id: loginResponse.data.user.id,
        email: loginResponse.data.user.email,
        isPaid: loginResponse.data.user.isPaid
      });
      
      // Vérifier si isPaid est présent
      if (loginResponse.data.user.hasOwnProperty('isPaid')) {
        console.log('✅ Le statut d\'abonnement (isPaid) est présent dans la réponse de connexion');
      } else {
        console.log('❌ Le statut d\'abonnement (isPaid) est ABSENT de la réponse de connexion');
      }
    } else {
      console.log('❌ Échec de la connexion');
      return;
    }

    // 2. Test de l'endpoint /auth/me
    console.log('\n2️⃣ Test de l\'endpoint /auth/me...');
    const token = loginResponse.data.tokens.accessToken;
    
    const meResponse = await axios.get(`${API_BASE_URL}/auth/me`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    if (meResponse.data.success) {
      console.log('✅ Endpoint /auth/me accessible');
      console.log('📊 Données utilisateur reçues:', {
        id: meResponse.data.user.id,
        email: meResponse.data.user.email,
        isPaid: meResponse.data.user.isPaid
      });
      
      // Vérifier si isPaid est présent
      if (meResponse.data.user.hasOwnProperty('isPaid')) {
        console.log('✅ Le statut d\'abonnement (isPaid) est présent dans la réponse de /auth/me');
      } else {
        console.log('❌ Le statut d\'abonnement (isPaid) est ABSENT de la réponse de /auth/me');
      }
    } else {
      console.log('❌ Échec de l\'accès à /auth/me');
    }

    // 3. Comparaison des données
    console.log('\n3️⃣ Comparaison des données...');
    const loginIsPaid = loginResponse.data.user.isPaid;
    const meIsPaid = meResponse.data.user.isPaid;
    
    if (loginIsPaid === meIsPaid) {
      console.log('✅ Le statut d\'abonnement est cohérent entre login et /auth/me');
      console.log(`📊 Statut: ${loginIsPaid ? 'Payant' : 'Gratuit'}`);
    } else {
      console.log('❌ Incohérence du statut d\'abonnement entre login et /auth/me');
      console.log(`📊 Login: ${loginIsPaid}, /auth/me: ${meIsPaid}`);
    }

  } catch (error) {
    console.error('❌ Erreur lors du test:', error.message);
    if (error.response) {
      console.error('📊 Détails de l\'erreur:', {
        status: error.response.status,
        data: error.response.data
      });
    }
  }
}

// Exécuter le test
testSubscriptionPersistence();