import { create } from 'zustand';
import type { Utilisateur } from '../types';

interface AuthState {
  utilisateur: Utilisateur | null;
  estConnecte: boolean;
  chargement: boolean;

  // Actions
  connecter: (utilisateur: Utilisateur) => void;
  deconnecter: () => void;
  setChargement: (chargement: boolean) => void;
  setUtilisateur: (utilisateur: Utilisateur | null) => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  utilisateur: null,
  estConnecte: false,
  chargement: true,

  connecter: (utilisateur) => {
    set({ utilisateur, estConnecte: true, chargement: false });
  },

  deconnecter: () => {
    set({ utilisateur: null, estConnecte: false, chargement: false });
  },

  setChargement: (chargement) => set({ chargement }),

  setUtilisateur: (utilisateur) =>
    set({ utilisateur, estConnecte: !!utilisateur, chargement: false }),
}));
