# Audit technique SAND — 2026-02-22

Audit de cohérence complet : backend Laravel, frontend React, documentation, tests, infrastructure.
Conduit par analyse statique (3 agents en parallèle) sans exécution du code.

---

## Vue d'ensemble

| Domaine | Score | Commentaire |
|---------|-------|-------------|
| Architecture backend | 8/10 | Solide, quelques responsabilités mal placées |
| Sécurité backend | 5/10 | 2 mutations sans autorisation |
| Frontend React | 7.7/10 | Production-ready, refactoring utile |
| Tests | 7/10 | Bonne couverture unitaire, E2E à compléter |
| Documentation | 7/10 | Quelques décalages avec le code réel |
| Cohérence globale | 8/10 | Bonne cohérence back/front |

---

## Problèmes critiques — Sécurité

### SEC-01 — `TeamMutator::delete()` sans autorisation

**Sévérité :** CRITIQUE
**Fichier :** `backend/app/GraphQL/Mutations/TeamMutator.php:14`
**Statut :** ❌ À corriger

N'importe quel utilisateur authentifié peut supprimer une équipe. Aucun appel à `$this->authorize()`.
Parallèlement, `TeamPolicy::delete()` a une signature incohérente (pas de paramètre `$team`).

```php
// CORRECTION
public function delete($root, array $args): bool
{
    $team = Team::findOrFail($args['id']);
    $this->authorize('delete', $team);
    return $team->delete();
}
```

Corriger aussi `TeamPolicy::delete(User $user)` → `TeamPolicy::delete(User $user, Team $team)`.

---

### SEC-02 — `TimeEntryMutator::bulkUpdate()` sans autorisation par entrée

**Sévérité :** CRITIQUE
**Fichier :** `backend/app/GraphQL/Mutations/TimeEntryMutator.php:141`
**Statut :** ❌ À corriger

`bulkCreate()` appelle `Gate::authorize()` correctement. `bulkUpdate()` ne vérifie pas si
l'utilisateur est propriétaire de chaque saisie — modification des saisies d'autres utilisateurs
possible si les IDs sont connus.

```php
// CORRECTION : dans la boucle foreach
$saisie = TimeEntry::findOrFail($entry['id']);
Gate::authorize('update', $saisie); // ← à ajouter
```

---

## Problèmes majeurs — Backend

### BACK-01 — `Activity::deleted()` event avec soft delete incohérent

**Sévérité :** MAJEUR
**Fichier :** `backend/app/Models/Activity.php:22`
**Statut :** ❌ À corriger

Le calcul de `est_feuille` dans l'event `deleted` utilise `static::where()` sans `withTrashed()`.
Restaurer une activité supprimée peut laisser son parent incorrectement marqué comme feuille.

```php
// BUG
$nbEnfants = static::where('parent_id', $activity->parent_id)->count();
// FIX
$nbEnfants = static::withTrashed()->where('parent_id', $activity->parent_id)->count();
```

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
**Statut :** ❌ À corriger

La mutation `declarerAbsence` ne crée aucune notification. EV-12 exige que l'utilisateur
concerné reçoive une notification lors de toute déclaration d'absence.

```php
// À AJOUTER en fin de declarerAbsence()
Notification::creer(
    $user,
    Notification::TYPE_ABSENCE_IMPORTEE,
    'Absence déclarée',
    "Absence du {$date} ({$duree} ETP) enregistrée."
);
```

---

### BACK-04 — Logique métier éparpillée dans `AbsenceMutator`

**Sévérité :** MAJEUR
**Fichier :** `backend/app/GraphQL/Mutations/AbsenceMutator.php`
**Statut :** ⚠️ Refactoring recommandé

~350 lignes de logique sync/conflits/imports dans le resolver. Un `AbsenceService` centraliserait
la logique, la rendrait testable indépendamment de Lighthouse, et serait cohérent avec `RhApiClient`
et `RgpdService` déjà en place.

---

### BACK-05 — `ValidationException` incohérente avec Lighthouse

**Sévérité :** MAJEUR
**Fichier :** `backend/app/GraphQL/Mutations/TimeEntryMutator.php:174`
**Statut :** ⚠️ À corriger

Lancer `ValidationException::withMessages()` peut produire des formats d'erreur inattendus
côté GraphQL. Standardiser sur `\Nuwave\Lighthouse\Exceptions\ValidationException` ou `GraphQL\Error\Error`.

