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
