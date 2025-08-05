const databaseService = require('./services/databaseService');
require('dotenv').config({ path: './.env' });

async function checkLogs() {
  try {
    await databaseService.initialize();
    console.log('✅ Base de données initialisée');
    
    // Vérifier les logs récents
    const query = `
      SELECT * FROM system_logs 
      WHERE category = 'email' OR message LIKE '%email%' OR message LIKE '%SMTP%' 
      ORDER BY created_at DESC 
      LIMIT 10
    `;
    
    const logs = await new Promise((resolve, reject) => {
      databaseService.db.all(query, (err, rows) => {
        if (err) reject(err);
        else resolve(rows);
      });
    });
    
    console.log('\n📋 Logs email récents:');
    if (logs.length === 0) {
      console.log('Aucun log email trouvé');
    } else {
      logs.forEach(log => {
        console.log(`[${log.created_at}] ${log.level}: ${log.message}`);
        if (log.metadata) {
          console.log(`   Metadata: ${log.metadata}`);
        }
      });
    }
    
    // Vérifier tous les logs récents
    const allLogsQuery = `
      SELECT * FROM system_logs 
      ORDER BY created_at DESC 
      LIMIT 20
    `;
    
    const allLogs = await new Promise((resolve, reject) => {
      databaseService.db.all(allLogsQuery, (err, rows) => {
        if (err) reject(err);
        else resolve(rows);
      });
    });
    
    console.log('\n📋 Tous les logs récents:');
    allLogs.forEach(log => {
      console.log(`[${log.created_at}] ${log.level} [${log.category}]: ${log.message}`);
    });
    
  } catch (error) {
    console.error('❌ Erreur:', error.message);
  } finally {
    process.exit(0);
  }
}

checkLogs();