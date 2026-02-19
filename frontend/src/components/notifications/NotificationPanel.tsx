import { Fragment, useState } from 'react';
import {
  Dialog,
  DialogPanel,
  DialogTitle,
  Transition,
  TransitionChild,
} from '@headlessui/react';
import { XMarkIcon, BellSlashIcon } from '@heroicons/react/24/outline';
import { useQuery, useMutation } from '@apollo/client/react';
import { useNotificationStore } from '../../stores/notificationStore';
import {
  MES_NOTIFICATIONS,
  NOMBRE_NOTIFICATIONS_NON_LUES,
  MARK_NOTIFICATION_READ,
  MARK_ALL_NOTIFICATIONS_READ,
  DELETE_NOTIFICATION,
} from '../../graphql/operations/notifications';
import NotificationItem from './NotificationItem';
import ConflitResolutionModal from './ConflitResolutionModal';
import type { Notification } from '../../types';

interface MesNotificationsData {
  mesNotifications: Notification[];
}

export default function NotificationPanel() {
  const { panneauOuvert, fermerPanneau } = useNotificationStore();
  const [conflitAResoudre, setConflitAResoudre] = useState<Notification | null>(null);

  const { data, loading } = useQuery<MesNotificationsData>(MES_NOTIFICATIONS, {
    variables: { limite: 50 },
    skip: !panneauOuvert,
    fetchPolicy: 'cache-and-network',
  });

  const [markRead] = useMutation(MARK_NOTIFICATION_READ, {
    refetchQueries: [{ query: NOMBRE_NOTIFICATIONS_NON_LUES }],
  });

  const [markAllRead, { loading: markingAll }] = useMutation(MARK_ALL_NOTIFICATIONS_READ, {
    refetchQueries: [
      { query: NOMBRE_NOTIFICATIONS_NON_LUES },
      { query: MES_NOTIFICATIONS, variables: { limite: 50 } },
    ],
  });

  const [deleteNotification] = useMutation(DELETE_NOTIFICATION, {
    refetchQueries: [
      { query: NOMBRE_NOTIFICATIONS_NON_LUES },
      { query: MES_NOTIFICATIONS, variables: { limite: 50 } },
    ],
  });

  const notifications: Notification[] = data?.mesNotifications ?? [];
  const hasNonLues = notifications.some((n) => !n.estLu);

  const handleMarkRead = (id: string) => {
    markRead({ variables: { id } });
  };

  const handleMarkAllRead = () => {
    markAllRead();
  };

  const handleDelete = (id: string) => {
    deleteNotification({ variables: { id } });
  };

  const handleResolveConflict = (notification: Notification) => {
    setConflitAResoudre(notification);
  };

  const handleFermerModalConflit = () => {
    setConflitAResoudre(null);
  };

  return (
    <>
      <Transition show={panneauOuvert} as={Fragment}>
        <Dialog onClose={fermerPanneau} className="relative z-40">
          {/* Overlay */}
          <TransitionChild
            as={Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <div className="fixed inset-0 bg-black/20" />
          </TransitionChild>

          {/* Panneau slide-over */}
          <div className="fixed inset-0 overflow-hidden">
            <div className="absolute inset-0 overflow-hidden">
              <div className="pointer-events-none fixed inset-y-0 right-0 flex max-w-full pl-10 sm:pl-16">
                <TransitionChild
                  as={Fragment}
                  enter="transform transition ease-in-out duration-300"
                  enterFrom="translate-x-full"
                  enterTo="translate-x-0"
                  leave="transform transition ease-in-out duration-200"
                  leaveFrom="translate-x-0"
                  leaveTo="translate-x-full"
                >
                  <DialogPanel className="pointer-events-auto w-screen max-w-md">
                    <div className="flex h-full flex-col bg-white shadow-xl">
                      {/* Header */}
                      <div className="flex items-center justify-between border-b border-gray-200 px-4 py-4 sm:px-6">
                        <DialogTitle className="text-lg font-semibold text-gray-900">
                          Notifications
                        </DialogTitle>
                        <div className="flex items-center gap-2">
                          {hasNonLues && (
                            <button
                              onClick={handleMarkAllRead}
                              disabled={markingAll}
                              className="text-sm text-blue-600 hover:text-blue-800 font-medium disabled:opacity-50 transition-colors"
                            >
                              Tout marquer lu
                            </button>
                          )}
                          <button
                            onClick={fermerPanneau}
                            className="p-1.5 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100 transition-colors focus-visible:ring-2 focus-visible:ring-blue-500"
                            aria-label="Fermer le panneau de notifications"
                          >
                            <XMarkIcon className="h-5 w-5" aria-hidden="true" />
                          </button>
                        </div>
                      </div>

                      {/* Liste des notifications */}
                      <div className="flex-1 overflow-y-auto overscroll-contain">
                        {loading ? (
                          <div className="flex items-center justify-center h-32">
                            <div className="animate-spin rounded-full h-6 w-6 border-2 border-blue-600 border-t-transparent" />
                          </div>
                        ) : notifications.length === 0 ? (
                          <div className="flex flex-col items-center justify-center h-64 text-center px-6">
                            <div className="h-16 w-16 rounded-full bg-gray-100 flex items-center justify-center mb-4">
                              <BellSlashIcon className="h-8 w-8 text-gray-400" />
                            </div>
                            <p className="text-gray-900 font-medium">Aucune notification</p>
                            <p className="text-sm text-gray-500 mt-1">
                              Vous n'avez pas de notification pour le moment.
                            </p>
                          </div>
                        ) : (
                          <div className="divide-y divide-gray-100">
                            {notifications.map((notification) => (
                              <NotificationItem
                                key={notification.id}
                                notification={notification}
                                onMarkRead={handleMarkRead}
                                onDelete={handleDelete}
                                onResolveConflict={handleResolveConflict}
                              />
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  </DialogPanel>
                </TransitionChild>
              </div>
            </div>
          </div>
        </Dialog>
      </Transition>

      {/* Modal resolution conflit */}
      <ConflitResolutionModal
        notification={conflitAResoudre}
        ouvert={conflitAResoudre !== null}
        onFermer={handleFermerModalConflit}
      />
    </>
  );
}
