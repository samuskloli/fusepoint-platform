const fs = require('fs');
const path = require('path');

// Lire le fichier AgentClients.vue
const filePath = path.join(__dirname, 'src/views/AgentClients.vue');
const content = fs.readFileSync(filePath, 'utf8');

// Extraire le contenu du script
const scriptMatch = content.match(/<script[^>]*>([\s\S]*?)<\/script>/);
if (!scriptMatch) {
  console.log('Aucun bloc script trouvé');
  process.exit(1);
}

const scriptContent = scriptMatch[1];
const lines = scriptContent.split('\n');

// Vérifier chaque ligne pour des erreurs de syntaxe communes
console.log('Analyse du fichier AgentClients.vue...');
console.log('Nombre de lignes dans le script:', lines.length);

// Vérifier les accolades
let braceCount = 0;
let parenCount = 0;
let bracketCount = 0;

for (let i = 0; i < lines.length; i++) {
  const line = lines[i];
  const lineNum = i + 1;
  
  // Compter les accolades, parenthèses et crochets
  for (const char of line) {
    if (char === '{') braceCount++;
    if (char === '}') braceCount--;
    if (char === '(') parenCount++;
    if (char === ')') parenCount--;
    if (char === '[') bracketCount++;
    if (char === ']') bracketCount--;
  }
  
  // Vérifier les erreurs communes
  if (line.includes('async (') && !line.includes(') =>')) {
    console.log(`Ligne ${lineNum}: Fonction async potentiellement mal formée: ${line.trim()}`);
  }
  
  if (line.includes('const ') && line.includes('async') && !line.includes('=>')) {
    console.log(`Ligne ${lineNum}: Déclaration async potentiellement mal formée: ${line.trim()}`);
  }
  
  // Vérifier les virgules manquantes
  if (line.trim().endsWith('}') && i < lines.length - 1) {
    const nextLine = lines[i + 1].trim();
    if (nextLine && !nextLine.startsWith('}') && !nextLine.startsWith(')') && !line.includes(',')) {
      console.log(`Ligne ${lineNum}: Virgule potentiellement manquante après: ${line.trim()}`);
    }
  }
}

console.log('\nCompte final:');
console.log('Accolades:', braceCount);
console.log('Parenthèses:', parenCount);
console.log('Crochets:', bracketCount);

if (braceCount !== 0) {
  console.log('ERREUR: Accolades non équilibrées!');
}
if (parenCount !== 0) {
  console.log('ERREUR: Parenthèses non équilibrées!');
}
if (bracketCount !== 0) {
  console.log('ERREUR: Crochets non équilibrés!');
}

console.log('\nAnalyse terminée.');