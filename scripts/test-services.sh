#!/bin/bash

# Script de test pour vérifier que tous les services fonctionnent
echo "🧪 Test des services de l'e-commerce..."

# Couleurs pour l'affichage
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Fonction pour tester un service
test_service() {
    local service_name=$1
    local service_url=$2
    local expected_status=${3:-200}
    
    echo -n "Test $service_name... "
    
    response=$(curl -s -o /dev/null -w "%{http_code}" "$service_url" 2>/dev/null)
    
    if [ "$response" = "$expected_status" ]; then
        echo -e "${GREEN}✅ OK${NC}"
        return 0
    else
        echo -e "${RED}❌ FAIL (HTTP $response)${NC}"
        return 1
    fi
}

# Fonction pour tester un service avec un endpoint spécifique
test_service_endpoint() {
    local service_name=$1
    local service_url=$2
    local endpoint=$3
    local expected_status=${4:-200}
    
    echo -n "Test $service_name$endpoint... "
    
    response=$(curl -s -o /dev/null -w "%{http_code}" "$service_url$endpoint" 2>/dev/null)
    
    if [ "$response" = "$expected_status" ]; then
        echo -e "${GREEN}✅ OK${NC}"
        return 0
    else
        echo -e "${RED}❌ FAIL (HTTP $response)${NC}"
        return 1
    fi
}

echo "🔍 Vérification des services backend..."

# Test des microservices
test_service "API Gateway" "http://localhost:3000/health"
test_service "Customer Service" "http://localhost:3001/health"
test_service "Product Service" "http://localhost:3002/health"
test_service "Order Service" "http://localhost:3003/health"
test_service "Cart Service" "http://localhost:3004/health"
test_service "Website Content Service" "http://localhost:3005/health"
test_service "Payment Service" "http://localhost:3006/health"
test_service "Email Service" "http://localhost:3007/health"

echo ""
echo "🌐 Vérification des interfaces frontend..."

# Test des interfaces frontend
test_service "Frontend Client" "http://localhost:3008" "200"
test_service "Back Office Admin" "http://localhost:3009" "200"

echo ""
echo "🗄️ Vérification des bases de données..."

# Test des bases de données
test_service "Customer DB" "http://localhost:5432" "200" || echo -e "${YELLOW}⚠️  Customer DB non accessible via HTTP${NC}"
test_service "Product DB" "http://localhost:5433" "200" || echo -e "${YELLOW}⚠️  Product DB non accessible via HTTP${NC}"
test_service "Order DB" "http://localhost:5434" "200" || echo -e "${YELLOW}⚠️  Order DB non accessible via HTTP${NC}"
test_service "Cart DB" "http://localhost:5435" "200" || echo -e "${YELLOW}⚠️  Cart DB non accessible via HTTP${NC}"
test_service "Content DB" "http://localhost:5436" "200" || echo -e "${YELLOW}⚠️  Content DB non accessible via HTTP${NC}"
test_service "Payment DB" "http://localhost:5437" "200" || echo -e "${YELLOW}⚠️  Payment DB non accessible via HTTP${NC}"
test_service "Email DB" "http://localhost:5438" "200" || echo -e "${YELLOW}⚠️  Email DB non accessible via HTTP${NC}"

echo ""
echo "🔧 Vérification des services externes..."

# Test Redis
echo -n "Test Redis... "
if docker-compose exec -T redis redis-cli ping > /dev/null 2>&1; then
    echo -e "${GREEN}✅ OK${NC}"
else
    echo -e "${RED}❌ FAIL${NC}"
fi

echo ""
echo "📊 Résumé des tests..."

# Compter les services qui fonctionnent
total_services=10
working_services=0

# Test rapide de tous les services
services=(
    "http://localhost:3000/health"
    "http://localhost:3001/health"
    "http://localhost:3002/health"
    "http://localhost:3003/health"
    "http://localhost:3004/health"
    "http://localhost:3005/health"
    "http://localhost:3006/health"
    "http://localhost:3007/health"
    "http://localhost:3008"
    "http://localhost:3009"
)

for service in "${services[@]}"; do
    if curl -s -o /dev/null -w "%{http_code}" "$service" 2>/dev/null | grep -q "200"; then
        ((working_services++))
    fi
done

echo "Services fonctionnels: $working_services/$total_services"

if [ $working_services -eq $total_services ]; then
    echo -e "${GREEN}🎉 Tous les services fonctionnent correctement!${NC}"
    echo ""
    echo "📱 Vous pouvez maintenant accéder à vos interfaces :"
    echo "   • Frontend Client    : http://localhost:3008"
    echo "   • Back Office Admin  : http://localhost:3009"
    echo "   • API Gateway        : http://localhost:3000"
else
    echo -e "${YELLOW}⚠️  Certains services ne fonctionnent pas correctement.${NC}"
    echo "Vérifiez les logs avec: docker-compose logs"
fi

echo ""
echo "🔧 Commandes utiles :"
echo "   • Voir les logs  : docker-compose logs -f"
echo "   • Redémarrer     : docker-compose restart"
echo "   • Arrêter        : docker-compose down"
