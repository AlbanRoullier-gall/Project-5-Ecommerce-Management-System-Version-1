FROM nginx:alpine

# Supprimer la configuration par défaut pour éviter les conflits
RUN rm -f /etc/nginx/conf.d/default.conf

# Copier la configuration principale
COPY nginx/nginx.conf /etc/nginx/nginx.conf

# Note: routing.dev.conf est monté via volume dans docker-compose.dev.yml
# Pas besoin de le copier ici

# Exposer le port
EXPOSE 80

# Démarrer nginx
CMD ["nginx", "-g", "daemon off;"]
