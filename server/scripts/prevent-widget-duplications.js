import mysql from 'mysql2/promise';
import fs from 'fs';
import path from 'path';

// Configuration de la base de données
const dbConfig = {
  host: 'localhost',
  user: 'oliveirasamuel',
  password: 'FusepointDB2025!',
  database: 'fusepoint_db',
  port: 3306
};

/**
 * Script de prévention des duplications de widgets
 * 
 * Ce script :
 * 1. Vérifie s'il y a des widgets dupliqués
 * 2. Ajoute des contraintes UNIQUE pour empêcher les futures duplications
 * 3. Modifie les scripts d'insertion pour utiliser INSERT IGNORE ou ON DUPLICATE KEY UPDATE
 */

async function preventWidgetDuplications() {
  let connection;
  
  try {
    console.log('🔧 Connexion à la base de données...');
    connection = await mysql.createConnection(dbConfig);
    
    // 1. Vérifier les duplications actuelles
    console.log('🔍 Vérification des duplications actuelles...');
    const [duplicates] = await connection.execute(`
      SELECT name, component_name, COUNT(*) as count
      FROM widgets 
      GROUP BY name, component_name 
      HAVING COUNT(*) > 1
      ORDER BY count DESC, name
    `);
    
    if (duplicates.length > 0) {
      console.log('⚠️  Duplications détectées :');
      duplicates.forEach(dup => {
        console.log(`   - ${dup.name} (${dup.component_name}): ${dup.count} occurrences`);
      });
      console.log('❌ Veuillez d\'abord nettoyer les duplications avec analyze-duplicate-widgets.js --clean');
      return false;
    }
    
    console.log('✅ Aucune duplication détectée');
    
    // 2. Vérifier si la contrainte UNIQUE existe déjà
    console.log('🔍 Vérification des contraintes existantes...');
    const [constraints] = await connection.execute(`
      SELECT CONSTRAINT_NAME 
      FROM INFORMATION_SCHEMA.TABLE_CONSTRAINTS 
      WHERE TABLE_SCHEMA = 'fusepoint_db' 
      AND TABLE_NAME = 'widgets' 
      AND CONSTRAINT_TYPE = 'UNIQUE'
      AND CONSTRAINT_NAME LIKE '%name_component%'
    `);
    
    if (constraints.length === 0) {
      console.log('🔧 Ajout de la contrainte UNIQUE pour prévenir les duplications...');
      await connection.execute(`
        ALTER TABLE widgets 
        ADD CONSTRAINT unique_widget_name_component 
        UNIQUE (name, component_name)
      `);
      console.log('✅ Contrainte UNIQUE ajoutée avec succès');
    } else {
      console.log('✅ Contrainte UNIQUE déjà présente');
    }
    
    // 3. Créer un script de migration sécurisé pour les futurs widgets
    const migrationScript = `-- Script de migration sécurisé pour les widgets
-- Utilise INSERT IGNORE pour éviter les duplications

-- Widgets de base (seulement s'ils n'existent pas déjà)
INSERT IGNORE INTO widgets (name, component_name, category, description, icon, is_active, default_config) VALUES
('Aperçu du projet', 'ProjectOverview', 'general', 'Vue d\\'ensemble des informations du projet', 'overview', 1, '{}'),
('Tâches', 'TaskManager', 'management', 'Gestion des tâches du projet', 'tasks', 1, '{}'),
('Calendrier', 'Calendar', 'management', 'Calendrier des événements et échéances', 'calendar', 1, '{}'),
('Budget', 'Budget', 'finance', 'Suivi du budget du projet', 'budget', 1, '{}'),
('Équipe', 'TeamMembers', 'team', 'Membres de l\\'équipe projet', 'team', 1, '{}'),
('Documents', 'DocumentManager', 'files', 'Gestion des documents du projet', 'documents', 1, '{}'),
('Statistiques', 'Statistics', 'analytics', 'Statistiques et métriques du projet', 'stats', 1, '{}'),
('Notes', 'Notes', 'communication', 'Notes et commentaires', 'notes', 1, '{}');

-- Vérification des insertions
SELECT 'Widgets insérés avec succès' as status, COUNT(*) as total_widgets FROM widgets;
`;
    
    const migrationPath = path.join(process.cwd(), 'migrations', 'safe_widget_insertion.sql');
    
    // Créer le répertoire migrations s'il n'existe pas
    const migrationsDir = path.dirname(migrationPath);
    if (!fs.existsSync(migrationsDir)) {
      fs.mkdirSync(migrationsDir, { recursive: true });
    }
    
    fs.writeFileSync(migrationPath, migrationScript);
    console.log(`📝 Script de migration sécurisé créé : ${migrationPath}`);
    
    // 4. Recommandations pour l'équipe
    console.log('\n📋 RECOMMANDATIONS POUR PRÉVENIR LES FUTURES DUPLICATIONS :');
    console.log('');
    console.log('1. 🚫 NE JAMAIS exécuter manuellement des scripts SQL d\'insertion de widgets');
    console.log('2. ✅ TOUJOURS utiliser INSERT IGNORE ou ON DUPLICATE KEY UPDATE');
    console.log('3. 🔍 VÉRIFIER les duplications avant chaque déploiement avec ce script');
    console.log('4. 📝 DOCUMENTER toute modification de la structure des widgets');
    console.log('5. 🧪 TESTER les migrations sur un environnement de développement d\'abord');
    console.log('');
    console.log('💡 Pour ajouter de nouveaux widgets, utilisez le script safe_widget_insertion.sql');
    console.log('   ou modifiez le code pour utiliser INSERT IGNORE dans databaseService.js');
    
    return true;
    
  } catch (error) {
    console.error('❌ Erreur lors de la prévention des duplications :', error.message);
    return false;
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

// Exécuter le script
preventWidgetDuplications()
  .then(success => {
    if (success) {
      console.log('\n🎉 Prévention des duplications configurée avec succès !');
      process.exit(0);
    } else {
      console.log('\n❌ Échec de la configuration de la prévention');
      process.exit(1);
    }
  })
  .catch(error => {
    console.error('❌ Erreur fatale :', error);
    process.exit(1);
  });

export default preventWidgetDuplications;