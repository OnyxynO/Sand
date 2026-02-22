import { create } from 'zustand';

interface NotificationState {
  panneauOuvert: boolean;
  // Compteur incrémenté pour signaler à NotificationBell de refetch immédiatement
  refreshCount: number;

  // Actions
  ouvrirPanneau: () => void;
  fermerPanneau: () => void;
  togglePanneau: () => void;
  // Déclenche un refetch du compteur de notifications (ex : fin d'export)
  signalRefreshCount: () => void;
}

export const useNotificationStore = create<NotificationState>((set) => ({
  panneauOuvert: false,
  refreshCount: 0,

  ouvrirPanneau: () => set({ panneauOuvert: true }),
  fermerPanneau: () => set({ panneauOuvert: false }),
  togglePanneau: () => set((state) => ({ panneauOuvert: !state.panneauOuvert })),
  signalRefreshCount: () => set((state) => ({ refreshCount: state.refreshCount + 1 })),
}));
