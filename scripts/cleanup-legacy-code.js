#!/usr/bin/env node
/**
 * Script de nettoyage du code legacy après migration multi-tenant
 * Supprime les fichiers, routes, services et composants obsolètes
 */

const fs = require('fs').promises;
const path = require('path');
const { execSync } = require('child_process');

class LegacyCodeCleanup {
  constructor() {
    this.projectRoot = process.cwd();
    this.cleanupReport = {
      timestamp: new Date().toISOString(),
      files_removed: [],
      directories_removed: [],
      code_updated: [],
      dependencies_removed: [],
      errors: [],
      warnings: [],
      statistics: {
        total_files_removed: 0,
        total_directories_removed: 0,
        total_lines_removed: 0,
        space_saved_bytes: 0
      }
    };
  }

  async run() {
    console.log('🧹 Démarrage du nettoyage du code legacy...');
    
    try {
      // Étape 1: Analyser les fichiers inutilisés
      await this.analyzeUnusedFiles();
      
      // Étape 2: Supprimer les routes legacy
      await this.removeLegacyRoutes();
      
      // Étape 3: Supprimer les services obsolètes
      await this.removeLegacyServices();
      
      // Étape 4: Nettoyer les composants frontend
      await this.cleanupFrontendComponents();
      
      // Étape 5: Supprimer les dépendances inutilisées
      await this.removeUnusedDependencies();
      
      // Étape 6: Nettoyer les fichiers de configuration
      await this.cleanupConfigFiles();
      
      // Étape 7: Optimiser les imports
      await this.optimizeImports();
      
      // Étape 8: Nettoyer les styles CSS
      await this.cleanupStyles();
      
      // Étape 9: Supprimer les tests obsolètes
      await this.removeLegacyTests();
      
      // Étape 10: Générer le rapport final
      await this.generateReport();
      
      console.log('✅ Nettoyage terminé avec succès!');
      
    } catch (error) {
      console.error('❌ Erreur lors du nettoyage:', error);
      this.cleanupReport.errors.push({
        type: 'CLEANUP_ERROR',
        message: error.message,
        stack: error.stack
      });
    }
  }

  async analyzeUnusedFiles() {
    console.log('📊 Analyse des fichiers inutilisés...');
    
    try {
      // Utiliser ts-prune pour détecter les exports inutilisés
      const tsPruneOutput = execSync('npx ts-prune --error', { 
        encoding: 'utf8',
        cwd: this.projectRoot 
      });
      
      if (tsPruneOutput.trim()) {
        this.cleanupReport.warnings.push({
          type: 'UNUSED_EXPORTS',
          message: 'Exports inutilisés détectés',
          details: tsPruneOutput.split('\n').filter(line => line.trim())
        });
      }
    } catch (error) {
      // ts-prune peut retourner un code d'erreur même en cas de succès
      if (error.stdout) {
        this.cleanupReport.warnings.push({
          type: 'UNUSED_EXPORTS',
          message: 'Exports inutilisés détectés',
          details: error.stdout.split('\n').filter(line => line.trim())
        });
      }
    }
    
    // Analyser les dépendances inutilisées avec depcheck
    try {
      const depcheckOutput = execSync('npx depcheck --json', { 
        encoding: 'utf8',
        cwd: this.projectRoot 
      });
      
      const depcheckResult = JSON.parse(depcheckOutput);
      
      if (depcheckResult.dependencies.length > 0) {
        this.cleanupReport.dependencies_removed = depcheckResult.dependencies;
      }
    } catch (error) {
      this.cleanupReport.errors.push({
        type: 'DEPCHECK_ERROR',
        message: 'Erreur lors de l\'analyse des dépendances',
        details: error.message
      });
    }
  }

  async removeLegacyRoutes() {
    console.log('🛣️ Suppression des routes legacy...');
    
    const legacyRouteFiles = [
      'server/routes/legacyFiles.js',
      'server/routes/legacyTasks.js',
      'server/routes/legacyProjects.js',
      'server/routes/legacyClients.js',
      'server/routes/oldWidgets.js',
      'server/routes/deprecatedApi.js'
    ];
    
    for (const routeFile of legacyRouteFiles) {
      await this.removeFileIfExists(routeFile);
    }
    
    // Nettoyer les références dans le fichier principal des routes
    await this.updateRoutesIndex();
  }

  async removeLegacyServices() {
    console.log('🔧 Suppression des services obsolètes...');
    
    const legacyServiceFiles = [
      'server/services/legacyFileService.js',
      'server/services/legacyTaskService.js',
      'server/services/legacyProjectService.js',
      'server/services/oldWidgetService.js',
      'server/services/deprecatedService.js',
      'src/services/legacyApiService.ts',
      'src/services/oldFilesService.ts',
      'src/services/oldTasksService.ts'
    ];
    
    for (const serviceFile of legacyServiceFiles) {
      await this.removeFileIfExists(serviceFile);
    }
  }

