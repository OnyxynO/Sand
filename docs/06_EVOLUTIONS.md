# SAND - Evolutions demandees

> Document regroupant les evolutions identifiees lors des tests manuels (2026-02-08).
> A discuter et prioriser avant implementation.

---

## EV-01 : Warning saisie non enregistree ✅

**En tant qu'** utilisateur
**Je veux** etre prevenu si je quitte la page de saisie sans avoir enregistre
**Afin de** ne pas perdre mes modifications

**Statut** : Implementee

**Modifications realisees** :
- Detection dirty state dans le composant SaisiePage
- Interception navigation avec `useBlocker` de React Router
- Interception fermeture d'onglet avec `beforeunload`
- Dialogue de confirmation affiche

**Complexite** : Moyenne

---

## EV-02 : Changement de parent d'une activite ✅

**En tant qu'** admin
**Je veux** pouvoir deplacer une activite sous un autre parent
**Afin de** reorganiser l'arborescence sans tout supprimer/recreer

**Statut** : Implementee

**Modifications realisees** :
- Mutation GraphQL `moveActivity(id, parentId, ordre)` (backend existant)
- Composant `SelectionParentModal.tsx` : modale de selection du nouveau parent dans l'arbre
- Bouton "Deplacer" sur chaque activite non-systeme dans `ActivitesPage.tsx`
- Validation : empeche les cycles (ne peut pas deplacer un parent sous son enfant)

**Complexite** : Moyenne

---

## EV-03 : Drag and drop des activites ✅

**En tant qu'** admin
**Je veux** pouvoir reorganiser les activites par drag and drop
**Afin de** reorganiser rapidement l'arborescence

**Statut** : Implementee

**Modifications realisees** :
- Bibliotheque `@dnd-kit/core` + `@dnd-kit/sortable` + `@dnd-kit/utilities`
- Hook `useArbreDnd.ts` : gestion du drag-and-drop sur arbre aplati, detection du type de drop (entre-freres ou devenir-enfant), validation (activites systeme non deplacables)
- Composant `LigneActiviteDnd` : poignee de drag, indicateurs visuels (ligne bleue, surbrillance)
- Overlay de drag avec `DragPreview`
- Tests : `useArbreDnd.test.ts` (18 tests), `ActivitesPage.dnd.test.tsx` (5 tests)

**Complexite** : Elevee

---

## EV-04 : Vue texte simplifiee des activites ✅

**En tant qu'** admin
**Je veux** editer l'arborescence des activites sous forme de texte
**Afin de** visualiser et modifier rapidement la structure

**Statut** : Implementee

**Modifications realisees** :
- Hook `useParserArbreTexte.ts` : 4 fonctions pures (`arbreVersTexte`, `texteVersArbre`, `validerTexte`, `calculerDiff`)
- Composant `VueTexteActivites.tsx` : interface en 3 etapes (edition textarea, previsualisation diff coloree, application sequentielle des mutations)
- Onglets "Vue arbre" / "Vue texte" dans `ActivitesPage.tsx`
- Validation : noms vides, trop longs, codes trop longs, sauts de niveau, doublons freres, caracteres interdits ltree, protection des activites systeme
- Tests : `useParserArbreTexte.test.ts` (24 tests), `VueTexteActivites.test.tsx` (7 tests)

**Complexite** : Elevee

---

## EV-05 : Reset par defaut des parametres ✅

**En tant qu'** admin
**Je veux** pouvoir reinitialiser les parametres a leurs valeurs par defaut
**Afin de** revenir a la configuration initiale en cas de probleme

**Statut** : Implementee

**Modifications realisees** :
- Bouton "Reinitialiser les valeurs par defaut" dans la page Configuration
- Dialogue de confirmation
- Mutation `resetSettings` cote backend

**Complexite** : Faible

---

## EV-06 : Suppression des donnees (RGPD) ✅

**En tant qu'** admin
**Je veux** pouvoir supprimer les donnees d'un utilisateur ou de toute l'application
**Afin de** respecter le droit a l'oubli (RGPD) et permettre une remise a zero

**Statut** : Implementee (2026-02-15)

**Modifications realisees** :

Backend :
- Migration : colonne `user_anonymise` sur `time_entry_logs`
- Service `RgpdService` : deux methodes transactionnelles (`supprimerDonneesUtilisateur`, `purgerToutesDonnees`)
- Schema GraphQL : types `ResultatSuppressionRgpd` et `ResultatPurge`, mutations `supprimerDonneesUtilisateur` et `purgerToutesDonnees`
- Resolver `RgpdMutator` : verification admin + confirmation nom/phrase
- Gestion FK cascade : les logs lies aux saisies de l'utilisateur sont supprimes, les logs ou l'utilisateur est auteur de modifications sur d'autres saisies sont anonymises (`user_anonymise = true`)
- Tests : 8 tests (suppression OK, anonymisation logs moderateur, refus non-admin, mauvais nom, purge OK, structure conservee, refus non-admin, mauvaise phrase)

