#!/usr/bin/env node

import path from 'path';
import ComprehensiveBackupSystem from './backup-system.js';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

/**
 * Script de démarrage pour le planificateur de sauvegardes automatiques
 * Ce script peut être exécuté en arrière-plan pour maintenir les sauvegardes automatiques
 */

async function startBackupScheduler() {
  console.log('🚀 Démarrage du planificateur de sauvegardes Fusepoint...');
  console.log('📅 ' + new Date().toLocaleString());
  console.log('=' .repeat(60));

  try {
    // Initialiser le système de sauvegarde
    const backupSystem = new ComprehensiveBackupSystem();
    await backupSystem.initialize();

    // Afficher les statistiques actuelles
    const stats = await backupSystem.getBackupStats();
    console.log('\n📊 Statistiques actuelles:');
    console.log(`   📦 Total des sauvegardes: ${stats.total}`);
    console.log(`   📊 Taille totale: ${backupSystem.formatBytes(stats.totalSize)}`);
    console.log(`   🏥 Statut de santé: ${stats.healthStatus}`);
    
    if (stats.newestBackup) {
      const lastBackupDate = new Date(stats.newestBackup.created_at);
      const daysSince = Math.floor((Date.now() - lastBackupDate.getTime()) / (1000 * 60 * 60 * 24));
      console.log(`   📅 Dernière sauvegarde: ${lastBackupDate.toLocaleString()} (il y a ${daysSince} jour(s))`);
    } else {
      console.log('   ⚠️ Aucune sauvegarde existante');
    }

    // Créer une sauvegarde initiale si nécessaire
    if (stats.total === 0 || stats.healthStatus === 'critical') {
      console.log('\n💾 Création d\'une sauvegarde initiale...');
      try {
        await backupSystem.createFullBackup({
          includeDatabase: true,
          includeConfig: true,
          includeSource: false,
          description: 'Sauvegarde initiale du planificateur'
        });
        console.log('✅ Sauvegarde initiale créée avec succès');
      } catch (error) {
        console.warn('⚠️ Impossible de créer la sauvegarde initiale:', error.message);
      }
    }

    // Démarrer le planificateur
    console.log('\n⏰ Démarrage des sauvegardes automatiques...');
    backupSystem.scheduleAutoBackups();

    // Gestion des signaux pour un arrêt propre
    const gracefulShutdown = (signal) => {
      console.log(`\n🛑 Signal ${signal} reçu. Arrêt du planificateur...`);
      console.log('📅 ' + new Date().toLocaleString());
      console.log('✅ Planificateur arrêté proprement.');
      process.exit(0);
    };

    process.on('SIGINT', () => gracefulShutdown('SIGINT'));
    process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));

    // Afficher les informations de fonctionnement
    console.log('\n✅ Planificateur de sauvegardes démarré avec succès!');
    console.log('\n📋 Programmation:');
    console.log('   🕐 Quotidienne: Base de données + Configuration (tous les jours à minuit)');
    console.log('   🕐 Hebdomadaire: Sauvegarde complète (tous les dimanches à 2h)');
    console.log('   🧹 Nettoyage: Suppression des sauvegardes de plus de 30 jours');
    console.log('\n🔧 Contrôles:');
    console.log('   Ctrl+C ou SIGTERM pour arrêter proprement');
    console.log('\n📝 Logs: Les activités de sauvegarde seront affichées ici...');
    console.log('=' .repeat(60));

    // Fonction de monitoring périodique
    setInterval(async () => {
      try {
        const currentStats = await backupSystem.getBackupStats();
        const now = new Date();
        
        // Afficher un rapport de statut toutes les heures
        if (now.getMinutes() === 0) {
          console.log(`\n📊 [${now.toLocaleString()}] Rapport de statut:`);
          console.log(`   📦 Sauvegardes: ${currentStats.total}`);
          console.log(`   📊 Taille: ${backupSystem.formatBytes(currentStats.totalSize)}`);
          console.log(`   🏥 Santé: ${currentStats.healthStatus}`);
        }
      } catch (error) {
        console.error('❌ Erreur lors du monitoring:', error.message);
      }
    }, 60 * 1000); // Vérifier toutes les minutes

  } catch (error) {
    console.error('❌ Erreur lors du démarrage du planificateur:', error);
    console.error(error.stack);
    process.exit(1);
  }
}

// Démarrer le planificateur
startBackupScheduler();