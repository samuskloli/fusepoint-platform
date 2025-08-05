#!/usr/bin/env node

/**
 * Script Node.js pour synchroniser sélectivement les données entre la base locale et le serveur
 * Usage: node sync-database-to-server.cjs [options]
 */

const sqlite3 = require('sqlite3').verbose();
const { exec } = require('child_process');
const fs = require('fs');
const path = require('path');
const readline = require('readline');

// Configuration
const CONFIG = {
    localDb: 'server/database/fusepoint.db',
    serverUser: 'gjNCbjZ4HAb_sam',
    serverHost: '57-101961.ssh.hosting-ik.com',
    remotePath: 'sites/beta.fusepoint.ch/server/database',
    backupDir: 'database-backups'
};

// Interface readline pour les interactions utilisateur
const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

// Utilitaires d'affichage
const colors = {
    reset: '\x1b[0m',
    red: '\x1b[31m',
    green: '\x1b[32m',
    yellow: '\x1b[33m',
    blue: '\x1b[34m',
    cyan: '\x1b[36m'
};

function log(message, color = 'blue') {
    const timestamp = new Date().toLocaleTimeString();
    console.log(`${colors[color]}[${timestamp}]${colors.reset} ${message}`);
}

function success(message) {
    console.log(`${colors.green}✅ ${message}${colors.reset}`);
}

function warning(message) {
    console.log(`${colors.yellow}⚠️  ${message}${colors.reset}`);
}

function error(message) {
    console.log(`${colors.red}❌ ${message}${colors.reset}`);
    process.exit(1);
}

// Fonction pour exécuter des commandes SSH
function execSSH(command) {
    return new Promise((resolve, reject) => {
        const sshCommand = `ssh ${CONFIG.serverUser}@${CONFIG.serverHost} "${command}"`;
        exec(sshCommand, (error, stdout, stderr) => {
            if (error) {
                reject(error);
            } else {
                resolve(stdout.trim());
            }
        });
    });
}

// Fonction pour exécuter des commandes locales
function execLocal(command) {
    return new Promise((resolve, reject) => {
        exec(command, (error, stdout, stderr) => {
            if (error) {
                reject(error);
            } else {
                resolve(stdout.trim());
            }
        });
    });
}

// Fonction pour poser une question à l'utilisateur
function askQuestion(question) {
    return new Promise((resolve) => {
        rl.question(question, (answer) => {
            resolve(answer);
        });
    });
}

// Analyse des tables et données
async function analyzeDatabase(dbPath, isRemote = false) {
    const analysis = {
        tables: [],
        counts: {},
        structure: {}
    };

    try {
        let tablesQuery, countQueries;
        
        if (isRemote) {
            // Requêtes pour la base distante via SSH
            const tablesResult = await execSSH(`cd ${CONFIG.remotePath} && sqlite3 fusepoint.db "SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%' ORDER BY name;"`);
            analysis.tables = tablesResult.split('\n').filter(t => t.trim());
            
            // Compter les enregistrements pour chaque table
            for (const table of analysis.tables) {
                try {
                    const count = await execSSH(`cd ${CONFIG.remotePath} && sqlite3 fusepoint.db "SELECT COUNT(*) FROM ${table};"`);
                    analysis.counts[table] = parseInt(count) || 0;
                } catch (e) {
                    analysis.counts[table] = 0;
                }
            }
        } else {
            // Requêtes pour la base locale
            const db = new sqlite3.Database(dbPath);
            
            analysis.tables = await new Promise((resolve, reject) => {
                db.all("SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%' ORDER BY name", (err, rows) => {
                    if (err) reject(err);
                    else resolve(rows.map(r => r.name));
                });
            });
            
            // Compter les enregistrements
            for (const table of analysis.tables) {
                try {
                    const count = await new Promise((resolve, reject) => {
                        db.get(`SELECT COUNT(*) as count FROM ${table}`, (err, row) => {
                            if (err) reject(err);
                            else resolve(row.count);
                        });
                    });
                    analysis.counts[table] = count;
                } catch (e) {
                    analysis.counts[table] = 0;
                }
            }
            
            db.close();
        }
    } catch (e) {
        warning(`Erreur lors de l'analyse: ${e.message}`);
    }
    
    return analysis;
}

