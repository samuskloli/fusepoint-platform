/**
 * Script de débogage pour identifier le problème de déconnexion automatique
 */

const axios = require('axios');

// Configuration
const BASE_URL = 'http://localhost:3002';
const TEST_EMAIL = 'test@example.com';
const TEST_PASSWORD = 'TestPassword123!';

async function debugAuth() {
  console.log('🔍 Début du débogage d\'authentification...');
  
  try {
    // 1. Test de connexion
    console.log('\n1. Test de connexion...');
    const loginResponse = await axios.post(`${BASE_URL}/api/auth/login`, {
      email: TEST_EMAIL,
      password: TEST_PASSWORD
    });
    
    console.log('✅ Connexion réussie:', {
      success: loginResponse.data.success,
      user: loginResponse.data.user?.email,
      role: loginResponse.data.user?.role,
      hasToken: !!loginResponse.data.accessToken
    });
    
    const { accessToken, refreshToken, sessionToken } = loginResponse.data;
    
    // 2. Test de vérification du token
    console.log('\n2. Test de vérification du token...');
    const meResponse = await axios.get(`${BASE_URL}/api/auth/me`, {
      headers: {
        'Authorization': `Bearer ${accessToken}`
      }
    });
    
    console.log('✅ Token valide:', {
      user: meResponse.data.user?.email,
      companies: meResponse.data.companies?.length || 0
    });
    
    // 3. Test de déconnexion
    console.log('\n3. Test de déconnexion...');
    const logoutResponse = await axios.post(`${BASE_URL}/api/auth/logout`, {
      sessionToken
    }, {
      headers: {
        'Authorization': `Bearer ${accessToken}`
      }
    });
    
    console.log('✅ Déconnexion réussie:', logoutResponse.data);
    
    // 4. Test avec token après déconnexion
    console.log('\n4. Test avec token après déconnexion...');
    try {
      await axios.get(`${BASE_URL}/api/auth/me`, {
        headers: {
          'Authorization': `Bearer ${accessToken}`
        }
      });
      console.log('❌ Le token devrait être invalide après déconnexion');
    } catch (error) {
      console.log('✅ Token correctement invalidé après déconnexion:', error.response?.status);
    }
    
  } catch (error) {
    console.error('❌ Erreur lors du test:', {
      message: error.message,
      status: error.response?.status,
      data: error.response?.data
    });
  }
}

// Exécuter le test
debugAuth();