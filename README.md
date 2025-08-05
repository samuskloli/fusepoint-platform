# 🚀 Fusepoint - Plateforme Marketing SaaS

> **Version Actuelle**: Alpha 2.1.0  
> **Statut**: ✅ Production Ready  
> **Dernière mise à jour**: 2025-08-04

## 📋 Vue d'ensemble

Fusepoint est une plateforme SaaS complète de marketing digital qui combine intelligence artificielle, gestion de projets clients et automatisation des campagnes marketing.

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

## 🚀 Fonctionnalités Principales

- **🤖 IA Marketing** - Assistant IA pour campagnes marketing
- **👥 Gestion Clients** - CRM intégré avec assignation d'agents
- **📊 Tableaux de Bord** - Analytics et métriques en temps réel
- **💬 Chat Système** - Communication client-agent intégrée
- **🔄 Automatisation** - Workflows marketing automatisés
- **🔐 Authentification** - Système de rôles et permissions
- **💾 Sauvegarde** - Système de backup automatisé
- **🌐 Multi-plateforme** - Support réseaux sociaux

## 🔧 Technologies

- **Frontend**: Vue.js 3, Tailwind CSS, Vite
- **Backend**: Node.js, Express, SQLite
- **IA**: Intégration APIs IA (OpenAI, Claude)
- **Déploiement**: PM2, Apache, Infomaniak
- **Base de données**: SQLite avec migrations

## 📞 Support

### Diagnostic Rapide
```bash
# Rapport de santé complet
./fusepoint.sh maintenance health

# Nettoyage système
./fusepoint.sh maintenance cleanup
```

### En Cas de Problème
1. Consultez [scripts/docs/TROUBLESHOOTING_INFOMANIAK.md](scripts/docs/TROUBLESHOOTING_INFOMANIAK.md)
2. Utilisez les outils de debug dans [scripts/debug/](scripts/debug/)
3. Vérifiez les logs : `./fusepoint.sh server status`

---

**Développé avec ❤️ pour optimiser vos campagnes marketing**  
**© 2025 Fusepoint Platform - Tous droits réservés**