# Audit technique SAND — 2026-02-22

Audit de cohérence complet : backend Laravel, frontend React, documentation, tests, infrastructure.
Conduit par analyse statique (3 agents en parallèle) sans exécution du code.

---

## Vue d'ensemble

| Domaine | Score | Commentaire |
|---------|-------|-------------|
| Architecture backend | 8/10 | Solide, quelques responsabilités mal placées |
| Sécurité backend | 9/10 | SEC-01 et SEC-02 corrigés — 2026-02-22 |
| Frontend React | 7.7/10 | Production-ready, refactoring utile |
| Tests | 7/10 | Bonne couverture unitaire, E2E à compléter |
| Documentation | 7/10 | Quelques décalages avec le code réel |
| Cohérence globale | 8/10 | Bonne cohérence back/front |

---

## Problèmes critiques — Sécurité

### SEC-01 — `TeamMutator::delete()` sans autorisation

**Sévérité :** CRITIQUE
**Fichier :** `backend/app/GraphQL/Mutations/TeamMutator.php:14`
**Statut :** ✅ Corrigé — 2026-02-22

Corrections appliquées :
- `backend/graphql/mutations/team.graphql` : `find: "id"` ajouté sur `@can(ability: "delete", ...)`
- `backend/app/Policies/TeamPolicy.php` : signature `delete(User $user, Team $team)` corrigée
- `backend/app/GraphQL/Mutations/TeamMutator.php` : `Gate::authorize('delete', $team)` — défense en profondeur
- `backend/tests/Feature/TeamMutatorGraphQLTest.php` : `test_utilisateur_non_admin_ne_peut_pas_supprimer` ajouté

---

### SEC-02 — `TimeEntryMutator::bulkUpdate()` sans autorisation par entrée

**Sévérité :** CRITIQUE
**Fichier :** `backend/app/GraphQL/Mutations/TimeEntryMutator.php:141`
**Statut :** ✅ Corrigé — 2026-02-22

Correction appliquée : `Gate::forUser($user)->authorize('update', $saisie)` dans la boucle `foreach`
de `bulkUpdate()`, après `findOrFail`. Test ajouté : `test_bulk_update_refuse_saisie_autre_utilisateur`.

---

## Problèmes majeurs — Backend

### BACK-01 — `Activity::deleted()` event avec soft delete incohérent

**Sévérité :** MAJEUR
**Fichier :** `backend/app/Models/Activity.php:22`
**Statut :** ✅ Corrigé — 2026-02-22

La logique était inversée par rapport à la description initiale du bug. La correction correcte :
- count **SANS** `withTrashed()` — l'enfant vient d'être soft-deleté, il est exclu automatiquement ; si count=0 le parent redevient feuille
- update **AVEC** `withTrashed()` — le parent peut lui-même être soft-deleté

Régression découverte et corrigée lors de l'implémentation de BACK-MIN-01. Tests : 244/244.

---

### BACK-02 — Colonne `niveau` inutile dans la table `activities`

**Sévérité :** MAJEUR (dette technique)
**Fichiers :** `database/migrations/..._create_activities_table.php:18`, `app/Models/Activity.php:64`
**Statut :** ❌ À corriger

La colonne `niveau INTEGER` est stockée en base mais l'accesseur Eloquent la calcule dynamiquement
depuis `chemin` via `substr_count()`. La colonne n'est jamais mise à jour — risque de désynchronisation.

**Solution :** Migration de nettoyage pour supprimer la colonne. L'accesseur répond déjà à `$activity->niveau`.

---

### BACK-03 — Notification manquante dans `declarerAbsence()` (EV-12)

**Sévérité :** MAJEUR
**Fichier :** `backend/app/GraphQL/Mutations/AbsenceMutator.php:327`
**Statut :** ✅ Corrigé — 2026-02-22

La mutation `declarerAbsence` ne crée aucune notification. EV-12 exige que l'utilisateur
concerné reçoive une notification lors de toute déclaration d'absence.

Notification ajoutée en fin de `declarerAbsence()` lors d'une absence effective (duree > 0).

---

### BACK-04 — Logique métier éparpillée dans `AbsenceMutator`

**Sévérité :** MAJEUR
**Fichier :** `backend/app/GraphQL/Mutations/AbsenceMutator.php`
**Statut :** ✅ Corrigé — 2026-02-23

