# Debug Arborescence Activites

## 1. Etat actuel de la base de donnees

```
 id |        nom        | parent_id | chemin | niveau | ordre | est_feuille
----+-------------------+-----------+--------+--------+-------+-------------
  1 | Absence           |      NULL | 1      |      0 |     0 | t
 19 | rrrrr             |      NULL | 19     |      0 |    11 | t
  2 | Developpement     |      NULL | 2      |      0 |     5 | f
  4 | Frontend          |         2 | 2.4    |      2 |     1 | t   <-- PROBLEME niveau=2 devrait etre 1
 20 | ttttt             |      NULL | 20     |      0 |     4 | t
 21 | qqqqq             |      NULL | 21     |      0 |    14 | t
 22 | aaaaa             |      NULL | 22     |      0 |    13 | t
 23 | wwww              |      NULL | 23     |      0 |    12 | t
 24 | qaaaa             |      NULL | 24     |      0 |    15 | t
  3 | Backend end       |      NULL | 3      |      0 |     6 | t   <-- Etait enfant de 2 ?
  5 | Gestion de projet |      NULL | 5      |      0 |    10 | f
  6 | Reunions          |         5 | 5.6    |      2 |     0 | t   <-- PROBLEME niveau=2 devrait etre 1
  7 | Planification     |         5 | 5.7    |      1 |     1 | t   <-- OK
  8 | Support           |      NULL | 8      |      0 |     2 | t
```

### Problemes detectes

1. **Niveaux incoherents** :
   - `Frontend` (id=4) : `parent_id=2`, `chemin=2.4`, mais `niveau=2` (devrait etre 1)
   - `Reunions` (id=6) : `parent_id=5`, `chemin=5.6`, mais `niveau=2` (devrait etre 1)
   - Formule correcte : `niveau = nombre de points dans chemin = profondeur`

2. **Ordres chaotiques** :
   - Les ordres des racines : 0, 11, 5, 4, 14, 13, 12, 15, 6, 10, 2
   - Pas de sequence continue (0, 1, 2, 3...)

---

## 2. Analyse du code backend

### 2.1 Query `arbreActivites`

```graphql
arbreActivites: [Activity!]!
    @all(model: "App\\Models\\Activity", scopes: ["racine", "ordreHierarchique"])
```

- `scopeRacine` : `whereNull('parent_id')` - ne retourne que les racines
- `scopeOrdreHierarchique` : `orderBy('chemin')` - tri par chemin

**Probleme** : La query retourne les racines, mais les enfants sont charges via la relation `enfants()` dans le fragment GraphQL. Ca devrait fonctionner.

### 2.2 Mutation `createActivity`

```php
$parentId = $args['parentId'] ?? null;  // <-- parentId vient des args
$parent = $parentId ? Activity::findOrFail($parentId) : null;
$niveau = $parent ? $parent->niveau + 1 : 0;
```

**Probleme potentiel** : Le `parentId` doit etre passe correctement depuis le frontend.

### 2.3 Mutation `moveActivity` (fleches)

```php
$newParentId = $args['parentId'] ?? null;  // parentId = nouveau parent
$newOrdre = $args['ordre'];                // ordre cible
```

**Probleme** : Le frontend passe `parentId: null` pour garder le meme parent, mais cote backend on compare :
```php
if ($newParentId !== $oldParentId)  // null !== 2 => true !
```

Quand on veut juste reordonner (pas changer de parent), le frontend envoie `parentId: null` mais `$oldParentId` peut etre un entier. La comparaison `null !== 2` est vraie, donc on entre dans le bloc de changement de parent alors qu'on ne devrait pas !

---

## 3. Analyse du code frontend

### 3.1 Creation d'enfant (bouton +)

```tsx
// Ligne 144-149 dans ActivitesPage.tsx
<button
  onClick={() => onAjouterEnfant(activite.id)}  // Passe l'ID du parent
  ...
>
```

```tsx
// Ligne 467-471
const ouvrirCreation = (parentId: string | null = null) => {
  setActiviteEditee(null);
  setParentIdPourCreation(parentId);  // Stocke le parentId
  setModaleOuverte(true);
};
```

```tsx
// Ligne 283-293 - Envoi de la mutation
await createActivity({
  variables: {
    input: {
      ...
      parentId: parentId || null,  // parentId est passe ici
    },
  },
});
```

**Semble correct** - le parentId est bien passe.

### 3.2 Fleches monter/descendre

