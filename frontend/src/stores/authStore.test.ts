import { describe, it, expect, beforeEach, vi } from 'vitest';
import { useAuthStore } from './authStore';

describe('authStore', () => {
  beforeEach(() => {
    // Reset du store entre chaque test
    useAuthStore.setState({
      utilisateur: null,
      estConnecte: false,
      chargement: true,
    });
    vi.clearAllMocks();
  });

  it('etat initial', () => {
    const state = useAuthStore.getState();
    expect(state.utilisateur).toBeNull();
    expect(state.estConnecte).toBe(false);
  });

  describe('connecter', () => {
    it('met a jour utilisateur et estConnecte', () => {
      const user = { id: '1', nom: 'Dupont', prenom: 'Jean', email: 'jean@test.com' };
      useAuthStore.getState().connecter(user as any);

      const state = useAuthStore.getState();
      expect(state.utilisateur).toEqual(user);
      expect(state.estConnecte).toBe(true);
      expect(state.chargement).toBe(false);
    });
  });

  describe('deconnecter', () => {
    it('remet a zero utilisateur et estConnecte', () => {
      const user = { id: '1', nom: 'Dupont', prenom: 'Jean', email: 'jean@test.com' };
      useAuthStore.getState().connecter(user as any);
      useAuthStore.getState().deconnecter();

      const state = useAuthStore.getState();
      expect(state.utilisateur).toBeNull();
      expect(state.estConnecte).toBe(false);
      expect(state.chargement).toBe(false);
    });
  });

  describe('setChargement', () => {
    it('modifie le flag chargement', () => {
      useAuthStore.getState().setChargement(false);
      expect(useAuthStore.getState().chargement).toBe(false);

      useAuthStore.getState().setChargement(true);
      expect(useAuthStore.getState().chargement).toBe(true);
    });
  });

  describe('setUtilisateur', () => {
    it('met a jour utilisateur et estConnecte si user present', () => {
      const user = { id: '1', nom: 'Test', prenom: 'User', email: 'test@test.com' };
      useAuthStore.getState().setUtilisateur(user as any);

      const state = useAuthStore.getState();
      expect(state.utilisateur).toEqual(user);
      expect(state.estConnecte).toBe(true);
    });

    it('deconnecte si user null', () => {
      useAuthStore.getState().setUtilisateur(null);

      const state = useAuthStore.getState();
      expect(state.utilisateur).toBeNull();
      expect(state.estConnecte).toBe(false);
    });
  });
});
