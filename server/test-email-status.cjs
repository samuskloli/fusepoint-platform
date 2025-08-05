require('dotenv').config();
const path = require('path');

// Import des services
const EmailService = require('./services/emailService');
const clientService = require('./services/clientService');
const databaseService = require('./services/databaseService');

// Créer une instance du service email
const emailService = new EmailService();

/**
 * Script de test pour vérifier l'envoi d'emails lors du changement de statut client
 */
async function testEmailStatusChange() {
  try {
    console.log('🧪 Test d\'envoi d\'email lors du changement de statut client');
    console.log('=' .repeat(60));
    
    // Initialiser la base de données
    await databaseService.initialize();
    console.log('✅ Base de données initialisée');
    
    // Vérifier la configuration SMTP
    console.log('\n📧 Configuration SMTP:');
    console.log('SMTP_HOST:', process.env.SMTP_HOST);
    console.log('SMTP_PORT:', process.env.SMTP_PORT);
    console.log('SMTP_USER:', process.env.SMTP_USER);
    console.log('EMAIL_FROM:', process.env.EMAIL_FROM);
    
    // Récupérer un client de test
    const testClient = await databaseService.get(
      'SELECT id, email, first_name, last_name, is_active FROM users WHERE role = "user" LIMIT 1'
    );
    
    if (!testClient) {
      console.log('❌ Aucun client trouvé pour le test');
      return;
    }
    
    console.log('\n👤 Client de test trouvé:');
    console.log(`ID: ${testClient.id}`);
    console.log(`Email: ${testClient.email}`);
    console.log(`Nom: ${testClient.first_name} ${testClient.last_name}`);
    console.log(`Statut actuel: ${testClient.is_active ? 'Actif' : 'Inactif'}`);
    
    // Tester le changement de statut
    const newStatus = testClient.is_active ? 'inactive' : 'active';
    console.log(`\n🔄 Test de changement de statut vers: ${newStatus}`);
    
    try {
      const result = await clientService.updateClientStatus(testClient.id, newStatus);
      console.log('✅ Changement de statut réussi:', result);
      
      // Vérifier que l'email a été envoyé (vérifier les logs)
      console.log('\n📧 Vérification de l\'envoi d\'email...');
      
      // Test direct d'envoi d'email
      const clientData = {
        email: testClient.email,
        firstName: testClient.first_name,
        lastName: testClient.last_name
      };
      
      if (newStatus === 'active') {
        console.log('📤 Test d\'envoi d\'email d\'activation...');
        await emailService.sendClientActivationEmail(clientData);
        console.log('✅ Email d\'activation envoyé avec succès');
      } else {
        console.log('📤 Test d\'envoi d\'email de désactivation...');
        await emailService.sendClientDeactivationEmail(clientData);
        console.log('✅ Email de désactivation envoyé avec succès');
      }
      
    } catch (error) {
      console.error('❌ Erreur lors du changement de statut:', error.message);
      console.error('Stack:', error.stack);
    }
    
  } catch (error) {
    console.error('❌ Erreur générale:', error.message);
    console.error('Stack:', error.stack);
  } finally {
    process.exit(0);
  }
}

// Exécuter le test
testEmailStatusChange();