  async cleanupFrontendComponents() {
    console.log('🎨 Nettoyage des composants frontend...');
    
    const legacyComponents = [
      'src/components/legacy/',
      'src/components/old/',
      'src/components/deprecated/',
      'src/components/LegacyFilesWidget.vue',
      'src/components/LegacyTasksWidget.vue',
      'src/components/OldProjectSelector.vue',
      'src/components/DeprecatedDashboard.vue'
    ];
    
    for (const component of legacyComponents) {
      await this.removeFileOrDirectoryIfExists(component);
    }
    
    // Nettoyer les imports dans les fichiers principaux
    await this.cleanupComponentImports();
  }

  async removeUnusedDependencies() {
    console.log('📦 Suppression des dépendances inutilisées...');
    
    const dependenciesToRemove = [
      'legacy-widget-lib',
      'old-file-uploader',
      'deprecated-ui-components',
      'unused-utility-lib'
    ];
    
    // Ajouter les dépendances détectées par depcheck
    dependenciesToRemove.push(...this.cleanupReport.dependencies_removed);
    
    if (dependenciesToRemove.length > 0) {
      try {
        const depsToRemove = dependenciesToRemove.join(' ');
        execSync(`npm uninstall ${depsToRemove}`, { 
          cwd: this.projectRoot,
          stdio: 'inherit'
        });
        
        this.cleanupReport.dependencies_removed = dependenciesToRemove;
      } catch (error) {
        this.cleanupReport.errors.push({
          type: 'DEPENDENCY_REMOVAL_ERROR',
          message: 'Erreur lors de la suppression des dépendances',
          details: error.message
        });
      }
    }
  }

  async cleanupConfigFiles() {
    console.log('⚙️ Nettoyage des fichiers de configuration...');
    
    // Nettoyer les configurations obsolètes
    const configUpdates = [
      {
        file: 'tsconfig.json',
        updates: {
          compilerOptions: {
            noUnusedLocals: true,
            noUnusedParameters: true,
            exactOptionalPropertyTypes: true
          }
        }
      },
      {
        file: '.eslintrc.js',
        updates: {
          rules: {
            'no-unused-vars': 'error',
            '@typescript-eslint/no-unused-vars': 'error',
            'import/no-unused-modules': 'error'
          }
        }
      }
    ];
    
    for (const config of configUpdates) {
      await this.updateConfigFile(config.file, config.updates);
    }
  }

  async optimizeImports() {
    console.log('📥 Optimisation des imports...');
    
    try {
      // Utiliser ESLint pour corriger automatiquement les imports
      execSync('npx eslint --fix --ext .js,.ts,.vue src/ server/', {
        cwd: this.projectRoot,
        stdio: 'inherit'
      });
      
      this.cleanupReport.code_updated.push({
        type: 'IMPORTS_OPTIMIZED',
        message: 'Imports optimisés automatiquement'
      });
    } catch (error) {
      this.cleanupReport.warnings.push({
        type: 'IMPORT_OPTIMIZATION_WARNING',
        message: 'Certains imports n\'ont pas pu être optimisés automatiquement',
        details: error.message
      });
    }
  }

  async cleanupStyles() {
    console.log('🎨 Nettoyage des styles CSS...');
    
    const legacyStyleFiles = [
      'src/assets/styles/legacy.css',
      'src/assets/styles/old-components.css',
      'src/assets/styles/deprecated.scss',
      'src/components/legacy/styles/'
    ];
    
    for (const styleFile of legacyStyleFiles) {
      await this.removeFileOrDirectoryIfExists(styleFile);
    }
    
    // Utiliser PurgeCSS pour supprimer les styles inutilisés
    try {
      execSync('npx purgecss --css src/assets/styles/*.css --content src/**/*.vue src/**/*.ts --output src/assets/styles/', {
        cwd: this.projectRoot,
        stdio: 'inherit'
      });
      
      this.cleanupReport.code_updated.push({
        type: 'CSS_PURGED',
        message: 'Styles CSS inutilisés supprimés'
      });
    } catch (error) {
      this.cleanupReport.warnings.push({
        type: 'CSS_PURGE_WARNING',
        message: 'PurgeCSS n\'a pas pu être exécuté',
        details: error.message
      });
    }
  }

