FROM nginx:alpine

# Supprimer la configuration par défaut pour éviter les conflits
RUN rm -f /etc/nginx/conf.d/default.conf

# Copier les configurations
COPY nginx/nginx.conf /etc/nginx/nginx.conf
# Copier uniquement routing.conf (routing.dev.conf sera monté via volume en dev)
COPY nginx/conf.d/routing.conf /etc/nginx/conf.d/routing.conf
COPY nginx/conf.d/rate-limiting.conf /etc/nginx/conf.d/rate-limiting.conf

# Exposer les ports
EXPOSE 80 443

# Démarrer nginx
CMD ["nginx", "-g", "daemon off;"]
