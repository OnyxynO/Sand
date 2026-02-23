import { Fragment, useState } from 'react';
import {
  Dialog,
  DialogPanel,
  DialogTitle,
  Transition,
  TransitionChild,
} from '@headlessui/react';
import { ExclamationTriangleIcon, XMarkIcon } from '@heroicons/react/24/outline';
import { useMutation } from '@apollo/client/react';
import { RESOLVE_ABSENCE_CONFLICT, NOMBRE_NOTIFICATIONS_NON_LUES, MES_NOTIFICATIONS } from '../../graphql/operations/notifications';
import type { Notification, ConflitAbsenceDonnees, ConflictResolution } from '../../types';

interface ConflitResolutionModalProps {
  notification: Notification | null;
  ouvert: boolean;
  onFermer: () => void;
}

export default function ConflitResolutionModal({
  notification,
  ouvert,
  onFermer,
}: ConflitResolutionModalProps) {
  const [confirmationAction, setConfirmationAction] = useState<ConflictResolution | null>(null);
  const [erreur, setErreur] = useState('');

  const [resolveConflict, { loading }] = useMutation(RESOLVE_ABSENCE_CONFLICT, {
    refetchQueries: [
      { query: NOMBRE_NOTIFICATIONS_NON_LUES },
      { query: MES_NOTIFICATIONS, variables: { limite: 50 } },
    ],
    onCompleted: () => {
      setConfirmationAction(null);
      setErreur('');
      onFermer();
    },
    onError: (error) => {
      setErreur(error.message);
      setConfirmationAction(null);
    },
  });

  if (!notification) return null;

  const donnees = notification.donnees as ConflitAbsenceDonnees | undefined;
  const absenceId = donnees?.absence_id;
  const nombreSaisies = donnees?.saisie_ids?.length ?? 0;

  const handleResoudre = (resolution: ConflictResolution) => {
    if (!absenceId) return;

    // Action destructive = demander confirmation
    if (resolution === 'ECRASER' && !confirmationAction) {
      setConfirmationAction('ECRASER');
      return;
    }

    resolveConflict({
      variables: {
        absenceId: String(absenceId),
        resolution,
      },
    });
  };

  const handleAnnulerConfirmation = () => {
    setConfirmationAction(null);
  };

  return (
    <Transition show={ouvert} as={Fragment}>
      <Dialog onClose={onFermer} className="relative z-50">
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
          <div className="fixed inset-0 bg-black/30" />
        </TransitionChild>

        {/* Contenu modale */}
        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4">
            <TransitionChild
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <DialogPanel className="w-full max-w-md transform rounded-xl bg-white p-6 shadow-xl transition-all">
                {/* Header */}
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0 h-12 w-12 rounded-full bg-amber-100 flex items-center justify-center">
                    <ExclamationTriangleIcon className="h-6 w-6 text-amber-600" />
                  </div>
                  <div className="flex-1">
                    <DialogTitle className="text-lg font-semibold text-gray-900">
                      Resoudre le conflit
                    </DialogTitle>
                    <button
                      onClick={onFermer}
                      className="absolute top-4 right-4 p-1 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100"
                    >
                      <XMarkIcon className="h-5 w-5" />
                    </button>
                  </div>
                </div>

                {/* Corps */}
                <div className="mt-4">
                  <p className="text-sm text-gray-600">{notification.message}</p>

                  <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                    <p className="text-sm text-gray-700">
                      <span className="font-medium">{nombreSaisies}</span> saisie(s) existante(s)
                      sont en conflit avec cette absence.
                    </p>
                  </div>

                  {/* Erreur */}
                  {erreur && (
                    <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
                      {erreur}
                    </div>
                  )}

                  {/* Zone confirmation si action destructive */}
                  {confirmationAction === 'ECRASER' && (
                    <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                      <p className="text-sm text-red-800 font-medium">
                        Confirmer la suppression de {nombreSaisies} saisie(s) ?
                      </p>
                      <p className="mt-1 text-xs text-red-600">
                        Cette action est irreversible.
                      </p>
                    </div>
                  )}
                </div>

                {/* Actions */}
                <div className="mt-6 flex flex-col gap-3">
                  {confirmationAction === 'ECRASER' ? (
                    <>
                      <button
                        onClick={() => handleResoudre('ECRASER')}
                        disabled={loading}
                        className="w-full px-4 py-2.5 bg-red-600 text-white font-medium rounded-lg hover:bg-red-700 disabled:opacity-50 transition-colors"
                      >
                        {loading ? 'Suppression...' : 'Confirmer la suppression'}
                      </button>
                      <button
                        onClick={handleAnnulerConfirmation}
                        disabled={loading}
                        className="w-full px-4 py-2.5 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 disabled:opacity-50 transition-colors"
                      >
                        Annuler
                      </button>
                    </>
                  ) : (
                    <>
                      <button
                        onClick={() => handleResoudre('IGNORER')}
                        disabled={loading}
                        className="w-full px-4 py-2.5 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
                      >
                        Garder mes saisies
                        <span className="block text-xs font-normal opacity-80">
                          L'absence sera annulee
                        </span>
                      </button>
                      <button
                        onClick={() => handleResoudre('ECRASER')}
                        disabled={loading}
                        className="w-full px-4 py-2.5 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 disabled:opacity-50 transition-colors"
                      >
                        Garder l'absence
                        <span className="block text-xs font-normal text-gray-500">
                          Mes {nombreSaisies} saisie(s) seront supprimees
                        </span>
                      </button>
                    </>
                  )}
                </div>
              </DialogPanel>
            </TransitionChild>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
}
