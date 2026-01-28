FROM node:20-alpine

# Installer pnpm (optionnel, npm fonctionne aussi)
RUN npm install -g pnpm

WORKDIR /app

# L'installation des dépendances se fait au premier lancement
# via le volume monté

EXPOSE 5173
