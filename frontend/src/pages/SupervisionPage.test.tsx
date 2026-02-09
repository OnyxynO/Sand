// Tests pour SupervisionPage - verifie le rendu des anomalies et tous les types

import { render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, it, expect, vi } from 'vitest';

// Mock authStore - moderateur par defaut
vi.mock('../stores/authStore', () => ({
  useAuthStore: () => ({
    utilisateur: { id: '3', role: 'MODERATEUR', nom: 'Dupont', prenom: 'Marie' },
  }),
}));

// Mock date-fns
vi.mock('date-fns', async () => {
  const actual = await vi.importActual('date-fns');
  return {
    ...actual,
    format: (date: Date, fmt: string) => {
      if (fmt === 'yyyy-MM-dd') return date.toISOString().split('T')[0];
      if (fmt === 'd MMM') return '3 fev';
      if (fmt === 'd MMM yyyy') return '9 fev 2026';
      if (fmt === 'EEEE d MMMM') return 'lundi 3 fevrier';
      return 'date';
    },
  };
});

// Mock useQuery pour eviter le probleme de variables dynamiques
const mockUseQuery = vi.fn();
vi.mock('@apollo/client/react', () => ({
  useQuery: (...args: unknown[]) => mockUseQuery(...args),
}));

import SupervisionPage from './SupervisionPage';
import { ANOMALIES_QUERY } from '../graphql/operations/supervision';
import { PROJETS_QUERY } from '../graphql/operations/projects';

const utilisateurMock = {
  id: '1',
  nomComplet: 'Jean Martin',
  email: 'jean.martin@sand.local',
  equipe: { id: '1', nom: 'Equipe Dev' },
};

function configurerMock(anomalies: unknown[] = [], loading = false, error: Error | null = null) {
  mockUseQuery.mockImplementation((query: unknown) => {
    if (query === ANOMALIES_QUERY) {
      return {
        data: loading ? undefined : { anomalies },
        loading,
        error,
      };
    }
    if (query === PROJETS_QUERY) {
      return {
        data: { projets: [{ id: '1', nom: 'Projet Alpha', code: 'ALPHA' }] },
        loading: false,
        error: null,
      };
    }
    // TEAMS_QUERY - skip pour moderateur
    return { data: undefined, loading: false, error: null };
  });
}

describe('SupervisionPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('affiche le titre', () => {
    configurerMock([]);
    render(<MemoryRouter><SupervisionPage /></MemoryRouter>);
    expect(screen.getByText('Supervision')).toBeInTheDocument();
  });

  it('affiche chargement', () => {
    configurerMock([], true);
    render(<MemoryRouter><SupervisionPage /></MemoryRouter>);
    expect(screen.getByText('Chargement...')).toBeInTheDocument();
  });

  it('affiche "aucune anomalie" quand liste vide', () => {
    configurerMock([]);
    render(<MemoryRouter><SupervisionPage /></MemoryRouter>);
    expect(screen.getByText('Aucune anomalie')).toBeInTheDocument();
  });

  it('affiche les anomalies de type JOUR_INCOMPLET', () => {
    configurerMock([
      {
        id: '1',
        type: 'JOUR_INCOMPLET',
        date: '2026-02-03',
        semaine: null,
        detail: 'Total du jour: 0.50 ETP (attendu: 1.00)',
        utilisateur: utilisateurMock,
        projet: null,
      },
    ]);

    render(<MemoryRouter><SupervisionPage /></MemoryRouter>);

    expect(screen.getByText('Jour incomplet')).toBeInTheDocument();
    expect(screen.getByText('Total du jour: 0.50 ETP (attendu: 1.00)')).toBeInTheDocument();
    expect(screen.getByText('Jean Martin')).toBeInTheDocument();
  });

  it('affiche les anomalies de type JOUR_MANQUANT', () => {
    configurerMock([
      {
        id: '2',
        type: 'JOUR_MANQUANT',
        date: '2026-02-04',
        semaine: null,
        detail: 'Aucune saisie pour ce jour ouvre',
        utilisateur: utilisateurMock,
        projet: null,
      },
    ]);

    render(<MemoryRouter><SupervisionPage /></MemoryRouter>);

    expect(screen.getByText('Jour manquant')).toBeInTheDocument();
    expect(screen.getByText('Aucune saisie pour ce jour ouvre')).toBeInTheDocument();
  });

  it('affiche les anomalies de type SAISIE_SUR_ABSENCE', () => {
    configurerMock([
      {
        id: '3',
        type: 'SAISIE_SUR_ABSENCE',
        date: '2026-02-05',
        semaine: null,
        detail: "Saisie de 0.50 ETP sur un jour d'absence",
        utilisateur: utilisateurMock,
        projet: null,
      },
    ]);

    render(<MemoryRouter><SupervisionPage /></MemoryRouter>);

    expect(screen.getByText('Saisie sur absence')).toBeInTheDocument();
    expect(screen.getByText("Saisie de 0.50 ETP sur un jour d'absence")).toBeInTheDocument();
  });

  it('affiche erreur quand la query echoue', () => {
    configurerMock([], false, new Error('Erreur serveur'));
    render(<MemoryRouter><SupervisionPage /></MemoryRouter>);
    expect(screen.getByText(/Erreur/)).toBeInTheDocument();
  });

  it('groupe les anomalies par utilisateur', () => {
    const utilisateur2 = {
      id: '2',
      nomComplet: 'Pierre Bernard',
      email: 'pierre.bernard@sand.local',
      equipe: { id: '1', nom: 'Equipe Dev' },
    };

    configurerMock([
      {
        id: '1',
        type: 'JOUR_INCOMPLET',
        date: '2026-02-03',
        semaine: null,
        detail: 'Total: 0.50',
        utilisateur: utilisateurMock,
        projet: null,
      },
      {
        id: '2',
        type: 'JOUR_MANQUANT',
        date: '2026-02-04',
        semaine: null,
        detail: 'Aucune saisie',
        utilisateur: utilisateurMock,
        projet: null,
      },
      {
        id: '3',
        type: 'JOUR_INCOMPLET',
        date: '2026-02-03',
        semaine: null,
        detail: 'Total: 0.75',
        utilisateur: utilisateur2,
        projet: null,
      },
    ]);

    render(<MemoryRouter><SupervisionPage /></MemoryRouter>);

    expect(screen.getByText('Jean Martin')).toBeInTheDocument();
    expect(screen.getByText('Pierre Bernard')).toBeInTheDocument();
    expect(screen.getByText('2 anomalies')).toBeInTheDocument();
    expect(screen.getByText('1 anomalie')).toBeInTheDocument();
  });

  it('affiche le compteur total d\'anomalies', () => {
    configurerMock([
      {
        id: '1',
        type: 'JOUR_INCOMPLET',
        date: '2026-02-03',
        semaine: null,
        detail: 'detail',
        utilisateur: utilisateurMock,
        projet: null,
      },
      {
        id: '2',
        type: 'JOUR_MANQUANT',
        date: '2026-02-04',
        semaine: null,
        detail: 'detail',
        utilisateur: utilisateurMock,
        projet: null,
      },
    ]);

    render(<MemoryRouter><SupervisionPage /></MemoryRouter>);

    expect(screen.getByText('2 anomalies detectees')).toBeInTheDocument();
  });
});
