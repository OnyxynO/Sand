# Avancement du projet SAND

## Phase actuelle : Backend Core

---

## Historique

### 2026-01-28 - Modeles et migrations

#### Fait
- [x] Migrations base de donnees (13 fichiers)
  - [x] teams, users (modifie), projects, activities
  - [x] project_activities, project_user, project_moderators
  - [x] activity_user_visibilities
  - [x] time_entries, time_entry_logs
  - [x] absences, notifications, settings
- [x] Modeles Eloquent complets avec relations
  - [x] Team, User (avec roles et helpers)
  - [x] Project (avec gestion activites tri-state)
  - [x] Activity (avec path materialise)
  - [x] TimeEntry, TimeEntryLog (avec historique)
  - [x] Absence, Notification, Setting
- [x] Seeders de donnees initiales
  - [x] TeamSeeder (4 equipes)
  - [x] UserSeeder (5 utilisateurs: admin, moderateur, 3 users)
  - [x] ActivitySeeder (arborescence + activite systeme Absence)
  - [x] ProjectSeeder (3 projets avec affectations)
  - [x] SettingSeeder (parametres par defaut)

#### En cours
- [x] Schema GraphQL complet
  - [x] Types (User, Team, Project, Activity, TimeEntry, Absence, Notification, Setting)
  - [x] Enums (UserRole, LogAction, NotificationType, etc.)
  - [x] Inputs pour mutations
  - [x] Queries (me, users, projets, saisies, etc.)
  - [x] Mutations (auth, CRUD, bulk operations)
- [x] Policies d'autorisation
  - [x] UserPolicy, TeamPolicy, ProjectPolicy
  - [x] ActivityPolicy, TimeEntryPolicy, AbsencePolicy, SettingPolicy
- [x] Resolvers essentiels
  - [x] AuthMutator (login/logout)
  - [x] TimeEntryMutator (CRUD + bulk)
  - [x] NotificationMutator
  - [x] Queries (MesSaisiesSemaine, ActivitesDisponibles, etc.)

### 2026-01-28 - Initialisation du projet

#### Fait
- [x] Creation du repository GitHub (https://github.com/OnyxynO/Sand)
- [x] Configuration Git avec cle SSH
- [x] Structure Docker Compose (PostgreSQL 16, Redis 7, PHP 8.3-fpm, Nginx, Node 20)
- [x] Mock API RH pour le developpement
- [x] Backend Laravel 12 initialise
  - [x] Lighthouse (GraphQL) installe
  - [x] Sanctum (auth SPA) installe
  - [x] CORS configure pour le frontend
  - [x] Configuration PostgreSQL/Redis
- [x] Frontend React 18 + TypeScript initialise
  - [x] Vite comme bundler
  - [x] Apollo Client configure
  - [x] Tailwind CSS v4
  - [x] Zustand (store auth)
  - [x] Structure dossiers (graphql, stores, components, pages, hooks)

---

## Prochaines etapes

### Phase 1 - Backend Core (en cours)
- [x] Modele User avec roles (utilisateur, moderateur, admin)
- [x] Modele Activity (arborescence avec path materialise)
- [x] Modele Project (gestion des activites actives)
- [x] Modele TimeEntry (saisies)
- [x] Modele Absence (import RH)
- [x] Migrations et seeders
- [ ] Schema GraphQL selon `docs/04_API_GRAPHQL.md`
- [ ] Policies d'autorisation

### Phase 2 - Auth & API
- [ ] Authentification Sanctum SPA
- [ ] Resolvers GraphQL (queries, mutations)
- [ ] Validation des saisies (ETP, unicite, etc.)
- [ ] Tests PHPUnit

### Phase 3 - Frontend
- [ ] Page de connexion
- [ ] Dashboard utilisateur
- [ ] Interface de saisie hebdomadaire
- [ ] Gestion des projets (moderateur)
- [ ] Administration (admin)

### Phase 4 - Fonctionnalites avancees
- [ ] Import des absences depuis API RH
- [ ] Export CSV (job queue)
- [ ] Notifications
- [ ] Tests Vitest

---

## Decisions techniques

| Date | Decision | Raison |
|------|----------|--------|
| 2026-01-28 | Laravel 12 au lieu de 11 | Version stable disponible via composer |
| 2026-01-28 | PHP 8.5 local (8.3 en Docker) | Version installee par brew, compatible |
| 2026-01-28 | Tailwind v4 avec @tailwindcss/vite | Nouvelle syntaxe simplifiee |

---

## Liens utiles

- **Repository** : https://github.com/OnyxynO/Sand
- **Documentation** : `docs/`
- **Backlog** : `docs/05_BACKLOG.md`
