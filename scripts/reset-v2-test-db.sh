#!/usr/bin/env bash
set -euo pipefail

PG_BIN_DIR="${PG_BIN_DIR:-$(brew --prefix postgresql@17 2>/dev/null)/bin}"
DROPDB_BIN="$PG_BIN_DIR/dropdb"
CREATEDB_BIN="$PG_BIN_DIR/createdb"
PSQL_BIN="$PG_BIN_DIR/psql"

if [ ! -x "$DROPDB_BIN" ] || [ ! -x "$CREATEDB_BIN" ] || [ ! -x "$PSQL_BIN" ]; then
  echo "[sand-v2] binaires PostgreSQL introuvables dans $PG_BIN_DIR" >&2
  exit 1
fi

TEST_DB_NAME="${1:-sand_v2_test}"
APP_DB_OWNER="${APP_DB_OWNER:-sand}"

echo "[sand-v2] recreation de la base de test: $TEST_DB_NAME"
"$DROPDB_BIN" --if-exists "$TEST_DB_NAME"
"$CREATEDB_BIN" "$TEST_DB_NAME"
"$PSQL_BIN" -d postgres -c "ALTER DATABASE \"$TEST_DB_NAME\" OWNER TO \"$APP_DB_OWNER\";"

echo "[sand-v2] base de test prete: $TEST_DB_NAME"
