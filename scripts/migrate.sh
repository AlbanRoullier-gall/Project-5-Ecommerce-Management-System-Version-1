#!/bin/bash

# Script de migration pour initialiser toutes les bases de données
echo "🗄️ Exécution des migrations de base de données..."

# Fonction pour exécuter une migration
run_migration() {
    local service_name=$1
    local service_port=$2
    
    echo "Migration $service_name..."
    
    # Attendre que le service soit prêt
    echo "Attente que $service_name soit prêt..."
    timeout=60
    while [ $timeout -gt 0 ]; do
        if docker-compose exec -T $service_name curl -f http://localhost:$service_port/health > /dev/null 2>&1; then
            break
        fi
        sleep 2
        timeout=$((timeout - 2))
    done
    
    if [ $timeout -le 0 ]; then
        echo "⚠️  $service_name n'est pas prêt, tentative de migration quand même..."
    fi
    
    # Exécuter la migration
    docker-compose exec -T $service_name npm run migrate
    
    if [ $? -eq 0 ]; then
        echo "✅ Migration $service_name terminée"
    else
        echo "❌ Erreur lors de la migration $service_name"
    fi
}

# Exécuter les migrations dans l'ordre
run_migration "customer-service" "3001"
run_migration "product-service" "3002"
run_migration "order-service" "3003"
run_migration "cart-service" "3004"
run_migration "website-content-service" "3005"
run_migration "payment-service" "3006"
run_migration "email-service" "3007"

echo "✅ Toutes les migrations sont terminées!"
echo ""
echo "🎉 Votre plateforme e-commerce est prête à être utilisée!"
echo ""
echo "📱 Accédez à vos interfaces :"
echo "   • Frontend Client    : http://localhost:3008"
echo "   • Back Office Admin  : http://localhost:3009"
echo ""
