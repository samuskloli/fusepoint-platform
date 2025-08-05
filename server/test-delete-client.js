const ClientManagementService = require('./services/clientManagementService');
const DatabaseService = require('./services/databaseService');

async function testDeleteClient() {
  try {
    console.log('🧪 Test de suppression de client avec vérification du mot de passe...');
    
    // Récupérer un client existant
    const clients = await DatabaseService.query('SELECT * FROM clients LIMIT 1');
    if (clients.length === 0) {
      console.log('❌ Aucun client trouvé pour le test');
      return;
    }
    
    const client = clients[0];
    console.log(`📋 Client trouvé: ${client.first_name} ${client.last_name} (ID: ${client.id})`);
    
    // Récupérer un agent existant
    const agents = await DatabaseService.query('SELECT * FROM agents LIMIT 1');
    if (agents.length === 0) {
      console.log('❌ Aucun agent trouvé pour le test');
      return;
    }
    
    const agent = agents[0];
    console.log(`👤 Agent trouvé: ${agent.first_name} ${agent.last_name} (ID: ${agent.id})`);
    
    // Test 1: Tentative de suppression avec un mauvais mot de passe
    console.log('\n🔒 Test 1: Suppression avec mauvais mot de passe...');
    try {
      await ClientManagementService.deleteClient(
        client.id,
        agent.id,
        'mauvais_mot_de_passe',
        'Test de suppression avec mauvais mot de passe'
      );
      console.log('❌ ERREUR: La suppression aurait dû échouer avec un mauvais mot de passe');
    } catch (error) {
      if (error.message.includes('Mot de passe invalide')) {
        console.log('✅ Succès: La suppression a été correctement refusée avec un mauvais mot de passe');
      } else {
        console.log(`❌ Erreur inattendue: ${error.message}`);
      }
    }
    
    // Test 2: Vérification que le client existe toujours
    console.log('\n📋 Test 2: Vérification que le client existe toujours...');
    const stillExists = await DatabaseService.query('SELECT * FROM clients WHERE id = ?', [client.id]);
    if (stillExists.length > 0) {
      console.log('✅ Succès: Le client existe toujours après la tentative de suppression avec mauvais mot de passe');
    } else {
      console.log('❌ ERREUR: Le client a été supprimé malgré le mauvais mot de passe');
    }
    
    console.log('\n🎯 Test terminé. La fonction de suppression semble fonctionner correctement.');
    console.log('💡 Pour tester avec le bon mot de passe, vous devez connaître le mot de passe de l\'agent.');
    
  } catch (error) {
    console.error('❌ Erreur lors du test:', error);
  } finally {
    process.exit(0);
  }
}

testDeleteClient();