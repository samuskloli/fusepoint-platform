/**
 * Script de migration pour ajouter les colonnes email
 */

const sqlite3 = require('sqlite3').verbose();
const { open } = require('sqlite');
const path = require('path');

async function migrateDatabase() {
  console.log('🔄 Migration de la base de données...');
  
  try {
    // Ouvrir la base de données
    const db = await open({
      filename: './fusepoint.db',
      driver: sqlite3.Database
    });
    
    console.log('✅ Base de données ouverte');
    
    // Vérifier la structure actuelle de la table users
    const tableInfo = await db.all('PRAGMA table_info(users)');
    console.log('📋 Structure actuelle de la table users:');
    tableInfo.forEach(col => {
      console.log(`  - ${col.name}: ${col.type}`);
    });
    
    // Vérifier si les colonnes existent déjà
    const hasConfirmationToken = tableInfo.some(col => col.name === 'confirmation_token');
    const hasTokenExpiry = tableInfo.some(col => col.name === 'token_expiry');
    const hasResetToken = tableInfo.some(col => col.name === 'reset_token');
    const hasResetTokenExpiry = tableInfo.some(col => col.name === 'reset_token_expiry');
    
    // Ajouter les colonnes manquantes
    if (!hasConfirmationToken) {
      await db.run('ALTER TABLE users ADD COLUMN confirmation_token VARCHAR(255)');
      console.log('✅ Colonne confirmation_token ajoutée');
    } else {
      console.log('ℹ️ Colonne confirmation_token existe déjà');
    }
    
    if (!hasTokenExpiry) {
      await db.run('ALTER TABLE users ADD COLUMN token_expiry DATETIME');
      console.log('✅ Colonne token_expiry ajoutée');
    } else {
      console.log('ℹ️ Colonne token_expiry existe déjà');
    }
    
    if (!hasResetToken) {
      await db.run('ALTER TABLE users ADD COLUMN reset_token VARCHAR(255)');
      console.log('✅ Colonne reset_token ajoutée');
    } else {
      console.log('ℹ️ Colonne reset_token existe déjà');
    }
    
    if (!hasResetTokenExpiry) {
      await db.run('ALTER TABLE users ADD COLUMN reset_token_expiry DATETIME');
      console.log('✅ Colonne reset_token_expiry ajoutée');
    } else {
      console.log('ℹ️ Colonne reset_token_expiry existe déjà');
    }
    
    // Vérifier la nouvelle structure
    const newTableInfo = await db.all('PRAGMA table_info(users)');
    console.log('\n📋 Nouvelle structure de la table users:');
    newTableInfo.forEach(col => {
      console.log(`  - ${col.name}: ${col.type}`);
    });
    
    await db.close();
    console.log('\n🎉 Migration terminée avec succès!');
    
  } catch (error) {
    console.error('❌ Erreur lors de la migration:', error);
  }
}

// Exécuter la migration
migrateDatabase();