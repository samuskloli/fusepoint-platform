// Script pour nettoyer le cache frontend des widgets
// À exécuter dans la console du navigateur (F12)

console.log('🧹 NETTOYAGE DU CACHE FRONTEND DES WIDGETS');
console.log('==========================================\n');

// 1. Nettoyer les données spécifiques aux widgets dans localStorage
const widgetKeys = [
  'widgetFavorites',
  'installedWidgets',
  'currencyHistory'
];

// Nettoyer les clés de stores Pinia liées aux widgets
const piniaKeys = Object.keys(localStorage).filter(key => 
  key.startsWith('fusepoint_store_') && 
  (key.includes('widget') || key.includes('dashboard') || key.includes('project'))
);

// Nettoyer les paramètres de dashboard par projet
const dashboardKeys = Object.keys(localStorage).filter(key => 
  key.startsWith('dashboard-settings-')
);

console.log('🔍 Clés trouvées à nettoyer:');
console.log('- Widgets:', widgetKeys.filter(key => localStorage.getItem(key)));
console.log('- Pinia stores:', piniaKeys);
console.log('- Dashboard settings:', dashboardKeys);

// Supprimer les clés identifiées
let cleanedCount = 0;

[...widgetKeys, ...piniaKeys, ...dashboardKeys].forEach(key => {
  if (localStorage.getItem(key)) {
    localStorage.removeItem(key);
    cleanedCount++;
    console.log(`✅ Supprimé: ${key}`);
  }
});

// 2. Nettoyer sessionStorage
const sessionKeys = Object.keys(sessionStorage).filter(key => 
  key.includes('widget') || key.includes('dashboard') || key.includes('project')
);

sessionKeys.forEach(key => {
  sessionStorage.removeItem(key);
  cleanedCount++;
  console.log(`✅ Supprimé (session): ${key}`);
});

// 3. Nettoyer le cache des requêtes API
if ('caches' in window) {
  caches.keys().then(function(names) {
    names.forEach(name => {
      if (name.includes('widget') || name.includes('api')) {
        caches.delete(name);
        console.log(`✅ Cache API supprimé: ${name}`);
      }
    });
  }).catch(error => {
    console.error('❌ Erreur lors du nettoyage du cache API:', error);
  });
}

console.log(`\n📊 Résumé: ${cleanedCount} éléments supprimés du cache`);
console.log('🔄 Rechargez la page pour appliquer les changements');

// 4. Optionnel: Recharger automatiquement la page
if (confirm('Voulez-vous recharger la page maintenant pour appliquer les changements ?')) {
  window.location.reload();
}