```tsx
// Ligne 508-524
const handleMonter = async (activite: Activite) => {
  const freres = trouverFreres(activite.id);
  const index = freres.findIndex((f) => f.id === activite.id);
  if (index <= 0) return;

  try {
    await moveActivity({
      variables: {
        id: activite.id,
        parentId: null,           // <-- PROBLEME ICI ! Toujours null
        ordre: freres[index - 1].ordre,  // Ordre du frere au-dessus
      },
    });
    refetch();
  }
};
```

**PROBLEME IDENTIFIE** :
- Le frontend passe `parentId: null` pour dire "ne pas changer de parent"
- Mais le backend interprete ca comme "deplacer vers la racine"

---

## 4. Bugs identifies et corrections

### BUG 1 : moveActivity - parentId null vs undefined

**Frontend** (ActivitesPage.tsx lignes 514-518) :
```tsx
await moveActivity({
  variables: {
    id: activite.id,
    parentId: null,  // FAUX - dit "aller a la racine"
    ordre: freres[index - 1].ordre,
  },
});
```

**Correction** : Ne pas envoyer `parentId` si on ne change pas de parent, OU passer le parent actuel.

### BUG 2 : Backend - comparaison de types

**Backend** (ActivityMutator.php ligne 124) :
```php
if ($newParentId !== $oldParentId)
```

`$newParentId` est `null` (string depuis GraphQL ou null)
`$oldParentId` est `int` ou `null`

La comparaison stricte `null !== 2` retourne `true` meme si on ne veut pas changer de parent.

**Correction** : Ajouter un flag explicite ou comparer correctement :
```php
// Option 1 : Permettre de ne pas envoyer parentId
$changeParent = array_key_exists('parentId', $args);

// Option 2 : Comparer en castant
if ((int)$newParentId !== (int)$oldParentId)
```

### BUG 3 : Calcul du niveau incorrect

Le niveau doit etre `nombre de segments dans chemin - 1` ou `profondeur depuis racine`.

Pour `chemin = "2.4"` : niveau = 1 (1 point = 1 niveau de profondeur)
Pour `chemin = "5.6.7"` : niveau = 2 (2 points)

Actuellement certaines activites ont des niveaux incorrects.

---

## 5. Corrections a appliquer

### 5.1 Frontend - handleMonter/handleDescendre

Passer le parent actuel au lieu de null :

```tsx
const handleMonter = async (activite: Activite) => {
  const freres = trouverFreres(activite.id);
  const index = freres.findIndex((f) => f.id === activite.id);
  if (index <= 0) return;

  // Trouver le parentId actuel
  const parentId = trouverParentId(activite.id);  // A implementer

  try {
    await moveActivity({
      variables: {
        id: activite.id,
        parentId: parentId,  // Passer le vrai parent, pas null
        ordre: freres[index - 1].ordre,
      },
    });
    refetch();
  }
};
```

### 5.2 Backend - Ne pas changer de parent si non demande

```php
public function move($root, array $args): Activity
{
    // ...
    return DB::transaction(function () use ($activity, $args) {
        // Seulement changer de parent si explicitement demande
        $changeParent = array_key_exists('parentId', $args) && $args['parentId'] !== null;

        if ($changeParent) {
            $newParentId = $args['parentId'];
            // ... logique de changement de parent
        }

        // Reordonner avec le parent actuel
        $newOrdre = $args['ordre'];
        // ...
    });
}
```

### 5.3 Script de reparation de la base

```sql
-- Recalculer les niveaux
UPDATE activities SET niveau = (LENGTH(chemin) - LENGTH(REPLACE(chemin, '.', '')));

-- Reordonner proprement les racines
WITH ordered AS (
  SELECT id, ROW_NUMBER() OVER (ORDER BY ordre) - 1 as new_ordre
  FROM activities WHERE parent_id IS NULL
)
UPDATE activities SET ordre = ordered.new_ordre
FROM ordered WHERE activities.id = ordered.id;
```

---

## 6. Resume

| Probleme | Localisation | Cause | Correction |
|----------|--------------|-------|------------|
| Fleches ne marchent pas | Frontend + Backend | `parentId: null` interprete comme "racine" | Passer le vrai parentId |
| Ajout enfant a la racine | Frontend ou Backend | parentId pas transmis correctement | Debug les args recus |
| Niveaux incorrects | Base de donnees | Bug precedent ou seeder | Script SQL de correction |
| Ordres chaotiques | Base de donnees | Pas de compactage apres operations | Ajouter logique de reordonnancement |

---

