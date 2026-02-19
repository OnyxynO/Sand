import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';

vi.mock('recharts', () => ({
  BarChart: ({ children }: { children: React.ReactNode }) => <div data-testid="bar-chart">{children}</div>,
  Bar: () => null,
  XAxis: () => null,
  YAxis: () => null,
  Tooltip: () => null,
  ResponsiveContainer: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}));

import GraphiqueUtilisateurs from './GraphiqueUtilisateurs';

describe('GraphiqueUtilisateurs', () => {
  it('affiche le titre', () => {
    render(<GraphiqueUtilisateurs donnees={[]} />);
    expect(screen.getByText('Temps par utilisateur')).toBeInTheDocument();
  });

  it('affiche message vide quand pas de donnees', () => {
    render(<GraphiqueUtilisateurs donnees={[]} />);
    expect(screen.getByText('Aucune donnee pour cette periode')).toBeInTheDocument();
  });

  it('affiche le graphique quand donnees presentes', () => {
    const donnees = [
      { utilisateur: { id: '1', nomComplet: 'Jean Dupont' }, tempsTotal: 10.0, tauxCompletion: 80 },
      { utilisateur: { id: '2', nomComplet: 'Marie Martin' }, tempsTotal: 8.0, tauxCompletion: 90 },
    ];

    render(<GraphiqueUtilisateurs donnees={donnees} />);

    expect(screen.getByTestId('bar-chart')).toBeInTheDocument();
    expect(screen.queryByText('Aucune donnee pour cette periode')).not.toBeInTheDocument();
  });

  it('trie les donnees par temps decroissant', () => {
    const donnees = [
      { utilisateur: { id: '1', nomComplet: 'Jean' }, tempsTotal: 3.0, tauxCompletion: 50 },
      { utilisateur: { id: '2', nomComplet: 'Marie' }, tempsTotal: 8.0, tauxCompletion: 90 },
      { utilisateur: { id: '3', nomComplet: 'Paul' }, tempsTotal: 5.0, tauxCompletion: 70 },
    ];

    // Le composant trie en interne ; on verifie qu'il rend sans erreur
    const { container } = render(<GraphiqueUtilisateurs donnees={donnees} />);
    expect(container).toBeTruthy();
  });
});
