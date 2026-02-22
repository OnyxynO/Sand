import { screen, render, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { MemoryRouter } from 'react-router-dom';
import ExportPage from './ExportPage';
import { MES_EXPORTS, REQUEST_EXPORT } from '../graphql/operations/export';
import { PROJETS_ACTIFS } from '../graphql/operations/saisie';
import { TEAMS_FULL_QUERY } from '../graphql/operations/teams';
import { useNotificationStore } from '../stores/notificationStore';

// Heroicons crashent dans jsdom (rendu SVG) → on les remplace par des spans
vi.mock('@heroicons/react/24/outline', () => ({
  ArrowDownTrayIcon: () => <span data-testid="icon-download" />,
  ArrowPathIcon: () => <span data-testid="icon-refresh" />,
  CheckCircleIcon: () => <span data-testid="icon-check" />,
  ClockIcon: () => <span data-testid="icon-clock" />,
  ExclamationTriangleIcon: () => <span data-testid="icon-warning" />,
  InformationCircleIcon: () => <span data-testid="icon-info" />,
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
    expect(screen.getByText('Telecharger')).toBeInTheDocument();
    // Bouton info (popover filtres) présent pour chaque ligne
    expect(screen.getByTestId('icon-info')).toBeInTheDocument();
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

  it('affiche le bouton info (popover filtres) pour un export avec filtres', () => {
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

    // Le bouton info ouvre un popover avec les détails des filtres (période, projet, etc.)
    expect(screen.getByTestId('icon-info')).toBeInTheDocument();
    expect(screen.getByText('Telecharger')).toBeInTheDocument();
  });
});

// ─── EV-09 : délai minimum 3 s avant affichage "Disponible" ──────────────────
describe('EV-09 — délai minimum En cours', () => {
  const exportTermine = {
    id: 'ev09-id',
    statut: 'TERMINE',
    filtres: null,
    expireLe: new Date(Date.now() + 86400000).toISOString(),
    creeLe: new Date().toISOString(),
  };

  let capturedOnCompleted: ((data: unknown) => void) | undefined;

  beforeEach(() => {
    vi.useFakeTimers();
    capturedOnCompleted = undefined;

    mockUseQuery.mockImplementation((query: unknown) => {
      if (query === PROJETS_ACTIFS) return { data: { projets }, loading: false };
      if (query === TEAMS_FULL_QUERY) return { data: { equipes }, loading: false };
      if (query === MES_EXPORTS) return { data: { mesExports: [exportTermine] }, loading: false, refetch: vi.fn() };
      return { data: undefined, loading: false };
    });

    mockUseMutation.mockImplementation((mutation: unknown, options?: { onCompleted?: (data: unknown) => void }) => {
      if (mutation === REQUEST_EXPORT) {
        capturedOnCompleted = options?.onCompleted;
      }
      return [vi.fn(), { loading: false }];
    });
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('masque TERMINE et affiche En cours pendant les 3 premières secondes', () => {
    renderPage();
    // Initialement : serveur dit TERMINE → Disponible
    expect(screen.getByText('Disponible')).toBeInTheDocument();

    // Simuler le retour de la mutation (onCompleted définit le délai)
    act(() => {
      capturedOnCompleted?.({
        requestExport: { id: 'ev09-id', statut: 'EN_ATTENTE', filtres: null, expireLe: null, creeLe: new Date().toISOString() },
      });
    });

    // delaiFin actif → badge masqué à "En cours" malgré TERMINE côté serveur
    expect(screen.getByText('En cours')).toBeInTheDocument();
    expect(screen.queryByText('Disponible')).not.toBeInTheDocument();
  });

  it('bascule sur Disponible après 3 secondes', () => {
    renderPage();

    act(() => {
      capturedOnCompleted?.({
        requestExport: { id: 'ev09-id', statut: 'EN_ATTENTE', filtres: null, expireLe: null, creeLe: new Date().toISOString() },
      });
    });

    expect(screen.getByText('En cours')).toBeInTheDocument();

    // Avancer le temps au-delà du délai
    act(() => {
      vi.advanceTimersByTime(3001);
    });

    expect(screen.getByText('Disponible')).toBeInTheDocument();
    expect(screen.queryByText('En cours')).not.toBeInTheDocument();
  });
});

// ─── EV-11 : Observer — signal Zustand sur transition TERMINE ────────────────
describe('EV-11 — Observer signal notifications', () => {
  beforeEach(() => {
    // Réinitialiser le store Zustand entre chaque test
    useNotificationStore.setState({ refreshCount: 0 });
  });

  it('ne déclenche pas de signal au premier chargement', () => {
    configurerMocks([
      { id: '1', statut: 'TERMINE', filtres: null, expireLe: null, creeLe: new Date().toISOString() },
    ]);
    renderPage();

    expect(useNotificationStore.getState().refreshCount).toBe(0);
  });

  it('ne déclenche pas de signal si le statut TERMINE était déjà connu', () => {
    // Même statut TERMINE sur deux polls consécutifs → pas de signal
    const { rerender } = renderPage();
    configurerMocks([
      { id: '1', statut: 'TERMINE', filtres: null, expireLe: null, creeLe: new Date().toISOString() },
    ]);
    rerender(
      <MemoryRouter>
        <ExportPage />
      </MemoryRouter>,
    );

    expect(useNotificationStore.getState().refreshCount).toBe(0);
  });

  it('envoie le signal quand un export passe de EN_COURS à TERMINE', () => {
    // Premier poll : EN_COURS
    configurerMocks([
      { id: '1', statut: 'EN_COURS', filtres: null, expireLe: null, creeLe: new Date().toISOString() },
    ]);
    const { rerender } = renderPage();
    expect(useNotificationStore.getState().refreshCount).toBe(0);

    // Deuxième poll : TERMINE
    configurerMocks([
      { id: '1', statut: 'TERMINE', filtres: null, expireLe: null, creeLe: new Date().toISOString() },
    ]);
    rerender(
      <MemoryRouter>
        <ExportPage />
      </MemoryRouter>,
    );

    // Le signal Zustand doit avoir été incrémenté → NotificationBell appellera refetch()
    expect(useNotificationStore.getState().refreshCount).toBe(1);
  });
});
