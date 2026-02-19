import { describe, it, expect } from 'vitest';
import {
  arbreVersTexte,
  texteVersArbre,
  validerTexte,
  calculerDiff,
} from '../useParserArbreTexte';

// Arbre de test
const arbreTest = [
  {
    id: '1',
    nom: 'Developpement',
    code: 'DEV',
    niveau: 0,
    estSysteme: false,
    estActif: true,
    enfants: [
      {
        id: '2',
        nom: 'Frontend',
        code: 'FE',
        niveau: 1,
        estSysteme: false,
        estActif: true,
        enfants: [
          {
            id: '3',
            nom: 'React',
            niveau: 2,
            estSysteme: false,
            estActif: true,
            enfants: [],
          },
        ],
      },
      {
        id: '4',
        nom: 'Backend',
        code: 'BE',
        niveau: 1,
        estSysteme: false,
        estActif: true,
        enfants: [],
      },
    ],
  },
  {
    id: '5',
    nom: 'Reunion',
    code: 'REU',
    niveau: 0,
    estSysteme: false,
    estActif: true,
    enfants: [],
  },
  {
    id: '6',
    nom: 'Absence',
    niveau: 0,
    estSysteme: true,
    estActif: true,
    enfants: [],
  },
];

describe('arbreVersTexte', () => {
  it('formate l\'arbre avec indentation de 4 espaces', () => {
    const texte = arbreVersTexte(arbreTest);
    const lignes = texte.split('\n');

    expect(lignes[0]).toBe('Developpement (DEV)');
    expect(lignes[1]).toBe('    Frontend (FE)');
    expect(lignes[2]).toBe('        React');
    expect(lignes[3]).toBe('    Backend (BE)');
    expect(lignes[4]).toBe('Reunion (REU)');
  });

  it('ajoute le suffixe (systeme) pour les activites systeme', () => {
    const texte = arbreVersTexte(arbreTest);
    const lignes = texte.split('\n');
    expect(lignes[5]).toBe('Absence (systeme)');
  });

  it('gere un arbre vide', () => {
    expect(arbreVersTexte([])).toBe('');
  });

  it('gere les activites sans code', () => {
    const arbre = [
      { id: '1', nom: 'Test', niveau: 0, estSysteme: false, estActif: true, enfants: [] },
    ];
    expect(arbreVersTexte(arbre)).toBe('Test');
  });
});

describe('texteVersArbre', () => {
  it('parse un texte indente avec espaces', () => {
    const texte = 'Developpement (DEV)\n    Frontend (FE)\n        React\n    Backend (BE)';
    const arbre = texteVersArbre(texte);

    expect(arbre).toHaveLength(1);
    expect(arbre[0].nom).toBe('Developpement');
    expect(arbre[0].code).toBe('DEV');
    expect(arbre[0].enfants).toHaveLength(2);
    expect(arbre[0].enfants[0].nom).toBe('Frontend');
    expect(arbre[0].enfants[0].enfants[0].nom).toBe('React');
    expect(arbre[0].enfants[0].enfants[0].code).toBeUndefined();
  });

  it('parse un texte indente avec tabs', () => {
    const texte = 'Parent\n\tEnfant\n\t\tPetitEnfant';
    const arbre = texteVersArbre(texte);

    expect(arbre).toHaveLength(1);
    expect(arbre[0].enfants).toHaveLength(1);
    expect(arbre[0].enfants[0].enfants).toHaveLength(1);
  });

  it('ignore les lignes vides', () => {
    const texte = 'A\n\nB\n\nC';
    const arbre = texteVersArbre(texte);
    expect(arbre).toHaveLength(3);
  });

  it('detecte les activites systeme', () => {
    const texte = 'Absence (systeme)';
    const arbre = texteVersArbre(texte);
    expect(arbre[0].nom).toBe('Absence');
    expect(arbre[0].estSysteme).toBe(true);
    expect(arbre[0].code).toBeUndefined();
  });

  it('extrait le code entre parentheses', () => {
    const texte = 'Reunion (REU)';
    const arbre = texteVersArbre(texte);
    expect(arbre[0].nom).toBe('Reunion');
    expect(arbre[0].code).toBe('REU');
    expect(arbre[0].estSysteme).toBe(false);
  });

  it('gere plusieurs racines', () => {
    const texte = 'A\nB\nC';
    const arbre = texteVersArbre(texte);
    expect(arbre).toHaveLength(3);
  });
});

