# SAND - Spécifications Techniques

---

## 1. Stack technique

### 1.1 Backend

| Composant | Technologie | Version | Justification |
|-----------|-------------|---------|---------------|
| Framework | Laravel | 11+ | Écosystème riche, Eloquent ORM expressif |
| API | GraphQL (Lighthouse) | 6+ | Flexibilité, typage fort, introspection |
| ORM | Eloquent | - | Intégré Laravel, syntaxe fluide |
| Auth | Laravel Sanctum | - | SPA auth avec cookies, CSRF |
| BDD | PostgreSQL | 16+ | Robuste, JSON, arrays, performances |

### 1.2 Frontend

| Composant | Technologie | Justification |
|-----------|-------------|---------------|
| Framework | React | 18+ | Composants réutilisables, écosystème |
| State | Zustand | Léger, simple, performant |
| GraphQL Client | Apollo Client | Cache intelligent, hooks React |
| UI | Tailwind CSS + Headless UI | Flexibilité, responsive, accessibilité |
| Formulaires | React Hook Form | Performance, validation intégrée |
| Graphiques | Recharts | Composants React natifs |

### 1.3 Outils de développement

| Outil | Usage |
|-------|-------|
| Docker | Environnement local conteneurisé |
| Postman / Insomnia | Tests API GraphQL |
| PHPUnit | Tests unitaires backend |
| Vitest | Tests frontend |
| Laravel Pint | Linting PHP |
| ESLint + Prettier | Linting JS/TS |

---

## 2. Décisions techniques

### 2.1 Authentification

**Choix : Sanctum SPA Auth (cookies + CSRF)**

- Mode SPA avec cookies de session
- Protection CSRF automatique
- Pas de gestion de refresh token côté client
- Simple pour un projet local/démo

```php
// config/sanctum.php
'stateful' => explode(',', env('SANCTUM_STATEFUL_DOMAINS', 'localhost,127.0.0.1')),
```

### 2.2 Arborescence des activités

**Choix : Path matérialisé en base**

Ajout d'un champ `path` dans la table `activities` pour faciliter :
- Le tri hiérarchique
- Les requêtes de descendants
- L'affichage de l'arbre

```sql
-- Exemple de path
| id | name       | parent_id | path    |
|----|------------|-----------|---------|
| 1  | Dev        | NULL      | 1       |
| 2  | Backend    | 1         | 1.2     |
| 3  | API        | 2         | 1.2.3   |
| 4  | Frontend   | 1         | 1.4     |
```

**Avantages :**
- Tri simple : `ORDER BY path`
- Descendants : `WHERE path LIKE '1.2.%'`
- Pas de récursion nécessaire côté GraphQL

### 2.3 Activité "Absence"

**Choix : Activité normale dans l'arborescence (seed)**

- Créée par le seeder initial
- Flag `is_system = true` pour empêcher la suppression
- Toujours activée automatiquement sur tous les projets

```php
// database/seeders/ActivitySeeder.php
Activity::create([
    'name' => 'Absence',
    'parent_id' => null,
    'is_system' => true,
    'is_active' => true,
]);
```

### 2.4 Soft Delete

**Choix : Soft delete sur les entités principales**

Tables concernées :
- `users`
- `projects`
- `activities`
- `time_entries`

```php
// Migration
$table->softDeletes(); // Ajoute deleted_at

// Model
use SoftDeletes;
```

**Avantages :**
- Préserve l'intégrité des stats historiques
- Possibilité de restauration
- Pas de cascade de suppression accidentelle

### 2.5 Notifications

**Choix : Rafraîchissement au chargement de page**

- Pas de WebSocket/Pusher (trop complexe pour v1)
- Les notifications sont chargées à chaque navigation
- Suffisant pour le cas d'usage (pas de temps réel critique)

### 2.6 Export CSV

**Choix : Génération asynchrone (Job Queue)**

- Les gros exports peuvent timeout en synchrone
- Job Laravel dispatché à la demande
- Fichier stocké temporairement
- Notification à l'utilisateur quand prêt
- Lien de téléchargement avec expiration

```php
// ExportController.php
ExportTimeEntriesJob::dispatch($user, $filters);
return response()->json(['message' => 'Export en cours...']);
```

---

## 3. Base de données

### 3.1 Tables principales

