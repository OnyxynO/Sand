import { create } from 'zustand';

interface NotificationState {
  panneauOuvert: boolean;

  // Actions
  ouvrirPanneau: () => void;
  fermerPanneau: () => void;
  togglePanneau: () => void;
}

export const useNotificationStore = create<NotificationState>((set) => ({
  panneauOuvert: false,

  ouvrirPanneau: () => set({ panneauOuvert: true }),
  fermerPanneau: () => set({ panneauOuvert: false }),
  togglePanneau: () => set((state) => ({ panneauOuvert: !state.panneauOuvert })),
}));
