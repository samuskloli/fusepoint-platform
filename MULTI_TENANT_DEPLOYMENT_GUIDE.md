# Guide de Déploiement Multi-Tenant

## Vue d'ensemble

Ce guide détaille les étapes nécessaires pour déployer le système de scoping multi-tenant strict sur la plateforme Fusepoint. Le système garantit une isolation complète des données par couple (client_id, project_id).

## 🎯 Objectifs

- ✅ Isolation stricte des données par client et projet
- ✅ Sécurité renforcée avec validation côté serveur
- ✅ Performance optimisée avec index composites
- ✅ Audit complet des accès
- ✅ Interface utilisateur adaptée au contexte multi-tenant

## 📋 Prérequis

### Environnement
- Node.js >= 16.0.0
- MySQL >= 8.0 ou PostgreSQL >= 13
- Redis >= 6.0 (pour le cache et les sessions)
- Stockage de fichiers (local ou S3)

### Permissions
- Accès administrateur à la base de données
- Permissions d'écriture sur le système de fichiers
- Accès aux variables d'environnement de production

## 🚀 Étapes de Déploiement

### Phase 1: Préparation

#### 1.1 Sauvegarde
```bash
# Sauvegarder la base de données
mysqldump -u root -p fusepoint_db > backup_pre_migration_$(date +%Y%m%d_%H%M%S).sql

# Sauvegarder les fichiers
tar -czf files_backup_$(date +%Y%m%d_%H%M%S).tar.gz uploads/

# Sauvegarder le code actuel
git tag pre-multitenant-migration
git push origin pre-multitenant-migration
```

#### 1.2 Validation de l'environnement
```bash
# Vérifier les dépendances
node scripts/check-environment.js

# Tester la connexion à la base de données
node scripts/test-db-connection.js

# Vérifier l'espace disque disponible
df -h
```

### Phase 2: Migration de la Base de Données

#### 2.1 Exécution du schéma multi-tenant
```bash
# Appliquer le schéma principal
mysql -u root -p fusepoint_db < server/migrations/001_add_multi_tenant_scoping.sql

# Vérifier l'application du schéma
mysql -u root -p fusepoint_db -e "SHOW TABLES LIKE '%client%'; SHOW TABLES LIKE '%project%';"
```

#### 2.2 Backfill des données existantes
```bash
# Exécuter le script de backfill
mysql -u root -p fusepoint_db < server/migrations/002_backfill_multi_tenant_data.sql

# Vérifier l'intégrité des données
node scripts/validate-migration.js
```

#### 2.3 Validation post-migration
```bash
# Exécuter les tests de validation
node server/services/multiTenantValidationService.js

# Vérifier les contraintes
mysql -u root -p fusepoint_db -e "SELECT COUNT(*) FROM files WHERE client_id IS NULL OR project_id IS NULL;"
```

### Phase 3: Déploiement du Code

#### 3.1 Installation des dépendances
```bash
# Backend
npm install

# Frontend
cd client && npm install
```

#### 3.2 Configuration
```bash
# Copier les variables d'environnement
cp .env.example .env.production

# Configurer les variables multi-tenant
echo "MULTI_TENANT_ENABLED=true" >> .env.production
echo "STRICT_SCOPING=true" >> .env.production
echo "AUDIT_ENABLED=true" >> .env.production
```

#### 3.3 Build et déploiement
```bash
# Build du frontend
npm run build

# Démarrage des services
pm2 restart fusepoint-api
pm2 restart fusepoint-frontend

# Vérifier le statut
pm2 status
```

### Phase 4: Tests et Validation

#### 4.1 Tests d'isolation
```bash
# Exécuter les tests E2E
npm run test:e2e:multitenant

# Tests d'isolation spécifiques
node tests/e2e/multiTenantIsolation.test.js
```

#### 4.2 Tests de performance
```bash
# Tests de charge
npm run test:load

# Monitoring des requêtes
node scripts/monitor-queries.js
```

#### 4.3 Validation manuelle
```bash
# Tester l'API
curl -H "Authorization: Bearer $TOKEN" \
     "http://localhost:3000/api/clients/1/projects/1/widgets/files"

# Vérifier l'isolation
node scripts/test-isolation.js
```

## 🔧 Configuration Post-Déploiement

### Monitoring

#### Métriques à surveiller
- Temps de réponse des API avec scoping
- Utilisation des index composites
- Logs d'audit et d'accès
- Erreurs de validation de scope

#### Configuration des alertes
```javascript
// Exemple de configuration d'alerte
const alerts = {
  scopeViolation: {
    threshold: 1,
    action: 'immediate_notification'
  },
  performanceDegradation: {
    threshold: '2s',
    action: 'warning'
  }
};
```

### Optimisation

#### Index de performance
```sql
-- Vérifier l'utilisation des index
EXPLAIN SELECT * FROM files WHERE client_id = 1 AND project_id = 1;

-- Analyser les requêtes lentes
SELECT * FROM mysql.slow_log WHERE sql_text LIKE '%client_id%';
```

#### Cache Redis
```javascript
// Configuration du cache multi-tenant
const cacheConfig = {
  keyPrefix: 'mt:', // multi-tenant
  ttl: 3600,
  keyPattern: 'client:{clientId}:project:{projectId}:{resource}'
};
```

## 🛡️ Sécurité

