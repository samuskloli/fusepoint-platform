const databaseService = require('./services/databaseService');
const clientService = require('./services/clientService');
const EmailService = require('./services/emailService');
require('dotenv').config({ path: './.env' });

// Créer une instance d'EmailService pour tester
const emailService = new EmailService();

async function testStatusChange() {
  try {
    console.log('🧪 Test de changement de statut pour samuskl@gmail.com');
    console.log('=' .repeat(60));
    
    // Initialiser la base de données
    await databaseService.initialize();
    console.log('✅ Base de données initialisée');
    
    // Récupérer le client
    const client = await databaseService.get(
      'SELECT id, email, first_name, last_name, is_active FROM users WHERE email = ?',
      ['samuskl@gmail.com']
    );
    
    if (!client) {
      console.log('❌ Client non trouvé');
      return;
    }
    
    console.log('📋 Client trouvé:', {
      id: client.id,
      email: client.email,
      nom: `${client.first_name} ${client.last_name}`,
      statut_actuel: client.is_active ? 'actif' : 'inactif'
    });
    
    // Déterminer le nouveau statut
    const nouveauStatut = client.is_active ? 'inactive' : 'active';
    console.log(`\n🔄 Changement de statut vers: ${nouveauStatut}`);
    
    // Appeler la méthode updateClientStatus qui inclut l'envoi d'email
    const result = await clientService.updateClientStatus(client.id, nouveauStatut);
    
    console.log('✅ Statut changé avec succès:', result);
    
    // Vérifier le nouveau statut
    const updatedClient = await databaseService.get(
      'SELECT id, email, first_name, last_name, is_active FROM users WHERE id = ?',
      [client.id]
    );
    
    console.log('📋 Nouveau statut du client:', {
      id: updatedClient.id,
      email: updatedClient.email,
      nom: `${updatedClient.first_name} ${updatedClient.last_name}`,
      statut_nouveau: updatedClient.is_active ? 'actif' : 'inactif'
    });
    
    // Test direct d'envoi d'email
    console.log('\n📧 Test direct d\'envoi d\'email...');
    try {
      const clientData = {
        email: updatedClient.email,
        firstName: updatedClient.first_name,
        lastName: updatedClient.last_name,
        agentName: 'Équipe Fusepoint',
        agentEmail: 'support@fusepoint.com'
      };
      
      if (nouveauStatut === 'active') {
        console.log('📤 Envoi d\'email d\'activation...');
        await emailService.sendClientActivationEmail(clientData);
        console.log('✅ Email d\'activation envoyé avec succès');
      } else {
        console.log('📤 Envoi d\'email de désactivation...');
        await emailService.sendClientDeactivationEmail(clientData);
        console.log('✅ Email de désactivation envoyé avec succès');
      }
    } catch (emailError) {
      console.error('❌ Erreur lors de l\'envoi d\'email:', emailError.message);
      console.error('Stack email:', emailError.stack);
    }
    
  } catch (error) {
    console.error('❌ Erreur lors du test:', error.message);
    console.error('Stack:', error.stack);
  } finally {
    process.exit(0);
  }
}

testStatusChange();