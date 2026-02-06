# Journal de diffusion - SAND

Ce document repertorie les problemes rencontres lors du developpement et leurs solutions, afin de faciliter l'installation sur une configuration neuve.

---

## Problemes rencontres et solutions

### Phase 1 - Initialisation

#### 1. Version PHP locale vs Docker
- **Probleme** : PHP 8.5 installe localement (via Homebrew), mais Docker utilisait PHP 8.3
- **Symptome** : `composer install` local creait un `composer.lock` incompatible avec le conteneur
- **Solution** : Toujours executer `composer install` dans le conteneur Docker, pas en local

#### 2. Laravel 12 vs Laravel 11
- **Probleme** : La spec mentionnait Laravel 11, mais `composer create-project` a installe Laravel 12
- **Impact** : Laravel 12 requiert PHP 8.4+, pas PHP 8.3
- **Solution** : Accepte Laravel 12, mis a jour le Dockerfile PHP

---

### Phase 2 - Docker et API

#### 3. Conteneur frontend en boucle de redemarrage
- **Probleme** : Le conteneur frontend redemarrait en boucle
- **Symptome** : `docker-compose ps` montrait "Restarting" en continu
- **Cause** : `npm run dev` echouait car node_modules n'existait pas
- **Solution** : Cree un script `docker/node/entrypoint.sh` qui fait `npm install` si necessaire
- **Fichiers modifies** :
  - `docker/node/entrypoint.sh` (nouveau)
  - `docker/node/Dockerfile` (ajout ENTRYPOINT)

#### 4. Format de fin de ligne CRLF sur scripts shell
- **Probleme** : Le script entrypoint.sh ne s'executait pas
- **Symptome** : `exec format error` ou `no such file or directory`
- **Cause** : Fichier cree avec des fins de ligne Windows (CRLF) au lieu de Unix (LF)
- **Solution** : `sed -i '' 's/\r$//' entrypoint.sh` ou configurer l'editeur
- **Prevention** : Ajouter `*.sh text eol=lf` dans `.gitattributes`

#### 5. PHP 8.3 incompatible avec Laravel 12
- **Probleme** : Erreur au demarrage de l'application
- **Symptome** : `Composer detected issues in your platform`
- **Cause** : Laravel 12 et ses dependances requierent PHP 8.4+
- **Solution** : Modifier `docker/php/Dockerfile` : `FROM php:8.4-fpm`

#### 6. Configuration .env incorrecte pour Docker
- **Probleme** : L'application ne pouvait pas se connecter a la base de donnees
- **Symptome** : `Connection refused` sur 127.0.0.1:5432
- **Cause** : Les hosts dans `.env` pointaient vers `127.0.0.1` au lieu des noms de services Docker
- **Solution** : Modifier `.env` :
  ```
  DB_HOST=db          # au lieu de 127.0.0.1
  REDIS_HOST=redis    # au lieu de 127.0.0.1
  RH_API_URL=http://mock-rh:3001/api  # au lieu de localhost
  ```
- **Note** : Le fichier `.env.example` doit etre mis a jour avec ces valeurs

#### 7. GraphiQL non installe
- **Probleme** : La route `/graphiql` retournait 404
- **Cause** : Dans les versions recentes de Lighthouse, GraphiQL est un package separe
- **Solution** : `composer require mll-lab/laravel-graphiql --dev`

#### 8. Guard Lighthouse non configure pour Sanctum
- **Probleme** : `me` retournait `null` meme avec un token valide
- **Cause** : Lighthouse utilisait le guard par defaut "web" au lieu de "sanctum"
- **Solution** : Dans `config/lighthouse.php` : `'guards' => ['sanctum']`

#### 9. Directive @whereHas invalide
- **Probleme** : Erreur de schema GraphQL au demarrage
- **Symptome** : `Unknown directive "@whereHas"`
- **Cause** : `@whereHas` n'est pas une directive standard de Lighthouse
- **Solution** : Remplacer par `@builder` avec une classe custom
- **Fichiers** :
  - `graphql/queries/queries.graphql` (modifie)
  - `app/GraphQL/Builders/ProjectBuilder.php` (nouveau)

