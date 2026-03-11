# SAND v2 Workspace

Ce dossier est une copie de travail isolee du projet SAND pour un refacto de fond.

## Garanties

- aucun push vers le depot de production n'est possible depuis cette copie
- la branche locale de travail est `codex/sand-v2`
- le remote `upstream` est configure en lecture seule pour les fetchs

## Demarrage

### Frontend

Le dossier `frontend/node_modules` est symlinkable vers le projet source pour accelerer l'exploration,
mais la version propre pour une execution autonome reste :

```bash
cd frontend
npm install
npm run dev
```

### Backend

Le dossier `backend/vendor` peut aussi etre symlinkable temporairement, mais pour une execution autonome :

```bash
cd backend
composer install
cp .env.example .env
php artisan key:generate
php artisan serve --host=0.0.0.0 --port=8080
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

## Intention architecture

- `frontend/src/features/` contient la structure v2 cible par domaines metier
- les anciens dossiers `pages/`, `components/`, `hooks/` restent presents pour compatibilite progressive
- les nouvelles extractions backend vont dans `backend/app/Services/`
