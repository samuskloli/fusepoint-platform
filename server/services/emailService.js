const nodemailer = require('nodemailer');
const path = require('path');
const fs = require('fs');

/**
 * Service d'envoi d'emails pour Fusepoint Hub
 * Gère l'envoi d'emails de confirmation, notifications et autres communications
 */
class EmailService {
  constructor() {
    this.transporter = null;
    this.fromEmail = process.env.EMAIL_FROM || 'noreply@fusepoint.com';
    this.fromName = process.env.EMAIL_FROM_NAME || 'Fusepoint Hub';
    this.frontendUrl = null; // Sera chargé dynamiquement
    this.baseUrl = null; // Sera chargé dynamiquement
    this.platformSettingsService = null; // Sera initialisé plus tard
    this.initializeTransporter();
  }

  /**
   * Initialiser le service de paramètres de plateforme
   */
  initializePlatformSettings() {
    if (!this.platformSettingsService) {
      try {
        const PlatformSettingsService = require('./platformSettingsService');
        this.platformSettingsService = new PlatformSettingsService();
      } catch (error) {
        console.warn('⚠️ Impossible de charger platformSettingsService:', error.message);
      }
    }
  }

  /**
   * Obtenir l'URL frontend depuis les paramètres de plateforme ou fallback
   */
  async getFrontendUrl() {
    // Si déjà en cache, retourner directement
    if (this.frontendUrl) {
      return this.frontendUrl;
    }

    // Initialiser le service de paramètres si nécessaire
    this.initializePlatformSettings();

    try {
      // Essayer de récupérer depuis les paramètres de plateforme
      if (this.platformSettingsService) {
        const setting = await this.platformSettingsService.getSetting('frontend_url');
        if (setting && setting.value) {
        this.frontendUrl = setting.value;
          console.log('✅ URL frontend chargée depuis les paramètres de plateforme:', this.frontendUrl);
          return this.frontendUrl;
        }
      }
    } catch (error) {
      console.warn('⚠️ Impossible de récupérer frontend_url depuis la base de données:', error.message);
    }

    // Fallback vers les variables d'environnement
    if (process.env.FRONTEND_URL) {
      this.frontendUrl = process.env.FRONTEND_URL;
      console.log('✅ URL frontend chargée depuis les variables d\'environnement:', this.frontendUrl);
      return this.frontendUrl;
    }
    
    // Détection automatique selon l'environnement
    if (process.env.NODE_ENV === 'production') {
      console.error('❌ ERREUR CRITIQUE : FRONTEND_URL non définie en production !');
      console.error('⚠️ Les liens d\'email ne fonctionneront pas correctement.');
      console.error('💡 Définissez frontend_url dans les paramètres de plateforme ou FRONTEND_URL dans .env');
      throw new Error('FRONTEND_URL requis en production');
    }
    
    console.log('ℹ️ Utilisation de l\'URL de développement par défaut');
    this.frontendUrl = 'http://localhost:5173';
    return this.frontendUrl;
  }

  /**
   * Obtenir l'URL de base
   */
  async getBaseUrl() {
    if (!this.baseUrl) {
      this.baseUrl = process.env.BASE_URL || await this.getFrontendUrl();
    }
    return this.baseUrl;
  }

  /**
   * Valider qu'aucune URL localhost n'est utilisée en production
   */
  async validateProductionUrls() {
    if (process.env.NODE_ENV === 'production') {
      const frontendUrl = await this.getFrontendUrl();
      const baseUrl = await this.getBaseUrl();
      const urls = [frontendUrl, baseUrl];
      
      urls.forEach(url => {
        if (url && url.includes('localhost')) {
          console.error(`❌ URL localhost détectée en production : ${url}`);
          throw new Error(`URL localhost non autorisée en production : ${url}`);
        }
      });
      
      console.log('✅ URLs de production validées');
    }
  }

