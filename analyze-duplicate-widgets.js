import mysql from 'mysql2/promise';

async function analyzeDuplicateWidgets() {
  let connection;
  
  try {
    // Configuration de la base de données
    connection = await mysql.createConnection({
      host: 'localhost',
      user: 'oliveirasamuel',
      password: 'FusepointDB2025!',
      database: 'fusepoint_db'
    });

    console.log('🔍 Analyse des widgets dupliqués...\n');

    // 1. Compter tous les widgets
    const [totalWidgets] = await connection.execute('SELECT COUNT(*) as total FROM widgets');
    console.log(`📊 Total des widgets: ${totalWidgets[0].total}`);

    // 2. Identifier les widgets dupliqués par nom
    const [duplicatesByName] = await connection.execute(`
      SELECT name, COUNT(*) as count, GROUP_CONCAT(id) as ids
      FROM widgets 
      GROUP BY name 
      HAVING COUNT(*) > 1
      ORDER BY count DESC
    `);

    console.log(`\n🔄 Widgets dupliqués par nom (${duplicatesByName.length} groupes):`);
    duplicatesByName.forEach(dup => {
      console.log(`  - "${dup.name}": ${dup.count} occurrences (IDs: ${dup.ids})`);
    });

    // 3. Identifier les widgets dupliqués par component_name
    const [duplicatesByComponent] = await connection.execute(`
      SELECT component_name, COUNT(*) as count, GROUP_CONCAT(id) as ids
      FROM widgets 
      WHERE component_name IS NOT NULL
      GROUP BY component_name 
      HAVING COUNT(*) > 1
      ORDER BY count DESC
    `);

    console.log(`\n🔄 Widgets dupliqués par component_name (${duplicatesByComponent.length} groupes):`);
    duplicatesByComponent.forEach(dup => {
      console.log(`  - "${dup.component_name}": ${dup.count} occurrences (IDs: ${dup.ids})`);
    });

    // 4. Afficher tous les widgets pour analyse
    const [allWidgets] = await connection.execute(`
      SELECT id, name, component_name, category, description, is_active, created_at
      FROM widgets 
      ORDER BY name, id
    `);

    console.log(`\n📋 Liste complète des widgets:`);
    allWidgets.forEach(widget => {
      console.log(`  ID: ${widget.id} | Nom: "${widget.name}" | Component: "${widget.component_name}" | Catégorie: "${widget.category}" | Actif: ${widget.is_active}`);
    });

    // 5. Proposer un plan de nettoyage
    console.log(`\n🧹 Plan de nettoyage proposé:`);
    
    for (const dup of duplicatesByName) {
      const ids = dup.ids.split(',').map(id => parseInt(id));
      const [widgets] = await connection.execute(`
        SELECT id, name, component_name, is_active, created_at
        FROM widgets 
        WHERE id IN (${ids.join(',')})
        ORDER BY created_at DESC
      `);
      
      console.log(`\n  Groupe: "${dup.name}"`);
      widgets.forEach((widget, index) => {
        if (index === 0) {
          console.log(`    ✅ GARDER: ID ${widget.id} (le plus récent)`);
        } else {
          console.log(`    ❌ SUPPRIMER: ID ${widget.id}`);
        }
      });
    }

  } catch (error) {
    console.error('❌ Erreur lors de l\'analyse:', error.message);
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

// Fonction pour nettoyer les doublons (à exécuter après validation)
async function cleanDuplicateWidgets() {
  let connection;
  
  try {
    connection = await mysql.createConnection({
      host: 'localhost',
      user: 'oliveirasamuel',
      password: 'FusepointDB2025!',
      database: 'fusepoint_db'
    });

    console.log('🧹 Nettoyage des widgets dupliqués...\n');

    // Identifier les doublons par nom et garder le plus récent
    const [duplicatesByName] = await connection.execute(`
      SELECT name, COUNT(*) as count
      FROM widgets 
      GROUP BY name 
      HAVING COUNT(*) > 1
    `);

    let totalDeleted = 0;

    for (const dup of duplicatesByName) {
      // Récupérer tous les widgets avec ce nom, triés par date de création (le plus récent en premier)
      const [widgets] = await connection.execute(`
        SELECT id, name, created_at
        FROM widgets 
        WHERE name = ?
        ORDER BY created_at DESC
      `, [dup.name]);

      // Supprimer tous sauf le premier (le plus récent)
      for (let i = 1; i < widgets.length; i++) {
        const widgetToDelete = widgets[i];
        console.log(`🗑️  Suppression du widget dupliqué: ID ${widgetToDelete.id} - "${widgetToDelete.name}"`);
        
        await connection.execute('DELETE FROM widgets WHERE id = ?', [widgetToDelete.id]);
        totalDeleted++;
      }
    }

    console.log(`\n✅ Nettoyage terminé. ${totalDeleted} widgets dupliqués supprimés.`);

  } catch (error) {
    console.error('❌ Erreur lors du nettoyage:', error.message);
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

// Exécuter l'analyse
if (process.argv[2] === '--clean') {
  cleanDuplicateWidgets();
} else {
  analyzeDuplicateWidgets();
}