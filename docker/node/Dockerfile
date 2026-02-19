FROM node:20-alpine

# Installer pnpm (optionnel, npm fonctionne aussi)
RUN npm install -g pnpm

WORKDIR /app

# Script d'entrypoint pour installer les dépendances au démarrage
COPY entrypoint.sh /entrypoint.sh
RUN chmod +x /entrypoint.sh

EXPOSE 5173

ENTRYPOINT ["/entrypoint.sh"]
