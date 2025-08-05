# Guide de Migration vers le Système de Traduction

Ce guide explique comment migrer les textes codés en dur vers le nouveau système de traduction centralisé.

## Vue d'ensemble du Système

Le système de traduction comprend :
- **Service de traduction** (`src/services/translationService.js`)
- **Store Pinia** (`src/stores/translation.js`)
- **Composable Vue** (`src/composables/useTranslation.js`)
- **Plugin Vue** (`src/plugins/translation.js`)
- **Composant sélecteur de langue** (`src/components/common/LanguageSelector.vue`)
- **Fichiers de traduction** (`src/lang/fr.js`, `src/lang/en.js`)

## Méthodes d'Utilisation

### 1. Composable `useTranslation` (Recommandé)

```vue
<script setup>
import { useTranslation } from '@/composables/useTranslation'

const { t, tSection, formatDate, setLanguage } = useTranslation()
</script>

<template>
  <h1>{{ t('dashboard.title') }}</h1>
  <p>{{ t('messages.welcome') }}</p>
</template>
```

### 2. Méthodes Globales

```vue
<template>
  <h1>{{ $t('dashboard.title') }}</h1>
  <button @click="$setLanguage('en')">English</button>
</template>
```

### 3. Directives Personnalisées

```vue
<template>
  <!-- Texte du bouton -->
  <button v-t="'actions.save'"></button>
  
  <!-- Placeholder d'input -->
  <input v-t-placeholder="'forms.search'" />
  
  <!-- Titre d'élément -->
  <span v-t-title="'tooltips.help'">?</span>
</template>
```

## Guide de Migration Étape par Étape

### Étape 1 : Identifier les Textes à Migrer

Recherchez dans vos composants :
- Textes entre guillemets dans les templates
- Messages d'erreur codés en dur
- Labels de formulaires
- Titres et descriptions
- Messages de notification

### Étape 2 : Ajouter les Traductions

Ajoutez les nouvelles clés dans `src/lang/fr.js` et `src/lang/en.js` :

```javascript
// src/lang/fr.js
export default {
  // ... existant
  myModule: {
    title: 'Mon Module',
    description: 'Description de mon module',
    actions: {
      create: 'Créer',
      edit: 'Modifier'
    }
  }
}
```

### Étape 3 : Remplacer dans les Composants

#### Avant :
```vue
<template>
  <div>
    <h1>Tableau de Bord</h1>
    <p>Bienvenue sur votre tableau de bord</p>
    <button>Sauvegarder</button>
    <input placeholder="Rechercher un client" />
  </div>
</template>
```

#### Après :
```vue
<template>
  <div>
    <h1>{{ t('dashboard.title') }}</h1>
    <p>{{ t('dashboard.welcome') }}</p>
    <button v-t="'actions.save'"></button>
    <input v-t-placeholder="'clients.search_client'" />
  </div>
</template>

<script setup>
import { useTranslation } from '@/composables/useTranslation'
const { t } = useTranslation()
</script>
```

### Étape 4 : Migrer les Messages Dynamiques

#### Avant :
```javascript
const message = `Erreur : Le mot de passe doit contenir au moins ${minLength} caractères`
```

#### Après :
```javascript
const message = t('validation.min_length', { min: minLength })
```

### Étape 5 : Migrer les Notifications

#### Avant :
```javascript
this.$toast.success('Utilisateur créé avec succès')
this.$toast.error('Erreur lors de la création')
```

#### Après :
```javascript
this.$toast.success(t('messages.createSuccess'))
this.$toast.error(t('messages.createFailed'))
```

## Exemples de Migration par Type

### Navigation
```vue
<!-- Avant -->
<nav>
  <a href="/dashboard">Tableau de Bord</a>
  <a href="/clients">Clients</a>
  <a href="/services">Services</a>
</nav>

<!-- Après -->
<nav>
  <a href="/dashboard" v-t="'navigation.dashboard'"></a>
  <a href="/clients" v-t="'navigation.clients'"></a>
  <a href="/services" v-t="'navigation.services'"></a>
</nav>
```

