import { describe, it, expect, beforeEach, vi } from 'vitest';
import { useSaisieStore } from './saisieStore';

// Mock semaineUtils pour controler les dates
vi.mock('../utils/semaineUtils', async () => {
  const actual = await vi.importActual('../utils/semaineUtils');
  return {
    ...actual,
    getSemaineActuelle: () => '2026-W06',
  };
});

describe('saisieStore', () => {
  beforeEach(() => {
    // Reset complet du store
    useSaisieStore.setState({
      semaineISO: '2026-W06',
      jours: useSaisieStore.getState().jours,
      lignes: [],
      chargement: false,
      sauvegarde: false,
      erreur: null,
    });
  });

  describe('setSemaine', () => {
    it('change la semaine et reinitialise les lignes', () => {
      // Ajouter une ligne d abord
      useSaisieStore.getState().ajouterLigne('1', 'Projet A', 'PA', '10', 'Dev', 'Dev > Backend');
      expect(useSaisieStore.getState().lignes).toHaveLength(1);

      useSaisieStore.getState().setSemaine('2026-W07');
      expect(useSaisieStore.getState().semaineISO).toBe('2026-W07');
      expect(useSaisieStore.getState().lignes).toHaveLength(0);
    });
  });

  describe('ajouterLigne', () => {
    it('ajoute une nouvelle ligne', () => {
      useSaisieStore.getState().ajouterLigne('1', 'Projet A', 'PA', '10', 'Dev', 'Dev > Backend');

      const lignes = useSaisieStore.getState().lignes;
      expect(lignes).toHaveLength(1);
      expect(lignes[0].projetId).toBe('1');
      expect(lignes[0].activiteId).toBe('10');
      expect(lignes[0].projetNom).toBe('Projet A');
    });

    it('ignore les doublons (meme projet + activite)', () => {
      useSaisieStore.getState().ajouterLigne('1', 'Projet A', 'PA', '10', 'Dev', 'Dev > Backend');
      useSaisieStore.getState().ajouterLigne('1', 'Projet A', 'PA', '10', 'Dev', 'Dev > Backend');

      expect(useSaisieStore.getState().lignes).toHaveLength(1);
    });
  });

  describe('supprimerLigne', () => {
    it('supprime une ligne existante', () => {
      useSaisieStore.getState().ajouterLigne('1', 'Projet A', 'PA', '10', 'Dev', 'Dev > Backend');
      const ligneId = useSaisieStore.getState().lignes[0].id;

      useSaisieStore.getState().supprimerLigne(ligneId);
      expect(useSaisieStore.getState().lignes).toHaveLength(0);
    });
  });

  describe('modifierCellule', () => {
    it('met a jour la duree et marque comme modifiee', () => {
      useSaisieStore.getState().ajouterLigne('1', 'Projet A', 'PA', '10', 'Dev', 'Dev > Backend');
      const ligneId = useSaisieStore.getState().lignes[0].id;
      const dateStr = useSaisieStore.getState().jours[0].dateStr;

      useSaisieStore.getState().modifierCellule(ligneId, dateStr, 0.5);

      const cellule = useSaisieStore.getState().lignes[0].saisies[dateStr];
      expect(cellule.duree).toBe(0.5);
      expect(cellule.estModifiee).toBe(true);
    });
  });

  describe('getTotalJour', () => {
    it('additionne les durees de toutes les lignes pour un jour', () => {
      useSaisieStore.getState().ajouterLigne('1', 'Projet A', 'PA', '10', 'Dev', 'Dev > Backend');
      useSaisieStore.getState().ajouterLigne('1', 'Projet A', 'PA', '20', 'Test', 'Test > Unit');
      const dateStr = useSaisieStore.getState().jours[0].dateStr;

      const lignes = useSaisieStore.getState().lignes;
      useSaisieStore.getState().modifierCellule(lignes[0].id, dateStr, 0.5);
      useSaisieStore.getState().modifierCellule(lignes[1].id, dateStr, 0.25);

      expect(useSaisieStore.getState().getTotalJour(dateStr)).toBe(0.75);
    });
  });

  describe('getTotalLigne', () => {
    it('additionne les durees de tous les jours pour une ligne', () => {
      useSaisieStore.getState().ajouterLigne('1', 'Projet A', 'PA', '10', 'Dev', 'Dev > Backend');
      const ligneId = useSaisieStore.getState().lignes[0].id;
      const jours = useSaisieStore.getState().jours;

      useSaisieStore.getState().modifierCellule(ligneId, jours[0].dateStr, 0.5);
      useSaisieStore.getState().modifierCellule(ligneId, jours[1].dateStr, 0.25);

      expect(useSaisieStore.getState().getTotalLigne(ligneId)).toBe(0.75);
    });
  });

  describe('aDifficultes', () => {
    it('retourne false sans modifications', () => {
      useSaisieStore.getState().ajouterLigne('1', 'Projet A', 'PA', '10', 'Dev', 'Dev > Backend');
      expect(useSaisieStore.getState().aDifficultes()).toBe(false);
    });

    it('retourne true apres modification', () => {
      useSaisieStore.getState().ajouterLigne('1', 'Projet A', 'PA', '10', 'Dev', 'Dev > Backend');
      const ligneId = useSaisieStore.getState().lignes[0].id;
      const dateStr = useSaisieStore.getState().jours[0].dateStr;

      useSaisieStore.getState().modifierCellule(ligneId, dateStr, 0.5);
      expect(useSaisieStore.getState().aDifficultes()).toBe(true);
    });
  });

  describe('reinitialiserModifications', () => {
    it('remet tous les flags estModifiee a false', () => {
      useSaisieStore.getState().ajouterLigne('1', 'Projet A', 'PA', '10', 'Dev', 'Dev > Backend');
      const ligneId = useSaisieStore.getState().lignes[0].id;
      const dateStr = useSaisieStore.getState().jours[0].dateStr;

      useSaisieStore.getState().modifierCellule(ligneId, dateStr, 0.5);
      expect(useSaisieStore.getState().aDifficultes()).toBe(true);

      useSaisieStore.getState().reinitialiserModifications();
      expect(useSaisieStore.getState().aDifficultes()).toBe(false);
    });
  });

  describe('setChargement / setSauvegarde / setErreur', () => {
    it('modifie les flags de chargement', () => {
      useSaisieStore.getState().setChargement(true);
      expect(useSaisieStore.getState().chargement).toBe(true);
    });

    it('modifie les flags de sauvegarde', () => {
      useSaisieStore.getState().setSauvegarde(true);
      expect(useSaisieStore.getState().sauvegarde).toBe(true);
    });

    it('modifie le message erreur', () => {
      useSaisieStore.getState().setErreur('Erreur test');
      expect(useSaisieStore.getState().erreur).toBe('Erreur test');
    });
  });
});
