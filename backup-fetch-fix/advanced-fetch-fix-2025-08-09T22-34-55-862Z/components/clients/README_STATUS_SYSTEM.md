# Système de Gestion des Statuts Client - Documentation

## Vue d'ensemble

Ce document décrit le nouveau système de gestion des statuts client, conçu pour être modulaire, maintenable et extensible.

## Architecture

### 1. Structure des Fichiers

```
src/
├── constants/
│   └── clientStatus.js          # Configuration centralisée des statuts
├── composables/
│   └── useClientStatus.js       # Logique de gestion des statuts
├── components/clients/
│   ├── ClientStatusBadge.vue    # Composant d'affichage des statuts
│   └── ClientStatusMenu.vue     # Composant de changement de statut
└── views/
    └── ClientStatusDemo.vue     # Page de démonstration
```

### 2. Statuts Disponibles

| Statut | Clé | Valeur | Description |
|--------|-----|--------|--------------|
| Actif | `active` | `1` | Client actif et opérationnel |
| Inactif | `inactive` | `0` | Client temporairement inactif |
| En attente | `pending` | `2` | Client en cours de validation |
| Suspendu | `suspended` | `3` | Client suspendu pour violation |
| Archivé | `archived` | `4` | Client archivé (historique) |

### 3. Transitions Autorisées

```
active → inactive, suspended, archived
inactive → active, archived
pending → active, inactive, suspended
suspended → active, inactive, archived
archived → (aucune transition)
```

## Utilisation

### 1. Configuration des Statuts (`clientStatus.js`)

```javascript
import { ClientStatusUtils } from '@/constants/clientStatus'

// Obtenir tous les statuts
const allStatuses = ClientStatusUtils.getAllStatuses()

// Obtenir un statut par clé
const activeStatus = ClientStatusUtils.getStatusByKey('active')

// Obtenir le statut d'un client
const clientStatus = ClientStatusUtils.getClientStatus(client)

// Vérifier les actions autorisées
const canActivate = ClientStatusUtils.canPerformAction(clientStatus, 'activate')

// Valider un changement de statut
const validation = ClientStatusUtils.validateStatusChange(currentStatus, newStatus)
```

### 2. Gestion des Statuts (`useClientStatus`)

```javascript
import { useClientStatus } from '@/composables/useClientStatus'

const {
  changeClientStatus,
  activateClient,
  deactivateClient,
  suspendClient,
  archiveClient,
  toggleClientStatus,
  bulkChangeStatus,
  isChangingStatus,
  getAvailableActions
} = useClientStatus()

// Changer le statut d'un client
await changeClientStatus(client, newStatus, {
  reason: 'Raison du changement',
  showNotification: true
})

// Actions rapides
await activateClient(client)
await deactivateClient(client)
await suspendClient(client)

// Changement en masse
await bulkChangeStatus(clients, newStatus)
```

### 3. Composants d'Interface

#### ClientStatusBadge

```vue
<template>
  <!-- Badge simple -->
  <ClientStatusBadge :client="client" />
  
  <!-- Badge avec icône -->
  <ClientStatusBadge :client="client" show-icon />
  
  <!-- Badge cliquable -->
  <ClientStatusBadge 
    :client="client" 
    clickable 
    @click="handleBadgeClick" 
  />
  
  <!-- Tailles différentes -->
  <ClientStatusBadge :client="client" size="sm" />
  <ClientStatusBadge :client="client" size="lg" />
</template>
```

#### ClientStatusMenu

```vue
<template>
  <!-- Menu de changement de statut -->
  <ClientStatusMenu
    :client="client"
    @status-change="handleStatusChange"
  />
  
  <!-- Menu avec options personnalisées -->
  <ClientStatusMenu
    :client="client"
    :show-current-status="false"
    :disabled="isLoading"
    @status-change="handleStatusChange"
  />
</template>

<script>
const handleStatusChange = async (client, newStatus) => {
  await changeClientStatus(client, newStatus)
}
</script>
```

### 4. Intégration dans les Vues

#### AgentClients.vue

```vue
<template>
  <ClientsTable
    :clients="clients"
    @status-change="handleStatusChange"
  />
</template>

<script>
import { useClientManagement } from '@/composables/useClientManagement'

const {
  changeClientStatus,
  toggleClientStatus,
  getAvailableActions
} = useClientManagement()

const handleStatusChange = async (client, newStatus) => {
  await changeClientStatus(client, newStatus)
}
</script>
```

## Fonctionnalités Avancées

### 1. Validation des Changements

Le système valide automatiquement les transitions de statut :

```javascript
// Validation automatique
const result = await changeClientStatus(client, newStatus)
if (!result.success) {
  console.error(result.error) // Message d'erreur explicite
}

// Ignorer la validation (pour les admins)
const result = await changeClientStatus(client, newStatus, {
  skipValidation: true
})
```

### 2. Gestion des Erreurs

