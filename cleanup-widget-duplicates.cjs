const databaseService = require('./server/services/databaseService');

async function cleanupWidgetDuplicates() {
  try {
    console.log('🧹 NETTOYAGE DES DUPLICATIONS DE WIDGETS');
    console.log('=====================================\n');
    
    // 1. Analyser les doublons dans la table widgets
    console.log('1. 🔍 Analyse des doublons dans la table widgets...');
    const widgetDuplicates = await databaseService.query(`
      SELECT name, component_name, COUNT(*) as count, GROUP_CONCAT(id ORDER BY id) as ids
      FROM widgets 
      WHERE is_active = 1
      GROUP BY name, component_name 
      HAVING COUNT(*) > 1
      ORDER BY count DESC
    `);
    
    if (widgetDuplicates.length === 0) {
      console.log('✅ Aucun doublon trouvé dans la table widgets');
      return;
    }
    
    console.log(`❌ ${widgetDuplicates.length} types de widgets dupliqués trouvés:`);
    
    let totalDuplicatesRemoved = 0;
    
    for (const duplicate of widgetDuplicates) {
      console.log(`\n📋 Widget: ${duplicate.name} (${duplicate.component_name})`);
      console.log(`   Occurrences: ${duplicate.count}`);
      console.log(`   IDs: ${duplicate.ids}`);
      
      const ids = duplicate.ids.split(',').map(id => parseInt(id.trim()));
      const keepId = Math.min(...ids); // Garder l'ID le plus petit (le plus ancien)
      const removeIds = ids.filter(id => id !== keepId);
      
      console.log(`   ✅ Garder ID: ${keepId}`);
      console.log(`   🗑️  Supprimer IDs: ${removeIds.join(', ')}`);
      
      if (removeIds.length > 0) {
        // Vérifier s'il y a des références dans project_widgets
        const references = await databaseService.query(`
          SELECT COUNT(*) as count, GROUP_CONCAT(DISTINCT project_id) as projects
          FROM project_widgets 
          WHERE widget_id IN (${removeIds.join(',')})
        `);
        
        if (references[0].count > 0) {
          console.log(`   ⚠️  ${references[0].count} références trouvées dans les projets: ${references[0].projects}`);
          
          // Mettre à jour les références pour pointer vers l'ID conservé
          await databaseService.run(`
            UPDATE project_widgets 
            SET widget_id = ? 
            WHERE widget_id IN (${removeIds.join(',')})
          `, [keepId]);
          
          console.log(`   ✅ Références mises à jour vers l'ID ${keepId}`);
        }
        
        // Supprimer les widgets dupliqués
        await databaseService.run(`
          DELETE FROM widgets 
          WHERE id IN (${removeIds.join(',')})
        `);
        
        console.log(`   ✅ ${removeIds.length} doublons supprimés`);
        totalDuplicatesRemoved += removeIds.length;
      }
    }
    
    // 2. Nettoyer les doublons dans project_widgets (même projet + même widget)
    console.log('\n2. 🔍 Nettoyage des doublons dans project_widgets...');
    
    const projectWidgetDuplicates = await databaseService.query(`
      SELECT 
        project_id, 
        widget_id, 
        COUNT(*) as count,
        GROUP_CONCAT(id ORDER BY id) as pw_ids
      FROM project_widgets 
      GROUP BY project_id, widget_id 
      HAVING COUNT(*) > 1
      ORDER BY count DESC
    `);
    
    if (projectWidgetDuplicates.length > 0) {
      console.log(`❌ ${projectWidgetDuplicates.length} doublons trouvés dans project_widgets:`);
      
      for (const duplicate of projectWidgetDuplicates) {
        console.log(`\n📋 Projet ${duplicate.project_id}, Widget ${duplicate.widget_id}`);
        console.log(`   Occurrences: ${duplicate.count}`);
        
        const ids = duplicate.pw_ids.split(',').map(id => parseInt(id.trim()));
        const keepId = Math.min(...ids); // Garder le plus ancien
        const removeIds = ids.filter(id => id !== keepId);
        
        console.log(`   ✅ Garder ID: ${keepId}`);
        console.log(`   🗑️  Supprimer IDs: ${removeIds.join(', ')}`);
        
        // Supprimer les doublons
        await databaseService.run(`
          DELETE FROM project_widgets 
          WHERE id IN (${removeIds.join(',')})
        `);
        
        console.log(`   ✅ ${removeIds.length} doublons supprimés`);
        totalDuplicatesRemoved += removeIds.length;
      }
    } else {
      console.log('✅ Aucun doublon trouvé dans project_widgets');
    }
    
    // 3. Statistiques finales
    console.log('\n3. 📊 Statistiques finales...');
    const finalStats = await databaseService.query(`
      SELECT 
        (SELECT COUNT(*) FROM widgets WHERE is_active = 1) as total_widgets,
        (SELECT COUNT(*) FROM project_widgets) as total_project_widgets,
        (SELECT COUNT(DISTINCT CONCAT(project_id, '-', widget_id)) FROM project_widgets) as unique_project_widgets
    `);
    
    console.log(`   - Widgets actifs restants: ${finalStats[0].total_widgets}`);
    console.log(`   - Total project_widgets: ${finalStats[0].total_project_widgets}`);
    console.log(`   - Combinaisons uniques projet-widget: ${finalStats[0].unique_project_widgets}`);
    console.log(`   - Total doublons supprimés: ${totalDuplicatesRemoved}`);
    
    console.log('\n✅ NETTOYAGE TERMINÉ AVEC SUCCÈS !');
    
  } catch (error) {
    console.error('❌ Erreur lors du nettoyage:', error.message);
    console.error('Stack:', error.stack);
  } finally {
    process.exit(0);
  }
}

// Exécuter le nettoyage
cleanupWidgetDuplicates();