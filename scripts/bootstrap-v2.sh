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

if [ ! -f "$BACKEND_DIR/.env.testing" ]; then
  cp "$BACKEND_DIR/.env.testing.v2.local.example" "$BACKEND_DIR/.env.testing"
  echo "[backend] .env.testing cree depuis .env.testing.v2.local.example"
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

if ! grep -q '^APP_KEY=base64:' "$BACKEND_DIR/.env.testing"; then
  if grep -q '^APP_KEY=base64:' "$BACKEND_DIR/.env"; then
    APP_KEY_LINE="$(grep '^APP_KEY=base64:' "$BACKEND_DIR/.env")"
    TMP_ENV_TESTING="$(mktemp)"
    while IFS= read -r line; do
      if [[ "$line" == APP_KEY=* ]]; then
        printf '%s\n' "$APP_KEY_LINE" >> "$TMP_ENV_TESTING"
      else
        printf '%s\n' "$line" >> "$TMP_ENV_TESTING"
      fi
    done < "$BACKEND_DIR/.env.testing"
    mv "$TMP_ENV_TESTING" "$BACKEND_DIR/.env.testing"
    echo "[backend] APP_KEY recopiee dans .env.testing"
  fi
fi

cat <<'EOF'

[sand-v2] bootstrap termine

Demarrage conseille :
  brew services start redis
  cd backend && php artisan migrate
  cd backend && php artisan serve --host=0.0.0.0 --port=8080
  cd frontend && npm run dev
  bash scripts/reset-v2-test-db.sh
  cd backend && php artisan test

Prerequis :
  - PostgreSQL joignable sur 127.0.0.1:5432
  - bases sand_v2 et sand_v2_test creees
  - Redis joignable sur 127.0.0.1:6379
EOF
