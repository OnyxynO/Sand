import { screen, waitFor } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { renderAvecApollo } from '../test/renderAvecApollo';
import StatsProjetPage from './StatsProjetPage';
import { STATS_PROJET } from '../graphql/operations/statistics';
import { PROJETS_ACTIFS } from '../graphql/operations/saisie';

// recharts et heroicons mockes globalement dans test/setup.ts

// Le composant calcule les dates du mois courant
const now = new Date();
const y = now.getFullYear();
const m = now.getMonth();
const dateDebut = `${y}-${String(m + 1).padStart(2, '0')}-01`;
const dateFin = `${y}-${String(m + 1).padStart(2, '0')}-${new Date(y, m + 1, 0).getDate()}`;

const projetsMock = {
  request: { query: PROJETS_ACTIFS },
  result: {
    data: {
      projets: [
        { __typename: 'Project', id: '1', nom: 'Projet Alpha', code: 'ALPHA', estActif: true },
      ],
    },
  },
};

// Le composant auto-selectionne le premier projet -> STATS_PROJET est appele
const statsMock = {
  request: {
    query: STATS_PROJET,
    variables: { dateDebut, dateFin, projetId: '1' },
  },
  result: {
    data: {
      statistiques: {
        __typename: 'Statistics',
        tempsTotal: 0,
        parActivite: [],
        parUtilisateur: [],
        parJour: [],
      },
    },
  },
};

describe('StatsProjetPage', () => {
  it('affiche le titre', () => {
    renderAvecApollo(<StatsProjetPage />, [projetsMock, statsMock]);
    expect(screen.getByText('Statistiques projet')).toBeInTheDocument();
  });

  it('affiche le selecteur de projet', () => {
    renderAvecApollo(<StatsProjetPage />, [projetsMock, statsMock]);
    expect(screen.getByText('Projet')).toBeInTheDocument();
  });

  it('charge les projets dans le select', async () => {
    renderAvecApollo(<StatsProjetPage />, [projetsMock, statsMock]);

    await waitFor(() => {
      expect(screen.getByText('ALPHA - Projet Alpha')).toBeInTheDocument();
    });
  });
});
