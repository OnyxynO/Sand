import { describe, it, expect } from 'vitest';
import {
  aplatirArbre,
  collecterDescendantIds,
  validerDrop,
  calculerDropEntreFreres,
} from '../useArbreDnd';
import type { ActiviteDnd } from '../useArbreDnd';

// Arbre de test :
// Developpement (id: 1, ordre: 0)
//   Frontend (id: 2, ordre: 0)
//     React (id: 3, ordre: 0)
//   Backend (id: 4, ordre: 1)
// Reunion (id: 5, ordre: 1)
// Absence (id: 6, ordre: 2, estSysteme: true)
const arbreTest: ActiviteDnd[] = [
  {
    id: '1',
    nom: 'Developpement',
    chemin: 'developpement',
    niveau: 0,
    ordre: 0,
    estFeuille: false,
    estSysteme: false,
    estActif: true,
    enfants: [
      {
        id: '2',
        nom: 'Frontend',
        chemin: 'developpement.frontend',
        niveau: 1,
        ordre: 0,
        estFeuille: false,
        estSysteme: false,
        estActif: true,
        enfants: [
          {
            id: '3',
            nom: 'React',
            chemin: 'developpement.frontend.react',
            niveau: 2,
            ordre: 0,
            estFeuille: true,
            estSysteme: false,
            estActif: true,
            enfants: [],
          },
        ],
      },
      {
        id: '4',
        nom: 'Backend',
        chemin: 'developpement.backend',
        niveau: 1,
        ordre: 1,
        estFeuille: true,
        estSysteme: false,
        estActif: true,
        enfants: [],
      },
    ],
  },
  {
    id: '5',
    nom: 'Reunion',
    chemin: 'reunion',
    niveau: 0,
    ordre: 1,
    estFeuille: true,
    estSysteme: false,
    estActif: true,
    enfants: [],
  },
  {
    id: '6',
    nom: 'Absence',
    chemin: 'absence',
    niveau: 0,
    ordre: 2,
    estFeuille: true,
    estSysteme: true,
    estActif: true,
    enfants: [],
  },
];

describe('aplatirArbre', () => {
  it('aplatit tous les noeuds quand tout est ouvert', () => {
    const ouverts = new Set(['1', '2', '3', '4', '5', '6']);
    const resultat = aplatirArbre(arbreTest, ouverts);

    expect(resultat).toHaveLength(6);
    expect(resultat.map((e) => e.activite.id)).toEqual([
      '1', '2', '3', '4', '5', '6',
    ]);
  });

  it('masque les enfants des noeuds fermes', () => {
    // Noeud 1 ferme : on ne voit pas 2, 3, 4
    const ouverts = new Set(['5', '6']);
    const resultat = aplatirArbre(arbreTest, ouverts);

    expect(resultat).toHaveLength(3);
    expect(resultat.map((e) => e.activite.id)).toEqual(['1', '5', '6']);
  });

  it('masque les petits-enfants si le parent est ferme', () => {
    // Noeud 1 ouvert, noeud 2 ferme : on voit 2 et 4 mais pas 3
    const ouverts = new Set(['1', '4', '5', '6']);
    const resultat = aplatirArbre(arbreTest, ouverts);

    expect(resultat).toHaveLength(5);
    expect(resultat.map((e) => e.activite.id)).toEqual([
      '1', '2', '4', '5', '6',
    ]);
  });

  it('conserve le niveau correct pour chaque element', () => {
    const ouverts = new Set(['1', '2', '3', '4', '5', '6']);
    const resultat = aplatirArbre(arbreTest, ouverts);

    expect(resultat[0].niveau).toBe(0); // Developpement
    expect(resultat[1].niveau).toBe(1); // Frontend
    expect(resultat[2].niveau).toBe(2); // React
    expect(resultat[3].niveau).toBe(1); // Backend
    expect(resultat[4].niveau).toBe(0); // Reunion
    expect(resultat[5].niveau).toBe(0); // Absence
  });

  it('assigne le bon parentId', () => {
    const ouverts = new Set(['1', '2', '3', '4', '5', '6']);
    const resultat = aplatirArbre(arbreTest, ouverts);

    expect(resultat[0].parentId).toBeNull(); // Developpement = racine
    expect(resultat[1].parentId).toBe('1'); // Frontend → parent Developpement
    expect(resultat[2].parentId).toBe('2'); // React → parent Frontend
    expect(resultat[3].parentId).toBe('1'); // Backend → parent Developpement
    expect(resultat[4].parentId).toBeNull(); // Reunion = racine
    expect(resultat[5].parentId).toBeNull(); // Absence = racine
  });

  it('retourne un tableau vide pour un arbre vide', () => {
    const resultat = aplatirArbre([], new Set());
    expect(resultat).toHaveLength(0);
  });
});