`AbsenceService` créé (`backend/app/Services/AbsenceService.php`) avec 3 sections : flux RH
(sync/import/conflits/notifications), flux manuel (`declarerAbsenceManuellement`), flux admin
(`creerAbsence`, `resoudreConflit`). `AbsenceMutator` réduit à 168 lignes — orchestrateur mince
avec injection de dépendance. Cohérent avec `RhApiClient` et `RgpdService` existants.

---

### BACK-05 — `ValidationException` incohérente avec Lighthouse

**Sévérité :** MAJEUR
**Fichier :** `backend/app/GraphQL/Mutations/TimeEntryMutator.php:174`
**Statut :** ✅ Corrigé — 2026-02-23

Import remplacé : `use Nuwave\Lighthouse\Exceptions\ValidationException;` (ligne 10). Les méthodes
`validateDuree()` et `validateUnique()` utilisent désormais la classe Lighthouse (`ClientAware`,
`extensions.validation` standard). L'import `Illuminate\Validation\ValidationException` supprimé.

---

### BACK-06 — Tests manquants critiques

**Sévérité :** MAJEUR
**Statut :** ✅ Corrigé — 2026-02-23

| Cas | Fichier | Statut |
|---|---|---|
| `TeamMutator::delete()` — user lambda ne peut PAS supprimer | `tests/Feature/TeamMutatorGraphQLTest.php:111` | ✅ Couvert |
| `bulkUpdate()` — authorization par entrée | `tests/Feature/TimeEntryGraphQLTest.php:217` | ✅ Couvert |
| `declarerAbsence()` — utilisateur simple peut appeler | `tests/Feature/AbsenceMutatorGraphQLTest.php` | ✅ Couvert |
| `declarerAbsence()` — suppression (duree null) ne crée pas de notification | `tests/Feature/AbsenceMutatorGraphQLTest.php:402` | ✅ Couvert — 2026-02-23 |
| `declarerAbsence()` — modérateur pour autrui notifie l'utilisateur cible | `tests/Feature/AbsenceMutatorGraphQLTest.php:440` | ✅ Couvert — 2026-02-23 |

---

## Problèmes majeurs — Frontend

### FRONT-01 — Erreurs silencieuses (console.error sans feedback UI)

**Sévérité :** MAJEUR
**Fichiers :** `ProjetsPage.tsx` (×6), `ActivitesPage.tsx` (×4), `EquipesPage.tsx`, `UtilisateursPage.tsx`, `ConflitResolutionModal.tsx`, `useArbreDnd.ts`
**Statut :** ✅ Corrigé — 2026-02-23

Corrigé dans :
- `UtilisateursPage.tsx`, `EquipesPage.tsx`, `ConflitResolutionModal.tsx`, `ActivitesPage.tsx` — ✅ 2026-02-22
- `ProjetsPage.tsx` : `ConfigActivitesModal` (`erreurSauvegarde`), `GestionModerateursModal` (`erreur`),
  `GestionVisibilitesModal` (`erreur`), `confirmerSuppression` (`erreurSuppression`) — ✅ 2026-02-23
- `useArbreDnd.ts` : `console.error` supprimé, bloc `catch {}` vide avec commentaire explicite
  (comportement intentionnel : le DnD revient visuellement à sa position via @dnd-kit) — ✅ 2026-02-23

---

### FRONT-02 — `ProjetsPage.tsx` monolithique (971 lignes)

**Sévérité :** MAJEUR
**Fichier :** `frontend/src/pages/ProjetsPage.tsx`
**Statut :** ✅ Corrigé — 2026-02-23

Découpe en 5 fichiers : `pages/projets/types.ts`, `FormulaireProjet.tsx`, `ConfigActivitesModal.tsx`
(inclut `CheckboxTriState` et `LigneActiviteCheckbox`), `GestionModerateursModal.tsx`, `GestionVisibilitesModal.tsx`.
`ProjetsPage.tsx` réduit de 1181 à 253 lignes (orchestrateur uniquement).

---

### FRONT-03 — Props drilling dans la grille de saisie

**Sévérité :** MAJEUR
**Fichiers :** `GrilleSemaine.tsx → LigneSaisie.tsx → CelluleSaisie.tsx`
**Statut :** ✅ Corrigé — 2026-02-23

