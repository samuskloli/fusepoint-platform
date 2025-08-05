# 🔍 Outils de Debug et Diagnostic - Fusepoint Platform

## 📋 Vue d'ensemble

Ce dossier contient tous les outils de debug, diagnostic et vérification pour la plateforme Fusepoint.

## 🛠️ Outils Disponibles

### 🔐 **Debug Authentification**

#### `debug-auth.js`
**Fonction** : Script de débogage pour identifier les problèmes de déconnexion automatique

```bash
# Utilisation
node debug/debug-auth.js
```

**Fonctionnalités** :
- Test de connexion utilisateur
- Vérification des tokens JWT
- Simulation de requêtes authentifiées
- Diagnostic des sessions

#### `debug-auth.html`
**Fonction** : Interface web pour tester l'authentification

**Utilisation** :
1. Ouvrir dans un navigateur
2. Tester les formulaires de connexion
3. Vérifier les réponses API

### 👥 **Debug Gestion Clients**

#### `debug-client-assignment.cjs`
**Fonction** : Vérification de l'assignation des clients aux agents

```bash
# Utilisation
node debug/debug-client-assignment.cjs
```

**Vérifications** :
- Structure de la table users
- Assignations agent-client
- Intégrité des relations
- Statistiques d'assignation

#### `debug-clients-endpoint.cjs`
**Fonction** : Test des endpoints API clients

```bash
# Utilisation
node debug/debug-clients-endpoint.cjs
```

**Tests** :
- Endpoint `/api/agent/clients`
- Requêtes SQL de récupération
- Format des données retournées
- Performance des requêtes

### 🔧 **Debug Technique**

#### `debug-syntax.cjs`
**Fonction** : Analyse syntaxique des fichiers Vue.js

```bash
# Utilisation
node debug/debug-syntax.cjs
```

**Analyses** :
- Vérification des accolades
- Validation de la syntaxe JavaScript
- Détection d'erreurs communes
- Rapport de structure

#### `check-agent-clients.cjs`
**Fonction** : Vérification globale agents/clients

```bash
# Utilisation
node debug/check-agent-clients.cjs
```

**Vérifications** :
- Cohérence des données
- Relations agents-clients
- Permissions et accès
- Intégrité référentielle

## 🚀 Utilisation Recommandée

### 🔍 **Diagnostic Rapide**

```bash
# 1. Vérifier l'authentification
node debug/debug-auth.js

# 2. Vérifier les clients
node debug/debug-client-assignment.cjs

# 3. Tester les endpoints
node debug/debug-clients-endpoint.cjs

# 4. Vérifier la syntaxe
node debug/debug-syntax.cjs
```

### 🔧 **Workflow de Debug**

1. **Problème d'authentification** :
   - `debug-auth.js` → `debug-auth.html`

2. **Problème de clients** :
   - `check-agent-clients.cjs` → `debug-client-assignment.cjs`

3. **Problème d'API** :
   - `debug-clients-endpoint.cjs`

4. **Problème de code** :
   - `debug-syntax.cjs`

## 📊 **Interprétation des Résultats**

### ✅ **Résultats Normaux**
- Connexions réussies
- Assignations cohérentes
- Endpoints fonctionnels
- Syntaxe valide

### ⚠️ **Avertissements**
- Assignations manquantes
- Performances lentes
- Données incohérentes

### ❌ **Erreurs Critiques**
- Échecs de connexion
- Erreurs SQL
- Endpoints inaccessibles
- Erreurs de syntaxe

## 🔧 **Dépannage Courant**

### Problème : "Base de données verrouillée"
```bash
# Solution
./fusepoint.sh server stop
# Attendre 5 secondes
./fusepoint.sh server start
```

### Problème : "Endpoint non accessible"
```bash
# Vérifier le serveur
./fusepoint.sh server status

# Redémarrer si nécessaire
./fusepoint.sh server restart
```

### Problème : "Assignations incohérentes"
```bash
# Diagnostic complet
node debug/check-agent-clients.cjs

# Puis correction manuelle si nécessaire
```

## 📝 **Logs et Traces**

Tous les scripts de debug génèrent des logs détaillés :

- **🟢 Succès** : Messages verts avec ✅
- **🟡 Avertissements** : Messages jaunes avec ⚠️
- **🔴 Erreurs** : Messages rouges avec ❌
- **🔵 Informations** : Messages bleus avec ℹ️

## 🔗 **Intégration avec le Système Principal**

### Utilisation via le Script Principal
```bash
# Rapport de santé (inclut certains diagnostics)
./fusepoint.sh maintenance health

# Nettoyage (peut résoudre certains problèmes)
./fusepoint.sh maintenance cleanup
```

### Utilisation Manuelle
```bash
# Accès direct aux outils
cd debug/
node debug-auth.js
node debug-client-assignment.cjs
# etc.
```

## 📚 **Documentation Associée**

- **[../docs/TROUBLESHOOTING_INFOMANIAK.md](../docs/TROUBLESHOOTING_INFOMANIAK.md)** - Guide de dépannage complet
- **[../docs/DEV-WORKFLOW.md](../docs/DEV-WORKFLOW.md)** - Workflow de développement
- **[../docs/ADMIN_COMMANDS.md](../docs/ADMIN_COMMANDS.md)** - Commandes administratives

---

**🔍 Outils de debug maintenus à jour - Dernière révision : 2025-08-04**