describe('collecterDescendantIds', () => {
  it('collecte l\'activite et ses descendants', () => {
    const ids = collecterDescendantIds(arbreTest[0]); // Developpement
    expect(ids).toEqual(new Set(['1', '2', '3', '4']));
  });

  it('retourne juste l\'id pour une feuille', () => {
    const ids = collecterDescendantIds(arbreTest[1]); // Reunion
    expect(ids).toEqual(new Set(['5']));
  });
});

describe('validerDrop', () => {
  it('refuse le drop sur soi-meme', () => {
    expect(validerDrop('1', '1', 'entre-freres', arbreTest)).toBe(false);
  });

  it('refuse le drop sur un descendant (anti-cycle)', () => {
    // Developement (1) vers Frontend (2) = cycle
    expect(validerDrop('1', '2', 'devenir-enfant', arbreTest)).toBe(false);
    // Developement (1) vers React (3) = cycle
    expect(validerDrop('1', '3', 'devenir-enfant', arbreTest)).toBe(false);
  });

  it('autorise le drop sur un non-descendant', () => {
    // React (3) vers Reunion (5) = OK
    expect(validerDrop('3', '5', 'devenir-enfant', arbreTest)).toBe(true);
  });

  it('autorise le drop entre freres', () => {
    // Frontend (2) apres Backend (4) = reordonnance OK
    expect(validerDrop('2', '4', 'entre-freres', arbreTest)).toBe(true);
  });

  it('refuse le reparentage d\'une activite systeme', () => {
    // Absence (6, systeme) vers Developpement (1) = interdit (changement de parent)
    expect(validerDrop('6', '1', 'devenir-enfant', arbreTest)).toBe(false);
  });

  it('autorise la reordonnance d\'une activite systeme entre freres', () => {
    // Absence (6, systeme) reordonnance entre racines = OK
    expect(validerDrop('6', '5', 'entre-freres', arbreTest)).toBe(true);
  });

  it('refuse si le type est null', () => {
    expect(validerDrop('3', '5', null, arbreTest)).toBe(false);
  });
});

describe('calculerDropEntreFreres', () => {
  const ouverts = new Set(['1', '2', '3', '4', '5', '6']);
  const listeAplatie = aplatirArbre(arbreTest, ouverts);

  it('calcule le bon parent et ordre pour un drop entre racines', () => {
    // React (3) vers Reunion (5) entre freres
    const result = calculerDropEntreFreres('3', '5', arbreTest, listeAplatie);
    expect(result).not.toBeNull();
    expect(result!.parentId).toBeNull(); // racine
    expect(result!.ordre).toBeGreaterThanOrEqual(0);
  });

  it('calcule le bon parent pour un drop entre enfants du meme parent', () => {
    // Backend (4) vers Frontend (2) entre freres
    const result = calculerDropEntreFreres('4', '2', arbreTest, listeAplatie);
    expect(result).not.toBeNull();
    expect(result!.parentId).toBe('1'); // parent = Developpement
  });

  it('retourne null pour un id cible inexistant', () => {
    const result = calculerDropEntreFreres('3', '999', arbreTest, listeAplatie);
    expect(result).toBeNull();
  });
});
