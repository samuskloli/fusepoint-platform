#!/usr/bin/env node

const nodemailer = require('nodemailer');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

// Configuration SMTP depuis les variables d'environnement
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: parseInt(process.env.SMTP_PORT),
  secure: process.env.SMTP_SECURE === 'true',
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS
  }
});

async function sendTestEmail() {
  try {
    console.log('Configuration SMTP:');
    console.log('Host:', process.env.SMTP_HOST);
    console.log('Port:', process.env.SMTP_PORT);
    console.log('Secure:', process.env.SMTP_SECURE);
    console.log('User:', process.env.SMTP_USER);
    console.log('Pass:', process.env.SMTP_PASS ? '[DÉFINI]' : '[NON DÉFINI]');
    console.log('\n--- Test de connexion SMTP ---');
    
    // Vérifier la connexion SMTP
    await transporter.verify();
    console.log('✅ Connexion SMTP réussie!');
    
    // Configuration de l'email de test
    const mailOptions = {
      from: `"${process.env.EMAIL_FROM_NAME}" <${process.env.EMAIL_FROM}>`,
      to: 'samuskl@gmail.com',
      subject: 'Test Email - Fusepoint Platform',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #333;">Email de Test - Fusepoint Platform</h2>
          <p>Bonjour,</p>
          <p>Ceci est un email de test envoyé depuis la plateforme Fusepoint.</p>
          <p><strong>Détails du test :</strong></p>
          <ul>
            <li>Date d'envoi : ${new Date().toLocaleString('fr-FR')}</li>
            <li>Serveur SMTP : ${process.env.SMTP_HOST}</li>
            <li>Port : ${process.env.SMTP_PORT}</li>
            <li>Sécurisé : ${process.env.SMTP_SECURE}</li>
          </ul>
          <p>Si vous recevez cet email, la configuration SMTP fonctionne correctement.</p>
          <hr style="margin: 20px 0;">
          <p style="color: #666; font-size: 12px;">Fusepoint Platform - Test automatique</p>
        </div>
      `,
      text: `
Email de Test - Fusepoint Platform

Bonjour,

Ceci est un email de test envoyé depuis la plateforme Fusepoint.

Détails du test :
- Date d'envoi : ${new Date().toLocaleString('fr-FR')}
- Serveur SMTP : ${process.env.SMTP_HOST}
- Port : ${process.env.SMTP_PORT}
- Sécurisé : ${process.env.SMTP_SECURE}

Si vous recevez cet email, la configuration SMTP fonctionne correctement.

Fusepoint Platform - Test automatique
      `
    };
    
    console.log('\n--- Envoi de l\'email de test ---');
    console.log('Destinataire:', mailOptions.to);
    console.log('Sujet:', mailOptions.subject);
    
    // Envoyer l'email
    const info = await transporter.sendMail(mailOptions);
    
    console.log('\n✅ Email envoyé avec succès!');
    console.log('Message ID:', info.messageId);
    console.log('Réponse du serveur:', info.response);
    
  } catch (error) {
    console.error('\n❌ Erreur lors de l\'envoi de l\'email:');
    console.error('Type d\'erreur:', error.name);
    console.error('Message:', error.message);
    console.error('Code:', error.code);
    
    if (error.responseCode) {
      console.error('Code de réponse SMTP:', error.responseCode);
    }
    
    process.exit(1);
  }
}

// Exécuter le test
sendTestEmail();