#### 10. Validation "date" sur type Date GraphQL
- **Probleme** : Erreur lors de la creation de saisies
- **Symptome** : `Object of class DateFactory could not be converted to string`
- **Cause** : La regle `@rules(apply: ["date"])` sur un type `Date!` cause un conflit
- **Solution** : Retirer la regle "date" car le scalaire Date valide deja le format
- **Fichier** : `graphql/inputs/time_entry.graphql`

#### 11. Colonne "etp" vs "duree"
- **Probleme** : Erreurs SQL dans les statistiques
- **Symptome** : `column "etp" does not exist`
- **Cause** : Le code utilisait `etp` mais la colonne s'appelle `duree`
- **Solution** : Remplacer toutes les occurrences de `etp` par `duree`
- **Fichiers** :
  - `app/GraphQL/Queries/StatistiquesQuery.php`
  - `app/GraphQL/Queries/AnomaliesQuery.php`

#### 12. Auth::logout() incompatible avec Sanctum
- **Probleme** : Erreur lors du logout
- **Symptome** : `Method RequestGuard::logout does not exist`
- **Cause** : Le guard Sanctum est stateless, pas de methode logout()
- **Solution** : Supprimer l'appel `Auth::logout()`, la revocation du token suffit
- **Fichier** : `app/GraphQL/Mutations/AuthMutator.php`

---

### Phase 3 - Interface de saisie

(Pas de problemes specifiques documentes)

### Phase 4 - Migration ltree et optimisations

#### 17. Migration vers ltree PostgreSQL
- **Objectif** : Optimiser les requêtes d'arborescence (descendants, ancêtres)
- **Changements** :
  - Extension ltree activée
  - Colonne `chemin` convertie de VARCHAR à ltree
  - Colonne `niveau` supprimée (calculée dynamiquement via `nlevel(chemin) - 1`)
  - Index GiST créé pour les opérateurs ltree
- **Fichiers modifiés** :
  - `database/migrations/2026_01_31_100000_update_activities_to_ltree.php` (nouveau)
  - `app/Models/Activity.php` (accesseur niveau, méthodes ltree)
  - `app/GraphQL/Mutations/ActivityMutator.php` (optimisations)
  - `database/seeders/ActivitySeeder.php`
  - `database/factories/ActivityFactory.php`

#### 18. Tests avec PostgreSQL au lieu de SQLite
- **Problème** : ltree est une extension PostgreSQL, incompatible avec SQLite
- **Solution** : Modifier `phpunit.xml` pour utiliser PostgreSQL avec base `sand_test`
- **Fichiers modifiés** :
  - `backend/phpunit.xml`
  - `tests/Feature/AuthGraphQLTest.php` (retrait ID forcé)

#### 19. Model events pour est_feuille
- **Problème** : est_feuille non recalculé après suppression/restauration
- **Solution** : Ajout de `booted()` avec événements `deleted` et `restored`
- **Fichier** : `app/Models/Activity.php`

---

#### 13. Apollo Client 4.x - Imports des hooks React
- **Probleme** : Erreur de compilation `Module '@apollo/client' has no exported member 'useQuery'`
- **Cause** : Apollo Client 4.x a separe les hooks React dans un sous-module
- **Solution** : Importer depuis `@apollo/client/react` au lieu de `@apollo/client`
- **Exemple** :
  ```typescript
  // Avant (Apollo 3.x)
  import { useQuery, useMutation } from '@apollo/client';
  // Apres (Apollo 4.x)
  import { useQuery, useMutation } from '@apollo/client/react';
  ```

#### 14. Apollo Client 4.x - useLazyQuery sans callbacks
- **Probleme** : Erreur `'onCompleted' does not exist in type 'Options'`
- **Cause** : Apollo Client 4.x a supprime les callbacks `onCompleted` et `onError` de `useLazyQuery`
- **Solution** : Utiliser des `useEffect` pour reagir aux changements de `data` et `error`
- **Exemple** :
  ```typescript
  const [fetch, { data, error }] = useLazyQuery(QUERY);
  useEffect(() => { if (data) handleData(data); }, [data]);
  useEffect(() => { if (error) handleError(error); }, [error]);
  ```

#### 15. CORS - Ports de dev alternatifs non autorises
- **Probleme** : `NetworkError when attempting to fetch resource` lors du login
- **Cause** : Vite utilise des ports alternatifs (5174, 5175...) si 5173 est occupe
- **Solution** : Ajouter les ports alternatifs dans `backend/config/cors.php`
- **Fichiers modifies** :
  - `backend/config/cors.php` - ajout ports 5174, 5175
  - `backend/.env` - ajout dans SANCTUM_STATEFUL_DOMAINS

