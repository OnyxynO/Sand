# Audit Sécurité — SAND

**Date** : 2026-02-19
**Stack** : React 19 + Apollo Client 4 + Vite 7 | Laravel 12 + Lighthouse 6 + Sanctum | PostgreSQL 16 + Redis 7 | Docker + Nginx

---

## Résumé des findings

| Sévérité | Nombre | Statut |
|---|---|---|
| Critique | 4 | Corrigées (T-01, T-02, T-03) |
| Moyen | 9 | Corrigées (T-04 à T-09) sauf M-08 npm (devDependencies, non déployées) |
| Faible | 3 | Corrigées (T-11 en prod, T-12) |

---

## Vulnérabilités critiques

### C-01 — Token Sanctum stocké dans localStorage

**Fichiers** : `frontend/src/graphql/client.ts:9,13` · `frontend/src/stores/authStore.ts`

Le token Sanctum est stocké dans `localStorage` via `setToken()` → `localStorage.setItem('sand_auth_token', token)`. En cas de XSS, ce token est lisible et volable par du code JavaScript tiers. Or le CLAUDE.md indique "Auth: Sanctum SPA avec cookies HttpOnly + CSRF (pas de JWT)" — ce contrat n'est pas respecté.

Le client Apollo envoie actuellement **les deux** : les cookies (`credentials: 'include'`) ET un header `Authorization: Bearer ${token}`. Cette dualité est inutile et dangereuse.

**Correction** : supprimer entièrement le Bearer token. Utiliser uniquement les cookies Sanctum. Voir tâche T-01.

---

### C-02 — Aucun rate limiting sur le login GraphQL

**Fichier** : `backend/bootstrap/app.php:13`

La mutation GraphQL `login` n'est protégée par aucun middleware de limitation de débit. Un attaquant peut faire du brute force sur les identifiants sans contrainte.

**Correction** : voir tâche T-02.

---

### C-03 — GraphQL depth et complexity illimités

**Fichier** : `backend/config/lighthouse.php:227-228`

```php
'max_query_complexity' => GraphQL\Validator\Rules\QueryComplexity::DISABLED,
'max_query_depth' => GraphQL\Validator\Rules\QueryDepth::DISABLED,
```

Une requête GraphQL profondément imbriquée peut provoquer une surcharge serveur (DoS applicatif). Sans limite, un seul utilisateur peut paralyser l'API.

**Correction** : voir tâche T-03.

---

### C-04 — Introspection GraphQL activée par défaut

**Fichier** : `backend/config/lighthouse.php:229`

```php
'disable_introspection' => env('LIGHTHOUSE_SECURITY_DISABLE_INTROSPECTION', false)
```

L'introspection révèle le schéma complet : tous les types, mutations, champs et arguments. C'est un plan détaillé offert à un attaquant.

**Correction** : voir tâche T-03.

---

## Vulnérabilités moyennes

### M-01 — PostgreSQL port 5432 exposé sur l'hôte

**Fichier** : `docker-compose.yml:54`

En production, la base de données ne doit pas être accessible depuis l'extérieur du réseau Docker. Ce port exposé permet des tentatives de connexion directe.

---

### M-02 — Redis port 6379 exposé sans mot de passe

**Fichier** : `docker-compose.yml:72-76` · `backend/.env.example: REDIS_PASSWORD=null`

Redis sans authentification exposé sur le réseau hôte est accessible à quiconque peut atteindre la machine.

---

### M-03 — Aucun header HTTP de sécurité dans Nginx

**Fichier** : `docker/nginx/conf.d/app.conf`

Aucun des headers de sécurité standard n'est configuré : pas de CSP, X-Frame-Options, HSTS, X-Content-Type-Options. Le navigateur ne reçoit aucune directive de protection.

---

### M-04 — SESSION_SECURE_COOKIE sans valeur par défaut

**Fichier** : `backend/config/session.php:172`

```php
'secure' => env('SESSION_SECURE_COOKIE'),
```

Sans valeur par défaut, retourne `null` → falsy. Le cookie de session peut être transmis en HTTP non chiffré si la variable n'est pas définie.

---

### M-05 — Endpoint /api/health public (information disclosure)

**Fichier** : `backend/routes/web.php:14`

`/api/health` retourne l'état de la base de données et de Redis sans authentification. C'est une information utile pour cartographier l'infrastructure cible.

---

### M-06 — Aucun .dockerignore

