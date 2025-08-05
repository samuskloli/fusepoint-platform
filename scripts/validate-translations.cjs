#!/usr/bin/env node

/**
 * Script de validation des traductions
 * Vérifie la cohérence entre les fichiers de langue
 */

const fs = require('fs')
const path = require('path')

// Couleurs pour la console
const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m'
}

// Fonction pour coloriser le texte
const colorize = (text, color) => `${colors[color]}${text}${colors.reset}`

// Fonction pour extraire toutes les clés d'un objet de traduction
function extractKeys(obj, prefix = '') {
  let keys = []
  
  for (const key in obj) {
    if (obj.hasOwnProperty(key)) {
      const fullKey = prefix ? `${prefix}.${key}` : key
      
      if (typeof obj[key] === 'object' && obj[key] !== null && !Array.isArray(obj[key])) {
        // Récursion pour les objets imbriqués
        keys = keys.concat(extractKeys(obj[key], fullKey))
      } else {
        // Clé finale
        keys.push(fullKey)
      }
    }
  }
  
  return keys
}

// Fonction pour charger un fichier de traduction ES6
function loadTranslationFile(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf8')
    
    // Extraire l'objet exporté du fichier ES6
    // Supprimer les commentaires et l'export default
    let cleanContent = content
      .replace(/\/\*[\s\S]*?\*\//g, '') // Supprimer les commentaires /* */
      .replace(/\/\/.*$/gm, '') // Supprimer les commentaires //
      .replace(/export\s+default\s+/, '') // Supprimer export default
      .trim()
    
    // Si le contenu se termine par un point-virgule, le supprimer
    if (cleanContent.endsWith(';')) {
      cleanContent = cleanContent.slice(0, -1)
    }
    
    // Évaluer l'objet JavaScript
    const translations = eval(`(${cleanContent})`)
    
    return translations
  } catch (error) {
    console.error(colorize(`Erreur lors du chargement de ${filePath}:`, 'red'), error.message)
    return null
  }
}

// Fonction pour valider les interpolations
function validateInterpolations(translations, language) {
  const issues = []
  
  function checkValue(value, key) {
    if (typeof value === 'string') {
      // Vérifier les interpolations {variable}
      const interpolations = value.match(/\{([^}]+)\}/g)
      if (interpolations) {
        interpolations.forEach(interpolation => {
          const variable = interpolation.slice(1, -1)
          if (!/^[a-zA-Z_][a-zA-Z0-9_]*$/.test(variable)) {
            issues.push({
              key,
              issue: `Variable d'interpolation invalide: ${interpolation}`,
              value
            })
          }
        })
      }
      
      // Vérifier les caractères spéciaux non échappés
      if (value.includes('\n') && !value.includes('\\n')) {
        issues.push({
          key,
          issue: 'Retour à la ligne non échappé détecté',
          value
        })
      }
    }
  }
  
  function traverse(obj, prefix = '') {
    for (const key in obj) {
      if (obj.hasOwnProperty(key)) {
        const fullKey = prefix ? `${prefix}.${key}` : key
        
        if (typeof obj[key] === 'object' && obj[key] !== null) {
          traverse(obj[key], fullKey)
        } else {
          checkValue(obj[key], fullKey)
        }
      }
    }
  }
  
  traverse(translations)
  return issues
}

// Fonction pour comparer les interpolations entre langues
function compareInterpolations(translations1, translations2, lang1, lang2) {
  const issues = []
  
  function getInterpolations(text) {
    const matches = text.match(/\{([^}]+)\}/g)
    return matches ? matches.map(m => m.slice(1, -1)).sort() : []
  }
  
  function compareValues(obj1, obj2, prefix = '') {
    for (const key in obj1) {
      if (obj1.hasOwnProperty(key)) {
        const fullKey = prefix ? `${prefix}.${key}` : key
        
        if (typeof obj1[key] === 'object' && obj1[key] !== null) {
          if (obj2[key] && typeof obj2[key] === 'object') {
            compareValues(obj1[key], obj2[key], fullKey)
          }
        } else if (typeof obj1[key] === 'string' && typeof obj2[key] === 'string') {
          const interp1 = getInterpolations(obj1[key])
          const interp2 = getInterpolations(obj2[key])
          
          if (JSON.stringify(interp1) !== JSON.stringify(interp2)) {
            issues.push({
              key: fullKey,
              issue: `Interpolations différentes entre ${lang1} et ${lang2}`,
              [lang1]: interp1,
              [lang2]: interp2
            })
          }
        }
      }
    }
  }
  
  compareValues(translations1, translations2)
  return issues
}

