# Plan de tests automatiques - SAND

## Etat actuel (mis a jour 2026-02-06)

### Backend (PHPUnit) - 119 tests, 504 assertions ✅
| Fichier | Tests | Couverture |
|---------|-------|------------|
| AuthGraphQLTest | 6 | Login, logout, me |
| TimeEntryGraphQLTest | 7 | CRUD saisies, bulk, autorisations |
| QueriesGraphQLTest | 8 | Equipes, projets, activites, stats, pagination |
| PolicyTest | 20 | Toutes les policies (User, Team, Project, Activity, TimeEntry, Absence, Setting) |
| UserModelTest | 13 | Attributs, roles, scopes, relations, soft delete |
| ActivityMutatorGraphQLTest | 22 | CRUD, deplacer, monter/descendre, ltree, est_feuille |
| ProjectMutatorGraphQLTest | 17 | CRUD, moderateurs, activites, utilisateurs, restauration |
| UserMutatorGraphQLTest | 8 | CRUD, desactiver, supprimer, autorisations |
| TeamMutatorGraphQLTest | 5 | CRUD, autorisations |
| SettingMutatorGraphQLTest | 4 | Modifier, autorisations |
| AbsenceMutatorGraphQLTest | 7 | CRUD, conflits (ecraser/ignorer), autorisations |
| ExampleTest | 2 | Smoke tests |

### Frontend (Vitest) - 66 tests ✅
| Fichier | Tests | Couverture |
|---------|-------|------------|
| semaineUtils.test.ts | ~10 | Calculs dates, navigation semaines |
| authStore.test.ts | ~8 | Login, logout, isAuthenticated |
| saisieStore.test.ts | ~12 | Ajout/modif/suppression lignes, totaux |
| notificationStore.test.ts | ~8 | CRUD notifications, marquage lu |
| CelluleSaisie.test.tsx | ~10 | Edition, validation, readonly |
| NavigationSemaine.test.tsx | ~8 | Navigation, affichage dates |
| TotauxJournaliers.test.tsx | ~10 | Calculs, warnings |

---

## Analyse des lacunes

### Backend - Zones non testees

| Zone | Priorite | Complexite | Risque si non teste |
|------|----------|------------|---------------------|
| **AbsenceMutator** (syncAbsences) | Haute | Moyenne | Import absences defaillant |
| **RhApiClient** | Haute | Faible | Erreurs API RH non gerees |
| **ActivityMutator** | Moyenne | Moyenne | CRUD activites casse |
| **ProjectMutator** | Moyenne | Moyenne | Config projets cassee |
| **UserMutator** | Moyenne | Faible | Gestion users cassee |
| **Policies** | Haute | Faible | Failles de securite |
| **Models** (methodes metier) | Basse | Faible | Calculs errones |

### Frontend - Zones critiques a tester

| Zone | Priorite | Complexite | Risque si non teste |
|------|----------|------------|---------------------|
| **useSaisieHebdo** (hook) | Haute | Haute | Saisies perdues/corrompues |
| **semaineUtils** | Haute | Faible | Dates mal calculees |
| **saisieStore** (Zustand) | Haute | Moyenne | Etat incoherent |
| **GrilleSemaine** | Moyenne | Haute | Affichage casse |
| **authStore** | Moyenne | Faible | Deconnexions intempestives |
| **Formulaires admin** | Basse | Moyenne | UX degradee |

---

## Plan d'implementation

### Phase T0 : Tests d'infrastructure (priorite critique) - COMPLETE

#### T0.1 : Validation schema GraphQL front/back - FAIT
**Probleme** : Le BUG-003 etait cause par une incoherence entre les mutations frontend et le schema backend. Sans validation automatique, ce probleme peut se reproduire.

**Solution implementee** : `graphql-codegen` configure pour :
1. Generer les types TypeScript depuis le schema backend
2. Valider les operations frontend contre le schema
3. Echouer le build si incoherence

**Fichiers crees :**
- `frontend/codegen.ts` - Config graphql-codegen
- `frontend/src/gql/` - Types generes automatiquement

**Scripts ajoutes a package.json :**
```json
"codegen": "graphql-codegen --config codegen.ts",
"codegen:watch": "graphql-codegen --config codegen.ts --watch",
"build": "npm run codegen && tsc -b && vite build"
```

**Mutations frontend corrigees pour correspondre au schema :**
- `projects.ts` - CREATE_PROJECT, UPDATE_PROJECT
- `saisie.ts` - CREATE_TIME_ENTRY, UPDATE_TIME_ENTRY
- `teams.ts` - CREATE_TEAM, UPDATE_TEAM
- `users.ts` - CREATE_USER, UPDATE_USER

