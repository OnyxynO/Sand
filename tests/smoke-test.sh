#!/bin/bash
#
# Smoke Tests SAND
# Verifie que tous les services demarrent et communiquent correctement.
#
# Usage:
#   ./tests/smoke-test.sh          # Execution locale
#   ./tests/smoke-test.sh --ci     # Mode CI (attend plus longtemps)
#

set -e

# Couleurs pour l'affichage
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Configuration
MAX_WAIT=60
SLEEP_INTERVAL=2
CI_MODE=false

# Traitement des arguments
if [[ "$1" == "--ci" ]]; then
    CI_MODE=true
    MAX_WAIT=120
fi

# Fonctions utilitaires
log_info() {
    echo -e "${GREEN}[OK]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERREUR]${NC} $1"
}

log_warn() {
    echo -e "${YELLOW}[ATTENTION]${NC} $1"
}

log_step() {
    echo -e "\n=== $1 ==="
}

# Attendre qu'un service reponde
wait_for_service() {
    local name=$1
    local url=$2
    local expected=$3
    local waited=0

    echo -n "Attente de $name..."
    while [ $waited -lt $MAX_WAIT ]; do
        if curl -sf "$url" 2>/dev/null | grep -q "$expected"; then
            echo " OK"
            return 0
        fi
        echo -n "."
        sleep $SLEEP_INTERVAL
        waited=$((waited + SLEEP_INTERVAL))
    done
    echo " TIMEOUT"
    return 1
}

# Debut des tests
echo "============================================"
echo "         SMOKE TESTS - SAND"
echo "============================================"
echo "Mode: $([ "$CI_MODE" = true ] && echo 'CI' || echo 'Local')"
echo "Timeout: ${MAX_WAIT}s"
echo ""

# 1. Verification des conteneurs Docker
log_step "1/6 - Verification des conteneurs Docker"

EXPECTED_CONTAINERS="sand-app sand-nginx sand-db sand-redis sand-frontend sand-mock-rh"
MISSING=0

for container in $EXPECTED_CONTAINERS; do
    status=$(docker inspect -f '{{.State.Status}}' "$container" 2>/dev/null || echo "not_found")
    if [ "$status" = "running" ]; then
        log_info "$container: running"
    else
        log_error "$container: $status"
        MISSING=$((MISSING + 1))
    fi
done

if [ $MISSING -gt 0 ]; then
    log_error "$MISSING conteneur(s) non operationnel(s)"
    exit 1
fi

# 2. Verification PostgreSQL
log_step "2/6 - Verification PostgreSQL"

if docker exec sand-db pg_isready -U sand -d sand > /dev/null 2>&1; then
    log_info "PostgreSQL est pret"
else
    log_error "PostgreSQL n'est pas accessible"
    exit 1
fi

# 3. Verification Redis
log_step "3/6 - Verification Redis"

REDIS_RESPONSE=$(docker exec sand-redis redis-cli ping 2>/dev/null || echo "FAIL")
if [ "$REDIS_RESPONSE" = "PONG" ]; then
    log_info "Redis repond (PONG)"
else
    log_error "Redis ne repond pas: $REDIS_RESPONSE"
    exit 1
fi

# 4. Verification API Backend
log_step "4/6 - Verification API Backend"

if wait_for_service "Backend Health" "http://localhost:8080/api/health" '"status"'; then
    HEALTH=$(curl -sf http://localhost:8080/api/health)
    log_info "Backend health: $HEALTH"

    # Verification des sous-services
    if echo "$HEALTH" | grep -q '"database":"ok"'; then
        log_info "  - Database: OK"
    else
        log_warn "  - Database: DEGRADED"
    fi

    if echo "$HEALTH" | grep -q '"redis":"ok"'; then
        log_info "  - Redis: OK"
    else
        log_warn "  - Redis: DEGRADED"
    fi
else
    log_error "Backend health endpoint ne repond pas"
    exit 1
fi

# 5. Verification Mock RH
log_step "5/6 - Verification Mock RH"

if wait_for_service "Mock RH" "http://localhost:3001/api/health" '"status":"ok"'; then
    log_info "Mock RH est operationnel"
else
    log_error "Mock RH ne repond pas"
    exit 1
fi

# 6. Verification GraphQL
log_step "6/6 - Verification GraphQL"

GRAPHQL_RESPONSE=$(curl -sf -X POST http://localhost:8080/graphql \
    -H "Content-Type: application/json" \
    -d '{"query":"{ __typename }"}' 2>/dev/null || echo "FAIL")

if echo "$GRAPHQL_RESPONSE" | grep -q '"__typename":"Query"'; then
    log_info "GraphQL repond correctement"
else
    log_error "GraphQL ne repond pas ou erreur: $GRAPHQL_RESPONSE"
    exit 1
fi

# Resume
echo ""
echo "============================================"
echo -e "         ${GREEN}TOUS LES TESTS PASSES${NC}"
echo "============================================"
echo ""
echo "Services operationnels:"
echo "  - Backend API:  http://localhost:8080"
echo "  - GraphQL:      http://localhost:8080/graphql"
echo "  - GraphiQL:     http://localhost:8080/graphiql"
echo "  - Frontend:     http://localhost:5173"
echo "  - Mock RH:      http://localhost:3001"
echo ""

exit 0