---

### BACK-06 — Tests manquants critiques

**Sévérité :** MAJEUR
**Statut :** ❌ À ajouter

| Cas manquant | Fichier concerné |
|---|---|
| `TeamMutator::delete()` — vérifier qu'un user lambda ne peut PAS supprimer | `tests/Feature/TeamMutatorGraphQLTest.php` |
| `declarerAbsence()` — vérifier qu'un `utilisateur` (pas admin/modo) peut appeler | `tests/Feature/AbsenceMutatorGraphQLTest.php` |
| `bulkUpdate()` — vérifier authorization par entrée | `tests/Feature/TimeEntryGraphQLTest.php` |

---

## Problèmes majeurs — Frontend

### FRONT-01 — Erreurs silencieuses (console.error sans feedback UI)

**Sévérité :** MAJEUR
**Fichiers :** `ProjetsPage.tsx` (×6), `ActivitesPage.tsx` (×4), `EquipesPage.tsx`, `UtilisateursPage.tsx`, `ConflitResolutionModal.tsx`, `useArbreDnd.ts`
**Statut :** ❌ À corriger

Les mutations qui échouent n'affichent aucun retour utilisateur — erreur silencieuse en console.

```typescript
// ACTUEL — erreur silencieuse
.catch((err) => console.error('Erreur:', err));

// CORRECTION
.catch((err) => setErreur(`Impossible de supprimer : ${err.message}`));
```

---

### FRONT-02 — `ProjetsPage.tsx` monolithique (971 lignes)

**Sévérité :** MAJEUR
**Fichier :** `frontend/src/pages/ProjetsPage.tsx`
**Statut :** ⚠️ Refactoring recommandé

4 composants imbriqués locaux, 11 `useState`. Candidat principal à la découpe.

**Structure cible :**
```
pages/projets/
├── ProjetsPage.tsx          ← orchestre, état global
├── FormulaireProjet.tsx
├── RestrictionsVisibilite.tsx
└── ModerateursList.tsx
```

---

### FRONT-03 — Props drilling dans la grille de saisie

**Sévérité :** MAJEUR
**Fichiers :** `GrilleSemaine.tsx → LigneSaisie.tsx → CelluleSaisie.tsx`
**Statut :** ⚠️ Refactoring recommandé

Callbacks `onNavigate`, `onHistorique`, `onCycleAbsence` traversent 3 niveaux.
Un `GrilleContext` ou store Zustand dédié éliminerait ce couplage.

---

### FRONT-04 — Logique métier inline dans les pages

**Sévérité :** MAJEUR
**Statut :** ⚠️ Refactoring recommandé

| Page | Problème | Solution |
|------|----------|----------|
| `SaisiePage.tsx:14` | `useIsMobile` défini dans la page | Extraire → `hooks/useIsMobile.ts` |
| `DashboardPage.tsx:15` | `periodeInitiale()` et `tauxCompletion` | Extraire → `hooks/usePeriode.ts` |
| `StatsGlobalesPage.tsx:20` | `dernierJourDuMois()`, `periodePrecedente()` | Idem |
| `SupervisionPage.tsx:90` | `dateVersSemaineISO()` dupliquée | Utiliser import `semaineUtils.ts` |

---

## Problèmes mineurs — Backend

### BACK-MIN-01 — Modèle `Absence` sans soft delete

**Fichier :** `app/Models/Absence.php`
Tous les autres modèles utilisent `SoftDeletes`. Exception non justifiée. Impact RGPD.

### BACK-MIN-02 — `Setting::invaliderToutLeCache()` non optimisé

**Fichier :** `app/Models/Setting.php:96`
Boucle sur tous les settings. `Cache::tags('settings')->flush()` serait plus efficace.

---

## Problèmes mineurs — Frontend

### FRONT-MIN-01 — Types `any` dans les tests

**Fichier :** `stores/authStore.test.ts:24,36,59`
`user as any` → Utiliser `Partial<Utilisateur>`.

### FRONT-MIN-02 — `historiqueEntries` sans `useMemo`

**Fichier :** `GrilleSemaine.tsx:70-82`
Calcul recalculé à chaque render même si la modale est fermée.

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

EV-12 est à **~85% complétée**.

