/**
 * Service de gestion des entreprises
 * Centralise toute la logique métier liée aux entreprises
 */

const databaseService = require('./databaseService');
const translationService = require('./translationService');

class CompanyService {
  /**
   * Récupère la liste des entreprises
   * @returns {Array} - Liste des entreprises
   */
  async getCompanies() {
    try {
      const companies = await databaseService.query(`
        SELECT 
          id,
          name,
          industry,
          size,
          location,
          website,
          description,
          created_at
        FROM companies
        ORDER BY name ASC
      `);
      
      return companies;
    } catch (error) {
      console.error('❌ Erreur lors de la récupération des entreprises:', error);
      throw error;
    }
  }
}

module.exports = new CompanyService();