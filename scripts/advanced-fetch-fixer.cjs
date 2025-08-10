#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Configuration
const PROJECT_ROOT = path.resolve(__dirname, '..');
const SRC_DIR = path.join(PROJECT_ROOT, 'src');
const BACKUP_DIR = path.join(PROJECT_ROOT, 'backup-fetch-fix');

// Classe pour gérer les transformations de code
class FetchTransformer {
  constructor() {
    this.stats = {
      filesProcessed: 0,
      filesModified: 0,
      fetchCallsReplaced: 0,
      importsAdded: 0,
      errorHandlersAdded: 0
    };
  }

  // Détecter les appels fetch vers /api/
  detectFetchCalls(content) {
    const patterns = [
      // fetch('/api/...', { ... })
      /fetch\s*\(\s*['"`]\/api\/[^'"`)]+['"`]\s*,\s*\{[^}]*\}/g,
      // fetch(`/api/...`, { ... })
      /fetch\s*\(\s*`\/api\/[^`]+`\s*,\s*\{[^}]*\}/g,
      // fetch('/api/...')
      /fetch\s*\(\s*['"`]\/api\/[^'"`)]+['"`]\s*\)/g
    ];
    
    return patterns.some(pattern => pattern.test(content));
  }

  // Ajouter l'import authService
  addAuthServiceImport(content) {
    // Vérifier si l'import existe déjà
    if (content.includes("import authService from '@/services/authService'") ||
        content.includes('import authService from "@/services/authService"')) {
      return { content, added: false };
    }

    const lines = content.split('\n');
    let insertIndex = -1;
    let lastImportIndex = -1;

    // Trouver le dernier import
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();
      if (line.startsWith('import ') && line.includes(' from ')) {
        lastImportIndex = i;
      }
    }

    if (lastImportIndex !== -1) {
      insertIndex = lastImportIndex + 1;
    } else {
      // Chercher après <script> ou <script setup>
      for (let i = 0; i < lines.length; i++) {
        if (lines[i].includes('<script') && lines[i].includes('>')) {
          insertIndex = i + 1;
          break;
        }
      }
    }

    if (insertIndex !== -1) {
      lines.splice(insertIndex, 0, "import authService from '@/services/authService'");
      return { content: lines.join('\n'), added: true };
    }

    return { content, added: false };
  }

  // Transformer les appels fetch GET
  transformGetCalls(content) {
    let modified = false;
    let count = 0;

    // Pattern pour GET avec headers Authorization
    const getPatterns = [
      {
        // const response = await fetch('/api/...', { headers: { 'Authorization': `Bearer ${token}` } })
        regex: /(const\s+\w+\s*=\s*await\s+)fetch\s*\(\s*(['"`])(\/api\/[^'"`)]+)\2\s*,\s*\{[^}]*headers\s*:\s*\{[^}]*['"`]Authorization['"`]\s*:[^}]*\}[^}]*\}\s*\)/g,
        replacement: '$1authService.getApiInstance().get(\'$3\')'
      },
      {
        // fetch('/api/...', { headers: { Authorization: ... } })
        regex: /fetch\s*\(\s*(['"`])(\/api\/[^'"`)]+)\1\s*,\s*\{[^}]*headers\s*:\s*\{[^}]*Authorization[^}]*\}[^}]*\}\s*\)/g,
        replacement: 'authService.getApiInstance().get(\'$2\')'
      }
    ];

    for (const pattern of getPatterns) {
      const matches = content.match(pattern.regex);
      if (matches) {
        content = content.replace(pattern.regex, pattern.replacement);
        modified = true;
        count += matches.length;
      }
    }

    return { content, modified, count };
  }

  // Transformer les appels fetch POST
  transformPostCalls(content) {
    let modified = false;
    let count = 0;

    const postPatterns = [
      {
        // const response = await fetch('/api/...', { method: 'POST', headers: {...}, body: JSON.stringify(data) })
        regex: /(const\s+\w+\s*=\s*await\s+)fetch\s*\(\s*(['"`])(\/api\/[^'"`)]+)\2\s*,\s*\{[^}]*method\s*:\s*['"`]POST['"`][^}]*body\s*:\s*JSON\.stringify\s*\(([^)]+)\)[^}]*\}\s*\)/g,
        replacement: '$1authService.getApiInstance().post(\'$3\', $4)'
      },
      {
        // Plus simple: fetch avec POST et body
        regex: /fetch\s*\(\s*(['"`])(\/api\/[^'"`)]+)\1\s*,\s*\{[^}]*method\s*:\s*['"`]POST['"`][^}]*body\s*:\s*JSON\.stringify\s*\(([^)]+)\)[^}]*\}\s*\)/g,
        replacement: 'authService.getApiInstance().post(\'$2\', $3)'
      }
    ];

    for (const pattern of postPatterns) {
      const matches = content.match(pattern.regex);
      if (matches) {
        content = content.replace(pattern.regex, pattern.replacement);
        modified = true;
        count += matches.length;
      }
    }

    return { content, modified, count };
  }

  // Transformer les appels fetch PUT
  transformPutCalls(content) {
    let modified = false;
    let count = 0;

    const putPatterns = [
      {
        regex: /(const\s+\w+\s*=\s*await\s+)fetch\s*\(\s*(['"`])(\/api\/[^'"`)]+)\2\s*,\s*\{[^}]*method\s*:\s*['"`]PUT['"`][^}]*body\s*:\s*JSON\.stringify\s*\(([^)]+)\)[^}]*\}\s*\)/g,
        replacement: '$1authService.getApiInstance().put(\'$3\', $4)'
      }
    ];

    for (const pattern of putPatterns) {
      const matches = content.match(pattern.regex);
      if (matches) {
        content = content.replace(pattern.regex, pattern.replacement);
        modified = true;
        count += matches.length;
      }
    }

    return { content, modified, count };
  }

  // Transformer les appels fetch DELETE
  transformDeleteCalls(content) {
    let modified = false;
    let count = 0;

    const deletePatterns = [
      {
        regex: /(const\s+\w+\s*=\s*await\s+)fetch\s*\(\s*(['"`])(\/api\/[^'"`)]+)\2\s*,\s*\{[^}]*method\s*:\s*['"`]DELETE['"`][^}]*\}\s*\)/g,
        replacement: '$1authService.getApiInstance().delete(\'$3\')'
      }
    ];

    for (const pattern of deletePatterns) {
      const matches = content.match(pattern.regex);
      if (matches) {
        content = content.replace(pattern.regex, pattern.replacement);
        modified = true;
        count += matches.length;
      }
    }

    return { content, modified, count };
  }

  // Nettoyer les vérifications response.ok
  cleanResponseChecks(content) {
    let modified = false;

    const patterns = [
      {
        // if (!response.ok) { throw new Error(...) }
        regex: /\s*if\s*\(\s*!\s*\w+\.ok\s*\)\s*\{[^}]*throw\s+new\s+Error\([^)]*\);?\s*\}/g,
        replacement: ''
      },
      {
        // const data = await response.json()
        regex: /(const\s+\w+\s*=\s*await\s+)(\w+)\.json\(\)/g,
        replacement: '$1$2.data'
      },
      {
        // response.json()
        regex: /(\w+)\.json\(\)/g,
        replacement: '$1.data'
      }
    ];

    for (const pattern of patterns) {
      if (pattern.regex.test(content)) {
        content = content.replace(pattern.regex, pattern.replacement);
        modified = true;
      }
    }

    return { content, modified };
  }

  // Ajouter la gestion des erreurs 401
  addErrorHandling(content) {
    let modified = false;
    let count = 0;

    // Chercher les blocs catch qui n'ont pas déjà la gestion 401
    const catchPattern = /(\}\s*catch\s*\(\s*\w+\s*\)\s*\{)([^}]*(?:\{[^}]*\}[^}]*)*)/g;
    
    content = content.replace(catchPattern, (match, catchStart, catchBody) => {
      // Vérifier si la gestion 401 existe déjà
      if (catchBody.includes('401') || catchBody.includes('response?.status')) {
        return match;
      }

      // Ajouter la gestion 401
      const errorVar = match.match(/catch\s*\(\s*(\w+)\s*\)/)?.[1] || 'error';
      const newCatchBody = `
        if (${errorVar}.response?.status === 401) {
          router.push('/login');
          return;
        }${catchBody}`;
      
      modified = true;
      count++;
      return catchStart + newCatchBody;
    });

    return { content, modified, count };
  }

  // Traiter un fichier complet
  processFile(filePath) {
    console.log(`🔄 Traitement: ${path.relative(PROJECT_ROOT, filePath)}`);
    
    let content = fs.readFileSync(filePath, 'utf8');
    let fileModified = false;
    const changes = [];

    // Vérifier si le fichier contient des appels fetch
    if (!this.detectFetchCalls(content)) {
      console.log(`   ⏭️  Aucun appel fetch trouvé`);
      this.stats.filesProcessed++;
      return false;
    }

    // Ajouter l'import authService
    const importResult = this.addAuthServiceImport(content);
    content = importResult.content;
    if (importResult.added) {
      fileModified = true;
      changes.push('Import authService ajouté');
      this.stats.importsAdded++;
    }

    // Transformer les appels GET
    const getResult = this.transformGetCalls(content);
    content = getResult.content;
    if (getResult.modified) {
      fileModified = true;
      changes.push(`${getResult.count} appel(s) GET transformé(s)`);
      this.stats.fetchCallsReplaced += getResult.count;
    }

    // Transformer les appels POST
    const postResult = this.transformPostCalls(content);
    content = postResult.content;
    if (postResult.modified) {
      fileModified = true;
      changes.push(`${postResult.count} appel(s) POST transformé(s)`);
      this.stats.fetchCallsReplaced += postResult.count;
    }

    // Transformer les appels PUT
    const putResult = this.transformPutCalls(content);
    content = putResult.content;
    if (putResult.modified) {
      fileModified = true;
      changes.push(`${putResult.count} appel(s) PUT transformé(s)`);
      this.stats.fetchCallsReplaced += putResult.count;
    }

    // Transformer les appels DELETE
    const deleteResult = this.transformDeleteCalls(content);
    content = deleteResult.content;
    if (deleteResult.modified) {
      fileModified = true;
      changes.push(`${deleteResult.count} appel(s) DELETE transformé(s)`);
      this.stats.fetchCallsReplaced += deleteResult.count;
    }

    // Nettoyer les vérifications de réponse
    const cleanResult = this.cleanResponseChecks(content);
    content = cleanResult.content;
    if (cleanResult.modified) {
      fileModified = true;
      changes.push('Vérifications response.ok nettoyées');
    }

    // Ajouter la gestion des erreurs 401
    const errorResult = this.addErrorHandling(content);
    content = errorResult.content;
    if (errorResult.modified) {
      fileModified = true;
      changes.push(`${errorResult.count} gestionnaire(s) d'erreur 401 ajouté(s)`);
      this.stats.errorHandlersAdded += errorResult.count;
    }

    // Sauvegarder le fichier modifié
    if (fileModified) {
      fs.writeFileSync(filePath, content, 'utf8');
      this.stats.filesModified++;
      console.log(`   ✅ ${changes.join(', ')}`);
    }

    this.stats.filesProcessed++;
    return fileModified;
  }
}

