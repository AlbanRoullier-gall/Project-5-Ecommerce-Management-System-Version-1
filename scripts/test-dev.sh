#!/bin/bash

# Script de test pour vérifier que tous les services sont opérationnels
set -e

# Couleurs pour les messages
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Fonction pour afficher les messages colorés
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Fonction pour tester un endpoint
test_endpoint() {
    local name=$1
    local url=$2
    local expected_status=${3:-200}
    
    print_status "Test de $name ($url)..."
    
    if curl -s -o /dev/null -w "%{http_code}" "$url" | grep -q "$expected_status"; then
        print_success "$name est opérationnel ✅"
        return 0
    else
        print_error "$name n'est pas accessible ❌"
        return 1
    fi
}

# Fonction pour tester la base de données
test_database() {
    local name=$1
    local port=$2
    
    print_status "Test de la base de données $name (port $port)..."
    
    if docker exec -it $(docker ps -q -f "publish=$port") pg_isready -U ${name}_user -d ${name}_db > /dev/null 2>&1; then
        print_success "Base de données $name est opérationnelle ✅"
        return 0
    else
        print_error "Base de données $name n'est pas accessible ❌"
        return 1
    fi
}

# Fonction pour tester Redis
test_redis() {
    print_status "Test de Redis..."
    
    if docker exec -it $(docker ps -q -f "publish=16379") redis-cli ping | grep -q "PONG"; then
        print_success "Redis est opérationnel ✅"
        return 0
    else
        print_error "Redis n'est pas accessible ❌"
        return 1
    fi
}

# Fonction pour afficher l'aide
show_help() {
    echo "Usage: $0 [OPTIONS]"
    echo ""
    echo "Options:"
    echo "  -h, --help     Afficher cette aide"
    echo "  -w, --wait     Attendre que tous les services soient prêts avant de tester"
    echo "  -v, --verbose  Mode verbeux"
    echo ""
    echo "Ce script teste tous les services de l'environnement de développement."
}

# Variables par défaut
WAIT_FOR_SERVICES=false
VERBOSE=false

# Parse des arguments
while [[ $# -gt 0 ]]; do
    case $1 in
        -h|--help)
            show_help
            exit 0
            ;;
        -w|--wait)
            WAIT_FOR_SERVICES=true
            shift
            ;;
        -v|--verbose)
            VERBOSE=true
            shift
            ;;
        *)
            print_error "Option inconnue: $1"
            show_help
            exit 1
            ;;
    esac
done

print_status "🧪 Test des services de développement..."

# Vérifier que Docker Compose est en cours d'exécution
if ! docker-compose -f docker-compose.dev.yml ps | grep -q "Up"; then
    print_error "Aucun service Docker Compose n'est en cours d'exécution."
    print_status "Lancez d'abord: ./scripts/dev.sh"
    exit 1
fi

# Attendre que les services soient prêts si demandé
if [ "$WAIT_FOR_SERVICES" = true ]; then
    print_status "⏳ Attente que tous les services soient prêts..."
    sleep 30
fi

# Compteurs pour les résultats
total_tests=0
passed_tests=0

# Test des services backend
print_status "🔧 Test des services backend..."

services=(
    "API Gateway:http://localhost:13000/health:200"
    "Customer Service:http://localhost:13001/health:200"
    "Product Service:http://localhost:13002/health:200"
    "Order Service:http://localhost:13003/health:200"
    "Cart Service:http://localhost:13004/health:200"
    "Website Content Service:http://localhost:13005/health:200"
    "Payment Service:http://localhost:13006/health:200"
    "Email Service:http://localhost:13007/health:200"
)

for service in "${services[@]}"; do
    IFS=':' read -r name url expected <<< "$service"
    total_tests=$((total_tests + 1))
    if test_endpoint "$name" "$url" "$expected"; then
        passed_tests=$((passed_tests + 1))
    fi
done

# Test des interfaces frontend
print_status "🖥️  Test des interfaces frontend..."

frontend_services=(
    "Frontend:http://localhost:13008:200"
    "Back Office:http://localhost:13009:200"
)

for service in "${frontend_services[@]}"; do
    IFS=':' read -r name url expected <<< "$service"
    total_tests=$((total_tests + 1))
    if test_endpoint "$name" "$url" "$expected"; then
        passed_tests=$((passed_tests + 1))
    fi
done

# Test des bases de données
print_status "🗄️  Test des bases de données..."

databases=(
    "customer:15432"
    "product:15433"
    "order:15434"
    "cart:15435"
    "content:15436"
    "payment:15437"
    "email:15438"
)

for db in "${databases[@]}"; do
    IFS=':' read -r name port <<< "$db"
    total_tests=$((total_tests + 1))
    if test_database "$name" "$port"; then
        passed_tests=$((passed_tests + 1))
    fi
done

# Test de Redis
total_tests=$((total_tests + 1))
if test_redis; then
    passed_tests=$((passed_tests + 1))
fi

# Résumé des résultats
echo ""
print_status "📊 Résumé des tests:"
echo "   Tests réussis: $passed_tests/$total_tests"

if [ $passed_tests -eq $total_tests ]; then
    print_success "🎉 Tous les services sont opérationnels !"
    echo ""
    print_status "📱 Vous pouvez maintenant accéder à:"
    echo "   • 🛍️  Frontend Client    : http://localhost:13008"
    echo "   • ⚙️  Back Office Admin  : http://localhost:13009"
    echo "   • 🔌 API Gateway        : http://localhost:13000"
    exit 0
else
    print_warning "⚠️  Certains services ne sont pas opérationnels."
    echo ""
    print_status "🔧 Commandes utiles pour diagnostiquer:"
    echo "   • Voir les logs: docker-compose -f docker-compose.dev.yml logs"
    echo "   • Statut des services: docker-compose -f docker-compose.dev.yml ps"
    echo "   • Redémarrer un service: docker-compose -f docker-compose.dev.yml restart <service>"
    exit 1
fi

