# SAND - Evolutions demandees

> Document regroupant les evolutions identifiees lors des tests manuels (2026-02-08).
> A discuter et prioriser avant implementation.

---

## EV-01 : Warning saisie non enregistree

**En tant qu'** utilisateur
**Je veux** etre prevenu si je quitte la page de saisie sans avoir enregistre
**Afin de** ne pas perdre mes modifications

**Description** :
Actuellement, si l'utilisateur modifie des cellules dans la grille hebdomadaire puis navigue vers une autre page, les modifications sont perdues silencieusement. Il faudrait detecter l'etat "dirty" (modifications non sauvegardees) et afficher un avertissement.

**Implementation envisagee** :
- Detecter les modifications non sauvegardees (dirty state) dans le store ou le composant
- Intercepter la navigation avec `useBlocker` de React Router
- Intercepter la fermeture d'onglet avec `beforeunload`
- Afficher un dialogue de confirmation "Modifications non enregistrees. Quitter quand meme ?"

**Complexite** : Moyenne

---

## EV-02 : Changement de parent d'une activite

**En tant qu'** admin
**Je veux** pouvoir deplacer une activite sous un autre parent
**Afin de** reorganiser l'arborescence sans tout supprimer/recreer

**Description** :
Actuellement, on ne peut que monter/descendre une activite parmi ses freres. On ne peut pas deplacer une activite d'un parent a un autre (ex: deplacer "Dev Frontend" de "Developpement" vers "Conception").

**Implementation envisagee** :
- Nouvelle mutation GraphQL `moveActivity(id, newParentId, position)`
- Recalcul du chemin ltree et de tous les descendants
- Mise a jour de `est_feuille` sur l'ancien et le nouveau parent
- Interface : bouton "Deplacer" ouvrant une modale de selection du nouveau parent (arbre simplifie)
- Validation : empecher les cycles (deplacer un parent sous son enfant)

**Complexite** : Moyenne (ltree simplifie le recalcul des chemins)

---

## EV-03 : Drag and drop des activites

**En tant qu'** admin
**Je veux** pouvoir reorganiser les activites par drag and drop
**Afin de** reorganiser rapidement l'arborescence

**Description** :
Permettre le glisser-deposer d'une activite (avec ses enfants) pour la placer a n'importe quel endroit de l'arbre. C'est une extension de EV-02 avec une interface plus intuitive.

**Implementation envisagee** :
- Bibliotheque : `@dnd-kit/core` ou `react-dnd` (a evaluer)
- Indicateurs visuels : ligne d'insertion, zone de depot, indentation
- Support du deplacement entre niveaux (changement de parent + reordonnancement)
- Mise a jour optimiste cote Apollo + rollback en cas d'erreur
- Preservation des enfants attaches lors du deplacement

**Prerequis** : EV-02 (mutation moveActivity)

**Complexite** : Elevee

---

## EV-04 : Vue texte simplifiee des activites

**En tant qu'** admin
**Je veux** editer l'arborescence des activites sous forme de texte
**Afin de** visualiser et modifier rapidement la structure

**Description** :
Vue alternative a l'arbre interactif : un simple champ texte multi-lignes ou les niveaux sont representes par des tabulations. L'admin peut copier-coller une structure entiere.

**Exemple** :
```
Developpement
    Dev Frontend
    Dev Backend
    Tests
Conception
    UX Design
    Architecture
Absence (systeme)
```

**Implementation envisagee** :
- Onglet "Vue texte" / "Vue arbre" dans la page Activites
- Parser le texte : indentation (tab ou 4 espaces) = niveau
- Validation stricte : sanitisation anti-injection, noms uniques par niveau
- Diff avec l'arbre existant : creations, suppressions, deplacements
- Confirmation avant application des changements
- Protection des activites systeme (Absence ne peut pas etre modifiee/supprimee)

**Securite** :
- Sanitisation des noms (pas de HTML, pas de caracteres speciaux ltree)
- Validation longueur max des noms
- Preview des changements avant application

**Complexite** : Elevee

---

## EV-05 : Reset par defaut des parametres

**En tant qu'** admin
**Je veux** pouvoir reinitialiser les parametres a leurs valeurs par defaut
**Afin de** revenir a la configuration initiale en cas de probleme

**Implementation envisagee** :
- Bouton "Reinitialiser les valeurs par defaut" dans la page Configuration
- Dialogue de confirmation
- Valeurs par defaut definies cote backend (dans `SettingSeeder` ou constantes)
- Mutation `resetSettings` ou reutilisation de `updateSettings` avec les valeurs par defaut

**Complexite** : Faible

---

## EV-06 : Suppression des donnees (RGPD)

**En tant qu'** admin
**Je veux** pouvoir supprimer les donnees d'un utilisateur ou de toute l'application
**Afin de** respecter le droit a l'oubli (RGPD) et permettre une remise a zero

**Deux niveaux** :

### EV-06a : Suppression donnees utilisateur (RGPD)
- Supprimer toutes les saisies, absences, notifications d'un utilisateur
- Anonymiser les logs d'historique (remplacer le nom par "Utilisateur supprime")
- Conserver la trace de l'action (qui a demande, quand)
- Confirmer par double saisie ou mot de passe admin

### EV-06b : Purge totale des donnees
- Supprimer toutes les saisies, absences, notifications, exports, logs
- Conserver la structure (utilisateurs, equipes, projets, activites, parametres)
- Confirmer par saisie d'une phrase de securite (ex: "CONFIRMER SUPPRESSION")
- Reservation admin uniquement

**Complexite** : Moyenne (EV-06a) / Moyenne (EV-06b)

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

| ID | Evolution | Complexite | Prerequis |
|----|-----------|------------|-----------|
| EV-01 | Warning saisie non enregistree | Moyenne | - |
| EV-02 | Changement de parent activite | Moyenne | - |
| EV-03 | Drag and drop activites | Elevee | EV-02 |
| EV-04 | Vue texte activites | Elevee | - |
| EV-05 | Reset parametres par defaut | Faible | - |
| EV-06a | Suppression donnees RGPD | Moyenne | - |
| EV-06b | Purge totale | Moyenne | - |
| EV-07 | Absences dans grille de saisie | Moyenne | - | ✅ |

---

*Document cree le 2026-02-08*
