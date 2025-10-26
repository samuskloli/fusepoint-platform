import * as nodemailer from 'nodemailer';
import * as path from 'path';
import * as fs from 'fs';
import { EmailService as IEmailService, ServiceResponse } from '../types';

interface EmailResult {
  success: boolean;
  messageId?: string;
  previewUrl?: string;
}

interface ActionButton {
  text: string;
  url: string;
}

interface AgentEmailData {
  to: string;
  subject: string;
  content: string;
  clientName: string;
  agentName: string;
}

/**
 * Service de gestion des emails
 * Centralise l'envoi d'emails avec templates et configuration SMTP
 */
class EmailService implements IEmailService {
  private transporter: nodemailer.Transporter | null = null;
  private fromEmail: string;
  private fromName: string;
  private frontendUrl: string | null = null;
  private baseUrl: string | null = null;
  private platformSettingsService: any = null;

  constructor() {
    this.fromEmail = process.env.EMAIL_FROM || 'noreply@fusepoint.com';
    this.fromName = process.env.EMAIL_FROM_NAME || 'Fusepoint Hub';
    this.initializeTransporter();
  }

  /**
   * Envoyer un email générique
   */
  async sendEmail(emailData: any): Promise<boolean> {
    try {
      if (!this.transporter) {
        throw new Error('Transporteur email non initialisé');
      }

      const result = await this.transporter.sendMail(emailData);
      
      if (process.env.NODE_ENV === 'development') {
        console.log('📧 Email envoyé:', nodemailer.getTestMessageUrl(result));
      }
      
      return true;
    } catch (error: any) {
      console.error('❌ Erreur lors de l\'envoi de l\'email:', error);
      return false;
    }
  }

  /**
   * Envoyer un email de bienvenue
   */
  async sendWelcomeEmail(user: any): Promise<boolean> {
    try {
      if (!this.transporter) {
        await new Promise(resolve => setTimeout(resolve, 2000));
      }
      const frontendUrl = await this.getFrontendUrl();
      const dashboardUrl = `${frontendUrl}/dashboard`;
      
      const content = `
        <p>Bonjour <strong>${user.name || user.email}</strong>,</p>
        <p>🎉 Félicitations ! Votre compte Fusepoint Hub est maintenant activé et prêt à l'emploi.</p>
      `;
      
      const mailOptions = {
        from: `${this.fromName} <${this.fromEmail}>`,
        to: user.email,
        subject: '🎉 Bienvenue sur Fusepoint Hub !',
        html: this.getBaseTemplate('Bienvenue sur Fusepoint Hub !', content, {
          text: 'Accéder au tableau de bord',
          url: dashboardUrl
        })
      };
      
      if (!this.transporter) {
        throw new Error('Transporteur email non initialisé');
      }
      
      await this.transporter.sendMail(mailOptions);
      return true;
    } catch (error: any) {
      console.error('❌ Erreur envoi email bienvenue:', error);
      return false;
    }
  }

  /**
   * Envoyer un email de réinitialisation de mot de passe
   */
  async sendPasswordResetEmail(user: any, resetToken: string): Promise<boolean> {
    try {
      const resetUrl = `${await this.getFrontendUrl()}/reset-password?token=${resetToken}`;
      
      const content = `
        <p>Bonjour <strong>${user.name || user.email}</strong>,</p>
        <p>Vous avez demandé la réinitialisation de votre mot de passe.</p>
        <p>Cliquez sur le bouton ci-dessous pour définir un nouveau mot de passe :</p>
      `;
      
      const mailOptions = {
        from: `${this.fromName} <${this.fromEmail}>`,
        to: user.email,
        subject: 'Réinitialisation de votre mot de passe',
        html: this.getBaseTemplate('Réinitialisation de mot de passe', content, {
          text: 'Réinitialiser mon mot de passe',
          url: resetUrl
        })
      };
      
      if (!this.transporter) {
        throw new Error('Transporteur email non initialisé');
      }
      
      await this.transporter.sendMail(mailOptions);
      return true;
    } catch (error: any) {
      console.error('❌ Erreur envoi email réinitialisation:', error);
      return false;
    }
  }

  /**
   * Envoyer une notification de projet
   */
  async sendProjectNotification(project: any, user: any): Promise<boolean> {
    try {
      const content = `
        <p>Bonjour <strong>${user.name || user.email}</strong>,</p>
        <p>Mise à jour concernant votre projet : <strong>${project.name}</strong></p>
        <p>Statut : ${project.status}</p>
      `;
      
      const mailOptions = {
        from: `${this.fromName} <${this.fromEmail}>`,
        to: user.email,
        subject: `Mise à jour du projet ${project.name}`,
        html: this.getBaseTemplate('Notification de projet', content)
      };
      
      if (!this.transporter) {
        throw new Error('Transporteur email non initialisé');
      }
      
      await this.transporter.sendMail(mailOptions);
      return true;
    } catch (error: any) {
      console.error('❌ Erreur envoi notification projet:', error);
      return false;
    }
  }

  /**
   * Initialiser le service de paramètres de plateforme
   */
  private initializePlatformSettings(): void {
    if (!this.platformSettingsService) {
      try {
        const PlatformSettingsService = require('./platformSettingsService');
        this.platformSettingsService = new PlatformSettingsService();
      } catch (error: any) {
        console.warn('⚠️ Impossible de charger platformSettingsService:', error.message);
      }
    }
  }

