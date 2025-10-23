const databaseService = require('./services/databaseService');

async function debugProjectDashboard() {
    try {
        console.log('🔍 Diagnostic du projet "TEST Application Mobile - 2025"...\n');

        // 1. Rechercher le projet par nom
        console.log('1. Recherche du projet...');
        const projects = await databaseService.query(
            'SELECT * FROM projects WHERE name LIKE ?',
            ['%TEST Application Mobile - 2025%']
        );
        
        if (projects.length === 0) {
            console.log('❌ Aucun projet trouvé avec ce nom');
            return;
        }

        const project = projects[0];
        console.log(`✅ Projet trouvé: ID ${project.id}, Nom: "${project.name}"`);
        console.log(`   Client ID: ${project.client_id}, Agent ID: ${project.agent_id}`);
        console.log(`   Créé le: ${project.created_at}\n`);

        // 2. Vérifier les utilisateurs associés
        console.log('2. Vérification des utilisateurs...');
        
        // Client
        const client = await databaseService.query(
            'SELECT id, email, role FROM users WHERE id = ?',
            [project.client_id]
        );
        console.log(`   Client: ${client[0]?.email || 'Non trouvé'} (ID: ${project.client_id})`);

        // Agent
        const agent = await databaseService.query(
            'SELECT id, email, role FROM users WHERE id = ?',
            [project.agent_id]
        );
        console.log(`   Agent: ${agent[0]?.email || 'Non trouvé'} (ID: ${project.agent_id})`);

        // Vérifier si samuskl@gmail.com existe
        const samuskl = await databaseService.query(
            'SELECT id, email, role FROM users WHERE email = ?',
            ['samuskl@gmail.com']
        );
        console.log(`   samuskl@gmail.com: ${samuskl[0] ? `Trouvé (ID: ${samuskl[0].id}, Role: ${samuskl[0].role})` : 'Non trouvé'}\n`);

        // 3. Vérifier le dashboard du projet
        console.log('3. Vérification du dashboard...');
        const dashboards = await databaseService.query(
            'SELECT * FROM project_dashboards WHERE project_id = ?',
            [project.id]
        );

        if (dashboards.length === 0) {
            console.log('❌ Aucun dashboard trouvé pour ce projet');
        } else {
            const dashboard = dashboards[0];
            console.log(`✅ Dashboard trouvé: Version ${dashboard.version}`);
            console.log(`   Créé le: ${dashboard.created_at}`);
            console.log(`   Modifié le: ${dashboard.updated_at}`);
            console.log(`   Layout: ${dashboard.layout ? 'Présent' : 'Absent'}`);
            
            if (dashboard.layout) {
                try {
                    const layout = JSON.parse(dashboard.layout);
                    console.log(`   Widgets: ${layout.widgets ? layout.widgets.length : 0}`);
                } catch (e) {
                    console.log(`   ❌ Erreur parsing layout: ${e.message}`);
                }
            }
        }

        // 4. Vérifier les permissions d'accès au projet
        console.log('\n4. Vérification des accès au projet...');
        
        // Vérifier si samuskl a accès au projet
        if (samuskl[0]) {
            const hasAccess = project.client_id === samuskl[0].id || project.agent_id === samuskl[0].id;
            console.log(`   samuskl@gmail.com a accès au projet: ${hasAccess ? '✅ Oui' : '❌ Non'}`);
            
            if (!hasAccess) {
                console.log(`   Raison: samuskl (ID: ${samuskl[0].id}) n'est ni le client (ID: ${project.client_id}) ni l'agent (ID: ${project.agent_id})`);
            }
        }

        // 5. Vérifier les widgets du projet
        console.log('\n5. Vérification des widgets...');
        const projectWidgets = await databaseService.query(
            `SELECT pw.*, w.name, w.component_name, w.category 
             FROM project_widgets pw 
             JOIN widgets w ON pw.widget_id = w.id 
             WHERE pw.project_id = ?`,
            [project.id]
        );
        console.log(`   Nombre de widgets: ${projectWidgets.length}`);
        
        if (projectWidgets.length > 0) {
            projectWidgets.forEach((widget, index) => {
                console.log(`   Widget ${index + 1}: ${widget.name} (${widget.component_name}) - Enabled: ${widget.is_enabled ? 'Oui' : 'Non'}`);
                console.log(`     Position: (${widget.position_x}, ${widget.position_y}), Taille: ${widget.width}x${widget.height}`);
            });
        }

        console.log('\n🔍 Diagnostic terminé.');

    } catch (error) {
        console.error('❌ Erreur lors du diagnostic:', error);
    } finally {
        process.exit(0);
    }
}

debugProjectDashboard();