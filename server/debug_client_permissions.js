const mysql = require('mysql2/promise');
require('dotenv').config();

async function debugClientPermissions() {
    const connection = await mysql.createConnection({
        host: process.env.MARIADB_HOST || 'localhost',
        user: process.env.MARIADB_USER || 'fusepoint_db',
        password: process.env.MARIADB_PASSWORD || 'FusepointBD2025!',
        database: process.env.MARIADB_DATABASE || 'fusepoint_db',
        port: process.env.MARIADB_PORT || 3306
    });

    try {
        console.log('=== Vérification des permissions du client samuskl@gmail.com sur le projet 47 ===\n');

        // 1. Vérifier l'utilisateur client
        const [users] = await connection.execute(
            'SELECT id, email, role FROM users WHERE email = ?',
            ['samuskl@gmail.com']
        );
        console.log('1. Utilisateur client:', users[0]);

        if (!users[0]) {
            console.log('❌ Utilisateur non trouvé');
            return;
        }

        const clientId = users[0].id;
        const clientRole = users[0].role;

        // 2. Vérifier le projet 47
        const [projects] = await connection.execute(
            'SELECT id, name, client_id, created_by FROM projects WHERE id = ?',
            [47]
        );
        console.log('\n2. Projet 47:', projects[0]);

        if (!projects[0]) {
            console.log('❌ Projet non trouvé');
            return;
        }

        // 3. Vérifier si le client est propriétaire du projet
        console.log('\n3. Vérification de propriété:');
        console.log(`   Client ID: ${clientId}`);
        console.log(`   Projet client_id: ${projects[0].client_id}`);
        console.log(`   Projet created_by: ${projects[0].created_by}`);
        console.log(`   Client est propriétaire: ${projects[0].client_id === clientId || projects[0].created_by === clientId}`);

        // 4. Vérifier les membres de l'équipe
        const [teamMembers] = await connection.execute(
            'SELECT user_id, role FROM team_members WHERE project_id = ?',
            [47]
        );
        console.log('\n4. Membres de l\'équipe du projet 47:');
        teamMembers.forEach(member => {
            console.log(`   User ID: ${member.user_id}, Role: ${member.role}`);
        });

        const isTeamMember = teamMembers.some(member => member.user_id === clientId);
        console.log(`   Client est membre de l'équipe: ${isTeamMember}`);

        // 5. Test de la fonction canViewDashboard
        console.log('\n5. Test de canViewDashboard:');
        
        // Simuler la logique de canViewDashboard
        const canView = clientRole === 'super_admin' || 
                       clientRole === 'admin' || 
                       projects[0].client_id === clientId || 
                       projects[0].created_by === clientId || 
                       isTeamMember;
        
        console.log(`   Peut voir le dashboard: ${canView}`);
        console.log(`   Raison: ${
            clientRole === 'super_admin' ? 'Super admin' :
            clientRole === 'admin' ? 'Admin' :
            projects[0].client_id === clientId ? 'Propriétaire (client_id)' :
            projects[0].created_by === clientId ? 'Créateur (created_by)' :
            isTeamMember ? 'Membre de l\'équipe' :
            'Aucun accès'
        }`);

        // 6. Vérifier les routes utilisées
        console.log('\n6. Analyse des routes:');
        console.log('   Le client devrait utiliser:');
        console.log('   - /api/client/projects/47 (au lieu de /api/agent/projects/47)');
        console.log('   - /api/client/projects/47/dashboard (au lieu de /api/agent/projects/47/dashboard)');
        console.log('   - /api/client/widgets (au lieu de /api/agent/widgets)');

    } catch (error) {
        console.error('Erreur:', error);
    } finally {
        await connection.end();
    }
}

debugClientPermissions();