#### 16. Hot reload Vite non fiable (BUG-001)
- **Probleme** : Modifications de code non appliquees malgre le HMR
- **Symptome** : Le log Vite montre "hmr update" mais le navigateur garde l'ancien code
- **Statut** : Non resolu
- **Workaround** : Hard refresh (Ctrl+Shift+R) ou relancer le serveur
- **Ref** : `TODO_BUGS.md#BUG-001`

---

### Phase 5 - Tests et qualite

#### 20. Directive @rename transforme les cles de $args
- **Probleme** : Toutes les mutations custom echouaient (5 mutators)
- **Symptome** : `Undefined array key "userId"`, valeurs ignorees (`estActif` toujours true)
- **Cause** : `@rename(attribute: "snake_case")` sur les champs input avec `@spread` transforme les cles en snake_case dans `$args`. Les mutators utilisaient des cles camelCase.
- **Impact** : Bug critique en production (createAbsence, updateUser, createProject, etc.)
- **Solution** : Utiliser les cles snake_case dans tous les mutators
- **Fichiers corriges** :
  - `app/GraphQL/Mutations/ActivityMutator.php`
  - `app/GraphQL/Mutations/UserMutator.php`
  - `app/GraphQL/Mutations/AbsenceMutator.php`
  - `app/GraphQL/Mutations/ProjectMutator.php`

#### 21. Activity::create() ignore l'id explicite
- **Probleme** : L'id calcule n'etait pas utilise, chemin incoherent
- **Cause** : `id` n'est pas dans `$fillable` du model Activity
- **Solution** : Remplacer `Activity::create()` par `Activity::forceCreate()`
- **Fichier** : `app/GraphQL/Mutations/ActivityMutator.php`

#### 22. Directive @delete + @can = "Would modify all models"
- **Probleme** : Suppression d'equipe echouait systematiquement
- **Symptome** : `Would modify all models, use an argument to filter.`
- **Cause** : Conflit entre `@delete` et `@can` dans Lighthouse (v6.64.2)
- **Solution** : Remplacer `@delete` par `@field(resolver: "TeamMutator@delete")` avec un mutator custom
- **Fichiers** :
  - `graphql/mutations/team.graphql` (modifie)
  - `app/GraphQL/Mutations/TeamMutator.php` (nouveau)
  - `app/Policies/TeamPolicy.php` (signature delete modifiee)

#### 23. Cache schema Lighthouse
- **Probleme** : Modifications du schema .graphql non prises en compte dans les tests
- **Cause** : Lighthouse met en cache l'AST du schema GraphQL
- **Solution** : `php artisan lighthouse:clear-cache` apres toute modification de fichiers .graphql
- **Important** : A executer dans Docker (`docker-compose exec app ...`)

#### 24. JSON scalar rejette les entiers bruts
- **Probleme** : Mutation updateSetting echouait avec une valeur entiere
- **Symptome** : `Variable "$valeur" got invalid value 60; Expected type "JSON"`
- **Solution** : Passer les valeurs en string (`'60'` au lieu de `60`)

#### 25. AbsencePolicy::resolveConflict manquant
- **Probleme** : Resolution de conflit absence/saisie echouait
- **Cause** : La methode `resolveConflict` n'existait pas dans AbsencePolicy
- **Solution** : Ajout de la methode dans `app/Policies/AbsencePolicy.php`

#### 26. Setting::clearCache() inexistant
- **Probleme** : Mutations de settings echouaient
- **Cause** : SettingMutator appelait `Setting::clearCache()` mais la methode s'appelle `invaliderToutLeCache()`
- **Solution** : Corriger les 2 appels dans `app/GraphQL/Mutations/SettingMutator.php`

#### 27. Apollo Client 4 - MockedProvider supprime
- **Probleme** : Tous les tests de pages frontend echouaient avec `Element type is invalid: expected a string... but got: undefined`
- **Cause** : `MockedProvider` a ete retire de `@apollo/client/testing` en Apollo Client 4.x. Seuls `MockLink`, `MockSubscriptionLink` et `realisticDelay` sont exportes.
- **Solution** : Creer un utilitaire `renderAvecApollo.tsx` qui construit manuellement `MockLink` + `ApolloClient` + `ApolloProvider`
- **Fichier cree** : `frontend/src/test/renderAvecApollo.tsx`
- **Impact** : Tous les tests de composants utilisant des queries GraphQL

