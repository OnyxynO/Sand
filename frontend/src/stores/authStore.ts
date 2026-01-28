import { create } from 'zustand';

interface Utilisateur {
  id: string;
  nom: string;
  prenom: string;
  email: string;
  role: 'utilisateur' | 'moderateur' | 'admin';
}

interface AuthState {
  utilisateur: Utilisateur | null;
  estConnecte: boolean;
  chargement: boolean;
  setUtilisateur: (utilisateur: Utilisateur | null) => void;
  setChargement: (chargement: boolean) => void;
  deconnecter: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  utilisateur: null,
  estConnecte: false,
  chargement: true,
  setUtilisateur: (utilisateur) =>
    set({ utilisateur, estConnecte: !!utilisateur }),
  setChargement: (chargement) => set({ chargement }),
  deconnecter: () => set({ utilisateur: null, estConnecte: false }),
}));
