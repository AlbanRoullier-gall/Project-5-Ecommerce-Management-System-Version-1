#!/bin/bash

# =============================================================================
# SCRIPT DE DÉMARRAGE DÉVELOPPEMENT - INSPIRÉ DE DOCKER COMPOSE
# =============================================================================
# Ce script reproduit exactement la logique de docker-compose.dev.yml
# mais sans Docker, en utilisant les services directement
# =============================================================================

# Configuration des couleurs pour les logs
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Fonction pour afficher les logs avec couleur
log_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

log_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

log_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

echo "🚀 DÉMARRAGE DE VOTRE PROJET E-COMMERCE EN MODE DÉVELOPPEMENT"
echo "📋 Configuration basée sur docker-compose.dev.yml"
echo ""

# Vérification des prérequis
echo "🔍 VÉRIFICATION DES PRÉREQUIS..."

# Vérifier si PostgreSQL est installé et en cours d'exécution
if ! command -v psql &> /dev/null; then
    log_error "PostgreSQL n'est pas installé. Veuillez l'installer d'abord."
    exit 1
fi

# Vérifier si Redis est installé et en cours d'exécution
if ! command -v redis-server &> /dev/null; then
    log_warning "Redis n'est pas installé. Installation en cours..."
    if command -v brew &> /dev/null; then
        brew install redis
    else
        log_error "Veuillez installer Redis manuellement"
        exit 1
    fi
fi

# Démarrer Redis si nécessaire
if ! pgrep -x "redis-server" > /dev/null; then
    log_info "Démarrage de Redis..."
    redis-server --daemonize yes
    sleep 2
fi

# Vérifier si PostgreSQL est en cours d'exécution
if ! pgrep -x "postgres" > /dev/null; then
    log_info "Démarrage de PostgreSQL..."
    if command -v brew &> /dev/null; then
        brew services start postgresql
    else
        log_error "Veuillez démarrer PostgreSQL manuellement"
        exit 1
    fi
    sleep 3
fi

# Créer les bases de données si elles n'existent pas
log_info "Vérification et création des bases de données..."
create_databases() {
    local databases=(
        "auth_db"
        "customer_db" 
        "product_db"
        "order_db"
        "cart_db"
        # removed: website_content_db
        "payment_db"
        "email_db"
    )
    
    for db in "${databases[@]}"; do
        if ! psql -lqt | cut -d \| -f 1 | grep -qw "$db"; then
            log_info "Création de la base de données $db..."
            createdb "$db" 2>/dev/null || log_warning "Base $db existe déjà ou erreur de création"
        fi
    done
}

create_databases