// Fonction pour créer une sauvegarde
function createBackup() {
  console.log('📦 Création de la sauvegarde...');
  
  if (!fs.existsSync(BACKUP_DIR)) {
    fs.mkdirSync(BACKUP_DIR, { recursive: true });
  }
  
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const backupPath = path.join(BACKUP_DIR, `advanced-fetch-fix-${timestamp}`);
  
  try {
    execSync(`cp -r "${SRC_DIR}" "${backupPath}"`, { stdio: 'inherit' });
    console.log(`✅ Sauvegarde créée: ${backupPath}`);
    return backupPath;
  } catch (error) {
    console.error('❌ Erreur lors de la création de la sauvegarde:', error.message);
    process.exit(1);
  }
}

// Fonction pour trouver tous les fichiers Vue et JS
function findFiles(dir, extensions = ['.vue', '.js', '.ts']) {
  const files = [];
  
  function scanDir(currentDir) {
    const items = fs.readdirSync(currentDir);
    
    for (const item of items) {
      const fullPath = path.join(currentDir, item);
      const stat = fs.statSync(fullPath);
      
      if (stat.isDirectory()) {
        // Ignorer node_modules et autres dossiers
        if (!['node_modules', '.git', 'dist', 'build', 'backup-fetch-fix'].includes(item)) {
          scanDir(fullPath);
        }
      } else if (extensions.some(ext => item.endsWith(ext))) {
        files.push(fullPath);
      }
    }
  }
  
  scanDir(dir);
  return files;
}

