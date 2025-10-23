const axios = require('axios');
const databaseService = require('./services/databaseService');

const BASE_URL = 'http://localhost:3000';
const PROJECT_ID = 47; // TEST Application Mobile - 2025

async function authenticateUser(email, password) {
    try {
        console.log(`   Tentative d'authentification: ${email}`);
        const response = await axios.post(`${BASE_URL}/api/auth/login`, {
            email,
            password
        });
        console.log(`   ✅ ${email} authentifié avec succès`);
        return response.data.tokens.accessToken;
    } catch (error) {
        console.log(`❌ Erreur d'authentification pour ${email}:`);
        console.log('   Status:', error.response?.status);
        console.log('   Data:', error.response?.data);
        console.log('   Message:', error.message);
        return null;
    }
}

async function getDashboard(token, userEmail) {
    try {
        const response = await axios.get(`${BASE_URL}/api/projects/${PROJECT_ID}/dashboard`, {
            headers: { Authorization: `Bearer ${token}` }
        });
        
        console.log(`\n📊 Dashboard pour ${userEmail}:`);
        console.log(`   Status: ${response.status}`);
        console.log(`   Version: ${response.data.version}`);
        console.log(`   Layout présent: ${response.data.layout ? 'Oui' : 'Non'}`);
        
        if (response.data.layout) {
            const layout = response.data.layout;
            console.log(`   Widgets dans layout: ${layout.widgets ? layout.widgets.length : 0}`);
            if (layout.widgets && layout.widgets.length > 0) {
                layout.widgets.forEach((widget, index) => {
                    console.log(`     Widget ${index + 1}: ${widget.type || widget.component} à (${widget.x}, ${widget.y})`);
                });
            }
        } else {
            console.log(`   ⚠️ Layout vide ou null`);
        }
        
        return response.data;
    } catch (error) {
        console.error(`❌ Erreur récupération dashboard pour ${userEmail}:`, error.response?.data || error.message);
        return null;
    }
}

async function testProjectDashboard() {
    try {
        console.log('🧪 Test des APIs de dashboard pour le projet spécifique...\n');

        // 1. Authentifier les deux utilisateurs
        console.log('1. Authentification des utilisateurs...');
        
        const clientToken = await authenticateUser('samuskl@gmail.com', 'password123');
        if (!clientToken) {
            console.log('❌ Impossible d\'authentifier le client');
            return;
        }
        console.log('✅ Client authentifié');

        const agentToken = await authenticateUser('admin@fusepoint.com', 'admin123');
        if (!agentToken) {
            console.log('❌ Impossible d\'authentifier l\'agent');
            return;
        }
        console.log('✅ Agent authentifié');

        // 2. Récupérer le dashboard pour chaque utilisateur
        console.log('\n2. Récupération des dashboards...');
        
        const clientDashboard = await getDashboard(clientToken, 'samuskl@gmail.com (CLIENT)');
        const agentDashboard = await getDashboard(agentToken, 'admin@fusepoint.com (AGENT)');

        // 3. Comparer les résultats
        console.log('\n3. Comparaison des résultats...');
        
        if (clientDashboard && agentDashboard) {
            const sameVersion = clientDashboard.version === agentDashboard.version;
            const sameLayout = JSON.stringify(clientDashboard.layout) === JSON.stringify(agentDashboard.layout);
            
            console.log(`   Même version: ${sameVersion ? '✅ Oui' : '❌ Non'} (Client: ${clientDashboard.version}, Agent: ${agentDashboard.version})`);
            console.log(`   Même layout: ${sameLayout ? '✅ Oui' : '❌ Non'}`);
            
            if (!sameLayout) {
                console.log('\n   🔍 Différences détectées:');
                console.log(`     Client layout: ${clientDashboard.layout ? 'Présent' : 'Absent/Null'}`);
                console.log(`     Agent layout: ${agentDashboard.layout ? 'Présent' : 'Absent/Null'}`);
            }
        }

        // 4. Vérifier les données brutes en base
        console.log('\n4. Vérification des données brutes...');
        const dbDashboard = await databaseService.query(
            'SELECT * FROM project_dashboards WHERE project_id = ?',
            [PROJECT_ID]
        );
        
        if (dbDashboard.length > 0) {
            const dashboard = dbDashboard[0];
            console.log(`   DB Version: ${dashboard.version}`);
            console.log(`   DB Layout: ${dashboard.layout_json ? 'Présent' : 'Absent/Null'}`);
            console.log(`   DB Updated: ${dashboard.updated_at}`);
            
            if (dashboard.layout_json) {
                try {
                    const layout = JSON.parse(dashboard.layout_json);
                    console.log(`   DB Widgets: ${layout.widgets ? layout.widgets.length : 0}`);
                } catch (e) {
                    console.log(`   ❌ Erreur parsing layout DB: ${e.message}`);
                }
            }
        }

        console.log('\n🧪 Test terminé.');

    } catch (error) {
        console.error('❌ Erreur lors du test:', error);
    } finally {
        process.exit(0);
    }
}

testProjectDashboard();