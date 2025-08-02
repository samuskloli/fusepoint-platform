# Documentation du Système de Chat Fusepoint

## Vue d'ensemble

Le système de chat Fusepoint permet la communication directe entre les clients et leurs agents dédiés. Il est conçu pour s'intégrer parfaitement avec l'architecture existante de la plateforme et respecter les rôles et permissions déjà en place.

## Architecture du Système

### Structure de Base de Données

Le système utilise 4 tables principales définies dans `server/database/chat_schema.sql` :

#### 1. Table `conversations`
```sql
CREATE TABLE conversations (
    id INT PRIMARY KEY AUTO_INCREMENT,
    client_id INT NOT NULL,
    agent_id INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (client_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (agent_id) REFERENCES users(id) ON DELETE CASCADE,
    UNIQUE KEY unique_client_agent (client_id, agent_id)
);
```
- **Rôle** : Gère les conversations entre un client et un agent
- **Contraintes** : Une seule conversation par paire client-agent
- **Relations** : Liée aux utilisateurs via les clés étrangères

#### 2. Table `messages`
```sql
CREATE TABLE messages (
    id INT PRIMARY KEY AUTO_INCREMENT,
    conversation_id INT NOT NULL,
    sender_id INT NOT NULL,
    content TEXT,
    message_type ENUM('text', 'file') DEFAULT 'text',
    file_name VARCHAR(255),
    file_path VARCHAR(500),
    file_size INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    is_read BOOLEAN DEFAULT FALSE,
    FOREIGN KEY (conversation_id) REFERENCES conversations(id) ON DELETE CASCADE,
    FOREIGN KEY (sender_id) REFERENCES users(id) ON DELETE CASCADE
);
```
- **Rôle** : Stocke tous les messages (texte et fichiers)
- **Types supportés** : 'text' pour les messages texte, 'file' pour les fichiers
- **Métadonnées** : Nom, chemin et taille des fichiers

#### 3. Table `conversation_participants`
```sql
CREATE TABLE conversation_participants (
    id INT PRIMARY KEY AUTO_INCREMENT,
    conversation_id INT NOT NULL,
    user_id INT NOT NULL,
    joined_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    last_read_at TIMESTAMP NULL,
    FOREIGN KEY (conversation_id) REFERENCES conversations(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    UNIQUE KEY unique_conversation_user (conversation_id, user_id)
);
```
- **Rôle** : Gère la participation et le statut de lecture
- **Fonctionnalité** : Suivi des messages lus/non lus

#### 4. Table `chat_notifications`
```sql
CREATE TABLE chat_notifications (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    conversation_id INT NOT NULL,
    message_id INT NOT NULL,
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (conversation_id) REFERENCES conversations(id) ON DELETE CASCADE,
    FOREIGN KEY (message_id) REFERENCES messages(id) ON DELETE CASCADE
);
```
- **Rôle** : Système de notifications pour les nouveaux messages
- **Utilisation** : Badges de notification, compteurs de messages non lus

### Index et Optimisations

Le schéma inclut des index optimisés pour les requêtes fréquentes :
- Index sur `conversation_id` dans `messages`
- Index sur `sender_id` dans `messages`
- Index sur `user_id` dans `chat_notifications`
- Index sur `is_read` dans `chat_notifications`

### Triggers Automatiques

Deux triggers automatisent la gestion des notifications :

1. **`after_message_insert`** : Crée automatiquement une notification pour le destinataire
2. **`after_conversation_update`** : Met à jour le timestamp de la conversation

## API Routes

Toutes les routes sont définies dans `server/routes/chat.js` et préfixées par `/api/chat`.

### Routes Communes (Client + Agent)

#### `GET /conversations/:id/messages`
- **Fonction** : Récupère les messages d'une conversation
- **Paramètres** : `id` (ID de la conversation)
- **Réponse** : Liste des messages avec métadonnées
- **Sécurité** : Vérification de participation à la conversation

