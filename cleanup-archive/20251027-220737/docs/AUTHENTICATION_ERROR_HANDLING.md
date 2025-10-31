# Gestion Centralisée des Erreurs d'Authentification

Ce document explique comment utiliser le système de traduction centralisé pour gérer les erreurs d'authentification de manière cohérente et traduisible.

## Vue d'ensemble

Le système permet de distinguer précisément les erreurs d'email et de mot de passe, tout en utilisant un système de texte centralisé pour faciliter les futures traductions.

## Architecture

### Côté Serveur

#### Services d'Authentification
- **`server/services/authService.js`** : Service principal d'authentification
- **`server/routes/auth.js`** : Routes d'authentification
- **`server/services/translationService.js`** : Service de traduction côté serveur
- **`server/lang/fr.js`** : Fichier de traduction français côté serveur

#### Messages d'Erreur Disponibles

```javascript
// Messages d'authentification côté serveur
auth: {
  emailRequired: 'L\'adresse email est requise',
  passwordRequired: 'Le mot de passe est requis',
  emailPasswordRequired: 'Email et mot de passe requis',
  invalidEmailFormat: 'Format d\'email invalide',
  passwordTooShort: 'Le mot de passe doit contenir au moins 8 caractères',
  passwordWeak: 'Le mot de passe doit contenir au moins une majuscule, une minuscule, un chiffre et un caractère spécial',
  passwordsNotMatch: 'Les mots de passe ne correspondent pas',
  emailIncorrect: 'Adresse email incorrecte',
  passwordIncorrect: 'Mot de passe incorrect',
  emailOrPasswordIncorrect: 'Email ou mot de passe incorrect',
  accountNotFound: 'Compte inexistant',
  connectionError: 'Erreur de connexion au serveur',
  registrationError: 'Erreur lors de l\'inscription',
  loginError: 'Erreur lors de la connexion',
  tokenInvalid: 'Token invalide ou expiré',
  tokenRefreshInvalid: 'Token de rafraîchissement invalide',
  tokenRequired: 'Token d\'authentification requis',
  userNotFound: 'Utilisateur non trouvé',
  allFieldsRequired: 'Tous les champs sont requis',
  emailAlreadyExists: 'Cette adresse email est déjà utilisée'
}
```

### Côté Client

#### Services et Composants
- **`src/services/authService.js`** : Service d'authentification côté client
- **`src/services/translationService.js`** : Service de traduction côté client
- **`src/lang/fr.js`** et **`src/lang/en.js`** : Fichiers de traduction
- **`src/components/auth/LoginForm.vue`** : Exemple de composant de connexion

## Utilisation

### 1. Dans les Services Côté Serveur

```javascript
const translationService = require('./translationService');

// Exemple d'utilisation dans authService.js
if (userRows.length === 0) {
  throw new Error(translationService.t('auth.accountNotFound'));
}

if (!isValidPassword) {
  throw new Error(translationService.t('auth.passwordIncorrect'));
}
```

### 2. Dans les Routes Côté Serveur

```javascript
const translationService = require('../services/translationService');

// Validation des champs
if (!email || !password) {
  return res.status(400).json({ 
    error: translationService.t('auth.allFieldsRequired'),
    details: { email: !email, password: !password }
  });
}

// Erreurs spécifiques
if (userRows.length === 0) {
  return res.status(401).json({ 
    error: translationService.t('auth.accountNotFound'),
    field: 'email'
  });
}

if (!isValidPassword) {
  return res.status(401).json({ 
    error: translationService.t('auth.passwordIncorrect'),
    field: 'password'
  });
}
```

### 3. Dans les Services Côté Client

```javascript
import translationService from '@/services/translationService';

// Validation côté client
if (!email || !password) {
  throw new Error(translationService.t('auth.emailPasswordRequired'));
}

if (!emailRegex.test(email)) {
  throw new Error(translationService.t('auth.invalidEmailFormat'));
}

if (password.length < 8) {
  throw new Error(translationService.t('auth.passwordTooShort'));
}
```

### 4. Dans les Composants Vue

