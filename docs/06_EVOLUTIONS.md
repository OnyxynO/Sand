# SAND - Évolutions demandées

> Document regroupant les évolutions identifiées lors des tests manuels (2026-02-08).
> À discuter et prioriser avant implémentation.

---

## EV-01 : Warning saisie non enregistree ✅

**En tant qu'** utilisateur
**Je veux** etre prevenu si je quitte la page de saisie sans avoir enregistre
**Afin de** ne pas perdre mes modifications

**Statut** : Implémentée

**Modifications réalisées** :
- Detection dirty state dans le composant SaisiePage
- Interception navigation avec `useBlocker` de React Router
- Interception fermeture d'onglet avec `beforeunload`
- Dialogue de confirmation affiche

**Complexité** : Moyenne

---

## EV-02 : Changement de parent d'une activite ✅

**En tant qu'** admin
**Je veux** pouvoir deplacer une activite sous un autre parent
**Afin de** reorganiser l'arborescence sans tout supprimer/recreer

**Statut** : Implémentée

**Modifications réalisées** :
- Mutation GraphQL `moveActivity(id, parentId, ordre)` (backend existant)
- Composant `SelectionParentModal.tsx` : modale de selection du nouveau parent dans l'arbre
- Bouton "Deplacer" sur chaque activite non-systeme dans `ActivitesPage.tsx`
- Validation : empeche les cycles (ne peut pas deplacer un parent sous son enfant)

**Complexité** : Moyenne

---

## EV-03 : Drag and drop des activites ✅

**En tant qu'** admin
**Je veux** pouvoir reorganiser les activites par drag and drop
**Afin de** reorganiser rapidement l'arborescence

**Statut** : Implémentée

**Modifications réalisées** :
- Bibliotheque `@dnd-kit/core` + `@dnd-kit/sortable` + `@dnd-kit/utilities`
- Hook `useArbreDnd.ts` : gestion du drag-and-drop sur arbre aplati, detection du type de drop (entre-freres ou devenir-enfant), validation (activites systeme non deplacables)
- Composant `LigneActiviteDnd` : poignee de drag, indicateurs visuels (ligne bleue, surbrillance)
- Overlay de drag avec `DragPreview`
- Tests : `useArbreDnd.test.ts` (18 tests), `ActivitesPage.dnd.test.tsx` (5 tests)

**Complexité** : Élevée

---

## EV-04 : Vue texte simplifiee des activites ✅

**En tant qu'** admin
**Je veux** editer l'arborescence des activites sous forme de texte
**Afin de** visualiser et modifier rapidement la structure

**Statut** : Implémentée

**Modifications réalisées** :
- Hook `useParserArbreTexte.ts` : 4 fonctions pures (`arbreVersTexte`, `texteVersArbre`, `validerTexte`, `calculerDiff`)
- Composant `VueTexteActivites.tsx` : interface en 3 etapes (edition textarea, previsualisation diff coloree, application sequentielle des mutations)
- Onglets "Vue arbre" / "Vue texte" dans `ActivitesPage.tsx`
- Validation : noms vides, trop longs, codes trop longs, sauts de niveau, doublons freres, caracteres interdits ltree, protection des activites systeme
- Tests : `useParserArbreTexte.test.ts` (24 tests), `VueTexteActivites.test.tsx` (7 tests)

**Complexité** : Élevée

---

## EV-05 : Reset par defaut des parametres ✅

**En tant qu'** admin
**Je veux** pouvoir reinitialiser les parametres a leurs valeurs par defaut
**Afin de** revenir a la configuration initiale en cas de probleme

**Statut** : Implémentée

**Modifications réalisées** :
- Bouton "Reinitialiser les valeurs par defaut" dans la page Configuration
- Dialogue de confirmation
- Mutation `resetSettings` cote backend

**Complexité** : Faible

---

## EV-06 : Suppression des donnees (RGPD) ✅

**En tant qu'** admin
**Je veux** pouvoir supprimer les donnees d'un utilisateur ou de toute l'application
**Afin de** respecter le droit a l'oubli (RGPD) et permettre une remise a zero

**Statut** : Implémentée (2026-02-15)

**Modifications réalisées** :

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

**Complexité** : Moyenne

---

## EV-07 : Affichage des absences dans la grille de saisie ✅

**En tant qu'** utilisateur
**Je veux** voir mes absences (conges, RTT, maladie, formation) dans la grille de saisie hebdomadaire
**Afin de** savoir quels jours sont deja couverts et eviter de saisir sur un jour d'absence

**Statut** : Implémentée (2026-02-14)

**Modifications réalisées** :

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

**Complexité** : Moyenne

---

## EV-08 : Absences — mode manuel vs API externe configurable ✅

**En tant qu'** admin
**Je veux** choisir entre gestion manuelle des absences et import depuis une API RH externe
**Afin de** adapter l'application a mon contexte (avec ou sans API RH)

**Statut** : Implémentée (2026-02-22)

