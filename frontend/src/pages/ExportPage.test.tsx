import { screen, waitFor } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { renderAvecApollo } from '../test/renderAvecApollo';
import ExportPage from './ExportPage';
import { PROJETS_ACTIFS } from '../graphql/operations/saisie';
import { TEAMS_FULL_QUERY } from '../graphql/operations/teams';

const mocks = [
  {
    request: { query: PROJETS_ACTIFS },
    result: {
      data: {
        projets: [
          { __typename: 'Project', id: '1', nom: 'Projet Alpha', code: 'ALPHA', estActif: true },
          { __typename: 'Project', id: '2', nom: 'Projet Beta', code: 'BETA', estActif: true },
        ],
      },
    },
  },
  {
    request: { query: TEAMS_FULL_QUERY, variables: { actifSeulement: true } },
    result: {
      data: {
        equipes: [
          { __typename: 'Team', id: '1', nom: 'Equipe Dev', code: 'DEV', description: null, estActif: true, createdAt: '2026-01-01', membres: [] },
        ],
      },
    },
  },
];

describe('ExportPage', () => {
  it('affiche le titre et le formulaire', () => {
    renderAvecApollo(<ExportPage />, mocks);

    expect(screen.getByText('Export CSV')).toBeInTheDocument();
    expect(screen.getByText('Filtres')).toBeInTheDocument();
    expect(screen.getByLabelText('Date debut')).toBeInTheDocument();
    expect(screen.getByLabelText('Date fin')).toBeInTheDocument();
    expect(screen.getByText('Exporter en CSV')).toBeInTheDocument();
  });

  it('affiche la section info', () => {
    renderAvecApollo(<ExportPage />, mocks);

    expect(screen.getByText('Comment ca marche ?')).toBeInTheDocument();
    expect(screen.getByText(/expire apres 24 heures/)).toBeInTheDocument();
  });

  it('charge les projets dans le select', async () => {
    renderAvecApollo(<ExportPage />, mocks);

    await waitFor(() => {
      expect(screen.getByText('ALPHA - Projet Alpha')).toBeInTheDocument();
    });
  });

  it('charge les equipes dans le select', async () => {
    renderAvecApollo(<ExportPage />, mocks);

    await waitFor(() => {
      expect(screen.getByText('DEV - Equipe Dev')).toBeInTheDocument();
    });
  });

  it('bouton exporter est actif', () => {
    renderAvecApollo(<ExportPage />, mocks);

    const bouton = screen.getByText('Exporter en CSV');
    expect(bouton).not.toBeDisabled();
  });

  it('n\'affiche pas la section historique initialement', () => {
    renderAvecApollo(<ExportPage />, mocks);

    expect(screen.queryByText('Exports demandes')).not.toBeInTheDocument();
  });
});
