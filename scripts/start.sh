#!/bin/bash

# Script de démarrage pour l'e-commerce microservices
echo "🚀 Démarrage de la plateforme e-commerce..."

# Vérifier que Docker est installé
if ! command -v docker &> /dev/null; then
    echo "❌ Docker n'est pas installé. Veuillez installer Docker d'abord."
    exit 1
fi

if ! command -v docker-compose &> /dev/null; then
    echo "❌ Docker Compose n'est pas installé. Veuillez installer Docker Compose d'abord."
    exit 1
fi

# Créer le fichier .env s'il n'existe pas
if [ ! -f .env ]; then
    echo "📝 Création du fichier .env..."
    cat > .env << EOF
# JWT Secret
JWT_SECRET=your-super-secret-jwt-key-change-in-production

# Stripe Configuration (remplacez par vos vraies clés)
STRIPE_SECRET_KEY=sk_test_your_stripe_secret_key
STRIPE_PUBLISHABLE_KEY=pk_test_your_stripe_publishable_key
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret

# Gmail Configuration (remplacez par vos vraies informations)
GMAIL_USER=your-email@gmail.com
GMAIL_APP_PASSWORD=your-gmail-app-password

# Database URLs (générées automatiquement par Docker)
CUSTOMER_DB_URL=postgresql://customer_user:customer_password@customer-db:5432/customer_db
PRODUCT_DB_URL=postgresql://product_user:product_password@product-db:5432/product_db
ORDER_DB_URL=postgresql://order_user:order_password@order-db:5432/order_db
CART_DB_URL=postgresql://cart_user:cart_password@cart-db:5432/cart_db
CONTENT_DB_URL=postgresql://content_user:content_password@content-db:5432/website_content_db
PAYMENT_DB_URL=postgresql://payment_user:payment_password@payment-db:5432/payment_db
EMAIL_DB_URL=postgresql://email_user:email_password@email-db:5432/email_db

# Redis
REDIS_URL=redis://redis:6379
EOF
    echo "✅ Fichier .env créé. Veuillez le modifier avec vos vraies clés API."
fi

# Démarrer les services
echo "🐳 Démarrage des services Docker..."
docker-compose up -d

# Attendre que les services soient prêts
echo "⏳ Attente du démarrage des services..."
sleep 30

# Vérifier l'état des services
echo "🔍 Vérification de l'état des services..."
docker-compose ps

# Exécuter les migrations
echo "🗄️ Exécution des migrations de base de données..."
echo "Migration Customer Service..."
docker-compose exec -T customer-service npm run migrate

echo "Migration Product Service..."
docker-compose exec -T product-service npm run migrate

echo "Migration Order Service..."
docker-compose exec -T order-service npm run migrate

echo "Migration Cart Service..."
docker-compose exec -T cart-service npm run migrate

echo "Migration Website Content Service..."
docker-compose exec -T website-content-service npm run migrate

echo "Migration Payment Service..."
docker-compose exec -T payment-service npm run migrate

echo "Migration Email Service..."
docker-compose exec -T email-service npm run migrate

echo "✅ Migrations terminées!"

# Afficher les URLs d'accès
echo ""
echo "🎉 Plateforme e-commerce démarrée avec succès!"
echo ""
echo "📱 Interfaces disponibles :"
echo "   • Frontend Client    : http://localhost:3008"
echo "   • Back Office Admin  : http://localhost:3009"
echo "   • API Gateway        : http://localhost:3000"
echo ""
echo "🔧 Services backend :"
echo "   • Customer Service     : http://localhost:3001"
echo "   • Product Service      : http://localhost:3002"
echo "   • Order Service        : http://localhost:3003"
echo "   • Cart Service         : http://localhost:3004"
echo "   • Website Content      : http://localhost:3005"
echo "   • Payment Service      : http://localhost:3006"
echo "   • Email Service        : http://localhost:3007"
echo ""
echo "📊 Bases de données :"
echo "   • Customer DB    : localhost:5432"
echo "   • Product DB     : localhost:5433"
echo "   • Order DB       : localhost:5434"
echo "   • Cart DB        : localhost:5435"
echo "   • Content DB     : localhost:5436"
echo "   • Payment DB     : localhost:5437"
echo "   • Email DB       : localhost:5438"
echo "   • Redis          : localhost:6379"
echo ""
echo "📝 Commandes utiles :"
echo "   • Voir les logs  : docker-compose logs -f"
echo "   • Arrêter       : docker-compose down"
echo "   • Redémarrer    : docker-compose restart"
echo ""
echo "⚠️  N'oubliez pas de configurer vos clés API dans le fichier .env"
echo ""
