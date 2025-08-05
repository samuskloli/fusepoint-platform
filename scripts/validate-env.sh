#!/bin/bash

# =============================================================================
# Script de Validation de Configuration d'Environnement
# =============================================================================

set -e  # Arrêter en cas d'erreur

# Couleurs pour l'affichage
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Fonctions utilitaires
print_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

print_info() {
    echo -e "${BLUE}ℹ️  $1${NC}"
}

# Variables
ERROR_COUNT=0
WARNING_COUNT=0

# Fonction pour incrémenter les erreurs
add_error() {
    ERROR_COUNT=$((ERROR_COUNT + 1))
    print_error "$1"
}

# Fonction pour incrémenter les avertissements
add_warning() {
    WARNING_COUNT=$((WARNING_COUNT + 1))
    print_warning "$1"
}

echo "🔍 Validation de la configuration d'environnement Fusepoint Platform"
echo "======================================================================"

# 1. Vérification de l'existence des fichiers .env
print_info "Vérification des fichiers de configuration..."

if [[ -f ".env" ]]; then
    print_success "Fichier .env trouvé"
    source .env
else
    add_error "Fichier .env manquant dans le répertoire racine"
fi

if [[ -f "server/.env" ]]; then
    print_success "Fichier server/.env trouvé"
else
    add_warning "Fichier server/.env manquant (optionnel)"
fi

# 2. Validation des variables critiques
print_info "Vérification des variables d'environnement critiques..."

# Variables frontend
if [[ -z "$VITE_API_URL" ]]; then
    add_error "VITE_API_URL n'est pas définie"
else
    print_success "VITE_API_URL définie: $VITE_API_URL"
fi

# 3. Vérification de la cohérence production/développement
print_info "Vérification de la cohérence environnement..."

if [[ "$NODE_ENV" == "production" ]]; then
    print_info "Mode PRODUCTION détecté"
    
    # Vérifier que les URLs ne contiennent pas localhost
    if [[ "$VITE_API_URL" == *"localhost"* ]]; then
        add_error "VITE_API_URL contient 'localhost' en production: $VITE_API_URL"
    else
        print_success "VITE_API_URL appropriée pour la production"
    fi
    
    if [[ "$FRONTEND_URL" == *"localhost"* ]]; then
        add_error "FRONTEND_URL contient 'localhost' en production: $FRONTEND_URL"
    else
        print_success "FRONTEND_URL appropriée pour la production"
    fi
    
    # Vérifier HTTPS en production
    if [[ "$VITE_API_URL" != "https://*" ]]; then
        add_warning "VITE_API_URL devrait utiliser HTTPS en production"
    fi
    
else
    print_info "Mode DÉVELOPPEMENT détecté"
    
    # En développement, localhost est acceptable
    if [[ "$VITE_API_URL" == *"localhost"* ]]; then
        print_success "Configuration localhost appropriée pour le développement"
    fi
fi

# 4. Vérification des ports
print_info "Vérification des ports..."

# Extraire le port de VITE_API_URL
if [[ "$VITE_API_URL" =~ :([0-9]+) ]]; then
    API_PORT="${BASH_REMATCH[1]}"
    print_info "Port API détecté: $API_PORT"
    
    # Vérifier que le port n'est pas en conflit
    if [[ "$API_PORT" == "5173" ]]; then
        add_error "Le port API ($API_PORT) entre en conflit avec le port frontend par défaut"
    elif [[ "$API_PORT" == "3000" ]]; then
        add_warning "Le port API ($API_PORT) utilise le port par défaut Node.js"
    else
        print_success "Port API approprié: $API_PORT"
    fi
fi

# 5. Vérification des secrets (sans les afficher)
print_info "Vérification des secrets..."

if [[ -n "$JWT_SECRET" ]]; then
    if [[ ${#JWT_SECRET} -lt 32 ]]; then
        add_warning "JWT_SECRET semble court (moins de 32 caractères)"
    else
        print_success "JWT_SECRET défini avec une longueur appropriée"
    fi
else
    add_error "JWT_SECRET n'est pas défini"
fi

if [[ -n "$DATABASE_URL" ]]; then
    print_success "DATABASE_URL définie"
else
    add_error "DATABASE_URL n'est pas définie"
fi

# 6. Vérification de la configuration CORS
print_info "Vérification de la configuration CORS..."

if [[ -n "$CORS_ORIGIN" ]]; then
    print_success "CORS_ORIGIN défini: $CORS_ORIGIN"
    
    # Vérifier la cohérence avec FRONTEND_URL
    if [[ -n "$FRONTEND_URL" && "$CORS_ORIGIN" != "$FRONTEND_URL" ]]; then
        add_warning "CORS_ORIGIN ($CORS_ORIGIN) diffère de FRONTEND_URL ($FRONTEND_URL)"
    fi
else
    add_warning "CORS_ORIGIN n'est pas défini"
fi

# 7. Test de connectivité (optionnel)
print_info "Test de connectivité API (optionnel)..."

if command -v curl &> /dev/null; then
    if [[ "$VITE_API_URL" == *"localhost"* ]]; then
        # Tenter une connexion au serveur local
        if curl -s --connect-timeout 5 "$VITE_API_URL/health" &> /dev/null; then
            print_success "Serveur API accessible"
        else
            add_warning "Serveur API non accessible (normal si non démarré)"
        fi
    else
        print_info "Test de connectivité ignoré pour les URLs non-localhost"
    fi
else
    print_info "curl non disponible, test de connectivité ignoré"
fi

# 8. Vérification des fichiers sensibles
print_info "Vérification de la sécurité des fichiers..."

if [[ -f ".env" && ! -f ".gitignore" ]]; then
    add_warning "Fichier .gitignore manquant - risque de commit des secrets"
elif [[ -f ".gitignore" ]]; then
    if grep -q "\.env" .gitignore; then
        print_success "Fichiers .env correctement ignorés par git"
    else
        add_warning "Fichiers .env non ignorés dans .gitignore"
    fi
fi

# Résumé final
echo ""
echo "======================================================================"
echo "📊 RÉSUMÉ DE LA VALIDATION"
echo "======================================================================"

if [[ $ERROR_COUNT -eq 0 && $WARNING_COUNT -eq 0 ]]; then
    print_success "Configuration parfaite ! Aucun problème détecté."
    exit 0
elif [[ $ERROR_COUNT -eq 0 ]]; then
    print_warning "Configuration acceptable avec $WARNING_COUNT avertissement(s)."
    echo ""
    print_info "Les avertissements n'empêchent pas le fonctionnement mais méritent attention."
    exit 0
else
    print_error "Configuration problématique : $ERROR_COUNT erreur(s) et $WARNING_COUNT avertissement(s)."
    echo ""
    print_error "Veuillez corriger les erreurs avant de continuer."
    exit 1
fi