# Fonction pour arrêter les services existants
stop_existing_services() {
    log_info "Arrêt des services existants..."
    
    # Arrêter les processus existants
    for pid_file in logs/*.pid; do
        if [ -f "$pid_file" ]; then
            local pid=$(cat "$pid_file")
            if ps -p $pid > /dev/null 2>&1; then
                log_info "Arrêt du processus $pid..."
                kill $pid 2>/dev/null || true
            fi
            rm -f "$pid_file"
        fi
    done
    
    # Attendre que les ports soient libérés
    sleep 3
}

# Arrêter les services existants avant de redémarrer
stop_existing_services

# Fonction pour vérifier si un port est libre
is_port_free() {
    local port=$1
    ! lsof -i :$port > /dev/null 2>&1
}

# Fonction pour vérifier si un service est en cours d'exécution
is_service_running() {
    local port=$1
    # Vérification avec curl pour les services backend
    if [ $port -ge 3000 ] && [ $port -le 3020 ]; then
        curl -s http://localhost:$port/api/health > /dev/null 2>&1
        return $?
    else
        # Pour les services frontend, vérifier juste que le port écoute
        lsof -i :$port > /dev/null 2>&1
        return $?
    fi
}

# Fonction pour attendre qu'un service soit prêt
wait_for_service() {
    local service_name=$1
    local port=$2
    local max_attempts=20  # Augmenté pour plus de fiabilité
    local attempt=1
    
    log_info "Attente du démarrage de $service_name sur le port $port..."
    
    while [ $attempt -le $max_attempts ]; do
        if is_service_running $port; then
            log_success "$service_name est prêt !"
            return 0
        fi
        
        echo -n "."
        sleep 1  # 1 seconde par tentative
        attempt=$((attempt + 1))
    done
    
    log_error "$service_name n'a pas démarré dans les temps"
    return 1
}

# Fonction pour démarrer un service backend
start_backend_service() {
    local name=$1
    local port=$2
    local path=$3
    local db_url=$4
    local additional_env=""
    
    # Vérifier si le port est libre
    if ! is_port_free $port; then
        log_warning "Port $port déjà utilisé, tentative de libération..."
        lsof -ti :$port | xargs kill -9 2>/dev/null || true
        sleep 2
    fi
    
    # Variables d'environnement spécifiques selon le service
    case $name in
        "cart-service")
            additional_env="export REDIS_URL=redis://localhost:6379;"
            ;;
        "order-service"|"payment-service")
            additional_env="export STRIPE_SECRET_KEY=sk_test_51RtjchLi6vN59MNetUhP86QSndKeI5GfJCMseKO8dSq4D93k0td4AZyJ5d4SiKTveQh9pThKaj9d9MyzpTEuoFdU00ZW6qtK90;"
            ;;
        "payment-service")
            additional_env="export STRIPE_SECRET_KEY=sk_test_51RtjchLi6vN59MNetUhP86QSndKeI5GfJCMseKO8dSq4D93k0td4AZyJ5d4SiKTveQh9pThKaj9d9MyzpTEuoFdU00ZW6qtK90; export STRIPE_PUBLISHABLE_KEY=pk_test_51RtjchLi6vN59MNe1w9bJlC4Gg2Pnuti0Oub3RRuh4QFVPmh77ZE9oOmL3ewA6vnB2NvWjSizIup9gq9Y6pyTmdV00xFVugPSe;"
            ;;
        "email-service")
            additional_env="export GMAIL_USER=u4999410740@gmail.com; export GMAIL_APP_PASSWORD='vyli fdmp hrww jvlz'; export ADMIN_EMAIL=u4999410740@gmail.com;"
            ;;
    esac
    
    log_info "Démarrage de $name sur le port $port..."
    
    if [ -d "$path" ]; then
        # Vérifier si les dépendances sont installées
        if [ ! -d "$path/node_modules" ]; then
            log_info "Installation des dépendances pour $name..."
            (cd "$path" && npm install)
        fi
        
        # Créer le fichier de log s'il n'existe pas
        mkdir -p logs
        
        # Démarrer le service en arrière-plan avec toutes les variables d'environnement
        (
            cd "$path"
            eval "$additional_env"
            export NODE_ENV=development
            export JWT_SECRET=your-jwt-secret-key
            export PORT=$port
            export DATABASE_URL="$db_url"
            export NODE_TLS_REJECT_UNAUTHORIZED=0
            
            # Variables d'environnement pour éviter les erreurs de permissions
            export PGUSER=albanroullier-gall
            export PGPASSWORD=""
            export PGHOST=localhost
            export PGPORT=5432
            
            # Chemin des logs selon le type de service
            if [[ "$path" == services/* ]]; then
                npm run dev > "../../logs/${name}.log" 2>&1 &
                local pid=$!
                echo $pid > "../../logs/${name}.pid"
            else
                npm run dev > "../logs/${name}.log" 2>&1 &
                local pid=$!
                echo $pid > "../logs/${name}.pid"
            fi
        )
        
        # Attendre un peu que le service démarre
        sleep 3  # Temps suffisant pour l'initialisation
        
        # Vérifier si le service est démarré
        if [ -f "logs/${name}.pid" ]; then
            local pid=$(cat "logs/${name}.pid")
            if ps -p $pid > /dev/null 2>&1; then
                # Attendre que le service soit vraiment prêt
                if wait_for_service "$name" $port; then
                    log_success "$name démarré (PID: $pid)"
                    return 0
                else
                    log_error "$name n'est pas prêt après le démarrage"
                    return 1
                fi
            else
                log_error "$name n'a pas démarré correctement"
                return 1
            fi
        else
            log_error "Fichier PID pour $name non créé"
            return 1
        fi
    else
        log_error "Répertoire $path non trouvé pour $name"
        return 1
    fi
}

# Fonction pour démarrer un service frontend
start_frontend_service() {
    local name=$1
    local port=$2
    local path=$3
    
    # Vérifier si le port est libre
    if ! is_port_free $port; then
        log_warning "Port $port déjà utilisé, tentative de libération..."
        lsof -ti :$port | xargs kill -9 2>/dev/null || true
        sleep 2
    fi
    
    log_info "Démarrage de $name sur le port $port..."
    
    if [ -d "$path" ]; then
        # Vérifier si les dépendances sont installées
        if [ ! -d "$path/node_modules" ]; then
            log_info "Installation des dépendances pour $name..."
            (cd "$path" && npm install)
        fi
        
        # Créer le fichier de log s'il n'existe pas
        mkdir -p logs
        
        # Démarrer le service frontend en arrière-plan
        (
            cd "$path"
            export NODE_ENV=development
            export NEXT_PUBLIC_API_URL=http://localhost:3020
            export NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_your_stripe_publishable_key
            export NODE_TLS_REJECT_UNAUTHORIZED=0
            
            # Variables spécifiques pour le backoffice
            if [ "$name" = "backoffice" ]; then
                export NEXT_TELEMETRY_DISABLED=1
                export WEBPACK_DISABLE_CACHE=1
                export NODE_OPTIONS=--max-old-space-size=4096
            fi
            
            PORT=$port npm run dev > "../logs/${name}.log" 2>&1 &
            local pid=$!
            echo $pid > "../logs/${name}.pid"
        )
        
        # Attendre un peu que le service démarre
        sleep 5  # Temps suffisant pour Next.js
        
        # Vérifier si le service est démarré
        if [ -f "logs/${name}.pid" ]; then
            local pid=$(cat "logs/${name}.pid")
            if ps -p $pid > /dev/null 2>&1; then
                # Vérifier que le service répond
                local max_attempts=10
                local attempt=1
                while [ $attempt -le $max_attempts ]; do
                    if curl -s http://localhost:$port > /dev/null 2>&1; then
                        log_success "$name démarré (PID: $pid)"
                        return 0
                    fi
                    sleep 2
                    attempt=$((attempt + 1))
                done
                log_warning "$name démarré mais ne répond pas encore (PID: $pid)"
                return 0
            else
                log_error "$name n'a pas démarré correctement"
                return 1
            fi
        else
            log_error "Fichier PID pour $name non créé"
            return 1
        fi
    else
        log_error "Répertoire $path non trouvé pour $name"
        return 1
    fi
}

# =============================================================================
# DÉMARRAGE DES SERVICES SELON L'ORDRE DE DOCKER COMPOSE
# =============================================================================

echo "📦 DÉMARRAGE DES SERVICES BACKEND..."

# Phase 1: Services avec base de données (démarrage séquentiel pour fiabilité)
# Utiliser les vrais utilisateurs et configurations de base de données
backend_services=(
    "auth-service:3008:services/auth-service:postgresql://albanroullier-gall@localhost:5432/auth_db"
    "customer-service:3001:services/customer-service:postgresql://customer_user:customer_password@localhost:5432/customer_db"
    "product-service:3002:services/product-service:postgresql://microservices_user@localhost:5432/product_db"
    "order-service:3003:services/order-service:postgresql://microservices_user@localhost:5432/order_db"
    "cart-service:3004:services/cart-service:postgresql://albanroullier-gall@localhost:5432/cart_db"
    # removed: website-content-service
    "payment-service:3007:services/payment-service:postgresql://albanroullier-gall@localhost:5432/payment_db"
    "email-service:3006:services/email-service:postgresql://albanroullier-gall@localhost:5432/email_db"
    "pdf-export-service:3040:services/pdf-export-service:"
)

backend_success=0
backend_total=${#backend_services[@]}

# Démarrer les services backend séquentiellement (plus fiable)
for service_config in "${backend_services[@]}"; do
    IFS=':' read -r name port path db_url <<< "$service_config"
    
    if start_backend_service "$name" "$port" "$path" "$db_url"; then
        backend_success=$((backend_success + 1))
    else
        log_error "Échec du démarrage de $name"
    fi
    
    # Petite pause entre les services
    sleep 2  # Temps suffisant entre les services
done

log_info "Services backend démarrés: $backend_success/$backend_total"

echo ""
echo "⏳ Attente que tous les services backend soient prêts..."
sleep 5  # Temps suffisant pour tous les services

echo ""
echo "🌐 DÉMARRAGE DE L'API GATEWAY..."
# Phase 2: API Gateway (dépend de tous les services backend)
if start_backend_service "api-gateway" 3020 "api-gateway" ""; then
    log_success "API Gateway démarré avec succès"
else
    log_error "Échec du démarrage de l'API Gateway"
fi

echo ""
echo "⏳ Attente que l'API Gateway soit prêt..."
sleep 3  # Temps suffisant pour l'API Gateway

echo ""
echo "🎨 DÉMARRAGE DES SERVICES FRONTEND..."

# Phase 3: Services frontend (dépendent de l'API Gateway)
frontend_services=(
    "frontend:3000:frontend"
    "backoffice:3009:backoffice"
)

frontend_success=0
frontend_total=${#frontend_services[@]}

for service_config in "${frontend_services[@]}"; do
    IFS=':' read -r name port path <<< "$service_config"
    
    if start_frontend_service "$name" "$port" "$path"; then
        frontend_success=$((frontend_success + 1))
    else
        log_error "Échec du démarrage de $name"
    fi
    
    # Petite pause entre les services
    sleep 2  # Temps suffisant entre les services
done

log_info "Services frontend démarrés: $frontend_success/$frontend_total"

echo ""
echo "⏳ Attente finale pour que tous les services soient opérationnels..."
sleep 5  # Temps suffisant pour la vérification finale

# =============================================================================
# VÉRIFICATION FINALE DES SERVICES
# =============================================================================

echo ""
echo "🔍 VÉRIFICATION FINALE DES SERVICES..."

# Test des services backend
services_backend=(
    "api-gateway:3020"
    "auth-service:3008"
    "customer-service:3001"
    "product-service:3002"
    "order-service:3003"
    "cart-service:3004"
    # removed: website-content-service
    "payment-service:3007"
    "email-service:3006"
    "pdf-export-service:3040"
)

backend_ok=0
backend_total=${#services_backend[@]}

for service in "${services_backend[@]}"; do
    name=$(echo $service | cut -d: -f1)
    port=$(echo $service | cut -d: -f2)
    
    if is_service_running $port; then
        log_success "$name (port $port) - OK"
        backend_ok=$((backend_ok + 1))
    else
        log_error "$name (port $port) - KO"
    fi
done

# Test des services frontend
services_frontend=(
    "frontend:3000"
    "backoffice:3009"
)

frontend_ok=0
frontend_total=${#services_frontend[@]}

for service in "${services_frontend[@]}"; do
    name=$(echo $service | cut -d: -f1)
    port=$(echo $service | cut -d: -f2)
    
    if curl -s http://localhost:$port > /dev/null 2>&1; then
        log_success "$name (port $port) - OK"
        frontend_ok=$((frontend_ok + 1))
    else
        log_error "$name (port $port) - KO"
    fi
done

# =============================================================================
# RÉSUMÉ FINAL
# =============================================================================

echo ""
echo "📊 RÉSUMÉ DU DÉMARRAGE :"
echo "   Backend: $backend_ok/$backend_total services OK"
echo "   Frontend: $frontend_ok/$frontend_total services OK"
echo "   Services démarrés avec succès: Backend $backend_success/$backend_total, Frontend $frontend_success/$frontend_total"
echo ""

if [ $backend_ok -eq $backend_total ] && [ $frontend_ok -eq $frontend_total ]; then
    echo "🎉 TOUS VOS SERVICES SONT OPÉRATIONNELS !"
    echo ""
    echo "📋 URLs d'accès :"
    echo "   🌐 Frontend: http://localhost:3000"
    echo "   🎛️  Backoffice: http://localhost:3009"
    echo "   🔗 API Gateway: http://localhost:3020"
    echo ""
    echo "📊 Services backend disponibles :"
    echo "   🔐 Auth Service: http://localhost:3008"
    echo "   👥 Customer Service: http://localhost:3001"
    echo "   📦 Product Service: http://localhost:3002"
    echo "   📋 Order Service: http://localhost:3003"
    echo "   🛒 Cart Service: http://localhost:3004"
    # removed: Website Content Service URL
    echo "   📧 Email Service: http://localhost:3006"
    echo "   💳 Payment Service: http://localhost:3007"
    echo "   📄 PDF Export Service: http://localhost:3040"
    echo ""
    echo "💡 Pour arrêter tous les services : ./stop-dev.sh"
    echo "📝 Logs disponibles dans le dossier logs/"
else
    echo "⚠️  Certains services n'ont pas démarré correctement."
    echo "📝 Consultez les logs dans le dossier logs/ pour plus de détails."
    echo "🔄 Vous pouvez relancer ce script pour redémarrer les services."
fi

echo ""
echo "🚀 Votre projet e-commerce est prêt pour le développement !"