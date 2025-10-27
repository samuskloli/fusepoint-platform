const databaseService = require('./services/databaseService');
const platformSettingsService = require('./services/platformSettingsService');

async function updateSubscriptionStatus() {
  try {
    console.log('🔄 Initialisation de la base de données...');
    await databaseService.initialize();
    
    const userId = 1; // info@fusepoint.ch
    console.log(`👤 Mise à jour de l'abonnement pour l'utilisateur ID: ${userId}`);
    
    // Récupérer les entreprises de l'utilisateur
    console.log('🏢 Récupération des entreprises de l\'utilisateur...');
    const companies = await databaseService.getUserCompanies(userId);
    console.log('Entreprises trouvées:', companies);
    
    if (!companies || companies.length === 0) {
      console.log('❌ Aucune entreprise trouvée pour cet utilisateur');
      
      // Créer une entreprise par défaut si nécessaire
      console.log('🏢 Création d\'une entreprise par défaut...');
      const companyResult = await databaseService.run(
        'INSERT INTO companies (name, created_at) VALUES (?, NOW())',
        ['Fusepoint Admin Company']
      );
      
      const companyId = companyResult.insertId;
      console.log(`✅ Entreprise créée avec l'ID: ${companyId}`);
      
      // Associer l'utilisateur à cette entreprise
      await databaseService.run(
        'UPDATE users SET company_id = ? WHERE id = ?',
        [companyId, userId]
      );
      
      console.log('✅ Utilisateur associé à l\'entreprise');
      
      // Mettre à jour le statut d'abonnement (payant)
      await platformSettingsService.updateOrCreateSetting(
        `company_paid_${companyId}`, 
        'true', 
        'boolean', 
        'subscription', 
        `Statut d'abonnement pour l'entreprise ${companyId}`
      );
      
      console.log('✅ Statut d\'abonnement mis à jour: PAYANT');
      
    } else {
      const companyId = companies[0].id;
      console.log(`🏢 Entreprise trouvée: ${companyId}`);
      
      // Mettre à jour le statut d'abonnement (payant)
      await platformSettingsService.updateOrCreateSetting(
        `company_paid_${companyId}`, 
        'true', 
        'boolean', 
        'subscription', 
        `Statut d'abonnement pour l'entreprise ${companyId}`
      );
      
      console.log('✅ Statut d\'abonnement mis à jour: PAYANT');
    }
    
    console.log('🎉 Mise à jour terminée avec succès !');
    
  } catch (error) {
    console.error('❌ Erreur:', error.message);
    console.error(error.stack);
  } finally {
    await databaseService.close();
  }
}

updateSubscriptionStatus();