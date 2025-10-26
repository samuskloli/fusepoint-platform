const fs = require('fs');
const path = require('path');

// Configuration des chemins
const WIDGETS_DIR = path.join(__dirname, 'src/components/widgets');
const REGISTRY_DIR = path.join(__dirname, 'src/registry/manifests');

/**
 * Analyse approfondie d'un widget pour vérifier s'il est réellement développé
 */
function analyzeWidget(widgetPath, widgetName) {
  const analysis = {
    name: widgetName,
    exists: false,
    hasVueFile: false,
    hasValidTemplate: false,
    hasValidScript: false,
    hasValidStyle: false,
    hasExport: false,
    hasManifest: false,
    manifestValid: false,
    functionalityScore: 0,
    issues: [],
    status: 'non_developed'
  };

  try {
    // 1. Vérifier si le répertoire existe
    if (!fs.existsSync(widgetPath)) {
      analysis.issues.push('Répertoire du widget inexistant');
      return analysis;
    }
    analysis.exists = true;

    // 2. Chercher le fichier Vue principal
    const vueFiles = fs.readdirSync(widgetPath).filter(file => file.endsWith('.vue'));
    const mainVueFile = vueFiles.find(file => 
      file.toLowerCase().includes(widgetName.toLowerCase()) || 
      file === 'index.vue' || 
      file === `${widgetName}.vue`
    ) || vueFiles[0];

    if (!mainVueFile) {
      analysis.issues.push('Aucun fichier Vue trouvé');
      return analysis;
    }
    analysis.hasVueFile = true;

    // 3. Analyser le contenu du fichier Vue
    const vueFilePath = path.join(widgetPath, mainVueFile);
    const vueContent = fs.readFileSync(vueFilePath, 'utf8');

    // Vérifier la structure template
    const hasTemplate = /<template[^>]*>[\s\S]*<\/template>/i.test(vueContent);
    const templateContent = vueContent.match(/<template[^>]*>([\s\S]*)<\/template>/i)?.[1] || '';
    const hasRealContent = templateContent.trim().length > 50 && 
                          !templateContent.includes('TODO') && 
                          !templateContent.includes('En construction');
    
    if (hasTemplate && hasRealContent) {
      analysis.hasValidTemplate = true;
      analysis.functionalityScore += 30;
    } else if (hasTemplate) {
      analysis.issues.push('Template vide ou placeholder');
    } else {
      analysis.issues.push('Pas de template');
    }

    // Vérifier la structure script
    const hasScript = /<script[^>]*>[\s\S]*<\/script>/i.test(vueContent);
    const scriptContent = vueContent.match(/<script[^>]*>([\s\S]*)<\/script>/i)?.[1] || '';
    const hasRealLogic = scriptContent.includes('export default') && 
                        scriptContent.length > 100 &&
                        (scriptContent.includes('data()') || 
                         scriptContent.includes('setup()') || 
                         scriptContent.includes('methods') ||
                         scriptContent.includes('computed'));

    if (hasScript && hasRealLogic) {
      analysis.hasValidScript = true;
      analysis.functionalityScore += 40;
    } else if (hasScript) {
      analysis.issues.push('Script minimal ou vide');
    } else {
      analysis.issues.push('Pas de script');
    }

    // Vérifier les styles
    const hasStyle = /<style[^>]*>[\s\S]*<\/style>/i.test(vueContent);
    if (hasStyle) {
      analysis.hasValidStyle = true;
      analysis.functionalityScore += 10;
    }

    // Vérifier l'export
    if (scriptContent.includes('export default')) {
      analysis.hasExport = true;
      analysis.functionalityScore += 10;
    } else {
      analysis.issues.push('Pas d\'export par défaut');
    }

    // 4. Vérifier le manifeste
    const manifestPath = path.join(REGISTRY_DIR, `${widgetName}.json`);
    if (fs.existsSync(manifestPath)) {
      analysis.hasManifest = true;
      try {
        const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
        if (manifest.name && manifest.category && manifest.component) {
          analysis.manifestValid = true;
          analysis.functionalityScore += 10;
        } else {
          analysis.issues.push('Manifeste incomplet');
        }
      } catch (e) {
        analysis.issues.push('Manifeste JSON invalide');
      }
    } else {
      analysis.issues.push('Pas de manifeste');
    }

    // 5. Déterminer le statut final
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
 * Analyse un fichier widget Vue directement
 */
function analyzeVueWidget(filePath, widgetName) {
  const analysis = {
    name: widgetName,
    exists: true,
    hasVueFile: true,
    hasValidTemplate: false,
    hasValidScript: false,
    hasValidStyle: false,
    hasExport: false,
    hasManifest: false,
    manifestValid: false,
    functionalityScore: 0,
    issues: [],
    status: 'non_developed'
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
      analysis.hasValidTemplate = true;
      analysis.functionalityScore += 30;
    } else if (hasTemplate) {
      analysis.issues.push('Template vide ou placeholder');
    } else {
      analysis.issues.push('Pas de template');
    }

    // Vérifier la structure script
    const hasScript = /<script[^>]*>[\s\S]*<\/script>/i.test(vueContent);
    const scriptContent = vueContent.match(/<script[^>]*>([\s\S]*)<\/script>/i)?.[1] || '';
    const scriptTag = vueContent.match(/<script[^>]*>/i)?.[0] || '';
    
    // Détecter Vue 3 Composition API avec <script setup>
    const isScriptSetup = scriptTag.includes('setup');
    const isTypeScript = scriptTag.includes('lang="ts"') || scriptTag.includes("lang='ts'");
    
    // Vérifier la logique réelle
    const hasRealLogic = scriptContent.length > 200 &&
                        (scriptContent.includes('export default') || 
                         isScriptSetup) &&
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
      analysis.hasValidScript = true;
      analysis.functionalityScore += 40;
      
      // Bonus pour TypeScript et Composition API moderne
      if (isTypeScript) analysis.functionalityScore += 5;
      if (isScriptSetup) analysis.functionalityScore += 5;
    } else if (hasScript) {
      analysis.issues.push('Script minimal ou vide');
    } else {
      analysis.issues.push('Pas de script');
    }

    // Vérifier les styles
    const hasStyle = /<style[^>]*>[\s\S]*<\/style>/i.test(vueContent);
    if (hasStyle) {
      analysis.hasValidStyle = true;
      analysis.functionalityScore += 10;
    }

    // Vérifier l'export (Vue 2 style ou Vue 3 setup)
    if (scriptContent.includes('export default') || isScriptSetup) {
      analysis.hasExport = true;
      analysis.functionalityScore += 10;
    } else {
      analysis.issues.push('Pas d\'export par défaut ou script setup');
    }

    // Vérifier le manifeste
    const manifestPath = path.join(REGISTRY_DIR, `${widgetName}.json`);
    if (fs.existsSync(manifestPath)) {
      analysis.hasManifest = true;
      try {
        const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
        if (manifest.name && manifest.category && manifest.component) {
          analysis.manifestValid = true;
          analysis.functionalityScore += 10;
        } else {
          analysis.issues.push('Manifeste incomplet');
        }
      } catch (e) {
        analysis.issues.push('Manifeste JSON invalide');
      }
    } else {
      analysis.issues.push('Pas de manifeste');
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
      // Chercher dans les sous-répertoires
      const subWidgets = findAllWidgets(fullPath);
      widgets.push(...subWidgets);
    }
  }
  
  return widgets;
}

