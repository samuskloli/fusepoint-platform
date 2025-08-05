const axios = require('axios');

/**
 * Script de test direct pour la connexion
 * Teste la route /api/auth/login avec les identifiants réinitialisés
 */
async function testLogin() {
  console.log('🧪 Test de connexion direct...');
  
  try {
    const response = await axios.post('http://localhost:3003/api/auth/login', {
      email: 'admin@fusepoint.com',
      password: 'admin123'
    }, {
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'Test-Script/1.0'
      },
      timeout: 10000
    });
    
    console.log('✅ Connexion réussie!');
    console.log('📊 Statut:', response.status);
    console.log('👤 Utilisateur:', response.data.user?.firstName, response.data.user?.lastName);
    console.log('🔑 Rôle:', response.data.user?.role);
    console.log('🎯 Tokens reçus:', {
      accessToken: response.data.accessToken ? 'Présent' : 'Absent',
      refreshToken: response.data.refreshToken ? 'Présent' : 'Absent',
      sessionToken: response.data.sessionToken ? 'Présent' : 'Absent'
    });
    
  } catch (error) {
    console.error('❌ Erreur de connexion:');
    console.error('🔍 Erreur complète:', error);
    console.error('📊 Statut:', error.response?.status);
    console.error('📝 Message:', error.response?.data?.error || error.message);
    console.error('🔍 Détails:', error.response?.data);
    console.error('🌐 Code erreur:', error.code);
    
    if (error.response?.status === 500) {
      console.error('🚨 Erreur serveur 500 - Vérifiez les logs du serveur');
    }
    
    if (error.code === 'ECONNREFUSED') {
      console.error('🚨 Connexion refusée - Le serveur n\'est peut-être pas démarré');
    }
  }
}

// Exécuter le test
testLogin();