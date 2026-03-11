import { useEffect, useRef } from 'react';
import { useQuery } from '@apollo/client/react';
import { NOMBRE_NOTIFICATIONS_NON_LUES } from '../../../graphql/operations/notifications';
import { useNotificationStore } from '../../../stores/notificationStore';

interface NombreNotificationsData {
  nombreNotificationsNonLues: number;
}

export function useNotificationCount() {
  const { refreshCount } = useNotificationStore();
  const seenRefreshCount = useRef(refreshCount);

  const { data, refetch } = useQuery<NombreNotificationsData>(NOMBRE_NOTIFICATIONS_NON_LUES, {
    pollInterval: 60000,
    fetchPolicy: 'cache-and-network',
  });

  useEffect(() => {
    if (refreshCount <= seenRefreshCount.current) {
      return;
    }

    seenRefreshCount.current = refreshCount;
    refetch();
  }, [refreshCount, refetch]);

  return {
    nombreNonLues: data?.nombreNotificationsNonLues ?? 0,
  };
}
