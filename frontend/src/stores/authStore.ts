import { create } from 'zustand';
import type { Utilisateur } from '../types';
import { setToken, removeToken, getToken } from '../graphql/client';

interface AuthState {
  utilisateur: Utilisateur | null;
  estConnecte: boolean;
  chargement: boolean;

  // Actions
  connecter: (utilisateur: Utilisateur, token: string) => void;
  deconnecter: () => void;
  setChargement: (chargement: boolean) => void;
  setUtilisateur: (utilisateur: Utilisateur | null) => void;

  // Verification initiale
  hasToken: () => boolean;
}

export const useAuthStore = create<AuthState>((set) => ({
  utilisateur: null,
  estConnecte: false,
  chargement: true,

  connecter: (utilisateur, token) => {
    setToken(token);
    set({ utilisateur, estConnecte: true, chargement: false });
  },

  deconnecter: () => {
    removeToken();
    set({ utilisateur: null, estConnecte: false, chargement: false });
  },

  setChargement: (chargement) => set({ chargement }),

  setUtilisateur: (utilisateur) =>
    set({ utilisateur, estConnecte: !!utilisateur, chargement: false }),

  hasToken: () => !!getToken(),
}));