#### 28. Apollo Client 4 - Hooks dans @apollo/client/react
- **Probleme** : `useQuery`, `useMutation` sont `undefined` quand importes depuis `@apollo/client` en mode test (Vitest SSR/CJS)
- **Cause** : Apollo Client 4.x a deplace les hooks React dans `@apollo/client/react`. En mode dev (Vite ESM), les re-exports fonctionnent grace a l'optimizer. En mode test, non.
- **Symptome** : Fonctionne en dev, echoue dans les tests. `skipLibCheck: true` dans tsconfig masquait l'erreur a la compilation.
- **Solution** : Importer les hooks depuis `@apollo/client/react` dans les fichiers source (pas seulement les tests)
- **Fichiers corriges** :
  - `frontend/src/pages/DashboardPage.tsx`
  - `frontend/src/pages/ExportPage.tsx`
  - `frontend/src/pages/StatsProjetPage.tsx`
  - `frontend/src/pages/StatsGlobalesPage.tsx`
  - `frontend/src/pages/admin/ConfigurationPage.tsx`

#### 29. Apollo Client 4 - __typename obligatoire dans les mocks
- **Probleme** : Les donnees mockees retournaient des proprietes `undefined` (ex: `<option> - </option>` au lieu de `<option>DEV - Equipe Dev</option>`)
- **Cause** : `InMemoryCache` normalise par `__typename:id`. Sans `__typename` dans les mocks, les objets normalises perdent leurs proprietes.
- **Solution** : Ajouter `__typename` a toutes les donnees mock. Le typename doit correspondre au type du schema GraphQL (`'Team'`, pas `'Equipe'`).
- **Piege** : `addTypename: false` sur MockLink empeche l'ajout aux requetes sortantes mais n'aide pas pour le cache

#### 30. Apollo Client 4 - Toutes les queries doivent etre mockees
- **Probleme** : Erreur `No more mocked responses for the query` sur certaines queries
- **Cause** : Un composant executant 3 queries necessite 3 mocks. Les queries non mockees bloquent le rendu.
- **Solution** : Mocker TOUTES les queries d'un composant, avec des variables exactes (pas de wildcard)
- **Piege** : Les dates dynamiques calculees par le composant doivent etre recalculees identiquement dans les mocks

#### 31. Heroicons et Recharts - SVG incompatible avec happy-dom
- **Probleme** : Erreurs de rendu SVG dans les tests Vitest avec happy-dom
- **Cause** : `@heroicons/react` et `recharts` generent du SVG que happy-dom ne gere pas
- **Solution** : Mocks globaux dans `frontend/src/test/setup.ts` avec `vi.mock()`
- **Detail** : Chaque icone mockee comme `React.createElement('span', ...)`, chaque composant recharts comme un `<div>`

#### 32. StatistiquesQuery - Mauvaise relation Eloquent
- **Probleme** : Stats par utilisateur retournaient une erreur
- **Cause** : `whereHas('user')` au lieu de `whereHas('utilisateur')` (noms de relations en francais)
- **Solution** : Corriger dans `app/GraphQL/Queries/StatistiquesQuery.php`

---

## Phase Bonus - Documentation et facilite d'installation

### Idees a implementer

#### 1. Mise a jour de `.env.example`
- [ ] Mettre les valeurs Docker par defaut (db, redis, mock-rh)
- [ ] Ajouter des commentaires explicatifs
- [ ] Documenter les deux modes : Docker vs local

#### 2. Creation d'un `README.md` complet
- [ ] Prerequis (Docker, Docker Compose, versions)
- [ ] Instructions d'installation pas a pas
- [ ] Commandes utiles
- [ ] Comptes de test
- [ ] Architecture du projet
- [ ] Troubleshooting des erreurs courantes

#### 3. Script d'installation automatise
- [ ] `scripts/install.sh` pour le setup initial
- [ ] Verification des prerequis
- [ ] Copie de .env.example vers .env
- [ ] Build des images Docker
- [ ] Execution des migrations et seeders
- [ ] Affichage des URLs d'acces

