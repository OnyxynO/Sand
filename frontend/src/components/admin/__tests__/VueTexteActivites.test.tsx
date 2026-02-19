import { screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import VueTexteActivites from '../VueTexteActivites';
import { renderAvecApollo } from '../../../test/renderAvecApollo';
import { DELETE_ACTIVITY, CREATE_ACTIVITY } from '../../../graphql/operations/activities';

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
        enfants: [],
      },
    ],
  },
  {
    id: '3',
    nom: 'Absence',
    niveau: 0,
    estSysteme: true,
    estActif: true,
    enfants: [],
  },
];

describe('VueTexteActivites', () => {
  it('affiche le textarea avec le texte initial', () => {
    renderAvecApollo(
      <VueTexteActivites activites={arbreTest} onAppliquer={vi.fn()} />,
    );

    const textarea = screen.getByTestId('textarea-arbre') as HTMLTextAreaElement;
    expect(textarea.value).toContain('Developpement (DEV)');
    expect(textarea.value).toContain('    Frontend (FE)');
    expect(textarea.value).toContain('Absence (systeme)');
  });

  it('desactive les boutons quand rien n\'est modifie', () => {
    renderAvecApollo(
      <VueTexteActivites activites={arbreTest} onAppliquer={vi.fn()} />,
    );

    const btnReinitialiser = screen.getByText('Reinitialiser');
    const btnAppliquer = screen.getByText('Appliquer les modifications');
    expect(btnReinitialiser).toBeDisabled();
    expect(btnAppliquer).toBeDisabled();
  });

  it('active les boutons apres modification du texte', () => {
    renderAvecApollo(
      <VueTexteActivites activites={arbreTest} onAppliquer={vi.fn()} />,
    );

    const textarea = screen.getByTestId('textarea-arbre');
    fireEvent.change(textarea, { target: { value: 'Modifie' } });

    const btnAppliquer = screen.getByText('Appliquer les modifications');
    expect(btnAppliquer).not.toBeDisabled();
  });

  it('affiche les erreurs de validation', () => {
    renderAvecApollo(
      <VueTexteActivites activites={arbreTest} onAppliquer={vi.fn()} />,
    );

    const textarea = screen.getByTestId('textarea-arbre');
    // Texte sans l'activite systeme Absence -> erreur
    fireEvent.change(textarea, { target: { value: 'Developpement (DEV)\n    Frontend (FE)' } });

    const btnAppliquer = screen.getByText('Appliquer les modifications');
    fireEvent.click(btnAppliquer);

    expect(screen.getByText(/systeme.*supprimee/i)).toBeInTheDocument();
  });

  it('affiche la previsualisation des changements', () => {
    renderAvecApollo(
      <VueTexteActivites activites={arbreTest} onAppliquer={vi.fn()} />,
    );

    const textarea = screen.getByTestId('textarea-arbre');
    fireEvent.change(textarea, {
      target: { value: 'Developpement (DEV)\n    Frontend (FE)\nNouvelle\nAbsence (systeme)' },
    });

    fireEvent.click(screen.getByText('Appliquer les modifications'));

    expect(screen.getByText('Previsualisation des changements')).toBeInTheDocument();
    expect(screen.getByText('Confirmer')).toBeInTheDocument();
    expect(screen.getByText('Retour a l\'edition')).toBeInTheDocument();
  });

  it('revient a l\'edition avec le bouton retour', () => {
    renderAvecApollo(
      <VueTexteActivites activites={arbreTest} onAppliquer={vi.fn()} />,
    );

    const textarea = screen.getByTestId('textarea-arbre');
    fireEvent.change(textarea, {
      target: { value: 'Developpement (DEV)\n    Frontend (FE)\nNouvelle\nAbsence (systeme)' },
    });

    fireEvent.click(screen.getByText('Appliquer les modifications'));
    fireEvent.click(screen.getByText('Retour a l\'edition'));

    expect(screen.getByTestId('textarea-arbre')).toBeInTheDocument();
  });

  // A-V04 : anti-regression bug systeme ABS → "" — pas de fausse "Modification" pour activite systeme
  it('activite systeme ne genere pas de modification dans la previsualisation', () => {
    // Arbre avec activite systeme ayant un code (absenceCode = 'ABS' — le bug original)
    const arbreAvecCodeSysteme = [
      { id: '1', nom: 'Developpement', code: 'DEV', niveau: 0, estSysteme: false, estActif: true, enfants: [] },
      { id: '2', nom: 'Absence', code: 'ABS', niveau: 0, estSysteme: true, estActif: true, enfants: [] },
    ];

    renderAvecApollo(
      <VueTexteActivites activites={arbreAvecCodeSysteme} onAppliquer={vi.fn()} />,
    );

    const textarea = screen.getByTestId('textarea-arbre') as HTMLTextAreaElement;
    // Ajouter une nouvelle feuille — la seule modification doit etre une "creation"
    fireEvent.change(textarea, { target: { value: textarea.value + '\nNouvelleActivite' } });

    fireEvent.click(screen.getByText('Appliquer les modifications'));

    // La previsualisation doit montrer "Creation"
    expect(screen.getByTestId('changement-creation')).toBeInTheDocument();

    // Aucune "Modification" ne doit etre generee (bug corrige : systeme ignore dans calculerDiff)
    const modifications = screen.queryAllByTestId('changement-modification');
    expect(modifications).toHaveLength(0);
  });

  it('reinitialise le texte', () => {
    renderAvecApollo(
      <VueTexteActivites activites={arbreTest} onAppliquer={vi.fn()} />,
    );

    const textarea = screen.getByTestId('textarea-arbre') as HTMLTextAreaElement;
    const texteOriginal = textarea.value;

    fireEvent.change(textarea, { target: { value: 'Modifie' } });
    expect(textarea.value).toBe('Modifie');

    fireEvent.click(screen.getByText('Reinitialiser'));

    const textareaApres = screen.getByTestId('textarea-arbre') as HTMLTextAreaElement;
    expect(textareaApres.value).toBe(texteOriginal);
  });
});
