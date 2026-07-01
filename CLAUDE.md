# CLAUDE.md - SAND

@../../PRINCIPES.md

Ce fichier est le point d'entrée pour Claude Code. Il contient tout le contexte nécessaire pour travailler sur ce projet.

## Projet

**SAND** (Saisie d'Activité Numérique Déclarative) - Application web de saisie d'activités professionnelles. Inspiré de SAEL (ancienne appli interne), refait entièrement from scratch avec une stack moderne.

## Stack technique

| Couche | Technologies |
|--------|--------------|
| Backend | Laravel 13, PHP 8.4 (min 8.3), Lighthouse 6 (GraphQL), Sanctum |
| Frontend | React 19, TypeScript, Apollo Client 4, Tailwind CSS, Zustand |
| Base de données | PostgreSQL 16 (extension ltree) |
| Cache/Queue | Redis |
| Conteneurisation | Docker, Docker Compose |
| Tests | PHPUnit 272 tests + Vitest 238 tests + Playwright 100 specs |

## État du projet

**Toutes les phases du backlog sont terminées** (Phases 1 à 5).
**Migration feature-sliced terminée** (mars 2026) — voir section Architecture.

### Évolutions implémentées

- EV-01 à EV-12 : toutes terminées (voir `docs/06_EVOLUTIONS.md`)
- Refactoring v2 : architecture feature-sliced, design system --sand-*, services backend

### Production

- **URL** : https://sand.interstice.work
- **Domaine** : interstice.work (Cloudflare)

Détail complet de l'infra (provider, reverse proxy, firewall, chemins, backups) : `../infra/DEPLOY_PROD_SAND.md` (repo privé).

## Commandes essentielles

### Dev natif (sans Docker — stack locale depuis mars 2026)

Postgres et Redis tournent en Homebrew natif. Démarrage rapide :

```bash
brew services start redis
cd backend && php artisan serve --host=0.0.0.0 --port=8080 > /tmp/sand-backend.log 2>&1 &
cd frontend && bun run dev > /tmp/sand-frontend.log 2>&1 &
```

Points spécifiques du `.env` local :
- `REDIS_CLIENT=predis` / `REDIS_HOST=127.0.0.1` / `DB_HOST=127.0.0.1`
- `CACHE_STORE=redis` (Cache::tags() incompatible avec le driver file)

### Via Docker

```bash
docker compose up -d
docker compose exec app php artisan test
docker compose exec frontend npm run test
cd frontend && npm run e2e

# Après modification du schéma GraphQL
docker compose exec app php artisan lighthouse:clear-cache

# Données de démo (30 activités, 3 projets, 491 saisies, 3 absences)
docker compose exec app php artisan db:seed --class=DemoSeeder
```

## Tests

| Couche | Outil | Commande |
|--------|-------|----------|
| Backend (PHP) | PHPUnit | `docker compose exec app php artisan test` |
| Frontend (composants) | Vitest | `docker compose exec frontend npm run test` |
| E2E (navigateur) | Playwright | `cd frontend && npm run e2e` |

Résultats validés (2026-07-01, après migration Laravel 13) : PHPUnit 272/272, Vitest 238/238, Playwright 98/100.

### Playwright E2E

Pièges spécifiques :
- `__dirname` invalide en ESM → `fileURLToPath(import.meta.url)`
- `getByRole('dialog')` retourne hidden avec Headless UI → tester le texte visible
- `locator('h1')` ambigu → `getByRole('heading', { name: '...' })`
- Cellules saisie : `aria-label="Saisir pour lundi"` — minuscule (date-fns locale fr)
- Mock heroicons dans `src/test/setup.ts` : liste explicite — ajouter toute nouvelle icône

## Accès

### Développement (local)
- **Frontend** : http://localhost:5173
- **API Backend** : http://localhost:8080
- **GraphQL Playground** : http://localhost:8080/graphiql

### Production
- **Application** : https://sand.interstice.work

### Comptes de test (mot de passe : `password`)
- Admin : admin@sand.local
- Modérateur : marie.dupont@sand.local
- Utilisateur : jean.martin@sand.local

## Architecture

```
backend/
+-- app/
|   +-- Models/              # Eloquent (User, Project, Activity, TimeEntry, Absence...)
|   +-- GraphQL/             # Resolvers Lighthouse (Queries/, Mutations/)
|   +-- Policies/            # Autorisations Laravel
|   +-- Jobs/                # Export CSV asynchrone
|   +-- Services/            # Logique métier (TimeEntryService, ExportService...)
+-- database/
    +-- migrations/
    +-- seeders/

frontend/src/
+-- features/                # Organisation par domaine métier
|   +-- app/                 # Router + navigation
|   +-- auth/                # Pages auth + hooks session
|   +-- saisie/              # Page + hooks + lib
|   +-- dashboard/           # Page + composants graphiques
|   +-- supervision/         # Page supervision anomalies
|   +-- stats/               # Pages statistiques
|   +-- export/              # Page export CSV
|   +-- projets/             # Page + composants
|   +-- notifications/       # Hooks notification
|   +-- admin/               # activities, users, teams, configuration, rgpd
+-- pages/                   # Façades 1-ligne → features/
+-- components/              # Composants partagés
+-- hooks/                   # Hooks partagés
+-- stores/                  # Zustand (auth, saisie, notification)
+-- graphql/                 # Queries et mutations Apollo
```

## Concepts métier clés

- **Activités** : Arborescence ltree PostgreSQL. Seules les feuilles (`est_feuille = true`) sont saisissables.
- **Projets** : Activent/désactivent des activités via système tri-state.
- **Saisies** : Par jour, en ETP (0.01 à 1.00). Warning si total jour != 1.0.
- **Rôles** : Utilisateur / Modérateur / Admin.
- **Absences** : API RH externe (mock en dev), table `absences` dédiée.

## Décisions techniques

Les décisions architecturales sont documentées dans `.decisions/` (15 ADR, format TeamBrain).
Résumés des décisions clés :

- **Auth** : Sanctum SPA (cookies HttpOnly + CSRF) — ADR #002
- **ltree** : Opérateurs `<@` (descendants), `@>` (ancêtres), index GiST — ADR #001
- **Architecture frontend** : Feature-Sliced Design (features/, entities/, pages/ façades) — ADR #008, #009
- **Monitoring** : Sentry (sentry/sentry-laravel + @sentry/react) — ADR #010. DSN dans `backend/.env` (SENTRY_LARAVEL_DSN) et `frontend/.env.production.local` (VITE_SENTRY_DSN, non commité). Désactivé en dev frontend (`enabled: import.meta.env.PROD`).
- **Soft delete** : users, projects, activities, time_entries, absences
- **Export CSV** : Job queue Redis asynchrone
- **Design system** : variables CSS `--sand-*`, police Fraunces (Google Fonts), `.sand-card`
- **Tests** : PostgreSQL obligatoire (ltree incompatible SQLite), base `sand_v2_test`
- **Easter egg** : Konami Code (haut haut bas bas gauche droite gauche droite B A) → renard animé sur un `.sand-card` aléatoire. Hook `useKonamiCode`, composant `FoxEasterEgg`.

## Infrastructure production

```
docker-compose.prod.yml           # Overlay prod
docker/nginx/Dockerfile.prod      # Multi-stage : node build → nginx serve
frontend/.env.production.local    # VITE_API_URL=/graphql + VITE_SENTRY_DSN + VITE_WAKE_TOKEN (non commité)
watcher/wake-server.ts            # Serveur Bun de réveil (port 8082, hors Docker)
watcher/sand-watcher.service      # Template service systemd (installé sur le VPS)
```

**sand-watcher (avril 2026) :** service systemd Bun tourne en permanence sur le VPS (hors Docker, port 8082).
Quand les containers sont arrêtés, le frontend détecte l'indisponibilité (~30s de polling), appelle automatiquement
`GET /api/wake` (header `X-Wake-Token`), Caddy route vers sand-watcher qui relance `docker compose up -d`.
Route Caddy : `handle /api/wake { rewrite * /wake; reverse_proxy 127.0.0.1:8082 }`.

Commandes de déploiement : voir `../infra/DEPLOY_PROD_SAND.md` (repo privé).

## Pièges connus

- **Cache Lighthouse** : vider après modification du schéma GraphQL
- **Apollo Client 4** : imports depuis `@apollo/client/react`
- **Mock heroicons** : liste explicite dans `src/test/setup.ts` — ajouter toute nouvelle icône
- **Prod — SANCTUM_STATEFUL_DOMAINS** : domaine réel, jamais l'IP
- **Prod — SESSION_SECURE_COOKIE** : `true` obligatoire sur HTTPS
- **Prod — codegen** : types générés dans `src/gql/` commités, build utilise `build:docker`
- **JSON scalar double encodage** : fix dans `app/GraphQL/Scalars/JsonScalar.php`
- **Setting.valeur cast 'array'** : utiliser `Setting::get()` ou l'accesseur Eloquent
- **Sentry prod — nouveau package composer** : après ajout d'un package dans composer.json, le VPS a besoin d'un `composer install --no-dev --optimize-autoloader` manuel la première fois (le CI/CD le fait via `docker compose up --build` mais le vendor/ est dans le container, pas sur l'hôte)
- **Animation WebP/GIF — redémarrage** : `key` React ne suffit pas, le navigateur restaure l'état depuis le cache mémoire. Solution : `src={url + '?t=' + Date.now()}` pour forcer une URL unique à chaque affichage.
- **Prod — container stale Docker Compose** : si `docker compose up --build` échoue avec "container name already in use", la cause racine est souvent un nom de projet Compose instable (dérivé du répertoire courant). Si le path change, les containers ont un préfixe différent et `--remove-orphans` ne les voit pas. Fix définitif : `--project-name sand` sur toutes les commandes `docker compose` du CI/CD (appliqué en mai 2026, PR #9). Contournement ponctuel : `docker rm -f <id>`.
- **CI — déploiements parallèles → conflit Docker** : sans directive `concurrency:` dans `ci-cd.yml`, deux pushes rapprochés sur main (< ~30s) lancent deux jobs "Déploiement production" en parallèle. Le second `docker compose up` échoue : "Container name `..._sand-app` is already in use". Incident 2026-05-31 (runs 26706213318 + 26706225195, 39s d'écart). Fix définitif : bloc `concurrency: { group: sand-deploy-prod, cancel-in-progress: false }` au niveau workflow (PR #11, juin 2026). `cancel-in-progress: false` = file d'attente, chaque commit est déployé en série. Sand est le seul repo OnyxynO concerné (les autres déploient via Vercel/Pages qui gèrent la concurrence côté plateforme).
- **sand-watcher — VITE_WAKE_TOKEN** : doit être dans `frontend/.env.production.local` sur le VPS AVANT le build Docker (Vite intègre les vars au build time). Si oublié, rebuilder après avoir ajouté le token.
- **Prod — VITE_API_URL manquant → ServiceWaitingPage bloquée** : `frontend/.env.production` est dans `.gitignore` et absent du VPS. Sans `VITE_API_URL=/graphql` dans `frontend/.env.production.local`, Vite utilise le fallback `http://localhost:8080/graphql` (valeur du `.env` dev). La CSP nginx (`default-src 'self'`) bloque alors toutes les requêtes vers `localhost:8080` → health check toujours en échec → ServiceWaitingPage jamais résolue. **Variables obligatoires dans `frontend/.env.production.local` sur le VPS :** `VITE_API_URL=/graphql`, `VITE_WAKE_TOKEN`, `VITE_SENTRY_DSN`.
- **Caddy — rewrite obligatoire pour sand-watcher** : Caddy transmet le chemin complet (`/api/wake`) au backend. Le wake-server écoute sur `/wake`. Sans `rewrite * /wake` dans le bloc Caddy, le endpoint retourne 404.
- **Health check — StartSession bloque avant le handler** : toute route dans `web.php` hérite du middleware `web` (inclut `StartSession`). Si Redis est lent au démarrage, `StartSession` échoue avant d'atteindre le handler → 500 HTML au lieu de JSON. `curl` réussit (pas de session) mais le navigateur échoue silencieusement. Fix : `Route::withoutMiddleware([...])->get('/api/health', ...)` pour exclure le middleware session.
- **Sentry frontend — bruit réseau `Failed to fetch`** : le polling health-check (`ServiceWaitingPage` / réveil sand-watcher) génère des `TypeError: Failed to fetch` quand la requête est coupée (onglet fermé, crawler `HeadlessChrome` depuis un datacenter AWS). Remonté comme `onunhandledrejection`, 0 utilisateur impacté = bruit. Fix : `ignoreErrors: ['Failed to fetch', 'NetworkError when attempting to fetch resource', 'AbortError']` dans `Sentry.init` (`frontend/src/main.tsx`) — couvre Chrome / Firefox / requête annulée. ⚠️ `ignoreErrors` est intégré **au build Vite** → effectif uniquement après rebuild + redéploiement prod. Incident SAND-4 (juin 2026, PR #14).
- **Laravel 13 — préfixes cache/session** : L13 change le format des défauts de préfixe (`_session` → `-session`, etc.). SAND **n'est pas impacté** car sa config (`config/session.php`, `config/cache.php`, `config/database.php`) publie déjà les valeurs explicites en tiret — le breaking change ne touche que les apps qui s'appuient sur le fallback framework. Aucune déconnexion au déploiement. PHP min requis par L13 : 8.3 (prod en 8.4, CI en 8.4). PHPUnit passé en `^12.0` (recommandation du guide, pas 13).
- **Codegen — via SDL local (plus d'introspection HTTP)** : `codegen.ts` pointe sur le fichier SDL `frontend/schema.graphql` (commité), généré par `bun run schema` (`php artisan lighthouse:print-schema`). Raison : l'introspection HTTP `http://localhost:8080/graphql` était bloquée par `max_query_depth = 7` de Lighthouse (une requête d'introspection fait ~13 de profondeur → `Max query depth should be 7 but got 13`). Avec le SDL, `bun run codegen` fonctionne **sans backend qui tourne**. **Workflow après modif du schéma backend** : `bun run schema` puis `bun run codegen`, committer `schema.graphql` + `src/gql/`. Le build prod (`build:docker`) utilise les types commités sans régénérer. ⚠️ le SDL expose `users(first: Int! = 20)` (via `@paginate`) : l'opération `Users` déclare `$first: Int = 20` explicitement, sinon la validation codegen échoue.
- **GraphQL 17 + Codegen 7 — différé (juillet 2026)** : tentative de montée `graphql` 16→17 + `@graphql-codegen/*` 6→7 abandonnée. `@graphql-codegen/client-preset@6` n'est pas compatible graphql-js 17 (changement de l'AST des fragment spreads) → `spread.directives is not iterable` à la génération. Aucun bénéfice runtime (outillage dev pur). À re-tenter quand client-preset supportera graphql 17. Le reste du "paquet majeur" (Laravel 13, ESLint 10, TypeScript 6) est livré.
- **Sentry — org instance EU** : l'org `interstice` est sur l'instance **européenne** (`https://de.sentry.io`, web `https://interstice.sentry.io`). Toute requête API / MCP Sentry doit cibler `regionUrl=https://de.sentry.io`, pas l'US par défaut. Org `o4511071617024000`, projet `sand`. Accès lecture/triage via le MCP Sentry (`/sentry` ou `mcp__plugin_sentry_sentry__*`). Les DSN dans les `.env` ne servent qu'à l'ingestion, pas à la lecture des issues.

## Outils qualité et sécurité

### LaReview — review PR structurée (local-first)

CLI qui transforme un diff GitHub en review structurée avec diagrammes d'impact. Pas de serveur intermédiaire : utilise `gh` CLI en local.

```bash
# Installer (une fois)
npm install -g lareview   # ou via brew / pip selon la doc

# Utilisation avant de pousser une PR
lareview --pr <numero-pr>
# ou sur un diff local
lareview --diff
```

Flux recommandé pour SAND :
1. Faire la PR locale (commits OK, tests OK)
2. `lareview --diff` pour voir l'analyse avant de pousser
3. Corriger les points critiques signalés
4. Pousser → CI prend le relais

### Strix — audit sécurité dynamique (CI manuel)

Agents IA autonomes de pentesting (style "hacker") : testent les endpoints, valident les exploits en proof-of-concept. Tournent dans Docker contre une URL cible.

Workflow GitHub Actions : `.github/workflows/security.yml` (déclenchement manuel uniquement).

**Secrets à configurer sur GitHub** (`Settings > Secrets and variables > Actions`) :
- `STRIX_LLM` : ex. `openai/gpt-4o` ou `anthropic/claude-sonnet-4-6`
- `LLM_API_KEY` : clé API correspondante

**Lancement local** :
```bash
export STRIX_LLM="anthropic/claude-sonnet-4-6"
export LLM_API_KEY="..."
strix --target https://sand.interstice.work --mode standard
```

Points d'attention SAND à couvrir : auth Sanctum (CSRF/session), endpoints GraphQL, export CSV, RGPD.

## Mémoire décisionnelle (TeamBrain)

`.decisions/` contient 15 ADR au format TeamBrain (git-natif, markdown + frontmatter).

```bash
# Lister les ADR
teambrain list

# Rechercher dans les ADR
teambrain search "redis"

# Ajouter un nouvel ADR
teambrain add "description de la décision"

# Scanner les nouveaux commits pour détecter des décisions
teambrain scan-commits --depuis 1m --confiance 0.7
```

Les patterns de détection sont configurés dans `.decisions/.teambrain.json` pour le style Conventional Commits de ce repo (`migrer`, `remplacer .+ par`, `intégrer`, `architecture`, etc.).

Le serveur MCP est disponible via `teambrain serve` pour exposer les ADR aux AI agents (Claude Code, Cursor).

## Audit technique

**P1/P2/P3/P4 : 100% terminés** (voir `docs/07_AUDIT_TECHNIQUE.md`).

Agent auditeur : `.claude/agents/auditeur-sand.md` — à interroger en début et fin de chaque implémentation.
