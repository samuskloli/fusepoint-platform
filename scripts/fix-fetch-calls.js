#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Configuration
const PROJECT_ROOT = path.resolve(__dirname, '..');
const SRC_DIR = path.join(PROJECT_ROOT, 'src');
const BACKUP_DIR = path.join(PROJECT_ROOT, 'backup-fetch-fix');

// Patterns à rechercher et remplacer
const FETCH_PATTERNS = [
  {
    // Pattern pour les appels fetch GET avec token
    search: /const\s+(\w+)\s*=\s*await\s+fetch\((['"`])(\/api\/[^'"`)]+)\2,\s*{[^}]*headers:\s*{[^}]*['"`]Authorization['"`]:\s*['"`]Bearer\s*\$\{[^}]*\}['"`][^}]*}[^}]*}\)/g,
    replace: 'const $1 = await authService.getApiInstance().get(\'$3\')'
  },
  {
    // Pattern pour les appels fetch POST avec token
    search: /const\s+(\w+)\s*=\s*await\s+fetch\((['"`])(\/api\/[^'"`)]+)\2,\s*{[^}]*method:\s*['"`]POST['"`][^}]*headers:\s*{[^}]*['"`]Authorization['"`]:\s*['"`]Bearer\s*\$\{[^}]*\}['"`][^}]*}[^}]*body:\s*JSON\.stringify\(([^)]+)\)[^}]*}\)/g,
    replace: 'const $1 = await authService.getApiInstance().post(\'$3\', $4)'
  },
  {
    // Pattern pour les appels fetch PUT avec token
    search: /const\s+(\w+)\s*=\s*await\s+fetch\((['"`])(\/api\/[^'"`)]+)\2,\s*{[^}]*method:\s*['"`]PUT['"`][^}]*headers:\s*{[^}]*['"`]Authorization['"`]:\s*['"`]Bearer\s*\$\{[^}]*\}['"`][^}]*}[^}]*body:\s*JSON\.stringify\(([^)]+)\)[^}]*}\)/g,
    replace: 'const $1 = await authService.getApiInstance().put(\'$3\', $4)'
  },
  {
    // Pattern pour les appels fetch DELETE avec token
    search: /const\s+(\w+)\s*=\s*await\s+fetch\((['"`])(\/api\/[^'"`)]+)\2,\s*{[^}]*method:\s*['"`]DELETE['"`][^}]*headers:\s*{[^}]*['"`]Authorization['"`]:\s*['"`]Bearer\s*\$\{[^}]*\}['"`][^}]*}[^}]*}\)/g,
    replace: 'const $1 = await authService.getApiInstance().delete(\'$3\')'
  }
];

// Patterns pour la gestion des réponses
const RESPONSE_PATTERNS = [
  {
    // Remplacer les vérifications response.ok
    search: /if\s*\(!\s*(\w+)\.ok\)\s*{[^}]*throw\s+new\s+Error\([^)]*\);?\s*}/g,
    replace: '// Response handled by authService'
  },
  {
    // Remplacer response.json() par response.data
    search: /(\w+)\.json\(\)/g,
    replace: '$1.data'
  },
  {
    // Remplacer const data = await response.json(); par direct access
    search: /const\s+(\w+)\s*=\s*await\s+(\w+)\.json\(\);/g,
    replace: 'const $1 = $2.data;'
  }
];

// Patterns pour la gestion des erreurs
const ERROR_PATTERNS = [
  {
    // Ajouter la gestion des erreurs 401
    search: /(} catch \((\w+)\) {)/g,
    replace: '$1\n        if ($2.response?.status === 401) {\n          router.push(\'/login\');\n          return;\n        }'
  }
];