// Fonction principale de validation
function validateTranslations() {
  console.log(colorize('🔍 Validation des traductions...\n', 'cyan'))
  
  const langDir = path.join(__dirname, '..', 'src', 'lang')
  const files = fs.readdirSync(langDir).filter(file => 
    file.endsWith('.js') && 
    file !== 'README.md' && 
    !file.includes('.temp.') &&
    !file.startsWith('.')
  )
  
  if (files.length === 0) {
    console.log(colorize('❌ Aucun fichier de traduction trouvé', 'red'))
    return false
  }
  
  console.log(colorize(`📁 Fichiers trouvés: ${files.join(', ')}\n`, 'blue'))
  
  // Charger tous les fichiers de traduction
  const translations = {}
  const allKeys = {}
  
  for (const file of files) {
    const lang = path.basename(file, '.js')
    const filePath = path.join(langDir, file)
    
    console.log(colorize(`📖 Chargement de ${file}...`, 'yellow'))
    
    const content = loadTranslationFile(filePath)
    if (!content) {
      console.log(colorize(`❌ Impossible de charger ${file}`, 'red'))
      return false
    }
    
    translations[lang] = content
    allKeys[lang] = extractKeys(content).sort()
    
    console.log(colorize(`✅ ${allKeys[lang].length} clés trouvées dans ${file}`, 'green'))
  }
  
  console.log()
  
  // Vérifier la cohérence des clés
  let hasErrors = false
  const languages = Object.keys(translations)
  
  if (languages.length > 1) {
    console.log(colorize('🔄 Vérification de la cohérence des clés...', 'cyan'))
    
    const referenceLang = languages[0]
    const referenceKeys = allKeys[referenceLang]
    
    for (let i = 1; i < languages.length; i++) {
      const currentLang = languages[i]
      const currentKeys = allKeys[currentLang]
      
      const missingInCurrent = referenceKeys.filter(key => !currentKeys.includes(key))
      const extraInCurrent = currentKeys.filter(key => !referenceKeys.includes(key))
      
      if (missingInCurrent.length > 0) {
        console.log(colorize(`❌ Clés manquantes dans ${currentLang}.js:`, 'red'))
        missingInCurrent.forEach(key => {
          console.log(colorize(`   - ${key}`, 'red'))
        })
        hasErrors = true
      }
      
      if (extraInCurrent.length > 0) {
        console.log(colorize(`⚠️  Clés supplémentaires dans ${currentLang}.js:`, 'yellow'))
        extraInCurrent.forEach(key => {
          console.log(colorize(`   + ${key}`, 'yellow'))
        })
      }
      
      if (missingInCurrent.length === 0 && extraInCurrent.length === 0) {
        console.log(colorize(`✅ ${currentLang}.js est cohérent avec ${referenceLang}.js`, 'green'))
      }
    }
  }
  
  console.log()
  
  // Valider les interpolations
  console.log(colorize('🔍 Validation des interpolations...', 'cyan'))
  
  for (const lang of languages) {
    const issues = validateInterpolations(translations[lang], lang)
    
    if (issues.length > 0) {
      console.log(colorize(`❌ Problèmes d'interpolation dans ${lang}.js:`, 'red'))
      issues.forEach(issue => {
        console.log(colorize(`   - ${issue.key}: ${issue.issue}`, 'red'))
        if (issue.value) {
          console.log(colorize(`     Valeur: "${issue.value}"`, 'magenta'))
        }
      })
      hasErrors = true
    } else {
      console.log(colorize(`✅ Interpolations valides dans ${lang}.js`, 'green'))
    }
  }
  
  // Comparer les interpolations entre langues
  if (languages.length > 1) {
    console.log()
    console.log(colorize('🔄 Comparaison des interpolations entre langues...', 'cyan'))
    
    for (let i = 0; i < languages.length - 1; i++) {
      for (let j = i + 1; j < languages.length; j++) {
        const lang1 = languages[i]
        const lang2 = languages[j]
        
        const issues = compareInterpolations(
          translations[lang1], 
          translations[lang2], 
          lang1, 
          lang2
        )
        
        if (issues.length > 0) {
          console.log(colorize(`❌ Incohérences d'interpolation entre ${lang1} et ${lang2}:`, 'red'))
          issues.forEach(issue => {
            console.log(colorize(`   - ${issue.key}:`, 'red'))
            console.log(colorize(`     ${lang1}: [${issue[lang1].join(', ')}]`, 'magenta'))
            console.log(colorize(`     ${lang2}: [${issue[lang2].join(', ')}]`, 'magenta'))
          })
          hasErrors = true
        } else {
          console.log(colorize(`✅ Interpolations cohérentes entre ${lang1} et ${lang2}`, 'green'))
        }
      }
    }
  }
  
  console.log()
  
  // Statistiques finales
  console.log(colorize('📊 Statistiques:', 'cyan'))
  for (const lang of languages) {
    console.log(colorize(`   ${lang}: ${allKeys[lang].length} clés`, 'blue'))
  }
  
  console.log()
  
  if (hasErrors) {
    console.log(colorize('❌ Validation échouée - Des erreurs ont été trouvées', 'red'))
    return false
  } else {
    console.log(colorize('✅ Validation réussie - Toutes les traductions sont cohérentes', 'green'))
    return true
  }
}

