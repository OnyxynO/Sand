import { useState, Fragment, useMemo } from 'react';
import { useQuery, useMutation } from '@apollo/client/react';
import { Dialog, Transition } from '@headlessui/react';
import { XMarkIcon } from '@heroicons/react/24/outline';
import { ADD_PROJECT_MODERATOR, REMOVE_PROJECT_MODERATOR } from '../../graphql/operations/projects';
import { USERS_QUERY } from '../../graphql/operations/users';
import type { Utilisateur, Projet } from './types';

interface UsersData {
  users: {
    data: Utilisateur[];
  };
}

export default function GestionModerateursModal({
  ouvert,
  onFermer,
  projet,
  onSuccess,
}: {
  ouvert: boolean;
  onFermer: () => void;
  projet: Projet | null;
  onSuccess: () => void;
}) {
  const [recherche, setRecherche] = useState('');
  const [erreur, setErreur] = useState('');

  const { data: dataUsers, loading: loadingUsers } = useQuery<UsersData>(USERS_QUERY, {
    variables: { actifSeulement: true },
    skip: !ouvert,
  });

  const [addModerator, { loading: ajoutEnCours }] = useMutation(ADD_PROJECT_MODERATOR);
  const [removeModerator, { loading: retraitEnCours }] = useMutation(REMOVE_PROJECT_MODERATOR);

  const moderateursActuels = projet?.moderateurs || [];
  const moderateurIds = new Set(moderateursActuels.map((m) => m.id));

  const utilisateursDisponibles = useMemo(() => {
    const users = dataUsers?.users?.data || [];
    return users.filter((u) => {
      if (u.role === 'ADMIN') return false;
      if (moderateurIds.has(u.id)) return false;
      if (recherche) {
        const search = recherche.toLowerCase();
        return u.nomComplet.toLowerCase().includes(search) || u.email.toLowerCase().includes(search);
      }
      return true;
    });
  }, [dataUsers, moderateurIds, recherche]);

  const handleAjouter = async (userId: string) => {
    if (!projet) return;
    setErreur('');
    try {
      await addModerator({ variables: { projetId: projet.id, userId } });
      onSuccess();
    } catch (err) {
      setErreur(err instanceof Error ? err.message : 'Erreur lors de l\'ajout');
    }
  };

  const handleRetirer = async (userId: string) => {
    if (!projet) return;
    setErreur('');
    try {
      await removeModerator({ variables: { projetId: projet.id, userId } });
      onSuccess();
    } catch (err) {
      setErreur(err instanceof Error ? err.message : 'Erreur lors du retrait');
    }
  };

  const loading = ajoutEnCours || retraitEnCours;

  return (
    <Transition appear show={ouvert} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={onFermer}>
        <Transition.Child as={Fragment} enter="ease-out duration-200" enterFrom="opacity-0" enterTo="opacity-100" leave="ease-in duration-150" leaveFrom="opacity-100" leaveTo="opacity-0">
          <div className="fixed inset-0 bg-black/30" />
        </Transition.Child>
        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4">
            <Transition.Child as={Fragment} enter="ease-out duration-200" enterFrom="opacity-0 scale-95" enterTo="opacity-100 scale-100" leave="ease-in duration-150" leaveFrom="opacity-100 scale-100" leaveTo="opacity-0 scale-95">
              <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-xl bg-white shadow-xl">
                <div className="flex items-center justify-between border-b px-4 py-3">
                  <Dialog.Title className="text-lg font-semibold">
                    Moderateurs de {projet?.nom}
                  </Dialog.Title>
                  <button onClick={onFermer} className="p-1 rounded hover:bg-gray-100">
                    <XMarkIcon className="w-5 h-5 text-gray-500" />
                  </button>
                </div>

                <div className="px-4 py-3 border-b">
                  <h4 className="text-sm font-medium text-gray-700 mb-2">
                    Moderateurs actuels ({moderateursActuels.length})
                  </h4>
                  {moderateursActuels.length === 0 ? (
                    <p className="text-sm text-gray-500">Aucun moderateur assigne</p>
                  ) : (
                    <div className="space-y-2">
                      {moderateursActuels.map((mod) => (
                        <div key={mod.id} className="flex items-center justify-between bg-blue-50 rounded-lg px-3 py-2">
                          <span className="text-sm text-gray-900">{mod.nomComplet}</span>
                          <button
                            onClick={() => handleRetirer(mod.id)}
                            disabled={loading}
                            className="text-xs text-red-600 hover:text-red-800 font-medium disabled:opacity-50"
                          >
                            Retirer
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div className="px-4 py-3">
                  <h4 className="text-sm font-medium text-gray-700 mb-2">Ajouter un moderateur</h4>
                  <input
                    type="text"
                    placeholder="Rechercher un utilisateur..."
                    value={recherche}
                    onChange={(e) => setRecherche(e.target.value)}
                    className="w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-blue-500 mb-2"
                  />
                  <div className="max-h-48 overflow-y-auto space-y-1">
                    {loadingUsers ? (
                      <p className="text-sm text-gray-500 py-2">Chargement...</p>
                    ) : utilisateursDisponibles.length === 0 ? (
                      <p className="text-sm text-gray-500 py-2">
                        {recherche ? 'Aucun utilisateur trouve' : 'Tous les utilisateurs sont deja moderateurs'}
                      </p>
                    ) : (
                      utilisateursDisponibles.slice(0, 10).map((user) => (
                        <div key={user.id} className="flex items-center justify-between hover:bg-gray-50 rounded-lg px-3 py-2">
                          <div>
                            <span className="text-sm text-gray-900">{user.nomComplet}</span>
                            <span className="text-xs text-gray-500 ml-2">{user.email}</span>
                          </div>
                          <button
                            onClick={() => handleAjouter(user.id)}
                            disabled={loading}
                            className="text-xs text-blue-600 hover:text-blue-800 font-medium disabled:opacity-50"
                          >
                            Ajouter
                          </button>
                        </div>
                      ))
                    )}
                    {utilisateursDisponibles.length > 10 && (
                      <p className="text-xs text-gray-500 py-1 text-center">
                        +{utilisateursDisponibles.length - 10} autres (affinez la recherche)
                      </p>
                    )}
                  </div>
                </div>

                {erreur && (
                  <div className="mx-4 mb-2 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
                    {erreur}
                  </div>
                )}
                <div className="flex justify-end px-4 py-3 border-t">
                  <button onClick={onFermer} className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border rounded-lg hover:bg-gray-50">
                    Fermer
                  </button>
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
}
