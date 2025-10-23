# Guide de Configuration des Environnements

## 🎯 Objectif

Ce guide garantit une configuration robuste et fiable entre les environnements de développement, test et production, évitant les problèmes de ports codés en dur et assurant la portabilité de l'application.

## 📋 Structure Actuelle

### Variables d'Environnement Utilisées

#### Frontend (Vite)
- `VITE_API_URL` : URL de l'API backend
- `VITE_BASE_URL` : URL de base de l'application
- `VITE_NODE_ENV` : Environnement d'exécution

#### Backend (Node.js)
- `PORT` : Port du serveur backend
- `DATABASE_URL` : URL de la base de données
- `JWT_SECRET` : Clé secrète pour JWT
- `FRONTEND_URL` : URL du frontend pour CORS

## 🔧 Configuration par Environnement

### Développement Local

#### Frontend (.env)
```env
VITE_API_URL=http://localhost:3002
VITE_BASE_URL=http://localhost:5173
VITE_NODE_ENV=development
```

#### Backend (server/.env)
```env
PORT=3002
FRONTEND_URL=http://localhost:5173
NODE_ENV=development
```

### Production

#### Frontend (.env.production)
```env
VITE_API_URL=https://beta.fusepoint.ch/api
VITE_BASE_URL=https://beta.fusepoint.ch
VITE_NODE_ENV=production
```

#### Backend (.env.production)
```env
PORT=8080
FRONTEND_URL=https://beta.fusepoint.ch
NODE_ENV=production
```

## ✅ Bonnes Pratiques Implémentées

### 1. Pas de Valeurs Codées en Dur

**✅ Correct :**
```javascript
// chatAPI.js
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

// api.js
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3000',
});
```

**❌ À éviter :**
```javascript
// Valeur codée en dur - problématique en production
const API_BASE_URL = 'http://localhost:3002/api';
```

### 2. Fallbacks Appropriés

Chaque variable d'environnement a une valeur par défaut appropriée pour le développement :

```javascript
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3002/api';
```

### 3. Configuration Vite Proxy

```javascript
// vite.config.js
export default defineConfig({
  server: {
    proxy: {
      '/api': {
        target: process.env.VITE_API_URL || 'http://localhost:3002',
        changeOrigin: true,
        secure: false
      }
    }
  }
});
```

## 🚀 Déploiement Sécurisé

### Checklist Pré-Déploiement

- [ ] Variables d'environnement configurées pour la production
- [ ] Pas de `localhost` dans les URLs de production
- [ ] Secrets et clés API sécurisés
- [ ] CORS configuré correctement
- [ ] Tests de connectivité API effectués

### Script de Validation

```bash
#!/bin/bash
# validate-env.sh

echo "🔍 Validation de la configuration d'environnement..."

# Vérifier que VITE_API_URL ne contient pas localhost en production
if [[ "$NODE_ENV" == "production" && "$VITE_API_URL" == *"localhost"* ]]; then
  echo "❌ ERREUR: VITE_API_URL contient 'localhost' en production"
  exit 1
fi

# Vérifier que les variables critiques sont définies
if [[ -z "$VITE_API_URL" ]]; then
  echo "❌ ERREUR: VITE_API_URL n'est pas définie"
  exit 1
fi

echo "✅ Configuration validée avec succès"
```

## 🔒 Sécurité

### Variables Sensibles

**Ne jamais commiter :**
- Clés API
- Mots de passe de base de données
- Secrets JWT
- Tokens OAuth

**Utiliser des services de gestion de secrets :**
- Variables d'environnement du serveur
- Services cloud (AWS Secrets Manager, etc.)
- Outils CI/CD sécurisés

### Fichiers .env

```gitignore
# .gitignore
.env
.env.local
.env.production
.env.*.local
```

## 🧪 Tests de Configuration

### Test de Connectivité API

```javascript
// tests/api-connectivity.test.js
import { chatAPI } from '../src/services/chatAPI.js';

describe('API Connectivity', () => {
  test('should connect to correct API URL', () => {
    const expectedURL = process.env.VITE_API_URL || 'http://localhost:3002/api';
    expect(chatAPI.baseURL).toBe(expectedURL);
  });

  test('should not use hardcoded localhost in production', () => {
    if (process.env.NODE_ENV === 'production') {
      expect(process.env.VITE_API_URL).not.toContain('localhost');
    }
  });
});
```

## 📊 Monitoring

### Logs de Configuration

```javascript
// Ajouter en mode développement
if (import.meta.env.DEV) {
  console.log('🔧 Configuration API:', {
    baseURL: import.meta.env.VITE_API_URL,
    environment: import.meta.env.MODE
  });
}
```

### Health Check

```javascript
// services/healthCheck.js
export const checkAPIHealth = async () => {
  try {
    const response = await fetch(`${import.meta.env.VITE_API_URL}/health`);
    return response.ok;
  } catch (error) {
    console.error('❌ API Health Check Failed:', error);
    return false;
  }
};
```

## 🔄 Migration et Mise à Jour

### Changement d'URL API

1. **Mettre à jour les variables d'environnement**
2. **Tester en local**
3. **Déployer en staging**
4. **Valider les tests**
5. **Déployer en production**

### Rollback

En cas de problème :
1. Revenir aux anciennes variables d'environnement
2. Redéployer
3. Vérifier la connectivité

## 📝 Conclusion

Cette configuration garantit :
- ✅ **Flexibilité** : Changement d'environnement sans modification de code
- ✅ **Sécurité** : Pas de secrets dans le code
- ✅ **Fiabilité** : Configuration testée et validée
- ✅ **Maintenabilité** : Configuration centralisée et documentée

Votre préoccupation était justifiée, mais l'implémentation actuelle utilise bien les variables d'environnement, ce qui assure la portabilité entre les environnements.


## Templates par défaut (backend)

- `DISABLE_DEFAULT_TEMPLATES` permet de désactiver l’insertion automatique des modèles standards lors de l’initialisation de la base MariaDB.
- À définir dans `server/.env` ou `server/.env.mariadb`.

Exemple:
```env
DISABLE_DEFAULT_TEMPLATES=1
```

Effet:
- Les tables liées aux templates sont créées normalement.
- Les `INSERT` vers `project_templates` et `project_template_widgets` du fichier `server/database/project_templates_schema.sql` sont ignorés.
- Les widgets de base restent insérés pour l’écosystème.

Remarques:
- Si des templates standards existent déjà, ils ne sont pas supprimés automatiquement.
- Vous pouvez les désactiver (`is_active=0`) ou les supprimer via l’interface ou en SQL:

```sql
UPDATE project_templates SET is_active = 0 WHERE name = 'Template Standard';
```