## 7. Pseudo-algorithmes des actions

### 7.1 Structure de donnees

```
Activite {
    id: int                 // Identifiant unique auto-increment
    nom: string             // Nom affiche
    code: string?           // Code court optionnel
    description: string?    // Description optionnelle
    parent_id: int?         // NULL si racine, sinon ID du parent
    chemin: string          // Path materialise "1.2.3" (ID.ID.ID)
    niveau: int             // Profondeur (0 = racine, 1 = enfant direct, etc.)
    ordre: int              // Position parmi les freres (0, 1, 2...)
    est_feuille: bool       // true si pas d'enfants (saisissable)
    est_systeme: bool       // true si protege (ex: Absence)
    est_actif: bool         // true si visible/utilisable
}
```

### 7.2 Invariants a maintenir

```
INVARIANT_1: chemin = parent.chemin + "." + id  (ou juste id si racine)
INVARIANT_2: niveau = nombre de "." dans chemin = profondeur
INVARIANT_3: est_feuille = (nombre d'enfants == 0)
INVARIANT_4: ordre est unique parmi les freres (meme parent_id)
INVARIANT_5: les ordres des freres forment une sequence 0, 1, 2... (idealement)
```

---

### 7.3 CREER une activite

```
FONCTION creerActivite(nom, code, description, parentId, estActif):

    // 1. Valider
    SI parentId != NULL:
        parent = trouverActivite(parentId)
        SI parent == NULL:
            ERREUR "Parent introuvable"
    SINON:
        parent = NULL

    // 2. Calculer les champs derives
    SI parent != NULL:
        niveau = parent.niveau + 1
        // Le parent n'est plus une feuille
        SI parent.est_feuille == true:
            parent.est_feuille = false
            SAUVEGARDER parent
    SINON:
        niveau = 0

    // 3. Calculer l'ordre (dernier parmi les freres)
    ordre = MAX(ordre) des activites WHERE parent_id = parentId
    SI ordre == NULL:
        ordre = 0
    SINON:
        ordre = ordre + 1

    // 4. Creer avec chemin temporaire (on n'a pas encore l'ID)
    activite = NOUVELLE Activite {
        nom: nom,
        code: code,
        description: description,
        parent_id: parentId,
        niveau: niveau,
        ordre: ordre,
        est_feuille: true,      // Nouvelle = pas d'enfants
        est_systeme: false,     // Jamais systeme a la creation
        est_actif: estActif,
        chemin: "TEMP"
    }
    SAUVEGARDER activite  // Obtient son ID

    // 5. Calculer le vrai chemin avec l'ID
    SI parent != NULL:
        activite.chemin = parent.chemin + "." + activite.id
    SINON:
        activite.chemin = STR(activite.id)
    SAUVEGARDER activite

    RETOURNER activite
```

---

### 7.4 MODIFIER une activite

```
FONCTION modifierActivite(id, nom, code, description, estActif):

    activite = trouverActivite(id)

    // 1. Verifier les contraintes
    SI activite.est_systeme == true:
        ERREUR "Activite systeme non modifiable"

    // 2. Mettre a jour les champs simples
    // (pas de changement de parent_id, chemin, niveau, ordre ici)
    activite.nom = nom SI nom != NULL
    activite.code = code SI code != NULL
    activite.description = description SI description != NULL
    activite.est_actif = estActif SI estActif != NULL

    SAUVEGARDER activite
    RETOURNER activite
```

---

### 7.5 SUPPRIMER une activite (soft delete)

```
FONCTION supprimerActivite(id):

    activite = trouverActivite(id)

    // 1. Verifier les contraintes
    SI activite.est_systeme == true:
        ERREUR "Activite systeme non supprimable"

    // 2. Soft delete (marquer deleted_at)
    activite.deleted_at = MAINTENANT()
    SAUVEGARDER activite

    // 3. OPTIONNEL: Recalculer est_feuille du parent
    SI activite.parent_id != NULL:
        parent = trouverActivite(activite.parent_id)
        nbEnfantsRestants = COMPTER activites WHERE parent_id = parent.id AND deleted_at IS NULL
        SI nbEnfantsRestants == 0:
            parent.est_feuille = true
            SAUVEGARDER parent

    // 4. OPTIONNEL: Compacter les ordres des freres
    // (pour eviter les trous: 0, 2, 3 -> 0, 1, 2)

    RETOURNER true
```

---

### 7.6 MONTER une activite (fleche haut)

