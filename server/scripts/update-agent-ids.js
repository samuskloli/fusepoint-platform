const MariaDBConfig = require('../config/mariadb.config');
const config = new MariaDBConfig();

async function updateAgentIds() {
  let conn;
  try {
    conn = await config.getConnection();
    const rows = await conn.query("SELECT id FROM users WHERE email = 'agent@fusepoint.com'");
    if (rows.length === 0) {
      console.log('Agent not found');
      return;
    }
    const agentId = rows[0].id;
    const updateRes = await conn.query('UPDATE projects SET agent_id = ? WHERE agent_id IS NULL', [agentId]);
    console.log(`Updated ${updateRes.affectedRows} projects`);
  } catch (err) {
    console.error('Error:', err);
  } finally {
    if (conn) conn.release();
  }
}

updateAgentIds();