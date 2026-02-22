import { useEffect, useRef } from 'react';
import { BellIcon } from '@heroicons/react/24/outline';
import { useQuery } from '@apollo/client/react';
import { useNotificationStore } from '../../stores/notificationStore';
import { NOMBRE_NOTIFICATIONS_NON_LUES } from '../../graphql/operations/notifications';

interface NombreNotificationsData {
  nombreNotificationsNonLues: number;
}

export default function NotificationBell() {
  const { togglePanneau, refreshCount } = useNotificationStore();

  const { data, refetch } = useQuery<NombreNotificationsData>(NOMBRE_NOTIFICATIONS_NON_LUES, {
    pollInterval: 60000, // Rafraichir toutes les 60 secondes
    fetchPolicy: 'cache-and-network',
  });

  // Refetch immédiat quand un export se termine (signal depuis ExportPage via Zustand).
  // refetch() est garanti de déclencher un appel réseau sur l'ObservableQuery actif,
  // contrairement à cache.evict() ou client.query() qui ne sont pas fiables avec pollInterval.
  const seenRefreshCount = useRef(refreshCount);
  useEffect(() => {
    if (refreshCount > seenRefreshCount.current) {
      seenRefreshCount.current = refreshCount;
      refetch();
    }
  }, [refreshCount, refetch]);

  const nombreNonLues = data?.nombreNotificationsNonLues ?? 0;

  return (
    <button
      onClick={togglePanneau}
      className="relative p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
      title="Notifications"
      aria-label={`Notifications${nombreNonLues > 0 ? ` (${nombreNonLues} non lues)` : ''}`}
    >
      <BellIcon className="h-5 w-5" aria-hidden="true" />

      {nombreNonLues > 0 && (
        <span className="absolute -top-0.5 -right-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-bold text-white">
          {nombreNonLues > 99 ? '99+' : nombreNonLues}
        </span>
      )}
    </button>
  );
}