| Item | État |
|------|------|
| Table `absences` dédiée (sans contrainte projet) | ✅ Fait |
| `declarerAbsence` accessible à tous les rôles | ✅ Fait |
| Mode manuel vs API configurable | ✅ Fait |
| Affichage absences dans la grille | ✅ Fait |
| Tests backend PHPUnit | ✅ Fait |
| Notifications lors de `declarerAbsence` | ❌ Manquant (BACK-03) |
| Placeholder token exemple (`Bearer eyJ...`) | ⚠️ Incomplet |
| Tests E2E | ❌ Manquants (FRONT-MIN-03) |
| Documentation `declarerAbsence` dans API_GRAPHQL.md | ❌ Manquant (DOC-02) |

---

## Plan d'action priorisé

### P1 — Sécurité (corrections immédiates)

- [ ] **SEC-01** : `TeamMutator::delete()` + `TeamPolicy::delete()` — ajouter autorisation
- [ ] **SEC-02** : `TimeEntryMutator::bulkUpdate()` — ajouter `Gate::authorize()` par entrée

### P2 — Finaliser EV-12

- [ ] **BACK-03** : Notification dans `declarerAbsence()`
- [ ] **FRONT-MIN-03** : Tests E2E (déclaration manuelle, notification, test connexion API RH)
- [ ] **DOC-02** : Documenter `declarerAbsence` dans `docs/04_API_GRAPHQL.md`
- [ ] Placeholder token API : ajouter exemple `Bearer eyJhbGci...`

### P3 — Qualité code

- [ ] **BACK-01** : `Activity::deleted()` event — ajouter `->withTrashed()`
- [ ] **BACK-02** : Supprimer colonne `niveau` (migration de nettoyage)
- [ ] **FRONT-01** : Remplacer les `console.error` silencieux par des états d'erreur affichés
- [ ] **BACK-04** : Créer `AbsenceService`
- [ ] **BACK-05** : Standardiser les erreurs GraphQL
- [ ] **BACK-06** : Ajouter tests PHPUnit manquants

### P4 — Refactoring et documentation

- [ ] **FRONT-02** : Découper `ProjetsPage.tsx`
- [ ] **FRONT-03** : Réduire props drilling grille de saisie
- [ ] **FRONT-04** : Extraire `useIsMobile`, `usePeriode`, etc.
- [ ] **BACK-MIN-01** : Ajouter `SoftDeletes` au modèle `Absence`
- [ ] **DOC-01** : Corriger React 18 → 19 dans CLAUDE.md
- [ ] **DOC-03** : Mettre à jour statut EV-12 dans CLAUDE.md
- [ ] **DOC-04** : Retirer chiffres de tests manuels

---

## Suivi des corrections

| ID | Titre | Priorité | Statut | Date résolution |
|----|-------|----------|--------|-----------------|
| SEC-01 | TeamMutator autorisation | P1 | ❌ Ouvert | — |
| SEC-02 | bulkUpdate autorisation | P1 | ❌ Ouvert | — |
| BACK-01 | Activity withTrashed | P3 | ❌ Ouvert | — |
| BACK-02 | Colonne niveau inutile | P3 | ❌ Ouvert | — |
| BACK-03 | Notification declarerAbsence | P2 | ❌ Ouvert | — |
| BACK-04 | AbsenceService | P3 | ❌ Ouvert | — |
| BACK-05 | ValidationException GraphQL | P3 | ❌ Ouvert | — |
| BACK-06 | Tests PHPUnit manquants | P3 | ❌ Ouvert | — |
| FRONT-01 | console.error silencieux | P3 | ❌ Ouvert | — |
| FRONT-02 | ProjetsPage monolithique | P4 | ❌ Ouvert | — |
| FRONT-03 | Props drilling grille | P4 | ❌ Ouvert | — |
| FRONT-04 | Logique métier dans pages | P4 | ❌ Ouvert | — |
| FRONT-MIN-01 | Types any dans tests | P4 | ❌ Ouvert | — |
| FRONT-MIN-02 | historiqueEntries useMemo | P4 | ❌ Ouvert | — |
| FRONT-MIN-03 | Tests E2E manquants | P2 | ❌ Ouvert | — |
| DOC-01 | React 18 → 19 | P4 | ❌ Ouvert | — |
| DOC-02 | declarerAbsence non documentée | P2 | ❌ Ouvert | — |
| DOC-03 | EV-12 décision dans CLAUDE.md | P4 | ❌ Ouvert | — |
| DOC-04 | Chiffres tests périmés | P4 | ❌ Ouvert | — |
