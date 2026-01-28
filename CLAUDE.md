# CLAUDE.md

Ce fichier fournit des directives à Claude Code (claude.ai/code) pour travailler dans ce répertoire.

## Projet

**SAND** (Saisie d'Activité Numérique Déclarative) - Application web de saisie d'activités professionnelles permettant aux collaborateurs de déclarer leur temps de travail par projet. Successeur de l'ancienne application SAEL.

Documentation complète dans `/docs/` :
- `01_SPEC_FONCTIONNELLE.md` - Règles métier, rôles, fonctionnalités
- `02_SPEC_TECHNIQUE.md` - Stack, décisions techniques, schéma BDD
- `03_ARCHITECTURE.md` - Diagrammes Mermaid (ERD, flux, C4)
- `04_API_GRAPHQL.md` - Schéma GraphQL complet
- `05_BACKLOG.md` - User stories par phase

## Stack technique

| Couche | Technologies |
|--------|--------------|
| Backend | Laravel 11, PHP 8.3, Lighthouse (GraphQL), Sanctum |
| Frontend | React 18, TypeScript, Apollo Client, Tailwind CSS, Zustand |
| Base de données | PostgreSQL 16 |
| Cache/Queue | Redis |
| Conteneurisation | Docker, Docker Compose |
| Tests | PHPUnit (backend), Vitest (frontend) |
| Linting | Laravel Pint (PHP), ESLint + Prettier (JS/TS) |

## Commandes de développement

```bash
# Environnement Docker
docker-compose up -d

# Backend (Laravel)
cd backend
composer install
php artisan migrate --seed
php artisan serve                    # API sur localhost:8080

# Frontend (React)
cd frontend
npm install
npm run dev                          # Dev server sur localhost:5173

# Tests
cd backend && php artisan test       # Tests PHPUnit
cd frontend && npm run test          # Tests Vitest

# Linting
cd backend && ./vendor/bin/pint      # Laravel Pint
cd frontend && npm run lint          # ESLint
```

## Architecture

```
sand/
├── backend/                 # Laravel 11
│   ├── app/
│   │   ├── Models/          # Eloquent (User, Project, Activity, TimeEntry...)
│   │   ├── GraphQL/         # Resolvers et types Lighthouse
│   │   ├── Policies/        # Autorisations Laravel
│   │   ├── Jobs/            # Export CSV asynchrone
│   │   └── Services/        # Logique métier
│   └── database/
│       ├── migrations/
│       └── seeders/
├── frontend/                # React 18 + TypeScript
│   └── src/
│       ├── components/
│       ├── pages/
│       ├── hooks/
│       ├── graphql/         # Queries et mutations Apollo
│       └── stores/          # Zustand
├── docker/                  # Configs Docker (php, nginx, node, mock-rh)
└── docs/                    # Spécifications
```

## Concepts métier clés

- **Activités** : Arborescence hiérarchique globale avec path matérialisé (`1.2.3`). Seules les feuilles sont saisissables. Activité "Absence" système (protégée, `is_system = true`).
- **Projets** : Activent/désactivent des activités via système tri-state (vide → tout activé → vide).
- **Saisies** : Par jour, en ETP (0.01 à 1.00, 2 décimales max), unicité `user + date + activité + projet`. Warning si total jour ≠ 1.0.
- **Rôles** : Utilisateur (saisie perso), Modérateur (gestion équipe/projets assignés), Admin (configuration globale).
- **Absences** : Importées depuis API RH externe (mock en dev), gestion des conflits avec saisies existantes.

## Décisions techniques

- **Auth** : Sanctum SPA avec cookies HttpOnly + CSRF (pas de JWT)
- **Path matérialisé** : Champ `path` sur `activities` pour tri/requêtes descendants sans récursion
- **Soft delete** : Sur users, projects, activities, time_entries (préserve historique stats)
- **Notifications** : Rafraîchissement au chargement de page (pas de WebSocket en v1)
- **Export CSV** : Job queue Redis asynchrone, notification quand prêt, lien avec expiration