#### `POST /conversations/:id/messages`
- **Fonction** : Envoie un nouveau message
- **Paramètres** : `id` (ID de la conversation)
- **Body** : `{ content, message_type }`
- **Validation** : Contenu requis, type valide

#### `POST /conversations/:id/upload`
- **Fonction** : Upload de fichiers
- **Paramètres** : `id` (ID de la conversation)
- **Fichiers** : PDF, DOC, DOCX, TXT, images
- **Limite** : 10MB par fichier

#### `PUT /conversations/:id/read`
- **Fonction** : Marque une conversation comme lue
- **Effet** : Met à jour `last_read_at` et marque les notifications comme lues

### Routes Spécifiques Client

#### `GET /assigned-agent`
- **Fonction** : Récupère l'agent assigné au client
- **Utilisation** : Initialisation du chat côté client
- **Relation** : Utilise la table `agent_prestataires`

#### `POST /conversations/start`
- **Fonction** : Démarre une conversation avec l'agent assigné
- **Automatique** : Crée la conversation si elle n'existe pas

### Routes Spécifiques Agent

#### `GET /agent/conversations`
- **Fonction** : Liste toutes les conversations de l'agent
- **Tri** : Par messages non lus puis par activité récente
- **Métadonnées** : Nombre de messages non lus, dernier message

#### `GET /agent/assigned-clients`
- **Fonction** : Liste des clients assignés à l'agent
- **Source** : Table `agent_prestataires`

#### `GET /search/clients`
- **Fonction** : Recherche globale dans tous les clients
- **Paramètres** : `q` (terme de recherche)
- **Accès** : Agents, admins, super admins uniquement

#### `POST /conversations/create`
- **Fonction** : Crée une nouvelle conversation avec un client
- **Usage** : Permet aux agents d'initier des conversations

### Gestion des Notifications

#### `GET /notifications`
- **Fonction** : Récupère les notifications non lues
- **Utilisation** : Badges, compteurs

#### `PUT /notifications/:id/read`
- **Fonction** : Marque une notification comme lue

## Services Backend

Le service principal `server/services/chatService.js` centralise toute la logique métier :

### Méthodes Principales

- **`initialize()`** : Initialise le service et crée les tables
- **`getOrCreateConversation(clientId, agentId)`** : Gestion des conversations
- **`sendMessage(conversationId, senderId, messageData)`** : Envoi de messages
- **`getMessages(conversationId, userId)`** : Récupération avec vérification d'accès
- **`markAsRead(conversationId, userId)`** : Gestion du statut de lecture
- **`getUserConversations(userId, userRole)`** : Liste adaptée au rôle
- **`checkClientAgentAssignment(clientId, agentId)`** : Vérification des assignations
- **`searchClients(query, requestingUserId, userRole)`** : Recherche avec permissions

### Sécurité et Permissions

Le service intègre plusieurs niveaux de sécurité :

1. **Vérification des assignations** : Utilise les tables existantes `agent_prestataires`
2. **Contrôle d'accès aux conversations** : Seuls les participants peuvent accéder
3. **Validation des rôles** : Différents niveaux d'accès selon le rôle
4. **Sanitisation des données** : Validation des entrées utilisateur

## Frontend (Vue.js)

### Structure des Composants

#### `src/components/Chat/ChatWrapper.vue`
- **Rôle** : Routeur de composants selon le rôle utilisateur
- **Logique** : Affiche `ClientChat` ou `AgentChat` selon le rôle

#### `src/components/Chat/ClientChat.vue`
- **Interface** : Chat simple avec l'agent assigné
- **Fonctionnalités** :
  - Affichage de l'agent assigné
  - Historique des messages
  - Envoi de messages texte et fichiers
  - Notifications en temps réel
  - Polling automatique (5 secondes)

