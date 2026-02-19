import { screen, waitFor } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { renderAvecApollo } from '../test/renderAvecApollo';
import StatsGlobalesPage from './StatsGlobalesPage';
import { STATS_GLOBALES, STATS_PERIODE_PRECEDENTE } from '../graphql/operations/statistics';
import { TEAMS_FULL_QUERY } from '../graphql/operations/teams';

// recharts et heroicons mockes globalement dans test/setup.ts

// Le composant calcule les dates du mois courant et precedent
const now = new Date();
const y = now.getFullYear();
const m = now.getMonth();
const dateDebut = `${y}-${String(m + 1).padStart(2, '0')}-01`;
const dateFin = `${y}-${String(m + 1).padStart(2, '0')}-${new Date(y, m + 1, 0).getDate()}`;
const mp = m === 0 ? 11 : m - 1;
const yp = m === 0 ? y - 1 : y;
const debutPrec = `${yp}-${String(mp + 1).padStart(2, '0')}-01`;
const finPrec = `${yp}-${String(mp + 1).padStart(2, '0')}-${new Date(yp, mp + 1, 0).getDate()}`;

function creerMocks(equipes = [{ __typename: 'Team' as const, id: '1', nom: 'Equipe Dev', code: 'DEV', description: null, estActif: true, createdAt: '2026-01-01', membres: [] }]) {
  return [
    {
      request: { query: TEAMS_FULL_QUERY, variables: { actifSeulement: true } },
      result: { data: { equipes } },
    },
    {
      request: { query: STATS_GLOBALES, variables: { dateDebut, dateFin } },
      result: { data: { statistiques: { __typename: 'Statistics', tempsTotal: 0, parProjet: [], parActivite: [], parUtilisateur: [], parJour: [] } } },
    },
    {
      request: { query: STATS_PERIODE_PRECEDENTE, variables: { dateDebut: debutPrec, dateFin: finPrec } },
      result: { data: { statistiques: { __typename: 'Statistics', tempsTotal: 0, parUtilisateur: [] } } },
    },
  ];
}

describe('StatsGlobalesPage', () => {
  it('affiche le titre', () => {
    renderAvecApollo(<StatsGlobalesPage />, creerMocks());

    expect(screen.getByText('Statistiques globales')).toBeInTheDocument();
    expect(screen.getByText("Vue d'ensemble de l'activite de l'organisation")).toBeInTheDocument();
  });

  it('affiche le filtre equipe', () => {
    renderAvecApollo(<StatsGlobalesPage />, creerMocks());

    expect(screen.getByText('Equipe')).toBeInTheDocument();
    expect(screen.getByText('Toutes les equipes')).toBeInTheDocument();
  });

  it('charge les equipes dans le select', async () => {
    renderAvecApollo(<StatsGlobalesPage />, creerMocks());

    await waitFor(() => {
      expect(screen.getByText('DEV - Equipe Dev')).toBeInTheDocument();
    });
  });
});
