// Tests pour le composant NavigationSemaine

import { render, screen } from '@testing-library/react';
import { vi } from 'vitest';
import NavigationSemaine from './NavigationSemaine';

// Mock des icones Heroicons
vi.mock('@heroicons/react/24/outline', () => ({
  ChevronLeftIcon: () => <div data-testid="chevron-left" />,
  ChevronRightIcon: () => <div data-testid="chevron-right" />,
}));

// Mock du store
vi.mock('../../stores/saisieStore', () => ({
  useSaisieStore: vi.fn(),
}));

// Mock des utils
vi.mock('../../utils/semaineUtils', () => ({
  formatSemainePourAffichage: (semaineISO: string) => {
    // Format simplifié pour les tests
    return `Semaine ${semaineISO}`;
  },
  estSemaineCourante: (semaineISO: string) => {
    // Pour les tests, on considère que "2025-W04" est la semaine courante
    return semaineISO === '2025-W04';
  },
}));

import { useSaisieStore } from '../../stores/saisieStore';

describe('NavigationSemaine', () => {
  const mockAllerSemainePrecedente = vi.fn();
  const mockAllerSemaineSuivante = vi.fn();
  const mockAllerSemaineActuelle = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('affiche le titre de la semaine', () => {
    vi.mocked(useSaisieStore).mockReturnValue({
      semaineISO: '2025-W04',
      allerSemainePrecedente: mockAllerSemainePrecedente,
      allerSemaineSuivante: mockAllerSemaineSuivante,
      allerSemaineActuelle: mockAllerSemaineActuelle,
      lignes: [],
      projetsDisponibles: [],
      activitesDisponibles: [],
      modifierCellule: vi.fn(),
      chargerSemaine: vi.fn(),
      ajouterLigne: vi.fn(),
      supprimerLigne: vi.fn(),
      sauvegarderModifications: vi.fn(),
      annulerModifications: vi.fn(),
      getTotalJour: vi.fn(),
    });

    render(<NavigationSemaine />);

    expect(screen.getByText('Semaine 2025-W04')).toBeInTheDocument();
  });

  it('bouton Aujourd\'hui cache quand semaine courante', () => {
    vi.mocked(useSaisieStore).mockReturnValue({
      semaineISO: '2025-W04', // Semaine courante
      allerSemainePrecedente: mockAllerSemainePrecedente,
      allerSemaineSuivante: mockAllerSemaineSuivante,
      allerSemaineActuelle: mockAllerSemaineActuelle,
      lignes: [],
      projetsDisponibles: [],
      activitesDisponibles: [],
      modifierCellule: vi.fn(),
      chargerSemaine: vi.fn(),
      ajouterLigne: vi.fn(),
      supprimerLigne: vi.fn(),
      sauvegarderModifications: vi.fn(),
      annulerModifications: vi.fn(),
      getTotalJour: vi.fn(),
    });

    render(<NavigationSemaine />);

    // Le bouton "Aujourd'hui" ne doit pas être visible
    expect(screen.queryByText('Aujourd\'hui')).not.toBeInTheDocument();
  });

  it('bouton Aujourd\'hui visible quand pas semaine courante', () => {
    vi.mocked(useSaisieStore).mockReturnValue({
      semaineISO: '2025-W05', // Pas la semaine courante
      allerSemainePrecedente: mockAllerSemainePrecedente,
      allerSemaineSuivante: mockAllerSemaineSuivante,
      allerSemaineActuelle: mockAllerSemaineActuelle,
      lignes: [],
      projetsDisponibles: [],
      activitesDisponibles: [],
      modifierCellule: vi.fn(),
      chargerSemaine: vi.fn(),
      ajouterLigne: vi.fn(),
      supprimerLigne: vi.fn(),
      sauvegarderModifications: vi.fn(),
      annulerModifications: vi.fn(),
      getTotalJour: vi.fn(),
    });

    render(<NavigationSemaine />);

    // Le bouton "Aujourd'hui" doit être visible
    expect(screen.getByText('Aujourd\'hui')).toBeInTheDocument();
  });
});