```javascript
try {
  await changeClientStatus(client, newStatus)
} catch (error) {
  // Gestion d'erreur avec restauration automatique de l'état
  console.error('Erreur:', error.message)
}
```

### 3. Notifications Automatiques

```javascript
// Avec notifications (par défaut)
await changeClientStatus(client, newStatus)

// Sans notifications
await changeClientStatus(client, newStatus, {
  showNotification: false
})
```

### 4. Changements en Masse

```javascript
// Changer le statut de plusieurs clients
const results = await bulkChangeStatus(selectedClients, newStatus)

console.log(`${results.success.length} clients mis à jour`)
console.log(`${results.errors.length} erreurs`)
```

### 5. Statistiques

```javascript
// Obtenir les statistiques des statuts
const stats = getStatusStats(clients)
// { total: 100, active: 80, inactive: 15, pending: 3, suspended: 2, archived: 0 }
```

## Personnalisation

### 1. Ajouter un Nouveau Statut

```javascript
// Dans clientStatus.js
export const CLIENT_STATUSES = {
  // ... statuts existants
  BLOCKED: {
    key: 'blocked',
    value: 5,
    label: 'Bloqué',
    color: 'orange',
    bgColor: 'bg-orange-100',
    textColor: 'text-orange-800',
    borderColor: 'border-orange-200',
    icon: 'ExclamationTriangleIcon',
    description: 'Client bloqué temporairement',
    permissions: ['view'],
    actions: ['unblock', 'archive']
  }
}

// Ajouter les transitions
export const STATUS_TRANSITIONS = {
  // ... transitions existantes
  active: ['inactive', 'suspended', 'blocked', 'archived'],
  blocked: ['active', 'inactive', 'archived']
}
```

### 2. Personnaliser les Couleurs

```javascript
// Modifier les couleurs dans clientStatus.js
ACTIVE: {
  // ... autres propriétés
  color: 'emerald',        // Couleur Tailwind
  bgColor: 'bg-emerald-100',
  textColor: 'text-emerald-800',
  borderColor: 'border-emerald-200'
}
```

### 3. Ajouter des Actions Personnalisées

```javascript
// Dans useClientStatus.js
const blockClient = async (client, options = {}) => {
  const blockedStatus = ClientStatusUtils.getStatusByKey('blocked')
  return await changeClientStatus(client, blockedStatus, {
    ...options,
    reason: options.reason || 'Client bloqué'
  })
}
```

## Tests et Démonstration

### Page de Démonstration

Accédez à `/agent/status-demo` pour tester le système :

- Génération de clients de test
- Test des changements de statut
- Validation des transitions
- Actions en masse
- Journal des changements

### Tests Unitaires

```javascript
// Exemple de test
import { ClientStatusUtils } from '@/constants/clientStatus'

describe('ClientStatusUtils', () => {
  test('should validate status transitions', () => {
    const activeStatus = ClientStatusUtils.getStatusByKey('active')
    const inactiveStatus = ClientStatusUtils.getStatusByKey('inactive')
    
    const validation = ClientStatusUtils.validateStatusChange(activeStatus, inactiveStatus)
    expect(validation.valid).toBe(true)
  })
})
```

## Migration depuis l'Ancien Système

### 1. Mapping des Anciennes Valeurs

```javascript
// Ancien système: is_active (boolean)
// Nouveau système: status (string) + is_active (number)

const migrateClientStatus = (client) => {
  if (client.status) return client // Déjà migré
  
  // Migration basée sur is_active
  client.status = client.is_active ? 'active' : 'inactive'
  client.is_active = client.is_active ? 1 : 0
  
  return client
}
```

### 2. Compatibilité Descendante

```javascript
// Le système supporte automatiquement les anciens clients
const clientStatus = ClientStatusUtils.getClientStatus(client)
// Fonctionne avec les nouveaux ET anciens formats
```

## Bonnes Pratiques

1. **Toujours utiliser les fonctions centralisées** pour changer les statuts
2. **Valider les transitions** avant les changements
3. **Fournir des raisons** pour les changements de statut
4. **Gérer les erreurs** avec des messages explicites
5. **Utiliser les composants fournis** pour l'interface
6. **Tester les changements** avec la page de démonstration

## Dépannage

### Problèmes Courants

1. **Transition non autorisée**
   - Vérifiez les transitions définies dans `STATUS_TRANSITIONS`
   - Utilisez `validateStatusChange()` pour diagnostiquer

2. **Statut non reconnu**
   - Vérifiez que le statut existe dans `CLIENT_STATUSES`
   - Utilisez `getStatusByKey()` pour valider

3. **Erreur de synchronisation**
   - Vérifiez la connexion API
   - Consultez les logs du navigateur

### Debug

```javascript
// Activer les logs détaillés
const result = await changeClientStatus(client, newStatus, {
  debug: true
})
```

## Support

Pour toute question ou problème :
1. Consultez cette documentation
2. Testez avec la page de démonstration
3. Vérifiez les logs du navigateur
4. Contactez l'équipe de développement