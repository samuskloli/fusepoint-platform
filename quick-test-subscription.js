const axios = require('axios');

async function testSubscriptionStatus() {
    try {
        console.log('🔍 Test du statut d\'abonnement...\n');
        
        // Test de connexion
        console.log('1. Test de connexion...');
        const loginResponse = await axios.post('http://localhost:3000/api/auth/login', {
            email: 'samuel@fusepoint.ca',
            password: 'password123'
        });
        
        if (loginResponse.status === 200) {
            console.log('✅ Connexion réussie');
            const token = loginResponse.data.token;
            const isPaidFromLogin = loginResponse.data.user.isPaid;
            console.log(`   isPaid depuis login: ${isPaidFromLogin}`);
            
            // Test de l'endpoint /auth/me
            console.log('\n2. Test de l\'endpoint /auth/me...');
            const meResponse = await axios.get('http://localhost:3000/api/auth/me', {
                headers: { Authorization: `Bearer ${token}` }
            });
            
            if (meResponse.status === 200) {
                console.log('✅ Endpoint /auth/me réussi');
                const isPaidFromMe = meResponse.data.user.isPaid;
                console.log(`   isPaid depuis /auth/me: ${isPaidFromMe}`);
                
                // Vérification de la cohérence
                if (isPaidFromLogin === isPaidFromMe) {
                    console.log(`\n✅ SUCCÈS: Le statut d'abonnement est cohérent: ${isPaidFromLogin ? 'PAYANT' : 'GRATUIT'}`);
                    
                    if (isPaidFromLogin) {
                        console.log('🎉 Le problème semble résolu ! Le statut est maintenant PAYANT.');
                    } else {
                        console.log('⚠️  Le statut est toujours GRATUIT. Le problème persiste.');
                    }
                } else {
                    console.log(`\n❌ INCOHÉRENCE: Login dit ${isPaidFromLogin}, /auth/me dit ${isPaidFromMe}`);
                }
            } else {
                console.log('❌ Erreur lors de l\'appel à /auth/me');
            }
        } else {
            console.log('❌ Échec de la connexion');
        }
        
    } catch (error) {
        console.error('❌ Erreur lors du test:', error.response?.data || error.message);
    }
}

testSubscriptionStatus();