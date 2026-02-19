import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';

vi.mock('recharts', () => ({
  LineChart: ({ children }: { children: React.ReactNode }) => <div data-testid="line-chart">{children}</div>,
  Line: () => null,
  XAxis: () => null,
  YAxis: () => null,
  Tooltip: () => null,
  ReferenceLine: () => null,
  ResponsiveContainer: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}));

import GraphiqueEvolution from './GraphiqueEvolution';

describe('GraphiqueEvolution', () => {
  it('affiche le titre', () => {
    render(<GraphiqueEvolution donnees={[]} />);
    expect(screen.getByText('Evolution journaliere')).toBeInTheDocument();
  });

  it('affiche message vide quand pas de donnees', () => {
    render(<GraphiqueEvolution donnees={[]} />);
    expect(screen.getByText('Aucune donnee pour cette periode')).toBeInTheDocument();
  });

  it('affiche le graphique quand donnees presentes', () => {
    const donnees = [
      { date: '2026-01-15', tempsTotal: 1.0, estComplet: true },
      { date: '2026-01-16', tempsTotal: 0.5, estComplet: false },
    ];

    render(<GraphiqueEvolution donnees={donnees} />);

    expect(screen.getByTestId('line-chart')).toBeInTheDocument();
    expect(screen.queryByText('Aucune donnee pour cette periode')).not.toBeInTheDocument();
  });
});
