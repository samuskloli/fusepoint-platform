const databaseService = require('./server/services/databaseService');

async function cleanDuplicateWidgets() {
  try {
    console.log('🔍 Analyse des widgets dupliqués...');
    
    // Récupérer tous les widgets
    const allWidgets = await databaseService.query(
      'SELECT id, name, category, component_name, description FROM widgets ORDER BY name, id'
    );
    
    console.log(`📊 Total des widgets trouvés: ${allWidgets.length}`);
    
    // Grouper les widgets par nom pour identifier les doublons
    const widgetGroups = {};
    allWidgets.forEach(widget => {
      const key = widget.name.toLowerCase().trim();
      if (!widgetGroups[key]) {
        widgetGroups[key] = [];
      }
      widgetGroups[key].push(widget);
    });
    
    // Identifier les doublons
    const duplicates = {};
    Object.keys(widgetGroups).forEach(key => {
      if (widgetGroups[key].length > 1) {
        duplicates[key] = widgetGroups[key];
      }
    });
    
    console.log('\n🔍 WIDGETS DUPLIQUÉS DÉTECTÉS:');
    console.log('=====================================');
    
    if (Object.keys(duplicates).length === 0) {
      console.log('✅ Aucun widget dupliqué trouvé!');
      return;
    }
    
    let totalDuplicates = 0;
    Object.keys(duplicates).forEach(name => {
      const widgets = duplicates[name];
      console.log(`\n📋 "${name}" (${widgets.length} occurrences):`);
      widgets.forEach((widget, index) => {
        console.log(`  ${index + 1}. ID: ${widget.id} | Catégorie: ${widget.category} | Composant: ${widget.component_name || 'N/A'}`);
        console.log(`     Description: ${widget.description || 'N/A'}`);
      });
      totalDuplicates += widgets.length - 1; // -1 car on garde le premier
    });
    
    console.log(`\n📊 Total de doublons à supprimer: ${totalDuplicates}`);
    
    // Demander confirmation (simulation)
    console.log('\n🧹 NETTOYAGE DES DOUBLONS:');
    console.log('=====================================');
    
    let deletedCount = 0;
    
    for (const [name, widgets] of Object.entries(duplicates)) {
      // Garder le premier widget (généralement le plus ancien avec l'ID le plus petit)
      const toKeep = widgets[0];
      const toDelete = widgets.slice(1);
      
      console.log(`\n🔧 Traitement de "${name}":`);
      console.log(`  ✅ Garder: ID ${toKeep.id} (${toKeep.category})`);
      
      for (const widget of toDelete) {
        try {
          // Vérifier s'il y a des références dans d'autres tables
          const references = await checkWidgetReferences(widget.id);
          
          if (references.total > 0) {
            console.log(`  ⚠️  Widget ID ${widget.id} a ${references.total} références - Migration nécessaire`);
            
            // Migrer les références vers le widget à conserver
            await migrateWidgetReferences(widget.id, toKeep.id);
            console.log(`  🔄 Références migrées de ${widget.id} vers ${toKeep.id}`);
          }
          
          // Supprimer le widget dupliqué
          await databaseService.query('DELETE FROM widgets WHERE id = ?', [widget.id]);
          console.log(`  🗑️  Supprimé: ID ${widget.id}`);
          deletedCount++;
          
        } catch (error) {
          console.error(`  ❌ Erreur lors de la suppression du widget ID ${widget.id}:`, error.message);
        }
      }
    }
    
    console.log(`\n✅ Nettoyage terminé! ${deletedCount} widgets dupliqués supprimés.`);
    
    // Vérification finale
    const finalCount = await databaseService.query('SELECT COUNT(*) as count FROM widgets');
    console.log(`📊 Nombre final de widgets: ${finalCount[0].count}`);
    
  } catch (error) {
    console.error('❌ Erreur lors du nettoyage:', error);
  } finally {
    process.exit(0);
  }
}

async function checkWidgetReferences(widgetId) {
  try {
    // Vérifier les références dans project_template_widgets
    const templateRefs = await databaseService.query(
      'SELECT COUNT(*) as count FROM project_template_widgets WHERE widget_id = ?',
      [widgetId]
    );
    
    // Vérifier les références dans client_widget_configs
    const clientRefs = await databaseService.query(
      'SELECT COUNT(*) as count FROM client_widget_configs WHERE widget_id = ?',
      [widgetId]
    );
    
    const total = (templateRefs[0]?.count || 0) + (clientRefs[0]?.count || 0);
    
    return {
      templateReferences: templateRefs[0]?.count || 0,
      clientReferences: clientRefs[0]?.count || 0,
      total
    };
  } catch (error) {
    console.error('Erreur lors de la vérification des références:', error);
    return { templateReferences: 0, clientReferences: 0, total: 0 };
  }
}

async function migrateWidgetReferences(fromWidgetId, toWidgetId) {
  try {
    // Migrer les références dans project_template_widgets
    await databaseService.query(
      'UPDATE project_template_widgets SET widget_id = ? WHERE widget_id = ?',
      [toWidgetId, fromWidgetId]
    );
    
    // Migrer les références dans client_widget_configs
    await databaseService.query(
      'UPDATE client_widget_configs SET widget_id = ? WHERE widget_id = ?',
      [toWidgetId, fromWidgetId]
    );
    
  } catch (error) {
    console.error('Erreur lors de la migration des références:', error);
    throw error;
  }
}

// Exécuter le script
cleanDuplicateWidgets();