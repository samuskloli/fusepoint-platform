const databaseService = require('./services/databaseService');

async function checkNotifications() {
    try {
        console.log('🔍 Vérification des notifications récentes...');
        
        // Récupérer les notifications les plus récentes
        const notifications = await databaseService.query(
            `SELECT n.*, u.email, u.first_name, u.last_name, u.role 
             FROM notifications n 
             LEFT JOIN users u ON n.user_id = u.id 
             ORDER BY n.created_at DESC 
             LIMIT 10`
        );
        
        console.log('📬 Notifications récentes:');
        notifications.forEach((notif, index) => {
            console.log(`${index + 1}. ID: ${notif.id}`);
            console.log(`   Pour: ${notif.first_name} ${notif.last_name} (${notif.email}) - ${notif.role}`);
            console.log(`   Type: ${notif.type}`);
            console.log(`   Titre: ${notif.title}`);
            console.log(`   Message: ${notif.message}`);
            console.log(`   Lu: ${notif.is_read ? 'Oui' : 'Non'}`);
            console.log(`   Créé: ${notif.created_at}`);
            console.log(`   Données: ${notif.data}`);
            console.log('   ---');
        });
        
        // Vérifier spécifiquement les notifications pour l'agent admin (ID: 1)
        const adminNotifications = await databaseService.query(
            `SELECT * FROM notifications 
             WHERE user_id = 1 
             ORDER BY created_at DESC 
             LIMIT 5`
        );
        
        console.log('👨‍💼 Notifications pour l\'agent admin (ID: 1):');
        adminNotifications.forEach((notif, index) => {
            console.log(`${index + 1}. ID: ${notif.id} - ${notif.title} (${notif.created_at})`);
        });
        
    } catch (error) {
        console.error('❌ Erreur:', error);
    } finally {
        process.exit(0);
    }
}

checkNotifications();