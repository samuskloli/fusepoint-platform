# Système de Traduction - Documentation

Ce dossier contient les fichiers de traduction pour l'internationalisation de l'application.

## Structure

```
src/lang/
├── README.md          # Cette documentation
├── fr.js             # Traductions françaises (langue par défaut)
└── en.js             # Traductions anglaises
```

## Utilisation

### Dans les Composants Vue

```vue
<template>
  <div>
    <!-- Méthode recommandée avec composable -->
    <h1>{{ t('dashboard.title') }}</h1>
    
    <!-- Méthodes globales -->
    <p>{{ $t('dashboard.welcome') }}</p>
    
    <!-- Directives personnalisées -->
    <button v-t="'actions.save'"></button>
    <input v-t-placeholder="'forms.search'" />
  </div>
</template>

<script setup>
import { useTranslation } from '@/composables/useTranslation'
const { t } = useTranslation()
</script>
```

### Interpolation de Variables

```javascript
// Dans le fichier de traduction
{
  welcome_message: 'Bonjour {name}, vous avez {count} messages'
}

// Dans le composant
t('welcome_message', { name: 'John', count: 5 })
// Résultat : "Bonjour John, vous avez 5 messages"
```

### Sections Spécifiques

```javascript
// Récupérer une section complète
const clientsSection = tSection('clients')
console.log(clientsSection.title) // "Clients"
console.log(clientsSection.add_client) // "Ajouter un Client"
```

## Organisation des Clés

### Hiérarchie Recommandée

```javascript
{
  // Navigation principale
  navigation: {
    dashboard: 'Tableau de Bord',
    clients: 'Clients',
    services: 'Services'
  },
  
  // Actions communes
  actions: {
    save: 'Sauvegarder',
    cancel: 'Annuler',
    delete: 'Supprimer'
  },
  
  // Formulaires
  forms: {
    name: 'Nom',
    email: 'Email',
    password: 'Mot de passe'
  },
  
  // Messages et notifications
  messages: {
    success: 'Opération réussie',
    error: 'Une erreur est survenue'
  },
  
  // Modules spécifiques
  clients: {
    title: 'Gestion des Clients',
    add_client: 'Ajouter un Client',
    edit_client: 'Modifier le Client'
  }
}
```

### Conventions de Nommage

- **Modules** : `clients`, `services`, `dashboard`
- **Sections** : `navigation`, `actions`, `forms`, `messages`
- **Clés** : `snake_case` pour les clés composées
- **Hiérarchie** : Maximum 3 niveaux de profondeur

## Ajout de Nouvelles Traductions

### 1. Ajouter dans le Fichier Français (fr.js)

```javascript
export default {
  // ... existant
  nouveauModule: {
    titre: 'Nouveau Module',
    description: 'Description du nouveau module',
    actions: {
      creer: 'Créer',
      modifier: 'Modifier'
    }
  }
}
```

### 2. Ajouter dans le Fichier Anglais (en.js)

```javascript
export default {
  // ... existant
  nouveauModule: {
    titre: 'New Module',
    description: 'New module description',
    actions: {
      creer: 'Create',
      modifier: 'Edit'
    }
  }
}
```

### 3. Utiliser dans les Composants

```vue
<template>
  <div>
    <h1>{{ t('nouveauModule.titre') }}</h1>
    <p>{{ t('nouveauModule.description') }}</p>
    <button v-t="'nouveauModule.actions.creer'"></button>
  </div>
</template>
```

## Ajout d'une Nouvelle Langue

### 1. Créer le Fichier de Traduction

Créez `es.js` pour l'espagnol :

```javascript
/**
 * Spanish translations for the user interface
 */
export default {
  navigation: {
    dashboard: 'Panel de Control',
    clients: 'Clientes',
    services: 'Servicios'
  },
  // ... toutes les autres traductions
}
```

### 2. Enregistrer la Langue

Dans `src/services/translationService.js` :

