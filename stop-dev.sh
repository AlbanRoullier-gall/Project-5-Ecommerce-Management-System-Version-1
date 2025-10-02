#!/bin/bash

# =============================================================================
# SCRIPT D'ARRÊT DES SERVICES DE DÉVELOPPEMENT
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

# Fonction pour arrêter un service
stop_service() {
    local service_name=$1
    local pid_file="logs/${service_name}.pid"
    
    if [ -f "$pid_file" ]; then
        local PID=$(cat "$pid_file")
        
        if ps -p $PID > /dev/null 2>&1; then
            log_info "Arrêt de ${service_name} (PID: $PID)..."
            
            # Essayer d'abord un arrêt propre avec SIGTERM
            kill $PID
            
            # Attendre 5 secondes pour un arrêt propre
            local count=0
            while [ $count -lt 5 ]; do
                if ! ps -p $PID > /dev/null 2>&1; then
                    log_success "${service_name} arrêté proprement"
                    rm "$pid_file"
                    return 0
                fi
                sleep 1
                count=$((count + 1))
            done
            
            # Si le processus est toujours en vie, forcer l'arrêt avec SIGKILL
            log_warning "Arrêt forcé de ${service_name}..."
            kill -9 $PID 2>/dev/null
            
            if ! ps -p $PID > /dev/null 2>&1; then
                log_success "${service_name} arrêté (forcé)"
            else
                log_error "Impossible d'arrêter ${service_name}"
            fi
            
            rm "$pid_file"
        else
            log_warning "Le processus ${service_name} (PID: $PID) n'est pas en cours d'exécution"
            rm "$pid_file"
        fi
    else
        log_info "Aucun fichier PID trouvé pour ${service_name}. Le service n'était peut-être pas démarré."
    fi
}

# Fonction pour arrêter tous les processus Node.js en cours
stop_all_node_processes() {
    log_info "Recherche de processus Node.js orphelins..."
    
    # Trouver tous les processus Node.js liés à notre projet
    local node_pids=$(pgrep -f "npm run dev\|next dev\|ts-node-dev" | xargs)
    
    if [ -n "$node_pids" ]; then
        log_info "Arrêt des processus Node.js orphelins..."
        echo $node_pids | xargs kill -TERM 2>/dev/null
        sleep 3
        echo $node_pids | xargs kill -9 2>/dev/null
        log_success "Processus Node.js orphelins arrêtés"
    else
        log_info "Aucun processus Node.js orphelin trouvé"
    fi
}

# =============================================================================
# ARRÊT DES SERVICES SELON L'ORDRE INVERSE
# =============================================================================

echo "🎨 ARRÊT DES SERVICES FRONTEND..."

# Arrêter les services frontend en premier
stop_service "frontend"
stop_service "backoffice"

echo ""
echo "🌐 ARRÊT DE L'API GATEWAY..."

# Arrêter l'API Gateway
stop_service "api-gateway"

echo ""
echo "📦 ARRÊT DES SERVICES BACKEND..."

# Arrêter les services backend dans l'ordre inverse du démarrage
stop_service "email-service"
stop_service "payment-service"
stop_service "website-content-service"
stop_service "cart-service"
stop_service "order-service"
stop_service "product-service"
stop_service "customer-service"
stop_service "auth-service"

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
    local remaining_pids=$(find logs -name "*.pid" 2>/dev/null | wc -l)
    if [ $remaining_pids -gt 0 ]; then
        log_info "Suppression de $remaining_pids fichiers PID restants..."
        rm -f logs/*.pid
        log_success "Fichiers PID supprimés"
    else
        log_info "Aucun fichier PID à supprimer"
    fi
else
    log_info "Dossier logs/ non trouvé"
fi

# =============================================================================
# VÉRIFICATION FINALE
# =============================================================================

echo ""
echo "🔍 VÉRIFICATION FINALE..."

# Vérifier qu'aucun service n'écoute plus sur nos ports
ports=(3000 3001 3002 3003 3004 3005 3006 3007 3008 3009 3020)
services_running=0

for port in "${ports[@]}"; do
    if lsof -i :$port > /dev/null 2>&1; then
        log_warning "Port $port encore occupé"
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
    echo ""
    echo "💡 Pour redémarrer tous les services : ./start-dev.sh"
else
    echo "⚠️  $services_running port(s) encore occupé(s)"
    echo "📝 Vous pouvez vérifier manuellement avec : lsof -i :PORT"
    echo "🔄 Relancez ce script si nécessaire"
fi

echo ""
echo "🛑 Arrêt terminé !"