#### `src/components/Chat/AgentChat.vue`
- **Interface** : Gestion complète des conversations
- **Fonctionnalités** :
  - Liste des conversations avec filtres
  - Recherche de clients (assignés/tous)
  - Gestion multi-conversations
  - Badges de messages non lus
  - Création de nouvelles conversations
  - Interface responsive

#### `src/views/Chat.vue`
- **Rôle** : Vue principale avec navigation
- **Fonctionnalités** :
  - Sidebar de navigation
  - En-tête avec statut
  - Intégration responsive
  - Compteurs de notifications globaux

### Service API Frontend

`src/services/chatAPI.js` centralise toutes les interactions avec l'API :

```javascript
// Exemples d'utilisation
const response = await chatAPI.getMessages(conversationId)
const result = await chatAPI.sendMessage(conversationId, messageData)
const upload = await chatAPI.uploadFile(conversationId, file)
```

### Gestion d'État

Le système utilise le store Vuex existant pour :
- Authentification utilisateur
- Informations de rôle
- État global de l'application

## Intégration avec l'Existant

### Relations avec les Tables Existantes

Le système s'appuie sur l'architecture existante :

1. **Table `users`** : Gestion des utilisateurs (clients, agents)
2. **Table `agent_prestataires`** : Assignations client-agent
3. **Système d'authentification** : Middleware et services existants
4. **Permissions** : Rôles et contrôles d'accès en place

### Middleware Utilisés

- **`authMiddleware`** : Authentification requise
- **`roleAuth`** : Contrôle d'accès par rôle
- **Validation** : Express-validator pour les entrées

## Configuration et Déploiement

### Variables d'Environnement

```env
# Frontend (Vue.js)
VUE_APP_API_URL=http://localhost:3000

# Backend (Node.js)
PORT=3000
DB_HOST=localhost
DB_USER=your_user
DB_PASSWORD=your_password
DB_NAME=fusepoint_db
```

### Installation

1. **Base de données** :
   ```bash
   # Exécuter le schéma
   mysql -u user -p database < server/database/chat_schema.sql
   ```

2. **Backend** :
   ```bash
   cd server
   npm install
   npm start
   ```

3. **Frontend** :
   ```bash
   cd src
   npm install
   npm run serve
   ```

### Dossiers de Stockage

Les fichiers uploadés sont stockés dans :
- **Serveur** : `server/uploads/chat/`
- **URL d'accès** : `/uploads/chat/filename`

## Extension du Système

### Ajouter de Nouveaux Rôles

1. **Backend** :
   ```javascript
   // Dans chatService.js
   const allowedRoles = ['agent', 'admin', 'super_admin', 'nouveau_role']
   ```

2. **Frontend** :
   ```javascript
   // Dans ChatWrapper.vue
   computed: {
     isAgent() {
       return ['agent', 'admin', 'super_admin', 'nouveau_role'].includes(this.userRole)
     }
   }
   ```

3. **Routes** :
   ```javascript
   // Dans routes/chat.js
   router.use('/agent/*', roleAuth(['agent', 'admin', 'super_admin', 'nouveau_role']))
   ```

### Ajouter de Nouveaux Types de Messages

1. **Base de données** :
   ```sql
   ALTER TABLE messages MODIFY COLUMN message_type ENUM('text', 'file', 'image', 'video', 'system');
   ```

2. **Backend** :
   ```javascript
   // Dans chatService.js
   const validMessageTypes = ['text', 'file', 'image', 'video', 'system']
   ```

3. **Frontend** :
   ```vue
   <!-- Dans les composants de chat -->
   <div v-else-if="message.message_type === 'system'" class="system-message">
     <!-- Interface pour messages système -->
   </div>
   ```

### Ajouter des Réactions aux Messages

1. **Nouvelle table** :
   ```sql
   CREATE TABLE message_reactions (
     id INT PRIMARY KEY AUTO_INCREMENT,
     message_id INT NOT NULL,
     user_id INT NOT NULL,
     reaction_type VARCHAR(50) NOT NULL,
     created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
     FOREIGN KEY (message_id) REFERENCES messages(id) ON DELETE CASCADE,
     FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
     UNIQUE KEY unique_user_message_reaction (message_id, user_id, reaction_type)
   );
   ```

