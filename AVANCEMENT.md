# Avancement du projet SAND

## Phase actuelle : Phase 2 - Test & Integration (en cours)

---

## Prochaine session

### A faire en priorite
1. **Tests PHPUnit** : ecrire des tests de base pour les mutations principales
2. **Commencer le frontend** : page de connexion avec Apollo Client

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

### Phase 2 - Test & Integration [COMPLETE]
- [x] Docker operationnel
- [x] API GraphQL testee
- [x] Resolvers manquants
- [x] Tests PHPUnit de base (23 tests, 74 assertions)

### Phase 3 - Frontend
- [ ] Page de connexion
- [ ] Dashboard utilisateur
- [ ] Interface de saisie hebdomadaire
- [ ] Gestion des projets (moderateur)
- [ ] Administration (admin)

### Phase 4 - Fonctionnalites avancees
- [ ] Import des absences depuis API RH
- [ ] Export CSV (job queue)
- [ ] Notifications temps reel (optionnel)
- [ ] Tests Vitest

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
