#!/usr/bin/env node

/**
 * Script pour passer un client en plan payant (masquer l'attribution sur ses LinkPoints)
 * Usage: node server/scripts/mark-client-paid.js <email>
 */

const databaseService = require('../services/databaseService');

async function run() {
  const emailArg = process.argv[2] || 'samuskl@gmail.com';

  try {
    console.log('🚀 Initialisation MariaDB...');
    await databaseService.initialize();

    console.log(`🔍 Recherche de l’utilisateur: ${emailArg}`);
    const user = await databaseService.getUserByEmail(emailArg, false);
    if (!user) {
      console.error(`❌ Utilisateur introuvable: ${emailArg}`);
      process.exit(1);
    }

    const userId = Number(user.id);
    const companyId = Number(user.company_id || user.companyId || 0) || null;
    console.log('👤 Utilisateur trouvé:', { id: userId, email: user.email, companyId });

    // Récupérer les LinkPoints appartenant à l’utilisateur ou à son entreprise
    const linkpoints = await databaseService.query(
      'SELECT id, slug, theme FROM linkpoints WHERE archived=0 AND (owner_user_id = ? OR (company_id IS NOT NULL AND company_id = ?))',
      [userId, companyId]
    );

    if (!linkpoints || linkpoints.length === 0) {
      console.log('ℹ️ Aucun LinkPoint à mettre à jour pour cet utilisateur.');
      process.exit(0);
    }

    console.log(`📦 LinkPoints trouvés: ${linkpoints.length}`);

    let updatedCount = 0;
    for (const lp of linkpoints) {
      let theme = {};
      if (lp.theme) {
        try { theme = typeof lp.theme === 'string' ? JSON.parse(lp.theme) : lp.theme; } catch {}
      }

      // Définir le flag pour masquer l’attribution (clients payants)
      theme.branding_hide = true;

      // Mise à jour
      await databaseService.run(
        'UPDATE linkpoints SET theme = ?, updated_at = NOW() WHERE id = ?',
        [JSON.stringify(theme), lp.id]
      );
      updatedCount++;
      console.log(`✅ Mis à jour: slug=${lp.slug}`);
    }

    console.log(`🎉 Terminé. LinkPoints mis à jour: ${updatedCount}`);
    console.log('🔗 Slugs affectés:', linkpoints.map(l => l.slug).join(', '));
    process.exit(0);
  } catch (e) {
    console.error('❌ Erreur:', e && e.message ? e.message : e);
    process.exit(1);
  }
}

run();