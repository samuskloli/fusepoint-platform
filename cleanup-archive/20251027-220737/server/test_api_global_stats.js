const axios = require('axios');

async function testGlobalStatsAPI() {
  try {
    console.log('🧪 === TEST DE L\'ENDPOINT API GLOBAL-STATS ===');

    const baseUrl = process.env.API_BASE_URL || 'http://localhost:3004';
    const token = process.env.API_TOKEN || '';
    if (!token) {
      console.warn('⚠️ Aucun token fourni. Définissez API_TOKEN dans l\'environnement.');
    }

    const response = await axios.get(`${baseUrl}/api/linkpoints/global-stats`, {
      params: { range: 30 },
      headers: {
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        'Content-Type': 'application/json'
      }
    });

    console.log('✅ Réponse de l\'API:');
    console.log('Status:', response.status);
    console.log('Data:', JSON.stringify(response.data, null, 2));

    if (response.data.totals) {
      console.log(`\n📊 RÉSULTATS:`);
      console.log(`- Scans: ${response.data.totals.scans}`);
      console.log(`- Clics: ${response.data.totals.clicks}`);
      console.log(`- CTR: ${Number(response.data.ctr || 0).toFixed(2)}%`);
    }
  } catch (error) {
    console.error('❌ Erreur lors du test de l\'API:');
    if (error.response) {
      console.error('Status:', error.response.status);
      console.error('Data:', error.response.data);
    } else {
      console.error('Message:', error.message);
    }
  }
}

testGlobalStatsAPI();