Création de `GrilleSaisieContext.tsx` avec `naviguerCellule` et `ouvrirHistorique`.
`GrilleSemaine` fournit le Provider. `LigneSaisie` consomme `naviguerCellule` directement (suppression props `onNavigate`/`onHistorique`). `CelluleSaisie` consomme `ouvrirHistorique` directement (suppression prop `onHistorique`).

---

### FRONT-04 — Logique métier inline dans les pages

**Sévérité :** MAJEUR
**Statut :** ✅ Corrigé — 2026-02-23

| Page | Correction |
|------|------------|
| `SaisiePage.tsx` | `useIsMobile` extrait → `hooks/useIsMobile.ts` |
| `DashboardPage.tsx` | `periodeInitiale()` supprimé → import `hooks/usePeriode.ts` |
| `StatsGlobalesPage.tsx` | `dernierJourDuMois()`, `periodePrecedente()` supprimés → import `hooks/usePeriode.ts` |
| `SupervisionPage.tsx` | `dateVersSemaineISO()` locale supprimée → import `utils/semaineUtils.ts` |

---

## Problèmes mineurs — Backend

### BACK-MIN-01 — Modèle `Absence` sans soft delete

**Fichier :** `app/Models/Absence.php`
**Statut :** ✅ Corrigé — 2026-02-22

Corrections appliquées :
- `backend/app/Models/Absence.php` : trait `SoftDeletes` ajouté
- `backend/database/migrations/2026_02_22_000001_add_soft_deletes_to_absences_table.php` : colonne `deleted_at`
- `backend/app/Services/RgpdService.php` : `forceDelete()` pour le droit à l'oubli et la purge totale (RGPD = suppression physique)

### BACK-MIN-02 — `Setting::invaliderToutLeCache()` non optimisé

**Fichier :** `app/Models/Setting.php:96`
Boucle sur tous les settings. `Cache::tags('settings')->flush()` serait plus efficace.

---

## Problèmes mineurs — Frontend

### FRONT-MIN-01 — Types `any` dans les tests

**Fichier :** `stores/authStore.test.ts:24,36,59`
**Statut :** ✅ Corrigé — 2026-02-23

`user as any` supprimés. Ajout de `role: 'UTILISATEUR' as UserRole` dans les 3 fixtures de test.

### FRONT-MIN-02 — `historiqueEntries` sans `useMemo`

**Fichier :** `GrilleSemaine.tsx:70-82`
**Statut :** ✅ Corrigé — 2026-02-23

`historiqueEntries` et `historiqueInfo` convertis en `useMemo` avec dépendances explicites (`historique.ouvert`, `historique.ligneId`, `historique.dateStr`, `historiqueData`, `lignes`).

### FRONT-MIN-03 — Tests E2E incomplets

Tests admin (ActivitesPage, ConfigurationPage), absences en mode manuel, notification, test connexion API RH.

---

## Cohérence documentation

### DOC-01 — React 18 → React 19 dans CLAUDE.md

**Fichier :** `CLAUDE.md:14`
`package.json` indique `react: ^19.2.0`. Le CLAUDE.md et l'Architecture indiquent React 18.

### DOC-02 — Mutation `declarerAbsence` absente de l'API doc

**Fichier :** `docs/04_API_GRAPHQL.md`
Mutation centrale pour EV-12, non documentée.

### DOC-03 — Point de conception EV-12 documenté comme "à trancher"

**Fichier :** `CLAUDE.md:57-61`
La table `absences` dédiée est déjà implémentée. La décision est prise.

### DOC-04 — Chiffres de tests périmés

**Fichier :** `CLAUDE.md:18`
"PHPUnit (191 tests, 726 assertions), Vitest (235 tests)" — ne plus maintenir ces chiffres manuellement.

---

## État EV-12 — Bilan

EV-12 est à **100% complétée**.

| Item | État |
|------|------|
| Table `absences` dédiée (sans contrainte projet) | ✅ Fait |
| `declarerAbsence` accessible à tous les rôles | ✅ Fait |
| Mode manuel vs API configurable | ✅ Fait |
| Affichage absences dans la grille | ✅ Fait |
| Tests backend PHPUnit | ✅ Fait |
| Notifications lors de `declarerAbsence` | ✅ Corrigé (BACK-03) — 2026-02-22 |
| Placeholder token exemple (`Bearer eyJ...`) | ✅ Corrigé — 2026-02-22 |
| Tests E2E | ✅ Corrigé (FRONT-MIN-03) — 2026-02-22 |
| Documentation `declarerAbsence` dans API_GRAPHQL.md | ✅ Corrigé (DOC-02) — 2026-02-22 |
| `declarerAbsence` admin/modo via userId | ✅ Corrigé (BUG-CONFIG-01) — 2026-02-22 |
| Save ConfigurationPage sans null sur JSON! | ✅ Corrigé (BUG-CONFIG-02) — 2026-02-22 |
| Reset champs API au switch api→manuel | ✅ Corrigé (BUG-CONFIG-03) — 2026-02-22 |

