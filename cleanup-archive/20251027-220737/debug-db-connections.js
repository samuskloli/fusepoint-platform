#!/usr/bin/env node

/**
 * Script de diagnostic pour analyser les connexions de base de données
 * et identifier les problèmes de pool de connexions
 */

import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('🔍 Diagnostic des connexions de base de données...\n');

// Vérifier la configuration de la base de données
const serverPath = path.join(__dirname, 'server');
const configPath = path.join(serverPath, 'config');

console.log('📁 Vérification des fichiers de configuration...');

// Chercher les fichiers de configuration de DB
const configFiles = [
  'database.js',
  'db.js',
  'config.js',
  '.env',
  'knexfile.js'
];

configFiles.forEach(file => {
  const filePath = path.join(configPath, file);
  const rootFilePath = path.join(serverPath, file);
  
  if (fs.existsSync(filePath)) {
    console.log(`✅ Trouvé: ${filePath}`);
  } else if (fs.existsSync(rootFilePath)) {
    console.log(`✅ Trouvé: ${rootFilePath}`);
  } else {
    console.log(`❌ Non trouvé: ${file}`);
  }
});

console.log('\n🔧 Recommandations pour corriger le problème de pool:');
console.log('1. Augmenter la limite du pool de connexions');
console.log('2. Réduire le timeout des connexions');
console.log('3. Implémenter une libération automatique des connexions');
console.log('4. Ajouter un monitoring des connexions actives');

console.log('\n📋 Actions à effectuer:');
console.log('- Redémarrer le serveur backend');
console.log('- Vérifier la configuration du pool MariaDB');
console.log('- Nettoyer les connexions orphelines');

console.log('\n🚀 Pour redémarrer le serveur:');
console.log('cd server && npm start');