```javascript
const availableLanguages = [
  { code: 'fr', name: 'Français', flag: '🇫🇷' },
  { code: 'en', name: 'English', flag: '🇺🇸' },
  { code: 'es', name: 'Español', flag: '🇪🇸' } // Nouvelle langue
]
```

### 3. Importer le Fichier

Dans `src/services/translationService.js` :

```javascript
const loadTranslations = async (language) => {
  try {
    let translations
    switch (language) {
      case 'en':
        translations = (await import('@/lang/en.js')).default
        break
      case 'es': // Nouveau cas
        translations = (await import('@/lang/es.js')).default
        break
      case 'fr':
      default:
        translations = (await import('@/lang/fr.js')).default
    }
    return translations
  } catch (error) {
    console.error(`Erreur lors du chargement des traductions pour ${language}:`, error)
    return {}
  }
}
```

## Validation et Tests

### Vérifier la Cohérence

```bash
# Vérifier que toutes les clés existent dans tous les fichiers
node scripts/validate-translations.js
```

### Script de Validation (à créer)

```javascript
// scripts/validate-translations.js
const fr = require('../src/lang/fr.js').default
const en = require('../src/lang/en.js').default

function getKeys(obj, prefix = '') {
  let keys = []
  for (const key in obj) {
    const fullKey = prefix ? `${prefix}.${key}` : key
    if (typeof obj[key] === 'object' && obj[key] !== null) {
      keys = keys.concat(getKeys(obj[key], fullKey))
    } else {
      keys.push(fullKey)
    }
  }
  return keys
}

const frKeys = getKeys(fr).sort()
const enKeys = getKeys(en).sort()

const missingInEn = frKeys.filter(key => !enKeys.includes(key))
const missingInFr = enKeys.filter(key => !frKeys.includes(key))

if (missingInEn.length > 0) {
  console.error('Clés manquantes dans en.js:', missingInEn)
}

if (missingInFr.length > 0) {
  console.error('Clés manquantes dans fr.js:', missingInFr)
}

if (missingInEn.length === 0 && missingInFr.length === 0) {
  console.log('✅ Toutes les traductions sont cohérentes')
}
```

## Bonnes Pratiques

### 1. Cohérence
- Maintenez la même structure dans tous les fichiers de langue
- Utilisez des conventions de nommage cohérentes
- Gardez les clés en anglais ou dans une langue neutre

### 2. Contexte
- Ajoutez des commentaires pour les traductions ambiguës
- Groupez les traductions par contexte d'utilisation
- Évitez les traductions trop génériques

### 3. Maintenance
- Supprimez les clés inutilisées régulièrement
- Documentez les changements importants
- Testez les traductions dans différents contextes

### 4. Performance
- Les traductions sont chargées de manière asynchrone
- Évitez les traductions trop longues
- Utilisez l'interpolation plutôt que la concaténation

## Dépannage

### Clé Non Trouvée
```javascript
// Vérifier si une clé existe
if (tExists('ma.cle')) {
  console.log(t('ma.cle'))
} else {
  console.log('Clé non trouvée')
}
```

### Traduction Manquante
```javascript
// Utiliser une valeur par défaut
t('cle.inexistante', {}, 'Valeur par défaut')
```

### Debug
```javascript
// Activer le mode debug dans translationService.js
const DEBUG = true

// Afficher toutes les traductions chargées
console.log('Traductions chargées:', getCurrentTranslations())
```

## Ressources

- **Service principal** : `src/services/translationService.js`
- **Store Pinia** : `src/stores/translation.js`
- **Composable** : `src/composables/useTranslation.js`
- **Plugin Vue** : `src/plugins/translation.js`
- **Composant sélecteur** : `src/components/common/LanguageSelector.vue`
- **Exemple d'utilisation** : `src/components/examples/TranslationExample.vue`
- **Guide de migration** : `TRANSLATION_MIGRATION_GUIDE.md`