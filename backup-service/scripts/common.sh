#!/bin/bash

# =====================================================
# FONCTIONS COMMUNES POUR LES SCRIPTS DE BACKUP
# Utilisées par backup.sh et restore.sh
# =====================================================

# Couleurs pour les messages
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Fonctions utilitaires de logging
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

# Vérifier que pg_dump est disponible
check_pg_dump() {
    if ! command -v pg_dump &> /dev/null; then
        print_error "pg_dump n'est pas installé. Installation requise."
        exit 1
    fi
}

# Vérifier que psql est disponible
check_psql() {
    if ! command -v psql &> /dev/null; then
        print_error "psql n'est pas installé. Installation requise."
        exit 1
    fi
}

# Extraire le nom de la base depuis DATABASE_URL
extract_db_name() {
    local db_url=$1
    # Extraire le nom de la base après le dernier /
    # Format: postgresql://user:password@host:port/database
    echo "$db_url" | sed -n 's|.*/\([^/?]*\).*|\1|p'
}

# Extraire le nom du service depuis le nom de la base
extract_service_name() {
    local db_name=$1
    echo "$db_name" | sed 's/_db$//'
}

# Créer le répertoire de backup
create_backup_dir() {
    local backup_dir=$1
    print_status "Création du répertoire de backup: $backup_dir"
    mkdir -p "$backup_dir"
    if [ ! -d "$backup_dir" ]; then
        print_error "Impossible de créer le répertoire de backup"
        exit 1
    fi
}

# Compresser un fichier SQL
compress_backup() {
    local sql_file=$1
    if [ -f "$sql_file" ] && [ -s "$sql_file" ]; then
        print_status "Compression de $sql_file..."
        gzip -f "$sql_file"
        if [ -f "${sql_file}.gz" ]; then
            local file_size=$(du -h "${sql_file}.gz" | cut -f1)
            print_success "✅ Fichier compressé: ${sql_file}.gz (${file_size})"
            return 0
        else
            print_error "❌ Échec de la compression"
            return 1
        fi
    else
        print_error "❌ Fichier SQL vide ou inexistant: $sql_file"
        return 1
    fi
}

# Créer une archive complète
create_archive() {
    local backup_dir=$1
    local date=$2
    
    print_status "Création de l'archive complète..."
    
    local archive_name="backup_${date}.tar.gz"
    local archive_path="$backup_dir/$archive_name"
    
    cd "$backup_dir" || exit 1
    tar -czf "$archive_name" *.sql.gz 2>/dev/null || tar -czf "$archive_name" *.sql 2>/dev/null
    cd - > /dev/null || exit 1
    
    if [ -f "$archive_path" ]; then
        local archive_size=$(du -h "$archive_path" | cut -f1)
        print_success "✅ Archive créée: $archive_name (${archive_size})"
        echo "$archive_path"
    else
        print_error "❌ Échec de la création de l'archive"
        return 1
    fi
}

# Nettoyer les anciens backups
cleanup_old_backups() {
    local backup_base_dir=$1
    local retention_days=${2:-7}
    
    print_status "Nettoyage des backups plus anciens que $retention_days jours..."
    
    if [ ! -d "$backup_base_dir" ]; then
        return 0
    fi
    
    # Supprimer les dossiers de backup plus anciens que retention_days
    find "$backup_base_dir" -type d -name "20*" -mtime +$retention_days -exec rm -rf {} \; 2>/dev/null || true
    
    # Compter les backups restants
    local backup_count=$(find "$backup_base_dir" -type d -name "20*" 2>/dev/null | wc -l)
    print_success "✅ $backup_count backup(s) conservé(s)"
}

# Vérifier l'intégrité d'un backup
verify_backup() {
    local backup_file=$1
    
    if [ ! -f "$backup_file" ]; then
        print_error "Fichier de backup introuvable: $backup_file"
        return 1
    fi
    
    if [ ! -s "$backup_file" ]; then
        print_error "Fichier de backup vide: $backup_file"
        return 1
    fi
    
    # Vérifier que c'est un fichier SQL valide (contient au moins CREATE ou INSERT)
    if file "$backup_file" | grep -q "gzip\|SQL\|text"; then
        print_success "✅ Backup valide: $backup_file"
        return 0
    else
        print_warning "⚠️  Format de backup suspect: $backup_file"
        return 0  # On continue quand même
    fi
}

# Afficher le résumé du backup
show_backup_summary() {
    local backup_dir=$1
    local date=$2
    
    print_success "🎉 Backup terminé avec succès !"
    echo ""
    print_status "📁 Répertoire de backup: $backup_dir"
    print_status "📅 Date: $date"
    echo ""
    print_status "📊 Fichiers créés:"
    if [ -d "$backup_dir" ]; then
        ls -lh "$backup_dir" 2>/dev/null | grep -E '\.(sql|gz|tar\.gz)$' | while read -r line; do
            echo "   $line"
        done
    fi
    echo ""
    if [ -d "$backup_dir" ]; then
        print_status "💾 Taille totale: $(du -sh "$backup_dir" 2>/dev/null | cut -f1)"
    fi
}
