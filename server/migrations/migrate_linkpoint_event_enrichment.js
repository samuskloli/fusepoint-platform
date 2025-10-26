const databaseService = require('../services/databaseService');

/**
 * Migration script to add country_code, region, device_type to linkpoint_events
 */
async function migrateLinkpointEventEnrichment() {
  console.log('🚀 Starting migration: Enrich linkpoint_events with geo/device columns...');
  try {
    // Helper to check and add a single column
    async function ensureColumn(table, column, definition) {
      const checkQuery = `
        SELECT COUNT(*) as count
        FROM INFORMATION_SCHEMA.COLUMNS
        WHERE TABLE_SCHEMA = DATABASE()
          AND TABLE_NAME = ?
          AND COLUMN_NAME = ?
      `;
      const res = await databaseService.query(checkQuery, [table, column]);
      const exists = (res && res[0] && Number(res[0].count) > 0);
      if (exists) {
        console.log(`✅ Column ${column} already exists on ${table}`);
        return false;
      }
      const alterQuery = `ALTER TABLE ${table} ADD COLUMN ${definition}`;
      await databaseService.query(alterQuery);
      console.log(`✅ Added column ${column} to ${table}`);
      return true;
    }

    let changed = false;
    changed = await ensureColumn('linkpoint_events', 'country_code', "country_code VARCHAR(3) NULL COMMENT 'ISO country code'") || changed;
    changed = await ensureColumn('linkpoint_events', 'region', "region VARCHAR(64) NULL COMMENT 'Region/subdivision code or name'") || changed;
    changed = await ensureColumn('linkpoint_events', 'device_type', "device_type VARCHAR(32) NULL COMMENT 'Device type classification'" ) || changed;

    // Optional indexes to speed aggregations
    try {
      await databaseService.query("CREATE INDEX IF NOT EXISTS idx_linkpoint_events_geo ON linkpoint_events (linkpoint_id, event_type, occurred_at, country_code, region)");
      await databaseService.query("CREATE INDEX IF NOT EXISTS idx_linkpoint_events_device ON linkpoint_events (linkpoint_id, event_type, occurred_at, device_type)");
      console.log('🧭 Indexes ensured');
    } catch (e) {
      // MariaDB < 10.5 does not support IF NOT EXISTS on CREATE INDEX via ALTER; fallback quietly
      const msg = String(e.message || '').toLowerCase();
      if (!msg.includes('duplicate') && !msg.includes('exists')) {
        console.warn('⚠️ Index creation note:', e.message);
      }
    }

    console.log('🎉 Migration completed', { changed });
  } catch (error) {
    console.error('💥 Migration failed:', error);
    throw error;
  }
}

if (require.main === module) {
  migrateLinkpointEventEnrichment()
    .then(() => process.exit(0))
    .catch(() => process.exit(1));
}

module.exports = { migrateLinkpointEventEnrichment };