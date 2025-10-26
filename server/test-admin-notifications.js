const AccompagnementService = require('./services/accompagnementService');

async function testAdminNotifications() {
    try {
        const service = new AccompagnementService();
        
        // Attendre l'initialisation
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        console.log('🔍 Test des notifications pour l\'agent admin (ID: 1)...');
        
        // Récupérer toutes les notifications de l'admin (sans limite)
        const allNotifications = await service.getNotifications(1, null, false, 100);
        
        console.log(`📬 Total notifications trouvées: ${allNotifications.length}`);
        
        // Afficher les 10 plus récentes
        console.log('\n📋 Les 10 notifications les plus récentes:');
        allNotifications.slice(0, 10).forEach((notif, index) => {
            console.log(`${index + 1}. ID: ${notif.id}`);
            console.log(`   Type: ${notif.type}`);
            console.log(`   Titre: ${notif.title}`);
            console.log(`   Message: ${notif.message}`);
            console.log(`   Lu: ${notif.is_read ? 'Oui' : 'Non'}`);
            console.log(`   Créé: ${notif.created_at}`);
            console.log(`   Données: ${JSON.stringify(notif.data)}`);
            console.log('   ---');
        });
        
        // Filtrer les notifications de type new_service_request
        const serviceRequestNotifications = allNotifications.filter(n => n.type === 'new_service_request');
        console.log(`\n🔔 Notifications de type "new_service_request": ${serviceRequestNotifications.length}`);
        
        serviceRequestNotifications.forEach((notif, index) => {
            console.log(`${index + 1}. ID: ${notif.id} - ${notif.title} (${notif.created_at})`);
            console.log(`   Données: ${JSON.stringify(notif.data)}`);
        });
        
        // Test avec company_id
        console.log('\n🏢 Test avec company_id = 1:');
        const companyNotifications = await service.getNotifications(1, 1, false, 100);
        console.log(`📬 Notifications avec company_id=1: ${companyNotifications.length}`);
        
    } catch (error) {
        console.error('❌ Erreur:', error);
    } finally {
        process.exit(0);
    }
}

testAdminNotifications();