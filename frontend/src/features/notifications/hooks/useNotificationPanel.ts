import { useMemo, useState } from 'react';
import { useMutation, useQuery } from '@apollo/client/react';
import type { Notification } from '../../../types';
import {
  DELETE_ALL_NOTIFICATIONS,
  DELETE_NOTIFICATION,
  MARK_ALL_NOTIFICATIONS_READ,
  MARK_NOTIFICATION_READ,
  MES_NOTIFICATIONS,
  NOMBRE_NOTIFICATIONS_NON_LUES,
} from '../../../graphql/operations/notifications';
import { useNotificationStore } from '../../../stores/notificationStore';

interface MesNotificationsData {
  mesNotifications: Notification[];
}

const NOTIFICATION_LIST_VARIABLES = { limite: 50 };

export function useNotificationPanel() {
  const { panneauOuvert, fermerPanneau } = useNotificationStore();
  const [conflitAResoudre, setConflitAResoudre] = useState<Notification | null>(null);

  const { data, loading } = useQuery<MesNotificationsData>(MES_NOTIFICATIONS, {
    variables: NOTIFICATION_LIST_VARIABLES,
    skip: !panneauOuvert,
    fetchPolicy: 'cache-and-network',
  });

  const commonRefetchQueries = useMemo(
    () => [
      { query: NOMBRE_NOTIFICATIONS_NON_LUES },
      { query: MES_NOTIFICATIONS, variables: NOTIFICATION_LIST_VARIABLES },
    ],
    []
  );

  const [markRead] = useMutation(MARK_NOTIFICATION_READ, {
    refetchQueries: [{ query: NOMBRE_NOTIFICATIONS_NON_LUES }],
  });

  const [markAllRead, { loading: markingAll }] = useMutation(MARK_ALL_NOTIFICATIONS_READ, {
    refetchQueries: commonRefetchQueries,
  });

  const [deleteNotification] = useMutation(DELETE_NOTIFICATION, {
    refetchQueries: commonRefetchQueries,
  });

  const [deleteAllNotifications, { loading: deletingAll }] = useMutation(DELETE_ALL_NOTIFICATIONS, {
    refetchQueries: commonRefetchQueries,
  });

  const notifications = data?.mesNotifications ?? [];

  return {
    panneauOuvert,
    fermerPanneau,
    loading,
    notifications,
    hasNonLues: notifications.some((notification) => !notification.estLu),
    conflitAResoudre,
    markingAll,
    deletingAll,
    marquerCommeLue: (id: string) => markRead({ variables: { id } }),
    toutMarquerCommeLu: () => markAllRead(),
    supprimerNotification: (id: string) => deleteNotification({ variables: { id } }),
    supprimerToutes: () => deleteAllNotifications(),
    ouvrirResolutionConflit: (notification: Notification) => setConflitAResoudre(notification),
    fermerResolutionConflit: () => setConflitAResoudre(null),
  };
}
