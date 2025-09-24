#!/bin/bash

# Script de test pour l'upload d'images
echo "🧪 Test de l'upload d'images pour les produits"
echo "=============================================="

# Variables
API_GATEWAY_URL="http://localhost:13000"
ADMIN_EMAIL="test@admin.com"
ADMIN_PASSWORD="Test123!"

echo "1. Test de connexion à l'API Gateway..."
curl -s "${API_GATEWAY_URL}/health" | jq '.' || echo "❌ API Gateway non accessible"

echo -e "\n2. Test d'authentification admin..."
AUTH_RESPONSE=$(curl -s -X POST "${API_GATEWAY_URL}/api/auth/login" \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"${ADMIN_EMAIL}\",\"password\":\"${ADMIN_PASSWORD}\"}")

echo "$AUTH_RESPONSE" | jq '.' || echo "❌ Erreur d'authentification"

# Extraire le token
TOKEN=$(echo "$AUTH_RESPONSE" | jq -r '.token // empty')

if [ -z "$TOKEN" ] || [ "$TOKEN" = "null" ]; then
  echo "❌ Impossible d'obtenir le token d'authentification"
  exit 1
fi

echo "✅ Token obtenu: ${TOKEN:0:20}..."

echo -e "\n3. Test de création d'un produit avec image..."
# Créer un fichier image de test (1x1 pixel PNG)
echo "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==" | base64 -d > test-image.png

# Test de création de produit avec image
PRODUCT_RESPONSE=$(curl -s -X POST "${API_GATEWAY_URL}/api/admin/products/with-images" \
  -H "Authorization: Bearer ${TOKEN}" \
  -F "name=Produit Test avec Image" \
  -F "description=Description du produit test" \
  -F "price=29.99" \
  -F "vatRate=20" \
  -F "categoryId=49" \
  -F "isActive=true" \
  -F "images=@test-image.png")

echo "$PRODUCT_RESPONSE" | jq '.' || echo "❌ Erreur lors de la création du produit avec image"

# Nettoyer
rm -f test-image.png

echo -e "\n✅ Test terminé!"
