const databaseService = require('./services/databaseService');
const projectDashboardService = require('./services/projectDashboardService');

async function debugLayoutIssue() {
  try {
    console.log('🔍 Debug du problème de layout JSON...');
    
    // 1. Vérifier la structure de la table
    console.log('\n1. Structure de la table project_dashboards...');
    const tableStructure = await databaseService.query(`DESCRIBE project_dashboards`);
    console.log('📋 Colonnes de la table:', tableStructure.map(col => ({
      Field: col.Field,
      Type: col.Type,
      Null: col.Null,
      Key: col.Key,
      Default: col.Default
    })));
    
    // 2. Vérifier le dashboard directement en base
    console.log('\n2. Récupération directe du dashboard en base...');
    const dashboard = await databaseService.get(`
      SELECT project_id, layout_json, version, created_at, updated_at
      FROM project_dashboards 
      WHERE project_id = ?
    `, [47]);
    
    if (!dashboard) {
      console.log('❌ Aucun dashboard trouvé pour le projet 47');
      return;
    }
    
    console.log('✅ Dashboard trouvé:', {
      project_id: dashboard.project_id,
      layout_json_type: typeof dashboard.layout_json,
      layout_json_value: dashboard.layout_json,
      layout_json_length: dashboard.layout_json ? dashboard.layout_json.length : 0,
      version: dashboard.version
    });
    
    // 3. Tester le parsing JSON
    console.log('\n3. Test du parsing JSON...');
    try {
      let layoutData;
      if (typeof dashboard.layout_json === 'string') {
        console.log('📝 layout_json est une string, tentative de parsing...');
        layoutData = JSON.parse(dashboard.layout_json);
        console.log('✅ Parsing JSON réussi:', layoutData);
      } else {
        console.log('📦 layout_json est un objet:', dashboard.layout_json);
        layoutData = dashboard.layout_json;
      }
      
      console.log('📊 Type de layoutData:', typeof layoutData);
      console.log('📊 Contenu de layoutData:', layoutData);
      
    } catch (parseError) {
      console.log('❌ Erreur de parsing JSON:', parseError.message);
      console.log('📝 Contenu brut:', dashboard.layout_json);
    }
    
    // 4. Tester la fonction getProjectDashboard
    console.log('\n4. Test de getProjectDashboard...');
    try {
      const result = await projectDashboardService.getProjectDashboard(47, 35);
      console.log('✅ getProjectDashboard réussi:', result);
    } catch (serviceError) {
      console.log('❌ Erreur dans getProjectDashboard:', serviceError.message);
      console.log('📋 Stack trace:', serviceError.stack);
    }
    
  } catch (error) {
    console.error('❌ Erreur générale:', error);
  } finally {
    process.exit(0);
  }
}

debugLayoutIssue();