**Appels de mutations corriges dans les composants :**
- `EquipesPage.tsx`
- `FormulaireUtilisateur.tsx`
- `ProjetsPage.tsx`

**Tests automatiques :**
- [x] Types TypeScript generes automatiquement
- [x] Erreur de compilation si mutation mal formee
- [ ] CI echoue si schema backend change sans mise a jour frontend (a configurer)

#### T0.2 : Healthchecks Docker - FAIT
**Probleme** : Les services peuvent echouer sans que docker-compose le detecte.

**Modifications apportees :**

1. **docker-compose.yml** - Healthchecks ajoutes pour :
   - `db` : pg_isready avec depends_on healthy
   - `redis` : redis-cli ping avec depends_on healthy
   - `nginx` : wget vers /api/health
   - `mock-rh` : wget vers /api/health

2. **backend/routes/web.php** - Endpoint `/api/health` cree :
   - Verifie connexion PostgreSQL
   - Verifie connexion Redis
   - Retourne status `ok` ou `degraded`

3. **Dependencies sante** :
   - `app` attend que `db` et `redis` soient healthy avant de demarrer

#### T0.3 : Smoke tests demarrage - FAIT
**Objectif** : Verifier que tous les services demarrent et communiquent.

**Script cree : `tests/smoke-test.sh`**

Verifie en 6 etapes :
1. Tous les conteneurs Docker sont running
2. PostgreSQL repond (pg_isready)
3. Redis repond (PONG)
4. Backend /api/health retourne ok (avec details DB/Redis)
5. Mock RH /api/health retourne ok
6. GraphQL repond a une query introspection

**Usage :**
```bash
# Execution locale
./tests/smoke-test.sh

# Mode CI (timeout plus long)
./tests/smoke-test.sh --ci
```

**Integration CI (a configurer) :**
```yaml
# .github/workflows/smoke-tests.yml
name: Smoke Tests
on: [push, pull_request]
jobs:
  smoke:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - name: Start services
        run: docker-compose up -d
      - name: Wait for services
        run: sleep 30
      - name: Run smoke tests
        run: ./tests/smoke-test.sh --ci
```

---

### Phase T1 : Tests backend critiques (priorite haute) - COMPLETE ✅

#### T1.1 : Tests AbsenceMutator - FAIT ✅
```
tests/Feature/AbsenceMutatorGraphQLTest.php (7 tests)
```
- [x] test_admin_peut_creer_absence_manuellement
- [x] test_moderateur_peut_creer_absence
- [x] test_utilisateur_ne_peut_pas_creer_absence
- [x] test_non_authentifie_ne_peut_pas_creer_absence
- [x] test_resolution_conflit_ecraser_supprime_saisies
- [x] test_resolution_conflit_ignorer_annule_absence
- [x] test_creer_absence_duree_invalide_echoue

**Note** : Tests syncAbsences (appel API RH) non couverts, necessite mock RhApiClient.

#### T1.2 : Tests RhApiClient (unitaires)
```
tests/Unit/RhApiClientTest.php
```
- [ ] test_get_absences_retourne_donnees
- [ ] test_get_absences_filtre_par_matricule
- [ ] test_gere_timeout_api
- [ ] test_gere_erreur_connexion

**Technique** : Utiliser Http::fake() de Laravel

#### T1.3 : Tests Policies - FAIT ✅
```
tests/Unit/PolicyTest.php (20 tests)
```
- [x] Toutes les policies testees : User, Team, Project, Activity, TimeEntry, Absence, Setting
- [x] Tests par role (admin, moderateur, utilisateur)
- [x] Cas speciaux (activite systeme, moderateur assigne, auto-suppression)

### Phase T2 : Configuration Vitest frontend - COMPLETE ✅

#### T2.1 : Setup Vitest - FAIT ✅
- [x] vitest, @testing-library/react, @testing-library/jest-dom, jsdom installes
- [x] `vitest.config.ts` cree
- [x] `src/test/setup.ts` cree
- [x] Script `"test": "vitest"` dans package.json

#### T2.2 : Tests utilitaires - FAIT ✅
```
src/utils/semaineUtils.test.ts (~10 tests)
```
- [x] Calcul debut/fin semaine
- [x] Jours de la semaine (7 dates)
- [x] Format date ISO
- [x] Detection jour futur
- [x] Navigation semaine precedente/suivante

#### T2.3 : Tests stores Zustand - FAIT ✅
```
src/stores/authStore.test.ts (~8 tests)
src/stores/saisieStore.test.ts (~12 tests)
src/stores/notificationStore.test.ts (~8 tests)
```
- [x] Login/logout/isAuthenticated
- [x] Ajout/modification/suppression lignes saisie
- [x] Calcul totaux journaliers
- [x] CRUD notifications, marquage lu

