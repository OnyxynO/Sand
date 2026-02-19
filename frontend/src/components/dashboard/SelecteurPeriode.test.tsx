import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import SelecteurPeriode from './SelecteurPeriode';

describe('SelecteurPeriode', () => {
  const mockChange = vi.fn();
  const defaultProps = {
    dateDebut: '2026-01-01',
    dateFin: '2026-01-31',
    onChangePeriode: mockChange,
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('affiche le mois et annee courants', () => {
    render(<SelecteurPeriode {...defaultProps} />);

    // Le composant affiche le mois courant (de l'horloge systeme)
    const heading = screen.getByRole('heading');
    expect(heading).toBeInTheDocument();
  });

  it('navigue au mois precedent', () => {
    render(<SelecteurPeriode {...defaultProps} />);

    const boutonPrecedent = screen.getByTitle('Mois precedent');
    fireEvent.click(boutonPrecedent);

    expect(mockChange).toHaveBeenCalledTimes(1);
    // Verifie que les dates passees sont des strings au format YYYY-MM-DD
    const [debut, fin] = mockChange.mock.calls[0];
    expect(debut).toMatch(/^\d{4}-\d{2}-01$/);
    expect(fin).toMatch(/^\d{4}-\d{2}-\d{2}$/);
  });

  it('navigue au mois suivant', () => {
    render(<SelecteurPeriode {...defaultProps} />);

    const boutonSuivant = screen.getByTitle('Mois suivant');
    fireEvent.click(boutonSuivant);

    expect(mockChange).toHaveBeenCalledTimes(1);
  });

  it('boutons de navigation sont presents', () => {
    render(<SelecteurPeriode {...defaultProps} />);

    expect(screen.getByTitle('Mois precedent')).toBeInTheDocument();
    expect(screen.getByTitle('Mois suivant')).toBeInTheDocument();
  });
});
