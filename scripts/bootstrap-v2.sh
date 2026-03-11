#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
BACKEND_DIR="$ROOT_DIR/backend"
FRONTEND_DIR="$ROOT_DIR/frontend"

echo "[sand-v2] bootstrap local"

if [ ! -f "$BACKEND_DIR/.env" ]; then
  cp "$BACKEND_DIR/.env.v2.local.example" "$BACKEND_DIR/.env"
  echo "[backend] .env cree depuis .env.v2.local.example"
fi

if [ ! -f "$FRONTEND_DIR/.env.local" ]; then
  cp "$FRONTEND_DIR/.env.v2.local.example" "$FRONTEND_DIR/.env.local"
  echo "[frontend] .env.local cree depuis .env.v2.local.example"
fi

if [ ! -e "$BACKEND_DIR/vendor/autoload.php" ]; then
  echo "[backend] installation composer"
  (cd "$BACKEND_DIR" && composer install)
fi

if [ ! -d "$FRONTEND_DIR/node_modules" ]; then
  echo "[frontend] installation npm"
  (cd "$FRONTEND_DIR" && npm install)
fi

if ! grep -q '^APP_KEY=base64:' "$BACKEND_DIR/.env"; then
  echo "[backend] generation APP_KEY"
  (cd "$BACKEND_DIR" && php artisan key:generate)
fi

cat <<'EOF'

[sand-v2] bootstrap termine

Demarrage conseille :
  brew services start redis
  cd backend && php artisan migrate
  cd backend && php artisan serve --host=0.0.0.0 --port=8080
  cd frontend && npm run dev

Prerequis :
  - PostgreSQL joignable sur 127.0.0.1:5432
  - base sand_v2 creee
  - Redis joignable sur 127.0.0.1:6379
EOF
