const databaseService = require('../services/databaseService');

(async () => {
  try {
    console.log('⚙️ Initialisation MariaDB et création des tables...');
    await databaseService.initialize();
    console.log('✅ Tables MariaDB créées/validées avec succès');
    process.exit(0);
  } catch (error) {
    console.error('❌ Erreur lors de l\'initialisation des tables:', error.message);
    process.exit(1);
  }
})();