Aucun fichier `.dockerignore` n'existe. Lors du build Docker, le contexte entier est envoyé au daemon, incluant potentiellement `.env`, `vendor/`, `node_modules/`.

---

### M-07 — Origines CORS de développement hardcodées

**Fichier** : `backend/config/cors.php:25-28`

Les ports 5174-5178 sont des origines de développement codées en dur, absentes de la config via variable d'environnement.

---

### M-08 — npm : 12 vulnérabilités High (minimatch ReDoS)

**Packages** : `minimatch < 10.2.1` et `ajv < 8.18.0` via eslint / typescript-eslint / graphql-codegen.

Toutes dans les `devDependencies` (non déployées en production), mais la chaîne de build est exposée.

---

### M-09 — composer : 2 vulnérabilités Medium

- `psy/psysh` : CVE-2026-25129 — Local Privilege Escalation via `.psysh.php`
- `symfony/process` : CVE-2026-24739 — argument escaping sous Windows (MSYS2/Git Bash)

Dev dependencies, impact limité en contexte Linux.

---

## Vulnérabilités faibles

### F-01 — Sessions non chiffrées en base

**Fichier** : `backend/config/session.php:50` — `SESSION_ENCRYPT=false`

Les données de session sont stockées en clair dans PostgreSQL.

---

### F-02 — allowed_methods wildcard avec credentials

**Fichier** : `backend/config/cors.php:20` — `'allowed_methods' => ['*']`

Toutes les méthodes HTTP acceptées cross-origin avec credentials. Inutilement permissif.

---

### F-03 — APP_DEBUG=true dans .env.example

**Fichier** : `backend/.env.example:4`

Si copié sans modification en production, le mode debug expose stack traces et variables dans les réponses HTTP.

---

## Points positifs

- Aucune utilisation de `dangerouslySetInnerHTML` dans le code React — risque XSS frontend nul
- CORS avec origines explicites, aucun wildcard `*` sur les origines
- Dockerfile utilise un utilisateur non-root `sand` (`docker/php/Dockerfile:35`)
- `.gitignore` complet : `.env` et `.env.local` correctement exclus du dépôt
- Bcrypt avec 12 rounds configuré (`BCRYPT_ROUNDS=12`)
- `DB::statement` dans `ActivityMutator` utilise des bindings `?` paramétrés — pas d'injection SQL
- `DB::raw` uniquement pour des alias SQL statiques sans données utilisateur
- Vérification de l'ownership avant téléchargement d'export (`routes/web.php:53`)
- Cookie session `HttpOnly: true` et `SameSite: lax` par défaut

---

## Tâches de correction

### T-01 — Supprimer le token du localStorage (C-01) ✓ TERMINÉE

**Priorité** : P0 · **Effort** : ~2h · **Statut** : Implémentée le 2026-02-19

L'authentification doit reposer uniquement sur les cookies Sanctum. Supprimer tout le système Bearer token.

**Étape 1 — `frontend/src/graphql/client.ts`**

Supprimer les lignes 1-36 et remplacer par :

```ts
import { ApolloClient, InMemoryCache, createHttpLink } from '@apollo/client';

const httpLink = createHttpLink({
  uri: import.meta.env.VITE_API_URL || 'http://localhost:8080/graphql',
  credentials: 'include',
});

export const apolloClient = new ApolloClient({
  link: httpLink,
  cache: new InMemoryCache({
    typePolicies: {
      User: { keyFields: ['id'] },
      Project: { keyFields: ['id'] },
      Activity: { keyFields: ['id'] },
      Team: { keyFields: ['id'] },
      TimeEntry: { keyFields: ['id'] },
      Absence: { keyFields: ['id'] },
      Notification: { keyFields: ['id'] },
      Setting: { keyFields: ['id'] },
    },
  }),
  defaultOptions: {
    watchQuery: { fetchPolicy: 'cache-and-network' },
  },
});
```

**Étape 2 — `frontend/src/stores/authStore.ts`**

Retirer les imports et usages de `setToken`, `removeToken`, `getToken` :