  /**
   * Initialiser le transporteur d'email
   */
  async initializeTransporter() {
    try {
      console.log('🔧 Initialisation du service email...');
      console.log('🔧 NODE_ENV:', process.env.NODE_ENV);
      console.log('🔧 SMTP_HOST:', process.env.SMTP_HOST);
      console.log('🔧 SMTP_PORT:', process.env.SMTP_PORT);
      console.log('🔧 SMTP_SECURE:', process.env.SMTP_SECURE);
      console.log('🔧 SMTP_USER:', process.env.SMTP_USER);
      console.log('🔧 EMAIL_FROM:', process.env.EMAIL_FROM);
      
      // Configuration pour localhost - utilise Ethereal Email pour les tests
      if (process.env.NODE_ENV === 'development' && !process.env.SMTP_HOST) {
        // Créer un compte de test Ethereal Email
        const testAccount = await nodemailer.createTestAccount();
        
        this.transporter = nodemailer.createTransport({
          host: 'smtp.ethereal.email',
          port: 587,
          secure: false,
          auth: {
            user: testAccount.user,
            pass: testAccount.pass
          }
        });
        
        console.log('📧 Service email initialisé avec Ethereal Email (test)');
        console.log('📧 User:', testAccount.user);
        console.log('📧 Pass:', testAccount.pass);
      } else if (process.env.SMTP_HOST) {
        // Configuration SMTP personnalisée (Infomaniak)
        const smtpConfig = {
          host: process.env.SMTP_HOST,
          port: parseInt(process.env.SMTP_PORT) || 587,
          secure: process.env.SMTP_SECURE === 'true',
          auth: {
            user: process.env.SMTP_USER,
            pass: process.env.SMTP_PASS
          },
          // Options supplémentaires pour Infomaniak
          tls: {
            rejectUnauthorized: false
          }
        };
        
        console.log('📧 Configuration SMTP:', {
          host: smtpConfig.host,
          port: smtpConfig.port,
          secure: smtpConfig.secure,
          user: smtpConfig.auth.user
        });
        
        this.transporter = nodemailer.createTransport(smtpConfig);
        
        console.log('📧 Service email initialisé avec SMTP Infomaniak');
      } else {
        throw new Error('Aucune configuration SMTP trouvée');
      }
      
      // Vérifier la connexion (non bloquant)
      try {
        await this.transporter.verify();
        // Succès silencieux pour éviter les doublons de logs
      } catch (verifyError) {
        console.warn('⚠️ Impossible de vérifier la connexion SMTP:', verifyError.message);
        console.warn('⚠️ Le service email continuera sans vérification');
      }
      
    } catch (error) {
      console.error('❌ Erreur initialisation service email:', error);
      console.error('❌ Détails de l\'erreur:', error.message);
      
      // Fallback vers un transporteur de test
      console.log('⚠️ Utilisation du transporteur de fallback');
      this.transporter = nodemailer.createTransport({
        streamTransport: true,
        newline: 'unix',
        buffer: true
      });
    }
  }

