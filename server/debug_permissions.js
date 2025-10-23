const databaseService = require('./services/databaseService');

async function debugPermissions() {
    try {
        console.log('🔍 Diagnostic des permissions pour le projet 47...');

        // 1. Vérifier les données du projet
        console.log('\n1. Données du projet:');
        const project = await databaseService.get(`
            SELECT id, name, client_id, created_by, status 
            FROM projects 
            WHERE id = ?
        `, [47]);
        
        if (project) {
            console.log('   ✅ Projet trouvé:', {
                id: project.id,
                name: project.name,
                client_id: project.client_id,
                created_by: project.created_by,
                status: project.status
            });
        } else {
            console.log('   ❌ Projet non trouvé');
            return;
        }

        // 2. Vérifier les données de l'utilisateur client
        console.log('\n2. Données de l\'utilisateur client:');
        const clientUser = await databaseService.get(`
            SELECT id, email, role, is_active 
            FROM users 
            WHERE email = ?
        `, ['samuskl@gmail.com']);
        
        if (clientUser) {
            console.log('   ✅ Utilisateur client trouvé:', {
                id: clientUser.id,
                email: clientUser.email,
                role: clientUser.role,
                is_active: clientUser.is_active
            });
        } else {
            console.log('   ❌ Utilisateur client non trouvé');
            return;
        }

        // 3. Vérifier la logique de permissions exacte
        console.log('\n3. Test de la logique de permissions:');
        
        // Test de la requête exacte utilisée dans canViewDashboard
        const projectAccess = await databaseService.get(`
            SELECT p.id 
            FROM projects p
            LEFT JOIN team_members tm ON p.id = tm.project_id
            WHERE p.id = ? 
            AND (
                p.client_id = ?
                OR p.created_by = ? 
                OR tm.user_id = ?
                OR ? IN ('admin', 'super_admin')
            )
        `, [47, clientUser.id, clientUser.id, clientUser.id, clientUser.role]);

        console.log('   Résultat de la requête de permissions:', projectAccess ? 'ACCÈS AUTORISÉ' : 'ACCÈS REFUSÉ');

        // 4. Décomposer chaque condition
        console.log('\n4. Analyse détaillée des conditions:');
        
        // Condition 1: p.client_id = user_id (pour les clients)
        console.log(`   Condition 1 - client_id du projet (${project.client_id}) = user_id (${clientUser.id}):`, 
                   project.client_id === clientUser.id ? '✅ VRAI' : '❌ FAUX');

        // Condition 2: p.created_by = ?
        console.log(`   Condition 2 - created_by du projet (${project.created_by}) = user_id (${clientUser.id}):`, 
                   project.created_by === clientUser.id ? '✅ VRAI' : '❌ FAUX');

        // Condition 3: tm.user_id = ?
        const teamMember = await databaseService.get(`
            SELECT user_id FROM team_members WHERE project_id = ? AND user_id = ?
        `, [47, clientUser.id]);
        console.log(`   Condition 3 - membre de l'équipe:`, 
                   teamMember ? '✅ VRAI' : '❌ FAUX');

        // Condition 4: role IN ('admin', 'super_admin')
        console.log(`   Condition 4 - rôle admin (${clientUser.role}):`, 
                   ['admin', 'super_admin'].includes(clientUser.role) ? '✅ VRAI' : '❌ FAUX');

        // 5. Vérifier la table client_projects si elle existe
        console.log('\n5. Vérification de la table client_projects:');
        try {
            const clientProject = await databaseService.get(`
                SELECT * FROM client_projects WHERE client_id = ? AND project_id = ?
            `, [clientUser.id, 47]);
            console.log('   Relation client_projects:', clientProject ? '✅ TROUVÉE' : '❌ NON TROUVÉE');
            if (clientProject) {
                console.log('   Détails:', clientProject);
            }
        } catch (error) {
            console.log('   ❌ Table client_projects non accessible:', error.message);
        }

        // 6. Recommandations
        console.log('\n6. Recommandations:');
        if (!projectAccess) {
            console.log('   🔧 Le client n\'a pas accès au projet. Solutions possibles:');
            console.log('   - Vérifier que project.client_id correspond au client_id de l\'utilisateur');
            console.log('   - Ajouter l\'utilisateur comme membre de l\'équipe du projet');
            console.log('   - Vérifier la relation dans client_projects si applicable');
        } else {
            console.log('   ✅ L\'accès devrait être autorisé selon la logique de permissions');
        }

    } catch (error) {
        console.error('❌ Erreur lors du diagnostic:', error);
    } finally {
        process.exit(0);
    }
}

debugPermissions();