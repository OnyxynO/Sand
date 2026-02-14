# SAND - Saisie d'Activite Numerique Declarative

Application web de saisie d'activites professionnelles permettant aux collaborateurs de declarer leur temps de travail par projet. Successeur de l'ancienne application SAEL.

## Stack technique

| Couche | Technologies |
|--------|--------------|
| Backend | Laravel 12, PHP 8.4, Lighthouse (GraphQL), Sanctum |
| Frontend | React 18, TypeScript, Apollo Client 4, Tailwind CSS, Zustand |
| Base de donnees | PostgreSQL 16 (ltree) |
| Cache/Queue | Redis |
| Conteneurisation | Docker, Docker Compose |
| Tests | PHPUnit (172 tests), Vitest (125 tests) |

## Prerequis

- Docker et Docker Compose
- Git

## Installation

```bash
# Cloner le repository
git clone https://github.com/OnyxynO/Sand.git
cd Sand

# Copier le fichier d'environnement
cp .env.example .env

# Lancer les conteneurs Docker
docker-compose up -d

# Installer les dependances et initialiser
docker-compose exec app composer install
docker-compose exec app php artisan key:generate
docker-compose exec app php artisan migrate --seed
docker-compose exec frontend npm install
```

### Donnees de demonstration

Pour charger des donnees realistes (30 activites, 3 projets, 491 saisies, 3 absences) :

```bash
docker-compose exec app php artisan db:seed --class=DemoSeeder
```

## Acces

- **Frontend** : http://localhost:5173
- **API Backend** : http://localhost:8080
- **GraphQL Playground** : http://localhost:8080/graphiql
- **Mock API RH** : http://localhost:3001

### Comptes de test

| Role | Email | Mot de passe |
|------|-------|--------------|
| Admin | admin@sand.local | password |
| Moderateur | marie.dupont@sand.local | password |
| Utilisateur | jean.martin@sand.local | password |

## Commandes utiles

```bash
# Tests backend (172 tests)
docker-compose exec app php artisan test

# Tests frontend (125 tests)
docker-compose exec frontend npm run test

# Linting
docker-compose exec app ./vendor/bin/pint
docker-compose exec frontend npm run lint

# Logs
docker-compose logs -f

# Acces shell conteneur PHP
docker-compose exec app bash
```

## Documentation

La documentation complete se trouve dans `/docs/` :

- `01_SPEC_FONCTIONNELLE.md` - Regles metier, roles, fonctionnalites
- `02_SPEC_TECHNIQUE.md` - Stack, decisions techniques, schema BDD
- `03_ARCHITECTURE.md` - Diagrammes Mermaid (ERD, flux, C4)
- `04_API_GRAPHQL.md` - Schema GraphQL complet
- `05_BACKLOG.md` - User stories par phase (toutes terminees)
- `06_EVOLUTIONS.md` - Evolutions futures identifiees

## Licence

Projet prive - Tous droits reserves