2. **Nouvelles routes** :
   ```javascript
   // POST /api/chat/messages/:id/reactions
   // DELETE /api/chat/messages/:id/reactions/:reactionType
   // GET /api/chat/messages/:id/reactions
   ```

3. **Interface utilisateur** :
   ```vue
   <div class="message-reactions">
     <button @click="addReaction('like')" class="reaction-btn">
       👍 {{ reactions.like || 0 }}
     </button>
   </div>
   ```

### Notifications en Temps Réel (WebSocket)

Pour améliorer l'expérience utilisateur :

1. **Installation** :
   ```bash
   npm install socket.io socket.io-client
   ```

2. **Backend** :
   ```javascript
   // Dans server.js
   const io = require('socket.io')(server)
   
   // Dans chatService.js
   io.to(`user_${recipientId}`).emit('new_message', messageData)
   ```

3. **Frontend** :
   ```javascript
   // Dans les composants de chat
   import io from 'socket.io-client'
   
   mounted() {
     this.socket = io(process.env.VUE_APP_API_URL)
     this.socket.on('new_message', this.handleNewMessage)
   }
   ```

## Sécurité et Bonnes Pratiques

### Validation des Données

- **Sanitisation** : Tous les inputs utilisateur sont validés
- **Taille des fichiers** : Limite de 10MB
- **Types de fichiers** : Whitelist des extensions autorisées
- **Injection SQL** : Utilisation de requêtes préparées

### Contrôle d'Accès

- **Authentification** : Token JWT requis
- **Autorisation** : Vérification des rôles et assignations
- **Isolation** : Les utilisateurs ne peuvent accéder qu'à leurs conversations

### Performance

- **Index de base de données** : Optimisation des requêtes fréquentes
- **Pagination** : Limitation du nombre de messages chargés
- **Cache** : Mise en cache des assignations client-agent

## Maintenance et Monitoring

### Logs

Le système génère des logs pour :
- Erreurs de base de données
- Tentatives d'accès non autorisé
- Uploads de fichiers
- Performances des requêtes

### Métriques Recommandées

- Nombre de messages par jour
- Temps de réponse des agents
- Taux d'utilisation par client
- Erreurs d'upload de fichiers

### Sauvegarde

Sauvegarder régulièrement :
- Tables de chat
- Dossier `uploads/chat/`
- Configuration de l'application

## Dépannage

### Problèmes Courants

1. **"Aucun agent assigné"** :
   - Vérifier la table `agent_prestataires`
   - Confirmer l'assignation client-agent

2. **Fichiers non accessibles** :
   - Vérifier les permissions du dossier `uploads/`
   - Confirmer la configuration du serveur statique

3. **Messages non reçus** :
   - Vérifier les logs du service de chat
   - Confirmer la création des notifications

4. **Erreurs de permissions** :
   - Vérifier l'authentification JWT
   - Confirmer les rôles utilisateur

### Commandes de Debug

```sql
-- Vérifier les assignations
SELECT * FROM agent_prestataires WHERE client_id = ?;

-- Vérifier les conversations
SELECT * FROM conversations WHERE client_id = ? OR agent_id = ?;

-- Vérifier les notifications non lues
SELECT * FROM chat_notifications WHERE user_id = ? AND is_read = FALSE;
```

## Conclusion

Ce système de chat est conçu pour être :
- **Évolutif** : Architecture modulaire permettant l'ajout de fonctionnalités
- **Sécurisé** : Contrôles d'accès stricts et validation des données
- **Performant** : Optimisations de base de données et interface réactive
- **Maintenable** : Code documenté et structure claire

Il s'intègre parfaitement avec l'écosystème Fusepoint existant tout en offrant une base solide pour les évolutions futures.