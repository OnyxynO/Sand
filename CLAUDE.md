# CLAUDE.md - SAND

Ce fichier est le point d'entree pour Claude Code. Il contient tout le contexte necessaire pour travailler sur ce projet.

## Projet

**SAND** (Saisie d'Activite Numerique Declarative) - Application web de saisie d'activites professionnelles. Successeur de SAEL.

## Stack technique

| Couche | Technologies |
|--------|--------------|
| Backend | Laravel 12, PHP 8.4, Lighthouse 6 (GraphQL), Sanctum |
| Frontend | React 19, TypeScript, Apollo Client 4, Tailwind CSS, Zustand |
| Base de donnees | PostgreSQL 16 (extension ltree) |
| Cache/Queue | Redis |
| Conteneurisation | Docker, Docker Compose |
| Tests | PHPUnit + Vitest (chiffres exacts variables — voir CI) |

## Etat du projet

**Toutes les phases du backlog sont terminees** (Phases 1 a 5).

### Evolutions implementees
- EV-01 : Warning saisie non enregistree (useBlocker + beforeunload)
- EV-02 : Changement de parent d'une activite (modale de selection)
- EV-03 : Drag and drop activites (@dnd-kit/core)
- EV-04 : Vue texte simplifiee des activites (parser + diff + onglets)
- EV-05 : Reset parametres par defaut
- EV-07 : Absences dans grille de saisie
- EV-06 : Suppression donnees RGPD (droit a l'oubli + purge totale)
- EV-08 : Absences mode manuel vs API externe (settings admin + grille interactive)

Voir `docs/06_EVOLUTIONS.md` pour le detail.

### Reste a faire (hors fonctionnel)

**Evolutions en attente** :

- **EV-12 : Absences — refonte mécanique** ⏳ 85% terminé
  - ✅ **Dissociation projet** : table `absences` dédiée, séparée de `time_entries`, sans contrainte projet
  - ✅ **Tous les rôles** : `declarerAbsence` accessible à tout utilisateur authentifié (pas de policy check)
  - ✅ **Mode manuel vs API** : configurable via settings, UI admin implémentée
  - ✅ **Affichage dans la grille** : ligne indigo avec icone et durée
  - ✅ **Tests backend PHPUnit** : complets
  - ❌ **Notification à l'utilisateur concerné** : manquante dans `declarerAbsence()` (voir BACK-03)
  - ⚠️ **Placeholder token API** : URL ok, token exemple `Bearer eyJhbGci...` à compléter
  - ❌ **Tests E2E** : manquants pour déclaration manuelle, notification, test connexion API RH

- **EV-08 : Absences — mode manuel vs API externe configurable** ✓
  - Config admin : mode `manuel` (saisie directe grille) ou `api` (import RH)
  - Mode `api` : champs URL + token + bouton "Tester la connexion"
  - Mode `manuel` : cellules absence cliquables (cycle vide/1 ETP/0.5 ETP)
  - Mutations : `declarerAbsence` (tout user) + `testerConnexionRhApi` (modo/admin)
  - **Bugs corrigés** :
    - Page Utilisateurs liste vide : Lighthouse `max_query_complexity` trop basse (200),
      la query `users` paginée atteint ~481 → augmentée à 500
    - ConfigurationPage bouton "Enregistrer" : déplacé hors de la section absences,
      maintenant en bas de toute la page ✓

- **EV-09 : Export CSV — ajustements UX** ✓
- **EV-10 : Notifications — bouton "Supprimer tout"** ✓
- **EV-11 : Notifications — synchronisation reactive sur fin d'export** ✓
  - Signal Zustand (refreshCount) + refetch() dans NotificationBell
  - Fix : observer déclenche aussi quand l'export est TERMINE dès le premier poll
    (job très rapide, precedent === undefined mais export dans exportsLocaux)

**Bugs transverses corrigés** :
- **Auth — connexion** : `Auth::login()` sans guard explicite échouait car Lighthouse
  change le guard par défaut en `sanctum` (RequestGuard stateless).
  Fix : `Auth::guard('web')->login($user)` pour cibler explicitement le SessionGuard.
- **Auth — déconnexion** : refresh après logout reconnectait l'utilisateur. Le logout
  ne détruisait pas la session. Fix : `Auth::guard('web')->logout()` +
  `session()->invalidate()` + `session()->regenerateToken()`.

**Outillage / documentation** (fait) :
- `.env.example` avec valeurs Docker pre-remplies ✓
- `README.md` complet (installation, troubleshooting, premiers pas) ✓
- Script `scripts/install.sh` automatise ✓
- `.gitattributes` (forcer LF sur scripts shell) ✓
- Documentation API (export schema GraphQL lisible) ✓

## Commandes essentielles

Tout tourne dans Docker. Ne pas lancer les commandes depuis l'hote.

```bash
# Demarrer l'environnement
docker-compose up -d

# Tests backend (PostgreSQL obligatoire, ltree incompatible SQLite)
docker-compose exec app php artisan test

# Tests frontend unitaires (Vitest, dans Docker)
docker-compose exec frontend npm run test

# Tests E2E Playwright (sur l'HOTE, pas dans Docker)
cd frontend && npm run e2e            # headless
cd frontend && npm run e2e:ui         # interface graphique
cd frontend && npm run e2e:headed     # navigateur visible

# Apres modification du schema GraphQL : vider le cache Lighthouse
docker-compose exec app php artisan lighthouse:clear-cache

# Donnees de demo realistes (30 activites, 3 projets, 491 saisies, 3 absences)
docker-compose exec app php artisan db:seed --class=DemoSeeder

# Linting
docker-compose exec app ./vendor/bin/pint
docker-compose exec frontend npm run lint
```

## Tests

### Architecture des tests

| Couche | Outil | Ou | Commande |
|--------|-------|----|----------|
| Backend (PHP) | PHPUnit | Docker (`app`) | `docker-compose exec app php artisan test` |
| Frontend (composants) | Vitest + Testing Library | Docker (`frontend`) | `docker-compose exec frontend npm run test` |
| E2E (navigateur) | Playwright | Hote (pas Docker) | `cd frontend && npm run e2e` |

### Playwright E2E

**Prerequis** : Docker running (`docker-compose up -d`), Chromium installe (`npx playwright install chromium`)

Structure des tests E2E :
```
frontend/e2e/
├── auth.setup.ts      # Login global → sauvegarde cookies dans .auth/utilisateur.json
├── login.spec.ts      # Tests page connexion (sans session)
└── saisie.spec.ts     # Tests page saisie (avec session, anti-regression)
```

Pieges Playwright specifiques a ce projet :
- `__dirname` invalide en ESM → utiliser `fileURLToPath(import.meta.url)`
- `getByRole('dialog')` retourne hidden avec Headless UI Transition → tester le titre `getByText('Choisir un projet')`
- `locator('h1')` ambigu (Layout + page) → `getByRole('heading', { name: '...' })`
- Sélecteur `aria-label` des boutons navigation : `button[aria-label="Semaine précédente"]` (avec accent, PAS title=)
- Cellules saisie : `aria-label="Saisir pour lundi"` — minuscule (date-fns `EEEE` locale fr → lowercase)

## Acces

- **Frontend** : http://localhost:5173
- **API Backend** : http://localhost:8080
- **GraphQL Playground** : http://localhost:8080/graphiql
- **Mock API RH** : http://localhost:3001

### Comptes de test (mot de passe : `password`)
- Admin : admin@sand.local
- Moderateur : marie.dupont@sand.local
- Utilisateur : jean.martin@sand.local

## Architecture

```
backend/                     # Laravel 12
├── app/
│   ├── Models/              # Eloquent (User, Project, Activity, TimeEntry, Absence...)
│   ├── GraphQL/             # Resolvers Lighthouse (Queries/, Mutations/)
│   ├── Policies/            # Autorisations Laravel
│   ├── Jobs/                # Export CSV asynchrone
│   └── Services/            # Logique metier (RhApiClient, AbsenceService...)
└── database/
    ├── migrations/
    └── seeders/             # DatabaseSeeder, DemoSeeder

frontend/                    # React 19 + TypeScript
└── src/
    ├── components/          # Composants reutilisables
    ├── pages/               # Pages (SaisiePage, SupervisionPage, StatsPage...)
    ├── hooks/               # Hooks custom (useSaisieHebdo, useAuth...)
    ├── graphql/             # Queries et mutations Apollo
    ├── stores/              # Zustand (auth, saisie, notification)
    └── types/               # Types TypeScript

docker/                      # Configs Docker (php, nginx, node, mock-rh)
docs/                        # Specifications
```

## Concepts metier cles

- **Activites** : Arborescence hierarchique avec ltree PostgreSQL (`chemin`). Seules les feuilles (`est_feuille = true`) sont saisissables. Activite "Absence" systeme protegee (`est_systeme = true`).
- **Projets** : Activent/desactivent des activites via systeme tri-state (vide → tout active → vide).
- **Saisies** : Par jour, en ETP (0.01 a 1.00, 2 decimales max), unicite `user + date + activite + projet`. Warning si total jour != 1.0.
- **Roles** : Utilisateur (saisie perso), Moderateur (gestion equipe/projets assignes), Admin (configuration globale).
- **Absences** : Importees depuis API RH externe (mock en dev), gestion des conflits avec saisies existantes.

## Decisions techniques

- **Auth** : Sanctum SPA avec cookies HttpOnly + CSRF (pas de JWT)
- **ltree** : Extension PostgreSQL native. Operateurs `<@` (descendants), `@>` (ancetres), index GiST. Niveau = `nlevel(chemin) - 1`
- **Soft delete** : Sur users, projects, activities, time_entries (Absence : à ajouter — BACK-MIN-01)
- **Model events** : `est_feuille` recalcule automatiquement via evenements `deleted`/`restored`
- **Export CSV** : Job queue Redis asynchrone, notification quand pret
- **Tests** : PostgreSQL obligatoire (ltree incompatible SQLite), base `sand_test`

## Documentation

| Fichier | Contenu |
|---------|---------|
| `docs/01_SPEC_FONCTIONNELLE.md` | Regles metier, roles, fonctionnalites |
| `docs/02_SPEC_TECHNIQUE.md` | Stack, decisions techniques, schema BDD |
| `docs/03_ARCHITECTURE.md` | Diagrammes Mermaid (ERD, flux, C4) |
| `docs/04_API_GRAPHQL.md` | Schema GraphQL complet |
| `docs/05_BACKLOG.md` | User stories par phase (toutes terminees) |
| `docs/06_EVOLUTIONS.md` | Evolutions (toutes terminees) + reste a faire |
| `docs/DIFFUSION_LOG.md` | Journal des sessions de travail |
| `docs/archive/` | Fichiers obsoletes archives |

## Pieges connus

- **Cache Lighthouse** : Toujours vider apres modification du schema GraphQL (`php artisan lighthouse:clear-cache`)
- **Tests dans Docker** : DB_HOST=db (hostname Docker), pas accessible depuis l'hote
- **Apollo Client 4** : Imports depuis `@apollo/client/react` (pas `@apollo/client`)
- **Query absences** : Utilise un resolver custom (pas @where) pour detecter les chevauchements de periodes
- **Playwright ESM** : `__dirname` inexistant → `fileURLToPath(import.meta.url)` + `path.dirname()`
- **Playwright Headless UI** : `getByRole('dialog')` donne hidden → tester le texte visible de la modale
- **Playwright h1 ambigu** : Layout a son propre h1 → utiliser `getByRole('heading', { name: '...' })`
- **JSON scalar double encodage** : `MLL\GraphQLScalars\JSON::serialize()` faisait `json_encode($value)`, provoquant un double encodage dans la reponse HTTP (graphql-php encode une seconde fois). Apollo recevait `'"manuel"'` au lieu de `'manuel'`. Fix : `app/GraphQL/Scalars/JsonScalar.php` override `serialize()` pour retourner la valeur PHP telle quelle. Le scalar `JSON` dans schema.graphql pointe vers cette classe.
- **Setting.valeur cast 'array'** : Le modele Setting utilise le cast Eloquent `'array'` (json_encode/decode). Utiliser `Setting::get()` ou l'accesseur Eloquent pour lire les valeurs (pas de raw SQL) pour beneficier du decode automatique.

## Audit technique et qualite

### Agent auditeur

Un agent auditeur est disponible : **`auditeur-sand`** (`.claude/agents/auditeur-sand.md`).

**Obligation** : interroger cet agent en **debut ET fin de chaque implementation** (correction, evolution, refactoring).

- **Avant** : l'agent verifie la coherence de la tache avec le plan d'action, identifie les risques et definit les criteres de succes
- **Apres** : l'agent verifie que la correction est conforme, met a jour le tableau de suivi dans `docs/07_AUDIT_TECHNIQUE.md`

```
# Exemple d'invocation
"Avant de corriger SEC-01, consulte l'agent auditeur-sand"
"La correction de SEC-01 est terminee, fais le post-check avec auditeur-sand"
```

### Rapport d'audit

Rapport complet : **`docs/07_AUDIT_TECHNIQUE.md`** (audit du 2026-02-22)

### Plan d'action

Les items sont identifies par ID dans le rapport. Priorites :

**P1 — Securite (urgent)**
- `SEC-01` : `TeamMutator::delete()` sans autorisation — faille critique
- `SEC-02` : `TimeEntryMutator::bulkUpdate()` sans autorisation par entree — faille critique

**P2 — Finaliser EV-12**
- `BACK-03` : Notification manquante dans `declarerAbsence()`
- `FRONT-MIN-03` : Tests E2E (declaration manuelle, notification, test connexion API RH)
- `DOC-02` : Documenter `declarerAbsence` dans `docs/04_API_GRAPHQL.md`

**P3 — Qualite code**
- `BACK-01` : `Activity::deleted()` event — ajouter `->withTrashed()`
- `BACK-02` : Supprimer colonne `niveau` inutile dans `activities`
- `FRONT-01` : Remplacer `console.error` silencieux par etats d'erreur UI
- `BACK-04` : Creer `AbsenceService`
- `BACK-06` : Tests PHPUnit manquants (TeamMutator, declarerAbsence user, bulkUpdate)

**P4 — Refactoring**
- `FRONT-02` : Decouper `ProjetsPage.tsx` (971 lignes)
- `FRONT-04` : Extraire `useIsMobile`, `usePeriode` en hooks partages
- `BACK-MIN-01` : Ajouter `SoftDeletes` au modele `Absence`

