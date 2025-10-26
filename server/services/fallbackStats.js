const fs = require('fs');
const path = require('path');
const backupSvc = require('./linkpointBackup');

const EVENTS_FILE = path.join(backupSvc.BACKUP_DIR, 'events.log');

function ensure() { backupSvc.ensureDir(); }

function appendEvent(event) {
  ensure();
  const line = JSON.stringify({ ...event, occurredAt: new Date().toISOString() }) + '\n';
  fs.appendFileSync(EVENTS_FILE, line, { encoding: 'utf8' });
}

function recordScan(slug, meta = {}) {
  appendEvent({ type: 'scan_fallback', slug, ...meta });
}

function recordClick(slug, meta = {}) {
  appendEvent({ type: 'click_fallback', slug, ...meta });
}

function readAll() {
  try {
    const txt = fs.readFileSync(EVENTS_FILE, 'utf8');
    return txt.split('\n').filter(Boolean).map(l => JSON.parse(l));
  } catch (e) {
    return [];
  }
}

function clearAll() {
  try { fs.unlinkSync(EVENTS_FILE); } catch (e) { /* ignore */ }
}

module.exports = { recordScan, recordClick, readAll, clearAll, EVENTS_FILE };