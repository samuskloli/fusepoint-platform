const databaseService = require('./databaseService');
const EmailService = require('./emailService');
const NotificationManagementService = require('./notificationManagementService');
const systemLogsService = require('./systemLogsService');

class BetaSignupService {
  constructor() {
    this.emailService = new EmailService();
  }

  async ensureTable() {
    const query = `
      CREATE TABLE IF NOT EXISTS beta_signups (
        id INT AUTO_INCREMENT PRIMARY KEY,
        company VARCHAR(255) NULL,
        contact_email VARCHAR(255) NOT NULL,
        usecase TEXT,
        status VARCHAR(50) DEFAULT 'pending',
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        processed_by INT NULL,
        processed_at DATETIME NULL,
        notes TEXT NULL
      )
    `;
    await databaseService.run(query);

    // Assurer les colonnes first_name/last_name et la nullabilité de company
    try {
      const cols = await databaseService.query(`
        SELECT COLUMN_NAME, IS_NULLABLE 
        FROM INFORMATION_SCHEMA.COLUMNS 
        WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'beta_signups'
      `);
      const hasFirst = Array.isArray(cols) && cols.some(c => c.COLUMN_NAME === 'first_name');
      const hasLast = Array.isArray(cols) && cols.some(c => c.COLUMN_NAME === 'last_name');
      const companyIsNullable = Array.isArray(cols) && cols.some(c => c.COLUMN_NAME === 'company' && c.IS_NULLABLE === 'YES');

      if (!hasFirst) {
        await databaseService.run(`ALTER TABLE beta_signups ADD COLUMN first_name VARCHAR(100) NULL AFTER company`);
      }
      if (!hasLast) {
        await databaseService.run(`ALTER TABLE beta_signups ADD COLUMN last_name VARCHAR(100) NULL AFTER first_name`);
      }
      if (!companyIsNullable) {
        await databaseService.run(`ALTER TABLE beta_signups MODIFY COLUMN company VARCHAR(255) NULL`);
      }
    } catch (e) {
      console.warn('⚠️ ensureTable beta_signups extension:', e?.message || e);
    }
  }

  async createSignup({ company, contact, usecase, first_name, last_name }) {
    await this.ensureTable();

    const insert = `
      INSERT INTO beta_signups (company, first_name, last_name, contact_email, usecase, status)
      VALUES (?, ?, ?, ?, ?, 'pending')
    `;

    const result = await databaseService.run(insert, [
      String(company || '').trim(),
      String(first_name || '').trim(),
      String(last_name || '').trim(),
      String(contact).trim(),
      String(usecase || '').trim()
    ]);

    // Normaliser l'ID pour éviter l'erreur JSON BigInt
    const normalizedId = (typeof result.insertId === 'bigint') ? result.insertId.toString() : result.insertId;
    const signup = {
      id: normalizedId,
      company: String(company || '').trim(),
      first_name: String(first_name || '').trim(),
      last_name: String(last_name || '').trim(),
      contact: String(contact).trim(),
      usecase: String(usecase || ''),
      status: 'pending'
    };

    try {
      await this.notifySuperAdmins(signup);
    } catch (err) {
      console.warn('⚠️ Erreur lors de la notification des super admins:', err?.message || err);
    }

    // Envoyer un email de félicitations et remerciement au contact
    try {
      await this.emailService.sendBetaSignupThankYou(signup.contact, {
        first_name: signup.first_name,
        last_name: signup.last_name,
        company: signup.company,
        usecase: signup.usecase
      });
    } catch (emailErr) {
      console.warn('⚠️ Échec envoi email de remerciement bêta:', emailErr?.message || emailErr);
    }

    // Sécuriser le log pour éviter toute erreur après insertion
    try {
      await systemLogsService.info(
        'Nouvelle inscription bêta créée',
        'beta_signup',
        null,
        null,
        { signupId: signup.id, company: signup.company, contact: signup.contact, first_name: signup.first_name, last_name: signup.last_name }
      );
    } catch (logErr) {
      console.warn('⚠️ Erreur log beta signup:', logErr?.message || logErr);
    }

    return signup;
  }

  async listSignups({ limit = 50, offset = 0 } = {}) {
    await this.ensureTable();
    const query = `
      SELECT id, company, first_name, last_name, contact_email AS contact, usecase, status, created_at
      FROM beta_signups
      ORDER BY created_at DESC
      LIMIT ? OFFSET ?
    `;
    const rows = await databaseService.query(query, [Number(limit), Number(offset)]);
    // Éviter BigInt dans la réponse JSON
    const safeRows = Array.isArray(rows) ? rows.map(r => ({
      ...r,
      id: (typeof r.id === 'bigint') ? r.id.toString() : r.id
    })) : [];
    return safeRows;
  }

  async notifySuperAdmins(signup) {
    // Récupérer les super admins actifs
    const adminsQuery = `
      SELECT id, email, first_name, last_name
      FROM users
      WHERE role = 'super_admin' AND is_active = 1
    `;
    const admins = await databaseService.query(adminsQuery);

    if (!admins || admins.length === 0) {
      console.warn('⚠️ Aucun super admin actif trouvé pour la notification.');
      return;
    }

    const contactName = `${signup.first_name || ''} ${signup.last_name || ''}`.trim();
    const title = 'Nouvelle inscription à la bêta';
    const message = `Entreprise: ${signup.company || '—'}\nContact: ${signup.contact}${contactName ? ` (${contactName})` : ''}\nCas d’usage: ${signup.usecase || '—'}`;

    // Construire l'URL d'action vers la page Super Admin
    const frontendUrl = await this.emailService.getFrontendUrl();
    const actionUrl = `${frontendUrl}/#/super-admin/beta-requests`;

    // Envoyer l'email et la notification à chaque super admin
    for (const admin of admins) {
      const adminName = `${admin.first_name || ''} ${admin.last_name || ''}`.trim() || 'Super Admin';

      try {
        await this.emailService.sendNotification(
          admin.email,
          adminName,
          'info',
          title,
          message,
          actionUrl
        );
      } catch (emailErr) {
        console.warn('⚠️ Échec envoi email super admin:', admin.email, emailErr?.message || emailErr);
      }

      try {
        await NotificationManagementService.createSystemNotification({
          clientId: admin.id, // notifications.user_id destinataire
          type: 'info',
          title,
          message,
          actionUrl: '/super-admin/beta-requests'
        });
      } catch (notifErr) {
        console.warn('⚠️ Échec création notification système pour super admin:', admin.id, notifErr?.message || notifErr);
      }
    }
  }
}

module.exports = BetaSignupService;