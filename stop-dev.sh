#!/bin/bash

# =============================================================================
# SCRIPT D'ARRÊT DES SERVICES DE DÉVELOPPEMENT - VERSION AMÉLIORÉE
# =============================================================================
# Ce script arrête proprement tous les services démarrés par start-dev.sh
# =============================================================================

echo "🛑 ARRÊT DE TOUS LES SERVICES DE DÉVELOPPEMENT"
echo ""

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

# Fonction pour arrêter un service par PID
stop_service_by_pid() {
    local service_name=$1
    local pid_file="logs/${service_name}.pid"
    
    if [ -f "$pid_file" ]; then
        local PID=$(cat "$pid_file")
        
        if ps -p $PID > /dev/null 2>&1; then
            log_info "Arrêt de ${service_name} (PID: $PID)..."
            
            # Essayer d'abord un arrêt propre avec SIGTERM
            kill -TERM $PID 2>/dev/null
            
            # Attendre jusqu'à 10 secondes pour un arrêt propre
            local count=0
            while [ $count -lt 10 ]; do
                if ! ps -p $PID > /dev/null 2>&1; then
                    log_success "${service_name} arrêté proprement"
                    rm -f "$pid_file"
                    return 0
                fi
                sleep 1
                count=$((count + 1))
            done
            
            # Si le processus est toujours en vie, forcer l'arrêt avec SIGKILL
            log_warning "Arrêt forcé de ${service_name}..."
            kill -9 $PID 2>/dev/null
            sleep 2
            
            if ! ps -p $PID > /dev/null 2>&1; then
                log_success "${service_name} arrêté (forcé)"
                rm -f "$pid_file"
            else
                log_error "Impossible d'arrêter ${service_name} (PID: $PID)"
                return 1
            fi
        else
            log_warning "Le processus ${service_name} (PID: $PID) n'est pas en cours d'exécution"
            rm -f "$pid_file"
        fi
    else
        log_info "Aucun fichier PID trouvé pour ${service_name}"
    fi
    return 0
}

# Fonction pour arrêter un service par port
stop_service_by_port() {
    local service_name=$1
    local port=$2
    
    # Trouver le PID qui écoute sur le port
    local pid=$(lsof -ti :$port 2>/dev/null)
    
    if [ -n "$pid" ]; then
        log_info "Arrêt de ${service_name} sur le port $port (PID: $pid)..."
        
        # Essayer d'abord un arrêt propre
        kill -TERM $pid 2>/dev/null
        
        # Attendre jusqu'à 5 secondes
        local count=0
        while [ $count -lt 5 ]; do
            if ! lsof -i :$port > /dev/null 2>&1; then
                log_success "${service_name} arrêté proprement (port $port)"
                return 0
            fi
            sleep 1
            count=$((count + 1))
        done
        
        # Forcer l'arrêt si nécessaire
        log_warning "Arrêt forcé de ${service_name} sur le port $port..."
        kill -9 $pid 2>/dev/null
        sleep 2
        
        if ! lsof -i :$port > /dev/null 2>&1; then
            log_success "${service_name} arrêté (forcé, port $port)"
        else
            log_error "Impossible d'arrêter ${service_name} sur le port $port"
            return 1
        fi
    else
        log_info "Aucun service trouvé sur le port $port pour ${service_name}"
    fi
    return 0
}

# Fonction pour arrêter tous les processus Node.js en cours
stop_all_node_processes() {
    log_info "Recherche de processus Node.js orphelins..."
    
    # Trouver tous les processus Node.js liés à notre projet
    local node_pids=$(pgrep -f "npm run dev\|next dev\|ts-node-dev\|node.*dist.*index.js" 2>/dev/null)
    
    if [ -n "$node_pids" ]; then
        log_info "Arrêt des processus Node.js orphelins..."
        for pid in $node_pids; do
            if ps -p $pid > /dev/null 2>&1; then
                log_info "Arrêt du processus Node.js (PID: $pid)..."
                kill -TERM $pid 2>/dev/null
            fi
        done
        
        sleep 3
        
        # Vérifier et forcer l'arrêt si nécessaire
        for pid in $node_pids; do
            if ps -p $pid > /dev/null 2>&1; then
                log_warning "Arrêt forcé du processus Node.js (PID: $pid)..."
                kill -9 $pid 2>/dev/null
            fi
        done
        
        log_success "Processus Node.js orphelins arrêtés"
    else
        log_info "Aucun processus Node.js orphelin trouvé"
    fi
}

