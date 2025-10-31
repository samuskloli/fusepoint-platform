const databaseService = require('./services/databaseService');

async function debugCompanyIds() {
    try {
        console.log('🔍 Vérification des company_id...');
        
        // Vérifier le company_id de l'agent admin
        const adminUser = await databaseService.query(
            'SELECT id, email, first_name, last_name, role, company_id FROM users WHERE id = 1'
        );
        
        console.log('👨‍💼 Agent admin:');
        console.log(adminUser[0]);
        
        // Vérifier le company_id du client samuskl
        const clientUser = await databaseService.query(
            'SELECT id, email, first_name, last_name, role, company_id FROM users WHERE id = 35'
        );
        
        console.log('\n👤 Client samuskl:');
        console.log(clientUser[0]);
        
        // Vérifier les company_id des notifications récentes
        const notifications = await databaseService.query(
            `SELECT id, user_id, company_id, type, title, created_at 
             FROM notifications 
             WHERE user_id = 1 
             ORDER BY created_at DESC 
             LIMIT 10`
        );
        
        console.log('\n📬 Company_id des notifications de l\'agent admin:');
        notifications.forEach((notif, index) => {
            console.log(`${index + 1}. ID: ${notif.id} - Company_id: ${notif.company_id} - Type: ${notif.type} - ${notif.title}`);
        });
        
        // Compter les notifications par company_id
        const countByCompany = await databaseService.query(
            `SELECT company_id, COUNT(*) as count 
             FROM notifications 
             WHERE user_id = 1 
             GROUP BY company_id 
             ORDER BY count DESC`
        );
        
        console.log('\n📊 Répartition des notifications par company_id:');
        countByCompany.forEach(row => {
            console.log(`Company_id ${row.company_id}: ${row.count} notifications`);
        });
        
    } catch (error) {
        console.error('❌ Erreur:', error);
    } finally {
        process.exit(0);
    }
}

debugCompanyIds();