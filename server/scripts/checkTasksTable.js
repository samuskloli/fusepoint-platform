const databaseService = require('../services/databaseService');

async function main() {
  try {
    console.log('🔎 Vérification de la table `tasks`...');
    const tables = await databaseService.query("SHOW TABLES LIKE 'tasks'");
    if (tables && tables.length > 0) {
      console.log('✅ Table `tasks` trouvée.');
      const columns = await databaseService.query('SHOW COLUMNS FROM tasks');
      console.log('📋 Colonnes de `tasks`:', columns.map(c => `${c.Field} (${c.Type})`).join(', '));
    } else {
      console.log('❌ Table `tasks` introuvable.');
    }
    process.exit(0);
  } catch (err) {
    console.error('❌ Erreur lors de la vérification de la table `tasks`:', err?.message || err);
    process.exit(1);
  }
}

main();