  /**
   * Récupérer l'URL frontend depuis les paramètres ou variables d'environnement
   */
  private async getFrontendUrl(): Promise<string> {
    if (this.frontendUrl) {
      return this.frontendUrl;
    }

    this.initializePlatformSettings();

    try {
      if (this.platformSettingsService) {
        const setting = await this.platformSettingsService.getSetting('frontend_url');
        if (setting && setting.value) {
          this.frontendUrl = setting.value;
          console.log('✅ URL frontend chargée depuis les paramètres de plateforme:', this.frontendUrl);
          return this.frontendUrl!;
        }
      }
    } catch (error: any) {
      console.warn('⚠️ Impossible de récupérer frontend_url depuis la base de données:', error.message);
    }

    if (process.env.FRONTEND_URL) {
      this.frontendUrl = process.env.FRONTEND_URL;
      console.log('✅ URL frontend chargée depuis les variables d\'environnement:', this.frontendUrl);
      return this.frontendUrl;
    }

    this.frontendUrl = 'http://localhost:5173';
    console.log('⚠️ Utilisation de l\'URL frontend par défaut:', this.frontendUrl);
    return this.frontendUrl;
  }

  /**
   * Récupérer l'URL de base
   */
  private async getBaseUrl(): Promise<string> {
    if (!this.baseUrl) {
      this.baseUrl = process.env.BASE_URL || await this.getFrontendUrl();
    }
    return this.baseUrl;
  }

  /**
   * Valider les URLs en production
   */
  private async validateProductionUrls(): Promise<void> {
    if (process.env.NODE_ENV === 'production') {
      const frontendUrl = await this.getFrontendUrl();
      const baseUrl = await this.getBaseUrl();
      const urls = [frontendUrl, baseUrl];
      
      urls.forEach(url => {
        if (url.includes('localhost') || url.includes('127.0.0.1')) {
          console.warn(`⚠️ URL localhost détectée en production: ${url}`);
        }
      });
    }
  }

  /**
   * Initialiser le transporteur SMTP
   */
  private async initializeTransporter(): Promise<void> {
    try {
      if (process.env.NODE_ENV === 'development') {
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
        console.log('✅ Transporteur email de test initialisé');
      } else {
        this.transporter = nodemailer.createTransport({
          host: process.env.SMTP_HOST || 'smtp.gmail.com',
          port: parseInt(process.env.SMTP_PORT || '587'),
          secure: process.env.SMTP_SECURE === 'true',
          auth: {
            user: process.env.SMTP_USER,
            pass: process.env.SMTP_PASS
          }
        });
        console.log('✅ Transporteur email SMTP initialisé');
      }
    } catch (error: any) {
      console.error('❌ Erreur initialisation transporteur email:', error);
    }
  }

  /**
   * Template HTML de base pour les emails
   */
  private getBaseTemplate(title: string, content: string, actionButton: ActionButton | null = null): string {
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
      <body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f8fafc;">
        <div style="max-width: 600px; margin: 0 auto; background-color: white; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
          <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center;">
            <h1 style="color: white; margin: 0; font-size: 24px; font-weight: 600;">${title}</h1>
          </div>
          <div style="padding: 30px; color: #374151; line-height: 1.6;">
            ${content}
            ${buttonHtml}
          </div>
          <div style="background-color: #f8fafc; padding: 20px; text-align: center; border-top: 1px solid #e5e7eb;">
            <p style="margin: 0; color: #6b7280; font-size: 14px;">© 2024 Fusepoint Hub. Tous droits réservés.</p>
          </div>
        </div>
      </body>
      </html>
    `;
  }

  /**
   * Envoyer un email de confirmation de compte
   */
  async sendAccountConfirmation(userEmail: string, userName: string, confirmationToken: string): Promise<EmailResult> {
    try {
      console.log('📧 Tentative d\'envoi d\'email de confirmation pour:', userEmail);
      
      if (!this.transporter) {
        console.log('⏳ Attente de l\'initialisation du transporteur...');
        await new Promise(resolve => setTimeout(resolve, 2000));
      }
      
      if (!this.transporter) {
        throw new Error('Transporteur email non initialisé');
      }
      
      await this.validateProductionUrls();
      
      const frontendUrl = await this.getFrontendUrl();
      const confirmationUrl = `${frontendUrl}/confirm-account?token=${confirmationToken}`;
      
      const content = `
        <p>Bonjour <strong>${userName}</strong>,</p>
        <p>Merci de vous être inscrit sur Fusepoint Hub ! 🎉</p>
        <p>Pour activer votre compte et commencer à utiliser nos services, veuillez confirmer votre adresse email en cliquant sur le bouton ci-dessous :</p>
      `;
      
      const mailOptions = {
        from: `"${this.fromName}" <${this.fromEmail}>`,
        to: userEmail,
        subject: '✅ Confirmez votre compte Fusepoint Hub',
        html: this.getBaseTemplate('Confirmez votre compte', content, {
          text: 'Confirmer mon compte',
          url: confirmationUrl
        }),
        text: `Bonjour ${userName},\n\nMerci de vous être inscrit ! Confirmez votre compte : ${confirmationUrl}\n\nÉquipe Fusepoint`
      };
      
      const result = await this.transporter.sendMail(mailOptions);
      
      if (process.env.NODE_ENV === 'development') {
        console.log('📧 Email de confirmation envoyé:', nodemailer.getTestMessageUrl(result));
      }
      
      return {
        success: true,
        messageId: result.messageId,
        previewUrl: process.env.NODE_ENV === 'development' ? (nodemailer.getTestMessageUrl(result) || undefined) : undefined
      };
      
    } catch (error: any) {
      console.error('❌ Erreur envoi email confirmation:', error);
      return {
        success: false
      };
    }
  }
}

module.exports = EmailService;