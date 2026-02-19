import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';

// Mock recharts car happy-dom ne supporte pas SVG complet
vi.mock('recharts', () => ({
  PieChart: ({ children }: { children: React.ReactNode }) => <div data-testid="pie-chart">{children}</div>,
  Pie: () => null,
  Cell: () => null,
  Tooltip: () => null,
  Legend: () => null,
  ResponsiveContainer: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}));

import GraphiqueActivites from './GraphiqueActivites';

describe('GraphiqueActivites', () => {
  it('affiche le titre', () => {
    render(<GraphiqueActivites donnees={[]} />);
    expect(screen.getByText('Repartition par activite')).toBeInTheDocument();
  });

  it('affiche message vide quand pas de donnees', () => {
    render(<GraphiqueActivites donnees={[]} />);
    expect(screen.getByText('Aucune donnee pour cette periode')).toBeInTheDocument();
  });

  it('affiche le graphique quand donnees presentes', () => {
    const donnees = [
      { activite: { id: '1', nom: 'Dev' }, tempsTotal: 5.0, pourcentage: 60 },
      { activite: { id: '2', nom: 'Test' }, tempsTotal: 3.0, pourcentage: 40 },
    ];

    render(<GraphiqueActivites donnees={donnees} />);

    expect(screen.getByTestId('pie-chart')).toBeInTheDocument();
    expect(screen.queryByText('Aucune donnee pour cette periode')).not.toBeInTheDocument();
  });
});
