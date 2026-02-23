import { useState, Fragment, useMemo } from 'react';
import { useQuery, useMutation } from '@apollo/client/react';
import { Dialog, Transition } from '@headlessui/react';
import { XMarkIcon, EyeSlashIcon } from '@heroicons/react/24/outline';
import { ARBRE_ACTIVITES } from '../../graphql/operations/activities';
import { USERS_QUERY } from '../../graphql/operations/users';
import {
  RESTRICTIONS_VISIBILITE_QUERY,
  HIDE_ACTIVITY_FOR_USER,
  SHOW_ACTIVITY_FOR_USER,
} from '../../graphql/operations/visibility';
import type { Activite, Utilisateur, Projet, RestrictionVisibilite } from './types';

interface RestrictionsData {
  restrictionsVisibilite: RestrictionVisibilite[];
}

interface UsersData {
  users: {
    data: Utilisateur[];
  };
}

export default function GestionVisibilitesModal({
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
  const [selectedUserId, setSelectedUserId] = useState<string>('');
  const [selectedActivityId, setSelectedActivityId] = useState<string>('');
  const [erreur, setErreur] = useState('');

  const { data: dataRestrictions, loading: loadingRestrictions, refetch } = useQuery<RestrictionsData>(
    RESTRICTIONS_VISIBILITE_QUERY,
    {
      variables: { projetId: projet?.id },
      skip: !ouvert || !projet?.id,
      fetchPolicy: 'network-only',
    }
  );

  const { data: dataUsers } = useQuery<UsersData>(USERS_QUERY, {
    variables: { actifSeulement: true },
    skip: !ouvert,
  });

  const { data: dataActivites } = useQuery<{ arbreActivites: Activite[] }>(ARBRE_ACTIVITES, {
    skip: !ouvert,
  });

  const [hideActivity, { loading: hidingActivity }] = useMutation(HIDE_ACTIVITY_FOR_USER);
  const [showActivity, { loading: showingActivity }] = useMutation(SHOW_ACTIVITY_FOR_USER);

  const restrictions = dataRestrictions?.restrictionsVisibilite || [];
  const utilisateurs = dataUsers?.users?.data?.filter((u) => u.role !== 'ADMIN') || [];

  const collecterFeuilles = (activites: Activite[]): { id: string; nom: string; chemin: string }[] => {
    return activites.flatMap((a) => {
      if (a.estFeuille && a.estActif) {
        return [{ id: a.id, nom: a.nom, chemin: a.chemin }];
      }
      if (a.enfants) {
        return collecterFeuilles(a.enfants);
      }
      return [];
    });
  };

  const activitesFeuilles = useMemo(
    () => collecterFeuilles(dataActivites?.arbreActivites || []),
    [dataActivites]
  );

  const handleAjouterRestriction = async () => {
    if (!projet || !selectedUserId || !selectedActivityId) return;

    setErreur('');
    try {
      await hideActivity({
        variables: {
          projetId: projet.id,
          activiteId: selectedActivityId,
          userId: selectedUserId,
        },
      });
      setSelectedUserId('');
      setSelectedActivityId('');
      refetch();
      onSuccess();
    } catch (err) {
      setErreur(err instanceof Error ? err.message : 'Erreur lors de l\'ajout de la restriction');
    }
  };

  const handleSupprimerRestriction = async (restriction: RestrictionVisibilite) => {
    if (!projet) return;

    setErreur('');
    try {
      await showActivity({
        variables: {
          projetId: projet.id,
          activiteId: restriction.activite.id,
          userId: restriction.utilisateur.id,
        },
      });
      refetch();
      onSuccess();
    } catch (err) {
      setErreur(err instanceof Error ? err.message : 'Erreur lors de la suppression de la restriction');
    }
  };

  const loading = hidingActivity || showingActivity;

  return (
    <Transition appear show={ouvert} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={onFermer}>
        <Transition.Child as={Fragment} enter="ease-out duration-200" enterFrom="opacity-0" enterTo="opacity-100" leave="ease-in duration-150" leaveFrom="opacity-100" leaveTo="opacity-0">
          <div className="fixed inset-0 bg-black/30" />
        </Transition.Child>
        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4">
            <Transition.Child as={Fragment} enter="ease-out duration-200" enterFrom="opacity-0 scale-95" enterTo="opacity-100 scale-100" leave="ease-in duration-150" leaveFrom="opacity-100 scale-100" leaveTo="opacity-0 scale-95">
              <Dialog.Panel className="w-full max-w-lg transform overflow-hidden rounded-xl bg-white shadow-xl">
                <div className="flex items-center justify-between border-b px-4 py-3">
                  <Dialog.Title className="text-lg font-semibold">
                    Restrictions de visibilite - {projet?.nom}
                  </Dialog.Title>
                  <button onClick={onFermer} className="p-1 rounded hover:bg-gray-100">
                    <XMarkIcon className="w-5 h-5 text-gray-500" />
                  </button>
                </div>

                <div className="px-4 py-3 border-b bg-gray-50">
                  <h4 className="text-sm font-medium text-gray-700 mb-3">Masquer une activite</h4>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs text-gray-500 mb-1">Utilisateur</label>
                      <select
                        value={selectedUserId}
                        onChange={(e) => setSelectedUserId(e.target.value)}
                        className="w-full px-3 py-2 border rounded-lg text-sm"
                      >
                        <option value="">Selectionner...</option>
                        {utilisateurs.map((u) => (
                          <option key={u.id} value={u.id}>
                            {u.nomComplet}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs text-gray-500 mb-1">Activite</label>
                      <select
                        value={selectedActivityId}
                        onChange={(e) => setSelectedActivityId(e.target.value)}
                        className="w-full px-3 py-2 border rounded-lg text-sm"
                      >
                        <option value="">Selectionner...</option>
                        {activitesFeuilles.map((a) => (
                          <option key={a.id} value={a.id}>
                            {a.nom}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                  <button
                    onClick={handleAjouterRestriction}
                    disabled={!selectedUserId || !selectedActivityId || loading}
                    className="mt-3 w-full px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Masquer cette activite pour cet utilisateur
                  </button>
                </div>

                <div className="px-4 py-3">
                  <h4 className="text-sm font-medium text-gray-700 mb-2">
                    Restrictions actives ({restrictions.length})
                  </h4>
                  {loadingRestrictions ? (
                    <p className="text-sm text-gray-500 py-4 text-center">Chargement...</p>
                  ) : restrictions.length === 0 ? (
                    <p className="text-sm text-gray-500 py-4 text-center">
                      Aucune restriction. Toutes les activites sont visibles pour tous les utilisateurs.
                    </p>
                  ) : (
                    <div className="max-h-64 overflow-y-auto space-y-2">
                      {restrictions.map((restriction) => (
                        <div
                          key={restriction.id}
                          className="flex items-center justify-between bg-orange-50 rounded-lg px-3 py-2"
                        >
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <EyeSlashIcon className="w-4 h-4 text-orange-600 flex-shrink-0" />
                              <span className="text-sm font-medium text-gray-900 truncate">
                                {restriction.activite.nom}
                              </span>
                            </div>
                            <p className="text-xs text-gray-500 ml-6">
                              Masquee pour {restriction.utilisateur.nomComplet}
                            </p>
                          </div>
                          <button
                            onClick={() => handleSupprimerRestriction(restriction)}
                            disabled={loading}
                            className="text-xs text-red-600 hover:text-red-800 font-medium disabled:opacity-50 ml-2"
                          >
                            Supprimer
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
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
