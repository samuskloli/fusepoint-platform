const mysql = require('mysql2/promise');
const path = require('path');
const fs = require('fs');

async function loadEnv() {
  const candidates = [
    path.join(__dirname, '..', '.env.mariadb'),
    path.join(__dirname, '..', '.env'),
  ];
  for (const p of candidates) {
    if (fs.existsSync(p)) {
      const content = fs.readFileSync(p, 'utf8');
      for (const line of content.split('\n')) {
        const trimmed = line.trim();
        if (!trimmed || trimmed.startsWith('#')) continue;
        const idx = trimmed.indexOf('=');
        if (idx > 0) {
          const key = trimmed.slice(0, idx).trim();
          const value = trimmed.slice(idx + 1).trim();
          process.env[key] = value;
        }
      }
    }
  }
}

async function main() {
  await loadEnv();
  const conf = {
    host: process.env.MARIADB_HOST || process.env.DB_HOST || 'localhost',
    user: process.env.MARIADB_USER || process.env.DB_USER || 'root',
    password: process.env.MARIADB_PASSWORD || process.env.DB_PASSWORD || '',
    database: process.env.MARIADB_DATABASE || process.env.DB_NAME || 'fusepoint_db',
    port: Number(process.env.MARIADB_PORT || process.env.DB_PORT || 3306)
  };
  const conn = await mysql.createConnection(conf);
  console.log('✅ Connecté à MariaDB');

  try {
    // Test query from clientWidgetConfigs route
    const clientType = 'small_business';
    const [templates] = await conn.execute(`
      SELECT 
        cwt.*, w.name AS widget_name, w.component_name, w.category, w.icon
      FROM client_widget_templates cwt
      INNER JOIN widgets w ON cwt.widget_id = w.id
      WHERE cwt.client_type = ? AND cwt.is_enabled = 1
      ORDER BY cwt.default_position_y, cwt.default_position_x
    `, [clientType]);
    console.log(`📄 Templates (${clientType}):`, templates.length);

    // Test client_widget_configs active filter exists
    const [configs] = await conn.execute(`
      SELECT COUNT(*) AS cnt FROM client_widget_configs WHERE is_active = 1
    `);
    console.log('📄 client_widget_configs actifs:', configs[0]?.cnt);

    // Verify ability to filter by is_active now on templates
    const [templatesActiveOnly] = await conn.execute(`
      SELECT 
        cwt.*, w.name AS widget_name, w.component_name, w.category, w.icon
      FROM client_widget_templates cwt
      INNER JOIN widgets w ON cwt.widget_id = w.id
      WHERE cwt.client_type = ? AND cwt.is_enabled = 1 AND cwt.is_active = 1
      ORDER BY cwt.default_position_y, cwt.default_position_x
    `, [clientType]);
    console.log(`📄 Templates actifs (${clientType}):`, templatesActiveOnly.length);
  } catch (e) {
    console.error('❌ Erreur test requêtes:', e.message);
    process.exit(1);
  } finally {
    await conn.end();
    console.log('✅ Connexion fermée');
  }
}

main();