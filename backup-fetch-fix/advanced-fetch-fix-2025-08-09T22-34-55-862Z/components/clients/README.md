# Composants Clients

Cette documentation décrit les composants modulaires créés pour la gestion des clients dans l'application.

## Structure des Composants

### 1. SearchAndFilters.vue
Composant pour la recherche et le filtrage des clients.

**Props:**
- `search` (String): Terme de recherche actuel
- `filters` (Object): Filtres appliqués (status, period)
- `showFilters` (Boolean): Affichage des filtres étendus
- `messages` (Object): Messages et libellés

**Événements:**
- `update:search`: Mise à jour du terme de recherche
- `update:filters`: Mise à jour des filtres
- `update:showFilters`: Basculer l'affichage des filtres
- `reset`: Réinitialiser tous les filtres

### 2. ClientsTable.vue
Tableau d'affichage des clients avec gestion des états.

**Props:**
- `clients` (Array): Liste des clients
- `selectedClients` (Array): Clients sélectionnés
- `loading` (Boolean): État de chargement
- `error` (String): Message d'erreur
- `messages` (Object): Messages et libellés

**Événements:**
- `update:selectedClients`: Mise à jour de la sélection
- `edit`: Éditer un client
- `delete`: Supprimer un client

### 3. StatusBadge.vue
Badge d'affichage du statut client.

**Props:**
- `status` (String): Statut du client (active, inactive, pending, suspended)
- `messages` (Object): Messages pour les statuts

### 4. ClientModal.vue
Modal de création/édition de client.

**Props:**
- `show` (Boolean): Affichage de la modal
- `client` (Object): Données du client
- `isEditing` (Boolean): Mode édition
- `validationErrors` (Object): Erreurs de validation
- `isSaving` (Boolean): État de sauvegarde
- `messages` (Object): Messages et libellés

**Événements:**
- `save`: Sauvegarder le client
- `close`: Fermer la modal

### 5. DeleteModal.vue
Modal de confirmation de suppression individuelle.

**Props:**
- `show` (Boolean): Affichage de la modal
- `client` (Object): Client à supprimer
- `isDeleting` (Boolean): État de suppression
- `messages` (Object): Messages de confirmation

**Événements:**
- `confirm`: Confirmer la suppression
- `cancel`: Annuler la suppression

### 6. BulkDeleteModal.vue
Modal de confirmation de suppression en masse.

**Props:**
- `show` (Boolean): Affichage de la modal
- `selectedClients` (Array): Clients sélectionnés
- `isDeleting` (Boolean): État de suppression
- `messages` (Object): Messages de confirmation

**Événements:**
- `confirm`: Confirmer la suppression
- `cancel`: Annuler la suppression

## Composants Communs

### Pagination.vue
Composant de pagination réutilisable (dans `src/components/common/`).

**Props:**
- `currentPage` (Number): Page actuelle
- `totalPages` (Number): Nombre total de pages
- `totalItems` (Number): Nombre total d'éléments
- `itemsPerPage` (Number): Éléments par page
- `messages` (Object): Messages de pagination

**Événements:**
- `page-change`: Changement de page

## Composables

### useClientManagement.js
Composable pour la gestion des clients.

**Fonctionnalités:**
- Gestion de l'état (clients, chargement, erreurs)
- Opérations CRUD
- Recherche et filtrage
- Pagination
- Statistiques
- Validation

### useNotifications.js
Composable pour les notifications (existant).

**Fonctionnalités:**
- Affichage de notifications (succès, erreur, avertissement, info)
- Gestion automatique de la durée
- Suppression manuelle

## Messages Centralisés

### clientMessages.js
Centralisation de tous les messages et textes.

**Sections:**
- Titres et navigation
- Boutons et actions
- Filtres et recherche
- Tableau et données
- Modales
- Notifications
- Validation
- Exemples multilingues

## Utilisation

### Dans AgentClients.vue

```vue
<template>
  <div>
    <SearchAndFilters
      v-model:search="search"
      v-model:filters="filters"
      v-model:showFilters="showFilters"
      :messages="messages.filters"
      @reset="resetFilters"
    />
    
    <ClientsTable
      :clients="clients"
      v-model:selectedClients="selectedClients"
      :loading="loading"
      :error="error"
      :messages="messages.table"
      @edit="editClient"
      @delete="deleteClient"
    />
    
    <Pagination
      :currentPage="currentPage"
      :totalPages="totalPages"
      :totalItems="totalItems"
      :itemsPerPage="itemsPerPage"
      :messages="messages.pagination"
      @page-change="changePage"
    />
  </div>
</template>

<script>
import { useClientManagement } from '@/composables/useClientManagement'
import { useNotifications } from '@/composables/useNotifications'
import { clientMessages } from '@/constants/clientMessages'

export default {
  setup() {
    const clientManagement = useClientManagement()
    const notifications = useNotifications()
    
    return {
      ...clientManagement,
      ...notifications,
      messages: clientMessages.fr
    }
  }
}
</script>
```

## Avantages de cette Architecture

1. **Modularité**: Chaque composant a une responsabilité unique
2. **Réutilisabilité**: Les composants peuvent être utilisés ailleurs
3. **Maintenabilité**: Code plus facile à maintenir et déboguer
4. **Testabilité**: Chaque composant peut être testé individuellement
5. **Centralisation**: Messages et logique métier centralisés
6. **Internationalisation**: Structure prête pour le multilingue
7. **Performance**: Chargement et rendu optimisés

## Personnalisation

### Modifier les Messages
Éditez le fichier `src/constants/clientMessages.js` pour personnaliser les textes.

### Ajouter une Langue
Ajoutez une nouvelle section dans `clientMessages.js` :

```javascript
export const clientMessages = {
  fr: { /* messages français */ },
  en: { /* messages anglais */ },
  es: { /* messages espagnols */ },
  de: { /* nouveaux messages allemands */ }
}
```

### Personnaliser les Styles
Chaque composant utilise Tailwind CSS. Modifiez les classes dans les templates pour personnaliser l'apparence.

### Étendre les Fonctionnalités
Ajoutez de nouvelles méthodes dans `useClientManagement.js` ou créez de nouveaux composables selon vos besoins.