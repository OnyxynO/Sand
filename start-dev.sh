#!/bin/bash
# Script de demarrage de l'environnement de dev SAND

echo "=== Demarrage environnement SAND ==="

# Verifier Docker
if ! docker info > /dev/null 2>&1; then
    echo "❌ Docker n'est pas lance. Lance Docker Desktop d'abord."
    exit 1
fi

echo "✓ Docker OK"

# Aller au bon repertoire
cd "$(dirname "$0")"

# Lancer PostgreSQL et Redis
echo "→ Demarrage PostgreSQL et Redis..."
docker-compose up -d db redis
sleep 3

# Verifier que la DB est prete
until docker-compose exec -T db pg_isready -U sand > /dev/null 2>&1; do
    echo "  Attente PostgreSQL..."
    sleep 2
done
echo "✓ PostgreSQL OK"

# Tuer les anciens processus sur les ports
echo "→ Nettoyage des ports..."
lsof -ti:8080 | xargs kill -9 2>/dev/null
lsof -ti:5173 | xargs kill -9 2>/dev/null

# Lancer le backend
echo "→ Demarrage backend Laravel (port 8080)..."
cd backend
php artisan config:clear > /dev/null 2>&1
php artisan serve --host=0.0.0.0 --port=8080 > /tmp/sand-backend.log 2>&1 &
cd ..

sleep 2

# Verifier backend
if curl -s http://localhost:8080/graphql -X POST -H "Content-Type: application/json" -d '{"query":"{ __typename }"}' | grep -q "Query"; then
    echo "✓ Backend OK (http://localhost:8080)"
else
    echo "❌ Backend en erreur. Voir /tmp/sand-backend.log"
fi

# Lancer le frontend
echo "→ Demarrage frontend Vite (port 5173)..."
cd frontend
npm run dev > /tmp/sand-frontend.log 2>&1 &
cd ..

sleep 3

echo ""
echo "=== Environnement pret ==="
echo "  Frontend : http://localhost:5173"
echo "  Backend  : http://localhost:8080"
echo "  GraphiQL : http://localhost:8080/graphiql"
echo ""
echo "  Compte admin : admin@sand.local / password"
echo ""
echo "  Logs : /tmp/sand-backend.log et /tmp/sand-frontend.log"
