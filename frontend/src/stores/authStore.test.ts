import { describe, it, expect, beforeEach, vi } from 'vitest';
import { useAuthStore } from './authStore';

// Mock du client GraphQL
vi.mock('../graphql/client', () => ({
  setToken: vi.fn(),
  removeToken: vi.fn(),
  getToken: vi.fn(() => null),
}));

import { setToken, removeToken, getToken } from '../graphql/client';

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
      useAuthStore.getState().connecter(user as any, 'token123');

      const state = useAuthStore.getState();
      expect(state.utilisateur).toEqual(user);
      expect(state.estConnecte).toBe(true);
      expect(state.chargement).toBe(false);
      expect(setToken).toHaveBeenCalledWith('token123');
    });
  });

  describe('deconnecter', () => {
    it('remet a zero utilisateur et estConnecte', () => {
      const user = { id: '1', nom: 'Dupont', prenom: 'Jean', email: 'jean@test.com' };
      useAuthStore.getState().connecter(user as any, 'token123');
      useAuthStore.getState().deconnecter();

      const state = useAuthStore.getState();
      expect(state.utilisateur).toBeNull();
      expect(state.estConnecte).toBe(false);
      expect(state.chargement).toBe(false);
      expect(removeToken).toHaveBeenCalled();
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

  describe('hasToken', () => {
    it('retourne false si pas de token', () => {
      expect(useAuthStore.getState().hasToken()).toBe(false);
    });

    it('retourne true si token present', () => {
      vi.mocked(getToken).mockReturnValue('token123');
      expect(useAuthStore.getState().hasToken()).toBe(true);
    });
  });
});
