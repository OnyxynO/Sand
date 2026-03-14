# CLAUDE.md - SAND

@../GUIDELINES_PROJETS.md

Ce fichier est le point d'entree pour Claude Code. Il contient tout le contexte necessaire pour travailler sur ce projet.

## Projet

**SAND** (Saisie d'Activite Numerique Declarative) - Application web de saisie d'activites professionnelles. Inspire de SAEL (ancienne appli interne), refait entierement from scratch avec une stack moderne.

## Stack technique

| Couche | Technologies |
|--------|--------------|
| Backend | Laravel 12, PHP 8.4, Lighthouse 6 (GraphQL), Sanctum |
| Frontend | React 19, TypeScript, Apollo Client 4, Tailwind CSS, Zustand |
| Base de donnees | PostgreSQL 16 (extension ltree) |
| Cache/Queue | Redis |
| Conteneurisation | Docker, Docker Compose |
| Tests | PHPUnit 262 tests + Vitest 238 tests + Playwright 100 specs |

## Etat du projet

**Toutes les phases du backlog sont terminees** (Phases 1 a 5).
**Migration feature-sliced terminee** (mars 2026) — voir section Architecture.

### Evolutions implementees

- EV-01 a EV-12 : toutes terminees (voir `docs/06_EVOLUTIONS.md`)
- Refactoring v2 : architecture feature-sliced, design system --sand-*, services backend

### Production

L'application est deployee en production sur un VPS Hetzner CX23.
- **URL** : https://sand.interstice.work
- **Domaine** : interstice.work (Cloudflare)
- **Reverse proxy** : Caddy 2.11.1 (HTTPS automatique Let's Encrypt)
- **Firewall** : ufw actif (ports 22, 80, 443)
- **Backups** : PostgreSQL quotidien a 2h (`/var/backups/sand/`, retention 7 jours)

Voir `../infra/DEPLOY_PROD_SAND.md` (hors repo) pour le detail complet.

## Commandes essentielles

### Dev natif (sans Docker — stack locale depuis mars 2026)

Postgres et Redis tournent en Homebrew natif. Demarrage rapide :

```bash
brew services start redis
cd backend && php artisan serve --host=0.0.0.0 --port=8080 > /tmp/sand-backend.log 2>&1 &
cd frontend && npm run dev > /tmp/sand-frontend.log 2>&1 &
```

Points specifiques du `.env` local :
- `REDIS_CLIENT=predis` / `REDIS_HOST=127.0.0.1` / `DB_HOST=127.0.0.1`
- `CACHE_STORE=redis` (Cache::tags() incompatible avec le driver file)

### Via Docker

```bash
docker compose up -d
docker compose exec app php artisan test
docker compose exec frontend npm run test
cd frontend && npm run e2e

# Apres modification du schema GraphQL
docker compose exec app php artisan lighthouse:clear-cache

# Donnees de demo (30 activites, 3 projets, 491 saisies, 3 absences)
docker compose exec app php artisan db:seed --class=DemoSeeder
```

## Tests

| Couche | Outil | Commande |
|--------|-------|----------|
| Backend (PHP) | PHPUnit | `docker compose exec app php artisan test` |
| Frontend (composants) | Vitest | `docker compose exec frontend npm run test` |
| E2E (navigateur) | Playwright | `cd frontend && npm run e2e` |

Resultats valides (2026-03-13) : PHPUnit 262/262, Vitest 238/238, Playwright 98/100.

### Playwright E2E

Pieges specifiques :
- `__dirname` invalide en ESM → `fileURLToPath(import.meta.url)`
- `getByRole('dialog')` retourne hidden avec Headless UI → tester le texte visible
- `locator('h1')` ambigu → `getByRole('heading', { name: '...' })`
- Cellules saisie : `aria-label="Saisir pour lundi"` — minuscule (date-fns locale fr)
- Mock heroicons dans `src/test/setup.ts` : liste explicite — ajouter toute nouvelle icone

## Acces

### Developpement (local)
- **Frontend** : http://localhost:5173
- **API Backend** : http://localhost:8080
- **GraphQL Playground** : http://localhost:8080/graphiql

### Production
- **Application** : https://sand.interstice.work

### Comptes de test (mot de passe : `password`)
- Admin : admin@sand.local
- Moderateur : marie.dupont@sand.local
- Utilisateur : jean.martin@sand.local

## Architecture

```
backend/
├── app/
│   ├── Models/              # Eloquent (User, Project, Activity, TimeEntry, Absence...)
│   ├── GraphQL/             # Resolvers Lighthouse (Queries/, Mutations/)
│   ├── Policies/            # Autorisations Laravel
│   ├── Jobs/                # Export CSV asynchrone
│   └── Services/            # Logique metier (TimeEntryService, ExportService...)
└── database/
    ├── migrations/
    └── seeders/

frontend/src/
├── features/                # Organisation par domaine metier
│   ├── app/                 # Router + navigation
│   ├── auth/                # Pages auth + hooks session
│   ├── saisie/              # Page + hooks + lib
│   ├── dashboard/           # Page + composants graphiques
│   ├── supervision/         # Page supervision anomalies
│   ├── stats/               # Pages statistiques
│   ├── export/              # Page export CSV
│   ├── projets/             # Page + composants
│   ├── notifications/       # Hooks notification
│   └── admin/               # activities, users, teams, configuration, rgpd
├── pages/                   # Facades 1-ligne → features/
├── components/              # Composants partages
├── hooks/                   # Hooks partages
├── stores/                  # Zustand (auth, saisie, notification)
└── graphql/                 # Queries et mutations Apollo
```

## Concepts metier cles

- **Activites** : Arborescence ltree PostgreSQL. Seules les feuilles (`est_feuille = true`) sont saisissables.
- **Projets** : Activent/desactivent des activites via systeme tri-state.
- **Saisies** : Par jour, en ETP (0.01 a 1.00). Warning si total jour != 1.0.
- **Roles** : Utilisateur / Moderateur / Admin.
- **Absences** : API RH externe (mock en dev), table `absences` dediee.

## Decisions techniques

- **Auth** : Sanctum SPA (cookies HttpOnly + CSRF)
- **ltree** : Operateurs `<@` (descendants), `@>` (ancetres), index GiST
- **Soft delete** : users, projects, activities, time_entries, absences
- **Export CSV** : Job queue Redis asynchrone
- **Design system** : variables CSS `--sand-*`, police Fraunces (Google Fonts), `.sand-card`
- **Tests** : PostgreSQL obligatoire (ltree incompatible SQLite), base `sand_v2_test`

## Infrastructure production

```
docker-compose.prod.yml           # Overlay prod
docker/nginx/Dockerfile.prod      # Multi-stage : node build → nginx serve
frontend/.env.production          # VITE_API_URL=/graphql
```

Commandes de mise a jour :
```bash
cd /var/www/sand
git pull
docker compose -f docker-compose.yml -f docker-compose.prod.yml up -d --build
```

## Pieges connus

- **Cache Lighthouse** : vider apres modification du schema GraphQL
- **Apollo Client 4** : imports depuis `@apollo/client/react`
- **Mock heroicons** : liste explicite dans `src/test/setup.ts` — ajouter toute nouvelle icone
- **Prod — SANCTUM_STATEFUL_DOMAINS** : domaine reel, jamais l'IP
- **Prod — SESSION_SECURE_COOKIE** : `true` obligatoire sur HTTPS
- **Prod — codegen** : types generes dans `src/gql/` commites, build utilise `build:docker`
- **JSON scalar double encodage** : fix dans `app/GraphQL/Scalars/JsonScalar.php`
- **Setting.valeur cast 'array'** : utiliser `Setting::get()` ou l'accesseur Eloquent

## Audit technique

**P1/P2/P3/P4 : 100% termines** (voir `docs/07_AUDIT_TECHNIQUE.md`).

Agent auditeur : `.claude/agents/auditeur-sand.md` — a interroger en debut et fin de chaque implementation.
