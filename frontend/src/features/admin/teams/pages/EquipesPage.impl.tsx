// Page de gestion des equipes (Admin)

import { useState, useEffect, Fragment } from 'react';
import { useQuery, useMutation } from '@apollo/client/react';
import { Dialog, Transition } from '@headlessui/react';
import {
  PlusIcon,
  PencilSquareIcon,
  TrashIcon,
  XMarkIcon,
  UsersIcon,
} from '@heroicons/react/24/outline';
import {
  TEAMS_FULL_QUERY,
  CREATE_TEAM,
  UPDATE_TEAM,
  DELETE_TEAM,
} from '../../../../graphql/operations/teams';
import NavAdmin from '../../../../components/admin/NavAdmin';

interface Membre {
  id: string;
  nomComplet: string;
}

interface Equipe {
  id: string;
  nom: string;
  code: string;
  description?: string;
  estActif: boolean;
  membres: Membre[];
  createdAt: string;
}

interface EquipeFormData {
  id?: string;
  nom: string;
  code: string;
  description: string;
  estActif: boolean;
}

// Composant Formulaire
function FormulaireEquipe({
  ouvert,
  onFermer,
  onSuccess,
  equipe,
}: {
  ouvert: boolean;
  onFermer: () => void;
  onSuccess: () => void;
  equipe: Equipe | null;
}) {
  const estEdition = !!equipe?.id;

  const [formData, setFormData] = useState<EquipeFormData>({
    nom: '',
    code: '',
    description: '',
    estActif: true,
  });
  const [erreur, setErreur] = useState('');

  const [createTeam, { loading: creationEnCours }] = useMutation(CREATE_TEAM);
  const [updateTeam, { loading: modificationEnCours }] = useMutation(UPDATE_TEAM);

  const enCours = creationEnCours || modificationEnCours;

  useEffect(() => {
    if (ouvert && equipe) {
      // Le formulaire historique se rehydrate depuis la prop `equipe` a l'ouverture.
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setFormData({
        id: equipe.id,
        nom: equipe.nom,
        code: equipe.code,
        description: equipe.description || '',
        estActif: equipe.estActif,
      });
    } else if (ouvert) {
      setFormData({ nom: '', code: '', description: '', estActif: true });
    }
    setErreur('');
  }, [ouvert, equipe]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    const checked = (e.target as HTMLInputElement).checked;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErreur('');

    if (!formData.nom.trim() || !formData.code.trim()) {
      setErreur('Le nom et le code sont obligatoires');
      return;
    }

    try {
      if (estEdition) {
        await updateTeam({
          variables: {
            id: formData.id,
            input: {
              nom: formData.nom.trim(),
              code: formData.code.trim().toUpperCase(),
              description: formData.description.trim() || null,
              estActif: formData.estActif,
            },
          },
        });
      } else {
        await createTeam({
          variables: {
            input: {
              nom: formData.nom.trim(),
              code: formData.code.trim().toUpperCase(),
              description: formData.description.trim() || null,
              estActif: formData.estActif,
            },
          },
        });
      }
      onSuccess();
      onFermer();
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Erreur inconnue';
      setErreur(message);
    }
  };

  return (
    <Transition appear show={ouvert} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={onFermer}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-200"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-150"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black/30" />
        </Transition.Child>

        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-200"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-150"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-xl bg-white shadow-xl transition-all">
                <div className="flex items-center justify-between border-b px-4 py-3">
                  <Dialog.Title className="text-lg font-semibold text-gray-900">
                    {estEdition ? 'Modifier l\'equipe' : 'Nouvelle equipe'}
                  </Dialog.Title>
                  <button onClick={onFermer} className="p-1 rounded hover:bg-gray-100">
                    <XMarkIcon className="w-5 h-5 text-gray-500" />
                  </button>
                </div>

                <form onSubmit={handleSubmit} className="p-4 space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Nom *</label>
                    <input
                      type="text"
                      name="nom"
                      value={formData.nom}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Code *</label>
                    <input
                      type="text"
                      name="code"
                      value={formData.code}
                      onChange={handleChange}
                      placeholder="Ex: DEV, RH, COMPTA"
                      className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 uppercase"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                    <textarea
                      name="description"
                      value={formData.description}
                      onChange={handleChange}
                      rows={3}
                      className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  {estEdition && (
                    <div>
                      <label className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          name="estActif"
                          checked={formData.estActif}
                          onChange={handleChange}
                          className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        />
                        <span className="text-sm text-gray-700">Equipe active</span>
                      </label>
                    </div>
                  )}

                  {erreur && (
                    <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
                      {erreur}
                    </div>
                  )}

                  <div className="flex justify-end gap-3 pt-4 border-t">
                    <button
                      type="button"
                      onClick={onFermer}
                      className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border rounded-lg hover:bg-gray-50"
                      disabled={enCours}
                    >
                      Annuler
                    </button>
                    <button
                      type="submit"
                      disabled={enCours}
                      className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50"
                    >
                      {enCours ? 'Enregistrement...' : estEdition ? 'Modifier' : 'Creer'}
                    </button>
                  </div>
                </form>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
}

// Page principale
export default function EquipesPage() {
  const [filtreActif, setFiltreActif] = useState(true);
  const [modaleOuverte, setModaleOuverte] = useState(false);
  const [equipeEditee, setEquipeEditee] = useState<Equipe | null>(null);
  const [confirmationSuppression, setConfirmationSuppression] = useState<Equipe | null>(null);
  const [erreurSuppression, setErreurSuppression] = useState('');

  const { data, loading, refetch } = useQuery<{ equipes: Equipe[] }>(TEAMS_FULL_QUERY, {
    variables: { actifSeulement: filtreActif || undefined },
    fetchPolicy: 'cache-and-network',
  });

  const [deleteTeam, { loading: suppressionEnCours }] = useMutation(DELETE_TEAM);

  const equipes = data?.equipes || [];

  const ouvrirCreation = () => {
    setEquipeEditee(null);
    setModaleOuverte(true);
  };

  const ouvrirEdition = (equipe: Equipe) => {
    setEquipeEditee(equipe);
    setModaleOuverte(true);
  };

  const confirmerSuppression = async () => {
    if (!confirmationSuppression) return;
    try {
      await deleteTeam({ variables: { id: confirmationSuppression.id } });
      setConfirmationSuppression(null);
      setErreurSuppression('');
      refetch();
    } catch (err) {
      setErreurSuppression(err instanceof Error ? err.message : 'Erreur lors de la suppression.');
    }
  };

  return (
    <div className="space-y-4">
      <NavAdmin />

      {/* En-tete */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Equipes</h1>
          <p className="text-sm text-gray-500">{equipes.length} equipe{equipes.length > 1 ? 's' : ''}</p>
        </div>
        <button
          onClick={ouvrirCreation}
          className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700"
        >
          <PlusIcon className="w-4 h-4" />
          Nouvelle equipe
        </button>
      </div>

      {/* Filtre */}
      <div className="bg-white rounded-lg shadow-sm p-4">
        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={filtreActif}
            onChange={(e) => setFiltreActif(e.target.checked)}
            className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
          />
          <span className="text-sm text-gray-700">Afficher uniquement les equipes actives</span>
        </label>
      </div>

      {/* Liste */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {loading && equipes.length === 0 ? (
          <div className="col-span-full p-8 text-center text-gray-500">Chargement...</div>
        ) : equipes.length === 0 ? (
          <div className="col-span-full p-8 text-center text-gray-500">Aucune equipe trouvee</div>
        ) : (
          equipes.map((equipe) => (
            <div
              key={equipe.id}
              className={`bg-white rounded-lg shadow-sm p-4 ${!equipe.estActif ? 'opacity-50' : ''}`}
            >
              <div className="flex items-start justify-between mb-2">
                <div>
                  <span className="inline-flex items-center px-2 py-0.5 text-xs font-medium rounded bg-blue-100 text-blue-700 mb-1">
                    {equipe.code}
                  </span>
                  <h3 className="font-semibold text-gray-900">{equipe.nom}</h3>
                </div>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => ouvrirEdition(equipe)}
                    className="p-1.5 text-gray-400 hover:text-blue-600 rounded hover:bg-blue-50"
                    title="Modifier"
                  >
                    <PencilSquareIcon className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setConfirmationSuppression(equipe)}
                    className="p-1.5 text-gray-400 hover:text-red-600 rounded hover:bg-red-50"
                    title="Supprimer"
                  >
                    <TrashIcon className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {equipe.description && (
                <p className="text-sm text-gray-600 mb-3">{equipe.description}</p>
              )}

              <div className="flex items-center gap-1 text-xs text-gray-500">
                <UsersIcon className="w-4 h-4" />
                <span>{equipe.membres.length} membre{equipe.membres.length > 1 ? 's' : ''}</span>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Modal formulaire */}
      <FormulaireEquipe
        ouvert={modaleOuverte}
        onFermer={() => setModaleOuverte(false)}
        onSuccess={() => refetch()}
        equipe={equipeEditee}
      />

      {/* Modal confirmation suppression */}
      {confirmationSuppression && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30">
          <div className="bg-white rounded-xl shadow-xl p-6 max-w-sm w-full mx-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Confirmer la suppression</h3>
            <p className="text-sm text-gray-600 mb-4">
              Voulez-vous vraiment supprimer l'equipe <strong>{confirmationSuppression.nom}</strong> ?
              {confirmationSuppression.membres.length > 0 && (
                <span className="block mt-2 text-orange-600">
                  Attention : cette equipe a {confirmationSuppression.membres.length} membre(s).
                </span>
              )}
            </p>
            {erreurSuppression && (
              <p className="text-sm text-red-600 mb-3">{erreurSuppression}</p>
            )}
            <div className="flex justify-end gap-3">
              <button
                onClick={() => { setConfirmationSuppression(null); setErreurSuppression(''); }}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border rounded-lg hover:bg-gray-50"
                disabled={suppressionEnCours}
              >
                Annuler
              </button>
              <button
                onClick={confirmerSuppression}
                disabled={suppressionEnCours}
                className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 disabled:opacity-50"
              >
                {suppressionEnCours ? 'Suppression...' : 'Supprimer'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