// Synchronisation sélective des tables
async function syncTables(selectedTables, mode = 'replace') {
    log('🔄 Début de la synchronisation...');
    
    // Créer le répertoire de sauvegarde
    if (!fs.existsSync(CONFIG.backupDir)) {
        fs.mkdirSync(CONFIG.backupDir, { recursive: true });
    }
    
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    
    for (const table of selectedTables) {
        log(`📋 Synchronisation de la table: ${table}`);
        
        try {
            // Exporter les données de la table locale
            const exportFile = path.join(CONFIG.backupDir, `${table}_export_${timestamp}.sql`);
            await execLocal(`sqlite3 ${CONFIG.localDb} ".mode insert ${table}" ".output ${exportFile}" "SELECT * FROM ${table};"`);
            
            // Créer un script de synchronisation pour cette table
            const syncScript = `
                -- Sauvegarde de la table ${table}
                CREATE TABLE IF NOT EXISTS ${table}_backup_${timestamp} AS SELECT * FROM ${table};
                
                -- ${mode === 'replace' ? 'Remplacement' : 'Ajout'} des données
                ${mode === 'replace' ? `DELETE FROM ${table};` : ''}
                
                -- Import des nouvelles données
                .read ${exportFile}
            `;
            
            const syncFile = path.join(CONFIG.backupDir, `sync_${table}_${timestamp}.sql`);
            fs.writeFileSync(syncFile, syncScript);
            
            // Transférer et exécuter sur le serveur
            await execLocal(`scp ${exportFile} ${CONFIG.serverUser}@${CONFIG.serverHost}:${CONFIG.remotePath}/`);
            await execLocal(`scp ${syncFile} ${CONFIG.serverUser}@${CONFIG.serverHost}:${CONFIG.remotePath}/`);
            
            // Exécuter la synchronisation sur le serveur
            await execSSH(`cd ${CONFIG.remotePath} && sqlite3 fusepoint.db < sync_${table}_${timestamp}.sql`);
            
            // Nettoyer les fichiers temporaires sur le serveur
            await execSSH(`cd ${CONFIG.remotePath} && rm -f ${table}_export_${timestamp}.sql sync_${table}_${timestamp}.sql`);
            
            success(`Table ${table} synchronisée`);
            
        } catch (e) {
            error(`Erreur lors de la synchronisation de ${table}: ${e.message}`);
        }
    }
}

