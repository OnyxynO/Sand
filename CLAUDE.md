# CLAUDE.md - SAND v2

@../GUIDELINES_PROJETS.md

Ce fichier est le point d'entree pour Claude Code sur la copie de travail sand-v2.

## Projet

**SAND v2** — copie de travail isolee de SAND, dediee a un refactoring structurel.
Meme produit, meme stack, memes regles metier que sand, mais organisation interne revisee.
Aucun push vers le depot de production n'est possible (remote push desactive).

Voir `docs/08_SAND_V2.md` et `docs/09_SAND_V2_VS_V1.md` pour le contexte complet.

## Stack technique

Identique a sand :

| Couche | Technologies |
|--------|--------------|
| Backend | Laravel 12, PHP 8.4, Lighthouse 6 (GraphQL), Sanctum |
| Frontend | React 19, TypeScript, Apollo Client 4, Tailwind CSS, Zustand |
| Base de donnees | PostgreSQL 16 (extension ltree) |
| Cache/Queue | Redis |
| Tests | PHPUnit 262 tests + Vitest 238 tests + Playwright 100 specs |

## Etat du projet (mars 2026)

### Migration feature-sliced : terminee

Toutes les pages sont migrees dans `frontend/src/features/`. Les anciens `pages/` sont
des facades 1-ligne (`export { default } from '../features/...'`).

**Domaines implementes dans `features/` :**
- `features/app/` — router centralisé, navigation
- `features/auth/` — LoginPage, ForgotPasswordPage, ResetPasswordPage, hooks auth
- `features/saisie/` — SaisiePage, useSaisieHebdo, lib absences/mapping
- `features/dashboard/` — DashboardPage, composants graphiques
- `features/supervision/` — SupervisionPage
- `features/stats/` — StatsGlobalesPage, StatsProjetPage
- `features/export/` — ExportPage
- `features/projets/` — ProjetsPage, composants modale
- `features/notifications/` — hooks notification
- `features/admin/activities/` — ActivitesPage + LigneActiviteDnd, DragPreview, FormulaireActivite, types
- `features/admin/users/` — UtilisateursPage
- `features/admin/teams/` — EquipesPage
- `features/admin/configuration/` — ConfigurationPage
- `features/admin/rgpd/` — RgpdPage

**Backend — services extraits des mutators :**
- `TimeEntryService` — logique bulkUpdate
- `WeeklyTimeEntryQueryService` — query saisies semaine
- `ExportService` — logique export CSV
- `SettingService` — lecture/ecriture parametres

**Design system v2 :**
Variables CSS `--sand-*`, police Fraunces serif, `rounded-[1.8rem]`, `.sand-card`, `.sand-display`.
Voir `frontend/src/index.css` pour le detail complet.

### Tests (resultats validates 2026-03-13)

| Suite | Resultat |
|-------|----------|
| PHPUnit | 262/262 ✓ |
| Vitest | 238/238 ✓ |
| Playwright | 98/100 ✓ (2 faux positifs timing sur admin-projets) |

## Commandes essentielles

### Dev natif (stack Homebrew)

Backend sur **8081** (pas 8080 — Docker occupe 8080), frontend sur **5173**.

```bash
# Verifier que les services tournent
brew services list | grep -E "postgresql|redis"

# Lancer backend (si pas deja demarre)
cd backend && php artisan serve --host=0.0.0.0 --port=8081 > /tmp/sand-v2-backend.log 2>&1 &

# Lancer frontend (si pas deja demarre)
cd frontend && npm run dev > /tmp/sand-v2-frontend.log 2>&1 &
```

Points specifiques du `.env` local :
- `APP_URL=http://localhost:8081`
- `DB_DATABASE=sand_v2` / `DB_HOST=127.0.0.1`
- `SANCTUM_STATEFUL_DOMAINS=localhost:5173,127.0.0.1:5173`
- `REDIS_CLIENT=predis` / `REDIS_HOST=127.0.0.1` / `CACHE_STORE=redis`
- Frontend `.env.local` : `VITE_API_URL=http://localhost:8081/graphql`

### Bootstrap depuis zero

```bash
bash scripts/bootstrap-v2.sh        # cree les .env, installe dependances
bash scripts/reset-v2-test-db.sh    # recrée sand_v2_test proprement
```

### Tests

```bash
# PHPUnit (natif, base sand_v2_test)
cd backend && php artisan test

# Vitest
cd frontend && npm run test -- --run

# Playwright (app doit tourner)
cd frontend && npm run e2e

# Sous-ensembles Playwright
cd frontend && npm run e2e:auth-core
cd frontend && npm run e2e:saisie-user
```

## Acces

- **Frontend** : http://localhost:5173
- **API Backend** : http://localhost:8081
- **GraphQL Playground** : http://localhost:8081/graphiql

### Comptes de test (mot de passe : `password`)
- Admin : admin@sand.local
- Moderateur : marie.dupont@sand.local
- Utilisateur : jean.martin@sand.local

## Architecture frontend v2

```
frontend/src/
├── features/                  # Organisation par domaine metier (v2)
│   ├── app/                   # Router + navigation
│   ├── auth/                  # Pages auth + hooks session
│   ├── saisie/                # Page + hooks + lib (absences, mapping)
│   ├── dashboard/             # Page + composants graphiques
│   ├── supervision/           # Page supervision anomalies
│   ├── stats/                 # Pages stats globales et projet
│   ├── export/                # Page export CSV
│   ├── projets/               # Page + composants modales
│   ├── notifications/         # Hooks notification
│   └── admin/
│       ├── activities/        # Page + composants (LigneActiviteDnd, etc.) + types
│       ├── users/             # Page utilisateurs
│       ├── teams/             # Page equipes
│       ├── configuration/     # Page configuration
│       └── rgpd/              # Page RGPD
├── pages/                     # Facades 1-ligne → features/ (compatibilite)
├── components/                # Composants partages (saisie, admin, dashboard...)
├── hooks/                     # Hooks partagés
├── stores/                    # Zustand (auth, saisie, notification)
├── graphql/                   # Queries et mutations Apollo
└── test/                      # Setup Vitest + helpers (renderAvecApollo)
```

## Pieges connus (v2)

- **Port backend** : 8081 (pas 8080 — Docker occupe 8080 en permanence sur ce poste)
- **Bases PostgreSQL** : `sand_v2` (dev) et `sand_v2_test` (tests) — pas `sand` ni `sand_test`
- **Mock heroicons dans setup.ts** : liste explicite — ajouter toute nouvelle icone utilisee dans une page testee
  (`src/test/setup.ts`, section `vi.mock('@heroicons/react/24/outline', ...)`)
- **Test LoginPage** : cherche `SAND v2` (pas `SAND`) — texte du badge d'identite v2
- **Playwright admin-projets** : faux positif de timing en run complet, passe en relance isolee
- **Remote git** : push desactive vers upstream — pousser uniquement sur un remote perso si besoin

Pièges hérités de sand (toujours valables) :
- **Cache Lighthouse** : `php artisan lighthouse:clear-cache` apres modif schema GraphQL
- **Apollo Client 4** : imports depuis `@apollo/client/react`
- **Playwright Headless UI** : `getByRole('dialog')` → tester le texte visible
- **Playwright h1 ambigu** : utiliser `getByRole('heading', { name: '...' })`

## Git

Branche de travail : `codex/sand-v2`
Remote `upstream` : fetch only (protection anti-push prod)

```bash
# Voir l'historique v2
git log --oneline upstream/codex/architecture-review..HEAD
```
