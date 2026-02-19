import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import SelectionParentModal from '../SelectionParentModal';

// Arbre de test :
// Developpement (id: 1)
//   Frontend (id: 2)
//     React (id: 3)
//   Backend (id: 4)
// Reunion (id: 5)
const arbreTest = [
  {
    id: '1',
    nom: 'Developpement',
    code: 'DEV',
    niveau: 0,
    estSysteme: false,
    enfants: [
      {
        id: '2',
        nom: 'Frontend',
        code: 'FE',
        niveau: 1,
        estSysteme: false,
        enfants: [
          {
            id: '3',
            nom: 'React',
            niveau: 2,
            estSysteme: false,
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
    enfants: [],
  },
];

const activiteFrontend = arbreTest[0].enfants![0]; // Frontend (id: 2)

const defaultProps = {
  ouverte: true,
  onFermer: vi.fn(),
  activite: activiteFrontend,
  arbre: arbreTest,
  onDeplacer: vi.fn(),
};

describe('SelectionParentModal', () => {
  it('affiche le titre avec le nom de l\'activite', () => {
    render(<SelectionParentModal {...defaultProps} />);
    expect(screen.getByText('Deplacer Frontend')).toBeInTheDocument();
  });

  it('affiche l\'arbre complet dans la modale', () => {
    render(<SelectionParentModal {...defaultProps} />);

    expect(screen.getByText('Racine (niveau 0)')).toBeInTheDocument();
    expect(screen.getByText('Developpement')).toBeInTheDocument();
    expect(screen.getByText('Frontend')).toBeInTheDocument();
    expect(screen.getByText('React')).toBeInTheDocument();
    expect(screen.getByText('Backend')).toBeInTheDocument();
    expect(screen.getByText('Reunion')).toBeInTheDocument();
  });

  it('desactive l\'activite elle-meme et ses descendants', () => {
    render(<SelectionParentModal {...defaultProps} />);

    // Frontend (l'activite elle-meme) et React (son enfant) doivent etre desactives
    const optionFrontend = screen.getByTestId('parent-option-2');
    const optionReact = screen.getByTestId('parent-option-3');
    expect(optionFrontend).toBeDisabled();
    expect(optionReact).toBeDisabled();

    // Les autres doivent etre actifs
    const optionDev = screen.getByTestId('parent-option-1');
    const optionBackend = screen.getByTestId('parent-option-4');
    const optionReunion = screen.getByTestId('parent-option-5');
    expect(optionDev).not.toBeDisabled();
    expect(optionBackend).not.toBeDisabled();
    expect(optionReunion).not.toBeDisabled();
  });

  it('indique le parent actuel', () => {
    render(<SelectionParentModal {...defaultProps} />);

    // Developpement est le parent actuel de Frontend
    const optionDev = screen.getByTestId('parent-option-1');
    expect(optionDev).toHaveTextContent('(actuel)');
  });

  it('filtre l\'arbre par recherche', () => {
    render(<SelectionParentModal {...defaultProps} />);

    const champRecherche = screen.getByPlaceholderText('Rechercher une activite...');
    fireEvent.change(champRecherche, { target: { value: 'Reunion' } });

    expect(screen.getByText('Reunion')).toBeInTheDocument();
    expect(screen.queryByText('Developpement')).not.toBeInTheDocument();
    expect(screen.queryByText('Backend')).not.toBeInTheDocument();
  });

  it('filtre par code', () => {
    render(<SelectionParentModal {...defaultProps} />);

    const champRecherche = screen.getByPlaceholderText('Rechercher une activite...');
    fireEvent.change(champRecherche, { target: { value: 'BE' } });

    expect(screen.getByText('Backend')).toBeInTheDocument();
    expect(screen.queryByText('Reunion')).not.toBeInTheDocument();
  });

  it('affiche un message quand la recherche ne trouve rien', () => {
    render(<SelectionParentModal {...defaultProps} />);

    const champRecherche = screen.getByPlaceholderText('Rechercher une activite...');
    fireEvent.change(champRecherche, { target: { value: 'zzzzz' } });

    expect(screen.getByText('Aucune activite trouvee')).toBeInTheDocument();
  });

  it('permet de selectionner un parent valide et appelle onDeplacer', () => {
    const onDeplacer = vi.fn();
    render(<SelectionParentModal {...defaultProps} onDeplacer={onDeplacer} />);

    // Selectionner "Reunion" comme nouveau parent
    fireEvent.click(screen.getByTestId('parent-option-5'));

    // Cliquer sur Deplacer
    fireEvent.click(screen.getByText('Deplacer'));

    expect(onDeplacer).toHaveBeenCalledWith('5');
  });

  it('permet de selectionner la racine', () => {
    const onDeplacer = vi.fn();
    render(<SelectionParentModal {...defaultProps} onDeplacer={onDeplacer} />);

    fireEvent.click(screen.getByText('Racine (niveau 0)'));
    fireEvent.click(screen.getByText('Deplacer'));

    expect(onDeplacer).toHaveBeenCalledWith(null);
  });

  it('bouton Deplacer desactive sans selection', () => {
    render(<SelectionParentModal {...defaultProps} />);

    const bouton = screen.getByText('Deplacer');
    expect(bouton).toBeDisabled();
  });

  it('appelle onFermer quand on clique Annuler', () => {
    const onFermer = vi.fn();
    render(<SelectionParentModal {...defaultProps} onFermer={onFermer} />);

    fireEvent.click(screen.getByText('Annuler'));
    expect(onFermer).toHaveBeenCalled();
  });

  it('ne rend rien quand ouverte est false', () => {
    render(<SelectionParentModal {...defaultProps} ouverte={false} />);
    expect(screen.queryByText('Deplacer Frontend')).not.toBeInTheDocument();
  });
});