```ts
import { create } from 'zustand';
import type { Utilisateur } from '../types';

interface AuthState {
  utilisateur: Utilisateur | null;
  estConnecte: boolean;
  chargement: boolean;
  connecter: (utilisateur: Utilisateur) => void;
  deconnecter: () => void;
  setChargement: (chargement: boolean) => void;
  setUtilisateur: (utilisateur: Utilisateur | null) => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  utilisateur: null,
  estConnecte: false,
  chargement: true,
  connecter: (utilisateur) => {
    set({ utilisateur, estConnecte: true, chargement: false });
  },
  deconnecter: () => {
    set({ utilisateur: null, estConnecte: false, chargement: false });
  },
  setChargement: (chargement) => set({ chargement }),
  setUtilisateur: (utilisateur) =>
    set({ utilisateur, estConnecte: !!utilisateur, chargement: false }),
}));
```

**Étape 3 — `backend/app/GraphQL/Mutations/AuthMutator.php`**

Supprimer la création de token et le retour du token :

```php
public function login($root, array $args): array
{
    $email = trim($args['email']);
    $password = trim($args['password']);

    $user = User::where('email', $email)->first();

    if (!$user || !Hash::check($password, $user->password)) {
        throw new Error('Identifiants invalides.');
    }

    if (!$user->est_actif) {
        throw new Error('Ce compte a ete desactive.');
    }

    Auth::login($user);

    return ['user' => $user];
}
```

**Étape 4 — Schema GraphQL**

Dans `backend/graphql/schema.graphql`, mettre à jour le type de retour de `login` pour ne plus inclure le champ `token`.

**Étape 5 — `frontend/src/pages/LoginPage.tsx`**

S'assurer que l'appel à `connecter()` ne passe plus de token en argument :

```ts
authStore.connecter(data.login.user);
```

**Étape 6 — Migration des sessions existantes**

Ajouter un nettoyage one-shot dans `main.tsx` ou `App.tsx` :

```ts
localStorage.removeItem('sand_auth_token');
```

---

### T-02 — Rate limiting sur le login (C-02) ✓ TERMINÉE

**Priorité** : P0 · **Effort** : ~30min · **Statut** : Implémentée le 2026-02-19

**Option recommandée — Nginx (sans dépendance PHP)**

```nginx
# docker/nginx/conf.d/app.conf — ajouter avant le bloc server
limit_req_zone $binary_remote_addr zone=graphql:10m rate=30r/m;

# Dans le bloc location /graphql ou location ~* \.php$
limit_req zone=graphql burst=10 nodelay;
```

**Option alternative — middleware Laravel**

Dans `backend/config/lighthouse.php`, ajouter `'throttle:30,1'` dans la liste `middleware` de Lighthouse.

---

### T-03 — Protection GraphQL (C-03, C-04) ✓ TERMINÉE

**Priorité** : P0 · **Effort** : ~15min · **Statut** : Implémentée le 2026-02-19

**`backend/config/lighthouse.php`** :

```php
'security' => [
    'max_query_complexity' => 200,
    'max_query_depth' => 7,
    'disable_introspection' => (bool) env('LIGHTHOUSE_SECURITY_DISABLE_INTROSPECTION', false)
        ? GraphQL\Validator\Rules\DisableIntrospection::ENABLED
        : GraphQL\Validator\Rules\DisableIntrospection::DISABLED,
],
```

**`backend/.env`** (production) :

```
LIGHTHOUSE_SECURITY_DISABLE_INTROSPECTION=true
```

```bash
docker-compose exec app php artisan lighthouse:clear-cache
```

---

### T-04 — Headers sécurité Nginx (M-03) ✓ TERMINÉE

**Priorité** : P1 · **Effort** : ~20min · **Statut** : Implémentée le 2026-02-19 (dans app.conf avec T-02 et T-07)

**`docker/nginx/conf.d/app.conf`** — ajouter dans le bloc `server` :

```nginx
add_header X-Frame-Options "SAMEORIGIN" always;
add_header X-Content-Type-Options "nosniff" always;
add_header Referrer-Policy "strict-origin-when-cross-origin" always;
add_header Permissions-Policy "camera=(), microphone=(), geolocation=()" always;
add_header Content-Security-Policy "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data:; font-src 'self';" always;
# Décommenter uniquement si HTTPS est configuré :
# add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;
```

---

### T-05 — Retirer les ports DB/Redis (M-01, M-02) ✓ TERMINÉE

**Priorité** : P1 · **Effort** : ~10min · **Statut** : Implémentée le 2026-02-19 (ports retirés, override.yml créé)

**`docker-compose.yml`** — retirer les `ports` de `db` et `redis`, ajouter un mot de passe Redis :