# Fonction pour arrêter un service avec double vérification (PID + Port)
stop_service() {
    local service_name=$1
    local port=$2
    
    # Essayer d'abord par PID
    stop_service_by_pid "$service_name"
    
    # Si un port est spécifié, vérifier aussi par port
    if [ -n "$port" ]; then
        if lsof -i :$port > /dev/null 2>&1; then
            log_info "Service encore actif sur le port $port, arrêt par port..."
            stop_service_by_port "$service_name" "$port"
        fi
    fi
}

# =============================================================================
# ARRÊT DES SERVICES SELON L'ORDRE INVERSE
# =============================================================================

echo "🎨 ARRÊT DES SERVICES FRONTEND..."

# Arrêter les services frontend en premier
stop_service "frontend" "3000"
stop_service "backoffice" "3009"

echo ""
echo "🌐 ARRÊT DE L'API GATEWAY..."

# Arrêter l'API Gateway
stop_service "api-gateway" "3020"

echo ""
echo "📦 ARRÊT DES SERVICES BACKEND..."

# Arrêter les services backend dans l'ordre inverse du démarrage
stop_service "email-service" "3006"
stop_service "payment-service" "3007"
## removed: website-content-service
stop_service "cart-service" "3004"
stop_service "order-service" "3003"
stop_service "product-service" "3002"
stop_service "customer-service" "3001"
stop_service "auth-service" "3008"

echo ""
echo "🧹 NETTOYAGE DES PROCESSUS ORPHELINS..."

# Arrêter tous les processus Node.js qui pourraient être restés
stop_all_node_processes

# =============================================================================
# NETTOYAGE DES FICHIERS TEMPORAIRES
# =============================================================================

echo ""
echo "🗑️  NETTOYAGE DES FICHIERS TEMPORAIRES..."

# Supprimer les fichiers PID restants
if [ -d "logs" ]; then
    remaining_pids=$(find logs -name "*.pid" 2>/dev/null | wc -l | tr -d ' ')
    if [ "$remaining_pids" -gt 0 ]; then
        log_info "Suppression de $remaining_pids fichiers PID restants..."
        rm -f logs/*.pid
        log_success "Fichiers PID supprimés"
    else
        log_info "Aucun fichier PID à supprimer"
    fi
else
    log_info "Dossier logs/ non trouvé"
fi

# Nettoyer les fichiers de logs temporaires
if [ -d "logs" ]; then
    find logs -name "*.log" -size 0 -delete 2>/dev/null
    log_info "Logs vides supprimés"
fi

# =============================================================================
# VÉRIFICATION FINALE ET NETTOYAGE FORCÉ
# =============================================================================

echo ""
echo "🔍 VÉRIFICATION FINALE..."

# Vérifier qu'aucun service n'écoute plus sur nos ports
ports=(3000 3001 3002 3003 3004 3006 3007 3008 3009 3020)
services_running=0

for port in "${ports[@]}"; do
    if lsof -i :$port > /dev/null 2>&1; then
        log_warning "Port $port encore occupé"
        services_running=$((services_running + 1))
        
        # Essayer un nettoyage forcé du port
        pid=$(lsof -ti :$port 2>/dev/null)
        if [ -n "$pid" ]; then
            log_info "Nettoyage forcé du port $port (PID: $pid)..."
            kill -9 $pid 2>/dev/null
            sleep 1
        fi
    fi
done

# Vérification finale après nettoyage forcé
services_running=0
for port in "${ports[@]}"; do
    if lsof -i :$port > /dev/null 2>&1; then
        log_warning "Port $port encore occupé après nettoyage forcé"
        services_running=$((services_running + 1))
    fi
done

echo ""
if [ $services_running -eq 0 ]; then
    echo "✅ TOUS LES SERVICES SONT ARRÊTÉS !"
    echo ""
    echo "📋 Résumé :"
    echo "   • Tous les services backend arrêtés"
    echo "   • Tous les services frontend arrêtés"
    echo "   • API Gateway arrêté"
    echo "   • Processus orphelins nettoyés"
    echo "   • Fichiers temporaires supprimés"
    echo "   • Ports libérés"
    echo ""
    echo "💡 Pour redémarrer tous les services : ./start-dev.sh"
else
    echo "⚠️  $services_running port(s) encore occupé(s)"
    echo "📝 Ports encore occupés :"
    for port in "${ports[@]}"; do
        if lsof -i :$port > /dev/null 2>&1; then
            echo "   • Port $port"
        fi
    done
    echo ""
    echo "🔧 Vous pouvez forcer l'arrêt avec :"
    echo "   sudo lsof -ti :PORT | xargs sudo kill -9"
    echo ""
    echo "🔄 Ou relancer ce script : ./stop-dev.sh"
fi

echo ""
echo "🛑 Arrêt terminé !"