  async removeLegacyTests() {
    console.log('🧪 Suppression des tests obsolètes...');
    
    const legacyTestFiles = [
      'tests/legacy/',
      'tests/old/',
      'tests/unit/legacy/',
      'tests/e2e/legacy/',
      'tests/unit/legacyFiles.test.js',
      'tests/unit/legacyTasks.test.js',
      'tests/e2e/legacyWorkflow.test.js'
    ];
    
    for (const testFile of legacyTestFiles) {
      await this.removeFileOrDirectoryIfExists(testFile);
    }
  }

  async removeFileIfExists(filePath) {
    const fullPath = path.join(this.projectRoot, filePath);
    
    try {
      const stats = await fs.stat(fullPath);
      const sizeBytes = stats.size;
      
      await fs.unlink(fullPath);
      
      this.cleanupReport.files_removed.push(filePath);
      this.cleanupReport.statistics.total_files_removed++;
      this.cleanupReport.statistics.space_saved_bytes += sizeBytes;
      
      console.log(`  ✅ Supprimé: ${filePath}`);
    } catch (error) {
      if (error.code !== 'ENOENT') {
        this.cleanupReport.errors.push({
          type: 'FILE_REMOVAL_ERROR',
          file: filePath,
          message: error.message
        });
      }
    }
  }

  async removeFileOrDirectoryIfExists(itemPath) {
    const fullPath = path.join(this.projectRoot, itemPath);
    
    try {
      const stats = await fs.stat(fullPath);
      
      if (stats.isDirectory()) {
        const dirSize = await this.calculateDirectorySize(fullPath);
        await fs.rmdir(fullPath, { recursive: true });
        
        this.cleanupReport.directories_removed.push(itemPath);
        this.cleanupReport.statistics.total_directories_removed++;
        this.cleanupReport.statistics.space_saved_bytes += dirSize;
        
        console.log(`  ✅ Dossier supprimé: ${itemPath}`);
      } else {
        await this.removeFileIfExists(itemPath);
      }
    } catch (error) {
      if (error.code !== 'ENOENT') {
        this.cleanupReport.errors.push({
          type: 'ITEM_REMOVAL_ERROR',
          item: itemPath,
          message: error.message
        });
      }
    }
  }

  async calculateDirectorySize(dirPath) {
    let totalSize = 0;
    
    try {
      const items = await fs.readdir(dirPath);
      
      for (const item of items) {
        const itemPath = path.join(dirPath, item);
        const stats = await fs.stat(itemPath);
        
        if (stats.isDirectory()) {
          totalSize += await this.calculateDirectorySize(itemPath);
        } else {
          totalSize += stats.size;
        }
      }
    } catch (error) {
      // Ignorer les erreurs de lecture de dossier
    }
    
    return totalSize;
  }

