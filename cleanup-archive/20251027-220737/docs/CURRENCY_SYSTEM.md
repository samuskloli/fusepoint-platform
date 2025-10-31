# Système de Devises Configurables

Ce document décrit le système de devises configurables implémenté dans l'application Fusepoint.

## Vue d'ensemble

Le système permet de changer facilement la devise utilisée dans toute l'application sans avoir à modifier le code source. Toutes les devises précédemment codées en dur ont été remplacées par un système centralisé et configurable.

## Architecture

### 1. Configuration centralisée (`src/config/currency.js`)

- **CURRENCY_CONFIG** : Configuration principale de la devise active
- **AVAILABLE_CURRENCIES** : Liste des devises supportées (CHF, EUR, USD, GBP)
- **formatCurrency()** : Fonction principale de formatage des montants
- **setCurrency()** : Fonction pour changer la devise active

### 2. Plugin Vue (`src/plugins/currency.js`)

Rend les fonctions de devise disponibles globalement dans tous les composants :
- `$formatCurrency(amount)` : Formate un montant selon la devise active
- `$getCurrencySymbol()` : Retourne le symbole de la devise active
- `$getCurrencyCode()` : Retourne le code de la devise active
- `$formatSimpleCurrency(amount)` : Formatage simple avec symbole

### 3. Interface d'administration

- **CurrencySettings.vue** : Composant de configuration des devises
- **CurrencyConfig.vue** : Page d'administration complète avec aperçu et historique

## Utilisation

### Dans les templates Vue

```vue
<!-- Avant (codé en dur) -->
<p>Prix: 99€</p>
<p>Budget: €1,234.56</p>

<!-- Après (configurable) -->
<p>Prix: {{ $formatCurrency(99) }}</p>
<p>Budget: {{ $formatCurrency(1234.56) }}</p>
```

### Dans les scripts Vue

```javascript
// Utilisation dans les méthodes
export default {
  methods: {
    calculateTotal() {
      const total = this.items.reduce((sum, item) => sum + item.price, 0)
      return this.$formatCurrency(total)
    }
  }
}
```

### Avec la Composition API

```javascript
import { inject } from 'vue'

export default {
  setup() {
    const formatCurrency = inject('formatCurrency')
    
    const formattedPrice = computed(() => {
      return formatCurrency(price.value)
    })
    
    return { formattedPrice }
  }
}
```

## Devises supportées

| Code | Symbole | Nom | Locale |
|------|---------|-----|--------|
| CHF | CHF | Franc suisse | fr-CH |
| EUR | € | Euro | fr-FR |
| USD | $ | Dollar américain | en-US |
| GBP | £ | Livre sterling | en-GB |

## Configuration

### Changer la devise par défaut

```javascript
import { setCurrency } from '@/config/currency'

// Changer vers EUR
setCurrency('EUR')

// Changer vers USD
setCurrency('USD')
```

### Ajouter une nouvelle devise

1. Modifier `AVAILABLE_CURRENCIES` dans `src/config/currency.js` :

```javascript
export const AVAILABLE_CURRENCIES = {
  // ... devises existantes
  CAD: {
    code: 'CAD',
    symbol: 'C$',
    symbolPosition: 'before',
    locale: 'en-CA',
    name: 'Dollar canadien'
  }
}
```

2. La nouvelle devise sera automatiquement disponible dans l'interface d'administration.

## Interface d'administration

### Accès

L'interface de configuration des devises est accessible via :
- URL : `/admin/currency-config`
- Navigation : Administration > Configuration > Devises

### Fonctionnalités

1. **Configuration** : Changer la devise active avec aperçu en temps réel
2. **Aperçu** : Voir comment les montants sont formatés dans différents contextes
3. **Historique** : Suivre les changements de devise effectués

## Fichiers modifiés

### Vues mises à jour
- `src/views/Marketing/Campaigns.vue`
- `src/views/Analytics/Analytics.vue`
- `src/views/Billing/Billing.vue`
- `src/views/Reports/Reports.vue`
- `src/views/Dashboard.vue`
- `src/views/Marketing/Marketing.vue`
- `src/views/PrestataireDashboard.vue`
- `src/views/ServiceCatalog.vue`
- `src/views/ProjectDetailDashboard.vue`

### Composants mis à jour
- `src/components/CreateProjectModal.vue`
- `src/components/EditProjectModal.vue`

### Services mis à jour
- `src/services/aiPersonalizationService.js`
- `src/views/ClientManagement.vue`

## Migration

### Étapes effectuées

1. ✅ Création du système de configuration centralisé
2. ✅ Création du plugin Vue global
3. ✅ Remplacement des devises codées en dur par les fonctions configurables
4. ✅ Création de l'interface d'administration
5. ✅ Mise à jour de tous les fichiers concernés

### Recherche des devises codées en dur

Pour identifier les devises encore codées en dur :

```bash
# Rechercher les symboles de devises
grep -r "€\|EUR\|CHF\|\$\|USD\|GBP\|£" src/ --include="*.vue" --include="*.js"

# Rechercher les patterns de prix
grep -r "[0-9]+€\|€[0-9]+\|[0-9]+CHF\|CHF[0-9]+" src/ --include="*.vue" --include="*.js"
```

## Bonnes pratiques

### À faire ✅
- Utiliser `$formatCurrency()` pour tous les montants affichés
- Utiliser `$getCurrencySymbol()` pour les libellés dynamiques
- Tester l'affichage avec différentes devises
- Documenter les nouveaux composants utilisant des devises

### À éviter ❌
- Coder en dur des symboles de devises (€, $, CHF, etc.)
- Utiliser des formatages manuels pour les montants
- Oublier de tester avec différentes locales
- Mélanger les devises dans une même interface

## Tests

### Tests manuels

1. Changer la devise dans l'interface d'administration
2. Vérifier que tous les montants sont mis à jour
3. Tester avec différentes devises (CHF, EUR, USD, GBP)
4. Vérifier le formatage des décimales et des séparateurs

### Tests automatisés

```javascript
// Exemple de test unitaire
import { formatCurrency, setCurrency } from '@/config/currency'

describe('Currency System', () => {
  test('formats CHF correctly', () => {
    setCurrency('CHF')
    expect(formatCurrency(1234.56)).toMatch(/CHF|1.*234.*56/)
  })
  
  test('formats EUR correctly', () => {
    setCurrency('EUR')
    expect(formatCurrency(1234.56)).toMatch(/€|1.*234.*56/)
  })
})
```

## Support

Pour toute question ou problème concernant le système de devises :
1. Vérifier ce document
2. Consulter les commentaires dans `src/config/currency.js`
3. Tester avec l'interface d'administration
4. Contacter l'équipe de développement

## Évolutions futures

- [ ] Intégration avec une API de taux de change
- [ ] Conversion automatique des montants existants
- [ ] Support de devises personnalisées
- [ ] Historique persistant en base de données
- [ ] Notifications lors des changements de devise
- [ ] Export/import de configurations de devises