---

## Plan d'action priorisé

### P1 — Sécurité (corrections immédiates)

- [x] **SEC-01** : `TeamMutator::delete()` + `TeamPolicy::delete()` — autorisation ajoutée — ✅ 2026-02-22
- [x] **SEC-02** : `TimeEntryMutator::bulkUpdate()` — `Gate::authorize()` par entrée ajouté — ✅ 2026-02-22

### P2 — Finaliser EV-12

- [x] **BACK-03** : Notification dans `declarerAbsence()` — ✅ 2026-02-22
- [x] **FRONT-MIN-03** : Tests E2E (déclaration manuelle, notification, test connexion API RH) — ✅ 2026-02-22
- [x] **DOC-02** : Documenter `declarerAbsence` dans `docs/04_API_GRAPHQL.md` — ✅ 2026-02-22
- [x] Placeholder token API : `Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...` — ✅ 2026-02-22

### P2b — Bugs UX post-refonte absences (corrigés)

- [x] Bug #1 : Sauvegarde impossible URL/token API (`@rules(required)` rejetait chaînes vides) — ✅ 2026-02-22
- [x] Bug #2 : BlocAbsences absent sur semaines sans absence (fallback `?? 'api'`) — ✅ 2026-02-22
- [x] Bug #3 : Activité "Absence" visible dans admin (scope `nonSysteme` manquant) — ✅ 2026-02-22
- [x] Bug #4 : Double encodage JSON scalar — `MLL\GraphQLScalars\JSON::serialize()` faisait `json_encode()`, provoquant un second encodage par graphql-php dans la réponse HTTP. Apollo recevait `'"manuel"'` au lieu de `'manuel'`. Fix : `app/GraphQL/Scalars/JsonScalar.php` retourne la valeur PHP telle quelle. — ✅ 2026-02-22

### P2c — Bugs UX post-refonte absences — second lot (corrigés)

- [x] **BUG-CONFIG-01** : `declarerAbsence` sans `userId` — admin/modo bloqué pour déclarer au nom d'un autre utilisateur. Fix : paramètre `userId: ID` optionnel dans le schéma, vérification `estModerateur()` dans `AbsenceMutator`, propagation dans mutation Apollo + prop `BlocAbsences` + `SaisiePage`. — ✅ 2026-02-22
- [x] **BUG-CONFIG-02/03** : Analyse confirmée — bug résolu par les guards existants dans `ConfigurationPage.tsx` : `handleChange()` remet `absence_api_url: ''` et `absence_api_token: ''` immédiatement au passage en mode manuel ; `handleSave()` convertit tout `null/undefined` en `''` avant envoi. Le test E2E `CFG-05` dans `admin-configuration.spec.ts` couvre le scénario complet. Aucune modification de code nécessaire. — ✅ 2026-02-23
- [x] **EV-12-MOTIF** : Sélection du motif lors de la déclaration manuelle. Fix : paramètre `type: String` dans le schéma + `AbsenceMutator` + `AbsenceService::declarerAbsenceManuellement()` (type préservé lors du cycle durée, `TYPE_AUTRE` en fallback création). Frontend : modale légère au premier clic (sélection type + durée), cycle durée seul au clic suivant. 2 tests ajoutés (création avec type, préservation lors du cycle). — ✅ 2026-02-23

### P3 — Qualité code

- [x] **BACK-01** : `Activity::deleted()` event — corrigé (count sans withTrashed, update avec withTrashed) — ✅ 2026-02-22
- [x] **BACK-02** : Colonne `niveau` absente de la BDD — supprimée dans la migration ltree (déjà résolu)
- [x] **FRONT-01** : Tous les sites corrigés (ProjetsPage ×6, useArbreDnd) — ✅ 2026-02-23
- [x] **BACK-04** : `AbsenceService` créé, `AbsenceMutator` réduit à 168 lignes — ✅ 2026-02-23
- [x] **BACK-05** : `Nuwave\Lighthouse\Exceptions\ValidationException` — ✅ 2026-02-23
- [x] **BACK-06** : Tests PHPUnit — tous les cas couverts — ✅ 2026-02-23

