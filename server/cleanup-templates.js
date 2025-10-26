const mysql = require('mysql2/promise');
require('dotenv').config({ path: '../.env.development' });

async function cleanupTemplates() {
    const connection = await mysql.createConnection({
        host: process.env.MARIADB_HOST || 'localhost',
        port: process.env.MARIADB_PORT || 3306,
        user: process.env.MARIADB_USER || 'fusepoint_db',
        password: process.env.MARIADB_PASSWORD || 'FusepointBD2025!',
        database: process.env.MARIADB_DATABASE || 'fusepoint_db'
    });

    try {
        console.log('🧹 Nettoyage des templates Standard dupliqués...\n');

        // 1. Identifier le template Standard le plus ancien (à conserver)
        const [oldestTemplate] = await connection.execute(`
            SELECT id, name, created_at 
            FROM project_templates 
            WHERE name = 'Template Standard' 
            ORDER BY created_at ASC 
            LIMIT 1
        `);

        if (oldestTemplate.length === 0) {
            console.log('ℹ️ Aucun template Standard trouvé');
            return;
        }

        const keepTemplateId = oldestTemplate[0].id;
        console.log(`✅ Template à conserver: ID ${keepTemplateId} (créé le ${oldestTemplate[0].created_at})`);

        // 2. Lister tous les templates Standard dupliqués
        const [duplicateTemplates] = await connection.execute(`
            SELECT id, name, created_at 
            FROM project_templates 
            WHERE name = 'Template Standard' AND id != ?
            ORDER BY created_at DESC
        `, [keepTemplateId]);

        console.log(`\n🗑️ Templates à supprimer: ${duplicateTemplates.length}`);
        duplicateTemplates.forEach((template, index) => {
            console.log(`${index + 1}. ID: ${template.id}, Créé: ${template.created_at}`);
        });

        if (duplicateTemplates.length === 0) {
            console.log('✅ Aucun doublon trouvé !');
            return;
        }

        // 3. Supprimer les associations de widgets pour les templates dupliqués
        const duplicateIds = duplicateTemplates.map(t => t.id);
        const placeholders = duplicateIds.map(() => '?').join(',');
        
        const [deletedAssociations] = await connection.execute(`
            DELETE FROM project_template_widgets 
            WHERE template_id IN (${placeholders})
        `, duplicateIds);

        console.log(`\n🔗 Associations de widgets supprimées: ${deletedAssociations.affectedRows}`);

        // 4. Supprimer les templates dupliqués
        const [deletedTemplates] = await connection.execute(`
            DELETE FROM project_templates 
            WHERE name = 'Template Standard' AND id != ?
        `, [keepTemplateId]);

        console.log(`📋 Templates dupliqués supprimés: ${deletedTemplates.affectedRows}`);

        // 5. Vérification finale
        const [remainingTemplates] = await connection.execute(`
            SELECT id, name, created_at 
            FROM project_templates 
            WHERE name = 'Template Standard'
        `);

        console.log(`\n✅ Nettoyage terminé !`);
        console.log(`📊 Templates Standard restants: ${remainingTemplates.length}`);
        remainingTemplates.forEach((template, index) => {
            console.log(`${index + 1}. ID: ${template.id}, Créé: ${template.created_at}`);
        });

    } catch (error) {
        console.error('❌ Erreur lors du nettoyage:', error);
    } finally {
        await connection.end();
    }
}

cleanupTemplates();