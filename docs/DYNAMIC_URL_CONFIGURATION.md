# Configuration Dynamique des URLs - Fusepoint Platform

## 🎯 Problème Résolu

Le lien de réinitialisation de mot de passe pointait vers une URL fixe `https://fusepoint.ch/reset-password?token=...` même en développement local. Cette configuration est maintenant **entièrement dynamique** et s'adapte automatiquement à l'environnement.

## 🔧 Comment ça Fonctionne

### Ordre de Priorité pour l'URL Frontend

Le système détermine l'URL frontend selon cet ordre de priorité :

1. **Paramètres de Plateforme** (Base de données)
   - Clé : `frontend_url`
   - Configurable via l'interface Super Admin
   - Priorité la plus haute

2. **Variable d'Environnement**
   - `FRONTEND_URL` dans le fichier `.env`
   - Fallback si pas de paramètre en base

3. **Détection Automatique**
   - Développement : `http://localhost:5173`
   - Production : Erreur si non configuré

### Code Responsable

```javascript
// server/services/emailService.js
async getFrontendUrl() {
  // 1. Cache
  if (this.frontendUrl) {
    return this.frontendUrl;
  }

  // 2. Paramètres de plateforme (base de données)
  try {
    if (this.platformSettingsService) {
      const setting = await this.platformSettingsService.getSetting('frontend_url');
      if (setting && setting.value) {
        this.frontendUrl = setting.value;
        return this.frontendUrl;
      }
    }
  } catch (error) {
    console.warn('⚠️ Impossible de récupérer frontend_url depuis la base de données');
  }

  // 3. Variable d'environnement
  if (process.env.FRONTEND_URL) {
    this.frontendUrl = process.env.FRONTEND_URL;
    return this.frontendUrl;
  }
  
  // 4. Détection automatique
  if (process.env.NODE_ENV === 'production') {
    throw new Error('FRONTEND_URL requis en production');
  }
  
  this.frontendUrl = 'http://localhost:5173';
  return this.frontendUrl;
}
```

## ⚙️ Configuration par Environnement

### 🔧 Développement Local

**Fichier `.env` (racine du projet) :**
```env
# URLs locales
FRONTEND_URL=http://localhost:5173
BASE_URL=http://localhost:5173
API_BASE_URL=http://localhost:3003/api
```

**Résultat :** Les emails de réinitialisation pointent vers `http://localhost:5173/reset-password?token=...`

### 🚀 Production

**Option 1 : Via les Paramètres de Plateforme (Recommandé)**
1. Connectez-vous en tant que Super Admin
2. Allez dans "Paramètres de Plateforme"
3. Modifiez le paramètre `frontend_url`
4. Valeur : `https://fusepoint.ch` ou votre domaine de production

**Option 2 : Via Variable d'Environnement**
```env
FRONTEND_URL=https://fusepoint.ch
NODE_ENV=production
```

## 🛡️ Sécurité en Production

### Validation Automatique

Le système valide automatiquement qu'aucune URL `localhost` n'est utilisée en production :

```javascript
async validateProductionUrls() {
  if (process.env.NODE_ENV === 'production') {
    const frontendUrl = await this.getFrontendUrl();
    const baseUrl = await this.getBaseUrl();
    const urls = [frontendUrl, baseUrl];
    
    urls.forEach(url => {
      if (url && url.includes('localhost')) {
        throw new Error(`URL localhost non autorisée en production : ${url}`);
      }
    });
  }
}
```

### Initialisation Automatique

Le paramètre `frontend_url` est automatiquement créé au démarrage :

```javascript
// server/services/platformSettingsService.js
async initializeDefaultSettings() {
  await this.createSettingIfNotExists(
    'frontend_url',
    'https://fusepoint.ch',
    'url',
    'general',
    'URL de production de la plateforme'
  );
}
```

## 📋 Guide de Configuration

### Pour le Développement

1. **Vérifiez votre fichier `.env`** :
   ```bash
   cat .env | grep FRONTEND_URL
   ```

2. **Devrait afficher** :
   ```
   FRONTEND_URL=http://localhost:5173
   ```

3. **Testez un email de réinitialisation** :
   - L'URL dans l'email devrait être `http://localhost:5173/reset-password?token=...`

### Pour la Production

1. **Via l'Interface Super Admin** (Recommandé) :
   - Connectez-vous en tant que Super Admin
   - Paramètres → Paramètres de Plateforme
   - Modifiez `frontend_url` → `https://votre-domaine.com`

2. **Via Variable d'Environnement** :
   ```env
   FRONTEND_URL=https://votre-domaine.com
   NODE_ENV=production
   ```

3. **Vérification** :
   ```bash
   # Les logs devraient afficher :
   # ✅ URL frontend chargée depuis les paramètres de plateforme: https://votre-domaine.com
   ```

## 🔍 Débogage

### Vérifier l'URL Utilisée

Les logs du serveur affichent l'URL chargée :

```
✅ URL frontend chargée depuis les paramètres de plateforme: https://fusepoint.ch
```

ou

```
✅ URL frontend chargée depuis les variables d'environnement: http://localhost:5173
```

## 🔍 Débogage
### Problèmes Courants

1. **Email pointe vers localhost en production** :
   - Vérifiez que `frontend_url` est configuré dans les paramètres de plateforme
   - Ou que `FRONTEND_URL` est défini dans `.env`

2. **Email pointe vers production en développement** :
   - Utilisez le script de gestion : `node manage-urls.cjs development`
   - Ou mettez à jour manuellement le paramètre `frontend_url` en base de données
   - Redémarrez le serveur après modification

3. **Erreur "FRONTEND_URL requis en production"** :
   - Configurez `frontend_url` via l'interface Super Admin
   - Ou ajoutez `FRONTEND_URL` dans votre fichier `.env` de production

4. **URL incorrecte** :
   - Vérifiez l'ordre de priorité (paramètres de plateforme > variable d'environnement)
   - Redémarrez le serveur après modification

## 🛠️ Script de Gestion des URLs

Un script `manage-urls.cjs` est disponible pour basculer facilement entre les environnements :

```bash
# Configuration pour développement local
node manage-urls.cjs development

# Configuration pour production
node manage-urls.cjs production
```

Ce script met à jour :
- Le paramètre `frontend_url` en base de données
- Les variables d'environnement dans `.env`
- Affiche un résumé des changements

### Important
- **Redémarrez toujours le serveur** après avoir changé la configuration
- Le cache des URLs est vidé au redémarrage
- Vérifiez que les emails pointent vers la bonne URL après le changement

## ✅ Avantages de cette Solution

1. **Dynamique** : S'adapte automatiquement à l'environnement
2. **Configurable** : Modifiable via l'interface admin sans redémarrage
3. **Sécurisé** : Validation automatique en production
4. **Fallback** : Plusieurs niveaux de configuration
5. **Maintenable** : Configuration centralisée

## 🎯 Résultat Final

- **Développement** : `http://localhost:5173/reset-password?token=...`
- **Production** : `https://fusepoint.ch/reset-password?token=...`
- **Staging** : `https://staging.fusepoint.ch/reset-password?token=...`

Le système s'adapte automatiquement selon la configuration, garantissant que les liens d'email fonctionnent correctement dans tous les environnements.