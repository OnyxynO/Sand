# Avancement du projet SAND

## Phase actuelle : Phase 3 - Integrations & Moderation (en cours)

---

## Prochaine session

### A faire en priorite
1. **Corriger BUG-003** : mutations GraphQL activites (voir TODO_BUGS.md)
2. **Implementer US-3.3** : gestion des conflits absences (interface de resolution)
3. **Implementer US-3.6** : systeme de notifications (UI cloche + panneau)

### Commandes utiles
```bash
# Lancer l'environnement
docker-compose up -d

# Voir les logs
docker-compose logs -f

# Executer les migrations (si necessaire)
docker-compose exec app php artisan migrate --seed

# Acceder au conteneur PHP
docker-compose exec app bash

# Lancer le frontend (hors Docker pour le dev)
cd frontend && npm run dev

# Tests backend
docker-compose exec app php artisan test
```

### Acces
- **API Backend** : http://localhost:8080/graphql
- **GraphiQL** : http://localhost:8080/graphiql
- **Frontend** : http://localhost:5173
- **Mock API RH** : http://localhost:3001

### Comptes de test
| Email | Mot de passe | Role |
|-------|--------------|------|
| admin@sand.local | password | Admin |
| marie.dupont@sand.local | password | Moderateur |
| jean.martin@sand.local | password | Utilisateur |

### Test rapide de l'API
```bash
# Login et obtenir un token
TOKEN=$(curl -s -X POST http://localhost:8080/graphql \
  -H "Content-Type: application/json" \
  -d '{"query": "mutation { login(input: {email: \"admin@sand.local\", password: \"password\"}) { token } }"}' | jq -r '.data.login.token')

# Requete authentifiee
curl -s -X POST http://localhost:8080/graphql \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{"query": "{ me { id nom prenom email role } }"}' | jq .
```

---

## Historique

### 2026-01-30 - Phase 3 : Import absences (US-3.2)

#### Fait
- [x] US-3.2 : Import des absences depuis l'API RH
  - [x] Configuration API RH dans `config/services.php`
  - [x] Exception `RhApiException.php` pour erreurs API
  - [x] Client HTTP `RhApiClient.php` avec `getAbsences()` et `healthCheck()`
  - [x] Implementation complete de `syncAbsences` dans `AbsenceMutator.php`
  - [x] Detection des conflits avec saisies existantes
  - [x] Creation automatique des notifications (import OK ou conflit)
  - [x] Mise a jour du mock RH (matricules alignes, `duree_journaliere`, dates 2026)
  - [x] Tests valides : 5 absences importees, 1 conflit detecte, idempotence OK

#### Fichiers crees
- `backend/app/Services/RhApiClient.php`
- `backend/app/Exceptions/RhApiException.php`

#### Fichiers modifies
- `backend/config/services.php` (ajout config `rh_api`)
- `backend/app/GraphQL/Mutations/AbsenceMutator.php` (implementation complete)
- `docker/mock-rh/server.js` (matricules DEV001/DEV002/MOD001, duree_journaliere)

#### Tests effectues
```bash
# Mock RH
curl http://localhost:3001/api/absences?matricule=DEV001
# → 2 absences retournees

# syncAbsences via Tinker
# → importes: 5, conflits: 1, erreurs: []

# Idempotence (2e appel)
# → importes: 0 (pas de doublons)
```

### 2026-01-30 - Phase 2 : Frontend (quasi-complete)

#### Fait
- [x] Interface de saisie hebdomadaire complete
  - [x] GrilleSemaine.tsx - grille 7 jours editable
  - [x] GrilleSemaineMobile.tsx - vue mobile en cartes
  - [x] CelluleSaisie.tsx - cellule editable avec Tab/Enter
  - [x] LigneSaisie.tsx - ligne projet+activite
  - [x] TotauxJournaliers.tsx - warnings si != 1.0
  - [x] SelecteurProjetActivite.tsx - modale ajout ligne
  - [x] NavigationSemaine.tsx - prev/next/aujourd'hui
  - [x] BoutonSauvegarde.tsx - barre fixe
  - [x] useSaisieHebdo.ts - hook chargement/sauvegarde
  - [x] saisieStore.ts - etat grille Zustand
  - [x] semaineUtils.ts - calculs dates ISO
