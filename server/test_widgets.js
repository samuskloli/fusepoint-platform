const databaseService = require('./services/databaseService');

async function testWidgets() {
  try {
    console.log('🔍 Test de la table widgets...');
    
    // Test 1: Vérifier si la table existe
    const tables = await databaseService.query("SHOW TABLES LIKE 'widgets'");
    console.log('📋 Tables trouvées:', tables);
    
    if (tables.length === 0) {
      console.log('❌ La table widgets n\'existe pas');
      return;
    }
    
    // Test 2: Vérifier la structure de la table
    const structure = await databaseService.query("DESCRIBE widgets");
    console.log('🏗️ Structure de la table widgets:', structure);
    
    // Test 3: Compter les widgets actifs
    const count = await databaseService.query("SELECT COUNT(*) as count FROM widgets WHERE is_active = 1");
    console.log('📊 Nombre de widgets actifs:', count);
    
    // Test 4: Récupérer quelques widgets pour test (sans widget_key)
    const widgets = await databaseService.query("SELECT id, name, category, is_active FROM widgets LIMIT 3");
    console.log('🧩 Exemples de widgets:', widgets);
    
    // Test 5: Tester une requête corrigée sans widget_key
    const catalog = await databaseService.query(
      'SELECT id, name, category, is_active, config_schema FROM widgets WHERE is_active = 1 ORDER BY category, name'
    );
    console.log('✅ Catalog récupéré avec succès:', catalog.length, 'widgets');
    
  } catch (error) {
    console.error('❌ Erreur lors du test:', error);
    console.error('❌ Stack trace:', error.stack);
  } finally {
    process.exit(0);
  }
}

testWidgets();