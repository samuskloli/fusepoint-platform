const mariadb = require('mariadb');

async function testConnection() {
  try {
    console.log('🔍 Test de connexion à MariaDB Infomaniak...');
    
    const pool = mariadb.createPool({
      host: 'tt3ae.myd.infomaniak.com',
      port: 3306,
      user: 'tt3ae_sam',
      password: 'JbW4D~7.@91.aGs',
      database: 'tt3ae_fusepoint',
      connectionLimit: 5,
      acquireTimeout: 10000,
      timeout: 10000
    });
    
    const conn = await pool.getConnection();
    console.log('✅ Connexion réussie à MariaDB Infomaniak');
    
    const result = await conn.query('SELECT 1 as test');
    console.log('✅ Test query réussie:', result);
    
    // Test des tables existantes
    const tables = await conn.query('SHOW TABLES');
    console.log('📋 Tables disponibles:', tables.length);
    
    conn.release();
    await pool.end();
    console.log('✅ Connexion fermée proprement');
  } catch (error) {
    console.error('❌ Erreur de connexion:', error.message);
    console.error('❌ Code erreur:', error.code);
    console.error('❌ Détails:', error);
  }
}

testConnection();