// Fonction pour générer un rapport détaillé
function generateReport() {
  console.log(colorize('📋 Génération du rapport détaillé...\n', 'cyan'))
  
  const langDir = path.join(__dirname, '..', 'src', 'lang')
  const files = fs.readdirSync(langDir).filter(file => 
    file.endsWith('.js') && 
    file !== 'README.md' && 
    !file.includes('.temp.') &&
    !file.startsWith('.')
  )
  
  const report = {
    timestamp: new Date().toISOString(),
    languages: {},
    summary: {
      totalLanguages: files.length,
      totalKeys: 0,
      commonKeys: 0,
      issues: []
    }
  }
  
  // Analyser chaque fichier
  for (const file of files) {
    const lang = path.basename(file, '.js')
    const filePath = path.join(langDir, file)
    const translations = loadTranslationFile(filePath)
    
    if (translations) {
      const keys = extractKeys(translations)
      report.languages[lang] = {
        file,
        keyCount: keys.length,
        keys: keys.sort()
      }
    }
  }
  
  // Calculer les statistiques
  const allLanguageKeys = Object.values(report.languages).map(lang => lang.keys)
  if (allLanguageKeys.length > 0) {
    report.summary.totalKeys = Math.max(...allLanguageKeys.map(keys => keys.length))
    
    // Trouver les clés communes
    if (allLanguageKeys.length > 1) {
      report.summary.commonKeys = allLanguageKeys.reduce((common, keys) => 
        common.filter(key => keys.includes(key))
      ).length
    } else {
      report.summary.commonKeys = allLanguageKeys[0].length
    }
  }
  
  // Sauvegarder le rapport
  const reportPath = path.join(__dirname, '..', 'translation-report.json')
  fs.writeFileSync(reportPath, JSON.stringify(report, null, 2))
  
  console.log(colorize(`📄 Rapport sauvegardé dans: ${reportPath}`, 'green'))
  
  return report
}

// Exécution du script
if (require.main === module) {
  const args = process.argv.slice(2)
  
  if (args.includes('--report')) {
    generateReport()
  } else {
    const isValid = validateTranslations()
    process.exit(isValid ? 0 : 1)
  }
}

module.exports = {
  validateTranslations,
  generateReport,
  extractKeys,
  loadTranslationFile
}