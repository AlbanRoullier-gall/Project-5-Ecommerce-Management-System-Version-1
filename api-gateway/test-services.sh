#!/bin/bash

# Script de test de communication API Gateway <-> Services Backend
# Teste tous les services connectés

echo "╔════════════════════════════════════════════════════════════╗"
echo "║   🧪 TEST DE COMMUNICATION API GATEWAY <-> SERVICES       ║"
echo "╚════════════════════════════════════════════════════════════╝"
echo ""

# Couleurs
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Compteurs
TOTAL_TESTS=0
PASSED_TESTS=0
FAILED_TESTS=0

# Fonction de test
test_endpoint() {
    local name=$1
    local url=$2
    local method=${3:-GET}
    local data=$4
    
    TOTAL_TESTS=$((TOTAL_TESTS + 1))
    
    printf "  Testing %-50s " "$name..."
    
    if [ "$method" = "POST" ] && [ -n "$data" ]; then
        response=$(curl -s -w "\n%{http_code}" -X POST "$url" \
            -H "Content-Type: application/json" \
            -d "$data" 2>&1)
    else
        response=$(curl -s -w "\n%{http_code}" "$url" 2>&1)
    fi
    
    http_code=$(echo "$response" | tail -n1)
    
    if [ "$http_code" = "200" ] || [ "$http_code" = "201" ]; then
        echo -e "${GREEN}✅ PASS${NC} ($http_code)"
        PASSED_TESTS=$((PASSED_TESTS + 1))
        return 0
    elif [ "$http_code" = "401" ] || [ "$http_code" = "403" ]; then
        echo -e "${YELLOW}⚠️  AUTH${NC} ($http_code)"
        PASSED_TESTS=$((PASSED_TESTS + 1))
        return 0
    else
        echo -e "${RED}❌ FAIL${NC} ($http_code)"
        FAILED_TESTS=$((FAILED_TESTS + 1))
        return 1
    fi
}

# Fonction pour tester un service
test_service() {
    local service_name=$1
    echo ""
    echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo -e "${BLUE}  $service_name${NC}"
    echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
}

BASE_URL="http://localhost:13000"

# =============================================================================
# TEST 1 : API GATEWAY
# =============================================================================
test_service "🌐 API GATEWAY"
test_endpoint "Gateway Health Check" "$BASE_URL/api/health"
test_endpoint "Gateway Info" "$BASE_URL/api/info"
test_endpoint "Services Health Check" "$BASE_URL/api/health/services"

# =============================================================================
# TEST 2 : AUTH SERVICE
# =============================================================================
test_service "🔐 AUTH SERVICE (port 13008)"
test_endpoint "Auth Health" "$BASE_URL/api/health" # via gateway
test_endpoint "Auth Profile (requires token)" "$BASE_URL/api/auth/profile"

# =============================================================================
# TEST 3 : PRODUCT SERVICE
# =============================================================================
test_service "📦 PRODUCT SERVICE (port 13002)"
test_endpoint "Public Products List" "$BASE_URL/api/products"
test_endpoint "Public Categories List" "$BASE_URL/api/categories"
test_endpoint "Admin Products List" "$BASE_URL/api/admin/products"
test_endpoint "Admin Categories List" "$BASE_URL/api/admin/categories"

# =============================================================================
# TEST 4 : EMAIL SERVICE
# =============================================================================
test_service "📧 EMAIL SERVICE (port 13007)"
test_endpoint "Contact Form (no data)" "$BASE_URL/api/contact" "POST" '{"name":"Test","email":"test@test.com","message":"Test"}'

# =============================================================================
# TEST 5 : CART SERVICE
# =============================================================================
test_service "🛒 CART SERVICE (port 13004)"
test_endpoint "Get Cart (requires token)" "$BASE_URL/api/cart"

# =============================================================================
# TEST 6 : ORDER SERVICE
# =============================================================================
test_service "📦 ORDER SERVICE (port 13003)"
test_endpoint "Orders List (requires token)" "$BASE_URL/api/orders"
test_endpoint "Order Statistics" "$BASE_URL/api/orders/statistics"

# =============================================================================
# TEST 7 : CUSTOMER SERVICE
# =============================================================================
test_service "👤 CUSTOMER SERVICE (port 13001)"
test_endpoint "Customers List (requires token)" "$BASE_URL/api/customers"

# =============================================================================
# TEST 8 : PAYMENT SERVICE
# =============================================================================
test_service "💳 PAYMENT SERVICE (port 13006)"
test_endpoint "Payment Stats" "$BASE_URL/api/payments/stats"

# =============================================================================
# TEST 9 : CONTENT SERVICE
# =============================================================================
test_service "📄 CONTENT SERVICE (port 13005)"
test_endpoint "Content Pages" "$BASE_URL/api/content/pages"
test_endpoint "Content Slugs" "$BASE_URL/api/content/slugs"

# =============================================================================
# RÉSUMÉ
# =============================================================================
echo ""
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${BLUE}  📊 RÉSUMÉ DES TESTS${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""
echo "  Total Tests:  $TOTAL_TESTS"
echo -e "  ${GREEN}Passed:       $PASSED_TESTS${NC}"
echo -e "  ${RED}Failed:       $FAILED_TESTS${NC}"
echo ""

# Calcul du pourcentage
if [ $TOTAL_TESTS -gt 0 ]; then
    SUCCESS_RATE=$((PASSED_TESTS * 100 / TOTAL_TESTS))
    echo "  Success Rate: $SUCCESS_RATE%"
    echo ""
    
    if [ $SUCCESS_RATE -ge 80 ]; then
        echo -e "  ${GREEN}✅ EXCELLENT ! La plupart des services répondent correctement.${NC}"
    elif [ $SUCCESS_RATE -ge 50 ]; then
        echo -e "  ${YELLOW}⚠️  MOYEN - Certains services nécessitent de l'authentification ou ne sont pas démarrés.${NC}"
    else
        echo -e "  ${RED}❌ PROBLÈME - Beaucoup de services ne répondent pas.${NC}"
    fi
fi

echo ""
echo "Note: Les erreurs 401/403 sont normales pour les routes protégées sans token."
echo ""

# Code de sortie
if [ $FAILED_TESTS -eq 0 ]; then
    exit 0
else
    exit 1
fi