  /**
   * Template HTML de base pour les emails
   */
  getBaseTemplate(title, content, actionButton = null) {
    const buttonHtml = actionButton ? `
      <div style="text-align: center; margin: 30px 0;">
        <a href="${actionButton.url}" style="
          background-color: #3B82F6;
          color: white;
          padding: 12px 24px;
          text-decoration: none;
          border-radius: 6px;
          font-weight: 600;
          display: inline-block;
        ">${actionButton.text}</a>
      </div>
    ` : '';

    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>${title}</title>
      </head>
      <body style="
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        line-height: 1.6;
        color: #333;
        max-width: 600px;
        margin: 0 auto;
        padding: 20px;
      ">
        <div style="
          background: linear-gradient(135deg, #3B82F6 0%, #1E40AF 100%);
          color: white;
          padding: 30px;
          text-align: center;
          border-radius: 8px 8px 0 0;
        ">
          <h1 style="margin: 0; font-size: 28px; font-weight: 700;">
            Fusepoint Hub
          </h1>
        </div>
        
        <div style="
          background: white;
          padding: 40px;
          border: 1px solid #E5E7EB;
          border-top: none;
          border-radius: 0 0 8px 8px;
        ">
          <h2 style="color: #1F2937; margin-top: 0;">${title}</h2>
          
          ${content}
          
          ${buttonHtml}
          
          <hr style="border: none; border-top: 1px solid #E5E7EB; margin: 30px 0;">
          
          <p style="color: #6B7280; font-size: 14px; margin: 0;">
            Cet email a été envoyé par Fusepoint Hub.<br>
            Si vous avez des questions, contactez-nous à info@fusepoint.ch
          </p>
        </div>
      </body>
      </html>
    `;
  }

  /**
   * Envoyer un email de confirmation de création de compte
   */
  async sendAccountConfirmation(userEmail, userName, confirmationToken) {
    try {
      console.log('📧 Tentative d\'envoi d\'email de confirmation pour:', userEmail);
      
      // Attendre que le transporteur soit initialisé
      if (!this.transporter) {
        console.log('⏳ Attente de l\'initialisation du transporteur...');
        await new Promise(resolve => setTimeout(resolve, 2000));
      }
      
      if (!this.transporter) {
        throw new Error('Transporteur email non initialisé');
      }
      
      // Validation des URLs en production
      await this.validateProductionUrls();
      
      const frontendUrl = await this.getFrontendUrl();
      const confirmationUrl = `${frontendUrl}/confirm-account?token=${confirmationToken}`;
      
      const content = `
        <p>Bonjour <strong>${userName}</strong>,</p>
        
        <p>Bienvenue sur Fusepoint Hub ! Votre compte a été créé avec succès.</p>
        
        <p>Pour activer votre compte et commencer à utiliser nos services, veuillez cliquer sur le bouton ci-dessous :</p>
        
        <div style="background: #F3F4F6; padding: 20px; border-radius: 6px; margin: 20px 0;">
          <p style="margin: 0; font-size: 14px; color: #6B7280;">
            <strong>Email :</strong> ${userEmail}<br>
            <strong>Plateforme :</strong> Fusepoint Hub
          </p>
        </div>
        
        <p>Ce lien de confirmation expirera dans 24 heures pour des raisons de sécurité.</p>
        
        <p>Si vous n'avez pas créé ce compte, vous pouvez ignorer cet email en toute sécurité.</p>
      `;
      
      const actionButton = {
        url: confirmationUrl,
        text: 'Confirmer mon compte'
      };
      
      const html = this.getBaseTemplate('Confirmez votre compte', content, actionButton);
      
      const mailOptions = {
        from: `"${this.fromName}" <${this.fromEmail}>`,
        to: userEmail,
        subject: 'Confirmation de votre compte Fusepoint Hub',
        html: this.getBaseTemplate('Confirmation de compte', content)
      };
      
      console.log('📧 Options d\'email:', {
        from: mailOptions.from,
        to: mailOptions.to,
        subject: mailOptions.subject
      });
      
      const result = await this.transporter.sendMail(mailOptions);
      
      console.log('✅ Email de confirmation envoyé avec succès:', {
        messageId: result.messageId,
        to: userEmail
      });
      
      return {
        success: true,
        messageId: result.messageId,
        previewUrl: nodemailer.getTestMessageUrl(result)
      };
      
    } catch (error) {
      console.error('❌ Erreur envoi email de confirmation:', error);
      console.error('❌ Détails:', {
        email: userEmail,
        error: error.message,
        stack: error.stack
      });
      throw error;
    }
  }

  /**
   * Envoyer un email de bienvenue après confirmation
   */
  async sendWelcomeEmail(userEmail, userName) {
    try {
      // Attendre que le transporteur soit initialisé
      if (!this.transporter) {
        await new Promise(resolve => setTimeout(resolve, 2000));
      }
      const frontendUrl = await this.getFrontendUrl();
      const dashboardUrl = `${frontendUrl}/dashboard`;
      
      const content = `
        <p>Bonjour <strong>${userName}</strong>,</p>
        
        <p>🎉 Félicitations ! Votre compte Fusepoint Hub est maintenant activé et prêt à l'emploi.</p>
        
        <p>Vous pouvez maintenant accéder à toutes nos fonctionnalités :</p>
        
        <ul style="color: #374151; padding-left: 20px;">
          <li>📊 Tableau de bord analytique complet</li>
          <li>🤖 Assistant IA pour le marketing</li>
          <li>📱 Gestion des réseaux sociaux</li>
          <li>📧 Outils d'email marketing</li>
          <li>💬 Support client intégré</li>
        </ul>
        
        <p>Notre équipe est là pour vous accompagner dans votre réussite digitale.</p>
        
        <p>Bonne découverte de la plateforme !</p>
      `;
      
      const actionButton = {
        url: dashboardUrl,
        text: 'Accéder au tableau de bord'
      };
      
      const html = this.getBaseTemplate('Bienvenue sur Fusepoint !', content, actionButton);
      
      const mailOptions = {
        from: `"${this.fromName}" <${this.fromEmail}>`,
        to: userEmail,
        subject: '🎉 Bienvenue sur Fusepoint Hub !',
        html: html,
        text: `Bonjour ${userName},\n\nFélicitations ! Votre compte est activé.\n\nAccédez à votre tableau de bord : ${dashboardUrl}\n\nÉquipe Fusepoint`
      };
      
      const result = await this.transporter.sendMail(mailOptions);
      
      if (process.env.NODE_ENV === 'development') {
        console.log('📧 Email de bienvenue envoyé:', nodemailer.getTestMessageUrl(result));
      }
      
      return {
        success: true,
        messageId: result.messageId,
        previewUrl: nodemailer.getTestMessageUrl(result)
      };
      
    } catch (error) {
      console.error('❌ Erreur envoi email bienvenue:', error);
      throw error;
    }
  }

  /**
   * Envoyer un email de réinitialisation de mot de passe
   */
  async sendPasswordReset(userEmail, userName, resetToken) {
    try {
      // Attendre que le transporteur soit initialisé
      if (!this.transporter) {
        await new Promise(resolve => setTimeout(resolve, 2000));
      }
      // Validation des URLs en production
      await this.validateProductionUrls();
      
      const frontendUrl = await this.getFrontendUrl();
      const resetUrl = `${frontendUrl}/reset-password?token=${resetToken}`;
      
      const content = `
        <p>Bonjour <strong>${userName}</strong>,</p>
        
        <p>Vous avez demandé la réinitialisation de votre mot de passe pour votre compte Fusepoint Hub.</p>
        
        <p>Cliquez sur le bouton ci-dessous pour créer un nouveau mot de passe :</p>
        
        <div style="background: #FEF3C7; border: 1px solid #F59E0B; padding: 15px; border-radius: 6px; margin: 20px 0;">
          <p style="margin: 0; color: #92400E; font-size: 14px;">
            ⚠️ <strong>Important :</strong> Ce lien expire dans 1 heure pour votre sécurité.
          </p>
        </div>
        
        <p>Si vous n'avez pas demandé cette réinitialisation, ignorez cet email. Votre mot de passe actuel reste inchangé.</p>
      `;
      
      const actionButton = {
        url: resetUrl,
        text: 'Réinitialiser mon mot de passe'
      };
      
      const html = this.getBaseTemplate('Réinitialisation de mot de passe', content, actionButton);
      
      const mailOptions = {
        from: `"${this.fromName}" <${this.fromEmail}>`,
        to: userEmail,
        subject: 'Réinitialisation de votre mot de passe',
        html: html,
        text: `Bonjour ${userName},\n\nRéinitialisez votre mot de passe : ${resetUrl}\n\nCe lien expire dans 1 heure.\n\nÉquipe Fusepoint`
      };
      
      const result = await this.transporter.sendMail(mailOptions);
      
      if (process.env.NODE_ENV === 'development') {
        console.log('📧 Email de réinitialisation envoyé:', nodemailer.getTestMessageUrl(result));
      }
      
      return {
        success: true,
        messageId: result.messageId,
        previewUrl: nodemailer.getTestMessageUrl(result)
      };
      
    } catch (error) {
      console.error('❌ Erreur envoi email réinitialisation:', error);
      throw error;
    }
  }

  /**
   * Envoyer une notification par email
   */
  async sendNotification(userEmail, userName, notificationType, title, message, actionUrl = null) {
    try {
      const typeEmojis = {
        'info': 'ℹ️',
        'success': '✅',
        'warning': '⚠️',
        'error': '❌',
        'update': '🔄',
        'message': '💬'
      };
      
      const emoji = typeEmojis[notificationType] || '📢';
      
      const content = `
        <p>Bonjour <strong>${userName}</strong>,</p>
        
        <div style="background: #F3F4F6; border-left: 4px solid #3B82F6; padding: 20px; margin: 20px 0;">
          <h3 style="margin: 0 0 10px 0; color: #1F2937;">${emoji} ${title}</h3>
          <p style="margin: 0; color: #4B5563;">${message}</p>
        </div>
        
        <p>Cette notification a été générée automatiquement par votre compte Fusepoint Hub.</p>
      `;
      
      const frontendUrl = await this.getFrontendUrl();
      const actionButton = actionUrl ? {
        url: actionUrl,
        text: 'Voir les détails'
      } : null;
      
      const html = this.getBaseTemplate('Nouvelle notification', content, actionButton);
      
      const mailOptions = {
        from: `"${this.fromName}" <${this.fromEmail}>`,
        to: userEmail,
        subject: `${emoji} ${title} - Fusepoint Hub`,
        html: html,
        text: `Bonjour ${userName},\n\n${title}\n${message}\n\n${actionUrl ? 'Lien : ' + actionUrl : ''}\n\nÉquipe Fusepoint`
      };
      
      const result = await this.transporter.sendMail(mailOptions);
      
      if (process.env.NODE_ENV === 'development') {
        console.log('📧 Email de notification envoyé:', nodemailer.getTestMessageUrl(result));
      }
      
      return {
        success: true,
        messageId: result.messageId,
        previewUrl: nodemailer.getTestMessageUrl(result)
      };
      
    } catch (error) {
      console.error('❌ Erreur envoi notification email:', error);
      throw error;
    }
  }

  /**
   * Envoyer un email depuis le tableau de bord agent
   */
  async sendAgentEmail(emailData) {
    try {
      // Attendre que le transporteur soit initialisé
      if (!this.transporter) {
        await new Promise(resolve => setTimeout(resolve, 2000));
      }
      
      const { to, subject, content, clientName, agentName, agentEmail } = emailData;
      
      const emailContent = `
        <p>Bonjour <strong>${clientName}</strong>,</p>
        
        <div style="background: #F8FAFC; border: 1px solid #E2E8F0; padding: 20px; border-radius: 8px; margin: 20px 0;">
          ${content.replace(/\n/g, '<br>')}
        </div>
        
        <hr style="border: none; border-top: 1px solid #E5E7EB; margin: 30px 0;">
        
        <p style="color: #6B7280; font-size: 14px; margin: 0;">
          Ce message vous a été envoyé par <strong>${agentName}</strong> depuis votre espace client Fusepoint Hub.<br>
          Pour toute question, vous pouvez répondre directement à cet email ou nous contacter via la plateforme.
        </p>
      `;
      
      const frontendUrl = await this.getFrontendUrl();
      const actionButton = {
        url: `${frontendUrl}/dashboard`,
        text: 'Accéder à mon espace client'
      };
      
      const html = this.getBaseTemplate(subject, emailContent, actionButton);
      
      const mailOptions = {
        from: `"${agentName} - Fusepoint Hub" <${this.fromEmail}>`,
        to: to,
        replyTo: agentEmail,
        subject: `[Fusepoint Hub] ${subject}`,
        html: html,
        text: `Bonjour ${clientName},\n\n${content}\n\n---\nMessage envoyé par ${agentName}\nFusepoint Hub\n\nAccédez à votre espace : ${frontendUrl}/dashboard`
      };
      
      const result = await this.transporter.sendMail(mailOptions);
      
      if (process.env.NODE_ENV === 'development') {
        console.log('📧 Email agent envoyé:', nodemailer.getTestMessageUrl(result));
      }
      
      return {
        success: true,
        messageId: result.messageId,
        previewUrl: nodemailer.getTestMessageUrl(result)
      };
      
    } catch (error) {
      console.error('❌ Erreur envoi email agent:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Envoyer un email de bienvenue pour un compte créé par un agent
   */
  async sendWelcomeEmail(emailData) {
    try {
      // Attendre que le transporteur soit initialisé
      if (!this.transporter) {
        await new Promise(resolve => setTimeout(resolve, 2000));
      }
      
      const { to, subject, clientName, agentName, firstLoginToken, companyName } = emailData;
      
      const content = `
         <p>Bonjour <strong>${clientName}</strong>,</p>
        
         <p>Nous avons le plaisir de vous informer qu'un compte Fusepoint Hub a été créé pour vous par notre équipe.</p>
        
        <div style="background: #F0F9FF; border: 1px solid #0EA5E9; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3 style="margin: 0 0 15px 0; color: #0C4A6E;">🎉 Bienvenue dans l'écosystème Fusepoint !</h3>
          <p style="margin: 0; color: #0369A1;">
            Votre compte a été configuré par <strong>${agentName}</strong>, un membre de notre équipe Fusepoint.
          </p>
        </div>
        
        <div style="background: #F8FAFC; border: 1px solid #E2E8F0; padding: 20px; border-radius: 8px; margin: 20px 0;">
           <h4 style="margin: 0 0 10px 0; color: #1F2937;">📋 Informations de votre compte :</h4>
           <p style="margin: 5px 0; color: #4B5563;"><strong>Email :</strong> ${to}</p>
           ${companyName ? `<p style="margin: 5px 0; color: #4B5563;"><strong>Entreprise :</strong> ${companyName}</p>` : ''}
         </div>
         
         <div style="background: #DBEAFE; border: 1px solid #3B82F6; padding: 15px; border-radius: 6px; margin: 20px 0;">
           <p style="margin: 0; color: #1E40AF; font-size: 14px;">
             🔐 <strong>Première connexion :</strong> Cliquez sur le bouton ci-dessous pour définir votre mot de passe et accéder à votre compte.
           </p>
         </div>
        
        <p>Avec Fusepoint Hub, vous pourrez :</p>
        <ul style="color: #4B5563; padding-left: 20px;">
          <li>Gérer vos projets et services</li>
          <li>Communiquer directement avec notre équipe</li>
          <li>Suivre l'avancement de vos demandes</li>
          <li>Accéder à vos documents et rapports</li>
        </ul>
        
        <p>Notre équipe reste à votre disposition pour vous accompagner dans la prise en main de la plateforme.</p>
      `;
      
      // Validation des URLs en production
      this.validateProductionUrls();
      
      const actionButton = {
         url: `${this.frontendUrl}/set-password?token=${firstLoginToken}`,
         text: 'Définir mon mot de passe'
       };
      
      const html = this.getBaseTemplate(subject, content, actionButton);
      
      const mailOptions = {
        from: `"${agentName} - Fusepoint Hub" <${this.fromEmail}>`,
        to: to,
        subject: subject,
        html: html,
        text: `Bonjour ${clientName},\n\nVotre compte Fusepoint Hub a été créé par ${agentName}.\n\nInformations de votre compte :\nEmail : ${to}\n${companyName ? `Entreprise : ${companyName}\n` : ''}\nDéfinissez votre mot de passe : ${this.frontendUrl}/set-password?token=${firstLoginToken}\n\nÉquipe Fusepoint`
      };
      
      const result = await this.transporter.sendMail(mailOptions);
      
      if (process.env.NODE_ENV === 'development') {
        console.log('📧 Email de bienvenue envoyé:', nodemailer.getTestMessageUrl(result));
      }
      
      return {
        success: true,
        messageId: result.messageId,
        previewUrl: nodemailer.getTestMessageUrl(result)
      };
      
    } catch (error) {
      console.error('❌ Erreur envoi email de bienvenue:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Envoyer un email de notification d'activation de compte
   */
  async sendClientActivationEmail(clientData) {
    try {
      console.log('📧 Tentative d\'envoi d\'email d\'activation client pour:', clientData.email);
      
      // Attendre que le transporteur soit initialisé
      if (!this.transporter) {
        console.log('⏳ Attente de l\'initialisation du transporteur...');
        await new Promise(resolve => setTimeout(resolve, 2000));
      }
      
      if (!this.transporter) {
        throw new Error('Transporteur email non initialisé');
      }
      
      const { email, firstName, lastName, agentName } = clientData;
      const clientName = `${firstName} ${lastName}`;
      
      const content = `
        <p>Bonjour <strong>${clientName}</strong>,</p>
        
        <div style="background: #DCFCE7; border: 1px solid #16A34A; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3 style="margin: 0 0 15px 0; color: #15803D;">🎉 Votre compte a été activé !</h3>
          <p style="margin: 0; color: #166534;">
            Nous avons le plaisir de vous informer que votre compte Fusepoint Hub est maintenant <strong>actif</strong>.
          </p>
        </div>
        
        <p>Vous pouvez désormais accéder à l'ensemble de nos services et fonctionnalités :</p>
        <ul style="color: #4B5563; padding-left: 20px;">
          <li>✅ Gestion complète de vos projets</li>
          <li>✅ Communication directe avec notre équipe</li>
          <li>✅ Suivi en temps réel de vos demandes</li>
          <li>✅ Accès à tous vos documents et rapports</li>
          <li>✅ Support prioritaire</li>
        </ul>
        
        <div style="background: #F0F9FF; border: 1px solid #0EA5E9; padding: 15px; border-radius: 6px; margin: 20px 0;">
          <p style="margin: 0; color: #0369A1; font-size: 14px;">
            💡 <strong>Conseil :</strong> Connectez-vous dès maintenant pour découvrir toutes les nouveautés disponibles dans votre espace client.
          </p>
        </div>
        
        <p>Notre équipe reste à votre entière disposition pour vous accompagner.</p>
        
        <hr style="border: none; border-top: 1px solid #E5E7EB; margin: 30px 0;">
        
        <p style="color: #6B7280; font-size: 14px; margin: 0;">
          Activation effectuée par <strong>${agentName}</strong> - Équipe Fusepoint Hub
        </p>
      `;
      
      // Validation des URLs en production
      await this.validateProductionUrls();
      
      const frontendUrl = await this.getFrontendUrl();
      const actionButton = {
        url: `${frontendUrl}/dashboard`,
        text: 'Accéder à mon espace client'
      };
      
      const html = this.getBaseTemplate('Compte activé - Fusepoint Hub', content, actionButton);
      
      const mailOptions = {
        from: `"${this.fromName}" <${this.fromEmail}>`,
        to: email,
        subject: '🎉 Votre compte Fusepoint Hub est maintenant actif !',
        html: html,
        text: `Bonjour ${clientName},\n\nVotre compte Fusepoint Hub a été activé avec succès !\n\nVous pouvez maintenant accéder à tous nos services depuis votre espace client.\n\nConnectez-vous : ${frontendUrl}/dashboard\n\nActivation effectuée par ${agentName}\nÉquipe Fusepoint Hub`
      };
      
      console.log('📧 Options d\'email d\'activation:', {
        from: mailOptions.from,
        to: mailOptions.to,
        subject: mailOptions.subject
      });
      
      const result = await this.transporter.sendMail(mailOptions);
      
      if (process.env.NODE_ENV === 'development') {
        console.log('📧 Email d\'activation envoyé:', nodemailer.getTestMessageUrl(result));
      }
      
      console.log('✅ Email d\'activation client envoyé avec succès:', {
        messageId: result.messageId,
        to: email
      });
      
      return {
        success: true,
        messageId: result.messageId,
        previewUrl: nodemailer.getTestMessageUrl(result)
      };
      
    } catch (error) {
      console.error('❌ Erreur envoi email d\'activation:', error);
      console.error('❌ Détails:', {
        email: clientData.email,
        error: error.message,
        stack: error.stack
      });
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Envoyer un email de notification de désactivation de compte
   */
  async sendClientDeactivationEmail(clientData) {
    try {
      console.log('📧 Tentative d\'envoi d\'email de désactivation client pour:', clientData.email);
      
      // Attendre que le transporteur soit initialisé
      if (!this.transporter) {
        console.log('⏳ Attente de l\'initialisation du transporteur...');
        await new Promise(resolve => setTimeout(resolve, 2000));
      }
      
      if (!this.transporter) {
        throw new Error('Transporteur email non initialisé');
      }
      
      const { email, firstName, lastName, agentName, agentEmail } = clientData;
      const clientName = `${firstName} ${lastName}`;
      
      const content = `
        <p>Bonjour <strong>${clientName}</strong>,</p>
        
        <div style="background: #FEF2F2; border: 1px solid #EF4444; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3 style="margin: 0 0 15px 0; color: #DC2626;">⚠️ Votre compte a été temporairement désactivé</h3>
          <p style="margin: 0; color: #991B1B;">
            Nous vous informons que votre compte Fusepoint Hub a été <strong>temporairement désactivé</strong>.
          </p>
        </div>
        
        <p>Cette désactivation peut être due à :</p>
        <ul style="color: #4B5563; padding-left: 20px;">
          <li>Une demande de votre part</li>
          <li>Une mise à jour de votre dossier en cours</li>
          <li>Des raisons administratives temporaires</li>
        </ul>
        
        <div style="background: #FFFBEB; border: 1px solid #F59E0B; padding: 15px; border-radius: 6px; margin: 20px 0;">
          <p style="margin: 0; color: #92400E; font-size: 14px;">
            💡 <strong>Important :</strong> Cette désactivation est temporaire. Vous pourrez retrouver l'accès à votre compte une fois la situation résolue.
          </p>
        </div>
        
        <p>Pour toute question ou pour demander la réactivation de votre compte, n'hésitez pas à nous contacter :</p>
        <ul style="color: #4B5563; padding-left: 20px;">
          <li>📧 Email : <a href="mailto:${agentEmail}" style="color: #2563EB;">${agentEmail}</a></li>
          <li>📞 Téléphone : +33 1 23 45 67 89</li>
        </ul>
        
        <p>Notre équipe reste à votre disposition pour vous accompagner.</p>
        
        <hr style="border: none; border-top: 1px solid #E5E7EB; margin: 30px 0;">
        
        <p style="color: #6B7280; font-size: 14px; margin: 0;">
          Désactivation effectuée par <strong>${agentName}</strong> - Équipe Fusepoint Hub
        </p>
      `;
      
      // Validation des URLs en production
      await this.validateProductionUrls();
      
      const frontendUrl = await this.getFrontendUrl();
      const actionButton = {
        url: `mailto:${agentEmail}`,
        text: 'Nous contacter'
      };
      
      const html = this.getBaseTemplate('Compte temporairement désactivé - Fusepoint Hub', content, actionButton);
      
      const mailOptions = {
        from: `"${this.fromName}" <${this.fromEmail}>`,
        to: email,
        subject: '⚠️ Votre compte Fusepoint Hub a été temporairement désactivé',
        html: html,
        text: `Bonjour ${clientName},\n\nVotre compte Fusepoint Hub a été temporairement désactivé.\n\nCette désactivation peut être temporaire. Pour toute question, contactez-nous à ${agentEmail}\n\nDésactivation effectuée par ${agentName}\nÉquipe Fusepoint Hub`
      };
      
      console.log('📧 Options d\'email de désactivation:', {
        from: mailOptions.from,
        to: mailOptions.to,
        subject: mailOptions.subject
      });
      
      const result = await this.transporter.sendMail(mailOptions);
      
      if (process.env.NODE_ENV === 'development') {
        console.log('📧 Email de désactivation envoyé:', nodemailer.getTestMessageUrl(result));
      }
      
      console.log('✅ Email de désactivation client envoyé avec succès:', {
        messageId: result.messageId,
        to: email
      });
      
      return {
        success: true,
        messageId: result.messageId,
        previewUrl: nodemailer.getTestMessageUrl(result)
      };
      
    } catch (error) {
      console.error('❌ Erreur envoi email de désactivation:', error);
      console.error('❌ Détails:', {
        email: clientData.email,
        error: error.message,
        stack: error.stack
      });
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Envoyer un email générique
   */
  async sendEmail(emailOptions) {
    try {
      // Attendre que le transporteur soit initialisé
      if (!this.transporter) {
        await new Promise(resolve => setTimeout(resolve, 2000));
      }
      
      const { to, subject, html, text } = emailOptions;
      
      const mailOptions = {
        from: `"${this.fromName}" <${this.fromEmail}>`,
        to: to,
        subject: subject,
        html: html,
        text: text || html.replace(/<[^>]*>/g, '') // Fallback text version
      };
      
      const result = await this.transporter.sendMail(mailOptions);
      
      if (process.env.NODE_ENV === 'development') {
        console.log('📧 Email générique envoyé:', nodemailer.getTestMessageUrl(result));
      }
      
      return {
        success: true,
        messageId: result.messageId,
        previewUrl: nodemailer.getTestMessageUrl(result)
      };
      
    } catch (error) {
      console.error('❌ Erreur envoi email générique:', error);
      throw error;
    }
  }

  /**
   * Tester la configuration email
   */
  async testEmailConfiguration() {
    try {
      const testEmail = process.env.TEST_EMAIL || 'test@example.com';
      
      const result = await this.sendNotification(
        testEmail,
        'Utilisateur Test',
        'info',
        'Test de configuration email',
        'Si vous recevez cet email, la configuration fonctionne correctement !'
      );
      
      console.log('✅ Test email envoyé avec succès');
      return result;
      
    } catch (error) {
      console.error('❌ Échec du test email:', error);
      throw error;
    }
  }
}

module.exports = EmailService;