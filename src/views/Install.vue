<template>
  <div class="install">
    <h1>Assistant d’installation Fusepoint</h1>
    <p class="muted">Suivez les étapes pour configurer la plateforme, comme WordPress/PrestaShop.</p>

    <ol class="steps">
      <li :class="{active: step===1}">1. Préchecks</li>
      <li :class="{active: step===2}">2. Base de données</li>
      <li :class="{active: step===3}">3. Initialisation</li>
      <li :class="{active: step===4}">4. Admin</li>
      <li :class="{active: step===5}">5. Finalisation</li>
    </ol>

    <section v-if="step===1" class="card">
      <h2>Étape 1 — Préchecks</h2>
      <button @click="loadStatus">Rafraîchir le statut</button>
      <div v-if="loading">Chargement…</div>
      <div v-else>
        <ul>
          <li>
            Route d’installation: <strong :class="status.installEnabled?'ok':'bad'">{{ status.installEnabled?'activée':'désactivée' }}</strong>
          </li>
          <li>
            Connexion DB: <strong :class="status.db?.ok?'ok':'bad'">{{ status.db?.ok?'OK':'Échec' }}</strong>
            <span v-if="status.db?.error" class="error">— {{ status.db.error }}</span>
          </li>
          <li>FRONTEND_URL: <code>{{ status.env?.FRONTEND_URL || 'manquant' }}</code></li>
          <li>API_BASE_URL: <code>{{ status.env?.API_BASE_URL || 'manquant' }}</code></li>
        </ul>
        <div v-if="status.missing?.length" class="warning">
          <strong>Variables manquantes:</strong> <code>{{ status.missing.join(', ') }}</code>
        </div>
      </div>
      <div class="actions"><button @click="nextStep">Continuer</button></div>
    </section>

    <section v-if="step===2" class="card">
      <h2>Étape 2 — Configurer la base de données</h2>
      <form @submit.prevent="testDb">
        <div class="grid">
          <label>Hôte<input v-model="db.host" placeholder="localhost" /></label>
          <label>Port<input v-model.number="db.port" type="number" placeholder="3306" /></label>
          <label>Utilisateur<input v-model="db.user" placeholder="root" /></label>
          <label>Mot de passe<input v-model="db.password" type="password" placeholder="••••••" /></label>
          <label>Base<input v-model="db.database" placeholder="fusepoint_db" /></label>
        </div>
        <button type="submit" :disabled="testing">{{ testing?'Test…':'Tester la connexion' }}</button>
        <div v-if="testResult" class="result" :class="testResult.ok?'ok':'bad'">
          {{ testResult.ok ? 'Connexion réussie' : 'Échec de connexion' }}
          <span v-if="testResult.error" class="error">— {{ testResult.error }}</span>
        </div>
      </form>
      <div class="actions"><button :disabled="!testResult?.ok" @click="nextStep">Suivant</button></div>
    </section>

    <section v-if="step===3" class="card">
      <h2>Étape 3 — Initialiser la base</h2>
      <p>Crée les tables MariaDB selon le schéma de l’application.</p>
      <button @click="initDb" :disabled="initializing">{{ initializing?'Initialisation…':'Initialiser la base' }}</button>
      <div v-if="initResult" class="result" :class="initResult.ok?'ok':'bad'">
        {{ initResult.ok ? 'Tables créées/validées' : 'Erreur initialisation' }}
        <span v-if="initResult.error" class="error">— {{ initResult.error }}</span>
      </div>
      <div class="actions"><button :disabled="!initResult?.ok" @click="nextStep">Suivant</button></div>
    </section>

    <section v-if="step===4" class="card">
      <h2>Étape 4 — Créer le compte administrateur</h2>
      <form @submit.prevent="createAdmin">
        <div class="grid">
          <label>Email<input v-model="admin.email" type="email" placeholder="admin@exemple.com" /></label>
          <label>Mot de passe<input v-model="admin.password" type="password" placeholder="••••••" /></label>
          <label>Prénom<input v-model="admin.firstName" placeholder="Admin" /></label>
          <label>Nom<input v-model="admin.lastName" placeholder="Principal" /></label>
        </div>
        <button type="submit" :disabled="creatingAdmin">{{ creatingAdmin?'Création…':'Créer l’admin' }}</button>
      </form>
      <div v-if="adminResult" class="result" :class="adminResult.ok?'ok':'bad'">
        {{ adminResult.ok ? 'Administrateur créé' : 'Échec de création' }}
        <span v-if="adminResult.error" class="error">— {{ adminResult.error }}</span>
      </div>
      <div class="actions"><button :disabled="!adminResult?.ok" @click="nextStep">Suivant</button></div>
    </section>

    <section v-if="step===5" class="card">
      <h2>Étape 5 — Finaliser et générer .env</h2>
      <p>Nous pouvons générer le contenu de votre fichier <code>.env</code>. Écriture côté serveur uniquement si <code>ALLOW_INSTALL_WRITE=true</code>.</p>
      <form @submit.prevent="generateEnv">
        <div class="grid">
          <label>FRONTEND_URL<input v-model="final.frontendUrl" placeholder="http://localhost:5175" /></label>
          <label>API_BASE_URL<input v-model="final.apiBaseUrl" placeholder="http://localhost:3000" /></label>
          <label>JWT_SECRET<input v-model="final.jwtSecret" placeholder="générez une chaîne longue" /></label>
          <label>ENCRYPTION_KEY<input v-model="final.encryptionKey" placeholder="générez une chaîne longue" /></label>
        </div>
        <button type="submit" :disabled="generating">{{ generating?'Génération…':'Générer .env' }}</button>
      </form>
      <div v-if="envResult">
        <p :class="envResult.written ? 'ok' : 'bad'">
          {{ envResult.written ? `Écrit dans ${envResult.filePath}` : 'Écriture désactivée — copiez-collez le contenu ci-dessous' }}
        </p>
        <pre class="env-content"><code>{{ envResult.content }}</code></pre>
      </div>

      <h3>Terminer</h3>
      <ul>
        <li>Ajoutez/mergez ce contenu dans <code>.env</code> (ou utilisez le fichier généré).</li>
        <li>Désactivez l’installation: <code>INSTALL_ENABLED=false</code>.</li>
        <li>Redémarrez le serveur Node.</li>
        <li>Connectez-vous avec l’admin créé, puis configurez les intégrations.</li>
      </ul>
    </section>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'

