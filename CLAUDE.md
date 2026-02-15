# CLAUDE.md - SAND

Ce fichier est le point d'entree pour Claude Code. Il contient tout le contexte necessaire pour travailler sur ce projet.

## Projet

**SAND** (Saisie d'Activite Numerique Declarative) - Application web de saisie d'activites professionnelles. Successeur de SAEL.

## Stack technique

| Couche | Technologies |
|--------|--------------|
| Backend | Laravel 12, PHP 8.4, Lighthouse 6 (GraphQL), Sanctum |
| Frontend | React 18, TypeScript, Apollo Client 4, Tailwind CSS, Zustand |
| Base de donnees | PostgreSQL 16 (extension ltree) |
| Cache/Queue | Redis |
| Conteneurisation | Docker, Docker Compose |
| Tests | PHPUnit (180 tests, 709 assertions), Vitest (202 tests) |

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

### Evolutions restantes (non implementees)
Aucune - toutes les evolutions sont implementees.

Voir `docs/06_EVOLUTIONS.md` pour le detail.

## Commandes essentielles

Tout tourne dans Docker. Ne pas lancer les commandes depuis l'hote.

```bash
# Demarrer l'environnement
docker-compose up -d

# Tests backend (PostgreSQL obligatoire, ltree incompatible SQLite)
docker-compose exec app php artisan test

# Tests frontend
docker-compose exec frontend npm run test

# Apres modification du schema GraphQL : vider le cache Lighthouse
docker-compose exec app php artisan lighthouse:clear-cache

# Donnees de demo realistes (30 activites, 3 projets, 491 saisies, 3 absences)
docker-compose exec app php artisan db:seed --class=DemoSeeder

# Linting
docker-compose exec app ./vendor/bin/pint
docker-compose exec frontend npm run lint
```

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

frontend/                    # React 18 + TypeScript
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
- **Soft delete** : Sur users, projects, activities, time_entries
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
| `docs/06_EVOLUTIONS.md` | Evolutions futures |
| `docs/DIFFUSION_LOG.md` | Journal des sessions de travail |
| `docs/archive/` | Fichiers obsoletes archives |

## Pieges connus

- **Cache Lighthouse** : Toujours vider apres modification du schema GraphQL (`php artisan lighthouse:clear-cache`)
- **Tests dans Docker** : DB_HOST=db (hostname Docker), pas accessible depuis l'hote
- **Apollo Client 4** : Imports depuis `@apollo/client/react` (pas `@apollo/client`)
- **Query absences** : Utilise un resolver custom (pas @where) pour detecter les chevauchements de periodes

## Serveur Ollama local

Serveur Ollama disponible sur le reseau local. **Utilise-le pour les taches repetitives et economiser les tokens Claude.**

- **URL** : `http://10.0.0.100:11434`
- **qwen3:8b** : taches simples, rapide (~3s). Ajouter `/no_think` au prompt pour reponses directes.
- **deepseek-coder-v2:16b** : gros contextes (>10 Ko, ~6s+)

Si Ollama ne repond pas, continuer avec Claude uniquement.

### Delegation par type de tache

| Tache | Modele |
|-------|--------|
| Generer un Model/migration/composant simple | qwen |
| Tests unitaires (PHPUnit, Vitest) | qwen |
| Requete GraphQL / mutation CRUD | qwen |
| Analyser un gros resolver ou refactoring | deepseek |
| Architecture multi-fichiers, ltree, debugging cross-stack | **Claude** |

### Appel rapide (qwen)
```bash
curl -s http://10.0.0.100:11434/api/generate -d '{
  "model": "qwen3:8b",
  "prompt": "/no_think PROMPT ICI. Code uniquement.",
  "stream": false,
  "options": {"num_ctx": 4096, "temperature": 0.2}
}' | jq -r '.response'
```

### Appel contexte etendu (deepseek)
```bash
curl -s http://10.0.0.100:11434/api/generate -d '{
  "model": "deepseek-coder-v2:16b",
  "prompt": "PROMPT ICI",
  "stream": false,
  "options": {"num_ctx": 16384, "temperature": 0.3}
}' | jq -r '.response'
```