```
FONCTION monterActivite(id):

    activite = trouverActivite(id)

    // 1. Trouver les freres (meme parent_id) tries par ordre
    freres = TROUVER activites WHERE parent_id = activite.parent_id ORDER BY ordre

    // 2. Trouver la position actuelle
    index = POSITION de activite dans freres

    // 3. Verifier si possible
    SI index <= 0:
        RETOURNER activite  // Deja en haut, rien a faire

    // 4. Echanger avec le frere au-dessus
    frereDessus = freres[index - 1]

    ordreTemp = activite.ordre
    activite.ordre = frereDessus.ordre
    frereDessus.ordre = ordreTemp

    SAUVEGARDER activite
    SAUVEGARDER frereDessus

    RETOURNER activite
```

**Alternative plus robuste (decalage):**

```
FONCTION monterActivite_v2(id, nouvelOrdre):

    activite = trouverActivite(id)
    ancienOrdre = activite.ordre

    // Ne rien faire si meme position
    SI nouvelOrdre == ancienOrdre:
        RETOURNER activite

    SI nouvelOrdre < ancienOrdre:
        // Monter: decaler vers le bas les activites entre nouvelOrdre et ancienOrdre
        POUR CHAQUE a dans activites
            WHERE parent_id = activite.parent_id
            AND id != activite.id
            AND ordre >= nouvelOrdre
            AND ordre < ancienOrdre:
                a.ordre = a.ordre + 1
                SAUVEGARDER a

    activite.ordre = nouvelOrdre
    SAUVEGARDER activite

    RETOURNER activite
```

---

### 7.7 DESCENDRE une activite (fleche bas)

```
FONCTION descendreActivite(id):

    activite = trouverActivite(id)

    // 1. Trouver les freres tries par ordre
    freres = TROUVER activites WHERE parent_id = activite.parent_id ORDER BY ordre

    // 2. Trouver la position actuelle
    index = POSITION de activite dans freres

    // 3. Verifier si possible
    SI index >= TAILLE(freres) - 1:
        RETOURNER activite  // Deja en bas, rien a faire

    // 4. Echanger avec le frere en-dessous
    frereDessous = freres[index + 1]

    ordreTemp = activite.ordre
    activite.ordre = frereDessous.ordre
    frereDessous.ordre = ordreTemp

    SAUVEGARDER activite
    SAUVEGARDER frereDessous

    RETOURNER activite
```

---

### 7.8 DEPLACER une activite (changer de parent)

```
FONCTION deplacerActivite(id, nouveauParentId):

    activite = trouverActivite(id)

    // 1. Verifier les contraintes
    SI activite.est_systeme == true:
        ERREUR "Activite systeme non deplacable"

    SI nouveauParentId != NULL:
        nouveauParent = trouverActivite(nouveauParentId)

        // Empecher de deplacer vers un descendant
        SI nouveauParent.chemin COMMENCE PAR (activite.chemin + "."):
            ERREUR "Impossible de deplacer vers un descendant"
    SINON:
        nouveauParent = NULL

    ancienChemin = activite.chemin
    ancienParentId = activite.parent_id

    // 2. Mettre a jour le parent
    activite.parent_id = nouveauParentId

    // 3. Recalculer niveau
    SI nouveauParent != NULL:
        activite.niveau = nouveauParent.niveau + 1
    SINON:
        activite.niveau = 0

    // 4. Recalculer chemin
    SI nouveauParent != NULL:
        activite.chemin = nouveauParent.chemin + "." + activite.id
    SINON:
        activite.chemin = STR(activite.id)

    // 5. Calculer nouvel ordre (dernier parmi nouveaux freres)
    activite.ordre = (MAX(ordre) WHERE parent_id = nouveauParentId) + 1

    SAUVEGARDER activite

    // 6. Mettre a jour tous les descendants (chemin et niveau)
    descendants = TROUVER activites WHERE chemin LIKE ancienChemin + ".%"
    POUR CHAQUE d dans descendants:
        d.chemin = REMPLACER(d.chemin, ancienChemin, activite.chemin)
        d.niveau = COMPTER("." dans d.chemin)
        SAUVEGARDER d

    // 7. Mettre a jour est_feuille des parents concernes
    // Ancien parent: peut redevenir feuille
    SI ancienParentId != NULL:
        ancienParent = trouverActivite(ancienParentId)
        nbEnfants = COMPTER activites WHERE parent_id = ancienParentId
        ancienParent.est_feuille = (nbEnfants == 0)
        SAUVEGARDER ancienParent

    // Nouveau parent: n'est plus feuille
    SI nouveauParent != NULL AND nouveauParent.est_feuille == true:
        nouveauParent.est_feuille = false
        SAUVEGARDER nouveauParent

    RETOURNER activite
```

