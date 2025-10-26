const fs = require('fs');
const path = require('path');
const os = require('os');

const ROOT_DIR = path.resolve(__dirname, '../../');
const BACKUP_DIR = path.join(ROOT_DIR, 'backup_redirects');

// Petite cache mémoire (TTL court)
const cache = new Map();
const CACHE_TTL_MS = 10_000; // 10s

function ensureDir() {
  try {
    fs.mkdirSync(BACKUP_DIR, { recursive: true });
  } catch (e) {
    // noop
  }
}

function filePathForSlug(slug) {
  const safe = String(slug).replace(/[^a-zA-Z0-9_-]/g, '-');
  return path.join(BACKUP_DIR, `${safe}.json`);
}

function rotatedFilePath(slug, index = 1) {
  const safe = String(slug).replace(/[^a-zA-Z0-9_-]/g, '-');
  return path.join(BACKUP_DIR, `${safe}.${index}.json`);
}

function nowIso() { return new Date().toISOString(); }

function writeAtomic(slug, data) {
  ensureDir();
  const target = filePathForSlug(slug);
  const tmp = target + '.tmp';
  const json = JSON.stringify(data);
  // Rotation simple: conserver une version précédente
  try {
    if (fs.existsSync(target)) {
      const rot = rotatedFilePath(slug, 1);
      try { fs.renameSync(target, rot); } catch (e) { /* ignore */ }
    }
  } catch (e) { /* ignore */ }
  // Écriture atomique via fichier temporaire puis rename
  fs.writeFileSync(tmp, json, { encoding: 'utf8' });
  fs.renameSync(tmp, target);
  // Mettre en cache
  cache.set(slug, { ts: Date.now(), data });
}

function read(slug) {
  // Cache d’abord
  const hit = cache.get(slug);
  if (hit && (Date.now() - hit.ts) < CACHE_TTL_MS) return hit.data;
  const target = filePathForSlug(slug);
  try {
    const txt = fs.readFileSync(target, 'utf8');
    const data = JSON.parse(txt);
    cache.set(slug, { ts: Date.now(), data });
    return data;
  } catch (e) {
    return null;
  }
}

function exists(slug) {
  try { return fs.existsSync(filePathForSlug(slug)); } catch { return false; }
}

function remove(slug) {
  try {
    const target = filePathForSlug(slug);
    if (fs.existsSync(target)) fs.unlinkSync(target);
    cache.delete(slug);
    return true;
  } catch (e) { return false; }
}

function listBackups() {
  ensureDir();
  const files = fs.readdirSync(BACKUP_DIR).filter(f => f.endsWith('.json') && !f.endsWith('.tmp'));
  return files.map(f => ({ file: f, slug: f.replace(/\.\d+\.json$/, '').replace(/\.json$/, ''), path: path.join(BACKUP_DIR, f) }));
}

function getBackupMeta(slug) {
  const data = read(slug);
  if (!data) return null;
  return {
    slug: data.slug,
    type: data.type,
    updatedAt: data.updatedAt || null,
  };
}

function zipAll(res) {
  // Génération ZIP simple en streaming via archiver (si dispo) sinon renvoi tarball JSON minimal
  // Pour limiter la complexité, on fait un ZIP basique sans compression forte.
  const archiver = require('archiver');
  ensureDir();
  const archive = archiver('zip', { zlib: { level: 1 } });
  archive.on('error', err => { throw err; });
  res.setHeader('Content-Type', 'application/zip');
  res.setHeader('Content-Disposition', 'attachment; filename="backup_redirects.zip"');
  archive.pipe(res);
  archive.directory(BACKUP_DIR, false);
  archive.finalize();
}

function scanIntegrity(getAllDbSlugsFn) {
  ensureDir();
  let files = [];
  try { files = fs.readdirSync(BACKUP_DIR).filter(f => f.endsWith('.json') && !f.endsWith('.tmp')); } catch (e) { files = []; }
  const backupSlugs = new Set(files.map(f => f.replace(/\.\d+\.json$/, '').replace(/\.json$/, '')));
  let dbSlugs = [];
  try { dbSlugs = getAllDbSlugsFn ? getAllDbSlugsFn() : []; } catch { dbSlugs = []; }
  const dbSet = new Set(dbSlugs);
  const missingFiles = [...dbSet].filter(s => !backupSlugs.has(s));
  const orphanFiles = [...backupSlugs].filter(s => !dbSet.has(s));
  const summary = {
    totalSlugs: dbSlugs.length,
    filesCount: backupSlugs.size,
    missingFiles,
    orphanFiles,
    checkedAt: nowIso()
  };
  return summary;
}

module.exports = {
  BACKUP_DIR,
  ensureDir,
  filePathForSlug,
  writeAtomic,
  read,
  exists,
  remove,
  listBackups,
  getBackupMeta,
  zipAll,
  scanIntegrity,
};