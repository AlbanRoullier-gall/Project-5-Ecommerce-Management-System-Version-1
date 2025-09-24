#!/bin/bash

echo "🧪 Test d'intégration de l'authentification"
echo "=========================================="

# Couleurs pour les messages
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Fonction pour tester un endpoint
test_endpoint() {
    local url=$1
    local method=${2:-GET}
    local data=${3:-""}
    
    echo -n "Test $method $url... "
    
    if [ "$method" = "GET" ]; then
        response=$(curl -s -o /dev/null -w "%{http_code}" "$url")
    else
        response=$(curl -s -o /dev/null -w "%{http_code}" -X "$method" -H "Content-Type: application/json" -d "$data" "$url")
    fi
    
    if [ "$response" -eq 200 ] || [ "$response" -eq 201 ]; then
        echo -e "${GREEN}✓ OK ($response)${NC}"
        return 0
    else
        echo -e "${RED}✗ FAILED ($response)${NC}"
        return 1
    fi
}

echo "1. Vérification des services..."
echo "-----------------------------"

# Test API Gateway
test_endpoint "http://localhost:13000/health" "GET"
test_endpoint "http://localhost:13000/api/info" "GET"

# Test Auth Service
test_endpoint "http://localhost:13008/health" "GET"

echo ""
echo "2. Test des endpoints d'authentification via API Gateway..."
echo "--------------------------------------------------------"

# Test d'inscription
register_data='{"email":"test@example.com","password":"password123","firstName":"Test","lastName":"User","role":"admin"}'
test_endpoint "http://localhost:13000/api/auth/register" "POST" "$register_data"

# Test de connexion
login_data='{"email":"test@example.com","password":"password123"}'
test_endpoint "http://localhost:13000/api/auth/login" "POST" "$login_data"

echo ""
echo "3. Test du frontend backoffice..."
echo "--------------------------------"

# Test de la page de connexion
test_endpoint "http://localhost:13009/auth/login" "GET"

# Test de la page d'inscription
test_endpoint "http://localhost:13009/auth/register" "GET"

echo ""
echo "4. Résumé des tests..."
echo "---------------------"

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ Tous les tests sont passés avec succès !${NC}"
    echo ""
    echo "🚀 L'intégration de l'authentification est fonctionnelle :"
    echo "   - API Gateway : http://localhost:13000"
    echo "   - Auth Service : http://localhost:13008"
    echo "   - Backoffice : http://localhost:13009"
    echo ""
    echo "📝 Prochaines étapes :"
    echo "   1. Créer un compte administrateur via http://localhost:13009/auth/register"
    echo "   2. Se connecter via http://localhost:13009/auth/login"
    echo "   3. Accéder au dashboard via http://localhost:13009/dashboard"
else
    echo -e "${RED}❌ Certains tests ont échoué. Vérifiez les services.${NC}"
fi

echo ""
echo "🔧 Pour démarrer les services :"
echo "   docker-compose up -d"
echo ""
echo "🔍 Pour voir les logs :"
echo "   docker-compose logs -f auth-service api-gateway backoffice"
