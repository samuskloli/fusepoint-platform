const express = require('express');
const router = express.Router();
const databaseService = require('../services/databaseService');
const QRCode = require('qrcode');
const PDFDocument = require('pdfkit');
const geoip = require('geoip-lite');
const backupSvc = require('../services/linkpointBackup');
const customDomainService = require('../services/customDomainService');
const PlatformSettingsService = require('../services/platformSettingsService');
const slugService = require('../services/slugService');
const platformSettingsService = new PlatformSettingsService();

// Liste des LinkPoints (protégé)
router.get('/', async (req, res) => {
  try {
    const userId = req.user?.id;
    const companyId = req.user?.company_id || req.user?.companyId;
    const rows = await databaseService.query(
      'SELECT id, name, type, slug, logo_url, external_url, archived, created_at, updated_at FROM linkpoints WHERE (owner_user_id=? OR company_id=?) AND archived=0 ORDER BY updated_at DESC',
      [userId, companyId]
    );
    res.json(rows);
  } catch (e) {
    console.error('GET /api/linkpoints error', e);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});



// ===== Nouveau: liste des archivés =====
router.get('/archived', async (req, res) => {
  try {
    const userId = req.user?.id;
    const companyId = req.user?.company_id || req.user?.companyId;
    const rows = await databaseService.query(
      'SELECT id, name, type, slug, logo_url, external_url, archived, created_at, updated_at FROM linkpoints WHERE (owner_user_id=? OR company_id=?) AND archived=1 ORDER BY updated_at DESC',
      [userId, companyId]
    );
    res.json(rows);
  } catch (e) {
    console.error('GET /api/linkpoints/archived error', e);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// Global stats across user's/company linkpoints
router.get('/global-stats', async (req, res) => {
  try {
    const range = Math.max(1, Math.min(parseInt(req.query.range || '30', 10) || 30, 90));
    const userId = req.user?.id;
    const companyId = req.user?.company_id || req.user?.companyId;

    const daily = await databaseService.query(
      `SELECT DATE(occurred_at) AS day,
              SUM(event_type='scan') AS scans,
              SUM(event_type='click') AS clicks,
              SUM(event_type='vcard_add') AS vcard_adds
       FROM linkpoint_events
       WHERE linkpoint_id IN (
         SELECT id FROM linkpoints WHERE (owner_user_id=? OR company_id=?) AND archived=0
       )
       AND occurred_at >= DATE_SUB(CURDATE(), INTERVAL ? DAY)
       GROUP BY day
       ORDER BY day ASC`,
      [userId, companyId, range]
    );

    const totals = daily.reduce((acc, d) => {
      acc.scans += Number(d.scans || 0);
      acc.clicks += Number(d.clicks || 0);
      acc.vcard_adds += Number(d.vcard_adds || 0);
      return acc;
    }, { scans: 0, clicks: 0, vcard_adds: 0 });

    const ctr = totals.scans > 0 ? (totals.clicks * 100.0) / totals.scans : 0;
    const lastScanDate = daily.filter(d => Number(d.scans || 0) > 0).slice(-1)[0]?.day || null;
    const avgPerDay = {
      scans: range > 0 ? totals.scans / range : 0,
      clicks: range > 0 ? totals.clicks / range : 0,
      vcard_adds: range > 0 ? totals.vcard_adds / range : 0
    };

    res.json({ daily, totals, ctr, lastScanDate, avgPerDay });
  } catch (e) {
    console.error('GET /api/linkpoints/global-stats error', e);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// Per-link stats: totals per linkpoint and per link within range
router.get('/stats-by-link', async (req, res) => {
  try {
    const range = Math.max(1, Math.min(parseInt(req.query.range || '30', 10) || 30, 365));
    const userId = req.user?.id;
    const companyId = req.user?.company_id || req.user?.companyId;

    // All accessible linkpoints for the user/company
    const linkpoints = await databaseService.query(
      `SELECT id, name, slug
       FROM linkpoints
       WHERE (owner_user_id=? OR company_id=?) AND archived=0
       ORDER BY id ASC`,
      [userId, companyId]
    );

    if (!linkpoints || linkpoints.length === 0) {
      return res.json({ linkpoints: [], scansByLinkpoint: [], clicksByLink: [], results: [] });
    }

    const lpIds = linkpoints.map(lp => lp.id);

    // Total scans per linkpoint in range
    const scansByLinkpoint = await databaseService.query(
      `SELECT linkpoint_id, COUNT(*) AS scans
       FROM linkpoint_events
       WHERE event_type='scan'
         AND linkpoint_id IN (${lpIds.map(() => '?').join(',')})
         AND occurred_at >= DATE_SUB(CURDATE(), INTERVAL ? DAY)
       GROUP BY linkpoint_id`,
      [...lpIds, range]
    );

    // Total clicks per link (with link metadata) in range
    const clicksByLink = await databaseService.query(
      `SELECT e.linkpoint_id, e.link_id, COUNT(*) AS clicks,
              COALESCE(l.label, 'Unknown') AS link_label,
              COALESCE(l.url, '') AS url
       FROM linkpoint_events e
       LEFT JOIN linkpoint_links l ON l.id = e.link_id
       WHERE e.event_type='click'
         AND e.linkpoint_id IN (${lpIds.map(() => '?').join(',')})
         AND e.occurred_at >= DATE_SUB(CURDATE(), INTERVAL ? DAY)
       GROUP BY e.linkpoint_id, e.link_id, link_label, url
       ORDER BY e.linkpoint_id ASC, clicks DESC`,
      [...lpIds, range]
    );

    // Total vCard adds per linkpoint in range
    const vcardAddsByLinkpoint = await databaseService.query(
      `SELECT linkpoint_id, COUNT(*) AS vcard_adds
       FROM linkpoint_events
       WHERE event_type='vcard_add'
         AND linkpoint_id IN (${lpIds.map(() => '?').join(',')})
         AND occurred_at >= DATE_SUB(CURDATE(), INTERVAL ? DAY)
       GROUP BY linkpoint_id`,
      [...lpIds, range]
    );

    // Assemble results per linkpoint
    const scansMap = new Map(scansByLinkpoint.map(r => [r.linkpoint_id, Number(r.scans || 0)]));
    const vcardMap = new Map(vcardAddsByLinkpoint.map(r => [r.linkpoint_id, Number(r.vcard_adds || 0)]));
    const clicksGrouped = new Map();
    for (const row of clicksByLink) {
      const key = row.linkpoint_id;
      const arr = clicksGrouped.get(key) || [];
      arr.push({
        link_id: row.link_id,
        label: row.link_label,
        url: row.url,
        clicks: Number(row.clicks || 0)
      });
      clicksGrouped.set(key, arr);
    }

    const results = linkpoints.map(lp => ({
      linkpoint_id: lp.id,
      name: lp.name,
      slug: lp.slug,
      total_scans: scansMap.get(lp.id) || 0,
      total_clicks: (clicksGrouped.get(lp.id) || []).reduce((sum, l) => sum + l.clicks, 0),
      total_vcard_adds: vcardMap.get(lp.id) || 0,
      links: clicksGrouped.get(lp.id) || []
    }));

    res.json({ range, linkpoints, results });
  } catch (e) {
    console.error('GET /api/linkpoints/stats-by-link error', e);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

router.post('/', async (req, res) => {
  try {
    const { name, type, logo_url, theme, external_url, links } = req.body || {};
    const userId = req.user?.id;
    const companyId = req.user?.company_id || req.user?.companyId;

    if (!name || !type) return res.status(400).json({ error: 'name et type requis' });

    // Générer automatiquement un slug unique
    const slug = await slugService.generateUniqueSlug(name);

    const result = await databaseService.run(
      'INSERT INTO linkpoints (name, type, slug, logo_url, theme, external_url, owner_user_id, company_id, archived) VALUES (?, ?, ?, ?, ?, ?, ?, ?, 0)',
      [name, type, slug, logo_url || null, theme || null, external_url || null, userId || null, companyId || null]
    );
    const id = result.insertId;

    if (Array.isArray(links)) {
      for (const l of links) {
        await databaseService.run(
          'INSERT INTO linkpoint_links (linkpoint_id, label, url, icon, sort_order) VALUES (?, ?, ?, ?, ?)',
          [id, l.label, l.url, l.icon || null, l.sort_order || 0]
        );
      }
    }

    const created = await databaseService.get('SELECT * FROM linkpoints WHERE id=?', [id]);
    // Backup: écrire fichier statique
    try {
      const backup = await buildBackupForId(id);
      if (backup) backupSvc.writeAtomic(backup.slug, backup);
    } catch (be) {
      console.warn('Backup write (create) failed:', be && be.message ? be.message : be);
    }

    res.status(201).json(created);
  } catch (e) {
    console.error('POST /api/linkpoints error', e);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// Détails + stats
router.get('/:id', async (req, res) => {
  const id = Number(req.params.id);
  try {
    const lp = await databaseService.get('SELECT * FROM linkpoints WHERE id=?', [id]);
    if (!lp) return res.status(404).json({ error: 'Introuvable' });
    const links = await databaseService.query('SELECT * FROM linkpoint_links WHERE linkpoint_id=? ORDER BY sort_order ASC, id ASC', [id]);
    const stats7 = await databaseService.query(
      `SELECT DATE(occurred_at) AS day,
              SUM(event_type='scan') AS scans,
              SUM(event_type='click') AS clicks,
              SUM(event_type='vcard_add') AS vcard_adds
       FROM linkpoint_events WHERE linkpoint_id=? AND occurred_at >= DATE_SUB(CURDATE(), INTERVAL 7 DAY)
       GROUP BY day ORDER BY day ASC`,
      [id]
    );
    const stats30 = await databaseService.query(
      `SELECT DATE(occurred_at) AS day,
              SUM(event_type='scan') AS scans,
              SUM(event_type='click') AS clicks,
              SUM(event_type='vcard_add') AS vcard_adds
       FROM linkpoint_events WHERE linkpoint_id=? AND occurred_at >= DATE_SUB(CURDATE(), INTERVAL 30 DAY)
       GROUP BY day ORDER BY day ASC`,
      [id]
    );
    const top = await databaseService.query(
      `SELECT link_id, COUNT(*) AS clicks FROM linkpoint_events WHERE linkpoint_id=? AND event_type='click' AND link_id IS NOT NULL GROUP BY link_id ORDER BY clicks DESC LIMIT 5`,
      [id]
    );

    // Top appareils (mobile/desktop) basé sur les scans
    const devices7 = await databaseService.get(
      `SELECT 
          SUM(CASE WHEN device_type='mobile' OR (device_type IS NULL AND user_agent REGEXP 'Mobile|Android|iPhone|iPad') THEN 1 ELSE 0 END) AS mobile,
          SUM(CASE WHEN device_type='desktop' OR (device_type IS NULL AND user_agent NOT REGEXP 'Mobile|Android|iPhone|iPad') THEN 1 ELSE 0 END) AS desktop
       FROM linkpoint_events WHERE linkpoint_id=? AND event_type='scan' AND occurred_at >= DATE_SUB(CURDATE(), INTERVAL 7 DAY)`,
      [id]
    );
    const devices30 = await databaseService.get(
      `SELECT 
          SUM(CASE WHEN device_type='mobile' OR (device_type IS NULL AND user_agent REGEXP 'Mobile|Android|iPhone|iPad') THEN 1 ELSE 0 END) AS mobile,
          SUM(CASE WHEN device_type='desktop' OR (device_type IS NULL AND user_agent NOT REGEXP 'Mobile|Android|iPhone|iPad') THEN 1 ELSE 0 END) AS desktop
       FROM linkpoint_events WHERE linkpoint_id=? AND event_type='scan' AND occurred_at >= DATE_SUB(CURDATE(), INTERVAL 30 DAY)`,
      [id]
    );

    // Top sources (referrer)
    const sources7 = await databaseService.query(
      `SELECT COALESCE(NULLIF(referrer,''),'Direct') AS source, COUNT(*) AS scans
       FROM linkpoint_events
       WHERE linkpoint_id=? AND event_type='scan' AND occurred_at >= DATE_SUB(CURDATE(), INTERVAL 7 DAY)
       GROUP BY source
       ORDER BY scans DESC
       LIMIT 5`,
      [id]
    );
    const sources30 = await databaseService.query(
      `SELECT COALESCE(NULLIF(referrer,''),'Direct') AS source, COUNT(*) AS scans
       FROM linkpoint_events
       WHERE linkpoint_id=? AND event_type='scan' AND occurred_at >= DATE_SUB(CURDATE(), INTERVAL 30 DAY)
       GROUP BY source
       ORDER BY scans DESC
       LIMIT 5`,
      [id]
    );

    // Geo (pays/région) via colonnes enrichies
    const geo7 = await databaseService.query(
      `SELECT country_code, region, COUNT(*) AS scans
       FROM linkpoint_events
       WHERE linkpoint_id=? AND event_type='scan'
         AND occurred_at >= DATE_SUB(CURDATE(), INTERVAL 7 DAY)
         AND country_code IS NOT NULL
       GROUP BY country_code, region
       ORDER BY scans DESC
       LIMIT 50`,
      [id]
    );
    const geo30 = await databaseService.query(
      `SELECT country_code, region, COUNT(*) AS scans
       FROM linkpoint_events
       WHERE linkpoint_id=? AND event_type='scan'
         AND occurred_at >= DATE_SUB(CURDATE(), INTERVAL 30 DAY)
         AND country_code IS NOT NULL
       GROUP BY country_code, region
       ORDER BY scans DESC
       LIMIT 50`,
      [id]
    );

    const geo = { d7: geo7, d30: geo30 };

    res.json({ linkpoint: lp, links, stats: { d7: stats7, d30: stats30 }, top, devices: { d7: devices7, d30: devices30 }, sources: { d7: sources7, d30: sources30 }, geo });
  } catch (e) {
    console.error('GET /api/linkpoints/:id error', e);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// Mise à jour
router.put('/:id', async (req, res) => {
  const id = Number(req.params.id);
  try {
    const { name, logo_url, theme, external_url, archived, links } = req.body || {};
    await databaseService.run(
      'UPDATE linkpoints SET name=COALESCE(?, name), logo_url=COALESCE(?, logo_url), theme=COALESCE(?, theme), external_url=COALESCE(?, external_url), archived=COALESCE(?, archived), updated_at=NOW() WHERE id=?',
      [name || null, logo_url || null, theme || null, external_url || null, typeof archived === 'number' ? archived : null, id]
    );

    // Remplacer les liens si fournis
    if (Array.isArray(links)) {
      // Supprimer les liens existants
      await databaseService.run('DELETE FROM linkpoint_links WHERE linkpoint_id=?', [id]);
      // Réinsérer les nouveaux liens
      for (const l of links) {
        const label = l.label || '';
        const url = l.url || '';
        const icon = l.icon || null;
        const sortOrder = typeof l.sort_order === 'number' ? l.sort_order : 0;
        await databaseService.run(
          'INSERT INTO linkpoint_links (linkpoint_id, label, url, icon, sort_order) VALUES (?, ?, ?, ?, ?)',
          [id, label, url, icon, sortOrder]
        );
      }
    }

    const updated = await databaseService.get('SELECT * FROM linkpoints WHERE id=?', [id]);
    // Backup: mettre à jour fichier statique
    try {
      const backup = await buildBackupForId(id);
      if (backup) backupSvc.writeAtomic(backup.slug, backup);
    } catch (be) {
      console.warn('Backup write (update) failed:', be && be.message ? be.message : be);
    }
    res.json(updated);
  } catch (e) {
    console.error('PUT /api/linkpoints/:id error', e);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// ===== Nouveau: suppression définitive (seulement si archivé) =====
router.delete('/:id', async (req, res) => {
  const id = Number(req.params.id);
  try {
    const userId = req.user?.id;
    const companyId = req.user?.company_id || req.user?.companyId;

    const lp = await databaseService.get('SELECT id, owner_user_id, company_id, archived FROM linkpoints WHERE id=?', [id]);
    if (!lp) return res.status(404).json({ error: 'Introuvable' });

    // Vérifier la portée (propriétaire ou même entreprise)
    if (!((lp.owner_user_id && lp.owner_user_id === userId) || (lp.company_id && lp.company_id === companyId))) {
      return res.status(403).json({ error: 'Accès refusé' });
    }

    if (Number(lp.archived) !== 1) {
      return res.status(400).json({ error: 'Archiver avant la suppression définitive' });
    }

    // Supprimer les dépendances
    await databaseService.run('DELETE FROM linkpoint_links WHERE linkpoint_id=?', [id]);
    await databaseService.run('DELETE FROM linkpoint_events WHERE linkpoint_id=?', [id]);
    await databaseService.run('DELETE FROM linkpoint_stats_daily WHERE linkpoint_id=?', [id]);

    // Supprimer le LinkPoint
    await databaseService.run('DELETE FROM linkpoints WHERE id=?', [id]);

    // Backup: supprimer le fichier
    try {
      if (lp.slug) backupSvc.remove(lp.slug);
    } catch (be) {
      console.warn('Backup delete failed:', be && be.message ? be.message : be);
    }

    res.json({ success: true, id });
  } catch (e) {
    console.error('DELETE /api/linkpoints/:id error', e);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// Endpoints admin backup: statut, régénération, export
router.get('/backup/status', async (req, res) => {
  try {
    const rows = await databaseService.query('SELECT slug, updated_at FROM linkpoints WHERE archived=0');
    const status = rows.map(r => {
      const meta = backupSvc.getBackupMeta(r.slug);
      const hasFile = backupSvc.exists(r.slug);
      const lastBackup = meta?.updatedAt || null;
      return { slug: r.slug, hasFile, lastBackup, dbUpdatedAt: r.updated_at };
    });
    res.json({ status, checkedAt: new Date().toISOString() });
  } catch (e) {
    console.error('GET /api/linkpoints/backup/status error', e);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

router.post('/:id/backup/regenerate', async (req, res) => {
  const id = Number(req.params.id);
  try {
    const backup = await buildBackupForId(id);
    if (!backup) return res.status(404).json({ error: 'Introuvable' });
    backupSvc.writeAtomic(backup.slug, backup);
    res.json({ ok: true, slug: backup.slug, updatedAt: backup.updatedAt });
  } catch (e) {
    console.error('POST /api/linkpoints/:id/backup/regenerate error', e);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

router.get('/backup/export', async (req, res) => {
  try {
    backupSvc.zipAll(res);
  } catch (e) {
    console.error('GET /api/linkpoints/backup/export error', e);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// Duplication
router.post('/:id/duplicate', async (req, res) => {
  const id = Number(req.params.id);
  try {
    const lp = await databaseService.get('SELECT * FROM linkpoints WHERE id=?', [id]);
    if (!lp) return res.status(404).json({ error: 'Introuvable' });
    
    // Générer automatiquement un slug unique pour la copie
    const slug = await slugService.generateDuplicateSlug(lp.slug);

    const result = await databaseService.run(
      'INSERT INTO linkpoints (name, type, slug, logo_url, theme, external_url, owner_user_id, company_id, archived) VALUES (?, ?, ?, ?, ?, ?, ?, ?, 0)',
      [lp.name + ' (copie)', lp.type, slug, lp.logo_url, lp.theme, lp.external_url, lp.owner_user_id, lp.company_id]
    );
    const newId = result.insertId;

    const links = await databaseService.query('SELECT label, url, icon, sort_order FROM linkpoint_links WHERE linkpoint_id=?', [id]);
    for (const l of links) {
      await databaseService.run('INSERT INTO linkpoint_links (linkpoint_id, label, url, icon, sort_order) VALUES (?, ?, ?, ?, ?)', [newId, l.label, l.url, l.icon, l.sort_order]);
    }

    const created = await databaseService.get('SELECT * FROM linkpoints WHERE id=?', [newId]);
    res.status(201).json(created);
  } catch (e) {
    console.error('POST /api/linkpoints/:id/duplicate error', e);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// QR code réel (PNG ou SVG)
router.get('/:id/qr', async (req, res) => {
  const id = Number(req.params.id);
  try {
    const lp = await databaseService.get('SELECT slug, company_id FROM linkpoints WHERE id=?', [id]);
    if (!lp) return res.status(404).json({ error: 'Introuvable' });

    const format = (req.query.format || 'png').toLowerCase();
    const size = Math.min(1024, Math.max(parseInt(req.query.size || '240', 10) || 240, 120));
    const margin = Math.max(parseInt(req.query.margin || '1', 10) || 1, 0);
    const ecc = (req.query.ecc || 'M');
    const dark = req.query.dark || '#000000';
    const light = req.query.light || '#FFFFFF';

    // Construire l’URL cible pour le QR
    let targetUrl = `${req.protocol}://${req.get('host')}/r/${lp.slug}`;

    // En dev, permettre de forcer une URL publique (IP locale). On encode vers le frontend
    const devPublic = (process.env.DEV_PUBLIC_URL || process.env.FRONTEND_URL || '').trim();
    if (process.env.NODE_ENV !== 'production' && devPublic && /^https?:\/\//.test(devPublic)) {
      const base = devPublic.replace(/\/+$/, '');
      targetUrl = `${base}/l/${lp.slug}`;
    }

    // En production, privilégier le domaine personnalisé de l’entreprise si actif
    if (process.env.NODE_ENV === 'production') {
      try {
        const domain = await customDomainService.getActiveDomainForLinkpoint(id);
        if (domain && typeof domain === 'string') {
          const cleanDomain = domain.replace(/\/$/, '');
          targetUrl = `${req.protocol}://${cleanDomain}/r/${lp.slug}`;
        }
      } catch (e) {
        // Ne pas bloquer en cas d’erreur; on garde host par défaut
        console.warn('Custom domain lookup failed:', e && e.message ? e.message : e);
      }
    }

    // Ajouter indicateur plan payant (permet de masquer le loader côté frontend)
    let isPaid = false;
    try {
      if (lp.company_id) {
        const setting = await platformSettingsService.getSetting(`company_paid_${lp.company_id}`);
        const val = setting?.value;
        isPaid = val === 'true' || val === '1' || val === 'yes' || val === 'on';
      }
    } catch (e) {
      // non bloquant
    }
    if (isPaid) {
      const sep = targetUrl.includes('?') ? '&' : '?';
      targetUrl = `${targetUrl}${sep}paid=1`;
    }

    // Expose pour debug (permet de vérifier l'URL encodée)
    res.setHeader('X-QR-Target-Url', targetUrl);

    const options = { errorCorrectionLevel: ecc, margin, color: { dark, light } };

    if (format === 'svg') {
      const svg = await QRCode.toString(targetUrl, { ...options, type: 'svg' });
      res.setHeader('Content-Type', 'image/svg+xml');
      res.setHeader('Cache-Control', 'public, max-age=3600');
      return res.send(svg);
    } else if (format === 'pdf') {
      const png = await QRCode.toBuffer(targetUrl, { ...options, type: 'png' });
      // Créer un PDF avec le QR au centre
      const doc = new PDFDocument({ size: [size + margin * 20, size + margin * 20] });
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Cache-Control', 'public, max-age=3600');
      doc.pipe(res);
      const pageWidth = doc.page.width;
      const pageHeight = doc.page.height;
      const imgWidth = size;
      const imgHeight = size;
      const x = (pageWidth - imgWidth) / 2;
      const y = (pageHeight - imgHeight) / 2;
      doc.image(png, x, y, { width: imgWidth, height: imgHeight });
      doc.end();
      return;
    } else {
      const png = await QRCode.toBuffer(targetUrl, { ...options, type: 'png' });
      res.setHeader('Content-Type', 'image/png');
      res.setHeader('Cache-Control', 'public, max-age=3600');
      return res.send(png);
    }
  } catch (e) {
    console.error('GET /api/linkpoints/:id/qr error', e);
    res.status(500).send('Erreur serveur');
  }
});

// ===== Nouveau: stats géographiques (par pays/région) =====
router.get('/geo-stats', async (req, res) => {
  try {
    const range = Math.max(1, Math.min(parseInt(req.query.range || '30', 10) || 30, 90));
    const userId = req.user?.id;
    const companyId = req.user?.company_id || req.user?.companyId;

    // Récupérer les IP uniques et leur compteur pour les scans
    const ipRows = await databaseService.query(
      `SELECT ip, COUNT(*) AS scans
       FROM linkpoint_events
       WHERE linkpoint_id IN (
         SELECT id FROM linkpoints WHERE (owner_user_id=? OR company_id=?) AND archived=0
       )
       AND occurred_at >= DATE_SUB(CURDATE(), INTERVAL ? DAY)
       AND event_type='scan'
       AND ip IS NOT NULL AND ip <> ''
       GROUP BY ip`,
      [userId, companyId, range]
    );

    const geoMap = new Map();
    for (const row of ipRows) {
      const ip = (row.ip || '').replace(/^::ffff:/, ''); // IPv4-mapped IPv6
      const scans = Number(row.scans || 0);
      const lookup = geoip.lookup(ip);
      const country_code = lookup?.country || 'UNK';
      const region = lookup?.region || '';
      const key = `${country_code}|${region}`;
      const prev = geoMap.get(key) || { country_code, region, scans: 0 };
      prev.scans += scans;
      geoMap.set(key, prev);
    }

    const byRegion = Array.from(geoMap.values())
      .sort((a, b) => b.scans - a.scans)
      .slice(0, 50);

    res.json({ range, byRegion });
  } catch (e) {
    console.error('GET /api/linkpoints/geo-stats error', e);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// Réinitialisation des statistiques pour un LinkPoint
router.post('/:id/reset', async (req, res) => {
  const id = Number(req.params.id);
  try {
    const { mode } = req.body || {};
    const lp = await databaseService.get('SELECT id FROM linkpoints WHERE id=? AND archived=0', [id]);
    if (!lp) return res.status(404).json({ error: 'LinkPoint introuvable' });

    // Supprimer les stats quotidiennes
    const resDaily = await databaseService.run('DELETE FROM linkpoint_stats_daily WHERE linkpoint_id=?', [id]);

    // En mode "hard", supprimer aussi les événements
    let resEvents = null;
    if ((mode || 'hard') === 'hard') {
      resEvents = await databaseService.run('DELETE FROM linkpoint_events WHERE linkpoint_id=?', [id]);
    }

    res.json({ ok: true, mode: mode || 'hard', deleted: { daily: resDaily?.affectedRows || 0, events: resEvents?.affectedRows || 0 } });
  } catch (e) {
    console.error('POST /api/linkpoints/:id/reset error', e);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});



// Helper: construire contenu backup minimal à partir de la DB
async function buildBackupForId(id) {
  const lp = await databaseService.get('SELECT id, name, type, slug, logo_url, theme, external_url, updated_at FROM linkpoints WHERE id=?', [id]);
  if (!lp) return null;
  const links = await databaseService.query('SELECT label, url, sort_order FROM linkpoint_links WHERE linkpoint_id=? ORDER BY sort_order ASC, id ASC', [id]);
  const updatedAt = new Date(lp.updated_at || Date.now()).toISOString();
  // Mapper types
  let type = 'generated_page';
  let destination = null;
  if (lp.type === 'external' && lp.external_url) {
    type = 'external_url';
    destination = { url: lp.external_url };
  } else if (Array.isArray(links) && links.length > 0) {
    type = 'links_hub';
    destination = links.map(l => ({ label: l.label, url: l.url }));
  } else {
    type = 'generated_page';
    destination = { title: lp.name || lp.slug };
  }
  const publicOptions = {
    logo_url: lp.logo_url || null,
    theme: lp.theme || null,
    title: lp.name || lp.slug,
    labels: { primary: 'Ouvrir', secondary: 'Voir plus' }
  };
  return { slug: lp.slug, type, destination, publicOptions, updatedAt };
}

module.exports = router;