describe('validerTexte', () => {
  it('detecte les noms trop longs', () => {
    const nomLong = 'A'.repeat(256);
    const texte = nomLong;
    const erreurs = validerTexte(texte, []);
    expect(erreurs.some((e) => e.message.includes('Nom trop long'))).toBe(true);
  });

  it('detecte les codes trop longs', () => {
    const codeLong = 'X'.repeat(51);
    const texte = `Test (${codeLong})`;
    const erreurs = validerTexte(texte, []);
    expect(erreurs.some((e) => e.message.includes('Code trop long'))).toBe(true);
  });

  it('detecte les sauts de niveau', () => {
    const texte = 'Parent\n        EnfantNiveau2';
    const erreurs = validerTexte(texte, []);
    expect(erreurs.some((e) => e.message.includes('Saut de niveau'))).toBe(true);
  });

  it('detecte les caracteres interdits', () => {
    const texte = 'Test.invalide';
    const erreurs = validerTexte(texte, []);
    expect(erreurs.some((e) => e.message.includes('interdits'))).toBe(true);
  });

  it('detecte les caracteres pipe', () => {
    const texte = 'Test|invalide';
    const erreurs = validerTexte(texte, []);
    expect(erreurs.some((e) => e.message.includes('interdits'))).toBe(true);
  });

  it('detecte les doublons parmi les freres', () => {
    const texte = 'Test\nTest';
    const erreurs = validerTexte(texte, []);
    expect(erreurs.some((e) => e.message.includes('doublon'))).toBe(true);
  });

  it('autorise les memes noms a des niveaux differents', () => {
    const texte = 'Parent\n    Enfant\nAutreParent\n    Enfant';
    const erreurs = validerTexte(texte, []);
    expect(erreurs.filter((e) => e.message.includes('doublon'))).toHaveLength(0);
  });

  it('detecte la suppression d\'une activite systeme', () => {
    const texte = 'Developpement (DEV)';
    const erreurs = validerTexte(texte, arbreTest);
    expect(erreurs.some((e) => e.message.includes('systeme') && e.message.includes('supprimee'))).toBe(true);
  });

  it('detecte le deplacement d\'une activite systeme', () => {
    const texte = 'Developpement (DEV)\n    Absence (systeme)';
    const erreurs = validerTexte(texte, arbreTest);
    expect(erreurs.some((e) => e.message.includes('systeme') && e.message.includes('deplacee'))).toBe(true);
  });

  it('accepte un texte valide', () => {
    const texte = arbreVersTexte(arbreTest);
    const erreurs = validerTexte(texte, arbreTest);
    expect(erreurs).toHaveLength(0);
  });
});

describe('calculerDiff', () => {
  it('detecte les creations', () => {
    const texte = arbreVersTexte(arbreTest) + '\nNouvelle (NEW)';
    const nouvelArbre = texteVersArbre(texte);
    const diff = calculerDiff(arbreTest, nouvelArbre);
    expect(diff.some((c) => c.type === 'creation' && c.nom === 'Nouvelle')).toBe(true);
  });

  it('detecte les suppressions', () => {
    const texte = 'Developpement (DEV)\n    Frontend (FE)\n    Backend (BE)\nAbsence (systeme)';
    const nouvelArbre = texteVersArbre(texte);
    const diff = calculerDiff(arbreTest, nouvelArbre);
    expect(diff.some((c) => c.type === 'suppression' && c.nom === 'Reunion')).toBe(true);
  });

  it('detecte les deplacements', () => {
    // Deplacer React sous Backend au lieu de Frontend
    const texte = 'Developpement (DEV)\n    Frontend (FE)\n    Backend (BE)\n        React\nReunion (REU)\nAbsence (systeme)';
    const nouvelArbre = texteVersArbre(texte);
    const diff = calculerDiff(arbreTest, nouvelArbre);
    expect(diff.some((c) => c.type === 'deplacement' && c.nom === 'React')).toBe(true);
  });

  it('detecte les modifications de code', () => {
    const texte = 'Developpement (NEWCODE)\n    Frontend (FE)\n        React\n    Backend (BE)\nReunion (REU)\nAbsence (systeme)';
    const nouvelArbre = texteVersArbre(texte);
    const diff = calculerDiff(arbreTest, nouvelArbre);
    expect(diff.some((c) => c.type === 'modification' && c.nom === 'Developpement')).toBe(true);
  });

  it('retourne un tableau vide si rien ne change', () => {
    const texte = arbreVersTexte(arbreTest);
    const nouvelArbre = texteVersArbre(texte);
    const diff = calculerDiff(arbreTest, nouvelArbre);
    expect(diff).toHaveLength(0);
  });

  // A-V05 : anti-regression bug systeme ABS → ""
  it('ignore les activites systeme dans les modifications de code', () => {
    // Arbre avec activite systeme ayant un code (absenceCode = 'ABS')
    const arbreAvecCodeSysteme = [
      { id: '99', nom: 'Absence', code: 'ABS', niveau: 0, estSysteme: true, estActif: true, enfants: [] },
    ];

    // arbreVersTexte affiche "(systeme)" et non "(ABS)" pour les systemes
    const texte = arbreVersTexte(arbreAvecCodeSysteme);
    expect(texte).toBe('Absence (systeme)');

    // Le texte parse n'a pas de code pour l'activite systeme
    const nouvelArbre = texteVersArbre(texte);
    const diff = calculerDiff(arbreAvecCodeSysteme, nouvelArbre);

    // Aucune "modification" ne doit etre generee (code ABS → "" ignore pour systeme)
    expect(diff.filter((c) => c.type === 'modification')).toHaveLength(0);
    expect(diff).toHaveLength(0);
  });

  it('detecte la suppression de React et Reunion', () => {
    const texte = 'Developpement (DEV)\n    Frontend (FE)\n    Backend (BE)\nAbsence (systeme)';
    const nouvelArbre = texteVersArbre(texte);
    const diff = calculerDiff(arbreTest, nouvelArbre);
    const suppressions = diff.filter((c) => c.type === 'suppression');
    expect(suppressions).toHaveLength(2);
    expect(suppressions.map((s) => s.nom).sort()).toEqual(['React', 'Reunion']);
  });
});