const step = ref(1)
const loading = ref(true)
const status = ref({})

const db = ref({ host: 'localhost', port: 3306, user: '', password: '', database: 'fusepoint_db' })
const testing = ref(false)
const testResult = ref(null)

const initializing = ref(false)
const initResult = ref(null)

const admin = ref({ email: '', password: '', firstName: 'Admin', lastName: 'Principal' })
const creatingAdmin = ref(false)
const adminResult = ref(null)

const final = ref({ frontendUrl: 'http://localhost:5175', apiBaseUrl: 'http://localhost:3000', jwtSecret: '', encryptionKey: '' })
const generating = ref(false)
const envResult = ref(null)

function nextStep() { if (step.value < 5) step.value++ }

async function loadStatus() {
  loading.value = true
  try {
    const res = await fetch('/api/install/status')
    status.value = await res.json()
  } catch (e) {
    status.value = { error: e?.message || String(e) }
  } finally {
    loading.value = false
  }
}

async function testDb() {
  testing.value = true
  testResult.value = null
  try {
    const res = await fetch('/api/install/db-test', {
      method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(db.value)
    })
    testResult.value = await res.json()
  } catch (e) {
    testResult.value = { ok: false, error: e?.message || String(e) }
  } finally {
    testing.value = false
  }
}

async function initDb() {
  initializing.value = true
  initResult.value = null
  try {
    const res = await fetch('/api/install/init-db', { method: 'POST' })
    initResult.value = await res.json()
  } catch (e) {
    initResult.value = { ok: false, error: e?.message || String(e) }
  } finally {
    initializing.value = false
  }
}

async function createAdmin() {
  creatingAdmin.value = true
  adminResult.value = null
  try {
    const res = await fetch('/api/install/create-admin', {
      method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(admin.value)
    })
    adminResult.value = await res.json()
  } catch (e) {
    adminResult.value = { ok: false, error: e?.message || String(e) }
  } finally {
    creatingAdmin.value = false
  }
}

async function generateEnv() {
  generating.value = true
  envResult.value = null
  try {
    const payload = { frontendUrl: final.value.frontendUrl, apiBaseUrl: final.value.apiBaseUrl, jwtSecret: final.value.jwtSecret, encryptionKey: final.value.encryptionKey, db: db.value }
    const res = await fetch('/api/install/generate-env', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) })
    envResult.value = await res.json()
  } catch (e) {
    envResult.value = { ok: false, error: e?.message || String(e) }
  } finally {
    generating.value = false
  }
}

onMounted(loadStatus)
</script>

<style scoped>
.install { max-width: 920px; margin: 24px auto; padding: 0 16px; }
.muted { color: #666; }
.steps { display: flex; list-style: none; gap: 8px; padding: 0; margin: 12px 0; }
.steps li { padding: 6px 10px; border-radius: 6px; border: 1px solid #ddd; }
.steps li.active { background: #f0f7ff; border-color: #8ab6ff; }
.card { border: 1px solid #ddd; border-radius: 8px; padding: 16px; margin-top: 16px; }
.grid { display: grid; grid-template-columns: repeat(2, minmax(0,1fr)); gap: 12px; }
label { display: flex; flex-direction: column; font-size: 14px; }
input { padding: 8px; border: 1px solid #ccc; border-radius: 6px; }
button { margin-top: 12px; padding: 8px 12px; }
.actions { margin-top: 12px; }
.ok { color: #13734b; }
.bad { color: #b00020; }
.error { margin-left: 8px; color: #b00020; }
.result { margin-top: 10px; }
.warning { margin-top: 8px; }
.env-content { background: #f6f6f6; padding: 8px; border-radius: 6px; white-space: pre-wrap; }
code { background: #f6f6f6; padding: 2px 6px; border-radius: 4px; }
</style>