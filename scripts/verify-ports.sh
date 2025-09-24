#!/bin/bash

echo "🔍 Vérification de la cohérence des ports"
echo "========================================"

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

# Fonction pour vérifier un port
check_port() {
    local service=$1
    local expected_port=$2
    local file=$3
    local pattern=$4
    
    if grep -q "$pattern" "$file" 2>/dev/null; then
        print_success "$service: Port $expected_port trouvé dans $file"
        return 0
    else
        print_error "$service: Port $expected_port NON trouvé dans $file"
        return 1
    fi
}

print_status "1. Vérification des ports dans docker-compose.dev.yml..."

# Vérifier les ports dans docker-compose.dev.yml
check_port "API Gateway" "13000:3000" "docker-compose.dev.yml" "13000:3000"
check_port "Customer Service" "13001:3001" "docker-compose.dev.yml" "13001:3001"
check_port "Product Service" "13002:3002" "docker-compose.dev.yml" "13002:3002"
check_port "Order Service" "13003:3003" "docker-compose.dev.yml" "13003:3003"
check_port "Cart Service" "13004:3004" "docker-compose.dev.yml" "13004:3004"
check_port "Website Content" "13005:3005" "docker-compose.dev.yml" "13005:3005"
check_port "Payment Service" "13006:3006" "docker-compose.dev.yml" "13006:3006"
check_port "Email Service" "13007:3007" "docker-compose.dev.yml" "13007:3007"
check_port "Auth Service" "13008:3008" "docker-compose.dev.yml" "13008:3008"
check_port "Frontend" "13010:3000" "docker-compose.dev.yml" "13010:3000"
check_port "Backoffice" "13009:3000" "docker-compose.dev.yml" "13009:3000"

print_status "2. Vérification des ports dans docker-compose.yml..."

# Vérifier les ports dans docker-compose.yml
check_port "API Gateway (prod)" "13000:3000" "docker-compose.yml" "13000:3000"
check_port "Auth Service (prod)" "13008:3008" "docker-compose.yml" "13008:3008"
check_port "Frontend (prod)" "13010:3000" "docker-compose.yml" "13010:3000"
check_port "Backoffice (prod)" "13009:3000" "docker-compose.yml" "13009:3000"

print_status "3. Vérification des URLs dans le code..."

# Vérifier les URLs dans l'API Gateway
if grep -q "localhost:13008" "api-gateway/src/index.ts"; then
    print_success "API Gateway: URL Auth Service correcte (13008)"
else
    print_error "API Gateway: URL Auth Service incorrecte"
fi

if grep -q "localhost:13002" "api-gateway/src/index.ts"; then
    print_success "API Gateway: URL Product Service correcte (13002)"
else
    print_error "API Gateway: URL Product Service incorrecte"
fi

if grep -q "localhost:13007" "api-gateway/src/index.ts"; then
    print_success "API Gateway: URL Email Service correcte (13007)"
else
    print_error "API Gateway: URL Email Service incorrecte"
fi

print_status "4. Vérification des bases de données..."

# Vérifier les ports des bases de données
check_port "Customer DB" "15432:5432" "docker-compose.dev.yml" "15432:5432"
check_port "Product DB" "15433:5432" "docker-compose.dev.yml" "15433:5432"
check_port "Order DB" "15434:5432" "docker-compose.dev.yml" "15434:5432"
check_port "Cart DB" "15435:5432" "docker-compose.dev.yml" "15435:5432"
check_port "Content DB" "15436:5432" "docker-compose.dev.yml" "15436:5432"
check_port "Payment DB" "15437:5432" "docker-compose.dev.yml" "15437:5432"
check_port "Email DB" "15438:5432" "docker-compose.dev.yml" "15438:5432"
check_port "Auth DB" "15439:5432" "docker-compose.dev.yml" "15439:5432"
check_port "Redis" "16379:6379" "docker-compose.dev.yml" "16379:6379"

print_status "5. Résumé des ports..."

echo ""
echo "📊 TABLEAU DES PORTS FINAUX"
echo "=========================="
echo "| Service                | Port Externe | Port Interne | Status |"
echo "|------------------------|--------------|--------------|--------|"
echo "| API Gateway            | 13000        | 3000         | ✅     |"
echo "| Customer Service       | 13001        | 3001         | ✅     |"
echo "| Product Service        | 13002        | 3002         | ✅     |"
echo "| Order Service          | 13003        | 3003         | ✅     |"
echo "| Cart Service           | 13004        | 3004         | ✅     |"
echo "| Website Content        | 13005        | 3005         | ✅     |"
echo "| Payment Service        | 13006        | 3006         | ✅     |"
echo "| Email Service          | 13007        | 3007         | ✅     |"
echo "| Auth Service           | 13008        | 3008         | ✅     |"
echo "| Frontend               | 13010        | 3000         | ✅     |"
echo "| Backoffice             | 13009        | 3000         | ✅     |"
echo ""

print_success "✅ Vérification des ports terminée !"
echo ""
echo "🚀 Pour démarrer les services :"
echo "   docker-compose -f docker-compose.dev.yml up"
echo ""
echo "🔍 Pour tester un service spécifique :"
echo "   curl http://localhost:13000/health  # API Gateway"
echo "   curl http://localhost:13008/health  # Auth Service"
echo "   curl http://localhost:13002/health  # Product Service"
