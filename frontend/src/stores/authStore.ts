import { create } from 'zustand';
import * as Sentry from '@sentry/react';
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
    Sentry.setUser({ id: utilisateur.id, email: utilisateur.email, username: `${utilisateur.prenom} ${utilisateur.nom}` });
    set({ utilisateur, estConnecte: true, chargement: false });
  },

  deconnecter: () => {
    Sentry.setUser(null);
    set({ utilisateur: null, estConnecte: false, chargement: false });
  },

  setChargement: (chargement) => set({ chargement }),

  setUtilisateur: (utilisateur) => {
    if (utilisateur) {
      Sentry.setUser({ id: utilisateur.id, email: utilisateur.email, username: `${utilisateur.prenom} ${utilisateur.nom}` });
    } else {
      Sentry.setUser(null);
    }
    set({ utilisateur, estConnecte: !!utilisateur, chargement: false });
  },
}));
