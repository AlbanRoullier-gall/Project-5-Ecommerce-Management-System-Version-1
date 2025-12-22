#!/bin/bash

# Script de test pour vérifier que l'API Gateway sanitize correctement les requêtes
# Ce script envoie des attaques XSS et vérifie qu'elles sont neutralisées

echo "🧪 Test de protection XSS - API Endpoint"
echo "========================================"
echo ""

# Configuration
API_URL="${API_URL:-http://localhost:3020}"
ENDPOINT="${ENDPOINT:-/api/products}"

echo "📍 URL de l'API: ${API_URL}"
echo "📍 Endpoint testé: ${ENDPOINT}"
echo ""

# Test 1: Créer un produit avec une description malveillante
echo "📝 Test 1: Création produit avec description XSS"
echo "   Payload: description='<script>alert(\"XSS\")</script>'"
echo ""

RESPONSE=$(curl -s -X POST "${API_URL}${ENDPOINT}" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -d '{
    "name": "Test Product",
    "description": "<script>alert(\"XSS\")</script>",
    "price": 100,
    "vatRate": 21,
    "categoryId": 1
  }')

echo "   Réponse: ${RESPONSE}"
echo ""

# Vérifier que la réponse ne contient pas le script
if echo "$RESPONSE" | grep -q "<script>"; then
  echo "   ❌ ÉCHEC: Le script n'a pas été sanitizé!"
else
  echo "   ✅ PASS: Le script a été sanitizé ou échappé"
fi

echo ""
echo "========================================"
echo "ℹ️  Note: Pour tester complètement, vous devez:"
echo "   1. Avoir l'API Gateway en cours d'exécution"
echo "   2. Avoir un token d'authentification valide"
echo "   3. Vérifier dans la base de données que la description est sanitizée"
echo ""

