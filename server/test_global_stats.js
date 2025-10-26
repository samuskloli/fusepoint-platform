const mysql = require('mysql2/promise');

async function testGlobalStats() {
    let connection;
    
    try {
        // Configuration de la base de données MariaDB
        const dbConfig = {
            host: 'localhost',
            user: 'oliveirasamuel',
            password: 'FusepointDB2025!',
            database: 'fusepoint_db',
            port: 3306
        };

        connection = await mysql.createConnection(dbConfig);
        console.log('✅ Connexion à la base de données réussie');
        
        // Simuler la requête de l'endpoint global-stats
        console.log('\n📊 === TEST DE LA REQUÊTE GLOBAL-STATS ===');
        
        // Paramètres de test (simuler un utilisateur avec company_id = 1)
        const userId = 1; // Exemple
        const companyId = 1;
        const range = 30;
        
        console.log(`Paramètres: userId=${userId}, companyId=${companyId}, range=${range}`);
        
        // 1. Vérifier les linkpoints de l'utilisateur/entreprise
        console.log('\n🔍 === LINKPOINTS DE L\'UTILISATEUR/ENTREPRISE ===');
        const [userLinkpoints] = await connection.execute(`
            SELECT id, name, owner_user_id, company_id, archived 
            FROM linkpoints 
            WHERE (owner_user_id=? OR company_id=?) AND archived=0
        `, [userId, companyId]);
        
        console.log(`Linkpoints trouvés: ${userLinkpoints.length}`);
        userLinkpoints.forEach(lp => {
            console.log(`- ID: ${lp.id}, Nom: ${lp.name}, Owner: ${lp.owner_user_id}, Company: ${lp.company_id}`);
        });
        
        if (userLinkpoints.length === 0) {
            console.log('❌ Aucun linkpoint trouvé pour cet utilisateur/entreprise');
            return;
        }
        
        // 2. Exécuter la requête exacte de l'endpoint
        console.log('\n📈 === REQUÊTE GLOBAL-STATS ===');
        const [daily] = await connection.execute(`
            SELECT DATE(occurred_at) AS day,
                   SUM(event_type='scan') AS scans,
                   SUM(event_type='click') AS clicks
            FROM linkpoint_events
            WHERE linkpoint_id IN (
              SELECT id FROM linkpoints WHERE (owner_user_id=? OR company_id=?) AND archived=0
            )
            AND occurred_at >= DATE_SUB(CURDATE(), INTERVAL ? DAY)
            GROUP BY day
            ORDER BY day ASC
        `, [userId, companyId, range]);
        
        console.log(`Résultats quotidiens: ${daily.length} jours`);
        daily.forEach(d => {
            console.log(`- ${d.day}: ${d.scans} scans, ${d.clicks} clics`);
        });
        
        // 3. Calculer les totaux
        const totals = daily.reduce((acc, d) => {
            acc.scans += Number(d.scans || 0);
            acc.clicks += Number(d.clicks || 0);
            return acc;
        }, { scans: 0, clicks: 0 });
        
        const ctr = totals.scans > 0 ? (totals.clicks * 100.0) / totals.scans : 0;
        const lastScanDate = daily.filter(d => Number(d.scans || 0) > 0).slice(-1)[0]?.day || null;
        const avgPerDay = {
            scans: range > 0 ? totals.scans / range : 0,
            clicks: range > 0 ? totals.clicks / range : 0
        };
        
        console.log('\n📊 === RÉSULTATS FINAUX ===');
        console.log(`Totaux: ${totals.scans} scans, ${totals.clicks} clics`);
        console.log(`CTR: ${ctr.toFixed(2)}%`);
        console.log(`Dernière date de scan: ${lastScanDate}`);
        console.log(`Moyenne par jour: ${avgPerDay.scans.toFixed(2)} scans, ${avgPerDay.clicks.toFixed(2)} clics`);
        
        // 4. Vérifier tous les événements sans filtre de date
        console.log('\n🔍 === TOUS LES ÉVÉNEMENTS (SANS FILTRE DATE) ===');
        const [allEvents] = await connection.execute(`
            SELECT DATE(occurred_at) AS day,
                   SUM(event_type='scan') AS scans,
                   SUM(event_type='click') AS clicks
            FROM linkpoint_events
            WHERE linkpoint_id IN (
              SELECT id FROM linkpoints WHERE (owner_user_id=? OR company_id=?) AND archived=0
            )
            GROUP BY day
            ORDER BY day DESC
        `, [userId, companyId]);
        
        console.log(`Total événements (tous les jours): ${allEvents.length} jours`);
        allEvents.forEach(d => {
            console.log(`- ${d.day}: ${d.scans} scans, ${d.clicks} clics`);
        });
        
        const allTotals = allEvents.reduce((acc, d) => {
            acc.scans += Number(d.scans || 0);
            acc.clicks += Number(d.clicks || 0);
            return acc;
        }, { scans: 0, clicks: 0 });
        
        console.log(`Totaux (tous les temps): ${allTotals.scans} scans, ${allTotals.clicks} clics`);

    } catch (error) {
        console.error('❌ Erreur:', error.message);
    } finally {
        if (connection) {
            await connection.end();
        }
    }
}

testGlobalStats();