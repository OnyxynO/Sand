import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import NotificationPanel from './NotificationPanel';
import {
  MES_NOTIFICATIONS,
  NOMBRE_NOTIFICATIONS_NON_LUES,
  DELETE_ALL_NOTIFICATIONS,
  MARK_ALL_NOTIFICATIONS_READ,
  MARK_NOTIFICATION_READ,
  DELETE_NOTIFICATION,
} from '../../graphql/operations/notifications';

vi.mock('@heroicons/react/24/outline', () => ({
  XMarkIcon: () => <span data-testid="icon-x" />,
  BellSlashIcon: () => <span data-testid="icon-bell-slash" />,
}));

// Panneau toujours ouvert dans les tests
vi.mock('../../stores/notificationStore', () => ({
  useNotificationStore: () => ({
    panneauOuvert: true,
    fermerPanneau: vi.fn(),
  }),
}));

vi.mock('./NotificationItem', () => ({
  default: ({ notification }: { notification: { id: string; titre: string } }) => (
    <div data-testid={`notification-${notification.id}`}>{notification.titre}</div>
  ),
}));

vi.mock('./ConflitResolutionModal', () => ({
  default: () => null,
}));

const mockUseQuery = vi.fn();
const mockUseMutation = vi.fn();

vi.mock('@apollo/client/react', () => ({
  useQuery: (...args: unknown[]) => mockUseQuery(...args),
  useMutation: (...args: unknown[]) => mockUseMutation(...args),
}));

const notificationsToutes = [
  { id: '1', type: 'systeme', titre: 'Notif lue', message: 'msg', estLu: true, createdAt: new Date().toISOString() },
  { id: '2', type: 'systeme', titre: 'Notif lue 2', message: 'msg', estLu: true, createdAt: new Date().toISOString() },
];

const notificationsAvecNonLues = [
  { id: '1', type: 'systeme', titre: 'Notif non lue', message: 'msg', estLu: false, createdAt: new Date().toISOString() },
  { id: '2', type: 'systeme', titre: 'Notif lue', message: 'msg', estLu: true, createdAt: new Date().toISOString() },
];

function configurerMocks(notifications: unknown[] = []) {
  mockUseQuery.mockImplementation((query: unknown) => {
    if (query === MES_NOTIFICATIONS) return { data: { mesNotifications: notifications }, loading: false };
    if (query === NOMBRE_NOTIFICATIONS_NON_LUES) return { data: { nombreNotificationsNonLues: 0 }, loading: false };
    return { data: undefined, loading: false };
  });
  mockUseMutation.mockReturnValue([vi.fn(), { loading: false }]);
}

describe('NotificationPanel', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('affiche l\'état vide quand aucune notification', () => {
    configurerMocks([]);
    render(<NotificationPanel />);

    expect(screen.getByText('Aucune notification')).toBeInTheDocument();
  });

  it('affiche les notifications présentes', () => {
    configurerMocks(notificationsToutes);
    render(<NotificationPanel />);

    expect(screen.getByText('Notif lue')).toBeInTheDocument();
    expect(screen.getByText('Notif lue 2')).toBeInTheDocument();
  });

  // ─── EV-10 : bouton Supprimer tout ─────────────────────────────────────────

  it('bouton Supprimer tout absent quand liste vide', () => {
    configurerMocks([]);
    render(<NotificationPanel />);

    expect(screen.queryByText('Supprimer tout')).not.toBeInTheDocument();
  });

  it('bouton Supprimer tout visible quand des notifications existent', () => {
    configurerMocks(notificationsToutes);
    render(<NotificationPanel />);

    expect(screen.getByText('Supprimer tout')).toBeInTheDocument();
  });

  it('bouton Tout marquer lu visible quand des notifications sont non lues', () => {
    configurerMocks(notificationsAvecNonLues);
    render(<NotificationPanel />);

    expect(screen.getByText('Tout marquer lu')).toBeInTheDocument();
  });

  it('bouton Tout marquer lu absent quand toutes les notifications sont lues', () => {
    configurerMocks(notificationsToutes);
    render(<NotificationPanel />);

    expect(screen.queryByText('Tout marquer lu')).not.toBeInTheDocument();
  });

  it('clic sur Supprimer tout appelle la mutation deleteAllNotifications', () => {
    const mockDeleteAll = vi.fn().mockResolvedValue({ data: { deleteAllNotifications: true } });

    mockUseQuery.mockImplementation((query: unknown) => {
      if (query === MES_NOTIFICATIONS) return { data: { mesNotifications: notificationsToutes }, loading: false };
      if (query === NOMBRE_NOTIFICATIONS_NON_LUES) return { data: { nombreNotificationsNonLues: 0 }, loading: false };
      return { data: undefined, loading: false };
    });

    mockUseMutation.mockImplementation((mutation: unknown) => {
      if (mutation === DELETE_ALL_NOTIFICATIONS) return [mockDeleteAll, { loading: false }];
      if (mutation === MARK_ALL_NOTIFICATIONS_READ) return [vi.fn(), { loading: false }];
      if (mutation === MARK_NOTIFICATION_READ) return [vi.fn(), { loading: false }];
      if (mutation === DELETE_NOTIFICATION) return [vi.fn(), { loading: false }];
      return [vi.fn(), { loading: false }];
    });

    render(<NotificationPanel />);

    fireEvent.click(screen.getByText('Supprimer tout'));

    expect(mockDeleteAll).toHaveBeenCalledTimes(1);
  });
});
