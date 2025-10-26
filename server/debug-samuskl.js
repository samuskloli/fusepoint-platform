const databaseService = require('./services/databaseService');

async function debugSamusklAgent() {
    try {
        console.log('🔍 Vérification de l\'assignation d\'agent pour samuskl...');
        
        // 1. Récupérer les informations du client samuskl (par email)
        const client = await databaseService.get(
            'SELECT id, email, first_name, last_name, role, agent_id, company_id FROM users WHERE email LIKE ?',
            ['%samuskl%']
        );
        
        console.log('👤 Client samuskl:', client);
        
        if (!client) {
            console.log('❌ Client samuskl non trouvé');
            return;
        }
        
        // 2. Vérifier si un agent est assigné
        if (client.agent_id) {
            const agent = await databaseService.get(
                'SELECT id, email, first_name, last_name, role FROM users WHERE id = ?',
                [client.agent_id]
            );
            console.log('👨‍💼 Agent assigné:', agent);
        } else {
            console.log('⚠️ Aucun agent assigné au client samuskl');
        }
        
        // 3. Tester la requête SQL utilisée dans le code
        const agentFromQuery = await databaseService.get(
            `SELECT a.id, a.email, a.first_name, a.last_name
             FROM users c
             LEFT JOIN users a ON a.id = c.agent_id
             WHERE c.id = ?`,
            [client.id]
        );
        
        console.log('🔍 Résultat de la requête SQL du code:', agentFromQuery);
        
        // 4. Lister tous les agents disponibles
        const agents = await databaseService.query(
            'SELECT id, email, first_name, last_name, role FROM users WHERE role IN ("agent", "admin", "super_admin") AND is_active = 1'
        );
        
        console.log('👥 Agents disponibles:', agents);
        
    } catch (error) {
        console.error('❌ Erreur:', error);
    } finally {
        process.exit(0);
    }
}

debugSamusklAgent();