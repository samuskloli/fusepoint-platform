/**
 * Script de diagnostic OAuth pour identifier les problèmes de configuration
 */

export class OAuthDiagnostic {
  constructor() {
    this.clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;
    this.clientSecret = import.meta.env.VITE_GOOGLE_CLIENT_SECRET;
    this.currentUrl = window.location.origin;
  }

  /**
   * Effectue un diagnostic complet de la configuration OAuth
   */
  async runDiagnostic() {
    console.log('🔍 Diagnostic OAuth Google Analytics');
    console.log('=====================================');
    
    const results = {
      environmentVariables: this.checkEnvironmentVariables(),
      clientIdFormat: this.validateClientIdFormat(),
      redirectUri: this.checkRedirectUri(),
      googleApiAccess: await this.testGoogleApiAccess(),
      recommendations: []
    };

    this.generateRecommendations(results);
    this.displayResults(results);
    
    return results;
  }

  /**
   * Vérifie la présence des variables d'environnement
   */
  checkEnvironmentVariables() {
    const checks = {
      clientIdPresent: !!this.clientId,
      clientSecretPresent: !!this.clientSecret,
      clientIdNotDefault: this.clientId !== 'your-google-client-id-here',
      clientSecretNotDefault: this.clientSecret !== 'your-google-client-secret-here'
    };

    console.log('📋 Variables d\'environnement:');
    console.log(`   CLIENT_ID présent: ${checks.clientIdPresent ? '✅' : '❌'}`);
    console.log(`   CLIENT_SECRET présent: ${checks.clientSecretPresent ? '✅' : '❌'}`);
    console.log(`   CLIENT_ID configuré: ${checks.clientIdNotDefault ? '✅' : '❌'}`);
    console.log(`   CLIENT_SECRET configuré: ${checks.clientSecretNotDefault ? '✅' : '❌'}`);
    
    if (checks.clientIdPresent) {
      console.log(`   CLIENT_ID: ${this.clientId.substring(0, 20)}...`);
    }

    return checks;
  }

  /**
   * Valide le format du Client ID Google
   */
  validateClientIdFormat() {
    const googleClientIdPattern = /^\d+-[a-z0-9]+\.apps\.googleusercontent\.com$/;
    const isValid = googleClientIdPattern.test(this.clientId);
    
    console.log('🔑 Format Client ID:');
    console.log(`   Format valide: ${isValid ? '✅' : '❌'}`);
    
    if (!isValid && this.clientId) {
      console.log(`   ⚠️  Format attendu: 123456789-abcdef.apps.googleusercontent.com`);
      console.log(`   📝 Format actuel: ${this.clientId}`);
    }

    return { isValid, pattern: googleClientIdPattern.toString() };
  }

  /**
   * Vérifie l'URI de redirection
   */
  checkRedirectUri() {
    const expectedRedirectUri = `${this.currentUrl}/oauth/callback`;
    
    console.log('🔄 URI de redirection:');
    console.log(`   URL actuelle: ${this.currentUrl}`);
    console.log(`   URI de redirection attendue: ${expectedRedirectUri}`);
    console.log(`   ⚠️  Cette URI doit être configurée dans Google Cloud Console`);

    return {
      currentUrl: this.currentUrl,
      expectedRedirectUri,
      isLocalhost: this.currentUrl.includes('localhost')
    };
  }

  /**
   * Teste l'accès à l'API Google
   */
  async testGoogleApiAccess() {
    console.log('🌐 Test d\'accès API Google:');
    
    try {
      // Test simple de connectivité à Google
      const response = await fetch('https://www.googleapis.com/oauth2/v1/tokeninfo', {
        method: 'GET',
        mode: 'cors'
      });
      
      console.log(`   Connectivité Google APIs: ${response.status === 400 ? '✅' : '❌'}`);
      console.log(`   Status: ${response.status} (400 attendu pour ce test)`);
      
      return {
        accessible: response.status === 400, // 400 est attendu sans token
        status: response.status
      };
    } catch (error) {
      console.log(`   ❌ Erreur de connectivité: ${error.message}`);
      return {
        accessible: false,
        error: error.message
      };
    }
  }

  /**
   * Génère des recommandations basées sur les résultats
   */
  generateRecommendations(results) {
    const recommendations = [];

    if (!results.environmentVariables.clientIdPresent) {
      recommendations.push('❌ Ajoutez VITE_GOOGLE_CLIENT_ID dans le fichier .env');
    }

    if (!results.environmentVariables.clientSecretPresent) {
      recommendations.push('❌ Ajoutez VITE_GOOGLE_CLIENT_SECRET dans le fichier .env');
    }

    if (!results.environmentVariables.clientIdNotDefault) {
      recommendations.push('❌ Remplacez la valeur par défaut de VITE_GOOGLE_CLIENT_ID');
    }

    if (!results.clientIdFormat.isValid) {
      recommendations.push('❌ Vérifiez le format du CLIENT_ID (doit finir par .apps.googleusercontent.com)');
    }

    if (results.redirectUri.isLocalhost) {
      recommendations.push('⚠️  Configurez l\'URI de redirection dans Google Cloud Console: ' + results.redirectUri.expectedRedirectUri);
    }

    if (!results.googleApiAccess.accessible) {
      recommendations.push('❌ Problème de connectivité avec les APIs Google');
    }

    if (recommendations.length === 0) {
      recommendations.push('✅ Configuration OAuth semble correcte. Vérifiez les permissions dans Google Cloud Console.');
    }

    results.recommendations = recommendations;
  }

  /**
   * Affiche les résultats du diagnostic
   */
  displayResults(results) {
    console.log('\n📋 Résumé du diagnostic:');
    console.log('========================');
    
    results.recommendations.forEach(rec => {
      console.log(rec);
    });

    console.log('\n🔗 Actions recommandées:');
    console.log('1. Consultez OAUTH_SETUP_GUIDE.md');
    console.log('2. Vérifiez Google Cloud Console > APIs & Services > Credentials');
    console.log('3. Assurez-vous que les URIs de redirection sont configurées');
    console.log('4. Vérifiez que les APIs Google Analytics sont activées');
  }

  /**
   * Teste spécifiquement la validation du client OAuth
   */
  async testOAuthClientValidation() {
    console.log('\n🔐 Test de validation du client OAuth:');
    
    const testUrl = 'https://oauth2.googleapis.com/token';
    const testData = {
      client_id: this.clientId,
      client_secret: this.clientSecret,
      grant_type: 'authorization_code',
      code: 'test_code', // Code invalide pour tester la réponse
      redirect_uri: `${this.currentUrl}/oauth/callback`
    };

    try {
      const response = await fetch(testUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams(testData)
      });

      const result = await response.json();
      
      console.log(`   Status: ${response.status}`);
      console.log(`   Réponse:`, result);

      if (result.error === 'invalid_client') {
        console.log('   ❌ CLIENT_ID ou CLIENT_SECRET invalide');
        console.log('   📝 Vérifiez vos identifiants dans Google Cloud Console');
      } else if (result.error === 'invalid_grant') {
        console.log('   ✅ Client valide (erreur attendue avec code de test)');
      }

      return result;
    } catch (error) {
      console.log(`   ❌ Erreur lors du test: ${error.message}`);
      return { error: error.message };
    }
  }
}

// Export pour utilisation dans la console
window.OAuthDiagnostic = OAuthDiagnostic;

export default OAuthDiagnostic;