const databaseService = require('./services/databaseService');

async function fixLayoutJson() {
    try {
        console.log('🔧 Correction du layout JSON invalide...\n');

        // 1. Récupérer le dashboard avec le layout invalide
        const dashboard = await databaseService.get(`
            SELECT project_id, layout_json, version, updated_at 
            FROM project_dashboards 
            WHERE project_id = ?
        `, [47]);

        if (!dashboard) {
            console.log('❌ Aucun dashboard trouvé pour le projet 47');
            return;
        }

        console.log('Dashboard actuel:');
        console.log(`   Project ID: ${dashboard.project_id}`);
        console.log(`   Version: ${dashboard.version}`);
        console.log(`   Updated: ${dashboard.updated_at}`);
        console.log(`   Layout JSON: "${dashboard.layout_json}"`);
        console.log(`   Type: ${typeof dashboard.layout_json}\n`);

        // 2. Créer un layout par défaut valide
        const defaultLayout = {
            version: "1.0",
            widgets: [],
            settings: {
                gridSize: 12,
                rowHeight: 100,
                margin: [10, 10],
                isDraggable: true,
                isResizable: true
            },
            metadata: {
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
                createdBy: "system"
            }
        };

        const validLayoutJson = JSON.stringify(defaultLayout);

        console.log('Nouveau layout par défaut:');
        console.log(validLayoutJson);

        // 3. Mettre à jour le dashboard avec le layout valide
        await databaseService.run(`
            UPDATE project_dashboards 
            SET layout_json = ?, updated_at = CURRENT_TIMESTAMP 
            WHERE project_id = ?
        `, [validLayoutJson, 47]);

        console.log('\n✅ Layout JSON corrigé avec succès!');

        // 4. Vérifier la correction
        const updatedDashboard = await databaseService.get(`
            SELECT project_id, layout_json, version, updated_at 
            FROM project_dashboards 
            WHERE project_id = ?
        `, [47]);

        console.log('\nDashboard après correction:');
        const layoutStr = typeof updatedDashboard.layout_json === 'string' 
            ? updatedDashboard.layout_json 
            : JSON.stringify(updatedDashboard.layout_json);
        console.log(`   Layout JSON: ${layoutStr.substring(0, 100)}...`);
        
        // Test de parsing
        try {
            const parsed = typeof updatedDashboard.layout_json === 'string' 
                ? JSON.parse(updatedDashboard.layout_json)
                : updatedDashboard.layout_json;
            console.log('   ✅ JSON valide - parsing réussi');
            console.log(`   Widgets: ${parsed.widgets?.length || 0}`);
            console.log(`   Version: ${parsed.version}`);
        } catch (parseError) {
            console.log('   ❌ JSON encore invalide:', parseError.message);
        }

    } catch (error) {
        console.error('❌ Erreur lors de la correction:', error);
    } finally {
        process.exit(0);
    }
}

fixLayoutJson();