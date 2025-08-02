/**
 * Script pour vérifier et ajouter la colonne agent_id à la table users
 */

const sqlite3 = require('sqlite3').verbose();
const { open } = require('sqlite');
const path = require('path');

async function fixAgentIdColumn() {
  console.log('🔧 Vérification et correction de la colonne agent_id...');
  
  try {
    // Ouvrir la base de données
    const db = await open({
      filename: path.join(__dirname, 'database/fusepoint.db'),
      driver: sqlite3.Database
    });
    
    console.log('✅ Base de données ouverte');
    
    // Vérifier la structure actuelle de la table users
    const tableInfo = await db.all('PRAGMA table_info(users)');
    console.log('📋 Structure actuelle de la table users:');
    tableInfo.forEach(col => {
      console.log(`  - ${col.name}: ${col.type}`);
    });
    
    // Vérifier si la colonne agent_id existe
    const hasAgentId = tableInfo.some(col => col.name === 'agent_id');
    
    if (!hasAgentId) {
      console.log('⚠️ Colonne agent_id manquante, ajout en cours...');
      await db.run('ALTER TABLE users ADD COLUMN agent_id INTEGER');
      await db.run('CREATE INDEX IF NOT EXISTS idx_users_agent_id ON users(agent_id)');
      console.log('✅ Colonne agent_id ajoutée avec succès');
    } else {
      console.log('✅ Colonne agent_id existe déjà');
    }
    
    // Vérifier la nouvelle structure
    const newTableInfo = await db.all('PRAGMA table_info(users)');
    console.log('\n📋 Structure finale de la table users:');
    newTableInfo.forEach(col => {
      console.log(`  - ${col.name}: ${col.type}`);
    });
    
    await db.close();
    console.log('\n🎉 Vérification terminée avec succès!');
    
  } catch (error) {
    console.error('❌ Erreur lors de la vérification:', error);
  }
}

// Exécuter la vérification
fixAgentIdColumn();