# Système de Traduction - Fusepoint Platform

## Vue d'ensemble

Ce document présente le système de traduction complet implémenté pour la plateforme Fusepoint. Le système permet une gestion centralisée des traductions avec support multilingue, validation automatique et outils de développement.

## Architecture

### Structure des fichiers

```
src/
├── lang/                          # Fichiers de traduction
│   ├── fr.js                      # Traductions françaises
│   ├── en.js                      # Traductions anglaises
│   └── README.md                  # Documentation des traductions
├── services/
│   └── translationService.js     # Service de traduction côté client
├── stores/
│   └── translation.js            # Store Pinia pour l'état des traductions
├── composables/
│   └── useTranslation.js         # Composable Vue pour les traductions
├── components/common/
│   └── LanguageSelector.vue      # Composant sélecteur de langue
├── plugins/
│   └── translation.js            # Plugin Vue pour l'enregistrement global
└── examples/
    └── TranslationExample.vue     # Exemple d'utilisation

scripts/
└── validate-translations.cjs     # Script de validation des traductions

server/
├── lang/
│   └── fr.js                      # Traductions côté serveur
└── services/
    └── translationService.js      # Service de traduction côté serveur
```

## Fonctionnalités

### 1. Service de Traduction (`translationService.js`)

- **Gestion des langues** : Support multilingue avec français par défaut
- **Chargement dynamique** : Chargement asynchrone des fichiers de traduction
- **Interpolation** : Support des variables dans les traductions `{variable}`
- **Valeurs imbriquées** : Accès aux traductions via notation pointée `section.key`
- **Fallback** : Retour automatique vers la langue par défaut

### 2. Store Pinia (`translation.js`)

- **État réactif** : Gestion de la langue courante et des traductions
- **Actions** : Méthodes pour changer de langue et récupérer les traductions
- **Getters** : Accès calculé aux informations de langue
- **Gestion d'erreurs** : Suivi des erreurs de chargement

### 3. Composable Vue (`useTranslation.js`)

- **Fonction `t()`** : Traduction de base avec interpolation
- **Sections spécialisées** : `tNav()`, `tActions()`, `tStatus()`, etc.
- **Formatage** : Dates, nombres et devises localisés
- **Utilitaires** : Gestion de la langue et informations de statut

### 4. Plugin Vue (`translation.js`)

- **Méthodes globales** : `$t`, `$tSection`, `$setLanguage`, etc.
- **Directives personnalisées** :
  - `v-t="'key'"` : Traduction du contenu textuel
  - `v-t-placeholder="'key'"` : Traduction du placeholder
  - `v-t-title="'key'"` : Traduction du titre

### 5. Composant Sélecteur de Langue (`LanguageSelector.vue`)

- **Variantes d'affichage** : dropdown, boutons, compact
- **Personnalisable** : Classes CSS et styles configurables
- **Notifications** : Feedback utilisateur lors du changement

## Utilisation

### Dans un composant Vue

```vue
<template>
  <div>
    <!-- Méthode composable -->
    <h1>{{ t('dashboard.title') }}</h1>
    
    <!-- Directive personnalisée -->
    <p v-t="'dashboard.welcome'"></p>
    
    <!-- Avec interpolation -->
    <span>{{ t('messages.welcome', { name: userName }) }}</span>
    
    <!-- Méthode globale -->
    <button>{{ $t('actions.save') }}</button>
    
    <!-- Sélecteur de langue -->
    <LanguageSelector variant="dropdown" />
  </div>
</template>

<script setup>
import { useTranslation } from '@/composables/useTranslation'
import LanguageSelector from '@/components/common/LanguageSelector.vue'

const { t } = useTranslation()
const userName = 'John'
</script>
```

### Ajout de nouvelles traductions

1. **Ajouter dans `src/lang/fr.js`** :
```javascript
export default {
  // ... traductions existantes
  nouveauModule: {
    titre: 'Nouveau Module',
    description: 'Description du module avec {variable}'
  }
}
```

2. **Ajouter dans `src/lang/en.js`** :
```javascript
export default {
  // ... existing translations
  nouveauModule: {
    titre: 'New Module',
    description: 'Module description with {variable}'
  }
}
```

3. **Valider les traductions** :
```bash
npm run translations:validate
```

## Scripts de Validation

### Commandes disponibles

```bash
# Validation des traductions
npm run translations:validate

# Génération d'un rapport détaillé
npm run translations:report

# Alias de validation
npm run translations:check
```

### Fonctionnalités de validation

- **Cohérence des clés** : Vérification que toutes les langues ont les mêmes clés
- **Validation des interpolations** : Contrôle des variables `{variable}`
- **Comparaison entre langues** : Vérification de la cohérence des interpolations
- **Rapport détaillé** : Génération d'un fichier JSON avec statistiques

## Bonnes Pratiques

### 1. Organisation des clés

```javascript
// ✅ Bon : Organisation hiérarchique claire
export default {
  navigation: {
    home: 'Accueil',
    about: 'À propos'
  },
  actions: {
    save: 'Enregistrer',
    cancel: 'Annuler'
  }
}

// ❌ Mauvais : Clés plates sans organisation
export default {
  navigationHome: 'Accueil',
  navigationAbout: 'À propos',
  actionsSave: 'Enregistrer'
}
```

### 2. Interpolation

```javascript
// ✅ Bon : Variables claires
'Bonjour {userName}, vous avez {count} messages'

// ❌ Mauvais : Variables peu claires
'Bonjour {0}, vous avez {1} messages'
```

### 3. Nommage des clés

```javascript
// ✅ Bon : Noms descriptifs
export default {
  forms: {
    validation: {
      required: 'Ce champ est requis',
      email: 'Format email invalide'
    }
  }
}

// ❌ Mauvais : Noms génériques
export default {
  error1: 'Ce champ est requis',
  error2: 'Format email invalide'
}
```

## Migration

Pour migrer du texte codé en dur vers le système de traduction :

1. **Identifier le texte** à traduire
2. **Créer une clé** appropriée dans les fichiers de langue
3. **Remplacer le texte** par l'appel de traduction
4. **Valider** avec `npm run translations:validate`

Voir `TRANSLATION_MIGRATION_GUIDE.md` pour un guide détaillé.

## Dépannage

### Erreurs courantes

1. **Clé manquante** :
   - Vérifier que la clé existe dans tous les fichiers de langue
   - Utiliser `npm run translations:validate` pour détecter les incohérences

2. **Interpolation échouée** :
   - Vérifier que les variables sont passées correctement
   - S'assurer que les noms de variables correspondent

3. **Langue non chargée** :
   - Vérifier que le fichier de langue existe
   - Contrôler les erreurs dans la console du navigateur

### Debug

```javascript
// Activer le mode debug dans le service
const translationService = new TranslationService({
  defaultLanguage: 'fr',
  debug: true // Affiche les logs de debug
})
```

## Contribution

Pour contribuer au système de traduction :

1. **Ajouter de nouvelles langues** : Créer un nouveau fichier dans `src/lang/`
2. **Améliorer les traductions** : Modifier les fichiers existants
3. **Valider les changements** : Exécuter `npm run translations:validate`
4. **Tester** : Utiliser le composant d'exemple pour vérifier

## Support

Le système supporte :

- ✅ Vue 3 avec Composition API
- ✅ Pinia pour la gestion d'état
- ✅ Interpolation de variables
- ✅ Chargement asynchrone
- ✅ Validation automatique
- ✅ Directives personnalisées
- ✅ Formatage localisé
- ✅ Fallback automatique

---

*Dernière mise à jour : Janvier 2025*