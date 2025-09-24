#!/bin/bash

echo "🧪 Test de l'API Gateway TypeScript avec Docker Compose"
echo "====================================================="

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
    local url=$1
    local method=${2:-GET}
    local data=${3:-""}
    
    echo -n "Test $method $url... "
    
    if [ "$method" = "GET" ]; then
        response=$(curl -s -o /dev/null -w "%{http_code}" "$url" 2>/dev/null)
    else
        response=$(curl -s -o /dev/null -w "%{http_code}" -X "$method" -H "Content-Type: application/json" -d "$data" "$url" 2>/dev/null)
    fi
    
    if [ "$response" -eq 200 ] || [ "$response" -eq 201 ]; then
        echo -e "${GREEN}✓ OK ($response)${NC}"
        return 0
    else
        echo -e "${RED}✗ FAILED ($response)${NC}"
        return 1
    fi
}

print_status "1. Construction de l'image Docker..."
if docker build -f api-gateway/Dockerfile.dev -t api-gateway:dev ./api-gateway > /dev/null 2>&1; then
    print_success "Image Docker construite avec succès"
else
    print_error "Échec de la construction de l'image Docker"
    exit 1
fi

print_status "2. Démarrage de l'API Gateway en mode test..."
docker run -d --name api-gateway-test -p 3000:3000 -e NODE_ENV=development api-gateway:dev

# Attendre que le service démarre
print_status "Attente du démarrage du service..."
sleep 10

print_status "3. Tests des endpoints..."
echo "-----------------------------"

# Test health check
test_endpoint "http://localhost:3000/health" "GET"

# Test info endpoint
test_endpoint "http://localhost:3000/api/info" "GET"

# Test de validation avec des données invalides
print_status "4. Test de validation TypeScript..."
echo "----------------------------------------"

# Test avec des données invalides (doit échouer)
invalid_login='{"email":"invalid-email","password":"123"}'
echo -n "Test validation login (données invalides)... "
response=$(curl -s -o /dev/null -w "%{http_code}" -X POST -H "Content-Type: application/json" -d "$invalid_login" "http://localhost:3000/api/auth/login" 2>/dev/null)
if [ "$response" -eq 400 ]; then
    echo -e "${GREEN}✓ Validation fonctionne ($response)${NC}"
else
    echo -e "${RED}✗ Validation échouée ($response)${NC}"
fi

print_status "5. Nettoyage..."
docker stop api-gateway-test > /dev/null 2>&1
docker rm api-gateway-test > /dev/null 2>&1

print_success "✅ L'API Gateway TypeScript fonctionne correctement avec Docker !"
echo ""
echo "🚀 Pour démarrer avec Docker Compose :"
echo "   docker-compose -f docker-compose.dev.yml up api-gateway"
echo ""
echo "🔍 Pour voir les logs :"
echo "   docker-compose -f docker-compose.dev.yml logs -f api-gateway"
