#!/usr/bin/env node
/*
 * Regénère les QR codes pour tous les LinkPoints et exporte PNG/SVG.
 * - Utilise l'API backend protégée: /api/linkpoints et /api/linkpoints/:id/qr
 * - Lit le token depuis la variable d'environnement TOKEN, sinon génère via server/generate-test-token.js
 * - BACKEND_URL (defaut: http://localhost:3004)
 * - QR_SIZE (defaut: 180)
 * - Exporte vers exports/qr/qr-<slug>-<size>.png|svg
 */
const fs = require('fs');
const path = require('path');
const axios = require('axios');
const { spawnSync } = require('child_process');

const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:3004';
const QR_SIZE = parseInt(process.env.QR_SIZE || '180', 10) || 180;
const OUT_DIR = path.resolve(process.cwd(), 'exports', 'qr');

function ensureDir(dir) {
  fs.mkdirSync(dir, { recursive: true });
}

function getToken() {
  const envToken = process.env.TOKEN && process.env.TOKEN.trim();
  if (envToken) return envToken;
  // Essayer de générer un token via le script serveur
  const scriptPath = path.resolve(process.cwd(), 'server', 'generate-test-token.js');
  if (!fs.existsSync(scriptPath)) {
    throw new Error('Token non fourni et generate-test-token.js introuvable');
  }
  const res = spawnSync('node', [scriptPath], { encoding: 'utf8' });
  if (res.status !== 0) {
    throw new Error('Échec génération token: ' + (res.stderr || res.stdout || '')); 
  }
  const match = String(res.stdout).match(/[A-Za-z0-9-_]+\.[A-Za-z0-9-_]+\.[A-Za-z0-9-_]+/);
  if (!match) throw new Error('Token de test introuvable dans la sortie');
  return match[0];
}

async function listLinkPoints(token) {
  const url = `${BACKEND_URL}/api/linkpoints`;
  const { data } = await axios.get(url, { headers: { Authorization: `Bearer ${token}` }, timeout: 20000 });
  return Array.isArray(data) ? data : [];
}

async function fetchQr(id, format, token) {
  const url = `${BACKEND_URL}/api/linkpoints/${id}/qr?format=${format}&size=${QR_SIZE}`;
  const resp = await axios.get(url, {
    headers: { Authorization: `Bearer ${token}` },
    responseType: format === 'svg' ? 'text' : 'arraybuffer',
    timeout: 30000
  });
  const target = resp.headers['x-qr-target-url'] || resp.headers['X-QR-Target-Url'] || '';
  return { data: resp.data, targetUrl: target };
}

async function main() {
  console.log('🚀 Regénération des QR codes');
  console.log('   • Backend:', BACKEND_URL);
  console.log('   • Taille :', QR_SIZE);
  ensureDir(OUT_DIR);

  const token = getToken();
  console.log('🔐 Token prêt');

  const items = await listLinkPoints(token);
  console.log(`📦 ${items.length} LinkPoints trouvés`);

  for (const lp of items) {
    const slug = lp.slug || String(lp.id);
    console.log(`➡️  ${lp.id} / ${slug}`);
    try {
      // PNG
      const png = await fetchQr(lp.id, 'png', token);
      const pngPath = path.join(OUT_DIR, `qr-${slug}-${QR_SIZE}.png`);
      fs.writeFileSync(pngPath, png.data);
      console.log(`   • PNG enregistré: ${pngPath}`);
      if (png.targetUrl) console.log(`   • URL encodée: ${png.targetUrl}`);

      // SVG
      const svg = await fetchQr(lp.id, 'svg', token);
      const svgPath = path.join(OUT_DIR, `qr-${slug}-${QR_SIZE}.svg`);
      fs.writeFileSync(svgPath, svg.data, 'utf8');
      console.log(`   • SVG enregistré: ${svgPath}`);

    } catch (e) {
      console.error(`   ⚠️ Échec pour ${slug}:`, e.message || e);
    }
  }

  console.log('✅ Terminé. Fichiers disponibles dans:', OUT_DIR);
}

main().catch(err => {
  console.error('❌ Erreur:', err);
  process.exit(1);
});