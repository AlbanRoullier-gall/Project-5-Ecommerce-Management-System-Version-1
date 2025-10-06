#!/bin/bash

# =====================================================
# SCRIPT DE TEST DU SYSTÈME DE BACKUP
# Projet: E-commerce Portal - Architecture Microservices
# =====================================================

set -e  # Arrêter en cas d'erreur

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

# Configuration des bases de données Docker (adaptée)
DATABASES=(
    "customer_db:portailecommerce2-customer-db-1:customer_user:customer_password"
    "product_db:portailecommerce2-product-db-1:product_user:product_password"
    "order_db:portailecommerce2-order-db-1:order_user:order_password"
    "website_content_db:portailecommerce2-content-db-1:content_user:content_password"
)

# Vérifier que Docker est en cours d'exécution
check_docker() {
    print_status "🔍 Vérification de Docker..."
    if ! docker info > /dev/null 2>&1; then
        print_error "Docker n'est pas en cours d'exécution"
        exit 1
    fi
    print_success "Docker est en cours d'exécution"
}

# Vérifier que les conteneurs PostgreSQL sont actifs
check_containers() {
    print_status "🔍 Vérification des conteneurs PostgreSQL..."
    
    local active_containers=0
    local total_containers=${#DATABASES[@]}
    
    for db_info in "${DATABASES[@]}"; do
        local container_name=$(echo "$db_info" | cut -d: -f2)
        local db_name=$(echo "$db_info" | cut -d: -f1)
        
        if docker ps --format "table {{.Names}}" | grep -q "^${container_name}$"; then
            print_success "✅ $db_name ($container_name) - Actif"
            ((active_containers++))
        else
            print_error "❌ $db_name ($container_name) - Inactif"
        fi
    done
    
    echo ""
    print_status "📊 Résumé: $active_containers/$total_containers conteneurs actifs"
    
    if [ $active_containers -eq $total_containers ]; then
        print_success "🎉 Tous les conteneurs PostgreSQL sont actifs"
        return 0
    else
        print_error "⚠️  Certains conteneurs PostgreSQL ne sont pas actifs"
        return 1
    fi
}

# Tester la connectivité aux bases de données
test_database_connectivity() {
    print_status "🔍 Test de connectivité aux bases de données..."
    
    local success_count=0
    local total_count=${#DATABASES[@]}
    
    for db_info in "${DATABASES[@]}"; do
        local db_name=$(echo "$db_info" | cut -d: -f1)
        local container_name=$(echo "$db_info" | cut -d: -f2)
        local db_user=$(echo "$db_info" | cut -d: -f3)
        local db_password=$(echo "$db_info" | cut -d: -f4)
        
        print_status "Test de $db_name..."
        
        # Exporter la variable d'environnement pour psql
        export PGPASSWORD="$db_password"
        
        if docker exec "$container_name" psql -U "$db_user" -d "$db_name" -c "SELECT 1;" > /dev/null 2>&1; then
            print_success "✅ $db_name - Connexion réussie"
            ((success_count++))
        else
            print_error "❌ $db_name - Échec de connexion"
        fi
    done
    
    echo ""
    print_status "📊 Résumé: $success_count/$total_count bases de données accessibles"
    
    if [ $success_count -eq $total_count ]; then
        print_success "🎉 Toutes les bases de données sont accessibles"
        return 0
    else
        print_error "⚠️  Certaines bases de données ne sont pas accessibles"
        return 1
    fi
}

# Tester les permissions de backup
test_backup_permissions() {
    print_status "🔍 Test des permissions de backup..."
    
    local success_count=0
    local total_count=${#DATABASES[@]}
    
    for db_info in "${DATABASES[@]}"; do
        local db_name=$(echo "$db_info" | cut -d: -f1)
        local container_name=$(echo "$db_info" | cut -d: -f2)
        local db_user=$(echo "$db_info" | cut -d: -f3)
        local db_password=$(echo "$db_info" | cut -d: -f4)
        
        print_status "Test de backup pour $db_name..."
        
        # Exporter la variable d'environnement pour pg_dump
        export PGPASSWORD="$db_password"
        
        # Tester pg_dump sans créer de fichier
        if docker exec "$container_name" pg_dump -U "$db_user" -d "$db_name" --schema-only > /dev/null 2>&1; then
            print_success "✅ $db_name - Permissions de backup OK"
            ((success_count++))
        else
            print_error "❌ $db_name - Permissions de backup insuffisantes"
        fi
    done
    
    echo ""
    print_status "📊 Résumé: $success_count/$total_count bases de données avec permissions de backup"
    
    if [ $success_count -eq $total_count ]; then
        print_success "🎉 Toutes les bases de données ont les permissions de backup"
        return 0
    else
        print_error "⚠️  Certaines bases de données n'ont pas les permissions de backup"
        return 1
    fi
}

# Afficher les informations de configuration
show_configuration() {
    print_status "📋 Configuration actuelle du système de backup:"
    echo ""
    echo "🗄️  Bases de données configurées:"
    for db_info in "${DATABASES[@]}"; do
        local db_name=$(echo "$db_info" | cut -d: -f1)
        local container_name=$(echo "$db_info" | cut -d: -f2)
        local db_user=$(echo "$db_info" | cut -d: -f3)
        echo "   • $db_name → $container_name (utilisateur: $db_user)"
    done
    echo ""
    print_status "📁 Répertoire de backup: ./backups/"
    print_status "🔧 Scripts disponibles:"
    echo "   • backup-docker.sh - Créer un backup"
    echo "   • restore-docker.sh - Restaurer un backup"
    echo "   • verify-backup.sh - Vérifier les backups"
    echo "   • detect-containers.sh - Détecter les conteneurs"
}

# Fonction principale
main() {
    print_status "🚀 Test du système de backup des bases de données microservices"
    print_status "📅 Date: $(date)"
    echo ""
    
    # Afficher la configuration
    show_configuration
    echo ""
    
    # Vérifications
    local all_tests_passed=true
    
    if ! check_docker; then
        all_tests_passed=false
    fi
    echo ""
    
    if ! check_containers; then
        all_tests_passed=false
    fi
    echo ""
    
    if ! test_database_connectivity; then
        all_tests_passed=false
    fi
    echo ""
    
    if ! test_backup_permissions; then
        all_tests_passed=false
    fi
    echo ""
    
    # Résumé final
    print_status "📊 RÉSUMÉ FINAL"
    echo "=================================="
    
    if [ "$all_tests_passed" = true ]; then
        print_success "🎉 Tous les tests sont passés avec succès !"
        print_status "💡 Le système de backup est prêt à être utilisé"
        echo ""
        print_status "🚀 Commandes disponibles:"
        echo "   • ./backup-docker.sh - Créer un backup complet"
        echo "   • ./restore-docker.sh --list - Lister les backups"
        echo "   • ./verify-backup.sh - Vérifier tous les backups"
    else
        print_error "❌ Certains tests ont échoué"
        print_warning "⚠️  Vérifiez la configuration avant d'utiliser le système de backup"
        echo ""
        print_status "🔧 Actions recommandées:"
        echo "   • Démarrer tous les conteneurs: docker-compose up -d"
        echo "   • Vérifier les logs: docker-compose logs"
        echo "   • Relancer ce test: ./test-backup.sh"
    fi
}

# Exécuter le script
main "$@"