// Menu principal
async function mainMenu() {
    console.log('\n' + colors.cyan + '🔄 Synchronisation Base de Données Fusepoint' + colors.reset);
    console.log('=' .repeat(50));
    
    log('📊 Analyse des bases de données...');
    
    const localAnalysis = await analyzeDatabase(CONFIG.localDb, false);
    const serverAnalysis = await analyzeDatabase(null, true);
    
    console.log('\n📋 Comparaison des données:');
    console.log('Table'.padEnd(25) + 'Local'.padEnd(10) + 'Serveur'.padEnd(10) + 'Différence');
    console.log('-'.repeat(55));
    
    const allTables = [...new Set([...localAnalysis.tables, ...serverAnalysis.tables])];
    
    for (const table of allTables) {
        const localCount = localAnalysis.counts[table] || 0;
        const serverCount = serverAnalysis.counts[table] || 0;
        const diff = localCount - serverCount;
        const diffStr = diff > 0 ? `+${diff}` : diff.toString();
        
        console.log(
            table.padEnd(25) + 
            localCount.toString().padEnd(10) + 
            serverCount.toString().padEnd(10) + 
            diffStr
        );
    }
    
    console.log('\n🎯 Options disponibles:');
    console.log('1. Synchronisation complète (remplace toutes les données)');
    console.log('2. Synchronisation sélective (choisir les tables)');
    console.log('3. Synchronisation des utilisateurs uniquement');
    console.log('4. Synchronisation des entreprises uniquement');
    console.log('5. Analyse détaillée des différences');
    console.log('6. Quitter');
    
    const choice = await askQuestion('\nChoisissez une option (1-6): ');
    
    switch (choice) {
        case '1':
            const confirm = await askQuestion('⚠️  Cela remplacera TOUTES les données du serveur. Continuer? (y/N): ');
            if (confirm.toLowerCase() === 'y') {
                await syncTables(localAnalysis.tables, 'replace');
            }
            break;
            
        case '2':
            console.log('\n📋 Tables disponibles:');
            localAnalysis.tables.forEach((table, index) => {
                console.log(`${index + 1}. ${table} (${localAnalysis.counts[table]} enregistrements)`);
            });
            
            const tableChoice = await askQuestion('\nEntrez les numéros des tables à synchroniser (ex: 1,3,5): ');
            const selectedIndexes = tableChoice.split(',').map(i => parseInt(i.trim()) - 1);
            const selectedTables = selectedIndexes.map(i => localAnalysis.tables[i]).filter(t => t);
            
            if (selectedTables.length > 0) {
                await syncTables(selectedTables, 'replace');
            }
            break;
            
        case '3':
            await syncTables(['users'], 'replace');
            break;
            
        case '4':
            await syncTables(['companies'], 'replace');
            break;
            
        case '5':
            // Analyse détaillée - à implémenter
            warning('Analyse détaillée pas encore implémentée');
            break;
            
        case '6':
            log('👋 Au revoir!');
            process.exit(0);
            break;
            
        default:
            warning('Option invalide');
            await mainMenu();
    }
    
    const continueChoice = await askQuestion('\nVoulez-vous effectuer une autre opération? (y/N): ');
    if (continueChoice.toLowerCase() === 'y') {
        await mainMenu();
    } else {
        log('👋 Synchronisation terminée!');
        process.exit(0);
    }
}

// Gestion des arguments de ligne de commande
function parseArgs() {
    const args = process.argv.slice(2);
    const options = {
        help: false,
        auto: false,
        tables: []
    };
    
    for (let i = 0; i < args.length; i++) {
        switch (args[i]) {
            case '-h':
            case '--help':
                options.help = true;
                break;
            case '--auto':
                options.auto = true;
                break;
            case '--tables':
                if (args[i + 1]) {
                    options.tables = args[i + 1].split(',');
                    i++;
                }
                break;
        }
    }
    
    return options;
}

// Fonction principale
async function main() {
    const options = parseArgs();
    
    if (options.help) {
        console.log('Usage: node sync-database-to-server.cjs [options]');
        console.log('Options:');
        console.log('  -h, --help          Afficher cette aide');
        console.log('  --auto              Mode automatique (sync complète)');
        console.log('  --tables table1,table2  Synchroniser des tables spécifiques');
        process.exit(0);
    }
    
    // Vérifications préliminaires
    if (!fs.existsSync(CONFIG.localDb)) {
        error(`Base de données locale introuvable: ${CONFIG.localDb}`);
    }
    
    try {
        // Test de connexion SSH
        await execSSH('echo "Connexion OK"');
        success('Connexion SSH établie');
    } catch (e) {
        error(`Impossible de se connecter au serveur: ${e.message}`);
    }
    
    if (options.auto) {
        log('🤖 Mode automatique: synchronisation complète');
        const localAnalysis = await analyzeDatabase(CONFIG.localDb, false);
        await syncTables(localAnalysis.tables, 'replace');
    } else if (options.tables.length > 0) {
        log(`🎯 Synchronisation des tables: ${options.tables.join(', ')}`);
        await syncTables(options.tables, 'replace');
    } else {
        await mainMenu();
    }
    
    rl.close();
}

// Gestion des erreurs non capturées
process.on('uncaughtException', (error) => {
    console.error('Erreur non gérée:', error);
    rl.close();
    process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
    console.error('Promesse rejetée non gérée:', reason);
    rl.close();
    process.exit(1);
});

// Démarrage du script
if (require.main === module) {
    main().catch(error => {
        console.error('Erreur:', error);
        rl.close();
        process.exit(1);
    });
}

module.exports = { analyzeDatabase, syncTables };