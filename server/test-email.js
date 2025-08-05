const EmailService = require('./services/emailService');

async function testEmailSending() {
  try {
    console.log('🧪 Test d\'envoi d\'email...');
    
    // Créer une instance du service email
    const emailService = new EmailService();
    
    // Données de test
    const testClientData = {
      email: 'samuskl@gmail.com',
      firstName: 'Test',
      lastName: 'Client',
      agentName: 'Agent Test',
      agentEmail: 'info@fusepoint.ch'
    };
    
    console.log('📧 Envoi d\'email d\'activation...');
    const activationResult = await emailService.sendClientActivationEmail(testClientData);
    console.log('✅ Email d\'activation envoyé:', activationResult);
    
    console.log('📧 Envoi d\'email de désactivation...');
    const deactivationResult = await emailService.sendClientDeactivationEmail(testClientData);
    console.log('✅ Email de désactivation envoyé:', deactivationResult);
    
  } catch (error) {
    console.error('❌ Erreur lors du test d\'email:', error.message);
    console.error('Stack:', error.stack);
  } finally {
    process.exit(0);
  }
}

testEmailSending();