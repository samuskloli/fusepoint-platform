#!/usr/bin/env node

/**
 * Script temporaire pour tester le statut payant d'une entreprise spécifique
 * Usage: node server/scripts/test-company-paid.js <companyId> [paid]
 */

const databaseService = require('../services/databaseService');
const PlatformSettingsService = require('../services/platformSettingsService');

async function run() {
  const companyIdArg = process.argv[2] || '1';
  const paidArg = (process.argv[3] || 'false').toLowerCase();
  const paidValue = ['true','1','yes','on'].includes(paidArg) ? 'true' : 'false';
  const companyId = Number(companyIdArg);

  try {
    console.log('🚀 Initialisation MariaDB...');
    await databaseService.initialize();
    const ps = new PlatformSettingsService();

    const key = `company_paid_${companyId}`;
    console.log(`📝 Pose/Mise à jour du paramètre: ${key}=${paidValue}`);

    // Créer s'il n'existe pas, sinon mettre à jour via SQL simplifié
    const existRes = await ps.createSettingIfNotExists(key, paidValue, 'boolean', 'billing', 'Test entreprise payante');
    if (existRes?.exists) {
      await databaseService.run(
        `UPDATE platform_settings 
         SET value = ?, type = ?, category = ?, description = ?, updated_at = CURRENT_TIMESTAMP 
         WHERE \`key\` = ?`,
        [paidValue, 'boolean', 'billing', 'Test entreprise payante', key]
      );
    }

    console.log('✅ Entreprise marquée:', { companyId, key, value: paidValue });
    process.exit(0);
  } catch (e) {
    console.error('❌ Erreur:', e && e.message ? e.message : e);
    process.exit(1);
  }
}

run();