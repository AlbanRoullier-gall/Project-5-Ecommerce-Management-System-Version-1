#!/bin/bash

# =====================================================
# SCRIPT DE BACKUP UNIFIÉ - BASES DE DONNÉES MICROSERVICES
# Fonctionne en développement (Docker) et production (Railway)
# Utilise DATABASE_URL comme source unique de vérité
# =====================================================

set -e  # Arrêter en cas d'erreur

# Configuration
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
BACKUP_BASE_DIR="${BACKUP_BASE_DIR:-/backups}"
DATE=$(date +"%Y%m%d_%H%M%S")
BACKUP_DIR="$BACKUP_BASE_DIR/$DATE"
RETENTION_DAYS="${BACKUP_RETENTION_DAYS:-7}"

# Charger les fonctions communes
source "$SCRIPT_DIR/scripts/common.sh"

# Sauvegarder une base de données depuis DATABASE_URL
backup_database() {
    local db_url=$1
    local db_name=$(extract_db_name "$db_url")
    local service_name=$(extract_service_name "$db_name")
    
    if [ -z "$db_name" ]; then
        print_error "Impossible d'extraire le nom de la base depuis DATABASE_URL"
        return 1
    fi
    
    print_status "Sauvegarde de $db_name ($service_name)..."
    
    local backup_file="$BACKUP_DIR/${db_name}_${DATE}.sql"
    
    # Exécuter pg_dump avec DATABASE_URL (désactiver set -e temporairement)
    set +e
    pg_dump "$db_url" > "$backup_file" 2>/dev/null
    local dump_result=$?
    set -e
    
    if [ $dump_result -eq 0 ]; then
        # Vérifier que le fichier a été créé et n'est pas vide
        if [ -f "$backup_file" ] && [ -s "$backup_file" ]; then
            local file_size=$(du -h "$backup_file" | cut -f1)
            print_success "✅ $db_name sauvegardé (${file_size})"
            
            # Compresser immédiatement (ne pas arrêter si échec)
            set +e
            compress_backup "$backup_file"
            set -e
            return 0
        else
            print_error "❌ Fichier de backup vide ou inexistant: $backup_file"
            return 1
        fi
    else
        print_error "❌ Échec de la sauvegarde de $db_name"
        return 1
    fi
}

# Fonction principale
main() {
    local backup_type="${1:-daily}"  # daily, weekly, ou manual
    
    print_status "🚀 Début du backup des bases de données microservices"
    print_status "📅 Date: $(date)"
    print_status "🔧 Type: $backup_type"
    echo ""
    
    # Vérifications préliminaires
    check_pg_dump
    
    # Détecter les bases de données
    print_status "🔍 Détection des bases de données..."
    local databases_output
    # Capturer stdout et stderr séparément, ignorer les messages d'info
    databases_output=$("$SCRIPT_DIR/scripts/detect-databases.sh" 2>/dev/null | grep -E "^postgresql://" || true)
    
    if [ -z "$databases_output" ]; then
        print_error "Impossible de détecter les bases de données"
        exit 1
    fi
    
    # Lire les bases ligne par ligne (seulement les lignes qui commencent par postgresql://)
    local databases=()
    while IFS= read -r line; do
        if [[ "$line" =~ ^postgresql:// ]]; then
            databases+=("$line")
        fi
    done <<< "$databases_output"
    
    if [ ${#databases[@]} -eq 0 ]; then
        print_error "Aucune base de données détectée"
        exit 1
    fi
    
    echo ""
    
    # Créer le répertoire de backup
    create_backup_dir "$BACKUP_DIR"
    
    # Sauvegarder chaque base de données
    print_status "📦 Sauvegarde des bases de données..."
    local success_count=0
    local fail_count=0
    
    # Désactiver set -e temporairement pour la boucle
    set +e
    for db_url in "${databases[@]}"; do
        if backup_database "$db_url"; then
            ((success_count++))
        else
            ((fail_count++))
        fi
    done
    set -e
    
    echo ""
    
    # Vérifier qu'au moins un backup a réussi
    if [ $success_count -eq 0 ]; then
        print_error "❌ Aucun backup n'a réussi"
        exit 1
    fi
    
    # Créer l'archive complète
    create_archive "$BACKUP_DIR" "$DATE"
    
    # Nettoyer les anciens backups
    cleanup_old_backups "$BACKUP_BASE_DIR" "$RETENTION_DAYS"
    
    # Afficher le résumé
    echo ""
    show_backup_summary "$BACKUP_DIR" "$DATE"
    
    if [ $fail_count -gt 0 ]; then
        print_warning "⚠️  $fail_count backup(s) ont échoué"
        exit 1
    fi
}

# Exécuter le script
main "$@"
