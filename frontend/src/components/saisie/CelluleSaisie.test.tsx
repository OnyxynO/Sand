// Tests pour le composant CelluleSaisie

import { render, screen, fireEvent } from '@testing-library/react';
import { vi } from 'vitest';
import CelluleSaisie from './CelluleSaisie';
import type { JourSemaine, CelluleSaisieData } from '../../types';

// Mock du store
vi.mock('../../stores/saisieStore', () => ({
  useSaisieStore: vi.fn(),
}));

// Mock des utils
vi.mock('../../utils/semaineUtils', () => ({
  formatDuree: (duree: number | null | undefined) => {
    if (duree === null || duree === undefined || duree === 0) return '';
    return parseFloat(duree.toFixed(2)).toString();
  },
  parseDuree: (valeur: string) => {
    if (!valeur || valeur.trim() === '') return null;
    const normalise = valeur.replace(',', '.').trim();
    const nombre = parseFloat(normalise);
    if (isNaN(nombre) || nombre < 0.01 || nombre > 1) return null;
    return Math.round(nombre * 100) / 100;
  },
}));

import { useSaisieStore } from '../../stores/saisieStore';

describe('CelluleSaisie', () => {
  const mockModifierCellule = vi.fn();

  const jourNormal: JourSemaine = {
    date: new Date('2025-01-20'),
    dateStr: '2025-01-20',
    jourNom: 'lun',
    jourComplet: 'Lundi',
    estAujourdhui: false,
    estFutur: false,
  };

  const jourFutur: JourSemaine = {
    date: new Date('2025-02-10'),
    dateStr: '2025-02-10',
    jourNom: 'lun',
    jourComplet: 'Lundi',
    estAujourdhui: false,
    estFutur: true,
  };

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(useSaisieStore).mockReturnValue({
      modifierCellule: mockModifierCellule,
      semaineISO: '2025-W04',
      lignes: [],
      projetsDisponibles: [],
      activitesDisponibles: [],
      chargerSemaine: vi.fn(),
      ajouterLigne: vi.fn(),
      supprimerLigne: vi.fn(),
      sauvegarderModifications: vi.fn(),
      annulerModifications: vi.fn(),
      allerSemainePrecedente: vi.fn(),
      allerSemaineSuivante: vi.fn(),
      allerSemaineActuelle: vi.fn(),
      getTotalJour: vi.fn(),
    });
  });

  it('affiche la duree quand cellule a une valeur', () => {
    const cellule: CelluleSaisieData = {
      duree: 0.5,
      estModifiee: false,
    };

    render(
      <table>
        <tbody>
          <tr>
            <CelluleSaisie ligneId="test-1" jour={jourNormal} cellule={cellule} />
          </tr>
        </tbody>
      </table>
    );

    expect(screen.getByText('0.5')).toBeInTheDocument();
  });

  it('affiche vide quand duree est null', () => {
    const cellule: CelluleSaisieData = {
      duree: null,
      estModifiee: false,
    };

    render(
      <table>
        <tbody>
          <tr>
            <CelluleSaisie ligneId="test-1" jour={jourNormal} cellule={cellule} />
          </tr>
        </tbody>
      </table>
    );

    // La cellule ne doit pas contenir de texte (sauf l'aria-label)
    const cell = screen.getByRole('button');
    expect(cell).toBeInTheDocument();
    // Le span interne doit être vide
    const span = cell.querySelector('span');
    expect(span?.textContent).toBe('');
  });

  it('jour futur affiche "-" et est desactive', () => {
    const cellule: CelluleSaisieData = {
      duree: null,
      estModifiee: false,
    };

    render(
      <table>
        <tbody>
          <tr>
            <CelluleSaisie ligneId="test-1" jour={jourFutur} cellule={cellule} />
          </tr>
        </tbody>
      </table>
    );

    expect(screen.getByText('-')).toBeInTheDocument();
    // Vérifier que c'est désactivé via les classes CSS sur le div parent
    const cellDiv = screen.getByText('-').closest('div');
    expect(cellDiv).toHaveClass('cursor-not-allowed');
    expect(cellDiv).toHaveClass('bg-gray-100');
  });

  it('cellule modifiee a la classe border-blue-400', () => {
    const cellule: CelluleSaisieData = {
      duree: 0.75,
      estModifiee: true,
    };

    render(
      <table>
        <tbody>
          <tr>
            <CelluleSaisie ligneId="test-1" jour={jourNormal} cellule={cellule} />
          </tr>
        </tbody>
      </table>
    );

    const cell = screen.getByRole('button');
    expect(cell).toHaveClass('border-blue-400');
  });

  it('clic entre en mode edition (input apparait)', () => {
    const cellule: CelluleSaisieData = {
      duree: 0.5,
      estModifiee: false,
    };

    render(
      <table>
        <tbody>
          <tr>
            <CelluleSaisie ligneId="test-1" jour={jourNormal} cellule={cellule} />
          </tr>
        </tbody>
      </table>
    );

    const cell = screen.getByRole('button');
    fireEvent.click(cell);

    // L'input doit apparaitre
    const input = screen.getByRole('textbox');
    expect(input).toBeInTheDocument();
    expect(input).toHaveValue('0.5');
  });
});
