import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import CarteResume from './CarteResume';

describe('CarteResume', () => {
  it('affiche la valeur et le label', () => {
    render(
      <CarteResume
        icone={<span data-testid="icone">I</span>}
        valeur="12.5 j"
        label="Temps total"
      />
    );

    expect(screen.getByText('12.5 j')).toBeInTheDocument();
    expect(screen.getByText('Temps total')).toBeInTheDocument();
    expect(screen.getByTestId('icone')).toBeInTheDocument();
  });

  it('applique la couleur personnalisee', () => {
    const { container } = render(
      <CarteResume
        icone={<span>I</span>}
        valeur="42"
        label="Test"
        couleurIcone="text-green-600 bg-green-100"
      />
    );

    const iconContainer = container.querySelector('.text-green-600');
    expect(iconContainer).toBeInTheDocument();
  });

  it('utilise couleur par defaut si non specifie', () => {
    const { container } = render(
      <CarteResume
        icone={<span>I</span>}
        valeur="0"
        label="Test"
      />
    );

    const iconContainer = container.querySelector('.text-blue-600');
    expect(iconContainer).toBeInTheDocument();
  });
});