/**
 * Analyse tous les widgets
 */
async function analyzeAllWidgets() {
  console.log('🔍 ANALYSE APPROFONDIE DES WIDGETS');
  console.log('=====================================\n');

  const results = {
    fully_developed: [],
    partially_developed: [],
    basic_structure: [],
    non_developed: [],
    total: 0
  };

  try {
    if (!fs.existsSync(WIDGETS_DIR)) {
      console.log('❌ Répertoire des widgets introuvable:', WIDGETS_DIR);
      return;
    }

    // Trouver tous les widgets
    const allWidgets = findAllWidgets(WIDGETS_DIR);
    
    console.log(`📊 Analyse de ${allWidgets.length} widgets...\n`);

    for (const widget of allWidgets) {
      let analysis;
      
      if (widget.type === 'file') {
        analysis = analyzeVueWidget(widget.path, widget.name);
      } else {
        analysis = analyzeWidget(widget.path, widget.name);
      }
      
      results[analysis.status].push(analysis);
      results.total++;

      // Afficher le résultat pour chaque widget
      const statusEmoji = {
        fully_developed: '✅',
        partially_developed: '🟡',
        basic_structure: '🟠',
        non_developed: '❌'
      };

      console.log(`${statusEmoji[analysis.status]} ${widget.name} (Score: ${analysis.functionalityScore}/100)`);
      if (analysis.issues.length > 0) {
        analysis.issues.forEach(issue => console.log(`   ⚠️  ${issue}`));
      }
      console.log('');
    }

    // Afficher le résumé
    console.log('\n📋 RÉSUMÉ DE L\'ANALYSE:');
    console.log('========================');
    console.log(`✅ Entièrement développés: ${results.fully_developed.length}`);
    console.log(`🟡 Partiellement développés: ${results.partially_developed.length}`);
    console.log(`🟠 Structure de base: ${results.basic_structure.length}`);
    console.log(`❌ Non développés: ${results.non_developed.length}`);
    console.log(`📊 Total: ${results.total}`);

    const developedPercentage = Math.round(
      ((results.fully_developed.length + results.partially_developed.length) / results.total) * 100
    );
    console.log(`📈 Pourcentage de widgets fonctionnels: ${developedPercentage}%`);

    // Détails par catégorie
    console.log('\n📝 WIDGETS ENTIÈREMENT DÉVELOPPÉS:');
    results.fully_developed.forEach(widget => {
      console.log(`   ✅ ${widget.name}`);
    });

    console.log('\n📝 WIDGETS PARTIELLEMENT DÉVELOPPÉS:');
    results.partially_developed.forEach(widget => {
      console.log(`   🟡 ${widget.name} (Score: ${widget.functionalityScore}/100)`);
      widget.issues.forEach(issue => console.log(`      ⚠️  ${issue}`));
    });

    console.log('\n📝 WIDGETS NON DÉVELOPPÉS:');
    results.non_developed.forEach(widget => {
      console.log(`   ❌ ${widget.name}`);
      widget.issues.slice(0, 3).forEach(issue => console.log(`      ⚠️  ${issue}`));
    });

  } catch (error) {
    console.error('❌ Erreur lors de l\'analyse:', error);
  }
}

// Exécuter l'analyse
analyzeAllWidgets();