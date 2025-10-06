#!/bin/bash

# =====================================================
# SCRIPT DE DÉTECTION AUTOMATIQUE DES CONTENEURS
# Projet: E-commerce Portal - Architecture Microservices
# =====================================================

# Couleurs pour les messages
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Fonctions utilitaires
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

# Détecter les noms des conteneurs PostgreSQL
detect_postgres_containers() {
    print_status "🔍 Détection automatique des conteneurs PostgreSQL..."
    
    # Obtenir tous les conteneurs PostgreSQL en cours d'exécution
    local containers=$(docker ps --format "{{.Names}}" | grep -E ".*-db-.*" | sort)
    
    if [ -z "$containers" ]; then
        print_error "Aucun conteneur PostgreSQL trouvé"
        return 1
    fi
    
    print_success "Conteneurs PostgreSQL détectés:"
    echo "$containers" | while read -r container; do
        echo "   📦 $container"
    done
    
    return 0
}

# Détecter le nom du projet Docker Compose
detect_project_name() {
    # Essayer de détecter le nom du projet depuis le répertoire courant
    local current_dir=$(basename "$(pwd)")
    local project_name=$(echo "$current_dir" | tr '[:upper:]' '[:lower:]' | sed 's/[^a-z0-9]/-/g' | sed 's/--*/-/g' | sed 's/^-\|-$//g')
    
    print_status "📁 Nom du projet détecté: $project_name"
    
    # Vérifier si des conteneurs avec ce nom existent
    if docker ps --format "{{.Names}}" | grep -q "^${project_name}-"; then
        print_success "✅ Projet Docker détecté: $project_name"
        echo "$project_name"
        return 0
    else
        print_warning "⚠️  Projet Docker non détecté, utilisation du nom par défaut"
        echo "portailecommerce2"
        return 0
    fi
}

# Générer la configuration des bases de données
generate_database_config() {
    local project_name=$1
    
    print_status "⚙️  Génération de la configuration des bases de données..."
    
    # Configuration des bases de données basée sur docker-compose.yml
    cat << EOF
# Configuration des bases de données Docker
# Format: "database_name:container_name:username:password"
DATABASES=(
    "customer_db:${project_name}-customer-db-1:customer_user:customer_password"
    "product_db:${project_name}-product-db-1:product_user:product_password"
    "order_db:${project_name}-order-db-1:order_user:order_password"
    "website_content_db:${project_name}-content-db-1:content_user:content_password"
)
EOF
}

# Fonction principale
main() {
    print_status "🚀 Détection automatique des conteneurs Docker"
    echo ""
    
    # Détecter le nom du projet
    local project_name=$(detect_project_name)
    echo ""
    
    # Détecter les conteneurs PostgreSQL
    if detect_postgres_containers; then
        echo ""
        
        # Générer la configuration
        print_status "📝 Configuration générée:"
        echo ""
        generate_database_config "$project_name"
        echo ""
        
        print_success "💡 Copiez cette configuration dans vos scripts de backup"
        print_warning "⚠️  Assurez-vous que tous les conteneurs sont en cours d'exécution"
    else
        print_error "❌ Impossible de détecter les conteneurs PostgreSQL"
        exit 1
    fi
}

# Exécuter le script
main "$@"
