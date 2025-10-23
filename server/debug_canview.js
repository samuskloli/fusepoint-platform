const databaseService = require('./services/databaseService');
const projectDashboardService = require('./services/projectDashboardService');

async function debugCanViewDashboard() {
    try {
        console.log('🔍 Test direct de canViewDashboard...\n');

        // Données de test
        const projectId = 47;
        const userId = 35; // samuskl@gmail.com
        const userRole = 'client';

        console.log('Paramètres de test:');
        console.log(`   Project ID: ${projectId}`);
        console.log(`   User ID: ${userId}`);
        console.log(`   User Role: ${userRole}\n`);

        // Test direct de la fonction canViewDashboard
        console.log('1. Test de canViewDashboard...');
        const canView = await projectDashboardService.canViewDashboard(projectId, userId, userRole);
        console.log(`   Résultat: ${canView ? '✅ AUTORISÉ' : '❌ REFUSÉ'}\n`);

        // Test de la requête SQL directement
        console.log('2. Test de la requête SQL directe...');
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
        `, [projectId, userId, userId, userId, userRole]);
        
        console.log(`   Résultat SQL: ${projectAccess ? '✅ TROUVÉ' : '❌ NON TROUVÉ'}`);
        if (projectAccess) {
            console.log(`   Détails:`, projectAccess);
        }

        // Vérifier les données du projet et de l'utilisateur
        console.log('\n3. Vérification des données...');
        const project = await databaseService.get('SELECT * FROM projects WHERE id = ?', [projectId]);
        const user = await databaseService.get('SELECT * FROM users WHERE id = ?', [userId]);
        
        console.log(`   Projet client_id: ${project?.client_id}`);
        console.log(`   User ID: ${user?.id}`);
        console.log(`   User role: ${user?.role}`);
        console.log(`   Match client_id: ${project?.client_id === user?.id ? '✅ OUI' : '❌ NON'}`);

    } catch (error) {
        console.error('❌ Erreur:', error);
    } finally {
        process.exit(0);
    }
}

debugCanViewDashboard();