- [x] CRUD Utilisateurs (UtilisateursPage.tsx)
  - [x] Liste avec recherche
  - [x] Filtres par role et equipe
  - [x] Formulaire creation/edition
  - [x] Soft delete
- [x] CRUD Equipes (EquipesPage.tsx)
  - [x] Cartes avec membres
  - [x] Creation/edition/suppression
- [x] Arborescence activites (ActivitesPage.tsx)
  - [x] Affichage en arbre collapsible
  - [x] Boutons monter/descendre
  - [x] Badges feuille/systeme/inactif
  - [x] Protection activite "Absence" (is_system)
- [x] CRUD Projets (ProjetsPage.tsx)
  - [x] Liste avec filtres actif/archive
  - [x] Formulaire projet (dates, description)
  - [x] Configuration tri-state des activites
  - [x] Toast d'annulation si >3 desactivations
- [x] Composant ToastAnnulation.tsx reutilisable

#### Notes techniques
- Apollo Client 4.x : imports depuis @apollo/client/react
- Tailwind 4 avec @import "tailwindcss"
- CORS configure pour ports 5173-5175

### 2026-01-29 - Phase 3 : Frontend (debut)

#### Fait
- [x] Page de connexion
  - [x] Formulaire avec validation
  - [x] Gestion des erreurs (identifiants invalides, compte desactive)
  - [x] Affichage comptes de test en mode dev
  - [x] Spinner de chargement
- [x] Dashboard utilisateur
  - [x] Message de bienvenue
  - [x] Carte profil (nom, email, equipe, role)
  - [x] Placeholders pour futures fonctionnalites
- [x] Layout principal
  - [x] Header avec navigation
  - [x] Menu responsive (mobile)
  - [x] Bouton deconnexion
  - [x] Navigation conditionnelle selon role
- [x] Architecture
  - [x] Types TypeScript (types/index.ts)
  - [x] Operations GraphQL (graphql/operations/auth.ts)
  - [x] Store Zustand avec token (stores/authStore.ts)
  - [x] Hook useAuthInit pour restaurer session
  - [x] Composant ProtectedRoute avec verification roles
  - [x] React Router configure

### 2026-01-28 - Phase 2 : Test & Integration

#### Fait
- [x] Docker operationnel
  - [x] Correction entrypoint frontend (npm install automatique)
  - [x] Mise a jour PHP 8.3 -> 8.4 (requis par Laravel 12)
  - [x] Correction .env (hosts Docker: db, redis, mock-rh)
  - [x] Tous les conteneurs fonctionnels
- [x] Migrations et seeders executes avec succes
- [x] API GraphQL testee et fonctionnelle
  - [x] Auth avec token Sanctum (Bearer)
  - [x] Configuration guard Lighthouse -> sanctum
  - [x] Installation mll-lab/laravel-graphiql
- [x] Resolvers manquants crees
  - [x] AbsenceMutator (sync, create, resolveConflict)
  - [x] ProjectMutator (CRUD, activities, users, moderators)
  - [x] ActivityMutator (CRUD, move, reorder)
  - [x] UserMutator (CRUD)
  - [x] SettingMutator (update, updateMultiple)
  - [x] ExportMutator (request - stub)
  - [x] StatistiquesQuery (temps total, par projet/activite/jour/user)
  - [x] AnomaliesQuery (jours incomplets, manquants, saisies sur absence)
  - [x] ProjectResolver (tempsTotal)
  - [x] ProjectBuilder (filterByModerateur)
- [x] Corrections diverses
  - [x] Remplacement @whereHas invalide par @builder
  - [x] Correction validation Date dans inputs
  - [x] Correction colonnes etp -> duree dans queries

#### Tests effectues
- [x] Login/logout avec token API
- [x] Query me (utilisateur connecte)
- [x] Query equipes, projets, arbreActivites
- [x] Mutation createTimeEntry
- [x] Query statistiques

#### Tests PHPUnit (23 tests)
- [x] AuthGraphQLTest (6 tests) : login, logout, me
- [x] TimeEntryGraphQLTest (7 tests) : CRUD, bulk, autorisation
- [x] QueriesGraphQLTest (8 tests) : equipes, projets, activites, stats, pagination
- [x] Factories creees : Team, Project, Activity, TimeEntry, User (mis a jour)
- [x] Trait GraphQLTestTrait pour faciliter les tests

### 2026-01-28 - API GraphQL complete

