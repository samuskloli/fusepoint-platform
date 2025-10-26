import mysql from 'mysql2/promise';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configuration de la base de données
const dbConfig = {
  host: 'localhost',
  user: 'oliveirasamuel',
  password: 'FusepointDB2025!',
  database: 'fusepoint_db',
  port: 3306
};

/**
 * Script de synchronisation des widgets avec les composants réels
 * 
 * Ce script :
 * 1. Analyse les composants widgets existants dans le projet
 * 2. Compare avec les widgets en base de données
 * 3. Propose une synchronisation
 */

async function analyzeWidgetComponents() {
  const widgetsDir = path.join(__dirname, '../../src/components/widgets');
  const components = [];
  
  console.log('🔍 Analyse des composants widgets...');
  
  // Fonction récursive pour parcourir les dossiers
  function scanDirectory(dir, category = '') {
    const items = fs.readdirSync(dir);
    
    for (const item of items) {
      const fullPath = path.join(dir, item);
      const stat = fs.statSync(fullPath);
      
      if (stat.isDirectory()) {
        // Ignorer certains dossiers
        if (['node_modules', '.git', 'shared', 'services', 'types', 'modals', 'components'].includes(item)) {
          continue;
        }
        
        // Déterminer la catégorie basée sur le nom du dossier
        let newCategory = category;
        if (item.includes('management')) {
          newCategory = item.replace('-', '_');
        } else if (item === 'analytics') {
          newCategory = 'analytics';
        } else if (item === 'collaboration') {
          newCategory = 'communication';
        } else if (item === 'development') {
          newCategory = 'development';
        }
        
        scanDirectory(fullPath, newCategory || item);
      } else if (item.endsWith('.vue') && item.includes('Widget')) {
        // Extraire le nom du composant
        const componentName = item.replace('.vue', '');
        const widgetName = componentName.replace('Widget', '');
        
        // Déterminer la catégorie
        let widgetCategory = 'general';
        if (category) {
          widgetCategory = category;
        } else if (fullPath.includes('project-management')) {
          widgetCategory = 'management';
        } else if (fullPath.includes('team-management')) {
          widgetCategory = 'team';
        } else if (fullPath.includes('analytics')) {
          widgetCategory = 'analytics';
        } else if (fullPath.includes('collaboration')) {
          widgetCategory = 'communication';
        } else if (fullPath.includes('development')) {
          widgetCategory = 'development';
        }
        
        // Lire le fichier pour extraire des informations
        const content = fs.readFileSync(fullPath, 'utf8');
        let description = `Widget ${widgetName}`;
        let icon = 'widget';
        
        // Essayer d'extraire la description du commentaire ou du template
        const descMatch = content.match(/description['":][\s]*['"]([^'"]+)['"]/i);
        if (descMatch) {
          description = descMatch[1];
        }
        
        // Essayer d'extraire l'icône
        const iconMatch = content.match(/icon['":][\s]*['"]([^'"]+)['"]/i);
        if (iconMatch) {
          icon = iconMatch[1];
        }
        
        components.push({
          name: widgetName,
          component_name: componentName,
          category: widgetCategory,
          description,
          icon,
          file_path: fullPath.replace(widgetsDir, ''),
          is_active: 1
        });
      }
    }
  }
  
  scanDirectory(widgetsDir);
  
  console.log(`✅ ${components.length} composants widgets trouvés`);
  return components;
}

async function getWidgetsFromDatabase() {
  let connection;
  
  try {
    connection = await mysql.createConnection(dbConfig);
    
    const [widgets] = await connection.execute(`
      SELECT id, name, component_name, category, description, icon, is_active
      FROM widgets 
      ORDER BY name
    `);
    
    console.log(`📊 ${widgets.length} widgets trouvés en base de données`);
    return widgets;
    
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

async function compareWidgets() {
  console.log('🔧 Connexion à la base de données...');
  
  // Analyser les composants
  const components = await analyzeWidgetComponents();
  
  // Récupérer les widgets de la base
  const dbWidgets = await getWidgetsFromDatabase();
  
  console.log('\n📋 COMPARAISON WIDGETS DB vs COMPOSANTS RÉELS :');
  console.log('='.repeat(60));
  
  // Créer des maps pour faciliter la comparaison
  const componentMap = new Map(components.map(c => [c.component_name, c]));
  const dbWidgetMap = new Map(dbWidgets.map(w => [w.component_name, w]));
  
  // Widgets en DB mais pas dans les composants
  const orphanedWidgets = dbWidgets.filter(w => !componentMap.has(w.component_name));
  
  // Composants existants mais pas en DB
  const missingWidgets = components.filter(c => !dbWidgetMap.has(c.component_name));
  
  // Widgets qui existent dans les deux mais avec des différences
  const mismatchedWidgets = [];
  for (const component of components) {
    const dbWidget = dbWidgetMap.get(component.component_name);
    if (dbWidget) {
      const differences = [];
      if (dbWidget.name !== component.name) differences.push('name');
      if (dbWidget.category !== component.category) differences.push('category');
      if (dbWidget.description !== component.description) differences.push('description');
      if (dbWidget.icon !== component.icon) differences.push('icon');
      
      if (differences.length > 0) {
        mismatchedWidgets.push({
          component_name: component.component_name,
          differences,
          db: dbWidget,
          component: component
        });
      }
    }
  }
  
  // Afficher les résultats
  if (orphanedWidgets.length > 0) {
    console.log('\n🗑️  WIDGETS ORPHELINS (en DB mais pas de composant) :');
    orphanedWidgets.forEach(w => {
      console.log(`   - ${w.name} (${w.component_name}) - ${w.category}`);
    });
  }
  
  if (missingWidgets.length > 0) {
    console.log('\n➕ COMPOSANTS MANQUANTS (composant existe mais pas en DB) :');
    missingWidgets.forEach(c => {
      console.log(`   - ${c.name} (${c.component_name}) - ${c.category}`);
      console.log(`     Fichier: ${c.file_path}`);
    });
  }
  
  if (mismatchedWidgets.length > 0) {
    console.log('\n⚠️  WIDGETS AVEC DIFFÉRENCES :');
    mismatchedWidgets.forEach(m => {
      console.log(`   - ${m.component_name} (différences: ${m.differences.join(', ')})`);
      console.log(`     DB: ${m.db.name} | ${m.db.category} | ${m.db.description}`);
      console.log(`     Composant: ${m.component.name} | ${m.component.category} | ${m.component.description}`);
    });
  }
  
  console.log('\n📊 RÉSUMÉ :');
  console.log(`   - Widgets orphelins: ${orphanedWidgets.length}`);
  console.log(`   - Composants manquants: ${missingWidgets.length}`);
  console.log(`   - Widgets avec différences: ${mismatchedWidgets.length}`);
  console.log(`   - Widgets synchronisés: ${components.length - missingWidgets.length - mismatchedWidgets.length}`);
  
  return {
    components,
    dbWidgets,
    orphanedWidgets,
    missingWidgets,
    mismatchedWidgets
  };
}

async function syncWidgets(dryRun = true) {
  const comparison = await compareWidgets();
  
  if (dryRun) {
    console.log('\n🧪 MODE DRY-RUN - Aucune modification ne sera effectuée');
    console.log('Pour appliquer les changements, relancez avec --apply');
    return;
  }
  
  let connection;
  
  try {
    connection = await mysql.createConnection(dbConfig);
    
    console.log('\n🔧 SYNCHRONISATION EN COURS...');
    
    // Supprimer les widgets orphelins
    if (comparison.orphanedWidgets.length > 0) {
      console.log(`🗑️  Suppression de ${comparison.orphanedWidgets.length} widgets orphelins...`);
      for (const widget of comparison.orphanedWidgets) {
        await connection.execute('DELETE FROM widgets WHERE id = ?', [widget.id]);
        console.log(`   ✅ Supprimé: ${widget.name} (${widget.component_name})`);
      }
    }
    
    // Ajouter les composants manquants
    if (comparison.missingWidgets.length > 0) {
      console.log(`➕ Ajout de ${comparison.missingWidgets.length} nouveaux widgets...`);
      for (const component of comparison.missingWidgets) {
        await connection.execute(`
          INSERT INTO widgets (name, component_name, category, description, icon, is_active, default_config)
          VALUES (?, ?, ?, ?, ?, ?, '{}')
        `, [
          component.name,
          component.component_name,
          component.category,
          component.description,
          component.icon,
          component.is_active
        ]);
        console.log(`   ✅ Ajouté: ${component.name} (${component.component_name})`);
      }
    }
    
    // Mettre à jour les widgets avec des différences
    if (comparison.mismatchedWidgets.length > 0) {
      console.log(`🔄 Mise à jour de ${comparison.mismatchedWidgets.length} widgets...`);
      for (const mismatch of comparison.mismatchedWidgets) {
        const component = mismatch.component;
        const dbWidget = mismatch.db;
        
        await connection.execute(`
          UPDATE widgets 
          SET name = ?, category = ?, description = ?, icon = ?
          WHERE id = ?
        `, [
          component.name,
          component.category,
          component.description,
          component.icon,
          dbWidget.id
        ]);
        console.log(`   ✅ Mis à jour: ${component.name} (${component.component_name})`);
      }
    }
    
    console.log('\n🎉 Synchronisation terminée avec succès !');
    
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

// Exécuter le script
const args = process.argv.slice(2);
const shouldApply = args.includes('--apply');

syncWidgets(!shouldApply)
  .then(() => {
    console.log('\n✅ Script terminé');
    process.exit(0);
  })
  .catch(error => {
    console.error('❌ Erreur :', error);
    process.exit(1);
  });

export default { analyzeWidgetComponents, compareWidgets, syncWidgets };