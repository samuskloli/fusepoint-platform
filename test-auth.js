#!/usr/bin/env node

/**
 * Script de test d'authentification
 * Teste les endpoints d'authentification et diagnostique les problèmes
 */

import fetch from 'node-fetch';

const API_BASE = 'http://localhost:3000/api';

console.log('🔍 Test d\'authentification Fusepoint Platform\n');

async function testEndpoint(url, options = {}) {
  try {
    console.log(`📡 Test: ${options.method || 'GET'} ${url}`);
    const response = await fetch(url, {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers
      },
      ...options
    });
    
    const data = await response.text();
    let jsonData;
    try {
      jsonData = JSON.parse(data);
    } catch {
      jsonData = data;
    }
    
    console.log(`   Status: ${response.status} ${response.statusText}`);
    console.log(`   Response:`, jsonData);
    console.log('');
    
    return { status: response.status, data: jsonData, response };
  } catch (error) {
    console.log(`   ❌ Erreur: ${error.message}`);
    console.log('');
    return { error: error.message };
  }
}

async function runTests() {
  console.log('1. Test de santé du serveur');
  await testEndpoint(`${API_BASE}/../health`);
  
  console.log('2. Test endpoint /auth/me sans token');
  await testEndpoint(`${API_BASE}/auth/me`);
  
  console.log('3. Test endpoint /auth/me avec token invalide');
  await testEndpoint(`${API_BASE}/auth/me`, {
    headers: {
      'Authorization': 'Bearer invalid_token'
    }
  });
  
  console.log('4. Test de connexion avec des identifiants de test');
  const loginResult = await testEndpoint(`${API_BASE}/auth/login`, {
    method: 'POST',
    body: JSON.stringify({
      email: 'info@fusepoint.ch',
      password: 'admin123'
    })
  });
  
  if (loginResult.status === 200 && loginResult.data.accessToken) {
    console.log('5. Test endpoint /auth/me avec token valide');
    await testEndpoint(`${API_BASE}/auth/me`, {
      headers: {
        'Authorization': `Bearer ${loginResult.data.accessToken}`
      }
    });
    
    console.log('6. Test endpoint dashboard avec token valide');
    await testEndpoint(`${API_BASE}/agent/projects/47/team`, {
      headers: {
        'Authorization': `Bearer ${loginResult.data.accessToken}`
      }
    });
  }
  
  console.log('✅ Tests terminés');
}

runTests().catch(console.error);