#!/bin/bash

# =====================================================
# SCRIPT DE RESTAURATION UNIFIÉ - BASES DE DONNÉES MICROSERVICES
# Fonctionne en développement (Docker) et production (Railway)
# Utilise DATABASE_URL comme source unique de vérité
# =====================================================

set -e  # Arrêter en cas d'erreur

# Configuration
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
BACKUP_BASE_DIR="${BACKUP_BASE_DIR:-/backups}"

# Charger les fonctions communes
source "$SCRIPT_DIR/scripts/common.sh"

# Lister les backups disponibles
list_backups() {
    print_status "📋 Backups disponibles:"
    echo ""
    
    if [ ! -d "$BACKUP_BASE_DIR" ]; then
        print_error "Répertoire de backups introuvable: $BACKUP_BASE_DIR"
        return 1
    fi
    
    local backups=($(ls -1t "$BACKUP_BASE_DIR" 2>/dev/null | grep -E '^[0-9]{8}_[0-9]{6}$' || true))
    
    if [ ${#backups[@]} -eq 0 ]; then
        print_warning "Aucun backup trouvé"
        return 1
    fi
    
    for i in "${!backups[@]}"; do
        local backup="${backups[$i]}"
        local backup_path="$BACKUP_BASE_DIR/$backup"
        local date_str="${backup:0:8}"
        local time_str="${backup:9:6}"
        local formatted_date="${date_str:0:4}-${date_str:4:2}-${date_str:6:2} ${time_str:0:2}:${time_str:2:2}:${time_str:4:2}"
        local size=$(du -sh "$backup_path" 2>/dev/null | cut -f1)
        
        echo "  $((i+1)). $backup ($formatted_date) - $size"
    done
    
    echo ""
}

# Restaurer une base de données
restore_database() {
    local backup_file=$1
    local db_url=$2
    local force=${3:-false}
    
    local db_name=$(extract_db_name "$db_url")
    
    if [ -z "$db_name" ]; then
        print_error "Impossible d'extraire le nom de la base depuis DATABASE_URL"
        return 1
    fi
    
    print_status "Restauration de $db_name..."
    
    # Vérifier que le fichier de backup existe
    if [ ! -f "$backup_file" ]; then
        # Essayer avec .gz
        if [ -f "${backup_file}.gz" ]; then
            print_status "Décompression du backup..."
            gunzip -c "${backup_file}.gz" > "${backup_file}.tmp"
            backup_file="${backup_file}.tmp"
        else
            print_error "Fichier de backup introuvable: $backup_file"
            return 1
        fi
    fi
    
    # Vérifier l'intégrité
    if ! verify_backup "$backup_file"; then
        print_error "Backup invalide: $backup_file"
        return 1
    fi
    
    # Demander confirmation si pas en mode force
    if [ "$force" != "true" ]; then
        print_warning "⚠️  Cette opération va écraser les données de $db_name"
        read -p "Continuer? (oui/non): " confirm
        if [ "$confirm" != "oui" ]; then
            print_status "Restauration annulée"
            return 0
        fi
    fi
    
    # Restaurer avec psql
    print_status "Restauration en cours..."
    if psql "$db_url" < "$backup_file" 2>/dev/null; then
        print_success "✅ $db_name restauré avec succès"
        
        # Nettoyer le fichier temporaire si créé
        [ -f "${backup_file}.tmp" ] && rm -f "${backup_file}.tmp"
        return 0
    else
        print_error "❌ Échec de la restauration de $db_name"
        [ -f "${backup_file}.tmp" ] && rm -f "${backup_file}.tmp"
        return 1
    fi
}

# Restaurer toutes les bases depuis un backup
restore_all() {
    local backup_dir=$1
    local force=${2:-false}
    
    if [ ! -d "$backup_dir" ]; then
        print_error "Répertoire de backup introuvable: $backup_dir"
        return 1
    fi
    
    print_status "🚀 Début de la restauration"
    print_status "📁 Répertoire: $backup_dir"
    echo ""
    
    # Vérifications préliminaires
    check_psql
    
    # Détecter les bases de données
    print_status "🔍 Détection des bases de données..."
    local databases
    if ! databases=($("$SCRIPT_DIR/scripts/detect-databases.sh")); then
        print_error "Impossible de détecter les bases de données"
        exit 1
    fi
    
    echo ""
    
    # Restaurer chaque base
    local success_count=0
    local fail_count=0
    
    for db_url in "${databases[@]}"; do
        local db_name=$(extract_db_name "$db_url")
        local backup_file="$backup_dir/${db_name}_*.sql"
        
        # Chercher le fichier de backup (peut être .sql ou .sql.gz)
        local found_file=$(ls -1 $backup_file 2>/dev/null | head -1)
        if [ -z "$found_file" ]; then
            found_file=$(ls -1 ${backup_file}.gz 2>/dev/null | head -1)
        fi
        
        if [ -n "$found_file" ]; then
            if restore_database "$found_file" "$db_url" "$force"; then
                ((success_count++))
            else
                ((fail_count++))
            fi
        else
            print_warning "⚠️  Backup introuvable pour $db_name"
            ((fail_count++))
        fi
    done
    
    echo ""
    
    if [ $success_count -gt 0 ]; then
        print_success "✅ $success_count base(s) restaurée(s) avec succès"
    fi
    
    if [ $fail_count -gt 0 ]; then
        print_warning "⚠️  $fail_count restauration(s) ont échoué"
        return 1
    fi
}

# Fonction principale
main() {
    local backup_path=$1
    local force=false
    
    # Parser les arguments
    if [ "$1" = "--list" ] || [ "$1" = "-l" ]; then
        list_backups
        return 0
    fi
    
    if [ "$1" = "--force" ] || [ "$1" = "-f" ]; then
        force=true
        backup_path=$2
    fi
    
    if [ -z "$backup_path" ]; then
        print_error "Usage: $0 [--force] <backup_directory>"
        print_error "       $0 --list"
        echo ""
        print_status "Exemples:"
        echo "  $0 ./backups/20250118_020000"
        echo "  $0 --force ./backups/20250118_020000"
        echo "  $0 --list"
        exit 1
    fi
    
    restore_all "$backup_path" "$force"
}

# Exécuter le script
main "$@"