---

### 7.9 LIRE l'arborescence complete

```
FONCTION lireArborescence():

    // 1. Charger les racines triees par chemin (pour ordre hierarchique)
    racines = TROUVER activites
        WHERE parent_id IS NULL
        AND deleted_at IS NULL
        ORDER BY chemin

    // 2. Pour chaque racine, charger recursivement les enfants
    POUR CHAQUE racine dans racines:
        racine.enfants = chargerEnfants(racine.id)

    RETOURNER racines

FONCTION chargerEnfants(parentId):
    enfants = TROUVER activites
        WHERE parent_id = parentId
        AND deleted_at IS NULL
        ORDER BY ordre

    POUR CHAQUE enfant dans enfants:
        enfant.enfants = chargerEnfants(enfant.id)

    RETOURNER enfants
```

---

### 7.10 COMPACTER les ordres (maintenance)

```
FONCTION compacterOrdres(parentId):
    // Remettre les ordres en sequence 0, 1, 2, 3...

    freres = TROUVER activites
        WHERE parent_id = parentId
        ORDER BY ordre

    POUR i = 0 a TAILLE(freres) - 1:
        SI freres[i].ordre != i:
            freres[i].ordre = i
            SAUVEGARDER freres[i]
```

---

### 7.11 REPARER l'arborescence (maintenance)

```
FONCTION reparerArborescence():

    // 1. Recalculer tous les niveaux
    POUR CHAQUE activite dans TOUTES activites:
        niveauCalcule = COMPTER("." dans activite.chemin)
        SI activite.niveau != niveauCalcule:
            activite.niveau = niveauCalcule
            SAUVEGARDER activite

    // 2. Recalculer est_feuille
    POUR CHAQUE activite dans TOUTES activites:
        nbEnfants = COMPTER activites WHERE parent_id = activite.id
        estFeuille = (nbEnfants == 0)
        SI activite.est_feuille != estFeuille:
            activite.est_feuille = estFeuille
            SAUVEGARDER activite

    // 3. Compacter les ordres par groupe de freres
    groupes = DISTINCT parent_id FROM activites
    POUR CHAQUE parentId dans groupes:
        compacterOrdres(parentId)

    // 4. Verifier coherence des chemins
    POUR CHAQUE activite dans TOUTES activites:
        SI activite.parent_id != NULL:
            parent = trouverActivite(activite.parent_id)
            cheminAttendu = parent.chemin + "." + activite.id
        SINON:
            cheminAttendu = STR(activite.id)

        SI activite.chemin != cheminAttendu:
            AVERTIR "Chemin incoherent pour " + activite.id
            activite.chemin = cheminAttendu
            SAUVEGARDER activite
```

---

## 8. Diagramme des etats

```
                    ┌─────────────┐
                    │   RACINE    │
                    │ parent=NULL │
                    │ niveau=0    │
                    │ chemin="5"  │
                    └──────┬──────┘
                           │
           ┌───────────────┼───────────────┐
           │               │               │
           ▼               ▼               ▼
    ┌─────────────┐ ┌─────────────┐ ┌─────────────┐
    │  ENFANT 1   │ │  ENFANT 2   │ │  ENFANT 3   │
    │ parent=5    │ │ parent=5    │ │ parent=5    │
    │ niveau=1    │ │ niveau=1    │ │ niveau=1    │
    │ chemin="5.6"│ │ chemin="5.7"│ │ chemin="5.8"│
    │ ordre=0     │ │ ordre=1     │ │ ordre=2     │
    └─────────────┘ └──────┬──────┘ └─────────────┘
                           │
                           ▼
                    ┌─────────────┐
                    │ PETIT-ENFANT│
                    │ parent=7    │
                    │ niveau=2    │
                    │chemin="5.7.9"│
                    │ ordre=0     │
                    └─────────────┘
```

### Regles de transition

```
CREER ENFANT:
  parent.est_feuille: true -> false

SUPPRIMER DERNIER ENFANT:
  parent.est_feuille: false -> true

DEPLACER VERS NOUVEAU PARENT:
  ancien_parent.est_feuille: peut devenir true
  nouveau_parent.est_feuille: false
  activite.chemin: recalcule
  activite.niveau: recalcule
  descendants.chemin: tous recalcules
  descendants.niveau: tous recalcules
```
