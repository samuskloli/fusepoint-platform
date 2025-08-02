# Fusepoint - Plateforme Marketing SaaS

## 🎯 Description

Fusepoint est une plateforme SaaS complète qui centralise toutes les stratégies marketing et les données de performance (Google Analytics, Facebook, Instagram, etc.). Cette version Alpha inclut un backend Node.js complet avec base de données, authentification, et APIs fonctionnelles.

## 📋 Version Actuelle: **Alpha 1.0.0**

> 🔄 **Dernière mise à jour**: $(date +"%Y-%m-%d")  
> 📦 **Sauvegarde**: fusepoint-platform-backup-alpha  
> 📊 **Statut**: Version Alpha en développement actif

## ✨ Fonctionnalités Actuelles

### 👤 Fonctionnalités Utilisateur
- ✅ **Système IA Chat** - API fonctionnelle (en débogage)
- ✅ **Dashboard personnalisé** - Interface responsive
- ✅ **Authentification complète** - JWT + OAuth (Facebook, Instagram)
- ✅ **Intégrations sociales** - Facebook, Instagram APIs
- ✅ **Gestion projets clients** - Suivi et organisation
- ✅ **Système notifications** - Notifications de base (à optimiser)
- ✅ **Mon Suivi Fusepoint** - Intégration écosystème (à améliorer)

### 🎯 Fonctionnalités Agent
- ✅ **Dashboard agent** - Interface de gestion (responsive à revoir)
- ✅ **Gestion clients** - Attribution et suivi des clients
- ✅ **Système rapports** - Génération de rapports
- ✅ **Chat clients** - Communication directe
- ✅ **Invitation prestataires** - Système d'invitation
- ✅ **Gestion demandes** - Traitement des demandes de service
- 🔧 **Chat interne** - Communication agent ↔ prestataire (à déboguer)

### ⚡ Fonctionnalités Super Admin
- ✅ **Gestion utilisateurs** - Administration complète
- ✅ **Configuration SMTP** - Paramètres email
- ✅ **Paramètres plateforme** - Configuration système
- 🔧 **Système logs** - Affichage défaillant (priorité haute)
- 🔧 **Dashboard admin** - Interface à revoir
- 🔧 **Thème interface** - Design à améliorer

## 🛠️ Stack Technique

### Frontend
- **Vue.js 3** - Framework JavaScript progressif
- **Vue Router 4** - Routage côté client
- **Tailwind CSS** - Framework CSS utilitaire
- **Vite** - Outil de build rapide
- **Heroicons** - Icônes SVG

### Backend
- **Node.js** - Runtime JavaScript
- **Express.js** - Framework web
- **SQLite** - Base de données avec migrations
- **JWT** - Authentification par tokens
- **OAuth** - Intégration réseaux sociaux
- **Nodemailer** - Service email SMTP

## 🚀 Installation et lancement

### Prérequis
- Node.js (version 16 ou supérieure)
- npm ou yarn

### Installation complète
```bash
# Cloner le projet
cd fusepoint-platform

# Installer les dépendances frontend
npm install

# Installer les dépendances backend
cd server
npm install

# Initialiser la base de données
node scripts/initDatabase.js

# Retourner au dossier racine
cd ..
```

### Lancement des serveurs
```bash
# Option 1: Lancer tous les serveurs automatiquement
./start-all-servers.sh

# Option 2: Lancer manuellement
# Terminal 1 - Backend (Port 3002)
cd server && npm start

# Terminal 2 - Frontend (Port 5173)
npm run dev
```

**URLs d'accès:**
- Frontend: `http://localhost:5173/`
- Backend API: `http://localhost:3002/`

### Build pour la production
```bash
npm run build
./deploy-production.sh
```

## 📁 Structure du projet

```
src/
├── components/          # Composants réutilisables
│   ├── Header.vue      # En-tête avec navigation utilisateur
│   └── Sidebar.vue     # Barre latérale de navigation
├── views/              # Pages principales
│   ├── Login.vue       # Page de connexion
│   ├── Dashboard.vue   # Tableau de bord principal
│   └── Settings.vue    # Page de paramètres
├── router/             # Configuration du routage
│   └── index.js        # Routes et guards
├── App.vue             # Composant racine
├── main.js             # Point d'entrée de l'application
└── style.css           # Styles globaux avec Tailwind
```

## 🎨 Design System

### Couleurs principales
- **Primary** : Bleu (#3b82f6)
- **Success** : Vert (#10b981)
- **Warning** : Jaune (#f59e0b)
- **Danger** : Rouge (#ef4444)
- **Gray** : Nuances de gris pour le texte et les arrière-plans

### Composants UI
- Cartes avec ombres subtiles
- Boutons avec états hover et focus
- Formulaires avec validation visuelle
- Modales pour les actions critiques
- Badges de statut pour les connexions API

## 🔐 Authentification (Mock)

Pour tester l'application :
- **Email** : n'importe quelle adresse email valide
- **Mot de passe** : n'importe quel mot de passe

L'authentification est simulée et stocke les informations dans le localStorage.

## 📱 Responsive Breakpoints

- **Mobile** : < 768px
- **Tablette** : 768px - 1024px
- **Desktop** : > 1024px

## 🐛 Bugs Connus (Priorité de correction)

### Utilisateur
- 🔧 **Chat IA**: Nécessite débogage d'affichage
- 🔧 **Notifications**: Système à optimiser
- 🔧 **Mon Suivi Fusepoint**: Intégration sous-optimale

### Agent
- 🔧 **Dashboard responsive**: Affichage mobile à corriger
- 🔧 **Chat interne**: Communication agent-prestataire défaillante

### Super Admin
- 🔧 **Logs**: Affichage complètement défaillant (PRIORITÉ HAUTE)
- 🔧 **Dashboard**: Interface utilisateur à revoir
- 🔧 **Thème**: Design général à améliorer

## 🔮 Roadmap - Fusepoint Hub

### 📋 Fonctionnalités Utilisateur Prévues
- **Centralisation plateformes**: Gestion liens et mots de passe sécurisés
- **Stockage documents**: Système de gestion documentaire
- **Notifications Push**: Système temps réel
- **Notifications email**: Diversification des alertes
- **Système réseautage**: Fonctionnalités de mise en réseau
- **Chat interne amélioré**: Communication optimisée agent ↔ prestataire

### 🎯 Fonctionnalités Agent Prévues
- **Gestion avancée prestataires**: Outils d'invitation et suivi
- **Analytics enrichies**: Tableaux de bord avancés
- **Automatisation**: Workflows automatisés

### ⚡ Fonctionnalités Super Admin Prévues
- **Sécurité avancée**: Permissions granulaires
- **Monitoring système**: Surveillance avancée
- **Customisation**: Thèmes et personnalisation interface

## 📊 Informations Version

- **Version**: Alpha 1.0.0
- **Statut**: Développement actif
- **Sauvegarde**: fusepoint-platform-backup-alpha
- **Logs système**: `/logs/system.log`
- **Documentation**: `VERSION.md` et `CHANGELOG.md`

## 🔍 Fichiers de Documentation

- `VERSION.md` - Informations détaillées de version
- `CHANGELOG.md` - Historique des modifications
- `logs/system.log` - Logs système et état des fonctionnalités

## 📄 Licence

Ce projet est la plateforme Fusepoint en version Alpha.
