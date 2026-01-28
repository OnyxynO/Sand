# SAND - Saisie d'Activité Numérique Déclarative

Application web de saisie d'activités professionnelles permettant aux collaborateurs de déclarer leur temps de travail par projet.

## Stack technique

| Couche | Technologies |
|--------|--------------|
| Backend | Laravel 11, PHP 8.3, Lighthouse (GraphQL), Sanctum |
| Frontend | React 18, TypeScript, Apollo Client, Tailwind CSS, Zustand |
| Base de données | PostgreSQL 16 |
| Cache/Queue | Redis |
| Conteneurisation | Docker, Docker Compose |

## Prérequis

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

# Installer les dépendances backend
docker-compose exec app composer install

# Générer la clé d'application Laravel
docker-compose exec app php artisan key:generate

# Exécuter les migrations
docker-compose exec app php artisan migrate --seed

# Installer les dépendances frontend
docker-compose exec frontend npm install
```

## Accès

- **API Backend** : http://localhost:8080
- **GraphQL Playground** : http://localhost:8080/graphiql
- **Frontend** : http://localhost:5173
- **Mock API RH** : http://localhost:3001

## Documentation

La documentation complète se trouve dans le dossier `/docs/` :

- `01_SPEC_FONCTIONNELLE.md` - Règles métier, rôles, fonctionnalités
- `02_SPEC_TECHNIQUE.md` - Stack, décisions techniques, schéma BDD
- `03_ARCHITECTURE.md` - Diagrammes Mermaid (ERD, flux, C4)
- `04_API_GRAPHQL.md` - Schéma GraphQL complet
- `05_BACKLOG.md` - User stories par phase

## Commandes utiles

```bash
# Logs des conteneurs
docker-compose logs -f

# Accès au conteneur PHP
docker-compose exec app bash

# Tests backend
docker-compose exec app php artisan test

# Tests frontend
docker-compose exec frontend npm run test

# Linting
docker-compose exec app ./vendor/bin/pint
docker-compose exec frontend npm run lint
```

## Licence

Projet privé - Tous droits réservés
