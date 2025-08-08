<div align="center">

![Fusepoint Logo](./public/fusepoint-logo.svg)

# 🚀 Fusepoint Platform
## Plateforme Marketing Intelligente

[![Version](https://img.shields.io/badge/Version-Alpha%201.1.0-blue?style=for-the-badge)](./docs/CHANGELOG.md)
[![Status](https://img.shields.io/badge/Status-Production%20Ready-success?style=for-the-badge)](#)
[![License](https://img.shields.io/badge/License-Propriétaire-red?style=for-the-badge)](#)
[![Vue.js](https://img.shields.io/badge/Vue.js-4FC08D?style=for-the-badge&logo=vue.js&logoColor=white)](#)
[![Node.js](https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=node.js&logoColor=white)](#)

**Plateforme SaaS tout-en-un pour le marketing digital**  
*Intelligence artificielle • Gestion de projets • Automatisation*

[🚀 Démarrage Rapide](#-démarrage-rapide) • [📚 Documentation](./docs/README.md) • [🔧 Installation](#-installation) • [💡 Fonctionnalités](#-fonctionnalités-principales)

---

</div>

## 🎯 Vue d'ensemble

Fusepoint Platform est une solution complète de marketing digital qui révolutionne la gestion des campagnes marketing grâce à l'intelligence artificielle intégrée. Notre plateforme offre une expérience unifiée pour les agents marketing, les clients et les administrateurs.

### ✨ **Pourquoi Fusepoint ?**

- 🤖 **IA Intégrée** : Assistant marketing intelligent pour optimiser vos campagnes
- 🎯 **Gestion Centralisée** : Tous vos projets et clients en un seul endroit
- 📊 **Analytics Avancés** : Tableaux de bord en temps réel avec métriques détaillées
- 🔄 **Automatisation** : Workflows intelligents pour gagner du temps
- 🌐 **Multi-plateforme** : Intégration native avec les réseaux sociaux
- 🔐 **Sécurité Renforcée** : Gestion des rôles et permissions granulaires

## 🎯 Démarrage Rapide

### Installation et Lancement
```bash
# Démarrer tous les serveurs
./fusepoint.sh server start

# Voir l'état du système
./fusepoint.sh maintenance health

# Créer une sauvegarde
./fusepoint.sh backup create full
```

### Accès à l'Application
- **Frontend**: http://localhost:5173
- **API Backend**: http://localhost:3002
- **Documentation**: [docs/README.md](docs/README.md)

## 📂 Structure du Projet

```
fusepoint-platform/
├── 📁 scripts/                  # 📦 Tous les scripts centralisés
│   ├── 📁 docs/                 # 📚 Documentation centralisée
│   ├── 📁 debug/                # 🔍 Outils de debug et diagnostic
│   ├── 📁 utils/                # 🛠️ Utilitaires et scripts helper
│   └── 📁 scripts-management/   # 🎯 Scripts de gestion centralisés
├── 📁 src/                      # 🎨 Code source frontend (Vue.js)
├── 📁 server/                   # ⚙️ Code source backend (Node.js)
├── 📁 public/                   # 🌐 Fichiers statiques
└── fusepoint.sh                 # 🚀 Script principal unifié
```

## 🛠️ Gestion du Système

### Script Principal Unifié
Tous les scripts ont été centralisés dans `fusepoint.sh` :

```bash
# Gestion des serveurs
./fusepoint.sh server start|stop|restart|status

# Gestion des sauvegardes
./fusepoint.sh backup create|list|restore

# Gestion de la base de données
./fusepoint.sh database status|export

# Déploiement
./fusepoint.sh deploy production [branch]

# Maintenance
./fusepoint.sh maintenance health|cleanup
```

## 📚 Documentation

Toute la documentation a été centralisée dans le dossier [scripts/docs/](scripts/docs/) :

- **[scripts/docs/README.md](scripts/docs/README.md)** - Documentation principale détaillée
- **[scripts/docs/DEV-WORKFLOW.md](scripts/docs/DEV-WORKFLOW.md)** - Workflow de développement
- **[scripts/docs/INSTALLATION_SCRIPTS.md](scripts/docs/INSTALLATION_SCRIPTS.md)** - Guide d'installation
- **[scripts/docs/BACKUP_SYSTEM.md](scripts/docs/BACKUP_SYSTEM.md)** - Système de sauvegarde
- **[scripts/docs/TROUBLESHOOTING_INFOMANIAK.md](scripts/docs/TROUBLESHOOTING_INFOMANIAK.md)** - Dépannage
- **[scripts/docs/VERSION.md](scripts/docs/VERSION.md)** - Informations de version
- **[scripts/docs/CHANGELOG.md](scripts/docs/CHANGELOG.md)** - Historique des modifications

## 🔍 Debug et Diagnostic

Les outils de debug sont centralisés dans [scripts/debug/](scripts/debug/) :

- **debug-auth.js** - Debug authentification
- **debug-client-assignment.cjs** - Debug assignation clients
- **debug-clients-endpoint.cjs** - Debug endpoints clients
- **check-agent-clients.cjs** - Vérification agents/clients

## 🛠️ Utilitaires

Les utilitaires sont centralisés dans [scripts/utils/](scripts/utils/) :

- **sync-database-to-server.cjs** - Synchronisation base de données
- **fix-phone-column.js** - Correction colonne téléphone
- **update-version-logs.sh** - Mise à jour des logs de version
- **test-login.html** - Test de connexion

## 💡 Fonctionnalités Principales

<div align="center">

### 🎯 **Pour les Agents Marketing**

</div>

| Fonctionnalité | Description | Statut |
|---|---|---|
| 👥 **Gestion Clients** | CRM intégré avec assignation automatique | ✅ Actif |
| 🔑 **Mots de Passe** | Modification sécurisée des accès clients | 🆕 Nouveau |
| 📊 **Rapports** | Analytics détaillés et métriques de performance | ✅ Actif |
| 💬 **Communication** | Chat intégré avec les clients | ✅ Actif |
| 🤝 **Prestataires** | Système d'invitation et de collaboration | ✅ Actif |
| 📋 **Projets** | Gestion complète des projets marketing | ✅ Actif |

<div align="center">

### 👤 **Pour les Clients**

</div>

| Fonctionnalité | Description | Statut |
|---|---|---|
| 🤖 **Assistant IA** | Chat intelligent pour conseils marketing | ✅ Actif |
| 📊 **Dashboard** | Tableau de bord personnalisé et intuitif | ✅ Actif |
| 📱 **Réseaux Sociaux** | Intégration Facebook, Instagram et plus | ✅ Actif |
| 📋 **Suivi Projets** | Visualisation en temps réel de l'avancement | ✅ Actif |
| 🔔 **Notifications** | Alertes et mises à jour automatiques | ⚠️ Beta |
| 🔐 **Sécurité** | Authentification sécurisée et données protégées | ✅ Actif |

<div align="center">

### ⚙️ **Pour les Administrateurs**

</div>

| Fonctionnalité | Description | Statut |
|---|---|---|
| 👥 **Gestion Utilisateurs** | Administration complète des comptes | ✅ Actif |
| 🎨 **Templates** | Gestion des modèles de projets | 🆕 Nouveau |
| 🌐 **Internationalisation** | Support multilingue (FR/EN) | 🆕 Nouveau |
| 📧 **Configuration SMTP** | Paramétrage des emails automatiques | ✅ Actif |
| 📊 **Logs Système** | Surveillance et débogage avancés | 🔧 En cours |
| ⚙️ **Paramètres** | Configuration globale de la plateforme | ✅ Actif |

---

## 🛠️ Stack Technique

<div align="center">

### 🎨 **Frontend**
![Vue.js](https://img.shields.io/badge/Vue.js-4FC08D?style=for-the-badge&logo=vue.js&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)
![Vite](https://img.shields.io/badge/Vite-646CFF?style=for-the-badge&logo=vite&logoColor=white)
![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black)

### ⚙️ **Backend**
![Node.js](https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=node.js&logoColor=white)
![Express.js](https://img.shields.io/badge/Express.js-000000?style=for-the-badge&logo=express&logoColor=white)
![MariaDB](https://img.shields.io/badge/MariaDB-003545?style=for-the-badge&logo=mariadb&logoColor=white)
![PM2](https://img.shields.io/badge/PM2-2B037A?style=for-the-badge&logo=pm2&logoColor=white)

### 🤖 **Intelligence Artificielle**
![OpenAI](https://img.shields.io/badge/OpenAI-412991?style=for-the-badge&logo=openai&logoColor=white)
![Claude](https://img.shields.io/badge/Claude-FF6B35?style=for-the-badge&logoColor=white)

### 🚀 **Déploiement & DevOps**
![Apache](https://img.shields.io/badge/Apache-D22128?style=for-the-badge&logo=apache&logoColor=white)
![Git](https://img.shields.io/badge/Git-F05032?style=for-the-badge&logo=git&logoColor=white)
![npm](https://img.shields.io/badge/npm-CB3837?style=for-the-badge&logo=npm&logoColor=white)

</div>

### 📊 **Métriques du Projet**
- **Lignes de Code** : ~50,000+
- **Composants Vue** : 80+
- **Routes API** : 45+
- **Couverture Tests** : En développement
- **Documentation** : 95% complète

## 📞 Support & Assistance

<div align="center">

### 🛠️ **Diagnostic Rapide**

</div>

| Commande | Description | Usage |
|---|---|---|
| `./fusepoint.sh maintenance health` | Rapport de santé complet | Vérification système |
| `./fusepoint.sh maintenance cleanup` | Nettoyage automatique | Optimisation |
| `./fusepoint.sh server status` | État des serveurs | Monitoring |
| `./fusepoint.sh backup create` | Sauvegarde manuelle | Sécurité |

### 🆘 **En Cas de Problème**

1. 📚 **Documentation** : Consultez [scripts/docs/TROUBLESHOOTING_INFOMANIAK.md](scripts/docs/TROUBLESHOOTING_INFOMANIAK.md)
2. 🔍 **Debug** : Utilisez les outils dans [scripts/debug/](scripts/debug/)
3. 📊 **Logs** : Vérifiez avec `./fusepoint.sh server status`
4. 💬 **Support** : Contactez l'équipe de développement

### 📋 **Ressources Utiles**

- 📖 [Documentation Complète](./docs/README.md)
- 🔧 [Guide d'Installation](./docs/INSTALLATION_SCRIPTS.md)
- 🚀 [Workflow de Développement](./docs/DEV-WORKFLOW.md)
- 📝 [Changelog](./docs/CHANGELOG.md)
- 🔍 [Dépannage](./docs/TROUBLESHOOTING_INFOMANIAK.md)

---

<div align="center">

## 🎉 Merci d'utiliser Fusepoint Platform !

![Fusepoint Icon](./public/fusepoint-icon.svg)

### 🌟 **Développé avec passion pour révolutionner le marketing digital**

![Made with Love](https://img.shields.io/badge/Made%20with-❤️-red?style=for-the-badge)
![Team](https://img.shields.io/badge/Team-Fusepoint-blue?style=for-the-badge)
![Year](https://img.shields.io/badge/Since-2025-green?style=for-the-badge)

### 👥 **Équipe de Développement**
**Lead Developer** : Samuel Oliveira  
**Version Actuelle** : Alpha 1.1.0  
**Dernière MAJ** : Janvier 2025

### 🔗 **Liens Utiles**
[📚 Documentation](./docs/README.md) • [🐛 Issues](./docs/CHANGELOG.md) • [🚀 Roadmap](./docs/CHANGELOG.md#-roadmap-2025) • [📞 Support](#-support--assistance)

---

**© 2025 Fusepoint Platform - Tous droits réservés**  
*Plateforme Marketing Intelligente • Intelligence Artificielle • Automatisation*

</div>