#### 4. Fichier `.gitattributes`
- [ ] Forcer LF sur les scripts shell : `*.sh text eol=lf`
- [ ] Gerer les fichiers binaires

#### 5. Healthcheck Docker
- [ ] Ajouter des healthchecks dans docker-compose.yml
- [ ] Attendre que PostgreSQL soit pret avant de lancer les migrations

#### 6. Documentation API
- [ ] Exporter le schema GraphQL
- [ ] Generer une documentation automatique (Spectaql ou similaire)

---

## Checklist d'installation (etat actuel)

Pour installer le projet sur une machine neuve :

```bash
# 1. Cloner le repo
git clone https://github.com/OnyxynO/Sand.git
cd Sand

# 2. Copier la config (ATTENTION: modifier les hosts!)
cp backend/.env.example backend/.env
# Editer backend/.env :
#   DB_HOST=db
#   REDIS_HOST=redis
#   RH_API_URL=http://mock-rh:3001/api

# 3. Lancer Docker
docker-compose up -d

# 4. Attendre que les conteneurs soient prets (30-60 sec)
docker-compose ps

# 5. Executer les migrations
docker-compose exec app php artisan migrate --seed

# 6. Acceder a l'application
# - API: http://localhost:8080/graphql
# - GraphiQL: http://localhost:8080/graphiql
# - Frontend: http://localhost:5173
```

---

## Historique des modifications

| Date | Phase | Probleme | Solution |
|------|-------|----------|----------|
| 2026-01-28 | 2 | Frontend restart loop | Ajout entrypoint.sh |
| 2026-01-28 | 2 | PHP 8.3 vs 8.4 | Mise a jour Dockerfile |
| 2026-01-28 | 2 | .env hosts incorrects | Documentation |
| 2026-01-28 | 2 | GraphiQL manquant | composer require |
| 2026-01-28 | 2 | Guard Lighthouse | Config sanctum |
| 2026-01-28 | 2 | @whereHas invalide | Remplacement par @builder |
| 2026-01-28 | 2 | Validation Date | Retrait regle superflue |
| 2026-01-28 | 2 | etp vs duree | Renommage |
| 2026-01-28 | 2 | Auth::logout() | Suppression appel |
| 2026-01-29 | 3 | Apollo Client 4.x imports | Hooks dans @apollo/client/react |
| 2026-01-29 | 3 | Apollo Client 4.x useLazyQuery | Plus de onCompleted/onError |
| 2026-01-29 | 3 | CORS port 5175 | Ajout ports alternatifs |
| 2026-01-29 | 3 | Hot reload Vite | Non resolu (voir TODO_BUGS.md) |
| 2026-01-31 | 4 | Migration ltree PostgreSQL | Extension ltree pour arborescence |
| 2026-01-31 | 4 | Tests SQLite → PostgreSQL | phpunit.xml utilise PostgreSQL |
| 2026-01-31 | 4 | Model events est_feuille | Recalcul automatique delete/restore |
| 2026-02-06 | 5 | @rename transforme cles $args | Utiliser snake_case dans mutators |
| 2026-02-06 | 5 | Activity::create ignore id | Utiliser forceCreate() |
| 2026-02-06 | 5 | Cache schema Lighthouse | lighthouse:clear-cache apres modif .graphql |
| 2026-02-06 | 5 | @delete + @can conflit | Remplacer par @field(resolver) custom |
| 2026-02-06 | 5 | JSON scalar rejette int | Passer les valeurs en string |
| 2026-02-06 | 5 | AbsencePolicy resolveConflict | Methode manquante dans policy |
| 2026-02-06 | 5 | Apollo 4 MockedProvider supprime | renderAvecApollo avec MockLink |
| 2026-02-06 | 5 | Apollo 4 hooks dans /react | Importer depuis @apollo/client/react |
| 2026-02-06 | 5 | Apollo 4 __typename obligatoire | Ajouter __typename dans les mocks |
| 2026-02-06 | 5 | Apollo 4 toutes queries mockees | Mocker toutes les queries du composant |
| 2026-02-06 | 5 | Heroicons/Recharts SVG happy-dom | Mocks globaux dans setup.ts |
| 2026-02-06 | 5 | StatistiquesQuery mauvaise relation | whereHas('utilisateur') pas 'user' |
