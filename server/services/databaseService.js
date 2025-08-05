/**
 * Service de base de données - Redirection vers MariaDB
 * Ce fichier redirige vers MariaDBService pour maintenir la compatibilité
 */

const MariaDBService = require('./mariadbService');

// Créer une instance de MariaDBService
const databaseService = new MariaDBService();

// Initialiser automatiquement
databaseService.initialize().catch(console.error);

// Exporter l'instance
module.exports = databaseService;