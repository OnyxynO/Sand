# Plan de tests automatiques - SAND

## Etat actuel

### Backend (PHPUnit) - 23 tests, 74 assertions
| Fichier | Tests | Couverture |
|---------|-------|------------|
| AuthGraphQLTest | 6 | Login, logout, me |
| TimeEntryGraphQLTest | 7 | CRUD saisies, bulk, autorisations |
| QueriesGraphQLTest | 8 | Equipes, projets, activites, stats, pagination |
| ExampleTest | 2 | Smoke tests |

### Frontend (Vitest) - 0 tests
Vitest non configure. Aucun test.

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

### Phase T1 : Tests backend critiques (priorite haute)

#### T1.1 : Tests AbsenceMutator
```
tests/Feature/AbsenceGraphQLTest.php
```
- [ ] test_sync_absences_importe_depuis_api_rh
- [ ] test_sync_absences_detecte_conflits_avec_saisies
- [ ] test_sync_absences_idempotent (pas de doublons)
- [ ] test_sync_absences_cree_notifications
- [ ] test_sync_absences_necessite_role_moderateur
- [ ] test_resolve_conflict_garder_saisie
- [ ] test_resolve_conflict_garder_absence
- [ ] test_create_absence_manuelle

**Prerequis** : Mock du RhApiClient pour isoler les tests

#### T1.2 : Tests RhApiClient (unitaires)
```
tests/Unit/RhApiClientTest.php
```
- [ ] test_get_absences_retourne_donnees
- [ ] test_get_absences_filtre_par_matricule
- [ ] test_get_absences_filtre_par_periode
- [ ] test_health_check_retourne_true_si_ok
- [ ] test_health_check_retourne_false_si_erreur
- [ ] test_gere_timeout_api
- [ ] test_gere_erreur_connexion
- [ ] test_gere_reponse_invalide

**Technique** : Utiliser Http::fake() de Laravel

#### T1.3 : Tests Policies
```
tests/Unit/Policies/AbsencePolicyTest.php
tests/Unit/Policies/TimeEntryPolicyTest.php
```
- [ ] test_admin_peut_sync_absences
- [ ] test_moderateur_peut_sync_absences
- [ ] test_utilisateur_ne_peut_pas_sync_absences
- [ ] test_utilisateur_peut_modifier_sa_saisie
- [ ] test_utilisateur_ne_peut_pas_modifier_saisie_autre
- [ ] test_moderateur_peut_modifier_saisie_de_son_projet

### Phase T2 : Configuration Vitest frontend

#### T2.1 : Setup Vitest
```bash
npm install -D vitest @testing-library/react @testing-library/jest-dom jsdom
```

Fichiers a creer :
- `vitest.config.ts`
- `src/test/setup.ts`
- Ajouter script `"test": "vitest"` dans package.json

#### T2.2 : Tests utilitaires (faciles, haute valeur)
```
src/utils/__tests__/semaineUtils.test.ts
```
- [ ] test_getDebutSemaine_retourne_lundi
- [ ] test_getFinSemaine_retourne_dimanche
- [ ] test_getJoursDeLaSemaine_retourne_7_dates
- [ ] test_formatDateISO_formate_correctement
- [ ] test_estJourFutur_detecte_correctement
- [ ] test_navigation_semaine_precedente
- [ ] test_navigation_semaine_suivante

#### T2.3 : Tests stores Zustand
```
src/stores/__tests__/authStore.test.ts
src/stores/__tests__/saisieStore.test.ts
```
- [ ] test_login_stocke_user_et_token
- [ ] test_logout_efface_state
- [ ] test_isAuthenticated_selon_token
- [ ] test_saisieStore_ajoute_ligne
- [ ] test_saisieStore_modifie_cellule
- [ ] test_saisieStore_supprime_ligne
- [ ] test_saisieStore_calcule_totaux

### Phase T3 : Tests d'integration frontend

#### T3.1 : Tests hooks
```
src/hooks/__tests__/useSaisieHebdo.test.ts
```
- [ ] test_charge_saisies_semaine
- [ ] test_sauvegarde_modifications
- [ ] test_gere_erreurs_api
- [ ] test_detecte_changements_non_sauvegardes

**Technique** : Mock Apollo Client avec MockedProvider

#### T3.2 : Tests composants critiques
```
src/components/saisie/__tests__/GrilleSemaine.test.tsx
src/components/saisie/__tests__/CelluleSaisie.test.tsx
```
- [ ] test_affiche_7_jours
- [ ] test_cellule_editable_si_jour_passe
- [ ] test_cellule_readonly_si_jour_futur
- [ ] test_warning_si_total_different_de_1

### Phase T4 : Tests backend complementaires

#### T4.1 : Tests CRUD Activites
```
tests/Feature/ActivityGraphQLTest.php
```
- [ ] test_creer_activite
- [ ] test_modifier_activite
- [ ] test_supprimer_activite
- [ ] test_deplacer_activite
- [ ] test_activite_systeme_protegee
- [ ] test_path_materialise_mis_a_jour

#### T4.2 : Tests CRUD Projets
```
tests/Feature/ProjectGraphQLTest.php
```
- [ ] test_creer_projet
- [ ] test_modifier_projet
- [ ] test_archiver_projet
- [ ] test_configurer_activites_projet
- [ ] test_assigner_moderateurs

---

## Estimation effort

| Phase | Tests/Scripts | Effort | Valeur |
|-------|---------------|--------|--------|
| **T0 (Infrastructure)** | 3 composants | **2h** | **Critique** |
| T1 (Backend critique) | ~20 | 3h | Haute |
| T2 (Setup Vitest + utils) | ~15 | 2h | Haute |
| T3 (Integration frontend) | ~15 | 4h | Moyenne |
| T4 (Backend complement) | ~12 | 2h | Moyenne |
| **Total** | **~65** | **13h** | |

---

## Ordre recommande

### Priorite 1 : Infrastructure (evite bugs futurs)
1. **T0.1** : graphql-codegen (validation schema front/back)
2. **T0.2** : Healthchecks Docker
3. **T0.3** : Smoke tests demarrage

### Priorite 2 : Tests critiques
4. **T1.2** : RhApiClient (unitaires, rapides)
5. **T1.1** : AbsenceMutator (US-3.2)
6. **T2.1** : Setup Vitest
7. **T2.2** : semaineUtils

### Priorite 3 : Couverture
8. **T1.3** : Policies (securite)
9. **T2.3** : Stores Zustand
10. **T3.1** : useSaisieHebdo
11. **T4.x** : Reste selon besoins

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

| Metrique | Actuel | Cible v1 | Cible v2 |
|----------|--------|----------|----------|
| Tests backend | 23 | 45 | 60 |
| Tests frontend | 0 | 20 | 40 |
| Couverture backend | ? | 50% | 70% |
| Couverture frontend | 0% | 30% | 50% |

---

*Document cree le 2026-01-30*