// Fonction pour créer une sauvegarde
function createBackup() {
  console.log('📦 Création de la sauvegarde...');
  
  if (!fs.existsSync(BACKUP_DIR)) {
    fs.mkdirSync(BACKUP_DIR, { recursive: true });
  }
  
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const backupPath = path.join(BACKUP_DIR, `fetch-fix-backup-${timestamp}`);
  
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
        if (!['node_modules', '.git', 'dist', 'build'].includes(item)) {
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

// Fonction pour vérifier si un fichier contient des appels fetch
function containsFetchCalls(content) {
  return /fetch\s*\(\s*['"`]\/api\//.test(content);
}

// Fonction pour ajouter l'import authService si nécessaire
function addAuthServiceImport(content, filePath) {
  // Vérifier si l'import existe déjà
  if (content.includes("import authService from '@/services/authService'")) {
    return content;
  }
  
  // Trouver où insérer l'import
  const lines = content.split('\n');
  let insertIndex = -1;
  
  // Chercher après les autres imports
  for (let i = 0; i < lines.length; i++) {
    if (lines[i].includes('import ') && lines[i].includes('from ')) {
      insertIndex = i + 1;
    }
  }
  
  // Si pas d'imports trouvés, chercher après <script>
  if (insertIndex === -1) {
    for (let i = 0; i < lines.length; i++) {
      if (lines[i].includes('<script>') || lines[i].includes('<script ')) {
        insertIndex = i + 1;
        break;
      }
    }
  }
  
  if (insertIndex !== -1) {
    lines.splice(insertIndex, 0, "import authService from '@/services/authService';");
    return lines.join('\n');
  }
  
  return content;
}

// Fonction pour traiter un fichier
function processFile(filePath) {
  console.log(`🔄 Traitement: ${path.relative(PROJECT_ROOT, filePath)}`);
  
  let content = fs.readFileSync(filePath, 'utf8');
  let modified = false;
  
  // Vérifier si le fichier contient des appels fetch
  if (!containsFetchCalls(content)) {
    console.log(`   ⏭️  Aucun appel fetch trouvé`);
    return false;
  }
  
  // Ajouter l'import authService
  const originalContent = content;
  content = addAuthServiceImport(content, filePath);
  if (content !== originalContent) {
    modified = true;
    console.log(`   ✅ Import authService ajouté`);
  }
  
  // Appliquer les patterns de remplacement pour fetch
  for (const pattern of FETCH_PATTERNS) {
    const matches = content.match(pattern.search);
    if (matches) {
      content = content.replace(pattern.search, pattern.replace);
      modified = true;
      console.log(`   ✅ ${matches.length} appel(s) fetch remplacé(s)`);
    }
  }
  
  // Appliquer les patterns de remplacement pour les réponses
  for (const pattern of RESPONSE_PATTERNS) {
    const matches = content.match(pattern.search);
    if (matches) {
      content = content.replace(pattern.search, pattern.replace);
      modified = true;
      console.log(`   ✅ Gestion des réponses mise à jour`);
    }
  }
  
  // Appliquer les patterns de gestion d'erreurs
  for (const pattern of ERROR_PATTERNS) {
    const matches = content.match(pattern.search);
    if (matches) {
      content = content.replace(pattern.search, pattern.replace);
      modified = true;
      console.log(`   ✅ Gestion des erreurs 401 ajoutée`);
    }
  }
  
  // Sauvegarder le fichier modifié
  if (modified) {
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`   💾 Fichier sauvegardé`);
    return true;
  }
  
  return false;
}

// Fonction principale
function main() {
  console.log('🚀 Démarrage du script de correction des appels fetch\n');
  
  // Créer une sauvegarde
  const backupPath = createBackup();
  
  console.log('\n🔍 Recherche des fichiers à traiter...');
  const files = findFiles(SRC_DIR);
  console.log(`📁 ${files.length} fichiers trouvés\n`);
  
  let processedCount = 0;
  let modifiedCount = 0;
  
  // Traiter chaque fichier
  for (const file of files) {
    try {
      const wasModified = processFile(file);
      processedCount++;
      if (wasModified) {
        modifiedCount++;
      }
    } catch (error) {
      console.error(`❌ Erreur lors du traitement de ${file}:`, error.message);
    }
  }
  
  console.log('\n📊 Résumé:');
  console.log(`   📁 Fichiers traités: ${processedCount}`);
  console.log(`   ✏️  Fichiers modifiés: ${modifiedCount}`);
  console.log(`   💾 Sauvegarde: ${backupPath}`);
  
  if (modifiedCount > 0) {
    console.log('\n✅ Script terminé avec succès!');
    console.log('\n📝 Actions recommandées:');
    console.log('   1. Vérifiez les modifications avec git diff');
    console.log('   2. Testez l\'application');
    console.log('   3. Commitez les changements si tout fonctionne');
  } else {
    console.log('\n✅ Aucune modification nécessaire.');
  }
}

// Exécuter le script
if (require.main === module) {
  main();
}

module.exports = { main, processFile, findFiles };