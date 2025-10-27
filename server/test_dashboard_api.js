const axios = require('axios');

const BASE_URL = 'http://localhost:3000/api';

async function testDashboardAPI() {
    try {
        console.log('🧪 Test direct de l\'API Dashboard...\n');

        // 1. Authentification du client
        console.log('1. Authentification du client...');
        const clientAuth = await axios.post(`${BASE_URL}/auth/login`, {
            email: 'samuskl@gmail.com',
            password: 'password123'
        });

        const clientToken = clientAuth.data.tokens.accessToken;
        console.log('✅ Client authentifié\n');

        // 2. Test de l'API dashboard pour le client
        console.log('2. Test GET dashboard pour le client...');
        try {
            const dashboardResponse = await axios.get(`${BASE_URL}/projects/47/dashboard`, {
                headers: {
                    'Authorization': `Bearer ${clientToken}`,
                    'Content-Type': 'application/json'
                }
            });

            console.log('✅ Dashboard récupéré avec succès!');
            console.log('Données reçues:');
            console.log(`   Project ID: ${dashboardResponse.data.data.projectId}`);
            console.log(`   Version: ${dashboardResponse.data.data.version}`);
            console.log(`   Widgets: ${dashboardResponse.data.data.layout.widgets?.length || 0}`);
            console.log(`   Can Edit: ${dashboardResponse.data.data.permissions.canEdit}`);

        } catch (error) {
            console.log('❌ Erreur dashboard client:');
            console.log(`   Status: ${error.response?.status}`);
            console.log(`   Message: ${error.response?.data?.message}`);
            console.log(`   Success: ${error.response?.data?.success}`);
        }

        // 3. Authentification de l'agent
        console.log('\n3. Authentification de l\'agent...');
        const agentAuth = await axios.post(`${BASE_URL}/auth/login`, {
            email: 'info@fusepoint.ch',
            password: 'admin123'
        });

        const agentToken = agentAuth.data.tokens.accessToken;
        console.log('✅ Agent authentifié\n');

        // 4. Test de l'API dashboard pour l'agent
        console.log('4. Test GET dashboard pour l\'agent...');
        try {
            const dashboardResponse = await axios.get(`${BASE_URL}/projects/47/dashboard`, {
                headers: {
                    'Authorization': `Bearer ${agentToken}`,
                    'Content-Type': 'application/json'
                }
            });

            console.log('✅ Dashboard récupéré avec succès!');
            console.log('Données reçues:');
            console.log(`   Project ID: ${dashboardResponse.data.data.projectId}`);
            console.log(`   Version: ${dashboardResponse.data.data.version}`);
            console.log(`   Widgets: ${dashboardResponse.data.data.layout.widgets?.length || 0}`);
            console.log(`   Can Edit: ${dashboardResponse.data.data.permissions.canEdit}`);

        } catch (error) {
            console.log('❌ Erreur dashboard agent:');
            console.log(`   Status: ${error.response?.status}`);
            console.log(`   Message: ${error.response?.data?.message}`);
            console.log(`   Success: ${error.response?.data?.success}`);
            
            // Afficher plus de détails sur l'erreur
            if (error.response?.status === 500) {
                console.log('   Détails erreur serveur:', error.response.data);
            }
        }

    } catch (error) {
        console.error('❌ Erreur générale:', error.message);
    }
}

testDashboardAPI();