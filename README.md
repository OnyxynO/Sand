# SAND — Saisie d'Activité Numérique Déclarative

Application web de saisie d'activités professionnelles. Les collaborateurs déclarent leur temps de travail par projet et activité (en ETP). Les modérateurs supervisent leur équipe, les admins configurent le système.

Successeur de SAEL.

---

## Stack technique

| Couche | Technologies |
|--------|-------------|
| Backend | Laravel 12 · PHP 8.4 · Lighthouse 6 (GraphQL) · Sanctum |
| Frontend | React 19 · TypeScript · Apollo Client 4 · Tailwind CSS · Zustand |
| Base de données | PostgreSQL 16 (extension ltree) |
| Cache / Queue | Redis 7 |
| Conteneurs | Docker · Docker Compose |
| Tests | PHPUnit (262 tests) · Vitest (235 tests) · Playwright (E2E) |

---

## Prérequis

- **Docker Desktop** — [docs.docker.com/get-docker](https://docs.docker.com/get-docker/)
- **Git**
- **Node.js** — uniquement pour les tests E2E Playwright (pas nécessaire pour faire tourner l'appli)

PHP, Composer et npm tournent dans Docker — rien à installer sur l'hôte sauf Docker.

---

## Installation

```bash
git clone <url-du-repo>
cd sand

bash scripts/install.sh
```

Le script gère tout : démarrage Docker, configuration, migrations, données de base.

Pour charger des données de démonstration réalistes (491 saisies, 3 projets, 30 activités, 3 absences) :

```bash
bash scripts/install.sh --demo
```

### Installation manuelle (si le script ne convient pas)

```bash
# 1. Copier la configuration
cp backend/.env.example backend/.env
# Éditer backend/.env si nécessaire (mail, clés API...)

# 2. Démarrer les conteneurs
docker compose up -d --build

# 3. Générer la clé d'application
docker compose exec app php artisan key:generate

# 4. Migrations et données de base
docker compose exec app php artisan migrate
docker compose exec app php artisan db:seed

# (optionnel) Données de démo
docker compose exec app php artisan db:seed --class=DemoSeeder
```

---

## Accès

| Service | URL |
|---------|-----|
| Application | http://localhost:5173 |
| API GraphQL | http://localhost:8080/graphql |
| GraphiQL (playground) | http://localhost:8080/graphiql |
| Mock API RH | http://localhost:3001 |

### Comptes de test (mot de passe : `password`)

| Rôle | Email |
|------|-------|
| Admin | admin@sand.local |
| Modérateur | marie.dupont@sand.local |
| Utilisateur | jean.martin@sand.local |

---

## Configuration mail

Par défaut (`MAIL_MAILER=log`), les emails sont écrits dans les logs et non envoyés.

Pour recevoir de vrais emails en développement, configurer [Mailtrap](https://mailtrap.io) dans `backend/.env` :

```env
MAIL_MAILER=smtp
MAIL_HOST=sandbox.smtp.mailtrap.io
MAIL_PORT=2525
MAIL_USERNAME=<votre-username-mailtrap>
MAIL_PASSWORD=<votre-password-mailtrap>
```

Voir `backend/.env.example` pour la documentation complète des options.

---

## Commandes de développement

### Conteneurs

```bash
docker compose up -d          # Démarrer en arrière-plan
docker compose down           # Arrêter
docker compose logs -f        # Logs en temps réel
docker compose logs -f app    # Logs d'un seul service (app, nginx, db, redis, frontend)
docker compose exec app bash  # Shell dans le conteneur PHP
```

### Backend Laravel

```bash
# Migrations
docker compose exec app php artisan migrate
docker compose exec app php artisan migrate:fresh --seed   # Réinitialiser + seeder

# Cache (obligatoire après modification du schéma GraphQL)
docker compose exec app php artisan lighthouse:clear-cache
docker compose exec app php artisan config:clear

# Linting PHP
docker compose exec app ./vendor/bin/pint

# Analyse statique (niveau 5)
docker compose exec app ./vendor/bin/phpstan analyse

# Tinker (REPL Laravel)
docker compose exec app php artisan tinker
```

### Frontend

```bash
# Linting TypeScript/React
docker compose exec frontend npm run lint

# Build de production
docker compose exec frontend npm run build
```

---

## Tests

### Backend (PHPUnit)

```bash
# Tous les tests
docker compose exec app php artisan test

# Un fichier spécifique
docker compose exec app php artisan test tests/Feature/AuthGraphQLTest.php

# Un test par nom
docker compose exec app php artisan test --filter test_login_avec_identifiants_valides
```

> La base de test `sand_test` est requise (PostgreSQL — ltree incompatible avec SQLite).
> Elle est créée automatiquement par le script `scripts/install.sh`.

### Frontend (Vitest)

```bash
# Mode watch (développement)
docker compose exec frontend npm run test

# Une seule passe (CI)
docker compose exec frontend npm run test:run

# Un fichier spécifique
docker compose exec frontend npm run test -- src/hooks/__tests__/useSaisieHebdo.test.ts
```

### E2E (Playwright) — sur l'hôte, pas dans Docker

```bash
cd frontend

# Première fois seulement
npm install
npx playwright install chromium

# Lancer les tests
npm run e2e           # Headless
npm run e2e:headed    # Navigateur visible (debug)
npm run e2e:ui        # Interface graphique Playwright

# Un test spécifique
npx playwright test e2e/saisie.spec.ts
npx playwright test --grep "anti-regression"
```

> L'application doit être démarrée (`docker compose up -d`) avant de lancer Playwright.

---

## Troubleshooting

### Les conteneurs ne démarrent pas

```bash
docker compose logs db     # Vérifier PostgreSQL
docker compose logs app    # Vérifier Laravel
docker compose ps          # État de chaque service (doit être "healthy")
```

### Page blanche après connexion

Vider le cache Lighthouse (obligatoire après toute modification du schéma GraphQL) :

```bash
docker compose exec app php artisan lighthouse:clear-cache
```

### Erreur CSRF / 419 sur les mutations

Le cookie CSRF doit être récupéré avant la première mutation :

```bash
curl http://localhost:8080/sanctum/csrf-cookie
```

### Les tests PHPUnit échouent avec "database not found"

La base `sand_test` doit exister dans PostgreSQL :

```bash
docker compose exec db psql -U sand -c "CREATE DATABASE sand_test;"
```

### Réinitialiser complètement la base de données

```bash
docker compose exec app php artisan migrate:fresh --seed

# Ou avec les données de démo :
docker compose exec app php artisan migrate:fresh
docker compose exec app php artisan db:seed --class=DemoSeeder
```

### Accéder à PostgreSQL ou Redis depuis l'hôte (TablePlus, Redis Insight...)

Le fichier `docker-compose.override.yml` expose les ports 5432 et 6379 en développement — actif automatiquement avec `docker compose up`.

### Les emails ne sont pas reçus

En développement, `MAIL_MAILER=log` est la valeur par défaut — les emails sont écrits dans `storage/logs/laravel.log`, pas envoyés. Configurer Mailtrap pour recevoir de vrais emails (voir section *Configuration mail* ci-dessus).

---

## Documentation

| Fichier | Contenu |
|---------|---------|
| `docs/01_SPEC_FONCTIONNELLE.md` | Règles métier, rôles, fonctionnalités |
| `docs/02_SPEC_TECHNIQUE.md` | Stack, décisions techniques, schéma BDD |
| `docs/03_ARCHITECTURE.md` | Diagrammes Mermaid (ERD, flux, C4) |
| `docs/04_API_GRAPHQL.md` | Documentation complète de l'API GraphQL |
| `docs/05_BACKLOG.md` | User stories par phase |
| `docs/06_EVOLUTIONS.md` | Évolutions implémentées |
| `docs/07_AUDIT_TECHNIQUE.md` | Rapport d'audit qualité et suivi des corrections |
