const fs = require('fs');
const path = require('path');
let webpush;
try {
  webpush = require('web-push');
} catch (e) {
  console.warn('web-push non installé. Installez-le pour activer les notifications push.');
}
const databaseService = require('./databaseService');

const VAPID_CONFIG_PATH = path.join(__dirname, '../config/vapid.json');

class PushService {
  constructor() {
    this.vapid = {
      publicKey: process.env.VAPID_PUBLIC_KEY || null,
      privateKey: process.env.VAPID_PRIVATE_KEY || null,
      mailto: process.env.VAPID_MAILTO || process.env.SMTP_FROM || 'mailto:admin@example.com'
    };
    this.initialized = false;
    this._init();
  }

  _init() {
    try {
      if (!webpush) return; // Dépendance manquante
      // Charger depuis fichier si env absent
      if (!this.vapid.publicKey || !this.vapid.privateKey) {
        if (fs.existsSync(VAPID_CONFIG_PATH)) {
          const json = JSON.parse(fs.readFileSync(VAPID_CONFIG_PATH, 'utf8'));
          this.vapid.publicKey = json.publicKey;
          this.vapid.privateKey = json.privateKey;
          this.vapid.mailto = json.mailto || this.vapid.mailto;
        } else {
          // Générer et persister des clés VAPID
          const keys = webpush.generateVAPIDKeys();
          this.vapid.publicKey = keys.publicKey;
          this.vapid.privateKey = keys.privateKey;
          fs.mkdirSync(path.dirname(VAPID_CONFIG_PATH), { recursive: true });
          fs.writeFileSync(VAPID_CONFIG_PATH, JSON.stringify({
            publicKey: this.vapid.publicKey,
            privateKey: this.vapid.privateKey,
            mailto: this.vapid.mailto
          }, null, 2));
          console.log('🔐 Clés VAPID générées et stockées dans', VAPID_CONFIG_PATH);
        }
      }

      webpush.setVapidDetails(this.vapid.mailto, this.vapid.publicKey, this.vapid.privateKey);
      this.initialized = true;
    } catch (err) {
      console.error('❌ Échec initialisation VAPID:', err);
      this.initialized = false;
    }
  }

  getPublicKey() {
    return this.vapid.publicKey || null;
  }

  async ensureTable() {
    const sql = `
      CREATE TABLE IF NOT EXISTS push_subscriptions (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT NOT NULL,
        endpoint TEXT NOT NULL,
        p256dh TEXT NOT NULL,
        auth TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP NULL ON UPDATE CURRENT_TIMESTAMP,
        UNIQUE KEY uniq_endpoint (endpoint(255))
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `;
    await databaseService.run(sql, []);
  }

  async saveSubscription(userId, subscription) {
    if (!subscription || !subscription.endpoint || !subscription.keys) {
      throw new Error('Subscription invalide');
    }
    await this.ensureTable();
    const { endpoint, keys } = subscription;
    const { p256dh, auth } = keys;

    // Upsert par endpoint
    const select = await databaseService.get('SELECT id FROM push_subscriptions WHERE endpoint = ?', [endpoint]);
    if (select && select.id) {
      await databaseService.run(
        'UPDATE push_subscriptions SET user_id=?, p256dh=?, auth=? WHERE id=?',
        [userId, p256dh, auth, select.id]
      );
      return select.id;
    } else {
      const res = await databaseService.run(
        'INSERT INTO push_subscriptions (user_id, endpoint, p256dh, auth) VALUES (?, ?, ?, ?)',
        [userId, endpoint, p256dh, auth]
      );
      return res.insertId;
    }
  }

  async getUserSubscriptions(userId) {
    await this.ensureTable();
    return databaseService.query(
      'SELECT id, endpoint, p256dh, auth FROM push_subscriptions WHERE user_id = ?',
      [userId]
    );
  }

  async sendToUser(userId, payload) {
    if (!this.initialized || !webpush) return { success: false, error: 'web-push non initialisé' };
    const subs = await this.getUserSubscriptions(userId);
    if (!subs || subs.length === 0) return { success: false, error: 'Aucun abonnement' };

    const results = [];
    for (const s of subs) {
      const subscription = {
        endpoint: s.endpoint,
        keys: { p256dh: s.p256dh, auth: s.auth }
      };
      try {
        const r = await webpush.sendNotification(subscription, JSON.stringify(payload));
        results.push({ id: s.id, success: true, statusCode: r.statusCode || 201 });
      } catch (err) {
        console.warn('⚠️ Échec envoi push à', s.endpoint, err && err.message);
        results.push({ id: s.id, success: false, error: err && err.message });
      }
    }
    return { success: true, results };
  }
}

module.exports = new PushService();