```yaml
db:
  image: postgres:16-alpine
  # Supprimer la section ports entière
  environment:
    POSTGRES_PASSWORD: ${DB_PASSWORD}  # ne plus utiliser de valeur par défaut

redis:
  image: redis:7-alpine
  # Supprimer la section ports entière
  command: redis-server --requirepass ${REDIS_PASSWORD}
```

**`backend/.env.example`** :

```
REDIS_PASSWORD=changeme_in_production
```

Si l'accès local à PostgreSQL est nécessaire en développement, créer un `docker-compose.override.yml` :

```yaml
services:
  db:
    ports:
      - "5432:5432"
  redis:
    ports:
      - "6379:6379"
```

---

### T-06 — SESSION_SECURE_COOKIE par défaut (M-04) ✓ TERMINÉE

**Priorité** : P1 · **Effort** : ~5min · **Statut** : Implémentée le 2026-02-19

**`backend/config/session.php:172`** :

```php
'secure' => env('SESSION_SECURE_COOKIE', true),
```

**`backend/.env`** (développement local sans HTTPS) :

```
SESSION_SECURE_COOKIE=false
```

---

### T-07 — Restreindre /api/health (M-05) ✓ TERMINÉE

**Priorité** : P1 · **Effort** : ~15min · **Statut** : Implémentée le 2026-02-19 (restriction IP dans Nginx)

**Option A — Token secret** :

```php
// backend/routes/web.php
Route::get('/api/health', function () {
    $secret = env('HEALTH_CHECK_TOKEN');
    if ($secret && request()->header('X-Health-Token') !== $secret) {
        abort(401);
    }
    // ... reste du code identique
});
```

**Option B — Restriction IP dans Nginx** :

```nginx
location = /api/health {
    allow 127.0.0.1;
    allow 172.16.0.0/12;
    deny all;
    try_files $uri $uri/ /index.php?$query_string;
}
```

---

### T-08 — Créer .dockerignore (M-06) ✓ TERMINÉE

**Priorité** : P1 · **Effort** : ~5min · **Statut** : Implémentée le 2026-02-19

Créer `/.dockerignore` à la racine :

```
backend/.env
backend/.env.*
!backend/.env.example
backend/vendor/
frontend/node_modules/
frontend/dist/
*.log
backend/storage/logs/
.git/
.gitignore
backend/tests/
frontend/coverage/
frontend/playwright-report/
frontend/test-results/
.idea/
.vscode/
```

---

### T-09 — Nettoyer les origines CORS (M-07) ✓ TERMINÉE

**Priorité** : P1 · **Effort** : ~5min · **Statut** : Implémentée le 2026-02-19

**`backend/config/cors.php`** :

```php
'allowed_origins' => array_filter([
    env('FRONTEND_URL', 'http://localhost:5173'),
]),

'allowed_methods' => ['GET', 'POST', 'OPTIONS'],
```

---

### T-10 — Mettre à jour les dépendances (M-08, M-09) ✓ TERMINÉE (partielle)

**Priorité** : P2 · **Effort** : ~15min · **Statut** : Implémentée le 2026-02-19
- Backend : `composer audit` propre après `composer update psy/psysh symfony/process`
- Frontend : 13 vulnérabilités restantes dans devDependencies (ESLint, graphql-codegen) — non déployées, correction nécessite mises à jour majeures cassantes

```bash
# Frontend
docker-compose exec frontend npm audit fix
docker-compose exec frontend npm run test:run

# Backend
docker-compose exec app composer update psy/psysh symfony/process
docker-compose exec app php artisan test
```

---

### T-11 — Chiffrement des sessions (F-01)

**Priorité** : P2 · **Effort** : ~5min · **Statut** : À activer en production uniquement (SESSION_ENCRYPT=true dans .env prod — invalide les sessions existantes)

**`backend/.env`** (production) :

```
SESSION_ENCRYPT=true
```

Note : les sessions existantes seront invalidées au déploiement. Les utilisateurs devront se reconnecter.

---

### T-12 — Corrections mineures (F-02, F-03) ✓ TERMINÉE

**Priorité** : P2 · **Effort** : ~5min · **Statut** : Implémentée le 2026-02-19

**`backend/.env.example`** :

```
APP_DEBUG=false
```

**`backend/config/cors.php`** :

```php
'allowed_methods' => ['GET', 'POST', 'OPTIONS'],
```