// Fonction principale
function main() {
  console.log('🚀 Démarrage du script avancé de correction des appels fetch\n');
  
  // Créer une sauvegarde
  const backupPath = createBackup();
  
  console.log('\n🔍 Recherche des fichiers à traiter...');
  const files = findFiles(SRC_DIR);
  console.log(`📁 ${files.length} fichiers trouvés\n`);
  
  const transformer = new FetchTransformer();
  
  // Traiter chaque fichier
  for (const file of files) {
    try {
      transformer.processFile(file);
    } catch (error) {
      console.error(`❌ Erreur lors du traitement de ${file}:`, error.message);
    }
  }
  
  console.log('\n📊 Résumé des transformations:');
  console.log(`   📁 Fichiers traités: ${transformer.stats.filesProcessed}`);
  console.log(`   ✏️  Fichiers modifiés: ${transformer.stats.filesModified}`);
  console.log(`   🔄 Appels fetch remplacés: ${transformer.stats.fetchCallsReplaced}`);
  console.log(`   📦 Imports ajoutés: ${transformer.stats.importsAdded}`);
  console.log(`   🛡️  Gestionnaires d'erreur ajoutés: ${transformer.stats.errorHandlersAdded}`);
  console.log(`   💾 Sauvegarde: ${backupPath}`);
  
  if (transformer.stats.filesModified > 0) {
    console.log('\n✅ Script terminé avec succès!');
    console.log('\n📝 Actions recommandées:');
    console.log('   1. Vérifiez les modifications avec git diff');
    console.log('   2. Testez l\'application');
    console.log('   3. Commitez les changements si tout fonctionne');
    console.log('   4. Supprimez la sauvegarde si tout est OK');
  } else {
    console.log('\n✅ Aucune modification nécessaire.');
  }
}

// Exécuter le script
if (require.main === module) {
  main();
}

module.exports = { main, FetchTransformer, findFiles };