#!/bin/bash

# =====================================================
# SCRIPT DE BACKUP DOCKER - BASES DE DONNÉES MICROSERVICES
# Projet: E-commerce Portal - Architecture Microservices
# =====================================================

set -e  # Arrêter en cas d'erreur

# Couleurs pour les messages
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration du backup
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
BACKUP_BASE_DIR="./backups"
DATE=$(date +"%Y%m%d_%H%M%S")
BACKUP_DIR="$BACKUP_BASE_DIR/$DATE"

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

# Créer le répertoire de backup
create_backup_dir() {
    print_status "Création du répertoire de backup: $BACKUP_DIR"
    mkdir -p "$BACKUP_DIR"
}

# Sauvegarder une base de données
backup_database() {
    local db_info=$1
    local db_name=$(echo "$db_info" | cut -d: -f1)
    local container_name=$(echo "$db_info" | cut -d: -f2)
    local db_user=$(echo "$db_info" | cut -d: -f3)
    local db_password=$(echo "$db_info" | cut -d: -f4)
    
    print_status "Sauvegarde de $db_name depuis $container_name..."
    
    # Exporter la variable d'environnement pour pg_dump
    export PGPASSWORD="$db_password"
    
    # Créer le backup
    docker exec "$container_name" pg_dump -U "$db_user" -d "$db_name" > "$BACKUP_DIR/${db_name}_${DATE}.sql"
    
    # Vérifier que le fichier a été créé et n'est pas vide
    if [ -f "$BACKUP_DIR/${db_name}_${DATE}.sql" ] && [ -s "$BACKUP_DIR/${db_name}_${DATE}.sql" ]; then
        local file_size=$(du -h "$BACKUP_DIR/${db_name}_${DATE}.sql" | cut -f1)
        print_success "✅ $db_name sauvegardé (${file_size})"
    else
        print_error "❌ Échec de la sauvegarde de $db_name"
        return 1
    fi
}

# Créer une archive complète
create_archive() {
    print_status "Création de l'archive complète..."
    
    local archive_name="microservices_backup_${DATE}.tar.gz"
    local archive_path="$BACKUP_DIR/$archive_name"
    
    cd "$BACKUP_DIR"
    tar -czf "$archive_name" *.sql
    cd - > /dev/null
    
    if [ -f "$archive_path" ]; then
        local archive_size=$(du -h "$archive_path" | cut -f1)
        print_success "✅ Archive créée: $archive_name (${archive_size})"
    else
        print_error "❌ Échec de la création de l'archive"
        return 1
    fi
}

# Nettoyer les anciens backups (garder les 5 plus récents)
cleanup_old_backups() {
    print_status "Nettoyage des anciens backups..."
    
    local backup_count=$(ls -1 "$BACKUP_BASE_DIR" | grep -E '^[0-9]{8}_[0-9]{6}$' | wc -l)
    
    if [ "$backup_count" -gt 5 ]; then
        local to_delete=$((backup_count - 5))
        print_status "Suppression de $to_delete ancien(s) backup(s)..."
        
        ls -1t "$BACKUP_BASE_DIR" | grep -E '^[0-9]{8}_[0-9]{6}$' | tail -n "$to_delete" | while read -r old_backup; do
            print_status "Suppression de $old_backup"
            rm -rf "$BACKUP_BASE_DIR/$old_backup"
        done
    fi
}

# Afficher le résumé
show_summary() {
    print_success "🎉 Backup terminé avec succès !"
    echo ""
    print_status "📁 Répertoire de backup: $BACKUP_DIR"
    print_status "📅 Date: $DATE"
    echo ""
    print_status "📊 Fichiers créés:"
    ls -lh "$BACKUP_DIR" | grep -E '\.(sql|tar\.gz)$' | while read -r line; do
        echo "   $line"
    done
    echo ""
    print_status "💾 Taille totale: $(du -sh "$BACKUP_DIR" | cut -f1)"
}

# Fonction principale
main() {
    print_status "🚀 Début du backup des bases de données microservices"
    print_status "📅 Date: $(date)"
    echo ""
    
    # Vérifications préliminaires
    check_docker
    check_containers
    
    # Créer le répertoire de backup
    create_backup_dir
    
    # Sauvegarder chaque base de données
    print_status "📦 Sauvegarde des bases de données..."
    for db_info in "${DATABASES[@]}"; do
        backup_database "$db_info"
    done
    
    # Créer l'archive complète
    create_archive
    
    # Nettoyer les anciens backups
    cleanup_old_backups
    
    # Afficher le résumé
    show_summary
}

# Exécuter le script
main "$@"
