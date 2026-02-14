// Tests pour le composant TotauxJournaliers

import { render, screen } from '@testing-library/react';
import { vi } from 'vitest';
import TotauxJournaliers from './TotauxJournaliers';
import type { JourSemaine } from '../../types';

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
  calculerTotal: (durees: (number | null | undefined)[]) => {
    return durees.reduce((acc: number, d) => acc + (d || 0), 0);
  },
}));

import { useSaisieStore } from '../../stores/saisieStore';

describe('TotauxJournaliers', () => {
  const mockGetTotalJour = vi.fn();

  const jours: JourSemaine[] = [
    {
      date: new Date('2025-01-20'),
      dateStr: '2025-01-20',
      jourNom: 'lun',
      jourComplet: 'Lundi',
      estAujourdhui: false,
      estFutur: false,
    },
    {
      date: new Date('2025-01-21'),
      dateStr: '2025-01-21',
      jourNom: 'mar',
      jourComplet: 'Mardi',
      estAujourdhui: false,
      estFutur: false,
    },
    {
      date: new Date('2025-01-22'),
      dateStr: '2025-01-22',
      jourNom: 'mer',
      jourComplet: 'Mercredi',
      estAujourdhui: false,
      estFutur: false,
    },
    {
      date: new Date('2025-02-10'),
      dateStr: '2025-02-10',
      jourNom: 'lun',
      jourComplet: 'Lundi',
      estAujourdhui: false,
      estFutur: true,
    },
  ];

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(useSaisieStore).mockReturnValue({
      getTotalJour: mockGetTotalJour,
      semaineISO: '2025-W04',
      lignes: [],
      projetsDisponibles: [],
      activitesDisponibles: [],
      modifierCellule: vi.fn(),
      chargerSemaine: vi.fn(),
      ajouterLigne: vi.fn(),
      supprimerLigne: vi.fn(),
      sauvegarderModifications: vi.fn(),
      annulerModifications: vi.fn(),
      allerSemainePrecedente: vi.fn(),
      allerSemaineSuivante: vi.fn(),
      allerSemaineActuelle: vi.fn(),
    });
  });

  it('affiche "-" quand total est 0', () => {
    // Simuler des totaux à 0
    mockGetTotalJour.mockImplementation((dateStr: string) => {
      if (dateStr === '2025-01-20') return 0;
      return 1.0;
    });

    render(
      <table>
        <tbody>
          <TotauxJournaliers jours={[jours[0]]} absencesParJour={{}} />
        </tbody>
      </table>
    );

    // Vérifier que "-" est affiché pour le jour avec total 0
    expect(screen.getByText('-')).toBeInTheDocument();
  });

  it('affiche en vert quand total est 1.0', () => {
    // Simuler un total de 1.0
    mockGetTotalJour.mockReturnValue(1.0);

    render(
      <table>
        <tbody>
          <TotauxJournaliers jours={[jours[0]]} absencesParJour={{}} />
        </tbody>
      </table>
    );

    // Trouver toutes les cellules avec "1", le premier est le jour, on veut le premier
    const allTexts = screen.getAllByText('1');
    const totalDiv = allTexts[0].closest('div');
    expect(totalDiv).toHaveClass('text-green-700');

    const totalCell = allTexts[0].closest('td');
    expect(totalCell).toHaveClass('bg-green-50');
  });

  it('affiche en orange quand total != 1.0', () => {
    // Simuler un total différent de 1.0
    mockGetTotalJour.mockReturnValue(0.5);

    render(
      <table>
        <tbody>
          <TotauxJournaliers jours={[jours[0]]} absencesParJour={{}} />
        </tbody>
      </table>
    );

    // Trouver toutes les cellules avec "0.5", le premier est le jour
    const allTexts = screen.getAllByText('0.5');
    const totalDiv = allTexts[0].closest('div');
    expect(totalDiv).toHaveClass('text-orange-700');

    const totalCell = allTexts[0].closest('td');
    expect(totalCell).toHaveClass('bg-orange-50');
  });

  it('affiche en gris pour jour futur', () => {
    // Utiliser le jour futur avec un total de 0
    mockGetTotalJour.mockReturnValue(0);

    render(
      <table>
        <tbody>
          <TotauxJournaliers jours={[jours[3]]} absencesParJour={{}} />
        </tbody>
      </table>
    );

    // Trouver la cellule du jour futur
    const totalCell = screen.getByText('-').closest('td');
    expect(totalCell).toHaveClass('bg-gray-100');

    // Vérifier que le texte a la classe de couleur grise
    const totalDiv = screen.getByText('-').closest('div');
    expect(totalDiv).toHaveClass('text-gray-400');
  });
});
