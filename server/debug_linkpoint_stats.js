const mysql = require('mysql2/promise');

async function debugLinkpointStats() {
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
        
        // 1. D'abord vérifier la structure de la table linkpoints
        console.log('\n🏗️ === STRUCTURE DE LA TABLE LINKPOINTS ===');
        const [linkpointsStructure] = await connection.execute(`
            DESCRIBE linkpoints
        `);
        console.log('Structure linkpoints:');
        linkpointsStructure.forEach(col => {
            console.log(`  - ${col.Field}: ${col.Type} ${col.Null === 'YES' ? 'NULL' : 'NOT NULL'}`);
        });

        // 2. Vérifier les linkpoints existants (avec les bonnes colonnes)
        console.log('\n📋 === LINKPOINTS EXISTANTS ===');
        const [linkpoints] = await connection.execute(`
            SELECT * FROM linkpoints 
            ORDER BY created_at DESC 
            LIMIT 10
        `);
        console.log(`Nombre de linkpoints: ${linkpoints.length}`);
        linkpoints.forEach(lp => {
            console.log(`- ID: ${lp.id}, Nom: ${lp.name || lp.title || 'Sans nom'}, User: ${lp.user_id}, Company: ${lp.company_id}`);
        });

        // 3. Vérifier la structure de la table linkpoint_events
        console.log('\n🏗️ === STRUCTURE DE LA TABLE LINKPOINT_EVENTS ===');
        try {
            const [linkpointEventsStructure] = await connection.execute(`
                DESCRIBE linkpoint_events
            `);
            console.log('Structure linkpoint_events:');
            linkpointEventsStructure.forEach(col => {
                console.log(`  - ${col.Field}: ${col.Type} ${col.Null === 'YES' ? 'NULL' : 'NOT NULL'}`);
            });
        } catch (error) {
            console.log('❌ Table linkpoint_events n\'existe pas:', error.message);
        }

        // 4. Vérifier la table linkpoint_events
        console.log('\n📊 === ÉVÉNEMENTS LINKPOINT ===');
        const [events] = await connection.execute(`
            SELECT COUNT(*) as total_events FROM linkpoint_events
        `);
        console.log(`Total d'événements: ${events[0].total_events}`);

        if (events[0].total_events > 0) {
            const [recentEvents] = await connection.execute(`
                SELECT linkpoint_id, event_type, occurred_at, ip, user_agent
                FROM linkpoint_events 
                ORDER BY occurred_at DESC 
                LIMIT 10
            `);
            console.log('Événements récents:');
            recentEvents.forEach(event => {
                console.log(`- LinkPoint: ${event.linkpoint_id}, Type: ${event.event_type}, Date: ${event.occurred_at}`);
            });

            // Statistiques par type d'événement
            const [eventStats] = await connection.execute(`
                SELECT event_type, COUNT(*) as count
                FROM linkpoint_events 
                GROUP BY event_type
            `);
            console.log('\nStatistiques par type:');
            eventStats.forEach(stat => {
                console.log(`- ${stat.event_type}: ${stat.count}`);
            });
        }

        // 3. Vérifier la structure de la table linkpoint_stats_daily
        console.log('\n🏗️ === STRUCTURE DE LA TABLE LINKPOINT_STATS_DAILY ===');
        try {
            const [dailyStatsStructure] = await connection.execute(`
                DESCRIBE linkpoint_stats_daily
            `);
            console.log('Structure linkpoint_stats_daily:');
            dailyStatsStructure.forEach(col => {
                console.log(`  - ${col.Field}: ${col.Type} ${col.Null === 'YES' ? 'NULL' : 'NOT NULL'}`);
            });

            // Vérifier les données
            console.log('\n📈 === STATISTIQUES QUOTIDIENNES ===');
            const [dailyStats] = await connection.execute(`
                SELECT COUNT(*) as total_daily_stats FROM linkpoint_stats_daily
            `);
            console.log(`Total de statistiques quotidiennes: ${dailyStats[0].total_daily_stats}`);

            if (dailyStats[0].total_daily_stats > 0) {
                const [recentDailyStats] = await connection.execute(`
                    SELECT * FROM linkpoint_stats_daily 
                    ORDER BY id DESC 
                    LIMIT 10
                `);
                console.log('Statistiques quotidiennes récentes:');
                recentDailyStats.forEach(stat => {
                    console.log(`- LinkPoint: ${stat.linkpoint_id}, Données:`, stat);
                });
            }
        } catch (error) {
            console.log('❌ Table linkpoint_stats_daily n\'existe pas ou erreur:', error.message);
        }

        // 4. Vérifier les totaux calculés pour chaque linkpoint
        console.log('\n🔢 === TOTAUX CALCULÉS ===');
        if (linkpoints.length > 0) {
            for (const lp of linkpoints.slice(0, 5)) { // Vérifier les 5 premiers
                const [totalScans] = await connection.execute(`
                    SELECT COUNT(*) as total_scans 
                    FROM linkpoint_events 
                    WHERE linkpoint_id = ? AND event_type = 'scan'
                `, [lp.id]);

                const [totalClicks] = await connection.execute(`
                    SELECT COUNT(*) as total_clicks 
                    FROM linkpoint_events 
                    WHERE linkpoint_id = ? AND event_type = 'click'
                `, [lp.id]);

                console.log(`LinkPoint ${lp.id} (${lp.name}):`);
                console.log(`  - Scans: ${totalScans[0].total_scans}`);
                console.log(`  - Clics: ${totalClicks[0].total_clicks}`);
            }
        }

        // 5. Tester l'insertion d'un événement de test
        console.log('\n🧪 === TEST D\'INSERTION ===');
        if (linkpoints.length > 0) {
            const testLinkpointId = linkpoints[0].id;
            
            try {
                await connection.execute(`
                    INSERT INTO linkpoint_events (linkpoint_id, event_type, ip, user_agent, occurred_at)
                    VALUES (?, 'scan', '127.0.0.1', 'Test-Agent', NOW())
                `, [testLinkpointId]);
                
                console.log(`✅ Test d'insertion réussi pour linkpoint ${testLinkpointId}`);
                
                // Vérifier que l'insertion a fonctionné
                const [newCount] = await connection.execute(`
                    SELECT COUNT(*) as count 
                    FROM linkpoint_events 
                    WHERE linkpoint_id = ? AND event_type = 'scan'
                `, [testLinkpointId]);
                
                console.log(`Nouveau nombre de scans pour linkpoint ${testLinkpointId}: ${newCount[0].count}`);
                
            } catch (insertError) {
                console.error('❌ Erreur lors du test d\'insertion:', insertError.message);
            }
        }

    } catch (error) {
        console.error('❌ Erreur:', error.message);
    } finally {
        if (connection) {
            await connection.end();
        }
    }
}

debugLinkpointStats();