Frontend :
- Operations GraphQL : mutations `SUPPRIMER_DONNEES_UTILISATEUR` et `PURGER_TOUTES_DONNEES`
- Page `/admin/rgpd` (`RgpdPage.tsx`) : deux sections (suppression utilisateur avec select + modale de confirmation nom, purge totale avec modale de confirmation phrase), affichage des compteurs apres operation
- Navigation : onglet RGPD dans `NavAdmin.tsx`, route dans `App.tsx`
- Tests : 9 tests (titre, chargement utilisateurs, selection, modale suppression, bouton desactive, resultats suppression, modale purge, bouton purge desactive, resultats purge)

**Complexite** : Moyenne

---

## EV-07 : Affichage des absences dans la grille de saisie ✅

**En tant qu'** utilisateur
**Je veux** voir mes absences (conges, RTT, maladie, formation) dans la grille de saisie hebdomadaire
**Afin de** savoir quels jours sont deja couverts et eviter de saisir sur un jour d'absence

**Statut** : Implementee (2026-02-14)

**Modifications realisees** :

Backend :
- Nouveau resolver `AbsencesQuery.php` utilisant le scope `periode()` pour detecter les chevauchements (absences debordant de la semaine)
- Query `absences` dans `queries.graphql` : remplacement de `@where` + `@all` par `@field(resolver:)` (corrige le bug de non-detection des absences chevauchantes)

Frontend :
- Queries GraphQL `ABSENCES_SEMAINE` et mutation `SYNC_ABSENCES` dans `saisie.ts`
- Types `AbsenceJour` et `AbsenceAPI` dans `types/index.ts`
- Hook `useSaisieHebdo` : charge les absences en parallele des saisies, appelle `syncAbsences` au chargement (best effort - ignore les erreurs d'autorisation pour utilisateurs simples), transforme les plages de dates en map `jour→absence`, retourne `absencesParJour`
- `GrilleSemaine.tsx` : ligne indigo en haut du tbody avec icone CalendarDaysIcon, type d'absence et duree par jour (affichee uniquement si au moins 1 absence)
- `GrilleSemaineMobile.tsx` : bandeau indigo dans chaque carte jour avec type + duree ETP
- `TotauxJournaliers.tsx` : inclut la duree d'absence dans le total journalier
- `SaisiePage.tsx` : passe `absencesParJour` aux composants grille via props

**Complexite** : Moyenne

---

## Resume et priorisation proposee

| ID | Evolution | Complexite | Statut |
|----|-----------|------------|--------|
| EV-01 | Warning saisie non enregistree | Moyenne | ✅ |
| EV-02 | Changement de parent activite | Moyenne | ✅ |
| EV-03 | Drag and drop activites | Elevee | ✅ |
| EV-04 | Vue texte activites | Elevee | ✅ |
| EV-05 | Reset parametres par defaut | Faible | ✅ |
| EV-06 | Suppression donnees RGPD + purge | Moyenne | ✅ |
| EV-07 | Absences dans grille de saisie | Moyenne | ✅ |

---

## Reste a faire (hors fonctionnel)

Toutes les evolutions fonctionnelles sont implementees. Il reste des taches de qualite et d'outillage identifiees dans les archives (`docs/archive/PLAN_TESTS.md`, `docs/archive/AVANCEMENT.md`).

### Tests manquants

Tous les tests identifies ont ete implementes :
- ✅ T1.2 : Tests unitaires `RhApiClient` (11 tests, `Http::fake()`)
- ✅ T3.1 : Tests de `transformerAbsences` dans `useSaisieHebdo` (8 tests)

### Outillage et documentation

| Tache | Description | Priorite |
|-------|-------------|----------|
| `.env.example` | Mettre a jour avec les valeurs Docker pre-remplies | Haute |
| `README.md` | Guide complet : prerequis, installation, troubleshooting, comptes de test | Haute |
| `scripts/install.sh` | Script automatise : docker-compose up + migrate + seed + smoke test | Moyenne |
| `.gitattributes` | Forcer LF sur scripts shell (eviter problemes CRLF Windows) | Faible |
| Documentation API | Export du schema GraphQL dans un format lisible (HTML ou MD) | Faible |

### Deja fait (infrastructure)

Ces taches bonus de `docs/archive/AVANCEMENT.md` sont deja realisees :
- ✅ Healthchecks Docker (T0.2 : PostgreSQL, Redis, nginx, mock-rh)
- ✅ Smoke tests (`tests/smoke-test.sh`)
- ✅ Validation schema front/back (`graphql-codegen`)

---

*Document cree le 2026-02-08, mis a jour le 2026-02-15*
