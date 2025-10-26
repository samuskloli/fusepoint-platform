const express = require('express');
const router = express.Router();
const databaseService = require('../services/databaseService');
const geoService = require('../services/geoService');
const { classifyDeviceType } = require('../services/uaService');
const backupSvc = require('../services/linkpointBackup');
const fallbackStats = require('../services/fallbackStats');
const VCardService = require('../services/vcardService');
const PlatformSettingsService = require('../services/platformSettingsService');
const platformSettings = new PlatformSettingsService();

// Charger info LinkPoint public par slug
router.get('/:slug', async (req, res) => {
  const { slug } = req.params;
  try {
    const lp = await databaseService.get(
      'SELECT id, name, type, slug, logo_url, theme, external_url, company_id FROM linkpoints WHERE slug=? AND archived=0',
      [slug]
    );
    if (!lp) {
      // Fallback via backup local
      const bk = backupSvc.read(slug);
      if (!bk) return res.status(404).json({ error: 'LinkPoint introuvable' });
      // Mapper vers le format attendu par le frontend
      const mapped = {
        name: bk.publicOptions?.title || bk.slug,
        type: bk.type === 'external_url' ? 'external' : bk.type === 'links_hub' ? 'links' : 'generated',
        slug: bk.slug,
        logo_url: bk.publicOptions?.logo_url || null,
        external_url: bk.destination?.url || null
      };
      const links = Array.isArray(bk.destination)
        ? bk.destination.map((l, idx) => ({ id: idx + 1, label: l.label || 'Ouvrir', url: l.url }))
        : [];
      return res.json({ linkpoint: mapped, links, mode: 'fallback_local' });
    }

    // Injecter branding_hide si l'entreprise est marquée payante
    try {
      if (lp.company_id) {
        const setting = await platformSettings.getSetting(`company_paid_${lp.company_id}`);
        const val = setting?.value;
        const isPaid = val === 'true' || val === '1' || val === 'yes' || val === 'on';
        if (isPaid) {
          let themeObj = {};
          if (lp.theme) {
            try { themeObj = typeof lp.theme === 'string' ? JSON.parse(lp.theme) : lp.theme; } catch {}
          }
          themeObj.branding_hide = true;
          lp.theme = JSON.stringify(themeObj);
        }
      }
    } catch (e) {
      // ne pas bloquer en cas d’erreur de lecture de paramètres
    }

    const links = await databaseService.query(
      'SELECT id, label, url, icon, sort_order FROM linkpoint_links WHERE linkpoint_id=? ORDER BY sort_order ASC, id ASC',
      [lp.id]
    );

    res.json({ linkpoint: lp, links, mode: 'primary' });
  } catch (e) {
    console.error('GET /public/:slug error', e);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// Nouveau: Endpoint ultra-early pour statut payant
router.get('/:slug/paid', async (req, res) => {
  const { slug } = req.params;
  try {
    const lp = await databaseService.get(
      'SELECT company_id FROM linkpoints WHERE slug=? AND archived=0',
      [slug]
    );
    let isPaid = false;
    if (lp && lp.company_id) {
      try {
        const setting = await platformSettings.getSetting(`company_paid_${lp.company_id}`);
        const val = setting?.value;
        isPaid = val === 'true' || val === '1' || val === 'yes' || val === 'on';
      } catch (e) {}
    }
    return res.json({ paid: isPaid });
  } catch (e) {
    // En cas d’erreur ou introuvable, retourner paid=false (non bloquant)
    return res.json({ paid: false });
  }
});

// Enregistrer un scan
router.post('/:slug/scan', async (req, res) => {
  const { slug } = req.params;
  try {
    const lp = await databaseService.get(
      'SELECT id FROM linkpoints WHERE slug=? AND archived=0',
      [slug]
    );
    if (!lp) {
      // Fallback: enregistrer un scan local
      const ip = geoService.getClientIp(req);
      const ua = req.headers['user-agent'] || '';
      const ref = req.body?.referrer || req.headers['referer'] || '';
      try { fallbackStats.recordScan(slug, { ip, ua, ref }); } catch {}
      return res.json({ ok: true, mode: 'fallback_local' });
    }

    const ip = geoService.getClientIp(req);
    const ua = req.headers['user-agent'] || '';
    const ref = req.body?.referrer || req.headers['referer'] || '';

    const { country_code, region } = geoService.lookupGeo(ip);
    const device_type = classifyDeviceType(ua);

    await databaseService.run(
      'INSERT INTO linkpoint_events (linkpoint_id, event_type, occurred_at, ip, user_agent, referrer, country_code, region, device_type) VALUES (?, "scan", NOW(), ?, ?, ?, ?, ?, ?)',
      [lp.id, ip, ua, ref, country_code, region, device_type]
    );

    // Upsert stats du jour
    await databaseService.run(
      'INSERT INTO linkpoint_stats_daily (linkpoint_id, stat_date, scans, clicks, ctr) VALUES (?, CURDATE(), 1, 0, 0) ON DUPLICATE KEY UPDATE scans=scans+1, ctr=IF(clicks>0, (clicks*100.0)/(scans+1), 0)',
      [lp.id]
    );

    res.json({ ok: true, mode: 'primary' });
  } catch (e) {
    console.error('POST /public/:slug/scan error', e);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// Enregistrer un clic
router.post('/:slug/click', async (req, res) => {
  const { slug } = req.params;
  const { linkId, url } = req.body || {};
  try {
    const lp = await databaseService.get(
      'SELECT id FROM linkpoints WHERE slug=? AND archived=0',
      [slug]
    );
    if (!lp) {
      // Fallback: enregistrer un clic local
      const ip = geoService.getClientIp(req);
      const ua = req.headers['user-agent'] || '';
      const ref = req.body?.referrer || req.headers['referer'] || '';
      const target = (url || '').toString();
      try { fallbackStats.recordClick(slug, { url: target, ip, ua, ref }); } catch {}
      return res.json({ ok: true, mode: 'fallback_local' });
    }

    let link_id = null;
    if (linkId) link_id = linkId;
    else if (url) {
      const link = await databaseService.get(
        'SELECT id FROM linkpoint_links WHERE linkpoint_id=? AND url=?',
        [lp.id, url]
      );
      link_id = link?.id || null;
    }

    const ip = geoService.getClientIp(req);
    const ua = req.headers['user-agent'] || '';
    const ref = req.body?.referrer || req.headers['referer'] || '';

    const { country_code, region } = geoService.lookupGeo(ip);
    const device_type = classifyDeviceType(ua);

    await databaseService.run(
      'INSERT INTO linkpoint_events (linkpoint_id, event_type, link_id, occurred_at, ip, user_agent, referrer, country_code, region, device_type) VALUES (?, "click", ?, NOW(), ?, ?, ?, ?, ?, ?)',
      [lp.id, link_id, ip, ua, ref, country_code, region, device_type]
    );

    await databaseService.run(
      'INSERT INTO linkpoint_stats_daily (linkpoint_id, stat_date, scans, clicks, ctr) VALUES (?, CURDATE(), 0, 1, 0) ON DUPLICATE KEY UPDATE clicks=clicks+1, ctr=((clicks+1)*100.0)/NULLIF(scans,0)',
      [lp.id]
    );

    res.json({ ok: true, mode: 'primary' });
  } catch (e) {
    console.error('POST /public/:slug/click error', e);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// Statistiques publiques basiques (7/30 jours)
router.get('/:slug/stats', async (req, res) => {
  const { slug } = req.params;
  const range = Number(req.query.range || 7);
  try {
    const lp = await databaseService.get(
      'SELECT id FROM linkpoints WHERE slug=? AND archived=0',
      [slug]
    );
    if (!lp) return res.status(404).json({ error: 'LinkPoint introuvable' });

    const daily = await databaseService.query(
      `SELECT DATE(occurred_at) AS day,
              SUM(event_type='scan') AS scans,
              SUM(event_type='click') AS clicks
       FROM linkpoint_events
       WHERE linkpoint_id=? AND occurred_at >= DATE_SUB(CURDATE(), INTERVAL ? DAY)
       GROUP BY day
       ORDER BY day ASC`,
      [lp.id, range]
    );

    const top = await databaseService.query(
      `SELECT link_id, COUNT(*) AS clicks
       FROM linkpoint_events
       WHERE linkpoint_id=? AND event_type='click' AND occurred_at >= DATE_SUB(CURDATE(), INTERVAL ? DAY)
       GROUP BY link_id
       ORDER BY clicks DESC
       LIMIT 5`,
      [lp.id, range]
    );

    res.json({ daily, top });
  } catch (e) {
    console.error('GET /public/:slug/stats error', e);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// Générer et servir un fichier vCard
router.get('/:slug/vcard', async (req, res) => {
  const { slug } = req.params;
  try {
    // Récupérer les informations du LinkPoint
    const lp = await databaseService.get(
      'SELECT id, name, type, slug, theme FROM linkpoints WHERE slug=? AND archived=0',
      [slug]
    );
    
    if (!lp) {
      return res.status(404).json({ error: 'LinkPoint introuvable' });
    }

    // Parser le thème pour récupérer les données vCard
    let theme = {};
    if (lp.theme) {
      try {
        theme = typeof lp.theme === 'string' ? JSON.parse(lp.theme) : lp.theme;
      } catch (e) {
        console.error('Erreur parsing theme:', e);
      }
    }

    // Vérifier si vCard est activé
    if (!theme.vcard_enabled || !theme.vcard) {
      return res.status(404).json({ error: 'vCard non disponible pour ce LinkPoint' });
    }

    // Valider les données vCard
    const validation = VCardService.validateVCardData(theme.vcard);
    if (!validation.isValid) {
      return res.status(400).json({ 
        error: 'Données vCard invalides', 
        details: validation.errors 
      });
    }

    // Générer le contenu vCard
    const vcardContent = VCardService.generateVCard(theme.vcard);

    res.setHeader('Content-Type', 'text/vcard; charset=utf-8');
    res.setHeader('Content-Disposition', `attachment; filename="${slug}.vcf"`);
    return res.send(vcardContent);
  } catch (e) {
    console.error('GET /public/:slug/vcard error', e);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

module.exports = router;