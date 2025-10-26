const databaseService = require('./services/databaseService');
const PlatformSettingsService = require('./services/platformSettingsService');

async function fixUserCompanyAssociation() {
    try {
        console.log('🔧 Correction de l\'association utilisateur-entreprise...\n');
        
        // Initialiser les services
        await databaseService.initialize();
        const platformSettingsService = new PlatformSettingsService();
        
        const userId = 1; // ID de l'utilisateur
        
        // 1. Vérifier l'utilisateur
        console.log('1. Vérification de l\'utilisateur:');
        const user = await databaseService.getUserById(userId);
        if (!user) {
            console.log('❌ Utilisateur non trouvé');
            return;
        }
        console.log(`   ✅ Utilisateur: ${user.email}`);
        
        // 2. Vérifier les entreprises existantes de l'utilisateur
        console.log('\n2. Vérification des entreprises actuelles:');
        const currentCompanies = await databaseService.getUserCompanies(userId);
        console.log(`   📊 Nombre d'entreprises: ${currentCompanies.length}`);
        
        if (currentCompanies.length === 0) {
            console.log('   ⚠️  Aucune entreprise associée à l\'utilisateur');
            
            // 3. Vérifier s'il y a des entreprises dans la base
            console.log('\n3. Vérification des entreprises disponibles:');
            const allCompanies = await databaseService.getAllCompanies();
            console.log(`   📊 Nombre total d'entreprises: ${allCompanies.length}`);
            
            if (allCompanies.length > 0) {
                // Associer l'utilisateur à la première entreprise
                const firstCompany = allCompanies[0];
                console.log(`\n4. Association à l'entreprise: ${firstCompany.name} (ID: ${firstCompany.id})`);
                
                await databaseService.addUserToCompany(userId, firstCompany.id, 'owner');
                console.log('   ✅ Association créée avec succès');
                
                // 5. Définir le statut d'abonnement à payant
                const settingKey = `company_paid_${firstCompany.id}`;
                console.log(`\n5. Définition du statut d'abonnement: ${settingKey}`);
                
                await platformSettingsService.updateOrCreateSetting(settingKey, 'true');
                console.log('   ✅ Statut d\'abonnement défini à "payant"');
                
            } else {
                // Créer une entreprise par défaut
                console.log('\n4. Création d\'une entreprise par défaut:');
                const companyData = {
                    name: 'Entreprise par défaut',
                    industry: 'Marketing',
                    size: 'PME',
                    location: 'France',
                    website: '',
                    description: 'Entreprise créée automatiquement'
                };
                
                const newCompany = await databaseService.createCompany(companyData, userId);
                console.log(`   ✅ Entreprise créée: ${newCompany.name} (ID: ${newCompany.id})`);
                
                // 5. Définir le statut d'abonnement à payant
                const settingKey = `company_paid_${newCompany.id}`;
                console.log(`\n5. Définition du statut d'abonnement: ${settingKey}`);
                
                await platformSettingsService.updateOrCreateSetting(settingKey, 'true');
                console.log('   ✅ Statut d\'abonnement défini à "payant"');
            }
        } else {
            console.log('   ✅ L\'utilisateur a déjà des entreprises associées');
            
            // Vérifier le statut d'abonnement pour chaque entreprise
            console.log('\n3. Vérification du statut d\'abonnement:');
            for (const company of currentCompanies) {
                const settingKey = `company_paid_${company.id}`;
                const setting = await platformSettingsService.getSetting(settingKey);
                
                if (!setting || setting.value !== 'true') {
                    console.log(`   🔧 Correction du statut pour ${company.name}: ${settingKey}`);
                    await platformSettingsService.updateOrCreateSetting(settingKey, 'true');
                    console.log('   ✅ Statut corrigé');
                } else {
                    console.log(`   ✅ Statut OK pour ${company.name}: ${setting.value}`);
                }
            }
        }
        
        // 6. Vérification finale
        console.log('\n6. Vérification finale:');
        const finalCompanies = await databaseService.getUserCompanies(userId);
        console.log(`   📊 Entreprises associées: ${finalCompanies.length}`);
        
        for (const company of finalCompanies) {
            const settingKey = `company_paid_${company.id}`;
            const setting = await platformSettingsService.getSetting(settingKey);
            const isPaid = setting && setting.value === 'true';
            console.log(`   - ${company.name}: ${isPaid ? 'PAYANT' : 'GRATUIT'}`);
        }
        
        console.log('\n✅ Correction terminée !');
        
    } catch (error) {
        console.error('❌ Erreur lors de la correction:', error);
    } finally {
        process.exit(0);
    }
}

fixUserCompanyAssociation();