### Formulaires
```vue
<!-- Avant -->
<form>
  <label>Nom :</label>
  <input type="text" placeholder="Entrez votre nom" />
  <label>Email :</label>
  <input type="email" placeholder="Entrez votre email" />
  <button type="submit">Envoyer</button>
</form>

<!-- Après -->
<form>
  <label v-t="'forms.name'"></label>
  <input type="text" v-t-placeholder="'forms.enter_name'" />
  <label v-t="'forms.email'"></label>
  <input type="email" v-t-placeholder="'forms.enter_email'" />
  <button type="submit" v-t="'actions.submit'"></button>
</form>
```

### Messages d'État
```vue
<!-- Avant -->
<div class="status">
  <span v-if="status === 'loading'">Chargement...</span>
  <span v-else-if="status === 'success'">Succès</span>
  <span v-else-if="status === 'error'">Erreur</span>
</div>

<!-- Après -->
<div class="status">
  <span v-if="status === 'loading'">{{ t('status.loading') }}</span>
  <span v-else-if="status === 'success'">{{ t('status.success') }}</span>
  <span v-else-if="status === 'error'">{{ t('status.error') }}</span>
</div>
```

### Tableaux
```vue
<!-- Avant -->
<table>
  <thead>
    <tr>
      <th>Nom</th>
      <th>Email</th>
      <th>Statut</th>
      <th>Actions</th>
    </tr>
  </thead>
</table>

<!-- Après -->
<table>
  <thead>
    <tr>
      <th v-t="'forms.name'"></th>
      <th v-t="'forms.email'"></th>
      <th v-t="'forms.status'"></th>
      <th v-t="'forms.actions'"></th>
    </tr>
  </thead>
</table>
```

## Bonnes Pratiques

### 1. Organisation des Clés
- Utilisez une hiérarchie logique : `module.section.element`
- Groupez par fonctionnalité : `clients.add_client`, `clients.edit_client`
- Utilisez des noms descriptifs : `validation.email` plutôt que `val.em`

### 2. Interpolation
```javascript
// Bon
t('messages.welcome_user', { name: user.name })

// Évitez
`Bienvenue ${user.name}`
```

### 3. Pluralisation
```javascript
// Préparez pour la pluralisation future
{
  items: {
    one: '{count} élément',
    other: '{count} éléments'
  }
}
```

### 4. Valeurs par Défaut
```javascript
// Utilisez des valeurs par défaut pour les clés manquantes
t('unknown.key', {}, 'Texte par défaut')
```

## Vérification de la Migration

### 1. Recherche de Textes Restants
```bash
# Rechercher les textes français codés en dur
grep -r "['\"].*[àâäéèêëïîôöùûüÿç].*['\"]" src/

# Rechercher les patterns courants
grep -r "placeholder=\"[^{]" src/
grep -r ">.*[A-Za-z].*<" src/
```

### 2. Test des Langues
- Testez le changement de langue
- Vérifiez que tous les textes sont traduits
- Testez l'interpolation des variables

### 3. Validation
- Aucun texte codé en dur ne doit rester
- Toutes les clés doivent exister dans tous les fichiers de langue
- Les interpolations doivent fonctionner correctement

## Ajout de Nouvelles Langues

1. Créez un nouveau fichier : `src/lang/es.js` (pour l'espagnol)
2. Copiez la structure de `fr.js`
3. Traduisez toutes les valeurs
4. Ajoutez la langue dans `translationService.js` :

```javascript
const availableLanguages = [
  { code: 'fr', name: 'Français', flag: '🇫🇷' },
  { code: 'en', name: 'English', flag: '🇺🇸' },
  { code: 'es', name: 'Español', flag: '🇪🇸' }
]
```

## Dépannage

### Clé de Traduction Manquante
- Vérifiez l'orthographe de la clé
- Assurez-vous que la clé existe dans le fichier de langue
- Utilisez `tExists('key')` pour vérifier l'existence

### Interpolation qui ne Fonctionne Pas
- Vérifiez la syntaxe : `{variable}`
- Assurez-vous de passer l'objet de paramètres
- Vérifiez que les noms de variables correspondent

### Performance
- Les traductions sont mises en cache
- Évitez les appels répétés dans les boucles
- Utilisez `tSection()` pour les groupes de traductions

## Ressources

- **Exemple complet** : `src/components/examples/TranslationExample.vue`
- **Service principal** : `src/services/translationService.js`
- **Composable** : `src/composables/useTranslation.js`
- **Fichiers de langue** : `src/lang/`

Ce système permet une internationalisation complète de l'application tout en maintenant une structure claire et maintenable.