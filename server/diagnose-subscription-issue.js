const databaseService = require('./services/databaseService');
const PlatformSettingsService = require('./services/platformSettingsService');

async function diagnoseSubscriptionIssue() {
    try {
        console.log('🔍 Diagnostic du problème de statut d\'abonnement...\n');
        
        // Initialiser les services
        await databaseService.initialize();
        const platformSettingsService = new PlatformSettingsService();
        
        // 1. Vérifier l'utilisateur avec ID 1
        console.log('1. Vérification de l\'utilisateur ID 1:');
        const user = await databaseService.getUserById(1);
        if (user) {
            console.log(`   ✅ Utilisateur trouvé: ${user.email}`);
        } else {
            console.log('   ❌ Utilisateur ID 1 non trouvé');
            return;
        }
        
        // 2. Vérifier les entreprises de l'utilisateur
        console.log('\n2. Vérification des entreprises de l\'utilisateur:');
        const companies = await databaseService.getUserCompanies(1);
        if (companies && companies.length > 0) {
            console.log(`   ✅ ${companies.length} entreprise(s) trouvée(s):`);
            companies.forEach((company, index) => {
                console.log(`      ${index + 1}. ID: ${company.id}, Nom: ${company.name}`);
            });
            
            // 3. Vérifier le statut d'abonnement pour chaque entreprise
            console.log('\n3. Vérification du statut d\'abonnement:');
            for (const company of companies) {
                const settingKey = `company_paid_${company.id}`;
                console.log(`   Clé: ${settingKey}`);
                
                try {
                    const setting = await platformSettingsService.getSetting(settingKey);
                    if (setting) {
                        console.log(`   ✅ Statut trouvé: ${setting.value} (${setting.value === 'true' ? 'PAYANT' : 'GRATUIT'})`);
                    } else {
                        console.log('   ⚠️  Aucun statut d\'abonnement trouvé pour cette entreprise');
                    }
                } catch (error) {
                    console.log(`   ❌ Erreur lors de la récupération du statut: ${error.message}`);
                }
            }
        } else {
            console.log('   ❌ Aucune entreprise trouvée pour cet utilisateur');
            console.log('   🔍 Cela explique pourquoi isPaid reste à false !');
        }
        
        // 4. Vérifier toutes les clés company_paid dans platform_settings
        console.log('\n4. Vérification de toutes les clés company_paid:');
        try {
            const allSettings = await platformSettingsService.getAllSettings();
            const companyPaidSettings = allSettings.filter(setting => setting.key.startsWith('company_paid_'));
            
            if (companyPaidSettings.length > 0) {
                console.log(`   ✅ ${companyPaidSettings.length} paramètre(s) company_paid trouvé(s):`);
                companyPaidSettings.forEach(setting => {
                    console.log(`      ${setting.key}: ${setting.value} (${setting.value === 'true' ? 'PAYANT' : 'GRATUIT'})`);
                });
            } else {
                console.log('   ⚠️  Aucun paramètre company_paid trouvé');
            }
        } catch (error) {
            console.log(`   ❌ Erreur lors de la récupération des paramètres: ${error.message}`);
        }
        
        // 5. Recommandations
        console.log('\n📋 RECOMMANDATIONS:');
        if (!companies || companies.length === 0) {
            console.log('   🔧 L\'utilisateur n\'a pas d\'entreprise associée');
            console.log('   🔧 Créer une entreprise pour l\'utilisateur ou associer une entreprise existante');
        } else {
            const companyId = companies[0].id;
            const settingKey = `company_paid_${companyId}`;
            console.log(`   🔧 Vérifier que la clé ${settingKey} existe et a la valeur 'true'`);
        }
        
    } catch (error) {
        console.error('❌ Erreur lors du diagnostic:', error);
    } finally {
        process.exit(0);
    }
}

diagnoseSubscriptionIssue();