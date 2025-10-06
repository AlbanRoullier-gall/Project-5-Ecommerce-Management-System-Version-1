#!/bin/bash

# =====================================================
# SCRIPT DE VÉRIFICATION DES BACKUPS
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

# Vérifier qu'un backup est valide
verify_backup() {
    local backup_dir=$1
    
    print_status "🔍 Vérification du backup: $backup_dir"
    
    if [ ! -d "$backup_dir" ]; then
        print_error "Le répertoire de backup n'existe pas: $backup_dir"
        return 1
    fi
    
    local valid_backup=true
    
    # Vérifier chaque base de données
    for db_info in "${DATABASES[@]}"; do
        local db_name=$(echo "$db_info" | cut -d: -f1)
        local backup_file="$backup_dir/${db_name}_*.sql"
        local backup_files=($(ls $backup_file 2>/dev/null))
        
        if [ ${#backup_files[@]} -eq 0 ]; then
            print_error "❌ Fichier de backup manquant pour $db_name"
            valid_backup=false
        else
            local backup_file_path="${backup_files[0]}"
            local file_size=$(du -h "$backup_file_path" | cut -f1)
            
            # Vérifier que le fichier n'est pas vide
            if [ ! -s "$backup_file_path" ]; then
                print_error "❌ Fichier de backup vide pour $db_name"
                valid_backup=false
            else
                print_success "✅ $db_name: $backup_file_path ($file_size)"
            fi
        fi
    done
    
    # Vérifier l'archive si elle existe
    local archive_file="$backup_dir/microservices_backup_*.tar.gz"
    local archive_files=($(ls $archive_file 2>/dev/null))
    
    if [ ${#archive_files[@]} -gt 0 ]; then
        local archive_path="${archive_files[0]}"
        local archive_size=$(du -h "$archive_path" | cut -f1)
        print_success "✅ Archive: $archive_path ($archive_size)"
    else
        print_warning "⚠️  Aucune archive trouvée"
    fi
    
    if [ "$valid_backup" = "true" ]; then
        print_success "🎉 Backup valide: $backup_dir"
        return 0
    else
        print_error "❌ Backup invalide: $backup_dir"
        return 1
    fi
}

# Tester la connectivité des bases de données
test_connectivity() {
    print_status "🔗 Test de connectivité des bases de données..."
    
    for db_info in "${DATABASES[@]}"; do
        local db_name=$(echo "$db_info" | cut -d: -f1)
        local container_name=$(echo "$db_info" | cut -d: -f2)
        local db_user=$(echo "$db_info" | cut -d: -f3)
        local db_password=$(echo "$db_info" | cut -d: -f4)
        
        export PGPASSWORD="$db_password"
        
        if docker exec "$container_name" psql -U "$db_user" -d "$db_name" -c "SELECT 1;" > /dev/null 2>&1; then
            print_success "✅ $db_name: Connexion OK"
        else
            print_error "❌ $db_name: Connexion échouée"
        fi
    done
}

# Lister et vérifier tous les backups
verify_all_backups() {
    print_status "📁 Vérification de tous les backups..."
    echo ""
    
    if [ -d "./backups" ]; then
        local backup_count=0
        local valid_count=0
        
        for backup_dir in ./backups/*/; do
            if [ -d "$backup_dir" ]; then
                backup_count=$((backup_count + 1))
                local backup_name=$(basename "$backup_dir")
                
                if verify_backup "$backup_dir"; then
                    valid_count=$((valid_count + 1))
                fi
                echo ""
            fi
        done
        
        print_status "📊 Résumé: $valid_count/$backup_count backups valides"
    else
        print_warning "Aucun répertoire de backup trouvé"
    fi
}

# Fonction principale
main() {
    print_status "🚀 Vérification du système de backup"
    print_status "📅 Date: $(date)"
    echo ""
    
    # Test de connectivité
    test_connectivity
    echo ""
    
    # Vérifier tous les backups
    verify_all_backups
    
    print_success "🎉 Vérification terminée !"
}

# Exécuter le script
main "$@"
