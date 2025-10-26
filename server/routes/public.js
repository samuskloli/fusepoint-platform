const express = require('express');
const router = express.Router();
const BetaSignupService = require('../services/betaSignupService');

const betaService = new BetaSignupService();

// POST /api/public/beta-signup
// Inscription à la bêta (publique, sans authentification)
router.post('/beta-signup', async (req, res) => {
  try {
    const { company, contact, usecase, first_name, last_name } = req.body || {};

    // Rendre l'entreprise optionnelle, ne valider que l'email
    if (!contact) {
      return res.status(400).json({ success: false, message: 'Email requis' });
    }

    // Validation simple email
    const emailOk = /.+@.+\..+/.test(String(contact));
    if (!emailOk) {
      return res.status(400).json({ success: false, message: 'Email invalide' });
    }

    // Passer une chaîne vide pour company si absente
    const signup = await betaService.createSignup({
      company: String(company || '').trim(),
      first_name: String(first_name || '').trim(),
      last_name: String(last_name || '').trim(),
      contact: String(contact).trim(),
      usecase: String(usecase || '').trim()
    });

    res.status(201).json({ success: true, data: signup });
  } catch (error) {
    console.error('❌ Erreur beta-signup:', error);
    res.status(500).json({ success: false, message: 'Erreur serveur', error: error.message });
  }
});

module.exports = router;