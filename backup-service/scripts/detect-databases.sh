#!/bin/bash

# =====================================================
# DÉTECTION AUTOMATIQUE DES BASES DE DONNÉES
# Détecte automatiquement l'environnement (Docker dev ou Railway prod)
# et retourne les DATABASE_URL disponibles
# =====================================================

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
source "$SCRIPT_DIR/common.sh"

# Détecter les bases de données depuis les variables d'environnement Railway
detect_from_env_vars() {
    local databases=()
    
    # Chercher toutes les variables DATABASE_URL_* ou DATABASE_URL
    if [ -n "$DATABASE_URL_CUSTOMER" ] || [ -n "$DATABASE_URL" ]; then
        databases+=("${DATABASE_URL_CUSTOMER:-$DATABASE_URL}")
    fi
    
    # En production Railway, chaque service a sa propre DATABASE_URL
    # On peut aussi chercher les variables spécifiques
    for var in $(env | grep -E '^DATABASE_URL' | cut -d= -f1); do
        local db_url="${!var}"
        if [ -n "$db_url" ]; then
            databases+=("$db_url")
        fi
    done
    
    # Retourner une par ligne pour faciliter le parsing
    if [ ${#databases[@]} -gt 0 ]; then
        printf '%s\n' "${databases[@]}"
    fi
}

# Détecter les bases depuis Docker Compose (développement)
# Cette fonction nécessite docker, donc elle ne fonctionnera pas dans le conteneur backup-service
# Elle est gardée pour compatibilité mais ne sera pas utilisée dans le conteneur
detect_from_docker() {
    local databases=()
    
    if ! command -v docker &> /dev/null; then
        return 0  # Retourner 0 pour ne pas bloquer, mais ne rien retourner
    fi
    
    if ! docker info > /dev/null 2>&1; then
        return 0  # Retourner 0 pour ne pas bloquer
    fi
    
    # Liste des services avec bases de données
    local services=("customer-service" "product-service" "order-service" "auth-service")
    
    for service in "${services[@]}"; do
        # Chercher le conteneur du service
        local container=$(docker ps --format "{{.Names}}" | grep -E "${service}|${service%-service}" | head -1)
        
        if [ -n "$container" ]; then
            # Extraire DATABASE_URL depuis les variables d'environnement du conteneur
            local db_url=$(docker exec "$container" env 2>/dev/null | grep "DATABASE_URL" | cut -d= -f2- | head -1)
            
            if [ -n "$db_url" ]; then
                databases+=("$db_url")
            fi
        fi
    done
    
    # Retourner une par ligne pour faciliter le parsing
    if [ ${#databases[@]} -gt 0 ]; then
        printf '%s\n' "${databases[@]}"
    fi
}

# Détecter depuis les conteneurs de base de données directement
# Utilise les noms de services Docker Compose (accessibles depuis le réseau Docker)
# Cette fonction ne nécessite pas docker car elle utilise directement les noms de services
detect_from_db_containers() {
    local databases=()
    
    # Noms de services Docker Compose (accessibles depuis le réseau Docker)
    # Ces noms fonctionnent depuis n'importe quel conteneur du même réseau Docker
    # Utiliser les credentials par défaut de docker-compose.dev.yml
    # En développement, on utilise toujours ces valeurs hardcodées
    databases+=("postgresql://customer_user:customer_password@customer-db:5432/customer_db")
    databases+=("postgresql://product_user:product_password@product-db:5432/product_db")
    databases+=("postgresql://order_user:order_password@order-db:5432/order_db")
    databases+=("postgresql://auth_user:auth_password@auth-db:5432/auth_db")
    
    # Retourner une par ligne pour faciliter le parsing
    printf '%s\n' "${databases[@]}"
}

# Fonction principale de détection
detect_databases() {
    local databases=()
    
    print_status "Détection de l'environnement et des bases de données..."
    
    # Essayer d'abord les variables d'environnement (Railway prod)
    local env_dbs_output=$(detect_from_env_vars 2>/dev/null)
    if [ -n "$env_dbs_output" ]; then
        while IFS= read -r line; do
            [ -n "$line" ] && databases+=("$line")
        done <<< "$env_dbs_output"
        if [ ${#databases[@]} -gt 0 ]; then
        print_success "✅ Environnement détecté: Production (Railway)"
        fi
    fi
    
    # Si pas de bases trouvées, essayer Docker Compose (dev)
    if [ ${#databases[@]} -eq 0 ]; then
        local docker_dbs_output=$(detect_from_docker 2>/dev/null)
        if [ -n "$docker_dbs_output" ]; then
            while IFS= read -r line; do
                [ -n "$line" ] && databases+=("$line")
            done <<< "$docker_dbs_output"
            if [ ${#databases[@]} -gt 0 ]; then
            print_success "✅ Environnement détecté: Développement (Docker Compose)"
            fi
        fi
    fi
    
    # Dernier recours: conteneurs de base de données directement (toujours en dev)
    if [ ${#databases[@]} -eq 0 ]; then
        local container_dbs_output=$(detect_from_db_containers 2>/dev/null)
        if [ -n "$container_dbs_output" ]; then
            # Lire ligne par ligne pour gérer correctement les espaces dans les URLs
            while IFS= read -r line; do
                [ -n "$line" ] && databases+=("$line")
            done <<< "$container_dbs_output"
            
            if [ ${#databases[@]} -gt 0 ]; then
                print_success "✅ Environnement détecté: Développement (Conteneurs Docker)"
            fi
        fi
    fi
    
    # Si toujours aucune base trouvée
    if [ ${#databases[@]} -eq 0 ]; then
        print_error "❌ Aucune base de données détectée"
        return 1
    fi
    
    # Afficher les bases détectées
    print_status "📊 Bases de données détectées: ${#databases[@]}"
    for i in "${!databases[@]}"; do
        local db_url="${databases[$i]}"
        local db_name=$(extract_db_name "$db_url")
        print_status "   $((i+1)). $db_name"
    done
    
    # Retourner les DATABASE_URL (une par ligne pour faciliter le parsing)
    printf '%s\n' "${databases[@]}"
}

# Si exécuté directement, afficher les bases détectées
if [ "${BASH_SOURCE[0]}" = "${0}" ]; then
    detect_databases
fi