  async updateRoutesIndex() {
    const routesIndexPath = path.join(this.projectRoot, 'server/routes/index.js');
    
    try {
      let content = await fs.readFile(routesIndexPath, 'utf8');
      
      // Supprimer les imports et utilisations des routes legacy
      const legacyImports = [
        /const\s+legacyFiles\s*=\s*require\(['"]\.\/legacyFiles['"]\);?/g,
        /const\s+legacyTasks\s*=\s*require\(['"]\.\/legacyTasks['"]\);?/g,
        /const\s+oldWidgets\s*=\s*require\(['"]\.\/oldWidgets['"]\);?/g,
        /app\.use\(['"]\/(api\/)?legacy['"],\s*legacyFiles\);?/g,
        /app\.use\(['"]\/(api\/)?legacy['"],\s*legacyTasks\);?/g,
        /app\.use\(['"]\/(api\/)?old['"],\s*oldWidgets\);?/g
      ];
      
      let updated = false;
      for (const regex of legacyImports) {
        if (regex.test(content)) {
          content = content.replace(regex, '');
          updated = true;
        }
      }
      
      if (updated) {
        // Nettoyer les lignes vides multiples
        content = content.replace(/\n\s*\n\s*\n/g, '\n\n');
        
        await fs.writeFile(routesIndexPath, content, 'utf8');
        
        this.cleanupReport.code_updated.push({
          type: 'ROUTES_INDEX_UPDATED',
          file: 'server/routes/index.js',
          message: 'Références aux routes legacy supprimées'
        });
      }
    } catch (error) {
      this.cleanupReport.errors.push({
        type: 'ROUTES_UPDATE_ERROR',
        file: 'server/routes/index.js',
        message: error.message
      });
    }
  }

  async cleanupComponentImports() {
    const mainComponentFiles = [
      'src/App.vue',
      'src/main.ts',
      'src/router/index.ts',
      'src/components/Dashboard.vue'
    ];
    
    for (const filePath of mainComponentFiles) {
      await this.removeImportsFromFile(filePath, [
        /import.*from\s+['"].*\/legacy\//g,
        /import.*from\s+['"].*\/old\//g,
        /import.*from\s+['"].*\/deprecated\//g,
        /import\s+LegacyFilesWidget\s+from.*/g,
        /import\s+LegacyTasksWidget\s+from.*/g,
        /import\s+OldProjectSelector\s+from.*/g
      ]);
    }
  }

  async removeImportsFromFile(filePath, regexPatterns) {
    const fullPath = path.join(this.projectRoot, filePath);
    
    try {
      let content = await fs.readFile(fullPath, 'utf8');
      let updated = false;
      
      for (const regex of regexPatterns) {
        if (regex.test(content)) {
          content = content.replace(regex, '');
          updated = true;
        }
      }
      
      if (updated) {
        // Nettoyer les lignes vides multiples
        content = content.replace(/\n\s*\n\s*\n/g, '\n\n');
        
        await fs.writeFile(fullPath, content, 'utf8');
        
        this.cleanupReport.code_updated.push({
          type: 'IMPORTS_CLEANED',
          file: filePath,
          message: 'Imports legacy supprimés'
        });
      }
    } catch (error) {
      if (error.code !== 'ENOENT') {
        this.cleanupReport.errors.push({
          type: 'IMPORT_CLEANUP_ERROR',
          file: filePath,
          message: error.message
        });
      }
    }
  }

  async updateConfigFile(configPath, updates) {
    const fullPath = path.join(this.projectRoot, configPath);
    
    try {
      const content = await fs.readFile(fullPath, 'utf8');
      const config = JSON.parse(content);
      
      // Fusionner les mises à jour
      const updatedConfig = this.deepMerge(config, updates);
      
      await fs.writeFile(fullPath, JSON.stringify(updatedConfig, null, 2), 'utf8');
      
      this.cleanupReport.code_updated.push({
        type: 'CONFIG_UPDATED',
        file: configPath,
        message: 'Configuration mise à jour'
      });
    } catch (error) {
      this.cleanupReport.errors.push({
        type: 'CONFIG_UPDATE_ERROR',
        file: configPath,
        message: error.message
      });
    }
  }

  deepMerge(target, source) {
    const result = { ...target };
    
    for (const key in source) {
      if (source[key] && typeof source[key] === 'object' && !Array.isArray(source[key])) {
        result[key] = this.deepMerge(result[key] || {}, source[key]);
      } else {
        result[key] = source[key];
      }
    }
    
    return result;
  }

  async generateReport() {
    console.log('📊 Génération du rapport de nettoyage...');
    
    // Calculer les statistiques finales
    this.cleanupReport.statistics.space_saved_mb = 
      (this.cleanupReport.statistics.space_saved_bytes / (1024 * 1024)).toFixed(2);
    
    // Sauvegarder le rapport
    const reportPath = path.join(this.projectRoot, 'cleanup-report.json');
    await fs.writeFile(reportPath, JSON.stringify(this.cleanupReport, null, 2), 'utf8');
    
    // Afficher le résumé
    console.log('\n📋 RÉSUMÉ DU NETTOYAGE:');
    console.log(`   Fichiers supprimés: ${this.cleanupReport.statistics.total_files_removed}`);
    console.log(`   Dossiers supprimés: ${this.cleanupReport.statistics.total_directories_removed}`);
    console.log(`   Espace libéré: ${this.cleanupReport.statistics.space_saved_mb} MB`);
    console.log(`   Dépendances supprimées: ${this.cleanupReport.dependencies_removed.length}`);
    console.log(`   Fichiers mis à jour: ${this.cleanupReport.code_updated.length}`);
    console.log(`   Erreurs: ${this.cleanupReport.errors.length}`);
    console.log(`   Avertissements: ${this.cleanupReport.warnings.length}`);
    console.log(`\n📄 Rapport détaillé sauvegardé: ${reportPath}`);
    
    if (this.cleanupReport.errors.length > 0) {
      console.log('\n⚠️  ERREURS DÉTECTÉES:');
      this.cleanupReport.errors.forEach(error => {
        console.log(`   - ${error.type}: ${error.message}`);
      });
    }
    
    if (this.cleanupReport.warnings.length > 0) {
      console.log('\n⚠️  AVERTISSEMENTS:');
      this.cleanupReport.warnings.forEach(warning => {
        console.log(`   - ${warning.type}: ${warning.message}`);
      });
    }
  }
}

// Exécuter le script si appelé directement
if (require.main === module) {
  const cleanup = new LegacyCodeCleanup();
  cleanup.run().catch(console.error);
}

module.exports = LegacyCodeCleanup;