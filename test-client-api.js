#!/usr/bin/env node

/**
 * Script de test pour diagnostiquer les problèmes de l'API client
 */

import { createRequire } from 'module';
const require = createRequire(import.meta.url);

const fetch = require('node-fetch');

async function testClientAPI() {
  try {
    console.log('🔍 Test de l\'API client - Diagnostic des timeouts\n');
    
    // Test de connexion d'abord
    console.log('🔐 1. Test de connexion...');
    const loginResponse = await fetch('http://localhost:3000/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'info@fusepoint.ch',
        password: 'admin123'
      })
    });
    
    if (!loginResponse.ok) {
      console.log('❌ Échec de connexion:', loginResponse.status);
      const errorText = await loginResponse.text();
      console.log('Erreur:', errorText);
      return;
    }
    
    const loginData = await loginResponse.json();
    console.log('✅ Connexion réussie');
    
    const token = loginData.token || loginData.accessToken;
    if (!token) {
      console.log('❌ Pas de token reçu');
      console.log('Réponse de connexion:', loginData);
      return;
    }
    
    console.log('🔑 Token reçu:', token.substring(0, 20) + '...');
    
    // Test de l'endpoint projects
    console.log('\n📋 2. Test de récupération des projets...');
    const projectsResponse = await fetch('http://localhost:3000/api/client/projects', {
      headers: { 
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    
    if (!projectsResponse.ok) {
      console.log('❌ Échec récupération projets:', projectsResponse.status);
      const errorText = await projectsResponse.text();
      console.log('Erreur:', errorText);
      return;
    }
    
    const projects = await projectsResponse.json();
    console.log('✅ Projets récupérés:', projects.length, 'projets');
    
    if (projects.length > 0) {
      const projectId = projects[0].id;
      console.log(`\n🔍 3. Test de récupération du projet ${projectId}...`);
      
      const startTime = Date.now();
      const projectResponse = await fetch(`http://localhost:3000/api/client/projects/${projectId}`, {
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      const endTime = Date.now();
      
      console.log(`⏱️ Temps de réponse: ${endTime - startTime}ms`);
      
      if (!projectResponse.ok) {
        console.log('❌ Échec récupération projet:', projectResponse.status);
        const errorText = await projectResponse.text();
        console.log('Erreur:', errorText);
        return;
      }
      
      const project = await projectResponse.json();
      console.log('✅ Projet récupéré:', project.name || project.title);
      console.log('📊 Détails du projet:', {
        id: project.id,
        status: project.status,
        client_id: project.client_id
      });
    } else {
      console.log('ℹ️ Aucun projet trouvé pour ce client');
    }
    
    // Test avec le projet ID 47 spécifiquement mentionné dans l'erreur
    console.log('\n🎯 4. Test spécifique du projet ID 47...');
    const startTime47 = Date.now();
    const project47Response = await fetch('http://localhost:3000/api/client/projects/47', {
      headers: { 
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    const endTime47 = Date.now();
    
    console.log(`⏱️ Temps de réponse projet 47: ${endTime47 - startTime47}ms`);
    
    if (!project47Response.ok) {
      console.log('❌ Échec récupération projet 47:', project47Response.status);
      const errorText = await project47Response.text();
      console.log('Erreur:', errorText);
    } else {
      const project47 = await project47Response.json();
      console.log('✅ Projet 47 récupéré:', project47.name || project47.title);
    }
    
  } catch (error) {
    console.error('❌ Erreur:', error.message);
    if (error.code === 'ECONNABORTED') {
      console.log('🔥 Timeout détecté - le serveur ne répond pas assez rapidement');
    }
  }
}

testClientAPI().catch(console.error);