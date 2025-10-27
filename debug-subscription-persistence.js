const axios = require('axios');
const databaseService = require('./server/services/databaseService');
const platformSettingsService = require('./server/services/platformSettingsService');

const API_BASE_URL = 'http://localhost:3000/api';

async function debugSubscriptionPersistence() {
  console.log('🔍 Diagnostic complet du problème de persistance du statut d\'abonnement\n');

  try {
    // Initialiser la base de données
    await databaseService.initialize();
    const platformService = new platformSettingsService();

    // 1. Vérifier l'état actuel en base de données
    console.log('1️⃣ Vérification de l\'état en base de données...');
    const userId = 1; // info@fusepoint.ch
    const companies = await databaseService.getUserCompanies(userId);
    
    if (!companies || companies.length === 0) {
      console.log('❌ Aucune entreprise trouvée pour l\'utilisateur');
      return;
    }

    const companyId = companies[0].id;
    console.log(`🏢 Entreprise trouvée: ID ${companyId}`);

    // Vérifier le statut actuel
    const currentSetting = await platformService.getSetting(`company_paid_${companyId}`);
    console.log('📊 Statut actuel en base:', currentSetting ? currentSetting.value : 'non défini');

    // 2. Forcer le statut à "payant"
    console.log('\n2️⃣ Mise à jour forcée vers PAYANT...');
    await platformService.updateOrCreateSetting(
      `company_paid_${companyId}`, 
      'true', 
      'boolean', 
      'subscription', 
      `Statut payant pour l'entreprise ${companyId}`
    );

    // Vérifier immédiatement après la mise à jour
    const afterUpdateSetting = await platformService.getSetting(`company_paid_${companyId}`);
    console.log('✅ Statut après mise à jour:', afterUpdateSetting ? afterUpdateSetting.value : 'non défini');

    // 3. Test de connexion API
    console.log('\n3️⃣ Test de connexion via API...');
    const loginResponse = await axios.post(`${API_BASE_URL}/auth/login`, {
      email: 'info@fusepoint.ch',
      password: 'admin123'
    });

    if (loginResponse.data.success) {
      console.log('✅ Connexion réussie');
      console.log('📊 isPaid dans login:', loginResponse.data.user.isPaid);
      
      const accessToken = loginResponse.data.accessToken;

      // 4. Test de l'endpoint /auth/me
      console.log('\n4️⃣ Test de l\'endpoint /auth/me...');
      const meResponse = await axios.get(`${API_BASE_URL}/auth/me`, {
        headers: {
          'Authorization': `Bearer ${accessToken}`
        }
      });

      if (meResponse.data.success) {
        console.log('✅ Endpoint /auth/me fonctionne');
        console.log('📊 isPaid dans /auth/me:', meResponse.data.user.isPaid);
      }

      // 5. Vérifier à nouveau le statut en base après les appels API
      console.log('\n5️⃣ Vérification finale en base de données...');
      const finalSetting = await platformService.getSetting(`company_paid_${companyId}`);
      console.log('📊 Statut final en base:', finalSetting ? finalSetting.value : 'non défini');

      // 6. Test de mise à jour via l'API admin
      console.log('\n6️⃣ Test de mise à jour via API admin...');
      try {
        const updateResponse = await axios.put(`${API_BASE_URL}/admin/users/${userId}/subscription`, {
          isPaid: true
        }, {
          headers: {
            'Authorization': `Bearer ${accessToken}`
          }
        });
        console.log('✅ Mise à jour via API admin réussie:', updateResponse.data);
      } catch (apiError) {
        console.log('❌ Erreur API admin:', apiError.response?.data || apiError.message);
      }

      // 7. Vérification finale après API admin
      console.log('\n7️⃣ Vérification après API admin...');
      const veryFinalSetting = await platformService.getSetting(`company_paid_${companyId}`);
      console.log('📊 Statut très final en base:', veryFinalSetting ? veryFinalSetting.value : 'non défini');

    } else {
      console.log('❌ Échec de la connexion:', loginResponse.data);
    }

  } catch (error) {
    console.error('❌ Erreur lors du diagnostic:', error.message);
    console.error(error.stack);
  } finally {
    await databaseService.close();
  }

  console.log('\n🏁 Diagnostic terminé');
}

debugSubscriptionPersistence();