**Modifications réalisées** :
- Setting `absence_mode` (valeurs : `manuel` ou `api`), `absence_api_url`, `absence_api_token`
- Page Configuration : section "Gestion des absences" avec toggle mode + champs URL/token conditionnels
- Backend : `RhApiClient` utilise le token configure, `AbsenceMutator` branche sur le mode actif
- Mode manuel : declaration directe via `declarerAbsence` (pas d'appel API)
- Mode API : `syncAbsences` appelle l'API RH externe avec le token configure

**Complexité** : Moyenne

---

## EV-09 : Export CSV — ajustements UX ✅

**En tant qu'** admin
**Je veux** une experience d'export CSV amelioree
**Afin de** lancer et suivre les exports facilement

**Statut** : Implémentée (2026-02-22)

**Modifications réalisées** :
- Bouton "Supprimer tout" dans le panneau de notifications pour vider d'un coup
- Lien de telechargement direct dans la notification TYPE_EXPORT_PRET
- Indicateur visuel pendant le traitement du job asynchrone

**Complexité** : Faible

---

## EV-10 : Notifications — bouton "Supprimer tout" ✅

**En tant qu'** utilisateur
**Je veux** pouvoir supprimer toutes mes notifications en un clic
**Afin de** vider rapidement le panneau

**Statut** : Implémentée (2026-02-22)

**Modifications réalisées** :
- Bouton "Supprimer tout" dans le panneau de notifications (slide-over)
- Mutation GraphQL `supprimerToutesNotifications`
- Resolver + Policy backend
- Tests PHPUnit associes

**Complexité** : Faible

---

## EV-11 : Notifications — synchronisation reactive sur fin d'export ✅

**En tant qu'** utilisateur
**Je veux** que la notification d'export pret apparaisse sans avoir a rafraichir
**Afin de** savoir immediatement quand mon export est disponible

**Statut** : Implémentée (2026-02-22)

**Modifications réalisées** :
- Polling renforce du store notifications lors d'un export en cours (passage de 60s a 5s)
- Detection etat "export en attente" dans le store Zustand
- Retour au polling 60s une fois l'export pret ou echoue

**Complexité** : Faible

---

## EV-12 : Absences — refonte mecanique complete ✅

**En tant qu'** utilisateur
**Je veux** declarer mes absences manuellement avec selection du type et de la duree
**Afin de** avoir un suivi precis de mes absences sans API RH

**Statut** : Implémentée (2026-02-23)

**Modifications réalisées** :

Backend :
- Table `absences` dediee (separee de `time_entries`), avec soft delete
- `AbsenceService` : logique metier extraite de `AbsenceMutator` (flux RH, flux manuel, flux admin)
- Mutation `declarerAbsence` : parametre `type` (motif) + `userId` (admin/modo pour autrui)
- Notification utilisateur a chaque declaration effective (duree > 0)
- 15 tests PHPUnit (types, durees, roles, notifications, cas limites)

Frontend :
- Modale de selection type+duree au premier clic sur une cellule absence (mode manuel)
- Cycle duree seul au clic suivant (le type est preserve)
- Prop `userId` propagee dans `BlocAbsences` et `SaisiePage` (admin/modo)
- Tests E2E : `absences-ev12.spec.ts` (declaration manuelle + notifications)

**Complexité** : Élevée

---

## Résumé et priorisation

| ID | Évolution | Complexité | Statut |
|----|-----------|------------|--------|
| EV-01 | Warning saisie non enregistrée | Moyenne | ✅ |
| EV-02 | Changement de parent activité | Moyenne | ✅ |
| EV-03 | Drag and drop activités | Élevée | ✅ |
| EV-04 | Vue texte activités | Élevée | ✅ |
| EV-05 | Reset paramètres par défaut | Faible | ✅ |
| EV-06 | Suppression données RGPD + purge | Moyenne | ✅ |
| EV-07 | Absences dans grille de saisie | Moyenne | ✅ |
| EV-08 | Absences mode manuel vs API | Moyenne | ✅ |
| EV-09 | Export CSV ajustements UX | Faible | ✅ |
| EV-10 | Notifications — Supprimer tout | Faible | ✅ |
| EV-11 | Notifications — sync réactive export | Faible | ✅ |
| EV-12 | Absences — refonte mécanique complète | Élevée | ✅ |

---

## Reste à faire (hors fonctionnel)

Toutes les évolutions fonctionnelles sont implémentées. Il reste des tâches de qualité et d'outillage.

### Tests manquants

Tous les tests identifiés ont été implémentés :
- ✅ T1.2 : Tests unitaires `RhApiClient` (11 tests, `Http::fake()`)
- ✅ T3.1 : Tests de `transformerAbsences` dans `useSaisieHebdo` (8 tests)

### Outillage et documentation

| Tâche | Description | Priorité | Statut |
|-------|-------------|----------|--------|
| `.env.example` | Valeurs Docker pré-remplies + CACHE_STORE=redis | Haute | ✅ |
| `README.md` | Guide complet : prérequis, installation, troubleshooting, comptes de test | Haute | ✅ |
| `scripts/install.sh` | Script automatisé : docker compose up + migrate + seed + smoke test | Moyenne | ✅ |
| `.gitattributes` | Forcer LF sur scripts shell (éviter problèmes CRLF Windows) | Faible | ⏳ |
| Documentation API | `04_API_GRAPHQL.md` maintenu à jour | Faible | ✅ |

### Deja fait (infrastructure)

Ces taches bonus de `docs/archive/AVANCEMENT.md` sont deja realisees :
- ✅ Healthchecks Docker (T0.2 : PostgreSQL, Redis, nginx, mock-rh)
- ✅ Smoke tests (`tests/smoke-test.sh`)
- ✅ Validation schema front/back (`graphql-codegen`)

---

*Document cree le 2026-02-08, mis a jour le 2026-02-23*
