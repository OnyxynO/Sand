// Tests pour le composant GrilleSemaine — U-V01, U-V02

import { screen } from '@testing-library/react';
import { vi } from 'vitest';
import GrilleSemaine from './GrilleSemaine';
import { renderAvecApollo } from '../../test/renderAvecApollo';
import type { LigneSaisie, JourSemaine } from '../../types';

// Mock du store
vi.mock('../../stores/saisieStore', () => ({
  useSaisieStore: vi.fn(),
}));

// Mock des utilitaires de formatage
vi.mock('../../utils/semaineUtils', () => ({
  formatJourEnTete: (jour: JourSemaine) => jour.jourNom,
  formatDuree: (duree: number | null | undefined) => (duree ? String(duree) : ''),
}));

// Mock des sous-composants complexes
vi.mock('./LigneSaisie', () => ({
  default: ({ ligne }: { ligne: { activiteNom: string } }) => (
    <tr data-testid="ligne-saisie"><td>{ligne.activiteNom}</td></tr>
  ),
}));

vi.mock('./TotauxJournaliers', () => ({
  default: () => <tr data-testid="totaux-journaliers" />,
}));

vi.mock('./SelecteurProjetActivite', () => ({
  default: () => null,
}));

vi.mock('./HistoriqueModal', () => ({
  default: () => null,
}));

// Mock des icones
vi.mock('@heroicons/react/24/outline', () => ({
  PlusIcon: () => <span>+</span>,
  CalendarDaysIcon: () => <span>cal</span>,
}));

import { useSaisieStore } from '../../stores/saisieStore';

const joursTest: JourSemaine[] = [
  { date: new Date('2026-02-09'), dateStr: '2026-02-09', jourNom: 'lun', jourComplet: 'Lundi', estAujourdhui: false, estFutur: false },
  { date: new Date('2026-02-10'), dateStr: '2026-02-10', jourNom: 'mar', jourComplet: 'Mardi', estAujourdhui: false, estFutur: false },
  { date: new Date('2026-02-11'), dateStr: '2026-02-11', jourNom: 'mer', jourComplet: 'Mercredi', estAujourdhui: false, estFutur: false },
  { date: new Date('2026-02-12'), dateStr: '2026-02-12', jourNom: 'jeu', jourComplet: 'Jeudi', estAujourdhui: false, estFutur: false },
  { date: new Date('2026-02-13'), dateStr: '2026-02-13', jourNom: 'ven', jourComplet: 'Vendredi', estAujourdhui: false, estFutur: false },
  { date: new Date('2026-02-14'), dateStr: '2026-02-14', jourNom: 'sam', jourComplet: 'Samedi', estAujourdhui: false, estFutur: false },
  { date: new Date('2026-02-15'), dateStr: '2026-02-15', jourNom: 'dim', jourComplet: 'Dimanche', estAujourdhui: false, estFutur: false },
];

const ligneTest: LigneSaisie = {
  id: 'ligne-1',
  projetId: '1',
  projetNom: 'Projet Alpha',
  projetCode: 'PA',
  activiteId: '10',
  activiteNom: 'Developpement',
  activiteChemin: 'Dev > Backend',
  saisies: {},
  estNouvelle: false,
};

function mockStore(overrides = {}) {
  vi.mocked(useSaisieStore).mockReturnValue({
    semaineISO: '2026-W07',
    lignes: [],
    jours: joursTest,
    chargement: false,
    sauvegarde: false,
    erreur: null,
    ajouterLigne: vi.fn(),
    supprimerLigne: vi.fn(),
    modifierCellule: vi.fn(),
    getTotalJour: vi.fn().mockReturnValue(0),
    getTotalLigne: vi.fn().mockReturnValue(0),
    chargerSaisies: vi.fn(),
    setChargement: vi.fn(),
    setSauvegarde: vi.fn(),
    setErreur: vi.fn(),
    aDifficultes: vi.fn().mockReturnValue(false),
    getModifications: vi.fn(),
    reinitialiserModifications: vi.fn(),
    ...overrides,
  });
}

describe('GrilleSemaine', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  // U-V01 : affiche le spinner pendant le chargement
  it('affiche le spinner pendant le chargement', () => {
    mockStore({ chargement: true });

    renderAvecApollo(<GrilleSemaine absencesParJour={{}} />);

    expect(screen.getByText('Chargement des saisies…')).toBeInTheDocument();
    expect(screen.queryByRole('table')).not.toBeInTheDocument();
  });

  // U-V02 : affiche les lignes de saisie existantes
  it('affiche les lignes de saisie existantes', () => {
    mockStore({ lignes: [ligneTest] });

    renderAvecApollo(<GrilleSemaine absencesParJour={{}} />);

    expect(screen.getByRole('table')).toBeInTheDocument();
    expect(screen.getByTestId('ligne-saisie')).toBeInTheDocument();
    expect(screen.getByText('Developpement')).toBeInTheDocument();
  });

  it('affiche le tableau vide quand aucune ligne', () => {
    mockStore({ lignes: [] });

    renderAvecApollo(<GrilleSemaine absencesParJour={{}} />);

    expect(screen.getByRole('table')).toBeInTheDocument();
    expect(screen.queryByTestId('ligne-saisie')).not.toBeInTheDocument();
  });
});
