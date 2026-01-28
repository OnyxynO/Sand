# Avancement du projet SAND

## Phase actuelle : Test Docker & Frontend

---

## Prochaine session

### A faire en priorite
1. **Lancer Docker** et verifier que tout fonctionne :
   ```bash
   docker-compose up -d
   docker-compose exec app php artisan migrate --seed
   ```
2. **Tester l'API GraphQL** via GraphiQL (http://localhost:8080/graphiql)
3. **Commencer le frontend** : page de connexion

### Commandes utiles
```bash
# Lancer l'environnement
docker-compose up -d

# Voir les logs
docker-compose logs -f

# Executer les migrations
docker-compose exec app php artisan migrate --seed

# Acceder au conteneur PHP
docker-compose exec app bash

# Lancer le frontend (hors Docker pour le dev)
cd frontend && npm run dev
```

### Acces
- **API Backend** : http://localhost:8080
- **GraphiQL** : http://localhost:8080/graphiql
- **Frontend** : http://localhost:5173
- **Mock API RH** : http://localhost:3001

### Comptes de test (apres seed)
| Email | Mot de passe | Role |
|-------|--------------|------|
| admin@sand.local | password | Admin |
| marie.dupont@sand.local | password | Moderateur |
| jean.martin@sand.local | password | Utilisateur |

---

## Historique

### 2026-01-28 - API GraphQL complete

#### Fait
- [x] Schema GraphQL complet (Lighthouse)
  - [x] 10 types (User, Team, Project, Activity, TimeEntry, Absence, etc.)
  - [x] 6 enums (UserRole, LogAction, NotificationType, etc.)
  - [x] 8 fichiers d'inputs avec validation
  - [x] Queries: me, users, projets, saisies, activitesDisponibles, etc.
  - [x] Mutations: auth, CRUD complet, bulk operations
- [x] Resolvers PHP
  - [x] AuthMutator (login/logout Sanctum)
  - [x] TimeEntryMutator (CRUD + bulk avec logging)
  - [x] NotificationMutator
  - [x] Queries personnalisees (MesSaisiesSemaine, ActivitesDisponibles, etc.)
- [x] Policies d'autorisation (7 policies)
  - [x] Admin: users, teams, activities, settings
  - [x] Moderateur: projets assignes, utilisateurs, absences
  - [x] Utilisateur: ses propres saisies
- [x] Package mll-lab/graphql-php-scalars pour JSON scalar

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
  - [x] Absence, Notification, Setting (avec cache)
- [x] Seeders de donnees initiales
  - [x] TeamSeeder (4 equipes: DEV, RH, COM, DIR)
  - [x] UserSeeder (5 utilisateurs: 1 admin, 1 moderateur, 3 users)
  - [x] ActivitySeeder (arborescence + activite systeme Absence)
  - [x] ProjectSeeder (3 projets: SAND, MAINT, RH-GEST)
  - [x] SettingSeeder (parametres par defaut)

### 2026-01-28 - Initialisation du projet

#### Fait
- [x] Repository GitHub (https://github.com/OnyxynO/Sand)
- [x] Configuration Git avec cle SSH
- [x] Docker Compose (PostgreSQL 16, Redis 7, PHP 8.3-fpm, Nginx, Node 20, Mock RH)
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

### Phase 2 - Test & Integration [EN COURS]
- [ ] Tester Docker (migrations, seeders)
- [ ] Tester API GraphQL (login, queries, mutations)
- [ ] Resolvers manquants (statistiques, anomalies, export)
- [ ] Tests PHPUnit de base

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
| 2026-01-28 | PHP 8.5 local (8.3 en Docker) | Version installee par brew, compatible |
| 2026-01-28 | Tailwind v4 avec @tailwindcss/vite | Nouvelle syntaxe simplifiee |
| 2026-01-28 | Schema GraphQL modulaire | Fichiers separes par domaine (types/, inputs/, mutations/) |

---

## Liens utiles

- **Repository** : https://github.com/OnyxynO/Sand
- **Documentation** : `docs/`
- **Backlog** : `docs/05_BACKLOG.md`