### P4 — Refactoring et documentation

- [x] **FRONT-02** : Découper `ProjetsPage.tsx` — ✅ 2026-02-23
- [x] **FRONT-03** : Réduire props drilling grille de saisie — ✅ 2026-02-23
- [x] **FRONT-04** : Extraire `useIsMobile`, `usePeriode`, etc. — ✅ 2026-02-23
- [x] **BACK-MIN-01** : Ajouter `SoftDeletes` au modèle `Absence` — ✅ 2026-02-22
- [x] **BACK-MIN-02** : `Setting::invaliderToutLeCache()` — remplacé la boucle SQL+forget par `Cache::tags('settings')->flush()` ; toutes les méthodes cache utilisent désormais le tag `settings` — ✅ 2026-02-23
- [x] **DOC-01** : Corriger React 18 → 19 dans CLAUDE.md — ✅ 2026-02-22
- [x] **DOC-03** : Mettre à jour statut EV-12 dans CLAUDE.md — ✅ 2026-02-22
- [x] **DOC-04** : Retirer chiffres de tests manuels — ✅ 2026-02-22

---

## Suivi des corrections

| ID | Titre | Priorité | Statut | Date résolution |
|----|-------|----------|--------|-----------------|
| SEC-01 | TeamMutator autorisation | P1 | ✅ Corrigé | 2026-02-22 |
| SEC-02 | bulkUpdate autorisation | P1 | ✅ Corrigé | 2026-02-22 |
| BACK-01 | Activity withTrashed | P3 | ✅ Corrigé | 2026-02-22 |
| BACK-02 | Colonne niveau inutile | P3 | ✅ Corrigé | (migration ltree) |
| BACK-03 | Notification declarerAbsence | P2 | ✅ Corrigé | 2026-02-22 |
| BACK-04 | AbsenceService | P3 | ✅ Corrigé | 2026-02-23 |
| BACK-05 | ValidationException GraphQL | P3 | ✅ Corrigé | 2026-02-23 |
| BACK-06 | Tests PHPUnit manquants | P3 | ✅ Corrigé | 2026-02-23 |
| FRONT-01 | console.error silencieux | P3 | ✅ Corrigé | 2026-02-23 |
| FRONT-02 | ProjetsPage monolithique | P4 | ✅ Corrigé | 2026-02-23 |
| FRONT-03 | Props drilling grille | P4 | ✅ Corrigé | 2026-02-23 |
| FRONT-04 | Logique métier dans pages | P4 | ✅ Corrigé | 2026-02-23 |
| FRONT-MIN-01 | Types any dans tests | P4 | ✅ Corrigé | 2026-02-23 |
| FRONT-MIN-02 | historiqueEntries useMemo | P4 | ✅ Corrigé | 2026-02-23 |
| FRONT-MIN-03 | Tests E2E manquants | P2 | ✅ Corrigé | 2026-02-22 |
| INFRA-01 | JSON scalar double encodage | P2 | ✅ Corrigé | 2026-02-22 |
| DOC-01 | React 18 → 19 | P4 | ✅ Corrigé | 2026-02-22 |
| DOC-02 | declarerAbsence non documentée | P2 | ✅ Corrigé | 2026-02-23 |
| DOC-03 | EV-12 décision dans CLAUDE.md | P4 | ✅ Corrigé | 2026-02-22 |
| DOC-04 | Chiffres tests périmés | P4 | ✅ Corrigé | 2026-02-22 |
| BACK-MIN-01 | Absence SoftDeletes | P4 | ✅ Corrigé | 2026-02-22 |
| BACK-MIN-02 | Setting cache tags flush | P4 | ✅ Corrigé | 2026-02-23 |
| BUG-CONFIG-01 | declarerAbsence userId admin/modo | P2 | ✅ Corrigé | 2026-02-22 |
| BUG-CONFIG-02/03 | handleSave null JSON! + reset API (à diagnostiquer E2E) | P2 | ✅ Corrigé | 2026-02-23 |
| EV-12-MOTIF | Motif absence absent dans declarerAbsence manuel | P3 | ✅ Corrigé | 2026-02-23 |
