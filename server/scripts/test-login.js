const axios = require('axios');

/**
 * Script pour tester la connexion avec les identifiants admin
 */
async function testLogin() {
  try {
    console.log('🔍 Test de connexion...');
    
    const response = await axios.post('http://localhost:3003/api/auth/login', {
      email: 'admin@fusepoint.com',
      password: 'admin123'
    }, {
      headers: {
        'Content-Type': 'application/json'
      }
    });
    
    console.log('✅ Connexion réussie!');
    console.log('👤 Utilisateur:', response.data.user);
    console.log('🏢 Entreprises:', response.data.companies?.length || 0);
    console.log('🔑 Token reçu:', response.data.tokens?.accessToken ? 'Oui' : 'Non');
    
  } catch (error) {
    console.error('❌ Erreur de connexion:');
    if (error.response) {
      console.error('Status:', error.response.status);
      console.error('Data:', error.response.data);
    } else if (error.request) {
      console.error('Pas de réponse du serveur:', error.message);
    } else {
      console.error('Erreur:', error.message);
    }
  }
}

// Exécuter le test
if (require.main === module) {
  testLogin();
}

module.exports = testLogin;