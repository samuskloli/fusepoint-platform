const mysql = require('mysql2/promise');
const path = require('path');
const fs = require('fs');

async function loadEnv() {
  const candidates = [
    path.join(__dirname, '..', '.env.mariadb'),
    path.join(__dirname, '..', '.env'),
    path.join(__dirname, '.env.mariadb'),
    path.join(__dirname, '.env')
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

async function getDbConnection() {
  await loadEnv();
  const conf = {
    host: process.env.MARIADB_HOST || process.env.DB_HOST || 'localhost',
    user: process.env.MARIADB_USER || process.env.DB_USER || 'root',
    password: process.env.MARIADB_PASSWORD || process.env.DB_PASSWORD || '',
    database: process.env.MARIADB_DATABASE || process.env.DB_NAME || 'fusepoint_db',
    port: Number(process.env.MARIADB_PORT || process.env.DB_PORT || 3306)
  };
  const conn = await mysql.createConnection(conf);
  return { conn, conf };
}

async function showTableInfo(conn, table) {
  try {
    const [columns] = await conn.execute(`SHOW COLUMNS FROM \`${table}\``);
    const [indexes] = await conn.execute(`SHOW INDEX FROM \`${table}\``);
    console.log(`\n=== Table ${table} ===`);
    console.log('Columns:', columns.map(c => `${c.Field} (${c.Type})`).join(', '));
    const idxSummary = indexes.map(i => `${i.Key_name}:${i.Column_name}`).join(', ');
    console.log('Indexes:', idxSummary || '(none)');
    return { columns, indexes };
  } catch (e) {
    console.log(`\n=== Table ${table} ===`);
    console.log('Erreur:', e.message);
    return null;
  }
}

function hasColumn(columns, name) {
  return Array.isArray(columns) && columns.some(c => c.Field === name);
}

function hasIndex(indexes, keyName) {
  return Array.isArray(indexes) && indexes.some(i => i.Key_name === keyName);
}

async function ensureClientWidgetTemplates(conn) {
  const info = await showTableInfo(conn, 'client_widget_templates');
  if (!info) return;
  const { columns, indexes } = info;

  // Add missing columns
  if (!hasColumn(columns, 'is_enabled')) {
    try {
      await conn.execute("ALTER TABLE client_widget_templates ADD COLUMN is_enabled TINYINT(1) NOT NULL DEFAULT 1");
      console.log('✅ Ajout colonne is_enabled sur client_widget_templates');
    } catch (e) {
      console.log('⚠️ Ajout colonne is_enabled échoué:', e.message);
    }
  }
  if (!hasColumn(columns, 'is_active')) {
    try {
      await conn.execute("ALTER TABLE client_widget_templates ADD COLUMN is_active TINYINT(1) NOT NULL DEFAULT 1");
      console.log('✅ Ajout colonne is_active sur client_widget_templates');
    } catch (e) {
      console.log('⚠️ Ajout colonne is_active échoué:', e.message);
    }
  }

  // Re-check columns after changes
  const [columns2] = await conn.execute("SHOW COLUMNS FROM `client_widget_templates`");

  // Ensure indexes
  if (!hasIndex(indexes, 'idx_cwt_client_type')) {
    try {
      await conn.execute("CREATE INDEX idx_cwt_client_type ON client_widget_templates (client_type)");
      console.log('✅ Index idx_cwt_client_type créé');
    } catch (e) {
      console.log('⚠️ Création index idx_cwt_client_type échouée:', e.message);
    }
  }
  // For idx_cwt_active, ensure column exists before creating
  const hasActiveCol = hasColumn(columns2, 'is_active');
  if (hasActiveCol && !hasIndex(indexes, 'idx_cwt_active')) {
    try {
      await conn.execute("CREATE INDEX idx_cwt_active ON client_widget_templates (is_active)");
      console.log('✅ Index idx_cwt_active créé');
    } catch (e) {
      console.log('⚠️ Création index idx_cwt_active échouée:', e.message);
    }
  } else if (!hasActiveCol) {
    console.log('⚠️ Index idx_cwt_active non créé: colonne is_active absente');
  }
}

async function main() {
  try {
    const { conn, conf } = await getDbConnection();
    console.log('✅ Connecté à MariaDB:', conf);

    // Inspect tables of interest
    await showTableInfo(conn, 'client_widget_templates');
    await showTableInfo(conn, 'client_widget_configs');
    await showTableInfo(conn, 'widgets');
    await showTableInfo(conn, 'project_templates');
    await showTableInfo(conn, 'project_template_widgets');

    // Ensure fixes on client_widget_templates
    await ensureClientWidgetTemplates(conn);

    console.log('\n✅ Vérification et corrections terminées');
    await conn.end();
  } catch (e) {
    console.error('❌ Erreur check-db-structure:', e.message);
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}