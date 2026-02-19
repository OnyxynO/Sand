import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock heroicons (composants SVG simples)
vi.mock('@heroicons/react/24/outline', () => {
  const creerIcone = (nom: string) => {
    const Composant = (props: Record<string, unknown>) => <svg data-testid={`icon-${nom}`} {...props} />;
    Composant.displayName = nom;
    return Composant;
  };
  return {
    PlusIcon: creerIcone('PlusIcon'),
    PencilSquareIcon: creerIcone('PencilSquareIcon'),
    TrashIcon: creerIcone('TrashIcon'),
    XMarkIcon: creerIcone('XMarkIcon'),
    ChevronRightIcon: creerIcone('ChevronRightIcon'),
    ChevronDownIcon: creerIcone('ChevronDownIcon'),
    ArrowUpIcon: creerIcone('ArrowUpIcon'),
    ArrowDownIcon: creerIcone('ArrowDownIcon'),
    ArrowRightIcon: creerIcone('ArrowRightIcon'),
    LockClosedIcon: creerIcone('LockClosedIcon'),
    Bars3Icon: creerIcone('Bars3Icon'),
    MagnifyingGlassIcon: creerIcone('MagnifyingGlassIcon'),
  };
});

// Mock @headlessui/react
vi.mock('@headlessui/react', () => ({
  Dialog: Object.assign(
    ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
    {
      Panel: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
      Title: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
    },
  ),
  Transition: Object.assign(
    ({ children, show }: { children: React.ReactNode; show?: boolean }) =>
      show !== false ? <div>{children}</div> : null,
    {
      Child: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
    },
  ),
}));

// Mock Apollo Client
const mockRefetch = vi.fn();
vi.mock('@apollo/client/react', () => ({
  useQuery: vi.fn(() => ({
    data: {
      arbreActivites: [
        {
          id: '1',
          nom: 'Developpement',
          code: 'DEV',
          chemin: 'developpement',
          niveau: 0,
          ordre: 0,
          estFeuille: false,
          estSysteme: false,
          estActif: true,
          enfants: [
            {
              id: '2',
              nom: 'Frontend',
              code: 'FE',
              chemin: 'developpement.frontend',
              niveau: 1,
              ordre: 0,
              estFeuille: true,
              estSysteme: false,
              estActif: true,
              enfants: [],
            },
          ],
        },
        {
          id: '3',
          nom: 'Absence',
          chemin: 'absence',
          niveau: 0,
          ordre: 1,
          estFeuille: true,
          estSysteme: true,
          estActif: true,
          enfants: [],
        },
      ],
    },
    loading: false,
    refetch: mockRefetch,
  })),
  useMutation: vi.fn(() => [vi.fn(), { loading: false }]),
}));

// Mock Apollo Client (gql)
vi.mock('@apollo/client', () => ({
  gql: (strings: TemplateStringsArray) => strings.join(''),
}));

// Mock NavAdmin
vi.mock('../../../components/admin/NavAdmin', () => ({
  default: () => <div data-testid="nav-admin">NavAdmin</div>,
}));

// Mock SelectionParentModal
vi.mock('../../../components/admin/SelectionParentModal', () => ({
  default: () => null,
}));

import ActivitesPage from '../ActivitesPage';

describe('ActivitesPage - Drag and Drop', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('affiche les poignees de drag pour chaque activite', () => {
    render(<ActivitesPage />);

    expect(screen.getByTestId('drag-handle-1')).toBeInTheDocument();
    expect(screen.getByTestId('drag-handle-2')).toBeInTheDocument();
    expect(screen.getByTestId('drag-handle-3')).toBeInTheDocument();
  });

  it('affiche les poignees meme pour les activites systeme', () => {
    render(<ActivitesPage />);

    // L'activite systeme (Absence, id: 3) a aussi une poignee
    expect(screen.getByTestId('drag-handle-3')).toBeInTheDocument();
  });

  it('conserve les boutons monter/descendre', () => {
    render(<ActivitesPage />);

    const boutonsMonter = screen.getAllByTitle('Monter');
    const boutonsDescendre = screen.getAllByTitle('Descendre');
    expect(boutonsMonter.length).toBeGreaterThan(0);
    expect(boutonsDescendre.length).toBeGreaterThan(0);
  });

  it('affiche les noms des activites dans la liste aplatie', () => {
    render(<ActivitesPage />);

    expect(screen.getByText('Developpement')).toBeInTheDocument();
    expect(screen.getByText('Frontend')).toBeInTheDocument();
    expect(screen.getByText('Absence')).toBeInTheDocument();
  });

  it('les poignees ont l\'attribut title pour l\'accessibilite', () => {
    render(<ActivitesPage />);

    const poignees = screen.getAllByTitle('Glisser pour deplacer');
    expect(poignees.length).toBeGreaterThan(0);
  });
});
