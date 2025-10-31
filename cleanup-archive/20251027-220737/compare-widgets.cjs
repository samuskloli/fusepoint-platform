const databaseService = require('./server/services/databaseService');
const fs = require('fs');
const path = require('path');

// Configuration des chemins
const WIDGETS_DIR = path.join(__dirname, 'src/components/widgets');
const REGISTRY_DIR = path.join(__dirname, 'src/registry/manifests');

/**
 * Analyse approfondie d'un widget Vue pour vérifier s'il est réellement développé
 */
function analyzeVueWidget(filePath, widgetName) {
  const analysis = {
    name: widgetName,
    functionalityScore: 0,
    status: 'non_developed',
    issues: []
  };

  try {
    const vueContent = fs.readFileSync(filePath, 'utf8');

    // Vérifier la structure template
    const hasTemplate = /<template[^>]*>[\s\S]*<\/template>/i.test(vueContent);
    const templateContent = vueContent.match(/<template[^>]*>([\s\S]*)<\/template>/i)?.[1] || '';
    const hasRealContent = templateContent.trim().length > 50 && 
                          !templateContent.includes('TODO') && 
                          !templateContent.includes('En construction') &&
                          !templateContent.includes('Coming soon');
    
    if (hasTemplate && hasRealContent) {
      analysis.functionalityScore += 30;
    }

    // Vérifier la structure script
    const hasScript = /<script[^>]*>[\s\S]*<\/script>/i.test(vueContent);
    const scriptContent = vueContent.match(/<script[^>]*>([\s\S]*)<\/script>/i)?.[1] || '';
    const scriptTag = vueContent.match(/<script[^>]*>/i)?.[0] || '';
    
    const isScriptSetup = scriptTag.includes('setup');
    const isTypeScript = scriptTag.includes('lang="ts"') || scriptTag.includes("lang='ts'");
    
    const hasRealLogic = scriptContent.length > 200 &&
                        (scriptContent.includes('export default') || isScriptSetup) &&
                        (scriptContent.includes('ref(') || 
                         scriptContent.includes('reactive(') ||
                         scriptContent.includes('computed(') ||
                         scriptContent.includes('onMounted(') ||
                         scriptContent.includes('watch(') ||
                         scriptContent.includes('defineProps') ||
                         scriptContent.includes('defineEmits') ||
                         scriptContent.includes('data()') || 
                         scriptContent.includes('setup()') || 
                         scriptContent.includes('methods') ||
                         scriptContent.includes('computed'));

    if (hasScript && hasRealLogic) {
      analysis.functionalityScore += 40;
      if (isTypeScript) analysis.functionalityScore += 5;
      if (isScriptSetup) analysis.functionalityScore += 5;
    }

    // Vérifier les styles
    const hasStyle = /<style[^>]*>[\s\S]*<\/style>/i.test(vueContent);
    if (hasStyle) {
      analysis.functionalityScore += 10;
    }

    // Vérifier l'export
    if (scriptContent.includes('export default') || isScriptSetup) {
      analysis.functionalityScore += 10;
    }

    // Déterminer le statut final
    if (analysis.functionalityScore >= 80) {
      analysis.status = 'fully_developed';
    } else if (analysis.functionalityScore >= 50) {
      analysis.status = 'partially_developed';
    } else if (analysis.functionalityScore >= 20) {
      analysis.status = 'basic_structure';
    } else {
      analysis.status = 'non_developed';
    }

  } catch (error) {
    analysis.issues.push(`Erreur d'analyse: ${error.message}`);
  }

  return analysis;
}

/**
 * Trouve tous les widgets dans l'arborescence
 */
function findAllWidgets(dir, widgets = []) {
  const items = fs.readdirSync(dir, { withFileTypes: true });
  
  for (const item of items) {
    const fullPath = path.join(dir, item.name);
    
    if (item.isFile() && item.name.endsWith('.vue') && item.name.includes('Widget')) {
      const widgetName = item.name.replace('.vue', '');
      widgets.push({ name: widgetName, path: fullPath, type: 'file' });
    } else if (item.isDirectory() && !['components', 'modals', 'services', 'shared', 'types'].includes(item.name)) {
      const subWidgets = findAllWidgets(fullPath);
      widgets.push(...subWidgets);
    }
  }
  
  return widgets;
}

