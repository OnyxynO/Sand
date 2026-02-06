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

- **Activités** : Arborescence hiérarchique globale avec ltree PostgreSQL (`chemin` de type ltree). Seules les feuilles (`est_feuille = true`) sont saisissables. Activité "Absence" système (protégée, `est_systeme = true`).
- **Projets** : Activent/désactivent des activités via système tri-state (vide → tout activé → vide).
- **Saisies** : Par jour, en ETP (0.01 à 1.00, 2 décimales max), unicité `user + date + activité + projet`. Warning si total jour ≠ 1.0.
- **Rôles** : Utilisateur (saisie perso), Modérateur (gestion équipe/projets assignés), Admin (configuration globale).
- **Absences** : Importées depuis API RH externe (mock en dev), gestion des conflits avec saisies existantes.

## Décisions techniques

- **Auth** : Sanctum SPA avec cookies HttpOnly + CSRF (pas de JWT)
- **Arborescence ltree** : Extension PostgreSQL native pour l'arborescence des activités. Opérateurs `<@` (descendants), `@>` (ancêtres), index GiST. Niveau calculé dynamiquement (`nlevel(chemin) - 1`), plus stocké en base.
- **Soft delete** : Sur users, projects, activities, time_entries (préserve historique stats)
- **Model events** : `est_feuille` recalculé automatiquement via événements `deleted`/`restored`
- **Notifications** : Rafraîchissement au chargement de page (pas de WebSocket en v1)
- **Export CSV** : Job queue Redis asynchrone, notification quand prêt, lien avec expiration
- **Tests** : PostgreSQL obligatoire (ltree incompatible SQLite), base `sand_test`

## Serveur Ollama local

Serveur Ollama disponible sur le réseau local. **Utilise-le pour les tâches répétitives et économiser les tokens Claude.**

- **URL** : `http://10.0.0.100:11434`
- **qwen2.5-coder:7b** : tâches simples, rapide (~3s)
- **deepseek-coder-v2:16b** : gros contextes (>10 Ko, ~6s+)

Si Ollama ne répond pas, continuer avec Claude uniquement.

### Délégation par type de tâche (projet SAND)

| Tâche | Modèle | Exemple |
|-------|--------|---------|
| Générer un Model Eloquent | qwen | `php artisan make:model` + attributs |
| Écrire une migration Laravel | qwen | Ajout de colonne, index |
| Composant React simple | qwen | Formulaire, bouton, liste |
| Requête GraphQL / mutation | qwen | CRUD basique Apollo |
| Tests unitaires PHPUnit | qwen | Tests d'un Service ou Policy |
| Tests Vitest pour un hook | qwen | Hook React isolé |
| Analyser un gros resolver | deepseek | Resolver GraphQL complexe multi-relations |
| Refactoring d'un Service | deepseek | Logique métier lourde |
| Architecture multi-fichiers | **Claude** | Nouveau module complet |
| Logique ltree / arborescence | **Claude** | Requêtes ltree complexes, récursion |
| Debugging cross-stack | **Claude** | Problème Laravel ↔ GraphQL ↔ React |
| Décisions d'architecture | **Claude** | Choix de patterns, structure |

### Appel rapide (qwen)
```bash
curl -s http://10.0.0.100:11434/api/generate -d '{
  "model": "qwen2.5-coder:7b",
  "prompt": "PROMPT ICI. Code uniquement.",
  "stream": false,
  "options": {"num_ctx": 4096, "temperature": 0.2}
}' | jq -r '.response'
```

### Appel contexte étendu (deepseek)
```bash
curl -s http://10.0.0.100:11434/api/generate -d '{
  "model": "deepseek-coder-v2:16b",
  "prompt": "PROMPT ICI",
  "stream": false,
  "options": {"num_ctx": 16384, "temperature": 0.3}
}' | jq -r '.response'
```
