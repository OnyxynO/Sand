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

### Phase T0 : Tests d'infrastructure (priorite critique)

#### T0.1 : Validation schema GraphQL front/back
**Probleme** : Le BUG-003 etait cause par une incoherence entre les mutations frontend et le schema backend. Sans validation automatique, ce probleme peut se reproduire.

**Solution** : Utiliser `graphql-codegen` pour :
1. Generer les types TypeScript depuis le schema backend
2. Valider les operations frontend contre le schema
3. Echouer le build si incoherence

**Fichiers a creer :**
```
frontend/codegen.ts           # Config graphql-codegen
frontend/src/gql/             # Types generes
```

**Dependances :**
```bash
npm install -D @graphql-codegen/cli @graphql-codegen/typescript \
  @graphql-codegen/typescript-operations @graphql-codegen/typed-document-node
```

**Script package.json :**
```json
"codegen": "graphql-codegen",
"codegen:watch": "graphql-codegen --watch",
"prebuild": "npm run codegen"  // Valide avant chaque build
```

**Tests automatiques :**
- [ ] CI echoue si schema backend change sans mise a jour frontend
- [ ] Types TypeScript generes automatiquement
- [ ] Erreur de compilation si mutation mal formee

#### T0.2 : Healthchecks Docker
**Probleme** : Les services peuvent echouer sans que docker-compose le detecte.

**Modifications docker-compose.yml :**
```yaml
services:
  db:
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U sand"]
      interval: 10s
      timeout: 5s
      retries: 5

  redis:
    healthcheck:
      test: ["CMD", "redis-cli", "ping"]
      interval: 10s
      timeout: 5s
      retries: 5

  app:
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:8080/api/health"]
      interval: 30s
      timeout: 10s
      retries: 3
    depends_on:
      db:
        condition: service_healthy
      redis:
        condition: service_healthy

  mock-rh:
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:3001/api/health"]
      interval: 30s
      timeout: 5s
      retries: 3
```

**Endpoint sante backend :**
```php
// routes/api.php
Route::get('/health', function () {
    return response()->json([
        'status' => 'ok',
        'db' => DB::connection()->getPdo() ? 'ok' : 'error',
        'redis' => Redis::ping() ? 'ok' : 'error',
    ]);
});
```

#### T0.3 : Smoke tests demarrage
**Objectif** : Verifier que tous les services demarrent et communiquent.

**Script tests/smoke-test.sh :**
```bash
#!/bin/bash
set -e

echo "=== Smoke Tests SAND ==="

# 1. Verifier que les conteneurs sont up
echo "[1/5] Verification conteneurs..."
docker-compose ps | grep -q "Up" || exit 1

# 2. Verifier PostgreSQL
echo "[2/5] Verification PostgreSQL..."
docker-compose exec -T db pg_isready -U sand || exit 1

# 3. Verifier Redis
echo "[3/5] Verification Redis..."
docker-compose exec -T redis redis-cli ping | grep -q "PONG" || exit 1

# 4. Verifier API Backend
echo "[4/5] Verification API Backend..."
curl -sf http://localhost:8080/api/health | grep -q "ok" || exit 1

# 5. Verifier Mock RH
echo "[5/5] Verification Mock RH..."
curl -sf http://localhost:3001/api/health | grep -q "ok" || exit 1

# 6. Verifier GraphQL
echo "[6/6] Verification GraphQL..."
curl -sf -X POST http://localhost:8080/graphql \
  -H "Content-Type: application/json" \
  -d '{"query":"{ __typename }"}' | grep -q "Query" || exit 1

echo "=== Tous les smoke tests OK ==="
```

**Integration CI (GitHub Actions) :**
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
        run: ./tests/smoke-test.sh
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
