import { describe, it, expect, beforeEach } from 'vitest';
import { useNotificationStore } from './notificationStore';

describe('notificationStore', () => {
  beforeEach(() => {
    useNotificationStore.setState({ panneauOuvert: false });
  });

  it('etat initial panneau ferme', () => {
    expect(useNotificationStore.getState().panneauOuvert).toBe(false);
  });

  it('ouvrirPanneau ouvre le panneau', () => {
    useNotificationStore.getState().ouvrirPanneau();
    expect(useNotificationStore.getState().panneauOuvert).toBe(true);
  });

  it('fermerPanneau ferme le panneau', () => {
    useNotificationStore.setState({ panneauOuvert: true });
    useNotificationStore.getState().fermerPanneau();
    expect(useNotificationStore.getState().panneauOuvert).toBe(false);
  });

  it('togglePanneau inverse etat', () => {
    useNotificationStore.getState().togglePanneau();
    expect(useNotificationStore.getState().panneauOuvert).toBe(true);

    useNotificationStore.getState().togglePanneau();
    expect(useNotificationStore.getState().panneauOuvert).toBe(false);
  });
});
