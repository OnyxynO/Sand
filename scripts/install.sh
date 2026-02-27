#!/usr/bin/env bash
# =============================================================================
# SAND — Script d'installation
#
# Usage :
#   bash scripts/install.sh          # installation standard
#   bash scripts/install.sh --demo   # avec données de démo réalistes
#   bash scripts/install.sh --help   # afficher cette aide
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
    if [[ "$arg" == "--demo" ]]; then
        AVEC_DEMO=true
    elif [[ "$arg" == "--help" || "$arg" == "-h" ]]; then
        echo "Usage : bash scripts/install.sh [--demo]"
        echo ""
        echo "  --demo   Charger des données de démonstration réalistes"
        echo "           (3 projets, 30 activités, 491 saisies, 3 absences)"
        echo ""
        echo "Ce script doit être lancé depuis la racine du projet."
        exit 0
    fi
done

# --- Vérification : répertoire de travail ------------------------------------
if [[ ! -f "docker-compose.yml" ]]; then
    fail "Lancer ce script depuis la racine du projet (là où se trouve docker-compose.yml)"
fi

# --- Variable DC (initialisée tôt pour le trap) -------------------------------
DC=""

# --- Nettoyage en cas d'échec -------------------------------------------------
cleanup_on_error() {
    echo ""
    warn "Échec de l'installation. Arrêt des conteneurs..."
    if [[ -n "$DC" ]]; then
        $DC down 2>/dev/null || true
        warn "Voir les logs : $DC logs"
    fi
    exit 1
}
trap cleanup_on_error ERR

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

# --- Vérification des ports ---------------------------------------------------
titre "3. Vérification des ports"

check_port() {
    local port=$1 service=$2
    if lsof -i :"$port" -sTCP:LISTEN -t &>/dev/null; then
        fail "Port $port déjà utilisé — $service ne pourra pas démarrer. Libérer le port et relancer."
    fi
    ok "Port $port libre ($service)"
}

check_port 5173 "Frontend"
check_port 8080 "Backend Nginx"
check_port 3001 "Mock API RH"

# --- Démarrage des conteneurs -------------------------------------------------
titre "4. Démarrage des conteneurs Docker"

info "Lancement de docker compose..."
$DC up -d --build

# --- Dépendances PHP ----------------------------------------------------------
# composer install est exécuté ici (pas dans le Dockerfile) car le code source
# est monté via un volume — les dépendances doivent être installées dans ce volume
# pour être accessibles en live reload.
titre "5. Installation des dépendances PHP"

info "Exécution de composer install..."
$DC exec -T app composer install --no-interaction --prefer-dist --optimize-autoloader
ok "Dépendances PHP installées"

# --- Attente PostgreSQL -------------------------------------------------------
titre "6. Attente de la base de données"

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
titre "7. Clé d'application"

CURRENT_KEY=$(grep '^APP_KEY=' backend/.env | cut -d'=' -f2 | tr -d ' ' | cut -d'#' -f1)
if [[ -z "$CURRENT_KEY" ]]; then
    info "Génération de APP_KEY..."
    $DC exec -T app php artisan key:generate --ansi
    ok "APP_KEY générée"
else
    ok "APP_KEY déjà présente — ignorée"
fi

# --- Base de données de test --------------------------------------------------
titre "8. Base de données de test"

info "Création de la base sand_test (pour PHPUnit)..."
$DC exec -T db psql -U sand -c "CREATE DATABASE sand_test;" &>/dev/null && ok "sand_test créée" || ok "sand_test déjà existante"

# --- Migrations ---------------------------------------------------------------
titre "9. Migrations"

info "Exécution des migrations..."
$DC exec -T app php artisan migrate --force --ansi
ok "Migrations appliquées"

# --- Seeders ------------------------------------------------------------------
titre "10. Données de base"

info "Chargement des données de base (équipes, comptes, activités, projets)..."
$DC exec -T app php artisan db:seed --class=DatabaseSeeder --force --ansi
ok "Données de base insérées"

if [[ "$AVEC_DEMO" == "true" ]]; then
    info "Chargement des données de démo (3 projets, 30 activités, 491 saisies, 3 absences)..."
    $DC exec -T app php artisan db:seed --class=DemoSeeder --force --ansi
    ok "Données de démo insérées"
fi

# --- Cache Lighthouse ---------------------------------------------------------
titre "11. Cache"

$DC exec -T app php artisan lighthouse:clear-cache &>/dev/null || true
$DC exec -T app php artisan config:clear &>/dev/null
ok "Cache vidé"

# --- Attente frontend ---------------------------------------------------------
titre "12. Attente du frontend"

info "Attente de Vite..."
MAX=30
COUNT=0
until curl -s -o /dev/null -w "%{http_code}" http://localhost:5173 2>/dev/null | grep -q "200\|304"; do
    COUNT=$((COUNT + 1))
    if [[ $COUNT -ge $MAX ]]; then
        warn "Frontend pas encore prêt — patienter quelques secondes puis ouvrir http://localhost:5173"
        break
    fi
    printf "."
    sleep 3
done
[[ $COUNT -lt $MAX ]] && echo "" && ok "Frontend prêt"

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
