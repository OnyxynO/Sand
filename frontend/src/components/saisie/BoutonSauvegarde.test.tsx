// Tests pour BoutonSauvegarde - verifie que le composant utilise bien les props
// et non sa propre instance du hook (bug #41)

import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import BoutonSauvegarde from './BoutonSauvegarde';

describe('BoutonSauvegarde', () => {
  const mockSauvegarder = vi.fn().mockResolvedValue(undefined);

  it('ne s\'affiche pas si pas de modifications ni erreur', () => {
    const { container } = render(
      <BoutonSauvegarde
        aDesModifications={false}
        sauvegarde={false}
        erreur={null}
        sauvegarder={mockSauvegarder}
      />
    );

    expect(container.innerHTML).toBe('');
  });

  it('s\'affiche si des modifications existent', () => {
    render(
      <BoutonSauvegarde
        aDesModifications={true}
        sauvegarde={false}
        erreur={null}
        sauvegarder={mockSauvegarder}
      />
    );

    expect(screen.getByText('Modifications non enregistrees')).toBeInTheDocument();
    expect(screen.getByText('Enregistrer')).toBeInTheDocument();
  });

  it('s\'affiche si une erreur existe meme sans modifications', () => {
    render(
      <BoutonSauvegarde
        aDesModifications={false}
        sauvegarde={false}
        erreur="Erreur de sauvegarde"
        sauvegarder={mockSauvegarder}
      />
    );

    expect(screen.getByText('Erreur de sauvegarde')).toBeInTheDocument();
  });

  it('appelle la fonction sauvegarder recue en props au clic', () => {
    render(
      <BoutonSauvegarde
        aDesModifications={true}
        sauvegarde={false}
        erreur={null}
        sauvegarder={mockSauvegarder}
      />
    );

    fireEvent.click(screen.getByText('Enregistrer'));
    expect(mockSauvegarder).toHaveBeenCalledTimes(1);
  });

  it('bouton enregistrer desactive pendant la sauvegarde', () => {
    render(
      <BoutonSauvegarde
        aDesModifications={true}
        sauvegarde={true}
        erreur={null}
        sauvegarder={mockSauvegarder}
      />
    );

    expect(screen.getByText('Enregistrement...')).toBeInTheDocument();
    const bouton = screen.getByText('Enregistrement...').closest('button');
    expect(bouton).toBeDisabled();
  });

  it('bouton enregistrer desactive si pas de modifications', () => {
    render(
      <BoutonSauvegarde
        aDesModifications={false}
        sauvegarde={false}
        erreur="Une erreur"
        sauvegarder={mockSauvegarder}
      />
    );

    const bouton = screen.getByText('Enregistrer').closest('button');
    expect(bouton).toBeDisabled();
  });

  it('bouton annuler desactive pendant la sauvegarde', () => {
    render(
      <BoutonSauvegarde
        aDesModifications={true}
        sauvegarde={true}
        erreur={null}
        sauvegarder={mockSauvegarder}
      />
    );

    expect(screen.getByText('Annuler')).toBeDisabled();
  });
});