/**
 * Récupère les widgets du registry
 */
function getRegistryWidgets() {
  const widgets = [];
  
  if (!fs.existsSync(REGISTRY_DIR)) {
    return widgets;
  }
  
  const files = fs.readdirSync(REGISTRY_DIR);
  
  for (const file of files) {
    if (file.endsWith('.json')) {
      const widgetName = file.replace('.json', '');
      widgets.push(widgetName);
    }
  }
  
  return widgets;
}

/**
 * Détecte les doublons dans la liste des widgets
 */
function findDuplicates(widgets) {
  const duplicates = {};
  
  widgets.forEach(widget => {
    const name = widget.name.toLowerCase().trim();
    if (!duplicates[name]) {
      duplicates[name] = [];
    }
    duplicates[name].push(widget);
  });
  
  return Object.entries(duplicates)
    .filter(([name, widgets]) => widgets.length > 1)
    .map(([name, widgets]) => ({ name, widgets }));
}

async function compareWidgets() {
  try {
    console.log('🔍 Analyse approfondie des widgets...\n');

    // Récupérer les widgets de la base de données
    const widgets = await databaseService.query('SELECT * FROM widgets WHERE is_active = 1');
    console.log(`📊 Widgets en base de données: ${widgets.length}`);

    // Analyser tous les widgets développés avec analyse approfondie
    const allWidgets = findAllWidgets(WIDGETS_DIR);
    console.log(`💻 Fichiers widgets trouvés: ${allWidgets.length}`);

    // Analyser chaque widget en profondeur
    const widgetAnalysis = [];
    for (const widget of allWidgets) {
      const analysis = analyzeVueWidget(widget.path, widget.name);
      widgetAnalysis.push(analysis);
    }

    // Récupérer les widgets du registry
    const registryWidgets = getRegistryWidgets();
    console.log(`📋 Widgets dans le registry: ${registryWidgets.length}\n`);

    // Créer des maps pour faciliter la comparaison
    const dbWidgetMap = new Map(widgets.map(w => [w.name, w]));
    const analysisMap = new Map(widgetAnalysis.map(w => [w.name, w]));
    const regWidgetMap = new Map(registryWidgets.map(w => [w, true]));

    // Analyser les widgets par statut de développement
    const developmentStatus = {
      fully_developed: widgetAnalysis.filter(w => w.status === 'fully_developed'),
      partially_developed: widgetAnalysis.filter(w => w.status === 'partially_developed'),
      basic_structure: widgetAnalysis.filter(w => w.status === 'basic_structure'),
      non_developed: widgetAnalysis.filter(w => w.status === 'non_developed')
    };

    // Analyser les widgets
    const analysis = {
      inDbAndFullyDeveloped: [],
      inDbPartiallyDeveloped: [],
      inDbBasicStructure: [],
      inDbNotDeveloped: [],
      fullyDevelopedNotInDb: []
    };

    // Widgets en base
    for (const widget of widgets) {
      const widgetAnalysisResult = analysisMap.get(widget.name);
      
      if (widgetAnalysisResult) {
        switch (widgetAnalysisResult.status) {
          case 'fully_developed':
            analysis.inDbAndFullyDeveloped.push(widget);
            break;
          case 'partially_developed':
            analysis.inDbPartiallyDeveloped.push(widget);
            break;
          case 'basic_structure':
            analysis.inDbBasicStructure.push(widget);
            break;
          default:
            analysis.inDbNotDeveloped.push(widget);
        }
      } else {
        analysis.inDbNotDeveloped.push(widget);
      }
    }

    // Widgets entièrement développés mais pas en base
    for (const widget of developmentStatus.fully_developed) {
      if (!dbWidgetMap.has(widget.name)) {
        analysis.fullyDevelopedNotInDb.push(widget);
      }
    }

    // Afficher les résultats
    console.log('\n📈 ANALYSE APPROFONDIE DES WIDGETS\n');
    
    console.log('🎯 STATUT DE DÉVELOPPEMENT:');
    console.log(`✅ Entièrement développés: ${developmentStatus.fully_developed.length}`);
    console.log(`🔶 Partiellement développés: ${developmentStatus.partially_developed.length}`);
    console.log(`🔸 Structure de base: ${developmentStatus.basic_structure.length}`);
    console.log(`❌ Non développés: ${developmentStatus.non_developed.length}\n`);

    console.log('✅ Widgets en base ET entièrement développés:');
    analysis.inDbAndFullyDeveloped.forEach((widget, index) => {
      const score = analysisMap.get(widget.name)?.functionalityScore || 0;
      console.log(`  ${index + 1}. ${widget.name} - Score: ${score}/100`);
    });
    console.log(`  Total: ${analysis.inDbAndFullyDeveloped.length}\n`);

    console.log('🔶 Widgets en base et partiellement développés:');
    analysis.inDbPartiallyDeveloped.forEach((widget, index) => {
      const score = analysisMap.get(widget.name)?.functionalityScore || 0;
      console.log(`  ${index + 1}. ${widget.name} - Score: ${score}/100`);
    });
    console.log(`  Total: ${analysis.inDbPartiallyDeveloped.length}\n`);

    console.log('🔸 Widgets en base avec structure de base:');
    analysis.inDbBasicStructure.forEach((widget, index) => {
      const score = analysisMap.get(widget.name)?.functionalityScore || 0;
      console.log(`  ${index + 1}. ${widget.name} - Score: ${score}/100`);
    });
    console.log(`  Total: ${analysis.inDbBasicStructure.length}\n`);

    console.log('❌ Widgets en base mais NON développés:');
    analysis.inDbNotDeveloped.forEach((widget, index) => {
      console.log(`  ${index + 1}. ${widget.name}`);
      console.log(`     - Catégorie: ${widget.category}`);
      console.log(`     - Description: ${widget.description || 'Aucune description'}`);
    });
    console.log(`  Total: ${analysis.inDbNotDeveloped.length}\n`);

    console.log('🔧 Widgets entièrement développés mais PAS en base:');
    analysis.fullyDevelopedNotInDb.forEach((widget, index) => {
      const score = widget.functionalityScore || 0;
      console.log(`  ${index + 1}. ${widget.name} - Score: ${score}/100`);
    });
    console.log(`  Total: ${analysis.fullyDevelopedNotInDb.length}\n`);

    // Résumé par catégorie avec analyse approfondie
    console.log('📊 RÉSUMÉ PAR CATÉGORIE (widgets entièrement développés)\n');
    const categories = {};
    
    for (const widget of widgets) {
      if (!categories[widget.category]) {
        categories[widget.category] = { total: 0, fullyDeveloped: 0 };
      }
      categories[widget.category].total++;
      const widgetAnalysisResult = analysisMap.get(widget.name);
      if (widgetAnalysisResult && widgetAnalysisResult.status === 'fully_developed') {
        categories[widget.category].fullyDeveloped++;
      }
    }

    Object.keys(categories).sort().forEach(category => {
      const stats = categories[category];
      const percentage = ((stats.fullyDeveloped / stats.total) * 100).toFixed(1);
      console.log(`${category}: ${stats.fullyDeveloped}/${stats.total} (${percentage}%)`);
    });

    // Détection des doublons
    console.log('\n🔍 DÉTECTION DES DOUBLONS\n');
    const duplicates = findDuplicates(widgets);
    
    if (duplicates.length === 0) {
      console.log('✅ Aucun doublon détecté dans la base de données.');
    } else {
      console.log('⚠️  Doublons détectés:');
      duplicates.forEach(group => {
        console.log(`\n📦 Widget: ${group.name}`);
        group.widgets.forEach(widget => {
          console.log(`  - ID: ${widget.id}, Catégorie: ${widget.category}, Actif: ${widget.is_active ? 'Oui' : 'Non'}`);
        });
      });
    }

    // Pourcentage global de widgets fonctionnels
    const totalWidgets = widgetAnalysis.length;
    const functionalWidgets = developmentStatus.fully_developed.length;
    const functionalPercentage = totalWidgets > 0 ? ((functionalWidgets / totalWidgets) * 100).toFixed(1) : 0;
    
    console.log(`\n🎯 RÉSUMÉ GLOBAL:`);
    console.log(`Widgets fonctionnels: ${functionalWidgets}/${totalWidgets} (${functionalPercentage}%)`);

    process.exit(0);
    
  } catch (error) {
    console.error('❌ Erreur:', error);
    process.exit(1);
  }
}

compareWidgets();