| Table | Description |
|-------|-------------|
| `users` | Utilisateurs (soft delete) |
| `teams` | Équipes/Services |
| `projects` | Projets (soft delete) |
| `activities` | Arborescence globale (soft delete, path matérialisé) |
| `project_activities` | Activation tri-state par projet |
| `activity_user_visibilities` | Masquage par user ET par projet |
| `project_moderators` | Modérateurs assignés aux projets |
| `time_entries` | Saisies de temps (soft delete, unique constraint) |
| `time_entry_logs` | Historique des modifications |
| `absences` | Absences importées (peut être 0.5 ETP) |
| `notifications` | Notifications utilisateur |
| `settings` | Paramètres système (clé/valeur JSON) |

### 3.2 Contraintes importantes

**Unicité TimeEntry :**
```sql
UNIQUE (user_id, date, activity_id, project_id, deleted_at)
```

**Index pour performances :**
```sql
-- Recherche par période
CREATE INDEX idx_time_entries_date ON time_entries(date);

-- Arborescence
CREATE INDEX idx_activities_path ON activities(path);
CREATE INDEX idx_activities_parent ON activities(parent_id);

-- Notifications non lues
CREATE INDEX idx_notifications_unread ON notifications(user_id, is_read) WHERE is_read = false;
```

### 3.3 Types PostgreSQL

| Champ | Type | Raison |
|-------|------|--------|
| `duration` | `DECIMAL(3,2)` | Précision 2 décimales, max 9.99 |
| `data` (notifications) | `JSONB` | Flexibilité, indexable |
| `value` (settings) | `JSONB` | Valeurs complexes possibles |
| `path` (activities) | `VARCHAR(255)` | Path matérialisé "1.2.3" |

---

## 4. Sécurité

### 4.1 Authentification

- Cookies HttpOnly + Secure
- Protection CSRF via Sanctum
- Rate limiting sur login (5 tentatives/minute)

### 4.2 Autorisations

Policies Laravel pour chaque ressource :

```php
// TimeEntryPolicy.php
public function update(User $user, TimeEntry $entry): bool
{
    // Owner ou modérateur du projet
    return $user->id === $entry->user_id
        || $entry->project->moderators->contains($user);
}
```

### 4.3 Validation

- Validation côté serveur **systématique** (FormRequest)
- Règles métier encapsulées dans des Services
- Échappement automatique des sorties (Blade/React)

---

## 5. Environnement Docker

### 5.1 Services

```yaml
# docker-compose.yml
services:
  app:
    build: ./docker/php
    volumes:
      - ./backend:/var/www/html
    depends_on:
      - postgres

  nginx:
    image: nginx:alpine
    ports:
      - "8080:80"
    volumes:
      - ./docker/nginx/default.conf:/etc/nginx/conf.d/default.conf

  postgres:
    image: postgres:16-alpine
    environment:
      POSTGRES_DB: sand
      POSTGRES_USER: sand
      POSTGRES_PASSWORD: secret
    volumes:
      - postgres_data:/var/lib/postgresql/data
    ports:
      - "5432:5432"

  node:
    build: ./docker/node
    volumes:
      - ./frontend:/app
    ports:
      - "5173:5173"
    command: npm run dev

  redis:
    image: redis:alpine
    ports:
      - "6379:6379"

  mock-rh:
    build: ./docker/mock-rh
    ports:
      - "3001:3001"

volumes:
  postgres_data:
```

### 5.2 Configuration locale

```bash
# .env (backend)
APP_URL=http://localhost:8080
SANCTUM_STATEFUL_DOMAINS=localhost:5173

DB_CONNECTION=pgsql
DB_HOST=postgres
DB_PORT=5432
DB_DATABASE=sand
DB_USERNAME=sand
DB_PASSWORD=secret

QUEUE_CONNECTION=redis
REDIS_HOST=redis
```

---

## 6. Performance

### 6.1 Cache

- Cache de l'arborescence des activités (invalidé à la modification)
- Cache des settings système
- Apollo Client cache côté frontend

### 6.2 Requêtes optimisées

- Eager loading des relations (`with()`)
- Pagination sur les listes
- Index sur les colonnes de recherche fréquente

### 6.3 Lighthouse (GraphQL)

```php
// lighthouse.php
'batched_queries' => true,
'query_cache' => [
    'enable' => env('LIGHTHOUSE_QUERY_CACHE', true),
    'ttl' => 3600,
],
```

---

*Document v1.0 - Janvier 2025*
