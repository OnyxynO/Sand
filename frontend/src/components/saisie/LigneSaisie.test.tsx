// Tests pour le composant LigneSaisie — U-V03, U-V04

import { render, screen, fireEvent } from '@testing-library/react';
import { vi } from 'vitest';
import LigneSaisie from './LigneSaisie';
import type { LigneSaisie as LigneSaisieType, JourSemaine } from '../../types';

vi.mock('../../stores/saisieStore', () => ({
  useSaisieStore: vi.fn(),
}));

vi.mock('../../utils/semaineUtils', () => ({
  formatDuree: (duree: number | null | undefined) => {
    if (duree === null || duree === undefined || duree === 0) return '';
    return parseFloat(duree.toFixed(2)).toString();
  },
  parseDuree: (valeur: string) => {
    if (!valeur || valeur.trim() === '') return null;
    const normalise = valeur.replace(',', '.').trim();
    const nombre = parseFloat(normalise);
    if (isNaN(nombre) || nombre < 0.01 || nombre > 1) return null;
    return Math.round(nombre * 100) / 100;
  },
}));

vi.mock('@heroicons/react/24/outline', () => ({
  TrashIcon: () => <span aria-hidden="true">trash</span>,
  ClockIcon: () => <span aria-hidden="true">clock</span>,
}));

import { useSaisieStore } from '../../stores/saisieStore';

const jourTest: JourSemaine = {
  date: new Date('2026-02-09'),
  dateStr: '2026-02-09',
  jourNom: 'lun',
  jourComplet: 'Lundi',
  estAujourdhui: false,
  estFutur: false,
};

const ligneTest: LigneSaisieType = {
  id: 'ligne-test-1',
  projetId: '1',
  projetNom: 'Projet Alpha',
  projetCode: 'PA',
  activiteId: '10',
  activiteNom: 'Developpement',
  activiteChemin: 'Dev > Backend',
  saisies: {
    '2026-02-09': { duree: null, estModifiee: false },
  },
  estNouvelle: false,
};

describe('LigneSaisie', () => {
  const mockModifierCellule = vi.fn();

  function mockStore() {
    vi.mocked(useSaisieStore).mockReturnValue({
      semaineISO: '2026-W07',
      lignes: [],
      jours: [jourTest],
      chargement: false,
      sauvegarde: false,
      erreur: null,
      modifierCellule: mockModifierCellule,
      supprimerLigne: vi.fn(),
      ajouterLigne: vi.fn(),
      chargerSaisies: vi.fn(),
      reinitialiserModifications: vi.fn(),
      setSemaine: vi.fn(),
      allerSemainePrecedente: vi.fn(),
      allerSemaineSuivante: vi.fn(),
      allerSemaineActuelle: vi.fn(),
      setChargement: vi.fn(),
      setSauvegarde: vi.fn(),
      setErreur: vi.fn(),
      aDifficultes: vi.fn().mockReturnValue(false),
      getTotalJour: vi.fn().mockReturnValue(0),
      getTotalLigne: vi.fn().mockReturnValue(0),
      getModifications: vi.fn().mockReturnValue({ nouvelles: [], modifiees: [], supprimees: [] }),
    } as never);
  }

  function renderLigneSaisie() {
    return render(
      <table>
        <tbody>
          <LigneSaisie ligne={ligneTest} jours={[jourTest]} indexLigne={0} />
        </tbody>
      </table>
    );
  }

  beforeEach(() => {
    vi.clearAllMocks();
    mockStore();
  });

  // U-V03 : saisie valeur 0.5 → modifierCellule appelé dans le store
  it('saisie de 0.5 appelle modifierCellule avec la valeur parsée', () => {
    renderLigneSaisie();

    fireEvent.click(screen.getByRole('button', { name: 'Saisir pour Lundi' }));

    const input = screen.getByRole('textbox');
    fireEvent.change(input, { target: { value: '0.5' } });
    fireEvent.blur(input);

    expect(mockModifierCellule).toHaveBeenCalledOnce();
    expect(mockModifierCellule).toHaveBeenCalledWith('ligne-test-1', '2026-02-09', 0.5);
  });

  // U-V04 : valeur > 1 → rejetée (modifierCellule non appelé)
  it('saisie de 1.5 ne appelle pas modifierCellule (valeur invalide)', () => {
    renderLigneSaisie();

    fireEvent.click(screen.getByRole('button', { name: 'Saisir pour Lundi' }));

    const input = screen.getByRole('textbox');
    fireEvent.change(input, { target: { value: '1.5' } });
    fireEvent.blur(input);

    expect(mockModifierCellule).not.toHaveBeenCalled();
  });
});
