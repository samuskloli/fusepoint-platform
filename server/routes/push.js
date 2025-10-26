const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/auth');
const pushService = require('../services/pushService');

// Toutes les routes push nécessitent un utilisateur authentifié
router.use(authMiddleware);

// GET /api/push/vapidPublicKey - Récupérer la clé publique VAPID
router.get('/vapidPublicKey', async (req, res) => {
  try {
    const key = pushService.getPublicKey();
    if (!key) return res.status(503).json({ error: 'Service push non initialisé' });
    res.json({ publicKey: key });
  } catch (err) {
    console.error('Erreur vapidPublicKey:', err);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// POST /api/push/subscribe - Enregistrer l'abonnement push du navigateur/app
router.post('/subscribe', async (req, res) => {
  try {
    const subscription = req.body;
    if (!subscription || !subscription.endpoint || !subscription.keys) {
      return res.status(400).json({ error: 'Subscription invalide' });
    }
    const id = await pushService.saveSubscription(req.user.id, subscription);
    res.status(201).json({ success: true, id });
  } catch (err) {
    console.error('Erreur subscribe push:', err);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// POST /api/push/test - Envoyer une notification push de test à l'utilisateur courant
router.post('/test', async (req, res) => {
  try {
    const { title = 'Test Push', body = 'Push de test', url = '/' } = req.body || {};
    const payload = { title, body, url };
    const result = await pushService.sendToUser(req.user.id, payload);
    res.json(result);
  } catch (err) {
    console.error('Erreur test push:', err);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

module.exports = router;