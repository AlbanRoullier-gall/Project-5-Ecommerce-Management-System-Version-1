#!/bin/bash

# Script de développement - Lancement avec hot reload
set -e

# Couleurs pour les messages
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Fonction pour afficher les messages colorés
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

# Fonction pour vérifier si Docker est en cours d'exécution
check_docker() {
    if ! docker info > /dev/null 2>&1; then
        print_error "Docker n'est pas en cours d'exécution. Veuillez démarrer Docker Desktop."
        exit 1
    fi
}

# Fonction pour nettoyer les ressources Docker
cleanup() {
    print_status "Nettoyage des ressources Docker..."
    docker system prune -f
    docker volume prune -f
}

# Fonction pour afficher l'aide
show_help() {
    echo "Usage: $0 [OPTIONS]"
    echo ""
    echo "Options:"
    echo "  -h, --help     Afficher cette aide"
    echo "  -c, --clean    Nettoyer les ressources Docker avant de démarrer"
    echo "  -b, --build    Forcer la reconstruction des images"
    echo "  -d, --detach   Démarrer en arrière-plan"
    echo "  -l, --logs     Afficher les logs après le démarrage"
    echo ""
    echo "Exemples:"
    echo "  $0              # Démarrer normalement"
    echo "  $0 --clean      # Nettoyer et démarrer"
    echo "  $0 --build      # Reconstruire et démarrer"
    echo "  $0 --detach     # Démarrer en arrière-plan"
}

# Variables par défaut
CLEAN=false
BUILD=false
DETACH=false
SHOW_LOGS=false

# Parse des arguments
while [[ $# -gt 0 ]]; do
    case $1 in
        -h|--help)
            show_help
            exit 0
            ;;
        -c|--clean)
            CLEAN=true
            shift
            ;;
        -b|--build)
            BUILD=true
            shift
            ;;
        -d|--detach)
            DETACH=true
            shift
            ;;
        -l|--logs)
            SHOW_LOGS=true
            shift
            ;;
        *)
            print_error "Option inconnue: $1"
            show_help
            exit 1
            ;;
    esac
done

# Vérification de Docker
print_status "Vérification de Docker..."
check_docker

# Nettoyage si demandé
if [ "$CLEAN" = true ]; then
    cleanup
fi

print_status "🚀 Lancement en mode développement..."

# Arrêter les conteneurs existants
print_status "🛑 Arrêt des conteneurs existants..."
docker-compose -f docker-compose.dev.yml down

# Préparer la commande de lancement
COMPOSE_CMD="docker-compose -f docker-compose.dev.yml up"

if [ "$BUILD" = true ]; then
    COMPOSE_CMD="$COMPOSE_CMD --build"
fi

if [ "$DETACH" = true ]; then
    COMPOSE_CMD="$COMPOSE_CMD -d"
fi

# Lancer en mode développement
print_status "▶️  Lancement en mode développement..."
eval $COMPOSE_CMD

if [ "$DETACH" = false ]; then
    print_success "✅ Mode développement lancé !"
    echo ""
    print_status "📱 Accédez à vos interfaces :"
    echo "   • 🛍️  Frontend Client    : http://localhost:13008 (avec hot reload)"
    echo "   • ⚙️  Back Office Admin  : http://localhost:13009 (avec hot reload)"
    echo "   • 🔌 API Gateway        : http://localhost:13000"
    echo ""
    print_status "🔥 Hot reload activé pour :"
    echo "   • Frontend (pages, composants, styles)"
    echo "   • Back Office (pages, composants, styles)"
    echo ""
    print_status "💡 Modifiez vos fichiers et voyez les changements en temps réel !"
    echo "📝 Logs en temps réel : docker-compose -f docker-compose.dev.yml logs -f"
else
    print_success "✅ Mode développement lancé en arrière-plan !"
    echo ""
    print_status "📱 Accédez à vos interfaces :"
    echo "   • 🛍️  Frontend Client    : http://localhost:13008"
    echo "   • ⚙️  Back Office Admin  : http://localhost:13009"
    echo "   • 🔌 API Gateway        : http://localhost:13000"
    echo ""
    print_status "🔧 Commandes utiles :"
    echo "   • Voir les logs    : docker-compose -f docker-compose.dev.yml logs -f"
    echo "   • Arrêter          : docker-compose -f docker-compose.dev.yml down"
    echo "   • Redémarrer       : docker-compose -f docker-compose.dev.yml restart"
    echo "   • Statut           : docker-compose -f docker-compose.dev.yml ps"
    
    if [ "$SHOW_LOGS" = true ]; then
        print_status "📝 Affichage des logs..."
        docker-compose -f docker-compose.dev.yml logs -f
    fi
fi