#### Fait
- [x] Schema GraphQL complet (Lighthouse)
  - [x] 10 types (User, Team, Project, Activity, TimeEntry, Absence, etc.)
  - [x] 6 enums (UserRole, LogAction, NotificationType, etc.)
  - [x] 8 fichiers d'inputs avec validation
  - [x] Queries: me, users, projets, saisies, activitesDisponibles, etc.
  - [x] Mutations: auth, CRUD complet, bulk operations
- [x] Resolvers PHP initiaux
  - [x] AuthMutator (login/logout Sanctum + token API)
  - [x] TimeEntryMutator (CRUD + bulk avec logging)
  - [x] NotificationMutator
  - [x] Queries personnalisees (MesSaisiesSemaine, ActivitesDisponibles, etc.)
- [x] Policies d'autorisation (7 policies)

### 2026-01-28 - Modeles et migrations

#### Fait
- [x] Migrations base de donnees (13 fichiers)
- [x] Modeles Eloquent complets avec relations
- [x] Seeders de donnees initiales

### 2026-01-28 - Initialisation du projet

#### Fait
- [x] Repository GitHub (https://github.com/OnyxynO/Sand)
- [x] Docker Compose (PostgreSQL 16, Redis 7, PHP 8.4-fpm, Nginx, Node 20, Mock RH)
- [x] Backend Laravel 12 + Lighthouse + Sanctum
- [x] Frontend React 18 + TypeScript + Vite + Apollo + Tailwind v4 + Zustand

---

## Prochaines etapes

### Phase 1 - Backend Core [COMPLETE]
- [x] Modeles Eloquent
- [x] Migrations et seeders
- [x] Schema GraphQL
- [x] Policies d'autorisation
- [x] Resolvers essentiels

### Phase 2 - Fonctionnalites Core [COMPLETE]
- [x] Docker operationnel
- [x] API GraphQL testee
- [x] Resolvers manquants
- [x] Tests PHPUnit de base (23 tests, 74 assertions)
- [x] Interface de saisie hebdomadaire complete
- [x] CRUD Utilisateurs, Equipes, Projets, Activites
- [ ] US-2.6 : Visibilite par utilisateur (backend non implemente)

### Phase 3 - Integrations & Moderation [EN COURS]
- [x] US-3.1 : Mock service RH (container Docker fonctionnel)
- [x] US-3.2 : Import des absences
  - [x] Client RhApiClient
  - [x] Mutation syncAbsences
  - [x] Detection conflits avec TimeEntry
  - [x] Notifications automatiques
- [ ] US-3.3 : Gestion des conflits absences (interface resolution)
- [ ] US-3.4 : Droits moderateur
- [ ] US-3.5 : Page de supervision
- [ ] US-3.6 : Systeme de notifications (UI)

### Phase 4 - Reporting
- [ ] US-4.1 : Dashboard statistiques
- [ ] US-4.4 : Export CSV (job queue)
- [ ] Tests Vitest

### Phase Bonus - Documentation et facilite d'installation
Voir `docs/DIFFUSION_LOG.md` pour le detail des problemes rencontres.

- [ ] Mise a jour `.env.example` avec valeurs Docker
- [ ] Creation `README.md` complet (installation, troubleshooting)
- [ ] Script `scripts/install.sh` automatise
- [ ] Fichier `.gitattributes` (LF sur scripts)
- [ ] Healthchecks Docker
- [ ] Documentation API (export schema GraphQL)

---

## Decisions techniques

| Date | Decision | Raison |
|------|----------|--------|
| 2026-01-28 | Laravel 12 au lieu de 11 | Version stable disponible via composer |
| 2026-01-28 | PHP 8.4 en Docker | Requis par Laravel 12 et ses dependances |
| 2026-01-28 | Tailwind v4 avec @tailwindcss/vite | Nouvelle syntaxe simplifiee |
| 2026-01-28 | Schema GraphQL modulaire | Fichiers separes par domaine (types/, inputs/, mutations/) |
| 2026-01-28 | Auth Sanctum avec tokens API | Facilite les tests CLI et mobile, en plus du mode SPA |
| 2026-01-28 | Champ "duree" (pas "etp") | Coherence avec la spec GraphQL |

---

## Liens utiles

- **Repository** : https://github.com/OnyxynO/Sand
- **Documentation** : `docs/`
- **Backlog** : `docs/05_BACKLOG.md`