### Validation des Accès

#### Middleware de sécurité
```javascript
// Vérification automatique du scope
app.use('/api/clients/:clientId/projects/:projectId', 
  validateMultiTenantScope,
  enforceDataScope
);
```

#### Audit des accès
```sql
-- Requête pour surveiller les accès suspects
SELECT 
  user_id, 
  client_id, 
  project_id, 
  action, 
  COUNT(*) as attempts
FROM access_logs 
WHERE created_at >= NOW() - INTERVAL 1 HOUR
GROUP BY user_id, client_id, project_id, action
HAVING attempts > 100;
```

### Tests de Pénétration

#### Scénarios à tester
1. Tentative d'accès cross-client
2. Manipulation des paramètres d'URL
3. Injection SQL dans les paramètres de scope
4. Contournement des validations frontend

```bash
# Script de test de sécurité
node scripts/security-tests.js
```

## 📊 Monitoring et Maintenance

### Tableaux de Bord

#### Métriques Clés
- Nombre de clients actifs
- Nombre de projets par client
- Volume de données par scope
- Performance des requêtes scopées

#### Alertes Critiques
- Violation d'isolation détectée
- Échec de validation de scope
- Performance dégradée
- Erreurs d'audit

### Maintenance Régulière

#### Hebdomadaire
```bash
# Rapport de santé du système
node server/services/multiTenantValidationService.js > weekly_health_report.json

# Nettoyage des logs anciens
node scripts/cleanup-old-logs.js
```

#### Mensuelle
```bash
# Analyse des performances
node scripts/performance-analysis.js

# Optimisation des index
node scripts/optimize-indexes.js

# Nettoyage du code legacy
node scripts/cleanup-legacy-code.js
```

## 🚨 Procédures d'Urgence

### Rollback

#### En cas de problème critique
```bash
# 1. Arrêter les services
pm2 stop all

# 2. Restaurer la base de données
mysql -u root -p fusepoint_db < backup_pre_migration_YYYYMMDD_HHMMSS.sql

# 3. Restaurer le code
git checkout pre-multitenant-migration

# 4. Redémarrer les services
pm2 start all
```

#### Validation du rollback
```bash
# Vérifier que l'application fonctionne
curl http://localhost:3000/health

# Tester les fonctionnalités critiques
node scripts/test-critical-features.js
```

### Récupération de Données

#### En cas de corruption
```bash
# Identifier les données corrompues
node scripts/identify-corrupted-data.js

# Restaurer depuis la sauvegarde
node scripts/restore-specific-data.js --table=files --client-id=1
```

## 📚 Documentation

### Pour les Développeurs

#### Nouvelles Conventions
- Toutes les API doivent inclure `clientId` et `projectId`
- Validation obligatoire du scope côté serveur
- Tests d'isolation requis pour chaque nouvelle fonctionnalité

#### Exemples de Code
```javascript
// Service multi-tenant
const result = await multiTenantApi.getFiles(clientId, projectId, {
  page: 1,
  limit: 20
});

// Validation de scope
if (!validateScope(req.params.clientId, req.params.projectId, req.user)) {
  return res.status(403).json({ error: 'Access denied' });
}
```

### Pour les Utilisateurs

#### Changements d'Interface
- Sélecteur de contexte client/projet obligatoire
- Données filtrées automatiquement par scope
- Indicateurs visuels du contexte actuel

## ✅ Checklist de Déploiement

### Pré-déploiement
- [ ] Sauvegarde complète effectuée
- [ ] Tests en environnement de staging réussis
- [ ] Validation des performances
- [ ] Revue de sécurité complétée
- [ ] Documentation mise à jour

### Déploiement
- [ ] Migration de base de données appliquée
- [ ] Backfill des données terminé
- [ ] Code déployé et services redémarrés
- [ ] Tests d'isolation réussis
- [ ] Monitoring activé

### Post-déploiement
- [ ] Validation fonctionnelle complète
- [ ] Tests de charge réussis
- [ ] Audit de sécurité effectué
- [ ] Formation des équipes terminée
- [ ] Documentation utilisateur mise à jour

## 🔗 Ressources

### Scripts Utiles
- `scripts/validate-migration.js` - Validation post-migration
- `scripts/test-isolation.js` - Tests d'isolation
- `scripts/cleanup-legacy-code.js` - Nettoyage du code legacy
- `scripts/performance-analysis.js` - Analyse des performances

### Fichiers de Configuration
- `server/migrations/001_add_multi_tenant_scoping.sql` - Schéma principal
- `server/migrations/002_backfill_multi_tenant_data.sql` - Backfill des données
- `server/middleware/multiTenantAuth.js` - Middleware d'authentification
- `src/services/multiTenantService.ts` - Service frontend

### Tests
- `tests/e2e/multiTenantIsolation.test.js` - Tests E2E d'isolation
- `server/services/multiTenantValidationService.js` - Service de validation

## 📞 Support

En cas de problème lors du déploiement :

1. Consulter les logs : `pm2 logs`
2. Vérifier la santé du système : `node server/services/multiTenantValidationService.js`
3. Contacter l'équipe de développement avec les détails de l'erreur

---

**Note importante** : Ce déploiement modifie fondamentalement l'architecture de données. Assurez-vous d'avoir testé exhaustivement en environnement de staging avant le déploiement en production.