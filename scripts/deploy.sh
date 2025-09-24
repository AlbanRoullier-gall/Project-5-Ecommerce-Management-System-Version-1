#!/bin/bash

# Script de déploiement complet pour l'e-commerce microservices
echo "🚀 Déploiement de la plateforme e-commerce..."

# Couleurs pour l'affichage
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Fonction pour afficher les étapes
show_step() {
    echo -e "${BLUE}📋 $1${NC}"
}

# Fonction pour afficher le succès
show_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

# Fonction pour afficher l'avertissement
show_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

# Fonction pour afficher l'erreur
show_error() {
    echo -e "${RED}❌ $1${NC}"
}

# Vérifier les prérequis
show_step "Vérification des prérequis..."

if ! command -v docker &> /dev/null; then
    show_error "Docker n'est pas installé. Veuillez installer Docker d'abord."
    exit 1
fi

if ! command -v docker-compose &> /dev/null; then
    show_error "Docker Compose n'est pas installé. Veuillez installer Docker Compose d'abord."
    exit 1
fi

show_success "Prérequis vérifiés"

# Créer le fichier .env s'il n'existe pas
show_step "Configuration de l'environnement..."

if [ ! -f .env ]; then
    if [ -f env.example ]; then
        cp env.example .env
        show_success "Fichier .env créé à partir de env.example"
        show_warning "N'oubliez pas de configurer vos clés API dans le fichier .env"
    else
        show_error "Fichier env.example non trouvé"
        exit 1
    fi
else
    show_success "Fichier .env existe déjà"
fi

# Arrêter les services existants
show_step "Arrêt des services existants..."
docker-compose down --remove-orphans
show_success "Services arrêtés"

# Nettoyer les volumes orphelins
show_step "Nettoyage des volumes orphelins..."
docker volume prune -f
show_success "Volumes nettoyés"

# Construire les images
show_step "Construction des images Docker..."
docker-compose build --no-cache
show_success "Images construites"

# Démarrer les services
show_step "Démarrage des services..."
docker-compose up -d
show_success "Services démarrés"

# Attendre que les services soient prêts
show_step "Attente du démarrage des services..."
echo "⏳ Attente de 60 secondes pour que tous les services soient prêts..."
sleep 60

# Vérifier l'état des services
show_step "Vérification de l'état des services..."
docker-compose ps

# Exécuter les migrations
show_step "Exécution des migrations de base de données..."

services=(
    "customer-service:3001"
    "product-service:3002"
    "order-service:3003"
    "cart-service:3004"
    "website-content-service:3005"
    "payment-service:3006"
    "email-service:3007"
)

for service in "${services[@]}"; do
    service_name=$(echo $service | cut -d: -f1)
    service_port=$(echo $service | cut -d: -f2)
    
    echo "Migration $service_name..."
    
    # Attendre que le service soit prêt
    timeout=60
    while [ $timeout -gt 0 ]; do
        if docker-compose exec -T $service_name curl -f http://localhost:$service_port/health > /dev/null 2>&1; then
            break
        fi
        sleep 2
        timeout=$((timeout - 2))
    done
    
    if [ $timeout -le 0 ]; then
        show_warning "$service_name n'est pas prêt, tentative de migration quand même..."
    fi
    
    # Exécuter la migration
    if docker-compose exec -T $service_name npm run migrate; then
        show_success "Migration $service_name terminée"
    else
        show_error "Erreur lors de la migration $service_name"
    fi
done

# Test des services
show_step "Test des services..."

# Fonction pour tester un service
test_service() {
    local service_name=$1
    local service_url=$2
    
    if curl -s -o /dev/null -w "%{http_code}" "$service_url" 2>/dev/null | grep -q "200"; then
        show_success "$service_name fonctionne"
        return 0
    else
        show_error "$service_name ne fonctionne pas"
        return 1
    fi
}

# Test des microservices
test_service "API Gateway" "http://localhost:3000/health"
test_service "Customer Service" "http://localhost:3001/health"
test_service "Product Service" "http://localhost:3002/health"
test_service "Order Service" "http://localhost:3003/health"
test_service "Cart Service" "http://localhost:3004/health"
test_service "Website Content Service" "http://localhost:3005/health"
test_service "Payment Service" "http://localhost:3006/health"
test_service "Email Service" "http://localhost:3007/health"

# Test des interfaces frontend
test_service "Frontend Client" "http://localhost:3008"
test_service "Back Office Admin" "http://localhost:3009"

# Afficher les URLs d'accès
echo ""
show_success "🎉 Déploiement terminé avec succès!"
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
echo "   • Test services : ./scripts/test-services.sh"
echo ""
show_warning "N'oubliez pas de configurer vos clés API dans le fichier .env"
echo ""
