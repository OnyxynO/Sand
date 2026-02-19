FROM nginx:alpine

# Supprimer la config par défaut
RUN rm /etc/nginx/conf.d/default.conf

# Copier notre configuration
COPY conf.d/app.conf /etc/nginx/conf.d/
