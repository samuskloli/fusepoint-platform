#!/usr/bin/env node

/**
 * Script pour marquer une entreprise comme "payante" via platform_settings
 * Usage: node server/scripts/set-company-paid.js <email> [paid]
 * - <email>: email d'un utilisateur de l'entreprise
 * - [paid]: true/false (par défaut true)
 */

const databaseService = require('../services/databaseService');
const PlatformSettingsService = require('../services/platformSettingsService');

async function run() {
  const emailArg = process.argv[2] || 'samuskl@gmail.com';
  const paidArg = (process.argv[3] || 'true').toLowerCase();
  const paidValue = ['true','1','yes','on'].includes(paidArg) ? 'true' : 'false';

  try {
    console.log('🚀 Initialisation MariaDB...');
    await databaseService.initialize();
    const ps = new PlatformSettingsService();

    console.log(`🔍 Recherche de l’utilisateur: ${emailArg}`);
    const user = await databaseService.getUserByEmail(emailArg, false);
    if (!user) {
      console.error(`❌ Utilisateur introuvable: ${emailArg}`);
      process.exit(1);
    }

    let companyId = Number(user.company_id || user.companyId || 0) || null;
    if (!companyId) {
      // Essayer via la table user_companies
      try {
        const companies = await databaseService.getUserCompanies(user.id);
        if (Array.isArray(companies) && companies.length > 0) {
          companyId = Number(companies[0].id);
        }
      } catch {}
    }

    if (!companyId) {
      console.error('❌ Aucun company_id associé à cet utilisateur');
      process.exit(1);
    }

    const key = `company_paid_${companyId}`;
    console.log(`📝 Pose/Mise à jour du paramètre: ${key}=${paidValue}`);

    // Créer s'il n'existe pas, sinon mettre à jour via SQL simplifié (sans updated_by/created_by)
    const existRes = await ps.createSettingIfNotExists(key, paidValue, 'boolean', 'billing', 'Entreprise marquée comme payante via admin');
    if (existRes?.exists) {
      await databaseService.run(
        `UPDATE platform_settings 
         SET value = ?, type = ?, category = ?, description = ?, updated_at = CURRENT_TIMESTAMP 
         WHERE \`key\` = ?`,
        [paidValue, 'boolean', 'billing', 'Entreprise marquée comme payante via admin', key]
      );
    }

    console.log('✅ Entreprise marquée payante:', { companyId, key, value: paidValue });
    process.exit(0);
  } catch (e) {
    console.error('❌ Erreur:', e && e.message ? e.message : e);
    process.exit(1);
  }
}

run();