```vue
<template>
  <div class="form-group">
    <input
      v-model="form.email"
      type="email"
      :class="{ 'error': errors.email }"
      :placeholder="$t('auth.emailRequired')"
    />
    <span v-if="errors.email" class="error-message">
      {{ errors.email }}
    </span>
  </div>
</template>

<script>
import { useTranslation } from '@/composables/useTranslation'

export default {
  setup() {
    const { t } = useTranslation()
    
    const handleLogin = async () => {
      try {
        await authService.login(form.email, form.password)
      } catch (error) {
        // Gestion spécifique des erreurs
        if (error.message.includes(t('auth.accountNotFound'))) {
          errors.email = t('auth.emailIncorrect')
        } else if (error.message.includes(t('auth.passwordIncorrect'))) {
          errors.password = t('auth.passwordIncorrect')
        }
      }
    }
  }
}
</script>
```

## Distinction des Erreurs

### Erreurs Spécifiques par Champ

1. **Erreurs d'Email :**
   - `auth.emailRequired` : Email manquant
   - `auth.invalidEmailFormat` : Format d'email invalide
   - `auth.emailIncorrect` : Email inexistant
   - `auth.accountNotFound` : Compte inexistant

2. **Erreurs de Mot de Passe :**
   - `auth.passwordRequired` : Mot de passe manquant
   - `auth.passwordTooShort` : Mot de passe trop court
   - `auth.passwordWeak` : Mot de passe trop faible
   - `auth.passwordIncorrect` : Mot de passe incorrect

3. **Erreurs Générales :**
   - `auth.emailOrPasswordIncorrect` : Erreur générique (sécurité)
   - `auth.loginError` : Erreur de connexion générale
   - `auth.connectionError` : Erreur de connexion au serveur

## Bonnes Pratiques

### 1. Sécurité
- Utiliser `auth.emailOrPasswordIncorrect` pour les erreurs génériques afin d'éviter l'énumération d'utilisateurs
- Distinguer les erreurs spécifiques uniquement quand c'est sécurisé

### 2. UX/UI
- Afficher les erreurs au niveau du champ concerné quand possible
- Utiliser des messages clairs et actionables
- Prévoir des états de chargement

### 3. Développement
- Toujours utiliser le système de traduction centralisé
- Éviter les messages codés en dur
- Tester les messages dans toutes les langues supportées

### 4. Validation
- Valider côté client ET côté serveur
- Utiliser les mêmes messages d'erreur des deux côtés
- Maintenir la cohérence entre les validations

## Scripts de Validation

### Validation des Traductions
```bash
# Valider la cohérence des traductions
npm run translations:validate

# Générer un rapport détaillé
npm run translations:report
```

### Exemple de Sortie
```
🔍 Validation des traductions...
📁 Fichiers trouvés: en.js, fr.js
✅ 1304 clés trouvées dans en.js
✅ 1304 clés trouvées dans fr.js
🔄 Vérification de la cohérence des clés...
✅ fr.js est cohérent avec en.js
🔍 Validation des interpolations...
✅ Interpolations valides dans en.js
✅ Interpolations valides dans fr.js
✅ Validation réussie - Toutes les traductions sont cohérentes
```

## Ajout de Nouvelles Langues

### 1. Côté Client
1. Créer `src/lang/[code].js` (ex: `es.js` pour l'espagnol)
2. Copier la structure de `fr.js` et traduire les valeurs
3. Mettre à jour `src/services/translationService.js` pour charger la nouvelle langue

### 2. Côté Serveur
1. Créer `server/lang/[code].js`
2. Copier la structure de `server/lang/fr.js` et traduire
3. Mettre à jour `server/services/translationService.js`

### 3. Validation
```bash
# Valider après ajout d'une nouvelle langue
npm run translations:validate
```

## Dépannage

### Erreurs Communes

1. **"Traduction manquante pour la clé: auth.xxx"**
   - Vérifier que la clé existe dans tous les fichiers de langue
   - Exécuter `npm run translations:validate`

2. **"Service de traduction non disponible"**
   - Vérifier l'import du service de traduction
   - S'assurer que le service est correctement initialisé

3. **"Interpolations incohérentes"**
   - Vérifier que les paramètres `{param}` sont identiques dans toutes les langues
   - Utiliser le script de validation pour identifier les incohérences

## Support et Maintenance

- **Fichiers de traduction :** Mis à jour automatiquement lors des validations
- **Scripts de validation :** Exécutés avant chaque déploiement
- **Documentation :** Maintenue à jour avec les nouvelles fonctionnalités

Pour toute question ou problème, consulter la documentation complète du système de traduction dans `TRANSLATION_SYSTEM.md`.