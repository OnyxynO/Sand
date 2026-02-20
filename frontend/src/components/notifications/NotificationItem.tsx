import {
  ExclamationTriangleIcon,
  CalendarDaysIcon,
  DocumentArrowDownIcon,
  InformationCircleIcon,
  ClockIcon,
  TrashIcon,
} from '@heroicons/react/24/outline';
import { formatDistanceToNow } from 'date-fns';
import { fr } from 'date-fns/locale';
import { useNavigate } from 'react-router-dom';
import { useNotificationStore } from '../../stores/notificationStore';
import type { Notification, NotificationType } from '../../types';

interface NotificationItemProps {
  notification: Notification;
  onMarkRead: (id: string) => void;
  onDelete: (id: string) => void;
  onResolveConflict: (notification: Notification) => void;
}

// Configuration des icones et couleurs par type
const typeConfig: Record<
  NotificationType,
  {
    icon: React.ComponentType<{ className?: string }>;
    couleurIcone: string;
    couleurFond: string;
  }
> = {
  conflit_absence: {
    icon: ExclamationTriangleIcon,
    couleurIcone: 'text-amber-600',
    couleurFond: 'bg-amber-50',
  },
  absence_importee: {
    icon: CalendarDaysIcon,
    couleurIcone: 'text-blue-600',
    couleurFond: 'bg-blue-50',
  },
  saisie_incomplete: {
    icon: ClockIcon,
    couleurIcone: 'text-orange-600',
    couleurFond: 'bg-orange-50',
  },
  export_pret: {
    icon: DocumentArrowDownIcon,
    couleurIcone: 'text-green-600',
    couleurFond: 'bg-green-50',
  },
  systeme: {
    icon: InformationCircleIcon,
    couleurIcone: 'text-gray-600',
    couleurFond: 'bg-gray-50',
  },
};

export default function NotificationItem({
  notification,
  onMarkRead,
  onDelete,
  onResolveConflict,
}: NotificationItemProps) {
  const config = typeConfig[notification.type] ?? typeConfig.systeme;
  const IconComponent = config.icon;
  const navigate = useNavigate();
  const { fermerPanneau } = useNotificationStore();

  const handleClick = () => {
    if (!notification.estLu) {
      onMarkRead(notification.id);
    }
    if (notification.type === 'export_pret') {
      fermerPanneau();
      navigate('/export');
    }
  };

  const handleResoudre = (e: React.MouseEvent) => {
    e.stopPropagation();
    onResolveConflict(notification);
  };

  const handleSupprimer = (e: React.MouseEvent) => {
    e.stopPropagation();
    onDelete(notification.id);
  };

  const handleTelecharger = (e: React.MouseEvent) => {
    e.stopPropagation();
    const donnees = notification.donnees as Record<string, unknown> | undefined;
    const exportId = donnees?.export_id;
    if (exportId) {
      const baseUrl = (import.meta.env.VITE_API_URL || 'http://localhost:8080/graphql').replace('/graphql', '');
      window.open(`${baseUrl}/exports/${exportId}/download`, '_blank');
    }
  };

  const dateRelative = formatDistanceToNow(new Date(notification.createdAt), {
    addSuffix: true,
    locale: fr,
  });

  return (
    <div
      onClick={handleClick}
      className={`flex gap-3 p-4 cursor-pointer transition-colors hover:bg-gray-50 ${
        !notification.estLu ? 'bg-blue-50/50' : ''
      }`}
    >
      {/* Icone */}
      <div
        className={`flex-shrink-0 h-10 w-10 rounded-full flex items-center justify-center ${config.couleurFond}`}
      >
        <IconComponent className={`h-5 w-5 ${config.couleurIcone}`} />
      </div>

      {/* Contenu */}
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <p
            className={`text-sm font-medium text-gray-900 ${
              !notification.estLu ? 'font-semibold' : ''
            }`}
          >
            {notification.titre}
          </p>
          {!notification.estLu && (
            <span className="flex-shrink-0 h-2 w-2 rounded-full bg-blue-600" />
          )}
        </div>

        <p className="mt-1 text-sm text-gray-600 line-clamp-2">{notification.message}</p>

        <div className="mt-2 flex items-center justify-between gap-2">
          <span className="text-xs text-gray-500">{dateRelative}</span>

          <div className="flex items-center gap-2">
            {notification.type === 'conflit_absence' && !notification.estLu && (
              <button
                onClick={handleResoudre}
                className="text-xs font-medium text-blue-600 hover:text-blue-800 transition-colors"
              >
                Resoudre
              </button>
            )}

            {notification.type === 'export_pret' && (notification.donnees as Record<string, unknown>)?.export_id && (
              <button
                onClick={handleTelecharger}
                className="text-xs font-medium text-green-600 hover:text-green-800 transition-colors"
              >
                Telecharger
              </button>
            )}

            {notification.estLu && (
              <button
                onClick={handleSupprimer}
                className="p-1 text-gray-400 hover:text-red-500 transition-colors rounded"
                title="Supprimer"
              >
                <TrashIcon className="h-3.5 w-3.5" />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
