const mysql = require('mysql2/promise');
require('dotenv').config({ path: '../.env.development' });

async function debugTemplates() {
    const connection = await mysql.createConnection({
        host: process.env.MARIADB_HOST || 'localhost',
        port: process.env.MARIADB_PORT || 3306,
        user: process.env.MARIADB_USER || 'fusepoint_db',
        password: process.env.MARIADB_PASSWORD || 'FusepointBD2025!',
        database: process.env.MARIADB_DATABASE || 'fusepoint_db'
    });

    try {
        console.log('🔍 Analyse des templates Standard...\n');

        // Vérifier les templates de projets
        const [projectTemplates] = await connection.execute(`
            SELECT id, name, created_at, updated_at 
            FROM project_templates 
            WHERE name LIKE '%Standard%' OR name LIKE '%standard%'
            ORDER BY created_at DESC
        `);

        console.log('📋 Templates de projets Standard trouvés:');
        console.log(`Total: ${projectTemplates.length}`);
        projectTemplates.forEach((template, index) => {
            console.log(`${index + 1}. ID: ${template.id}, Nom: "${template.name}", Créé: ${template.created_at}`);
        });

        // Vérifier les templates de widgets
        const [widgetTemplates] = await connection.execute(`
            SELECT id, name, created_at, updated_at 
            FROM widget_templates 
            WHERE name LIKE '%Standard%' OR name LIKE '%standard%'
            ORDER BY created_at DESC
        `);

        console.log('\n🧩 Templates de widgets Standard trouvés:');
        console.log(`Total: ${widgetTemplates.length}`);
        widgetTemplates.forEach((template, index) => {
            console.log(`${index + 1}. ID: ${template.id}, Nom: "${template.name}", Créé: ${template.created_at}`);
        });

        // Vérifier s'il y a des doublons exacts
        const [duplicateProjects] = await connection.execute(`
            SELECT name, COUNT(*) as count 
            FROM project_templates 
            WHERE name LIKE '%Standard%' OR name LIKE '%standard%'
            GROUP BY name 
            HAVING COUNT(*) > 1
        `);

        const [duplicateWidgets] = await connection.execute(`
            SELECT name, COUNT(*) as count 
            FROM widget_templates 
            WHERE name LIKE '%Standard%' OR name LIKE '%standard%'
            GROUP BY name 
            HAVING COUNT(*) > 1
        `);

        console.log('\n⚠️ Doublons détectés:');
        console.log('Templates de projets dupliqués:');
        duplicateProjects.forEach(dup => {
            console.log(`- "${dup.name}": ${dup.count} occurrences`);
        });

        console.log('Templates de widgets dupliqués:');
        duplicateWidgets.forEach(dup => {
            console.log(`- "${dup.name}": ${dup.count} occurrences`);
        });

    } catch (error) {
        console.error('❌ Erreur lors de l\'analyse:', error);
    } finally {
        await connection.end();
    }
}

debugTemplates();