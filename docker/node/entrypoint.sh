#!/bin/sh
set -e

# Installer les dépendances si node_modules n'existe pas ou est vide
if [ ! -d "node_modules" ] || [ -z "$(ls -A node_modules 2>/dev/null)" ]; then
    echo "Installation des dépendances npm..."
    npm install
fi

# Exécuter la commande passée en argument
exec "$@"
