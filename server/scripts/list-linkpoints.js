#!/usr/bin/env node

const databaseService = require('../services/databaseService');

async function run() {
  try {
    await databaseService.initialize();
    const rows = await databaseService.query('SELECT id, slug, company_id, archived FROM linkpoints ORDER BY id DESC LIMIT 10');
    if (!rows || rows.length === 0) {
      console.log('Aucun LinkPoint trouvé.');
    } else {
      console.log('LinkPoints (derniers 10):');
      for (const r of rows) {
        console.log(`- id=${r.id} slug=${r.slug} company_id=${r.company_id} archived=${r.archived}`);
      }
    }
    process.exit(0);
  } catch (e) {
    console.error('Erreur:', e && e.message ? e.message : e);
    process.exit(1);
  }
}

run();