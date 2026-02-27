#!/usr/bin/env bash
# =============================================================================
# SAND — Script d'installation
#
# Usage :
#   bash scripts/install.sh          # installation standard
#   bash scripts/install.sh --demo   # avec données de démo réalistes
#
# Ce script doit être lancé depuis la racine du projet.
# =============================================================================

set -euo pipefail

# --- Couleurs -----------------------------------------------------------------
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
BOLD='\033[1m'
RESET='\033[0m'

ok()   { echo -e "${GREEN}✓${RESET} $*"; }
info() { echo -e "${CYAN}→${RESET} $*"; }
warn() { echo -e "${YELLOW}⚠${RESET}  $*"; }
fail() { echo -e "${RED}✗${RESET} $*"; exit 1; }
titre() { echo -e "\n${BOLD}$*${RESET}"; }

# --- Arguments ----------------------------------------------------------------
AVEC_DEMO=false
for arg in "$@"; do
    [[ "$arg" == "--demo" ]] && AVEC_DEMO=true
done

# --- Vérification : répertoire de travail ------------------------------------
if [[ ! -f "docker-compose.yml" ]]; then
    fail "Lancer ce script depuis la racine du projet (là où se trouve docker-compose.yml)"
fi

# =============================================================================
titre "=== Installation SAND ==="
# =============================================================================

# --- Prérequis ----------------------------------------------------------------
titre "1. Vérification des prérequis"

if ! command -v docker &>/dev/null; then
    if command -v brew &>/dev/null; then
        warn "Docker non trouvé. Pour installer via Homebrew :"
        warn "  brew install --cask docker"
        warn "Lance Docker Desktop, puis relance ce script."
    fi
    fail "Docker n'est pas installé. Voir https://docs.docker.com/get-docker/"
fi
ok "Docker trouvé : $(docker --version | cut -d' ' -f3 | tr -d ',')"

if ! docker info &>/dev/null; then
    fail "Docker Desktop n'est pas démarré. Lance-le et réessaie."
fi
ok "Docker Engine actif"

if ! docker compose version &>/dev/null && ! command -v docker-compose &>/dev/null; then
    fail "docker compose (ou docker-compose) introuvable."
fi
ok "docker compose disponible"

# Choisir la commande docker compose disponible
if docker compose version &>/dev/null 2>&1; then
    DC="docker compose"
else
    DC="docker-compose"
fi

# --- Fichier .env -------------------------------------------------------------
titre "2. Configuration"

if [[ ! -f "backend/.env" ]]; then
    info "Copie de backend/.env.example → backend/.env"
    cp backend/.env.example backend/.env
    ok ".env créé"
else
    ok ".env déjà présent — non écrasé"
fi

# --- Démarrage des conteneurs -------------------------------------------------
titre "3. Démarrage des conteneurs Docker"

info "Lancement de docker compose..."
$DC up -d --build

# --- Dépendances PHP ----------------------------------------------------------
titre "4. Installation des dépendances PHP"

info "Exécution de composer install..."
$DC exec -T app composer install --no-interaction --prefer-dist --optimize-autoloader
ok "Dépendances PHP installées"

# --- Attente PostgreSQL -------------------------------------------------------
titre "5. Attente de la base de données"

info "Attente de PostgreSQL..."
MAX=30
COUNT=0
until $DC exec -T db pg_isready -U sand -d sand &>/dev/null; do
    COUNT=$((COUNT + 1))
    if [[ $COUNT -ge $MAX ]]; then
        fail "PostgreSQL ne répond pas après ${MAX} tentatives. Voir : $DC logs db"
    fi
    printf "."
    sleep 2
done
echo ""
ok "PostgreSQL prêt"

# --- APP_KEY ------------------------------------------------------------------
titre "6. Clé d'application"

CURRENT_KEY=$(grep '^APP_KEY=' backend/.env | cut -d'=' -f2 | tr -d ' ' | cut -d'#' -f1)
if [[ -z "$CURRENT_KEY" ]]; then
    info "Génération de APP_KEY..."
    $DC exec -T app php artisan key:generate --ansi
    ok "APP_KEY générée"
else
    ok "APP_KEY déjà présente — ignorée"
fi

# --- Base de données de test --------------------------------------------------
titre "7. Base de données de test"

info "Création de la base sand_test (pour PHPUnit)..."
$DC exec -T db psql -U sand -c "CREATE DATABASE sand_test;" &>/dev/null && ok "sand_test créée" || ok "sand_test déjà existante"

# --- Migrations ---------------------------------------------------------------
titre "8. Migrations"

info "Exécution des migrations..."
$DC exec -T app php artisan migrate --force --ansi
ok "Migrations appliquées"

# --- Seeders ------------------------------------------------------------------
titre "9. Données de base"

info "Chargement des données de base (équipes, comptes, activités, projets)..."
$DC exec -T app php artisan db:seed --class=DatabaseSeeder --force --ansi
ok "Données de base insérées"

if [[ "$AVEC_DEMO" == "true" ]]; then
    info "Chargement des données de démo (30 activités, 491 saisies, 3 absences)..."
    $DC exec -T app php artisan db:seed --class=DemoSeeder --force --ansi
    ok "Données de démo insérées"
fi

# --- Cache Lighthouse ---------------------------------------------------------
titre "10. Cache"

$DC exec -T app php artisan lighthouse:clear-cache &>/dev/null || true
$DC exec -T app php artisan config:clear &>/dev/null
ok "Cache vidé"

# --- Résumé ------------------------------------------------------------------
echo ""
echo -e "${BOLD}============================================${RESET}"
echo -e "${GREEN}${BOLD}  Installation terminée avec succès !${RESET}"
echo -e "${BOLD}============================================${RESET}"
echo ""
echo -e "  ${CYAN}Frontend${RESET}   http://localhost:5173"
echo -e "  ${CYAN}Backend${RESET}    http://localhost:8080"
echo -e "  ${CYAN}GraphiQL${RESET}   http://localhost:8080/graphiql"
echo -e "  ${CYAN}Mock RH${RESET}    http://localhost:3001"
echo ""
echo -e "  ${BOLD}Comptes de test${RESET} (mot de passe : ${YELLOW}password${RESET})"
echo -e "  ├── admin@sand.local        ${YELLOW}Admin${RESET}"
echo -e "  ├── marie.dupont@sand.local ${YELLOW}Modérateur${RESET}"
echo -e "  └── jean.martin@sand.local  ${YELLOW}Utilisateur${RESET}"
echo ""
if [[ "$AVEC_DEMO" == "false" ]]; then
    echo -e "  ${YELLOW}Astuce${RESET} : relancer avec --demo pour charger des saisies réalistes"
    echo -e "  ${CYAN}bash scripts/install.sh --demo${RESET}"
    echo ""
fi
