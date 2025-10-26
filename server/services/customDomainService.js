const databaseService = require('./databaseService');

/**
 * Service pour gérer les domaines personnalisés par entreprise
 */
class CustomDomainService {
  /**
   * Récupère le domaine actif pour une entreprise
   * @param {number} companyId
   * @returns {Promise<string|null>}
   */
  async getActiveDomainForCompany(companyId) {
    if (!companyId) return null;
    const row = await databaseService.get(
      'SELECT domain FROM company_custom_domains WHERE company_id=? AND is_active=1 ORDER BY id DESC LIMIT 1',
      [companyId]
    );
    return row?.domain || null;
  }

  /**
   * Récupère le domaine actif pour un LinkPoint (via son entreprise)
   * @param {number} linkpointId
   * @returns {Promise<string|null>}
   */
  async getActiveDomainForLinkpoint(linkpointId) {
    if (!linkpointId) return null;
    const row = await databaseService.get(
      `SELECT ccd.domain
       FROM linkpoints lp
       JOIN company_custom_domains ccd ON ccd.company_id = lp.company_id
       WHERE lp.id=? AND ccd.is_active=1
       ORDER BY ccd.id DESC
       LIMIT 1`,
      [linkpointId]
    );
    return row?.domain || null;
  }
}

module.exports = new CustomDomainService();