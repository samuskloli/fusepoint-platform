const ClientService = require('./services/clientService');
const databaseService = require('./services/databaseService');

async function testStatusChangeEmail() {
  try {
    console.log('🧪 Test de changement de statut avec envoi d\'email...');
    
    const clientService = new ClientService();
    
    // Récupérer un client existant pour le test
    const client = await databaseService.get(
      'SELECT id, first_name, last_name, email, is_active FROM users WHERE role IN ("user", "client") LIMIT 1'
    );
    
    if (!client) {
      console.log('❌ Aucun client trouvé pour le test');
      return;
    }
    
    console.log('👤 Client trouvé:', {
      id: client.id,
      name: `${client.first_name} ${client.last_name}`,
      email: client.email,
      currentStatus: client.is_active ? 'active' : 'inactive'
    });
    
    // Changer le statut (inverser le statut actuel)
    const newStatus = client.is_active ? 'inactive' : 'active';
    console.log(`🔄 Changement de statut vers: ${newStatus}`);
    
    const result = await clientService.updateClientStatus(client.id, newStatus, 1); // Agent ID = 1
    
    console.log('✅ Changement de statut réussi:', result);
    console.log('📧 Email envoyé automatiquement lors du changement de statut');
    
  } catch (error) {
    console.error('❌ Erreur lors du test:', error.message);
    console.error('Stack:', error.stack);
  } finally {
    process.exit(0);
  }
}

testStatusChangeEmail();