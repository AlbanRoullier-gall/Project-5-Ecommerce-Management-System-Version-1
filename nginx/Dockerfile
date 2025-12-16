FROM nginx:alpine

# Installer gettext pour envsubst
RUN apk add --no-cache gettext

# Supprimer la configuration par défaut pour éviter les conflits
RUN rm -f /etc/nginx/conf.d/default.conf

# Copier les configurations
COPY nginx/nginx.conf /etc/nginx/nginx.conf
# Copier uniquement routing.conf comme template (routing.dev.conf sera monté via volume en dev)
COPY nginx/conf.d/routing.conf /etc/nginx/conf.d/routing.conf.template
COPY nginx/conf.d/rate-limiting.conf /etc/nginx/conf.d/rate-limiting.conf

# Script d'entrée pour remplacer les variables d'environnement avec envsubst
RUN cat > /docker-entrypoint-envsubst.sh << 'EOFSCRIPT'
#!/bin/sh
set -e

# Vérifier que les variables d'environnement sont définies
if [ -z "$FRONTEND_URL" ]; then
    echo "❌ ERREUR: FRONTEND_URL n'est pas définie"
    exit 1
fi

if [ -z "$BACKOFFICE_URL" ]; then
    echo "❌ ERREUR: BACKOFFICE_URL n'est pas définie"
    exit 1
fi

if [ -z "$API_GATEWAY_URL" ]; then
    echo "❌ ERREUR: API_GATEWAY_URL n'est pas définie"
    exit 1
fi

# Extraire hostname:port des URLs (supprimer http:// ou https://)
export FRONTEND_HOST=$(echo "$FRONTEND_URL" | sed 's|^https\?://||')
export BACKOFFICE_HOST=$(echo "$BACKOFFICE_URL" | sed 's|^https\?://||')
export API_GATEWAY_HOST=$(echo "$API_GATEWAY_URL" | sed 's|^https\?://||')

# Vérifier que les hostnames ne sont pas vides
if [ -z "$FRONTEND_HOST" ]; then
    echo "❌ ERREUR: FRONTEND_HOST est vide après extraction de FRONTEND_URL=$FRONTEND_URL"
    exit 1
fi

if [ -z "$BACKOFFICE_HOST" ]; then
    echo "❌ ERREUR: BACKOFFICE_HOST est vide après extraction de BACKOFFICE_URL=$BACKOFFICE_URL"
    exit 1
fi

if [ -z "$API_GATEWAY_HOST" ]; then
    echo "❌ ERREUR: API_GATEWAY_HOST est vide après extraction de API_GATEWAY_URL=$API_GATEWAY_URL"
    exit 1
fi

echo "✅ Variables extraites:"
echo "   FRONTEND_HOST=$FRONTEND_HOST"
echo "   BACKOFFICE_HOST=$BACKOFFICE_HOST"
echo "   API_GATEWAY_HOST=$API_GATEWAY_HOST"

# Test de résolution DNS pour diagnostiquer les problèmes de connexion
echo "🔍 Test de résolution DNS..."
if command -v nslookup >/dev/null 2>&1; then
    echo "   Test API_GATEWAY_HOST: $(echo "$API_GATEWAY_HOST" | cut -d: -f1)"
    nslookup $(echo "$API_GATEWAY_HOST" | cut -d: -f1) || echo "   ⚠️ Résolution DNS échouée pour API_GATEWAY_HOST"
else
    echo "   nslookup non disponible, skip du test DNS"
fi

# Remplacer les variables dans le template
envsubst '${FRONTEND_HOST} ${BACKOFFICE_HOST} ${API_GATEWAY_HOST}' < /etc/nginx/conf.d/routing.conf.template > /etc/nginx/conf.d/routing.conf

# Valider la configuration nginx
echo "🔍 Validation de la configuration nginx..."
nginx -t || {
    echo "❌ ERREUR: La configuration nginx est invalide"
    echo "📄 Contenu de /etc/nginx/conf.d/routing.conf:"
    cat /etc/nginx/conf.d/routing.conf
    exit 1
}

echo "✅ Configuration nginx valide"
exec /docker-entrypoint.sh "$@"
EOFSCRIPT
RUN chmod +x /docker-entrypoint-envsubst.sh

# Exposer les ports
EXPOSE 80 443

# Démarrer nginx avec envsubst
ENTRYPOINT ["/docker-entrypoint-envsubst.sh"]
CMD ["nginx", "-g", "daemon off;"]
