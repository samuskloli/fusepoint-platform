const databaseService = require('./services/databaseService');
const AccompagnementService = require('./services/accompagnementService');
const EmailService = require('./services/emailService');

async function testNotificationForSamuskl() {
    try {
        console.log('🧪 Test de création de notification pour samuskl...');
        
        // 1. Récupérer les informations du client samuskl
        const client = await databaseService.get(
            'SELECT id, email, first_name, last_name, role, agent_id, company_id FROM users WHERE email LIKE ?',
            ['%samuskl%']
        );
        
        console.log('👤 Client samuskl:', client);
        
        if (!client) {
            console.log('❌ Client samuskl non trouvé');
            return;
        }
        
        // 2. Simuler la logique de récupération d'agent du code
        console.log('🔍 Test de la requête SQL du code...');
        const agent = await databaseService.get(
            `SELECT a.id, a.email, a.first_name, a.last_name
             FROM users c
             LEFT JOIN users a ON a.id = c.agent_id
             WHERE c.id = ?`,
            [client.id]
        );
        
        console.log('👨‍💼 Agent trouvé par la requête:', agent);
        
        if (agent && agent.id) {
            console.log('✅ Agent trouvé, création de la notification...');
            
            // 3. Créer une notification de test
            const accompagnementService = new AccompagnementService();
            
            const notificationData = {
                user_id: agent.id,
                company_id: client.company_id,
                type: 'new_service_request',
                title: 'Test - Nouvelle demande de prestation',
                message: `${client.first_name} ${client.last_name} a demandé: Test de notification`,
                data: { 
                    request_id: 999, 
                    service_id: 1, 
                    client_id: client.id 
                },
                action_url: '/agent/service-requests'
            };
            
            console.log('📝 Données de notification:', notificationData);
            
            try {
                const notification = await accompagnementService.createNotification(notificationData);
                console.log('✅ Notification créée:', notification);
            } catch (notifError) {
                console.error('❌ Erreur création notification:', notifError);
            }
            
            // 4. Tester l'envoi d'email
            console.log('📧 Test d\'envoi d\'email...');
            const emailService = new EmailService();
            try {
                await emailService.sendNotification(
                    agent.email,
                    `${agent.first_name} ${agent.last_name}`,
                    'new_service_request',
                    'Test - Nouvelle demande de prestation',
                    `${client.first_name} ${client.last_name} a créé une nouvelle demande de test`,
                    '/agent/service-requests'
                );
                console.log('✅ Email envoyé avec succès');
            } catch (emailErr) {
                console.error('❌ Erreur envoi email:', emailErr?.message || emailErr);
            }
            
        } else {
            console.log('❌ Aucun agent trouvé pour le client');
        }
        
    } catch (error) {
        console.error('❌ Erreur générale:', error);
    } finally {
        process.exit(0);
    }
}

testNotificationForSamuskl();