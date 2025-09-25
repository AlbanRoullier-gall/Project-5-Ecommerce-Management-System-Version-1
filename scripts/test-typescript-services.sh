#!/bin/bash

# Script de test pour vérifier que tous les services TypeScript peuvent démarrer
# Usage: ./scripts/test-typescript-services.sh

set -e

echo "🚀 Test des services TypeScript migrés..."
echo "=========================================="

# Couleurs pour les logs
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Fonction pour afficher les logs colorés
log_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

log_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

log_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Vérifier que Docker est en cours d'exécution
if ! docker info > /dev/null 2>&1; then
    log_error "Docker n'est pas en cours d'exécution. Veuillez démarrer Docker."
    exit 1
fi

# Services TypeScript migrés
TYPESCRIPT_SERVICES=(
    "customer-service"
    "product-service"
    "order-service"
    "cart-service"
    "website-content-service"
    "payment-service"
    "email-service"
    "auth-service"
)

log_info "Vérification des services TypeScript migrés..."

# Vérifier que tous les Dockerfile.dev existent
for service in "${TYPESCRIPT_SERVICES[@]}"; do
    if [ -f "services/$service/Dockerfile.dev" ]; then
        log_success "✅ Dockerfile.dev trouvé pour $service"
    else
        log_error "❌ Dockerfile.dev manquant pour $service"
        exit 1
    fi
done

# Vérifier que tous les tsconfig.json existent
for service in "${TYPESCRIPT_SERVICES[@]}"; do
    if [ -f "services/$service/tsconfig.json" ]; then
        log_success "✅ tsconfig.json trouvé pour $service"
    else
        log_error "❌ tsconfig.json manquant pour $service"
        exit 1
    fi
done

# Vérifier que tous les package.json ont les bonnes dépendances TypeScript
for service in "${TYPESCRIPT_SERVICES[@]}"; do
    if grep -q "typescript" "services/$service/package.json" && \
       grep -q "ts-node-dev" "services/$service/package.json" && \
       grep -q "\"dev\":" "services/$service/package.json"; then
        log_success "✅ Configuration TypeScript correcte pour $service"
    else
        log_error "❌ Configuration TypeScript incorrecte pour $service"
        exit 1
    fi
done

log_info "Test de compilation TypeScript..."

# Tester la compilation de chaque service
for service in "${TYPESCRIPT_SERVICES[@]}"; do
    log_info "Compilation de $service..."
    cd "services/$service"
    
    if npm run build > /dev/null 2>&1; then
        log_success "✅ Compilation réussie pour $service"
    else
        log_error "❌ Erreur de compilation pour $service"
        cd ../..
        exit 1
    fi
    
    cd ../..
done

log_info "Test de la configuration Docker Compose..."

# Vérifier que la configuration Docker Compose est valide
if docker-compose -f docker-compose.dev.yml config > /dev/null 2>&1; then
    log_success "✅ Configuration Docker Compose valide"
else
    log_error "❌ Configuration Docker Compose invalide"
    exit 1
fi

log_info "Test de construction des images Docker..."

# Construire les images pour les services TypeScript
for service in "${TYPESCRIPT_SERVICES[@]}"; do
    log_info "Construction de l'image pour $service..."
    if docker build -f "services/$service/Dockerfile.dev" -t "test-$service" "services/$service" > /dev/null 2>&1; then
        log_success "✅ Image construite avec succès pour $service"
    else
        log_error "❌ Erreur lors de la construction de l'image pour $service"
        exit 1
    fi
done

log_success "🎉 Tous les tests sont passés avec succès !"
log_info "Les services TypeScript sont prêts pour le développement."

echo ""
echo "📋 Résumé des services migrés vers TypeScript :"
echo "================================================"
for service in "${TYPESCRIPT_SERVICES[@]}"; do
    echo "  ✅ $service"
done

echo ""
echo "🚀 Pour démarrer tous les services en mode développement :"
echo "   docker-compose -f docker-compose.dev.yml up"
echo ""
echo "🔧 Pour démarrer un service spécifique :"
echo "   docker-compose -f docker-compose.dev.yml up <service-name>"
echo ""
echo "📊 Ports des services :"
echo "   - API Gateway: http://localhost:13000"
echo "   - Customer Service: http://localhost:13001"
echo "   - Product Service: http://localhost:13002"
echo "   - Order Service: http://localhost:13003"
echo "   - Cart Service: http://localhost:13004"
echo "   - Website Content Service: http://localhost:13005"
echo "   - Payment Service: http://localhost:13006"
echo "   - Email Service: http://localhost:13007"
echo "   - Auth Service: http://localhost:13008"
echo "   - Backoffice: http://localhost:13009"
echo "   - Frontend: http://localhost:13010"
