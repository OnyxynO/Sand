import { screen } from '@testing-library/react';
import { render } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { MemoryRouter } from 'react-router-dom';
import ExportPage from './ExportPage';
import { MES_EXPORTS } from '../graphql/operations/export';
import { PROJETS_ACTIFS } from '../graphql/operations/saisie';
import { TEAMS_FULL_QUERY } from '../graphql/operations/teams';

// Heroicons crashent dans jsdom (rendu SVG) → on les remplace par des spans
vi.mock('@heroicons/react/24/outline', () => ({
  ArrowDownTrayIcon: () => <span data-testid="icon-download" />,
  ArrowPathIcon: () => <span data-testid="icon-refresh" />,
  CheckCircleIcon: () => <span data-testid="icon-check" />,
  ClockIcon: () => <span data-testid="icon-clock" />,
  ExclamationTriangleIcon: () => <span data-testid="icon-warning" />,
  MinusCircleIcon: () => <span data-testid="icon-minus" />,
  TrashIcon: () => <span data-testid="icon-trash" />,
  XCircleIcon: () => <span data-testid="icon-x" />,
}));

const mockUseQuery = vi.fn();
const mockUseMutation = vi.fn();

vi.mock('@apollo/client/react', () => ({
  useQuery: (...args: unknown[]) => mockUseQuery(...args),
  useMutation: (...args: unknown[]) => mockUseMutation(...args),
}));

const projets = [
  { id: '1', nom: 'Projet Alpha', code: 'ALPHA', estActif: true },
  { id: '2', nom: 'Projet Beta', code: 'BETA', estActif: true },
];

const equipes = [
  { id: '1', nom: 'Equipe Dev', code: 'DEV', estActif: true },
];

function configurerMocks(exports: unknown[] = []) {
  mockUseQuery.mockImplementation((query: unknown) => {
    if (query === PROJETS_ACTIFS) return { data: { projets }, loading: false };
    if (query === TEAMS_FULL_QUERY) return { data: { equipes }, loading: false };
    if (query === MES_EXPORTS) return { data: { mesExports: exports }, loading: false, refetch: vi.fn() };
    return { data: undefined, loading: false };
  });

  mockUseMutation.mockReturnValue([vi.fn(), { loading: false }]);
}

function renderPage() {
  return render(
    <MemoryRouter>
      <ExportPage />
    </MemoryRouter>,
  );
}

describe('ExportPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('affiche le titre et le formulaire', () => {
    configurerMocks();
    renderPage();

    expect(screen.getByText('Export CSV')).toBeInTheDocument();
    expect(screen.getByText('Filtres')).toBeInTheDocument();
    expect(screen.getByLabelText('Date debut')).toBeInTheDocument();
    expect(screen.getByLabelText('Date fin')).toBeInTheDocument();
    expect(screen.getByText('Exporter en CSV')).toBeInTheDocument();
  });

  it('affiche la section info', () => {
    configurerMocks();
    renderPage();

    expect(screen.getByText('Comment ca marche ?')).toBeInTheDocument();
    expect(screen.getByText(/expire apres 24 heures/)).toBeInTheDocument();
  });

  it('charge les projets dans le select', () => {
    configurerMocks();
    renderPage();

    expect(screen.getByText('ALPHA - Projet Alpha')).toBeInTheDocument();
    expect(screen.getByText('BETA - Projet Beta')).toBeInTheDocument();
  });

  it('charge les equipes dans le select', () => {
    configurerMocks();
    renderPage();

    expect(screen.getByText('DEV - Equipe Dev')).toBeInTheDocument();
  });

  it('bouton exporter est actif', () => {
    configurerMocks();
    renderPage();

    const bouton = screen.getByText('Exporter en CSV');
    expect(bouton).not.toBeDisabled();
  });

  it('n\'affiche pas la section historique si aucun export', () => {
    configurerMocks([]);
    renderPage();

    expect(screen.queryByText('Historique des exports')).not.toBeInTheDocument();
  });

  it('affiche le tableau quand des exports existent', () => {
    configurerMocks([
      {
        id: 'uuid-1',
        statut: 'TERMINE',
        filtres: { date_debut: '2026-01-01', date_fin: '2026-01-31' },
        expireLe: new Date(Date.now() + 3600 * 1000 * 24).toISOString(),
        creeLe: new Date().toISOString(),
      },
    ]);
    renderPage();

    expect(screen.getByText('Historique des exports')).toBeInTheDocument();
    expect(screen.getByText('01/01/2026 → 31/01/2026')).toBeInTheDocument();
    expect(screen.getByText('Telecharger')).toBeInTheDocument();
  });

  it('affiche le bouton Regenerer pour un export desactive', () => {
    configurerMocks([
      {
        id: 'uuid-2',
        statut: 'DESACTIVE',
        filtres: { date_debut: '2026-01-01', date_fin: '2026-01-31' },
        expireLe: null,
        creeLe: new Date().toISOString(),
      },
    ]);
    renderPage();

    expect(screen.getByText('Regenerer')).toBeInTheDocument();
    expect(screen.queryByText('Telecharger')).not.toBeInTheDocument();
  });

  it('affiche le badge Expire et le bouton Regenerer pour un export TERMINE expire', () => {
    configurerMocks([
      {
        id: 'uuid-3',
        statut: 'TERMINE',
        filtres: { date_debut: '2026-01-01', date_fin: '2026-01-31' },
        expireLe: new Date(Date.now() - 3600 * 1000).toISOString(),
        creeLe: new Date().toISOString(),
      },
    ]);
    renderPage();

    expect(screen.getByText('Expire')).toBeInTheDocument();
    expect(screen.getByText('Regenerer')).toBeInTheDocument();
    expect(screen.queryByText('Telecharger')).not.toBeInTheDocument();
  });

  it('affiche le badge statut correct pour chaque statut', () => {
    configurerMocks([
      { id: '1', statut: 'EN_ATTENTE', filtres: null, expireLe: null, creeLe: new Date().toISOString() },
      { id: '2', statut: 'ECHEC', filtres: null, expireLe: null, creeLe: new Date().toISOString() },
      { id: '3', statut: 'DESACTIVE', filtres: null, expireLe: null, creeLe: new Date().toISOString() },
    ]);
    renderPage();

    expect(screen.getByText('En cours')).toBeInTheDocument();
    expect(screen.getByText('Echec')).toBeInTheDocument();
    expect(screen.getByText('Desactive')).toBeInTheDocument();
  });

  it('affiche la periode et le badge projet quand present', () => {
    configurerMocks([
      {
        id: 'uuid-4',
        statut: 'TERMINE',
        filtres: { date_debut: '2026-01-01', date_fin: '2026-01-31', project_id: '1' },
        expireLe: new Date(Date.now() + 3600 * 1000 * 24).toISOString(),
        creeLe: new Date().toISOString(),
      },
    ]);
    renderPage();

    expect(screen.getByText('01/01/2026 → 31/01/2026')).toBeInTheDocument();
    expect(screen.getByText('ALPHA')).toBeInTheDocument();
  });
});
