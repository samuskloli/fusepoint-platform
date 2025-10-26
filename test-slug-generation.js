const slugService = require('./server/services/slugService');

async function testSlugGeneration() {
  console.log('🧪 Test de génération automatique de slugs\n');

  // Test 1: Génération de slug basique
  console.log('Test 1: Génération de slug basique');
  const slug1 = await slugService.generateUniqueSlug('Mon Premier LinkPoint');
  console.log(`Nom: "Mon Premier LinkPoint" → Slug: "${slug1}"`);

  // Test 2: Génération avec caractères spéciaux
  console.log('\nTest 2: Génération avec caractères spéciaux');
  const slug2 = await slugService.generateUniqueSlug('Café & Restaurant - 50% de réduction!');
  console.log(`Nom: "Café & Restaurant - 50% de réduction!" → Slug: "${slug2}"`);

  // Test 3: Génération avec nom très long
  console.log('\nTest 3: Génération avec nom très long');
  const slug3 = await slugService.generateUniqueSlug('Ceci est un nom de LinkPoint extrêmement long qui devrait être tronqué pour respecter la limite de caractères');
  console.log(`Nom long → Slug: "${slug3}"`);

  // Test 4: Génération de slug pour duplication
  console.log('\nTest 4: Génération de slug pour duplication');
  const duplicateSlug = await slugService.generateDuplicateSlug('mon-premier-linkpoint');
  console.log(`Slug original: "mon-premier-linkpoint" → Slug dupliqué: "${duplicateSlug}"`);

  // Test 5: Test de la fonction sanitizeName
  console.log('\nTest 5: Test de la fonction sanitizeName');
  const sanitized = slugService.sanitizeName('Événement Spécial 2024 - 100% Gratuit!!!');
  console.log(`Nom: "Événement Spécial 2024 - 100% Gratuit!!!" → Sanitized: "${sanitized}"`);

  console.log('\n✅ Tests terminés avec succès!');
}

// Exécuter les tests
testSlugGeneration().catch(console.error);