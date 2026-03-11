# SAND v2 Workspace

Ce dossier est une copie de travail isolee du projet SAND pour un refacto de fond.

## Garanties

- aucun push vers le depot de production n'est possible depuis cette copie
- la branche locale de travail est `codex/sand-v2`
- le remote `upstream` est configure en lecture seule pour les fetchs

## Demarrage

### Frontend

```bash
cd frontend
npm install
npm run dev
```

### Backend

```bash
cd backend
composer install
cp .env.v2.local.example .env
cp .env.testing.v2.local.example .env.testing
php artisan key:generate
php artisan serve --host=0.0.0.0 --port=8080
```

### Bootstrap rapide

```bash
bash scripts/bootstrap-v2.sh
bash scripts/reset-v2-test-db.sh
```

## Configuration locale recommandee

Dans `backend/.env` pour un dev natif :

```env
APP_URL=http://localhost:8080
FRONTEND_URL=http://localhost:5173
SANCTUM_STATEFUL_DOMAINS=localhost:5173
DB_HOST=127.0.0.1
REDIS_CLIENT=predis
REDIS_HOST=127.0.0.1
CACHE_STORE=redis
```

Dans `backend/.env.testing` :

```env
DB_HOST=127.0.0.1
DB_DATABASE=sand_v2_test
DB_USERNAME=sand
DB_PASSWORD=secret
QUEUE_CONNECTION=sync
CACHE_STORE=array
```

Pre-requis PostgreSQL :

- la base applicative `sand_v2` doit exister pour le run local
- la base `sand_v2_test` doit exister pour `php artisan test`
- dans l'etat actuel, le role `sand` ne cree pas lui-meme les bases; il faut donc les creer une fois avec un role PostgreSQL plus privilege
- le script `scripts/reset-v2-test-db.sh` recree proprement `sand_v2_test` avec les binaires Homebrew PostgreSQL

Dans `frontend/.env.local` :

```env
VITE_API_URL=http://localhost:8080/graphql
```

## Intention architecture

- `frontend/src/features/` contient la structure v2 cible par domaines metier
- les anciens dossiers `pages/`, `components/`, `hooks/` restent presents pour compatibilite progressive
- les nouvelles extractions backend vont dans `backend/app/Services/`
- `backend/.env.v2.local.example` et `frontend/.env.v2.local.example` sont les points de depart de la copie v2
- `backend/.env.testing.v2.local.example` sert de base au contexte PHPUnit local
