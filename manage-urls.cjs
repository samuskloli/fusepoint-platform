#!/usr/bin/env node

/**
 * Script de gestion des URLs pour basculer entre développement et production
 */

const MariaDBService = require('./server/services/mariadbService');
const fs = require('fs');
const path = require('path');

const URLS = {
  development: {
    frontend_url: 'http://localhost:5173',
    base_url: 'http://localhost:5173',
    api_base_url: 'http://localhost:3003/api'
  },
  production: {
    frontend_url: 'https://fusepoint.ch',
    base_url: 'https://fusepoint.ch',
    api_base_url: 'https://fusepoint.ch/api'
  }
};

async function updateDatabaseUrl(environment) {
  const mariadbService = new MariaDBService();
  await mariadbService.initialize();
  
  const url = URLS[environment].frontend_url;
  await mariadbService.query(
    'UPDATE platform_settings SET value = ?, updated_at = CURRENT_TIMESTAMP WHERE `key` = ?',
    [url, 'frontend_url']
  );
  
  console.log(`✅ URL base de données mise à jour: ${url}`);
}

async function updateEnvFile(environment) {
  const envPath = path.join(__dirname, 'server', '.env');
  let envContent = fs.readFileSync(envPath, 'utf8');
  
  const urls = URLS[environment];
  
  // Remplacer les URLs dans le fichier .env
  envContent = envContent.replace(
    /FRONTEND_URL=.*/,
    `FRONTEND_URL=${urls.frontend_url}`
  );
  envContent = envContent.replace(
    /BASE_URL=.*/,
    `BASE_URL=${urls.base_url}`
  );
  envContent = envContent.replace(
    /API_BASE_URL=.*/,
    `API_BASE_URL=${urls.api_base_url}`
  );
  
  fs.writeFileSync(envPath, envContent);
  console.log(`✅ Fichier .env mis à jour pour ${environment}`);
}

async function setEnvironment(environment) {
  if (!URLS[environment]) {
    console.error('❌ Environnement invalide. Utilisez: development ou production');
    process.exit(1);
  }
  
  console.log(`🔄 Configuration pour l'environnement: ${environment}\n`);
  
  try {
    // Mettre à jour la base de données
    await updateDatabaseUrl(environment);
    
    // Mettre à jour le fichier .env
    await updateEnvFile(environment);
    
    console.log('\n📊 Configuration appliquée:');
    console.log('- Frontend URL:', URLS[environment].frontend_url);
    console.log('- Base URL:', URLS[environment].base_url);
    console.log('- API URL:', URLS[environment].api_base_url);
    
    console.log('\n⚠️ Important:');
    console.log('- Redémarrez le serveur pour appliquer les changements');
    if (environment === 'production') {
      console.log('- Vérifiez que tous les services pointent vers les bonnes URLs');
    }
    
    console.log('\n✅ Configuration terminée!');
    
  } catch (error) {
    console.error('❌ Erreur lors de la configuration:', error.message);
    process.exit(1);
  }
}

function showUsage() {
  console.log('🛠️ Gestionnaire d\'URLs Fusepoint Platform\n');
  console.log('Usage:');
  console.log('  node manage-urls.cjs development  # Configure pour le développement local');
  console.log('  node manage-urls.cjs production   # Configure pour la production');
  console.log('\nEnvironnements disponibles:');
  console.log('  development: http://localhost:5173');
  console.log('  production:  https://fusepoint.ch');
}

// Main
const environment = process.argv[2];

if (!environment) {
  showUsage();
  process.exit(0);
}

setEnvironment(environment)
  .then(() => process.exit(0))
  .catch(error => {
    console.error('❌ Erreur:', error.message);
    process.exit(1);
  });