### Phase T3 : Tests d'integration frontend - COMPLETE ✅

#### T3.1 : Tests hooks
- [ ] useSaisieHebdo (necessite mock Apollo, non couvert)

#### T3.2 : Tests composants critiques - FAIT ✅
```
src/components/saisie/CelluleSaisie.test.tsx (~10 tests)
src/components/saisie/NavigationSemaine.test.tsx (~8 tests)
src/components/saisie/TotauxJournaliers.test.tsx (~10 tests)
```
- [x] Edition cellule, validation
- [x] Cellule readonly
- [x] Navigation semaines, affichage dates
- [x] Calcul totaux, warnings

### Phase T4 : Tests backend complementaires - COMPLETE ✅

#### T4.1 : Tests CRUD Activites - FAIT ✅
```
tests/Feature/ActivityMutatorGraphQLTest.php (22 tests)
```
- [x] CRUD complet (creer, modifier, supprimer)
- [x] Deplacer activite (vers parent, vers racine, vers descendant → echec)
- [x] Monter/descendre activite
- [x] Activite systeme protegee
- [x] Chemins ltree coherents apres operations
- [x] est_feuille recalcule (suppression, restauration)
- [x] Requetes descendants/ancestors ltree

#### T4.2 : Tests CRUD Projets - FAIT ✅
```
tests/Feature/ProjectMutatorGraphQLTest.php (17 tests)
```
- [x] CRUD complet (creer, modifier, supprimer, restaurer)
- [x] Assignation moderateurs
- [x] Definition activites projet
- [x] Ajout/retrait utilisateurs
- [x] Autorisations (admin, moderateur assigne, utilisateur)

#### T4.3 : Tests supplementaires - FAIT ✅
```
tests/Feature/UserMutatorGraphQLTest.php (8 tests)
tests/Feature/TeamMutatorGraphQLTest.php (5 tests)
tests/Feature/SettingMutatorGraphQLTest.php (4 tests)
tests/Unit/UserModelTest.php (13 tests)
```

---

## Estimation effort et avancement

| Phase | Tests/Scripts | Statut | Valeur |
|-------|---------------|--------|--------|
| **T0 (Infrastructure)** | 3 composants | **FAIT** ✅ | **Critique** |
| **T1 (Backend critique)** | ~27 realises | **FAIT** ✅ (sauf RhApiClient) | Haute |
| **T2 (Setup Vitest + utils)** | ~38 realises | **FAIT** ✅ | Haute |
| **T3 (Integration frontend)** | ~28 realises | **FAIT** ✅ (sauf useSaisieHebdo) | Moyenne |
| **T4 (Backend complement)** | ~69 realises | **FAIT** ✅ | Moyenne |
| **Total** | **185 tests** | **Quasi complet** | |

---

## Reste a faire

1. **T1.2** : Tests RhApiClient (unitaires avec Http::fake)
2. **T3.1** : Tests useSaisieHebdo (mock Apollo)

---

## Bonnes pratiques a suivre

### Backend
- Utiliser `RefreshDatabase` pour isolation
- Factory pour chaque model
- Un test = un cas precis
- Nommer en francais (coherence projet)

### Frontend
- Tester comportement, pas implementation
- Mock API avec MSW ou MockedProvider
- Eviter tests de snapshot (fragiles)
- Tester accessibilite (a11y)

---

## Metriques cibles

| Metrique | Debut | Actuel (2026-02-06) | Cible v1 | Statut |
|----------|-------|---------------------|----------|--------|
| Tests backend | 23 | **119** | 60 | ✅ Depasse |
| Tests frontend | 0 | **66** | 40 | ✅ Depasse |
| Assertions backend | 74 | **504** | - | ✅ |
| Couverture backend | ? | ~80% mutations | 50% | ✅ Depasse |
| Couverture frontend | 0% | ~40% composants | 30% | ✅ Depasse |

---

## Bugs applicatifs decouverts par les tests (2026-02-06)

Les tests ont revele **6 vrais bugs** dans le code applicatif :

1. **Setting::clearCache()** inexistant → corrige en `invaliderToutLeCache()`
2. **@rename + @spread** : les cles `$args` sont en snake_case, pas camelCase (5 mutators affectes)
3. **Activity::create()** ignorait l'id explicite (pas dans $fillable) → `forceCreate()`
4. **AbsencePolicy::resolveConflict** manquant
5. **TeamPolicy::delete** signature incorrecte (attendait Team instance)
6. **ProjectMutator::setActivities** mauvaise relation (`activites()` vs `activitesActives()`)

---

*Document cree le 2026-01-30, mis a jour le 2026-02-06*
