#!/bin/bash

# =====================================================
# SCRIPT DE RESTAURATION DOCKER - BASES DE DONNÉES MICROSERVICES
# Projet: E-commerce Portal - Architecture Microservices
# =====================================================

set -e  # Arrêter en cas d'erreur

# Couleurs pour les messages
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration des bases de données Docker
# Format: "database_name:container_name:username:password"
DATABASES=(
    "customer_db:portailecommerce2-customer-db-1:customer_user:customer_password"
    "product_db:portailecommerce2-product-db-1:product_user:product_password"
    "order_db:portailecommerce2-order-db-1:order_user:order_password"
    "website_content_db:portailecommerce2-content-db-1:content_user:content_password"
)

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

# Afficher l'aide
show_help() {
    echo "Usage: $0 [OPTIONS] [BACKUP_DIR]"
    echo ""
    echo "Options:"
    echo "  -h, --help     Afficher cette aide"
    echo "  -l, --list     Lister les backups disponibles"
    echo "  -f, --force    Forcer la restauration (supprime les données existantes)"
    echo ""
    echo "Exemples:"
    echo "  $0 --list                                    # Lister les backups"
    echo "  $0 ./backups/20250922_135038                # Restaurer un backup spécifique"
    echo "  $0 --force ./backups/20250922_135038        # Forcer la restauration"
}

# Lister les backups disponibles
list_backups() {
    print_status "📁 Backups disponibles:"
    echo ""
    
    if [ -d "./backups" ]; then
        ls -1t ./backups | grep -E '^[0-9]{8}_[0-9]{6}$' | while read -r backup_dir; do
            local backup_path="./backups/$backup_dir"
            local backup_size=$(du -sh "$backup_path" 2>/dev/null | cut -f1)
            local backup_date=$(date -r "$backup_path" 2>/dev/null || echo "Date inconnue")
            echo "   📅 $backup_dir ($backup_size) - $backup_date"
        done
    else
        print_warning "Aucun backup trouvé dans ./backups"
    fi
}

# Vérifier que Docker est en cours d'exécution
check_docker() {
    if ! docker info > /dev/null 2>&1; then
        print_error "Docker n'est pas en cours d'exécution"
        exit 1
    fi
}

# Vérifier que les conteneurs sont actifs
check_containers() {
    print_status "Vérification des conteneurs PostgreSQL..."
    
    for db_info in "${DATABASES[@]}"; do
        container_name=$(echo "$db_info" | cut -d: -f2)
        
        if ! docker ps --format "table {{.Names}}" | grep -q "^${container_name}$"; then
            print_error "Le conteneur $container_name n'est pas en cours d'exécution"
            exit 1
        fi
    done
    
    print_success "Tous les conteneurs PostgreSQL sont actifs"
}

# Restaurer une base de données
restore_database() {
    local db_info=$1
    local backup_dir=$2
    local force=$3
    
    local db_name=$(echo "$db_info" | cut -d: -f1)
    local container_name=$(echo "$db_info" | cut -d: -f2)
    local db_user=$(echo "$db_info" | cut -d: -f3)
    local db_password=$(echo "$db_info" | cut -d: -f4)
    
    local backup_file="$backup_dir/${db_name}_*.sql"
    local backup_files=($(ls $backup_file 2>/dev/null))
    
    if [ ${#backup_files[@]} -eq 0 ]; then
        print_warning "Aucun fichier de backup trouvé pour $db_name"
        return 0
    fi
    
    local backup_file_path="${backup_files[0]}"
    
    print_status "Restauration de $db_name depuis $backup_file_path..."
    
    # Exporter la variable d'environnement pour psql
    export PGPASSWORD="$db_password"
    
    if [ "$force" = "true" ]; then
        print_warning "Suppression des données existantes de $db_name..."
        docker exec "$container_name" psql -U "$db_user" -d "$db_name" -c "DROP SCHEMA public CASCADE; CREATE SCHEMA public;"
    fi
    
    # Restaurer la base de données
    docker exec -i "$container_name" psql -U "$db_user" -d "$db_name" < "$backup_file_path"
    
    if [ $? -eq 0 ]; then
        print_success "✅ $db_name restauré avec succès"
    else
        print_error "❌ Échec de la restauration de $db_name"
        return 1
    fi
}

# Fonction principale
main() {
    local backup_dir=""
    local force="false"
    local list_only="false"
    
    # Parse des arguments
    while [[ $# -gt 0 ]]; do
        case $1 in
            -h|--help)
                show_help
                exit 0
                ;;
            -l|--list)
                list_only="true"
                shift
                ;;
            -f|--force)
                force="true"
                shift
                ;;
            -*)
                print_error "Option inconnue: $1"
                show_help
                exit 1
                ;;
            *)
                backup_dir="$1"
                shift
                ;;
        esac
    done
    
    # Lister les backups si demandé
    if [ "$list_only" = "true" ]; then
        list_backups
        exit 0
    fi
    
    # Vérifier qu'un répertoire de backup est fourni
    if [ -z "$backup_dir" ]; then
        print_error "Veuillez spécifier un répertoire de backup"
        show_help
        exit 1
    fi
    
    # Vérifier que le répertoire de backup existe
    if [ ! -d "$backup_dir" ]; then
        print_error "Le répertoire de backup '$backup_dir' n'existe pas"
        exit 1
    fi
    
    print_status "🚀 Début de la restauration des bases de données microservices"
    print_status "📁 Répertoire de backup: $backup_dir"
    if [ "$force" = "true" ]; then
        print_warning "⚠️  Mode FORCE activé - Les données existantes seront supprimées"
    fi
    echo ""
    
    # Vérifications préliminaires
    check_docker
    check_containers
    
    # Restaurer chaque base de données
    print_status "📦 Restauration des bases de données..."
    for db_info in "${DATABASES[@]}"; do
        restore_database "$db_info" "$backup_dir" "$force"
    done
    
    print_success "🎉 Restauration terminée avec succès !"
    print_status "💡 Redémarrez vos services pour appliquer les changements"
}

# Exécuter le script
main "$@"
